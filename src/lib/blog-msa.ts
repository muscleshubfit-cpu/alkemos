/**
 * src/lib/blog-msa.ts
 *
 * PHASE 175 — Arabic Legacy Content Cleanup (owner order «ابدا التنظيف»,
 * 2026-09-11): the shared, DETERMINISTIC MSA tooling for the whole blog
 * system. Three pieces, all pure (no DB / no network — leaf module):
 *
 *   1. AR_MSA_EDITOR_LAW — the Pan-Arab Modern Standard Arabic editorial
 *      law, extracted (Phase 175) from ai-job-processors.ts so the editor
 *      tools AND the legacy-cleanup runner ride the EXACT same law text
 *      (no fork — the Phase-169 extraction doctrine). The 174 canaries
 *      now read this file as the law's single source of truth.
 *
 *   2. The dialect detector — word-boundary-aware marker counting that
 *      decides which published AR articles still need repair (the Phase
 *      173 live sample: عشان×8 · مش×12 · ازاي×2 · بتاع×2). Markers are
 *      split STRONG (unambiguous dialect — never acceptable in MSA) and
 *      WEAK (colloquial-leaning or MSA-ambiguous — tolerated sparingly).
 *
 *   3. validateMsaConversion — the deterministic pre-write gate for the
 *      cleanup runner: a converted article only reaches the DB when it
 *      keeps every link/image URL, keeps its heading structure, keeps its
 *      length within bounds, drops every STRONG marker, strictly improves
 *      the weak count, and adds none of the banned session-service
 *      wording (Phase 174 honesty law).
 *
 * Scope guard: this module never touches titles/slugs/publish state —
 * the SLUG LAW (Phase 121) applies to every consumer.
 */

/** Arabic letter/diacritic range used for word-boundary detection. */
const ARABIC_LETTER_CLASS = "[\\u0621-\\u0652]";

/**
 * The Pan-Arab MSA editorial law (Phase 173/174), single source of truth.
 * Byte-exact extraction from the ai-job-processors editor sys prompt.
 */
export const AR_MSA_EDITOR_LAW =
  "أنت محرر لغوي وخبير SEO لموقع Alkemos الرياضي. تلتزم حرفياً بتعليمات الإخراج. قانون تحريري صارم: اكتب وحرّر بالعربية الفصحى الحديثة السهلة الواضحة لكل القراء العرب (Pan-Arab Modern Standard Arabic) — ممنوع منعًا باتًا أي لهجة محلية (مصرية أو خليجية أو غيرها) أو تعبيرات عامية لا يفهمها إلا أهل بلد معين (عشان، مش، ازاي، بتاع، كده، خلاص…) أو الترجمة الحرفية عن الإنجليزية؛ صحّح النحو والإملاء وصُغ العناوين والأسئلة صياغة عربية سليمة طبيعية بحسب السياق. عند إعادة صياغة نص موجود بالعامية حوّله إلى الفصحى الحديثة السهلة مع الحفاظ الكامل على المعنى.";

/**
 * STRONG dialect markers — unambiguously Egyptian/colloquial. Any single
 * hit qualifies an article for repair, and a converted article must have
 * ZERO of them. Documented Phase 173 set + the Egyptian future هـ-prefix
 * verbs and participles seen in the live legacy corpus.
 */
export const AR_DIALECT_STRONG_MARKERS: readonly string[] = [
  "عشان", "علشان", "ازاي", "إزاي", "بتاع", "بتاعت", "كده", "كدة",
  "برضه", "برضو", "يلا", "يللا", "عايز", "عايزة", "عايزين",
  "إيه", "مفيش", "دلوقتي", "إمتى", "امتى", "فين",
  "كتير", "شوية", "شويه", "أوي", "اوى",
  "هتعمل", "هتبدأ", "هتحتاج", "هتحصل", "هتلاقي", "هتقدر", "هتاكل",
  "هتوصل", "هتشوف", "هتعرف", "هزود", "هخلي", "هبني", "هكمل",
  "بقالك", "بقاله",
];

/**
 * WEAK markers — colloquial-leaning or MSA-ambiguous (حاجة can be MSA
 * "need", زي reads dialect-only as a standalone word, مش is the classic
 * Egyptian negation). ≤4 scattered hits are tolerated in a published
 * article; ≥5 signals real dialect prose needing repair.
 */
