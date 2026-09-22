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
// Site palette — Gemini-card palette extended to all landing sections
// All tokens meet WCAG AAA (≥7:1) on their intended backgrounds
// ============================================================
const PALETTE = {
  // Phase 126 «Marble & Chrome» (owner directive 2026-09-06): the identity is
  // a monochrome marble + chrome system defined as CSS VARIABLES in
  // globals.css (:root + [data-theme="dark"]) — every value below resolves
  // through a var so the whole page re-themes WITHOUT re-render. --ai cyan
  // is reserved for AI-assistant surfaces only.
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
// Phase 195: content-volume counts derive from the client-safe
// verified constants (pinned to the real arrays by
// library-counts.test.ts; TOOLS_COUNT derives from the hub array in
// tools-shared.ts) — when the platform grows, these labels grow with
// it. "+" marks CONTENT VOLUME only.
// ============================================================
const EX_PLUS = `${EXERCISES_COUNT.toLocaleString("en-US")}+`;
const FOODS_PLUS = `${FOODS_COUNT.toLocaleString("en-US")}+`;
const TOOLS_PLUS = `${TOOLS_COUNT}+`;

// ============================================================
// HOME-REDESIGN-256 (owner order 2026-09-22): the homepage becomes an
// 8-section discovery flow — Hero («ابنِ لياقتك. بطريقتك.») → Explore
// Alkemos (Exercises / Nutrition / Tools / Articles) → EVO («مدربك
// الذكي») → Training + Nutrition (ONE connected experience) → Content
// & Knowledge → Memberships & Coaching (NO prices on the homepage) →
// FAQ → Final CTA («ابدأ رحلتك مع Alkemos»).
//
// PRESERVED VERBATIM from the previous phases: the Marble & Chrome
// identity (recipes + engraved icons + zero emoji), the Phase 202 real
// content entry points (getHomeSamples server slices), the Phase 203
// account-driven CTA law, the EVO CHAT SURFACE LAW (the floating
// widget stays the only chat surface — the section CTA dispatches
// openEvoFloatingChat), the blog selection logic
// (selectHomeBlogCarousels), the paid featured-coaches strip (0037),
// and the FAQ JSON-LD single source. Arabic and English copy are
// written independently — natural MSA / natural international fitness
// English — never sentence-by-sentence translation.
// ============================================================

// Disabled Reveal — animations were causing jarring "shake" effects
// during scroll. Now just renders children directly without any
// opacity/transform animation.
function Reveal({
  children,
  className = "",
  delay: _delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return <div className={className}>{children}</div>;
}

function BlogCarousel({
  posts,
  featuredSlugs = [],
  isAr,
}: {
  posts: BlogPostCard[];
  /** Phase 198 Batch 2 (audit H2): slugs rendered as the dark featured
      card — the old two-section Latest+Featured split is ONE carousel
      now (dark featured cards lead the row). Selection logic
      (selectHomeBlogCarousels) is untouched — display-only merge. */
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
          className="grid h-9 w-9 place-items-center rounded-full transition-colors"
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
          className="grid h-9 w-9 place-items-center rounded-full transition-colors"
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
            className="marble-card group block shrink-0 transition-transform duration-300 hover:-translate-y-0.5"
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

export function LandingView({ samples }: { samples: HomeSamples }) {
  const { lang } = useI18n();
  const { isCoach, isAdmin, profile } = useAuth();
  const isAr = lang === "ar";
  // Phase 203 (owner-approved copy refinement 2026-09-15): the hero CTA
  // is account-driven — guests get signup/login, signed-in members get
  // their own console. Destination resolution mirrors the header's account
  // icon law (staff → admin, coach → coach console, member → dashboard).
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
    // PHASE 182: this fetch pulls the Supabase client chunk on demand —
    // defer to idle so it never competes with LCP/INP on slow networks.
    deferIdle(() => {
      void (async () => {
        const posts = await listBlogPosts(lang);
        // Phase 118 (owner directive 2026-09-04): selection is delegated
        // to selectHomeBlogCarousels (src/lib/blog.ts): featured excludes
        // ONLY what the latest carousel shows at this moment and rotates
        // deterministically every UTC day through the whole pool.
        const { latest, featured } = selectHomeBlogCarousels(posts);
        setLatestPosts(latest);
        setFeaturedPosts(featured);
      })();
    }, 2500);
  }, [lang]);

  const blogHref = isCoach ? "/admin/blog" : isAr ? "/ar/blog" : "/blog";

  // FAQ schema for SEO.
  // HOME-REDESIGN-256: the five verified usage questions stay (every limit
  // matches the implementation verbatim — unified plan pool, guest
  // persistence, EVO availability, RLS law) + ONE new coaching question
  // whose answer mirrors memberships.ts coaching features exactly (no
  // prices on the homepage — pricing lives on the memberships and
  // coaching pages).
  // The FAQPage JSON-LD derives from the same array (single source law).
  const faqs = [
    { q: isAr ? "هل أحتاج حسابًا أو اشتراكًا لاستخدام الأدوات؟" : "Do I need an account or subscription to use the tools?", a: isAr ? `لا — جميع أدوات المنصة (${TOOLS_COUNT} أدوات: الحاسبات، ومخطط الوجبات، ومولّدا الخطط بالذكاء الاصطناعي) مجانية بالكامل وتعمل دون تسجيل.` : `No — all ${TOOLS_COUNT} tools (the calculators, the meal planner, and the two AI planners) are completely free to use without an account.` },
    { q: isAr ? "هل يمكنني تجربة توليد الخطط بالذكاء الاصطناعي مجانًا؟" : "Can I try AI plan generation for free?", a: isAr ? "نعم — كل زائر يملك رصيدًا شهريًا موحدًا يجمع خطط التغذية والتمارين معًا (توليدان ناجحان شهريًا) دون تسجيل، ويُحتسب التوليد الناجح فقط؛ أما المحاولات الفاشلة فلا تستهلك الرصيد."
      : "Yes — every visitor gets one unified monthly pool for nutrition and workout plans combined (2 successful generations) with no signup. Only successful generations count; failed attempts never touch your balance." },
    { q: isAr ? "هل تختفي خطتي إذا لم أنشئ حسابًا؟" : "Will my plan disappear if I don't create an account?", a: isAr ? "لا — خطتك تبقى على هذا الجهاز في التنقل والتحديث، ولا تختفي عند نفاد رصيد الشهر. وبحساب مجاني تُحفظ كل خطة تولّدها في حسابك بشكل دائم وتتزامن عبر أجهزتك."
      : "No — your plan stays on this device across navigation and refreshes, and never disappears when the month's quota runs out. With a free account, every plan you generate is saved to your account permanently and synced across your devices." },
    { q: isAr ? "ما هو EVO؟" : "What is EVO?", a: isAr ? "EVO هو مدربك الذكي داخل المنصة — تراه كفقاعة محادثة في كل صفحة. اسأله عن التدريب والتغذية أو اطلب منه بناء خطة، وهو متاح للجميع بمن فيهم الزوار وفق حدود الاستخدام."
      : "EVO is the AI coach built into Alkemos — you'll see it as a chat bubble on every page. Ask it about training or nutrition, or have it build a plan for you. It's available to everyone, visitors included, with tier-based limits." },
    { q: isAr ? "كيف يعمل الكوتشينج أونلاين؟" : "How does online coaching work?", a: isAr ? "باقة الكوتشينج تمنحك مدربًا بشريًا يبني خطط التغذية والتمارين، ويتابع تقدمك أسبوعيًا، ويبقى على تواصل مباشر معك — مع كل مزايا Pro. التفاصيل الكاملة على صفحة الكوتشينج."
      : "Coaching gives you a human coach who builds your nutrition and workout plans, follows your progress weekly, and stays in direct contact with you — with all Pro features included. Full details live on the coaching page." },
    { q: isAr ? "هل بياناتي آمنة؟" : "Is my data safe?", a: isAr ? "نعم — الوصول إلى بياناتك محكوم على مستوى قاعدة البيانات نفسها: لا يطّلع عليها إلا أنت، والمدرب المعيّن لك إن وُجد، وفريق المنصة المصرّح له عند الحاجة للدعم والتشغيل."
      : "Yes — access to your data is controlled at the database level itself: only you can view it, along with the coach assigned to you (if any) and the authorized platform team when needed for support and operations." },
  ];
  const faqSchema = getFAQSchema(faqs);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* FAQ Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}
      />

      <SiteHeader variant="landing" />

      {/* ===================== 1. HERO — «ابنِ لياقتك. بطريقتك.» =====================
          HOME-REDESIGN-256: the Phase 131 overlay scene is brand identity
          and stays (artwork + chrome logo + H1 + subtitle + account CTA +
          seal chips). The H1 is the owner's new positioning line — the
          Arabic is the ORIGINAL, the English is its native counterpart
          (not a translation). The CTA stays account-driven (Phase 203). */}
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
        {/* Content overlay — logo + H1 + seal chips, centered in the artwork */}
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
          <h1 className="hero-copy font-display mt-3 text-2xl font-semibold leading-tight tracking-tight md:mt-5 md:text-5xl lg:text-6xl" style={{ color: PALETTE.textPrim }}>
            {isAr ? "ابنِ لياقتك. بطريقتك." : "Build your fitness. Your way."}
          </h1>
          <p className="hero-copy mx-auto mt-3 max-w-xl text-sm font-normal leading-relaxed md:mt-4 md:text-base" style={{ color: PALETTE.textSec }}>
            {/* Real counts ride the shared constants — the library grows and
                the copy follows (Phase 195 owner directive). */}
            {isAr
              ? `أدوات مجانية تعمل دون تسجيل، و${EX_PLUS} تمرينًا بالشرح والصور، و${FOODS_PLUS} صنف غذائي بالقيم الغذائية، وEVO مدرب ذكي يرافقك في كل خطوة — ابدأ مجانًا، وأنشئ حسابًا فقط لحفظ خططك ومزامنتها عبر أجهزتك.`
              : `Free tools that work without an account, ${EX_PLUS} exercises with step-by-step instructions, ${FOODS_PLUS} foods with full nutrition data, and EVO, an AI coach that adapts as you progress. Start free — create an account only to save and sync your plans.`}
          </p>

          {/* Account-action CTA pair (Phase 203 law unchanged): guests get
              ONE primary chrome button → signup + ONE quiet login link;
              signed-in members get their own console. */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 md:mt-6">
            {isLoggedIn ? (
              <a href={memberHref} className="btn-chrome px-7 py-3 text-sm md:px-8 md:py-3.5 md:text-base">
                {isAr ? "انتقل إلى لوحة التحكم" : "Go to your dashboard"}
                <span className="rtl:rotate-180">›</span>
              </a>
            ) : (
              <>
                <a href="/auth?mode=signup" className="btn-chrome px-7 py-3 text-sm md:px-8 md:py-3.5 md:text-base">
                  {isAr ? "أنشئ حسابك المجاني" : "Create your free account"}
                  <span className="rtl:rotate-180">›</span>
                </a>
                <a
                  href="/auth?mode=login"
                  className="text-sm font-medium underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70"
                  style={{ color: PALETTE.textSec }}
                >
                  {isAr ? "تسجيل الدخول" : "Log in"}
                </a>
              </>
            )}
          </div>

          {/* Stat chips — engraved seals (mission §3), hero-scoped smaller
              (.hero-seals in globals.css). Proof of depth, not offers. */}
          <div className="hero-seals mt-4 flex flex-wrap items-center justify-center gap-2 md:mt-6 md:gap-3">
            <span className="seal-chip">
              <EngravedIcon name="dumbbell" alt="" size={14} className="h-3 w-3" />
              {isAr ? `${EX_PLUS} تمرينًا` : `${EX_PLUS} EXERCISES`}
            </span>
            <span className="seal-chip">
              <EngravedIcon name="hydration" alt="" size={14} className="h-3 w-3" />
              {isAr ? `${FOODS_PLUS} صنف غذائي بالسعرات والماكروز` : `${FOODS_PLUS} foods with calories & macros`}
            </span>
            <span className="seal-chip">
              <EngravedIcon name="calories" alt="" size={14} className="h-3 w-3" />
              {isAr ? `${TOOLS_COUNT} أدوات مجانية` : `${TOOLS_COUNT} FREE TOOLS`}
            </span>
            <span className="seal-chip">
              <EngravedIcon name="evo" alt="" size={14} className="h-3 w-3" />
              {isAr ? "EVO — مدرب ذكاء اصطناعي، متاح 24/7" : "EVO — AI coach, available 24/7"}
            </span>
          </div>
        </div>
      </section>

      {/* Greek meander divider — mission §4 */}
      <div className="meander-divider" aria-hidden="true" />

      {/* ===================== 2. EXPLORE ALKEMOS =====================
          The page's discovery hub (HOME-REDESIGN-256 section 2): four
          real doors into the platform — Exercises / Nutrition / Tools /
          Articles. Each card is a full-link into its live hub, carries
          its engraved icon + a real volume chip (dynamic constants),
          and one plain-language description. Replaces the retired
          quick-nav chips row (anchors → real routes). */}
      <section id="explore" className="scroll-mt-20 bg-[var(--bg)] px-4 py-12 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "استكشف Alkemos" : "Explore Alkemos"}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "أربعة أبواب إلى كل ما تقدمه المنصة — ابدأ من حيث يناسبك."
                : "Four doors into everything the platform offers — start wherever it suits you."}
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {(isAr
              ? [
                  { icon: "dumbbell", title: "التمارين", desc: "تمارين لكل مجموعة عضلية بشرح واضح وصور توضح الأداء الصحيح.", stat: `${EX_PLUS} تمرين`, link: "تصفح التمارين ›", href: "/ar/exercises" },
                  { icon: "protein", title: "التغذية", desc: "أطعمة بقيمها الكاملة: سعرات وبروتين وكربوهيدرات ودهون لكل 100 جرام.", stat: `${FOODS_PLUS} صنف`, link: "تصفح الأطعمة ›", href: "/ar/foods" },
                  { icon: "calories", title: "أدوات مجانية", desc: "حاسبات ومخططات جاهزة تعطيك أهدافك اليومية في دقائق — دون تسجيل.", stat: `${TOOLS_PLUS} أدوات`, link: "افتح الأدوات ›", href: "/ar/tools" },
                  { icon: "scroll", title: "المقالات", desc: "التدريب والتغذية بأسلوب علمي واضح يخدم رحلتك.", stat: "جديدة أسبوعيًا", link: "اقرأ المقالات ›", href: "/ar/blog" },
                ]
              : [
                  { icon: "dumbbell", title: "Exercises", desc: "Step-by-step instructions and clear images for every muscle group.", stat: `${EX_PLUS} exercises`, link: "Browse exercises ›", href: "/exercises" },
                  { icon: "protein", title: "Nutrition", desc: "Calories, protein, carbs, and fat for every food — per 100g.", stat: `${FOODS_PLUS} foods`, link: "Browse foods ›", href: "/foods" },
                  { icon: "calories", title: "Free tools", desc: "Calculators and planners that hand you your daily targets in minutes — no signup.", stat: `${TOOLS_PLUS} tools`, link: "Open the tools ›", href: "/tools" },
                  { icon: "scroll", title: "Articles", desc: "Training and nutrition explained clearly, the way it matters to your journey.", stat: "New every week", link: "Read the articles ›", href: "/blog" },
                ]
            ).map((card) => (
              <Reveal key={card.title}>
                <a
                  href={card.href}
                  className="marble-card group flex h-full flex-col p-5 transition-transform duration-300 hover:-translate-y-0.5 md:p-6"
                >
                  <EngravedIcon name={card.icon} alt="" size={48} className="h-12 w-12 shrink-0" />
                  <h3 className="mt-4 text-lg font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>
                    {card.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
                    {card.desc}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="seal-chip py-1! text-[10px]!">{card.stat}</span>
                    <span className="chrome-text shrink-0 text-sm font-semibold">{card.link}</span>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== 3. EVO — مدربك الذكي =====================
          HOME-REDESIGN-256 section 3 (owner order): EVO gets ONE section
          that introduces the smart coach — while the EVO CHAT SURFACE LAW
          (2026-08-27) stays untouched: the floating widget is the only
          chat surface and this section's CTA opens it via
          openEvoFloatingChat(). The card revives the Phase 127 warrior-art
          recipe: text on the inline-start, warrior art dissolving into
          the marble on the inline-end (.evo-art-mask, mirrored in RTL).
          Quiet secondary link → the full /evo page. */}
      <section id="evo" className="scroll-mt-20 bg-[var(--tint)] px-4 py-12 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="marble-card marble-card--unclipped relative overflow-hidden p-6 md:p-10 lg:p-12">
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
                <EngravedIcon name="laurel" alt="" size={12} className="h-3 w-3" />
                {isAr ? "مدربك الذكي" : "YOUR AI COACH"}
              </span>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
                {isAr ? "EVO — مدربك الذكي" : "EVO — Your AI Coach"}
              </h2>
              <p className="mt-4 text-base font-normal leading-relaxed md:text-lg" style={{ color: PALETTE.textSec }}>
                {isAr
                  ? "EVO مدرب ذكي داخل Alkemos: اسأله عن التدريب والتغذية، أو اطلب منه بناء خطة تناسب بياناتك وأهدافك، ثم عدّلها بتبديلات ذكية كلما تقدمت. تجده في فقاعة المحادثة أسفل كل صفحة."
                  : "EVO is the smart coach built into Alkemos. Ask it about training or nutrition, have it build a plan around your data and goals, then refine it with smart swaps as you progress. You'll find it in the chat bubble on every page."}
              </p>
              <div className="mt-6 space-y-4">
                {(isAr
                  ? [
                      { n: "01", t: "إجابات على قياس بياناتك", d: "يجيب بناءً على أهدافك وقياساتك، لا بإجابات عامة تناسب الجميع." },
                      { n: "02", t: "خطط تتعدّل معك", d: "استبدل أي وجبة أو تمرينًا ببديل يناسب مستواك ومعداتك بضغطة واحدة." },
                      { n: "03", t: "متاح للجميع", d: "ابدأ المحادثة فورًا دون تسجيل — والمشتركون يحصلون على رصيد أكبر ومزايا أعمق." },
                    ]
                  : [
                      { n: "01", t: "Answers sized to your data", d: "Responses shaped by your goals and measurements — not one-size-fits-all advice." },
                      { n: "02", t: "Plans that move with you", d: "Swap any meal or exercise for an alternative that matches your level and equipment." },
                      { n: "03", t: "Open to everyone", d: "Start chatting instantly — no signup. Subscribers unlock a bigger allowance and deeper features." },
                    ]
                ).map((cap) => (
                  <div key={cap.n} className="flex items-start gap-4">
                    <span className="chrome-text shrink-0 text-lg font-semibold leading-snug">{cap.n}</span>
                    <div>
                      <p className="text-base font-semibold" style={{ color: PALETTE.textPrim }}>{cap.t}</p>
                      <p className="mt-1 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>{cap.d}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* EVO CHAT SURFACE LAW: the button OPENS THE WIDGET — it is
                  not a link to a chat page (the /chat route is retired). */}
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                <button
                  type="button"
                  onClick={openEvoFloatingChat}
                  className="btn-chrome inline-flex cursor-pointer items-center gap-3 px-6 py-3 text-sm md:text-base"
                >
                  <ThemeImg
                    light="/images/brand/evo-widget-light.webp"
                    dark="/images/brand/evo-widget-dark.webp"
                    alt="EVO"
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span>{isAr ? "تحدث مع EVO" : "Chat with EVO"}</span>
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
        </div>
      </section>

      {/* ===================== 4. TRAINING + NUTRITION — ONE EXPERIENCE =====================
          HOME-REDESIGN-256 section 4 (owner order): the two libraries are
          ONE connected fitness experience now — the section frame says WHY
          they belong together, the training block keeps its real samples
          (muscle chips with live counts + 8 curated lifts + ready-made
          programs), the AI planner card becomes the CONNECTOR between the
          two halves (it literally builds both), and the food database
          closes the loop with its real per-100g samples. All sample data
          arrives as server props (getHomeSamples) — the bundle law holds. */}
      <section id="experience" className="scroll-mt-20 bg-[var(--bg)] px-4 py-12 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "التدريب والتغذية في تجربة واحدة" : "Training and nutrition — one connected experience"}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "العضلة تُبنى بالتمرين وتُغذّى بالطعام — اختر تمارينك، وخطط وجباتك، ودع الخطة الذكية تربط بينهما."
                : "Muscle is built in training and fed in the kitchen — pick your exercises, plan your meals, and let the smart planner connect the two."}
            </p>
          </div>

          {/* ── Training block ── */}
          <div className="mt-12">
            <div className="text-center">
              <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {isAr ? "مكتبة التدريب" : "The Training Library"}
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm font-normal md:text-base" style={{ color: PALETTE.textSec }}>
                {isAr
                  ? `${EX_PLUS} تمرينًا بالشرح والصور لكل مجموعة عضلية، وبرامج جاهزة لكل مستوى.`
                  : `${EX_PLUS} exercises with instructions and images for every muscle group, plus ready-made programs for every level.`}
              </p>
            </div>
            {/* Browse paths above the samples (Phase 203 law preserved):
                muscle-group chips with real counts + ONE All Exercises CTA. */}
            <div className="mt-6">
              <p className="text-center text-xs font-semibold uppercase tracking-wider" style={{ color: PALETTE.textMuted }}>
                {isAr ? "تصفّح حسب المجموعة العضلية" : "Browse by muscle group"}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {[
                  { labelAr: "صدر", labelEn: "Chest", slug: "chest" },
                  { labelAr: "ظهر", labelEn: "Back", slug: "back" },
                  { labelAr: "أكتاف", labelEn: "Shoulders", slug: "shoulders" },
                  { labelAr: "أرجل", labelEn: "Legs", slug: "legs" },
                  { labelAr: "بايسبس", labelEn: "Biceps", slug: "biceps" },
                  { labelAr: "ترايسبس", labelEn: "Triceps", slug: "triceps" },
                  { labelAr: "بطن/كور", labelEn: "Core", slug: "core" },
                ].map((cat) => (
                  <a
                    key={cat.slug}
                    href={`${isAr ? "/ar" : ""}/exercises?cat=${cat.slug}`}
                    className="seal-chip transition-transform duration-300 hover:-translate-y-0.5"
                    title={isAr ? `${EXERCISE_CATEGORY_COUNTS[cat.slug] ?? 0} تمرينًا` : `${EXERCISE_CATEGORY_COUNTS[cat.slug] ?? 0} exercises`}
                  >
                    {isAr ? cat.labelAr : cat.labelEn}
                    <span className="font-semibold">{EXERCISE_CATEGORY_COUNTS[cat.slug] ?? 0}</span>
                  </a>
                ))}
              </div>
              <div className="mt-5 text-center">
                <a
                  href={isAr ? "/ar/exercises" : "/exercises"}
                  className="btn-outline px-6 py-2.5 text-sm font-medium"
                >
                  {isAr ? "كل التمارين" : "All Exercises"}
                  <span className="rtl:rotate-180" aria-hidden="true">›</span>
                </a>
              </div>
            </div>
            {/* REAL exercise samples — 8 curated lifts (one per muscle
                family), each card links to its /exercises/[slug] page. */}
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {samples.exercises.map((ex) => (
                <LandingExerciseCard key={ex.slug} ex={ex} isAr={isAr} />
              ))}
            </div>

            {/* REAL program samples — 3 curated programs from the live
                WORKOUT_PROGRAMS array (real images, real splits). */}
            <div className="mt-14 text-center">
              <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {isAr ? "برامج جاهزة لكل مستوى" : "Ready-Made Programs for Every Level"}
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-sm font-normal md:text-base" style={{ color: PALETTE.textSec }}>
                {isAr
                  ? "برامج كاملة بجدول أسبوعي وتمارين ومجموعات — اتبعها كما هي أو اجعلها نقطة البداية."
                  : "Complete programs with a weekly schedule, exercises, and sets — follow them as-is or make them your starting point."}
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {samples.programs.map((prog) => (
                <LandingProgramCard key={prog.slug} prog={prog} isAr={isAr} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <a href={isAr ? "/ar/programs" : "/programs"} className="text-sm font-semibold underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70" style={{ color: PALETTE.textPrim }}>
                {isAr ? "كل البرامج ›" : "View all programs ›"}
              </a>
            </div>
          </div>

          {/* ── The connector — ONE AI plan for both halves ──
              The AI planner card (the flagship free entry, Phase 185/194
              benefit-first copy preserved in spirit) now sits BETWEEN the
              training and nutrition blocks: it is the bridge that turns
              two libraries into one experience. */}
          <Reveal delay={100}>
            <div className="marble-card mt-14 p-6 md:p-8">
              <div className="flex flex-col items-center gap-5 text-center md:flex-row md:text-start">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-[var(--edge)] bg-[var(--tint)]">
                  <EngravedIcon name="evo" alt="" size={30} className="h-7 w-7" />
                </span>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold tracking-tight md:text-2xl" style={{ color: PALETTE.textPrim }}>
                    {isAr ? "خطة واحدة تجمع التدريب والتغذية" : "One plan for training and nutrition"}
                  </h3>
                  <p className="mt-2 text-sm font-normal leading-relaxed md:text-base" style={{ color: PALETTE.textSec }}>
                    {isAr
                      ? "أنشئ خطة تغذية وتمارين مخصصة لأهدافك وبياناتك وتفضيلاتك — ثم طوّرها مع تقدمك."
                      : "Generate a nutrition and workout plan built around your goals, body, and preferences — then adjust it as you progress."}
                  </p>
                  <p className="mt-2 text-xs font-normal leading-relaxed md:text-sm" style={{ color: PALETTE.textMuted }}>
                    {isAr
                      ? "تعمل دون تسجيل وتبقى خطتك على جهازك — وبحساب مجاني تُحفظ وتتزامن عبر أجهزتك."
                      : "Works without an account — your plan stays on this device. A free account saves and syncs it everywhere."}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <a href={isAr ? "/ar/ai-meal-planner" : "/ai-meal-planner"} className="btn-chrome px-5 py-2.5 text-sm">
                    {isAr ? "أنشئ خطتي" : "Create My Plan"}
                  </a>
                  <a href={isAr ? "/ar/ai-workout-planner" : "/ai-workout-planner"} className="btn-outline px-5 py-2.5 text-sm font-normal">
                    {isAr ? "مخطط التمارين الذكي ›" : "AI Workout Planner ›"}
                  </a>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── Nutrition block ── */}
          <div className="mt-14">
            <div className="text-center">
              <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {isAr ? "قاعدة الأطعمة — بالسعرات والماكروز" : "The Food Database — Calories & Macros"}
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm font-normal md:text-base" style={{ color: PALETTE.textSec }}>
                {isAr
                  ? `${FOODS_PLUS} صنفًا غذائيًا بسعراته وماكروزه لكل 100 جرام — ابنِ وجباتك بمعرفة كاملة.`
                  : `${FOODS_PLUS} foods with calories and macros per 100g — build your meals knowing exactly what goes in.`}
              </p>
            </div>
            {/* REAL food samples — 8 curated staples spanning the food
                families, same macro presentation as the /foods explorer. */}
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {samples.foods.map((food) => (
                <LandingFoodCard key={food.slug} food={food} isAr={isAr} />
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
              <a href={isAr ? "/ar/foods" : "/foods"} className="text-sm font-semibold underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70" style={{ color: PALETTE.textPrim }}>
                {isAr ? "تصفّح كل الأطعمة ›" : "Browse all foods ›"}
              </a>
              <a href={isAr ? "/ar/meal-planner" : "/meal-planner"} className="text-sm font-semibold underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70" style={{ color: PALETTE.textPrim }}>
                {isAr ? "ابنِ وجباتك في مخطط الوجبات ›" : "Build meals in the Meal Planner ›"}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== 5. CONTENT & KNOWLEDGE =====================
          HOME-REDESIGN-256 section 5: the blog stays a first-class part
          of the experience (Phase 202 owner order). Selection logic
          (selectHomeBlogCarousels) untouched; the whole section renders
          only when posts loaded (the needsPosts law). */}
      {latestPosts.length > 0 && (
        <section id="knowledge" className="scroll-mt-20 bg-[var(--tint)] px-4 py-12 md:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {isAr ? "المحتوى والمعرفة" : "Content & Knowledge"}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
                {isAr
                  ? "مقالات تشرح ما يهم رحلتك فعلًا — من أساسيات التدريب إلى تفاصيل التغذية — وتُنشر أسبوعيًا بالعربية والإنجليزية."
                  : "Articles that explain what actually matters for your journey — training fundamentals to nutrition details — published weekly in English and Arabic."}
              </p>
            </div>
            {/* ONE carousel — featured posts lead the row as dark cards,
                latest follows (Phase 198 Batch 2, audit H2). */}
            <div className="mt-10">
              <BlogCarousel
                posts={[...featuredPosts, ...latestPosts].slice(0, 10)}
                featuredSlugs={featuredPosts.map((p) => p.slug)}
                isAr={isAr}
              />
            </div>
            <div className="mt-6 text-center">
              <a href={blogHref} className="text-sm font-semibold underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70" style={{ color: PALETTE.textPrim }}>
                {isAr ? "كل المقالات ›" : "View all articles ›"}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Greek meander divider — the TWO narrative acts law (Phase 201):
          exploration ends here, the services act begins. */}
      <div className="meander-divider" aria-hidden="true" />

      {/* ===================== 6. MEMBERSHIPS & COACHING — NO PRICES =====================
          HOME-REDESIGN-256 section 6 (owner order): ONE section combining
          memberships + online coaching. The four real tiers render from
          the single source (memberships.ts — taglines + feature lists,
          display strings only) with NO prices anywhere — pricing and the
          subscribe flows stay on /memberships and /coaching (both remain
          reachable from the header drawer and the footer). One focused
          CTA pair closes the section. The paid featured-coaches strip
          (0037) follows — it renders only when active ads exist. */}
      <section id="memberships" className="scroll-mt-20 bg-[var(--bg)] px-4 py-12 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "الباقات والكوتشينج" : "Memberships & Coaching"}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "ابدأ مجانًا وارتقِ متى احتجت — كل باقة تفتح قدرات أوسع، وباقة الكوتشينج تضع مدربًا بشريًا إلى جانبك."
                : "Start free and level up when you're ready — each membership unlocks more room to work, and Coaching puts a human coach in your corner."}
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MEMBERSHIPS.map((tier) => {
              const isPro = tier.id === "pro";
              const isCoaching = tier.id === "coaching";
              const isFree = tier.id === "free";
              const features = isAr ? tier.features : tier.featuresEn;
              return (
                <div
                  key={tier.id}
                  className={`marble-card marble-card--unclipped relative flex flex-col p-6 ${isPro ? "text-[#F5F5F7]" : ""}`}
                  style={
                    isPro
                      ? {
                          backgroundColor: "#0B0B0D",
                          color: "#F5F5F7",
                          border: "2px solid transparent",
                          backgroundImage:
                            "linear-gradient(#0B0B0D, #0B0B0D), linear-gradient(145deg, #FDFDFD 0%, #C9CED3 35%, #878E94 50%, #E6E9EC 70%, #9AA0A6 100%)",
                          backgroundOrigin: "border-box",
                          backgroundClip: "padding-box, border-box",
                        }
                      : undefined
                  }
                >
                  {isPro && (
                    <span className="seal-chip absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0B0B0D]" style={{ color: "#F5F5F7", borderColor: "#3A3F45" }}>
                      <EngravedIcon name="laurel" alt="" size={12} className="h-3 w-3" />
                      {isAr ? "موصى بها" : "Recommended"}
                    </span>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-bold tracking-tight">{isAr ? tier.nameAr : tier.nameEn}</h3>
                    {isFree && <span className="seal-chip py-1! text-[10px]!">{isAr ? "مجاني للأبد" : "Free forever"}</span>}
                  </div>
                  {isCoaching && (
                    <span className="seal-chip mt-2 py-1! text-[10px]!">
                      <EngravedIcon name="laurel" alt="" size={11} className="h-3 w-3" />
                      {isAr ? "كوتشينج أونلاين" : "ONLINE COACHING"}
                    </span>
                  )}
                  <p className={`mt-2 text-xs font-normal leading-relaxed ${isPro ? "text-[#9BA0A6]" : ""}`} style={isPro ? undefined : { color: PALETTE.textSec }}>
                    {isAr ? tier.taglineAr : tier.taglineEn}
                  </p>
                  <ul className="mt-4 flex-1 space-y-2.5">
                    {features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs font-normal leading-relaxed" style={isPro ? { color: "#C9CED3" } : { color: PALETTE.textSec }}>
                        <EngravedIcon name="checkseal" alt="" size={14} className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {isPro && <p className="mt-4 text-[11px] font-normal" style={{ color: "#9BA0A6" }}>{isAr ? "كل التفاصيل على صفحة الباقات" : "Full details on the memberships page"}</p>}
                </div>
              );
            })}
          </div>
          {/* ONE focused CTA pair for the whole section — pricing and
              subscribe flows live on the destination pages. */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <a href={isAr ? "/ar/memberships" : "/memberships"} className="btn-chrome px-7 py-3 text-sm md:px-8">
              {isAr ? "اكتشف الباقات" : "See memberships"}
              <span className="rtl:rotate-180">›</span>
            </a>
            <a
              href={isAr ? "/ar/coaching" : "/coaching"}
              className="text-sm font-medium underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70"
              style={{ color: PALETTE.textSec }}
            >
              {isAr ? "تفاصيل الكوتشينج ›" : "Explore coaching ›"}
            </a>
          </div>
        </div>
      </section>

      {/* ===================== 6.5 FEATURED COACHES («أعلن معنا» ads) =====================
          Kept verbatim (0037 paid-ad strip — a real service surface;
          renders only when active ads exist). Labeled as promo spots,
          not an endorsement (§12.50-أ-3). */}
      {featuredCoaches.length > 0 && (
        <section className="bg-[var(--bg)] px-4 pb-12 md:pb-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl" style={{ color: PALETTE.textPrim }}>
              {isAr ? "مدربون على المنصة" : "Featured Coaches on Alkemos"}
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
                    className="marble-card group block p-5 text-center transition-transform duration-300 hover:-translate-y-0.5"
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

      {/* ===================== 7. FAQ — usage questions =====================
          Six verified questions (five carried over + the new coaching
          one) — every claimed limit matches the implementation. The
          FAQPage JSON-LD derives from the same array above. */}
      <section id="faq" className="scroll-mt-20 bg-[var(--tint)] px-4 py-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
            {isAr ? "أسئلة شائعة وإجاباتها" : "Frequently Asked Questions"}
          </h2>
          <Accordion type="single" collapsible className="mt-12">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-[var(--edge)]">
                <AccordionTrigger className="py-5 text-start text-lg font-normal hover:no-underline">
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

      {/* ===================== 8. FINAL CTA — «ابدأ رحلتك مع Alkemos» =====================
          HOME-REDESIGN-256 section 8: one quiet dark-marble band closes
          the page — the Arabic is the owner's exact line, the English is
          its native counterpart. The CTA stays account-driven (the same
          single action as the hero — no new destinations introduced). */}
      <section className="bg-[var(--bg)] px-4 py-12 md:py-20">
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
          <div className="relative flex flex-col items-center px-6 py-12 text-center md:py-16">
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              {isAr ? "ابدأ رحلتك مع Alkemos" : "Start your journey with Alkemos"}
            </h2>
            <p className="mt-4 max-w-xl text-base font-normal leading-relaxed md:text-lg" style={{ color: "#B9BEC4" }}>
              {isAr
                ? "كل ما تحتاجه لبناء لياقتك في مكان واحد — ابدأ اليوم، وتقدّم في وتيرتك."
                : "Everything you need to build your fitness, in one place — start today and move at your own pace."}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
              {isLoggedIn ? (
                <a href={memberHref} className="btn-chrome px-7 py-3 text-sm md:px-8 md:py-3.5 md:text-base">
                  {isAr ? "انتقل إلى لوحة التحكم" : "Go to your dashboard"}
                  <span className="rtl:rotate-180">›</span>
                </a>
              ) : (
                <>
                  <a href="/auth?mode=signup" className="btn-chrome px-7 py-3 text-sm md:px-8 md:py-3.5 md:text-base">
                    {isAr ? "أنشئ حسابك المجاني" : "Create your free account"}
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
          </div>
        </div>
      </section>

      {/* ===================== FOOTER — the SHARED SiteFooter component
          (access-point fix 2026-09-14): every public page renders the
          identical footer. Phase 202 service-family link grid preserved.
          ===================== */}
      <SiteFooter />
    </div>
  );
}

// ─── Helper component prop types (typed instead of legacy `any`) ───

// ─── Helper components (conditional rendering — no display:none in DOM) ───

// ─── HOME-REDESIGN-256: real-content sample cards (exercises / foods /
//     programs). Every card is a plain <a> into its detail page — a real
//     content entry point. The samples arrive as precomputed serializable
//     props from the server (getHomeSamples) — zero library imports here. ───

function LandingExerciseCard({ ex, isAr }: { ex: HomeExerciseSample; isAr: boolean }) {
  const name = isAr ? ex.nameAr : ex.nameEn;
  return (
    <a
      href={`${isAr ? "/ar" : ""}/exercises/${ex.slug}`}
      className="marble-card group flex flex-col transition-transform duration-300 hover:-translate-y-0.5"
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

function LandingFoodCard({ food, isAr }: { food: HomeFoodSample; isAr: boolean }) {
  const name = isAr ? food.nameAr : food.nameEn;
  return (
    <a
      href={`${isAr ? "/ar" : ""}/foods/${food.slug}`}
      className="marble-card group flex flex-col p-4 text-start transition-transform duration-300 hover:-translate-y-0.5"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: PALETTE.textMuted }}>
        {isAr ? food.categoryLabelAr : food.categoryLabelEn}
      </span>
      <h3 className="mt-1 text-base font-semibold leading-tight tracking-tight line-clamp-2" style={{ color: PALETTE.textPrim }}>
        {name}
      </h3>
      {/* Real per-100g numbers from the database — same semantics as the
          /foods explorer cards (calories · protein · carbs). */}
      <div className="mt-3 grid grid-cols-3 gap-1 text-[10px] font-normal">
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
      <p className="chrome-text mt-3 text-xs font-semibold">{isAr ? "اعرض الصنف ›" : "View food ›"}</p>
    </a>
  );
}

function LandingProgramCard({ prog, isAr }: { prog: HomeProgramSample; isAr: boolean }) {
  const name = isAr ? prog.nameAr : prog.nameEn;
  return (
    <a
      href={`${isAr ? "/ar" : ""}/programs/${prog.slug}`}
      className="marble-card group relative flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-0.5"
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
