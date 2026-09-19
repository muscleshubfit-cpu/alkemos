import type { Metadata } from "next";
import { LandingView } from "@/components/views/LandingView";
import { AuthErrorToast } from "@/components/AuthErrorToast";
import { getHomeSamples } from "@/lib/home-samples";

const SITE_URL = "https://alkemos.com";

/**
 * Arabic home page — REAL page (was: redirect("/")).
 *
 * History / why this exists:
 *   This page used to be a one-line `redirect("/")`. The i18n provider
 *   then "guessed" the language from localStorage / browser settings, so:
 *     - Google crawled /ar (declared in hreflang) and found an empty
 *       redirect shell → the Arabic homepage was never indexed.
 *     - A visitor with a non-Arabic browser who explicitly opened /ar
 *       landed on the English homepage.
 *
 *   Fix (homepage AR mirror, 2026-08-30):
 *     - /ar now renders the real LandingView.
 *     - The I18nProvider is URL-aware (see `src/lib/i18n.tsx`): the root
 *       layout passes `urlLocale` resolved from the `x-pathname` header,
 *       so the SERVER renders Arabic strings for /ar (no flash, SEO sees
 *       full Arabic content).
 *     - The language toggle still works: on /ar it navigates to "/" and
 *       persists the choice in localStorage (MIRROR_ROUTES in
 *       `LanguageToggle.tsx`).
 *
 *   Metadata: title/description/OG defaults come from
 *   `src/app/ar/layout.tsx`; the alternates live HERE (not in the
 *   layout) so only the homepage declares the homepage canonical —
 *   sibling /ar/* pages declare their own (follow-up fix: the layout
 *   block was leaking to every child page).
 */
export const metadata: Metadata = {
  alternates: {
    canonical: "/ar",
    languages: {
      en: `${SITE_URL}/`,
      ar: `${SITE_URL}/ar`,
      "x-default": `${SITE_URL}/`,
    },
  },
  // Phase 231 (owner order «نفّذ الآن جميع إصلاحات Social Sharing
  // المتبقية…» — C1): /ar previously had NO og:url — the openGraph block
  // was inherited from src/app/ar/layout.tsx, which declares no `url`, so
  // shares/crawlers saw an og:url-less Arabic homepage. The block lives
  // HERE (the homepage only) — a `url` in the /ar LAYOUT would leak onto
  // every /ar/* child without its own openGraph (the exact leak class the
  // 2026-08-30 alternates fix removed; a child openGraph block REPLACES
  // the parent's wholesale, so the layout's fields are re-declared here
  // verbatim for THIS page).
  openGraph: {
    title: "Alkemos | منصة اللياقة والتغذية الذكية المتكاملة",
    description:
      "تدرّب بذكاء، وتغذَّ بدقة، وتقدّم والأرقام في صفك — منصة واحدة تجمع التدريب والتغذية والتخطيط الذكي: 868+ تمرينًا، و8,830+ صنفًا غذائيًا، و8 أدوات مجانية، ومدرّب ذكاء اصطناعي.",
    siteName: "Alkemos",
    locale: "ar_EG",
    type: "website",
    url: `${SITE_URL}/ar`,
    images: [
      {
        url: "/images/og/og-home-ar.png",
        width: 1200,
        height: 630,
        alt: "Alkemos — منصة اللياقة والتغذية الذكية المتكاملة",
      },
    ],
  },
};

export default function Page() {
  // Phase 202: the AR mirror passes the same curated REAL samples as the
  // EN homepage (server-side selection — see (home)/page.tsx), plus the
  // shared OAuth-error toast island (EN/AR parity).
  const samples = getHomeSamples();
  return (
    <>
      <AuthErrorToast />
      <LandingView samples={samples} />
    </>
  );
}
