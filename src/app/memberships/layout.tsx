import { jsonLd } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memberships | Alkemos — Premium & Pro Plans",
  // PHASE 189 (SEO-GEO-10, deep-audit P1-3): was 183 chars — inside the
  // 158 EN budget. Prices match src/lib/memberships.ts exactly (the
  // single source of truth for pricing).
  description:
    // P3-10/م6 (Phase 217): the EN description now lists ALL four tiers —
    // it dropped Coaching while the AR twin lists it. Monthly prices only
    // (mirrors the AR twin; still inside the 158-char EN budget).
    "Compare Alkemos plans: Free forever, Premium $14.99/mo (unlimited EVO chat), Pro $29.99/mo (8 AI plans, no ads), Coaching $39.99/mo (human coach). Full limits published.",
  keywords: [
    "membership",
    "premium",
    "pro",
    "subscription",
    "fitness membership",
    "AI fitness coach",
    "meal planner",
    "workout plans",
  ],
  openGraph: {
    title: "Alkemos Memberships — Premium & Pro Plans",
    description:
      "Every price and usage limit in plain view: plan generations, swaps, saves, and what each tier adds.",
    type: "website",
    // §12.53 item 4 (2026-09-15): og:image + og:url + og:locale were all
    // absent — a child openGraph block REPLACES the root one (Next.js
    // merging), so the surface showed no card and no canonical og:url.
    // Same-family home card, matching the AR mirror's og-home-ar
    // inheritance.
    locale: "en_US",
    url: "https://alkemos.com/memberships",
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
    canonical: "https://alkemos.com/memberships",
    // Homepage AR mirror follow-up (2026-08-30): declare the Arabic mirror
    // (src/app/ar/memberships/page.tsx declares the reciprocal pair).
    languages: {
      en: "https://alkemos.com/memberships",
      ar: "https://alkemos.com/ar/memberships",
      "x-default": "https://alkemos.com/memberships",
    },
  },
};

export default function MembershipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // GEO (2026-08-30): OfferCatalog with the storefront prices (source of
  // truth: src/lib/memberships.ts MEMBERSHIPS — matches what the page
  // displays). Machine-readable pricing for Google rich results and AI
  // answer engines ("how much is alkemos premium?").
  const offerCatalogSchema = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Alkemos Membership Plans",
    url: "https://alkemos.com/memberships",
    itemListElement: [
      {
        "@type": "Offer",
        name: "Free",
        description: "The full product, free forever: libraries, 8 tools, EVO chat (10 messages/day), and 2 AI plan generations per month.",
        price: "0",
        priceCurrency: "USD",
        url: "https://alkemos.com/memberships",
      },
      {
        "@type": "Offer",
        name: "Premium",
        description:
          "Manage your plans: unlimited EVO chat, 4 AI plan generations/month, 3 swaps/week, export and sync. $14.99/month or $119/year.",
        price: "14.99",
        priceCurrency: "USD",
        url: "https://alkemos.com/memberships",
      },
      {
        "@type": "Offer",
        name: "Pro",
        description:
          "Adapt & optimize: 8 AI plan generations/month, 6 meal/exercise swaps per week, no ads. $29.99/month or $239/year.",
        price: "29.99",
        priceCurrency: "USD",
        url: "https://alkemos.com/memberships",
      },
      {
        "@type": "Offer",
        name: "Coaching",
        description:
          "Human coaching: plans from a real coach, weekly check-ins, manual swaps, priority support + all Pro benefits. $39.99/month or $359/year.",
        price: "39.99",
        priceCurrency: "USD",
        url: "https://alkemos.com/coaching",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(offerCatalogSchema) }}
      />
      {children}
    </>
  );
}
