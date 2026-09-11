/**
 * scripts/blog-runner/legacy-ar-msa.mts
 *
 * PHASE 175 — Arabic Legacy Content Cleanup (owner order «ابدا التنظيف»,
 * 2026-09-11). Executes the recommendation recorded in STATE.md at Phase
 * 174: STAGED REPAIR, NOT DELETION — convert every published AR article
 * still carrying Egyptian/colloquial dialect into Pan-Arab Modern
 * Standard Arabic, through the production AI fallback chain under the
 * SAME Phase-174 MSA law the editor tools enforce (imported from
 * src/lib/blog-msa.ts — no fork).
 *
 * HARD SAFETY CONTRACT (per run, per article):
 *   - SELECT published AR posts only; writes touch content/reading_time/
 *     updated_at ONLY — never slug (Phase 121), never title, never
 *     is_published, never images.
 *   - A conversion reaches the DB only after validateMsaConversion() passes
 *     (zero strong markers, weak strictly improved, length within bounds,
 *     image+link URLs byte-preserved, headings preserved, no banned
 *     session-service wording). Failed validation → retry with the
 *     violations listed → still failing → row untouched, run exits 1.
 *   - Idempotent: needsMsaRepair() gates the queue — clean articles are
 *     skipped, re-runs converge to a no-op.
 *   - Staged: LIMIT / SLUGS inputs allow incremental dispatches.
 *
 * USAGE (inside GHA legacy-ar-cleanup.yml, or locally with the same env):
 *   npx --no-install tsx scripts/blog-runner/legacy-ar-msa.mts
 * ENV:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   OPENROUTER_API(+_KEY), GROQ_API_KEY, NVIDIA_API_KEY
 *   DRY_RUN=1   — queue report only, zero AI calls, zero writes
 *   LIMIT=N     — process at most N queued articles (0 = all)
 *   SLUGS=a,b   — restrict to these slugs (severity order otherwise)
 */
import { supabaseAdmin, isSupabaseAdminConfigured } from "../../src/lib/supabase/admin";
import { callFreeAIFallbackChain } from "../../src/lib/ai-provider";
import {
  AR_MSA_EDITOR_LAW,
  scanArabicDialect,
  needsMsaRepair,
  validateMsaConversion,
  countArabicWords,
} from "../../src/lib/blog-msa";

