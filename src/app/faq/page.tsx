import { jsonLd } from "@/lib/seo";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { StaticPageView } from "@/components/views/StaticPageView";
import { FAQS_EN, FAQS_AR } from "@/lib/faq-content";

/**
 * FAQ page — server component so we can attach metadata + FAQPage JSON-LD
 * for Google rich results.
 *
 * AR EXPANSION (2026-08-30): the Q&A data moved to src/lib/faq-content.ts
 * (shared with the new /ar/faq mirror). hreflang now declares the REAL
 * Arabic twin /ar/faq instead of the old self-referencing en/ar pair
 * (which told Google this EN url was also the AR version).
 */

export const metadata: Metadata = {
  // SEO-GEO-4 (2026-09-08): this is the ENGLISH canonical page — it was
  // shipping an Arabic title + Arabic og:locale (live-verified defect),
  // which mis-signals the page language to crawlers. EN metadata now;
  // the Arabic twin /ar/faq carries the Arabic metadata + AR-first JSON-LD.
  title: "FAQ — Complete Platform Guide | Alkemos",
  description:
    "Answers to the most common questions about Alkemos: how the EVO AI coach works, memberships and pricing, payment methods, data safety, Arabic support, and when to expect results.",
  alternates: {
    canonical: "https://alkemos.com/faq",
    languages: {
      "en": "https://alkemos.com/faq",
      "ar": "https://alkemos.com/ar/faq",
      "x-default": "https://alkemos.com/faq",
    },
  },
  openGraph: {
    title: "FAQ — Complete Platform Guide | Alkemos",
    description:
      "Comprehensive answers about the Alkemos platform: EVO AI coach, memberships, payments, safety, and more.",
    url: "https://alkemos.com/faq",
    type: "website",
    locale: "en_US",
  },
};

export default function Page() {
  // FAQPage JSON-LD — both EN + AR versions for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [...FAQS_EN, ...FAQS_AR].map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}
      />
      <StaticPageView page="faq" />
    </>
  );
}
