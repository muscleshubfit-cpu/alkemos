import { NextRequest, NextResponse, after } from "next/server";
import { createHash } from "node:crypto";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import {
  isSupabaseAdminConfigured,
  supabaseAdmin,
} from "@/lib/supabase/admin";
import {
  extractPartnerKey,
  hashPartnerKey,
  isWellFormedPartnerKey,
  parsePartnerChatInput,
  detectPartnerLanguage,
} from "@/lib/evo-partner";
import {
  isCacheEligibleMessage,
  normalizeEvoQuestion,
  EVO_CACHE_MIN_ANSWER_CHARS,
} from "@/lib/evo-cache";
import {
  lookupEvoCacheAnswer,
  storeEvoCacheAnswer,
} from "@/lib/evo-cache-server";
import { callFreeAIFallbackChain } from "@/lib/ai-provider";
import {
  buildSystemPrompt,
  type EvoClientContext,
} from "@/lib/evo-system-prompt";
import { classifyEvoIntent } from "@/lib/evo-intent";
import { detectEvoCrisis, evoCrisisReply, isArabicText } from "@/lib/evo-safety";
import {
  sanitizeLatexToPlain,
  stripMarkdownSyntax,
} from "@/lib/evo-chat-format";

/**
 * EVO-6 (W6) — PUBLIC PARTNER API: POST /api/evo/v1/chat.
 *
 * The documented contract lives in docs/EVO-PARTNER-API.md; the owner
 * order is «ابدأ evo 6» (2026-09-10). Partner keys live in evo_api_keys
 * (migration 0082 — ZERO client policies: a key row is a credential, the
 * browser never reads the table; service-role is the only reader/writer).
 *
 * GATE ORDER (every rejection writes an evo_api_usage row with its final
 * status — the full ledger, rejections included, is the abuse-audit trail;
 * quota enforcement counts CURRENT-MONTH 'success' rows):
 *   1. EVO_PARTNER_API_ENABLED=true (owner kill switch) else 404.
 *   2. Per key+IP rate limit (30/min — Upstash-backed, cross-instance).
 *   3. Bearer/x-api-key key → sha256 → active row in evo_api_keys.
 *   4. Monthly quota (success rows this UTC month < monthly_quota).
 *   5. Body shape (message ≤2000 chars · history ≤8 turns ≤2000 each).
 *   6. INTENT GATE — v1 boundary: general conversation ONLY. Plan-creation
 *      and swap intents are REJECTED with 400 (they are the heavy,
 *      subscriber-gated surfaces — a partner can never burn generation
 *      cost or reach member-only flows through the public API).
 *   7. Crisis shield — detectEvoCrisis → evoCrisisReply (a crisis message
 *      is served a safe redirect and COUNTS as a served message, same as
 *      the platform chat where it is served before quota).
 *
 * CACHE: first message of a conversation (empty history, context-free by
 * construction — partners carry NO subscriber context/memory) may be
 * served from evo_chat_cache via the SAME shared helpers as the platform
 * chat (evo-cache-server.ts). A cache-served message still counts against
 * the partner's quota (the ledger is per-request, provider-independent).
 *
 * DISPATCH: anonymous-baseline buildSystemPrompt (the REAL production
 * prompt — identical to the eval harness baseline) + callFreeAIFallbackChain
 * (3-provider law) + the SAME user-visible sanitizers as the chat route.
 * NO streaming (JSON in/JSON out — the documented v1 contract), NO links
 * (partner UIs render plain text; platform search stays out of v1).
 *
 * RESPONSE: { reply, source, provider, cached } — or
 * { error } with 400/401/404/429/503. The metered 'success' row is written
 * SYNCHRONOUSLY before the response returns (quota integrity — a burst
 * cannot slip past the count between dispatch and response); the
 * evo_call_stats telemetry row is best-effort in after().
 */

export const maxDuration = 60;

/** Anonymous-baseline context — partners NEVER see subscriber surfaces. */
const PARTNER_BASELINE_CTX: EvoClientContext = {
  name: "EVO Partner",
  isSubscriber: false,
};

/** Strip reasoning blocks the chat route strips before display. */
function stripReasoningBlocks(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>\s*/gi, "")
    .replace(/<reasoning>[\s\S]*?<\/reasoning>\s*/gi, "")
    .replace(/<reflection>[\s\S]*?<\/reflection>\s*/gi, "")
    .replace(/<analysis>[\s\S]*?<\/analysis>\s*/gi, "");
}

