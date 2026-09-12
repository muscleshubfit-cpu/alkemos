import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { COMPARISONS, getComparisonBySlug } from "@/lib/comparisons";
import { getArticleSchema, getBreadcrumbSchema, getItemListSchema, jsonLd, stripTrailingBrandForArTemplate } from "@/lib/seo";
import { resolveAuthor } from "@/lib/authors";

/**
 * /ar/compare/[slug] — Arabic mirror of /compare/[slug].
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
      title: "المقارنة غير موجودة — Alkemos",
      robots: { index: false, follow: false },
    };
  }
  const url = `https://alkemos.com/ar/compare/${comparison.slug}`;
  return {
    // SEO-GEO-4: strip the trailing brand — the /ar template appends "— Alkemos".
    title: stripTrailingBrandForArTemplate(comparison.titleAr),
    description: comparison.descriptionAr,
    alternates: {
      canonical: url,
      languages: {
        en: `https://alkemos.com/compare/${comparison.slug}`,
        ar: url,
        "x-default": `https://alkemos.com/compare/${comparison.slug}`,
      },
    },
    openGraph: {
      type: "article",
      url,
      title: comparison.titleAr,
      description: comparison.descriptionAr,
      siteName: "Alkemos",
      locale: "ar_AR",
      images: [{ url: `https://alkemos.com/api/og-image/${comparison.slug}?lang=ar&type=compare`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: comparison.titleAr,
      description: comparison.descriptionAr,
      images: [`https://alkemos.com/api/og-image/${comparison.slug}?lang=ar&type=compare`],
    },
  };
}

export default async function ArabicComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);
  if (!comparison) notFound();

  const url = `https://alkemos.com/ar/compare/${comparison.slug}`;
  const today = new Date().toISOString();
  const author = resolveAuthor(undefined);

  const articleSchema = getArticleSchema({
    title: comparison.titleAr,
    description: comparison.descriptionAr,
    slug: `ar/compare/${comparison.slug}`,
    // §12.40 (P2-14, audit finding #10): og:image ↔ JSON-LD image
    // consistency — same branded og-image URL the metadata declares
    // (?lang=ar variant; previously fell back to /logo.png).
    image: `https://alkemos.com/api/og-image/${comparison.slug}?lang=ar&type=compare`,
    datePublished: today,
    dateModified: today,
    authorProfile: author,
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "الرئيسية", url: "/ar" },
    { name: "المقارنات", url: "/ar/compare" },
    { name: comparison.h1Ar, url: `/ar/compare/${comparison.slug}` },
  ]);

  const itemListSchema = getItemListSchema({
    name: `${comparison.h1Ar} — Alkemos`,
    description: comparison.descriptionAr,
    items: [
      { name: "Alkemos", url: "/ar" },
      { name: comparison.competitorNameAr, url: comparison.competitorUrl },
    ],
  });

  const winCount = comparison.rows.filter((r) => r.outcome === "win").length;
  const lossCount = comparison.rows.filter((r) => r.outcome === "loss").length;
  const tieCount = comparison.rows.filter((r) => r.outcome === "tie").length;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]" dir="rtl">
      <SiteHeader variant="landing" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema) }} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 md:py-20">
        <nav className="mb-8 flex items-center gap-2 text-sm text-[var(--muted-foreground)]" aria-label="مسار التنقل">
          <Link href="/ar" className="hover:opacity-70">الرئيسية</Link>
          <span>/</span>
          <Link href="/ar/compare" className="hover:opacity-70">المقارنات</Link>
          <span>/</span>
          <span className="truncate text-[var(--text)]">{comparison.h1Ar}</span>
        </nav>

        <header className="mb-10">
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            {comparison.h1Ar}
          </h1>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            البيانات حتى {comparison.dataAsOf} · راجعه أحمد زكي
          </p>
          <p className="mt-4 text-lg font-normal leading-relaxed text-[var(--muted-foreground)] md:text-xl">
            {comparison.introAr}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs">
            <span className="rounded-full bg-green-100 px-3 py-1 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Alkemos يتفوّق: {winCount}
            </span>
            <span className="rounded-full bg-red-100 px-3 py-1 text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {comparison.competitorName} يتفوّق: {lossCount}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
              تعادل: {tieCount}
            </span>
          </div>
        </header>

        <section className="mb-12" aria-label="جدول المقارنة">
          <div className="overflow-x-auto rounded-2xl border border-[var(--edge)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--tint)]">
                <tr>
                  <th className="p-4 text-right font-semibold">الميزة</th>
                  <th className="p-4 text-right font-semibold text-[var(--muted-2)]">Alkemos</th>
                  <th className="p-4 text-right font-semibold">{comparison.competitorNameAr}</th>
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
                      <td className="p-4 font-medium">{row.labelAr}</td>
                      <td className={`p-4 ${alkemosBg}`}>
                        <span className="ml-2 font-bold">{alkemosIcon}</span>
                        {row.alkemosValue}
                      </td>
                      <td className={`p-4 ${competitorBg}`}>
                        <span className="ml-2 font-bold">{competitorIcon}</span>
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
          <h2 className="text-2xl font-semibold tracking-tight">الحكم النهائي</h2>
          <p className="mt-4 text-base font-normal leading-relaxed text-[var(--muted-2)] md:text-lg">
            {comparison.verdictAr}
          </p>
        </section>

        {comparison.bodyAr.map((section, i) => (
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
          <h2 className="text-2xl font-semibold tracking-tight">جرّب Alkemos مجانًا</h2>
          <p className="mt-2 text-sm font-normal text-[var(--muted-foreground)]">
            مكتبة تمارين كاملة، قاعدة أطعمة، حاسبات، وEVO AI محدود — بدون بطاقة ائتمان.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/auth" className="btn-chrome px-6 py-2.5 text-sm">سجّل مجانًا</Link>
            <Link href="/ar/memberships" className="btn-outline px-6 py-2.5 text-sm">عرض الأسعار</Link>
            <Link href="/evo" className="btn-outline px-6 py-2.5 text-sm">تعرّف على EVO</Link>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight mb-4">مقارنات أخرى</h2>
          <div className="flex flex-wrap gap-2">
            {COMPARISONS.filter((c) => c.slug !== comparison.slug).map((c) => (
              <Link
                key={c.slug}
                href={`/ar/compare/${c.slug}`}
                className="px-3 py-1.5 rounded-md border border-border text-sm hover:border-primary transition-colors"
              >
                {c.h1Ar}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-[var(--edge)] py-6 text-center text-xs font-normal text-[var(--muted-foreground)]">
        © {new Date().getFullYear()} Alkemos. كل الحقوق محفوظة.
      </footer>
    </div>
  );
}
