import { describe, it, expect } from "vitest";
import {
  emailSchema,
  exerciseNameSchema,
  langSchema,
  leadBodySchema,
  searchQuerySchema,
  toolSlugSchema,
  TOOL_SLUGS,
  MAX_EMAIL_LEN,
  MAX_NAME_LEN,
  MAX_QUERY_LEN,
  MAX_SUMMARY_LEN,
} from "@/lib/validation/schemas";
import {
  broadcastBodySchema,
  MAX_BROADCAST_RECIPIENTS,
  MAX_NOTIF_BODY_LEN,
  MAX_NOTIF_LINK_LEN,
  MAX_PLAN_JSON_BYTES,
  MAX_RESULT_JSON_BYTES,
  MAX_TITLE_LEN,
  SAVED_RESULT_TOOL_SLUGS,
  savedMealPlanBodySchema,
  savedResultBodySchema,
} from "@/lib/validation/schemas";

/**
 * Phase 141 / A-7 wave 1 canaries — the central Zod boundary schemas.
 * Correct + wrong + HOSTILE cases per schema. These pin the exact
 * contract the three wave-1 routes (tools/lead · food-search ·
 * exercise-image) enforce before touching data or outbound calls.
 */

const validLead = {
  tool_slug: "calorie-calculator",
  email: "  User@Example.COM ",
  name: "  Ahmed ",
  result_summary: "2200 kcal target",
  result_json: { kcal: 2200 },
  lang: "ar",
};

describe("leadBodySchema — /api/tools/lead", () => {
  it("accepts a fully valid body and normalizes email + name", () => {
    const r = leadBodySchema.safeParse(validLead);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("user@example.com");
      expect(r.data.name).toBe("Ahmed");
      expect(r.data.lang).toBe("ar");
    }
  });

  it("accepts the minimal body (slug + email only)", () => {
    const r = leadBodySchema.safeParse({
      tool_slug: "newsletter",
      email: "a@b.co",
    });
    expect(r.success).toBe(true);
  });

  it("rejects unknown tool_slug (the exact old 'Invalid tool_slug' path)", () => {
    expect(
      leadBodySchema.safeParse({ ...validLead, tool_slug: "evil-tool" }).success,
    ).toBe(false);
    expect(leadBodySchema.safeParse({}).success).toBe(false);
    expect(leadBodySchema.safeParse(null).success).toBe(false);
  });

  it("rejects non-string / too-short / too-long emails", () => {
    for (const email of [123, "", "a@", "x".repeat(MAX_EMAIL_LEN + 1)]) {
      expect(leadBodySchema.safeParse({ ...validLead, email }).success).toBe(
        false,
      );
    }
  });

  it("hostile: oversized name/summary/lang 400 instead of silent slicing", () => {
    expect(
      leadBodySchema.safeParse({ ...validLead, name: "x".repeat(MAX_NAME_LEN + 1) })
        .success,
    ).toBe(false);
    expect(
      leadBodySchema.safeParse({
        ...validLead,
        result_summary: "x".repeat(MAX_SUMMARY_LEN + 1),
      }).success,
    ).toBe(false);
    expect(
      leadBodySchema.safeParse({ ...validLead, lang: "fr" }).success,
    ).toBe(false);
  });

  it("hostile: smuggled keys are STRIPPED (no extra columns reach the insert)", () => {
    const r = leadBodySchema.safeParse({
      ...validLead,
      id: "overwrite-me",
      type: "admin",
      whatsapp: "+201000000000",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).not.toHaveProperty("id");
      expect(r.data).not.toHaveProperty("type");
      expect(r.data).not.toHaveProperty("whatsapp");
    }
  });

  it("result_json stays open (unknown) — the route caps it at 10KB", () => {
    const r = leadBodySchema.safeParse({
      ...validLead,
      result_json: { nested: { deep: [1, 2, 3] } },
    });
    expect(r.success).toBe(true);
  });
});

describe("toolSlugSchema", () => {
  it("accepts exactly the seven Phase 72 slugs", () => {
    for (const slug of TOOL_SLUGS) {
      expect(toolSlugSchema.safeParse(slug).success).toBe(true);
    }
    expect(TOOL_SLUGS).toHaveLength(7);
  });
  it("rejects anything else, including case/whitespace variants", () => {
    for (const slug of ["admin", "Calorie-Calculator", " bmi-calculator", ""]) {
      expect(toolSlugSchema.safeParse(slug).success).toBe(false);
    }
  });
});

describe("emailSchema (shape layer only)", () => {
  it("trims + lowercases", () => {
    expect(emailSchema.parse("  MiXeD@CASE.io  ")).toBe("mixed@case.io");
  });
  it("hostile: 254+ chars rejected", () => {
    expect(emailSchema.safeParse(`${"a".repeat(250)}@x.io`).success).toBe(false);
  });
});

