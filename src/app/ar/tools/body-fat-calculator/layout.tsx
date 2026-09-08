import type { Metadata } from "next";

/**
 * SEO-GEO-4 (2026-09-08): AR metadata for /ar/tools/body-fat-calculator.
 * Title carries NO brand suffix — the /ar layout template appends exactly
 * one "— Alkemos".
 */
export const metadata: Metadata = {
  title: "حاسبة نسبة الدهون في الجسم — طريقة البحرية الأمريكية | Alkemos",
  description:
    "احسب نسبة الدهون في جسمك مجانًا بطريقة U.S. Navy المعتمدة بناءً على محيط الخصر والرقبة والورك — نتيجة فورية مع تصنيف النسبة وتفسيرها.",
  keywords: [
    "حاسبة نسبة الدهون",
    "حساب نسبة الدهون في الجسم",
    "حاسبة الدهون بطريقة البحرية",
    "نسبة الدهون الطبيعية",
    "حاسبة Body Fat",
  ],
  alternates: {
    canonical: "https://alkemos.com/ar/tools/body-fat-calculator",
    languages: {
      en: "https://alkemos.com/tools/body-fat-calculator",
      ar: "https://alkemos.com/ar/tools/body-fat-calculator",
      "x-default": "https://alkemos.com/tools/body-fat-calculator",
    },
  },
  openGraph: {
    title: "حاسبة نسبة الدهون في الجسم | Alkemos",
    description: "احسب نسبة دهونك مجانًا بطريقة U.S. Navy مع تصنيف النتيجة.",
    type: "website",
    locale: "ar_EG",
    url: "https://alkemos.com/ar/tools/body-fat-calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "حاسبة نسبة الدهون في الجسم | Alkemos",
    description: "احسب نسبة دهونك مجانًا بطريقة U.S. Navy مع تصنيف النتيجة.",
  },
};

export default function ArBodyFatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
