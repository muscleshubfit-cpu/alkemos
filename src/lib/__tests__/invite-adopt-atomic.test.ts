/**
 * invite-adopt-atomic.test.ts — W1-2c (S-05) / Phase 332 (owner order
 * 2026-10-02 «اوافق على التنفيذ، ابدأ البند التالى» — executing the
 * approved remediation plan docs/
 * FULL-STACK-AUDIT-AND-REMEDIATION-PLAN-2026-10-02.md §6.2 row W1-2c,
 * the order IS the §7 pre-approval for this auth-flow change).
 *
 * The audit finding (S-05): the adoption path was a TOCTOU race —
 * getUserById → gate (invited_at set + last_sign_in_at null) →
 * updateUserById, three NON-ATOMIC steps. Two concurrent requests (or
 * an attacker who knows a pending invitee's email racing the real
 * invitee) BOTH passed the gate and BOTH wrote a password — the last
 * writer silently owned the account and the loser's {ok:true} was a
 * lie.
 *
 * The fix (the plan's primary direction, verbatim: «اعتماد ذري شرطي
 * (حارس على مستوى DB/توكن أحادي الاستهلاك)»): migration 0099 adds
 * profiles.invite_adopted_at (text, a per-call UUID token); the route
 * CLAIMS before writing — one conditional UPDATE
 * (.eq("id", …).is("invite_adopted_at", null)) where the row-lock
 * guarantees exactly ONE winner; the loser reads 0 rows and gets the
 * uniform {ok:false} WITHOUT ever writing a password. A write failure
 * releases the claim (token-keyed) so a retry starts clean.
 *
 * Two layers, same file:
 *
 *   A. SOURCE PINS — the migration column (idempotent, text), the
 *      route's claim BEFORE the password write, the token-keyed
 *      release on write failure, types.ts carrying the column, the
 *      INDEX.md row, and the gate-before-claim order.
 *
 *   B. ROUTE BEHAVIOR — the route against an in-memory profiles store
 *      whose conditional UPDATE honors the claim contract atomically
 *      (0 rows matched → nothing written, data:null):
 *        1. sequential replay  → 2nd call {ok:false}, NO 2nd write
 *        2. parallel race      → exactly ONE {ok:true}, ONE write,
 *                                the loser never calls updateUserById
 *        3. write failure       → 502 + claim RELEASED + a clean retry
 *        4. non-adoptable      → {ok:false}, the claim is NEVER minted
 *                                (the GoTrue gate runs first)
 *        5. unknown email      → {ok:false}, zero update calls
 *        6. success            → profile patch still applied
 */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(async () => ({
    allowed: true,
    remaining: 99,
    resetAt: Date.now() + 60_000,
  })),
  clientIp: vi.fn(() => "127.0.0.1"),
}));
vi.mock("@/lib/supabase/admin", () => ({
  isSupabaseAdminConfigured: true,
  supabaseAdmin: {
    from: vi.fn(),
    auth: {
      admin: {
        getUserById: vi.fn(),
        updateUserById: vi.fn(),
      },
    },
  },
}));

import { POST as completeInviteRoute } from "@/app/api/auth/complete-invite/route";
import { supabaseAdmin } from "@/lib/supabase/admin";

const read = (rel: string): string =>
  readFileSync(join(process.cwd(), rel), "utf8");

// ══════════════════════════════════════════════════════════════════════
// A. SOURCE PINS — the W1-2c law, verbatim from the plan's fix direction
// ══════════════════════════════════════════════════════════════════════
describe("W1-2c source pins (S-05 — atomic adoption claim)", () => {
  const ROUTE = "src/app/api/auth/complete-invite/route.ts";

  it("migration 0099 adds the claim column idempotently (text token)", () => {
    const mig = read(
      "supabase/migrations/20261002130000_0099_invite_adoption_atomic_claim.sql",
    );
    expect(mig).toContain(
      "add column if not exists invite_adopted_at text",
    );
    // timestamptz would reintroduce the same-millisecond release hazard
    expect(mig).not.toContain("invite_adopted_at timestamptz");
  });

  it("the route claims BEFORE the password write (order pin)", () => {
    const src = read(ROUTE);
    const claimAt = src.indexOf('.is("invite_adopted_at", null)');
    const writeAt = src.indexOf("updateUserById(profile.id, {");
    expect(claimAt).toBeGreaterThan(-1);
    expect(writeAt).toBeGreaterThan(claimAt); // claim FIRST, write second
  });

  it("the claim is conditional + single-consumption (the atomic guard)", () => {
    const src = read(ROUTE);
    expect(src).toContain('update({ invite_adopted_at: claimToken })');
    expect(src).toContain('is("invite_adopted_at", null)');
    // the token is a UUID, never a clock value (uniqueness = safe release)
    expect(src).toContain("crypto.randomUUID()");
    expect(src).not.toContain("new Date().toISOString()");
  });

  it("a write failure RELEASES the claim, keyed by the token (no poisoned state)", () => {
    const src = read(ROUTE);
    expect(src).toMatch(
      /update\(\{ invite_adopted_at: null \}\)[\s\S]*?eq\("invite_adopted_at", claimToken\)/,
    );
  });

  it("the GoTrue gate still runs BEFORE the claim (gate order preserved)", () => {
    const src = read(ROUTE);
    const gateAt = src.indexOf("isAdoptableInvitedUser(gtu)");
    const claimAt = src.indexOf('is("invite_adopted_at", null)');
    expect(gateAt).toBeGreaterThan(-1);
    expect(claimAt).toBeGreaterThan(gateAt);
  });

  it("types.ts carries the column (migration law §6)", () => {
    const types = read("src/lib/supabase/types.ts");
    expect(types).toContain("invite_adopted_at: string | null;");
  });

  it("INDEX.md registers 0099 (migration law §6)", () => {
    const index = read("supabase/migrations/INDEX.md");
    expect(index).toContain("0099_invite_adoption_atomic_claim.sql");
  });
});

