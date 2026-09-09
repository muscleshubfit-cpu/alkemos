/**
 * EVO nutrition learning (EVO-4 — W4 of docs/EVO-MASTER-PLAN.md, E1+E2+E3).
 *
 * OWNER DECISION (163.1, docs/EVO-MASTER-PLAN.md §7.3): «نعم يتعلم من كل
 * شيء» — approved coach/admin plans, user meal-planner plans, and swap
 * behavior feed PLATFORM-LEVEL knowledge that steers plan generation.
 * Everything here is AGGREGATE and fully anonymized: no person names, no
 * free-text plan prose, no per-user rows ever leave the aggregator.
 *
 * HONEST ENGINEERING (W4 header law): provider model weights are frozen
 * (three-provider law) — the "learning" implemented here is retrieval +
 * aggregation + feedback, which is what actually moves plan quality.
 *
 * PURE + CLIENT-SAFE: no DOM, no fetch, no env, no Supabase — the weekly
 * runner (evo-learning-runner.ts) and the prompt injectors are thin
 * wrappers. Same posture as evo-memory.ts / evo-followup.ts so every rule
 * here is unit-testable in isolation.
 *
 * EXTRACTION SHAPES SUPPORTED (both real plan JSON shapes on the platform):
 *  - plans/external_plans content (plan-generator.ts NutritionPlanContent):
 *      meals[].items[].food + amount + calories (+ meal_alternatives)
 *  - meal_plans plan_data (save-meal-plan route):
 *      meals[].items[].name + grams + per100g{calories,...}
 * Row-level totals (meal_plans.total_*) are passed through `totals` by the
 * caller — plan_data itself carries no totals.
 */

import { normalizeForMemory } from "@/lib/evo-memory";

/* ─────────────────────────────── constants ─────────────────────────────── */

/** Goal classes for aggregation keys (stable domain — 0080 docs). */
export type GoalClass = "fat-loss" | "muscle-gain" | "maintain";

/** All bucket names allowed by migration 0080's check constraint. */
export const EVO_PATTERN_BUCKETS = [
  "calories_by_goal",
  "macros_by_goal",
  "meal_count",
  "food_frequency",
  "exemplar",
  "swap_volume",
  "swap_removed",
  "swap_added",
] as const;
export type EvoPatternBucket = (typeof EVO_PATTERN_BUCKETS)[number];

/**
 * Injection thresholds (honesty floor): a bucket with fewer contributing
 * plans is WITHHELD from the prompt — presenting noise as knowledge would
 * violate the no-fabrication posture.
 */
export const EVO_MIN_GOAL_SAMPLE = 3;
export const EVO_MIN_FOOD_PLANS = 3;
/** Top-N foods injected from food_frequency (token hygiene). */
export const EVO_FOOD_TOP_INJECT = 12;
/** Top-N foods injected from swap_removed / swap_added. */
export const EVO_SWAP_TOP_INJECT = 12;
/** Honesty floor for one swap food: fewer than this many REAL swap events
 *  never earns a prompt line (a single swap is a mood, not a pattern). */
export const EVO_SWAP_MIN_COUNT = 3;
/** Exemplar skeleton: meals and items-per-meal caps (token hygiene). */
export const EVO_EXEMPLAR_MEALS_MAX = 7;
export const EVO_EXEMPLAR_ITEMS_MAX = 3;
/** Food-name length guards (normalized chars) — fragments match nothing. */
export const EVO_FOOD_MIN_LEN = 2;
/** Diff bounds per member-edit swap event. */
export const EVO_SWAP_DIFF_MAX = 40;
/** Aggregator input cap — the weekly runner never reads more plans. */
export const EVO_AGG_SOURCES_MAX = 500;

/** DB-mirror of one evo_nutrition_patterns row (migration 0080). */
export type EvoPatternRow = {
  bucket: string;
  key: string;
  payload: Record<string, unknown>;
  sample_size: number;
};

/** One source plan handed to the aggregator by the weekly runner. */
export type NutritionPlanSource = {
  origin: "plans" | "meal_plans" | "external_plans";
  /** True for plans rows with approved_at (coach/admin quality signal). */
  approved: boolean;
  /** Free survey/goal text — classified into the stable GoalClass domain. */
  goalText?: string | null;
  /** plans.content | external_plans.content | meal_plans.plan_data */
  content: unknown;
  /** meal_plans row totals (plan_data itself carries no totals). */
  totals?: { calories?: number | null; protein?: number | null; carbs?: number | null; fat?: number | null } | null;
};

