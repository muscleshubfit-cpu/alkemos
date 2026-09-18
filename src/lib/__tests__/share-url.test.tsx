import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { canonicalShareUrl, SHARE_BASE_URL } from "@/lib/share-url";
import { ShareButtons } from "@/components/ShareButtons";
import { I18nProvider } from "@/lib/i18n";

// ShareButtons/I18nProvider are client components — under vitest there is
// no Next router, so usePathname() is stubbed (the provider already
// tolerates null: `usePathname() || "/"`).
vi.mock("next/navigation", () => ({ usePathname: () => null }));

/**
 * SHARE URL LAW (Phase 230 — P0 of the Social Sharing deep audit, owner
 * order «نفّذ الآن P0 بالكامل من تقرير Deep Audit لنظام Social Sharing»).
 *
 * History this file guards against:
 *  - pre-227: ShareButtons read window.location.href DURING render → the
 *    server rendered EMPTY share hrefs and React never patched them up
 *    (WhatsApp shared text with no URL — the owner-reported symptom).
 *  - 227: mountedUrl via useEffect — hydration-safe but empty BEFORE
 *    mount, and window.location.href leaked utm/cb into shared URLs.
 *  - 230 (this law): canonical URL is deterministic from the FIRST
 *    server render, built from the required `path` prop.
 */

const EN_EVO = encodeURIComponent("https://alkemos.com/evo");
const AR_EVO = encodeURIComponent("https://alkemos.com/ar/evo");

function ssr(lang: "en" | "ar", path = "/evo"): string {
  return renderToStaticMarkup(
    // eslint-disable-next-line react/no-children-prop -- provider props TYPE requires children in props (test-only render)
    createElement(
      I18nProvider,
      {
        urlLocale: lang,
        children: createElement(ShareButtons, {
          title:
            lang === "ar" ? "EVO — مدرب ذكاء اصطناعي | Alkemos" : "EVO — AI Coach | Alkemos",
          path,
        }),
      },
    ),
  );
}

/** Attribute values are HTML-escaped (`&` → `&amp;`) — decode back so the
 *  assertions see exactly what the BROWSER sees in the live DOM. */
function decoded(html: string): string {
  return html.replace(/&amp;/g, "&");
}

/** Strip comments so the source guard checks CODE, not the docblock that
 *  documents the history of the law. */