// ══════════════════════════════════════════════════════════════════════
// B. ROUTE BEHAVIOR — the S-05 race canaries against a DB double whose
//    conditional UPDATE is the claim contract (0 rows → no write)
// ══════════════════════════════════════════════════════════════════════

type ProfileRow = {
  id: string;
  email: string;
  role: string;
  full_name?: string | null;
  phone?: string | null;
  invite_adopted_at: string | null;
};

const db = {
  profiles: [] as ProfileRow[],
  passwordWrites: [] as string[],
  updateCalls: 0,
  updateUserError: null as { message: string } | null,
  gtu: null as { invited_at?: string | null; last_sign_in_at?: string | null } | null,
};

const resetDb = () => {
  db.profiles = [];
  db.passwordWrites = [];
  db.updateCalls = 0;
  db.updateUserError = null;
  db.gtu = null;
};

/** Wire the supabaseAdmin mock. The UPDATE chain is the FAITHFUL claim
 *  contract: predicates accumulate (.eq/.is), the patch applies ONLY
 *  to the row matching ALL of them — 0 rows matched → data:null and
 *  NOTHING is written (Postgres conditional-UPDATE semantics; within
 *  this single-threaded double, atomicity is trivially modeled). */
const installDb = () => {
  const client = supabaseAdmin as unknown as {
    from: ReturnType<typeof vi.fn>;
    auth: {
      admin: {
        getUserById: ReturnType<typeof vi.fn>;
        updateUserById: ReturnType<typeof vi.fn>;
      };
    };
  };

  client.auth.admin.getUserById.mockImplementation(async () => ({
    data: { user: db.gtu },
    error: null,
  }));
  client.auth.admin.updateUserById.mockImplementation(
    async (_id: string, patch: { password?: string }) => {
      if (db.updateUserError) return { error: db.updateUserError };
      db.passwordWrites.push(patch.password ?? "");
      return { error: null };
    },
  );

  client.from.mockImplementation((table: string) => {
    if (table !== "profiles") {
      return { upsert: async () => ({ error: null }) };
    }
    type Cond = [string, unknown];
    const rows = () => db.profiles;
    const matches = (r: ProfileRow, conds: Cond[]) =>
      conds.every(
        ([c, v]) => (r as unknown as Record<string, unknown>)[c] === v,
      );
    const eqChain = (conds: Cond[]) => ({
      eq: (c: string, v: unknown) => eqChain([...conds, [c, v]]),
      maybeSingle: async () => ({
        data: rows().find((r) => matches(r, conds)) ?? null,
        error: null,
      }),
    });
    const updChain = (conds: Cond[], patch: Record<string, unknown>) => {
      const apply = () => {
        const row = rows().find((r) => matches(r, conds));
        if (row) Object.assign(row, patch);
        return { data: row ? [{ id: row.id }] : [], error: null };
      };
      return {
        eq: (c: string, v: unknown) => updChain([...conds, [c, v]], patch),
        is: (c: string, v: unknown) => updChain([...conds, [c, v]], patch),
        select: () => ({
          maybeSingle: async () => {
            const row = rows().find((r) => matches(r, conds));
            if (row) Object.assign(row, patch);
            return { data: row ? { id: row.id } : null, error: null };
          },
        }),
        // awaiting the bare chain (the release path) still applies it
        then: (
          onFulfilled: (v: unknown) => unknown,
          onRejected?: (e: unknown) => unknown,
        ) => Promise.resolve(apply()).then(onFulfilled, onRejected),
      };
    };
    return {
      select: () => eqChain([]),
      update: (patch: Record<string, unknown>) => {
        db.updateCalls += 1;
        return updChain([], patch);
      },
    };
  });
};

