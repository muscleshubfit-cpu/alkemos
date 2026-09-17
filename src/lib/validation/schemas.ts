import { z } from "zod";

/**
 * CENTRAL REQUEST VALIDATION — Zod schemas (Phase 141 / audit A-7,
 * wave 1, 2026-09-07 · P1-7 bounded inserts 2026-09-16 · Wave 2A
 * coach/* boundaries 2026-09-17 · Wave 2B user-side boundaries
 * 2026-09-17).
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

// ── VERCEL-USAGE cleanup (2026-09-16): exerciseNameSchema removed with
//    its only consumer /api/exercise-image (dead route — zero callers
//    since Batch 2 self-hosted exercise images under /images/exercises/;
//    it burned an unauthenticated function invocation + 2 outbound
//    wger.de fetches per cold name). Supersedes the deep-audit P3-11
//    «rate-limit exercise-image» half — deletion is strictly cleaner. ──

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

// ── Wave 2A (2026-09-17): the coach/* write boundaries — the «مسارات
//    المدرب» half of the original 3-wave plan (wave 1 = Phase 141 public
//    routes; the P1-7 bounded inserts covered save-result/save-meal-plan/
//    broadcast; Wave 2B = user-side routes; Wave 3 = payment/admin/cron,
//    NOT opened). Same laws as waves 1 + P1-7: zod = shape/type/size +
//    unknown-key stripping; domain policy (cleanPhone, safeMediaUrl,
//    SLUG_RE, EMAIL_RE, wallet math, receipt ownership) stays in the
//    routes; every LEGACY failure class keeps its byte-identical
//    response via route-side re-derivation, and only NEW violations
//    (types, oversize, smuggled shapes) get fresh 400s. Ceilings equal
//    the routes' own slice points — the editor UI already enforces the
//    same maxLengths, so real users never hit them. ──

/** Coach full name (register + invite) — the routes' NAME_MAX/slice
 *  point; beyond it previously truncated silently, now 400. */
export const MAX_COACH_NAME_LEN = 120;
/** Register password hard ceiling — far above any real passphrase
 *  (bcrypt processes 72 bytes); a multi-KB "password" now 400s before
 *  the Supabase roundtrip. */
export const MAX_PASSWORD_LEN = 200;
/** Raw slug bound before the routes' SLUG_RE (which caps at 40) — a
 *  multi-KB slug fails at the gate and re-derives the legacy
 *  invalid_slug response. */
export const MAX_SLUG_RAW_LEN = 60;
/** Landing headline (AR + EN) — the editor's maxLength and the
 *  route's slice point. */
export const MAX_HEADLINE_LEN = 140;
/** Landing bio (AR + EN) — editor maxLength 4000, route slice point. */
export const MAX_BIO_LEN = 4000;
/** Specialties total string (joined) — the route's .slice(0, 800). */
export const MAX_SPECIALTIES_TOTAL = 800;
/** Specialties array: item count / per-item length — the route maps
 *  String(s).slice(0, 80) per item before joining. */
export const MAX_SPECIALTY_ITEMS = 100;
export const MAX_SPECIALTY_ITEM_LEN = 80;
/** Raw URL fields before the safeSocialUrl/safeMediaUrl POLICY (which
 *  keeps its own 300/500 slices + https/origin rules) — generous so
 *  the policy, not zod, decides drop-vs-keep. */
export const MAX_SOCIAL_URL_RAW = 600;
/** Structured media arrays: zod bounds COUNT/type only; the routes'
 *  own slice(0,6)/slice(0,8) + per-item drop policy keep exact legacy
 *  semantics (a hostile item is dropped, never stored). */
export const MAX_RESULTS_PHOTOS = 24;
export const MAX_CERTIFICATES = 24;
/** Raw WhatsApp input before safeWhatsappPhone normalization. */
export const MAX_WHATSAPP_RAW = 60;
/** Coach support thread subject/body — the routes' slice points. */
export const MAX_SUPPORT_SUBJECT = 140;
export const MAX_SUPPORT_BODY = 4000;
/** package_id raw bound — the allowlist lookup stays the policy. */
export const MAX_PACKAGE_ID_LEN = 100;
/** months/amount arrive as JSON numbers from the UI; the string union
 *  member preserves the routes' legacy Number() coercion for numeric
 *  strings, bounded against multi-KB garbage. */
