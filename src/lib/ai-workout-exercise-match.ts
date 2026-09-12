/**
 * AI Workout Planner → exercise-library matcher — §12.35 (owner directive
 * 2026-09-12: «أداة خطط التمرين بالذكاء الاصطناعي استخدم مكتبة التمارين
 * بالصور الخاصة بنا فى النتائج»).
 *
 * The enrichment layer behind /api/ai/workout-plan-demo: after the plan's
 * shape is validated, every generated exercise name is matched against the
 * site's OWN 868-exercise library (src/lib/exercises.ts — server-only per
 * the BUNDLE LAW) so the results render the library's real images and link
 * into its bilingual exercise pages.
 *
 * LAWS (guarded in src/lib/__tests__/ai-workout-exercise-match.test.ts):
 *   - HONEST MATCHING ONLY: a match is returned solely on token evidence
 *     (coverage ≥ 0.6 with ≥2 matched tokens, or a tight single-token
 *     hit). Unmatched movements render as plain rows — the layer never
 *     fabricates a library entry, an image, or a link.
 *   - EQUIPMENT HONESTY: matches respect the visitor's equipment world
 *     (a bodyweight-only split never links a barbell page), and an
 *     explicitly named equipment token (barbell/dumbbell/cable/…) pins
 *     the match to that equipment family.
 *   - SERVER-ONLY: imports the 1.6MB exercises array — the client pages
 *     receive the enriched JSON only; nothing of this module ships to
 *     the browser.
 *   - DETERMINISTIC: ties break on coverage → fewest unmatched library
 *     tokens → shortest name → array order; the same input always
 *     resolves to the same library entry.
 */

import { EXERCISES } from "./exercises";
import type { ExerciseCategory, Equipment } from "./exercises-shared";
import { getExerciseImageUrl } from "./exercise-images";
import type { WorkoutPlan, WorkoutEquipment } from "./ai-workout-planner";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface WorkoutExerciseLibraryMatch {
  /** Library slug — the exercise page path is /exercises/{slug} (+ /ar mirror). */
  slug: string;
  /** Library name (English — the library's own display name on both locales). */
  name: string;
  category: ExerciseCategory;
  /** First library image (start position) as a full URL. */
  image: string;
}

export interface EnrichedWorkoutExercise {
  name: string;
  sets: number;
  reps: number | string;
  library: WorkoutExerciseLibraryMatch | null;
}

export interface EnrichedWorkoutDay {
  name: string;
  focus?: string;
  exercises: EnrichedWorkoutExercise[];
}

