"use client";

import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { weeksUnitAr } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { listBlogPosts, getCategoryLabel, selectHomeBlogCarousels, type BlogPostCard } from "@/lib/blog";
import { deferIdle } from "@/lib/defer-idle";
import { EXERCISES_COUNT, EXERCISE_CATEGORY_COUNTS } from "@/lib/exercises-shared";
import { FOODS_COUNT } from "@/lib/foods-shared";
import { TOOLS_COUNT } from "@/lib/tools-shared";
import { MEMBERSHIPS } from "@/lib/memberships";
import { openEvoFloatingChat } from "@/lib/evo-chat-events";
import {
  calculateCalorieTargets,
  isValidCalculatorInput,
  type CalorieTargets,
  type FitnessActivity,
  type FitnessGender,
  type FitnessGoal,
} from "@/lib/fitness-math";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getFAQSchema, jsonLd } from "@/lib/seo";
import Image from "next/image";
import { ThemeImg, EngravedIcon } from "@/components/ThemeImg";
import type {
  HomeExerciseSample,
  HomeFoodSample,
  HomeProgramSample,
  HomeSamples,
} from "@/lib/home-samples";

// ============================================================
// Site palette — the Marble & Chrome identity resolves through
// the CSS variables in globals.css (:root + [data-theme="dark"]).
// All tokens meet WCAG AAA on their intended backgrounds; --ai
// cyan stays reserved for AI-assistant surfaces only.
// ============================================================
const PALETTE = {
  textPrim: "var(--text)",
  textSec: "var(--muted-foreground)",
  textMuted: "var(--muted-foreground)",
  border: "var(--edge)",
  surface: "var(--card)",
  sectionWhite: "var(--bg)",
  sectionGray: "var(--tint)",
  halo: "var(--tint)",
};

// ============================================================
// Content-volume counts derive from the client-safe verified
// constants (pinned to the real arrays by library-counts.test.ts;
// TOOLS_COUNT derives from the hub array in tools-shared.ts) —
// when the platform grows, these labels grow with it.
// "+" marks CONTENT VOLUME only.
// ============================================================
const EX_PLUS = `${EXERCISES_COUNT.toLocaleString("en-US")}+`;
const FOODS_PLUS = `${FOODS_COUNT.toLocaleString("en-US")}+`;

// The seven muscle families the interactive library tab exposes
// (labels mirror the hub's own vocabulary; «كور» keeps the plain
// transliterated register — VRD-V4 K-5).
const MUSCLE_TABS = [
  { labelAr: "صدر", labelEn: "Chest", slug: "chest" },
  { labelAr: "ظهر", labelEn: "Back", slug: "back" },
  { labelAr: "أكتاف", labelEn: "Shoulders", slug: "shoulders" },
  { labelAr: "أرجل", labelEn: "Legs", slug: "legs" },
  { labelAr: "بايسبس", labelEn: "Biceps", slug: "biceps" },
  { labelAr: "ترايسبس", labelEn: "Triceps", slug: "triceps" },
  { labelAr: "كور", labelEn: "Core", slug: "core" },
] as const;

// ============================================================
// HOME-EXPERIENCE-269 (owner directive 2026-09-24: «الصفحة تبدو
// كصفحة تعرض وتشرح منتجًا، وليست كمنتج عالمي حي يجعل المستخدم
// يفهم القيمة ويشعر بها ويتفاعل معها» — rebuild the homepage as
// a LIVING product, not a presentation of one).
//
// DIAGNOSIS this rebuild answers (research: Freeletics / Hevy /
// MyFitnessPal / Whoop live audits + UX/CRO patterns 2025-26):
//   D1. Nothing on the old page could be USED — every section
//       presented content and routed away; the visitor never
//       touched the product on the homepage itself.
//   D2. Three sections shared one skeleton (heading → subtext →
//       card grid → button) — catalog rhythm, "grid fatigue".
//   D3. EVO — the differentiator — was explained in steps but
//       never SHOWN working.
//   D4. Zero motion: the page was a static document.
//   D5. Free-vs-paid landed as a pricing table, not a journey.
//
// THE NEW ARC — «الصفحة هي أول خمس دقائق من المنتج» (the page IS
// the product's first five minutes): FEEL → TOUCH → SEE → TRUST →
// GROW.
//   1. Hero (promise, owner artwork + account CTA law) →
//   2. Proof strip (auditable numbers, now count-up ALIVE) →
//   3. THE LIVING PRODUCT #start — three REAL product surfaces
//      running in-page: the calorie/macro calculator (same math
//      as the app tool via fitness-math.ts), an EVO conversation
//      demo (labeled example; the CTA opens the REAL floating
//      widget — the chat-surface law), and the interactive
//      muscle-group library browser (real curated samples swap
//      as you tap) →
//   4. #train — the PLAN world (programs lead; the exercise
//      grid moved into the living tab so no two sections share
//      a skeleton) →
//   5. #eat — the interactive plate: pick a real food, watch
//      its macros move →
//   6. #evo — the intelligence moment (planners + EVO + quota
//      transparency, warrior art) →
//   7. #learn → 8. #memberships — now framed by the growth
//   ladder (the memberships.ts repositioning) above the three
//   honest cards → 9. featured coaches → 10. #faq → final CTA
//   (+ a quiet "talk to EVO first" door).
//
// Copy laws: EN and AR are independent native pairs (never a
// translation); counts ride the verified constants; prices ride
// memberships.ts (single source — no literals); EVO quota facts
// mirror the unified pool; zero emoji; MSA-clean Arabic.
//
// PRESERVED VERBATIM from the previous phases: the Marble &
// Chrome identity (recipes + engraved icons + zero emoji), the
// Phase 202 real content entry points (getHomeSamples server
// slices), the Phase 203 account-driven CTA law, the EVO CHAT
// SURFACE LAW (the floating widget stays the only chat surface),
// the blog selection logic (selectHomeBlogCarousels), the paid
// featured-coaches strip (0037), and the FAQ JSON-LD single
// source. Motion is once-only, transform/opacity-only (zero
// CLS), and fully gated by prefers-reduced-motion.
// ============================================================

// ── Reveal — the living-page motion primitive ──
// The retired pre-258 reveal was jarring because it animated
// layout and re-triggered; this one is structurally incapable of
// both: it hides content ONLY after mount (SSR/no-JS users always
// see everything — the armed state never exists in markup),
// animates opacity/translateY only (zero CLS), fires once, and
// stands down entirely under prefers-reduced-motion.
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in ms (kept ≤200 so the group reads as one beat). */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // idle = server/motion-off (visible) · armed = hidden, waiting
  // for the observer · shown = revealed (stays forever).
  const [phase, setPhase] = useState<"idle" | "armed" | "shown">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPhase("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(el);
    // Arm AFTER the observer exists, so an element already in view
    // flips to "shown" in the observer's first callback — the
    // hidden state only ever spans one animation frame.
    setPhase("armed");
    // FAILSAFE (the jarring-reveal lesson, inverted): no content may
    // stay hidden past 1.8s in ANY environment — virtualized capture
    // viewports, IO quirks, background tabs. A fast scroller still
    // gets the entrance; a slow one simply finds everything visible.
    const failsafe = window.setTimeout(() => {
      setPhase("shown");
      io.disconnect();
    }, 1800);
    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  const hidden = phase === "armed";
  return (
    <div
      ref={ref}
      className={`rv ${className}`}
      style={{
        transitionDelay: delay ? `${delay}ms` : undefined,
        ...(hidden ? { opacity: 0, transform: "translateY(14px)" } : null),
      }}
    >
      {children}
    </div>
  );
}

