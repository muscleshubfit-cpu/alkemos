/**
 * Diet Plan Matrix — Phase SEO-GEO-6.6 (§12.19 P1-8, owner directive
 * 2026-09-12: «ممتاذ نفذ البند ٦ ثم ٨ بالتتابع»).
 *
 * The programmatic Arabic diet-plan matrix: /ar/diet-plan/{level}/{system}
 * — 6 calorie levels × 4 systems = 24 standalone leaf pages + 1 hub,
 * eatthismuch-style (the uncontested Arabic surface per the §12.19 audit:
 * no Arabic meal-plan matrix exists at this quality bar).
 *
 * LAWS (guarded in src/lib/__tests__/diet-plan-matrix.test.ts):
 *   - QUALITY FLOOR (§12.19 DO-NOT "لا آلاف الصفحات الهزيلة"): every
 *     cell carries a UNIQUE intro (level-paragraph + system-paragraph +
 *     computed numbers), a fully computed day plan whose calories close
 *     to within ±10 kcal of the level, a macro table, and the embedded
 *     free-planner CTA (the meal planner works without registration —
 *     free tier: 3 meals with live totals).
 *   - MACROS MATCH THE SITE: splits mirror the macro calculator presets
 *     (balanced 30/40/30 · high-protein 45/35/20 · keto 25/5/70);
 *     vegetarian 25/50/25 is documented here as the site's matrix-only
 *     preset.
 *   - MSA Arabic throughout (blog dialect scanner runs in the tests).
 *   - NO fabricated ratings, NO FAQPage schema — BreadcrumbList only.
 *   - AR-only surface per the plan («النسخة EN لاحقًا لسد عنق
 *     strongrfastr»): hreflang = self ar + x-default self (the same
 *     honest-unpaired pattern the blog uses, P0-4).
 */

