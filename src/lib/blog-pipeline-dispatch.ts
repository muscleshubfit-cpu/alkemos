/**
 * BLOG PIPELINE DISPATCH — coach generation rides the AUTOMATIC pipeline.
 *
 * PHASE 162 (owner directive 2026-09-10: «مطلوب مسار الكوتش للتوليد يكون
 * نفس مسار التوليد الالى دون تعطيل للتوليد الالى»): article_generate no
 * longer runs a parallel generation system of its own by default — the
 * coach's request DISPATCHES the exact workflow the automatic daily
 * generation uses (`blog-post-ar.yml` / `blog-post-en.yml`, the same files
 * the 05:00/22:00 UTC cron slots fire). The article therefore inherits the
 * full automatic path for free: P0 research → P1 outline → P2 content
 * (1500-2500 words) → P3 images → P4 review/links → P5 PUBLISH + sitemap
 * + the bilingual pairing handshake (`linked_post_id` bidirectional).
 *
 * AUTOMATIC GENERATION IS UNTOUCHED: the cron triggers, concurrency groups
 * (`blog-pipeline-ar` / `blog-pipeline-en`, cancel-in-progress false) and
 * Phase-119 one-slot-per-day tables are exactly as they were — a coach
 * dispatch simply queues another run of the same workflow (never cancels a
 * running one, never skips a scheduled one).
 *
 * TOPIC OVERRIDE: an optional coach topic (≥ MIN_TOPIC_CHARS so it can be
 * legally sealed into a shared brief) rides workflow_dispatch inputs →
 * `PIPELINE_TOPIC` → P0, which seals it into MY side of the pair's brief
 * (the twin keeps its researched topic). Empty/short topic = the pipeline's
 * own research picks the title — the same «مفروض يختار العنوان بنفس نظام
 * التوليد» behavior the automatic run has.
 *
 * TOKEN: `GITHUB_DISPATCH_TOKEN` (same secret and same fine-grained-PAT
 * law as `ai-runner-dispatch.ts` — this repo only, Actions: Read+write).
 *
 * FAIL-OPEN BY DESIGN: a false return NEVER fails the enqueue — the route
 * leaves the ai_jobs row queued and the proven single-shot draft generator
 * (`runArticleGenerate` in ai-job-processors.ts, hardened by 161.4/161.5)
 * processes it as the fallback, so generation never silently dies.
 */

const REPO = "muscleshubfit-cpu/alkemos";
const DISPATCH_TIMEOUT_MS = 8_000;

/** Mirrors blog-pairing MIN_TOPIC_CHARS — a topic shorter than this cannot
 * be sealed into a SharedBrief, so it is NOT honored as an override (the
 * pipeline's research picks the title instead, exactly like automatic runs). */
const MIN_TOPIC_CHARS = 10;

export type PipelineDispatchLang = "ar" | "en";

/**
 * Sanitize a raw coach topic into an override-usable string (or null):
 * trimmed, capped at 300 chars, and only when it is long enough to be
 * sealable in a shared brief.
 */
export function usableCoachTopic(raw: unknown): string | null {
  const t = typeof raw === "string" ? raw.trim().slice(0, 300) : "";
  return t.length >= MIN_TOPIC_CHARS ? t : null;
}

/**
 * Push-dispatch the language's pipeline workflow. True ONLY when GitHub
 * accepted the dispatch (HTTP 204). Never throws.
 */
export async function dispatchBlogPipeline(opts: {
  lang: PipelineDispatchLang;
  /** Raw coach topic — sanitized internally; null/short = no override. */
  topic?: string | null;
  /** ai_jobs receipt id — echoed into the workflow logs for traceability. */
  jobId?: string | null;
}): Promise<boolean> {
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    console.warn(
      "[blog-pipeline-dispatch] GITHUB_DISPATCH_TOKEN missing — article_generate falls back to the single-shot draft generator.",
    );
    return false;
  }
  const workflow = opts.lang === "en" ? "blog-post-en.yml" : "blog-post-ar.yml";
  const inputs: Record<string, string> = {};
  const topic = usableCoachTopic(opts.topic);
  if (topic) inputs.topic = topic;
  if (opts.jobId) inputs.job_id = String(opts.jobId).slice(0, 64);
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/actions/workflows/${workflow}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ref: "main", inputs }),
        signal: AbortSignal.timeout(DISPATCH_TIMEOUT_MS),
      },
    );
    if (res.status !== 204) {
      console.warn(`[blog-pipeline-dispatch] dispatch rejected: HTTP ${res.status}`);
      return false;
    }
    return true;
  } catch (e) {
    console.warn(
      `[blog-pipeline-dispatch] dispatch failed: ${e instanceof Error ? e.message : e}`,
    );
    return false;
  }
}
