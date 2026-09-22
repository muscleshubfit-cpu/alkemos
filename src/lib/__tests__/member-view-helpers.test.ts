import { describe, it, expect } from "vitest";
import { pickPrimarySubscription, daysLeftOn, effectiveSubStatus } from "@/lib/subscription-view";
import { weightSummary } from "@/lib/weight-summary";

describe("pickPrimarySubscription (Phase 247 — one pick law, was written 4×)", () => {
  const sub = (tier: string, id = tier) =>
    ({ id, tier, status: "active", end_date: null }) as { id: string; tier: string; status: string; end_date: string | null };

  it("prefers pro over premium regardless of row order", () => {
    const rows = [sub("premium"), sub("pro"), sub("coaching")];
    expect(pickPrimarySubscription(rows)?.tier).toBe("pro");
  });

  it("falls back to the newest-first caller order on tier ties (stable sort)", () => {
    const a = sub("premium", "a");
    const b = sub("premium", "b");
    expect(pickPrimarySubscription([a, b])?.id).toBe("a");
  });

  it("picks coaching when no membership rows exist", () => {
    expect(pickPrimarySubscription([sub("coaching")])?.tier).toBe("coaching");
  });

  it("returns null on empty input", () => {
    expect(pickPrimarySubscription([])).toBeNull();
  });
});

describe("daysLeftOn (Phase 247 — was duplicated in DashboardView twice + profile)", () => {
  it("counts whole days until a future end date", () => {
    const in3Days = new Date(Date.now() + 3 * 864e5).toISOString();
    expect(daysLeftOn(in3Days)).toBe(3);
  });

  it("clamps the past at 0 (an expired sub is not negative)", () => {
    const yesterday = new Date(Date.now() - 864e5).toISOString();
    expect(daysLeftOn(yesterday)).toBe(0);
  });

  it("returns null without an end_date", () => {
    expect(daysLeftOn(null)).toBeNull();
    expect(daysLeftOn(undefined)).toBeNull();
  });
});

describe("effectiveSubStatus (Phase 247 — «0 days left» no longer lies)", () => {
  it("keeps an active row with a future end_date active", () => {
    const future = new Date(Date.now() + 864e5).toISOString();
    expect(effectiveSubStatus({ status: "active", end_date: future })).toBe("active");
  });

  it("reports an 'active' row past its end_date as expired", () => {
    const past = new Date(Date.now() - 864e5).toISOString();
    expect(effectiveSubStatus({ status: "active", end_date: past })).toBe("expired");
  });

  it("reports a non-active status as expired", () => {
    const future = new Date(Date.now() + 864e5).toISOString();
    expect(effectiveSubStatus({ status: "cancelled", end_date: future })).toBe("expired");
  });
});

describe("weightSummary (Phase 247 — one delta law, was computed 3×)", () => {
  it("derives latest + delta + direction from a descending-time list tail", () => {
    const s = weightSummary([{ weight: 90 }, { weight: 85.5 }]);
    expect(s?.latest).toBe(85.5);
    expect(s?.delta).toBeCloseTo(-4.5);
    expect(s?.direction).toBe("down");
  });

  it("reports an increase as up", () => {
    const s = weightSummary([{ weight: "80" }, { weight: 82 }]);
    expect(s?.direction).toBe("up");
    expect(s?.delta).toBeCloseTo(2);
  });

  it("treats a flat history as no direction", () => {
    const s = weightSummary([{ weight: 80 }, { weight: 80 }]);
    expect(s?.direction).toBeNull();
    expect(s?.delta).toBe(0);
  });

  it("returns null delta when an end is missing/zero (historical truthiness law)", () => {
    expect(weightSummary([{ weight: null }, { weight: 80 }])?.delta).toBeNull();
    expect(weightSummary([{ weight: 0 }, { weight: 80 }])?.delta).toBeNull();
  });

  it("returns null on empty history", () => {
    expect(weightSummary([])).toBeNull();
  });

  it("accepts string weights from the DB numeric columns", () => {
    expect(weightSummary([{ weight: "84.5" }])?.latest).toBe(84.5);
  });
});
