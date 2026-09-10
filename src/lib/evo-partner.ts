/**
 * EVO-6 (W6) — partner API pure helpers (docs/EVO-MASTER-PLAN.md §4).
 *
 * WHAT IT IS: the pure, unit-tested surface behind /api/evo/v1/chat and
 * /admin/evo-partners — key generation/hashing, bearer extraction, the
 * white-label theme validator, request parsing, history bounding and the
 * abuse gates (message length, bounded history).
 *
 * SECURITY POSTURE (migration 0082):
 * - The RAW key is returned ONCE at creation and never persisted — only
 *   sha256(raw) lives in evo_api_keys. key_prefix (first 12 chars) exists
 *   for admin display only and can never authenticate.
 * - Theme values are WHITELISTED (accent = #hex, logo_url = https only,
 *   greetings bounded strings) — a partner can never inject markup/CSS
 *   beyond the five variables the widget consumes.
 * - The partner surface is GENERAL CONVERSATION ONLY (v1 boundary):
 *   plan/swap intents are rejected upstream (cost + abuse control), no
 *   subscriber context, no memory, no personal data ever reaches a
 *   partner request. detectEvoCrisis still guards every message.
 *
 * KEY FORMAT: `pk_live_` + 32 hex chars (crypto.randomBytes) — total 40.
 * Hash = sha256 hex of the raw string, matching the 0082 key_hash column.
 */

import { createHash, randomBytes } from "node:crypto";

export const PARTNER_KEY_PREFIX = "pk_live_";
/** Raw key length: prefix (8) + 32 hex chars = 40. */
export const PARTNER_KEY_TOTAL_LENGTH = 40;
/** Max chars of the key prefix stored/displayed (e.g. pk_live_ab12cd). */
export const PARTNER_KEY_PREFIX_DISPLAY = 12;

export type GeneratedPartnerKey = {
  /** The credential — shown ONCE, never stored. */
  raw: string;
  /** First PARTNER_KEY_PREFIX_DISPLAY chars — display only. */
  prefix: string;
  /** sha256 hex of raw — the ONLY material persisted (evo_api_keys.key_hash). */
  hash: string;
};

/** Generate a fresh partner key (raw + display prefix + sha256 hash). */
export function generatePartnerKey(): GeneratedPartnerKey {
  const raw = PARTNER_KEY_PREFIX + randomBytes(16).toString("hex");
  return {
    raw,
    prefix: raw.slice(0, PARTNER_KEY_PREFIX_DISPLAY),
    hash: hashPartnerKey(raw),
  };
}

/** sha256 hex of a raw key — mirrors the 0082 key_hash column. */
export function hashPartnerKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Shape-check a presented key WITHOUT hashing secrets needlessly: prefix
 * + charset + length. (The hash lookup in the route is the real gate.)
 */
export function isWellFormedPartnerKey(raw: string | null | undefined): raw is string {
  if (!raw) return false;
  if (!raw.startsWith(PARTNER_KEY_PREFIX)) return false;
  if (raw.length !== PARTNER_KEY_TOTAL_LENGTH) return false;
  return /^[0-9a-f]+$/.test(raw.slice(PARTNER_KEY_PREFIX.length));
}

/**
 * Extract the presented key from headers: `Authorization: Bearer pk_live_…`
 * first, then `x-api-key: pk_live_…` (both documented in the partner docs).
 */
export function extractPartnerKey(headers: {
  get(name: string): string | null;
}): string | null {
  const auth = headers.get("authorization");
  if (auth) {
    const m = /^Bearer\s+(.+)$/i.exec(auth.trim());
    if (m && m[1]) return m[1].trim();
  }
  const xKey = headers.get("x-api-key");
  return xKey ? xKey.trim() : null;
}

/* ------------------------------------------------------------------ */
/* White-label theme                                                   */
/* ------------------------------------------------------------------ */

export type PartnerTheme = {
  /** Accent color (#rgb/#rrggbb) — buttons + user bubble. */
  accent?: string;
  /** https-only logo URL rendered at the widget header. */
  logo_url?: string;
  /** Localized first-bubble greeting shown before the first message. */
  greeting_ar?: string;
  greeting_en?: string;
  /** Partner display label shown under "EVO" (≤ 60 chars, no markup). */
  partner_label?: string;
};

