/**
 * AI Meal Planner demo — §12.28 (owner directive 2026-09-12: «مءكور خطط
 * وجباتك بالذكاء الاصطناعي ورابط الى بمخطط الوجبات ( اين صفحة تخطيط
 * الوجبات بالذكاء الاصطناعي؟ مطلوب إنشاؤها مع سماح بالتجربة للجميع
 * بدون تعارض مع الاشتراكات )»).
 *
 * The pure layer behind /api/ai/meal-plan-demo and the /ai-meal-planner
 * pages: input validation, the generation prompt, and a STRICT response
 * validator. The route stays thin; everything here is unit-testable.
 *
 * LAWS (guarded in src/lib/__tests__/ai-meal-planner.test.ts):
 *   - TRIAL FOR EVERYONE, NO SUBSCRIPTION CONFLICT: one synchronous demo
 *     call on the free-chain — no ai_jobs queue, no client plan quota, no
 *     membership gate. The demo plan is ephemeral (never stored, never
 *     saved); persistence, weekly plans, and coach review remain exactly
 *     where the memberships put them (memberships.ts untouched).
 *   - COST CEILING: IP-keyed rate limit (3 / 24 h) — the route enforces
 *     it BEFORE any provider call.
 *   - HONEST SHAPE: the generated day must close within ±20% of the
 *     requested calories and every item must carry real grams — anything
 *     else is rejected (422) rather than displayed.
 */

import { DIET_SYSTEMS, getDietSystem } from "./diet-plan-matrix";

export const DEMO_CALORIE_MIN = 1200;
export const DEMO_CALORIE_MAX = 4000;
export const DEMO_NOTES_MAX = 200;
/** IP-keyed daily ceiling — 3 generations / 24 h per visitor. */
export const DEMO_RATE_LIMIT = { max: 3, windowMs: 24 * 60 * 60 * 1000 } as const;
/** The generated day must close within ±20% of the requested calories. */
export const DEMO_CALORIE_DRIFT = 0.2;

export interface DemoPlanRequest {
  calories: number;
  system: string;
  language: "en" | "ar";
  notes?: string;
}

export interface DemoMealItem {
  food: string;
  grams: number;
  kcal: number;
}

export interface DemoMeal {
  name: string;
  items: DemoMealItem[];
  kcal: number;
}

export interface DemoPlan {
  meals: DemoMeal[];
  kcal: number;
}

export type DemoRequestVerdict =
  | { ok: true; value: DemoPlanRequest }
  | { ok: false; error: string };

/** Validate the demo request (pure — mirrored server-side by the route). */
export function validateDemoRequest(input: {
  calories?: unknown;
  system?: unknown;
  language?: unknown;
  notes?: unknown;
}): DemoRequestVerdict {
  const calories = Number(input.calories);
  if (
    !Number.isFinite(calories) ||
    !Number.isInteger(calories) ||
    calories < DEMO_CALORIE_MIN ||
    calories > DEMO_CALORIE_MAX
  ) {
    return {
      ok: false,
      error: `calories must be an integer between ${DEMO_CALORIE_MIN} and ${DEMO_CALORIE_MAX}`,
    };
  }
  const system = String(input.system ?? "");
  if (!getDietSystem(system)) {
    return { ok: false, error: "system must be one of: balanced, high-protein, keto, vegetarian" };
  }
  const language = input.language === "ar" ? "ar" : input.language === "en" ? "en" : null;
  if (!language) {
    return { ok: false, error: "language must be 'en' or 'ar'" };
  }
  const notes =
    typeof input.notes === "string" && input.notes.trim()
      ? input.notes.trim().slice(0, DEMO_NOTES_MAX)
      : undefined;
  return { ok: true, value: { calories, system, language, notes } };
}

/**
 * The generation prompt — JSON-only, self-contained, and language-aware.
 * The Arabic prompt asks for an ARABIC-KITCHEN day (the matrix's food
 * world); the English prompt allows the broader international pantry.
 * Both pin the system's macro split so the model respects the site's
 * presets (the same splits the macro calculator uses).
 */