export async function POST(request: NextRequest) {
  // Gate 1 — owner kill switch (staged rollout, same law as EVO_FOLLOWUP_ENABLED).
  if (process.env.EVO_PARTNER_API_ENABLED !== "true") {
    return NextResponse.json({ error: "not-found" }, { status: 404 });
  }
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json(
      { error: "service-unavailable" },
      { status: 503 },
    );
  }

  const ip = clientIp(request);

  // Gate 2 — key shape + per key+IP rate limit (a leaked key hammered
  // from one IP is the most common abuse shape; per-IP keeps shared
  // partner deployments fair).
  const presented = extractPartnerKey(request.headers);
  if (!isWellFormedPartnerKey(presented)) {
    return NextResponse.json(
      { error: "unauthorized — valid pk_live_ key required" },
      { status: 401 },
    );
  }
  const keyHash = hashPartnerKey(presented);
  const rl = await rateLimit(
    `evo-partner:${keyHash.slice(0, 12)}:${ip}`,
    30,
    60_000,
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited — 30 requests/minute max" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  // Gate 3 — credential lookup (hash-only; is_active is the per-key kill switch).
  const { data: keyRow, error: keyErr } = await supabaseAdmin
    .from("evo_api_keys")
    .select("id, partner_name, monthly_quota, is_active")
    .eq("key_hash", keyHash)
    .maybeSingle();
  if (keyErr || !keyRow || !keyRow.is_active) {
    return NextResponse.json(
      { error: "unauthorized — key not found or deactivated" },
      { status: 401 },
    );
  }

  // Usage ledger helper — every attempt records its final status.
  // The success row for THIS request is written synchronously (quota
  // integrity); everything else is best-effort (a rejected request must
  // not turn into a 500 because its audit row failed). `admin` captures
  // the narrowed non-null client (module imports cannot be narrowed in
  // closures).
  const admin = supabaseAdmin;
  const recordUsage = async (
    status: "success" | "rate_limited" | "quota_exceeded" | "rejected" | "error",
    extra: { cacheHit?: boolean; latencyMs?: number } = {},
  ): Promise<void> => {
    try {
      await admin.from("evo_api_usage").insert({
        api_key_id: keyRow.id,
        endpoint: "chat",
        status,
        cache_hit: extra.cacheHit ?? false,
        latency_ms: extra.latencyMs ?? null,
        client_ip: ip,
      });
    } catch (e) {
      console.warn(
        "[api/evo/v1/chat] usage write failed:",
        e instanceof Error ? e.message : e,
      );
    }
  };

  // Gate 4 — monthly quota (CURRENT-UTC-MONTH success rows < monthly_quota).
  const monthStart = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      1,
      0,
      0,
      0,
      0,
    ),
  ).toISOString();
  const { count: usedThisMonth, error: quotaErr } = await supabaseAdmin
    .from("evo_api_usage")
    .select("id", { count: "exact", head: true })
    .eq("api_key_id", keyRow.id)
    .eq("status", "success")
    .gte("created_at", monthStart);
  if (quotaErr) {
    // Fail-CLOSED here: without a trustworthy count the quota cannot be
    // honored, and the partner surface is cost-bearing by definition.
    return NextResponse.json(
      { error: "service-unavailable" },
      { status: 503 },
    );
  }
  if ((usedThisMonth ?? 0) >= keyRow.monthly_quota) {
    await recordUsage("quota_exceeded");
    return NextResponse.json(
      { error: "quota_exceeded — monthly limit reached" },
      { status: 429 },
    );
  }

  // Gate 5 — body shape (pure parser, unit-tested).
  const body = await request.json().catch(() => null);
  const parsed = parsePartnerChatInput(body);
  if (!parsed.ok) {
    await recordUsage("rejected");
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { message, history, language: langOverride } = parsed.value;

  // Gate 6 — intent boundary (v1 = general conversation only).
  const intent = classifyEvoIntent(message);
  if (intent.isPlanCreation || intent.isSwapRequest) {
    await recordUsage("rejected");
    return NextResponse.json(
      {
        error:
          "unsupported-intent — the partner API serves general conversation only (plan/swap requests are platform surfaces)",
      },
      { status: 400 },
    );
  }

  const dispatchStartedAt = Date.now();

  // Gate 7 — crisis shield (served, metered, never model-dispatched).
  const crisis = detectEvoCrisis(message);
  if (crisis) {
    const reply = evoCrisisReply(crisis, isArabicText(message));
    const latencyMs = Date.now() - dispatchStartedAt;
    await recordUsage("success", { latencyMs });
    return NextResponse.json({
      reply,
      source: "safety",
      provider: "safety",
      cached: false,
    });
  }

  const language = langOverride ?? detectPartnerLanguage(message);

  // CACHE — first message only (history empty), context-free by
  // construction. Same gate + same store as the platform chat.
  const cacheEligible = isCacheEligibleMessage({
    message,
    historyLength: history.length,
    isSubscriber: false,
    memoryFactCount: 0,
    isPlanCreation: false,
    isSwapRequest: false,
    firstMeeting: false,
  });
  const questionNorm = normalizeEvoQuestion(message);
  const questionHash = createHash("sha256").update(questionNorm).digest("hex");

  if (cacheEligible) {
    const cached = await lookupEvoCacheAnswer(questionHash, questionNorm, language);
    if (cached && cached.answer && cached.answer.length >= 40) {
      const latencyMs = Date.now() - dispatchStartedAt;
      await recordUsage("success", { cacheHit: true, latencyMs });
      after(async () => {
        try {
          if (isSupabaseAdminConfigured && supabaseAdmin) {
            await supabaseAdmin.from("evo_call_stats").insert({
              user_id: null,
              language,
              intent: "general",
              provider: "cache",
              cache_hit: true,
              success: true,
              latency_ms: latencyMs,
            });
            const { data: row } = await supabaseAdmin
              .from("evo_chat_cache")
              .select("hits")
              .eq("id", cached.id)
              .maybeSingle();
            await supabaseAdmin
              .from("evo_chat_cache")
              .update({
                hits: (row?.hits ?? 0) + 1,
                last_hit_at: new Date().toISOString(),
              })
              .eq("id", cached.id);
          }
        } catch (e) {
          console.warn(
            "[api/evo/v1/chat] cache-hit bookkeeping failed (best-effort):",
            e instanceof Error ? e.message : e,
          );
        }
      });
      return NextResponse.json({
        reply: cached.answer,
        source: `cache:${cached.source}`,
        provider: "cache",
        cached: true,
      });
    }
  }

  // DISPATCH — the REAL production prompt, anonymous baseline, via the
  // standard 3-provider chain (no onDelta: v1 is JSON-only).
  const systemPrompt = buildSystemPrompt(PARTNER_BASELINE_CTX, [], null, [], [], false);
  const fullPrompt = `${systemPrompt}\n\nUser: ${message}`;

  try {
    const { text: aiReply, model: aiModel, provider: aiProvider } =
      await callFreeAIFallbackChain(fullPrompt, {
        tag: "evo-partner",
        chain: "fast",
        temperature: 0.6,
        maxTokens: 800,
        timeoutMs: 16_000,
        maxModels: 3,
      });

    // Same user-visible sanitizers as the chat route (route parity).
    const cleaned = stripMarkdownSyntax(
      sanitizeLatexToPlain(stripReasoningBlocks(aiReply || "")),
    ).trim();

    if (cleaned.length < 10) {
      await recordUsage("error");
      return NextResponse.json(
        { error: "upstream-unavailable — try again shortly" },
        { status: 503 },
      );
    }

    const latencyMs = Date.now() - dispatchStartedAt;
    // Quota integrity: the metered row lands BEFORE the response.
    await recordUsage("success", { latencyMs });

    // Telemetry + cache store — best-effort, never in the latency path.
    after(async () => {
      try {
        if (isSupabaseAdminConfigured && supabaseAdmin) {
          await supabaseAdmin.from("evo_call_stats").insert({
            user_id: null,
            language,
            intent: "general",
            provider: aiProvider,
            cache_hit: false,
            success: true,
            latency_ms: latencyMs,
          });
        }
      } catch (e) {
        console.warn(
          "[api/evo/v1/chat] call-stats write failed (best-effort):",
          e instanceof Error ? e.message : e,
        );
      }
      if (
        cacheEligible &&
        cleaned.length >= EVO_CACHE_MIN_ANSWER_CHARS
      ) {
        await storeEvoCacheAnswer(
          questionHash,
          questionNorm,
          language,
          cleaned,
          aiModel ? `${aiProvider}:${aiModel}` : aiProvider,
        );
      }
    });

    return NextResponse.json({
      reply: cleaned,
      source: aiModel ? `${aiProvider}:${aiModel}` : aiProvider,
      provider: aiProvider,
      cached: false,
    });
  } catch (e) {
    console.error(
      "[api/evo/v1/chat] dispatch failed:",
      e instanceof Error ? e.message : e,
    );
    await recordUsage("error");
    return NextResponse.json(
      { error: "upstream-unavailable — try again shortly" },
      { status: 503 },
    );
  }
}
