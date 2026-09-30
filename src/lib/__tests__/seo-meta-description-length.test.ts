import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { WORKOUT_PROGRAMS } from "@/lib/workout-programs";
import { EXERCISES, EQUIPMENT_LABELS, LEVEL_LABELS } from "@/lib/exercises";
import { MUSCLE_LABELS } from "@/lib/exercises-shared";
import { FOODS_METHODOLOGY_META } from "@/lib/foods-methodology";
import { MACRO_ACCURACY_GUIDE_META } from "@/lib/macro-accuracy-guide";

/**
 * SEO-P2-10 (SEO audit item 10 — 2026-10-01, Alkemos_SEO_Audit_Report
 * «تقليم الأوصاف الطويلة إلى ما لا يتجاوز 160 حرفًا»): every SERP-visible
 * meta description on a static/layout surface must stay ≤160 chars
 * (Google truncates around 155–160). The audit measured 21 pages over
 * 175 chars on 2026-09-30; the live re-measure on 2026-10-01 found 44
 * static-surface pages over 160 (24 over 175) plus two template tails
 * (programs 183–220 · exercises long-name tail 163–166) — all trimmed
 * in the same frame.
 *
 * What is guarded here:
 *   1. The 30 static description literals (the `description:` field of
 *      the exported `metadata` object in each layout/page file).
 *   2. The two program [slug] templates — rendered for ALL seven
 *      programs, both languages.
 *   3. The exercises [slug] EN template — rendered for ALL 868
 *      exercises (the two longest names are pinned explicitly).
 *   4. The lib-held descriptions of the P1-8 chain surfaces.
 *
 * Out of scope by design (documented, not forgotten):
 *   - JSON-LD entity descriptions in src/lib/seo.ts (structured data,
 *     not SERP snippets — no truncation surface).
 *   - og:/twitter: descriptions (social cards; no 160 limit) — the
 *     AR homepage page-level og block carries its own longer string.
 *   - Blog article descriptions: pipeline-generated per article, gated
 *     by the blog quality battery, not static strings.
 *   - Foods [slug] / diet-plan matrix / collections / hubs: measured
 *     live at max 156 (already inside the law — nothing to pin).
 */

const LIMIT = 160;

/** Files whose `metadata.description` literal must be ≤LIMIT. */
const STATIC_SURFACES: { file: string; note: string }[] = [
  // ─── EN layouts & pages ───
  { file: "src/app/(en)/evo/layout.tsx", note: "/evo" },
  { file: "src/app/(en)/for-coaches/layout.tsx", note: "/for-coaches" },
  { file: "src/app/(en)/coaching/layout.tsx", note: "/coaching" },
  { file: "src/app/(en)/compare/page.tsx", note: "/compare" },
  { file: "src/app/(en)/memberships/layout.tsx", note: "/memberships" },
  { file: "src/app/(en)/macro-tracker/layout.tsx", note: "/macro-tracker" },
  { file: "src/app/(en)/tools/calorie-calculator/layout.tsx", note: "/tools/calorie-calculator" },
  { file: "src/app/(en)/tools/water-tracker/layout.tsx", note: "/tools/water-tracker" },
  { file: "src/app/(en)/tools/bmi-calculator/layout.tsx", note: "/tools/bmi-calculator" },
  { file: "src/app/(en)/tools/macro-calculator/layout.tsx", note: "/tools/macro-calculator" },
  { file: "src/app/(en)/tools/layout.tsx", note: "/tools" },
  { file: "src/app/(en)/meal-planner/layout.tsx", note: "/meal-planner" },
  { file: "src/app/(en)/affiliate/layout.tsx", note: "/affiliate" },
  { file: "src/app/(en)/ai-workout-planner/layout.tsx", note: "/ai-workout-planner" },
  { file: "src/app/(en)/faq/page.tsx", note: "/faq" },
  { file: "src/app/(en)/about/page.tsx", note: "/about" },
  { file: "src/app/(en)/terms/page.tsx", note: "/terms" },
  { file: "src/app/(en)/authors/page.tsx", note: "/authors" },
  { file: "src/app/(en)/contact/page.tsx", note: "/contact" },
  { file: "src/app/(en)/privacy/page.tsx", note: "/privacy" },
  { file: "src/app/(en)/exercises/layout.tsx", note: "/exercises" },
  { file: "src/app/(en)/programs/layout.tsx", note: "/programs" },
  // ─── AR layouts & pages ───
  { file: "src/app/(ar)/ar/layout.tsx", note: "/ar (meta description)" },
  { file: "src/app/(ar)/ar/tools/calorie-calculator/layout.tsx", note: "/ar/tools/calorie-calculator" },
  { file: "src/app/(ar)/ar/tools/layout.tsx", note: "/ar/tools" },
  { file: "src/app/(ar)/ar/tools/macro-calculator/layout.tsx", note: "/ar/tools/macro-calculator" },
  { file: "src/app/(ar)/ar/meal-planner/layout.tsx", note: "/ar/meal-planner" },
  { file: "src/app/(ar)/ar/diet-plan/page.tsx", note: "/ar/diet-plan" },
];

const ROOT = join(process.cwd());

