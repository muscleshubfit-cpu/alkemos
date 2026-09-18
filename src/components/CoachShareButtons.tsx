"use client";

import { Facebook, Twitter, Send, Link2, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { canonicalShareUrl } from "@/lib/share-url";
import { buildShareLinks, type SharePlatform } from "@/lib/share-links";
import { useShareActions } from "@/components/share/useShareActions";

type Props = {
  /**
   * REQUIRED canonical path of this page in its EN form ("/for-coaches").
   * The absolute canonical share URL is built from it via
   * canonicalShareUrl(path, lang) — locale-aware (/ar prefix on the AR
   * mirror), query/hash-free, deterministic from the FIRST server render.
   * (Phase 231, owner order B1/B2: every public share surface passes the
   * canonical URL from the Phase-230 single source; window.location /
   * mountedUrl are retired — they could never be a primary URL source
   * and leaked query/hash into shares.)
   */
  path: string;
  /** Pre-filled share message (localized by the caller). */
  message: string;
  /** Button labels + copy-label, localized by the caller. */
  labels: {
    facebook: string;
    x: string;
    telegram: string;
    copy: string;
    copied: string;
  };
};

/** OWNER DECREE (2026-08-30): «معادا زر واتساب لن نضيفها» — the WhatsApp
 *  share target is REMOVED from for-coaches and stays removed. Remaining
 *  targets: Facebook, X, Telegram + copy-link. The platform set is a
 *  CONFIG over the shared engine (src/lib/share-links.ts) — guarded by
 *  share-coverage.test.ts (whatsapp may never appear here). */
const PLATFORMS = ["facebook", "x", "telegram"] as const satisfies readonly SharePlatform[];

/** Platform → lucide icon (no WhatsApp glyph exists in lucide anyway —
 *  and no WhatsApp target either, by the decree above). */
const PLATFORM_ICONS = {
  facebook: Facebook,
  x: Twitter,
  telegram: Send,
} as const;

/**
 * FOR-COACHES SHARE BUTTONS — icon upgrade per owner directive
 * («ايقونات المشاركه ضيفها عادى انا اقصد بدون ايقونات فى الاقسام
 * فى الصفحة نفسها»): icons are FINE on the share buttons; the page's
 * content sections stay text-only.
 *
 * PHASE 231 UNIFICATION: hrefs come from buildShareLinks() (the shared
 * engine) and copy behavior from useShareActions (the same clipboard +
 * execCommand fallback the other surfaces always had); the URL is the
 * canonical /for-coaches URL from the Phase-230 single source.
 *
 * History (H1 fix, DEEP-UX-AUDIT-2026-09-18): window.location.href used
 * to be read DURING render — the server fell back to the hard-coded EN
 * /for-coaches URL while the client computed the real one, failing
 * hydration on /ar/for-coaches and leaving the EN URL in the live DOM.
 * Phase 227 moved it post-mount; Phase 231 removes it entirely — the
 * canonical URL is deterministic and locale-aware from first render.
 *
 * No native Web Share button on this surface (the labeled chrome design
 * never had one — unchanged).
 */
export function CoachShareButtons({ path, message, labels }: Props) {
  const { lang } = useI18n();

  // SHARE URL LAW: deterministic canonical URL from the single source —
  // the EN /for-coaches page shares /for-coaches, the AR mirror shares
  // /ar/for-coaches, no query/hash, complete from the first render.
  const shareUrl = canonicalShareUrl(path, lang);

  const { copied, copy } = useShareActions({ url: shareUrl, title: message, text: message });

  const links = buildShareLinks({
    url: shareUrl,
    shareText: message,
    fbQuote: message,
    platforms: PLATFORMS,
  });

  /** Platform → caller-localized label (the caller owns the wording). */
  const labelFor: Record<(typeof PLATFORMS)[number], string> = {
    facebook: labels.facebook,
    x: labels.x,
    telegram: labels.telegram,
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {links.map((l) => {
        const Icon = PLATFORM_ICONS[l.platform];
        return (
          <a
            key={l.platform}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-chrome inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {labelFor[l.platform]}
          </a>
        );
      })}
      <button
        type="button"
        onClick={copy}
        className="btn-outline inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold"
      >
        {copied ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Link2 className="h-4 w-4" aria-hidden="true" />
        )}
        {copied ? labels.copied : labels.copy}
      </button>
    </div>
  );
}
