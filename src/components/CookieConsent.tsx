"use client";

import { useState, useEffect, useRef } from "react";

/**
 * CookieConsent — GDPR/ePrivacy consent banner.
 *
 * PHASE 144 (2026-09-08, owner directive «شريط الكوكيز يجب أن يحتوي على
 * المعايير العالمية ورابط سياسة الخصوصية بداخله + حل مشكلة الأداء»):
 * the banner gains full GDPR/ePrivacy compliance content — cookie
 * CATEGORIES (necessary / preferences / analytics / advertising) in a
 * zero-JS <details>, an in-banner privacy-policy LINK, equal-prominence
 * Accept/Reject (reject = strictly-necessary only via gtag consent
 * mode), an honest 365-day consent record, and WITHDRAWAL as easy as
 * giving: the privacy page's «إعدادات الكوكيز / Cookie settings»
 * button clears the record and dispatches `alkemos:consent-reopen`,
 * which this component listens for and re-opens the banner.
 *
 * PERFORMANCE REWORK (same phase): the bar drops `.marble-card` — its
 * unlayered `position: relative` crushed the `fixed` utility (Phase
 * 136b cascade-trap, see the old `fixed!` hack) and its texture made
 * the bar an image-paint LCP candidate (Phase 137b) — for a flat solid
 * surface defined entirely in globals.css `.mhe-cookie-bar`, with
 * `contain: layout style` bounding its layout work and a compact
 * line-clamped text block. globals.css also reserves body padding
 * PRE-PAINT (`html:not([data-mhe-consent-ok]) body`) so the bar can
 * never cover CTAs at a page's bottom (the 2026-09-07 /auth finding:
 * the login button sat under the banner on short viewports).
 *
 * PHASE 137 (kept, 2026-09-07): SSR-FIRST-PAINT — the bar is
 * server-rendered visible and paints WITH FCP (it was THE /blog LCP
 * element at 7.9s when it mounted post-hydration). The pre-paint
 * inline script in layout.tsx stamps html[data-mhe-consent-ok] for
 * returning users and globals.css hides the bar instantly (no flash,
 * no late LCP, no CLS). The useEffect reconciles state post-hydration.
 *
 * NO-COVER LAW (2026-08-27, kept): while visible the banner publishes
 * its height as --mhe-cookie-bar-h on :root — fixed bottom-corner UI
 * (the EVO floating chat icon) lifts itself with
 * bottom: calc(<offset> + var(--mhe-cookie-bar-h, 0px)).
 *
 * Consent storage: localStorage `mhe_cookie_consent`
 * {granted: boolean, timestamp: number}, 365-day validity (ePrivacy
 * refresh rather than hoard). gtag consent mode is applied for stored
 * consent on load and on every choice — AdSense/GA only personalize
 * when consent is granted.
 */

const CONSENT_KEY = "mhe_cookie_consent";
const CONSENT_DURATION = 365 * 24 * 60 * 60 * 1000; // 365 days
/** Fired by the privacy page's "Cookie settings" button (withdraw). */
export const CONSENT_REOPEN_EVENT = "alkemos:consent-reopen";

function updateConsent(granted: boolean) {
  try {
    // @ts-ignore — gtag is loaded by AdSense/GA
    window.gtag = window.gtag || [];
    // @ts-ignore
    window.gtag("consent", "update", {
      ad_storage: granted ? "granted" : "denied",
      ad_user_data: granted ? "granted" : "denied",
      ad_personalization: granted ? "granted" : "denied",
      analytics_storage: granted ? "granted" : "denied",
    });
  } catch {}
}

