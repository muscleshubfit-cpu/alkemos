/**
 * Defer a callback until the browser is idle (or `timeoutMs` elapses).
 *
 * Phase 182 — mirrors the Phase 180 AdSense-activator semantics for DATA
 * work: post-LCP fetches that pull the Supabase client chunk (auth session
 * resolve, blog carousels, related posts) must not compete with the
 * LCP/INP critical window on 3G/4G links.
 *
 * - requestIdleCallback carries a HARD timeout, so the callback is
 *   guaranteed to run by `timeoutMs` even on a busy main thread.
 * - Safari (no rIC) falls back to a short setTimeout.
 * - SSR-safe: no-ops on the server (callers are inside effects).
 */
export function deferIdle(fn: () => void, timeoutMs = 2500): void {
  if (typeof window === "undefined") return;
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => fn(), { timeout: timeoutMs });
    return;
  }
  setTimeout(fn, Math.min(timeoutMs, 1500));
}
