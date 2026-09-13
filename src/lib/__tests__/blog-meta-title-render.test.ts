import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { clampMetaTitle } from "@/lib/blog-meta-title";

/**
 * PHASE 189 — render-time SERP title clamp wiring (deep-audit P1-1).
 *
 * Live audit 2026-09-13 (69-article scan): 5 legacy AR rows carried a
 * trailing " — Alkemos" brand suffix (71-77 chars, budget 70) plus 23
 * gray-zone rows at 63-70 — the suffix-eleven alone pushed the five
 * over budget. Fix: clampMetaTitle (the SEO-GEO-6.3/181 law, now in the
 * zero-dep blog-meta-title.ts) applied at the RENDER layer —
 * fetchBlogForOG in blog-server.ts is the single choke point feeding
 * <title>/og:title/twitter:title/JSON-LD headline/breadcrumb on BOTH
 * language mirrors AND /api/og-image; BlogArticlePage clamps the share
 * prefill the same way. Zero DB writes (the Phase-187 pattern).
 *
 * Guarded contracts:
 *   1. The 5 live over-budget AR titles clamp to their exact clean
 *      form (suffix stripped, within the 70 budget, question marks
 *      preserved) — the incident canaries.
 *   2. Gray-zone (63-70) rows shrink below budget after the suffix strip.
 *   3. blog-meta-title.ts stays ZERO-DEPENDENCY (client-importable).
 *   4. blog-pipeline.ts re-exports the law — never re-defines it.
 *   5. Both render-time wirings stay in place (blog-server + the
 *      client article page).
 */

/** The five live AR incidents (verbatim stored meta_title values). */
const LIVE_AR_INCIDENTS: Array<[string, string, number]> = [
  [
    "برنامج تمارين منزلية لمدة 8 أسابيع لزيادة الكتلة العضلية بدون معدات — Alkemos",
    "برنامج تمارين منزلية لمدة 8 أسابيع لزيادة الكتلة العضلية بدون معدات",
    77,
  ],
  [
    "خطوة بخطوة: إعداد نظام غذائي لحرق الدهون مع حساب الماكرو للرياضيين — Alkemos",
    "خطوة بخطوة: إعداد نظام غذائي لحرق الدهون مع حساب الماكرو للرياضيين",
    76,
  ],
  [
    "كم كمية البروتين اليومية المثالية لبناء العضلات للرجال والنساء؟ — Alkemos",
    "كم كمية البروتين اليومية المثالية لبناء العضلات للرجال والنساء؟",
    73,
  ],
  [
    "ما هي الأخطاء الشائعة التي تمنع حرق الدهون رغم التمرين اليومي؟ — Alkemos",
    "ما هي الأخطاء الشائعة التي تمنع حرق الدهون رغم التمرين اليومي؟",
    72,
  ],
  [
    "نظام غذائي أسبوعي لحرق الدهون مع حساب السعرات اليومية بفعالية — Alkemos",
    "نظام غذائي أسبوعي لحرق الدهون مع حساب السعرات اليومية بفعالية",
    71,
  ],
];

function repoRootPath(rel: string): string {
  return resolve(__dirname, "../../..", rel);
}

describe("render-time SERP title clamp (Phase 189 — P1-1)", () => {
  it.each(LIVE_AR_INCIDENTS)(
    "live incident (%ich) clamps to its exact clean form within budget",
    (stored, expected, storedLen) => {
      expect(stored.length).toBe(storedLen); // canary sanity: verbatim copy
      const out = clampMetaTitle(stored, "ar");
      expect(out).toBe(expected);
      expect(out.length).toBeLessThanOrEqual(70);
      expect(out.endsWith("؟")).toBe(stored.trim().endsWith("؟ — Alkemos")); // question form survives
      expect(out).not.toMatch(/Alkemos$/i); // the suffix is gone
    },
  );

  it("gray-zone rows (63-70) shrink below budget after the suffix strip", () => {
    const gray = "دليل شامل لتصميم برنامج تمارين بناء العضلات للنساء في المنزل — Alkemos";
    expect(gray.length).toBe(70);
    const out = clampMetaTitle(gray, "ar");
    expect(out).toBe("دليل شامل لتصميم برنامج تمارين بناء العضلات للنساء في المنزل");
    expect(out.length).toBeLessThanOrEqual(70);
  });

  it("the law module stays ZERO-DEPENDENCY (client-importable)", () => {
    const src = readFileSync(repoRootPath("src/lib/blog-meta-title.ts"), "utf8");
    expect(/^import\s/m.test(src)).toBe(false);
    expect(/^const\s+\w+\s*=\s*require\(/m.test(src)).toBe(false);
  });

  it("blog-pipeline re-exports the law — never re-defines it (single source)", () => {
    const src = readFileSync(repoRootPath("src/lib/blog-pipeline.ts"), "utf8");
    expect(src).toContain('from "./blog-meta-title"');
    expect(src).toContain("clampMetaTitle");
    // The law block moved out verbatim — a re-definition here is drift.
    expect(src).not.toContain("const META_TITLE_MAX");
    expect(src).not.toContain("const BRAND_SUFFIX_RE");
    expect(src).not.toContain("function endsWithDanglingConnective");
  });

  it("fetchBlogForOG (blog-server.ts) applies the clamp to the stored title", () => {
    const src = readFileSync(repoRootPath("src/lib/blog-server.ts"), "utf8");
    expect(src).toContain('from "./blog-meta-title"');
    expect(src).toContain('clampMetaTitle(data.meta_title || data.title || "", lang)');
  });

  it("BlogArticlePage (client) clamps the share prefill through the same law", () => {
    const src = readFileSync(
      repoRootPath("src/components/blog/BlogArticlePage.tsx"),
      "utf8",
    );
    expect(src).toContain('from "@/lib/blog-meta-title"');
    expect(src).toContain('clampMetaTitle(post.meta_title || post.title || "", lang)');
  });
});
