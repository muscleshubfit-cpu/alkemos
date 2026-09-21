import { describe, expect, it } from "vitest";

import {
  hmsBmiLabel,
  hmsLocale,
  hmsStr,
  HMS_STRINGS,
  type HmsBmiKey,
} from "../health-metrics-i18n";

/**
 * M-2026 FIX (UX-TEST-REPORT-2026-09-21) — the HealthMetricsDashboard used
 * to ship raw Arabic strings inside the coach's EN client page. These
 * canaries pin the EN/AR dictionary contract the component now renders from:
 * every key present in BOTH languages, the BMI status keys stable, and the
 * locale-aware helpers honest.
 */
describe("health-metrics-i18n — M-2026 dictionary contract", () => {
  it("exposes the exact same key set in EN and AR (parity)", () => {
    const enKeys = Object.keys(HMS_STRINGS.en).sort();
    const arKeys = Object.keys(HMS_STRINGS.ar).sort();
    expect(arKeys).toEqual(enKeys);
  });

  it("localizes the empty state the audit caught (EN not Arabic)", () => {
    const en = hmsStr("en", "emptyState");
    expect(en).toMatch(/^Not enough data/);
    expect(en).not.toMatch(/[\u0600-\u06FF]/); // no Arabic glyphs in EN
    expect(hmsStr("ar", "emptyState")).toMatch(/لا توجد بيانات كافية/);
  });

  it("covers every BMI status key in both languages", () => {
    const keys: HmsBmiKey[] = ["underweight", "normal", "overweight", "obese"];
    for (const key of keys) {
      expect(hmsBmiLabel("en", key)).toBeTruthy();
      expect(hmsBmiLabel("ar", key)).toBeTruthy();
    }
    // The audit's exact surfaces: a normal BMI reads «طبيعي» in AR,
    // «Normal» in EN — never the wrong language on either side.
    expect(hmsBmiLabel("ar", "normal")).toBe("طبيعي");
    expect(hmsBmiLabel("en", "normal")).toBe("Normal");
  });

  it("keeps units + date locale locale-aware (was hardcoded ar-EG)", () => {
    expect(HMS_STRINGS.en.kg).toBe("kg");
    expect(HMS_STRINGS.ar.kg).toBe("كجم");
    expect(hmsLocale("en")).toBe("en-US");
    expect(hmsLocale("ar")).toBe("ar-EG");
  });

  it("covers the measurement labels the audit saw in Arabic inside EN UI", () => {
    for (const key of ["waist", "chest", "hips", "arm", "neck"] as const) {
      expect(HMS_STRINGS.en[key]).not.toMatch(/[\u0600-\u06FF]/);
      expect(HMS_STRINGS.ar[key]).toMatch(/[\u0600-\u06FF]/);
    }
  });
});
