/**
 * notifications-retention.test.ts — W2-1a (P-03) / migration 0100
 * (owner order 2026-10-03 «نفذ البند التالى»): the notifications
 * bell index + retention prune laws, pinned.
 *
 * Two layers, same file:
 *
 *   A. SOURCE PINS — the migration actually implements the plan's
 *      literal fix direction (§4.4 P-03): the composite index
 *      (user_id, created_at desc), the service-role-only RPC door,
 *      the [7, 3650] clamp around the 90-day default, the age-based
 *      delete + count return, the PUBLIC revoke; the types.ts mirror
 *      (Function entry); the bell's query shape stays EXACTLY what
 *      the index serves (eq user_id + order created_at desc +
 *      limit 20 — unchanged by this frame); the weekly workflow
 *      (schedule + the same secrets family + the lean no-install
 *      runner); and the runner script's own law (default 90, clamp
 *      mirror, PostgREST endpoint, honest exit codes, main-guarded
 *      so importing it here is side-effect-free).
 *
 *   B. RUNNER BEHAVIOR — the .mjs core against a fetch double:
 *      retention resolution (default / override / clamp floor /
 *      clamp ceiling / garbage throws), the exact PostgREST call
 *      (URL join, apikey + Bearer headers, body carries the window),
 *      the deleted-count parse, honest failures (HTTP error carries
 *      the status, non-number payload throws, missing config
 *      throws, trailing-slash URL normalized).
 */
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DEFAULT_RETENTION_DAYS,
  MIN_RETENTION_DAYS,
  MAX_RETENTION_DAYS,
  resolveRetentionDays,
  runPrune,
} from "../../../scripts/notifications-prune.mjs";

const read = (rel: string): string =>
  readFileSync(join(process.cwd(), rel), "utf8");

const MIG =
  "supabase/migrations/20261003060000_0100_notifications_index_and_retention.sql";
const RUNNER = "scripts/notifications-prune.mjs";
const WORKFLOW = ".github/workflows/notifications-prune.yml";
const NOTIFS = "src/lib/data/notifications.ts";
const TYPES = "src/lib/supabase/types.ts";

// ══════════════════════════════════════════════════════════════════════
// A. SOURCE PINS — the SQL + mirror + schedule law (0100)
// ══════════════════════════════════════════════════════════════════════
describe("0100 migration source pins (P-03 fix direction verbatim)", () => {
  const sql = read(MIG);

  it("creates the composite bell index — the plan's literal (user_id, created_at desc)", () => {
    expect(sql).toContain("create index if not exists idx_notifications_user_created_desc");
    expect(sql).toContain("on public.notifications (user_id, created_at desc)");
  });

  it("the RPC is service-role only (the 0098 door pattern)", () => {
    expect(sql).toContain("'prune_notifications: service role only'");
    expect(sql).toContain("security definer");
    expect(sql).toContain("set search_path = public");
  });

  it("retention defaults to 90 days and is clamped to [7, 3650] — a fat finger can never nuke fresh rows", () => {
    expect(sql).toContain("p_retention_days int default 90");
    expect(sql).toContain("least(greatest(coalesce(p_retention_days, 90), 7), 3650)");
  });

  it("the prune is age-based, counts what it deleted, and revokes PUBLIC execute", () => {
    expect(sql).toContain("where created_at < now() - make_interval(days => v_days)");
    expect(sql).toContain("get diagnostics v_deleted = ROW_COUNT");
    expect(sql).toContain("revoke execute on function public.prune_notifications(int) from public");
  });

  it("is idempotent (index if-not-exists + create-or-replace) and additive-only", () => {
    expect(sql).toContain("create index if not exists");
    expect(sql).toContain("create or replace function public.prune_notifications");
    // nothing in this migration touches a policy, a table shape, or a column
    expect(sql).not.toMatch(/alter\s+table/i);
    expect(sql).not.toMatch(/create\s+policy|drop\s+policy/i);
  });
});

describe("the bell query stays EXACTLY the shape the index serves", () => {
  it("listNotifications: eq user_id + order created_at desc + limit 20 (untouched by this frame)", () => {
    const src = read(NOTIFS);
    expect(src).toContain('.eq("user_id", userId)');
    expect(src).toContain('.order("created_at", { ascending: false })');
    expect(src).toContain(".limit(20)");
  });

  it("types.ts mirrors the RPC (Function entry with optional retention arg → number)", () => {
    const ts = read(TYPES);
    expect(ts).toContain("prune_notifications: {");
    expect(ts).toContain("p_retention_days?: number;");
  });
});

