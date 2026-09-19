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
  // Brand-suffix law (content-strategy v1, live-verified 2026-09-20): a
  // nested layout with a plain-string title RESETS the parent /ar template
  // for its whole subtree — the five /ar/tools/* children were silently
  // losing their "— Alkemos" suffix. The hub pins its own absolute title
  // (brand once) and re-declares the template so every child tool page
  // appends exactly one "— Alkemos" again.
  title: {
    absolute: "الأدوات المجانية — حاسبات ومخططات وأدوات ذكاء اصطناعي — Alkemos",
    template: "%s — Alkemos",
  },
  description:
    "8 أدوات لياقة وتغذية مجانية بالعربية: حاسبات السعرات ومؤشر كتلة الجسم والماكروز ونسبة الدهون، ومتتبع شرب الماء، ومخطط الوجبات، ومخططان بالذكاء الاصطناعي — بدون تسجيل.",
  keywords: [
    "حاسبة السعرات الحرارية",
    "حاسبة مؤشر كتلة الجسم",
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
    title: "الأدوات المجانية | Alkemos",
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
