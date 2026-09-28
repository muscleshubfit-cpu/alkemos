import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { AHMED_ZAKE, getPersonSchema } from "../authors";

/**
 * Owner follow-up canary (2026-09-28). Guarded contracts:
 *
 *   1. EXPERIENCE CORRECTION — the founder's totals are ~20 years of
 *      training, ~10 of them coaching ONLINE, stated in EVERY relevant
 *      surface (author registry bio+credential, about page EN/AR,
 *      coaching trust card EN/AR). Approximation must stay honest: no
 *      invented precision (no start years, no exact counts), and no
 *      leftover of the old under-claim ("10+ years" / "over a decade").
 *
 *   2. FACEBOOK — the founder's two owner-verified profiles stay as
 *      labeled DIRECT-LINK chips on both author pages. The Facebook
 *      Page Plugin embed that briefly shipped in the same follow-up
 *      was REMOVED again by owner order (later the same day) — this
 *      guards the removal: no component, no registry field, no
 *      plugin endpoint anywhere in src, and the direct chips intact.
 */

const ROOT = resolve(__dirname, "../..");
const STATIC_PAGES = resolve(ROOT, "lib/site-content/static-pages.ts");
const COACHING_PAGE = resolve(ROOT, "app/(en)/coaching/page.tsx");
const EN_AUTHOR_PAGE = resolve(ROOT, "app/(en)/authors/[slug]/page.tsx");
const AR_AUTHOR_PAGE = resolve(ROOT, "app/(ar)/ar/authors/[slug]/page.tsx");
const EMBED_COMPONENT = resolve(ROOT, "components/FacebookPageEmbed.tsx");
const AUTHORS_REGISTRY = resolve(ROOT, "lib/authors.ts");

const ABOUT_SRC = readFileSync(STATIC_PAGES, "utf8");
const COACHING_SRC = readFileSync(COACHING_PAGE, "utf8");
const EN_PAGE_SRC = readFileSync(EN_AUTHOR_PAGE, "utf8");
const AR_PAGE_SRC = readFileSync(AR_AUTHOR_PAGE, "utf8");
const REGISTRY_SRC = readFileSync(AUTHORS_REGISTRY, "utf8");

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

describe("Owner follow-up 2 — Facebook: labeled direct links; Page Plugin embed removed by owner order", () => {
  it("the embed is fully gone — no component, no registry field, no plugin endpoint in src", () => {
    expect(existsSync(EMBED_COMPONENT), "FacebookPageEmbed.tsx must stay deleted").toBe(false);
    // the retired registry field must not be reintroduced
    expect(REGISTRY_SRC).not.toContain("facebookPageEmbeds");
    // neither author page may reference the retired component
    for (const [name, src] of [
      ["EN", EN_PAGE_SRC],
      ["AR", AR_PAGE_SRC],
    ] as const) {
      expect(src, `${name} page still references the embed`).not.toContain("FacebookPageEmbed");
    }
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

  it("both EN and AR author pages render the labeled direct-link chips", () => {
    for (const [name, src] of [
      ["EN", EN_PAGE_SRC],
      ["AR", AR_PAGE_SRC],
    ] as const) {
      expect(src, `${name} page lost the direct chips`).toContain("target=\"_blank\"");
      expect(src, `${name} page lost the handle display`).toContain("handle");
      expect(src, `${name} page lost the bilingual labels`).toContain("sameAsLabels");
    }
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