describe("the weekly runner + workflow law", () => {
  it("workflow: weekly Saturday 03:17 UTC slot + manual dispatch + no new secrets family", () => {
    const wf = read(WORKFLOW);
    expect(wf).toContain('- cron: "17 3 * * 6"');
    expect(wf).toContain("workflow_dispatch");
    // the SAME secrets evo-weekly-eval/db-backup already carry — nothing new
    expect(wf).toContain("secrets.NEXT_PUBLIC_SUPABASE_URL");
    expect(wf).toContain("secrets.SUPABASE_SERVICE_ROLE_KEY");
    expect(wf).not.toMatch(/secrets\.(?!NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY)/);
  });

  it("workflow runs the lean node runner (no dependency install step)", () => {
    const wf = read(WORKFLOW);
    expect(wf).toContain("node scripts/notifications-prune.mjs");
    expect(wf).not.toContain("bun install");
    expect(wf).not.toContain("npm ci");
  });

  it("runner script: default 90 + clamp mirrors the RPC window [7, 3650]", () => {
    const src = read(RUNNER);
    expect(src).toContain("export const DEFAULT_RETENTION_DAYS = 90");
    expect(src).toContain("export const MIN_RETENTION_DAYS = 7");
    expect(src).toContain("export const MAX_RETENTION_DAYS = 3650");
  });

  it("runner script: main-guarded import (this test file importing it is itself the proof)", () => {
    const src = read(RUNNER);
    expect(src).toContain("pathToFileURL(process.argv[1]).href");
    // exit codes are honest: 2 = config, 1 = RPC failure — never a silent 0
    expect(src).toContain("process.exit(2)");
    expect(src).toContain("process.exit(1)");
  });
});

// ══════════════════════════════════════════════════════════════════════
// B. RUNNER BEHAVIOR — the .mjs core against a fetch double
// ══════════════════════════════════════════════════════════════════════
describe("resolveRetentionDays (window resolution + clamp)", () => {
  it("empty/undefined → the 90-day migration default", () => {
    expect(resolveRetentionDays(undefined)).toBe(90);
    expect(resolveRetentionDays(null)).toBe(90);
    expect(resolveRetentionDays("")).toBe(90);
    expect(resolveRetentionDays("   ")).toBe(90);
    expect(DEFAULT_RETENTION_DAYS).toBe(90);
  });

  it("integer overrides pass through", () => {
    expect(resolveRetentionDays("60")).toBe(60);
    expect(resolveRetentionDays(30)).toBe(30);
  });

  it("clamps to the RPC's own window — floor 7, ceiling 3650", () => {
    expect(resolveRetentionDays("0")).toBe(MIN_RETENTION_DAYS);
    expect(resolveRetentionDays("-30")).toBe(MIN_RETENTION_DAYS);
    expect(resolveRetentionDays("99999")).toBe(MAX_RETENTION_DAYS);
    expect(MIN_RETENTION_DAYS).toBe(7);
    expect(MAX_RETENTION_DAYS).toBe(3650);
  });

  it("garbage throws (an honest RED beats a silently-wrong window)", () => {
    expect(() => resolveRetentionDays("abc")).toThrow(/integer/i);
    expect(() => resolveRetentionDays("12.5")).toThrow(/integer/i);
  });
});

describe("runPrune (the PostgREST call, faithfully doubled)", () => {
  it("posts to the RPC endpoint with service headers and the resolved window", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response("41", { status: 200 }),
    ) as unknown as typeof fetch;

    const deleted = await runPrune({
      url: "https://example.supabase.co/",
      key: "svc-key",
      retentionDays: 90,
      fetchImpl,
    });

    expect(deleted).toBe(41);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [calledUrl, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    // trailing slash on the project URL is normalized away
    expect(calledUrl).toBe("https://example.supabase.co/rest/v1/rpc/prune_notifications");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers.apikey).toBe("svc-key");
    expect(headers.Authorization).toBe("Bearer svc-key");
    expect(JSON.parse(init.body as string)).toEqual({ p_retention_days: 90 });
  });

  it("a custom retention window rides the body verbatim", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response("7", { status: 200 }),
    ) as unknown as typeof fetch;

    const deleted = await runPrune({
      url: "https://example.supabase.co",
      key: "k",
      retentionDays: 30,
      fetchImpl,
    });

    expect(deleted).toBe(7);
    const [, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ p_retention_days: 30 });
  });

  it("an HTTP failure throws carrying the status (never a false GREEN)", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response("missing", { status: 404 }),
    ) as unknown as typeof fetch;

    await expect(
      runPrune({ url: "https://example.supabase.co", key: "k", fetchImpl }),
    ).rejects.toThrow(/HTTP 404/);
  });

  it("the service-role door rejection (403) surfaces loudly", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response("prune_notifications: service role only", { status: 403 }),
    ) as unknown as typeof fetch;

    await expect(
      runPrune({ url: "https://example.supabase.co", key: "anon-key", fetchImpl }),
    ).rejects.toThrow(/HTTP 403/);
  });

  it("a non-number RPC payload throws (count is the observability contract)", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response('{"unexpected": true}', { status: 200 }),
    ) as unknown as typeof fetch;

    await expect(
      runPrune({ url: "https://example.supabase.co", key: "k", fetchImpl }),
    ).rejects.toThrow(/unexpected RPC payload/i);
  });

  it("missing url/key throws before any network call", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    await expect(runPrune({ url: "", key: "k", fetchImpl })).rejects.toThrow(/required/i);
    await expect(runPrune({ url: "https://x.co", key: "", fetchImpl })).rejects.toThrow(/required/i);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("importing the module performed no CLI side effects (main guard)", async () => {
    // the import at the top of this file already proves it: the module
    // evaluated without calling fetch or exiting the process. This
    // assertion documents the contract so a future top-level main()
    // cannot slip in silently.
    expect(typeof runPrune).toBe("function");
    expect(typeof resolveRetentionDays).toBe("function");
  });
});
