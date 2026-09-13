import type { Metadata } from "next";

/**
 * SEO-GEO-4 (2026-09-08, owner directive «ابدأ (ج) ثم (أ)»): AR tools hub.
 *
 * Arabic mirror of /tools — the highest-volume Arabic fitness query family
 * («حاسبة السعرات الحرارية» وغيرها) has no dedicated professional Arabic
 * competitor (live-verified SERP: government portals + generic media).
 * Same client page as the EN hub (bilingual via useI18n urlLocale=ar).
 */
export const metadata: Metadata = {
  title: "الأدوات المجانية — الحاسبات والمتتبعات الرياضية",
  description:
    "حاسبات لياقة وتغذية مجانية بالعربية: حاسبة السعرات الحرارية، مؤشر كتلة الجسم BMI، الماكروز، نسبة الدهون، متتبع الماء، ومخطط الوجبات الذكي.",
  keywords: [
    "حاسبة السعرات الحرارية",
    "حاسبة BMI",
    "حاسبة الماكروز",
    "حاسبة نسبة الدهون",
    "حاسبة الماء",
    "أدوات لياقة مجانية",
    "مخطط وجبات مجاني",
  ],
  alternates: {
    canonical: "https://alkemos.com/ar/tools",
    languages: {
      en: "https://alkemos.com/tools",
      ar: "https://alkemos.com/ar/tools",
      "x-default": "https://alkemos.com/tools",
    },
  },
  openGraph: {
    title: "الأدوات المجانية | Alkemos — الحاسبات والمتتبعات الرياضية",
    description: "حاسبات لياقة وتغذية مجانية بالعربية لمساعدتك في رحلتك.",
    type: "website",
    locale: "ar_EG",
    url: "https://alkemos.com/ar/tools",
    // PHASE 187 (deep-audit P0-2): og:image — static branded family
    // card (design mirrors /api/og-image; see scripts/generate-og-cards.py).
    images: [
      {
        url: "/images/og/og-tools-ar.png",
        width: 1200,
        height: 630,
        alt: "حاسبات اللياقة المجانية من Alkemos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/og/og-tools-ar.png"],
    title: "الأدوات المجانية | Alkemos",
    description: "حاسبات لياقة وتغذية مجانية بالعربية لمساعدتك في رحلتك.",
  },
};

export default function ArToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
