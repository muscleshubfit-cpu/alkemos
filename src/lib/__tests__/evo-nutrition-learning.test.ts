import { describe, it, expect } from "vitest";
import {
  classifyGoal,
  normalizeFoodName,
  extractMealItems,
  extractNutritionNumbers,
  aggregateNutritionPatterns,
  buildExemplarSkeleton,
  pickExemplarSource,
  diffFoodNames,
  mergeSwapPayload,
  buildPlatformKnowledgeBlock,
  buildSwapLearningBlock,
  EVO_MIN_GOAL_SAMPLE,
  EVO_MIN_FOOD_PLANS,
  type NutritionPlanSource,
  type EvoPatternRow,
} from "@/lib/evo-nutrition-learning";

/**
 * EVO-4 (W4 E1+E2+E3) — anonymized platform nutrition learning, pure layer.
 * Laws under test:
 *   - HONESTY FLOOR: thin buckets are WITHHELD, never presented as knowledge;
 *   - ANONYMIZATION BY CONSTRUCTION: only structured fields (foods, numbers)
 *     enter aggregates/skeletons — free text can never leak a person name;
 *   - GOAL DOMAIN CONSISTENCY: classifyGoal uses the same regex families as
 *     plan-generator.computeNutritionTargets (fat-loss / muscle-gain);
 *   - BOTH REAL PLAN SHAPES are understood (plans content + meal_plans
 *     plan_data) and nothing is invented for missing numbers;
 *   - E3 swap learning: plan_swaps has no food identity, but the member-edit
 *     diff does — removed/added foods are normalized, deduped, bounded;
 *   - empty knowledge → "" (never an empty prompt section).
 */

const plansContent = (overrides: Record<string, unknown> = {}) => ({
  overview: "خطة العميل أحمد لتخفيس الوزن", // free text — must never leak
  daily_calories: 1600,
  macros: { protein_g: 120, carbs_g: 150, fat_g: 45 },
  meals: [
    {
      name: "الإفطار",
      total_calories: 500,
      items: [
        { food: "بيض مسلوق", amount: "3 بيضات", calories: 234 },
        { food: "خبز بلدي", amount: "½ رغيف", calories: 180 },
      ],
    },
    {
      name: "الغداء",
      total_calories: 700,
      items: [{ food: "صدر دجاج مشوي", amount: "150 جم", calories: 250 }],
    },
  ],
  ...overrides,
});

const mealPlannerData = {
  meals: [
    {
      name: "الوجبة الأولى",
      items: [
        { name: "شوفان", source: "local", grams: 70, per100g: { calories: 380, protein: 13, carbs: 60, fat: 7 } },
        { name: "حليب", source: "local", grams: 250, per100g: { calories: 60, protein: 3.2, carbs: 5, fat: 3 } },
      ],
    },
    {
      name: "الوجبة الثانية",
      items: [
        { name: "شوفان", source: "local", grams: 50, per100g: { calories: 380, protein: 13, carbs: 60, fat: 7 } },
      ],
    },
  ],
};

describe("classifyGoal — same families as computeNutritionTargets", () => {
  it("classifies loss goals in AR and EN", () => {
    expect(classifyGoal("تخفيس الوزن")).toBe("fat-loss");
    expect(classifyGoal("weight loss")).toBe("fat-loss");
    expect(classifyGoal("خسارة وزن ودهون")).toBe("fat-loss");
  });

  it("classifies gain goals in AR and EN", () => {
    expect(classifyGoal("بناء عضل")).toBe("muscle-gain");
    expect(classifyGoal("muscle gain")).toBe("muscle-gain");
    expect(classifyGoal("ضخام")).toBe("muscle-gain");
  });

  it("defaults to maintain for empty/unknown text", () => {
    expect(classifyGoal("")).toBe("maintain");
    expect(classifyGoal(null)).toBe("maintain");
    expect(classifyGoal("لياقة عامة")).toBe("maintain");
  });
});

