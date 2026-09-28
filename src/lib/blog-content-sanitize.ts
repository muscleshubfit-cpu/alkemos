/**
 * src/lib/blog-content-sanitize.ts — RENDER-TIME CONTENT SANITIZER
 * (Phase 156, SEO-GEO-4.8 — §7.1 #15 Content Pruning audit, 2026-09-09).
 *
 * WHY (audit evidence, 63 published posts EN+AR):
 *   ① 85 markdown links inside 24 AR posts point at `/blog/<slug>` while
 *      the target article is published in AR only → every one of them is
 *      a user-facing 404 (getBlogPost("en", arSlug) finds nothing).
 *      The AR generation pipeline (legacy rows) never localized URL
 *      prefixes. Zero EN posts carry the mirror defect; zero targets are
 *      actually missing.
 *   ② 3 raw HTML anchors (`<a href="/tools/…">`) inside one AR post are
 *      HTML-escaped by renderMarkdown's XSS guard → they render as dead
 *      literal text. Converting them to markdown BEFORE escaping
 *      restores working links without weakening the XSS guard.
 *   ③ 3 proven CJK corruption tokens inside AR content («超过/進度/棒» —
 *      same defect family Phase 155 fixed in hub data). Deterministic
 *      replacements; the unit-test canary fails if CJK ever survives.
 *
 * DESIGN (same law as insertToolLinks): pure functions, deterministic,
 * idempotent (safe to run twice), no AI, no network, DB rows untouched.
 * The published-slug pools come from the server (cached), so a genuinely
 * opposite-language-only target is NEVER rewritten into a 404.
 */

export type BlogSlugPools = {
  en: ReadonlySet<string>;
  ar: ReadonlySet<string>;
};

/**
 * PHASE 174 (live incident defense): `unstable_cache` JSON-serializes its
 * cached value — a `Set` silently becomes `{}`, and the AR legacy corpus
 * (26/37 published AR posts carry `](/blog/…)` links) then crashed the
 * whole page render with `TypeError: pools.ar.has is not a function`
 * (HTTP 500 on those articles since Phase 156). This normalizer accepts
 * ANY pool-shaped input (real Set, array, or the JSON-roundtripped `{}`
 * cache artifact) and turns it back into a working ReadonlySet, so the
 * sanitize layer can never take a page down — worst case it degrades to
 * a no-op, exactly the documented "never 500s" contract.
 */
function toSet(raw: unknown): ReadonlySet<string> {
  if (raw instanceof Set) return raw;
  if (Array.isArray(raw)) return new Set(raw.filter((s): s is string => typeof s === "string"));
  return new Set<string>(); // {} / null / anything else → safe empty pool
}

/** Normalize both pools defensively at the entry of the prefix rewriter. */
function normalizePools(pools: BlogSlugPools | null | undefined): {
  en: ReadonlySet<string>;
  ar: ReadonlySet<string>;
} {
  const p = (pools ?? {}) as Record<string, unknown>;
  return { en: toSet(p.en), ar: toSet(p.ar) };
}

/**
 * Known-corruption replacement map (audit 2026-09-09, U+ codes recorded
 * so future canaries can be extended without re-deriving them).
 * «超过» (U+8D85U+8FC7) = "exceed" → «أكثر من»   — rest-period AR post
 * «進度» (U+9032U+5EA6) = "progress" → «التقدّم» — sleep-hours AR post
 * «棒ين» (U+68D2)      = stray "stick" + AR dual suffix → dropped;
 *   the sentence already reads correctly without it («حمص مع خضار مقطّع»).
 */
const KNOWN_CORRUPTIONS: ReadonlyArray<readonly [string, string]> = [
  ["超过", "أكثر من"],
  ["進度", "التقدّم"],
  ["棒ين", ""],
];

/** ③ Replace the exact known corruption tokens (idempotent by design). */
export function fixKnownCorruptions(content: string): string {
  let out = content;
  for (const [bad, good] of KNOWN_CORRUPTIONS) out = out.split(bad).join(good);
  return out;
}

/**
 * ② Convert raw HTML anchors with INTERNAL hrefs ("/…") to markdown
 * links. renderMarkdown escapes ALL raw HTML (XSS guard), so any raw
 * anchor today renders as dead literal text — converting the internal
 * ones to markdown restores the link while the guard still applies to
 * everything else. External raw anchors are left untouched (no audit
 * evidence, deliberately conservative scope). Idempotent: the output
 * contains no raw internal anchors anymore.
 */
