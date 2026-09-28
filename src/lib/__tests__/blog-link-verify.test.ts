/**
 * blog-link-verify.test.ts — AUDIT_REPORT §9-المرحلة 2, item 2
 * (2026-09-29): the citation LINK VERIFICATION GATE
 * (src/lib/blog-link-verify.ts) — the deterministic HEAD-request check
 * behind the honest-citation policy.
 *
 * All network access is stubbed via the injectable fetchImpl — these
 * tests are pure and never touch the real network.
 */
import { describe, expect, it } from "vitest";
import {
  verifyBodyLinks,
  collectExternalLinks,
  LINK_VERIFY_MAX_URLS,
} from "@/lib/blog-link-verify";

/** Build a stub fetch: `map` url → status; anything else → network error. */
function stubFetch(map: Record<string, number | "error">) {
  return async (url: string) => {
    const v = map[url];
    if (v === "error") throw new Error("network down");
    return { status: v ?? 200 } as Response;
  };
}

const WHO = "https://www.who.int/news-room/fact-sheets/healthy-diet";
const DEAD = "https://www.who.int/hallucinated-page-that-never-existed";
const SITE = "https://alkemos.com/blog/some-post";

describe("collectExternalLinks", () => {
  it("collects external anchor links only (images, internal, relative excluded)", () => {
    const md = `[WHO diet](${WHO}) and [internal](${SITE}) and ![image](https://images.pexels.com/photo.jpg) and [tool](/tools/calorie-calculator)`;
    expect(collectExternalLinks(md)).toEqual([WHO]);
  });

  it("deduplicates repeated URLs", () => {
    const md = `[a](${WHO}) [b](${WHO})`;
    expect(collectExternalLinks(md)).toEqual([WHO]);
  });
});

describe("verifyBodyLinks — verdict policy", () => {
  it("REMOVES a confirmed-dead (404) citation and keeps the anchor text", async () => {
    const md = `Studies support this ${`[WHO guidance](${DEAD})`} within the paragraph.`;
    const res = await verifyBodyLinks(md, { fetchImpl: stubFetch({ [DEAD]: 404 }) });
    expect(res.dead).toEqual([DEAD]);
    expect(res.md).toContain("WHO guidance");
    expect(res.md).not.toContain(DEAD);
    expect(res.md).not.toContain("](");
  });

  it("KEEPS a 410-gone-confirmed link removal but treats 403/405/429 as unverified (fail-open)", async () => {
    for (const status of [403, 405, 429, 500]) {
      const md = `[cite](${DEAD})`;
      const res = await verifyBodyLinks(md, { fetchImpl: stubFetch({ [DEAD]: status }) });
      expect(res.dead).toEqual([]);
      expect(res.unverified).toEqual([DEAD]);
      expect(res.md).toBe(md); // untouched
    }
  });

  it("removes 410 (gone) like 404", async () => {
    const md = `[cite](${DEAD})`;
    const res = await verifyBodyLinks(md, { fetchImpl: stubFetch({ [DEAD]: 410 }) });
    expect(res.dead).toEqual([DEAD]);
    expect(res.md).toBe("cite");
  });

  it("retries once on transport failure and keeps the link if it stays uncertain", async () => {
    let calls = 0;
    const fetchImpl = async () => {
      calls += 1;
      throw new Error("timeout");
    };
    const md = `[cite](${WHO})`;
    const res = await verifyBodyLinks(md, { fetchImpl });
    expect(calls).toBe(2); // one retry
    expect(res.unverified).toEqual([WHO]);
    expect(res.md).toBe(md);
  });

  it("follows redirects (3xx = ok) and keeps the link", async () => {
    const md = `[cite](${WHO})`;
    const res = await verifyBodyLinks(md, { fetchImpl: stubFetch({ [WHO]: 301 }) });
    expect(res.dead).toEqual([]);
    expect(res.checked).toEqual([WHO]);
  });
});

describe("verifyBodyLinks — budget guards", () => {
  it("caps the checked URLs (beyond the cap: kept + reported as skipped)", async () => {
    const urls = Array.from(
      { length: LINK_VERIFY_MAX_URLS + 3 },
      (_, i) => `https://example.com/page-${i}`,
    );
    const md = urls.map((u) => `[x](${u})`).join(" ");
    const res = await verifyBodyLinks(md, {
      fetchImpl: stubFetch({}),
      maxUrls: 2,
    });
    expect(res.checked.length).toBe(2);
    expect(res.skipped.length).toBe(urls.length - 2);
    expect(res.md).toBe(md); // nothing removed
  });
});
