/**
 * scripts/ai-jobs-runner/evo-learning.mts
 *
 * Weekly EVO-4 (W4 E1+E2+E3) learning cycle — native GitHub Actions runner
 * (same posture as process.mts). DETERMINISTIC end-to-end: aggregation and
 * exemplar extraction are LLM-free (zero AI cost, zero provider keys), so
 * this script needs ONLY the Supabase secrets.
 *
 * USAGE:
 *   npx --no-install tsx scripts/ai-jobs-runner/evo-learning.mts
 *
 * REQUIRED ENV (GitHub Secrets → job env):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * WHAT IT DOES:
 *   1. loads plans (approved meal) · meal_plans · external_plans (final)
 *      + the fitness-survey goal map + plan_swaps volume;
 *   2. recomputes E1 buckets wholesale (calories/macros by goal, meal
 *      counts, food frequency — all anonymized, honesty-floored);
 *   3. refreshes the E2 exemplar (deterministic structured skeleton);
 *   4. refreshes E3 swap_volume (swap_removed/swap_added accumulate live
 *      from /api/plans/member-edit and are NOT touched here);
 *   5. writes everything into evo_nutrition_patterns (migration 0080) —
 *      the table the plan generator injects as «معرفة المنصة الغذائية».
 *
 * EXIT CODES: 0 = cycle complete (HONEST RUN COLOR LAW: soft source errors
 *             still print warnings but empty sources are a valid state),
 *             1 = hard failure (write error / misconfiguration).
 */

const missing: string[] = [];
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
if (missing.length > 0) {
  console.error(`[evo-learning] ❌ Missing required env: ${missing.join(", ")}`);
  process.exit(2);
}

async function main(): Promise<void> {
  const { runEvoWeeklyLearning } = await import("../../src/lib/evo-learning-runner");
  const summary = await runEvoWeeklyLearning();

  console.log("=== EVO weekly learning summary ===");
  console.log(`sources read: ${summary.sources_read} (plans ${summary.plans_read} · meal_plans ${summary.meal_plans_read} · external_plans ${summary.external_plans_read})`);
  console.log(`drafts upserted: ${summary.drafts_upserted}`);
  console.log(`exemplar refreshed: ${summary.exemplar ? "yes" : "no qualifying plan yet"}`);
  console.log(`swap_volume rows: ${summary.swap_volume_rows}`);
  if (summary.errors.length > 0) {
    console.warn("soft errors (degraded, not fatal):");
    for (const e of summary.errors) console.warn(`  - ${e}`);
  }
  console.log(
    summary.ok
      ? "✓ learning cycle complete — the generator now reads the refreshed knowledge"
      : "⚠ cycle completed with soft errors (exit 0 — sources degraded, writes verified)",
  );
  if (!summary.ok) {
    // HONEST RUN COLOR LAW: soft errors are visible in the log AND fail the
    // run so the owner sees red until the sources are healthy again.
    process.exit(1);
  }
}

main().catch((e: unknown) => {
  console.error(
    "[evo-learning] ❌ hard failure:",
    e instanceof Error ? (e.stack ?? e.message) : e,
  );
  process.exit(1);
});
