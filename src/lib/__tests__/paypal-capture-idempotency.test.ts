/**
 * paypal-capture-idempotency.test.ts — W0-3 (S-01) / migration 0098
 * (owner order 2026-10-02 · §7 pre-approval = the audit plan §6.4 the
 * order cites): the ATOMIC PayPal capture idempotency laws, pinned.
 *
 * Two layers, same file:
 *
 *   A. SOURCE PINS — the SQL actually implements the §6.4 design:
 *      the claim column + BOTH partial unique indexes, the
 *      claim-BEFORE-extend order inside capture_paypal_subscription,
 *      the service_role door, the 23505 race resolution in
 *      coach_adjust_wallet (constraint-name-scoped), and the types.ts
 *      mirror (column + RPC signature).
 *
 *   B. ROUTE BEHAVIOR — POST /api/paypal/capture-order against an
 *      in-memory DB mock that enforces the 0098 contract exactly as
 *      the SQL does (unique index = Set claim; extension failure =
 *      claim rolled back). The four canaries of the plan:
 *        1. sequential replay  → 200 idempotent (no re-extension,
 *           no duplicate notifications)
 *        2. concurrent replay  → loser 23505 → 200 idempotent (ONE
 *           extension, ONE notification set)
 *        3. extension failure  → the lock comes back (no claim row,
 *           no extension) — a retry starts CLEAN
 *        4. wallet ref_id under concurrency → exactly ONE credit
 *           (the loser gets the live balance, 200, not a double pay)
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth-server", () => ({
  // logged-in buyer by default
  requireUser: vi.fn(async () => ({ id: "u-1", email: "buyer@example.com" })),
}));
vi.mock("@/lib/paypal", () => ({
  capturePayPalOrder: vi.fn(),
  isPaypalConfigured: true,
  // deterministic ref id (the real one is a UUID5 of the order id)
  payPalOrderRefUuid: (orderId: string) => `ref-${orderId}`,
  resolvePlanPrice: vi.fn(() => 20),
}));
vi.mock("@/lib/supabase/admin", () => ({
  isSupabaseAdminConfigured: true,
  supabaseAdmin: { rpc: vi.fn(), from: vi.fn() },
}));
vi.mock("@/lib/affiliate-engine-server", () => ({
  processSubscriptionInitialPaymentServer: vi.fn(async () => null),
}));

import { POST as captureRoute } from "@/app/api/paypal/capture-order/route";
import { capturePayPalOrder } from "@/lib/paypal";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { processSubscriptionInitialPaymentServer } from "@/lib/affiliate-engine-server";

const read = (rel: string): string =>
  readFileSync(join(process.cwd(), rel), "utf8");

const MIG = "supabase/migrations/20261002120000_0098_paypal_capture_idempotency.sql";

// ══════════════════════════════════════════════════════════════════════
// A. SOURCE PINS — the SQL law (0098)
// ══════════════════════════════════════════════════════════════════════
describe("0098 migration source pins (§6.4 design verbatim)", () => {
  const sql = read(MIG);

  it("adds the claim column + the PARTIAL unique claim lock", () => {
    expect(sql).toContain("add column if not exists paypal_order_id text");
    expect(sql).toContain(
      "create unique index if not exists uq_subscription_requests_paypal_order",
    );
    expect(sql).toContain("where paypal_order_id is not null");
  });

  it("adds the wallet top-up race lock (topups only — admins/activations excluded)", () => {
    expect(sql).toContain(
      "create unique index if not exists uq_coach_wtxn_topup_ref",
    );
    expect(sql).toContain("where ref_id is not null and kind = 'topup'");
  });

  it("capture_paypal_subscription: security definer + pinned search_path (0042 pattern)", () => {
    expect(sql).toMatch(/create or replace function public\.capture_paypal_subscription\(/);
    expect(sql).toContain("security definer");
    expect(sql).toContain("set search_path = public");
    expect(sql).toContain("capture_paypal_subscription: service role only");
  });

  it("CLAIMS BEFORE it extends — the insert is the lock, 23505 is a success", () => {
    const claimPos = sql.indexOf("insert into public.subscription_requests");
    const extendPos = sql.indexOf("v_row := public.extend_subscription(");
    expect(claimPos).toBeGreaterThan(-1);
    expect(extendPos).toBeGreaterThan(claimPos);
    expect(sql).toContain("exception when unique_violation then");
    expect(sql).toContain("'already_processed', true");
  });

  it("coach_adjust_wallet resolves the race scoped to the topup lock only", () => {
    expect(sql).toContain("get stacked diagnostics v_constraint = CONSTRAINT_NAME");
    expect(sql).toContain("is distinct from 'uq_coach_wtxn_topup_ref'");
    // any OTHER unique violation is re-raised honestly:
    expect(sql).toContain("raise;");
  });

  it("types.ts mirrors the column + the RPC signature", () => {
    const ts = read("src/lib/supabase/types.ts");
    expect(ts).toContain("paypal_order_id: string | null;");
    expect(ts).toContain("capture_paypal_subscription: {");
    expect(ts).toContain("p_plan_tier?: string;");
  });

  it("the route rides ONE atomic RPC — the two separate calls are gone", () => {
    const route = read("src/app/api/paypal/capture-order/route.ts");
    expect(route).toContain('rpc("capture_paypal_subscription"');
    expect(route).not.toContain("serverUpsertSubscription");
    expect(route).not.toContain("serverCreatePayPalPaymentRecord");
    // the extension RPC is NOT called directly by the route anymore:
    expect(route).not.toContain('rpc("extend_subscription"');
  });
});

// ══════════════════════════════════════════════════════════════════════
// B. ROUTE BEHAVIOR — the four canaries of the plan
// ══════════════════════════════════════════════════════════════════════

type DbState = {
  claimedOrders: Set<string>;        // uq_subscription_requests_paypal_order
  successfulExtends: number;
  failNextExtend: boolean;           // extension failure → rollback semantics
  walletCredits: Set<string>;        // uq_coach_wtxn_topup_ref
  walletBalance: number;
  quickCheckFindsTopup: boolean;     // the route's read-then-act check
  notifications: number;
  adminNotifications: number;
  topupHistoryRows: number;
};

const db: DbState = {
  claimedOrders: new Set(),
  successfulExtends: 0,
  failNextExtend: false,
  walletCredits: new Set(),
  walletBalance: 0,
  quickCheckFindsTopup: false,
  notifications: 0,
  adminNotifications: 0,
  topupHistoryRows: 0,
};

const resetDb = () => {
  db.claimedOrders.clear();
  db.successfulExtends = 0;
  db.failNextExtend = false;
  db.walletCredits.clear();
  db.walletBalance = 0;
  db.quickCheckFindsTopup = false;
  db.notifications = 0;
  db.adminNotifications = 0;
  db.topupHistoryRows = 0;
};

/** Build the supabaseAdmin mock with the 0098 contract encoded:
 * rpc() enforces the unique indexes (Sets) and the transactional
 * rollback (a failed extension releases its claim); from() serves
 * the route's read/notification chains. */
