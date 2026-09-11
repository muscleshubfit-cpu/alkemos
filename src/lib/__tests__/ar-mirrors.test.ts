import { describe, it, expect } from "vitest";
import { GET as pagesSitemapGET } from "@/app/sitemap-pages.xml/route";
import { metadata as arEvoMetadata } from "@/app/ar/evo/layout";
import { metadata as arCoachingMetadata } from "@/app/ar/coaching/layout";
import { metadata as enEvoMetadata } from "@/app/evo/layout";
import { metadata as enCoachingMetadata } from "@/app/coaching/layout";

/**
 * Phase SEO-GEO-6.4 canaries (§12.23) — P1-9 Arabic mirrors for /evo and
 * /coaching, the last language-engineering gap:
 *   1. The AR route modules exist (imports above would fail otherwise).
 *   2. Sitemap-pages carries all four URLs with hreflang alternates.
 *   3. Both AR layouts declare canonical + full en/ar/x-default pairs.
 *   4. The EN layouts now declare the AR mirror in their hreflang.
 *   5. AR titles stay in the Arabic title budget (~70 chars — the same
 *      clamp law as blog titles, P0-3).
 */

describe("AR mirrors for /evo + /coaching (SEO-GEO-6.4 §12.23)", () => {
  it("sitemap-pages exposes all four URLs with hreflang alternates", async () => {
    const res = await pagesSitemapGET();
    expect(res.status).toBe(200);
    const xml = await res.text();

    for (const loc of [
      "https://alkemos.com/evo",
      "https://alkemos.com/ar/evo",
      "https://alkemos.com/coaching",
      "https://alkemos.com/ar/coaching",
    ]) {
      expect(xml, `sitemap must contain ${loc}`).toContain(`<loc>${loc}</loc>`);
    }

    // hreflang xhtml:link pairs on the evo block
    expect(xml).toMatch(
      /<url>\s*<loc>https:\/\/alkemos\.com\/evo<\/loc>[\s\S]*?hreflang="ar"\s+href="https:\/\/alkemos\.com\/ar\/evo"[\s\S]*?<\/url>/,
    );
    expect(xml).toMatch(
      /<url>\s*<loc>https:\/\/alkemos\.com\/ar\/evo<\/loc>[\s\S]*?hreflang="en"\s+href="https:\/\/alkemos\.com\/evo"[\s\S]*?<\/url>/,
    );
    expect(xml).toMatch(
      /<url>\s*<loc>https:\/\/alkemos\.com\/coaching<\/loc>[\s\S]*?hreflang="ar"\s+href="https:\/\/alkemos\.com\/ar\/coaching"[\s\S]*?<\/url>/,
    );
    expect(xml).toMatch(
      /<url>\s*<loc>https:\/\/alkemos\.com\/ar\/coaching<\/loc>[\s\S]*?hreflang="en"\s+href="https:\/\/alkemos\.com\/coaching"[\s\S]*?<\/url>/,
    );
  });

  it("AR /evo layout: canonical + full hreflang + Arabic title within budget", () => {
    expect(arEvoMetadata.alternates?.canonical).toBe("https://alkemos.com/ar/evo");
    expect(arEvoMetadata.alternates?.languages).toEqual({
      en: "https://alkemos.com/evo",
      ar: "https://alkemos.com/ar/evo",
      "x-default": "https://alkemos.com/evo",
    });
    const title = arEvoMetadata.title as string;
    expect(title).toMatch(/[\u0600-\u06FF]/);
    expect(title.length).toBeLessThanOrEqual(70);
    expect(title.endsWith("Alkemos")).toBe(true);
    expect((arEvoMetadata.openGraph?.locale as string) || "").toBe("ar_EG");
  });

  it("AR /coaching layout: canonical + full hreflang + Arabic title within budget", () => {
    expect(arCoachingMetadata.alternates?.canonical).toBe(
      "https://alkemos.com/ar/coaching",
    );
    expect(arCoachingMetadata.alternates?.languages).toEqual({
      en: "https://alkemos.com/coaching",
      ar: "https://alkemos.com/ar/coaching",
      "x-default": "https://alkemos.com/coaching",
    });
    const title = arCoachingMetadata.title as string;
    expect(title).toMatch(/[\u0600-\u06FF]/);
    expect(title.length).toBeLessThanOrEqual(70);
    expect(title.endsWith("Alkemos")).toBe(true);
    expect((arCoachingMetadata.openGraph?.locale as string) || "").toBe("ar_EG");
  });

  it("EN layouts now declare the AR mirror in hreflang (no more EN-only pair)", () => {
    expect(enEvoMetadata.alternates?.languages).toEqual({
      en: "https://alkemos.com/evo",
      ar: "https://alkemos.com/ar/evo",
      "x-default": "https://alkemos.com/evo",
    });
    expect(enCoachingMetadata.alternates?.languages).toEqual({
      en: "https://alkemos.com/coaching",
      ar: "https://alkemos.com/ar/coaching",
      "x-default": "https://alkemos.com/coaching",
    });
  });
});
