"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { AdSenseAd } from "@/components/AdSenseAd";
import { OtherTools } from "@/components/OtherTools";
import { ReviewInviteCard } from "@/components/ReviewInviteCard";
import { demoSystemOptions } from "@/lib/ai-meal-planner";
import { Loader2, Sparkles, RotateCcw } from "lucide-react";

/**
 * /ai-meal-planner — the AI meal planner TRIAL page (§12.28, owner
 * directive «اين صفحة تخطيط الوجبات بالذكاء الاصطناعي؟ مطلوب إنشاؤها
 * مع سماح بالتجربة للجميع بدون تعارض مع الاشتراكات»).
 *
 * The bilingual client page behind /ai-meal-planner and its AR mirror
 * /ar/ai-meal-planner (re-export). One free generation at a time via
 * /api/ai/meal-plan-demo — no account, nothing saved (memberships keep
 * full generation, saving, and coach review).
 */

type DemoMealItem = { food: string; grams: number; kcal: number };
type DemoMeal = { name: string; items: DemoMealItem[]; kcal: number };
type DemoPlan = { meals: DemoMeal[]; kcal: number };

export default function AiMealPlannerPage() {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  const [calories, setCalories] = useState("2000");
  const [system, setSystem] = useState("balanced");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<DemoPlan | null>(null);
  const [model, setModel] = useState<string | null>(null);

  const systems = demoSystemOptions(isAr ? "ar" : "en");

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/meal-plan-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calories: Number(calories),
          system,
          language: isAr ? "ar" : "en",
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (isAr ? "تعذّر التوليد — حاول مرة أخرى." : "Generation failed — try again."));
        if (res.status === 422) setPlan(null);
        return;
      }
      setPlan(data.plan as DemoPlan);
      setModel(data.model ?? null);
    } catch {
      setError(isAr ? "تعذّر التوليد — حاول مرة أخرى." : "Generation failed — try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader variant="landing" />

      <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            {isAr ? "مخطط الوجبات بالذكاء الاصطناعي" : "AI Meal Planner"}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base font-normal text-[var(--muted-foreground)] md:text-lg">
            {isAr
              ? "ولّد خطة يوم كاملة بالغرامات والسعرات في ثوانٍ — تجربة مجانية بلا تسجيل."
              : "Generate a complete day plan in grams and calories in seconds — a free trial, no signup."}
          </p>
          <div className="seal-chip mt-4 inline-flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[var(--muted-2)]" aria-hidden="true" />
            {isAr ? "تجربة مجانية: 3 توليدات يومياً لكل زائر" : "Free trial: 3 generations per day per visitor"}
          </div>
        </div>

        {/* Trial form */}
        <div className="marble-card mt-8 p-5 md:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="demo-calories" className="text-sm font-medium text-[var(--text)]">
                {isAr ? "سعرات اليوم المستهدفة" : "Daily calorie target"}
              </label>
              <input
                id="demo-calories"
                type="number"
                inputMode="numeric"
                min={1200}
                max={4000}
                step={50}
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="mt-1.5 w-full rounded-full border border-[var(--edge)] bg-[var(--card)] px-5 py-2.5 text-sm font-normal outline-none focus:border-[var(--chrome-edge)]"
                dir="ltr"
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {isAr ? "من 1200 إلى 4000 — لا تعرف رقمك؟ " : "From 1200 to 4000 — don't know yours? "}
                <Link href={isAr ? "/ar/tools/calorie-calculator" : "/tools/calorie-calculator"} className="underline decoration-[var(--edge)] underline-offset-4 hover:text-[var(--text)]">
                  {isAr ? "حاسبة السعرات" : "the calorie calculator"}
                </Link>
              </p>
            </div>
            <div>
              <label htmlFor="demo-system" className="text-sm font-medium text-[var(--text)]">
                {isAr ? "النظام الغذائي" : "Diet system"}
              </label>
              <select
                id="demo-system"
                value={system}
                onChange={(e) => setSystem(e.target.value)}
                className="mt-1.5 w-full rounded-full border border-[var(--edge)] bg-[var(--card)] px-5 py-2.5 text-sm font-normal outline-none focus:border-[var(--chrome-edge)]"
              >
                {systems.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {isAr ? "أنظمة الموقع نفسها — مطابقة لحاسبة الماكروز." : "The site's own systems — matching the macro calculator."}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="demo-notes" className="text-sm font-medium text-[var(--text)]">
              {isAr ? "ملاحظات اختيارية" : "Optional preferences"}
            </label>
            <input
              id="demo-notes"
              type="text"
              maxLength={200}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isAr
                  ? "مثال: بلا منتجات الألبان، سمك مرتين أسبوعياً…"
                  : "e.g. no dairy, fish twice a week…"
              }
              className="mt-1.5 w-full rounded-full border border-[var(--edge)] bg-[var(--card)] px-5 py-2.5 text-sm font-normal outline-none focus:border-[var(--chrome-edge)]"
            />
          </div>
          <button
            onClick={generate}
            disabled={loading || !calories}
            className="btn-chrome mt-5 inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm disabled:opacity-50 sm:w-auto"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : plan ? (
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            {loading
              ? isAr ? "جاري التوليد…" : "Generating…"
              : plan
                ? isAr ? "ولّد خطة أخرى" : "Generate another plan"
                : isAr ? "ولّد خطتي المجانية" : "Generate my free plan"}
          </button>
          {error && (
            <p className="mt-3 text-sm font-medium text-[#ff3b30]" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Generated plan */}
        {plan && (
          <section aria-live="polite" className="mt-8">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
                {isAr ? "خطتك المولّدة لهذا اليوم" : "Your generated day"}
              </h2>
              <span className="text-sm text-[var(--muted-foreground)]" dir="ltr">
                {plan.kcal} kcal
              </span>
            </div>
            <div className="mt-4 space-y-4">
              {plan.meals.map((meal) => (
                <div key={meal.name} className="rounded-2xl border border-[var(--edge)] bg-[var(--tint)] p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-base font-semibold tracking-tight text-[var(--text)]">{meal.name}</h3>
                    <span className="text-sm text-[var(--muted-foreground)]" dir="ltr">
                      {meal.kcal} kcal
                    </span>
                  </div>
                  <ul className="mt-2 divide-y divide-[var(--edge)]/60">
                    {meal.items.map((item, i) => (
                      <li key={`${item.food}-${i}`} className="flex items-baseline justify-between gap-3 py-1.5 text-sm font-normal">
                        <span className="text-[var(--muted-foreground)]">{item.food}</span>
                        <span className="whitespace-nowrap text-[var(--muted-foreground)]" dir="ltr">
                          {item.grams} g · {item.kcal} kcal
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm font-normal leading-relaxed text-[var(--muted-foreground)]">
              {isAr
                ? "الخطة تقدير تعليمي قابل للنسخ — راجعها وعدّل كمياتها على مائدتك، وقِس أثرها بالاتجاه الأسبوعي لا بقراءة يوم. هذه نسخة تجريبية لا تُحفظ؛ التوليد الكامل المتكرر مع الحفظ وخطط الأسابيع ومراجعة الكوتش جزء من مسارات العضويات."
                : "This plan is a copyable educational estimate — review it, adjust the portions to your table, and measure its effect on the weekly trend, not a single reading. This trial copy is not saved; full repeated generation with saving, weekly plans, and coach review is part of the membership paths."}
            </p>

            {/* Review invite (SEO-GEO-6.3 §12.22 + §12.24) — generation
                achievement surface, same law as the other tools. */}
            <div className="mt-6">
              <ReviewInviteCard />
            </div>
          </section>
        )}

        {/* AdSense */}
        <AdSenseAd format="auto" />
        <OtherTools current="/ai-meal-planner" />

        {/* Honest explainer */}
        <section className="mt-10 space-y-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
              {isAr ? "ماذا يحسّنه التوليد بالذكاء الاصطناعي؟" : "What does AI generation actually add?"}
            </h2>
            <p className="mt-3 text-base font-normal leading-relaxed text-[var(--muted-foreground)]">
              {isAr
                ? "الحسبة الغذائية بسيطة، والاختيار هو الصعب: التوليد يحل مشكلة «ماذا آكل اليوم؟» بوضع يوم كامل مبني على رقمك ونظامك وملاحظاتك في ثوانٍ — بدل صفحة بيضاء أو نسخ خطة صديقك. النموذج يلتزم بقواعد صارمة (3–5 وجبات، أصناف بغرامات، إجمالي ضمن 20% من هدفك) وكل خطة تُفحص قبل عرضها؛ فإن خرجت عن الشكل تُرفض لا تُعرض."
                : "Nutrition arithmetic is simple; the choosing is hard. Generation solves the \"what do I eat today?\" problem by laying out a whole day built on your number, your system, and your notes in seconds — instead of a blank page or copying a friend's plan. The model follows strict rules (3–5 meals, items in grams, a total within 20% of your target) and every plan is validated before display; a drifted one is rejected, never shown."}
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
              {isAr ? "حدود التجربة — وبقية المسارات" : "The trial's limits — and the rest of the paths"}
            </h2>
            <p className="mt-3 text-base font-normal leading-relaxed text-[var(--muted-foreground)]">
              {isAr
                ? "التجربة المجانية توليد واحد في كل مرة (3 يومياً) بلا حساب ولا حفظ — وهذا مقصود: القيمة الكاملة في المنصة هي التوليد المتكرر مع الحفظ وتخطيط الأسابيع ومراجعة الكوتش البشري، وهي مسارات العضويات المدفوعة كما هي دون تغيير. للتحكم اليدوي الكامل بلا أي حد، افتح مخطط الوجبات وابنِ يومك صنفاً صنفاً بإجماليات حية؛ ولتصفح جاهز فوري، مصفوفة خطط الطعام تضم 24 خطة يوم معروضة بالغرامات."
                : "The free trial is one generation at a time (3 per day) with no account and no saving — by design: the platform's full value is repeated generation with saving, weekly planning, and human coach review, and those stay exactly where the paid memberships put them. For full manual control with no limits at all, open the meal planner and build your day item by item with live totals; for instant browsing, the diet-plan matrix holds 24 complete daily plans laid out in grams."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={isAr ? "/ar/meal-planner" : "/meal-planner"} className="rounded-full border border-[var(--edge)] px-4 py-2 text-sm font-normal text-[var(--text)] transition-colors hover:border-[var(--chrome-edge)]">
                {isAr ? "المخطط اليدوي الكامل" : "Full manual planner"}
              </Link>
              <Link href={isAr ? "/ar/diet-plan" : "/diet-plan"} className="rounded-full border border-[var(--edge)] px-4 py-2 text-sm font-normal text-[var(--text)] transition-colors hover:border-[var(--chrome-edge)]">
                {isAr ? "24 خطة جاهزة" : "24 ready-made plans"}
              </Link>
              <Link href={isAr ? "/ar/tools/calorie-calculator" : "/tools/calorie-calculator"} className="rounded-full border border-[var(--edge)] px-4 py-2 text-sm font-normal text-[var(--text)] transition-colors hover:border-[var(--chrome-edge)]">
                {isAr ? "حاسبة السعرات" : "Calorie calculator"}
              </Link>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
              {isAr ? "تذكير الصحة المعتاد" : "The usual health reminder"}
            </h2>
            <p className="mt-3 text-base font-normal leading-relaxed text-[var(--muted-foreground)]">
              {isAr
                ? "الخطط المولّدة عامة لبالغين أصحاء. إن كان لديك وضع صحي مزمن — سكري أو كلى أو حمل أو اضطراب أكل — فالأرقام المناسبة لك تُضبط مع مختص يرى ملفك كاملاً؛ استعمل الخطة مادة نقاش ممتازة معه لا بديلاً عنه."
                : "Generated plans are general guidance for healthy adults. If you live with a chronic condition — diabetes, kidney disease, pregnancy, or an eating disorder — the right numbers for you are set with a professional who sees your full file; use the plan as an excellent discussion piece with them, never a replacement."}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
