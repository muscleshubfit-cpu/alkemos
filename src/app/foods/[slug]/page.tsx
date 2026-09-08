import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFoodBySlug, getRelatedFoods } from "@/lib/foods";
import { getCollectionsForFoodTags, type HubLinkMini } from "@/lib/hub-collections";
import { getBreadcrumbSchema, getReviewedWebPageSchema, jsonLd } from "@/lib/seo";
import FoodDetailClient from "./FoodDetailClient";

/**
 * Server component for food detail page.
 *
 * C22 fix: previously a "use client" component — could not export
 * generateMetadata. All 8,830 food pages shared the same generic
 * title from foods/layout.tsx. Now generates per-page metadata +
 * JSON-LD Breadcrumb schema server-side.
 *
 * Note: 8,830 pages are too many to pre-generate at build time
 * (would slow the build significantly). Instead, pages are rendered
 * on-demand (ISR via default caching). dynamicParams = true allows
 * any slug to be rendered.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const food = getFoodBySlug(slug);

  if (!food) {
    return {
      title: "Food Not Found — Alkemos",
      robots: { index: false, follow: false },
    };
  }

  const title = `${food.nameEn} — Calories, Macros & Nutrition per 100g | Alkemos`;
  const description = `${food.nameEn} nutrition facts: ${food.per100g.calories} kcal, ${food.per100g.protein}g protein, ${food.per100g.carbs}g carbs, ${food.per100g.fat}g fat per 100g. Default serving: ${food.defaultServingEn} (${food.defaultGrams}g).`;
  const url = `https://alkemos.com/foods/${food.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      // hreflang pair (2026-09-01): reciprocal declaration with the AR
      // mirror /ar/foods/[slug] (which declares the same pair).
      languages: {
        en: url,
        ar: `https://alkemos.com/ar/foods/${food.slug}`,
        "x-default": url,
      },
    },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "Alkemos",
      locale: "en_US",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const food = getFoodBySlug(slug);

  // A-8 (Phase 141): real 404 instead of a 200 + noindex soft-404 —
  // protects crawl budget and cleans Search Console coverage reports.
  // (Blog detail pages already did this; the exercise page even
  // imported notFound without ever calling it.)
  if (!food) notFound();

  const breadcrumbSchema = food
    ? getBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Foods", url: "/foods" },
        { name: food.nameEn, url: `/foods/${food.slug}` },
      ])
    : null;

  // GEO (2026-08-30): standalone NutritionInformation node — makes the
  // per-100g facts directly machine-readable for AI answer engines
  // ("calories in chicken breast" → parsed from here). Additive to the
  // breadcrumb schema; no existing signals change.
  // Phase SEO-GEO-4.5 (§7.1 #6+#7): YMYL E-E-A-T — reviewedBy Person +
  // lastReviewed date on the largest health-content surface (8,830 pages).
  // Standalone WebPage node keeps the existing nutrition node untouched.
  const reviewSchema = food
    ? getReviewedWebPageSchema({
        url: `https://alkemos.com/foods/${food.slug}`,
        name: `${food.nameEn} — Nutrition Facts (per 100 g)`,
      })
    : null;

  const nutritionSchema = food
    ? {
        "@context": "https://schema.org",
        "@type": "NutritionInformation",
        name: `${food.nameEn} — Nutrition Facts (per 100 g)`,
        servingSize: "100 g",
        calories: `${food.per100g.calories} kcal`,
        proteinContent: `${food.per100g.protein} g`,
        carbohydrateContent: `${food.per100g.carbs} g`,
        fatContent: `${food.per100g.fat} g`,
      }
    : null;

  return (
    <>
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
        />
      )}
      {nutritionSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(nutritionSchema) }}
        />
      )}
      {reviewSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(reviewSchema) }}
        />
      )}
      <FoodDetailClient
        food={food ?? null}
        related={food ? getRelatedFoods(food) : []}
        collectionLinks={food ? getCollectionsForFoodTags(food.tags).map(
          (c): HubLinkMini => ({
            href: `/collections/${c.slug}`,
            labelEn: c.h1En,
            labelAr: c.h1Ar,
          }),
        ) : []}
      />
    </>
  );
}
