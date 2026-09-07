/* eslint-disable @next/next/no-img-element -- local, fixed-dimension brand
   assets (QR-asset precedent): a light+dark pair lets CSS pick the right
   one with ZERO hydration flicker (globals.css .theme-img-light/dark);
   next/image would double-preload both variants and cannot CSS-switch. */

/**
 * PageBanner — Phase 127 (owner directive: «الصور الجديدة (12 صورة) في
 * الريبو مخصصة للصفحات وليس للصفحة الرئيسية»).
 *
 * The owner's 12 header artworks (header-{section}-{light,dark}.webp,
 * 1280×477) are PAGE banners: one wide artwork strip at the top of each
 * hub page (tools / exercises / programs / foods / blog / pricing), NOT
 * homepage section banners (removed from LandingView in Phase 127).
 *
 * Server-component safe (plain <img> pair, no hooks). Decorative — the
 * page's real <h1> carries the semantics, so the banner is aria-hidden.
 */
export function PageBanner({
  section,
  className = "",
}: {
  section: "tools" | "exercises" | "programs" | "foods" | "blog" | "pricing";
  className?: string;
}) {
  return (
    <div
      className={`marble-card relative aspect-[1280/477] w-full ${className}`}
      aria-hidden="true"
    >
      <img
        src={`/images/brand/header-${section}-light.webp`}
        alt=""
        className="theme-img-light h-full w-full object-cover"
        decoding="async"
        /* PHASE 137c: high priority — this banner is the page's LCP element
           (Lighthouse lcp-discovery). The root layout route-scoped preload
           starts the same URL at TTFB; this keeps priority high for the
           pre-hydration discovery path as well. */
        fetchPriority="high"
      />
      {/* PHASE 139 (deep speed audit): the dark variant MUST be
           loading="lazy" — a plain eager <img> is fetched by Chrome even
           while display:none hides it (measured: header-blog-dark.webp
           60KB downloaded in LIGHT mode, pure waste on every hub page).
           ThemeImg's dark img has always been lazy — this is why the
           homepage hero never leaked. lazy + display:none = never fetched;
           flipping the theme to dark reveals it and it loads then. */}
      <img
        src={`/images/brand/header-${section}-dark.webp`}
        alt=""
        className="theme-img-dark h-full w-full object-cover"
        decoding="async"
        loading="lazy"
      />
    </div>
  );
}
