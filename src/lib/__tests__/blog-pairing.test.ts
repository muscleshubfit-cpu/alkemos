/**
 * blog-pairing.test.ts — Phase 157 bilingual pairing laws (22 tests).
 *
 * Every validation law of the pairing core is covered with INJECTED time
 * (deterministic, no fake timers): extractSharedBrief (6) ·
 * isAdoptablePairRow (6) · parsePairingJSON (8) · isValidAngleId (2).
 * Test literals derive from the documented Phase 157 spec (STATE/worklog).
 */
import { describe, it, expect } from "vitest";
import {
  extractSharedBrief,
  isAdoptablePairRow,
  parsePairingJSON,
  isValidAngleId,
  ADOPT_MAX_AGE_HOURS,
  JOIN_MAX_AGE_HOURS,
} from "@/lib/blog-pairing";

const NOW = new Date("2026-09-09T12:00:00.000Z");
const PAIR = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";

const EN_TOPIC = "How many calories should you really eat to lose weight";
const AR_TOPIC = "كم سعرة تحتاج فعلاً يوميًا لخسارة الوزن بدون فقدان العضلات";
const AR_NEW = "أفضل توزيع للبروتين والسعرات على وجبات اليوم لحرق الدهون";

const VALID_BRIEF = {
  pairId: PAIR,
  topicEn: EN_TOPIC,
  topicAr: AR_TOPIC,
  angleId: "guide",
  sealedAt: "2026-09-09T10:00:00.000Z", // 2h before NOW
};

describe("extractSharedBrief", () => {
  it("accepts a fully valid sealed brief", () => {
    const brief = extractSharedBrief({ research0: {}, sharedBrief: VALID_BRIEF }, { now: NOW });
    expect(brief).not.toBeNull();
    expect(brief?.pairId).toBe(PAIR);
    expect(brief?.angleId).toBe("guide");
  });

  it("rejects a raw text bundle (double-encoded / garbage)", () => {
    expect(extractSharedBrief("not-an-object", { now: NOW })).toBeNull();
    expect(extractSharedBrief(JSON.stringify(VALID_BRIEF), { now: NOW })).toBeNull();
  });

  it("rejects a legacy V3 bundle (no sharedBrief at all)", () => {
    expect(extractSharedBrief({ research0: { topics: ["x"] } }, { now: NOW })).toBeNull();
    expect(extractSharedBrief(null, { now: NOW })).toBeNull();
  });

  it("rejects too-short topics (min 10 chars each side)", () => {
    expect(
      extractSharedBrief(
        { sharedBrief: { ...VALID_BRIEF, topicEn: "short" } },
        { now: NOW },
      ),
    ).toBeNull();
    expect(
      extractSharedBrief(
        { sharedBrief: { ...VALID_BRIEF, topicAr: "قصير" } },
        { now: NOW },
      ),
    ).toBeNull();
  });

  it("enforces the freshness window with injected time (adopt ≤48h)", () => {
    const stale = { ...VALID_BRIEF, sealedAt: "2026-09-07T11:00:00.000Z" }; // 49h old
    expect(extractSharedBrief({ sharedBrief: stale }, { now: NOW })).toBeNull();
    const fresh = { ...VALID_BRIEF, sealedAt: "2026-09-07T13:00:00.000Z" }; // 47h old
    expect(extractSharedBrief({ sharedBrief: fresh }, { now: NOW })).not.toBeNull();
    const future = { ...VALID_BRIEF, sealedAt: "2026-09-09T13:00:00.000Z" }; // negative age
    expect(extractSharedBrief({ sharedBrief: future }, { now: NOW })).toBeNull();
    expect(ADOPT_MAX_AGE_HOURS).toBe(48);
    expect(JOIN_MAX_AGE_HOURS).toBe(30);
  });

  it("drops unknown angle ids (typo or retired angle)", () => {
    expect(
      extractSharedBrief(
        { sharedBrief: { ...VALID_BRIEF, angleId: "not-an-angle" } },
        { now: NOW },
      ),
    ).toBeNull();
  });
});

