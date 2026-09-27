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
import { TOOLS, TOOLS_COUNT } from "@/lib/tools-shared";
import { MEMBERSHIPS } from "@/lib/memberships";
import { openEvoFloatingChat } from "@/lib/evo-chat-events";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getFAQSchema, jsonLd } from "@/lib/seo";
import { resolveHomeCopy, resolveHomeFaq, type HomeCopy, type SiteCopyMap } from "@/lib/site-content/home";
import Image from "next/image";
import { ThemeImg, EngravedIcon } from "@/components/ThemeImg";
import type {
  HomeDietSystemSample,
  HomeExerciseSample,
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
// HOME-PLATFORM-284 (owner order 2026-09-27 — «الصفحة الرئيسية كواجهة
// منصة حقيقية وليست صفحة هبوط»): the embedded tool surfaces are GONE
// from the homepage. The homepage is now a true PLATFORM homepage —
// concise SECTIONS with CARDS that link to the real pages, exactly one
// job per section, mirroring the header's service nav:
//
//   SECTION ARC (top → bottom):
//     HERO (two CTAs, unchanged) → PROOF (one row, unchanged) →
//     #library TRAINING (the interactive muscle-group browser — the
//     preview now answers with SIX real exercises per family) →
//     #train PROGRAMS (the ready-made carousel, unchanged) →
//     #eat NUTRITION (three clearly-differentiated cards: the food
//     database · the MANUAL Meal Planner · the READY-MADE diet-plan
//     library) → #diet (the diet-systems carousel, unchanged) →
//     #tools TOOLS (ONE card linking to the /tools hub — the
//     calculators themselves are NO LONGER embedded here) →
//     #plan AI PLANNING (three AI cards: the AI Workout Planner, the
//     AI Meal Planner — a STRUCTURED day plan with portions/grams, not
//     mere suggestions — and EVO, the AI coach; visually and verbally
//     distinct from the regular tools) → #learn (latest-first blog
//     carousel, unchanged) → #memberships (small tier cards + the
//     coaching band, unchanged) → #faq (unchanged).
//
// WHY (the owner's brief): a homepage should NAVIGATE the visitor
// into the platform's real pages — the embedded calculator/builders
// duplicated the tool pages, blurred AI planning into regular tools,
// and buried the section entry points under a landing-page treatment.
//
// The laws that still hold from the 270/271 frames: the hero's
// two-button directive; the compact one-row proof strip; prices
// derive from memberships.ts (never literals); EN/AR are independent
// native pairs; counts ride the verified constants (EX_PLUS /
// FOODS_PLUS / TOOLS_COUNT); the EVO chat surface stays the floating
// widget (openEvoFloatingChat — the EVO card's button dispatches it);
// zero emoji; MSA-clean Arabic; motion stays once-only +
// reduced-motion-safe.
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
// THE PLATFORM SECTION CARDS (HOME-PLATFORM-284) — the homepage's
// navigation surfaces. One card = one destination page; NO tool is
// embedded on the homepage anymore. The cards ride the SAME
// marble-card family as the content previews (marble-card +
// card-lift + EngravedIcon + chrome-text arrow) so the whole page
// reads as ONE product surface.
// ══════════════════════════════════════════════════════════════

// ── PlatformCard — the generic section entry: an engraved icon,
//    an optional differentiation chip, a title, a description, and
//    the chrome arrow CTA. Used by the Tools card and the
//    nutrition trio (whose chips carry the explicit
//    MANUAL / READY-MADE differentiation). ──
function PlatformCard({
  icon,
  chip,
  title,
  body,
  cta,
  href,
  isAr,
}: {
  icon: string;
  chip?: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  isAr: boolean;
}) {
  return (
    <a href={href} className="marble-card card-lift group flex h-full flex-col p-5 text-start">
      <div className="flex items-start justify-between gap-3">
        <EngravedIcon name={icon} alt="" size={40} className="h-10 w-10 shrink-0" />
        {chip ? (
          <span className="seal-chip shrink-0 py-1! text-[11px]!">{chip}</span>
        ) : null}
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-tight tracking-tight" style={{ color: PALETTE.textPrim }}>
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
        {body}
      </p>
      <p className="chrome-text mt-4 text-sm font-semibold">
        {cta}
        <span className="rtl:rotate-180" aria-hidden="true">›</span>
      </p>
    </a>
  );
}

// ── EvoCard — the AI coach's section card. NOT a full-card link:
//    the chat surface law keeps the REAL chat on the floating
//    widget (openEvoFloatingChat — the button dispatches it), while
//    the quiet «learn more» link routes to the EVO page. The avatar
//    is the widget's own character art wearing the .ai-ring (the
//    cyan AI-surface law — one of the few places cyan may touch). ──
function EvoCard({ isAr }: { isAr: boolean }) {
  return (
    <div className="marble-card card-lift flex h-full flex-col p-5 text-start">
      <div className="flex items-start justify-between gap-3">
        <ThemeImg
          light="/images/brand/evo-widget-light.webp"
          dark="/images/brand/evo-widget-dark.webp"
          alt="EVO"
          width={64}
          height={64}
          className="ai-ring h-10 w-10 shrink-0 rounded-full border border-[var(--edge)] object-cover"
        />
        <span className="seal-chip shrink-0 py-1! text-[11px]!">
          <span className="live-dot" aria-hidden="true" />
          {isAr ? "متاح الآن" : "LIVE NOW"}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-tight tracking-tight" style={{ color: PALETTE.textPrim }}>
        {isAr ? "EVO — مدربك الذكي" : "EVO — your AI coach"}
      </h3>
      <p className="mt-2 flex-1 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
        {isAr
          ? "اسأله بالعربية أو الإنجليزية: يجيبك بأرقام، ويقترح بدائل ذكية لتمارينك ووجباتك، ويعدّل خطتك مع تقدمك."
          : "Ask in Arabic or English: it answers with real numbers, suggests smart swaps for your exercises and meals, and adjusts your plan as you progress."}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={openEvoFloatingChat}
          className="btn-outline px-5 py-2 text-sm font-medium"
        >
          <span className="live-dot" aria-hidden="true" />
          {isAr ? "تحدث مع EVO الآن" : "Chat with EVO now"}
        </button>
        <a
          href={isAr ? "/ar/evo" : "/evo"}
          className="text-sm font-medium underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70"
          style={{ color: PALETTE.textSec }}
        >
          {isAr ? "اعرف المزيد ›" : "Learn more ›"}
        </a>
      </div>
      {/* The honest visitor quota (EVO fair use — a VERIFIED policy
          restatement, not marketing copy). */}
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

      {/* The live swap — real cards re-render per selection.
          HOME-PLATFORM-284: SIX curated samples per family now fill
          a full 2×3 grid on md+ (was 2-3 cards on a 4-col row). */}
      {filtered.length > 0 ? (
        <div key={cat} className="swap-fade mt-7 grid grid-cols-2 gap-4 md:grid-cols-3">
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
          ? `ستة تمارين حقيقية من مكتبة ${EX_PLUS} تمرينًا — بصور الأداء الصحيح وشرح واضح داخل صفحة كل تمرين.`
          : `Six real exercises from the ${EX_PLUS} library — with form photos and clear instructions one tap away.`}
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

export function LandingView({ samples, content }: { samples: HomeSamples; content?: SiteCopyMap }) {
  const { lang } = useI18n();
  const { isCoach, isAdmin, profile } = useAuth();
  const isAr = lang === "ar";
  // SITE-CONTENT-281: the admin-editable marketing copy for the active
  // locale — Supabase overrides (passed down by the server route) win,
  // the code defaults in site-content/home.ts are the eternal fallback
  // (the fallback law: the page can never render empty or crash).
  const c = resolveHomeCopy(content, isAr);
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
  // array (single source law). SITE-CONTENT-281: the array resolves
  // from site-content/home.ts defaults + admin overrides — same law,
  // one editable source.
  const faqs = resolveHomeFaq(content, isAr);
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
  // TPL-REF-280 — featured-card depth: the template's featured pricing
  // shadow (deep, tight, under the featured card only) re-toned to the
  // pinned-black surface — a warm-graphite drop that reads as machined
  // elevation in light mode and quietly grounds the card in dark.
  const darkMarbleStyle = {
    backgroundColor: "#0B0B0D",
    color: "#F5F5F7",
    border: "2px solid transparent",
    backgroundImage:
      "linear-gradient(#0B0B0D, #0B0B0D), linear-gradient(145deg, #FDFDFD 0%, #C9CED3 35%, #878E94 50%, #E6E9EC 70%, #9AA0A6 100%)",
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
    boxShadow: "0 24px 60px -28px rgba(11, 11, 13, 0.55)",
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
            {c.heroTitle}
          </h1>
          <p className="hero-copy mx-auto mt-3 max-w-xl text-sm font-normal leading-relaxed md:mt-4 md:text-base" style={{ color: PALETTE.textSec }}>
            {c.heroSubtitle}
          </p>

          {/* VRD-V8 — the platform CONVERGENCE (V8-1 + V8-2): the trio
              graduates from static chips to a visual product story.
              The glass pills keep their semantic row, and beneath them
              three chrome streams flow down into ONE platform node —
              Training + Nutrition visibly feed the smart-planning
              core, so «one integrated platform» reads in seconds.
              Source idea: 21st.dev/MagicUI «Animated Beam», re-authored
              internally as a fixed symmetric SVG with a pathLength=100
              dash pulse (zero deps, zero JS; direction-symmetric by
              construction — no RTL flip needed; reduced-motion freezes
              to the static wire). STILL a semantic non-interactive
              list: the two-button law stays exact — hover is styling,
              never navigation, and the diagram is aria-hidden. */}
          <div className="platform-trio mt-4 md:mt-5">
            <ul
              className="flex flex-wrap items-center justify-center gap-2 md:gap-3"
              aria-label={isAr ? "أعمدة المنصة" : "The platform pillars"}
            >
              <li className="hero-pill">
                <EngravedIcon name="dumbbell" alt="" size={16} className="h-4 w-4" />
                {c.heroPillTraining}
              </li>
              <li className="hero-pill">
                <EngravedIcon name="protein" alt="" size={16} className="h-4 w-4" />
                {c.heroPillNutrition}
              </li>
              <li className="hero-pill">
                <EngravedIcon name="macros" alt="" size={16} className="h-4 w-4" />
                {c.heroPillPlanning}
              </li>
            </ul>
            <div className="trio-flow" aria-hidden="true">
              <svg className="trio-svg" viewBox="0 0 360 64" fill="none" focusable="false">
                {/* The static wire — three quiet streams into the node */}
                <path className="trio-base" d="M46 4 Q46 40 180 56" />
                <path className="trio-base" d="M180 4 V56" />
                <path className="trio-base" d="M314 4 Q314 40 180 56" />
                {/* The traveling pulses (comet dashes, staggered) */}
                <path className="trio-pulse trio-pulse--1" d="M46 4 Q46 40 180 56" pathLength={100} />
                <path className="trio-pulse trio-pulse--2" d="M180 4 V56" pathLength={100} />
                <path className="trio-pulse trio-pulse--3" d="M314 4 Q314 40 180 56" pathLength={100} />
                {/* The convergence node — glass plate + core + halo */}
                <circle className="trio-node-disc" cx="180" cy="56" r="13" />
                <circle className="trio-node-halo" cx="180" cy="56" r="12" />
                <circle className="trio-node-core" cx="180" cy="56" r="4.5" />
              </svg>
              <span className="trio-node-label tracking-[0.18em] rtl:tracking-normal">
                {c.heroNode}
              </span>
            </div>
          </div>

          {/* The two-button pair (R1). */}
          <div className="mt-5 flex flex-col items-stretch justify-center gap-3 md:mt-6 md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-x-5 md:gap-y-3">
            {isLoggedIn ? (
              <>
                <a href={memberHref} className="btn-chrome w-full px-7 py-3 text-sm md:w-auto md:px-8 md:py-3 md:text-base">
                  {isAr ? "انتقل إلى لوحة التحكم" : "Go to your dashboard"}
                  <span className="chev rtl:rotate-180">›</span>
                </a>
                <a
                  href={isAr ? "/ar/memberships" : "/memberships"}
                  className="btn-outline w-full px-6 py-2.5 text-sm font-medium md:w-auto md:py-2.5 md:text-base"
                >
                  {isAr ? "العضويات المميزة" : "Premium memberships"}
                  <span className="chev rtl:rotate-180" aria-hidden="true">›</span>
                </a>
              </>
            ) : (
              <>
                <a href="/auth?mode=signup" className="btn-chrome w-full px-7 py-3 text-sm md:w-auto md:px-8 md:py-3 md:text-base">
                  {isAr ? "تسجيل الدخول / حساب جديد" : "Log in / Sign up"}
                  <span className="chev rtl:rotate-180">›</span>
                </a>
                <a
                  href={isAr ? "/ar/memberships" : "/memberships"}
                  className="btn-outline w-full px-6 py-2.5 text-sm font-medium md:w-auto md:py-2.5 md:text-base"
                >
                  {isAr ? "العضويات المميزة" : "Premium memberships"}
                  <span className="chev rtl:rotate-180" aria-hidden="true">›</span>
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
              {/* TPL-REF-280 — display numerals: the band's numbers take
                  the display face (template stats pattern, in Alkemos's
                  own Playfair) — same compact row, same chrome paint. */}
              <span className="font-display text-lg font-semibold tracking-tight md:text-xl">
                <CountUp value={stat.value} suffix={stat.suffix} paintClass="chrome-text" />
              </span>
              <span className="text-xs font-normal md:text-sm" style={{ color: PALETTE.textSec }}>
                {isAr ? stat.labelAr : stat.labelEn}
              </span>
            </span>
          ))}
        </div>
      </section>

      {/* ===================== 3. TRAINING — the exercise library preview =====================
          The muscle-group browser is the Training section's CONTENT
          PREVIEW (HOME-PLATFORM-284): real curated sample cards that
          filter in-page, now answering with SIX real exercises per
          family. The chips mirror the hub vocabulary and carry the
          VERIFIED per-family counts; every card is a real exercise
          page entry point — the tool-like browsing lives on /exercises. */}
      <section id="library" className="scroll-mt-20 bg-[var(--bg)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <span className="seal-chip">
              <EngravedIcon name="dumbbell" alt="" size={12} className="h-3 w-3" />
              {isAr ? `${EX_PLUS} تمرينًا` : `${EX_PLUS} EXERCISES`}
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              {c.libraryTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {c.libraryBody}
            </p>
          </Reveal>
          <Reveal delay={80} className="mt-8 md:mt-10">
            <LibraryBrowser samples={samples} isAr={isAr} />
          </Reveal>
        </div>
      </section>

      {/* ===================== 4. PROGRAMS — the ready-made carousel =====================
          The READY-MADE PROGRAMS (برامج التمارين الجاهزة) — the same
          blog-style carousel treatment, real program artwork, and ONE
          focused browse-all CTA (the AI planners own plan creation in
          the AI section below; this section only BROWSES programs). */}
      <section id="train" className="scroll-mt-20 border-y border-[var(--edge)] bg-[var(--tint)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <span className="seal-chip">
              <EngravedIcon name="dumbbell" alt="" size={12} className="h-3 w-3" />
              {c.trainEyebrow}
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              {c.trainTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {c.trainBody}
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
              {c.trainCta}
              <span className="chev rtl:rotate-180" aria-hidden="true">›</span>
            </a>
          </Reveal>
        </div>
      </section>

      {/* ===================== 5. NUTRITION — three clearly-differentiated ways =====================
          HOME-PLATFORM-284: the interactive plate is retired. The
          section presents the nutrition surfaces as THREE CARDS with
          an explicit differentiation: the food DATABASE (know the
          numbers) · the MANUAL Meal Planner (you build the meals) ·
          the READY-MADE diet-plan library (browse and start). The AI
          Meal Planner is deliberately NOT here — it lives in the AI
          Planning section below, and the section body cross-references
          it so the split stays clear. */}
      <section id="eat" className="scroll-mt-20 bg-[var(--bg)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <span className="seal-chip">
              <EngravedIcon name="protein" alt="" size={12} className="h-3 w-3" />
              {isAr ? `${FOODS_PLUS} صنفًا غذائيًا` : `${FOODS_PLUS} FOODS`}
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              {c.eatTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {c.eatBody}
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-3 md:gap-5">
            {/* Card 1 — the food database (know the numbers). */}
            <Reveal className="h-full">
              <PlatformCard
                isAr={isAr}
                icon="protein"
                href={isAr ? "/ar/foods" : "/foods"}
                title={isAr ? "قاعدة الأطعمة" : "The food database"}
                body={
                  isAr
                    ? `${FOODS_PLUS} صنفًا غذائيًا بالسعرات والماكروز لكل 100 جرام — بما فيها المطبخ العربي — لتعرف أرقام طبقك قبل أن تأكله.`
                    : `${FOODS_PLUS} foods with per-100 g calories and macros — regional and global staples — so you know your plate's numbers before you eat it.`
                }
                cta={isAr ? "استكشف قاعدة الأطعمة" : "Explore the food database"}
              />
            </Reveal>
            {/* Card 2 — the MANUAL meal planner (you build the meals):
                the chip + body state the differentiation explicitly. */}
            <Reveal delay={80} className="h-full">
              <PlatformCard
                isAr={isAr}
                icon="mealplanner"
                chip={isAr ? "ابنِها بنفسك" : "YOU BUILD IT"}
                href={isAr ? "/ar/meal-planner" : "/meal-planner"}
                title={isAr ? "مخطط الوجبات" : "Meal Planner"}
                body={
                  isAr
                    ? "أنت من يبني الوجبة: أضف الأصناف من قاعدة الأطعمة وحدّد الكمية بالجرام، وتابع السعرات والماكروز لحظة بلحظة — مع قائمة تسوق جاهزة."
                    : "You build the meal: add foods from the database, set the grams, and watch the calories and macros update live — with a ready shopping list."
                }
                cta={isAr ? "افتح مخطط الوجبات" : "Open the Meal Planner"}
              />
            </Reveal>
            {/* Card 3 — the READY-MADE diet plans (browse and start):
                the counts derive from the real matrix slice, never
                literals (levels × systems). */}
            <Reveal delay={160} className="h-full">
              <PlatformCard
                isAr={isAr}
                icon="fruits"
                chip={isAr ? "جاهزة للتصفح" : "READY TO BROWSE"}
                href={isAr ? "/ar/diet-plan" : "/diet-plan"}
                title={isAr ? "الخطط الغذائية الجاهزة" : "Ready-made diet plans"}
                body={
                  isAr
                    ? `${dietPlansCount} خطة يوم كاملة معدة مسبقًا بالغرامات والسعرات — ${samples.dietSystems.length} أنظمة × ${samples.dietLevels.length} مستويات من ${Math.min(...samples.dietLevels)} إلى ${Math.max(...samples.dietLevels)} سعرة — تصفحها وابدأ فورًا.`
                    : `${dietPlansCount} complete pre-made daily plans with exact grams and calories — ${samples.dietSystems.length} systems × ${samples.dietLevels.length} levels from ${Math.min(...samples.dietLevels).toLocaleString("en-US")} to ${Math.max(...samples.dietLevels).toLocaleString("en-US")} kcal — browse and start instantly.`
                }
                cta={isAr ? "افتح مكتبة الخطط" : "Open the plan library"}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================== 6. THE READY-MADE DIET LIBRARY — carousel (R4) =====================
          The owner directive: add the ready-made diet-plan library
          (مكتبة الخطط الغذائية الجاهزة) to the homepage, beside the
          exercise library. Real matrix data (server slice) — every card
          links into a real leaf page of the /diet-plan library. */}
      <section id="diet" className="scroll-mt-20 border-y border-[var(--edge)] bg-[var(--tint)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <span className="seal-chip">
              <EngravedIcon name="mealplanner" alt="" size={12} className="h-3 w-3" />
              {isAr ? `${dietPlansCount} خطة جاهزة` : `${dietPlansCount} READY-MADE PLANS`}
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              {c.dietTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {c.dietBody}
            </p>
          </Reveal>
          <Reveal delay={80} className="mt-8 md:mt-10">
            <CarouselShell isAr={isAr} ariaLabel={isAr ? "الأنظمة الغذائية الجاهزة" : "The ready-made diet systems"}>
              {samples.dietSystems.map((system, i) => (
                <LandingDietCard
                  key={system.slug}
                  system={system}
                  levelCount={samples.dietLevels.length}
                  isAr={isAr}
                  index={i}
                />
              ))}
            </CarouselShell>
          </Reveal>
          <Reveal delay={120} className="mt-8 text-center">
            <a href={isAr ? "/ar/diet-plan" : "/diet-plan"} className="btn-outline px-7 py-3 text-sm font-medium md:text-base">
              {c.dietCta}
              <span className="chev rtl:rotate-180" aria-hidden="true">›</span>
            </a>
          </Reveal>
        </div>
      </section>

      {/* ===================== 7. TOOLS — ONE card to the hub =====================
          HOME-PLATFORM-284 (owner directive: the Tools section is A
          CARD linking to the Tools page — NOT the actual calculators):
          the embedded calculator is retired from the homepage. The
          section is ONE wide card routing to /tools; the calculator
          + tracker names ride the TOOLS single source (tools-shared.ts
          — the planners are deliberately excluded from the chips:
          they own their sections above/below). */}
      <section id="tools" className="scroll-mt-20 bg-[var(--bg)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <span className="seal-chip">
              <EngravedIcon name="calories" alt="" size={12} className="h-3 w-3" />
              {c.toolsEyebrow}
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              {c.toolsTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {c.toolsBody}
            </p>
          </Reveal>
          <Reveal delay={80} className="mt-8 md:mt-10">
            <a
              href={isAr ? "/ar/tools" : "/tools"}
              className="marble-card card-lift group flex flex-col gap-5 p-6 text-start md:flex-row md:items-center md:gap-8 md:p-8"
            >
              <EngravedIcon name="calories" alt="" size={56} className="h-14 w-14 shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>
                  {isAr ? "صفحة الأدوات المجانية" : "The free tools page"}
                </h3>
                {/* The real tool names as chips — derived from the
                    tools-shared single source (never literals); the
                    three planners are filtered OUT (their homes are the
                    nutrition + AI sections). */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {TOOLS.filter((t) => !t.slug.startsWith("/")).map((t) => (
                    <span key={t.slug} className="seal-chip py-1! text-[11px]!">
                      {isAr ? t.nameAr : t.nameEn}
                    </span>
                  ))}
                </div>
              </div>
              <p className="chrome-text shrink-0 text-sm font-semibold">
                {c.toolsCta}
                <span className="rtl:rotate-180" aria-hidden="true">›</span>
              </p>
            </a>
          </Reveal>
        </div>
      </section>

      {/* ===================== 8. AI PLANNING — distinct from the regular tools =====================
          HOME-PLATFORM-284: the in-page builders are retired — this is
          now the AI family's navigation surface (mirroring the
          header's AI group): the AI Workout Planner + the AI Meal
          Planner (both explicitly AI-powered cards) + EVO, the AI
          coach. Deliberately SEPARATE from #tools so smart planning
          never reads as «more calculators»: every card carries the
          بالذكاء الاصطناعي chip and its body states exactly WHAT gets
          generated — the meal card promises a STRUCTURED full-day plan
          with portions in grams, not mere meal suggestions. */}
      <section id="plan" className="scroll-mt-20 border-y border-[var(--edge)] bg-[var(--tint)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <span className="seal-chip">
              <EngravedIcon name="evo" alt="" size={12} className="h-3 w-3" />
              {c.planEyebrow}
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              {c.planTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {c.planBody}
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-3 md:gap-5">
            {/* Card 1 — the AI Workout Planner (AI-powered, explicit). */}
            <Reveal className="h-full">
              <PlatformCard
                isAr={isAr}
                icon="rack"
                chip={isAr ? "بالذكاء الاصطناعي" : "AI-POWERED"}
                href={isAr ? "/ar/ai-workout-planner" : "/ai-workout-planner"}
                title={isAr ? "مخطط التمارين بالذكاء الاصطناعي" : "AI Workout Planner"}
                body={
                  isAr
                    ? "نظام تدريبي أسبوعي كامل يُبنى لك: تمارين محددة من المكتبة بمجموعاتها وتكراراتها، وفق هدفك ومستواك وأيامك ومعداتك — يتولد في ثوانٍ."
                    : "A complete weekly split built for you: named exercises from the library with sets and reps, matched to your goal, level, days, and equipment — generated in seconds."
                }
                cta={isAr ? "أنشئ خطة التمارين" : "Create my workout plan"}
              />
            </Reveal>
            {/* Card 2 — the AI Meal Planner: a STRUCTURED full-day
                plan with portions/grams — the body states this
                explicitly (owner directive: not mere suggestions). */}
            <Reveal delay={80} className="h-full">
              <PlatformCard
                isAr={isAr}
                icon="mealplanner"
                chip={isAr ? "بالذكاء الاصطناعي" : "AI-POWERED"}
                href={isAr ? "/ar/ai-meal-planner" : "/ai-meal-planner"}
                title={isAr ? "مخطط الوجبات بالذكاء الاصطناعي" : "AI Meal Planner"}
                body={
                  isAr
                    ? "خطة يوم كاملة منظمة، وليست مجرد اقتراحات وجبات: كل وجبة بأصنافها المحددة وكمياتها بالغرامات وسعراتها المحسوبة — تتولد في ثوانٍ وفق هدفك ونظامك الغذائي."
                    : "A structured full-day plan, not just meal suggestions: every meal with its specific foods, portions in grams, and calculated calories — generated in seconds around your goal and diet system."
                }
                cta={isAr ? "أنشئ خطتي" : "Create My Plan"}
              />
            </Reveal>
            {/* Card 3 — EVO, the AI coach (chat button → floating widget). */}
            <Reveal delay={160} className="h-full">
              <EvoCard isAr={isAr} />
            </Reveal>
          </div>
          {/* The bento close — the honest free-allowance line at the
              point of action (the unified plan pool; guests included). */}
          <Reveal delay={200}>
            <div className="marble-card mt-4 flex flex-col items-center justify-between gap-3 px-5 py-4 text-center md:mt-5 md:flex-row md:gap-4 md:text-start">
              <p className="text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
                {c.planAllowance}
              </p>
              <span className="seal-chip shrink-0 py-1! text-[11px]!">
                <EngravedIcon name="macros" alt="" size={12} className="h-3 w-3" />
                {c.planAllowanceChip}
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================== 9. LEARN — the latest articles (R6) =====================
          The simple title the owner asked for («أحدث المقالات»), and
          the carousel is LATEST-FIRST: the newest posts actually lead
          the row (featured posts fill the rest; featured slugs keep
          the dark lead-card styling). The section renders only when
          posts loaded (the needsPosts law). */}
      {latestPosts.length > 0 && (
        <section id="learn" className="scroll-mt-20 bg-[var(--bg)] px-4 py-10 md:py-20">
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {c.learnTitle}
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
                {c.learnCta}
                <span className="chev rtl:rotate-180" aria-hidden="true">›</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Greek meander divider — the TWO narrative acts law: exploration
          ends here, the services act begins. */}
      <div className="meander-divider" aria-hidden="true" />

      {/* ===================== 10. MEMBERSHIPS — small cards (R7) =====================
          The compact treatment the owner asked for: SMALL attractive
          membership cards + one online-coaching card. Prices derive
          from memberships.ts (single source — no literals); the free
          card routes to signup, premium/pro to the memberships page;
          the coaching card (the dark marble + chrome ring) carries the
          section's single filled CTA. */}
      <section id="memberships" className="scroll-mt-20 bg-[var(--bg)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            {/* VRD-V8R: the section gains the page's eyebrow rhythm —
                and names the WHOLE services act (memberships + the
                coaching band below). */}
            <span className="seal-chip">
              <EngravedIcon name="laurel" alt="" size={12} className="h-3 w-3" />
              {c.membershipsEyebrow}
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              {c.membershipsTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {c.membershipsBody}
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
                {/* VRD-V8R: the tier's REAL facts (memberships.ts limits)
                    replace the free-prose one-liner — scannable value,
                    zero invented claims. */}
                <TierFeatureRows
                  rows={
                    isAr
                      ? ["كل المكتبات والأدوات", "توليدان شهريًا للخطط الذكية", "EVO: 10 رسائل/يوم"]
                      : ["Every library and tool", "2 AI plans a month", "EVO: 10 messages/day"]
                  }
                />
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
                  <TierFeatureRows
                    pinDark
                    rows={
                      isAr
                        ? ["كل مزايا المستوى المجاني", "EVO بلا حدود ومحادثة متزامنة", "4 خطط شهريًا وتصدير كامل"]
                        : ["Everything in the Free tier", "Unlimited EVO, synced chat", "4 plans a month, full export"]
                    }
                  />
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
                <TierFeatureRows
                  rows={
                    isAr
                      ? ["كل مزايا البريميوم", "8 خطط شهريًا", "تجربة بلا إعلانات"]
                      : ["Everything in Premium", "8 plans a month", "Ad-free experience"]
                  }
                />
                <p className="chrome-text mt-4 text-sm font-semibold">
                  {isAr ? "التفاصيل ›" : "See details ›"}
                </p>
              </a>
            </Reveal>
          </div>

          {/* The online-coaching card — the human service, separate from
              the memberships (the terminology law), carrying the
              section's ONE filled CTA. VRD-V6 (hierarchy fix, VLM
              audit #7): the card drops the dark-marble fill for a
              LIGHT service band (--tint + --edge hairline) so the
              PREMIUM card becomes the section's single dark anchor —
              the «two black surfaces, muddy hierarchy» blur is gone.
              Copy, links, price source, and the chrome CTA stay
              byte-identical (the 273 canary pins the CTA recipe). */}
          <Reveal delay={200} className="mt-4 md:mt-5">
            <div className="relative overflow-hidden rounded-[var(--radius-chrome)] border border-[var(--edge)] bg-[var(--tint)] p-5 md:p-7">
              <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>
                    {c.coachingTitle}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
                    {c.coachingBody}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
                  <span className="chrome-text text-2xl font-bold">
                    {coachingPriceLabel}
                    <span className="text-xs font-medium" style={{ color: PALETTE.textMuted }}>
                      {isAr ? " / شهريًا" : " /mo"}
                    </span>
                  </span>
                  <a href={isAr ? "/ar/coaching" : "/coaching"} className="btn-chrome px-6 py-2.5 text-sm font-medium">
                    {c.coachingCta}
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
              {c.coachesTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-center text-base font-normal" style={{ color: PALETTE.textSec }}>
              {c.coachesBody}
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
      <section id="faq" className="scroll-mt-20 border-t border-[var(--edge)] bg-[var(--tint)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          {/* VRD-V8R: the closer section gains the page's eyebrow rhythm
              and a finished surface — the accordion sits inside a
              marble-card instead of floating on the band. */}
          <Reveal className="text-center">
            <span className="seal-chip">
              <EngravedIcon name="scroll" alt="" size={12} className="h-3 w-3" />
              {c.faqEyebrow}
            </span>
            <h2 className="mt-5 text-center text-3xl font-semibold tracking-tight md:text-4xl">
              {c.faqTitle}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <Accordion
              type="single"
              collapsible
              className="marble-card mt-8 p-2 md:mt-10 md:p-4 [&>*:last-child]:border-b-0"
            >
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
          </Reveal>
        </div>
      </section>

      {/* ===================== FOOTER — the SHARED SiteFooter component;
          every public page renders the identical footer (HOME-REFINE-270
          R9: flat, fully displayed — no disclosure groups). ===================== */}
      <SiteFooter />
    </div>
  );
}
