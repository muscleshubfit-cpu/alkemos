import { NextRequest, NextResponse, after } from "next/server";
import { createHash } from "crypto";
import { callFreeAIFallbackChain, parseJSON } from "@/lib/ai-provider";
import { requireUser, isAuthConfigured, type AuthUser } from "@/lib/auth-server";
import { clientIp } from "@/lib/rate-limit";
import {
  checkEvoChatLimit,
  recordEvoChatUsage,
  checkEvoPlanQuota,
  checkAnonChatLimit,
  recordAnonChatUsage,
} from "@/lib/tier-limits";
import { classifyEvoIntent } from "@/lib/evo-intent";
import {
  detectEvoCrisis,
  evoCrisisReply,
  isArabicText,
} from "@/lib/evo-safety";
import {
  searchPlatform,
  getFoodNutrition,
  isNutritionQuery,
  isExerciseQuery,
  isProgramQuery,
  type SearchResult,
} from "@/lib/evo-search";
import {
  sanitizeLatexToPlain,
  stripMarkdownSyntax,
} from "@/lib/evo-chat-format";
import {
  buildEvoMemoryPrompt,
  capTranscriptForExtraction,
  formatEvoMemoryForPrompt,
  shouldExtractMemory,
  sanitizeStoredFacts,
  validateMemoryFacts,
  EVO_MEMORY_TOP_INJECT,
  type EvoMemoryFactDraft,
} from "@/lib/evo-memory";
import {
  EVO_HISTORY_CAP_PAID,
  needsFirstMeetingInterview,
  resolveHistoryCap,
} from "@/lib/evo-coach";
import {
  chunkForSse,
  isCacheEligibleMessage,
  normalizeEvoQuestion,
  EVO_CACHE_MIN_ANSWER_CHARS,
} from "@/lib/evo-cache";
import {
  lookupEvoCacheAnswer,
  storeEvoCacheAnswer,
} from "@/lib/evo-cache-server";
import {
  buildSystemPrompt,
  type EvoClientContext,
  type FoodNutritionInfo,
} from "@/lib/evo-system-prompt";
import {
  isSupabaseAdminConfigured,
  supabaseAdmin,
} from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";

/**
 * EVO Chat endpoint — context-aware AI assistant.
 *
 * Features:
 *   1. Platform search — finds exercises, foods, programs, tools
 *   2. Blog RAG — searches Supabase blog_posts for relevant articles
 *   3. OpenRouter + Groq AI (owner directive 2026-08-27)
 *   4. Anonymous mode — works without login. T-AI-DEEP-AUDIT-V2 (D3):
 *      anonymous traffic is throttled SERVER-SIDE per hashed client IP
 *      (evo_anon_usage ledger, migration 0028) — the old "client-side
 *      counter only" posture let scripts bleed OpenRouter credits.
 *   5. Subscriber mode — full context (plans, progress, questionnaires)
 *
 * 2026-08-28 T-AI-DEEP-AUDIT-V2 (D4 — MONTHLY PLAN QUOTA):
 *   The advertised "3/6 plans per month" quotas were never enforced —
 *   this chat is the only member-reachable "EVO builds me a plan"
 *   surface, and it let paid tiers generate unlimited plans. Now
 *   plan-creation intents (evo-intent.ts) are counted per domain
 *   (nutrition/workout) in the SAME tamper-proof ledger, against
 *   evoNutritionPlanLimit / evoWorkoutPlanLimit. Swap intents stay on
 *   the weekly /api/ai/jobs flow — NOT double-counted here.
 *
 * 2026-08-27 CRITICAL FIXES:
 *   G1/G2 — usage is recorded SERVER-SIDE in the tamper-proof
 *     evo_chat_usage ledger before each AI dispatch. The old design counted
 *     client-written chat_messages rows and let "clear history" reset the quota.
 *   G3/G4 — the tier now comes from the VERIFIED auth session
 *     (getAuthUser: status='active' + end_date>now), not from a browser-client
 *     query that ignored expiry and ran under anonymous RLS.
 *   G5 — the subscriber-only feature gate applies by ACTUAL tier:
 *     authenticated FREE users are gated exactly like anonymous visitors,
 *     and the system prompt only declares a subscriber when tier limits say so.
 *   M-security — message/history length clamped + blog ilike filter escaped.
 */

// Back-compat re-export type (routes/tests may reference AuthUser).
export type { AuthUser };

/** Hard input clamp — prevents multi-MB payloads burning provider tokens. */
const MAX_MESSAGE_LENGTH = 4_000;
/**
 * EVO-3 (W2.4): the WIRE clamp is the LARGEST cap (paid). The effective
 * per-request window is tier-resolved after auth — 16 messages for paid
 * subscribers (owner-approved cost trade-off, master plan W2) and the
 * unchanged 10 for everyone else (M-security clamps stay intact).
 */
