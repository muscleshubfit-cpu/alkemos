import type { Metadata } from "next";
import { getCoachingServiceSchema, jsonLd } from "@/lib/seo";

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
  title: "الكوتشينج أونلاين — مدربون وأخصائيو تغذية معتمدون",
  description:
    "كوتشينج أونلاين مع مدربين وأخصائيي تغذية محترفين: خطط تغذية مخصصة، برامج تمارين متكيفة مع مستواك، متابعة شخصية أسبوعية، ومساعد ذكاء اصطناعي (EVO) متاح على مدار الساعة.",
  keywords: [
    "كوتشينج أونلاين",
    "مدرب شخصي أونلاين",
    "أخصائي تغذية أونلاين",
    "خطة تغذية مخصصة",
    "برنامج تمارين مخصص",
    "متابعة تدريب أسبوعية",
    "مدرب لياقة معتمد",
  ],
  openGraph: {
    title: "الكوتشينج أونلاين | Alkemos",
    description:
      "خطط مخصصة من مدربين معتمدين + متابعة شخصية + مساعد ذكي على مدار الساعة.",
    type: "website",
    locale: "ar_EG",
    url: "https://alkemos.com/ar/coaching",
  },
  twitter: {
    card: "summary_large_image",
    title: "الكوتشينج أونلاين | Alkemos",
    description:
      "خطط مخصصة من مدربين معتمدين + متابعة شخصية + مساعد ذكي على مدار الساعة.",
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

// Same Service structured data as the EN layout — Arabic-first strings
// (src/lib/seo.ts); aggregateRating stays removed (P0-5 law).
const coachingSchema = getCoachingServiceSchema();

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
      {children}
    </>
  );
}
