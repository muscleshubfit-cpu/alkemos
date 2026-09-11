import type { Metadata } from "next";
import { getEVOApplicationSchema, jsonLd } from "@/lib/seo";

/**
 * SEO-GEO-6.4 (2026-09-12): AR metadata for /ar/evo — P1-9, the last
 * language-engineering gap (§12.19: "مرايا عربية لـ /evo و /coaching").
 *
 * The page component is the shared bilingual one (re-exported by
 * ../page.tsx); this layout gives the AR URL its own Arabic title /
 * description / keywords and full hreflang pair. The EVO
 * SoftwareApplication schema is injected here as on the EN layout —
 * its name/description are already Arabic-first (src/lib/seo.ts).
 */
export const metadata: Metadata = {
  title: "مدرب اللياقة الذكي EVO — خطط مخصصة بالذكاء الاصطناعي | Alkemos",
  description:
    "EVO محرك أداء ذكي من Alkemos — ليس مجرد روبوت محادثة: يقرأ بياناتك الصحية وهدفك، يبني خطط تغذية وتمارين مخصصة، يقترح بدائل ذكية للوجبات والتمارين، ويوفر استشارات لياقة وتغذية على مدار الساعة عبر الذكاء الاصطناعي. مجاني للجميع.",
  keywords: [
    "مدرب ذكاء اصطناعي للياقة",
    "مدرب اللياقة الذكي",
    "EVO",
    "خطة تمارين بالذكاء الاصطناعي",
    "خطة تغذية مخصصة",
    "استشارات تغذية أونلاين",
    "مدرب AI رياضي",
  ],
  openGraph: {
    title: "مدرب اللياقة الذكي EVO | Alkemos",
    description:
      "محرك أداء ذكي يبني خطط تغذية وتمارين مخصصة من بياناتك — مجاني للجميع.",
    type: "website",
    locale: "ar_EG",
    url: "https://alkemos.com/ar/evo",
  },
  twitter: {
    card: "summary_large_image",
    title: "مدرب اللياقة الذكي EVO | Alkemos",
    description:
      "محرك أداء ذكي يبني خطط تغذية وتمارين مخصصة من بياناتك — مجاني للجميع.",
  },
  alternates: {
    canonical: "https://alkemos.com/ar/evo",
    languages: {
      en: "https://alkemos.com/evo",
      ar: "https://alkemos.com/ar/evo",
      "x-default": "https://alkemos.com/evo",
    },
  },
};

// Same EVO SoftwareApplication structured data as the EN layout —
// its description/offers/featureList are already Arabic (src/lib/seo.ts).
const evoSchema = getEVOApplicationSchema();

export default function ArEvoLayout({
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
