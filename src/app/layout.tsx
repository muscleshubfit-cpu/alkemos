import Script from "next/script";
import { cookies, headers } from "next/headers";
import { Inter, Playfair_Display, Cairo } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/hooks/use-auth";
import { ReferralCookieChecker } from "@/components/ReferralCookieChecker";
import { CoachSlugClaimer } from "@/components/CoachSlugClaimer";
import { CookieConsent } from "@/components/CookieConsent";
import { EvoChatProvider } from "@/lib/evo-chat-context";
import { EvoWidgetLazy } from "@/components/EvoWidgetLazy";
import { getOrganizationSchema, getWebSiteSchema, jsonLd } from "@/lib/seo";
import { isAdFreePath } from "@/lib/ads-routes";
import { metadata, viewport } from "./metadata";

export { metadata, viewport };

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";

/* Phase 136 (PSI variance fix, 2026-09-07) — next/font migration.
 * BEFORE: 13 @fontsource weight CSS imports (Inter 400-800, Cairo 400-800,
 * Playfair 500-700) = 8 woff2 files (~194KB) discovered only AFTER the
 * render-blocking CSS parsed, each with a plain system-font fallback whose
 * metrics differ from the webfont → the FOUT swap reflowed the ENTIRE page
 * container (Lighthouse layout-shifts: 0.187 of the 0.208 CLS, causes
 * "Web font loaded" inter-latin-700 + playfair-500). AFTER: one VARIABLE
 * font file per family (~40KB), preloaded in <head> in parallel with the
 * CSS, and next/font's automatic metric-adjusted fallback (size-adjust /
 * ascent-override) keeps the fallback swap geometrically identical → the
 * font reflow CLS is eliminated while text stays visible during load
 * (display: swap). Cairo keeps preload:false — its @font-face unicode-range
 * means only /ar pages ever download the arabic subset, and preloading it
 * on EN pages would be pure waste (EN homepage downloaded ZERO Cairo files
 * before and still does). */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  preload: true,
});
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-cairo",
  preload: false,
});

// Site-wide structured data (JSON-LD) — injected on every page.
// §12.40 (P2-14, audit finding #9): the schemas are LOCALE-AWARE, so they
// are built INSIDE the component from the resolved route locale — the EN
// homepage now carries English Organization/WebSite descriptions, /ar/*
// pages the Arabic ones (previously hardcoded Arabic on every surface).

/**
 * SEO locale law (2026-09-01): a URL is Arabic ONLY when it is exactly
 * `/ar` or inside the `/ar/` route subtree. A loose `startsWith("/ar")`
 * would misclassify any future route whose path merely BEGINS with the
 * letters "ar" (e.g. /archive, /articles) as Arabic — rendering
 * `lang="ar" dir="rtl"` markup on an English page. Both the middleware
 * (`src/middleware.ts`) and this resolver share the same predicate so
 * the `<html lang dir>` attributes, the `Content-Language` header and
 * the `mhe:locale` cookie can never disagree about the current route.
 */
function isArabicPath(pathname: string): boolean {
  return pathname === "/ar" || pathname.startsWith("/ar/");
}

/**
 * Resolve the locale for the root <html lang dir> attributes.
 *
 * DYNAMIC — derived from the CURRENT route's locale (the `/ar/*` URL
 * prefix), never hardcoded: Googlebot always sees `lang="ar" dir="rtl"
 * on Arabic routes and `lang="en" dir="ltr"` on English ones.
 *
 * Precedence (enforced here, NOT in middleware):
 *   1. URL pathname — `/ar/...` → `ar` (cookie can NOT override this)
 *   2. `mhe:locale` cookie — ONLY when the `x-pathname` header is
 *      missing (middleware didn't run — edge case). Previously the
 *      cookie was trusted on every English path, but the cookie always
 *      lags one request behind (it is written by the PREVIOUS
 *      response): navigating /ar → / served `lang="ar"` markup for the
 *      ENGLISH url. Demoting the fallback to missing-pathname-only
 *      kills that stale-cookie cross-contamination (homepage AR mirror
 *      fix, 2026-08-30).
 *   3. Default `en`
 *
 * The middleware writes `mhe:locale` on every request to match the
 * pathname, so for `/ar/*` the cookie is always `ar` too. We still
 * check pathname FIRST so a stale cookie can never override an Arabic
 * URL (defensive belt-and-suspenders).
 *
 * The pathname is read from the `x-pathname` header set by middleware
 * (see `src/middleware.ts`). The root layout cannot receive `params`
 * because it's the parent of all routes, not a dynamic segment — so
 * `headers().get('x-pathname')` is the cleanest server-side way to
 * know which URL the user requested.
 *
 * IMPORTANT: calling `cookies()` and `headers()` opts the root layout
 * into dynamic rendering. This is acceptable — see archive/PROGRESS.md H1 fix
 * notes for the trade-off analysis.
 */
