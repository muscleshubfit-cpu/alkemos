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

/**
 * PHASE 178 (§12.42) — meta description clamp: the same word-boundary law
 * the P0-3 title fix established, applied to descriptions. Live audit
 * 2026-09-12: the P1 outline parser's `.slice(0, 160)` stored mid-word
 * descriptions on 14 published rows ("…and equ", "…tips, and equ",
 * "…لدع") — and because `excerpt` rides the same source, readers saw the
 * identical mid-word cut as the page intro. These vectors pin the law.
 */
import { clampMetaDescription } from "@/lib/blog-pipeline";

describe("clampMetaDescription (Phase 178)", () => {
  it("passes a complete within-budget description through unchanged", () => {
    const d = "A complete sentence describing the article. It ends with a period.";
    expect(clampMetaDescription(d, "en")).toBe(d);
  });

  it("appends the terminal period to a within-budget unpunctuated end", () => {
    expect(clampMetaDescription("A clean sentence without terminal mark", "en")).toBe(
      "A clean sentence without terminal mark.",
    );
  });

  it("cuts the live 'and equ' vector at a word boundary and closes the sentence", () => {
    // Live row: 4-day-split-hypertrophy-fat-loss (160ch, ends "…and equ")
    const live =
      "Discover the best muscle building workout plan with a 4‑day split that maximizes hypertrophy, speeds up fat loss, and includes nutrition, recovery tips, and equ";
    const out = clampMetaDescription(live, "en");
    expect(out.length).toBeLessThanOrEqual(160);
    expect(out.endsWith("recovery tips.")).toBe(true);
    expect(out).not.toMatch(/equ\b/);
  });

  it("never ends on a connector island ('…and', '…for') after the cut", () => {
    const live =
      "Learn how to macro‑track and meal prep for fat loss on a 1800‑calorie diet. Get macro ratios, grocery lists, prep tips, and training guidance for optimal result";
    const out = clampMetaDescription(live, "en");
    expect(out).not.toMatch(/[\s](and|for|with|of|to)$/i);
    expect(out.endsWith(".")).toBe(true);
  });

  it("uses the wider 160-char budget for Arabic and cuts at a word boundary", () => {
    // Over-budget AR vector (the live women-bodyweight desc + a longer
    // tail): the clamp must keep a complete-word prefix and close it.
    const ar =
      "اكتشفي دليلنا الشامل لتصميم برنامج تمارين بناء العضلات في المنزل للنساء، مع خطة غذائية لحرق الدهون، مكملات بروتين موثوقة، ونصائح استشفاء فعّالة لتحقيق أقصى نتائج ممكنة خلال أسابيع قليلة من الالتزام بخطة متكاملة تشمل التدريب والتغذية والنوم والاستشفاء";
    const out = clampMetaDescription(ar, "ar");
    expect(out.length).toBeLessThanOrEqual(161); // 160 + terminal mark
    expect(out.endsWith(".")).toBe(true);
    // The clamped text is a prefix of the original (a pure word cut) —
    // never a mid-word fragment that is NOT a real prefix boundary.
    const cut = out.slice(0, -1); // drop the terminal "."
    expect(ar.startsWith(cut)).toBe(true);
    expect(cut.length).toBeGreaterThan(100);
  });

  it("returns the trimmed input for an empty description", () => {
    expect(clampMetaDescription("", "en")).toBe("");
    expect(clampMetaDescription("   ", "ar")).toBe("");
  });

  it("idempotent — clamping a clamped description changes nothing", () => {
    const live =
      "Discover a science‑backed 4‑day upper/lower hypertrophy split with progressive overload templates, macro tracking, supplement guides, and recovery strategies fo";
    const once = clampMetaDescription(live, "en");
    expect(clampMetaDescription(once, "en")).toBe(once);
  });
});
