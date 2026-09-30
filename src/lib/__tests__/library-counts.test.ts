import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { FOODS } from "@/lib/foods";
import { EXERCISES } from "@/lib/exercises";
import { FOODS_COUNT } from "@/lib/foods-shared";
import {
  EXERCISES_COUNT,
  EXERCISE_CATEGORY_COUNTS,
} from "@/lib/exercises-shared";

/**
 * BUNDLE LAW GUARD (audit 2026-09-05): the client-safe shared modules
 * carry count CONSTANTS (src/lib/foods-shared.ts, exercises-shared.ts)
 * so client components never import the giant arrays just to show a
 * number. These tests pin the constants to the real data — if the data
 * files grow, the tests fail until the constants are updated.
 */
describe("library count constants match the real arrays", () => {
  it("FOODS_COUNT equals FOODS.length", () => {
    expect(FOODS_COUNT).toBe(FOODS.length);
  });

  it("EXERCISES_COUNT equals EXERCISES.length", () => {
    expect(EXERCISES_COUNT).toBe(EXERCISES.length);
  });

  it("EXERCISE_CATEGORY_COUNTS match per-category totals", () => {
    for (const cat of Object.keys(EXERCISE_CATEGORY_COUNTS) as Array<
      keyof typeof EXERCISE_CATEGORY_COUNTS
    >) {
      const real = EXERCISES.filter((e) => e.category === cat).length;
      expect(EXERCISE_CATEGORY_COUNTS[cat]).toBe(real);
    }
    // The per-category counts must exhaust the whole array.
    const sum = Object.values(EXERCISE_CATEGORY_COUNTS).reduce(
      (a, b) => a + b,
      0,
    );
    expect(sum).toBe(EXERCISES.length);
  });
});

// PHASE 195 (owner directive «Tools: الرقم الحقيقي الحالي، وهو 8، وليس 5» +
// «اجعل الأعداد Dynamic من مصدر البيانات قدر الإمكان»): the free-tools hub
// gets the same count-guard treatment as the exercise/food libraries.
// TOOLS_COUNT derives from the hub array (tools-shared.ts), so the homepage
// "8+ Tools" proof chip grows automatically when a tool is added — this
// census pin just makes that growth a CONSCIOUS update.
describe("tools count guard (Phase 195)", () => {
  it("TOOLS_COUNT equals the hub tools array length", async () => {
    const { TOOLS, TOOLS_COUNT } = await import("@/lib/tools-shared");
    expect(TOOLS_COUNT).toBe(TOOLS.length);
  });

  it("tools census: the hub serves 8 tools (4 calculators + water tracker + meal planner + 2 AI planners)", async () => {
    const { TOOLS_COUNT } = await import("@/lib/tools-shared");
    expect(TOOLS_COUNT).toBe(8);
  });
});

// m4 FIX (DEEP-UX-AUDIT-2026-09-18, owner decision 2026-09-18 «عدد الأدوات
// الصحيح + مخططات الذكاء الاصطناعي ومخطط الوجبات»): the profile's Tools
// stat must DERIVE from tools-shared (the single source that also feeds the
// homepage «8+» chip) — it was a hardcoded "6" while the hub serves 8
// (Phase 195). Same source-canary style as the Phase 217 block below.
describe("m4: the profile Tools stat derives from the single source", () => {
  const PROFILE = "src/app/(app)/profile/page.tsx";

  it("the profile imports TOOLS_COUNT from tools-shared", () => {
    const src = readFileSync(PROFILE, "utf8");
    expect(src, "profile: tools-shared import missing").toContain(
      "tools-shared",
    );
    expect(src, "profile: TOOLS_COUNT import missing").toContain(
      "TOOLS_COUNT",
    );
  });

  it("no hardcoded tools stat survives outside comments", () => {
    const stripComments = (s: string) =>
      s
        .replace(/\/\*[\s\S]*?\*\//g, " ")
        .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
    const src = stripComments(readFileSync(PROFILE, "utf8"));
    expect(src, "profile: hardcoded Tools stat returned").not.toMatch(
      /"Tools"[^}]*value:\s*"6"/,
    );
    expect(src, "profile: hardcoded Arabic Tools stat returned").not.toMatch(
      /"أدوات"[^}]*value:\s*"6"/,
    );
  });
});

// PHASE 217 (deep-audit P3-10 م4+م5, owner approval «أوافق على التنفيذ
// كاملاً»): user-visible library counts must DERIVE from the shared count
// constants — a hardcoded "868+"/"8,830+" copy ages silently when the
// libraries grow (Phase 195 owner directive: derive counts from the data
// source). Same source-canary style as marketing-msa-surface.test.ts.
describe("Phase 217 م4+م5: marketing surfaces derive library counts", () => {
  // SITE-CONTENT-281 re-pin: StaticPageView no longer interpolates the
  // counts itself — its copy carries {exercises}/{foods} TOKENS resolved
  // by the site-content token engine, which imports the SAME shared
  // count constants. The derivation law holds end-to-end; the pins
  // follow the new pipeline (view → static-pages defaults → core engine).
  const SURFACES = [
    "src/components/views/LandingView.tsx",
    "src/components/blog/BlogComponents.tsx",
  ];

  it("every surface imports the shared count constants", () => {
    for (const rel of SURFACES) {
      const src = readFileSync(rel, "utf8");
      expect(src, `${rel}: exercises-shared import missing`).toContain(
        "exercises-shared",
      );
      expect(src, `${rel}: foods-shared import missing`).toContain(
        "foods-shared",
      );
    }
    // The static pages ride the token pipeline (the 281 re-pin above).
    const staticView = readFileSync(
      "src/components/views/StaticPageView.tsx",
      "utf8",
    );
    expect(staticView).toContain("site-content/static-pages");
    const staticDefaults = readFileSync(
      "src/lib/site-content/static-pages.ts",
      "utf8",
    );
    expect(staticDefaults).toContain("{exercises}");
    expect(staticDefaults).toContain("{foods}");
    // The token engine derives from the shared count constants.
    const core = readFileSync("src/lib/site-content/core.ts", "utf8");
    expect(core).toContain("exercises-shared");
    expect(core).toContain("foods-shared");
  });

  it("no hardcoded library counts survive outside comments (م4) and AR lines keep ONE numeral system (م5)", () => {
    // The Phase-202 owner-order QUOTES inside LandingView comments mention
    // "868+"/"8,830+" historically — comments are law TEXTS, strip them
    // first (same rule as every source-scan guard in this repo).
    const stripComments = (s: string) =>
      s
        .replace(/\/\*[\s\S]*?\*\//g, " ")
        .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
    // SEO-P1-6 (frame 315): the homepage islands joined the hardcoded-count
    // scan — the count derivations (EX_PLUS et al) moved with their
    // components, so the drift guard follows the text. The import pins
    // above stay on the server view (the imports stayed there).
    const SCAN = [
      ...SURFACES,
      "src/components/views/LandingViewIslands.tsx",
      "src/components/views/LandingViewDynamicIslands.tsx",
      "src/components/views/StaticPageView.tsx",
      "src/lib/site-content/static-pages.ts",
      "src/lib/site-content/home.ts",
    ];
    for (const rel of SCAN) {
      const src = stripComments(readFileSync(rel, "utf8"));
      expect(src, `${rel}: hardcoded exercise count returned`).not.toContain(
        "868+",
      );
      expect(src, `${rel}: hardcoded food count returned`).not.toContain(
        "8,830",
      );
      expect(
        src,
        `${rel}: Arabic-Indic food digits (mixed numeral systems) returned`,
      ).not.toContain("٨٬٨٣٠");
    }
  });
});
