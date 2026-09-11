import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  AR_MSA_EDITOR_LAW,
  AR_DIALECT_STRONG_MARKERS,
  AR_DIALECT_WEAK_MARKERS,
  countDialectMarker,
  scanArabicDialect,
  needsMsaRepair,
  validateMsaConversion,
} from "@/lib/blog-msa";

/**
 * PHASE 175 (owner order «ابدا التنظيف») — Arabic Legacy Content Cleanup
 * tests. The cleanup converts published AR articles from Egyptian dialect
 * to Pan-Arab MSA through the production AI chain; every load-bearing
 * contract is tested here so a silent deletion reopens the defect:
 *
 *   1. The MSA law is ONE text shared by the editor tools and the
 *      cleanup runner (imported from blog-msa.ts — the 174 canary moved
 *      here when the law was extracted, protection equal).
 *   2. The dialect detector is word-boundary-aware: «المشكلة» must not
 *      count «مش», «زيادة» must not count «زي» (the Phase-174 audit's
 *      false-positive rule) — the queue decision is deterministic.
 *   3. validateMsaConversion is the pre-write gate: strong markers must
 *      be gone, links/images/headings/length preserved, and none of the
 *      banned session-service wording added (174 honesty law).
 */

const srcDir = join(process.cwd(), "src");
const libDir = join(srcDir, "lib");
const read = (p: string) => readFileSync(p, "utf-8");
const msaSrc = read(join(libDir, "blog-msa.ts"));
const processorsSrc = read(join(libDir, "ai-job-processors.ts"));

// A realistic legacy dialect paragraph (mirrors the live corpus:
// عشان/مش/ده/هتلاقي + a markdown link + an image + headings, long
// enough that body links sit OUTSIDE the closing-CTA region).
const LEGACY_BEFORE = `## مقدمة

النوم مش مجرد راحة، عشان الجسم بيصنع العضلات وأنت نايم وده السبب الرئيسي.
لو [التمارين](/exercises) مش بتطلع بنتائج كتير، السبب غالبًا في قلة الاستشفاء.

![تدريب بالأثقال](https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg)

### أهمية النوم العميق

في النوم العميق الجسم بيفرز هرمون النمو بتركيز أعلى، وده اللي بيصلح الألياف العضلية المتمزقة من التمرين. قلة النوم العميق معناها استشفاء أقل ونتائج أبطأ على المدى الطويل.

لازم تنام سبع لتسع ساعات كل ليلة بشكل منتظم، والمشكلة مش في عدد الساعات بس لكن في جودة النوم نفسه وانتظام مواعيده من يوم ليوم.

قبل النوم ابتعد عن الشاشات ساعة على الأقل واهتم بتعتيم الغرفة، عشان الجسم يدخل في دورات النوم العميق من غير مقاطعة تكسر الترميم العضلي.

### الخلاصة

هتلاقي الفرق في أسبوعين لو ظبطت نومك.`;

const MSA_AFTER = `## مقدمة

النوم ليس مجرد راحة، لأن الجسم يبني العضلات أثناء نومك وهذا هو السبب الرئيسي.
إذا لم تُظهر [التمارين](/exercises) نتائج كثيرة، فالسبب غالبًا قلة الاستشفاء.

![تدريب بالأثقال](https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg)

### أهمية النوم العميق

في النوم العميق يفرز الجسم هرمون النمو بتركيز أعلى، وهو الذي يصلح الألياف العضلية المتمزقة من التمرين. قلة النوم العميق تعني استشفاءً أقل ونتائج أبطأ على المدى الطويل.

يجب أن تنام سبعًا إلى تسع ساعات كل ليلة بانتظام، والمشكلة ليست في عدد الساعات فقط، بل في جودة النوم نفسه وانتظام مواعيده من يوم إلى يوم.

قبل النوم ابتعد عن الشاشات ساعة على الأقل واهتم بتعتيم الغرفة، حتى يدخل الجسم في دورات النوم العميق دون مقاطعة تكسر الترميم العضلي.

### الخلاصة

ستجد الفرق في أسبوعين إذا نظّمت نومك.`;