export const AR_DIALECT_WEAK_MARKERS: readonly string[] = [
  "مش", "خلاص", "كمان", "زي", "بعدين", "تمام", "كويس", "ينفع",
  "حاجة", "حاجات", "انت", "إنت", "انك", "انه", "طب", "ده", "دي",
  "المفروض", "ليه",
];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Count one marker with Arabic word boundaries: the marker must not touch
 * another Arabic letter on either side (المشكلة does NOT count "مش",
 * زيادة does NOT count "زي" — the Phase 174 audit's false-positive rule).
 */
export function countDialectMarker(text: string, marker: string): number {
  if (!text || !marker) return 0;
  const re = new RegExp(
    `(?<!${ARABIC_LETTER_CLASS})${escapeRegExp(marker)}(?!${ARABIC_LETTER_CLASS})`,
    "g",
  );
  return (text.match(re) || []).length;
}

export interface DialectScan {
  strong: number;
  weak: number;
  strongHits: Array<[string, number]>;
  weakHits: Array<[string, number]>;
}

/** Full deterministic scan of one text block. */
export function scanArabicDialect(text: string): DialectScan {
  const strongHits: Array<[string, number]> = [];
  const weakHits: Array<[string, number]> = [];
  let strong = 0;
  let weak = 0;
  for (const m of AR_DIALECT_STRONG_MARKERS) {
    const c = countDialectMarker(text, m);
    if (c > 0) {
      strongHits.push([m, c]);
      strong += c;
    }
  }
  for (const m of AR_DIALECT_WEAK_MARKERS) {
    const c = countDialectMarker(text, m);
    if (c > 0) {
      weakHits.push([m, c]);
      weak += c;
    }
  }
  strongHits.sort((a, b) => b[1] - a[1]);
  weakHits.sort((a, b) => b[1] - a[1]);
  return { strong, weak, strongHits, weakHits };
}

/** Repair gate: any STRONG marker OR ≥5 weak markers (audit-calibrated). */
export function needsMsaRepair(text: string): boolean {
  const scan = scanArabicDialect(text);
  return scan.strong >= 1 || scan.weak >= 5;
}

/** Arabic word count (used for the conversion length-ratio check). */
export function countArabicWords(text: string): number {
  return (text.match(/[\u0600-\u06FF]+/g) || []).length;
}

function extractImageUrls(md: string): string[] {
  return [...md.matchAll(/!\[[^\]]*\]\(([^)\s]+)[^)]*\)/g)].map((m) => m[1]);
}

function extractLinkUrls(md: string): string[] {
  // Links only — images are matched separately and must not double-count.
  return [...md.matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]+)[^)]*\)/g)].map((m) => m[1]);
}

