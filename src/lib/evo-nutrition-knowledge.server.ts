/**
 * EVO nutrition knowledge loader (EVO-4) — the prompt-injection wrapper
 * the plan-generation callers use. SERVER-ONLY (service-role read of
 * evo_nutrition_patterns, migration 0080).
 *
 * FAIL-OPEN LAW: generation must NEVER break because learning is absent —
 * any read/build failure or an empty knowledge base returns "" and the
 * prompts render exactly as they did before EVO-4. The knowledge is an
 * enhancement layer, not a dependency.
 */

import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import {
  buildPlatformKnowledgeBlock,
  buildSwapLearningBlock,
  type EvoPatternRow,
} from "@/lib/evo-nutrition-learning";

export type EvoNutritionKnowledge = {
  /** E1+E2 block — appended to the full-plan nutrition prompt. */
  knowledgeBlock: string;
  /** E3 block — appended to meal regeneration / swap prompts. */
  swapBlock: string;
};

const EMPTY: EvoNutritionKnowledge = { knowledgeBlock: "", swapBlock: "" };

export async function loadEvoNutritionKnowledge(): Promise<EvoNutritionKnowledge> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) return EMPTY;
  try {
    const { data, error } = await supabaseAdmin
      .from("evo_nutrition_patterns")
      .select("bucket, key, payload, sample_size")
      .limit(300);
    if (error) {
      console.error("[evo-knowledge] patterns read failed:", error.message);
      return EMPTY;
    }
    const rows = (data ?? []) as unknown as EvoPatternRow[];
    if (rows.length === 0) return EMPTY;
    return {
      knowledgeBlock: buildPlatformKnowledgeBlock(rows),
      swapBlock: buildSwapLearningBlock(rows),
    };
  } catch (e) {
    console.error(
      "[evo-knowledge] unexpected load failure (fail-open):",
      e instanceof Error ? e.message : e,
    );
    return EMPTY;
  }
}
