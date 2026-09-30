"use client";

/**
 * AR MIRROR of /workout-tracker — same bilingual landing page.
 * The page component is fully bilingual inline (useI18n is URL-first),
 * so under /ar/* it renders its Arabic content with `lang="ar" dir="rtl"`
 * chrome automatically (the /ar/for-coaches pattern).
 *
 * P0 SEO audit (2026-09-30): gives the Arabic "متتبّع تمارين" intent its
 * own INDEXABLE Arabic URL with Arabic-first metadata + reciprocal
 * hreflang with the EN page.
 */
export { default } from "@/app/(en)/workout-tracker/page";
