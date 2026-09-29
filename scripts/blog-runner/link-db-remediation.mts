/**
 * scripts/blog-runner/link-db-remediation.mts
 *
 * Audit-2 (owner order 2026-09-29, option أ) — retroactive treatment of
 * the OLD published corpus against CONFIRMED-DEAD citation links: the
 * audit's live health-check (HEAD over every external link rendered on
 * the 95 published pages) found 4 links returning 404 to visitors. The
 * P5 link-verify gate checks links only at publish time — published
 * rows were never re-checked; this closes that gap for the 4 measured
 * cases via the SAME channel + methodology as stats-db-remediation:
 *
 *   - DRY_RUN=1 default — plan only, zero writes.
 *   - Curated, byte-exact patches (scripts/blog-runner/link-db-patches.json):
 *     every `find` was extracted BYTE-EXACT from the live DB and
 *     validated to occur EXACTLY ONCE in its row.
 *   - Fail-safe: a patch that does not match exactly once (or 0 with the
 *     replacement already present) skips its row untouched and fails the
 *     run. Idempotent: re-runs converge to a no-op.
 *   - Pre-write replacement-URL health gate: every NEW https URL a patch
 *     introduces is HEAD-checked (redirect-follow, gate UA) — a
 *     CONFIRMED-dead (404/410) replacement aborts the write (never
 *     re-plant a dead link); inconclusive verdicts (403/405/429/timeout)
 *     proceed with a warning (the link-verify fail-open law — an
 *     authority that refuses HEAD must never cost a good citation).
 *   - Structural validation per planned row: the dead URL must be GONE
 *     and the replacement URL PRESENT after patching; image and heading
 *     counts unchanged; length ratio bounded (0.9–1.1).
 *   - Writes content + reading_time + updated_at ONLY (the
 *     cleanup-workflow write law); slugs, titles, faq_json, review
 *     state untouched.
 *
 * EXIT: 0 = ok · 1 = at least one failure · 2 = misconfig.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DRY_RUN = process.env.DRY_RUN !== "0";
const PATCHES_PATH = join(process.cwd(), "scripts/blog-runner/link-db-patches.json");

type Patch = {
  slug: string;
  lang: "en" | "ar";
  find: string;
  replace: string;
  note: string;
};
type Kept = { slug: string; lang: string; reason: string };
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
const imageCount = (s: string): number => (s.match(/!\[/g) || []).length;
const headingCount = (s: string): number => (s.match(/^#{1,3} /gm) || []).length;
const urlsOf = (s: string): string[] => [...s.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]);

/** HEAD-check one URL with the gate's UA — dead / ok / unverified. */
async function headCheck(url: string): Promise<"ok" | "dead" | "unverified"> {
  const attempt = async (): Promise<"ok" | "dead" | "unverified"> => {
    try {
      const res = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "AlkemosLinkVerify/1.0 (+https://alkemos.com)" },
      });
      if (res.status >= 200 && res.status < 400) return "ok";
      if (res.status === 404 || res.status === 410) return "dead";
      return "unverified";
    } catch {
      return "unverified";
    }
  };
  const first = await attempt();
  if (first !== "unverified") return first;
  return attempt(); // one transport-retry (the gate's policy)
}

async function main(): Promise<number> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "link-db-remediation: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are required",
    );
    return 2;
  }
  const supabase: SupabaseClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const cfg: Config = JSON.parse(readFileSync(PATCHES_PATH, "utf-8"));
  console.log(
    `link-db-remediation: mode=${DRY_RUN ? "DRY_RUN" : "APPLY"} · ` +
      `${cfg.patches.length} curated dead-link patches · ${cfg.kept.length} documented kept decision(s)`,
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

  // Pre-write health gate: HEAD-check every NEW URL the patches plant.
  const newUrls = new Set<string>();
  for (const p of cfg.patches) {
    const before = new Set(urlsOf(p.find));
    for (const u of urlsOf(p.replace)) if (!before.has(u)) newUrls.add(u);
  }
  const deadReplacements: string[] = [];
  for (const u of newUrls) {
    const verdict = await headCheck(u);
    if (verdict === "dead") deadReplacements.push(u);
    console.log(`  url ${verdict.padEnd(11)} ${u}`);
  }
  if (deadReplacements.length > 0) {
    console.error(
      `\nABORT: replacement URL(s) confirmed DEAD (never re-plant a dead link): ${deadReplacements.join(", ")}`,
    );
    return 1;
  }

  type Plan = { row: Row; content: string; notes: string[]; deadUrls: string[]; liveUrls: string[] };
  const plans: Plan[] = [];
  let failures = 0;

  // ONE plan per row (the content-audit-db-remediation planFor law):
  // several patches may target the same row — they accumulate on the
  // SAME evolving content, so no write can overwrite a sibling patch.
  const planFor = (row: Row): Plan => {
    let p = plans.find((x) => x.row.id === row.id);
    if (!p) {
      p = { row, content: row.content || "", notes: [], deadUrls: [], liveUrls: [] };
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
    const plan = planFor(row);
    const current = plan.content;
    const n = current.split(p.find).length - 1;
    if (n === 1) {
      plan.content = current.replace(p.find, p.replace);
      plan.notes.push(`patched: ${p.note}`);
      for (const u of urlsOf(p.find)) if (!urlsOf(p.replace).includes(u)) plan.deadUrls.push(u);
      for (const u of urlsOf(p.replace)) plan.liveUrls.push(u);
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
    console.log(`  kept · ${k.slug}: ${k.reason}`);
  }

  // ── validation gates (every planned row, BEFORE any write) ────────────
  if (plans.length > 0) console.log(`validation:`);
  for (const plan of plans) {
    const before = plan.row.content || "";
    const after = plan.content;
    for (const dead of plan.deadUrls) {
      if (after.includes(dead)) {
        console.error(`  VALIDATION FAIL ${plan.row.slug}: dead URL still present (${dead})`);
        failures += 1;
      }
    }
    for (const live of plan.liveUrls) {
      if (!after.includes(live)) {
        console.error(`  VALIDATION FAIL ${plan.row.slug}: replacement URL missing (${live})`);
        failures += 1;
      }
    }
    if (imageCount(after) !== imageCount(before)) {
      console.error(
        `  VALIDATION FAIL ${plan.row.slug}: images ${imageCount(before)} → ${imageCount(after)} (link patches never touch images)`,
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
    if (ratio < 0.9 || ratio > 1.1) {
      console.error(`  VALIDATION FAIL ${plan.row.slug}: length ratio ${ratio.toFixed(3)}`);
      failures += 1;
    }
  }
  if (failures > 0) {
    console.error(`\n${failures} validation/patch failure(s) — nothing written.`);
    return 1;
  }

  console.log(`\nplan: ${plans.length} rows to patch`);
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
  console.log(`\ndone: ${ok} rows patched · ${failures} failure(s)`);
  return failures > 0 ? 1 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    console.error(`link-db-remediation fatal: ${e instanceof Error ? e.message : e}`);
    process.exit(2);
  });
