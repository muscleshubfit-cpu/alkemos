import type { Metadata } from "next";
import { getEVOApplicationSchema, jsonLd } from "@/lib/seo";

/**
 * M30 fix: English-first metadata for /evo.
 */
export const metadata: Metadata = {
  title: "EVO — AI Fitness Coach | Alkemos",
  description:
    "EVO is an intelligent performance engine — not just a chatbot. It reads your health data and goal, builds personalized nutrition and workout plans, suggests smart meal and exercise swaps, and provides 24/7 fitness and nutrition consulting via AI. Free for everyone.",
  keywords: [
    "EVO AI coach",
    "AI fitness coach",
    "intelligent performance engine",
    "AI workout assistant",
    "AI nutrition consultant",
    "fitness AI",
    "smart fitness coach",
  ],
  openGraph: {
    title: "EVO — AI Fitness Coach | Alkemos",
    description:
      "An intelligent engine that builds personalized plans from your data and suggests smart swaps. Free for everyone.",
    type: "website",
    locale: "en_US",
    url: "https://alkemos.com/evo",
    // §12.53 item 4 (2026-09-15): the EN list surfaces shared NO social
    // card — this layout declared openGraph without images, and a child
    // openGraph block REPLACES the root one in Next.js metadata merging,
    // so nothing was inherited. The AR mirror inherits og-home-ar from
    // /ar/layout.tsx; this now pins the same-family home card for EN.
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
    canonical: "https://alkemos.com/evo",
    // SEO-GEO-6.4 (P1-9): full hreflang pair now that /ar/evo exists.
    languages: {
      en: "https://alkemos.com/evo",
      ar: "https://alkemos.com/ar/evo",
      "x-default": "https://alkemos.com/evo",
    },
  },
};

// Inject EVO SoftwareApplication structured data
// §12.53 item 3: locale-aware schema — the EN page reads an English
// entity description (was Arabic-only before the audit fix).
const evoSchema = getEVOApplicationSchema("en");

export default function EvoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(evoSchema) }}
      />
      {children}
    </>
  );
}
