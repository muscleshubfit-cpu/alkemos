import { z } from "zod";

/**
 * CENTRAL REQUEST VALIDATION — Zod schemas (Phase 141 / audit A-7,
 * wave 1, 2026-09-07).
 *
 * SECURITY.md §9.7 has mandated "zod schemas at the boundary of every
 * API route" since forever — but the repo had ZERO zod usage; routes
 * hand-rolled scattered checks (allowlist arrays, typeof guards,
 * silent slices). This module is the single home for the shared
 * schemas so routes can't drift apart again.
 *
 * LAYERING LAW (deliberate):
 *   - Zod (HERE): shape/type/size — string bounds, enums, trimming,
 *     unknown-key stripping, null/undefined handling.
 *   - Domain validators (validateEmailStrict, image-safety, etc.):
 *     POLICY — disposable-email rules, NSFW screening, breach checks.
 *     Routes call those AFTER the shape gate; they are NOT duplicated
 *     here.
 *
 * Backward-compat law (master order): existing success paths and
 * error messages/statuses are preserved EXACTLY. The documented
 * TIGHTENING: values that previously slipped through silently
 * (oversized names, garbage lang, 10KB query strings) now 400 —
 * hostile inputs must fail fast, not get sliced and stored.
 */

// ── Shared size bounds (single source of truth for the wave-1 routes) ──

export const MAX_EMAIL_LEN = 254;
export const MAX_NAME_LEN = 80;
export const MAX_QUERY_LEN = 100;
export const MAX_SUMMARY_LEN = 500;
export const MAX_RESULT_JSON_BYTES = 10 * 1024;

// ── P1-7 bounds (deep-audit 2026-09-16 — owner-approved §7 wave) ──

/** Saved-result / meal-plan / broadcast titles: 200 chars — the
 *  audit ceiling for the previously-unbounded `title` inserts. */
export const MAX_TITLE_LEN = 200;
/** Notification body (coach broadcast): a message paragraph, not a
 *  newsletter — 2000 chars. */
export const MAX_NOTIF_BODY_LEN = 2000;
/** Notification link: an internal site path or full URL — 500 chars. */
export const MAX_NOTIF_LINK_LEN = 500;
/** Meal-plan plan_data JSONB ceiling. Deliberately ABOVE the 10KB
 *  result_data cap: a legit coaching-tier plan (8 meals × N items,
 *  each carrying a per-100g macros object ≈ 115B) legitimately
 *  reaches low-tens-of-KB — 32KB bounds the insert without breaking
 *  real saves (calibration documented in worklog Phase 215). */
export const MAX_PLAN_JSON_BYTES = 32 * 1024;

// ── Atoms ──

/** ar/en — the site's only two locales. Garbage now 400s instead of
 *  falling through to a default silently. */
export const langSchema = z.enum(["ar", "en"]);

/** Email SHAPE only (trim + lowercase + sane length). Deliverability
 *  and disposable-domain POLICY stays in validateEmailStrict. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(MAX_EMAIL_LEN);

/** Optional display name: trimmed, bounded. */
export const optionalNameSchema = z
  .string()
  .trim()
  .max(MAX_NAME_LEN)
  .optional();

// ── /api/tools/lead (public, rate-limited lead capture) ──

/** Phase 72 tool allowlist — the seven slugs that may save leads. */
export const TOOL_SLUGS = [
  "calorie-calculator",
  "bmi-calculator",
  "macro-calculator",
  "body-fat-calculator",
  "water-tracker",
  "meal-planner",
  "newsletter",
] as const;

export const toolSlugSchema = z.enum(TOOL_SLUGS);

/**
 * POST body of /api/tools/lead. Unknown keys are STRIPPED (zod object
 * default) — a hostile client cannot smuggle extra columns into the
 * insert. result_json stays z.unknown(): the route applies the
 * 10KB cap before persisting (see MAX_RESULT_JSON_BYTES).
 */
export const leadBodySchema = z.object({
  tool_slug: toolSlugSchema,
  email: emailSchema,
  name: optionalNameSchema,
  result_summary: z.string().max(MAX_SUMMARY_LEN).optional(),
  result_json: z.unknown().optional(),
  lang: langSchema.optional(),
});

export type LeadBody = z.infer<typeof leadBodySchema>;

