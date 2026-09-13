import type { Metadata } from "next";
import { StaticPageView } from "@/components/views/StaticPageView";

/**
 * FULL-SITE AUDIT FIX (2026-08-30): this page previously had no metadata
 * and INHERITED the root canonical (= homepage), telling Google it was a
 * duplicate of "/". Now it owns its identity (title/description/canonical).
 * AR EXPANSION (same day): /ar/about mirror built → the hreflang pair now
 * declares the real Arabic twin instead of nothing.
 */
export const metadata: Metadata = {
  title: "About Alkemos — Our Mission, Story & Team",
  // PHASE 189 (SEO-GEO-10, deep-audit P1-3): was 244 chars — Google
  // truncates meta descriptions around ~155-160. Same identity, one
  // clean sentence inside the 158 EN budget (the Phase-178 description
  // law applied to a static conversion surface).
  description:
    "Alkemos is an Egyptian fitness platform: 868+ exercises, ready workout programs, free calculators, a food database, the EVO AI coach, and online coaching.",
  alternates: {
    canonical: "/about",
    languages: {
      en: "https://alkemos.com/about",
      ar: "https://alkemos.com/ar/about",
      "x-default": "https://alkemos.com/about",
    },
  },
};

export default function Page() {
  return <StaticPageView page="about" />;
}
