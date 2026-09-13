import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { stripTitleHeadingFromBody, normalizeHeadingForCompare } from "@/lib/blog-msa";
import { renderMarkdown } from "@/lib/blog";

/**
 * PHASE 187 — single-H1 law (2026-09-13 deep-audit P0-1). Live audit:
 * 22/69 published articles rendered TWO <h1> tags — the template hero
 * (post.title) AND the markdown body's own leading `# Title` line
 * (legacy corpus; e.g. /blog/progressive-overload-no-weight). The AR
 * case (/ar/blog/calculate-daily-calories-weight-loss) proved the body
 * line is not byte-identical to the title: سعرة/سُعرة، يومياً/يوميًا —
 * the comparison normalizes before matching.
 *
 * Guarded contracts:
 *   1. stripTitleHeadingFromBody removes a LEADING `# ` line that
 *      duplicates the title (normalized compare) and preserves the rest
 *      byte-identically, in both languages.
 *   2. Content safety: a non-title `# ` heading (leading OR mid-body)
 *      passes through — only a leading title-dupe is ever dropped.
 *   3. Idempotent: stripping twice == stripping once.
 *   4. renderMarkdown NEVER emits <h1> from markdown — a body `# `
 *      heading demotes to <h2> (the SEO backstop, whatever the data).
 *   5. The render path wires the strip (BlogArticlePage) and the
 *      renderer carries no <h1> producer (source fork guards).
 */

const EN_TITLE = "Progressive Overload Without Adding Weight: 4 Ways to Beat Plateaus";
const EN_BODY = `# ${EN_TITLE}

Progressive overload is the engine that drives muscle hypertrophy.

## Why plateaus happen

The body adapts to repeated stimulus.`;

const EN_BODY_STRIPPED = `Progressive overload is the engine that drives muscle hypertrophy.

## Why plateaus happen

The body adapts to repeated stimulus.`;

// The live AR case: body heading carries diacritics the title lacks.
const AR_TITLE = "كم سعرة أحتاج يومياً لخسارة الوزن؟ طريقة حساب دقيقة";
const AR_BODY_HEADING = "كم سُعرة أحتاج يوميًا لخسارة الوزن؟ طريقة حساب دقيقة";
const AR_BODY = `# ${AR_BODY_HEADING}

حساب السعرات هو حجر الأساس لأي خطة.

## الخطوة الأولى

احسب معدل الأيض الأساسي.`;

const AR_BODY_STRIPPED = `حساب السعرات هو حجر الأساس لأي خطة.

## الخطوة الأولى

احسب معدل الأيض الأساسي.`;

describe("normalizeHeadingForCompare (Phase 187)", () => {
  it("collapses Arabic diacritics (the live AR incident: سعرة/سُعرة، يومياً/يوميًا)", () => {
    expect(normalizeHeadingForCompare(AR_TITLE)).toBe(normalizeHeadingForCompare(AR_BODY_HEADING));
    expect(normalizeHeadingForCompare("سُعرة")).toBe(normalizeHeadingForCompare("سعرة"));
    expect(normalizeHeadingForCompare("يوميًا")).toBe(normalizeHeadingForCompare("يومياً"));
  });

  it("unifies hyphen variants and case (12‑Week U+2011 vs 12-Week)", () => {
    expect(normalizeHeadingForCompare("12\u2011Week Plan")).toBe(normalizeHeadingForCompare("12-week PLAN"));
    expect(normalizeHeadingForCompare("Pre\u2011Workout Nutrition Guide")).toBe(normalizeHeadingForCompare("Pre-Workout nutrition guide"));
  });

  it("strips punctuation and collapses whitespace", () => {
    expect(normalizeHeadingForCompare("Title:  Guide!  ")).toBe("title guide");
    expect(normalizeHeadingForCompare("ما هو أفضل مكمل؟")).toBe(normalizeHeadingForCompare("ما هو أفضل مكمل"));
  });
});

