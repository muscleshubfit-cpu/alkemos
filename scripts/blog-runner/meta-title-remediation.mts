/**
 * scripts/blog-runner/meta-title-remediation.mts
 *
 * PHASE 181 (live audit 2026-09-12) — one-shot meta_title dangling-tail
 * remediation.
 *
 * WHY: the stored meta_title of creatine-loading-strength-hypertrophy-
 * guide ends on a dangling comparator ("…for Strength vs" — 50ch, the
 * operand "Hypertrophy" was dropped by the pre-181 word-boundary cut).
 * clampMetaTitle Law 5 fixes the GENERATOR; this runner converges the
 * STORED corpus to the same invariant.
 *
 * HARD SAFETY CONTRACT (tightened after the 2026-09-12 dry-run lesson):
 *   - MINIMAL INTERVENTION: apply stripDanglingTail() to the STORED
 *     meta_title only. NEVER recompute from title — the first dry-run
 *     proved stored meta_titles include AI-crafted SEO variants that
 *     legitimately differ from the title (e.g. "Magnesium Forms for
 *     Sleep & Recovery Guide" vs the title's clamp cut), and a
 *     recompute would have clobbered 4+ curated rows.
 *   - Rows whose stored value is already clean are skipped (idempotent,
 *     re-runs converge to a no-op).
 *   - Writes touch meta_title + updated_at ONLY. Slug, title, content,
 *     images, faq, publish state: never touched.
 *   - A cleaned result that becomes empty or collapses below 30 chars
 *     is NOT written — flagged for manual review instead (the stored
 *     title was likely pathological, not a clamp artifact).
 *
 * USAGE (GHA meta-title-remediation.yml, or locally with the same env):
 *   npx --no-install tsx scripts/blog-runner/meta-title-remediation.mts
 * ENV:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   DRY_RUN=1  — report only, zero writes (default)
 *   SLUGS=a,b  — restrict to these slugs (empty = all published)
 */
import { supabaseAdmin, isSupabaseAdminConfigured } from "../../src/lib/supabase/admin";
import { stripDanglingTail } from "../../src/lib/blog-pipeline";

const DRY_RUN = process.env.DRY_RUN !== "0";
const SLUGS = (process.env.SLUGS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const MIN_RESULT_CHARS = 30;

async function main() {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    console.error("[meta-title-remediation] SUPABASE env not configured — aborting.");
    process.exit(1);
  }

  let query = supabaseAdmin
    .from("blog_posts")
    .select("id,slug,language,meta_title")
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
  let flagged = 0;
  for (const r of rows) {
    const stored = String(r.meta_title ?? "").trim();
    if (!stored) continue;

    const cleaned = stripDanglingTail(stored);
    if (cleaned === stored) continue;

    touched += 1;
    console.log(`  [${r.language}] ${r.slug}`);
    console.log(`     stored (${stored.length}ch): ${stored}`);
    console.log(`     clean  (${cleaned.length}ch): ${cleaned}`);

    if (cleaned.length < MIN_RESULT_CHARS) {
      flagged += 1;
      console.log(`     ⚠ cleaned result under ${MIN_RESULT_CHARS} chars — NOT patched, manual review`);
      continue;
    }
    if (DRY_RUN) continue;

    const { error: upErr } = await supabaseAdmin
      .from("blog_posts")
      .update({ meta_title: cleaned, updated_at: new Date().toISOString() })
      .eq("id", r.id);
    if (upErr) {
      console.error(`     UPDATE failed: ${upErr.message} — row untouched`);
      process.exitCode = 1;
    } else {
      console.log(`     PATCHED ✓`);
    }
  }

  console.log(
    `[meta-title-remediation] done — ${touched} dangling row(s) found, ` +
      `${flagged} flagged for review, ${touched - flagged} ${DRY_RUN ? "would be patched" : "patched"}, ` +
      `${rows.length - touched} already clean.`,
  );
  if (flagged > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error("[meta-title-remediation] fatal:", e);
  process.exit(1);
});
