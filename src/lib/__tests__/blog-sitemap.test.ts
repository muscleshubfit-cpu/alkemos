import { describe, expect, it } from "vitest";
import {
  blogLastmod,
  blogPairAlternates,
  blogPostUrl,
  type BlogSitemapPost,
} from "@/lib/blog-sitemap";

/**
 * SEO-GEO-4.1 (2026-09-08): translation-pair hreflang rules for
 * /sitemap-blog.xml. Audit C1 (2026-09-07) removed dangling hreflang —
 * these tests pin the "real pairing only" contract so it can never
 * regress.
 */

const BASE = "https://alkemos.com";

function post(overrides: Partial<BlogSitemapPost>): BlogSitemapPost {
  return {
    id: "p1",
    slug: "some-post",
    language: "en",
    published_at: "2026-09-01T10:00:00Z",
    updated_at: "2026-09-02T10:00:00Z",
    linked_post_id: null,
    ...overrides,
  };
}

describe("blogPostUrl", () => {
  it("routes AR posts under /ar/blog and EN posts under /blog", () => {
    expect(blogPostUrl(BASE, { language: "ar", slug: "دليل-العضلات" })).toBe(
      `${BASE}/ar/blog/دليل-العضلات`,
    );
    expect(blogPostUrl(BASE, { language: "en", slug: "chest-guide" })).toBe(
      `${BASE}/blog/chest-guide`,
    );
  });
});

describe("blogPairAlternates", () => {
  it("returns reciprocal EN↔AR URLs for a valid opposite-language pair", () => {
    const en = post({ id: "en1", language: "en", slug: "chest-guide", linked_post_id: "ar1" });
    const ar = post({ id: "ar1", language: "ar", slug: "دليل-الصدر", linked_post_id: "en1" });
    const byId = new Map([["en1", en], ["ar1", ar]]);

    expect(blogPairAlternates(en, byId, BASE)).toEqual({
      en: `${BASE}/blog/chest-guide`,
      ar: `${BASE}/ar/blog/دليل-الصدر`,
    });
    // Reciprocity: asking from the AR side yields the same pair.
    expect(blogPairAlternates(ar, byId, BASE)).toEqual({
      en: `${BASE}/blog/chest-guide`,
      ar: `${BASE}/ar/blog/دليل-الصدر`,
    });
  });

  it("returns undefined when linked_post_id is null (unpaired post = today's behavior)", () => {
    const en = post({ id: "en1", language: "en" });
    expect(blogPairAlternates(en, new Map([["en1", en]]), BASE)).toBeUndefined();
  });

  it("ignores dangling links (target not in the published map) — C1 regression guard", () => {
    const en = post({ id: "en1", language: "en", linked_post_id: "ghost" });
    expect(blogPairAlternates(en, new Map([["en1", en]]), BASE)).toBeUndefined();
  });

  it("ignores self-links and same-language links", () => {
    const self = post({ id: "en1", language: "en", linked_post_id: "en1" });
    expect(blogPairAlternates(self, new Map([["en1", self]]), BASE)).toBeUndefined();

    const enA = post({ id: "en1", language: "en", linked_post_id: "en2" });
    const enB = post({ id: "en2", language: "en", slug: "other" });
    expect(blogPairAlternates(enA, new Map([["en1", enA], ["en2", enB]]), BASE)).toBeUndefined();
  });
});

describe("blogLastmod", () => {
  it("uses the greater of published_at / updated_at (audit M4)", () => {
    const p = post({
      published_at: "2026-09-01T10:00:00Z",
      updated_at: "2026-09-05T10:00:00Z",
    });
    expect(blogLastmod(p, new Date("2026-09-08")).toISOString()).toBe("2026-09-05T10:00:00.000Z");
  });

  it("falls back to published_at, then the fallback date", () => {
    const fallback = new Date("2026-09-08");
    expect(blogLastmod(post({ updated_at: null }), fallback).toISOString()).toBe(
      "2026-09-01T10:00:00.000Z",
    );
    expect(blogLastmod(post({ published_at: null, updated_at: null }), fallback)).toBe(fallback);
  });
});
