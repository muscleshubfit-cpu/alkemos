#!/usr/bin/env python3
"""VRD-V1 contrast matrix gate — WCAG 2.1, measured not assumed.

Born from the Visual Redesign plan §21.1 (docs/VISUAL-REDESIGN-AUDIT-
2026-09-23.md) and the owner's V1 direction of 2026-09-23: bronze (O-4)
was REJECTED in favor of «enhance the current identity» — a monochrome
Chrome/Silver + Black/Graphite + Ivory system with NO new accent color.
The neutral ramp (warm ivory / warm graphite) is the §8.2 proposal; the
accent roles stay with the existing chrome-text / token families.

This gate PARSES src/app/globals.css (the live token file) on every run,
so it validates what actually ships — never a hand-copied table.

Gated claims (hard-fail, exit 1):
  1. text tokens (--text/--muted/--muted-2) x surfaces (--bg/--tint/--card)
     >= 4.5:1 in BOTH modes                     [WCAG AA normal text]
  2. .btn-chrome label ink x every --chrome and --chrome-hover gradient
     stop >= 4.5:1 in BOTH modes                [15px/600 = normal text]
  3. .chrome-text ramps: worst stop vs its mode's --bg >= 4.5:1, plus
     the pinned-black surface (#0B0B0D secondary-page cards) for the
     on-dark ramp                              [Phase-198 discipline]
  4. focus ring color-mix(var(--text) N% over --bg) >= 3:1 in BOTH modes
                                               [WCAG 1.4.11 non-text]
  5. section alternation perceptibility: dL* (--bg vs --tint) >= 2.8
     CIE L* points in BOTH modes                [audit R-4 / fixes C-5]

Usage:  python3 scripts/v1_contrast_matrix.py
Exit:   0 = every gate green · 1 = any gate red
"""
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CSS = REPO / "src" / "app" / "globals.css"

PINNED_BLACK = "#0B0B0D"  # secondary-page black cards (memberships etc.)


def srgb_to_lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def rel_lum(hexstr):
    h = hexstr.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * srgb_to_lin(r) + 0.7152 * srgb_to_lin(g) + 0.0722 * srgb_to_lin(b)


def contrast(fg, bg):
    l1, l2 = rel_lum(fg), rel_lum(bg)
    if l1 < l2:
        l1, l2 = l2, l1
    return (l1 + 0.05) / (l2 + 0.05)


def cie_lstar(hexstr):
    h = hexstr.lstrip("#")
    r, g, b = (srgb_to_lin(int(h[i:i + 2], 16)) for i in (0, 2, 4))
    y = 0.2126 * r + 0.7152 * g + 0.0722 * b

    def f(t):
        return t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116

    return 116 * f(y) - 16


def hexes(value):
    return re.findall(r"#[0-9A-Fa-f]{6}", value)


def blend(fg, bg, alpha):
    """sRGB hex blend of fg at `alpha` over bg (color-mix approximation)."""
    f, b = fg.lstrip("#"), bg.lstrip("#")
    out = "".join(
        f"{round(alpha * int(f[i:i + 2], 16) + (1 - alpha) * int(b[i:i + 2], 16)):02X}"
        for i in (0, 2, 4)
    )
    return f"#{out}"


def parse_css():
    src = CSS.read_text(encoding="utf-8")

    def block_vars(block_header_re):
        """Return {--token: raw value} for the first block whose header+body
        matches and that defines --bg (the Marble & Chrome generation —
        skips the dead Apple-era :root). FIRST occurrence wins: the identity
        layer (e.g. --muted #6B7075 text gray) is declared BEFORE the shadcn
        mapping section re-uses the same names for surface values."""
        out = {}
        for m in re.finditer(block_header_re, src):
            start = m.end()
            depth, i = 1, start
            while i < len(src) and depth:
                if src[i] == "{":
                    depth += 1
                elif src[i] == "}":
                    depth -= 1
                i += 1
            body = src[start:i]
            if "--bg:" not in body:
                continue
            for name, value in re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", body):
                out.setdefault(name, value.strip())
            return out
        return {}

    light = block_vars(re.compile(r":root\s*\{"))
    dark = block_vars(re.compile(r"\[data-theme=\"dark\"\]\s*\{"))

    if not light or not dark:
        sys.exit("FATAL: could not locate the Marble & Chrome token blocks in globals.css")

    def rule_body(selector_re):
        m = re.search(selector_re, src)
        if not m:
            return ""
        start = m.end()
        depth, i = 1, start
        while i < len(src) and depth:
            if src[i] == "{":
                depth += 1
            elif src[i] == "}":
                depth -= 1
            i += 1
        return src[start:i]

    btn = rule_body(re.compile(r"\.btn-chrome\s*\{"))
    btn_ink = (re.search(r"color:\s*(#[0-9A-Fa-f]{6})", btn) or [None, None])[1]

    # .chrome-text light ramp = the base rule; dark + on-dark = the
    # light-steel ramp (both read the FIRST gradient in their block).
    ct_light = rule_body(re.compile(r"\n\.chrome-text\s*\{"))
    ct_light_stops = hexes(ct_light)
    ct_dark_rule = re.search(
        r'\[data-theme="dark"\]\s+\.chrome-text(?!\.chrome-text-on-dark)[^{]*\{([^}]*)\}',
        src,
    )
    ct_dark_stops = hexes(ct_dark_rule.group(1)) if ct_dark_rule else []

    ring = rule_body(re.compile(r"\*:focus-visible\s*\{"))
    ring_mix = re.search(
        r"color-mix\(in srgb,\s*var\(--text\)\s+([\d.]+)%,\s*transparent\)", ring
    )

    return light, dark, btn_ink, ct_light_stops, ct_dark_stops, ring_mix


