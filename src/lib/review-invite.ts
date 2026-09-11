/**
 * ReviewInvite — Phase SEO-GEO-6.3 (2026-09-12, owner directive:
 * «اظهر طلب تقيم الى تراست بايلوت و بروداكت هانت فى اماكن مناسبة
 * داخل الموقع مثل بعد نتائج الادوات و توليد الخطط … بدون ازعاج …
 * بدون اى مكافئة او وعود»).
 *
 * §12.24 AMENDMENT (same day, owner correction): «ليس مطلوب إغفال،
 * المقصود بدون ازعاج ( ان لاتظهر بشكل مزعج يحجب نتائج او اى شكل
 * مزعج)» — the hide button and its 30-day cooldown were REMOVED.
 * Non-annoyance is purely visual: a slim inline strip that sits BELOW
 * the results flow and never blocks anything (never a modal, never an
 * overlay). The strip is always rendered with the results.
 *
 * A slim, always-on invite strip rendered AFTER tool results / plan
 * generation, asking for an honest public review. Platform links come
 * from the single source src/lib/social.ts (auto-propagation law).
 *
 * COMPLIANCE (documented law — guarded by canaries in
 * src/lib/__tests__/review-invite.test.ts):
 *   - Trustpilot: asking for reviews is allowed; INCENTIVES (discounts,
 *     coupons, gifts, rewards) and REVIEW GATING (filtering who sees the
 *     invite by a satisfaction answer) are prohibited. This invite is
 *     rendered for ALL users unconditionally — the component takes ZERO
 *     props, so display logic cannot depend on a satisfaction answer.
 *     The soft "if you enjoy it" lives in the COPY only. No promises.
 *   - Product Hunt: incentivized upvotes are forbidden; vote-begging is
 *     discouraged. The PH button is a neutral discovery link ("We're on
 *     Product Hunt") with no upvote solicitation and no rewards.
 *
 * Non-annoyance law (§12.24): one slim inline strip per result screen,
 * always rendered, never a modal, never an overlay, never blocks the
 * results — no hide state, no storage, no timers.
 */

import { SOCIAL_PROFILES } from "./social";

/** Canonical invite URL from the single source (social.ts). */
export function reviewInviteUrl(
  platform: "trustpilot" | "producthunt",
): string {
  const p = SOCIAL_PROFILES.find((s) => s.name === platform);
  if (!p) throw new Error(`reviewInviteUrl: unknown platform ${platform}`);
  return p.url;
}

/**
 * Neutral, honest copy — NO incentives, NO promises (owner directive).
 * EN + AR (MSA). The canary test pins the absence of incentive words.
 */
export const REVIEW_INVITE_COPY = {
  en: {
    title: "Enjoying Alkemos?",
    line: "Your honest public review helps others find the platform — it takes about 2 minutes.",
    trustpilot: "Review on Trustpilot",
    producthunt: "We're on Product Hunt",
  },
  ar: {
    title: "استفدت من Alkemos؟",
    line: "مراجعتك الصادقة تساعد غيرك على اكتشاف المنصة — تستغرق حوالي دقيقتين.",
    trustpilot: "قيّمنا على Trustpilot",
    producthunt: "تجدنا على Product Hunt",
  },
} as const;

export type ReviewInviteCopy = (typeof REVIEW_INVITE_COPY)["en"];
