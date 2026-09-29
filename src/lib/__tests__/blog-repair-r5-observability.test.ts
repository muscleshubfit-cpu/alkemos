import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

/**
 * R5 REPAIR OBSERVABILITY (Execution-Path Audit §10 Phase R5, 2026-09-30
 * — owner order «نفّذ R5 فقط»): the counter that measures
 * «repair-first vs regenerate» from DB truth.
 *
 *   stampQueueRowRepairDirective  → increments the `repairLoop` bundle
 *                                    marker, preserving sibling keys, and
 *                                    NEVER writes on an unreadable row
 *                                    (a blind write could wipe a bundle)
 *   parseBundleRepairLoop         → defensive reader (null/garbage/
 *                                    partial shapes never count)
 *   GET /api/ai/queue-health      → the repair counter block: published /
 *                                    afterRepair / exhausted / sharePct /
 *                                    recoveryPct over a 14-day window,
 *                                    substring false-positives parse-gated,
 *                                    scan failure degrading open (null)
 *
 * The P5-route behavioral proof (a repair directive STAMPS the row) lives
 * in blog-repair-contract.test.ts (R5 describe) — the same mocked surface.
 */

// ── queue-health route auth: bypassed (authRequired=false) ──
vi.mock("@/lib/auth-server", () => ({
  authRequired: false,
  requireAdmin: vi.fn(async () => null),
}));

// ── scripted supabase admin ──────────────────────────────────────────
// Every query the modules make keys on (table, select projection); the
// stamp writer's UPDATE payload is captured for assertions.
type Row = Record<string, unknown>;
let SCRIPTED: Record<string, { rows: Row[]; error?: string | null }> = {};
const UPDATE_WRITES: Array<{ table: string; payload: Row }> = [];

vi.mock("@/lib/supabase/admin", () => ({
  isSupabaseAdminConfigured: true,
  supabaseAdmin: {
    from: vi.fn((table: string) => {
      let projection = "";
      const step = () => {
        const entry = SCRIPTED[`${table}|${projection}`] ?? { rows: [], error: null };
        return {
          select: (p: string) => {
            projection = p;
            return step();
          },
          eq: () => step(),
          gte: () => step(),
          like: () => step(),
          order: () => step(),
          limit: () => Promise.resolve({ data: entry.rows, error: entry.error ?? null }),
          maybeSingle: () =>
            Promise.resolve({
              data: entry.rows[0] ?? null,
              error: entry.error ?? null,
            }),
          update: (payload: Row) => {
            UPDATE_WRITES.push({ table, payload });
            return { eq: () => Promise.resolve({ error: null }) };
          },
        };
      };
      return step();
    }),
  },
}));

import { GET as queueHealth } from "@/app/api/ai/queue-health/route";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  parseBundleRepairLoop,
  stampQueueRowRepairDirective,
} from "@/lib/blog-queue";

const REQ = { url: "http://localhost:3000/api/ai/queue-health" } as unknown as NextRequest;

function stampJson(directives: number, target = "p2-content", at = "2026-09-30T10:00:00.000Z") {
  return JSON.stringify({ repairLoop: { directives, lastTarget: target, lastAt: at } });
}

/** program the queue-health route's four scans to a clean baseline */
function baselineScans() {
  SCRIPTED["ai_jobs|status, job_type, created_at, finished_at"] = { rows: [] };
  SCRIPTED["blog_generation_queue|language, created_at"] = { rows: [] };
  SCRIPTED["blog_generation_queue|language, pair_id"] = { rows: [] };
}

beforeEach(() => {
  vi.clearAllMocks();
  SCRIPTED = {};
  UPDATE_WRITES.length = 0;
  delete process.env.GITHUB_DISPATCH_TOKEN;
});

// ═══════════════════════════════════════════════════════════════
// parseBundleRepairLoop — the defensive reader
// ═══════════════════════════════════════════════════════════════

