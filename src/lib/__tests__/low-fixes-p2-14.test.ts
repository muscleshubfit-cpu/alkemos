import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/seo";
import { matchesBlogSearch } from "@/lib/blog-search";
import type { BlogPostCard } from "@/lib/blog";

/**
 * P2-14 canaries (§12.40 — owner directive «ابدأ البند ١٤», plan item 14:
 * «إصلاحات Low: هدف SearchAction (لا يُفهرس) · اتساق og:image مقابل
 * JSON-LD image · وصف Organization/WebSite بالإنجليزية على الرئيسية EN»).
 *
 * The three audit findings this batch closes (docs/_AUDIT.md site findings):
 *   #8  WebSite SearchAction target /blog?search={…} canonicalizes to /blog
 *       → the target was non-functional (param ignored on landing) and
 *       non-indexable. Fix: the target is now FUNCTIONAL — the deep link
 *       seeds the search state after hydration; the ?search= variant keeps
 *       its clean /blog canonical BY DESIGN (search URLs stay out of the
 *       index; the promise to machines is now honest).
 *   #9  Mixed-language schema: Organization/WebSite JSON-LD descriptions
 *       were Arabic on the EN homepage. Fix: locale-aware descriptions —
 *       required `lang` parameter, root layout passes the route locale.
 *   #10 og:image source inconsistency on articles: meta og:image =
 *       /api/og-image/{slug}, Article JSON-LD image = external Pexels URL
 *       (logo.png fallback on comparisons). Fix: the JSON-LD image is now
 *       the SAME branded og-image URL the metadata declares.
 *
 * LAWS GUARDED:
 *   1. ENTITY LOCALE: EN descriptions carry zero Arabic script; AR
 *      descriptions carry Arabic; both mention the flagship numbers.
 *   2. IMAGE CONSISTENCY: the four Article-schema surfaces (blog EN/AR +
 *      compare EN/AR) pass the same /api/og-image URL as og:image.
 *   3. SEARCH CONTRACT: the schema still declares the SearchAction target,
 *      BlogListPage seeds the ?search= deep link, and the shared predicate
 *      lives in ONE pure module used by listBlogPosts (no inline drift).
 */

const ARABIC = /[\u0600-\u06FF]/;

const BLOG_EN = "src/app/blog/[slug]/page.tsx";
const BLOG_AR = "src/app/ar/blog/[slug]/page.tsx";
const COMPARE_EN = "src/app/compare/[slug]/page.tsx";
const COMPARE_AR = "src/app/ar/compare/[slug]/page.tsx";
const LIST = "src/components/blog/BlogListPage.tsx";
const BLOG_TS = "src/lib/blog.ts";

const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

describe("P2-14 / §12.40 — locale-aware entity schema (audit finding #9)", () => {
  it("Organization: EN description is pure English, AR is Arabic — both carry the platform numbers", () => {
    const en = getOrganizationSchema("en");
    const ar = getOrganizationSchema("ar");
    expect(en["@type"]).toBe("Organization");
    expect(ARABIC.test(en.description as string)).toBe(false);
    expect(ARABIC.test(ar.description as string)).toBe(true);
    // Entity disambiguation numbers survive in BOTH locales.
    expect(en.description).toContain("868");
    expect(ar.description).toContain("868");
    expect(en.description).toContain("8,830");
    expect(ar.description).toContain("8830");
    // The locale switch must not disturb the sameAs entity links.
    expect((en.sameAs as string[]).length).toBe(7);
    expect(en.sameAs).toEqual(ar.sameAs);
  });

  it("WebSite: EN description is pure English, AR is Arabic", () => {
    const en = getWebSiteSchema("en");
    const ar = getWebSiteSchema("ar");
    expect(en["@type"]).toBe("WebSite");
    expect(ARABIC.test(en.description as string)).toBe(false);
    expect(ARABIC.test(ar.description as string)).toBe(true);
  });

  it("root layout passes the RESOLVED route locale to both schemas", () => {
    const src = readFileSync("src/app/layout.tsx", "utf8");
    expect(src).toContain("getOrganizationSchema(lang)");
    expect(src).toContain("getWebSiteSchema(lang)");
    // The old locale-blind module-level calls are gone.
    expect(stripComments(src)).not.toMatch(
      /const (organization|website)Schema = get(Organization|WebSite)Schema\(\)/,
    );
  });
});