export interface MacroSplit {
  /** percent of calories */
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodItem {
  /** per 100 g */
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MatrixMealItem {
  food: string;
  grams: number;
}

export interface MatrixMeal {
  name: string;
  /** The item adjusted to close the calorie gap (must exist in items). */
  flex?: string;
  items: MatrixMealItem[];
}

export interface SolvedItem extends MatrixMealItem {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface SolvedMeal {
  name: string;
  items: SolvedItem[];
  kcal: number;
}

export interface SolvedDay {
  meals: SolvedMeal[];
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DietSystem {
  slug: string;
  nameAr: string;
  split: MacroSplit;
  /** Item used to close the calorie gap (high-kcal, easy to adjust). */
  meals: MatrixMeal[];
}

export const DIET_LEVELS = [1200, 1500, 1800, 2000, 2500, 3000] as const;
export type DietLevel = (typeof DIET_LEVELS)[number];

/** Per-100 g values (USDA-rounded, plain preparation). */
const FOODS: Record<string, FoodItem> = {
  "بيض مسلوق": { kcal: 155, protein: 13, carbs: 1.1, fat: 11 },
  "بياض بيض مسلوق": { kcal: 52, protein: 11, carbs: 0.7, fat: 0.2 },
  "خبز بلدي": { kcal: 275, protein: 9, carbs: 55, fat: 1.5 },
  "خبز أسمر": { kcal: 247, protein: 13, carbs: 41, fat: 3.4 },
  "جبنة قريش": { kcal: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  "جبن تشيدر": { kcal: 402, protein: 25, carbs: 1.3, fat: 33 },
  "خيار": { kcal: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
  "طماطم": { kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  "صدر دجاج مشوي": { kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  "أرز أبيض مطبوخ": { kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  "سلطة خضراء": { kcal: 20, protein: 1, carbs: 4, fat: 0.2 },
  "زيت زيتون": { kcal: 884, protein: 0, carbs: 0, fat: 100 },
  "سمك بلطي مشوي": { kcal: 128, protein: 26, carbs: 0, fat: 2.7 },
  "سلمون مطبوخ": { kcal: 208, protein: 20, carbs: 0, fat: 13 },
  "بطاطس مشوية": { kcal: 93, protein: 2.5, carbs: 21, fat: 0.1 },
  "خضار مشكلة مطبوخة": { kcal: 55, protein: 2.5, carbs: 9, fat: 0.5 },
  "زبادي يوناني خالي الدسم": { kcal: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  "موز": { kcal: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  "تفاح": { kcal: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  "لوز": { kcal: 579, protein: 21, carbs: 22, fat: 50 },
  "جوز": { kcal: 654, protein: 15, carbs: 14, fat: 65 },
  "لحم بقري قليل الدهن مطبوخ": { kcal: 250, protein: 26, carbs: 0, fat: 15 },
  "تونة معلبة بالماء": { kcal: 116, protein: 26, carbs: 0, fat: 1 },
  "زبدة": { kcal: 717, protein: 0.9, carbs: 0.1, fat: 81 },
  "أفوكادو": { kcal: 160, protein: 2, carbs: 9, fat: 15 },
  "بروكلي مطبوخ": { kcal: 35, protein: 2.4, carbs: 7, fat: 0.4 },
  "سبانخ مطبوخة": { kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  "فول مدمس": { kcal: 110, protein: 7.6, carbs: 19, fat: 0.5 },
  "عدس مطبوخ": { kcal: 116, protein: 9, carbs: 20, fat: 0.4 },
  "حمص مطبوخ": { kcal: 164, protein: 8.9, carbs: 27, fat: 2.6 },
  "توفو متماسك": { kcal: 76, protein: 8, carbs: 1.9, fat: 4.8 },
  "شوفان جاف": { kcal: 389, protein: 17, carbs: 66, fat: 7 },
  "لبن كامل الدسم": { kcal: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
};

export const DIET_SYSTEMS: DietSystem[] = [
  {
    slug: "balanced",
    nameAr: "متوازن",
    split: { protein: 30, carbs: 40, fat: 30 },
    meals: [
      {
        name: "الفطور",
        flex: "خبز بلدي",
        items: [
          { food: "بيض مسلوق", grams: 150 },
          { food: "خبز بلدي", grams: 40 },
          { food: "جبنة قريش", grams: 100 },
          { food: "خيار", grams: 100 },
          { food: "زيت زيتون", grams: 5 },
        ],
      },
      {
        name: "الغداء",
        flex: "أرز أبيض مطبوخ",
        items: [
          { food: "صدر دجاج مشوي", grams: 180 },
          { food: "أرز أبيض مطبوخ", grams: 200 },
          { food: "سلطة خضراء", grams: 200 },
          { food: "زيت زيتون", grams: 10 },
        ],
      },
      {
        name: "العشاء",
        flex: "خضار مشكلة مطبوخة",
        items: [
          { food: "سمك بلطي مشوي", grams: 200 },
          { food: "بطاطس مشوية", grams: 200 },
          { food: "خضار مشكلة مطبوخة", grams: 200 },
          { food: "زيت زيتون", grams: 7 },
        ],
      },
      {
        name: "سناك",
        flex: "زبادي يوناني خالي الدسم",
        items: [
          { food: "زبادي يوناني خالي الدسم", grams: 200 },
          { food: "تفاح", grams: 150 },
        ],
      },
    ],
  },
  {
    slug: "high-protein",
    nameAr: "عالي البروتين",
    split: { protein: 45, carbs: 35, fat: 20 },
    meals: [
      {
        name: "الفطور",
        flex: "خبز أسمر",
        items: [
          { food: "بيض مسلوق", grams: 200 },
          { food: "بياض بيض مسلوق", grams: 100 },
          { food: "خبز أسمر", grams: 30 },
          { food: "جبنة قريش", grams: 100 },
          { food: "خيار", grams: 100 },
        ],
      },
      {
        name: "الغداء",
        flex: "بطاطس مشوية",
        items: [
          { food: "صدر دجاج مشوي", grams: 250 },
          { food: "بطاطس مشوية", grams: 200 },
          { food: "سلطة خضراء", grams: 150 },
          { food: "زيت زيتون", grams: 8 },
        ],
      },
      {
        name: "العشاء",
        flex: "لحم بقري قليل الدهن مطبوخ",
        items: [
          { food: "لحم بقري قليل الدهن مطبوخ", grams: 150 },
          { food: "تونة معلبة بالماء", grams: 100 },
          { food: "خضار مشكلة مطبوخة", grams: 200 },
          { food: "زيت زيتون", grams: 5 },
        ],
      },
      {
        name: "سناك",
        flex: "زبادي يوناني خالي الدسم",
        items: [
          { food: "زبادي يوناني خالي الدسم", grams: 200 },
          { food: "لوز", grams: 15 },
        ],
      },
    ],
  },
  {
    slug: "keto",
    nameAr: "كيتو",
    split: { protein: 25, carbs: 5, fat: 70 },
    meals: [
      {
        name: "الفطور",
        flex: "زبدة",
        items: [
          { food: "بيض مسلوق", grams: 200 },
          { food: "زبدة", grams: 15 },
          { food: "جبن تشيدر", grams: 40 },
          { food: "أفوكادو", grams: 100 },
        ],
      },
      {
        name: "الغداء",
        flex: "زيت زيتون",
        items: [
          { food: "صدر دجاج مشوي", grams: 200 },
          { food: "بروكلي مطبوخ", grams: 200 },
          { food: "سلطة خضراء", grams: 150 },
          { food: "زيت زيتون", grams: 20 },
        ],
      },
      {
        name: "العشاء",
        flex: "زبدة",
        items: [
          { food: "سلمون مطبوخ", grams: 200 },
          { food: "سبانخ مطبوخة", grams: 200 },
          { food: "زبدة", grams: 12 },
        ],
      },
      {
        name: "سناك",
        flex: "جوز",
        items: [
          { food: "جوز", grams: 20 },
          { food: "جبن تشيدر", grams: 30 },
        ],
      },
    ],
  },
  {
    slug: "vegetarian",
    nameAr: "نباتي",
    split: { protein: 25, carbs: 50, fat: 25 },
    meals: [
      {
        name: "الفطور",
        flex: "خبز بلدي",
        items: [
          { food: "فول مدمس", grams: 200 },
          { food: "خبز بلدي", grams: 60 },
          { food: "زيت زيتون", grams: 8 },
          { food: "طماطم", grams: 100 },
        ],
      },
      {
        name: "الغداء",
        flex: "أرز أبيض مطبوخ",
        items: [
          { food: "عدس مطبوخ", grams: 250 },
          { food: "أرز أبيض مطبوخ", grams: 200 },
          { food: "خضار مشكلة مطبوخة", grams: 200 },
          { food: "زيت زيتون", grams: 8 },
        ],
      },
      {
        name: "العشاء",
        flex: "خضار مشكلة مطبوخة",
        items: [
          { food: "توفو متماسك", grams: 250 },
          { food: "حمص مطبوخ", grams: 100 },
          { food: "خضار مشكلة مطبوخة", grams: 250 },
          { food: "زيت زيتون", grams: 10 },
        ],
      },
      {
        name: "سناك",
        flex: "زبادي يوناني خالي الدسم",
        items: [
          { food: "زبادي يوناني خالي الدسم", grams: 200 },
          { food: "شوفان جاف", grams: 25 },
          { food: "تفاح", grams: 150 },
        ],
      },
    ],
  },
];

export function getDietSystem(slug: string): DietSystem | undefined {
  return DIET_SYSTEMS.find((s) => s.slug === slug);
}

export function isDietLevel(level: string): boolean {
  const n = Number(level);
  return String(n) === level && (DIET_LEVELS as readonly number[]).includes(n);
}

// Keto meals swap the flex items for fat-dense closers.

function itemMacros(item: MatrixMealItem): SolvedItem {
  const f = FOODS[item.food];
  if (!f) throw new Error(`diet-plan-matrix: unknown food ${item.food}`);
  const factor = item.grams / 100;
  return {
    ...item,
    kcal: Math.round(f.kcal * factor),
    protein: Math.round(f.protein * factor),
    carbs: Math.round(f.carbs * factor),
    fat: Math.round(f.fat * factor),
  };
}

/** Integer-kcal total of a meal as it will be displayed. */
function mealKcalInt(meal: MatrixMeal): number {
  return meal.items.reduce(
    (s, i) => s + Math.round((FOODS[i.food].kcal * i.grams) / 100),
    0,
  );
}

/**
 * Scale the system's base day to the requested calorie level and close
 * the residual gap through each meal's flex item, iterating on INTEGER
 * displayed totals so the printed numbers close to within ±10 kcal of
 * the level (test-pinned). Deterministic — same inputs, same page.
 */
export function solveDayPlan(level: DietLevel, system: DietSystem): SolvedDay {
  const baseKcal = system.meals.reduce(
    (sum, m) =>
      sum +
      m.items.reduce((s, i) => s + (FOODS[i.food].kcal * i.grams) / 100, 0),
    0,
  );
  const factor = level / baseKcal;

  // Pass 1: scale every item, rounding grams to 5.
  const meals: MatrixMeal[] = system.meals.map((m) => ({
    name: m.name,
    flex: m.flex,
    items: m.items.map((i) => ({
      food: i.food,
      grams: Math.max(5, Math.round((i.grams * factor) / 5) * 5),
    })),
  }));

  // Pass 2: iterative closure on integer totals via the flex items.
  for (let iter = 0; iter < 8; iter++) {
    const totals = meals.map(mealKcalInt);
    const total = totals.reduce((a, b) => a + b, 0);
    const gap = level - total;
    if (Math.abs(gap) <= 4) break;
    // Fallback flex: first item (data always defines one, this is armor).
    const flexPerMeal = meals.map((m) => {
      const f = m.items.find((i) => i.food === (m.flex ?? m.items[0].food));
      return f;
    });
    // The densest flex item absorbs the whole gap this iteration —
    // dense items converge fastest with the least gram noise.
    let bestIdx = -1;
    let bestDensity = -1;
    flexPerMeal.forEach((f, idx) => {
      if (!f) return;
      const density = FOODS[f.food].kcal;
      if (density > bestDensity) {
        bestDensity = density;
        bestIdx = idx;
      }
    });
    const f = flexPerMeal[bestIdx];
    if (!f) break;
    const kcalPerG = FOODS[f.food].kcal / 100;
    const deltaG = gap / kcalPerG;
    // Keep the flex item meaningful: never below 3 g, never absurd.
    f.grams = Math.max(3, Math.round(f.grams + deltaG));
  }

  // Solve into final numbers.
  const solved: SolvedMeal[] = meals.map((m) => ({
    name: m.name,
    items: m.items.map(itemMacros),
    kcal: 0,
  }));
  const day: SolvedDay = { meals: solved, kcal: 0, protein: 0, carbs: 0, fat: 0 };
  for (const meal of day.meals) {
    meal.kcal = meal.items.reduce((s, i) => s + i.kcal, 0);
    day.kcal += meal.kcal;
    for (const i of meal.items) {
      day.protein += i.protein;
      day.carbs += i.carbs;
      day.fat += i.fat;
    }
  }
  return day;
}

/** Macro targets in grams for a level under a system's split. */
export function macroTargets(
  level: DietLevel,
  system: DietSystem,
): { protein: number; carbs: number; fat: number } {
  return {
    protein: Math.round((level * system.split.protein) / 100 / 4),
    carbs: Math.round((level * system.split.carbs) / 100 / 4),
    fat: Math.round((level * system.split.fat) / 100 / 9),
  };
}


/** Long-form guidance per level (shared section text on every leaf). */
export const LEVEL_GUIDANCE: Record<DietLevel, string> = {
    1200:
      "خطة الـ1200 سعرة هي الأدنى في المصفوفة، وتُعد عجزاً حقيقياً لا ينبغي أن يبدأ إلا لمن وزنه قليل أو نشاطه شبه معدوم؛ فبهذا المستوى تتضاءل هوامش الخطأ وتصبح كل حصة بروتين وكل غرام ألياف ضرورة لا رفاهية. إن كنت تفكر في هذا المستوى بجرأة فالأصدق أن تمر على حاسبة السعرات أولاً لتتأكد أنه فعلاً رقمك، وأن تراجع مختصاً إن كان لديك أي وضع صحي — فالأمان هنا أهم من السرعة.",
    1500:
      "خطة الـ1500 سعرة هي منطقة العمل الكلاسيكية لخسارة الدهون عند معظم النساء والرجال الأخف وزناً: عجز معتدل يحترم العضلة ويترك مساحة لوجبات تشبه وجبات حياة حقيقية. عند هذا المستوى يظل البروتين هو سقف الحماية، وتبقى الألياف والخضروات الوفيرة هي الفارق بين يومٍ يمر بهدوء ويومٍ ينتهي بلقمة غير محسوبة بعد الغروب.",
    1800:
      "خطة الـ1800 سعرة هي المستوى الوسط الأكثر أماناً في المصفوفة: خسارة هادئة للكثير من الرجال، وتثبيت مريح لكثير من النساء النشيطات، ونقطة انطلاق متوازنة لمن يريد تعلم البناء الغذائي قبل التخصيص العميق. عند هذا الرقم تتسع الميزانية لتنوع كافٍ يجعل الالتزام أسهل بمراحل من الحميات القاسية.",
    2000:
      "خطة الـ2000 سعرة هي المستوى المرجعي للمصفوفة كلها — الرقم الذي عليه بُنيت الوجبات الأساسية قبل التحجيم لأعلى وأدنى. لكثير من البالغين المتوسطي النشاط هو رقم تثبيت شبه مثالي: طاقة كاملة للتفكير والتدريب، ومساحة اجتماعية معقولة، وإجماليات سهلة القراءة على أي ملصق طعام.",
    2500:
      "خطة الـ2500 سعرة تدخل أرض البالغين النشيطين: من يتدرب أربع مرات أو أكثر أسبوعياً، أو يعمل عملاً بدنياً، أو يسعى لزيادة عضلية محسوبة دون تخمة السعرات. عند هذا المستوى تتحول الكربوهيدرات من مصدر قلق إلى وقود مقصود حول التدريب، ويصبح توزيع الوجبات عبر اليوم أداة أداء لا مجرد تنظيم شهية.",
    3000:
      "خطة الـ3000 سعرة هي أرض البناء: عجزٌ معكوس لمن ينوي اكتساب وزن عضلي بإيقاع منضبط، أو حرارة تثبيت لرياضي حجم تدريبه كبير جداً. المشكلة الحقيقية هنا ليست المنع بل الحجم — ثلاثة آلاف سعرة من طعام نظيف تعني مواجهة الامتلاء، ولهذا تُبنى الخطة على كثافة سعرية ذكية لا على إغراق الوجبات بالدهون العشوائية.",
};

/** Long-form guidance per system (shared section text on every leaf). */
export const SYSTEM_GUIDANCE: Record<string, string> = {
    balanced:
      "النظام المتوازن (30% بروتين · 40% كربوهيدرات · 30% دهون) هو الافتراضي الذي يوصي به لمن لا يعرف من أين يبدأ: توزيع لا يحارب أي مغذٍّ، يدعم التدريب المختلط، ويترك لكل وجبة بنية مألوفة — مصدر بروتين، ونشوية، وخضار، ودهن طهي. إن كانت هذه أول خطة منظمة لك فابدأ هنا، ثم خصّص لاحقاً حين تعرف كيف يستجيب جسمك.",
    "high-protein":
      "النظام عالي البروتين (45% من السعرات) صُمم لمرحلة الخسارة أو لمن يضع بناء العضلة في صدارة أولوياته: البروتين العالي يحرس العضلة في نقص الطاقة، ويشبع أكثر لكل سعرة، ويكلف الجسم سعرات إضافية في هضمه. إن كنت ستقف طويلاً عند هذا المستوى فراقب التنوع داخل مصادر البروتين كي لا تتحول الخطة إلى مملة قاتلة.",
    keto:
      "النظام الكيتوني (25% بروتين · 5% كربوهيدرات · 70% دهون) هو الأكثر تطلباً للالتزام في المصفوفة: يقيّد الكربوهيدرات إلى الحد الذي ينقل الأيض إلى الكيتونات، فيدفع الجسم أسابيع تكيف معروفة قبل أن يستقر الشعور. اختره لأن حياتك الغذائية تعمل أفضل داخله — لا لأنه «يحرق أسرع»؛ فتوازن الطاقة ما يزال يحكم الجميع.",
    vegetarian:
      "النظام النباتي (25% بروتين · 50% كربوهيدرات · 25% دهون) يبني يومه على البقول والحبوب ومنتجات الألبان والبيض — تكامل البقول مع الحبوب يغطي الأحماض الأمينية الأساسية كما تفعل وجبة الفول بالخبز منذ أجيال. الرقم الذي يستحق الانتباه هنا هو الحديد وفيتامين B12 لمن يتبع النباتية طويلاً، والحل عملي: تقييم دوري بتحليل دم.",
};

/** Unique-per-cell intro: level paragraph + system paragraph + numbers. */
export function buildCellIntro(
  level: DietLevel,
  system: DietSystem,
  targets: ReturnType<typeof macroTargets>,
): string[] {
  const numbersPara =
    `على ${level} سعرة يومياً، توزيع هذا النظام يعني: بروتين نحو ${targets.protein} غراماً ` +
    `(${Math.round((level * system.split.protein) / 100)} سعرة)، وكربوهيدرات نحو ${targets.carbs} غراماً ` +
    `(${Math.round((level * system.split.carbs) / 100)} سعرة)، ودهوناً نحو ${targets.fat} غراماً ` +
    `(${Math.round((level * system.split.fat) / 100)} سعرة) — والخطة أدناه مبنيّة بالغرامات لتقترب من هذه الأهداف من طعام حقيقي.`;
  return [LEVEL_GUIDANCE[level], SYSTEM_GUIDANCE[system.slug], numbersPara];
}

/** Unique title/description per cell — NO brand (the /ar layout
 * template appends exactly one " — Alkemos"; eadb3e7 anti-double-brand
 * law). Raw title + template suffix must stay ≤70 chars. */
export function buildCellMetadata(
  level: DietLevel,
  system: DietSystem,
): { title: string; description: string } {
  const title = `نظام ${level} سعرة ${system.nameAr} — خطة يوم كامل بالغرامات`;
  const description = `خطة غذائية عربية جاهزة بنظام ${system.nameAr} على ${level} سعرة يومياً: فطور وغداء وعشاء وسناك بالغرامات والسعرات، مع توزيع الماكروز وخطوة تخصيصها مجاناً.`;
  return { title, description };
}
