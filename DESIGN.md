# Alkemos — Design System Documentation

> **Last updated:** 2026-09-25 (**المرحلة 275 — VRD-V6**: §2 مرآتا design-tokens.ts/DESIGN_SYSTEM.md + §5 وصفات V6 (btn-chrome bevel · btn-outline 72% · hero-pill · evo-console · split-rail) + §7.1 زرا 270 وثلاثية المنصة + §7.4 العضويات الفعلية بشريط الكوتشينج الفاتح)
> living-product homepage: in-page calculator + EVO demo + interactive
> library; §7.1/§7.1.2/§7.4/§7.4.1/§7.4.2 added or updated to the new page)
> **Status:** Active — binding reference for all UI/UX decisions
> **Audience:** AI agents, developers, designers
> **Redesign record:** `docs/VISUAL-REDESIGN-AUDIT-2026-09-23.md` (audit +
> wave plan + owner decisions). This file describes the RESULTING system.

---

## 1. Design Philosophy

Alkemos runs the **«Marble & Chrome»** identity (owner directive, Phase
126; warm retune VRD-V1 2026-09-23): a monochrome warm-neutral system —
warm ivory / warm graphite surfaces, chrome-gradient metal accents,
machined 1px card edges — rendered with modern layout discipline. Light
and dark are equal citizens. The ONLY chromatic exception is `--ai`
cyan, reserved strictly for AI-assistant surfaces.

Core laws:

1. **Monochrome by default** — `--bg` / `--text` / `--muted` + the chrome
   gradient carry the whole design. No blue/green/purple UI accents
   outside semantic status colors deep inside the app
   (destructive/success/warning on authenticated surfaces only).
2. **Zero emoji in DOM** on marketing + hub surfaces — icons come from the
   owner's engraved icon sheets (see §6).
3. **Theme parity** — light and dark are the SAME structure, only tokens
   flip (`[data-theme="dark"]`). No element may exist in one theme only.
4. **Zero pure-black / pure-white borders** — borders use `--edge` /
   `--chrome-edge`, never `#000`/`#fff`.
5. **Performance** — fixed-ratio media (no CLS), WebP method=6, no heavy
   animations, `prefers-reduced-motion` respected.
6. **Owner artwork is exempt from the palette law** — the owner's
   generated banners/hero art (some dark banners lean cool) are art, not
   UI accents; they ship as delivered and are never color-corrected.

---

## 2. Source-of-Truth Architecture (VRD-V5, audit C-18 closure)

There is exactly ONE stylesheet — `src/app/globals.css` — and ONE token
structure. The dual `:root` generations (Apple-style + Marble & Chrome)
that coexisted before V5 are gone; the dead `.dark` indigo block is
deleted (nothing ever set `class="dark"` — the theme engine is the
`data-theme` attribute). Every token is now defined exactly once:

| Layer | Contents |
|---|---|
| `@theme inline` | Tailwind v4 theme mappings: radius scale, font stacks, `--color-*` → token vars. Chart mappings removed in V5 (zero consumers). |
| **shadcn/ui compatibility `:root`** | `--radius`, `--primary`(+fg), `--destructive/success/warning/gold`(+fg), `--gradient-primary`, `--shadow-glow`, `--shadow-card` — the only survivors of the retired Apple generation, values byte-identical (V5 was a dead-code sweep, not a re-theme). Consumed by `ui/*` components + app views via `@theme inline`. |
| **Marble & Chrome `:root`** | The identity tokens (§3). Wins the cascade for every shared name (`--background/--card/--muted/--ring/…`). |
| `[data-theme="dark"]` | The dark values for both identity + shadcn-mapped names (identity tokens flip; compat tokens inherit from `:root`). |
| Recipes | `.btn-chrome` / `.btn-outline` / `.marble-card` / `.seal-chip` / `.chrome-text` / `.chips-row` / `.hero-*` / `.navbar-chrome` / `.footer-*` / `.mhe-cookie-bar` / `.evo-*` / dark shim / unlayered RTL block / live utilities (`shadow-glow`, `shadow-card`, `shadow-soft`, `shadow-soft-glow`, `text-gradient`, `bg-gradient-primary`, `card-hover`, `scrollbar-thin`, marquee, `animate-fade-up`). |

**Tailwind is CSS-first (v4).** `tailwind.config.ts` was deleted in V5
(dead-by-construction: no `@config` anywhere; `components.json` points at
`globals.css`). Do NOT recreate a config file — extend via `@theme` /
`@utility` in `globals.css` only.