export interface EnrichedWorkoutPlan {
  days: EnrichedWorkoutDay[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalization
// ─────────────────────────────────────────────────────────────────────────────

const STOPWORDS = new Set([
  "with", "a", "an", "the", "of", "off", "on", "to", "and", "or", "for",
  "using", "against", "from", "in", "into", "while", "at", "by", "is", "are",
]);

const AR_DIACRITICS = /[\u064B-\u065F\u0670]/g;
const AR_TATWEEL = /\u0640/g;

function isArabicToken(t: string): boolean {
  return /[\u0600-\u06FF]/.test(t);
}

/** Normalize an Arabic token: strip diacritics/tatweel, unify letter forms. */
function normalizeArToken(t: string): string {
  return t
    .replace(AR_DIACRITICS, "")
    .replace(AR_TATWEEL, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه");
}

/** Strip the attached Arabic article/prepositions (ال/بال/وال/لل). */
function stripArPrefixes(t: string): string {
  for (const p of ["بال", "وال", "لل", "ال"]) {
    if (t.startsWith(p) && t.length - p.length >= 3) return t.slice(p.length);
  }
  return t;
}

/** Split any name into lowercase alphanumeric/Arabic tokens, minus stopwords. */
function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !STOPWORDS.has(t));
}

/** All plural-stripped variants of a token (s-strip and es-strip differ:
 * «raises»→«raise» but «presses»→«press» — matching tries every variant). */
function tokenVariants(t: string): Set<string> {
  const v = new Set<string>([t]);
  if (t.length > 2 && t.endsWith("s")) v.add(t.slice(0, -1));
  if (t.length > 3 && t.endsWith("es")) v.add(t.slice(0, -2));
  return v;
}

/** Loose token equality via plural-variant intersection or ≥5-char prefix family. */
function tokensMatch(a: string, b: string): boolean {
  if (a === b) return true;
  const va = tokenVariants(a);
  const vb = tokenVariants(b);
  for (const x of va) if (vb.has(x)) return true;
  for (const x of va) {
    for (const y of vb) {
      if (x.length >= 5 && y.length >= 5 && (x.startsWith(y) || y.startsWith(x))) {
        return true;
      }
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Arabic → English lexicon (token level)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Well-known Arabic exercise vocabulary → English library tokens. Written in
 * natural form; keys are normalized (diacritics/article stripped) at module
 * init. An unmapped Arabic token simply never matches — it lowers coverage
 * instead of guessing (the honesty law).
 */
const AR_TOKEN_LEXICON: Record<string, string[]> = {
  // Squat family
  "سكوات": ["squat"], "سكواتس": ["squat"], "القرفصاء": ["squat"], "قرفصاء": ["squat"],
  "بلغاري": ["bulgarian"],
  "كوب": ["goblet"], "جوبلت": ["goblet"],
  // Hinge / deadlift family
  "ميتة": ["deadlift"], "ديدليفت": ["deadlift"], "ديدلفت": ["deadlift"],
  "رفعة": ["raise", "deadlift"], "رفعه": ["raise", "deadlift"],
  "روماني": ["romanian"],
  "الصباح": ["morning"],
  // Press family
  "بنش": ["bench"], "برس": ["press"], "الضغط": ["press"], "ضغط": ["press"],
  "كتف": ["shoulder", "overhead"], "اكتاف": ["shoulder"], "عسكري": ["military"],
  "مائل": ["incline"], "منحدر": ["decline"], "سفلي": ["decline"],
  "مسطح": ["flat"], "مستوي": ["flat"],
  // Equipment
  "بار": ["barbell"], "دمبل": ["dumbbell"], "دمبلز": ["dumbbell"],
  "كابل": ["cable"], "بولي": ["pulley", "cable"],
  "ماكينة": ["machine"], "جهاز": ["machine"],
  "مطاط": ["band"], "كيتل": ["kettlebell"], "كيتلبل": ["kettlebell"],
  "سميث": ["smith"],
  // Row / pull family
  "تجديف": ["row"],
  "سحب": ["pull"],
  "امامي": ["front"], "امام": ["front"],
  "خلفي": ["rear", "reverse"], "عكسي": ["reverse"], "معاكس": ["reverse"],
  "لات": ["lat"],
  "عقلة": ["pull", "up"], "عقلات": ["pull", "up"],
  "دفع": ["push", "dip"], "متوازي": ["dip", "parallel"],
  "وجه": ["face"],
  // Arms
  "ثني": ["curl"], "بسط": ["extension"], "تمديد": ["extension"],
  "ترايسبس": ["triceps"], "بايسبس": ["biceps"],
  "مطرقة": ["hammer"], "فرنسية": ["french"], "فرنسي": ["french"],
  "رسغ": ["wrist"],
  // Shoulders
  "رفرفة": ["raise"], "تفتيح": ["raise", "lateral"],
  "جانبي": ["lateral", "side"],
  // Legs
  "رجل": ["leg"], "رجلين": ["leg"], "ارجل": ["leg"], "اقدام": ["leg"],
  "سمانة": ["calf"], "بطة": ["calf"],
  "مشي": ["walking"],
  "اندفاع": ["lunge"], "طعن": ["lunge"], "خطوة": ["lunge", "step"], "خطوات": ["lunge", "step"],
  // Core
  "بلانك": ["plank"], "لوح": ["plank"],
  "كرانش": ["crunch"],
  "جلوس": ["sit", "up", "seated"], "جالس": ["seated"], "قائم": ["standing"], "وقوف": ["standing"],
  "بطن": ["ab"], "كور": ["core"],
  "جسر": ["bridge"],
  "ورك": ["hip"], "هيب": ["hip"], "ثيرست": ["thrust"],
  // Grip / form adjectives
  "قبضة": ["grip"], "ضيقة": ["close"], "واسعة": ["wide"],
  "قفز": ["jump"], "نط": ["jump"],
  "حبل": ["rope"],
  "شراغ": ["shrug"], "شراغز": ["shrug"],
};

const LEXICON_NORMALIZED = new Map<string, string[]>();
for (const [k, v] of Object.entries(AR_TOKEN_LEXICON)) {
  LEXICON_NORMALIZED.set(stripArPrefixes(normalizeArToken(k)), v);
}

/** Expand one input token into its English library-token candidates. */
function expandToken(t: string): string[] {
  if (!isArabicToken(t)) return [t];
  const norm = stripArPrefixes(normalizeArToken(t));
  // ة→ه normalization means «رومانية» lands as «رومانيه» while the lexicon
  // key «روماني» has no ه — fall back to the ه-less form on a miss.
  return (
    LEXICON_NORMALIZED.get(norm) ??
    LEXICON_NORMALIZED.get(norm.replace(/ه$/, "")) ??
    []
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Equipment laws
// ─────────────────────────────────────────────────────────────────────────────

/** Which library equipment families are honestly usable per equipment world. */
const EQUIP_COMPAT: Record<WorkoutEquipment, ReadonlySet<Equipment> | null> = {
  bodyweight: new Set<Equipment>(["bodyweight", "none"]),
  "home-dumbbells": new Set<Equipment>(["dumbbell", "bodyweight", "none"]),
  "full-gym": null, // everything
};

/** Equipment named EXPLICITLY in the exercise name pins the family. */
const EXPLICIT_EQUIPMENT: ReadonlyArray<{ tokens: string[]; equipment: Equipment }> = [
  { tokens: ["barbell", "بار"], equipment: "barbell" },
  { tokens: ["dumbbell", "دمبل", "دمبلز"], equipment: "dumbbell" },
  { tokens: ["cable", "كابل", "بولي"], equipment: "cable" },
  { tokens: ["machine", "ماكينة", "جهاز"], equipment: "machine" },
  { tokens: ["kettlebell", "كيتل", "كيتلبل"], equipment: "kettlebell" },
  { tokens: ["band", "مطاط"], equipment: "band" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Library index (built once, server-side)
// ─────────────────────────────────────────────────────────────────────────────

interface LibEntry {
  slug: string;
  name: string;
  category: ExerciseCategory;
  equipment: Equipment;
  tokens: string[];
  firstImage: string;
}

const LIB: LibEntry[] = EXERCISES.map((e) => ({
  slug: e.slug,
  name: e.nameEn,
  category: e.category,
  equipment: e.equipment,
  tokens: tokenize(e.nameEn),
  firstImage: getExerciseImageUrl(e.imageKey.split(",")[0]?.trim() ?? ""),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Synonym phrases (checked on the normalized input BEFORE tokenizing)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Domain synonyms the library names differently than the models write
 * them. Applied verbatim (case-insensitive) before tokenization — never
 * a guess, each maps a real, universally-agreed equivalence.
 */
const SYNONYM_PHRASES: ReadonlyArray<{ find: RegExp; replace: string }> = [
  { find: /\bback\s+squat\b/gi, replace: "barbell squat" },
  { find: /\u0633\u0643\u0648\u0627\u062a\s*\u062e\u0644\u0641\u064a/g, replace: "\u0633\u0643\u0648\u0627\u062a \u0628\u0627\u0644\u0628\u0627\u0631" },
];

function applySynonymPhrases(name: string): string {
  let out = name;
  for (const { find, replace } of SYNONYM_PHRASES) out = out.replace(find, replace);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoring weights
// ─────────────────────────────────────────────────────────────────────────────

/** Equipment words in library names — neutral extras, never a modifier penalty. */
const EQUIPMENT_WORDS = new Set([
  "barbell", "dumbbell", "bodyweight", "cable", "machine", "kettlebell",
  "band", "bands", "smith", "leverage",
]);

const EXTRA_SUFFIX_PENALTY = 0.5; // variant suffix ("- Medium Grip") — mild
const EXTRA_PREFIX_PENALTY = 4.0; // movement modifier ("Guillotine" bench) — heavy

// ─────────────────────────────────────────────────────────────────────────────
// Matching
// ─────────────────────────────────────────────────────────────────────────────

const COVERAGE_MIN = 0.6;

/**
 * Match one generated exercise name to the library — or null (never a
 * guess). Deterministic: coverage → modifier-weighted extras → fewest
 * tokens → library array order.
 */
export function matchWorkoutExercise(
  name: string,
  equipment: WorkoutEquipment,
): WorkoutExerciseLibraryMatch | null {
  const inputTokens = tokenize(applySynonymPhrases(name));
  if (inputTokens.length === 0) return null;
  const expanded = inputTokens.map(expandToken);

  // Explicit equipment pin (honesty: never link across equipment families
  // the name itself names).
  let pinned: Equipment | null = null;
  for (const rule of EXPLICIT_EQUIPMENT) {
    if (expanded.some((alts) => alts.some((a) => rule.tokens.includes(a)))) {
      pinned = rule.equipment;
      break;
    }
  }

  const compat = EQUIP_COMPAT[equipment];
  let best: { entry: LibEntry; score: number } | null = null;

  // SEMANTIC COVERAGE: equipment words the model wrote («dumbbell
  // lateral raise») are optional tokens — coverage is judged on the
  // semantic core (lateral + raise). An equipment word alone is not an
  // exercise name.
  const semanticMask = expanded.map((alts) => alts.some((a) => !EQUIPMENT_WORDS.has(a)));
  const semanticCount = semanticMask.filter(Boolean).length;
  if (semanticCount === 0) return null;

  for (const entry of LIB) {
    if (compat && !compat.has(entry.equipment)) continue;
    if (pinned && entry.equipment !== pinned) continue;

    let matchedSemantic = 0;
    expanded.forEach((alts, i) => {
      if (semanticMask[i] && alts.some((a) => entry.tokens.some((lt) => tokensMatch(a, lt)))) {
        matchedSemantic++;
      }
    });
    const coverage = matchedSemantic / semanticCount;
    if (coverage < COVERAGE_MIN) continue;
    // Single-semantic-token inputs only match tight entries (e.g. "Plank"
    // → Plank, "Squat" → Barbell Squat) — never long variant chains.
    if (
      matchedSemantic < 2 &&
      !(semanticCount === 1 && matchedSemantic === 1 && entry.tokens.length <= 2)
    ) {
      continue;
    }

    // Modifier-weighted extras: an unmatched NON-equipment token placed
    // BEFORE the matched core ("Guillotine" in "Barbell Guillotine Bench
    // Press") signals a different movement than the one the model named —
    // it outweighs two variant suffixes. Equipment words ("Barbell") and
    // trailing variant suffixes ("- Medium Grip") stay mild extras.
    const matchedIdx = entry.tokens.map((lt) =>
      expanded.some((alts) => alts.some((a) => tokensMatch(a, lt))),
    );
    const lastMatchedIdx = matchedIdx.lastIndexOf(true);
    let extraPenalty = 0;
    entry.tokens.forEach((lt, idx) => {
      if (matchedIdx[idx]) return;
      const isEquip = EQUIPMENT_WORDS.has(lt);
      const isPrefix = idx < lastMatchedIdx;
      extraPenalty += isEquip ? EXTRA_SUFFIX_PENALTY : isPrefix ? EXTRA_PREFIX_PENALTY : EXTRA_SUFFIX_PENALTY;
    });
    const score = coverage * 10 - extraPenalty - entry.tokens.length * 0.01;
    if (!best || score > best.score) best = { entry, score };
  }

  if (!best) return null;
  return {
    slug: best.entry.slug,
    name: best.entry.name,
    category: best.entry.category,
    image: best.entry.firstImage,
  };
}

/** Enrich a validated plan with library matches (pure — the route calls it). */
export function enrichWorkoutPlanWithLibrary(
  plan: WorkoutPlan,
  equipment: WorkoutEquipment,
): EnrichedWorkoutPlan {
  return {
    days: plan.days.map((day) => ({
      name: day.name,
      ...(day.focus !== undefined ? { focus: day.focus } : {}),
      exercises: day.exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        library: matchWorkoutExercise(ex.name, equipment),
      })),
    })),
  };
}
