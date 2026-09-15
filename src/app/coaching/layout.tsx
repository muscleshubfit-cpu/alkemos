import type { Metadata } from "next";
import { getCoachingServiceSchema, jsonLd } from "@/lib/seo";

/**
 * M30 fix: English-first metadata for /coaching.
 */
export const metadata: Metadata = {
  title: "Online Coaching | Alkemos — Professional Coaches & Nutrition Specialists",
  description:
    "Online coaching with professional coaches and nutrition specialists. Personalized meal plans, adaptive workout programs, personal follow-up, and EVO AI assistant available 24/7. Start your journey today.",
  keywords: [
    "online coaching",
    "nutrition coaching",
    "personalized meal plans",
    "custom workout programs",
    "personal coaching",
    "fitness coach online",
    "nutrition specialist",
  ],
  openGraph: {
    title: "Online Coaching | Alkemos — Professional Coaches & Nutrition Specialists",
    description:
      "Personalized meal plans, adaptive workouts, personal follow-up, and EVO AI available 24/7.",
    type: "website",
    locale: "en_US",
    url: "https://alkemos.com/coaching",
    // §12.53 item 4 (2026-09-15): og:image was absent — a child openGraph
    // block replaces the root one (Next.js merging), so the EN surface
    // showed no social card. Same-family home card, matching the AR
    // mirror's og-home-ar inheritance.
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
  alternates: {
    canonical: "https://alkemos.com/coaching",
    // SEO-GEO-6.4 (P1-9): full hreflang pair now that /ar/coaching exists.
    languages: {
      en: "https://alkemos.com/coaching",
      ar: "https://alkemos.com/ar/coaching",
      "x-default": "https://alkemos.com/coaching",
    },
  },
};

// §12.53 item 3: locale-aware schema — the EN page reads an English
// entity description (was Arabic-only before the audit fix).
const coachingSchema = getCoachingServiceSchema("en");

export default function CoachingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(coachingSchema) }}
      />
      {children}
    </>
  );
}
