import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  DIET_LEVELS,
  DIET_SYSTEMS,
  LEVEL_GUIDANCE,
  SYSTEM_GUIDANCE,
  buildCellIntro,
  buildCellMetadata,
  FOOD_NAMES_EN,
  LEVEL_GUIDANCE_EN,
  MEAL_NAME_EN,
  SYSTEM_GUIDANCE_EN,
  buildCellIntroEn,
  buildCellMetadataEn,
  getDietSystem,
  isDietLevel,
  macroTargets,
  solveDayPlan,
} from "@/lib/diet-plan-matrix";
import { scanArabicDialect, needsMsaRepair } from "@/lib/blog-msa";

/**
 * Phase SEO-GEO-6.6 canaries (§12.19 P1-8) — the Arabic diet-plan
 * programmatic matrix: /ar/diet-plan/{level}/{system} (6 levels × 4
 * systems = 24 leaves + hub) — now BILINGUAL (§12.27): /diet-plan/{level}/
 * {system} EN twins, one engine, identical numbers.
 *
 * LAWS GUARDED:
 *   1. MATRIX SHAPE: exactly 6 × 4 cells; unknown levels/systems are
 *      rejected (no accidental infinite thin pages).
 *   2. QUALITY FLOOR (§12.19 DO-NOT «لا آلاف الصفحات الهزيلة»): every
 *      cell solves to within ±10 kcal of its level on INTEGER displayed
 *      totals, carries a UNIQUE intro (AR AND EN), and its macro targets
 *      sum to the level.
 *   3. MACRO SPLITS MATCH THE SITE: balanced 30/40/30 · high-protein
 *      45/35/20 · keto 25/5/70 mirror the macro calculator presets
 *      (canary-pinned); vegetarian 25/50/25 is matrix-only.
 *   4. MSA on the AR surface + complete EN display coverage (every food
 *      key and meal name has an EN rendering — bilingual-by-construction).
 *   5. METADATA: unique title/description per cell in BOTH languages;
 *      AR raw titles ≤70 chars (brand suffix included), EN titles ≤60.
 *   6. SCHEMA LAWS: leaves emit BreadcrumbList only — no FAQPage, no
 *      aggregateRating anywhere in the surface.
 *   7. FREE CTA: every leaf links to the meal planner (works without
 *      registration — the honest «توليد أول مجاني بلا تسجيل») — in BOTH
 *      languages.
 *   8. HREFLANG (§12.27): the EN twin exists — all four page files
 *      declare the full en/ar/x-default pair.
 */

const LEAF_FILE =
  "src/app/ar/diet-plan/[level]/[system]/page.tsx";
const HUB_FILE = "src/app/ar/diet-plan/page.tsx";
const LEAF_FILE_EN =
  "src/app/diet-plan/[level]/[system]/page.tsx";
const HUB_FILE_EN = "src/app/diet-plan/page.tsx";
const SITEMAP_FILE = "src/app/sitemap-pages.xml/route.ts";