const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const HTTPS_URL_RE = /^https:\/\/[^\s"'<>]+$/i;

const THEME_STRING_LIMITS = {
  greeting_ar: 300,
  greeting_en: 300,
  partner_label: 60,
} as const;

/**
 * Validate/normalize a theme payload — WHITELIST-based: unknown keys are
 * dropped, values that fail their shape are rejected (not coerced), so a
 * partner can never smuggle markup, urls beyond https, or CSS injection
 * into the widget. Empty object is valid (= platform defaults).
 */
export function validatePartnerTheme(
  input: unknown,
): { ok: true; theme: PartnerTheme } | { ok: false; error: string } {
  if (input === undefined || input === null) return { ok: true, theme: {} };
  if (typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "theme must be an object" };
  }
  const out: PartnerTheme = {};
  const rec = input as Record<string, unknown>;

  if (rec.accent !== undefined) {
    if (typeof rec.accent !== "string" || !HEX_COLOR_RE.test(rec.accent)) {
      return { ok: false, error: "theme.accent must be a #hex color" };
    }
    out.accent = rec.accent.toLowerCase();
  }
  if (rec.logo_url !== undefined) {
    if (
      typeof rec.logo_url !== "string" ||
      !HTTPS_URL_RE.test(rec.logo_url) ||
      rec.logo_url.length > 500
    ) {
      return { ok: false, error: "theme.logo_url must be an https URL (≤500 chars)" };
    }
    out.logo_url = rec.logo_url;
  }
  for (const key of ["greeting_ar", "greeting_en", "partner_label"] as const) {
    if (rec[key] !== undefined) {
      if (typeof rec[key] !== "string") {
        return { ok: false, error: `theme.${key} must be a string` };
      }
      // Control-char strip (same defense as the transcript builders used
      // before the export feature) — markup arrives as inert text anyway
      // because the widget renders plain text, but we keep the ledger clean.
      const value = rec[key]
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
        .trim();
      if (value.length > THEME_STRING_LIMITS[key]) {
        return {
          ok: false,
          error: `theme.${key} must be ≤${THEME_STRING_LIMITS[key]} chars`,
        };
      }
      if (value.length > 0) out[key] = value;
    }
  }
  return { ok: true, theme: out };
}

/**
 * Theme → inline CSS variables for the embed widget. Pure: returns ONLY
 * the four safe variables the widget consumes — logo/greetings flow as
 * data (props), never as CSS, so even a hypothetically bad stored value
 * cannot become markup.
 */
export function themeToCssVars(theme: PartnerTheme): Record<string, string> {
  const vars: Record<string, string> = {};
  if (theme.accent) vars["--evo-accent"] = theme.accent;
  return vars;
}

/* ------------------------------------------------------------------ */
/* Chat request parsing + abuse gates                                  */
/* ------------------------------------------------------------------ */

export const PARTNER_MESSAGE_MAX_CHARS = 2000;
export const PARTNER_HISTORY_MAX_TURNS = 8;
export const PARTNER_HISTORY_ITEM_MAX_CHARS = 2000;

export type PartnerHistoryItem = { role: "user" | "assistant"; content: string };

export type ParsedPartnerChat = {
  message: string;
  history: PartnerHistoryItem[];
  language?: "ar" | "en";
};

/**
 * Parse/validate a partner chat body — { message, history?, language? }.
 * - message: required, trimmed, 1..PARTNER_MESSAGE_MAX_CHARS.
 * - history: ≤ PARTNER_HISTORY_MAX_TURNS most recent turns, roles
 *   restricted to user/assistant, contents trimmed and bounded.
 * - language: optional explicit override ('ar'|'en') — otherwise the
 *   route auto-detects from the message script.
 */
export function parsePartnerChatInput(
  body: unknown,
): { ok: true; value: ParsedPartnerChat } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const rec = body as Record<string, unknown>;

  if (typeof rec.message !== "string" || rec.message.trim().length === 0) {
    return { ok: false, error: "message is required" };
  }
  const message = rec.message.trim();
  if (message.length > PARTNER_MESSAGE_MAX_CHARS) {
    return {
      ok: false,
      error: `message must be ≤${PARTNER_MESSAGE_MAX_CHARS} chars`,
    };
  }

  let history: PartnerHistoryItem[] = [];
  if (rec.history !== undefined && rec.history !== null) {
    if (!Array.isArray(rec.history)) {
      return { ok: false, error: "history must be an array" };
    }
    const cleaned: PartnerHistoryItem[] = [];
    for (const item of rec.history) {
      if (
        typeof item !== "object" ||
        item === null ||
        Array.isArray(item)
      ) {
        return { ok: false, error: "history items must be objects" };
      }
      const h = item as Record<string, unknown>;
      if (h.role !== "user" && h.role !== "assistant") {
        return { ok: false, error: "history roles must be user|assistant" };
      }
      if (typeof h.content !== "string") {
        return { ok: false, error: "history contents must be strings" };
      }
      const content = h.content.trim().slice(0, PARTNER_HISTORY_ITEM_MAX_CHARS);
      if (content.length > 0) cleaned.push({ role: h.role, content });
    }
    history = cleaned.slice(-PARTNER_HISTORY_MAX_TURNS);
  }

  let language: "ar" | "en" | undefined;
  if (rec.language !== undefined && rec.language !== null) {
    if (rec.language !== "ar" && rec.language !== "en") {
      return { ok: false, error: "language must be 'ar' or 'en'" };
    }
    language = rec.language;
  }

  return { ok: true, value: { message, history, language } };
}

/**
 * Dominant-script language detection for the partner surface (same
 * philosophy as answerMatchesQuestionLanguage in evo-eval.ts): Arabic
 * script share ≥ 30% → 'ar', else 'en'. Brand names in Latin never flip
 * an Arabic message.
 */
export function detectPartnerLanguage(text: string): "ar" | "en" {
  const arabic = text.match(/[\u0600-\u06FF]/g)?.length ?? 0;
  const latin = text.match(/[A-Za-z]/g)?.length ?? 0;
  const total = arabic + latin;
  if (total === 0) return "en";
  return arabic / total >= 0.3 ? "ar" : "en";
}

/** Current-UTC-month start (ISO) — the quota window. */
export function currentMonthStartIso(now = new Date()): string {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
  ).toISOString();
}
