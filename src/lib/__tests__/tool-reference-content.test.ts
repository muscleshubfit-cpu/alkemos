import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  CALORIE_CALCULATOR_CONTENT,
} from "@/lib/content/calorie-calculator";
import {
  MACRO_CALCULATOR_CONTENT,
} from "@/lib/content/macro-calculator";
import { BMI_CALCULATOR_CONTENT } from "@/lib/content/bmi-calculator";
import {
  BODY_FAT_CALCULATOR_CONTENT,
} from "@/lib/content/body-fat-calculator";
import { WATER_TRACKER_CONTENT } from "@/lib/content/water-tracker";
import { MEAL_PLANNER_CONTENT } from "@/lib/content/meal-planner";
import {
  flattenReferenceText,
  referenceWordCount,
  type ToolReference,
} from "@/lib/content/tool-reference";
import { scanArabicDialect, needsMsaRepair } from "@/lib/blog-msa";
import { getToolSchemas, TOOL_SCHEMA_DATA } from "@/lib/tool-schema";

/**
 * Phase SEO-GEO-6.5 canaries (§12.19 P1-6 — «المعيار المزدوج») for the
 * six standalone tool pages' deep reference content.
 *
 * LAWS GUARDED:
 *   1. DEPTH: ≥3,000 EN words per tool (calculator.net standard). The AR
 *      bar is ≥2,400 — documented Arabic-morphology equivalence: Arabic
 *      packs the same semantic volume into ~80% of English's word count
 *      (clitics + fused articles/prepositions), so 2,400 AR words carry
 *      the same reference depth as 3,000 EN words. The flagship calorie
 *      tool clears 3,000 in BOTH languages.
 *   2. STANDALONE-PER-TOOL (owner law «تاكد ان كل اداة صفحة مستقلة»):
 *      no substantive paragraph may appear on two tools' pages.
 *   3. NAMED EQUATIONS: the copy must name the real equations the code
 *      implements (Mifflin-St Jeor / Harris-Benedict / Katch-McArdle /
 *      Navy) — the audit's "معادلات مسمّاة" requirement.
 *   4. ACCURACY-TO-CODE: constants in the copy must match the tool
 *      implementations (1.2/1.9 factors, −500/+400 kcal, 40/30/30,
 *      keto 70% fat, high-protein 45%, BMI 18.5/24.9, Navy 495,
 *      water 35 ml/kg with 2,000–4,500 clamps).
 *   5. MSA: Arabic copy passes the blog dialect scanner (same machinery
 *      as the 175/176 blog law) — no strong markers, <5 weak markers.
 *   6. BILINGUAL PARITY: every localized string pair is non-empty on
 *      both sides (guaranteed structurally, verified behaviorally).
 *   7. SCHEMA LAWS: every tool layout emits WebApplication + Offer($0)
 *      + BreadcrumbList + HowTo in BOTH languages; FAQPage is FORBIDDEN
 *      (§12.19 DO-NOT list); aggregateRating is FORBIDDEN (P0-5).
 *   8. VISIBLE FAQ: each tool carries ≥10 real FAQ pairs as plain text.
 */

const TOOLS: Array<[string, ToolReference]> = [
  ["calorie-calculator", CALORIE_CALCULATOR_CONTENT],
  ["macro-calculator", MACRO_CALCULATOR_CONTENT],
  ["bmi-calculator", BMI_CALCULATOR_CONTENT],
  ["body-fat-calculator", BODY_FAT_CALCULATOR_CONTENT],
  ["water-tracker", WATER_TRACKER_CONTENT],
  ["meal-planner", MEAL_PLANNER_CONTENT],
];

const LAYOUT_FILES = [
  ...[
    "calorie-calculator",
    "macro-calculator",
    "bmi-calculator",
    "body-fat-calculator",
    "water-tracker",
  ].flatMap((t) => [
    `src/app/tools/${t}/layout.tsx`,
    `src/app/ar/tools/${t}/layout.tsx`,
  ]),
  "src/app/meal-planner/layout.tsx",
  "src/app/ar/meal-planner/layout.tsx",
  // §12.28: the AI meal-planner trial pair renders the same layered
  // schema (WebApplication + Offer($0) + BreadcrumbList + HowTo).
  "src/app/ai-meal-planner/layout.tsx",
  "src/app/ar/ai-meal-planner/layout.tsx",
];

/** Every paragraph of ≥25 words in one language, normalized. */
function longParagraphs(ref: ToolReference, lang: "en" | "ar"): string[] {
  const out: string[] = [];
  for (const s of ref.sections) {
    for (const b of s.blocks) {
      if (b.kind === "p" || b.kind === "h3") out.push(b.text[lang]);
      else if (b.kind === "list") for (const i of b.items) out.push(i[lang]);
    }
  }
  for (const f of ref.faqs) {
    out.push(f.q[lang]);
    out.push(f.a[lang]);
  }
  return out
    .filter((t) => t.split(/\s+/).length >= 25)
    .map((t) => t.replace(/\s+/g, " ").trim().toLowerCase());
}

