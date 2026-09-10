/**
 * Phase 156 (SEO-GEO-4.8, §7.1 #15) — blog-content-sanitize tests.
 * Every case below is derived from the live audit of the 63 published
 * posts (2026-09-09): 85 wrong-prefix links in 24 AR posts, 3 raw HTML
 * anchors in best-dynamic-stretching-before-gym, 3 CJK tokens.
 */
import { describe, expect, it } from "vitest";

import {
  fixCrossLanguageLinkPrefixes,
  fixKnownCorruptions,
  fixRawHtmlInternalAnchors,
  sanitizeBlogContent,
  type BlogSlugPools,
} from "../blog-content-sanitize";

const POOLS: BlogSlugPools = {
  en: new Set(["sleep-hours-muscle-growth", "creatine-beginners-guide"]),
  ar: new Set(["sleep-muscle-recovery-gym", "creatine-beginners-guide", "hiit-home-workout-guide"]),
};

describe("fixCrossLanguageLinkPrefixes", () => {
  it("rewrites /blog/<slug> to /ar/blog/<slug> in AR content when target is AR-published (audit: 85 links)", () => {
    const md = "اقرأ [دليل الكرياتين](/blog/creatine-beginners-guide) و[دليل HIIT](/blog/hiit-home-workout-guide).";
    expect(fixCrossLanguageLinkPrefixes(md, "ar", POOLS)).toBe(
      "اقرأ [دليل الكرياتين](/ar/blog/creatine-beginners-guide) و[دليل HIIT](/ar/blog/hiit-home-workout-guide).",
    );
  });

  it("NEVER rewrites when the slug is not in the AR pool (EN-only target stays a working cross-link)", () => {
    const md = "[Sleep hours](/blog/sleep-hours-muscle-growth) — EN only.";
    expect(fixCrossLanguageLinkPrefixes(md, "ar", POOLS)).toBe(md);
  });

  it("mirror rule: EN content with /ar/blog/ prefix rewrites when target is EN-published", () => {
    const md = "[دليل النوم](/ar/blog/sleep-muscle-recovery-gym) ضعيف الحضور في EN.";
    // sleep-muscle-recovery-gym is NOT in the EN pool → untouched
    expect(fixCrossLanguageLinkPrefixes(md, "en", POOLS)).toBe(md);
    const md2 = "[Creatine](/ar/blog/creatine-beginners-guide) exists in EN too.";
    expect(fixCrossLanguageLinkPrefixes(md2, "en", POOLS)).toBe(
      "[Creatine](/blog/creatine-beginners-guide) exists in EN too.",
    );
  });

  it("correctly-prefixed links pass through unchanged (audit: 70 ok links)", () => {
    const md = "[الكرياتين](/ar/blog/creatine-beginners-guide) سليم أصلًا.";
    expect(fixCrossLanguageLinkPrefixes(md, "ar", POOLS)).toBe(md);
  });

  it("is idempotent (running twice equals running once)", () => {
    const md = "[الكرياتين](/blog/creatine-beginners-guide)";
    const once = fixCrossLanguageLinkPrefixes(md, "ar", POOLS);
    expect(fixCrossLanguageLinkPrefixes(once, "ar", POOLS)).toBe(once);
  });
});

describe("fixRawHtmlInternalAnchors", () => {
  it("converts internal raw anchors to markdown (audit: 3 anchors in best-dynamic-stretching-before-gym)", () => {
    const md = 'اشرب الماء عبر <a href="/tools/water-tracker">متتبع الماء</a> يوميًا.';
    expect(fixRawHtmlInternalAnchors(md)).toBe("اشرب الماء عبر [متتبع الماء](/tools/water-tracker) يوميًا.");
  });

  it("leaves external raw anchors untouched (conservative scope)", () => {
    const md = 'مصدر <a href="https://example.com">خارجي</a> يبقى كما هو.';
    expect(fixRawHtmlInternalAnchors(md)).toBe(md);
  });

  it("keeps an anchor with no usable text as-is (never invents destinations)", () => {
    const md = '<a href="/tools/macro-calculator"><img src="/x.png" alt="" /></a>';
    expect(fixRawHtmlInternalAnchors(md)).toBe(md);
  });

  it("is idempotent", () => {
    const md = '<a href="/tools/calorie-calculator">حاسبة السعرات</a>';
    const once = fixRawHtmlInternalAnchors(md);
    expect(fixRawHtmlInternalAnchors(once)).toBe(once);
  });
});

describe("fixKnownCorruptions", () => {
  it("fixes the three audited CJK tokens with Arabic replacements", () => {
    expect(fixKnownCorruptions("أما للراحة超过 3 دقائق")).toBe("أما للراحةأكثر من 3 دقائق");
    expect(fixKnownCorruptions("ومتابعة進度 لمساعدتك")).toBe("ومتابعةالتقدّم لمساعدتك");
    expect(fixKnownCorruptions("سناك بعد الظهر:棒ين حمص مع خضار مقطّع")).toBe(
      "سناك بعد الظهر: حمص مع خضار مقطّع",
    );
  });

  it("is idempotent and leaves clean Arabic untouched", () => {
    const clean = "نص عربي سليم تمامًا بلا أي تلف.";
    expect(fixKnownCorruptions(clean)).toBe(clean);
    expect(fixKnownCorruptions(fixKnownCorruptions("الراحةأكثر من 3 دقائق"))).toBe(
      "الراحةأكثر من 3 دقائق",
    );
  });
});

