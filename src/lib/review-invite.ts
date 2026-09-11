/**
 * ReviewInvite — Phase SEO-GEO-6.3 (2026-09-12, owner directive:
 * «اظهر طلب تقيم الى تراست بايلوت و بروداكت هانت فى اماكن مناسبة
 * داخل الموقع مثل بعد نتائج الادوات و توليد الخطط … بدون ازعاج …
 * بدون اى مكافئة او وعود»).
 *
 * A slim, dismissible invite strip rendered AFTER tool results / plan
 * generation, asking for an honest public review. Platform links come
 * from the single source src/lib/social.ts (auto-propagation law).
 *
 * COMPLIANCE (documented law — guarded by canaries in
 * src/lib/__tests__/review-invite.test.ts):
 *   - Trustpilot: asking for reviews is allowed; INCENTIVES (discounts,
 *     coupons, gifts, rewards) and REVIEW GATING (filtering who sees the
 *     invite by a satisfaction answer) are prohibited. This invite is
 *     rendered for ALL users unconditionally — the soft "if you enjoy it"
 *     lives in the COPY only, never in display logic. No promises.
 *   - Product Hunt: incentivized upvotes are forbidden; vote-begging is
 *     discouraged. The PH button is a neutral discovery link ("We're on
 *     Product Hunt") with no upvote solicitation and no rewards.
 *
 * Non-annoyance law: one strip per result screen, dismissible with a
 * 30-day cooldown (localStorage), no modals, no overlays.
 */

import { SOCIAL_PROFILES } from "./social";

export const REVIEW_INVITE_STORAGE_KEY = "alkemos-review-invite-dismissed";
export const REVIEW_INVITE_COOLDOWN_DAYS = 30;

/** Pure display predicate — takes NO satisfaction/rating input (no gating). */
export function shouldShowReviewInvite(
  now: Date,
  storedValue: string | null,
): boolean {
  if (!storedValue) return true;
  const dismissedAt = Date.parse(storedValue);
  if (Number.isNaN(dismissedAt)) return true; // corrupt entry → fail-open
  const cooldownMs = REVIEW_INVITE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  return now.getTime() - dismissedAt >= cooldownMs;
}

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
    dismiss: "Dismiss",
  },
  ar: {
    title: "استفدت من Alkemos؟",
    line: "مراجعتك الصادقة تساعد غيرك على اكتشاف المنصة — تستغرق حوالي دقيقتين.",
    trustpilot: "قيّمنا على Trustpilot",
    producthunt: "تجدنا على Product Hunt",
    dismiss: "إخفاء",
  },
} as const;

export type ReviewInviteCopy = (typeof REVIEW_INVITE_COPY)["en"];
