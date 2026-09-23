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

// ============================================================
// HOME-REBUILD-258 (owner directive 2026-09-24: rebuild the
// homepage from scratch as a GLOBAL product interface — research-
// driven UX/CRO/SEO, native human copy per language, clear free-
// vs-paid story without a sales deck).
//
// The page tells ONE progression in NINE blocks:
//   Promise (Hero) → Proof (real numbers) → Explore (three paths)
//   → Train (real exercises + programs) → Eat (real foods)
//   → Intelligence (AI planners + EVO, quota-transparent)
//   → Learn (blog) → Free-vs-Paid (3 honest cards + refund line)
//   → FAQ → Final CTA.  (+ the conditional featured-coaches strip)
//
// Copy laws: EN and AR are independent native pairs (never a
// translation); counts ride the verified constants; prices ride
// memberships.ts (single source — no literals); EVO quota facts
// mirror the unified pool; zero emoji; MSA-clean Arabic.
//
// PRESERVED VERBATIM from the previous phases: the Marble & Chrome
// identity (recipes + engraved icons + zero emoji), the Phase 202
// real content entry points (getHomeSamples server slices), the
// Phase 203 account-driven CTA law, the EVO CHAT SURFACE LAW (the
// floating widget stays the only chat surface), the blog selection
// logic (selectHomeBlogCarousels), the paid featured-coaches strip
// (0037), and the FAQ JSON-LD single source.
// ============================================================