const RAW_INTERNAL_ANCHOR = /<a\s+href="(\/[^"]*)"[^>]*>((?:(?!<\/a>)[\s\S])*)<\/a>/gi;
const INNER_TAGS = /<[^>]+>/g;

export function fixRawHtmlInternalAnchors(content: string): string {
  return content.replace(RAW_INTERNAL_ANCHOR, (_m, href: string, text: string) => {
    const plain = text.replace(INNER_TAGS, "").trim();
    if (!plain) return _m; // nothing usable to link — keep as-is
    return `[${plain}](${href})`;
  });
}

/**
 * ① Rewrite cross-language markdown link prefixes against the published
 * pools. AR content linking /blog/<slug> where <slug> is published in AR
 * → /ar/blog/<slug> (mirror for EN). A slug that is NOT in the host
 * language pool is left untouched — it either targets the opposite
 * language deliberately (working cross-link) or is genuinely missing
 * (outside this fix's scope — never invent destinations).
 */
const MD_LINK_TO_EN_PREFIX = /\]\((\/blog\/([a-z0-9-]+))\)/g;
const MD_LINK_TO_AR_PREFIX = /\]\((\/ar\/blog\/([a-z0-9-]+))\)/g;

export function fixCrossLanguageLinkPrefixes(
  content: string,
  lang: "en" | "ar",
  pools: BlogSlugPools,
): string {
  // PHASE 174: normalize FIRST — a Set that survived a JSON cache
  // roundtrip is `{}`, and `.has` on it would 500 the whole page.
  const safe = normalizePools(pools);
  if (lang === "ar") {
    return content.replace(MD_LINK_TO_EN_PREFIX, (match, _url: string, slug: string) =>
      safe.ar.has(slug) ? `](/ar/blog/${slug})` : match,
    );
  }
  return content.replace(MD_LINK_TO_AR_PREFIX, (match, _url: string, slug: string) =>
    safe.en.has(slug) ? `](/blog/${slug})` : match,
  );
}

/**
 * ④ ACCESS-POINT FIX (2026-09-14 audit) — AR mirror families for the
 * render-time prefix rewriter.
 *
 * WHY: the audit found AR article bodies (stored rows, authored BEFORE
 * the `urlAr` tool-link rule existed) carrying `](/tools/…)`,
 * `](/exercises…)`, `](/foods…)`, `](/meal-planner)` links. Those are
 * author/model content the insertToolLinks idempotence check deliberately
 * skips (the tool is "already linked") — so the ONLY render-time layer
 * that can localize them is this sanitizer. Every family below has a
 * REAL /ar/* mirror route in src/app/ar (verified 2026-09-14); anything
 * without a guaranteed mirror is deliberately EXCLUDED:
 *   /evo, /coaches, /for-coaches — owner-protected navigation behavior;
 *   /affiliate — EN-only by design (no AR mirror exists);
 *   /auth, /checkout, /referral — private/noindex app surfaces.
 * Idempotent by construction: a path already under /ar/ never matches.
 */
const AR_MIRROR_FAMILIES: ReadonlyArray<string> = [
  "/tools",
  "/exercises",
  "/foods",
  "/meal-planner",
  "/programs",
  "/coaching",
  "/memberships",
  "/diet-plan",
  "/collections",
  "/muscles",
  "/equipment",
  "/about",
  "/faq",
  "/privacy",
  "/terms",
  "/contact",
  "/compare",
  "/ai-meal-planner",
  "/ai-workout-planner",
];

/** Internal, non-AR markdown href inside article content. */
const MD_INTERNAL_HREF = /\]\((\/[a-z0-9][a-z0-9/-]*)\)/g;

function hasArMirror(path: string): boolean {
  if (path === "/ar" || path.startsWith("/ar/")) return false;
  return AR_MIRROR_FAMILIES.some(
    (fam) => path === fam || path.startsWith(`${fam}/`),
  );
}

/**
 * ④ Localize AR article body links for the mirrored families above:
 * `](/tools/macro-calculator)` → `](/ar/tools/macro-calculator)`. EN
 * content is untouched (the audit found zero EN posts linking AR paths).
 */
export function fixArMirrorFamilies(content: string, lang: "en" | "ar"): string {
  if (lang !== "ar") return content;
  return content.replace(MD_INTERNAL_HREF, (match, path: string) =>
    hasArMirror(path) ? `](/ar${path})` : match,
  );
}

