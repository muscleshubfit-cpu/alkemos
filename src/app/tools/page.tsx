"use client";

import { useI18n } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { PageBanner } from "@/components/PageBanner";
import { EngravedIcon } from "@/components/ThemeImg";

// Phase 127 «Marble & Chrome» identity: engraved icon pairs (mission §6
// zero-emoji law) replace the old Apple-style emoji-fallback tiles.
//
// §12.33 (owner directive «انقل خطط غذائيه جاهزة الى المكتبات باسم مكتبة
// الخطط الغذاييه الجاهزه»): the hub now renders TWO clusters — the tools,
// then the content libraries under their own labeled section.
const tools = [
  {
    slug: "calorie-calculator",
    nameAr: "حاسبة السعرات الحرارية",
    nameEn: "Calorie Calculator",
    descAr: "احسب احتياجك اليومي من السعرات والماكروز",
    descEn: "Calculate daily calories and macros",
    icon: "calories",
  },
  {
    slug: "bmi-calculator",
    nameAr: "حاسبة مؤشر كتلة الجسم",
    nameEn: "BMI Calculator",
    descAr: "اعرف هل وزنك مثالي أم زائد",
    descEn: "Check if your weight is healthy",
    icon: "bmi",
  },
  {
    slug: "macro-calculator",
    nameAr: "حاسبة الماكروز",
    nameEn: "Macro Calculator",
    descAr: "وزّع سعراتك على بروتين وكارب ودهون",
    descEn: "Split calories into protein, carbs, fat",
    icon: "macros",
  },
  {
    slug: "body-fat-calculator",
    nameAr: "حاسبة نسبة الدهون",
    nameEn: "Body Fat Calculator",
    descAr: "احسب نسبة الدهون في جسمك",
    descEn: "Calculate your body fat percentage",
    icon: "bodyfat",
  },
  {
    slug: "water-tracker",
    nameAr: "متتبع شرب الماء",
    nameEn: "Water Tracker",
    descAr: "حدد هدفك وسجل كوبساتك يومياً",
    descEn: "Set your goal and log your cups daily",
    icon: "hydration",
  },
  {
    slug: "/meal-planner",
    nameAr: "مخطط الوجبات",
    nameEn: "Meal Planner",
    descAr: "ابني وجباتك من ٨٨٣٠+ أكلة وشوف الماكروز",
    descEn: "Build meals from 8,830+ foods and track macros",
    icon: "mealplanner",
  },
  // §12.28: the AI meal-planner trial — free generation, no signup.
  {
    slug: "/ai-meal-planner",
    nameAr: "مخطط الوجبات بالذكاء الاصطناعي",
    nameEn: "AI Meal Planner",
    descAr: "ولّد خطة يوم كاملة بالغرامات في ثوانٍ",
    descEn: "Generate a full day plan in seconds",
    icon: "evo",
  },
  // §12.32: the AI workout-planner trial — free generation, no signup
  // (owner directive «ضيف أداة جديده مخطط التمارين بالذكاء الاصطناعي»).
  {
    slug: "/ai-workout-planner",
    nameAr: "مخطط التمارين بالذكاء الاصطناعي",
    nameEn: "AI Workout Planner",
    descAr: "ولّد نظاماً تدريبياً أسبوعياً في ثوانٍ",
    descEn: "Generate a weekly split in seconds",
    icon: "dumbbell",
  },
];

// The content libraries cluster — its own labeled section on the hub
// (DELIVERY 0050 cross-links + §12.33 move of the ready-made diet plans).
const libraries = [
  {
    slug: "/exercises",
    nameAr: "مكتبة التمارين",
    nameEn: "Exercise Library",
    descAr: "868+ تمرين بالصور والشرح والمستويات",
    descEn: "868+ exercises with images and guides",
    icon: "dumbbell",
  },
  {
    slug: "/foods",
    nameAr: "مكتبة الأكلات",
    nameEn: "Food Library",
    descAr: "8,830+ أكلة بالسعرات والماكروز",
    descEn: "8,830+ foods with calories and macros",
    icon: "protein",
  },
  // §12.33: moved from the tools grid into the libraries, renamed per the
  // owner's directive (was «خطط غذائية جاهزة / Diet Plan Library» as a tool).
  {
    slug: "/diet-plan",
    nameAr: "مكتبة الخطط الغذائية الجاهزة",
    nameEn: "Diet Plan Library",
    descAr: "٢٤ خطة يوم جاهزة بالغرامات (6 مستويات × 4 أنظمة)",
    descEn: "24 ready-made daily plans in grams",
    icon: "fruits",
  },
];

export default function ToolsPage() {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader variant="landing" />

      <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        {/* Owner artwork page banner (Phase 127: the 12 header images are
            PAGE banners, not homepage section banners) */}
        <PageBanner section="tools" className="mb-10" />

        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            {isAr ? "الأدوات المجانية" : "Free Tools"}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base font-normal text-[var(--muted-foreground)] md:text-lg">
            {isAr
              ? "حاسبات لياقة وتغذية مجانية لمساعدتك في رحلتك."
              : "Free fitness and nutrition calculators for your journey."}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} isAr={isAr} />
          ))}
        </div>

        {/* §12.33: the libraries cluster — its own labeled section (owner
            directive «انقل خطط غذائيه جاهزة الى المكتبات»). */}
        <h2 className="mt-12 text-2xl font-semibold tracking-tight md:text-3xl">
          {isAr ? "المكتبات" : "Libraries"}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm font-normal text-[var(--muted-foreground)]">
          {isAr
            ? "محتوى جاهز للتصفح: خطط وتمارين وأطعمة."
            : "Ready-to-browse content: plans, exercises, and foods."}
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {libraries.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} isAr={isAr} />
          ))}
        </div>
      </main>
    </div>
  );
}

function ToolCard({ tool, isAr }: { tool: (typeof tools)[number]; isAr: boolean }) {
  // SEO-GEO-4 (2026-09-08): every tool has an Arabic mirror — /ar/tools/*
  // + /ar/meal-planner. AR renders of this hub must link to the AR URLs.
  const href = isAr
    ? tool.slug.startsWith("/")
      ? `/ar${tool.slug}`
      : `/ar/tools/${tool.slug}`
    : tool.slug.startsWith("/")
      ? tool.slug
      : `/tools/${tool.slug}`;
  return (
    <a
      href={href}
      className="marble-card group flex items-center gap-4 p-6 transition-transform duration-300 hover:-translate-y-0.5"
    >
      {/* Engraved icon pair (Phase 127 identity — replaces emoji tiles) */}
      <EngravedIcon
        name={tool.icon}
        alt={isAr ? tool.nameAr : tool.nameEn}
        size={56}
        className="h-14 w-14 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-semibold tracking-tight text-[var(--text)]">
          {isAr ? tool.nameAr : tool.nameEn}
        </h3>
        <p className="mt-1 text-sm font-normal text-[var(--muted-foreground)]">
          {isAr ? tool.descAr : tool.descEn}
        </p>
      </div>
      {/* Chrome arrow (mission §6) */}
      <span className="chrome-text shrink-0 text-2xl font-semibold" aria-hidden="true">
        ›
      </span>
    </a>
  );
}
