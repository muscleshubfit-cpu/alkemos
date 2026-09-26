import { describe, it, expect } from "vitest";
import {
  applySiteTokens,
  pickFaqOverride,
  pickFaqPageOverride,
  pickStaticPageOverride,
  pickTextOverride,
} from "@/lib/site-content/core";
import {
  HOME_COPY_GROUPS,
  HOME_FAQ_DEFAULT,
  HOME_TEXT_FIELDS,
  resolveHomeCopy,
  resolveHomeFaq,
} from "@/lib/site-content/home";
import {
  FAQ_PAGE_DEFAULT,
  STATIC_PAGE_DEFAULTS,
  resolveFaqPage,
  resolveStaticPage,
} from "@/lib/site-content/static-pages";
import { FAQS_EN, FAQS_AR } from "@/lib/faq-content";

/**
 * SITE-CONTENT-281 — the fallback-law suite. The whole content system
 * rests on one invariant: a VALID override wins, EVERYTHING else falls
 * back to the code default, and no input can crash the page or blank
 * it. These tests pin that invariant at the resolver level (the same
 * functions the public routes and the admin editor ride).
 */

describe("SITE-CONTENT-281 — override validators (the fallback law's teeth)", () => {
  it("a non-empty string override wins; empty/whitespace/wrong-type never do", () => {
    expect(pickTextOverride("Hello")).toBe("Hello");
    expect(pickTextOverride("  spaced  ")).toBe("  spaced  ");
    expect(pickTextOverride("")).toBeNull();
    expect(pickTextOverride("   ")).toBeNull();
    expect(pickTextOverride(null)).toBeNull();
    expect(pickTextOverride(undefined)).toBeNull();
    expect(pickTextOverride(42)).toBeNull();
    expect(pickTextOverride({ en: "x" })).toBeNull();
  });

  it("a FAQ override must be an array of well-formed Q/A pairs", () => {
    expect(pickFaqOverride([{ q: "س", a: "ج" }])).toEqual([{ q: "س", a: "ج" }]);
    expect(pickFaqOverride([])).toBeNull();
    expect(pickFaqOverride([{ q: "", a: "x" }])).toBeNull();
    expect(pickFaqOverride([{ q: "x", a: "" }])).toBeNull();
    expect(pickFaqOverride([{ q: "x" }])).toBeNull();
    expect(pickFaqOverride("nope")).toBeNull();
    expect(pickFaqOverride(null)).toBeNull();
  });

  it("a static-page override must be fully well-formed (all-or-nothing)", () => {
    const good = {
      title: "T",
      sections: [{ heading: "H", paragraphs: ["P"], list: ["L"], links: [{ label: "A", href: "/about" }] }],
    };
    expect(pickStaticPageOverride(good)?.sections[0].heading).toBe("H");
    // external hrefs are rejected (internal-only law)
    expect(pickStaticPageOverride({ ...good, sections: [{ heading: "H", paragraphs: ["P"], links: [{ label: "A", href: "https://evil.example" }] }] })).toBeNull();
    expect(pickStaticPageOverride({ ...good, sections: [{ heading: "H", paragraphs: ["P"], links: [{ label: "A", href: "//evil.example" }] }] })).toBeNull();
    // malformed pieces → whole-page fallback
    expect(pickStaticPageOverride({ title: "", sections: [] })).toBeNull();
    expect(pickStaticPageOverride({ title: "T", sections: [] })).toBeNull();
    expect(pickStaticPageOverride({ title: "T", sections: [{ heading: "", paragraphs: ["P"] }] })).toBeNull();
    expect(pickStaticPageOverride({ title: "T", sections: [{ heading: "H", paragraphs: [] }] })).toBeNull();
    expect(pickStaticPageOverride({ title: "T", sections: [{ heading: "H", paragraphs: ["P", ""] }] })).toBeNull();
    expect(pickStaticPageOverride(null)).toBeNull();
    expect(pickStaticPageOverride("nope")).toBeNull();
  });

  it("a FAQ-page override needs a title + valid items", () => {
    expect(pickFaqPageOverride({ title: "FAQ", items: [{ q: "q", a: "a" }] })?.items).toHaveLength(1);
    expect(pickFaqPageOverride({ title: "FAQ", items: [] })).toBeNull();
    expect(pickFaqPageOverride({ title: "", items: [{ q: "q", a: "a" }] })).toBeNull();
    expect(pickFaqPageOverride({ items: [{ q: "q", a: "a" }] })).toBeNull();
  });
});

describe("SITE-CONTENT-281 — token engine (live library sizes)", () => {
  it("substitutes {exercises} and {foods} and leaves other text intact", () => {
    const out = applySiteTokens("مكتبة تضم {exercises} تمرينًا و{foods} صنفًا");
    expect(out).not.toContain("{exercises}");
    expect(out).not.toContain("{foods}");
    expect(out).toMatch(/تمرينًا/);
    expect(applySiteTokens("no tokens here")).toBe("no tokens here");
  });
});

