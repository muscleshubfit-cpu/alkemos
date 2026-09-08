/**
 * Pure helpers for /sitemap-blog.xml (SEO-GEO-4.1, 2026-09-08).
 *
 * Translation pairing via the existing `linked_post_id` column — the
 * "real translation pairing" audit C1 (2026-09-07) required before
 * hreflang may be re-added. Rules enforced here (unit-tested):
 *   1. A link is honored ONLY when the target is a PUBLISHED row in the
 *      opposite language (unpublished/self/same-language links are
 *      ignored) — the dangling-hreflang bug can never regress.
 *   2. Alternates are always reciprocal: EN↔AR pair URLs.
 *   3. lastmod = greatest(published_at, updated_at) (audit M4).
 */

export type BlogSitemapPost = {
  id: string;
  slug: string;
  language: string;
  published_at: string | null;
  updated_at: string | null;
  linked_post_id: string | null;
};

export function blogPostUrl(base: string, p: { language: string; slug: string }): string {
  return `${base}${p.language === "ar" ? "/ar/blog" : "/blog"}/${p.slug}`;
}

/**
 * Reciprocal hreflang alternates for a translation pair, or undefined
 * when the post has no valid opposite-language published twin.
 */
export function blogPairAlternates(
  post: BlogSitemapPost,
  byId: Map<string, BlogSitemapPost>,
  base: string,
): { en: string; ar: string } | undefined {
  const twin = post.linked_post_id ? byId.get(post.linked_post_id) : undefined;
  if (!twin || twin.language === post.language) return undefined;
  const en = post.language === "en" ? post : twin;
  const ar = post.language === "ar" ? post : twin;
  return { en: blogPostUrl(base, en), ar: blogPostUrl(base, ar) };
}

/** lastmod = greatest(published_at, updated_at), falling back to now. */
export function blogLastmod(post: BlogSitemapPost, fallback: Date): Date {
  const published = post.published_at ? new Date(post.published_at) : null;
  const updated = post.updated_at ? new Date(post.updated_at) : null;
  if (published && updated) return published > updated ? published : updated;
  return published ?? updated ?? fallback;
}
