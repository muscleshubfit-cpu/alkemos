import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import RootShell from "@/components/root-shell";
import { metadata, viewport } from "../metadata";

export { metadata, viewport };

/**
 * (EN) ROOT LAYOUT — VERCEL-USAGE-3 (2026-09-21).
 *
 * This group hosts the ENTIRE English surface: public content (blog,
 * exercises, foods, tools, programs, coaches, …) and the homepage.
 * Its subtree URLs are always English, so <html lang dir> needs NO
 * runtime resolution — the static props below replace the old
 * resolveLocale() headers()/cookies() reads that made every route on
 * the site render dynamically per request.
 *
 * AdSense loader: ON — the public-content law (Phase 139) is carried by
 * the group split itself: the authenticated/admin surface lives in the
 * sibling (app) group whose root layout mounts the shell with ads off.
 */
export default function EnglishRootLayout({ children }: { children: ReactNode }) {
  return (
    <RootShell lang="en" dir="ltr" showAds>
      {children}
    </RootShell>
  );
}
