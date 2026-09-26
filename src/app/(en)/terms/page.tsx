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
  title: "Terms & Conditions | Alkemos — Rules of Using the Platform",
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
};

export default async function Page() {
 const content = await fetchSiteContentOverrides();
 return <StaticPageView page="terms" content={content} />;
}
