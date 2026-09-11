import { notFound } from "next/navigation";
import { BlogArticlePage } from "@/components/blog/BlogArticlePage";
import { fetchBlogForOG, fetchBlogPostFull, fetchPublishedBlogSlugPools, buildBlogHreflang } from "@/lib/blog-server";
import { sanitizeBlogContent } from "@/lib/blog-content-sanitize";
import { insertToolLinks } from "@/lib/blog-tool-links";
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
      // Phase SEO-GEO-6.5 (§12.19 P0-4): hreflang restored with REAL
      // pairing (linked_post_id twins) — see the EN mirror for the full
      // rationale. Single source: buildBlogHreflang() in blog-server.ts.
      languages: buildBlogHreflang(og),
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
  // Phase 155 (SEO-GEO-4.7, §7.1 #11): same render-time tool-link
  // injection as the EN mirror (AR trigger dictionary, idempotent).
  // Phase 156 (SEO-GEO-4.8, §7.1 #15): the AR legacy corpus carries 85
  // /blog/-prefixed links to AR-only articles (live 404s) + 3 raw HTML
  // anchors + 3 CJK tokens — all fixed deterministically here, pools
  // guard so a real cross-language target is never broken.
  const [fetchedPost, slugPools] = await Promise.all([
    fetchBlogPostFull(slug, "ar"),
    fetchPublishedBlogSlugPools(),
  ]);
  const fullPost = fetchedPost
    ? {
        ...fetchedPost,
        content: insertToolLinks(sanitizeBlogContent(fetchedPost.content, "ar", slugPools), "ar").md,
      }
    : fetchedPost;

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