/** E1 aggregator output — upsert-ready draft row (0080 shape). */
export type NutritionPatternDraft = {
  bucket: EvoPatternBucket;
  key: string;
  payload: Record<string, unknown>;
  sample_size: number;
};

/* ─────────────────────────── goal classification ───────────────────────── */

/**
 * Classify free goal text into the stable aggregation domain — SAME regex
 * families as plan-generator.computeNutritionTargets so the aggregator's
 * «خسارة وزن» and the generator's goal adjustment can never disagree.
 */
export function classifyGoal(goalText: string | null | undefined): GoalClass {
  const g = String(goalText || "").toLowerCase();
  if (/weight.?loss|lose|fat loss|تخفيس|تنحيف|خسارة وزن|دهون/.test(g)) return "fat-loss";
  if (/muscle|gain|bulk|mass|ضخام|بناء عضل|زيادة وزن/.test(g)) return "muscle-gain";
  return "maintain";
}

/* ─────────────────────────── food-name utilities ───────────────────────── */

/**
 * Stable food-name key: same Arabic-orthography normalization family as
 * evo-memory (diacritics/alef/yaa/taa forms unified, digits → Latin) so
 * «بيض مسلوق» and «البيض المسلوق» aggregate together. Returns "" for
 * names that carry no signal (too short after normalization).
 */
export function normalizeFoodName(name: string): string {
  const n = normalizeForMemory(String(name || ""));
  if (n.length < EVO_FOOD_MIN_LEN) return "";
  // Strip the leading definite article — normalization fuses it into the
  // token («الأرز» → «الارز»), so a plain prefix strip is what unifies
  // «الارز» ≡ «ارز». Guarded to leave a real word behind.
  return n.replace(/^ال(?=\p{L}{2})/u, "").trim();
}

type RawItem = { food: string; calories: number | null };

function itemFromLoose(raw: unknown): RawItem | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const food = String(rec.food ?? rec.name ?? "").trim();
  if (!food) return null;
  const calRaw = rec.calories;
  let calories: number | null = null;
  if (calRaw !== undefined && calRaw !== null) {
    const n = Number(calRaw);
    if (Number.isFinite(n) && n > 0) calories = Math.round(n);
  }
  return { food, calories };
}

function pickMeals(content: unknown): unknown[] {
  if (!content || typeof content !== "object") return [];
  const meals = (content as Record<string, unknown>).meals;
  return Array.isArray(meals) ? meals : [];
}

/**
 * Extract the CHOSEN food items (main items only — meal_alternatives are
 * options the user may never take, so they must not pollute frequency)
 * from either supported plan shape.
 */
export function extractMealItems(content: unknown): RawItem[] {
  const out: RawItem[] = [];
  for (const meal of pickMeals(content)) {
    if (!meal || typeof meal !== "object") continue;
    const items = (meal as Record<string, unknown>).items;
    if (!Array.isArray(items)) continue;
    for (const raw of items) {
      const item = itemFromLoose(raw);
      if (item) out.push(item);
    }
  }
  return out;
}

export type NutritionNumbers = {
  dailyCalories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  mealCount: number | null;
};

