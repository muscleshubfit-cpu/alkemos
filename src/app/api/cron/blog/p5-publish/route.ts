import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { normalizeCategory } from "@/lib/blog-server";
import { countWords, splitFaqSection, filterFaqsByRelevance, clampMetaTitle, type OutlinePlan } from "@/lib/blog-pipeline";
import { scanLatinContamination } from "@/lib/blog-msa";
import { embedBodyImages } from "@/lib/blog-images";
import { insertToolLinks } from "@/lib/blog-tool-links";
import { slugifyAscii } from "@/lib/slug";
import {
  getQueueIdParam,
  fetchQueueItem,
  validateQueueStatus,
  requireRowLang,
  updateQueueItem,
  markQueueItemFailed,
  findRecentPairRows,
  countAutomatedPublishedToday,
  bundleMarksCoachRequest,
  type QueueItem,
} from "@/lib/blog-queue";
import { verifyCronAuth } from "@/lib/cron-auth";

export const maxDuration = 60;

/**
 * PIPELINE V3 · PHASE 5 — Publish & Update (ONE language).
 * Pure Node.js / Supabase — NO AI models here (owner spec).
 * Inserts the blog_posts row for the row's OWN language, marks the
 * queue row published. The app's dynamic sitemap.ts picks up new posts
 * automatically on next request.
 *
 * PHASE 157 — BILINGUAL HANDSHAKE: when the queue row carries a pair_id,
 * the later-published twin fills its OWN linked_post_id AND the earlier
 * twin's (bidirectional) — hreflang (blog-sitemap) + LanguageToggle light
 * up automatically per pair. Best-effort in EVERY direction: any failure
 * logs and moves on, the publish itself NEVER fails because of pairing.
 * Unpaired (legacy/degraded) rows keep the exact pre-157 behavior.
 *
 * PHASE 171 (blog-audit proposal ج — 2026-09-10): ONE-AUTOMATIC-ARTICLE/
 * DAY/LANGUAGE LAW now enforced HERE, at the publish layer. Live race
 * evidence: EN published two posts on 09-05 (23:07 + 23:33) — the 23:00
 * backstop dispatched a top-up while GitHub's delayed scheduled run was
 * still on its way; both runs published. The dispatch layer got grace +
 * post-counting (dispatch-pipelines route), and THIS guard is the last
 * line of defense: an AUTOMATIC row (bundle WITHOUT coachRequested) may
 * not publish when another automated row of the same language, created
 * the same UTC day, already published. Coach-requested rows (Phase 162
 * owner override) are exempt — the owner asked for that article.
 *
 * GET /api/cron/blog/p5-publish?queueId=<uuid>
 */
// ONE-SLUG-LAW (2026-08-28j): the local slugify() copy was DELETED —
// slug logic lives only in src/lib/slug.ts (slugifyAscii = exact port).

