/**
 * src/lib/sitemap-lastmod.ts — PER-FAMILY SITEMAP lastmod ANCHORS
 * (Phase 155, SEO-GEO-4.7 — master plan §7.1 #14).
 *
 * WHY: only /sitemap-blog.xml emitted <lastmod> (live Supabase dates);
 * the four static-data children advertised URLs with NO lastmod, so
 * search engines had no recency signal for ~1,900 of the site's URLs.
 *
 * UPDATE PROTOCOL (the whole point of centralizing): when a shipped
 * phase materially changes a page family's SERVED HTML (content,
 * schema, or visible structure — not just code refactors), bump that
 * family's date to the ship date. The value must stay truthful: it is
 * the date the pages last meaningfully changed, in W3C day precision.
 *
 *   pages        — static pages + tools + programs (Phase 154: bilingual
 *                  validation UI on /tools/calorie-calculator)
 *   exercises    — exercise detail pages: keyed to CONTENT_LAST_REVIEWED
 *                  (Phase 152 E-E-A-T review schema ships on every page;
 *                  Phase 155 adds spoke→hub link strip)
 *   foods        — food detail pages: same CONTENT_LAST_REVIEWED anchor
 *   collections  — /muscles/* + /equipment/* + /collections/* hubs
 *                  (Phase 155: CJK corruption fix in AR intros)
 *   comparisons  — /compare/* pages (last material change: SEO-GEO-4
 *                  compare index, 2026-09-08)
 *
 * Blog stays dynamic (blogLastmod per-row from Supabase) and is NOT
 * listed here — one source of truth per family, never two.
 */

import { CONTENT_LAST_REVIEWED } from "./seo";

export const SITEMAP_LASTMOD = {
  pages: "2026-09-09",
  exercises: CONTENT_LAST_REVIEWED,
  foods: CONTENT_LAST_REVIEWED,
  collections: "2026-09-09",
  comparisons: "2026-09-08",
} as const;

export type SitemapFamily = keyof typeof SITEMAP_LASTMOD;

/** W3C day-precision Date for a family's lastmod (sitemap-xml contract). */
export function familyLastmod(family: SitemapFamily): Date {
  return new Date(`${SITEMAP_LASTMOD[family]}T00:00:00Z`);
}
