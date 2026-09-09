import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  AI_PROVIDERS,
  INTERLEAVED_FAST_CHAIN,
  getEnvConfig,
  getNvidiaKey,
  getOpenRouterKeys,
  maskKey,
  parseJSON,
} from "@/lib/ai-provider";

/**
 * Phase 161 — NVIDIA NIM joins the provider key bundle (owner directive
 * 2026-09-09 «تم اضافة مفتاح NVIDIA_API_KEY لاستخدامة مع باقة مفاتيح
 * مزودى ال Ai»). These tests pin the THIRD-PROVIDER contract:
 * registry entry, chain integrity (every entry resolvable, no fabrications),
 * key reader, env fall-through, and the three-way lead rotation inputs.
 */

const ENV_KEYS = [
  "AI_PROVIDER",
  "AI_MODEL",
  "AI_BASE_URL",
  "OPENROUTER_API",
  "OPENROUTER_API_KEY",
  "GROQ_API_KEY",
  "NVIDIA_API_KEY",
] as const;

function cleanEnv() {
  for (const k of ENV_KEYS) delete process.env[k];
}

describe("Phase 161.5 — parseJSON control-character hardening (live runs 34358207261/34361832706)", () => {
  it("parses article JSON whose markdown field contains RAW newlines (the exact live failure)", () => {
    // Soft json-mode models emit literal newlines inside string values.
    const raw = '{"title": "دليل التمرين", "markdown": "## مقدمة\nالنص الأول هنا\n\n## القسم الثاني\nالمزيد من النص"}';
    const parsed = parseJSON<Record<string, unknown>>(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.title).toBe("دليل التمرين");
    expect(String(parsed?.markdown)).toContain("## القسم الثاني");
    expect(String(parsed?.markdown)).toContain("\n");
  });

  it("parses a TRUNCATED article JSON with raw newlines (string cut mid-sentence)", () => {
    const raw =
      '{"title": "Guide", "excerpt": "intro text", "markdown": "## Section\nfirst paragraph\n\n## Section Two\nthis sentence never finis';
    const parsed = parseJSON<Record<string, unknown>>(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.title).toBe("Guide");
    expect(String(parsed?.markdown)).toContain("never finis");
  });

  it("escapes tabs and other control characters inside strings", () => {
    // Real tab, real newline, real U+0001 — all raw inside string values.
    const raw = '{"a": "x\ty", "b": "line\nbreak", "c": "ctl\u0001z"}';
    const parsed = parseJSON<Record<string, unknown>>(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.a).toBe("x\ty");
    expect(parsed?.b).toBe("line\nbreak");
    expect(parsed?.c).toBe("ctl\u0001z");
  });

  it("still respects REAL escaped sequences (backslash-n stays a newline, not literal n)", () => {
    const raw = '{"text": "first\\nsecond"}';
    const parsed = parseJSON<{ text: string }>(raw);
    expect(parsed?.text).toBe("first\nsecond");
  });

  it("regression: fenced JSON, prose wrapper, and trailing commas all still parse", () => {
    expect(parseJSON('```json\n{"a": 1,}\n```')).toEqual({ a: 1 });
    expect(parseJSON('Here is your result: {"b": [1, 2]} hope it helps!')).toEqual({ b: [1, 2] });
  });

  it("regression: invalid non-JSON garbage still returns null", () => {
    expect(parseJSON("")).toBeNull();
    expect(parseJSON("no braces here at all")).toBeNull();
  });

  it("full article_generate-shaped payload with raw newlines inside markdown + faq array parses end-to-end", () => {
    const payload = [
      '{"title": "كيف أبدأ بناء العضلات؟",',
      ' "slug": "muscle-building-guide",',
      ' "markdown": "## مقدمة\n\nابدأ بالأساسيات\n\n## البرنامج\n\nالتمرين الأول",',
      ' "excerpt": "دليل عملي",',
      ' "meta_description": "دليل كامل",',
      ' "tags": ["عضلات", "تمرين"],',
      ' "faq": [{"question": "كم مرة؟", "answer": "ثلاث مرات أسبوعيًا\nبدون إفراط"}],',
      ' "language": "ar"}',
    ].join("\n");
    const parsed = parseJSON<Record<string, unknown>>(payload);
    expect(parsed).not.toBeNull();
    expect(parsed?.slug).toBe("muscle-building-guide");
    const faq = parsed?.faq as Array<{ answer: string }>;
    expect(faq[0].answer).toContain("بدون إفراط");
  });
});

