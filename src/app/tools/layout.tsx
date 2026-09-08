import type { Metadata } from "next";

/**
 * M30 fix: English-first metadata for /tools.
 */
export const metadata: Metadata = {
  title: "Free Fitness Tools | Alkemos — Calculators & Trackers",
  description:
    "Free fitness and nutrition tools: calorie calculator, BMI calculator, macro calculator, body fat calculator, water tracker, and meal planner.",
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
    description: "Free fitness and nutrition calculators for your journey.",
    type: "website",
    locale: "en_US",
    url: "https://alkemos.com/tools",
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
