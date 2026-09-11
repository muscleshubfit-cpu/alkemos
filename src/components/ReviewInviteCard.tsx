"use client";

import { Star, Rocket } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  REVIEW_INVITE_COPY,
  reviewInviteUrl,
} from "@/lib/review-invite";

/**
 * ReviewInviteCard — Phase SEO-GEO-6.3 (§12.22) + §12.24 amendment +
 * §12.29 redesign (owner directive «كارت تراست بايلوت و بروداكت هانت
 * محتاج اعاده تصميم مع فصلهم الى كارتين منفصليين»).
 *
 * TWO SEPARATE slim always-on cards rendered after tool results / plan
 * generation (5 calculators + meal planner + AI meal planner, EN + AR via
 * the shared bilingual client pages):
 *   - The Trustpilot card — asks for an honest public review (green
 *     identity, one star mark: the platform's brand cue, NOT a rating
 *     claim of ours).
 *   - The Product Hunt card — a neutral discovery link (orange identity;
 *     no upvote solicitation, no rewards).
 *
 * Laws (src/lib/review-invite.ts header):
 *   - NO incentives / promises (Trustpilot + Product Hunt guidelines).
 *   - NO gating: rendered for every visitor — the component takes ZERO
 *     props, so display logic cannot depend on a satisfaction answer.
 *   - Non-annoying (§12.24 owner correction «ليس مطلوب إغفال … المقصود
 *     بدون ازعاج: ألا تظهر بشكل مزعج يحجب النتائج»): purely visual —
 *     two slim inline cards INSIDE the results flow (after share
 *     buttons, before ads), never a modal, never an overlay, never
 *     blocks the results. Always rendered, no hide state, no storage,
 *     no timers.
 */
export function ReviewInviteCard() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const copy = isAr ? REVIEW_INVITE_COPY.ar : REVIEW_INVITE_COPY.en;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {/* ── Card 1: Trustpilot — honest public review ── */}
      <div className="rounded-2xl border border-[#00b67a]/30 bg-[#00b67a]/[0.06] p-4">
        <div className="flex items-center gap-3">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#00b67a]/15 text-[#00b67a]"
            aria-hidden="true"
          >
            <Star className="h-4 w-4" />
          </span>
          <p className="text-sm font-medium text-[var(--text)]">
            {copy.trustpilot.title}
          </p>
        </div>
        <p className="mt-2 text-xs font-normal leading-relaxed text-[var(--muted-foreground)]">
          {copy.trustpilot.line}
        </p>
        <a
          href={reviewInviteUrl("trustpilot")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#00b67a] px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
        >
          {copy.trustpilot.cta}
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      {/* ── Card 2: Product Hunt — neutral discovery link ── */}
      <div className="rounded-2xl border border-[#da552f]/30 bg-[#da552f]/[0.06] p-4">
        <div className="flex items-center gap-3">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#da552f]/15 text-[#da552f]"
            aria-hidden="true"
          >
            <Rocket className="h-4 w-4" />
          </span>
          <p className="text-sm font-medium text-[var(--text)]">
            {copy.producthunt.title}
          </p>
        </div>
        <p className="mt-2 text-xs font-normal leading-relaxed text-[var(--muted-foreground)]">
          {copy.producthunt.line}
        </p>
        <a
          href={reviewInviteUrl("producthunt")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#da552f]/40 px-4 py-2 text-xs font-medium text-[var(--text)] transition-colors hover:border-[#da552f]"
        >
          {copy.producthunt.cta}
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
