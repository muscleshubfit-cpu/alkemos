/**
 * subscription-sums — Phase 246 dedup (owner: «داش بورد الادمن محتاج اعاده
 * تنظيم وتحسين وعدم تكرار»). The approved/pending revenue sums were computed
 * by the SAME reduce in two places (admin dashboard tile + /admin/finances
 * tiles). This module is the single pure definition both surfaces share.
 *
 * Deliberately dependency-free (no data-layer import) so the money law is
 * unit-testable — the data module re-exports it for domain discoverability.
 */

type SumRow = {
  status: string;
  price_usd: number | string | null;
};

export type SubscriptionSumStatus = "approved" | "pending" | "rejected";

/** Σ price_usd over the rows whose status matches — null/NaN prices count as 0. */
export function sumSubscriptionRequestsByStatus(
  rows: readonly SumRow[],
  status: SubscriptionSumStatus,
): number {
  return rows
    .filter((r) => r.status === status)
    .reduce((s, r) => s + (Number(r.price_usd) || 0), 0);
}
