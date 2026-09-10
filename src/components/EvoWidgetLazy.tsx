"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Lazy EVO floating widget (H5, performance audit 2026-09-05).
 *
 * The widget (544 lines + voice input + icons) used to ship in the
 * critical bundle of EVERY page via the root layout. It now loads
 * after the page is interactive — requestIdleCallback with a hard
 * timeout fallback — so first paint and hydration stop paying for a
 * chat UI the visitor hasn't opened yet.
 *
 * The EvoChatProvider context stays mounted in the layout (light) so
 * any eager useEvoChat consumer keeps working; only the widget UI is
 * deferred.
 *
 * EVO-6 (W6): the platform floating widget NEVER mounts on /embed/* —
 * those routes are the PARTNER embed surface rendered inside an iframe
 * (their page hosts OUR widget already); the platform drawer inside the
 * iframe would be a doubled chat UI (EVO_CHAT_SURFACE LAW — one surface
 * per context).
 */

const EMBED_PATH_RE = /^\/embed(?:\/|$)/;

const EvoFloatingWidget = dynamic(
  () =>
    import("@/components/EvoFloatingWidget").then((m) => ({
      default: m.EvoFloatingWidget,
    })),
  { ssr: false },
);

export function EvoWidgetLazy() {
  const [ready, setReady] = useState(false);
  const pathname = usePathname() || "";

  useEffect(() => {
    if (EMBED_PATH_RE.test(pathname)) return;
    const load = () => setReady(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(load, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(load, 1500);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!ready || EMBED_PATH_RE.test(pathname)) return null;
  return <EvoFloatingWidget />;
}
