/**
 * invite-rate-limit.test.ts — W1-2b (S-03) / Phase 331 (owner order
 * 2026-10-02 «ابدأ البند التالى» — executing the approved plan
 * docs/FULL-STACK-AUDIT-AND-REMEDIATION-PLAN-2026-10-02.md §6.2 row
 * W1-2b): the coach client-invite endpoint is rate-limited and
 * pending-capped.
 *
 * The audit finding (S-03): POST /api/coach/clients/invite went from
 * auth straight to inviteUserByEmail with NO rate limit (its sibling
 * invite/resend was limited 5/min/IP + 3/h/email) — and coach
 * registration is PUBLIC by design, so any anonymous user could
 * become a coach and use the route as a spam sender from the site's
 * domain, draining the Supabase email quota and minting unbounded
 * auth.users rows.
 *
 * Two layers, same file:
 *
 *   A. SOURCE PINS — the invite route carries the resend route's EXACT
 *      limit pair (5/min/IP + 3/hour/email — the plan's «مطابق
 *      resend»), under its OWN `invite-send:` namespace (the resend
 *      counters are a different action and must neither starve nor
 *      be starved), the IP window runs BEFORE the body parse (flood
 *      brake, the sibling's order), and the per-coach pending-invites
 *      cap rides the 0092 single source get_coach_client_stats().
 *      pending_invites — COACH-only (the S-03 threat is the public
 *      coach signup) and fail-open on an unavailable count.
 *
 *   B. ROUTE BEHAVIOR — the route against an in-memory profiles
 *      double and a REAL counting rate-limit double:
 *        1. the 6th invite from one IP within the minute → 429
 *           rate_limited + Retry-After: 60, NO invite call
 *        2. junk bodies BURN the IP window (5 invalid 400s → the
 *           6th VALID request is already 429)
 *        3. the 4th invite to one email within the hour → 429 (the
 *           email message — distinct from the IP one), no invite call
 *        4. coach at the cap (stats pending_invites = 30) → 429
 *           pending_invite_cap with the honest count, no invite call
 *        5. coach at cap−1 → the invite proceeds (200, metadata intact)
 *        6. ADMIN inviter → the cap RPC is not even consulted
 *           (owner-controlled staff; site-wide stats are not his own)
 *        7. the stats RPC erroring → fail-open invite (the rate
 *           limits still bound the abuse window — documented decision)
 *        8. missing anon auth env → the same documented fail-open
 *        9. the legit first invite → unchanged 200 (regression net)
 *           and the existing-email 409 only AFTER the limit checks
 */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";

const authState = vi.hoisted(() => ({
  role: "coach" as "coach" | "admin",
  id: "coach-1",
}));
vi.mock("@/lib/auth-server", () => ({
  requireCoach: vi.fn(async () => ({
    id: authState.id,
    role: authState.role,
    full_name: "Test Coach",
  })),
}));

// A REAL fixed-window counter (the in-memory fallback semantics):
// key → hits. Tests reset it and read the captured keys.
const rlState = vi.hoisted(() => ({
  ip: "127.0.0.1",
  map: new Map<string, number>(),
  keys: [] as string[],
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(async (key: string, max: number) => {
    const count = (rlState.map.get(key) ?? 0) + 1;
    rlState.map.set(key, count);
    rlState.keys.push(key);
    return {
      allowed: count <= max,
      remaining: Math.max(0, max - count),
      resetAt: Date.now() + 60_000,
    };
  }),
  clientIp: vi.fn(() => rlState.ip),
}));

// The scoped session client — the coach's OWN pending-invite count
// (the 0092 stats RPC). Controllable count / error; call-counted.
const rpcState = vi.hoisted(() => ({
  pending: 0,
  error: null as null | { message: string },
  calls: 0,
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    rpc: vi.fn(async () => {
      rpcState.calls += 1;
      if (rpcState.error) return { data: null, error: rpcState.error };
      return { data: [{ pending_invites: String(rpcState.pending) }], error: null };
    }),
  })),
}));

vi.mock("@/lib/supabase/admin", () => ({
  isSupabaseAdminConfigured: true,
  supabaseAdmin: {
    from: vi.fn(),
    auth: {
      admin: {
        inviteUserByEmail: vi.fn(),
        getUserById: vi.fn(),
      },
    },
  },
}));

import { POST as inviteRoute } from "@/app/api/coach/clients/invite/route";
import { supabaseAdmin } from "@/lib/supabase/admin";

const read = (rel: string): string =>
  readFileSync(join(process.cwd(), rel), "utf8");

const INVITE = "src/app/api/coach/clients/invite/route.ts";
const RESEND = "src/app/api/coach/clients/invite/resend/route.ts";

