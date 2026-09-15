import { describe, it, expect } from "vitest";
import { SITEMAP_LASTMOD, familyLastmod } from "@/lib/sitemap-lastmod";
import { CONTENT_LAST_REVIEWED } from "@/lib/seo";
import { buildUrlSet, type SitemapUrl } from "@/lib/sitemap-xml";

/**
 * Phase 155 (SEO-GEO-4.7, §7.1 #14) — sitemap lastmod anchors.
 *
 * Pins the properties the feature depends on:
 *   1. SINGLE SOURCE: the foods family derives its lastmod from
 *      CONTENT_LAST_REVIEWED (the E-E-A-T review date, src/lib/seo.ts)
 *      — never a second hand-copied date that can drift. The exercises
 *      family was decoupled in batch 2 of §12.53 (2026-09-16): image
 *      self-hosting changed every exercise page's served HTML, so its
 *      lastmod is pinned to that ship date (a content-HTML change is
 *      NOT a content review — CONTENT_LAST_REVIEWED stays as-is).
 *   2. FORMAT: every family value is W3C day precision, and
 *      buildUrlSet actually serializes it as <lastmod>.
 */

const W3C_DAY = /^\d{4}-\d{2}-\d{2}$/;

describe("sitemap lastmod anchors (#14)", () => {
  it("foods derives from CONTENT_LAST_REVIEWED (single source)", () => {
    expect(SITEMAP_LASTMOD.foods).toBe(CONTENT_LAST_REVIEWED);
  });

  it("exercises pinned to the batch-2 ship date (image self-hosting)", () => {
    expect(SITEMAP_LASTMOD.exercises).toBe("2026-09-16");
  });

  it("every family is a W3C day-precision date", () => {
    for (const [family, value] of Object.entries(SITEMAP_LASTMOD)) {
      expect(value, family).toMatch(W3C_DAY);
    }
  });

  it("familyLastmod serializes to the same W3C day (UTC midnight)", () => {
    for (const family of Object.keys(SITEMAP_LASTMOD) as Array<keyof typeof SITEMAP_LASTMOD>) {
      const d = familyLastmod(family);
      expect(d.toISOString().slice(0, 10)).toBe(SITEMAP_LASTMOD[family]);
      expect(d.toISOString().endsWith("T00:00:00.000Z")).toBe(true);
    }
  });

  it("buildUrlSet emits <lastmod> when lastModified is set", () => {
    const urls: SitemapUrl[] = [
      { loc: "https://alkemos.com/exercises/push-up", lastModified: familyLastmod("exercises") },
    ];
    const xml = buildUrlSet(urls);
    expect(xml).toContain(
      `<lastmod>${SITEMAP_LASTMOD.exercises}</lastmod>`,
    );
  });

  it("buildUrlSet omits <lastmod> when lastModified is absent (no fake dates)", () => {
    const xml = buildUrlSet([{ loc: "https://alkemos.com/x" }]);
    expect(xml).not.toContain("<lastmod>");
  });
});
