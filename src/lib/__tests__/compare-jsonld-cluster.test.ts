import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { COMPARISONS, getComparisonBySlug } from "@/lib/comparisons";
import { getArticleSchema, getItemListSchema, SITE_URL } from "@/lib/seo";

/**
 * W1-1 — compare JSON-LD cluster canary (full-stack audit 2026-10-02,
 * findings E-02 / E-03 / E-04 on ALL 8 compare pages — the EN detail
 * renderer + its AR mirror).
 *
 *   E-02 — getItemListSchema blindly prefixed SITE_URL onto ABSOLUTE
 *          competitor URLs: the ItemList second item rendered as
 *          "https://alkemos.comhttps://www.myfitnesspal.com" (invalid
 *          URL on every compare page). The builder is now
 *          absolute-URL-aware; the 14 legacy callers (relative paths
 *          only) are byte-identical in output.
 *   E-03 — datePublished/dateModified/lastReviewed were fabricated with
 *          new Date().toISOString() AT RENDER TIME — every request made
 *          Google see the page as "modified + expert-reviewed today",
 *          contradicting the honest-review law in seo.ts. Now all three
 *          dates come from the data module: the STABLE first-publish
 *          date (publishedAt, git-sourced) + the dataAsOf verification
 *          date (dateModified + EXPLICIT lastReviewed — the same claim
 *          the visible header makes).
 *   E-04 — mainEntityOfPage fell back to the legacy /blog/compare/…
 *          default (a URL that does not exist) because the compare
 *          pages never passed the Phase-318 pageUrl param.
 */

const COMPARE_EN = "src/app/(en)/compare/[slug]/page.tsx";
const COMPARE_AR = "src/app/(ar)/ar/compare/[slug]/page.tsx";

/** The REAL first-publish dates (git history — the same sourcing law as
 *  VERIFIED_OFFICIAL in comparisons-official-links.test.ts): the three
 *  original comparisons shipped with the comparison surface in d238e96a
 *  (2026-09-07); Cronometer shipped with the P0 tracking-pages frame
 *  cae890f4 (2026-09-30). Adding a comparison without a REAL date must
 *  fail here — never invent one. */
const EXPECTED_PUBLISHED_AT: Record<string, string> = {
  "alkemos-vs-myfitnesspal": "2026-09-07",
  "alkemos-vs-freeletics": "2026-09-07",
  "alkemos-vs-exrx": "2026-09-07",
  "alkemos-vs-cronometer": "2026-09-30",
};

/** Mirrors the exact ItemList call shape both compare renderers use. */
function buildCompareItemList(competitorUrl: string, competitorName: string) {
  return getItemListSchema({
    name: "Alkemos vs Competitor — Alkemos",
    description: "comparison description",
    items: [
      { name: "Alkemos", url: "/" },
      { name: competitorName, url: competitorUrl },
    ],
  });
}

describe("W1-1 · E-02 — absolute-URL-aware ItemList builder", () => {
  it("absolute https URLs pass through VERBATIM (no SITE_URL double-prefix)", () => {
    const list = buildCompareItemList("https://www.myfitnesspal.com", "MyFitnessPal");
    expect(list.itemListElement[1].url).toBe("https://www.myfitnesspal.com");
    expect(list.itemListElement[1].url).not.toContain("alkemos.comhttp");
  });

  it("relative site paths keep the SITE_URL prefix (legacy callers byte-identical)", () => {
    const list = getItemListSchema({
      name: "list",
      description: "d",
      items: [{ name: "Exercise Library", url: "/exercises" }],
    });
    expect(list.itemListElement[0].url).toBe(`${SITE_URL}/exercises`);
  });

  it("the compare call shape: first item prefixed, competitor item verbatim", () => {
    const list = buildCompareItemList("https://cronometer.com", "Cronometer");
    expect(list.itemListElement[0].url).toBe(`${SITE_URL}/`);
    expect(list.itemListElement[1].url).toBe("https://cronometer.com");
  });

  it("every COMPARISONS competitor emits its official URL — zero double-prefixes", () => {
    for (const c of COMPARISONS) {
      const list = buildCompareItemList(c.competitorUrl, c.competitorName);
      const urls = (list.itemListElement as Array<{ url: string }>).map((i) => i.url);
      expect(urls).toContain(c.competitorUrl);
      expect(urls.some((u) => u.includes("alkemos.comhttps://"))).toBe(false);
    }
  });
});