describe("R5 parseBundleRepairLoop — defensive shapes", () => {
  it("reads a valid stamp", () => {
    expect(parseBundleRepairLoop(stampJson(2, "p4-review"))).toEqual({
      directives: 2,
      lastTarget: "p4-review",
      lastAt: "2026-09-30T10:00:00.000Z",
    });
  });

  it("null / empty / garbage / scalar bundles → null", () => {
    expect(parseBundleRepairLoop(null)).toBeNull();
    expect(parseBundleRepairLoop("")).toBeNull();
    expect(parseBundleRepairLoop("not json at all {")).toBeNull();
    expect(parseBundleRepairLoop('"a plain string"')).toBeNull();
    expect(parseBundleRepairLoop("42")).toBeNull();
  });

  it("a bundle WITHOUT the marker → null (the pre-R5 world stays uncounted)", () => {
    expect(parseBundleRepairLoop(JSON.stringify({ outline: {}, review: {} }))).toBeNull();
  });

  it("malformed stamps never count: 0 / negative / non-number / string marker", () => {
    expect(parseBundleRepairLoop(stampJson(0))).toBeNull();
    expect(parseBundleRepairLoop(stampJson(-1))).toBeNull();
    expect(parseBundleRepairLoop('{"repairLoop":{"directives":"2"}}')).toBeNull();
    expect(parseBundleRepairLoop('{"repairLoop":"touched prose"}')).toBeNull();
  });

  it("fractional directives floor; missing target/at degrade to empty strings", () => {
    const st = parseBundleRepairLoop('{"repairLoop":{"directives":2.7}}');
    expect(st?.directives).toBe(2);
    expect(st?.lastTarget).toBe("");
    expect(st?.lastAt).toBe("");
  });
});

// ═══════════════════════════════════════════════════════════════
// stampQueueRowRepairDirective — the writer
// ═══════════════════════════════════════════════════════════════

describe("R5 stampQueueRowRepairDirective — increment + preservation", () => {
  it("first directive: stamps directives=1 and PRESERVES sibling bundle keys", async () => {
    const bundle = JSON.stringify({
      outline: { title: "T" },
      research0: { keywords: ["k"] },
      coachRequested: true,
    });
    await stampQueueRowRepairDirective("row-1", "p2-content", bundle);
    expect(UPDATE_WRITES).toHaveLength(1);
    expect(UPDATE_WRITES[0]?.table).toBe("blog_generation_queue");
    const persisted = JSON.parse(String(UPDATE_WRITES[0]?.payload?.article_bundle));
    expect(persisted.outline).toEqual({ title: "T" });
    expect(persisted.research0).toEqual({ keywords: ["k"] });
    expect(persisted.coachRequested).toBe(true);
    expect(persisted.repairLoop.directives).toBe(1);
    expect(persisted.repairLoop.lastTarget).toBe("p2-content");
    expect(typeof persisted.repairLoop.lastAt).toBe("string");
  });

  it("successive directives INCREMENT (the exhausted-loop shape: 1 → 2 → 3)", async () => {
    let bundle: string | null = JSON.stringify({ outline: { title: "T" } });
    for (const n of [1, 2, 3]) {
      await stampQueueRowRepairDirective("row-1", "p4-review", bundle ?? undefined);
      const persisted = JSON.parse(String(UPDATE_WRITES[UPDATE_WRITES.length - 1]?.payload?.article_bundle));
      expect(persisted.repairLoop.directives).toBe(n);
      bundle = String(UPDATE_WRITES[UPDATE_WRITES.length - 1]?.payload?.article_bundle);
    }
  });

  it("reads the row itself when knownBundle is omitted — and a FAILED read writes NOTHING", async () => {
    SCRIPTED["blog_generation_queue|article_bundle"] = {
      rows: [{ article_bundle: stampJson(1) }],
      error: null,
    };
    await stampQueueRowRepairDirective("row-1", "p2-content");
    expect(UPDATE_WRITES).toHaveLength(1);
    const persisted = JSON.parse(String(UPDATE_WRITES[0]?.payload?.article_bundle));
    expect(persisted.repairLoop.directives).toBe(2); // incremented from the row's own 1

    UPDATE_WRITES.length = 0;
    SCRIPTED["blog_generation_queue|article_bundle"] = { rows: [], error: "connection reset" };
    await stampQueueRowRepairDirective("row-2", "p2-content");
    expect(UPDATE_WRITES).toHaveLength(0); // never a blind write
  });

  it("unparseable bundle → marker still stamps (start-fresh, coachRequested precedent)", async () => {
    await stampQueueRowRepairDirective("row-3", "p4-review", "{{{not json");
    const persisted = JSON.parse(String(UPDATE_WRITES[0]?.payload?.article_bundle));
    expect(persisted.repairLoop.directives).toBe(1);
    expect(persisted.repairLoop.lastTarget).toBe("p4-review");
  });
});

// ═══════════════════════════════════════════════════════════════
// GET /api/ai/queue-health — the repair counter block
// ═══════════════════════════════════════════════════════════════