const installDb = () => {
  const client = supabaseAdmin as unknown as {
    rpc: ReturnType<typeof vi.fn>;
    from: ReturnType<typeof vi.fn>;
  };

  client.rpc.mockImplementation(async (fn: string, args: Record<string, unknown>) => {
    if (fn === "capture_paypal_subscription") {
      const orderId = args.p_order_id as string;
      // CLAIM FIRST — the insert is the atomic lock (23505 → success)
      if (db.claimedOrders.has(orderId)) {
        return { data: { already_processed: true }, error: null };
      }
      db.claimedOrders.add(orderId);
      if (db.failNextExtend) {
        // 0098: one transaction — the failed extension rolls the
        // claim back (no row, no extension, retry starts clean)
        db.failNextExtend = false;
        db.claimedOrders.delete(orderId);
        return {
          data: null,
          error: { message: "extend_subscription failed: boom", code: "P0001" },
        };
      }
      db.successfulExtends += 1;
      return {
        data: {
          already_processed: false,
          subscription: { id: "s-1", tier: args.p_tier },
        },
        error: null,
      };
    }
    if (fn === "coach_adjust_wallet") {
      // 0098: the ledger insert claims first; a duplicate topup ref
      // returns the LIVE balance without crediting (race resolved)
      if (args.p_kind === "topup" && args.p_ref_id) {
        if (db.walletCredits.has(args.p_ref_id as string)) {
          return { data: db.walletBalance, error: null };
        }
        db.walletCredits.add(args.p_ref_id as string);
      }
      db.walletBalance += args.p_amount as number;
      return { data: db.walletBalance, error: null };
    }
    return { data: null, error: null };
  });

  const insert = (count: (n: number) => void) => ({
    insert: async () => {
      count(1);
      return { error: null };
    },
  });
  client.from.mockImplementation((table: string) => {
    switch (table) {
      case "coach_wallet_transactions": // the quick check (read-then-act)
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () =>
                  db.quickCheckFindsTopup
                    ? { data: { id: "w-1" }, error: null }
                    : { data: null, error: null },
              }),
            }),
          }),
        };
      case "coach_assignments":
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
            }),
          }),
        };
      case "profiles":
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => ({
                  maybeSingle: async () => ({
                    data: { id: "admin-1" },
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        };
      case "notifications":
        return insert(() => (db.notifications += 1));
      case "admin_notifications":
        return insert(() => (db.adminNotifications += 1));
      case "coach_topup_requests":
        return insert(() => (db.topupHistoryRows += 1));
      default:
        return insert(() => {});
    }
  });
};

