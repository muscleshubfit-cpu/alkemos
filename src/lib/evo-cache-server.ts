/**
 * EVO-5 cache store access — extracted VERBATIM from
 * src/app/api/ai/chat/route.ts (Phase 169, zero behavior change) so the
 * partner API route (EVO-6) shares the EXACT same cache semantics instead
 * of forking them: same RPC, same TTL, same first-writer-wins, same lazy
 * sweep. The chat route keeps calling these under identical names.
 *
 * Both helpers are FAIL-OPEN: any cache failure is a warn that never
 * blocks a chat/partner response.
 *
 * The store is evo_chat_cache (migration 0081, zero client policies) —
 * service-role is the only reader/writer.
 */
import {
  EVO_CACHE_MIN_SIMILARITY,
  EVO_CACHE_TTL_HOURS,
} from "@/lib/evo-cache";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";

export type EvoCacheLookupRow = {
  id: string;
  answer: string;
  source: string;
};

/**
 * One RPC round trip: exact-hash hit first, else the most similar
 * unexpired same-language row at/above the pg_trgm similarity floor
 * (migration 0081). ANY failure → null (cache never blocks chat).
 */
export async function lookupEvoCacheAnswer(
  hash: string,
  norm: string,
  lang: string,
): Promise<EvoCacheLookupRow | null> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) return null;
  try {
    const { data, error } = await supabaseAdmin.rpc("evo_cache_lookup", {
      p_hash: hash,
      p_norm: norm,
      p_lang: lang,
      p_min_sim: EVO_CACHE_MIN_SIMILARITY,
    });
    if (error || !data || data.length === 0) return null;
    return data[0] as EvoCacheLookupRow;
  } catch (e) {
    console.warn(
      "[evo-cache-server] cache lookup failed (fail-open):",
      e instanceof Error ? e.message : e,
    );
    return null;
  }
}

/**
 * Persist an eligible answer into evo_chat_cache (48h TTL; UNIQUE hash —
 * first writer wins via ignoreDuplicates). A lazy sweep removes rows
 * expired for over a week so the table stays small. Best-effort: a cache
 * write failure is a warn, never a chat failure.
 */
export async function storeEvoCacheAnswer(
  hash: string,
  norm: string,
  lang: string,
  answer: string,
  source: string,
): Promise<void> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) return;
  try {
    const expiresAt = new Date(
      Date.now() + EVO_CACHE_TTL_HOURS * 3_600_000,
    ).toISOString();
    await supabaseAdmin
      .from("evo_chat_cache")
      .upsert(
        {
          question_hash: hash,
          question_norm: norm,
          language: lang,
          answer,
          source,
          expires_at: expiresAt,
        },
        { onConflict: "question_hash", ignoreDuplicates: true },
      );
    // Lazy cleanup — rows expired for 7+ days are dead weight.
    const staleCutoff = new Date(Date.now() - 7 * 86_400_000).toISOString();
    await supabaseAdmin
      .from("evo_chat_cache")
      .delete()
      .lt("expires_at", staleCutoff);
  } catch (e) {
    console.warn(
      "[evo-cache-server] cache store failed (best-effort):",
      e instanceof Error ? e.message : e,
    );
  }
}
