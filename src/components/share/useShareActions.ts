"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * SHARE ACTIONS HOOK — the single implementation of the two behaviors
 * every share surface shares (Phase 231 unification):
 *
 * 1. COPY LINK — navigator.clipboard first, document.execCommand
 *    fallback for older browsers (the pattern ShareButtons and
 *    CoachShareButtons always had; SocialShare gains the fallback —
 *    its bare clipboard call silently failed on older browsers).
 *    `copied` resets after 2s (all three surfaces used the same 2s).
 *
 * 2. WEB SHARE — support is CLIENT-ONLY knowledge, so it resolves
 *    strictly AFTER mount (state starts false): the server and the
 *    first client render agree (no hydration mismatch), and the native
 *    button appears only where `navigator.share` actually exists.
 *    (SocialShare previously probed navigator during render — SSR
 *    omitted the button but supporting clients rendered it at first
 *    paint: a latent hydration mismatch. Same end state on mobile, one
 *    tick later, zero mismatch.)
 *
 *    nativeShare() abort semantics (unified): user cancel (AbortError)
 *    does nothing; a REAL share failure falls back to the copy path so
 *    the user always leaves with the link (ShareButtons previously did
 *    nothing on failure; SocialShare copied even on cancel — the union
 *    of the two correct behaviors).
 */

export interface ShareActionsInput {
  /** Absolute canonical URL to copy / hand to navigator.share. */
  url: string;
  title: string;
  /** Full share message passed to navigator.share (and nothing else). */
  text?: string;
}

export function useShareActions({ url, title, text }: ShareActionsInput) {
  const [copied, setCopied] = useState(false);
  const [nativeShareSupported, setNativeShareSupported] = useState(false);

  // Web Share API support is client-only knowledge — resolved strictly
  // AFTER mount: server and first client render both omit the button,
  // then supporting devices (mobile) gain it (no hydration mismatch).
  useEffect(() => {
    setNativeShareSupported(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers (execCommand) — never silently fail
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const nativeShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        // User cancelled the sheet — respect that, share nothing.
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        // A real failure — the user still leaves with the link.
        await copy();
      }
    }
  }, [title, text, url, copy]);

  return { copied, copy, nativeShareSupported, nativeShare };
}
