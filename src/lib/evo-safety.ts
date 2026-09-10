/**
 * EVO Safety Shields (EVO-1 — W5.3 of docs/EVO-MASTER-PLAN.md).
 *
 * YMYL LAW (owner plan, EVO-1): Alkemos is a health/fitness platform —
 * some messages must NEVER reach an LLM. Self-harm and eating-disorder
 * signals get a STATIC, warm, professional-help redirect written by us,
 * not a generated reply. This is both an ethics requirement and a
 * hallucination firewall (the model must never "coach" a crisis).
 *
 * DESIGN LAWS:
 *  - HIGH PRECISION over recall: every pattern names the SELF (نفسي /
 *    myself / my life) or a concrete ED behavior. Gym hyperbole
 *    («التمرين ده قتلني», "this workout is killing me") must NOT fire —
 *    false positives would poison trust in a fitness product.
 *  - Deep-audit closure (2026-09-10, owner-approved suggestions): the
 *    live audit proved 5 of 8 real crisis phrasings reached the model —
 *    «مش عايز اعيش»، «زهقت من الحياة»، «I do not want to live anymore»،
 *    «I wish I was dead»، «مش عايز اكمل في الحياة». The families below
 *    now close those gaps. Precision boundary, per family: the EN
 *    not-want-to-live family REQUIRES "anymore" ("I don't want to live
 *    in Cairo" is a housing complaint, not a crisis); the AR
 *    counterparts carry the existential object explicitly («اعيش» /
 *    «من الحياة» / «في الحياة» / «حياتي») so gym talk can never match.
 *  - Pure + client-safe: no DOM, no fetch, no Node APIs — usable from
 *    the API route and unit-testable in isolation.
 *  - Arabic normalization: strip diacritics/tatweel, unify alef/yaa/taa
 *    marbouta so «أقتل نفسي» matches «اقتل نفسي».
 *  - Fasting/صيام is a LEGITIMATE fitness topic (intermittent fasting) —
 *    deliberately absent from the ED list.
 */

export type EvoCrisisKind = "self-harm" | "eating-disorder";

/** Arabic script detection — replies mirror the user's language (same-language law). */
export function isArabicText(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/** Normalize Arabic orthography + lowercase Latin for stable matching. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "") // diacritics + tatweel
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي");
}

const SELF_HARM_PATTERNS: readonly string[] = [
  // EN — self must be explicit
  "kill myself", "killing myself", "suicide", "suicidal",
  "end my life", "end it all", "hurt myself", "harm myself",
  "self-harm", "self harm", "want to die", "wanna die",
  "better off dead", "no reason to live", "cut myself",
  // EN — not-want-to-live family ("anymore" REQUIRED — precision
  // boundary in the header) + wish-to-be-dead family (audit 2026-09-10)
  "do not want to live anymore", "don't want to live anymore",
  "dont want to live anymore",
  "do not want to be here anymore", "don't want to be here anymore",
  "dont want to be here anymore",
  "wish i was dead", "wish i were dead", "wish to be dead",
  "want to be dead",
  // AR — normalized forms (أ→ا ة→ه ى→ي)
  "انتحار", "انتحر", "قتل نفسي", "اذي نفسي", "اضرار نفسي",
  "انهي حياتي", "اختم حياتي", "عايز اموت", "عاوز اموت",
  "اريد ان اموت", "نفسي في الموت", "نفسي اموت", "ودي اموت",
  "اذي جسمي عمدا",
  // AR — audit 2026-09-10 gap closure: dialect negation+live and
  // fed-up-with-LIFE families (gender + dialect morphological variants)
  "مش عايز اعيش", "مش عاوز اعيش", "مش عايزة اعيش", "مش عاوزة اعيش",
  "مش ناوي اعيش", "مش ناوية اعيش",
  "زهقت من الحياة", "زهقت من حياتي",
  "مش عايز اكمل في الحياة", "مش عاوز اكمل في الحياة",
  "مش عايز اكمل حياتي", "مش عاوز اكمل حياتي",
  "لا اريد ان اعيش",
];

const EATING_DISORDER_PATTERNS: readonly string[] = [
  // EN — concrete ED behaviors / clinical terms
  "make myself throw up", "make myself puke", "make myself sick",
  "purge after eating", "purge after meals", "starve myself",
  "stop eating completely", "anorexia", "bulimia",
  "never eat again", "avoid food forever",
  // AR
  "اتقيأ بعد الاكل", "اتقي بعد الاكل", "خلي نفسي اتقي",
  "استفراغ بعد الاكل", "اجوع نفسي",
  "مش هاكل خالص تاني", "لن آكل مرة اخرة",
];

/** Classify a user message. Returns null when no crisis signal matches. */
export function detectEvoCrisis(rawMessage: string): EvoCrisisKind | null {
  const message = normalize(rawMessage);
  if (!message) return null;
  if (SELF_HARM_PATTERNS.some((p) => message.includes(normalize(p)))) {
    return "self-harm";
  }
  if (EATING_DISORDER_PATTERNS.some((p) => message.includes(normalize(p)))) {
    return "eating-disorder";
  }
  return null;
}

const SELF_HARM_REPLY_AR =
  "شوفت رسالتك، وحابب أكون صريح معاك: الموضوع ده أكبر من تمارين و أكل، ومحتاج إنسان متخصص يسمعك مش ردود آلية.\n\nلو بتفكر تأذي نفسك، اتكلم حالًا مع حد تثق بيه — حد من أهلك أو صحابك — وكمان مع مختص نفسي أو طبيب. ولو إحساس الخطر قريب أو حاد، اتصل بخدمات الطوارئ في بلدك فورًا.\n\nإنت مش لوحدك، وطلب المساعدة قوة مش ضعف. لما تكون جاهز تحكي، أهل التخصص موجودين.";

const SELF_HARM_REPLY_EN =
  "I read your message, and I want to be honest with you: this is bigger than workouts and food, and it deserves a real human specialist who can listen — not automated replies.\n\nIf you are thinking about hurting yourself, please talk to someone you trust right now — family or a close friend — and reach out to a mental-health professional or a doctor. If you feel in immediate danger, contact your local emergency services immediately.\n\nYou are not alone, and asking for help is strength, not weakness.";

const ED_REPLY_AR =
  "اللي بتحكي عنه محتاج متابعة طبية وتغذوية حقيقية، مش خطة من شات. تحطيم جسمك بالحرمان أو التقيؤ بيضر قلبك وعضلاتك وعظامك بشكل خطير.\n\nاتكلم مع طبيب أو أخصائي تغذية نفسيين يساعدوك بأسلوب آمن ومستدام. وعشان رحتك: هنا في المنصة نقدر نساعدك بخطة أكل متوازنة تحافظ على عضلاتك وصحتك — بدون حرمان أو أذى.";

const ED_REPLY_EN =
  "What you're describing needs real medical and nutrition follow-up, not a plan from a chat. Pushing your body through starvation or purging seriously harms your heart, muscles, and bones.\n\nPlease talk to a doctor or a licensed nutrition specialist who can help you safely and sustainably. And for your comfort: here on the platform we can help you with a balanced meal plan that protects your muscles and health — no starvation, no harm.";

/** Static safe reply — NEVER sent to a model. Language mirrors the message. */
export function evoCrisisReply(kind: EvoCrisisKind, arabic: boolean): string {
  if (kind === "self-harm") return arabic ? SELF_HARM_REPLY_AR : SELF_HARM_REPLY_EN;
  return arabic ? ED_REPLY_AR : ED_REPLY_EN;
}
