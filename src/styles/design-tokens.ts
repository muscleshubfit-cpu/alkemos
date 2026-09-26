/**
 * ALKEMOS DESIGN TOKENS — the typed mirror of the «Marble & Chrome» identity.
 * Owner directive 2026-09-25 (VRD-V6): a programmatic registry of the design
 * tokens so tooling, tests, and generated surfaces can import token NAMES and
 * VALUES without parsing CSS at runtime.
 *
 * ⚠️ SINGLE-SOURCE LAW (VRD-V5 §2 — unchanged): `src/app/globals.css` remains
 * the RUNTIME single source of truth (the `:root` + `[data-theme="dark"]`
 * blocks). This module is a MIRROR for documentation, tests, and tooling.
 * When globals.css changes a token, this file changes in the SAME commit —
 * a drifted mirror is worse than no mirror (docs_audit backtick-path rule
 * + the VRD-V6 parity note in src/docs/DESIGN_SYSTEM.md §2).
 *
 * Identity: monochrome Chrome/Silver + Black/Graphite + Ivory (VRD-V1 warm
 * retune, 2026-09-23 — bronze REJECTED by owner order). NO blue/green accent
 * identity; the --ai cyan lives on AI-assistant surfaces ONLY.
 * All contrast pairs are gated by `scripts/v1_contrast_matrix.py` (WCAG).
 */

// ────────────────────────────────────────────────────────────
// 1. COLOR — light theme (`:root` in globals.css)
// ────────────────────────────────────────────────────────────
export const LIGHT = {
  bg: "#FAF8F5",            // warm ivory canvas
  text: "#201D1A",          // warm graphite ink
  muted: "#6E675E",         // muted ink (secondary copy)
  muted2: "#4E4840",        // firmer muted ink (marketing anchors)
  edge: "#E5DFD6",          // hairline borders
  chromeEdge: "#837F77",    // chrome pill border
  tint: "#F1EDE7",          // alternating section band
  card: "#FFFFFF",          // card surface
  navbarBg: "rgba(250, 248, 245, 0.85)",
  innerHighlight: "rgba(255, 255, 255, 0.5)", // machined top edge
  shadow: "0 8px 24px rgba(32, 29, 26, 0.07)",
  shadowLift: "0 14px 32px -8px rgba(32, 29, 26, 0.16)",
} as const;

// ────────────────────────────────────────────────────────────
// 2. COLOR — dark theme (`[data-theme="dark"]`)
// ────────────────────────────────────────────────────────────
export const DARK = {
  bg: "#12100E",            // warm graphite canvas
  text: "#F4F1EC",          // warm ivory ink
  muted: "#A8A199",         // muted ink
  muted2: "#C6C0B8",        // firmer muted ink
  edge: "#2E2A25",          // hairline borders
  chromeEdge: "#4A463F",    // chrome pill border
  tint: "#1A1714",          // alternating section band
  card: "#1B1815",          // card surface
  navbarBg: "rgba(18, 16, 14, 0.85)",
  innerHighlight: "rgba(255, 255, 255, 0.06)",
  shadow: "0 0 0 1px rgba(255, 255, 255, 0.04), 0 12px 32px rgba(0, 0, 0, 0.5)",
  shadowLift: "0 0 0 1px rgba(255, 255, 255, 0.06), 0 18px 40px -10px rgba(0, 0, 0, 0.65)",
} as const;

// ────────────────────────────────────────────────────────────
// 3. THE CHROME SYSTEM — machined metal gradients (both modes)
// ────────────────────────────────────────────────────────────
export const CHROME = {
  /** The chrome pill fill (light-leaning ramp, used in both themes). */
  fill:
    "linear-gradient(145deg, #FDFDFD 0%, #CFCBC3 35%, #8E8A82 50%, #E9E6E0 70%, #A09C94 100%)",
  fillHover:
    "linear-gradient(145deg, #FFFFFF 0%, #D8D4CC 35%, #98948C 50%, #F0EDE7 70%, #A8A49C 100%)",
  /** Chrome-gradient TEXT — light mode uses the dark-steel ramp (≥4.5:1 on
   *  warm ivory, WCAG gate 3); dark mode and pinned-black surfaces use the
   *  warm-silver ramp. */
  textSteel:
    "linear-gradient(145deg, #2B2722 0%, #1C1A16 35%, #423E37 50%, #211E1A 70%, #322E28 100%)",
  textSilver:
    "linear-gradient(145deg, #F4F1EC 0%, #BDB8AF 35%, #949087 50%, #E0DCD5 70%, #A29E95 100%)",
  /** The pinned-black card ring (Premium/Pro cards, /memberships language). */
  ringOnBlack:
    "linear-gradient(145deg, #FDFDFD 0%, #C9CED3 35%, #878E94 50%, #E6E9EC 70%, #9AA0A6 100%)",
  /** The VRD-V6 machined inner bevel of .btn-chrome (top light / bottom dark). */
  bevel: {
    top: "rgba(255, 255, 255, 0.55)",
    bottom: "rgba(28, 23, 16, 0.18)",
  },
} as const;

