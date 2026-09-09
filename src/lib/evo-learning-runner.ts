/**
 * EVO weekly learning runner (EVO-4 — W4 E1+E2+E3, master plan §4 W4).
 *
 * SERVER-ONLY (service-role): loads the three REAL plan sources (plans ·
 * meal_plans · external_plans) + plan_swaps, runs the deterministic
 * aggregators from evo-nutrition-learning.ts, and refreshes
 * evo_nutrition_patterns (migration 0080).
 *
 * CALLED BY (documented callers):
 *   1. The weekly GHA workflow (.github/workflows/evo-weekly-learning.yml)
 *      via scripts/ai-jobs-runner/evo-learning.mts — the primary, automatic
 *      cadence (same native-GHA posture as process-ai-jobs).
 *   2. Nothing else today — the route surface was deliberately NOT added
 *      (the job needs zero owner interaction; YAGNI + honest scope).
 *
 * WRITE SEMANTICS (0080):
 *   - E1 buckets are RECOMPUTED WHOLESALE (delete family → insert fresh) —
 *     stale keys can never survive a refresh;
 *   - exemplar + swap_volume are UPSERTed on (bucket, key);
 *   - swap_removed / swap_added are NEVER touched here — they accumulate
 *     live from /api/plans/member-edit swap diffs.
 */

import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";
import {
  aggregateNutritionPatterns,
  buildExemplarSkeleton,
  pickExemplarSource,
  type EvoPatternBucket,
  type NutritionPlanSource,
  type NutritionPatternDraft,
  EVO_AGG_SOURCES_MAX,
} from "@/lib/evo-nutrition-learning";

export type EvoLearningSummary = {
  ok: boolean;
  sources_read: number;
  plans_read: number;
  meal_plans_read: number;
  external_plans_read: number;
  drafts_upserted: number;
  exemplar: boolean;
  swap_volume_rows: number;
  errors: string[];
};

/** The E1 families the runner owns and refreshes wholesale. */
const E1_BUCKETS: EvoPatternBucket[] = [
  "calories_by_goal",
  "macros_by_goal",
  "meal_count",
  "food_frequency",
];

type LooseRow = Record<string, unknown>;

function loose(value: unknown): LooseRow {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as LooseRow)
    : {};
}

/** Latest fitness-survey goal per client (newest-first first-wins). */
async function loadGoalMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const { data, error } = await supabaseAdmin!
    .from("fitness_questionnaires")
    .select("client_id, data, created_at")
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) {
    console.error("[evo-learning] fitness_questionnaires read failed:", error.message);
    return map; // empty map = plans fall into the unknown-goal lane (never "maintain")
  }
  for (const row of (data ?? []) as LooseRow[]) {
    const clientId = String(row.client_id ?? "");
    if (!clientId || map.has(clientId)) continue;
    const goal = String(loose(row.data).goal ?? "").trim();
    if (goal) map.set(clientId, goal);
  }
  return map;
}

/**
 * Run one full weekly learning cycle. Throws on hard failures (missing
 * service-role config, failed writes) so the GHA runner can exit honestly
 * RED; soft failures (one source unreadable) degrade into `errors[]`.
 */
