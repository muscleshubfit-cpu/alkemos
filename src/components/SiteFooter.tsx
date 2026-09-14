"use client";

import { useI18n } from "@/lib/i18n";
import { ThemeImg } from "@/components/ThemeImg";
import { SOCIAL_PROFILES } from "@/lib/social";

/**
 * SiteFooter — the SHARED public footer (Access-Point Fix, 2026-09-14).
 *
 * HISTORY: this footer lived INLINE inside LandingView (the homepage), so
 * the full marble link grid (Paid Services / Affiliate / Tools / Resources /
 * Legal) existed ONLY on "/" and "/ar" — every other public page carried a
 * bare «© Alkemos» line. The FULL-SITE ACCESS-POINT AUDIT (2026-09-14) found
 * the consequence: legal pages, /compare, hub families (muscles / equipment /
 * collections) had no persistent crawlable entry point outside the homepage.
 *
 * This component extracts the EXACT same markup (Phase 131 menu-grid +
 * Phase 132 theme-aware marble slab) so every public route renders the
 * identical footer. Locale-aware hrefs throughout — an AR visitor never
 * lands on an EN URL when an Arabic mirror exists.
 *
 * Placement law: render AFTER the page's <main> inside the
 * min-h-screen flex-col wrapper (mt-auto keeps it pinned to the bottom).
 *
 * OWNER DIRECTIVES honored (2026-09-14):
 *  - NO /evo or /coaches/[slug] links added or removed here beyond what the
 *    homepage footer already had (EVO stays exactly as it was; coaches pages
 *    stay self-promoted by their owners).
 *  - NO private surfaces linked: the old «Referral Dashboard» entry pointed
 *    at the authenticated, noindex /referral app page — removed per the
 *    «no private routes in public navigation» rule.
 */

