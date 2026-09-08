import { buildUrlSet, xmlResponse, siteUrl, type SitemapUrl } from "@/lib/sitemap-xml";
import { familyLastmod } from "@/lib/sitemap-lastmod";
import { COMPARISONS } from "@/lib/comparisons";

/**
 * GET /sitemap-comparisons.xml — Comparison pages (Phase SEO-GEO-3, 2026-09-08).
 *
 * Advertises the "Alkemos vs [Competitor]" comparison pages:
 *   - /compare/[slug]      (EN)
 *   - /ar/compare/[slug]   (AR mirror)
 *
 * Each comparison targets a high-commercial-intent query (users actively
 * comparing platforms before sign-up). Conversion rates on this traffic
 * are 3–5× higher than top-of-funnel blog traffic.
 *
 * ISR cache: 1 hour (matches the other sitemap routes).
 */

export const revalidate = 3600;

export async function GET() {
  const base = siteUrl();
  const urls: SitemapUrl[] = [];

  for (const comparison of COMPARISONS) {
    urls.push({
      loc: `${base}/compare/${comparison.slug}`,
      changefreq: "monthly",
      priority: 0.8,
      alternates: {
        en: `${base}/compare/${comparison.slug}`,
        ar: `${base}/ar/compare/${comparison.slug}`,
      },
    });
    urls.push({
      loc: `${base}/ar/compare/${comparison.slug}`,
      changefreq: "monthly",
      priority: 0.8,
      alternates: {
        en: `${base}/compare/${comparison.slug}`,
        ar: `${base}/ar/compare/${comparison.slug}`,
      },
    });
  }

  // Phase 155 (#14): truthful per-family lastmod (see sitemap-lastmod.ts).
  return xmlResponse(
    buildUrlSet(urls.map((u) => ({ ...u, lastModified: familyLastmod("comparisons") }))),
  );
}
