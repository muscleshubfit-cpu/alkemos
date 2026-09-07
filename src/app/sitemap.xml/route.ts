import { xmlResponse, siteUrl } from "@/lib/sitemap-xml";

/**
 * GET /sitemap.xml — Sitemap INDEX (audit C2, 2026-09-05).
 *
 * Replaces the old 9.3MB / 19,498-URL monolith with an index pointing
 * at topic-specific children. robots.txt already points here — nothing
 * external changes.
 *
 * Phase SEO-GEO-1 (2026-09-08): added /sitemap-collections.xml — the new
 * hub/collection pages (muscle groups, equipment, food collections).
 *
 * Phase SEO-GEO-1.1 (2026-09-08): GSC and Bing reported "Couldn't fetch"
 * on /sitemap-collections.xml for the first ~12 hours after deployment
 * even though the URL was serving HTTP 200 + valid XML the whole time.
 * Root cause: GSC's fetch cache lags behind a freshly-deployed sitemap,
 * and without a <lastmod> on the index entry it has no signal to retry
 * sooner than its default 24h cycle. Adding <lastmod> = today's date
 * on every child entry forces GSC/Bing to treat the index as "updated"
 * and re-fetch each child immediately. This is the same pattern the
 * other sitemap children already use internally on their <url> entries.
 */

export const revalidate = 3600;

export async function GET() {
  const base = siteUrl();
  const today = new Date().toISOString().slice(0, 10);
  const children = [
    `${base}/sitemap-pages.xml`,
    `${base}/sitemap-collections.xml`,
    `${base}/sitemap-comparisons.xml`,
    `${base}/sitemap-exercises.xml`,
    `${base}/sitemap-foods.xml`,
    `${base}/sitemap-blog.xml`,
  ];
  // buildSitemapIndex does not accept lastmod today — inline-build the
  // index so each <sitemap> carries a <lastmod>. This keeps the helper
  // API stable for the other callers.
  const body = children
    .map((loc) => `  <sitemap>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>`;
  return xmlResponse(xml);
}