export function SiteFooter() {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  return (
    <footer className="footer-marble relative mt-auto px-4 pb-10 pt-12 text-[var(--muted-foreground)]">
      {/* mt-auto: inside the flex-col min-h-screen page shells (static
          pages, blog, contact, compare) the footer sticks to the bottom
          when content is short; inside plain block containers (homepage,
          tools) auto margins are zero — zero visual difference. */}
      {/* Meander divider on the top edge (mission §14) */}
      <div className="footer-meander-top absolute inset-x-0 top-0" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3 lg:grid-cols-6 lg:gap-x-8">
          {/* Brand — theme-aware lockup (Phase 132): the black footer
              lockup on light marble / the white one on black marble,
              rendered as a ThemeImg pair so CSS swaps it with zero
              hydration flicker. Spans the full row below lg so the
              lists pair up cleanly. */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <ThemeImg
              light="/images/brand/logo-footer-black.png"
              dark="/images/brand/logo-footer-white.png"
              alt="Alkemos"
              width={140}
              height={110}
              className="h-10 w-auto object-contain"
            />
            <p className="mt-3 text-xs font-normal">{isAr ? "اصنع قوّتك الأسطورية." : "Forge Your Legendary Strength."}</p>
            <p className="mt-3 text-[10px] font-normal text-[var(--muted-foreground)]">{isAr ? "© 2026 جميع الحقوق محفوظة" : "© 2026 All rights reserved"}</p>
            {/* Phase SEO-GEO-4.6 (2026-09-09): owned-profile icon row — the
                human counterpart of Organization.sameAs (src/lib/social.ts).
                Plain links with NO nofollow: these are OWNED profiles and the
                crawlable link IS the entity-association signal. */}
            <div className="mt-4 flex items-center gap-4">
              {SOCIAL_PROFILES.map((p) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={isAr ? p.labelAr : p.labelEn}
                  title={isAr ? p.labelAr : p.labelEn}
                  className="text-[var(--muted-foreground)] transition-colors hover:text-[var(--text)]"
                >
                  <SocialIcon name={p.name} />
                </a>
              ))}
            </div>
          </div>

          {/* List 1: Paid Services */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text)]">{isAr ? "الخدمات المدفوعة" : "Paid Services"}</p>
            <ul className="mt-3 space-y-2 text-xs">
              <li><a href={isAr ? "/ar/coaching" : "/coaching"} className="hover:underline">{isAr ? "الكوتشينج" : "Coaching"}</a></li>
              <li><a href={isAr ? "/ar/memberships" : "/memberships"} className="hover:underline">{isAr ? "العضويات" : "Memberships"}</a></li>
              <li><a href={isAr ? "/ar/evo" : "/evo"} className="hover:underline">EVO AI Coach</a></li>
            </ul>
          </div>

          {/* List 2: Affiliate & Referral — «Referral Dashboard» removed
              (access-point fix 2026-09-14): /referral is an authenticated,
              noindex app page; private surfaces never live in the public
              footer. The public /affiliate program stays. */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text)]">{isAr ? "الأفلييت" : "Affiliate"}</p>
            <ul className="mt-3 space-y-2 text-xs">
              <li><a href="/affiliate" className="hover:underline">{isAr ? "برنامج الأفلييت" : "Affiliate Program"}</a></li>
            </ul>
          </div>

          {/* List 3: Tools */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text)]">{isAr ? "الأدوات" : "Tools"}</p>
            <ul className="mt-3 space-y-2 text-xs">
              {/* §12.27: locale-aware mirrors + the diet-plan matrix entry
                  (owner directive «لا يوجد رابط واضح للمستخدم ولا ذكر فى
                  اى قسم» — the matrix is now reachable from the footer in
                  both languages). */}
              <li><a href={isAr ? "/ar/tools/bmi-calculator" : "/tools/bmi-calculator"} className="hover:underline">{isAr ? "حاسبة BMI" : "BMI Calculator"}</a></li>
              <li><a href={isAr ? "/ar/tools/body-fat-calculator" : "/tools/body-fat-calculator"} className="hover:underline">{isAr ? "حاسبة الدهون" : "Body Fat Calculator"}</a></li>
              <li><a href={isAr ? "/ar/tools/calorie-calculator" : "/tools/calorie-calculator"} className="hover:underline">{isAr ? "حاسبة السعرات" : "Calorie Calculator"}</a></li>
              <li><a href={isAr ? "/ar/tools/macro-calculator" : "/tools/macro-calculator"} className="hover:underline">{isAr ? "حاسبة الماكروز" : "Macro Calculator"}</a></li>
              <li><a href={isAr ? "/ar/tools/water-tracker" : "/tools/water-tracker"} className="hover:underline">{isAr ? "متتبع الماء" : "Water Tracker"}</a></li>
              <li><a href={isAr ? "/ar/meal-planner" : "/meal-planner"} className="hover:underline">{isAr ? "مخطط الوجبات" : "Meal Planner"}</a></li>
              <li><a href={isAr ? "/ar/ai-meal-planner" : "/ai-meal-planner"} className="hover:underline">{isAr ? "مخطط الوجبات بالذكاء الاصطناعي" : "AI Meal Planner"}</a></li>
              <li><a href={isAr ? "/ar/ai-workout-planner" : "/ai-workout-planner"} className="hover:underline">{isAr ? "مخطط التمارين بالذكاء الاصطناعي" : "AI Workout Planner"}</a></li>
            </ul>
          </div>

          {/* List 4: Resources — access-point fix (2026-09-14): the hub
              families (muscles / equipment / collections) and the /compare
              vertical join the list with locale-aware mirrors, so every
              hub receives footer link equity from EVERY public page (they
              previously had near-zero UI entry points). */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text)]">{isAr ? "المحتوى" : "Resources"}</p>
            <ul className="mt-3 space-y-2 text-xs">
              <li><a href={isAr ? "/ar/exercises" : "/exercises"} className="hover:underline">{isAr ? "مكتبة التمارين" : "Exercises"}</a></li>
              <li><a href={isAr ? "/ar/muscles/chest" : "/muscles/chest"} className="hover:underline">{isAr ? "حسب المجموعة العضلية" : "By Muscle Group"}</a></li>
              <li><a href={isAr ? "/ar/equipment/bodyweight" : "/equipment/bodyweight"} className="hover:underline">{isAr ? "حسب المعدات" : "By Equipment"}</a></li>
              <li><a href="/programs" className="hover:underline">{isAr ? "برامج التدريب" : "Programs"}</a></li>
              <li><a href={isAr ? "/ar/foods" : "/foods"} className="hover:underline">{isAr ? "مكتبة الأطعمة" : "Foods"}</a></li>
              <li><a href={isAr ? "/ar/collections/high-protein-foods" : "/collections/high-protein-foods"} className="hover:underline">{isAr ? "مجموعات الأطعمة" : "Food Collections"}</a></li>
              <li><a href={isAr ? "/ar/diet-plan" : "/diet-plan"} className="hover:underline">{isAr ? "مكتبة الخطط الغذائية الجاهزة" : "Diet Plans"}</a></li>
              <li><a href={isAr ? "/ar/compare" : "/compare"} className="hover:underline">{isAr ? "المقارنات" : "Comparisons"}</a></li>
              <li><a href={isAr ? "/ar/blog" : "/blog"} className="hover:underline">{isAr ? "المدونة" : "Blog"}</a></li>
            </ul>
          </div>

          {/* List 5: Legal & Basic — moved from the old single horizontal
              bottom row into the list grid (Phase 131; per Owner directive
              2026-08-25 these pages live in the footer only, not in the
              header). Access-point fix (2026-09-14): /contact /privacy
              /terms now resolve to their NEW Arabic mirrors (/ar/contact,
              /ar/privacy, /ar/terms) instead of dragging AR visitors to
              the EN URLs. */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text)]">{isAr ? "قانوني وأساسي" : "Legal & Basic"}</p>
            <ul className="mt-3 space-y-2 text-xs">
              <li><a href={isAr ? "/ar/about" : "/about"} className="hover:underline">{isAr ? "من نحن" : "About"}</a></li>
              <li><a href={isAr ? "/ar/contact" : "/contact"} className="hover:underline">{isAr ? "تواصل معنا" : "Contact"}</a></li>
              <li><a href={isAr ? "/ar/faq" : "/faq"} className="hover:underline">{isAr ? "أسئلة شائعة" : "FAQ"}</a></li>
              <li><a href={isAr ? "/ar/privacy" : "/privacy"} className="hover:underline">{isAr ? "الخصوصية" : "Privacy"}</a></li>
              <li><a href={isAr ? "/ar/terms" : "/terms"} className="hover:underline">{isAr ? "الشروط" : "Terms"}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--edge)] pt-4 text-center text-[10px] text-[var(--muted-foreground)]">
          {isAr ? "صُنع بحب لمجتمع اللياقة العربي" : "Built with care for the Arab fitness community"}
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
          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
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