describe("langSchema", () => {
  it("only ar/en pass", () => {
    expect(langSchema.safeParse("ar").success).toBe(true);
    expect(langSchema.safeParse("en").success).toBe(true);
    for (const l of ["fr", "AR", 1, null, "arabic"]) {
      expect(langSchema.safeParse(l).success).toBe(false);
    }
  });
});

describe("searchQuerySchema — /api/food-search", () => {
  it("normal queries pass", () => {
    expect(searchQuerySchema.parse("  chicken breast ")).toBe("chicken breast");
  });
  it("hostile: multi-KB strings rejected (never reach the OFF URL)", () => {
    expect(searchQuerySchema.safeParse("x".repeat(MAX_QUERY_LEN + 1)).success).toBe(
      false,
    );
  });
});

describe("exerciseNameSchema — /api/exercise-image", () => {
  it("normal names pass (EN + AR)", () => {
    expect(exerciseNameSchema.parse(" bench press ")).toBe("bench press");
    expect(exerciseNameSchema.parse("سكوات")).toBe("سكوات");
  });
  it("hostile: >80 chars rejected (never reach the wger URL)", () => {
    expect(
      exerciseNameSchema.safeParse("x".repeat(MAX_NAME_LEN + 1)).success,
    ).toBe(false);
  });
});

// ── P1-7 (deep-audit 2026-09-16): the bounded-insert wave — save-result
//    · save-meal-plan · notifications/broadcast. Boundary + hostile cases
//    per ceiling; the routes' legacy 400 messages are preserved separately
//    (schema failures carry the zod message only for the NEW ceilings). ──

describe("savedResultBodySchema — /api/tools/save-result (P1-7)", () => {
  const valid = {
    tool_slug: "calorie-calculator",
    title: "Cut phase — week 1",
    result_data: { kcal: 2200, protein: 180 },
  };

  it("accepts a fully valid body", () => {
    expect(savedResultBodySchema.safeParse(valid).success).toBe(true);
  });

  it("accepts every one of the five persisted-tool slugs", () => {
    for (const slug of SAVED_RESULT_TOOL_SLUGS) {
      expect(
        savedResultBodySchema.safeParse({ ...valid, tool_slug: slug }).success,
      ).toBe(true);
    }
  });

  it("rejects slugs outside the route allowlist (meal-planner/newsletter)", () => {
    // TOOL_SLUGS (lead route) has 7; save-result persists only the 5.
    expect(
      savedResultBodySchema.safeParse({ ...valid, tool_slug: "meal-planner" })
        .success,
    ).toBe(false);
    expect(
      savedResultBodySchema.safeParse({ ...valid, tool_slug: "newsletter" })
        .success,
    ).toBe(false);
  });

  it("title boundary: exactly 200 passes, 201 fails", () => {
    expect(
      savedResultBodySchema.safeParse({ ...valid, title: "x".repeat(MAX_TITLE_LEN) })
        .success,
    ).toBe(true);
    expect(
      savedResultBodySchema.safeParse({
        ...valid,
        title: "x".repeat(MAX_TITLE_LEN + 1),
      }).success,
    ).toBe(false);
  });

  it("result_data boundary: a 10KB-serialized payload passes; 10KB+1 fails", () => {
    // JSON.stringify wraps a string in quotes → 2 extra chars: a value of
    // (MAX_RESULT_JSON_BYTES − 2) chars serializes to exactly the cap.
    const atCap = "x".repeat(MAX_RESULT_JSON_BYTES - 2);
    const overCap = "x".repeat(MAX_RESULT_JSON_BYTES - 1);
    expect(
      savedResultBodySchema.safeParse({ ...valid, result_data: atCap }).success,
    ).toBe(true);
    expect(
      savedResultBodySchema.safeParse({ ...valid, result_data: overCap }).success,
    ).toBe(false);
  });

  it("missing result_data fails the byte-bound atom (route maps it to the legacy 400)", () => {
    const { result_data: _drop, ...withoutData } = valid;
    expect(savedResultBodySchema.safeParse(withoutData).success).toBe(false);
  });
});

