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

// ============================================================
// HOME-BLUEPRINT-257 (owner-approved blueprint, 2026-09-23): the
// homepage tells ONE progression in TEN sections —
//   Outcome (Hero) → Explore (All-in-One paths) → Personalize (Plan)
//   → Train → Eat → EVO → Learn → Memberships + Online Coaching
//   → FAQ → Final CTA.
// The owner supplies the Arabic anchor lines per section; the English
// is INDEPENDENT native fitness-product copy — never a translation.
// Sections from HOME-REDESIGN-256 that duplicated this structure are
// removed/merged (Explore 4-card grid → the three-path All-in-One;
// the experience connector card → the Personalized Plan section; the
// tier ladder → a two-path Memberships/Coaching split).
//
// PRESERVED VERBATIM from the previous phases: the Marble & Chrome
// identity (recipes + engraved icons + zero emoji), the Phase 202 real
// content entry points (getHomeSamples server slices), the Phase 203
// account-driven CTA law, the EVO CHAT SURFACE LAW (the floating
// widget stays the only chat surface — the section CTA dispatches
// openEvoFloatingChat), the blog selection logic
// (selectHomeBlogCarousels), the paid featured-coaches strip (0037),
// and the FAQ JSON-LD single source.
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
  // HOME-BLUEPRINT-257 §9: the FIVE owner-specified questions — the ones
  // that remove hesitation before starting. Every claim mirrors the
  // implementation (free browsing + free tier — memberships.ts; guest AI
  // pool — unified pool decree; EVO availability with tier limits; the
  // coaching promise — memberships.ts coaching entry) with NO prices and
  // NO variable counts in the copy.
  // The FAQPage JSON-LD derives from the same array (single source law).
  const faqs = [
    { q: isAr ? "هل يمكنني استخدام Alkemos مجانًا؟" : "Can I use Alkemos for free?", a: isAr ? "نعم. التصفح مجاني بالكامل: التمارين والأطعمة والبرامج والأدوات تعمل دون تسجيل، وكل زائر يملك رصيدًا شهريًا لتوليد خطط التغذية والتمارين بالذكاء الاصطناعي، وEVO متاح للجميع ضمن حدود الاستخدام. وبحساب مجاني تُحفظ خططك وتتزامن عبر أجهزتك."
      : "Yes. Browsing is completely free — the exercises, foods, programs, and tools all work without an account. Every visitor gets a monthly allowance for AI nutrition and workout plans, and EVO is open to everyone within fair-use limits. A free account saves your plans and syncs them across your devices." },
    { q: isAr ? "كيف يعمل EVO؟" : "How does EVO work?", a: isAr ? "EVO هو المدرب الذكي داخل المنصة، وتجده في فقاعة محادثة أسفل كل صفحة. اسأله عن التدريب والتغذية، أو اطلب منه بناء خطة حول بياناتك وأهدافك، ثم عدّلها بتبديلات ذكية للوجبات والتمارين. وهو متاح للزوار والأعضاء معًا وفق حدود كل باقة."
      : "EVO is the smart coach built into Alkemos, living in the chat bubble at the bottom of every page. Ask it about training or nutrition, have it build a plan around your data and goals, then fine-tune it with smart meal and exercise swaps. It stays available to visitors and members alike, within each tier's limits." },
    { q: isAr ? "هل أحتاج إلى اشتراك؟" : "Do I need a subscription?", a: isAr ? "لا. يوجد مستوى مجاني دائم إلى جانب أدوات تعمل دون حساب أصلًا. الاشتراكات اختيارية: تفتح توليدات خطط أكثر، ومحادثة غير محدودة مع EVO، وتصديرًا كاملًا، وتجربة بلا إعلانات — عندما تحتاجها فعلًا."
      : "No. There's a permanent free tier alongside tools that work without an account in the first place. Memberships are optional — they unlock more AI plan generations, unlimited EVO chat, full export, and an ad-free experience, for when you actually want them." },
    { q: isAr ? "هل يناسبني Alkemos إذا كنت مبتدئًا؟" : "Does Alkemos suit beginners?", a: isAr ? "نعم. كل تمرين يأتي بشرح واضح وصور تُريك الأداء الصحيح، وبرامج جاهزة تبدأ من المستوى المبتدئ ويمكن تنفيذها في المنزل، وخطط الذكاء الاصطناعي تُبنى حول مستواك الحالي ومعداتك المتاحة."
      : "Yes. Every exercise comes with clear instructions and images that show proper form, the ready-made programs start at beginner level and can be done at home, and the AI planners build around your current level and the equipment you actually have." },
    { q: isAr ? "ما الفرق بين العضوية والتدريب الأونلاين؟" : "What's the difference between a membership and online coaching?", a: isAr ? "العضوية توسّع ما تفعله داخل المنصة: توليدات خطط أكثر، ومحادثة غير محدودة مع EVO، وتصدير، وتجربة بلا إعلانات. أما الكوتشينج فيضيف مدربًا بشريًا يبني خططك بنفسه، ويتابع تقدمك أسبوعيًا، وتبقى معه قناة تواصل مباشرة — ويشمل كل مزايا برو."
      : "A membership widens what you can do inside the platform — more AI plan generations, unlimited EVO chat, export, and no ads. Online coaching adds a human coach who builds your plans personally, follows your progress weekly, and stays in direct contact with you — with all Pro features included." },
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

      {/* ===================== 1. HERO — Outcome =====================
          HOME-BLUEPRINT-257 §1: the Phase 131 overlay scene is brand
          identity and stays (artwork + chrome logo + H1 + subtitle +
          account CTA). The H1 is the owner's outcome line — the Arabic
          is the ORIGINAL, the English is its native counterpart (not a
          translation). The primary CTA stays account-driven (Phase
          203); the new secondary CTA opens the exercises library. The
          old hero seal chips are retired — the real counts live in the
          TRAIN and EAT sections where they belong. */}
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
          {/* VRD-V0 (§10.2 leg 3 — utility discipline): rtl: counterparts sit
              next to the EN tight utilities so Arabic never inherits negative
              tracking or tight leading even if the unlayered RTL block in
              globals.css is ever refactored away (belt and braces with legs
              1-2; EN rendering is untouched). */}
          <h1 className="hero-copy font-display mt-3 text-2xl font-semibold leading-tight tracking-tight rtl:leading-snug rtl:tracking-normal md:mt-5 md:text-5xl lg:text-6xl" style={{ color: PALETTE.textPrim }}>
            {isAr ? "خطتك للياقة تبدأ من هنا." : "Your fitness plan starts here."}
          </h1>
          <p className="hero-copy mx-auto mt-3 max-w-xl text-sm font-normal leading-relaxed md:mt-4 md:text-base" style={{ color: PALETTE.textSec }}>
            {isAr
              ? "تدريب، تغذية، وأدوات ذكية تساعدك على اتخاذ قرارات أفضل والتقدم نحو هدفك."
              : "Training, nutrition, and smart tools that help you make better decisions and keep moving toward your goal."}
          </p>

          {/* Account-action CTA pair (Phase 203 law unchanged): guests get
              ONE primary chrome button → signup + ONE quiet login link;
              signed-in members get their own console. The blueprint adds
              ONE secondary explore CTA → the exercises library.
              VRD-V3 (§16.2, fixes C-9): on touch the three actions STACK
              full-width (primary → secondary → quiet centered Log in with
              a 16px clearance — no more mis-tap risk beside the artwork);
              md+ keeps the single centered row. */}
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
                  href={isAr ? "/ar/exercises" : "/exercises"}
                  className="btn-outline w-full px-6 py-2.5 text-sm font-medium md:w-auto md:py-2.5 md:text-base"
                >
                  {isAr ? "استكشف التمارين" : "Explore exercises"}
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

      {/* Greek meander divider — mission §4 */}
      <div className="meander-divider" aria-hidden="true" />

      {/* ===================== 2. ALL-IN-ONE — three paths =====================
          HOME-BLUEPRINT-257 §2: how Alkemos is USED — three clear paths,
          not a feature catalog: Train / Eat / Track & Plan. Each card is
          one full link into its real hub with one benefit line. This
          replaces the retired Explore 4-card grid (Articles get their
          own LEARN section later — the paths stay focused on usage). */}
      <section id="paths" className="scroll-mt-20 bg-[var(--bg)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "منصة واحدة، ثلاثة مسارات." : "One platform, three paths."}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "ثلاثة مسارات تخدم هدفك — ابدأ من حيث أنت، وانتقل بينها متى احتجت."
                : "Three paths toward the same goal — start where you are and move between them as you need."}
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-3">
            {(isAr
              ? [
                  { icon: "dumbbell", title: "تدرّب", desc: "تمارين لكل مجموعة عضلية بشرح وصور، وبرامج جاهزة تنقلك من البداية إلى التقدّم.", link: "ابدأ التدريب ›", href: "/ar/exercises" },
                  { icon: "protein", title: "تغذَّ", desc: "سعرات وماكروز لكل صنف، لتبني وجبات تناسب هدفك بدل التخمين.", link: "ابدأ التغذية ›", href: "/ar/foods" },
                  { icon: "calories", title: "خطّط وتتبّع", desc: "حاسبات ومخططات ذكية تضع خطتك وأهدافك أمامك، وتحدّثها مع تغيّر ظروفك.", link: "اكتشف الأدوات ›", href: "/ar/tools" },
                ]
              : [
                  { icon: "dumbbell", title: "Train", desc: "Exercises for every muscle group with instructions and images, plus ready-made programs that carry you from day one to steady progress.", link: "Start training ›", href: "/exercises" },
                  { icon: "protein", title: "Eat", desc: "Calories and macros for every food, so you build meals around your goal instead of guessing.", link: "Start eating smarter ›", href: "/foods" },
                  { icon: "calories", title: "Track & Plan", desc: "Calculators and smart planners that put your targets and plan in front of you — and update them as your circumstances change.", link: "Open the tools ›", href: "/tools" },
                ]
            ).map((path) => (
              <Reveal key={path.title}>
                {/* VRD-V3 (§11, fixes C-10): below md the three path cards
                    go DENSE — icon+title share one row, the description
                    clamps to 2 lines, padding drops to p-5, and the unified
                    .card-lift hover replaces the bare translate utility.
                    The stacked 1,074px block compresses toward ≤720px
                    (measured after) with ZERO content removal; md+ keeps
                    the premium icon-over-title composition at p-7. */}
                <a
                  href={path.href}
                  className="marble-card card-lift group flex h-full flex-col p-5 md:p-7"
                >
                  <div className="flex items-center gap-3 md:block">
                    <EngravedIcon name={path.icon} alt="" size={48} className="h-10 w-10 shrink-0 md:h-12 md:w-12" />
                    <h3 className="text-xl font-semibold tracking-tight md:mt-4" style={{ color: PALETTE.textPrim }}>
                      {path.title}
                    </h3>
                  </div>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm font-normal leading-relaxed md:line-clamp-none" style={{ color: PALETTE.textSec }}>
                    {path.desc}
                  </p>
                  <span className="chrome-text mt-4 text-sm font-semibold">{path.link}</span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== 3. PERSONALIZED PLAN =====================
          HOME-BLUEPRINT-257 §3: how personalization works, briefly and
          honestly — goal, level, equipment, preferences in; a nutrition
          + workout plan out; adjustable as things change. Merges the
          retired connector card (the AI planners ARE the personalized
          plan builders — their locale-aware hrefs stay pinned by the
          ai-meal-planner canary). The three steps mirror how the
          planners actually flow. */}
      <section id="plan" className="scroll-mt-20 bg-[var(--tint)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          {/* VRD-V3 (§11): p-5 on mobile (was p-6) — one step of the
              mobile density law; md+ keeps the generous p-10 narrative
              focus. */}
          <div className="marble-card mx-auto max-w-4xl p-5 md:p-10">
            <div className="text-center">
              <span className="seal-chip">
                <EngravedIcon name="mealplanner" alt="" size={12} className="h-3 w-3" />
                {isAr ? "مخططات ذكية" : "SMART PLANNERS"}
              </span>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
                {isAr ? "خطة تناسبك، لا خطة تناسب الجميع." : "A plan built for you, not for everyone."}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base font-normal leading-relaxed md:text-lg" style={{ color: PALETTE.textSec }}>
                {isAr
                  ? "Alkemos يبني خطتك حول ما أنت عليه فعلًا: هدفك، مستواك، معداتك، ووقتك — لا حول قوالب عامة."
                  : "Alkemos builds your plan around where you actually are — your goal, your level, your equipment, and your time. Not around generic templates."}
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {(isAr
                ? [
                    { n: "01", t: "أجب عن أسئلة قصيرة", d: "عن هدفك ومستواك ومعداتك وتفضيلاتك." },
                    { n: "02", t: "استلم خطتك", d: "خطة تغذية وتمارين مبنية على إجاباتك." },
                    { n: "03", t: "عدّلها كلما تقدّمت", d: "تتغير أهدافك أو ظروفك؟ تُحدَّث الخطة معك." },
                  ]
                : [
                    { n: "01", t: "Answer a few questions", d: "Your goal, level, equipment, and preferences." },
                    { n: "02", t: "Get your plan", d: "A nutrition and workout plan shaped by your answers." },
                    { n: "03", t: "Adjust it as you progress", d: "Goals or circumstances change? The plan moves with you." },
                  ]
              ).map((step) => (
                <div key={step.n} className="text-center sm:text-start">
                  <span className="chrome-text text-lg font-semibold">{step.n}</span>
                  <p className="mt-1 text-base font-semibold" style={{ color: PALETTE.textPrim }}>{step.t}</p>
                  <p className="mt-1 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>{step.d}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href={isAr ? "/ar/ai-meal-planner" : "/ai-meal-planner"} className="btn-chrome px-6 py-3 text-sm md:px-7">
                {isAr ? "أنشئ خطتي" : "Create My Plan"}
              </a>
              <a href={isAr ? "/ar/ai-workout-planner" : "/ai-workout-planner"} className="btn-outline px-6 py-2.5 text-sm font-medium">
                {isAr ? "مخطط التمارين الذكي ›" : "AI Workout Planner ›"}
              </a>
            </div>
            <p className="mt-5 text-center text-xs font-normal" style={{ color: PALETTE.textMuted }}>
              {isAr
                ? "تعمل دون تسجيل — وبحساب مجاني تُحفظ خططك وتتزامن عبر أجهزتك."
                : "Works without an account — and a free account saves your plans and syncs them across devices."}
            </p>
          </div>
        </div>
      </section>

      {/* ===================== 4. TRAIN =====================
          HOME-BLUEPRINT-257 §4: the exercise library gets its own
          section — the owner's headline, the real library count
          (EX_PLUS rides the verified constant), the muscle-group
          browse chips with live counts, and the 8 real curated lifts
          as samples. The ready-made programs stay as a compact
          sub-row (a starting point, not a separate section). All
          sample data arrives as server props (getHomeSamples) — the
          bundle law holds. */}
      <section id="train" className="scroll-mt-20 bg-[var(--bg)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="seal-chip">
              <EngravedIcon name="dumbbell" alt="" size={12} className="h-3 w-3" />
              {isAr ? `${EX_PLUS} تمرين` : `${EX_PLUS} exercises`}
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "تدرّب بثقة." : "Train with confidence."}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "كل تمرين بشرح واضح وصور تُريك الأداء الصحيح — مصنّف حسب المجموعة العضلية والمستوى والمعدات."
                : "Every exercise with clear instructions and images that show proper form — organized by muscle group, level, and equipment."}
            </p>
          </div>

          <div className="mt-8 md:mt-10">
            {/* Browse paths — muscle-group chips with real live counts
                (Phase 203 law preserved); the section CTA follows the
                samples below. */}
            <div className="mt-6">
              <p className="text-center text-xs font-semibold uppercase tracking-wider" style={{ color: PALETTE.textMuted }}>
                {isAr ? "تصفّح حسب المجموعة العضلية" : "Browse by muscle group"}
              </p>
              {/* VRD-V3 (§16.3, fixes C-11): the chips ride the .chips-row
                  recipe — ONE scroll-snap row with symmetric edge fades on
                  touch (no ragged wrap / orphaned chip), centered wrap on
                  md+. The chip itself keeps the seal recipe + hover lift. */}
              <div className="chips-row scrollbar-none mt-3">
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
            </div>
            {/* REAL exercise samples — 8 curated lifts (one per muscle
                family), each card links to its /exercises/[slug] page. */}
            <div className="mt-8 grid grid-cols-2 gap-4 md:mt-10 md:grid-cols-4">
              {samples.exercises.map((ex) => (
                <LandingExerciseCard key={ex.slug} ex={ex} isAr={isAr} />
              ))}
            </div>
            {/* ONE focused section CTA (blueprint §4). */}
            <div className="mt-8 text-center">
              <a href={isAr ? "/ar/exercises" : "/exercises"} className="btn-outline px-7 py-3 text-sm font-medium md:text-base">
                {isAr ? "استكشف مكتبة التمارين" : "Explore the exercise library"}
                <span className="rtl:rotate-180" aria-hidden="true">›</span>
              </a>
            </div>

            {/* REAL program samples — 3 curated programs from the live
                WORKOUT_PROGRAMS array (real images, real splits). A quiet
                starting-point row inside TRAIN — not a separate section. */}
            <div className="mt-10 text-center md:mt-14">
              <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {isAr ? "تفضّل البدء بخطة جاهزة؟" : "Prefer a ready-made starting point?"}
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
        </div>
      </section>

      {/* ===================== 5. EAT =====================
          HOME-BLUEPRINT-257 §5: the food database gets its own section —
          the owner's headline, the real database count (FOODS_PLUS rides
          the verified constant), and the 8 real per-100g staples as
          samples (server props — the bundle law holds). */}
      <section id="eat" className="scroll-mt-20 bg-[var(--tint)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="seal-chip">
              <EngravedIcon name="protein" alt="" size={12} className="h-3 w-3" />
              {isAr ? `${FOODS_PLUS} صنف غذائي` : `${FOODS_PLUS} foods`}
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "اعرف ما تأكل. خطط لما تحتاجه." : "Know what you eat. Plan what you need."}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "سعرات وبروتين وكربوهيدرات ودهون لكل 100 جرام — قاعدة أطعمة تجعل بناء وجباتك وحساب احتياجك أمرًا واضحًا."
                : "Calories, protein, carbs, and fat for every 100g — a food database that makes building meals and hitting your targets straightforward."}
            </p>
          </div>
          {/* REAL food samples — 8 curated staples spanning the food
              families, same macro presentation as the /foods explorer. */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:mt-10 md:grid-cols-4">
            {samples.foods.map((food) => (
              <LandingFoodCard key={food.slug} food={food} isAr={isAr} />
            ))}
          </div>
          {/* ONE focused section CTA (blueprint §5). */}
          <div className="mt-8 text-center">
            <a href={isAr ? "/ar/foods" : "/foods"} className="btn-outline px-7 py-3 text-sm font-medium md:text-base">
              {isAr ? "استكشف قاعدة الأطعمة" : "Explore the food database"}
              <span className="rtl:rotate-180" aria-hidden="true">›</span>
            </a>
          </div>
        </div>
      </section>

      {/* ===================== 6. EVO — the intelligent layer =====================
          HOME-BLUEPRINT-257 §6: EVO is positioned as the intelligent
          layer connecting the whole experience — NOT another feature
          card — so the numbered capability rows are retired. The EVO
          CHAT SURFACE LAW (2026-08-27) stays untouched: the floating
          widget is the only chat surface and this section's CTA opens
          it via openEvoFloatingChat(). The card keeps the Phase 127
          warrior-art recipe: text on the inline-start, warrior art
          dissolving into the marble on the inline-end (.evo-art-mask,
          mirrored in RTL). Quiet secondary link → the full /evo page. */}
      <section id="evo" className="scroll-mt-20 bg-[var(--bg)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
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
                <EngravedIcon name="laurel" alt="" size={12} className="h-3 w-3" />
                {isAr ? "مدرب ذكي في كل صفحة" : "A SMART COACH ON EVERY PAGE"}
              </span>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
                {isAr ? "مدربك الذكي، عندما تحتاجه." : "Your smart coach, when you need one."}
              </h2>
              <p className="mt-4 text-base font-normal leading-relaxed md:text-lg" style={{ color: PALETTE.textSec }}>
                {isAr
                  ? "يساعدك EVO على بناء خطتك، تعديلها، واتخاذ قرارات أفضل مع تغيّر أهدافك واحتياجاتك."
                  : "EVO helps you build your plan, adjust it, and make better decisions as your goals and needs change."}
              </p>
              <p className="mt-3 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textMuted }}>
                {isAr
                  ? "تجده في فقاعة المحادثة أسفل كل صفحة — يعمل مع ما تتدرّب به، وما تأكله، وما تخطط له."
                  : "You'll find it in the chat bubble at the bottom of every page — working alongside whatever you train, eat, and plan."}
              </p>
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
        </div>
      </section>

      {/* ===================== 7. LEARN =====================
          HOME-BLUEPRINT-257 §7: a focused selection of real articles —
          the blog stays a first-class part of the experience (Phase
          202 owner order). Selection logic (selectHomeBlogCarousels)
          untouched; the whole section renders only when posts loaded
          (the needsPosts law). */}
      {latestPosts.length > 0 && (
        <section id="learn" className="scroll-mt-20 bg-[var(--tint)] px-4 py-10 md:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {isAr ? "تعلّم. طبّق. تقدّم." : "Learn. Apply. Progress."}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
                {isAr
                  ? "مقالات بالعربية والإنجليزية تشرح التدريب والتغذية بأسلوب واضح — اقرأ ما يخص هدفك، وطبّقه في تدريبك وفي طبقك."
                  : "Articles in English and Arabic that explain training and nutrition in plain terms — read what matters for your goal and put it to work in your training and on your plate."}
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
              <a href={blogHref} className="btn-outline px-6 py-2.5 text-sm font-medium">
                {isAr ? "استكشف المحتوى" : "Explore the articles"}
                <span className="rtl:rotate-180" aria-hidden="true">›</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Greek meander divider — the TWO narrative acts law (Phase 201):
          exploration ends here, the services act begins. */}
      <div className="meander-divider" aria-hidden="true" />

      {/* ===================== 8. MEMBERSHIPS + ONLINE COACHING =====================
          HOME-BLUEPRINT-257 §8: ONE section, TWO paths — Memberships and
          Online Coaching — briefly explained. NO prices anywhere, NO
          pricing table (the tier ladder is retired; the real tier NAMES
          still ride memberships.ts as chips, and the coaching card
          states the real Pro-inheritance). Pricing and the subscribe
          flows stay on /memberships and /coaching (both remain
          reachable from the header drawer and the footer). The paid
          featured-coaches strip (0037) follows — it renders only when
          active ads exist. */}
      <section id="memberships" className="scroll-mt-20 bg-[var(--bg)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "خذ خطوتك التالية." : "Take your next step."}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "مساران بحسب حاجتك: باقات توسّع قدراتك داخل المنصة، أو كوتشينج أونلاين يضع مدربًا إلى جانبك."
                : "Two paths depending on what you need: memberships that widen what the platform does for you, or online coaching that puts a coach in your corner."}
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-2">
            {/* Path 1 — Memberships: the real tier names from the single
                source (memberships.ts); capabilities described without
                prices or variable counts.
                VRD-V3 (§11 density + §13.3 O-3 asymmetry, fixes C-13): the
                memberships card now carries the section's ONE primary
                (filled .btn-chrome) while coaching keeps the quiet outline
                — the commercial heart gets a real click invitation without
                making both paths shout (§23.5 law). p-5 + clamped copy on
                mobile per the density law. */}
            <div className="marble-card flex flex-col p-5 md:p-8">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[var(--edge)] bg-[var(--tint)]">
                  <EngravedIcon name="laurel" alt="" size={26} className="h-6 w-6" />
                </span>
                <h3 className="text-xl font-semibold tracking-tight md:text-2xl" style={{ color: PALETTE.textPrim }}>
                  {isAr ? "الباقات" : "Memberships"}
                </h3>
              </div>
              <p className="mt-4 line-clamp-3 flex-1 text-sm font-normal leading-relaxed md:line-clamp-none md:text-base" style={{ color: PALETTE.textSec }}>
                {isAr
                  ? "ابدأ بمستوى مجاني دائم، وارتقِ متى احتجت مساحة أكبر: توليدات خطط أكثر، ومحادثة غير محدودة مع EVO، وحفظ وتصدير أوسع، وتجربة بلا إعلانات."
                  : "Start on a free tier that stays free, and move up when you need more room — more AI plan generations, unlimited EVO chat, bigger save capacity with export, and an ad-free experience."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {MEMBERSHIPS.filter((tier) => !tier.separate).map((tier) => (
                  <span key={tier.id} className="seal-chip py-1! text-[10px]!">{isAr ? tier.nameAr : tier.nameEn}</span>
                ))}
              </div>
              <div className="mt-6">
                <a href={isAr ? "/ar/memberships" : "/memberships"} className="btn-chrome px-6 py-2.5 text-sm font-medium">
                  {isAr ? "تفاصيل الباقات ›" : "See memberships ›"}
                  <span className="rtl:rotate-180" aria-hidden="true">›</span>
                </a>
              </div>
            </div>
            {/* Path 2 — Online Coaching: the real coaching promise from
                memberships.ts — human-built plans, weekly follow-up,
                direct contact, all Pro features inherited.
                VRD-V3 (§11 density): p-5 + clamp-3 mobile; the outline
                button stays (O-3 — the quiet path by design). */}
            <div className="marble-card flex flex-col p-5 md:p-8">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[var(--edge)] bg-[var(--tint)]">
                  <EngravedIcon name="runner" alt="" size={26} className="h-6 w-6" />
                </span>
                <h3 className="text-xl font-semibold tracking-tight md:text-2xl" style={{ color: PALETTE.textPrim }}>
                  {isAr ? "الكوتشينج أونلاين" : "Online Coaching"}
                </h3>
              </div>
              <p className="mt-4 line-clamp-3 flex-1 text-sm font-normal leading-relaxed md:line-clamp-none md:text-base" style={{ color: PALETTE.textSec }}>
                {isAr
                  ? "مدرب بشري يبني لك خطط التغذية والتمارين، ويتابع تقدمك أسبوعيًا، ويبقى على تواصل مباشر معك — مع كل مزايا برو."
                  : "A human coach who builds your nutrition and workout plans, follows your progress week by week, and stays in direct contact — with all Pro features included."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="seal-chip py-1! text-[10px]!">
                  <EngravedIcon name="checkseal" alt="" size={11} className="h-3 w-3" />
                  {isAr ? "يشمل كل مزايا برو" : "ALL PRO FEATURES INCLUDED"}
                </span>
              </div>
              <div className="mt-6">
                <a href={isAr ? "/ar/coaching" : "/coaching"} className="btn-outline px-6 py-2.5 text-sm font-medium">
                  {isAr ? "تفاصيل الكوتشينج ›" : "Explore coaching ›"}
                  <span className="rtl:rotate-180" aria-hidden="true">›</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== 6.5 FEATURED COACHES («أعلن معنا» ads) =====================
          Kept verbatim (0037 paid-ad strip — a real service surface;
          renders only when active ads exist). Labeled as promo spots,
          not an endorsement (§12.50-أ-3). */}
      {featuredCoaches.length > 0 && (
        <section className="bg-[var(--bg)] px-4 pb-10 md:pb-20">
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
          The FIVE owner-specified questions; every claim mirrors the
          implementation. The FAQPage JSON-LD derives from the same
          array above (single source law). */}
      <section id="faq" className="scroll-mt-20 bg-[var(--tint)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
            {isAr ? "أسئلة قبل أن تبدأ." : "Questions, answered."}
          </h2>
          <Accordion type="single" collapsible className="mt-8 md:mt-12">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-[var(--edge)]">
                {/* VRD-V0 (audit C-15): full-row hover state + a bigger,
                   higher-contrast chevron (was size-4 / muted — VLM: «small
                   and low-contrast»). Scoped here, NOT in the shared
                   accordion.tsx (app surfaces keep their treatment). */}
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

      {/* ===================== 10. FINAL CTA — «ابدأ اليوم. وابنِ روتينًا يناسبك.» =====================
          HOME-BLUEPRINT-257 §10: one quiet dark-marble band closes the
          page — the Arabic is the owner's exact line, the English is
          its native counterpart. ONE focused action, account-driven
          (the same single action as the hero — no new destinations). */}
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

function LandingFoodCard({ food, isAr }: { food: HomeFoodSample; isAr: boolean }) {
  const name = isAr ? food.nameAr : food.nameEn;
  return (
    /* VRD-V3 (§11 food cards, fixes the C-1-VLM dead-space note): the
       whole card stays ONE link (tap target = card); the title gets a
       fixed 2-line floor (min-h-10) so 1-line and 2-line names align
       the macro grid across the row, and the gaps tighten title →
       macros → link (mt-3 → mt-2 — gap-2 rhythm). */
    <a
      href={`${isAr ? "/ar" : ""}/foods/${food.slug}`}
      className="marble-card card-lift group flex flex-col p-4 text-start"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: PALETTE.textMuted }}>
        {isAr ? food.categoryLabelAr : food.categoryLabelEn}
      </span>
      <h3 className="mt-1 min-h-10 text-base font-semibold leading-tight tracking-tight line-clamp-2" style={{ color: PALETTE.textPrim }}>
        {name}
      </h3>
      {/* Real per-100g numbers from the database — same semantics as the
          /foods explorer cards (calories · protein · carbs). */}
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
      <p className="chrome-text mt-2 text-xs font-semibold">{isAr ? "اعرض الصنف ›" : "View food ›"}</p>
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
