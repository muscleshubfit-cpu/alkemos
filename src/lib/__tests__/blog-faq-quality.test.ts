import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ensureFaqSection,
  splitFaqSection,
} from "@/lib/blog-pipeline";
import { extractH2s } from "@/lib/blog-topics";
import type { LanguageResearch } from "@/lib/blog-research";

/**
 * PHASE 172 (owner order — blog GEO/E-E-A-T content-quality push) tests:
 *   1. The FAQ markdown contract — splitFaqSection lifts the
 *      article-specific FAQ section into faq_json shape and removes it
 *      from the body (kills the live double-FAQ render + generic-FAQ
 *      filler evidence).
 *   2. ensureFaqSection's relevance filter — the deterministic safety
 *      net no longer appends niche-generic off-topic questions.
 *   3. extractH2s — the H2 skeleton feed for P0/P1 anti-repetition
 *      differentiation context.
 *   4. Prompt-contract guards (the repo's read-the-source pattern):
 *      the answer-first / E-E-A-T / fact-guard / FAQ-intent laws must
 *      stay present in the live prompts.
 */

const RESEARCH: LanguageResearch = {
  keywords: [
    { keyword: "creatine loading phase", searchVolume: "high" },
    { keyword: "how to calculate daily calories", searchVolume: "high" },
  ],
  faqs: [
    {
      question: "How many grams of creatine should I take during loading?",
      answer: "A common range is 20 g per day split into four doses for 5-7 days.",
    },
    {
      question: "What is the best time of day to take creatine?",
      answer: "Consistency matters more than timing.",
    },
    {
      question: "Does intermittent fasting help with muscle gain?",
      answer: "It can, if total calories and protein are adequate.",
    },
    {
      question: "How often should I deload?",
      answer: "Every 4-8 weeks of hard training.",
    },
    {
      question: "What are the best supplements for joint pain?",
      answer: "Glucosamine and omega-3s have the most evidence.",
    },
    {
      question: "Can you build muscle with bodyweight exercises only?",
      answer: "Yes, with progressive overload.",
    },
  ],
  topics: ["How to do a creatine loading phase safely"],
} satisfies LanguageResearch;

// ─────────────────────────────────────────────────────────────────
// splitFaqSection — the FAQ markdown contract
// ─────────────────────────────────────────────────────────────────

const EN_ARTICLE = `First paragraph answers the question directly.

## How much creatine should I take

Content about dosage.

## Frequently Asked Questions

**How much creatine per day during loading?**

A common approach is 20 g daily, split into four 5 g doses, for 5-7 days.

**Do I need to load at all?**

No — 3-5 g daily reaches saturation in about three weeks.
`;

