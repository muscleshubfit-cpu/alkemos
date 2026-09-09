import { describe, it, expect } from "vitest";
import {
  parseEvoFeedbackInput,
  FEEDBACK_REASON_MAX,
  FEEDBACK_SNIPPET_MAX,
} from "@/lib/evo-feedback";

/**
 * EVO-1 (W5.1) — 👍/👎 input validation.
 * LAW: nothing free-text reaches the DB uncapped; never throws.
 */

describe("parseEvoFeedbackInput", () => {
  it("accepts a minimal up-vote", () => {
    const parsed = parseEvoFeedbackInput({ feedback: "up" });
    expect(parsed).toEqual({
      ok: true,
      value: {
        feedback: "up",
        reason: null,
        messageId: null,
        question: null,
        reply: null,
      },
    });
  });

  it("accepts a down-vote with reason and context", () => {
    const parsed = parseEvoFeedbackInput({
      feedback: "down",
      reason: "الرد عام جدًا",
      messageId: "msg-123-assistant",
      question: "أفضل تمرين للصدر؟",
      reply: "البنش بريس…",
    });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.feedback).toBe("down");
      expect(parsed.value.reason).toBe("الرد عام جدًا");
    }
  });

  it("rejects invalid values and shapes — never throws", () => {
    expect(parseEvoFeedbackInput(null).ok).toBe(false);
    expect(parseEvoFeedbackInput("attack").ok).toBe(false);
    expect(parseEvoFeedbackInput({ feedback: "meh" }).ok).toBe(false);
    expect(parseEvoFeedbackInput({}).ok).toBe(false);
    expect(parseEvoFeedbackInput({ feedback: 1 }).ok).toBe(false);
  });

  it("caps free-text fields hard", () => {
    const parsed = parseEvoFeedbackInput({
      feedback: "down",
      reason: "x".repeat(10_000),
      question: "q".repeat(10_000),
      reply: "r".repeat(10_000),
      messageId: "m".repeat(10_000),
    });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.reason?.length).toBe(FEEDBACK_REASON_MAX);
      expect(parsed.value.question?.length).toBe(FEEDBACK_SNIPPET_MAX);
      expect(parsed.value.reply?.length).toBe(FEEDBACK_SNIPPET_MAX);
      expect((parsed.value.messageId?.length ?? 0)).toBeLessThanOrEqual(80);
    }
  });

  it("trims whitespace and drops empties to null", () => {
    const parsed = parseEvoFeedbackInput({
      feedback: "up",
      reason: "    ",
      question: "  سؤال  ",
    });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.reason).toBeNull();
      expect(parsed.value.question).toBe("سؤال");
    }
  });
});