describe("Phase 175 — the MSA law is one shared text (editor tools + cleanup runner)", () => {
  it("AR_MSA_EDITOR_LAW carries the full Pan-Arab MSA editorial law (173/174 contract)", () => {
    expect(AR_MSA_EDITOR_LAW).toContain("Pan-Arab Modern Standard Arabic");
    expect(AR_MSA_EDITOR_LAW).toContain("العربية الفصحى الحديثة");
    expect(AR_MSA_EDITOR_LAW).toContain("ممنوع منعًا باتًا أي لهجة محلية (مصرية أو خليجية أو غيرها)");
    expect(AR_MSA_EDITOR_LAW).toContain("عشان، مش، ازاي، بتاع، كده، خلاص");
    expect(AR_MSA_EDITOR_LAW).toContain("الترجمة الحرفية عن الإنجليزية");
    expect(AR_MSA_EDITOR_LAW).toContain(
      "عند إعادة صياغة نص موجود بالعامية حوّله إلى الفصحى الحديثة السهلة مع الحفاظ الكامل على المعنى",
    );
  });

  it("the editor article_tools consume the law by IMPORT (no fork — single source of truth)", () => {
    expect(processorsSrc).toContain('AR_MSA_EDITOR_LAW } from "@/lib/blog-msa"');
    expect(processorsSrc).toContain("? AR_MSA_EDITOR_LAW");
    // The law text itself must NOT live inline in the processors anymore.
    expect(processorsSrc).not.toContain("أنت محرر لغوي وخبير SEO لموقع Alkemos الرياضي");
  });

  it("blog-msa.ts keeps the dialect lists disjoint and non-empty", () => {
    expect(AR_DIALECT_STRONG_MARKERS.length).toBeGreaterThan(20);
    expect(AR_DIALECT_WEAK_MARKERS.length).toBeGreaterThan(10);
    for (const m of AR_DIALECT_WEAK_MARKERS) {
      expect(AR_DIALECT_STRONG_MARKERS).not.toContain(m);
    }
  });
});

describe("Phase 175 — dialect detector (deterministic, word-boundary aware)", () => {
  it("counts standalone dialect markers", () => {
    expect(countDialectMarker("مش عايز أكل كتير", "مش")).toBe(1);
    expect(countDialectMarker("مش عايز أكل كتير", "عايز")).toBe(1);
    expect(countDialectMarker("كتير كتير من الناس", "كتير")).toBe(2);
  });

  it("does NOT count markers glued inside MSA words (audit false-positive rule)", () => {
    expect(countDialectMarker("المشكلة مش في الأكل", "مش")).toBe(1); // المشكلة ≠ مش
    expect(countDialectMarker("زيادة السعرات مفيدة", "زي")).toBe(0);
    expect(countDialectMarker("هذه المشاريع ناجحة", "دي")).toBe(0);
    expect(countDialectMarker("الشوية الأخيرة صعبة", "شوية")).toBe(0);
  });

  it("scanArabicDialect aggregates strong/weak with hit maps", () => {
    const scan = scanArabicDialect(LEGACY_BEFORE);
    expect(scan.strong).toBe(4); // عشان×2 + كتير + هتلاقي (نايم غير مدرج)
    expect(scan.weak).toBe(3); // مش×3 — «وده» ملتحقة بالواو فلا تُعد «ده» مستقلة
    expect(scan.strongHits.map(([m]) => m)).toContain("عشان");
    expect(scan.weakHits.map(([m]) => m)).toContain("مش");
  });

  it("needsMsaRepair gate: any strong hit OR ≥5 weak hits", () => {
    expect(needsMsaRepair(LEGACY_BEFORE)).toBe(true);
    expect(needsMsaRepair("مقال نظيف تمامًا بالفصحى الحديثة الواضحة لكل القراء")).toBe(false);
    // 4 scattered weak hits — tolerated (audit calibration)
    expect(needsMsaRepair("ده كمان تمام كويس")).toBe(false);
    // 5 weak hits — repair
    expect(needsMsaRepair("ده كمان تمام كويس بعدين")).toBe(true);
  });
});