export const MAX_AMOUNT_RAW = 100;
/** Activation note — the route's slice(0, 500) point. */
export const MAX_ACTIVATION_NOTE = 500;
/** Top-up note — the route's slice(0, 300) point. */
export const MAX_TOPUP_NOTE = 300;
/** Raw receipt path before the route's receipts/<uid>/ ownership gate
 *  (which keeps its own >500 rejection). */
export const MAX_RECEIPT_PATH_RAW = 600;

// ── POST /api/coach/register (PUBLIC self-registration) ──

/** website = the honeypot — it is consumed on the RAW body BEFORE the
 *  zod parse (bots filling it get the legacy fake-success), so its type
 *  is intentionally open. phone's only validator is the route's
 *  cleanPhone policy (invalid → null, legacy drop semantics). */
export const coachRegisterBodySchema = z.object({
  full_name: z.string().min(1).max(MAX_COACH_NAME_LEN),
  email: emailSchema,
  password: z.string().min(1).max(MAX_PASSWORD_LEN),
  phone: z.unknown().optional(),
  website: z.unknown().optional(),
});

export type CoachRegisterBody = z.infer<typeof coachRegisterBodySchema>;

// ── POST /api/coach/claim (client claims his coach's slug) ──

export const coachClaimBodySchema = z.object({
  slug: z.string().max(MAX_SLUG_RAW_LEN),
});

export type CoachClaimBody = z.infer<typeof coachClaimBodySchema>;

// ── POST /api/coach/clients/invite (staff invites an email) ──

export const coachInviteBodySchema = z.object({
  email: emailSchema,
  full_name: z.string().max(MAX_COACH_NAME_LEN).optional(),
});

export type CoachInviteBody = z.infer<typeof coachInviteBodySchema>;

// ── PUT /api/coach/landing (coach public page upsert) ──

/** Text ceilings = the editor's own maxLengths (zero real-user
 *  impact). results_photos/certificates: zod bounds COUNT only — the
 *  routes' slice+drop policy decides items (hostile items vanish,
 *  never stored). */
export const coachLandingBodySchema = z.object({
  slug: z.string().max(MAX_SLUG_RAW_LEN),
  headline: z.string().max(MAX_HEADLINE_LEN).optional(),
  bio: z.string().max(MAX_BIO_LEN).optional(),
  headline_en: z.string().max(MAX_HEADLINE_LEN).optional(),
  bio_en: z.string().max(MAX_BIO_LEN).optional(),
  specialties: z
    .union([
      z
        .array(z.string().max(MAX_SPECIALTY_ITEM_LEN))
        .max(MAX_SPECIALTY_ITEMS),
      z.string().max(MAX_SPECIALTIES_TOTAL),
    ])
    .optional(),
  specialties_en: z
    .union([
      z
        .array(z.string().max(MAX_SPECIALTY_ITEM_LEN))
        .max(MAX_SPECIALTY_ITEMS),
      z.string().max(MAX_SPECIALTIES_TOTAL),
    ])
    .optional(),
  is_published: z.boolean().optional(),
  photo_url: z.string().max(MAX_SOCIAL_URL_RAW).optional(),
  results_photos: z.array(z.unknown()).max(MAX_RESULTS_PHOTOS).optional(),
  certificates: z.array(z.unknown()).max(MAX_CERTIFICATES).optional(),
  instagram_url: z.string().max(MAX_SOCIAL_URL_RAW).optional(),
  facebook_url: z.string().max(MAX_SOCIAL_URL_RAW).optional(),
  tiktok_url: z.string().max(MAX_SOCIAL_URL_RAW).optional(),
  youtube_url: z.string().max(MAX_SOCIAL_URL_RAW).optional(),
  whatsapp_phone: z.string().max(MAX_WHATSAPP_RAW).optional(),
});

