import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { AHMED_ZAKE, getPersonSchema } from "../authors";

/**
 * Owner follow-up canary (2026-09-28 — two corrections on the completed
 * P2-11). Guarded contracts:
 *
 *   1. EXPERIENCE CORRECTION — the founder's totals are ~20 years of
 *      training, ~10 of them coaching ONLINE, stated in EVERY relevant
 *      surface (author registry bio+credential, about page EN/AR,
 *      coaching trust card EN/AR). Approximation must stay honest: no
 *      invented precision (no start years, no exact counts), and no
 *      leftover of the old under-claim ("10+ years" / "over a decade").
 *
 *   2. FACEBOOK FIX — the plain target="_blank" chips died in the owner's
 *      environment (in-app browsers kill the tab within a second; FB's
 *      logged-out mobile app-link bounce). The coaching PAGE now renders
 *      Facebook's OFFICIAL Page Plugin (real in-page preview + the real
 *      Follow button), click-to-load for privacy. The personal PROFILE
 *      cannot be embedded (Facebook plugin = Pages only) and stays a
 *      direct labeled link. Direct links remain on BOTH pages as the
 *      robust fallback.
 */

const ROOT = resolve(__dirname, "../..");
const STATIC_PAGES = resolve(ROOT, "lib/site-content/static-pages.ts");
const COACHING_PAGE = resolve(ROOT, "app/(en)/coaching/page.tsx");
const EN_AUTHOR_PAGE = resolve(ROOT, "app/(en)/authors/[slug]/page.tsx");
const AR_AUTHOR_PAGE = resolve(ROOT, "app/(ar)/ar/authors/[slug]/page.tsx");
const EMBED_COMPONENT = resolve(ROOT, "components/FacebookPageEmbed.tsx");

const ABOUT_SRC = readFileSync(STATIC_PAGES, "utf8");
const COACHING_SRC = readFileSync(COACHING_PAGE, "utf8");
const EN_PAGE_SRC = readFileSync(EN_AUTHOR_PAGE, "utf8");
const AR_PAGE_SRC = readFileSync(AR_AUTHOR_PAGE, "utf8");
const EMBED_SRC = readFileSync(EMBED_COMPONENT, "utf8");

const NEW_EN = "about twenty years of training experience";
const NEW_EN_ONLINE = "around ten of them coaching";
const NEW_AR_TOTAL = "عشرين عامًا";
const NEW_AR_ONLINE = "نحو عشر سنوات منها في تدريب العملاء أونلاين";

const OLD_CLAIMS = [
  "over a decade",
  "over ten years",
  "10+ years coaching experience",
  "تتجاوز عشر سنوات",
  "تتجاوز العشر سنوات",
  "أكثر من 10 سنوات خبرة تدريب",
];

describe("Owner follow-up 1 — founder experience: ~20 years total, ~10 online", () => {
  it("the author registry bio + credential line state the corrected totals (EN + AR)", () => {
    expect(AHMED_ZAKE.bioEn).toContain(NEW_EN);
    expect(AHMED_ZAKE.bioEn).toContain(NEW_EN_ONLINE);
    expect(AHMED_ZAKE.bioAr).toContain(NEW_AR_TOTAL);
    expect(AHMED_ZAKE.bioAr).toContain(NEW_AR_ONLINE);

    const experienceCred = AHMED_ZAKE.credentials.find((c) =>
      /training experience/i.test(c.en),
    );
    expect(experienceCred?.en).toBe(
      "About 20 years of training experience, about 10 of them coaching online",
    );
    expect(experienceCred?.ar).toBe(
      "نحو 20 سنة من الخبرة التدريبية، منها نحو 10 سنوات تدريب أونلاين",
    );
  });

  it("the about page (EN + AR) founder section states the corrected totals", () => {
    expect(ABOUT_SRC).toContain(NEW_EN);
    expect(ABOUT_SRC).toContain(NEW_EN_ONLINE);
    expect(ABOUT_SRC).toContain(NEW_AR_TOTAL);
    expect(ABOUT_SRC).toContain(NEW_AR_ONLINE);
  });

  it("the coaching trust card (EN + AR mirror via re-export) states the corrected totals", () => {
    expect(COACHING_SRC).toContain("بخبرة تدريبية تناهز عشرين عامًا");
    expect(COACHING_SRC).toContain(NEW_EN);
  });

  it("Person JSON-LD description + hasCredential carry the corrected totals", () => {
    const person = getPersonSchema(AHMED_ZAKE) as Record<string, unknown>;
    expect(person.description).toContain(NEW_EN);
    const hasCredential = person.hasCredential as string[];
    expect(
      hasCredential.some((c) => c.includes("About 20 years of training experience")),
    ).toBe(true);
  });

  it("no surface carries the old under-claim anymore", () => {
    const surfaces: Array<[string, string]> = [
      ["authors.ts EN bio", AHMED_ZAKE.bioEn],
      ["authors.ts AR bio", AHMED_ZAKE.bioAr],
      ["static-pages.ts", ABOUT_SRC],
      ["coaching/page.tsx", COACHING_SRC],
    ];
    for (const [name, src] of surfaces) {
      for (const claim of OLD_CLAIMS) {
        expect(src, `${name} still carries the old claim: ${claim}`).not.toContain(claim);
      }
    }
  });

  it("approximation stays honest — no invented precision (start years / exact counts)", () => {
    const sources = [AHMED_ZAKE.bioEn, AHMED_ZAKE.bioAr, ABOUT_SRC, COACHING_SRC];
    for (const src of sources) {
      // "since 2005"-style start years or "منذ عام ٢٠٠٥" style anchors
      // would invent precision the owner never gave.
      expect(src).not.toMatch(/since 20\d{2}/i);
      expect(src).not.toMatch(/منذ عام (19|20)\d{2}/);
      expect(src).not.toMatch(/exactly (twenty|عشرين)/i);
    }
  });
});

