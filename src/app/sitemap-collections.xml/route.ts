import { buildUrlSet, xmlResponse, siteUrl, type SitemapUrl } from "@/lib/sitemap-xml";
import {
  MUSCLE_HUBS,
  EQUIPMENT_HUBS,
  FOOD_COLLECTIONS,
} from "@/lib/hub-collections";

/**
 * GET /sitemap-collections.xml — Hub/Collection pages (Phase SEO-GEO-1, 2026-09-08).
 *
 * Advertises the three new hub/collection families:
 *   - /muscles/[group] + /ar/muscles/[group]      (8 hubs × 2 langs = 16 URLs)
 *   - /equipment/[type] + /ar/equipment/[type]    (8 hubs × 2 langs = 16 URLs)
 *   - /collections/[slug] + /ar/collections/[slug] (10 collections × 2 langs = 20 URLs)
 *
 * Total: 52 new URLs targeting medium-tail fitness/nutrition queries with
 * substantial search volume and moderate competition — the sweet spot for
 * Alkemos's current Domain Authority stage.
 *
 * Each URL declares its reciprocal hreflang pair (EN ↔ AR) so Google
 * indexes the locale pair correctly.
 *
 * ISR cache: 1 hour (matches the other sitemap routes).
 */

export const revalidate = 3600;

export async function GET() {
  const base = siteUrl();
  const urls: SitemapUrl[] = [];

  // 1. Muscle group hubs
  for (const hub of MUSCLE_HUBS) {
    urls.push({
      loc: `${base}/muscles/${hub.slug}`,
      changefreq: "weekly",
      priority: 0.8,
      alternates: {
        en: `${base}/muscles/${hub.slug}`,
        ar: `${base}/ar/muscles/${hub.slug}`,
      },
    });
    urls.push({
      loc: `${base}/ar/muscles/${hub.slug}`,
      changefreq: "weekly",
      priority: 0.8,
      alternates: {
        en: `${base}/muscles/${hub.slug}`,
        ar: `${base}/ar/muscles/${hub.slug}`,
      },
    });
  }

  // 2. Equipment hubs
  for (const hub of EQUIPMENT_HUBS) {
    urls.push({
      loc: `${base}/equipment/${hub.slug}`,
      changefreq: "weekly",
      priority: 0.7,
      alternates: {
        en: `${base}/equipment/${hub.slug}`,
        ar: `${base}/ar/equipment/${hub.slug}`,
      },
    });
    urls.push({
      loc: `${base}/ar/equipment/${hub.slug}`,
      changefreq: "weekly",
      priority: 0.7,
      alternates: {
        en: `${base}/equipment/${hub.slug}`,
        ar: `${base}/ar/equipment/${hub.slug}`,
      },
    });
  }

  // 3. Food collections
  for (const coll of FOOD_COLLECTIONS) {
    urls.push({
      loc: `${base}/collections/${coll.slug}`,
      changefreq: "weekly",
      priority: 0.8,
      alternates: {
        en: `${base}/collections/${coll.slug}`,
        ar: `${base}/ar/collections/${coll.slug}`,
      },
    });
    urls.push({
      loc: `${base}/ar/collections/${coll.slug}`,
      changefreq: "weekly",
      priority: 0.8,
      alternates: {
        en: `${base}/collections/${coll.slug}`,
        ar: `${base}/ar/collections/${coll.slug}`,
      },
    });
  }

  return xmlResponse(buildUrlSet(urls));
}
