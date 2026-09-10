/**
 * blog-daily-quota.test.ts — Phase 171 double-publish race closure laws
 * (blog-audit proposal ج, owner order «نفذ المقترحات كلها»).
 *
 * Pure cores under test (no DB, no network — the codebase's testing law):
 *   • expectedSlotsThrough / computeTopUp (blog-pipeline-dispatch.ts) —
 *     the backstop's grace + post-count coverage decision.
 *   • bundleMarksCoachRequest (blog-queue.ts) — the coach-exemption
 *     marker the P5 daily-quota guard reads.
 *
 * Test literals derive from the LIVE evidence documented in the Phase 171
 * audit: EN published two posts on 09-05 (23:07 + 23:33) because the
 * 23:00 backstop mistook GitHub's 30–90 min scheduler delay for a missed
 * 22:00 slot; the Vercel cron moved to 23:40 UTC and slots enter the
 * expectation only 90 minutes after their hour.
 */
import { describe, it, expect } from "vitest";
import {
  expectedSlotsThrough,
  computeTopUp,
  SLOT_GRACE_MINUTES,
} from "@/lib/blog-pipeline-dispatch";
import { bundleMarksCoachRequest } from "@/lib/blog-queue";

describe("expectedSlotsThrough — 90-minute grace law", () => {
  it("a slot still inside its grace window is NOT expected yet", () => {
    // 23:02 UTC, EN slot 22:00 — only 62 min elapsed < 90 grace.
    expect(expectedSlotsThrough([22], 23, 2)).toBe(0);
  });

  it("a slot becomes expected only after slot + 90 minutes", () => {
    expect(expectedSlotsThrough([22], 23, 30)).toBe(1); // exactly 90 min
    expect(expectedSlotsThrough([22], 23, 31)).toBe(1); // one minute past
  });

  it("the 23:40 Vercel cron sees the EN slot as expected (grace fully elapsed)", () => {
    expect(expectedSlotsThrough([22], 23, 40)).toBe(1);
  });

  it("the OLD 23:00 cron time would NOT have seen it — the exact 09-05 race", () => {
    // Regression literal: at 23:00 (minute 0) the pre-171 code expected
    // the slot and dispatched while the scheduled run was merely late.
    expect(expectedSlotsThrough([22], 23, 0)).toBe(0);
  });

  it("the AR 05:00 slot is always long past grace by the evening backstop", () => {
    expect(expectedSlotsThrough([5], 23, 40)).toBe(1);
  });

  it("early-morning calls before the slot see nothing expected", () => {
    expect(expectedSlotsThrough([5], 3, 0)).toBe(0);
    expect(expectedSlotsThrough([22], 12, 0)).toBe(0);
  });

  it("grace is injectable (pure — deterministic without fake timers)", () => {
    expect(expectedSlotsThrough([22], 22, 30, 30)).toBe(1); // 30-min grace
    expect(expectedSlotsThrough([22], 22, 29, 30)).toBe(0);
  });
});

describe("computeTopUp — coverage = max(runs, posts)", () => {
  it("THE 09-05 RACE: late-but-in-flight scheduled run (1 run, 0 posts) covers the slot", () => {
    // 23:40, one non-failed run created today (the delayed scheduled run
    // finally started 23:10): no top-up dispatch → no second article.
    const d = computeTopUp({ slots: [22], utcHour: 23, utcMinute: 40, runsToday: 1, postsToday: 0 });
    expect(d.missing).toBe(0);
    expect(d.covered).toBe(1);
    expect(d.expected).toBe(1);
  });

  it("a post that landed by ANY path covers the slot even with zero counted runs", () => {
    const d = computeTopUp({ slots: [5], utcHour: 23, utcMinute: 40, runsToday: 0, postsToday: 1 });
    expect(d.missing).toBe(0);
  });

  it("genuinely missed slot (no runs, no posts, grace elapsed) → ONE dispatch", () => {
    const d = computeTopUp({ slots: [22], utcHour: 23, utcMinute: 40, runsToday: 0, postsToday: 0 });
    expect(d.missing).toBe(1);
  });

  it("posts count unavailable → falls back to run counting (pre-171 behavior)", () => {
    const d = computeTopUp({ slots: [22], utcHour: 23, utcMinute: 40, runsToday: 1, postsToday: null });
    expect(d.postsCountUnknown).toBe(true);
    expect(d.missing).toBe(0);
    const d2 = computeTopUp({ slots: [22], utcHour: 23, utcMinute: 40, runsToday: 0, postsToday: null });
    expect(d2.missing).toBe(1);
  });

  it("coach/manual extras (posts > expected) never trigger a top-up", () => {
    const d = computeTopUp({ slots: [22], utcHour: 23, utcMinute: 40, runsToday: 2, postsToday: 3 });
    expect(d.missing).toBe(0);
    expect(d.covered).toBe(3);
  });

  it("missing is never negative", () => {
    const d = computeTopUp({ slots: [], utcHour: 23, utcMinute: 40, runsToday: 0, postsToday: 0 });
    expect(d.missing).toBe(0);
  });

  it("grace constant is 90 (GitHub documented worst-case delay)", () => {
    expect(SLOT_GRACE_MINUTES).toBe(90);
  });
});

describe("bundleMarksCoachRequest — P5 quota exemption marker", () => {
  it("recognizes a stamped coach bundle", () => {
    expect(bundleMarksCoachRequest(JSON.stringify({ research0: {}, coachRequested: true }))).toBe(true);
  });

  it("plain automated bundles are NOT coach-marked", () => {
    expect(bundleMarksCoachRequest(JSON.stringify({ research0: { topics: ["x"] } }))).toBe(false);
    expect(bundleMarksCoachRequest(JSON.stringify({ research0: {}, sharedBrief: { pairId: "p" } }))).toBe(false);
  });

  it("defensive: null / garbage / raw-string bundles never count as coach", () => {
    expect(bundleMarksCoachRequest(null)).toBe(false);
    expect(bundleMarksCoachRequest("")).toBe(false);
    expect(bundleMarksCoachRequest("not-an-object")).toBe(false);
    expect(bundleMarksCoachRequest("42")).toBe(false);
  });

  it("falsy marker values are not the boolean true", () => {
    expect(bundleMarksCoachRequest(JSON.stringify({ coachRequested: "true" }))).toBe(false);
    expect(bundleMarksCoachRequest(JSON.stringify({ coachRequested: 1 }))).toBe(false);
  });
});
