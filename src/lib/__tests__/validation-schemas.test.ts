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