**VRD-V6 mirrors (owner directive 2026-09-25):** the typed token registry
lives at `src/styles/design-tokens.ts` and the full implementation-facing
design-system reference at `src/docs/DESIGN_SYSTEM.md` — both mirror this
architecture; `globals.css` stays the runtime single source (drift between
the three is a defect — fix in the same commit).

(`tailwindcss-animate` in
package.json is likewise vestigial — the live plugin import is
`tw-animate-css` at the top of globals.css.)

**`--primary` is Apple blue — on app/UI surfaces ONLY.** This is
pre-existing, out of the marketing identity's scope: marketing anchors
are `--muted-2`, CTAs are `.btn-chrome`/`.btn-outline`, focus rings are
graphite. A future app-surface restyle may retire it; until then it
stays byte-stable (its consumers include `ui/button`, `ui/switch`,
`HealthMetricsDashboard`, hover borders on muscles/equipment/collections
pages, and the `.sr-only-focusable` skip link).

**Dead-utility tombstones live as comments in globals.css** — the V5
removal set (glass, glass-gold, gradient-border, grid-bg, neon-text,
text-shimmer, the gold-pulse/neon-flicker/float-up/pulse-ring/shimmer
keyframes, shadow-gold, shadow-soft-lg, transition-smooth/fast/slow,
animate-fade-in/-in-up, scroll-hidden, skeleton-shimmer, .hero-seals,
.cmp-details, .tap-target, .no-print, chart tokens) is enumerated there
with the grep standard: a selector ships only with a consumer.

---

## 3. Identity Tokens (globals.css — single source of truth)

### 3.1 Core palette (VRD-V1 warm retune)

| Variable | Light | Dark | Usage |
|---|---|---|---|
| `--bg` | `#FAF8F5` | `#12100E` | Page background (warm ivory / warm graphite) |
| `--text` | `#201D1A` | `#F4F1EC` | Primary text / solid action color (warm ink) |
| `--muted` / `--muted-foreground` | `#6E675E` | `#A8A199` | Secondary text |
| `--muted-2` | `#4E4840` | `#C6C0B8` | Body copy on tinted surfaces |
| `--tint` | `#F1EDE7` | `#1A1714` | Soft section / chip background (perceptible alternation in BOTH modes — ΔL* 3.75/3.18) |
| `--card` | `#ffffff` | `#1B1815` | Card surface |
| `--edge` | `#E5DFD6` | `#2E2A25` | Hairline borders |
| `--card-inner-hl` | `inset 0 1px 0 rgba(255,255,255,.5)` | `inset 0 1px 0 rgba(255,255,255,.06)` | 1px machined top edge (marble replacement) |
| `--shadow` | `0 8px 24px rgba(32,29,26,.07)` | `0 0 0 1px rgba(255,255,255,.04), 0 12px 32px rgba(0,0,0,.5)` | Card / chrome-pill base shadow |
| `--shadow-lift` | `0 14px 32px -8px rgba(32,29,26,.16)` | `0 0 0 1px rgba(255,255,255,.06), 0 18px 40px -10px rgba(0,0,0,.65)` | Interactive-card hover deepening (VRD-V3) |
| `--ai` | `#38C7FF` | `#45D6FF` | **AI-assistant elements ONLY** |

The shadcn-mapped names (`--background/--card/--popover/--secondary/
--muted/--accent/--border/--input/--ring/--sidebar*`) carry the same
values inside the Marble & Chrome generation (light) and its dark block
— so `ui/*` components theme automatically with the identity.

### 3.2 Chrome system

| Variable | Light | Dark |
|---|---|---|
| `--chrome` | `linear-gradient(145deg,#FDFDFD 0%,#CFCBC3 35%,#8E8A82 50%,#E9E6E0 70%,#A09C94 100%)` | same (mode-invariant) |
| `--chrome-hover` | `linear-gradient(145deg,#FFFFFF 0%,#D8D4CC 35%,#98948C 50%,#F0EDE7 70%,#A8A49C 100%)` | same |
| `--chrome-edge` | `#837F77` | `#4A463F` |
| `--border-chrome` | `1px solid #CEC9C0` | `1px solid #3A362F` |
| `--radius-chrome` | `14px` | `14px` |

Every chrome stop is warm (coldest `#8E8A82`), so the metal belongs to
the same family as the ivory/graphite ramp. The `.btn-chrome` label ink
is `#1C1710` (≥5.18:1 on every stop, both modes); dark mode adds a
hairline warm-white ring + deeper drop so the pill reads machined — not
washed out — on graphite.

