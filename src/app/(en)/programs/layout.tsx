import type { Metadata } from "next";
import { Resources } from "@/components/hub-head-resources";

/**
 * M30 fix: English-first metadata for /programs and /programs/[slug].
 * Arabic mirrors (/ar/programs) have their own layout with Arabic metadata.
 */
export const metadata: Metadata = {
  title: "Workout Programs | Alkemos",
  description:
    "Ready-made workout programs for all levels and goals. Home workouts without equipment, dumbbell programs, and full gym programs. Start your fitness journey today.",
  keywords: [
    "workout programs",
    "training programs",
    "home workout",
    "gym program",
    "bodyweight workout",
    "dumbbell program",
    "fitness plan",
  ],
  alternates: {
    canonical: "https://alkemos.com/programs",
    // HREFLANG RECIPROCITY FIX (Phase 140 audit): /ar/programs declares
    // the full cluster (en/ar/x-default) but this EN side never
    // reciprocated. Same fix as /programs/[slug] in the same phase —
    // matches the pattern already live on /, /blog, /exercises, /foods,
    // /memberships, /faq, /about, /for-coaches.
    languages: {
      en: "https://alkemos.com/programs",
      ar: "https://alkemos.com/ar/programs",
      "x-default": "https://alkemos.com/programs",
    },
  },
  openGraph: {
    title: "Workout Programs | Alkemos",
    description: "Ready-made workout programs for all levels and goals.",
    type: "website",
    locale: "en_US",
    url: "https://alkemos.com/programs",
    // §12.53 item 4 (2026-09-15): og:image for the EN list surface —
    // same-family home card, matching the AR mirror's og-home-ar
    // inheritance (no programs-specific card exists; Phase 187 asset law).
    images: [
      {
        url: "/images/og/og-home-en.png",
        width: 1200,
        height: 630,
        alt: "Alkemos — The Smart Fitness & Nutrition Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/og/og-home-en.png"],
  },
};

export default function ProgramsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Resources banner="programs">{children}</Resources>
  );
}
