import type { Metadata } from "next";
import Link from "next/link";
import { COMPARISONS } from "@/lib/comparisons";
import { getBreadcrumbSchema, getItemListSchema, jsonLd } from "@/lib/seo";
import { SiteHeader } from "@/components/SiteHeader";

/**
 * /compare — Comparison index page (EN).
 *
 * SEO-GEO-4 (2026-09-08, owner directive «ابدأ (ج) ثم (أ)»): the six
 * comparison DETAIL pages were live and in sitemap-comparisons.xml, but
 * the index route 404'd (live-verified) — wasted internal linking and a
 * broken discovery path for high-intent visitors. This hub lists every
 * comparison in the library (new entries are picked up automatically
 * from COMPARISONS), ships ItemList + Breadcrumb schema, and links the
 * AR mirror.
 */
export const metadata: Metadata = {
  title: "Alkemos vs Competitors — Honest Platform Comparisons (2026) | Alkemos",
  description:
    "Side-by-side comparisons of Alkemos vs MyFitnessPal, Freeletics, and ExRx.net: features, prices, content depth, AI coach, and languages — with an honest verdict for each.",
  alternates: {
    canonical: "https://alkemos.com/compare",
    languages: {
      en: "https://alkemos.com/compare",
      ar: "https://alkemos.com/ar/compare",
      "x-default": "https://alkemos.com/compare",
    },
  },
  openGraph: {
    title: "Alkemos vs Competitors — Honest Platform Comparisons | Alkemos",
    description:
      "Feature, price, and content-depth tables: Alkemos vs MyFitnessPal, Freeletics, and ExRx.net.",
    type: "website",
    locale: "en_US",
    url: "https://alkemos.com/compare",
  },
  twitter: {
    card: "summary",
    title: "Alkemos vs Competitors — Honest Platform Comparisons | Alkemos",
    description:
      "Feature, price, and content-depth tables: Alkemos vs MyFitnessPal, Freeletics, and ExRx.net.",
  },
};

export default function CompareIndexPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Comparisons", url: "/compare" },
  ]);
  const itemListSchema = getItemListSchema({
    name: "Alkemos Platform Comparisons — Alkemos",
    description:
      "Every Alkemos vs competitor comparison: features, pricing, content depth, AI coach, and language support.",
    items: COMPARISONS.map((c) => ({
      name: c.titleEn,
      url: `/compare/${c.slug}`,
    })),
  });

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader variant="landing" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema) }}
      />
      <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">Comparisons</span>
        </nav>

        <header className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            Alkemos vs Competitors
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base font-normal text-[var(--muted-foreground)] md:text-lg">
            Honest, feature-by-feature comparisons — pricing, content depth,
            AI coaching, and language support. Data verified against the
            competitors&apos; public pages.
          </p>
        </header>

        <div className="mt-10 space-y-4">
          {COMPARISONS.map((c) => (
            <Link
              key={c.slug}
              href={`/compare/${c.slug}`}
              className="marble-card group flex items-center justify-between gap-4 p-6 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">
                  {c.h1En}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm font-normal text-[var(--muted-foreground)]">
                  {c.introEn}
                </p>
              </div>
              <span className="chrome-text shrink-0 text-2xl font-semibold" aria-hidden="true">
                ›
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
          النسخة العربية:{" "}
          <Link href="/ar/compare" className="underline hover:text-[var(--text)]">
            المقارنات بالعربية
          </Link>
        </p>
      </main>
    </div>
  );
}
