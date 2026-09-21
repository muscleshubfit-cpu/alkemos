import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { getCoachingServiceSchema, getEVOApplicationSchema } from "@/lib/seo";

/**
 * Phase SEO-GEO-6.4 (§12.19 P0-5) — no fabricated ratings law.
 *
 * The live audit (2026-09-11) flagged hardcoded aggregateRating blocks
 * (4.8/500 on the Service schema, 4.9/300 on the EVO SoftwareApplication)
 * with NO visible review source anywhere on the site — a fabricated-signal
 * risk on YMYL pages. The values were removed; these canaries pin the law:
 * aggregateRating may ONLY return when a real, linkable review source
 * exists (Trustpilot / app stores — §12.19 P1-7).
 *
 * §12.53 item 3 (2026-09-15) — locale-aware entity schema (same law as
 * the ORG_DESCRIPTIONS guard in low-fixes-p2-14.test.ts): the EN /evo and
 * /coaching pages were serving Arabic JSON-LD entity descriptions to
 * English users and machines. Both schema builders now REQUIRE the locale:
 * EN surfaces carry zero Arabic script, AR surfaces carry Arabic — in
 * name, description, offer text, AND every featureList entry.
 */

const ARABIC = /[\u0600-\u06FF]/;

describe("no fabricated aggregateRating (SEO-GEO-6.4)", () => {
  it("coaching Service schema carries NO aggregateRating", () => {
    const schema = getCoachingServiceSchema("en") as Record<string, unknown>;
    expect(schema.aggregateRating).toBeUndefined();
    expect(JSON.stringify(schema)).not.toContain("AggregateRating");
  });

  it("EVO SoftwareApplication schema carries NO aggregateRating", () => {
    const schema = getEVOApplicationSchema("en") as Record<string, unknown>;
    expect(schema.aggregateRating).toBeUndefined();
    expect(JSON.stringify(schema)).not.toContain("AggregateRating");
    // the $0 offer and feature list survive the removal untouched
    expect(schema.offers).toBeDefined();
    expect(Array.isArray(schema.featureList)).toBe(true);
  });
});

describe("§12.53 item 3 — EVO/Coaching schemas are locale-aware", () => {
  it("Coaching Service: EN is pure English, AR is Arabic — no aggregateRating in either locale", () => {
    const en = getCoachingServiceSchema("en") as Record<string, unknown>;
    const ar = getCoachingServiceSchema("ar") as Record<string, unknown>;
    expect(ARABIC.test(en.name as string)).toBe(false);
    expect(ARABIC.test(en.description as string)).toBe(false);
    expect(ARABIC.test(ar.name as string)).toBe(true);
    expect(ARABIC.test(ar.description as string)).toBe(true);
    // the P0-5 ratings law holds in BOTH locales
    expect(JSON.stringify(en)).not.toContain("AggregateRating");
    expect(JSON.stringify(ar)).not.toContain("AggregateRating");
    // the offer block is identical across locales (prices are language-free)
    expect(JSON.stringify(en.offers)).toBe(JSON.stringify(ar.offers));
  });

  it("EVO SoftwareApplication: EN is pure English, AR is Arabic — including offers + featureList", () => {
    const en = getEVOApplicationSchema("en") as Record<string, unknown>;
    const ar = getEVOApplicationSchema("ar") as Record<string, unknown>;
    const enFeatures = en.featureList as string[];
    const arFeatures = ar.featureList as string[];
    expect(enFeatures.length).toBeGreaterThan(0);
    expect(arFeatures.length).toBe(enFeatures.length);
    expect(ARABIC.test(en.name as string)).toBe(false);
    expect(ARABIC.test(en.description as string)).toBe(false);
    expect(ARABIC.test((en.offers as { description: string }).description)).toBe(false);
    for (const feature of enFeatures) expect(ARABIC.test(feature)).toBe(false);
    expect(ARABIC.test(ar.name as string)).toBe(true);
    expect(ARABIC.test(ar.description as string)).toBe(true);
    expect(ARABIC.test((ar.offers as { description: string }).description)).toBe(true);
    for (const feature of arFeatures) expect(ARABIC.test(feature)).toBe(true);
    // the $0 offer price survives the locale switch
    expect((en.offers as { price: string }).price).toBe("0");
    expect((ar.offers as { price: string }).price).toBe("0");
  });

  it("the four surfaces pass the RESOLVED route locale (no locale-blind calls left)", () => {
    const surfaces: Array<[string, string]> = [
      ["src/app/(en)/coaching/layout.tsx", 'getCoachingServiceSchema("en")'],
      ["src/app/(ar)/ar/coaching/layout.tsx", 'getCoachingServiceSchema("ar")'],
      ["src/app/(en)/evo/layout.tsx", 'getEVOApplicationSchema("en")'],
      ["src/app/(ar)/ar/evo/layout.tsx", 'getEVOApplicationSchema("ar")'],
    ];
    for (const [file, call] of surfaces) {
      const src = readFileSync(file, "utf8");
      expect(src, file).toContain(call);
      expect(src, file).not.toMatch(/get(CoachingService|EVOApplication)Schema\(\)/);
    }
  });
});
