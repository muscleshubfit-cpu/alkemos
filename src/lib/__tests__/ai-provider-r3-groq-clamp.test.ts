import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { callFreeAIFallbackChain } from "@/lib/ai-provider";

/**
 * R3 — Groq per-entry max_tokens clamp (Execution-Path Audit 2026-09-29).
 *
 * Pins the R3 contract of callFreeAIFallbackChain's Groq guard against the
 * live-measured payload classes (AR dispatch run 36582658309: content
 * ~8778t, review ~10472t, latin-tokens ~2.1k):
 *   1. P2-content-class payloads (~8.7k est) KEEP the groq entries, with
 *      their request max_tokens clamped to the remaining window
 *      (7200 − promptTokens − 800) — while non-groq entries keep the
 *      caller's maxTokens byte-identically.
 *   2. P4-review-class payloads (~10.4k est) still DROP groq (the clamp
 *      would fall below the 3800 floor) and emit the byte-identical
 *      pre-R3 log line — openrouter/nvidia-only stays the designed
 *      behavior there (audit reservation #2).
 *   3. GROQ_MAX_TOKENS_CLAMP=0 rolls the whole guard back to the pre-R3
 *      global drop for the same P2-class payload (rollback lever).
 *   4. Small payloads (latin-tokens-class) are untouched — no clamp, no
 *      drop, caller's maxTokens as-is.
 *   5. The fast chain stays exempt (never clamped, never dropped).
 *   6. The floor boundary is exact: window 3800 → kept; 3799 → dropped.
 *
 * The chain's lead rotation (chainCallSeq) is module state shared across
 * tests in this file — every assertion below is therefore ORDER-AGNOSTIC:
 * fetch succeeds/fails per PROVIDER, and groq is always within the first
 * three walked entries of any rotation of the strongest chain.
 */

const ENV_KEYS = [
  "OPENROUTER_API",
  "OPENROUTER_API_KEY",
  "GROQ_API_KEY",
  "NVIDIA_API_KEY",
  "GROQ_MAX_TOKENS_CLAMP",
] as const;

type CapturedRequest = { url: string; body: Record<string, unknown> };

function cleanEnv() {
  for (const k of ENV_KEYS) delete process.env[k];
}

/**
 * stubFetch — capture EVERY request; groq succeeds, openrouter + nvidia
 * fail with a plain 500 (non-quota → the chain falls THROUGH to the next
 * model, exercising the real walk). Which providers actually get called
 * is exactly the behavior under test.
 */
function stubFetch(captured: CapturedRequest[]) {
  const fake = vi.fn(async (url: string, init?: RequestInit) => {
    captured.push({
      url,
      body: JSON.parse(String(init?.body)) as Record<string, unknown>,
    });
    if (String(url).includes("api.groq.com")) {
      return {
        ok: true,
        json: async () => ({ choices: [{ message: { content: "PONG-R3" } }] }),
      } as unknown as Response;
    }
    return {
      ok: false,
      status: 500,
      text: async () => "stub provider failure",
    } as unknown as Response;
  });
  vi.stubGlobal("fetch", fake);
}

function groqRequests(captured: CapturedRequest[]) {
  return captured.filter((r) => r.url.includes("api.groq.com"));
}

function openrouterRequests(captured: CapturedRequest[]) {
  return captured.filter((r) => r.url.includes("openrouter.ai"));
}

const GROQ_120B = "openai/gpt-oss-120b";

