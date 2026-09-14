import { describe, it, expect } from "vitest";
import { FOODS } from "@/lib/foods";
import { EXERCISES } from "@/lib/exercises";
import { FOODS_COUNT } from "@/lib/foods-shared";
import {
  EXERCISES_COUNT,
  EXERCISE_CATEGORY_COUNTS,
} from "@/lib/exercises-shared";

/**
 * BUNDLE LAW GUARD (audit 2026-09-05): the client-safe shared modules
 * carry count CONSTANTS (src/lib/foods-shared.ts, exercises-shared.ts)
 * so client components never import the giant arrays just to show a
 * number. These tests pin the constants to the real data — if the data
 * files grow, the tests fail until the constants are updated.
 */
describe("library count constants match the real arrays", () => {
  it("FOODS_COUNT equals FOODS.length", () => {
    expect(FOODS_COUNT).toBe(FOODS.length);
  });

  it("EXERCISES_COUNT equals EXERCISES.length", () => {
    expect(EXERCISES_COUNT).toBe(EXERCISES.length);
  });

  it("EXERCISE_CATEGORY_COUNTS match per-category totals", () => {
    for (const cat of Object.keys(EXERCISE_CATEGORY_COUNTS) as Array<
      keyof typeof EXERCISE_CATEGORY_COUNTS
    >) {
      const real = EXERCISES.filter((e) => e.category === cat).length;
      expect(EXERCISE_CATEGORY_COUNTS[cat]).toBe(real);
    }
    // The per-category counts must exhaust the whole array.
    const sum = Object.values(EXERCISE_CATEGORY_COUNTS).reduce(
      (a, b) => a + b,
      0,
    );
    expect(sum).toBe(EXERCISES.length);
  });
});

// PHASE 195 (owner directive «Tools: الرقم الحقيقي الحالي، وهو 8، وليس 5» +
// «اجعل الأعداد Dynamic من مصدر البيانات قدر الإمكان»): the free-tools hub
// gets the same count-guard treatment as the exercise/food libraries.
// TOOLS_COUNT derives from the hub array (tools-shared.ts), so the homepage
// "8+ Tools" proof chip grows automatically when a tool is added — this
// census pin just makes that growth a CONSCIOUS update.
describe("tools count guard (Phase 195)", () => {
  it("TOOLS_COUNT equals the hub tools array length", async () => {
    const { TOOLS, TOOLS_COUNT } = await import("@/lib/tools-shared");
    expect(TOOLS_COUNT).toBe(TOOLS.length);
  });

  it("tools census: the hub serves 8 tools (5 calculators + meal planner + 2 AI planners)", async () => {
    const { TOOLS_COUNT } = await import("@/lib/tools-shared");
    expect(TOOLS_COUNT).toBe(8);
  });
});
