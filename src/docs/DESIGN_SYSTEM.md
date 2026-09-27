# Alkemos Design System — «Marble & Chrome»

> **Status:** LIVE — the binding design-system reference for implementation work.
> **Provenance:** owner directive 2026-09-25 (VRD-V6) — «حدّث/أنشئ `src/styles/design-tokens.ts` و `src/docs/DESIGN_SYSTEM.md`». Updated 2026-09-26 (TPL-REF-280: +`.chev` / +`.ghost-num` recipes — template-informed techniques re-authored in the Marble & Chrome language; the 1devtool template is a visual REFERENCE only).
> **Hierarchy:** this file documents the REAL implementation. The runtime single
> source of truth is `src/app/globals.css` (tokens) + the recipe classes; the
> typed mirror is `src/styles/design-tokens.ts`. `DESIGN.md` (repo root) remains
> the condensed binding law doc — on conflict, **code wins** (AGENTS.md §12.8).
> **Identity law (owner, 2026-09-23):** monochrome **Chrome/Silver + Black/Graphite
> + Ivory** — enhance, never replace. NO blue/green identity. NO marble texture
> backgrounds. NO bronze (rejected). The `--ai` cyan lives on AI-assistant
> surfaces ONLY.

---

## 1. Philosophy

**Premium athletic, clean, modern, confident.** Alkemos looks like one machined
object: warm ivory canvas, warm graphite ink, chrome metal used sparingly for
the moments that matter (primary CTAs, metallic numerals, the Premium ring).
Structure — not decoration — creates depth: hairline edges, a 1px machined
inner highlight, soft shadows. Light and Dark are equal citizens, generated
from the same token names. Arabic (RTL) and English (LTR) are independent
native pairs at the same quality level, not translations of a template.

## 2. Tokens (mirror of `globals.css`)

### 2.1 Surfaces & inks

| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg` | `#FAF8F5` | `#12100E` | canvas |
| `--text` | `#201D1A` | `#F4F1EC` | primary ink |
| `--muted-foreground` | `#6E675E` | `#A8A199` | secondary copy |
| `--muted-2` | `#4E4840` | `#C6C0B8` | marketing anchors / footer links |
| `--tint` | `#F1EDE7` | `#1A1714` | alternating section band |
| `--card` | `#FFFFFF` | `#1B1815` | card surface |
| `--edge` | `#E5DFD6` | `#2E2A25` | hairline border |
| `--chrome-edge` | `#837F77` | `#4A463F` | chrome pill border |
| `--shadow` | soft drop | ring + drop | resting cards |
| `--shadow-lift` | deeper drop | ring + deeper | hover elevation |
| `--card-inner-hl` | `inset 0 1px 0 rgba(255,255,255,.5)` | `…(.06)` | machined top edge |

Alternation perceptibility (`--bg` vs `--tint` ΔL*) is **gated ≥ 2.8 CIE L\***
in both modes by `scripts/v1_contrast_matrix.py`.

### 2.2 The chrome system

- **`--chrome`** pill fill — 5-stop warm-silver ramp (145°).
- **`.chrome-text`** — metallic numerals: dark-steel ramp in light (≥4.5:1 on
  ivory — WCAG-gated), warm-silver ramp in dark; `.chrome-text-on-dark` pins
  the silver ramp on always-black surfaces.
- **VRD-V6 machined bevel** — `.btn-chrome` carries `inset 0 1px 0` bright top
  edge + `inset 0 -1px 0` dark bottom edge inside the metal (pressed-metal
  affordance); hover deepens the drop to `--shadow-lift`.
- **Pinned-black ring** — Premium/Pro cards: `#0B0B0D` fill + the chrome
  gradient as a 2px border (background-clip trick, `darkMarbleStyle`).

### 2.3 The AI accent

`--ai` cyan (`#38C7FF` / `#45D6FF`) — EVO widget ring, `.ai-accent`, `.ai-ring`
on the EVO avatar, the focus `--ring`. **Never** a marketing identity color.

## 3. Typography

