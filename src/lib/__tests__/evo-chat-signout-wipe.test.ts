import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import {
  EVO_RESET_CHAT_EVENT,
  EVO_CHAT_STORAGE_KEY,
  clearEvoChatStorage,
  resetEvoChatOnSignOut,
} from "../evo-chat-events";

/**
 * m3 canaries (DEEP-UX-AUDIT-2026-09-18, owner blanket authorization
 * 2026-09-18 — privacy-safe default: the EVO chat mirror dies at the
 * sign-out boundary).
 *
 * The audit found the chat history localStorage mirror (`mhe:evo-chat`)
 * surviving logout — the NEXT user of a shared device read the previous
 * user's conversation. The fix has TWO halves that only work together:
 *   1. the signOut() funnel wipes the mirror + dispatches the reset event
 *   2. a mounted provider resets its in-memory state on the event (else
 *      its next save effect re-persists the old messages)
 * These tests pin both halves: the module behavior (jsdom) AND the
 * wiring (source canaries — same style as marketing-msa-surface.test.ts).
 */

describe("evo-chat-events — sign-out wipe module (m3)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("resetEvoChatOnSignOut removes the persisted mirror", () => {
    window.localStorage.setItem(
      EVO_CHAT_STORAGE_KEY,
      JSON.stringify({ messages: [{ id: "1", role: "user", content: "secret", timestamp: 1 }] }),
    );
    resetEvoChatOnSignOut();
    expect(window.localStorage.getItem(EVO_CHAT_STORAGE_KEY)).toBeNull();
  });

  it("resetEvoChatOnSignOut dispatches the reset event a provider can catch", () => {
    const onReset = vi.fn();
    window.addEventListener(EVO_RESET_CHAT_EVENT, onReset);
    resetEvoChatOnSignOut();
    window.removeEventListener(EVO_RESET_CHAT_EVENT, onReset);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("clearEvoChatStorage is a no-op when storage is empty (no throw)", () => {
    expect(() => clearEvoChatStorage()).not.toThrow();
    expect(window.localStorage.getItem(EVO_CHAT_STORAGE_KEY)).toBeNull();
  });

  it("the storage key stays the historical mirror key (no orphaned old data)", () => {
    // If this constant ever drifts, pre-fix devices keep an orphaned
    // `mhe:evo-chat` entry that NOTHING clears — the leak would return
    // for existing browsers.
    expect(EVO_CHAT_STORAGE_KEY).toBe("mhe:evo-chat");
  });
});

describe("m3 wiring canaries — the wipe is actually connected", () => {
  const stripComments = (s: string) =>
    s
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

  it("the signOut() funnel dispatches the wipe (src/lib/data/auth.ts)", () => {
    const src = stripComments(readFileSync("src/lib/data/auth.ts", "utf8"));
    expect(src).toContain("resetEvoChatOnSignOut()");
  });

  it("the provider listens for the reset event (evo-chat-context.tsx)", () => {
    const src = readFileSync("src/lib/evo-chat-context.tsx", "utf8");
    expect(src).toContain("EVO_RESET_CHAT_EVENT");
    // And it consumes the SHARED key constant, not a local string copy.
    expect(src).toContain("EVO_CHAT_STORAGE_KEY");
    expect(src).not.toContain('const STORAGE_KEY = "mhe:evo-chat"');
  });
});