const req = (body: unknown) =>
  new NextRequest("http://localhost/api/paypal/capture-order", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

/** A COMPLETED capture result for the given order context. */
const captureResult = (customId: string, value: string) => ({
  id: "ORD-1",
  status: "COMPLETED",
  amount: { currency: "USD", value },
  customId,
});

beforeEach(() => {
  vi.clearAllMocks();
  resetDb();
  installDb();
  (capturePayPalOrder as ReturnType<typeof vi.fn>).mockResolvedValue(
    captureResult(
      JSON.stringify({ user_id: "u-1", plan_tier: "starter", duration_months: 1 }),
      "20",
    ),
  );
});

describe("canary 1 — sequential replay = 200 idempotent (subscription arm)", () => {
  it("re-capturing the same order NEVER re-extends and never duplicates bells", async () => {
    const first = await captureRoute(req({ orderId: "ORD-1" }));
    expect(first.status).toBe(200);
    expect(await first.json()).toMatchObject({
      success: true,
      status: "COMPLETED",
      subscription: "activated",
    });
    expect(db.successfulExtends).toBe(1);
    expect(db.notifications).toBe(1); // user bell
    expect(db.adminNotifications).toBe(1); // admin bell
    expect(processSubscriptionInitialPaymentServer).toHaveBeenCalledTimes(1);

    // THE REPLAY (PayPal 422 path resolves to the same COMPLETED result):
    const replay = await captureRoute(req({ orderId: "ORD-1" }));
    expect(replay.status).toBe(200);
    const json = await replay.json();
    // same success shape — the client cannot tell a replay apart:
    expect(json).toMatchObject({
      success: true,
      status: "COMPLETED",
      subscription: "activated",
      orderId: "ORD-1",
      plan: "starter",
      durationMonths: 1,
    });
    // ...but the DB side effects happened exactly ONCE:
    expect(db.successfulExtends).toBe(1);
    expect(db.notifications).toBe(1);
    expect(db.adminNotifications).toBe(1);
    expect(processSubscriptionInitialPaymentServer).toHaveBeenCalledTimes(1);
  });

  it("calls the ONE atomic RPC with tier fidelity (0045/0046)", async () => {
    await captureRoute(req({ orderId: "ORD-1" }));
    const rpc = (supabaseAdmin as unknown as { rpc: ReturnType<typeof vi.fn> }).rpc;
    const args = rpc.mock.calls.find(
      ([fn]) => fn === "capture_paypal_subscription",
    )?.[1] as Record<string, unknown>;
    // p_tier = canonical (0045 guard) · p_plan_tier = original product
    expect(args.p_tier).toBe("premium");
    expect(args.p_plan_tier).toBe("starter");
    expect(args.p_order_id).toBe("ORD-1");
  });
});

describe("canary 2 — concurrent replay = the loser's 23505 → 200 idempotent", () => {
  it("two PARALLEL captures of the same order: one extension, one bell set", async () => {
    const [a, b] = await Promise.all([
      captureRoute(req({ orderId: "ORD-1" })),
      captureRoute(req({ orderId: "ORD-1" })),
    ]);
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(await a.json()).toMatchObject({ success: true, subscription: "activated" });
    expect(await b.json()).toMatchObject({ success: true, subscription: "activated" });
    // the unique index let exactly ONE claim through:
    expect(db.successfulExtends).toBe(1);
    expect(db.notifications).toBe(1);
    expect(db.adminNotifications).toBe(1);
  });
});

describe("canary 3 — extension failure returns the lock (no row, no extension)", () => {
  it("a failed extension 500s honestly AND the retry starts CLEAN", async () => {
    db.failNextExtend = true;
    const failed = await captureRoute(req({ orderId: "ORD-1" }));
    expect(failed.status).toBe(500);
    const json = await failed.json();
    expect(json.error).toContain("subscription activation failed");
    expect(json.orderId).toBe("ORD-1");
    expect(db.successfulExtends).toBe(0);
    expect(db.claimedOrders.has("ORD-1")).toBe(false); // rolled back

    // the retry (same order): fresh capture — the claim was returned
    // with the transaction, no poisoned state:
    const retry = await captureRoute(req({ orderId: "ORD-1" }));
    expect(retry.status).toBe(200);
    expect(await retry.json()).toMatchObject({
      success: true,
      subscription: "activated",
    });
    expect(db.successfulExtends).toBe(1);
    expect(db.notifications).toBe(1);
  });
});

describe("canary 4 — wallet ref_id under concurrency (exactly ONE credit)", () => {
  beforeEach(() => {
    (capturePayPalOrder as ReturnType<typeof vi.fn>).mockResolvedValue(
      captureResult(
        JSON.stringify({ purpose: "wallet_topup", user_id: "u-1", usd_amount: 100 }),
        "100",
      ),
    );
  });

  it("sequential replay dies at the quick check (200 already_credited)", async () => {
    db.quickCheckFindsTopup = true;
    const res = await captureRoute(req({ orderId: "ORD-1" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      success: true,
      wallet: "already_credited",
    });
    const rpc = (supabaseAdmin as unknown as { rpc: ReturnType<typeof vi.fn> }).rpc;
    expect(
      rpc.mock.calls.filter(([fn]) => fn === "coach_adjust_wallet"),
    ).toHaveLength(0);
  });

  it("two PARALLEL top-ups that both pass the quick check: $100 once, not $200", async () => {
    // both quick checks ran before either credit committed (the
    // read-then-act window the audit proved open):
    const [a, b] = await Promise.all([
      captureRoute(req({ orderId: "ORD-1" })),
      captureRoute(req({ orderId: "ORD-1" })),
    ]);
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(await a.json()).toMatchObject({ success: true, wallet: "credited", balance: 100 });
    expect(await b.json()).toMatchObject({ success: true, wallet: "credited", balance: 100 });
    // uq_coach_wtxn_topup_ref let exactly ONE credit through —
    // the loser got the LIVE balance (100), never a second +100:
    expect(db.walletBalance).toBe(100);
  });
});
