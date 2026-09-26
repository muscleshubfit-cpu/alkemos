# Alkemos Design System — «Ember & Ink»

> **Status:** LIVE — the binding design-system reference for implementation work.
> **Provenance:** owner directive 2026-09-26 (EMBER-INK-279) — «نفّذ إعادة تصميم
> واجهة Alkemos باستخدام قالب 1devtool landing-fitness-studio كأساس التصميم
> الفعلي» — the template is the BASELINE, not inspiration. Prior provenance
> 2026-09-25 (VRD-V6) built `design-tokens.ts`/`DESIGN_SYSTEM.md`; this frame
> transplants the template onto that skeleton.
> **Hierarchy:** this file documents the REAL implementation. The runtime single
> source of truth is `src/app/globals.css` (tokens) + the recipe classes; the
> typed mirror is `src/styles/design-tokens.ts`. `DESIGN.md` (repo root) remains
> the condensed binding law doc — on conflict, **code wins** (AGENTS.md §12.8).
> **Identity law (owner, 2026-09-26):** the 1devtool **landing-fitness-studio**
> template — **ink `#08080A` ground, cream `#F7F3EC` text, ember `#FF4D26` /
> `#FF9353` accents, acid `#D7FF4D` for tiny live-state marks, Sora display +
> Outfit body (Cairo for Arabic), rounded-3xl glass cards, the marquee /
> glow-ember / noise / dot-pulse recipes**. The identity is DARK-ONLY (the
> template has one look; both `data-theme` values resolve to it). The `--ai`
> cyan lives on AI-assistant surfaces ONLY. The Alkemos logo pair + the hero
> artwork pair are the ONLY carried-over brand assets.

---

## 1. Philosophy

**Cinematic, high-energy, coach-led.** The template's language: a near-black
ink stage with an ambient ember glow and a fine noise film; cream text in Sora
bold display sizes; ember-gradient pills for the moments that matter; glass
cards (`white/10` hairline + `white/[0.04]` wash + backdrop blur) on 24px
radii; the marquee ticker and dot-pulse live badges for motion. Depth comes
from glow + translucency, not texture. The identity is dark-only. Arabic (RTL)
and English (LTR) are independent native pairs at the same quality level, not
translations of a template (Cairo rides every Arabic run).

## 2. Tokens (mirror of `globals.css`)

### 2.1 Surfaces & inks

