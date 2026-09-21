import type { ReactNode } from "react";
import { Resources } from "@/components/hub-head-resources";

/**
 * AR BLOG SECTION LAYOUT (VERCEL-USAGE-3, 2026-09-21).
 *
 * The former single dynamic root layout rendered these preconnects +
 * hub-banner preloads for /blog and /ar/blog via headers().x-pathname.
 * With the static RootShell they live here (React 19 hoists <link>
 * into <head>). URL behavior identical; every /ar/blog/* route covered.
 */
export default function ArBlogLayout({ children }: { children: ReactNode }) {
  return (
    <Resources
      hosts={["https://images.pexels.com", "https://cdn.pixabay.com", "https://images.unsplash.com"]}
      banner="blog"
    >
      {children}
    </Resources>
  );
}
