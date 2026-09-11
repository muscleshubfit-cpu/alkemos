import { NextRequest, NextResponse } from "next/server";
import {
  reviewAndEnhance,
  ensureFaqSection,
  countWords,
  repairArabicLatinContamination,
  type OutlinePlan,
  type ReviewReport,
} from "@/lib/blog-pipeline";
import { scanLatinContamination } from "@/lib/blog-msa";
import { verifyCronAuth } from "@/lib/cron-auth";
import type { LanguageResearch } from "@/lib/blog-research";
import { getRecentPostsByLanguage } from "@/lib/blog-topics";
import {
  getQueueIdParam,
  fetchQueueItem,
  requireRowLang,
  updateQueueItem,
  markQueueItemFailed,
  type QueueItem,
} from "@/lib/blog-queue";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const maxDuration = 300;

/**
 * PIPELINE V3 · PHASE 4 — Quality review & enhancement (ONE language):
 * proofread/flow/dedup, keyword coverage check, conservative fact-guard
 * (never invents citations), 2-4 internal links from real posts in THIS
 * language, ≤2 authoritative external links, closing Call-to-Action.
 * Deterministic FAQ-append safety net guarantees length & P0 answers.
 * Bundle stays FLAT: { research0, outline, content, images, review }.
 *
 * GET /api/cron/blog/p4-review?queueId=<uuid>
 */
type LangReview = {
  markdown: string;
  report: ReviewReport;
  internalLinks: { slug: string; anchorText: string }[];
  externalLinks: { url: string; anchorText: string }[];
  source: string;
};

export async function GET(request: NextRequest) {
  // M6 (audit 2026-09-07): constant-time CRON_SECRET check.
  if (!verifyCronAuth(request))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseAdminConfigured)
    return NextResponse.json({ error: "Supabase admin not configured." }, { status: 500 });

  const queueId = getQueueIdParam(request);
  if (!queueId)
    return NextResponse.json({ error: "Missing queueId query parameter" }, { status: 400 });

  let qi: QueueItem | null = null;

  try {
    const { data, error: fetchErr } = await fetchQueueItem(queueId);
    if (fetchErr) throw new Error(fetchErr);
    if (!data)
      return NextResponse.json({ ok: false, queueId, skipped: true, reason: "queue_item_not_found" }, { status: 404 });
    qi = data;

    const lang = requireRowLang(qi);

    if (!["images_done", "reviewed"].includes(qi.status) && qi.status !== "failed") {
      if (qi.status === "published")
        return NextResponse.json({ ok: true, step: "p4", queueId: qi.id, lang, idempotent: true });
      return NextResponse.json(
        { ok: false, queueId: qi.id, skipped: true, reason: "wrong_status", actual_status: qi.status },
        { status: 409 },
      );
    }

    const bundle = qi.article_bundle ? JSON.parse(qi.article_bundle) : {};

    const outline: OutlinePlan | undefined = bundle.outline;
    const research: LanguageResearch | undefined = bundle.research0;
    const draft: string | undefined = bundle.content?.markdown;
    if (!outline || !research || !draft) {
      throw new Error(`p4 ${lang}: missing outline/research/draft artifacts`);
    }

    // Internal-link candidates come from THIS language's own archive so
    // an EN article never links to an Arabic slug and vice versa.
    const recent = await getRecentPostsByLanguage(lang, 20);
    const candidates = recent
      .filter((p) => p.slug)
      .map((p) => ({ slug: p.slug, title: p.title }));

    const r = await reviewAndEnhance(lang, draft, outline, candidates);

    // Deterministic safety net: article-specific FAQ section guaranteed.
    // PHASE 172 (owner order — FAQ filler fix): relevance-filtered against
    // the article's title/focus (≤6, zero-relevant → no FAQ at all) — the
    // pre-172 net appended ALL niche-generic P0 FAQs (up to 10) to any
    // article that lacked a model-written FAQ section.
    const withFaq = ensureFaqSection(lang, r.markdown, research, outline.title);

    // PHASE 176 — Arabic Latin-contamination repair (the 09-11 incident:
    // "يُ marketed" / "لا توجد evidences" shipped inside AR prose because
    // weak chain models ignore prompt laws). Deterministic DETECTION → one
    // targeted AI repair → deterministic RE-VALIDATION (links/headings/
    // images/length preserved + zero dialect + zero Latin). A failing
    // repair THROWS → markQueueItemFailed → the runner's ×3 retry re-runs
    // P4 on a fresh model draw. EN articles skip (Latin is their prose).
    let finalMd = withFaq.md;
    let latinRepairNote: string | null = null;
    if (lang === "ar") {
      const latin = scanLatinContamination(finalMd);
      if (latin.count > 0) {
        console.log(
          `[blog/p4-review] latin contamination detected (${latin.count} tokens) — repair pass engaged`,
        );
        finalMd = await repairArabicLatinContamination(finalMd, latin.tokens);
        latinRepairNote = `latin-repair: ${latin.count} bare Latin token(s) arabized deterministically-gated`;
      }
    }

    const review: LangReview = {
      markdown: finalMd,
      report: {
        ...r.report,
        changesSummary: [
          ...r.report.changesSummary,
          ...(withFaq.appended
            ? [`appended ${withFaq.appendedCount} topic-relevant FAQ item(s) from P0 answers`]
            : []),
          ...(latinRepairNote ? [latinRepairNote] : []),
        ],
      },
      internalLinks: r.internalLinks,
      externalLinks: r.externalLinks,
      source: r.source,
    };

    const updateErr = await updateQueueItem(qi.id, {
      status: "reviewed",
      article_bundle: JSON.stringify({ ...bundle, review }),
    });
    if (updateErr) throw new Error(updateErr);

    return NextResponse.json({
      ok: true,
      step: "p4",
      queueId: qi.id,
      lang,
      words: countWords(review.markdown),
      coverage: review.report.keywordCoverage,
      source: review.source,
      ...(latinRepairNote ? { latinRepair: latinRepairNote } : {}),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[blog/p4-review] Error:", msg);
    if (queueId) await markQueueItemFailed(queueId, `p4: ${msg || "Unknown"}`);
    return NextResponse.json({ error: msg || "Failed" }, { status: 500 });
  }
}
