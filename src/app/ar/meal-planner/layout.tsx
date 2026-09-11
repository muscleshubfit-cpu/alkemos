import type { Metadata } from "next";
import { ToolSchemaScripts } from "@/components/ToolSchemaScripts";

/**
 * SEO-GEO-4 (2026-09-08): AR metadata for /ar/meal-planner.
 * Title carries NO brand suffix — the /ar layout template appends exactly
 * one "— Alkemos".
 */
export const metadata: Metadata = {
  title: "مخطط الوجبات — ابنِ خطة غذائية مخصصة مجانًا",
  description:
    "ابنِ خطة وجبات مخصصة في دقائق: ابحث في قاعدة بيانات Alkemos من أكثر من 8830 أكلة، حدد الكميات والسعرات، واحفظ خطتك أو صدّرها مجانًا.",
  keywords: [
    "مخطط الوجبات",
    "خطة غذائية مجانية",
    "إنشاء نظام غذائي",
    "حاسبة وجبات",
    "نظام غذائي حسب السعرات",
    "خطة أكل صحي",
  ],
  alternates: {
    canonical: "https://alkemos.com/ar/meal-planner",
    languages: {
      en: "https://alkemos.com/meal-planner",
      ar: "https://alkemos.com/ar/meal-planner",
      "x-default": "https://alkemos.com/meal-planner",
    },
  },
  openGraph: {
    title: "مخطط الوجبات | Alkemos",
    description: "ابنِ وجباتك من 8,830+ أكلة وتتبّع الماكروز — مجانًا.",
    type: "website",
    locale: "ar_EG",
    url: "https://alkemos.com/ar/meal-planner",
  },
  twitter: {
    card: "summary_large_image",
    title: "مخطط الوجبات | Alkemos",
    description: "ابنِ وجباتك من 8,830+ أكلة وتتبّع الماكروز — مجانًا.",
  },
};

export default function ArMealPlannerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemaScripts tool="meal-planner" lang="ar" />
      {children}
    </>
  );
}
