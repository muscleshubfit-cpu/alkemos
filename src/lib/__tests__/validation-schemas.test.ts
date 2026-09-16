import { describe, it, expect } from "vitest";
import {
  emailSchema,
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
import {
  coachActivationBodySchema,
  coachAdPackageBodySchema,
  coachClaimBodySchema,
  coachInviteBodySchema,
  coachLandingBodySchema,
  coachRegisterBodySchema,
  coachSupportBodySchema,
  coachTopupBodySchema,
  MAX_ACTIVATION_NOTE,
  MAX_BIO_LEN,
  MAX_CERTIFICATES,
  MAX_COACH_NAME_LEN,
  MAX_HEADLINE_LEN,
  MAX_PASSWORD_LEN,
  MAX_RESULTS_PHOTOS,
  MAX_SLUG_RAW_LEN,
  MAX_SPECIALTIES_TOTAL,
  MAX_SPECIALTY_ITEMS,
  MAX_SPECIALTY_ITEM_LEN,
  MAX_SUPPORT_BODY,
  MAX_SUPPORT_SUBJECT,
  MAX_TOPUP_NOTE,
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

// ── VERCEL-USAGE cleanup (2026-09-16): the exerciseNameSchema describe
//    block was removed together with /api/exercise-image (dead route —
//    zero callers since exercise images moved to self-hosted WebP under
//    /images/exercises/, Batch 2 §12.53 item 2). ──

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

// ── Wave 2A (2026-09-17): the coach/* write boundaries — register ·
//    claim · clients/invite · landing · support · ads ·
//    subscriptions/activate · wallet/topup. Same canary style: correct
//    + wrong + hostile per schema; the routes re-derive their legacy
//    400 classes verbatim (compat law) and keep their policy helpers. ──

describe("coachRegisterBodySchema — POST /api/coach/register (Wave 2A)", () => {
  const valid = {
    full_name: "  Ahmed Hassan  ",
    email: "  Coach@Example.COM ",
    password: "strong-pass-8",
    phone: "+20 100 123 4567",
  };

  it("accepts a valid body and normalizes email (name/phone stay policy-owned)", () => {
    const r = coachRegisterBodySchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("coach@example.com");
      expect(r.data.full_name).toBe("  Ahmed Hassan  "); // route trims
    }
  });

  it("accepts the minimal body (no phone) and the honeypot field stays open", () => {
    expect(
      coachRegisterBodySchema.safeParse({
        full_name: "Coach X",
        email: "c@x.io",
        password: "12345678",
        website: "", // empty honeypot → reaches the gate
      }).success,
    ).toBe(true);
  });

  it("rejects non-string / oversize full_name (120 = the legacy slice point)", () => {
    expect(coachRegisterBodySchema.safeParse({ ...valid, full_name: 42 }).success).toBe(false);
    expect(
      coachRegisterBodySchema.safeParse({ ...valid, full_name: "x".repeat(MAX_COACH_NAME_LEN + 1) })
        .success,
    ).toBe(false);
  });

  it("rejects oversize email and password (254 / 200 ceilings)", () => {
    expect(
      coachRegisterBodySchema.safeParse({ ...valid, email: `${"a".repeat(250)}@x.io` }).success,
    ).toBe(false);
    expect(
      coachRegisterBodySchema.safeParse({ ...valid, password: "p".repeat(MAX_PASSWORD_LEN + 1) })
        .success,
    ).toBe(false);
  });

  it("phone stays intentionally open — cleanPhone is the sole policy", () => {
    expect(
      coachRegisterBodySchema.safeParse({ ...valid, phone: { evil: true } }).success,
    ).toBe(true);
  });

  it("hostile: smuggled keys are STRIPPED (role/website objects never reach metadata)", () => {
    const r = coachRegisterBodySchema.safeParse({
      ...valid,
      role: "admin",
      signup_source: "hacked",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).not.toHaveProperty("role");
      expect(r.data).not.toHaveProperty("signup_source");
    }
  });
});

describe("coachClaimBodySchema — POST /api/coach/claim (Wave 2A)", () => {
  it("accepts a valid slug and strips smuggled keys", () => {
    const r = coachClaimBodySchema.safeParse({ slug: "coach-abc123", coach_id: "x" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).not.toHaveProperty("coach_id");
  });
  it("rejects non-string / oversize slugs (route SLUG_RE re-derives invalid_slug)", () => {
    expect(coachClaimBodySchema.safeParse({ slug: 123 }).success).toBe(false);
    expect(
      coachClaimBodySchema.safeParse({ slug: "x".repeat(MAX_SLUG_RAW_LEN + 1) }).success,
    ).toBe(false);
    expect(coachClaimBodySchema.safeParse({}).success).toBe(false);
  });
});

describe("coachInviteBodySchema — POST /api/coach/clients/invite (Wave 2A)", () => {
  const valid = { email: "New.Client@Example.com", full_name: "New Client" };

  it("accepts a valid invite and lowercases the email", () => {
    const r = coachInviteBodySchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("new.client@example.com");
  });
  it("email is SHAPE-only here — format garbage passes the gate and dies at the route's EMAIL_RE", () => {
    // Layer law: deliverability/format policy lives in the route.
    expect(coachInviteBodySchema.safeParse({ email: "not-an-email" }).success).toBe(true);
    // Shape-hostile emails fail the gate itself.
    expect(coachInviteBodySchema.safeParse({ email: `${"a".repeat(250)}@x.io` }).success).toBe(
      false,
    );
    expect(coachInviteBodySchema.safeParse({ email: 42 }).success).toBe(false);
    expect(coachInviteBodySchema.safeParse({}).success).toBe(false);
  });
  it("rejects a >120 full_name (the legacy silent slice point) and smuggled coach_id", () => {
    expect(
      coachInviteBodySchema.safeParse({ ...valid, full_name: "x".repeat(MAX_COACH_NAME_LEN + 1) })
        .success,
    ).toBe(false);
    const r = coachInviteBodySchema.safeParse({ ...valid, coach_id: "attacker-id" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).not.toHaveProperty("coach_id");
  });
});

describe("coachLandingBodySchema — PUT /api/coach/landing (Wave 2A)", () => {
  const valid = {
    slug: "coach-abc123",
    headline: "مدرب معتمد",
    bio: "خبرة 10 سنوات",
    specialties: ["تنشيط", "تغذية"],
    is_published: false,
    photo_url: "/storage/v1/object/public/coach-public/x.jpg",
    results_photos: [{ url: "https://x.io/a.jpg", caption: "قبل وبعد" }],
    certificates: [{ url: "https://x.io/c.jpg", title: "ISSA" }],
    whatsapp_phone: "01012345678",
  };

  it("accepts a fully valid body", () => {
    expect(coachLandingBodySchema.safeParse(valid).success).toBe(true);
  });

  it("ceilings equal the editor maxLengths: headline 140 · bio 4000", () => {
    expect(
      coachLandingBodySchema.safeParse({ ...valid, headline: "x".repeat(MAX_HEADLINE_LEN) })
        .success,
    ).toBe(true);
    expect(
      coachLandingBodySchema.safeParse({ ...valid, headline: "x".repeat(MAX_HEADLINE_LEN + 1) })
        .success,
    ).toBe(false);
    expect(
      coachLandingBodySchema.safeParse({ ...valid, bio: "x".repeat(MAX_BIO_LEN + 1) }).success,
    ).toBe(false);
  });

  it("specialties: array items ≤80, count ≤100; the string variant ≤800", () => {
    expect(
      coachLandingBodySchema.safeParse({
        ...valid,
        specialties: ["x".repeat(MAX_SPECIALTY_ITEM_LEN)],
      }).success,
    ).toBe(true);
    expect(
      coachLandingBodySchema.safeParse({
        ...valid,
        specialties: ["x".repeat(MAX_SPECIALTY_ITEM_LEN + 1)],
      }).success,
    ).toBe(false);
    expect(
      coachLandingBodySchema.safeParse({
        ...valid,
        specialties: Array.from({ length: MAX_SPECIALTY_ITEMS + 1 }, () => "x"),
      }).success,
    ).toBe(false);
    expect(
      coachLandingBodySchema.safeParse({
        ...valid,
        specialties_en: "x".repeat(MAX_SPECIALTIES_TOTAL + 1),
      }).success,
    ).toBe(false);
  });

  it("is_published must be a real boolean (the editor sends one)", () => {
    expect(
      coachLandingBodySchema.safeParse({ ...valid, is_published: "true" }).success,
    ).toBe(false);
  });

  it("media arrays: COUNT bounded only — hostile items stay policy-dropped, shapes open", () => {
    expect(
      coachLandingBodySchema.safeParse({
        ...valid,
        results_photos: Array.from({ length: MAX_RESULTS_PHOTOS + 1 }, () => "junk"),
      }).success,
    ).toBe(false);
    expect(
      coachLandingBodySchema.safeParse({
        ...valid,
        certificates: ["junk", { url: { deep: true } }],
      }).success,
    ).toBe(true);
  });

  it("hostile: review_status/reviewed_at/coach_id are STRIPPED — moderation stays server-side", () => {
    const r = coachLandingBodySchema.safeParse({
      ...valid,
      review_status: "approved",
      reviewed_at: "2026-01-01",
      coach_id: "someone-else",
      slug: "someone-elses-slug-too-long-but-bounded",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).not.toHaveProperty("review_status");
      expect(r.data).not.toHaveProperty("reviewed_at");
      expect(r.data).not.toHaveProperty("coach_id");
    }
  });
});

describe("coachSupportBodySchema — POST /api/coach/support (Wave 2A)", () => {
  const valid = { subject: "مشكلة في المحفظة", body: "التفاصيل هنا" };

  it("accepts + trims a valid thread", () => {
    const r = coachSupportBodySchema.safeParse({
      subject: `  ${valid.subject}  `,
      body: valid.body,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.subject).toBe(valid.subject);
  });
  it("rejects whitespace-only subject/body (route re-derives bad_request)", () => {
    expect(coachSupportBodySchema.safeParse({ subject: "   ", body: "x" }).success).toBe(false);
    expect(coachSupportBodySchema.safeParse({ subject: "x" }).success).toBe(false);
  });
  it("ceilings: subject 140 · body 4000 (the legacy slice points)", () => {
    expect(
      coachSupportBodySchema.safeParse({ ...valid, subject: "x".repeat(MAX_SUPPORT_SUBJECT + 1) })
        .success,
    ).toBe(false);
    expect(
      coachSupportBodySchema.safeParse({ ...valid, body: "x".repeat(MAX_SUPPORT_BODY + 1) })
        .success,
    ).toBe(false);
  });
});

describe("coachAdPackageBodySchema — POST /api/coach/ads (Wave 2A)", () => {
  it("accepts a string package_id; the allowlist lookup stays the policy", () => {
    expect(coachAdPackageBodySchema.safeParse({ package_id: "ad_7d" }).success).toBe(true);
  });
  it("rejects non-string / missing package_id (route re-derives bad_package)", () => {
    expect(coachAdPackageBodySchema.safeParse({ package_id: { id: "ad_7d" } }).success).toBe(false);
    expect(coachAdPackageBodySchema.safeParse({}).success).toBe(false);
  });
});

describe("coachActivationBodySchema — POST /api/coach/subscriptions/activate (Wave 2A)", () => {
  const valid = {
    client_id: "123e4567-e89b-12d3-a456-426614174000",
    tier: "coaching",
    months: 3,
  };

  it("accepts numeric months + nullish amount/method/note (the UI contract)", () => {
    const r = coachActivationBodySchema.safeParse({
      ...valid,
      amount: null,
      method: "instapay",
      note: null,
    });
    expect(r.success).toBe(true);
  });
  it("preserves the legacy Number() coercion: string months/amount still pass", () => {
    expect(
      coachActivationBodySchema.safeParse({ ...valid, months: "3", amount: "150.50" }).success,
    ).toBe(true);
  });
  it("rejects boolean/object months and an oversize note (500 = the slice point)", () => {
    expect(coachActivationBodySchema.safeParse({ ...valid, months: true }).success).toBe(false);
    expect(coachActivationBodySchema.safeParse({ ...valid, months: [3] }).success).toBe(false);
    expect(
      coachActivationBodySchema.safeParse({
        ...valid,
        note: "x".repeat(MAX_ACTIVATION_NOTE + 1),
      }).success,
    ).toBe(false);
  });
  it("hostile: wallet/ledger keys are STRIPPED", () => {
    const r = coachActivationBodySchema.safeParse({
      ...valid,
      p_ref_id: "forged",
      subscription_id: "forged",
      coach_id: "someone-else",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).not.toHaveProperty("p_ref_id");
      expect(r.data).not.toHaveProperty("subscription_id");
      expect(r.data).not.toHaveProperty("coach_id");
    }
  });
});

describe("coachTopupBodySchema — POST /api/coach/wallet/topup (Wave 2A)", () => {
  const valid = {
    amount: 250,
    method: "vodafone_cash",
    note: "شحن المحفظة",
    receipt_path: "receipts/123e4567-e89b-12d3-a456-426614174000/1700000000-slip.jpg",
  };

  it("accepts a valid top-up request", () => {
    expect(coachTopupBodySchema.safeParse(valid).success).toBe(true);
  });
  it("rejects a missing receipt_path / method (route re-derives the legacy classes)", () => {
    const { receipt_path: _drop, ...withoutReceipt } = valid;
    expect(coachTopupBodySchema.safeParse(withoutReceipt).success).toBe(false);
    const { method: _drop2, ...withoutMethod } = valid;
    expect(coachTopupBodySchema.safeParse(withoutMethod).success).toBe(false);
  });
  it("note ceiling 300 (the legacy slice point) — oversize now 400", () => {
    expect(
      coachTopupBodySchema.safeParse({ ...valid, note: "x".repeat(MAX_TOPUP_NOTE + 1) }).success,
    ).toBe(false);
  });
  it("string amounts still pass (legacy Number coercion), objects fail", () => {
    expect(coachTopupBodySchema.safeParse({ ...valid, amount: "250" }).success).toBe(true);
    expect(coachTopupBodySchema.safeParse({ ...valid, amount: { usd: 250 } }).success).toBe(false);
  });
});
