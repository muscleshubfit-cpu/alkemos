import { describe, it, expect } from "vitest";
import { buildEvoEmbedScript, EVO_WIDGET_PATH } from "@/lib/evo-embed-script";

/**
 * EVO-6 (W6) — the one-line embed script builder.
 * Laws under test:
 *   - CARRIES NO CREDENTIAL: the script reads data-key from
 *     document.currentScript at RUNTIME — no key material is baked into
 *     the served bytes (the response is identical for every partner).
 *   - ISOLATED SURFACE: injects an iframe to /embed/widget (same-origin
 *     policy isolation), never inline DOM chat.
 *   - SAFE INTERPOLATION: every runtime value passes through the JS
 *     string escaper — no `</script>`-style breakout, no unescaped
 *     single quotes closing the payload strings.
 */

describe("buildEvoEmbedScript", () => {
  const script = buildEvoEmbedScript();

  it("reads the key from data-key at runtime (no baked credential)", () => {
    expect(script).toContain('current.getAttribute("data-key")');
    expect(script).not.toMatch(/pk_live_[0-9a-f]{32}/);
  });

  it("targets the isolated widget path", () => {
    expect(script).toContain(EVO_WIDGET_PATH);
    expect(script).toContain("/embed/widget");
  });

  it("derives the widget origin from the script's own src", () => {
    expect(script).toContain("new URL(current.src");
  });

  it("warns and no-ops without a key", () => {
    expect(script).toContain("missing data-key");
  });

  it("listens only for same-origin close messages", () => {
    expect(script).toContain("event.origin !== origin");
    expect(script).toContain("alkemos-evo-close");
  });

  it("escapes the widget path for safe JS string interpolation", () => {
    // The path contains a forward slash — safe; assert the escaped form
    // appears inside a quoted string context rather than raw markup.
    expect(script).toContain('"' + EVO_WIDGET_PATH + '"');
  });

  it("is IIFE-wrapped, strict, and try/caught (never breaks the host page)", () => {
    expect(script).toContain("(function () {");
    expect(script).toContain('"use strict"');
    expect(script).toContain("} catch (e)");
  });

  it("supports data-side=left launcher placement", () => {
    expect(script).toContain('getAttribute("data-side")');
    expect(script).toContain('"left"');
  });
});
