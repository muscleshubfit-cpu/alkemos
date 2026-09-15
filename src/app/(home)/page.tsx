import { LandingView } from "@/components/views/LandingView";
import { AuthErrorToast } from "@/components/AuthErrorToast";
import { getHomeSamples } from "@/lib/home-samples";

/**
 * HOMEPAGE (EN canonical "/") — Phase 202 «Product-Website Homepage»
 * (owner order 2026-09-15: the homepage serves DISCOVERY + USAGE, not a
 * sales pitch).
 *
 * ARCHITECTURE (Phase 202): this page is now a SERVER component — it
 * picks the curated REAL content samples (8 exercises / 8 foods / 3
 * programs) from the giant server-only libraries via getHomeSamples()
 * and passes the small serializable slices to the client LandingView.
 * The old "use client" page existed only for the OAuth-error toast,
 * which now lives in the tiny AuthErrorToast island below (verbatim
 * behavior).
 *
 * Metadata (canonical + hreflang cluster) is owned by this route
 * group's server layout.tsx — unchanged.
 */
export default function Page() {
  const samples = getHomeSamples();
  return (
    <>
      <AuthErrorToast />
      <LandingView samples={samples} />
    </>
  );
}
