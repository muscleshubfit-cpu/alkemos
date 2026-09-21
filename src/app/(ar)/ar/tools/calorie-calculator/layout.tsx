import type { Metadata } from "next";
import { ToolSchemaScripts } from "@/components/ToolSchemaScripts";

/**
 * SEO-GEO-4 (2026-09-08): AR metadata for /ar/tools/calorie-calculator.
 *
 * Targets the highest-volume Arabic fitness query «حاسبة السعرات
 * الحرارية» (live-verified SERP: MOH portals + generic media, no
 * dedicated professional competitor). Title carries NO brand suffix —
 * the /ar layout template appends exactly one "— Alkemos".
 */
export const metadata: Metadata = {
  title: "حاسبة السعرات الحرارية — احسب احتياجك اليومي والماكروز",
  description:
    "احسب احتياجك اليومي من السعرات الحرارية والماكروز (بروتين، كربوهيدرات، دهون) من وزنك وطولك وعمرك ونشاطك بمعادلة ميفلين-سانت جيور (Mifflin-St Jeor) — نتائج فورية وشرح مبسط، مجانًا وبدون تسجيل.",
  keywords: [
    "حاسبة السعرات الحرارية",
    "حساب السعرات اليومية",
    "حاسبة الكالوري",
    "حاسبة TDEE",
    "حاسبة BMR",
    "السعرات الحرارية لتخسيس الوزن",
    "حاسبة الماكروز",
  ],
  alternates: {
    canonical: "https://alkemos.com/ar/tools/calorie-calculator",
    languages: {
      en: "https://alkemos.com/tools/calorie-calculator",
      ar: "https://alkemos.com/ar/tools/calorie-calculator",
      "x-default": "https://alkemos.com/tools/calorie-calculator",
    },
  },
  openGraph: {
    title: "حاسبة السعرات الحرارية",
    description: "احسب احتياجك اليومي من السعرات والماكروز مجانًا وبنتائج فورية.",
    type: "website",
    locale: "ar_EG",
    url: "https://alkemos.com/ar/tools/calorie-calculator",
    // PHASE 187 (deep-audit P0-2): og:image — static branded family
    // card (design mirrors /api/og-image; see scripts/generate-og-cards.py).
    images: [
      {
        url: "/images/og/og-tools-ar.png",
        width: 1200,
        height: 630,
        alt: "حاسبات اللياقة المجانية من Alkemos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/og/og-tools-ar.png"],
    title: "حاسبة السعرات الحرارية",
    description: "احسب احتياجك اليومي من السعرات والماكروز مجانًا وبنتائج فورية.",
  },
};

export default function ArCalorieLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemaScripts tool="calorie-calculator" lang="ar" />
      {children}
    </>
  );
}