describe("savedMealPlanBodySchema — /api/tools/save-meal-plan (P1-7)", () => {
  const valid = {
    title: "Ramadan plan",
    plan_data: {
      meals: [
        {
          name: "Breakfast",
          items: [
            {
              name: "Oats",
              source: "local",
              grams: 80,
              per100g: { calories: 389, protein: 17, carbs: 66, fat: 7 },
            },
          ],
        },
      ],
    },
  };

  it("accepts a fully valid body", () => {
    expect(savedMealPlanBodySchema.safeParse(valid).success).toBe(true);
  });

  it("accepts meals without an items array (legacy contract — stored, totals skip)", () => {
    expect(
      savedMealPlanBodySchema.safeParse({
        title: "Sketch",
        plan_data: { meals: [{ name: "Lunch" }] },
      }).success,
    ).toBe(true);
  });

  it("title boundary: exactly 200 passes, 201 fails", () => {
    expect(
      savedMealPlanBodySchema.safeParse({ ...valid, title: "y".repeat(MAX_TITLE_LEN) })
        .success,
    ).toBe(true);
    expect(
      savedMealPlanBodySchema.safeParse({
        ...valid,
        title: "y".repeat(MAX_TITLE_LEN + 1),
      }).success,
    ).toBe(false);
  });

  it("plan_data boundary: a 32KB-serialized payload passes; 32KB+1 fails", () => {
    const atCap = "z".repeat(MAX_PLAN_JSON_BYTES - 2);
    const overCap = "z".repeat(MAX_PLAN_JSON_BYTES - 1);
    expect(
      savedMealPlanBodySchema.safeParse({ ...valid, plan_data: atCap }).success,
    ).toBe(true);
    expect(
      savedMealPlanBodySchema.safeParse({ ...valid, plan_data: overCap }).success,
    ).toBe(false);
  });

  it("a legit coaching-tier plan (8 meals × 8 macro items) passes comfortably", () => {
    const item = {
      name: "Chicken breast",
      source: "local",
      grams: 150,
      per100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    };
    const meals = Array.from({ length: 8 }, (_, i) => ({
      name: `Meal ${i + 1}`,
      items: Array.from({ length: 8 }, () => item),
    }));
    expect(
      savedMealPlanBodySchema.safeParse({ plan_data: { meals } }).success,
    ).toBe(true);
  });
});

describe("broadcastBodySchema — /api/notifications/broadcast (P1-7)", () => {
  const uuid = "123e4567-e89b-12d3-a456-426614174000";
  const valid = {
    target: "selected",
    userIds: [uuid],
    title: "New program launched",
    body: "Check the new hypertrophy program on your plans page.",
    link: "/plans",
  };

  it("accepts all three targets", () => {
    expect(broadcastBodySchema.safeParse(valid).success).toBe(true);
    expect(
      broadcastBodySchema.safeParse({ ...valid, target: "all" }).success,
    ).toBe(true);
    expect(
      broadcastBodySchema.safeParse({ ...valid, target: "single", userId: uuid })
        .success,
    ).toBe(true);
  });

  it("rejects an unknown target (legacy 'Invalid target' path)", () => {
    expect(
      broadcastBodySchema.safeParse({ ...valid, target: "everyone" }).success,
    ).toBe(false);
  });

  it("field ceilings: title ≤200 · body ≤2000 · link ≤500", () => {
    expect(
      broadcastBodySchema.safeParse({ ...valid, title: "t".repeat(MAX_TITLE_LEN) })
        .success,
    ).toBe(true);
    expect(
      broadcastBodySchema.safeParse({
        ...valid,
        title: "t".repeat(MAX_TITLE_LEN + 1),
      }).success,
    ).toBe(false);
    expect(
      broadcastBodySchema.safeParse({ ...valid, body: "b".repeat(MAX_NOTIF_BODY_LEN) })
        .success,
    ).toBe(true);
    expect(
      broadcastBodySchema.safeParse({
        ...valid,
        body: "b".repeat(MAX_NOTIF_BODY_LEN + 1),
      }).success,
    ).toBe(false);
    expect(
      broadcastBodySchema.safeParse({ ...valid, link: "/".repeat(MAX_NOTIF_LINK_LEN) })
        .success,
    ).toBe(true);
    expect(
      broadcastBodySchema.safeParse({
        ...valid,
        link: "/".repeat(MAX_NOTIF_LINK_LEN + 1),
      }).success,
    ).toBe(false);
  });

  it("userIds ceiling: 1000 passes (legacy slice applies inside the route), 1001 fails", () => {
    const many = Array.from(
      { length: MAX_BROADCAST_RECIPIENTS },
      (_, i) =>
        `123e4567-e89b-12d3-a456-42661417${String(i).padStart(4, "0")}`,
    );
    expect(
      broadcastBodySchema.safeParse({ ...valid, userIds: many }).success,
    ).toBe(true);
    expect(
      broadcastBodySchema.safeParse({ ...valid, userIds: [...many, uuid] }).success,
    ).toBe(false);
  });

  it("rejects a non-uuid userId/userIds entry (hostile garbage fails at the boundary)", () => {
    expect(
      broadcastBodySchema.safeParse({ ...valid, userId: "not-a-uuid" }).success,
    ).toBe(false);
    expect(
      broadcastBodySchema.safeParse({ ...valid, userIds: ["123"] }).success,
    ).toBe(false);
  });
});
