/**
 * EVO-5 (W5) — frequent-question answer cache (pure helpers).
 *
 * WHAT IT IS (honest scope): a deterministic normalized-text cache with
 * pg_trgm similarity for near-duplicates («كاش دلالي» in the master plan).
 * NO embeddings and NO 4th provider — the provider law (OpenRouter +
 * Groq + NVIDIA only) would require an explicit owner order for one, and
 * trigram similarity over a normalized question reaches the same repeat
 * questions for a fraction of the cost/complexity. Boundary documented in
 * the migration (0081) and INDEX.md.
 *
 * WHO GETS SERVED (safety posture — deliberately narrow): ONLY context-free
 * requests. Any personal signal (history, subscriber context, memory facts,
 * plan/swap intent, first-meeting, crisis) bypasses the cache completely —
 * a cached answer can never leak one user's context into another's chat,
 * and personal replies are never stored in the first place.
 *
 * QUOTA LAW: the cache changes NOTHING about quotas — a cache-served
 * message is recorded in the same tamper-proof ledgers as any other
 * dispatch (record-before-dispatch happens before the cache lookup).
 *
 * THE STORE itself lives in evo_chat_cache (migration 0081, service-role
 * only) — this module holds the pure, unit-tested pieces: normalization,
 * eligibility gate, TTL/threshold constants, and SSE chunking.
 */

export const EVO_CACHE_TTL_HOURS = 48;
export const EVO_CACHE_MIN_QUESTION_CHARS = 12;
export const EVO_CACHE_MIN_ANSWER_CHARS = 80;
/** pg_trgm similarity floor for the near-duplicate path (SQL side). */
export const EVO_CACHE_MIN_SIMILARITY = 0.92;
/** Max chars per simulated SSE delta chunk when serving a cached answer. */
export const EVO_CACHE_CHUNK_CHARS = 140;

/**
 * Deterministic question normalization:
 * - Unicode NFKC + lowercase (folds Latin case and width variants),
 * - Arabic diacritics/tatweel stripped,
 * - Arabic letter folding (أإآ→ا · ة→ه · ى→ي · ؤ→و · ئ→ي),
 * - Arabic-Indic digits → Latin digits,
 * - punctuation and symbols collapsed to spaces, whitespace squeezed.
 * The SAME function builds both the lookup hash and the stored
 * question_norm — they can never drift apart.
 */
export function normalizeEvoQuestion(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "") // diacritics + tatweel
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[\u0660-\u0669]/g, (d) =>
      String(d.charCodeAt(0) - 0x0660),
    )
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Context-free request gate — the ONLY shape a cached answer may serve. */
export function isCacheEligibleMessage(input: {
  message: string;
  historyLength: number;
  isSubscriber: boolean;
  memoryFactCount: number;
  isPlanCreation: boolean;
  isSwapRequest: boolean;
  firstMeeting: boolean;
}): boolean {
  if (input.historyLength !== 0) return false;
  if (input.isSubscriber) return false;
  if (input.memoryFactCount > 0) return false;
  if (input.isPlanCreation || input.isSwapRequest) return false;
  if (input.firstMeeting) return false;
  return (
    normalizeEvoQuestion(input.message).length >= EVO_CACHE_MIN_QUESTION_CHARS
  );
}

/**
 * Split a cached answer into SSE delta chunks so a cache hit behaves like
 * a real stream (the client renders delta events live, then swaps in
 * `final`). Deterministic, whitespace-boundary-aware — never splits a
 * word in half mid-token.
 */
export function chunkForSse(text: string): string[] {
  if (text.length <= EVO_CACHE_CHUNK_CHARS) return [text];
  const chunks: string[] = [];
  let rest = text;
  while (rest.length > EVO_CACHE_CHUNK_CHARS) {
    let cut = rest.lastIndexOf(" ", EVO_CACHE_CHUNK_CHARS);
    if (cut < EVO_CACHE_CHUNK_CHARS / 2) cut = EVO_CACHE_CHUNK_CHARS;
    chunks.push(rest.slice(0, cut));
    rest = rest.slice(cut).replace(/^ /, "");
  }
  if (rest.length > 0) chunks.push(rest);
  return chunks;
}
