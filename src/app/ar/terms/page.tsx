import type { Metadata } from "next";
import { StaticPageView } from "@/components/views/StaticPageView";

const SITE_URL = "https://alkemos.com";

/**
 * Access-point fix (2026-09-14): /ar/terms — Arabic mirror of /terms.
 *
 * The Arabic terms content already existed inside the bilingual
 * StaticPageView; this page gives it its own indexable URL with
 * Arabic-first metadata + reciprocal hreflang with the EN page
 * (same pattern as /ar/faq and /ar/about).
 */
export const metadata: Metadata = {
  title: "الشروط والأحكام",
  description:
    "شروط استخدام Alkemos: الاشتراك والعضويات، الخطط المخصصة بالذكاء الاصطناعي، التبديلات، مسؤولية المدربين وعملائهم، الملكية الفكرية، وسياسة الاسترداد.",
  alternates: {
    canonical: `${SITE_URL}/ar/terms`,
    languages: {
      en: `${SITE_URL}/terms`,
      ar: `${SITE_URL}/ar/terms`,
      "x-default": `${SITE_URL}/terms`,
    },
  },
  openGraph: {
    title: "الشروط والأحكام — Alkemos",
    description:
      "شروط استخدام منصة Alkemos: الاشتراك، الخطط، التبديلات، والمسؤوليات.",
    url: `${SITE_URL}/ar/terms`,
    type: "website",
    locale: "ar_EG",
  },
};

export default function Page() {
  return <StaticPageView page="terms" />;
}
