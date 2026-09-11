import { NextRequest, NextResponse } from "next/server";
import { callFreeAIFallbackChain } from "@/lib/ai-provider";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  buildDemoPrompt,
  DEMO_RATE_LIMIT,
  parseDemoPlanText,
  validateDemoRequest,
  type DemoPlanVerdict,
} from "@/lib/ai-meal-planner";

/**
 * POST /api/ai/meal-plan-demo — the AI meal-planner TRIAL endpoint
 * (§12.28, owner directive «مطلوب إنشاؤها مع سماح بالتجربة للجميع بدون
 * تعارض مع الاشتراكات»).
 *
 * ONE synchronous free-chain generation per request — the same interactive
 * pattern the EVO chat uses. This is NOT batch work, so the ai_jobs queue
 * (owner directive 2026-08-27 — batch AI in GitHub Actions) does not apply;
 * it is a single visitor-facing call, gated hard instead:
 *
 *   1. INPUT: calories 1200–4000 · one of the 4 site systems · en|ar ·
 *      notes ≤200 chars (validated BEFORE anything else).
 *   2. COST: IP-keyed rate limit — 3 generations / 24 h per visitor —
 *      enforced BEFORE any provider call (Upstash-backed in production).
 *   3. SHAPE: the model's JSON is strictly validated (meals/items/grams/
 *      kcal, ±20% calorie closure) — a drifted payload is rejected with
 *      422, never displayed.
 *
 * NO SUBSCRIPTION CONFLICT (the owner's law): no account required, no
 * ai_jobs row, no client plan quota, nothing persisted. The demo plan is
 * ephemeral — saving, weekly planning, export, and coach review remain
 * exactly where the memberships put them (memberships.ts untouched).
 */
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const verdict = validateDemoRequest({
      calories: body?.calories,
      system: body?.system,
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
      `meal-demo:${ip}`,
      DEMO_RATE_LIMIT.max,
      DEMO_RATE_LIMIT.windowMs,
    );
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error:
            req.language === "ar"
              ? `حد التجربة المجانية ${DEMO_RATE_LIMIT.max} توليدات في اليوم — عد غداً أو افتح المخطط اليدوي الآن.`
              : `Free trial limit: ${DEMO_RATE_LIMIT.max} generations per day — come back tomorrow, or open the manual planner now.`,
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
    const prompt = buildDemoPrompt(req);
    // Live diagnosis (§12.28): reasoning-capable free models emit their
    // chain-of-thought arithmetic as CONTENT before the JSON — 1600 max
    // tokens truncated mid-reasoning and the JSON never arrived. The
    // budget now covers reasoning + plan, and the prompt forbids written
    // reasoning outright.
    const callOpts = {
      maxTokens: 3000,
      temperature: 0.4,
      tag: "meal-demo",
      timeoutMs: 28_000,
      jsonMode: true,
      systemPrompt:
        "You are a JSON-only meal-plan generator. Your ENTIRE reply is a single JSON object — no prose, no reasoning, no step-by-step calculation, no markdown fences, no commentary. Output the JSON immediately.",
    };

    let model = "";
    let plan: DemoPlanVerdict = { ok: false, error: "chain call failed" };
    let rawText = "";

    const first = await callFreeAIFallbackChain(prompt, callOpts).catch(() => null);
    if (first) {
      model = first.model;
      rawText = first.text;
      plan = parseDemoPlanText(first.text, req.calories);
    }
    if (!plan.ok) {
      // Retry #1 — same request, harder nudge. Still inside the rate slot.
      const second = await callFreeAIFallbackChain(
        prompt +
          '\n\nREMINDER: reply with ONE JSON object exactly like {"meals":[{"name":"…","items":[{"food":"…","grams":120,"kcal":180}]}]} — nothing else.',
        callOpts,
      ).catch(() => null);
      if (second) {
        model = second.model;
        rawText = second.text;
        plan = parseDemoPlanText(second.text, req.calories);
      }
    }
    if (!plan.ok) {
      // Model drift is a retry-able client-visible outcome, not a crash.
      console.error(
        "[api/ai/meal-plan-demo] shape rejection:",
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
        limit: DEMO_RATE_LIMIT.max,
        remaining: Math.max(0, rl.remaining - 1),
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[api/ai/meal-plan-demo] POST error:", msg);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
