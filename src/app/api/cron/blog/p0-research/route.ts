import { NextRequest, NextResponse } from "next/server";
import { runPhase0Research } from "@/lib/blog-research";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getLangParam, findAdoptablePairRow, findRecentPairRows, type PipelineLang, type QueueItem } from "@/lib/blog-queue";
import {
  extractSharedBrief,
  isAdoptablePairRow,
  runPairingSelection,
  JOIN_MAX_AGE_HOURS,
  type SharedBrief,
} from "@/lib/blog-pairing";
import { verifyCronAuth } from "@/lib/cron-auth";
import { randomUUID } from "crypto";

export const maxDuration = 60;

/**
 * PIPELINE V3 · PHASE 0 — Research + daily-pair protocol (Phase 157).
 *
 * PHASE 157 (owner «نفذ توصيتك» = Proposal 1): ONE daily topic → TWO
 * queue rows (en + ar) sharing pair_id + a sealed sharedBrief. Each
 * language still runs its FULL P1→P5 pipeline BY ITSELF in its own
 * geography-anchored window (AR 05:00 UTC · EN 22:00 UTC — Phase 119
 * tables preserved verbatim). Content is written from scratch per
 * language (topic + shared angle only — never translation).
 *
 * P0 PROTOCOL (in order), with a FULL degradation ladder:
 *   1. ADOPT (≤48h) — my language already has a researched pair row with
 *      a valid sealed brief (created by the twin's earlier window) →
 *      return it; nothing is inserted.
 *   2. JOIN (≤30h) — the OTHER language's pair row exists but MY side
 *      never materialized (my twin insert failed best-effort) → research
 *      MY language + insert MY row only, reusing the twin's pair_id +
 *      sharedBrief.
 *   3. CREATE — I'm first → research BOTH languages + ONE small pairing
 *      call (topicEn/topicAr/shared angle) → insert TWO rows (twin is
 *      best-effort: if it fails, the twin's own P0 JOIN rescues the pair).
 *   DEGRADE — pairing failure / validation failure / migration 0076 not
 *      applied → EXACT legacy V3 behavior: ONE unpaired row. Blind
 *      pairing is FORBIDDEN (a wrong pair is worse than no pair).
 *   DOUBLE-DISPATCH GUARD — CREATE re-checks ADOPT right before inserting
 *   so two concurrent runs for the same language cannot both insert.
 *
 * GET /api/cron/blog/p0-research?lang=en|ar
 *   → { ok, step:"p0", queueId, lang,
 *       pairMode: "adopted"|"joined"|"created"|"legacy", pairId?, twinInserted? }
 */

type P0BundleResearch = Awaited<ReturnType<typeof runPhase0Research>>["research"];

function bundleWithBrief(research: P0BundleResearch, brief: SharedBrief | null): string {
  return JSON.stringify(
    brief ? { research0: research, sharedBrief: brief } : { research0: research },
  );
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s; // raw string → extractSharedBrief rejects it
  }
}

function briefOf(qi: Pick<QueueItem, "article_bundle">): SharedBrief | null {
  return extractSharedBrief(
    typeof qi.article_bundle === "string" ? safeParse(qi.article_bundle) : qi.article_bundle,
  );
}

/** Focus-keyword placeholder from a topic (refined by P1's pickKeyword). */
function topicToKeyword(topic: string): string {
  const k = topic.split(/\s+/).slice(0, 6).join(" ").slice(0, 60);
  return k || topic.slice(0, 60);
}

/** Insert one researched queue row; returns the row or a PostgREST error message. */
async function insertResearchedRow(args: {
  language: PipelineLang;
  topic: string;
  focus_keyword: string;
  category: string;
  pairId: string | null;
  bundle: string;
}): Promise<{ row: QueueItem | null; error: string | null }> {
  const { data, error } = await supabaseAdmin!
    .from("blog_generation_queue")
    .insert({
      language: args.language,
      topic: args.topic,
      focus_keyword: args.focus_keyword,
      category: args.category,
      status: "researched",
      created_at: new Date().toISOString(),
      ...(args.pairId ? { pair_id: args.pairId } : {}),
      article_bundle: args.bundle,
    })
    .select()
    .single();
  if (error) return { row: null, error: error.message };
  return { row: (data as QueueItem) ?? null, error: null };
}

