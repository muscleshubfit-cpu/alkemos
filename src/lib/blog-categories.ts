/**
 * src/lib/blog-categories.ts — THE SINGLE SOURCE of the blog category
 * registry (Phase 192, intent-audit follow-up).
 *
 * WHY THIS EXISTS (fork incident, live-verified 2026-09-14): the
 * category registry lived TWICE — `blog.ts` (client, 10 ids) and
 * `blog-server.ts` (server, 8 ids, fitness/wellness MISSING). The
 * server-side category page gate therefore rejected the ids the client
 * happily stored/displayed: /blog/category/fitness and /wellness (+
 * their AR mirrors) 404'd live, and the category chip on every article
 * row carrying those ids linked a 404 (live-audit: optimal-rest-
 * periods-resistance-training, cold-bath-home-wellness). Same incident
 * class as the ONE-SLUG-LAW — one registry, zero forks.
 *
 * The canonical list is the CLIENT truth (10 ids) — it matches
 * BLOG_CATEGORY_CONTENT in blog-category-content.ts (10 content keys)
 * and the DB rows. Client and server both re-export from HERE; a
 * fork-guard canary (blog-categories.test.ts) fails the build if a
 * second copy reappears.
 *
 * Client-safe: pure data + pure functions, no "use client", no imports.
 */

export const BLOG_CATEGORIES = [
  { id: "nutrition", en: "Nutrition", ar: "تغذية" },
  { id: "workout", en: "Workout", ar: "تمارين" },
  { id: "supplements", en: "Supplements", ar: "مكملات" },
  { id: "weight-loss", en: "Weight Loss", ar: "خسارة وزن" },
  { id: "muscle-gain", en: "Muscle Gain", ar: "بناء عضلات" },
  { id: "health", en: "Health", ar: "صحة" },
  { id: "recipes", en: "Recipes", ar: "وصفات" },
  { id: "science", en: "Science", ar: "علم" },
  { id: "fitness", en: "Fitness", ar: "لياقة" },
  { id: "wellness", en: "Wellness", ar: "عافية" },
] as const;

export type BlogCategoryId = (typeof BLOG_CATEGORIES)[number]["id"];

export const VALID_CATEGORY_IDS = new Set<string>(BLOG_CATEGORIES.map((c) => c.id));

/**
 * Normalize a category id to a valid one. Canonical ids short-circuit;
 * common AI-hallucinated synonyms map to their family ("training" →
 * "workout", "diet" → "nutrition", …) and anything unrecognized falls
 * back to "nutrition". Used when saving posts (the AI pipeline) AND
 * when building category-page URLs (the chip on every article card) so
 * a stored synonym id can never produce a 404 category URL.
 */
export function normalizeCategory(categoryId: string | undefined | null): BlogCategoryId {
  if (!categoryId) return "nutrition";
  const id = categoryId.trim().toLowerCase();
  if (VALID_CATEGORY_IDS.has(id)) return id as BlogCategoryId;
  // Common synonyms the AI model has returned in the past
  const SYNONYMS: Record<string, BlogCategoryId> = {
    training: "workout",
    exercise: "workout",
    fitness: "workout",
    diet: "nutrition",
    food: "nutrition",
    supplement: "supplements",
    "weight loss": "weight-loss",
    fatloss: "weight-loss",
    "muscle building": "muscle-gain",
    bodybuilding: "muscle-gain",
    recipe: "recipes",
    cooking: "recipes",
    wellness: "health",
    medical: "science",
    research: "science",
  };
  return SYNONYMS[id] || "nutrition";
}

/** Bilingual label for a category id (falls back to the raw id). */
export function getCategoryLabel(categoryId: string, lang: "en" | "ar"): string {
  const cat = BLOG_CATEGORIES.find((c) => c.id === categoryId);
  return cat ? (lang === "ar" ? cat.ar : cat.en) : categoryId;
}