| Role | EN | AR (RTL) |
|---|---|---|
| Display / headings | Playfair Display (`--font-display`) | Cairo (`--font-arabic`), **weight 700, letter-spacing 0, leading 1.35–1.45** (the VRD-V0 unlayered RTL law — utilities never defeat it) |
| Body | Inter (`--font-sans`) | Cairo |
| Scale | H1 hero `text-2xl→lg:text-6xl` semibold · H2 sections `text-3xl→text-4xl` semibold · body `text-sm→lg` | same scale, Cairo metrics |

Fonts ship via `next/font` (one variable file per family, preloaded, metric-
adjusted fallbacks — the CLS-136/216 story). Arabic body letter-spacing is
never negative (connected-script law).

## 4. Layout rhythm

- ONE content container: `max-w-6xl` (readable text columns may narrow to
  `max-w-2xl/3xl` inside).
- Section beat: `py-10 md:py-20`, alternating `--bg` / `--tint` bands.
- Section header pattern: `.seal-chip` eyebrow → H2 → one supporting sentence
  → interactive surface. ONE focused CTA per browse section.
- Greek meander divider (`.meander-divider`) marks the narrative act break —
  exploration ends, services begin. It is the only decorative motif.
- Touch targets: primary CTA 48px (52px md+), secondary 44px (48px md+),
  carousel arrows 44px on touch, every target ≥ 24px (WCAG 2.5.8).

## 5. Recipe book (the shared classes)

| Recipe | Purpose | Notes |
|---|---|---|
| `.btn-chrome` | PRIMARY action | chrome pill + machined bevel + warm ink `#1C1710` label (≥5.2:1 on every stop) |
| `.btn-outline` | SECONDARY action | glass pill: `--card` 72% + blur(6px) + 1px `--text` border (VRD-V6 fill) |
| `.btn-outline-dark` | secondary on pinned-black cards | HOME-POLISH-285 — the same pill re-inked light for the ALWAYS-dark Pro membership card (`rgba(245,245,247,.45)` border, `#F5F5F7` ink) |
| `.hero-pill` | platform-trio chips (hero) | VRD-V6 — non-interactive glass pills; two-button law intact |
| `.marble-card` (+`.card-lift`) | every surface card | `--card` fill + chrome hairline + shadow + inner highlight; 2px lift on interactive cards only, reduced-motion safe |
| `.seal-chip` | eyebrow labels | uppercase micro-chip, chrome hairline |
| `.chrome-text` / `.chrome-text-on-dark` | metallic numerals | price, counts, section numbers |
| `.split-rail` + `.split-seg--*` | macro split visual | VRD-V6 — diet cards; segments derive from `--text` via color-mix (auto theme-inverting) |
| `.chev` | pill-CTA chevron micro-slide | TPL-REF-280 — 4px nudge toward reading direction on `.btn-*` hover; individual `translate` property (composes with `rtl:rotate-180`); RTL-mirrored; reduced-motion frozen; opt-in per span |
| `.ghost-num` | diet-card ghost index numeral | TPL-REF-280 — `font-display` 44px/600 in `color-mix(--text 10%)` (zero new hexes, auto theme-inverting); aria-hidden, decorative, no rank meaning |
| `.chips-row` | muscle/food-category chips rail | scroll-snap single row on touch, edge fades, RTL-safe; HOME-POLISH-285: the food categories ride the same rail |
| `.navbar-chrome` | sticky navbar | `--navbar-bg` translucent + blur(12px) saturate(150%) |
| `.footer-marble` | footer band | tint + hairline (light) / deeper step `#0E0C0A` (dark) |
| `.hero-art` / `.hero-bg` / `.hero-copy` | hero stage | min-height floors per viewport; no veil ever — glyphs get a theme-aware halo instead |

## 6. Page recipes (homepage order — canary-pinned)

1. **Hero** — owner artwork (ThemeImg pair, eager LCP) + chrome logo lockup +
   H1 + subtitle + **platform trio pills (VRD-V6)** + exactly TWO CTAs
   (login/signup `.btn-chrome` + memberships `.btn-outline`).
2. **Proof strip** — one compact band: 4 auditable numbers (`CountUp`,
   SSR-honest, derived from verified constants only).
