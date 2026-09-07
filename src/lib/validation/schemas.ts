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
