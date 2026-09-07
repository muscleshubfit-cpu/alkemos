/**
 * PHASE 139 (deep speed audit, 2026-09-07) — Ad-free route law, SHARED.
 *
 * The AdSense ecosystem has two consumers that must agree on WHERE ads may
 * appear / WHERE the adsbygoogle loader may be served:
 *   1. AdSenseAd.tsx (client) — hides <ins> slots on these routes.
 *   2. src/app/layout.tsx (server) — Phase 139 route-scopes the
 *      adsbygoogle.js loader: ~220KB of third-party JS (+~510ms observed
 *      main-thread work under review) used to load on EVERY page —
 *      including /admin, /coach, /dashboard, /checkout where ads are
 *      POLICY-FORBIDDEN (no ads behind login walls) and the script was
 *      pure waste for every staff session. Now it only loads on the
 *      public content surface. The tag stays server-rendered on public
 *      pages so the AdSense site review keeps seeing the code.
 *
 * This module is a plain shared const (no "use client"/"use server") so
 * both sides import the SAME list — they can never drift.
 */

// Routes where ads should NOT be shown:
//   - Authenticated member routes (AdSense policy: no ads behind login)
//   - Admin routes
//   - Checkout + auth flows
// NOTE: "/coach" also covers "/coaching" via startsWith — pre-existing
// behavior of the AdSense slot gating (kept identical; the coaching sales
// page shows no slots either way).
export const AD_FREE_ROUTE_PREFIXES = [
  "/dashboard",
  "/admin",
  "/profile",
  "/checkout",
  "/auth",
  "/coach",
  "/plans",
  "/progress",
  "/questionnaires",
  "/referral",
  "/support",
] as const;

export function isAdFreePath(pathname: string): boolean {
  return AD_FREE_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
