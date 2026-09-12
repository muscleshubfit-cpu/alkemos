"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/SiteHeader";
import { AdSenseAd } from "@/components/AdSenseAd";
import { OtherTools } from "@/components/OtherTools";
import { ReviewInviteCard } from "@/components/ReviewInviteCard";
import { demoSystemOptions, type DemoPlan } from "@/lib/ai-meal-planner";
import {
  ensureGuestId,
  loadGuestPlan,
  saveGuestPlan,
} from "@/lib/plan-persistence";
import { Loader2, Sparkles, RotateCcw, HardDriveDownload, Check } from "lucide-react";

/**
 * /ai-meal-planner — the AI meal planner page (§12.28 → Phase 183,
 * owner decree 2026-09-13 «البوول الموحد» — spec "Alkemos —
 * Membership & Plan Changes").
 *
 * The bilingual client page behind /ai-meal-planner and its AR mirror
 * /ar/ai-meal-planner (re-export). Generation via
 * /api/ai/meal-plan-demo within the caller's unified monthly pool
 * (guest 2/month — no signup wall; member 2/4/8/8 by tier), counted
 * ONLY on success.
 *
 * PERSISTENCE LAW (the disappearing-plan fix): the generated plan is
 * never "render-only state" anymore —
 *   - GUEST: mirrored to localStorage (plan-persistence.ts) and
 *     re-hydrated on mount, so navigation, food-detail visits, back
 *     buttons, and refreshes all keep the plan. It stays visible even
 *     after the monthly pool is exhausted (plans are data, not quota).
 *   - MEMBER: the route auto-saves to the account (`plans` table) —
 *     hydration prefers the account copy (cross-device), localStorage
 *     stays as the offline cache.
 * The signup nudge for guests is SOFT: benefits only, never a block.
 */

type QuotaInfo = { used: number; limit: number; remaining: number };

