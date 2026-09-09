/**
 * src/lib/blog-pairing.ts — PHASE 157 · SEO-GEO-5.0 bilingual pairing core.
 *
 * Owner directive «نفذ توصيتك» = Proposal 1 of the bilingual generation
 * study: ONE daily topic → TWO queue rows (en + ar) sharing a `pair_id`
 * and a sealed `sharedBrief` inside each row's article_bundle. Each
 * language then executes its FULL P1→P5 pipeline BY ITSELF, in its own
 * geography-anchored window (AR 05:00 UTC · EN 22:00 UTC — the Phase 119
 * tables are preserved verbatim). Content is WRITTEN FROM SCRATCH per
 * language (topic + shared angle only — never translation): native
 * meta/keywords/FAQs per language, latin slugs (M15 law), per-language
 * dedup — the V3 per-language quality bar is untouched.
 *
 * PROTOCOL (P0): adopt → join → create, with a FULL degradation ladder.
 *   • ADOPT   : my language already has a researched row with pair_id +
 *               valid sharedBrief (≤48h) → reuse it (the other language's
 *               earlier window created my row for me).
 *   • JOIN    : the OTHER language's pair row exists (≤30h) but my side
 *               was never created (best-effort insert failed) → create MY
 *               row only, copying pair_id + sharedBrief from the twin.
 *   • CREATE  : I'm first → research BOTH languages + a small pairing
 *               call picks topicEn/topicAr/shared angle → insert TWO rows.
 *   • ANY failure (pairing call, validation, missing pair_id column =
 *               0076 not applied) → EXACT legacy V3 behavior: a single
 *               unpaired row. Blind pairing is FORBIDDEN — a wrong pair
 *               is worse than no pair.
 *
 * P5 HANDSHAKE: the later-published side fills its own linked_post_id AND
 * the twin's (bidirectional) — hreflang (blog-sitemap) + LanguageToggle
 * light up automatically per pair. Best-effort: never fails the publish.
 *
 * This module is intentionally split so every pure piece is unit-testable
 * without a DB (see __tests__/blog-pairing.test.ts — 22 tests).
 */
import { callFreeAIFallbackChain } from "./ai-provider";
import { parseJSONLoose, type LanguageResearch } from "./blog-research";
import { ARTICLE_ANGLES } from "./blog-pipeline";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

/** The sealed per-pair agreement stored in article_bundle.sharedBrief. */
export type SharedBrief = {
  pairId: string;
  topicEn: string;
  topicAr: string;
  /** One of ARTICLE_ANGLES ids — both twins build their outline around it. */
  angleId: string;
  /** ISO timestamp of when the brief was sealed (drives the freshness window). */
  sealedAt: string;
};

/** Structural view of a queue row needed for pairing decisions (tests feed literals). */
export type PairRowView = {
  id: string;
  language?: string | null;
  status?: string | null;
  pair_id?: string | null;
  created_at?: string | null;
};

export type PairingChoice = {
  topicEn: string;
  topicAr: string;
  angleId: string;
};

// ─────────────────────────────────────────────────────────────────
// Angle registry access (single source: ARTICLE_ANGLES in blog-pipeline)
// ─────────────────────────────────────────────────────────────────

export function isValidAngleId(id: unknown): id is string {
  return (
    typeof id === "string" && ARTICLE_ANGLES.some((a) => a.id === id)
  );
}

// ─────────────────────────────────────────────────────────────────
// Freshness windows (STATE 157 law: adopt ≤48h · join ≤30h)
// ─────────────────────────────────────────────────────────────────

export const ADOPT_MAX_AGE_HOURS = 48;
export const JOIN_MAX_AGE_HOURS = 30;

function ageHours(iso: string | null | undefined, now: Date): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return (now.getTime() - t) / 3_600_000;
}

// ─────────────────────────────────────────────────────────────────
// extractSharedBrief — read + fully validate a sealed brief
// ─────────────────────────────────────────────────────────────────

const MIN_TOPIC_CHARS = 10;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Extracts the sharedBrief from a queue row's article_bundle and validates
 * EVERY law: shape, uuid pairId, topic lengths, known angleId, freshness
 * (≤ maxAgeHours between sealedAt and `now`, injectable for tests).
 * Returns null for legacy rows, raw/garbage bundles, unknown angles and
 * stale briefs — callers degrade to the exact legacy V3 behavior.
 */
export function extractSharedBrief(
  bundle: unknown,
  opts?: { now?: Date; maxAgeHours?: number },
): SharedBrief | null {
  const now = opts?.now ?? new Date();
  const maxAgeHours = opts?.maxAgeHours ?? ADOPT_MAX_AGE_HOURS;

  // Raw text (double-encoded bundle or garbage) is NOT a brief.
  if (typeof bundle !== "object" || bundle === null || Array.isArray(bundle)) return null;
  const raw = (bundle as Record<string, unknown>).sharedBrief;
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;

  const b = raw as Record<string, unknown>;
  const pairId = typeof b.pairId === "string" ? b.pairId.trim() : "";
  const topicEn = typeof b.topicEn === "string" ? b.topicEn.trim() : "";
  const topicAr = typeof b.topicAr === "string" ? b.topicAr.trim() : "";
  const angleId = typeof b.angleId === "string" ? b.angleId.trim() : "";
  const sealedAt = typeof b.sealedAt === "string" ? b.sealedAt.trim() : "";

  if (!UUID_RE.test(pairId)) return null;
  if (topicEn.length < MIN_TOPIC_CHARS || topicAr.length < MIN_TOPIC_CHARS) return null;
  if (!isValidAngleId(angleId)) return null;

  const age = ageHours(sealedAt, now);
  if (age === null || age < 0 || age > maxAgeHours) return null;

  return { pairId, topicEn, topicAr, angleId, sealedAt };
}

