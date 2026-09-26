"use client";

import { useI18n } from "@/lib/i18n";
import { ThemeImg } from "@/components/ThemeImg";
import { SOCIAL_PROFILES } from "@/lib/social";
import { NewsletterForm } from "@/components/NewsletterForm";

/**
 * SiteFooter — the SHARED public footer (Access-Point Fix, 2026-09-14).
 *
 * HISTORY: this footer lived INLINE inside LandingView (the homepage), so
 * the full marble link grid existed ONLY on "/" and "/ar" — every other
 * public page carried a bare «© Alkemos» line. The FULL-SITE ACCESS-POINT
 * AUDIT (2026-09-14) found the consequence: legal pages, /compare, hub
 * families (muscles / equipment / collections) had no persistent crawlable
 * entry point outside the homepage. This component extracts the EXACT same
 * markup so every public route renders the identical footer.
 *
 * PHASE 202 (owner order 2026-09-15): the link grid is organized as the
 * platform's SERVICE MAP — Training / Nutrition / Tools & AI / Coaching &
 * Services / Company — matching the header's five core services, so the
 * footer reads as a real navigation to the ecosystem. Every link keeps its
 * exact href and locale-awareness (access-point laws preserved —
 * diet-plan, compare, hub families, EVO entry untouched).
 *
 * HOME-REFINE-270 (owner order 2026-09-24: «الفوتر الغى القوائم المنسدلة
 * واجعلة منظم ومعروض بالكامل» — remove the dropdowns; make it organized
 * and FULLY displayed): the VRD-V2 §12 mobile disclosure groups are
 * GONE. One flat organized grid serves EVERY breakpoint — 2 columns on
 * touch (the brand row full-width), 3 from md, the full 6-column service
 * map from lg — and every link is always visible with a single copy
 * (the href-sync law is now ×1: one link, one href, one place). The bottom
 * tagline is the owner's pair: EN "Built with care for the fitness
 * community" · AR "صُنع بعناية لمجتمع اللياقة".
 *
 * HOME-REFINE-271 (owner order 2026-09-24: «الفوتر محتاج اختصار ما يمكن
 * اختصاره» — shorten what can be shortened): every list is trimmed to
 * its PRIMARY entry points (27 → 18 links). The dropped surfaces are
 * all still one tap away — the header's desktop nav + drawer carry
 * the muscle/equipment hubs, the meal planner, the food collections,
 * the five individual tools, and EVO — while the footer-only pages
 * (About / Contact / FAQ / Privacy / Terms) and the compare vertical
 * stay. The five individual tool links collapse into ONE «كل الأدوات»
 * hub link.
 *
 * Placement law: render AFTER the page's <main> inside the
 * min-h-screen flex-col wrapper (mt-auto keeps it pinned to the bottom).
 *
 * OWNER DIRECTIVES honored (2026-09-14):
 *  - NO /evo or /coaches/[slug] links added or removed here beyond what the
 *    homepage footer already had (EVO stays exactly as it was; coaches pages
 *    stay self-promoted by their owners).
 *  - NO private surfaces linked (the «no private routes in public
 *    navigation» rule).
 */

