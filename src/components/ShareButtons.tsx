"use client";

import { Facebook, Twitter, Linkedin, Send, Share2, Copy, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { canonicalShareUrl } from "@/lib/share-url";
import { buildShareLinks, type SharePlatform } from "@/lib/share-links";
import { useShareActions } from "@/components/share/useShareActions";

type Props = {
  /** The title to pre-fill in the shared message */
  title: string;
  /** Optional text/description to include in the shared message */
  text?: string;
  /**
   * REQUIRED canonical path of the page in its EN form ("/evo",
   * "/tools/bmi-calculator", "/foods/chicken-breast", ...). The absolute
   * canonical share URL is built from it — locale-aware (/ar prefix for
   * the AR mirrors), query/hash-free, and complete from the FIRST server
   * render. Required (not optional) so the TypeScript gate itself forbids
   * any future usage that would fall back to runtime URL sniffing.
   */
  path: string;
  /** Compact mode (just icon, no label) */
  compact?: boolean;
};

/** Platforms this surface offers, in display order (the config that used
 *  to be a copied implementation — see src/lib/share-links.ts). */
const PLATFORMS: readonly SharePlatform[] = [
  "whatsapp",
  "facebook",
  "x",
  "linkedin",
  "telegram",
];

/** Platform → lucide icon for this surface's circle UI (Send doubles for
 *  WhatsApp here — the historical glyph choice of this component). */
const PLATFORM_ICONS = {
  whatsapp: Send,
  facebook: Facebook,
  x: Twitter,
  linkedin: Linkedin,
  telegram: Send,
} as const;

/**
 * ShareButtons — social share buttons for any page.
 *
 * Renders buttons for: WhatsApp, Facebook, X (Twitter), LinkedIn, Telegram,
 * and Copy Link. Uses the native share intents (no JS SDK needed).
 *
 * SHARE URL LAW (P0, DEEP-AUDIT-SHARE-2026-09-18 — owner order «نفّذ الآن
 * P0 بالكامل من تقرير Deep Audit لنظام Social Sharing»): the share URL is
 * the CANONICAL absolute URL built from the required `path` prop via
 * canonicalShareUrl() (src/lib/share-url.ts) — deterministic from the
 * first server render. History of the two bugs this replaces:
 *
 * 1. ORIGINAL (pre-227): window.location.href was read DURING render —
 *    the server rendered hrefs with an EMPTY url while the client
 *    computed the full one, failing hydration (#418 attribute mismatch)
 *    AND (because React does not patch up mismatched attributes) leaving
 *    the EMPTY server hrefs in the live DOM — share buttons shared text
 *    with no link at all (WhatsApp sent text without the URL; the
 *    Facebook/LinkedIn popups opened and instantly failed — the reported
 *    "flash then disappears").
 * 2. INTERIM (227): mountedUrl via useEffect — hydration-safe, but the
 *    URL only existed AFTER mount (a pre-hydration click still hit an
 *    empty href) and window.location.href leaked query/hash params
 *    (utm_*, cb) into shared URLs.
 *
 * NOW: `path` in, canonical URL out — no window.location anywhere, no
 * empty href structurally possible (SSR or client), no tracker leakage.
 *
 * PHASE 231 UNIFICATION (owner order «نفّذ الآن جميع إصلاحات Social
 * Sharing المتبقية…»): the platform hrefs are built by the shared engine
 * buildShareLinks() (src/lib/share-links.ts) and copy/Web-Share behavior
 * comes from the shared useShareActions hook — this component keeps only
 * its presentation (circle buttons, brand colors, compact mode). Props,
 * platforms, message payloads, labels and UI are unchanged.
 */
export function ShareButtons({ title, text, path, compact = false }: Props) {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  // SHARE URL LAW: deterministic canonical URL — same value on the
  // server and every client render (see the docblock).
  const shareUrl = canonicalShareUrl(path, lang);
  const shareText = text ? `${title}\n\n${text}` : title;

  const { copied, copy, nativeShareSupported, nativeShare } = useShareActions({
    url: shareUrl,
    title,
    text: shareText,
  });

  const shareLinks = buildShareLinks({
    url: shareUrl,
    shareText,
    // Facebook quote prefill stays the TITLE on this surface (the
    // historical payload — blog/for-coaches quote the full message).
    fbQuote: title,
    platforms: PLATFORMS,
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!compact && (
        <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--muted-foreground)]">
          <Share2 className="h-4 w-4" />
          {isAr ? "شارك:" : "Share:"}
        </span>
      )}

      {/* Native share button (only when the Web Share API exists —
          otherwise the Copy-link button below is the fallback) */}
      {nativeShareSupported && (
        <button
          onClick={nativeShare}
          className="grid h-9 w-9 place-items-center rounded-full border border-[var(--edge)] bg-[var(--tint)] text-[var(--text)] transition-opacity hover:opacity-75"
          title={isAr ? "مشاركة" : "Share"}
          aria-label={isAr ? "مشاركة" : "Share"}
        >
          <Share2 className="h-4 w-4" />
        </button>
      )}

      {/* Social share buttons */}
      {shareLinks.map((link) => {
        const Icon = PLATFORM_ICONS[link.platform];
        return (
          <a
            key={link.platform}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--edge)] bg-[var(--tint)] text-[var(--text)] transition-opacity hover:opacity-75"
            style={{ color: link.color }}
            title={link.name}
            aria-label={isAr ? `مشاركة عبر ${link.name}` : `Share on ${link.name}`}
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}

      {/* Copy link button — the always-available fallback */}
      <button
        onClick={copy}
        className="grid h-9 w-9 place-items-center rounded-full border border-[var(--edge)] bg-[var(--tint)] text-[var(--text)] transition-opacity hover:opacity-75"
        title={isAr ? "نسخ الرابط" : "Copy link"}
        aria-label={isAr ? "نسخ الرابط" : "Copy link"}
      >
        {copied ? (
          <Check className="h-4 w-4 text-[#34c759]" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
