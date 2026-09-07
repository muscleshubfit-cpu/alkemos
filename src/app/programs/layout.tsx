import type { Metadata } from "next";

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
  },
};

export default function ProgramsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
