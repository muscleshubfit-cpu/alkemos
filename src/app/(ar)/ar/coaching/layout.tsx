import type { Metadata } from "next";
import { getCoachingServiceSchema, getFAQSchema, jsonLd } from "@/lib/seo";
import { COACHING_FAQ } from "@/lib/coaching-faq";

/**
 * SEO-GEO-6.4 (2026-09-12): AR metadata for /ar/coaching — P1-9, the
 * last language-engineering gap (§12.19).
 *
 * The page component is the shared bilingual one (re-exported by
 * ../page.tsx); this layout gives the AR URL its own Arabic title /
 * description / keywords and full hreflang pair. The Service schema is
 * injected here as on the EN layout — its name/description are already
 * Arabic-first (src/lib/seo.ts), with aggregateRating removed (P0-5).
 */
export const metadata: Metadata = {
  // BRANDLESS by law: the /ar/layout template appends exactly one
  // " — Alkemos" to depth-1 titles — including a brand here would render
  // a double-brand title (the same class of bug P0-3 fixed on blog).
  title: "التدريب الأونلاين — مدرب بشري يبني خططك ويتابعك أسبوعيًا",
  description:
    "تدريب أونلاين مع مدربين وأخصائيي تغذية محترفين: خطط مخصصة، برامج متكيفة، متابعة أسبوعية، ومدربك الذكي EVO على مدار الساعة.",
  keywords: [
    "التدريب الأونلاين",
    "مدرب شخصي أونلاين",
    "أخصائي تغذية أونلاين",
    "خطة تغذية مخصصة",
    "برنامج تمارين مخصص",
    "متابعة تدريب أسبوعية",
    "مدرب لياقة معتمد",
  ],
  openGraph: {
    title: "التدريب الأونلاين | Alkemos",
    description:
      "خطط مخصصة من مدربين معتمدين + متابعة شخصية + مساعد ذكي على مدار الساعة.",
    type: "website",
    locale: "ar_EG",
    url: "https://alkemos.com/ar/coaching",
    // Batch 1-b (2026-09-16, §12.53 item 4 follow-up): same AR-side gap
    // the batch-1 live verification caught — openGraph without images
    // replaces the root block in Next.js merging, so og-home-ar was NOT
    // inherited. Pinned explicitly — same pattern as the EN mirror.
    images: [
      {
        url: "/images/og/og-home-ar.png?v=2",
        width: 1200,
        height: 630,
        alt: "منصة Alkemos الرياضية الشاملة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "التدريب الأونلاين | Alkemos",
    description:
      "خطط مخصصة من مدربين معتمدين + متابعة شخصية + مساعد ذكي على مدار الساعة.",
    images: ["/images/og/og-home-ar.png?v=2"],
  },
  alternates: {
    canonical: "https://alkemos.com/ar/coaching",
    languages: {
      en: "https://alkemos.com/coaching",
      ar: "https://alkemos.com/ar/coaching",
      "x-default": "https://alkemos.com/coaching",
    },
  },
};

// Same Service structured data pattern as the EN layout — §12.53 item 3:
// locale-aware, so the AR page keeps the Arabic name/description while
// EN serves English; aggregateRating stays removed (P0-5 law).
const coachingSchema = getCoachingServiceSchema("ar");

// CONTENT-AUDIT P1-2 (2026-09-28, audit §1.4): see the EN layout — the AR
// FAQ answers are emitted as FAQPage JSON-LD from the same single-source
// array so non-JS crawlers read them in the served HTML.
const coachingFaqSchema = getFAQSchema(COACHING_FAQ.ar);

export default function ArCoachingLayout({
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(coachingFaqSchema) }}
      />
      {children}
    </>
  );
}
