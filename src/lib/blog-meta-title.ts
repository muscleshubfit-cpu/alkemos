/**
 * src/lib/blog-meta-title.ts — the SERP meta-title law, extracted.
 *
 * PHASE 189 (SEO-GEO-10, deep-audit P1-1, 2026-09-13): the law block was
 * moved VERBATIM out of src/lib/blog-pipeline.ts (its birthplace — SEO-GEO-
 * 6.3 / Phase 181) into this ZERO-DEPENDENCY module for one reason:
 * blog-pipeline.ts imports the whole AI provider chain (ai-provider →
 * fetch calls), so importing clampMetaTitle from it dragged that chain
 * into every importer. The render-time surfaces that now consume the law
 * (fetchBlogForOG in blog-server.ts — the single choke point for
 * <title>/og:title/JSON-LD headline/breadcrumb on BOTH language mirrors
 * plus /api/og-image — and the BlogArticlePage share title, a CLIENT
 * component) must stay import-light. blog-pipeline.ts re-exports the law
 * so every existing importer (p5-publish, the Phase-181 remediation
 * runner, the test suite) keeps working — SINGLE source of truth, zero
 * duplication (guarded by blog-meta-title-render.test.ts).
 *
 * Same law, three layers (all converge to this module):
 *   1. GENERATOR (p5-publish): clamps meta_title at write time.
 *   2. STORED DATA (Phase-181 remediation runner): one-shot convergence.
 *   3. RENDER (Phase 189 — this wiring): the durable guarantee — legacy
 *      rows can never leak an over-budget <title> to SERP again, because
 *      the clamp is applied when the meta payload is FETCHED, not when
 *      the data happens to be clean.
 */

// ═══════════════════════════════════════════════════════════════
// Phase SEO-GEO-6.3 (§12.19 P0-3) — SERP-safe meta title clamp
// ═══════════════════════════════════════════════════════════════

/**
 * SERP title budgets. Google renders ~60 latin chars / ~70 Arabic chars
 * before pixel-truncation; the live audit (2026-09-11) found the p5
 * publisher hard-cutting `meta_title` with `.slice(0, 60)` mid-word on
 * 23/31 EN articles — degrading SERP CTR and keyword completeness.
 */
const META_TITLE_MAX: Record<"en" | "ar", number> = { en: 60, ar: 70 };

/** Trailing brand suffix (incl. doubled "— Alkemos — Alkemos") — the
 * page template/branding already carries the brand, so the stored title
 * must not repeat it (audit: one AR title shipped a doubled suffix). */
const BRAND_SUFFIX_RE = /[\s]*[—–\-|·]+\s*(Alkemos|ألكيموس)\s*$/i;

/** Trailing separators/punctuation left behind after a word cut. */
const TRAILING_JUNK_RE = /[\s]*[,،;؛:\-—–|·؟?!.…]+\s*$/;

/**
 * PHASE 181 (live audit 2026-09-12) — trailing connective words that read
 * as DANGLING when the budget cut lands right after them. Found live on
 * creatine-loading-strength-hypertrophy-guide: the 62-char title cut at
 * the 60-char word boundary left "…for Strength vs" (the comparator "vs"
 * survived the cut while its operand "Hypertrophy" did not). Law 5 strips
 * these AFTER the separator law, looped so a cascade like "… for vs the"
 * cleans fully. List kept conservative: words that are (almost) never a
 * legitimate final word of an SEO title in either language.
 */
const DANGLING_CONNECTIVES: readonly string[] = [
  // EN — comparators, coordinators, determiners, high-frequency preps
  "vs", "versus", "and", "or", "but", "nor", "so", "yet",
  "the", "a", "an", "of", "to", "for", "with", "from", "by", "in", "on",
  "at", "into", "onto", "as", "your", "our", "their", "how", "why",
  "what", "when", "where", "which",
  // AR — حروف الجر والربط وأدوات الاستفهام (standalone forms only)
  "في", "من", "على", "إلى", "الى", "عن", "مع", "أو", "او", "ثم", "لكن",
  "بين", "عند", "بعد", "قبل", "دون", "مثل", "حيث", "كيف", "ما", "هل",
];

/** True when the string ends with a dangling connective word (Latin
 * matching is case-insensitive — "…And" must die like "…and"). */