describe("sanitizeBlogContent (composed pipeline)", () => {
  it("applies raw-anchor conversion → corruption fix → prefix rewrite in one pass", () => {
    const md =
      'تدريب:<a href="/tools/water-tracker">متتبع الماء</a> ثم راحة超过 3 دقائق و[الكرياتين](/blog/creatine-beginners-guide).';
    expect(sanitizeBlogContent(md, "ar", POOLS)).toBe(
      "تدريب:[متتبع الماء](/tools/water-tracker) ثم راحةأكثر من 3 دقائق و[الكرياتين](/ar/blog/creatine-beginners-guide).",
    );
  });

  it("corpus canary: NO CJK codepoint ever survives sanitization (regression guard for the 155 defect family)", () => {
    const cjk = /[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/;
    const samples = [
      "العوامل الالتهابية. أما للراحة超过 3 دقائق، فإن الفائدة الأساسية",
      "جداول تغذية، ومتابعة進度 لمساعدتك على الوصول إلى هدفك",
      "سناك بعد الظهر:棒ين حمص مع خضار مقطّع",
    ];
    for (const s of samples) expect(cjk.test(sanitizeBlogContent(s, "ar", POOLS))).toBe(false);
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 174 — LIVE INCIDENT REGRESSION (2026-09-11): 26/37 published
  // AR articles served HTTP 500 in production. Root cause: the slug
  // pools crossed `unstable_cache`, which JSON-serializes its cached
  // value — a Set becomes {} — so `pools.ar.has` threw on every AR
  // article whose content carries ](/blog/… links (the Phase-156 legacy
  // corpus). These tests pin BOTH layers of the fix: the sanitizer's
  // defensive pool normalization (below) and the JSON-safe pool cache
  // (source-contract canary in blog-editorial-rules.test.ts).
  // ═══════════════════════════════════════════════════════════════
  describe("PHASE 174 — unstable_cache JSON roundtrip must never 500 the page", () => {
    const LINKY_MD = "اقرأ [دليل الكرياتين](/blog/creatine-beginners-guide) و[دليل HIIT](/blog/hiit-home-workout-guide).";

    it("the EXACT production repro: JSON-roundtripped Set pools (→ {}) do not throw", () => {
      // This is precisely what unstable_cache hands back on a cache HIT.
      const jsonRoundtripped = JSON.parse(
        JSON.stringify({ en: POOLS.en, ar: POOLS.ar }),
      ) as unknown as BlogSlugPools;
      expect(() => fixCrossLanguageLinkPrefixes(LINKY_MD, "ar", jsonRoundtripped)).not.toThrow();
      // Degraded pools = safe no-op: links stay unchanged (never 404).
      expect(fixCrossLanguageLinkPrefixes(LINKY_MD, "ar", jsonRoundtripped)).toBe(LINKY_MD);
      // And the composed entry point too (the page-level call).
      expect(() => sanitizeBlogContent(LINKY_MD, "ar", jsonRoundtripped)).not.toThrow();
    });

    it("array-shaped pools (the JSON-safe cache fix) rewrite prefixes correctly", () => {
      const arrayPools = {
        en: [...POOLS.en],
        ar: [...POOLS.ar],
      } as unknown as BlogSlugPools;
      expect(fixCrossLanguageLinkPrefixes(LINKY_MD, "ar", arrayPools)).toBe(
        "اقرأ [دليل الكرياتين](/ar/blog/creatine-beginners-guide) و[دليل HIIT](/ar/blog/hiit-home-workout-guide).",
      );
    });

    it("null/undefined-ish pools degrade to a no-op instead of crashing (never-500s law)", () => {
      expect(() => sanitizeBlogContent(LINKY_MD, "ar", null as unknown as BlogSlugPools)).not.toThrow();
      expect(() =>
        sanitizeBlogContent(LINKY_MD, "ar", { en: null, ar: null } as unknown as BlogSlugPools),
      ).not.toThrow();
      expect(sanitizeBlogContent(LINKY_MD, "ar", null as unknown as BlogSlugPools)).toBe(LINKY_MD);
    });

    it("real Set pools keep working exactly as before (no behavior change on the happy path)", () => {
      expect(fixCrossLanguageLinkPrefixes(LINKY_MD, "ar", POOLS)).toBe(
        "اقرأ [دليل الكرياتين](/ar/blog/creatine-beginners-guide) و[دليل HIIT](/ar/blog/hiit-home-workout-guide).",
      );
    });
  });
});
