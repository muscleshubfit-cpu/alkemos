/**
 * weight-summary — Phase 247 dedup. The first→latest weight delta was
 * derived independently in DashboardView, ProgressView and (the latest-only
 * variant) CoachClientView — with two DISAGREEING color laws for the same
 * number (dashboard: green ↓ / orange ↑; progress: blue ↓ / gray ↑).
 * This module is the single pure definition + the one presentation contract
 * both surfaces now render (down = #34c759, up = #ff9500).
 *
 * Deliberately dependency-free and unit-testable. Entries arrive in
 * chronological order (oldest first — listProgress's contract).
 */

export type WeightSummary = {
  /** The most recent logged weight (kg), null when the last row has none. */
  latest: number | null;
  /** latest − first across the whole history; null when either end is missing. */
  delta: number | null;
  /** down = latest < first (the usual fat-loss goal), up = gain, null = flat/unknown. */
  direction: "down" | "up" | null;
};

const toNum = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export function weightSummary(
  entries: readonly { weight: number | string | null }[],
): WeightSummary | null {
  if (entries.length === 0) return null;
  const latest = toNum(entries[entries.length - 1]?.weight);
  const first = toNum(entries[0]?.weight);
  const delta =
    latest !== null && first !== null && latest !== 0 && first !== 0 ? latest - first : null;
  return {
    latest,
    delta,
    direction: delta === null || delta === 0 ? null : delta < 0 ? "down" : "up",
  };
}
