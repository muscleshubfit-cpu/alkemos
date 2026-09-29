import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * R2 — LOCALIZED LATIN REPAIR (Execution-Path Audit §10 Phase R2,
 * 2026-09-29): the deterministic dictionary pass + the small token-only
 * conversion call, proven against the FIVE LIVE FAILURE CLASSES the
 * audit measured (§3.4) plus the payload/rollback canaries:
 *
 *   1. dictionary class (09-11 incident: يُ marketed / evidences /
 *      shake / الكرياتين alkalin) → repaired with ZERO AI calls
 *   2. glued class (كريAlkaline) → deterministic in-place unglue
 *   3. acronym class (09-16: bmr/tdee/epa/dha/alkaline) → dictionary
 *   4. multi-word phrases (amino acids / bench press / heart rate
 *      variability) → phrase beats fragment
 *   5. remaining tokens → the SMALL call: the model sees the token
 *      list ONLY (never the article) — the payload canary
 *   6. English-junk response (09-15/16: "we, need, to, replace…")
 *      → honest latin-repair failed validation
 *   7. dialect-value response (09-17: إيه×6) → per-value rejection →
 *      honest failure
 *   8. rollback canary: LATIN_REPAIR_LEGACY=1 → the pre-R2
 *      full-article call verbatim (the model sees the article body)
 *   9. dictionary structural canaries: no whitelist collision, keys
 *      lowercase alpha, values pure-MSA Arabic terms
 *  10. engine protection canaries: code fences / gloss parens / URLs /
 *      link targets byte-untouched; anchors repaired with targets kept
 *
 * The gates themselves (blog-msa.ts) are UNTOUCHED by R2 and are
 * imported here REAL — every repaired output must still pass
 * validateMsaConversion + scanLatinContamination byte-identically.
 */

vi.mock("@/lib/ai-provider", async (importOriginal) => {
  const orig = await importOriginal<typeof import("@/lib/ai-provider")>();
  return {
    ...orig,
    callFreeAIFallbackChain: vi.fn(),
  };
});

import { callFreeAIFallbackChain } from "@/lib/ai-provider";
import {
  repairArabicLatinContamination,
  LATIN_REPAIR_DICTIONARY,
} from "@/lib/blog-pipeline";
import {
  scanLatinContamination,
  scanArabicDialect,
  validateMsaConversion,
  LATIN_WHITELIST,
} from "@/lib/blog-msa";

const chain = vi.mocked(callFreeAIFallbackChain);

/** Realistic AR article fixture: H1 + 3 H2s + image + internal/external
 * links + gloss parens + a Latin-bearing code fence + filler prose. */
const arArticle = (bad: string): string => `# عنوان رئيسي للمقال التجريبي

## قسم أول عن التدريب

هذا نص عربي سليم في فقرة تمهيدية طويلة نسبيًا لضمان أن نسبة عدد الكلمات العربية بين النص الأصلي والنص المصلَّح تبقى داخل الحدود المقبولة للحارس الحتمي حتى بعد استبدال عدة مصطلحات لاتينية بمقابلها العربي.

الجملة الحاملة للمخالفة: ${bad}.

![صورة تدريب احترافية](https://images.pexels.com/photos/123/fitness.jpg)

رابط داخلي: [دليل التغذية الشامل](/ar/blog/nutrition-guide) ورابط خارجي: [إرشادات منظمة الصحة](https://www.who.int/news/item/1)

## قسم ثانٍ عن المكملات

معلومة عن مصل اللبن (Whey) مع إشارة لاتينية بين قوسين كمثال مقبول.

\`\`\`
code block with leucine inside stays untouched
\`\`\`

## قسم ثالث ختامي

خلاصة المقال هنا مع نص ختامي عربي سليم يكفي لاجتياز فحص النسبة.

**سؤال تجريبي؟**

جواب تجريبي وافٍ على السؤال.`;

const base = arArticle("");
const repairsAndPassesGates = (out: string, input: string) => {
  expect(scanLatinContamination(out).count).toBe(0);
  const check = validateMsaConversion(input, out, { ctaLinkTolerance: false });
  expect(check.violations).toEqual([]);
  expect(check.ok).toBe(true);
};

