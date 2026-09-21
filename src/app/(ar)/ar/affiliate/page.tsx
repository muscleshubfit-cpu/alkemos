"use client";

/**
 * AR MIRROR of /affiliate — same bilingual affiliate program page.
 * The page component is fully bilingual inline (useI18n is URL-first
 * since the homepage AR mirror fix), so under /ar/* it renders its
 * Arabic content with `lang="ar" dir="rtl"` chrome automatically.
 *
 * This route exists to give that Arabic content its own INDEXABLE
 * Arabic URL with Arabic-first metadata + reciprocal hreflang with
 * the EN page (src/app/affiliate/layout.tsx) — the /ar/for-coaches
 * & /ar/evo pattern (Phase 44 / SEO-GEO-6.4). §12.53 item 11.
 */
export { default } from "@/app/(en)/affiliate/page";
