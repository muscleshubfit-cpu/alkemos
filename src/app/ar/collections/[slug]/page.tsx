import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  FOOD_COLLECTIONS,
  getFoodCollectionBySlug,
  getFoodsForCollection,
} from "@/lib/hub-collections";
import { CATEGORY_LABELS, TAG_LABELS, calculateNutrition } from "@/lib/foods-shared";
import { getItemListSchema, getBreadcrumbSchema, jsonLd } from "@/lib/seo";

/**
 * /ar/collections/[slug] — Arabic mirror of /collections/[slug].
 *
 * Targets Arabic queries like:
 *   "أطعمة عالية البروتين", "أكلات قليلة الكارب", "أطعمة كيتو",
 *   "أكلات للتخسيس", "مصادر بروتين نباتي"
 */

export const dynamicParams = true;

export function generateStaticParams() {
  return FOOD_COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = getFoodCollectionBySlug(slug);
  if (!collection) {
    return {
      title: "المجموعة غير موجودة — Alkemos",
      robots: { index: false, follow: false },
    };
  }
  const url = `https://alkemos.com/ar/collections/${collection.slug}`;
  return {
    title: collection.titleAr,
    description: collection.descriptionAr,
    alternates: {
      canonical: url,
      languages: {
        en: `https://alkemos.com/collections/${collection.slug}`,
        ar: url,
        "x-default": `https://alkemos.com/collections/${collection.slug}`,
      },
    },
    openGraph: {
      type: "website",
      url,
      title: collection.titleAr,
      description: collection.descriptionAr,
      siteName: "Alkemos",
      locale: "ar_AR",
    },
    twitter: {
      card: "summary",
      title: collection.titleAr,
      description: collection.descriptionAr,
    },
  };
}

export default async function ArabicFoodCollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = getFoodCollectionBySlug(slug);
  if (!collection) notFound();

  const foods = getFoodsForCollection(collection);

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "الرئيسية", url: "/ar" },
    { name: "الأطعمة", url: "/ar/foods" },
    { name: collection.h1Ar, url: `/ar/collections/${collection.slug}` },
  ]);

  const itemListSchema = getItemListSchema({
    name: `${collection.h1Ar} — Alkemos`,
    description: collection.descriptionAr,
    items: foods.map((f) => ({
      name: f.nameAr,
      url: `/ar/foods/${f.slug}`,
    })),
  });

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8 md:py-12" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema) }}
      />

      <nav className="mb-4 text-sm text-muted-foreground" aria-label="مسار التنقل">
        <Link href="/ar" className="hover:underline">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href="/ar/foods" className="hover:underline">الأطعمة</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">{collection.h1Ar}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{collection.h1Ar}</h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
          {collection.introAr}
        </p>
      </header>

      <section aria-label="قائمة الأطعمة" className="mb-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-semibold">كل {collection.h1Ar}</h2>
          <span className="text-sm text-muted-foreground">{foods.length} طعام</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {foods.map((food) => {
            const perServing = calculateNutrition(food, food.defaultGrams);
            const catLabel = CATEGORY_LABELS[food.category];
            return (
              <li key={food.slug}>
                <Link
                  href={`/ar/foods/${food.slug}`}
                  className="block p-4 rounded-lg border border-border bg-card hover:border-primary transition-colors"
                >
                  <div className="font-semibold text-foreground">{food.nameAr}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {catLabel.emoji} {catLabel.ar} · الحصة الافتراضية: {food.defaultServingAr} ({food.defaultGrams}ج)
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-1 text-xs">
                    <div className="text-center">
                      <div className="text-muted-foreground">سعرات</div>
                      <div className="font-semibold">{food.per100g.calories}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">ب</div>
                      <div className="font-semibold">{food.per100g.protein}ج</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">ك</div>
                      <div className="font-semibold">{food.per100g.carbs}ج</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">د</div>
                      <div className="font-semibold">{food.per100g.fat}ج</div>
                    </div>
                  </div>
                  {perServing && (
                    <div className="mt-2 text-xs text-muted-foreground border-t pt-2">
                      لكل حصة: {perServing.calories} سعر · {perServing.protein}ج بروتين
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-label="حسب الفئة" className="mb-10">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">تصفّح حسب الفئة</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORY_LABELS).map(([key, lbl]) => {
            const count = foods.filter((f) => f.category === key).length;
            if (count === 0) return null;
            return (
              <Link
                key={key}
                href={`/ar/foods?cat=${key}`}
                className="px-3 py-1.5 rounded-md border border-border text-sm hover:border-primary transition-colors"
              >
                {lbl.emoji} {lbl.ar} <span className="text-muted-foreground">({count})</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-label="مجموعات أخرى" className="mb-10">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">مجموعات أطعمة أخرى</h2>
        <div className="flex flex-wrap gap-2">
          {FOOD_COLLECTIONS.filter((c) => c.slug !== collection.slug).map((c) => (
            <Link
              key={c.slug}
              href={`/ar/collections/${c.slug}`}
              className="px-3 py-1.5 rounded-md border border-border text-sm hover:border-primary transition-colors"
            >
              {c.h1Ar}
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="خطّط تغذيتك" className="rounded-lg bg-muted/50 p-6">
        <h2 className="text-xl font-semibold mb-3">خطّط تغذيتك</h2>
        <p className="text-sm text-muted-foreground mb-4">
          احسب احتياجك اليومي من السعرات والماكروز، ثم خطّط وجباتك من هذه المجموعة.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/tools/calorie-calculator" className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90">حاسبة السعرات</Link>
          <Link href="/tools/macro-calculator" className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90">حاسبة الماكروز</Link>
          <Link href="/meal-planner" className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90">مخطّط الوجبات بالذكاء الاصطناعي</Link>
        </div>
      </section>
    </main>
  );
}
