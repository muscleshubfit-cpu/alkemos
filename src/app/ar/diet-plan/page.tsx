import type { Metadata } from "next";
import Link from "next/link";
import { jsonLd, getBreadcrumbSchema } from "@/lib/seo";
import { SiteHeader } from "@/components/SiteHeader";
import { DIET_LEVELS, DIET_SYSTEMS } from "@/lib/diet-plan-matrix";

const SITE_URL = "https://alkemos.com";

/**
 * /ar/diet-plan — the Arabic diet-plan matrix HUB (Phase SEO-GEO-6.6,
 * §12.19 P1-8). The 24 leaf cells live under /ar/diet-plan/{level}/{system}.
 * AR-only surface per the plan («النسخة EN لاحقًا»): hreflang = self ar +
 * x-default self — the same honest-unpaired pattern as unpaired blog
 * posts (P0-4). No FAQPage schema, no ratings, no fabricated signals.
 */
export const metadata: Metadata = {
  // No brand in title — the /ar layout template appends exactly one
  // " — Alkemos" (anti-double-brand law, eadb3e7).
  title: "خطط غذائية عربية جاهزة بالسعرات — من 1200 إلى 3000 سعرة",
  description:
    "مصفوفة خطط الطعام العربية: 24 خطة يوم جاهزة (6 مستويات سعرات × 4 أنظمة — متوازن، عالي البروتين، كيتو، نباتي) بالغرامات والسعرات، مع خطوة تخصيصها مجاناً بلا تسجيل.",
  alternates: {
    canonical: `${SITE_URL}/ar/diet-plan`,
    languages: {
      ar: `${SITE_URL}/ar/diet-plan`,
      "x-default": `${SITE_URL}/ar/diet-plan`,
    },
  },
  openGraph: {
    title: "خطط غذائية عربية جاهزة بالسعرات — Alkemos",
    description:
      "24 خطة يوم كاملة بالغرامات: من 1200 إلى 3000 سعرة × 4 أنظمة غذائية.",
    url: `${SITE_URL}/ar/diet-plan`,
    type: "website",
    locale: "ar_EG",
  },
};

export default function DietPlanHubPage() {
  const breadcrumb = getBreadcrumbSchema([
    { name: "الرئيسية", url: "/ar" },
    { name: "خطط الأنظمة الغذائية", url: "/ar/diet-plan" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }}
      />
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <SiteHeader variant="landing" />
        <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            خطط غذائية عربية جاهزة — مصفوفة السعرات والأنظمة
          </h1>
          <p className="mt-4 text-base font-normal leading-relaxed text-[var(--muted-foreground)]">
            هذه المصفوفة تحوّل رقم سعراتك إلى يوم طعام حقيقي: أربع وعشرون خطة
            جاهزة، كل منها لِمستوى سعرات معيّن (من 1200 إلى 3000 سعرة) عبر
            أربعة أنظمة غذائية — المتوازن، وعالي البروتين، والكيتوني،
            والنباتي. كل خطة مكتوبة بالغرامات والسعرات لكل صنف، بفطور وغداء
            وعشاء وسناك من مطبخ عربي مألوف: الفول والخبز البلدي والأرز
            والدجاج والعدس والزبادي، لا مساحيق ولا أطعمة لا تجدها في سوقك.
          </p>
          <p className="mt-3 text-base font-normal leading-relaxed text-[var(--muted-foreground)]">
            ابدأ من رقمك: إن كنت تعرف سعراتك اليومية فاختر مستواها مباشرة من
            المصفوفة أدناه؛ وإن لم تعرفها فمرّ على حاسبة السعرات أولاً — فمستوى
            1500 سعرة لشخص يحرق 2400 غير مناسب تماماً لشخص يحرق 1800. ثم اختر
            النظام الذي يشبه حياتك: المتوازن نقطة البداية الآمنة للجميع، وعالي
            البروتين لمرحلة الخسارة وبناء العضلة، والكيتو لمن يحيا بداخله
            أصلاً، والنباتي لمن غذاؤه بقول وحبوب وألبان وبيض.
          </p>
          <p className="mt-3 text-base font-normal leading-relaxed text-[var(--muted-foreground)]">
            كل صفحة خطة تنتهي بخطوة التخصيص: افتح مخطط الوجبات — يعمل مجاناً
            بلا تسجيل — وأدخل الأصناف نفسها بغراماتك أنت، فتحصل على إجماليات
            حية لكل وجبة ولكل يوم، ثم عدّل الغرامات حتى يهبط اليوم على هدفك
            بالضبط. الخطة الجاهزة تفتح لك الباب؛ والتخصيص يجعلها بيتك.
          </p>

          <h2 className="mt-10 text-xl font-semibold tracking-tight text-[var(--text)]">
            المصفوفة الكاملة — اختر مستواك ونظامك
          </h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--edge)]">
            <table className="w-full min-w-[560px] border-collapse text-sm font-normal">
              <thead>
                <tr className="bg-[var(--tint)]">
                  <th scope="col" className="border-b border-[var(--edge)] px-3 py-2 text-start font-medium text-[var(--text)]">
                    المستوى / النظام
                  </th>
                  {DIET_SYSTEMS.map((s) => (
                    <th key={s.slug} scope="col" className="border-b border-[var(--edge)] px-3 py-2 text-center font-medium text-[var(--text)]">
                      {s.nameAr}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DIET_LEVELS.map((lv) => (
                  <tr key={lv} className="odd:bg-[var(--tint)]/40">
                    <td className="border-b border-[var(--edge)]/60 px-3 py-2 font-medium text-[var(--text)]">
                      {lv} سعرة
                    </td>
                    {DIET_SYSTEMS.map((s) => (
                      <td key={s.slug} className="border-b border-[var(--edge)]/60 px-3 py-2 text-center">
                        <Link
                          href={`/ar/diet-plan/${lv}/${s.slug}`}
                          className="text-[var(--muted-foreground)] underline decoration-[var(--edge)] underline-offset-4 transition-colors hover:text-[var(--text)]"
                        >
                          الخطة
                        </Link>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="mt-10 text-xl font-semibold tracking-tight text-[var(--text)]">
            كيف تقرأ الخطة وتستعملها
          </h2>
          <p className="mt-3 text-base font-normal leading-relaxed text-[var(--muted-foreground)]">
            الأوزان في الخطط مطبوخة أو جاهزة للأكل — فالأرز المطبوخ غير الأرز
            الجاف، والبيض المسلوق يوزن بقشرته تقريباً. والخطة نقطة انطلاق صادقة
            لا عقداً مغلقاً: استبدل صنفاً بآخر من نفس العائلة (سمك مكان دجاج،
            عدس مكان حمص) ما دام الإجمالي اليومي قريباً من هدفك، وقِس أثرك
            أسبوعين بالميزان لا بالحدس. إن تحرك وزنك في الاتجاه المقصود بعد
            أسبوعين فالخطة تعمل؛ وإن لم يتحرك فعدّل 100 إلى 200 سعرة في
            الاتجاه المطلوب ثم أعطِ الأسبوعين نفسيهما.
          </p>
          <p className="mt-3 text-base font-normal leading-relaxed text-[var(--muted-foreground)]">
            وتذكير الصحة المعتاد: هذه خطط عامة لبالغين أصحاء. إن كان لديك وضع
            صحي مزمن — سكري أو كلى أو حمل أو اضطراب أكل — فالرقم المناسب لك
            يُضبط مع مختص يرى ملفك كاملاً، والمصفوفة هنا نقطة حوار ممتازة معه
            لا بديلاً عنه.
          </p>
        </main>
      </div>
    </>
  );
}
