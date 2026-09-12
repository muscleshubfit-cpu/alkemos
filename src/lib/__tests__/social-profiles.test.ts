import { describe, it, expect } from "vitest";
import { SOCIAL_PROFILES, SOCIAL_PROFILE_URLS } from "@/lib/social";
import { getOrganizationSchema } from "@/lib/seo";

/**
 * Phase SEO-GEO-4.6 — entity attribution canaries.
 *
 * The owner created the brand's real profiles (master plan §12.10 entity
 * building) and supplied the URLs in 2026-09-09. These tests pin:
 *   - exactly the owned profiles (Trustpilot · Product Hunt · Facebook ·
 *     Instagram · X + LinkedIn since §12.21/SEO-GEO-6.2) — nothing fake,
 *     nothing missing
 *   - every URL is canonical: https, no query strings / trackers
 *     (the FB share link MUST stay resolved to the /people/… form)
 *   - Organization.sameAs carries the site + all profiles — the
 *     Knowledge Graph entity link that disambiguates Alkemos from the
 *     Alkimos suburb (master plan §2.3)
 */

describe("social profiles (SEO-GEO-4.6 entity attribution)", () => {
  it("has exactly the six owned profiles, in icon-row order", () => {
    expect(SOCIAL_PROFILES.map((p) => p.name)).toEqual([
      "facebook",
      "instagram",
      "x",
      "linkedin",
      "trustpilot",
      "producthunt",
    ]);
  });

  it("every URL is https with no query strings or tracking params", () => {
    for (const p of SOCIAL_PROFILES) {
      expect(p.url.startsWith("https://"), p.url).toBe(true);
      expect(p.url, `no query string: ${p.url}`).not.toContain("?");
      expect(p.url, `no share links: ${p.url}`).not.toContain("/share/");
    }
  });

  it("Facebook URL is the canonical /people/Alkemos/61593989587279 form", () => {
    const fb = SOCIAL_PROFILES.find((p) => p.name === "facebook");
    expect(fb?.url).toBe(
      "https://www.facebook.com/people/Alkemos/61593989587279/",
    );
  });

  it("LinkedIn URL is the canonical /in/ form with utm share params stripped", () => {
    const li = SOCIAL_PROFILES.find((p) => p.name === "linkedin");
    expect(li?.url).toBe(
      "https://www.linkedin.com/in/alke-mos-29a751435",
    );
  });

  it("profiles are bilingual-labeled (AR labels contain Arabic script)", () => {
    const hasArabic = (s: string) => /[\u0600-\u06FF]/.test(s);
    for (const p of SOCIAL_PROFILES) {
      expect(p.labelEn.length).toBeGreaterThan(0);
      expect(hasArabic(p.labelAr), `${p.name} labelAr`).toBe(true);
    }
  });

  it("Organization.sameAs = site + all six profile URLs (no dupes)", () => {
    // §12.40: locale param is required now — sameAs is locale-independent
    // (same six profiles either way).
    const schema = getOrganizationSchema("ar");
    expect(schema["@type"]).toBe("Organization");
    const sameAs = schema.sameAs as string[];
    expect(sameAs[0]).toBe("https://alkemos.com");
    expect(sameAs.slice(1)).toEqual([...SOCIAL_PROFILE_URLS]);
    expect(new Set(sameAs).size).toBe(sameAs.length);
  });
});
