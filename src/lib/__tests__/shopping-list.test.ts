import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  aggregateShoppingList,
  formatAmount,
  formatShoppingListText,
  shoppingListTotalGrams,
  SHOPPING_LIST_DEFAULT_BUFFER,
  SHOPPING_LIST_DEFAULT_DAYS,
  SHOPPING_LIST_DAY_CHOICES,
} from "@/lib/shopping-list";

/**
 * §12.30 canaries — the shopping-list tool (owner directive «مكتوب وعد
 * بعمل قائمة تسوق للاكل ولاكن لا يوجد أداة لتنفيذ الامر»): the
 * meal-planner reference content teaches the plan-to-cart conversion
 * ("sum the grams, add ~20% buffer") and this is the tool that executes
 * that promise on the visitor's own plan.
 *
 * LAWS GUARDED:
 *   1. AGGREGATION NEVER LOSES GRAMS: every item lands in exactly one
 *      row; dayGrams is the exact sum across meals.
 *   2. NAME UNIFICATION: a food in two meals = ONE row with the sum.
 *   3. DAYS × BUFFER math on a known vector (7 days × 1.2).
 *   4. BOUNDS: days clamp to 1–30; the default horizon is 7 days with
 *      the promised 20% buffer.
 *   5. UNITS: grams below 1 kg, kilograms at ≥1 kg.
 *   6. COPY TEXT: one item per line, header present, bilingual.
 *   7. WIRING: the meal planner mounts ShoppingListCard and the written
 *      promise in the reference content points at the tool.
 *   8. NO GATE: the shopping list derives from the free plan — no tier,
 *      no auth, no membership references anywhere in the module or card.
 */

const PLAN = [
  {
    items: [
      { name: "Chicken breast", grams: 200 },
      { name: "Rice", grams: 250 },
    ],
  },
  {
    items: [
      { name: "Chicken breast", grams: 150 }, // same food, second meal
      { name: "  Rice ", grams: 150 }, // padded name must merge
      { name: "Olive oil", grams: 10 },
    ],
  },
];

describe("shopping list (§12.30)", () => {
  it("AGGREGATION: every gram lands in exactly one row (exact day sums)", () => {
    const rows = aggregateShoppingList(PLAN, { days: 1, buffer: 0 });
    const byName = new Map(rows.map((r) => [r.name, r.dayGrams]));
    expect(byName.get("Chicken breast")).toBe(350);
    expect(byName.get("Rice")).toBe(400);
    expect(byName.get("Olive oil")).toBe(10);
    expect(rows).toHaveLength(3);
    // Sorted heaviest-first.
    expect(rows[0].name).toBe("Rice");
    // With days=1 and no buffer, basket grams equal the day sums.
    expect(rows.find((r) => r.name === "Olive oil")?.grams).toBe(10);
  });

  it("UNIFICATION: the same food across meals becomes ONE row", () => {
    const rows = aggregateShoppingList(PLAN, { days: 1, buffer: 0 });
    const names = rows.map((r) => r.name);
    expect(names.filter((n) => n === "Chicken breast")).toHaveLength(1);
    expect(names).toContain("Rice");
    // Junk rows never appear.
    const junk = aggregateShoppingList(
      [{ items: [{ name: "  ", grams: 100 }, { name: "X", grams: 0 }] }],
      { days: 1, buffer: 0 },
    );
    expect(junk).toHaveLength(0);
  });

  it("MATH: days × (1 + buffer) on a known vector (7 × 1.2)", () => {
    const rows = aggregateShoppingList(PLAN, { days: 7, buffer: 0.2 });
    const chicken = rows.find((r) => r.name === "Chicken breast")!;
    // 350 × 7 × 1.2 = 2940 → rounded to 5 g.
    expect(chicken.grams).toBe(2940);
    const rice = rows.find((r) => r.name === "Rice")!;
    expect(rice.grams).toBe(3360); // 400 × 7 × 1.2
  });

  it("BOUNDS + DEFAULTS: days clamp 1–30; default = 7 days, 20% buffer", () => {
    expect(SHOPPING_LIST_DEFAULT_DAYS).toBe(7);
    expect(SHOPPING_LIST_DEFAULT_BUFFER).toBe(0.2);
    expect([...SHOPPING_LIST_DAY_CHOICES]).toEqual([1, 3, 7]);
    const clampedLow = aggregateShoppingList(PLAN, { days: 0 });
    const clampedHigh = aggregateShoppingList(PLAN, { days: 99 });
    const one = clampedLow.find((r) => r.name === "Rice")!;
    const thirty = clampedHigh.find((r) => r.name === "Rice")!;
    expect(one.grams).toBe(Math.round((400 * 1.2) / 5) * 5);
    expect(thirty.grams).toBe(Math.round((400 * 30 * 1.2) / 5) * 5);
    // Default call = 7 days + 20% buffer.
    const def = aggregateShoppingList(PLAN);
    expect(def.find((r) => r.name === "Rice")!.grams).toBe(3360);
  });

  it("UNITS: grams below 1 kg, kilograms at ≥1 kg", () => {
    expect(formatAmount(350)).toBe("350 g");
    expect(formatAmount(999)).toBe("999 g");
    expect(formatAmount(1000)).toBe("1 kg");
    expect(formatAmount(2940)).toBe("2.9 kg");
    expect(formatAmount(1500)).toBe("1.5 kg");
  });

  it("COPY TEXT: one item per line with a header, bilingual", () => {
    const rows = aggregateShoppingList(PLAN, { days: 1, buffer: 0 });
    const en = formatShoppingListText(rows, "en");
    expect(en.split("\n")[0]).toBe("Shopping list:");
    expect(en).toContain("Chicken breast — 350 g");
    expect(en).toContain("Rice — 400 g");
    const ar = formatShoppingListText(rows, "ar");
    expect(ar.split("\n")[0]).toBe("قائمة التسوق:");
    expect(ar).toContain("Chicken breast — 350 g");
    // Basket total = sum of rows.
    expect(shoppingListTotalGrams(rows)).toBe(760);
  });

  it("WIRING: the meal planner mounts the card and the written promise points at it", () => {
    const page = readFileSync("src/app/meal-planner/page.tsx", "utf8");
    expect(page).toContain('from "@/components/ShoppingListCard"');
    expect(page).toContain("<ShoppingListCard meals={meals} />");
    const content = readFileSync("src/lib/content/meal-planner.ts", "utf8");
    // §12.30 bridge: the grocery-list promise references the tool.
    expect(content).toContain("shopping-list tool");
    expect(content).toContain("أداة قائمة التسوق");
  });

  it("NO GATE: no tier/auth/membership anywhere in the module or the card", () => {
    // Strip comments first — the law documentation itself MENTIONS the
    // forbidden names; only executable code must not contain them.
    const stripComments = (s: string) =>
      s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
    const lib = stripComments(readFileSync("src/lib/shopping-list.ts", "utf8"));
    const card = stripComments(readFileSync("src/components/ShoppingListCard.tsx", "utf8"));
    for (const [name, src] of [
      ["lib", lib],
      ["card", card],
    ] as const) {
      expect(src, `${name}: no membership gating`).not.toContain("membership");
      expect(src, `${name}: no tier gating`).not.toContain("tier");
      expect(src, `${name}: no auth import`).not.toContain("useAuth");
      expect(src, `${name}: no fetch`).not.toContain("fetch(");
    }
  });
});