### 3.3 Artwork-backed tokens

`--hero-img`, `--meander-img`, `--prog-backdrop`, `--navbar-bg` — CSS
`url()`/color pairs that flip with the theme (zero hydration flicker;
the browser swaps by `data-theme`, no JS image-src churn). `--marble-img`
was retired in VRD-V1; its asset files were deleted in V5 after the
cache-law window (§6).

### 3.4 Theme engine

- `data-theme="light|dark"` on `<html>`, stamped pre-paint by the
  `#alkemos-theme-init` inline script (root layout) — manual choice
  (localStorage `alkemos-theme`) or OS `prefers-color-scheme`.
- `ThemeToggle` cycles light → dark → system and follows the OS live
  while in system mode.
- Tailwind's `dark:` variant is keyed to a `.dark` class
  (`@custom-variant`) that nothing sets — do NOT rely on `dark:`
  utilities for theming; use `data-theme` selectors or tokens. (Legacy
  `dark:` classes on compare pages are inert by long-standing state.)
- `--ai` cyan is EXCLUSIVELY for AI surfaces (EVO widget/chat/glow
  ring). Never use it for links, CTAs, or decoration.

### 3.5 Dark-compatibility shim (Phase 126)

Legacy Apple-light utility classes on secondary surfaces
(`bg-white`, `bg-[#f5f5f7]`, `text-[#1d1d1f]`, `text-[#6e6e73]`,
`border-[#d2d2d7]`) are remapped to identity tokens **in dark mode only**
(globals.css). Light mode is untouched. New code MUST NOT use these
classes — use the `var(--…)` tokens directly.

---

## 4. Typography

### Font Families

| Context | Font Family | Source |
|---|---|---|
| Display (headings, EN) | **Playfair Display** 500/600/700 | `next/font/google` → `--font-display` |
| Body (EN) | **Inter** | `next/font/google` → `--font-sans` |
| Arabic | **Cairo** | `next/font/google` → `--font-arabic` (Arabic never uses the serif) |

The lapidary serif (`font-display` / default `h1–h4`) is the "engraved in
stone" voice. Arabic headings keep Cairo per owner directive — Arabic
readability beats stylistic mirroring.

> **RTL typography law (VRD-V0, audit C-1/C-2/C-3):** the RTL heading
> rules live in **UNLAYERED CSS** in `globals.css` (after `@layer
> base`), not in the base layer — Tailwind v4's utilities layer always
> beats `@layer base`. Unlayered rules win by cascade position: Cairo
> 700, `letter-spacing: 0`, line-height 1.35 (h1) / 1.4 (h2) / 1.45
> (h3-h4). Cairo is also appended to the `--font-display` stack (after
> Playfair, before Inter) so any Arabic glyph inside a display element
> resolves to Cairo. EN/LTR rendering is untouched. Guarded by
> `src/lib/__tests__/rtl-typography.test.ts`.

### Font Sizes (Tailwind scale)

| Element | Mobile | Desktop |
|---|---|---|
| Hero title | `text-4xl` | `md:text-6xl lg:text-7xl` |
| Page title (h1) | `text-3xl` | `md:text-5xl` |
| Section title (h2) | `text-2xl/3xl` | `md:text-4xl` (36px — do NOT shrink; §23.1 of the audit) |
| Card title (h3) | `text-lg` | `text-lg` |
| Body text | `text-sm/base` | `text-base/lg` |

### Font Weights

Normal (400) body · Semibold (600) titles & chrome buttons · Bold (700)
prices/stat numbers.

---

## 5. Core Recipes (CSS classes in globals.css)