3. `#library` **Training** — the muscle-group browser preview: SIX real
   exercise cards per family (HOME-PLATFORM-284).
4. `#train` **Programs** — the ready-made programs carousel.
5. `#eat` **Food library** (HOME-POLISH-285) — the exercise-library
   pattern on the food database: the nine category chips (foods-shared
   vocabulary + images) route into `/foods?cat=…`; SIX real curated food
   cards with per-100g calories + macros link into the food pages.
6. `#diet` **Diet plans** — the diet-systems carousel; diet cards carry
   the macro split rail (VRD-V6) + the ghost index numeral (TPL-REF-280).
7. `#tools` **Tools** (HOME-POLISH-285) — VISUAL TILES preview: the five
   calculators/tracker + the MANUAL Meal Planner («ابنِها بنفسك»), every
   tile linking to its tool page (derived from tools-shared.ts; the tools
   themselves are NOT embedded on the homepage).
8. **Free-allowance band** (HOME-POLISH-285) — the honest free monthly
   plan quota, placed immediately BEFORE the AI section so it introduces
   the AI planners.
9. `#plan` **AI Planning** — TWO strong AI planner cards (AI Workout
   Planner · AI Meal Planner — a structured full-day plan with grams —
   both explicitly AI-powered with filled `.btn-chrome` CTAs and the
   cyan `.ai-ring` on their icons) + EVO as a full-width card with a
   `openEvoFloatingChat()` chat button (the chat-surface law).
   Deliberately distinct from `#tools`.
10. `#learn` **Latest articles** — latest-first carousel (renders only when
    posts loaded).
11. **Meander divider** → `#memberships` **Memberships** — three small cards
    (Free/Premium/Pro; **PRO = the ONE dark anchor** since HOME-POLISH-285,
    wearing the Recommended seal and `.btn-outline-dark`; Premium is a light
    marble card) + the LIGHT coaching service band (VRD-V6) + the 7-day
    refund fact.
12. Featured coaches (paid-ad strip, conditional) → `#faq` — a DIRECTLY
    VISIBLE grid of Q&A cards (HOME-POLISH-285 — no accordion) →
    **SiteFooter**.

Prices always derive from `src/lib/memberships.ts` — never literals.
Counts always ride `EXERCISES_COUNT` / `FOODS_COUNT` / `TOOLS_COUNT`.

## 7. Theme engine

`data-theme="light|dark"` on `<html>`, set pre-paint by the root-shell inline
script (zero flash), three-state toggle (light/dark/system). Dual artwork runs
through `ThemeImg` (both `<img>` render; CSS `.theme-img-light/dark` picks —
zero JS, zero flicker; the un-fetched variant costs 0 KB). A dark-compat
shim remaps legacy app-surface utilities (`bg-white` etc.) onto the tokens.

## 8. RTL / bilingual law

- `[dir="rtl"]` mirrors layout via CSS logical properties (`ms-`/`me-`,
  `start-`/`end-`, `border-s`); the EVO art mask and carousel arrows flip.
- AR headings: Cairo 700, `letter-spacing: 0`, leading 1.35/1.4/1.45 by level
  (UNLAYERED CSS beats the Tailwind utilities layer — the C-1 lesson).
- Copy is written natively per language (independent EN/AR pairs, MSA-clean,
  zero emoji, zero Latin contamination in AR prose).

## 9. Accessibility floor

Semantic landmarks + skip-link; keyboard-operable dropdowns/drawer (focus-
within + Escape); focus ring `color-mix(var(--text) 25%)` ≥ 3:1 both modes;
aria labels on every control; `aria-pressed`/`aria-live` where state changes;
alt text on content images (decorative pairs stay `alt=""`); all motion
once-only and `prefers-reduced-motion`-gated; `background-attachment: fixed`
is banned on touch.

## 10. Verification protocol

`npx tsc --noEmit` → `npx eslint .` → `npx vitest run` (the homepage canaries
`homepage-adoption.test.ts` + `rtl-typography.test.ts` pin structure, copy,
recipes, and RTL law) → `python3 scripts/v1_contrast_matrix.py` (WCAG gates) →
`npx next build` → live visual pass (EN/AR × light/dark × desktop/mobile).
