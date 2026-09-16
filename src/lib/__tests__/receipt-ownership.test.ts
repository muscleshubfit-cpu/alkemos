/**
 * RECEIPT OWNERSHIP GUARD (P3-11 🔐 — deep-audit confirmed 18/19,
 * Phase 217, owner §7 approval «أوافق على التنفيذ كاملاً»).
 *
 * The wallet top-up receipt flow rides the UPLOAD LAW end to end:
 *   1. `uploadReceipt` (src/lib/data/subscriptions.ts) uploads through
 *      POST /api/upload — the browser-side Storage write is BANNED (it
 *      violated the upload law AND has been impossible since the 0071
 *      storage hardening dropped the blanket authenticated-INSERT
 *      policy on the receipts bucket).
 *   2. /api/upload rebuilds the storage path SERVER-SIDE as
 *      receipts/<caller-uid>/<ts>-<name>.
 *   3. /api/coach/wallet/topup verifies the uid segment against the
 *      authenticated coach before inserting the request row — a coach
 *      can never reference another user's receipt or a fabricated path.
 *
 * Source-canary style (same as every guard in this repo): the law texts
 * live in comments, so comments are stripped before scanning — only
 * executable code can fail this test.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

const stripComments = (s: string) =>
  s
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

describe("receipt ownership (P3-11, Phase 217)", () => {
  it("uploadReceipt rides POST /api/upload — the browser-side Storage write stays dead", () => {
    const src = stripComments(
      readFileSync("src/lib/data/subscriptions.ts", "utf8"),
    );
    const fn = src.slice(
      src.indexOf("export async function uploadReceipt"),
      src.indexOf("//", src.indexOf("export async function uploadReceipt")) > -1
        ? src.length
        : src.length,
    );
    expect(fn).toContain('fetch("/api/upload"');
    expect(fn).toContain('formData.append("bucket", "receipts")');
    expect(fn).toContain("return `receipts/${json.path}`");
    // The retired browser-side write must never come back.
    expect(fn).not.toContain('.storage.from("receipts").upload');
  });

  it("the top-up route verifies the receipt path's uid segment against the caller", () => {
    const src = stripComments(
      readFileSync("src/app/api/coach/wallet/topup/route.ts", "utf8"),
    );
    expect(src).toContain('receiptPath.split("/")[1]');
    expect(src).toContain("receiptOwner !== auth.id");
    // The old prefix-only check (confirmed 19) must stay dead.
    expect(src).not.toContain(
      'receiptPath.startsWith("receipts/") || receiptPath.length > 500) {',
    );
  });
});