const DRY_RUN = process.env.DRY_RUN === "1";
const LIMIT = Math.max(0, Number(process.env.LIMIT || "0") || 0);
const SLUGS = (process.env.SLUGS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const MAX_ATTEMPTS = 4;
// CHUNKED mode (175.7): split the article at ## boundaries and convert
// section-by-section — the stubborn-article fix (compression + format
// breaks both shrink with per-section prompts). Env-selectable so a
// dispatch can force it for known-stubborn slugs.
const CHUNKED = process.env.CHUNKED === "1";
const CHUNK_ATTEMPTS = 2;

// Same sentinel contract the editor article_tools use (ai-job-processors).
const MARKER_MAIN = "===CORRECTED===";
const MARKER_NOTES = "===NOTES===";

interface Row {
  id: string;
  slug: string;
  title: string | null;
  reading_time: number | null;
  created_at: string | null;
  content: string | null;
}

/** Parse the sentinel-wrapped model output; null when the payload is
 *  degenerate (zero Arabic characters — the nvidia reasoning-model class
 *  that "succeeds" with an empty content field and English thinking text
 *  in its reasoning fallback).
 *  MARKERLESS FALLBACK (175.7): the five stubborn articles kept failing
 *  on format breaks — models that completed a clean conversion but
 *  dropped the ===CORRECTED=== marker. When the raw text carries real
 *  Arabic + markdown headings, the WHOLE fence-stripped text becomes the
 *  candidate and the deterministic validator stays the gate (preamble
 *  chatter cannot pass the link/image/heading/ratio checks). */
function parseSentinel(raw: string): string | null {
  let text = (raw || "").trim();
  const fence = text.match(/^```[a-zA-Z]*\s*\n([\s\S]*?)\n```$/);
  if (fence) text = fence[1].trim();
  const i = text.indexOf(MARKER_MAIN);
  if (i >= 0) {
    text = text.slice(i + MARKER_MAIN.length);
    const j = text.indexOf(MARKER_NOTES);
    if (j >= 0) text = text.slice(0, j);
  }
  text = text.trim();
  if (text.length === 0) return null;
  // Degenerate payload: a dialect→MSA conversion MUST produce Arabic —
  // zero Arabic characters means the model returned reasoning-only or
  // non-content (observed live: nvidia/nemotron-3-super-120b "succeeded"
  // with 0 Arabic words twice in run 34522943898).
  if (!/[\u0600-\u06FF]/.test(text)) return null;
  return text;
}

function buildPrompt(content: string, retryViolations?: string[], scope: "article" | "section" = "article"): string {
  // Concrete numeric targets (live batch evidence: models complied with
  // explicit counts far better than with prose-only instructions — the
  // compression failures all hit articles where the model had no target).
  const arWords = (content.match(/[\u0600-\u06FF]+/g) || []).length;
  const links = (content.match(/(?<!!)\[[^\]]*\]\([^)]+\)/g) || []).length;
  const images = (content.match(/!\[[^\]]*\]\([^)]+\)/g) || []).length;
  const retry = retryViolations?.length
    ? `\n\n⚠️ محاولة سابقة رُفضت بالتحقق الحتمي بسبب:\n- ${retryViolations.join("\n- ")}\nأعد التحويل معالجًا هذه المخالفات تحديدًا.`
    : "";
  const subject =
    scope === "section"
      ? `هذا المقطع (مقطع واحد فقط من مقالة Alkemos قائمة — ليس مقالًا جديدًا: لا تُوسّع ولا تُضف محتوى، حوّل النص الموجود فقط بحجمه نفسه)`
      : "مقالة Alkemos التالية";
  const whole = scope === "section" ? "أعد المقطع كاملًا من أوله إلى آخره وبحجمه نفسه" : "أعد المقال كاملًا من أوله إلى آخره";
  return (
    `حوّل ${subject} — من العامية المصرية/اللغة غير المعيارية إلى العربية الفصحى الحديثة السهلة (Pan-Arab Modern Standard Arabic) بلا أي لهجة محلية.

أهداف رقمية إلزامية للتحقق الحتمي:
- عدد الكلمات العربية في الناتج يجب أن يكون في نطاق ±20% من: ${arWords} كلمة (الناتج المضغوط/المختصر مرفوض).
- عدد الروابط في الناتج = ${links} ما عدا روابط داخل فقرة CTA ختامية تُحذف وفق القاعدة 7 (لا حذف ولا إضافة غير ذلك — نفس المسارات).
- عدد الصور في الناتج = ${images} بالضبط (نفس الروابط ونفس النص البديل حرفيًا).

قواعد التحويل الصارمة:
1. حوّل كل كلمة أو تركيب عامي (عشان، مش، ازاي، بتاع، كده، عايز، هتلاقي، دلوقتي، كتير، برضه، مفيش، إيه…) إلى مرادفه الفصحى الطبيعي (لأن/حتى، ليس/لا، كيف، مِلْك/خاص، هكذا، يريد، ستجد، الآن، كثير، أيضًا، لا يوجد، ماذا…).
2. صحّح النحو والإملاء وعلامات الترقيم وأعد صياغة الجمل المكسورة صياغة عربية سليمة.
3. حافظ على المعنى والمعلومات والأرقام والحقائق كاملة — لا تُضف معلومات جديدة ولا تحذف أي محتوى.
4. حافظ حرفيًا على الروابط بصيغة Markdown كما هي — لا تغيّر أي رابط أو مسار أو نص رابط — الاستثناء الوحيد: رابط يقع داخل فقرة CTA ختامية تُحذف وفق القاعدة 7 يُحذف معها.
5. حافظ حرفيًا على صور Markdown (![نص](رابط)) كما هي — لا تغيّر النص البديل ولا الرابط.
6. حافظ على بنية العناوين (# و ## و ###) ومستوياتها وترتيبها كما هي — لا تُضف عناوين جديدة ولا تحذف عناوين.
7. احذف أي فقرة ختامية تسويقية تدعو لحجز جلسة أو الانضمام إلى الكوتشينج إن وُجدت في نهاية المقال (الصفحة تعرض بطاقات CTA بعد المقال) — ولا تُضف أي خاتمة تسويقية جديدة.
8. ${whole} — أي بتر أو اختصار للنص يجعل الناتج مرفوضًا.

أعد النتيجة بهذا الشكل الحرفي (لا JSON ولا أسوار كود):
${MARKER_MAIN}
${scope === "section" ? "النص النهائي للمقطع كاملًا بصيغة Markdown" : "النص النهائي كاملًا بصيغة Markdown"}
${MARKER_NOTES}
- أهم التغييرات (٢-٥ نقاط)${scope === "section" ? `\n\nتذكير أخير: حجم المقطع الأصلي ${arWords} كلمة عربية — الناتج بنفس الحجم تمامًا (${Math.round(arWords * 0.8)}-${Math.round(arWords * 1.2)} كلمة).` : ""}` +
    retry +
    `\n\n${scope === "section" ? "المقطع الأصلي" : "المقال الأصلي"} (حوّله كاملًا):\n\n${content}`
  );
}

