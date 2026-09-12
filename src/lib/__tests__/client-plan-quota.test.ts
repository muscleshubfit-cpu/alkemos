import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  countUnifiedPlanUsage,
  checkUnifiedPlanQuota,
  recordUnifiedPlanUsage,
  hashGuestKey,
  monthStartUtc,
} from "@/lib/tier-limits";

/**
 * PHASE 183 (owner decree 2026-09-13 «البوول الموحد» — spec "Alkemos —
 * Membership & Plan Changes"): ONE monthly pool per identity for
 * nutrition + workout generations COMBINED — free 2 · premium 4 ·
 * pro 8 · coaching 8 — counted SUCCESS-ONLY from the ai_plan_usage
 * ledger (migration 0085): a row exists only after a plan was actually
 * generated and validated.
 *
 * Guests (no account) get the FREE pool keyed by a server-side salted
 * hash of the client's guest id — no signup wall. Staff bypass.
 *
 * These tests mock the service-role client: fixed ai_plan_usage counts
 * per identity, subscriptions rows for the DB-tier fallback, and an
 * insert spy capturing exactly what recordUnifiedPlanUsage writes.
 */

const h = vi.hoisted(() => {
  // count returned per (table, identity key)
  const counts: Record<string, number> = {};
  // subscriptions rows for the fallback tier lookup
  const subTiers: string[] = [];
  // captured inserts per table
  const inserts: Array<{ table: string; row: Record<string, unknown> }> = [];
  return { counts, subTiers, inserts };
});

type CountRow = { count: number | null; error: unknown };
interface FakeBuilder extends PromiseLike<CountRow> {
  select: () => FakeBuilder;
  eq: (col: string, val: unknown) => FakeBuilder;
  gt: () => FakeBuilder;
  gte: (col: string, since: string) => FakeBuilder;
  limit: () => FakeBuilder;
  maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
  single: () => Promise<{ data: unknown; error: unknown }>;
}

vi.mock("@/lib/supabase/admin", () => {
  const makeBuilder = (table: string): FakeBuilder => {
    let identity = "";
    const outcome = (): Promise<CountRow> => {
      if (table === "subscriptions") {
        return Promise.resolve({
          count: null,
          error: null,
          data: h.subTiers.map((tier) => ({ tier })),
        } as unknown as CountRow);
      }
      return Promise.resolve({
        count: h.counts[`${table}:${identity}`] ?? 0,
        error: null,
      });
    };
    const builder: FakeBuilder = {
      select: () => builder,
      eq: (col: string, val: unknown) => {
        if (col === "user_id" || col === "guest_key" || col === "client_id") {
          identity = String(val);
        }
        return builder;
      },
      gt: () => builder,
      // The unified pool is monthly-only — every gte here is the month
      // window; kept in the signature for parity with the real builder.
      gte: (_col: string, _since: string) => builder,
      limit: () => builder,
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      single: () => Promise.resolve({ data: null, error: null }),
      then: (onfulfilled, onrejected) => outcome().then(onfulfilled, onrejected),
    };
    return builder;
  };
  return {
    isSupabaseAdminConfigured: true,
    supabaseAdmin: {
      from: (table: string) => {
        const b = makeBuilder(table);
        if (table === "ai_plan_usage") {
          // capture inserts (recordUnifiedPlanUsage)
          return {
            ...b,
            insert: (row: Record<string, unknown>) => ({
              then: (onfulfilled: unknown, onrejected: unknown) => {
                h.inserts.push({ table, row });
                return Promise.resolve({ error: null }).then(
                  onfulfilled as never,
                  onrejected as never,
                );
              },
            }),
          };
        }
        return b;
      },
    },
  };
});

const USER = "11111111-1111-1111-1111-111111111111";