// Disabled Reveal — animations caused jarring scroll effects; renders
// children directly (kept from the previous phases).
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

  // ── Single-source tier derivations (HOME-REBUILD-258) ──
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
  const proofStats = [
    {
      icon: "dumbbell",
      value: EX_PLUS,
      labelAr: "تمرينًا بصور الأداء الصحيح",
      labelEn: "exercises with form photos",
    },
    {
      icon: "fruits",
      value: FOODS_PLUS,
      labelAr: "صنفًا غذائيًا بالسعرات والماكروز",
      labelEn: "foods with full macros",
    },
    {
      icon: "calories",
      value: `${TOOLS_COUNT}`,
      labelAr: "أدوات مجانية بلا حساب",
      labelEn: "free tools — no account needed",
    },
    {
      icon: "evo",
      value: "10",
      labelAr: "رسائل مع EVO يوميًا — مجانًا",
      labelEn: "EVO messages a day, free",
    },
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
          + H1 + subtitle + account CTA). HOME-REBUILD-258: the H1 is the
          brand line — it message-matches the SERP snippets (metadata
          description) so a searcher lands on the same words that won
          the click. Arabic is the original anchor; English is its
          native counterpart, not a translation. The primary CTA stays
          account-driven (Phase 203); the secondary opens the exercises
          library. */}
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
              ? "منصة واحدة تجمع التدريب والتغذية والتخطيط الذكي — ومعها EVO، مدربك بالذكاء الاصطناعي. بالعربية والإنجليزية."
              : "One platform that brings training, nutrition, and smart planning together — with EVO, your AI coach, built in. In Arabic and English."}
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

      {/* ===================== 2. PROOF — the platform in numbers =====================
          HOME-REBUILD-258: auditable proof directly under the promise —
          the pattern every leader in the category uses. All four values
          ride verified constants or documented quotas (EX_PLUS /
          FOODS_PLUS / TOOLS_COUNT / the EVO fair-use daily limit); the
          page invents nothing. */}
      <section aria-label={isAr ? "المنصة بالأرقام" : "The platform in numbers"} className="border-y border-[var(--edge)] bg-[var(--tint)] px-4 py-8 md:py-10">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-y-8 md:grid-cols-4">
          {proofStats.map((stat) => (
            <div key={stat.labelEn} className="flex flex-col items-center px-3 text-center">
              <EngravedIcon name={stat.icon} alt="" size={28} className="h-7 w-7" />
              <span className="chrome-text mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                {stat.value}
              </span>
              <span className="mt-1 max-w-[18ch] text-xs font-normal leading-snug md:text-sm" style={{ color: PALETTE.textSec }}>
                {isAr ? stat.labelAr : stat.labelEn}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== 3. EXPLORE — three paths =====================
          How Alkemos is USED — three clear paths, not a feature catalog:
          Train / Eat / Track & Plan. Each card is one full link into its
          real hub with one benefit line. */}
      <section id="paths" className="scroll-mt-20 bg-[var(--bg)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "من أين تودّ أن تبدأ؟" : "Where do you want to start?"}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "ثلاثة مسارات، منصة واحدة — وكل مسار منها مجاني."
                : "Three paths, one platform — and every one of them free to walk."}
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-3">
            {(isAr
              ? [
                  { icon: "dumbbell", title: "تدرّب", desc: "صور تُريك الأداء الصحيح، وشرح واضح، وبرامج جاهزة تنقلك من أول يوم إلى تقدّم ثابت.", link: "ابدأ التدريب ›", href: "/ar/exercises" },
                  { icon: "protein", title: "تغذَّ", desc: "سعرات وماكروز لكل صنف، لتبني وجباتك حول هدفك بدل التخمين.", link: "ابدأ التغذية ›", href: "/ar/foods" },
                  { icon: "calories", title: "خطّط وتتبّع", desc: "حاسبات ومخططات ذكية تضع أهدافك أمامك — وتحدّثها مع تغيّر ظروفك.", link: "اكتشف الأدوات ›", href: "/ar/tools" },
                ]
              : [
                  { icon: "dumbbell", title: "Train", desc: "Form photos that show proper technique, clear instructions, and ready-made programs that carry you from day one to steady progress.", link: "Start training ›", href: "/exercises" },
                  { icon: "protein", title: "Eat", desc: "Calories and macros for every food, so you build meals around your goal instead of guessing.", link: "Start eating smarter ›", href: "/foods" },
                  { icon: "calories", title: "Track & Plan", desc: "Calculators and AI planners that put your targets in front of you — and update them as your life changes.", link: "Open the tools ›", href: "/tools" },
                ]
            ).map((path) => (
              <Reveal key={path.title}>
                {/* Mobile density law: icon+title share one row, the
                    description clamps to 2 lines, p-5, unified .card-lift
                    hover; md+ keeps icon-over-title at p-7. */}
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

      {/* ===================== 4. TRAIN =====================
          The exercise library section: the real library count (EX_PLUS
          rides the verified constant), the muscle-group browse chips with
          live counts, and the 8 real curated lifts as samples. The
          ready-made programs stay as a compact sub-row. All sample data
          arrives as server props (getHomeSamples) — the bundle law holds. */}
      <section id="train" className="scroll-mt-20 bg-[var(--tint)] px-4 py-10 md:py-20">
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
                ? `${EX_PLUS} تمرينًا بصور الأداء الصحيح وشرح واضح — مرتّبة حسب المجموعة العضلية والمستوى والمعدات، بالعربية والإنجليزية.`
                : "Every exercise with form photos and clear instructions — organized by muscle group, level, and equipment, in both languages."}
            </p>
          </div>

          <div className="mt-8 md:mt-10">
            {/* Browse paths — muscle-group chips with real live counts;
                the section CTA follows the samples below. */}
            <div className="mt-6">
              <p className="text-center text-xs font-semibold uppercase tracking-wider" style={{ color: PALETTE.textMuted }}>
                {isAr ? "تصفّح حسب المجموعة العضلية" : "Browse by muscle group"}
              </p>
              {/* ONE scroll-snap row on touch (edge fades, RTL-safe);
                  centered wrap on md+. */}
              <div className="chips-row scrollbar-none mt-3">
                {[
                  { labelAr: "صدر", labelEn: "Chest", slug: "chest" },
                  { labelAr: "ظهر", labelEn: "Back", slug: "back" },
                  { labelAr: "أكتاف", labelEn: "Shoulders", slug: "shoulders" },
                  { labelAr: "أرجل", labelEn: "Legs", slug: "legs" },
                  { labelAr: "بايسبس", labelEn: "Biceps", slug: "biceps" },
                  { labelAr: "ترايسبس", labelEn: "Triceps", slug: "triceps" },
                  { labelAr: "كور", labelEn: "Core", slug: "core" },
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
            {/* ONE focused section CTA. */}
            <div className="mt-8 text-center">
              <a href={isAr ? "/ar/exercises" : "/exercises"} className="btn-outline px-7 py-3 text-sm font-medium md:text-base">
                {isAr ? "استكشف مكتبة التمارين" : "Explore the exercise library"}
                <span className="rtl:rotate-180" aria-hidden="true">›</span>
              </a>
            </div>

            {/* REAL program samples — 3 curated programs from the live
                WORKOUT_PROGRAMS array. A quiet starting-point row inside
                TRAIN — not a separate section. */}
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
          The food database section: the real database count (FOODS_PLUS
          rides the verified constant) and the 8 real per-100g staples as
          samples (server props — the bundle law holds). */}
      <section id="eat" className="scroll-mt-20 bg-[var(--bg)] px-4 py-10 md:py-20">
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
                ? "سعرات وبروتين وكربوهيدرات ودهون لكل 100 جرام — قاعدة أطعمة تجعل بناء وجباتك وبلوغ أرقامك أمرًا واضحًا، بالعربية والإنجليزية."
                : "Calories, protein, carbs, and fat for every 100 g — a database that makes building meals and hitting your targets straightforward, in both languages."}
            </p>
          </div>
          {/* REAL food samples — 8 curated staples spanning the food
              families, same macro presentation as the /foods explorer. */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:mt-10 md:grid-cols-4">
            {samples.foods.map((food) => (
              <LandingFoodCard key={food.slug} food={food} isAr={isAr} />
            ))}
          </div>
          {/* ONE focused section CTA. */}
          <div className="mt-8 text-center">
            <a href={isAr ? "/ar/foods" : "/foods"} className="btn-outline px-7 py-3 text-sm font-medium md:text-base">
              {isAr ? "استكشف قاعدة الأطعمة" : "Explore the food database"}
              <span className="rtl:rotate-180" aria-hidden="true">›</span>
            </a>
          </div>
        </div>
      </section>

      {/* ===================== 6. INTELLIGENCE — AI planners + EVO =====================
          HOME-REBUILD-258: the two AI surfaces tell ONE story — the
          planners build the plan, EVO keeps it moving. The quota facts
          are stated plainly (unified pool decree + EVO fair-use limit):
          transparency here is the conversion pattern, and honesty is the
          brand. The EVO CHAT SURFACE LAW stays untouched: the floating
          widget is the only chat surface and this section's EVO CTA
          dispatches openEvoFloatingChat. The card keeps the Phase 127
          warrior-art recipe: text on the inline-start, warrior art
          dissolving into the marble on the inline-end (.evo-art-mask,
          mirrored in RTL). */}
      <section id="evo" className="scroll-mt-20 bg-[var(--tint)] px-4 py-10 md:py-20">
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
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {isAr ? "تعلّم. طبّق. تقدّم." : "Learn. Apply. Progress."}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
                {isAr
                  ? "مقالات بالعربية والإنجليزية تشرح التدريب والتغذية بأسلوب واضح — اقرأ ما يخص هدفك وطبّقه في تدريبك وفي طبقك."
                  : "Articles in English and Arabic that explain training and nutrition in plain terms — read what matters for your goal and put it to work."}
              </p>
            </div>
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

      {/* ===================== 8. FREE vs PAID — the honest money moment =====================
          HOME-REBUILD-258 (owner directive: the visitor must understand
          exactly what is free, what upgrading unlocks, and why paid
          services exist — without feeling sold to). THREE cards, prices
          derived from memberships.ts (single source — no literals):
          Free · Premium & Pro (from) · Coaching. The middle card is
          the visual hero (dark marble + chrome ring + laurel — the Pro
          recipe from §7.4). The refund line states the REAL 7-day
          conditional refund (src/lib/refund.ts) — de-risking as fact. */}
      <section id="memberships" className="scroll-mt-20 bg-[var(--bg)] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "مجاني فعلًا. والترقية قرارك." : "Free, for real. Upgrading is your call."}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "لن تصطدم بجدار دفع كي تتدرّب أو تتغذّى جيدًا — الباقات المدفوعة لمن تجاوز حدود المستوى المجاني: تخطيط أوسع، وEVO بلا حدود، وتصدير، أو مدرب بشري."
                : "You never hit a paywall to train or eat well here — paid plans exist for when you outgrow the free tier: more AI planning, unlimited EVO, export, or a human coach."}
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-3">
            {/* Card 1 — FREE: the real free tier (memberships.ts). */}
            <div className="marble-card flex flex-col p-5 md:p-8">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-xl font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>
                  {isAr ? freeTier?.nameAr : freeTier?.nameEn}
                </h3>
                <span className="chrome-text text-lg font-bold">{freePriceLabel}</span>
              </div>
              <p className="mt-4 flex-1 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
                {isAr
                  ? "كل ما تراه في هذه الصفحة: المكتبات كاملة، وكل أداة، ورصيدك الشهري من الخطط الذكية، وEVO — مجانًا ودائمًا."
                  : "Everything on this page: the full libraries, every tool, your monthly AI plans, and EVO — free forever."}
              </p>
              <div className="mt-6">
                <a href="/auth?mode=signup" className="btn-outline px-6 py-2.5 text-sm font-medium">
                  {isAr ? "ابدأ مجانًا" : "Start free"}
                  <span className="rtl:rotate-180" aria-hidden="true">›</span>
                </a>
              </div>
            </div>
            {/* Card 2 — PREMIUM & PRO: the management delta, the ONE
                filled CTA of the section (O-3 asymmetry law). */}
            <div
              className="relative flex flex-col p-5 md:p-8"
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
            {/* Card 3 — COACHING: the human-coach promise (memberships.ts
                coaching entry), the quiet path by design. */}
            <div className="marble-card flex flex-col p-5 md:p-8">
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
          One quiet dark-marble band closes the page — the Arabic is the
          owner's line, the English is its native counterpart. ONE
          focused action, account-driven (the same single action as the
          hero — no new destinations). */}
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

      {/* ===================== FOOTER — the SHARED SiteFooter component;
          every public page renders the identical footer. ===================== */}
      <SiteFooter />
    </div>
  );
}

// ─── Helper components (conditional rendering — no display:none in DOM) ───

// ─── HOME-REBUILD-258: real-content sample cards (exercises / foods /
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
    /* The whole card stays ONE link (tap target = card); the title keeps
       a fixed 2-line floor (min-h-10) so macro grids align across the
       row; title → macros → link rides the tight gap rhythm. */
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
