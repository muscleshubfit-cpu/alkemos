import type { Metadata } from "next";
import { ToolSchemaScripts } from "@/components/ToolSchemaScripts";

/**
 * /ai-meal-planner layout — §12.28 (owner directive «اين صفحة تخطيط
 * الوجبات بالذكاء الاصطناعي؟ مطلوب إنشاؤها مع سماح بالتجربة للجميع
 * بدون تعارض مع الاشتراكات»). EN side of the full hreflang pair with
 * /ar/ai-meal-planner.
 */
export const metadata: Metadata = {
  title: "AI Meal Planner | Alkemos — Free Day Plan Generator",
  description:
    "Generate a complete daily meal plan in grams and calories with AI: pick your calorie target and diet system, add preferences, and get a validated day plan in seconds. Free trial, no signup.",
  keywords: [
    "ai meal planner",
    "ai meal plan generator",
    "meal plan generator",
    "free ai meal planner",
    "personalized meal plan",
    "مخطط وجبات بالذكاء الاصطناعي",
  ],
  alternates: {
    canonical: "https://alkemos.com/ai-meal-planner",
    languages: {
      en: "https://alkemos.com/ai-meal-planner",
      ar: "https://alkemos.com/ar/ai-meal-planner",
      "x-default": "https://alkemos.com/ai-meal-planner",
    },
  },
  openGraph: {
    title: "AI Meal Planner | Alkemos",
    description:
      "Generate a complete day plan in grams and calories — free trial, no signup.",
    type: "website",
    url: "https://alkemos.com/ai-meal-planner",
  },
};

export default function AiMealPlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToolSchemaScripts tool="ai-meal-planner" lang="en" />
      {children}
    </>
  );
}
