import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import RootShell from "@/components/root-shell";
import { metadata, viewport } from "../metadata";

export { metadata, viewport };

/**
 * (AR) ROOT LAYOUT — VERCEL-USAGE-3 (2026-09-21).
 *
 * This group hosts the whole /ar/* subtree (its files live under
 * (ar)/ar/** so the URL prefix is unchanged). Every URL here is Arabic,
 * so <html lang="ar" dir="rtl"> is a STATIC prop — replacing the old
 * resolveLocale() headers()/cookies() reads in the former single root
 * layout that made every route render dynamically per request.
 *
 * The AR nested layout ((ar)/ar/layout.tsx) still owns the Arabic
 * metadata template exactly as before. AdSense loader: ON (the AR tree
 * is all-public content).
 */
export default function ArabicRootLayout({ children }: { children: ReactNode }) {
  return (
    <RootShell lang="ar" dir="rtl" showAds>
      {children}
    </RootShell>
  );
}
