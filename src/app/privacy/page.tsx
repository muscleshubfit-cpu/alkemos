import type { Metadata } from "next";
import { StaticPageView } from "@/components/views/StaticPageView";
import { SiteHeader } from "@/components/SiteHeader";

/**
 * FULL-SITE AUDIT FIX (2026-08-30): this page previously had no metadata
 * and INHERITED the root canonical (= homepage), telling Google it was a
 * duplicate of "/". Now it owns its identity (title/description/canonical).
 * Access-point fix (2026-09-14): /ar/privacy now exists — reciprocal
 * hreflang pair added.
 */
export const metadata: Metadata = {
  title: "Privacy Policy | Alkemos — How We Protect Your Data",
  description:
    "How Alkemos collects, uses, and protects your personal data: account details, health metrics, cookies, third-party services, and your rights over your information.",
  alternates: {
    canonical: "/privacy",
    languages: {
      en: "https://alkemos.com/privacy",
      ar: "https://alkemos.com/ar/privacy",
      "x-default": "https://alkemos.com/privacy",
    },
  },
};

export default function Page() {
 return <StaticPageView page="privacy" />;
}
