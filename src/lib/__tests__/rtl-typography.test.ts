import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

/**
 * VRD-V0 CANARIES — RTL typography & a11y regression guards
 * (docs/VISUAL-REDESIGN-AUDIT-2026-09-23.md §10.2, wave V0).
 *
 * The live bug (audit C-1): Tailwind v4 puts utilities in @layer
 * utilities, which ALWAYS beats @layer base — so the RTL font rules in
 * globals.css lost to the font-display / tracking-tight / leading-tight /
 * font-semibold utilities on Arabic headings, and the AR hero H1 rendered
 * in the OS default Arabic serif (NOT Cairo) with -1.5px tracking (C-2)
 * and 1.25 leading (C-3). The fix has three legs, all pinned here:
 *
 *   1) STACK  — Cairo appended to --font-display after Playfair, so any
 *      Arabic glyph inside a font-display element resolves to Cairo even
 *      when a utility re-asserts that stack.
 *   2) LAYER  — the RTL heading/body typography rules moved OUT of
 *      @layer base into UNLAYERED CSS (unlayered beats every layer, no
 *      !important needed). These tests brace-count the base layer to
 *      prove the rules live outside it.
 *   3) UTILITY DISCIPLINE — the Arabic-bearing hero H1 carries explicit
 *      rtl: tracking/leading counterparts next to the EN tight utilities
 *      (EN rendering stays untouched — both sets are pinned).
 *
 * Plus the V0 a11y pins: neutral focus ring (zero-blue law, C-4), 44px
 * minimum touch targets on the button recipes + carousel arrows (C-15),
 * the two-value themeColor (C-4), and the FAQ chevron treatment (C-15).
 */

const CSS = "src/app/globals.css";
const LANDING = "src/components/views/LandingView.tsx";
const METADATA = "src/app/metadata.ts";

/** Extract the single `@layer base { … }` block by brace matching. */
function baseLayerBlock(css: string): string {
  const start = css.indexOf("@layer base {");
  expect(start, "@layer base block not found").toBeGreaterThanOrEqual(0);
  let depth = 0;
  for (let i = start; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) return css.slice(start, i + 1);
    }
  }
  throw new Error("unbalanced @layer base block");
}

describe("VRD-V0 — RTL typography canaries (audit C-1/C-2/C-3)", () => {
  it("leg 1 — Cairo sits inside the --font-display stack, after Playfair", () => {
    const css = readFileSync(CSS, "utf8");
    const m = css.match(/--font-display:\s*([^;]+);/);
    expect(m, "--font-display token not found").toBeTruthy();
    const stack = m![1];
    expect(stack).toContain("var(--font-playfair)");
    expect(stack).toContain("var(--font-cairo)");
    expect(
      stack.indexOf("var(--font-cairo)"),
      "Cairo must come after Playfair but before Inter, so Arabic glyphs never fall through to a Latin-only face",
    ).toBeGreaterThan(stack.indexOf("var(--font-playfair)"));
    expect(stack.indexOf("var(--font-cairo)")).toBeLessThan(stack.indexOf("var(--font-inter)"));
  });

  it("leg 2 — the RTL heading rules live OUTSIDE @layer base (unlayered beats utilities)", () => {
    const css = readFileSync(CSS, "utf8");
    const base = baseLayerBlock(css);
    // The moved-out proof: the base layer no longer carries the RTL
    // heading typography (the old losing rules)…
    expect(
      base,
      "html[dir=rtl] heading rules must not live in @layer base (they lose to utilities there)",
    ).not.toMatch(/html\[dir="rtl"\]\s*(body|h1|h2|h3|h4)/);
    // …and the unlayered block exists after the base layer, carrying the
    // full correction: Cairo + zero tracking + weight 700.
    const baseEnd = css.indexOf(base) + base.length;
    const rtlBlock = css.indexOf('[dir="rtl"] .font-display');
    expect(rtlBlock, "unlayered RTL block not found").toBeGreaterThan(baseEnd);
    const block = css.slice(rtlBlock, rtlBlock + 400);
    expect(block).toContain("font-family: var(--font-arabic)");
    expect(block).toContain("letter-spacing: 0");
    expect(block).toContain("font-weight: 700");
  });

  it("leg 2 — Arabic heading line-heights are the §10.1 values (1.35 / 1.4 / 1.45)", () => {
    const css = readFileSync(CSS, "utf8");
    expect(css).toMatch(/\[dir="rtl"\] h1(\.font-display)?[^}]*line-height:\s*1\.35/);
    expect(css).toMatch(/\[dir="rtl"\] h2(\.font-display)?[^}]*line-height:\s*1\.4\b/);
    expect(css).toMatch(/\[dir="rtl"\] h3(\.font-display)?[^}]*line-height:\s*1\.45/);
  });

  it("leg 3 — the hero H1 carries rtl: counterparts AND keeps the EN tight utilities", () => {
    const src = readFileSync(LANDING, "utf8");
    const m = src.match(/<h1 className="([^"]*)"/);
    expect(m, "hero h1 not found").toBeTruthy();
    const cls = m![1];
    // EN stays exactly as designed (tight tracking/leading for Playfair)…
    expect(cls).toContain("tracking-tight");
    expect(cls).toContain("leading-tight");
    // …while Arabic gets explicit non-negative counterparts at the
    // utility layer (belt and braces with legs 1-2).
    expect(cls).toContain("rtl:tracking-normal");
    expect(cls).toContain("rtl:leading-snug");
  });
});

