import type { Metadata } from "next";
import Link from "next/link";
import { jsonLd, getBreadcrumbSchema } from "@/lib/seo";
import { SiteHeader } from "@/components/SiteHeader";
import { DIET_LEVELS, DIET_SYSTEMS } from "@/lib/diet-plan-matrix";

const SITE_URL = "https://alkemos.com";

/**
 * /diet-plan — the English diet-plan matrix HUB (§12.27, owner directive
 * «بند ٨ تم تنفيذ عربى فقط مطلوب انجليزى» — the EN surface the §12.19
 * plan scheduled "later to close strongrfastr's chokepoint"). The 24 EN
 * leaf cells live under /diet-plan/{level}/{system}.
 *
 * Full hreflang pair with the AR twin (ar/diet-plan) — the surface is
 * bilingual now, so the honest-unpaired pattern no longer applies.
 * No FAQPage schema, no ratings, no fabricated signals.
 */
export const metadata: Metadata = {
  title: "Ready-Made Diet Plans by Calories (1200–3000) | Alkemos",
  description:
    "The diet-plan matrix: 24 complete daily plans (6 calorie levels × 4 systems — balanced, high-protein, keto, vegetarian) in grams and calories, plus a free customization step.",
  alternates: {
    canonical: `${SITE_URL}/diet-plan`,
    languages: {
      en: `${SITE_URL}/diet-plan`,
      ar: `${SITE_URL}/ar/diet-plan`,
      "x-default": `${SITE_URL}/diet-plan`,
    },
  },
  openGraph: {
    title: "Ready-Made Diet Plans by Calories — Alkemos",
    description:
      "24 complete daily plans in grams: from 1200 to 3000 calories × 4 diet systems.",
    url: `${SITE_URL}/diet-plan`,
    type: "website",
  },
};

export default function DietPlanHubPageEn() {
  const breadcrumb = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Diet Plans", url: "/diet-plan" },
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
            Ready-Made Diet Plans — the Calorie &amp; System Matrix
          </h1>
          <p className="mt-4 text-base font-normal leading-relaxed text-[var(--muted-foreground)]">
            This matrix turns your calorie number into an actual day of food:
            twenty-four ready plans, each built for one calorie level (from
            1200 to 3000) across four diet systems — balanced, high-protein,
            keto, and vegetarian. Every plan is written in grams and calories
            per item, with breakfast, lunch, dinner, and a snack drawn from
            familiar, affordable food: eggs and pita bread, rice and chicken,
            lentils and yogurt — no powders, no ingredients your local market
            does not stock.
          </p>
          <p className="mt-3 text-base font-normal leading-relaxed text-[var(--muted-foreground)]">
            Start from your number: if you already know your daily calories,
            pick your level straight from the matrix below; if you do not, run
            the calorie calculator first — a 1500-calorie plan fits a person
            burning 2400 very differently than one burning 1800. Then choose
            the system that resembles your life: balanced is the safe starting
            point for everyone, high-protein serves the fat-loss and
            muscle-building phases, keto suits people who already live that
            way, and vegetarian is built for days of legumes, grains, dairy,
            and eggs.
          </p>
          <p className="mt-3 text-base font-normal leading-relaxed text-[var(--muted-foreground)]">
            Every plan page ends with the customization step: plan your meals
            with AI — it generates a complete day from your number, system,
            and preferences, free without any account — or open the manual
            meal planner, enter the same items at your own grams, and watch
            the totals build live for each meal and for the day, then adjust
            the grams until your day lands exactly on your target. The ready
            plan opens the door; customization makes it your home.
          </p>

          <h2 className="mt-10 text-xl font-semibold tracking-tight text-[var(--text)]">
            The full matrix — pick your level and system
          </h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--edge)]">
            <table className="w-full min-w-[560px] border-collapse text-sm font-normal">
              <thead>
                <tr className="bg-[var(--tint)]">
                  <th scope="col" className="border-b border-[var(--edge)] px-3 py-2 text-start font-medium text-[var(--text)]">
                    Level / System
                  </th>
                  {DIET_SYSTEMS.map((s) => (
                    <th key={s.slug} scope="col" className="border-b border-[var(--edge)] px-3 py-2 text-center font-medium text-[var(--text)]">
                      {s.nameEn}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DIET_LEVELS.map((lv) => (
                  <tr key={lv} className="odd:bg-[var(--tint)]/40">
                    <td className="border-b border-[var(--edge)]/60 px-3 py-2 font-medium text-[var(--text)]">
                      {lv} calories
                    </td>
                    {DIET_SYSTEMS.map((s) => (
                      <td key={s.slug} className="border-b border-[var(--edge)]/60 px-3 py-2 text-center">
                        <Link
                          href={`/diet-plan/${lv}/${s.slug}`}
                          className="text-[var(--muted-foreground)] underline decoration-[var(--edge)] underline-offset-4 transition-colors hover:text-[var(--text)]"
                        >
                          Plan
                        </Link>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="mt-10 text-xl font-semibold tracking-tight text-[var(--text)]">
            How to read and use a plan
          </h2>
          <p className="mt-3 text-base font-normal leading-relaxed text-[var(--muted-foreground)]">
            The weights in these plans are cooked or ready-to-eat — cooked
            rice is not dry rice, and a boiled egg weighs roughly with its
            shell. The plan is an honest starting scaffold, not a closed
            contract: swap an item for another from the same family (fish for
            chicken, lentils for chickpeas) as long as the daily total stays
            near your target, and measure your response on the scale across
            two weeks, not by feel. If your weight moved in the intended
            direction after two weeks, the plan is working; if it did not,
            adjust by 100 to 200 calories in the required direction and give
            the next two weeks the same patience.
          </p>
          <p className="mt-3 text-base font-normal leading-relaxed text-[var(--muted-foreground)]">
            And the usual health reminder: these are general plans for healthy
            adults. If you live with a chronic condition — diabetes, kidney
            disease, pregnancy, or an eating disorder — the right number for
            you is set with a professional who sees your full file, and this
            matrix is an excellent conversation piece with them, never a
            replacement.
          </p>
        </main>
      </div>
    </>
  );
}