describe("splitFaqSection (EN)", () => {
  it("lifts the FAQ section into Q/A pairs and removes it from the body", () => {
    const { body, faqs } = splitFaqSection("en", EN_ARTICLE);
    expect(faqs).toHaveLength(2);
    expect(faqs[0]).toEqual({
      question: "How much creatine per day during loading?",
      answer: "A common approach is 20 g daily, split into four 5 g doses, for 5-7 days.",
    });
    expect(faqs[1].question).toBe("Do I need to load at all?");
    expect(body).toContain("## How much creatine should I take");
    expect(body).not.toContain("Frequently Asked Questions");
    expect(body).not.toContain("**How much creatine per day during loading?**");
  });

  it("appends a question mark when the model omitted it", () => {
    const md = `Intro.

## Frequently Asked Questions

**How long is the loading phase**

Five to seven days is typical.
`;
    const { faqs } = splitFaqSection("en", md);
    expect(faqs[0].question).toBe("How long is the loading phase?");
  });

  it("strips markdown links and bold from answers (plain-text FAQ cards)", () => {
    const md = `Intro.

## FAQ

**Is creatine safe for beginners?**

Yes — see the [beginner guide](/blog/beginner-guide) for **dosing details**.
`;
    const { faqs } = splitFaqSection("en", md);
    expect(faqs[0].answer).toBe("Yes — see the beginner guide for dosing details.");
  });

  it("preserves content that FOLLOWS the FAQ section (e.g. a closing CTA H2)", () => {
    const md = `Intro.

## Frequently Asked Questions

**Question one?**

Answer one.

## Take the next step

Closing CTA paragraph.
`;
    const { body, faqs } = splitFaqSection("en", md);
    expect(faqs).toHaveLength(1);
    expect(body).toContain("## Take the next step");
    expect(body).toContain("Closing CTA paragraph.");
    expect(body).not.toContain("Question one?");
  });

  it("caps the parsed set at 7 (owner range 4-7)", () => {
    const qs = Array.from({ length: 10 }, (_, i) => `**Question number ${i + 1}?**\n\nAnswer ${i + 1}.`).join("\n\n");
    const md = `Intro.\n\n## Frequently Asked Questions\n\n${qs}\n`;
    const { faqs } = splitFaqSection("en", md);
    expect(faqs).toHaveLength(7);
  });

  it("returns the body unchanged + empty list when no FAQ section exists", () => {
    const md = `Intro.\n\n## Section one\n\nBody.\n`;
    const { body, faqs } = splitFaqSection("en", md);
    expect(faqs).toEqual([]);
    expect(body).toBe(md);
  });

  it("tolerates the '## FAQ' heading variant", () => {
    const md = `Intro.\n\n## FAQ\n\n**Q one?**\n\nA one.\n`;
    const { faqs } = splitFaqSection("en", md);
    expect(faqs).toHaveLength(1);
  });

  it("SINGLE-NEWLINE format (live run 34500011890 forensics — nemotron puts the answer on the next line, no blank line)", () => {
    // The EXACT shape observed live: question bold line, answer immediately
    // on the next line, next question right after.
    const md = `Intro paragraph.

## Step 1: Determine Your Daily Calorie Target

Content about dosage.

## Frequently Asked Questions

**How many calories should I eat to lose weight and build muscle?**
Start with 10-12 calories per pound of body weight, set protein at 0.7-1 g per pound.

**Does cardio burn muscle?**
Moderate cardio does not significantly reduce muscle mass.
`;
    const { body, faqs } = splitFaqSection("en", md);
    expect(faqs).toHaveLength(2);
    expect(faqs[0]).toEqual({
      question: "How many calories should I eat to lose weight and build muscle?",
      answer:
        "Start with 10-12 calories per pound of body weight, set protein at 0.7-1 g per pound.",
    });
    expect(faqs[1]).toEqual({
      question: "Does cardio burn muscle?",
      answer: "Moderate cardio does not significantly reduce muscle mass.",
    });
    expect(body).toContain("## Step 1");
    expect(body).not.toContain("Frequently Asked Questions");
  });

  it("multi-line answers join into one plain-text answer", () => {
    const md = `Intro.\n\n## Frequently Asked Questions\n\n**How long to see results?**\nMost people see changes in 4-6 weeks\nwhen training is consistent.\n`;
    const { faqs } = splitFaqSection("en", md);
    expect(faqs[0].answer).toBe(
      "Most people see changes in 4-6 weeks when training is consistent.",
    );
  });

  it("bold label lines (trailing colon) stay answer text, not questions", () => {
    const md = `Intro.\n\n## FAQ\n\n**Is creatine safe?**\nYes for healthy adults.\n**Note:**\nStay hydrated.\n`;
    const { faqs } = splitFaqSection("en", md);
    expect(faqs).toHaveLength(1);
    expect(faqs[0].answer).toContain("Yes for healthy adults.");
    expect(faqs[0].answer).toContain("Note: Stay hydrated.");
  });
});

describe("splitFaqSection (AR)", () => {
  const AR_ARTICLE = `مقدمة مباشرة تجيب عن السؤال.

## كم جرام كرياتين في مرحلة التحميل

محتوى عن الجرعة.

## الأسئلة الشائعة

**كم مدة مرحلة التحميل؟**

من خمسة إلى سبعة أيام عادة.

**هل التحميل ضروري؟**

لا — ثلاثة إلى خمسة جرامات يوميًا تكفي خلال ثلاثة أسابيع.
`;

  it("lifts the Arabic FAQ section with the Arabic question mark", () => {
    const { body, faqs } = splitFaqSection("ar", AR_ARTICLE);
    expect(faqs).toHaveLength(2);
    expect(faqs[0].question).toBe("كم مدة مرحلة التحميل؟");
    expect(body).not.toContain("الأسئلة الشائعة");
    expect(body).toContain("## كم جرام كرياتين في مرحلة التحميل");
  });

  it("appends the Arabic question mark when missing", () => {
    const md = `مقدمة.\n\n## الأسئلة الشائعة\n\n**هل الكرياتين آمن**\n\nنعم بجرعات شائعة.\n`;
    const { faqs } = splitFaqSection("ar", md);
    expect(faqs[0].question).toBe("هل الكرياتين آمن؟");
  });
});