describe("Phase 175 — validateMsaConversion (the pre-write gate)", () => {
  it("accepts a faithful MSA conversion (links/images/headings preserved)", () => {
    const check = validateMsaConversion(LEGACY_BEFORE, MSA_AFTER);
    expect(check.ok).toBe(true);
    expect(check.violations).toEqual([]);
    expect(check.metrics.strongBefore).toBeGreaterThan(0);
    expect(check.metrics.strongAfter).toBe(0);
  });

  it("rejects a conversion that still carries a strong dialect marker", () => {
    const bad = MSA_AFTER.replace("ستجد الفرق", "هتلاقي الفرق");
    const check = validateMsaConversion(LEGACY_BEFORE, bad);
    expect(check.ok).toBe(false);
    expect(check.violations.join(" ")).toContain("strong dialect markers remain");
  });

  it("rejects a dropped internal link (internal-linking map must survive)", () => {
    const bad = MSA_AFTER.replace("[التمارين](/exercises)", "التمارين");
    const check = validateMsaConversion(LEGACY_BEFORE, bad);
    expect(check.ok).toBe(false);
    expect(check.violations.join(" ")).toContain("link URLs not preserved");
    expect(check.violations.join(" ")).toContain("/exercises");
  });

  it("tolerates a link that vanished WITH the deleted closing-CTA paragraph (live class)", () => {
    // calculate-daily-calories-weight-loss failed 3 batches on exactly
    // this: its /meal-planner link lives INSIDE the «انضم الآن لبرنامج
    // الكوتشينج» closing marketing paragraph that rule 7 orders deleted.
    const before =
      LEGACY_BEFORE +
      "\n\n**انضم الآن لبرنامج الكوتشينج في Alkemos** واحصل على [خطة غذائية](/meal-planner) مبنية على هدفك.";
    const after =
      MSA_AFTER; // CTA paragraph (and its link) legitimately deleted
    const check = validateMsaConversion(before, after);
    expect(check.ok).toBe(true);
  });

  it("strictLinks mode (mid-article CHUNKS) rejects even CTA-adjacent link drops", () => {
    // The ramadan lesson: a middle chunk's own tail is NOT the article's
    // CTA region — its link drops are violations even though the chunk's
    // tail would have absorbed them in tolerant mode.
    const before =
      LEGACY_BEFORE +
      "\n\n**انضم الآن لبرنامج الكوتشينج في Alkemos** واحصل على [خطة غذائية](/meal-planner) مبنية على هدفك.";
    const after = MSA_AFTER;
    const check = validateMsaConversion(before, after, { ctaLinkTolerance: false });
    expect(check.ok).toBe(false);
    expect(check.violations.join(" ")).toContain("/meal-planner");
  });

  it("rejects a changed image URL (legacy images are untouchable — owner law)", () => {
    const bad = MSA_AFTER.replace(
      "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg",
      "https://example.com/other.jpg",
    );
    const check = validateMsaConversion(LEGACY_BEFORE, bad);
    expect(check.ok).toBe(false);
    expect(check.violations.join(" ")).toContain("image URLs changed");
  });

  it("rejects truncation and inflation (word-count ratio bounds)", () => {
    const truncated = MSA_AFTER.split("\n").slice(0, 3).join("\n");
    const check = validateMsaConversion(LEGACY_BEFORE, truncated);
    expect(check.ok).toBe(false);
    expect(check.violations.join(" ")).toContain("ratio out of bounds");

    const inflated = MSA_AFTER + "\n\n" + "شرح مطوّل ".repeat(400);
    const check2 = validateMsaConversion(LEGACY_BEFORE, inflated);
    expect(check2.ok).toBe(false);
    expect(check2.violations.join(" ")).toContain("ratio out of bounds");
  });

  it("tolerates a SINGLE heading merge (live batch evidence: otherwise-perfect conversions)", () => {
    // 2 headings → 1: the near-duplicate merge case observed twice live
    // (headings dropped 10→9 with everything else passing) — tolerated.
    const merged = MSA_AFTER.replace("### الخلاصة\n\n", "");
    const check = validateMsaConversion(LEGACY_BEFORE, merged);
    expect(check.ok).toBe(true);
  });

  it("rejects a heading collapse of 2+ (structure must survive)", () => {
    const collapsed = MSA_AFTER
      .replace("### الخلاصة\n\n", "")
      .replace("## مقدمة\n\n", "");
    const check = validateMsaConversion(LEGACY_BEFORE, collapsed);
    expect(check.ok).toBe(false);
    expect(check.violations.join(" ")).toContain("headings collapsed");
    expect(check.violations.join(" ")).toContain("مقدمة");
  });

  it("rejects NEW banned session-service wording (174 honesty law)", () => {
    const bad = MSA_AFTER + "\n\nاحجز جلسة مع المدرب الآن.";
    const check = validateMsaConversion(LEGACY_BEFORE, bad);
    expect(check.ok).toBe(false);
    expect(check.violations.join(" ")).toContain("banned session-service wording added");
  });

  it("a conversion that does not improve weak markers is rejected", () => {
    const lazy = LEGACY_BEFORE.replace("عشان", "لأن").replace("هتلاقي", "ستجد");
    // مش×3 و ده و كتير بقيت كما هي — لم يتحسن العدّ الضعيف
    const check = validateMsaConversion(LEGACY_BEFORE, lazy);
    expect(check.ok).toBe(false);
    expect(check.violations.join(" ")).toContain("did not improve");
  });

  it("a CLEAN chunk passes 0→0 (the 175.7 chunked-run bug)", () => {
    // Preambles (before the first ##) are often already MSA — the weak
    // "improvement" check must not fail a clean-input chunk 0→0 (this
    // exact bug killed three articles at chunk 1 in the chunked run).
    const cleanBefore = "## مقدمة\n\nمقدمة نظيفة بالفصحى الحديثة السهلة والواضحة.";
    const cleanAfter = "## مقدمة\n\nمقدمة نظيفة بالفصحى الحديثة السهلة والواضحة.";
    const check = validateMsaConversion(cleanBefore, cleanAfter);
    expect(check.ok).toBe(true);
  });
});

