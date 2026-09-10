"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useMembershipTier } from "@/hooks/use-membership-tier";
import { getLimits } from "@/lib/memberships";
import { isAdFreePath } from "@/lib/ads-routes";

/**
 * AdSense Ad Component
 *
 * Displays a Google AdSense ad unit. Only renders on the client side
 * (AdSense requires JavaScript execution).
 *
 * Ads are AUTOMATICALLY suppressed on authenticated routes (dashboard,
 * admin, profile, checkout, etc.) — both to comply with AdSense program
 * policies (no ads on pages behind login walls) and to keep the
 * authenticated UX clean.
 *
 * Usage:
 *   <AdSenseAd slot="1234567890" format="auto" />
 *
 * Props:
 *   slot: The ad slot ID from your AdSense dashboard
 *   format: "auto" (default), "horizontal", "vertical", "rectangle"
 *   className: Additional CSS classes
 *   responsive: true (default) — makes the ad responsive
 */

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

// Routes where ads should NOT be shown (AD_FREE_ROUTE_PREFIXES):
//   - Authenticated member routes (AdSense policy: no ads behind login)
//   - Admin routes
//   - Checkout + auth flows
// PHASE 139: the list moved to the shared server/client module
// src/lib/ads-routes.ts — layout.tsx route-scopes the adsbygoogle.js
// loader against the SAME law (it used to load ~220KB on every page,
// including ad-free app pages).

export function AdSenseAd({
  slot,
  format = "auto",
  className = "",
  responsive = true,
}: {
  slot?: string;
  format?: string;
  className?: string;
  responsive?: boolean;
}) {
  const adRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname() || "";
  const { profile, isAdmin } = useAuth();
  const { tier } = useMembershipTier(profile);
  // PHASE 173 (owner directive — dead space before the article FAQ):
  // AdSense reserves layout space for its async host div (aswift_*_host)
  // even when NO ad iframe ever fills the slot — measured live on the
  // blog article page: a 280px unfilled block + the wrapper's my-8
  // margins = ~344px of dead space between the article body and the FAQ
  // section. Root fix (not a CSS hack): watch the slot's OFFICIAL fill
  // signals — an injected <iframe> or ins[data-ad-status="filled"] — and
  // collapse the wrapper entirely (display:none, margins included) when
  // the slot is still unfilled after the grace window. The slot stays
  // rendered during the window (hidden containers block ad serving); a
  // late fill re-expands it via the MutationObserver. Filled ads keep
  // the exact pre-173 layout (my-8 + responsive block).
  const [adCollapsed, setAdCollapsed] = useState(false);

  // Publisher ID from env var — falls back to hardcoded value if env
  // isn't set (so the component keeps working during the migration
  // window before env vars are configured in Vercel).
  const adClient =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-8658364692422583";

  const isAdFreeRoute = isAdFreePath(pathname);
  const limits = getLimits(tier);
  // Phase 71 — owner decree «الادمن بلا حدود»: the admin NEVER sees ads,
  // even on public pages (adsEnabled for his coaching tier is ignored).
  const shouldRenderAd =
    !isAdFreeRoute &&
    !isAdmin &&
    limits.adsEnabled &&
    Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT);

  useEffect(() => {
    if (!shouldRenderAd) return;
    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      // AdSense not loaded yet — silently fail
    }
    // PHASE 173 unfilled-slot collapse (see component doc above).
    const ins = adRef.current?.querySelector("ins") ?? null;
    if (!ins) return;
    const isFilled = () =>
      ins.querySelectorAll("iframe").length > 0 ||
      ins.getAttribute("data-ad-status") === "filled";
    let graceElapsed = false;
    const observer = new MutationObserver(() => {
      if (isFilled()) setAdCollapsed(false);
      else if (graceElapsed) setAdCollapsed(true);
    });
    const timer = window.setTimeout(() => {
      graceElapsed = true;
      if (!isFilled()) setAdCollapsed(true);
    }, 4000);
    observer.observe(ins, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-ad-status"],
    });
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [shouldRenderAd]);

  if (!shouldRenderAd) {
    return null;
  }

  return (
    <div ref={adRef} className={`${adCollapsed ? "hidden" : "my-8"} ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adClient}
        data-ad-slot={slot || ""}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
