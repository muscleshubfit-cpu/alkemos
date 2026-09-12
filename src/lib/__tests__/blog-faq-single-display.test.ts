import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { stripFaqSectionFromBody, FAQ_HEADING_RE } from "@/lib/blog-msa";
import { splitFaqSection } from "@/lib/blog-pipeline";

/**
 * PHASE 178 — FAQ single-display law (owner-approved content-quality
 * batch 2026-09-12). Live audit: every published article (72/72)
 * rendered the FAQ section TWICE — the markdown body's own FAQ section
 * AND the faq_json cards, with identical Q&A. The render path now strips
 * the body section whenever faq_json is non-empty (BlogArticlePage).
 *
 * Guarded contracts:
 *   1. stripFaqSectionFromBody removes the body FAQ section (heading →
 *      next H2 or EOF) in both languages and leaves everything else
 *      byte-identical.
 *   2. Idempotent: stripping twice == stripping once.
 *   3. A body without a recognizable FAQ heading passes through
 *      unchanged (post-172 articles lifted at publish).
 *   4. The heading contract is ONE regex shared by the publish-time
 *      lift (splitFaqSection) and the render-time strip — no fork.
 */

// Mirrors the live legacy corpus: body ends with a markdown FAQ section
// (bold questions, single-newline separation — the Phase-172.1 format).
const EN_BODY = `## Introduction

Training volume drives hypertrophy. Keep protein high and sleep well.

## How it works

Three steps. Then a FAQ section at the end.

## Frequently Asked Questions

**how much protein do i need to build muscle**

Aim for 1.6–2.2 g of protein per kilogram of body weight daily.

**what is the best time to take creatine**

Post-workout on training days.
`;

const EN_BODY_STRIPPED = `## Introduction

Training volume drives hypertrophy. Keep protein high and sleep well.

## How it works

Three steps. Then a FAQ section at the end.`;

const AR_BODY = `## المقدمة

حجم التدريب يحفز التضخم. حافظ على البروتين والنوم.

## الأسئلة الشائعة

**كم ساعة نوم أحتاجها لبناء العضلات؟**

من 7 إلى 9 ساعات للبالغين.

**ما هو أفضل وقت لتناول الكرياتين؟**

بعد التمرين في أيام التدريب.
`;

const AR_BODY_STRIPPED = `## المقدمة

حجم التدريب يحفز التضخم. حافظ على البروتين والنوم.`;

describe("stripFaqSectionFromBody (Phase 178 — FAQ single-display)", () => {
  it("removes the trailing EN FAQ section, keeps the rest verbatim", () => {
    expect(stripFaqSectionFromBody(EN_BODY)).toBe(EN_BODY_STRIPPED);
  });

  it("removes the trailing AR FAQ section (الأسئلة الشائعة)", () => {
    expect(stripFaqSectionFromBody(AR_BODY)).toBe(AR_BODY_STRIPPED);
  });

  it("is idempotent — stripping twice equals stripping once", () => {
    const once = stripFaqSectionFromBody(EN_BODY);
    expect(stripFaqSectionFromBody(once)).toBe(once);
  });

  it("passes a body without a FAQ heading through unchanged", () => {
    const noFaq = `## Intro\n\nNo FAQ here.\n\n## Section\n\nContent.`;
    expect(stripFaqSectionFromBody(noFaq)).toBe(noFaq);
  });

  it("stops at the next H2 — a post-FAQ CTA section survives", () => {
    const withCta = `## FAQ\n\n**q?**\n\na.\n\n## Next steps\n\nCTA text.`;
    const out = stripFaqSectionFromBody(withCta);
    expect(out).toContain("## Next steps");
    expect(out).toContain("CTA text.");
    expect(out).not.toContain("**q?**");
  });

  it("does not match an h3-level FAQ heading (## only, per the contract)", () => {
    const h3Faq = `### FAQ\n\n**q?** a.`;
    expect(stripFaqSectionFromBody(h3Faq)).toBe(h3Faq);
  });

  it("tolerant heading variants: lowercase 'faq' and extra spacing", () => {
    const variant = `## faq\n\n**q?** a.`;
    expect(stripFaqSectionFromBody(variant)).not.toContain("**q?**");
  });
});

describe("FAQ heading contract — one regex, no fork (Phase 178)", () => {
  it("blog-pipeline's splitFaqSection rides the SAME heading regex", () => {
    // The publish-time lift must find a heading in exactly the bodies the
    // render-time strip removes — the shared FAQ_HEADING_RE guarantees it.
    expect(FAQ_HEADING_RE.test("## Frequently Asked Questions")).toBe(true);
    expect(FAQ_HEADING_RE.test("## الأسئلة الشائعة")).toBe(true);
    const { body, faqs } = splitFaqSection("en", EN_BODY);
    expect(faqs.length).toBe(2);
    // The pipeline's lift appends the terminal "?" to a bare query —
    // the raw question text is preserved verbatim before that.
    expect(faqs[0].question).toBe("how much protein do i need to build muscle?");
    // The pipeline body (minus the FAQ) and the render strip agree.
    expect(stripFaqSectionFromBody(EN_BODY)).toBe(body);
  });

  it("the shared regex is the ONLY heading contract in the pipeline source", () => {
    // Fork guard: blog-pipeline.ts must IMPORT FAQ_HEADING_RE from
    // blog-msa.ts, not re-declare its own copy (the Phase-169 doctrine).
    const pipelineSrc = readFileSync("src/lib/blog-pipeline.ts", "utf8");
    expect(pipelineSrc).toContain("FAQ_HEADING_RE");
    expect(pipelineSrc).not.toMatch(
      /const FAQ_HEADING_RE\s*=\s*\/\^##/,
    );
  });
});
