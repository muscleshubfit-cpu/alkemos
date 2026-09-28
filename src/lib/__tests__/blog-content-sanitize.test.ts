/**
 * Phase 156 (SEO-GEO-4.8, §7.1 #15) — blog-content-sanitize tests.
 * Every case below is derived from the live audit of the 63 published
 * posts (2026-09-09): 85 wrong-prefix links in 24 AR posts, 3 raw HTML
 * anchors in best-dynamic-stretching-before-gym, 3 CJK tokens.
 */
import { describe, expect, it } from "vitest";

import {
  fixArMirrorFamilies,
  fixCrossLanguageLinkPrefixes,
  fixKnownCorruptions,
  fixLegacyRedirectLinks,
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
  it("applies raw-anchor conversion → corruption fix → legacy rewrite → family rewrite → prefix rewrite in one pass", () => {
    const md =
      'تدريب:<a href="/tools/water-tracker">متتبع الماء</a> ثم راحة超过 3 دقائق و[الكرياتين](/blog/creatine-beginners-guide).';
    // Access-point fix (2026-09-14): the converted raw anchor is now ALSO
    // localized to its /ar mirror by fixArMirrorFamilies — the old
    // expectation kept the EN href, which was the audited locale leak.
    expect(sanitizeBlogContent(md, "ar", POOLS)).toBe(
      "تدريب:[متتبع الماء](/ar/tools/water-tracker) ثم راحةأكثر من 3 دقائق و[الكرياتين](/ar/blog/creatine-beginners-guide).",
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

describe("fixArMirrorFamilies (access-point fix 2026-09-14 audit)", () => {
  it("localizes the audited EN tool/exercise/food links inside AR bodies", () => {
    const md =
      "استخدم [حاسبة السعرات](/tools/calorie-calculator) و[حاسبة الماكروز](/tools/macro-calculator)، وشاهد [مكتبة التمارين](/exercises) و[الأطعمة](/foods) و[مخطط الوجبات](/meal-planner).";
    expect(fixArMirrorFamilies(md, "ar")).toBe(
      "استخدم [حاسبة السعرات](/ar/tools/calorie-calculator) و[حاسبة الماكروز](/ar/tools/macro-calculator)، وشاهد [مكتبة التمارين](/ar/exercises) و[الأطعمة](/ar/foods) و[مخطط الوجبات](/ar/meal-planner).",
    );
  });

  it("localizes detail subpaths of every mirrored family (verified /ar routes)", () => {
    const md =
      "[تمرين](/exercises/plank) [برنامج](/programs/home-beginner-fullbody) [مجموعة](/collections/high-protein-foods) [عضلة](/muscles/chest) [معدة](/equipment/bodyweight) [خطة](/diet-plan/cutting) [مقارنة](/compare/alkemos-vs-exrx) [أداة](/tools/bmi-calculator).";
    expect(fixArMirrorFamilies(md, "ar")).toBe(
      "[تمرين](/ar/exercises/plank) [برنامج](/ar/programs/home-beginner-fullbody) [مجموعة](/ar/collections/high-protein-foods) [عضلة](/ar/muscles/chest) [معدة](/ar/equipment/bodyweight) [خطة](/ar/diet-plan/cutting) [مقارنة](/ar/compare/alkemos-vs-exrx) [أداة](/ar/tools/bmi-calculator).",
    );
  });

  it("NEVER touches owner-protected or mirror-less paths (EVO / affiliate / coaches / auth)", () => {
    const md =
      "[EVO](/evo) [أفلييت](/affiliate) [مدربون](/for-coaches) [دخول](/auth) [سلة](/checkout) [مدربون2](/coaches).";
    expect(fixArMirrorFamilies(md, "ar")).toBe(md);
  });

  it("is idempotent: already-AR links pass through untouched", () => {
    const md = "[حاسبة السعرات](/ar/tools/calorie-calculator) و[الرئيسية](/ar).";
    expect(fixArMirrorFamilies(md, "ar")).toBe(md);
  });

  it("EN content is never touched (audit: zero EN posts link AR paths)", () => {
    const md = "Use the [calorie calculator](/tools/calorie-calculator) and [exercises](/exercises).";
    expect(fixArMirrorFamilies(md, "en")).toBe(md);
  });
});

describe("fixLegacyRedirectLinks (access-point fix 2026-09-14 audit)", () => {
  it("rewrites the audited EN 301 link to its final post", () => {
    const md = "اقرأ [الخطة](/blog/4-week-beginner-hypertrophy-plan) للتفاصيل.";
    expect(fixLegacyRedirectLinks(md, "en")).toBe(
      "اقرأ [الخطة](/blog/4-week-beginner-muscle-building-plan) للتفاصيل.",
    );
  });

  it("rewrites the audited AR 301 link to its final post", () => {
    const md = "[السعرات](/ar/blog/sleep-recovery-gym-results-3pc8) مهمة.";
    expect(fixLegacyRedirectLinks(md, "ar")).toBe(
      "[السعرات](/ar/blog/sleep-recovery-gym-results) مهمة.",
    );
  });

  it("rewrites the dead /blog/muscle-building-bodyweight-home links (4 AR bodies) to the live AR guide", () => {
    const md = "تدريب منزلي: [بناء العضلات](/blog/muscle-building-bodyweight-home) بدون معدات.";
    expect(fixLegacyRedirectLinks(md, "ar")).toBe(
      "تدريب منزلي: [بناء العضلات](/ar/blog/home-muscle-building-guide-no-equipment) بدون معدات.",
    );
  });

  it("is language-scoped: the EN mapping never fires on AR content and vice versa", () => {
    const md = "[الخطة](/blog/4-week-beginner-hypertrophy-plan)";
    expect(fixLegacyRedirectLinks(md, "ar")).toBe(md);
    const md2 = "[السعرات](/ar/blog/sleep-recovery-gym-results-3pc8)";
    expect(fixLegacyRedirectLinks(md2, "en")).toBe(md2);
  });

  it("is idempotent: final destinations are not themselves legacy targets", () => {
    const md = "[الخطة](/blog/4-week-beginner-muscle-building-plan)";
    expect(fixLegacyRedirectLinks(fixLegacyRedirectLinks(md, "en"), "en")).toBe(md);
  });
});

describe("sanitizeBlogContent — access-point fix integration (2026-09-14)", () => {
  it("one AR pass localizes tool links, repairs dead links, and keeps EVO untouched", () => {
    const md =
      "احسب [سعراتك](/tools/calorie-calculator)، واقرأ [الخطة المنزلية](/blog/muscle-building-bodyweight-home)، وجرّب [EVO](/evo).";
    expect(sanitizeBlogContent(md, "ar", POOLS)).toBe(
      "احسب [سعراتك](/ar/tools/calorie-calculator)، واقرأ [الخطة المنزلية](/ar/blog/home-muscle-building-guide-no-equipment)، وجرّب [EVO](/evo).",
    );
  });
});

/**
 * CONTENT-AUDIT (2026-09-28) — §4.4 UNWIND: the ⑥⑦⑧ functions below were
 * REMOVED from the composed render pipeline after their blog_posts rows
 * were migrated by the GHA remediation channel
 * (scripts/blog-runner/content-audit-db-remediation.mts — the script
 * imports these exact functions as its transform law; no fork). The unit
 * tests stay as the channel's contract; the first canary pins the unwound
 * composition so a silent re-addition to sanitizeBlogContent fails the
 * build. Every case is derived from a live article, not invented.
 */
import {
  fixBrokenWordLinkSplits,
  fixIntroLabelDuplication,
  fixKeywordFillerTails,
} from "../blog-content-sanitize";
import { renderMarkdown } from "../blog";

describe("sanitizeBlogContent — §4.4 unwind canary (DB is the single source of truth)", () => {
  it("markdown-shape defects pass through the render pipeline UNTOUCHED (rows are fixed in the DB)", () => {
    // A stored kaf split — must survive the composed pipeline verbatim now
    // (already /ar-prefixed so the ④ family rewriter is a no-op on it too).
    const kaf = "إذا شعرت أن [تمارين](/ar/exercises)ك لا تظهر بنتائج، فالسبب قلة الاستشفاء.";
    expect(sanitizeBlogContent(kaf, "ar", POOLS)).toBe(kaf);
    // A stored filler tail — idem (EN).
    const filler =
      "The typical protein target is 1.6–2.2 g per kilogram per day, answering the common query of how many grams of protein per day to build muscle.";
    expect(sanitizeBlogContent(filler, "en", POOLS)).toBe(filler);
    // A duplicated «مقدمة:» label — idem (AR).
    const intro = "مقدمة: حلمك بجسم رشيق يبدأ من الفهم.\n\n## مقدمة: لماذا يحتاج الجسم إلى نظام غذائي؟";
    expect(sanitizeBlogContent(intro, "ar", POOLS)).toBe(intro);
  });
});

describe("renderMarkdown — markdown table separator rows never render (audit P0-2, 4 live articles)", () => {
  it("a `| --- | --- |` separator row is dropped, data rows survive", () => {
    const md = [
      "| الوجبة | السعرات |",
      "| --- | --- |",
      "| الفطور | 522 |",
    ].join("\n");
    const html = renderMarkdown(md);
    expect(html).not.toContain(">---<");
    expect(html).toContain("الفطور");
    expect(html).toContain("522");
  });

  it("aligned-colon separators (`|:---|:---:|`) are dropped too", () => {
    const md = "| A | B |\n|:---|:---:|\n| 1 | 2 |";
    const html = renderMarkdown(md);
    expect(html).not.toContain(">---<");
    expect(html).not.toContain(">:---<");
    expect(html).toContain(">2<");
  });

  it("a data row that legitimately contains dashes is NOT dropped", () => {
    const md = "| التمرين | المجموعات |\n| --- | --- |\n| 5×5 | 3 - 5 |";
    const html = renderMarkdown(md);
    expect(html).toContain("5×5");
    expect(html).toContain("3 - 5");
  });
});

describe("fixBrokenWordLinkSplits — the split-word kaf (channel law; audit §1.2, 5 live instances)", () => {
  it("moves an orphan kaf into the anchor: [سعرات](url)ك → [سعراتك](url)", () => {
    const md = "تعلّم كيف تحسب [سعرات](/ar/tools/calorie-calculator)ك بدقة كل يوم.";
    expect(fixBrokenWordLinkSplits(md)).toBe(
      "تعلّم كيف تحسب [سعراتك](/ar/tools/calorie-calculator) بدقة كل يوم.",
    );
  });

  it("keeps the possessive when followed by punctuation or space only — never eats the next word", () => {
    const md = "راقب [تمارين](/ar/exercises/pushups)ك لا تظهر نتائج، فغير البرنامج.";
    expect(fixBrokenWordLinkSplits(md)).toBe(
      "راقب [تمارينك](/ar/exercises/pushups) لا تظهر نتائج، فغير البرنامج.",
    );
  });

  it("does NOT touch a link already ending with ك (no double-kaf) or followed by other letters", () => {
    const ok = "راجع [حسابك](/ar/tools/calorie-calculator) اليوم.";
    expect(fixBrokenWordLinkSplits(ok)).toBe(ok);
    const joined = "راجع [الرابط](/ar/tools/calorie-calculator)هنا الآن.";
    // followed by a full word (no boundary) → left untouched (conservative)
    expect(fixBrokenWordLinkSplits(joined)).toBe(joined);
  });

  it("is idempotent", () => {
    const md = "احسب [سعرات](/ar/tools/calorie-calculator)ك اليومية.";
    const once = fixBrokenWordLinkSplits(md);
    expect(fixBrokenWordLinkSplits(once)).toBe(once);
  });
});

describe("fixKeywordFillerTails — 'answering the common query of…' (channel law; audit §1.3)", () => {
  it("deletes the recorded filler tail, keeps the sentence period (live creatine article)", () => {
    const md =
      "For reference, the typical protein target for muscle growth is about 1.6–2.2 g per kilogram per day, answering the common query of how many grams of protein per day to build muscle.";
    expect(fixKeywordFillerTails(md, "en")).toBe(
      "For reference, the typical protein target for muscle growth is about 1.6–2.2 g per kilogram per day.",
    );
  });

  it("never fires on AR content or on prose without the template", () => {
    const md = "جملة عربية عادية تذكر queries without any template.";
    expect(fixKeywordFillerTails(md, "ar")).toBe(md);
    const en = "A sentence that merely answers the question of rest periods honestly.";
    expect(fixKeywordFillerTails(en, "en")).toBe(en);
  });
});

describe("fixIntroLabelDuplication — «مقدمة:» twice before content (channel law; audit §1.2, 11 live articles)", () => {
  it("strips the label from an H2, keeping the topic", () => {
    const md = "## مقدمة: لماذا يحتاج الجسم إلى نظام غذائي؟\nنص الفقرة.";
    expect(fixIntroLabelDuplication(md, "ar")).toBe("## لماذا يحتاج الجسم إلى نظام غذائي؟\nنص الفقرة.");
  });

  it("strips the redundant leading label from the opening paragraph (after an H1 title line)", () => {
    const md = "# خطة أسبوعية لحرق الدهون\nمقدمة: حلمك بجسم رشيق يبدأ من الفهم.\n\n## أول قسم";
    expect(fixIntroLabelDuplication(md, "ar")).toBe(
      "# خطة أسبوعية لحرق الدهون\nحلمك بجسم رشيق يبدأ من الفهم.\n\n## أول قسم",
    );
  });

  it("never fires on EN content or when there is no label", () => {
    const md = "## Introduction: why it matters\nBody text.";
    expect(fixIntroLabelDuplication(md, "en")).toBe(md);
  });
});
