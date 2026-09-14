import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { COMPARISONS } from "@/lib/comparisons";

/**
 * Competitor official-link law (owner directive, 2026-09-14).
 *
 * Every comparison detail page (/compare/[slug] + /ar/compare/[slug])
 * renders exactly ONE visible external link — the competitor's verified
 * OFFICIAL homepage, labeled "Official Website" (EN) / "الموقع الرسمي"
 * (AR). Owner rules enforced here:
 *   - official sites ONLY — never reviews, guides, Wikipedia, affiliate
 *     or intermediary sources
 *   - HTTPS absolute URLs, no tracking/affiliate/share params
 *   - no duplicate external links for the same competitor on one page
 *   - domains pinned to the ones verified live on 2026-09-14
 *
 * Both page renderers read competitorUrl from this data module, so the
 * data-layer law below covers EN + AR rendering; the renderer rule at
 * the bottom pins the single-anchor contract in both page files.
 */

/** Domains verified as the competitors' official homes (2026-09-14):
 *  - www.myfitnesspal.com → HTTP 200 (official brand site)
 *  - www.freeletics.com   → HTTP 200 (302 → /en/, same origin; official)
 *  - exrx.net             → live ("ExRx.net : Home"; Cloudflare bot-guards
 *                           scripted clients — browsers pass the challenge)
 */
const VERIFIED_OFFICIAL: Record<string, string> = {
  "alkemos-vs-myfitnesspal": "https://www.myfitnesspal.com",
  "alkemos-vs-freeletics": "https://www.freeletics.com",
  "alkemos-vs-exrx": "https://exrx.net",
};

/** Intermediary / review / UGC / app-store hosts that must never be
 *  linked as a competitor's "official website". */
const NON_OFFICIAL_HOSTS = [
  "wikipedia.org",
  "reddit.com",
  "youtube.com",
  "trustpilot.com",
  "play.google.com",
  "apps.apple.com",
  "facebook.com",
  "instagram.com",
  "x.com",
  "twitter.com",
  "linktr.ee",
  "medium.com",
  "wordpress.com",
  "blogspot.",
  "amazon.",
  "g2.com",
  "capterra.com",
  "forbes.com",
  "healthline.com",
  "verywellfit.com",
  "garagegymreviews.com",
  "breakingmuscle.com",
];

describe("comparison competitor official links (owner directive 2026-09-14)", () => {
  it("every comparison carries a competitorUrl", () => {
    for (const c of COMPARISONS) {
      expect(c.competitorUrl, c.slug).toBeTruthy();
    }
  });

  it("every competitorUrl is an absolute HTTPS URL", () => {
    for (const c of COMPARISONS) {
      expect(
        c.competitorUrl.startsWith("https://"),
        `${c.slug}: ${c.competitorUrl}`,
      ).toBe(true);
      expect(() => new URL(c.competitorUrl), c.slug).not.toThrow();
    }
  });

  it("no tracking, affiliate or share params in competitor URLs", () => {
    for (const c of COMPARISONS) {
      const u = new URL(c.competitorUrl);
      expect([...u.searchParams.keys()], `${c.slug} query params`).toEqual([]);
      expect(c.competitorUrl.toLowerCase(), c.slug).not.toMatch(
        /utm_|ref=|aff=|tag=|\/share\//,
      );
    }
  });

  it("no intermediary / review / UGC hosts — official sites only", () => {
    for (const c of COMPARISONS) {
      const host = new URL(c.competitorUrl).hostname;
      for (const bad of NON_OFFICIAL_HOSTS) {
        expect(host, `${c.slug} → ${host}`).not.toContain(bad);
      }
    }
  });

  it("verified official domains stay pinned (verified live 2026-09-14)", () => {
    for (const [slug, url] of Object.entries(VERIFIED_OFFICIAL)) {
      const c = COMPARISONS.find((x) => x.slug === slug);
      expect(c, slug).toBeTruthy();
      expect(c!.competitorUrl, slug).toBe(url);
    }
    // every current comparison is covered by the verified map — a new
    // entry must be verified and added here before it ships
    expect(Object.keys(VERIFIED_OFFICIAL).length).toBe(COMPARISONS.length);
  });

  it("slugs are unique — one page (and thus one official link) per competitor", () => {
    expect(new Set(COMPARISONS.map((c) => c.slug)).size).toBe(
      COMPARISONS.length,
    );
  });

  it("each detail-page renderer emits exactly ONE external anchor per page", () => {
    // Guard against duplicate external links on the same page: the EN and
    // AR renderers must reference comparison.competitorUrl in a visible
    // href exactly once (the ItemList JSON-LD usage is a `url:` prop, not
    // an href, and does not count).
    for (const file of [
      "src/app/compare/[slug]/page.tsx",
      "src/app/ar/compare/[slug]/page.tsx",
    ]) {
      const src = readFileSync(file, "utf8");
      const anchors = src.match(/href=\{comparison\.competitorUrl\}/g) ?? [];
      expect(anchors.length, file).toBe(1);
      // external anchor hygiene: new tab + noopener, never next/link
      expect(src).toContain('target="_blank"');
      expect(src).toContain('rel="noopener noreferrer"');
      expect(src).not.toMatch(/<Link\s+href=\{comparison\.competitorUrl\}/);
    }
  });

  it("official-link labels are localized on both renderers", () => {
    expect(readFileSync("src/app/compare/[slug]/page.tsx", "utf8")).toContain(
      "Official Website",
    );
    expect(readFileSync("src/app/ar/compare/[slug]/page.tsx", "utf8")).toContain(
      "الموقع الرسمي",
    );
  });
});
