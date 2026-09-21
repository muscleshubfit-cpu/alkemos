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
import {
  aiJobEnqueueBodySchema,
  evoChatBodySchema,
  MAX_CHAT_HISTORY_ITEMS,
  MAX_JOB_TYPE_LEN,
  MAX_MEMBER_PLAN_TEXT,
  MAX_MEMBER_PLAN_TITLE,
  MAX_TICKET_BODY,
  MAX_TICKET_SUBJECT,
  memberPlanRenameBodySchema,
  memberSaveEvoBodySchema,
  memberSwapBodySchema,
  planNormalizeBodySchema,
  emptyEnvelopeBodySchema,
  savedToolDeleteIdSchema,
  supportTicketBodySchema,
} from "@/lib/validation/schemas";
import {
  ADMIN_NOTIF_TYPES,
  affiliateCommissionBodySchema,
  adminAccountDeleteBodySchema,
  adminAccountFlagBodySchema,
  adminAssignPairBodySchema,
  adminBlogCleanupBodySchema,
  adminCoachKindBodySchema,
  adminCoachNotifyBodySchema,
  adminCoachPageReviewBodySchema,
  adminCoachSupportReplyBodySchema,
  adminLeadPatchBodySchema,
  adminNotificationBodySchema,
  adminRefundDecisionBodySchema,
  adminSiteUnassignBodySchema,
  adminStaffDemoteBodySchema,
  adminStaffInviteBodySchema,
  adminTopupReviewBodySchema,
  adminWalletAdjustBodySchema,
  cronBlogP0QuerySchema,
  cronBlogQueueQuerySchema,
  externalPlanActionBodySchema,
  externalPlanCreateBodySchema,
  externalPlanPatchBodySchema,
  MAX_CRON_JOB_ID,
  MAX_CRON_TOPIC,
  paypalCaptureOrderBodySchema,
  paypalCreateOrderBodySchema,
  paypalWebhookEventSchema,
  uuidQueryIdSchema,
} from "@/lib/validation/schemas";
import { EVO_HISTORY_CAP_PAID } from "@/lib/evo-coach";

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

// ── Wave 2B (2026-09-17): the user-side write boundaries —
//    plans/member-edit (save-evo + swap) · support/tickets · ai/jobs
//    envelope · ai/chat envelope · tools/saved-* DELETE id. Same canary
//    style: correct + wrong + hostile per schema; the routes re-derive
//    their legacy 400 classes verbatim (compat law) and keep their
//    policy (mode dispatch, UUID_RE, ownership, quotas, history
//    drop/slice, guest-id hashing). ──

describe("memberSaveEvoBodySchema — POST /api/plans/member-edit save-evo (Wave 2B)", () => {
  const valid = {
    kind: "meal",
    title: "خطة من EVO",
    text: "فطور: شوفان بالحليب وبعض الفواكه، ثم تمارين خفيفة مساءً.",
  };

  it("accepts a valid save (the widget sends kind 'meal' + title ≤80)", () => {
    const r = memberSaveEvoBodySchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.title).toBe("خطة من EVO");
  });

  it("kind keeps the legacy trim semantics: ' workout ' passes trimmed", () => {
    const r = memberSaveEvoBodySchema.safeParse({ ...valid, kind: " workout " });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.kind).toBe("workout");
  });

  it("kind stays the raw allowlist — the meal→nutrition mapping is the route's", () => {
    // Layer law: the gate pins the three raws; which plan row type they
    // map to is decided in the route.
    expect(
      memberSaveEvoBodySchema.safeParse({ ...valid, kind: "nutrition" }).success,
    ).toBe(true);
    expect(
      memberSaveEvoBodySchema.safeParse({ ...valid, kind: "dessert" }).success,
    ).toBe(false);
  });

  it("rejects a whitespace/short title (route re-derives bad_request)", () => {
    expect(memberSaveEvoBodySchema.safeParse({ ...valid, title: "   " }).success).toBe(false);
    expect(memberSaveEvoBodySchema.safeParse({ ...valid, title: "ab" }).success).toBe(false);
  });

  it("title ceiling 120 = the legacy slice point — oversize now 400", () => {
    expect(
      memberSaveEvoBodySchema.safeParse({ ...valid, title: "x".repeat(MAX_MEMBER_PLAN_TITLE) })
        .success,
    ).toBe(true);
    expect(
      memberSaveEvoBodySchema.safeParse({ ...valid, title: "x".repeat(MAX_MEMBER_PLAN_TITLE + 1) })
        .success,
    ).toBe(false);
  });

  it("text needs ≥20 trimmed chars and rejects >20000 (the legacy slice point)", () => {
    expect(memberSaveEvoBodySchema.safeParse({ ...valid, text: "قصير" }).success).toBe(false);
    expect(
      memberSaveEvoBodySchema.safeParse({ ...valid, text: `${"ك".repeat(19)} ` }).success,
    ).toBe(false); // 19 non-space chars + a trailing space → trimmed < 20
    expect(
      memberSaveEvoBodySchema.safeParse({ ...valid, text: "ك".repeat(MAX_MEMBER_PLAN_TEXT + 1) })
        .success,
    ).toBe(false);
  });

  it("hostile: the plans columns a client must never set are STRIPPED", () => {
    const r = memberSaveEvoBodySchema.safeParse({
      ...valid,
      client_id: "someone-else",
      status: "approved",
      is_current: true,
      approved_at: "2026-01-01",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).not.toHaveProperty("client_id");
      expect(r.data).not.toHaveProperty("status");
      expect(r.data).not.toHaveProperty("is_current");
      expect(r.data).not.toHaveProperty("approved_at");
    }
  });
});

