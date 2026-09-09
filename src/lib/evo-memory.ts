/**
 * EVO permanent memory (EVO-2 — W3 of docs/EVO-MASTER-PLAN.md).
 *
 * OWNER DECISIONS (163.1, docs/EVO-MASTER-PLAN.md §7):
 *   D1 — memory is FREE for every logged-in user. Anonymous visitors have
 *        no account → no memory. The PAID gating of chat_messages history
 *        restore (Phase 69) is untouched — this module is a new layer.
 *   D2 — NO user-facing "forget everything" UI. Admin-side deletion on
 *        documented support requests only.
 *
 * PURE + CLIENT-SAFE: no DOM, no fetch, no env, no Supabase — the API route
 * (api/ai/chat) is the thin wrapper. Same posture as evo-feedback.ts /
 * evo-safety.ts so every rule here is unit-testable in isolation.
 *
 * PRIVACY LAW: the extraction prompt carries a PII denial-list (no
 * diagnoses, medications, mental-health detail, contacts, addresses,
 * finances, third-party names). Facts are durable third-person statements
 * capped at 300 chars — nothing free-text uncapped reaches the DB.
 */

export const EVO_MEMORY_FACT_MAX = 300;
export const EVO_MEMORY_FACTS_PER_EXTRACTION = 5;
/** Inject at most this many active facts into the system prompt (W3). */
export const EVO_MEMORY_TOP_INJECT = 15;
/** Run extraction on every Nth dispatched message (W3: «بعد كل 10 رسائل»). */
export const EVO_MEMORY_EXTRACT_EVERY = 10;
/** Per-message cap inside the extraction transcript (token hygiene). */
export const EVO_MEMORY_TRANSCRIPT_MESSAGE_MAX = 500;
/** Max transcript entries (history slice + current message + final reply). */
export const EVO_MEMORY_TRANSCRIPT_MESSAGES = 12;

export type EvoMemoryCategory =
  | "goal"
  | "preference"
  | "lifestyle"
  | "constraint"
  | "other";

const CATEGORIES: readonly EvoMemoryCategory[] = [
  "goal",
  "preference",
  "lifestyle",
  "constraint",
  "other",
];

export type EvoMemoryFactDraft = {
  fact: string;
  category: EvoMemoryCategory;
};

/**
 * Normalize Arabic orthography + Latin case for stable duplicate matching —
 * same normalization family as evo-safety.ts (diacritics/tatweel stripped,
 * alef/yaa/taa-marbouta/hamza forms unified) + whitespace collapse.
 */
export function normalizeForMemory(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "")
    // Arabic-Indic (٠-٩) + Extended (۰-۹) digits → Latin — fitness facts
    // are number-heavy («انزال 10 كيلو») and models mix both digit systems.
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/**
 * Simple textual-similarity dedup (W3: «إزالة تكرار بسيط»):
 * normalized equality, or containment when the shorter string is a real
 * phrase (>= 8 normalized chars) — «بيحب الكارديو» duplicates
 * «العميل بيحب الكارديو جدا في التمرين». Length guard keeps fragments
 * («تمرين») from matching everything.
 */
export function isDuplicateMemoryFact(
  candidate: string,
  existing: readonly string[],
): boolean {
  const c = normalizeForMemory(candidate);
  if (!c) return true; // empty-normalized candidates are dropped, not stored
  for (const e of existing) {
    const n = normalizeForMemory(e);
    if (!n) continue;
    if (c === n) return true;
    if (c.length >= 8 && n.length >= 8 && (c.includes(n) || n.includes(c))) {
      return true;
    }
  }
  return false;
}

function parseCategory(value: unknown): EvoMemoryCategory {
  if (typeof value === "string") {
    const hit = CATEGORIES.find((c) => c === value.trim().toLowerCase());
    if (hit) return hit;
  }
  return "other";
}

/**
 * Sanitize rows read back from the evo_memory table (DB constraint already
 * caps fact/category — this is the belt-and-suspenders pass before prompt
 * injection). NEVER throws; junk rows are dropped.
 */
export function sanitizeStoredFacts(
  rows: readonly { fact: unknown; category: unknown }[],
): EvoMemoryFactDraft[] {
  const out: EvoMemoryFactDraft[] = [];
  for (const row of rows) {
    if (typeof row?.fact !== "string") continue;
    const fact = row.fact.replace(/\s+/g, " ").trim().slice(0, EVO_MEMORY_FACT_MAX);
    if (fact.length < 3) continue;
    out.push({ fact, category: parseCategory(row.category) });
    if (out.length >= EVO_MEMORY_TOP_INJECT) break;
  }
  return out;
}

