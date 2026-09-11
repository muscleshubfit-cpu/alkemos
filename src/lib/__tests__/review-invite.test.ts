import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  REVIEW_INVITE_COPY,
  reviewInviteUrl,
} from "@/lib/review-invite";
import { SOCIAL_PROFILES } from "@/lib/social";

/**
 * Phase SEO-GEO-6.3 canaries (§12.22 + §12.24 amendment + §12.29 split
 * redesign) — the review-invite laws:
 *   1. Platform links come from the single source (social.ts) and are
 *      the canonical profiles — no drift, no tracking params.
 *   2. COMPLIANCE CANARY: no incentive / reward / promise wording in
 *      any EN or AR copy string (Trustpilot: no incentives, no review
 *      gating; Product Hunt: no incentivized upvotes).
 *   3. Bilingual copy present per platform (AR strings carry Arabic
 *      script; EN labels the platforms).
 *   4. §12.24 STRUCTURAL CANARY: NO dismissal mechanism survives — the
 *      component takes ZERO props (a satisfaction/rating input is
 *      structurally impossible → no gating) and no code path touches
 *      localStorage, cooldowns, or a display predicate.
 *   5. §12.29 SPLIT CANARY: two SEPARATE cards — one per platform, each
 *      with its own identity color and its own link; not one combined
 *      button row.
 */

const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

const componentCode = stripComments(
  readFileSync("src/components/ReviewInviteCard.tsx", "utf8"),
);
const libCode = stripComments(
  readFileSync("src/lib/review-invite.ts", "utf8"),
);

/** All string leaves of the per-platform copy tree. */
function copyStrings(): string[] {
  const out: string[] = [];
  for (const lang of ["en", "ar"] as const) {
    for (const platform of ["trustpilot", "producthunt"] as const) {
      const block = (REVIEW_INVITE_COPY[lang] as Record<string, unknown>)[platform] as Record<string, unknown>;
      for (const v of Object.values(block)) {
        if (typeof v === "string") out.push(v);
      }
    }
  }
  return out;
}

describe("review invite (SEO-GEO-6.3 §12.22 + §12.24 + §12.29)", () => {
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

  it("COMPLIANCE CANARY: no incentive/reward/promise wording in any copy leaf (EN or AR)", () => {
    const forbidden = [
      // EN
      "discount", "coupon", "voucher", "free gift", "reward", "cashback",
      "win", "prize", "giveaway", "bonus",
      // AR
      "خصم", "كوبون", "هدية", "مكافأة", "جائزة", "سحب", "كاش",
    ];
    for (const s of copyStrings()) {
      const lower = s.toLowerCase();
      for (const word of forbidden) {
        expect(lower, `incentive word "${word}" must not appear in: ${s}`).not.toContain(word);
      }
    }
  });

  it("copy is bilingual and per-platform (§12.29 structure)", () => {
    const hasArabic = (s: string) => /[\u0600-\u06FF]/.test(s);
    for (const platform of ["trustpilot", "producthunt"] as const) {
      const en = (REVIEW_INVITE_COPY.en as Record<string, { title: string; line: string; cta: string }>)[platform];
      const ar = (REVIEW_INVITE_COPY.ar as Record<string, { title: string; line: string; cta: string }>)[platform];
      expect(en.title.length).toBeGreaterThan(5);
      expect(en.line.length).toBeGreaterThan(20);
      expect(ar.title.length).toBeGreaterThan(5);
      expect(ar.line.length).toBeGreaterThan(20);
      expect(hasArabic(ar.line)).toBe(true);
    }
    // EN labels the platforms by name.
    expect(REVIEW_INVITE_COPY.en.trustpilot.cta).toContain("Trustpilot");
    expect(REVIEW_INVITE_COPY.en.producthunt.title).toContain("Product Hunt");
    expect(REVIEW_INVITE_COPY.ar.trustpilot.cta).toContain("Trustpilot");
    expect(REVIEW_INVITE_COPY.ar.producthunt.title).toContain("Product Hunt");
  });

  it("§12.24 AMENDMENT CANARY: zero props, no dismissal, no storage, no cooldown, no display predicate", () => {
    // Owner correction «ليس مطلوب إغفال … بدون ازعاج = ألا تحجب النتائج»:
    // the hide button + 30-day cooldown were removed; non-annoyance is
    // purely visual (slim inline cards below the results flow).
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

  it("§12.29 SPLIT CANARY: two separate cards — one per platform, own identity, own link", () => {
    // Owner directive «فصلهم الى كارتين منفصليين»: the component must
    // render TWO distinct card containers with the two platform identity
    // colors and the two separate links — not one combined button row.
    expect(componentCode).toContain("#00b67a"); // Trustpilot identity
    expect(componentCode).toContain("#da552f"); // Product Hunt identity
    expect(componentCode).toContain('reviewInviteUrl("trustpilot")');
    expect(componentCode).toContain('reviewInviteUrl("producthunt")');
    // Two card containers (the comment markers survive comment-stripping
    // as plain text anchors are removed — pin the structural grid).
    expect(componentCode).toContain("grid grid-cols-1 gap-3 md:grid-cols-2");
    // Each platform's CTA copy is rendered from its own block.
    expect(componentCode).toContain("copy.trustpilot.cta");
    expect(componentCode).toContain("copy.producthunt.cta");
    // The old combined single-strip layout is gone.
    expect(componentCode).not.toContain("btn-chrome");
  });

  it("PRODUCT HUNT NEUTRALITY: the PH card solicits no upvotes (discovery only)", () => {
    // PH guidelines: vote-begging is discouraged, incentivized upvotes
    // forbidden. The card's copy stays a neutral discovery link.
    const forbidden = ["upvote", "vote for us", "support us with", "صوّت", "صوت لنا", "ادعمنا"];
    for (const s of copyStrings()) {
      const lower = s.toLowerCase();
      for (const word of forbidden) {
        expect(lower, `vote solicitation "${word}" must not appear in: ${s}`).not.toContain(word);
      }
    }
  });
});
