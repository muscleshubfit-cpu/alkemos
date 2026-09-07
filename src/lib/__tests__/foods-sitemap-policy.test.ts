import { describe, it, expect } from "vitest";
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
});
