/**
 * ShoppingList — §12.30 (owner directive 2026-09-12: «مكتوب وعد بعمل
 * قائمة تسوق للاكل ولاكن لا يوجد أداة لتنفيذ الامر»).
 *
 * The meal-planner reference content (§12.25) teaches the plan-to-cart
 * conversion — "sum each food's grams across the week's plans, add about
 * 20% buffer for waste and appetite" — and this module is the TOOL that
 * executes that promise on the visitor's own plan. Pure and synchronous:
 * no API, no storage, no membership gate (the list builds from the same
 * free visitor plan the planner itself serves).
 *
 * LAWS (guarded in src/lib/__tests__/shopping-list.test.ts):
 *   - AGGREGATION NEVER LOSES GRAMS: every item's grams land in exactly
 *     one row (name-normalized merge), and the row total is the exact
 *     sum × days × (1 + buffer).
 *   - THE 20% BUFFER DEFAULT mirrors the written promise in the content.
 *   - Display units: grams below 1 kg, kilograms at ≥1 kg.
 */

export interface ShoppingListSourceItem {
  name: string;
  grams: number;
}

export interface ShoppingListSourceMeal {
  items: ShoppingListSourceItem[];
}

export interface ShoppingListOptions {
  /** How many days the basket should cover (1 · 3 · 7). Default 7. */
  days?: number;
  /** Waste/appetite buffer as a fraction (0.2 = +20%). Default 0.2. */
  buffer?: number;
}

export interface ShoppingListRow {
  /** Canonical (trimmed) food name as entered in the plan. */
  name: string;
  /** Raw summed grams BEFORE days × buffer. */
  dayGrams: number;
  /** Final grams for the basket: dayGrams × days × (1 + buffer), rounded to 5 g. */
  grams: number;
}

export const SHOPPING_LIST_DEFAULT_DAYS = 7;
export const SHOPPING_LIST_DEFAULT_BUFFER = 0.2;
export const SHOPPING_LIST_DAY_CHOICES = [1, 3, 7] as const;

/** Normalize a food name for merging (trim + collapse inner whitespace). */
function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function clampOptions(options: ShoppingListOptions): {
  days: number;
  buffer: number;
} {
  const days = Number.isFinite(options.days)
    ? Math.min(30, Math.max(1, Math.round(options.days ?? SHOPPING_LIST_DEFAULT_DAYS)))
    : SHOPPING_LIST_DEFAULT_DAYS;
  // An OMITTED buffer defaults to the promised 20% (§12.30 law); an
  // explicit 0 (buffer toggle off) is preserved.
  const rawBuffer = options.buffer ?? SHOPPING_LIST_DEFAULT_BUFFER;
  const buffer = Number.isFinite(rawBuffer)
    ? Math.min(1, Math.max(0, rawBuffer))
    : SHOPPING_LIST_DEFAULT_BUFFER;
  return { days, buffer };
}

/**
 * Aggregate a plan into a shopping list. Items appearing in several meals
 * merge into ONE row (name-normalized); the final grams carry the days
 * multiplier and the buffer, rounded to a sane 5-g step.
 */
export function aggregateShoppingList(
  meals: ShoppingListSourceMeal[],
  options: ShoppingListOptions = {},
): ShoppingListRow[] {
  const { days, buffer } = clampOptions(options);
  const byName = new Map<string, number>();
  for (const meal of meals) {
    for (const item of meal.items ?? []) {
      const name = normalizeName(String(item.name ?? ""));
      const grams = Number(item.grams) || 0;
      if (!name || grams <= 0) continue;
      byName.set(name, (byName.get(name) ?? 0) + grams);
    }
  }
  const factor = days * (1 + buffer);
  return [...byName.entries()]
    .map(([name, dayGrams]) => ({
      name,
      dayGrams,
      grams: Math.max(5, Math.round((dayGrams * factor) / 5) * 5),
    }))
    .sort((a, b) => b.grams - a.grams);
}

/** True basket weight of the list (for the summary line). */
export function shoppingListTotalGrams(rows: ShoppingListRow[]): number {
  return rows.reduce((s, r) => s + r.grams, 0);
}

/** Human unit: grams below 1 kg, kilograms at ≥1 kg. */
export function formatAmount(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${Number.isInteger(kg) ? kg : kg.toFixed(1)} kg`;
  }
  return `${grams} g`;
}

/**
 * Plain-text list, ready to paste into a notes app or a store chat —
 * one item per line: "Chicken breast — 1.5 kg".
 */
export function formatShoppingListText(
  rows: ShoppingListRow[],
  lang: "en" | "ar",
): string {
  const header =
    lang === "ar" ? "قائمة التسوق:" : "Shopping list:";
  const lines = rows.map((r) => `${r.name} — ${formatAmount(r.grams)}`);
  return [header, ...lines].join("\n");
}