async function resolveLocale(): Promise<{ lang: "en" | "ar"; dir: "ltr" | "rtl" }> {
  // 1. Pathname — read from the `x-pathname` header set by middleware.
  //    This is the most reliable signal: the route's own locale ALWAYS
  //    wins (`/ar/*` → ar, everything else → en).
  const h = await headers();
  const pathname = h.get("x-pathname") || "";
  if (isArabicPath(pathname)) {
    return { lang: "ar", dir: "rtl" };
  }

  // 2. Cookie fallback — ONLY when middleware didn't run (no
  //    `x-pathname` header). Never trust it on a known English path:
  //    the cookie belongs to the PREVIOUS request and may still say
  //    `ar` right after navigating away from an /ar url.
  if (!pathname) {
    const c = await cookies();
    const cookieLocale = c.get("mhe:locale")?.value;
    if (cookieLocale === "ar") {
      return { lang: "ar", dir: "rtl" };
    }
  }
  // (cookie fallback only runs when middleware didn't execute — for every
  //  normal request the route pathname above decides the language)

  // 3. Default
  return { lang: "en", dir: "ltr" };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { lang, dir } = await resolveLocale();
  // §12.40 (P2-14): locale-aware entity schemas — see the note above the
  // component. Same two JSON-LD blocks as before, now describing the
  // entity in the page's own language.
  const organizationSchema = getOrganizationSchema(lang);
  const websiteSchema = getWebSiteSchema(lang);
  // P2 fix (perf audit 2026-09-07): hero artwork preloads are HOMEPAGE-ONLY.
  // The old unconditional pair wasted 38-68KB (one unused theme variant)
  // on every page, and ~205KB on non-hero pages (blog/tools/exercises).
  // The middleware always sets x-pathname, so this is exact.
  const h = await headers();
  const requestPath = h.get("x-pathname") || "/";
  const isHomePage = requestPath === "/" || requestPath === "/ar";

  /* Phase 136 — ROUTE-SCOPED preconnects (was: 6 global preconnects on
   * EVERY page). Each preconnect opens a DNS+TCP+TLS handshake to a
   * third-party origin; on Lighthouse's simulated slow-4G mobile profile
   * six of them ate the connection budget of the LCP image (its resource
   * load delay measured 395ms). Now each origin is warmed only on the
   * route subtree that actually fetches from it:
   *   /blog*      → Pexels/Pixabay/Unsplash (featured images)
   *   /exercises* → wger.de (exercise photos)
   *   /coaching*  → randomuser.me (testimonial avatars)
   *   /referral*  → api.qrserver.com (QR codes) */
  const isBlogPage =
    requestPath === "/blog" ||
    requestPath.startsWith("/blog/") ||
    requestPath === "/ar/blog" ||
    requestPath.startsWith("/ar/blog/");
  const isExercisesPage =
    requestPath === "/exercises" ||
    requestPath.startsWith("/exercises/") ||
    requestPath === "/ar/exercises" ||
    requestPath.startsWith("/ar/exercises/");
  const isCoachingPage =
    requestPath === "/coaching" ||
    requestPath === "/ar/coaching" ||
    requestPath.startsWith("/coaching/") ||
    requestPath.startsWith("/ar/coaching/");
  const isReferralPage = requestPath.startsWith("/referral");

  /* PHASE 137c (deep speed audit): hub-page banner preloads. PageBanner
   * server-renders the header-{section} artwork pair, but React Float
   * only emits its auto-preload WHERE THE BANNER STREAMS — after the
   * page's server-side data fetch (on /blog that measured a 688ms LCP
   * resource-load delay: the image request couldn't start until the posts
   * query finished streaming). These route-scoped preloads mirror the
   * homepage hero pattern: the EXACT same URLs start at TTFB. Scheme-
   * scoped so only the matching variant downloads. */
  const hubBannerSection: string | null =
    isBlogPage
      ? "blog"
      : isExercisesPage
        ? "exercises"
        : requestPath === "/tools" ||
            requestPath === "/ar/tools" ||
            requestPath.startsWith("/tools/")
          ? "tools"
          : requestPath === "/foods" ||
              requestPath === "/ar/foods" ||
              requestPath.startsWith("/foods/")
            ? "foods"
            : requestPath === "/programs" ||
                requestPath === "/ar/programs" ||
                requestPath.startsWith("/programs/")
              ? "programs"
              : requestPath === "/memberships" ||
                  requestPath === "/ar/memberships"
                ? "pricing"
                : null;

  return (
    <html
      lang={lang}
      dir={dir}
      className={`${inter.variable} ${playfair.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* RSS autodiscovery (Phase 86) — site-wide feed links so readers,
            aggregators and AI engines discover the 6-articles/day pipeline */}
        <link rel="alternate" type="application/rss+xml" title="Alkemos Blog (English)" href="/rss.xml" />
        <link rel="alternate" type="application/rss+xml" title="مدونة Alkemos (عربي)" href="/ar/rss.xml" />
        {/* Route-scoped preconnects — see the Phase 136 note above the
            return. Every page used to pay for all six handshakes. */}
        {isBlogPage && (
          <>
            <link rel="preconnect" href="https://images.pexels.com" />
            <link rel="dns-prefetch" href="https://images.pexels.com" />
            <link rel="preconnect" href="https://cdn.pixabay.com" />
            <link rel="dns-prefetch" href="https://cdn.pixabay.com" />
            <link rel="preconnect" href="https://images.unsplash.com" />
            <link rel="dns-prefetch" href="https://images.unsplash.com" />
          </>
        )}
        {isExercisesPage && (
          <>
            <link rel="preconnect" href="https://wger.de" />
            <link rel="dns-prefetch" href="https://wger.de" />
          </>
        )}
        {isCoachingPage && (
          <>
            <link rel="preconnect" href="https://randomuser.me" />
            <link rel="dns-prefetch" href="https://randomuser.me" />
          </>
        )}
        {isReferralPage && (
          <>
            <link rel="preconnect" href="https://api.qrserver.com" />
            <link rel="dns-prefetch" href="https://api.qrserver.com" />
          </>
        )}
        {/* Structured data — Organization + WebSite (site-wide) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(websiteSchema) }}
        />
        {/* Phase 126 — Marble & Chrome themes: hero artwork preloads.
            P2 fix (2026-09-07): homepage-only (the hero never renders
            elsewhere, so preloading it on /blog etc. was pure waste).
            Phase 135: preloads are OS-SCHEME-SCOPED via the `media`
            attribute. Phase 136 (PSI variance fix): (1) fetchPriority=high
            — Lighthouse lcp-discovery flagged the LCP request un-prioritized;
            (2) imageSrcSet/imageSizes mirror the <img srcset> EXACTLY so the
            preload still matches after the responsive-variant change —
            a preload that stops matching the img's chosen candidate would
            download the ORIGINAL file (e.g. 96.6KB logo) on top of the
            smaller variant the img actually uses. Mobile now fetches
            hero-640 (12.4KB vs 37.3KB) and logo-256 (23.4KB vs 96.6KB). */}
        {isHomePage && (
          <>
            <link
              rel="preload"
              as="image"
              href="/images/brand/hero-light.webp"
              media="(prefers-color-scheme: light)"
              fetchPriority="high"
              imageSrcSet="/images/brand/hero-light-640.webp 640w, /images/brand/hero-light-828.webp 828w, /images/brand/hero-light.webp 1280w"
              imageSizes="100vw"
            />
            <link
              rel="preload"
              as="image"
              href="/images/brand/hero-dark.webp"
              media="(prefers-color-scheme: dark)"
              fetchPriority="high"
              imageSrcSet="/images/brand/hero-dark-640.webp 640w, /images/brand/hero-dark-828.webp 828w, /images/brand/hero-dark.webp 1280w"
              imageSizes="100vw"
            />
            {/* Phase 127 — the hero chrome logo is a ThemeImg <img> pair
                (above the fold); preload BOTH variants scoped to their
                matching OS scheme, with the responsive srcset mirrored. */}
            <link
              rel="preload"
              as="image"
              href="/images/brand/logo-hero-light.webp"
              media="(prefers-color-scheme: light)"
              imageSrcSet="/images/brand/logo-hero-light-256.webp 256w, /images/brand/logo-hero-light-512.webp 512w, /images/brand/logo-hero-light.webp 760w"
              imageSizes="(max-width: 768px) 128px, (max-width: 1024px) 208px, 256px"
            />
            <link
              rel="preload"
              as="image"
              href="/images/brand/logo-hero-dark.webp"
              media="(prefers-color-scheme: dark)"
              imageSrcSet="/images/brand/logo-hero-dark-256.webp 256w, /images/brand/logo-hero-dark-512.webp 512w, /images/brand/logo-hero-dark.webp 760w"
              imageSizes="(max-width: 768px) 128px, (max-width: 1024px) 208px, 256px"
            />
          </>
        )}
        {/* PHASE 137c — hub banner artwork preloads (see the note above the
            return): PageBanner's own auto-preload arrives with the streamed
            page content (after the server data fetch); these start the same
            URLs at TTFB so the banner is LCP-ready immediately. The preload
            URL matches the <img src> exactly — no double download. */}
        {hubBannerSection && (
          <>
            <link
              rel="preload"
              as="image"
              href={`/images/brand/header-${hubBannerSection}-light.webp`}
              media="(prefers-color-scheme: light)"
              fetchPriority="high"
            />
            <link
              rel="preload"
              as="image"
              href={`/images/brand/header-${hubBannerSection}-dark.webp`}
              media="(prefers-color-scheme: dark)"
              fetchPriority="high"
            />
          </>
        )}
      </head>
      <body className="antialiased bg-background text-foreground">
        {/* Phase 126 — theme no-flash script: runs before first paint (first
            element in <body>): resolves the stored manual choice or falls
            back to the OS preference and stamps data-theme on <html>. Keeps
            SSR markup theme-neutral (CSS vars do the rest). */}
        <script
          id="alkemos-theme-init"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('alkemos-theme');var d=m==='dark'||m==='light'?m:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',d);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`,
          }}
        />
        <a href="#main-content-skip" className="sr-only-focusable">
          Skip to content
        </a>
        {/* PHASE 137 (deep speed audit 2026-09-07): consent pre-paint script.
            CookieConsent is now SSR-rendered VISIBLE (it used to mount after
            hydration — Lighthouse flagged the late-painted banner as THE LCP
            element on /blog at 7.9s). Returning users with a stored consent
            get html[data-mhe-consent-ok] stamped HERE, before this point in
            the DOM is parsed, so globals.css hides the bar pre-paint — zero
            flash, zero late LCP, and the bar paints with FCP for cold visits. */}
        <script
          id="alkemos-consent-init"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('mhe_cookie_consent');if(s){var d=JSON.parse(s);if(d&&typeof d.timestamp==='number'&&Date.now()-d.timestamp<31536000000){document.documentElement.setAttribute('data-mhe-consent-ok','1');return;}}}catch(e){}})();`,
          }}
        />
        <ReferralCookieChecker />
        <CookieConsent initialLang={lang} />
        <I18nProvider urlLocale={lang}>
          <AuthProvider>
            {/* COACH ATTRIBUTION (0033) — claims a coach-signup cookie for
                Google OAuth clients (needs useAuth → inside AuthProvider). */}
            <CoachSlugClaimer />
            <EvoChatProvider>
              {/* C23 fix: wrap children in a div with id="main-content-skip"
                  so the skip-to-content link always has a target, on both
                  public pages (no <main id="main-content">) and app pages
                  (AppLayout has its own <main id="main-content">). */}
              <div id="main-content-skip">
                {children}
              </div>
              {/* EVO Floating Widget — lazy (H5 audit 2026-09-05): loads
                  after first paint via requestIdleCallback, off the critical
                  path of every page. Provider stays eager (light). */}
              <EvoWidgetLazy />
            </EvoChatProvider>
          </AuthProvider>
        </I18nProvider>
        <Toaster position="top-center" richColors />
        <Script id="pwa-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                // Phase 128 cache fix: register with a version query so the
                // browser fetches the NEW worker immediately even if an old
                // /sw.js copy is still sitting in the HTTP cache (the update
                // check would otherwise reuse it for up to 24h). Keep this
                // query in sync with CACHE_VERSION in public/sw.js (v5 —
                // Phase 136 bump to drop pre-compression artwork caches).
                navigator.serviceWorker.register('/sw.js?v=5').then(function(reg) {
                  console.log('[PWA] Service Worker registered');
                }).catch(function(e) {
                  console.warn('[PWA] SW registration failed:', e);
                });
                // Phase 128 cache fix: when a NEW worker activates, it posts
                // SW_UPDATED to every client — reload once so all open tabs
                // pick up the fresh HTML + assets immediately (the old v3
                // worker kept serving stale brand artwork from Cache Storage).
                navigator.serviceWorker.addEventListener('message', function(e) {
                  if (e.data && e.data.type === 'SW_UPDATED') { location.reload(); }
                });
              });
            }
          `}
        </Script>
        {/* PHASE 178 — CONSENT MODE v2 (GDPR/ePrivacy gate), rendered
            ALWAYS (independent of GA_ID): AdSense is live in production
            and reads the gtag consent state; with no gtag on the page
            the banner's consent UPDATE could never reach it. The default
            state must be declared BEFORE any Google tag loads, then the
            visitor's STORED choice (the same mhe_cookie_consent record
            the pre-paint script reads) is applied pre-tag — consented
            traffic keeps serving personalized ads without a lost first
            signal, non-consenting traffic gets cookieless/denied mode.
            The GA loader below still only renders when GA_ID is set. */}
        <Script id="consent-mode-v2" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              wait_for_update: 500
            });
            try {
              var mcs = localStorage.getItem('mhe_cookie_consent');
              if (mcs) {
                var mcd = JSON.parse(mcs);
                if (mcd && typeof mcd.timestamp === 'number' && Date.now() - mcd.timestamp < 31536000000 && typeof mcd.granted === 'boolean') {
                  var st = mcd.granted ? 'granted' : 'denied';
                  gtag('consent', 'update', {
                    ad_storage: st, ad_user_data: st, ad_personalization: st, analytics_storage: st
                  });
                }
              }
            } catch (e) {}
          `}
        </Script>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}

        {/* Vercel Analytics — pageview + custom event tracking.
            No-op in dev or when not deployed on Vercel. */}
        <Analytics />

        {/* Vercel Speed Insights — Core Web Vitals + LCP/CLS/INP tracking. */}
        <SpeedInsights />

        {/* Google AdSense — only loaded when NEXT_PUBLIC_ADSENSE_CLIENT env
            var is set. Avoids loading AdSense on local dev or when the
            publisher hasn't been approved yet.
            Phase 136: moved from <head> to BODY-END. The loader is async so
            it never blocks parsing either way, but at body-end its ~240KB
            download (+~510ms of third-party main-thread work observed in
            Lighthouse while ads are under review and not even serving)
            starts AFTER the critical path — CSS, fonts, LCP image and the
            hydration chunks — instead of competing with them during the
            LCP window on slow mobile networks. The tag is still
            server-rendered in the initial HTML (the AdSense site review
            sees the code — do NOT make this client-side-only), and the
            AdSenseAd components queue their pushes in
            window.adsbygoogle, which the loader drains when it arrives.
            PHASE 139 (deep speed audit): route-scoped via the SHARED
            ad-free law (src/lib/ads-routes.ts) — the loader no longer
            ships ~220KB of third-party JS to /admin, /coach, /dashboard,
            /checkout, /auth and the other authenticated surfaces where
            ads are policy-forbidden anyway (AdSenseAd slots there render
            null). Public content pages keep the tag for the site review. */}
        {ADSENSE_CLIENT && !isAdFreePath(requestPath) && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
      </body>
    </html>
  );
}
