/**
 * SHARE LINKS ENGINE — the single implementation of every share-intent
 * URL on the platform (Phase 231, owner order 2026-09-18 «نفّذ الآن جميع
 * إصلاحات Social Sharing المتبقية من تقرير Deep Audit، كمرحلة واحدة بعد
 * إغلاق Phase 230»).
 *
 * Before this module the three public share components each hand-built
 * their platform hrefs (three copies of the same payload formats, with
 * the exact drift you would expect: FB quote = title on ShareButtons but
 * the full share text on SocialShare/CoachShareButtons, different
 * platform sets, different copy fallbacks). They are now thin wrappers
 * over THIS file + useShareActions — the platforms each surface offers
 * are a CONFIG (platforms array), not a copied implementation.
 *
 * PAYLOAD LAW (each format is verbatim the historical behavior of the
 * surfaces that offer the platform — zero message/prefill change):
 *   whatsapp : https://wa.me/?text=<shareText>%20<url>
 *   facebook : https://www.facebook.com/sharer/sharer.php?u=<url>&quote=<fbQuote>
 *   x        : https://twitter.com/intent/tweet?text=<shareText>&url=<url>
 *   linkedin : https://www.linkedin.com/sharing/share-offsite/?url=<url>
 *   telegram : https://t.me/share/url?url=<url>&text=<shareText>
 *
 *   <url>      = the ABSOLUTE canonical share URL — every surface builds
 *                it from canonicalShareUrl() (src/lib/share-url.ts, the
 *                Phase-230 single source). Never window.location; query/
 *                hash can never leak.
 *   <shareText>/<fbQuote> are composed BY THE SURFACE (its texts are
 *   unchanged — ShareButtons quotes the title on Facebook while blog and
 *   for-coaches quote their full message, exactly as before).
 *
 * PLATFORM DECISIONS per surface (config, guarded by
 * share-coverage.test.ts — NOT copy):
 *   ShareButtons      : whatsapp, facebook, x, linkedin, telegram
 *   SocialShare (blog): facebook, linkedin, x, whatsapp (no Telegram —
 *                       unchanged)
 *   CoachShareButtons : facebook, x, telegram — WhatsApp REMOVED by the
 *                       owner decree «معادا زر واتساب لن نضيفها»,
 *                       preserved verbatim.
 */

import type { ShareLang } from "@/lib/share-url";
export type { ShareLang };

export type SharePlatform =
  | "whatsapp"
  | "facebook"
  | "x"
  | "linkedin"
  | "telegram";

/** Display metadata per platform (name + brand color for the circle UI). */
export const SHARE_PLATFORM_META: Record<
  SharePlatform,
  { name: string; color: string }
> = {
  whatsapp: { name: "WhatsApp", color: "#34c759" },
  facebook: { name: "Facebook", color: "#1877f2" },
  x: { name: "X", color: "#000000" },
  linkedin: { name: "LinkedIn", color: "#0a66c2" },
  telegram: { name: "Telegram", color: "#0088cc" },
};

export interface BuildShareLinksInput {
  /** Absolute canonical share URL (from canonicalShareUrl — never empty). */
  url: string;
  /** The full pre-filled message the surface wants encoded. */
  shareText: string;
  /** The Facebook quote prefill (ShareButtons: title; blog/coach: the full message). */
  fbQuote: string;
  /** The platforms this surface offers, IN ITS DISPLAY ORDER. */
  platforms: readonly SharePlatform[];
}

export interface ShareLink {
  platform: SharePlatform;
  name: string;
  color: string;
  href: string;
}

/**
 * Build the ordered share links for a surface — the ONLY place on the
 * platform where a share-intent URL is constructed.
 */
export function buildShareLinks({
  url,
  shareText,
  fbQuote,
  platforms,
}: BuildShareLinksInput): ShareLink[] {
  const enc = encodeURIComponent;
  const encodedUrl = enc(url);
  const encodedText = enc(shareText);
  const encodedQuote = enc(fbQuote);

  const hrefs: Record<SharePlatform, string> = {
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedQuote}`,
    x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
  };

  return platforms.map((platform) => ({
    platform,
    name: SHARE_PLATFORM_META[platform].name,
    color: SHARE_PLATFORM_META[platform].color,
    href: hrefs[platform],
  }));
}
