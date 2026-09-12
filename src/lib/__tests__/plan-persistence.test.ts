import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * PHASE 183 canaries — plan persistence for the AI planner pages
 * (owner decree 2026-09-13 «البوول الموحد» — spec "Alkemos —
 * Membership & Plan Changes"): the generated plan must survive
 * navigation, detail-page visits, back buttons, and refreshes.
 *   - Guest: localStorage mirror (versioned envelope + shape-gated read)
 *   - Member: account copy via /api/ai/planner-plan (mocked here at the
 *     lib boundary — the page hydrates it)
 *
 * The lib is client-only ("use client" + window guards) — tests drive
 * a jsdom-backed localStorage.
 */

const { peekGuestId, ensureGuestId, saveGuestPlan, loadGuestPlan, clearGuestPlan } =
  await import("@/lib/plan-persistence");

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function freshLocalStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  };
}

vi.stubGlobal("window", {
  localStorage: freshLocalStorage(),
});

const VALID_MEAL_PLAN = {
  meals: [
    {
      name: "Breakfast",
      kcal: 500,
      items: [{ food: "Oats", grams: 80, kcal: 300 }],
    },
  ],
  kcal: 500,
};

const VALID_WORKOUT_PLAN = {
  days: [
    {
      name: "Day 1",
      focus: "Push",
      exercises: [{ name: "Bench Press", sets: 4, reps: "8-12" }],
    },
  ],
};

describe("plan-persistence (Phase 183 — the disappearing-plan fix)", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: freshLocalStorage() });
  });

  describe("guest id", () => {
    it("ensureGuestId mints a UUID once and is stable afterwards", () => {
      const a = peekGuestId();
      expect(a).toBeNull(); // nothing minted yet (render-safe peek)
      const id = ensureGuestId();
      expect(UUID_RE.test(id)).toBe(true);
      expect(ensureGuestId()).toBe(id); // stable — never remints
      expect(peekGuestId()).toBe(id);
    });
  });

  describe("nutrition plans", () => {
    it("round-trips a valid plan with its inputs snapshot", () => {
      saveGuestPlan("nutrition", VALID_MEAL_PLAN as never, {
        calories: 2000,
        system: "balanced",
      });
      const restored = loadGuestPlan("nutrition");
      expect(restored).not.toBeNull();
      expect(restored!.plan).toEqual(VALID_MEAL_PLAN);
      expect(restored!.inputs).toEqual({ calories: 2000, system: "balanced" });
      expect(typeof restored!.generatedAt).toBe("string");
    });

    it("DISCARDS a corrupt/poisoned payload (never trust storage)", () => {
      saveGuestPlan("nutrition", VALID_MEAL_PLAN as never);
      window.localStorage.setItem(
        "alkemos:plan:v1:nutrition",
        JSON.stringify({ version: 1, kind: "nutrition", plan: { meals: "nope" } }),
      );
      expect(loadGuestPlan("nutrition")).toBeNull();
    });

    it("rejects cross-kind envelopes (a workout plan is not a meal plan)", () => {
      saveGuestPlan("nutrition", VALID_WORKOUT_PLAN as never);
      expect(loadGuestPlan("nutrition")).toBeNull();
    });

    it("clearGuestPlan removes only its own kind", () => {
      saveGuestPlan("nutrition", VALID_MEAL_PLAN as never);
      saveGuestPlan("workout", VALID_WORKOUT_PLAN as never);
      clearGuestPlan("nutrition");
      expect(loadGuestPlan("nutrition")).toBeNull();
      expect(loadGuestPlan("workout")).not.toBeNull();
    });
  });

  describe("workout plans", () => {
    it("round-trips a valid split", () => {
      saveGuestPlan("workout", VALID_WORKOUT_PLAN as never, {
        goal: "muscle",
        days: 1,
      });
      const restored = loadGuestPlan("workout");
      expect(restored).not.toBeNull();
      expect(restored!.plan).toEqual(VALID_WORKOUT_PLAN);
    });

    it("keeps exercises with numeric reps (e.g. 12) valid", () => {
      const plan = {
        days: [
          {
            name: "Day 1",
            exercises: [{ name: "Squat", sets: 5, reps: 5 }],
          },
        ],
      };
      saveGuestPlan("workout", plan as never);
      expect(loadGuestPlan("workout")).not.toBeNull();
    });
  });
});