describe("R3 — Groq per-entry max_tokens clamp (Execution-Path Audit 2026-09-29)", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    cleanEnv();
    process.env.OPENROUTER_API = "sk-or-key2";
    process.env.OPENROUTER_API_KEY = "sk-or-key1";
    process.env.GROQ_API_KEY = "gsk_test_key";
    process.env.NVIDIA_API_KEY = "nvapi-test_key";
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    cleanEnv();
  });

  it("P2-class payload (~8.7k est): groq entry KEPT with max_tokens clamped to the window — and non-groq entries keep the caller's 6400", async () => {
    const captured: CapturedRequest[] = [];
    stubFetch(captured);
    // promptTokens = 1500 → est = 1500 + 6400 + 800 = 8700 > 7200;
    // window = 7200 − 1500 − 800 = 4900 ≥ 3800 → clamp to 4900.
    const prompt = "a".repeat(6_000);
    const res = await callFreeAIFallbackChain(prompt, {
      tag: "test:r3-p2-class",
      maxTokens: 6_400,
      timeoutMs: 5_000,
      maxModels: 3,
    });
    expect(res.provider).toBe("groq");
    expect(res.model).toBe(GROQ_120B);

    const groq = groqRequests(captured);
    expect(groq.length).toBeGreaterThanOrEqual(1);
    for (const r of groq) expect(r.body.max_tokens).toBe(4_900);
    for (const r of openrouterRequests(captured)) expect(r.body.max_tokens).toBe(6_400);

    expect(
      logSpy.mock.calls.some((c) =>
        String(c[0]).includes("R3 clamp: groq entries kept with max_tokens 4900t (floor 3800)"),
      ),
    ).toBe(true);
    // The pre-R3 drop line must NOT fire for this class anymore.
    expect(
      logSpy.mock.calls.some((c) =>
        String(c[0]).includes("openrouter/nvidia-only for this call"),
      ),
    ).toBe(false);
  });

  it("P4-class payload (~10.4k est): groq DROPPED (clamp below the 3800 floor) — the byte-identical pre-R3 log line, and groq is never called", async () => {
    const captured: CapturedRequest[] = [];
    stubFetch(captured);
    // promptTokens = 3272 → est = 3272 + 6400 + 800 = 10472 > 7200;
    // window = 7200 − 3272 − 800 = 3128 < 3800 → dropped (live review shape).
    const prompt = "a".repeat(13_088);
    await expect(
      callFreeAIFallbackChain(prompt, {
        tag: "test:r3-p4-class",
        maxTokens: 6_400,
        timeoutMs: 5_000,
        maxModels: 4,
      }),
    ).rejects.toThrow(/All AI providers failed/);

    expect(groqRequests(captured)).toHaveLength(0);
    expect(
      logSpy.mock.calls.some((c) =>
        String(c[0]).includes(
          "payload ~10472t exceeds Groq 8k TPM window → openrouter/nvidia-only for this call",
        ),
      ),
    ).toBe(true);
    expect(
      logSpy.mock.calls.some((c) => String(c[0]).includes("R3 clamp")),
    ).toBe(false);
  });

  it("GROQ_MAX_TOKENS_CLAMP=0 → pre-R3 behavior verbatim: the P2-class payload drops groq too", async () => {
    const captured: CapturedRequest[] = [];
    stubFetch(captured);
    process.env.GROQ_MAX_TOKENS_CLAMP = "0";
    const prompt = "a".repeat(6_000);
    await expect(
      callFreeAIFallbackChain(prompt, {
        tag: "test:r3-rollback",
        maxTokens: 6_400,
        timeoutMs: 5_000,
        maxModels: 3,
      }),
    ).rejects.toThrow(/All AI providers failed/);

    expect(groqRequests(captured)).toHaveLength(0);
    expect(
      logSpy.mock.calls.some((c) =>
        String(c[0]).includes(
          "payload ~8700t exceeds Groq 8k TPM window → openrouter/nvidia-only for this call",
        ),
      ),
    ).toBe(true);
    expect(
      logSpy.mock.calls.some((c) => String(c[0]).includes("R3 clamp")),
    ).toBe(false);
  });

  it("small payload (latin-tokens-class): untouched — no clamp, no drop, caller's maxTokens as-is", async () => {
    const captured: CapturedRequest[] = [];
    stubFetch(captured);
    // promptTokens = 100 → est = 100 + 1200 + 800 = 2100 ≤ 7200 → fits.
    const prompt = "a".repeat(400);
    const res = await callFreeAIFallbackChain(prompt, {
      tag: "test:r3-small",
      maxTokens: 1_200,
      timeoutMs: 5_000,
      maxModels: 3,
    });
    expect(res.provider).toBe("groq");
    const groq = groqRequests(captured);
    expect(groq.length).toBeGreaterThanOrEqual(1);
    for (const r of groq) expect(r.body.max_tokens).toBe(1_200);
    expect(
      logSpy.mock.calls.some((c) => String(c[0]).includes("Groq 8k TPM window")),
    ).toBe(false);
  });

  it("fast chain stays exempt: a P4-class payload keeps groq unclamped (speed law — never guarded)", async () => {
    const captured: CapturedRequest[] = [];
    stubFetch(captured);
    const prompt = "a".repeat(13_088);
    const res = await callFreeAIFallbackChain(prompt, {
      tag: "test:r3-fast",
      chain: "fast",
      maxTokens: 6_400,
      timeoutMs: 5_000,
    });
    expect(res.provider).toBe("groq");
    const groq = groqRequests(captured);
    expect(groq.length).toBeGreaterThanOrEqual(1);
    for (const r of groq) expect(r.body.max_tokens).toBe(6_400);
    expect(
      logSpy.mock.calls.some((c) => String(c[0]).includes("Groq 8k TPM window")),
    ).toBe(false);
  });

  it("floor boundary is exact: window 3800 → kept (clamped to 3800); window 3799 → dropped", async () => {
    // promptTokens 2600 → window = 7200 − 2600 − 800 = 3800 → exactly the floor → KEPT.
    const kept: CapturedRequest[] = [];
    stubFetch(kept);
    const resKept = await callFreeAIFallbackChain("a".repeat(10_400), {
      tag: "test:r3-floor-kept",
      maxTokens: 6_400,
      timeoutMs: 5_000,
      maxModels: 3,
    });
    expect(resKept.provider).toBe("groq");
    for (const r of groqRequests(kept)) expect(r.body.max_tokens).toBe(3_800);
    expect(
      logSpy.mock.calls.some((c) =>
        String(c[0]).includes("R3 clamp: groq entries kept with max_tokens 3800t (floor 3800)"),
      ),
    ).toBe(true);

    // promptTokens 2601 → window 3799 < 3800 → DROPPED.
    const dropped: CapturedRequest[] = [];
    stubFetch(dropped);
    vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
      dropped.push({
        url,
        body: JSON.parse(String(init?.body)) as Record<string, unknown>,
      });
      if (String(url).includes("api.groq.com")) {
        return {
          ok: true,
          json: async () => ({ choices: [{ message: { content: "PONG-R3-BOUND" } }] }),
        } as unknown as Response;
      }
      return {
        ok: false,
        status: 500,
        text: async () => "stub provider failure",
      } as unknown as Response;
    }));
    await expect(
      callFreeAIFallbackChain("a".repeat(10_404), {
        tag: "test:r3-floor-dropped",
        maxTokens: 6_400,
        timeoutMs: 5_000,
        maxModels: 3,
      }),
    ).rejects.toThrow(/All AI providers failed/);
    expect(groqRequests(dropped)).toHaveLength(0);
  });
});
