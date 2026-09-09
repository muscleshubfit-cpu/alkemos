import { describe, it, expect } from "vitest";
import {
  buildEvoMemoryPrompt,
  capTranscriptForExtraction,
  formatEvoMemoryForPrompt,
  isDuplicateMemoryFact,
  normalizeForMemory,
  sanitizeStoredFacts,
  shouldExtractMemory,
  validateMemoryFacts,
  EVO_MEMORY_EXTRACT_EVERY,
  EVO_MEMORY_FACT_MAX,
  EVO_MEMORY_FACTS_PER_EXTRACTION,
  EVO_MEMORY_TOP_INJECT,
  EVO_MEMORY_TRANSCRIPT_MESSAGE_MAX,
} from "@/lib/evo-memory";

/**
 * EVO-2 (W3) — permanent-memory pure layer.
 * LAW: nothing free-text uncapped reaches the DB; the PII denial-list is
 * part of the extraction prompt contract; dedup is normalization-based;
 * every validator never throws.
 */

describe("normalizeForMemory", () => {
  it("unifies Arabic orthography variants", () => {
    expect(normalizeForMemory("هدفي انزّل ١٠ كيلو")).toBe(
      normalizeForMemory("هدفى انزل 10 كيلو"),
    );
  });

  it("collapses whitespace and lowercases Latin", () => {
    expect(normalizeForMemory("  GOAL:   Lose WEIGHT ")).toBe("goal lose weight");
  });
});

describe("isDuplicateMemoryFact", () => {
  it("flags normalized equality", () => {
    expect(isDuplicateMemoryFact("هدفه انزال 10 كيلو", ["هدفه انزال ١٠ كيلو"])).toBe(true);
  });

  it("flags containment of a real phrase (>= 8 chars)", () => {
    expect(
      isDuplicateMemoryFact("العميل بيحب تمارين الكارديو جدا", ["بيحب تمارين الكارديو"]),
    ).toBe(true);
  });

  it("does NOT let short fragments match everything", () => {
    expect(isDuplicateMemoryFact("يتمرن في الجيم يوميا", ["تمرين"])).toBe(false);
  });

  it("returns true for empty-normalized candidates (dropped, not stored)", () => {
    expect(isDuplicateMemoryFact("!!", [])).toBe(true);
  });

  it("allows genuinely different facts", () => {
    expect(
      isDuplicateMemoryFact("يتمرن في الصباح", ["يفضل الكارديو مساءً"]),
    ).toBe(false);
  });
});

describe("validateMemoryFacts", () => {
  it("parses the {fact, category} array shape and keeps valid categories", () => {
    const facts = validateMemoryFacts([
      { fact: "يتمرن 4 أيام أسبوعيًا", category: "lifestyle" },
      { fact: "يريد خسارة 10 كجم", category: "goal" },
    ]);
    expect(facts).toHaveLength(2);
    expect(facts[0]).toEqual({ fact: "يتمرن 4 أيام أسبوعيًا", category: "lifestyle" });
    expect(facts[1].category).toBe("goal");
  });

  it("falls back to 'other' for unknown categories and bare-string items", () => {
    const facts = validateMemoryFacts(["بيكره البروكلي", { fact: "نام متأخر", category: "غريبة" }]);
    expect(facts[0].category).toBe("other");
    expect(facts[1].category).toBe("other");
  });

  it("caps each fact at 300 chars and flattens newlines", () => {
    const long = "س ".repeat(400);
    const facts = validateMemoryFacts([{ fact: `قبل\nبعد ${long}`, category: "other" }]);
    expect(facts[0].fact.length).toBeLessThanOrEqual(EVO_MEMORY_FACT_MAX);
    expect(facts[0].fact).not.toMatch(/\n/);
  });

  it("caps the batch at 5 facts and drops short/junk entries", () => {
    const items = Array.from({ length: 9 }, (_, i) => ({ fact: `حقيقة رقم ${i} فعالة`, category: "other" }));
    expect(validateMemoryFacts(items)).toHaveLength(EVO_MEMORY_FACTS_PER_EXTRACTION);
    expect(validateMemoryFacts([{ fact: "ab", category: "other" }, null, 42])).toHaveLength(0);
  });

  it("dedups within the batch and against existing facts (Arabic-normalized)", () => {
    const facts = validateMemoryFacts(
      [
        { fact: "هدفه انزال 10 كيلو", category: "goal" },
        { fact: "هدفه انزال 10 كيلو!", category: "goal" },
        { fact: "يتغذى على 4 وجبات", category: "lifestyle" },
      ],
      ["هو هدفه انزال 10 كيلو بس"],
    );
    expect(facts).toHaveLength(1);
    expect(facts[0].fact).toBe("يتغذى على 4 وجبات");
  });

  it("never throws on non-array junk", () => {
    expect(validateMemoryFacts(null)).toEqual([]);
    expect(validateMemoryFacts("[]")).toEqual([]);
    expect(validateMemoryFacts({ fact: "x" })).toEqual([]);
  });
});

