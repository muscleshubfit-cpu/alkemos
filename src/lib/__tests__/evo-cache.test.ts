import { describe, it, expect } from "vitest";
import {
  normalizeEvoQuestion,
  isCacheEligibleMessage,
  chunkForSse,
  EVO_CACHE_MIN_QUESTION_CHARS,
} from "@/lib/evo-cache";

/**
 * EVO-5 (W5) — frequent-question cache helpers.
 * The cache serves ONLY context-free requests, so the eligibility gate is
 * the safety boundary: any personal signal (history, subscriber context,
 * memory, plan/swap intent, first-meeting) must bypass the cache. The
 * normalizer must be deterministic (same function builds the lookup hash
 * AND the stored question_norm — they can never drift).
 */
describe("normalizeEvoQuestion", () => {
  it("is deterministic and trims/collapses whitespace", () => {
    expect(normalizeEvoQuestion("  كم   سعرة  في  الأرز؟  ")).toBe(
      normalizeEvoQuestion("كم سعرة في الأرز ؟"),
    );
  });

  it("folds Arabic diacritics, tatweel and hamza variants", () => {
    expect(normalizeEvoQuestion("مُحَمَّــد أإآ")).toBe("محمد ااا");
  });

  it("folds ة→ه and ى→ي", () => {
    expect(normalizeEvoQuestion("مدرسة شاطىء")).toBe("مدرسه شاطيء");
  });

  it("converts Arabic-Indic digits to Latin digits", () => {
    expect(normalizeEvoQuestion("١٠٠ سعرة")).toBe("100 سعره");
  });

  it("lowercases Latin text and strips punctuation", () => {
    expect(normalizeEvoQuestion("How MANY Calories?!")).toBe("how many calories");
  });
});

describe("isCacheEligibleMessage", () => {
  const base = {
    message: "كام سعرة في صدور دجاج مشوية؟",
    historyLength: 0,
    isSubscriber: false,
    memoryFactCount: 0,
    isPlanCreation: false,
    isSwapRequest: false,
    firstMeeting: false,
  };

  it("accepts a context-free standalone question", () => {
    expect(isCacheEligibleMessage(base)).toBe(true);
  });

  it("rejects any conversation history (follow-ups are context-dependent)", () => {
    expect(isCacheEligibleMessage({ ...base, historyLength: 1 })).toBe(false);
  });

  it("rejects subscribers (personal context could leak into cached answers)", () => {
    expect(isCacheEligibleMessage({ ...base, isSubscriber: true })).toBe(false);
  });

  it("rejects messages when permanent memory exists", () => {
    expect(isCacheEligibleMessage({ ...base, memoryFactCount: 2 })).toBe(false);
  });

  it("rejects plan-creation and swap intents", () => {
    expect(isCacheEligibleMessage({ ...base, isPlanCreation: true })).toBe(false);
    expect(isCacheEligibleMessage({ ...base, isSwapRequest: true })).toBe(false);
  });

  it("rejects first-meeting protocol turns", () => {
    expect(isCacheEligibleMessage({ ...base, firstMeeting: true })).toBe(false);
  });

  it("rejects ultra-short questions (below the honest-key floor)", () => {
    expect(isCacheEligibleMessage({ ...base, message: "أهلاً" })).toBe(false);
    expect(
      isCacheEligibleMessage({ ...base, message: "x".repeat(EVO_CACHE_MIN_QUESTION_CHARS - 1) }),
    ).toBe(false);
  });
});

describe("chunkForSse", () => {
  it("returns a single chunk for short answers", () => {
    expect(chunkForSse("short answer")).toEqual(["short answer"]);
  });

  it("splits long answers on whitespace boundaries without losing text", () => {
    const words = Array.from({ length: 200 }, (_, i) => `word${i}`).join(" ");
    const chunks = chunkForSse(words);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) {
      expect(c.length).toBeLessThanOrEqual(140);
    }
    expect(chunks.join(" ").replace(/\s+/g, " ")).toBe(words.replace(/\s+/g, " "));
  });
});