describe("W1-1 · E-03 — real data-module dates + explicit honest lastReviewed", () => {
  const mfp = getComparisonBySlug("alkemos-vs-myfitnesspal")!;

  it("every comparison carries ISO publishedAt + dataAsOf from the data module", () => {
    const iso = /^\d{4}-\d{2}-\d{2}$/;
    for (const c of COMPARISONS) {
      expect(c.publishedAt, `${c.slug}.publishedAt`).toMatch(iso);
      expect(c.dataAsOf, `${c.slug}.dataAsOf`).toMatch(iso);
    }
  });

  it("publishedAt is the git-sourced first-publish date (stable law, never invented)", () => {
    for (const c of COMPARISONS) {
      expect(c.publishedAt, `${c.slug}`).toBe(EXPECTED_PUBLISHED_AT[c.slug]);
    }
  });

  it("publish date never postdates the last data verification", () => {
    for (const c of COMPARISONS) {
      expect(c.publishedAt <= c.dataAsOf, `${c.slug}`).toBe(true);
    }
  });

  it("the page call shape yields publishedAt/dataAsOf — not render-time dates", () => {
    const schema = getArticleSchema({
      title: mfp.titleEn,
      description: mfp.descriptionEn,
      slug: `compare/${mfp.slug}`,
      datePublished: mfp.publishedAt,
      dateModified: mfp.dataAsOf,
      lastReviewed: mfp.dataAsOf,
    });
    expect(schema.datePublished).toBe(mfp.publishedAt);
    expect(schema.dateModified).toBe(mfp.dataAsOf);
    expect(schema.lastReviewed).toBe(mfp.dataAsOf);
  });

  it("owner-curated surface keeps reviewedBy (matches the visible header claim)", () => {
    const schema = getArticleSchema({
      title: mfp.titleEn,
      description: mfp.descriptionEn,
      slug: `compare/${mfp.slug}`,
      datePublished: mfp.publishedAt,
      dateModified: mfp.dataAsOf,
      lastReviewed: mfp.dataAsOf,
    });
    expect(schema.reviewedBy).toBeTruthy();
    expect(schema.lastReviewed).toBe(mfp.dataAsOf);
  });

  it("source pin: neither compare renderer fabricates dates with new Date()", () => {
    // Matches an actual `const today = new Date(…)` statement — NOT the
    // historical mentions inside code comments (statement-anchored, so
    // documenting the old defect can never weaken the pin).
    const renderTimeDate = /^[ \t]*(?:const|let|var) [A-Za-z_$][\w$]* = new Date\(/m;
    expect(renderTimeDate.test(readFileSync(COMPARE_EN, "utf8"))).toBe(false);
    expect(renderTimeDate.test(readFileSync(COMPARE_AR, "utf8"))).toBe(false);
  });

  it("source pin: both renderers bind the three dates to the data module", () => {
    expect(readFileSync(COMPARE_EN, "utf8")).toContain("datePublished: comparison.publishedAt");
    expect(readFileSync(COMPARE_EN, "utf8")).toContain("lastReviewed: comparison.dataAsOf");
    expect(readFileSync(COMPARE_AR, "utf8")).toContain("datePublished: comparison.publishedAt");
    expect(readFileSync(COMPARE_AR, "utf8")).toContain("lastReviewed: comparison.dataAsOf");
  });
});

describe("W1-1 · E-04 — mainEntityOfPage points at the REAL page URL", () => {
  const mfp = getComparisonBySlug("alkemos-vs-myfitnesspal")!;

  it("getArticleSchema with pageUrl uses it verbatim for mainEntityOfPage @id", () => {
    const schema = getArticleSchema({
      title: mfp.titleEn,
      description: mfp.descriptionEn,
      slug: `compare/${mfp.slug}`,
      datePublished: mfp.publishedAt,
      pageUrl: `https://alkemos.com/compare/${mfp.slug}`,
    });
    expect(schema.mainEntityOfPage).toEqual({
      "@type": "WebPage",
      "@id": `https://alkemos.com/compare/${mfp.slug}`,
    });
  });

  it("AR mirror pageUrl carries the /ar/ prefix", () => {
    const schema = getArticleSchema({
      title: mfp.titleAr,
      description: mfp.descriptionAr,
      slug: `ar/compare/${mfp.slug}`,
      datePublished: mfp.publishedAt,
      pageUrl: `https://alkemos.com/ar/compare/${mfp.slug}`,
    });
    expect((schema.mainEntityOfPage as { "@id": string })["@id"]).toBe(
      `https://alkemos.com/ar/compare/${mfp.slug}`,
    );
  });

  it("legacy blog callers keep the /blog/${slug} default (backward compat)", () => {
    const schema = getArticleSchema({
      title: "Article",
      description: "d",
      slug: "my-post",
      datePublished: "2026-09-01",
    });
    expect((schema.mainEntityOfPage as { "@id": string })["@id"]).toBe(
      `${SITE_URL}/blog/my-post`,
    );
  });

  it("source pin: both compare renderers pass pageUrl: url", () => {
    expect(readFileSync(COMPARE_EN, "utf8")).toContain("pageUrl: url");
    expect(readFileSync(COMPARE_AR, "utf8")).toContain("pageUrl: url");
  });
});
