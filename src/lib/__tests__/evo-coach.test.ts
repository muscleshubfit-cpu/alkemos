import { describe, it, expect } from "vitest";
import {
  computeWeightDelta,
  formatProgressForPrompt,
  needsFirstMeetingInterview,
  resolveHistoryCap,
  EVO_HISTORY_CAP_FREE,
  EVO_HISTORY_CAP_PAID,
  EVO_FIRST_MEETING_PROTOCOL,
} from "@/lib/evo-coach";

/**
 * EVO-3 (W2) — coach-behavior pure layer.
 * Laws under test:
 *   - the delta comes ONLY from the entries given (no invention);
 *   - the progress block is "" when nothing real exists;
 *   - the interview gate fires for paid subscribers WITHOUT the matching
 *     questionnaire only — never for anonymous/free users, never when
 *     the questionnaire is on file;
 *   - the history cap is tier-resolved (16 paid / 10 free — W2.4).
 */

const M = (weight: number | null, date: string, waist: number | null = null) => ({
  weight,
  waist,
  date,
});

describe("resolveHistoryCap (W2.4)", () => {
  it("paid subscribers get the 16-message window", () => {
    expect(resolveHistoryCap(true)).toBe(16);
    expect(EVO_HISTORY_CAP_PAID).toBe(16);
  });

  it("free users and anonymous keep the classic 10-message window", () => {
    expect(resolveHistoryCap(false)).toBe(10);
    expect(EVO_HISTORY_CAP_FREE).toBe(10);
  });
});

describe("computeWeightDelta (W2.2)", () => {
  it("computes the oldest→newest delta", () => {
    const d = computeWeightDelta([M(90, "2026-08-20"), M(88.5, "2026-09-05")]);
    expect(d.deltaKg).toBe(-1.5);
    expect(d.direction).toBe("down");
    expect(d.oldestWeight).toBe(90);
    expect(d.newestWeight).toBe(88.5);
  });

  it("reports an increase honestly", () => {
    const d = computeWeightDelta([M(70, "2026-08-01"), M(71.4, "2026-08-29")]);
    expect(d.deltaKg).toBe(1.4);
    expect(d.direction).toBe("up");
  });

  it("treats sub-0.2kg movement as stable (scale noise)", () => {
    const d = computeWeightDelta([M(80, "2026-08-01"), M(79.9, "2026-08-29")]);
    expect(d.deltaKg).toBe(-0.1);
    expect(d.direction).toBe("stable");
  });

  it("needs two dated readings — one entry is not computable", () => {
    const d = computeWeightDelta([M(90, "2026-08-20")]);
    expect(d.deltaKg).toBeNull();
    expect(d.direction).toBeNull();
    expect(d.newestWeight).toBe(90);
  });

  it("skips null weights instead of failing", () => {
    const d = computeWeightDelta([M(null, "2026-08-01"), M(88, "2026-09-01")]);
    expect(d.deltaKg).toBeNull();
    expect(d.newestWeight).toBe(88);
  });

  it("same-date duplicate readings never produce a delta", () => {
    const d = computeWeightDelta([M(90, "2026-09-01"), M(88, "2026-09-01")]);
    expect(d.deltaKg).toBeNull();
    expect(d.direction).toBeNull();
  });

  it("handles empty and undefined input", () => {
    expect(computeWeightDelta([]).deltaKg).toBeNull();
    expect(computeWeightDelta(undefined).deltaKg).toBeNull();
    expect(computeWeightDelta(null).deltaKg).toBeNull();
  });
});

describe("formatProgressForPrompt (W2.2)", () => {
  it("renders readings oldest→newest with the computed delta line", () => {
    const block = formatProgressForPrompt([
      M(90, "2026-08-20T10:00:00Z"),
      M(88.5, "2026-09-05T10:00:00Z"),
    ]);
    expect(block).toContain("90كغ");
    expect(block).toContain("88.5كغ");
    expect(block).toContain("انخفاض 1.5كغ");
    expect(block).toContain("الأقدم → الأحدث");
  });

  it("includes waist when present", () => {
    const block = formatProgressForPrompt([M(90, "2026-09-01", 96)]);
    expect(block).toContain("الوسط 96سم");
  });

  it("returns an empty string when nothing is logged — never an empty section", () => {
    expect(formatProgressForPrompt([])).toBe("");
    expect(formatProgressForPrompt(undefined)).toBe("");
    expect(formatProgressForPrompt(null)).toBe("");
    expect(formatProgressForPrompt([M(null, "2026-09-01")])).toBe("");
  });

  it("shows raw readings without a fabricated delta when not computable", () => {
    const block = formatProgressForPrompt([M(90, "2026-09-01")]);
    expect(block).toContain("90كغ");
    expect(block).not.toContain("التغير عبر الفترة");
  });
});

describe("needsFirstMeetingInterview (W2.1)", () => {
  const base = {
    isSubscriber: true,
    isPlanCreation: true,
    planDomain: "workout" as const,
    hasNutritionQuestionnaire: true,
    hasFitnessQuestionnaire: true,
  };

  it("fires for a subscriber without the matching questionnaire", () => {
    expect(
      needsFirstMeetingInterview({ ...base, hasFitnessQuestionnaire: false }),
    ).toBe(true);
    expect(
      needsFirstMeetingInterview({
        ...base,
        planDomain: "nutrition",
        hasNutritionQuestionnaire: false,
      }),
    ).toBe(true);
  });

  it("does NOT fire when the questionnaire is on file", () => {
    expect(needsFirstMeetingInterview(base)).toBe(false);
  });

  it("domain checks stay separate — workout request ignores nutrition file", () => {
    expect(
      needsFirstMeetingInterview({
        ...base,
        hasNutritionQuestionnaire: false,
      }),
    ).toBe(false);
  });

  it("never fires for non-subscribers (the gate blocks plans anyway)", () => {
    expect(
      needsFirstMeetingInterview({
        ...base,
        isSubscriber: false,
        hasFitnessQuestionnaire: false,
      }),
    ).toBe(false);
  });

  it("never fires for non-plan-creation messages", () => {
    expect(
      needsFirstMeetingInterview({ ...base, isPlanCreation: false }),
    ).toBe(false);
  });
});

describe("EVO_FIRST_MEETING_PROTOCOL prompt content", () => {
  it("caps the interview at 4 questions, one per reply", () => {
    expect(EVO_FIRST_MEETING_PROTOCOL).toContain("MAXIMUM of 4 short questions");
    expect(EVO_FIRST_MEETING_PROTOCOL).toContain("ONE question per reply");
  });

  it("requires the compiled profile + the plan in one reply", () => {
    expect(EVO_FIRST_MEETING_PROTOCOL).toContain("in ONE reply");
  });

  it("restates the no-invention and no-medical-advice laws", () => {
    expect(EVO_FIRST_MEETING_PROTOCOL).toContain("NEVER invent measurements");
    expect(EVO_FIRST_MEETING_PROTOCOL).toContain("no medical advice");
  });
});
