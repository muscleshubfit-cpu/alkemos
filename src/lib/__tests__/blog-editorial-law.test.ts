import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * AUDIT_REPORT.md §9-المرحلة 1, item 2 (2026-09-29) — the unified
 * editorial constitution's NO-FORK canary.
 *
 * The audit (C5/F8) found the writing laws forked across surfaces: P2
 * (blog-pipeline.ts) carried the canonical ANSWER-FIRST / E-E-A-T /
 * FACT GUARD texts while the single-shot fallback generator
 * (ai-job-processors.ts) shipped its own PARAPHRASES — two systems,
 * drifting specs. blog-editorial-law.ts is now the single source, and
 * these canaries prove the unification BEHAVIORALLY: every prompt
 * builder (P1 outline · P2 content · P4 review · the fallback
 * generator) is invoked with the AI chain mocked, and the captured
 * prompt must contain the exported law blocks BYTE-EXACT — a forked
 * copy anywhere fails here.
 */

vi.mock("@/lib/ai-provider", () => {
  const captured: string[] = [];
  const mkResponse = (payload: unknown) =>
    JSON.stringify(payload);
  return {
    __captured: captured,
    callFreeAIFallbackChain: vi.fn(async (prompt: string) => {
      captured.push(prompt);
      // Shape varies by caller — the builders parse defensively; a
      // generic valid article-ish payload lets each flow complete (or
      // throw AFTER the call — the prompt is what these tests assert).
      return {
        text: mkResponse({
          articleMd:
            "## Section One\n" + "Solid training advice with progressive overload. ".repeat(40) +
            "\n\n## Section Two\n" + "Protein intake across the day supports recovery. ".repeat(40),
          article: "## Section One\n" + "filler text here without any quotes ".repeat(40),
          index: 1,
          title: "How to Build Muscle at Home",
          subtitle: "a complete beginner guide",
          metaDescription: "A complete guide to building muscle at home with no equipment.",
          slugBase: "build-muscle-home-guide",
          sections: ["H2 one", "H2 two", "H2 three", "H2 four", "H2 five"],
          lsiKeywords: ["build muscle at home", "home workout no equipment"],
          imagePlan: [{ subject: "dumbbells on a rack", type: "photo" }],
          changesSummary: ["proofread"],
          keywordCoverage: "good",
          factCheckNotes: "ok",
          internalLinks: [{ slug: "a", anchorText: "guide" }],
          externalLinks: [{ url: "https://www.who.int/x", anchorText: "WHO guidance" }],
        }),
        model: "test-model",
        provider: "test",
      };
    }),
    parseJSON: vi.fn(<T,>(text: string): T | null => {
      try {
        return JSON.parse(text) as T;
      } catch {
        return null;
      }
    }),
  };
});

import {
  EDITORIAL_LANG_RULE,
  EDITORIAL_ANSWER_FIRST,
  EDITORIAL_EEAT,
  EDITORIAL_FACT_GUARD,
  EDITORIAL_FAQ_CONTRACT,
  EDITORIAL_FAQ_COUNT_RANGE,
  EDITORIAL_AUTHORITY_DOMAINS,
  EDITORIAL_ANCHOR_GRAMMAR_LAW,
} from "@/lib/blog-editorial-law";
import { buildOutline, generateFullArticle, reviewAndEnhance, type OutlinePlan } from "@/lib/blog-pipeline";
import { PROCESSORS } from "@/lib/ai-job-processors";
import { fallbackResearch } from "@/lib/blog-research";
import * as aiProvider from "@/lib/ai-provider";

// The vi.mock factory replaces the module wholesale — its `__captured`
// array is where every prompt lands. tsc sees the REAL module's types,
// so the test reads the array through a structural cast.
const captured = (aiProvider as unknown as { __captured: string[] }).__captured;

const research = fallbackResearch("en", []);

beforeEach(() => {
  captured.length = 0;
});

describe("AUDIT §9-1.2 — the law blocks themselves", () => {
  it("exports every block bilingually (en + ar) and non-empty", () => {
    for (const block of [
      EDITORIAL_LANG_RULE,
      EDITORIAL_ANSWER_FIRST,
      EDITORIAL_EEAT,
      EDITORIAL_FACT_GUARD,
      EDITORIAL_FAQ_CONTRACT,
    ]) {
      expect(block.en.length).toBeGreaterThan(40);
      expect(block.ar.length).toBeGreaterThan(40);
      // Arabic blocks are Arabic (the audit's Pan-Arab law)
      expect(block.ar).toMatch(/[\u0600-\u06FF]/);
    }
  });

  it("FACT GUARD bans fabrication in both languages", () => {
    expect(EDITORIAL_FACT_GUARD.en).toContain("FABRICATING studies, authors, paper titles, URLs, statistics");
    expect(EDITORIAL_FACT_GUARD.ar).toContain("ممنوع اختلاق دراسات");
  });

  it("the FAQ count law is the owner range 4-7 (one number, every surface)", () => {
    expect(EDITORIAL_FAQ_COUNT_RANGE).toEqual({ min: 4, max: 7 });
  });

  it("the authority whitelist carries the nine P4 domains in order", () => {
    expect(EDITORIAL_AUTHORITY_DOMAINS).toEqual([
      "who.int", "ncbi.nlm.nih.gov", "pubmed.ncbi.nlm.nih.gov", "ods.od.nih.gov",
      "nccih.nih.gov", "cdc.gov", "mayoclinic.org", "acsm.org", "issn-online.org",
    ]);
  });

  it("the anchor grammar law bans raw keyword lists and long stacks", () => {
    expect(EDITORIAL_ANCHOR_GRAMMAR_LAW).toContain("2-5 word phrase");
    expect(EDITORIAL_ANCHOR_GRAMMAR_LAW).toContain("NEVER use a raw keyword list");
  });
});