describe("sanitizeStoredFacts", () => {
  it("sanitizes DB rows and caps at the injection limit", () => {
    const rows = Array.from({ length: 20 }, (_, i) => ({
      fact: `حقيقة مخزنة رقم ${i}`,
      category: "goal",
    }));
    const facts = sanitizeStoredFacts(rows);
    expect(facts).toHaveLength(EVO_MEMORY_TOP_INJECT);
    expect(facts[0].category).toBe("goal");
  });

  it("drops non-string facts and maps unknown categories to other", () => {
    const facts = sanitizeStoredFacts([
      { fact: 42, category: "goal" },
      { fact: "يحب الصباح", category: "?????" },
    ]);
    expect(facts).toHaveLength(1);
    expect(facts[0].category).toBe("other");
  });
});

describe("formatEvoMemoryForPrompt", () => {
  it("returns empty string for no facts (section never appears empty)", () => {
    expect(formatEvoMemoryForPrompt([])).toBe("");
  });

  it("builds the memory block with categories, capped at 15", () => {
    const facts = Array.from({ length: 18 }, (_, i) => ({
      fact: `حقيقة ${i}`,
      category: "preference" as const,
    }));
    const block = formatEvoMemoryForPrompt(facts);
    expect(block).toContain("ذاكرة Evo الدائمة");
    expect(block).toContain("[preference] حقيقة 0");
    expect(block).not.toContain("حقيقة 15");
  });
});

describe("capTranscriptForExtraction + buildEvoMemoryPrompt", () => {
  it("keeps the last messages + current exchange and caps message length", () => {
    const history = Array.from({ length: 15 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `رسالة رقم ${i} `.repeat(60),
    }));
    const transcript = capTranscriptForExtraction(history, "سؤال حالي", "رد حالي");
    expect(transcript.length).toBeLessThanOrEqual(12);
    expect(transcript[transcript.length - 2].content).toBe("سؤال حالي");
    expect(transcript[transcript.length - 1].content).toBe("رد حالي");
    expect(transcript.every((m) => m.content.length > 0)).toBe(true);
  });

  it("returns null when the transcript has no user turns", () => {
    expect(buildEvoMemoryPrompt([{ role: "assistant", content: "تمام" }])).toBeNull();
  });

  it("carries the PII denial-list + JSON-only contract", () => {
    const prompt = buildEvoMemoryPrompt([
      { role: "user", content: "بتمرن في الجيم" },
      { role: "assistant", content: "تمام" },
    ]);
    expect(prompt).not.toBeNull();
    const p = prompt as string;
    expect(p).toContain("User: بتمرن في الجيم");
    expect(p).toContain("NEVER store");
    expect(p).toContain("mental-health");
    expect(p).toContain("JSON array ONLY");
    expect(p).toContain("goal|preference|lifestyle|constraint|other");
  });

  it("caps each transcript line at the per-message limit", () => {
    const long = "كلمة ".repeat(300);
    const prompt = buildEvoMemoryPrompt([
      { role: "user", content: long },
      { role: "assistant", content: long },
    ]) as string;
    const userLine = prompt.split("\n").find((l) => l.startsWith("User:")) as string;
    expect(userLine.length).toBeLessThanOrEqual(
      "User: ".length + EVO_MEMORY_TRANSCRIPT_MESSAGE_MAX,
    );
  });
});

describe("shouldExtractMemory", () => {
  it("fires exactly at the cadence boundary and stays true beyond it", () => {
    expect(shouldExtractMemory(EVO_MEMORY_EXTRACT_EVERY - 1)).toBe(false);
    expect(shouldExtractMemory(EVO_MEMORY_EXTRACT_EVERY)).toBe(true);
    expect(shouldExtractMemory(EVO_MEMORY_EXTRACT_EVERY + 3)).toBe(true);
  });
});