interface ConvertOk {
  text: string;
  model: string;
  attempts: number;
  weakAfter: number;
  wordsAfter: number;
}
interface ConvertFail {
  error: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function convertArticle(
  slug: string,
  content: string,
): Promise<ConvertOk | ConvertFail> {
  let violations: string[] | undefined;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) await sleep(30_000); // provider-outage breath between attempts
    let text = "";
    let model = "";
    try {
      // P2's own proven full-article knobs (blog-pipeline generateFullArticle):
      // maxTokens 6400 fits Groq's 8000-TPM ceiling (prompt counted), and
      // timeoutMs 150s × maxModels 2 rides the workflow's 360s chain budget
      // (AI_CHAIN_TOTAL_BUDGET_MS — missing it was the first run's failure).
      ({ text, model } = await callFreeAIFallbackChain(buildPrompt(content, violations), {
        tag: `msa-cleanup:${slug}`,
        systemPrompt: AR_MSA_EDITOR_LAW,
        temperature: 0.3,
        maxTokens: 6_400,
        timeoutMs: 150_000,
        maxModels: 2,
      }));
    } catch (e) {
      // The documented transient class (provider outage: gemma 429 pool,
      // nemotron aborts) — a chain throw is a RETRYABLE attempt failure,
      // never a run crash: the row stays untouched and the next attempt
      // (after the backoff above) re-rolls the chain with its lead rotation.
      violations = [e instanceof Error ? e.message : String(e)];
      console.log(`    attempt ${attempt} chain-thrown (transient provider class): ${violations[0].slice(0, 160)}`);
      continue;
    }
    const candidate = parseSentinel(text);
    if (!candidate) {
      violations = [
        /[\u0600-\u06FF]/.test(text)
          ? "الناتج بلا علامة ===CORRECTED=== الحرفية (خرق تنسيق الإخراج)"
          : "الناتج بلا محتوى عربي (استجابة تفكير فارغة من نموذج reasoning — أعد المحاولة بالمحتوى الفعلي)",
      ];
      console.log(`    attempt ${attempt}: ${violations[0]}`);
      continue;
    }
    const check = validateMsaConversion(content, candidate);
    if (check.ok) {
      return {
        text: candidate,
        model,
        attempts: attempt,
        weakAfter: check.metrics.weakAfter,
        wordsAfter: check.metrics.wordsAfter,
      };
    }
    violations = check.violations;
    console.log(`    attempt ${attempt} rejected: ${violations.join(" | ")}`);
  }
  return { error: `unvalidated after ${MAX_ATTEMPTS} attempts — ${(violations || []).join(" | ")}` };
}

