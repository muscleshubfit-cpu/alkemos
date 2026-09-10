import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin, authRequired } from "@/lib/auth-server";
import type { Database } from "@/lib/supabase/types";

/**
 * GET /api/admin/evo-analytics — EVO-5 (W5.8) admin analytics for EVO.
 *
 * The OWNER'S cost/quality decisions backed by data:
 *   - calls volume + cache hit rate + fallback share + latency (30d),
 *   - provider breakdown (openrouter | groq | nvidia | cache | local)
 *     — success + avg latency per provider (evo_call_stats),
 *   - intent distribution (general | plan_nutrition | plan_workout | swap),
 *   - quota consumption from the tamper-proof evo_chat_usage ledger,
 *   - 👍/👎 feedback counts (evo_feedback),
 *   - top cached questions (evo_chat_cache by hits),
 *   - the weekly eval curve: latest run rows + average (evo_eval_runs).
 *
 * All reads are service-role against zero-client-policy tables (0081) —
 * the admin session is verified by requireAdmin BEFORE any query.
 * Rows are aggregated in-process (bounded selects); no SQL is invented.
 */

type CallStatRow = {
  provider: string;
  intent: string;
  cache_hit: boolean;
  success: boolean;
  latency_ms: number | null;
  created_at: string;
};

export async function GET(request: NextRequest) {
  if (!authRequired) {
    return NextResponse.json({ demo: true });
  }

  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Supabase service-role is not configured" },
      { status: 503 },
    );
  }
  const supabase = createClient<Database>(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const sinceIso = new Date(Date.now() - 30 * 86_400_000).toISOString();

  // Bounded parallel reads — every failure degrades that section to zero,
  // never a 500 (the dashboard is a read-only observability surface).
  const [callsRes, usageRes, feedbackRes, cacheRes, evalRes] = await Promise.all([
    supabase
      .from("evo_call_stats")
      .select("provider, intent, cache_hit, success, latency_ms, created_at")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(20_000),
    supabase
      .from("evo_chat_usage")
      .select("source, created_at")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(20_000),
    supabase
      .from("evo_feedback")
      .select("feedback, created_at")
      .gte("created_at", sinceIso)
      .limit(5_000),
    supabase
      .from("evo_chat_cache")
      .select("question_norm, language, hits")
      .order("hits", { ascending: false })
      .limit(8),
    supabase
      .from("evo_eval_runs")
      .select(
        "question_id, language, provider, model, score, safety_pass, language_match, notes, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  /* ---- calls + providers + intents + daily volume ---- */
  const callRows = (callsRes.data ?? []) as CallStatRow[];
  const providerMap = new Map<string, { calls: number; successes: number; latencySum: number; latencyN: number }>();
  const intentMap = new Map<string, number>();
  const dailyMap = new Map<string, number>();
  let cacheHits = 0;
  let latencySum = 0;
  let latencyN = 0;
  for (const r of callRows) {
    const p = providerMap.get(r.provider) ?? { calls: 0, successes: 0, latencySum: 0, latencyN: 0 };
    p.calls += 1;
    if (r.success) p.successes += 1;
    if (typeof r.latency_ms === "number") {
      p.latencySum += r.latency_ms;
      p.latencyN += 1;
      latencySum += r.latency_ms;
      latencyN += 1;
    }
    providerMap.set(r.provider, p);
    if (r.cache_hit) cacheHits += 1;
    intentMap.set(r.intent, (intentMap.get(r.intent) ?? 0) + 1);
    const day = r.created_at.slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
  }
  const round1 = (n: number) => Math.round(n * 10) / 10;
  const providers = [...providerMap.entries()]
    .map(([provider, s]) => ({
      provider,
      calls: s.calls,
      successRate: s.calls > 0 ? round1((s.successes / s.calls) * 100) : 0,
      avgLatencyMs: s.latencyN > 0 ? Math.round(s.latencySum / s.latencyN) : null,
    }))
    .sort((a, b) => b.calls - a.calls);
  const intents = [...intentMap.entries()]
    .map(([intent, count]) => ({ intent, count }))
    .sort((a, b) => b.count - a.count);
  const daily = [...dailyMap.entries()]
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => a.day.localeCompare(b.day))
    .slice(-30);

  /* ---- quota consumption (the REAL ledger) ---- */
  const quotaMap = new Map<string, number>();
  for (const r of usageRes.data ?? []) {
    quotaMap.set(r.source, (quotaMap.get(r.source) ?? 0) + 1);
  }
  const quota = [...quotaMap.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  /* ---- feedback ---- */
  let up = 0;
  let down = 0;
  for (const r of feedbackRes.data ?? []) {
    if (r.feedback === "up") up += 1;
    else if (r.feedback === "down") down += 1;
  }

  /* ---- eval: the LATEST run (rows within a 10-minute window) ---- */
  const evalRows = evalRes.data ?? [];
  let evalSection: {
    runAt: string | null;
    avgScore: number;
    count: number;
    safetyFailures: number;
    languageMismatches: number;
    rows: Array<{
      question_id: string;
      language: string;
      provider: string | null;
      model: string | null;
      score: number;
      safety_pass: boolean;
      language_match: boolean;
      notes: string | null;
    }>;
  } = { runAt: null, avgScore: 0, count: 0, safetyFailures: 0, languageMismatches: 0, rows: [] };
  if (evalRows.length > 0) {
    const latest = evalRows[0].created_at;
    const latestMs = new Date(latest).getTime();
    const runRows = evalRows.filter(
      (r) => Math.abs(new Date(r.created_at).getTime() - latestMs) < 10 * 60_000,
    );
    const scores = runRows.map((r) => Number(r.score));
    evalSection = {
      runAt: latest,
      count: runRows.length,
      avgScore:
        scores.length > 0
          ? round1(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0,
      safetyFailures: runRows.filter((r) => !r.safety_pass).length,
      languageMismatches: runRows.filter((r) => !r.language_match).length,
      rows: runRows.map((r) => ({
        question_id: r.question_id,
        language: r.language,
        provider: r.provider,
        model: r.model,
        score: Number(r.score),
        safety_pass: r.safety_pass,
        language_match: r.language_match,
        notes: r.notes,
      })),
    };
  }

  return NextResponse.json({
    window_days: 30,
    calls: {
      total: callRows.length,
      cacheHits,
      cacheHitRate: callRows.length > 0 ? round1((cacheHits / callRows.length) * 100) : 0,
      localFallbacks: providerMap.get("local")?.calls ?? 0,
      avgLatencyMs: latencyN > 0 ? Math.round(latencySum / latencyN) : null,
    },
    providers,
    intents,
    daily,
    quota,
    feedback: { up, down, total: up + down },
    cache: {
      top: cacheRes.data ?? [],
    },
    eval: evalSection,
  });
}
