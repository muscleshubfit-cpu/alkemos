import type { Metadata } from "next";
import { ToolSchemaScripts } from "@/components/ToolSchemaScripts";

/**
 * /ar/ai-workout-planner layout — §12.32 (AR side of the AI
 * workout-planner trial pair). Title carries NO brand suffix — the /ar
 * layout template appends exactly one "— Alkemos" (anti-double-brand
 * law, eadb3e7).
 */
export const metadata: Metadata = {
  title: "مخطط التمارين بالذكاء الاصطناعي — ولّد نظامك الأسبوعي مجاناً",
  description:
    "ولّد نظاماً تدريبياً أسبوعياً متوازناً بالذكاء الاصطناعي: اختر هدفك ومستواك وأيام تدريبك وتجهيزتك، وأضف قيودك، واحصل على نظام مُتحقق في ثوانٍ — تجربة مجانية بلا تسجيل.",
  keywords: [
    "مخطط التمارين بالذكاء الاصطناعي",
    "مولد برامج التمارين",
    "نظام تدريبي أسبوعي",
    "جدول تمرين جاهز",
    "توليد برنامج تمرين",
    "ai workout planner",
  ],
  alternates: {
    canonical: "https://alkemos.com/ar/ai-workout-planner",
    languages: {
      en: "https://alkemos.com/ai-workout-planner",
      ar: "https://alkemos.com/ar/ai-workout-planner",
      "x-default": "https://alkemos.com/ai-workout-planner",
    },
  },
  openGraph: {
    title: "مخطط التمارين بالذكاء الاصطناعي | Alkemos",
    description: "ولّد نظاماً تدريبياً أسبوعياً متوازناً في ثوانٍ — تجربة مجانية بلا تسجيل.",
    type: "website",
    locale: "ar_EG",
    url: "https://alkemos.com/ar/ai-workout-planner",
  },
};

export default function ArAiWorkoutPlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToolSchemaScripts tool="ai-workout-planner" lang="ar" />
      {children}
    </>
  );
}
