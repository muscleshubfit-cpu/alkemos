/* eslint-disable @next/next/no-img-element -- local, fixed-dimension brand
   assets (QR-asset precedent): rendering a light+dark pair lets CSS pick the
   right one with ZERO hydration flicker (globals.css .theme-img-light/dark);
   next/image would double-preload both variants and cannot CSS-switch. */

import { cn } from "@/lib/utils";

/**
 * ThemeImg — Phase 126 «Marble & Chrome».
 * Renders the light + dark variants of a brand asset; CSS
 * ([data-theme="dark"]) shows the matching one. The dark <img> is
 * aria-hidden (the light one carries the alt text).
 *
 * Phase 136: srcSet/sizes/fetchPriority support for responsive brand
 * artwork. images.unoptimized=true (free-tier guard) means next/image
 * can't generate srcset — so the variants are prebuilt by
 * scripts/phase136_images.py and passed through here. The root layout
 * preloads mirror these srcsets exactly (imageSrcSet/imageSizes) so the
 * preload still matches the candidate the browser picks.
 */
export function ThemeImg({
  light,
  dark,
  alt,
  className,
  width,
  height,
  eager = false,
  srcSetLight,
  srcSetDark,
  sizes,
  fetchPriority,
}: {
  light: string;
  dark: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  eager?: boolean;
  srcSetLight?: string;
  srcSetDark?: string;
  sizes?: string;
  fetchPriority?: "high" | "low" | "auto";
}) {
  const common = { width, height, decoding: "async" as const, sizes };
  return (
    <>
      <img
        src={light}
        srcSet={srcSetLight}
        alt={alt}
        className={cn("theme-img-light", className)}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={fetchPriority}
        {...common}
      />
      <img
        src={dark}
        srcSet={srcSetDark}
        alt=""
        aria-hidden="true"
        className={cn("theme-img-dark", className)}
        loading="lazy"
        {...common}
      />
    </>
  );
}

/**
 * EngravedIcon — shorthand for the extracted engraved icon pair
 * (/images/brand/icons/<name>-light.webp / -dark.webp).
 */
export function EngravedIcon({
  name,
  alt,
  className,
  size = 48,
  eager = false,
}: {
  name: string;
  alt: string;
  className?: string;
  size?: number;
  eager?: boolean;
}) {
  return (
    <ThemeImg
      light={`/images/brand/icons/${name}-light.webp`}
      dark={`/images/brand/icons/${name}-dark.webp`}
      alt={alt}
      width={size}
      height={size}
      className={className}
      eager={eager}
    />
  );
}
