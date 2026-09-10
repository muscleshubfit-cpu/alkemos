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
 * Composed pipeline — the ONLY entry point pages should call.
 * Order matters: raw anchors become markdown links FIRST so the prefix
 * rewrite sees them; corruption fixes are order-independent.
 */
export function sanitizeBlogContent(
  content: string,
  lang: "en" | "ar",
  pools: BlogSlugPools,
): string {
  return fixCrossLanguageLinkPrefixes(
    fixKnownCorruptions(fixRawHtmlInternalAnchors(content)),
    lang,
    pools,
  );
}
