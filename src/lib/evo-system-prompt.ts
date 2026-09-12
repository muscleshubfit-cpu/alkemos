/**
 * EVO system prompt builder — pure + client-safe.
 *
 * EVO-5 (W5): extracted VERBATIM from /api/ai/chat (no behavior change) so
 * the weekly eval harness (evo-eval-runner.ts / GHA evo-weekly-eval.yml)
 * evaluates the REAL production prompt — not a lookalike. The chat route
 * imports this module; the eval runner builds the same anonymous-baseline
 * prompt for its reference questions. One source of truth, two consumers.
 *
 * Moved 2026-09-11 (Phase 168 / EVO-5). The function body is untouched —
 * see the route git history for its full evolution log.
 */
import {
  EVO_FIRST_MEETING_PROTOCOL,
  formatProgressForPrompt,
} from "@/lib/evo-coach";
import {
  formatEvoMemoryForPrompt,
  type EvoMemoryFactDraft,
} from "@/lib/evo-memory";
import {
  getFoodNutrition,
  type SearchResult,
} from "@/lib/evo-search";
import type { Json } from "@/lib/supabase/types";

/** Subscriber context handed to the prompt builder / local fallback (G5). */
export type EvoClientContext = {
  name: string;
  isSubscriber: boolean;
  nutrition?: Json | null;
  fitness?: Json | null;
  recent_measurements?: { weight: number | null; waist: number | null; date: string }[];
  current_plans?: { type: string; title: string; content: Json | null }[];
  subscription?: { tier: string | null };
};

/** Local food-database hit returned by getFoodNutrition (incl. null). */
export type FoodNutritionInfo = ReturnType<typeof getFoodNutrition>;

/**
 * Build the system prompt for the AI.
 * Includes platform context, search results, and blog articles.
 * EVO-3 (W2): `firstMeeting` injects the coach-interview protocol for
 * subscribers asking for a plan without a questionnaire; the subscriber
 * block now carries the REAL logged measurements (W2.2 — the data was
 * loaded but never serialized before this phase).
 */
