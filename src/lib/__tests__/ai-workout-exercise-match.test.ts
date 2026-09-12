import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  enrichWorkoutPlanWithLibrary,
  matchWorkoutExercise,
} from "@/lib/ai-workout-exercise-match";

/**
 * §12.35 canaries — the AI workout-planner results use the site's OWN
 * exercise library with its images (owner directive «أداة خطط التمرين
 * بالذكاء الاصطناعي استخدم مكتبة التمارين بالصور الخاصة بنا فى النتائج»).
 *
 * LAWS GUARDED:
 *   1. HONEST MATCHING: a library match is returned only on token evidence
 *      (coverage ≥ 0.6, ≥2 matched tokens, or a tight single-token hit);
 *      unmatched movements render as plain rows — never a fabricated
 *      image, slug, or link.
 *   2. EQUIPMENT HONESTY: matches respect the visitor's equipment world,
 *      and an explicitly named equipment family (barbell/dumbbell/cable…)
 *      pins the match to that family.
 *   3. REAL LIBRARY: matches resolve to real slugs in the 868-exercise
 *      library, with a real first image URL from the image host.
 *   4. SERVER-ONLY (BUNDLE LAW): the matcher imports the 1.6MB exercises
 *      array — the client page must NOT import it; the route enriches
 *      server-side and the page renders the enriched JSON only.
 */

const ROUTE_FILE = "src/app/api/ai/workout-plan-demo/route.ts";
const PAGE_FILE = "src/app/ai-workout-planner/page.tsx";
const MATCHER_FILE = "src/lib/ai-workout-exercise-match.ts";

const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

