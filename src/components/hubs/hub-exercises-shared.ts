/**
 * PHASE 216 (P2-3 — deep-audit confirmed-9): shared, server-safe display
 * contract for the equipment/muscles hub grids. This module deliberately
 * carries NO "use client" directive — server components importing a plain
 * value from a client module receive the client-reference proxy (the
 * classic RSC gotcha), so the limit constant MUST live here where both
 * the server pages and the ShowMoreExercises island can read the real
 * number.
 */

import { MUSCLE_LABELS } from "@/lib/exercises-shared";

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

/**
 * CONTENT-AUDIT P0-3 (2026-09-28, audit §1.6): the AR muscle/equipment
 * hub cards rendered raw English muscle values («العضلات الأساسية:
 * Chest») because `primaryMuscles` carries the source dataset's English
 * keys. Server-side resolution through MUSCLE_LABELS (the single Arabic
 * muscle glossary, Phase SEO-GEO-7) keeps the client island free of any
 * label map — same pre-localization law as every other card field. An
 * unmapped muscle falls back to the raw value (today's behavior, no
 * regression) so a future dataset row can never blank the card.
 */
export function localizedMuscleList(muscles: string[], lang: "en" | "ar"): string {
  const sep = lang === "ar" ? "، " : ", ";
  if (lang !== "ar") return muscles.join(sep);
  return muscles.map((m) => MUSCLE_LABELS[m]?.ar ?? m).join(sep);
}
