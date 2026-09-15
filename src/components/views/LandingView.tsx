"use client";

import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
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
  Check,
  CircleHelp,
  ClipboardList,
  Crown,
  Dumbbell,
  LineChart,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
  surface:   "var(--card)",   // card surface (white / #141518)
  tint:      "var(--tint)",   // secondary surface / soft chips
  halo:      "var(--tint)",   // hover wash
  blue:      "var(--tint)",   // (decorative only)
  blueDeep:  "var(--muted-2)",

  textPrim:  "var(--text)",
  textSec:   "var(--muted-2)",
  textMuted: "var(--muted-foreground)",

  brand:     "var(--text)",    // solid action color (chrome CTAs use .btn-chrome)
  brandDeep: "var(--text)",
  brandSoft: "var(--tint)",

  border:    "var(--edge)",

  sectionWhite: "var(--bg)",
  sectionGray:  "var(--tint)",
  sectionDark:  "#0B0B0D",     // footer/rich band — dark in BOTH themes (mission §14)
};

// Backward-compat alias (existing components reference CARD.*)
const CARD = PALETTE;

// ============================================================
// HERO quick-nav — restructure order (owner directive 2026-09-15,
// «تحويل الرئيسية من Presentation إلى Product Website»): the chips
// mirror the SIX homepage acts now (Hero → Tools/AI → Library →
// Coaching → Memberships → Closing/FAQ) instead of the old 11-chip
// section-per-service catalog. EVO lives inside the Tools act; the
// three libraries + blog live in ONE discovery section (tabs);
// For-Coaches & Affiliate moved to the footer/header navigation;
// Newsletter moved into the shared footer.
// ============================================================
type HeroNavItem = {
  id: string;
  labelEn: string;
  labelAr: string;
  titleEn: string;
  titleAr: string;
  icon: LucideIcon;
  primary?: boolean;
  needsPosts?: boolean; // blog tab only renders when posts exist
  tab?: LibraryTab; // chip opens this tab of the library section
};

// ============================================================
// LIBRARY — the ONE discovery system (owner order 2026-09-15: «اجعل
// Exercises/Foods/Programs جزءًا من منظومة الاستكشاف، وليس 3 أقسام
// مبيعات منفصلة»). Four content families share one section; only the
// ACTIVE tab renders, so the homepage stops being a deck of parallel
// sales slides while every library keeps its homepage presence.
// ============================================================
type LibraryTab = "exercises" | "programs" | "foods" | "blog";

const LIBRARY_TABS: { id: LibraryTab; labelEn: string; labelAr: string }[] = [
  { id: "exercises", labelEn: "Exercises", labelAr: "التمارين" },
  { id: "programs", labelEn: "Programs", labelAr: "البرامج" },
  { id: "foods", labelEn: "Foods", labelAr: "الأطعمة" },
  { id: "blog", labelEn: "Blog", labelAr: "المدونة" },
];

// ============================================================
// Phase 195 (owner directive «الأرقام تعمل كـ proof لا قائمة مواصفات» +
// «اجعل الأعداد Dynamic من مصدر البيانات قدر الإمكان»): the library/content
// counts derive from the client-safe verified constants (pinned to the real
// arrays by library-counts.test.ts, and TOOLS_COUNT derives from the hub
// array in tools-shared.ts) — when the platform grows, these labels grow
// with it. "+" marks CONTENT VOLUME only; membership limits (2 generations,
// 3/6 swaps, 10 messages) never take "+".
// ============================================================
const EX_PLUS = `${EXERCISES_COUNT.toLocaleString("en-US")}+`;
const FOODS_PLUS = `${FOODS_COUNT.toLocaleString("en-US")}+`;
const TOOLS_PLUS = `${TOOLS_COUNT}+`;

const HERO_NAV: HeroNavItem[] = [
  { id: "memberships", labelEn: "Memberships", labelAr: "العضويات", titleEn: "Alkemos Premium memberships", titleAr: "عضويات Alkemos المميزة", icon: Crown, primary: true },
  { id: "tools", labelEn: "Free Tools", labelAr: "أدوات مجانية", titleEn: "Free fitness & nutrition tools — no signup", titleAr: "أدوات لياقة وتغذية مجانية بدون تسجيل", icon: Calculator },
  { id: "library", labelEn: "Library", labelAr: "المكتبة", titleEn: "Exercises, programs, foods, and scientific articles", titleAr: "التمارين والبرامج والأطعمة والمقالات العلمية", icon: Dumbbell },
  { id: "blog", labelEn: "Blog", labelAr: "المدونة", titleEn: "Scientific fitness articles", titleAr: "مقالات رياضية علمية", icon: BookOpen, needsPosts: true, tab: "blog" },
  { id: "coaching", labelEn: "Coaching", labelAr: "الكوتشينج", titleEn: "Online coaching with real coaches", titleAr: "كوتشينج أونلاين مع مدربين حقيقيين", icon: Users },
  { id: "faq", labelEn: "FAQ", labelAr: "أسئلة شائعة", titleEn: "Frequently asked questions", titleAr: "أسئلة شائعة", icon: CircleHelp },
];

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

