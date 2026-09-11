import type { Metadata } from "next";
import { ToolSchemaScripts } from "@/components/ToolSchemaScripts";

/**
 * /ai-workout-planner layout — §12.32 (owner directive «ضيف أداة جديده
 * مخطط التمارين بالذكاء الاصطناعي»). EN side of the full hreflang pair
 * with /ar/ai-workout-planner.
 */
export const metadata: Metadata = {
  title: "AI Workout Planner | Alkemos — Free Weekly Split Generator",
  description:
    "Generate a balanced weekly workout split with AI: pick your goal, level, training days, and equipment, add constraints, and get a validated split in seconds. Free trial, no signup.",
  keywords: [
    "ai workout planner",
    "ai workout generator",
    "workout split generator",
    "free ai workout plan",
    "weekly workout program",
    "مخطط التمارين بالذكاء الاصطناعي",
  ],
  alternates: {
    canonical: "https://alkemos.com/ai-workout-planner",
    languages: {
      en: "https://alkemos.com/ai-workout-planner",
      ar: "https://alkemos.com/ar/ai-workout-planner",
      "x-default": "https://alkemos.com/ai-workout-planner",
    },
  },
  openGraph: {
    title: "AI Workout Planner | Alkemos",
    description:
      "Generate a balanced weekly split in seconds — free trial, no signup.",
    type: "website",
    url: "https://alkemos.com/ai-workout-planner",
  },
};

export default function AiWorkoutPlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToolSchemaScripts tool="ai-workout-planner" lang="en" />
      {children}
    </>
  );
}
