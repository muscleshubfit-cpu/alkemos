"use client";

import { useI18n } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageBanner } from "@/components/PageBanner";
import { EngravedIcon } from "@/components/ThemeImg";
// Phase 195 (owner directive «الرقم الحقيقي للأدوات هو 8، وليس 5» + dynamic
// counts): the hub arrays moved to src/lib/tools-shared.ts — the single
// source that also feeds the homepage «8+ Tools» proof chip. Same render.
import { TOOLS, TOOL_LIBRARIES } from "@/lib/tools-shared";

// Phase 127 «Marble & Chrome» identity: engraved icon pairs (mission §6
// zero-emoji law) replace the old Apple-style emoji-fallback tiles.
//
// §12.33 (owner directive «انقل خطط غذائيه جاهزة الى المكتبات باسم مكتبة
// الخطط الغذاييه الجاهزه»): the hub now renders TWO clusters — the tools,
// then the content libraries under their own labeled section.

const tools = TOOLS;
const libraries = TOOL_LIBRARIES;

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
            {/* 2026-09-15 accuracy fix: the hub serves the full 8-tool
                cluster (calculators + water tracker + planners), not
                calculators only — "tools" matches the H1 and tools-shared. */}
            {isAr
              ? "أدوات لياقة وتغذية مجانية لمساعدتك في رحلتك."
              : "Free fitness and nutrition tools for your journey."}
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

        {/* Access-point fix (2026-09-14): shared marble footer — this
            public page now carries the same persistent link grid as the
            homepage (SiteFooter component). */}
        <SiteFooter />
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
