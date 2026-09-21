import type { ReactNode } from "react";
import { Resources } from "@/components/hub-head-resources";

/**
 * AR PROGRAMS SECTION LAYOUT (VERCEL-USAGE-3, 2026-09-21) — banner
 * preloads moved out of the former dynamic root layout.
 */
export default function ArProgramsLayout({ children }: { children: ReactNode }) {
  return (
    <Resources banner="programs">
      {children}
    </Resources>
  );
}
