import { describe, it, expect } from "vitest";
import {
  REVIEW_INVITE_COPY,
  REVIEW_INVITE_COOLDOWN_DAYS,
  REVIEW_INVITE_STORAGE_KEY,
  shouldShowReviewInvite,
  reviewInviteUrl,
} from "@/lib/review-invite";
import { SOCIAL_PROFILES } from "@/lib/social";

/**
 * Phase SEO-GEO-6.3 canaries (§12.22) — the review-invite laws:
 *   1. Platform links come from the single source (social.ts) and are
 *      the canonical profiles — no drift, no tracking params.
 *   2. 30-day dismissal cooldown: null → show, fresh → hide,
 *      expired → show, corrupt → fail-open.
 *   3. COMPLIANCE CANARY: no incentive / reward / promise wording in
 *      any EN or AR copy string (Trustpilot: no incentives, no review
 *      gating; Product Hunt: no incentivized upvotes).
 *   4. Bilingual copy present (AR strings carry Arabic script).
 *   5. The display predicate takes NO satisfaction input — its signature
 *      is (now: Date, stored: string | null): gating is structurally
 *      impossible.
 */

const DAY = 24 * 60 * 60 * 1000;

describe("review invite (SEO-GEO-6.3 §12.22)", () => {
  it("links resolve to the canonical profiles from social.ts (single source)", () => {
    const tp = SOCIAL_PROFILES.find((p) => p.name === "trustpilot");
    const ph = SOCIAL_PROFILES.find((p) => p.name === "producthunt");
    expect(reviewInviteUrl("trustpilot")).toBe(tp?.url);
    expect(reviewInviteUrl("producthunt")).toBe(ph?.url);
    expect(reviewInviteUrl("trustpilot")).toBe(
      "https://www.trustpilot.com/review/alkemos.com",
    );
    expect(reviewInviteUrl("producthunt")).toBe(
      "https://www.producthunt.com/products/alkemos",
    );
  });

  it("unknown platform throws (no silent fallback link)", () => {
    expect(() =>
      reviewInviteUrl("youtube" as "trustpilot"),
    ).toThrow();
  });

  it("cooldown law: null → show · fresh → hide · expired → show · corrupt → show", () => {
    const now = new Date("2026-09-12T12:00:00Z");
    expect(shouldShowReviewInvite(now, null)).toBe(true);
    expect(shouldShowReviewInvite(now, "not-a-date")).toBe(true);
    expect(shouldShowReviewInvite(now, "")).toBe(true);
    // dismissed 1 day ago → hidden
    expect(
      shouldShowReviewInvite(now, new Date(now.getTime() - 1 * DAY).toISOString()),
    ).toBe(false);
    // dismissed cooldown-1 days ago → hidden (boundary just under)
    expect(
      shouldShowReviewInvite(
        now,
        new Date(now.getTime() - (REVIEW_INVITE_COOLDOWN_DAYS - 1) * DAY).toISOString(),
      ),
    ).toBe(false);
    // dismissed cooldown+1 days ago → shown again
    expect(
      shouldShowReviewInvite(
        now,
        new Date(now.getTime() - (REVIEW_INVITE_COOLDOWN_DAYS + 1) * DAY).toISOString(),
      ),
    ).toBe(true);
  });

  it("storage key + cooldown are pinned (non-annoyance law)", () => {
    expect(REVIEW_INVITE_STORAGE_KEY).toBe("alkemos-review-invite-dismissed");
    expect(REVIEW_INVITE_COOLDOWN_DAYS).toBe(30);
  });

  it("COMPLIANCE CANARY: no incentive/reward/promise wording in EN or AR copy", () => {
    const forbidden = [
      // EN
      "discount", "coupon", "voucher", "free gift", "reward", "cashback",
      "win", "prize", "giveaway", "bonus",
      // AR
      "خصم", "كوبون", "هدية", "مكافأة", "جائزة", "سحب", "كاش",
    ];
    const allStrings = [
      ...Object.values(REVIEW_INVITE_COPY.en),
      ...Object.values(REVIEW_INVITE_COPY.ar),
    ];
    for (const s of allStrings) {
      const lower = s.toLowerCase();
      for (const word of forbidden) {
        expect(lower, `incentive word "${word}" must not appear in: ${s}`).not.toContain(word);
      }
    }
  });

  it("copy is bilingual (AR carries Arabic script, EN labels the platforms)", () => {
    const hasArabic = (s: string) => /[\u0600-\u06FF]/.test(s);
    for (const v of Object.values(REVIEW_INVITE_COPY.ar)) {
      expect(hasArabic(v) || /Trustpilot|Product Hunt/.test(v)).toBe(true);
    }
    expect(REVIEW_INVITE_COPY.en.trustpilot).toContain("Trustpilot");
    expect(REVIEW_INVITE_COPY.en.producthunt).toContain("Product Hunt");
    expect(REVIEW_INVITE_COPY.ar.line).toMatch(/[\u0600-\u06FF]/);
    expect(REVIEW_INVITE_COPY.en.line.length).toBeGreaterThan(20);
    expect(REVIEW_INVITE_COPY.ar.line.length).toBeGreaterThan(20);
  });

  it("no gating input: display predicate arity is exactly (now, stored)", () => {
    // Structural canary — the function must NOT grow satisfaction/rating
    // parameters (review gating is prohibited by Trustpilot).
    expect(shouldShowReviewInvite.length).toBe(2);
  });
});
