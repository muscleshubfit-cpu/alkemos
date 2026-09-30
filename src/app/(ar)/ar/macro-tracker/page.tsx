"use client";

/**
 * AR MIRROR of /macro-tracker — same bilingual landing page.
 * The page component is fully bilingual inline (useI18n is URL-first),
 * so under /ar/* it renders its Arabic content with `lang="ar" dir="rtl"`
 * chrome automatically (the /ar/for-coaches pattern).
 *
 * P0 SEO audit (2026-09-30): gives the Arabic "متتبع ماكروز" intent its
 * own INDEXABLE Arabic URL with Arabic-first metadata + reciprocal
 * hreflang with the EN page.
 */
export { default } from "@/app/(en)/macro-tracker/page";
