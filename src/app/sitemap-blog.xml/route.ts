import { createClient } from "@supabase/supabase-js";
import { buildUrlSet, xmlResponse, siteUrl, type SitemapUrl } from "@/lib/sitemap-xml";
import {
  blogLastmod,
  blogPairAlternates,
  blogPostUrl,
  type BlogSitemapPost,
} from "@/lib/blog-sitemap";

/**
 * GET /sitemap-blog.xml — published blog posts (EN + AR).
 *
 * The traffic-earning content gets its own sitemap (audit C2) so a
 * full blog recrawl never competes with 17K food pages. Live
 * Supabase query, ISR-cached for an hour (same freshness as before).
 *
 * Phase SEO-GEO-4.1 (2026-09-08): hreflang alternates for TRANSLATION
 * PAIRS via the existing `linked_post_id` column. Audit C1 (2026-09-07)
 * removed dangling hreflang because EN and AR posts were topically
 * independent with zero pairing — its directive was "re-add ONLY when a
 * real translation pairing exists". `linked_post_id` IS that pairing
 * mechanism: reciprocal xhtml:link alternates are emitted ONLY when
 * both posts are published and in opposite languages (rules live in
 * src/lib/blog-sitemap.ts, unit-tested). Every unpaired post stays
 * exactly as before — the dangling-hreflang bug cannot regress here.
 */

export const revalidate = 3600;

export async function GET() {
  const base = siteUrl();
  const fallbackDate = new Date();
  const urls: SitemapUrl[] = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: posts } = await supabase
        .from("blog_posts")
        .select("id, slug, language, published_at, updated_at, linked_post_id")
        .eq("is_published", true);

      if (posts) {
        // Only PUBLISHED rows enter the map, so a linked target that is
        // unpublished simply fails to resolve → no alternates (C1-safe).
        const byId = new Map((posts as BlogSitemapPost[]).map((p) => [p.id, p]));

        for (const post of posts as BlogSitemapPost[]) {
          const alternates = blogPairAlternates(post, byId, base);
          urls.push({
            loc: blogPostUrl(base, post),
            lastModified: blogLastmod(post, fallbackDate),
            changefreq: "monthly",
            priority: 0.7,
            ...(alternates ? { alternates } : {}),
          });
        }
      }
    } catch {
      // Supabase unreachable → empty blog sitemap (never a 500 to crawlers)
    }
  }

  return xmlResponse(buildUrlSet(urls));
}