/** Walk the structure and collect every {en, ar} pair. */
function collectBiPairs(ref: ToolReference): Array<[string, string]> {
  const pairs: Array<[string, string]> = [[ref.intro.en, ref.intro.ar]];
  for (const s of ref.sections) {
    pairs.push([s.heading.en, s.heading.ar]);
    for (const b of s.blocks) {
      if (b.kind === "p" || b.kind === "h3") pairs.push([b.text.en, b.text.ar]);
      else if (b.kind === "list") for (const i of b.items) pairs.push([i.en, i.ar]);
      else if (b.kind === "table") {
        pairs.push([b.table.caption.en, b.table.caption.ar]);
        for (const c of b.table.columns) pairs.push([c.en, c.ar]);
        for (const r of b.table.rows) {
          if (r.en.length !== r.ar.length)
            pairs.push(["__ROW_LEN_MISMATCH__", "__ROW_LEN_MISMATCH__"]);
          else for (let i = 0; i < r.en.length; i++) pairs.push([r.en[i], r.ar[i]]);
        }
      }
    }
  }
  for (const f of ref.faqs) {
    pairs.push([f.q.en, f.q.ar]);
    pairs.push([f.a.en, f.a.ar]);
  }
  return pairs;
}

describe("tool reference content (SEO-GEO-6.5 §12.19 P1-6)", () => {
  it("six standalone tool modules exist with matching slugs", () => {
    expect(TOOLS).toHaveLength(6);
    for (const [slug, ref] of TOOLS) expect(ref.slug).toBe(slug);
    // §12.28 + §12.32: the six reference-content tools PLUS the two AI
    // trial pages (schema-only entries — no deep-content modules).
    expect(Object.keys(TOOL_SCHEMA_DATA).sort()).toEqual(
      [...TOOLS.map(([s]) => s), "ai-meal-planner", "ai-workout-planner"].sort(),
    );
  });

  it.each(TOOLS)("DEPTH: %s carries ≥3,000 EN and ≥2,400 AR words", (slug, ref) => {
    const en = referenceWordCount(ref, "en");
    const ar = referenceWordCount(ref, "ar");
    expect(en, `${slug} EN word count`).toBeGreaterThanOrEqual(3000);
    expect(ar, `${slug} AR word count (≈0.8× EN by Arabic morphology)`).toBeGreaterThanOrEqual(2400);
  });

  it("DEPTH: the flagship calorie tool clears 3,000 in BOTH languages", () => {
    expect(referenceWordCount(CALORIE_CALCULATOR_CONTENT, "ar")).toBeGreaterThanOrEqual(3000);
  });

  it("STANDALONE-PER-TOOL: no substantive paragraph shared between tools", () => {
    const seen = new Map<string, string>();
    for (const [slug, ref] of TOOLS) {
      for (const lang of ["en", "ar"] as const) {
        for (const p of longParagraphs(ref, lang)) {
          if (seen.has(p)) {
            throw new Error(
              `paragraph shared between ${seen.get(p)} and ${slug} (${lang})`,
            );
          }
          seen.set(p, slug);
        }
      }
    }
    expect(seen.size).toBeGreaterThan(100);
  });

  it("NAMED EQUATIONS: the copy names the equations the code implements", () => {
    const calorie = flattenReferenceText(CALORIE_CALCULATOR_CONTENT, "en");
    for (const eq of ["Mifflin-St Jeor", "Harris-Benedict", "Katch-McArdle"]) {
      expect(calorie).toContain(eq);
    }
    const bodyFat = flattenReferenceText(BODY_FAT_CALCULATOR_CONTENT, "en");
    expect(bodyFat).toContain("Navy");
    const calorieAr = flattenReferenceText(CALORIE_CALCULATOR_CONTENT, "ar");
    expect(calorieAr).toContain("Mifflin-St Jeor");
  });

  it.each(TOOLS)("ACCURACY-TO-CODE: %s constants match the implementation", (slug, ref) => {
    const en = flattenReferenceText(ref, "en");
    const ar = flattenReferenceText(ref, "ar");
    switch (slug) {
      case "calorie-calculator": // factors 1.2–1.9 · −500/+400 · 40/30/30
        expect(en).toContain("1.2"); expect(en).toContain("1.9");
        expect(en).toContain("500"); expect(en).toContain("400");
        expect(en).toContain("40%"); expect(ar).toContain("500");
        break;
      case "macro-calculator": // keto 70% fat · high-protein 45% · 4/4/9
        expect(en).toContain("70%"); expect(en).toContain("45%");
        expect(en).toContain("9 kcal"); expect(ar).toContain("70%");
        break;
      case "bmi-calculator": // WHO cutoffs 18.5 / 24.9 / 25 / 30
        expect(en).toContain("18.5"); expect(en).toContain("24.9");
        expect(en).toContain("25"); expect(en).toContain("30");
        expect(ar).toContain("18.5"); expect(ar).toContain("24.9");
        break;
      case "body-fat-calculator": // Navy constant 495
        expect(en).toContain("495"); expect(ar).toContain("495");
        break;
      case "water-tracker": // 35 ml/kg · clamps 2,000–4,500
        expect(en).toContain("35 ml"); expect(ar).toContain("35");
        expect(en).toContain("2,000"); expect(en).toContain("4,500");
        break;
      case "meal-planner": // per-100g scaling
        expect(en.toLowerCase()).toContain("per-100");
        expect(ar).toContain("100");
        break;
    }
  });

  it.each(TOOLS)("MSA: %s Arabic copy passes the dialect scanner", (_slug, ref) => {
    const ar = flattenReferenceText(ref, "ar");
    const scan = scanArabicDialect(ar);
    expect(scan.strong, `strong dialect markers: ${JSON.stringify(scan.strongHits)}`).toBe(0);
    expect(scan.weak, `weak dialect markers: ${JSON.stringify(scan.weakHits)}`).toBeLessThan(5);
    expect(needsMsaRepair(ar)).toBe(false);
  });

  it.each(TOOLS)("BILINGUAL PARITY: %s has non-empty text on both sides", (_slug, ref) => {
    for (const [en, ar] of collectBiPairs(ref)) {
      expect(en.length).toBeGreaterThan(0);
      expect(ar.length).toBeGreaterThan(0);
    }
  });

  it.each(TOOLS)("VISIBLE FAQ: %s carries ≥10 FAQ pairs as plain text", (_slug, ref) => {
    expect(ref.faqs.length).toBeGreaterThanOrEqual(10);
    for (const f of ref.faqs) {
      expect(f.q.en.length).toBeGreaterThan(10);
      expect(f.a.en.length).toBeGreaterThan(40);
      expect(f.q.ar.length).toBeGreaterThan(10);
      expect(f.a.ar.length).toBeGreaterThan(40);
    }
  });
});

