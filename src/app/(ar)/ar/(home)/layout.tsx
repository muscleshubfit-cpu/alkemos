import type { ReactNode } from "react";
import { BannerPreloads } from "@/components/hub-head-resources";

/**
 * AR HOMEPAGE GROUP LAYOUT (VERCEL-USAGE-3, 2026-09-21) — the homepage
 * hero preloads (was isHomePage in the dynamic root layout; same four
 * links, same scheme scoping). URL stays /ar.
 */
export default function ArHomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/images/brand/hero-light.webp"
        media="(prefers-color-scheme: light)"
        fetchPriority="high"
        imageSrcSet="/images/brand/hero-light-640.webp 640w, /images/brand/hero-light-828.webp 828w, /images/brand/hero-light.webp 1280w"
        imageSizes="100vw"
      />
      <link
        rel="preload"
        as="image"
        href="/images/brand/hero-dark.webp"
        media="(prefers-color-scheme: dark)"
        fetchPriority="high"
        imageSrcSet="/images/brand/hero-dark-640.webp 640w, /images/brand/hero-dark-828.webp 828w, /images/brand/hero-dark.webp 1280w"
        imageSizes="100vw"
      />
      <link
        rel="preload"
        as="image"
        href="/images/brand/logo-hero-light.webp"
        media="(prefers-color-scheme: light)"
        imageSrcSet="/images/brand/logo-hero-light-256.webp 256w, /images/brand/logo-hero-light-512.webp 512w, /images/brand/logo-hero-light.webp 760w"
        imageSizes="(max-width: 768px) 128px, (max-width: 1024px) 208px, 256px"
      />
      <link
        rel="preload"
        as="image"
        href="/images/brand/logo-hero-dark.webp"
        media="(prefers-color-scheme: dark)"
        imageSrcSet="/images/brand/logo-hero-dark-256.webp 256w, /images/brand/logo-hero-dark-512.webp 512w, /images/brand/logo-hero-dark.webp 760w"
        imageSizes="(max-width: 768px) 128px, (max-width: 1024px) 208px, 256px"
      />
      {children}
    </>
  );
}
