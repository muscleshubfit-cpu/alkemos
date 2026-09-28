import type { Metadata } from "next";
import MembershipsPage from "@/app/(en)/memberships/page";

const SITE_URL = "https://alkemos.com";

/**
 * Arabic mirror of /memberships.
 *
 * Passes `lang="ar"` to force Arabic rendering, regardless of the user's
 * localStorage language preference. This matches the established pattern
 * used by `/ar/blog/page.tsx` → `<BlogListPage lang="ar" />`,
 * `/ar/exercises/page.tsx`, and `/ar/foods/page.tsx`.
 *
 * The page is wrapped by `src/app/ar/layout.tsx`'s `<div dir="rtl" lang="ar">`
 * for proper RTL rendering, and by `src/middleware.ts`'s `Content-Language:
 * ar-EG` header for crawler language attribution.
 *
 * Homepage AR mirror follow-up (2026-08-30): own title + canonical +
 * hreflang so Google indexes THIS url (the ar/layout alternates block was
 * removed — it leaked the homepage signals onto every /ar/* child).
 */
export const metadata: Metadata = {
  title: "العضويات والباقات",
  description:
    "قارن باقات Alkemos: مجاني للأبد، بريميوم $14.99/شهر، برو $29.99/شهر، والتدريب الأونلاين مع مدرب بشري $39.99/شهر — كل الحدود منشورة بشفافية، والإلغاء في أي وقت.",
  alternates: {
    canonical: "/ar/memberships",
    languages: {
      en: `${SITE_URL}/memberships`,
      ar: `${SITE_URL}/ar/memberships`,
      "x-default": `${SITE_URL}/memberships`,
    },
  },
  // SEO/GEO audit (2026-09-28): the EN twin pins an explicit OG block
  // ((en)/memberships/layout.tsx — same-family home card), but this page
  // had none — Next.js field-level inheritance served the AR ROOT
  // HOMEPAGE og:title/og:description on /ar/memberships. Pins the AR home
  // card — the mirror of the EN block.
  openGraph: {
    title: "عضويات Alkemos — بريميوم وبرو",
    description:
      "كل الأسعار والحدود بوضوح: توليد الخطط الذكية، التبديلات، الحفظ، وما تضيفه كل باقة.",
    type: "website",
    locale: "ar_EG",
    url: `${SITE_URL}/ar/memberships`,
    siteName: "Alkemos",
    images: [
      {
        url: "/images/og/og-home-ar.png",
        width: 1200,
        height: 630,
        alt: "Alkemos — منصة اللياقة والتغذية الذكية المتكاملة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/og/og-home-ar.png"],
  },
};

export default function Page() {
  return <MembershipsPage lang="ar" />;
}
