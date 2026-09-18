import { describe, expect, it } from "vitest";
import { COACH_CLIENT_PACKAGES, coachActivationCostUsd } from "../coach-limits";

/**
 * m7 OWNER DECISION «أ» (2026-09-18 — DEEP-UX-AUDIT-2026-09-18):
 * fee_per_client is RETIRED from the activation cost equation. The
 * debit is FIXED PACKAGE PRICING ONLY — a pure function of duration,
 * identical for every coach on the server debit and on every money
 * display surface. These canaries pin that law.
 */
describe("coachActivationCostUsd — fixed package pricing only (m7 «أ»)", () => {
  it("package prices ALWAYS win for 1 and 3 months", () => {
    expect(coachActivationCostUsd(1)).toBe(6);
    expect(coachActivationCostUsd(3)).toBe(16);
  });

  it("any other duration is linear on the FIXED $6 monthly rate — no per-coach fee in the math", () => {
    expect(coachActivationCostUsd(2)).toBe(12);
    expect(coachActivationCostUsd(6)).toBe(36);
    expect(coachActivationCostUsd(12)).toBe(72); // legacy 12-month activation
  });

  it("every activatable duration (1..12) costs more than zero — the old ?? 0 fragility is gone", () => {
    for (let m = 1; m <= 12; m += 1) {
      expect(coachActivationCostUsd(m)).toBeGreaterThan(0);
    }
  });

  it("fee_per_client is out of the equation — the function takes exactly ONE argument", () => {
    // Function.length = declared parameter count; if anyone reintroduces
    // a fee parameter this canary (plus tsc at every call site) fails.
    expect(coachActivationCostUsd.length).toBe(1);
  });

  it("the single source of truth is the package array ($6/1mo · $16/3mo)", () => {
    expect(COACH_CLIENT_PACKAGES).toEqual([
      { months: 1, priceUsd: 6 },
      { months: 3, priceUsd: 16 },
    ]);
  });
});