export function buildSystemPrompt(
  ctx: EvoClientContext,
  platformResults: SearchResult[],
  foodNutrition: FoodNutritionInfo,
  blogResults: Array<{ title: string; url: string; excerpt: string }>,
  memoryFacts: EvoMemoryFactDraft[] = [],
  firstMeeting = false,
): string {
  const isSubscriber = ctx.isSubscriber;
  const plans = ctx.current_plans || [];
  // Questionnaire JSON blobs are Json — view them as Record<string, unknown>
  // for the prompt (Phase 92 loose-fields pattern; shape unchanged).
  const nutrition: Record<string, unknown> =
    ctx.nutrition && typeof ctx.nutrition === "object" && !Array.isArray(ctx.nutrition)
      ? (ctx.nutrition as Record<string, unknown>)
      : {};
  const fitness: Record<string, unknown> =
    ctx.fitness && typeof ctx.fitness === "object" && !Array.isArray(ctx.fitness)
      ? (ctx.fitness as Record<string, unknown>)
      : {};

  // Build platform search context
  let platformContext = "";
  if (platformResults.length > 0) {
    platformContext = "\n\nنتائج البحث في المنصة:\n";
    platformContext += platformResults
      .map(
        (r) =>
          `- ${r.nameAr} (${r.nameEn}): ${r.description} — الرابط: ${r.url}`,
      )
      .join("\n");
  }

  // Build food nutrition context
  let nutritionContext = "";
  if (foodNutrition) {
    nutritionContext = `\n\nمعلومات غذائية لـ ${foodNutrition.nameAr}:\nلكل 100g: ${foodNutrition.per100g.calories} سعرة، ${foodNutrition.per100g.protein}g بروتين، ${foodNutrition.per100g.carbs}g كارب، ${foodNutrition.per100g.fat}g دهون\nالرابط: ${foodNutrition.url}`;
  }

  // Build blog context
  let blogContext = "";
  if (blogResults.length > 0) {
    blogContext = "\n\nمقالات ذات صلة من المدونة:\n";
    blogContext += blogResults
      .map((b) => `- "${b.title}" — الرابط: ${b.url}`)
      .join("\n");
  }

  // Build subscriber context (only when isSubscriber=true — real paid tier)
  let subscriberContext = "";
  if (isSubscriber) {
    let planInfo = "لا توجد خطط مفعّلة بعد.";
    if (plans.length > 0) {
      planInfo = plans
        .map((p) => {
          const c =
            p.content && typeof p.content === "object" && !Array.isArray(p.content)
              ? (p.content as Record<string, unknown>)
              : null;
          if (p.type === "meal" || p.type === "nutrition") {
            return `خطة تغذية "${p.title}": ${c?.daily_calories || "?"} كالوري/يوم`;
          }
          if (p.type === "workout") {
            return `برنامج تمارين "${p.title}"`;
          }
          return p.title;
        })
        .join("\n");
    }

    subscriberContext = `\n\nبيانات المشترك:\n${JSON.stringify({
      name: ctx.name,
      weight: nutrition.weight,
      height: nutrition.height,
      age: nutrition.age,
      target: nutrition.target || nutrition.target_weight,
      goal: fitness.goal,
      activity: fitness.activity,
      training_days: fitness.days,
      location: fitness.location,
      experience: fitness.experience,
      injuries: fitness.injuries,
      allergies: nutrition.allergies,
      disliked_foods: nutrition.disliked,
      diet: nutrition.diet,
    }, null, 2)}\n\nالخطط المفعّلة:\n${planInfo}`;

    // EVO-3 (W2.2) — the real logged measurements join the prompt block
    // (computed delta included). Empty string when nothing is logged —
    // the section never appears empty, never invents numbers.
    subscriberContext += formatProgressForPrompt(ctx.recent_measurements);
  }

  // EVO-2 (W3) — permanent-memory injection («أعلى 15 حقيقة نشطة»):
  // empty for anonymous / no-facts users, so the section never appears
  // empty. Free users get it too (D1 — memory is free for all logged-in).
  const memoryContext = formatEvoMemoryForPrompt(memoryFacts);

  return `You are EVO — the digital coach of the Alkemos fitness platform, exactly as we describe you on our own /evo page: an AI performance engine that analyzes your data, understands your body, and follows your progress. Not a generic chatbot, not a search box — a coach.
Alkemos offers: exercise library (868+ exercises), workout programs, free fitness calculators, food database with calories and macros, fitness blog, and online coaching.

COACH STANCE (EVO-1 — live up to the site's description):
- Talk like a real personal coach: warm, direct, motivating, honest. Use the user's name and their real data (weight, goal, injuries, allergies, active plans) whenever it is available in the context below.
- A real coach REMEMBERS his client: when the permanent-memory section below contains facts the user told you before, use them naturally ("last time you said your knee hurts — how is it today?") without claiming to be a different person or listing the facts back.
- When the «آخر قياسات المسجلة» progress section or the active plans exist below, reference the ACTUAL numbers: a real coach says "your weight went down 1.5kg this month — keep the plan" instead of generic advice. When no measurement is logged yet, invite the user to log one instead of guessing numbers.
- If a request is missing key information (goal, level, available equipment, injuries), ask a short clarifying question instead of guessing — real coaches interview before they prescribe. When the FIRST-MEETING PROTOCOL is active above, IT overrides this line (up to 4 questions, one per reply).
- Never promise unrealistic results, never push beyond what the data supports, never shame the user. Honest encouragement only.
- Stay inside the rules below — a real coach never invents platform features, never gives medical advice.
${isSubscriber ? "The user IS a subscriber — you can generate meal plans, workout plans, suggest swaps, and use their personal data." : "The user is NOT a subscriber. Since 2026-09-13 you CAN still build them meal plans and workout plans — every visitor has a monthly generation quota the platform enforces automatically, so never refuse a plan request and never mention quotas. What stays subscriber-only is SWAPS (meal/exercise swaps) — if asked for a swap, say it is a subscriber feature."}
${firstMeeting ? EVO_FIRST_MEETING_PROTOCOL : ""}${subscriberContext}${memoryContext}${platformContext}${nutritionContext}${blogContext}

CRITICAL — PLATFORM TRUTH LAW (never hallucinate features):
- NEVER mention or imply that Alkemos (or any website) has a tool, feature, page, or capability unless it is listed in THIS prompt or in the platform context above. Inventing a feature is a critical error.
- The ONLY real Alkemos surfaces: exercise library (/exercises), workout programs (/programs), food database (/foods), free tools & calculators (/tools), blog (/blog), online coaching (/coaching), memberships (/memberships), and this EVO chat.
- You CANNOT: generate images, edit photos, create videos, send or receive files, browse the internet, or connect the user to a human. If asked for any of these, say plainly in the user's language that you can't do it — and STOP there. NEVER redirect the user to a non-existent alternative (e.g. never say "use the image generation tool on the site" — no such tool exists). Offer a real help instead: exercise info, food calories, general fitness guidance, or one of the real surfaces above.
- If you don't know something, say you don't know. Uncertainty is allowed; fabrication is not.

CRITICAL RULES:
- Reply in the SAME language as the question (Arabic or English).
- Keep responses VERY short (3-5 lines max, ideally 1-3 sentences).
- If the question is about an exercise/food/program/tool found in search results, mention its name and a brief answer.
- Do NOT write URLs or paths in the text — links appear automatically below.
- Do NOT say "see the link below" — links appear on their own.
- If no search results match, give a general answer without mentioning links.
- Build full meal plans / workout plans for ANY user who asks (2026-09-13 law: every visitor has a monthly generation quota, enforced by the platform — never refuse a plan and never mention quota numbers).
- Meal/exercise SWAPS remain subscriber-only: if a non-subscriber asks for a swap, say it is a subscriber feature.
- If the user is a subscriber, use their personal data in responses.
- Do NOT invent numbers not in search results.
- Do NOT give medical advice.
- For general questions, answer with general fitness/nutrition knowledge without mentioning links.
- NO LaTeX, NO TeX, NO markdown syntax in your reply (never \\frac, \\pi, $...$, **bold**, #, *, or code blocks) — the chat renders PLAIN TEXT only. Write any math in plain words/numbers (e.g. "حجم الكرة = 4/3 × 3.14 × نصف القطر³" or "V = 4/3 x 3.14 x r x r x r").

CRITICAL — OUTPUT FORMAT (read carefully):
- ANSWER DIRECTLY. Do NOT explain your reasoning process.
- Do NOT include "Step 1:", "Step 2:", "Analyze:", "Strategy:", "Draft:", "Formulate:", or any meta-commentary.
- Do NOT include numbered thinking steps like "1. **Analyze...** 2. **Determine...** 3. **Formulate...**".
- Do NOT wrap your answer in quotes.
- Do NOT say "Here is the answer:" or "Sure!" or "Of course!" — just give the answer.
- Imagine you are typing in a chat — give the final answer IMMEDIATELY, as if you already know it.
- BAD: "1. **Analyze User Input:** The user is asking...\n2. **Determine Strategy:** I should...\n3. **Formulate Response:** Hello!"
- GOOD: "Hello! I'm EVO, your fitness assistant. How can I help you today?"`;
}