/**
 * ⑤ ACCESS-POINT FIX (2026-09-14 audit) — legacy link targets whose
 * FINAL destination is known, applied at render time (DB rows stay
 * untouched — same law as every sanitizer pass here):
 *   • /blog/4-week-beginner-hypertrophy-plan — next.config 301 →
 *     /blog/4-week-beginner-muscle-building-plan; one EN article body
 *     still links the old slug → rewrite to the final post.
 *   • /ar/blog/sleep-recovery-gym-results-3pc8 — next.config 301 →
 *     /ar/blog/sleep-recovery-gym-results; one AR body links the old
 *     slug → rewrite to the final post.
 *   • /blog/muscle-building-bodyweight-home — NO blog_posts row exists
 *     (deleted pre-consolidation) so the EN URL is a hard 404, while the
 *     next.config AR 301 routes its mirror to the live AR guide. The
 *     audit found 4 AR article bodies linking the dead EN path; the only
 *     honest known destination for an AR reader is the AR guide, so the
 *     rewrite goes straight to the FINAL AR URL (skipping the redirect
 *     hop). EN content never links it — no EN mapping exists ("never
 *     invent destinations").
 */
const LEGACY_LINK_REDIRECTS: ReadonlyArray<readonly [string, string, "en" | "ar"]> = [
  ["/blog/4-week-beginner-hypertrophy-plan", "/blog/4-week-beginner-muscle-building-plan", "en"],
  ["/ar/blog/sleep-recovery-gym-results-3pc8", "/ar/blog/sleep-recovery-gym-results", "ar"],
  ["/blog/muscle-building-bodyweight-home", "/ar/blog/home-muscle-building-guide-no-equipment", "ar"],
];

/**
 * ⑤ Replace markdown links pointing at legacy/dead targets with their
 * known final destinations (exact-path match — deterministic, idempotent:
 * the replacements are not themselves legacy targets).
 */
export function fixLegacyRedirectLinks(content: string, lang: "en" | "ar"): string {
  let out = content;
  for (const [oldPath, finalPath, targetLang] of LEGACY_LINK_REDIRECTS) {
    if (targetLang !== lang) continue;
    out = out.split(`](${oldPath})`).join(`](${finalPath})`);
  }
  return out;
}

/**
 * ⑥ CONTENT-AUDIT P0-2 (2026-09-28, audit §1.2) — broken-word link splits.
 *
 * WHY (live-audit evidence, 5 instances across 5 AR articles): the legacy
 * generation pipeline wrapped a link around PART of a word, so the stored
 * markdown reads `تحسب [سعرات](/ar/tools/calorie-calculator)ك بدقة` — the
 * possessive kaf lands AFTER the closing paren and the rendered text
 * shows a visibly split word («سعرات» + «ك» = سعراتك). Recorded shapes:
 * كيف تحسب سعرات</a>ك بدقة · سعرات</a>ك اليومية · تمارين</a>ك لا تظهر.
 *
 * §4.4 UNWIND (2026-09-28, same session): the DB rows were migrated by
 * scripts/blog-runner/content-audit-db-remediation.mts (channel run 22
 * rows, 0 survivors), so this pass is NO LONGER composed into the render
 * pipeline — it stays exported as the remediation channel's transform law
 * (the script imports it verbatim; no fork). A canary in
 * blog-content-sanitize.test.ts pins the unwound composition.
 *
 * RULE: a markdown link IMMEDIATELY followed by the Arabic letter ك (no
 * space) with a word boundary after it is, on the recorded evidence, a
 * split possessive — the kaf moves INSIDE the anchor text. An anchor that
 * already ends with ك never matches (no double-kaf), and the trailing
 * boundary (space / punctuation / end-of-line) prevents eating a
 * following word. Idempotent: the output's link is followed by a
 * boundary, never a bare kaf.
 */