describe("R5 queue-health repair counter — «repair-first vs regenerate»", () => {
  it("mixed window: 10 published, 2 repaired-published, 1 repair-exhausted → share 20% · recovery 67%", async () => {
    baselineScans();
    SCRIPTED["blog_generation_queue|article_bundle"] = {
      rows: Array.from({ length: 10 }, () => ({ article_bundle: null })),
    };
    SCRIPTED["blog_generation_queue|status, article_bundle"] = {
      rows: [
        { status: "published", article_bundle: stampJson(1) },
        { status: "published", article_bundle: stampJson(2, "p4-review") },
        { status: "failed", article_bundle: stampJson(3) },
      ],
    };
    const res = await queueHealth(REQ);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      repair?: {
        windowDays: number;
        published: number;
        afterRepair: number;
        exhausted: number;
        sharePct: number;
        recoveryPct: number;
      } | null;
      issues: string[];
      ok: boolean;
    };
    expect(body.repair).toEqual({
      windowDays: 14,
      published: 10,
      afterRepair: 2,
      exhausted: 1,
      sharePct: 20,
      recoveryPct: 67,
    });
    // a NEUTRAL counter: the repair ratio never raises an issue
    expect(body.issues).toEqual([]);
    expect(body.ok).toBe(true);
  });

  it("substring false-positive is parse-gated (topic prose mentioning repairLoop does not count)", async () => {
    baselineScans();
    SCRIPTED["blog_generation_queue|article_bundle"] = { rows: [{ article_bundle: null }] };
    SCRIPTED["blog_generation_queue|status, article_bundle"] = {
      rows: [
        { status: "published", article_bundle: JSON.stringify({ topic: "the repairLoop story", repairLoop: "just a word" }) },
      ],
    };
    const body = (await (await queueHealth(REQ)).json()) as { repair?: { afterRepair: number; exhausted: number } | null };
    expect(body.repair?.afterRepair).toBe(0);
    expect(body.repair?.exhausted).toBe(0);
  });

  it("non-terminal stamped statuses (skipped_*) count as neither recovered nor exhausted", async () => {
    baselineScans();
    SCRIPTED["blog_generation_queue|article_bundle"] = { rows: [{ article_bundle: null }] };
    SCRIPTED["blog_generation_queue|status, article_bundle"] = {
      rows: [
        { status: "skipped_daily_quota", article_bundle: stampJson(1) },
        { status: "failed:p5", article_bundle: stampJson(2) },
        { status: "published", article_bundle: stampJson(1) },
      ],
    };
    const body = (await (await queueHealth(REQ)).json()) as { repair?: { afterRepair: number; exhausted: number } | null };
    expect(body.repair?.afterRepair).toBe(1);
    expect(body.repair?.exhausted).toBe(1); // failed + failed:* both count
  });

  it("empty window → share 0 · recovery 100 (no signal ≠ broken)", async () => {
    baselineScans();
    SCRIPTED["blog_generation_queue|article_bundle"] = { rows: [] };
    SCRIPTED["blog_generation_queue|status, article_bundle"] = { rows: [] };
    const body = (await (await queueHealth(REQ)).json()) as { repair?: { published: number; sharePct: number; recoveryPct: number } | null };
    expect(body.repair).toEqual({
      windowDays: 14,
      published: 0,
      afterRepair: 0,
      exhausted: 0,
      sharePct: 0,
      recoveryPct: 100,
    });
  });

  it("a scan failure degrades OPEN: repair stays null, the panel answers", async () => {
    baselineScans();
    SCRIPTED["blog_generation_queue|article_bundle"] = { rows: [{ article_bundle: null }] };
    SCRIPTED["blog_generation_queue|status, article_bundle"] = { rows: [], error: "boom" };
    const res = await queueHealth(REQ);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { repair?: unknown };
    expect(body.repair).toBeNull();
  });

  it("both scans are bounded + windowed exactly as designed (14d, ≤300)", async () => {
    baselineScans();
    SCRIPTED["blog_generation_queue|article_bundle"] = { rows: [] };
    SCRIPTED["blog_generation_queue|status, article_bundle"] = { rows: [] };
    await queueHealth(REQ);
    const calls = (supabaseAdmin!.from as unknown as ReturnType<typeof vi.fn>).mock.calls.map(
      (c: unknown[]) => c[0],
    );
    expect(calls).toContain("blog_generation_queue");
    expect(calls).toContain("ai_jobs");
  });
});