export async function runEvoWeeklyLearning(): Promise<EvoLearningSummary> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    throw new Error("evo-learning: SUPABASE service-role not configured");
  }
  const summary: EvoLearningSummary = {
    ok: false,
    sources_read: 0,
    plans_read: 0,
    meal_plans_read: 0,
    external_plans_read: 0,
    drafts_upserted: 0,
    exemplar: false,
    swap_volume_rows: 0,
    errors: [],
  };

  /* ── load sources (newest-first; E2 recency ties break on this order) ── */
  const goalMap = await loadGoalMap();

  const [plansRes, mealPlansRes, externalRes] = await Promise.all([
    supabaseAdmin
      .from("plans")
      .select("id, client_id, content, approved_at, created_at")
      .eq("type", "meal")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(EVO_AGG_SOURCES_MAX),
    supabaseAdmin
      .from("meal_plans")
      .select("id, user_id, plan_data, total_calories, total_protein, total_carbs, total_fat, created_at")
      .order("created_at", { ascending: false })
      .limit(EVO_AGG_SOURCES_MAX),
    supabaseAdmin
      .from("external_plans")
      .select("id, content, status, created_at")
      .eq("plan_type", "meal")
      .eq("status", "final")
      .order("created_at", { ascending: false })
      .limit(EVO_AGG_SOURCES_MAX),
  ]);

  if (plansRes.error) summary.errors.push(`plans: ${plansRes.error.message}`);
  if (mealPlansRes.error) summary.errors.push(`meal_plans: ${mealPlansRes.error.message}`);
  if (externalRes.error) summary.errors.push(`external_plans: ${externalRes.error.message}`);

  const sources: NutritionPlanSource[] = [];

  for (const row of (plansRes.data ?? []) as LooseRow[]) {
    summary.plans_read += 1;
    const clientId = String(row.client_id ?? "");
    sources.push({
      origin: "plans",
      approved: Boolean(row.approved_at),
      goalText: goalMap.get(clientId) ?? null,
      content: row.content,
    });
  }
  for (const row of (mealPlansRes.data ?? []) as LooseRow[]) {
    summary.meal_plans_read += 1;
    const userId = String(row.user_id ?? "");
    sources.push({
      origin: "meal_plans",
      approved: false,
      goalText: goalMap.get(userId) ?? null,
      content: row.plan_data,
      totals: {
        calories: (row.total_calories as number | null) ?? null,
        protein: (row.total_protein as number | null) ?? null,
        carbs: (row.total_carbs as number | null) ?? null,
        fat: (row.total_fat as number | null) ?? null,
      },
    });
  }
  for (const row of (externalRes.data ?? []) as LooseRow[]) {
    summary.external_plans_read += 1;
    sources.push({
      origin: "external_plans",
      approved: true, // final status is the admin-import quality bar
      goalText: null, // walk-in import — no client, no survey, no goal guess
      content: row.content,
    });
  }
  summary.sources_read = sources.length;

  /* ── E1: aggregate (pure, zero-LLM) ── */
  const drafts: NutritionPatternDraft[] = aggregateNutritionPatterns(sources);

  /* ── E2: pick + skeletonize the exemplar (deterministic, anonymous) ── */
  const exemplarSource = pickExemplarSource(sources);
  const skeleton = exemplarSource ? buildExemplarSkeleton(exemplarSource.content) : null;
  if (skeleton) {
    drafts.push({ bucket: "exemplar", key: "latest", payload: skeleton, sample_size: 1 });
    summary.exemplar = true;
  }

  /* ── E3 (volume half): swap counts from plan_swaps ── */
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  for (const swapType of ["meal", "exercise"] as const) {
    const [weekRes, totalRes] = await Promise.all([
      supabaseAdmin
        .from("plan_swaps")
        .select("*", { count: "exact", head: true })
        .eq("swap_type", swapType)
        .gte("created_at", weekAgo),
      supabaseAdmin
        .from("plan_swaps")
        .select("*", { count: "exact", head: true })
        .eq("swap_type", swapType),
    ]);
    if (weekRes.error) summary.errors.push(`plan_swaps(week ${swapType}): ${weekRes.error.message}`);
    if (totalRes.error) summary.errors.push(`plan_swaps(total ${swapType}): ${totalRes.error.message}`);
    const lastWeek = weekRes.count ?? 0;
    if (lastWeek > 0 || (totalRes.count ?? 0) > 0) {
      drafts.push({
        bucket: "swap_volume",
        key: swapType,
        payload: { last_week: lastWeek, total: totalRes.count ?? 0 },
        sample_size: lastWeek,
      });
      summary.swap_volume_rows += 1;
    }
  }

  /* ── write: E1 wholesale refresh ── */
  const { error: delErr } = await supabaseAdmin
    .from("evo_nutrition_patterns")
    .delete()
    .in("bucket", E1_BUCKETS);
  if (delErr) {
    throw new Error(`evo-learning: E1 refresh delete failed: ${delErr.message}`);
  }
  const e1Drafts = drafts.filter((d) => (E1_BUCKETS as string[]).includes(d.bucket));
  if (e1Drafts.length > 0) {
    const { error: insErr } = await supabaseAdmin
      .from("evo_nutrition_patterns")
      .insert(
        e1Drafts.map((d) => ({
          bucket: d.bucket,
          key: d.key,
          payload: d.payload as Json,
          sample_size: d.sample_size,
          computed_at: new Date().toISOString(),
        })),
      );
    if (insErr) {
      throw new Error(`evo-learning: E1 insert failed: ${insErr.message}`);
    }
    summary.drafts_upserted += e1Drafts.length;
  }

  /* ── write: exemplar + swap_volume upserted on (bucket, key) ── */
  const upsertDrafts = drafts.filter((d) => d.bucket === "exemplar" || d.bucket === "swap_volume");
  if (upsertDrafts.length > 0) {
    const { error: upErr } = await supabaseAdmin
      .from("evo_nutrition_patterns")
      .upsert(
        upsertDrafts.map((d) => ({
          bucket: d.bucket,
          key: d.key,
          payload: d.payload as Json,
          sample_size: d.sample_size,
          computed_at: new Date().toISOString(),
        })),
        { onConflict: "bucket,key" },
      );
    if (upErr) {
      throw new Error(`evo-learning: exemplar/swap upsert failed: ${upErr.message}`);
    }
    summary.drafts_upserted += upsertDrafts.length;
  }

  summary.ok = summary.errors.length === 0;
  return summary;
}