def main():
    light, dark, btn_ink, ct_light, ct_dark, ring_mix = parse_css()
    failures, warnings = [], []

    def gate(ok, label, detail=""):
        mark = "PASS" if ok else "FAIL"
        print(f"  [{mark}] {label}" + (f" — {detail}" if detail else ""))
        if not ok:
            failures.append(f"{label} {detail}")

    # --chrome / --chrome-hover are mode-invariant (declared on :root only,
    # plan §15) — parse once, gate in BOTH modes.
    chrome_stops = hexes(light.get("--chrome", "")) + hexes(light.get("--chrome-hover", ""))

    for mode, toks in (("LIGHT (warm ivory)", light), ("DARK (warm graphite)", dark)):
        print(f"\n== {mode} ==")
        bg, tint, card = toks["--bg"], toks["--tint"], toks["--card"]
        for fg_tok in ("--text", "--muted", "--muted-2"):
            for surf_name, surf in (("--bg", bg), ("--tint", tint), ("--card", card)):
                r = contrast(toks[fg_tok], surf)
                gate(r >= 4.5, f"{fg_tok} on {surf_name}", f"{r:.2f}:1")

        # alternation perceptibility (CIE L* step)
        dl = abs(cie_lstar(tint) - cie_lstar(bg))
        gate(dl >= 2.8, "alternation dL* (--tint vs --bg)", f"{dl:.2f} L* points")

        # button ink vs every chrome stop (fill + hover ramps share the ink)
        worst = min((contrast(btn_ink, s) for s in chrome_stops), default=0)
        gate(worst >= 4.5, ".btn-chrome ink vs chrome stops (worst)", f"{worst:.2f}:1 over {len(chrome_stops)} stops")

        # focus ring blend vs page bg
        if ring_mix:
            alpha = float(ring_mix.group(1)) / 100.0
            ring_color = blend(toks["--text"], bg, alpha)
            r = contrast(ring_color, bg)
            gate(r >= 3.0, f"focus ring --text@{ring_mix.group(1)}% vs --bg", f"{r:.2f}:1")
        else:
            failures.append("focus ring color-mix(var(--text) N%) not found")

    # chrome-text ramps: light ramp rides light bg; dark + on-dark ramps
    # ride dark surfaces (incl. the pinned-black secondary cards).
    print("\n== .chrome-text ramps ==")
    if ct_light:
        worst_stop = max(ct_light, key=rel_lum)  # lightest stop vs light bg
        r = contrast(worst_stop, light["--bg"])
        gate(r >= 4.5, "light ramp (lightest stop) vs --bg", f"{r:.2f}:1")
    else:
        failures.append(".chrome-text light ramp not found")
    if ct_dark:
        worst_stop = min(ct_dark, key=rel_lum)  # darkest stop vs dark bg
        r = contrast(worst_stop, dark["--bg"])
        gate(r >= 4.5, "dark ramp (darkest stop) vs --bg", f"{r:.2f}:1")
        r_pin = contrast(worst_stop, PINNED_BLACK)
        gate(r_pin >= 4.5, "on-dark ramp vs pinned black cards", f"{r_pin:.2f}:1")
    else:
        failures.append(".chrome-text dark/on-dark ramp not found")

    # informational (not gated): decorative hairline strength
    print("\n== informational (decorative, not gated) ==")
    for mode, toks in (("light", light), ("dark", dark)):
        e = contrast(toks["--edge"], toks["--bg"])
        print(f"  --edge on --bg [{mode}]: {e:.2f}:1 (decorative hairline)")

    print()
    if failures:
        print(f"RESULT: {len(failures)} gate failure(s)")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)
    print("RESULT: all contrast gates green")


if __name__ == "__main__":
    main()