describe("AUDIT §9-1.2 — NO-FORK: P1/P2/P4 compose the shared blocks", () => {
  it("P1 (outline) carries the LANG law for both languages", async () => {
    await buildOutline("en", "how to build muscle at home", research).catch(() => {});
    await buildOutline("ar", "كيف تبني العضلات في المنزل", research).catch(() => {});
    const joined = captured.join("\n<<<SEP>>>\n");
    expect(joined).toContain(EDITORIAL_LANG_RULE.en);
    expect(joined).toContain(EDITORIAL_LANG_RULE.ar);
  });

  it("P2 (content) embeds all five writing laws byte-exact (en + ar)", async () => {
    const outline: OutlinePlan = {
      title: "How to Build Muscle at Home",
      subtitle: "complete guide",
      metaDescription: "desc",
      slugBase: "slug",
      sections: ["s1", "s2", "s3", "s4", "s5"],
      lsiKeywords: ["build muscle at home"],
      imagePlan: [{ subject: "dumbbells", type: "photo" }],
    };
    await generateFullArticle("en", outline, research).catch(() => {});
    await generateFullArticle("ar", outline, research).catch(() => {});
    const joined = captured.join("\n<<<SEP>>>\n");
    for (const block of [
      EDITORIAL_ANSWER_FIRST,
      EDITORIAL_EEAT,
      EDITORIAL_FACT_GUARD,
      EDITORIAL_FAQ_CONTRACT,
    ]) {
      expect(joined).toContain(block.en);
      expect(joined).toContain(block.ar);
    }
  });

  it("P4 (review) composes the authority whitelist + anchor law + FAQ range", async () => {
    const outline: OutlinePlan = {
      title: "How to Build Muscle at Home",
      subtitle: "s",
      metaDescription: "d",
      slugBase: "slug",
      sections: ["s1"],
      lsiKeywords: [],
      imagePlan: [],
    };
    const draft = "## One\n" + "plain advice text. ".repeat(80);
    await reviewAndEnhance("en", draft, outline, []).catch(() => {});
    const p4 = captured[captured.length - 1];
    expect(p4).toContain(EDITORIAL_AUTHORITY_DOMAINS.join(", "));
    expect(p4).toContain(EDITORIAL_ANCHOR_GRAMMAR_LAW);
    expect(p4).toContain(
      `${EDITORIAL_FAQ_COUNT_RANGE.min}-${EDITORIAL_FAQ_COUNT_RANGE.max} questions serving THIS article's search intent`,
    );
  });
});

describe("AUDIT §9-1.2 — NO-FORK: the fallback generator rides the SAME laws", () => {
  it("runArticleGenerate embeds the canonical ANSWER-FIRST / E-E-A-T / FACT GUARD blocks (en + ar)", async () => {
    await PROCESSORS.article_generate({ topic: "how to build muscle at home", language: "en" }).catch(() => {});
    await PROCESSORS.article_generate({ topic: "كيف تبني العضلات في المنزل", language: "ar" }).catch(() => {});
    const joined = captured.join("\n<<<SEP>>>\n");
    // The canonical PIPELINE texts — not the old paraphrases.
    expect(joined).toContain(EDITORIAL_ANSWER_FIRST.en);
    expect(joined).toContain(EDITORIAL_ANSWER_FIRST.ar);
    expect(joined).toContain(EDITORIAL_EEAT.en);
    expect(joined).toContain(EDITORIAL_EEAT.ar);
    expect(joined).toContain(EDITORIAL_FACT_GUARD.en);
    expect(joined).toContain(EDITORIAL_FACT_GUARD.ar);
    // The old paraphrased forms must never come back.
    expect(joined).not.toContain("no generic warm-up, no filler.");
    expect(joined).not.toContain("fabricating client stories, results, testimonials");
  });

  it("its FAQ count aligns to the shared 4-7 range (was a drifting 4-6)", async () => {
    await PROCESSORS.article_generate({ topic: "how to build muscle at home", language: "en" }).catch(() => {});
    const prompt = captured[captured.length - 1];
    expect(prompt).toContain("FAQ set: 4-7 genuine questions");
  });
});
