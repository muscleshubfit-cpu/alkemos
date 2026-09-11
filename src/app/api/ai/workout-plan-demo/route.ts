import { NextRequest, NextResponse } from "next/server";
import { callFreeAIFallbackChain } from "@/lib/ai-provider";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  buildWorkoutPrompt,
  WORKOUT_DEMO_RATE_LIMIT,
  parseWorkoutPlanText,
  validateWorkoutRequest,
  type WorkoutPlanVerdict,
} from "@/lib/ai-workout-planner";

/**
 * POST /api/ai/workout-plan-demo — the AI workout-planner TRIAL endpoint
 * (§12.32, owner directive «ضيف أداة جديده مخطط التمارين بالذكاء
 * الاصطناعي») — the workout twin of §12.28's meal-plan demo, built with
 * every live-hardening law that batch earned.
 *
 * ONE synchronous free-chain generation per request — the same
 * interactive pattern the EVO chat uses. This is NOT batch work, so the
 * ai_jobs queue (owner directive 2026-08-27 — batch AI in GitHub
 * Actions) does not apply; it is a single visitor-facing call, gated
 * hard instead:
 *
 *   1. INPUT: one of the 4 goals · one of the 3 levels · 2–6 days · one
 *      of the 3 equipment worlds · en|ar · notes ≤200 chars (validated
 *      BEFORE anything else).
 *   2. COST: IP-keyed rate limit — 5 generations / 24 h per visitor —
 *      enforced BEFORE any provider call (Upstash-backed in production).
 *   3. SHAPE: the model's JSON is strictly validated (exactly the
 *      requested number of training days, 3–8 exercises each, sets and
 *      reps bounded) — a drifted payload is rejected with 422, never
 *      displayed.
 *
 * NO SUBSCRIPTION CONFLICT (the owner's §12.28 law, carried over): no
 * account required, no ai_jobs row, no client plan quota, nothing
 * persisted. The demo split is ephemeral — saved programs, coach-built
 * plans, and EVO generation remain exactly where the memberships put
 * them (memberships.ts untouched).
 *
 * Live-hardening laws from §12.28 applied from day one: 3000-token
 * budget (reasoning-capable free models), no-written-reasoning system
 * prompt, reasoning-salvage parser, and 20s per chain call so the
 * first+retry pair fits the 60s function budget (no 504).
 */
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const verdict = validateWorkoutRequest({
      goal: body?.goal,
      level: body?.level,
      days: body?.days,
      equipment: body?.equipment,
      language: body?.language,
      notes: body?.notes,
    });
    if (!verdict.ok) {
      return NextResponse.json({ error: verdict.error }, { status: 400 });
    }
    const req = verdict.value;

    // ── Cost gate (BEFORE any provider call). ──
    const ip = clientIp(request);
    const rl = await rateLimit(
      `workout-demo:${ip}`,
      WORKOUT_DEMO_RATE_LIMIT.max,
      WORKOUT_DEMO_RATE_LIMIT.windowMs,
    );
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error:
            req.language === "ar"
              ? `حد التجربة المجانية ${WORKOUT_DEMO_RATE_LIMIT.max} توليدات في اليوم — عد غداً أو تصفّح برامج التدريب الجاهزة الآن.`
              : `Free trial limit: ${WORKOUT_DEMO_RATE_LIMIT.max} generations per day — come back tomorrow, or browse the ready workout programs now.`,
          rateLimited: true,
          resetAt: rl.resetAt,
        },
        { status: 429, headers: { "Retry-After": "3600" } },
      );
    }

    // ── One synchronous free-chain call (EVO's interactive pattern),
    // with a single bounded retry when the model misses the JSON shape
    // (free-tier models drift; the retry stays inside the SAME request
    // so the visitor's rate-limit slot is spent once). ──
    const prompt = buildWorkoutPrompt(req);
    // §12.28 live lesson, applied from day one: reasoning-capable free
    // models emit their chain-of-thought as CONTENT before the JSON —
    // the budget covers reasoning + plan, and the prompt forbids written
    // reasoning outright.
    const callOpts = {
      maxTokens: 3000,
      temperature: 0.4,
      tag: "workout-demo",
      // TWO attempts (first + retry) must fit the 60s function budget —
      // 20s per chain call leaves ~20s for rate limiting + parsing + I/O.
      timeoutMs: 20_000,
      jsonMode: true,
      systemPrompt:
        "You are a JSON-only workout-plan generator. Your ENTIRE reply is a single JSON object — no prose, no reasoning, no step-by-step planning, no markdown fences, no commentary. Output the JSON immediately.",
    };

    let model = "";
    let plan: WorkoutPlanVerdict = { ok: false, error: "chain call failed" };
    let rawText = "";

    const first = await callFreeAIFallbackChain(prompt, callOpts).catch(() => null);
    if (first) {
      model = first.model;
      rawText = first.text;
      plan = parseWorkoutPlanText(first.text, req.days);
    }
    if (!plan.ok) {
      // Retry #1 — same request, harder nudge. Still inside the rate slot.
      const second = await callFreeAIFallbackChain(
        prompt +
          '\n\nREMINDER: reply with ONE JSON object exactly like {"days":[{"name":"Day 1","focus":"...","exercises":[{"name":"...","sets":4,"reps":8}]}]} — nothing else.',
        callOpts,
      ).catch(() => null);
      if (second) {
        model = second.model;
        rawText = second.text;
        plan = parseWorkoutPlanText(second.text, req.days);
      }
    }
    if (!plan.ok) {
      // Model drift is a retry-able client-visible outcome, not a crash.
      console.error(
        "[api/ai/workout-plan-demo] shape rejection:",
        plan.error,
        "| model:",
        model,
        "| raw:",
        rawText.slice(0, 500),
      );
      return NextResponse.json(
        {
          error:
            req.language === "ar"
              ? "خرج التوليد عن الشكل المطلوب — جرّب مرة أخرى (الزرر فوق)."
              : "The generated plan missed the required shape — try again (button above).",
          detail: plan.error,
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
      plan: plan.value,
      model,
      trial: {
        limit: WORKOUT_DEMO_RATE_LIMIT.max,
        remaining: Math.max(0, rl.remaining - 1),
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[api/ai/workout-plan-demo] POST error:", msg);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
