/**
 * subscription-view — Phase 247 dedup (owner: «مريح ومنظم بلا تكرار» applied
 * to EVERY role's dashboard). The member-side surfaces (DashboardView,
 * CoachClientView ×2, getSubscriptionForClient, profile page) each re-wrote
 * the same three derivations:
 *   1. pick the PRIMARY subscription (best membership pro > premium, else
 *      the coaching row),
 *   2. days left on an end_date (clamped at 0),
 *   3. the honest effective status (an "active" row past its end_date is
 *      EXPIRED, not «0 days left»).
 * This module is the single pure definition they all share — the member-side
 * twin of Phase 246's subscription-sums law (one source per number).
 *
 * Deliberately dependency-free (no data-layer import) so the law is
 * unit-testable. Read-path presentation only — never touches payment logic.
 */

type SubLike = {
  tier: string;
  status: string;
  end_date: string | null;
};

/** Best membership row (pro > premium; ties keep caller order — stable sort)
 *  else the first coaching row, else null. Mirrors getSubscriptionForClient's
 *  historical pick exactly. */
export function pickPrimarySubscription<T extends { tier: string }>(
  rows: readonly T[],
): T | null {
  const membershipSubs = rows.filter((s) => s.tier === "premium" || s.tier === "pro");
  if (membershipSubs.length > 0) {
    const priority = (tier: string) => (tier === "pro" ? 3 : tier === "premium" ? 2 : 0);
    const sorted = [...membershipSubs].sort((a, b) => priority(b.tier) - priority(a.tier));
    return sorted[0];
  }
  return rows.find((s) => s.tier === "coaching") ?? null;
}

/** Whole days until end_date, clamped at 0; null when there is no end_date. */
export function daysLeftOn(endDate: string | null | undefined): number | null {
  if (!endDate) return null;
  return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 864e5));
}

/** Honest status for display: an "active" row whose end_date has passed is
 *  EXPIRED — «0 days left» lied to the member (Phase 247 finding A6). */
export function effectiveSubStatus(
  row: Pick<SubLike, "status" | "end_date">,
): "active" | "expired" {
  const active = row.status === "active" && new Date(row.end_date ?? 0).getTime() > Date.now();
  return active ? "active" : "expired";
}
