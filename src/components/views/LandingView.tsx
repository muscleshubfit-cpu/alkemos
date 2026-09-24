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
import { ensureGuestId, saveGuestPlan } from "@/lib/plan-persistence";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { getFallbackSVG } from "@/lib/exercise-images";
import { openEvoFloatingChat } from "@/lib/evo-chat-events";
import {
  workoutEquipmentOptions,
  workoutGoalOptions,
  workoutLevelOptions,
} from "@/lib/ai-workout-planner";
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
  HomeDietSystemSample,
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

// The seven muscle families the interactive library browser exposes
// (labels mirror the hub's own vocabulary; «كور» keeps the plain
// transliterated register — VRD-V4 K-5). HOME-REFINE-271 F1: restored.
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
// HOME-REFINE-270 (owner directive 2026-09-24 — the nine-point
// homepage refinement of the living-product rebuild):
//   R1. Hero carries exactly TWO side-by-side CTAs: login/signup
//       (→ /auth) + the premium-memberships page (→ /memberships).
//   R2. The proof strip under the hero is a compact ONE-ROW band
//       (small type, numbers + labels inline, count-up preserved).
//   R3. The «تجربة حية» tab wrapper is GONE — its three surfaces
//       live as INDEPENDENT sections, each with its own headline:
//       the calculator (#start), EVO (#evo, warrior art kept), and
//       the exercise library (now a blog-style CAROUSEL).
//   R4. The exercise library renders as a carousel (like the blog)
//       and moved to sit right before the blog; the ready-made
//       diet-plan library (مكتبة الخطط الغذائية الجاهزة) joins it
//       there as its own carousel section.
//   R5. The old planning-plus-EVO section was WRONG (it mixed
//       the planners with EVO and implied a human coach). It is now
//       #plan — an INTERACTIVE planner section like the tools: a
//       workout-plan builder + a nutrition-plan builder (real
//       planner vocabulary + real matrix splits, live previews).
//       EVO is NOT mentioned there (it owns #evo) and NO coach is
//       referenced (online coaching is a separate paid membership).
//   R6. The blog section title is the simple «أحدث المقالات» and
//       the carousel is LATEST-FIRST (the newest posts actually
//       lead the row).
//   R7. The big free-vs-paid section is replaced by SMALL
//       attractive membership cards (prices still derive from
//       memberships.ts — single source) + one online-coaching card.
//   R8. The repetitive final CTA band is removed entirely.
//   R9. The footer is flat: no disclosure groups — every link
//       visible and organized at every breakpoint (SiteFooter).
//
// HOME-REFINE-271 (owner follow-up 2026-09-24 — four corrections on
// top of the nine):
//   F1. The exercise-library directive was a misorder: the
//       INTERACTIVE muscle-group browser (مكتبة التمارين) is RESTORED
//       as its own section (#library, where the programs grid was),
//       and the READY-MADE PROGRAMS (برامج التمارين الجاهزة) take the
//       pre-blog carousel slot (#train).
//   F2. The EVO section is CONCISE: a two-turn demo, and NO artwork
//       under the copy (the desktop warrior side-art stays).
//   F3. #plan is TRULY interactive like the tools («حقيقى تفاعلى مثل
//       الادوات»): both builders call the REAL generation endpoints
//       (/api/ai/workout-plan-demo · /api/ai/meal-plan-demo — the
//       unified free pool, guests included) and render the generated
//       plan in-page; changing any choice returns the card to its
//       live preview (a rendered plan always matches the choices).
//   F4. The footer is SHORTENED (SiteFooter): every list trimmed to
//       its primary entry points — the header nav already carries
//       the dropped surfaces (27 → 18 links).
//
// The 269 laws that still hold: fitness-math.ts stays the single
// calculator source; the EVO demo stays labeled + hands off to the
// floating widget (chat-surface law); prices derive from
// memberships.ts (never literals); EN/AR are independent native
// pairs; counts ride the verified constants; zero emoji; MSA-clean
// Arabic; motion stays once-only + reduced-motion-safe.
// ============================================================

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

// ── The EVO conversation demo — the content of the standalone #evo
//    section (HOME-REFINE-270 R3/R5: EVO owns its own section; the
//    planners live separately in #plan). A labeled illustrative
//    exchange (honesty law: it SAYS it is an example), and the CTA
//    hands off to the REAL floating widget — the EVO CHAT SURFACE
//    LAW holds (this is a demonstration, never a second input).
function EvoConversation({ isAr }: { isAr: boolean }) {
  // HOME-REFINE-271 F2: the demo is CONCISE — one question, one
  // answer that carries real numbers (the owner's «مختصر» directive;
  // the four-turn exchange is retired).
  const turns = isAr
    ? [
        { who: "user", text: "هدفي خسارة الدهون مع الحفاظ على العضلات. ما الذي يصلح لعشائي الليلة؟" },
        {
          who: "evo",
          text: "وجبة تناسب هدفك: 200 جرام صدر دجاج مشوي مع 150 جرام أرز وسلطة خضراء — نحو 520 سعرة و52 جرام بروتين. أخبرني بوزنك وأيام تدريبك وسأبني لك خطة الأسبوع كاملة.",
        },
      ]
    : [
        { who: "user", text: "I want to lose fat without losing muscle. What works for tonight's dinner?" },
        {
          who: "evo",
          text: "A meal that fits your goal: 200 g grilled chicken breast with 150 g rice and a green salad — roughly 520 kcal and 52 g protein. Tell me your weight and training days and I'll build your whole week.",
        },
      ];

  return (
    <div>
      {/* The honest label — directly above the exchange */}
      <span className="seal-chip">
        <EngravedIcon name="evo" alt="" size={12} className="h-3 w-3" />
        {isAr ? "نموذج توضيحي لمحادثة" : "AN ILLUSTRATIVE EXCHANGE"}
      </span>

      {/* The conversation */}
      <div className="mt-5 space-y-3.5">
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

      {/* The hand-off — the widget law (the ONLY chat surface) */}
      <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          onClick={openEvoFloatingChat}
          className="btn-chrome px-6 py-3 text-sm md:text-base"
        >
          <span className="live-dot" aria-hidden="true" />
          {isAr ? "أكمل المحادثة مع EVO" : "Continue this conversation"}
        </button>
        <a
          href={isAr ? "/ar/evo" : "/evo"}
          className="self-center text-sm font-medium underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70"
          style={{ color: PALETTE.textSec }}
        >
          {isAr ? "اعرف المزيد عن EVO ›" : "Learn more about EVO ›"}
        </a>
      </div>
      <p className="mt-3 text-xs font-normal leading-relaxed" style={{ color: PALETTE.textMuted }}>
        {isAr
          ? "الزوار يحصلون على 10 رسائل يوميًا مع EVO — دون تسجيل."
          : "Visitors get 10 messages a day with EVO — no signup."}
      </p>
    </div>
  );
}

