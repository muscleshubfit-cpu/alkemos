import type { BlogPostCard } from "./blog";

/**
 * §12.40 (P2-14, audit finding #8): the single blog-search predicate.
 *
 * The WebSite schema's SearchAction declares /blog?search={search_term_string}
 * as the site search target — following that URL must actually SHOW filtered
 * results. This is the ONE law for what "matching a search query" means
 * (title + excerpt + focus_keyword + keywords + tags + category, lowercase
 * substring), shared by the client-side filter in listBlogPosts (src/lib/blog.ts)
 * and pinned by tests so the deep-link path and the typed-search path can
 * never drift apart. Extracted from the inline filter that used to live only
 * inside listBlogPosts.
 *
 * PURE MODULE by design (no "use client", no Supabase import): importable
 * from server components, edge routes and unit tests alike.
 */
export function matchesBlogSearch(post: BlogPostCard, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const haystack = [
    post.title,
    post.excerpt || "",
    post.focus_keyword || "",
    ...(post.keywords || []),
    ...(post.tags || []),
    post.category,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}