export function SiteFooter() {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  return (
    <footer className="footer-marble relative mt-auto px-6 pb-8 pt-14 text-[var(--muted-foreground)]">
      {/* mt-auto: inside the flex-col min-h-screen page shells (static
          pages, blog, contact, compare) the footer sticks to the bottom
          when content is short; inside plain block containers (homepage,
          tools) auto margins are zero — zero visual difference. */}
      {/* TPL-BASE: the template's footer — one top hairline (footer-marble),
          max-w-7xl, the brand lockup with the ember logo chip, uppercase
          tracking-[0.18em] column labels, and the bottom © bar. Every link
          keeps its exact href (access-point law). */}
      <div className="mx-auto max-w-7xl">
        {/* THE FLAT SERVICE MAP — one organized grid at every breakpoint,
            every list fully displayed. 2 columns on touch · 3 from md ·
            6 (brand + the five services) from lg. */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-6 lg:gap-x-8">
          {/* Brand — the template's lockup: ember logo chip + wordmark +
              tagline + the owned-profile social row. */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <span className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-[var(--text)] rtl:tracking-normal">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#ff4d26] to-[#ff9353]">
                <ThemeImg
                  light="/images/brand/mark-helmet-light.png"
                  dark="/images/brand/mark-helmet-dark.png"
                  alt=""
                  width={128}
                  height={128}
                  eager
                  className="h-6 w-6 object-contain"
                />
              </span>
              Alkemos
            </span>
            <p className="mt-4 max-w-xs text-sm">{isAr ? "اصنع قوّتك الأسطورية." : "Forge Your Legendary Strength."}</p>
            <p className="mt-3 text-[10px] font-normal text-[var(--muted-foreground)]">{isAr ? `© ${new Date().getFullYear()} جميع الحقوق محفوظة` : `© ${new Date().getFullYear()} All rights reserved`}</p>
            {/* Phase SEO-GEO-4.6 (2026-09-09): owned-profile icon row — the
                human counterpart of Organization.sameAs (src/lib/social.ts).
                Plain links with NO nofollow: these are OWNED profiles and the
                crawlable link IS the entity-association signal. */}
            {/* m1 fix (DEEP-UX-AUDIT-2026-09-18): social anchors are now
                32×32 flex targets (svg stays 16px) and footer text links
                are block rows with py-1 — every tappable target ≥24px
                (WCAG 2.5.8 AA) on the mobile footer without changing the
                visual design language. */}
            <div className="mt-4 flex items-center gap-2">
              {SOCIAL_PROFILES.map((p) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={isAr ? p.labelAr : p.labelEn}
                  title={isAr ? p.labelAr : p.labelEn}
                  className="inline-flex h-8 w-8 items-center justify-center text-[var(--muted-foreground)] transition-colors hover:text-[var(--text)]"
                >
                  <SocialIcon name={p.name} />
                </a>
              ))}
            </div>
          </div>

          {/* List 1: TRAINING (trimmed to the two primary entry points). */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--text)_40%,transparent)] rtl:tracking-normal">{isAr ? "التدريب" : "Training"}</p>
            <ul className="mt-3 space-y-2 text-[13px] leading-7">
              <li><a href={isAr ? "/ar/exercises" : "/exercises"} className="block py-1 hover:underline">{isAr ? "مكتبة التمارين" : "Exercises"}</a></li>
              <li><a href={isAr ? "/ar/programs" : "/programs"} className="block py-1 hover:underline">{isAr ? "برامج التدريب" : "Programs"}</a></li>
            </ul>
          </div>

          {/* List 2: NUTRITION (HOME-REFINE-271: trimmed — the meal
              planner and the food collections live in the header's
              Nutrition nav). */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--text)_40%,transparent)] rtl:tracking-normal">{isAr ? "التغذية" : "Nutrition"}</p>
            <ul className="mt-3 space-y-2 text-[13px] leading-7">
              <li><a href={isAr ? "/ar/foods" : "/foods"} className="block py-1 hover:underline">{isAr ? "مكتبة الأطعمة" : "Foods"}</a></li>
              {/* §12.27: the diet-plan matrix entry. */}
              <li><a href={isAr ? "/ar/diet-plan" : "/diet-plan"} className="block py-1 hover:underline">{isAr ? "مكتبة الخطط الغذائية الجاهزة" : "Diet Plans"}</a></li>
            </ul>
          </div>

          {/* List 3: TOOLS & AI (HOME-REFINE-271: the five individual
              tool links collapse into ONE hub link — the header's Tools
              nav carries each tool directly; the two AI planners stay
              as the flagship services). */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--text)_40%,transparent)] rtl:tracking-normal">{isAr ? "الأدوات والذكاء الاصطناعي" : "Tools & AI"}</p>
            <ul className="mt-3 space-y-2 text-[13px] leading-7">
              <li><a href={isAr ? "/ar/tools" : "/tools"} className="block py-1 hover:underline">{isAr ? "كل الأدوات المجانية" : "All Free Tools"}</a></li>
              <li><a href={isAr ? "/ar/ai-meal-planner" : "/ai-meal-planner"} className="block py-1 hover:underline">{isAr ? "مخطط الوجبات بالذكاء الاصطناعي" : "AI Meal Planner"}</a></li>
              <li><a href={isAr ? "/ar/ai-workout-planner" : "/ai-workout-planner"} className="block py-1 hover:underline">{isAr ? "مخطط التمارين بالذكاء الاصطناعي" : "AI Workout Planner"}</a></li>
            </ul>
          </div>

          {/* List 4: COACHING & SERVICES (HOME-REFINE-271: EVO dropped
              here — the floating widget on every page + the header's AI
              nav + the homepage EVO section carry it; the rest stays). */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--text)_40%,transparent)] rtl:tracking-normal">{isAr ? "الكوتشينج والخدمات" : "Coaching & Services"}</p>
            <ul className="mt-3 space-y-2 text-[13px] leading-7">
              <li><a href={isAr ? "/ar/coaching" : "/coaching"} className="block py-1 hover:underline">{isAr ? "الكوتشينج" : "Coaching"}</a></li>
              <li><a href={isAr ? "/ar/memberships" : "/memberships"} className="block py-1 hover:underline">{isAr ? "العضويات" : "Memberships"}</a></li>
              {/* §12.53 item 11 (2026-09-16): locale-aware affiliate link —
                  the AR mirror exists now. */}
              <li><a href={isAr ? "/ar/affiliate" : "/affiliate"} className="block py-1 hover:underline">{isAr ? "برنامج الإفلييت (الشركاء)" : "Affiliate Program"}</a></li>
              <li><a href={isAr ? "/ar/for-coaches" : "/for-coaches"} className="block py-1 hover:underline">{isAr ? "للمدربين" : "For Coaches"}</a></li>
            </ul>
          </div>

          {/* List 5: COMPANY (Phase 202 service map — the blog + the
              compare vertical join the legal/basic pages so every
              remaining public surface is reachable; exact same links as
              the old Legal & Basic list + Blog + Comparisons). */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--text)_40%,transparent)] rtl:tracking-normal">{isAr ? "المنصة" : "Company"}</p>
            <ul className="mt-3 space-y-2 text-[13px] leading-7">
              <li><a href={isAr ? "/ar/blog" : "/blog"} className="block py-1 hover:underline">{isAr ? "المدونة" : "Blog"}</a></li>
              <li><a href={isAr ? "/ar/compare" : "/compare"} className="block py-1 hover:underline">{isAr ? "المقارنات" : "Comparisons"}</a></li>
              <li><a href={isAr ? "/ar/about" : "/about"} className="block py-1 hover:underline">{isAr ? "من نحن" : "About"}</a></li>
              <li><a href={isAr ? "/ar/contact" : "/contact"} className="block py-1 hover:underline">{isAr ? "تواصل معنا" : "Contact"}</a></li>
              <li><a href={isAr ? "/ar/faq" : "/faq"} className="block py-1 hover:underline">{isAr ? "أسئلة شائعة" : "FAQ"}</a></li>
              <li><a href={isAr ? "/ar/privacy" : "/privacy"} className="block py-1 hover:underline">{isAr ? "الخصوصية" : "Privacy"}</a></li>
              <li><a href={isAr ? "/ar/terms" : "/terms"} className="block py-1 hover:underline">{isAr ? "الشروط" : "Terms"}</a></li>
            </ul>
          </div>
        </div>

        {/* Newsletter — restructure order 2026-09-15: moved from the
            homepage body into the SHARED footer; this is now the SINGLE
            newsletter surface, present on every public page (same form,
            same /api/tools/lead pipeline, tool_slug="newsletter"). */}
        <div className="mx-auto mt-8 max-w-md border-t border-[var(--edge)] pt-6">
          <NewsletterForm variant="footer" />
        </div>

        <div className="mt-6 border-t border-[var(--edge)] pt-3 text-center text-[10px] text-[var(--muted-foreground)]">
          {/* Phase 202 (owner order 2026-09-15): the footer tagline —
              EN "Built with care for the fitness community" ·
              AR "صُنع بعناية لمجتمع اللياقة" (VRD-V4 K-4 — «بحب» ← «بعناية»
              to mirror the EN "care"; the old geographically-
              scoped pair is retired). */}
          {isAr ? "صُنع بعناية لمجتمع اللياقة" : "Built with care for the fitness community"}
        </div>
      </div>
    </footer>
  );
}

/**
 * Social icon glyphs — Phase SEO-GEO-4.6. Inline SVGs (zero new deps):
 * Facebook / Instagram / X brand glyphs, a review star for Trustpilot,
 * and a carved-P roundel for Product Hunt (evenodd hole → works on any
 * footer marble theme, light or dark). Moved here with the footer so the
 * homepage and every shared-footer page render the identical row.
 */
function SocialIcon({ name }: { name: (typeof SOCIAL_PROFILES)[number]["name"] }) {
  const cls = "h-4 w-4";
  switch (name) {
    case "facebook":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "instagram":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.267 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
        </svg>
      );
    case "x":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
        </svg>
      );
    case "linkedin":
      // LinkedIn "in" roundel (SEO-GEO-6.2 — §12.21 owner-created profile).
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
        </svg>
      );
    case "trustpilot":
      // Review star — recognizable stand-in for Trustpilot's brand star.
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      );
    case "producthunt":
      // Circle with carved-out P (evenodd) — reads as the PH roundel on any
      // background without needing a second fill color.
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zM9.2 6.6h4.9c1.8 0 3.8 1.1 3.8 3.65 0 2.55-2 3.65-3.8 3.65h-2.35v3.5H9.2V6.6z"
          />
        </svg>
      );
  }
}