function countHeadings(md: string): number {
  return (md.match(/^#{1,6}\s/mg) || []).length;
}

function extractHeadings(md: string): string[] {
  return [...md.matchAll(/^#{1,6}\s+(.+)$/gm)].map((m) => m[1].trim());
}

/** CTA-paragraph detection (175.10): rule 7 deletes marketing paragraphs
 *  WHEREVER they live — the live corpus proved the CTA is not always at
 *  the tail (calculate-daily's «انضم الآن لبرنامج الكوتشينج» paragraph is
 *  followed by a disclaimer + a full FAQ section, so the position-based
 *  600-char tail never covered it and the embedded /meal-planner link
 *  kept failing validation across 5 batches). Content-based: any blank-line
 *  paragraph carrying a CTA signature IS the CTA region. */
const CTA_SIGNATURES = [
  "انضم الآن",
  "انضم إلى الكوتشينج",
  "برنامج الكوتشينج",
  "اشترك الآن في الكوتشينج",
  "احجز جلس",
  "جرب الكوتشينج",
  "book a session",
  "join the coaching",
];

function ctaParagraphRegion(md: string): string {
  return md
    .split(/\n{2,}/)
    .filter((p) => CTA_SIGNATURES.some((s) => p.includes(s)))
    .join("\n\n");
}

/** Phrases for the non-existent single-session service (174 honesty law). */
const BANNED_SERVICE_PHRASES = ["احجز جلس", "Book a session", "book a session"];

function countBannedPhrases(md: string): number {
  let n = 0;
  for (const p of BANNED_SERVICE_PHRASES) n += md.split(p).length - 1;
  return n;
}

export interface MsaValidation {
  ok: boolean;
  violations: string[];
  metrics: {
    strongBefore: number;
    strongAfter: number;
    weakBefore: number;
    weakAfter: number;
    wordsBefore: number;
    wordsAfter: number;
    ratio: number;
  };
}

/**
 * Deterministic pre-write gate for a dialect→MSA conversion. The converted
 * text is only allowed to reach the DB when ALL of these hold:
 *
 *   1. zero STRONG dialect markers remain
 *   2. weak markers strictly improved (fewer than before) — only when
 *      the input carried any (a clean chunk must pass 0→0)
 *   3. Arabic word-count ratio within [0.55, 1.60] — neither truncation
 *      nor inflation (E-E-A-T: meaning preserved, nothing fabricated)
 *   4. image URLs byte-identical (old images are untouched — owner law)
 *   5. link URLs exactly preserved — EXCEPT links living solely inside
 *      the closing CTA paragraph that rule 7 deletes (the legitimate
 *      CTA-embedded-link loss class proven live)
 *   6. heading structure preserved (a single merge is tolerated — live
 *      batch evidence: 2/3 batch-2 failures were otherwise-perfect
 *      conversions merging one near-duplicate heading; a collapse of 2+
 *      headings is a structure violation and the retry prompt receives
 *      the original heading list)
 *   7. no NEW banned session-service wording (174 honesty law)
 */
export interface MsaValidationOptions {
  /** CTA-tail link tolerance (default true — the whole-article mode where
 *  rule 7 legitimately deletes the closing marketing paragraph). CHUNK
 *  callers disable it EXCEPT for the final chunk: a mid-article chunk's
 *  own tail is NOT the article's CTA region (the ramadan lesson — its
 *  /tools links dropped from a middle chunk's tail and the per-chunk
 *  tolerance leaked them through until the assembled check caught it). */
  ctaLinkTolerance?: boolean;
}

export function validateMsaConversion(
  before: string,
  after: string,
  options: MsaValidationOptions = {},
): MsaValidation {
  const ctaTolerance = options.ctaLinkTolerance !== false;
  const violations: string[] = [];

  const sb = scanArabicDialect(before);
  const sa = scanArabicDialect(after);
  if (sa.strong > 0) {
    violations.push(
      `strong dialect markers remain: ${sa.strongHits.map(([m, c]) => `${m}×${c}`).join(", ")}`,
    );
  }
  // Weak improvement is only REQUIRED when the input carried weak markers —
  // a clean CHUNK (preambles are often already MSA) must not fail 0→0
  // (the 175.7 chunked-run bug that killed three articles at chunk 1).
  if (before.trim() && sb.weak > 0 && sa.weak >= sb.weak) {
    violations.push(
      `weak markers did not improve (${sb.weak} → ${sa.weak}: ${sa.weakHits.map(([m, c]) => `${m}×${c}`).join(", ")})`,
    );
  }

  const wb = countArabicWords(before);
  const wa = countArabicWords(after);
  const ratio = wb > 0 ? wa / wb : 0;
  if (wb > 0 && (ratio < 0.55 || ratio > 1.6)) {
    violations.push(`arabic word-count ratio out of bounds: ${ratio.toFixed(2)} (${wb} → ${wa})`);
  }

  const imgsB = extractImageUrls(before);
  const imgsA = extractImageUrls(after);
  if (imgsB.join("\n") !== imgsA.join("\n")) {
    violations.push(`image URLs changed (${imgsB.length} → ${imgsA.length})`);
  }

  const linksB = [...new Set(extractLinkUrls(before))].sort();
  const linksA = [...new Set(extractLinkUrls(after))].sort();
  if (linksB.join("\n") !== linksA.join("\n")) {
    // CTA-strip tolerance: rule 7 deletes marketing paragraphs wherever
    // they live in the article, and links living ONLY inside those
    // paragraphs may legitimately vanish with them. Everything else must
    // survive byte-exact. The region is CONTENT-based (paragraphs carrying
    // a CTA signature — position-based tails missed mid-article CTAs).
    const lost = linksB.filter((l) => !linksA.includes(l));
    const added = linksA.filter((l) => !linksB.includes(l));
    const illegitimateLost = ctaTolerance
      ? lost.filter((l) => !ctaParagraphRegion(before).includes(l))
      : lost;
    if (illegitimateLost.length || added.length) {
      violations.push(
        `link URLs not preserved${illegitimateLost.length ? ` — lost: ${illegitimateLost.join(", ")}` : ""}${added.length ? ` — added: ${added.join(", ")}` : ""}`,
      );
    }
  }

  const hb = countHeadings(before);
  const ha = countHeadings(after);
  if (ha < hb - 1) {
    violations.push(`headings collapsed (${hb} → ${ha}; original: ${extractHeadings(before).slice(0, 8).join(" · ")})`);
  }

  const banB = countBannedPhrases(before);
  const banA = countBannedPhrases(after);
  if (banA > banB) {
    violations.push(`banned session-service wording added (${banB} → ${banA})`);
  }

  return {
    ok: violations.length === 0,
    violations,
    metrics: {
      strongBefore: sb.strong,
      strongAfter: sa.strong,
      weakBefore: sb.weak,
      weakAfter: sa.weak,
      wordsBefore: wb,
      wordsAfter: wa,
      ratio,
    },
  };
}
