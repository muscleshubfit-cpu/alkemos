import type { Metadata } from "next";
import { ToolSchemaScripts } from "@/components/ToolSchemaScripts";

/**
 * SEO-GEO-4 (2026-09-08): AR metadata for /ar/tools/macro-calculator.
 * Title carries NO brand suffix — the /ar layout template appends exactly
 * one "— Alkemos".
 */
export const metadata: Metadata = {
  title: "حاسبة الماكروز — وزّع بروتينك وكاربك ودهونك | Alkemos",
  description:
    "احسب احتياجك اليومي من الماكروز (بروتين وكارب ودهون) مجانًا بناءً على سعراتك وهدفك — تضخيم أو تنشيف أو ثبات، بخيارات نسب مختلفة ونتائج فورية.",
  keywords: [
    "حاسبة الماكروز",
    "حاسبة البروتين والكارب والدهون",
    "حساب الماكروز للتضخيم",
    "ماكروز التنشيف",
    "حاسبة البروتين اليومية",
    "توزيع السعرات",
  ],
  alternates: {
    canonical: "https://alkemos.com/ar/tools/macro-calculator",
    languages: {
      en: "https://alkemos.com/tools/macro-calculator",
      ar: "https://alkemos.com/ar/tools/macro-calculator",
      "x-default": "https://alkemos.com/tools/macro-calculator",
    },
  },
  openGraph: {
    title: "حاسبة الماكروز | Alkemos",
    description: "وزّع سعراتك على بروتين وكارب ودهون حسب هدفك — مجانًا وفورًا.",
    type: "website",
    locale: "ar_EG",
    url: "https://alkemos.com/ar/tools/macro-calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "حاسبة الماكروز | Alkemos",
    description: "وزّع سعراتك على بروتين وكارب ودهون حسب هدفك — مجانًا وفورًا.",
  },
};

export default function ArMacroLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemaScripts tool="macro-calculator" lang="ar" />
      {children}
    </>
  );
}
