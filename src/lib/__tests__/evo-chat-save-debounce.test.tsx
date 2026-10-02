import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement, useEffect } from "react";

/**
 * PHASE 339 — W1-4b (remediation plan §6.2, audit P-02): the EVO chat
 * history localStorage mirror was written on EVERY `state.messages`
 * identity change — during SSE token streaming that is a full
 * JSON.stringify(history) + a synchronous setItem per TOKEN (dozens of
 * main-thread writes per second while the user watches the stream, up
 * to 20 messages with kilobyte schemas each).
 *
 * The P-02 fix this canary pins as CLOSED (fix direction, verbatim:
 * «debounce ذيلي ~500ms أو الحفظ عند final/idle/الإغلاق» — the debounce
 * arm, with close-flush coverage):
 *   - the save effect ARMS a coalescing trailing debounce (500ms) and
 *     never writes synchronously — the first change arms one timer,
 *     later changes only refresh the pending snapshot, and the fire
 *     writes the LATEST state (≤2 writes/sec mid-stream instead of one
 *     per token);
 *   - flush points cover hard close/backgrounding: pagehide +
 *     visibilitychange→hidden flush the pending snapshot immediately;
 *   - the m3 sign-out wipe stays AIRTIGHT under the debounce: the reset
 *     handler CANCELS the pending snapshot (drop, never flush — a
 *     flush there would re-persist the pre-signout conversation over
 *     the removed mirror, the exact m3 leak);
 *   - the 2026-08-27 hydration gate is untouched: no write before the
 *     stored history has been read.
 *
 * Two layers, like the W1-3a..e + W1-4a canaries:
 *   1. SOURCE PINS — the contracts machine-checked in the source.
 *   2. BEHAVIOR — jsdom drives the REAL provider through a FAITHFUL
 *      SSE burst (a fetch mock returning a token-stream body whose
 *      reader resolves per frame — exactly the sendMessage hot path the
 *      audit measured), with fake timers controlling the 500ms window.
 */

// The provider's auth + tier seams: anonymous free tier (the surface
// where the mirror IS the persistence — paid users ride chat_messages).
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ profile: null, loading: false }),
}));
vi.mock("@/hooks/use-membership-tier", () => ({
  useMembershipTier: () => ({ tier: "free", loading: false }),
}));

import { EvoChatProvider, useEvoChat } from "@/lib/evo-chat-context";
import {
  EVO_RESET_CHAT_EVENT,
  EVO_CHAT_STORAGE_KEY,
  resetEvoChatOnSignOut,
} from "@/lib/evo-chat-events";

const repoRoot = resolve(__dirname, "../../..");
const evoSrc = () => readFileSync(resolve(repoRoot, "src/lib/evo-chat-context.tsx"), "utf8");

/** The substring between two markers (both must exist, in order). */
function span(src: string, from: string, to: string): string {
  const i = src.indexOf(from);
  const j = src.indexOf(to);
  expect(i).toBeGreaterThan(-1);
  expect(j).toBeGreaterThan(i);
  return src.slice(i, j);
}

// ── The send seam: the probe captures the LIVE sendMessage ───────────────
// (module-scope recording bag — the react-hooks/immutability law pattern
// from the W1-4a canary: capture inside useEffect, reset in beforeEach).
const sendBag: { sendMessage: ((content: string) => Promise<void>) | null } = {
  sendMessage: null,
};
function EvoProbe() {
  const ctx = useEvoChat();
  useEffect(() => {
    sendBag.sendMessage = ctx.sendMessage;
  });
  return null;
}

// ── The SSE seam: a faithful token-stream fetch mock ─────────────────────
// The reader resolves one frame per await — the exact hot path the audit
// measured (each delta = one setState = one messages identity change).
type FakeSseResponse = {
  ok: boolean;
  status: number;
  headers: { get: (k: string) => string | null | undefined };
  body: { getReader: () => { read: () => Promise<{ done: boolean; value?: Uint8Array }> } };
};
function sseResponse(frames: string[]): FakeSseResponse {
  const enc = new TextEncoder();
  const chunks = frames.map((f) => enc.encode(f));
  let i = 0;
  return {
    ok: true,
    status: 200,
    headers: new Map([["content-type", "text/event-stream"]]),
    body: {
      getReader: () => ({
        read: async () =>
          i < chunks.length ? { done: false, value: chunks[i++] } : { done: true },
      }),
    },
  };
}

/** A burst of `deltas` token frames + one final frame (final text is
 * DELIBERATELY different from the accumulated deltas so the canary can
 * prove the debounced write carries the post-final state). */