const MAX_HISTORY_ITEMS = EVO_HISTORY_CAP_PAID;
const MAX_HISTORY_ITEM_LENGTH = 2_000;

/**
 * D3 — salted hash of the client IP. No raw IPs are stored; rotating
 * EVO_ANON_SALT invalidates all existing anon counters (documented).
 * Missing proxy headers collapse into one shared conservative bucket —
 * on Vercel x-forwarded-for is always present.
 */
function getAnonKey(request: NextRequest): string {
  // H3 (2026-09-07): clientIp() takes the LAST x-forwarded-for hop
  // (the trusted proxy's entry) — split(",")[0] was attacker-spoofable.
  const ip = clientIp(request);
  const salt = process.env.EVO_ANON_SALT || "mhe-evo-anon-v1";
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex").slice(0, 32);
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate (optional — works for anonymous too)
    let userId: string | undefined;
    let userName: string | undefined;
    let authTier: string | null = null;
    let authIsStaff = false;
    if (isAuthConfigured) {
      const auth = await requireUser(request);
      if (!(auth instanceof Response)) {
        userId = auth.id;
        userName = auth.full_name || auth.email || undefined;
        // G3/G4 fix: already verified active + non-expired by getAuthUser().
        authTier = auth.membership_tier;
        // STAFF QUOTA SEMANTICS: platform staff (coach|admin) bypass
        // every consumer usage limit below.
        authIsStaff = auth.is_staff;
      }
      // If auth fails (401), we continue as anonymous — EVO is free for all
    }

    const body = await request.json().catch(() => ({}));
    const rawMessage = typeof body?.message === "string" ? body.message : "";
    const rawHistory: unknown[] = Array.isArray(body?.history)
      ? body.history.slice(-MAX_HISTORY_ITEMS)
      : [];
    const message = rawMessage.trim().slice(0, MAX_MESSAGE_LENGTH);

    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    // ── Effective tier resolution (G5 fix) ────────────────────────────
    // A paid-tier subscription resolves to "coaching"/"pro"/"premium"
    // (unlimited EVO). Everything else — including AUTHENTICATED FREE
    // accounts — is subject to the free daily limit AND the
    // subscriber-only feature gate.
    const isPaidTier =
      !!userId && ["premium", "pro", "coaching"].includes(authTier || "");

    // EVO-3 (W2.4) — tier-resolved history window: paid subscribers keep
    // 16 turns of context, everyone else keeps the classic 10. The wire
    // was already clamped to the paid cap; this slice enforces the tier.
    const history = rawHistory
      .slice(-resolveHistoryCap(isPaidTier))
      .filter((m): m is { role: unknown; content: string } => {
        if (!m || typeof m !== "object") return false;
        return typeof (m as { content?: unknown }).content === "string";
      })
      .map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: String(m.content).slice(0, MAX_HISTORY_ITEM_LENGTH),
      }));

    // 0. SAFETY SHIELD (EVO-1 — W5.3 of docs/EVO-MASTER-PLAN.md):
    //    self-harm / eating-disorder signals NEVER reach a model. Static
    //    warm redirect to real human help, written by us, in the user's
    //    language — BEFORE any quota is consumed (a crisis message must
    //    never be throttled by or billed to the daily limit).
    const crisis = detectEvoCrisis(message);
    if (crisis) {
      return NextResponse.json({
        response: evoCrisisReply(crisis, isArabicText(message)),
        links: [],
        source: "safety",
      });
    }

    // 1.5 Server-side daily limit check (C15+G1).
    //   Logged-in: tamper-proof evo_chat_usage ledger, verified tier.
    //   Anonymous (D3): same shape against the evo_anon_usage ledger,
    //   keyed by hashed client IP — free-tier daily limit applies.
    let limitUsed = 0;
    let limitValue: number | null = null;
    let anonKey: string | undefined;
    if (userId) {
      const limitCheck = await checkEvoChatLimit(userId, authTier, authIsStaff);
      limitUsed = limitCheck.used;
      limitValue = limitCheck.limit;
      if (!limitCheck.allowed) {
        const resetMsg =
          limitCheck.limit !== null
            ? `\n\nYou've used ${limitCheck.used}/${limitCheck.limit} messages today. The limit resets at midnight.`
            : "";
        return NextResponse.json(
          {
            response: `⏰ You've reached today's EVO chat limit.${resetMsg}\n\nUpgrade to Premium or Pro for unlimited messages.`,
            links: [{ label: "View membership plans →", url: "/memberships" }],
            source: "rate-limit",
            rateLimited: true,
            used: limitCheck.used,
            limit: limitCheck.limit,
          },
          { status: 429, headers: { "Retry-After": "3600" } },
        );
      }
    } else {
      // D3 — anonymous visitors: server-side per-IP throttling.
      anonKey = getAnonKey(request);
      const anonCheck = await checkAnonChatLimit(anonKey);
      limitUsed = anonCheck.used;
      limitValue = anonCheck.limit;
      if (!anonCheck.allowed) {
        return NextResponse.json(
          {
            response: `⏰ You've reached today's EVO chat limit (${anonCheck.used}/${anonCheck.limit} messages). The limit resets at midnight.\n\nCreate a free account or subscribe to Premium/Pro for more.`,
            links: [{ label: "View membership plans →", url: "/memberships" }],
            source: "rate-limit",
            rateLimited: true,
            used: anonCheck.used,
            limit: anonCheck.limit,
          },
          { status: 429, headers: { "Retry-After": "3600" } },
        );
      }
    }

    // SUBSCRIBER-ONLY features: meal plans, workout plans, meal generation,
    // macro calculations, swap suggestions.
    // G5 FIX: gate fires for EVERYONE without a paid tier — including
    // authenticated free accounts (previously bypassed with any login).
    // D4: the flat list moved to evo-intent.ts so plan-creation intents
    // can be quota'd per domain without touching the gate coverage.
    const intent = classifyEvoIntent(message);

    if (intent.isSubscriberOnly && !isPaidTier) {
      return NextResponse.json({
        response:
          "🔒 This feature is for subscribers only. Meal plans, workout plans, and meal generation require an active Premium/Pro/Coaching subscription.\n\nFree features I can help with:\n• Exercise info and instructions\n• Food calories and macros\n• Fitness calculators\n• General fitness Q&A\n\nSubscribe to get personalized meal & workout plans!",
        links: [
          {
            label: "View membership plans →",
            url: "/memberships",
          },
        ],
        source: "subscriber-gate",
      });
    }

    // 1.6 D4 — WEEKLY + MONTHLY plan-generation quota (paid tiers only;
    // free users were already blocked by the subscriber gate above).
    // Plan-creation intents count per domain against the tier's WEEKLY cap
    // (1+1 — Pro 2+2, owner decree 2026-09-02) AND the MONTHLY total
    // (4+4 — Pro 8+8). Swap intents intentionally NOT counted here —
    // they ride the weekly /api/ai/jobs quota (no double-billing).
    if (intent.isPlanCreation && isPaidTier && userId) {
      const quota = await checkEvoPlanQuota(
        userId,
        intent.planDomain,
        authTier,
        authIsStaff,
      );
      if (!quota.allowed) {
        const domainLabel =
          intent.planDomain === "nutrition" ? "meal" : "workout";
        const upgradeHint =
          authTier === "pro"
            ? ""
            : "\n\nUpgrade to Pro for 8 plans per month (2 per week).";
        const responseText =
          quota.blockedBy === "week"
            ? `⏰ You've hit the weekly cap: ${quota.weekly.used}/${quota.weekly.limit} ${domainLabel} plans this week. The weekly cap resets on Monday — your monthly total (${quota.used}/${quota.limit}) is still available.${upgradeHint}`
            : `⏰ You've used ${quota.used}/${quota.limit} ${domainLabel} plans this month. Your quota resets on the 1st of each month.${upgradeHint}`;
        return NextResponse.json(
          {
            response: responseText,
            links: [{ label: "View membership plans →", url: "/memberships" }],
            source: "rate-limit",
            rateLimited: true,
            used: quota.used,
            limit: quota.limit,
          },
          { status: 429, headers: { "Retry-After": "3600" } },
        );
      }
    }

    // 2. Search the platform's local databases (exercises, foods, programs, tools)
    const platformResults = searchPlatform(message);
    const foodNutrition = isNutritionQuery(message) ? getFoodNutrition(message) : null;

    // 3. Only search the blog if the platform search didn't find high-relevance results
    //    This prevents EVO from returning blog links instead of the actual exercise/food page
    const hasHighRelevancePlatformResult = platformResults.some((r) => r.relevance >= 0.4);
    const blogResults = hasHighRelevancePlatformResult
      ? [] // Skip blog search — we already found a specific platform page
      : await searchBlog(message);

    // 4. Build links from search results — platform results FIRST, blog SECOND
    const links: Array<{ label: string; url: string }> = [];

    // Platform links (exercises, foods, programs, tools) — only relevant results
    const highRelevancePlatform = platformResults.filter((r) => r.relevance >= 0.3);
    for (const result of highRelevancePlatform.slice(0, 3)) {
      links.push({
        label: `${result.nameAr} — ${result.description}`,
        url: result.url,
      });
    }

    // Blog links — only if no high-relevance platform results
    if (highRelevancePlatform.length === 0) {
      for (const blog of blogResults.slice(0, 2)) {
        links.push({
          label: `📖 ${blog.title}`,
          url: blog.url,
        });
      }
    }

    // 5. Build context for the AI — subscribers only (G5 fix: the flag now
    // reflects the REAL tier, not merely being logged in).
    let clientContext: EvoClientContext = { name: userName || "المستخدم", isSubscriber: false };
    if (userId && isPaidTier) {
      try {
        // Subscriber data comes via service-role queries inside the data layer.
        const [plans, progress, nutriQ, fitQ] = await Promise.all([
          listPlansSafe(userId),
          listProgressSafe(userId),
          getQuestionnaireSafe(userId, "nutrition"),
          getQuestionnaireSafe(userId, "fitness"),
        ]);

        clientContext = {
          name: userName || "العميل",
          isSubscriber: true,
          nutrition: nutriQ || null,
          fitness: fitQ || null,
          recent_measurements: progress.slice(-3).map((p) => ({
            weight: p.weight,
            waist: p.waist,
            date: p.created_at,
          })),
          current_plans: plans.map((p) => ({
            type: p.type,
            title: p.title,
            content: p.content,
          })),
          subscription: { tier: authTier },
        };
      } catch (e) {
        console.error("[api/ai/chat] Failed to load subscriber context:", e);
      }
    }

    // 5.5 EVO-2 (W3, D1 of 163.1) — PERMANENT MEMORY for EVERY logged-in
    // user (free included — D1 lifted the paid gate on this NEW layer only;
    // the Phase-69 chat_messages restore gating is untouched). Anonymous
    // visitors have no account → no memory (nothing to attach facts to).
    // Fail-soft: a memory outage degrades to “no memory”, never to a
    // failed chat.
    let memoryFacts: EvoMemoryFactDraft[] = [];
    if (userId && isSupabaseAdminConfigured && supabaseAdmin) {
      try {
        const { data: memRows } = await supabaseAdmin
          .from("evo_memory")
          .select("fact, category")
          .eq("client_id", userId)
          .eq("is_active", true)
          .order("updated_at", { ascending: false })
          .limit(EVO_MEMORY_TOP_INJECT);
        if (memRows) memoryFacts = sanitizeStoredFacts(memRows);
      } catch (e) {
        console.warn("[api/ai/chat] memory load failed (fail-soft):", e instanceof Error ? e.message : e);
      }
    }

    // 6. Build the system prompt with platform context
    // EVO-3 (W2.1) — FIRST-MEETING INTERVIEW gate: a paid subscriber who
    // asks for a plan without the matching questionnaire gets a real
    // coach interview (3-4 questions) instead of generation from nothing.
    const firstMeeting = needsFirstMeetingInterview({
      isSubscriber: clientContext.isSubscriber,
      isPlanCreation: intent.isPlanCreation,
      planDomain: intent.planDomain,
      hasNutritionQuestionnaire: clientContext.nutrition != null,
      hasFitnessQuestionnaire: clientContext.fitness != null,
    });
    const systemPrompt = buildSystemPrompt(
      clientContext,
      platformResults,
      foodNutrition,
      blogResults,
      memoryFacts,
      firstMeeting,
    );

    const messages = [
      ...history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const chatPrompt = messages
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n\n");
    const fullPrompt = `${systemPrompt}\n\n${chatPrompt}\n\nAssistant:`;

    // 6.5 G1 + D3 + D4 — record usage BEFORE dispatch in tamper-proof
    // ledgers (record-before-dispatch closes the concurrent-burst window):
    //   chat   → every logged-in dispatch (daily quota evidence)
    //   plan_* → paid-tier plan-creation dispatches (monthly quota evidence)
    //   anon   → anonymous dispatches (per-IP daily quota evidence)
    if (userId) {
      await recordEvoChatUsage(userId, "chat");
      if (isPaidTier && intent.isPlanCreation) {
        await recordEvoChatUsage(userId, `plan_${intent.planDomain}`);
      }
    } else if (anonKey) {
      await recordAnonChatUsage(anonKey, "chat");
    }

    // 6.7 EVO-5 (W5) — frequent-question cache + call telemetry.
    //
    // CACHE (safety posture first): only a CONTEXT-FREE request may be
    // served from evo_chat_cache — empty history, no subscriber context,
    // no memory facts, no plan/swap intent, no first-meeting, no crisis
    // (crisis returned earlier). A cache-served message STILL consumed
    // its quota above (record-before-dispatch) — the cache saves provider
    // cost, never user limits. Lookup = one RPC round trip (exact hash
    // first, then pg_trgm similarity ≥ floor, same language, unexpired).
    // FAIL-OPEN: any cache error falls through to the normal dispatch.
    //
    // TELEMETRY: one evo_call_stats row per dispatch (model, cache, or
    // local fallback) written best-effort in `after()` — never in the
    // user's latency path. Static JSON replies (crisis / gates / 429)
    // are NOT model dispatches — no row, by design.
    const replyLanguage = isArabicText(message) ? "ar" : "en";
    const intentLabel = evoIntentLabel(intent);
    const cacheEligible = isCacheEligibleMessage({
      message,
      historyLength: history.length,
      isSubscriber: clientContext.isSubscriber,
      memoryFactCount: memoryFacts.length,
      isPlanCreation: intent.isPlanCreation,
      isSwapRequest: intent.isSwapRequest,
      firstMeeting,
    });
    const questionNorm = normalizeEvoQuestion(message);
    const questionHash = createHash("sha256").update(questionNorm).digest("hex");

    const dispatchStartedAt = Date.now();
    let statProvider = "local";
    let statModel = "";
    let statSuccess = false;
    let statCacheHit = false;

    // EVO-2 — declared here (was next to the stream below) so the
    // cache-hit path also captures the final text for memory extraction.
    let finalReplyText = "";
    const sseEncoder = new TextEncoder();

    if (cacheEligible) {
      const cached = await lookupEvoCacheAnswer(questionHash, questionNorm, replyLanguage);
      if (cached && cached.answer && cached.answer.length >= 40) {
        statProvider = "cache";
        statSuccess = true;
        statCacheHit = true;
        const cacheLatencyMs = Date.now() - dispatchStartedAt;
        // Serve the ORIGINAL answer — but the LINKS stay freshly computed
        // for THIS question (search ran above), so a cache hit never
        // shows another request's links.
        const chunks = chunkForSse(cached.answer);
        const cacheStream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const send = (event: string, data: unknown) => {
              controller.enqueue(sseEncoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
            };
            try {
              // Gentle pacing so the client renders it like a live stream.
              for (const chunk of chunks) {
                send("delta", { text: chunk });
                await new Promise((resolve) => setTimeout(resolve, 15));
              }
              finalReplyText = cached.answer;
              send("final", {
                response: cached.answer,
                links,
                source: `cache:${cached.source}`,
              });
            } finally {
              controller.close();
            }
          },
        });

        // Post-response bookkeeping — identical posture to the miss path.
        if (userId) {
          const uid = userId;
          after(async () => {
            await recordMemoryProgress(uid, history, message, finalReplyText);
          });
        }
        after(async () => {
          try {
            if (isSupabaseAdminConfigured && supabaseAdmin) {
              await supabaseAdmin.from("evo_call_stats").insert({
                user_id: userId ?? null,
                language: replyLanguage,
                intent: intentLabel,
                provider: "cache",
                cache_hit: true,
                success: true,
                latency_ms: cacheLatencyMs,
              });
              // Best-effort hit bump (read-modify-write; ±1 races harmless).
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
              "[api/ai/chat] cache-hit bookkeeping failed (best-effort):",
              e instanceof Error ? e.message : e,
            );
          }
        });

        return new Response(cacheStream, {
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
          },
        });
      }
    }

    // 7. Try AI via callFreeAIFallbackChain — Phase 89: TRUE TOKEN STREAMING.
    //    Success responses are SSE (text/event-stream):
    //      event: delta → raw model tokens live (user sees typing as they arrive)
    //      event: final → CLEANED full text + links + source (client swaps it in)
    //      event: error → mid-stream failure (client keeps the partial text)
    //    429/quota and pre-stream failures stay JSON — the client sniffs the
    //    content-type and handles both shapes. Cleaning still needs the full
    //    text (LaTeX/reasoning stripping), so `final` may differ slightly from
    //    the raw streamed tokens — by design (quality floor unchanged).
    //    maxModels=3 × self-clamped ≤17s each → worst ~52s (Vercel-safe).
    const localReplyFallback = () =>
      generateLocalReply(message, clientContext, platformResults, foodNutrition, blogResults);

    const sseStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(sseEncoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };
        const sendFinal = (response: string, source: string) => {
          finalReplyText = response;
          send("final", { response, links, source });
        };
        try {
          // OWNER DIRECTIVE #1 (2026-08-27): interactive chat uses the
          // speed-first chain (fastest free models, accuracy-checked).
          // Phase 89: raw tokens stream to the user via onDelta while the
          // chain keeps its fast-order + key-rotation + fallback policy.
          const { text: aiReply, model: aiModel, provider: aiProvider } = await callFreeAIFallbackChain(
            fullPrompt,
            {
              tag: "evo-chat",
              temperature: 0.6,
              maxTokens: 800,
              timeoutMs: 16_000,
              maxModels: 3,
              chain: "fast",
              onDelta: (chunk) => send("delta", { text: chunk }),
            },
          );

          if (aiReply && aiReply.trim().length > 5) {
            // Clean up reasoning artifacts from models that sometimes include
            // "thinking process" content in the response.
            let cleanText = aiReply;

            // 1. Strip <think>...</think>, <reasoning>...</reasoning>,
            //    <reflection>...</reflection>, <analysis>...</analysis> blocks
            cleanText = cleanText
              .replace(/<think>[\s\S]*?<\/think>\s*/gi, "")
              .replace(/<reasoning>[\s\S]*?<\/reasoning>\s*/gi, "")
              .replace(/<reflection>[\s\S]*?<\/reflection>\s*/gi, "")
              .replace(/<analysis>[\s\S]*?<\/analysis>\s*/gi, "");

            // 2. Strip "Here's a thinking process:" / "Thinking process:" headers
            cleanText = cleanText
              .replace(/^Here's a thinking process:?\s*/i, "")
              .replace(/^Thinking process:?\s*/i, "")
              .replace(/^Step-by-step thinking:?\s*/i, "")
              .replace(/^Reasoning:?\s*/i, "")
              .replace(/^Let me think about this:?\s*/i, "");

            // 3. Try to extract the final answer if the model wrote reasoning
            //    steps followed by a "Final Answer:" / "Draft:" / "Response:" marker.
            const finalAnswerMatch = cleanText.match(
              /(?:Final Answer|Final answer|Formulate Response|Draft|Response):?\s*:?\s*\n?\s*"([^"]+)"/i,
            );
            if (finalAnswerMatch && finalAnswerMatch[1]) {
              cleanText = finalAnswerMatch[1].trim();
            } else {
              // 4. Strip numbered reasoning steps at the start.
              const lines = cleanText.split("\n");
              let answerStartIdx = 0;
              let foundNumberedStep = false;
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                if (/^\d+\.\s+\*\*?[A-Z]/.test(line)) {
                  foundNumberedStep = true;
                  answerStartIdx = i + 1;
                  continue;
                }
                if (/^[-*]\s+\*\*?[A-Z]/.test(line) || /^\*\*?[A-Z][a-z]+\s*\*?\*?:\s/.test(line)) {
                  foundNumberedStep = true;
                  answerStartIdx = i + 1;
                  continue;
                }
                if (foundNumberedStep && line.length > 20 && !/^(step|draft|formulate|analyze|strategy|determine|response):/i.test(line)) {
                  answerStartIdx = i;
                  break;
                }
              }
              if (answerStartIdx > 0) {
                cleanText = lines.slice(answerStartIdx).join("\n").trim();
              }
            }

            // 5. Strip leading "**" + numbered thinking steps (legacy cleanup)
            cleanText = cleanText.replace(/^\*\*\d+\.\s+/m, "").trim();

            // 6. Strip wrapping quotes (model wrote: "answer here")
            cleanText = cleanText.replace(/^"([^"]+)"$/, "$1").trim();

            // 6.5 OWNER 2026-08-27: LATEX→PLAIN + MARKDOWN STRIP sanitizer.
            // The chat renders plain text only — live evidence showed raw
            // "\\frac{4}{3}\\pi r^{3}" reaching users verbatim (models ignore
            // the no-LaTeX law occasionally; this is the guaranteed floor).
            cleanText = sanitizeLatexToPlain(cleanText);
            cleanText = stripMarkdownSyntax(cleanText);

            // 7. Final validation: too-short output falls back to local reply.
            if (cleanText.length < 10 || /^\s*\d+\.\s+\*\*?[A-Z]/.test(cleanText)) {
              console.warn("[api/ai/chat] Cleaned text still looks like reasoning, using local fallback");
              sendFinal(localReplyFallback(), "local");
            } else {
              // EVO-5 telemetry: a real model answer reached the user.
              statProvider = aiProvider;
              statModel = aiModel;
              statSuccess = true;
              sendFinal(cleanText, `${aiProvider}:${aiModel}`);
            }
          } else {
            // Model returned an unusably short text → local fallback.
            sendFinal(localReplyFallback(), "local");
          }
        } catch (aiErr) {
          console.error("[api/ai/chat] AI fallback chain failed:", aiErr);
          const aiMsg = aiErr instanceof Error ? aiErr.message : String(aiErr);
          if (/stream failed mid-way/i.test(aiMsg)) {
            // Tokens already reached the user — no silent model switch / no
            // replacement; the client keeps the partial text and is told the
            // stream was interrupted.
            send("error", { message: "stream interrupted" });
          } else {
            // Nothing streamed (providers failed before the first token) —
            // graceful local fallback, same as the pre-streaming era.
            sendFinal(localReplyFallback(), "local");
          }
        } finally {
          controller.close();
        }
      },
    });

    // EVO-2 (W3) — memory bookkeeping runs AFTER the response completes
    // (Next.js `after`): NEVER in the user's latency path, never delaying
    // the stream close (the client renders the final bubble on close).
    // Counter increments per dispatched message; every 10th (W3: «بعد كل
    // 10 رسائل») triggers the cheap fast-chain extraction. Anonymous
    // visitors: no account → no memory (D1).
    if (userId) {
      const uid = userId;
      after(async () => {
        await recordMemoryProgress(uid, history, message, finalReplyText);
      });
    }

    // EVO-5 (W5) — post-response telemetry + cache store (best-effort,
    // fail-soft, never in the user's latency path):
    //   1. one evo_call_stats row for THIS dispatch (provider “local” =
    //      the chain fell back → success=false — the dashboard counts it
    //      as the fallback share, not a model success);
    //   2. eligible successful MODEL answers populate evo_chat_cache
    //      (48h TTL, unique normalized hash — first writer wins).
    after(async () => {
      try {
        if (isSupabaseAdminConfigured && supabaseAdmin) {
          await supabaseAdmin.from("evo_call_stats").insert({
            user_id: userId ?? null,
            language: replyLanguage,
            intent: intentLabel,
            provider: statProvider,
            cache_hit: statCacheHit,
            success: statSuccess,
            latency_ms: Date.now() - dispatchStartedAt,
          });
        }
      } catch (e) {
        console.warn(
          "[api/ai/chat] call-stats write failed (best-effort):",
          e instanceof Error ? e.message : e,
        );
      }
      if (
        cacheEligible &&
        statSuccess &&
        statProvider !== "local" &&
        finalReplyText.length >= EVO_CACHE_MIN_ANSWER_CHARS
      ) {
        await storeEvoCacheAnswer(
          questionHash,
          questionNorm,
          replyLanguage,
          finalReplyText,
          statModel ? `${statProvider}:${statModel}` : statProvider,
        );
      }
    });

    return new Response(sseStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (e) {
    console.error("[api/ai/chat] Error:", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/* ---------------- Safe data-layer wrappers (fail-soft) ---------------- */

/** Coarse intent label — the granularity the system actually distinguishes. */
function evoIntentLabel(intent: ReturnType<typeof classifyEvoIntent>): string {
  if (intent.isSwapRequest) return "swap";
  if (intent.isPlanCreation) return `plan_${intent.planDomain}`;
  return "general";
}


async function listPlansSafe(userId: string) {
  try {
    const { listPlans } = await import("@/lib/data");
    return await listPlans(userId);
  } catch {
    return [];
  }
}
async function listProgressSafe(userId: string) {
  try {
    const { listProgress } = await import("@/lib/data");
    return await listProgress(userId);
  } catch {
    return [];
  }
}
async function getQuestionnaireSafe(userId: string, type: "nutrition" | "fitness") {
  try {
    const { getQuestionnaire } = await import("@/lib/data");
    const q = await getQuestionnaire(userId, type);
    return q?.data ?? null;
  } catch {
    return null;
  }
}

/**
 * EVO-2 (W3) — post-response memory bookkeeping (runs inside Next `after`,
 * never in the user's latency path). Counter semantics:
 *   1. read the per-user counter (service-role; evo_memory_state has ZERO
 *      client policies — the browser can never see or reset it, anti-tamper
 *      posture of the evo_chat_usage ledger family);
 *   2. every EVO_MEMORY_EXTRACT_EVERY-th message → cheap fast-chain
 *      extraction (3-provider law — no new provider) over the last
 *      exchange → PII-denial-listed facts → dedup vs existing → insert;
 *   3. reset the counter (extraction cadence restarts).
 * Read-then-upsert tolerance: concurrent same-user dispatches may shift the
 * trigger by ±1 message — harmless by design (documented in the worklog).
 * EVERY failure is fail-soft: memory must never break chat.
 */
async function recordMemoryProgress(
  userId: string,
  history: { role: "user" | "assistant"; content: string }[],
  message: string,
  reply: string,
): Promise<void> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) return;
  try {
    const { data: state } = await supabaseAdmin
      .from("evo_memory_state")
      .select("messages_since_extract")
      .eq("client_id", userId)
      .maybeSingle();
    const nextCount = (state?.messages_since_extract ?? 0) + 1;

    if (!shouldExtractMemory(nextCount)) {
      await supabaseAdmin.from("evo_memory_state").upsert({
        client_id: userId,
        messages_since_extract: nextCount,
        updated_at: new Date().toISOString(),
      });
      return;
    }

    // Extraction — cheap fast chain (nemotron lightning / gpt-oss-20b class).
    const transcript = capTranscriptForExtraction(history, message, reply);
    const prompt = buildEvoMemoryPrompt(transcript);
    if (prompt) {
      const { text } = await callFreeAIFallbackChain(prompt, {
        tag: "evo-memory",
        chain: "fast",
        maxModels: 2,
        temperature: 0.2,
        maxTokens: 400,
        timeoutMs: 12_000,
      });

      // Dedup against a FRESH read of the user's active facts.
      const { data: existing } = await supabaseAdmin
        .from("evo_memory")
        .select("fact")
        .eq("client_id", userId)
        .eq("is_active", true)
        .limit(100);
      const facts = validateMemoryFacts(
        parseJSON(text),
        (existing ?? []).map((r) => r.fact),
      );

      if (facts.length > 0) {
        await supabaseAdmin.from("evo_memory").insert(
          facts.map((f) => ({
            client_id: userId,
            fact: f.fact,
            category: f.category,
            source: "auto_extract",
          })),
        );
      }
    }

    await supabaseAdmin.from("evo_memory_state").upsert({
      client_id: userId,
      messages_since_extract: 0,
      last_extracted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn(
      "[api/ai/chat] memory extraction skipped (fail-soft):",
      e instanceof Error ? e.message : e,
    );
  }
}

/**
 * Search the blog for relevant articles.
 * Searches in the same language as the query.
 * SECURITY: user input is escaped for PostgREST `or=..ilike` filters —
 * commas/parens in a query previously reshaped the filter (injection G6).
 */
async function searchBlog(
  query: string,
): Promise<Array<{ title: string; url: string; excerpt: string }>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) return [];

  try {
    const isArabic = /[\u0600-\u06FF]/.test(query);

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient<Database>(supabaseUrl, serviceKey || supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Escape PostgREST filter metacharacters + strip wildcards/length-clamp.
    const safe = query
      .replace(/[%_(),*]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
    if (!safe) return [];

    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug, title, excerpt, language")
      .eq("is_published", true)
      .eq("language", isArabic ? "ar" : "en")
      .or(`title.ilike.%${safe}%,excerpt.ilike.%${safe}%`)
      .limit(3);

    if (error || !data) return [];

    return data.map((post) => ({
      title: post.title,
      url: `${post.language === "ar" ? "/ar/blog" : "/blog"}/${post.slug}`,
      excerpt: post.excerpt || "",
    }));
  } catch (e) {
    console.error("[api/ai/chat] Blog search failed:", e);
    return [];
  }
}

/**
 * Generate a local reply (fallback when OpenRouter is not available).
 * Uses platform search results to give a helpful answer.
 */
function generateLocalReply(
  message: string,
  ctx: EvoClientContext,
  platformResults: SearchResult[],
  foodNutrition: FoodNutritionInfo,
  blogResults: Array<{ title: string; url: string }>,
): string {
  // If we found food nutrition info (exact match)
  if (foodNutrition) {
    return `${foodNutrition.nameAr} (${foodNutrition.nameEn}):
• ${foodNutrition.per100g.calories} kcal per 100g
• ${foodNutrition.per100g.protein}g protein
• ${foodNutrition.per100g.carbs}g carbs
• ${foodNutrition.per100g.fat}g fat`;
  }

  // Only use platform results if they're HIGH relevance (above 0.6)
  const highRelevanceResults = platformResults.filter((r) => r.relevance >= 0.6);

  // If we found exercises with high relevance
  const exercises = highRelevanceResults.filter((r) => r.type === "exercise");
  if (exercises.length > 0 && isExerciseQuery(message)) {
    const ex = exercises[0];
    return `${ex.nameAr} (${ex.nameEn}) — ${ex.description}.`;
  }

  // If we found programs with high relevance
  const programs = highRelevanceResults.filter((r) => r.type === "program");
  if (programs.length > 0 && isProgramQuery(message)) {
    const prog = programs[0];
    return `${prog.nameAr} — ${prog.description}.`;
  }

  // If we found blog articles
  if (blogResults.length > 0) {
    return `We wrote about this: "${blogResults[0].title}".`;
  }

  // Generic fallback — DON'T mention links if there are none
  return `مقدرش ألاقي معلومات محددة عن ده في المنصة دلوقتي.

تقدر تتصفح:
• مكتبة التمارين (868+ تمرين)
• برامج التدريب الجاهزة
• مكتبة الأكلات (8830+ أكلة)
• الأدوات المجانية (حاسبات)

أو اسألني سؤال تاني محدد أكتر.`;
}
