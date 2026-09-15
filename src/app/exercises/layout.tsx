import type { Metadata } from "next";

/**
 * M30 fix: this layout applies to BOTH /exercises and /exercises/[slug].
 * The root URL is English-first, so metadata should be English.
 * Arabic mirrors (/ar/exercises) have their own layout with Arabic metadata.
 */
export const metadata: Metadata = {
  title: "Exercise Library | Alkemos",
  description:
    "Browse 868+ exercises with full instructions, target muscles, and difficulty level. Exercises for chest, back, shoulders, legs, biceps, triceps, core, and cardio.",
  keywords: [
    "exercise library",
    "fitness exercises",
    "workout exercises",
    "gym exercises",
    "chest exercises",
    "back exercises",
    "leg exercises",
  ],
  alternates: {
    canonical: "https://alkemos.com/exercises",
    // Homepage AR mirror follow-up (2026-08-30): declare the Arabic mirror
    // (src/app/ar/exercises/page.tsx declares the reciprocal pair).
    languages: {
      en: "https://alkemos.com/exercises",
      ar: "https://alkemos.com/ar/exercises",
      "x-default": "https://alkemos.com/exercises",
    },
  },
  openGraph: {
    title: "Exercise Library | Alkemos",
    description: "Browse 868+ exercises with full instructions and difficulty levels.",
    type: "website",
    locale: "en_US",
    url: "https://alkemos.com/exercises",
    // §12.53 item 4 (2026-09-15): the EN list surface shared NO social
    // card — a child openGraph block REPLACES the root one in Next.js
    // metadata merging, so the root images never applied. Same family
    // card the exercise DETAIL pages already use (Phase 187 pattern).
    images: [
      {
        url: "/images/og/og-exercises-en.png",
        width: 1200,
        height: 630,
        alt: "Alkemos Exercise Library",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/og/og-exercises-en.png"],
  },
};

export default function ExercisesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
