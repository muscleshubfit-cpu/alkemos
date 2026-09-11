"use client";

import { Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  REVIEW_INVITE_COPY,
  reviewInviteUrl,
} from "@/lib/review-invite";

/**
 * ReviewInviteCard — Phase SEO-GEO-6.3 (§12.22) + §12.24 amendment.
 *
 * Slim always-on strip rendered after tool results / plan generation
 * (5 calculators + meal planner, EN + AR via the shared bilingual client
 * pages). Asks for an honest public review on Trustpilot and shows a
 * neutral Product Hunt discovery link.
 *
 * Laws (src/lib/review-invite.ts header):
 *   - NO incentives / promises (Trustpilot + Product Hunt guidelines).
 *   - NO gating: rendered for every visitor — the component takes ZERO
 *     props, so display logic cannot depend on a satisfaction answer.
 *   - Non-annoying (§12.24 owner correction «ليس مطلوب إغفال … المقصود
 *     بدون ازعاج: ألا تظهر بشكل مزعج يحجب النتائج»): purely visual —
 *     a slim inline strip INSIDE the results flow (after share buttons,
 *     before ads), never a modal, never an overlay, never blocks the
 *     results. Always rendered, no hide state, no storage, no timers.
 */
export function ReviewInviteCard() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const copy = isAr ? REVIEW_INVITE_COPY.ar : REVIEW_INVITE_COPY.en;

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
        </div>
      </div>
    </div>
  );
}