describe("stripTitleHeadingFromBody (Phase 187 — single-H1 law)", () => {
  it("removes the leading EN title heading, keeps the rest verbatim", () => {
    expect(stripTitleHeadingFromBody(EN_BODY, EN_TITLE)).toBe(EN_BODY_STRIPPED);
  });

  it("removes the leading AR title heading across diacritic differences (the live case)", () => {
    expect(stripTitleHeadingFromBody(AR_BODY, AR_TITLE)).toBe(AR_BODY_STRIPPED);
  });

  it("tolerates leading blank lines before the title heading", () => {
    expect(stripTitleHeadingFromBody("\n\n" + EN_BODY, EN_TITLE)).toBe(EN_BODY_STRIPPED);
  });

  it("handles a title-only body and no trailing newline", () => {
    expect(stripTitleHeadingFromBody(`# ${EN_TITLE}`, EN_TITLE)).toBe("");
  });

  it("is idempotent — stripping twice equals stripping once", () => {
    const once = stripTitleHeadingFromBody(EN_BODY, EN_TITLE);
    expect(stripTitleHeadingFromBody(once, EN_TITLE)).toBe(once);
  });

  it("content safety: a leading `# ` heading that is NOT the title passes through", () => {
    const rogue = `# A Completely Different Section Heading\n\nIntro prose.`;
    expect(stripTitleHeadingFromBody(rogue, EN_TITLE)).toBe(rogue);
  });

  it("content safety: a mid-body title-dupe is NEVER touched (first line only)", () => {
    const mid = `Intro prose first.\n\n# ${EN_TITLE}\n\nAfter.`;
    expect(stripTitleHeadingFromBody(mid, EN_TITLE)).toBe(mid);
  });

  it("a body without any heading passes through unchanged", () => {
    const plain = `Just prose.\n\nMore prose.`;
    expect(stripTitleHeadingFromBody(plain, EN_TITLE)).toBe(plain);
  });

  it("empty/blank bodies pass through", () => {
    expect(stripTitleHeadingFromBody("", EN_TITLE)).toBe("");
    expect(stripTitleHeadingFromBody("   \n  ", EN_TITLE)).toBe("   \n  ");
  });

  it("## headings are never eligible (level-1 only, per the contract)", () => {
    const h2 = `## ${EN_TITLE}\n\nBody.`;
    expect(stripTitleHeadingFromBody(h2, EN_TITLE)).toBe(h2);
  });
});

describe("renderMarkdown single-H1 backstop (Phase 187)", () => {
  it("NEVER emits <h1> — a body `# ` heading demotes to <h2> with an id", () => {
    const html = renderMarkdown(`# Section Heading\n\nBody text.\n\n## Sub\n\nMore.`);
    expect(html).not.toContain("<h1");
    expect(html).toContain('<h2 id="section-heading"');
    expect(html).toContain("Section Heading</h2>");
    expect(html).toContain('<h2 id="sub"');
  });

  it("an h2/#-mixed body keeps its visual hierarchy (one h2 class family)", () => {
    const html = renderMarkdown(`# One\n\nA.\n\n## Two\n\nB.\n\n### Three\n\nC.`);
    expect(html).not.toContain("<h1");
    expect((html.match(/<h2/g) ?? []).length).toBe(2);
    expect(html).toContain("<h3");
  });
});

describe("single-H1 wiring — no fork (Phase 187)", () => {
  it("BlogArticlePage wires the strip between the FAQ strip and the render", () => {
    const src = readFileSync("src/components/blog/BlogArticlePage.tsx", "utf8");
    expect(src).toContain("stripTitleHeadingFromBody(faqStripped, post.title)");
    expect(src).toContain("stripFaqSectionFromBody");
    // The template hero stays the page's only <h1> producer (multi-line
    // JSX: attribute line + {post.title} on its own line).
    expect(src).toMatch(/<h1[^>]*data-speakable="headline"/);
    expect(src).toContain("{post.title}");
  });

  it("blog.ts carries no <h1> producer in the markdown renderer", () => {
    const src = readFileSync("src/lib/blog.ts", "utf8");
    // The retired h1 signature (the pre-187 `# ` rule) must never return.
    expect(src).not.toContain('<h1 class="text-2xl font-bold mt-8 mb-4">');
    // The `# ` rule still exists and now produces an h2 (single source
    // with the `##` rule) — the leading `/` of the regex literal included.
    expect(src).toMatch(/replace\(\/\^# \(\.\+\)\$\/gm/);
  });
});