// ────────────────────────────────────────────────────────────
// 4. AI ACCENT — cyan, AI-assistant surfaces ONLY (mission law)
// ────────────────────────────────────────────────────────────
export const AI = {
  light: "#38C7FF",
  dark: "#45D6FF",
} as const;

// ────────────────────────────────────────────────────────────
// 5. STATUS + ACTION (shadcn/ui slots — app surfaces only;
//    marketing CTAs are .btn-chrome / .btn-outline)
// ────────────────────────────────────────────────────────────
export const STATUS = {
  primary: "#0071e3",       // shadcn action color (app/UI surfaces ONLY)
  destructive: "#ff3b30",
  success: "#34c759",
  warning: "#ff9500",
} as const;

// ────────────────────────────────────────────────────────────
// 6. RADIUS / SPACING / MOTION / TYPOGRAPHY
// ────────────────────────────────────────────────────────────
export const RADIUS = {
  base: "1rem",             // 16px — the shadcn --radius scale driver
  chrome: "14px",           // --radius-chrome — cards & chrome pills' kin
  pill: "999px",            // buttons, chips, split rail
} as const;

export const MOTION = {
  /** All micro-transitions ride 0.2s ease (hover/lift/focus). */
  micro: "0.2s ease",
  /** Entrance reveals: opacity/translateY only, once-only, ≤200ms stagger. */
  revealDelayStep: 80,
  /** Every motion stands down under prefers-reduced-motion (vestibular law). */
  reducedMotion: "no-preference",
} as const;

export const TYPOGRAPHY = {
  /** EMBER-INK-279 — the template families: EN display = Sora, EN body =
   * Outfit (next/font, metric-adjusted fallback). */
  displayEn: "var(--font-display)",
  bodyEn: "var(--font-sans)",
  /** AR — Cairo for EVERYTHING (display + body; the VRD-V0 unlayered RTL law:
   *  headings pin Cairo 700, letter-spacing 0, leading 1.35/1.4/1.45). */
  arabic: "var(--font-arabic)",
  /** Section H2 scale (the template's section titles): 3xl mobile →
   * 5xl desktop, BOLD display weight (Sora 700). */
  h2: { mobile: "1.875rem", desktop: "3rem", weight: 700 },
  /** Hero H1: the template's clamp(2.5rem,6vw,4.75rem), bold, 0.95 EN
   * leading (the unlayered RTL law re-leads Arabic at 1.35). */
  h1: { mobile: "2.5rem", desktop: "4.75rem", weight: 700 },
} as const;

// ────────────────────────────────────────────────────────────
// 7. LAYOUT RHYTHM (the section grammar every page shares)
// ────────────────────────────────────────────────────────────
export const LAYOUT = {
  container: "max-w-6xl",            // the ONE content container width
  sectionY: "py-10 md:py-20",        // the vertical section beat
  alternation: ["--bg", "--tint"],   // the section band alternation
  touchTarget: { primary: "48px", primaryDesktop: "52px", secondary: "44px" },
} as const;

// ────────────────────────────────────────────────────────────
// 8. THE RECIPES (class names — see src/docs/DESIGN_SYSTEM.md §5
//    for the full recipe book; this registry names the surfaces)
// ────────────────────────────────────────────────────────────
export const RECIPES = [
  "btn-chrome",        // primary CTA — chrome pill + machined bevel (VRD-V6)
  "btn-outline",       // secondary CTA — glass pill over artwork
  "marble-card",       // the surface card (+ .card-lift for interactive)
  "seal-chip",         // engraved eyebrow chip
  "chrome-text",       // metallic numerals (dark-steel light / silver dark)
  "hero-pill",         // VRD-V6: the hero platform-trio glass pills
  "evo-console",       // VRD-V6: the EVO demo in-product panel
  "split-rail",        // VRD-V6: the diet-card macro split rail
  "macro-track",       // the #eat / calculator animated macro bars
  "chips-row",         // the muscle-chip rail (scroll-snap on touch)
  "navbar-chrome",     // sticky translucent navbar
  "footer-marble",     // the footer structural band
  "meander-divider",   // the Greek meander narrative divider
  "theme-img-light",   // ThemeImg dual-pair (CSS-switched, zero JS)
  "theme-img-dark",
] as const;

export type RecipeName = (typeof RECIPES)[number];