| Class | Recipe | Use |
|---|---|---|
| `.btn-chrome` | chrome gradient bg + `#1C1710` warm-ink text + 1px `--chrome-edge` + radius 999px + 600 weight + `--shadow`; **VRD-V6 machined bevel**: `inset 0 1px 0` bright top edge + `inset 0 -1px 0` dark bottom edge (pressed-metal affordance), hover deepens to `--shadow-lift`; dark mode adds a hairline warm-white ring. **Sizing standard (VRD-V3 §13.2): 48px touch / 52px md+** (min-height floors in the recipe — paddings only feed the floor) | ALL primary CTAs |
| `.btn-outline` | translucent `--card` fill (**VRD-V6: 72%** + blur 6px — survives hero artwork) + 1px `--text` border + `--text` + radius 999px. **44px touch / 48px md+** | Secondary CTAs |
| `.marble-card` | `--card` bg + `--border-chrome` + radius 14 + `--shadow` + 1px machined inner top-edge highlight (`--card-inner-hl`). Name is historical (marble is gone); 123+ usages | Every card surface |
| `.marble-card--unclipped` | `overflow: visible` escape hatch for cards hosting absolute popovers (Phase 154) | Popover hosts |
| `.marble-card.card-lift` | Unified INTERACTIVE-card hover: 2px lift + `--shadow-lift` + firmer warm-graphite hairline (`color-mix(--text 22%)`) · 200ms ease · disabled under `prefers-reduced-motion`. Only on truly interactive cards — static containers never lift | Interactive cards' hover |
| `.seal-chip` | chrome-border pill, small-caps tracking, `--muted-foreground`, translucent card bg (55% wash; 85% when directly on artwork) | Stat seals, tags, badges |
| `.chrome-text` | Light theme = dark warm-steel ramp (lightest stop ≈ 10:1 on ivory); dark theme = lightened warm ramp. `.chrome-text-on-dark` pins the light ramp on both-theme dark cards (Pro/Coaching) | Numbers, prices, "Learn more ›" links |
| `.meander-divider` | Greek-key band, repeat-x, 28px, opacity .85 (light Greek identity — kept by owner direction) | Section separators |
| `.footer-meander-top` | Same band as the footer's top strip | Footer top |
| `.navbar-chrome` | sticky, `--navbar-bg` (alpha 0.85) + blur(12px) + chrome bottom border; desktop nav items px-3.5 + gap-1 — 64px bar | Site header |
| `.hero-art` / `.hero-bg` | Unified overlay — artwork = absolute cover layer (ThemeImg pair), content centered INSIDE it. Phones: `max(56vh, natural)` stage floor; tablet→wide: natural artwork height; aspect > 1501/1000: 92vh | Homepage hero |
| `.hero-copy` | Theme-aware text-shadow halo for copy over artwork details — a glyph edge, NOT a veil | Hero H1 + subtitle |
| `.chips-row` | ONE horizontal scroll-snap row on touch — `nowrap` + `scroll-snap-type: x proximity` + symmetric 24px edge fade masks (RTL-safe) + chips `flex-shrink: 0 · white-space: nowrap`; md+ reverts to the centered wrap | Muscle-group browse chips |
| `.footer-marble` | Structural band: light = `--tint` + `--edge` top hairline; dark = deeper step `#0E0C0A` (name historical) | Site footer |
| `.mhe-cookie-bar` | Theme-aware GLASS — `color-mix(--card 92% light / 88% dark, transparent)` + `backdrop-filter: blur(16px)`; solid-card `@supports` fallback; SSR-first-paint + `data-mhe-consent-ok` pre-paint hide + body no-cover padding | Cookie consent bar |
| `.evo-hero-card` / `.evo-art-mask` | EVO section card — text left, warrior art right with a mask fade into the card; `[dir=rtl]` flips the mask (image never flipped) | Homepage EVO section |
| `.evo-console` | **VRD-V6** — the homepage EVO demo exchange as an IN-PRODUCT surface: tint-glass panel (60% wash) + `--edge` hairline + inner highlight; bubbles inside pop to card level; cyan stays off the panel (`.ai-ring` on the avatar only) | Homepage EVO demo |
| `.hero-pill` | **VRD-V6** — the hero platform-trio glass pills (Training / Nutrition / Smart Planning): `--card` 72% + blur(6px) + `color-mix(--text 30%)` hairline, 13px/600, NON-interactive (two-button law intact) | Hero platform chips |
| `.split-rail` / `.split-seg--*` | **VRD-V6** — the diet-card macro split as one 6px machined rail; segments = `color-mix(--text 88/58/32%)` (auto theme-inverting), widths from the real `system.split` ratio; the exact numbers stay as text beneath | Diet-plan cards |
| `.card-hover` | 4px lift + soft shadow (300ms, reduced-motion-safe) | Food/exercise/program explorer cards |
| `.scrollbar-thin` | Warm-graphite thin scrollbar (6px) | Long in-app lists |

**Buttons law:** there are exactly TWO button styles on marketing/hub
surfaces — `.btn-chrome` (primary) and `.btn-outline` (secondary). No
blue buttons, no gradients besides chrome. `ui/button` (shadcn) is an
app-surface component and does not appear on marketing pages.

---