function burstFrames(deltas: number, finalText: string): string[] {
  const frames: string[] = [];
  for (let i = 0; i < deltas; i++) {
    frames.push(`event: delta\ndata: ${JSON.stringify({ text: `قطعة-${i} ` })}\n\n`);
  }
  frames.push(`event: final\ndata: ${JSON.stringify({ response: finalText, links: [] })}\n\n`);
  return frames;
}

const SECRET = "الرسالة السرية قبل تسجيل الخروج";
const FINAL_TEXT = "النص النهائي الكامل بعد البث";

let chatFrames: string[] = [];
const fetchMock = vi.fn((input: unknown): Promise<unknown> => {
  if (typeof input === "string" && input.includes("/api/ai/chat")) {
    return Promise.resolve(sseResponse(chatFrames));
  }
  // Quota meter + anything else: honest failure (no setQuota, no throw).
  return Promise.resolve({ ok: false, status: 429 });
});

let setItemSpy: ReturnType<typeof vi.spyOn>;

/** Mirror writes captured for the EVO key only (the guest-id key that
 * ensureGuestId touches must not pollute the count). */
const evoWrites = () =>
  (setItemSpy.mock.calls as unknown as [string, string][]).filter(
    ([k]) => k === EVO_CHAT_STORAGE_KEY,
  );
const readMirror = () => window.localStorage.getItem(EVO_CHAT_STORAGE_KEY);

/** The storage mock's ORIGINAL setItem, captured at module load —
 * BEFORE any per-test spy replaces the property. Seeding the mirror
 * through this reference never counts as a provider write (the spy
 * records only what the PROVIDER writes). */
const realSetItem = window.localStorage.setItem.bind(window.localStorage);

describe("W1-4b source pins — armed debounce, flush points, airtight wipe", () => {
  it("the save effect ARMS the ~500ms window — the synchronous per-token write is extinct", () => {
    const s = evoSrc();
    expect(s).toContain("const EVO_SAVE_DEBOUNCE_MS = 500;");
    const saveEffect = span(s, "// Save to localStorage on every change", "// Flush on hard close");
    // The gate + the arm, in order, inside the one effect.
    expect(saveEffect).toContain("if (!hydrated) return;");
    expect(saveEffect).toContain("pendingSaveRef.current = state;");
    expect(saveEffect).toContain("setTimeout(() => {");
    expect(saveEffect).toContain("}, EVO_SAVE_DEBOUNCE_MS);");
    // The P-02 regression shape: a direct synchronous write inside the
    // effect fired on EVERY SSE token identity change.
    expect(saveEffect).not.toContain("saveLocalState(state)");
    // The deps law survives: the persisted fields + the gate + the
    // stable flush callback.
    expect(s).toContain(
      "[state.messages, state.dailyCount, state.dailyCountDate, hydrated, flushPendingSave]",
    );
  });

  it("the fire writes the LATEST snapshot — the ref, never a stale closure", () => {
    const s = evoSrc();
    const flush = span(s, "const flushPendingSave = useCallback", "const cancelPendingSave = useCallback");
    expect(flush).toContain("const pending = pendingSaveRef.current;");
    expect(flush).toContain("if (pending !== null) saveLocalState(pending);");
    // The timer zombie is cleared before the flush reads the ref — the
    // fire itself must never leave an armed timer behind.
    expect(s).toMatch(/saveTimerRef\.current = null;\s*\n\s*flushPendingSave\(\);/);
  });

  it("flush points: pagehide + visibilitychange→hidden (the plan's «الحفظ عند الإغلاق»)", () => {
    const s = evoSrc();
    expect(s).toContain('window.addEventListener("pagehide", onPageHide);');
    expect(s).toContain('document.addEventListener("visibilitychange", onVisibility);');
    expect(s).toContain('if (document.visibilityState === "hidden") flushPendingSave();');
  });

  it("the sign-out reset CANCELS the pending snapshot — never flushes it", () => {
    const s = evoSrc();
    const reset = span(
      s,
      "const onResetEvent = () => {",
      "window.addEventListener(EVO_RESET_CHAT_EVENT, onResetEvent);",
    );
    expect(reset).toContain("cancelPendingSave();");
    expect(reset).not.toContain("flushPendingSave(");
    // And cancel DROPS without writing — flushing there would re-persist
    // the pre-signout conversation over the removed mirror (the exact
    // m3 leak the wipe exists to kill).
    const cancel = span(s, "const cancelPendingSave = useCallback", "// Save to localStorage on every change");
    expect(cancel).not.toContain("saveLocalState");
  });

  it("the m3 wiring survives the debounce untouched (shared key, no local copy)", () => {
    const s = evoSrc();
    expect(s).toContain("EVO_RESET_CHAT_EVENT");
    expect(s).toContain("EVO_CHAT_STORAGE_KEY");
    expect(s).not.toContain('const STORAGE_KEY = "mhe:evo-chat"');
  });
});