function codeOnly(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

describe("canonicalShareUrl — the share URL builder (single source)", () => {
  it("builds the absolute EN URL as-is", () => {
    expect(canonicalShareUrl("/evo", "en")).toBe("https://alkemos.com/evo");
  });

  it("prefixes /ar for the AR mirrors", () => {
    expect(canonicalShareUrl("/evo", "ar")).toBe("https://alkemos.com/ar/evo");
    expect(canonicalShareUrl("/tools/bmi-calculator", "ar")).toBe(
      "https://alkemos.com/ar/tools/bmi-calculator",
    );
  });

  it("never double-prefixes /ar (idempotent)", () => {
    expect(canonicalShareUrl("/ar/evo", "ar")).toBe("https://alkemos.com/ar/evo");
  });

  it("strips query params — utm/cb trackers can never reach a share", () => {
    expect(canonicalShareUrl("/evo?cb=29859&utm_source=whatsapp", "en")).toBe(
      "https://alkemos.com/evo",
    );
    expect(canonicalShareUrl("/evo?cb=29859", "ar")).toBe("https://alkemos.com/ar/evo");
  });

  it("strips hash fragments", () => {
    expect(canonicalShareUrl("/evo#results", "en")).toBe("https://alkemos.com/evo");
  });

  it("normalizes trailing/duplicate slashes", () => {
    expect(canonicalShareUrl("/tools/bmi-calculator/", "en")).toBe(
      "https://alkemos.com/tools/bmi-calculator",
    );
    expect(canonicalShareUrl("//evo//", "en")).toBe("https://alkemos.com/evo");
  });

  it("collapses the root path to the bare origin (never an empty URL)", () => {
    expect(canonicalShareUrl("", "en")).toBe("https://alkemos.com");
    expect(canonicalShareUrl("/", "en")).toBe("https://alkemos.com");
    expect(canonicalShareUrl("/", "ar")).toBe("https://alkemos.com/ar");
  });

  it("exports a trailing-slash-free absolute base", () => {
    expect(SHARE_BASE_URL).toBe("https://alkemos.com");
  });
});

describe("ShareButtons SSR — no empty share href can exist (regression law)", () => {
  it("SSR (EN): WhatsApp carries the FULL canonical URL from the first render", () => {
    const html = decoded(ssr("en"));
    // Full share URL present inside the WhatsApp text payload
    expect(html).toContain("https://wa.me/?text=");
    expect(html).toMatch(new RegExp(`wa\\.me/\\?text=[^"]*%20${EN_EVO}`));
  });

  it("SSR (EN): Facebook / X / LinkedIn / Telegram carry the canonical URL", () => {
    const html = decoded(ssr("en"));
    expect(html).toContain(`sharer.php?u=${EN_EVO}&quote=`);
    expect(html).toContain("intent/tweet?text=");
    expect(html).toContain(`&url=${EN_EVO}`);
    expect(html).toContain(`share-offsite/?url=${EN_EVO}`);
    expect(html).toContain(`t.me/share/url?url=${EN_EVO}&text=`);
  });

  it("SSR (EN): zero empty-URL share hrefs (the pre-230 failure mode)", () => {
    const html = decoded(ssr("en"));
    expect(html).not.toContain("sharer.php?u=&");
    expect(html).not.toContain('&url="');
    expect(html).not.toContain("?url=&");
    expect(html).not.toContain('share-offsite/?url="');
  });

  it("SSR (EN): no query/hash leakage into any share href", () => {
    const html = decoded(ssr("en", "/evo?cb=42&utm_source=x#top"));
    expect(html).toContain(EN_EVO);
    expect(html).not.toContain("cb%3D");
    expect(html).not.toContain("utm_");
  });

  it("SSR (AR): the canonical /ar URL space is used, Arabic labels render", () => {
    const html = decoded(ssr("ar"));
    expect(html).toMatch(new RegExp(`wa\\.me/\\?text=[^"]*%20${AR_EVO}`));
    expect(html).toContain(`share-offsite/?url=${AR_EVO}`);
    expect(html).toContain("شارك:");
    expect(html).not.toContain(EN_EVO);
  });

  it("Web Share button is ABSENT from SSR and the Copy fallback is present (WEB SHARE LAW)", () => {
    const html = ssr("en");
    // Native share button renders only after mount, when navigator.share exists
    expect(html).not.toContain('aria-label="Share"');
    expect(html).not.toContain('title="Share"');
    // The always-visible copy fallback
    expect(html).toContain('aria-label="Copy link"');
    const htmlAr = ssr("ar");
    expect(htmlAr).toContain('aria-label="نسخ الرابط"');
  });

  it("post-mount behavior: the button appears when navigator.share exists (jsdom render)", async () => {
    // jsdom has no navigator.share → simulate a supporting device, then
    // let the mount effect flip the flag through @testing-library.
    const nav = navigator as Navigator & { share?: unknown };
    const originalShare = nav.share;
    Object.defineProperty(navigator, "share", {
      value: vi.fn().mockResolvedValue(undefined),
      configurable: true,
    });
    try {
      const { render } = await import("@testing-library/react");
      const view = render(
        // eslint-disable-next-line react/no-children-prop -- provider type requires children in props (test-only render)
        createElement(I18nProvider, {
          urlLocale: "en",
          children: createElement(ShareButtons, {
            title: "EVO — AI Coach | Alkemos",
            path: "/evo",
          }),
        }),
      );
      // Mount effect ran → supported → native share button now rendered
      expect(await view.findByLabelText("Share")).toBeTruthy();
      view.unmount();
    } finally {
      if (originalShare === undefined) {
        delete (nav as unknown as { share?: unknown }).share;
      } else {
        Object.defineProperty(navigator, "share", {
          value: originalShare,
          configurable: true,
        });
      }
    }
  });
});

const repoRoot = resolve(__dirname, "../../..");

/** The 12 live ShareButtons surfaces — each MUST declare its canonical path. */
const SURFACES: Array<[string, string]> = [
  ["src/app/evo/page.tsx", 'path="/evo"'],
  ["src/app/coaching/page.tsx", 'path="/coaching"'],
  ["src/app/memberships/page.tsx", 'path="/memberships"'],
  ["src/app/meal-planner/page.tsx", 'path="/meal-planner"'],
  ["src/app/tools/bmi-calculator/page.tsx", 'path="/tools/bmi-calculator"'],
  ["src/app/tools/body-fat-calculator/page.tsx", 'path="/tools/body-fat-calculator"'],
  ["src/app/tools/calorie-calculator/page.tsx", 'path="/tools/calorie-calculator"'],
  ["src/app/tools/macro-calculator/page.tsx", 'path="/tools/macro-calculator"'],
  ["src/app/tools/water-tracker/page.tsx", 'path="/tools/water-tracker"'],
  ["src/app/exercises/[slug]/ExerciseDetailClient.tsx", "path={`/exercises/${slug}`}"],
  ["src/app/foods/[slug]/FoodDetailClient.tsx", "path={`/foods/${food.slug}`}"],
  ["src/app/programs/[slug]/ProgramDetailClient.tsx", "path={`/programs/${program.slug}`}"],
];

describe("SHARE URL LAW source guards — regression net over every surface", () => {
  it("every ShareButtons surface passes its deterministic canonical path", () => {
    for (const [file, expectedProp] of SURFACES) {
      const src = readFileSync(resolve(repoRoot, file), "utf8");
      expect(src, `${file} must still render <ShareButtons>`).toContain("<ShareButtons");
      expect(src, `${file} must pass ${expectedProp}`).toContain(expectedProp);
    }
  });

  it("ShareButtons.tsx never again reads window.location (no primary, no fallback)", () => {
    const src = codeOnly(
      readFileSync(resolve(repoRoot, "src/components/ShareButtons.tsx"), "utf8"),
    );
    expect(src).not.toContain("window.location");
    expect(src).not.toContain("mountedUrl");
    expect(src).toContain("canonicalShareUrl(path, lang)");
  });

  it("the untouched surfaces stay untouched (scope law): blog SocialShare keeps its own deterministic URL, CoachShareButtons unchanged", () => {
    const blog = readFileSync(resolve(repoRoot, "src/components/blog/BlogComponents.tsx"), "utf8");
    expect(blog).toContain("https://wa.me/?text=${encodedShareText}%20${encodedUrl}");
    const coach = readFileSync(resolve(repoRoot, "src/components/CoachShareButtons.tsx"), "utf8");
    expect(coach).toContain('url || mountedUrl || "https://alkemos.com/for-coaches"');
  });
});