| Token | Value (BOTH modes — dark-only) | Role |
|---|---|---|
| `--bg` | `#08080A` | canvas (the template's ink) |
| `--text` | `#F7F3EC` | primary ink (the template's cream) |
| `--muted-foreground` | `#9A968F` | secondary copy (≥6:1 everywhere) |
| `--muted-2` | `#C2BEB6` | marketing anchors / footer links |
| `--tint` | `#17171C` | alternating section band (the template's surface-2) |
| `--card` | `#0F0F12` | card surface (the template's surface) |
| `--edge` | `#26262D` | hairline border (the template's line) |
| `--shadow` | `0 8px 24px rgba(0,0,0,.35)` | resting cards |
| `--shadow-lift` | `0 14px 32px -8px rgba(0,0,0,.55)` | hover elevation |
| `--card-inner-hl` | `inset 0 1px 0 rgba(255,255,255,.06)` | machined top edge |
| `--ember` / `--ember-2` | `#FF4D26` / `#FF9353` | the template accent pair |
| `--acid` | `#D7FF4D` | live-state marks only |
| `--ink` / `--surface` / `--surface-2` / `--line` / `--cream` | template aliases | direct template-recipe reuse |

Alternation perceptibility (`--bg` vs `--tint` ΔL*) is **gated ≥ 2.8 CIE L\***
(both modes resolve identically — measured 5.71) by
`scripts/v1_contrast_matrix.py`.

### 2.2 The ember system

- **`--chrome`** pill fill — the template's ember ramp
  (`linear-gradient(90deg, #FF4D26, #FF9353)`); `--chrome-hover` shifts
  brighter (`#FF5E3A → #FFA36C`). The VRD-V7 chrome-shiny sweep is RETIRED
  with the metal recipe (dead keyframes deleted).
- **`.chrome-text`** — ember-gradient numerals (145°, worst stop `#FF4D26`
  ≥6:1 on the ink ground and on the pinned-black `#0B0B0D` cards — gated);
  `.chrome-text-on-dark` pins the same ramp.
- **`.ember-panel`** — the template's big-split-feature surface: the
  `#FF4D26 → #FF6D3D → #FF9353` gradient box, `rounded-[32px]`, dark-ink
  `#1A0E0A` copy (the EVO section rides it).
- **Pinned-black cards** — `#0B0B0D` remains the surface beneath
  `.chrome-text-on-dark` numerals (the contrast-matrix PINNED_BLACK gate).

### 2.3 The AI accent

`--ai` cyan (`#38C7FF` / `#45D6FF`) — EVO widget ring, `.ai-accent`, `.ai-ring`
on the EVO avatar, the EVO console presence pair. **Never** a marketing
identity color (the identity accent is ember; cyan stays on AI surfaces).

## 3. Typography

| Role | EN | AR (RTL) |
|---|---|---|
| Display / headings | **Sora** (`--font-display`) — bold 700, `-0.02em` | Cairo (`--font-arabic`), **weight 700, letter-spacing 0, leading 1.35–1.45** (the VRD-V0 unlayered RTL law — utilities never defeat it) |
| Body | **Outfit** (`--font-sans`, feature settings `ss01`/`cv11`) | Cairo |
| Scale | H1 hero `clamp(2.5rem,6vw,4.75rem)` bold `leading-[0.95]` · H2 sections `text-3xl→text-5xl` bold `leading-[1.05]` · body `text-sm→lg` | same scale, Cairo metrics (leading re-led by the unlayered law) |

Fonts ship via `next/font` (one variable file per family, preloaded, metric-
adjusted fallbacks — the CLS-136/216 story). Arabic body letter-spacing is
never negative (connected-script law).

## 4. Layout rhythm

- ONE content container: `max-w-6xl` (readable text columns may narrow to
  `max-w-2xl/3xl/5xl` inside; the FAQ closer rides `max-w-5xl`).
- Section beat: `py-10 md:py-20`, alternating `--bg` / `--tint` bands (the
  template's ink/surface-2 alternation through the existing band classes).
- Section header pattern (the template's split header): `.seal-chip` eyebrow +
  bold display H2 on the start side → one supporting sentence on the end side
  (`flex flex-wrap items-end justify-between gap-6`). ONE focused CTA per
  browse section.
- The homepage root carries the template's atmosphere: `glow-ember` +
  `noise` fixed overlays under all content (`isolate` root, `-z-10`).
- The Greek meander divider is RETIRED (template has none; the border-t
  section rhythm carries transitions).
- Touch targets: primary CTA 48px (52px md+), secondary 44px (48px md+),
  carousel arrows 44px on touch, every target ≥ 24px (WCAG 2.5.8).

## 5. Recipe book (the shared classes)

| Recipe | Purpose | Notes |
|---|---|---|
| `.btn-chrome` | PRIMARY action | the template's ember-gradient pill + `#1A0E0A` ink label (5.7–8.6:1 over every stop) + the ember glow drop |
| `.btn-outline` | SECONDARY action | the template's transparent pill: `white/20` hairline → hover `white/50` + `white/5` wash |
| `.hero-pill` | the hero badge / pillar chips | the template's glass badge (`white/15` + `white/5` + blur); no letter-spacing (Cairo law) |
| `.marble-card` (+`.card-lift`) | every surface card | the template's card: `--card` under a `white/[0.04]→[0.01]` wash, `white/10` hairline, 24px radius; hover = hairline → `white/30` + 2px lift |
| `.seal-chip` | eyebrow labels | the template's glass badge pill, uppercase micro-label |
| `.chrome-text` / `.chrome-text-on-dark` | ember numerals | price, counts, stats (ember 145° ramp) |
| `.ember-panel` | the big-split feature | the template's ember gradient box (EVO section) |
| `.tpl-marquee` | the marquee ticker | duplicated content set, 36s linear, RTL reverse, reduced-motion frozen |
| `.glow-ember` / `.noise` | page atmosphere | the template's radial ember wash + SVG noise film (fixed, `-z-10`) |
| `.dot-pulse` | live-presence dot | the template's 1.8s pulse |
| `.hero-glow` / `.hero-row` | the hero aside card | the ember blur blob + the session-row recipe (platform pillars) |
| `.evo-console` | EVO demo panel | tint-glass in-product console inside `.ember-panel`; cyan only on the avatar `.ai-ring` |
| `.split-rail` + `.split-seg--*` | macro split visual | diet cards; segments derive from `--text` via color-mix |
| `.macro-track` / `.macro-fill` | animated macro bars | the calculator + `#eat` explorer (the fill rides the ember ramp via `--chrome`) |
| `.chips-row` | muscle chips rail | scroll-snap single row on touch, edge fades, RTL-safe |
| `.navbar-chrome` | sticky navbar | ink glass `rgba(8,8,10,.94)` + blur(12px) saturate(150%) |
| `.footer-marble` | footer band | near-ink `#0A0A0C` + `white/5` top hairline (the template's border-t) |

## 6. Page recipes (homepage order — canary-pinned)

1. **Hero** — the TEMPLATE grid: badge pill (`.hero-pill` + `.dot-pulse`) →
   the KEPT chrome logo lockup → H1 (Sora clamp bold) → subtitle → exactly
   TWO CTAs (login/signup `.btn-chrome` + memberships `.btn-outline`) → the
   stats row (the proof strip folded in, `border-t white/10` grid); the ASIDE
   glass card carries the KEPT hero artwork (ThemeImg pair, eager LCP) + the
   three platform pillar rows (`.hero-row`) + the ONE PLATFORM row. Closes
   with the **marquee band** (`.tpl-marquee`, aria-hidden).
2. **Proof stats** — folded into the hero's template stats row: 4 auditable
   numbers (`CountUp`, SSR-honest, derived from verified constants only).
3. `#start` **Calculator** — the app's real math (`fitness-math.ts`).
4. `#evo` **EVO** — the template's big-split feature (`.ember-panel`, dark-ink
   copy): labeled 2-turn demo inside `.evo-console` + the warrior side art
   (`.evo-art-mask`); CTA dispatches `openEvoFloatingChat()` (the chat-surface
   law).
5. `#plan` **Smart Planning** — REAL generation (the unified free pool) via
   `/api/ai/workout-plan-demo` / `meal-plan-demo`; guest plans persist via
   `saveGuestPlan`.
6. `#library` **Exercise library** — interactive muscle-group browser.
7. `#eat` **Food explorer** — pick a food, per-100g numbers move.
8. `#train` / `#diet` **Ready-made programs & diet plans** — the TEMPLATE
   GRIDS: numbered program cards (ghost `01/02/03` + artwork + border-t meta
   row) and the 4-col diet cards with the macro split rail (VRD-V6). The
   carousels are retired for these two (the blog carousel stays).
9. `#learn` **Latest articles** — latest-first carousel (renders only when
   posts loaded).
10. `#memberships` **Memberships** — the TEMPLATE pricing cards: Free / Pro
    plain cards + the FEATURED Premium card (ember ring + gradient wash +
    glow + floating badge); prices still derive from `memberships.ts` (never
    literals) + the coaching service band (rounded-[32px] tint) + the 7-day
    refund fact.
11. Featured coaches (paid-ad strip, conditional — the template's coach-card
    anatomy) → `#faq` (the template's two-column closer) → the TEMPLATE
    closing CTA box (EMBER-INK-279 supersedes the 270-R8 retirement: the
    account action + the EVO hand-off, no faked email capture) →
    **SiteFooter**.

Prices always derive from `src/lib/memberships.ts` — never literals.
Counts always ride `EXERCISES_COUNT` / `FOODS_COUNT` / `TOOLS_COUNT`.

## 7. Theme engine

`data-theme="light|dark"` on `<html>`, set pre-paint by the root-shell inline
script (zero flash), three-state toggle (light/dark/system). **EMBER-INK-279:
both theme values resolve to the SAME ink/ember palette** (the template is
dark-only — one identity; the engine keeps switching so nothing breaks and
`.theme-img-pin-dark` / dark artwork pairs always win). Dual artwork runs
through `ThemeImg` (both `<img>` render; CSS `.theme-img-light/dark` picks —
zero JS, zero flicker). The light-utility shim (`bg-white` etc. → tokens) is
now MODE-INVARIANT so app surfaces hold one look.

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