describe("normalizeFoodName — Arabic-orthography stable keys", () => {
  it("unifies alef/taa-marbouta/definite-article variants", () => {
    expect(normalizeFoodName("الأرز")).toBe(normalizeFoodName("ارز"));
    expect(normalizeFoodName("بطاطس")).toBe(normalizeFoodName("البطاطس"));
  });

  it("drops empty/fragment names", () => {
    expect(normalizeFoodName("")).toBe("");
    expect(normalizeFoodName("ا")).toBe("");
    expect(normalizeFoodName("   ")).toBe("");
  });
});

describe("extractMealItems — both real plan shapes", () => {
  it("reads plans content (food/amount/calories)", () => {
    const items = extractMealItems(plansContent());
    expect(items).toHaveLength(3);
    expect(items[0]).toEqual({ food: "بيض مسلوق", calories: 234 });
  });

  it("reads meal_plans plan_data (name/grams/per100g)", () => {
    const items = extractMealItems(mealPlannerData);
    expect(items.map((i) => i.food)).toEqual(["شوفان", "حليب", "شوفان"]);
    expect(items.every((i) => i.calories === null)).toBe(true); // per-item calories live in per100g — row totals carry them
  });

  it("is defensive against garbage", () => {
    expect(extractMealItems(null)).toEqual([]);
    expect(extractMealItems("نص")).toEqual([]);
    expect(extractMealItems({ meals: [null, 5, { items: "لا" }] })).toEqual([]);
  });
});

describe("extractNutritionNumbers — nothing invented", () => {
  it("reads structured numbers from plans content", () => {
    const n = extractNutritionNumbers(plansContent());
    expect(n).toEqual({ dailyCalories: 1600, protein: 120, carbs: 150, fat: 45, mealCount: 2 });
  });

  it("fills gaps from meal_plans row totals", () => {
    const n = extractNutritionNumbers(mealPlannerData, { calories: 920, protein: 55, carbs: 120, fat: 22 });
    expect(n.dailyCalories).toBe(920);
    expect(n.protein).toBe(55);
    expect(n.mealCount).toBe(2);
  });

  it("returns nulls for a plan without numbers", () => {
    const n = extractNutritionNumbers({ meals: [] });
    expect(n.dailyCalories).toBeNull();
    expect(n.mealCount).toBeNull();
  });
});

describe("aggregateNutritionPatterns (E1) — honesty floor + dedup", () => {
  const fatLossSources: NutritionPlanSource[] = Array.from({ length: EVO_MIN_GOAL_SAMPLE }, () => ({
    origin: "plans" as const,
    approved: true,
    goalText: "تخفيس",
    content: plansContent(),
  }));

  it("produces goal buckets once the floor is met", () => {
    const drafts = aggregateNutritionPatterns(fatLossSources);
    const calories = drafts.find((d) => d.bucket === "calories_by_goal" && d.key === "fat-loss");
    const macros = drafts.find((d) => d.bucket === "macros_by_goal" && d.key === "fat-loss");
    expect(calories).toBeTruthy();
    expect(calories?.sample_size).toBe(EVO_MIN_GOAL_SAMPLE);
    expect((calories?.payload as { avg?: number }).avg).toBe(1600);
    expect(macros).toBeTruthy();
  });

  it("withholds goal buckets below the floor (noise ≠ knowledge)", () => {
    const drafts = aggregateNutritionPatterns(fatLossSources.slice(0, EVO_MIN_GOAL_SAMPLE - 1));
    expect(drafts.find((d) => d.bucket === "calories_by_goal")).toBeUndefined();
    expect(drafts.find((d) => d.bucket === "macros_by_goal")).toBeUndefined();
  });

  it("aggregates meal_count and dedupes food frequency per plan", () => {
    const drafts = aggregateNutritionPatterns([
      ...fatLossSources,
      { origin: "meal_plans", approved: false, goalText: "بناء عضل", content: mealPlannerData },
    ]);
    const twoMeals = drafts.find((d) => d.bucket === "meal_count" && d.key === "2");
    expect(twoMeals?.sample_size).toBe(4); // 3 plans + 1 meal-planner plan

    const oats = drafts.find((d) => d.bucket === "food_frequency" && d.key === normalizeFoodName("شوفان"));
    expect(oats).toBeUndefined(); // appears in only 1 plan → below EVO_MIN_FOOD_PLANS

    const eggs = drafts.find((d) => d.bucket === "food_frequency" && d.key === normalizeFoodName("بيض مسلوق"));
    expect(eggs?.sample_size).toBe(3);
    expect((eggs?.payload as { display?: string }).display).toBe("بيض مسلوق");
  });

  it("keeps the aggregation fully anonymous even with names in free text", () => {
    const drafts = aggregateNutritionPatterns(fatLossSources);
    for (const d of drafts) {
      expect(JSON.stringify(d)).not.toContain("أحمد");
    }
  });

  it("handles empty input without throwing", () => {
    expect(aggregateNutritionPatterns([])).toEqual([]);
  });
});