describe("memberSwapBodySchema — POST /api/plans/member-edit swap (Wave 2B)", () => {
  const uuid = "123e4567-e89b-12d3-a456-426614174000";
  const valid = { planId: uuid, content: { text: "updated", source: "evo" } };

  it("accepts a valid swap payload", () => {
    expect(memberSwapBodySchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a missing/empty planId (route re-derives bad_request)", () => {
    expect(memberSwapBodySchema.safeParse({ ...valid, planId: "" }).success).toBe(false);
    expect(memberSwapBodySchema.safeParse({ content: { a: 1 } }).success).toBe(false);
  });

  it("planId stays a bounded STRING — garbage ids stay the route's 404 class", () => {
    // Layer law: a uuid pin would convert the legacy not_found 404 into
    // a 400 beyond the sanctioned classes; the ownership lookup is the
    // policy, the gate only bounds the shape.
    expect(
      memberSwapBodySchema.safeParse({ ...valid, planId: "not-even-a-uuid" }).success,
    ).toBe(true);
    expect(
      memberSwapBodySchema.safeParse({ ...valid, planId: "x".repeat(101) }).success,
    ).toBe(false);
  });

  it("rejects non-object content — arrays no longer slip into the plans row", () => {
    expect(memberSwapBodySchema.safeParse({ ...valid, content: ["a", "b"] }).success).toBe(false);
    expect(memberSwapBodySchema.safeParse({ ...valid, content: "text" }).success).toBe(false);
    expect(memberSwapBodySchema.safeParse({ ...valid, content: null }).success).toBe(false);
  });

  it("hostile: client_id/status are STRIPPED — the row owner is the session", () => {
    const r = memberSwapBodySchema.safeParse({
      ...valid,
      client_id: "someone-else",
      status: "draft",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).not.toHaveProperty("client_id");
      expect(r.data).not.toHaveProperty("status");
    }
  });
});

describe("supportTicketBodySchema — POST /api/support/tickets (Wave 2B)", () => {
  const uuid = "123e4567-e89b-12d3-a456-426614174000";

  it("accepts a member creation body (subject + body, no ticketId) and trims", () => {
    const r = supportTicketBodySchema.safeParse({
      subject: "  مشكلة في الدفع  ",
      body: "التفاصيل كاملة هنا",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.subject).toBe("مشكلة في الدفع");
      expect(r.data.ticketId).toBeUndefined();
    }
  });

  it("accepts staff reply/status bodies", () => {
    expect(
      supportTicketBodySchema.safeParse({ ticketId: uuid, body: "رد الفريق" }).success,
    ).toBe(true);
    expect(
      supportTicketBodySchema.safeParse({ ticketId: uuid, status: "closed" }).success,
    ).toBe(true);
  });

  it("empty body passes the gate — the two-path dispatch is route policy", () => {
    // All fields optional: {} reaches the route and dies on auth /
    // «لا يوجد رد أو تغيير حالة» exactly as legacy.
    expect(supportTicketBodySchema.safeParse({}).success).toBe(true);
  });

  it("subject ceiling 200 = the legacy member 400 class; the 3-char minimum stays the route's", () => {
    // Layer law: subject is optional (staff replies send none), so the
    // gate pins only the ceiling; a <3 subject passes the gate and the
    // route's member-path check re-derives «اكتب موضوعًا...» verbatim.
    expect(
      supportTicketBodySchema.safeParse({ subject: "x".repeat(MAX_TICKET_SUBJECT) }).success,
    ).toBe(true);
    expect(
      supportTicketBodySchema.safeParse({ subject: "x".repeat(MAX_TICKET_SUBJECT + 1) }).success,
    ).toBe(false);
    expect(supportTicketBodySchema.safeParse({ subject: "ab" }).success).toBe(true);
  });

  it("body ceiling 4000 = the legacy insert slice — oversize now 400", () => {
    expect(
      supportTicketBodySchema.safeParse({ subject: "abc", body: "x".repeat(MAX_TICKET_BODY) })
        .success,
    ).toBe(true);
    expect(
      supportTicketBodySchema.safeParse({ subject: "abc", body: "x".repeat(MAX_TICKET_BODY + 1) })
        .success,
    ).toBe(false);
  });

  it("status: the three verbs pass (trimmed), anything else fails", () => {
    expect(supportTicketBodySchema.safeParse({ status: " open " }).success).toBe(true);
    expect(supportTicketBodySchema.safeParse({ status: "pending" }).success).toBe(true);
    expect(supportTicketBodySchema.safeParse({ status: "junk" }).success).toBe(false);
    expect(supportTicketBodySchema.safeParse({ status: 42 }).success).toBe(false);
  });

  it("hostile: client_id/priority are STRIPPED — priority is server-decided", () => {
    const r = supportTicketBodySchema.safeParse({
      subject: "abc",
      body: "x",
      client_id: "someone-else",
      priority: "high",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).not.toHaveProperty("client_id");
      expect(r.data).not.toHaveProperty("priority");
    }
  });
});

describe("aiJobEnqueueBodySchema — POST /api/ai/jobs (Wave 2B)", () => {
  it("accepts the UI envelope with an object payload", () => {
    expect(
      aiJobEnqueueBodySchema.safeParse({
        type: "plan_nutrition",
        payload: { clientId: "123e4567-e89b-12d3-a456-426614174000", notes: "كيتو" },
      }).success,
    ).toBe(true);
  });

  it("accepts an absent payload (legacy body?.payload === undefined)", () => {
    const r = aiJobEnqueueBodySchema.safeParse({ type: "article_generate" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.payload).toBeUndefined();
  });

  it("rejects missing/empty/non-string/oversize type (route re-derives Unknown job type)", () => {
    expect(aiJobEnqueueBodySchema.safeParse({}).success).toBe(false);
    expect(aiJobEnqueueBodySchema.safeParse({ type: "" }).success).toBe(false);
    expect(aiJobEnqueueBodySchema.safeParse({ type: 42 }).success).toBe(false);
    expect(
      aiJobEnqueueBodySchema.safeParse({ type: "x".repeat(MAX_JOB_TYPE_LEN + 1) }).success,
    ).toBe(false);
  });

  it("type is NOT trimmed — an unlisted spaced type dies on the route allowlist", () => {
    // Exact legacy String() semantics: ' plan_nutrition ' passed the
    // legacy envelope and died on isAiJobType; the gate preserves that.
    const r = aiJobEnqueueBodySchema.safeParse({ type: " plan_nutrition " });
    expect(r.success).toBe(true);
  });

  it("payload stays shape-open — sanitizeJobPayload inside enqueue is the policy", () => {
    expect(aiJobEnqueueBodySchema.safeParse({ type: "t", payload: 42 }).success).toBe(true);
    expect(aiJobEnqueueBodySchema.safeParse({ type: "t", payload: "x" }).success).toBe(true);
  });

  it("hostile: requested_by is STRIPPED — the queue owner is the session", () => {
    const r = aiJobEnqueueBodySchema.safeParse({
      type: "plan_nutrition",
      payload: {},
      requested_by: "someone-else",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).not.toHaveProperty("requested_by");
  });
});

describe("evoChatBodySchema — POST /api/ai/chat (Wave 2B)", () => {
  it("accepts the widget envelope and trims the message", () => {
    const r = evoChatBodySchema.safeParse({
      message: "  ما هي أفضل تمارين الصدر؟  ",
      history: [
        { id: "m1", role: "user", content: "سؤال سابق" },
        { id: "m2", role: "assistant", content: "جواب سابق" },
      ],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.message).toBe("ما هي أفضل تمارين الصدر؟");
      // history items ride as z.unknown() passthrough — the gate adds
      // no per-item shape (the route's filter+slice is the item policy)
      expect(r.data.history?.length).toBe(2);
    }
  });

  it("rejects missing/whitespace/non-string message (route re-derives Missing message)", () => {
    expect(evoChatBodySchema.safeParse({}).success).toBe(false);
    expect(evoChatBodySchema.safeParse({ message: "   " }).success).toBe(false);
    expect(evoChatBodySchema.safeParse({ message: 42 }).success).toBe(false);
  });

  it("message has NO zod length ceiling — the 4000 wire clamp stays route policy", () => {
    // The chat input has no client maxLength: a zod ceiling here would
    // 400 real paste-heavy users instead of the documented
    // clamp-and-process semantics.
    expect(evoChatBodySchema.safeParse({ message: "ك".repeat(10_000) }).success).toBe(true);
  });

  it("history count ceiling = the route wire clamp (16 = EVO_HISTORY_CAP_PAID)", () => {
    expect(MAX_CHAT_HISTORY_ITEMS).toBe(EVO_HISTORY_CAP_PAID);
    const items = Array.from({ length: MAX_CHAT_HISTORY_ITEMS }, () => ({
      role: "user",
      content: "x",
    }));
    expect(evoChatBodySchema.safeParse({ message: "مرحبا", history: items }).success).toBe(true);
    expect(
      evoChatBodySchema.safeParse({ message: "مرحبا", history: [...items, { role: "user" }] })
        .success,
    ).toBe(false);
  });

  it("history ITEMS stay open — the route's filter+slice is the drop policy", () => {
    // Same law as the Wave 2A media arrays: count bounded, items
    // policy-owned (junk items are filtered out by the route, not 400'd).
    expect(
      evoChatBodySchema.safeParse({
        message: "مرحبا",
        history: ["junk", 42, { content: 123 }],
      }).success,
    ).toBe(true);
  });

  it("guestId stays open (the register-phone precedent) — hashing is route policy", () => {
    expect(
      evoChatBodySchema.safeParse({ message: "مرحبا", guestId: { evil: true } }).success,
    ).toBe(true);
    expect(
      evoChatBodySchema.safeParse({ message: "مرحبا", guestId: "ك".repeat(500) }).success,
    ).toBe(true);
  });

  it("hostile: tier/session keys are STRIPPED", () => {
    const r = evoChatBodySchema.safeParse({
      message: "مرحبا",
      tier: "coaching",
      userId: "someone-else",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).not.toHaveProperty("tier");
      expect(r.data).not.toHaveProperty("userId");
    }
  });
});

describe("savedToolDeleteIdSchema — DELETE /api/tools/saved-* (Wave 2B)", () => {
  const uuid = "123e4567-e89b-12d3-a456-426614174000";

  it("accepts a real row uuid", () => {
    expect(savedToolDeleteIdSchema.safeParse(uuid).success).toBe(true);
  });

  it("rejects garbage/empty ids (previously a silent no-op 200 — now 400)", () => {
    expect(savedToolDeleteIdSchema.safeParse("garbage").success).toBe(false);
    expect(savedToolDeleteIdSchema.safeParse("").success).toBe(false);
    expect(savedToolDeleteIdSchema.safeParse(`${uuid} `).success).toBe(false);
  });
});

describe("planNormalizeBodySchema — POST /api/plans/normalize (Wave 2B completion)", () => {
  it("accepts the real widget payload ({text, planType, clientId})", () => {
    const r = planNormalizeBodySchema.safeParse({
      text: "خطة اليوم الأول: فطور شوفان",
      planType: "nutrition",
      clientId: "123e4567-e89b-12d3-a456-426614174000",
    });
    expect(r.success).toBe(true);
  });

  it("accepts without clientId (optional — admin path)", () => {
    const r = planNormalizeBodySchema.safeParse({
      text: "day 1: push day",
      planType: "workout",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.clientId).toBeUndefined();
  });

  it("trims text and clientId (route uses parsed.data)", () => {
    const r = planNormalizeBodySchema.safeParse({
      text: "  workout plan  ",
      planType: "workout",
      clientId: " 123e4567-e89b-12d3-a456-426614174000 ",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.text).toBe("workout plan");
      expect(r.data.clientId).toBe("123e4567-e89b-12d3-a456-426614174000");
    }
  });

  it("rejects missing/whitespace-only text (route re-derives «Missing required field: text»)", () => {
    expect(planNormalizeBodySchema.safeParse({ planType: "nutrition" }).success).toBe(false);
    expect(
      planNormalizeBodySchema.safeParse({ text: "   ", planType: "nutrition" }).success,
    ).toBe(false);
    expect(planNormalizeBodySchema.safeParse({}).success).toBe(false);
  });

  it("rejects bad planType (route re-derives «planType must be 'nutrition' or 'workout'»)", () => {
    expect(
      planNormalizeBodySchema.safeParse({ text: "خطة", planType: "meal" }).success,
    ).toBe(false);
    expect(
      planNormalizeBodySchema.safeParse({ text: "خطة", planType: 5 }).success,
    ).toBe(false);
    expect(planNormalizeBodySchema.safeParse({ text: "خطة" }).success).toBe(false);
  });

  it("rejects non-string text (the new wrong-type class — legacy crashed 500 on .trim())", () => {
    expect(
      planNormalizeBodySchema.safeParse({ text: 123, planType: "nutrition" }).success,
    ).toBe(false);
    expect(
      planNormalizeBodySchema.safeParse({ text: ["a"], planType: "nutrition" }).success,
    ).toBe(false);
  });

  it("layering: text has NO zod ceiling (route has no slice point — lib clamp-and-process stays policy)", () => {
    const big = "x".repeat(50_000);
    const r = planNormalizeBodySchema.safeParse({ text: big, planType: "workout" });
    expect(r.success).toBe(true);
  });

  it("layering: clientId is a bounded STRING, not z.uuid (UUID_RE + Arabic 400/403/402 ladder stays route policy)", () => {
    const r = planNormalizeBodySchema.safeParse({
      text: "خطة",
      planType: "nutrition",
      clientId: "not-a-uuid",
    });
    expect(r.success).toBe(true);
  });

  it("hostile: smuggled keys are STRIPPED", () => {
    const r = planNormalizeBodySchema.safeParse({
      text: "خطة",
      planType: "workout",
      coach_role: "admin",
      requested_by: "someone-else",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).not.toHaveProperty("coach_role");
      expect(r.data).not.toHaveProperty("requested_by");
    }
  });
});

describe("emptyEnvelopeBodySchema — POST subscription/cancel · refund/request (Wave 2B completion)", () => {
  it("accepts {} and any object with unknown keys stripped (real callers send no body — route maps null→{})", () => {
    const empty = emptyEnvelopeBodySchema.safeParse({});
    expect(empty.success).toBe(true);

    const junk = emptyEnvelopeBodySchema.safeParse({
      subscription_id: "row-1",
      userId: "someone-else",
      force: true,
    });
    expect(junk.success).toBe(true);
    if (junk.success) expect(junk.data).toEqual({});
  });

  it("rejects hostile non-object JSON bodies (legacy silent no-op 200 — now 400, the DELETE-id class)", () => {
    expect(emptyEnvelopeBodySchema.safeParse([1, 2, 3]).success).toBe(false);
    expect(emptyEnvelopeBodySchema.safeParse("string").success).toBe(false);
    expect(emptyEnvelopeBodySchema.safeParse(5).success).toBe(false);
    expect(emptyEnvelopeBodySchema.safeParse(null).success).toBe(false);
    expect(emptyEnvelopeBodySchema.safeParse(undefined).success).toBe(false);
  });
});

/* ═══════════════════════════════════════════════════════════════════════
 * Wave 3 (phase 222) canaries — paypal · admin · cron · affiliate.
 * Same law as every prior wave: zod = shape/type/size + trim +
 * unknown-key stripping; every LEGACY failure class keeps its exact
 * route response (re-derived route-side); only NEW violations get
 * fresh 400s. Auth-first ordering is a ROUTE concern (pinned by the
 * live smoke in the phase worklog, not by these unit canaries).
 * ═══════════════════════════════════════════════════════════════════ */

describe("paypalCreateOrderBodySchema — POST /api/paypal/create-order (Wave 3, §7)", () => {
  it("accepts the real subscription payload", () => {
    const r = paypalCreateOrderBodySchema.safeParse({
      planTier: "premium",
      durationMonths: 12,
    });
    expect(r.success).toBe(true);
  });

  it("accepts the real wallet-topup payload (numeric string amount = legacy Number() coercion)", () => {
    const r = paypalCreateOrderBodySchema.safeParse({
      purpose: "wallet_topup",
      amountUsd: "50",
    });
    expect(r.success).toBe(true);
  });

  it("accepts the legacy EGP payload (pre-0038 compat)", () => {
    const r = paypalCreateOrderBodySchema.safeParse({
      purpose: "wallet_topup",
      amountEgp: 1500,
    });
    expect(r.success).toBe(true);
  });

  it("rejects string durationMonths (route re-derives «Invalid durationMonths — must be 1 or 12» verbatim)", () => {
    expect(
      paypalCreateOrderBodySchema.safeParse({ planTier: "premium", durationMonths: "12" }).success,
    ).toBe(false);
  });

  it("rejects non-string planTier (route re-derives «Missing or invalid planTier» verbatim)", () => {
    expect(paypalCreateOrderBodySchema.safeParse({ planTier: 5, durationMonths: 1 }).success).toBe(
      false,
    );
  });

  it("layering: purpose stays OPEN (the === dispatch is route policy — non-strings take the subscription branch exactly as legacy)", () => {
    const r = paypalCreateOrderBodySchema.safeParse({ purpose: 123, planTier: "premium", durationMonths: 1 });
    expect(r.success).toBe(true);
  });

  it("hostile: smuggled object/array amounts now 400 (legacy Number([5]) coerced to 5 — the sanctioned smuggled-shape class)", () => {
    expect(
      paypalCreateOrderBodySchema.safeParse({ purpose: "wallet_topup", amountUsd: [5] }).success,
    ).toBe(false);
    expect(
      paypalCreateOrderBodySchema.safeParse({ purpose: "wallet_topup", amountUsd: { v: 5 } }).success,
    ).toBe(false);
  });
});

describe("paypalCaptureOrderBodySchema — POST /api/paypal/capture-order (Wave 3, §7)", () => {
  it("accepts a real PayPal order id", () => {
    const r = paypalCaptureOrderBodySchema.safeParse({ orderId: "5O190127TN364715T" });
    expect(r.success).toBe(true);
  });

  it("rejects missing/empty/non-string orderId (route re-derives «Missing or invalid orderId» verbatim)", () => {
    expect(paypalCaptureOrderBodySchema.safeParse({}).success).toBe(false);
    expect(paypalCaptureOrderBodySchema.safeParse({ orderId: "" }).success).toBe(false);
    expect(paypalCaptureOrderBodySchema.safeParse({ orderId: 123 }).success).toBe(false);
  });

  it("rejects oversized orderId (fresh fail-fast class — legacy flowed it into the PayPal API roundtrip)", () => {
    expect(paypalCaptureOrderBodySchema.safeParse({ orderId: "x".repeat(101) }).success).toBe(false);
  });

  it("hostile: smuggled keys are STRIPPED", () => {
    const r = paypalCaptureOrderBodySchema.safeParse({
      orderId: "5O190127TN364715T",
      user_id: "someone-else",
      amount: 0.01,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).not.toHaveProperty("user_id");
      expect(r.data).not.toHaveProperty("amount");
    }
  });
});

describe("paypalWebhookEventSchema — POST /api/paypal/webhook (Wave 3, §7)", () => {
  it("accepts a real PAYMENT.CAPTURE.REFUNDED event shape", () => {
    const r = paypalWebhookEventSchema.safeParse({
      event_type: "PAYMENT.CAPTURE.REFUNDED",
      resource_type: "capture",
      resource: {
        id: "8RU543269A218761Y",
        custom_id: '{"user_id":"abc","plan_tier":"premium"}',
        supplementary_data: { related_ids: { order_id: "5O190127TN364715T" } },
      },
    });
    expect(r.success).toBe(true);
  });

  it("accepts a minimal event (all fields optional — legacy defaults)", () => {
    expect(paypalWebhookEventSchema.safeParse({}).success).toBe(true);
  });

  it("rejects non-object events (legacy: reads defaulted → 200 log — the sanctioned hostile-shape class)", () => {
    expect(paypalWebhookEventSchema.safeParse("string").success).toBe(false);
    expect(paypalWebhookEventSchema.safeParse([1, 2]).success).toBe(false);
    expect(paypalWebhookEventSchema.safeParse(5).success).toBe(false);
  });

  it("rejects wrong-typed inner fields (legacy: truthy object slipped into the log switch)", () => {
    expect(paypalWebhookEventSchema.safeParse({ event_type: 123 }).success).toBe(false);
    expect(paypalWebhookEventSchema.safeParse({ resource: "not-an-object" }).success).toBe(false);
    expect(
      paypalWebhookEventSchema.safeParse({
        resource: { supplementary_data: { related_ids: { order_id: 9 } } },
      }).success,
    ).toBe(false);
  });
});

describe("adminAccountFlagBodySchema — PATCH /api/admin/accounts (Wave 3)", () => {
  it("accepts the real toggle payload", () => {
    const r = adminAccountFlagBodySchema.safeParse({
      user_id: "123e4567-e89b-12d3-a456-426614174000",
      is_test_account: true,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing/non-boolean flag (route re-derives «user_id و is_test_account مطلوبان» verbatim)", () => {
    expect(adminAccountFlagBodySchema.safeParse({ user_id: "abc" }).success).toBe(false);
    expect(adminAccountFlagBodySchema.safeParse({ user_id: "abc", is_test_account: "yes" }).success).toBe(false);
  });

  it("rejects non-string user_id (legacy String() coercion matched no row → ok:true no-op — now fail-fast)", () => {
    expect(adminAccountFlagBodySchema.safeParse({ user_id: 123, is_test_account: true }).success).toBe(false);
  });
});

describe("adminAccountDeleteBodySchema — DELETE /api/admin/accounts (Wave 3)", () => {
  it("accepts the legacy single-id shape AND the mobile batch shape", () => {
    expect(adminAccountDeleteBodySchema.safeParse({ user_id: "abc" }).success).toBe(true);
    expect(adminAccountDeleteBodySchema.safeParse({ user_ids: ["a", "b", "c"] }).success).toBe(true);
  });

  it("item shapes stay OPEN (the route's map(String)→filter(Boolean) normalization is legacy policy)", () => {
    expect(adminAccountDeleteBodySchema.safeParse({ user_ids: [123, null, "x"] }).success).toBe(true);
  });

  it("bounds the batch at a hostile ceiling above the route's own 100-row cap (legacy 400 stays operative)", () => {
    expect(adminAccountDeleteBodySchema.safeParse({ user_ids: Array(201).fill("x") }).success).toBe(false);
    expect(adminAccountDeleteBodySchema.safeParse({ user_ids: Array(100).fill("x") }).success).toBe(true);
  });
});

describe("adminAssignPairBodySchema — PATCH assignments · POST site-assignments (Wave 3)", () => {
  it("accepts the real pair payload", () => {
    const r = adminAssignPairBodySchema.safeParse({
      client_id: "123e4567-e89b-12d3-a456-426614174000",
      coach_id: "223e4567-e89b-12d3-a456-426614174001",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing ids (routes re-derive the Arabic required-messages verbatim)", () => {
    expect(adminAssignPairBodySchema.safeParse({ client_id: "x" }).success).toBe(false);
    expect(adminAssignPairBodySchema.safeParse({}).success).toBe(false);
    expect(adminAssignPairBodySchema.safeParse({ client_id: "x", coach_id: 5 }).success).toBe(false);
  });
});

describe("adminBlogCleanupBodySchema — POST /api/admin/blog/cleanup (Wave 3)", () => {
  it("accepts {} (default dry_run=true) and { dry_run: false }", () => {
    expect(adminBlogCleanupBodySchema.safeParse({}).success).toBe(true);
    expect(adminBlogCleanupBodySchema.safeParse({ dry_run: false }).success).toBe(true);
  });

  it("rejects non-boolean dry_run (legacy silently meant true) and hostile non-object JSON", () => {
    expect(adminBlogCleanupBodySchema.safeParse({ dry_run: "false" }).success).toBe(false);
    expect(adminBlogCleanupBodySchema.safeParse([1]).success).toBe(false);
    expect(adminBlogCleanupBodySchema.safeParse("x").success).toBe(false);
  });
});

describe("adminCoachKindBodySchema · adminCoachNotifyBodySchema (Wave 3)", () => {
  it("kind enum IS the legacy check — wrong kinds reject (verbatim re-derivation)", () => {
    expect(adminCoachKindBodySchema.safeParse({ coach_id: "a", coach_kind: "site" }).success).toBe(true);
    expect(adminCoachKindBodySchema.safeParse({ coach_id: "a", coach_kind: "b2b" }).success).toBe(true);
    expect(adminCoachKindBodySchema.safeParse({ coach_id: "a", coach_kind: "other" }).success).toBe(false);
    expect(adminCoachKindBodySchema.safeParse({ coach_id: "a", coach_kind: 5 }).success).toBe(false);
  });

  it("notify trims and requires a coach_id (legacy «coach_id مطلوب» re-derived)", () => {
    const r = adminCoachNotifyBodySchema.safeParse({ coach_id: "  abc  " });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.coach_id).toBe("abc");
    expect(adminCoachNotifyBodySchema.safeParse({ coach_id: "   " }).success).toBe(false);
    expect(adminCoachNotifyBodySchema.safeParse({}).success).toBe(false);
  });
});

describe("adminCoachPageReviewBodySchema — PATCH /api/admin/coach-pages (Wave 3)", () => {
  it("accepts approve (no note) and reject (with note)", () => {
    expect(adminCoachPageReviewBodySchema.safeParse({ coach_id: "a", action: "approve" }).success).toBe(true);
    expect(
      adminCoachPageReviewBodySchema.safeParse({ coach_id: "a", action: "reject", note: "  المحتوى قصير جدًا " }).success,
    ).toBe(true);
  });

  it("rejects wrong action (route re-derives the Arabic required-message verbatim)", () => {
    expect(adminCoachPageReviewBodySchema.safeParse({ coach_id: "a", action: "delete" }).success).toBe(false);
  });

  it("note ceiling = the route's slice(0,500) point (silent-truncate → 400, P1-7)", () => {
    expect(
      adminCoachPageReviewBodySchema.safeParse({ coach_id: "a", action: "reject", note: "x".repeat(501) }).success,
    ).toBe(false);
    expect(
      adminCoachPageReviewBodySchema.safeParse({ coach_id: "a", action: "reject", note: "x".repeat(500) }).success,
    ).toBe(true);
  });
});

describe("adminCoachSupportReplyBodySchema — POST /api/admin/coach-support (Wave 3)", () => {
  it("accepts the real reply payload", () => {
    const r = adminCoachSupportReplyBodySchema.safeParse({
      parent_id: "123e4567-e89b-12d3-a456-426614174000",
      body: "  تم حل المشكلة  ",
      close: true,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.body).toBe("تم حل المشكلة");
  });

  it("rejects empty/oversize body (route re-derives «اكتب ردك الأول»; ceiling = slice(0,4000))", () => {
    expect(
      adminCoachSupportReplyBodySchema.safeParse({ parent_id: "x", body: "  " }).success,
    ).toBe(false);
    expect(
      adminCoachSupportReplyBodySchema.safeParse({ parent_id: "x", body: "y".repeat(4001) }).success,
    ).toBe(false);
  });

  it("parent_id is a bounded STRING not z.uuid (UUID_RE stays route policy)", () => {
    expect(adminCoachSupportReplyBodySchema.safeParse({ parent_id: "not-a-uuid", body: "text" }).success).toBe(true);
  });

  it("close is type-pinned (legacy Boolean() coercion of truthy garbage now 400s)", () => {
    expect(adminCoachSupportReplyBodySchema.safeParse({ parent_id: "x", body: "t", close: "yes" }).success).toBe(false);
  });
});

describe("externalPlanActionBodySchema — POST /api/admin/external-plans actions (Wave 3)", () => {
  it("accepts the real regenerate_meal payload (numeric-string index = numOr coercion)", () => {
    const r = externalPlanActionBodySchema.safeParse({
      action: "regenerate_meal",
      id: "123e4567-e89b-12d3-a456-426614174000",
      meal_index: "2",
    });
    expect(r.success).toBe(true);
  });

  it("accepts item_index and version_index (all four index fields covered)", () => {
    expect(
      externalPlanActionBodySchema.safeParse({ action: "regenerate_item", id: "x", meal_index: 1, item_index: 2 }).success,
    ).toBe(true);
    expect(externalPlanActionBodySchema.safeParse({ action: "restore_version", id: "x", version_index: 0 }).success).toBe(true);
  });

  it("rejects object indexes (legacy numOr → NaN → default −1 → per-action 400s re-derived)", () => {
    expect(
      externalPlanActionBodySchema.safeParse({ action: "regenerate_meal", id: "x", meal_index: {} }).success,
    ).toBe(false);
  });

  it("rejects non-string action (dispatch stays raw; hostile shape now 400)", () => {
    expect(externalPlanActionBodySchema.safeParse({ action: 123, id: "x" }).success).toBe(false);
  });
});

describe("externalPlanCreateBodySchema — POST /api/admin/external-plans create (Wave 3)", () => {
  it("accepts the real AI meal brief", () => {
    const r = externalPlanCreateBodySchema.safeParse({
      person_name: "محمد",
      plan_type: "meal",
      ai: true,
      meal: { meals_count: 4, calories: 2200, diet_type: "متوازن", person_data: { weight: 80 } },
      details: "بدون مكسرات",
    });
    expect(r.success).toBe(true);
  });

  it("accepts the legacy manual payload", () => {
    const r = externalPlanCreateBodySchema.safeParse({
      person_name: "محمد",
      plan_type: "workout",
      title: "خطة تمرين منزلية",
      text: "x".repeat(50),
    });
    expect(r.success).toBe(true);
  });

  it("layering: ai and status stay OPEN dispatch fields (=== true / === 'draft' route policy)", () => {
    expect(externalPlanCreateBodySchema.safeParse({ person_name: "محمد", plan_type: "meal", ai: "yes", status: 5 }).success).toBe(true);
  });

  it("layering: meal/workout stay OPEN (route's typeof-object defaulting)", () => {
    expect(externalPlanCreateBodySchema.safeParse({ person_name: "محم", plan_type: "meal", meal: "not-an-object" }).success).toBe(true);
  });

  it("rejects short/oversize person_name (route re-derives «اسم الشخص مطلوب…» verbatim)", () => {
    expect(externalPlanCreateBodySchema.safeParse({ person_name: "م", plan_type: "meal" }).success).toBe(false);
    expect(externalPlanCreateBodySchema.safeParse({ person_name: "x".repeat(201), plan_type: "meal" }).success).toBe(false);
  });

  it("rejects wrong plan_type (route re-derives «نوع الخطة لازم يكون workout أو meal» verbatim)", () => {
    expect(externalPlanCreateBodySchema.safeParse({ person_name: "محمد", plan_type: "diet" }).success).toBe(false);
  });

  it("text ceiling = the route's MAX_TEXT slice point (silent-truncate → 400)", () => {
    expect(externalPlanCreateBodySchema.safeParse({ person_name: "محمد", plan_type: "meal", text: "x".repeat(100_001) }).success).toBe(false);
  });
});

describe("externalPlanPatchBodySchema — PATCH /api/admin/external-plans (Wave 3)", () => {
  it("accepts a single-field patch", () => {
    expect(externalPlanPatchBodySchema.safeParse({ id: "abc", title: "عنوان جديد" }).success).toBe(true);
  });

  it("rejects missing id (route re-derives «id مطلوب» verbatim)", () => {
    expect(externalPlanPatchBodySchema.safeParse({ title: "x" }).success).toBe(false);
  });

  it("rejects wrong-typed optional fields (routes re-derive each Arabic message verbatim)", () => {
    expect(externalPlanPatchBodySchema.safeParse({ id: "a", person_name: "م" }).success).toBe(false);
    expect(externalPlanPatchBodySchema.safeParse({ id: "a", plan_type: "diet" }).success).toBe(false);
    expect(externalPlanPatchBodySchema.safeParse({ id: "a", title: "ab" }).success).toBe(false);
    expect(externalPlanPatchBodySchema.safeParse({ id: "a", status: "archived" }).success).toBe(false);
  });

  it("person_contact has NO min (legacy: empty string → null)", () => {
    expect(externalPlanPatchBodySchema.safeParse({ id: "a", person_contact: "" }).success).toBe(true);
  });
});

describe("uuidQueryIdSchema — DELETE external-plans · DELETE leads (Wave 3)", () => {
  const uuid = "123e4567-e89b-12d3-a456-426614174000";

  it("accepts a real row uuid (case-insensitive like the legacy UUID_RE /i)", () => {
    expect(uuidQueryIdSchema.safeParse(uuid).success).toBe(true);
    expect(uuidQueryIdSchema.safeParse(uuid.toUpperCase()).success).toBe(true);
  });

  it("rejects garbage ids (legacy silent no-op 200 — the sanctioned 2B fail-fast class)", () => {
    expect(uuidQueryIdSchema.safeParse("garbage").success).toBe(false);
    expect(uuidQueryIdSchema.safeParse("").success).toBe(false);
  });
});

describe("adminLeadPatchBodySchema — PATCH /api/admin/leads (Wave 3)", () => {
  it("accepts the real flag flip", () => {
    expect(adminLeadPatchBodySchema.safeParse({ id: "abc", contacted: true }).success).toBe(true);
  });

  it("rejects missing id (route re-derives «id is required» verbatim)", () => {
    expect(adminLeadPatchBodySchema.safeParse({ contacted: true }).success).toBe(false);
  });

  it("flags are type-pinned booleans (legacy typeof silently ignored non-booleans)", () => {
    expect(adminLeadPatchBodySchema.safeParse({ id: "a", contacted: "yes" }).success).toBe(false);
  });
});

describe("adminRefundDecisionBodySchema — POST /api/admin/refunds (Wave 3, §7)", () => {
  it("accepts approve/reject with an optional note", () => {
    expect(adminRefundDecisionBodySchema.safeParse({ id: "abc", action: "approve" }).success).toBe(true);
    expect(adminRefundDecisionBodySchema.safeParse({ id: "abc", action: "reject", note: "سبب" }).success).toBe(true);
  });

  it("rejects wrong action (route re-derives «id + action (approve|reject) required» verbatim)", () => {
    expect(adminRefundDecisionBodySchema.safeParse({ id: "abc", action: "refund" }).success).toBe(false);
    expect(adminRefundDecisionBodySchema.safeParse({ action: "approve" }).success).toBe(false);
  });

  it("note gets a generous ceiling (legacy had none — hostile multi-MB now 400)", () => {
    expect(adminRefundDecisionBodySchema.safeParse({ id: "a", action: "reject", note: "x".repeat(2001) }).success).toBe(false);
  });
});

describe("adminSiteUnassignBodySchema — DELETE /api/admin/site-assignments (Wave 3)", () => {
  const uuid = "123e4567-e89b-12d3-a456-426614174000";

  it("accepts either-or keys (the two real caller shapes)", () => {
    expect(adminSiteUnassignBodySchema.safeParse({ client_id: uuid }).success).toBe(true);
    expect(adminSiteUnassignBodySchema.safeParse({ id: uuid }).success).toBe(true);
  });

  it("rejects both-absent (route re-derives «client_id أو id مطلوب» verbatim)", () => {
    // The either-or law is ROUTE policy (the 2B tickets precedent: both
    // keys optional at the gate, the path check stays in the route) — {}
    // passes the gate and the route's post-gate either-or check fires the
    // legacy 400. Garbage-typed keys DO fail the gate.
    expect(adminSiteUnassignBodySchema.safeParse({}).success).toBe(true);
    expect(adminSiteUnassignBodySchema.safeParse({ client_id: 5 }).success).toBe(false);
  });

  it("rejects garbage ids (legacy silent no-op 200 — the 2B fail-fast class)", () => {
    expect(adminSiteUnassignBodySchema.safeParse({ client_id: "garbage" }).success).toBe(false);
  });
});

describe("adminStaffInviteBodySchema · adminStaffDemoteBodySchema (Wave 3)", () => {
  it("invite accepts the real payload and normalizes the email shape", () => {
    const r = adminStaffInviteBodySchema.safeParse({ email: "  Coach@Example.COM ", full_name: "أحمد" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("coach@example.com");
  });

  it("invite: email SHAPE only — a poorly-formatted email PASSES the gate and the route's EMAIL_RE kills it (the 2A register precedent)", () => {
    expect(adminStaffInviteBodySchema.safeParse({ email: "not-an-email" }).success).toBe(true);
    expect(adminStaffInviteBodySchema.safeParse({ email: "ab" }).success).toBe(false);
    expect(adminStaffInviteBodySchema.safeParse({ email: 5 }).success).toBe(false);
    expect(adminStaffInviteBodySchema.safeParse({ email: "x".repeat(255) }).success).toBe(false);
  });

  it("full_name ceiling = the route's slice(0,120) point", () => {
    expect(adminStaffInviteBodySchema.safeParse({ email: "a@b.co", full_name: "x".repeat(121) }).success).toBe(false);
  });

  it("demote: the literal IS the legacy check — every failure re-derives the Arabic message", () => {
    expect(adminStaffDemoteBodySchema.safeParse({ user_id: "abc", action: "demote" }).success).toBe(true);
    expect(adminStaffDemoteBodySchema.safeParse({ user_id: "abc", action: "promote" }).success).toBe(false);
    expect(adminStaffDemoteBodySchema.safeParse({ action: "demote" }).success).toBe(false);
  });
});

describe("adminWalletAdjustBodySchema — POST /api/admin/wallets/adjust (Wave 3, §7)", () => {
  it("accepts the real adjustment (negative correction + Arabic note)", () => {
    const r = adminWalletAdjustBodySchema.safeParse({
      coach_id: "123e4567-e89b-12d3-a456-426614174000",
      amount: -5,
      note: "تصحيح رصيد بالخطأ",
    });
    expect(r.success).toBe(true);
  });

  it("coach_id is a bounded STRING not z.uuid (UUID_RE «مدرب غير صحيح» stays route policy)", () => {
    expect(adminWalletAdjustBodySchema.safeParse({ coach_id: "not-a-uuid", amount: 5, note: "x" }).success).toBe(true);
  });

  it("rejects empty/oversize note (route re-derives bad_note verbatim; ceiling = slice(0,300))", () => {
    expect(adminWalletAdjustBodySchema.safeParse({ coach_id: "a", amount: 5, note: "   " }).success).toBe(false);
    expect(adminWalletAdjustBodySchema.safeParse({ coach_id: "a", amount: 5, note: "x".repeat(301) }).success).toBe(false);
  });

  it("amount keeps the number|string union (legacy Number() coercion preserved)", () => {
    expect(adminWalletAdjustBodySchema.safeParse({ coach_id: "a", amount: "-5", note: "x" }).success).toBe(true);
    expect(adminWalletAdjustBodySchema.safeParse({ coach_id: "a", amount: {}, note: "x" }).success).toBe(false);
  });
});

describe("adminTopupReviewBodySchema — PATCH /api/admin/wallets/topups (Wave 3, §7)", () => {
  it("accepts approve with an optional admin_note", () => {
    expect(adminTopupReviewBodySchema.safeParse({ id: "123e4567-e89b-12d3-a456-426614174000", action: "approve", admin_note: "تم" }).success).toBe(true);
  });

  it("rejects wrong action (route re-derives bad_action «الإجراء غير معروف» verbatim)", () => {
    expect(adminTopupReviewBodySchema.safeParse({ id: "x", action: "delete" }).success).toBe(false);
  });

  it("id is a bounded STRING (UUID_RE «طلب غير صحيح» stays route policy)", () => {
    expect(adminTopupReviewBodySchema.safeParse({ id: "not-a-uuid", action: "approve" }).success).toBe(true);
  });
});

describe("adminNotificationBodySchema — POST /api/notifications/admin (Wave 3)", () => {
  it("accepts the real new_ticket bell payload", () => {
    const r = adminNotificationBodySchema.safeParse({
      type: "new_ticket",
      title: "تذكرة دعم جديدة",
      body: "عميل فتح تذكرة",
      link: "/admin/support",
      clientId: "123e4567-e89b-12d3-a456-426614174000",
    });
    expect(r.success).toBe(true);
  });

  it("the enum IS the legacy ALLOWED_TYPES allowlist (five values pinned)", () => {
    expect([...ADMIN_NOTIF_TYPES].length).toBe(5);
    expect(adminNotificationBodySchema.safeParse({ type: "arbitrary_injection", title: "x" }).success).toBe(false);
  });

  it("rejects missing title (route re-derives «Missing type or title» verbatim)", () => {
    expect(adminNotificationBodySchema.safeParse({ type: "new_ticket" }).success).toBe(false);
  });

  it("body/link ceilings = the route's own slices (1000/200)", () => {
    expect(adminNotificationBodySchema.safeParse({ type: "new_ticket", title: "x", body: "y".repeat(1001) }).success).toBe(false);
    expect(adminNotificationBodySchema.safeParse({ type: "new_ticket", title: "x", link: "y".repeat(201) }).success).toBe(false);
  });
});

describe("cronBlogP0QuerySchema — GET /api/cron/blog/p0-research (Wave 3)", () => {
  it("accepts the real automatic run (lang only)", () => {
    expect(cronBlogP0QuerySchema.safeParse({ lang: "en" }).success).toBe(true);
  });

  it("accepts a coach-triggered run (topic + job_id)", () => {
    expect(cronBlogP0QuerySchema.safeParse({ lang: "ar", topic: "بروتين ما بعد التمرين", job_id: "job-123" }).success).toBe(true);
  });

  it("short topics still PASS the gate (the ≥10-char honoring law stays route policy)", () => {
    expect(cronBlogP0QuerySchema.safeParse({ lang: "en", topic: "short" }).success).toBe(true);
  });

  it("rejects garbage lang (route re-derives «Missing/invalid ?lang= parameter…» verbatim)", () => {
    expect(cronBlogP0QuerySchema.safeParse({ lang: "fr" }).success).toBe(false);
    expect(cronBlogP0QuerySchema.safeParse({}).success).toBe(false);
  });

  it("topic/job_id ceilings = the route's own slice points (silent-truncate → 400, P1-7)", () => {
    expect(cronBlogP0QuerySchema.safeParse({ lang: "en", topic: "x".repeat(MAX_CRON_TOPIC + 1) }).success).toBe(false);
    expect(cronBlogP0QuerySchema.safeParse({ lang: "en", job_id: "x".repeat(MAX_CRON_JOB_ID + 1) }).success).toBe(false);
  });
});

describe("cronBlogQueueQuerySchema — the five blog pipeline GET routes p1..p5 (Wave 3)", () => {
  it("accepts a real queueId and trims it", () => {
    const r = cronBlogQueueQuerySchema.safeParse({ queueId: "  123e4567-e89b-12d3-a456-426614174000 " });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.queueId).toBe("123e4567-e89b-12d3-a456-426614174000");
  });

  it("rejects missing/empty (route re-derives «Missing queueId query parameter» verbatim)", () => {
    expect(cronBlogQueueQuerySchema.safeParse({}).success).toBe(false);
    expect(cronBlogQueueQuerySchema.safeParse({ queueId: "   " }).success).toBe(false);
    expect(cronBlogQueueQuerySchema.safeParse({ queueId: null }).success).toBe(false);
  });

  it("rejects oversized garbage (fail-fast BEFORE the doomed DB roundtrip)", () => {
    expect(cronBlogQueueQuerySchema.safeParse({ queueId: "x".repeat(101) }).success).toBe(false);
  });
});

describe("affiliateCommissionBodySchema — POST /api/affiliate/commission (Wave 3, §7)", () => {
  it("accepts the real manual-approval commission payload", () => {
    const r = affiliateCommissionBodySchema.safeParse({
      userId: "123e4567-e89b-12d3-a456-426614174000",
      amount: 14.99,
      reference: "req-991",
      productId: "premium",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing/garbage fields (route re-derives the legacy bad_request 400 verbatim)", () => {
    expect(affiliateCommissionBodySchema.safeParse({ userId: "x", amount: 5 }).success).toBe(false);
    expect(affiliateCommissionBodySchema.safeParse({ reference: "x", amount: 5 }).success).toBe(false);
    expect(affiliateCommissionBodySchema.safeParse({ userId: "x", reference: "y" }).success).toBe(false);
  });

  it("amount keeps the number|string union (legacy Number() coercion)", () => {
    expect(affiliateCommissionBodySchema.safeParse({ userId: "x", amount: "14.99", reference: "y" }).success).toBe(true);
    expect(affiliateCommissionBodySchema.safeParse({ userId: "x", amount: [5], reference: "y" }).success).toBe(false);
  });

  it("hostile: smuggled keys are STRIPPED (engine inputs can never be inflated)", () => {
    const r = affiliateCommissionBodySchema.safeParse({
      userId: "x",
      amount: 5,
      reference: "y",
      rate: 0.9,
      affiliate_user_id: "attacker",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).not.toHaveProperty("rate");
      expect(r.data).not.toHaveProperty("affiliate_user_id");
    }
  });
});

// ── I-4 (UX-TEST-REPORT-2026-09-21 §5-4 — «تسمية الخطط المولدة»): the
// member rename payload shares the save-evo title ceiling and the swap
// planId bounded-STRING law. ──
describe("memberPlanRenameBodySchema — POST /api/plans/member-edit mode:rename (I-4)", () => {
  it("accepts a valid rename payload and trims the title", () => {
    const r = memberPlanRenameBodySchema.safeParse({
      planId: "  plan-row-1  ",
      title: "  My cutting week  ",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.planId).toBe("plan-row-1");
      expect(r.data.title).toBe("My cutting week");
    }
  });

  it("rejects titles below 3 chars and above the MAX_MEMBER_PLAN_TITLE ceiling", () => {
    expect(
      memberPlanRenameBodySchema.safeParse({ planId: "p1", title: "ab" }).success,
    ).toBe(false);
    expect(
      memberPlanRenameBodySchema.safeParse({ planId: "p1", title: "x".repeat(MAX_MEMBER_PLAN_TITLE + 1) }).success,
    ).toBe(false);
    expect(
      memberPlanRenameBodySchema.safeParse({ planId: "p1", title: "x".repeat(MAX_MEMBER_PLAN_TITLE) }).success,
    ).toBe(true);
  });

  it("rejects an empty/oversize planId (the swap 404-policy stays)", () => {
    expect(memberPlanRenameBodySchema.safeParse({ planId: "", title: "Valid name" }).success).toBe(false);
    expect(
      memberPlanRenameBodySchema.safeParse({ planId: "p".repeat(101), title: "Valid name" }).success,
    ).toBe(false);
  });

  it("rejects missing keys and non-string shapes", () => {
    expect(memberPlanRenameBodySchema.safeParse({}).success).toBe(false);
    expect(memberPlanRenameBodySchema.safeParse({ planId: 5, title: "Valid name" }).success).toBe(false);
    expect(memberPlanRenameBodySchema.safeParse({ planId: "p1", title: 42 }).success).toBe(false);
  });
});
