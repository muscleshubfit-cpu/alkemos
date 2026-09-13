/**
 * EXERCISES-SHARED — the client-safe slice of the exercise library.
 *
 * BUNDLE LAW (performance audit 2026-09-05): src/lib/exercises.ts is a
 * 1.6MB / 7,021-line data file (868 exercises). Any client component
 * importing it ships the whole array to the browser — it was silently
 * bloating the homepage, /exercises, and every plan/program view.
 *
 * This module contains ONLY types, label constants, and precomputed
 * COUNTS — a few hundred bytes. Client components must import from
 * HERE (or receive data via props from a server component). The array
 * itself (EXERCISES, getExerciseBySlug, getRelatedExercises,
 * filterExercises) stays in exercises.ts, imported ONLY by server code.
 *
 * The counts are verified against the real array by
 * src/lib/__tests__/library-counts.test.ts — the test fails if the data
 * file grows without these constants being updated.
 */

export type ExerciseCategory = "chest" | "back" | "shoulders" | "legs" | "biceps" | "triceps" | "core" | "cardio";
export type Equipment = "barbell" | "dumbbell" | "bodyweight" | "cable" | "machine" | "kettlebell" | "band" | "none";
export type Level = "beginner" | "intermediate" | "advanced";

export type Exercise = {
  slug: string; nameAr: string; nameEn: string;
  category: ExerciseCategory; equipment: Equipment; level: Level;
  primaryMuscles: string[]; secondaryMuscles: string[];
  instructionsAr: string[]; instructionsEn: string[];
  tipsAr: string[]; tipsEn: string[]; imageKey: string;
};

/** The minimal shape plan/program views need to render an exercise row. */
export type ExerciseMini = {
  slug: string;
  nameAr: string;
  nameEn: string;
  category: ExerciseCategory;
  imageKey: string;
};

export const EQUIPMENT_LABELS: Record<Equipment, { ar: string; en: string }> = {
  barbell: { ar: "بار", en: "Barbell" },
  dumbbell: { ar: "دمبل", en: "Dumbbell" },
  bodyweight: { ar: "وزن الجسم", en: "Bodyweight" },
  cable: { ar: "كابل", en: "Cable" },
  machine: { ar: "ماكينة", en: "Machine" },
  kettlebell: { ar: "كيتل بيل", en: "Kettlebell" },
  band: { ar: "مطاط", en: "Resistance Band" },
  none: { ar: "بدون معدات", en: "No Equipment" },
};

export const LEVEL_LABELS: Record<Level, { ar: string; en: string; color: string }> = {
  beginner: { ar: "مبتدئ", en: "Beginner", color: "#34c759" },
  intermediate: { ar: "متوسط", en: "Intermediate", color: "#ff9500" },
  advanced: { ar: "متقدم", en: "Advanced", color: "#ff3b30" },
};

export const CATEGORY_LABELS: Record<ExerciseCategory, { ar: string; en: string; emoji: string; image: string }> = {
  chest: { ar: "صدر", en: "Chest", emoji: "💪", image: "/images/categories/exercises/chest.png" },
  back: { ar: "ظهر", en: "Back", emoji: "🔙", image: "/images/categories/exercises/back.png" },
  shoulders: { ar: "أكتاف", en: "Shoulders", emoji: "🏆", image: "/images/categories/exercises/shoulders.png" },
  legs: { ar: "أرجل", en: "Legs", emoji: "🦵", image: "/images/categories/exercises/legs.png" },
  biceps: { ar: "بايسبس", en: "Biceps", emoji: "💪", image: "/images/categories/exercises/biceps.png" },
  triceps: { ar: "ترايسبس", en: "Triceps", emoji: "💪", image: "/images/categories/exercises/triceps.png" },
  core: { ar: "بطن/كور", en: "Core", emoji: "🎯", image: "/images/categories/exercises/core.png" },
  cardio: { ar: "كارديو", en: "Cardio", emoji: "❤️", image: "/images/categories/exercises/cardio.png" },
};

/**
 * PHASE SEO-GEO-7 (2026-09-13) — Arabic muscle labels, the SINGLE source
 * for every surface that renders `primaryMuscles`/`secondaryMuscles`
 * (AR meta description, HowTo schema, detail-page chips, listing cards).
 * Before this map the raw English values ("Abs", "Chest"…) leaked into
 * Arabic prose (the live AR exercise description carried Latin mid-
 * sentence). Client-safe by design (a few hundred bytes) — lives HERE so
 * both server pages and client components import the same constant.
 * Terminology follows the platform's own vocabulary (hubs: البايسبس/
 * الترايسبس/الكور…) and the §12.39 transliteration glossary.
 */
export const MUSCLE_LABELS: Record<string, { ar: string; en: string }> = {
  Abductors: { ar: "المبعدة", en: "Abductors" },
  Abs: { ar: "البطن", en: "Abs" },
  Adductors: { ar: "الضامة", en: "Adductors" },
  Biceps: { ar: "البايسبس", en: "Biceps" },
  Calves: { ar: "السمانة", en: "Calves" },
  Chest: { ar: "الصدر", en: "Chest" },
  Forearms: { ar: "الساعدان", en: "Forearms" },
  Glutes: { ar: "الألوية", en: "Glutes" },
  Hamstrings: { ar: "الخلفية", en: "Hamstrings" },
  Lats: { ar: "اللات", en: "Lats" },
  "Lower Back": { ar: "أسفل الظهر", en: "Lower Back" },
  "Mid Back": { ar: "منتصف الظهر", en: "Mid Back" },
  Neck: { ar: "الرقبة", en: "Neck" },
  Quads: { ar: "الرباعية", en: "Quads" },
  Shoulders: { ar: "الأكتاف", en: "Shoulders" },
  Traps: { ar: "الترابيس", en: "Traps" },
  Triceps: { ar: "الترايسبس", en: "Triceps" },
};

/** Total exercises in the library — keep in sync with exercises.ts (test-enforced). */
export const EXERCISES_COUNT = 868;

/** Exercises per category — keep in sync with exercises.ts (test-enforced). */
export const EXERCISE_CATEGORY_COUNTS: Record<ExerciseCategory, number> = {
  chest: 84,
  back: 114,
  shoulders: 125,
  legs: 297,
  biceps: 78,
  triceps: 71,
  core: 99,
  cardio: 0,
};

/** Popular filter tag ids used by the public exercise list UI. */
export const POPULAR_TAGS = ["high-protein", "low-carb", "keto-friendly", "vegan", "good-for-cutting", "good-for-bulking"];
