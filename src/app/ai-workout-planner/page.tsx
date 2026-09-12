"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/SiteHeader";
import { AdSenseAd } from "@/components/AdSenseAd";
import { OtherTools } from "@/components/OtherTools";
import { ReviewInviteCard } from "@/components/ReviewInviteCard";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { getFallbackSVG } from "@/lib/exercise-images";
import {
  workoutEquipmentOptions,
  workoutGoalOptions,
  workoutLevelOptions,
  type WorkoutPlan,
} from "@/lib/ai-workout-planner";
import {
  ensureGuestId,
  loadGuestPlan,
  saveGuestPlan,
} from "@/lib/plan-persistence";
import { Loader2, Sparkles, RotateCcw, HardDriveDownload, Check } from "lucide-react";

/**
 * /ai-workout-planner — the AI workout planner page (§12.32 → Phase
 * 183, owner decree 2026-09-13 «البوول الموحد» — spec "Alkemos —
 * Membership & Plan Changes") — the workout twin of the meal-planner
 * page: unified monthly pool (guest 2/month — no signup wall; member
 * 2/4/8/8 by tier), success-only counting, and the PERSISTENCE LAW:
 *   - GUEST: plan mirrored to localStorage, re-hydrated on mount —
 *     navigation, exercise-detail visits, back buttons, and refreshes
 *     never lose it; it stays rendered after the pool is exhausted.
 *   - MEMBER: the route auto-saves to the account (`plans` table);
 *     hydration prefers the account copy (cross-device).
 * The signup nudge for guests is SOFT (benefits, never a block).
 */

type DemoLibraryMatch = {
  slug: string;
  name: string;
  category: string;
  image: string;
};
type DemoExercise = { name: string; sets: number; reps: number | string; library?: DemoLibraryMatch | null };
type DemoDay = { name: string; focus?: string; exercises: DemoExercise[] };
type DemoPlan = { days: DemoDay[] };

type QuotaInfo = { used: number; limit: number; remaining: number };

