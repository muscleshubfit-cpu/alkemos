/**
 * Hub depth content tests — Phase SEO-GEO-5.2 (§6.3 template items 4+5).
 *
 * Laws enforced here (see hub-depth.ts header for rationale):
 *   1. COMPLETENESS — every non-empty hub in all three families has depth
 *      content; the only exempt slugs are the two empty hubs (cardio/none).
 *   2. SLUG INTEGRITY — every registry key resolves in its family list.
 *   3. BILINGUAL DEPTH — guides and FAQs exist in EN + AR with real length.
 *   4. ATOMIC ANSWERS — 5–8 FAQs per hub, answers 25–110 words, questions
 *      interrogative, unique within a hub (both languages).
 *   5. NO CJK — the 12.14 corruption family never returns (any field).
 *   6. ANTI-FABRICATION — no URLs, no "PMID"; and every exercise/food named
 *      in the mention maps below must exist in the library AND belong to
 *      the hub it is named under (category/equipment/tag verified live).
 */

import { describe, expect, it } from "vitest";

import {
  EQUIPMENT_HUBS,
  FOOD_COLLECTIONS,
  MUSCLE_HUBS,
  getExercisesForMuscleHub,
  getExercisesForEquipmentHub,
  getFoodsForCollection,
} from "../hub-collections";
import { EXERCISES } from "../exercises";
import { FOODS } from "../foods";
import {
  HUB_DEPTH_EMPTY_EXEMPT,
  getHubDepth,
  type HubDepthContent,
} from "../hub-depth";
import { MUSCLE_DEPTH } from "../hub-depth-muscles";
import { EQUIPMENT_DEPTH } from "../hub-depth-equipment";
import { COLLECTION_DEPTH } from "../hub-depth-collections";

const hasCJK = (s: string) => /[\u4E00-\u9FFF\u3040-\u30FF]/.test(s);
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

function walkText(depth: HubDepthContent): string[] {
  return [
    depth.guideEn,
    depth.guideAr,
    ...depth.faq.flatMap((f) => [f.qEn, f.aEn, f.qAr, f.aAr]),
  ];
}

// --- Mention maps (anti-fabrication ground truth) ---------------------------
// Every slug named in a hub's depth content is declared here and verified
// against the live library: existence + family membership.

const MUSCLE_EXERCISE_MENTIONS: Record<string, string[]> = {
  chest: [
    "barbell-bench-press-medium-grip",
    "barbell-incline-bench-press-medium-grip",
    "dumbbell-flyes",
    "cable-chest-press",
    "decline-push-up",
    "plyo-push-up",
    "incline-push-up",
  ],
  back: [
    "pullups",
    "wide-grip-lat-pulldown",
    "bent-over-barbell-row",
    "bent-over-two-dumbbell-row",
    "barbell-deadlift",
    "one-arm-lat-pulldown",
    "band-assisted-pull-up",
    "bodyweight-mid-row",
  ],
  shoulders: [
    "barbell-shoulder-press",
    "arnold-dumbbell-press",
    "cable-seated-lateral-raise",
    "face-pull",
    "cable-rear-delt-fly",
    "handstand-push-ups",
  ],
  legs: [
    "barbell-squat",
    "box-squat",
    "romanian-deadlift",
    "barbell-hip-thrust",
    "barbell-walking-lunge",
    "bodyweight-walking-lunge",
    "leg-press",
    "leg-extensions",
    "lying-leg-curls",
    "seated-calf-raise",
    "goblet-squat",
    "dumbbell-step-ups",
    "bodyweight-squat",
  ],
  biceps: [
    "barbell-curl",
    "close-grip-standing-barbell-curl",
    "hammer-curls",
    "concentration-curls",
    "incline-hammer-curls",
    "cable-preacher-curl",
    "machine-preacher-curls",
  ],
  triceps: [
    "close-grip-barbell-bench-press",
    "bench-dips",
    "triceps-pushdown",
    "triceps-pushdown-rope-attachment",
    "triceps-overhead-extension-with-rope",
    "band-skull-crusher",
    "close-grip-ez-bar-press",
  ],
  core: [
    "plank",
    "ab-roller",
    "crunches",
    "cable-crunch",
    "cable-reverse-crunch",
    "russian-twist",
    "cable-russian-twists",
    "hanging-leg-raise",
    "air-bike",
  ],
};

