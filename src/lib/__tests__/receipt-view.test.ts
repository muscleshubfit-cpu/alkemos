import { describe, it, expect } from "vitest";
import { receiptObjectKey, receiptViewUrl } from "@/lib/receipt-view";
import { sumSubscriptionRequestsByStatus } from "@/lib/subscription-sums";
import { adminFeedOrFilter } from "@/lib/notifications-server";

describe("receiptObjectKey (Phase 246 — dead receipt button)", () => {
  it("maps post-217 bucket-prefixed rows to the in-bucket key", () => {
    // DB: receipts/<uid>/<ts>-<name> — object key inside the bucket: <uid>/<ts>-<name>
    expect(receiptObjectKey("receipts/9f1c.../1758000000-receipt.png")).toBe(
      "9f1c.../1758000000-receipt.png",
    );
  });

  it("keeps legacy self-consistent rows under the receipts/ prefix", () => {
    // pre-217 browser upload stored at receipts/<ts>.<ext> INSIDE the bucket
    expect(receiptObjectKey("receipts/1757000000.png")).toBe("receipts/1757000000.png");
  });

  it("accepts a bare uid path unchanged (forward safety)", () => {
    expect(receiptObjectKey("9f1c.../1758000000-receipt.png")).toBe(
      "9f1c.../1758000000-receipt.png",
    );
  });

  it("treats a bare filename as legacy", () => {
    expect(receiptObjectKey("1757000000.png")).toBe("receipts/1757000000.png");
  });

  it("strips only ONE receipts/ prefix", () => {
    expect(receiptObjectKey("receipts/a/b/c.pdf")).toBe("a/b/c.pdf");
  });
});

describe("receiptViewUrl", () => {
  it("builds the authorized /api/file proxy URL (never a storage sign)", () => {
    const url = receiptViewUrl("receipts/uid-1/1758000000-receipt.png");
    expect(url.startsWith("/api/file?bucket=receipts&path=")).toBe(true);
    expect(url).toContain("uid-1%2F1758000000-receipt.png");
  });

  it("URL-encodes the path (safe for window.open)", () => {
    const url = receiptViewUrl("receipts/uid 1/a b.png");
    expect(url).toContain("uid%201%2Fa%20b.png");
    expect(url).not.toContain(" ");
  });
});

describe("sumSubscriptionRequestsByStatus (Phase 246 dedup)", () => {
  const rows = [
    { status: "approved", price_usd: 14.99 },
    { status: "approved", price_usd: "60" },
    { status: "pending", price_usd: 25 },
    { status: "pending", price_usd: null },
    { status: "rejected", price_usd: 99 },
    { status: "approved", price_usd: Number.NaN },
  ];

  it("sums approved rows", () => {
    expect(sumSubscriptionRequestsByStatus(rows, "approved")).toBeCloseTo(74.99);
  });

  it("sums pending rows and treats null/NaN as 0", () => {
    expect(sumSubscriptionRequestsByStatus(rows, "pending")).toBe(25);
  });

  it("sums rejected rows", () => {
    expect(sumSubscriptionRequestsByStatus(rows, "rejected")).toBe(99);
  });

  it("returns 0 on empty input", () => {
    expect(sumSubscriptionRequestsByStatus([], "approved")).toBe(0);
  });
});

describe("adminFeedOrFilter (Phase 246 — admin sees only admin-relevant bells)", () => {
  it("broadcasts only when no admins exist", () => {
    expect(adminFeedOrFilter([])).toBe("target_coach_id.is.null");
  });

  it("adds the admin-ids in-filter", () => {
    expect(adminFeedOrFilter(["a1", "a2"])).toBe(
      "target_coach_id.is.null,target_coach_id.in.(a1,a2)",
    );
  });

  it("single admin stays comma-safe", () => {
    expect(adminFeedOrFilter(["only-admin"])).toBe(
      "target_coach_id.is.null,target_coach_id.in.(only-admin)",
    );
  });
});
