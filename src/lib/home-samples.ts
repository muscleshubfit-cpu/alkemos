/**
 * HOME-SAMPLES — the server-side curated slice of the real content
 * libraries for the homepage «Content Entry Points» sections
 * (owner order 2026-09-15 — Phase 202: «اجعل الأدوات والمكتبات
 * نقاط دخول حقيقية بمحتوى فعلي قابل للتصفح، لا أرقامًا مجردة»).
 *
 * WHY THIS MODULE EXISTS:
 *   The homepage is a CLIENT component (LandingView) but the real
 *   libraries are server-only by the BUNDLE LAW (exercises.ts = 1.6MB,
 *   foods.ts = 3.6MB — never shipped to the browser). The homepage
 *   route pages are SERVER components: they call getHomeSamples(),
 *   pick the curated real entries from the giant arrays, and pass the
 *   small serializable slices to LandingView as props — same pattern
 *   as /exercises + /foods (server renders from real data, client
 *   receives plain objects).
 *
 * WHAT IT RETURNS:
 *   - 8 REAL exercises (curated slugs — one hero lift per muscle
 *     family: chest / back / legs / shoulders / biceps / triceps /
 *     core / posterior chain), each with its real bilingual name,
 *     level, equipment, category label, and first real image URL.
 *   - 8 REAL foods (curated slugs spanning protein / carbs / fats /
 *     fruit / dairy), each with its real per-100g calories & macros.
 *   - 3 REAL programs (the same curated trio the homepage featured
 *     before, now from the real array: real images, duration, split,
 *     level, location).
 *
 * DRIFT GUARD: home-samples.test.ts pins every curated slug against
 * the live arrays (library-counts pattern) — if a data file drops or
 * renames a curated entry, the test fails and the curation is
 * consciously updated. Counts stay dynamic (EX_PLUS / FOODS_PLUS).
 */

import "server-only";

import { EXERCISES } from "@/lib/exercises";
import { FOODS } from "@/lib/foods";
import { WORKOUT_PROGRAMS } from "@/lib/workout-programs";
import {
  CATEGORY_LABELS as EX_CATEGORY_LABELS,
  EQUIPMENT_LABELS,
  LEVEL_LABELS as EX_LEVEL_LABELS,
} from "@/lib/exercises-shared";
import { CATEGORY_LABELS as FOOD_CATEGORY_LABELS } from "@/lib/foods-shared";
import {
  LEVEL_LABELS as PROGRAM_LEVEL_LABELS,
  LOCATION_LABELS,
} from "@/lib/workout-programs";
import { getExerciseImageUrl } from "@/lib/exercise-images";

// ─── Curated real slugs (verified against the arrays by the drift test) ───

export const EXERCISE_SAMPLE_SLUGS = [
  "barbell-bench-press-medium-grip", // chest · barbell
  "pullups", // back · bodyweight
  "barbell-squat", // legs · barbell
  "dumbbell-shoulder-press", // shoulders · dumbbell
  "romanian-deadlift", // posterior chain · barbell
  "barbell-curl", // biceps · barbell
  "triceps-pushdown", // triceps · cable
  "plank", // core · bodyweight
] as const;

export const FOOD_SAMPLE_SLUGS = [
  "chicken-breast", // protein
  "salmon", // protein
  "white-rice", // carb
  "oats", // carb
  "sweet-potato", // carb
  "avocado", // fat
  "banana", // fruit
  "greek-yogurt", // dairy
] as const;

export const PROGRAM_SAMPLE_SLUGS = [
  "home-beginner-fullbody",
  "gym-ppl-intermediate",
  "home-fat-loss-hiit",
] as const;

// ─── Serializable sample shapes (plain data — safe to cross the
//     server→client boundary as props; LandingView renders them with
//     zero library imports) ───

