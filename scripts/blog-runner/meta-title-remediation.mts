/**
 * scripts/blog-runner/meta-title-remediation.mts
 *
 * PHASE 181 (live audit 2026-09-12) — one-shot meta_title remediation.
 *
 * WHY: clampMetaTitle Laws 1-4 cut over-budget titles at the last word
 * boundary that fits, but could still leave a trailing CONNECTIVE word
 * dangling (live case: "How to Do a Creatine Loading Phase for Strength
 * vs" — the 62-char title's word-boundary cut at 60 kept the comparator
 * "vs" and dropped its operand "Hypertrophy"). Law 5 (dangling-connective
 * strip, added in this same phase) fixes the GENERATOR; this script
 * re-clamps the STORED meta_title of every published post through the
 * improved law so the live corpus converges to the same invariant.
 *
 * HARD SAFETY CONTRACT:
 *   - SELECT published posts only (both languages).
 *   - Writes touch meta_title + updated_at ONLY. Slug, title, content,
 *     images, faq, publish state: never touched.
 *   - The stored meta_title is treated as DERIVED data (the p5 publisher
 *     and the Phase 178 one-shot remediation both derive it from title
 *     via clampMetaTitle) — recomputing it from the same source with a
 *     strictly better clamp is idempotent and lossless.
 *   - Rows whose stored value already equals the recomputed value are
 *     skipped (re-runs converge to a no-op).
 *
 * USAGE (GHA meta-title-remediation.yml, or locally with the same env):
 *   npx --no-install tsx scripts/blog-runner/meta-title-remediation.mts
 * ENV:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   DRY_RUN=1  — report only, zero writes (default)
 *   SLUGS=a,b  — restrict to these slugs (empty = all published)
 */
import { supabaseAdmin, isSupabaseAdminConfigured } from "../../src/lib/supabase/admin";
import { clampMetaTitle } from "../../src/lib/blog-pipeline";

const DRY_RUN = process.env.DRY_RUN !== "0";
const SLUGS = (process.env.SLUGS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

async function main() {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    console.error("[meta-title-remediation] SUPABASE env not configured — aborting.");
    process.exit(1);
  }

  let query = supabaseAdmin
    .from("blog_posts")
    .select("id,slug,language,title,meta_title")
    .eq("is_published", true)
    .order("id");
  if (SLUGS.length) query = query.in("slug", SLUGS);

  const { data, error } = await query;
  if (error) {
    console.error("[meta-title-remediation] SELECT failed:", error.message);
    process.exit(1);
  }
  const rows = data ?? [];
  console.log(
    `[meta-title-remediation] scanned ${rows.length} published posts (${SLUGS.length ? "slug-filtered" : "all"}), DRY_RUN=${DRY_RUN ? 1 : 0}`,
  );

  let touched = 0;
  for (const r of rows) {
    const lang = (r.language === "ar" ? "ar" : "en") as "en" | "ar";
    const ideal = clampMetaTitle(String(r.title ?? ""), lang);
    const stored = String(r.meta_title ?? "");

    if (ideal === stored) continue;

    touched += 1;
    console.log(`  [${lang}] ${r.slug}`);
    console.log(`     stored (${stored.length}ch): ${stored}`);
    console.log(`     ideal (${ideal.length}ch): ${ideal}`);

    if (DRY_RUN) continue;

    const { error: upErr } = await supabaseAdmin
      .from("blog_posts")
      .update({ meta_title: ideal, updated_at: new Date().toISOString() })
      .eq("id", r.id);
    if (upErr) {
      console.error(`     UPDATE failed: ${upErr.message} — row untouched`);
      process.exitCode = 1;
    } else {
      console.log(`     PATCHED ✓`);
    }
  }

  console.log(
    `[meta-title-remediation] done — ${touched} row(s) ${DRY_RUN ? "would be patched" : "patched"}, ${rows.length - touched} already clean.`,
  );
}

main().catch((e) => {
  console.error("[meta-title-remediation] fatal:", e);
  process.exit(1);
});