// ── Query-param atoms (GET routes) ──

/** Free-text search query: trimmed, non-empty, bounded (hostile
 *  multi-KB strings no longer flow into outbound URLs). */
export const searchQuerySchema = z
  .string()
  .trim()
  .min(1)
  .max(MAX_QUERY_LEN);

/** Exercise name param: trimmed, non-empty, bounded. */
export const exerciseNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(MAX_NAME_LEN);

// ── P1-7 (deep-audit 2026-09-16): bounded inserts for the three
//    previously-unbounded JSONB/text routes — save-result ·
//    save-meal-plan · notifications/broadcast. Backward-compat law
//    applies: every LEGACY failure class keeps its exact route
//    response (routes re-derive it when zod fails); only the NEW
//    ceiling violations get fresh 400s. ──

/** Bounded-JSON atom: measures the serialized payload length and
 *  rejects anything above `maxBytes` (a missing/undefined value also
 *  fails — routes map that back to the legacy "missing" response). */
const jsonBytesBounded = (maxBytes: number) =>
  z.unknown().refine(
    (v) => {
      try {
        const s = JSON.stringify(v);
        return typeof s === "string" && s.length <= maxBytes;
      } catch {
        return false;
      }
    },
    { message: `Payload exceeds the ${maxBytes}-byte limit` },
  );

// ── /api/tools/save-result (auth-gated, membership-limited) ──

/** The five calculator slugs that may persist a saved result — the
 *  route's own ALLOWED_TOOLS, now pinned at the boundary too. */
export const SAVED_RESULT_TOOL_SLUGS = [
  "calorie-calculator",
  "bmi-calculator",
  "macro-calculator",
  "body-fat-calculator",
  "water-tracker",
] as const;

/** POST body of /api/tools/save-result. result_data is shape-free
 *  (calculator outputs vary) but BYTE-BOUNDED (10KB, the same
 *  MAX_RESULT_JSON_BYTES the lead route applies). */
export const savedResultBodySchema = z.object({
  tool_slug: z.enum(SAVED_RESULT_TOOL_SLUGS),
  title: z.string().max(MAX_TITLE_LEN).optional(),
  result_data: jsonBytesBounded(MAX_RESULT_JSON_BYTES),
});

export type SavedResultBody = z.infer<typeof savedResultBodySchema>;

// ── /api/tools/save-meal-plan (auth-gated, tier-limited) ──

/** POST body of /api/tools/save-meal-plan. plan_data stays
 *  structurally permissive (the route's own meals/items walk is the
 *  legacy contract — meals without items are legal and stored); zod
 *  adds the title ceiling + the 32KB byte bound. */
export const savedMealPlanBodySchema = z.object({
  title: z.string().max(MAX_TITLE_LEN).optional(),
  plan_data: jsonBytesBounded(MAX_PLAN_JSON_BYTES),
});

export type SavedMealPlanBody = z.infer<typeof savedMealPlanBodySchema>;

// ── /api/notifications/broadcast (staff-gated) ──

export const BROADCAST_TARGETS = ["all", "selected", "single"] as const;

/** The multi-select userIds array gets a zod ceiling of 1000 — far
 *  above any real roster selection, far below hostile multi-MB
 *  arrays. The route's legacy silent slice(0, 500) is PRESERVED for
 *  arrays that pass (staff behavior untouched); >1000 now 400s. */
export const MAX_BROADCAST_RECIPIENTS = 1000;

/** POST body of /api/notifications/broadcast. Field ceilings apply
 *  to every caller (staff included) — they are SHAPE bounds, not
 *  quotas; the staff count-bypasses live elsewhere and are NOT
 *  touched (owner decree «الادمن بلا حدود» stays about counts). */
export const broadcastBodySchema = z.object({
  target: z.enum(BROADCAST_TARGETS),
  userId: z.uuid().optional(),
  userIds: z.array(z.uuid()).max(MAX_BROADCAST_RECIPIENTS).optional(),
  title: z.string().min(1).max(MAX_TITLE_LEN),
  body: z.string().min(1).max(MAX_NOTIF_BODY_LEN),
  link: z.string().max(MAX_NOTIF_LINK_LEN).optional(),
});

export type BroadcastBody = z.infer<typeof broadcastBodySchema>;
