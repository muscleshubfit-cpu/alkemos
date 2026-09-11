import { describe, it, expect } from "vitest";
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
 */
describe("no fabricated aggregateRating (SEO-GEO-6.4)", () => {
  it("coaching Service schema carries NO aggregateRating", () => {
    const schema = getCoachingServiceSchema() as Record<string, unknown>;
    expect(schema.aggregateRating).toBeUndefined();
    expect(JSON.stringify(schema)).not.toContain("AggregateRating");
  });

  it("EVO SoftwareApplication schema carries NO aggregateRating", () => {
    const schema = getEVOApplicationSchema() as Record<string, unknown>;
    expect(schema.aggregateRating).toBeUndefined();
    expect(JSON.stringify(schema)).not.toContain("AggregateRating");
    // the $0 offer and feature list survive the removal untouched
    expect(schema.offers).toBeDefined();
    expect(Array.isArray(schema.featureList)).toBe(true);
  });
});
