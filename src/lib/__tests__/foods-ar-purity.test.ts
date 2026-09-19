import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { FOODS, getFoodBySlug } from "@/lib/foods";
import { SEO_FOOD_BAND, SEO_FOOD_BAND_SET } from "@/lib/seo-food-band";

/**
 * FOOD-ARABIZATION Phase 1+2+3 (2026-09-19) — ARABIZED-BAND LAW.
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
 * Phase 1 (pilot, owner order 2026-09-19): 481 slugs. Phase 2 (owner
 * expansion order, same day): +975 slugs (seafood sweep · produce ·
 * full spice rack · dairy/bakery/dessert staples). Phase 3 (owner
 * batch-3 order, same day): +953 slugs (meat cuts & organs with semantic
 * cut-dedupe · poultry part grid · remaining fish/shellfish · rabbit/
 * deer/water-buffalo · generic soups · bakery/dessert/candy · beverages
 * incl. protein powders · vegetables/fruits/legumes · flours & cereals ·
 * nuts/seeds · condiments · snacks — zero pork/brands/babyfood/tribal)
 * — cumulative 2,409 = pilot + two 500-1,000 batches (plan §8 Phase 2
 * law; the size range below encodes exactly that).
 *
 * Outside the band: exempt (foods-sitemap-policy.test.ts pins the fact
 * that the rest of the tail is still English-only).
 */

const ARABIC = /[\u0600-\u06FF]/;
const LATIN = /[A-Za-z]/;
const CJK = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;

const sha256 = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");

const bandFoods = FOODS.filter((f) => SEO_FOOD_BAND_SET.has(f.slug));

