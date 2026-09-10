/**
 * EVO-5 (W5) — weekly eval harness runner (server-only).
 *
 * Answers the reference question set (evo-eval.ts) with the REAL production
 * system prompt (evo-system-prompt.ts — anonymous baseline, no RAG) via the
 * standard provider chain, scores each answer with a cheap judge model on
 * the SAME chain, and persists one evo_eval_runs row per question
 * (migration 0081 — service-role writer). Called by
 * scripts/ai-jobs-runner/evo-eval.mts under GHA evo-weekly-eval.yml.
 *
 * POSTURE (mirrors evo-learning-runner.ts):
 * - EVERY failure is contained: one question failing is a soft error that
 *   never aborts the run; a hard failure is a config/write error.
 * - The runner is honest: summary.ok=false when a hard error occurred OR
 *   when ZERO questions scored (an eval that evaluated nothing must not
 *   paint the run green — HONEST RUN COLOR LAW).
 * - Provider tags: "evo-eval" (answers) and "evo-eval-judge" (judge) —
 *   both ride callFreeAIFallbackChain (UNIVERSAL MODEL SWITCHER law).
 *
 * CLEANING: answers get the same user-visible sanitizers as the chat route
 * (think-block strip + sanitizeLatexToPlain + stripMarkdownSyntax) so the
 * curve measures what users actually see.
 *
 * NOTE (evo-learning-runner convention): NO `import "server-only"` here —
 * that package THROWS under plain tsx resolution (the GHA runner has no
 * react-server condition). Server-only-ness is enforced by what this file
 * imports: supabase/admin + ai-provider never touch the client bundle.
 */
import { callFreeAIFallbackChain } from "@/lib/ai-provider";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import {
  buildSystemPrompt,
  type EvoClientContext,
} from "@/lib/evo-system-prompt";
import {
  EVO_EVAL_QUESTIONS,
  buildEvalAnswerPrompt,
  buildEvalJudgePrompt,
  parseEvalVerdict,
  summarizeEvalResults,
  type EvalQuestion,
  type EvalResultRow,
} from "@/lib/evo-eval";
import {
  sanitizeLatexToPlain,
  stripMarkdownSyntax,
} from "@/lib/evo-chat-format";

export type EvoEvalSummary = {
  ok: boolean;
  scored: number;
  avgScore: number;
  safetyFailures: number;
  languageMismatches: number;
  errors: string[];
};

/** Anonymous-baseline context — the eval never sees personal data. */
const BASELINE_CTX: EvoClientContext = {
  name: "EVO Eval",
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

async function answerQuestion(
  question: EvalQuestion,
  systemPrompt: string,
): Promise<{ answer: string; provider: string; model: string }> {
  const { text, provider, model } = await callFreeAIFallbackChain(
    buildEvalAnswerPrompt(systemPrompt, question),
    {
      tag: "evo-eval",
      chain: "fast",
      temperature: 0.6,
      maxTokens: 800,
      timeoutMs: 20_000,
      maxModels: 3,
    },
  );
  // User-visible shape = what the judge grades (route parity).
  const cleaned = stripMarkdownSyntax(
    sanitizeLatexToPlain(stripReasoningBlocks(text || "")),
  ).trim();
  if (cleaned.length < 10) {
    throw new Error(`answer for ${question.id} unusably short (${cleaned.length} chars)`);
  }
  return { answer: cleaned, provider, model };
}

async function judgeAnswer(
  question: EvalQuestion,
  answer: string,
): Promise<{ score: number; safetyPass: boolean; languageMatch: boolean; notes: string }> {
  const { text } = await callFreeAIFallbackChain(buildEvalJudgePrompt({ question, answer }), {
    tag: "evo-eval-judge",
    chain: "fast",
    temperature: 0,
    maxTokens: 300,
    timeoutMs: 15_000,
    maxModels: 2,
  });
  const verdict = parseEvalVerdict(text);
  if (!verdict) throw new Error(`judge verdict for ${question.id} unparseable`);
  return verdict;
}

export async function runEvoWeeklyEval(): Promise<EvoEvalSummary> {
  const errors: string[] = [];
  const rows: EvalResultRow[] = [];

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return {
      ok: false,
      scored: 0,
      avgScore: 0,
      safetyFailures: 0,
      languageMismatches: 0,
      errors: ["supabase service-role is not configured — nothing can be persisted"],
    };
  }

  // The REAL production prompt, anonymous baseline — identical text for
  // every run so the curve is comparable across weeks (stable input).
  const systemPrompt = buildSystemPrompt(BASELINE_CTX, [], null, [], [], false);

  for (const question of EVO_EVAL_QUESTIONS) {
    try {
      const { answer, provider, model } = await answerQuestion(question, systemPrompt);
      let verdict: Awaited<ReturnType<typeof judgeAnswer>>;
      try {
        verdict = await judgeAnswer(question, answer);
      } catch (judgeErr) {
        errors.push(
          `${question.id}: judge failed (${judgeErr instanceof Error ? judgeErr.message : judgeErr})`,
        );
        continue;
      }
      const { error } = await supabaseAdmin.from("evo_eval_runs").insert({
        question_id: question.id,
        language: question.language,
        provider,
        model,
        score: verdict.score,
        safety_pass: verdict.safetyPass,
        language_match: verdict.languageMatch,
        notes: verdict.notes || null,
        answer_excerpt: answer.slice(0, 400),
      });
      if (error) {
        errors.push(`${question.id}: DB write failed — ${error.message}`);
        continue;
      }
      rows.push({
        question_id: question.id,
        language: question.language,
        score: verdict.score,
        safety_pass: verdict.safetyPass,
        language_match: verdict.languageMatch,
      });
    } catch (e) {
      errors.push(`${question.id}: ${e instanceof Error ? e.message : e}`);
    }
  }

  const summary = summarizeEvalResults(rows);
  // Honest color: zero scored questions = the harness did not evaluate —
  // the run is RED even though nothing hard-crashed.
  const ok = errors.length === 0 && summary.count > 0;
  return {
    ok,
    scored: summary.count,
    avgScore: summary.avgScore,
    safetyFailures: summary.safetyFailures,
    languageMismatches: summary.languageMismatches,
    errors,
  };
}
