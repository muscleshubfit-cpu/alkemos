import type { Metadata } from "next";

/**
 * SEO-GEO-4 (2026-09-08): AR metadata for /ar/tools/water-tracker.
 * Title carries NO brand suffix — the /ar layout template appends exactly
 * one "— Alkemos".
 */
export const metadata: Metadata = {
  title: "حاسبة الماء اليومي ومتتبع شرب الماء | Alkemos",
  description:
    "احسب احتياجك اليومي من الماء مجانًا بناءً على وزنك (35 مل × الكجم)، وسجّل كل كوب، واحفظ سجلك، وابنِ عادة شرب الماء يوميًا — متتبع مجاني بالعربية.",
  keywords: [
    "حاسبة الماء",
    "حساب كمية الماء اليومية",
    "متتبع شرب الماء",
    "كم لتر ماء اشرب يوميا",
    "احتياج الجسم من الماء",
    "تذكير شرب الماء",
  ],
  alternates: {
    canonical: "https://alkemos.com/ar/tools/water-tracker",
    languages: {
      en: "https://alkemos.com/tools/water-tracker",
      ar: "https://alkemos.com/ar/tools/water-tracker",
      "x-default": "https://alkemos.com/tools/water-tracker",
    },
  },
  openGraph: {
    title: "حاسبة الماء اليومي ومتتبع شرب الماء | Alkemos",
    description: "هدف ماء ذكي من وزنك + تسجيل الأكواب + سجل يومي — مجانًا.",
    type: "website",
    locale: "ar_EG",
    url: "https://alkemos.com/ar/tools/water-tracker",
  },
  twitter: {
    card: "summary_large_image",
    title: "حاسبة الماء اليومي ومتتبع شرب الماء | Alkemos",
    description: "هدف ماء ذكي من وزنك + تسجيل الأكواب + سجل يومي — مجانًا.",
  },
};

export default function ArWaterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
