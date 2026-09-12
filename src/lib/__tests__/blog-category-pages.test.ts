import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { BLOG_CATEGORY_CONTENT } from "@/lib/blog-category-content";
import { scanArabicDialect } from "@/lib/blog-msa";

/**
 * P2-11 canaries (§12.36 — owner directive «… ثم ابدأ p2», plan item 11:
 * «تصنيف مدونة قابل للزحف: صفحات فئات/وسوم فعلية بروابط سياقية»).
 *
 * LAWS GUARDED:
 *   1. CRAWLABLE SURFACES: /blog/category/[slug] + /ar/blog/category/[slug]
 *      exist for the 10 category ids with full reciprocal hreflang pairs,
 *      canonicals, and BreadcrumbList (no FAQPage — the DO-NOT law).
 *   2. UNIQUE CONTENT: no two categories share a ≥25-word block in either
 *      language (the §12.25 no-shared-block law) — 20 unique intros.
 *   3. MSA: the Arabic intros pass the blog dialect scanner (zero strong
 *      markers — the 175/176 law extended to the category hub copy).
 *   4. LINK GRAPH: the blog-list chips are real LINKS (not client filter
 *      buttons), the article category chip links into the category page,
 *      and every category page cross-links its siblings.
 *   5. SITEMAP: the 20 category URLs are advertised with alternates.
 */

const ROUTE_EN = "src/app/blog/category/[slug]/page.tsx";
const ROUTE_AR = "src/app/ar/blog/category/[slug]/page.tsx";
const COMPONENT = "src/components/blog/BlogCategoryPage.tsx";
const LIST = "src/components/blog/BlogListPage.tsx";
const ARTICLE = "src/components/blog/BlogArticlePage.tsx";
const SITEMAP = "src/app/sitemap-pages.xml/route.ts";
const SERVER = "src/lib/blog-server.ts";

const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

/** Longest shared word-window between two strings (for the uniqueness law). */
function longestSharedWindow(a: string, b: string, n: number): number {
  const wa = a.toLowerCase().split(/\s+/);
  const wb = b.toLowerCase().split(/\s+/);
  const setB = new Set<string>();
  for (let i = 0; i + n <= wb.length; i++) setB.add(wb.slice(i, i + n).join(" "));
  for (let len = 40; len >= n; len--) {
    for (let i = 0; i + len <= wa.length; i++) {
      if (setB.has(wa.slice(i, i + len).join(" "))) return len;
    }
  }
  return 0;
}

describe("blog category pages (P2-11 / §12.36)", () => {
  it("CONTENT: 10 categories × unique bilingual intros, MSA-clean Arabic", () => {
    const ids = Object.keys(BLOG_CATEGORY_CONTENT);
    expect(ids).toHaveLength(10);
    expect(ids).toContain("nutrition");
    expect(ids).toContain("wellness");
    for (const id of ids) {
      const c = BLOG_CATEGORY_CONTENT[id];
      expect(c.titleEn.length).toBeGreaterThan(3);
      expect(c.titleAr.length).toBeGreaterThan(3);
      // Substantial, honest intros (hub-depth, not thin filler).
      expect(c.introEn.split(/\s+/).length).toBeGreaterThanOrEqual(40);
      expect(c.introAr.split(/\s+/).length).toBeGreaterThanOrEqual(40);
      // MSA law: zero strong dialect markers in the Arabic intro.
      const scan = scanArabicDialect(c.introAr);
      expect(scan.strong).toBe(0);
    }
    // No shared 25-word block between any two categories (per language).
    const idsArr = Object.keys(BLOG_CATEGORY_CONTENT);
    for (let i = 0; i < idsArr.length; i++) {
      for (let j = i + 1; j < idsArr.length; j++) {
        const a = BLOG_CATEGORY_CONTENT[idsArr[i]];
        const b = BLOG_CATEGORY_CONTENT[idsArr[j]];
        expect(longestSharedWindow(a.introEn, b.introEn, 25)).toBe(0);
        expect(longestSharedWindow(a.introAr, b.introAr, 25)).toBe(0);
      }
    }
  });

  it("SURFACES: bilingual routes with static params, hreflang pairs, BreadcrumbList", () => {
    const en = readFileSync(ROUTE_EN, "utf8");
    const ar = readFileSync(ROUTE_AR, "utf8");
    for (const src of [en, ar]) {
      const s = stripComments(src);
      expect(src).toContain("generateStaticParams");
      expect(src).toContain("revalidate = 300");
      expect(src).toContain("listPublishedPostsByCategory");
      expect(src).toContain("getBreadcrumbSchema");
      expect(s).toContain("notFound()");
      // The DO-NOT law: no FAQPage schema on the new surfaces.
      expect(s).not.toContain("FAQPage");
      expect(s).not.toContain("aggregateRating");
    }
    // Full reciprocal hreflang pair.
    expect(en).toContain("ar: `${SITE_URL}/ar/blog/category/${categoryId}`");
    expect(ar).toContain("en: `${SITE_URL}/blog/category/${categoryId}`");
    // AR title law (eadb3e7): the /ar template appends the brand — the
    // AR metadata title carries none of its own.
    expect(ar).toContain("title: content.titleAr");
    expect(ar.match(/^  title: "(.*)",$/m)?.[1] ?? "").not.toContain("Alkemos");
    expect(en).toContain("| Alkemos Blog");
    // generateStaticParams covers the full category set.
    expect(en).toContain("Object.keys(BLOG_CATEGORY_CONTENT).map");
    expect(ar).toContain("Object.keys(BLOG_CATEGORY_CONTENT).map");
  });

  it("LINK GRAPH: server component + real link surfaces (chips, article chip, siblings)", () => {
    const comp = stripComments(readFileSync(COMPONENT, "utf8"));
    // Server component — the whole link graph renders in the first HTML.
    expect(readFileSync(COMPONENT, "utf8")).not.toContain('"use client"');
    // Category navigation is links; siblings are one hop away.
    expect(comp).toContain("BLOG_CATEGORIES.map");
    expect(comp).toContain("/category/${cat.id}");
    // Article cards link into the blog in the page's own language.
    expect(comp).toContain('href={isAr ? `/ar/blog/${post.slug}` : `/blog/${post.slug}`}');
    // Honest empty state.
    expect(comp).toContain("posts.length === 0");

    // The blog list chips are LINKS now — the client filter buttons are
    // gone (the crawlability fix this item exists for).
    const list = stripComments(readFileSync(LIST, "utf8"));
    expect(list).toContain("Link");
    expect(list).toContain("/category/${cat.id}");
    expect(list).not.toContain("setCategory");

    // The article page's category chip is a contextual link.
    const article = stripComments(readFileSync(ARTICLE, "utf8"));
    expect(article).toContain("/category/${post.category}");

    // Server data: category-filtered list, card fields only.
    const server = stripComments(readFileSync(SERVER, "utf8"));
    expect(server).toContain("listPublishedPostsByCategory");
    expect(server).toContain('.eq("category", categoryId)');
  });

  it("SITEMAP: the 20 category URLs are advertised with alternates", () => {
    const sitemap = readFileSync(SITEMAP, "utf8");
    expect(sitemap).toContain("BLOG_CATEGORY_CONTENT");
    expect(sitemap).toContain("`${base}/blog/category/${cat}`");
    expect(sitemap).toContain("`${base}/ar/blog/category/${cat}`");
    expect(sitemap).toContain(
      "alternates: { en: `${base}/blog/category/${cat}`, ar: `${base}/ar/blog/category/${cat}` }",
    );
  });
});