export type HomeExerciseSample = {
  slug: string;
  nameAr: string;
  nameEn: string;
  categoryLabelAr: string;
  categoryLabelEn: string;
  levelLabelAr: string;
  levelLabelEn: string;
  levelColor: string;
  equipmentLabelAr: string;
  equipmentLabelEn: string;
  /** First real exercise image (start-position frame). */
  image: string;
  imageAlt: string;
};

export type HomeFoodSample = {
  slug: string;
  nameAr: string;
  nameEn: string;
  categoryLabelAr: string;
  categoryLabelEn: string;
  /** Real per-100g values from the foods database. */
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type HomeProgramSample = {
  slug: string;
  nameAr: string;
  nameEn: string;
  levelLabelAr: string;
  levelLabelEn: string;
  levelColor: string;
  locationLabelAr: string;
  locationLabelEn: string;
  durationWeeks: number;
  daysPerWeek: number;
  image: string;
  imageAltAr: string;
  imageAltEn: string;
};

export type HomeSamples = {
  exercises: HomeExerciseSample[];
  foods: HomeFoodSample[];
  programs: HomeProgramSample[];
};

// ─── Selection (server-side, from the REAL arrays) ───

export function getHomeSamples(): HomeSamples {
  const exercises: HomeExerciseSample[] = EXERCISE_SAMPLE_SLUGS.flatMap((slug) => {
    const ex = EXERCISES.find((e) => e.slug === slug);
    if (!ex) return []; // curated slug retired → drift test flags it
    const firstImage = ex.imageKey.split(",")[0]?.trim() ?? "";
    return [
      {
        slug: ex.slug,
        nameAr: ex.nameAr,
        nameEn: ex.nameEn,
        categoryLabelAr: EX_CATEGORY_LABELS[ex.category].ar,
        categoryLabelEn: EX_CATEGORY_LABELS[ex.category].en,
        levelLabelAr: EX_LEVEL_LABELS[ex.level].ar,
        levelLabelEn: EX_LEVEL_LABELS[ex.level].en,
        levelColor: EX_LEVEL_LABELS[ex.level].color,
        equipmentLabelAr: EQUIPMENT_LABELS[ex.equipment].ar,
        equipmentLabelEn: EQUIPMENT_LABELS[ex.equipment].en,
        image: firstImage ? getExerciseImageUrl(firstImage) : "",
        imageAlt: ex.nameEn,
      },
    ];
  });

  const foods: HomeFoodSample[] = FOOD_SAMPLE_SLUGS.flatMap((slug) => {
    const food = FOODS.find((f) => f.slug === slug);
    if (!food) return []; // curated slug retired → drift test flags it
    return [
      {
        slug: food.slug,
        nameAr: food.nameAr,
        nameEn: food.nameEn,
        categoryLabelAr: FOOD_CATEGORY_LABELS[food.category].ar,
        categoryLabelEn: FOOD_CATEGORY_LABELS[food.category].en,
        calories: food.per100g.calories,
        protein: food.per100g.protein,
        carbs: food.per100g.carbs,
        fat: food.per100g.fat,
      },
    ];
  });

  const programs: HomeProgramSample[] = PROGRAM_SAMPLE_SLUGS.flatMap((slug) => {
    const prog = WORKOUT_PROGRAMS.find((p) => p.slug === slug);
    if (!prog) return []; // curated slug retired → drift test flags it
    return [
      {
        slug: prog.slug,
        nameAr: prog.nameAr,
        nameEn: prog.nameEn,
        levelLabelAr: PROGRAM_LEVEL_LABELS[prog.level].ar,
        levelLabelEn: PROGRAM_LEVEL_LABELS[prog.level].en,
        levelColor: PROGRAM_LEVEL_LABELS[prog.level].color,
        locationLabelAr: LOCATION_LABELS[prog.location].ar,
        locationLabelEn: LOCATION_LABELS[prog.location].en,
        durationWeeks: prog.durationWeeks,
        daysPerWeek: prog.daysPerWeek,
        image: prog.image,
        imageAltAr: prog.imageAltAr,
        imageAltEn: prog.imageAltEn,
      },
    ];
  });

  return { exercises, foods, programs };
}