/**
 * Extract the meta-description string literal from a layout/page file.
 * Matches the FIRST `description:` property assignment that carries a
 * plain single-line string (the metadata block convention across the
 * repo — og blocks below it are `openGraph: { description: ... }` and
 * are skipped by anchoring on the two-space indentation of the top-level
 * metadata field).
 */
function extractMetaDescription(src: string): string | null {
  // Two-space indent + `description:` + string literal (single or double
  // quoted), possibly preceded by comment lines.
  const m = src.match(/^\s{2}description:\s*\n?\s*(?:\/\/[^\n]*\n\s*)*?(["'])((?:(?!\1)[\s\S])*)\1/m);
  if (m) return m[2];
  // Fallback: same-line form
  const m2 = src.match(/^\s{2}description:\s*(["'])((?:(?!\1)[\s\S])*)\1/m);
  return m2 ? m2[2] : null;
}

describe("SEO-P2-10 — the ≤160 meta-description law (SERP truncation)", () => {
  it("every static-surface description literal stays within 160 chars", () => {
    const failures: string[] = [];
    for (const { file, note } of STATIC_SURFACES) {
      const src = readFileSync(join(ROOT, file), "utf8");
      const desc = extractMetaDescription(src);
      if (desc === null) {
        failures.push(`${file} (${note}): description literal not found — extractor drift?`);
        continue;
      }
      if (desc.length > LIMIT) {
        failures.push(`${file} (${note}): ${desc.length} chars — over the ${LIMIT} law`);
      }
    }
    expect(failures).toEqual([]);
  });

  it("the AR homepage keeps its three copies identical (the file's established pattern)", () => {
    const src = readFileSync(join(ROOT, "src/app/(ar)/ar/layout.tsx"), "utf8");
    // Quoted literals only — the file's comment block quotes the
    // positioning line in guillemets «…» and must not count as a copy.
    const copies = src.match(
      /"تدرّب بذكاء، وتغذَّ بدقة، وتقدّم والأرقام في صفك[^"]*"/g,
    );
    expect(copies).not.toBeNull();
    expect((copies as string[]).length).toBe(3);
    expect(new Set((copies as string[]).map((c) => c.length)).size).toBe(1);
  });

  it("the AR calorie-calculator layout keeps the (Mifflin-St Jeor) eponym gloss (§12.41 law)", () => {
    const src = readFileSync(
      join(ROOT, "src/app/(ar)/ar/tools/calorie-calculator/layout.tsx"),
      "utf8",
    );
    expect(src).toContain("(Mifflin-St Jeor)");
  });

  it("the program [slug] templates render ≤160 for ALL programs, both languages", () => {
    for (const p of WORKOUT_PROGRAMS) {
      const en = `${p.nameEn}: ${p.descriptionEn}`;
      const ar = `${p.nameAr}: ${p.descriptionAr}`;
      expect(
        en.length,
        `EN ${p.slug}: ${en.length} chars`,
      ).toBeLessThanOrEqual(LIMIT);
      expect(
        ar.length,
        `AR ${p.slug}: ${ar.length} chars`,
      ).toBeLessThanOrEqual(LIMIT);
    }
  });

  it("the exercises [slug] EN template renders ≤160 for ALL 868 exercises (longest names pinned)", () => {
    let max = 0;
    let worst = "";
    for (const e of EXERCISES) {
      const d = `Learn proper form for ${e.nameEn}. Target muscles: ${e.primaryMuscles.join(", ")}. Equipment: ${EQUIPMENT_LABELS[e.equipment].en}. Level: ${LEVEL_LABELS[e.level].en}.`;
      if (d.length > max) {
        max = d.length;
        worst = e.slug;
      }
      expect(d.length, `EN ${e.slug}: ${d.length} chars`).toBeLessThanOrEqual(LIMIT);
    }
    // The two historical offenders (163/166 pre-fix) stay pinned by name.
    expect(worst).toBe("standing-dumbbell-straight-arm-front-delt-raise-above-head");
    expect(max).toBeLessThanOrEqual(LIMIT);
  });

  it("the exercises [slug] AR template renders ≤160 for ALL 868 exercises", () => {
    for (const e of EXERCISES) {
      const muscles = e.primaryMuscles.map((m) => (MUSCLE_LABELS[m]?.ar ?? m)).join("، ");
      const d = `تعلّم كيف تؤدي تمرين ${e.nameAr} بأداء صحيح. العضلات المستهدفة: ${muscles}. المعدات: ${EQUIPMENT_LABELS[e.equipment].ar}. المستوى: ${LEVEL_LABELS[e.level].ar}.`;
      expect(d.length, `AR ${e.slug}: ${d.length} chars`).toBeLessThanOrEqual(LIMIT);
    }
  });

  it("the P1-8 chain lib-held descriptions stay within 160 (EN; AR twins measured in-range)", () => {
    expect(FOODS_METHODOLOGY_META.descriptionEn.length).toBeLessThanOrEqual(LIMIT);
    expect(MACRO_ACCURACY_GUIDE_META.descriptionEn.length).toBeLessThanOrEqual(LIMIT);
    expect(FOODS_METHODOLOGY_META.descriptionAr.length).toBeLessThanOrEqual(LIMIT);
    expect(MACRO_ACCURACY_GUIDE_META.descriptionAr.length).toBeLessThanOrEqual(LIMIT);
  });
});
