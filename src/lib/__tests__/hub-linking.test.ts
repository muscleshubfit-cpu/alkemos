import { describe, it, expect } from "vitest";
import {
  getMuscleHubByCategory,
  getEquipmentHubByEquipment,
  getCollectionsForFoodTags,
  MAX_COLLECTION_LINKS_PER_FOOD,
  MUSCLE_HUBS,
  EQUIPMENT_HUBS,
  FOOD_COLLECTIONS,
  isAdvertisedMuscleHub,
  isAdvertisedEquipmentHub,
} from "@/lib/hub-collections";
import { EXERCISES } from "@/lib/exercises";
import { FOODS } from "@/lib/foods";

/**
 * Phase 155 (SEO-GEO-4.7, §7.1 #11) — spoke→hub internal linking
 * resolvers. The whole feature is "deterministic 1:1 field matches",
 * so these tests pin the determinism itself:
 *
 *   1. EVERY exercise in the library resolves a muscle hub and an
 *      equipment hub (no exercise page renders an empty browse strip).
 *   2. Slugs round-trip: hub hrefs point at real hub slugs.
 *   3. Food tag → collection mapping stays capped and ordered.
 *   4. No CJK characters anywhere in the bilingual hub/collection
 *      copy (regression canary for the Phase 155 corruption fix —
 *      «وتوت形成» shipped to production once already).
 */

const hasCJK = (s: string) => /[\u4E00-\u9FFF\u3040-\u30FF]/.test(s);

describe("Phase 155 spoke→hub resolvers", () => {
  it("every exercise resolves BOTH its muscle hub and equipment hub", () => {
    expect(EXERCISES.length).toBeGreaterThan(0);
    for (const ex of EXERCISES) {
      const muscle = getMuscleHubByCategory(ex.category);
      const equipment = getEquipmentHubByEquipment(ex.equipment);
      expect(muscle, `${ex.slug} category=${ex.category}`).not.toBeNull();
      expect(equipment, `${ex.slug} equipment=${ex.equipment}`).not.toBeNull();
      expect(muscle!.category).toBe(ex.category);
      expect(equipment!.equipment).toBe(ex.equipment);
    }
  });

  it("hub arrays are fully covered (no orphan definitions)", () => {
    // Every NON-EMPTY hub must be reachable from at least one exercise —
    // otherwise the spoke→hub links can never send it authority.
    const categories = new Set(EXERCISES.map((e) => e.category));
    const equipment = new Set(EXERCISES.map((e) => e.equipment));
    for (const h of MUSCLE_HUBS) {
      if (!isAdvertisedMuscleHub(h)) continue; // empty hubs: sitemap policy
      expect(categories.has(h.category), `muscle hub ${h.slug}`).toBe(true);
    }
    for (const h of EQUIPMENT_HUBS) {
      if (!isAdvertisedEquipmentHub(h)) continue;
      expect(equipment.has(h.equipment), `equipment hub ${h.slug}`).toBe(true);
    }
  });

  it("EMPTY-HUB POLICY: the only unadvertised hubs are cardio (muscle) and none (equipment)", () => {
    // Library census (Phase 155): 868 exercises, ZERO category=cardio,
    // ZERO equipment=none → those two hubs (EN+AR) render empty grids.
    // This pin FAILS LOUDLY when the library gains matching rows — the
    // sitemap re-admission is automatic (isAdvertised*), so a failure
    // here is a signal to update this canary and celebrate, not a bug.
    const unadvertisedMuscle = MUSCLE_HUBS.filter((h) => !isAdvertisedMuscleHub(h)).map((h) => h.slug);
    const unadvertisedEquipment = EQUIPMENT_HUBS.filter((h) => !isAdvertisedEquipmentHub(h)).map((h) => h.slug);
    expect(unadvertisedMuscle).toEqual(["cardio"]);
    expect(unadvertisedEquipment).toEqual(["none"]);
  });

  it("collections resolve from food tags in editorial order, capped at 2", () => {
    const manyTags = ["high-protein", "low-carb", "low-fat", "keto-friendly"];
    const got = getCollectionsForFoodTags(manyTags);
    expect(got.length).toBe(MAX_COLLECTION_LINKS_PER_FOOD);
    // FOOD_COLLECTIONS order is the editorial priority — first match wins.
    expect(got[0].slug).toBe("high-protein-foods");
    expect(got[1].slug).toBe("low-carb-foods");
    // hrefs point at real collection slugs.
    for (const c of got) {
      expect(FOOD_COLLECTIONS.some((fc) => fc.slug === c.slug)).toBe(true);
    }
  });

  it("untagged foods (USDA long tail) get ZERO collection links", () => {
    expect(getCollectionsForFoodTags([])).toEqual([]);
    expect(getCollectionsForFoodTags(undefined)).toEqual([]);
    expect(getCollectionsForFoodTags(null)).toEqual([]);
    // And the dataset agrees: every tagged food resolves 1..2 collections,
    // and every long-tail food has no tags by construction.
    for (const f of FOODS) {
      const got = getCollectionsForFoodTags(f.tags);
      if ((f.tags?.length ?? 0) > 0) {
        expect(got.length).toBeGreaterThanOrEqual(1);
        expect(got.length).toBeLessThanOrEqual(MAX_COLLECTION_LINKS_PER_FOOD);
      } else {
        expect(got.length).toBe(0);
      }
    }
  });

  it("no CJK characters in any bilingual hub/collection copy", () => {
    for (const h of MUSCLE_HUBS) {
      for (const v of [h.titleAr, h.h1Ar, h.introAr, h.descriptionAr, h.titleEn, h.h1En, h.introEn, h.descriptionEn]) {
        expect(hasCJK(v), `muscle hub ${h.slug}: "${v.slice(0, 40)}"`).toBe(false);
      }
    }
    for (const h of EQUIPMENT_HUBS) {
      for (const v of [h.titleAr, h.h1Ar, h.introAr, h.descriptionAr, h.titleEn, h.h1En, h.introEn, h.descriptionEn]) {
        expect(hasCJK(v), `equipment hub ${h.slug}: "${v.slice(0, 40)}"`).toBe(false);
      }
    }
    for (const c of FOOD_COLLECTIONS) {
      for (const v of [c.titleAr, c.h1Ar, c.introAr, c.descriptionAr, c.titleEn, c.h1En, c.introEn, c.descriptionEn]) {
        expect(hasCJK(v), `collection ${c.slug}: "${v.slice(0, 40)}"`).toBe(false);
      }
    }
  });
});
