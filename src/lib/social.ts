/**
 * Official social / entity profiles — Phase SEO-GEO-4.6 (2026-09-09).
 *
 * Single source for Alkemos's OWNED external profiles. The owner created
 * and supplied every URL in this phase («التكليف التقني بعد اكتمال
 * الروابط» — master plan §12.10): Trustpilot + Product Hunt + Facebook +
 * Instagram + X. These feed:
 *   1. Organization JSON-LD `sameAs` (src/lib/seo.ts) — the machine
 *      readable entity-link that lets Google's Knowledge Graph and AI
 *      answer engines connect "Alkemos" the brand to its profiles, and
 *      disambiguate it from the Alkimos suburb (Perth, Australia) that
 *      otherwise dominates the query (§2.3).
 *   2. The landing-page footer icon row (LandingView.tsx) — the human
 *      visible counterpart.
 *
 * Phase SEO-GEO-6.2 (2026-09-12): LinkedIn added — the owner created it
 * (§12.21, one of the three optional entity accounts from §12.13). URL
 * is canonicalized (utm share params stripped).
 *
 * Verification (2026-09-09, headless browser):
 *   - Trustpilot: live — page title "Alkemos Reviews | Be the first to
 *     review alkemos.com" (0 reviews yet — first-10-reviews task pending).
 *   - Facebook: live — the owner's share link (fb.com/share/1d5GgoxtMB)
 *     resolves to people/Alkemos/61593989587279, title "Alkemos | Facebook".
 *     The canonical /people/…/61593989587279/ form is stored, NOT the
 *     share link (share URLs carry tracking params and can expire).
 *   - X: HTTP 200 via curl.
 *   - Product Hunt / Instagram: anti-bot walls (403 / login redirect)
 *     block anonymous verification — URLs are owner-supplied verbatim.
 *
 * Canonicalization rules applied (E-E-A-T framework: sameAs must be
 * stable, verifiable URLs):
 *   - no query strings (Product Hunt ?launch=… stripped)
 *   - https + trailing slash where the platform canonicalizes to one
 */

export type SocialProfile = {
  /** stable machine key (matches icon row order) */
  name: "facebook" | "instagram" | "x" | "linkedin" | "trustpilot" | "producthunt";
  /** canonical profile URL — sameAs-safe (no trackers, no query strings) */
  url: string;
  labelEn: string;
  labelAr: string;
};

export const SOCIAL_PROFILES: readonly SocialProfile[] = [
  {
    name: "facebook",
    url: "https://www.facebook.com/people/Alkemos/61593989587279/",
    labelEn: "Alkemos on Facebook",
    labelAr: "Alkemos على فيسبوك",
  },
  {
    name: "instagram",
    url: "https://www.instagram.com/aalkemos/",
    labelEn: "Alkemos on Instagram",
    labelAr: "Alkemos على إنستجرام",
  },
  {
    name: "x",
    url: "https://x.com/Alkemos",
    labelEn: "Alkemos on X",
    labelAr: "Alkemos على X",
  },
  {
    name: "linkedin",
    url: "https://www.linkedin.com/in/alke-mos-29a751435",
    labelEn: "Alkemos on LinkedIn",
    labelAr: "Alkemos على LinkedIn",
  },
  {
    name: "trustpilot",
    url: "https://www.trustpilot.com/review/alkemos.com",
    labelEn: "Alkemos reviews on Trustpilot",
    labelAr: "تقييمات Alkemos على Trustpilot",
  },
  {
    name: "producthunt",
    url: "https://www.producthunt.com/products/alkemos",
    labelEn: "Alkemos on Product Hunt",
    labelAr: "Alkemos على Product Hunt",
  },
] as const;

/** Flat URL list — feeds Organization.sameAs directly. */
export const SOCIAL_PROFILE_URLS: readonly string[] = SOCIAL_PROFILES.map(
  (p) => p.url,
);