// ── CHUNKED conversion (175.7 — the stubborn-article path) ──────────
// The five articles that defeated 4×full-article attempts share two
// failure modes (whole-article compression + sentinel-format breaks).
// Section-scoped prompts shrink both: the model sees ONE ## section at a
// time, the output is short enough to never compress, and the format
// contract is trivial to hold. Every chunk passes its own validation
// before assembly, and the assembled whole passes the FULL validator.

function splitIntoChunks(content: string): string[] {
  // Split at ## (H2) boundaries; the preamble before the first ## is its
  // own chunk; ### subsections stay inside their ## parent.
  const lines = content.split("\n");
  const chunks: string[][] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (/^##\s/.test(line) && current.join("").trim().length > 0) {
      chunks.push(current);
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.join("").trim().length > 0) chunks.push(current);
  return chunks.map((c) => c.join("\n").trim()).filter((c) => c.length > 0);
}

async function convertChunk(
  chunk: string,
  slug: string,
  idx: number,
  total: number,
): Promise<string | null> {
  const isLastChunk = idx === total - 1;
  let violations: string[] | undefined;
  for (let attempt = 1; attempt <= CHUNK_ATTEMPTS; attempt++) {
    if (attempt > 1) await sleep(15_000);
    try {
      const { text } = await callFreeAIFallbackChain(
        buildPrompt(chunk, violations, "section"),
        {
          tag: `msa-cleanup:${slug}:c${idx}`,
          systemPrompt: AR_MSA_EDITOR_LAW,
          temperature: 0.3,
          // Tight output ceiling (175.9): a section is 150-350 words —
          // generous headroom without room to EXPAND into a new article
          // (the live failure: a 121-word section returned as 838 words).
          maxTokens: 1_800,
          timeoutMs: 150_000,
          maxModels: 2,
        },
      );
      const candidate = parseSentinel(text);
      if (!candidate) {
        violations = [/[\u0600-\u06FF]/.test(text) ? "خرق تنسيق الإخراج" : "ناتج غير عربي"];
        continue;
      }
      // STRICT links for every chunk EXCEPT the last (the article's real
      // CTA tail lives only in the final chunk — a mid-article chunk's
      // own tail must never absorb link drops: the ramadan lesson).
      const check = validateMsaConversion(chunk, candidate, {
        ctaLinkTolerance: isLastChunk,
      });
      if (check.ok) return candidate;
      violations = check.violations;
    } catch (e) {
      violations = [e instanceof Error ? e.message : String(e)];
    }
  }
  console.log(`    chunk ${idx + 1}/${total} failed: ${(violations || []).join(" | ")}`);
  return null;
}

async function convertArticleChunked(
  slug: string,
  content: string,
): Promise<ConvertOk | ConvertFail> {
  const chunks = splitIntoChunks(content);
  const converted: string[] = [];
  for (const [idx, chunk] of chunks.entries()) {
    const out = await convertChunk(chunk, slug, idx, chunks.length);
    if (!out) {
      return { error: `chunk ${idx + 1}/${chunks.length} failed validation after ${CHUNK_ATTEMPTS} attempts` };
    }
    converted.push(out);
  }
  const assembled = converted.join("\n\n");
  const check = validateMsaConversion(content, assembled);
  if (!check.ok) {
    return { error: `assembled article failed: ${check.violations.join(" | ")}` };
  }
  return {
    text: assembled,
    model: `chunked(${chunks.length})`,
    attempts: 1,
    weakAfter: check.metrics.weakAfter,
    wordsAfter: check.metrics.wordsAfter,
  };
}

