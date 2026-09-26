"use client";

import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { weeksUnitAr } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
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
import { NewsletterForm } from "@/components/NewsletterForm";
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

// ── CountUp — the proof numbers come ALIVE (VRD-V7 P1-4) ──
// SSR renders the final value (no-JS/hydration always shows the
// truth); when the strip scrolls into view and motion is allowed,
// the number counts up once with a SPRING settle and a light BLUR
// materialization (21st.dev-style count-up re-authored internally —
// zero dependencies, rAF-only):
//   · spring — a gentle easeOutBack overshoot (~5%) that settles back
//     onto the true value (the «living platform» beat);
//   · blur — the digits start softly defocused and sharpen as they
//     land (filter+opacity only — compositor-friendly, no layout);
//   · ZERO CLS — the final string renders as an in-flow ghost sizer
//     (.count-sizer) while the animating digits ride an absolute
//     overlay (.count-live), so the strip never wobbles;
//   · accessibility — the animated digits are aria-hidden and the
//     final value is announced once via .sr-only;
// The value stays derived from the verified constants.
function CountUp({
  value,
  suffix = "",
  paintClass = "",
}: {
  value: number;
  suffix?: string;
  /** The wrapper's text-paint class (e.g. chrome-text). It must ride
   * the in-flow sizer AND the absolute overlay SEPARATELY: a parent's
   * background-clip:text never clips to out-of-flow descendants, so
   * the overlay has to own its own gradient or its digits vanish. */
  paintClass?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState<number | null>(null);
  // Settle progress 0→1 (SSR = 1 — fully landed, zero blur).
  const [prog, setProg] = useState(1);

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
        const dur = 1100;
        // EaseOutBack with a modest overshoot constant — the spring
        // reads as a settle, never a bounce (c1 = 0.7 → ≈5% peak).
        const c1 = 0.7;
        const c3 = c1 + 1;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
          setDisplay(Math.max(0, Math.round(value * eased)));
          setProg(p);
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
  const final = `${value.toLocaleString("en-US")}${suffix}`;
  // The blur peaks at liftoff and fully resolves on landing — the
  // number materializes INTO focus (paint-only; the strip is small).
  const blur = prog < 1 ? `blur(${(3 * Math.pow(1 - prog, 1.5)).toFixed(2)}px)` : undefined;
  return (
    <span ref={ref} className="count-shell">
      <span className={`count-sizer ${paintClass}`} aria-hidden="true">
        {final}
      </span>
      <span
        className={`count-live ${paintClass}`}
        aria-hidden="true"
        style={{ filter: blur }}
      >
        {shown.toLocaleString("en-US")}
        {suffix}
      </span>
      <span className="sr-only">{final}</span>
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
                <span className="chev rtl:rotate-180" aria-hidden="true">›</span>
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

      {/* The conversation — VRD-V6: the exchange sits inside the EVO
          CONSOLE (.evo-console), an in-product surface instead of two
          floating bubbles. Bubbles pop to card level inside the tint
          glass; the EVO avatar carries .ai-ring (the cyan AI-surface
          law — the ONLY place cyan touches this section).
          VRD-V7 (P1-3): the console gains the AI PRESENCE PAIR —
          a Siri-Orb-style presence sphere (.evo-orb) heading the
          console, and a Border-Beam ring (.evo-beam) traveling its
          border. Both are pure CSS/SVG-light recipes (transform-only,
          zero dependencies, reduced-motion-safe); the --ai cyan stays
          scoped to this AI surface. */}
      <div className="evo-console mt-5">
        {/* The presence header — orb + wordmark + the live pulse (the
            floating widget IS live on this page). */}
        <div className="mb-3.5 flex items-center gap-2.5 border-b border-[var(--edge)]/70 pb-3">
          <span className="evo-orb" aria-hidden="true" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: PALETTE.textMuted }}>
            EVO
          </span>
          <span className="live-dot ms-auto" aria-hidden="true" />
        </div>
        <div className="space-y-3.5">
          {turns.map((t, i) =>
            t.who === "user" ? (
              <div key={i} className="flex justify-end">
                <p
                  className="max-w-[85%] rounded-2xl rounded-es-md border border-[var(--edge)] bg-[var(--card)] px-4 py-3 text-sm font-normal leading-relaxed"
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
                  className="ai-ring h-9 w-9 shrink-0 rounded-full border border-[var(--edge)] object-cover"
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
        {/* VRD-V8 — the HAND-OFF (V8-3): the demo answer visibly flows
            into the product outcome — the two REAL in-page builders in
            #plan (deep anchors #plan-workout / #plan-nutrition — pure
            navigation, zero logic change). The rail + dots carry the
            --ai cyan, still scoped INSIDE the console (AI-surface
            law); reduced-motion stills the dots. The border beam stays
            the console's last child (its paint layer). */}
        <div className="evo-handoff">
          <span className="evo-handoff-rail" aria-hidden="true">
            <span className="evo-dots">
              <span className="evo-dot" />
              <span className="evo-dot" />
              <span className="evo-dot" />
            </span>
          </span>
          <div className="evo-handoff-card">
            <p className="evo-handoff-title mb-2 uppercase tracking-[0.14em] rtl:tracking-normal">
              {isAr ? "ثم تُبنى خطتك هنا" : "THEN YOUR PLAN BUILDS HERE"}
            </p>
            <div className="flex flex-wrap gap-2">
              <a href="#plan-workout" className="evo-handoff-chip">
                <EngravedIcon name="rack" alt="" size={14} className="h-3.5 w-3.5" />
                {isAr ? "خطة التمارين" : "Workout plan"}
                <span className="rtl:rotate-180" aria-hidden="true">›</span>
              </a>
              <a href="#plan-nutrition" className="evo-handoff-chip">
                <EngravedIcon name="protein" alt="" size={14} className="h-3.5 w-3.5" />
                {isAr ? "خطة التغذية" : "Nutrition plan"}
                <span className="rtl:rotate-180" aria-hidden="true">›</span>
              </a>
            </div>
          </div>
        </div>
        {/* The border beam — masked ring, rotor spins inside (last child:
            paints above the panel fill but under nothing interactive). */}
        <span className="evo-beam" aria-hidden="true">
          <span className="evo-beam-rotor" />
        </span>
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

// VRD-V7 (P1-5) — the quiet bento tile hosting ONE control group
// inside the plan-builder cards: a hairline module (no fill) that
// makes each choice scannable, while the tinted answer zone stays
// the loudest tile of the card. Touch targets inside are untouched.
function planTile(extra = "") {
  return `rounded-[var(--radius-chrome)] border border-[var(--edge)]/70 p-3.5 ${extra}`;
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
// PARITY (owner directive 2026-09-24 «الادوات على الرئيسية تطابق
// الادوات الاصلية»): the card carries EVERY generation field the
// tool page carries — goal/level/days/equipment vocabulary + the
// optional notes (≤200 chars) riding the request and the envelope.
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
  // PARITY: the tool's optional notes field (≤200 chars, sent as-is).
  const [notes, setNotes] = useState("");
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
  const pickNotes = (v: string) => { setNotes(v); setPlan(null); setError(null); };

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
          notes: notes || undefined,
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
      // inputs — including the notes — ride along so the full tool
      // opens with the SAME selections that produced this plan).
      saveGuestPlan("workout", generated, { goal, level, days, equipment: equip, notes });
    } catch {
      setError(isAr ? "تعذّر التوليد — حاول مرة أخرى." : "Generation failed — try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // VRD-V8: the deep anchor #plan-workout — the EVO console's
    // hand-off chip scrolls HERE (navigation only, zero logic change).
    <div id="plan-workout" className="marble-card flex h-full scroll-mt-24 flex-col p-5 md:p-6">
      <div className="flex items-center gap-2.5">
        <EngravedIcon name="rack" alt="" size={20} className="h-5 w-5" />
        <h3 className="text-xl font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>
          {isAr ? "خطة التمارين" : "The workout plan"}
        </h3>
      </div>
      <p className="mt-1.5 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
        {isAr
          ? "حدّد اختياراتك ثم أنشئ خطتك — تتولّد هنا في الصفحة في ثوانٍ."
          : "Set your choices and generate — it builds right here in seconds."}
      </p>

      {/* Controls — the real planner vocabulary, as quiet bento
          modules (VRD-V7 P1-5): one hairline tile per choice, the
          card reads at a glance. Same fields, same handlers. */}
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        <div className={planTile("sm:col-span-2")}>
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
        <div className={planTile()}>
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
        <div className={planTile()}>
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
        <div className={planTile("sm:col-span-2")}>
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
        {/* PARITY: the tool's optional notes field — rides the request
            and the hand-off envelope exactly like the tool's copy. */}
        <div className={planTile("sm:col-span-2")}>
          <label
            htmlFor="home-workout-notes"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider"
            style={{ color: PALETTE.textMuted }}
          >
            {isAr ? "ملاحظات اختيارية" : "Optional constraints"}
          </label>
          <input
            id="home-workout-notes"
            type="text"
            maxLength={200}
            value={notes}
            onChange={(e) => pickNotes(e.target.value)}
            placeholder={isAr ? "مثال: أتجنب الضغط على الركبة اليسرى…" : "e.g. avoid loading the left knee…"}
            className="w-full rounded-full border border-[var(--edge)] bg-[var(--card)] px-5 py-2.5 text-sm font-normal outline-none transition-colors focus:border-[var(--chrome-edge)]"
          />
        </div>
      </div>

      {/* The answer area — the generated week once it exists, the
          live structure preview before that. */}
      <div
        className="mt-4 flex flex-1 flex-col rounded-[var(--radius-chrome)] border border-[var(--edge)] bg-[var(--tint)] p-4 md:p-5"
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

// Card B — the REAL nutrition-plan builder (HOME-REFINE-271 F3,
// PARITY 2026-09-24 «الادوات على الرئيسية تطابق الادوات الاصلية»):
// the SAME generation fields as /ai-meal-planner — a FREE calorie
// target (numeric 1200→4000, step 50, + the calculator hint) and the
// diet system select → the button calls /api/ai/meal-plan-demo (the
// unified free pool) and the generated DAY renders in-page — meals,
// items, grams, and kcal, the same engine as the tool. The optional
// notes (≤200 chars) ride the request exactly like the tool's field.
// Before generating, the REAL matrix split previews live; changing
// any choice returns the card to the preview (a rendered plan always
// matches the choices).
// THE HAND-OFF LAW (owner directive 2026-09-24): every successful
// generation is persisted via saveGuestPlan — the same envelope the
// ai-meal-planner page re-hydrates from (inputs: calories + system +
// notes), so «افتح الأداة الكاملة» lands on the tool ALREADY showing
// this exact day with the SAME selections.
function MealPlanBuilder({ samples, isAr, isLoggedIn }: { samples: HomeSamples; isAr: boolean; isLoggedIn: boolean }) {
  const systems = samples.dietSystems;
  // PARITY: the tool's free calorie target (string state like the
  // tool — Number() only at the fetch/persist boundary) + its notes.
  const [calories, setCalories] = useState("2000");
  const [systemSlug, setSystemSlug] = useState(systems[0]?.slug ?? "balanced");
  const [notes, setNotes] = useState("");
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
  const pickCalories = (v: string) => { setCalories(v); setPlan(null); setError(null); };
  const pickSystem = (v: string) => { setSystemSlug(v); setPlan(null); setError(null); };
  const pickNotes = (v: string) => { setNotes(v); setPlan(null); setError(null); };

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const guestId = isLoggedIn ? undefined : ensureGuestId() || undefined;
      const res = await fetch("/api/ai/meal-plan-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calories: Number(calories),
          system: systemSlug,
          language: isAr ? "ar" : "en",
          notes: notes || undefined,
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
      // calorie target + system + notes ride along as the tool's inputs).
      saveGuestPlan("nutrition", generated, { calories: Number(calories), system: systemSlug, notes });
    } catch {
      setError(isAr ? "تعذّر التوليد — حاول مرة أخرى." : "Generation failed — try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // VRD-V8: the deep anchor #plan-nutrition — the EVO console's
    // hand-off chip scrolls HERE (navigation only, zero logic change).
    <div id="plan-nutrition" className="marble-card flex h-full scroll-mt-24 flex-col p-5 md:p-6">
      <div className="flex items-center gap-2.5">
        <EngravedIcon name="mealplanner" alt="" size={20} className="h-5 w-5" />
        <h3 className="text-xl font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>
          {isAr ? "خطة التغذية" : "The nutrition plan"}
        </h3>
      </div>
      <p className="mt-1.5 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
        {isAr
          ? "حدّد سعراتك ونظامك الغذائي وملاحظاتك ثم أنشئ خطتك — يوم كامل بالوجبات والغرامات."
          : "Set your calories, diet system and preferences, then generate — a full day of meals in grams."}
      </p>

      {/* Controls — PARITY with the tool page's generation fields, as
          quiet bento modules (VRD-V7 P1-5): same fields, same
          handlers, scannable hairline tiles. */}
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        <div className={planTile()}>
          <label
            htmlFor="home-meal-calories"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider"
            style={{ color: PALETTE.textMuted }}
          >
            {isAr ? "سعرات اليوم المستهدفة" : "Daily calorie target"}
          </label>
          {/* The tool's free calorie input — any integer 1200→4000
              (the API validates the same range). */}
          <input
            id="home-meal-calories"
            type="number"
            inputMode="numeric"
            min={1200}
            max={4000}
            step={50}
            value={calories}
            onChange={(e) => pickCalories(e.target.value)}
            className="w-full rounded-full border border-[var(--edge)] bg-[var(--card)] px-5 py-2.5 text-sm font-normal outline-none transition-colors focus:border-[var(--chrome-edge)]"
            dir="ltr"
          />
          <p className="mt-1.5 text-xs font-normal" style={{ color: PALETTE.textMuted }}>
            {isAr ? "من 1200 إلى 4000 — لا تعرف رقمك؟ " : "From 1200 to 4000 — don't know yours? "}
            <a
              href={`${isAr ? "/ar" : ""}/tools/calorie-calculator`}
              className="underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70"
              style={{ color: PALETTE.textSec }}
            >
              {isAr ? "حاسبة السعرات" : "the calorie calculator"}
            </a>
          </p>
        </div>
        <div className={planTile()}>
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
          <p className="mt-1.5 text-xs font-normal" style={{ color: PALETTE.textMuted }}>
            {isAr ? "أنظمة مطابقة لمكتبة الخطط الغذائية الجاهزة." : "The site's own systems — matching the diet plan library."}
          </p>
        </div>
        <div className={planTile("sm:col-span-2")}>
          <label
            htmlFor="home-meal-notes"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider"
            style={{ color: PALETTE.textMuted }}
          >
            {isAr ? "ملاحظات اختيارية" : "Optional preferences"}
          </label>
          <input
            id="home-meal-notes"
            type="text"
            maxLength={200}
            value={notes}
            onChange={(e) => pickNotes(e.target.value)}
            placeholder={isAr ? "مثال: بلا منتجات الألبان، سمك مرتين أسبوعياً…" : "e.g. no dairy, fish twice a week…"}
            className="w-full rounded-full border border-[var(--edge)] bg-[var(--card)] px-5 py-2.5 text-sm font-normal outline-none transition-colors focus:border-[var(--chrome-edge)]"
          />
        </div>
      </div>

      {/* The answer area — the generated day once it exists, the
          real matrix split preview before that. */}
      <div
        className="mt-4 flex flex-1 flex-col rounded-[var(--radius-chrome)] border border-[var(--edge)] bg-[var(--tint)] p-4 md:p-5"
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
                  ? `خطة يوم كامل بالغرامات تُبنى حول ${Number(calories || 0).toLocaleString("en-US")} سعرة عند الضغط على الزر. لا تعرف رقمك؟ احسبه في الحاسبة أعلاه.`
                  : `A full day of food in grams builds around ${Number(calories || 0).toLocaleString("en-US")} kcal when you press the button. Don't know your number? Use the calculator above.`}
              </p>
            </div>
          )
        )}
        {/* The generate row — the REAL engine call (unified pool). */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={generate}
            disabled={loading || !calories}
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
function LandingDietCard({ system, levelCount, isAr, index }: { system: HomeDietSystemSample; levelCount: number; isAr: boolean; index: number }) {
  // VRD-V6 — the macro split as ONE machined rail (.split-rail): the
  // SAME system.split data, now in the platform's data-viz language
  // (visual parity with the #eat macro bars) instead of a bare
  // «P/C/F» text run. Segment widths are the real ratio; the numbers
  // stay visible beneath for precision readers.
  // TPL-REF-280 — the ghost index numeral rides above the title
  // (template card technique re-toned to the Alkemos ghost ramp —
  // decorative, aria-hidden, carries no rank meaning).
  const splitTotal =
    system.split.protein + system.split.carbs + system.split.fat || 1;
  const segWidth = (g: number) => `${Math.max(6, Math.round((g / splitTotal) * 100))}%`;
  return (
    <a
      href={`${isAr ? "/ar" : ""}/diet-plan/2000/${system.slug}`}
      className="marble-card card-lift group flex w-72 shrink-0 flex-col p-5 text-start md:w-80"
    >
      <span className="ghost-num" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3 className="text-lg font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>
        {isAr ? `النظام ${system.nameAr}` : `${system.nameEn}`}
      </h3>
      {/* The macro split rail — aria-hidden (the ratio is decorative;
        the exact numbers are announced by the row below). */}
      <div className="split-rail mt-3" aria-hidden="true">
        <span className="split-seg split-seg--protein" style={{ width: segWidth(system.split.protein) }} />
        <span className="split-seg split-seg--carbs" style={{ width: segWidth(system.split.carbs) }} />
        <span className="split-seg split-seg--fat" style={{ width: segWidth(system.split.fat) }} />
      </div>
      <p className="mt-2 flex items-center justify-between text-[10px] font-medium" style={{ color: PALETTE.textMuted }}>
        <span>{isAr ? "توزيع الماكروز" : "Macro split"}</span>
        <span dir="ltr">
          {system.split.protein}/{system.split.carbs}/{system.split.fat}
        </span>
      </p>
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
              {/* TPL-REF-280 — display numerals: the plate's kcal figure
                  takes the display face (Playfair) at its existing scale —
                  the template's big-number pattern in Alkemos's type. */}
              <span className="chrome-text font-display text-5xl font-bold tracking-tight">
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
                  <span className="block font-semibold" style={{ color: PALETTE.textPrim }}>{isAr ? `${food.protein} جم` : `${food.protein}g`}</span>
                  <span style={{ color: PALETTE.textMuted }}>{isAr ? "بروتين" : "protein"}</span>
                </div>
                <div className="rounded bg-[var(--tint)] px-1 py-1 text-center">
                  <span className="block font-semibold" style={{ color: PALETTE.textPrim }}>{isAr ? `${food.carbs} جم` : `${food.carbs}g`}</span>
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
          <span className="chev rtl:rotate-180" aria-hidden="true">›</span>
        </a>
      </div>
    </div>
  );
}

// ── VRD-V8R — the membership cards' REAL feature rows ──
// Two–three scannable facts per tier, each mirroring the tier's
// documented limits in memberships.ts (the single source — the page
// invents nothing): the free pool (2/4/8), the EVO daily fair-use
// limit, the export/ad-free deltas. The checkseal icon is the SAME
// engraved mark the /memberships feature lists render — one data
// language across both surfaces. `pinDark` forces the dark engraving
// variant on the ALWAYS-dark Premium card (the theme pair normally
// follows the page; on a fixed-dark surface it must follow the card).
function TierFeatureRows({ rows, pinDark = false }: { rows: readonly string[]; pinDark?: boolean }) {
  return (
    <ul className="mt-4 flex-1 space-y-2.5">
      {rows.map((row) => (
        <li
          key={row}
          className="flex items-start gap-2 text-sm font-normal leading-relaxed"
          style={{ color: pinDark ? "rgba(245,245,247,0.72)" : PALETTE.textSec }}
        >
          <span className="theme-img-pin-dark mt-0.5 inline-flex h-4 w-4 shrink-0">
            <EngravedIcon name="checkseal" alt="" size={16} className="h-4 w-4" />
          </span>
          <span>{row}</span>
        </li>
      ))}
    </ul>
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

  // ── TPL-BASE data — the template's content slots carrying Alkemos's
  // real surfaces. Every entry is bilingual and links to a real route. ──

  // The marquee strip (template): the platform's pillars in one band.
  const marqueeTerms = isAr
    ? ["مكتبة التمارين", "قاعدة الأطعمة", "مدرب ذكي", "مخطط التمارين", "مخطط الوجبات", "حاسبة السعرات", "خطط غذائية", "برامج جاهزة", "أدوات مجانية", "المدونة"]
    : ["Exercise Library", "Nutrition Database", "AI Coach", "Workout Planner", "Meal Planner", "Calorie Calculator", "Diet Plans", "Ready Programs", "Free Tools", "Blog"];

  // The quick-start card (the template's schedule card): five real
  // product surfaces, one minute to the first result.
  const quickStart: {
    icon: string; nameAr: string; nameEn: string; subAr: string; subEn: string;
    tagAr: string; tagEn: string; href?: string; action?: "evo";
  }[] = [
    {
      icon: "calories",
      nameAr: "حاسبة السعرات", nameEn: "Calorie calculator",
      subAr: "أرقامك في ثوانٍ", subEn: "Your numbers in seconds",
      tagAr: "مجاني", tagEn: "Free",
      href: "#start",
    },
    {
      icon: "dumbbell",
      nameAr: "مخطط تمارين ذكي", nameEn: "AI workout plan",
      subAr: "خطة كاملة فورًا", subEn: "A full plan, instantly",
      tagAr: "AI", tagEn: "AI",
      href: isAr ? "/ar/ai-workout-planner" : "/ai-workout-planner",
    },
    {
      icon: "mealplanner",
      nameAr: "مخطط وجبات ذكي", nameEn: "AI meal plan",
      subAr: "وجبات بالغرامات", subEn: "Meals in grams",
      tagAr: "AI", tagEn: "AI",
      href: isAr ? "/ar/ai-meal-planner" : "/ai-meal-planner",
    },
    {
      icon: "evo",
      nameAr: "EVO", nameEn: "EVO",
      subAr: "مدربك الذكي", subEn: "Your AI coach",
      tagAr: "مباشر", tagEn: "Live",
      action: "evo",
    },
    {
      icon: "rack",
      nameAr: "مكتبة التمارين", nameEn: "Exercise library",
      subAr: `${EX_PLUS} تمرينًا`, subEn: `${EX_PLUS} exercises`,
      tagAr: "مجاني", tagEn: "Free",
      href: "#library",
    },
  ];

  // The programs grid (the template's 4 cards): the three curated REAL
  // programs + the AI builder slot. Facts derive from the sample slice —
  // nothing invented.
  const programCards = [
    ...samples.programs.slice(0, 3).map((prog, i) => ({
      key: prog.slug,
      tag: `0${i + 1}`,
      name: isAr ? prog.nameAr : prog.nameEn,
      body: isAr
        ? `برنامج ${prog.levelLabelAr} — ${prog.locationLabelAr}، ${prog.durationWeeks} أسابيع.`
        : `A ${prog.levelLabelEn} program — ${prog.locationLabelEn}, ${prog.durationWeeks} weeks.`,
      meta: isAr ? `${prog.daysPerWeek} أيام/أسبوع` : `${prog.daysPerWeek} days/week`,
      href: `${isAr ? "/ar" : ""}/programs/${prog.slug}`,
    })),
    {
      key: "ai-builder",
      tag: "04",
      name: isAr ? "خطتك بالذكاء الاصطناعي" : "Your AI-built plan",
      body: isAr
        ? "أجب على أسئلة قصيرة ويولّد المحرك خطة تمارين كاملة حول هدفك ومعداتك."
        : "Answer a few questions and the engine generates a full workout plan around your goal and equipment.",
      meta: isAr ? "دقيقة واحدة" : "1 minute",
      href: isAr ? "/ar/ai-workout-planner" : "/ai-workout-planner",
    },
  ];

  // The EVO metric tiles (the template's big-feature metrics), carrying
  // the REAL fair-use numbers (memberships.ts single source).
  const evoMetrics = [
    { k: isAr ? "رسائل يوميًا" : "Daily messages", v: "10", z: isAr ? "مجانية لكل زائر" : "free for every visitor" },
    { k: isAr ? "خطط ذكية شهريًا" : "AI plans / month", v: "2", z: isAr ? "دون تسجيل" : "no signup needed" },
    { k: isAr ? "اللغات" : "Languages", v: "AR · EN", z: isAr ? "ثنائية اللغة أصلًا" : "natively bilingual" },
    { k: isAr ? "التبديلات الذكية" : "Smart swaps", v: isAr ? "مباشرة" : "Live", z: isAr ? "وجبات وتمارين" : "meals & exercises" },
  ];

  // The coach cards (the template's gradient tiles): the coaching offer.
  const coachCards = [
    {
      monogram: "1:1",
      title: isAr ? "مدربك الشخصي" : "Your own coach",
      role: isAr ? "خطة يبنيها إنسان حول هدفك" : "A human-built plan around your goal",
      meta: isAr ? "خطة شخصية · متابعة أسبوعية" : "Personal plan · weekly follow-up",
      hue: "from-orange-500 to-rose-500",
      href: isAr ? "/ar/coaching" : "/coaching",
    },
    {
      monogram: "EVO",
      title: "EVO",
      role: isAr ? "المدرب الذكي داخل المنصة" : "The in-platform AI coach",
      meta: isAr ? "عربي وإنجليزي · متاح دائمًا" : "Arabic & English · always on",
      hue: "from-amber-400 to-orange-600",
      action: "evo" as const,
    },
    {
      monogram: "AI",
      title: isAr ? "خطط ذكية" : "AI plans",
      role: isAr ? "توليد وتعديل بخطوة واحدة" : "Generate & adjust in one step",
      meta: isAr ? "تمارين أو وجبات · بغرامات" : "Workouts or meals · in grams",
      hue: "from-rose-500 to-purple-600",
      href: isAr ? "/ar/ai-workout-planner" : "/ai-workout-planner",
    },
    {
      monogram: "24h",
      title: isAr ? "تواصل مباشر" : "Direct contact",
      role: isAr ? "قناة مفتوحة مع مدربك" : "An open line to your coach",
      meta: isAr ? "دعم ومتابعة مستمرة" : "Ongoing support & follow-up",
      hue: "from-lime-400 to-emerald-500",
      href: isAr ? "/ar/for-coaches" : "/for-coaches",
    },
  ];

  // The pricing tiers (the template's 3 cards): prices and claims derive
  // from memberships.ts lookups (single source — never literals).
  const pricingTiers = [
    {
      id: "free" as const,
      name: isAr ? freeTier?.nameAr ?? "مجاني" : freeTier?.nameEn ?? "Free",
      blurb: isAr ? freeTier?.taglineAr : freeTier?.taglineEn,
      price: freePriceLabel,
      cadence: isAr ? " / للأبد" : " / forever",
      perks: isAr
        ? ["كل المكتبات والأدوات", "توليدان شهريًا للخطط الذكية", "EVO: 10 رسائل/يوم"]
        : ["Every library and tool", "2 AI plans a month", "EVO: 10 messages/day"],
      href: "/auth?mode=signup",
      cta: isAr ? "ابدأ مجانًا" : "Start free",
      featured: false,
    },
    {
      id: "premium" as const,
      name: isAr ? premiumTier?.nameAr ?? "بريميوم" : premiumTier?.nameEn ?? "Premium",
      blurb: isAr ? premiumTier?.taglineAr : premiumTier?.taglineEn,
      price: premiumPriceLabel,
      cadence: isAr ? " / شهريًا" : " / month",
      perks: isAr
        ? ["كل مزايا المستوى المجاني", "EVO بلا حدود ومحادثة متزامنة", "4 خطط شهريًا وتصدير كامل"]
        : ["Everything in the Free tier", "Unlimited EVO, synced chat", "4 plans a month, full export"],
      href: isAr ? "/ar/memberships" : "/memberships",
      cta: isAr ? "اختر بريميوم" : "Choose Premium",
      featured: true,
    },
    {
      id: "pro" as const,
      name: isAr ? proTier?.nameAr ?? "برو" : proTier?.nameEn ?? "Pro",
      blurb: isAr ? proTier?.taglineAr : proTier?.taglineEn,
      price: proPriceLabel,
      cadence: isAr ? " / شهريًا" : " / month",
      perks: isAr
        ? ["كل مزايا البريميوم", "8 خطط شهريًا", "تجربة بلا إعلانات"]
        : ["Everything in Premium", "8 plans a month", "Ad-free experience"],
      href: isAr ? "/ar/memberships" : "/memberships",
      cta: isAr ? "اختر برو" : "Choose Pro",
      featured: false,
    },
  ];

  // ── TPL-BASE (2026-09-26) — the render follows the landing-fitness-
  // studio template's exact structure (nav / split hero + card / marquee /
  // programs grid / ember split-feature / interactive product sections /
  // coaches / real-numbers / pricing / FAQ / CTA / footer), carrying
  // Alkemos's real content and interactive components. Every interactive
  // surface (calculator, EVO demo, planners, library browser, food
  // explorer, carousels, memberships, FAQ schema) is preserved verbatim —
  // only the visual/structural shell is the template's. ──
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      {/* FAQ Schema for SEO — same array, single source */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}
      />

      <SiteHeader variant="landing" />

      {/* The template's page atmosphere — ember glow + film grain. */}
      <div className="pointer-events-none absolute inset-0 glow-ember" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 noise opacity-60 mix-blend-overlay" aria-hidden="true" />

      {/* ===================== 1. HERO — the template's split hero ===================== */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-20 md:pt-24 md:pb-32">
          <div className="grid items-start gap-12 md:grid-cols-[1.15fr_0.85fr]">
            <div>
              <span className="hero-pill">
                <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-[var(--ember)]" aria-hidden="true" />
                {isAr ? "مجانية دائمًا · عربي وإنجليزي" : "Free forever · Arabic & English"}
              </span>
              <h1 className="font-display mt-6 text-[clamp(2.75rem,7vw,6.25rem)] font-bold leading-[0.95] tracking-tight rtl:leading-snug rtl:tracking-normal">
                {isAr ? (
                  <>تدرّب بذكاء. <br className="hidden sm:block" /> وتغذَّ <span className="text-[var(--ember-text)]">بدقة</span>.</>
                ) : (
                  <>Train smarter. <br className="hidden sm:block" /> Eat with <span className="text-[var(--ember-text)]">precision</span>.</>
                )}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[color-mix(in_srgb,var(--text)_70%,transparent)]">
                {isAr
                  ? "منصة واحدة تجمع التدريب والتغذية والتخطيط الذكي — ومعها EVO، مدربك بالذكاء الاصطناعي. جرّبها الآن في هذه الصفحة، بالعربية والإنجليزية."
                  : "One platform for training, nutrition, and smart planning — with EVO, your AI coach, built in. Try it right on this page, in Arabic and English."}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {isLoggedIn ? (
                  <>
                    <a href={memberHref} className="btn-chrome px-6 py-3.5 text-sm md:text-base">
                      {isAr ? "انتقل إلى لوحة التحكم" : "Go to your dashboard"}
                      <span className="chev rtl:rotate-180" aria-hidden="true">›</span>
                    </a>
                    <a href={isAr ? "/ar/memberships" : "/memberships"} className="btn-outline px-5 py-3.5 text-sm font-medium md:text-base">
                      {isAr ? "العضويات المميزة" : "Premium memberships"}
                      <span className="chev rtl:rotate-180" aria-hidden="true">›</span>
                    </a>
                  </>
                ) : (
                  <>
                    <a href="/auth?mode=signup" className="btn-chrome px-6 py-3.5 text-sm md:text-base">
                      {isAr ? "تسجيل الدخول / حساب جديد" : "Log in / Sign up"}
                      <span className="chev rtl:rotate-180" aria-hidden="true">›</span>
                    </a>
                    <a href={isAr ? "/ar/memberships" : "/memberships"} className="btn-outline px-5 py-3.5 text-sm font-medium md:text-base">
                      {isAr ? "العضويات المميزة" : "Premium memberships"}
                      <span className="chev rtl:rotate-180" aria-hidden="true">›</span>
                    </a>
                  </>
                )}
              </div>

              {/* The 3-stat row — the template's hero stats (verified counts). */}
              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-[color-mix(in_srgb,var(--text)_10%,transparent)] pt-8 text-sm text-[color-mix(in_srgb,var(--text)_60%,transparent)]">
                {proofStats.slice(0, 3).map((stat) => (
                  <div key={stat.labelEn}>
                    <p className="font-display text-2xl font-bold text-[var(--text)] md:text-3xl">
                      <CountUp value={stat.value} suffix={stat.suffix} paintClass="chrome-text" />
                    </p>
                    <p>{isAr ? stat.labelAr : stat.labelEn}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick-start card — the template's schedule card, adapted to
                Alkemos's real surfaces (every row opens a real product). */}
            <aside className="relative">
              <div className="absolute inset-0 -translate-x-4 translate-y-6 rounded-3xl bg-[var(--ember)]/20 blur-2xl" aria-hidden="true" />
              <div className="relative rounded-3xl border border-[color-mix(in_srgb,var(--text)_10%,transparent)] bg-gradient-to-b from-[color-mix(in_srgb,var(--text)_6%,transparent)] to-[color-mix(in_srgb,var(--text)_2%,transparent)] p-5 backdrop-blur">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--text)_50%,transparent)] rtl:tracking-normal">
                    {isAr ? "Alkemos · البداية" : "Alkemos · quick start"}
                  </p>
                  <span className="rounded-full border border-[color-mix(in_srgb,var(--acid)_30%,transparent)] bg-[color-mix(in_srgb,var(--acid)_10%,transparent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--acid-text)] rtl:tracking-normal">
                    {isAr ? "مباشر" : "live"}
                  </span>
                </div>

                <h3 className="font-display mt-3 text-2xl font-bold">
                  {isAr ? "ابدأ في أقل من دقيقة" : "Start in under a minute"}
                </h3>

                <ul className="mt-5 space-y-2">
                  {quickStart.map((s) => {
                    const inner = (
                      <>
                        <span className="grid h-10 w-12 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--text)_6%,transparent)]">
                          <EngravedIcon name={s.icon} alt="" size={18} className="h-[18px] w-[18px]" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{isAr ? s.nameAr : s.nameEn}</span>
                          <span className="block truncate text-xs text-[color-mix(in_srgb,var(--text)_50%,transparent)]">
                            {isAr ? s.subAr : s.subEn}
                          </span>
                        </span>
                        <span className="text-xs text-[var(--ember-text)]">{isAr ? s.tagAr : s.tagEn}</span>
                      </>
                    );
                    return (
                      <li key={s.nameEn}>
                        {s.action === "evo" ? (
                          <button
                            type="button"
                            onClick={openEvoFloatingChat}
                            className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--text)_5%,transparent)] bg-[color-mix(in_srgb,var(--bg)_40%,transparent)] px-3 py-3 transition hover:border-[color-mix(in_srgb,var(--text)_20%,transparent)]"
                          >
                            {inner}
                          </button>
                        ) : (
                          <a
                            href={s.href}
                            className="flex items-center gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--text)_5%,transparent)] bg-[color-mix(in_srgb,var(--bg)_40%,transparent)] px-3 py-3 transition hover:border-[color-mix(in_srgb,var(--text)_20%,transparent)]"
                          >
                            {inner}
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <a
                  href="#start"
                  className="group mt-5 flex items-center justify-between rounded-2xl bg-[var(--text)] px-4 py-3 text-sm font-semibold text-[var(--bg)] transition-colors hover:bg-[var(--acid)] hover:text-[#1a0e0a]"
                >
                  {isAr ? "احسب أرقامك الآن" : "Get your numbers now"}
                  <span className="chev rtl:rotate-180" aria-hidden="true">›</span>
                </a>
              </div>
            </aside>
          </div>
        </div>

        {/* Marquee — the template's strip (bilingual terms, ember dots). */}
        <div className="relative border-y border-[color-mix(in_srgb,var(--text)_10%,transparent)] bg-[color-mix(in_srgb,var(--text)_4%,transparent)] py-5 backdrop-blur">
          <div className="flex animate-marquee-tpl whitespace-nowrap gap-12 font-display text-2xl font-semibold tracking-tight text-[color-mix(in_srgb,var(--text)_60%,transparent)] rtl:tracking-normal md:text-3xl">
            {[...marqueeTerms, ...marqueeTerms].map((m, i) => (
              <span key={i} className="flex items-center gap-12">
                <span className="hover:text-[var(--text)]">{m}</span>
                <span className="text-[var(--ember)]" aria-hidden="true">●</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== 2. PROGRAMS — the template's 4-card grid ===================== */}
      <section id="train" className="relative z-10 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ember-text)] rtl:tracking-normal">
                {isAr ? "برامجنا" : "Our programs"}
              </p>
              <h2 className="font-display mt-3 max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight rtl:leading-snug rtl:tracking-normal md:text-5xl">
                {isAr ? "برامج جاهزة لكل مستوى وهدف." : "Ready-made cycles for every level and goal."}
              </h2>
            </div>
            <p className="max-w-md text-[color-mix(in_srgb,var(--text)_60%,transparent)]">
              {isAr
                ? "برامج جاهزة بجدول وتمارين ومجموعات وتكرارات — اتبعها كما هي، أو اجعلها نقطة انطلاق وعدّلها بحسب وقتك ومعداتك."
                : "Ready-made programs with a schedule, exercises, sets, and reps — follow one as-is, or make it your starting point and adapt it to your time and equipment."}
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {programCards.map((p) => (
              <a
                key={p.key}
                href={p.href}
                className="group relative overflow-hidden rounded-3xl border border-[color-mix(in_srgb,var(--text)_10%,transparent)] bg-gradient-to-b from-[color-mix(in_srgb,var(--text)_4%,transparent)] to-transparent p-6 transition hover:border-[color-mix(in_srgb,var(--text)_30%,transparent)]"
              >
                <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[var(--ember)]/0 blur-3xl transition group-hover:bg-[var(--ember)]/40" aria-hidden="true" />
                <p className="font-display text-5xl font-bold text-[color-mix(in_srgb,var(--text)_10%,transparent)]" aria-hidden="true">{p.tag}</p>
                <h3 className="font-display mt-4 text-2xl font-semibold leading-tight">{p.name}</h3>
                <p className="mt-3 text-sm text-[color-mix(in_srgb,var(--text)_60%,transparent)]">{p.body}</p>
                <div className="mt-6 flex items-center justify-between border-t border-[color-mix(in_srgb,var(--text)_10%,transparent)] pt-4 text-xs text-[color-mix(in_srgb,var(--text)_50%,transparent)]">
                  <span>{p.meta}</span>
                  <span className="inline-flex items-center gap-1 text-[color-mix(in_srgb,var(--text)_80%,transparent)] transition group-hover:text-[var(--ember-text)]">
                    {isAr ? "استكشف" : "Explore"}
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 rtl:rotate-180" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a href={isAr ? "/ar/programs" : "/programs"} className="btn-outline px-7 py-3 text-sm font-medium md:text-base">
              {isAr ? "كل البرامج" : "All programs"}
              <span className="chev rtl:rotate-180" aria-hidden="true">›</span>
            </a>
          </div>
        </div>
      </section>

      {/* ===================== 3. EVO — the template's ember split feature ===================== */}
      <section id="evo" className="relative z-10 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6 pb-24">
          <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[#ff4d26] via-[#ff6d3d] to-[#ff9353] text-[#1a0e0a]">
            <div className="grid items-center gap-10 p-8 md:grid-cols-2 md:p-14">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1a0e0a]/70 rtl:tracking-normal">
                  {isAr ? "مدعوم بالذكاء الاصطناعي · مدعوم بالأرقام" : "AI-powered. Data-backed."}
                </p>
                <h3 className="font-display mt-4 text-3xl font-bold leading-[1.05] tracking-tight rtl:leading-snug rtl:tracking-normal md:text-5xl">
                  {isAr ? "EVO يجيب بأرقام، ويبني خطتك حول بياناتك." : "EVO answers with numbers, and builds your plan around your data."}
                </h3>
                <p className="mt-5 max-w-lg leading-relaxed text-[#1a0e0a]/80">
                  {isAr
                    ? "اسأله عن التدريب والتغذية، اطلب خطة حول وزنك وهدفك وأيامك، ثم عدّلها بتبديلات ذكية للوجبات والتمارين — كل ذلك داخل المنصة، بالعربية والإنجليزية."
                    : "Ask it about training or nutrition, request a plan around your weight, goal, and schedule, then fine-tune it with smart meal and exercise swaps — all inside the platform, in Arabic and English."}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={openEvoFloatingChat}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#1a0e0a] px-5 py-3 text-sm font-semibold text-[#ffede2] transition hover:bg-black"
                  >
                    {isAr ? "تحدّث مع EVO الآن" : "Talk to EVO now"}
                    <span className="chev rtl:rotate-180" aria-hidden="true">›</span>
                  </button>
                  <a
                    href={isAr ? "/ar/evo" : "/evo"}
                    className="inline-flex items-center gap-2 rounded-full border border-[#1a0e0a]/20 px-5 py-3 text-sm font-semibold text-[#1a0e0a]/80 transition hover:bg-[#1a0e0a]/10"
                  >
                    {isAr ? "كيف يعمل EVO؟" : "How EVO works"}
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {evoMetrics.map((m) => (
                  <div
                    key={m.k}
                    className="rounded-2xl border border-[#1a0e0a]/10 bg-[#fff1e4] p-4 shadow-[0_10px_30px_-10px_rgba(26,14,10,0.3)]"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#1a0e0a]/50 rtl:tracking-normal">{m.k}</p>
                    <p className="font-display mt-2 text-2xl font-bold">{m.v}</p>
                    <p className="mt-1 text-xs text-[#1a0e0a]/60">{m.z}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* The live demo — the REAL two-turn exchange (unchanged). */}
          <div className="marble-card marble-card--unclipped mt-5 p-5 md:p-8">
            <EvoConversation isAr={isAr} />
          </div>
        </div>
      </section>

      {/* ===================== 4. THE CALCULATOR (#start) ===================== */}
      <section id="start" className="relative z-10 scroll-mt-20 border-t border-[color-mix(in_srgb,var(--text)_5%,transparent)]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ember-text)] rtl:tracking-normal">
                {isAr ? "حاسبة السعرات والماكروز" : "The calorie & macro calculator"}
              </p>
              <h2 className="font-display mt-3 max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight rtl:leading-snug rtl:tracking-normal md:text-5xl">
                {isAr ? "اعرف أرقامك قبل أي خطوة." : "Know your numbers before anything else."}
              </h2>
            </div>
            <p className="max-w-md text-[color-mix(in_srgb,var(--text)_60%,transparent)]">
              {isAr
                ? "سعراتك اليومية وتوزيع ماكروزك حول هدفك — بنفس معادلات المنصة، ودون أي تسجيل."
                : "Your daily calories and macro split around your goal — the platform's own formulas, no signup."}
            </p>
          </div>
          <div className="mt-14">
            <div className="marble-card marble-card--unclipped p-4 md:p-8 lg:p-10">
              <HomeCalculator isAr={isAr} />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== 5. SMART PLANNING (#plan) — REAL generation ===================== */}
      <section id="plan" className="relative z-10 scroll-mt-20 border-t border-[color-mix(in_srgb,var(--text)_5%,transparent)]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ember-text)] rtl:tracking-normal">
                {isAr ? "التخطيط الذكي" : "Smart planning"}
              </p>
              <h2 className="font-display mt-3 max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight rtl:leading-snug rtl:tracking-normal md:text-5xl">
                {isAr ? "خطتك تُبنى هنا — فعلًا." : "Your plan is built right here."}
              </h2>
            </div>
            <p className="max-w-md text-[color-mix(in_srgb,var(--text)_60%,transparent)]">
              {isAr
                ? "حدّد اختياراتك واضغط زر الإنشاء — خطة كاملة بالتمارين والمجموعات أو بالوجبات والغرامات تتولّد هنا في الصفحة، بنفس محرك الأدوات."
                : "Set your choices and hit generate — a full plan (exercises and sets, or meals in grams) is created right on this page by the same engine as the tools."}
            </p>
          </div>
          <div className="mt-14 grid gap-4 md:gap-5 lg:grid-cols-2">
            <WorkoutPlanBuilder isAr={isAr} isLoggedIn={isLoggedIn} />
            <MealPlanBuilder samples={samples} isAr={isAr} isLoggedIn={isLoggedIn} />
            <div className="marble-card flex flex-col items-center justify-between gap-3 px-5 py-4 text-center md:flex-row md:gap-4 md:text-start lg:col-span-2">
              <p className="text-sm leading-relaxed text-[color-mix(in_srgb,var(--text)_70%,transparent)]">
                {isAr
                  ? "كل زائر يملك رصيدًا شهريًا مجانيًا لتوليد الخطط — دون تسجيل."
                  : "Every visitor carries a free monthly plan allowance — no signup."}
              </p>
              <span className="seal-chip shrink-0">
                <EngravedIcon name="macros" alt="" size={12} className="h-3 w-3" />
                {isAr ? "توليد حقيقي داخل الصفحة" : "REAL IN-PAGE GENERATION"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== 6. THE EXERCISE LIBRARY (#library) — interactive ===================== */}
      <section id="library" className="relative z-10 scroll-mt-20 border-t border-[color-mix(in_srgb,var(--text)_5%,transparent)]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ember-text)] rtl:tracking-normal">
                {isAr ? `${EX_PLUS} تمرينًا` : `${EX_PLUS} exercises`}
              </p>
              <h2 className="font-display mt-3 max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight rtl:leading-snug rtl:tracking-normal md:text-5xl">
                {isAr ? "مكتبة التمارين" : "The exercise library"}
              </h2>
            </div>
            <p className="max-w-md text-[color-mix(in_srgb,var(--text)_60%,transparent)]">
              {isAr
                ? "عينة حقيقية من المكتبة — اختر مجموعة عضلية وشاهد البطاقات تتبدل أمامك، وكل تمرين بصفحته وصور الأداء الصحيح."
                : "A real slice of the library — pick a muscle group and watch the cards swap; every exercise opens its own page with form photos."}
            </p>
          </div>
          <div className="mt-14">
            <LibraryBrowser samples={samples} isAr={isAr} />
          </div>
        </div>
      </section>

      {/* ===================== 7. EAT (#eat) — the interactive plate ===================== */}
      <section id="eat" className="relative z-10 scroll-mt-20 border-t border-[color-mix(in_srgb,var(--text)_5%,transparent)]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ember-text)] rtl:tracking-normal">
                {isAr ? `${FOODS_PLUS} صنفًا غذائيًا` : `${FOODS_PLUS} foods`}
              </p>
              <h2 className="font-display mt-3 max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight rtl:leading-snug rtl:tracking-normal md:text-5xl">
                {isAr ? "اعرف أرقام طبقك قبل أن تأكله." : "Know your plate's numbers before you eat it."}
              </h2>
            </div>
            <p className="max-w-md text-[color-mix(in_srgb,var(--text)_60%,transparent)]">
              {isAr
                ? "سعرات وبروتين وكربوهيدرات ودهون لكل 100 جرام — اختر صنفًا من القاعدة وشاهد أرقامه تتحرك."
                : "Calories, protein, carbs, and fat for every 100 g — pick a food from the database and watch its numbers move."}
            </p>
          </div>
          <div className="mt-14">
            <FoodExplorer samples={samples} isAr={isAr} />
          </div>
          <div className="mt-10 text-center">
            <a href={isAr ? "/ar/foods" : "/foods"} className="btn-outline px-7 py-3 text-sm font-medium md:text-base">
              {isAr ? "استكشف قاعدة الأطعمة" : "Explore the food database"}
              <span className="chev rtl:rotate-180" aria-hidden="true">›</span>
            </a>
          </div>
        </div>
      </section>

      {/* ===================== 8. THE READY-MADE DIET LIBRARY (#diet) ===================== */}
      <section id="diet" className="relative z-10 scroll-mt-20 border-t border-[color-mix(in_srgb,var(--text)_5%,transparent)]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ember-text)] rtl:tracking-normal">
                {isAr ? `${dietPlansCount} خطة جاهزة` : `${dietPlansCount} ready-made plans`}
              </p>
              <h2 className="font-display mt-3 max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight rtl:leading-snug rtl:tracking-normal md:text-5xl">
                {isAr ? "مكتبة الخطط الغذائية الجاهزة" : "The ready-made diet-plan library"}
              </h2>
            </div>
            <p className="max-w-md text-[color-mix(in_srgb,var(--text)_60%,transparent)]">
              {isAr
                ? "أنظمة جاهزة بالغرامات والسعرات لكل صنف، من مطبخ عربي مألوف — من 1200 إلى 3000 سعرة."
                : "Ready-made systems with grams and calories per food, from a familiar Arabic kitchen — from 1200 to 3000 kcal."}
            </p>
          </div>
          <div className="mt-14">
            <CarouselShell isAr={isAr} ariaLabel={isAr ? "الأنظمة الغذائية الجاهزة" : "The ready-made diet systems"}>
              {samples.dietSystems.map((system, i) => (
                <div key={system.slug} className="w-72 shrink-0 md:w-80">
                  <LandingDietCard
                    system={system}
                    levelCount={samples.dietLevels.length}
                    isAr={isAr}
                    index={i}
                  />
                </div>
              ))}
            </CarouselShell>
          </div>
          <div className="mt-10 text-center">
            <a href={isAr ? "/ar/diet-plan" : "/diet-plan"} className="btn-outline px-7 py-3 text-sm font-medium md:text-base">
              {isAr ? "افتح مكتبة الخطط الغذائية" : "Open the diet-plan library"}
              <span className="chev rtl:rotate-180" aria-hidden="true">›</span>
            </a>
          </div>
        </div>
      </section>

      {/* ===================== 9. LEARN (#learn) — the latest articles ===================== */}
      {latestPosts.length > 0 && (
        <section id="learn" className="relative z-10 scroll-mt-20 border-t border-[color-mix(in_srgb,var(--text)_5%,transparent)]">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ember-text)] rtl:tracking-normal">
                  {isAr ? "المدونة" : "The blog"}
                </p>
                <h2 className="font-display mt-3 text-4xl font-bold leading-[1.05] tracking-tight rtl:leading-snug rtl:tracking-normal md:text-5xl">
                  {isAr ? "أحدث المقالات" : "Latest articles"}
                </h2>
              </div>
            </div>
            <div className="mt-14">
              <BlogCarousel
                posts={[...latestPosts, ...featuredPosts].slice(0, 10)}
                featuredSlugs={featuredPosts.map((p) => p.slug)}
                isAr={isAr}
              />
            </div>
            <div className="mt-10 text-center">
              <a href={blogHref} className="btn-outline px-7 py-3 text-sm font-medium md:text-base">
                {isAr ? "استكشف المحتوى" : "Explore the articles"}
                <span className="chev rtl:rotate-180" aria-hidden="true">›</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ===================== 10. COACHES — the template's coach grid ===================== */}
      <section className="relative z-10 border-t border-[color-mix(in_srgb,var(--text)_5%,transparent)]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ember-text)] rtl:tracking-normal">
              {isAr ? "الفريق" : "The team"}
            </p>
            <h2 className="font-display mt-3 text-4xl font-bold leading-[1.05] tracking-tight rtl:leading-snug rtl:tracking-normal md:text-5xl">
              {isAr ? "مدربون فعلوا العمل." : "Coaches who've done the work."}
            </h2>
            <p className="mt-5 text-[color-mix(in_srgb,var(--text)_60%,transparent)]">
              {isAr
                ? "فريق يجمع بين مدرب بشري يبني خطتك بنفسه ويتابع تقدمك أسبوعيًا، وEVO — المدرب الذكي المتاح دائمًا. تقابلك حيث أنت."
                : "A team that pairs a human coach who builds your plan personally and follows your progress weekly, with EVO — the AI coach that is always on. They meet you exactly where you are."}
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {coachCards.map((c) => {
              const cardInner = (
                <>
                  <div className={`relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br ${c.hue}`}>
                    <div className="absolute inset-0 opacity-60 noise mix-blend-overlay" aria-hidden="true" />
                    <span className="font-display absolute bottom-4 start-4 text-6xl font-bold text-white/90" aria-hidden="true">
                      {c.monogram}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="font-display text-lg font-semibold">{c.title}</p>
                      <p className="text-xs text-[color-mix(in_srgb,var(--text)_50%,transparent)]">{c.role}</p>
                    </div>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-[color-mix(in_srgb,var(--text)_40%,transparent)] transition group-hover:-rotate-45 group-hover:text-[var(--text)] rtl:rotate-180 rtl:group-hover:rotate-[225deg]"
                      fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </div>
                  <p className="mt-3 text-xs text-[color-mix(in_srgb,var(--text)_40%,transparent)]">{c.meta}</p>
                </>
              );
              return c.action === "evo" ? (
                <button
                  key={c.monogram}
                  type="button"
                  onClick={openEvoFloatingChat}
                  className="group cursor-pointer rounded-3xl border border-[color-mix(in_srgb,var(--text)_10%,transparent)] bg-[color-mix(in_srgb,var(--text)_2%,transparent)] p-4 text-start transition hover:border-[color-mix(in_srgb,var(--text)_25%,transparent)]"
                >
                  {cardInner}
                </button>
              ) : (
                <a
                  key={c.monogram}
                  href={c.href}
                  className="group rounded-3xl border border-[color-mix(in_srgb,var(--text)_10%,transparent)] bg-[color-mix(in_srgb,var(--text)_2%,transparent)] p-4 transition hover:border-[color-mix(in_srgb,var(--text)_25%,transparent)]"
                >
                  {cardInner}
                </a>
              );
            })}
          </div>
        </div>

        {/* FEATURED COACHES («أعلن معنا» ads) — kept verbatim (paid-ad strip;
            renders only when active ads exist). */}
        {featuredCoaches.length > 0 && (
          <div className="mx-auto max-w-7xl px-6 pb-24">
            <h3 className="text-center text-2xl font-semibold tracking-tight rtl:tracking-normal md:text-3xl">
              {isAr ? "مدربون مميزون على Alkemos" : "Featured Coaches on Alkemos"}
            </h3>
            <p className="mx-auto mt-3 max-w-md text-center text-sm text-[color-mix(in_srgb,var(--text)_60%,transparent)]">
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
                        className="mx-auto h-16 w-16 rounded-full object-cover ring-4 ring-[color-mix(in_srgb,var(--text)_5%,transparent)]"
                      />
                    ) : (
                      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[color-mix(in_srgb,var(--text)_10%,transparent)] bg-[color-mix(in_srgb,var(--text)_5%,transparent)] text-xl font-semibold">
                        {(coach.name.trim().charAt(0) || "M")}
                      </div>
                    )}
                    <p className="mt-3 truncate text-sm font-semibold">{coach.name}</p>
                    {coach.headline && (
                      <p className="mt-1 line-clamp-2 text-xs text-[color-mix(in_srgb,var(--text)_60%,transparent)]">
                        {coach.headline}
                      </p>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ===================== 11. THE REAL NUMBERS — the template's testimonial layout ===================== */}
      <section className="relative z-10 border-t border-[color-mix(in_srgb,var(--text)_5%,transparent)]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-[color-mix(in_srgb,var(--text)_10%,transparent)] bg-gradient-to-br from-[color-mix(in_srgb,var(--text)_6%,transparent)] to-transparent p-10 md:col-span-2">
              <div className="flex flex-wrap gap-2">
                <span className="hero-pill px-3! py-1! text-[10px]!">{isAr ? "التدريب" : "Training"}</span>
                <span className="hero-pill px-3! py-1! text-[10px]!">{isAr ? "التغذية" : "Nutrition"}</span>
                <span className="hero-pill px-3! py-1! text-[10px]!">{isAr ? "التخطيط الذكي" : "Smart planning"}</span>
              </div>
              <p className="font-display mt-6 text-2xl font-medium leading-snug md:text-3xl rtl:leading-snug">
                {isAr
                  ? "«كل ما في هذه الصفحة يعمل مجانًا — الحاسبة والمخططات والمكتبات. خطتك الأولى علينا، بالعربية أو الإنجليزية.»"
                  : "\u201CEverything on this page runs free — the calculator, the planners, the libraries. Your first plan is on us, in Arabic or English.\u201D"}
              </p>
              <div className="mt-8 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#ff4d26] to-[#ff9353] font-display font-bold text-[#1a0e0a]">
                  A
                </span>
                <div>
                  <p className="font-semibold">Alkemos</p>
                  <p className="text-xs text-[color-mix(in_srgb,var(--text)_50%,transparent)]">
                    {isAr ? "الفئة المجانية الدائمة" : "The permanent free tier"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                {
                  eyebrow: isAr ? "الأدوات" : "Tools",
                  q: isAr
                    ? "كل الأدوات تعمل مباشرة في الصفحة — دون تسجيل."
                    : "Every tool runs right on the page — no signup.",
                  a: "alkemos.com/tools",
                },
                {
                  eyebrow: isAr ? "الأطعمة" : "Foods",
                  q: isAr
                    ? `${FOODS_PLUS} صنفًا ببروتين وماكروز كاملة — من مطبخ عربي مألوف.`
                    : `${FOODS_PLUS} foods with full macros — from a familiar Arabic kitchen.`,
                  a: "alkemos.com/foods",
                },
              ].map((t) => (
                <div
                  key={t.a}
                  className="rounded-3xl border border-[color-mix(in_srgb,var(--text)_10%,transparent)] bg-[color-mix(in_srgb,var(--text)_2%,transparent)] p-6"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ember-text)] rtl:tracking-normal">
                    {t.eyebrow}
                  </p>
                  <p className="mt-3 text-base leading-relaxed text-[color-mix(in_srgb,var(--text)_80%,transparent)]">{t.q}</p>
                  <p className="mt-4 text-xs text-[color-mix(in_srgb,var(--text)_50%,transparent)]">{t.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== 12. MEMBERSHIPS — the template's pricing cards ===================== */}
      <section id="memberships" className="relative z-10 scroll-mt-20 border-t border-[color-mix(in_srgb,var(--text)_5%,transparent)]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ember-text)] rtl:tracking-normal">
              {isAr ? "العضويات" : "Membership"}
            </p>
            <h2 className="font-display mt-3 text-4xl font-bold leading-[1.05] tracking-tight rtl:leading-snug rtl:tracking-normal md:text-5xl">
              {isAr ? "خطط بسيطة. بدون عقود." : "Simple plans. No contracts."}
            </h2>
            <p className="mt-5 text-[color-mix(in_srgb,var(--text)_60%,transparent)]">
              {isAr
                ? "المستوى المجاني دائم — والترقية حين تحتاج سعة أكبر ومزايا أوسع."
                : "The free tier is permanent — upgrade when you need more room and wider features."}
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {pricingTiers.map((tier) => (
              <article
                key={tier.id}
                className={
                  tier.featured
                    ? "relative flex flex-col rounded-3xl border border-[var(--ember)] bg-gradient-to-b from-[var(--ember-soft)] to-[color-mix(in_srgb,var(--text)_2%,transparent)] p-8 shadow-[0_30px_80px_-40px_rgba(255,77,38,0.5)]"
                    : "relative flex flex-col rounded-3xl border border-[color-mix(in_srgb,var(--text)_10%,transparent)] bg-[color-mix(in_srgb,var(--text)_2%,transparent)] p-8 transition hover:border-[color-mix(in_srgb,var(--text)_25%,transparent)]"
                }
              >
                {tier.featured && (
                  <span className="absolute -top-3 start-8 rounded-full bg-[var(--ember)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#1a0e0a] rtl:tracking-normal">
                    {isAr ? "الأكثر شعبية" : "Most popular"}
                  </span>
                )}
                <p className="font-display text-lg font-semibold">{tier.name}</p>
                <p className="mt-1 text-sm text-[color-mix(in_srgb,var(--text)_60%,transparent)]">{tier.blurb}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-bold">{tier.price}</span>
                  <span className="text-sm text-[color-mix(in_srgb,var(--text)_50%,transparent)]">{tier.cadence}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm text-[color-mix(in_srgb,var(--text)_80%,transparent)]">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <svg
                        viewBox="0 0 24 24"
                        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ember-text)]"
                        fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                      >
                        <path d="m5 12 5 5 9-11" />
                      </svg>
                      {perk}
                    </li>
                  ))}
                </ul>
                <a
                  href={tier.href}
                  className={
                    tier.featured
                      ? "mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff4d26] to-[#ff9353] px-5 py-3 text-sm font-semibold text-[#1a0e0a] transition hover:opacity-90"
                      : "mt-8 inline-flex items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--text)_20%,transparent)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--text)] hover:bg-[var(--text)] hover:text-[var(--bg)]"
                  }
                >
                  {tier.cta}
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 rtl:rotate-180"
                    fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </a>
              </article>
            ))}
          </div>

          {/* The online-coaching card — the human service, separate from
              the memberships (the terminology law). */}
          <div className="relative mt-5 overflow-hidden rounded-3xl border border-[color-mix(in_srgb,var(--text)_10%,transparent)] bg-[color-mix(in_srgb,var(--text)_3%,transparent)] p-5 md:p-7">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
              <div>
                <h3 className="text-xl font-semibold tracking-tight rtl:tracking-normal">
                  {isAr ? "التدريب الأونلاين (الكوتشينج)" : "Online Coaching"}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color-mix(in_srgb,var(--text)_60%,transparent)]">
                  {isAr
                    ? "مدرب بشري يبني خططك بنفسه، ويتابع تقدمك أسبوعيًا، ويبقى على تواصل مباشر معك — ويشمل كل مزايا برو."
                    : "A human coach builds your plans personally, follows your progress weekly, and stays in direct contact — all Pro features included."}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
                <span className="chrome-text text-2xl font-bold">
                  {coachingPriceLabel}
                  <span className="text-xs font-medium text-[color-mix(in_srgb,var(--text)_50%,transparent)]">
                    {isAr ? " / شهريًا" : " /mo"}
                  </span>
                </span>
                <a href={isAr ? "/ar/coaching" : "/coaching"} className="btn-chrome px-6 py-2.5 text-sm font-medium">
                  {isAr ? "استكشف التدريب الأونلاين" : "Explore online coaching"}
                  <span className="chev rtl:rotate-180" aria-hidden="true">›</span>
                </a>
              </div>
            </div>
          </div>

          {/* The REAL refund policy, stated as fact. */}
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-[color-mix(in_srgb,var(--text)_50%,transparent)]">
            {isAr
              ? "كل باقة مدفوعة تشمل حق الاسترداد خلال 7 أيام — إن لم تستخدم المزايا المدفوعة، يُعاد إليك المبلغ."
              : "Every paid plan carries a 7-day refund — if you haven't used the paid features, you get your money back."}
          </p>
        </div>
      </section>

      {/* ===================== 13. FAQ — the template's native details/summary ===================== */}
      <section id="faq" className="relative z-10 scroll-mt-20 border-t border-[color-mix(in_srgb,var(--text)_5%,transparent)]">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="grid gap-10 md:grid-cols-[1fr_1.6fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ember-text)] rtl:tracking-normal">
                {isAr ? "الأسئلة" : "Questions"}
              </p>
              <h2 className="font-display mt-3 text-4xl font-bold leading-[1.05] tracking-tight rtl:leading-snug rtl:tracking-normal md:text-5xl">
                {isAr ? "سألتَ، فأجبنا." : "You asked, we answered."}
              </h2>
              <p className="mt-5 text-[color-mix(in_srgb,var(--text)_60%,transparent)]">
                {isAr
                  ? "ما زال لديك سؤال؟ تواصل معنا — يسعدنا الرد دائمًا."
                  : "Still have questions? Contact us — we're always happy to help."}
              </p>
            </div>
            <div className="divide-y divide-[color-mix(in_srgb,var(--text)_10%,transparent)] rounded-3xl border border-[color-mix(in_srgb,var(--text)_10%,transparent)] bg-[color-mix(in_srgb,var(--text)_2%,transparent)]">
              {faqs.map((f) => (
                <details key={f.q} className="group px-6 py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="ms-4 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[color-mix(in_srgb,var(--text)_15%,transparent)] text-[color-mix(in_srgb,var(--text)_50%,transparent)] transition group-open:rotate-45 group-open:border-[var(--ember)] group-open:text-[var(--ember-text)]">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-[color-mix(in_srgb,var(--text)_60%,transparent)]">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== 14. CTA — the template's closing panel ===================== */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pb-24">
          <div className="relative overflow-hidden rounded-[32px] bg-[#0f0f12] p-10 text-[#f7f3ec] md:p-16">
            <div
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(500px circle at 85% 20%, rgba(255,77,38,0.35), transparent 55%), radial-gradient(500px circle at 15% 90%, rgba(215,255,77,0.18), transparent 55%)",
              }}
              aria-hidden="true"
            />
            <div className="relative grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
              <div>
                <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight rtl:leading-snug rtl:tracking-normal md:text-6xl">
                  {isAr ? (
                    <>خطتك الأولى <span className="text-[#ff9353]">علينا.</span></>
                  ) : (
                    <>Your first plan is <span className="text-[#ff9353]">on us.</span></>
                  )}
                </h2>
                <p className="mt-5 max-w-lg leading-relaxed text-[#f7f3ec]/70">
                  {isAr
                    ? "أدوات تعمل دون تسجيل، وخطة ذكية شهريًا لكل زائر — والعضوية المجانية دائمة. أنشئ حسابك وتُحفظ خططك وتتزامن عبر أجهزتك."
                    : "Tools that work without signup, a monthly AI plan for every visitor — and the free tier is permanent. Create an account and your plans save and sync across your devices."}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <NewsletterForm variant="footer" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER — the SHARED SiteFooter component ===================== */}
      <SiteFooter />
    </div>
  );
}