describe("foods-ar-purity (FOOD-ARABIZATION Phase 1+2+3 — the 2,409-slug band)", () => {
  it("band integrity: every manifest slug exists, is a USDA-tail row (tags empty), band size = pilot + two 500-1,000 batches (1482-3481)", () => {
    expect(bandFoods.length).toBe(SEO_FOOD_BAND.length);
    for (const slug of SEO_FOOD_BAND) {
      const f = getFoodBySlug(slug);
      expect(f !== undefined, `band slug missing from FOODS: ${slug}`).toBe(true);
      expect(
        f!.tags.length,
        `${slug}: band rows must keep tags EMPTY (no auto-curation)`,
      ).toBe(0);
    }
    // Phase 1 (481) + Phase 2 & 3 batch law (500-1,000 each per plan §8).
    expect(SEO_FOOD_BAND.length).toBeGreaterThanOrEqual(1482);
    expect(SEO_FOOD_BAND.length).toBeLessThanOrEqual(3481);
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

  it("FREEZE — the band's English twins (nameEn immutable across batches)", () => {
    const payload = bandFoods.map((f) => `${f.slug}|${f.nameEn}`).join("\n");
    // Pinned 2026-09-19 after the Phase-3 expansion (481 pilot + 975 + 953
    // rows; every nameEn still the verbatim USDA English name).
    expect(sha256(payload)).toBe(
      "d0b5b15d5d5c121b427168c3d4d2ef0c7e69eef52bfced094d3664cf9138d9ea",
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

  it("Phase-2 canaries — owner-ordered expansion batch (seafood · spices · Egyptian staples)", () => {
    expect(getFoodBySlug("dates-medjool")?.nameAr).toBe("بلح مجهول");
    expect(getFoodBySlug("quinces-raw")?.nameAr).toBe("سفرجل — نيء");
    expect(getFoodBySlug("grape-leaves-raw")?.nameAr).toBe("ورق عنب — نيء");
    expect(getFoodBySlug("roselle-raw")?.nameAr).toBe("كركديه — طازج");
    expect(getFoodBySlug("tamarinds-raw")?.nameAr).toBe("تمر هندي — نيء");
    expect(getFoodBySlug("spices-saffron")?.nameAr).toBe("زعفران");
    expect(getFoodBySlug("spices-cardamom")?.nameAr).toBe("هيل");
    expect(getFoodBySlug("spices-fenugreek-seed")?.nameAr).toBe("حلبة — حبوب");
    expect(getFoodBySlug("fish-grouper-mixed-species-raw")?.nameAr).toBe("سمك هامور — نيء");
    expect(getFoodBySlug("fish-whiting-mixed-species-raw")?.nameAr).toBe("سمك ميرلان (بحري) — نيء");
    expect(getFoodBySlug("pumpkin-raw")?.nameAr).toBe("يقطين — نيء");
    expect(getFoodBySlug("purslane-raw")?.nameAr).toBe("رجلة (بربيين) — نيئة");
    expect(getFoodBySlug("puddings-rice-ready-to-eat")?.nameAr).toBe("أرز باللبن — جاهز");
    expect(getFoodBySlug("chard-swiss-raw")?.nameAr).toBe("سلق — نيء");
    expect(getFoodBySlug("nuts-coconut-milk-canned-liquid-expressed-from-grated-meat-a")?.nameAr).toBe("حليب جوز الهند — معلب");
    expect(getFoodBySlug("oil-canola")?.nameAr).toBe("زيت الكانولا");
  });

  it("Phase-3 canaries — owner-ordered batch 3 (meat/organs · poultry · shellfish · soup · bakery · nuts)", () => {
    expect(getFoodBySlug("game-meat-rabbit-domesticated-composite-of-cuts-raw")?.nameAr).toBe("أرنب بلدي — نيء");
    expect(getFoodBySlug("game-meat-buffalo-water-raw")?.nameAr).toBe("جاموس الماء — نيء");
    expect(getFoodBySlug("beef-variety-meats-and-by-products-tripe-cooked-simmered")?.nameAr).toBe("كرشة بقري — مطهوة على نار هادئة");
    expect(getFoodBySlug("beef-new-zealand-imported-variety-meats-and-by-products-tong-7482")?.nameAr).toBe("لسان بقري مستورد — نيء");
    expect(getFoodBySlug("chicken-broilers-or-fryers-wing-meat-only-cooked-fried")?.nameAr).toBe("جناح دجاج — لحم فقط، مقلي");
    expect(getFoodBySlug("turkey-retail-parts-breast-meat-only-raw")?.nameAr).toBe("صدر رومي (قطع تجزئة) — لحم فقط، نيء");
    expect(getFoodBySlug("fish-salmon-pink-canned-drained-solids")?.nameAr).toBe("سلمون وردي معلب — مصفى");
    expect(getFoodBySlug("mollusks-octopus-common-cooked-moist-heat")?.nameAr).toBe("أخطبوط — مطهو");
    expect(getFoodBySlug("crustaceans-shrimp-raw-not-previously-frozen")?.nameAr).toBe("جمبري طازج — نيء");
    expect(getFoodBySlug("soup-cream-of-mushroom-canned-prepared-with-equal-volume-wat")?.nameAr).toBe("شوربة كريمة الفطر — محضرة بالماء");
    expect(getFoodBySlug("ground-turkey-93-lean-7-fat-patties-broiled")?.nameAr).toBe("برجر رومي مفروم 93/7 — مشوي");
    expect(getFoodBySlug("bread-naan-whole-wheat-commercially-prepared-refrigerated")?.nameAr).toBe("خبز نان بالقمح الكامل — جاهز مبرد");
    expect(getFoodBySlug("candies-halavah-plain")?.nameAr).toBe("حلاوة طحينية (هلاوة) — عادية");
    expect(getFoodBySlug("nuts-pine-nuts-pinyon-dried")?.nameAr).toBe("صنوبر مجفف");
    expect(getFoodBySlug("beverages-whey-protein-powder-isolate")?.nameAr).toBe("بروتين مصل اللبن المعزول — بودرة");
    expect(getFoodBySlug("yogurt-greek-strawberry-nonfat")?.nameAr).toBe("زبادي يوناني بالفراولة — خالي الدسم");
    expect(getFoodBySlug("orange-juice-raw")?.nameAr).toBe("عصير برتقال — طازج معصور");
    expect(getFoodBySlug("arugula-raw")?.nameAr).toBe("أروغولا (جرجير بري) — نيئة");
  });

  it("EN twins untouched — nameEn remains the USDA English name for the band", () => {
    expect(getFoodBySlug("butter-salted")?.nameEn).toBe("Butter, salted");
    expect(getFoodBySlug("falafel-home-prepared")?.nameEn).toBe("Falafel, home-prepared");
  });
});