describe("W1-4b behavior — a faithful SSE burst against the real provider", () => {
  // Every mounted provider is force-unmounted after EACH test — even
  // when the test body aborts on a failed assertion. An orphaned
  // provider keeps its window listeners (pagehide/visibilitychange/
  // reset) alive with a pending snapshot in its refs, and later
  // tests' dispatches would trigger spurious writes through it.
  const mountedViews: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    sendBag.sendMessage = null;
    chatFrames = [];
    fetchMock.mockClear();
    vi.stubGlobal("fetch", fetchMock);
    // The setup.ts storage mock is a plain object — spy on the instance
    // (calls through, so the mirror still stores real values).
    setItemSpy = vi.spyOn(window.localStorage, "setItem");
  });

  afterEach(() => {
    while (mountedViews.length) mountedViews.pop()?.unmount();
    setItemSpy.mockRestore();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  /** Mounts the real provider (anonymous free tier) and settles the
   * async hydration (the restore IIFE resolves on microtasks). The
   * seed rides the ORIGINAL setItem — seeding is fixture setup, not a
   * provider write (the spy must not count it). */
  async function mountProvider(seed?: string) {
    const rtl = await import("@testing-library/react");
    if (seed !== undefined) realSetItem(EVO_CHAT_STORAGE_KEY, seed);
    const view = rtl.render(createElement(EvoChatProvider, null, createElement(EvoProbe)));
    mountedViews.push(view);
    await rtl.act(async () => {});
    await rtl.act(async () => {});
    return { rtl, view };
  }

  /** Sends one message through the REAL sendMessage (SSE burst) and
   * settles every microtask of the reader loop. */
  async function sendBurst(rtl: typeof import("@testing-library/react"), text: string) {
    await rtl.act(async () => {
      await sendBag.sendMessage?.(text);
    });
    await rtl.act(async () => {});
  }

  /** Lets the post-hydration baseline write (the restored state) land,
   * then isolates the spy for the actual burst under test. */
  async function settleBaseline(rtl: typeof import("@testing-library/react")) {
    await rtl.act(async () => {
      vi.advanceTimersByTime(600);
    });
    setItemSpy.mockClear();
  }

  it("P-02 core: a 30-delta SSE burst produces ZERO mirror writes mid-stream", async () => {
    const { rtl, view } = await mountProvider();
    await settleBaseline(rtl);
    chatFrames = burstFrames(30, FINAL_TEXT);
    await sendBurst(rtl, SECRET);
    // The burst is fully drained (32+ identity changes under the OLD
    // synchronous effect = 32+ full-history writes). The debounced
    // mirror: not ONE write while the stream ran.
    expect(evoWrites()).toHaveLength(0);
    view.unmount();
  });

  it("coalescing convergence: exactly ONE write at the 500ms boundary, carrying the post-final state", async () => {
    const { rtl, view } = await mountProvider();
    await settleBaseline(rtl);
    chatFrames = burstFrames(30, FINAL_TEXT);
    await sendBurst(rtl, "سؤال المستخدم");
    // Not yet at the boundary:
    await rtl.act(async () => {
      vi.advanceTimersByTime(499);
    });
    expect(evoWrites()).toHaveLength(0);
    await rtl.act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(evoWrites()).toHaveLength(1);
    // And no zombie re-arm after the fire:
    await rtl.act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(evoWrites()).toHaveLength(1);
    // The written snapshot is the LATEST state: the user message + the
    // FINAL text (not any mid-stream delta accumulation) + the honest
    // daily counter.
    const payload = JSON.parse(evoWrites()[0][1]) as {
      messages: Array<{ role: string; content: string }>;
      dailyCount: number;
    };
    expect(payload.messages).toHaveLength(2);
    expect(payload.messages[0]).toMatchObject({ role: "user", content: "سؤال المستخدم" });
    expect(payload.messages[1]).toMatchObject({ role: "assistant", content: FINAL_TEXT });
    expect(payload.dailyCount).toBe(1);
    view.unmount();
  });

  it("the hydration gate holds: stored history is read BEFORE any write lands (no mount-time wipe)", async () => {
    const today = new Date().toISOString().split("T")[0];
    const seed = JSON.stringify({
      messages: [{ id: "stored-1", role: "user", content: "تاريخ محفوظ قبل التحديث", timestamp: 1 }],
      isOpen: false,
      isTyping: false,
      dailyCount: 3,
      dailyCountDate: today,
    });
    const { rtl, view } = await mountProvider(seed);
    // No write within the debounce window of the mount — the mirror
    // still holds EXACTLY the seed (a pre-read write would wipe it).
    await rtl.act(async () => {
      vi.advanceTimersByTime(499);
    });
    expect(evoWrites()).toHaveLength(0);
    expect(readMirror()).toBe(seed);
    // The restored state then lands — with the stored history intact.
    await rtl.act(async () => {
      vi.advanceTimersByTime(101);
    });
    expect(evoWrites()).toHaveLength(1);
    const payload = JSON.parse(evoWrites()[0][1]) as { messages: Array<{ content: string }> };
    expect(payload.messages[0].content).toBe("تاريخ محفوظ قبل التحديث");
    view.unmount();
  });

  it("pagehide flushes a pending snapshot immediately — and exactly once", async () => {
    const { rtl, view } = await mountProvider();
    await settleBaseline(rtl);
    chatFrames = burstFrames(5, FINAL_TEXT);
    await sendBurst(rtl, "سؤال قبل الإغلاق");
    expect(evoWrites()).toHaveLength(0); // pending, window armed
    await rtl.act(async () => {
      window.dispatchEvent(new Event("pagehide"));
    });
    expect(evoWrites()).toHaveLength(1);
    const payload = JSON.parse(evoWrites()[0][1]) as { messages: Array<{ content: string }> };
    expect(payload.messages.at(-1)?.content).toBe(FINAL_TEXT);
    // No double write after the flush (pending + timer both cleared).
    await rtl.act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(evoWrites()).toHaveLength(1);
    view.unmount();
  });

  it("visibilitychange flushes only when HIDDEN", async () => {
    const { rtl, view } = await mountProvider();
    await settleBaseline(rtl);
    chatFrames = burstFrames(5, FINAL_TEXT);
    await sendBurst(rtl, "سؤال قبل إخفاء الصفحة");
    // Visible (the default jsdom state): the flush must NOT fire.
    await rtl.act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(evoWrites()).toHaveLength(0);
    // Hidden (mobile app switch): flush now.
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    try {
      await rtl.act(async () => {
        document.dispatchEvent(new Event("visibilitychange"));
      });
    } finally {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "visible",
      });
    }
    expect(evoWrites()).toHaveLength(1);
    view.unmount();
  });

  it("the sign-out wipe stays airtight: an armed pending snapshot never reaches the mirror", async () => {
    const { rtl, view } = await mountProvider();
    await settleBaseline(rtl);
    chatFrames = burstFrames(5, FINAL_TEXT);
    await sendBurst(rtl, SECRET);
    expect(evoWrites()).toHaveLength(0); // pending armed, holding the secret
    // The REAL sign-out funnel: removeItem + reset event.
    await rtl.act(async () => {
      resetEvoChatOnSignOut();
    });
    // Airtight immediately: the funnel removed the mirror and NOTHING
    // re-wrote the pre-signout conversation over it (a flush-based
    // reset would leak the secret right here).
    expect(readMirror()).toBeNull();
    expect(evoWrites()).toHaveLength(0);
    // The empty state re-arms the debounce and lands ≤500ms later —
    // the mirror comes back EMPTY, never with the secret.
    await rtl.act(async () => {
      vi.advanceTimersByTime(700);
    });
    const writes = evoWrites();
    expect(writes).toHaveLength(1);
    const payload = JSON.parse(writes[0][1]) as { messages: unknown[]; dailyCount: number };
    expect(payload.messages).toHaveLength(0);
    expect(payload.dailyCount).toBe(0);
    // The hard invariant, stated once for the record: across the WHOLE
    // test, no mirror write ever carried the pre-signout conversation.
    expect(
      evoWrites().some(([, v]) => v.includes(SECRET)),
    ).toBe(false);
    view.unmount();
  });

  it("the raw reset event (no funnel removeItem) also never flushes the pending snapshot", async () => {
    const { rtl, view } = await mountProvider();
    await settleBaseline(rtl);
    chatFrames = burstFrames(5, FINAL_TEXT);
    await sendBurst(rtl, SECRET);
    await rtl.act(async () => {
      window.dispatchEvent(new CustomEvent(EVO_RESET_CHAT_EVENT));
    });
    // The baseline (pre-burst) mirror never carried the secret, and the
    // cancel dropped the armed one — advancing past the window writes
    // only the EMPTY state.
    await rtl.act(async () => {
      vi.advanceTimersByTime(700);
    });
    expect(readMirror() ?? "").not.toContain(SECRET);
    expect(
      evoWrites().some(([, v]) => v.includes(SECRET)),
    ).toBe(false);
    view.unmount();
  });
});
