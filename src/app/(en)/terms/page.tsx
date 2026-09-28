import type { Metadata } from "next";
import { StaticPageView } from "@/components/views/StaticPageView";
import { fetchSiteContentOverrides } from "@/lib/site-content/server";

// SITE-CONTENT-281: admin-editable page copy — Supabase overrides fetched
// server-side (anon key + RLS public-read, migration 0094) and passed down;
// the code defaults in site-content/static-pages.ts are the eternal fallback.
// The SAME 300 s ISR window the blog article pages use: an admin save is
// live within ~5 minutes with ZERO deploys, and a failed fetch renders the
// defaults verbatim (the fallback law).
export const revalidate = 300;
import { SiteHeader } from "@/components/SiteHeader";

/**
 * FULL-SITE AUDIT FIX (2026-08-30): this page previously had no metadata
 * and INHERITED the root canonical (= homepage), telling Google it was a
 * duplicate of "/". Now it owns its identity (title/description/canonical).
 * Access-point fix (2026-09-14): /ar/terms now exists — reciprocal
 * hreflang pair added.
 */
export const metadata: Metadata = {
  title: "Terms & Conditions — Rules of Using the Platform | Alkemos",
  description:
    "The official terms for using Alkemos: accounts and eligibility, memberships and billing, payments and refunds, acceptable use, health disclaimer, and liability limits.",
  alternates: {
    canonical: "/terms",
    languages: {
      en: "https://alkemos.com/terms",
      ar: "https://alkemos.com/ar/terms",
      "x-default": "https://alkemos.com/terms",
    },
  },
  // SEO/GEO audit (2026-09-28): without an openGraph block, Next.js
  // field-level inheritance served the ROOT homepage og:title/description
  // and og:url = "/" on /terms. Mirrors the AR twin's explicit block
  // (src/app/(ar)/ar/terms/page.tsx).
  openGraph: {
    title: "Terms & Conditions — Rules of Using the Platform | Alkemos",
    description:
      "The official terms for using Alkemos: accounts and eligibility, memberships and billing, payments and refunds, acceptable use, health disclaimer, and liability limits.",
    url: "https://alkemos.com/terms",
    type: "website",
    siteName: "Alkemos",
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
    images: ["/images/og/og-home-en.png"],
  },
};

export default async function Page() {
 const content = await fetchSiteContentOverrides();
 return <StaticPageView page="terms" content={content} />;
}