export async function GET(request: NextRequest) {
  // M6 (audit 2026-09-07): constant-time CRON_SECRET check.
  if (!verifyCronAuth(request))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseAdminConfigured || !supabaseAdmin)
    return NextResponse.json({ error: "Supabase admin not configured." }, { status: 500 });

  // The language IS this run's identity — refuse to guess it. A wrong
  // guess would silently publish articles in the wrong language at the
  // wrong time slots, so fail loudly instead.
  const lang: PipelineLang | null = getLangParam(request);
  if (!lang) {
    return NextResponse.json(
      { error: "Missing/invalid ?lang= parameter — must be 'en' or 'ar'." },
      { status: 400 },
    );
  }

  const otherLang: PipelineLang = lang === "ar" ? "en" : "ar";

  try {
    // ── 1) ADOPT (≤48h) — my side was pre-created by the twin's window.
    try {
      const candidate = await findAdoptablePairRow(lang);
      if (candidate && isAdoptablePairRow(candidate, lang)) {
        const brief = briefOf(candidate);
        if (brief) {
          return NextResponse.json({
            ok: true,
            step: "p0",
            queueId: candidate.id,
            lang,
            pairMode: "adopted" as const,
            pairId: brief.pairId,
            adopted: true,
          });
        }
      }
    } catch (e) {
      console.warn(`[blog/p0-research] adopt degraded: ${e instanceof Error ? e.message : e}`);
    }

    // ── 2) JOIN (≤30h) — the twin's row exists but MY side never landed.
    // (Happens only when CREATE's best-effort twin insert failed. JOIN is
    // executed by the TWIN's own P0 run: it finds MY row as "the other
    // language's pair row" and creates its own row with the same pair.)
    try {
      const joined = await tryJoinPair(lang, otherLang);
      if (joined) {
        return NextResponse.json({
          ok: true,
          step: "p0",
          queueId: joined.id,
          lang,
          pairMode: "joined" as const,
          pairId: joined.pair_id ?? undefined,
          joined: true,
        });
      }
    } catch (e) {
      console.warn(`[blog/p0-research] join degraded: ${e instanceof Error ? e.message : e}`);
    }

    // ── 3) CREATE — full bilingual protocol.
    const [mine, other] = await Promise.all([
      runPhase0Research(lang),
      runPhase0Research(otherLang),
    ]);
    // `mine` = MY language's Phase-0 result; `other` = the twin language's.
    const mineResearch = mine.research;

    // Pairing call — its failure degrades the WHOLE run to legacy V3.
    let brief: SharedBrief | null = null;
    try {
      const enResearch = lang === "en" ? mineResearch : other.research;
      const arResearch = lang === "ar" ? mineResearch : other.research;
      const choice = await runPairingSelection(enResearch, arResearch);
      brief = {
        pairId: randomUUID(),
        topicEn: choice.topicEn,
        topicAr: choice.topicAr,
        angleId: choice.angleId,
        sealedAt: new Date().toISOString(),
      };
    } catch (e) {
      console.warn(
        `[blog/p0-research] pairing failed → legacy single row: ${e instanceof Error ? e.message : e}`,
      );
    }

    // DOUBLE-DISPATCH GUARD: re-check adopt right before inserting.
    try {
      const raced = await findAdoptablePairRow(lang);
      if (raced && isAdoptablePairRow(raced, lang)) {
        const racedBrief = briefOf(raced);
        if (racedBrief) {
          return NextResponse.json({
            ok: true,
            step: "p0",
            queueId: raced.id,
            lang,
            pairMode: "adopted" as const,
            pairId: racedBrief.pairId,
            adopted: true,
            racedGuard: true,
          });
        }
      }
    } catch {
      /* guard is best-effort */
    }

    // MY row first (the pipeline continues on THIS queueId).
    const myTopic = brief
      ? (lang === "ar" ? brief.topicAr : brief.topicEn)
      : (mineResearch.topics[0] || (lang === "ar" ? "مقال لياقة" : "fitness article"));
    const myKeyword = brief
      ? topicToKeyword(lang === "ar" ? brief.topicAr : brief.topicEn)
      : (mineResearch.keywords[0]?.keyword || (lang === "ar" ? "لياقة" : "fitness"));

    let inserted = await insertResearchedRow({
      language: lang,
      topic: myTopic,
      focus_keyword: myKeyword,
      category: mine.category,
      pairId: brief?.pairId ?? null,
      bundle: bundleWithBrief(mineResearch, brief),
    });

    // DEGRADATION LAW: a missing pair_id column (0076 not applied) must
    // never stop publishing — retry ONCE as exact legacy V3 (no pair).
    if (inserted.error) {
      const msg = inserted.error;
      const missingColumn = /pair_id|Could not find the .* column|schema cache/i.test(msg);
      if (brief && missingColumn) {
        console.warn(
          `[blog/p0-research] pair insert rejected (0076 applied?) → legacy single row: ${msg}`,
        );
        brief = null;
        inserted = await insertResearchedRow({
          language: lang,
          topic: mineResearch.topics[0] || (lang === "ar" ? "مقال لياقة" : "fitness article"),
          focus_keyword: mineResearch.keywords[0]?.keyword || (lang === "ar" ? "لياقة" : "fitness"),
          category: mine.category,
          pairId: null,
          bundle: JSON.stringify({ research0: mineResearch }),
        });
      }
    }
    if (inserted.error || !inserted.row) {
      throw new Error(`Queue insert: ${inserted.error ?? "no data"}`);
    }

    // TWIN row — best-effort: its failure never fails MY run (the twin's
    // own P0 JOIN rescues the pair later).
    let twinInserted = false;
    if (brief) {
      try {
        const twinTopic = otherLang === "ar" ? brief.topicAr : brief.topicEn;
        const twinRes = await insertResearchedRow({
          language: otherLang,
          topic: twinTopic,
          focus_keyword: topicToKeyword(twinTopic),
          category: other.category,
          pairId: brief.pairId,
          bundle: bundleWithBrief(other.research, brief),
        });
        twinInserted = !!twinRes.row;
        if (twinRes.error) {
          console.warn(`[blog/p0-research] twin insert failed (JOIN will rescue): ${twinRes.error}`);
        }
      } catch (e) {
        console.warn(`[blog/p0-research] twin insert degraded: ${e instanceof Error ? e.message : e}`);
      }
    }

    return NextResponse.json({
      ok: true,
      step: "p0",
      queueId: inserted.row.id,
      lang,
      category: mine.category,
      keywords: mineResearch.keywords.length,
      faqs: mineResearch.faqs.length,
      topics: mineResearch.topics.length,
      source: mine.source,
      pairMode: brief ? ("created" as const) : ("legacy" as const),
      pairId: brief?.pairId,
      twinInserted,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[blog/p0-research] Error:", msg);
    return NextResponse.json({ error: msg || "Failed" }, { status: 500 });
  }
}

/**
 * JOIN lookup: the OTHER language has a researched pair row (≤30h) with a
 * valid sealed brief whose pair has NO my-language sibling → insert MY row
 * only (MY fresh research + the twin's pair_id + sharedBrief). Returns the
 * inserted row, or null when no joinable state exists. Any hard failure
 * throws → caller degrades to CREATE/legacy.
 */
async function tryJoinPair(
  lang: PipelineLang,
  otherLang: PipelineLang,
): Promise<QueueItem | null> {
  if (!supabaseAdmin) return null;
  const { data: otherRows, error } = await supabaseAdmin
    .from("blog_generation_queue")
    .select("*")
    .eq("language", otherLang)
    .eq("status", "researched")
    .not("pair_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) {
    // 0076 not applied lands here — silent degradation (CREATE will too).
    console.warn(`[blog/p0-research] join lookup degraded: ${error.message}`);
    return null;
  }
  const now = new Date();
  for (const row of (otherRows as QueueItem[] | null) ?? []) {
    const created = Date.parse(row.created_at || "");
    if (!Number.isFinite(created)) continue;
    const ageH = (now.getTime() - created) / 3_600_000;
    if (ageH < 0 || ageH > JOIN_MAX_AGE_HOURS) continue;
    const brief = briefOf(row);
    if (!brief || brief.pairId !== row.pair_id) continue;

    const siblings = await findRecentPairRows(row.pair_id);
    if (siblings.some((s) => s.language === lang)) continue; // my side exists → not a JOIN

    const mine = await runPhase0Research(lang);
    const topic = lang === "ar" ? brief.topicAr : brief.topicEn;
    const { row: inserted, error: insErr } = await insertResearchedRow({
      language: lang,
      topic,
      focus_keyword: topicToKeyword(topic),
      category: mine.category,
      pairId: brief.pairId,
      bundle: bundleWithBrief(mine.research, brief),
    });
    if (insErr || !inserted) {
      // Missing pair_id column (0076) → JOIN unavailable; CREATE below
      // will degrade the same way. Surface as null (not a hard failure).
      console.warn(`[blog/p0-research] join insert degraded: ${insErr ?? "no data"}`);
      return null;
    }
    console.log(`[blog/p0-research] JOINED pair ${brief.pairId} as ${lang}`);
    return inserted;
  }
  return null;
}
