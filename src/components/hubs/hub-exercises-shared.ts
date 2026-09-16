/**
 * PHASE 216 (P2-3 — deep-audit confirmed-9): shared, server-safe display
 * contract for the equipment/muscles hub grids. This module deliberately
 * carries NO "use client" directive — server components importing a plain
 * value from a client module receive the client-reference proxy (the
 * classic RSC gotcha), so the limit constant MUST live here where both
 * the server pages and the ShowMoreExercises island can read the real
 * number.
 */

/** Compact, pre-localized exercise card — resolved server-side. */
export type HubExerciseCard = {
  /** Localized link (e.g. /exercises/bench-press or /ar/exercises/...) */
  href: string;
  /** Localized exercise name. */
  name: string;
  /** Category (equipment hubs) or equipment (muscle hubs) label. */
  chip: string;
  /** Localized difficulty label. */
  levelLabel: string;
  /** Difficulty color (hex) — resolved from LEVEL_LABELS server-side. */
  levelColor: string;
  /** Primary muscles, pre-joined with the locale's separator. */
  muscles: string;
};

/**
 * How many cards the hub pages server-render before the
 * ShowMoreExercises island takes over. 60 keeps the first paint rich
 * (well above the 50-item ItemList schema slice) while cutting the
 * heaviest hub (348 cards) by ~83%.
 */
export const HUB_INITIAL_EXERCISES = 60;
