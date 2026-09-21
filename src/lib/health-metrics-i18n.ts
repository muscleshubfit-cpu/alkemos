/**
 * health-metrics-i18n — M-2026 FIX (UX-TEST-REPORT-2026-09-21).
 *
 * PROBLEM (audit M-2026): HealthMetricsDashboard shipped every UI string
 * HARDCODED in Arabic and rendered verbatim inside the coach's ENGLISH
 * client page (/coach/<id> · Overview tab): the empty state «لا توجد بيانات
 * كافية…», the header «المؤشرات الصحية», every metric/measurement label,
 * the units (كجم) and the baseline-vs-current summary. Same genus as the
 * M1 fix (DEEP-UX-AUDIT-2026-09-18) at a NEW surface the previous pass
 * didn't cover: a whole component, not one server message.
 *
 * ROOT CAUSE: locale is a PRESENTATION concern, but this component baked
 * the presentation into its render with zero locale awareness.
 *
 * THE FIX (presentation layer, same law as M1): every user-visible string
 * lives in the EN/AR dictionary below, keyed and localized at render time.
 * The BMI status computed inside computeMetrics() now returns a STABLE KEY
 * (underweight|normal|overweight|obese) + color — the label is looked up
 * here in the UI language. Zero API, logic or calculation changes; the
 * numbers, thresholds and colors are untouched.
 *
 * The gender vocabulary check (أنثى/انثى) inside computeMetrics is DATA
 * normalization of stored questionnaire answers — deliberately NOT touched.
 */

export type HmsLang = "en" | "ar";

export type HmsBmiKey = "underweight" | "normal" | "overweight" | "obese";

export const HMS_STRINGS = {
  en: {
    emptyState: "Not enough data to show health indicators yet. Add measurements for this client to get started.",
    title: "Health indicators",
    subtitle: "A composite tracker of the client's progress — computed from weight, body fat, adherence and energy",
    weight: "Weight",
    bodyFat: "Body fat",
    leanMass: "Lean mass",
    energy: "Energy level",
    adherence: "Adherence",
    kg: "kg",
    per10: "/10",
    measurements: "Measurements (cm)",
    waist: "Waist",
    chest: "Chest",
    hips: "Hips",
    arm: "Arm",
    neck: "Neck",
    waterTarget: "Daily water goal: ",
    baselineTitle: "Baseline vs current",
    baseline: "Baseline",
    current: "Current",
    totalChange: "Total change",
    ofBaseline: "% of baseline",
    from: "from",
    bmi: {
      underweight: "Underweight",
      normal: "Normal",
      overweight: "Overweight",
      obese: "Obese",
    },
  },
  ar: {
    emptyState: "لا توجد بيانات كافية لعرض المؤشرات الصحية. ابدأ بإضافة قياسات للعميل.",
    title: "المؤشرات الصحية",
    subtitle: "مؤشر شامل لتتبع تقدم العميل — يحسب من الوزن، نسبة الدهون، الالتزام، والطاقة",
    weight: "الوزن",
    bodyFat: "نسبة الدهون",
    leanMass: "الكتلة العضلية",
    energy: "مستوى الطاقة",
    adherence: "الالتزام بالنظام",
    kg: "كجم",
    per10: "/10",
    measurements: "المقاسات (سم)",
    waist: "الخصر",
    chest: "الصدر",
    hips: "الورك",
    arm: "الذراع",
    neck: "الرقبة",
    waterTarget: "هدف الماء اليومي: ",
    baselineTitle: "نقطة البداية vs الحالي",
    baseline: "البداية",
    current: "الحالي",
    totalChange: "إجمالي التغير",
    ofBaseline: "% من البداية",
    from: "من",
    bmi: {
      underweight: "نحافة",
      normal: "طبيعي",
      overweight: "زيادة وزن",
      obese: "سمنة",
    },
  },
} as const;

/** UI-language string lookup for the HealthMetricsDashboard (scalar keys —
 *  the nested `bmi` map has its own hmsBmiLabel accessor). */
export function hmsStr(
  lang: HmsLang,
  key: Exclude<keyof (typeof HMS_STRINGS)["en"], "bmi">,
): string {
  return HMS_STRINGS[lang][key];
}

/** Localized BMI status label from the stable computed key. */
export function hmsBmiLabel(lang: HmsLang, key: HmsBmiKey): string {
  return HMS_STRINGS[lang].bmi[key];
}

/** Locale-aware date rendering (the dashboard used hardcoded ar-EG). */
export function hmsLocale(lang: HmsLang): string {
  return lang === "ar" ? "ar-EG" : "en-US";
}
