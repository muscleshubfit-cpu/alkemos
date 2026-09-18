"use client";

import { useState, useEffect } from "react";
import { Share2, Copy, Check, Facebook, Twitter, Linkedin, Send } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { canonicalShareUrl } from "@/lib/share-url";

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
 * WEB SHARE LAW (same phase): the native-share button renders ONLY when
 * the Web Share API actually exists (client-only knowledge, resolved
 * after mount so SSR and the first client render stay identical — no
 * hydration mismatch). Where it is absent (desktop browsers without the
 * API), the always-visible Copy-link button is the explicit fallback.
 */
export function ShareButtons({ title, text, path, compact = false }: Props) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [copied, setCopied] = useState(false);

  // SHARE URL LAW: deterministic canonical URL — same value on the
  // server and every client render (see the docblock).
  const shareUrl = canonicalShareUrl(path, lang);
  const shareText = text ? `${title}\n\n${text}` : title;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);
  const encodedTitle = encodeURIComponent(title);

  // Web Share API support is client-only knowledge — resolved strictly
  // AFTER mount: server and first client render both omit the button,
  // then supporting devices (mobile) gain it (no hydration mismatch).
  const [nativeShareSupported, setNativeShareSupported] = useState(false);
  useEffect(() => {
    setNativeShareSupported(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: Send,
      color: "#34c759",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "#1877f2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    },
    {
      name: "X",
      icon: Twitter,
      color: "#000000",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "#0a66c2",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "Telegram",
      icon: Send,
      color: "#0088cc",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Native share sheet (mobile) — the button only renders when this API
  // exists (see WEB SHARE LAW in the docblock).
  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled — fall through to nothing
      }
    }
  };

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
        const Icon = link.icon;
        return (
          <a
            key={link.name}
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
        onClick={copyLink}
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
