import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { FOODS, getFoodBySlug } from "@/lib/foods";
import { SEO_FOOD_BAND, SEO_FOOD_BAND_SET } from "@/lib/seo-food-band";

/**
 * FOOD-ARABIZATION Phase 1 (2026-09-19) — ARABIZED-BAND LAW.
 *
 * The arabization plan (docs/FOOD-DATA-ARABIZATION-PLAN-2026-09-19.md §6)
 * scopes the Arabic-purity law to the BAND, not the whole library (the
 * deep USDA tail legitimately keeps English nameAr until a future batch):
 *
 *   1. every SEO_FOOD_BAND slug exists and is a USDA-tail row (tags EMPTY
 *      — curation stays a hand-written signal; auto-tagging is forbidden);
 *   2. its nameAr is non-empty, contains Arabic, carries ZERO Latin
 *      letters, differs from nameEn, is 2-80 chars, no CJK (Phase-191
 *      fail-closed batch pipeline — same discipline as exercise names);
 *   3. Arabic names are UNIQUE across the band (distinct H1/titles);
 *   4. FREEZE canaries — the translation line may never touch: the 80
 *      curated rows, the 8,830 slug identities, or the band's nameEn.
 *
 * Outside the band: exempt (foods-sitemap-policy.test.ts pins the fact
 * that the rest of the tail is still English-only).
 */

const ARABIC = /[\u0600-\u06FF]/;
const LATIN = /[A-Za-z]/;
const CJK = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;

const sha256 = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");

const bandFoods = FOODS.filter((f) => SEO_FOOD_BAND_SET.has(f.slug));

describe("foods-ar-purity (FOOD-ARABIZATION Phase 1 — the 481-slug pilot band)", () => {
  it("band integrity: every manifest slug exists, is a USDA-tail row (tags empty), band size 300-500", () => {
    expect(bandFoods.length).toBe(SEO_FOOD_BAND.length);
    for (const slug of SEO_FOOD_BAND) {
      const f = getFoodBySlug(slug);
      expect(f !== undefined, `band slug missing from FOODS: ${slug}`).toBe(true);
      expect(
        f!.tags.length,
        `${slug}: band rows must keep tags EMPTY (no auto-curation)`,
      ).toBe(0);
    }
    expect(SEO_FOOD_BAND.length).toBeGreaterThanOrEqual(300);
    expect(SEO_FOOD_BAND.length).toBeLessThanOrEqual(500);
  });

  it("band law: nameAr is non-empty, Arabic, ZERO Latin, differs from nameEn", () => {
    const offenders: string[] = [];
    for (const f of bandFoods) {
      if (!f.nameAr.trim()) offenders.push(`${f.slug}: EMPTY nameAr`);
      if (!ARABIC.test(f.nameAr)) offenders.push(`${f.slug}: no Arabic «${f.nameAr}»`);
      if (LATIN.test(f.nameAr)) offenders.push(`${f.slug}: Latin letters «${f.nameAr}»`);
      if (f.nameAr === f.nameEn) offenders.push(`${f.slug}: identical to nameEn`);
    }
    expect(offenders.slice(0, 15), `band purity violations (${offenders.length})`).toEqual([]);
    expect(offenders.length).toBe(0);
  });

  it("band law: nameAr length 2-80 and CJK-free (Phase-191 batch rules)", () => {
    const offenders: string[] = [];
    for (const f of bandFoods) {
      if (f.nameAr.length < 2 || f.nameAr.length > 80)
        offenders.push(`${f.slug}: length ${f.nameAr.length} «${f.nameAr}»`);
      if (CJK.test(f.nameAr)) offenders.push(`${f.slug}: CJK «${f.nameAr}»`);
    }
    expect(offenders.slice(0, 15), `band length/CJK violations (${offenders.length})`).toEqual([]);
    expect(offenders.length).toBe(0);
  });

  it("band Arabic names are UNIQUE (distinct H1s / meta titles across the band)", () => {
    const names = bandFoods.map((f) => f.nameAr);
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    expect(
      dupes.map((n) => `«${n}»`),
      "duplicated Arabic names in band",
    ).toEqual([]);
  });

  it("FREEZE — the 80 curated rows are untouched (hand-written band canary)", () => {
    const curated = FOODS.filter((f) => (f.tags?.length ?? 0) > 0);
    expect(curated.length).toBe(80);
    const payload = curated
      .map((f) =>
        [
          f.slug,
          f.nameAr,
          f.nameEn,
          f.category,
          f.defaultServingAr,
          f.defaultServingEn,
          String(f.defaultGrams),
          f.tags.join(","),
        ].join("|"),
      )
      .join("\n");
    // Pinned 2026-09-19 (pre-arabization snapshot). If this fails, the
    // curated band was edited — the translation line NEVER touches it.
    expect(sha256(payload)).toBe(
      "e12bcb268cc9e762e7caf21b80076c912bd0ba33d8327b593ffc19bf047fe675",
    );
  });

  it("FREEZE — the 8,830 slug identities (URL law: membership AND order)", () => {
    const payload = FOODS.map((f) => f.slug).join("\n");
    expect(FOODS.length).toBe(8830);
    // Pinned 2026-09-19. Any slug change/addition/removal/reorder fails CI.
    expect(sha256(payload)).toBe(
      "0b2c0ac256e9b2646617769860dc0f9d41dfb366bb4cb5ed1f2028684a0fbffa",
    );
  });

  it("FREEZE — the band's English twins (nameEn immutable for the pilot)", () => {
    const payload = bandFoods.map((f) => `${f.slug}|${f.nameEn}`).join("\n");
    // Pinned 2026-09-19 (post-injection, nameEn unchanged from USDA source).
    expect(sha256(payload)).toBe(
      "8befa1e76fd5370ed6cdca9cd394b406400b6cba550961ef2208769b930c4551",
    );
  });

  it("incident canaries — Egyptian-diet staples lead with real Arabic now", () => {
    expect(getFoodBySlug("butter-salted")?.nameAr).toBe("زبدة مملحة");
    expect(getFoodBySlug("falafel-home-prepared")?.nameAr).toBe("طعمية — فلافل بيتية");
    expect(getFoodBySlug("jute-potherb-raw")?.nameAr).toBe("ملوخية — نيئة");
    expect(getFoodBySlug("fish-tilapia-raw")?.nameAr).toBe("سمك بلطي — نيء");
    expect(
      getFoodBySlug("broadbeans-fava-beans-mature-seeds-cooked-boiled-with-salt")
        ?.nameAr,
    ).toBe("فول مجفف — مسلوق بالملح");
    expect(getFoodBySlug("rice-white-medium-grain-raw-enriched")?.nameAr).toBe(
      "أرز أبيض متوسط الحبة — نيء",
    );
  });

  it("EN twins untouched — nameEn remains the USDA English name for the band", () => {
    expect(getFoodBySlug("butter-salted")?.nameEn).toBe("Butter, salted");
    expect(getFoodBySlug("falafel-home-prepared")?.nameEn).toBe("Falafel, home-prepared");
  });
});