describe("diet-plan matrix (SEO-GEO-6.6 §12.19 P1-8)", () => {
  it("MATRIX SHAPE: 6 levels × 4 systems, with known slugs", () => {
    expect(DIET_LEVELS).toHaveLength(6);
    expect(DIET_SYSTEMS).toHaveLength(4);
    expect([...DIET_SYSTEMS.map((s) => s.slug)].sort()).toEqual(
      ["balanced", "high-protein", "keto", "vegetarian"].sort(),
    );
    // Unknown inputs rejected
    expect(isDietLevel("1700")).toBe(false);
    expect(isDietLevel("keto")).toBe(false);
    expect(getDietSystem("carnivore")).toBeUndefined();
    // Every system meal declares a valid flex item
    for (const sys of DIET_SYSTEMS) {
      for (const meal of sys.meals) {
        expect(
          meal.items.some((i) => i.food === meal.flex),
          `${sys.slug}/${meal.name}: flex item must exist in items`,
        ).toBe(true);
      }
    }
  });

  it.each(DIET_LEVELS)("QUALITY: level %s solves within ±10 kcal on every system", (lv) => {
    for (const sys of DIET_SYSTEMS) {
      const day = solveDayPlan(lv, sys);
      expect(Math.abs(day.kcal - lv), `${lv}/${sys.slug} kcal`).toBeLessThanOrEqual(10);
      // Meal totals must add up to the displayed day total exactly.
      const mealSum = day.meals.reduce((s, m) => s + m.kcal, 0);
      expect(mealSum).toBe(day.kcal);
      // Macro targets sum to the level (4/4/9 arithmetic).
      const t = macroTargets(lv, sys);
      const kcalFromMacros = t.protein * 4 + t.carbs * 4 + t.fat * 9;
      expect(Math.abs(kcalFromMacros - lv)).toBeLessThanOrEqual(9);
      // No empty meals or zero-gram items.
      for (const meal of day.meals) {
        expect(meal.items.length).toBeGreaterThan(1);
        for (const i of meal.items) expect(i.grams).toBeGreaterThan(0);
      }
    }
  });

  it("QUALITY: unique intro per cell (level + system + computed numbers)", () => {
    const seen = new Map<string, string>();
    const levelFirsts = new Map<string, number>();
    for (const lv of DIET_LEVELS) {
      for (const sys of DIET_SYSTEMS) {
        const intro = buildCellIntro(lv, sys, macroTargets(lv, sys));
        expect(intro).toHaveLength(3);
        // The JOINED intro is unique per CELL (level-para + system-para +
        // computed numbers) — that is the uniqueness the §12.19 quality
        // floor demands (a unique intro on every page).
        const joined = intro.join("\n");
        if (seen.has(joined)) {
          throw new Error(`duplicate cell intro: ${lv}/${sys.slug}`);
        }
        seen.set(joined, `${lv}/${sys.slug}`);
        // Level paragraph repeats across the 4 systems of its level —
        // count distinct level-paragraphs, not cell-paragraphs.
        levelFirsts.set(intro[0], (levelFirsts.get(intro[0]) ?? 0) + 1);
        // The intro names the level and the system (self-describing page).
        const all = intro.join(" ");
        expect(all).toContain(String(lv));
        expect(all).toContain(sys.nameAr);
      }
    }
    expect(seen.size).toBe(24);
    // 6 distinct level paragraphs (each used by exactly 4 cells) +
    // 4 distinct system paragraphs (each used by exactly 6 cells).
    expect(levelFirsts.size).toBe(6);
    for (const count of levelFirsts.values()) expect(count).toBe(4);
    expect(new Set(DIET_LEVELS.map((l) => LEVEL_GUIDANCE[l])).size).toBe(6);
    expect(new Set(DIET_SYSTEMS.map((s) => SYSTEM_GUIDANCE[s.slug])).size).toBe(4);
  });

  it("§12.27 QUALITY (EN): unique intro per cell + natural-English prose", () => {
    const seen = new Set<string>();
    const levelFirsts = new Map<string, number>();
    for (const lv of DIET_LEVELS) {
      for (const sys of DIET_SYSTEMS) {
        const intro = buildCellIntroEn(lv, sys, macroTargets(lv, sys));
        expect(intro).toHaveLength(3);
        const joined = intro.join("\n");
        expect(seen.has(joined), `duplicate EN cell intro: ${lv}/${sys.slug}`).toBe(false);
        seen.add(joined);
        levelFirsts.set(intro[0], (levelFirsts.get(intro[0]) ?? 0) + 1);
        const all = intro.join(" ");
        expect(all).toContain(String(lv));
        // System guidance names the system in natural prose ("the
        // balanced system") — case-insensitive match.
        expect(all.toLowerCase()).toContain(sys.nameEn.toLowerCase());
        // EN prose must not be an Arabic-mirror accident.
        expect(/[\u0600-\u06FF]/.test(all)).toBe(false);
      }
    }
    expect(seen.size).toBe(24);
    expect(levelFirsts.size).toBe(6);
    for (const count of levelFirsts.values()) expect(count).toBe(4);
    expect(new Set(DIET_LEVELS.map((l) => LEVEL_GUIDANCE_EN[l])).size).toBe(6);
    expect(new Set(DIET_SYSTEMS.map((s) => SYSTEM_GUIDANCE_EN[s.slug])).size).toBe(4);
  });

  it("§12.27 BILINGUAL COVERAGE: every food key and meal name renders in EN", () => {
    // One engine, one solve — the EN pages print the SAME numbers; the
    // display layer must cover every food that can appear in any solve.
    for (const sys of DIET_SYSTEMS) {
      for (const lv of DIET_LEVELS) {
        const day = solveDayPlan(lv, sys);
        for (const meal of day.meals) {
          expect(MEAL_NAME_EN[meal.name], `meal EN name: ${meal.name}`).toBeTruthy();
          for (const item of meal.items) {
            expect(FOOD_NAMES_EN[item.food], `food EN name: ${item.food}`).toBeTruthy();
          }
        }
      }
    }
  });

  it("MACRO SPLITS MATCH THE SITE: preset canaries + split sums to 100", () => {
    const bySlug = Object.fromEntries(DIET_SYSTEMS.map((s) => [s.slug, s.split]));
    expect(bySlug["balanced"]).toEqual({ protein: 30, carbs: 40, fat: 30 });
    expect(bySlug["high-protein"]).toEqual({ protein: 45, carbs: 35, fat: 20 });
    expect(bySlug["keto"]).toEqual({ protein: 25, carbs: 5, fat: 70 });
    for (const sys of DIET_SYSTEMS) {
      const sum = sys.split.protein + sys.split.carbs + sys.split.fat;
      expect(sum, `${sys.slug} split must sum to 100`).toBe(100);
    }
  });

  it("MSA: all matrix copy passes the dialect scanner", () => {
    const blob = [
      ...DIET_LEVELS.map((l) => LEVEL_GUIDANCE[l]),
      ...DIET_SYSTEMS.map((s) => SYSTEM_GUIDANCE[s.slug]),
      ...DIET_LEVELS.flatMap((lv) =>
        DIET_SYSTEMS.flatMap((sys) =>
          buildCellIntro(lv, sys, macroTargets(lv, sys)),
        ),
      ),
      ...DIET_LEVELS.flatMap((lv) =>
        DIET_SYSTEMS.flatMap((sys) => {
          const { title, description } = buildCellMetadata(lv, sys);
          return [title, description];
        }),
      ),
    ].join("\n");
    const scan = scanArabicDialect(blob);
    expect(scan.strong, `strong markers: ${JSON.stringify(scan.strongHits)}`).toBe(0);
    expect(scan.weak, `weak markers: ${JSON.stringify(scan.weakHits)}`).toBeLessThan(5);
    expect(needsMsaRepair(blob)).toBe(false);
  });

  it("METADATA: unique title+description per cell; anti-double-brand law", () => {
    // The /ar layout template appends exactly one " — Alkemos" (11 chars)
    // to these string titles — so the RAW title must carry NO brand
    // (eadb3e7 law) and raw + suffix must stay ≤70 chars.
    const titles = new Set<string>();
    const descs = new Set<string>();
    for (const lv of DIET_LEVELS) {
      for (const sys of DIET_SYSTEMS) {
        const { title, description } = buildCellMetadata(lv, sys);
        expect(title, `${lv}/${sys.slug}: no brand in raw title`).not.toContain("Alkemos");
        expect(title.length + 11, `${lv}/${sys.slug} title + template suffix ≤70`).toBeLessThanOrEqual(70);
        expect(title).toContain(String(lv));
        titles.add(title);
        descs.add(description);
      }
    }
    expect(titles.size).toBe(24);
    expect(descs.size).toBe(24);
  });

  it("§12.27 METADATA (EN): unique per cell; total title ≤60 (EN budget)", () => {
    // The EN root layout has NO title template — the brand is written
    // inside the string, so the TOTAL must respect the EN ≤60 budget.
    const titles = new Set<string>();
    const descs = new Set<string>();
    for (const lv of DIET_LEVELS) {
      for (const sys of DIET_SYSTEMS) {
        const { title, description } = buildCellMetadataEn(lv, sys);
        expect(title.length, `${lv}/${sys.slug} EN title ≤60`).toBeLessThanOrEqual(60);
        expect(title).toContain(String(lv));
        expect(title).toContain("Alkemos");
        expect(description.length).toBeGreaterThanOrEqual(120);
        titles.add(title);
        descs.add(description);
      }
    }
    expect(titles.size).toBe(24);
    expect(descs.size).toBe(24);
  });

  it("HREFLANG (§12.27): EN twin exists — full en/ar/x-default pairs everywhere", () => {
    // Strip comments first (the law comments mention the patterns).
    const strip = (s: string) =>
      s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
    const leaf = strip(readFileSync(LEAF_FILE, "utf8"));
    const hub = strip(readFileSync(HUB_FILE, "utf8"));
    const leafEn = strip(readFileSync(LEAF_FILE_EN, "utf8"));
    const hubEn = strip(readFileSync(HUB_FILE_EN, "utf8"));
    // AR leaf: declares its ar self + the EN twin + x-default→EN.
    expect(leaf).toContain("ar: url");
    expect(leaf).toContain("en: `${SITE_URL}/diet-plan/${lv}/${sys.slug}`");
    expect(leaf).toContain('"x-default": `${SITE_URL}/diet-plan/${lv}/${sys.slug}`');
    // AR hub: same pairing, literal URLs.
    expect(hub).toContain("ar: `${SITE_URL}/ar/diet-plan`");
    expect(hub).toContain("en: `${SITE_URL}/diet-plan`");
    expect(hub).toContain('"x-default": `${SITE_URL}/diet-plan`');
    // EN leaf + hub: reciprocal pairs.
    expect(leafEn).toContain("en: url");
    expect(leafEn).toContain("ar: `${SITE_URL}/ar/diet-plan/${lv}/${sys.slug}`");
    expect(leafEn).toContain('"x-default": url');
    expect(hubEn).toContain("en: `${SITE_URL}/diet-plan`");
    expect(hubEn).toContain("ar: `${SITE_URL}/ar/diet-plan`");
    expect(hubEn).toContain('"x-default": `${SITE_URL}/diet-plan`');
  });

  it("SCHEMA LAWS: BreadcrumbList only — no FAQPage, no aggregateRating", () => {
    // Strip comments first — the law documentation MENTIONS the forbidden
    // names; only executable code must not contain them.
    const strip = (s: string) =>
      s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
    for (const [name, file] of [
      ["leaf", LEAF_FILE],
      ["hub", HUB_FILE],
      ["leaf-en", LEAF_FILE_EN],
      ["hub-en", HUB_FILE_EN],
    ] as const) {
      const src = strip(readFileSync(file, "utf8"));
      expect(src, `${name}: breadcrumb schema`).toContain("getBreadcrumbSchema");
      expect(src, `${name}: no FAQPage`).not.toContain("FAQPage");
      expect(src, `${name}: no aggregateRating`).not.toContain("aggregateRating");
    }
  });

  it("FREE CTA: every leaf links to the meal planner (no-registration path)", () => {
    const leaf = readFileSync(LEAF_FILE, "utf8");
    expect(leaf).toContain('href="/ar/meal-planner"');
    expect(leaf).toContain("بلا تسجيل");
    expect(leaf).toContain('href="/ar/tools/calorie-calculator"');
    // Internal mesh: other systems at the same level + other levels of the
    // same system (eatthismuch-style programmatic cross-linking).
    expect(leaf).toContain("DIET_SYSTEMS.filter");
    expect(leaf).toContain("DIET_LEVELS.filter");
    // §12.27: the EN twin carries the same honest free CTA + mesh.
    const leafEn = readFileSync(LEAF_FILE_EN, "utf8");
    expect(leafEn).toContain('href="/meal-planner"');
    expect(leafEn).toContain("without any account");
    expect(leafEn).toContain('href="/tools/calorie-calculator"');
    expect(leafEn).toContain("DIET_SYSTEMS.filter");
    expect(leafEn).toContain("DIET_LEVELS.filter");
  });

  it("§12.27 DISCOVERABILITY: the matrix is linked from user-facing sections", () => {
    // Owner directive «لا يوجد رابط واضح للمستخدم ولا ذكر فى اى قسم» —
    // the matrix must be reachable from the tools hub, the bottom-of-page
    // tool nav, the meal planner, and the homepage (grid + footer).
    const toolsHub = readFileSync("src/app/tools/page.tsx", "utf8");
    expect(toolsHub).toContain('slug: "/diet-plan"');
    const otherTools = readFileSync("src/components/OtherTools.tsx", "utf8");
    expect(otherTools).toContain('slug: "/diet-plan"');
    const mealPlanner = readFileSync("src/app/meal-planner/page.tsx", "utf8");
    expect(mealPlanner).toContain('"/ar/diet-plan"');
    expect(mealPlanner).toContain('"/diet-plan"');
    const landing = readFileSync("src/components/views/LandingView.tsx", "utf8");
    expect(landing).toContain('href: "/diet-plan"');
    expect(landing).toContain('isAr ? "/ar/diet-plan" : "/diet-plan"');
  });

  it("SITEMAP: hub + all 24 cells indexed in BOTH languages with alternates", () => {
    const src = readFileSync(SITEMAP_FILE, "utf8");
    expect(src).toContain("/ar/diet-plan");
    expect(src).toContain("`${base}/diet-plan`");
    expect(src).toContain("DIET_LEVELS");
    expect(src).toContain("DIET_SYSTEMS");
    // The double loop emits 6×4 leaf locs in BOTH trees.
    expect(src).toContain("`${base}/diet-plan/${level}/${system.slug}`");
    expect(src).toContain("`${base}/ar/diet-plan/${level}/${system.slug}`");
    // Every matrix entry declares the en/ar alternates pair.
    expect(src.match(/alternates: \{[^}]*en: `\$\{base\}\/diet-plan/g)).toBeTruthy();
  });

  it("HUB: matrix table links every cell + canonical self", () => {
    const hub = readFileSync(HUB_FILE, "utf8");
    expect(hub).toContain("canonical: `${SITE_URL}/ar/diet-plan`");
    expect(hub).toContain("DIET_LEVELS.map");
    expect(hub).toContain("DIET_SYSTEMS.map");
    // §12.27: the EN hub mirrors the structure.
    const hubEn = readFileSync(HUB_FILE_EN, "utf8");
    expect(hubEn).toContain("canonical: `${SITE_URL}/diet-plan`");
    expect(hubEn).toContain("DIET_LEVELS.map");
    expect(hubEn).toContain("DIET_SYSTEMS.map");
    expect(hubEn).toContain("s.nameEn");
  });
});