describe("P2-14 / §12.40 — og:image ↔ JSON-LD image consistency (audit finding #10)", () => {
  const cases: Array<[string, string]> = [
    [BLOG_EN, "image: `https://alkemos.com/api/og-image/${slug}?lang=en`"],
    [BLOG_AR, "image: `https://alkemos.com/api/og-image/${slug}?lang=ar`"],
    [
      COMPARE_EN,
      "image: `https://alkemos.com/api/og-image/${comparison.slug}?lang=en&type=compare`",
    ],
    [
      COMPARE_AR,
      "image: `https://alkemos.com/api/og-image/${comparison.slug}?lang=ar&type=compare`",
    ],
  ];

  for (const [file, imageLine] of cases) {
    it(`${file}: Article schema image = the branded og-image URL`, () => {
      const src = readFileSync(file, "utf8");
      expect(src).toContain(imageLine);
      // The mixed-source inconsistency is gone: no raw Pexels passthrough.
      expect(stripComments(src)).not.toMatch(/image:\s*og\.image/);
    });
  }

  it("each surface declares the SAME URL for og:image and twitter:image", () => {
    for (const file of [BLOG_EN, BLOG_AR, COMPARE_EN, COMPARE_AR]) {
      const src = readFileSync(file, "utf8");
      const og = src.match(/url: `(https:\/\/alkemos\.com\/api\/og-image\/[^`]+)`/);
      const twitter = src.match(/images: \[`(https:\/\/alkemos\.com\/api\/og-image\/[^`]+)`\]/);
      expect(og, `${file} og:image url`).toBeTruthy();
      expect(twitter, `${file} twitter:image`).toBeTruthy();
      expect(og?.[1]).toBe(twitter?.[1]);
    }
  });
});

describe("P2-14 / §12.40 — SearchAction target is functional (audit finding #8)", () => {
  it("WebSite schema still declares /blog?search={search_term_string}", () => {
    const schema = getWebSiteSchema("en");
    const action = schema.potentialAction as {
      target: { urlTemplate: string };
      "query-input": string;
    };
    expect(action["@type"]).toBe("SearchAction");
    expect(action.target.urlTemplate).toBe(
      "https://alkemos.com/blog?search={search_term_string}",
    );
    expect(action["query-input"]).toBe("required name=search_term_string");
  });

  it("BlogListPage seeds the ?search= deep link into the search state (post-hydration)", () => {
    const src = readFileSync(LIST, "utf8");
    const s = stripComments(src);
    expect(s).toContain(
      'new URLSearchParams(window.location.search).get("search")',
    );
    expect(s).toMatch(/setSearch\(/);
    // The route must stay ISR-static: no useSearchParams (would force
    // dynamic rendering), no server-side searchParams read.
    expect(s).not.toContain("useSearchParams");
    expect(s).not.toContain("searchParams");
  });

  it("matchesBlogSearch: the shared predicate semantics", () => {
    const post = {
      id: "x",
      language: "en",
      title: "Creatine Loading Guide",
      slug: "creatine-loading",
      excerpt: "How to load creatine safely",
      focus_keyword: "creatine",
      keywords: ["loading phase"],
      category: "supplements",
      tags: ["muscle-gain"],
    } as unknown as BlogPostCard;
    expect(matchesBlogSearch(post, "creatine")).toBe(true); // title
    expect(matchesBlogSearch(post, "LOADING")).toBe(true); // case-insensitive
    expect(matchesBlogSearch(post, "supplements")).toBe(true); // category
    expect(matchesBlogSearch(post, "muscle-gain")).toBe(true); // tags
    expect(matchesBlogSearch(post, "  creatine  ")).toBe(true); // trimmed
    expect(matchesBlogSearch(post, "bcaa")).toBe(false); // no false positives
    expect(matchesBlogSearch(post, "")).toBe(true); // empty = no filter
  });

  it("listBlogPosts delegates to the shared predicate — no inline drift (single-source law)", () => {
    const src = readFileSync(BLOG_TS, "utf8");
    const s = stripComments(src);
    expect(s).toContain("posts.filter((p) => matchesBlogSearch(p, search))");
    expect(s).toContain('from "./blog-search"');
    // The old inline haystack is gone from blog.ts.
    expect(s).not.toMatch(/haystack/);
  });
});
