import { describe, it, expect } from "vitest";
import { buildBlogHreflang, type BlogOGData } from "@/lib/blog-server";

/**
 * Phase SEO-GEO-6.5 (§12.19 P0-4) — blog article hreflang laws.
 *
 * Audit C1 (2026-09-07) removed hreflang because ZERO real pairs existed
 * and every declared counterpart 404'd. Phase 157/158 (linked_post_id)
 * introduced REAL translation pairs — so hreflang returns, under the same
 * C1 law: a counterpart URL may only be declared when it actually exists.
 * Unpaired posts declare self + x-default only.
 */

const EN_SELF = "https://alkemos.com/blog/protein-per-day";
const AR_TWIN = "https://alkemos.com/ar/blog/protein-intake";

function og(overrides: Partial<BlogOGData>): BlogOGData {
  return {
    title: "t",
    description: "d",
    image: "https://alkemos.com/logo.png",
    articleUrl: EN_SELF,
    locale: "en_US",
    twinSlug: null,
    twinLang: null,
    ...overrides,
  };
}

describe("buildBlogHreflang (SEO-GEO-6.5)", () => {
  it("paired EN post declares en + ar twin + x-default → EN", () => {
    const out = buildBlogHreflang(
      og({ twinSlug: "protein-intake", twinLang: "ar" }),
    );
    expect(out).toEqual({
      en: EN_SELF,
      ar: AR_TWIN,
      "x-default": EN_SELF,
    });
  });

  it("paired AR post declares ar (self) + en twin + x-default → EN twin", () => {
    const out = buildBlogHreflang(
      og({
        articleUrl: AR_TWIN,
        locale: "ar_EG",
        twinSlug: "protein-per-day",
        twinLang: "en",
      }),
    );
    expect(out).toEqual({
      ar: AR_TWIN,
      en: EN_SELF,
      "x-default": EN_SELF,
    });
  });

  it("unpaired EN post declares self + x-default → self (never a dangling counterpart)", () => {
    const out = buildBlogHreflang(og({}));
    expect(out).toEqual({ en: EN_SELF, "x-default": EN_SELF });
  });

  it("unpaired AR post declares self + x-default → self", () => {
    const out = buildBlogHreflang(
      og({ articleUrl: AR_TWIN, locale: "ar_EG" }),
    );
    expect(out).toEqual({ ar: AR_TWIN, "x-default": AR_TWIN });
  });
});
