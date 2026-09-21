/**
 * receipt-view — Phase 246 (owner bug: «زر الايصال لا يعمل» in the admin
 * payment-approval queue).
 *
 * Why the old button was dead — two stacked failures, both proven in code:
 *
 * 1. PATH DOUBLE-PREFIX. Since the Phase-217 upload law (P3-11), receipts
 *    ride POST /api/upload, which stores the object SERVER-SIDE at key
 *    `<uid>/<ts>-<name>` inside the `receipts` bucket but returns the
 *    bucket-prefixed path `receipts/<uid>/<ts>-<name>` for DB storage (the
 *    shape the legacy flow produced, kept for the topup ownership check).
 *    The old reader fed that DB value straight into browser-side
 *    createSignedUrl → it asked for `receipts/receipts/...` → not found.
 *    (Pre-217 rows `receipts/<ts>.<ext>` are self-consistent: the old
 *    browser upload really stored under the receipts/ prefix.)
 *
 * 2. NO STORAGE SELECT POLICY. The 0071 storage-RLS hardening dropped the
 *    blanket read policy that used to cover `receipts` and no replacement
 *    was added — so browser-side signing fails for staff even with a
 *    correct path.
 *
 * THE FIX: stop signing from the browser entirely. Receipt reads ride the
 * already-authorized same-origin proxy GET /api/file — the exact URL
 * /api/upload returns and the flow used to throw away. /api/file
 * authorizes the caller server-side (staff `role != "client"` or the
 * object owner) and streams the bytes with the service role, so the
 * missing storage policy is irrelevant. This module is the single pure
 * mapper between the stored DB path and the proxy URL.
 */

/**
 * Map a stored `receipt_path` (DB value) to the object's real key INSIDE
 * the `receipts` bucket.
 *
 * - Post-217 rows `receipts/<uid>/<file>`  → key `<uid>/<file>`
 *   (strip one leading `receipts/`; the rest contains a `/`).
 * - Legacy rows `receipts/<file>`          → key `receipts/<file>`
 *   (after stripping, no `/` remains → the old browser upload really
 *   stored the object under the receipts/ prefix).
 * - A bare `<uid>/<file>` (no prefix) is accepted unchanged for
 *   forward-safety; a bare `<file>` is treated as legacy.
 */
export function receiptObjectKey(receiptPath: string): string {
  const rest = receiptPath.replace(/^receipts\//, "");
  return rest.includes("/") ? rest : `receipts/${rest}`;
}

/**
 * The same-origin proxy URL for viewing a stored receipt — usable directly
 * in window.open() / <img src>. Synchronous by design: popup blockers
 * kill window.open calls that wait on an await.
 */
export function receiptViewUrl(receiptPath: string): string {
  return `/api/file?bucket=receipts&path=${encodeURIComponent(receiptObjectKey(receiptPath))}`;
}
