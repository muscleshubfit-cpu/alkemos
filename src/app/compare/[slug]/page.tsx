import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { COMPARISONS, getComparisonBySlug } from "@/lib/comparisons";
import { getArticleSchema, getBreadcrumbSchema, getItemListSchema, jsonLd } from "@/lib/seo";
import { resolveAuthor } from "@/lib/authors";

/**
 * /compare/[slug] — Comparison page (EN).
 *
 * Phase SEO-GEO-3 (2026-09-08): "Alkemos vs [Competitor]" pages target
 * high-intent commercial queries from users comparing platforms before
 * sign-up. Converts at 3–5× the rate of top-of-funnel blog traffic.
 *
 * Schema:
 *   - Article (with author + reviewedBy Persons from Phase SEO-GEO-2)
 *   - ItemList (the two compared products as items)
 *   - Breadcrumb (Home / Compare / Alkemos vs [Competitor])
 *
 * Bilingual mirror at /ar/compare/[slug].
 */

export const dynamicParams = true;

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);
  if (!comparison) {
    return {
      title: "Comparison Not Found — Alkemos",
      robots: { index: false, follow: false },
    };
  }
  const url = `https://alkemos.com/compare/${comparison.slug}`;
  return {
    title: comparison.titleEn,
    description: comparison.descriptionEn,
    alternates: {
      canonical: url,
      languages: {
        en: url,
        ar: `https://alkemos.com/ar/compare/${comparison.slug}`,
        "x-default": url,
      },
    },
    openGraph: {
      type: "article",
      url,
      title: comparison.titleEn,
      description: comparison.descriptionEn,
      siteName: "Alkemos",
      locale: "en_US",
      images: [{ url: `https://alkemos.com/api/og-image/${comparison.slug}?lang=en&type=compare`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: comparison.titleEn,
      description: comparison.descriptionEn,
      images: [`https://alkemos.com/api/og-image/${comparison.slug}?lang=en&type=compare`],
    },
  };
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);
  if (!comparison) notFound();

  const url = `https://alkemos.com/compare/${comparison.slug}`;
  const today = new Date().toISOString();
  const author = resolveAuthor(undefined);

  const articleSchema = getArticleSchema({
    title: comparison.titleEn,
    description: comparison.descriptionEn,
    slug: `compare/${comparison.slug}`,
    // §12.40 (P2-14, audit finding #10): og:image ↔ JSON-LD image
    // consistency — same branded og-image URL the metadata declares for
    // og:image/twitter:image (previously fell back to /logo.png, a
    // mixed-source inconsistency on all 6 comparison pages).
    image: `https://alkemos.com/api/og-image/${comparison.slug}?lang=en&type=compare`,
    datePublished: today,
    dateModified: today,
    authorProfile: author,
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Compare", url: "/compare" },
    { name: comparison.h1En, url: `/compare/${comparison.slug}` },
  ]);

  const itemListSchema = getItemListSchema({
    name: `${comparison.h1En} — Alkemos`,
    description: comparison.descriptionEn,
    items: [
      { name: "Alkemos", url: "/" },
      { name: comparison.competitorName, url: comparison.competitorUrl },
    ],
  });

  const winCount = comparison.rows.filter((r) => r.outcome === "win").length;
  const lossCount = comparison.rows.filter((r) => r.outcome === "loss").length;
  const tieCount = comparison.rows.filter((r) => r.outcome === "tie").length;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader variant="landing" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema) }} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 md:py-20">
        <nav className="mb-8 flex items-center gap-2 text-sm text-[var(--muted-foreground)]" aria-label="Breadcrumb">
          <Link href="/" className="hover:opacity-70">Home</Link>
          <span>/</span>
          <Link href="/compare" className="hover:opacity-70">Compare</Link>
          <span>/</span>
          <span className="truncate text-[var(--text)]">{comparison.h1En}</span>
        </nav>

        <header className="mb-10">
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            {comparison.h1En}
          </h1>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Data as of {comparison.dataAsOf} · Reviewed by Ahmed Zake
          </p>
          <p className="mt-4 text-lg font-normal leading-relaxed text-[var(--muted-foreground)] md:text-xl">
            {comparison.introEn}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs">
            <span className="rounded-full bg-green-100 px-3 py-1 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Alkemos wins: {winCount}
            </span>
            <span className="rounded-full bg-red-100 px-3 py-1 text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {comparison.competitorName} wins: {lossCount}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
              Tied: {tieCount}
            </span>
          </div>
        </header>

        <section className="mb-12" aria-label="Comparison table">
          <div className="overflow-x-auto rounded-2xl border border-[var(--edge)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--tint)]">
                <tr>
                  <th className="p-4 text-left font-semibold">Feature</th>
                  <th className="p-4 text-left font-semibold text-[var(--muted-2)]">Alkemos</th>
                  <th className="p-4 text-left font-semibold">{comparison.competitorName}</th>
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row, i) => {
                  const alkemosBg = row.outcome === "win" ? "bg-green-50 dark:bg-green-950/20" : "";
                  const competitorBg = row.outcome === "loss" ? "bg-green-50 dark:bg-green-950/20" : "";
                  const alkemosIcon = row.outcome === "win" ? "✓" : row.outcome === "loss" ? "✗" : "=";
                  const competitorIcon = row.outcome === "loss" ? "✓" : row.outcome === "win" ? "✗" : "=";
                  return (
                    <tr key={i} className="border-t border-[var(--edge)]">
                      <td className="p-4 font-medium">{row.labelEn}</td>
                      <td className={`p-4 ${alkemosBg}`}>
                        <span className="mr-2 font-bold">{alkemosIcon}</span>
                        {row.alkemosValue}
                      </td>
                      <td className={`p-4 ${competitorBg}`}>
                        <span className="mr-2 font-bold">{competitorIcon}</span>
                        {row.competitorValue}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12 marble-card p-8">
          <h2 className="text-2xl font-semibold tracking-tight">Verdict</h2>
          <p className="mt-4 text-base font-normal leading-relaxed text-[var(--muted-2)] md:text-lg">
            {comparison.verdictEn}
          </p>
        </section>

        {comparison.bodyEn.map((section, i) => (
          <section key={i} className="mb-10">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {section.heading}
            </h2>
            <div className="mt-4 space-y-4 text-base font-normal leading-relaxed text-[var(--muted-2)] md:text-lg">
              {section.paragraphs.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          </section>
        ))}

        <section className="marble-card mt-16 p-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Try Alkemos Free</h2>
          <p className="mt-2 text-sm font-normal text-[var(--muted-foreground)]">
            Full exercise library, food database, calculators, and limited EVO AI — no credit card required.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/auth" className="btn-chrome px-6 py-2.5 text-sm">Sign up free</Link>
            <Link href="/memberships" className="btn-outline px-6 py-2.5 text-sm">View pricing</Link>
            <Link href="/evo" className="btn-outline px-6 py-2.5 text-sm">Meet EVO AI</Link>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight mb-4">Other comparisons</h2>
          <div className="flex flex-wrap gap-2">
            {COMPARISONS.filter((c) => c.slug !== comparison.slug).map((c) => (
              <Link
                key={c.slug}
                href={`/compare/${c.slug}`}
                className="px-3 py-1.5 rounded-md border border-border text-sm hover:border-primary transition-colors"
              >
                {c.h1En}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-[var(--edge)] py-6 text-center text-xs font-normal text-[var(--muted-foreground)]">
        © {new Date().getFullYear()} Alkemos. All rights reserved.
      </footer>
    </div>
  );
}
