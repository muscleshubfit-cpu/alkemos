"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Lazy EVO floating widget (H5, performance audit 2026-09-05).
 *
 * The widget (544 lines + voice input + icons) used to ship in the
 * critical bundle of EVERY page via the root layout. It loads after
 * the page is interactive — requestIdleCallback with a hard timeout
 * fallback — so first paint and hydration stop paying for a chat UI
 * the visitor hasn't opened yet.
 *
 * The EvoChatProvider context used to stay mounted in the root layout
 * ("light") — PHASE 216 (P2-4) moved it INSIDE the dynamic import:
 * the only useEvoChat consumer is the widget itself, and ANY static
 * mount (root layout or even this file's module scope) dragged the
 * chat state machine (~48KB: tier + intent + persistence + link
 * storage) into every page's critical bundle. The provider + widget
 * now arrive as ONE deferred chunk. Eager CTAs open the widget
 * through the zero-dependency event dispatcher in
 * @/lib/evo-chat-events (openEvoFloatingChat).
 *
 * (EVO-6 partner embed surface removed 2026-09-10 by owner order —
 * /embed/* no longer exists; EVO_CHAT_SURFACE LAW: the floating widget
 * is the ONE chat surface again.)
 */

const EvoChatWidget = dynamic(() =>
  Promise.all([
    import("@/lib/evo-chat-context"),
    import("@/components/EvoFloatingWidget"),
  ]).then(([ctx, widget]) => {
    const Provider = ctx.EvoChatProvider;
    const Widget = widget.EvoFloatingWidget;
    function DeferredEvoChatWidget() {
      return (
        <Provider>
          <Widget />
        </Provider>
      );
    }
    return { default: DeferredEvoChatWidget };
  }),
  { ssr: false },
);

export function EvoWidgetLazy() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // PHASE 216 (P2-4): the idle callback used to be requested AT MOUNT
    // (hydration) — on fast connections the browser fires it DURING
    // load, so the ~109KB chat UI still landed inside the critical
    // window. The component's own doc says "after the page is
    // interactive" — this now means literally: idle is requested only
    // AFTER the load event.
    const scheduleIdle = () => {
      if (typeof window.requestIdleCallback === "function") {
        const id = window.requestIdleCallback(() => setReady(true), {
          timeout: 3000,
        });
        return () => window.cancelIdleCallback(id);
      }
      const t = setTimeout(() => setReady(true), 1500);
      return () => clearTimeout(t);
    };

    if (document.readyState === "complete") return scheduleIdle();
    window.addEventListener("load", scheduleIdle, { once: true });
    return () => window.removeEventListener("load", scheduleIdle);
  }, []);

  if (!ready) return null;
  return <EvoChatWidget />;
}