// ─────────────────────────────────────────────────────────────────
// ensureFaqSection — relevance-filtered safety net
// ─────────────────────────────────────────────────────────────────

describe("ensureFaqSection (Phase 172 relevance filter)", () => {
  it("appends ONLY topic-relevant FAQs (no filler)", () => {
    const md = "Article body with no FAQ section.";
    const { md: out, appended, appendedCount } = ensureFaqSection(
      "en",
      md,
      RESEARCH,
      "How to do a creatine loading phase safely",
    );
    expect(appended).toBe(true);
    expect(appendedCount).toBeGreaterThanOrEqual(1);
    expect(appendedCount).toBeLessThanOrEqual(6);
    expect(out).toContain("**How many grams of creatine should I take during loading?**");
    // Off-topic generic niche questions must NOT be appended.
    expect(out).not.toContain("intermittent fasting");
    expect(out).not.toContain("deload");
    expect(out).not.toContain("joint pain");
  });

  it("appends NOTHING when no researched FAQ is relevant (no forced FAQ)", () => {
    const md = "Article body with no FAQ section.";
    const { md: out, appended } = ensureFaqSection(
      "en",
      md,
      RESEARCH,
      "How to choose running shoes for flat feet",
    );
    expect(appended).toBe(false);
    expect(out).toBe(md);
  });

  it("caps the appended set at 6", () => {
    const manyFaqs: LanguageResearch = {
      ...RESEARCH,
      faqs: Array.from({ length: 10 }, (_, i) => ({
        question: `creatine question number ${i + 1}?`,
        answer: `creatine answer ${i + 1}.`,
      })),
    };
    const { appendedCount } = ensureFaqSection(
      "en",
      "body",
      manyFaqs,
      "creatine loading phase guide",
    );
    expect(appendedCount).toBe(6);
  });

  it("is a no-op when the markdown already has an FAQ section", () => {
    const md = "Body.\n\n## Frequently Asked Questions\n\n**Q?**\n\nA.\n";
    const { md: out, appended } = ensureFaqSection("en", md, RESEARCH, "creatine");
    expect(appended).toBe(false);
    expect(out).toBe(md);
  });

  it("uses the appended format splitFaqSection can parse (contract round-trip)", () => {
    const { md: out } = ensureFaqSection(
      "en",
      "Body only.",
      RESEARCH,
      "creatine loading phase",
    );
    const { faqs } = splitFaqSection("en", out);
    expect(faqs.length).toBeGreaterThanOrEqual(1);
    expect(faqs[0].question).toBe("How many grams of creatine should I take during loading?");
  });
});

// ─────────────────────────────────────────────────────────────────
// extractH2s — anti-repetition context feed
// ─────────────────────────────────────────────────────────────────