/**
 * Validate a parsed extraction payload (whatever the model returned) into
 * clean fact drafts. NEVER throws — junk in, zero facts out.
 * Accepts [{fact, category}, ...] and bare ["fact", ...] shapes.
 * Caps: ≤5 facts per extraction, each ≤300 chars, dedup within the batch
 * and against the caller-supplied existing active facts.
 */
export function validateMemoryFacts(
  parsed: unknown,
  existing: readonly string[] = [],
): EvoMemoryFactDraft[] {
  if (!Array.isArray(parsed)) return [];
  const out: EvoMemoryFactDraft[] = [];
  const seen: string[] = [...existing];
  for (const item of parsed) {
    if (out.length >= EVO_MEMORY_FACTS_PER_EXTRACTION) break;
    const rawFact =
      typeof item === "string"
        ? item
        : item && typeof item === "object" && typeof (item as { fact?: unknown }).fact === "string"
          ? (item as { fact: string }).fact
          : null;
    if (typeof rawFact !== "string") continue;
    // Newlines would corrupt the one-fact-per-line injection block.
    const fact = rawFact.replace(/\s+/g, " ").trim().slice(0, EVO_MEMORY_FACT_MAX);
    if (fact.length < 3) continue;
    if (isDuplicateMemoryFact(fact, seen)) continue;
    const category =
      typeof item === "object" && item !== null
        ? parseCategory((item as { category?: unknown }).category)
        : "other";
    out.push({ fact, category });
    seen.push(fact);
  }
  return out;
}

/**
 * Build the extraction user prompt from the conversation transcript.
 * Returns null when there is nothing worth extracting (no user turn).
 *
 * The denial-list is PART of the prompt contract (privacy law):
 * durable lifestyle/fitness facts only — never clinical/mental-health
 * detail, medications, contacts, finances, or third-party names.
 */
export function buildEvoMemoryPrompt(
  transcript: readonly { role: "user" | "assistant"; content: string }[],
): string | null {
  const userTurns = transcript.filter((m) => m.role === "user");
  if (userTurns.length === 0) return null;

  const lines = transcript
    .slice(-EVO_MEMORY_TRANSCRIPT_MESSAGES)
    .map(
      (m) =>
        `${m.role === "user" ? "User" : "Assistant"}: ${m.content
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, EVO_MEMORY_TRANSCRIPT_MESSAGE_MAX)}`,
    );

  return `Below is a conversation between a user and EVO, the digital fitness coach of the Alkemos platform.

${lines.join("\n")}

Extract 3-5 DURABLE facts about THIS user that a real personal coach would want to remember across future conversations (their goal, preferences, lifestyle, constraints — e.g. "trains at home with dumbbells only", "prefers evening workouts", "wants to lose 10kg for a wedding in June", "dislikes broccoli", "knee pain when running").

STRICT RULES:
- Third-person neutral statements about the USER only (never about the assistant).
- Durable facts ONLY — never one-off questions or small talk.
- NEVER store: medical diagnoses, medications, mental-health details, precise clinical information, phone numbers, emails, addresses, financial details, or the names of other people.
- Write each fact in the SAME language the user wrote in.
- Reply with a JSON array ONLY — no prose, no markdown fences:
  [{"fact": "...", "category": "goal|preference|lifestyle|constraint|other"}]
- If nothing durable can be extracted, reply with: []`;
}

/**
 * Cap + shape the conversation for the extraction call.
 * Takes the LAST N messages (history + current message + final reply).
 */
export function capTranscriptForExtraction(
  history: readonly { role: "user" | "assistant"; content: string }[],
  message: string,
  reply: string,
): { role: "user" | "assistant"; content: string }[] {
  return [
    ...history.slice(-(EVO_MEMORY_TRANSCRIPT_MESSAGES - 2)),
    { role: "user" as const, content: message },
    { role: "assistant" as const, content: reply },
  ];
}

/**
 * Build the «ذاكرة Evo الدائمة» system-prompt block (W3 injection).
 * Empty input → empty string (anonymous users / no facts yet — the section
 * must never appear empty in the prompt).
 */
export function formatEvoMemoryForPrompt(
  facts: readonly EvoMemoryFactDraft[],
): string {
  if (facts.length === 0) return "";
  const lines = facts
    .slice(0, EVO_MEMORY_TOP_INJECT)
    .map((f) => `- [${f.category}] ${f.fact}`);
  return `\n\nذاكرة Evo الدائمة عن المستخدم (مستخلصة من محادثات سابقة — استخدمها طبيعيًا كمدرب حقيقي يتذكر عملاءه، ولا تعرضها كقائمة):\n${lines.join("\n")}`;
}

/** Boundary helper — extraction fires when the post-increment count reaches the cadence. */
export function shouldExtractMemory(countAfterIncrement: number): boolean {
  return countAfterIncrement >= EVO_MEMORY_EXTRACT_EVERY;
}
