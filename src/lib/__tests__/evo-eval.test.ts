import { describe, it, expect } from "vitest";
import {
  EVO_EVAL_QUESTIONS,
  buildEvalAnswerPrompt,
  buildEvalJudgePrompt,
  parseEvalVerdict,
  summarizeEvalResults,
} from "@/lib/evo-eval";

/**
 * EVO-5 (W5) — eval harness pure helpers. The curve is only meaningful if
 * the reference set is stable and the judge output is parsed defensively:
 * an unusable verdict becomes null (a soft error), NEVER a made-up score.
 */
describe("EVO_EVAL_QUESTIONS (the reference set)", () => {
  it("has unique stable ids", () => {
    const ids = EVO_EVAL_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers both languages (AR-weighted) and every category", () => {
    const languages = new Set(EVO_EVAL_QUESTIONS.map((q) => q.language));
    expect(languages.has("ar")).toBe(true);
    expect(languages.has("en")).toBe(true);
    expect(EVO_EVAL_QUESTIONS.filter((q) => q.language === "ar").length).toBeGreaterThanOrEqual(
      EVO_EVAL_QUESTIONS.filter((q) => q.language === "en").length,
    );
    const categories = new Set(EVO_EVAL_QUESTIONS.map((q) => q.category));
    for (const c of ["general", "nutrition", "exercise", "safety-boundary", "subscriber-gate"] as const) {
      expect(categories.has(c)).toBe(true);
    }
  });

  it("includes the safety-boundary and subscriber-gate alarm questions", () => {
    expect(EVO_EVAL_QUESTIONS.some((q) => q.category === "safety-boundary")).toBe(true);
    expect(EVO_EVAL_QUESTIONS.some((q) => q.category === "subscriber-gate")).toBe(true);
  });
});

describe("prompt builders", () => {
  it("buildEvalAnswerPrompt rides the REAL system prompt + one reference turn", () => {
    const prompt = buildEvalAnswerPrompt("SYSTEM-PROMPT-BODY", EVO_EVAL_QUESTIONS[0]);
    expect(prompt.startsWith("SYSTEM-PROMPT-BODY")).toBe(true);
    expect(prompt).toContain(`User: ${EVO_EVAL_QUESTIONS[0].text}`);
    expect(prompt.endsWith("Assistant:")).toBe(true);
  });

  it("buildEvalJudgePrompt demands strict JSON and hard flags", () => {
    const prompt = buildEvalJudgePrompt({
      question: EVO_EVAL_QUESTIONS[0],
      answer: "ANSWER-BODY",
    });
    expect(prompt).toContain('"score"');
    expect(prompt).toContain('"safety"');
    expect(prompt).toContain('"language"');
    expect(prompt).toContain("ANSWER-BODY");
  });

  it("judge calibration: a safe redirect to professional care is safety:true (live-run lesson 168)", () => {
    // First live run (2026-09-11, run 34420259564): the cheap judge flagged
    // 5/9 answers as unsafe — it treated «see a doctor» as medical advice.
    // The prompt now states the correct semantics explicitly.
    const prompt = buildEvalJudgePrompt({
      question: EVO_EVAL_QUESTIONS.find((q) => q.category === "safety-boundary")!,
      answer: "لا أقدر أعالج إصابة — لازم تزور دكتور عظام.",
    });
    expect(prompt).toContain("safety: true, never false");
    expect(prompt).toContain("DIFFERENT language");
  });
});

describe("parseEvalVerdict (defensive)", () => {
  it("parses a clean verdict and clamps the score", () => {
    expect(parseEvalVerdict('{"score": 8.4, "safety": true, "language": true, "notes": "good"}')).toEqual({
      score: 8.4,
      safetyPass: true,
      languageMatch: true,
      notes: "good",
    });
    expect(parseEvalVerdict('{"score": 42}')?.score).toBe(10);
    expect(parseEvalVerdict('{"score": -3}')?.score).toBe(0);
  });

  it("extracts JSON embedded in chatter", () => {
    const v = parseEvalVerdict('Sure! Here you go:\n{"score": 7, "safety": true, "language": true, "notes": "ok"}\nDone.');
    expect(v?.score).toBe(7);
  });

  it("defaults missing flags to the safe side but never invents a score", () => {
    expect(parseEvalVerdict('{"score": 6}')?.safetyPass).toBe(true);
    expect(parseEvalVerdict('{"notes": "no score"}')).toBeNull();
    expect(parseEvalVerdict("garbage")).toBeNull();
    expect(parseEvalVerdict(null)).toBeNull();
    expect(parseEvalVerdict("")).toBeNull();
  });

  it("clamps fractional scores and truncates long notes", () => {
    const v = parseEvalVerdict(
      `{"score": 5.555, "safety": false, "language": true, "notes": "${"x".repeat(400)}"}`,
    );
    expect(v?.score).toBe(5.6);
    expect(v?.safetyPass).toBe(false);
    expect(v?.notes.length).toBeLessThanOrEqual(300);
  });
});

describe("summarizeEvalResults", () => {
  it("returns zeros for an empty run", () => {
    expect(summarizeEvalResults([])).toEqual({
      count: 0,
      avgScore: 0,
      safetyFailures: 0,
      languageMismatches: 0,
    });
  });

  it("aggregates average + failures honestly", () => {
    const s = summarizeEvalResults([
      { question_id: "a", language: "ar", score: 8, safety_pass: true, language_match: true },
      { question_id: "b", language: "en", score: 6, safety_pass: false, language_match: true },
      { question_id: "c", language: "ar", score: 7, safety_pass: true, language_match: false },
    ]);
    expect(s.count).toBe(3);
    expect(s.avgScore).toBe(7);
    expect(s.safetyFailures).toBe(1);
    expect(s.languageMismatches).toBe(1);
  });
});
