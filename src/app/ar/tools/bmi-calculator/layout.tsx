import type { Metadata } from "next";

/**
 * SEO-GEO-4 (2026-09-08): AR metadata for /ar/tools/bmi-calculator.
 * Title carries NO brand suffix — the /ar layout template appends exactly
 * one "— Alkemos".
 */
export const metadata: Metadata = {
  title: "حاسبة كتلة الجسم BMI — اعرف وزنك المثالي | Alkemos",
  description:
    "احسب مؤشر كتلة الجسم (BMI) مجانًا واعرف هل وزنك مثالي أم زائد أم ناقص، مع تفسير النتيجة ونطاقات WHO — حاسبة دقيقة وسهلة بالعربية.",
  keywords: [
    "حاسبة كتلة الجسم",
    "حاسبة BMI",
    "حساب مؤشر كتلة الجسم",
    "الوزن المثالي",
    "حاسبة الوزن المثالي",
    "نطاقات BMI",
  ],
  alternates: {
    canonical: "https://alkemos.com/ar/tools/bmi-calculator",
    languages: {
      en: "https://alkemos.com/tools/bmi-calculator",
      ar: "https://alkemos.com/ar/tools/bmi-calculator",
      "x-default": "https://alkemos.com/tools/bmi-calculator",
    },
  },
  openGraph: {
    title: "حاسبة كتلة الجسم BMI | Alkemos",
    description: "اعرف هل وزنك مثالي أم زائد — حاسبة BMI مجانية بتفسير النتيجة.",
    type: "website",
    locale: "ar_EG",
    url: "https://alkemos.com/ar/tools/bmi-calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "حاسبة كتلة الجسم BMI | Alkemos",
    description: "اعرف هل وزنك مثالي أم زائد — حاسبة BMI مجانية بتفسير النتيجة.",
  },
};

export default function ArBmiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
