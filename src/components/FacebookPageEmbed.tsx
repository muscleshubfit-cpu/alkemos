"use client";

/**
 * FacebookPageEmbed — Facebook's OFFICIAL Page Plugin, click-to-load.
 *
 * Owner follow-up on P2-11 (2026-09-28): the plain target="_blank" chips
 * for the founder's Facebook profiles proved unreliable in the owner's
 * real-world testing — in-app browsers kill the opened tab within a
 * second (target="_blank" needs multi-window support a WebView doesn't
 * give), and logged-out mobile web dies on Facebook's app-link bounce.
 * Live click tests in a standard Chromium confirmed the links themselves
 * are correct; the failure is environmental. The owner therefore ordered
 * a REAL interactive preview living INSIDE the page: no navigation, no
 * new tab, nothing for a WebView to kill.
 *
 * This renders Facebook's official Page Plugin iframe
 * (developers.facebook.com/docs/plugins/page-plugin):
 *   - the real page card: cover photo, page name, follower count
 *   - the real timeline tab: the page's actual posts
 *   - the REAL Follow/Like button — Facebook's own, not an imitation
 *
 * PRIVACY (the "safe" in the owner's order): the iframe is NOT loaded
 * until the visitor presses the button — zero requests to facebook.com
 * before consent-by-interaction. This matches the site's consent-gated
 * third-party posture (Phase 178 consent mode v2). The direct
 * "Open on Facebook" link stays always-visible as the robust fallback
 * (ad-blockers that kill the embed, or anyone who prefers the app).
 *
 * Facebook platform restriction: the plugin supports PAGES only.
 * Personal profiles cannot be embedded — they stay direct links.
 */

import { useState } from "react";
import { ExternalLink, Facebook } from "lucide-react";

const STRINGS = {
  en: {
    heading: "Live Facebook preview",
    note: "The official Facebook embed with the page's real Follow button. Nothing loads from Facebook until you press the button.",
    load: "Show live preview",
    open: "Open on Facebook",
    iframeTitle: "Facebook page preview — live posts and Follow button",
  },
  ar: {
    heading: "معاينة مباشرة من فيسبوك",
    note: "تضمين رسمي من فيسبوك يتضمن زر المتابعة الحقيقي للصفحة. لا يُحمَّل أي شيء من فيسبوك قبل أن تضغط الزر.",
    load: "عرض المعاينة المباشرة",
    open: "افتح على فيسبوك",
    iframeTitle: "معاينة صفحة فيسبوك — منشورات حية وزر متابعة",
  },
} as const;

export function FacebookPageEmbed({
  pageUrl,
  pageName,
  lang,
}: {
  /** The Facebook PAGE url (must also be declared in the author's sameAs). */
  pageUrl: string;
  /** Display name shown on the collapsed card before the embed loads. */
  pageName: string;
  lang: "en" | "ar";
}) {
  const [show, setShow] = useState(false);
  const t = STRINGS[lang];

  // Official Page Plugin parameters, exactly as the configurator emits
  // them: timeline tab, full-size header + cover, facepile, and
  // adapt_container_width so it shrinks on narrow screens.
  const pluginSrc =
    "https://www.facebook.com/plugins/page.php" +
    `?href=${encodeURIComponent(pageUrl)}` +
    "&tabs=timeline&width=500&height=500" +
    "&small_header=false&adapt_container_width=true" +
    "&hide_cover=false&show_facepile=true";

  return (
    <div className="mt-6">
      <h3 className="sr-only">{t.heading}</h3>
      {!show ? (
        <div className="marble-card flex flex-col items-center gap-3 p-6 text-center">
          <div className="flex items-center gap-2">
            <Facebook className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="text-base font-semibold">{pageName}</span>
          </div>
          <p className="max-w-md text-sm font-normal leading-relaxed text-[var(--muted-foreground)]">
            {t.note}
          </p>
          <button
            type="button"
            onClick={() => setShow(true)}
            className="btn-chrome mt-1 px-6 text-sm"
          >
            {t.load}
          </button>
        </div>
      ) : (
        <div className="mx-auto max-w-[500px] overflow-hidden rounded-xl border border-[var(--edge)] bg-white">
          {/* Facebook's own plugin document. width=500 is the plugin max;
              adapt_container_width=true shrinks it on narrow viewports. */}
          <iframe
            src={pluginSrc}
            title={t.iframeTitle}
            width={500}
            height={500}
            style={{ border: "none", overflow: "hidden", display: "block", width: "100%" }}
            scrolling="no"
            frameBorder={0}
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            loading="lazy"
          />
        </div>
      )}
      <div className="mt-3 text-center">
        <a
          href={pageUrl}
          target="_blank"
          rel="noopener noreferrer me"
          className="btn-outline inline-flex items-center gap-2 px-4 py-2 text-sm"
        >
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
          {t.open}
        </a>
      </div>
    </div>
  );
}
