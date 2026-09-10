/**
 * scripts/ai-jobs-runner/evo-eval.mts
 *
 * Weekly EVO-5 (W5) eval harness — native GitHub Actions runner
 * (same posture as process.mts / evo-learning.mts). Answers the AR/EN
 * reference question set with the REAL production system prompt via the
 * 3-provider chain, scores each answer with a cheap judge model on the
 * SAME chain, and persists one evo_eval_runs row per question (0081) —
 * the quality curve that accompanies every prompt change.
 *
 * USAGE:
 *   npx --no-install tsx scripts/ai-jobs-runner/evo-eval.mts
 *
 * REQUIRED ENV (GitHub Secrets → job env):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   + at least ONE provider key (OPENROUTER_API | OPENROUTER_API_KEY |
 *     GROQ_API_KEY | NVIDIA_API_KEY) — the answer + judge rides the
 *     standard fallback chain, never a direct provider call.
 *
 * EXIT CODES (HONEST RUN COLOR LAW):
 *   0 = run complete, ≥1 question scored and no errors
 *   1 = hard failure (config/DB) OR zero scored questions OR any soft
 *       error — a degraded eval must be visible, never silently green
 *   2 = missing required env
 */

const missing: string[] = [];
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
const hasProviderKey = [
  "OPENROUTER_API",
  "OPENROUTER_API_KEY",
  "GROQ_API_KEY",
  "NVIDIA_API_KEY",
].some((k) => !!process.env[k]);
if (!hasProviderKey) {
  missing.push("at least one provider key (OPENROUTER_API | OPENROUTER_API_KEY | GROQ_API_KEY | NVIDIA_API_KEY)");
}
if (missing.length > 0) {
  console.error(`[evo-eval] ❌ Missing required env: ${missing.join(", ")}`);
  process.exit(2);
}

async function main(): Promise<void> {
  const { runEvoWeeklyEval } = await import("../../src/lib/evo-eval-runner");
  const summary = await runEvoWeeklyEval();

  console.log("=== EVO weekly eval summary ===");
  console.log(`scored questions: ${summary.scored}`);
  console.log(`average score:    ${summary.avgScore}/10`);
  console.log(`safety failures:  ${summary.safetyFailures}`);
  console.log(`language misses:  ${summary.languageMismatches}`);
  if (summary.errors.length > 0) {
    console.warn("errors (each one fails the run):");
    for (const e of summary.errors) console.warn(`  - ${e}`);
  }
  console.log(
    summary.ok
      ? "✓ eval complete — the quality curve now includes this run (evo_eval_runs)"
      : "✗ eval degraded — see errors above (HONEST RUN COLOR LAW: red until healthy)",
  );
  if (!summary.ok) process.exit(1);
}

main().catch((e: unknown) => {
  console.error(
    "[evo-eval] ❌ hard failure:",
    e instanceof Error ? (e.stack ?? e.message) : e,
  );
  process.exit(1);
});