export type CoachLandingBody = z.infer<typeof coachLandingBodySchema>;

// ── POST /api/coach/support (staff thread) ──

export const coachSupportBodySchema = z.object({
  subject: z.string().trim().min(1).max(MAX_SUPPORT_SUBJECT),
  body: z.string().trim().min(1).max(MAX_SUPPORT_BODY),
});

export type CoachSupportBody = z.infer<typeof coachSupportBodySchema>;

// ── POST /api/coach/ads (wallet-debited ad subscription) ──

export const coachAdPackageBodySchema = z.object({
  package_id: z.string().max(MAX_PACKAGE_ID_LEN),
});

export type CoachAdPackageBody = z.infer<typeof coachAdPackageBodySchema>;

// ── POST /api/coach/subscriptions/activate (wallet + extend_subscription) ──

export const coachActivationBodySchema = z.object({
  client_id: z.string().max(100),
  tier: z.string().max(50),
  months: z.union([z.number(), z.string().max(MAX_AMOUNT_RAW)]),
  amount: z.union([z.number(), z.string().max(MAX_AMOUNT_RAW)]).nullish(),
  method: z.string().max(50).nullish(),
  note: z.string().max(MAX_ACTIVATION_NOTE).nullish(),
});

export type CoachActivationBody = z.infer<typeof coachActivationBodySchema>;

// ── POST /api/coach/wallet/topup (pending receipt request) ──

export const coachTopupBodySchema = z.object({
  amount: z.union([z.number(), z.string().max(MAX_AMOUNT_RAW)]),
  method: z.string().max(50),
  note: z.string().max(MAX_TOPUP_NOTE).nullish(),
  receipt_path: z.string().max(MAX_RECEIPT_PATH_RAW),
});

export type CoachTopupBody = z.infer<typeof coachTopupBodySchema>;

// ── Wave 2B (2026-09-17): the user-side write boundaries — the «مسارات
//    المستخدم» half of the original 3-wave plan (owner order «نفّذ Wave 2B
//    من خطة Zod الأصلية فقط: plans/member-edit · support/tickets · ai/ ·
//    tools/saved- DELETE»). Same laws as waves 1 + 2A: zod = shape/type/
//    size + trim + unknown-key stripping; domain policy (mode dispatch,
//    UUID_RE, ownership lookups, quotas, tier windows, kind→type mapping,
//    history drop/slice, guest-id hashing) stays in the routes. Every
//    LEGACY failure class is re-derived verbatim on gate failure by the
//    route; only NEW violations (wrong types, oversize, smuggled shapes)
//    get fresh 400s. Ceilings equal the routes' own slice points, so real
//    users never hit them. Completion (owner correction, same day): the
//    220 record wrongly attributed an exclusion of plans/normalize ·
//    subscription/cancel · refund/request to the owner order — the owner
//    excluded NOTHING from 2B; those three items joined below (221). Wave
//    3 (payment/admin/cron) stays not opened. ──

// ── POST /api/plans/member-edit (member plan writes — save-evo + swap) ──

/** save-evo title — the route's trim-then-slice(0,120) point; the EVO
 *  widget sends planRequest.slice(0,80), so real saves never reach it. */
export const MAX_MEMBER_PLAN_TITLE = 120;
/** save-evo text — the route's slice(0,20000) point (EVO plan messages
 *  are model outputs, an order of magnitude below it). */
export const MAX_MEMBER_PLAN_TEXT = 20_000;

/** save-evo payload (the mode dispatch itself stays route policy — the
 *  legacy trim-then-compare on `mode` decides the branch BEFORE the
 *  gate). kind keeps the legacy trim semantics via .trim() — the
 *  nutrition/meal→nutrition mapping stays in the route. */
