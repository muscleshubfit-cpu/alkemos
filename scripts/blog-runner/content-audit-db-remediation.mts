/**
 * scripts/blog-runner/content-audit-db-remediation.mts
 *
 * CONTENT-AUDIT-REMEDIATION §4 (2026-09-28) — migrate the render-time
 * content-audit compensations into the blog_posts ROWS themselves, so the
 * render layers can be unwound (single source of truth = the database).
 *
 * WHAT RUNS HERE (all deterministic, zero AI):
 *   A. MECHANICAL families — imported VERBATIM from
 *      src/lib/blog-content-sanitize.ts (the SAME functions the site render
 *      uses — no fork, byte-identical output by construction):
 *        ⑥ fixBrokenWordLinkSplits   (P0-2 split-word kaf links, AR)
 *        ⑦ fixKeywordFillerTails    (P1-1 ", answering the common query of…", EN)
 *        ⑧ fixIntroLabelDuplication (P0-2 duplicated «مقدمة:» labels, AR)
 *   B. CURATED patches — scripts/blog-runner/content-audit-db-patches.json
 *      (25 exact-match replacements; every `find` was validated to occur
 *      EXACTLY ONCE in the live DB before the file was committed):
 *        - audit §1.3 link-stuffing / keyword-echo sentences (creatine EN)
 *        - audit §4.2 planted Q/A re-edits (9 AR articles)
 *        - audit §4.3 cardio-question harmonization (3 AR articles)
 *   C. BLOCK removals — beta-alanine «سؤال القارئ:»/«كلمة مفتاحية:»
 *      planted template blocks (deterministic regexes, slug-scoped).
 *   D. FAQ enrichment — beta-alanine faq_json 4 → 10 (the six body-FAQ
 *      Q&As lifted verbatim; the P5/Phase-178 single-display law).
 *   E. CATEGORY fixes — the five P1-8 misfiled rows (nutrition → correct
 *      family), the exact values BLOG_CATEGORY_OVERRIDES carries today.
 *
 * LAWS (same as every blog-runner script):
 *   - DRY_RUN=1 default — report only, zero writes.
 *   - Fail-safe: any patch that does not match EXACTLY ONCE (or 0 with the
 *     replacement absent) skips its row untouched and fails the run.
 *   - Idempotent: re-runs converge to a no-op (already-applied = skip).
 *   - updated_at/reading_time are bumped ONLY for rows with VISIBLE changes
 *     (curated/faq) — pure-mechanical and category rows keep their stamps
 *     (the rendered page is byte-identical for those).
 *
 * EXIT: 0 = ok · 1 = at least one failure · 2 = misconfig.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  fixBrokenWordLinkSplits,
  fixKeywordFillerTails,
  fixIntroLabelDuplication,
} from "../../src/lib/blog-content-sanitize";

// ── config ────────────────────────────────────────────────────────────────
const DRY_RUN = process.env.DRY_RUN !== "0";
const PATCHES_PATH = join(
  process.cwd(),
  "scripts/blog-runner/content-audit-db-patches.json",
);

type Patch = { slug: string; lang: "en" | "ar"; find: string; replace: string; note: string };
type FaqItem = { question: string; answer: string };
type Config = {
  patches: Patch[];
  faq_additions: Array<{ slug: string; lang: "en" | "ar"; items: FaqItem[] }>;
  category_fixes: Array<{ slug: string; lang: "en" | "ar"; from: string; to: string }>;
};

type Row = {
  id: string;
  slug: string;
  language: "en" | "ar";
  title: string;
  content: string | null;
  category: string;
  faq_json: FaqItem[] | null;
  reading_time: number | null;
  updated_at: string | null;
};

// ── slug-scoped deterministic block removals (C) ──────────────────────────
const READER_Q_BLOCK = /\n+\*\*سؤال القارئ:\*\*[^\n]*\nالإجابة:[^\n]*/g;
const KEYWORD_LABEL_LINE = /\n+\*\*كلمة مفتاحية:\*\*[^\n]*/g;
const BLOCK_REMOVAL_SLUGS = new Set(["beta-alanine-guide-selection"]);

