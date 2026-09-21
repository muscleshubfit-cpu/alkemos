import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthGate } from "../auth-gate";

/**
 * AUTHENTICATED LAYOUT — the (authed) nested group under the (app) root
 * shell (VERCEL-USAGE-3, 2026-09-21).
 *
 * Same contract as the former (app)/layout.tsx: exports `metadata` with
 * `noindex, nofollow` so Google does not index any page under this
 * layout, and renders the auth gate (client component) as the body.
 * It moved one level deeper so the group's ROOT layout could own the
 * static <html> shell (the old single dynamic root layout is gone).
 *
 * Routes covered (one metadata for all — minimal change):
 *   /dashboard, /plans, /progress, /support, /referral
 *   (the /chat page was removed — the floating widget is the only
 *    chat surface; see AGENTS.md EVO CHAT SURFACE LAW)
 *   /coach/*, /questionnaires
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthGate>{children}</AuthGate>;
}