export default function AiWorkoutPlannerPage() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const { profile } = useAuth();

  const [goal, setGoal] = useState("muscle");
  const [level, setLevel] = useState("beginner");
  const [days, setDays] = useState("3");
  const [equipment, setEquipment] = useState("full-gym");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<DemoPlan | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [accountSaved, setAccountSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const goals = workoutGoalOptions(isAr ? "ar" : "en");
  const levels = workoutLevelOptions(isAr ? "ar" : "en");
  const equipments = workoutEquipmentOptions(isAr ? "ar" : "en");

  // ── HYDRATION: restore the plan so navigation/refresh never loses it.
  // Member → account copy (cross-device); guest → localStorage copy. ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (profile) {
        try {
          const res = await fetch("/api/ai/planner-plan?kind=workout");
          if (res.ok) {
            const data = await res.json();
            if (!cancelled && data?.plan) {
              setPlan(data.plan as DemoPlan);
              setAccountSaved(true);
              const inputs = data?.inputs ?? null;
              if (inputs) {
                if (typeof inputs.goal === "string") setGoal(inputs.goal);
                if (typeof inputs.level === "string") setLevel(inputs.level);
                if (typeof inputs.days === "number") setDays(String(inputs.days));
                if (typeof inputs.equipment === "string") setEquipment(inputs.equipment);
                if (typeof inputs.notes === "string") setNotes(inputs.notes);
              }
            }
          }
        } catch {
          /* offline → localStorage fallback below */
        }
      }
      if (!cancelled && !profile) {
        const stored = loadGuestPlan("workout");
        if (stored) {
          setPlan(stored.plan as unknown as DemoPlan);
          const inputs = stored.inputs ?? null;
          if (inputs) {
            if (typeof inputs.goal === "string") setGoal(inputs.goal);
            if (typeof inputs.level === "string") setLevel(inputs.level);
            if (typeof inputs.days === "number") setDays(String(inputs.days));
            if (typeof inputs.equipment === "string") setEquipment(inputs.equipment);
            if (typeof inputs.notes === "string") setNotes(inputs.notes);
          }
        }
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  // ── Initial quota readout (guest id only minted in the browser). ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const guestId = profile ? "" : ensureGuestId();
        const url = guestId ? `/api/ai/quota?guestId=${encodeURIComponent(guestId)}` : "/api/ai/quota";
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.plans && typeof data.plans.limit === "number") {
          setQuota({
            used: data.plans.used ?? 0,
            limit: data.plans.limit,
            remaining: data.plans.unlimited ? data.plans.limit : data.plans.remaining ?? 0,
          });
        }
      } catch {
        /* quota chip is best-effort display, never a blocker */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const guestId = profile ? undefined : ensureGuestId() || undefined;
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
          guestId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (isAr ? "تعذّر التوليد — حاول مرة أخرى." : "Generation failed — try again."));
        // 429 quota-exhausted / 422 shape-drift: the existing plan
        // STAYS rendered (spec: plans never disappear with the quota).
        if (data?.quota) {
          setQuota({
            used: data.quota.used ?? quota?.used ?? 0,
            limit: data.quota.limit ?? quota?.limit ?? 0,
            remaining: data.quota.remaining ?? 0,
          });
        }
        return;
      }
      const newPlan = data.plan as DemoPlan;
      setPlan(newPlan);
      setModel(data.model ?? null);
      setAccountSaved(Boolean(data?.saved));
      if (data?.quota) {
        setQuota({
          used: data.quota.used ?? 0,
          limit: data.quota.limit ?? 0,
          remaining: data.quota.remaining ?? 0,
        });
      }
      // LocalStorage mirror — guests' primary copy, members' offline
      // cache (the enriched plan — library links survive re-render).
      saveGuestPlan("workout", newPlan as unknown as WorkoutPlan, {
        goal,
        level,
        days: Number(days),
        equipment,
        notes,
      });
    } catch {
      setError(isAr ? "تعذّر التوليد — حاول مرة أخرى." : "Generation failed — try again.");
    } finally {
      setLoading(false);
    }
  };

  const quotaChip =
    quota && quota.limit > 0
      ? isAr
        ? `رصيد الشهر: ${quota.remaining} متبقٍ من ${quota.limit}`
        : `This month: ${quota.remaining} of ${quota.limit} left`
      : null;

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
              ? "ولّد نظاماً تدريبياً أسبوعياً متوازناً في ثوانٍ — مجاناً وبلا تسجيل."
              : "Generate a balanced weekly split in seconds — free, no signup."}
          </p>
          <div className="seal-chip mt-4 inline-flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[var(--muted-2)]" aria-hidden="true" />
            {isAr ? "مجاني: توليدان شهرياً لكل زائر بلا تسجيل" : "Free: 2 generations per month per visitor, no signup"}
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
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={generate}
              disabled={loading}
              className="btn-chrome inline-flex items-center justify-center gap-2 px-5 py-3 text-sm disabled:opacity-50"
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
            {quotaChip && (
              <span className="text-xs font-normal text-[var(--muted-foreground)]" data-testid="quota-chip">
                {quotaChip}
              </span>
            )}
          </div>
          {error && (
            <p className="mt-3 text-sm font-medium text-[#ff3b30]" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Generated plan — restored across navigation/refresh; stays
            rendered even when the monthly pool is exhausted. */}
        {hydrated && plan && (
          <section aria-live="polite" className="mt-8">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
                {isAr ? "نظامك المولّد لهذا الأسبوع" : "Your generated week"}
              </h2>
              <span className="text-sm text-[var(--muted-foreground)]">
                {isAr ? `${plan.days.length} أيام تمرين` : `${plan.days.length} training days`}
              </span>
            </div>
            {accountSaved && (
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted-2)]">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                {isAr ? "محفوظة في حسابك — متاحة من أي جهاز" : "Saved to your account — available on any device"}
              </p>
            )}
            {/* §12.35 — the results use the site's own exercise library:
                matched movements carry the library's real images and link
                into its bilingual pages (868+ exercises). */}
            <p className="mt-1 text-sm font-normal text-[var(--muted-foreground)]">
              {isAr
                ? "الحركات المطابقة في مكتبة التمارين تظهر بصورها من المكتبة وترتبط بصفحة شرحها الكامل — أكثر من 868 تمريناً بالأداء الصحيح."
                : "Movements that match our exercise library carry its images and link to their full how-to pages — 868+ exercises with proper form."}
            </p>
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
                    {day.exercises.map((ex, i) => {
                      const lib = ex.library ?? null;
                      const href = lib ? `${isAr ? "/ar" : ""}/exercises/${lib.slug}` : null;
                      return (
                        <li key={`${ex.name}-${i}`} className="flex items-center gap-3 py-2 text-sm font-normal">
                          {lib && href ? (
                            <>
                              <Link href={href} className="shrink-0" tabIndex={-1} aria-hidden="true">
                                <span className="block h-12 w-12 overflow-hidden rounded-lg border border-[var(--edge)]/60 bg-[var(--card)]">
                                  <ImageWithFallback
                                    src={lib.image}
                                    alt={isAr ? `صورة ${ex.name}` : `${ex.name} illustration`}
                                    width={48}
                                    height={48}
                                    className="h-12 w-12 object-contain"
                                    fallbackSrc={getFallbackSVG(lib.category)}
                                  />
                                </span>
                              </Link>
                              <Link
                                href={href}
                                className="min-w-0 flex-1 text-[var(--text)] underline decoration-[var(--edge)] underline-offset-4 transition-colors hover:decoration-[var(--chrome-edge)]"
                              >
                                {ex.name}
                              </Link>
                            </>
                          ) : (
                            <span className="min-w-0 flex-1 text-[var(--muted-foreground)]">{ex.name}</span>
                          )}
                          <span className="whitespace-nowrap text-[var(--muted-foreground)]" dir="ltr">
                            {ex.sets} × {ex.reps}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm font-normal leading-relaxed text-[var(--muted-foreground)]">
              {isAr
                ? "النظام تقدير تعليمي قابل للنسخ — راجع أداء كل حركة على أدائك أنت، وابدأ بأوزان تُتقن بها الشكل الكامل قبل التدرج. نظامك يبقى معك على هذا الجهاز في التنقل والتحديث، ولا يختفي عند استنفاد رصيد الشهر."
                : "This split is a copyable educational estimate — review every movement against your own performance, and start with weights you can own with full form before climbing. Your split stays with you on this device across navigation and refreshes — and never disappears when the month's quota runs out."}
            </p>

            {/* SOFT signup nudge (guests only) — benefits, never a wall. */}
            {!profile && (
              <div className="mt-6 rounded-2xl border border-[var(--chrome-edge)]/50 bg-[var(--card)] p-5">
                <h3 className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-[var(--text)]">
                  <HardDriveDownload className="h-4 w-4" aria-hidden="true" />
                  {isAr ? "احفظ نظامك في حساب — مجاناً" : "Save your split to a free account"}
                </h3>
                <p className="mt-2 text-sm font-normal leading-relaxed text-[var(--muted-foreground)]">
                  {isAr
                    ? "نظامك الآن محفوظ على هذا الجهاز فقط. بإنشاء حساب مجاني تُحفظ كل خطة تولّدها تلقائيًا في حسابك وتصل إليها من أي جهاز، وتديرها من صفحة خططي. ومع بريميوم يرتفع رصيدك إلى 4 توليدات شهريًا (و8 مع برو) مع الحفظ والإدارة الكاملة."
                    : "Right now your split lives on this device only. Create a free account and every plan you generate is saved to it automatically — reachable from any device and managed from your plans page. Premium lifts your monthly pool to 4 generations (8 with Pro) plus full plan saving and management."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={isAr ? "/ar/auth?mode=signup" : "/auth?mode=signup"}
                    className="btn-chrome inline-flex items-center gap-2 px-4 py-2 text-sm"
                  >
                    {isAr ? "أنشئ حساباً مجانياً" : "Create a free account"}
                  </Link>
                  <Link
                    href={isAr ? "/ar/memberships" : "/memberships"}
                    className="rounded-full border border-[var(--edge)] px-4 py-2 text-sm font-normal text-[var(--text)] transition-colors hover:border-[var(--chrome-edge)]"
                  >
                    {isAr ? "قارن العضويات" : "Compare memberships"}
                  </Link>
                </div>
              </div>
            )}

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
                ? "أي مدرب يعرف التمارين؛ والصعب هو تركيبها في أسبوع متوازن يطابق أيامك ومستواك وتجهيزتك. التوليد يحل مشكلة «من أين أبدأ هذا الأسبوع؟» بوضع نظام كامل أمامك في ثوانٍ — بدل نسخ نظام يوتيوب لم يُبنَ لك. النموذج يلتزم بقواعد صارمة (عدد الأيام يطابق طلبك بالضبط، 4 إلى 6 تمارين لكل يوم، مجموعات وتكرارات معقولة) وكل نظام يُفحص قبل عرضه؛ فإن خرج عن الشكل يُرفض لا يُعرض — والمحاولة الفاشلة لا تُحسب من رصيدك."
                : "Any coach knows the exercises; the hard part is assembling them into a balanced week that fits your days, level, and equipment. Generation solves the \"where do I even start this week?\" problem by laying out a complete split in seconds — instead of copying a YouTube program never built for you. The model follows strict rules (the day count matches your request exactly, 4 to 6 exercises per day, sane sets and reps) and every split is validated before display; a drifted one is rejected, never shown — and failed attempts never count against your quota."}
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
              {isAr ? "حدود الاستخدام — وبقية المسارات" : "The usage limits — and the rest of the paths"}
            </h2>
            <p className="mt-3 text-base font-normal leading-relaxed text-[var(--muted-foreground)]">
              {isAr
                ? "كل زائر يحصل على توليديْن ناجحيْن شهريًا بلا حساب ولا تسجيل — والرصيد يُحسب للتوليد الناجح فقط، وخططك السابقة تبقى متاحة بعد استنفاده. بإنشاء حساب مجاني تُحفظ خططك من أي جهاز؛ ومع بريميوم يرتفع الرصيد إلى 4 توليدات شهريًا (و8 مع برو). للتصفح الجاهز فوراً، برامج التدريب الجاهزة معروضة لكل مستوى وهدف؛ ولكل حركة بشرحها، مكتبة التمارين تضم أكثر من 868 تمريناً — ولنظامك الغذائي، مخطط الوجبات بالذكاء الاصطناعي ينتظر رقم سعراتك."
                : "Every visitor gets 2 successful generations per month — no account, no signup, and only successful generations count; your previous plans stay available after the quota runs out. Create a free account and your plans are saved from any device; Premium lifts the pool to 4 generations a month (8 with Pro). For instant browsing, the ready workout programs are laid out for every level and goal; for every movement explained, the exercise library holds 868+ exercises — and for the diet side of your week, the AI meal planner is waiting for your calorie number."}
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
