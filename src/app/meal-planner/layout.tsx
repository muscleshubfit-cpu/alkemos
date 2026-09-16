import type { Metadata } from "next";
import { ToolSchemaScripts } from "@/components/ToolSchemaScripts";

/**
 * FULL-SITE AUDIT FIX (2026-08-30): /meal-planner previously had no
 * metadata and INHERITED the root canonical (= homepage), telling Google
 * it was a duplicate of "/" — and the inherited ar-EG→/ar hreflang
 * falsely claimed the AR homepage was its twin. The page is a client
 * component, so a server layout owns the metadata (same pattern as the
 * tool pages). No hreflang: no /ar mirror exists for this page.
 */
export const metadata: Metadata = {
  title: "Meal Planner | Alkemos — Build & Download Custom Meal Plans",
  description:
    "Create a personalized meal plan in minutes: search the Alkemos food database, set your portions and calories, save plans as bookmarks, and download or export the final plan for free.",
  keywords: [
    "meal planner",
    "custom meal plan",
    "meal plan creator",
    "nutrition plan builder",
    "food database meal planner",
    "free meal planner",
  ],
  alternates: {
    canonical: "/meal-planner",
    // SEO-GEO-4 (2026-09-08): reciprocal pair with the new AR mirror
    // (this file's old "No hreflang: no /ar mirror" note is superseded).
    languages: {
      en: "https://alkemos.com/meal-planner",
      ar: "https://alkemos.com/ar/meal-planner",
      "x-default": "https://alkemos.com/meal-planner",
    },
  },
  openGraph: {
    title: "Meal Planner | Alkemos",
    description:
      "Build a personalized meal plan from the full food database and download it for free.",
    type: "website",
    url: "https://alkemos.com/meal-planner",
    // P3-10 (Phase 217, deep-audit م9): og:locale symmetry — the AR twin
    // declares ar_EG; this EN block replaces the root's, so it must
    // state its own locale.
    locale: "en_US",
    // Phase 216 (P2-1 discovery beyond the audit list — same replace-
    // not-inherit gap, live-verified): the tools family card is pinned
    // explicitly.
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
  },
};

export default function MealPlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToolSchemaScripts tool="meal-planner" lang="en" />
      {children}
    </>
  );
}
