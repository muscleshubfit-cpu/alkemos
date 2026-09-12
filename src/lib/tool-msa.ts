/**
 * src/lib/tool-msa.ts
 *
 * P2-10 (§12.19 item 10 — owner order «ابدأ p2 البند ١٠»): the tool-surface
 * MSA unification rides the SAME law machinery as the blog (phases 175/176,
 * src/lib/blog-msa.ts) — no fork. This module is the single source for the
 * TOOL-CONTEXT extension of the Latin whitelist, consumed by:
 *
 *   - src/lib/__tests__/tool-msa-surface.test.ts (tool pages + main FAQ)
 *   - src/lib/__tests__/tool-reference-content.test.ts (§12.25 modules)
 *
 * The extension codifies the §12.25-documented exception pattern ("Latin
 * appears only as proper nouns (Mifflin-St Jeor, Trustpilot) or bracketed
 * acronyms (BMR, TDEE)") into three CLOSED classes — anything outside them
 * is a copy defect and must be rewritten Arabic-first (with a parenthetical
 * Latin gloss where the term matters for search):
 *
 *   1. EPONYMS — equation/method names carry their inventors' surnames.
 *      Arabic prose writes them Latin («معادلة Mifflin-St Jeor») exactly as
 *      the §12.25 reference copy already does; transliterations drift and
 *      lose the scientific anchor.
 *   2. TECHNICAL ACRONYMS — measurement-science and search keywords that
 *      have no common Arabic running-text form (Arabic users literally
 *      search «حاسبة TDEE»). BMI/HIIT/WHO/kg/kcal already sit in the base
 *      whitelist.
 *   3. PAYMENT/PLATFORM BRANDS — the law's own «أسماء العلامات» exception
 *      (PayPal, InstaPay, Vodafone Cash, Supabase).
 *
 * NOT here — and therefore BANNED on the tool surface:
 *   - Membership tier names: the Arabic UI names are بريميوم/برو/كوتشينج
 *     (src/lib/memberships.ts nameAr — the tier single source). Bare
 *     Premium/Pro/Coaching in Arabic copy is a defect.
 *   - English common words as tool labels («حاسبة Body Fat») — defects.
 *   - INVERTED glosses («BMR (معدل الأيض الأساسي)») — Arabic leads, the
 *     Latin acronym glosses in parentheses, never the reverse.
 *   - GLUED Arabic-Latin adjacency («وDHA», «لـDevine») — never
 *     allowlisted; spacing is the only cure (the «كريAlkaline» corruption
 *     class stays strict).
 */

/** Eponyms — equation and protocol names (class 1). */
const TOOL_EPONYMS: readonly string[] = [
  "mifflin", "st", "jeor", "harris", "benedict", "katch", "mcardle",
  "shizgal", "roza", "atwater", "adolphe", "quetelet", "ancel", "keys",
  "hamwi", "robinson", "devine", "beckett", "hodgdon", "jackson",
  "pollock",
];

/** Technical acronyms / SEO keywords / file formats (class 2). Exported:
 * the gloss-DIRECTION guard keys off this class — only a term with an
 * Arabic equivalent can be "inverted" (BMR (معدل الأيض)); brands and
 * eponyms carry appositive Arabic parens legitimately (PayPal (الطريقة
 * الرئيسية)) and are therefore exempt from the direction rule. */
export const TOOL_ACRONYMS: readonly string[] = [
  "bmr", "tdee", "dexa", "neat", "tef", "kj", "dha", "epa", "json", "pdf",
];

/** Payment and platform brands (class 3 — the law's brand exception).
 * "product" + "hunt" travel ONLY as the Product Hunt brand pair (the
 * §12.29 review-card CTAs «قيّمنا على Trustpilot» / «تجدنا على Product Hunt»). */
const TOOL_BRANDS: readonly string[] = [
  "paypal", "instapay", "vodafone", "cash", "supabase", "trustpilot",
  "product", "hunt",
];

/**
 * The complete tool-context Latin allowlist. Kept CLOSED and minimal on
 * purpose: adding a token here weakens the guard for every tool page —
 * prefer rewriting the copy Arabic-first with a parenthetical gloss.
 */
export const TOOL_LATIN_ALLOWLIST: ReadonlySet<string> = new Set<string>([
  ...TOOL_EPONYMS,
  ...TOOL_ACRONYMS,
  ...TOOL_BRANDS,
]);
