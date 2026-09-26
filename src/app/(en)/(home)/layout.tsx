import type { Metadata } from "next";
import { BannerPreloads } from "@/components/hub-head-resources";

/**
 * HOMEPAGE metadata — owner of the "/" canonical + hreflang cluster.
 *
 * FULL-SITE AUDIT FIX (2026-08-30): the homepage previously inherited
 * its alternates from the ROOT metadata (src/app/metadata.ts). That
 * root block had to be removed because it LEAKED onto every page
 * without its own metadata (see the comment there). But the homepage
 * itself is a "use client" page (OAuth toast effect), so it cannot
 * export metadata directly — this server layout in the (home) route
 * group owns it instead, same pattern as the tool pages.
 *
 * Hreflang codes are "en"/"ar" (+ x-default) — matching /ar and every
 * other per-page declaration. The old en-US/ar-EG codes from the root
 * block conflicted with them (mixed codes invalidate the cluster).
 *
 * Route group means the URL stays "/" — no redirect, no path change.
 */
export const metadata: Metadata = {
  alternates: {
    canonical: "https://alkemos.com",
    languages: {
      en: "https://alkemos.com",
      ar: "https://alkemos.com/ar",
      "x-default": "https://alkemos.com",
    },
  },
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/images/brand/hero-dark.webp"
        media="(prefers-color-scheme: light)"
        fetchPriority="high"
        imageSrcSet="/images/brand/hero-dark-640.webp 640w, /images/brand/hero-light-828.webp 828w, /images/brand/hero-light.webp 1280w"
        imageSizes="(min-width: 768px) 40vw, 100vw"
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
        href="/images/brand/logo-hero-dark.webp"
        media="(prefers-color-scheme: light)"
        imageSrcSet="/images/brand/logo-hero-dark-256.webp 256w, /images/brand/logo-hero-light-512.webp 512w, /images/brand/logo-hero-light.webp 760w"
        imageSizes="(max-width: 768px) 128px, 176px"
      />
      <link
        rel="preload"
        as="image"
        href="/images/brand/logo-hero-dark.webp"
        media="(prefers-color-scheme: dark)"
        imageSrcSet="/images/brand/logo-hero-dark-256.webp 256w, /images/brand/logo-hero-dark-512.webp 512w, /images/brand/logo-hero-dark.webp 760w"
        imageSizes="(max-width: 768px) 128px, 176px"
      />
      {children}
    </>
  );
}
