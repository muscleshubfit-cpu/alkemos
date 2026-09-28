/**
 * scripts/blog-runner/stats-db-remediation.mts
 *
 * AUDIT_REPORT.md §9-المرحلة 2, item 3 (2026-09-29) — retroactive
 * treatment of the OLD corpus against FABRICATED STATISTICS (audit
 * F9/§C-live-evidence: pre-FACT-GUARD articles carry unlinked
 * "studies show … by 15%" claims). Same channel + methodology as
 * content-audit-db-remediation.mts / retro-pair / legacy-ar-cleanup:
 *
 *   - DRY_RUN=1 default — plan only, zero writes.
 *   - Curated, byte-exact patches (scripts/blog-runner/stats-db-patches.json):
 *     every `find` was extracted BYTE-EXACT from the live DB (the corpus
 *     carries U+2011 hyphens / narrow spaces — hand-typed finds are not
 *     byte-safe) and validated to occur EXACTLY ONCE in its row.
 *   - Fail-safe: a patch that does not match exactly once (or 0 with the
 *     replacement already present) skips its row untouched and fails the
 *     run. Idempotent: re-runs converge to a no-op.
 *   - Softening policy (the audit's «وتخفيف ما يلزم»): remove FABRICATED
 *     PRECISION (percentages / per-hour deltas attributed to unnamed
 *     studies) and unlinked research-attribution; KEEP commonly
 *     recommended ranges (dosages, timing, recovery windows) reframed as
 *     common guidance — the FACT GUARD law applied retroactively.
 *   - Documented KEPT decisions (false positives of the scan) ride the
 *     patches file and are logged, never silently dropped.
 *   - Writes content + reading_time + updated_at ONLY (the cleanup-workflow
 *     write law); slugs, titles, faq_json, review state untouched.
 *
 * EXIT: 0 = ok · 1 = at least one failure · 2 = misconfig.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DRY_RUN = process.env.DRY_RUN !== "0";
const PATCHES_PATH = join(process.cwd(), "scripts/blog-runner/stats-db-patches.json");

type Patch = {
  slug: string;
  lang: "en" | "ar";
  find: string;
  replace: string;
  note: string;
};
type Kept = { slug: string; lang: "en" | "ar"; reason: string };
type Config = { patches: Patch[]; kept: Kept[] };

type Row = {
  id: string;
  slug: string;
  language: "en" | "ar";
  title: string;
  content: string | null;
  reading_time: number | null;
};

const wordCount = (s: string): number => s.split(/\s+/).filter(Boolean).length;
const readingTime = (s: string): number => Math.max(1, Math.ceil(wordCount(s) / 200));
const linkCount = (s: string): number => (s.match(/\]\(/g) || []).length;
const headingCount = (s: string): number => (s.match(/^#{1,3} /gm) || []).length;

async function main(): Promise<number> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "stats-db-remediation: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are required",
    );
    return 2;
  }
  const supabase: SupabaseClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const cfg: Config = JSON.parse(readFileSync(PATCHES_PATH, "utf-8"));
  console.log(
    `stats-db-remediation: mode=${DRY_RUN ? "DRY_RUN" : "APPLY"} · ` +
      `${cfg.patches.length} curated softening patches · ${cfg.kept.length} documented kept decisions`,
  );

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,slug,language,title,content,reading_time")
    .eq("is_published", true)
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) {
    console.error(`DB read failed: ${error.message}`);
    return 2;
  }
  const rows = (data || []) as unknown as Row[];
  console.log(`rows: ${rows.length} published posts scanned`);

  const byKey = new Map<string, Row[]>();
  for (const r of rows) {
    const list = byKey.get(`${r.slug}|${r.language}`) || [];
    list.push(r);
    byKey.set(`${r.slug}|${r.language}`, list);
  }

  type Plan = { row: Row; content: string; notes: string[] };
  const plans: Plan[] = [];
  let failures = 0;

  // ONE plan per row (the content-audit-db-remediation planFor law):
  // several patches may target the same row — they accumulate on the
  // SAME evolving content, so no write can overwrite a sibling patch.
  const planFor = (row: Row): Plan => {
    let p = plans.find((x) => x.row.id === row.id);
    if (!p) {
      p = { row, content: row.content || "", notes: [] };
      plans.push(p);
    }
    return p;
  };

  for (const p of cfg.patches) {
    const row = (byKey.get(`${p.slug}|${p.lang}`) || [])[0];
    if (!row) {
      console.error(`  PATCH FAIL ${p.slug}/${p.lang}: row not found (${p.note})`);
      failures += 1;
      continue;
    }
    // accumulate on the plan's current content (already-softened text
    // included), so multi-patch rows compose instead of overwriting.
    const current = planFor(row).content;
    const n = current.split(p.find).length - 1;
    if (n === 1) {
      const plan = planFor(row);
      plan.content = current.replace(p.find, p.replace);
      plan.notes.push(`softened: ${p.note}`);
      console.log(`  patch ✓ ${p.slug}/${p.lang}: ${p.note}`);
    } else if (n === 0 && current.includes(p.replace)) {
      console.log(`  patch ↺ ${p.slug}/${p.lang}: already applied (${p.note})`);
    } else {
      console.error(
        `  PATCH FAIL ${p.slug}/${p.lang}: ${n} occurrences of find (${p.note}) — row untouched`,
      );
      failures += 1;
    }
  }

  for (const k of cfg.kept) {
    console.log(`  kept · ${k.slug}/${k.lang}: ${k.reason}`);
  }

  // ── validation gates (every planned row, BEFORE any write) ────────────
  if (plans.length > 0) console.log(`validation:`);
  for (const plan of plans) {
    const before = plan.row.content || "";
    const after = plan.content;
    if (linkCount(after) !== linkCount(before)) {
      console.error(
        `  VALIDATION FAIL ${plan.row.slug}: links ${linkCount(before)} → ${linkCount(after)} (softening never touches links)`,
      );
      failures += 1;
    }
    if (headingCount(after) !== headingCount(before)) {
      console.error(
        `  VALIDATION FAIL ${plan.row.slug}: headings ${headingCount(before)} → ${headingCount(after)}`,
      );
      failures += 1;
    }
    const ratio = before.length ? after.length / before.length : 1;
    if (ratio < 0.75 || ratio > 1.25) {
      console.error(`  VALIDATION FAIL ${plan.row.slug}: length ratio ${ratio.toFixed(2)}`);
      failures += 1;
    }
  }
  if (failures > 0) {
    console.error(`\n${failures} validation/patch failure(s) — nothing written.`);
    return 1;
  }

  console.log(`\nplan: ${plans.length} rows to soften`);
  if (DRY_RUN) {
    for (const p of plans) {
      console.log(
        `  PLAN ${p.row.slug}/${p.row.language}: ${p.notes.join(" · ")} ` +
          `(${(p.row.content || "").length} → ${p.content.length} chars)`,
      );
    }
    console.log(`\nDRY_RUN complete — zero writes.`);
    return 0;
  }

  let ok = 0;
  for (const plan of plans) {
    const { error: upErr } = await supabase
      .from("blog_posts")
      .update({
        content: plan.content,
        reading_time: readingTime(plan.content),
        updated_at: new Date().toISOString(),
      })
      .eq("id", plan.row.id);
    if (upErr) {
      console.error(`  WRITE FAIL ${plan.row.slug}/${plan.row.language}: ${upErr.message}`);
      failures += 1;
      continue;
    }
    ok += 1;
    console.log(`  ✓ wrote ${plan.row.slug}/${plan.row.language}: content, reading_time, updated_at`);
  }
  console.log(`\ndone: ${ok} rows softened · ${failures} failure(s)`);
  return failures > 0 ? 1 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    console.error(`stats-db-remediation fatal: ${e instanceof Error ? e.message : e}`);
    process.exit(2);
  });