export function buildDemoPrompt(req: DemoPlanRequest): string {
  const sys = getDietSystem(req.system)!;
  const split = `${sys.split.protein}/${sys.split.carbs}/${sys.split.fat}`;
  const notesLine = req.notes ? `\nPreferences to respect: ${req.notes}` : "";
  if (req.language === "ar") {
    return [
      "أنت مخطط وجبات. ولّد خطة يوم كاملة (فطور، غداء، عشاء، سناك) من مطبخ عربي مألوف — فول، عدس، خبز بلدي، أرز، دجاج، سمك، زبادي، خضار — بلا مساحيق ولا مكملات.",
      `الهدف: ${req.calories} سعرة تقريباً بنظام ${sys.nameAr} (توزيع بروتين/كارب/دهون ${split} من السعرات).`,
      `اكتب أسماء الأصناف بالعربية، وكل صنف بغرامات محسوبة وسعراته المقدّرة.${notesLine}`,
      'أعد JSON فقط بهذا الشكل: {"meals":[{"name":"الفطور","items":[{"food":"…","grams":150,"kcal":230}]}]}',
      "قواعد صارمة: 3 إلى 5 وجبات؛ 2 إلى 6 أصناف لكل وجبة؛ كل صنف بين 20 و600 غرام؛ مجموع سعرات اليوم ضمن 20% من الهدف؛ لا نص خارج JSON.",
    ].join("\n");
  }
  return [
    "You are a meal planner. Generate a full day of food (breakfast, lunch, dinner, snack) from ordinary, affordable groceries — eggs, oats, rice, chicken, fish, legumes, dairy, vegetables — no powders, no supplements.",
    `Target: about ${req.calories} kcal on the ${sys.nameEn} system (protein/carbs/fat split ${split} of calories).`,
    `Write food names in English, every item with computed grams and its estimated kcal.${notesLine}`,
    'Return JSON only, exactly this shape: {"meals":[{"name":"Breakfast","items":[{"food":"...","grams":150,"kcal":230}]}]}',
    "Hard rules: 3 to 5 meals; 2 to 6 items per meal; every item 20 to 600 grams; the day total within 20% of target; no text outside the JSON.",
  ].join("\n");
}

export type DemoPlanVerdict =
  | { ok: true; value: DemoPlan }
  | { ok: false; error: string };

/**
 * STRICT response validator — a drifted or hallucinated payload is
 * REJECTED (the route answers 422) rather than shown to the visitor.
 * Totals are recomputed server-side from the items; model-provided
 * totals are never trusted.
 */
export function validateDemoPlan(
  raw: unknown,
  targetCalories: number,
): DemoPlanVerdict {
  const obj = raw as { meals?: unknown } | null;
  if (!obj || typeof obj !== "object" || !Array.isArray(obj.meals)) {
    return { ok: false, error: "model returned no meals array" };
  }
  const meals = obj.meals;
  if (meals.length < 3 || meals.length > 5) {
    return { ok: false, error: "plan must carry 3 to 5 meals" };
  }
  const out: DemoMeal[] = [];
  for (const m of meals) {
    const meal = m as { name?: unknown; items?: unknown };
    const name = typeof meal.name === "string" ? meal.name.trim() : "";
    if (!name || name.length > 60) {
      return { ok: false, error: "every meal needs a name (≤60 chars)" };
    }
    if (!Array.isArray(meal.items) || meal.items.length < 2 || meal.items.length > 6) {
      return { ok: false, error: `meal "${name}" must carry 2 to 6 items` };
    }
    const items: DemoMealItem[] = [];
    for (const it of meal.items) {
      const item = it as { food?: unknown; grams?: unknown; kcal?: unknown };
      const food = typeof item.food === "string" ? item.food.trim() : "";
      const grams = Number(item.grams);
      const kcal = Number(item.kcal);
      if (!food || food.length > 60) {
        return { ok: false, error: `item in "${name}" has no valid food name` };
      }
      if (!Number.isFinite(grams) || grams < 20 || grams > 600) {
        return { ok: false, error: `item "${food}" grams must be 20–600` };
      }
      if (!Number.isFinite(kcal) || kcal < 5 || kcal > 1500) {
        return { ok: false, error: `item "${food}" kcal must be 5–1500` };
      }
      items.push({ food, grams: Math.round(grams), kcal: Math.round(kcal) });
    }
    out.push({ name, items, kcal: items.reduce((s, i) => s + i.kcal, 0) });
  }
  const kcal = out.reduce((s, m) => s + m.kcal, 0);
  const drift = Math.abs(kcal - targetCalories) / targetCalories;
  if (drift > DEMO_CALORIE_DRIFT) {
    return {
      ok: false,
      error: `plan total ${kcal} kcal drifted beyond ±20% of ${targetCalories}`,
    };
  }
  return { ok: true, value: { meals: out, kcal } };
}

/** The four demo systems in the page's own language (AR preset names). */
export function demoSystemOptions(lang: "en" | "ar") {
  return DIET_SYSTEMS.map((s) => ({
    slug: s.slug,
    label: lang === "ar" ? s.nameAr : s.nameEn,
  }));
}
