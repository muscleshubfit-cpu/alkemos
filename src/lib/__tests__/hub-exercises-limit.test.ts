import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * PHASE 216 (P2-3 — deep-audit confirmed-9): the equipment/muscles hub
 * pages rendered EVERY exercise card server-side — /equipment/bodyweight
 * alone served 550KB of HTML (348 cards, 2,749 DOM nodes) plus a ~330KB
 * RSC payload, the heaviest pages on the site. The fix law: server-render
 * the first HUB_INITIAL_EXERCISES (60) cards, hand the REST to the
 * ShowMoreExercises client island as a compact pre-localized projection
 * (one click reveals them — every exercise stays reachable), and keep the
 * ItemList schema at its top-50 slice. This guard pins all three legs of
 * the contract on the four hub surfaces (EN + AR × equipment + muscles).
 */

const HUB_PAGES = [
  "src/app/equipment/[type]/page.tsx",
  "src/app/ar/equipment/[type]/page.tsx",
  "src/app/muscles/[group]/page.tsx",
  "src/app/ar/muscles/[group]/page.tsx",
];

function repoRootPath(rel: string): string {
  return resolve(__dirname, "../../..", rel);
}

describe("hub exercise display limit (Phase 216 — P2-3)", () => {
  it("the limit constant lives in the server-safe shared module (RSC law)", () => {
    const src = readFileSync(
      repoRootPath("src/components/hubs/hub-exercises-shared.ts"),
      "utf8",
    );
    expect(src).toContain("export const HUB_INITIAL_EXERCISES = 60");
    // the classic RSC gotcha: a plain value imported from a "use client"
    // module into a server component arrives as the client-reference
    // proxy — the constant must NOT live in the client island (the
    // directive check targets the file's first statement, not its docs).
    expect(src.trimStart().startsWith('"use client"')).toBe(false);
  });

  it("the island lives with the reveal-all contract", () => {
    const src = readFileSync(
      repoRootPath("src/components/hubs/ShowMoreExercises.tsx"),
      "utf8",
    );
    expect(src).toContain("export function ShowMoreExercises");
    expect(src).toContain("useState(false)");
  });

  it.each(HUB_PAGES)("%s renders a capped grid + the reveal island", (rel) => {
    const src = readFileSync(repoRootPath(rel), "utf8");
    // server-rendered slice uses the shared constant (imported from the
    // server-safe module — NOT from the "use client" island)
    expect(src).toContain("from \"@/components/hubs/hub-exercises-shared\"");
    expect(src).toContain(".slice(0, HUB_INITIAL_EXERCISES)");
    // the island is mounted inside the grid with the pre-localized cards
    expect(src).toContain("<ShowMoreExercises cards={moreExercises} lang=");
    // the projection is compact (no full exercise objects cross the wire)
    expect(src).not.toContain("moreExercises = exercises");
    // the full count still heads the section (no false totals)
    expect(src).toMatch(/\{exercises\.length\} (exercises|تمرين)/);
  });

  it.each(HUB_PAGES)("%s keeps the ItemList schema at its top-50 slice", (rel) => {
    const src = readFileSync(repoRootPath(rel), "utf8");
    expect(src).toContain("exercises.slice(0, 50)");
  });
});