const EQUIPMENT_EXERCISE_MENTIONS: Record<string, string[]> = {
  barbell: [
    "barbell-squat",
    "barbell-deadlift",
    "barbell-bench-press-medium-grip",
    "barbell-shoulder-press",
    "bent-over-barbell-row",
    "barbell-hip-thrust",
    "box-squat",
    "close-grip-barbell-bench-press",
  ],
  dumbbell: [
    "dumbbell-bench-press",
    "incline-dumbbell-flyes",
    "arnold-dumbbell-press",
    "bent-over-two-dumbbell-row",
    "dumbbell-squat",
    "dumbbell-step-ups",
    "hammer-curls",
    "dumbbell-flyes",
    "dumbbell-shrug",
    "concentration-curls",
    "one-arm-dumbbell-bench-press",
  ],
  bodyweight: [
    "pullups",
    "incline-push-up",
    "decline-push-up",
    "plyo-push-up",
    "clock-push-up",
    "bodyweight-squat",
    "bodyweight-walking-lunge",
    "plank",
    "ab-roller",
    "bodyweight-mid-row",
    "mountain-climbers",
    "hanging-leg-raise",
    "band-assisted-pull-up",
  ],
  cable: [
    "wide-grip-lat-pulldown",
    "face-pull",
    "cable-chest-press",
    "cable-crunch",
    "cable-seated-lateral-raise",
    "cable-preacher-curl",
    "cable-incline-pushdown",
    "close-grip-front-lat-pulldown",
    "one-arm-lat-pulldown",
    "cable-rope-rear-delt-rows",
    "cable-russian-twists",
    "cable-reverse-crunch",
  ],
  machine: [
    "leg-press",
    "leg-extensions",
    "lying-leg-curls",
    "machine-preacher-curls",
    "butterfly",
    "seated-calf-raise",
    "ab-crunch-machine",
    "calf-press-on-the-leg-press-machine",
  ],
  kettlebell: [
    "goblet-squat",
    "alternating-kettlebell-press",
    "advanced-kettlebell-windmill",
    "alternating-kettlebell-row",
    "bent-press",
    "alternating-renegade-row",
  ],
  band: [
    "back-flyes-with-bands",
    "band-pull-apart",
    "band-skull-crusher",
    "calf-raises-with-bands",
    "band-good-morning",
    "bench-press-with-bands",
    "external-rotation-with-band",
  ],
};

const COLLECTION_FOOD_MENTIONS: Record<string, string[]> = {
  "high-protein-foods": [
    "chicken-breast",
    "lean-beef",
    "salmon",
    "tuna",
    "eggs",
    "egg-whites",
    "turkey-breast",
    "shrimp",
    "tilapia",
  ],
  "low-carb-foods": ["chicken-breast", "lean-beef", "salmon", "tuna", "eggs", "egg-whites"],
  "keto-friendly-foods": ["chicken-breast", "salmon", "tuna", "eggs", "shrimp", "avocado"],
  "low-fat-foods": ["chicken-breast", "tuna", "egg-whites", "turkey-breast", "shrimp", "tilapia"],
  "vegan-protein-sources": [
    "tofu",
    "oatmeal",
    "potato",
    "sweet-potato",
    "whole-wheat-bread",
    "pasta",
  ],
  "vegetarian-protein-sources": [
    "eggs",
    "tofu",
    "oatmeal",
    "potato",
    "sweet-potato",
    "whole-wheat-bread",
  ],
  "foods-for-cutting": [
    "chicken-breast",
    "tuna",
    "egg-whites",
    "turkey-breast",
    "shrimp",
    "tilapia",
  ],
  "foods-for-bulking": [
    "lean-beef",
    "salmon",
    "ground-beef-lean",
    "white-rice",
    "brown-rice",
    "oatmeal",
  ],
  "no-cook-foods": [
    "chicken-breast",
    "tuna",
    "whole-wheat-bread",
    "cereal",
    "granola",
    "avocado",
  ],
  "quick-prep-foods": ["tuna", "eggs", "egg-whites", "white-rice", "oatmeal", "whole-wheat-bread"],
};