export default function AiMealPlannerPage() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const { profile } = useAuth();

  const [calories, setCalories] = useState("2000");
  const [system, setSystem] = useState("balanced");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<DemoPlan | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [accountSaved, setAccountSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const systems = demoSystemOptions(isAr ? "ar" : "en");

  // ── HYDRATION: restore the plan so navigation/refresh never loses it.
  // Member → account copy (cross-device); guest → localStorage copy. ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (profile) {
        try {
          const res = await fetch("/api/ai/planner-plan?kind=nutrition");
          if (res.ok) {
            const data = await res.json();
            if (!cancelled && data?.plan) {
              setPlan(data.plan as DemoPlan);
              setAccountSaved(true);
              const inputs = data?.inputs ?? null;
              if (inputs) {
                if (typeof inputs.calories === "number") setCalories(String(inputs.calories));
                if (typeof inputs.system === "string") setSystem(inputs.system);
                if (typeof inputs.notes === "string") setNotes(inputs.notes);
              }
            }
          }
        } catch {
          /* offline → localStorage fallback below */
        }
      }
      if (!cancelled && !profile) {
        const stored = loadGuestPlan("nutrition");
        if (stored) {
          setPlan(stored.plan);
          const inputs = stored.inputs ?? null;
          if (inputs) {
            if (typeof inputs.calories === "number") setCalories(String(inputs.calories));
            if (typeof inputs.system === "string") setSystem(inputs.system);
            if (typeof inputs.notes === "string") setNotes(inputs.notes);
          }
        }
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.id]); // re-run when the login state settles

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
      // Guests: stable per-browser id — the server hashes it into the
      // unified-pool ledger key. Members: cookie auth identifies them.
      const guestId = profile ? undefined : ensureGuestId() || undefined;
      const res = await fetch("/api/ai/meal-plan-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calories: Number(calories),
          system,
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
      // cache. Storage failures are swallowed by the lib.
      saveGuestPlan("nutrition", newPlan, {
        calories: Number(calories),
        system,
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
            {isAr ? "مخطط الوجبات بالذكاء الاصطناعي" : "AI Meal Planner"}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base font-normal text-[var(--muted-foreground)] md:text-lg">
            {isAr
              ? "ولّد خطة يوم كاملة بالغرامات والسعرات في ثوانٍ — مجاناً وبلا تسجيل."
              : "Generate a complete day plan in grams and calories in seconds — free, no signup."}
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
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={generate}
              disabled={loading || !calories}
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
                  ? isAr ? "ولّد خطة أخرى" : "Generate another plan"
                  : isAr ? "ولّد خطتي المجانية" : "Generate my free plan"}
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
                {isAr ? "خطتك المولّدة لهذا اليوم" : "Your generated day"}
              </h2>
              <span className="text-sm text-[var(--muted-foreground)]" dir="ltr">
                {plan.kcal} kcal
              </span>
            </div>
            {accountSaved && (
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted-2)]">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                {isAr ? "محفوظة في حسابك — متاحة من أي جهاز" : "Saved to your account — available on any device"}
              </p>
            )}
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
                ? "الخطة تقدير تعليمي قابل للنسخ — راجعها وعدّل كمياتها على مائدتك، وقِس أثرها بالاتجاه الأسبوعي لا بقراءة يوم. خطتك تبقى معك على هذا الجهاز في التنقل والتحديث، ولا تختفي عند استنفاد رصيد الشهر."
                : "This plan is a copyable educational estimate — review it, adjust the portions to your table, and measure its effect on the weekly trend, not a single reading. Your plan stays with you on this device across navigation and refreshes — and never disappears when the month's quota runs out."}
            </p>

            {/* SOFT signup nudge (guests only) — benefits, never a wall. */}
            {!profile && (
              <div className="mt-6 rounded-2xl border border-[var(--chrome-edge)]/50 bg-[var(--card)] p-5">
                <h3 className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-[var(--text)]">
                  <HardDriveDownload className="h-4 w-4" aria-hidden="true" />
                  {isAr ? "احفظ خطتك في حساب — مجاناً" : "Save your plan to a free account"}
                </h3>
                <p className="mt-2 text-sm font-normal leading-relaxed text-[var(--muted-foreground)]">
                  {isAr
                    ? "خطتك الآن محفوظة على هذا الجهاز فقط. بإنشاء حساب مجاني تُحفظ كل خطة تولّدها تلقائيًا في حسابك وتصل إليها من أي جهاز، وتديرها من صفحة خططي. ومع بريميوم يرتفع رصيدك إلى 4 توليدات شهريًا (و8 مع برو) مع حفظ وتحميل كامل الخطط."
                    : "Right now your plan lives on this device only. Create a free account and every plan you generate is saved to it automatically — reachable from any device and managed from your plans page. Premium lifts your monthly pool to 4 generations (8 with Pro) plus full plan saving and export."}
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
        <OtherTools current="/ai-meal-planner" />

        {/* Honest explainer */}
        <section className="mt-10 space-y-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
              {isAr ? "ماذا يحسّنه التوليد بالذكاء الاصطناعي؟" : "What does AI generation actually add?"}
            </h2>
            <p className="mt-3 text-base font-normal leading-relaxed text-[var(--muted-foreground)]">
              {isAr
                ? "الحسبة الغذائية بسيطة، والاختيار هو الصعب: التوليد يحل مشكلة «ماذا آكل اليوم؟» بوضع يوم كامل مبني على رقمك ونظامك وملاحظاتك في ثوانٍ — بدل صفحة بيضاء أو نسخ خطة صديقك. النموذج يلتزم بقواعد صارمة (3–5 وجبات، أصناف بغرامات، إجمالي ضمن 20% من هدفك) وكل خطة تُفحص قبل عرضها؛ فإن خرجت عن الشكل تُرفض لا تُعرض — والمحاولة الفاشلة لا تُحسب من رصيدك."
                : "Nutrition arithmetic is simple; the choosing is hard. Generation solves the \"what do I eat today?\" problem by laying out a whole day built on your number, your system, and your notes in seconds — instead of a blank page or copying a friend's plan. The model follows strict rules (3–5 meals, items in grams, a total within 20% of your target) and every plan is validated before display; a drifted one is rejected, never shown — and failed attempts never count against your quota."}
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
              {isAr ? "حدود الاستخدام — وبقية المسارات" : "The usage limits — and the rest of the paths"}
            </h2>
            <p className="mt-3 text-base font-normal leading-relaxed text-[var(--muted-foreground)]">
              {isAr
                ? "كل زائر يحصل على توليديْن ناجحيْن شهريًا بلا حساب ولا تسجيل — والرصيد يُحسب للتوليد الناجح فقط. بإنشاء حساب مجاني تبقى خططك محفوظة في حسابك من أي جهاز؛ ومع بريميوم يرتفع الرصيد إلى 4 توليدات شهريًا (و8 مع برو) مع الحفظ والإدارة الكاملة. للتحكم اليدوي بلا أي حد، افتح مخطط الوجبات وابنِ يومك صنفاً صنفاً بإجماليات حية؛ ولتصفح جاهز فوري، مصفوفة خطط الطعام تضم 24 خطة يوم معروضة بالغرامات."
                : "Every visitor gets 2 successful generations per month — no account, no signup, and only successful generations count. Create a free account and your plans are saved to it from any device; Premium lifts the pool to 4 generations a month (8 with Pro) with full saving and management. For manual control with no limits at all, open the meal planner and build your day item by item with live totals; for instant browsing, the diet-plan matrix holds 24 complete daily plans laid out in grams."}
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
