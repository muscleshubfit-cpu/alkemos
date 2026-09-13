import type { Metadata } from "next";
import { ToolSchemaScripts } from "@/components/ToolSchemaScripts";

/**
 * M30 fix: English-first metadata for /tools/calorie-calculator.
 */
export const metadata: Metadata = {
  title: "Calorie Calculator | Alkemos — Calculate Your Daily Needs",
  description:
    "Calculate your daily calorie needs and macros (protein, carbs, fat) based on your weight, height, age, and activity level. Free and accurate using the Mifflin-St Jeor equation.",
  keywords: [
    "calorie calculator",
    "TDEE calculator",
    "BMR calculator",
    "macro calculator",
    "daily calorie needs",
    "Mifflin-St Jeor",
    "protein calculator",
  ],
  alternates: {
    canonical: "https://alkemos.com/tools/calorie-calculator",
    // SEO-GEO-4 (2026-09-08): reciprocal pair with the new AR mirror.
    languages: {
      en: "https://alkemos.com/tools/calorie-calculator",
      ar: "https://alkemos.com/ar/tools/calorie-calculator",
      "x-default": "https://alkemos.com/tools/calorie-calculator",
    },
  },
  openGraph: {
    title: "Calorie Calculator | Alkemos",
    description: "Calculate your daily calorie needs and macros for free.",
    type: "website",
    locale: "en_US",
    url: "https://alkemos.com/tools/calorie-calculator",
    // PHASE 187 (deep-audit P0-2): og:image — static branded family
    // card (design mirrors /api/og-image; see scripts/generate-og-cards.py).
    images: [
      {
        url: "/images/og/og-tools-en.png",
        width: 1200,
        height: 630,
        alt: "Alkemos Free Fitness Calculators",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/og/og-tools-en.png"],
    title: "Calorie Calculator | Alkemos",
    description: "Calculate your daily calorie needs and macros for free.",
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemaScripts tool="calorie-calculator" lang="en" />
      {children}
    </>
  );
}