// ══════════════════════════════════════════════════════════════════════
// A. SOURCE PINS — the W1-2b law (S-03 fix direction, verbatim)
// ══════════════════════════════════════════════════════════════════════
describe("W1-2b source pins (S-03)", () => {
  it("the invite route carries the resend route's EXACT limit pair — 5/min/IP + 3/hour/email", () => {
    const pin = (src: string) => {
      expect(src, "IP_MAX = 5").toContain("const IP_MAX = 5;");
      expect(src, "IP_WINDOW = 1 min").toContain("const IP_WINDOW = 60 * 1000;");
      expect(src, "EMAIL_MAX = 3").toContain("const EMAIL_MAX = 3;");
      expect(src, "EMAIL_WINDOW = 1 hour").toContain("const EMAIL_WINDOW = 60 * 60 * 1000;");
    };
    pin(read(INVITE));
    pin(read(RESEND));
  });

  it("the two routes keep SEPARATE counter namespaces (invite-send: vs invite-resend:)", () => {
    const invite = read(INVITE);
    const resend = read(RESEND);
    // the CALL SITES (the route's own comments may mention the sibling)
    expect(invite).toContain("rateLimit(`invite-send:ip:");
    expect(invite).toContain("rateLimit(`invite-send:email:");
    expect(invite).not.toContain("rateLimit(`invite-resend:");
    expect(resend).toContain("rateLimit(`invite-resend:ip:");
    expect(resend).toContain("rateLimit(`invite-resend:email:");
    expect(resend).not.toContain("rateLimit(`invite-send:");
  });

  it("the IP window runs BEFORE the body parse (junk burns it — the sibling's order)", () => {
    const src = read(INVITE);
    const ipCheck = src.indexOf("invite-send:ip:");
    const bodyParse = src.indexOf("request.json");
    expect(ipCheck).toBeGreaterThan(-1);
    expect(bodyParse).toBeGreaterThan(-1);
    expect(ipCheck).toBeLessThan(bodyParse);
  });

  it("the pending cap rides the 0092 single source, is coach-only, fail-open, and capped at 30", () => {
    const src = read(INVITE);
    expect(src).toContain("const PENDING_INVITES_CAP = 30;");
    expect(src).toContain('rpc("get_coach_client_stats")');
    expect(src).toContain('auth.role === "coach"');
    // fail-open: an unavailable count (null) must NOT block the invite
    expect(src).toContain("pending !== null && pending >= PENDING_INVITES_CAP");
  });
});

// ══════════════════════════════════════════════════════════════════════
// B. ROUTE BEHAVIOR — the counting double + the profiles store
// ══════════════════════════════════════════════════════════════════════

type ProfileRow = { id: string; email: string; role: string };

const db = {
  profiles: [] as ProfileRow[],
  invited: [] as { email: string; data?: Record<string, unknown> }[],
};

const resetDb = () => {
  db.profiles = [];
  db.invited = [];
};

const installDb = () => {
  const client = supabaseAdmin as unknown as {
    from: ReturnType<typeof vi.fn>;
    auth: {
      admin: {
        inviteUserByEmail: ReturnType<typeof vi.fn>;
        getUserById: ReturnType<typeof vi.fn>;
      };
    };
  };

  client.auth.admin.inviteUserByEmail.mockImplementation(
    async (email: string, opts?: { data?: Record<string, unknown> }) => {
      db.invited.push({ email, data: opts?.data });
      return { data: { user: { id: `u-invited-${db.invited.length}` } }, error: null };
    },
  );

  client.from.mockImplementation((table: string) => {
    if (table === "profiles") {
      return {
        select: () => ({
          eq: (c: string, v: unknown) => ({
            maybeSingle: async () => ({
              data: db.profiles.find((r) => (r as unknown as Record<string, unknown>)[c] === v) ?? null,
              error: null,
            }),
          }),
        }),
        upsert: async () => ({ error: null }),
      };
    }
    // coach_assignments upserts — fire-and-forget
    return {
      upsert: async () => ({ error: null }),
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
      }),
    };
  });
};