describe("hub depth content — completeness (§6.3 items 4+5)", () => {
  it("every populated muscle hub has depth content", () => {
    for (const hub of MUSCLE_HUBS) {
      const populated = getExercisesForMuscleHub(hub).length > 0;
      const depth = getHubDepth("muscle", hub.slug);
      if (populated) {
        expect(depth, `muscle hub ${hub.slug} must have depth content`).not.toBeNull();
      } else {
        expect(depth, `empty muscle hub ${hub.slug} must stay exempt`).toBeNull();
      }
    }
  });

  it("every populated equipment hub has depth content", () => {
    for (const hub of EQUIPMENT_HUBS) {
      const populated = getExercisesForEquipmentHub(hub).length > 0;
      const depth = getHubDepth("equipment", hub.slug);
      if (populated) {
        expect(depth, `equipment hub ${hub.slug} must have depth content`).not.toBeNull();
      } else {
        expect(depth, `empty equipment hub ${hub.slug} must stay exempt`).toBeNull();
      }
    }
  });

  it("every food collection has depth content", () => {
    for (const collection of FOOD_COLLECTIONS) {
      expect(
        getFoodsForCollection(collection).length,
        `collection ${collection.slug} unexpectedly empty`,
      ).toBeGreaterThan(0);
      expect(getHubDepth("collection", collection.slug)).not.toBeNull();
    }
  });

  it("the exempt map lists exactly the two known empty hubs", () => {
    expect(HUB_DEPTH_EMPTY_EXEMPT.muscle).toEqual(["cardio"]);
    expect(HUB_DEPTH_EMPTY_EXEMPT.equipment).toEqual(["none"]);
    expect(HUB_DEPTH_EMPTY_EXEMPT.collection).toEqual([]);
    expect(Object.keys(MUSCLE_DEPTH)).toHaveLength(MUSCLE_HUBS.length - 1);
    expect(Object.keys(EQUIPMENT_DEPTH)).toHaveLength(EQUIPMENT_HUBS.length - 1);
    expect(Object.keys(COLLECTION_DEPTH)).toHaveLength(FOOD_COLLECTIONS.length);
  });
});

describe("hub depth content — bilingual depth + atomic answers", () => {
  const ALL: Array<[string, HubDepthContent]> = [
    ...Object.entries(MUSCLE_DEPTH),
    ...Object.entries(EQUIPMENT_DEPTH),
    ...Object.entries(COLLECTION_DEPTH),
  ];

  it("guides exist in both languages with real depth", () => {
    for (const [slug, depth] of ALL) {
      expect(depth.guideEn.length, `${slug}.guideEn too short`).toBeGreaterThanOrEqual(600);
      expect(depth.guideAr.length, `${slug}.guideAr too short`).toBeGreaterThanOrEqual(500);
      expect(words(depth.guideEn), `${slug}.guideEn word count`).toBeGreaterThanOrEqual(120);
      expect(words(depth.guideAr), `${slug}.guideAr word count`).toBeGreaterThanOrEqual(100);
    }
  });

  it("FAQs: 5-8 entries, interrogative, unique, answers within atomic range", () => {
    for (const [slug, depth] of ALL) {
      expect(depth.faq.length, `${slug} faq count`).toBeGreaterThanOrEqual(5);
      expect(depth.faq.length, `${slug} faq count`).toBeLessThanOrEqual(8);

      const qEnSeen = new Set<string>();
      const qArSeen = new Set<string>();
      for (const [i, f] of depth.faq.entries()) {
        expect(f.qEn.endsWith("?"), `${slug} faq[${i}].qEn interrogative`).toBe(true);
        expect(f.qAr.endsWith("؟"), `${slug} faq[${i}].qAr interrogative`).toBe(true);
        expect(qEnSeen.has(f.qEn), `${slug} duplicate qEn`).toBe(false);
        expect(qArSeen.has(f.qAr), `${slug} duplicate qAr`).toBe(false);
        qEnSeen.add(f.qEn);
        qArSeen.add(f.qAr);
        expect(words(f.aEn), `${slug} faq[${i}].aEn words`).toBeGreaterThanOrEqual(25);
        expect(words(f.aEn), `${slug} faq[${i}].aEn words`).toBeLessThanOrEqual(110);
        expect(words(f.aAr), `${slug} faq[${i}].aAr words`).toBeGreaterThanOrEqual(20);
        expect(words(f.aAr), `${slug} faq[${i}].aAr words`).toBeLessThanOrEqual(110);
        expect(f.qAr.length, `${slug} faq[${i}].qAr empty`).toBeGreaterThan(0);
      }
    }
  });

  it("no CJK characters anywhere (12.14 corruption family)", () => {
    for (const [slug, depth] of ALL) {
      for (const text of walkText(depth)) {
        expect(hasCJK(text), `CJK survived in ${slug}: "${text.slice(0, 40)}"`).toBe(false);
      }
    }
  });

  it("anti-fabrication: no URLs and no fabricated citation markers", () => {
    for (const [slug, depth] of ALL) {
      for (const text of walkText(depth)) {
        expect(text.includes("http://") || text.includes("https://"), `${slug} contains URL`).toBe(
          false,
        );
        expect(text.includes("PMID"), `${slug} contains PMID`).toBe(false);
      }
    }
  });
});

