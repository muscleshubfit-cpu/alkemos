import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { isDuplicateTopic } from "@/lib/blog-topics";

/**
 * PHASE 178 (§12.42) — keyword-cannibalization regression guard. The live
 * audit found the AR blog carrying SEVEN sleep articles — four answering
 * literally «كم ساعة نوم أحتاجها لبناء العضلات؟» — plus three
 * slug-suffixed variants of one topic (sleep-recovery-gym-results-1bbi /
 * -3pc8). Root cause: the topic dedup window only saw the LAST 30
 * published posts (blog-research) so older duplicates scrolled out; the
 * detector itself was never pinned by a test. These vectors pin BOTH:
 *   1. isDuplicateTopic MUST flag the real sleep-family pairs (the exact
 *      live titles, verbatim from the production DB).
 *   2. The research path now queries the full-corpus horizon (100 —
 *      aligned with the blog-topics default), pinned by a source canary.
 *   3. Distinct intents (hours vs impact vs science angles as
 *      consolidated by migration 0084) still pass — the detector must
 *      not become a false-positive machine that blocks all coverage.
 */

// The four LIVE titles that answer the same question (production DB).
const HOURS_QUESTION_TITLES = [
  "كم ساعة نوم يحتاجها الرياضي لبناء العضلات؟ دليل للنتائج",
  "كم ساعة نوم أحتاجها لبناء العضلات؟ إجابة علمية للرياضي",
  "كم ساعة نوم تحتاجها لبناء العضلات وتحسين الاستشفاء في الجيم؟",
  "كم ساعة نوم أحتاجها لبناء العضلات؟ دليل عملي للاستشفاء السريع",
];

describe("isDuplicateTopic — sleep-family cannibalization vectors (Phase 178)", () => {
  it("flags a 5th 'how many hours of sleep' topic against ANY of the 4 live titles", () => {
    const newTopic = "كم ساعة نوم أحتاجها لبناء العضلات؟";
    const newKw = "كم ساعة نوم لبناء العضلات";
    for (const existingTitle of HOURS_QUESTION_TITLES) {
      const result = isDuplicateTopic(newTopic, newKw, [
        { title: existingTitle, focusKeyword: "" },
      ]);
      expect(
        result.duplicate,
        `should flag against existing "${existingTitle}"`,
      ).toBe(true);
    }
  });

  it("flags each live title (with its production-style short keyword) against the first one", () => {
    // Production calls isDuplicateTopic(aiTopic, aiFocusKw, recent) with
    // the model's SHORT focus keyword — not the full title. Pin that
    // shape: every family member with the canonical short query is
    // caught against the first published title.
    const first = HOURS_QUESTION_TITLES[0];
    const shortKw = "كم ساعة نوم لبناء العضلات";
    for (const other of HOURS_QUESTION_TITLES.slice(1)) {
      const result = isDuplicateTopic(other, shortKw, [
        { title: first, focusKeyword: "" },
      ]);
      expect(result.duplicate, `"${other}" vs "${first}"`).toBe(true);
    }
  });

  it("keeps the consolidated HOURS intent distinct from the IMPACT and SCIENCE intents", () => {
    // Migration 0084 keeps three intents: hours (count), impact (effect),
    // science (mechanism/hormones). The hours question must NOT be
    // blocked by the other two (genuinely different search intents) —
    // the detector keeps them separate at the keyword level.
    const hours = { title: HOURS_QUESTION_TITLES[0], focusKeyword: "كم ساعة نوم لبناء العضلات" };
    const impact = { title: "كيف يؤثر النوم والاستشفاء على بناء العضلات في الجيم بسرعة؟", focusKeyword: "تأثير النوم على بناء العضلات" };
    const science = { title: "دليل علمي: تأثير النوم على بناء العضلات وهرمونات النمو", focusKeyword: "علم النوم وهرمونات النمو" };
    for (const other of [impact, science]) {
      const result = isDuplicateTopic(hours.title, hours.focusKeyword, [
        { title: other.title, focusKeyword: other.focusKeyword },
      ]);
      expect(
        result.duplicate,
        `hours intent must stay distinct from "${other.title}"`,
      ).toBe(false);
    }
  });
});

describe("dedup horizon — the full-corpus window (Phase 178)", () => {
  it("blog-research queries 100 published posts (the 30-post window missed the sleep family)", () => {
    const src = readFileSync("src/lib/blog-research.ts", "utf8");
    expect(src).toContain("getRecentPostsByLanguage(lang, 100)");
    expect(src).not.toContain("getRecentPostsByLanguage(lang, 30)");
  });
});