describe("ai-workout-exercise-match (§12.35)", () => {
  it("EN: canonical movements match the real library with images", () => {
    const bench = matchWorkoutExercise("Barbell bench press", "full-gym");
    expect(bench).not.toBeNull();
    expect(bench?.name).toContain("Bench Press");
    expect(bench?.image).toContain("raw.githubusercontent.com");
    expect(bench?.slug).toMatch(/bench-press/);

    const rdl = matchWorkoutExercise("Romanian deadlift", "full-gym");
    expect(rdl?.name).toContain("Romanian Deadlift");

    const plank = matchWorkoutExercise("Plank", "bodyweight");
    expect(plank?.name).toBe("Plank");

    const curl = matchWorkoutExercise("Dumbbell bicep curl", "home-dumbbells");
    expect(curl?.name).toContain("Bicep Curl");

    const lat = matchWorkoutExercise("Lat pulldown", "full-gym");
    expect(lat?.name.toLowerCase()).toContain("lat");

    // Loose morphology: plurals and variant spellings still land.
    expect(matchWorkoutExercise("Triceps pushdowns", "full-gym")?.name).toContain(
      "Triceps Pushdown",
    );
    expect(matchWorkoutExercise("Pull ups", "full-gym")).not.toBeNull();
  });

  it("AR: the Arabic names the model writes match the English library", () => {
    // The model writes «بنش برس بالبار» — the match must land on the real
    // barbell bench-press family with its image.
    const bench = matchWorkoutExercise("بنش برس بالبار", "full-gym");
    expect(bench).not.toBeNull();
    expect(bench?.name).toContain("Bench Press");
    expect(bench?.image).toContain("raw.githubusercontent.com");

    expect(matchWorkoutExercise("رفعة ميتة رومانية", "full-gym")?.name).toContain(
      "Romanian Deadlift",
    );
    expect(matchWorkoutExercise("سكوات", "bodyweight")?.name).toContain("Squat");
    expect(matchWorkoutExercise("بلانك", "bodyweight")?.name).toBe("Plank");
    expect(matchWorkoutExercise("ثني بايسبس بالدمبل", "home-dumbbells")?.name).toContain(
      "Bicep Curl",
    );
    // Definite articles and attached prepositions resolve (بالدمبل → دمبل).
    expect(matchWorkoutExercise("تجديف بالكابل جالس", "full-gym")?.name.toLowerCase()).toContain(
      "row",
    );
    expect(matchWorkoutExercise("ضغط كتف بالبار", "full-gym")?.name).toContain("Shoulder Press");
  });

  it("EQUIPMENT HONESTY: the equipment world filters and explicit pins hold", () => {
    // A bodyweight-only split never links a barbell page.
    expect(matchWorkoutExercise("Barbell bench press", "bodyweight")).toBeNull();
    // Home-dumbbells world + an explicitly-named barbell → no honest match.
    expect(matchWorkoutExercise("Barbell bench press", "home-dumbbells")).toBeNull();
    // The same movement reworded for dumbbells matches in that world.
    expect(matchWorkoutExercise("Dumbbell bench press", "home-dumbbells")?.name).toContain(
      "Dumbbell Bench Press",
    );
    // Bodyweight squat links the bodyweight entry, not the barbell one.
    expect(matchWorkoutExercise("سكوات", "bodyweight")?.slug).toBe("bodyweight-squat");
    // Full gym accepts the barbell family.
    expect(matchWorkoutExercise("Barbell squat", "full-gym")?.name).toContain("Squat");
  });

  it("NO FABRICATION: unmatched movements return null, never a guess", () => {
    expect(matchWorkoutExercise("Zorblat matrix press v2", "full-gym")).toBeNull();
    expect(matchWorkoutExercise("عدو سريع على الجهاز الوهمي", "full-gym")).toBeNull();
    expect(matchWorkoutExercise("", "full-gym")).toBeNull();
    expect(matchWorkoutExercise("...", "full-gym")).toBeNull();
  });

  it("DETERMINISM + COVERAGE: same input → same entry; common families covered", () => {
    const first = matchWorkoutExercise("Barbell squat", "full-gym");
    for (let i = 0; i < 5; i++) {
      expect(matchWorkoutExercise("Barbell squat", "full-gym")).toEqual(first);
    }
    // A spread of the movement families the prompt steers to — the large
    // majority must land in the library (both languages).
    const enNames = [
      "Barbell Squat", "Bench Press", "Deadlift", "Plank", "Push-Up",
      "Pull-Up", "Lat Pulldown", "Triceps Pushdown", "Leg Press",
      "Calf Raise", "Romanian Deadlift", "Dumbbell Row", "Hip Thrust",
      "Lunge", "Shoulder Press", "Bicep Curl", "Leg Curl", "Leg Extension",
      "Face Pull", "Barbell Curl",
    ];
    const enHits = enNames.filter((n) => matchWorkoutExercise(n, "full-gym")).length;
    expect(enHits).toBeGreaterThanOrEqual(17); // ≥85% of the core families

    const arNames = [
      "سكوات", "بنش برس", "رفعة ميتة", "بلانك", "ضغط",
      "عقلة", "سحب لات", "بسط ترايسبس", "ضغط الرجلين",
      "رفعة السمانة", "تجديف بالدمبل", "اندفاع", "ضغط كتف",
    ];
    const arHits = arNames.filter((n) => matchWorkoutExercise(n, "full-gym")).length;
    expect(arHits).toBeGreaterThanOrEqual(9);
  });

  it("ENRICH: every exercise carries an explicit library field (match or null)", () => {
    const plan = {
      days: [
        {
          name: "اليوم الأول",
          focus: "صدر وترايسبس",
          exercises: [
            { name: "بنش برس بالبار", sets: 4, reps: "8-12" },
            { name: "عدو سريع وهمي", sets: 2, reps: 10 },
            { name: "بلانك", sets: 3, reps: 30 },
          ],
        },
      ],
    };
    const enriched = enrichWorkoutPlanWithLibrary(plan, "full-gym");
    expect(enriched.days).toHaveLength(1);
    expect(enriched.days[0].focus).toBe("صدر وترايسبس");
    const [bench, ghost, plank] = enriched.days[0].exercises;
    expect(bench.library?.name).toContain("Bench Press");
    expect(ghost.library).toBeNull(); // unmatched → plain row, never a guess
    expect(plank.library?.name).toBe("Plank");
    // Sets/reps pass through untouched (the honesty anchor stays intact).
    expect(bench.sets).toBe(4);
    expect(bench.reps).toBe("8-12");
    // Every image is a real library image URL.
    for (const ex of enriched.days[0].exercises) {
      if (ex.library) expect(ex.library.image).toMatch(/^https:\/\/raw\.githubusercontent\.com\//);
    }
    // A focus-less day stays focus-less (no invented field).
    const bare = enrichWorkoutPlanWithLibrary(
      { days: [{ name: "D1", exercises: [{ name: "Plank", sets: 2, reps: 20 }] }] },
      "bodyweight",
    );
    expect(bare.days[0].focus).toBeUndefined();
    expect("focus" in bare.days[0]).toBe(false);
  });

  it("SERVER-ONLY + WIRED: the route enriches server-side; the page renders, never imports", () => {
    const route = stripComments(readFileSync(ROUTE_FILE, "utf8"));
    expect(route).toContain("enrichWorkoutPlanWithLibrary");
    // Enrichment happens on the VALIDATED plan, after the shape gate.
    expect(route.indexOf("enrichWorkoutPlanWithLibrary(")).toBeGreaterThan(
      route.indexOf("parseWorkoutPlanText("),
    );

    const page = stripComments(readFileSync(PAGE_FILE, "utf8"));
    // The page renders the library images and links into the exercise pages.
    expect(page).toContain("ImageWithFallback");
    expect(page).toContain("`${isAr ? \"/ar\" : \"\"}/exercises/${lib.slug}`");
    expect(page).toContain("getFallbackSVG");
    expect(page).toContain("868");
    // BUNDLE LAW: the client page must not import the matcher (and through
    // it the 1.6MB exercises array).
    expect(page).not.toContain("ai-workout-exercise-match");
    expect(page).not.toContain("@/lib/exercises\"");

    // The matcher itself imports the library server-side only.
    const matcher = stripComments(readFileSync(MATCHER_FILE, "utf8"));
    expect(matcher).toContain('from "./exercises"');
    expect(matcher).not.toContain('"use client"');
  });
});
