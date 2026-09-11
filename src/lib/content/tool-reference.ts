/**
 * ToolReferenceContent types — Phase SEO-GEO-6.5 (§12.19 P1-6,
 * "المعيار المزدوج"): calculator.net-style deep reference content
 * for the six standalone tool pages, bilingual by construction.
 *
 * LAWS (guarded in src/lib/__tests__/tool-reference-content.test.ts):
 *   - STANDALONE-PER-TOOL (owner directive 2026-09-12: «تاكد ان كل
 *     اداة صفحة مستقلة»): every tool owns ONE content module living on
 *     its own page. No content object, paragraph, or FAQ is shared
 *     between tools — the renderer is shared chrome, the content never.
 *   - BILINGUAL BY CONSTRUCTION: every text is an {en, ar} pair, so the
 *     two languages can never drift in structure.
 *   - VISIBLE FAQ ONLY: FAQ is rendered as plain visible headings +
 *     paragraphs. FAQPage JSON-LD is forbidden (§12.19 DO-NOT list;
 *     SEO-SCHEMA-REFERENCE.md May 2026).
 *   - MSA (فصحى) for all Arabic — scanned by the blog-msa dialect
 *     detector in the test suite (same machinery as the blog law
 *     175/176). Latin appears only as proper nouns (Mifflin-St Jeor,
 *     Trustpilot) or bracketed acronyms (BMR, TDEE) — the established
 *     exception pattern.
 *   - ACCURACY-TO-CODE: named equations, constants, and preset numbers
 *     in the copy must match the tool implementations (canaries pin
 *     the constants: 1.2/1.9 activity factors, 70% keto fat, 495 Navy
 *     constant, 35 ml/kg water rule, 18.5–24.9 ideal BMI range).
 */

/** Bilingual text pair — structure parity guaranteed by the type. */
export interface Bi {
  en: string;
  ar: string;
}

/** Bilingual table. Rows are parallel arrays per language. */
export interface ReferenceTable {
  caption: Bi;
  columns: Bi[];
  /** rows[i].en and rows[i].ar are cell arrays matching columns length. */
  rows: Array<{ en: string[]; ar: string[] }>;
}

/** A renderable block inside a section. */
export type ContentBlock =
  | { kind: "p"; text: Bi }
  | { kind: "list"; items: Bi[]; ordered?: boolean }
  | { kind: "table"; table: ReferenceTable }
  | { kind: "h3"; text: Bi };

/** One H2 section with a stable anchor id. */
export interface ReferenceSection {
  /** Stable latin slug used as the anchor id (#how-it-works). */
  id: string;
  heading: Bi;
  blocks: ContentBlock[];
}

/** Visible FAQ item — plain text, no FAQPage schema. */
export interface FaqItem {
  q: Bi;
  a: Bi;
}

/** The full reference package for ONE tool page. */
export interface ToolReference {
  /** Tool slug — must match the page it is rendered on. */
  slug: string;
  /** Lead paragraph directly under the tool (before the first H2). */
  intro: Bi;
  sections: ReferenceSection[];
  faqs: FaqItem[];
}

/** Flatten every localized string of a reference into one text blob. */
export function flattenReferenceText(ref: ToolReference, lang: "en" | "ar"): string {
  const parts: string[] = [ref.intro[lang]];
  for (const s of ref.sections) {
    parts.push(s.heading[lang]);
    for (const b of s.blocks) {
      if (b.kind === "p" || b.kind === "h3") parts.push(b.text[lang]);
      else if (b.kind === "list") for (const i of b.items) parts.push(i[lang]);
      else if (b.kind === "table") {
        parts.push(b.table.caption[lang]);
        for (const c of b.table.columns) parts.push(c[lang]);
        for (const r of b.table.rows) parts.push(r[lang].join(" "));
      }
    }
  }
  for (const f of ref.faqs) {
    parts.push(f.q[lang]);
    parts.push(f.a[lang]);
  }
  return parts.join("\n");
}

/** Word count of one language's full reference text. */
export function referenceWordCount(ref: ToolReference, lang: "en" | "ar"): number {
  return flattenReferenceText(ref, lang)
    .split(/\s+/)
    .filter(Boolean).length;
}