const BROKEN_WORD_KAF = /\[([^\]]*[^ك\s])\]\(([^)\s]+)\)ك(?=[\s،؛؟!.,:؛")\]]|$)/g;

export function fixBrokenWordLinkSplits(content: string): string {
  return content.replace(BROKEN_WORD_KAF, (_m, text: string, url: string) => `[${text}ك](${url})`);
}

/**
 * ⑦ CONTENT-AUDIT P1-1 (2026-09-28, audit §1.3) — self-referential
 * keyword-filler sentence tails.
 *
 * WHY (live-audit evidence, EN): the legacy review pass planted sentences
 * whose TAIL exists only to host a long-tail keyword verbatim and which
 * announce their own SEO purpose mid-prose:
 *   "…is about 1.6–2.2 g per kilogram per day, answering the common query
 *    of how many grams of protein per day to build muscle."
 * The tail is machine-written filler that breaks E-E-A-T (text that says
 * it "answers the common query" is written for crawlers, not readers).
 *
 * §4.4 UNWIND (2026-09-28): the DB row was migrated (channel run), so this
 * pass is NO LONGER composed into the render pipeline — exported as the
 * remediation channel's transform law (see ⑥ above).
 *
 * RULE: the recorded template family "`, answering the common (query|
 * question) of …`" up to the sentence period is deleted (period kept).
 * Deterministic + idempotent: a sentence that no longer contains the
 * trigger phrase can never match again.
 */
const KEYWORD_FILLER_TAIL = /,\s*answering the common (?:query|question) of[^.\n]*\./g;

export function fixKeywordFillerTails(content: string, lang: "en" | "ar"): string {
  if (lang !== "en") return content;
  return content.replace(KEYWORD_FILLER_TAIL, ".");
}

/**
 * ⑧ CONTENT-AUDIT P0-2/§1.2 (2026-09-28) — duplicated «مقدمة» labels.
 *
 * WHY (live-audit evidence, 11 AR articles): the body's opening paragraph
 * carries an inline label AND/OR the first H2 repeats it —
 *   paragraph: «مقدمة: حلمك بجسم رشيق…»
 *   first H2: «## مقدمة: لماذا يحتاج الجسم…»
 * The reader sees "Introduction:" twice before any content.
 *
 * §4.4 UNWIND (2026-09-28): all 11 rows were migrated (channel run), so
 * this pass is NO LONGER composed into the render pipeline — exported as
 * the remediation channel's transform law (see ⑥ above).
 *
 * RULES (both deterministic + idempotent):
 *   a) an H2 heading whose text starts with «مقدمة:»/«مقدمة：» keeps only
 *      the real topic (the label adds nothing out of context);
 *   b) a FIRST body paragraph starting with the label drops it (the intro
 *      is by definition the start of the article — the label is redundant).
 */
const H2_INTRO_LABEL = /^## مقدمة[:：]\s*(.+)$/gm;
const LEADING_PARA_INTRO_LABEL = /^((?:#[^#\n]*\n+)?\s*)(?:\*\*)?مقدمة[:：]\s*(?:\*\*)?/;

export function fixIntroLabelDuplication(content: string, lang: "en" | "ar"): string {
  if (lang !== "ar") return content;
  let out = content.replace(H2_INTRO_LABEL, "## $1");
  const m = out.match(LEADING_PARA_INTRO_LABEL);
  if (m && m[1] !== undefined) {
    out = out.replace(LEADING_PARA_INTRO_LABEL, "$1");
  }
  return out;
}

/**
 * Composed pipeline — the ONLY entry point pages should call.
 * Order matters: raw anchors become markdown links FIRST so the legacy
 * and prefix rewrites see them; corruption fixes are order-independent;
 * legacy exact-path rewrites run BEFORE the family rewriter so a legacy
 * /blog/… target can never be double-prefixed.
 *
 * §4.4 UNWIND (2026-09-28, CONTENT-AUDIT-REMEDIATION §4): the markdown-shape
 * passes ⑦⑧⑨ (kaf splits / filler tails / «مقدمة» labels) were REMOVED from
 * this composition — their blog_posts rows were migrated by the GHA
 * remediation channel (scripts/blog-runner/content-audit-db-remediation.mts,
 * run 36366488858: 22 rows, 0 failures, 0 post-write survivors), so the
 * database is the single source of truth for those shapes. The functions
 * stay exported above as the channel's transform law. A test canary pins
 * the unwound composition so a silent re-addition fails the build.
 */
export function sanitizeBlogContent(
  content: string,
  lang: "en" | "ar",
  pools: BlogSlugPools,
): string {
  return fixCrossLanguageLinkPrefixes(
    fixArMirrorFamilies(
      fixLegacyRedirectLinks(fixKnownCorruptions(fixRawHtmlInternalAnchors(content)), lang),
      lang,
    ),
    lang,
    pools,
  );
}
