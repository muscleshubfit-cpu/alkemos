import { describe, it, expect, vi } from "vitest";
import { buildRss } from "@/lib/rss";
import type { BlogFeedItem } from "@/lib/blog-server";

/**
 * Phase SEO-GEO-6.2 (§12.19 P0-2) — Arabic RSS link law.
 *
 * The live audit (2026-09-11) found all 39 /ar/rss.xml item links pointing
 * at the ENGLISH /blog/ tree — Arabic subscribers landed on EN pages.
 * These tests pin the locale-aware link construction.
 */
vi.mock("@/lib/blog-server", () => ({
  listPublishedPostsForFeed: vi.fn(async (lang: "en" | "ar"): Promise<BlogFeedItem[]> => [
    {
      title: lang === "ar" ? "كم بروتين تحتاج يوميا؟" : "How much protein do you need?",
      slug: lang === "ar" ? "protein-daily-arabic" : "protein-daily-guide",
      excerpt: "short excerpt",
      meta_description: null,
      category: "nutrition",
      featured_image: null,
      published_at: "2026-09-10T00:00:00Z",
      updated_at: "2026-09-10T00:00:00Z",
    },
  ]),
}));

describe("buildRss AR item links (SEO-GEO-6.2)", () => {
  it("links Arabic feed items to /ar/blog/ URLs (not /blog/)", async () => {
    const xml = await buildRss({
      title: "مدونة Alkemos",
      link: "https://alkemos.com/ar/blog",
      description: "مقالات",
      language: "ar",
      selfUrl: "https://alkemos.com/ar/rss.xml",
      lang: "ar",
    });
    expect(xml).toContain("<link>https://alkemos.com/ar/blog/protein-daily-arabic</link>");
    expect(xml).not.toContain("<link>https://alkemos.com/blog/protein-daily-arabic</link>");
  });

  it("keeps English feed items on /blog/ URLs", async () => {
    const xml = await buildRss({
      title: "Alkemos Blog",
      link: "https://alkemos.com/blog",
      description: "Articles",
      language: "en",
      selfUrl: "https://alkemos.com/rss.xml",
      lang: "en",
    });
    expect(xml).toContain("<link>https://alkemos.com/blog/protein-daily-guide</link>");
    expect(xml).not.toContain("/ar/blog/protein-daily-guide");
  });

  it("guid isPermaLink matches the item link in both languages", async () => {
    for (const lang of ["ar", "en"] as const) {
      const xml = await buildRss({
        title: lang === "ar" ? "مدونة" : "Blog",
        link: `https://alkemos.com${lang === "ar" ? "/ar/blog" : "/blog"}`,
        description: "d",
        language: lang,
        selfUrl: `https://alkemos.com${lang === "ar" ? "/ar" : ""}/rss.xml`,
        lang,
      });
      const link = xml.match(/<link>(.*?)<\/link>/g)?.[1] ?? "";
      const guid = xml.match(/<guid[^>]*>(.*?)<\/guid>/)?.[1] ?? "";
      expect(guid).toBe(link.replace(/<\/?link>/g, ""));
    }
  });
});
