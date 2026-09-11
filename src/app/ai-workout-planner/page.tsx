"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { AdSenseAd } from "@/components/AdSenseAd";
import { OtherTools } from "@/components/OtherTools";
import { ReviewInviteCard } from "@/components/ReviewInviteCard";
import {
  workoutEquipmentOptions,
  workoutGoalOptions,
  workoutLevelOptions,
} from "@/lib/ai-workout-planner";
import { Loader2, Sparkles, RotateCcw } from "lucide-react";

/**
 * /ai-workout-planner — the AI workout planner TRIAL page (§12.32, owner
 * directive «ضيف أداة جديده مخطط التمارين بالذكاء الاصطناعي») — the
 * workout twin of the §12.28 meal-planner trial.
 *
 * The bilingual client page behind /ai-workout-planner and its AR mirror
 * /ar/ai-workout-planner (re-export). One free generation at a time via
 * /api/ai/workout-plan-demo — no account, nothing saved (memberships
 * keep saved programs, coach-built plans, and EVO generation).
 */

type DemoExercise = { name: string; sets: number; reps: number | string };
type DemoDay = { name: string; focus?: string; exercises: DemoExercise[] };
type DemoPlan = { days: DemoDay[] };

export default function AiWorkoutPlannerPage() {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  const [goal, setGoal] = useState("muscle");
  const [level, setLevel] = useState("beginner");
  const [days, setDays] = useState("3");
  const [equipment, setEquipment] = useState("full-gym");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<DemoPlan | null>(null);
  const [model, setModel] = useState<string | null>(null);

  const goals = workoutGoalOptions(isAr ? "ar" : "en");
  const levels = workoutLevelOptions(isAr ? "ar" : "en");
  const equipments = workoutEquipmentOptions(isAr ? "ar" : "en");

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/workout-plan-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          level,
          days: Number(days),
          equipment,
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
            {isAr ? "مخطط التمارين بالذكاء الاصطناعي" : "AI Workout Planner"}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base font-normal text-[var(--muted-foreground)] md:text-lg">
            {isAr
              ? "ولّد نظاماً تدريبياً أسبوعياً متوازناً في ثوانٍ — تجربة مجانية بلا تسجيل."
              : "Generate a balanced weekly split in seconds — a free trial, no signup."}
          </p>
          <div className="seal-chip mt-4 inline-flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[var(--muted-2)]" aria-hidden="true" />
            {isAr ? "تجربة مجانية: 5 توليدات يومياً لكل زائر" : "Free trial: 5 generations per day per visitor"}
          </div>
        </div>

        {/* Trial form */}
        <div className="marble-card mt-8 p-5 md:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="demo-goal" className="text-sm font-medium text-[var(--text)]">
                {isAr ? "هدفك" : "Your goal"}
              </label>
              <select
                id="demo-goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="mt-1.5 w-full rounded-full border border-[var(--edge)] bg-[var(--card)] px-5 py-2.5 text-sm font-normal outline-none focus:border-[var(--chrome-edge)]"
              >
                {goals.map((g) => (
                  <option key={g.slug} value={g.slug}>
                    {g.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {isAr ? "الهدف يحدد تكرارات التمارين وترتيب الأيام." : "The goal shapes rep ranges and weekly order."}
              </p>
            </div>
            <div>
              <label htmlFor="demo-level" className="text-sm font-medium text-[var(--text)]">
                {isAr ? "مستواك" : "Your level"}
              </label>
              <select
                id="demo-level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="mt-1.5 w-full rounded-full border border-[var(--edge)] bg-[var(--card)] px-5 py-2.5 text-sm font-normal outline-none focus:border-[var(--chrome-edge)]"
              >
                {levels.map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {isAr ? "المستوى يحدد حجم التمرين وعدد الحركات." : "Level sets volume and exercise count."}
              </p>
            </div>
            <div>
              <label htmlFor="demo-days" className="text-sm font-medium text-[var(--text)]">
                {isAr ? "أيام التمرين أسبوعياً" : "Training days per week"}
              </label>
              <select
                id="demo-days"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="mt-1.5 w-full rounded-full border border-[var(--edge)] bg-[var(--card)] px-5 py-2.5 text-sm font-normal outline-none focus:border-[var(--chrome-edge)]"
              >
                {[2, 3, 4, 5, 6].map((d) => (
                  <option key={d} value={d}>
                    {isAr ? `${d} أيام` : `${d} days`}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {isAr ? "النظام المولّد يطابق هذا الرقم بالضبط." : "The generated split matches this number exactly."}
              </p>
            </div>
            <div>
              <label htmlFor="demo-equipment" className="text-sm font-medium text-[var(--text)]">
                {isAr ? "تجهيزتك" : "Your equipment"}
              </label>
              <select
                id="demo-equipment"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="mt-1.5 w-full rounded-full border border-[var(--edge)] bg-[var(--card)] px-5 py-2.5 text-sm font-normal outline-none focus:border-[var(--chrome-edge)]"
              >
                {equipments.map((eq) => (
                  <option key={eq.slug} value={eq.slug}>
                    {eq.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {isAr ? "التمارين تُختار بما يناسب ما لديك فقط." : "Exercises are picked to match what you have."}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="demo-notes" className="text-sm font-medium text-[var(--text)]">
              {isAr ? "ملاحظات اختيارية" : "Optional constraints"}
            </label>
            <input
              id="demo-notes"
              type="text"
              maxLength={200}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isAr
                  ? "مثال: أتجنب الضغط على الركبة اليسرى…"
                  : "e.g. avoid loading the left knee…"
              }
              className="mt-1.5 w-full rounded-full border border-[var(--edge)] bg-[var(--card)] px-5 py-2.5 text-sm font-normal outline-none focus:border-[var(--chrome-edge)]"
            />
          </div>
          <button
            onClick={generate}
            disabled={loading}
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
                ? isAr ? "ولّد نظاماً آخر" : "Generate another split"
                : isAr ? "ولّد نظامي المجاني" : "Generate my free split"}
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
                {isAr ? "نظامك المولّد لهذا الأسبوع" : "Your generated week"}
              </h2>
              <span className="text-sm text-[var(--muted-foreground)]">
                {isAr ? `${plan.days.length} أيام تمرين` : `${plan.days.length} training days`}
              </span>
            </div>
            <div className="mt-4 space-y-4">
              {plan.days.map((day) => (
                <div key={day.name} className="rounded-2xl border border-[var(--edge)] bg-[var(--tint)] p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-base font-semibold tracking-tight text-[var(--text)]">{day.name}</h3>
                    {day.focus && (
                      <span className="text-xs font-normal text-[var(--muted-foreground)]">{day.focus}</span>
                    )}
                  </div>
                  <ul className="mt-2 divide-y divide-[var(--edge)]/60">
                    {day.exercises.map((ex, i) => (
                      <li key={`${ex.name}-${i}`} className="flex items-baseline justify-between gap-3 py-1.5 text-sm font-normal">
                        <span className="text-[var(--muted-foreground)]">{ex.name}</span>
                        <span className="whitespace-nowrap text-[var(--muted-foreground)]" dir="ltr">
                          {ex.sets} × {ex.reps}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm font-normal leading-relaxed text-[var(--muted-foreground)]">
              {isAr
                ? "النظام تقدير تعليمي قابل للنسخ — راجع أداء كل حركة على أدائك أنت، وابدأ بأوزان تُتقن بها الشكل الكامل قبل التدرج. هذه نسخة تجريبية لا تُحفظ؛ البرامج المحفوظة وخطط الكوتش وتوليد EVO الكامل جزء من مسارات العضويات."
                : "This split is a copyable educational estimate — review every movement against your own performance, and start with weights you can own with full form before climbing. This trial copy is not saved; saved programs, coach-built plans, and full EVO generation are part of the membership paths."}
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
        <OtherTools current="/ai-workout-planner" />

        {/* Honest explainer */}
        <section className="mt-10 space-y-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
              {isAr ? "ماذا يحسّنه التوليد بالذكاء الاصطناعي؟" : "What does AI generation actually add?"}
            </h2>
            <p className="mt-3 text-base font-normal leading-relaxed text-[var(--muted-foreground)]">
              {isAr
                ? "أي مدرب يعرف التمارين؛ والصعب هو تركيبها في أسبوع متوازن يطابق أيامك ومستواك وتجهيزتك. التوليد يحل مشكلة «من أين أبدأ هذا الأسبوع؟» بوضع نظام كامل أمامك في ثوانٍ — بدل نسخ نظام يوتيوب لم يُبنَ لك. النموذج يلتزم بقواعد صارمة (عدد الأيام يطابق طلبك بالضبط، 4 إلى 6 تمارين لكل يوم، مجموعات وتكرارات معقولة) وكل نظام يُفحص قبل عرضه؛ فإن خرج عن الشكل يُرفض لا يُعرض."
                : "Any coach knows the exercises; the hard part is assembling them into a balanced week that fits your days, level, and equipment. Generation solves the \"where do I even start this week?\" problem by laying out a complete split in seconds — instead of copying a YouTube program never built for you. The model follows strict rules (the day count matches your request exactly, 4 to 6 exercises per day, sane sets and reps) and every split is validated before display; a drifted one is rejected, never shown."}
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
              {isAr ? "حدود التجربة — وبقية المسارات" : "The trial's limits — and the rest of the paths"}
            </h2>
            <p className="mt-3 text-base font-normal leading-relaxed text-[var(--muted-foreground)]">
              {isAr
                ? "التجربة المجانية توليد واحد في كل مرة (5 يومياً) بلا حساب ولا حفظ — وهذا مقصود: القيمة الكاملة في المنصة هي البرامج المحفوظة وتوليد EVO المتكرر ومتابعة الكوتش البشري، وهي مسارات العضويات المدفوعة كما هي دون تغيير. للتصفح الجاهز فوراً، برامج التدريب الجاهزة معروضة لكل مستوى وهدف؛ ولكل حركة بشرحها، مكتبة التمارين تضم أكثر من 868 تمريناً — ولنظامك الغذائي، مخطط الوجبات بالذكاء الاصطناعي ينتظر رقم سعراتك."
                : "The free trial is one generation at a time (5 per day) with no account and no saving — by design: the platform's full value is saved programs, repeated EVO generation, and human coach follow-up, and those stay exactly where the paid memberships put them. For instant browsing, the ready workout programs are laid out for every level and goal; for every movement explained, the exercise library holds 868+ exercises — and for the diet side of your week, the AI meal planner is waiting for your calorie number."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={isAr ? "/ar/programs" : "/programs"} className="rounded-full border border-[var(--edge)] px-4 py-2 text-sm font-normal text-[var(--text)] transition-colors hover:border-[var(--chrome-edge)]">
                {isAr ? "برامج جاهزة" : "Ready programs"}
              </Link>
              <Link href={isAr ? "/ar/exercises" : "/exercises"} className="rounded-full border border-[var(--edge)] px-4 py-2 text-sm font-normal text-[var(--text)] transition-colors hover:border-[var(--chrome-edge)]">
                {isAr ? "مكتبة التمارين" : "Exercise library"}
              </Link>
              <Link href={isAr ? "/ar/ai-meal-planner" : "/ai-meal-planner"} className="rounded-full border border-[var(--edge)] px-4 py-2 text-sm font-normal text-[var(--text)] transition-colors hover:border-[var(--chrome-edge)]">
                {isAr ? "مخطط الوجبات بالذكاء الاصطناعي" : "AI Meal Planner"}
              </Link>
              <Link href={isAr ? "/ar/tools/calorie-calculator" : "/tools/calorie-calculator"} className="rounded-full border border-[var(--edge)] px-4 py-2 text-sm font-normal text-[var(--text)] transition-colors hover:border-[var(--chrome-edge)]">
                {isAr ? "حاسبة السعرات" : "Calorie calculator"}
              </Link>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
              {isAr ? "تذكير السلامة المعتاد" : "The usual safety reminder"}
            </h2>
            <p className="mt-3 text-base font-normal leading-relaxed text-[var(--muted-foreground)]">
              {isAr
                ? "الأنظمة المولّدة عامة لبالغين أصحاء. إن كان لديك ألم أو إصابة — خصوصاً في الظهر أو الركبة أو الكتف — أو وضع صحي مزمن، فالحركات المناسبة لك تُضبط مع مختص يرى ملفك كاملاً؛ استعمل النظام مادة نقاش ممتازة معه لا بديلاً عنه، وأي تمرين يؤلمك اليوم يُستبدل لا يُجاهد."
                : "Generated splits are general guidance for healthy adults. If you live with pain or an injury — especially in the back, knees, or shoulders — or a chronic condition, the right movements for you are set with a professional who sees your full file; use the split as an excellent discussion piece with them, never a replacement — and any exercise that hurts today gets swapped, not fought."}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
