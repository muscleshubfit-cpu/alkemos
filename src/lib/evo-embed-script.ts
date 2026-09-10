/**
 * EVO-6 (W6) — the one-line embed script builder (pure, unit-tested).
 *
 * The partner pastes ONE line:
 *   <script src="https://alkemos.com/embed/evo.js" data-key="pk_live_…"></script>
 * and the script injects a floating launcher + an ISOLATED iframe
 * pointing at /embed/widget (same origin as the script itself, derived
 * from its own src at runtime — previews work without hardcoding).
 *
 * ISOLATION = iframe: partner CSS/JS can never reach the widget and vice
 * versa (EVO_CHAT_SURFACE LAW stays sovereign inside our own domain).
 *
 * SECURITY SHAPE: the script embeds NO secret and NO markup from the
 * key — it reads document.currentScript.dataset.key verbatim and passes
 * it through encodeURIComponent into the iframe URL. The widget page
 * re-validates the key server-side (hash lookup) before rendering.
 */

export const EVO_WIDGET_PATH = "/embed/widget";

/**
 * Escape a string for safe interpolation into a double-quoted JS string
 * literal inside this script (defense in depth — the only runtime-
 * interpolated values are dataset reads the PARTNER controls on their
 * own page, plus the script's own origin).
 */
function jsStr(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\r?\n/g, "\\n");
}

export function buildEvoEmbedScript(): string {
  const widgetPath = jsStr(EVO_WIDGET_PATH);
  return `/* Alkemos EVO — one-line embed widget (EVO-6).
 * Usage: <script src="https://alkemos.com/embed/evo.js" data-key="pk_live_…"></script>
 * Zero dependencies. Injects a floating launcher + an isolated iframe.
 */
(function () {
  "use strict";
  try {
    var current = document.currentScript;
    if (!current) return;
    var key = (current.getAttribute("data-key") || "").trim();
    if (!key) {
      if (window.console && console.warn) {
        console.warn("[Alkemos EVO] missing data-key — widget not injected");
      }
      return;
    }
    var side = (current.getAttribute("data-side") || "right").toLowerCase() === "left" ? "left" : "right";
    var origin = new URL(current.src, window.location.href).origin;
    var lang = (navigator.language || "").toLowerCase().indexOf("ar") === 0 ? "ar" : "en";

    var iframeSrc = origin + "${widgetPath}"
      + "?key=" + encodeURIComponent(key)
      + "&lang=" + encodeURIComponent(lang)
      + "&side=" + encodeURIComponent(side);

    var isOpen = false;

    var css = document.createElement("style");
    css.textContent = ".alkemos-evo-launcher{position:fixed;bottom:20px;" + (side === "left" ? "left" : "right") + ":20px;z-index:2147483000;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;box-shadow:0 6px 24px rgba(0,0,0,.28);background:#1d1d1f;padding:0;overflow:hidden;transition:transform .15s ease}.alkemos-evo-launcher:hover{transform:scale(1.06)}.alkemos-evo-launcher img{width:100%;height:100%;object-fit:cover;border-radius:50%}.alkemos-evo-frame{position:fixed;bottom:92px;" + (side === "left" ? "left" : "right") + ":20px;z-index:2147483000;width:min(390px,calc(100vw - 24px));height:min(640px,calc(100vh - 120px));border:none;border-radius:18px;box-shadow:0 12px 48px rgba(0,0,0,.35);background:#fff;display:none}.alkemos-evo-frame.alkemos-evo-open{display:block}";
    document.head.appendChild(css);

    var launcher = document.createElement("button");
    launcher.className = "alkemos-evo-launcher";
    launcher.setAttribute("aria-label", "Chat with EVO");
    var img = document.createElement("img");
    img.src = origin + "/images/brand/evo-widget-light.webp";
    img.alt = "EVO";
    launcher.appendChild(img);

    var frame = document.createElement("iframe");
    frame.className = "alkemos-evo-frame";
    frame.setAttribute("title", "EVO chat");
    frame.setAttribute("allow", "clipboard-write");
    frame.src = iframeSrc;

    launcher.addEventListener("click", function () {
      isOpen = !isOpen;
      frame.className = isOpen ? "alkemos-evo-frame alkemos-evo-open" : "alkemos-evo-frame";
    });

    window.addEventListener("message", function (event) {
      if (event.origin !== origin) return;
      if (event.data === "alkemos-evo-close" && isOpen) {
        isOpen = false;
        frame.className = "alkemos-evo-frame";
      }
    });

    document.body.appendChild(launcher);
    document.body.appendChild(frame);
  } catch (e) {
    if (window.console && console.warn) {
      console.warn("[Alkemos EVO] inject failed", e);
    }
  }
})();
`;
}