## 6. Brand Asset System (`public/images/brand/`)

All artwork comes from the owner's generated sets (v3 upload — the source
directory lives outside the repo; the committed assets were rebuilt at
Phase 127 by local-only scripts never committed to this repo:
`build_assets_v3.py` + `build_assets_v127.py` + `fix_hero_logo2.py` —
documented as history so they are not requested later):

| Asset | Purpose |
|---|---|
| `hero-light/dark.webp` (1280×713) + `-640/-828` srcSet | Homepage hero background — logo scrubbed off the artwork: the chrome logo is an HTML element |
| `logo-hero-light/dark.webp` (760px, +256/512 variants) | Silver-chrome hero lockup — HTML element, upper-center |
| `logo-navbar-light/dark.png` | Horizontal navbar logo (36px height) |
| `logo-footer-white/black.png` | Mono lockups for dark/light footer (ThemeImg pair) |
| `mark-helmet.png` | Helmet mark (favicon set, comparison-table column head) |
| `header-{section}-{light,dark}.webp` (1280×477) | The owner's 12 PAGE banners (tools / exercises / programs / foods / blog / pricing) via `<PageBanner section="…" />` atop each hub page |
| `evo-card-light/dark.webp` | Programs-card stadium backdrop (12% blur) + EVO page art |
| `evo-hero-light/dark.webp` (640×675, +400/512) | EVO section warrior crop |
| `evo-widget-light/dark.webp` (480×480) | Widget/avatar bust |
| `evo-character.webp` | Full EVO character art |
| `divider-meander-light/dark.webp` | Greek-key repeating band (meander divider + footer top) |
| `icons/<name>-{light,dark}.webp` (200×200) | **38 engraved icons** — the ONLY icon set on marketing/hub surfaces |

**Deleted in VRD-V5:** `texture-marble-light/dark.webp` — retired from
CSS in V1 (marble removal, owner order); the files were kept through the
cache-law window (V2→V4 production cycles) and removed once no cached
HTML could reference them. Do NOT reintroduce marble textures.

### Icon usage

- `EngravedIcon name="calories"` renders the light+dark pair (CSS picks).
- Lucide icons remain INSIDE the logged-in app only (drawer, dashboard).
- Category emoji fallbacks were removed in Phase 127 (zero-emoji law).

### Cache law (Phase 128)

Brand artwork files CHANGE CONTENT between phases but KEEP their
filenames — so they must NEVER be long-cached in browsers:

- `/images/brand/*` and `/sw.js` → `Cache-Control: public, max-age=0,
  must-revalidate` (next.config.ts + vercel.json; the brand rule comes
  after the generic `/images/*` rule so it wins).
- Other `/images/*` → `public, max-age=86400` (no `immutable`, no 1-year).
- `/_next/static/*` stays `immutable` 1-year (content-hashed — safe).
- `sw.js` itself is registered as `/sw.js?v=N` (bump with CACHE_VERSION)
  so SW updates jump over any stale HTTP-cache copy.
- **Asset deletion corollary (V5):** an asset unreferenced by CSS may be
  deleted only after enough production cycles have passed that no cached
  HTML can still reference it (one CDN `s-maxage` window per deploy, at
  minimum); grep the codebase first.

---

## 7. Page Recipes

### 7.1 Homepage hero

ONE mode at every viewport: the artwork is an absolutely-positioned
COVER layer (`.hero-bg`, ThemeImg pair, eager LCP) with the content —
chrome logo lockup (`w-32` mobile → `w-64` desktop) → serif H1
(`.hero-copy` halo) → subtitle → CTA pair — centered INSIDE it.

**Hero copy pair (HOME-EXPERIENCE-269 — the H1 message-matches the SERP
snippets; the subtitle points AT the living experience):**
- EN: «Train smarter. Eat with precision.» · sub: «One platform for
  training, nutrition, and smart planning — with EVO, your AI coach,
  built in. Try it right on this page, in Arabic and English.»
- AR: «تدرّب بذكاء. وتغذَّ بدقة.» · sub: «منصة واحدة تجمع التدريب
  والتغذية والتخطيط الذكي — ومعها EVO، مدربك بالذكاء الاصطناعي.
  جرّبها الآن في هذه الصفحة، بالعربية والإنجليزية.»

