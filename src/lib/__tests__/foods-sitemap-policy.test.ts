import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { FOODS } from "@/lib/foods";

/**
 * Phase 141 / audit A-5 policy canaries — the invariants the
 * sitemap-foods crawl-budget policy depends on.
 *
 * Policy (src/app/sitemap-foods.xml/route.ts): only foods with
 * `tags.length > 0` are advertised in the sitemap (both languages).
 * The USDA long tail stays live and indexable via internal links.
 *
 * These tests pin the dataset facts that justify the policy, so any
 * future data regeneration that silently breaks the assumptions
 * (e.g. strips Arabic names from curated foods, or ships Arabic
 * names for the long tail) fails here instead of silently corrupting
 * the sitemap policy.
 */

const hasArabic = (s: string) => /[\u0600-\u06FF]/.test(s);

describe("foods sitemap policy (A-5)", () => {
  it("curated band: every tagged food has a REAL Arabic name (rankable AR mirror)", () => {
    const curated = FOODS.filter((f) => (f.tags?.length ?? 0) > 0);
    expect(curated.length).toBeGreaterThanOrEqual(50);
    for (const f of curated) {
      expect(hasArabic(f.nameAr), `${f.slug} nameAr must contain Arabic`).toBe(
        true,
      );
      expect(f.slug.length).toBeGreaterThan(0);
    }
  });

  it("USDA long tail carries ENGLISH nameAr — documents WHY it is out of the sitemap", () => {
    const tail = FOODS.filter((f) => (f.tags?.length ?? 0) === 0);
    // The Phase 141 audit verified ALL 8,750 tail rows ship English
    // nameAr. This pins that fact; if a future regeneration translates
    // the tail, this test fails and the sitemap policy should be
    // revisited (translated tail = rankable AR mirrors again).
    const withArabic = tail.filter((f) => hasArabic(f.nameAr)).length;
    expect(withArabic).toBe(0);
    expect(tail.length).toBeGreaterThan(8000);
  });

  it("curated band spans every food category (section coverage)", () => {
    const curated = FOODS.filter((f) => (f.tags?.length ?? 0) > 0);
    const cats = new Set(curated.map((f) => f.category));
    for (const c of [
      "protein",
      "carb",
      "fat",
      "vegetable",
      "fruit",
      "dairy",
      "nuts",
      "snack",
      "drink",
    ]) {
      expect(cats.has(c as never), `curated band missing category ${c}`).toBe(
        true,
      );
    }
  });

  // P2-12 (§12.37 — plan item 12 «معالجة USDA العربي»): the AR mirror of
  // an arabicless (USDA long-tail) food leaves the index — noindex,follow
  // — while curated foods (real Arabic names) stay fully indexable and
  // the EN twin keeps the Phase-141 policy (indexable, unadvertised).
  it("P2-12: the AR food route noindexes arabicless USDA mirrors only", () => {
    const route = readFileSync("src/app/ar/foods/[slug]/page.tsx", "utf8");
    expect(route).toContain("arabiclessName");
    expect(route).toContain("robots: { index: false, follow: true }");
    expect(route).toContain("/[\\u0600-\\u06FF]/.test(food.nameAr)");
    // The EN twin stays indexable for the whole dataset (141 policy).
    const en = readFileSync("src/app/foods/[slug]/page.tsx", "utf8");
    expect(en).not.toContain("arabiclessName");
    expect(en).not.toContain("index: false, follow: true");
    // Data facts the law depends on: the long tail really is arabicless.
    const tail = FOODS.filter((f) => (f.tags?.length ?? 0) === 0);
    expect(tail.length).toBeGreaterThan(5000);
    expect(tail.filter((f) => hasArabic(f.nameAr)).length).toBe(0);
  });
});