describe("VRD-V0 — a11y canaries (audit C-4 / C-15)", () => {
  it("the focus ring is neutral graphite, not the legacy indigo (zero-blue law)", () => {
    const css = readFileSync(CSS, "utf8");
    const m = css.match(/\*:focus-visible\s*\{[^}]*\}/);
    expect(m, "*:focus-visible rule not found").toBeTruthy();
    const rule = m![0];
    expect(rule).not.toContain("99, 102, 241");
    expect(rule).toContain("var(--text)");
  });

  it("the button recipes carry a 44px minimum touch target", () => {
    const css = readFileSync(CSS, "utf8");
    for (const recipe of [".btn-chrome", ".btn-outline"]) {
      const m = css.match(new RegExp(recipe.replace(".", "\\.") + "\\s*\\{[^}]*\\}"));
      expect(m, `${recipe} recipe not found`).toBeTruthy();
      expect(m![0], `${recipe} must set min-height: 44px`).toContain("min-height: 44px");
    }
  });

  it("the homepage carousel arrows are 44px on touch (max-md: variant)", () => {
    const src = readFileSync(LANDING, "utf8");
    const arrows = src.match(/grid h-9 w-9[^(]*/g) ?? [];
    expect(arrows.length, "carousel arrow buttons not found").toBeGreaterThanOrEqual(2);
    for (const arrow of arrows) {
      expect(arrow).toContain("max-md:h-11");
      expect(arrow).toContain("max-md:w-11");
    }
  });

  it("the FAQ rows gained a full-row hover + bigger higher-contrast chevron", () => {
    const src = readFileSync(LANDING, "utf8");
    const m = src.match(/<AccordionTrigger className="([^"]*)"/);
    expect(m, "FAQ AccordionTrigger not found").toBeTruthy();
    const cls = m![1];
    expect(cls).toContain("hover:bg-[var(--bg)]");
    expect(cls).toContain("[&>svg]:size-5");
    expect(cls).toContain("[&>svg]:text-[var(--muted-2)]");
  });

  it("viewport themeColor is the two-value theme pair, not Apple blue", () => {
    const src = readFileSync(METADATA, "utf8");
    const block = src.slice(src.indexOf("export const viewport"));
    expect(block).not.toContain('"#0071e3"');
    expect(block).toContain('(prefers-color-scheme: light)');
    expect(block).toContain('"#FFFFFF"');
    expect(block).toContain('(prefers-color-scheme: dark)');
    expect(block).toContain('"#0B0B0D"');
  });
});