describe("extractH2s", () => {
  it("extracts H2 headings in order, capped by max", () => {
    const content = "intro\n\n## First heading\n\ntext\n\n## Second heading\n\n### h3 ignored\n\n## Third heading\n";
    expect(extractH2s(content, 2)).toEqual(["First heading", "Second heading"]);
  });

  it("ignores H3/H4 and empty input", () => {
    expect(extractH2s("### only h3\n#### h4\n", 6)).toEqual([]);
    expect(extractH2s("", 6)).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────
// Prompt-contract guards (read-the-source pattern — the prompt laws
// are load-bearing for quality; silent deletion fails CI)
// ─────────────────────────────────────────────────────────────────

const libDir = join(process.cwd(), "src", "lib");
const pipelineSrc = readFileSync(join(libDir, "blog-pipeline.ts"), "utf-8");
const processorsSrc = readFileSync(join(libDir, "ai-job-processors.ts"), "utf-8");

describe("Phase 172 prompt contracts (source guards)", () => {
  it("P2 carries the ANSWER-FIRST law in both languages", () => {
    expect(pipelineSrc).toContain("ANSWER-FIRST (mandatory)");
    expect(pipelineSrc).toContain("الإجابة أولًا (قانون إلزامي)");
  });

  it("P2 carries the E-E-A-T no-fabrication law", () => {
    expect(pipelineSrc).toContain("E-E-A-T WITHOUT FABRICATION");
    expect(pipelineSrc).toContain("خبرة بلا اختلاق");
  });

  it("P2 carries the health-claims fact guard", () => {
    expect(pipelineSrc).toContain("FACT GUARD (health/supplements/training/recovery/weight-loss/muscle-gain)");
    expect(pipelineSrc).toContain("حراسة الحقائق (صحة/مكملات/تدريب)");
  });

  it("P2 mandates the article-specific FAQ section in the exact contract format", () => {
    expect(pipelineSrc).toContain('en: "## Frequently Asked Questions"');
    expect(pipelineSrc).toContain('ar: "## الأسئلة الشائعة"');
    expect(pipelineSrc).toContain("FAQ SECTION (mandatory, at the END of the article)");
  });

  it("P2 injects the per-run variation seed (regeneration anti-repetition)", () => {
    expect(pipelineSrc).toContain("VARIATION_SEEDS");
  });

  it("P1 injects the recent-content differentiation block + title variety law", () => {
    expect(pipelineSrc).toContain("getRecentContentDigests");
    expect(pipelineSrc).toContain("TITLE VARIETY LAW");
    expect(pipelineSrc).toContain("قانون تنويع العنوان");
  });

  it("P4 keeps the answer-first check, E-E-A-T guard and extended source whitelist", () => {
    expect(pipelineSrc).toContain("ANSWER-FIRST CHECK (mandatory)");
    expect(pipelineSrc).toContain("E-E-A-T GUARD");
    expect(pipelineSrc).toContain("pubmed.ncbi.nlm.nih.gov");
    expect(pipelineSrc).toContain("ods.od.nih.gov");
    expect(pipelineSrc).toContain("acsm.org");
    expect(pipelineSrc).toContain("issn-online.org");
  });

  it("the coach-path generator carries the same quality laws", () => {
    expect(processorsSrc).toContain("ANSWER-FIRST (mandatory)");
    expect(processorsSrc).toContain("E-E-A-T WITHOUT FABRICATION");
    expect(processorsSrc).toContain("FACT GUARD:");
    expect(processorsSrc).toContain("الإجابة أولًا (إلزامي)");
  });

  it("P5 lifts the markdown FAQ into faq_json (the filler root-cause fix)", () => {
    const route = readFileSync(
      join(
        process.cwd(),
        "src",
        "app",
        "api",
        "cron",
        "blog",
        "p5-publish",
        "route.ts",
      ),
      "utf-8",
    );
    expect(route).toContain("splitFaqSection");
    expect(route).not.toContain("faq_json: bundle.research0?.faqs ?? [],");
  });
});

// ─────────────────────────────────────────────────────────────────
// PHASE 176 — FAQ label-prefix strip + deterministic lift-time
// relevance filter (owner report «التعديلات الجديدة اختفت مرة أخرى»;
// live evidence: the 09-11 protein-timing article rendered every FAQ
// card as «السؤال؟ ما هو…» and lifted creatine/IF/metabolism questions
// into a protein-TIMING article).
// ─────────────────────────────────────────────────────────────────
import {
  filterFaqsByRelevance,
  stripFaqQuestionLabel,
} from "@/lib/blog-pipeline";

describe("Phase 176 — stripFaqQuestionLabel (the «السؤال؟» prefix artifact)", () => {
  it("strips the Arabic label prefix the live article shipped", () => {
    expect(stripFaqQuestionLabel("السؤال؟ ما هو أفضل وقت لتناول البروتين؟")).toBe(
      "ما هو أفضل وقت لتناول البروتين؟",
    );
  });
  it("strips EN label variants (The question? / Question:)", () => {
    expect(stripFaqQuestionLabel("The question? How much protein?")).toBe("How much protein?");
    expect(stripFaqQuestionLabel("Question: How much protein?")).toBe("How much protein?");
  });
  it("leaves clean questions untouched", () => {
    expect(stripFaqQuestionLabel("كم جرام بروتين أحتاج؟")).toBe("كم جرام بروتين أحتاج؟");
  });
  it("splitFaqSection output carries NO label prefix (live contract)", () => {
    const md = `## المقدمة\n\nنص عربي.\n\n## الأسئلة الشائعة\n\n**السؤال؟ ما هو أفضل وقت لتناول البروتين؟**\nالإجابة المباشرة هنا.\n`;
    const { faqs } = splitFaqSection("ar", md);
    expect(faqs.length).toBe(1);
    expect(faqs[0].question).toBe("ما هو أفضل وقت لتناول البروتين؟");
  });
});

describe("Phase 176 — filterFaqsByRelevance (the P5 lift-time gate)", () => {
  const TITLE = "ما هو أفضل وقت لتناول البروتين بعد التمرين لزيادة العضلات؟";
  const faqs = [
    { question: "ما هو أفضل وقت لتناول البروتين بعد التمرين؟", answer: "خلال 30-60 دقيقة." },
    { question: "هل يمكن بناء العضلات دون مكملات بروتين؟", answer: "نعم من الغذاء الكافي." },
    { question: "ما الفرق بين الكرياتين مونوهيدرات وكرياتين ألكالين؟", answer: "فرق ضئيل." },
    { question: "كيف تؤثر الصيام المتقطع على بناء العضلات؟", answer: "لا يمنع." },
    { question: "كيف يمكن زيادة معدل الأيض الأساسي دون تمارين شديدة؟", answer: "بالحركة اليومية." },
  ];

  it("keeps the on-topic questions (prefix-normalized matching: البروتين ≡ بروتين)", () => {
    const kept = filterFaqsByRelevance(faqs, TITLE);
    expect(kept.map((f) => f.question)).toContain("ما هو أفضل وقت لتناول البروتين بعد التمرين؟");
    expect(kept.map((f) => f.question)).toContain("هل يمكن بناء العضلات دون مكملات بروتين؟");
  });

  it("drops the LIVE off-topic questions (creatine + IF + metabolism)", () => {
    const kept = filterFaqsByRelevance(faqs, TITLE);
    expect(kept.map((f) => f.question)).not.toContain(
      "ما الفرق بين الكرياتين مونوهيدرات وكرياتين ألكالين؟",
    );
    expect(kept.map((f) => f.question)).not.toContain("كيف تؤثر الصيام المتقطع على بناء العضلات؟");
    expect(kept.map((f) => f.question)).not.toContain(
      "كيف يمكن زيادة معدل الأيض الأساسي دون تمارين شديدة؟",
    );
  });

  it("a broken hint (<2 words) keeps everything (never false-drop on degraded input)", () => {
    expect(filterFaqsByRelevance(faqs, "").length).toBe(5);
    expect(filterFaqsByRelevance(faqs, "؟").length).toBe(5);
  });

  it("answers contribute to relevance (a question alone may be thin)", () => {
    const kept = filterFaqsByRelevance(
      [{ question: "هل هذا مهم؟", answer: "تناول البروتين بعد التمرين يسرّع الاستشفاء العضلي." }],
      TITLE,
    );
    expect(kept.length).toBe(1);
  });
});

describe("Phase 176 — P5 route rides the relevance filter + Latin gate (source canaries)", () => {
  const read = (p: string) => readFileSync(p, "utf-8");
  const route = read(join(process.cwd(), "src", "app", "api", "cron", "blog", "p5-publish", "route.ts"));

  it("the lift passes filterFaqsByRelevance with title+focus hint", () => {
    expect(route).toContain("filterFaqsByRelevance");
    expect(route).toContain("relevanceHint");
  });
  it("the research0 fallback faq_json is relevance-filtered too", () => {
    expect(route).toContain("filterFaqsByRelevance(bundle.research0?.faqs ?? [], relevanceHint)");
  });
  it("AR-only final Latin gate fails the publish honestly", () => {
    expect(route).toContain("scanLatinContamination");
    expect(route).toContain("latin contamination in final body");
  });
  it("P4 route carries the repair pass", () => {
    const p4 = read(join(process.cwd(), "src", "app", "api", "cron", "blog", "p4-review", "route.ts"));
    expect(p4).toContain("repairArabicLatinContamination");
    expect(p4).toContain("scanLatinContamination");
  });
  it("P2 no longer dumps ALL research FAQs into the writing prompt", () => {
    const pipeline = read(join(process.cwd(), "src", "lib", "blog-pipeline.ts"));
    expect(pipeline).toContain("relevantResearchFaqsForTitle(research.faqs, outline.title)");
  });
});