describe("buildExemplarSkeleton (E2) — structured fields only", () => {
  it("builds a compact anonymized skeleton", () => {
    const skeleton = buildExemplarSkeleton(plansContent());
    expect(skeleton?.daily_calories).toBe(1600);
    expect(skeleton?.meals).toHaveLength(2);
    expect(skeleton?.meals[0]?.items[0]?.food).toBe("بيض مسلوق");
    expect(JSON.stringify(skeleton)).not.toContain("أحمد"); // overview never enters
    expect(JSON.stringify(skeleton)).not.toContain("overview");
  });

  it("returns null for plans without a full macro row", () => {
    expect(buildExemplarSkeleton({ daily_calories: 1500, macros: {}, meals: [] })).toBeNull();
    expect(buildExemplarSkeleton(null)).toBeNull();
  });
});

describe("pickExemplarSource (E2 picker)", () => {
  it("prefers approved plans and richer structure", () => {
    const userPlan: NutritionPlanSource = { origin: "meal_plans", approved: false, content: mealPlannerData };
    const approvedPlan: NutritionPlanSource = { origin: "plans", approved: true, content: plansContent() };
    expect(pickExemplarSource([userPlan, approvedPlan])).toBe(approvedPlan);
  });

  it("returns null when nothing qualifies", () => {
    expect(pickExemplarSource([{ origin: "plans", approved: true, content: {} }])).toBeNull();
    expect(pickExemplarSource([])).toBeNull();
  });
});

describe("diffFoodNames (E3) — real swap identity", () => {
  it("detects removed and added foods across a swap", () => {
    const old = plansContent();
    const fresh = plansContent({
      meals: [
        {
          name: "الإفطار",
          items: [
            { food: "فول مدمس", amount: "200 جم", calories: 230 },
            { food: "خبز بلدي", amount: "½ رغيف", calories: 180 },
          ],
        },
        { name: "الغداء", items: [{ food: "سمك مشوي", amount: "150 جم", calories: 220 }] },
      ],
    });
    const diff = diffFoodNames(old, fresh);
    const removedKeys = diff.removed.map((r) => r.key);
    const addedKeys = diff.added.map((r) => r.key);
    expect(removedKeys).toContain(normalizeFoodName("بيض مسلوق"));
    expect(removedKeys).toContain(normalizeFoodName("صدر دجاج مشوي"));
    expect(addedKeys).toContain(normalizeFoodName("فول مدمس"));
    expect(addedKeys).toContain(normalizeFoodName("سمك مشوي"));
    expect(removedKeys).not.toContain(normalizeFoodName("خبز بلدي")); // kept
  });

  it("carries the raw spelling as the display form", () => {
    const fresh = plansContent({
      meals: [{ name: "الإفطار", items: [{ food: "فول مدمس", amount: "200 جم", calories: 230 }] }],
    });
    const diff = diffFoodNames(plansContent(), fresh);
    const added = diff.added.find((r) => r.key === normalizeFoodName("فول مدمس"));
    expect(added?.display).toBe("فول مدمس");
  });

  it("normalizes orthography so variants match", () => {
    const diff = diffFoodNames(plansContent(), plansContent());
    expect(diff.removed).toEqual([]);
    expect(diff.added).toEqual([]);
  });

  it("is defensive against garbage inputs", () => {
    expect(diffFoodNames(null, "نص")).toEqual({ removed: [], added: [] });
  });

  it("never leaks free-text overview content into the diff", () => {
    const diff = diffFoodNames(plansContent(), plansContent());
    for (const ref of [...diff.removed, ...diff.added]) {
      expect(ref.display).not.toContain("أحمد");
    }
  });
});

