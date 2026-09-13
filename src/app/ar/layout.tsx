import type { Metadata } from "next";

/**
 * Arabic nested layout.
 *
 * Provides Arabic-specific SEO metadata for all /ar/* routes:
 *   - Arabic title + description for search engines
 *   - og:locale = ar_EG for social sharing
 *   - hreflang alternates pointing to EN + AR versions
 *
 * The root `<html lang dir>` attributes are set by `src/app/layout.tsx`
 * via `resolveLocale()` reading the `x-pathname` header from middleware.
 *
 * The `<div dir="rtl" lang="ar">` wrapper is RETAINED as a defensive
 * safety net for deeply-nested components / third-party libraries.
 */

export const metadata: Metadata = {
  title: {
    default: "Alkemos | منصة اللياقة والتغذية الذكية المتكاملة",
    template: "%s — Alkemos",
  },
  // Phase 117 completion (owner directive 2026-09-04): meta description
  // shortened to 150-160 chars (159) ending with the owner's verbatim CTA
  // («ابدأ رحلتك الرياضية الآن مع منصة التدريب الرقمية المتكاملة» — توحّد سطر الفئة على «منصة اللياقة والتغذية الذكية المتكاملة» في 193 §12.50-أ-7) — the
  // previous ~190-char version had no call to action. The three copies in
  // this file stay identical (this file's established pattern).
  description:
    "868+ تمرينًا، 8830+ أكلة بالقيم الغذائية، برامج جاهزة، حاسبات مجانية، ومدربون معتمدون مع EVO. ابدأ رحلتك الآن مع منصة اللياقة والتغذية الذكية المتكاملة.",
  openGraph: {
    title: "Alkemos | منصة اللياقة والتغذية الذكية المتكاملة",
    description:
      "868+ تمرينًا، 8830+ أكلة بالقيم الغذائية، برامج جاهزة، حاسبات مجانية، ومدربون معتمدون مع EVO. ابدأ رحلتك الآن مع منصة اللياقة والتغذية الذكية المتكاملة.",
    siteName: "Alkemos",
    locale: "ar_EG",
    type: "website",
    // PHASE 187 (deep-audit P0-2): og:image for the AR root — the EN root
    // had one via metadata.ts (/logo.png) but the AR layout declared its
    // own openGraph without images, so every AR page without its own
    // block shared NO social card. Static branded home card (mirrors
    // /api/og-image design).
    images: [
      {
        url: "/images/og/og-home-ar.png",
        width: 1200,
        height: 630,
        alt: "منصة Alkemos الرياضية الشاملة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alkemos | منصة اللياقة والتغذية الذكية المتكاملة",
    description:
      "868+ تمرينًا، 8830+ أكلة بالقيم الغذائية، برامج جاهزة، حاسبات مجانية، ومدربون معتمدون مع EVO. ابدأ رحلتك الآن مع منصة اللياقة والتغذية الذكية المتكاملة.",
    images: ["/images/og/og-home-ar.png"],
  },
  // NOTE: NO `alternates` here (homepage AR mirror follow-up, 2026-08-30).
  // Next.js metadata inheritance is field-level: an `alternates` block in
  // this nested layout is inherited verbatim by EVERY /ar/* child page,
  // which made /ar/blog, /ar/exercises, /ar/foods and /ar/memberships
  // declare the HOMEPAGE canonical + hreflang (telling Google they are
  // duplicates of /ar). Each Arabic page now declares its own canonical +
  // languages in its own `metadata` export (see the pages' files), same
  // pattern as `src/app/ar/coaches/[slug]/page.tsx`.
};

export default function ArLayout({ children }: { children: React.ReactNode }) {
  return <div dir="rtl" lang="ar">{children}</div>;
}