function numField(rec: Record<string, unknown>, key: string): number | null {
  const n = Number(rec[key]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Extract plan-level numbers from either shape: structured content first
 * (daily_calories/macros), then the caller-supplied meal_plans row totals.
 * Returns nulls for anything absent — the aggregator never invents values.
 */
export function extractNutritionNumbers(
  content: unknown,
  totals?: NutritionPlanSource["totals"],
): NutritionNumbers {
  let dailyCalories: number | null = null;
  let protein: number | null = null;
  let carbs: number | null = null;
  let fat: number | null = null;
  if (content && typeof content === "object") {
    const rec = content as Record<string, unknown>;
    dailyCalories = numField(rec, "daily_calories");
    const macros = rec.macros;
    if (macros && typeof macros === "object") {
      const m = macros as Record<string, unknown>;
      protein = numField(m, "protein_g");
      carbs = numField(m, "carbs_g");
      fat = numField(m, "fat_g");
    }
  }
  // Row totals (meal_plans) fill gaps — they are computed by the save route,
  // not by a model, so they are honest numbers.
  if (totals) {
    dailyCalories ??= numField(totals as Record<string, unknown>, "calories");
    protein ??= numField(totals as Record<string, unknown>, "protein");
    carbs ??= numField(totals as Record<string, unknown>, "carbs");
    fat ??= numField(totals as Record<string, unknown>, "fat");
  }
  const meals = pickMeals(content).length;
  const mealCount = meals > 0 ? meals : null;
  return { dailyCalories, protein, carbs, fat, mealCount };
}

/* ───────────────────────────── E1 aggregation ──────────────────────────── */

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round(nums.reduce((s, n) => s + n, 0) / nums.length);
}

/**
 * E1 — deterministic LLM-free aggregation (zero cost, master plan §4 W4):
 * calorie/macro distributions by goal class, common meal counts, recurring
 * food frequency (deduped per plan so one plan listing an item 5× counts
 * once). Fully anonymized by construction — only numbers and food names.
 */
export function aggregateNutritionPatterns(
  sources: readonly NutritionPlanSource[],
): NutritionPatternDraft[] {
  const drafts: NutritionPatternDraft[] = [];

  type GoalAgg = {
    count: number;
    calories: number[];
    protein: number[];
    carbs: number[];
    fat: number[];
  };
  const goals = new Map<GoalClass, GoalAgg>();
  const mealCounts = new Map<number, number>();
  const foods = new Map<string, { plans: Set<number>; display: Map<string, number> }>();

  const input = sources.slice(0, EVO_AGG_SOURCES_MAX);
  input.forEach((src, index) => {
    const nums = extractNutritionNumbers(src.content, src.totals);
    // UNKNOWN-GOAL GUARD: sources without a real goal text (e.g. imported
    // external plans, or a plan whose client never filled the fitness
    // survey) join meal_count / food_frequency / exemplar but NEVER the
    // goal-keyed buckets — an unknown goal is not «maintain».
    const goalText = String(src.goalText ?? "").trim();
    if (goalText) {
      const goal = classifyGoal(goalText);
      const agg = goals.get(goal) ?? { count: 0, calories: [], protein: [], carbs: [], fat: [] };
      if (nums.dailyCalories !== null) agg.calories.push(nums.dailyCalories);
      if (nums.protein !== null) agg.protein.push(nums.protein);
      if (nums.carbs !== null) agg.carbs.push(nums.carbs);
      if (nums.fat !== null) agg.fat.push(nums.fat);
      // A plan contributes to the goal bucket when it carries ANY usable
      // number (calories or a macro row) — plans with nothing are not counted.
      if (nums.dailyCalories !== null || nums.protein !== null) agg.count += 1;
      goals.set(goal, agg);
    }

    if (nums.mealCount !== null) {
      mealCounts.set(nums.mealCount, (mealCounts.get(nums.mealCount) ?? 0) + 1);
    }

    const seen = new Set<string>();
    for (const item of extractMealItems(src.content)) {
      const key = normalizeFoodName(item.food);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const entry = foods.get(key) ?? { plans: new Set<number>(), display: new Map<string, number>() };
      entry.plans.add(index);
      const raw = String(item.food).trim();
      entry.display.set(raw, (entry.display.get(raw) ?? 0) + 1);
      foods.set(key, entry);
    }
  });

  // calories_by_goal + macros_by_goal — withheld below the honesty floor.
  for (const [goal, agg] of goals) {
    if (agg.count >= EVO_MIN_GOAL_SAMPLE && agg.calories.length >= EVO_MIN_GOAL_SAMPLE) {
      drafts.push({
        bucket: "calories_by_goal",
        key: goal,
        payload: { count: agg.count, avg: avg(agg.calories), min: Math.min(...agg.calories), max: Math.max(...agg.calories) },
        sample_size: agg.count,
      });
    }
    if (agg.count >= EVO_MIN_GOAL_SAMPLE && agg.protein.length >= EVO_MIN_GOAL_SAMPLE) {
      drafts.push({
        bucket: "macros_by_goal",
        key: goal,
        payload: { count: agg.count, avg_protein: avg(agg.protein), avg_carbs: avg(agg.carbs), avg_fat: avg(agg.fat) },
        sample_size: agg.count,
      });
    }
  }

  for (const [count, plans] of mealCounts) {
    drafts.push({ bucket: "meal_count", key: String(count), payload: { count: plans }, sample_size: plans });
  }

  for (const [key, entry] of foods) {
    if (entry.plans.size < EVO_MIN_FOOD_PLANS) continue;
    // Display form = the most frequent raw spelling of this normalized food.
    let display = key;
    let best = -1;
    for (const [raw, n] of entry.display) {
      if (n > best) {
        best = n;
        display = raw;
      }
    }
    drafts.push({
      bucket: "food_frequency",
      key,
      payload: { plans: entry.plans.size, display },
      sample_size: entry.plans.size,
    });
  }

  return drafts;
}

/* ───────────────────────────── E2 exemplar ─────────────────────────────── */

export type ExemplarSkeleton = {
  daily_calories: number;
  macros: { protein_g: number; carbs_g: number; fat_g: number };
  meals: Array<{
    name: string;
    total_calories: number | null;
    items: Array<{ food: string; amount?: string; calories?: number }>;
  }>;
};

/**
 * E2 — deterministic exemplar extraction ("استخلاص رخيص" at its cheapest:
 * zero LLM, zero cost, zero PII risk). STRUCTURED fields only — overview,
 * notes, titles and any free text never enter, so no person name can leak
 * by construction. The result is the anonymized few-shot skeleton injected
 * as a structure reference (PHASE 62 no-copy law still forbids copying it).
 */
export function buildExemplarSkeleton(content: unknown): ExemplarSkeleton | null {
  if (!content || typeof content === "object") {
    const rec = content as Record<string, unknown> | null;
    const dailyCalories = rec ? numField(rec, "daily_calories") : null;
    const macrosRec = rec?.macros;
    const meals = pickMeals(content);
    if (!dailyCalories || !macrosRec || typeof macrosRec !== "object" || meals.length === 0) return null;
    const m = macrosRec as Record<string, unknown>;
    const protein = numField(m, "protein_g");
    const carbs = numField(m, "carbs_g");
    const fat = numField(m, "fat_g");
    if (protein === null || carbs === null || fat === null) return null;

    const skeletonMeals: ExemplarSkeleton["meals"] = [];
    for (const meal of meals.slice(0, EVO_EXEMPLAR_MEALS_MAX)) {
      if (!meal || typeof meal !== "object") continue;
      const mealRec = meal as Record<string, unknown>;
      const name = String(mealRec.name ?? "").trim();
      if (!name) continue;
      const totalCals = numField(mealRec, "total_calories");
      const items: ExemplarSkeleton["meals"][number]["items"] = [];
      const rawItems = Array.isArray(mealRec.items) ? mealRec.items : [];
      for (const raw of rawItems.slice(0, EVO_EXEMPLAR_ITEMS_MAX)) {
        const item = itemFromLoose(raw);
        if (!item) continue;
        const itemRec = (raw ?? {}) as Record<string, unknown>;
        const amount = typeof itemRec.amount === "string" ? itemRec.amount.trim() : undefined;
        items.push({
          food: item.food,
          ...(amount ? { amount } : {}),
          ...(item.calories !== null ? { calories: item.calories } : {}),
        });
      }
      if (items.length === 0) continue;
      skeletonMeals.push({
        name,
        total_calories: totalCals,
        items,
      });
    }
    if (skeletonMeals.length === 0) return null;
    return {
      daily_calories: dailyCalories,
      macros: { protein_g: protein, carbs_g: carbs, fat_g: fat },
      meals: skeletonMeals,
    };
  }
  return null;
}

/**
 * E2 picker — pick the exemplar source. Score: approved coach/admin plans
 * outrank user plans (approval is the platform's quality signal), then
 * structure completeness (more skeleton-bearing meals), then recency
 * (earlier in the caller's newest-first list wins ties).
 */
export function pickExemplarSource(
  sources: readonly NutritionPlanSource[],
): NutritionPlanSource | null {
  let bestSource: NutritionPlanSource | null = null;
  let bestScore = -1;
  const candidates = sources.slice(0, EVO_AGG_SOURCES_MAX);
  for (let index = 0; index < candidates.length; index++) {
    const source = candidates[index];
    const skeleton = buildExemplarSkeleton(source.content);
    if (!skeleton) continue;
    const recency = Math.max(0, 50 - index); // newest-first list ordering
    const completeness = Math.min(skeleton.meals.length, EVO_EXEMPLAR_MEALS_MAX);
    const approval = source.approved ? 100 : 0;
    const origin = source.origin === "plans" ? 10 : source.origin === "external_plans" ? 5 : 0;
    const score = approval + origin + completeness * 5 + recency;
    if (score > bestScore) {
      bestScore = score;
      bestSource = source;
    }
  }
  return bestSource;
}

/* ───────────────────────────── E3 swap learning ────────────────────────── */

export type FoodNameRef = { key: string; display: string };
export type FoodDiff = { removed: FoodNameRef[]; added: FoodNameRef[] };

/**
 * E3 — real food-identity swap learning. plan_swaps records only the swap
 * TYPE (meal/exercise — documented limit), but the member-edit swap flow
 * persists the mutated plan content, so diffing old vs new content yields
 * exactly which foods left and which entered the user's real plan.
 * Normalized keys dedupe orthography variants; the first raw spelling is
 * kept as the display form. Bounded — a noisy swap never floods the
 * buckets.
 */
export function diffFoodNames(oldContent: unknown, newContent: unknown): FoodDiff {
  const collect = (content: unknown): Map<string, string> => {
    const map = new Map<string, string>(); // key → display (first raw form wins)
    for (const item of extractMealItems(content)) {
      const key = normalizeFoodName(item.food);
      if (key && !map.has(key)) map.set(key, String(item.food).trim());
    }
    return map;
  };
  const oldMap = collect(oldContent);
  const newMap = collect(newContent);
  const removed = [...oldMap.entries()]
    .filter(([k]) => !newMap.has(k))
    .map(([key, display]) => ({ key, display }))
    .slice(0, EVO_SWAP_DIFF_MAX);
  const added = [...newMap.entries()]
    .filter(([k]) => !oldMap.has(k))
    .map(([key, display]) => ({ key, display }))
    .slice(0, EVO_SWAP_DIFF_MAX);
  return { removed, added };
}

/** Payload shape of the swap_removed / swap_added buckets (the caller
 *  spreads `display` — the raw food spelling — on top of this merge). */
export type SwapBucketPayload = { count: number; last_seen: string };

/**
 * Pure read-modify-write merge for one swap increment (service-role caller
 * stamps `now`). Returns a fresh payload — the DB row update is the
 * caller's job (upsert on bucket+key).
 */
export function mergeSwapPayload(
  existing: Record<string, unknown> | null | undefined,
  foods: readonly string[],
  now: Date = new Date(),
): SwapBucketPayload {
  const prevCount = Number((existing ?? {}).count);
  const base = Number.isFinite(prevCount) && prevCount > 0 ? prevCount : 0;
  return {
    count: base + foods.length,
    last_seen: now.toISOString(),
  };
}

/* ──────────────────────────── prompt injection ─────────────────────────── */

function arNum(n: number): string {
  return n.toLocaleString("en-US");
}

const GOAL_AR: Record<string, string> = {
  "fat-loss": "خسارة الوزن",
  "muscle-gain": "بناء العضل",
  maintain: "الحفاظ على الوزن",
};

/**
 * Build the «معرفة المنصة الغذائية» prompt block (E1+E2) from pattern rows.
 * Honesty rules: thin samples (below the floor) are withheld; the block
 * says the numbers are anonymized platform aggregates; the exemplar is
 * labeled a STRUCTURE reference (the PHASE 62 no-copy law stays in force).
 * Returns "" when there is nothing worth injecting (never an empty section).
 */
export function buildPlatformKnowledgeBlock(rows: readonly EvoPatternRow[]): string {
  const calories = rows.filter((r) => r.bucket === "calories_by_goal");
  const macros = rows.filter((r) => r.bucket === "macros_by_goal");
  const mealCounts = rows.filter((r) => r.bucket === "meal_count");
  const foods = rows
    .filter((r) => r.bucket === "food_frequency")
    .sort((a, b) => (Number(b.payload.plans) || 0) - (Number(a.payload.plans) || 0))
    .slice(0, EVO_FOOD_TOP_INJECT);
  const exemplar = rows.find((r) => r.bucket === "exemplar");

  const lines: string[] = [];
  if (calories.length > 0 || macros.length > 0) {
    lines.push("أرقام مجمعة مجهولة الهوية من خطط حقيقية على منصة Alkemos (راجعها كمرجع اتجاه لا كقاعدة صارمة — أرقام العميل الرسمية أعلاه تبقى الحاكمة):");
    for (const row of calories) {
      const { avg: mean, min, max } = row.payload as { avg?: number; min?: number; max?: number };
      if (typeof mean !== "number" || typeof min !== "number" || typeof max !== "number") continue;
      lines.push(`- ${GOAL_AR[row.key] ?? row.key}: متوسط ${arNum(mean)} سعرة يوميًا (نطاق شائع ${arNum(min)}–${arNum(max)} من ${row.sample_size} خطة)`);
    }
    for (const row of macros) {
      const { avg_protein, avg_carbs, avg_fat } = row.payload as { avg_protein?: number; avg_carbs?: number; avg_fat?: number };
      if (typeof avg_protein !== "number" || typeof avg_carbs !== "number" || typeof avg_fat !== "number") continue;
      lines.push(`- ${GOAL_AR[row.key] ?? row.key} (ماكروز شائعة): بروتين ${arNum(avg_protein)}جم / كارب ${arNum(avg_carbs)}جم / دهون ${arNum(avg_fat)}جم`);
    }
  }
  if (mealCounts.length > 0) {
    const top = mealCounts
      .sort((a, b) => (Number(b.payload.count) || 0) - (Number(a.payload.count) || 0))
      .slice(0, 3)
      .map((r) => `${r.key} وجبات`);
    if (top.length > 0) lines.push(`- عدد الوجبات الأكثر شيوعًا في الخطط الحقيقية: ${top.join(" · ")}`);
  }
  if (foods.length >= 3) {
    const list = foods
      .map((r) => String((r.payload as { display?: string }).display ?? r.key))
      .join("، ");
    lines.push(`- أصناف متكررة في خطط المنصة (استخدمها كأساس مألوف مع التنويع): ${list}`);
  }
  if (exemplar && exemplar.payload && typeof exemplar.payload === "object") {
    const skeleton = exemplar.payload as { daily_calories?: number; meals?: unknown };
    if (typeof skeleton.daily_calories === "number" && Array.isArray(skeleton.meals) && skeleton.meals.length > 0) {
      lines.push(
        `هيكل مرجعي (الشكل فقط — ممنوع نسخ أصنافه حرفيًا): ${JSON.stringify({
          daily_calories: skeleton.daily_calories,
          meals: skeleton.meals,
        })}`,
      );
    }
  }

  if (lines.length === 0) return "";
  return `\n\n📊 معرفة المنصة الغذائية (مجمّعة مجهولة الهوية من خطط حقيقية):\n${lines.join("\n")}`;
}

/**
 * Build the E3 swap-learning prompt block from swap pattern rows:
 * most-removed foods enter a «reduce suggestions» list, most-added foods
 * (the replacements users actually accepted) enter a prefer list, and the
 * weekly swap volume gives the model a feel for how often real users
 * adjust their plans. Returns "" when there is no signal yet.
 */
export function buildSwapLearningBlock(rows: readonly EvoPatternRow[]): string {
  const byCountDesc = (a: EvoPatternRow, b: EvoPatternRow) =>
    (Number(b.payload.count) || 0) - (Number(a.payload.count) || 0);
  const overFloor = (r: EvoPatternRow) =>
    (Number(r.payload.count) || 0) >= EVO_SWAP_MIN_COUNT;
  const removed = rows.filter((r) => r.bucket === "swap_removed" && overFloor(r)).sort(byCountDesc).slice(0, EVO_SWAP_TOP_INJECT);
  const added = rows.filter((r) => r.bucket === "swap_added" && overFloor(r)).sort(byCountDesc).slice(0, EVO_SWAP_TOP_INJECT);
  const volume = rows.filter((r) => r.bucket === "swap_volume");

  const lines: string[] = [];
  if (removed.length >= 1) {
    const list = removed
      .map((r) => `${String((r.payload as { display?: string }).display ?? r.key)} (${Number((r.payload as { count?: number }).count) || 0})`)
      .join("، ");
    lines.push(`- أصناف يستبدلها المستخدمون كثيرًا — قلّل الاعتماد عليها واقترح بدائل أذكى مباشرة: ${list}`);
  }
  if (added.length >= 1) {
    const list = added
      .map((r) => String((r.payload as { display?: string }).display ?? r.key))
      .join("، ");
    lines.push(`- بدائل يختارها المستخدمون فعلًا عند الاستبدال — يُفضّل الاقتراح بها أولًا: ${list}`);
  }
  for (const row of volume) {
    const { last_week, total } = row.payload as { last_week?: number; total?: number };
    if (typeof last_week === "number" && last_week > 0) {
      lines.push(`- استبدالات ${row.key === "meal" ? "الوجبات" : "التمارين"} المسجلة أسبوعيًا على المنصة: ${arNum(last_week)}${typeof total === "number" ? ` (الإجمالي ${arNum(total)})` : ""}`);
    }
  }

  if (lines.length === 0) return "";
  return `\n\n🔁 تعلم من سلوك الاستبدال الحقيقي (مجهول الهوية):\n${lines.join("\n")}`;
}
