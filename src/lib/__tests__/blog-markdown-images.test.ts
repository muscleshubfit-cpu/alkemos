/**
 * renderMarkdown BODY IMAGE regression test (owner bug 2026-08-28):
 * body images written as markdown `![alt](url)` by embedBodyImages /
 * embed-backfill rendered as BARE TEXT LINKS because renderMarkdown had
 * no image rule — the link regex consumed "[alt](url)" and left the "!".
 * The image rule MUST convert ![alt](url) → <img> BEFORE the link rule.
 */
import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../blog";

describe("renderMarkdown body images", () => {
  it("renders ![alt](url) as an <img>, not a text link", () => {
    const md =
      "## Section One\n\nSome intro text.\n\n![dumbbell rack in modern gym](https://image.pollinations.ai/prompt/dumbbell%20rack?width=1024&height=576&nologo=true&seed=1&model=flux)\n\nMore text.";
    const html = renderMarkdown(md);
    expect(html).toMatch(/<img\s+src="https:\/\/image\.pollinations\.ai/);
    expect(html).not.toMatch(/!\[/);
    // must NOT degrade to a text link for the image URL
    expect(html).not.toMatch(/<a [^>]*href="https:\/\/image\.pollinations\.ai/);
  });

  it("renders multiple body images independently", () => {
    const md =
      "![first image](https://example.com/a.jpg)\n\ntext\n\n![second image](https://example.com/b.jpg)";
    const html = renderMarkdown(md);
    expect(html.match(/<img\s/g)?.length).toBe(2);
  });

  it("strips unsafe-scheme images entirely (XSS guard)", () => {
    const md = "![evil](javascript:alert(1))";
    const html = renderMarkdown(md);
    expect(html).not.toMatch(/<img/);
    expect(html).not.toMatch(/javascript:/);
  });

  it("still renders regular links after the image rule ran", () => {
    const md = "see [the docs](https://example.com/docs) for more";
    const html = renderMarkdown(md);
    expect(html).toMatch(/<a href="https:\/\/example\.com\/docs"/);
    expect(html).not.toMatch(/<img/);
  });

  // P2-13 (§12.38 — plan item 13 «صور المدونة: width/height إلزامي (CLS)»):
  // Pexels body images resize at render time (Phase-139 params) AND carry
  // explicit width/height so the browser reserves the 2:1 box before load.
  it("Pexels body images: render-time resize + explicit width/height (CLS law)", () => {
    const md =
      "![gym scene](https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg?auto=compress&cs=tinysrgb&w=1200)";
    const html = renderMarkdown(md);
    const img = html.match(/<img [^>]*>/)?.[0] ?? "";
    // §12.38 follow-up: the escaped &amp; round-trips cleanly — no junk
    // %3B params, original CDN params preserved, & properly re-escaped.
    expect(img).toContain("src=\"https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg?auto=compress&amp;cs=tinysrgb&amp;w=896&amp;h=448&amp;fit=crop&amp;fm=webp\"");
    expect(img).toContain("w=896");
    expect(img).toContain("h=448");
    expect(img).toContain("fit=crop");
    expect(img).toContain("fm=webp");
    expect(img).toContain('width="896"');
    expect(img).toContain('height="448"');
    expect(img).toContain('loading="lazy"');
    expect(img).toContain("h-auto");
  });

  it("non-Pexels body images pass through WITHOUT invented dimensions", () => {
    const md = "![chart](https://example.com/chart.png)";
    const html = renderMarkdown(md);
    const img = html.match(/<img [^>]*>/)?.[0] ?? "";
    expect(img).toContain('src="https://example.com/chart.png"');
    expect(img).not.toContain("width=");
    expect(img).not.toContain("height=");
    expect(img).toContain('loading="lazy"');
  });
});
