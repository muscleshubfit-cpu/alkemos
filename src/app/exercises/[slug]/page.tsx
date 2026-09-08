import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getExerciseBySlug, getRelatedExercises } from "@/lib/exercises";
import {
  getMuscleHubByCategory,
  getEquipmentHubByEquipment,
  type HubLinkMini,
} from "@/lib/hub-collections";
import { getHowToSchema, getBreadcrumbSchema, getReviewedWebPageSchema, jsonLd } from "@/lib/seo";
import { CATEGORY_LABELS, EQUIPMENT_LABELS, LEVEL_LABELS } from "@/lib/exercises";
import ExerciseDetailClient from "./ExerciseDetailClient";

/**
 * Server component for exercise detail page.
 *
 * C22 fix: previously this was a "use client" component, so it could
 * not export generateMetadata. All 868 exercise pages shared the
 * same generic title from exercises/layout.tsx. Now the server
 * component generates per-page metadata + JSON-LD schemas, then
 * renders the client component for interactivity.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const exercise = getExerciseBySlug(slug);

  if (!exercise) {
    return {
      title: "Exercise Not Found — Alkemos",
      robots: { index: false, follow: false },
    };
  }

  const title = `${exercise.nameEn} — Proper Form & Instructions | Alkemos`;
  const description = `Learn how to perform ${exercise.nameEn} with proper form. Target muscles: ${exercise.primaryMuscles.join(", ")}. Equipment: ${EQUIPMENT_LABELS[exercise.equipment].en}. Level: ${LEVEL_LABELS[exercise.level].en}.`;
  const url = `https://alkemos.com/exercises/${exercise.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      // hreflang pair (2026-09-01): reciprocal declaration with the AR
      // mirror /ar/exercises/[slug] (which declares the same pair).
      languages: {
        en: url,
        ar: `https://alkemos.com/ar/exercises/${exercise.slug}`,
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

export async function generateStaticParams() {
  // Pre-generate all 868 exercise slugs at build time for SSG
  const { EXERCISES } = await import("@/lib/exercises");
  return EXERCISES.map((ex) => ({ slug: ex.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exercise = getExerciseBySlug(slug);

  // A-8 (Phase 141): real 404 instead of a 200 + noindex soft-404 —
  // protects crawl budget and cleans Search Console coverage reports.
  // (Blog detail pages already did this; the exercise page even
  // imported notFound without ever calling it.)
  if (!exercise) notFound();

  // Generate JSON-LD schemas server-side so they're in the initial HTML
  const exerciseSchema = exercise
    ? getHowToSchema({
        name: exercise.nameEn,
        description: `Exercise for ${exercise.primaryMuscles.join(", ")} with ${exercise.equipment}`,
        steps: exercise.instructionsEn,
        tool: [exercise.equipment],
      })
    : null;

  const breadcrumbSchema = exercise
    ? getBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Exercises", url: "/exercises" },
        { name: exercise.nameEn, url: `/exercises/${exercise.slug}` },
      ])
    : null;

  // Phase SEO-GEO-4.5 (§7.1 #6+#7): YMYL E-E-A-T — reviewedBy Person +
  // lastReviewed date on the 868-page instruction library. Additive WebPage
  // node; the HowTo node stays untouched (Google retired its rich results
  // in Sept 2023, but it stays for other engines' understanding).
  const reviewSchema = exercise
    ? getReviewedWebPageSchema({
        url: `https://alkemos.com/exercises/${exercise.slug}`,
        name: `${exercise.nameEn} — Proper Form & Instructions`,
      })
    : null;

  // Phase 155 (SEO-GEO-4.7, §7.1 #11): spoke→hub internal links — every
  // exercise page now links its muscle-group hub and equipment hub
  // (deterministic 1:1 field matches, computed server-side so the
  // server-only hub module stays out of the client bundle).
  const muscleHub = exercise ? getMuscleHubByCategory(exercise.category) : null;
  const equipmentHub = exercise ? getEquipmentHubByEquipment(exercise.equipment) : null;
  const hubLinks: {
    muscle: HubLinkMini | null;
    equipment: HubLinkMini | null;
  } | null = exercise
    ? {
        muscle: muscleHub
          ? { href: `/muscles/${muscleHub.slug}`, labelEn: muscleHub.h1En, labelAr: muscleHub.h1Ar }
          : null,
        equipment: equipmentHub
          ? { href: `/equipment/${equipmentHub.slug}`, labelEn: equipmentHub.h1En, labelAr: equipmentHub.h1Ar }
          : null,
      }
    : null;

  return (
    <>
      {exerciseSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(exerciseSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
        />
      )}
      {reviewSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(reviewSchema) }}
        />
      )}
      <ExerciseDetailClient
        exercise={exercise ?? null}
        slug={slug}
        related={exercise ? getRelatedExercises(exercise) : []}
        hubLinks={hubLinks}
      />
    </>
  );
}
