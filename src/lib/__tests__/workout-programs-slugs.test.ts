/**
 * ACCESS-POINT FIX (2026-09-14 audit) — Program → Exercise link integrity.
 *
 * The audit found 15 broken program→exercise slugs (404s on /programs/*
 * AND /ar/programs/*): the program data referenced guessed slugs
 * ("push-up", "burpees", "seated-cable-row", …) that never existed in
 * the exercise library (868 exercises use free-exercise-db naming:
 * "pushups", "frog-hops", "seated-cable-rows", …).
 *
 * This guard makes that failure class IMPOSSIBLE to regress: every
 * exerciseSlug referenced by every program day MUST exist in the
 * EXERCISES library, in both languages (the AR mirror renders the same
 * data with an /ar prefix). One import-free source of truth each.
 */
import { describe, expect, it } from "vitest";

import { EXERCISES } from "../exercises";
import { WORKOUT_PROGRAMS } from "../workout-programs";

describe("workout-programs → exercises integrity (access-point fix 2026-09-14)", () => {
  it("every program exerciseSlug exists in the exercise library", () => {
    const dbSlugs = new Set(EXERCISES.map((e) => e.slug));
    const referenced: Array<{ program: string; day: number; slug: string }> = [];

    for (const program of WORKOUT_PROGRAMS) {
      for (const day of program.days) {
        for (const ex of day.exercises) {
          referenced.push({ program: program.slug, day: day.day, slug: ex.exerciseSlug });
          expect(
            dbSlugs.has(ex.exerciseSlug),
            `program "${program.slug}" day ${day.day} references missing exercise "${ex.exerciseSlug}"`,
          ).toBe(true);
        }
      }
    }

    // Sanity: the fix actually covers the audited corpus (7 programs,
    // 100+ exercise rows) — an empty program array would pass vacuously.
    expect(WORKOUT_PROGRAMS.length).toBeGreaterThanOrEqual(7);
    expect(referenced.length).toBeGreaterThan(100);
  });

  it("no program references any of the 15 audited broken slugs", () => {
    const AUDITED_BROKEN = [
      "push-up", "pull-up", "burpees", "high-knees", "jumping-jacks",
      "dips", "dumbbell-curl", "lunges", "arnold-press", "hip-thrust",
      "leg-curl", "hyperextensions", "bench-press", "seated-cable-row",
      "leg-extension",
    ];
    const used = new Set(
      WORKOUT_PROGRAMS.flatMap((p) => p.days.flatMap((d) => d.exercises.map((e) => e.exerciseSlug))),
    );
    for (const bad of AUDITED_BROKEN) expect(used.has(bad)).toBe(false);
  });

  it("the 15 audited broken slugs map to REAL library slugs (repair map stays honest)", () => {
    const dbSlugs = new Set(EXERCISES.map((e) => e.slug));
    // The actual replacements shipped in the 2026-09-14 fix — if any of
    // these ever leaves the library again, this test flags it.
    const REPAIRED = [
      "pushups", "pullups", "frog-hops", "fast-skipping", "star-jump",
      "bench-dips", "dips-triceps-version", "parallel-bar-dip",
      "dumbbell-bicep-curl", "dumbbell-floor-press", "bent-over-two-dumbbell-row",
      "bodyweight-walking-lunge", "crossover-reverse-lunge", "dumbbell-lunges",
      "arnold-dumbbell-press", "barbell-hip-thrust", "lying-leg-curls",
      "hyperextensions-back-extensions", "barbell-bench-press-medium-grip",
      "seated-cable-rows", "bent-over-barbell-row", "leg-extensions",
      "barbell-shoulder-press", "barbell-deadlift",
    ];
    for (const slug of REPAIRED) expect(dbSlugs.has(slug), `${slug} missing from library`).toBe(true);
  });
});
