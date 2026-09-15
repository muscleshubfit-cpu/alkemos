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
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getFAQSchema, jsonLd } from "@/lib/seo";
import Image from "next/image";
import { ThemeImg, EngravedIcon } from "@/components/ThemeImg";
import {
  Bot,
  BookOpen,
  Calculator,
  CircleHelp,
  ClipboardList,
  Dumbbell,
  LineChart,
  Users,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
const CARD = PALETTE;

// ============================================================
// Phase 202 (owner order 2026-09-15): «Homepage حقيقية لموقع Fitness
// Platform هدفه الانتشار والاستخدام» — the homepage is a PRODUCT
// WEBSITE: every service family is a real CONTENT ENTRY POINT with
// actual browsable samples (real exercises, real foods, real
// programs, real articles), not a presentation deck of stat cards.
// Priority order: Discover → Use → Explore. No pricing surfaces.
// ============================================================

// ============================================================
// Quick-nav chips — the page's table of contents (one snap-scroll
// row on phones, centered wrap on md+). Phase 202: the chips follow
// the new section map (Tools leads as the primary free entry point;
// the Memberships chip is retired along with its section).
// ============================================================
type SectionNavItem = {
  id: string;
  labelEn: string;
  labelAr: string;
  titleEn: string;
  titleAr: string;
  icon: LucideIcon;
  primary?: boolean;
  needsPosts?: boolean;
};

const SECTION_NAV: SectionNavItem[] = [
  { id: "tools", labelEn: "Free Tools", labelAr: "أدوات مجانية", titleEn: "Free fitness & nutrition tools — no signup", titleAr: "أدوات لياقة وتغذية مجانية بدون تسجيل", icon: Calculator, primary: true },
  { id: "training", labelEn: "Training", labelAr: "التدريب", titleEn: "Exercise library and ready-made programs", titleAr: "مكتبة التمارين والبرامج الجاهزة", icon: Dumbbell },
  { id: "nutrition", labelEn: "Nutrition", labelAr: "التغذية", titleEn: "Food database with calories and macros", titleAr: "قاعدة الأطعمة بالسعرات والماكروز", icon: Utensils },
  { id: "articles", labelEn: "Articles", labelAr: "المقالات", titleEn: "Scientific fitness articles", titleAr: "مقالات رياضية علمية", icon: BookOpen, needsPosts: true },
  { id: "coaching", labelEn: "Coaching", labelAr: "الكوتشينج", titleEn: "Online coaching with real coaches", titleAr: "كوتشينج أونلاين مع مدربين حقيقيين", icon: Users },
  { id: "faq", labelEn: "FAQ", labelAr: "أسئلة شائعة", titleEn: "Frequently asked questions", titleAr: "أسئلة شائعة", icon: CircleHelp },
];

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
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
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
  // Phase 203 (owner-approved FAQ reselection 2026-09-15): the five REAL
  // pre-use questions a new visitor asks — every limit matches the
  // implementation verbatim (unified plan pool: guests 2 successful
  // generations/month, success-only counting — memberships.ts +
  // tier-limits.ts; guest-plan device persistence — plan-persistence.ts;
  // EVO open to everyone with tier-based limits; database-level access
  // control — the RLS law). The Arabic-support question is retired (a
  // visitor reading the Arabic page never asks it), and the library-count
  // question retired with it — the live seal chips + the section copy
  // answer it better than prose. The FAQPage JSON-LD derives from the
  // same array (single source, Phase 117 law preserved).
  const faqs = [
    { q: isAr ? "هل أحتاج حسابًا أو اشتراكًا لاستخدام الأدوات؟" : "Do I need an account or subscription to use the tools?", a: isAr ? `لا — جميع الأدوات (${TOOLS_COUNT}) مجانية بالكامل وتعمل دون تسجيل: الحاسبات، ومخطط الوجبات، ومولدا خطط الذكاء الاصطناعي.` : `No — all ${TOOLS_COUNT} tools (the calculators, the meal planner, and the two AI planners) are completely free to use without an account.` },
    { q: isAr ? "هل يمكنني تجربة توليد الخطط بالذكاء الاصطناعي مجانًا؟" : "Can I try AI plan generation for free?", a: isAr ? "نعم — كل زائر يملك رصيدًا شهريًا موحدًا يجمع خطط التغذية والتمارين معًا (توليدان ناجحان شهريًا) دون تسجيل، ويُحتسب التوليد الناجح فقط؛ أما المحاولات الفاشلة فلا تستهلك الرصيد."
      : "Yes — every visitor gets one unified monthly pool for nutrition and workout plans combined (2 successful generations) with no signup. Only successful generations count; failed attempts never touch your balance." },
    { q: isAr ? "هل تختفي خطتي إذا لم أنشئ حسابًا؟" : "Will my plan disappear if I don't create an account?", a: isAr ? "لا — خطتك تبقى على هذا الجهاز في التنقل والتحديث، ولا تختفي عند نفاد رصيد الشهر. وبحساب مجاني تُحفظ كل خطة تولّدها في حسابك بشكل دائم وتتزامن عبر أجهزتك."
      : "No — your plan stays on this device across navigation and refreshes, and never disappears when the month's quota runs out. With a free account, every plan you generate is saved to your account permanently and synced across your devices." },
    { q: isAr ? "ما هو EVO؟" : "What is EVO?", a: isAr ? "EVO هو مدربك الذكي داخل المنصة — تراه كفقاعة محادثة في كل صفحة. اسأله عن التدريب والتغذية أو اطلب منه بناء خطة، وهو متاح للجميع بمن فيهم الزوار وفق حدود الاستخدام."
      : "EVO is the AI coach built into Alkemos — you'll see it as a chat bubble on every page. Ask it about training or nutrition, or have it build a plan for you. It's available to everyone, visitors included, with tier-based limits." },
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

      {/* ===================== 1. HERO ===================== */}
      {/* Phase 202 (owner order 2026-09-15: «Hero: تعريف بسيط بـAlkemos
          مع توجيه مباشر لاستخدام الموقع، وليس Sales Pitch»): the hero
          keeps the Phase-131 overlay scene (artwork + logo + H1 + seal
          chips). Phase 203 (owner-approved copy refinement 2026-09-15):
          the CTA pair now drives the ACCOUNT action — signup/login for
          guests, the member's own console when signed in — while the
          USAGE paths stay owned by the quick-nav chip (#tools) and the
          content sections below (no duplicated CTA message). The old
          «Start Free» → /memberships sales CTA stays retired. */}
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
          {/* Phase 194 positioning line (kept verbatim) + the Phase 203
              concrete subtitle — what the platform actually gives a first
              visitor (free tools, real libraries, EVO) and what the free
              account adds. A simple intro, not a sales pitch. */}
          <h1 className="hero-copy font-display mt-3 text-2xl font-semibold leading-tight tracking-tight md:mt-5 md:text-5xl lg:text-6xl" style={{ color: PALETTE.textPrim }}>
            {isAr ? "تدرّب بذكاء، كُل بوعي، وتقدّم نحو هدفك كل يوم." : "Train smarter. Eat smarter. Progress with numbers on your side."}
          </h1>
          <p className="hero-copy mx-auto mt-3 max-w-xl text-sm font-normal leading-relaxed md:mt-4 md:text-base" style={{ color: PALETTE.textSec }}>
            {isAr
              ? "حاسبات سعرات وماكروز مجانية، 868+ تمرين بالشرح والصور، قاعدة أطعمة بأكثر من 8,830 صنف، وEVO مدربك الذكي 24/7 — ابدأ الآن مجانًا، وأنشئ حسابًا فقط لحفظ خططك ومزامنتها."
              : "Free calorie & macro calculators, 868+ exercises, 8,830+ foods with nutrition facts, and EVO, your 24/7 AI coach. Start free — create an account only to save and sync your plans."}
          </p>

          {/* Phase 203 account-action CTA pair: guests (most homepage
              traffic) get ONE primary chrome button → signup (the auth
              route is bilingual BY DESIGN — no /ar mirror) + ONE quiet
              login link; signed-in members get their own console. The
              usage CTAs stay where the usage happens (quick-nav chip →
              #tools, tools lead card → the planners, training section →
              the library). */}
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
              {isAr ? `${EX_PLUS} تمرين` : `${EX_PLUS} EXERCISES`}
            </span>
            <span className="seal-chip">
              <EngravedIcon name="hydration" alt="" size={14} className="h-3 w-3" />
              {isAr ? `${FOODS_PLUS} صنف غذائي بالسعرات والماكروز` : `${FOODS_PLUS} foods with calories & macros`}
            </span>
            <span className="seal-chip">
              <EngravedIcon name="calories" alt="" size={14} className="h-3 w-3" />
              {isAr ? `${TOOLS_PLUS} أدوات مجانية` : `${TOOLS_PLUS} FREE TOOLS`}
            </span>
            <span className="seal-chip">
              <EngravedIcon name="evo" alt="" size={14} className="h-3 w-3" />
              {isAr ? "EVO مدربك الذكي — متاح 24/7" : "EVO — your AI coach, 24/7"}
            </span>
          </div>
        </div>
      </section>

      {/* GEO paragraph (owner order 2026-09-16): a factual platform
          summary directly after the hero — what Alkemos is and what a
          visitor can do with zero account/payment. Bilingual, text only;
          no links, structure, or icons touched. */}
      <p className="mx-auto max-w-2xl px-4 pb-6 pt-8 text-center text-xs font-normal leading-relaxed md:text-sm" style={{ color: PALETTE.textSec }}>
        {isAr
          ? "منصة Alkemos منصة لياقة وتغذية مجانية: احسب سعراتك وماكروزك، تصفّح 868+ تمرينًا، واعرف قيمة أكثر من 8,830 صنف غذائي، وولّد خططك مع EVO — بدون حساب أو دفع."
          : "Alkemos is a free fitness and nutrition platform where you can calculate calories and macros, browse 868+ exercises, look up 8,830+ foods, and generate plans with EVO — no account or payment required."}
      </p>

      {/* Greek meander divider — mission §4 */}
      <div className="meander-divider" aria-hidden="true" />

      {/* ===================== 2. SECTION QUICK-NAV ===================== */}
      {/* The page's table of contents — Phase 202 section map: Tools (the
          primary free entry) → Training → Nutrition → Articles (only when
          posts loaded) → Coaching → FAQ. One snap-scroll row on phones,
          centered wrap on md+. */}
      <section className="px-4 pb-10 pt-2 md:pb-14" style={{ backgroundColor: PALETTE.sectionWhite }}>
        <nav aria-label={isAr ? "التنقل بين أقسام الصفحة" : "Jump to a section"} className="mx-auto max-w-6xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: PALETTE.textMuted }}>
            {isAr ? "استكشف المنصة" : "Explore the platform"}
          </p>
          <div className="scrollbar-none -mx-4 mt-3 flex snap-x items-center gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:justify-center md:overflow-x-visible md:px-0">
                {SECTION_NAV.filter((s) => !s.needsPosts || latestPosts.length > 0).map((s) => {
                  const Icon = s.icon;
                  const isPrimary = !!s.primary;
                  return (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      title={isAr ? s.titleAr : s.titleEn}
                      className="inline-flex shrink-0 snap-start items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-300"
                      style={
                        isPrimary
                          ? {
                              background: "var(--chrome)",
                              color: "#0B0B0D",
                              border: "1px solid var(--chrome-edge)",
                              boxShadow: "var(--shadow)",
                            }
                          : {
                              backgroundColor: "var(--card)",
                              color: PALETTE.textPrim,
                              border: "var(--border-chrome)",
                            }
                      }
                      onMouseEnter={(e) => {
                        if (!isPrimary) {
                          e.currentTarget.style.backgroundColor = "var(--tint)";
                        }
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isPrimary) {
                          e.currentTarget.style.backgroundColor = "var(--card)";
                        }
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <Icon
                        className="h-4 w-4 shrink-0"
                        style={isPrimary ? { color: "#0B0B0D" } : { color: "var(--muted-foreground)" }}
                        aria-hidden="true"
                      />
                      {isAr ? s.labelAr : s.labelEn}
                    </a>
                  );
                })}
              </div>
        </nav>
      </section>

      {/* ===================== 3. FREE TOOLS & AI =====================
          The flagship free entry point (owner order 2026-09-15:
          «اجعل الأدوات المجانية من أهم نقاط الدخول والاستخدام
          الفوري»). The AI-plan lead card stays the section's flagship
          (the AI service entry point — Phase 185/194 copy preserved);
          the EVO warrior card is RETIRED per the owner order («EVO
          موجود بالفعل كـFloating Widget؛ لا تنشئ له قسمًا دعائيًا
          جديدًا») — the floating EVO widget is the one access point. */}
      <section id="tools" className="scroll-mt-20 bg-[var(--tint)] px-4 py-12 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <Reveal>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {isAr ? "احسب احتياجك اليومي من السعرات والماكروز خلال ثوانٍ" : "Your Daily Targets, Calculated in Seconds"}
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mx-auto mt-3 max-w-md text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
                {isAr ? `${TOOLS_PLUS} أدوات مجانية تحوّل هدفك إلى أهداف يومية واضحة — بدون تسجيل.` : `${TOOLS_PLUS} free tools that turn your goal into clear daily targets — no signup required.`}
              </p>
            </Reveal>
          </div>
          {/* FREE AI PLAN GENERATION — the flagship of the free experience
              (owner directive 2026-09-13; Phase 194 benefit-first copy). */}
          <Reveal delay={150}>
            <div className="marble-card mt-8 p-6 md:p-8">
              <div className="flex flex-col items-center gap-5 text-center md:flex-row md:text-start">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-[var(--edge)] bg-[var(--tint)]">
                  <EngravedIcon name="evo" alt="" size={30} className="h-7 w-7" />
                </span>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold tracking-tight md:text-2xl" style={{ color: PALETTE.textPrim }}>
                    {isAr ? "خطة تناسبك أنت — لا قوالب جاهزة عامة" : "A plan built around your goals — not generic templates"}
                  </h3>
                  <p className="mt-2 text-sm font-normal leading-relaxed md:text-base" style={{ color: PALETTE.textSec }}>
                    {isAr
                      ? "أنشئ خطة تغذية وتدريب مخصصة لأهدافك وبياناتك وتفضيلاتك ونمط حياتك — ثم طوّرها مع تقدمك."
                      : "Create a personalized nutrition and workout plan based on your goals, body, preferences, and lifestyle — then adjust it as you progress."}
                  </p>
                  {/* Operational details — kept (no info removed), demoted
                      to a small secondary line (Phase 194 benefit-first). */}
                  <p className="mt-2 text-xs font-normal leading-relaxed md:text-sm" style={{ color: PALETTE.textMuted }}>
                    {isAr
                      ? "خططك تبقى على جهازك بدون حساب، وتُحفظ وتتزامن عبر أجهزتك مع الحساب المجاني — والباقة المدفوعة تمنحك إدارة أوسع."
                      : "No account? Your plan stays on this device. Free account? Saved and synced across devices. Paid tiers add fuller plan management."}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  {/* Owner directive (2026-09-13): ONE direct CTA label on the
                      primary button. Phase 194: the label sells the action. */}
                  <a href={isAr ? "/ar/ai-meal-planner" : "/ai-meal-planner"} className="btn-chrome px-5 py-2.5 text-sm">
                    {isAr ? "أنشئ خطتي" : "Create My Plan"}
                  </a>
                  <a href={isAr ? "/ar/ai-workout-planner" : "/ai-workout-planner"} className="btn-outline px-5 py-2.5 text-sm font-normal">
                    {isAr ? "مخطط التمارين بالذكاء الاصطناعي ›" : "AI Workout Planner ›"}
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Restructure order (owner directive 2026-09-15 — Mobile-first
                curation): the grid shows the FOUR goal-essential tools;
                the rest stay fully available via «كل الأدوات» + the /tools
                hub + the footer (display-only curation). */}
            {[
              { slug: "calorie-calculator", nameAr: "حاسبة السعرات الحرارية", nameEn: "Calorie Calculator", descAr: "اعرف احتياجك اليومي من السعرات والماكروز بدقة، بدون تسجيل.", descEn: "Find your daily calorie and macro needs — no signup", icon: "calories", href: "/tools/calorie-calculator" },
              { slug: "macro-calculator", nameAr: "حاسبة الماكروز", nameEn: "Macro Calculator", descAr: "وزّع سعرات يومك على بروتين وكربوهيدرات ودهون بسهولة.", descEn: "Split your calories into protein, carbs, and fat", icon: "macros", href: "/tools/macro-calculator" },
              { slug: "bmi-calculator", nameAr: "حاسبة كتلة الجسم BMI", nameEn: "BMI Calculator", descAr: "اعرف إن كان وزنك ضمن المعدل الصحي.", descEn: "Check whether your weight is in the healthy range", icon: "bmi", href: "/tools/bmi-calculator" },
              { slug: "meal-planner", nameAr: "مخطط الوجبات", nameEn: "Meal Planner", descAr: `ابنِ وجباتك من ${FOODS_PLUS} صنف غذائي وتابع الماكروز.`, descEn: `Build meals from ${FOODS_PLUS} foods and track macros`, icon: "mealplanner", href: "/meal-planner" },
            ].map((tool, i) => (
              <Reveal key={tool.slug} delay={i * 80}>
                <LandingToolCard tool={tool} isAr={isAr} />
              </Reveal>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a href={isAr ? "/ar/tools" : "/tools"} className="text-sm font-semibold underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70" style={{ color: PALETTE.textPrim }}>
              {isAr ? "كل الأدوات ›" : "View all tools ›"}
            </a>
          </div>
        </div>
      </section>

      {/* ===================== 4. TRAINING — real content entry point =====================
          Phase 202 (owner order 2026-09-15: «Exercises: اعرض محتوى/نماذج
          تمارين فعلية قابلة للتصفح، وليس مجرد رقم 868+» + «Programs:
          اعرض برامج فعلية مختارة وقابلة للاستكشاف»): REAL exercises and
          REAL programs from the live libraries (server-selected in
          getHomeSamples() and passed as props — the bundle law holds:
          the 1.6MB array never ships to the browser). Every card is a
          browsable link into its detail page — a content entry point,
          not a stat tile. */}
      <section id="training" className="scroll-mt-20 bg-[var(--bg)] px-4 py-12 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "مكتبة التدريب" : "The Training Library"}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? `${EX_PLUS} تمرينًا بالشرح والصور لكل مجموعة عضلية، وبرامج جاهزة لكل مستوى — هذه نماذج حقيقية منها.`
                : `${EX_PLUS} exercises with instructions and images for every muscle group, plus ready-made programs for every level — these are real samples from the library.`}
            </p>
          </div>

          {/* Phase 203 (owner-approved copy refinement 2026-09-15): the
              library browse paths promoted ABOVE the samples — the
              «Browse by muscle group» chips row (counts are real, from
              the shared constants) + ONE clear All Exercises CTA. The old
              quiet duplicate link below the samples is retired. Data and
              sample selection are untouched (getHomeSamples props). */}
          <div className="mt-8">
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
      </section>

      {/* ===================== 5. NUTRITION — real content entry point =====================
          Phase 202 (owner order 2026-09-15: «Nutrition: اعرض نماذج فعلية
          من قاعدة الأطعمة ومعلوماتها، وليس مجرد رقم 8,830+»): REAL foods
          from the live database with their real per-100g numbers — each
          card links to its /foods/[slug] detail page. */}
      <section id="nutrition" className="scroll-mt-20 bg-[var(--tint)] px-4 py-12 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "قاعدة الأطعمة — بالسعرات والماكروز" : "The Food Database — Calories & Macros"}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? `${FOODS_PLUS} صنفًا غذائيًا مع سعراته وبروتينه وكربوهيدراته ودهونه لكل 100 جرام — هذه عيّنات حقيقية منها.`
                : `${FOODS_PLUS} foods with calories, protein, carbs, and fat per 100g — these are real samples from the database.`}
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
      </section>

      {/* ===================== 6. ARTICLES — a visible part of the experience =====================
          Phase 202 (owner order 2026-09-15: «اجعل المقالات جزءًا واضحًا من
          تجربة الموقع وليست مخفية داخل Tabs»): the blog carousel moved
          OUT of the retired Library tab into its own section. Selection
          logic (selectHomeBlogCarousels) is untouched; the whole section
          renders only when posts loaded (the needsPosts law). */}
      {latestPosts.length > 0 && (
        <section id="articles" className="scroll-mt-20 bg-[var(--bg)] px-4 py-12 md:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {isAr ? "من المدونة — علم اللياقة بلغة واضحة" : "From the Blog — Fitness Science, Plainly Written"}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
                {isAr
                  ? "مقالات تشرح التدريب والتغذية بالأدلة — اقرأ ما يهم رحلتك."
                  : "Evidence-based articles on training and nutrition — read what matters for your journey."}
              </p>
            </div>
            {/* Phase 198 Batch 2 (audit H2): ONE carousel — featured posts
                lead the row as dark cards, latest follows. */}
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

      {/* Greek meander divider — mission §4. The TWO narrative acts law
          (Phase 201): exploration ends here, the human-services act
          (coaching + FAQ) begins. */}
      <div className="meander-divider" aria-hidden="true" />

      {/* ===================== 7. COACHING — one brief section =====================
          Phase 202 (owner order 2026-09-15: «Coaching: قسم واحد مختصر إن
          كان مفيدًا، بدون أسعار وبدون تحويل الصفحة إلى Sales Funnel»):
          the premium spotlight keeps its dark-marble identity treatment
          and its four pillars, but reads as a SERVICE INTRODUCTION now —
          the sales-ladder language is gone: no «TOP TIER» chip, no
          Pro-features reassurance line, no memberships cross-link, and
          the single CTA points at the coaching page itself (where the
          how-it-works detail lives). Prices never appear here. */}
      <section id="coaching" className="scroll-mt-20 bg-[var(--bg)] px-4 py-12 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div
            className="relative overflow-hidden rounded-[var(--radius-chrome)]"
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
                program cards (mission §8), one step quieter on the dark
                surface. Purely decorative. */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07] blur-[2px]"
              aria-hidden="true"
              style={{
                backgroundImage: "var(--prog-backdrop)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="relative grid items-center gap-10 p-6 sm:p-8 md:p-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
              {/* Copy column */}
              <div className="text-center lg:text-start">
                <span
                  className="seal-chip"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.08)", color: "#C9CED3", borderColor: "#3A3F45" }}
                >
                  <EngravedIcon name="laurel" alt="" size={12} className="h-3 w-3" />
                  {isAr ? "كوتشينج أونلاين" : "ONLINE COACHING"}
                </span>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  {isAr ? "كوتشينج حقيقي، لا مجرد PDF" : "Real Coaching, Not a One-Time PDF"}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base font-normal leading-relaxed md:text-lg lg:mx-0" style={{ color: "#B9BEC4" }}>
                  {isAr
                    ? "مدرب بشري يبني خططك ويتابع تقدمك أسبوعيًا — ومعه EVO بلا حدود."
                    : "A human coach builds your plans and follows your progress weekly — with unlimited EVO at your side."}
                </p>
                {/* One explore-oriented CTA → the coaching page (it explains
                    how coaching works; prices live there, not here). */}
                <div className="mt-8 flex flex-col items-center gap-3 lg:items-start">
                  <a
                    href={isAr ? "/ar/coaching" : "/coaching"}
                    className="btn-chrome w-full px-8 py-3.5 text-base sm:w-auto"
                  >
                    {isAr ? "استكشف الكوتشينج" : "Explore Coaching"}
                    <span className="rtl:rotate-180">›</span>
                  </a>
                </div>
              </div>
              {/* The four coaching pillars — Human Coach + Personalized
                  Plans + Follow-up + EVO (owner directive 2026-09-15). */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {(isAr
                  ? [
                      { icon: Users, t: "مدرب بشري" },
                      { icon: ClipboardList, t: "خطط مخصصة" },
                      { icon: LineChart, t: "متابعة أسبوعية" },
                      { icon: Bot, t: "EVO كامل" },
                    ]
                  : [
                      { icon: Users, t: "Human Coach" },
                      { icon: ClipboardList, t: "Personalized Plans" },
                      { icon: LineChart, t: "Weekly Follow-up" },
                      { icon: Bot, t: "Full EVO" },
                    ]
                ).map((f) => {
                  const Icon = f.icon;
                  return (
                    <div
                      key={f.t}
                      className="flex items-center gap-3 rounded-2xl p-3.5 text-start md:p-4"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.06)", border: "1px solid rgba(255, 255, 255, 0.10)" }}
                    >
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.08)", color: "#E6E9EC" }}
                      >
                        <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                      </span>
                      <p className="text-sm font-semibold text-white">{f.t}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== 7.5 FEATURED COACHES («أعلن معنا» ads) ===================== */}
      {/* Kept as-is (0037 paid-ad strip — a real service surface; renders
          only when active ads exist). Phase 202 note: bg tint → bg stays
          from the Phase 201 restructure. */}
      {featuredCoaches.length > 0 && (
        <section className="bg-[var(--bg)] px-4 py-12 md:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl" style={{ color: PALETTE.textPrim }}>
              {/* §12.50-أ-3: this strip is PAID advertising (0037 wallet-debited
                  coach ads) — labeled as promo spots, not an endorsement. */}
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

      {/* (removed: Memberships section + the collapsed feature-comparison
          table + the closing sales CTA — owner order 2026-09-15 «لا تعرض
          Membership pricing أو جداول الأسعار في Homepage» + «قلل لغة
          الشرح التسويقي». The /memberships
          page, its pricing, and every quota/business rule are untouched —
          the page stays reachable from the header drawer, the footer, and
          the coaching page. The FAQ below now answers the four usage
          questions; pricing details live on /memberships and /coaching.) */}

      {/* ===================== 8. FAQ — usage questions =====================
          The closing act (Phase 201 merged FAQ+CTA law, Phase 202: the
          sales CTA card retired — the FAQ accordion ends the page
          quietly; the footer's newsletter follows). */}
      <section id="faq" className="scroll-mt-20 bg-[var(--bg)] px-4 py-12 md:py-20">
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

      {/* ===================== FOOTER — the SHARED SiteFooter component
          (access-point fix 2026-09-14): every public page renders the
          identical footer. Phase 202 (owner order 2026-09-15: «Footer:
          اجعله Navigation فعليًا إلى منظومة Alkemos وخدماتها»): the
          link grid is reorganized into the service families (Training /
          Nutrition / Tools & AI / Coaching & Services / Company) and the
          bottom tagline is the owner's new pair («Built with care for
          the fitness community» / «صُنع بحب لمجتمع اللياقة»). Every link
          that existed before still exists — reorganization only.
          ===================== */}
      <SiteFooter />
    </div>
  );
}

// ─── Helper component prop types (typed instead of legacy `any`) ───

type LandingTool = {
  slug: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  icon: string; // engraved icon pair name (mission §6)
  href: string;
};

// ─── Helper components (conditional rendering — no display:none in DOM) ───

function LandingToolCard({ tool, isAr }: { tool: LandingTool; isAr: boolean }) {
  // §12.27: every tool href now resolves its locale-aware mirror — an AR
  // homepage visitor stays inside the Arabic tree (same law as the footer).
  const href = isAr ? `/ar${tool.href}` : tool.href;
  return (
    <a
      href={href}
      className="marble-card group flex items-center gap-4 p-6 transition-transform duration-300 hover:-translate-y-0.5"
    >
      {/* Engraved icon pair (mission §6: flame / scale / pie / silhouette+% / cup / plate) */}
      <EngravedIcon
        name={tool.icon}
        alt={isAr ? tool.nameAr : tool.nameEn}
        size={56}
        className="h-14 w-14 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>{isAr ? tool.nameAr : tool.nameEn}</h3>
        <p className="mt-1 text-sm font-normal" style={{ color: PALETTE.textSec }}>{isAr ? tool.descAr : tool.descEn}</p>
      </div>
      {/* Arrow "›" in chrome (mission §6) */}
      <span className="chrome-text shrink-0 text-2xl font-semibold" aria-hidden="true">›</span>
    </a>
  );
}

// ─── Phase 202: real-content sample cards (exercises / foods / programs).
//     Every card is a plain <a> into its detail page — a real content
//     entry point. The samples arrive as precomputed serializable props
//     from the server (getHomeSamples) — zero library imports here. ───

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
          <span style={{ color: PALETTE.textMuted }}>{isAr ? "كالوري" : "kcal"}</span>
        </div>
        <div className="rounded bg-[var(--tint)] px-1 py-1 text-center">
          <span className="block font-semibold text-[#34c759]">{isAr ? `${food.protein} جم` : `${food.protein}g`}</span>
          <span style={{ color: PALETTE.textMuted }}>{isAr ? "بروتين" : "protein"}</span>
        </div>
        <div className="rounded bg-[var(--tint)] px-1 py-1 text-center">
          <span className="block font-semibold text-[#ff9500]">{isAr ? `${food.carbs} جم` : `${food.carbs}g`}</span>
          <span style={{ color: PALETTE.textMuted }}>{isAr ? "كارب" : "carbs"}</span>
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
