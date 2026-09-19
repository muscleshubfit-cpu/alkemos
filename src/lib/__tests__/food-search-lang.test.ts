import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { NextRequest } from "next/server";

/**
 * FOOD-ARABIZATION Phase 0 (2026-09-19) — /api/food-search ?lang law.
 *
 * The route historically returned `nameEn` EXCLUSIVELY for local results,
 * so the Arabic meal-planner and coach surfaces showed English names even
 * for translated foods. The plan's product-layer fix (§5): an explicit,
 * deterministic `?lang=ar|en` switch —
 *   · ?lang=ar   → local `name` = nameAr (real MSA for curated + band)
 *   · default    → nameEn (historical contract, unchanged)
 *   · unknown    → nameEn (fail-safe to the old behavior)
 * Matching is NOT changed (it always searched both fields).
 *
 * Open Food Facts network calls are stubbed out (their names are external
 * product strings, explicitly out of scope for the language law).
 */

/** Minimal NextRequest shape the route actually reads: request.url. */
function req(url: string): NextRequest {
  return { url } as unknown as NextRequest;
}

async function getResults(pathAndQuery: string) {
  const mod = await import("@/app/api/food-search/route");
  const res = await mod.GET(req("http://localhost" + pathAndQuery));
  const body = await res.json();
  return body.results as Array<{ name: string; source: string; slug?: string }>;
}

describe("food-search ?lang (FOOD-ARABIZATION Phase 0)", () => {
  beforeEach(() => {
    // Kill the outbound Open Food Facts half — silent-fail path in the
    // route, so local results still come through.
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline-test")));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("?lang=ar returns nameAr for a translated band food (Arabic query)", async () => {
    const results = await getResults(
      "/api/food-search?q=" + encodeURIComponent("زبدة") + "&lang=ar",
    );
    const local = results.filter((r) => r.source === "local");
    expect(local.length).toBeGreaterThan(0);
    // Array order puts curated rows first (peanut butter is «زبدة فول
    // سوداني» too) — assert on the band row itself.
    const hit = local.find((r) => r.slug === "butter-salted");
    expect(hit, "band row butter-salted must match the Arabic query").toBeDefined();
    expect(hit!.name).toBe("زبدة مملحة");
    // Every local name is Arabic under ?lang=ar (curated + band alike).
    expect(local.every((r) => /[\u0600-\u06FF]/.test(r.name))).toBe(true);
  });

  it("?lang=ar returns nameAr even when the query itself is English", async () => {
    const results = await getResults("/api/food-search?q=butter&lang=ar");
    const local = results.filter((r) => r.source === "local");
    const hit = local.find((r) => r.slug === "butter-salted");
    expect(hit).toBeDefined();
    expect(hit!.name).toBe("زبدة مملحة");
  });

  it("default (no lang): Arabic query still MATCHES the band but returns nameEn (historical contract)", async () => {
    const results = await getResults(
      "/api/food-search?q=" + encodeURIComponent("زبدة"),
    );
    const local = results.filter((r) => r.source === "local");
    const hit = local.find((r) => r.slug === "butter-salted");
    expect(hit, "Arabic matching must reach the translated band").toBeDefined();
    expect(hit!.name).toBe("Butter, salted");
  });

  it("unknown lang value fails safe to nameEn (deterministic default)", async () => {
    const results = await getResults("/api/food-search?q=butter&lang=fr");
    const local = results.filter((r) => r.source === "local");
    const hit = local.find((r) => r.slug === "butter-salted");
    expect(hit).toBeDefined();
    expect(hit!.name).toBe("Butter, salted");
  });

  it("curated foods keep their Arabic names under ?lang=ar (not just the band)", async () => {
    const results = await getResults(
      "/api/food-search?q=" + encodeURIComponent("صدور دجاج") + "&lang=ar",
    );
    const local = results.filter((r) => r.source === "local");
    expect(local[0].name).toBe("صدور دجاج");
    expect(local[0].slug).toBe("chicken-breast");
  });
});
