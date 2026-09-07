import { buildSitemapIndex, xmlResponse, siteUrl } from "@/lib/sitemap-xml";

/**
 * GET /sitemap.xml — Sitemap INDEX (audit C2, 2026-09-05).
 *
 * Replaces the old 9.3MB / 19,498-URL monolith with an index pointing
 * at topic-specific children. robots.txt already points here — nothing
 * external changes.
 *
 * Phase SEO-GEO-1 (2026-09-08): added /sitemap-collections.xml — the new
 * hub/collection pages (muscle groups, equipment, food collections).
 */

export const revalidate = 3600;

export async function GET() {
  const base = siteUrl();
  return xmlResponse(
    buildSitemapIndex([
      `${base}/sitemap-pages.xml`,
      `${base}/sitemap-collections.xml`,
      `${base}/sitemap-exercises.xml`,
      `${base}/sitemap-foods.xml`,
      `${base}/sitemap-blog.xml`,
    ]),
  );
}