describe("Phase 161 — NVIDIA NIM provider contract", () => {
  beforeEach(() => cleanEnv());
  afterEach(() => cleanEnv());

  describe("registry", () => {
    it("nvidia entry: NIM baseUrl + NVIDIA_API_KEY env + nvapi- prefix", () => {
      expect(AI_PROVIDERS.nvidia).toBeDefined();
      expect(AI_PROVIDERS.nvidia.baseUrl).toBe("https://integrate.api.nvidia.com/v1");
      expect(AI_PROVIDERS.nvidia.envKey).toBe("NVIDIA_API_KEY");
      expect(AI_PROVIDERS.nvidia.keyPrefix).toBe("nvapi-");
      expect(AI_PROVIDERS.nvidia.defaultModel).toContain("/");
      expect(AI_PROVIDERS.nvidia.docsUrl).toContain("nvidia");
    });

    it("registry has exactly the three allowed providers", () => {
      expect(Object.keys(AI_PROVIDERS).sort()).toEqual(["groq", "nvidia", "openrouter"]);
    });
  });

  describe("chain integrity (strongest + fast)", () => {
    it("NVIDIA is present in the fast chain (speed tier)", () => {
      expect(INTERLEAVED_FAST_CHAIN.some((e) => e.provider === "nvidia")).toBe(true);
    });

    it("every chain entry names a registered provider and a non-empty model", () => {
      // The strongest chain is module-private; both exported surface + the
      // registry contract are verified through INTERLEAVED_FAST_CHAIN here
      // and through the lead-rotation semantics via getEnvConfig below.
      for (const entry of INTERLEAVED_FAST_CHAIN) {
        expect(AI_PROVIDERS[entry.provider]).toBeDefined();
        expect(entry.model.length).toBeGreaterThan(0);
      }
    });

    it("fast chain has no duplicate (provider, model) pairs", () => {
      const keys = INTERLEAVED_FAST_CHAIN.map((e) => `${e.provider}/${e.model}`);
      expect(new Set(keys).size).toBe(keys.length);
    });
  });

  describe("getNvidiaKey", () => {
    it("reads NVIDIA_API_KEY", () => {
      process.env.NVIDIA_API_KEY = "nvapi-test-123";
      expect(getNvidiaKey()).toBe("nvapi-test-123");
    });

    it("empty when unset", () => {
      expect(getNvidiaKey()).toBe("");
    });
  });

  describe("getEnvConfig — three-provider fall-through", () => {
    it("AI_PROVIDER=nvidia resolves the NIM config with its default model", () => {
      process.env.AI_PROVIDER = "nvidia";
      process.env.NVIDIA_API_KEY = "nvapi-test-123";
      const cfg = getEnvConfig();
      expect(cfg?.provider).toBe("nvidia");
      expect(cfg?.baseUrl).toBe("https://integrate.api.nvidia.com/v1");
      expect(cfg?.model).toBe(AI_PROVIDERS.nvidia.defaultModel);
    });

    it("nvidia requested but key missing → falls through by priority (openrouter → groq)", () => {
      process.env.AI_PROVIDER = "nvidia";
      process.env.GROQ_API_KEY = "gsk_test";
      const cfg = getEnvConfig();
      expect(cfg?.provider).toBe("groq");
    });

    it("priority fall-through reaches nvidia when it is the ONLY configured provider", () => {
      process.env.NVIDIA_API_KEY = "nvapi-only";
      const cfg = getEnvConfig();
      expect(cfg?.provider).toBe("nvidia");
      expect(cfg?.apiKey).toBe("nvapi-only");
    });

    it("AI_MODEL env overrides the nvidia default", () => {
      process.env.AI_PROVIDER = "nvidia";
      process.env.NVIDIA_API_KEY = "nvapi-test-123";
      process.env.AI_MODEL = "deepseek-ai/deepseek-r1";
      const cfg = getEnvConfig();
      expect(cfg?.model).toBe("deepseek-ai/deepseek-r1");
    });

    it("no keys at all → null (caller throws honest error)", () => {
      expect(getEnvConfig()).toBeNull();
    });
  });

  describe("key readers stay intact (regression guard)", () => {
    it("OpenRouter dual-key pool dedupes aliases", () => {
      process.env.OPENROUTER_API = "sk-or-same";
      process.env.OPENROUTER_API_KEY = "sk-or-same";
      expect(getOpenRouterKeys()).toEqual(["sk-or-same"]);
    });

    it("maskKey shows nvapi prefix + last 4", () => {
      expect(maskKey("nvapi-abcdefgh1234")).toBe("nvap…1234");
    });
  });
});
