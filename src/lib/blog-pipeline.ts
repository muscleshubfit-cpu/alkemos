/**
 * src/lib/blog-pipeline.ts — PIPELINE V2 · PHASES 1, 2, 4 (+ image guard)
 *
 * Owner directive 2026-08-27 — article generation restructured into:
 *   P1 outline  : pick ONE topic from P0 suggestions → SEO title,
 *                 subtitle, intro/5-7 H2/conclusion outline, LSI
 *                 keywords, image plan (subject + type per image).
 *   P2 content  : full 1500–2500-word article in the SAME language,
 *                 following the outline and naturally answering the
 *                 P0 FAQs.
 *   P4 review   : proofread/flow/dedup pass, keyword-coverage check,
 *                 conservative fact-check (never invent citations),
 *                 internal+external links, closing Call-to-Action.
 *
 * All calls go through callFreeAIFallbackChain (OpenRouter + Groq only,
 * strongest free models first, automatic fall-through to the next model
 * on failure). IMAGE MODESTY GUARD is enforced here on every prompt.
 */
import { callFreeAIFallbackChain, parseJSON } from "./ai-provider";
import { type LanguageResearch } from "./blog-research";
import { getRecentPostsByLanguage, getRecentContentDigests, isDuplicateTopic } from "./blog-topics";
import { sanitizeModelSlug } from "./slug";
import {
  AR_MSA_EDITOR_LAW,
  scanLatinContamination,
  validateMsaConversion,
} from "./blog-msa";
// PHASE 171 (blog-audit proposal ب): every model-JSON parse in P1/P2/P4
// now uses the 161.5-hardened parseJSON from ai-provider (fence-strip +
// truncation repair + control-char escaping) — the legacy weak
// parseJSONLoose was deleted from blog-research.ts. Same parser as the
// coach path: one JSON-recovery law for BOTH article systems.

// ─────────────────────────────────────────────────────────────────
// OWNER HARD RULE (2026-08-27 REVISED): PEOPLE-FREE AI imagery ONLY.
// The old textual 'modesty suffix' is RETIRED — see image-safety.ts.
// ─────────────────────────────────────────────────────────────────
export const IMAGE_MODESTY_SUFFIX_RETIRED = true;
// (retired value — negation tokens like 'no nudity' POISON diffusion
// prompts and directly caused the live immodest-render incident;
// policy now centralized in src/lib/image-safety.ts)

export type ImagePlanItem = { subject: string; type: string };

export type OutlinePlan = {
  title: string;
  subtitle: string;
  metaDescription: string;
  slugBase: string;
  sections: string[]; // 5–7 H2 headings
  lsiKeywords: string[];
  imagePlan: ImagePlanItem[];
  /** PHASE 62 VARIETY: the article type/angle chosen for this run —
   *  shapes the outline + writing instructions so consecutive articles
   *  stop sharing one structural mold. */
  angle?: string;
};

export type ReviewReport = {
  changesSummary: string[];
  keywordCoverage: "good" | "partial" | "poor";
  factCheckNotes: string;
};

export type InternalLinkCandidate = { slug: string; title: string };

// PHASE 173 (owner directive — Arabic editorial law): Modern Standard
// Arabic ONLY, natural and easy for EVERY Arabic reader (Pan-Arab). The
// old rule asked for «بنبرة مصرية/خليجية ودّية» — that wording is what
// produced Egyptian-dialect articles (live evidence: legacy AR posts use
// عشان/مش/ازاي/بتاع; the AR title defect «كم ماء احتاج»). The law now
// explicitly bans local dialects, dialect-only vocabulary, literal
// translation, weak grammar/spelling, and malformed headings, without
// imposing heavy literary Arabic or fixed sentence templates (no forced
// repetition across articles — natural phrasing per context).
const LANG_RULE: Record<"en" | "ar", string> = {
  en: "Write in ENGLISH for an international fitness audience.",
  ar: "اكتب باللغة العربية الفصحى الحديثة السهلة والواضحة — عربية سليمة طبيعية يفهمها كل قارئ عربي من أي بلد (Pan-Arab Modern Standard Arabic)، بنبرة ودية عملية. ممنوع منعًا باتًا: أي لهجة محلية (مصرية أو خليجية أو غيرها)، والتعبيرات العامية التي لا يفهمها إلا أهل بلد معين (مثل: عشان، مش، ازاي، بتاع، كده، ده، دي، خلاص، حاجة بمعنى «شيء»)، والترجمة الحرفية عن الإنجليزية، والتراكيب الركيكة، وأخطاء النحو والإملاء. صُغ العناوين والأسئلة صياغة عربية سليمة طبيعية بحسب السياق (مثل: «كم من الماء أحتاج يوميًا؟» لا «كم ماء احتاج»). ليست لغة أدبية ثقيلة بل فصحى حديثة سهلة. كل المحتوى بالعربية بالكامل (بما في ذلك العناوين والروابط النصية). ممنوع أيضًا خلط كلمات إنجليزية/لاتينية سائبة داخل الجمل العربية (PHASE 176 — دليل حي: «يُ marketed»، «لا توجد evidences»، «shake مصل اللبن»): كل مصطلح يُكتب بالعربية أو يُعرَّب صوتيًا (الليوسين، الكازين، مشروب البروتين، ألكالين، الأدلة، البساطة، «مقابل» بدل vs)، والاستثناء الوحيد إشارة لاتينية بين قوسين بعد المصطلح العربي (مثل: «مصل اللبن (Whey)») أو أسماء العلامات (Alkemos).",
};