describe("mergeSwapPayload (E3 incremental buckets)", () => {
  it("increments from empty and from existing state", () => {
    const now = new Date("2026-09-11T10:00:00Z");
    const first = mergeSwapPayload(null, ["أرز", "خبز"], now);
    expect(first).toEqual({ count: 2, last_seen: now.toISOString() });
    const second = mergeSwapPayload(first as unknown as Record<string, unknown>, ["جبنة"], now);
    expect(second.count).toBe(3);
  });

  it("tolerates corrupted existing payloads", () => {
    const now = new Date("2026-09-11T10:00:00Z");
    expect(mergeSwapPayload({ count: "خمسة" }, ["تفاح"], now).count).toBe(1);
  });
});

const row = (bucket: string, key: string, payload: Record<string, unknown>, sample_size: number): EvoPatternRow => ({
  bucket,
  key,
  payload,
  sample_size,
});

describe("buildPlatformKnowledgeBlock — honest injection", () => {
  it("renders goals, macros, meal counts and top foods", () => {
    const block = buildPlatformKnowledgeBlock([
      row("calories_by_goal", "fat-loss", { count: 12, avg: 1650, min: 1400, max: 1900 }, 12),
      row("macros_by_goal", "fat-loss", { count: 12, avg_protein: 130, avg_carbs: 140, avg_fat: 46 }, 12),
      row("meal_count", "4", { count: 20 }, 20),
      row("food_frequency", normalizeFoodName("بيض مسلوق"), { plans: 9, display: "بيض مسلوق" }, 9),
      row("food_frequency", normalizeFoodName("صدر دجاج"), { plans: 7, display: "صدر دجاج مشوي" }, 7),
      row("food_frequency", normalizeFoodName("أرز"), { plans: 6, display: "أرز" }, 6),
    ]);
    expect(block).toContain("معرفة المنصة الغذائية");
    expect(block).toContain("خسارة الوزن: متوسط 1,650");
    expect(block).toContain("بروتين 130جم");
    expect(block).toContain("بيض مسلوق");
    expect(block).toContain("مجهولة الهوية");
  });

  it("injects the exemplar as a structure reference (no-copy law intact)", () => {
    const skeleton = buildExemplarSkeleton(plansContent());
    const block = buildPlatformKnowledgeBlock([
      row("exemplar", "latest", skeleton as unknown as Record<string, unknown>, 1),
    ]);
    expect(block).toContain("هيكل مرجعي");
    expect(block).toContain("ممنوع نسخ");
  });

  it("withholds thin food signal (needs ≥3 plans and ≥3 foods)", () => {
    expect(
      buildPlatformKnowledgeBlock([
        row("food_frequency", normalizeFoodName("بيض"), { plans: 2, display: "بيض" }, 2),
      ]),
    ).toBe("");
  });

  it("returns empty string with no rows (never an empty section)", () => {
    expect(buildPlatformKnowledgeBlock([])).toBe("");
  });
});

describe("buildSwapLearningBlock (E3 injection)", () => {
  it("renders reduce/prefer lists and volume context", () => {
    const block = buildSwapLearningBlock([
      row("swap_removed", normalizeFoodName("خبز أبيض"), { count: 9, display: "خبز أبيض" }, 9),
      row("swap_removed", normalizeFoodName("أرز أبيض"), { count: 5, display: "أرز أبيض" }, 5),
      row("swap_added", normalizeFoodName("خبز أسمر"), { count: 7, display: "خبز أسمر" }, 7),
      row("swap_volume", "meal", { last_week: 14, total: 90 }, 14),
    ]);
    expect(block).toContain("تعلم من سلوك الاستبدال");
    expect(block).toContain("خبز أبيض (9)");
    expect(block).toContain("خبز أسمر");
    expect(block).toContain("استبدالات الوجبات");
  });

  it("returns empty when there is no swap signal yet", () => {
    expect(buildSwapLearningBlock([])).toBe("");
  });
});
