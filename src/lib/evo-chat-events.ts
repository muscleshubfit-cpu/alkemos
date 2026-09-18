/**
 * EVO chat surface event — PHASE 216 (P2-4, deep-audit confirmed-14).
 *
 * The open-event constant + dispatcher live in THIS tiny module (zero
 * heavy imports) because every eager CTA surface (SiteHeader,
 * AppLayout, /evo, /profile) imports `openEvoFloatingChat` — when it
 * lived in `evo-chat-context.tsx`, each import dragged the whole chat
 * state machine (useAuth + membership tier + intent classifier +
 * plan persistence + link persistence) into the CRITICAL bundle of
 * every public page (~48KB measured on `/`). The provider itself is
 * only consumed by the deferred EvoFloatingWidget, so it now mounts
 * together with the widget (post-load idle) inside EvoWidgetLazy.
 *
 * EVO CHAT SURFACE LAW (owner directive 2026-08-27) is unchanged: the
 * floating widget stays the ONLY chat surface; any CTA anywhere opens
 * it by dispatching the global event below.
 */

/** Global event that opens the floating EVO chat from ANY component. */
export const EVO_OPEN_CHAT_EVENT = "mhe:open-evo-chat";

/**
 * Global event that wipes the EVO chat surface on SIGN-OUT — m3 FIX
 * (DEEP-UX-AUDIT-2026-09-18, owner blanket authorization 2026-09-18:
 * privacy-safe default). The chat history mirror used to survive logout
 * in localStorage, so the NEXT user of a shared device read the
 * previous user's conversation. The provider listens for this event and
 * resets BOTH the localStorage mirror AND its in-memory state (an
 * in-memory-only clear would let the next state change re-persist the
 * old messages; a storage-only clear would leave the drawer showing
 * them).
 */
export const EVO_RESET_CHAT_EVENT = "mhe:reset-evo-chat";

/**
 * localStorage key of the EVO chat mirror (single source — the provider
 * and the sign-out funnel both reference THIS constant).
 */
export const EVO_CHAT_STORAGE_KEY = "mhe:evo-chat";

/**
 * Remove the EVO chat mirror from localStorage (client-side no-op on
 * server / when storage is unavailable).
 */
export function clearEvoChatStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(EVO_CHAT_STORAGE_KEY);
  } catch {
    /* storage disabled — nothing to clear */
  }
}

/**
 * Sign-out hook for the EVO chat surface (client-side no-op on server):
 * wipes the persisted mirror AND notifies a mounted provider to reset
 * its in-memory state. Called from the single signOut() funnel in
 * src/lib/data/auth.ts.
 */
export function resetEvoChatOnSignOut(): void {
  if (typeof window === "undefined") return;
  clearEvoChatStorage();
  window.dispatchEvent(new CustomEvent(EVO_RESET_CHAT_EVENT));
}

/**
 * Open the floating EVO chat from anywhere (client-side no-op on server).
 * Works from any CTA regardless of provider depth — the widget listens
 * for this event and opens the drawer.
 */
export function openEvoFloatingChat() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVO_OPEN_CHAT_EVENT));
}