**Proof strip (§7.1.1):** directly under the hero — an `--tint` band
with a hairline top/bottom edge carrying FOUR auditable stat tiles
(engraved icon + `.chrome-text` number + label): EX_PLUS exercises /
FOODS_PLUS foods / TOOLS_COUNT free tools / the 10-message daily EVO
limit. Every value rides a verified constant — the page invents
nothing (the Freeletics/MyFitnessPal proof-under-promise pattern).
HOME-EXPERIENCE-269: the numbers COUNT UP once when the strip enters
the view (`.CountUp` — rAF ease-out, SSR renders the final value,
reduced-motion stands down) — the page's first heartbeat.

**CTA pair (HOME-REFINE-270 R1 — the current law):** exactly TWO
side-by-side CTAs — `.btn-chrome` «Log in / Sign up» →
`/auth?mode=signup` (signed-in members: their dashboard) +
`.btn-outline` «Premium memberships» → `/memberships`. On touch the
pair STACKS full-width (no mis-tap risk beside the artwork); md+
keeps the single centered row.

**Platform trio (VRD-V6):** between the subtitle and the CTA pair,
three NON-interactive `.hero-pill` glass chips — Training /
التدريب (dumbbell) · Nutrition / التغذية (protein) · Smart Planning /
التخطيط الذكي (macros) — so the hero reads as the integrated
Fitness + Nutrition + AI platform, never as an EVO service page. The
pills are a semantic list (NOT links): the two-button law stays
exact. Labels mirror the header SERVICE_NAV vocabulary.

### 7.1.2 The living product (`#start` — HOME-EXPERIENCE-269)

The page's heart: THREE real product surfaces running in-page inside
one `marble-card--unclipped` slab, switched by the `.home-tabs` rail
(Apple-style underline tabs, 44px rows, scrollable on touch):