// ─────────────────────────────────────────────────────────────────
// isAdoptablePairRow — structural adoptability check (no DB, pure)
// ─────────────────────────────────────────────────────────────────

/**
 * TRUE iff the row is MY language, still `researched`, carries a pair_id,
 * is well-formed, and was created within the freshness window (≤48h by
 * default — injectable `now`/`maxAgeHours` keep this deterministic in
 * tests). The brief itself is validated separately (extractSharedBrief).
 */
export function isAdoptablePairRow(
  row: unknown,
  myLang: "en" | "ar",
  opts?: { now?: Date; maxAgeHours?: number },
): boolean {
  const now = opts?.now ?? new Date();
  const maxAgeHours = opts?.maxAgeHours ?? ADOPT_MAX_AGE_HOURS;

  if (typeof row !== "object" || row === null || Array.isArray(row)) return false;
  const r = row as PairRowView;
  if (typeof r.id !== "string" || r.id.length === 0) return false;
  if (r.language !== myLang) return false;
  if (r.status !== "researched") return false;
  if (typeof r.pair_id !== "string" || !UUID_RE.test(r.pair_id)) return false;

  const age = ageHours(r.created_at, now);
  if (age === null || age < 0 || age > maxAgeHours) return false;

  return true;
}

// ─────────────────────────────────────────────────────────────────
// parsePairingJSON — validate the pairing model's JSON (hard laws)
// ─────────────────────────────────────────────────────────────────

const ARABIC_RE = /[\u0600-\u06FF]/;
const LATIN_LETTER_RE = /[A-Za-z]/;

/**
 * Parses + validates the pairing call's JSON against HARD laws:
 *   • topicEn MUST be one of the EN candidates (literal, trimmed) — the
 *     pairing model curates, it never invents English topics.
 *   • topicAr MAY be a literal AR candidate OR a NEW Arabic long-tail
 *     phrasing (must contain Arabic script, no Latin letters, min length).
 *   • angleId MUST be a known ARTICLE_ANGLES id.
 *   • Both topics respect the minimum length.
 * ANY violation → null (route degrades to legacy V3 — blind pairing is
 * forbidden: a wrong pair is worse than no pair).
 */
export function parsePairingJSON(
  text: string,
  ctx: { enCandidates: string[]; arCandidates: string[] },
): PairingChoice | null {
  const parsed = parseJSONLoose<Record<string, unknown>>(text);
  if (!parsed || typeof parsed !== "object") return null;

  const topicEn = typeof parsed.topicEn === "string" ? parsed.topicEn.trim() : "";
  const topicAr = typeof parsed.topicAr === "string" ? parsed.topicAr.trim() : "";
  const angleId = typeof parsed.angleId === "string" ? parsed.angleId.trim() : "";

  if (topicEn.length < MIN_TOPIC_CHARS || topicAr.length < MIN_TOPIC_CHARS) return null;
  if (!ctx.enCandidates.some((c) => c.trim() === topicEn)) return null;
  if (!isValidAngleId(angleId)) return null;

  const arIsLiteral = ctx.arCandidates.some((c) => c.trim() === topicAr);
  const arIsNewArabicPhrasing =
    ARABIC_RE.test(topicAr) && !LATIN_LETTER_RE.test(topicAr);
  if (!arIsLiteral && !arIsNewArabicPhrasing) return null;

  return { topicEn, topicAr, angleId };
}

// ─────────────────────────────────────────────────────────────────
// runPairingSelection — the small pairing call (≤400 output tokens)
// ─────────────────────────────────────────────────────────────────

export type PairingSelectionResult = PairingChoice & { source: string };

/**
 * ONE small model call over BOTH languages' research: picks topicEn from
 * the (already dup-filtered) EN candidates, topicAr from the AR candidates
 * or a NEW Arabic long-tail phrasing of the same daily subject, and ONE
 * shared article angle id. Throws on any invalid output — the route
 * catches and degrades to legacy V3 (never pairs blindly).
 */
export async function runPairingSelection(
  enResearch: LanguageResearch,
  arResearch: LanguageResearch,
): Promise<PairingSelectionResult> {
  const angleList = ARTICLE_ANGLES.map((a) => a.id).join("|");
  const prompt = `You are a bilingual SEO editor pairing ONE daily topic for a fitness blog.
Pick:
1. "topicEn": copy ONE of the EN candidates EXACTLY (no rewriting).
2. "topicAr": copy ONE of the AR candidates EXACTLY, or write ONE new Arabic long-tail topic phrasing the same daily subject for Arab searchers (natural Arabic only).
3. "angleId": ONE shared article-type id from: ${angleList} — the type that best fits the subject for BOTH languages.

EN CANDIDATES:
${enResearch.topics.map((t, i) => `${i + 1}. ${t}`).join("\n")}

AR CANDIDATES:
${arResearch.topics.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Return STRICT JSON only:
{"topicEn":"<exact EN candidate>","topicAr":"<exact AR candidate or new natural Arabic topic>","angleId":"<one id>"}`;

  const { text, model, provider } = await callFreeAIFallbackChain(prompt, {
    tag: "blog:pairing",
    temperature: 0.3,
    maxTokens: 400,
    jsonMode: true,
    timeoutMs: 45_000,
    maxModels: 2,
  });
  const choice = parsePairingJSON(text, {
    enCandidates: enResearch.topics,
    arCandidates: arResearch.topics,
  });
  if (!choice) {
    throw new Error(`pairing: invalid JSON from ${provider}:${model}`);
  }
  console.log(`[blog-pairing] paired (${provider}:${model}) angle=${choice.angleId}`);
  return { ...choice, source: `${provider}:${model}` };
}
