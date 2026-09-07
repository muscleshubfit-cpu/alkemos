import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  EQUIPMENT_HUBS,
  getEquipmentHubBySlug,
  getExercisesForEquipmentHub,
} from "@/lib/hub-collections";
import { CATEGORY_LABELS, LEVEL_LABELS } from "@/lib/exercises";
import { getItemListSchema, getBreadcrumbSchema, jsonLd } from "@/lib/seo";

/**
 * /equipment/[type] — Equipment hub page (EN).
 *
 * SEO/GEO master plan Phase SEO-GEO-1 (2026-09-08): every equipment category
 * gets a hub page. High-value targets: /equipment/bodyweight (home workout
 * searches), /equipment/dumbbell (most common home gym), /equipment/barbell
 * (strength training). Bilingual mirror at /ar/equipment/[type].
 */

export const dynamicParams = true;

export function generateStaticParams() {
  return EQUIPMENT_HUBS.map((h) => ({ type: h.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const hub = getEquipmentHubBySlug(type);
  if (!hub) {
    return {
      title: "Equipment Not Found — Alkemos",
      robots: { index: false, follow: false },
    };
  }
  const url = `https://alkemos.com/equipment/${hub.slug}`;
  return {
    title: hub.titleEn,
    description: hub.descriptionEn,
    alternates: {
      canonical: url,
      languages: {
        en: url,
        ar: `https://alkemos.com/ar/equipment/${hub.slug}`,
        "x-default": url,
      },
    },
    openGraph: {
      type: "website",
      url,
      title: hub.titleEn,
      description: hub.descriptionEn,
      siteName: "Alkemos",
      locale: "en_US",
    },
    twitter: {
      card: "summary",
      title: hub.titleEn,
      description: hub.descriptionEn,
    },
  };
}

export default async function EquipmentHubPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const hub = getEquipmentHubBySlug(type);
  if (!hub) notFound();

  const exercises = getExercisesForEquipmentHub(hub);

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Exercises", url: "/exercises" },
    { name: `${hub.h1En}`, url: `/equipment/${hub.slug}` },
  ]);

  const itemListSchema = getItemListSchema({
    name: `${hub.h1En} — Alkemos`,
    description: hub.descriptionEn,
    items: exercises.slice(0, 50).map((e) => ({
      name: e.nameEn,
      url: `/exercises/${e.slug}`,
    })),
  });

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema) }}
      />

      <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/exercises" className="hover:underline">Exercises</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">{hub.h1En}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{hub.h1En}</h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
          {hub.introEn}
        </p>
      </header>

      <section aria-label="All exercises" className="mb-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-semibold">All Exercises</h2>
          <span className="text-sm text-muted-foreground">{exercises.length} exercises</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((ex) => {
            const catLabel = CATEGORY_LABELS[ex.category];
            const lvlLabel = LEVEL_LABELS[ex.level];
            return (
              <li key={ex.slug}>
                <Link
                  href={`/exercises/${ex.slug}`}
                  className="block p-4 rounded-lg border border-border bg-card hover:border-primary transition-colors"
                >
                  <div className="font-semibold text-foreground">{ex.nameEn}</div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {catLabel.en}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-white"
                      style={{ background: lvlLabel.color }}
                    >
                      {lvlLabel.en}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Primary: {ex.primaryMuscles.join(", ")}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-label="Browse by muscle group" className="mb-10">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">
          {hub.h1En} by Muscle Group
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORY_LABELS).map(([key, lbl]) => {
            const count = exercises.filter((e) => e.category === key).length;
            if (count === 0) return null;
            return (
              <Link
                key={key}
                href={`/muscles/${key}`}
                className="px-3 py-1.5 rounded-md border border-border text-sm hover:border-primary transition-colors"
              >
                {lbl.en} <span className="text-muted-foreground">({count})</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-label="Other equipment" className="mb-10">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Other Equipment</h2>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_HUBS.filter((h) => h.slug !== hub.slug).map((h) => (
            <Link
              key={h.slug}
              href={`/equipment/${h.slug}`}
              className="px-3 py-1.5 rounded-md border border-border text-sm hover:border-primary transition-colors"
            >
              {h.h1En}
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Workout programs" className="rounded-lg bg-muted/50 p-6">
        <h2 className="text-xl font-semibold mb-3">Workout Programs</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Ready-made training programs that match this equipment — from beginner to advanced.
        </p>
        <Link
          href="/programs"
          className="inline-block px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90"
        >
          Browse All Programs
        </Link>
      </section>
    </main>
  );
}
