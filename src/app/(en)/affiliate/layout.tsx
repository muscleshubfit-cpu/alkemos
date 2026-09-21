import type { Metadata } from "next";

/**
 * Public Affiliate Program page SEO metadata.
 * Page itself is a client component (uses useI18n), so metadata must live
 * in a server-side layout.tsx — Next.js requirement.
 *
 * EN is the primary language (target: English-speaking audience); the
 * AR mirror has lived at /ar/affiliate since Phase 208 (§12.53 item 11)
 * with its own Arabic layout — this file is the EN half of the reciprocal
 * en/ar/x-default hreflang pair declared below.
 */
export const metadata: Metadata = {
  title: "Alkemos Affiliate Program — Turn Your Influence Into Income",
  description:
    "Join the Alkemos Affiliate Program, share smarter fitness and nutrition solutions, and earn commissions from eligible purchases made through your personal Affiliate link.",
  keywords: [
    "Alkemos affiliate program",
    "fitness affiliate program",
    "nutrition affiliate program",
    "earn commission fitness",
    "fitness influencer program",
    "personal trainer affiliate",
    "fitness blogger affiliate",
    "workout affiliate",
    "AI fitness coach affiliate",
    "sports affiliate program",
  ],
  openGraph: {
    title: "Alkemos Affiliate Program — Turn Your Influence Into Income",
    description:
      "Share Alkemos with people who trust your recommendations and earn commissions from eligible purchases.",
    type: "website",
    url: "https://alkemos.com/affiliate",
    siteName: "Alkemos",
    // Discovery 208 (§12.56), executed as Phase 209 (owner order
    // 2026-09-16): this layout's own openGraph block REPLACES the root
    // one in Next.js metadata merging, so the surface served no social
    // card at all — the exact §12.53 item 4 defect family fixed for the
    // 9 EN list surfaces in 206 (/affiliate wasn't on that audit list)
    // and for the AR mirror in 208. og-home-en pinned per the same law;
    // og:locale was missing too (og:url was already present).
    locale: "en_US",
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
    title: "Alkemos Affiliate Program — Turn Your Influence Into Income",
    description:
      "Share Alkemos with people who trust your recommendations and earn commissions from eligible purchases.",
    images: ["/images/og/og-home-en.png"],
  },
  alternates: {
    canonical: "https://alkemos.com/affiliate",
    // SEO audit H2 fix (2026-09-07): was en-US/ar-EG (self-pointing, no
    // x-default) while the whole site cluster uses en/ar + x-default —
    // mixed hreflang codes in one cluster break Google's reciprocal
    // validation. Normalized to the site-wide code pair.
    languages: {
      "en": "https://alkemos.com/affiliate",
      "ar": "https://alkemos.com/ar/affiliate",
      "x-default": "https://alkemos.com/affiliate",
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
