import { Fragment } from "react";
import type { ReactNode } from "react";

/**
 * HUB HEAD RESOURCES (VERCEL-USAGE-3, 2026-09-21).
 *
 * The former single dynamic root layout rendered route-scoped preconnects
 * and hub-banner artwork preloads in <head> by reading the request path
 * from middleware headers() — the same call that forced EVERY page on the
 * site into dynamic rendering (the Fluid CPU / invocation driver behind
 * the Vercel Hobby usage overage).
 *
 * With the static RootShell those resources moved DOWN to the section
 * layouts where the subtree is statically known. React 19 hoists <link>
 * elements into <head> wherever they render, so the emitted markup and
 * load behavior are identical to the old layout-rendered tags.
 *
 * Section names mirror the old hubBannerSection chain in the root layout:
 * blog | exercises | tools | foods | programs | pricing (memberships).
 */

export function Preconnects({ hosts }: { hosts: string[] }) {
  return (
    <>
      {hosts.map((host) => (
        <Fragment key={host}>
          <link rel="preconnect" href={host} />
          <link rel="dns-prefetch" href={host} />
        </Fragment>
      ))}
    </>
  );
}

export function BannerPreloads({ section }: { section: string }) {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href={`/images/brand/header-${section}-light.webp`}
        media="(prefers-color-scheme: light)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href={`/images/brand/header-${section}-dark.webp`}
        media="(prefers-color-scheme: dark)"
        fetchPriority="high"
      />
    </>
  );
}

export function Resources({
  hosts = [],
  banner,
  children,
}: {
  hosts?: string[];
  banner?: string;
  children?: ReactNode;
}) {
  return (
    <>
      <Preconnects hosts={hosts} />
      {banner && <BannerPreloads section={banner} />}
      {children}
    </>
  );
}
