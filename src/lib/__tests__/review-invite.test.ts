import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  REVIEW_INVITE_COPY,
  reviewInviteUrl,
} from "@/lib/review-invite";
import { SOCIAL_PROFILES } from "@/lib/social";

/**
 * Phase SEO-GEO-6.3 canaries (§12.22 + §12.24 amendment) — the
 * review-invite laws:
 *   1. Platform links come from the single source (social.ts) and are
 *      the canonical profiles — no drift, no tracking params.
 *   2. COMPLIANCE CANARY: no incentive / reward / promise wording in
 *      any EN or AR copy string (Trustpilot: no incentives, no review
 *      gating; Product Hunt: no incentivized upvotes).
 *   3. Bilingual copy present (AR strings carry Arabic script).
 *   4. §12.24 STRUCTURAL CANARY: NO dismissal mechanism survives — the
 *      component takes ZERO props (a satisfaction/rating input is
 *      structurally impossible → no gating) and no code path touches
 *      localStorage, cooldowns, or a display predicate.
 */

const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

const componentCode = stripComments(
  readFileSync("src/components/ReviewInviteCard.tsx", "utf8"),
);
const libCode = stripComments(
  readFileSync("src/lib/review-invite.ts", "utf8"),
);

describe("review invite (SEO-GEO-6.3 §12.22 + §12.24)", () => {
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

  it("§12.24 AMENDMENT CANARY: zero props, no dismissal, no storage, no cooldown, no display predicate", () => {
    // Owner correction «ليس مطلوب إغفال … بدون ازعاج = ألا تحجب النتائج»:
    // the hide button + 30-day cooldown were removed; non-annoyance is
    // purely visual (slim inline strip below the results flow).
    //
    // Zero props → display logic cannot take a satisfaction/rating input
    // (review gating stays structurally impossible — Trustpilot law).
    expect(libCode + componentCode).toMatch(
      /export function ReviewInviteCard\(\)/,
    );
    for (const code of [libCode, componentCode]) {
      expect(code, "no localStorage anywhere").not.toContain("localStorage");
      expect(code, "no dismissal mechanism").not.toContain("dismiss");
      expect(code, "no cooldown constant").not.toContain("COOLDOWN");
      expect(code, "no storage key export").not.toContain("STORAGE_KEY");
    }
    // The §12.22 display predicate must not come back — visibility is
    // unconditional now, so there is nothing to predicate.
    expect(libCode).not.toContain("shouldShowReviewInvite");
    // No visibility gate in the component (renders with the results).
    expect(componentCode).not.toContain("useState");
    expect(componentCode).not.toContain("useEffect");
  });
});
