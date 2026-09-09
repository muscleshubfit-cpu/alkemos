import { describe, it, expect } from "vitest";
import {
  detectEvoCrisis,
  evoCrisisReply,
  isArabicText,
} from "@/lib/evo-safety";

/**
 * EVO-1 (W5.3) — YMYL safety shields.
 * LAW: crisis signals NEVER reach a model; the static reply does.
 * Precision law: gym hyperbole must NOT fire («التمرين ده قتلني»).
 */

describe("detectEvoCrisis — self-harm (EN)", () => {
  it("fires on explicit self-harm intent", () => {
    expect(detectEvoCrisis("I want to kill myself")).toBe("self-harm");
    expect(detectEvoCrisis("sometimes I think about suicide")).toBe("self-harm");
    expect(detectEvoCrisis("how do I end my life")).toBe("self-harm");
    expect(detectEvoCrisis("I want to hurt myself")).toBe("self-harm");
  });

  it("fires despite case and punctuation noise", () => {
    expect(detectEvoCrisis("I WANNA DIE...")).toBe("self-harm");
    expect(detectEvoCrisis("Suicide!?")).toBe("self-harm");
  });
});

describe("detectEvoCrisis — self-harm (AR)", () => {
  it("fires on normalized Arabic forms (alef/yaa/marbuta variants)", () => {
    expect(detectEvoCrisis("أفكر في الانتحار")).toBe("self-harm");
    expect(detectEvoCrisis("عايز أقتل نفسي")).toBe("self-harm");
    expect(detectEvoCrisis("أنهي حياتي")).toBe("self-harm");
    expect(detectEvoCrisis("نفسي أموت")).toBe("self-harm");
  });

  it("fires with diacritics and tatweel present", () => {
    expect(detectEvoCrisis("اَنْتِحَار")).toBe("self-harm");
  });
});

describe("detectEvoCrisis — eating-disorder", () => {
  it("fires on concrete ED behaviors (EN)", () => {
    expect(detectEvoCrisis("how can I make myself throw up after meals")).toBe(
      "eating-disorder",
    );
    expect(detectEvoCrisis("I want to starve myself for a month")).toBe(
      "eating-disorder",
    );
    expect(detectEvoCrisis("do I have anorexia")).toBe("eating-disorder");
  });

  it("fires on concrete ED behaviors (AR)", () => {
    expect(detectEvoCrisis("بخلي نفسي أتقيأ بعد الأكل")).toBe("eating-disorder");
    expect(detectEvoCrisis("مش هاكل خالص تاني")).toBe("eating-disorder");
  });
});

describe("detectEvoCrisis — precision guards (MUST NOT fire)", () => {
  it("never fires on gym hyperbole", () => {
    expect(detectEvoCrisis("التمرين ده قتلني اليوم")).toBeNull();
    expect(detectEvoCrisis("this workout is killing me")).toBeNull();
    expect(detectEvoCrisis("اليوم اتمرنت لحد الموت")).toBeNull();
  });

  it("never fires on legitimate fasting/dieting talk", () => {
    expect(detectEvoCrisis("هل الصيام المتقطع مفيد لبناء العضلات؟")).toBeNull();
    expect(detectEvoCrisis("I do intermittent fasting 16:8")).toBeNull();
    expect(detectEvoCrisis("عايز أنزل 5 كيلو في 3 شهور")).toBeNull();
  });

  it("never fires on ordinary fitness questions", () => {
    expect(detectEvoCrisis("كم بروتين في صدور الفراخ؟")).toBeNull();
    expect(detectEvoCrisis("best bench press form")).toBeNull();
    expect(detectEvoCrisis("")).toBeNull();
  });
});

describe("evoCrisisReply", () => {
  it("mirrors the user's language — Arabic gets the Arabic reply", () => {
    const ar = evoCrisisReply("self-harm", true);
    expect(isArabicText(ar)).toBe(true);
    expect(ar).toContain("الطوارئ");
  });

  it("English gets the English reply", () => {
    const en = evoCrisisReply("self-harm", false);
    expect(isArabicText(en)).toBe(false);
    expect(en).toContain("emergency services");
  });

  it("eating-disorder reply points to real specialists and safe platform help", () => {
    const ar = evoCrisisReply("eating-disorder", true);
    expect(ar).toContain("أخصائي تغذية");
    const en = evoCrisisReply("eating-disorder", false);
    expect(en).toContain("nutrition specialist");
  });

  it("both replies never fabricate hotline numbers", () => {
    for (const kind of ["self-harm", "eating-disorder"] as const) {
      for (const ar of [true, false]) {
        expect(evoCrisisReply(kind, ar)).not.toMatch(/\d{5,}/);
      }
    }
  });
});
