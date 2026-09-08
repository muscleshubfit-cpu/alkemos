import { buildUrlSet, xmlResponse, siteUrl, type SitemapUrl } from "@/lib/sitemap-xml";
import { familyLastmod } from "@/lib/sitemap-lastmod";
import {
  MUSCLE_HUBS,
  EQUIPMENT_HUBS,
  FOOD_COLLECTIONS,
  isAdvertisedMuscleHub,
  isAdvertisedEquipmentHub,
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
 * EMPTY-HUB POLICY (Phase 155, extends A-5 crawl economy): hubs whose
 * library filter yields ZERO exercises (/muscles/cardio and
 * /equipment/none as of the 868-row library) are thin content — they
 * stay live (slug law) but are NOT advertised here. Re-admission is
 * automatic the moment a matching exercise ships (isAdvertised* in
 * hub-collections.ts, pinned by hub-linking.test.ts).
 *
 * ISR cache: 1 hour (matches the other sitemap routes).
 */

export const revalidate = 3600;

export async function GET() {
  const base = siteUrl();
  const urls: SitemapUrl[] = [];

  // 1. Muscle group hubs (skips empty hubs — EMPTY-HUB POLICY above)
  for (const hub of MUSCLE_HUBS) {
    if (!isAdvertisedMuscleHub(hub)) continue;
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

  // 2. Equipment hubs (skips empty hubs — EMPTY-HUB POLICY above)
  for (const hub of EQUIPMENT_HUBS) {
    if (!isAdvertisedEquipmentHub(hub)) continue;
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

  // Phase 155 (#14): truthful per-family lastmod (see sitemap-lastmod.ts).
  return xmlResponse(
    buildUrlSet(urls.map((u) => ({ ...u, lastModified: familyLastmod("collections") }))),
  );
}