describe("tool schema layer (SEO-GEO-6.5 §12.19 P1-6)", () => {
  it("every tool emits WebApplication + BreadcrumbList + HowTo in BOTH languages", () => {
    for (const [slug] of TOOLS) {
      for (const lang of ["en", "ar"] as const) {
        const schemas = getToolSchemas(slug, lang);
        expect(schemas).toHaveLength(3);
        const types = schemas.map((s: { "@type": string }) => s["@type"]);
        expect(types).toEqual(
          expect.arrayContaining(["WebApplication", "BreadcrumbList", "HowTo"]),
        );
        const webApp = schemas[0] as {
          offers?: { price?: string };
          inLanguage?: string;
        };
        expect(webApp.offers?.price).toBe("0"); // Offer($0) — free
        expect(webApp.inLanguage).toBe(lang);
      }
    }
  });

  it("all 14 layouts render ToolSchemaScripts with the right tool+lang", () => {
    for (const file of LAYOUT_FILES) {
      const src = readFileSync(file, "utf8");
      expect(src, `${file} must import ToolSchemaScripts`).toContain(
        "ToolSchemaScripts",
      );
      const m = src.match(/<ToolSchemaScripts tool="([a-z-]+)" lang="(en|ar)" \/>/);
      expect(m, `${file} must pass tool + lang`).toBeTruthy();
      expect(TOOL_SCHEMA_DATA[m![1]]).toBeTruthy();
      expect(file.includes("/ar/")).toBe(m![2] === "ar");
    }
  });

  it("FORBIDDEN SCHEMAS: no FAQPage and no aggregateRating in the tool layer", () => {
    // Strip comments first — the law documentation itself MENTIONS the
    // forbidden names; only executable code must not contain them.
    const stripComments = (s: string) =>
      s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
    const schemaSrc = stripComments(
      readFileSync("src/lib/tool-schema.ts", "utf8"),
    );
    expect(schemaSrc).not.toContain("FAQPage");
    expect(schemaSrc).not.toContain("aggregateRating");
    for (const file of LAYOUT_FILES) {
      const src = readFileSync(file, "utf8");
      expect(src, `${file} must not emit FAQPage`).not.toContain("FAQPage");
      expect(src).not.toContain("aggregateRating");
    }
    for (const [slug] of TOOLS) {
      for (const lang of ["en", "ar"] as const) {
        const json = JSON.stringify(getToolSchemas(slug, lang));
        expect(json).not.toContain("FAQPage");
        expect(json).not.toContain("aggregateRating");
      }
    }
  });
});
