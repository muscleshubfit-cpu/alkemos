"use client";

import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  REVIEW_INVITE_COPY,
  REVIEW_INVITE_STORAGE_KEY,
  shouldShowReviewInvite,
  reviewInviteUrl,
} from "@/lib/review-invite";

/**
 * ReviewInviteCard — Phase SEO-GEO-6.3 (§12.22).
 *
 * Slim dismissible strip rendered after tool results / plan generation
 * (5 calculators + meal planner, EN + AR via the shared bilingual client
 * pages). Asks for an honest public review on Trustpilot and shows a
 * neutral Product Hunt discovery link.
 *
 * Laws (src/lib/review-invite.ts header):
 *   - NO incentives / promises (Trustpilot + Product Hunt guidelines).
 *   - NO gating: rendered for every visitor — display logic never
 *     depends on a satisfaction answer.
 *   - Non-annoying: inline strip (never a modal), dismissible with a
 *     30-day cooldown via localStorage, hidden until mounted so SSR and
 *     client render agree.
 */
export function ReviewInviteCard() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const copy = isAr ? REVIEW_INVITE_COPY.ar : REVIEW_INVITE_COPY.en;

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(REVIEW_INVITE_STORAGE_KEY);
      setVisible(shouldShowReviewInvite(new Date(), stored));
    } catch {
      // Private mode / storage disabled → fail-open (show once).
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(
        REVIEW_INVITE_STORAGE_KEY,
        new Date().toISOString(),
      );
    } catch {
      /* storage unavailable — visual dismissal only */
    }
    setVisible(false);
  };

  return (
    <div className="rounded-2xl border border-[var(--edge)] bg-[var(--tint)] p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Star className="h-4 w-4 shrink-0 text-[var(--muted-2)]" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--text)]">{copy.title}</p>
          <p className="mt-0.5 text-xs font-normal text-[var(--muted-foreground)]">
            {copy.line}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={reviewInviteUrl("trustpilot")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-chrome px-3 py-1.5 text-xs whitespace-nowrap"
          >
            {copy.trustpilot}
          </a>
          <a
            href={reviewInviteUrl("producthunt")}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[var(--edge)] px-3 py-1.5 text-xs font-normal text-[var(--text)] transition-colors hover:border-[var(--chrome-edge)] whitespace-nowrap"
          >
            {copy.producthunt}
          </a>
          <button
            type="button"
            onClick={dismiss}
            aria-label={copy.dismiss}
            title={copy.dismiss}
            className="text-[var(--muted-foreground)] transition-colors hover:text-[var(--text)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
