import { describe, it, expect } from "vitest";
import { clampMetaTitle } from "@/lib/blog-pipeline";

/**
 * Phase SEO-GEO-6.3 (§12.19 P0-3) — SERP-safe meta title clamp laws.
 *
 * The live audit (2026-09-11) found the p5 publisher storing
 * `.slice(0, 60)` meta_titles: 23/31 EN articles were truncated MID-WORD
 * (e.g. "…vs Hypertrop") and one AR title carried a doubled brand suffix.
 * These tests pin the clamp contract that replaced the hard cut.
 */
describe("clampMetaTitle (SEO-GEO-6.3)", () => {
  it("passes a within-budget title through unchanged", () => {
    expect(clampMetaTitle("How many calories do I need to build muscle?", "en")).toBe(
      "How many calories do I need to build muscle?",
    );
  });

  it("cuts an over-budget EN title at a word boundary (never mid-word)", () => {
    const out = clampMetaTitle(
      "Creatine Loading Phase: The Complete Guide for Maximum Strength and Hypertrophy Gains",
      "en",
    );
    expect(out.length).toBeLessThanOrEqual(60);
    expect(out.endsWith(" ")).toBe(false);
    // every emitted word exists in the source title — no half-words.
    for (const word of out.split(/\s+/)) {
      expect(
        "Creatine Loading Phase: The Complete Guide for Maximum Strength and Hypertrophy Gains",
      ).toContain(word);
    }
  });

  it("uses the wider 70-char budget for Arabic titles", () => {
    const longAr = "كم سعرة حرارية تحتاج يوميا لبناء العضلات دون زيادة الدهون مع تدريب المقاومة";
    const out = clampMetaTitle(longAr, "ar");
    expect(out.length).toBeLessThanOrEqual(70);
    expect(longAr.startsWith(out.trim())).toBe(true);
  });

  it("strips a single trailing brand suffix", () => {
    expect(clampMetaTitle("Best Protein Timing After Workout — Alkemos", "en")).toBe(
      "Best Protein Timing After Workout",
    );
  });

  it("strips a DOUBLED trailing brand suffix (audit finding)", () => {
    expect(clampMetaTitle("فترات الراحة المثالية بين المجموعات — Alkemos — Alkemos", "ar")).toBe(
      "فترات الراحة المثالية بين المجموعات",
    );
  });

  it("keeps the brand when it appears mid-title (only TRAILING suffix is stripped)", () => {
    const t = "Alkemos vs Calculator.net: accuracy compared";
    expect(clampMetaTitle(t, "en")).toBe(t);
  });

  it("never ends on a dangling separator after the cut", () => {
    const out = clampMetaTitle(
      "Intermittent Fasting and Muscle Gain: A Complete Workout Plan — What the Science Says",
      "en",
    );
    expect(out).not.toMatch(/[\s,،;؛:\-—–|·؟?!.…]$/);
  });

  it("returns the trimmed original for a brand-only title", () => {
    expect(clampMetaTitle("  Alkemos  ", "en")).toBe("Alkemos");
  });
});
