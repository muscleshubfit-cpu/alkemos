/**
 * FITNESS-MATH — the single source for the calorie/macro math.
 *
 * HOME-EXPERIENCE-269 (owner directive 2026-09-24: «أعد التفكير في
 * الصفحة ككل — منتج حي لا صفحة عرض»): the homepage now embeds a REAL
 * working calorie+macro calculator (the "try the product right now"
 * moment). To keep the homepage mini-calculator and the /tools/calorie-
 * calculator app tool from ever drifting apart, the pure math lives
 * HERE — client-safe, zero side effects — and BOTH surfaces import it.
 *
 * The formulas are byte-identical to the tool that shipped since the
 * tools cluster launched (Mifflin-St Jeor BMR × activity factor ± goal
 * adjustment, then the 40/30/30 macro split). The tool page keeps its
 * own labels/copy; only the NUMBERS flow from here.
 *
 * Single-source law (AGENTS.md §12.8): if the formula ever changes, it
 * changes HERE and both surfaces follow in the same phase.
 */

export type FitnessGender = "male" | "female";
export type FitnessActivity =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type FitnessGoal = "lose" | "maintain" | "gain";

/** Activity multipliers (the standard TDEE factors). */
export const ACTIVITY_FACTORS: Record<FitnessActivity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export type CalorieTargets = {
  bmr: number;
  tdee: number;
  /** The goal-adjusted daily calorie target. */
  target: number;
  /** Macros in grams (40% carbs / 30% protein / 30% fat). */
  protein: number;
  carbs: number;
  fat: number;
};

/**
 * Pure calculation — throws nothing; callers validate inputs first.
 * Returns rounded integers exactly like the app tool always has.
 */
export function calculateCalorieTargets(input: {
  gender: FitnessGender;
  age: number;
  weightKg: number;
  heightCm: number;
  activity: FitnessActivity;
  goal: FitnessGoal;
}): CalorieTargets {
  const { gender, age, weightKg, heightCm, activity, goal } = input;

  // Mifflin-St Jeor Equation
  const bmr =
    gender === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const tdee = Math.round(bmr * ACTIVITY_FACTORS[activity]);

  let target = tdee;
  if (goal === "lose") target = Math.round(tdee - 500);
  if (goal === "gain") target = Math.round(tdee + 400);

  // Macros: 40% carbs, 30% protein, 30% fat
  const protein = Math.round((target * 0.3) / 4);
  const carbs = Math.round((target * 0.4) / 4);
  const fat = Math.round((target * 0.3) / 9);

  return { bmr: Math.round(bmr), tdee, target, protein, carbs, fat };
}

/** Input validation shared by both calculator surfaces. */
export function isValidCalculatorInput(
  age: number,
  weightKg: number,
  heightCm: number,
): boolean {
  return (
    Number.isFinite(age) &&
    Number.isFinite(weightKg) &&
    Number.isFinite(heightCm) &&
    age > 0 &&
    weightKg > 0 &&
    heightCm > 0
  );
}