/** Compact JSON view of research fed to prompts (keeps token cost sane). */
function researchDigest(r: LanguageResearch): string {
  const kws = r.keywords.map((k) => `${k.keyword} (${k.searchVolume || "?"})`).join("; ");
  const faqs = r.faqs.map((f) => `Q: ${f.question}`).join(" | ");
  return `KEYWORDS: ${kws}\nCOMMON QUESTIONS: ${faqs}`;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 62 VARIETY — ARTICLE-TYPE ROTATION (owner: «مفروض يكون فى تنوع
// كبير وتدوير لنوع المقالات»). Path A previously forced EVERY article
// through one generic 5-7 H2 teaching skeleton + the same closing CTA.
// Each run now draws a random angle and the outline/writing/review
// prompts genuinely shape themselves around it.
// ═══════════════════════════════════════════════════════════════
type ArticleAngle = { id: string; en: string; ar: string; shapeEn: string; shapeAr: string };

export const ARTICLE_ANGLES: ArticleAngle[] = [
  {
    id: "guide",
    en: "a practical step-by-step how-to guide",
    ar: "دليل عملي خطوة بخطوة",
    shapeEn: "numbered step sections, each with concrete actions and a common-pitfall note",
    shapeAr: "أقسام خطوات مرقّمة، كل خطوة بإجراءات ملموسة وتحذير من خطأ شائع",
  },
  {
    id: "myths",
    en: "a myth-busting article (claim → what science actually says → what to do instead)",
    ar: "مقال دحض خرافات (الادعاء ← ماذا يقول العلم فعلاً ← البديل الصحيح)",
    shapeEn: "one section per myth, each opening with the popular claim then the correction",
    shapeAr: "قسم لكل خرافة، يبدأ بالادعاء الشائع ثم تصحيحه العلمي",
  },
  {
    id: "comparison",
    en: "a head-to-head comparison (X vs Y)",
    ar: "مقال مقارنة مباشرة (س مقابل ص)",
    shapeEn: "criteria-based sections (effectiveness, cost, time, who it suits) ending with a verdict",
    shapeAr: "أقسام حسب معايير (الفعالية، التكلفة، الوقت، لمن يناسب) وتنتهي بحكم نهائي",
  },
  {
    id: "mistakes",
    en: "a mistakes-and-fixes article",
    ar: "مقال أخطاء وحلولها",
    shapeEn: "numbered mistakes, each with the signs you are doing it + the exact fix",
    shapeAr: "أخطاء مرقّمة، كل خطأ بعلامات تعرفه + الحل الدقيق",
  },
  {
    id: "science",
    en: "a science deep-dive explained simply",
    ar: "تحليل علمي مبسط",
    shapeEn: "mechanism → evidence → practical application sections, jargon-free",
    shapeAr: "أقسام: الآلية ← الأدلة ← التطبيق العملي، بلغة بسيطة بلا مصطلحات معقدة",
  },
  {
    id: "checklist",
    en: "a checklist / cheat-sheet article",
    ar: "مقال قائمة مرجعية (تشيك ليست)",
    shapeEn: "short focused sections of scannable checklists the reader can apply today",
    shapeAr: "أقسام قصيرة بقوائم قابلة للتطبيق اليوم",
  },
  {
    id: "faq",
    en: "a question-driven article answering real reader questions",
    ar: "مقال أسئلة وأجوبة لأكثر ما يسأل الناس",
    shapeEn: "each H2 is a real question phrased the way people search, answered directly",
    shapeAr: "كل عنوان رئيسي سؤال حقيقي بصيغة البحث الشائع، مع إجابة مباشرة",
  },
  {
    id: "plan",
    en: "a ready-to-use plan/template article (7-day sample, prep template…)",
    ar: "مقال خطة/قالب جاهز للتطبيق (أسبوع نموذجي، قالب تحضير وجبات…)",
    shapeEn: "template sections the reader can copy, with adaptation notes for different levels",
    shapeAr: "أقسام قوالب جاهزة للنسخ مع ملاحظات تكييف لكل مستوى",
  },
  {
    id: "beginner-path",
    en: "a beginner-focused pathway article (zero to competent in X weeks)",
    ar: "مقال مسار للمبتدئين (من الصفر إلى الإتقان خلال أسابيع)",
    shapeEn: "week-by-week progression sections with milestones and self-tests",
    shapeAr: "أقسام أسبوع بأسبوع مع محطات قياس تقدم واختبارات ذاتية",
  },
  {
    id: "food-focus",
    en: "a food/kitchen-focused practical article (shopping, prep, recipes structure)",
    ar: "مقال عملي مركز على المطبخ (تسوق، تحضير، هيكل وصفات)",
    shapeEn: "kitchen-actionable sections: what to buy, how to prep, how to combine",
    shapeAr: "أقسام قابلة للتنفيذ في المطبخ: ماذا تشتري، كيف تحضّر، كيف تجمع",
  },
];

export function pickArticleAngle(): ArticleAngle {
  return ARTICLE_ANGLES[Math.floor(Math.random() * ARTICLE_ANGLES.length)];
}

// ═══════════════════════════════════════════════════════════════
// PHASE 1 — topic choice + outline
// ═══════════════════════════════════════════════════════════════

/** Model ranks the 5 researched topics; code applies a hard dup-guard. */
export async function pickTopicIndex(
  lang: "en" | "ar",
  topics: string[],
): Promise<number> {
  const recent = await getRecentPostsByLanguage(lang, 100);
  const recentLite = recent.map((p) => p.title);
  try {
    const prompt = `You are an SEO strategist. Recent published titles (avoid overlap):\n${recentLite.slice(0, 30).map((t) => `- ${t}`).join("\n")}\n\nCandidate topics:\n${topics.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\nPick the candidate with the best search potential AND lowest duplication risk. Return STRICT JSON: {"index": <1-based number>}`;
    const { text } = await callFreeAIFallbackChain(prompt, {
      tag: `blog:pick-topic-${lang}`,
      temperature: 0.4,
      maxTokens: 120,
      jsonMode: true,
      timeoutMs: 40_000,
      maxModels: 3,
    });
    const parsed = parseJSON<{ index?: number }>(text);
    const idx = parsed?.index ? Number(parsed.index) - 1 : -1;
    if (idx >= 0 && idx < topics.length) return idx;
  } catch {
    /* fall through to deterministic pick */
  }
  // Deterministic fallback: first non-duplicate suggestion (LRU-friendly).
  for (let i = 0; i < topics.length; i++) {
    if (!recent.some((p) => isDuplicateTopic(topics[i], topics[i], [p]).duplicate)) return i;
  }
  return 0;
}

export async function buildOutline(
  lang: "en" | "ar",
  topic: string,
  research: LanguageResearch,
  // PHASE 157: paired rows (sharedBrief) pre-agree ONE article angle for
  // BOTH language twins — the brief's angleId is forced here. Invalid or
  // missing ids fall back to the random rotation (legacy behavior).
  opts?: { forcedAngle?: string },
): Promise<{ outline: OutlinePlan; source: string }> {
  const forced = ARTICLE_ANGLES.find((a) => a.id === opts?.forcedAngle);
  const angle = forced ?? pickArticleAngle();
  const angleLine = lang === "ar"
    ? `نوع المقال المطلوب: ${angle.ar} — صمّم أقسام H2 بحيث تناسب هذا النوع فعلاً (${angle.shapeAr})؛ ممنوع إعادة استخدام هيكل عام موحّد لكل المقالات.`
    : `ARTICLE TYPE: ${angle.en} — shape the H2 sections to genuinely fit this type (${angle.shapeEn}); do NOT reuse a generic one-size-fits-all skeleton.`;

  // PHASE 172 (owner order — topic/structure differentiation «منع التكرار
  // على مستوى search intent / angle / H2 structure / examples»): P1 now
  // sees the recent articles' actual coverage (focus keyword + H2
  // skeleton), not just their titles. The outline must differ at the
  // structure and angle level — a new title over a recycled skeleton is
  // the failure mode this block kills. Degrades to an empty string when
  // the digest query fails (legacy title-blind behavior).
  let recentContext = "";
  try {
    const digests = await getRecentContentDigests(lang, 10);
    if (digests.length) {
      const lines = digests
        .slice(0, 10)
        .map(
          (d) =>
            `- "${d.title}"${d.focusKeyword ? ` (focus: ${d.focusKeyword})` : ""}${
              d.h2s.length ? ` — sections: ${d.h2s.slice(0, 5).join(" | ")}` : ""
            }`,
        )
        .join("\n");
      recentContext = lang === "ar"
        ? `\nآخر المقالات المنشورة في نفس اللغة (ممنوع تكرار نيتها البحثية أو زاويتها أو هيكل عناوينها أو أمثلتها الرئيسية — اجعل هيكل أقسام هذا المقال مختلفًا فعليًا:\n${lines}\n`
        : `\nRECENTLY PUBLISHED ARTICLES IN THIS LANGUAGE (do NOT repeat their search intent, angle, H2 structure, main examples, or practical recommendations — this article's section skeleton must be genuinely different):\n${lines}\n`;
    }
  } catch {
    /* differentiation context is best-effort — outline proceeds title-blind */
  }

  const titleVarietyLine = lang === "ar"
    ? `قانون تنويع العنوان: صيغة العنوان يجب أن تناسب نية البحث لا قالبًا ثابتًا — نوّع بين صيغة سؤال، أو «س مقابل ص»، أو قائمة مرقّمة، أو دحض خرافة، أو وصفًا مباشرًا. لا تجعل كل العناوين تبدأ بنفس الصيغة، ولا تفرض قالبًا واحدًا على كل المقالات.`
    : `TITLE VARIETY LAW: the headline format must fit the search intent — rotate between a question, an "X vs Y" comparison, a number-led list, a myth-busting callout, or a plain descriptive phrase. Never lock every title into one opening formula (e.g. every title starting the same way); no fixed template.`;

  const prompt = `You are an expert SEO content planner for a fitness & nutrition blog.
${LANG_RULE[lang]}

CHOSEN TOPIC: "${topic}"

${angleLine}
${titleVarietyLine}
${recentContext}
LONG-TAIL SEO LAW (owner directive 2026-09-01): the title, at least TWO H2
headings, and at least 5 of the LSI keywords must mirror REAL long-tail
search phrasing — the exact question-style / how-to / "best X for Y" phrasings
people type into Google and AI assistants (e.g. "how many calories to eat to
lose weight" beats "calories"). Broad head-term titles are a FAILURE.
LONG-TAIL NATURALNESS (Phase 172): keywords guide the phrasing, they must NEVER
deform the language — H2s are written for human readers first.

${researchDigest(research)}

Create the detailed article blueprint. Return STRICT JSON only:
{
  "title": "SEO headline 50-65 chars containing the LONG-TAIL keyword naturally, phrased like a real search query",
  "subtitle": "one engaging supporting line",
  "metaDescription": "140-155 chars including the long-tail keyword",
  "slugBase": "short-url-slug-in-lowercase-english-even-for-arabic",
  "sections": ["H2 heading 1", "..."],            // exactly 5-7 H2s shaped for the article type above; at least TWO phrased as real long-tail search questions; NOT copying the section skeletons of the recent articles above
  "lsiKeywords": ["...", "..."],                   // 8-12 sub-keywords to weave in naturally; at least 5 must be 3+ word long-tail phrases
  "imagePlan": [ {"subject": "exact visual subject", "type": "photo|infographic|diagram"} ] // 3-5 items matching the sections. IMAGE LAW: subjects MUST be ENGLISH physical OBJECTS or SCENES ONLY (equipment, food, interiors) — NEVER any person, body part, people word, or clothing wording. PHASE 173 OWNER LAW (absolute): NEVER any woman, girl, or female subject in any image — if a person is ever needed, adult MEN only; otherwise use non-human subjects (equipment, food, anatomy diagrams, empty gym scenes)
}`;
  const { text, model, provider } = await callFreeAIFallbackChain(prompt, {
    tag: `blog:outline-${lang}`,
    temperature: 0.6,
    // 2026-08-27 hardening: Groq's strict json mode HARD-FAILS when a
    // reasoning model (gpt-oss) burns completion tokens on hidden CoT
    // before finishing the document ("max completion tokens reached").
    // We have our own tolerant extractor (161.5-hardened parseJSON) — drop
    // response_format so partial/fenced JSON can still be salvaged.
    // PHASE 171 (2026-09-10, blog-audit proposal ب): 2_600 → 4_000.
    // Live evidence: 3 failed EN runs «P1 en: invalid outline JSON from
    // openrouter:nvidia/nemotron-3-ultra-550b-a55b:free» (09-06/07/09) —
    // a verbose reasoning model burning hidden CoT against a 2_600 cap
    // truncates the outline JSON mid-document. Headroom now matches the
    // doc's real size (~700 JSON tokens) + reasoning-model CoT, and the
    // hardened parser salvages any residual truncation that still slips
    // through.
    maxTokens: 4_000,
    jsonMode: false,
    timeoutMs: 70_000,
    maxModels: 2,
  });
  const parsed = parseJSON<{
    title?: string;
    subtitle?: string;
    metaDescription?: string;
    slugBase?: string;
    sections?: unknown[];
    imagePlan?: unknown[];
    lsiKeywords?: unknown[];
  }>(text);
  if (!parsed?.title || !Array.isArray(parsed.sections)) {
    throw new Error(`P1 ${lang}: invalid outline JSON from ${provider}:${model}`);
  }
  const imagePlan: ImagePlanItem[] = Array.isArray(parsed.imagePlan)
    ? parsed.imagePlan
        .map((i) => {
          // Per-item loose view — model JSON fields are defensively coerced below.
          const r = (typeof i === "object" && i !== null ? i : {}) as Record<string, unknown>;
          return { subject: String(r.subject ?? "").trim(), type: String(r.type ?? "photo").trim() };
        })
        .filter((i: ImagePlanItem) => i.subject.length > 2)
        .slice(0, 5)
    : [];
  // PHASE 172.1 (live run 34503876025 forensics — AR outline landed with
  // imagePlan:0): a plan-less outline was ACCEPTED here and the failure
  // only surfaced at P3 («image plan missing») AFTER the full P2 article
  // had been written — burning the whole run and the day's slot. Fail
  // FAST at P1 instead: the runner's existing ×3 retry re-runs the
  // outline (fresh model draw) and the plan comes back populated.
  if (imagePlan.length === 0) {
    throw new Error(
      `P1 ${lang}: outline missing image plan (model dropped the field) from ${provider}:${model} — retrying draws a fresh outline`,
    );
  }
  const lsi: string[] = Array.isArray(parsed.lsiKeywords)
    ? parsed.lsiKeywords.filter((k: unknown): k is string => typeof k === "string").slice(0, 12)
    : [];

  console.log(`[blog-pipeline] P1 ${lang} done (${provider}:${model}, angle: ${angle.id})`);
  return {
    outline: {
      title: String(parsed.title),
      subtitle: String(parsed.subtitle ?? ""),
      metaDescription: String(parsed.metaDescription ?? "").slice(0, 160),
      // ONE-SLUG-LAW (2026-08-28j): was a local 60-char inline sanitize —
      // now the same latin law as the coach generator (≤80, min 3 → "").
      slugBase: sanitizeModelSlug(String(parsed.slugBase ?? topic)),
      sections: parsed.sections.filter((s: unknown): s is string => typeof s === "string").slice(0, 8),
      lsiKeywords: lsi,
      imagePlan,
      angle: angle.id,
    },
    source: `${provider}:${model}`,
  };
}

// ═══════════════════════════════════════════════════════════════
// PHASE 2 — full content generation (1500–2500 words)
// ═══════════════════════════════════════════════════════════════

/**
 * PHASE 172 (owner order — regeneration anti-repetition «إعادة توليد
 * المقال نفسه لا تنتج نسخة شبه مطابقة»): a per-run VARIATION SEED is
 * injected into the writing prompt. Same topic + same outline re-run
 * still draws a different example-emphasis and framing, so a regenerated
 * article genuinely changes content (search intent + facts preserved).
 */
const VARIATION_SEEDS: Record<"en" | "ar", string[]> = {
  en: [
    "EXAMPLE EMPHASIS: ground your advice in gym/equipment-based scenarios (barbells, machines, commercial-gym logistics).",
    "EXAMPLE EMPHASIS: ground your advice in home/minimal-equipment scenarios (bodyweight, dumbbells, small spaces).",
    "EXAMPLE EMPHASIS: lead sections with concrete numbers and quick math the reader can reproduce today (portions, grams, minutes).",
    "EXAMPLE EMPHASIS: lead sections with food-first practicality (meals, groceries, kitchen logistics, budget options).",
    "EXAMPLE EMPHASIS: frame sections around decision points the reader faces (choosing, adjusting, troubleshooting plateaus).",
  ],
  ar: [
    "تركيز الأمثلة: سيناريوهات الجيم والمعدات (بار، أجهزة، إدارة وقت النادي).",
    "تركيز الأمثلة: سيناريوهات المنزل والمعدات البسيطة (وزن الجسم، دمبل، مساحات صغيرة).",
    "تركيز الأمثلة: أرقام وحسابات عملية يقدر القارئ تطبيقها اليوم (كميات، جرامات، دقائق).",
    "تركيز الأمثلة: طعام أولًا (وجبات، مشتريات، تنظيم المطبخ، خيارات اقتصادية).",
    "تركيز الأمثلة: بناء الأقسام حول قرارات حقيقية يواجهها القارئ (الاختيار، التعديل، حل الثبات).",
  ],
};

const FAQ_SECTION_HEADING: Record<"en" | "ar", string> = {
  en: "## Frequently Asked Questions",
  ar: "## الأسئلة الشائعة",
};

export async function generateFullArticle(
  lang: "en" | "ar",
  outline: OutlinePlan,
  research: LanguageResearch,
): Promise<{ markdown: string; wordCount: number; source: string }> {
  // PHASE 176 (owner report «التعديلات الجديدة اختفت مرة أخرى» — live
  // evidence: the 09-11 protein-timing article force-fitted CREATINE and
  // INTERMITTENT-FASTING questions because the prompt dumped ALL ten
  // niche-generic P0 FAQs into instruction 4 and a weak P2 model answered
  // every one of them as body sections + FAQ cards): only research
  // questions that share vocabulary with THIS article's title ride into
  // the writing prompt at all (the same relevance matcher the
  // ensureFaqSection append path already used — one shared law).
  const relevantResearchFaqs = relevantResearchFaqsForTitle(research.faqs, outline.title);
  const faqBlock = relevantResearchFaqs
    .map((f) => `- ${f.question}`)
    .join("\n");

  // PHASE 62 VARIETY: honor the angle chosen in P1 (flows through the
  // queue bundle). Unknown/legacy outlines fall back to a random angle.
  const angle = ARTICLE_ANGLES.find((a) => a.id === outline.angle) ?? pickArticleAngle();
  const angleLine = lang === "ar"
    ? `اكتب المقال كـ${angle.ar}: ${angle.shapeAr}.`
    : `Write this as ${angle.en}: ${angle.shapeEn}.`;

  // PHASE 172: per-run variation seed (regeneration changes content).
  const variationSeed =
    VARIATION_SEEDS[lang][Math.floor(Math.random() * VARIATION_SEEDS[lang].length)];

  const answerFirstLine = lang === "ar"
    ? `الإجابة أولًا (قانون إلزامي): الفقرة الأولى أو الثانية يجب أن تجيب مباشرة عن نية البحث الأساسية التي يطرحها العنوان — إجابة محددة عملية قابلة للاقتباس (٢-٤ جمل)، ثم يتوسع المقال في التفاصيل. ممنوع: مقدمات عامة، أو حشو، أو إعادة صياغة العنوان، أو مشهد تمهيدي طويل قبل الإجابة.`
    : `ANSWER-FIRST (mandatory): the first or second paragraph must DIRECTLY answer the core search intent behind the title — a specific, quotable, practical answer (2-4 sentences) — before the article expands into detail. FORBIDDEN: generic scene-setting intros, filler, restating the title, or a long warm-up story before the answer.`;

  const eeatLine = lang === "ar"
    ? `خبرة بلا اختلاق (E-E-A-T): يُسمح بمنظور تدريبي عملي واستنتاجات خبير، لكن ممنوع منعًا باتًّا اختلاق قصص عملاء أو نتائجهم أو شهادات أو تجارب شخصية أو مؤهلات أو تجارب تدريبية لم تحدث. لا تكرر اسم الكابتن أحمد زكي داخل النص كحشو لإظهار السلطة — الإسناد موجود في توقيع المقال نفسه.`
    : `E-E-A-T WITHOUT FABRICATION: expert reasoning and a practical coaching perspective are welcome; FABRICATING client stories, client results, testimonials, personal experiences, coaching cases, credentials, or experiments is strictly FORBIDDEN. Do not repeat the coach's name inside the body as an authority filler — attribution lives in the byline, not the prose.`;

  const factLine = lang === "ar"
    ? `حراسة الحقائق (صحة/مكملات/تدريب): قدّم التوقيتات والجرعات والأرقام والنتائج كتوصيات شائعة تعتمد على السياق الفردي (نطاقات، «يختلف حسب...»)، لا كقواعد مطلقة. ممنوع اختلاق دراسات أو باحثين أو عناوين أوراق أو روابط أو إحصاءات أو ادعاءات سريرية. عند الاستشهاد بالأدلة: صياغة عامة فقط مثل «تشير الأدلة إلى...» دون تسمية مصادر محددة داخل المتن.`
    : `FACT GUARD (health/supplements/training/recovery/weight-loss/muscle-gain): present timing, dosage, numbers, and outcomes as commonly recommended ranges that depend on individual context — never as absolute rules. FABRICATING studies, authors, paper titles, URLs, statistics, or clinical claims is strictly FORBIDDEN. Reference evidence generically ("research suggests...", "evidence supports...") without naming specific sources inside the body.`;

  const faqSectionLine = lang === "ar"
    ? `قسم الأسئلة الشائعة (إلزامي في نهاية المقال): ٤-٧ أسئلة تخدم نية البحث الفعلية لهذا المقال تحديدًا — أسئلة يسألها باحث حقيقي عن هذا الموضوع، لا أسئلة عامة عن اللياقة. ممنوع إضافة أسئلة جانبية عن مواضيع لا يحتاجها المقال. الصيغة الحرفية: عنوان القسم «## الأسئلة الشائعة» ثم لكل سؤال سطر «**السؤال؟»» يليه فقرة الإجابة (إجابة نصية مباشرة بلا روابط وبلا جداول).`
    : `FAQ SECTION (mandatory, at the END of the article): 4-7 questions serving THIS article's actual search intent — questions a real searcher of THIS topic would ask, not generic fitness questions. Do NOT pad with side questions the article doesn't need. EXACT format: the heading "## Frequently Asked Questions", then for each question one line "**The question?**" followed by a plain-text answer paragraph (no links, no tables inside answers).`;

  const qualityLine = lang === "ar"
    ? `العمق لا الطول: لا حشو لبلوغ عدد كلمات، لا تكرار النصيحة نفسها في أكثر من قسم، لا فقرات تحفيزية عامة، لا حشو كلمات مفتاحية يفسد اللغة — إن كانت المعلومة بسيطة أجب عنها ببساطة. استخدم الكلمة المفتاحية بصيغتها الحرفية فقط إذا بقيت الجملة طبيعية، وإلا فصياغة طبيعية قريبة منها. العربيّة يجب أن تكون عربية طبيعية مستقلة تحريريًا (جمهور عربي، أمثلة تناسب الثقافة) — ليست ترجمة حرفية عن مقال إنجليزي.`
    : `DEPTH OVER LENGTH: no filler to hit a word count, no repeating the same advice in multiple sections, no generic motivational paragraphs, no keyword stuffing that deforms the language — if a point is simple, state it simply. Use a keyword verbatim ONLY when the sentence stays natural; otherwise rephrase naturally and closely. Write clean, quotable, information-dense prose (direct answers, clear definitions, concise factual statements, useful bullet lists, tables or clear comparisons only when they genuinely help).`;

  const prompt = `You are an elite fitness/nutrition copywriter. Write the FULL article.
${LANG_RULE[lang]}

TITLE: ${outline.title}
SUBTITLE: ${outline.subtitle}
MAIN KEYWORDS TO COVER NATURALLY: ${research.keywords.slice(0, 6).map((k) => k.keyword).join("; ")}
LSI KEYWORDS: ${outline.lsiKeywords.join("; ")}

LONG-TAIL RULE: the keywords above are LONG-TAIL search phrases — include
them VERBATIM (or a natural near-verbatim phrasing) inside H2 headings and
paragraph text ONLY where it reads naturally. These phrasings are what the
article must rank for; natural language quality always wins over verbatim
placement.

${answerFirstLine}
${angleLine}
${variationSeed}
${eeatLine}
${factLine}
${qualityLine}
${faqSectionLine}

EXACT OUTLINE — follow it section by section:
- Introduction (ANSWER-FIRST: the direct answer, then what the reader will learn)
${outline.sections.map((s) => `- H2: ${s}`).join("\n")}
- Conclusion
- ${FAQ_SECTION_HEADING[lang]} (the article-specific FAQ section described above)

REQUIREMENTS:
1. Length: 1500-2500 words TOTAL (do NOT stop before 1500; do NOT pad past usefulness).
2. Use "## " for each H2 exactly as outlined (keep the wording), short paragraphs (2-4 sentences), bullet lists where useful.
3. Weave keywords + LSI terms NATURALLY (never at the cost of readability).
4. Where a researched question fits the article's intent, answer it inside the relevant section:
${faqBlock}
5. Evidence-aligned practical advice; generic evidence phrasing only — do NOT invent paper names, authors, URLs, or statistics.
6. No title repetition at the top — start directly with the ANSWER-FIRST introduction paragraph.

Return STRICT JSON only:
{ "articleMd": "the full article in markdown (## headings, no # H1)" }`;

  const { text, model, provider } = await callFreeAIFallbackChain(prompt, {
    tag: `blog:content-${lang}`,
    temperature: 0.7,
    // GROQ FREE FIT (2026-08-27, hard data from dispatch logs): Groq enforces
    // an 8000 TPM ceiling and COUNTS max_tokens in it — a 16000-cap request
    // returns 413 'Requested 16664' every time. A 1500-2500 word article is
    // only ~3000 output tokens, so 6400 keeps us under the ceiling while
    // leaving headroom. Nightly upstream outages (entire Google gemma pool
    // 429 for hours) leave nemotron as sole carrier some windows — give it
    // a REAL long window: eff min(150s, 360s/2=180s) = 150s ×2 models.
    maxTokens: 6_400,
    jsonMode: false, // tolerant extraction instead of strict-mode hard fails
    timeoutMs: 150_000,
    maxModels: 2,
  });
  const parsed = parseJSON<{ articleMd?: string; article?: string }>(text);
  const md = (parsed?.articleMd || parsed?.article || "").trim();
  const wc = countWords(md);
  if (!md || wc < 400) {
    throw new Error(`P2 ${lang}: empty/too-short article from ${provider}:${model}`);
  }
  console.log(`[blog-pipeline] P2 ${lang} done (${provider}:${model}, ~${wc} words)`);
  return { markdown: md, wordCount: wc, source: `${provider}:${model}` };
}

export function countWords(md: string): number {
  return md.split(/\s+/).filter(Boolean).length;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 4 — quality review & enhancement
// ═══════════════════════════════════════════════════════════════

/**
 * Deterministic safety net: if the enhanced draft is still missing an FAQ
 * section, append one built from Phase 0 research (real answers, no
 * hallucination). Used by the p4 route after the model pass.
 *
 * PHASE 172 (owner order — «أصلح مشكلة FAQ filler»): the append is now
 * RELEVANCE-FILTERED and CAPPED. P0 FAQs are niche-generic by design, so
 * blindly appending all of them produced the live filler evidence (a
 * creatine article carrying 9 off-topic FAQ cards, rendered twice). Only
 * questions sharing meaningful vocabulary with the article's title/focus
 * keyword are appended (≤6). Zero relevant questions → nothing appended —
 * an absent FAQ is CORRECT when the research set doesn't serve the
 * article's intent (no forced FAQ).
 *
 * Interrogatives/auxiliaries that match ANY fitness topic are stop-words
 * here, so "How often should I deload?" never counts as related to a
 * creatine-loading article merely via the word "how".
 */
const FAQ_RELEVANCE_STOPWORDS = new Set([
  // EN
  "how", "what", "when", "where", "which", "why", "who", "the", "for", "with",
  "and", "you", "your", "are", "can", "could", "does", "did", "should", "would",
  "will", "need", "needs", "many", "much", "take", "per", "day", "days", "week",
  "weeks", "all", "any", "from", "that", "this", "into", "only", "also", "get",
  "gets", "have", "has", "had", "help", "helps", "about", "best", "top", "good",
  "bad", "than", "then", "there", "their", "them", "its", "work", "works",
  // AR
  "كيف", "كم", "ما", "ماذا", "متى", "أين", "هل", "في", "على", "من", "الى",
  "إلى", "عن", "مع", "هذا", "هذه", "ذلك", "تلك", "التي", "الذي", "كل", "بعض",
  "يجب", "يمكن", "احتاج", "أحتاج", "تحتاج", "افضل", "أفضل", "متى", "لماذا",
]);

function faqRelevanceWords(s: string): Set<string> {
  // PHASE 176 — Arabic definite-article/prefix normalization: exact-token
  // matching missed real overlaps («بروتين» never matched «البروتين»,
  // «عضلي» never matched «عضلات»-bearing titles' «العضلي»). Stripping the
  // leading article (ال/وال/بال/لل…) lets the FAQ relevance filter
  // recognize the SAME concept word in either form.
  const stripArabicPrefix = (w: string) => w.replace(/^(?:وال|بال|فال|كال|لل|ال)/, "");
  return new Set(
    s
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .map((w) => (w.length > 2 && /[\u0600-\u06FF]/.test(w) ? stripArabicPrefix(w) : w))
      .filter((w) => w.length > 2 && !FAQ_RELEVANCE_STOPWORDS.has(w)),
  );
}

/** Shared relevance matcher (the ensureFaqSection append path AND the
 * PHASE 176 P2 prompt-injection + P5 lift filters ride this one law):
 * research FAQs are relevant to a title when they share at least one
 * meaningful vocabulary word. */
function relevantResearchFaqsForTitle(
  faqs: { question: string; answer: string }[],
  titleHint: string,
): { question: string; answer: string }[] {
  const hintWords = faqRelevanceWords(titleHint);
  if (hintWords.size < 2) return faqs;
  return faqs.filter((f) => {
    const words = faqRelevanceWords(`${f.question} ${f.answer}`);
    return [...words].some((w) => hintWords.has(w));
  });
}

/**
 * PHASE 176 — deterministic FAQ relevance filter for the P5 lift (and
 * the research0 fallback faq_json). Live evidence: the 09-11
 * protein-timing article lifted SIX questions of which creatine-forms,
 * intermittent-fasting, and basal-metabolism questions were off-topic
 * for a protein-TIMING article — P4's model-ignored instruction alone
 * could not stop them. A question survives only when it shares ≥2
 * meaningful (prefix-normalized) words with the article's title+focus
 * hint. Degradation: an unusable hint (<2 words) keeps everything
 * (never false-drop on a broken hint). This FILTERS; it never adds.
 */
export function filterFaqsByRelevance<T extends { question: string; answer: string }>(
  faqs: T[],
  hint: string,
): T[] {
  const hintWords = faqRelevanceWords(hint);
  if (hintWords.size < 2) return faqs;
  return faqs.filter((f) => {
    const words = faqRelevanceWords(`${f.question} ${f.answer}`);
    let shared = 0;
    for (const w of words) if (hintWords.has(w)) shared++;
    return shared >= 2;
  });
}

export function ensureFaqSection(
  lang: "en" | "ar",
  md: string,
  research: LanguageResearch,
  topicHint?: string,
): { md: string; appended: boolean; appendedCount: number } {
  const header = FAQ_SECTION_HEADING[lang];
  if (FAQ_HEADING_RE.test(md)) return { md, appended: false, appendedCount: 0 };
  // PHASE 176: the matcher logic moved to the shared
  // relevantResearchFaqsForTitle helper (the P2 prompt-injection filter
  // rides the exact same law — one implementation, no fork).
  const relevant = (faqRelevanceWords(topicHint ?? "").size >= 2
    ? relevantResearchFaqsForTitle(research.faqs, topicHint ?? "")
    : []
  ).slice(0, 6);
  if (relevant.length === 0) return { md, appended: false, appendedCount: 0 };
  const items = relevant.map((f) => `**${f.question}**\n\n${f.answer}`);
  return {
    md: `${md}\n\n${header}\n\n${items.join("\n\n")}`,
    appended: true,
    appendedCount: items.length,
  };
}

// ─────────────────────────────────────────────────────────────────
// FAQ MARKDOWN CONTRACT (Phase 172) — P2 writes the article-specific
// FAQ section into the markdown; P5 lifts it into blog_posts.faq_json
// (the visual FAQ cards) and removes it from the body so the section
// renders exactly ONCE (the pre-172 live pages rendered the generic
// research FAQ twice: once inside the body, once as faq_json cards).
// Heading + "**question**" + answer-paragraph is the shared contract.
// ─────────────────────────────────────────────────────────────────

/** Matches the FAQ section heading in either language (tolerant variants). */
const FAQ_HEADING_RE = /^##[ \t]+(?:frequently[ \t]+asked|faq|الأسئلة[ \t]+الشائعة)/im;

/** Strip inline markdown (bold/italic/links) so FAQ cards render plain text. */
function stripInlineMarkdown(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // [text](url) → text
    .replace(/\*\*([^*]+)\*\*/g, "$1") // **bold**
    .replace(/\*([^*]+)\*/g, "$1") // *italic*
    .trim();
}

type ParsedFaq = { question: string; answer: string };

/**
 * Split the FAQ section out of an article's markdown (pure). Returns the
 * Q/A pairs (answers plain-text, inline markdown stripped, capped at 7 —
 * owner range 4-7) and the body markdown with the FAQ section REMOVED —
 * from the heading through the next H2 (or end of document). No
 * recognizable FAQ section → unchanged body + empty list (the caller
 * falls back to the legacy faq_json source).
 */
/**
 * PHASE 176 — strip the copied «السؤال؟» / "The question?" label prefix
 * from an FAQ question (live evidence: the 09-11 protein-timing article
 * rendered every FAQ card as «السؤال؟ ما هو أفضل وقت…» because the
 * writing model read the contract's literal «**السؤال؟**» example as a
 * prefix to copy). Shared by splitFaqSection AND the legacy cleanup
 * runner's FAQ-hygiene mode (one law, no fork).
 */
export function stripFaqQuestionLabel(q: string): string {
  return q
    .trim()
    .replace(/^(?:السؤال|question|the\s+question)\s*[؟?]*\s*[:：]?\s*/i, "")
    .trim();
}

export function splitFaqSection(
  lang: "en" | "ar",
  md: string,
): { body: string; faqs: ParsedFaq[] } {
  const match = FAQ_HEADING_RE.exec(md);
  if (!match) return { body: md, faqs: [] };
  const start = match.index;
  const afterHeading = md.indexOf("\n", match.index + match[0].length);
  const sectionStart = afterHeading === -1 ? md.length : afterHeading + 1;
  // The section ends at the next H2 heading (e.g. a post-FAQ CTA) or EOF.
  const nextH2 = /^##[ \t]+/m.exec(md.slice(sectionStart));
  const sectionEnd = nextH2 ? sectionStart + nextH2.index : md.length;
  const section = md.slice(sectionStart, sectionEnd).trim();

  // PHASE 172.1 (live-run 34500011890 forensics — faqLifted:0 on a correctly
  // formatted FAQ): the writing model (nemotron) separates "**question**"
  // from its answer with a SINGLE newline, not the blank line the contract
  // shows. Parsing is therefore LINE-based, not block-based: any bold-only
  // line (or ### subheading) inside the section opens a question; any other
  // non-empty line appends to the open answer. Tolerates blank-line AND
  // single-newline formats, and multiple Q/A pairs inside one block.
  // `**Label:**` bold lines (trailing colon) stay answer text — they are
  // emphasis, not questions.
  const faqs: ParsedFaq[] = [];
  const BOLD_Q_LINE = /^\*\*(.+?)\*\*$/;
  const H3_LINE = /^###[ \t]+(.+)$/;
  let current: ParsedFaq | null = null;
  for (const line of section.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    const boldQ = BOLD_Q_LINE.exec(t);
    const h3Q = H3_LINE.exec(t);
    const qText = boldQ?.[1] ?? h3Q?.[1];
    const isLabel = qText !== undefined && /[:：]\s*$/.test(qText.trim());
    if (qText !== undefined && !isLabel) {
      if (current && current.question && current.answer) faqs.push(current);
      current = { question: stripInlineMarkdown(qText), answer: "" };
      continue;
    }
    if (current) {
      current.answer = current.answer ? `${current.answer} ${t}` : t;
    }
  }
  if (current && current.question && current.answer) faqs.push(current);

  const cleaned = faqs.slice(0, 7).map((f) => {
    // PHASE 176 — label-prefix strip (stripFaqQuestionLabel, shared with
    // the legacy cleanup runner's FAQ-hygiene mode).
    const question = stripFaqQuestionLabel(stripInlineMarkdown(f.question));
    return {
      question: question.endsWith("?") || question.endsWith("؟")
        ? question
        : `${question}${lang === "ar" ? "؟" : "?"}`,
      answer: stripInlineMarkdown(f.answer),
    };
  });
  if (cleaned.length === 0) return { body: md, faqs: [] };

  const rest = md.slice(sectionEnd).trim();
  const body = rest
    ? `${md.slice(0, start).trimEnd()}\n\n${rest}`
    : md.slice(0, start).trim();
  return { body, faqs: cleaned };
}

export async function reviewAndEnhance(
  lang: "en" | "ar",
  draftMd: string,
  outline: OutlinePlan,
  internalCandidates: InternalLinkCandidate[],
): Promise<{
  markdown: string;
  report: ReviewReport;
  internalLinks: { slug: string; anchorText: string }[];
  externalLinks: { url: string; anchorText: string }[];
  source: string;
}> {
  // PHASE 157 ROOT FIX (the 85-dead-links root cause): the internal-link
  // candidates were ALWAYS rendered with a fixed /blog/ prefix — even for
  // AR runs — so the review model planted EN-prefixed links inside AR
  // articles (85 live 404s across 24 posts; Phase 156 sanitizes at render
  // time, this kills the problem AT THE SOURCE). The prefix is now the
  // run language's real blog mount: EN → /blog/ · AR → /ar/blog/.
  const blogPrefix = lang === "ar" ? "/ar/blog" : "/blog";
  const candidates =
    internalCandidates.length > 0
      ? internalCandidates.slice(0, 15).map((c) => `- ${blogPrefix}/${c.slug} → ${c.title}`).join("\n")
      : "(no previous posts yet)";

  // PHASE 173 (owner directive — duplicate closing CTA removal): the
  // review step used to instruct the model to append a closing CTA
  // paragraph (the PHASE 62 CTA_VARIANTS rotation, five variants per
  // language). The article page ALREADY renders the BlogMembershipCard
  // after the article (coaching membership + plans + affiliate) — the
  // in-text CTA was a duplicate CTA, so the instruction and its
  // `ctaAdded` report field are REMOVED entirely. The editor article
  // generator and every other CTA location are untouched.
  const prompt = `You are a senior editor doing FINAL QUALITY REVIEW of a fitness blog article.
${LANG_RULE[lang]}

ARTICLE TITLE: ${outline.title}
TARGET LENGTH: 1500-2500 words (expand thin sections if needed; NEVER pad with filler to reach the length — depth, not repetition).

DRAFT (markdown):
"""
${draftMd}
"""

EXISTING SITE POSTS you may internally link to (slug → title):
${candidates}

DO ALL OF THE FOLLOWING:
1. Proofread: fix grammar/spelling, improve flow, remove repetition (merge advice that appears in more than one section into its single best home; delete generic motivational filler; if a point is simple, keep it simple).
2. ANSWER-FIRST CHECK (mandatory): if the opening 1-2 paragraphs do not DIRECTLY answer the title's core question, rewrite them so they do — specific, quotable, 2-4 sentences, no scene-setting warm-up, no restating the title.
3. Keyword coverage: verify every main keyword & LSI term appears naturally at least once; add a sentence ONLY where missing, and never at the cost of natural language (fix any sentence that reads as keyword stuffing).
4. FACT GUARD (health claims): remove or soften any specific statistic, study, paper, author, URL, or clinical claim that cannot be verified — keep generic phrasing like "research suggests". Timing, dosage, and outcome claims (supplements, nutrition, training, recovery, weight loss, muscle gain) must read as commonly recommended, context-dependent ranges — never absolute rules. NEVER add new citations.
5. E-E-A-T GUARD: delete any fabricated client story, testimonial, personal experience, coaching case, credential, or claimed experiment. Keep expert reasoning and the practical coaching perspective. Do not insert the coach's name into the body.
6. FAQ SECTION: keep the "## " FAQ section — 4-7 questions serving THIS article's search intent; DELETE any off-topic or generic question the article doesn't need; answers stay plain text (no links inside FAQ answers).
7. Add EXACTLY 2-4 internal links using [anchor](${blogPrefix}/slug) format on fitting anchor text from the list above (only real slugs — copy the prefix exactly as shown).
8. FREE-TOOL LINKS (owner directive 2026-09-01): wherever the text naturally mentions calories, macros/protein targets, body fat, BMI, water intake, or meal plans, link that phrase to the matching FREE tool in [anchor](url) format — ONLY these URLs, max 3 total, each used at most once:
   - calories → [anchor](/tools/calorie-calculator)
   - macros/protein needs → [anchor](/tools/macro-calculator)
   - body fat → [anchor](/tools/body-fat-calculator)
   - BMI → [anchor](/tools/bmi-calculator)
   - water intake/hydration → [anchor](/tools/water-tracker)
   - meal plan/meal prep → [anchor](/meal-planner)
9. Add at most 2 external links ONLY to well-known authoritative domains you are certain exist (who.int, ncbi.nlm.nih.gov, pubmed.ncbi.nlm.nih.gov, ods.od.nih.gov, nccih.nih.gov, cdc.gov, mayoclinic.org, acsm.org, issn-online.org) in [anchor](https://...) format — each link must directly support the sentence it is attached to; do NOT add links for linking's sake.
10. Keep all "## " section structure (including the FAQ section); output the COMPLETE final article. Do NOT append any closing call-to-action, marketing outro, or "join Alkemos" pitch paragraph — the website already renders its CTA cards after the article; the article itself must end with its content (the conclusion/summary).

Return STRICT JSON only:
{
  "articleMd": "full final article markdown",
  "changesSummary": ["short change notes"],
  "keywordCoverage": "good|partial|poor",
  "factCheckNotes": "what was removed/softened and why",
  "internalLinks": [{"slug":"used-slug","anchorText":"anchor"}],
  "externalLinks": [{"url":"https://...","anchorText":"anchor"}]
}`;

  const { text, model, provider } = await callFreeAIFallbackChain(prompt, {
    tag: `blog:review-${lang}`,
    temperature: 0.4,
    // Review embeds the FULL draft → big payload runs openrouter-only via
    // the chain guard. DEEP LADDER FIX (2026-08-27 AR dispatch forensics):
    // with maxModels=2 the review died when BOTH leading models hiccuped
    // (ultra 150s abort + gemma upstream 429 shared pool) WITHOUT reaching
    // lightning/super which were healthy. maxModels=5 walks the full
    // openrouter ladder — the chain self-clamps eff windows so Vercel stays
    // Hobby-safe (52s) while native GHA (360s budget) gets real depth.
    maxTokens: 6_400,
    jsonMode: false,
    timeoutMs: 110_000,
    maxModels: 5,
  });
  const parsed = parseJSON<{
    articleMd?: string;
    keywordCoverage?: string;
    changesSummary?: unknown[];
    factCheckNotes?: string;
    internalLinks?: unknown[];
    externalLinks?: unknown[];
  }>(text);
  const md = (parsed?.articleMd || "").trim();
  if (!parsed || !md || countWords(md) < 400) {
    throw new Error(`P4 ${lang}: invalid review JSON from ${provider}:${model}`);
  }
  const coverage = ["good", "partial", "poor"].includes(parsed?.keywordCoverage ?? "")
    ? (parsed.keywordCoverage as ReviewReport["keywordCoverage"])
    : "partial";

  console.log(`[blog-pipeline] P4 ${lang} done (${provider}:${model})`);
  return {
    markdown: md,
    report: {
      changesSummary: Array.isArray(parsed.changesSummary)
        ? parsed.changesSummary.filter((c: unknown): c is string => typeof c === "string").slice(0, 10)
        : [],
      keywordCoverage: coverage,
      factCheckNotes: String(parsed?.factCheckNotes ?? ""),
    },
    internalLinks: Array.isArray(parsed.internalLinks)
      ? parsed.internalLinks
          .filter((l): l is { slug: string; anchorText: string } => {
            const r = (typeof l === "object" && l !== null ? l : {}) as Record<string, unknown>;
            return typeof r.slug === "string" && typeof r.anchorText === "string";
          })
          .slice(0, 5)
      : [],
    externalLinks: Array.isArray(parsed.externalLinks)
      ? parsed.externalLinks
          .filter((l): l is { url: string; anchorText: string } => {
            const r = (typeof l === "object" && l !== null ? l : {}) as Record<string, unknown>;
            return typeof r.url === "string" && /^https:\/\//.test(r.url) && typeof r.anchorText === "string";
          })
          .slice(0, 3)
      : [],
    source: `${provider}:${model}`,
  };
}

// ═══════════════════════════════════════════════════════════════
// PHASE 176 — Arabic Latin-contamination repair pass (P4 backstop).
//
// Owner report «التعديلات الجديدة اختفت مرة أخرى» — the 09-11 AR
// article shipped bare English INSIDE Arabic sentences ("يُ marketed"،
// "لا توجد evidences"، "shake مصل اللبن"، "الكرياتين alkalin").
// Prompt laws steer models; the weak free chain still drifts. This is
// the deterministic CODE side (the Phase-168 doctrine: facts belong to
// code, language belongs to the model):
//   1. scanLatinContamination (blog-msa.ts) detects the tokens
//   2. ONE targeted AI repair call replaces ONLY those tokens
//   3. validateMsaConversion re-gates the result deterministically
//      (links/images/headings/length preserved + zero dialect + zero
//      Latin) — a failing repair THROWS so the runner's ×3 retry
//      re-runs P4 with a fresh model draw
// ═══════════════════════════════════════════════════════════════

const LATIN_REPAIR_MAIN = "===CORRECTED===";
const LATIN_REPAIR_NOTES = "===NOTES===";

export async function repairArabicLatinContamination(
  markdown: string,
  offendingTokens: string[],
): Promise<string> {
  const tokens = offendingTokens.slice(0, 40);
  const prompt = `المقال التالي بالعربية يحتوي كلمات لاتينية/إنجليزية سائبة داخل جُمله العربية — قائمة المخالفات المكتشفة آليًا:
${tokens.map((t) => `- ${t}`).join("\n")}

مهمتك: أعد المقال كاملًا بعد استبدال كل كلمة من هذه القائمة (وأي كلمة لاتينية سائبة أخرى تجدها) بمقابلها العربي الطبيعي أو تعريبها الصوتي عند غياب مقابل شائع (مثل: leucine → الليوسين، casein → الكازين، shake → مشروب، marketed → يُسوَّق، evidences → أدلة، simplicity → البساطة، alkalin → ألكالين، vs → مقابل).

قواعد صارمة:
1. لا تغيّر أي شيء آخر — المعنى والأرقام والحقائق كما هي.
2. حافظ حرفيًا على كل روابط Markdown وصورها وعناوينها (#/##/###) وبنيتها — لا تحذف ولا تضف.
3. الإشارة اللاتينية بين قوسين بعد المصطلح العربي (مثل: مصل اللبن (Whey)) تبقى كما هي — لا تحذف القوسين ولا تحوّلها.
4. أصلح أي دمج فاسد بين حروف عربية ولاتينية (مثل: كريAlkaline) إلى مصطلح عربي سليم.
5. أعد المقال كاملًا من أوله إلى آخره بنفس الطول تقريبًا (±10%).

أعد النتيجة بهذا الشكل الحرفي (لا JSON ولا أسوار كود):
${LATIN_REPAIR_MAIN}
المقال النهائي كاملًا بصيغة Markdown
${LATIN_REPAIR_NOTES}
- أهم الاستبدالات (٢-٥ نقاط)

المقال الأصلي:
${markdown}`;

  const { text, model, provider } = await callFreeAIFallbackChain(prompt, {
    tag: "blog:latin-repair-ar",
    systemPrompt: AR_MSA_EDITOR_LAW,
    temperature: 0.2,
    maxTokens: 6_400,
    jsonMode: false,
    timeoutMs: 110_000,
    maxModels: 3,
  });

  // Sentinel parsing (same contract as the legacy cleanup runner).
  let body = (text || "").trim();
  const fence = body.match(/^```[a-zA-Z]*\s*\n([\s\S]*?)\n```$/);
  if (fence) body = fence[1].trim();
  const i = body.indexOf(LATIN_REPAIR_MAIN);
  if (i >= 0) {
    body = body.slice(i + LATIN_REPAIR_MAIN.length);
    const j = body.indexOf(LATIN_REPAIR_NOTES);
    if (j >= 0) body = body.slice(0, j);
  }
  body = body.trim();
  if (!body || !/[\u0600-\u06FF]/.test(body)) {
    throw new Error(`latin-repair: degenerate payload from ${provider}:${model}`);
  }

  // Deterministic gate: everything preserved + zero dialect + zero Latin.
  const check = validateMsaConversion(markdown, body, { ctaLinkTolerance: false });
  const latinAfter = scanLatinContamination(body);
  if (!check.ok || latinAfter.count > 0) {
    const violations = [
      ...check.violations,
      ...(latinAfter.count > 0
        ? [`latin contamination remains: ${latinAfter.tokens.slice(0, 10).join(", ")}`]
        : []),
    ];
    throw new Error(`latin-repair failed validation: ${violations.join(" | ")}`);
  }
  console.log(
    `[blog-pipeline] latin-repair ar done (${provider}:${model}) — ${tokens.length} token(s) arabized`,
  );
  return body;
}