export function CookieConsent({
  initialLang = "en",
}: {
  /** SSR-known locale (root layout resolves it) — keeps server and client
   * markup identical so the banner hydrates without a language flash. */
  initialLang?: "ar" | "en";
}) {
  // Phase 137: SSR-first-paint — the bar is server-rendered VISIBLE. The
  // layout's pre-paint script already hid it for returning users.
  const [show, setShow] = useState(true);
  const [lang, setLang] = useState<"ar" | "en">(initialLang);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect language from <html lang="..."> (safety net — matches the
    // SSR initialLang in practice, so no visible change on hydration).
    const htmlLang = document.documentElement.lang;
    setLang(htmlLang === "ar" ? "ar" : "en");

    // GDPR withdrawal-as-easy-as-giving: the privacy page's "Cookie
    // settings" button clears the stored record (its own handler) and
    // dispatches this event — re-open the banner so the user can change
    // the choice with the same one-click ease as the original choice.
    const onReopen = () => {
      document.documentElement.removeAttribute("data-mhe-consent-ok");
      setShow(true);
    };
    window.addEventListener(CONSENT_REOPEN_EVENT, onReopen);
    return () => window.removeEventListener(CONSENT_REOPEN_EVENT, onReopen);
  }, []);

  // Check if user already gave consent (post-hydration reconciliation —
  // the pre-paint script + CSS already hid the bar for this case).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const age = Date.now() - data.timestamp;
        if (age < CONSENT_DURATION) {
          // Consent still valid — update gtag and unmount the bar (it was
          // already display:none'd pre-paint; this frees the DOM node and
          // publishes --mhe-cookie-bar-h: 0).
          updateConsent(data.granted);
          setShow(false);
          return;
        }
      }
    } catch {}
    // No valid consent — banner stays visible (already painted with FCP).
  }, []);

  // NO-COVER LAW: publish the bar height for fixed bottom-corner UI.
  useEffect(() => {
    const root = document.documentElement;
    if (!show) {
      root.style.setProperty("--mhe-cookie-bar-h", "0px");
      root.removeAttribute("data-mhe-cookie-banner");
      return;
    }
    const el = barRef.current;
    if (!el) return;
    const publish = () =>
      root.style.setProperty("--mhe-cookie-bar-h", `${el.offsetHeight}px`);
    publish();
    root.setAttribute("data-mhe-cookie-banner", "open");
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.setProperty("--mhe-cookie-bar-h", "0px");
      root.removeAttribute("data-mhe-cookie-banner");
    };
  }, [show]);

  /** Store the choice, sync gtag, and stamp the same pre-paint attribute
   * the layout script uses — globals.css then drops the reserved body
   * padding and hides the bar in the same frame (no second flash). */
  const choose = (granted: boolean) => {
    const data = { granted, timestamp: Date.now() };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
    } catch {}
    updateConsent(granted);
    document.documentElement.setAttribute("data-mhe-consent-ok", "1");
    setShow(false);
  };

  if (!show) return null;

  const isAr = lang === "ar";

  return (
    <div
      ref={barRef}
      role="dialog"
      aria-live="polite"
      aria-label={isAr ? "الموافقة على ملفات تعريف الارتباط" : "Cookie consent"}
      /* Flat solid surface defined in globals.css (`.mhe-cookie-bar`) —
         deliberately NOT `.marble-card`: unlayered CSS there beats every
         @layer (Phase 136b cascade trap: its `position: relative` crushed
         `fixed`, and the texture was an image-paint LCP candidate —
         Phase 137b). globals.css owns position/z-index/padding/contain. */
      className="mhe-cookie-bar"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="min-w-0">
          <p className="text-xs font-normal leading-relaxed text-[var(--muted-2)] md:text-sm">
            {isAr ? (
              <>
                نستخدم ملفات تعريف الارتباط لتشغيل الموقع، وملفات تحليلات
                وإعلانات بموافقتك فقط.{" "}
                <a
                  href="/privacy"
                  className="whitespace-nowrap font-medium text-[var(--text)] underline underline-offset-4 hover:opacity-80"
                >
                  سياسة الخصوصية
                </a>
              </>
            ) : (
              <>
                We use cookies to run the site, plus analytics and
                advertising cookies only with your consent.{" "}
                <a
                  href="/privacy"
                  className="whitespace-nowrap font-medium text-[var(--text)] underline underline-offset-4 hover:opacity-80"
                >
                  Privacy&nbsp;Policy
                </a>
              </>
            )}
          </p>
          {/* Zero-JS collapsible categories (native <details> — SSR'd,
              no hydration cost). ePrivacy: informed consent needs the
              PURPOSE of each non-necessary category. */}
          <details className="mt-1 text-[11px] leading-relaxed text-[var(--muted-2)] md:text-xs">
            <summary className="cursor-pointer select-none font-medium hover:opacity-80">
              {isAr ? "تفاصيل الفئات (٤)" : "Category details (4)"}
            </summary>
            <ul className="mt-1 space-y-0.5 ps-4">
              {(isAr
                ? [
                    "الضرورية — دائمًا مفعلة: الجلسة والمصادقة والأمان (لا تُعطَّل)",
                    "التفضيلات — لغتك ومظهرك المفضل",
                    "التحليلات — قياس الاستخدام والأداء (Google Analytics)",
                    "الإعلانات — إعلانات مخصصة (Google AdSense)",
                  ]
                : [
                    "Necessary — always on: session, auth, security (cannot be disabled)",
                    "Preferences — your language and theme choice",
                    "Analytics — usage & performance measurement (Google Analytics)",
                    "Advertising — personalized ads (Google AdSense)",
                  ]
              ).map((item) => (
                <li key={item} className="list-disc">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-1">
              {isAr
                ? "يُحفظ اختيارك 365 يومًا ويمكنك تغييره في أي وقت من صفحة سياسة الخصوصية."
                : "Your choice is stored for 365 days; you can change it anytime from the Privacy Policy page."}
            </p>
          </details>
        </div>
        {/* Equal-prominence choices: same size, same row — rejecting is
            exactly as easy as accepting (GDPR Art. 7(3)). */}
        <div className="flex shrink-0 items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => choose(false)}
            className="btn-outline px-5 py-2 text-sm"
          >
            {isAr ? "رفض" : "Reject"}
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className="btn-chrome px-5 py-2 text-sm"
          >
            {isAr ? "قبول" : "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}