describe("Owner follow-up 2 — Facebook: official Page Plugin embed + labeled direct links", () => {
  it("facebookPageEmbeds ⊆ sameAs and contains only Facebook PAGE urls", () => {
    const embeds = AHMED_ZAKE.facebookPageEmbeds ?? [];
    expect(embeds.length).toBeGreaterThan(0);
    for (const url of embeds) {
      expect(AHMED_ZAKE.sameAs).toContain(url);
      expect(url).toMatch(/^https:\/\/www\.facebook\.com\/[^/]+\/$/);
      // profile.php / people/ URLs are NOT plugin-embeddable pages
      expect(url).not.toMatch(/profile\.php|\/people\//);
    }
  });

  it("the coaching page is embeddable; the personal profile is NOT (Facebook plugin = Pages only)", () => {
    expect(AHMED_ZAKE.facebookPageEmbeds).toContain("https://www.facebook.com/AhmedZakePT/");
    expect(AHMED_ZAKE.facebookPageEmbeds).not.toContain("https://www.facebook.com/SpEeRr/");
  });

  it("sameAsLabels keys are exact sameAs URLs with bilingual values", () => {
    const labels = AHMED_ZAKE.sameAsLabels ?? {};
    for (const url of Object.keys(labels)) {
      expect(AHMED_ZAKE.sameAs).toContain(url);
      expect(labels[url].en.length).toBeGreaterThan(0);
      expect(labels[url].ar.length).toBeGreaterThan(0);
    }
    expect(labels["https://www.facebook.com/AhmedZakePT/"]).toEqual({
      en: "Coaching page",
      ar: "صفحة التدريب",
    });
    expect(labels["https://www.facebook.com/SpEeRr/"]).toEqual({
      en: "Personal profile",
      ar: "الملف الشخصي",
    });
  });

  it("the embed component is Facebook's official Page Plugin, click-to-load, with a direct-link fallback", () => {
    expect(existsSync(EMBED_COMPONENT), "FacebookPageEmbed.tsx missing").toBe(true);
    // official plugin endpoint with the href URL-encoded
    expect(EMBED_SRC).toContain("https://www.facebook.com/plugins/page.php");
    expect(EMBED_SRC).toContain("encodeURIComponent(pageUrl)");
    expect(EMBED_SRC).toContain("tabs=timeline");
    // privacy: nothing loads from Facebook until the visitor clicks —
    // the iframe must NOT be in the initial (default-false) render.
    expect(EMBED_SRC).toContain('useState(false)');
    expect(EMBED_SRC).toContain("{!show ? (");
    expect(EMBED_SRC).toContain("setShow(true)");
    // the iframe itself only exists inside the expanded branch
    expect(EMBED_SRC).toContain("<iframe");
    // robust fallback: the direct link is rendered OUTSIDE the !show branch
    expect(EMBED_SRC).toContain('rel="noopener noreferrer me"');
    expect(EMBED_SRC).toContain("Open on Facebook");
    expect(EMBED_SRC).toContain("افتح على فيسبوك");
  });

  it("both EN and AR author pages render the embed + labeled chips", () => {
    for (const [name, src] of [
      ["EN", EN_PAGE_SRC],
      ["AR", AR_PAGE_SRC],
    ] as const) {
      expect(src, `${name} page lost the embed`).toContain("FacebookPageEmbed");
      expect(src, `${name} page lost the direct chips`).toContain("target=\"_blank\"");
      expect(src, `${name} page lost the handle display`).toContain("handle");
    }
    expect(EN_PAGE_SRC).toContain('lang="en"');
    expect(AR_PAGE_SRC).toContain('lang="ar"');
  });

  it("sameAs itself is untouched — exactly the two owner-verified profiles", () => {
    expect(AHMED_ZAKE.sameAs).toEqual([
      "https://www.facebook.com/AhmedZakePT/",
      "https://www.facebook.com/SpEeRr/",
    ]);
    const person = getPersonSchema(AHMED_ZAKE) as Record<string, unknown>;
    expect(person.sameAs).toEqual(AHMED_ZAKE.sameAs);
  });
});
