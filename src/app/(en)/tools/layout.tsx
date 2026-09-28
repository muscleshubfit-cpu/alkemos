import type { Metadata } from "next";
import { Resources } from "@/components/hub-head-resources";

/**
 * M30 fix: English-first metadata for /tools.
 */
export const metadata: Metadata = {
  title: "Free Fitness Tools — Calculators, Planner & AI | Alkemos",
  description:
    // CONTENT-AUDIT P1-7 (audit §2.1): 182 chars — the tool list survives
    // intact inside the ~160 budget.
    "8 free fitness and nutrition tools: calorie, BMI, macro, and body-fat calculators, a water tracker, a meal planner, and two AI plan generators. No credit card required.",
  keywords: [
    "free fitness tools",
    "fitness calculators",
    "calorie calculator",
    "BMI calculator",
    "macro calculator",
    "body fat calculator",
    "water tracker",
  ],
  alternates: {
    canonical: "https://alkemos.com/tools",
    // SEO-GEO-4 (2026-09-08): reciprocal pair with the new AR tools hub.
    languages: {
      en: "https://alkemos.com/tools",
      ar: "https://alkemos.com/ar/tools",
      "x-default": "https://alkemos.com/tools",
    },
  },
  openGraph: {
    title: "Free Fitness Tools | Alkemos",
    description: "8 free tools: calculators, meal planner, and AI plan generators — free to try.",
    type: "website",
    locale: "en_US",
    url: "https://alkemos.com/tools",
    // PHASE 187 (deep-audit P0-2): og:image — static branded family
    // card (design mirrors /api/og-image; see scripts/generate-og-cards.py).
    images: [
      {
        url: "/images/og/og-tools-en.png?v=2",
        width: 1200,
        height: 630,
        alt: "Alkemos Free Fitness Calculators",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/og/og-tools-en.png?v=2"],
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Resources banner="tools">{children}</Resources>
  );
}
