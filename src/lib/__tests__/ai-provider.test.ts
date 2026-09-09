import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  AI_PROVIDERS,
  INTERLEAVED_FAST_CHAIN,
  getEnvConfig,
  getNvidiaKey,
  getOpenRouterKeys,
  maskKey,
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