async function uniqueSlug(base: string, language: "en" | "ar"): Promise<string> {
  if (!supabaseAdmin) return base;
  let slug = base || `post-${Date.now()}`;
  const effectiveBase = base || slug;
  let attempt = 0;
  while (attempt < 5) {
    const { data } = await supabaseAdmin
      .from("blog_posts")
      .select("id")
      .eq("slug", slug)
      .eq("language", language)
      .maybeSingle();
    if (!data) return slug;
    attempt += 1;
    slug = `${effectiveBase}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${effectiveBase}-${Date.now()}`;
}

async function titleAlreadyExists(title: string, language: "en" | "ar"): Promise<boolean> {
  if (!supabaseAdmin) return false;
  const normalized = title.trim().toLowerCase();
  if (!normalized) return false;
  const { data } = await supabaseAdmin
    .from("blog_posts")
    .select("id")
    .eq("language", language)
    .ilike("title", normalized)
    .limit(1);
  return Array.isArray(data) && data.length > 0;
}

export async function GET(request: NextRequest) {
  // M6 (audit 2026-09-07): constant-time CRON_SECRET check.
  if (!verifyCronAuth(request))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseAdminConfigured || !supabaseAdmin)
    return NextResponse.json({ error: "Supabase admin not configured." }, { status: 500 });

  const queueId = getQueueIdParam(request);
  if (!queueId)
    return NextResponse.json({ error: "Missing queueId query parameter" }, { status: 400 });

  let publishedPostId: string | null = null;
  let qi: QueueItem | null = null;

  try {
    const { data, error: fetchErr } = await fetchQueueItem(queueId);
    if (fetchErr) throw new Error(fetchErr);
    if (!data)
      return NextResponse.json({ ok: false, queueId, skipped: true, reason: "queue_item_not_found" }, { status: 404 });
    qi = data;

    const lang = requireRowLang(qi);

    const statusErr = validateQueueStatus(qi, "reviewed");
    if (statusErr) {
      if (qi.status === "published")
        return NextResponse.json({ ok: true, step: "p5", queueId: qi.id, lang, idempotent: true });
      if (qi.status !== "failed" && !qi.status.startsWith("failed:")) {
        return NextResponse.json(
          { ok: false, queueId: qi.id, skipped: true, reason: "wrong_status", actual_status: qi.status },
          { status: 409 },
        );
      }
      console.warn(`[blog/p5-publish] Re-processing previously failed item ${qi.id}`);
    }

    // FLAT artifacts (V3).
    const bundle = JSON.parse(qi.article_bundle || "{}");
    const outline = bundle.outline as OutlinePlan | undefined;
    const review = bundle.review as { markdown?: string } | undefined;
    const images = (bundle.images ?? []) as { url: string; alt: string; credit: string }[];
    if (!outline?.title || !review?.markdown) {
      throw new Error("p5: missing reviewed artifacts — rerun p4-review");
    }

    // PHASE 171 (proposal ج) — DAILY QUOTA GUARD (publish-layer law):
    // automated rows refuse to publish a SECOND article of the same UTC
    // day for their language. Attribution = queue-row CREATION day (the
    // run's day), so a late-night top-up publishing just after midnight
    // does not eat the next day's slot. Coach rows are exempt. DB
    // unavailable → guard degrades OPEN (never blocks publishing on an
    // infra hiccup — the dispatch layer still prevents the race).
    if (!bundleMarksCoachRequest(qi.article_bundle)) {
      const publishedAutomated = await countAutomatedPublishedToday(lang);
      if (publishedAutomated !== null && publishedAutomated >= 1) {
        console.warn(
          `[blog/p5-publish] daily quota already met for ${lang} (${publishedAutomated} automated row(s) created today published) — skipping ${qi.id}`,
        );
        return quotaSkip(qi.id, lang, publishedAutomated);
      }
    }

    const safeCategory = normalizeCategory(qi.category);
    const now = new Date().toISOString();

    const title = outline.title || qi.topic;

    if (await titleAlreadyExists(title, lang))
      return dupSkip(qi.id, title, lang);

    const slug = await uniqueSlug(
      slugifyAscii(outline.slugBase || qi.focus_keyword),
      lang,
    );
    const featured = images[0]?.url ?? null;

    // AUTOMATIC FREE-TOOL INTERNAL LINKING (owner SEO directive,
    // 2026-09-01): deterministic pass — wraps natural mentions (calories,
    // macros, meal plans, water, body fat, BMI…) with links to the
    // matching FREE TOOL on the site. Language-aware (EN/AR triggers),
    // idempotent, max 3 links/article, never inside existing markdown
    // links. Runs AFTER the P4 review (so the review model cannot strip
    // these links) and BEFORE image embedding.
    //
    // PHASE 172 (owner order — FAQ filler fix): the article-specific FAQ
    // section written in the reviewed markdown is LIFTED into
    // blog_posts.faq_json (the visual FAQ cards) and REMOVED from the
    // body — pre-172 the page rendered the FAQ TWICE (body + cards) and
    // the cards carried the niche-generic P0 FAQs instead of the
    // article's own questions. The lift happens BEFORE the tool-link
    // pass (FAQ card answers render as plain text — no markdown links
    // should be planted in them). Degradation: no recognizable FAQ
    // section → legacy behavior (faq_json from research0, body intact).
    //
    // PHASE 176 (owner report «التعديلات الجديدة اختفت مرة أخرى» — live
    // evidence: the 09-11 protein-timing article lifted creatine +
    // intermittent-fasting + metabolism questions into a protein-TIMING
    // article's FAQ cards): the lifted questions AND the research0
    // fallback now pass the DETERMINISTIC relevance filter
    // (filterFaqsByRelevance — ≥2 shared meaningful words with the
    // article's title+focus; P4's model-ignored instruction was not
    // enough). Relevant-but-fewer beats padded-but-off-topic; zero
    // relevant → no FAQ cards at all (the Phase-172 no-forced-filler
    // law). AR answers that still carry bare Latin tokens are dropped
    // the same way (belt-and-braces for the P4 repair gate).
    const { body: faqStrippedMd, faqs: parsedFaqs } = splitFaqSection(lang, review.markdown);
    const relevanceHint = `${outline.title} ${qi.focus_keyword ?? ""}`;
    const relevantFaqs = filterFaqsByRelevance(parsedFaqs, relevanceHint);
    const faqRelevanceDropped = parsedFaqs.length - relevantFaqs.length;
    if (faqRelevanceDropped > 0) {
      console.log(
        `[blog/p5-publish] FAQ relevance filter: ${faqRelevanceDropped} off-topic question(s) dropped (of ${parsedFaqs.length} lifted)`,
      );
    }
    let finalFaqs = relevantFaqs;
    if (lang === "ar" && finalFaqs.length > 0) {
      const beforeDrop = finalFaqs.length;
      finalFaqs = finalFaqs.filter(
        (f) =>
          scanLatinContamination(f.question).count === 0 &&
          scanLatinContamination(f.answer).count === 0,
      );
      if (finalFaqs.length < beforeDrop) {
        console.log(
          `[blog/p5-publish] FAQ latin gate: ${beforeDrop - finalFaqs.length} contaminated answer(s) dropped`,
        );
      }
    }
    const toolLinkPass = insertToolLinks(faqStrippedMd, lang);
    const finalFaqJson =
      finalFaqs.length > 0
        ? finalFaqs
        : filterFaqsByRelevance(bundle.research0?.faqs ?? [], relevanceHint);

    // PHASE 176 — final deterministic Latin gate (publish-layer law,
    // mirror of the 171 daily-quota guard): an AR article whose BODY
    // still carries bare Latin tokens after the P4 repair did not pass
    // fails HONESTLY here — the row is marked failed with the token
    // list and the 23:40 dispatch backstop tops the day's slot up. EN
    // articles skip (Latin is their prose).
    if (lang === "ar") {
      const bodyLatin = scanLatinContamination(toolLinkPass.md);
      if (bodyLatin.count > 0) {
        throw new Error(
          `p5: latin contamination in final body (${bodyLatin.count} tokens: ${bodyLatin.tokens.slice(0, 10).join(", ")}) — rerun p4-review`,
        );
      }
    }

    const row = {
      language: lang,
      title,
      slug,
      excerpt: outline.metaDescription,
      // BODY IMAGE EMBEDDING LAW: images[0] = featured/og cover; images[1..N]
      // are inserted into the article markdown at section boundaries (was:
      // dropped entirely → every post was a wall of text).
      content: embedBodyImages(toolLinkPass.md, images),
      // Phase SEO-GEO-6.3 (§12.19 P0-3): word-boundary clamp replaces the
      // old `.slice(0, 60)` mid-word hard cut (23/31 EN titles were landing
      // in the SERP truncated mid-word; AR budget is wider at 70).
      meta_title: clampMetaTitle(outline.title, lang),
      meta_description: outline.metaDescription,
      focus_keyword: qi.focus_keyword,
      keywords: outline.lsiKeywords,
      category: safeCategory,
      tags: outline.lsiKeywords.slice(0, 5),
      featured_image: featured,
      cover_alt: title,
      reading_time: Math.max(1, Math.ceil(countWords(review.markdown) / 200)),
      // Phase SEO-GEO-4.1 (2026-09-08): author is the human founder Ahmed
      // Zake, not the brand "Alkemos". The byline UI + Article schema's
      // `author` Person both display this value — using a real human name
      // is the strongest E-E-A-T signal per Google's QRG. resolveAuthor()
      // in authors.ts still normalizes legacy "Alkemos"/"MuscleHub" values
      // to Ahmed Zake for backward compatibility, but new posts ship with
      // the canonical name from the start.
      author: "Ahmed Zake",
      is_published: true,
      published_at: now,
      // PHASE 172: article-specific FAQs lifted from the reviewed markdown
      // (see the splitFaqSection block above); research0 fallback only in
      // the degraded no-FAQ-section path.
      faq_json: finalFaqJson,
    };

    const { data: post, error: insertErr } = await supabaseAdmin
      .from("blog_posts")
      .insert(row)
      .select()
      .single();
    if (insertErr) throw new Error(`Post insert (${lang}): ${insertErr.message}`);
    publishedPostId = post?.id || null;

    const updateErr = await updateQueueItem(qi.id, {
      status: "published",
      ...(lang === "en"
        ? { en_post_id: publishedPostId ?? undefined }
        : { ar_post_id: publishedPostId ?? undefined }),
    });
    if (updateErr) throw new Error(updateErr);

    // PHASE 157 — BILINGUAL HANDSHAKE (best-effort, never fails the
    // publish): find the twin queue row by pair_id; if the twin already
    // published, fill linked_post_id in BOTH directions.
    let handshake: "bidirectional" | "first-of-pair" | "skipped" = "skipped";
    if (qi.pair_id) {
      try {
        const rowId = qi.id; // narrowed snapshot (mutable let loses narrowing in callbacks)
        const pairRows = await findRecentPairRows(qi.pair_id);
        const twin = pairRows.find((r) => r.id !== rowId && r.language !== lang);
        const twinPostId = twin
          ? (lang === "en" ? twin.ar_post_id : twin.en_post_id)
          : null;
        if (twinPostId && publishedPostId) {
          // I published second: point me → twin AND twin → me.
          const mineErr = await supabaseAdmin
            .from("blog_posts")
            .update({ linked_post_id: twinPostId })
            .eq("id", publishedPostId)
            .then(({ error }) => error?.message ?? null);
          const twinErr = await supabaseAdmin
            .from("blog_posts")
            .update({ linked_post_id: publishedPostId })
            .eq("id", twinPostId)
            .then(({ error }) => error?.message ?? null);
          if (mineErr || twinErr) {
            console.warn(
              `[blog/p5-publish] handshake partial (mine=${mineErr ?? "ok"}, twin=${twinErr ?? "ok"})`,
            );
            handshake = mineErr && twinErr ? "skipped" : "bidirectional";
          } else {
            handshake = "bidirectional";
            console.log(`[blog/p5-publish] pair linked ${qi.pair_id}: ${publishedPostId} ↔ ${twinPostId}`);
          }
        } else {
          // I published first — the twin's P5 fills both directions later.
          handshake = "first-of-pair";
        }
      } catch (e) {
        console.warn(
          `[blog/p5-publish] handshake degraded: ${e instanceof Error ? e.message : e}`,
        );
      }
    }

    return NextResponse.json({
      ok: true,
      step: "p5",
      queueId: qi.id,
      lang,
      postId: publishedPostId,
      sitemap: "auto (dynamic sitemap.ts)",
      title: row.title,
      slug,
      toolLinksInserted: toolLinkPass.inserted.length,
      faqLifted: finalFaqs.length,
      ...(faqRelevanceDropped > 0 ? { faqRelevanceDropped } : {}),
      handshake,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[blog/p5-publish] Error:", msg);
    if (queueId) {
      const partial = publishedPostId
        ? `partial_publish: ${String(qi?.language ?? "?").toUpperCase()} post ${publishedPostId} inserted but post-update failed. `
        : "";
      await markQueueItemFailed(queueId, `p5: ${partial}${msg || "Unknown"}`);
    }
    return NextResponse.json({ error: msg || "Failed" }, { status: 500 });
  }
}

async function dupSkip(queueId: string, title: string, lang: "en" | "ar") {
  const err = await updateQueueItem(queueId, {
    status: "skipped_duplicate",
    error_message: `p5: duplicate-${lang}-title "${title}"`,
  });
  if (err) console.error(`[blog/p5-publish] Failed to mark skipped_duplicate: ${err}`);
  return NextResponse.json({ ok: true, step: "p5", queueId, lang, skipped: true, reason: `duplicate-${lang}-title`, title });
}

/** PHASE 171 (proposal ج): automated row refused — the day's automated
 *  article already published (one-article/day law, Phase 119). */
async function quotaSkip(queueId: string, lang: "en" | "ar", alreadyPublished: number) {
  const err = await updateQueueItem(queueId, {
    status: "skipped_daily_quota",
    error_message: `p5: daily-quota-${lang} — ${alreadyPublished} automated article(s) created today already published (Phase 119 law, enforced 171)`,
  });
  if (err) console.error(`[blog/p5-publish] Failed to mark skipped_daily_quota: ${err}`);
  return NextResponse.json({
    ok: true,
    step: "p5",
    queueId,
    lang,
    skipped: true,
    reason: "daily-quota-met",
    alreadyPublished,
  });
}
