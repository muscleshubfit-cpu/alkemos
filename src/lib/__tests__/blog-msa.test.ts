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
// عشان/مش/ده/هتلاقي + a markdown link + an image + headings).
const LEGACY_BEFORE = `## مقدمة

النوم مش مجرد راحة، عشان الجسم بيصنع العضلات وأنت نايم وده السبب الرئيسي.
لو [التمارين](/exercises) مش بتطلع بنتائج كتير، السبب غالبًا في قلة الاستشفاء.

![تدريب بالأثقال](https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg)

### الخلاصة

هتلاقي الفرق في أسبوعين لو ظبطت نومك.`;

const MSA_AFTER = `## مقدمة

النوم ليس مجرد راحة، لأن الجسم يبني العضلات أثناء نومك وهذا هو السبب الرئيسي.
إذا لم تُظهر [التمارين](/exercises) نتائج كثيرة، فالسبب غالبًا قلة الاستشفاء.

![تدريب بالأثقال](https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg)

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
    expect(scan.strong).toBe(3); // عشان + كتير + هتلاقي (نايم غير مدرج)
    expect(scan.weak).toBe(2); // مش×2 — «وده» ملتحقة بالواو فلا تُعد «ده» مستقلة
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
    // مش×2 و ده و كتير بقيت كما هي — لم يتحسن العدّ الضعيف
    const check = validateMsaConversion(LEGACY_BEFORE, lazy);
    expect(check.ok).toBe(false);
    expect(check.violations.join(" ")).toContain("did not improve");
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
  });
});