describe("Phase 175 — cleanup runner + workflow presence (canaries)", () => {
  it("the runner script exists and rides the shared law + validator (no fork)", () => {
    const runner = read(join(process.cwd(), "scripts", "blog-runner", "legacy-ar-msa.mts"));
    expect(runner).toContain("AR_MSA_EDITOR_LAW");
    expect(runner).toContain("validateMsaConversion");
    expect(runner).toContain("needsMsaRepair");
    // Scope guard: the ONLY DB write is the pinned update payload —
    // content/reading_time/updated_at (slug/title/publish state/images
    // are untouchable by law 121/173/175).
    expect(runner).toContain(
      `update({
        content: result.text,
        reading_time,
        updated_at: new Date().toISOString(),
      })`,
    );
    expect(runner).toContain('eq("language", "ar")');
    expect(runner).toContain('eq("is_published", true)');
  });

  it("the dispatchable workflow exists with the secrets the chain needs", () => {
    const wf = read(join(process.cwd(), ".github", "workflows", "legacy-ar-cleanup.yml"));
    expect(wf).toContain("workflow_dispatch");
    expect(wf).toContain("legacy-ar-msa.mts");
    expect(wf).toContain("secrets.SUPABASE_SERVICE_ROLE_KEY");
    expect(wf).toContain("secrets.OPENROUTER_API");
    expect(wf).toContain("secrets.GROQ_API_KEY");
    expect(wf).toContain("secrets.NVIDIA_API_KEY");
    expect(wf).toContain("PATCH_DIR: ${{ inputs.apply_patches");
  });

  it("the manual MSA patches exist for the two chain-unconvertible articles (175.10)", () => {
    // The two stubborn articles (25+ failed AI attempts each) got
    // hand-written Pan-Arab MSA conversions, gated by the SAME
    // deterministic validator before any DB write.
    for (const slug of [
      "calculate-daily-calories-weight-loss",
      "best-protein-supplement-ramadan",
    ]) {
      const patch = read(
        join(process.cwd(), "scripts", "legacy-msa-patches", `${slug}.md`),
      );
      expect(patch.length).toBeGreaterThan(4000);
      expect(patch).toMatch(/^# /);
      expect(scanArabicDialect(patch).strong).toBe(0);
    }
  });

  it("the workflow funds FULL-ARTICLE conversion time (first apply run failed without it)", () => {
    // The default 52s chain budget is the Vercel serverless cap — a
    // ~1000-word article conversion needs the blog-post workflows' own
    // 360s budget law, or every model aborts at ~17s and the chain dies.
    const wf = read(join(process.cwd(), ".github", "workflows", "legacy-ar-cleanup.yml"));
    expect(wf).toContain('AI_CHAIN_TOTAL_BUDGET_MS: "360000"');
  });

  it("the runner rides P2's proven full-article chain knobs and treats chain throws as retryable", () => {
    const runner = read(join(process.cwd(), "scripts", "blog-runner", "legacy-ar-msa.mts"));
    expect(runner).toContain("maxTokens: 6_400");
    expect(runner).toContain("timeoutMs: 150_000");
    expect(runner).toContain("maxModels: 2");
    // Provider-outage throws (gemma 429 pool, nemotron aborts) are a
    // RETRYABLE attempt — never a run crash.
    expect(runner).toContain("chain-thrown (transient provider class)");
    // Degenerate payloads (zero Arabic chars — the nvidia reasoning-model
    // "success" class observed live in run 34522943898) are rejected at
    // the sentinel parser, never validated as content.
    expect(runner).toContain("الناتج بلا محتوى عربي");
    // The stubborn-article path: chunked section-by-section conversion,
    // per-chunk validation + full assembled validation.
    expect(runner).toContain("convertArticleChunked");
    expect(runner).toContain("splitIntoChunks");
    const wfChunk = read(join(process.cwd(), ".github", "workflows", "legacy-ar-cleanup.yml"));
    expect(wfChunk).toContain("CHUNKED: ${{ inputs.chunked");
  });
});

// ─────────────────────────────────────────────────────────────────
// PHASE 176 — Latin contamination (owner report «التعديلات الجديدة
// اختفت مرة أخرى»; live evidence: the 09-11 AR article
// best-protein-timing-after-workout shipped "يُ marketed"، "لا توجد
// evidences"، "shake مصل اللبن"، "الكرياتين alkalin"، the corrupted
// glued token «كريAlkaline)», and "vs" inside an Arabic H2).
// ─────────────────────────────────────────────────────────────────
import {
  scanLatinContamination,
  needsLatinRepair,
} from "@/lib/blog-msa";

describe("Phase 176 — Latin contamination detector (deterministic)", () => {
  it("flags the LIVE incident tokens: bare English inside Arabic sentences", () => {
    const live = [
      "الكرياتين ألالين يُ marketed على أنه أكثر استقراراً في الحامض المعدي.",
      "لا توجد evidences واضحة عن آثار سلبية طويلة المدى للكرياتين.",
      "خلال 0-30 دقيقة بعد التمرين: shake مصل اللبن أو وجبة صلبة سريعة الهضم.",
      "إذا كنت تبحث عن simplicity وتكلفة منخفضة، اختر المونوهيدرات.",
    ].join("\n");
    const scan = scanLatinContamination(live);
    expect(scan.count).toBeGreaterThanOrEqual(4);
    for (const t of ["marketed", "evidences", "shake", "simplicity"]) {
      expect(scan.tokens).toContain(t);
    }
    expect(needsLatinRepair(live)).toBe(true);
  });

  it("flags 'vs' inside an Arabic H2 heading (should be «مقابل»)", () => {
    const scan = scanLatinContamination("## مقارنة الكرياتين مونوهيدرات vs كرياتين ألكالين");
    expect(scan.tokens).toContain("vs");
  });

  it("flags the GLUED corrupted token كريAlkaline even inside a gloss parenthesis", () => {
    const scan = scanLatinContamination(
      "الكرياتين ألكالين (يُسمّى أيضاً كرياتين بوفّر أو كريAlkaline) يُسوَّق على أنه أكثر استقراراً.",
    );
    expect(scan.count).toBe(1);
    expect(scan.tokens).toContain("alkaline");
  });

  it("allows the accepted MSA gloss convention: «مصل اللبن (Whey)»", () => {
    const scan = scanLatinContamination(
      "مصل اللبن (Whey) المركّز أو المعزول: يُهضم بسرعة ويوفر الليوسين بكمية كافية.",
    );
    expect(scan.count).toBe(0);
  });

  it("ignores image markdown (Pexels alt texts are English BY DESIGN)", () => {
    const scan = scanLatinContamination(
      "![A spacious gym featuring benches and weights](https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg)\n\nالتمرين التالي يقوي الصدر.",
    );
    expect(scan.count).toBe(0);
  });

  it("strips link TARGETS but still scans the ANCHOR text (visible prose)", () => {
    const clean = scanLatinContamination("اقرأ [دليل التمارين](/exercises) للمزيد.");
    expect(clean.count).toBe(0);
    const dirty = scanLatinContamination("اقرأ [the complete guide](/blog/x) للمزيد.");
    expect(dirty.tokens).toContain("the");
  });

  it("whitelists brands/units/acronyms with no Arabic running form", () => {
    const scan = scanLatinContamination(
      "Alkemos و EVO هما منصة Alkemos، مقياس BMI، تدريبات HIIT، جرام kg واحد.",
    );
    expect(scan.count).toBe(0);
  });

  it("flags a fully-English line inside an AR article", () => {
    const scan = scanLatinContamination("The anabolic window is approximately 30 minutes long.");
    expect(scan.count).toBeGreaterThanOrEqual(4);
  });

  it("skips fenced code blocks entirely", () => {
    const scan = scanLatinContamination("```\nconsole.log('hello world');\n```\n\nالنص العربي بعده.");
    expect(scan.count).toBe(0);
  });

  it("empty input scans clean and the gate stays closed", () => {
    expect(scanLatinContamination("").count).toBe(0);
    expect(needsLatinRepair("نص عربي سليم تمامًا بدون أي خلط.")).toBe(false);
    expect(needsLatinRepair("يُ marketed")).toBe(true);
  });
});

describe("Phase 176 — validateMsaConversion Latin clause (pre-write gate extension)", () => {
  it("accepts the clean MSA fixture (0→0 Latin passes — clean input stays clean)", () => {
    const check = validateMsaConversion(LEGACY_BEFORE, MSA_AFTER);
    expect(check.ok).toBe(true);
    expect(check.metrics.latinBefore).toBe(0);
    expect(check.metrics.latinAfter).toBe(0);
  });

  it("rejects a conversion that still carries bare Latin tokens", () => {
    const contaminated = `${MSA_AFTER}\n\nيُ marketed على أنه أكثر استقراراً في الحامض المعدي.`;
    const check = validateMsaConversion(LEGACY_BEFORE, contaminated);
    expect(check.ok).toBe(false);
    expect(check.violations.join(" ")).toContain("latin contamination");
  });

  it("rejects a conversion that INTRODUCES Latin into a clean input (0→N)", () => {
    const contaminated = `${MSA_AFTER}\n\nلا توجد evidences واضحة.`;
    const check = validateMsaConversion(LEGACY_BEFORE, contaminated);
    expect(check.ok).toBe(false);
    expect(check.metrics.latinAfter).toBe(1);
  });
});

describe("Phase 176 — law + runner contracts (canaries against silent deletion)", () => {
  it("AR_MSA_EDITOR_LAW bans raw Latin mixing inside Arabic prose (the 176 clause)", () => {
    expect(AR_MSA_EDITOR_LAW).toContain("خلط كلمات إنجليزية/لاتينية سائبة");
    expect(AR_MSA_EDITOR_LAW).toContain("مصل اللبن (Whey)");
  });

  it("the cleanup runner gates the queue on dialect OR Latin and carries the Latin replacement rule", () => {
    const runner = read(join(process.cwd(), "scripts", "blog-runner", "legacy-ar-msa.mts"));
    expect(runner).toContain("needsLatinRepair");
    expect(runner).toContain("scanLatinContamination");
    expect(runner).toContain("عدد الكلمات اللاتينية السائبة في الناتج = 0");
    expect(runner).toContain("كريAlkaline");
    // The deterministic FAQ-hygiene mode is OPT-IN (default keeps the
    // exact Phase-175 write surface).
    expect(runner).toContain('process.env.FAQ_HYGIENE === "1"');
    expect(runner).toContain("filterFaqsByRelevance");
    expect(runner).toContain("stripFaqQuestionLabel");
  });
});