export const memberSaveEvoBodySchema = z.object({
  kind: z
    .string()
    .trim()
    .refine(
      (k): k is "nutrition" | "meal" | "workout" =>
        ["nutrition", "meal", "workout"].includes(k),
      { message: "kind must be one of: nutrition, meal, workout" },
    ),
  title: z.string().trim().min(3).max(MAX_MEMBER_PLAN_TITLE),
  text: z
    .string()
    .max(MAX_MEMBER_PLAN_TEXT)
    .refine((t) => t.trim().length >= 20, {
      message: "text must be at least 20 characters",
    }),
});

export type MemberSaveEvoBody = z.infer<typeof memberSaveEvoBodySchema>;

/** swap payload. planId stays a bounded STRING (not z.uuid()): the
 *  route's ownership lookup and its 404 not_found class are the policy —
 *  a uuid pin would convert legacy 404s into 400s beyond the sanctioned
 *  classes. content is a plain object: arrays (which legacy `typeof`
 *  let slip into the plans row, corrupting the shape) now 400 — the
 *  sanctioned smuggled-shape tightening. */
export const memberSwapBodySchema = z.object({
  planId: z.string().trim().min(1).max(100),
  content: z.record(z.string(), z.unknown()),
});

export type MemberSwapBody = z.infer<typeof memberSwapBodySchema>;

// ── POST /api/support/tickets (member ticket creation + staff replies) ──

/** Member subject — the route's own 3..200 check (both bounds legacy
 *  400s, re-derived verbatim). */
export const MAX_TICKET_SUBJECT = 200;
/** Reply/message body — the route's MAX_BODY slice(0,4000) point;
 *  oversize was silently truncated at insert, now 400. */
export const MAX_TICKET_BODY = 4000;
/** Ticket status allowlist (the route re-derives «حالة غير معروفة»). */
export const TICKET_STATUSES = ["open", "pending", "closed"] as const;

/** The one POST body serves TWO paths split by route policy on the raw
 *  `ticketId` (absent + subject → member creation; present → staff
 *  reply), so every field is optional at the gate and the path checks
 *  stay in the route. ticketId is deliberately a bounded string —
 *  UUID_RE stays the route policy (the Wave 2A layering). */
export const supportTicketBodySchema = z.object({
  ticketId: z.string().trim().max(100).optional(),
  subject: z.string().trim().max(MAX_TICKET_SUBJECT).optional(),
  body: z.string().trim().max(MAX_TICKET_BODY).optional(),
  status: z
    .string()
    .trim()
    .max(50)
    .refine((s): s is (typeof TICKET_STATUSES)[number] =>
      (TICKET_STATUSES as readonly string[]).includes(s), {
      message: "حالة غير معروفة",
    })
    .optional(),
});

export type SupportTicketBody = z.infer<typeof supportTicketBodySchema>;

// ── POST /api/ai/jobs (enqueue envelope) ──

/** Raw type bound — anything else (including every non-string, which
 *  legacy coerced through String()) re-derives the legacy «Unknown job
 *  type» 400 verbatim. The JOB_GATE allowlist (isAiJobType) stays the
 *  route policy; payload stays unknown — sanitizeJobPayload inside
 *  enqueueAiJob is the payload policy, and the 40KB envelope cap (413)
 *  stays the route's own check. */
export const MAX_JOB_TYPE_LEN = 100;

export const aiJobEnqueueBodySchema = z.object({
  type: z.string().min(1).max(MAX_JOB_TYPE_LEN),
  payload: z.unknown().optional(),
});

export type AiJobEnqueueBody = z.infer<typeof aiJobEnqueueBodySchema>;

// ── POST /api/ai/chat (EVO chat envelope) ──

/** History array count — the route's own wire clamp
 *  (-slice to EVO_HISTORY_CAP_PAID = 16). A canary test pins the two
 *  constants equal. ITEM shapes stay open (z.unknown()): the route's
 *  filter+slice policy (drop non-string content, slice ≤2000 chars,
 *  map roles) keeps exact legacy semantics — the same law as the
 *  landing media arrays in Wave 2A (count bounded, items policy-owned). */
export const MAX_CHAT_HISTORY_ITEMS = 16;