describe("unified AI plan pool (Phase 183 — «البوول الموحد»)", () => {
  beforeEach(() => {
    for (const k of Object.keys(h.counts)) delete h.counts[k];
    h.subTiers.length = 0;
    h.inserts.length = 0;
  });

  it("countUnifiedPlanUsage reads only the success ledger, per identity", async () => {
    h.counts[`ai_plan_usage:${USER}`] = 3;
    expect(await countUnifiedPlanUsage({ userId: USER })).toBe(3);
    expect(await countUnifiedPlanUsage({ guestKey: "abc" })).toBe(0);
    h.counts["ai_plan_usage:abc"] = 2;
    expect(await countUnifiedPlanUsage({ guestKey: "abc" })).toBe(2);
    expect(await countUnifiedPlanUsage({})).toBe(0); // no identity → 0
  });

  it("member pool: premium 4 — 2 used → allowed, remaining 2", async () => {
    h.counts[`ai_plan_usage:${USER}`] = 2;
    const r = await checkUnifiedPlanQuota({ userId: USER, tierHint: "premium" });
    expect(r.allowed).toBe(true);
    expect(r.tier).toBe("premium");
    expect(r.limit).toBe(4);
    expect(r.remaining).toBe(2);
  });

  it("member pool blocks at the tier limit (pro 8, combined kinds)", async () => {
    h.counts[`ai_plan_usage:${USER}`] = 8; // e.g. 5 nutrition + 3 workout
    const r = await checkUnifiedPlanQuota({ userId: USER, tierHint: "pro" });
    expect(r.allowed).toBe(false);
    expect(r.used).toBe(8);
    expect(r.limit).toBe(8);
    expect(r.remaining).toBe(0);
  });

  it("guest pool: free numbers (2/month), no signup wall", async () => {
    h.counts["ai_plan_usage:guestkey-1"] = 1;
    const r = await checkUnifiedPlanQuota({ guestKey: "guestkey-1" });
    expect(r.allowed).toBe(true);
    expect(r.tier).toBe("guest");
    expect(r.limit).toBe(2);
    expect(r.remaining).toBe(1);
  });

  it("guest pool blocks after 2 successes", async () => {
    h.counts["ai_plan_usage:guestkey-1"] = 2;
    const r = await checkUnifiedPlanQuota({ guestKey: "guestkey-1" });
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it("unknown identity degrades to a fresh guest (full free pool)", async () => {
    const r = await checkUnifiedPlanQuota({});
    expect(r.allowed).toBe(true);
    expect(r.tier).toBe("guest");
    expect(r.limit).toBe(2);
  });

  it("DB-tier fallback: no active subscription → free pool (2)", async () => {
    h.subTiers.length = 0;
    h.counts[`ai_plan_usage:${USER}`] = 1;
    const r = await checkUnifiedPlanQuota({ userId: USER });
    expect(r.tier).toBe("free");
    expect(r.limit).toBe(2);
    expect(r.allowed).toBe(true); // 1/2
  });

  it("DB-tier fallback picks the highest active tier (pro)", async () => {
    h.subTiers.push("premium", "pro");
    const r = await checkUnifiedPlanQuota({ userId: USER });
    expect(r.tier).toBe("pro");
    expect(r.limit).toBe(8);
  });

  it("staff bypass: unlimited, no ledger read", async () => {
    h.counts[`ai_plan_usage:${USER}`] = 99;
    const r = await checkUnifiedPlanQuota({
      userId: USER,
      tierHint: "free",
      staffHint: true,
    });
    expect(r.allowed).toBe(true);
    expect(r.unlimited).toBe(true);
  });

  it("recordUnifiedPlanUsage writes ONE success row with the right identity", async () => {
    await recordUnifiedPlanUsage({
      userId: USER,
      kind: "nutrition",
      surface: "planner",
    });
    await recordUnifiedPlanUsage({
      guestKey: "guestkey-1",
      kind: "workout",
      surface: "evo",
    });
    expect(h.inserts).toHaveLength(2);
    expect(h.inserts[0].row).toMatchObject({
      user_id: USER,
      guest_key: null,
      kind: "nutrition",
      surface: "planner",
    });
    expect(h.inserts[1].row).toMatchObject({
      user_id: null,
      guest_key: "guestkey-1",
      kind: "workout",
      surface: "evo",
    });
  });

  it("recordUnifiedPlanUsage: no identity → no row (fail-safe)", async () => {
    await recordUnifiedPlanUsage({ kind: "nutrition" });
    expect(h.inserts).toHaveLength(0);
  });

  it("hashGuestKey is stable, salted, and never stores the raw id", () => {
    const k1 = hashGuestKey("guest-uuid-1");
    const k2 = hashGuestKey("guest-uuid-1");
    const k3 = hashGuestKey("guest-uuid-2");
    expect(k1).toBe(k2); // stable for the same id
    expect(k1).not.toBe(k3); // different ids → different keys
    expect(k1).not.toContain("guest-uuid-1"); // raw id never appears
    expect(k1).toHaveLength(32); // sha256 hex slice
  });

  it("month window resets on the 1st, UTC", () => {
    const m = monthStartUtc();
    const d = new Date(m);
    expect(d.getUTCDate()).toBe(1);
    expect(d.getUTCHours()).toBe(0);
  });
});