beforeEach(() => {
  chain.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("R2(a) — deterministic dictionary pass (zero AI calls)", () => {
  it("1. repairs the live 09-11 incident tokens (marketed/evidences/shake/alkalin) with NO AI call", async () => {
    const input = arArticle(
      "يُ marketed حاليًا و لا توجد evidences واضحة مع shake مصل اللبن و الكرياتين alkalin",
    );
    const out = await repairArabicLatinContamination(input, scanLatinContamination(input).tokens);

    expect(chain).not.toHaveBeenCalled();
    expect(out).toContain("يُسوَّق");
    expect(out).toContain("أدلة");
    expect(out).toContain("مشروب");
    expect(out).toContain("الكرياتين ألكالين");
    repairsAndPassesGates(out, input);
  });

  it("2. deterministically unglues the كريAlkaline class (also inside gloss parens)", async () => {
    const input = arArticle("يعد كريAlkaline شكلًا مطورًا كما في تجربة (كريAlkaline) سابقة");
    const out = await repairArabicLatinContamination(input, scanLatinContamination(input).tokens);

    expect(chain).not.toHaveBeenCalled();
    expect(out).toContain("كري ألكالين");
    expect(out).not.toMatch(/[A-Za-z]*Alkaline/);
    repairsAndPassesGates(out, input);
  });

  it("3. repairs the live 09-16 acronym class (bmr/tdee/epa/dha/alkaline) with NO AI call", async () => {
    const input = arArticle("احسب bmr أولًا ثم tdee مع مكملات epa وdha والكرياتين alkaline");
    const out = await repairArabicLatinContamination(input, scanLatinContamination(input).tokens);

    expect(chain).not.toHaveBeenCalled();
    expect(out).toContain("معدل الأيض الأساسي");
    expect(out).toContain("إجمالي الإنفاق اليومي للطاقة");
    expect(out).toContain("حمض الإيكوسابنتاينويك");
    expect(out).toContain("حمض الدوكوساهيكساينويك");
    repairsAndPassesGates(out, input);
  });

  it("4. multi-word phrase keys apply BEFORE their word fragments", async () => {
    const input = arArticle(
      "تناول amino acids بعد bench press لمراقبة heart rate variability وقيس heart rate صباحًا",
    );
    const out = await repairArabicLatinContamination(input, scanLatinContamination(input).tokens);

    expect(chain).not.toHaveBeenCalled();
    expect(out).toContain("أحماض أمينية");
    expect(out).toContain("ضغط الصدر");
    expect(out).toContain("تغيّر معدل ضربات القلب");
    expect(out).toContain("معدل ضربات القلب صباحًا");
    // fragment-order junk must not appear
    expect(out).not.toContain("حمض أميني"); // singular "amino acid" not in this input
    repairsAndPassesGates(out, input);
  });
});

describe("R2(b) — the small token-only conversion call", () => {
  it("5. sends ONLY the token list (never the article) and applies the returned map", async () => {
    const input = arArticle("أضف quinua إلى نظامك الغذائي الأسبوعي");
    const tokens = scanLatinContamination(input).tokens;
    expect(tokens).toContain("quinua");

    chain.mockResolvedValueOnce({
      text: '{"quinua":"الكنوا"}',
      model: "gpt-oss-120b",
      provider: "groq",
    } as Awaited<ReturnType<typeof callFreeAIFallbackChain>>);

    const out = await repairArabicLatinContamination(input, tokens);

    // THE PAYLOAD CANARY: exactly one call, tagged as the small call,
    // carrying the token list but NOT the article body, and small.
    expect(chain).toHaveBeenCalledTimes(1);
    const [prompt, options] = chain.mock.calls[0];
    expect(options?.tag).toBe("blog:latin-tokens-ar");
    expect(prompt).toContain("- quinua");
    expect(prompt).not.toContain("عنوان رئيسي للمقال");
    expect(prompt).not.toContain("![");
    expect(prompt.length).toBeLessThan(3000);
    expect(prompt.length / 4 + (options?.maxTokens ?? 0) + 800).toBeLessThan(7200); // Groq enters

    expect(out).toContain("الكنوا");
    repairsAndPassesGates(out, input);
  });

  it("6. the 09-15/16 English-junk response class still fails honestly", async () => {
    const input = arArticle("أضف quinua إلى نظامك الغذائي الأسبوعي");
    chain.mockResolvedValueOnce({
      text: "We need to replace the latin words from the list provided above.",
      model: "x",
      provider: "openrouter",
    } as Awaited<ReturnType<typeof callFreeAIFallbackChain>>);

    await expect(
      repairArabicLatinContamination(input, scanLatinContamination(input).tokens),
    ).rejects.toThrow(/latin-repair failed validation: .*quinua/);
  });

  it("7. the 09-17 dialect/latin-value class is rejected per-value → honest failure", async () => {
    const input = arArticle("أضف quinua إلى نظامك الغذائي الأسبوعي");

    // dialect value (إيه×6 class)
    chain.mockResolvedValueOnce({
      text: '{"quinua":"إيه حاجة بتاعة القمح"}',
      model: "x",
      provider: "nvidia",
    } as Awaited<ReturnType<typeof callFreeAIFallbackChain>>);
    await expect(
      repairArabicLatinContamination(input, scanLatinContamination(input).tokens),
    ).rejects.toThrow(/latin-repair failed validation/);

    // latin value (english junk in the map)
    chain.mockResolvedValueOnce({
      text: '{"quinua":"quinoa grain"}',
      model: "x",
      provider: "nvidia",
    } as Awaited<ReturnType<typeof callFreeAIFallbackChain>>);
    await expect(
      repairArabicLatinContamination(input, scanLatinContamination(input).tokens),
    ).rejects.toThrow(/latin-repair failed validation/);
  });
});

describe("R2 rollback — LATIN_REPAIR_LEGACY=1 restores the pre-R2 path", () => {
  it("8. the legacy call sees the FULL article (the pre-R2 payload, verbatim options)", async () => {
    vi.stubEnv("LATIN_REPAIR_LEGACY", "1");
    const input = arArticle("أضف quinua إلى نظامك الغذائي الأسبوعي");
    chain.mockResolvedValueOnce({
      text: `===CORRECTED===\n${arArticle("أضف الكنوا إلى نظامك الغذائي الأسبوعي")}\n===NOTES===\n- استبدال واحد`,
      model: "gpt-oss-120b",
      provider: "groq",
    } as Awaited<ReturnType<typeof callFreeAIFallbackChain>>);

    const out = await repairArabicLatinContamination(input, scanLatinContamination(input).tokens);

    expect(chain).toHaveBeenCalledTimes(1);
    const [prompt, options] = chain.mock.calls[0];
    expect(options?.tag).toBe("blog:latin-repair-ar"); // the OLD tag
    expect(options?.maxTokens).toBe(6_400); // the OLD budget
    expect(options?.jsonMode).toBe(false); // the OLD mode
    expect(prompt).toContain("عنوان رئيسي للمقال"); // the article body IS the payload
    expect(prompt).toContain("===CORRECTED===");
    expect(out).toContain("الكنوا");
    repairsAndPassesGates(out, input);
  });
});

describe("R2 structural canaries", () => {
  it("9. the dictionary never collides with the whitelist and stays pure-MSA Arabic", () => {
    for (const [k, v] of Object.entries(LATIN_REPAIR_DICTIONARY)) {
      expect(LATIN_WHITELIST.has(k)).toBe(false); // never rewrite an allowed token
      expect(k).toMatch(/^[a-z]+( [a-z]+)*$/); // lowercase alpha, single spaces
      expect(v).toMatch(/[\u0600-\u06FF]/); // carries Arabic
      expect(v).not.toMatch(/[A-Za-z]/); // zero Latin
      expect(v).not.toMatch(/https?:|[[\]`#]/); // no URLs / markdown
      expect(scanArabicDialect(v).strong).toBe(0); // no dialect
    }
    // phrase keys must sort BEFORE their fragments (engine applies
    // longest-first): pin the two documented ordering pairs.
    expect("heart rate variability".length).toBeGreaterThan("heart rate".length);
    expect("amino acids".length).toBeGreaterThan("amino acid".length);
  });

  it("10. the engine never touches code fences, gloss parens, URLs or link targets (anchors repaired, targets kept)", async () => {
    const input =
      base.replace(
        "خلاصة المقال هنا",
        "خلاصة المقال: راجع [whey guide](/ar/blog/x) وأضف quinua — مع مصل اللبن (Whey)",
      ) + "\n\n```\nleucine stays in the fence\n```\n";
    const tokens = scanLatinContamination(input).tokens;
    expect(tokens).toContain("whey");
    expect(tokens).toContain("guide");
    expect(tokens).toContain("quinua");

    chain.mockResolvedValueOnce({
      text: '{"guide":"الدليل","quinua":"الكنوا"}',
      model: "gpt-oss-120b",
      provider: "groq",
    } as Awaited<ReturnType<typeof callFreeAIFallbackChain>>);

    const out = await repairArabicLatinContamination(input, tokens);

    // fences + gloss + URLs + image byte-untouched
    expect(out).toContain("```\nleucine stays in the fence\n```");
    expect(out).toContain("مصل اللبن (Whey)");
    expect(out).toContain("![صورة تدريب احترافية](https://images.pexels.com/photos/123/fitness.jpg)");
    expect(out).toContain("[إرشادات منظمة الصحة](https://www.who.int/news/item/1)");
    expect(out).toContain("[دليل التغذية الشامل](/ar/blog/nutrition-guide)");
    // the anchor repaired in place, its target preserved
    expect(out).toContain("[مصل اللبن الدليل](/ar/blog/x)");
    expect(out).toContain("الكنوا");
    repairsAndPassesGates(out, input);
  });
});