describe("isAdoptablePairRow", () => {
  const ROW = {
    id: "11111111-2222-4333-8444-555555555555",
    language: "en",
    status: "researched",
    pair_id: PAIR,
    created_at: "2026-09-09T08:00:00.000Z", // 4h before NOW
  };

  it("accepts a matching my-language researched recent pair row", () => {
    expect(isAdoptablePairRow(ROW, "en", { now: NOW })).toBe(true);
  });

  it("rejects a row of the OTHER language", () => {
    expect(isAdoptablePairRow(ROW, "ar", { now: NOW })).toBe(false);
  });

  it("rejects a row not in researched status (already outlined/published)", () => {
    expect(
      isAdoptablePairRow({ ...ROW, status: "outlined" }, "en", { now: NOW }),
    ).toBe(false);
  });

  it("rejects a row without a valid pair_id", () => {
    expect(
      isAdoptablePairRow({ ...ROW, pair_id: null }, "en", { now: NOW }),
    ).toBe(false);
    expect(
      isAdoptablePairRow({ ...ROW, pair_id: "not-a-uuid" }, "en", { now: NOW }),
    ).toBe(false);
  });

  it("rejects rows older than the freshness upper bound (≤48h)", () => {
    expect(
      isAdoptablePairRow(
        { ...ROW, created_at: "2026-09-07T11:00:00.000Z" }, // 49h
        "en",
        { now: NOW },
      ),
    ).toBe(false);
  });

  it("rejects malformed rows (null/garbage/array/missing id)", () => {
    expect(isAdoptablePairRow(null, "en", { now: NOW })).toBe(false);
    expect(isAdoptablePairRow("garbage", "en", { now: NOW })).toBe(false);
    expect(isAdoptablePairRow([ROW], "en", { now: NOW })).toBe(false);
    expect(isAdoptablePairRow({ ...ROW, id: "" }, "en", { now: NOW })).toBe(false);
  });
});

describe("parsePairingJSON", () => {
  const ctx = {
    enCandidates: [EN_TOPIC, "Best progressive overload guide for beginners"],
    arCandidates: [AR_TOPIC, "جدول تغذية لبناء العضلات للمبتدئين خطوة بخطوة"],
  };
  const OK = JSON.stringify({ topicEn: EN_TOPIC, topicAr: AR_TOPIC, angleId: "science" });

  it("accepts literal candidates from BOTH languages", () => {
    const c = parsePairingJSON(OK, ctx);
    expect(c).not.toBeNull();
    expect(c?.topicEn).toBe(EN_TOPIC);
    expect(c?.topicAr).toBe(AR_TOPIC);
  });

  it("matches literally after trim (model whitespace tolerated)", () => {
    const c = parsePairingJSON(
      JSON.stringify({ topicEn: `  ${EN_TOPIC} `, topicAr: ` ${AR_TOPIC}\n`, angleId: "science" }),
      ctx,
    );
    expect(c?.topicEn).toBe(EN_TOPIC);
    expect(c?.topicAr).toBe(AR_TOPIC);
  });

  it("accepts a NEW transplanted Arabic phrasing (no Latin letters)", () => {
    const c = parsePairingJSON(
      JSON.stringify({ topicEn: EN_TOPIC, topicAr: AR_NEW, angleId: "guide" }),
      ctx,
    );
    expect(c?.topicAr).toBe(AR_NEW);
  });

  it("rejects an English (Latin) topicAr — translation is banned", () => {
    expect(
      parsePairingJSON(
        JSON.stringify({ topicEn: EN_TOPIC, topicAr: "How to eat protein daily", angleId: "guide" }),
        ctx,
      ),
    ).toBeNull();
  });

  it("rejects too-short topics", () => {
    expect(
      parsePairingJSON(
        JSON.stringify({ topicEn: EN_TOPIC, topicAr: "قصير جدًا", angleId: "guide" }),
        ctx,
      ),
    ).toBeNull();
  });

  it("rejects topicEn outside the EN candidates (model may not invent)", () => {
    expect(
      parsePairingJSON(
        JSON.stringify({
          topicEn: "A brand new invented english topic that is long enough",
          topicAr: AR_TOPIC,
          angleId: "guide",
        }),
        ctx,
      ),
    ).toBeNull();
  });

  it("rejects an unknown angleId", () => {
    expect(
      parsePairingJSON(
        JSON.stringify({ topicEn: EN_TOPIC, topicAr: AR_TOPIC, angleId: "story" }),
        ctx,
      ),
    ).toBeNull();
  });

  it("rejects broken/garbage JSON", () => {
    expect(parsePairingJSON("{{{not json", ctx)).toBeNull();
    expect(parsePairingJSON("", ctx)).toBeNull();
  });
});

describe("isValidAngleId", () => {
  it("accepts a real ARTICLE_ANGLES id", () => {
    expect(isValidAngleId("guide")).toBe(true);
  });

  it("rejects unknown/non-string ids", () => {
    expect(isValidAngleId("not-an-angle")).toBe(false);
    expect(isValidAngleId(42)).toBe(false);
  });
});