async function main(): Promise<number> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    console.error(
      "legacy-ar-msa: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are required",
    );
    return 2;
  }
  const { data, error } = await supabaseAdmin
    .from("blog_posts")
    .select("id,slug,title,reading_time,created_at,content")
    .eq("language", "ar")
    .eq("is_published", true)
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) {
    console.error(`DB read failed: ${error.message}`);
    return 2;
  }
  const rows = (data || []) as Row[];
  console.log(
    `legacy-ar-msa: ${rows.length} published AR posts scanned (mode=${DRY_RUN ? "DRY_RUN" : "APPLY"}${CHUNKED ? "+CHUNKED" : ""}${LIMIT ? ` limit=${LIMIT}` : ""}${SLUGS.length ? ` slugs=${SLUGS.join(",")}` : ""})`,
  );

  const scanned = rows.map((row) => ({
    row,
    scan: scanArabicDialect(row.content || ""),
  }));

  let queue = scanned.filter((s) => needsMsaRepair(s.row.content || ""));
  const cleanCount = scanned.length - queue.length;
  queue = queue.sort(
    (a, b) =>
      b.scan.strong * 3 + b.scan.weak - (a.scan.strong * 3 + a.scan.weak),
  );
  if (SLUGS.length) {
    queue = queue.filter((s) => SLUGS.includes(s.row.slug));
    console.log(`slug filter active: ${queue.length} of the queued articles match`);
  }
  if (LIMIT > 0) queue = queue.slice(0, LIMIT);

  console.log(
    `queue: ${queue.length} articles need MSA repair · ${cleanCount} clean (skip — 173 law already holding)\n`,
  );

  if (DRY_RUN) {
    for (const { row, scan } of queue) {
      const top = [...scan.strongHits, ...scan.weakHits]
        .slice(0, 6)
        .map(([m, c]) => `${m}×${c}`)
        .join(", ");
      console.log(
        `  DRY ${row.slug}  S=${scan.strong} W=${scan.weak}  words≈${(row.content || "").split(/\s+/).filter(Boolean).length}  [${top}]`,
      );
    }
    console.log(`\nDRY_RUN complete — zero AI calls, zero writes.`);
    return 0;
  }

  let ok = 0;
  let failed = 0;
  for (const { row, scan } of queue) {
    if (ok + failed > 0) await sleep(5_000); // gentle pacing between articles
    const before = scan.strong * 3 + scan.weak;
    console.log(`\n→ ${row.slug} (S=${scan.strong} W=${scan.weak} severity=${before})`);
    const content = row.content || "";
    if (!content.trim()) {
      console.log("  SKIP: empty content");
      continue;
    }
    const result = CHUNKED
      ? await convertArticleChunked(row.slug, content)
      : await convertArticle(row.slug, content);
    if ("error" in result) {
      failed += 1;
      console.log(`  FAILED (row untouched): ${result.error}`);
      continue;
    }
    // P5 reading-time formula (p5-publish route): ceil(words/200), min 1.
    const words = result.text.split(/\s+/).filter(Boolean).length;
    const reading_time = Math.max(1, Math.ceil(words / 200));
    const { error: upErr } = await supabaseAdmin
      .from("blog_posts")
      .update({
        content: result.text,
        reading_time,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    if (upErr) {
      failed += 1;
      console.log(`  DB WRITE ERROR (row untouched): ${upErr.message}`);
      continue;
    }
    ok += 1;
    console.log(
      `  ✓ repaired (model=${result.model} attempts=${result.attempts}) — S ${scan.strong}→0 · W ${scan.weak}→${result.weakAfter} · words ${countArabicWords(content)}→${result.wordsAfter} · reading_time ${row.reading_time ?? "-"}→${reading_time}`,
    );
  }

  console.log(
    `\nDONE: ${ok} repaired · ${failed} failed · ${queue.length - ok - failed} skipped · clean untouched: ${cleanCount}`,
  );
  return failed > 0 ? 1 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