// ── CountUp — the proof numbers come ALIVE ──
// SSR renders the final value (no-JS/hydration always shows the
// truth); when the strip scrolls into view and motion is allowed,
// the number counts up once over ~0.9s (ease-out cubic). The
// value stays derived from the verified constants.
function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (started || !entries.some((e) => e.isIntersecting)) return;
        started = true;
        io.disconnect();
        const t0 = performance.now();
        const dur = 900;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(Math.round(value * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  const shown = display ?? value;
  return (
    <span ref={ref}>
      {shown.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════
// THE LIVING PRODUCT — three REAL product surfaces that run
// in-page (HOME-EXPERIENCE-269). Each one is the product itself,
// not a description of it: the calculator runs the app's own
// math (fitness-math.ts single source), the EVO demo shows a
// real conversation and hands off to the REAL widget (the
// chat-surface law), and the library browser filters the real
// curated samples with a live swap.
// ══════════════════════════════════════════════════════════════

// ── Activity labels — the same register as the app tool so the
//    homepage and /tools read as ONE product. ──
const ACTIVITY_LABELS_AR: Record<FitnessActivity, string> = {
  sedentary: "خامل (بدون رياضة)",
  light: "نشاط خفيف (1-3 أيام/أسبوع)",
  moderate: "نشاط متوسط (3-5 أيام/أسبوع)",
  active: "نشاط عالي (6-7 أيام/أسبوع)",
  very_active: "نشاط شديد جدًا (رياضي محترف)",
};
const ACTIVITY_LABELS_EN: Record<FitnessActivity, string> = {
  sedentary: "Sedentary (little or no exercise)",
  light: "Lightly active (1-3 days/week)",
  moderate: "Moderately active (3-5 days/week)",
  active: "Very active (6-7 days/week)",
  very_active: "Extra active (athlete/pro)",
};

// Tab A — the REAL calorie/macro calculator (the app's own math).
function HomeCalculator({ isAr }: { isAr: boolean }) {
  const [gender, setGender] = useState<FitnessGender>("male");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activity, setActivity] = useState<FitnessActivity>("moderate");
  const [goal, setGoal] = useState<FitnessGoal>("maintain");
  const [result, setResult] = useState<CalorieTargets | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age, 10);
    if (!isValidCalculatorInput(a || NaN, w || NaN, h || NaN)) {
      setError(
        isAr
          ? "من فضلك أدخل عمرًا ووزنًا وطولًا صحيحة (أكبر من صفر)."
          : "Please enter a valid age, weight and height (greater than zero).",
      );
      return;
    }
    setError(null);
    setResult(
      calculateCalorieTargets({
        gender,
        age: a,
        weightKg: w,
        heightCm: h,
        activity,
        goal,
      }),
    );
  };

  // Macro bars scale against the largest macro of THIS result, so
  // the three chrome bars read as an honest relative picture.
  const maxMacro = result
    ? Math.max(result.protein, result.carbs, result.fat)
    : 1;
  const macros = result
    ? [
        {
          key: "protein",
          labelAr: "بروتين",
          labelEn: "Protein",
          grams: result.protein,
        },
        {
          key: "carbs",
          labelAr: "كربوهيدرات",
          labelEn: "Carbs",
          grams: result.carbs,
        },
        {
          key: "fat",
          labelAr: "دهون",
          labelEn: "Fat",
          grams: result.fat,
        },
      ]
    : [];

  const inputCls =
    "w-full rounded-xl border border-[var(--edge)] bg-[var(--card)] px-3 py-2.5 text-sm font-normal text-[var(--text)] outline-none transition-colors focus:border-[var(--text)]";
  const segmented = (active: boolean) =>
    `flex-1 rounded-full px-3 py-2 text-sm font-medium transition-all ${
      active
        ? "bg-[var(--text)] text-[var(--bg)]"
        : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--muted-2)]"
    }`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
      {/* Inputs */}
      <div className="space-y-5">
        {/* Gender + goal — two segmented rows */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: PALETTE.textMuted }}>
            {isAr ? "الجنس" : "Gender"}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setGender("male")} className={segmented(gender === "male")}>
              {isAr ? "ذكر" : "Male"}
            </button>
            <button type="button" onClick={() => setGender("female")} className={segmented(gender === "female")}>
              {isAr ? "أنثى" : "Female"}
            </button>
          </div>
        </div>

        {/* Age / weight / height — numeric trio */}
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { labelAr: "العمر (سنة)", labelEn: "Age (years)", value: age, set: setAge, mode: "numeric" },
              { labelAr: "الوزن (كجم)", labelEn: "Weight (kg)", value: weight, set: setWeight, mode: "decimal" },
              { labelAr: "الطول (سم)", labelEn: "Height (cm)", value: height, set: setHeight, mode: "numeric" },
            ] as const
          ).map((f) => (
            <label key={f.labelEn} className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: PALETTE.textMuted }}>
                {isAr ? f.labelAr : f.labelEn}
              </span>
              <input
                type="text"
                inputMode={f.mode}
                dir="ltr"
                value={f.value}
                onChange={(e) => f.set(e.target.value.replace(/[^\d.]/g, ""))}
                placeholder={f.mode === "decimal" ? "84" : "30"}
                className={inputCls}
              />
            </label>
          ))}
        </div>

        {/* Activity */}
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: PALETTE.textMuted }}>
            {isAr ? "مستوى النشاط" : "Activity level"}
          </span>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value as FitnessActivity)}
            className={`${inputCls} cursor-pointer appearance-none`}
          >
            {(Object.keys(ACTIVITY_LABELS_AR) as FitnessActivity[]).map((a) => (
              <option key={a} value={a}>
                {isAr ? ACTIVITY_LABELS_AR[a] : ACTIVITY_LABELS_EN[a]}
              </option>
            ))}
          </select>
        </label>

        {/* Goal */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: PALETTE.textMuted }}>
            {isAr ? "هدفك" : "Your goal"}
          </p>
          <div className="flex gap-2">
            {(
              [
                { g: "lose" as FitnessGoal, labelAr: "خسارة وزن", labelEn: "Lose weight" },
                { g: "maintain" as FitnessGoal, labelAr: "تثبيت الوزن", labelEn: "Maintain" },
                { g: "gain" as FitnessGoal, labelAr: "زيادة وزن", labelEn: "Gain weight" },
              ]
            ).map((o) => (
              <button key={o.g} type="button" onClick={() => setGoal(o.g)} className={segmented(goal === o.g)}>
                {isAr ? o.labelAr : o.labelEn}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-[var(--text)]">
            {error}
          </p>
        )}

        <button type="button" onClick={calculate} className="btn-chrome w-full px-6 py-3 text-sm md:text-base">
          {isAr ? "احسب أرقامي الآن" : "Calculate my numbers"}
        </button>
      </div>

      {/* Result — the product ANSWERS */}
      <div
        className="relative flex flex-col justify-center rounded-[var(--radius-chrome)] border border-[var(--edge)] bg-[var(--tint)] p-5 md:p-7"
        aria-live="polite"
      >
        {result ? (
          <div key={`${result.target}-${result.protein}`} className="swap-fade">
            <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: PALETTE.textMuted }}>
              {isAr ? "سعرك اليومية حول هدفك" : "Your daily target for this goal"}
            </p>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="chrome-text text-5xl font-bold tracking-tight md:text-6xl">
                {result.target.toLocaleString("en-US")}
              </span>
              <span className="text-sm font-semibold" style={{ color: PALETTE.textSec }}>
                {isAr ? "سعرة/يوم" : "kcal / day"}
              </span>
            </p>
            {/* Macro bars — the chrome metal grows with the answer */}
            <div className="mt-6 space-y-4">
              {macros.map((m) => (
                <div key={m.key}>
                  <div className="mb-1.5 flex items-baseline justify-between text-sm">
                    <span className="font-medium" style={{ color: PALETTE.textPrim }}>
                      {isAr ? m.labelAr : m.labelEn}
                    </span>
                    <span className="font-semibold" style={{ color: PALETTE.textSec }}>
                      {isAr ? `${m.grams.toLocaleString("en-US")} جم` : `${m.grams.toLocaleString("en-US")} g`}
                    </span>
                  </div>
                  <div className="macro-track">
                    <div
                      className="macro-fill"
                      style={{ width: `${Math.max(4, Math.round((m.grams / maxMacro) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs font-normal leading-relaxed" style={{ color: PALETTE.textMuted }}>
              {isAr
                ? "بنفس معادلات حاسبة السعرات في المنصة — ويمكنك بناء خطة تغذية وتمارين كاملة حول هذه الأرقام بالذكاء الاصطناعي."
                : "The same math as the platform's calorie calculator — and you can build a full nutrition and workout plan around these numbers with AI."}
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={isAr ? "/ar/ai-meal-planner" : "/ai-meal-planner"} className="btn-outline px-5 py-2.5 text-sm font-medium">
                {isAr ? "ابنِ خطتي حول هذه الأرقام" : "Build my plan around these"}
                <span className="rtl:rotate-180" aria-hidden="true">›</span>
              </a>
              <a
                href="/auth?mode=signup"
                className="self-center text-sm font-medium underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70"
                style={{ color: PALETTE.textSec }}
              >
                {isAr ? "احفظ النتيجة في حساب مجاني ›" : "Save this in a free account ›"}
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <EngravedIcon name="calories" alt="" size={40} className="mx-auto h-10 w-10 opacity-70" />
            <p className="mt-3 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "أدخل أرقامك واضغط احسب — النتيجة تظهر هنا فورًا، بنفس معادلات المنصة، دون حساب ودون مغادرة الصفحة."
                : "Enter your numbers and hit calculate — the result appears here instantly, with the platform's own formulas. No account, no leaving the page."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Tab B — the EVO conversation demo. A labeled illustrative
// exchange (honesty law: it SAYS it is an example), and the CTA
// hands off to the REAL floating widget — the EVO CHAT SURFACE
// LAW holds (this is a demonstration, never a second input).
function EvoTeaser({ isAr }: { isAr: boolean }) {
  const turns = isAr
    ? [
        { who: "user", text: "هدفي خسارة الدهون مع الحفاظ على العضلات. ما الذي يصلح لعشائي الليلة؟" },
        {
          who: "evo",
          text: "وجبة تناسب هدفك: 200 جرام صدر دجاج مشوي مع 150 جرام أرز أبيض وسلطة خضراء — نحو 520 سعرة و52 جرام بروتين. أخبرني بوزنك وأيام تدريبك وسأبني لك خطة الأسبوع كاملة.",
        },
        { who: "user", text: "وزني 84 كجم، وأتدرب أربعة أيام في الأسبوع." },
        {
          who: "evo",
          text: "تم. سعراتك اليومية الآن 2,150 سعرة مع 170 جرام بروتين — تكفي للحفاظ على عضلاتك أثناء خسارة الدهون. خطتك جاهزة، ويمكنك تعديل أي وجبة بتبديل ذكي.",
        },
      ]
    : [
        { who: "user", text: "I want to lose fat without losing muscle. What works for tonight's dinner?" },
        {
          who: "evo",
          text: "A meal that fits your goal: 200 g grilled chicken breast with 150 g white rice and a green salad — roughly 520 kcal and 52 g protein. Tell me your weight and training days and I'll build your whole week.",
        },
        { who: "user", text: "I'm 84 kg and I train four days a week." },
        {
          who: "evo",
          text: "Done. Your daily target is now 2,150 kcal with 170 g protein — enough to protect muscle while you cut. Your plan is ready, and you can adjust any meal with a smart swap.",
        },
      ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:gap-8">
      {/* The conversation */}
      <div className="space-y-3.5">
        {turns.map((t, i) =>
          t.who === "user" ? (
            <div key={i} className="flex justify-end">
              <p
                className="max-w-[85%] rounded-2xl rounded-es-md border border-[var(--edge)] bg-[var(--tint)] px-4 py-3 text-sm font-normal leading-relaxed"
                style={{ color: PALETTE.textPrim }}
              >
                {t.text}
              </p>
            </div>
          ) : (
            <div key={i} className="flex items-end justify-start gap-2.5">
              <ThemeImg
                light="/images/brand/evo-widget-light.webp"
                dark="/images/brand/evo-widget-dark.webp"
                alt="EVO"
                width={64}
                height={64}
                className="h-9 w-9 shrink-0 rounded-full border border-[var(--edge)] object-cover"
              />
              <p
                className="marble-card max-w-[85%] px-4 py-3 text-sm font-normal leading-relaxed"
                style={{ color: PALETTE.textPrim, borderRadius: "1rem 1rem 1rem 0.25rem" }}
              >
                {t.text}
              </p>
            </div>
          ),
        )}
      </div>

      {/* The hand-off */}
      <div className="flex flex-col justify-center rounded-[var(--radius-chrome)] border border-[var(--edge)] bg-[var(--tint)] p-5 md:p-7">
        <span className="seal-chip">
          <EngravedIcon name="evo" alt="" size={12} className="h-3 w-3" />
          {isAr ? "نموذج توضيحي لمحادثة" : "AN ILLUSTRATIVE EXCHANGE"}
        </span>
        <p className="mt-4 text-base font-semibold leading-relaxed" style={{ color: PALETTE.textPrim }}>
          {isAr
            ? "هكذا يعمل EVO: يفهم هدفك، يجيب بأرقام، ثم يبني ويعدّل خطتك."
            : "This is how EVO works: it understands your goal, answers with numbers, then builds and adjusts your plan."}
        </p>
        <p className="mt-2 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
          {isAr
            ? "اسأله بالعربية أو الإنجليزية عن التدريب والتغذية، أو اطلب خطة كاملة حول بياناتك — ثم عدّلها بتبديلات ذكية."
            : "Ask it in Arabic or English about training or nutrition, or request a full plan around your data — then fine-tune it with smart swaps."}
        </p>
        <button
          type="button"
          onClick={openEvoFloatingChat}
          className="btn-chrome mt-6 px-6 py-3 text-sm md:text-base"
        >
          <span className="live-dot" aria-hidden="true" />
          {isAr ? "أكمل المحادثة مع EVO" : "Continue this conversation"}
        </button>
        <p className="mt-3 text-xs font-normal leading-relaxed" style={{ color: PALETTE.textMuted }}>
          {isAr
            ? "الزوار يحصلون على 10 رسائل يوميًا مع EVO — دون تسجيل."
            : "Visitors get 10 messages a day with EVO — no signup."}
        </p>
      </div>
    </div>
  );
}

// Tab C — the interactive library browser. Real curated samples
// (the server-provided slices — the bundle law holds) filtered
// in-page by muscle group, with a quiet crossfade on every swap.
function LibraryBrowser({ samples, isAr }: { samples: HomeSamples; isAr: boolean }) {
  const [cat, setCat] = useState<string>("chest");
  const filtered = samples.exercises.filter((e) => e.categorySlug === cat);

  return (
    <div>
      {/* The muscle chips — the SAME hub vocabulary, now answering */}
      <div>
        <p className="text-center text-xs font-semibold uppercase tracking-wider" style={{ color: PALETTE.textMuted }}>
          {isAr ? "اختر مجموعة عضلية" : "Pick a muscle group"}
        </p>
        <div className="chips-row scrollbar-none mt-3">
          {MUSCLE_TABS.map((c) => {
            const active = c.slug === cat;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => setCat(c.slug)}
                aria-pressed={active}
                className="seal-chip transition-transform duration-300 hover:-translate-y-0.5"
                style={
                  active
                    ? {
                        background: "var(--text)",
                        color: "var(--bg)",
                        borderColor: "var(--text)",
                      }
                    : undefined
                }
                title={isAr ? `${EXERCISE_CATEGORY_COUNTS[c.slug] ?? 0} تمرينًا` : `${EXERCISE_CATEGORY_COUNTS[c.slug] ?? 0} exercises`}
              >
                {isAr ? c.labelAr : c.labelEn}
                <span className="font-semibold">{EXERCISE_CATEGORY_COUNTS[c.slug] ?? 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* The live swap — real cards re-render per selection */}
      {filtered.length > 0 ? (
        <div key={cat} className="swap-fade mt-7 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((ex) => (
            <LandingExerciseCard key={ex.slug} ex={ex} isAr={isAr} />
          ))}
        </div>
      ) : (
        <p className="mt-7 text-center text-sm" style={{ color: PALETTE.textSec }}>
          {isAr ? "لا عينات منسقة لهذه المجموعة بعد — افتح المكتبة الكاملة." : "No curated samples for this group yet — open the full library."}
        </p>
      )}

      <p className="mt-6 text-center text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
        {isAr
          ? `كل بطاقة تمرين حقيقي من مكتبة ${EX_PLUS} تمرينًا — بصور الأداء الصحيح وشرح واضح داخل صفحته.`
          : `Every card is a real exercise from the ${EX_PLUS} library — with form photos and clear instructions one tap away.`}
      </p>
      <div className="mt-5 text-center">
        <a href={isAr ? "/ar/exercises" : "/exercises"} className="btn-outline px-7 py-3 text-sm font-medium md:text-base">
          {isAr ? "استكشف مكتبة التمارين كاملة" : "Explore the full exercise library"}
          <span className="rtl:rotate-180" aria-hidden="true">›</span>
        </a>
      </div>
    </div>
  );
}

function BlogCarousel({
  posts,
  featuredSlugs = [],
  isAr,
}: {
  posts: BlogPostCard[];
  /** Featured slugs render as the dark lead card; ONE carousel since
      Phase 198 Batch 2 (selection logic untouched). */
  featuredSlugs?: string[];
  isAr: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const featuredSet = new Set(featuredSlugs);

  return (
    <div className="relative">
      {/* Scroll buttons */}
      <div className="mb-4 flex justify-end gap-2">
        <button
          onClick={() => scroll(isAr ? "right" : "left")}
          className="grid h-9 w-9 max-md:h-11 max-md:w-11 place-items-center rounded-full transition-colors"
          style={{ backgroundColor: PALETTE.surface, color: PALETTE.textPrim, border: `1px solid ${PALETTE.border}` }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = PALETTE.halo; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = PALETTE.surface; }}
          aria-label={isAr ? "السابق" : "Previous"}
        >
          <svg className="h-4 w-4 rtl:rotate-180" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={() => scroll(isAr ? "left" : "right")}
          className="grid h-9 w-9 max-md:h-11 max-md:w-11 place-items-center rounded-full transition-colors"
          style={{ backgroundColor: PALETTE.surface, color: PALETTE.textPrim, border: `1px solid ${PALETTE.border}` }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = PALETTE.halo; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = PALETTE.surface; }}
          aria-label={isAr ? "التالي" : "Next"}
        >
          <svg className="h-4 w-4 rtl:rotate-180" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5-4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style jsx>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>
        {posts.map((post) => {
          const isFeatured = featuredSet.has(post.slug);
          return (
          <a
            key={post.id}
            href={`${isAr ? "/ar" : ""}/blog/${encodeURIComponent(post.slug)}`}
            className="marble-card card-lift group block shrink-0"
            style={{
              color: isFeatured ? "#F5F5F7" : PALETTE.textPrim,
              width: isFeatured ? "18rem" : "20rem",
              backgroundColor: isFeatured ? "#0B0B0D" : undefined,
            }}
          >
            {post.featured_image && (
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={post.featured_image}
                  alt={post.cover_alt || post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-5">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: isFeatured ? "rgba(245,245,247,0.65)" : "var(--muted-foreground)" }}
              >
                {getCategoryLabel(post.category, isAr ? "ar" : "en")}
              </p>
              <h3 className="mt-2 text-lg font-semibold leading-tight tracking-tight line-clamp-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p
                  className="mt-2 line-clamp-2 text-sm font-normal"
                  style={{ color: isFeatured ? "rgba(255,255,255,0.7)" : PALETTE.textSec }}
                >
                  {post.excerpt}
                </p>
              )}
              <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: isFeatured ? "#F5F5F7" : PALETTE.textPrim }}>
                <EngravedIcon name="scroll" alt="" size={14} className="h-3.5 w-3.5" />
                {isAr ? "اقرأ ›" : "Read ›"}
              </p>
            </div>
          </a>
          );
        })}
      </div>
    </div>
  );
}

// ── The interactive plate (#eat) — pick a real food, watch its
//    numbers move. The per-100g values are the LIVE database
//    values (server-provided samples); the contextual sentence is
//    DERIVED from the same numbers, never hand-written. ──
function FoodExplorer({ samples, isAr }: { samples: HomeSamples; isAr: boolean }) {
  const [selectedSlug, setSelectedSlug] = useState(samples.foods[0]?.slug ?? "");
  const selected: HomeFoodSample | undefined =
    samples.foods.find((f) => f.slug === selectedSlug) ?? samples.foods[0];

  const maxMacro = selected
    ? Math.max(selected.protein, selected.carbs, selected.fat)
    : 1;
  const bars = selected
    ? [
        { key: "protein", labelAr: "بروتين", labelEn: "Protein", grams: selected.protein },
        { key: "carbs", labelAr: "كربوهيدرات", labelEn: "Carbs", grams: selected.carbs },
        { key: "fat", labelAr: "دهون", labelEn: "Fat", grams: selected.fat },
      ]
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-8">
      {/* The panel — the numbers MOVE with the selection */}
      <div
        className="flex flex-col justify-center rounded-[var(--radius-chrome)] border border-[var(--edge)] bg-[var(--tint)] p-5 md:p-7"
        aria-live="polite"
      >
        {selected && (
          <div key={selected.slug} className="swap-fade">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: PALETTE.textMuted }}>
              {isAr ? selected.categoryLabelAr : selected.categoryLabelEn}
            </p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>
              {isAr ? selected.nameAr : selected.nameEn}
            </h3>
            <p className="mt-3 flex items-baseline gap-2">
              <span className="chrome-text text-5xl font-bold tracking-tight">
                {selected.calories.toLocaleString("en-US")}
              </span>
              <span className="text-sm font-semibold" style={{ color: PALETTE.textSec }}>
                {isAr ? "سعرة / 100 جم" : "kcal / 100 g"}
              </span>
            </p>
            <div className="mt-6 space-y-4">
              {bars.map((b) => (
                <div key={b.key}>
                  <div className="mb-1.5 flex items-baseline justify-between text-sm">
                    <span className="font-medium" style={{ color: PALETTE.textPrim }}>
                      {isAr ? b.labelAr : b.labelEn}
                    </span>
                    <span className="font-semibold" style={{ color: PALETTE.textSec }}>
                      {isAr ? `${b.grams.toLocaleString("en-US")} جم` : `${b.grams.toLocaleString("en-US")} g`}
                    </span>
                  </div>
                  <div className="macro-track">
                    <div
                      className="macro-fill"
                      style={{ width: `${Math.max(4, Math.round((b.grams / maxMacro) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* The DERIVED contextual line — numbers, not adjectives */}
            <p className="mt-6 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
              {isAr
                ? `كل 100 جرام من ${selected.nameAr} تمنحك ${selected.calories.toLocaleString("en-US")} سعرة، منها ${selected.protein.toLocaleString("en-US")} جرام بروتين — والبقية أرقام مباشرة تصنع بها وجبتك.`
                : `Every 100 g of ${selected.nameEn} gives you ${selected.calories.toLocaleString("en-US")} kcal, including ${selected.protein.toLocaleString("en-US")} g of protein — real numbers you can build a meal around.`}
            </p>
            <a
              href={`${isAr ? "/ar" : ""}/foods/${selected.slug}`}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70"
              style={{ color: PALETTE.textPrim }}
            >
              {isAr ? "افتح صفحة الصنف كاملة ›" : "Open the full food page ›"}
            </a>
          </div>
        )}
      </div>

      {/* The real sample cards — tappable selectors */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {samples.foods.map((food) => {
          const active = food.slug === selected?.slug;
          return (
            <button
              key={food.slug}
              type="button"
              onClick={() => setSelectedSlug(food.slug)}
              aria-pressed={active}
              className="marble-card card-lift group flex cursor-pointer flex-col p-4 text-start transition-colors"
              style={
                active
                  ? {
                      borderColor: "var(--text)",
                      boxShadow: "var(--shadow-lift), var(--card-inner-hl)",
                    }
                  : undefined
              }
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: PALETTE.textMuted }}>
                {isAr ? food.categoryLabelAr : food.categoryLabelEn}
              </span>
              <h3 className="mt-1 min-h-10 text-base font-semibold leading-tight tracking-tight line-clamp-2" style={{ color: PALETTE.textPrim }}>
                {isAr ? food.nameAr : food.nameEn}
              </h3>
              <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] font-normal">
                <div className="rounded bg-[var(--tint)] px-1 py-1 text-center">
                  <span className="block font-semibold" style={{ color: PALETTE.textPrim }}>{food.calories}</span>
                  <span style={{ color: PALETTE.textMuted }}>{isAr ? "سعرة" : "kcal"}</span>
                </div>
                <div className="rounded bg-[var(--tint)] px-1 py-1 text-center">
                  <span className="block font-semibold text-[#34c759]">{isAr ? `${food.protein} جم` : `${food.protein}g`}</span>
                  <span style={{ color: PALETTE.textMuted }}>{isAr ? "بروتين" : "protein"}</span>
                </div>
                <div className="rounded bg-[var(--tint)] px-1 py-1 text-center">
                  <span className="block font-semibold text-[#ff9500]">{isAr ? `${food.carbs} جم` : `${food.carbs}g`}</span>
                  <span style={{ color: PALETTE.textMuted }}>{isAr ? "كربوهيدرات" : "carbs"}</span>
                </div>
              </div>
              <span className="chrome-text mt-2 text-xs font-semibold">
                {active ? (isAr ? "معروض الآن" : "Now showing") : isAr ? "اعرض الأرقام" : "Show the numbers"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Helper components (conditional rendering — no display:none in DOM) ───

// ─── HOME-EXPERIENCE-269: real-content sample cards (exercises /
//     foods / programs). Every card is a plain <a> into its detail
//     page — a real content entry point. The samples arrive as
//     precomputed serializable props from the server
//     (getHomeSamples) — zero library imports here. ───

function LandingExerciseCard({ ex, isAr }: { ex: HomeExerciseSample; isAr: boolean }) {
  const name = isAr ? ex.nameAr : ex.nameEn;
  return (
    <a
      href={`${isAr ? "/ar" : ""}/exercises/${ex.slug}`}
      className="marble-card card-lift group flex flex-col"
    >
      {/* Real exercise image (start-position frame from the library
          artwork) — object-contain keeps the full-body framing honest. */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--card)]">
        {ex.image ? (
          <Image
            src={ex.image}
            alt={name}
            fill
            sizes="(max-width: 768px) 45vw, 22vw"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <EngravedIcon name="dumbbell" alt="" size={40} className="h-10 w-10 opacity-60" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4 text-start">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: PALETTE.textMuted }}>
          {isAr ? ex.categoryLabelAr : ex.categoryLabelEn}
        </p>
        <h3 className="mt-1 text-base font-semibold leading-tight tracking-tight line-clamp-2" style={{ color: PALETTE.textPrim }}>
          {name}
        </h3>
        {/* Level + equipment — the two facts a browser filters by. */}
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium" style={{ color: PALETTE.textSec }}>
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: ex.levelColor }}
            aria-hidden="true"
          />
          {isAr ? ex.levelLabelAr : ex.levelLabelEn}
          <span aria-hidden="true" style={{ opacity: 0.4 }}>·</span>
          <span className="truncate">{isAr ? ex.equipmentLabelAr : ex.equipmentLabelEn}</span>
        </p>
        <p className="chrome-text mt-3 text-xs font-semibold">{isAr ? "اعرض التمرين ›" : "View exercise ›"}</p>
      </div>
    </a>
  );
}

function LandingProgramCard({ prog, isAr }: { prog: HomeProgramSample; isAr: boolean }) {
  const name = isAr ? prog.nameAr : prog.nameEn;
  return (
    <a
      href={`${isAr ? "/ar" : ""}/programs/${prog.slug}`}
      className="marble-card card-lift group relative flex flex-col overflow-hidden"
    >
      {/* Real program artwork (same asset the /programs grid renders). */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={prog.image}
          alt={isAr ? prog.imageAltAr : prog.imageAltEn}
          fill
          sizes="(max-width: 768px) 92vw, 30vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Level seal on the artwork — the level dot color is the real
            library convention (beginner/intermediate/advanced). */}
        <span
          className="seal-chip absolute top-3 end-3 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(11,11,13,0.72)", color: "#F5F5F7", borderColor: "rgba(255,255,255,0.25)" }}
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: prog.levelColor }}
            aria-hidden="true"
          />
          {isAr ? prog.levelLabelAr : prog.levelLabelEn}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 text-start">
        <h3 className="text-lg font-semibold leading-tight tracking-tight line-clamp-2" style={{ color: PALETTE.textPrim }}>
          {name}
        </h3>
        {/* The two facts a program browser filters by: where it trains
            and the weekly commitment. */}
        <p className="mt-2 text-xs font-medium" style={{ color: PALETTE.textSec }}>
          {isAr ? prog.locationLabelAr : prog.locationLabelEn}
          <span aria-hidden="true" style={{ opacity: 0.4 }}> · </span>
          {isAr ? `${prog.durationWeeks} ${weeksUnitAr(prog.durationWeeks)} · ${prog.daysPerWeek} أيام/أسبوع` : `${prog.durationWeeks} weeks · ${prog.daysPerWeek} days/week`}
        </p>
        <p className="chrome-text mt-4 text-sm font-semibold">{isAr ? "استكشف البرنامج ›" : "Explore program ›"}</p>
      </div>
    </a>
  );
}

export function LandingView({ samples }: { samples: HomeSamples }) {
  const { lang } = useI18n();
  const { isCoach, isAdmin, profile } = useAuth();
  const isAr = lang === "ar";
  // The hero/final CTA stays account-driven (Phase 203 law): guests get
  // signup/login, signed-in members get their own console.
  const isLoggedIn = !!profile;
  const memberHref = isAdmin ? "/admin" : isCoach ? "/coach" : "/dashboard";

  const [latestPosts, setLatestPosts] = useState<BlogPostCard[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPostCard[]>([]);
  // 0037 «أعلن معنا» — coaches with a running ad (homepage featured strip)
  type FeaturedCoach = { slug: string | null; name: string; headline: string; photo: string | null };
  const [featuredCoaches, setFeaturedCoaches] = useState<FeaturedCoach[]>([]);
  // The living product's active tab (calculator / EVO / library).
  const [startTab, setStartTab] = useState<"calc" | "evo" | "lib">("calc");

  useEffect(() => {
    // Silent fetch — the strip only renders when active ads exist, so a
    // failed/empty call must never affect the homepage.
    fetch("/api/coaches/featured")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => setFeaturedCoaches(json?.coaches ?? []))
      .catch(() => setFeaturedCoaches([]));
  }, []);

  useEffect(() => {
    // Supabase client chunk loads on demand — deferred to idle so it
    // never competes with LCP/INP on slow networks.
    deferIdle(() => {
      void (async () => {
        const posts = await listBlogPosts(lang);
        const { latest, featured } = selectHomeBlogCarousels(posts);
        setLatestPosts(latest);
        setFeaturedPosts(featured);
      })();
    }, 2500);
  }, [lang]);

  const blogHref = isCoach ? "/admin/blog" : isAr ? "/ar/blog" : "/blog";

  // ── Single-source tier derivations (HOME-REBUILD-258 law, kept) ──
  // Prices on the homepage come ONLY from memberships.ts lookups —
  // never literals — so the pricing page and the homepage can never
  // drift apart. (The GLOBAL USD law: money strings are USD-only.)
  const freeTier = MEMBERSHIPS.find((t) => t.id === "free");
  const premiumTier = MEMBERSHIPS.find((t) => t.id === "premium");
  const proTier = MEMBERSHIPS.find((t) => t.id === "pro");
  const coachingTier = MEMBERSHIPS.find((t) => t.id === "coaching");
  const paidFromMonthly = Math.min(
    premiumTier?.priceMonthly ?? Number.POSITIVE_INFINITY,
    proTier?.priceMonthly ?? Number.POSITIVE_INFINITY,
  );
  const paidFromLabel = `$${paidFromMonthly.toFixed(2)}`;
  const coachingPriceLabel = `$${(coachingTier?.priceMonthly ?? 0).toFixed(2)}`;
  const freePriceLabel = `$${(freeTier?.priceMonthly ?? 0).toFixed(0)}`;

  // FAQ schema for SEO. The FIVE questions that remove hesitation before
  // starting — every claim mirrors the implementation (free browsing +
  // free tier — memberships.ts; guest AI pool — unified pool decree; EVO
  // availability with tier limits; the coaching promise) with NO prices
  // and NO variable counts. The FAQPage JSON-LD derives from the same
  // array (single source law).
  const faqs = [
    { q: isAr ? "هل يمكنني استخدام Alkemos مجانًا؟" : "Can I use Alkemos for free?", a: isAr ? "نعم. التصفح مجاني بالكامل: التمارين والأطعمة والبرامج والأدوات تعمل دون تسجيل، وكل زائر يملك رصيدًا شهريًا لتوليد خطط التغذية والتمارين بالذكاء الاصطناعي، وEVO متاح للجميع ضمن حدود الاستخدام. وبحساب مجاني تُحفظ خططك وتتزامن عبر أجهزتك."
      : "Yes. Browsing is completely free — the exercises, foods, programs, and tools all work without an account. Every visitor gets a monthly allowance for AI nutrition and workout plans, and EVO is open to everyone within fair-use limits. A free account saves your plans and syncs them across your devices." },
    { q: isAr ? "كيف يعمل EVO؟" : "How does EVO work?", a: isAr ? "EVO هو المدرب الذكي داخل المنصة، وتجده في فقاعة محادثة أسفل كل صفحة. اسأله عن التدريب والتغذية، أو اطلب منه بناء خطة حول بياناتك وأهدافك، ثم عدّلها بتبديلات ذكية للوجبات والتمارين. وهو متاح للزوار والأعضاء معًا وفق حدود كل باقة."
      : "EVO is the smart coach built into Alkemos, living in the chat bubble at the bottom of every page. Ask it about training or nutrition, have it build a plan around your data and goals, then fine-tune it with smart meal and exercise swaps. It stays available to visitors and members alike, within each tier's limits." },
    { q: isAr ? "هل أحتاج إلى اشتراك؟" : "Do I need a subscription?", a: isAr ? "لا. يوجد مستوى مجاني دائم إلى جانب أدوات تعمل دون حساب أصلًا. الاشتراكات اختيارية: تفتح توليد خطط أكثر، ومحادثة غير محدودة مع EVO، وتصديرًا كاملًا، وتجربة بلا إعلانات — عندما تحتاجها فعلًا."
      : "No. There's a permanent free tier alongside tools that work without an account in the first place. Memberships are optional — they unlock more AI plan generations, unlimited EVO chat, full export, and an ad-free experience, for when you actually want them." },
    { q: isAr ? "هل يناسبني Alkemos إذا كنت مبتدئًا؟" : "Does Alkemos suit beginners?", a: isAr ? "نعم. كل تمرين يأتي بشرح واضح وصور تُريك الأداء الصحيح، وبرامج جاهزة تبدأ من المستوى المبتدئ ويمكن تنفيذها في المنزل، وخطط الذكاء الاصطناعي تُبنى حول مستواك الحالي ومعداتك المتاحة."
      : "Yes. Every exercise comes with clear instructions and images that show proper form, the ready-made programs start at beginner level and can be done at home, and the AI planners build around your current level and the equipment you actually have." },
    { q: isAr ? "ما الفرق بين العضوية والتدريب الأونلاين؟" : "What's the difference between a membership and online coaching?", a: isAr ? "العضوية توسّع ما تفعله داخل المنصة: توليد خطط أكثر، ومحادثة غير محدودة مع EVO، وتصدير، وتجربة بلا إعلانات. أما الكوتشينج فيضيف مدربًا بشريًا يبني خططك بنفسه، ويتابع تقدمك أسبوعيًا، وتبقى معه قناة تواصل مباشرة — ويشمل كل مزايا برو."
      : "A membership widens what you can do inside the platform — more AI plan generations, unlimited EVO chat, export, and no ads. Online coaching adds a human coach who builds your plans personally, follows your progress weekly, and stays in direct contact with you — with all Pro features included." },
  ];
  const faqSchema = getFAQSchema(faqs);

  // Proof strip — the four auditable platform numbers (Freeletics/MFP
  // pattern: proof lives directly under the promise). Every value rides
  // a verified constant or a documented quota; nothing invented.
  // HOME-EXPERIENCE-269: the numbers now COUNT UP on first view —
  // the first "alive" beat of the page (reduced-motion safe).
  const proofStats = [
    {
      icon: "dumbbell",
      value: EXERCISES_COUNT,
      suffix: "+",
      labelAr: "تمرينًا بصور الأداء الصحيح",
      labelEn: "exercises with form photos",
    },
    {
      icon: "fruits",
      value: FOODS_COUNT,
      suffix: "+",
      labelAr: "صنفًا غذائيًا بالسعرات والماكروز",
      labelEn: "foods with full macros",
    },
    {
      icon: "calories",
      value: TOOLS_COUNT,
      suffix: "",
      labelAr: "أدوات مجانية بلا حساب",
      labelEn: "free tools — no account needed",
    },
    {
      icon: "evo",
      value: 10,
      suffix: "",
      labelAr: "رسائل مع EVO يوميًا — مجانًا",
      labelEn: "EVO messages a day, free",
    },
  ];

  // The growth ladder — the memberships.ts repositioning ladder
  // (Free = Experience → Premium = Manage → Pro = Adapt & Optimize →
  // Coaching = Human Coach + AI) rendered as the JOURNEY the member
  // walks. Tier names derive from MEMBERSHIPS (single source); the
  // one-word stages are the repositioning vocabulary.
  const ladder = [
    { tier: freeTier, stageAr: "تجربة", stageEn: "Experience" },
    { tier: premiumTier, stageAr: "إدارة", stageEn: "Manage" },
    { tier: proTier, stageAr: "تكييف وتحسين", stageEn: "Adapt & optimize" },
    { tier: coachingTier, stageAr: "مدرب بشري مع الذكاء", stageEn: "Human coach + AI" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* FAQ Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}
      />

      <SiteHeader variant="landing" />

      {/* ===================== 1. HERO — Promise =====================
          The Phase 131 overlay scene stays (owner artwork + chrome logo
          + H1 + subtitle + account CTA). The supporting line now points
          AT the living experience below («جرّبها في هذه الصفحة») — the
          promise and the proof live on the same screen. The primary CTA
          stays account-driven (Phase 203); the secondary now scrolls
          INTO the product instead of routing away. */}
      <section className="hero-art relative w-full">
        {/* Artwork layer — absolute cover, theme-swapped pair, eager (LCP). */}
        <div className="hero-bg" aria-hidden="true">
          <ThemeImg
            light="/images/brand/hero-light.webp"
            dark="/images/brand/hero-dark.webp"
            alt=""
            width={1280}
            height={713}
            eager
            fetchPriority="high"
            srcSetLight="/images/brand/hero-light-640.webp 640w, /images/brand/hero-light-828.webp 828w, /images/brand/hero-light.webp 1280w"
            srcSetDark="/images/brand/hero-dark-640.webp 640w, /images/brand/hero-dark-828.webp 828w, /images/brand/hero-dark.webp 1280w"
            sizes="100vw"
          />
        </div>
        {/* Content overlay — logo + H1 + CTAs, centered in the artwork */}
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 py-4 text-center md:py-8">
          {/* Silver-chrome brand lockup (owner artwork, theme pair). */}
          <ThemeImg
            light="/images/brand/logo-hero-light.webp"
            dark="/images/brand/logo-hero-dark.webp"
            alt="Alkemos"
            className="w-32 object-contain md:w-52 lg:w-64"
            width={760}
            height={606}
            eager
            srcSetLight="/images/brand/logo-hero-light-256.webp 256w, /images/brand/logo-hero-light-512.webp 512w, /images/brand/logo-hero-light.webp 760w"
            srcSetDark="/images/brand/logo-hero-dark-256.webp 256w, /images/brand/logo-hero-dark-512.webp 512w, /images/brand/logo-hero-dark.webp 760w"
            sizes="(max-width: 768px) 128px, (max-width: 1024px) 208px, 256px"
          />
          {/* RTL law: the H1 keeps the EN tight utilities + explicit rtl:
              counterparts (rtl-typography.test.ts leg 3). */}
          <h1 className="hero-copy font-display mt-3 text-2xl font-semibold leading-tight tracking-tight rtl:leading-snug rtl:tracking-normal md:mt-5 md:text-5xl lg:text-6xl" style={{ color: PALETTE.textPrim }}>
            {isAr ? "تدرّب بذكاء. وتغذَّ بدقة." : "Train smarter. Eat with precision."}
          </h1>
          <p className="hero-copy mx-auto mt-3 max-w-xl text-sm font-normal leading-relaxed md:mt-4 md:text-base" style={{ color: PALETTE.textSec }}>
            {isAr
              ? "منصة واحدة تجمع التدريب والتغذية والتخطيط الذكي — ومعها EVO، مدربك بالذكاء الاصطناعي. جرّبها الآن في هذه الصفحة، بالعربية والإنجليزية."
              : "One platform for training, nutrition, and smart planning — with EVO, your AI coach, built in. Try it right on this page, in Arabic and English."}
          </p>

          {/* Account-action CTA pair (Phase 203 law): guests get ONE
              primary chrome button → signup + ONE quiet login link;
              signed-in members get their own console. On touch the
              actions STACK full-width (no mis-tap risk beside the
              artwork); md+ keeps the single centered row. */}
          <div className="mt-5 flex flex-col items-stretch justify-center gap-3 md:mt-6 md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-x-5 md:gap-y-3">
            {isLoggedIn ? (
              <a href={memberHref} className="btn-chrome px-7 py-3 text-sm md:w-auto md:px-8 md:py-3 md:text-base">
                {isAr ? "انتقل إلى لوحة التحكم" : "Go to your dashboard"}
                <span className="rtl:rotate-180">›</span>
              </a>
            ) : (
              <>
                <a href="/auth?mode=signup" className="btn-chrome w-full px-7 py-3 text-sm md:w-auto md:px-8 md:py-3 md:text-base">
                  {isAr ? "ابدأ مجانًا" : "Start free"}
                  <span className="rtl:rotate-180">›</span>
                </a>
                <a
                  href="#start"
                  className="btn-outline w-full px-6 py-2.5 text-sm font-medium md:w-auto md:py-2.5 md:text-base"
                >
                  {isAr ? "جرّبها الآن في الصفحة" : "Try it on this page"}
                  <span className="rtl:rotate-180" aria-hidden="true">›</span>
                </a>
                <a
                  href="/auth?mode=login"
                  className="mt-4 self-center text-sm font-medium underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70 md:mt-0"
                  style={{ color: PALETTE.textSec }}
                >
                  {isAr ? "تسجيل الدخول" : "Log in"}
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ===================== 2. PROOF — the platform in numbers =====================
          Auditable proof directly under the promise — the pattern every
          leader in the category uses. All four values ride verified
          constants or documented quotas (EXERCISES_COUNT / FOODS_COUNT /
          TOOLS_COUNT / the EVO fair-use daily limit); the page invents
          nothing. HOME-EXPERIENCE-269: the numbers COUNT UP once when
          the strip enters the view — the page's first heartbeat. */}
      <section aria-label={isAr ? "المنصة بالأرقام" : "The platform in numbers"} className="border-y border-[var(--edge)] bg-[var(--tint)] px-4 py-8 md:py-10">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-y-8 md:grid-cols-4">
          {proofStats.map((stat) => (
            <div key={stat.labelEn} className="flex flex-col items-center px-3 text-center">
              <EngravedIcon name={stat.icon} alt="" size={28} className="h-7 w-7" />
              <span className="chrome-text mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </span>
              <span className="mt-1 max-w-[18ch] text-xs font-normal leading-snug md:text-sm" style={{ color: PALETTE.textSec }}>
                {isAr ? stat.labelAr : stat.labelEn}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== 3. THE LIVING PRODUCT =====================
          The heart of HOME-EXPERIENCE-269: three REAL product surfaces
          running in-page — the answer to «الصفحة تعرض المنتج ولا تجعلك
          تعيشه». A visitor CALCULATES their real numbers with the app's
          own math, SEES an EVO conversation unfold, and BROWSES the
          real library by muscle group — all before any signup. The
          three tabs are the three product engines (numbers ·
          intelligence · content). */}
      <section id="start" className="scroll-mt-20 bg-[var(--bg)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <span className="seal-chip">
              <span className="live-dot" aria-hidden="true" />
              {isAr ? "تجربة حية — دون تسجيل" : "LIVE ON THIS PAGE — NO SIGNUP"}
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "لا تقرأ عن المنصة. استخدمها الآن." : "Don't read about it. Use it right now."}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "ثلاثة أسطح حقيقية من Alkemos تعمل هنا في الصفحة — نفس المعادلات، ونفس البيانات، ونفس الذكاء الذي ستجده داخل حسابك."
                : "Three real Alkemos surfaces running live on this page — the same math, the same data, and the same intelligence waiting inside your account."}
            </p>
          </Reveal>

          {/* The tabs — the three product engines */}
          <Reveal delay={80} className="mt-8 md:mt-10">
            <div className="home-tabs mx-auto max-w-2xl" role="tablist" aria-label={isAr ? "أسطح المنتج" : "Product surfaces"}>
              <button
                type="button"
                role="tab"
                aria-selected={startTab === "calc"}
                onClick={() => setStartTab("calc")}
                className="home-tab"
              >
                <EngravedIcon name="calories" alt="" size={16} className="h-4 w-4" />
                {isAr ? "احسب أرقامك" : "Calculate your numbers"}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={startTab === "evo"}
                onClick={() => setStartTab("evo")}
                className="home-tab"
              >
                <EngravedIcon name="evo" alt="" size={16} className="h-4 w-4" />
                {isAr ? "اسأل EVO" : "Ask EVO"}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={startTab === "lib"}
                onClick={() => setStartTab("lib")}
                className="home-tab"
              >
                <EngravedIcon name="dumbbell" alt="" size={16} className="h-4 w-4" />
                {isAr ? "تصفّح التمارين" : "Browse exercises"}
              </button>
            </div>

            {/* The panels — inactive surfaces stay in the DOM (hidden
                attribute only) so crawlers and screen readers keep the
                full content; only ONE surface is interactive at a time. */}
            <div className="marble-card marble-card--unclipped mt-6 p-4 md:mt-8 md:p-8 lg:p-10">
              <div role="tabpanel" hidden={startTab !== "calc"}>
                <HomeCalculator isAr={isAr} />
              </div>
              <div role="tabpanel" hidden={startTab !== "evo"}>
                <EvoTeaser isAr={isAr} />
              </div>
              <div role="tabpanel" hidden={startTab !== "lib"}>
                <LibraryBrowser samples={samples} isAr={isAr} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================== 4. TRAIN — the plan world =====================
          HOME-EXPERIENCE-269: the exercise GRID moved into the living
          tab (above) so this section tells a DIFFERENT story — the PLAN
          world. Programs lead: a complete schedule that carries a
          beginner from day one, and the AI planner for the ones who
          want theirs built from scratch. No two sections on this page
          share a skeleton anymore. */}
      <section id="train" className="scroll-mt-20 bg-[var(--tint)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <span className="seal-chip">
              <EngravedIcon name="dumbbell" alt="" size={12} className="h-3 w-3" />
              {isAr ? `${EX_PLUS} تمرينًا في المكتبة` : `${EX_PLUS} EXERCISES IN THE LIBRARY`}
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "خطة كاملة تقودك، أسبوعًا بأسبوع." : "A complete plan to guide you, week by week."}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "برامج جاهزة بجدول وتمارين ومجموعات وتكرارات — اتبعها كما هي، أو اجعلها نقطة انطلاق وعدّلها بحسب وقتك ومعداتك."
                : "Ready-made programs with a schedule, exercises, sets, and reps — follow one as-is, or make it your starting point and adapt it to your time and equipment."}
            </p>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-5 md:mt-10 md:grid-cols-3">
            {samples.programs.map((prog, i) => (
              <Reveal key={prog.slug} delay={i * 80}>
                <LandingProgramCard prog={prog} isAr={isAr} />
              </Reveal>
            ))}
          </div>
          {/* Dual CTA: build your own with AI, or see all programs. */}
          <Reveal delay={120} className="mt-10 text-center">
            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-3">
              <a href={isAr ? "/ar/ai-workout-planner" : "/ai-workout-planner"} className="btn-chrome px-7 py-3 text-sm md:px-8 md:py-3 md:text-base">
                {isAr ? "ابنِ خطتك بالذكاء الاصطناعي" : "Build your plan with AI"}
                <span className="rtl:rotate-180">›</span>
              </a>
              <a
                href={isAr ? "/ar/programs" : "/programs"}
                className="btn-outline px-6 py-2.5 text-sm font-medium"
              >
                {isAr ? "كل البرامج" : "All programs"}
                <span className="rtl:rotate-180" aria-hidden="true">›</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================== 5. EAT — the interactive plate =====================
          The food database made TOUCHABLE: pick a real food and watch
          its real per-100g numbers move (the same semantics as the
          /foods explorer — now answering in-page). */}
      <section id="eat" className="scroll-mt-20 bg-[var(--bg)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <span className="seal-chip">
              <EngravedIcon name="protein" alt="" size={12} className="h-3 w-3" />
              {isAr ? `${FOODS_PLUS} صنفًا غذائيًا` : `${FOODS_PLUS} FOODS`}
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "اعرف أرقام طبقك قبل أن تأكله." : "Know your plate's numbers before you eat it."}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "سعرات وبروتين وكربوهيدرات ودهون لكل 100 جرام — اختر صنفًا من القاعدة وشاهد أرقامه تتحرك."
                : "Calories, protein, carbs, and fat for every 100 g — pick a food from the database and watch its numbers move."}
            </p>
          </Reveal>
          <Reveal delay={80} className="mt-8 md:mt-10">
            <FoodExplorer samples={samples} isAr={isAr} />
          </Reveal>
          {/* ONE focused section CTA. */}
          <Reveal delay={120} className="mt-8 text-center">
            <a href={isAr ? "/ar/foods" : "/foods"} className="btn-outline px-7 py-3 text-sm font-medium md:text-base">
              {isAr ? "استكشف قاعدة الأطعمة" : "Explore the food database"}
              <span className="rtl:rotate-180" aria-hidden="true">›</span>
            </a>
          </Reveal>
        </div>
      </section>

      {/* ===================== 6. INTELLIGENCE — AI planners + EVO =====================
          The two AI surfaces tell ONE story — the planners build the
          plan, EVO keeps it moving. The quota facts are stated plainly
          (unified pool decree + EVO fair-use limit): transparency here
          is the conversion pattern, and honesty is the brand. The EVO
          CHAT SURFACE LAW stays untouched: the floating widget is the
          only chat surface and this section's EVO CTA dispatches
          openEvoFloatingChat. The card keeps the Phase 127 warrior-art
          recipe: text on the inline-start, warrior art dissolving into
          the marble on the inline-end (.evo-art-mask, mirrored in RTL). */}
      <section id="evo" className="scroll-mt-20 bg-[var(--tint)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="marble-card marble-card--unclipped relative overflow-hidden p-5 md:p-10 lg:p-12">
              {/* Desktop warrior art — inline-end, masked into the marble. */}
              <div className="pointer-events-none absolute inset-y-0 end-0 hidden w-[46%] items-end justify-center md:flex" aria-hidden="true">
                <ThemeImg
                  light="/images/brand/evo-hero-light.webp"
                  dark="/images/brand/evo-hero-dark.webp"
                  alt=""
                  width={640}
                  height={675}
                  className="evo-art-mask h-full w-auto object-contain object-bottom"
                />
              </div>
              <div className="relative max-w-xl">
                <span className="seal-chip">
                  <EngravedIcon name="evo" alt="" size={12} className="h-3 w-3" />
                  {isAr ? "التخطيط الذكي و EVO" : "SMART PLANNING + EVO"}
                </span>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
                  {isAr ? "خطة مبنية حولك — ومدرب يواكب تقدّمك." : "A plan built around you — and a coach who keeps it moving."}
                </h2>
                {/* The three steps mirror how the planners + EVO actually
                    flow: inputs → plan → adjustments. */}
                <div className="mt-7 space-y-5">
                  {(isAr
                    ? [
                        { n: "01", t: "حدّد هدفك ومستواك", d: "معداتك المتاحة ووقتك وتفضيلاتك — التخطيط يُبنى حول واقعك." },
                        { n: "02", t: "استلم خطتك", d: "خطة تغذية وتمارين مبنية على إجاباتك — لا قوالب عامة." },
                        { n: "03", t: "عدّلها كلما تقدّمت", d: "تبديلات ذكية للوجبات والتمارين تُبقي خطتك تتحرك مع حياتك." },
                      ]
                    : [
                        { n: "01", t: "Tell it where you are", d: "Your goal, level, equipment, and schedule — the planners build around what's real." },
                        { n: "02", t: "Get your plan", d: "A nutrition and workout plan shaped by your answers — not generic templates." },
                        { n: "03", t: "Adjust as you go", d: "Smart meal and exercise swaps keep the plan moving as your life does." },
                      ]
                  ).map((step) => (
                    <div key={step.n} className="flex gap-4">
                      <span className="chrome-text shrink-0 text-lg font-semibold">{step.n}</span>
                      <div>
                        <p className="text-base font-semibold" style={{ color: PALETTE.textPrim }}>{step.t}</p>
                        <p className="mt-1 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>{step.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Quota transparency — the real limits, stated as fact
                    (memberships.ts free tier + the unified pool decree). */}
                <p className="mt-6 rounded-[10px] border border-[var(--edge)] bg-[var(--tint)] p-4 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
                  {isAr
                    ? "مجاني من أول لحظة: كل زائر يملك رصيدًا شهريًا لخطط الذكاء الاصطناعي و10 رسائل يوميًا مع EVO — والتجربة لا تحتاج حسابًا. وبحساب مجاني تُحفظ خططك وتتزامن عبر أجهزتك."
                    : "Free from the first minute: every visitor carries a monthly AI-plan allowance and 10 messages a day with EVO — no account needed to try. A free account saves your plans and syncs them across devices."}
                </p>
                {/* CTA rows: the planners (one primary each) + EVO (the
                    widget law — the button OPENS THE WIDGET, never a chat
                    page link; the /chat route is retired). */}
                <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
                  <a href={isAr ? "/ar/ai-meal-planner" : "/ai-meal-planner"} className="btn-chrome px-6 py-3 text-sm md:text-base">
                    {isAr ? "أنشئ خطتي" : "Create My Plan"}
                  </a>
                  <a href={isAr ? "/ar/ai-workout-planner" : "/ai-workout-planner"} className="btn-outline px-6 py-2.5 text-sm font-medium">
                    {isAr ? "مخطط التمارين الذكي ›" : "AI Workout Planner ›"}
                  </a>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <button
                    type="button"
                    onClick={openEvoFloatingChat}
                    className="btn-outline inline-flex cursor-pointer items-center gap-3 px-5 py-2.5 text-sm font-medium"
                  >
                    <ThemeImg
                      light="/images/brand/evo-widget-light.webp"
                      dark="/images/brand/evo-widget-dark.webp"
                      alt="EVO"
                      width={32}
                      height={32}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                    <span>{isAr ? "جرّب EVO" : "Try EVO"}</span>
                  </button>
                  <a
                    href={isAr ? "/ar/evo" : "/evo"}
                    className="text-sm font-medium underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70"
                    style={{ color: PALETTE.textSec }}
                  >
                    {isAr ? "اعرف المزيد عن EVO ›" : "Learn more about EVO ›"}
                  </a>
                </div>
                {/* Mobile warrior art — a quiet centered cutout under the
                    copy (the absolute treatment is md+ only, so phone text
                    never competes with the artwork). */}
                <div className="mt-8 flex justify-center md:hidden" aria-hidden="true">
                  <ThemeImg
                    light="/images/brand/evo-hero-light.webp"
                    dark="/images/brand/evo-hero-dark.webp"
                    alt=""
                    width={640}
                    height={675}
                    className="h-auto w-40 object-contain opacity-90"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================== 7. LEARN =====================
          A focused selection of real articles — the blog stays a
          first-class part of the experience (Phase 202 owner order).
          Selection logic (selectHomeBlogCarousels) untouched; the whole
          section renders only when posts loaded (the needsPosts law). */}
      {latestPosts.length > 0 && (
        <section id="learn" className="scroll-mt-20 bg-[var(--bg)] px-4 py-10 md:py-20">
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {isAr ? "تعلّم. طبّق. تقدّم." : "Learn. Apply. Progress."}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
                {isAr
                  ? "مقالات بالعربية والإنجليزية تشرح التدريب والتغذية بأسلوب واضح — اقرأ ما يخص هدفك وطبّقه في تدريبك وفي طبقك."
                  : "Articles in English and Arabic that explain training and nutrition in plain terms — read what matters for your goal and put it to work."}
              </p>
            </Reveal>
            {/* ONE carousel — featured posts lead the row as dark cards. */}
            <div className="mt-10">
              <BlogCarousel
                posts={[...featuredPosts, ...latestPosts].slice(0, 10)}
                featuredSlugs={featuredPosts.map((p) => p.slug)}
                isAr={isAr}
              />
            </div>
            <div className="mt-6 text-center">
              <a href={blogHref} className="btn-outline px-6 py-2.5 text-sm font-medium">
                {isAr ? "استكشف المحتوى" : "Explore the articles"}
                <span className="rtl:rotate-180" aria-hidden="true">›</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Greek meander divider — the TWO narrative acts law: exploration
          ends here, the services act begins. */}
      <div className="meander-divider" aria-hidden="true" />

      {/* ===================== 8. FREE vs PAID — the growth journey =====================
          HOME-EXPERIENCE-269: the section OPENS with the growth ladder
          (the memberships.ts repositioning — Free = Experience →
          Premium = Manage → Pro = Adapt & Optimize → Coaching = Human
          Coach + AI) so the money moment reads as the member's JOURNEY,
          not a price sheet. The three cards below stay exactly the
          honest 258 design: prices derived from memberships.ts (single
          source — no literals), the middle card is the visual hero
          (dark marble + chrome ring + laurel), and the refund line
          states the REAL 7-day conditional refund (src/lib/refund.ts). */}
      <section id="memberships" className="scroll-mt-20 bg-[var(--bg)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "مجاني فعلًا. والترقية قرارك." : "Free, for real. Upgrading is your call."}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "لن تصطدم بجدار دفع كي تتدرّب أو تتغذّى جيدًا — الباقات المدفوعة لمن تجاوز حدود المستوى المجاني: تخطيط أوسع، وEVO بلا حدود، وتصدير، أو مدرب بشري."
                : "You never hit a paywall to train or eat well here — paid plans exist for when you outgrow the free tier: more AI planning, unlimited EVO, export, or a human coach."}
            </p>
          </Reveal>

          {/* The growth ladder — the journey strip (tier names derive
              from memberships.ts; stages are the repositioning words). */}
          <Reveal delay={60} className="mt-8 md:mt-10">
            <ol className="mx-auto flex max-w-4xl flex-col gap-3 sm:grid sm:grid-cols-4 sm:gap-0">
              {ladder.map((step, i) => (
                <li
                  key={step.tier?.id ?? i}
                  className="relative flex items-center gap-3 rounded-[var(--radius-chrome)] border border-[var(--edge)] bg-[var(--tint)] px-4 py-3 sm:flex-col sm:items-center sm:gap-1 sm:border-0 sm:bg-transparent sm:px-2 sm:py-0 sm:text-center"
                >
                  {/* The connector (desktop) — the road between stages. */}
                  {i > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 start-0 hidden w-px sm:block sm:h-px sm:w-auto sm:inset-x-auto sm:inset-y-0 sm:top-[-50%] sm:left-auto sm:right-[-50%]"
                      style={{ backgroundColor: "var(--edge)" }}
                    />
                  )}
                  <span className="chrome-text text-sm font-bold">{`0${i + 1}`}</span>
                  <div>
                    <p className="text-sm font-semibold leading-tight" style={{ color: PALETTE.textPrim }}>
                      {isAr ? step.tier?.nameAr : step.tier?.nameEn}
                    </p>
                    <p className="mt-0.5 text-xs font-normal" style={{ color: PALETTE.textSec }}>
                      {isAr ? step.stageAr : step.stageEn}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>

          <div className="mt-6 grid grid-cols-1 gap-4 md:mt-8 md:grid-cols-3">
            {/* Card 1 — FREE: the real free tier (memberships.ts). */}
            <Reveal className="h-full">
              <div className="marble-card flex h-full flex-col p-5 md:p-8">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-xl font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>
                    {isAr ? freeTier?.nameAr : freeTier?.nameEn}
                  </h3>
                  <span className="chrome-text text-lg font-bold">{freePriceLabel}</span>
                </div>
                <p className="mt-4 flex-1 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
                  {isAr
                    ? "كل ما جربته في هذه الصفحة: المكتبات كاملة، وكل أداة، وحاسبتك الآن، ورصيدك الشهري من الخطط الذكية، وEVO — مجانًا ودائمًا."
                    : "Everything you just tried on this page: the full libraries, every tool, the calculator you just used, your monthly AI plans, and EVO — free forever."}
                </p>
                <div className="mt-6">
                  <a href="/auth?mode=signup" className="btn-outline px-6 py-2.5 text-sm font-medium">
                    {isAr ? "ابدأ مجانًا" : "Start free"}
                    <span className="rtl:rotate-180" aria-hidden="true">›</span>
                  </a>
                </div>
              </div>
            </Reveal>
            {/* Card 2 — PREMIUM & PRO: the management delta, the ONE
                filled CTA of the section (O-3 asymmetry law). */}
            <Reveal delay={80} className="h-full">
              <div
                className="relative flex h-full flex-col p-5 md:p-8"
                style={{
                  backgroundColor: "#0B0B0D",
                  color: "#F5F5F7",
                  border: "2px solid transparent",
                  backgroundImage:
                    "linear-gradient(#0B0B0D, #0B0B0D), linear-gradient(145deg, #FDFDFD 0%, #C9CED3 35%, #878E94 50%, #E6E9EC 70%, #9AA0A6 100%)",
                  backgroundOrigin: "border-box",
                  backgroundClip: "padding-box, border-box",
                }}
              >
                {/* The /memberships Pro-card recipe: the seal straddles the
                    top border, centered (same label as the pricing page —
                    one concept, one wording). */}
                <span className="seal-chip absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0B0B0D]" style={{ color: "#F5F5F7", borderColor: "#3A3F45" }}>
                  <EngravedIcon name="laurel" alt="" size={12} className="h-3 w-3" />
                  {isAr ? "موصى بها" : "Recommended"}
                </span>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-xl font-semibold tracking-tight" style={{ color: "#F5F5F7" }}>
                    {isAr
                      ? `${premiumTier?.nameAr ?? ""} و${proTier?.nameAr ?? ""}`
                      : `${premiumTier?.nameEn ?? ""} & ${proTier?.nameEn ?? ""}`}
                  </h3>
                  <span className="chrome-text-on-dark text-lg font-bold">{paidFromLabel}</span>
                </div>
                <p className="mt-1 text-xs font-medium" style={{ color: "rgba(245,245,247,0.6)" }}>
                  {isAr ? `ابتداءً من ${paidFromLabel} شهريًا` : `From ${paidFromLabel}/mo`}
                </p>
                <p className="mt-4 flex-1 text-sm font-normal leading-relaxed" style={{ color: "rgba(245,245,247,0.72)" }}>
                  {isAr
                    ? "توليد خطط أكثر، ومحادثة غير محدودة مع EVO، وتصدير كامل، وتجربة بلا إعلانات مع برو."
                    : "More AI plan generations, unlimited EVO chat, full export, and an ad-free experience on Pro."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {MEMBERSHIPS.filter((tier) => tier.id === "premium" || tier.id === "pro").map((tier) => (
                    <span key={tier.id} className="seal-chip py-1! text-[10px]!" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#F5F5F7", borderColor: "rgba(255,255,255,0.25)" }}>{isAr ? tier.nameAr : tier.nameEn}</span>
                  ))}
                </div>              <div className="mt-6">
                  <a href={isAr ? "/ar/memberships" : "/memberships"} className="btn-chrome px-6 py-2.5 text-sm font-medium">
                    {isAr ? "تفاصيل الباقات ›" : "See memberships ›"}
                    <span className="rtl:rotate-180" aria-hidden="true">›</span>
                  </a>
                </div>
              </div>
            </Reveal>
            {/* Card 3 — COACHING: the human-coach promise (memberships.ts
                coaching entry), the quiet path by design. */}
            <Reveal delay={160} className="h-full">
              <div className="marble-card flex h-full flex-col p-5 md:p-8">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-xl font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>
                    {isAr ? coachingTier?.nameAr : coachingTier?.nameEn}
                  </h3>
                  <span className="chrome-text text-lg font-bold">{coachingPriceLabel}</span>
                </div>
                <p className="mt-4 flex-1 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
                  {isAr
                    ? "مدرب بشري يبني خططك، ويتابع تقدّمك أسبوعًا بأسبوع، ويبقى على تواصل مباشر معك — مع كل مزايا برو."
                    : "A human coach builds your plans, follows your progress week by week, and stays in direct contact — every Pro feature included."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="seal-chip py-1! text-[10px]!">
                    <EngravedIcon name="checkseal" alt="" size={11} className="h-3 w-3" />
                    {isAr ? "يشمل كل مزايا برو" : "ALL PRO FEATURES INCLUDED"}
                  </span>
                </div>
                <div className="mt-6">
                  <a href={isAr ? "/ar/coaching" : "/coaching"} className="btn-outline px-6 py-2.5 text-sm font-medium">
                    {isAr ? "استكشف الكوتشينج ›" : "Explore coaching ›"}
                    <span className="rtl:rotate-180" aria-hidden="true">›</span>
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
          {/* The REAL refund policy, stated as fact (refund.ts: 7-day
              conditional, no-features-used). */}
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs font-normal leading-relaxed" style={{ color: PALETTE.textMuted }}>
            {isAr
              ? "كل باقة مدفوعة تشمل حق الاسترداد خلال 7 أيام — إن لم تستخدم المزايا المدفوعة، يُعاد إليك المبلغ."
              : "Every paid plan carries a 7-day refund — if you haven't used the paid features, you get your money back."}
          </p>
        </div>
      </section>

      {/* ===================== 6.5 FEATURED COACHES («أعلن معنا» ads) =====================
          Kept verbatim (0037 paid-ad strip — a real service surface;
          renders only when active ads exist). Labeled as promo spots,
          not an endorsement. */}
      {featuredCoaches.length > 0 && (
        <section className="bg-[var(--bg)] px-4 pb-10 md:pb-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl" style={{ color: PALETTE.textPrim }}>
              {isAr ? "مدربون مميزون على Alkemos" : "Featured Coaches on Alkemos"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-center text-base font-normal" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "مساحات ترويجية مدفوعة لمدربين تمت مراجعة صفحاتهم — اضغط على أي مدرب لزيارة صفحته."
                : "Paid promotional spots for coaches with admin-reviewed pages — tap any coach to visit his page."}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {featuredCoaches.map((coach, i) => {
                const href = coach.slug ? `${isAr ? "/ar" : ""}/coaches/${coach.slug}` : "/coaching";
                return (
                  <a
                    key={`${coach.slug || coach.name}-${i}`}
                    href={href}
                    className="marble-card card-lift group block p-5 text-center"
                  >
                    {coach.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={coach.photo}
                        alt={coach.name}
                        className="mx-auto h-16 w-16 rounded-full object-cover ring-4 ring-[var(--tint)]"
                      />
                    ) : (
                      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[var(--edge)] bg-[var(--tint)] text-xl font-semibold text-[var(--text)]">
                        {(coach.name.trim().charAt(0) || "M")}
                      </div>
                    )}
                    <p className="mt-3 truncate text-sm font-semibold" style={{ color: PALETTE.textPrim }}>
                      {coach.name}
                    </p>
                    {coach.headline && (
                      <p className="mt-1 line-clamp-2 text-xs font-normal" style={{ color: PALETTE.textSec }}>
                        {coach.headline}
                      </p>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===================== 9. FAQ — hesitation-removers =====================
          The FIVE questions; every claim mirrors the implementation. The
          FAQPage JSON-LD derives from the same array above (single
          source law). */}
      <section id="faq" className="scroll-mt-20 bg-[var(--tint)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
            {isAr ? "أسئلة قبل أن تبدأ." : "Questions, answered."}
          </h2>
          <Accordion type="single" collapsible className="mt-8 md:mt-12">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-[var(--edge)]">
                {/* Full-row hover + a bigger, higher-contrast chevron
                    (VRD-V0 audit C-15 — scoped here, NOT in the shared
                    accordion.tsx). */}
                <AccordionTrigger className="py-5 text-start text-lg font-normal hover:bg-[var(--bg)] hover:no-underline [&>svg]:size-5 [&>svg]:text-[var(--muted-2)]">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-base font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ===================== 10. FINAL CTA =====================
          One quiet dark-marble band closes the page. HOME-EXPERIENCE-269:
          alongside the account action, the band opens the EVO DOOR —
          «تحدث مع EVO أولًا» — because for many visitors the most
          natural first step into a fitness product is a conversation,
          not a form. The button opens the floating widget (the
          chat-surface law); the account action stays the single primary. */}
      <section className="bg-[var(--bg)] px-4 py-10 md:py-20">
        <div
          className="relative mx-auto max-w-6xl overflow-hidden rounded-[var(--radius-chrome)]"
          style={{
            backgroundColor: "#0B0B0D",
            color: "#F5F5F7",
            border: "2px solid transparent",
            backgroundImage:
              "linear-gradient(#0B0B0D, #0B0B0D), linear-gradient(145deg, #FDFDFD 0%, #C9CED3 35%, #878E94 50%, #E6E9EC 70%, #9AA0A6 100%)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
          }}
        >
          {/* Faded stadium backdrop — the same decorative layer as the
              program cards, one step quieter on the dark surface. */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07] blur-[2px]"
            aria-hidden="true"
            style={{
              backgroundImage: "var(--prog-backdrop)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative flex flex-col items-center px-6 py-10 text-center md:py-16">
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              {isAr ? "ابدأ اليوم. وابنِ روتينًا يناسبك." : "Start today. Build a routine that fits you."}
            </h2>
            <p className="mt-3 max-w-xl text-sm font-normal leading-relaxed md:text-base" style={{ color: "rgba(245,245,247,0.72)" }}>
              {isAr
                ? "حساب مجاني يحفظ خططك ونتائجك ويتابع تقدمك — والترقية قرارك متى احتجتها."
                : "A free account saves your plans and results and follows your progress — upgrading stays your call, whenever you need it."}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
              {isLoggedIn ? (
                <a href={memberHref} className="btn-chrome px-7 py-3 text-sm md:px-8 md:py-3 md:text-base">
                  {isAr ? "انتقل إلى لوحة التحكم" : "Go to your dashboard"}
                  <span className="rtl:rotate-180">›</span>
                </a>
              ) : (
                <>
                  <a href="/auth?mode=signup" className="btn-chrome px-7 py-3 text-sm md:px-8 md:py-3 md:text-base">
                    {isAr ? "ابدأ مجانًا" : "Start free"}
                    <span className="rtl:rotate-180">›</span>
                  </a>
                  <a
                    href="/auth?mode=login"
                    className="text-sm font-medium underline decoration-[#3A3F45] underline-offset-4 transition-opacity hover:opacity-70"
                    style={{ color: "#B9BEC4" }}
                  >
                    {isAr ? "تسجيل الدخول" : "Log in"}
                  </a>
                </>
              )}
            </div>
            {/* The EVO door — the conversational way in. */}
            <button
              type="button"
              onClick={openEvoFloatingChat}
              className="mt-6 inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium underline decoration-[#3A3F45] underline-offset-4 transition-opacity hover:opacity-70"
              style={{ color: "#B9BEC4" }}
            >
              <span className="live-dot" aria-hidden="true" />
              {isAr ? "أو تحدث مع EVO أولًا" : "Or talk to EVO first"}
            </button>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER — the SHARED SiteFooter component;
          every public page renders the identical footer. ===================== */}
      <SiteFooter />
    </div>
  );
}