// ── detectors (post-write proof — mirror the render shapes) ───────────────
const KAF_SPLIT = /\[([^\]]*[^ك\s])\]\(([^)\s]+)\)ك(?=[\s،؛؟!.,:؛")\]]|$)/;
const FILLER_TAIL = /,\s*answering the common (?:query|question) of[^.\n]*\./;
const H2_INTRO_LABEL = /^## مقدمة[:：]/m;
const LEAD_INTRO_LABEL = /^((?:#[^#\n]*\n+)?\s*)(?:\*\*)?مقدمة[:：]/;

const linkCount = (s: string): number => (s.match(/\]\(/g) || []).length;
const headingCount = (s: string): number => (s.match(/^#{1,3} /gm) || []).length;
const wordCount = (s: string): number => s.split(/\s+/).filter(Boolean).length;
const readingTime = (s: string): number => Math.max(1, Math.ceil(wordCount(s) / 200));

// ── main ──────────────────────────────────────────────────────────────────
async function main(): Promise<number> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("content-audit-db-remediation: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are required");
    return 2;
  }
  const supabase: SupabaseClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const cfg: Config = JSON.parse(readFileSync(PATCHES_PATH, "utf-8"));
  console.log(
    `content-audit-db-remediation: mode=${DRY_RUN ? "DRY_RUN" : "APPLY"} · ` +
      `${cfg.patches.length} curated patches · ${cfg.faq_additions.length} faq enrichment(s) · ${cfg.category_fixes.length} category fixes`,
  );

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,slug,language,title,content,category,faq_json,reading_time,updated_at")
    .eq("is_published", true)
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) {
    console.error(`DB read failed: ${error.message}`);
    return 2;
  }
  const rows = (data || []) as unknown as Row[];
  console.log(`rows: ${rows.length} published posts scanned`);

  type Plan = {
    row: Row;
    content: string;
    contentChanged: boolean;
    visibleChange: boolean; // curated patch / faq / block removal touched it
    notes: string[];
    category?: string;
    faq?: FaqItem[];
  };
  const plans: Plan[] = [];
  let failures = 0;

  const bySlug = new Map<string, Row[]>();
  for (const r of rows) {
    const list = bySlug.get(r.slug) || [];
    list.push(r);
    bySlug.set(r.slug, list);
  }

  // ── A. mechanical families (every row) ──────────────────────────────────
  for (const row of rows) {
    const original = row.content || "";
    if (!original) continue;
    const out = fixIntroLabelDuplication(
      fixKeywordFillerTails(fixBrokenWordLinkSplits(original), row.language),
      row.language,
    );
    if (out !== original) {
      const afterKaf = fixBrokenWordLinkSplits(original);
      const afterFiller = fixKeywordFillerTails(afterKaf, row.language);
      const kaf = afterKaf !== original;
      const filler = afterFiller !== afterKaf;
      const intro = out !== afterFiller;
      console.log(
        `  mechanical ${row.slug}/${row.language}: ` +
          `${kaf ? "kaf-split " : ""}${filler ? "filler-tail " : ""}${intro ? "intro-labels " : ""}` +
          `(${original.length} → ${out.length} chars)`,
      );
      plans.push({
        row, content: out, contentChanged: true, visibleChange: false,
        notes: ["mechanical ⑥⑦⑧"],
      });
    }
  }
  // note: a row may already be in plans from mechanical — merge later patches
  const planFor = (row: Row): Plan => {
    let p = plans.find((x) => x.row.id === row.id);
    if (!p) {
      p = { row, content: row.content || "", contentChanged: false, visibleChange: false, notes: [] };
      plans.push(p);
    }
    return p;
  };

  // ── B. curated patches ─────────────────────────────────────────────────
  for (const p of cfg.patches) {
    const row = (bySlug.get(p.slug) || []).find((r) => r.language === p.lang);
    if (!row) {
      console.error(`  PATCH FAIL ${p.slug}/${p.lang}: row not found (${p.note})`);
      failures += 1;
      continue;
    }
    const plan = planFor(row);
    const n = plan.content.split(p.find).length - 1;
    if (n === 1) {
      plan.content = plan.content.replace(p.find, p.replace);
      plan.contentChanged = true;
      plan.visibleChange = true;
      plan.notes.push(`patch: ${p.note}`);
      console.log(`  patch ✓ ${p.slug}/${p.lang}: ${p.note}`);
    } else if (n === 0 && plan.content.includes(p.replace)) {
      console.log(`  patch ↺ ${p.slug}/${p.lang}: already applied (${p.note})`);
    } else {
      console.error(`  PATCH FAIL ${p.slug}/${p.lang}: ${n} occurrences of find (${p.note}) — row untouched`);
      failures += 1;
    }
  }

  // ── C. deterministic block removals (slug-scoped) ─────────────────────
  for (const row of rows) {
    if (!BLOCK_REMOVAL_SLUGS.has(row.slug) || row.language !== "ar") continue;
    const plan = planFor(row);
    const before = plan.content;
    const q = (plan.content.match(/\*\*سؤال القارئ:\*\*/g) || []).length;
    const k = (plan.content.match(/\*\*كلمة مفتاحية:\*\*/g) || []).length;
    if (!q && !k) {
      console.log(`  blocks ↺ ${row.slug}: already clean`);
      continue;
    }
    plan.content = plan.content
      .replace(READER_Q_BLOCK, "")
      .replace(KEYWORD_LABEL_LINE, "")
      .replace(/\n{3,}/g, "\n\n");
    if (plan.content === before) {
      console.error(`  BLOCKS FAIL ${row.slug}: labels present but regex did not match`);
      failures += 1;
      continue;
    }
    plan.contentChanged = true;
    plan.visibleChange = true;
    plan.notes.push(`removed ${q} planted reader-Q blocks + ${k} keyword-label lines`);
    console.log(`  blocks ✓ ${row.slug}: −${q} «سؤال القارئ» blocks · −${k} «كلمة مفتاحية» lines (${before.length} → ${plan.content.length} chars)`);
  }

  // ── D. faq_json enrichment ─────────────────────────────────────────────
  for (const fa of cfg.faq_additions) {
    const row = (bySlug.get(fa.slug) || []).find((r) => r.language === fa.lang);
    if (!row) {
      console.error(`  FAQ FAIL ${fa.slug}/${fa.lang}: row not found`);
      failures += 1;
      continue;
    }
    const plan = planFor(row);
    const current = Array.isArray(row.faq_json) ? row.faq_json : [];
    const existingQs = new Set(current.map((f) => f.question));
    const missing = fa.items.filter((f) => !existingQs.has(f.question));
    if (missing.length === 0) {
      console.log(`  faq ↺ ${fa.slug}: already enriched (${current.length} items)`);
      continue;
    }
    plan.faq = [...current, ...missing];
    plan.visibleChange = true;
    plan.notes.push(`faq_json ${current.length} → ${plan.faq.length} items`);
    console.log(`  faq ✓ ${fa.slug}: +${missing.length} items → ${plan.faq.length}`);
  }

  // ── E. category fixes ──────────────────────────────────────────────────
  for (const cf of cfg.category_fixes) {
    const row = (bySlug.get(cf.slug) || []).find((r) => r.language === cf.lang);
    if (!row) {
      console.error(`  CATEGORY FAIL ${cf.slug}/${cf.lang}: row not found`);
      failures += 1;
      continue;
    }
    const plan = planFor(row);
    if (row.category === cf.to) {
      console.log(`  category ↺ ${cf.slug}/${cf.lang}: already ${cf.to}`);
      continue;
    }
    if (row.category !== cf.from) {
      console.error(`  CATEGORY FAIL ${cf.slug}/${cf.lang}: stored=${row.category} expected=${cf.from} — row untouched`);
      failures += 1;
      continue;
    }
    plan.category = cf.to;
    plan.notes.push(`category ${cf.from} → ${cf.to}`);
    console.log(`  category ✓ ${cf.slug}/${cf.lang}: ${cf.from} → ${cf.to}`);
  }

  // ── validation gates (every planned row, BEFORE any write) ────────────
  console.log(`\nvalidation:`);
  for (const plan of plans) {
    const row = plan.row;
    const before = row.content || "";
    const after = plan.content;
    // mechanical families must be gone in the new content
    if (KAF_SPLIT.test(after) || FILLER_TAIL.test(after) || H2_INTRO_LABEL.test(after) || LEAD_INTRO_LABEL.test(after)) {
      console.error(`  VALIDATION FAIL ${row.slug}/${row.language}: mechanical family survives transform`);
      failures += 1;
    }
    if (BLOCK_REMOVAL_SLUGS.has(row.slug) && row.language === "ar") {
      if (/\*\*سؤال القارئ:\*\*|\*\*كلمة مفتاحية:\*\*/.test(after)) {
        console.error(`  VALIDATION FAIL ${row.slug}: planted label survives`);
        failures += 1;
      }
    }
    if (plan.contentChanged) {
      const linksBefore = linkCount(before);
      const linksAfter = linkCount(after);
      const headingsBefore = headingCount(before);
      const headingsAfter = headingCount(after);
      // beta-alanine loses exactly one link with its removed planted block
      const allowedLinkDelta = row.slug === "beta-alanine-guide-selection" ? 1 : 0;
      if (linksBefore - linksAfter > allowedLinkDelta || linksAfter > linksBefore) {
        console.error(`  VALIDATION FAIL ${row.slug}: links ${linksBefore} → ${linksAfter} (allowed loss ≤ ${allowedLinkDelta})`);
        failures += 1;
      }
      if (headingsAfter !== headingsBefore) {
        console.error(`  VALIDATION FAIL ${row.slug}: headings ${headingsBefore} → ${headingsAfter}`);
        failures += 1;
      }
      const ratio = before.length ? after.length / before.length : 1;
      if (ratio < 0.75) {
        console.error(`  VALIDATION FAIL ${row.slug}: length ratio ${ratio.toFixed(2)} < 0.75`);
        failures += 1;
      }
    }
  }
  if (failures > 0) {
    console.error(`\n${failures} validation/patch failure(s) — nothing written.`);
    return 1;
  }

  const contentRows = plans.filter((p) => p.contentChanged);
  const categoryRows = plans.filter((p) => p.category);
  const faqRows = plans.filter((p) => p.faq);
  console.log(
    `\nplan: ${plans.length} rows touched · content=${contentRows.length} ` +
      `(visible=${plans.filter((p) => p.visibleChange).length}) · categories=${categoryRows.length} · faq=${faqRows.length}`,
  );

  if (DRY_RUN) {
    for (const p of plans) {
      console.log(
        `  PLAN ${p.row.slug}/${p.row.language}: ${p.notes.join(" · ")} ` +
          `(content ${p.contentChanged ? `${(p.row.content || "").length}→${p.content.length} chars` : "unchanged"})` +
          `${p.category ? ` category→${p.category}` : ""}${p.faq ? ` faq→${p.faq.length}` : ""}`,
      );
    }
    console.log(`\nDRY_RUN complete — zero writes.`);
    return 0;
  }

  // ── writes (one update per row, merged fields) ────────────────────────
  let ok = 0;
  for (const plan of plans) {
    const fields: Record<string, unknown> = {};
    if (plan.contentChanged) fields.content = plan.content;
    if (plan.category) fields.category = plan.category;
    if (plan.faq) fields.faq_json = plan.faq;
    if (plan.visibleChange) {
      fields.updated_at = new Date().toISOString();
      if (plan.contentChanged) fields.reading_time = readingTime(plan.content);
    }
    if (Object.keys(fields).length === 0) continue;
    const { error: upErr } = await supabase
      .from("blog_posts")
      .update(fields)
      .eq("id", plan.row.id);
    if (upErr) {
      console.error(`  WRITE FAIL ${plan.row.slug}/${plan.row.language} (row untouched): ${upErr.message}`);
      failures += 1;
      continue;
    }
    ok += 1;
    console.log(
      `  ✓ wrote ${plan.row.slug}/${plan.row.language}: ${Object.keys(fields).join(", ")}`,
    );
  }

  // ── post-write verification (fresh read, independent of plans) ────────
  const { data: after2, error: rereadErr } = await supabase
    .from("blog_posts")
    .select("slug,language,content,category,faq_json")
    .eq("is_published", true)
    .limit(500);
  if (rereadErr || !after2) {
    console.error(`post-write re-read failed: ${rereadErr?.message}`);
    return 1;
  }
  let survivors = 0;
  for (const r of after2 as unknown as Row[]) {
    const c = r.content || "";
    if (KAF_SPLIT.test(c) || FILLER_TAIL.test(c) || H2_INTRO_LABEL.test(c) || LEAD_INTRO_LABEL.test(c)) {
      console.error(`  SURVIVOR ${r.slug}/${r.language}: mechanical family still present`);
      survivors += 1;
    }
    if (BLOCK_REMOVAL_SLUGS.has(r.slug) && r.language === "ar" && /\*\*سؤال القارئ:\*\*|\*\*كلمة مفتاحية:\*\*/.test(c)) {
      console.error(`  SURVIVOR ${r.slug}: planted label still present`);
      survivors += 1;
    }
    if (
      r.language === "ar" &&
      ["beta-alanine-guide-selection", "calculate-daily-calories-weight-loss"].includes(r.slug) &&
      /\*\*سؤال القارئ[\u061B:]/.test(c)
    ) {
      console.error(`  SURVIVOR ${r.slug}: reader-Q still present`);
      survivors += 1;
    }
  }
  for (const cf of cfg.category_fixes) {
    const r = (after2 as unknown as Row[]).find((x) => x.slug === cf.slug && x.language === cf.lang);
    if (!r || r.category !== cf.to) {
      console.error(`  SURVIVOR ${cf.slug}/${cf.lang}: category=${r?.category}`);
      survivors += 1;
    }
  }
  const fa = (after2 as unknown as Row[]).find(
    (x) => x.slug === "beta-alanine-guide-selection" && x.language === "ar",
  );
  if (!fa || !Array.isArray(fa.faq_json) || fa.faq_json.length !== 10) {
    console.error(`  SURVIVOR beta-alanine faq_json=${fa?.faq_json?.length ?? "null"} (expected 10)`);
    survivors += 1;
  }

  console.log(
    `\nDONE: ${ok} row(s) written · ${failures} failure(s) · post-write survivors: ${survivors}`,
  );
  return failures > 0 || survivors > 0 ? 1 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
