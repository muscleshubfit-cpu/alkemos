import type { ReactNode } from "react";
import { Resources } from "@/components/hub-head-resources";

/**
 * AR EXERCISES SECTION LAYOUT (VERCEL-USAGE-3, 2026-09-21) — mirrors the
 * EN (en)/exercises/layout.tsx: wger preconnect + hub-banner preloads.
 * No metadata here (AR metadata is per-page / per-section as before).
 */
export default function ArExercisesLayout({ children }: { children: ReactNode }) {
  return (
    <Resources hosts={["https://wger.de"]} banner="exercises">
      {children}
    </Resources>
  );
}
