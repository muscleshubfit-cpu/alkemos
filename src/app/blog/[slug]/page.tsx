import { notFound } from "next/navigation";
import { BlogArticlePage } from "@/components/blog/BlogArticlePage";
import { fetchBlogForOG, fetchBlogPostFull, fetchPublishedBlogSlugPools, buildBlogHreflang } from "@/lib/blog-server";
import { sanitizeBlogContent } from "@/lib/blog-content-sanitize";
import { insertToolLinks } from "@/lib/blog-tool-links";
import { getArticleSchema, getBreadcrumbSchema, getSpeakableSchema, jsonLd } from "@/lib/seo";
import { resolveAuthor } from "@/lib/authors";
import type { Metadata } from "next";

// #10 fix: use ISR instead of force-dynamic — blog posts change rarely,
// so a 1-hour revalidate cache reduces Vercel function invocations
// significantly while keeping content fresh.
export const revalidate = 300; // 5 min — post-remediation freshness (IMAGE SAFETY sweep 2026-08-27)
export const runtime = "nodejs";

/**
 * Server-side metadata generation — puts OG tags in <head> where Facebook,
 * LinkedIn, X, and WhatsApp can find them.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const og = await fetchBlogForOG(slug, "en");
  if (!og) {
    return {
      title: "Article Not Found — Alkemos",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: og.title,
    description: og.description,
    alternates: {
      canonical: og.articleUrl,
      // Phase SEO-GEO-6.5 (§12.19 P0-4): hreflang restored with REAL
      // pairing. The C1 removal (2026-09-07) was correct when zero pairs
      // existed and every declared counterpart 404'd — since then the
      // Phase-157/158 `linked_post_id` pairing supplies true twins: paired
      // posts emit the full en/ar/x-default set, unpaired posts declare
      // self + x-default only (never a dangling URL). Single source:
      // buildBlogHreflang() in blog-server.ts (shared with the AR mirror).
      languages: buildBlogHreflang(og),
    },
    openGraph: {
      type: "article",
      url: og.articleUrl,
      title: og.title,
      description: og.description,
      // Phase SEO-GEO-3 (2026-09-08): use the dynamically-generated OG
      // image (Alkemos-branded 1200×630 PNG with title + description)
      // instead of the raw Pexels JPEG. The branded image is more
      // recognizable in social feeds (Facebook, X, LinkedIn, WhatsApp)
      // and reinforces the Alkemos brand on every share. The Pexels
      // image is still shown as the article hero inside the page body.
      images: [
        {
          url: `https://alkemos.com/api/og-image/${slug}?lang=en`,
          width: 1200,
          height: 630,
          alt: og.title,
        },
      ],
      siteName: "Alkemos",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: og.title,
      description: og.description,
      images: [`https://alkemos.com/api/og-image/${slug}?lang=en`],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch blog data for Article schema
  const og = await fetchBlogForOG(slug, "en");

  // M29 fix: return proper 404 (not soft-404 HTTP 200) when the post
  // doesn't exist. This triggers Next.js's not-found page with status 404,
  // preventing Google from indexing invalid blog URLs as soft-404s.
  if (!og) {
    notFound();
  }

  // Phase SEO-GEO-4 (2026-09-08): pass real DB published_at + updated_at
  // to the Article schema so dateModified + lastReviewed reflect actual
  // edit history. Was: new Date().toISOString() at request time → every
  // crawl looked "freshly edited" which devalues the freshness signal.
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
        // Phase SEO-GEO-2 (2026-09-08): pass the resolved author Profile
        // so the Article schema's `author` Person matches the byline shown
        // in the UI. The DB `author` column historically stored 'Alkemos'
        // or 'MuscleHub' — resolveAuthor normalizes all of those to the
        // canonical Ahmed Zake Person (the de-facto author of every post).
        authorProfile: resolveAuthor(og.author),
      })
    : null;

  // Phase SEO-GEO-4 (2026-09-08): Speakable schema marks the H1 + excerpt
  // as voice-readable for Siri / Google Assistant / Alexa. The matching
  // `data-speakable` attributes are added in BlogArticlePage.tsx.
  const speakableSchema = og
    ? getSpeakableSchema({
        url: og.articleUrl,
        headlineSelector: '[data-speakable="headline"]',
        summarySelector: '[data-speakable="summary"]',
      })
    : null;

  const breadcrumbSchema = og
    ? getBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Blog", url: "/blog" },
        { name: og.title, url: `/blog/${slug}` },
      ])
    : null;

  // M28 fix: fetch the full post server-side so the article body is in
  // the initial HTML (visible to Googlebot without executing JS).
  // Phase 155 (SEO-GEO-4.7, §7.1 #11): legacy articles generated before
  // the tool-link guarantee layer existed (pre-2026-09-01) get the same
  // deterministic insertToolLinks treatment at render time. The function
  // is idempotent (skips already-linked tools, caps at 3, never touches
  // headings/existing markdown links), so pipeline-generated articles
  // pass through unchanged.
  // Phase 156 (SEO-GEO-4.8, §7.1 #15): sanitizeBlogContent runs FIRST
  // (audit-driven: wrong cross-language prefixes → 404, raw HTML anchors
  // killed by the XSS escape, known CJK corruption) — then tool links
  // are injected into the now-clean markdown. Both are idempotent.
  const [fetchedPost, slugPools] = await Promise.all([
    fetchBlogPostFull(slug, "en"),
    fetchPublishedBlogSlugPools(),
  ]);
  const fullPost = fetchedPost
    ? {
        ...fetchedPost,
        content: insertToolLinks(sanitizeBlogContent(fetchedPost.content, "en", slugPools), "en").md,
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
      <BlogArticlePage lang="en" slug={slug} initialPost={fullPost} publishedAt={publishedAt} updatedAt={updatedAt} />
    </>
  );
}
