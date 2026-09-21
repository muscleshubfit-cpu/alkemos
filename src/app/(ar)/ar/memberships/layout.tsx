import type { ReactNode } from "react";
import { Resources } from "@/components/hub-head-resources";

/**
 * AR MEMBERSHIPS SECTION LAYOUT (VERCEL-USAGE-3, 2026-09-21) — the old
 * hubBannerSection key for memberships was 'pricing' (kept identical).
 */
export default function ArMembershipsLayout({ children }: { children: ReactNode }) {
  return (
    <Resources banner="pricing">
      {children}
    </Resources>
  );
}
