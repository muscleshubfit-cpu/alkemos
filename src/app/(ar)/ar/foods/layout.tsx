import type { ReactNode } from "react";
import { Resources } from "@/components/hub-head-resources";

/**
 * AR FOODS SECTION LAYOUT (VERCEL-USAGE-3, 2026-09-21) — banner preloads
 * moved out of the former dynamic root layout (hubBannerSection chain).
 */
export default function ArFoodsLayout({ children }: { children: ReactNode }) {
  return (
    <Resources banner="foods">
      {children}
    </Resources>
  );
}