/** EVO chat body. message is type-pinned + trim + non-empty — every
 *  failure re-derives the legacy «Missing message» 400 verbatim. The
 *  4000-char wire clamp stays ROUTE policy (the chat input has no
 *  client maxLength, so a zod ceiling would 400 real paste-heavy users
 *  — the clamp-and-process semantics are preserved, not tightened).
 *  guestId stays open (the register-phone precedent): the route's
 *  typeof-check + trim + slice(0,64) + salted-hash is the policy, and
 *  an invalid guest id falls back to the IP key, never fails the chat. */
export const evoChatBodySchema = z.object({
  message: z.string().trim().min(1),
  history: z.array(z.unknown()).max(MAX_CHAT_HISTORY_ITEMS).optional(),
  guestId: z.unknown().optional(),
});

export type EvoChatBody = z.infer<typeof evoChatBodySchema>;

// ── DELETE /api/tools/saved-results · /api/tools/saved-meal-plans ──

/** The `id` query param of the two DELETE routes. Missing → the legacy
 *  «Missing id» 400 (re-derived verbatim); present-but-garbage was a
 *  silent no-op 200 — now 400 before the doomed DB roundtrip (the
 *  sanctioned fail-fast class; ownership stays the route's
 *  .eq("user_id", auth.id) policy). */
export const savedToolDeleteIdSchema = z.uuid();

// ── Wave 2B COMPLETION (2026-09-17, phase 221): the three plan items the
//    220 record wrongly marked as excluded. Owner correction: NOTHING was
//    excluded from 2B — the full original 2B list is plans/member-edit ·
//    plans/normalize · support/tickets · ai/* · subscription/cancel ·
//    refund/request · tools/saved-* DELETE, and all of it is now gated.
//    Same laws as 220 — no new methodology. ──

// ── POST /api/plans/normalize (coach-pasted plan → structured JSON) ──

/** normalize payload. The legacy 400 classes live in the route and are
 *  re-derived VERBATIM on gate failure, in legacy precedence order
 *  (text first, then planType): «Missing required field: text» ·
 *  «planType must be 'nutrition' or 'workout'».
 *
 *  text has NO zod ceiling deliberately — the route has no slice point of
 *  its own (the chat-message precedent: plan-generator clamp-and-process
 *  rawText.slice(0,8000) is lib policy, and a rejecting ceiling would 400
 *  real paste-heavy coaches the route used to serve). clientId stays a
 *  bounded STRING, not z.uuid(): the UUID_RE test and its Arabic
 *  «افتح صفحة العميل...» 400 + the ownership 403 + the activation 402
 *  ladder are route policy — a uuid pin would convert that legacy ladder
 *  into zod 400s (the memberSwap planId precedent). */
export const planNormalizeBodySchema = z.object({
  text: z.string().trim().min(1),
  planType: z.enum(["nutrition", "workout"]),
  clientId: z.string().trim().max(100).optional(),
});

export type PlanNormalizeBody = z.infer<typeof planNormalizeBodySchema>;

// ── POST /api/subscription/cancel · POST /api/refund/request ──

/** Empty envelope for the two money-adjacent POST routes that consume NO
 *  request fields — every input is server-derived (session → eligibility
 *  lookups → service-role insert), so there is nothing to type, bound or
 *  trim. The gate pins the ENVELOPE only: real callers (profile page)
 *  send no body at all (the route maps a null/unparseable body to {}
 *  pre-gate) and any object passes with unknown keys stripped — identical
 *  to legacy ignore semantics. A hostile NON-object JSON body (array or
 *  scalar) was a silent no-op 200 in legacy and now 400s before the
 *  flow — the sanctioned saved-tool DELETE-id fail-fast class. The refund
 *  GET has no body — no gate (the planner-plan/quota precedent). The
 *  §7 money logic (eligibility, window, usage ledgers, inserts) is
 *  untouched — shape-only tightening, zero behavior delta for any body
 *  that was ever consumed (none was). */
export const emptyEnvelopeBodySchema = z.object({});

export type EmptyEnvelopeBody = z.infer<typeof emptyEnvelopeBodySchema>;
