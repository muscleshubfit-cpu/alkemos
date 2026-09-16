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
 * Open the floating EVO chat from anywhere (client-side no-op on server).
 * Works from any CTA regardless of provider depth — the widget listens
 * for this event and opens the drawer.
 */
export function openEvoFloatingChat() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVO_OPEN_CHAT_EVENT));
}
