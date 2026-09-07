import { notFound } from "next/navigation";
import { BlogArticlePage } from "@/components/blog/BlogArticlePage";
import { fetchBlogForOG, fetchBlogPostFull } from "@/lib/blog-server";
import { getArticleSchema, getBreadcrumbSchema, getSpeakableSchema, jsonLd } from "@/lib/seo";
import { resolveAuthor } from "@/lib/authors";
import type { Metadata } from "next";

// #10 fix: ISR — 1 hour revalidate
export const revalidate = 300; // 5 min — post-remediation freshness
export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const og = await fetchBlogForOG(slug, "ar");
  if (!og) {
    return {
      title: "المقال غير موجود — Alkemos",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: og.title,
    description: og.description,
    alternates: {
      canonical: og.articleUrl,
      // SEO audit C1 fix (2026-09-07): hreflang `languages` removed — the
      // declared EN counterpart `/blog/${slug}` never existed (EN and AR
      // posts are topically independent in the live DB; zero slug pairs),
      // so every alternate URL 404'd. Re-add only with a real pairing.
    },
    openGraph: {
      type: "article",
      url: og.articleUrl,
      title: og.title,
      description: og.description,
      // Phase SEO-GEO-3 (2026-09-08): use the dynamically-generated OG
      // image (Alkemos-branded 1200×630 PNG with title + description)
      // instead of the raw Pexels JPEG — see EN mirror for the rationale.
      images: [
        {
          url: `https://alkemos.com/api/og-image/${slug}?lang=ar`,
          width: 1200,
          height: 630,
          alt: og.title,
        },
      ],
      siteName: "Alkemos",
      locale: "ar_EG",
    },
    twitter: {
      card: "summary_large_image",
      title: og.title,
      description: og.description,
      images: [`https://alkemos.com/api/og-image/${slug}?lang=ar`],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const og = await fetchBlogForOG(slug, "ar");

  // M29 fix: return proper 404 when the post doesn't exist.
  if (!og) {
    notFound();
  }

  // Phase SEO-GEO-4 (2026-09-08): real DB dates — see EN mirror for the rationale.
  const publishedAt = og.publishedAt || new Date().toISOString();
  const updatedAt = og.updatedAt || publishedAt;

  const articleSchema = og
    ? getArticleSchema({
        title: og.title,
        description: og.description,
        slug,
        image: og.image,
        datePublished: publishedAt,
        dateModified: updatedAt,
        // Phase SEO-GEO-2 (2026-09-08): resolved author Person — see
        // the EN mirror (/blog/[slug]/page.tsx) for the full rationale.
        authorProfile: resolveAuthor(og.author),
      })
    : null;

  // Phase SEO-GEO-4 (2026-09-08): Speakable schema — see EN mirror.
  const speakableSchema = og
    ? getSpeakableSchema({
        url: og.articleUrl,
        headlineSelector: '[data-speakable="headline"]',
        summarySelector: '[data-speakable="summary"]',
      })
    : null;

  const breadcrumbSchema = og
    ? getBreadcrumbSchema([
        { name: "الرئيسية", url: "/" },
        { name: "المدونة", url: "/ar/blog" },
        { name: og.title, url: `/ar/blog/${slug}` },
      ])
    : null;

  // M28 fix: fetch the full post server-side so the article body is in
  // the initial HTML (visible to Googlebot without executing JS).
  const fullPost = await fetchBlogPostFull(slug, "ar");

  return (
    <>
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }}
        />
      )}
      {speakableSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(speakableSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
        />
      )}
      <BlogArticlePage lang="ar" slug={slug} initialPost={fullPost} publishedAt={publishedAt} updatedAt={updatedAt} />
    </>
  );
}
