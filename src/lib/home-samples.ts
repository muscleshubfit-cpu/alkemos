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
import { DIET_LEVELS, DIET_SYSTEMS } from "@/lib/diet-plan-matrix";

// ─── Curated real slugs (verified against the arrays by the drift test) ───
//
// HOME-EXPERIENCE-269: the curation grew from 8 (one per family) to 15
// (2 per family + 3 for legs) because the homepage LIBRARY TAB is now
// INTERACTIVE — the visitor taps a muscle group and the real sample
// cards swap in-page. Two+ real entries per family make the interaction
// honest (a filter with one result is a dead filter). Every slug is
// hand-picked for contrast: a barbell/machine staple + a beginner
// home-friendly movement, with level variety where the library allows.

export const EXERCISE_SAMPLE_SLUGS = [
  // chest — the barbell staple + the home classic
  "barbell-bench-press-medium-grip",
  "pushups",
  "incline-dumbbell-press",
  // back — bodyweight + barbell
  "pullups",
  "bent-over-barbell-row",
  // legs — barbell + home dumbbell + posterior chain
  "barbell-squat",
  "goblet-squat",
  "romanian-deadlift",
  // shoulders — dumbbell press + the isolation classic
  "dumbbell-shoulder-press",
  "side-lateral-raise",
  // biceps — barbell + dumbbell hammer
  "barbell-curl",
  "alternate-hammer-curl",
  // triceps — cable + bodyweight
  "triceps-pushdown",
  "bench-dips",
  // core — the plank staple + the advanced hang
  "plank",
  "hanging-leg-raise",
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
  /** The raw category slug ("chest"… ) — drives the homepage interactive
   *  muscle-group filter (HOME-EXPERIENCE-269). Client-safe: it is a plain
   *  string, never a library import. */
  categorySlug: string;
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

/** One ready-made diet system (HOME-REFINE-270: the homepage diet-plan
 *  library carousel). The split is the REAL matrix split (single source:
 *  diet-plan-matrix.ts DIET_SYSTEMS) — the slice keeps the 31KB matrix
 *  module server-side (the bundle law pattern). */
export type HomeDietSystemSample = {
  slug: string;
  nameAr: string;
  nameEn: string;
  /** Real macro split (percent of calories) from DIET_SYSTEMS. */
  split: { protein: number; carbs: number; fat: number };
  lineAr: string;
  lineEn: string;
};

export type HomeSamples = {
  exercises: HomeExerciseSample[];
  foods: HomeFoodSample[];
  programs: HomeProgramSample[];
  dietSystems: HomeDietSystemSample[];
  /** Real calorie levels of the matrix (1200→3000) — drives the honest
   *  count line (levels × systems = 24 ready plans). */
  dietLevels: number[];
};

// The one-honest-line pair per system — AR mirrors the hub's SYSTEM_LINES
// (diet-plan hub page); EN is the independent native pair (the §12.19
// «no literal translation» law, applied in both directions).
const DIET_SYSTEM_LINES: Record<
  string,
  { lineAr: string; lineEn: string }
> = {
  balanced: {
    lineAr: "نقطة البداية الآمنة للجميع — توزيع 30/40/30 من السعرات.",
    lineEn: "The safe starting point for everyone — a 30/40/30 calorie split.",
  },
  "high-protein": {
    lineAr: "ذراع مرحلة الخسارة وبناء العضلة — 45/35/20 ببروتين أعلى.",
    lineEn: "Built for fat loss and muscle building — 45/35/20 with more protein.",
  },
  keto: {
    lineAr: "دهون عالية وكربوهيدرات شبه معدومة — 25/5/70.",
    lineEn: "High fat, near-zero carbs — 25/5/70.",
  },
  vegetarian: {
    lineAr: "بقول وحبوب وألبان وبيض — 25/50/25.",
    lineEn: "Legumes, grains, dairy, and eggs — 25/50/25.",
  },
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
        categorySlug: ex.category,
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

  // The diet-plan matrix is complete by construction (not curated slugs):
  // every system ships with its REAL split + one honest line. The levels
  // ride along so the homepage count line derives (6 × 4 = 24).
  const dietSystems: HomeDietSystemSample[] = DIET_SYSTEMS.map((s) => ({
    slug: s.slug,
    nameAr: s.nameAr,
    nameEn: s.nameEn,
    split: { protein: s.split.protein, carbs: s.split.carbs, fat: s.split.fat },
    lineAr: DIET_SYSTEM_LINES[s.slug]?.lineAr ?? "",
    lineEn: DIET_SYSTEM_LINES[s.slug]?.lineEn ?? "",
  }));

  return { exercises, foods, programs, dietSystems, dietLevels: [...DIET_LEVELS] };
}