const req = (body: unknown) =>
  new NextRequest("http://localhost/api/coach/clients/invite", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

const VALID = { email: "newbie@example.com" };

beforeEach(() => {
  vi.clearAllMocks();
  resetDb();
  installDb();
  rlState.map.clear();
  rlState.keys.length = 0;
  rlState.ip = "127.0.0.1";
  authState.role = "coach";
  authState.id = "coach-1";
  rpcState.pending = 0;
  rpcState.error = null;
  rpcState.calls = 0;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
});

describe("coach invite — rate limits (the resend pair)", () => {
  it("the 6th invite from one IP within the minute → 429 rate_limited + Retry-After: 60, NO invite call", async () => {
    for (let i = 0; i < 5; i++) {
      const r = await inviteRoute(req({ email: `client${i}@example.com` }));
      expect(r.status).toBe(200); // the 5 allowed
    }
    const sixth = await inviteRoute(req({ email: "sixth@example.com" }));
    expect(sixth.status).toBe(429);
    expect(((await sixth.json()) as { error: string }).error).toBe("rate_limited");
    expect(sixth.headers.get("Retry-After")).toBe("60");
    expect(db.invited).toHaveLength(5); // the 6th never reached the mail
    expect(rlState.keys).toContain("invite-send:ip:127.0.0.1");
  });

  it("junk bodies BURN the IP window — 5 invalid 400s, then the 6th VALID request is already 429", async () => {
    for (let i = 0; i < 5; i++) {
      // DISTINCT junk mailboxes (zod passes — emailSchema has no format
      // check — but EMAIL_RE rejects them: no dot in the domain): the
      // email window (3/hour) must not fire first — this isolates the IP window.
      const r = await inviteRoute(req({ email: `junk-${i}@nodot` }));
      expect(r.status).toBe(400);
      expect(((await r.json()) as { error: string }).error).toBe("invalid_email");
    }
    const valid = await inviteRoute(req(VALID));
    expect(valid.status).toBe(429); // the IP window, not the email shape
    expect(((await valid.json()) as { error: string }).error).toBe("rate_limited");
    expect(db.invited).toHaveLength(0);
  });

  it("the 4th invite to ONE email within the hour → 429 (the email message), no invite call", async () => {
    for (let i = 0; i < 3; i++) {
      const r = await inviteRoute(req({ email: "same@example.com" }));
      expect(r.status).toBe(200);
    }
    const fourth = await inviteRoute(req({ email: "same@example.com" }));
    expect(fourth.status).toBe(429);
    const json = (await fourth.json()) as { error: string; message: string };
    expect(json.error).toBe("rate_limited");
    expect(json.message).toContain("لهذا البريد"); // the EMAIL limiter, not the IP one
    expect(db.invited).toHaveLength(3);
    expect(rlState.keys).toContain("invite-send:email:same@example.com");
  });
});

describe("coach invite — the per-coach pending-invites cap", () => {
  it("coach AT the cap (30 pending) → 429 pending_invite_cap with the honest count, no invite call", async () => {
    rpcState.pending = 30;
    const res = await inviteRoute(req(VALID));
    expect(res.status).toBe(429);
    const json = (await res.json()) as { error: string; message: string };
    expect(json.error).toBe("pending_invite_cap");
    expect(json.message).toContain("30 دعوة منتظرة");
    expect(db.invited).toHaveLength(0);
    expect(rpcState.calls).toBe(1); // the cap consults the 0092 single source exactly once
  });

  it("coach at cap−1 (29 pending) → the invite proceeds (200, coach_id metadata intact)", async () => {
    rpcState.pending = 29;
    const res = await inviteRoute(req(VALID));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, action: "invited", email: VALID.email });
    expect(db.invited).toEqual([{ email: VALID.email, data: { coach_id: "coach-1" } }]);
  });

  it("ADMIN inviter → the cap RPC is not even consulted (owner-controlled staff — S-03 threat is coach signup)", async () => {
    authState.role = "admin";
    authState.id = "admin-1";
    rpcState.pending = 30; // would block a coach; irrelevant for an admin
    const res = await inviteRoute(req(VALID));
    expect(res.status).toBe(200);
    expect(rpcState.calls).toBe(0); // coach-only scoping, pinned behaviorally
    expect(db.invited).toHaveLength(1);
  });

  it("the stats RPC erroring → fail-open invite (documented: the rate limits still bound the window)", async () => {
    rpcState.error = { message: "PostgREST 500" };
    const res = await inviteRoute(req(VALID));
    expect(res.status).toBe(200);
    expect(db.invited).toHaveLength(1);
    expect(rpcState.calls).toBe(1);
  });

  it("missing anon auth env → the same documented fail-open", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    rpcState.pending = 30; // unknowable without the scoped client
    const res = await inviteRoute(req(VALID));
    expect(res.status).toBe(200);
    expect(rpcState.calls).toBe(0); // no client could even be built
    expect(db.invited).toHaveLength(1);
  });
});

describe("coach invite — the unchanged honest paths (regression net)", () => {
  it("the legit first invite → unchanged 200 {ok, action:invited, email}", async () => {
    const res = await inviteRoute(req(VALID));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, action: "invited", email: VALID.email });
  });

  it("an already-registered email still answers its honest 409 — but only AFTER the limit checks ran", async () => {
    db.profiles = [{ id: "p-1", email: "taken@example.com", role: "client" }];
    const res = await inviteRoute(req({ email: "taken@example.com" }));
    expect(res.status).toBe(409);
    expect(((await res.json()) as { error: string }).error).toBe("already_registered_client");
    expect(db.invited).toHaveLength(0);
    // the limits ran first (order proof): both namespaces were consumed
    expect(rlState.keys).toContain("invite-send:ip:127.0.0.1");
    expect(rlState.keys).toContain("invite-send:email:taken@example.com");
    // and no resend counter was touched from this route
    expect(rlState.keys.every((k) => !k.startsWith("invite-resend:"))).toBe(true);
  });
});