export function LandingView() {
  const { lang } = useI18n();
  const { isCoach } = useAuth();
  const isAr = lang === "ar";

  const [latestPosts, setLatestPosts] = useState<BlogPostCard[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPostCard[]>([]);
  // 0037 «أعلن معنا» — coaches with a running ad (homepage featured strip)
  type FeaturedCoach = { slug: string | null; name: string; headline: string; photo: string | null };
  const [featuredCoaches, setFeaturedCoaches] = useState<FeaturedCoach[]>([]);
  // Restructure 2026-09-15: the active tab of the ONE library discovery
  // section (exercises / programs / foods / blog) — exercises by default.
  const [activeTab, setActiveTab] = useState<LibraryTab>("exercises");

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
        // Phase 118 (owner directive 2026-09-04): the old in-block "daily
        // shuffle" was seed-invariant (the daily seed added the SAME constant
        // to every post's char-code sum, so the order never changed) and the
        // featured pool was permanently locked to posts outside latest —
        // the featured carousel showed the same posts for weeks. Selection is
        // now delegated to selectHomeBlogCarousels (src/lib/blog.ts): featured
        // excludes ONLY what the latest carousel shows at this moment and
        // rotates deterministically every UTC day through the whole pool.
        const { latest, featured } = selectHomeBlogCarousels(posts);
        setLatestPosts(latest);
        setFeaturedPosts(featured);
      })();
    }, 2500);
  }, [lang]);

  // Dead code removed: streamImages array was built but never used
  // (hero was replaced with a static image — see comment below).

  const blogHref = isCoach ? "/admin/blog" : isAr ? "/ar/blog" : "/blog";

  // FAQ schema for SEO.
  // Owner SEO content plan (2026-09-03): the pairs below feed BOTH the
  // visible accordion AND the FAQPage JSON-LD above (single source).
  // Marketing-surface MSA law (Phase 178): Arabic copy stays فصحى — the
  // free-AI-generation pair (owner directive 2026-09-13) is MSA too.
  const faqs = [
    { q: isAr ? "هل أحتاج اشتراكًا لاستخدام الأدوات؟" : "Do I need a subscription to use the tools?", a: isAr ? `لا — الأدوات كلها (${TOOLS_COUNT} أداة: الحاسبات، ومخطط الوجبات، ومولدا خطط الذكاء الاصطناعي) مجانية ودون تسجيل.` : `No — all ${TOOLS_COUNT} tools (the calculators, the meal planner, and the two AI planners) are completely free without signup.` },
    { q: isAr ? "هل يمكنني تجربة توليد خطط الذكاء الاصطناعي مجانًا؟" : "Can I try AI plan generation for free?", a: isAr ? "نعم — التوليد جزء أساسي من التجربة المجانية: كل زائر يملك رصيدًا شهريًا موحدًا للتغذية والتمارين معًا (توليدان ناجحان شهريًا) بدون تسجيل، ويُحتسب التوليد الناجح فقط. بدون حساب تبقى خطتك على جهازك، وبحساب مجاني تُحفظ خططك دائمًا في حسابك وتتزامن عبر أجهزتك."
      : "Yes — generation is a core part of the free experience: every visitor gets one unified monthly pool for nutrition and workout combined (2 successful generations) with no signup, success-only counting. No account: your plan stays on this device. A free account saves your plans permanently in your account & syncs them across your devices.", },
    { q: isAr ? "ما الفرق بين Premium و Pro؟" : "What's the difference between Premium and Pro?", a: isAr ? "يمنحك Premium وصولًا غير محدود إلى EVO و4 خطط شهريًا، ويضيف Pro خططًا أكثر (8 شهريًا)، وتبديلات أسبوعية للوجبات والتمارين داخل خطتك، ونتائج محفوظة أكثر، دون إعلانات." : "Premium ($14.99/mo): unlimited EVO and 4 AI plans per month. Pro ($29.99/mo) adds more plans (8/month), weekly meal & exercise swaps within your plan, more saved results, and no ads." },
    { q: isAr ? "ما هي طرق الدفع المتاحة؟" : "What payment methods are available?", a: isAr ? "PayPal (الطريقة الرئيسية — فورية وآمنة)، InstaPay، و Vodafone Cash. PayPal يعالج الدفع تلقائيًا؛ الطرق اليدوية تتطلب رفع إيصال يُراجع خلال 24 ساعة." : "PayPal (primary — instant and secure), InstaPay, and Vodafone Cash. PayPal processes automatically; manual methods require uploading a receipt reviewed within 24 hours." },
    { q: isAr ? "كم عدد التمارين والأطعمة المتاحة؟" : "How many exercises and foods are there?", a: isAr ? `${EX_PLUS} تمرينًا و${FOODS_PLUS} صنف غذائي، والعدد يتزايد باستمرار.` : `${EX_PLUS} exercises with bilingual instructions and images, plus ${FOODS_PLUS} foods with calories and macros per 100g.` },
    { q: isAr ? "هل تدعم المنصة اللغة العربية؟" : "Does the site support Arabic?", a: isAr ? "نعم بالكامل — النسخة العربية موجّهة إلى الجمهور العربي كافة لا إلى بلد بعينه، والنسخة الإنجليزية موجّهة إلى العالم أجمع." : "Yes, fully bilingual (Arabic/English) with complete RTL support, Arabic mirror pages, and a blog with independent content per language." },
  ];
  const faqSchema = getFAQSchema(faqs);

  // Owner executive order Phase 117 (2026-09-04 — SEO/GEO audit): homepage
  // feature-comparison table vs traditional alternatives. ✅/❌ quick-scan
  // cells per the owner's directive; the "traditional personal trainer"
  // column surfaces the platform's added value. Cell values: "✅" | "❌" |
  // short AR/EN text pair for partial/nuanced cells.
  const comparisonRows: Array<{
    featureAr: string;
    featureEn: string;
    us: string;
    tradAr: string;
    tradEn: string;
    appsAr: string;
    appsEn: string;
  }> = [
    {
      featureAr: `مكتبة تمارين ${EX_PLUS} بشرح وافٍ`,
      featureEn: `${EX_PLUS} exercise library with full instructions`,
      us: "✅", tradAr: "❌", tradEn: "❌", appsAr: "جزئيًا", appsEn: "Partial",
    },
    {
      featureAr: `قاعدة أغذية ${FOODS_PLUS} بالسعرات والماكروز`,
      featureEn: `${FOODS_PLUS} food database with calories & macros`,
      // Phase 197 (owner directive): class-level ❌ cells were assumptions —
      // «بعضها/Some» is the honest cell for heterogeneous app classes.
      us: "✅", tradAr: "❌", tradEn: "❌", appsAr: "بعضها", appsEn: "Some",
    },
    {
      // 2026-09-15 (owner directive — comparison tables must reflect the
      // current service set): the 8-free-tools cluster was missing from
      // the quick table. TOOLS_PLUS derives from tools-shared.ts (Phase 195).
      featureAr: `${TOOLS_PLUS} أدوات مجانية (حاسبات ومتتبع ومخططات)`,
      featureEn: `${TOOLS_PLUS} free tools (calculators, tracker, planners)`,
      us: "✅", tradAr: "❌", tradEn: "❌", appsAr: "بعضها", appsEn: "Some",
    },
    {
      featureAr: "خطط تدريب وتغذية مخصصة",
      featureEn: "Custom workout & nutrition plans",
      us: "✅", tradAr: "✅", tradEn: "✅", appsAr: "خطط عامة فقط", appsEn: "Generic plans only",
    },
    {
      featureAr: "متابعة من مدربين معتمدين",
      featureEn: "Supervision by certified coaches",
      us: "✅", tradAr: "✅", tradEn: "✅", appsAr: "بعضها", appsEn: "Some",
    },
    {
      featureAr: "مساعد ذكاء اصطناعي متاح 24/7",
      featureEn: "AI coach available 24/7",
      us: "✅", tradAr: "❌", tradEn: "❌", appsAr: "بعضها", appsEn: "Some",
    },
    {
      featureAr: "برامج جاهزة لكل مستوى",
      featureEn: "Ready programs for every level",
      us: "✅", tradAr: "❌", tradEn: "❌", appsAr: "محدودة", appsEn: "Limited",
    },
    {
      featureAr: "دعم عربي كامل (RTL)",
      featureEn: "Full Arabic support (RTL)",
      us: "✅", tradAr: "حسب المدرب", tradEn: "Per coach", appsAr: "❌", appsEn: "❌",
    },
    {
      // 2026-09-15 (owner directive — service coverage): the public
      // affiliate program (20% commission, affiliate-constants.ts) joins
      // the quick table — honest class-level cells for the other columns.
      featureAr: "برنامج أفلييت (عمولة 20%)",
      featureEn: "Affiliate program (20% commission)",
      us: "✅", tradAr: "❌", tradEn: "❌", appsAr: "بعضها", appsEn: "Some",
    },
    {
      featureAr: "التكلفة الشهرية",
      featureEn: "Monthly cost",
      // Phase 132 (owner feedback: «جدول المقارنة فيه كلمة عربي في وضع
      // اللغة الإنجليزية»): the Alkemos cell was hardcoded Arabic — now
      // language-aware like the trainer/apps cells.
      us: isAr ? "مجانًا / من $14.99" : "Free / from $14.99", tradAr: "$20–50 للجلسة", tradEn: "$20–50/session", appsAr: "مجاني بإعلانات", appsEn: "Free with ads",
    },
  ];

  // Phase 131 (owner feedback «جدول المقارنه حاليا يشبة الكروت، عدلة الى
  // شكل جدول»): ONE real table renders at EVERY breakpoint now, so this
  // cell renderer serves all four columns — ✅→engraved check-seal,
  // ❌→faint ×, any other string→literal text (compact sizing below md
  // so the 4-column grid stays readable on phones).
  const renderCmpValue = (raw: string, highlight: boolean) =>
    raw === "✅" ? (
      <EngravedIcon
        name="checkseal"
        alt=""
        size={22}
        className={`mx-auto h-4 w-4 md:h-5 md:w-5${highlight ? "" : " opacity-60"}`}
      />
    ) : raw === "❌" ? (
      <span style={{ color: "var(--muted-foreground)", opacity: 0.5 }} aria-label="No">×</span>
    ) : (
      <span className="leading-snug" style={{ color: highlight ? "var(--text)" : "var(--muted-foreground)" }}>{raw}</span>
    );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* FAQ Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}
      />

      <SiteHeader variant="landing" />

      {/* ===================== 1. HERO — Phase 131 (owner feedback on 128) ===================== */}
      {/* Owner directives 2026-09-06 (Phase 131): (1) the stats subline
          («868+ exercises • 8,830+ foods • EVO AI coach 24/7») is REMOVED;
          (2) the chrome logo, the H1, and the seal chips are one step
          smaller; (3) they now sit INSIDE the artwork — the hero is ONE
          overlay scene: artwork = absolute cover layer (.hero-bg, theme
          pair, eager LCP; root layout <link preload> still matches), the
          content centered on top (luminance-verified: the artwork center
          is clean in both themes → full contrast, no veil). The complete-
          artwork guarantee from Phase 128 stays as a CSS min-height floor
          (natural aspect on phones/tablets, 92vh on wide screens — see
          .hero-art in globals.css). History: Phase 127 scrubbed the baked
          logo from the artwork + removed the old CTAs/eyebrow. */}
      <section className="hero-art relative w-full">
        {/* Artwork layer — absolute cover, theme-swapped pair, eager (LCP).
            Phase 136: fetchPriority=high (Lighthouse lcp-discovery flagged
            the LCP request un-prioritized) + responsive srcset — mobile
            fetches hero-*-640.webp (12.4KB) instead of the 1280w original
            (37.3KB light / 66.9KB dark). */}
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
          {/* Silver-chrome brand lockup (owner artwork, theme pair).
              Phase 136: the 760×606 original was served to phones that
              render it at 128×102 — Lighthouse image-delivery flagged 96KB
              waste. srcset now serves 256w (23.4KB) on phones, 512w on
              retina, 760w on lg screens; explicit width/height (matching
              the light variant's intrinsic aspect 760:606) reserves the
              layout box pre-load (unsized-images audit). The root layout
              preload mirrors this srcset via imageSrcSet. */}
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
          {/* Phase 194 (owner directive — Copy Refinement Pass): the generic
              positioning line is replaced with the owner's positioning
              («Train smarter. Eat with precision. Progress with intelligence.»
              / «تدرّب بذكاء. تغذَّ بدقة. وتقدّم بوعي.»), and a one-platform
              subtitle explains that Alkemos unifies training, nutrition,
              smart planning, and progress — instead of reading as a bundle
              of separate tools. Feature numbers stay as proof chips below. */}
          <h1 className="hero-copy font-display mt-3 text-2xl font-semibold leading-tight tracking-tight md:mt-5 md:text-5xl lg:text-6xl" style={{ color: PALETTE.textPrim }}>
            {isAr ? "تدرّب بذكاء. تغذَّ بدقة. وتقدّم بوعي." : "Train smarter. Eat with precision. Progress with intelligence."}
          </h1>
          <p className="hero-copy mx-auto mt-3 max-w-xl text-sm font-normal leading-relaxed md:mt-4 md:text-base" style={{ color: PALETTE.textSec }}>
            {isAr
              ? "منصة واحدة تجمع التدريب والتغذية والتخطيط الذكي ومتابعة التقدم — كل ما تحتاجه لرحلتك في مكان واحد."
              : "One platform that brings training, nutrition, smart planning, and progress tracking together — everything you need in one place."}
          </p>

          {/* Restructure order (owner directive 2026-09-15 — «CTA أساسي
              واحد بوزن بصري واضح + ثانويات أقل بروزًا»): ONE primary chrome
              button owns the hero at the unified closing-CTA size; tools
              discovery demotes to a quiet text link. Supersedes the
              Phase-198 equal pair; still inside the artwork (Phase 131). */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 md:mt-6">
            <a href={isAr ? "/ar/memberships" : "/memberships"} className="btn-chrome px-7 py-3 text-sm md:px-8 md:py-3.5 md:text-base">
              {isAr ? "ابدأ مجانًا" : "Start Free"}
              <span className="rtl:rotate-180">›</span>
            </a>
            <a
              href="#tools"
              className="text-sm font-medium underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70"
              style={{ color: PALETTE.textSec }}
            >
              {isAr ? "استكشف الأدوات المجانية" : "Explore Free Tools"}
              <span className="rtl:rotate-180">›</span>
            </a>
          </div>

          {/* Stat chips — engraved seals (mission §3), hero-scoped smaller
              (owner: «تصغير … الازرار قليلا» — .hero-seals in globals.css) */}
          <div className="hero-seals mt-4 flex flex-wrap items-center justify-center gap-2 md:mt-6 md:gap-3">
            <span className="seal-chip">
              <EngravedIcon name="dumbbell" alt="" size={14} className="h-3 w-3" />
              {isAr ? `${EX_PLUS} تمرين` : `${EX_PLUS} EXERCISES`}
            </span>
            <span className="seal-chip">
              <EngravedIcon name="hydration" alt="" size={14} className="h-3 w-3" />
              {isAr ? `${FOODS_PLUS} صنفًا غذائيًا` : `${FOODS_PLUS} FOODS`}
            </span>
            {/* Phase 195 (owner directive): the tools count is proof of depth
                too — 8 real tools on the hub, dynamic from tools-shared.ts. */}
            <span className="seal-chip">
              <EngravedIcon name="calories" alt="" size={14} className="h-3 w-3" />
              {isAr ? `${TOOLS_PLUS} أدوات مجانية` : `${TOOLS_PLUS} FREE TOOLS`}
            </span>
            <span className="seal-chip">
              <EngravedIcon name="evo" alt="" size={14} className="h-3 w-3" />
              {isAr ? "EVO مدرب ذكي 24/7" : "EVO AI COACH 24/7"}
            </span>
          </div>

          {/* (Phase 125, owner directive: the section-navigation chips moved
              OUT of the hero into their own section directly below it —
              keeps the hero clean and the artwork clearly visible.) */}
        </div>
      </section>

      {/* Greek meander divider — mission §4 */}
      <div className="meander-divider" aria-hidden="true" />

      {/* ===================== 2. SECTION QUICK-NAV — owner directive Phase 125: hero buttons moved below the hero ===================== */}
      {/* Owner directive 2026-08-30 (rev. 2026-09-06): hero buttons = section
          navigation for the WHOLE homepage (beautiful chips). EVO is a service
          inside subscriptions — not a hero CTA — so it's just one chip among
          all sections. Memberships keeps the single filled primary chip; all
          chips smooth-scroll to their section id. */}
      <section className="px-4 pb-10 pt-2 md:pb-14" style={{ backgroundColor: PALETTE.sectionWhite }}>
        <nav aria-label={isAr ? "التنقل بين أقسام الصفحة" : "Jump to a section"} className="mx-auto max-w-6xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: PALETTE.textMuted }}>
            {isAr ? "استكشف أقسام الموقع" : "Explore the site"}
          </p>
          {/* Phase 198 Batch 3 (audit H4/M-mobile): on phones the 11 chips
              wrapped into ~4 rows (≈570px before any content) — they are ONE
              horizontal snap-scroll row on mobile now (≈60px), and keep the
              centered wrap on md+. Direction-safe: overflow-x + snap follow
              dir=rtl natively. */}
          <div className="scrollbar-none -mx-4 mt-3 flex snap-x items-center gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:justify-center md:overflow-x-visible md:px-0">
                {HERO_NAV.filter((s) => !s.needsPosts || latestPosts.length > 0).map((s) => {
                  const Icon = s.icon;
                  const isPrimary = !!s.primary;
                  return (
                    <a
                      key={s.id}
                      href={`#${s.tab ? "library" : s.id}`}
                      onClick={() => {
                        // Restructure 2026-09-15: the Blog chip scrolls to the
                        // library section AND activates its tab.
                        if (s.tab) setActiveTab(s.tab);
                      }}
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

      {/* (removed: "What is Alkemos?" section — Phase 117 correction 2026-09-04, owner directive: duplicated the hero; best phrases merged into the hero subtitle above, CenteredSection deleted as now-unused) */}

      {/* ===================== 3. FREE TOOLS — with the FREE AI generation
          banner (owner directive 2026-09-13): AI plan generation is a CORE
          part of the free experience — not just Libraries/Tools — so it
          gets the section's lead card with the unified-pool message.
          Final Visual Review (2026-09-15, owner directive «التسلسل البصري
          Free → EVO → Coaching → Memberships»): this FREE experience
          section now comes FIRST — the EVO preview card follows it below. */}
      <section id="tools" className="scroll-mt-20 bg-[var(--tint)] px-4 py-12 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <Reveal>
              {/* Phase 194 (benefit-first pass): the headline sells the
                  outcome (knowing your body's numbers) — the tools are the
                  proof, not the story. */}
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {isAr ? "اعرف ما يحتاجه جسمك بالأرقام" : "Know What Your Body Needs — In Numbers"}
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mx-auto mt-3 max-w-md text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
                {isAr ? `${TOOLS_PLUS} أدوات مجانية تحوّل هدفك إلى أهداف يومية واضحة — بدون تسجيل.` : `${TOOLS_PLUS} free tools that turn your goal into clear daily targets — no signup required.`}
              </p>
            </Reveal>
          </div>
          {/* FREE AI PLAN GENERATION — the flagship of the free experience
              (owner directive 2026-09-13). Phase 194 (owner directive —
              Copy Refinement Pass): the card now LEADS with the benefit
              (a plan built for you) instead of system mechanics — the
              unified-pool / success-only / save-ladder details stay,
              demoted to ONE small secondary line so no required info is
              lost (quotas & behavior untouched). */}
          <Reveal delay={150}>
            <div className="marble-card mt-8 p-6 md:p-8">
              <div className="flex flex-col items-center gap-5 text-center md:flex-row md:text-start">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-[var(--edge)] bg-[var(--tint)]">
                  <EngravedIcon name="evo" alt="" size={30} className="h-7 w-7" />
                </span>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold tracking-tight md:text-2xl" style={{ color: PALETTE.textPrim }}>
                    {isAr ? "خطتك، مصممة لك." : "Your plan. Built for you."}
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
                      ? "توليدان ناجحان شهريًا لكل زائر، ويُحتسب التوليد الناجح فقط · بدون حساب تبقى خطتك على جهازك · بحساب مجاني تُحفظ وتتزامن عبر أجهزتك · والباقات المدفوعة تمنح إدارة أوسع حسب باقتك."
                      : "2 successful generations/month for every visitor, success-only counting · No account: your plan stays on this device · Free account: saved & synced across devices · Paid tiers add broader management per plan."}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  {/* Owner directive (2026-09-13): ONE direct CTA label on the
                      primary button. Phase 194: the label sells the action
                      (Create My Plan / أنشئ خطتي) per the benefit-first pass. */}
                  {/* Access-point fix (2026-09-14 audit): locale-aware hrefs —
                      the AR homepage was linking the EN planners. */}
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
            {/* Restructure order (owner directive 2026-09-15 — «صفحة أقصر
                وأسهل تصفحًا، Mobile-first»): the grid shows the FOUR
                goal-essential tools; Body-Fat & Water Tracker stay fully
                available via «كل الأدوات» + the /tools hub + the footer
                (display-only curation — no tool, route, or quota touched).
                The AI planners remain the lead card above (§12.31/§12.32
                retired), NOT grid tools. */}
            {[
              { slug: "calorie-calculator", nameAr: "حاسبة السعرات الحرارية", nameEn: "Calorie Calculator", descAr: "اعرف احتياجك اليومي من السعرات والماكروز بدقة، بدون تسجيل.", descEn: "Find your daily calorie and macro needs — no signup", icon: "calories", href: "/tools/calorie-calculator" },
              { slug: "macro-calculator", nameAr: "حاسبة الماكروز", nameEn: "Macro Calculator", descAr: "وزّع سعرات يومك على بروتين وكارب ودهون بسهولة.", descEn: "Split your calories into protein, carbs, and fat", icon: "macros", href: "/tools/macro-calculator" },
              { slug: "bmi-calculator", nameAr: "حاسبة كتلة الجسم BMI", nameEn: "BMI Calculator", descAr: "اعرف هل وزنك ضمن المعدل الصحي.", descEn: "Check whether your weight is in the healthy range", icon: "bmi", href: "/tools/bmi-calculator" },
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

          {/* EVO — merged INTO the Tools/AI act (owner order 2026-09-15:
              «دمج EVO داخل تجربة Tools/AI بدل عرضه كـSection مستقل بلا
              وظيفة واضحة» — supersedes the standalone #evo section of
              Phases 127/128/131 and the 2026-09-15 «Free → EVO» ordering).
              The warrior card keeps its §7.3 recipe (art + fade mask, RTL
              mirror, slim min-height from audit H5) and now carries ONE
              benefit line so it explains EVO instead of just titling it.
              The floating EVO widget stays the access point (owner
              directive 2026-09-14) — no new CTA added. */}
          <div className="evo-hero-card marble-card relative mt-10 w-full">
            <div className="evo-hero-art" aria-hidden="true">
              <ThemeImg
                light="/images/brand/evo-hero-light.webp"
                dark="/images/brand/evo-hero-dark.webp"
                alt=""
                className="h-full w-full object-cover"
                width={640}
                height={675}
                srcSetLight="/images/brand/evo-hero-light-400.webp 400w, /images/brand/evo-hero-light-512.webp 512w, /images/brand/evo-hero-light.webp 640w"
                srcSetDark="/images/brand/evo-hero-dark-400.webp 400w, /images/brand/evo-hero-dark-512.webp 512w, /images/brand/evo-hero-dark.webp 640w"
                sizes="(max-width: 768px) 300px, 560px"
              />
            </div>
            <div className="relative z-10 flex min-h-[220px] flex-col justify-center gap-3 p-7 md:min-h-[260px] md:p-10 lg:max-w-[56%]">
              <h3 className="text-2xl font-semibold tracking-tight md:text-3xl" style={{ color: PALETTE.textPrim }}>
                {isAr ? "EVO: مدربك الذكي 24/7" : "EVO: Your 24/7 Smart Coach"}
              </h3>
              <p className="text-sm font-normal leading-relaxed md:text-base" style={{ color: PALETTE.textSec }}>
                {isAr
                  ? "اسأله عن تمرينك أو وجبتك، واطلب تعديل خطتك في أي وقت — 10 رسائل يوميًا مجانًا، وبلا حدود من Premium."
                  : "Ask about your workout or meal and adjust your plan anytime — 10 messages a day free, unlimited from Premium."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== LIBRARY — ONE discovery system =====================
          Restructure order (owner directive 2026-09-15): Exercises,
          Programs, Foods, and Blog stop being four parallel sections with
          identical anatomy (centered H2 + sub + card grid + CTA + meander
          — the "presentation deck" pattern) and become ONE exploration
          hub with tabs. Only the ACTIVE tab renders, so the page loses
          ~3 sections of height while every library keeps its homepage
          presence, its cards, and its "view all" link. Card shapes stay
          per-family (Visual UI Refinement 2026-09-15) and the blog
          selection logic (selectHomeBlogCarousels) is untouched. */}
      <section id="library" className="scroll-mt-20 bg-[var(--bg)] px-4 py-12 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {isAr ? "مكتبة واحدة للتدريب والغذاء والمعرفة" : "One Library for Training, Food, and Knowledge"}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? `${EX_PLUS} تمرينًا، وبرامج جاهزة، و${FOODS_PLUS} صنفًا غذائيًا، ومقالات علمية — اختر من حيث تبدأ.`
                : `${EX_PLUS} exercises, ready-made programs, ${FOODS_PLUS} foods, and scientific articles — pick where to start.`}
            </p>
          </div>

          {/* Tabs — one control, four content families. The blog tab
              renders only when posts loaded (the needsPosts law). */}
          <div role="tablist" aria-label={isAr ? "أقسام المكتبة" : "Library sections"} className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {LIBRARY_TABS.filter((t) => t.id !== "blog" || latestPosts.length > 0).map((t) => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  id={`library-tab-${t.id}`}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(t.id)}
                  className="rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300"
                  style={
                    isActive
                      ? { backgroundColor: "var(--card)", color: "var(--text)", border: "var(--border-chrome)" }
                      : { backgroundColor: "transparent", color: "var(--muted-foreground)", border: "1px solid var(--edge)" }
                  }
                >
                  {isAr ? t.labelAr : t.labelEn}
                </button>
              );
            })}
          </div>

          <div role="tabpanel" aria-labelledby={`library-tab-${activeTab}`} className="mt-10">
            {activeTab === "exercises" && (
              <>
                {/* Phase 198 Batch 3 (audit Tablet): 4 columns at 768px made
                    ~172px cards — 3 columns on md, 4 from lg up. */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {/* Audit 2026-08-30: ALL 7 real muscle groups (never the
                      empty "Cardio") + an 8th browse-all tile. */}
                  {[
                    { labelAr: "صدر", labelEn: "Chest", slug: "chest" },
                    { labelAr: "ظهر", labelEn: "Back", slug: "back" },
                    { labelAr: "أكتاف", labelEn: "Shoulders", slug: "shoulders" },
                    { labelAr: "أرجل", labelEn: "Legs", slug: "legs" },
                    { labelAr: "بايسبس", labelEn: "Biceps", slug: "biceps" },
                    { labelAr: "ترايسبس", labelEn: "Triceps", slug: "triceps" },
                    { labelAr: "بطن/كور", labelEn: "Core", slug: "core" },
                  ].map((cat) => (
                    <LandingExerciseCategoryCard
                      key={cat.slug}
                      cat={{ ...cat, count: EXERCISE_CATEGORY_COUNTS[cat.slug] ?? 0 }}
                      isAr={isAr}
                    />
                  ))}
                  {/* 8th tile — browse-all. Restructure 2026-09-15: a quiet
                      marble tile now (was a chrome tile) — the ONE-primary-CTA
                      law; the library browses, it doesn't sell. */}
                  <a
                    href={isAr ? "/ar/exercises" : "/exercises"}
                    className="marble-card group flex h-full flex-col items-center justify-center p-4 text-center transition-transform duration-300 hover:-translate-y-0.5"
                    style={{ color: PALETTE.textPrim }}
                  >
                    <EngravedIcon name="dumbbell" alt="" size={40} className="h-10 w-10" />
                    <span className="mt-2 text-base font-semibold">{isAr ? "كل التمارين" : "All Exercises"}</span>
                    <span className="mt-1 text-xs font-medium" style={{ color: PALETTE.textMuted }}>
                      {EXERCISES_COUNT.toLocaleString()}+ {isAr ? "تمرين" : "exercises"}
                    </span>
                  </a>
                </div>
              </>
            )}
            {activeTab === "programs" && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    { icon: "house", levelAr: "مبتدئ", levelEn: "Beginner", titleAr: "منزلي بدون معدات", titleEn: "Home (No Equipment)", descAr: "تمارين بالوزن فقط", descEn: "Bodyweight only", slug: "home-beginner-fullbody", image: "/images/programs/home-workout.png" },
                    { icon: "rack", levelAr: "متوسط", levelEn: "Intermediate", titleAr: "جيم كامل", titleEn: "Full Gym", descAr: "بمعدات كاملة", descEn: "Full equipment", slug: "gym-ppl-intermediate", image: "/images/programs/full-gym.png" },
                    { icon: "runner", levelAr: "متقدم", levelEn: "Advanced", titleAr: "حرق دهون HIIT", titleEn: "Fat Loss HIIT", descAr: "حارب الدهون بسرعة", descEn: "Burn fat fast", slug: "home-fat-loss-hiit", image: "/images/programs/hiit.png" },
                  ].map((prog) => (
                    <LandingProgramCard key={prog.slug} prog={prog} isAr={isAr} />
                  ))}
                </div>
                {/* Restructure 2026-09-15: the per-section chrome CTA buttons
                    demote to quiet text links (ONE primary CTA law). */}
                <div className="mt-8 text-center">
                  <a href={isAr ? "/ar/programs" : "/programs"} className="text-sm font-semibold underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70" style={{ color: PALETTE.textPrim }}>
                    {isAr ? "كل البرامج ›" : "View all programs ›"}
                  </a>
                </div>
              </>
            )}
            {activeTab === "foods" && (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    { icon: "protein", titleAr: "بروتين", titleEn: "Protein", descAr: "لحم، دجاج، بيض", descEn: "Meat, chicken, eggs", slug: "protein", image: "/images/categories/foods/protein.png" },
                    { icon: "carbs", titleAr: "كارب", titleEn: "Carbs", descAr: "أرز، شوفان، بطاطس", descEn: "Rice, oats, potato", slug: "carb", image: "/images/categories/foods/carb.png" },
                    { icon: "fats", titleAr: "دهون", titleEn: "Fats", descAr: "أفوكادو، مكسرات", descEn: "Avocado, nuts", slug: "fat", image: "/images/categories/foods/fat.png" },
                    { icon: "fruits", titleAr: "فواكه", titleEn: "Fruits", descAr: "طازجة وصحية", descEn: "Fresh and healthy", slug: "fruit", image: "/images/categories/foods/fruit.png" },
                  ].map((cat) => (
                    <LandingFoodCategoryCard key={cat.titleEn} cat={cat} isAr={isAr} />
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <a href={isAr ? "/ar/foods" : "/foods"} className="text-sm font-semibold underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70" style={{ color: PALETTE.textPrim }}>
                    {isAr ? "تصفّح كل الأطعمة ›" : "Browse all foods ›"}
                  </a>
                </div>
              </>
            )}
            {activeTab === "blog" && latestPosts.length > 0 && (
              <>
                {/* Phase 198 Batch 2 (audit H2): ONE carousel — featured
                    posts lead the row as dark cards, latest follows. */}
                <BlogCarousel
                  posts={[...featuredPosts, ...latestPosts].slice(0, 10)}
                  featuredSlugs={featuredPosts.map((p) => p.slug)}
                  isAr={isAr}
                />
                <div className="mt-6 text-center">
                  <a href={blogHref} className="text-sm font-semibold underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70" style={{ color: PALETTE.textPrim }}>
                    {isAr ? "كل المقالات ›" : "View all articles ›"}
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Greek meander divider — mission §4. Restructure 2026-09-15: the
          dividers now mark the TWO narrative acts (exploration ends /
          premium offer begins) instead of separating every section —
          background alternation handles the rest of the rhythm. */}
      <div className="meander-divider" aria-hidden="true" />
      {/* ===================== 9. COACHING — PREMIUM SPOTLIGHT ===================== */}
      {/* Visual UI Refinement (2026-09-15, owner directive): the section was
          a plain centered feature list (4 tint cards + a button pair) that
          read as "just another section" — and the dark For-Coaches band
          right below it was stealing its premium thunder. It is now the
          page's paid-offer SPOTLIGHT: ONE dark marble card with the 2px
          chrome-gradient ring (the established identity treatment of the
          top-tier cards — Pro here, Coaching on /coaching), a split
          composition (copy column + 4-pillar grid), and a single direct
          CTA to the real coaching page. Display-only: no prices, quotas,
          destinations, or section order changed. The CTA wording deliberately
          avoids any phrasing that could imply a separate per-session
          booking service (coaching is one membership on /coaching).
          Final Visual Review (2026-09-15, owner directive «خفّف كثافة
          المحتوى واجعل CTA الرئيسي أوضح»): DENSITY pass, display-only —
          (1) the paragraph drops to ONE line (the Pro-features sentence
          lives on the reassurance line under the CTA; the plans detail
          lives in the pillar titles — zero facts lost from the card);
          (2) the CTA is the sole element of its row at the unified card
          size (px-8/py-3.5, full-width on phones) with the reassurance
          directly beneath it and the quiet compare link demoted to the
          last line; (3) the four pillars lose their per-tile descriptions
          (icon + title chips — the titles carry the message, ~160px
          shorter on mobile). No price, quota, link, or color changes. */}
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
                  {isAr ? "كوتشينج أونلاين · الباقة الأعلى" : "ONLINE COACHING · TOP TIER"}
                </span>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  {isAr ? "كوتشينج حقيقي، لا مجرد PDF" : "Real Coaching, Not Just a PDF"}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base font-normal leading-relaxed md:text-lg lg:mx-0" style={{ color: "#B9BEC4" }}>
                  {/* Final Visual Review (2026-09-15): ONE line — the
                      Pro-features clause moved to the reassurance line
                      under the CTA, the plans detail to the pillar titles. */}
                  {isAr
                    ? "مدرب بشري يبني خططك ويتابع تقدمك أسبوعيًا — ومعه EVO بلا حدود."
                    : "A human coach builds your plans and follows your progress weekly — with unlimited EVO at your side."}
                </p>
                {/* One direct CTA → the real coaching page (it explains the
                    plan, how coaching works, and the price — NOT a session
                    booking flow). Final Visual Review (2026-09-15): the CTA
                    owns its row alone at the unified card size (full-width
                    on phones); the reassurance sits directly beneath it and
                    the quiet compare link is demoted to the LAST line so the
                    primary action reads unmistakably first. */}
                <div className="mt-8 flex flex-col items-center gap-3 lg:items-start">
                  <a
                    href={isAr ? "/ar/coaching" : "/coaching"}
                    className="btn-chrome w-full px-8 py-3.5 text-base sm:w-auto"
                  >
                    {isAr ? "ابدأ مع مدربك الشخصي" : "Start with a Personal Coach"}
                    <span className="rtl:rotate-180">›</span>
                  </a>
                  <p className="text-xs font-normal leading-relaxed" style={{ color: "#8A9096" }}>
                    {isAr ? "كل مميزات Pro مدرجة · استرداد كامل خلال 7 أيام" : "All Pro features included · Full 7-day refund"}
                  </p>
                  <a
                    href={isAr ? "/ar/memberships" : "/memberships"}
                    className="text-sm font-semibold underline decoration-[#3A3F45] underline-offset-4 transition-opacity hover:opacity-70"
                    style={{ color: "#C9CED3" }}
                  >
                    {isAr ? "قارن الباقات" : "Compare plans"}
                  </a>
                </div>
              </div>
              {/* The four coaching pillars — Human Coach + Personalized
                  Plans + Follow-up + EVO (owner directive 2026-09-15).
                  Final Visual Review (2026-09-15): compact icon+title chips
                  (descriptions removed — the one-line paragraph and the
                  /coaching page carry the detail; the card reads lighter). */}
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

      {/* ===================== 9.5 FEATURED COACHES («أعلن معنا» ads) ===================== */}
      {/* Restructure 2026-09-15: bg tint → bg so the strip never merges
          with the Memberships tint band when active (display-only). */}
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

      {/* (removed: For-Coaches B2B section — restructure order 2026-09-15:
          «إخراج B2B / For Coaches من الصفحة الرئيسية ونقله إلى الـFooter/
          Navigation»). The pitch moved to the SHARED footer Partners list +
          the header Partners group (SiteFooter.tsx / SiteHeader.tsx); the
          /for-coaches + /ar/for-coaches pages, registration, and all
          business logic are untouched. The B2B recruit band no longer
          interrupts the B2C funnel between Coaching and Memberships. */}

      {/* ===================== 10. Premium Memberships ===================== */}
      <section id="memberships" className="scroll-mt-20 px-4 py-12 md:py-20" style={{ backgroundColor: PALETTE.sectionGray }}>
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl" style={{ color: PALETTE.textPrim }}>
              {isAr ? "اختر الباقة المناسبة لك" : "Choose the Right Plan for You"}
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="mx-auto mt-4 max-w-2xl text-base font-normal md:text-lg" style={{ color: PALETTE.textSec }}>
              {isAr
                ? "الخطة المجانية تجربة حقيقية للمنتج كاملًا. عندما يكبر استخدامك: بريميوم لإدارة خططك وحفظها، وبرو لتكييفها وتحسينها، وكوتشينج عندما تريد مدربًا بشريًا مع كل قوة الذكاء الاصطناعي."
                : "The Free plan is the real product experience. When your usage grows: Premium to manage your plans, Pro to adapt & optimize them, Coaching for a human coach with full AI power."}
            </p>
          </Reveal>

          {/* Phase 198 Batch 2 (audit H6): THREE equal-tier cards now —
              Free joins Premium/Pro as a real marble-card (it was a text
              mention below the grid, and the section ran ≈1,451px). Pro
              stays the visual hero (dark card + chrome ring); the free-tier
              copy below the grid collapses into the card (same facts,
              canary-safe phrases) and only the compare link remains. */}
          <div className="mt-10 grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {/* Free tier — real card (audit H6) */}
            <Reveal delay={150} className="h-full">
              <a
                href={isAr ? "/ar/memberships" : "/memberships"}
                className="marble-card group flex h-full flex-col p-7 transition-transform duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>
                    {isAr ? "مجاني" : "Free"}
                  </h3>
                  <div className="flex items-end gap-1">
                    <span className="chrome-text text-2xl font-bold tracking-tight">$0</span>
                    <span className="pb-0.5 text-xs font-normal" style={{ color: PALETTE.textSec }}>/{isAr ? "شهر" : "mo"}</span>
                  </div>
                </div>
                <p className="mt-3 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
                  {isAr ? "المنتج الكامل، لا نسخة معطلة — ابدأ بدون حساب وارقِ عندما يكبر استخدامك." : "The full product, not a demo — start without an account and upgrade when your usage grows."}
                </p>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {(isAr
                    ? [`${EX_PLUS} تمرينًا و${FOODS_PLUS} صنفًا غذائيًا`, `${TOOLS_PLUS} أدوات مجانية — بدون تسجيل`, "توليدا خطط AI شهريًا (حتى بدون تسجيل)", "EVO — 10 رسائل يوميًا"]
                    : [`${EX_PLUS} exercises + ${FOODS_PLUS} foods`, `${TOOLS_PLUS} free tools — no signup`, "2 AI plan generations/month (even without signup)", "EVO — 10 messages/day"]
                  ).map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--text)" }} aria-hidden="true" />
                      <span style={{ color: PALETTE.textSec }}>{f}</span>
                    </li>
                  ))}
                </ul>
                  <div className="mt-auto pt-7">
                  {/* Phase 198 Batch 3 (audit M1): card CTAs share ONE size —
                      py-3.5 text-base (≈54px) across Free/Premium/Pro. */}
                  <span
                    className="btn-outline flex w-full items-center justify-center gap-2 px-6 py-3.5 text-base"
                  >
                    {isAr ? "ابدأ مجانًا" : "Start free"}
                    <span className="rtl:rotate-180">›</span>
                  </span>
                </div>
              </a>
            </Reveal>

            {/* Premium tier — clean white card with checklist */}
            <Reveal delay={200} className="h-full">
              <a
                href={isAr ? "/ar/memberships" : "/memberships"}
                className="marble-card group flex h-full flex-col p-7 transition-transform duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>
                    {isAr ? "بريميوم" : "Premium"}
                  </h3>
                  <div className="flex items-end gap-1">
                    <span className="chrome-text text-2xl font-bold tracking-tight">$14.99</span>
                    <span className="pb-0.5 text-xs font-normal" style={{ color: PALETTE.textSec }}>/{isAr ? "شهر" : "mo"}</span>
                  </div>
                </div>
                <p className="mt-3 text-sm font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>
                  {/* §12.50-أ-2: the save ladder moved here — permanent save +
                      cross-device sync is the FREE-ACCOUNT benefit (§185);
                      Premium sells the MANAGEMENT delta, mirroring
                      memberships.ts tagline. */}
                  {isAr ? "أدر خططك: EVO بلا حدود، سعة حفظ أكبر، وتصدير كامل." : "Manage your plans: unlimited EVO, bigger save capacity, and full export."}
                </p>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {(isAr
                    ? ["EVO غير محدود", "4 خطط AI شهرياً (تغذية أو تمرين)", "50 نتيجة محفوظة", "تصدير مخطط الوجبات والنتائج"]
                    : ["Unlimited EVO", "4 AI plan generations per month (nutrition or workout)", "50 saved results", "Meal-plan & results export"]
                  ).map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--text)" }} aria-hidden="true" />
                      <span style={{ color: PALETTE.textSec }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-7">
                  <span
                    className="btn-chrome flex w-full items-center justify-center gap-2 px-6 py-3.5 text-base"
                  >
                    {isAr ? "اشترك الآن" : "Subscribe now"}
                    <span className="rtl:rotate-180">›</span>
                  </span>
                </div>
              </a>
            </Reveal>

            {/* Pro tier — featured dark card (the hero offer) */}
            <Reveal delay={300} className="h-full">
              <a
                href={isAr ? "/ar/memberships" : "/memberships"}
                className="marble-card group relative flex h-full flex-col p-7 transition-transform duration-300 hover:-translate-y-0.5"
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
                {/* 2px chrome ring (mission §12) — implemented as the gradient
                    border above; the old blue glow removed */}
                <div className="relative flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold tracking-tight text-white">{isAr ? "برو" : "Pro"}</h3>
                    <span className="seal-chip" style={{ color: "#F5F5F7", borderColor: "#3A3F45" }}>
                      <EngravedIcon name="laurel" alt="" size={12} className="h-3 w-3" />
                      {isAr ? "الأكثر شعبية" : "Popular"}
                    </span>
                  </div>
                  <div className="flex items-end gap-1">
                    {/* chrome-text-on-dark (Phase 198, audit C3): this card is
                        #0B0B0D in BOTH themes — light mode must keep the
                        light metal ramp here, not the new dark-steel one. */}
                    <span className="chrome-text chrome-text-on-dark text-3xl font-bold tracking-tight">$29.99</span>
                    <span className="pb-1 text-xs font-normal text-[#9BA0A6]">/{isAr ? "شهر" : "mo"}</span>
                  </div>
                </div>
                <p className="relative mt-3 text-sm font-normal leading-relaxed text-[#9BA0A6]">
                  {isAr ? "كيّف خططك وارتقِ: 8 توليدات خطط AI شهريًا و6 تبديلات للوجبات أو التمارين أسبوعيًا — بلا إعلانات." : "Adapt & optimize: 8 AI plan generations/month, 6 meal/exercise swaps per week — ad-free."}
                </p>
                <ul className="relative mt-5 space-y-2.5 text-sm">
                  {(isAr
                    ? ["كل مميزات Premium", "8 خطط AI شهرياً (تغذية أو تمرين)", "6 تبديلات للوجبات أو التمارين أسبوعيًا", "200 نتيجة محفوظة", "بدون إعلانات"]
                    : ["Everything in Premium", "8 AI plan generations per month (nutrition or workout)", "6 meal/exercise swaps per week", "200 saved results", "No ads"]
                  ).map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#C9CED3" }} aria-hidden="true" />
                      <span className="text-[#B9BEC4]">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="relative mt-auto pt-7">
                  <span
                    className="btn-chrome flex w-full items-center justify-center gap-2 px-6 py-3.5 text-base"
                  >
                    {isAr ? "اشترك الآن" : "Subscribe now"}
                    <span className="rtl:rotate-180">›</span>
                  </span>
                </div>
              </a>
            </Reveal>
          </div>

          {/* Visual UI Refinement (2026-09-15): slim Coaching strip completes
              the value ladder right where the tiers are compared — Free →
              Premium → Pro → Coaching (the human-coach tier). Display-only
              navigation to the real coaching page; prices and quotas are NOT
              changed or restated beyond the published "from" price. */}
          <Reveal delay={350}>
            {/* Final Visual Review (2026-09-15): mt-6 → mt-8/md:mt-10 — the
                strip detaches from the tier grid so the ladder's last step
                reads as its own beat, not a footer crammed under the cards
                (the dark strip was visually pressing up against the grid). */}
            <a
              href={isAr ? "/ar/coaching" : "/coaching"}
              className="group relative mt-8 flex flex-col gap-3 overflow-hidden rounded-[var(--radius-chrome)] px-5 py-4 transition-transform duration-300 hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between md:mt-10"
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
              <span className="flex items-center gap-3">
                <EngravedIcon name="laurel" alt="" size={26} className="h-6 w-6 shrink-0" />
                <span>
                  <span className="block text-sm font-semibold text-white">
                    {isAr ? "الكوتشينج — الباقة الأعلى" : "Coaching — the top tier"}
                  </span>
                  <span className="mt-0.5 block text-xs font-normal leading-relaxed" style={{ color: "#A1A1A6" }}>
                    {isAr
                      ? "كل مميزات Pro + مدرب بشري يبني خططك ويتابع تقدمك أسبوعيًا"
                      : "Everything in Pro + a human coach building your plans and following up weekly"}
                  </span>
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="chrome-text chrome-text-on-dark text-lg font-bold tracking-tight">
                  {isAr ? "من $39.99 شهريًا" : "From $39.99/mo"}
                </span>
                <span className="chrome-text chrome-text-on-dark text-xl font-semibold" aria-hidden="true">›</span>
              </span>
            </a>
          </Reveal>

          {/* Phase 198 Batch 2 (audit H6): the free-tier paragraph moved INTO
              the Free card above — only the compare link remains here.
              Final Visual Review (2026-09-15): mt-8 → md:mt-10 for an even
              cards → strip → compare rhythm on desktop. */}
          <Reveal delay={400}>
            <div className="mt-8 flex justify-center md:mt-10">
              <a
                href={isAr ? "/ar/memberships" : "/memberships"}
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300"
                style={{
                  backgroundColor: PALETTE.surface,
                  color: PALETTE.textPrim,
                  border: `1px solid ${PALETTE.border}`,
                }}
              >
                {isAr ? "قارن كل العضويات" : "Compare all plans"}
                <span className="rtl:rotate-180">›</span>
              </a>
            </div>
          </Reveal>

          {/* Phase 117 (owner executive order — SEO/GEO): feature-comparison
              table vs traditional alternatives. ✅/❌ cells per the owner's
              directive; the Alkemos column is visually highlighted.
              Phase 198 Batch 2 (audit H6): the table COLLAPSES behind a
              native <details> — content stays in the served HTML (zero
              SEO removal; the Phase 117 order stays honored), the section
              just stops paying its full height by default. */}
          <Reveal delay={450}>
            <div className="mt-12">
              <details className="cmp-details group marble-card mt-6 overflow-hidden">
                <summary
                  className="flex cursor-pointer select-none items-center justify-between gap-3 px-5 py-4 text-lg font-semibold tracking-tight md:px-7 md:text-xl"
                  style={{ color: PALETTE.textPrim }}
                >
                  {isAr ? "لماذا Alkemos؟ مقارنة سريعة" : "Why Alkemos? A quick comparison"}
                  <span className="text-base transition-transform duration-300 group-open:rotate-180" style={{ color: "var(--muted-foreground)" }} aria-hidden="true">
                    ▾
                  </span>
                </summary>
              {/* Phase 131 table recipe — now INSIDE the <details> (the
                  summary row above is the collapsible header). The inner
                  wrapper lost its own marble-card (the details element IS
                  the card now). */}
              <div className="overflow-x-auto border-t" style={{ borderColor: "var(--edge)" }}>
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr style={{ backgroundColor: PALETTE.sectionGray }}>
                      <th className="p-2.5 text-start font-medium md:p-4" style={{ color: PALETTE.textSec }}>
                        {isAr ? "الميزة" : "Feature"}
                      </th>
                      <th className="p-2.5 text-center font-semibold md:p-4" style={{ color: "var(--text)" }}>
                        <span className="inline-flex items-center gap-1.5">
                          {/* PHASE 137: loading=lazy — this 16px below-fold icon
                              had NO lazy attr, so React Float SSR auto-preloaded
                              the 216KB original on the homepage critical path
                              (Lighthouse: mark-helmet.png in Early Hints). */}
                          {/* eslint-disable-next-line @next/next/no-img-element -- local fixed asset (helmet mark, 16px decorative) */}
                          <img
                            src="/images/brand/mark-helmet.png"
                            alt=""
                            width={16}
                            height={16}
                            loading="lazy"
                            className="h-4 w-4 object-contain"
                            aria-hidden="true"
                          />
                          Alkemos
                        </span>
                      </th>
                      <th className="p-2.5 text-center font-medium md:p-4" style={{ color: PALETTE.textSec }}>
                        {/* Short label below md so the header stays one line */}
                        <span className="md:hidden">{isAr ? "مدرب تقليدي" : "Trainer"}</span>
                        <span className="hidden md:inline">{isAr ? "مدرب شخصي تقليدي" : "Traditional personal trainer"}</span>
                      </th>
                      <th className="p-2.5 text-center font-medium md:p-4" style={{ color: PALETTE.textSec }}>
                        {isAr ? "تطبيقات مجانية" : "Free apps"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${PALETTE.border}99` }}>
                        <td className="p-2.5 text-start font-medium md:p-4" style={{ color: PALETTE.textPrim }}>
                          {isAr ? row.featureAr : row.featureEn}
                        </td>
                        <td
                          className="p-2.5 text-center align-middle md:p-4"
                          style={{ backgroundColor: "var(--tint)", borderInline: "var(--border-chrome)" }}
                        >
                          {renderCmpValue(row.us, true)}
                        </td>
                        <td className="p-2.5 text-center align-middle md:p-4">
                          {renderCmpValue(isAr ? row.tradAr : row.tradEn, false)}
                        </td>
                        <td className="p-2.5 text-center align-middle md:p-4">
                          {renderCmpValue(isAr ? row.appsAr : row.appsEn, false)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </details>
            </div>
          </Reveal>
        </div>
      </section>

      {/* (removed: Affiliate section — restructure order 2026-09-15: «إخراج
          Affiliate من الصفحة الرئيسية ونقله إلى الـFooter». The program
          stays reachable via the footer Partners list (already present
          since 2026-09-14) + the header Partners group; the /affiliate
          page, its 20%/30-day/$10 facts, and all business logic are
          untouched. The B2C funnel no longer detours through a
          side-program between Memberships and the closing CTA.) */}

      {/* ===================== CLOSING ACT — FAQ + final CTA (merged) ==========
          Restructure order (owner directive 2026-09-15): the old TRIPLE
          ending (standalone CTA strip → FAQ → Newsletter — the page "ended"
          three times) collapsed into ONE closing section: FAQ handles
          objections, then the slim final CTA card ends the page with the
          single free-start action right before the footer. The Newsletter
          moved into the SHARED footer (SiteFooter) — same form, same
          /api/tools/lead pipeline, now on every public page. Copy,
          destinations, and the FAQPage JSON-LD (faqs → faqSchema above)
          are unchanged. */}
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

          {/* Final CTA — the page's closing action (kept from the old
              standalone strip; verbatim owner copy + destination). One
              step slimmer (text-2xl/3xl, py-10/12) so it reads as the
              quiet end of the page, not a second hero. */}
          <div className="marble-card mt-12 px-6 py-10 text-center md:py-12">
            <h2 className="mx-auto max-w-2xl text-2xl font-semibold leading-tight tracking-tight md:text-3xl" style={{ color: PALETTE.textPrim }}>
              {isAr
                ? "ابدأ رحلتك الآن مجانًا — خطتك الأولى خلال دقائق"
                : "Start your journey free today — your first plan in minutes"}
            </h2>
            <a
              href={isAr ? "/ar/memberships" : "/memberships"}
              className="btn-chrome mt-6 px-8 py-3.5 text-base"
            >
              {isAr ? "جرّب المنصة مجانًا" : "Try the platform free"}
              <span className="rtl:rotate-180">›</span>
            </a>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER — now the SHARED SiteFooter
          component (access-point fix 2026-09-14): the exact same marble
          slab (Phase 131 menu-grid + Phase 132 theme-aware tokens) was
          extracted to src/components/SiteFooter.tsx so EVERY public page
          renders the identical footer — previously the full link grid
          existed ONLY here, isolating legal/faq/contact/compare/hub
          pages from persistent navigation. The shared component also
          carries the new locale-aware hub entries (muscles / equipment /
          collections / compare) and the AR mirrors of the legal pages.
          NO /evo links were added or removed (owner directive
          2026-09-14: the floating EVO widget is the intended access
          point — the existing footer entry stays untouched).
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

type LandingExerciseCategory = {
  slug: string;
  labelAr: string;
  labelEn: string;
  count: number;
};

type LandingProgram = {
  slug: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: string;     // engraved icon pair (house / rack / runner — mission §8)
  levelAr: string;  // level → laurel badge (mission §8)
  levelEn: string;
};

type LandingFoodCategory = {
  slug: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: string; // engraved icon pair (protein / carbs / fats / fruits — mission §9)
  image: string; // category artwork (same asset as the /foods hub pills)
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

function LandingExerciseCategoryCard({ cat, isAr }: { cat: LandingExerciseCategory; isAr: boolean }) {
  return (
    <a
      href={`${isAr ? "/ar" : ""}/exercises?cat=${cat.slug}`}
      className="marble-card group flex flex-col items-center justify-center gap-1.5 p-5 text-center transition-transform duration-300 hover:-translate-y-0.5"
    >
      {/* Small doric-column icon per category (mission §7) */}
      <EngravedIcon name="doric" alt="" size={34} className="h-8 w-8 opacity-90" />
      {/* Phase 198 Batch 3 (audit M2): card H3 unified on text-lg. */}
      <h3 className="text-lg font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>{isAr ? cat.labelAr : cat.labelEn}</h3>
      {/* Category number in chrome-gradient text (mission §7) */}
      <p className="chrome-text text-2xl font-bold tracking-tight">{cat.count}</p>
      {/* Phase 198 Batch 3 (audit M4): the cards were two bare lines — a
          levels line gives them substance (true for every library group). */}
      <p className="text-[11px] font-medium" style={{ color: PALETTE.textMuted }}>{isAr ? "جميع المستويات" : "All levels"}</p>
    </a>
  );
}

function LandingProgramCard({ prog, isAr }: { prog: LandingProgram; isAr: boolean }) {
  // Access-point fix (2026-09-14 audit): program cards were hardcoded to
  // the EN tree — the AR homepage linked /programs/* instead of /ar/programs/*.
  return (
    <a
      href={`${isAr ? "/ar" : ""}/programs/${prog.slug}`}
      className="marble-card group relative flex flex-col p-6 transition-transform duration-300 hover:-translate-y-0.5"
    >
      {/* Faded stadium backdrop — evo-card artwork blurred at 12% opacity
          (mission §8). Theme-swapped CSS background; purely decorative. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12] blur-[2px]"
        aria-hidden="true"
        style={{
          backgroundImage: "var(--prog-backdrop)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative flex items-start justify-between gap-3">
        {/* Engraved icon (house / rack / runner — mission §8) */}
        <EngravedIcon name={prog.icon} alt="" size={56} className="h-14 w-14 shrink-0" />
        {/* Laurel badge for the level (mission §8) */}
        <span className="seal-chip shrink-0">
          <EngravedIcon name="laurel" alt="" size={14} className="h-3.5 w-3.5" />
          {isAr ? prog.levelAr : prog.levelEn}
        </span>
      </div>
      <h3 className="relative mt-4 text-lg font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>{isAr ? prog.titleAr : prog.titleEn}</h3>
      <p className="relative mt-1 text-sm font-normal" style={{ color: PALETTE.textSec }}>{isAr ? prog.descAr : prog.descEn}</p>
      <p className="chrome-text relative mt-4 text-sm font-semibold">{isAr ? "ابدأ الآن ›" : "Start now ›"}</p>
    </a>
  );
}

function LandingFoodCategoryCard({ cat, isAr }: { cat: LandingFoodCategory; isAr: boolean }) {
  // Visual UI Refinement (2026-09-15): image-led catalog card. The four
  // library sections now each have their OWN card shape — Tools =
  // horizontal utility rows · Exercises = compact centered stat tiles ·
  // Programs = vertical product cards (laurel + backdrop) · Foods =
  // image-led catalog cards — killing the "same card everywhere" feeling.
  // The category artwork is the SAME asset the /foods hub pills already
  // use (CATEGORY_LABELS), so no new assets and hub/homepage stay
  // consistent. Behavior, hrefs, and data untouched.
  return (
    <a
      href={`${isAr ? "/ar" : ""}/foods?cat=${cat.slug}`}
      className="marble-card group flex flex-col transition-transform duration-300 hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={cat.image}
          alt={isAr ? cat.titleAr : cat.titleEn}
          fill
          sizes="(max-width: 768px) 45vw, 22vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-4 text-start">
        <h3 className="text-lg font-semibold tracking-tight" style={{ color: PALETTE.textPrim }}>{isAr ? cat.titleAr : cat.titleEn}</h3>
        <p className="mt-1 text-xs font-normal leading-relaxed" style={{ color: PALETTE.textSec }}>{isAr ? cat.descAr : cat.descEn}</p>
      </div>
    </a>
  );
}
