"use client";

import { useState, useEffect } from "react";
import { Share2, Copy, Check, Facebook, Twitter, Linkedin, Send } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type Props = {
  /** The title to pre-fill in the shared message */
  title: string;
  /** Optional text/description to include in the shared message */
  text?: string;
  /** Optional custom URL (defaults to current page) */
  url?: string;
  /** Compact mode (just icon, no label) */
  compact?: boolean;
};

/**
 * ShareButtons — social share buttons for any page.
 *
 * Renders buttons for: WhatsApp, Facebook, X (Twitter), LinkedIn, Telegram,
 * and Copy Link. Uses the native share intents (no JS SDK needed).
 *
 * H1 FIX (DEEP-UX-AUDIT-2026-09-18): window.location.href used to be read
 * DURING render (`typeof window !== "undefined" ? ... : ""`) — the server
 * rendered hrefs with an EMPTY url while the client computed the full one,
 * failing hydration (#418 attribute mismatch) on every public page that
 * SSR-renders share buttons, AND (because React does not patch up mismatched
 * attributes) leaving the EMPTY server hrefs in the live DOM — the share
 * buttons shared text with no link at all. The URL is now resolved strictly
 * AFTER mount (useEffect): server and first client render are identical
 * (hydration succeeds), then the hrefs receive the real location — share
 * functionality is repaired with it.
 */
export function ShareButtons({ title, text, url, compact = false }: Props) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [copied, setCopied] = useState(false);

  // H1 fix: resolve the current-page URL only after mount — never during
  // render (see the component docblock). Deterministic `url` prop stays as-is.
  const [mountedUrl, setMountedUrl] = useState("");
  useEffect(() => {
    if (!url) setMountedUrl(window.location.href);
  }, [url]);

  const shareUrl = url || mountedUrl;
  const shareText = text ? `${title}\n\n${text}` : title;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);
  const encodedTitle = encodeURIComponent(title);

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

  // Try native share sheet on mobile
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

      {/* Native share button (mobile) */}
      <button
        onClick={nativeShare}
        className="grid h-9 w-9 place-items-center rounded-full border border-[var(--edge)] bg-[var(--tint)] text-[var(--text)] transition-opacity hover:opacity-75"
        title={isAr ? "مشاركة" : "Share"}
        aria-label={isAr ? "مشاركة" : "Share"}
      >
        <Share2 className="h-4 w-4" />
      </button>

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

      {/* Copy link button */}
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