const req = (body: unknown) =>
  new NextRequest("http://localhost/api/auth/complete-invite", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

const seedAdoptable = (invite_adopted_at: string | null = null) => {
  db.profiles = [
    {
      id: "p-1",
      email: "invitee@example.com",
      role: "client",
      full_name: "Old Placeholder",
      invite_adopted_at,
    },
  ];
  db.gtu = { invited_at: "2026-09-01T00:00:00Z", last_sign_in_at: null };
};

beforeEach(() => {
  vi.clearAllMocks();
  resetDb();
  installDb();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("complete-invite — the S-05 race is closed", () => {
  it("sequential replay: the FIRST call adopts, the SECOND is refused with NO second write", async () => {
    seedAdoptable();
    const first = await completeInviteRoute(
      req({ email: "invitee@example.com", password: "FirstPass123" }),
    );
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ ok: true });
    expect(db.passwordWrites).toEqual(["FirstPass123"]);
    expect(db.profiles[0].invite_adopted_at).toBeTruthy(); // claimed

    // BEFORE the fix this replay re-wrote the password (last-writer-wins)
    const second = await completeInviteRoute(
      req({ email: "invitee@example.com", password: "SecondPass456" }),
    );
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual({ ok: false }); // uniform answer
    expect(db.passwordWrites).toEqual(["FirstPass123"]); // NOT rewritten
  });

  it("the parallel race: exactly ONE winner — the loser never writes a password", async () => {
    seedAdoptable();
    // Both calls race with the SAME gate state (the S-05 premise); the
    // claim decides. The double serializes them, but the CONTRACT is
    // what matters: whoever loses the claim reads 0 rows and returns
    // {ok:false} without touching updateUserById.
    const [a, b] = await Promise.all([
      completeInviteRoute(
        req({ email: "invitee@example.com", password: "AttackerPass1" }),
      ),
      completeInviteRoute(
        req({ email: "invitee@example.com", password: "InviteePass12" }),
      ),
    ]);
    const bodies = [await a.json(), await b.json()] as { ok: boolean }[];
    const winners = bodies.filter((x) => x.ok === true);
    expect(winners).toHaveLength(1); // exactly ONE ok:true
    expect(db.passwordWrites).toHaveLength(1); // ONE write, not two
    expect(["AttackerPass1", "InviteePass12"]).toContain(
      db.passwordWrites[0],
    );
  });

  it("write failure → honest 502, the claim RELEASED, and a retry starts clean", async () => {
    seedAdoptable();
    db.updateUserError = { message: "GoTrue 503" };
    const fail = await completeInviteRoute(
      req({ email: "invitee@example.com", password: "ChosenPass123" }),
    );
    expect(fail.status).toBe(502);
    expect(((await fail.json()) as { error: string }).error).toBe(
      "adopt_failed",
    );
    expect(db.passwordWrites).toHaveLength(0);
    expect(db.profiles[0].invite_adopted_at).toBeNull(); // released — no poisoned state

    // The retry is clean: the same invitee can still be adopted
    db.updateUserError = null;
    const retry = await completeInviteRoute(
      req({ email: "invitee@example.com", password: "RetryPass1234" }),
    );
    expect(retry.status).toBe(200);
    expect(await retry.json()).toEqual({ ok: true });
    expect(db.passwordWrites).toEqual(["RetryPass1234"]);
  });

  it("a NON-adoptable user never mints a claim (the GoTrue gate runs first)", async () => {
    seedAdoptable();
    db.gtu = { invited_at: "2026-09-01T00:00:00Z", last_sign_in_at: "2026-09-20T10:00:00Z" };
    const res = await completeInviteRoute(
      req({ email: "invitee@example.com", password: "EvilPass12345" }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: false });
    expect(db.updateCalls).toBe(0); // no claim attempt, no write
    expect(db.passwordWrites).toHaveLength(0);
  });

  it("an unknown email → uniform {ok:false} with ZERO update calls", async () => {
    db.profiles = [];
    db.gtu = null;
    const res = await completeInviteRoute(
      req({ email: "nobody@example.com", password: "SomePass12345" }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: false });
    expect(db.updateCalls).toBe(0);
  });

  it("a successful adoption still refreshes the profile identity (step 5 unchanged)", async () => {
    seedAdoptable();
    const res = await completeInviteRoute(
      req({
        email: "invitee@example.com",
        password: "ChosenPass123",
        full_name: "Real Name",
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(db.profiles[0].full_name).toBe("Real Name");
    expect(db.profiles[0].invite_adopted_at).toBeTruthy();
  });

  it("anti-enumeration: the claim-loser's answer is byte-identical to the unknown-email answer", async () => {
    seedAdoptable();
    await completeInviteRoute(
      req({ email: "invitee@example.com", password: "FirstPass123" }),
    );
    const loser = await completeInviteRoute(
      req({ email: "invitee@example.com", password: "SecondPass456" }),
    );
    db.profiles = []; // now the email is unknown
    const unknown = await completeInviteRoute(
      req({ email: "invitee@example.com", password: "WhateverPass1" }),
    );
    expect(loser.status).toBe(unknown.status);
    expect(await loser.json()).toEqual(await unknown.json()); // {ok:false} both
  });
});
