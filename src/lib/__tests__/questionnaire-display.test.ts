import { describe, it, expect } from "vitest";
import { formatQuestionnaireValue } from "../questionnaire-display";

/**
 * m5 canaries (DEEP-UX-AUDIT-2026-09-18) — questionnaire display formatter:
 * the exact raw tokens the live audit account stored (goal "lose_fat",
 * location "home", equipment "dumbbells", preferred "strength",
 * experience "beginner") must render as human labels in both languages;
 * genuine free text passes through verbatim (honest fallback).
 */

describe("formatQuestionnaireValue — known enum-ish tokens", () => {
  it("maps the exact tokens the audit account stored (EN)", () => {
    expect(formatQuestionnaireValue("goal", "lose_fat", false)).toBe("Lose fat");
    expect(formatQuestionnaireValue("location", "home", false)).toBe("Home");
    expect(formatQuestionnaireValue("equipment", "dumbbells", false)).toBe("Dumbbells");
    expect(formatQuestionnaireValue("preferred", "strength", false)).toBe("Strength training");
    expect(formatQuestionnaireValue("experience", "beginner", false)).toBe("Beginner");
  });

  it("maps the exact tokens the audit account stored (AR)", () => {
    expect(formatQuestionnaireValue("goal", "lose_fat", true)).toBe("خسارة الدهون");
    expect(formatQuestionnaireValue("location", "home", true)).toBe("المنزل");
    expect(formatQuestionnaireValue("equipment", "dumbbells", true)).toBe("دمبل");
    expect(formatQuestionnaireValue("experience", "beginner", true)).toBe("مبتدئ");
  });

  it("is whitespace/case/hyphen tolerant (placeholder invites 'lose fat')", () => {
    expect(formatQuestionnaireValue("goal", "lose fat", false)).toBe("Lose fat");
    expect(formatQuestionnaireValue("goal", "Lose-Fat", false)).toBe("Lose fat");
    expect(formatQuestionnaireValue("goal", " Build Muscle ", false)).toBe("Build muscle");
  });

  it("maps diet tokens", () => {
    expect(formatQuestionnaireValue("diet", "balanced", true)).toBe("متوازن");
    expect(formatQuestionnaireValue("diet", "keto", false)).toBe("Keto");
  });
});

describe("formatQuestionnaireValue — honest fallbacks", () => {
  it("passes genuine free text through verbatim in both languages", () => {
    const freeText = "أريد الجري في ماراثون القاهرة";
    expect(formatQuestionnaireValue("goal", freeText, true)).toBe(freeText);
    expect(formatQuestionnaireValue("goal", "run a marathon", false)).toBe("run a marathon");
  });

  it("passes unknown keys (age, notes…) through verbatim", () => {
    expect(formatQuestionnaireValue("age", "30", false)).toBe("30");
    expect(formatQuestionnaireValue("notes", "أي نص", true)).toBe("أي نص");
  });

  it("renders an em dash for null/empty values", () => {
    expect(formatQuestionnaireValue("goal", null, false)).toBe("—");
    expect(formatQuestionnaireValue("goal", "", true)).toBe("—");
    expect(formatQuestionnaireValue("goal", "   ", false)).toBe("—");
  });
});