1. **Calculate your numbers** — the REAL calorie/macro calculator.
   The math flows from `src/lib/fitness-math.ts` (the single source
   the /tools/calorie-calculator app tool also imports — the two
   surfaces can never drift). Inputs: gender + age/weight/height
   trio + activity + goal (the tool's own labels). The result panel
   answers with a `.chrome-text` target number + three `.macro-track`
   chrome bars (relative to the result's largest macro) + the honest
   math note + the benefit ladder CTAs («Build my plan around these»
   → the AI planner · «Save this in a free account» → signup).
2. **Ask EVO** — a LABELED illustrative conversation (4 turns, native
   AR/EN pairs — never a translation): user goal → EVO answers with
   real numbers → user context → EVO adjusts. The hand-off CTA
   «Continue this conversation» dispatches `openEvoFloatingChat()`
   (the CHAT SURFACE LAW holds — this is a demonstration, never a
   second input). The panel carries the `.live-dot` presence pulse
   (lawful `--ai` cyan — an AI surface).
3. **Browse exercises** — the interactive muscle-group browser:
   `.chips-row` (the seven families, live counts) + the real curated
   samples (15 slugs, 2+ per family) filtered client-side by
   `categorySlug` with the `.swap-fade` crossfade on every switch.
   The exercise GRID lives HERE now — no two homepage sections share
   a skeleton.

Height floors: phones `max(56vh, 100vw×713/1280)`; tablet→wide
`100vw × 713/1280`; aspect > 1501/1000: `92vh`. Luminance law: the
artwork center is clean in BOTH themes (bright light / near-black dark)
→ no veil ever; verify any new artwork the same way before shipping.

**Navbar bar:** `[menu][theme] …… logo …… [lang][bell][account]` — the
theme toggle lives on the MENU side; RTL mirrors automatically.

### 7.2 Hub page header

`<SiteHeader variant="landing" />` → `<main>` opens with
`<PageBanner section="{tools|exercises|programs|foods|blog|pricing}" />`
(a 1280×477 owner artwork strip in a marble-card frame, `mb-10`) → h1 +
subline. Works in server components (plain `<img>` pair).

### 7.3 Intelligence section (AI planners + EVO)

One full-width `marble-card.evo-hero-card` (merged by HOME-REBUILD-258
— the retired standalone Plan section folded into the EVO card): text
column left — seal chip «SMART PLANNING + EVO» → H2 → the three
numbered steps (inputs → plan → adjustments) → the quota-transparency
box (the real free-tier facts: monthly AI-plan allowance + 10 EVO
messages/day, no account needed to try) → CTA rows (chrome «Create My
Plan» → /ai-meal-planner · outline «AI Workout Planner ›» · the
widget-opening «Try EVO» with the avatar bust · quiet link → /evo) —
warrior art absolutely positioned on the inline-end side fading into
the surface via `.evo-art-mask`; `[dir=rtl]` flips the mask (image
never flipped). Card min-height 220px mobile / 260px desktop. The
floating EVO widget stays the chat entry point.

### 7.4 Memberships cards (homepage — HOME-REFINE-270 R7 + VRD-V6)

The compact treatment: THREE small cards in an `sm:grid-cols-3` row
— **Free** (`marble-card card-lift` → signup; «Start free ›») /
**Premium** (the RECOMMENDED anchor: dark `#0B0B0D` + 2px chrome
gradient ring + the «Recommended» seal straddling the top border —
the section's ONLY dark card, VRD-V6) / **Pro** (`marble-card
card-lift` «See details ›»)
— followed by the **online-coaching service band**: a LIGHT band
(`--tint` + `--edge` hairline, VRD-V6 — the old dark-marble fill was
retired so Premium stays the single dark anchor) carrying the
section's ONE filled `.btn-chrome` CTA → `/coaching`.
**Prices derive from memberships.ts lookups — never literals** (the
single-source law the canaries pin). A quiet refund line closes the
section (the REAL 7-day conditional refund, refund.ts).
`/memberships` keeps its own three-card layout.

### 7.4.1 The interactive plate (`#eat` — HOME-EXPERIENCE-269)

The food database made touchable: an `aria-live` result panel (the
`.macro-track` chrome bars + a DERIVED contextual sentence built from
the real per-100g numbers — never hand-written claims) beside a grid
of tappable food selector cards (the §11 macro-grid recipe; the
selected card carries the ink ring + `--shadow-lift`). Selection
swaps with `.swap-fade`; the panel CTA opens the food's detail page.

### 7.4.2 Living-page motion + interaction layer (HOME-EXPERIENCE-269)

The recipes live in globals.css under the HOME-EXPERIENCE-269 block:
`.rv` (once-only scroll-reveal transition — armed ONLY post-mount in
React state so SSR/no-JS users always see content, transform/opacity
only = zero CLS, 1.8s failsafe timer guarantees nothing stays hidden
in any environment), `.home-tabs`/`.home-tab` (underline tab rail,
aria-selected driven), `.macro-track`/`.macro-fill` (chrome macro
bars), `.live-dot` (the `--ai` presence pulse — AI surfaces only),
`.swap-fade` (the 250ms content-swap crossfade). EVERY motion recipe
stands down under `prefers-reduced-motion` (the vestibular-safety
law); the retired pre-258 jarring reveal is structurally impossible
here (no layout animation, no re-trigger, no SSR-hidden state).

### 7.5 Comparison tables

**ONE real `<table>` at every breakpoint (Phase 131):** 4 columns
(Feature / Alkemos / Traditional trainer / Free apps), Alkemos column
highlighted with `--tint` + `--border-chrome` inset; "yes" = engraved
`checkseal` icon; "no" = muted `×` at opacity .5. Below md the table
compacts itself (`text-xs`, `p-2.5` cells) so the grid stays readable —
cards are NEVER used. (The old `.cmp-details` disclosure wrapper is
gone — class deleted in V5 with zero consumers.)

### 7.6 Footer (structural band + responsive disclosure)

`.footer-marble` is a clean structural band (`--tint` + `--edge`
hairline light / deeper step `#0E0C0A` dark), the meander top band
stays, the lockup is the ThemeImg pair, headings `var(--text)` 11px/600,
links `var(--muted-2)` 13px / leading-7 → hover `var(--text)` (+
underline). Below `lg` the five service lists collapse into TWO native
`<details>` disclosure groups with 44px summary rows, zero JS, SSR-
rendered, keyboard-native (collapsed footer: 668px). At `lg+` the flat
six-column service map renders from a separate lg-only grid. Every link
exists in BOTH copies with the exact same href: the **href-sync law**
(each footer href exactly ×2 in `SiteFooter.tsx`) is canary-pinned.
The bottom credit line stays centered under the newsletter block
(VRD-V4 K-4: EN "Crafted with care for the fitness community" · AR
«صُنع بعناية لمجتمع اللياقة»).

### 7.7 Secondary pages (Phase 132 rollout + VRD inheritance)

All public surfaces ride the identity: about/privacy/terms/faq
(StaticPageView), contact, coaching, EVO, for-coaches, coach landing
pages, affiliate program + toolkit, checkout, meal-planner, the 5 tool
result pages, auth, blog article page, and the shared surfaces
(CookieConsent, ShareButtons, OtherTools, PageBottomPromo,
LeadCaptureCard, Pagination, CopyButton). Recipe: `bg-[var(--bg)]
text-[var(--text)]` root · `marble-card` cards · `seal-chip` eyebrows ·
`btn-chrome`/`btn-outline` CTAs · `chrome-text` stat numbers · engraved
icons (zero-emoji law) · dark premium bands are `bg-black` + 2px chrome
ring in BOTH themes with pinned light-on-dark text · the global anchor
rule is `var(--muted-2)` (zero-blue law) · `::selection` neutral
graphite. Semantic colors (destructive/success/warning) and
social-platform brand icons keep their conventional hues.

Authenticated app surfaces (dashboard/coach/admin/referral) still ride
the Phase-126 dark shim + the shadcn-compat tokens (§2); their
light-mode restyle is future work, out of the redesign program's scope.

---

## 8. Bilingual Support (EN/AR)

- Full RTL mirroring via `dir="rtl"` + logical properties
  (`ps/pe/ms/me`, `start/end`, `inset-inline-end`). The EVO card art and
  mask flip with `[dir=rtl]`; carousel arrows are mirrored; the chips
  row scroll direction follows the language.
- **Logo lockups stay LTR** (brand artwork is language-neutral).
- Arabic keeps Cairo at the same type scale; no serif for Arabic.
- AR mirrors: `/ar/{exercises,foods,programs,blog,memberships,…}` share
  the EN components with `lang="ar"` — banners/theme/logo pairs are
  language-independent.
- **Copy register (VRD-V4):** MSA-clean, no mechanical pseudo-plurals
  («توليد خطط أكثر» not «توليدات»), no salesy «الآن» on quiet CTAs
  («اشترك مجانًا»), plain muscle register («كور», matching
  بايسبس/ترايسبس) — enforced by the marketing-MSA canaries. EN and AR
  copy are independent, mirror-meaning pairs (not literal).

---

## 9. Performance Patterns

- Hero artworks preloaded in the root layout (no CLS — the artwork layer
  is absolutely positioned; the logo keeps fixed CSS width); the
  `.hero-bg` `<img>` is eager (LCP).
- Theme image pairs: both variants in DOM, CSS shows one — zero JS churn.
- Hub page banners lazy-decode; engraved icons `loading="lazy"`.
- Server components render grids/pills/pagination (explorers) — client
  JS only for search/filter islands.
- All brand raster shipped as WebP method=6 (sources 1.5–2MB → 20–130KB).
- The cookie bar paints with first paint (SSR) — `contain: layout style`
  bounds its work; it never competes for LCP.

---

## 10. Verification Protocol

Before any UI change ships:

1. **Structure parity** light vs dark (same DOM, tokens flip only).
2. **Zero emoji** in rendered DOM on marketing/hub surfaces.
3. **No legacy accent colors** — `#0071e3`, `#34c759`, `#8b5cf6` and the
   indigo `rgba(99,102,241)` family must not appear on hub/marketing
   surfaces (grep the diff; `--ai` cyan and owner artwork are the only
   exemptions).
4. **Contrast matrix** — `python3 scripts/v1_contrast_matrix.py` must be
   green (text ≥4.5:1, chrome stops ≥4.5:1, focus ring ≥3:1, alternation
   ΔL* ≥2.8, cookie-glass worst case) in BOTH modes.
5. **Canary law** — any copy/structure change lands with its test re-pin
   in the SAME commit (homepage-adoption, marketing-msa,
   ai-meal-planner, rtl-typography).
6. **VLM screenshot pass** — 6 contexts (EN/AR × light/dark × 1440/390)
   against the owner's preview references. VLM verdicts on OWNER
   ARTWORK palette are informational, not gates (§1 law 6).
7. **Dead-code sweeps** (C-18 discipline): a selector may be deleted
   only with grep proof of zero consumers (code + tests), and the wave
   must prove rendering equivalence — capture the same page matrix from
   before/after builds and pixel-diff (severity threshold: no pixel with
   channel delta >8 beyond animation-timing noise; V5 used
   `/home/z/my-project/scripts/v5_equivalence.py` as the template).
8. **Full gate suite:** `tsc` 0 · `eslint` 0 · `vitest run` ·
   `next build` · `docs_audit.py` · `docs_parity.py` ·
   `migration_audit.py` · `check-stale-refs.sh` · `check-ui-wiring.sh`.
9. **Live smoke:** all homepage-linked routes 200, both languages;
   production checks bust the Cloudflare cache with `?cb=<timestamp>`.