// ── CarouselShell — the shared blog-style carousel scaffolding
//    (HOME-REFINE-270 R4: the exercise library + the diet-plan
//    library ride the SAME pattern as the blog row: a smooth
//    horizontal scroller with the RTL-aware arrow pair). The exact
//    arrow recipe the blog carousel used since Phase 257 — 44px
//    touch targets (rtl-typography leg) — lives here once.
function CarouselShell({
  isAr,
  children,
  ariaLabel,
}: {
  isAr: boolean;
  children: React.ReactNode;
  ariaLabel: string;
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
        aria-label={ariaLabel}
      >
        <style jsx>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>
        {children}
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
  const featuredSet = new Set(featuredSlugs);

  return (
    <CarouselShell isAr={isAr} ariaLabel={isAr ? "أحدث المقالات" : "Latest articles"}>
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
    </CarouselShell>
  );
}

// ══════════════════════════════════════════════════════════════
// THE SMART PLANNING SECTION (#plan) — HOME-REFINE-270 R5.
// The owner directive: the old planning-plus-EVO section was
// completely wrong — the correct design is an INTERACTIVE section
// like the tools, building a plan with AI: one surface for WORKOUTS
// and one for NUTRITION. EVO is NOT mentioned here (it owns #evo)
// and no human COACH is referenced (online coaching is a separate
// paid membership — a different world).
//
// Honesty law: these are LIVE PREVIEWS, clearly labeled — the
// structure/split derives deterministically from the REAL planner
// vocabulary (ai-workout-planner.ts — imported, single source) and
// the REAL matrix splits (server-provided samples.dietSystems), and
// the FULL plan (exercises/sets/reps · meals/grams) is generated by
// the AI inside the real tools the CTAs open.
// ══════════════════════════════════════════════════════════════

// The weekly split structure per days-per-week — the standard
// training splits the AI planner builds around (2-6 days).
const WORKOUT_SPLITS: Record<
  number,
  { nameAr: string; nameEn: string; daysAr: string[]; daysEn: string[] }
> = {
  2: {
    nameAr: "جسم كامل ×2",
    nameEn: "Full body ×2",
    daysAr: ["جسم كامل", "جسم كامل"],
    daysEn: ["Full body", "Full body"],
  },
  3: {
    nameAr: "جسم كامل ×3",
    nameEn: "Full body ×3",
    daysAr: ["جسم كامل", "جسم كامل", "جسم كامل"],
    daysEn: ["Full body", "Full body", "Full body"],
  },
  4: {
    nameAr: "أعلى / أسفل ×2",
    nameEn: "Upper / Lower ×2",
    daysAr: ["أعلى الجسم", "أسفل الجسم", "أعلى الجسم", "أسفل الجسم"],
    daysEn: ["Upper body", "Lower body", "Upper body", "Lower body"],
  },
  5: {
    nameAr: "دفع / سحب / أرجل + أعلى / أسفل",
    nameEn: "Push / Pull / Legs + Upper / Lower",
    daysAr: ["دفع (صدر وأكتاف وترايسبس)", "سحب (ظهر وبايسبس)", "أرجل", "أعلى الجسم", "أسفل الجسم"],
    daysEn: ["Push (chest, shoulders, triceps)", "Pull (back, biceps)", "Legs", "Upper body", "Lower body"],
  },
  6: {
    nameAr: "دفع / سحب / أرجل ×2",
    nameEn: "Push / Pull / Legs ×2",
    daysAr: ["دفع (صدر وأكتاف وترايسبس)", "سحب (ظهر وبايسبس)", "أرجل", "دفع (صدر وأكتاف وترايسبس)", "سحب (ظهر وبايسبس)", "أرجل"],
    daysEn: ["Push (chest, shoulders, triceps)", "Pull (back, biceps)", "Legs", "Push (chest, shoulders, triceps)", "Pull (back, biceps)", "Legs"],
  },
};

// ── The REAL generation payload shapes (HOME-REFINE-271 F3) —
//    mirrors of the validated API responses, kept local and plain
//    (the homepage renders them; it never imports the server
//    modules). ──
type HomeLibraryMatch = { slug: string; name: string; category: string; image: string };
type HomeWorkoutExercise = { name: string; sets: number; reps: number | string; library?: HomeLibraryMatch | null };
type HomeWorkoutDay = { name: string; focus?: string; exercises: HomeWorkoutExercise[] };
type HomeWorkoutPlan = { days: HomeWorkoutDay[] };
type HomeMealItem = { food: string; grams: number; kcal: number };
type HomeMeal = { name: string; items: HomeMealItem[]; kcal: number };
type HomeMealPlan = { meals: HomeMeal[]; kcal: number };
type HomeQuota = { used: number; limit: number; remaining: number };

// Reads the quota object the demo routes return (never throws — a
// missing quota is simply not displayed).
function readQuota(raw: unknown): HomeQuota | null {
  if (!raw || typeof raw !== "object") return null;
  const q = raw as { used?: unknown; limit?: unknown; remaining?: unknown };
  if (typeof q.limit !== "number" || typeof q.remaining !== "number") return null;
  return { used: typeof q.used === "number" ? q.used : 0, limit: q.limit, remaining: q.remaining };
}

// The quota chip line (the same honest register as the tool pages).
function quotaLine(quota: HomeQuota, isAr: boolean) {
  return isAr
    ? `رصيد الشهر: ${quota.remaining} متبقٍ من ${quota.limit}`
    : `This month: ${quota.remaining} of ${quota.limit} left`;
}

// The small segmented control used across both builders (the same
// visual register as the calculator's controls — one product).
function planSegmented(active: boolean) {
  return `flex-1 rounded-full px-3 py-2 text-xs font-medium transition-all sm:text-sm ${
    active
      ? "bg-[var(--text)] text-[var(--bg)]"
      : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--muted-2)]"
  }`;
}

// Card A — the REAL workout-plan builder (HOME-REFINE-271 F3: «قسم
// التخطيط الذكى اجعله حقيقى تفاعلى مثل الادوات» — the card runs the
// SAME generation engine as the tool: the button calls
// /api/ai/workout-plan-demo (the unified free pool — guests included,
// no signup wall) and the generated week renders HERE in-page. Before
// generating, the live split preview answers instantly from the real
// planner vocabulary; after generating, changing any choice returns
// the card to the preview so a rendered plan always matches the
// CURRENT selections — never a stale generation.
// THE HAND-OFF LAW (owner directive 2026-09-24: «الخطة المولده لا تظهر
// فى صفحة الأداة»): every successful generation is persisted via
// saveGuestPlan — the SAME envelope the tool pages re-hydrate from
// (plan-persistence.ts). Clicking «افتح الأداة الكاملة للحفظ والتصدير»
// must land on a tool that ALREADY shows this exact plan (guests:
// localStorage; members: the route's account auto-save + the local
// mirror as offline cache — the same split the tool pages write).)
function WorkoutPlanBuilder({ isAr, isLoggedIn }: { isAr: boolean; isLoggedIn: boolean }) {
  // The vocabulary arrives from the REAL planner module (single
  // source — the homepage labels can never drift from the tool).
  const goals = workoutGoalOptions(isAr ? "ar" : "en");
  const levels = workoutLevelOptions(isAr ? "ar" : "en");
  const equipment = workoutEquipmentOptions(isAr ? "ar" : "en");

  const [goal, setGoal] = useState(goals[1]?.slug ?? "muscle");
  const [level, setLevel] = useState(levels[0]?.slug ?? "beginner");
  const [days, setDays] = useState(3);
  const [equip, setEquip] = useState(equipment[2]?.slug ?? "full-gym");
  // The REAL generation state (same semantics as the tool page).
  const [plan, setPlan] = useState<HomeWorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quota, setQuota] = useState<HomeQuota | null>(null);

  const split = WORKOUT_SPLITS[days] ?? WORKOUT_SPLITS[3];
  const goalLabel = goals.find((g) => g.slug === goal)?.label ?? "";
  const levelLabel = levels.find((l) => l.slug === level)?.label ?? "";
  const equipLabel = equipment.find((e) => e.slug === equip)?.label ?? "";

  // Any selection change returns the card to the live preview.
  const pickGoal = (v: typeof goal) => { setGoal(v); setPlan(null); setError(null); };
  const pickLevel = (v: typeof level) => { setLevel(v); setPlan(null); setError(null); };
  const pickDays = (v: number) => { setDays(v); setPlan(null); setError(null); };
  const pickEquip = (v: typeof equip) => { setEquip(v); setPlan(null); setError(null); };

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const guestId = isLoggedIn ? undefined : ensureGuestId() || undefined;
      const res = await fetch("/api/ai/workout-plan-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          level,
          days,
          equipment: equip,
          language: isAr ? "ar" : "en",
          guestId,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          data?.error ||
            (isAr ? "تعذّر التوليد — حاول مرة أخرى." : "Generation failed — try again."),
        );
        setQuota(readQuota(data?.quota));
        return;
      }
      const generated = data?.plan as HomeWorkoutPlan;
      setPlan(generated);
      setQuota(readQuota(data?.quota));
      // THE HAND-OFF LAW: persist with the tool pages' envelope (the
      // inputs ride along so the full tool opens with the SAME
      // selections that produced this plan).
      saveGuestPlan("workout", generated, { goal, level, days, equipment: equip });
    } catch {
      setError(isAr ? "تعذّر التوليد — حاول مرة أخرى." : "Generation failed — try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="marble-card flex h-full flex-col p-5 md:p-7">
      <div className="flex items-center gap-2.5">
        <EngravedIcon name="rack" alt="" size={20} className="h-5 w-5" />
        <h3 className="text-xl font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>
          {isAr ? "خطة التمارين" : "The workout plan"}
        </h3>
      </div>
      <p className="mt-2 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
        {isAr
          ? "حدّد اختياراتك ثم أنشئ خطتك — تتولّد هنا في الصفحة في ثوانٍ."
          : "Set your choices and generate — it builds right here in seconds."}
      </p>

      {/* Controls — the real planner vocabulary */}
      <div className="mt-5 space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: PALETTE.textMuted }}>
            {isAr ? "هدفك" : "Your goal"}
          </p>
          <div className="flex flex-wrap gap-2">
            {goals.map((g) => (
              <button key={g.slug} type="button" onClick={() => pickGoal(g.slug)} className={planSegmented(goal === g.slug)}>
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: PALETTE.textMuted }}>
              {isAr ? "مستواك" : "Your level"}
            </p>
            <div className="flex flex-wrap gap-2">
              {levels.map((l) => (
                <button key={l.slug} type="button" onClick={() => pickLevel(l.slug)} className={planSegmented(level === l.slug)}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: PALETTE.textMuted }}>
              {isAr ? "أيام التدريب أسبوعيًا" : "Days per week"}
            </p>
            <div className="flex flex-wrap gap-2">
              {[2, 3, 4, 5, 6].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => pickDays(d)}
                  aria-pressed={days === d}
                  className={`grid min-w-11 place-items-center rounded-full px-3 py-2 text-xs font-medium transition-all sm:text-sm ${
                    days === d
                      ? "bg-[var(--text)] text-[var(--bg)]"
                      : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--muted-2)]"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: PALETTE.textMuted }}>
            {isAr ? "معداتك المتاحة" : "Your equipment"}
          </p>
          <div className="flex flex-wrap gap-2">
            {equipment.map((e) => (
              <button key={e.slug} type="button" onClick={() => pickEquip(e.slug)} className={planSegmented(equip === e.slug)}>
                {e.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* The answer area — the generated week once it exists, the
          live structure preview before that. */}
      <div
        className="mt-5 flex flex-1 flex-col rounded-[var(--radius-chrome)] border border-[var(--edge)] bg-[var(--tint)] p-4 md:p-5"
        aria-live="polite"
      >
        {plan ? (
          <div key="generated" className="swap-fade">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: PALETTE.textMuted }}>
              {isAr ? `خطتك المولّدة — ${plan.days.length} أيام` : `Your generated week — ${plan.days.length} days`}
            </p>
            <div className="mt-3 space-y-3">
              {plan.days.map((d) => (
                <div key={d.name} className="rounded-xl border border-[var(--edge)] bg-[var(--card)] p-3.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>
                      {d.name}
                    </p>
                    {d.focus && (
                      <span className="text-xs font-normal" style={{ color: PALETTE.textSec }}>
                        {d.focus}
                      </span>
                    )}
                  </div>
                  <ul className="mt-1.5 divide-y divide-[var(--edge)]/60">
                    {d.exercises.map((ex, i) => {
                      const lib = ex.library ?? null;
                      const href = lib ? `${isAr ? "/ar" : ""}/exercises/${lib.slug}` : null;
                      return (
                        <li key={`${ex.name}-${i}`} className="flex items-center gap-3 py-2 text-sm font-normal">
                          {lib && href ? (
                            <>
                              <a href={href} className="shrink-0" tabIndex={-1} aria-hidden="true">
                                <span className="block h-11 w-11 overflow-hidden rounded-lg border border-[var(--edge)]/60 bg-[var(--card)]">
                                  <ImageWithFallback
                                    src={lib.image}
                                    alt=""
                                    width={44}
                                    height={44}
                                    className="h-11 w-11 object-contain"
                                    fallbackSrc={getFallbackSVG(lib.category)}
                                  />
                                </span>
                              </a>
                              <a
                                href={href}
                                className="min-w-0 flex-1 font-medium underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70"
                                style={{ color: PALETTE.textPrim }}
                              >
                                {ex.name}
                              </a>
                            </>
                          ) : (
                            <span className="min-w-0 flex-1" style={{ color: PALETTE.textSec }}>
                              {ex.name}
                            </span>
                          )}
                          <span className="whitespace-nowrap text-xs font-semibold" style={{ color: PALETTE.textSec }} dir="ltr">
                            {ex.sets} × {ex.reps}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs font-normal leading-relaxed" style={{ color: PALETTE.textMuted }}>
              {isAr
                ? "الحركات المرتبطة من مكتبة التمارين تفتح صفحة شرحها الكامل — والنظام تقدير تعليمي قابل للنسخ."
                : "Linked movements open their full how-to page in the exercise library — the split is a copyable educational estimate."}
            </p>
            <a
              href={isAr ? "/ar/ai-workout-planner" : "/ai-workout-planner"}
              className="mt-2 inline-flex text-xs font-semibold underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70"
              style={{ color: PALETTE.textPrim }}
            >
              {isAr ? "افتح الأداة الكاملة للحفظ والتصدير ›" : "Open the full tool to save & export ›"}
            </a>
          </div>
        ) : (
          <div key={`${days}-${goal}`} className="swap-fade">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: PALETTE.textMuted }}>
              {isAr ? "هيكل أسبوعك" : "Your week's structure"}
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>
              {isAr ? `${days} أيام — ${split.nameAr}` : `${days} days — ${split.nameEn}`}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(isAr ? split.daysAr : split.daysEn).map((d, i) => (
                <span key={i} className="seal-chip py-1! text-[11px]!">
                  {isAr ? `اليوم ${i + 1}` : `Day ${i + 1}`}
                  <span aria-hidden="true" style={{ opacity: 0.4 }}>·</span>
                  {d}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
              {`${goalLabel} · ${levelLabel} · ${equipLabel}`}
            </p>
          </div>
        )}
        {/* The generate row — the REAL engine call (unified pool). */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="btn-chrome px-6 py-3 text-sm disabled:opacity-50 md:text-base"
          >
            {loading
              ? isAr ? "جارٍ إنشاء خطتك…" : "Building your plan…"
              : plan
                ? isAr ? "ولّد خطة أخرى" : "Generate another"
                : isAr ? "أنشئ خطة التمارين" : "Create my workout plan"}
          </button>
          {quota && quota.limit > 0 && (
            <span className="text-xs font-normal" style={{ color: PALETTE.textMuted }}>
              {quotaLine(quota, isAr)}
            </span>
          )}
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-[#ff3b30]">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

// Card B — the REAL nutrition-plan builder (HOME-REFINE-271 F3):
// calorie level (the REAL matrix levels, 1200→3000) + diet system →
// the button calls /api/ai/meal-plan-demo (the unified free pool)
// and the generated DAY renders in-page — meals, items, grams, and
// kcal, the same engine as the tool. Before generating, the REAL
// matrix split previews live; changing any choice returns the card
// to the preview (a rendered plan always matches the choices).
// THE HAND-OFF LAW (owner directive 2026-09-24): every successful
// generation is persisted via saveGuestPlan — the same envelope the
// ai-meal-planner page re-hydrates from, so «افتح الأداة الكاملة»
// lands on the tool ALREADY showing this exact day.
function MealPlanBuilder({ samples, isAr, isLoggedIn }: { samples: HomeSamples; isAr: boolean; isLoggedIn: boolean }) {
  const systems = samples.dietSystems;
  const levels = samples.dietLevels;
  const [calories, setCalories] = useState(levels.includes(2000) ? 2000 : (levels[3] ?? levels[0] ?? 2000));
  const [systemSlug, setSystemSlug] = useState(systems[0]?.slug ?? "balanced");
  // The REAL generation state (same semantics as the tool page).
  const [plan, setPlan] = useState<HomeMealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quota, setQuota] = useState<HomeQuota | null>(null);

  const system: HomeDietSystemSample | undefined =
    systems.find((s) => s.slug === systemSlug) ?? systems[0];

  const maxSplit = system
    ? Math.max(system.split.protein, system.split.carbs, system.split.fat)
    : 1;

  // Any selection change returns the card to the live preview.
  const pickCalories = (v: number) => { setCalories(v); setPlan(null); setError(null); };
  const pickSystem = (v: string) => { setSystemSlug(v); setPlan(null); setError(null); };

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const guestId = isLoggedIn ? undefined : ensureGuestId() || undefined;
      const res = await fetch("/api/ai/meal-plan-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calories,
          system: systemSlug,
          language: isAr ? "ar" : "en",
          guestId,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          data?.error ||
            (isAr ? "تعذّر التوليد — حاول مرة أخرى." : "Generation failed — try again."),
        );
        setQuota(readQuota(data?.quota));
        return;
      }
      const generated = data?.plan as HomeMealPlan;
      setPlan(generated);
      setQuota(readQuota(data?.quota));
      // THE HAND-OFF LAW: persist with the tool pages' envelope (the
      // calorie level + system ride along as the tool's inputs).
      saveGuestPlan("nutrition", generated, { calories, system: systemSlug });
    } catch {
      setError(isAr ? "تعذّر التوليد — حاول مرة أخرى." : "Generation failed — try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="marble-card flex h-full flex-col p-5 md:p-7">
      <div className="flex items-center gap-2.5">
        <EngravedIcon name="mealplanner" alt="" size={20} className="h-5 w-5" />
        <h3 className="text-xl font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>
          {isAr ? "خطة التغذية" : "The nutrition plan"}
        </h3>
      </div>
      <p className="mt-2 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
        {isAr
          ? "اختر سعراتك ونظامك الغذائي ثم أنشئ خطتك — يوم كامل بالوجبات والغرامات."
          : "Pick your calories and diet system, then generate — a full day of meals in grams."}
      </p>

      {/* Controls */}
      <div className="mt-5 space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: PALETTE.textMuted }}>
            {isAr ? "سعراتك اليومية" : "Your daily calories"}
          </p>
          <div className="flex flex-wrap gap-2">
            {levels.map((lv) => (
              <button
                key={lv}
                type="button"
                onClick={() => pickCalories(lv)}
                aria-pressed={calories === lv}
                className={`grid min-w-14 place-items-center rounded-full px-3 py-2 text-xs font-medium transition-all sm:text-sm ${
                  calories === lv
                    ? "bg-[var(--text)] text-[var(--bg)]"
                    : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--muted-2)]"
                }`}
                dir="ltr"
              >
                {lv.toLocaleString("en-US")}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: PALETTE.textMuted }}>
            {isAr ? "نظامك الغذائي" : "Your diet system"}
          </p>
          <div className="flex flex-wrap gap-2">
            {systems.map((s) => (
              <button key={s.slug} type="button" onClick={() => pickSystem(s.slug)} className={planSegmented(systemSlug === s.slug)}>
                {isAr ? s.nameAr : s.nameEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* The answer area — the generated day once it exists, the
          real matrix split preview before that. */}
      <div
        className="mt-5 flex flex-1 flex-col rounded-[var(--radius-chrome)] border border-[var(--edge)] bg-[var(--tint)] p-4 md:p-5"
        aria-live="polite"
      >
        {plan ? (
          <div key="generated" className="swap-fade">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: PALETTE.textMuted }}>
              {isAr ? "يومك المولّد" : "Your generated day"}
            </p>
            <div className="mt-3 space-y-3">
              {plan.meals.map((m) => (
                <div key={m.name} className="rounded-xl border border-[var(--edge)] bg-[var(--card)] p-3.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>
                      {m.name}
                    </p>
                    <span className="text-xs font-semibold" style={{ color: PALETTE.textSec }} dir="ltr">
                      {m.kcal} kcal
                    </span>
                  </div>
                  <ul className="mt-1.5 divide-y divide-[var(--edge)]/60">
                    {m.items.map((item, i) => (
                      <li key={`${item.food}-${i}`} className="flex items-baseline justify-between gap-3 py-1.5 text-sm font-normal">
                        <span style={{ color: PALETTE.textSec }}>{item.food}</span>
                        <span className="whitespace-nowrap text-xs" style={{ color: PALETTE.textMuted }} dir="ltr">
                          {item.grams} g · {item.kcal} kcal
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-3 flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold" style={{ color: PALETTE.textPrim }}>
                {isAr ? "إجمالي اليوم" : "Day total"}
              </span>
              <span className="chrome-text font-bold" dir="ltr">
                {plan.kcal} kcal
              </span>
            </p>
            <p className="mt-2 text-xs font-normal leading-relaxed" style={{ color: PALETTE.textMuted }}>
              {isAr
                ? "الخطة تقدير تعليمي قابل للنسخ — راجع الكميات وعدّلها على مائدتك، وقِس أثرها بالاتجاه الأسبوعي."
                : "This plan is a copyable educational estimate — review the portions, adjust them to your table, and measure the weekly trend."}
            </p>
            <a
              href={isAr ? "/ar/ai-meal-planner" : "/ai-meal-planner"}
              className="mt-2 inline-flex text-xs font-semibold underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70"
              style={{ color: PALETTE.textPrim }}
            >
              {isAr ? "افتح الأداة الكاملة للحفظ والتصدير ›" : "Open the full tool to save & export ›"}
            </a>
          </div>
        ) : (
          system && (
            <div key={system.slug} className="swap-fade">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: PALETTE.textMuted }}>
                {isAr ? "توزيع ماكروزك" : "Your macro split"}
              </p>
              <p className="mt-1 text-lg font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>
                {isAr ? `النظام ${system.nameAr}` : `The ${system.nameEn} system`}
              </p>
              <div className="mt-4 space-y-3">
                {(
                  [
                    { key: "protein", labelAr: "بروتين", labelEn: "Protein", pct: system.split.protein },
                    { key: "carbs", labelAr: "كربوهيدرات", labelEn: "Carbs", pct: system.split.carbs },
                    { key: "fat", labelAr: "دهون", labelEn: "Fat", pct: system.split.fat },
                  ] as const
                ).map((m) => (
                  <div key={m.key}>
                    <div className="mb-1.5 flex items-baseline justify-between text-sm">
                      <span className="font-medium" style={{ color: PALETTE.textPrim }}>
                        {isAr ? m.labelAr : m.labelEn}
                      </span>
                      <span className="font-semibold" style={{ color: PALETTE.textSec }}>
                        {m.pct}%
                      </span>
                    </div>
                    <div className="macro-track">
                      <div
                        className="macro-fill"
                        style={{ width: `${Math.max(4, Math.round((m.pct / maxSplit) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
                {isAr
                  ? `خطة يوم كامل بالغرامات تُبنى حول ${calories.toLocaleString("en-US")} سعرة عند الضغط على الزر. لا تعرف رقمك؟ احسبه في الحاسبة أعلاه.`
                  : `A full day of food in grams builds around ${calories.toLocaleString("en-US")} kcal when you press the button. Don't know your number? Use the calculator above.`}
              </p>
            </div>
          )
        )}
        {/* The generate row — the REAL engine call (unified pool). */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="btn-chrome px-6 py-3 text-sm disabled:opacity-50 md:text-base"
          >
            {loading
              ? isAr ? "جارٍ إنشاء خطتك…" : "Building your plan…"
              : plan
                ? isAr ? "ولّد خطة أخرى" : "Generate another"
                : isAr ? "أنشئ خطتي" : "Create My Plan"}
          </button>
          {quota && quota.limit > 0 && (
            <span className="text-xs font-normal" style={{ color: PALETTE.textMuted }}>
              {quotaLine(quota, isAr)}
            </span>
          )}
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-[#ff3b30]">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

// ── The diet-system card (the ready-made diet-plan library
//    carousel, HOME-REFINE-270 R4). Every value is the REAL matrix
//    data (server slice) — the card links into a real leaf page of
//    the library (the mid 2000-kcal level of that system). ──
function LandingDietCard({ system, levelCount, isAr }: { system: HomeDietSystemSample; levelCount: number; isAr: boolean }) {
  const name = isAr ? system.nameAr : system.nameEn;
  return (
    <a
      href={`${isAr ? "/ar" : ""}/diet-plan/2000/${system.slug}`}
      className="marble-card card-lift group flex w-72 shrink-0 flex-col p-5 text-start md:w-80"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>
          {isAr ? `النظام ${system.nameAr}` : `${system.nameEn}`}
        </h3>
        <span className="whitespace-nowrap text-xs font-normal" style={{ color: PALETTE.textMuted }} dir="ltr">
          {system.split.protein}/{system.split.carbs}/{system.split.fat}
        </span>
      </div>
      <p className="mt-2 flex-1 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
        {isAr ? system.lineAr : system.lineEn}
      </p>
      <p className="mt-3 text-xs font-medium" style={{ color: PALETTE.textSec }}>
        {isAr
          ? `${levelCount} مستويات سعرات — من 1200 إلى 3000 سعرة`
          : `${levelCount} calorie levels — from 1200 to 3000 kcal`}
      </p>
      <p className="chrome-text mt-3 text-xs font-semibold">
        {isAr ? "افتح خطة 2000 سعرة ›" : "Open the 2000-kcal plan ›"}
      </p>
    </a>
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

// ── The interactive muscle-group library browser (HOME-REFINE-271
//    F1 — RESTORED from the living-product rebuild): real curated
//    samples filtered in-page by muscle group, with a quiet
//    crossfade on every swap. The chips mirror the hub vocabulary
//    and carry the VERIFIED per-family counts (the drift-tested
//    EXERCISE_CATEGORY_COUNTS); the CTA opens the full library. ──
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
        <div className="chips-row mt-3">
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

export function LandingView({ samples }: { samples: HomeSamples }) {
  const { lang } = useI18n();
  const { isCoach, isAdmin, profile } = useAuth();
  const isAr = lang === "ar";
  // The hero CTA stays account-driven for the PRIMARY action; the
  // secondary CTA is the memberships page (HOME-REFINE-270 R1 — the
  // owner's two-button directive overrides the old funnel-free-hero
  // law): guests get login/signup + memberships, signed-in members
  // get their console + memberships.
  const isLoggedIn = !!profile;
  const memberHref = isAdmin ? "/admin" : isCoach ? "/coach" : "/dashboard";

  const [latestPosts, setLatestPosts] = useState<BlogPostCard[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPostCard[]>([]);
  // 0037 «أعلن معنا» — coaches with a running ad (homepage featured strip)
  type FeaturedCoach = { slug: string | null; name: string; headline: string; photo: string | null };
  const [featuredCoaches, setFeaturedCoaches] = useState<FeaturedCoach[]>([]);

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
  const premiumPriceLabel = `$${(premiumTier?.priceMonthly ?? 0).toFixed(2)}`;
  const proPriceLabel = `$${(proTier?.priceMonthly ?? 0).toFixed(2)}`;
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

  // Proof strip — the four auditable platform numbers, now as ONE
  // compact row directly under the promise (HOME-REFINE-270 R2: small
  // type, numbers + labels inline). Every value rides a verified
  // constant or a documented quota; nothing invented. The count-up
  // beat survives (SSR renders the truth; motion is a bonus).
  const proofStats = [
    {
      value: EXERCISES_COUNT,
      suffix: "+",
      labelAr: "تمرينًا",
      labelEn: "exercises",
    },
    {
      value: FOODS_COUNT,
      suffix: "+",
      labelAr: "صنفًا غذائيًا",
      labelEn: "foods",
    },
    {
      value: TOOLS_COUNT,
      suffix: "",
      labelAr: "أدوات مجانية",
      labelEn: "free tools",
    },
    {
      value: 10,
      suffix: "",
      labelAr: "رسائل EVO يوميًا",
      labelEn: "daily EVO messages",
    },
  ];

  // The ready-made plans count derives from the real matrix slice
  // (systems × levels = 4 × 6 = 24) — never a literal.
  const dietPlansCount = samples.dietSystems.length * samples.dietLevels.length;

  // The dark-marble + chrome-ring card recipe (the /memberships visual
  // language — one concept, one recipe).
  const darkMarbleStyle = {
    backgroundColor: "#0B0B0D",
    color: "#F5F5F7",
    border: "2px solid transparent",
    backgroundImage:
      "linear-gradient(#0B0B0D, #0B0B0D), linear-gradient(145deg, #FDFDFD 0%, #C9CED3 35%, #878E94 50%, #E6E9EC 70%, #9AA0A6 100%)",
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
  } as const;

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
          + H1 + subtitle). HOME-REFINE-270 R1: exactly TWO CTAs side by
          side — login/signup (primary) + the premium-memberships page
          (secondary); signed-in members keep their console as the
          primary. On touch the actions STACK full-width (no mis-tap
          risk beside the artwork); md+ keeps the single centered row. */}
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

          {/* The two-button pair (R1). */}
          <div className="mt-5 flex flex-col items-stretch justify-center gap-3 md:mt-6 md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-x-5 md:gap-y-3">
            {isLoggedIn ? (
              <>
                <a href={memberHref} className="btn-chrome w-full px-7 py-3 text-sm md:w-auto md:px-8 md:py-3 md:text-base">
                  {isAr ? "انتقل إلى لوحة التحكم" : "Go to your dashboard"}
                  <span className="rtl:rotate-180">›</span>
                </a>
                <a
                  href={isAr ? "/ar/memberships" : "/memberships"}
                  className="btn-outline w-full px-6 py-2.5 text-sm font-medium md:w-auto md:py-2.5 md:text-base"
                >
                  {isAr ? "العضويات المميزة" : "Premium memberships"}
                  <span className="rtl:rotate-180" aria-hidden="true">›</span>
                </a>
              </>
            ) : (
              <>
                <a href="/auth?mode=signup" className="btn-chrome w-full px-7 py-3 text-sm md:w-auto md:px-8 md:py-3 md:text-base">
                  {isAr ? "تسجيل الدخول / حساب جديد" : "Log in / Sign up"}
                  <span className="rtl:rotate-180">›</span>
                </a>
                <a
                  href={isAr ? "/ar/memberships" : "/memberships"}
                  className="btn-outline w-full px-6 py-2.5 text-sm font-medium md:w-auto md:py-2.5 md:text-base"
                >
                  {isAr ? "العضويات المميزة" : "Premium memberships"}
                  <span className="rtl:rotate-180" aria-hidden="true">›</span>
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ===================== 2. PROOF — one compact row =====================
          The four auditable numbers as a single slim band (R2). All values
          ride verified constants or documented quotas
          (EXERCISES_COUNT / FOODS_COUNT / TOOLS_COUNT / the EVO
          fair-use daily limit); the page invents nothing. The count-up
          beat survives — reduced-motion safe, SSR-honest. */}
      <section aria-label={isAr ? "المنصة بالأرقام" : "The platform in numbers"} className="border-y border-[var(--edge)] bg-[var(--tint)] px-4 py-3.5 md:py-4">
        <div className="mx-auto flex max-w-5xl flex-wrap items-baseline justify-center gap-x-6 gap-y-1.5 md:gap-x-10">
          {proofStats.map((stat) => (
            <span key={stat.labelEn} className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="chrome-text text-base font-bold tracking-tight md:text-lg">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </span>
              <span className="text-xs font-normal md:text-sm" style={{ color: PALETTE.textSec }}>
                {isAr ? stat.labelAr : stat.labelEn}
              </span>
            </span>
          ))}
        </div>
      </section>

      {/* ===================== 3. THE CALCULATOR — independent (R3) =====================
          The first of the three former tab surfaces, now its own section:
          the REAL calorie/macro calculator running the app's own math
          (fitness-math.ts single source) — the visitor gets their real
          numbers on the homepage itself. */}
      <section id="start" className="scroll-mt-20 bg-[var(--bg)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <span className="seal-chip">
              <EngravedIcon name="calories" alt="" size={12} className="h-3 w-3" />
              {isAr ? "حاسبة السعرات والماكروز" : "THE CALORIE & MACRO CALCULATOR"}
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "اعرف أرقامك قبل أي خطوة." : "Know your numbers before anything else."}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "سعراتك اليومية وتوزيع ماكروزك حول هدفك — بنفس معادلات المنصة، ودون أي تسجيل."
                : "Your daily calories and macro split around your goal — the platform's own formulas, no signup."}
            </p>
          </Reveal>
          <Reveal delay={80} className="mt-8 md:mt-10">
            <div className="marble-card marble-card--unclipped p-4 md:p-8 lg:p-10">
              <HomeCalculator isAr={isAr} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================== 4. EVO — independent (R3/R5) =====================
          EVO owns its own section (the owner directive: it is a SEPARATE
          thing from the smart-planning world). The Phase 127 warrior-art
          recipe stays: text on the inline-start, warrior art dissolving
          into the marble on the inline-end (.evo-art-mask, mirrored in
          RTL). The demo conversation stays LABELED illustrative and the
          CTA dispatches openEvoFloatingChat — the EVO CHAT SURFACE LAW. */}
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
                  {isAr ? "EVO — مدربك الذكي داخل المنصة" : "EVO — YOUR AI COACH"}
                </span>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
                  {isAr ? "تحدّث مع EVO — بالعربية أو الإنجليزية." : "Talk to EVO — in Arabic or English."}
                </h2>
                <p className="mt-3 text-base font-normal leading-relaxed md:text-lg" style={{ color: PALETTE.textSec }}>
                  {isAr
                    ? "يفهم هدفك، يجيب بأرقام، ثم يبني خطتك ويعدّلها بتبديلات ذكية — والفقاعة أسفل الصفحة تفتح المحادثة الحقيقية الآن."
                    : "It understands your goal, answers with numbers, then builds and adjusts your plan with smart swaps — the bubble at the bottom of this page opens the real chat now."}
                </p>
                <div className="mt-7">
                  <EvoConversation isAr={isAr} />
                </div>
              </div>
              {/* HOME-REFINE-271 F2: the mobile warrior-art cutout under
                  the copy is REMOVED (the owner's «بدون صورة فى الاسفل»
                  directive) — the desktop inline-end side art stays. */}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================== 5. SMART PLANNING — REAL generation (R5 + 271 F3) =====================
          The owner's follow-up directive: the section is TRULY
          interactive like the tools — both builders call the REAL
          generation endpoints (the unified free pool, guests
          included) and render the generated plan in-page. EVO is not
          mentioned here (it owns #evo above) and no coach is
          referenced (online coaching is a separate paid membership —
          the old «مدرب يواكب تقدّمك» framing was wrong and is gone). */}
      <section id="plan" className="scroll-mt-20 bg-[var(--bg)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <span className="seal-chip">
              <EngravedIcon name="macros" alt="" size={12} className="h-3 w-3" />
              {isAr ? "التخطيط الذكي" : "SMART PLANNING"}
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "خطتك تُبنى هنا — فعلًا." : "Your plan is built right here."}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "حدّد اختياراتك واضغط زر الإنشاء — خطة كاملة بالتمارين والمجموعات أو بالوجبات والغرامات تتولّد هنا في الصفحة، بنفس محرك الأدوات."
                : "Set your choices and hit generate — a full plan (exercises and sets, or meals in grams) is created right on this page by the same engine as the tools."}
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-normal leading-relaxed" style={{ color: PALETTE.textMuted }}>
              {isAr
                ? "كل زائر يملك رصيدًا شهريًا مجانيًا لتوليد الخطط — دون تسجيل."
                : "Every visitor carries a free monthly plan allowance — no signup."}
            </p>
          </Reveal>
          <div className="mt-8 grid gap-5 md:mt-10 lg:grid-cols-2">
            <Reveal className="h-full">
              <WorkoutPlanBuilder isAr={isAr} isLoggedIn={isLoggedIn} />
            </Reveal>
            <Reveal delay={80} className="h-full">
              <MealPlanBuilder samples={samples} isAr={isAr} isLoggedIn={isLoggedIn} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================== 6. THE EXERCISE LIBRARY — interactive (271 F1) =====================
          The RESTORED muscle-group browser (the owner's correction:
          the interactive مكتبة التمارين returns as its own section — a
          real filter answering in-page, not a carousel). The chips
          mirror the hub vocabulary and carry the VERIFIED per-family
          counts; every card is a real exercise page entry point. */}
      <section id="library" className="scroll-mt-20 bg-[var(--tint)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <span className="seal-chip">
              <EngravedIcon name="dumbbell" alt="" size={12} className="h-3 w-3" />
              {isAr ? `${EX_PLUS} تمرينًا` : `${EX_PLUS} EXERCISES`}
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "مكتبة التمارين" : "The exercise library"}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "عينة حقيقية من المكتبة — اختر مجموعة عضلية وشاهد البطاقات تتبدل أمامك، وكل تمرين بصفحته وصور الأداء الصحيح."
                : "A real slice of the library — pick a muscle group and watch the cards swap; every exercise opens its own page with form photos."}
            </p>
          </Reveal>
          <Reveal delay={80} className="mt-8 md:mt-10">
            <LibraryBrowser samples={samples} isAr={isAr} />
          </Reveal>
        </div>
      </section>

      {/* ===================== 7. EAT — the interactive plate =====================
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

      {/* ===================== 8. READY-MADE PROGRAMS — the carousel (271 F1) =====================
          The owner's correction: this pre-blog carousel slot carries
          the READY-MADE PROGRAMS (برامج التمارين الجاهزة) — the same
          blog-style carousel treatment, real program artwork, and ONE
          focused browse-all CTA (the AI-builder CTA retired 2026-09-24;
          the interactive exercise library lives in its own section
          above, the smart-planning builders in #plan). */}
      <section id="train" className="scroll-mt-20 bg-[var(--tint)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <span className="seal-chip">
              <EngravedIcon name="dumbbell" alt="" size={12} className="h-3 w-3" />
              {isAr ? "برامج جاهزة" : "READY-MADE PROGRAMS"}
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "برامج التمارين الجاهزة" : "Ready-made training programs"}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "برامج جاهزة بجدول وتمارين ومجموعات وتكرارات — اتبعها كما هي، أو اجعلها نقطة انطلاق وعدّلها بحسب وقتك ومعداتك."
                : "Ready-made programs with a schedule, exercises, sets, and reps — follow one as-is, or make it your starting point and adapt it to your time and equipment."}
            </p>
          </Reveal>
          <Reveal delay={80} className="mt-8 md:mt-10">
            <CarouselShell isAr={isAr} ariaLabel={isAr ? "برامج التمارين الجاهزة" : "Ready-made training programs"}>
              {samples.programs.map((prog) => (
                <div key={prog.slug} className="w-72 shrink-0 md:w-80">
                  <LandingProgramCard prog={prog} isAr={isAr} />
                </div>
              ))}
            </CarouselShell>
          </Reveal>
          {/* ONE focused section CTA (owner directive 2026-09-24: the
              AI-builder CTA is retired here — the smart-planning
              builders own that job in #plan above). */}
          <Reveal delay={120} className="mt-10 text-center">
            <a
              href={isAr ? "/ar/programs" : "/programs"}
              className="btn-outline px-7 py-3 text-sm font-medium md:text-base"
            >
              {isAr ? "كل البرامج" : "All programs"}
              <span className="rtl:rotate-180" aria-hidden="true">›</span>
            </a>
          </Reveal>
        </div>
      </section>

      {/* ===================== 9. THE READY-MADE DIET LIBRARY — carousel (R4) =====================
          The owner directive: add the ready-made diet-plan library
          (مكتبة الخطط الغذائية الجاهزة) to the homepage, beside the
          exercise library. Real matrix data (server slice) — every card
          links into a real leaf page of the /diet-plan library. */}
      <section id="diet" className="scroll-mt-20 bg-[var(--bg)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <span className="seal-chip">
              <EngravedIcon name="mealplanner" alt="" size={12} className="h-3 w-3" />
              {isAr ? `${dietPlansCount} خطة جاهزة` : `${dietPlansCount} READY-MADE PLANS`}
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "مكتبة الخطط الغذائية الجاهزة" : "The ready-made diet-plan library"}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "أنظمة جاهزة بالغرامات والسعرات لكل صنف، من مطبخ عربي مألوف — من 1200 إلى 3000 سعرة."
                : "Ready-made systems with grams and calories per food, from a familiar Arabic kitchen — from 1200 to 3000 kcal."}
            </p>
          </Reveal>
          <Reveal delay={80} className="mt-8 md:mt-10">
            <CarouselShell isAr={isAr} ariaLabel={isAr ? "الأنظمة الغذائية الجاهزة" : "The ready-made diet systems"}>
              {samples.dietSystems.map((system) => (
                <LandingDietCard
                  key={system.slug}
                  system={system}
                  levelCount={samples.dietLevels.length}
                  isAr={isAr}
                />
              ))}
            </CarouselShell>
          </Reveal>
          <Reveal delay={120} className="mt-8 text-center">
            <a href={isAr ? "/ar/diet-plan" : "/diet-plan"} className="btn-outline px-7 py-3 text-sm font-medium md:text-base">
              {isAr ? "افتح مكتبة الخطط الغذائية" : "Open the diet-plan library"}
              <span className="rtl:rotate-180" aria-hidden="true">›</span>
            </a>
          </Reveal>
        </div>
      </section>

      {/* ===================== 10. LEARN — the latest articles (R6) =====================
          The simple title the owner asked for («أحدث المقالات»), and
          the carousel is LATEST-FIRST: the newest posts actually lead
          the row (featured posts fill the rest; featured slugs keep
          the dark lead-card styling). The section renders only when
          posts loaded (the needsPosts law). */}
      {latestPosts.length > 0 && (
        <section id="learn" className="scroll-mt-20 bg-[var(--tint)] px-4 py-10 md:py-20">
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {isAr ? "أحدث المقالات" : "Latest Articles"}
              </h2>
            </Reveal>
            <div className="mt-10">
              <BlogCarousel
                posts={[...latestPosts, ...featuredPosts].slice(0, 10)}
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

      {/* ===================== 11. MEMBERSHIPS — small cards (R7) =====================
          The compact treatment the owner asked for: SMALL attractive
          membership cards + one online-coaching card. Prices derive
          from memberships.ts (single source — no literals); the free
          card routes to signup, premium/pro to the memberships page;
          the coaching card (the dark marble + chrome ring) carries the
          section's single filled CTA. */}
      <section id="memberships" className="scroll-mt-20 bg-[var(--bg)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "العضويات المميزة" : "Premium memberships"}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "المستوى المجاني دائم — والترقية حين تحتاج سعة أكبر ومزايا أوسع."
                : "The free tier is permanent — upgrade when you need more room and wider features."}
            </p>
          </Reveal>

          {/* The small membership cards (Free · Premium · Pro). */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 md:mt-10">
            {/* Free — routes to signup. */}
            <Reveal className="h-full">
              <a href="/auth?mode=signup" className="marble-card card-lift group flex h-full flex-col p-5 text-start">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-lg font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>
                    {isAr ? freeTier?.nameAr : freeTier?.nameEn}
                  </h3>
                  <span className="chrome-text text-lg font-bold">{freePriceLabel}</span>
                </div>
                <p className="mt-3 flex-1 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
                  {isAr
                    ? "كل المكتبات والأدوات، ورصيد شهري للخطط الذكية."
                    : "Every library and tool, plus a monthly AI-plan allowance."}
                </p>
                <p className="chrome-text mt-4 text-sm font-semibold">
                  {isAr ? "ابدأ مجانًا ›" : "Start free ›"}
                </p>
              </a>
            </Reveal>
            {/* Premium — the recommended card (dark marble + chrome ring). */}
            <Reveal delay={80} className="h-full">
              <div className="relative h-full" style={darkMarbleStyle}>
                <span
                  className="seal-chip absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0B0B0D]"
                  style={{ color: "#F5F5F7", borderColor: "#3A3F45" }}
                >
                  <EngravedIcon name="laurel" alt="" size={12} className="h-3 w-3" />
                  {isAr ? "موصى بها" : "Recommended"}
                </span>
                <a
                  href={isAr ? "/ar/memberships" : "/memberships"}
                  className="flex h-full flex-col p-5 pt-6 text-start"
                  style={{ color: "#F5F5F7" }}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-lg font-semibold tracking-tight" style={{ color: "#F5F5F7" }}>
                      {isAr ? premiumTier?.nameAr : premiumTier?.nameEn}
                    </h3>
                    <span className="chrome-text-on-dark text-lg font-bold">
                      {premiumPriceLabel}
                      <span className="text-xs font-medium" style={{ color: "rgba(245,245,247,0.6)" }}>
                        {isAr ? " / شهريًا" : " /mo"}
                      </span>
                    </span>
                  </div>
                  <p className="mt-3 flex-1 text-sm font-normal leading-relaxed" style={{ color: "rgba(245,245,247,0.72)" }}>
                    {isAr
                      ? "EVO بلا حدود، و4 خطط شهريًا، وتصدير كامل."
                      : "Unlimited EVO, 4 plans a month, full export."}
                  </p>
                  <p className="mt-4 text-sm font-semibold" style={{ color: "#F5F5F7" }}>
                    {isAr ? "التفاصيل ›" : "See details ›"}
                  </p>
                </a>
              </div>
            </Reveal>
            {/* Pro. */}
            <Reveal delay={160} className="h-full">
              <a href={isAr ? "/ar/memberships" : "/memberships"} className="marble-card card-lift group flex h-full flex-col p-5 text-start">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-lg font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>
                    {isAr ? proTier?.nameAr : proTier?.nameEn}
                  </h3>
                  <span className="chrome-text text-lg font-bold">
                    {proPriceLabel}
                    <span className="text-xs font-medium" style={{ color: PALETTE.textMuted }}>
                      {isAr ? " / شهريًا" : " /mo"}
                    </span>
                  </span>
                </div>
                <p className="mt-3 flex-1 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
                  {isAr
                    ? "8 خطط شهريًا، وتجربة بلا إعلانات."
                    : "8 plans a month, and an ad-free experience."}
                </p>
                <p className="chrome-text mt-4 text-sm font-semibold">
                  {isAr ? "التفاصيل ›" : "See details ›"}
                </p>
              </a>
            </Reveal>
          </div>

          {/* The online-coaching card — the human service, separate from
              the memberships (the terminology law), carrying the
              section's ONE filled CTA. */}
          <Reveal delay={200} className="mt-4 md:mt-5">
            <div className="relative overflow-hidden rounded-[var(--radius-chrome)] p-5 md:p-7" style={darkMarbleStyle}>
              <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight" style={{ color: "#F5F5F7" }}>
                    {isAr ? "التدريب الأونلاين (الكوتشينج)" : "Online Coaching"}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm font-normal leading-relaxed" style={{ color: "rgba(245,245,247,0.72)" }}>
                    {isAr
                      ? "مدرب بشري يبني خططك بنفسه، ويتابع تقدمك أسبوعيًا، ويبقى على تواصل مباشر معك — ويشمل كل مزايا برو."
                      : "A human coach builds your plans personally, follows your progress weekly, and stays in direct contact — all Pro features included."}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
                  <span className="chrome-text-on-dark text-2xl font-bold">
                    {coachingPriceLabel}
                    <span className="text-xs font-medium" style={{ color: "rgba(245,245,247,0.6)" }}>
                      {isAr ? " / شهريًا" : " /mo"}
                    </span>
                  </span>
                  <a href={isAr ? "/ar/coaching" : "/coaching"} className="btn-chrome px-6 py-2.5 text-sm font-medium">
                    {isAr ? "استكشف التدريب الأونلاين ›" : "Explore online coaching ›"}
                  </a>
                </div>
              </div>
            </div>
          </Reveal>

          {/* The REAL refund policy, stated as fact (refund.ts: 7-day
              conditional, no-features-used). */}
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs font-normal leading-relaxed" style={{ color: PALETTE.textMuted }}>
            {isAr
              ? "كل باقة مدفوعة تشمل حق الاسترداد خلال 7 أيام — إن لم تستخدم المزايا المدفوعة، يُعاد إليك المبلغ."
              : "Every paid plan carries a 7-day refund — if you haven't used the paid features, you get your money back."}
          </p>
        </div>
      </section>

      {/* ===================== 11.5 FEATURED COACHES («أعلن معنا» ads) =====================
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

      {/* ===================== 12. FAQ — hesitation-removers =====================
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

      {/* ===================== FOOTER — the SHARED SiteFooter component;
          every public page renders the identical footer (HOME-REFINE-270
          R9: flat, fully displayed — no disclosure groups). ===================== */}
      <SiteFooter />
    </div>
  );
}