describe("SITE-CONTENT-281 — homepage copy resolution", () => {
  it("with no overrides, every field resolves to its default verbatim", () => {
    const c = resolveHomeCopy(undefined, false);
    for (const field of HOME_TEXT_FIELDS) {
      expect(c[field.prop]).toBe(field.defaultEn);
    }
    const cAr = resolveHomeCopy(undefined, true);
    for (const field of HOME_TEXT_FIELDS) {
      expect(cAr[field.prop]).toBe(field.defaultAr);
    }
  });

  it("a valid override wins only for its locale; invalid values fall back", () => {
    const copy = {
      "home.hero.title": { en: "Custom hero", ar: "   " },
      "home.learn.title": { en: 42, ar: { x: 1 } },
    };
    const cEn = resolveHomeCopy(copy, false);
    expect(cEn.heroTitle).toBe("Custom hero");
    // AR side of the same key falls back (whitespace-only never wins)
    expect(resolveHomeCopy(copy, true).heroTitle).toBe(HOME_TEXT_FIELDS.find((f) => f.key === "home.hero.title")!.defaultAr);
    // wrong-typed values fall back on both locales
    const learnField = HOME_TEXT_FIELDS.find((f) => f.key === "home.learn.title")!;
    expect(cEn.learnTitle).toBe(learnField.defaultEn);
    expect(resolveHomeCopy(copy, true).learnTitle).toBe(learnField.defaultAr);
  });

  it("the homepage FAQ resolves overrides per locale and falls back to the 5 defaults", () => {
    expect(resolveHomeFaq(undefined, false)).toEqual(HOME_FAQ_DEFAULT.en);
    expect(resolveHomeFaq(undefined, true)).toEqual(HOME_FAQ_DEFAULT.ar);
    expect(HOME_FAQ_DEFAULT.en).toHaveLength(5);
    expect(HOME_FAQ_DEFAULT.ar).toHaveLength(5);
    const custom = resolveHomeFaq({ "home.faq": { en: [{ q: "Q", a: "A" }] } }, false);
    expect(custom).toEqual([{ q: "Q", a: "A" }]);
    // AR side of the same row falls back (no ar value)
    expect(resolveHomeFaq({ "home.faq": { en: [{ q: "Q", a: "A" }] } }, true)).toEqual(HOME_FAQ_DEFAULT.ar);
  });

  it("registry integrity: unique keys, non-empty defaults, props match", () => {
    const keys = HOME_TEXT_FIELDS.map((f) => f.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const field of HOME_TEXT_FIELDS) {
      expect(field.defaultEn.trim().length).toBeGreaterThan(0);
      expect(field.defaultAr.trim().length).toBeGreaterThan(0);
      expect(field.labelEn.length).toBeGreaterThan(0);
      expect(field.labelAr.length).toBeGreaterThan(0);
    }
    // every group field is a real HomeCopy prop
    const copy = resolveHomeCopy({}, false);
    for (const group of HOME_COPY_GROUPS) {
      for (const field of group.fields) {
        expect(typeof copy[field.prop]).toBe("string");
      }
    }
  });
});

describe("SITE-CONTENT-281 — static page resolution", () => {
  it("defaults render verbatim with tokens substituted (about carries live sizes)", () => {
    const en = resolveStaticPage(undefined, "about", false);
    expect(en.title).toBe("About Alkemos");
    expect(en.sections[0].paragraphs[0]).not.toContain("{exercises}");
    expect(en.sections[0].paragraphs[0]).toMatch(/movements/);
    const ar = resolveStaticPage(undefined, "about", true);
    expect(ar.sections[0].paragraphs[0]).not.toContain("{exercises}");
  });

  it("a malformed override falls back to the WHOLE default page", () => {
    const bad = { "page.privacy": { en: { title: "X", sections: [{ heading: "H", paragraphs: [] }] } } };
    expect(resolveStaticPage(bad, "privacy", false)).toEqual(STATIC_PAGE_DEFAULTS.privacy.en);
  });

  it("a valid override replaces the structure; an internal-links override survives", () => {
    const override = {
      title: "Custom About",
      sections: [{ heading: "Only section", paragraphs: ["One paragraph with {foods} foods."], links: [{ label: "Tools", href: "/tools" }] }],
    };
    const out = resolveStaticPage({ "page.about": { en: override } }, "about", false);
    expect(out.title).toBe("Custom About");
    expect(out.sections).toHaveLength(1);
    expect(out.sections[0].paragraphs[0]).not.toContain("{foods}");
    // AR side falls back to the full default (per-locale independence) —
    // the resolver token-substitutes defaults, so compare token-free title.
    const arOut = resolveStaticPage({ "page.about": { en: override } }, "about", true);
    expect(arOut.title).toBe(STATIC_PAGE_DEFAULTS.about.ar.title);
    expect(arOut.title).not.toBe("Custom About");
    expect(arOut.sections).toHaveLength(STATIC_PAGE_DEFAULTS.about.ar.sections.length);
  });

  it("the /faq page defaults stay the faq-content arrays (single source preserved)", () => {
    expect(FAQ_PAGE_DEFAULT.en.items).toBe(FAQS_EN);
    expect(FAQ_PAGE_DEFAULT.ar.items).toBe(FAQS_AR);
    expect(FAQS_EN.length).toBeGreaterThanOrEqual(9);
    const resolved = resolveFaqPage(undefined, false);
    expect(resolved.title).toBe("Frequently Asked Questions");
    expect(resolved.items).toHaveLength(FAQS_EN.length);
    // malformed override → default
    expect(resolveFaqPage({ "page.faq": { en: { title: "T", items: [] } } }, false)).toEqual(FAQ_PAGE_DEFAULT.en);
  });
});