function endsWithDanglingConnective(t: string): string | null {
  const lower = t.toLowerCase();
  for (const w of DANGLING_CONNECTIVES) {
    if (t.length > w.length && lower.endsWith(" " + w.toLowerCase())) {
      return w;
    }
  }
  return null;
}

/**
 * PHASE 181 — strip trailing separator junk AND dangling connectives
 * from an (already budget-sized) title tail. Looped (stripping "vs" can
 * expose "…for", stripping "for" can expose "…the"). Exported as the
 * single source of truth shared by clampMetaTitle (generator law) and
 * the one-shot meta-title remediation runner (stored-data law) — the
 * runner applies it MINIMALLY to the stored meta_title and never
 * recomputes from title (stored meta_titles include AI-crafted SEO
 * variants that differ from the title by design; a dry-run on
 * 2026-09-12 proved recomputing would clobber 4+ curated rows).
 */
export function stripDanglingTail(t: string): string {
  let out = t.trim();
  for (let pass = 0; pass < 4; pass += 1) {
    const before = out;
    out = out.replace(TRAILING_JUNK_RE, "").trim();
    const dangling = endsWithDanglingConnective(out);
    if (dangling) {
      out = out.slice(0, out.length - dangling.length).trim();
    }
    if (out === before) break;
  }
  return out;
}

/**
 * PHASE 181 (remediation-safe variant) — strip trailing dangling
 * CONNECTIVE words from a stored meta_title WITHOUT touching a
 * legitimate terminal punctuation mark. Question-form titles
 * ("…للمبتدئين؟" / "…after a workout?") END on "؟"/"?" by design;
 * the second dry-run (2026-09-12) flagged 7 such rows as false
 * positives under the junk-first strip. Here separators are removed
 * ONLY when a connective strip EXPOSED them (cascade cleanup, e.g.
 * "…for —" -> "—" exposed -> stripped -> "…for" -> stripped).
 */
export function stripDanglingConnectives(t: string): string {
  let out = t.trim();
  for (let pass = 0; pass < 4; pass += 1) {
    const before = out;
    const dangling = endsWithDanglingConnective(out);
    if (dangling) {
      out = out.slice(0, out.length - dangling.length).trim();
      // Clean separators EXPOSED by the strip only.
      out = out.replace(TRAILING_JUNK_RE, "").trim();
    }
    if (out === before) break;
  }
  return out;
}

/**
 * Clamp a generated article title into the SERP budget WITHOUT cutting
 * words in half and WITHOUT duplicating the trailing brand.
 *
 * Laws:
 *   1. Strip any trailing brand suffix first (looped — handles doubles).
 *   2. Titles already within budget pass through unchanged (minus suffix).
 *   3. Over-budget titles are cut at the LAST WORD BOUNDARY that fits;
 *      only a pathological single-word over-budget title falls back to a
 *      hard cut.
 *   4. Trailing separators are trimmed so the clamp never ends on "… —".
 *
 * Used by the p5 publisher (new posts), the one-shot legacy meta_title
 * remediation, and — since PHASE 189 — the RENDER layer
 * (fetchBlogForOG + the article share title): same single source of
 * truth for generator, stored data, and display.
 */
export function clampMetaTitle(rawTitle: string, lang: "en" | "ar"): string {
  const max = META_TITLE_MAX[lang];
  let t = rawTitle.trim();
  if (!t) return t;

  // Law 1 — strip trailing brand suffix (doubled suffixes need >1 pass).
  for (let pass = 0; pass < 3; pass += 1) {
    const stripped = t.replace(BRAND_SUFFIX_RE, "");
    if (stripped === t) break;
    t = stripped.trim();
  }
  if (!t) return rawTitle.trim(); // brand-only title: keep the original

  // Law 2 — already within budget.
  if (t.length <= max) return t;

  // Law 3 — word-boundary cut.
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const floor = Math.floor(max / 2);
  const clipped = lastSpace >= floor ? cut.slice(0, lastSpace) : cut;

  // Law 4 + Law 5 (PHASE 181) — never end on a dangling separator OR
  // connective. stripDanglingTail loops both (see its doc above).
  const cleaned = stripDanglingTail(clipped);

  return cleaned || cut.trim();
}