describe("hub depth content — anti-fabrication mention maps", () => {
  it("muscle-hub exercise mentions exist and belong to the hub category", () => {
    for (const [slug, mentions] of Object.entries(MUSCLE_EXERCISE_MENTIONS)) {
      const hub = MUSCLE_HUBS.find((h) => h.slug === slug);
      expect(hub, `muscle hub ${slug} exists`).toBeDefined();
      const inHub = new Set(getExercisesForMuscleHub(hub!).map((e) => e.slug));
      for (const exerciseSlug of mentions) {
        const exercise = EXERCISES.find((e) => e.slug === exerciseSlug);
        expect(exercise, `${slug} mentions "${exerciseSlug}" — must exist`).toBeDefined();
        expect(
          inHub.has(exerciseSlug),
          `${slug} names "${exerciseSlug}" (category=${exercise!.category}) but it is not in the hub`,
        ).toBe(true);
      }
    }
  });

  it("equipment-hub exercise mentions exist and use that exact equipment", () => {
    for (const [slug, mentions] of Object.entries(EQUIPMENT_EXERCISE_MENTIONS)) {
      const hub = EQUIPMENT_HUBS.find((h) => h.slug === slug);
      expect(hub, `equipment hub ${slug} exists`).toBeDefined();
      const inHub = new Set(getExercisesForEquipmentHub(hub!).map((e) => e.slug));
      for (const exerciseSlug of mentions) {
        const exercise = EXERCISES.find((e) => e.slug === exerciseSlug);
        expect(exercise, `${slug} mentions "${exerciseSlug}" — must exist`).toBeDefined();
        expect(
          exercise!.equipment,
          `${slug} names "${exerciseSlug}" but its equipment is ${exercise!.equipment}`,
        ).toBe(slug);
        expect(inHub.has(exerciseSlug)).toBe(true);
      }
    }
  });

  it("collection food mentions exist and carry the collection tag", () => {
    for (const [slug, mentions] of Object.entries(COLLECTION_FOOD_MENTIONS)) {
      const collection = FOOD_COLLECTIONS.find((c) => c.slug === slug);
      expect(collection, `collection ${slug} exists`).toBeDefined();
      const inCollection = new Set(getFoodsForCollection(collection!).map((f) => f.slug));
      for (const foodSlug of mentions) {
        const food = FOODS.find((f) => f.slug === foodSlug);
        expect(food, `${slug} mentions "${foodSlug}" — must exist`).toBeDefined();
        expect(
          food!.tags,
          `${slug} names "${foodSlug}" but its tags are [${food!.tags?.join(", ")}]`,
        ).toContain(collection!.tag);
        expect(inCollection.has(foodSlug)).toBe(true);
      }
    }
  });
});
