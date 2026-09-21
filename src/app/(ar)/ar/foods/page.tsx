import type { Metadata } from "next";
import { FoodsExplorer } from "@/components/foods/FoodsExplorer";
import { parseFoodsQuery } from "@/components/foods/url";

const SITE_URL = "https://alkemos.com";

/**
 * Arabic mirror of /foods — SERVER-RENDERED (same 2026-09-05 audit).
 *
 * Passes `lang="ar"` to force Arabic rendering regardless of the
 * browser's stored language preference. Wrapped by
 * `src/app/ar/layout.tsx`'s `<div dir="rtl" lang="ar">` for proper RTL,
 * and by `src/middleware.ts`'s `Content-Language: ar-EG` header for
 * crawler language attribution.
 */
export const metadata: Metadata = {
  // NOTE: the /ar layout template appends «— Alkemos» automatically — a
  // static «| Alkemos» here would double-brand the SERP title.
  title: "مكتبة الأطعمة — السعرات والماكروز لكل 100 جرام",
  description:
    "مكتبة أطعمة تضم 8,830+ صنفًا غذائيًا بالسعرات والماكروز لكل 100 جرام — ابحث، صفِّ النتائج، واحسب الكميات التي تحتاجها بالجرام.",
  alternates: {
    canonical: "/ar/foods",
    languages: {
      en: `${SITE_URL}/foods`,
      ar: `${SITE_URL}/ar/foods`,
      "x-default": `${SITE_URL}/foods`,
    },
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  return <FoodsExplorer lang="ar" query={parseFoodsQuery(sp)} />;
}
