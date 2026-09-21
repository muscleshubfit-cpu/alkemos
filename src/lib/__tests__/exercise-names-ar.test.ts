import { describe, it, expect } from "vitest";
import { EXERCISES, getExerciseBySlug } from "@/lib/exercises";
import { MUSCLE_LABELS, EQUIPMENT_LABELS, LEVEL_LABELS, EXERCISES_COUNT } from "@/lib/exercises-shared";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * PHASE SEO-GEO-7 (2026-09-13) — ARABIC EXERCISE NAMES LAW (owner order
 * «لا خلط بين اللغات، مطلوب حل اخر»).
 *
 * Root cause fixed: `nameAr` shipped the ENGLISH name verbatim for all
 * 868 rows, so every AR surface (meta title, H1, description, HowTo
 * schema, breadcrumb, alt text, listing cards, plan rows, AI-planner
 * prompt) rendered English-led text on Arabic pages. The fix replaces
 * the data with real Arabic names (transliterated movements per the
 * 176 Arabic-purity law + translated equipment/positions). These guards
 * keep the invariant true forever — a new exercise row with an English
 * nameAr FAILS the build.
 */

const LATIN = /[A-Za-z]/;

describe("exercise-names-ar (SEO-GEO-7)", () => {
  it("every exercise nameAr contains ZERO Latin letters (no language mixing)", () => {
    const offenders = EXERCISES.filter((e) => LATIN.test(e.nameAr));
    expect(
      offenders.map((e) => `${e.slug}: ${e.nameAr}`),
      `nameAr with Latin letters: ${offenders.map((e) => e.slug).join(", ")}`,
    ).toEqual([]);
  });

  it("every exercise nameAr is non-empty and differs from nameEn", () => {
    const offenders = EXERCISES.filter((e) => !e.nameAr.trim() || e.nameAr === e.nameEn);
    expect(offenders.map((e) => e.slug)).toEqual([]);
  });

  it("library size matches the shared count (guard contract)", () => {
    expect(EXERCISES.length).toBe(EXERCISES_COUNT);
  });

  it("Arabic names are UNIQUE across the library (868 distinct H1s/titles)", () => {
    const names = EXERCISES.map((e) => e.nameAr);
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    expect(dupes, `duplicated Arabic names: ${[...new Set(dupes)].join(" | ")}`).toEqual([]);
  });

  it("every primary/secondary muscle value has an Arabic label (MUSCLE_LABELS completeness)", () => {
    const seen = new Set<string>();
    for (const e of EXERCISES) {
      for (const m of [...e.primaryMuscles, ...e.secondaryMuscles]) seen.add(m);
    }
    const missing = [...seen].filter((m) => !MUSCLE_LABELS[m]);
    expect(missing, `muscle values without Arabic labels: ${missing.join(", ")}`).toEqual([]);
    expect(seen.size).toBeGreaterThan(0);
  });

  it("MUSCLE_LABELS Arabic values carry zero Latin letters", () => {
    const offenders = Object.entries(MUSCLE_LABELS).filter(([, v]) => LATIN.test(v.ar));
    expect(offenders.map(([k]) => k)).toEqual([]);
  });

  it("every AR meta-description ingredient (name + muscle + equipment + level labels) is Latin-free", () => {
    const offenders: string[] = [];
    for (const e of EXERCISES) {
      const parts = [
        e.nameAr,
        ...e.primaryMuscles.map((m) => MUSCLE_LABELS[m]?.ar ?? ""),
        EQUIPMENT_LABELS[e.equipment].ar,
        LEVEL_LABELS[e.level].ar,
      ];
      if (parts.some((p) => LATIN.test(p))) offenders.push(e.slug);
    }
    expect(offenders.slice(0, 20), `AR description ingredients with Latin: ${offenders.slice(0, 20).join(", ")}`).toEqual([]);
    expect(offenders.length).toBe(0);
  });

  it("incident canaries — the audited live examples now lead with Arabic", () => {
    expect(getExerciseBySlug("ab-crunch-machine")?.nameAr).toBe("جهاز كرانش البطن");
    expect(getExerciseBySlug("barbell-squat")?.nameAr).toBe("سكوات بالبار");
    expect(getExerciseBySlug("barbell-bench-press-medium-grip")?.nameAr).toBe(
      "بنش برس بالبار بقبضة متوسطة",
    );
    expect(getExerciseBySlug("barbell-curl")?.nameAr).toBe("كيرل بالبار");
    expect(getExerciseBySlug("romanian-deadlift")?.nameAr).toBe("ديدلفت روماني");
  });

  it("EN mirrors untouched — nameEn remains the canonical English name", () => {
    expect(getExerciseBySlug("ab-crunch-machine")?.nameEn).toBe("Ab Crunch Machine");
    expect(getExerciseBySlug("barbell-squat")?.nameEn).toBe("Barbell Squat");
  });

  it("AI-planner matcher still targets English names (nameEn) — bilingual prompt, no regression", () => {
    // plan-generator lists `${nameEn} (${nameAr})` — assert the pair is now
    // genuinely bilingual (before the fix both sides were identical English).
    const ex = getExerciseBySlug("barbell-curl")!;
    expect(ex.nameEn).toMatch(/^[A-Za-z]/);
    expect(ex.nameAr).toMatch(/[\u0600-\u06FF]/);
    expect(ex.nameEn).not.toBe(ex.nameAr);
  });

  it("ExerciseDetailClient CTA stays MSA — the Egyptian-dialect regression canary", () => {
    const src = readFileSync(
      join(process.cwd(), "src/app/(en)/exercises/[slug]/ExerciseDetailClient.tsx"),
      "utf-8",
    );
    expect(src).not.toContain("عايز خطة");
    expect(src).toContain("هل تريد خطة تمارين مخصصة");
  });
});
