/**
 * Hub Depth Content — SEO/GEO master plan Phase SEO-GEO-5.2 (2026-09-09).
 *
 * Master plan §6.3 defines the Hub/Collection page template as REQUIRED
 * ("مطلوب تنفيذه فورًا") with 8 items. Phase SEO-GEO-1 shipped items 1, 3,
 * 6, 7, 8 (H1+intro, grid, internal links, CTA, ItemList+Breadcrumb schema).
 * This module ships the two remaining depth items:
 *   - item 4: an explanatory guide section (training/nutrition context)
 *   - item 5: a FAQ section with 5–10 atomic-answer questions (§8.2 #4)
 *
 * SCHEMA DECISION (docs/SEO-SCHEMA-REFERENCE.md is authoritative): NO
 * FAQPage markup — Google retired FAQ rich results entirely on 2026-05-07
 * (zero SERP benefit). NO QAPage markup either — that type is reserved for
 * genuine user-submitted Q&A pages, which editorial hub FAQs are not. The
 * visible question/answer text itself serves users and AI answer engines
 * (GEO tactic §8.2: quotable atomic answers), which is the actual goal.
 *
 * Content rules enforced by tests (hub-depth-content.test.ts):
 *   - every NON-EMPTY hub in all three families has an entry (the two
 *     empty hubs — muscles/cardio, equipment/none — are deliberately
 *     exempt: writing "training guides" for pages with zero exercises
 *     would be dishonest; they stay unadvertised per §12.14 policy)
 *   - 5–8 FAQ entries per hub, every answer 25–110 words (atomic-answer
 *     range: direct, quotable, no fluff)
 *   - bilingual completeness (EN + AR, natural editorial Arabic)
 *   - zero CJK characters (the 12.14 corruption family)
 *   - zero URLs / zero "PMID" strings (anti-fabrication law: content may
 *     name established bodies — ACSM, WHO — but never fake citations)
 *   - every registry slug must resolve in its family (no orphans)
 *
 * Pure data + one accessor — server-rendered by HubGuideSection /
 * HubFaqSection (src/components/hubs/HubDepth.tsx).
 */

export type HubFaqEntry = {
  qEn: string;
  aEn: string;
  qAr: string;
  aAr: string;
};

export type HubDepthContent = {
  /** EN guide body: paragraphs separated by "\n\n"; lines starting "- " render as a bullet list. */
  guideEn: string;
  /** AR guide body, same conventions (rendered RTL by the page context). */
  guideAr: string;
  faq: HubFaqEntry[];
};

export type HubDepthFamily = "muscle" | "equipment" | "collection";

/**
 * Hubs with zero matching library rows (Phase 155 §12.14 discovery) —
 * kept live for link-permanence but UNADVERTISED, and deliberately given
 * NO depth content: a training/nutrition guide for an empty collection
 * would promise what the page cannot show.
 */
export const HUB_DEPTH_EMPTY_EXEMPT: Record<HubDepthFamily, readonly string[]> = {
  muscle: ["cardio"],
  equipment: ["none"],
  collection: [],
};

import { MUSCLE_DEPTH } from "./hub-depth-muscles";
import { EQUIPMENT_DEPTH } from "./hub-depth-equipment";
import { COLLECTION_DEPTH } from "./hub-depth-collections";

const REGISTRY: Record<HubDepthFamily, Record<string, HubDepthContent>> = {
  muscle: MUSCLE_DEPTH,
  equipment: EQUIPMENT_DEPTH,
  collection: COLLECTION_DEPTH,
};

/** Returns the depth content for a hub, or null for the exempt/unknown slugs. */
export function getHubDepth(
  family: HubDepthFamily,
  slug: string,
): HubDepthContent | null {
  return REGISTRY[family][slug] ?? null;
}
