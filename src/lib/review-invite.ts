/**
 * ReviewInvite — Phase SEO-GEO-6.3 (2026-09-12, owner directive:
 * «اظهر طلب تقيم الى تراست بايلوت و بروداكت هانت فى اماكن مناسبة
 * داخل الموقع مثل بعد نتائج الادوات و توليد الخطط … بدون ازعاج …
 * بدون اى مكافئة او وعود»).
 *
 * §12.24 AMENDMENT (same day, owner correction): «ليس مطلوب إغفال،
 * المقصود بدون ازعاج ( ان لاتظهر بشكل مزعج يحجب نتائج او اى شكل
 * مزعج)» — the hide button and its 30-day cooldown were REMOVED.
 * Non-annoyance is purely visual: slim inline cards that sit BELOW the
 * results flow and never block anything (never a modal, never an
 * overlay). The cards are always rendered with the results.
 *
 * §12.29 AMENDMENT (owner directive «كارت تراست بايلوت و بروداكت هانت
 * محتاج اعاده تصميم مع فصلهم الى كارتين منفصليين»): the single strip
 * is now TWO SEPARATE cards — one per platform, each with its own
 * identity, copy, and link. Copy is structured per platform.
 *
 * A pair of slim, always-on invite cards rendered AFTER tool results /
 * plan generation, asking for an honest public review. Platform links come
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
 *     discouraged. The PH card is a neutral discovery link ("We're on
 *     Product Hunt") with no upvote solicitation and no rewards.
 *
 * Non-annoyance law (§12.24, unchanged by §12.29): two slim inline cards
 * per result screen, always rendered, never a modal, never an overlay,
 * never blocks the results — no hide state, no storage, no timers.
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
 * EN + AR (MSA), structured per platform (§12.29 split). The canary test
 * pins the absence of incentive words across EVERY string leaf.
 */
export const REVIEW_INVITE_COPY = {
  en: {
    trustpilot: {
      title: "Enjoying Alkemos?",
      line: "Your honest public review helps others find the platform — it takes about 2 minutes.",
      cta: "Review on Trustpilot",
    },
    producthunt: {
      title: "We're on Product Hunt",
      line: "Our launch page lives there — a neutral place to discover the product and follow its journey.",
      cta: "Visit the launch page",
    },
  },
  ar: {
    trustpilot: {
      title: "استفدت من Alkemos؟",
      line: "مراجعتك الصادقة تساعد غيرك على اكتشاف المنصة — تستغرق حوالي دقيقتين.",
      cta: "قيّمنا على Trustpilot",
    },
    producthunt: {
      title: "تجدنا على Product Hunt",
      line: "صفحة إطلاقنا موجودة هناك — مكان محايد لاكتشاف المنتج ومتابعة رحلته.",
      cta: "زر صفحة الإطلاق",
    },
  },
} as const;

export type ReviewInviteCopy = (typeof REVIEW_INVITE_COPY)["en"];
