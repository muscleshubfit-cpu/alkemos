# Alkemos — Design System Documentation

> **Last updated:** 2026-09-23 (VRD-V0, phase 259 — §3 Typography gains the unlayered-RTL note: Cairo 700 / ls 0 / lh 1.35-1.45 on Arabic headings, cascade-law fix, canary rtl-typography.test.ts. Prior: Phase 233 provenance reword.)
> **Status:** Active — binding reference for all UI/UX decisions
> **Audience:** AI agents, developers, designers

---

## 1. Design Philosophy

Alkemos runs the **«Marble & Chrome»** identity (owner directive, Phase 126 + 127):
a monochrome marble-and-metal system inspired by classical Greek
architecture, rendered with modern layout discipline. Every surface is
either pristine marble (light theme) or dark honed stone (dark theme);
every accent is chrome (brushed-metal gradient). The ONLY chromatic
exception is `--ai` cyan, reserved strictly for AI-assistant surfaces.

Core laws:

1. **Monochrome by default** — `--bg` / `--text` / `--muted` + the chrome
   gradient carry the whole design. No blue/green/purple accents outside
   semantic status colors deep inside the app (destructive/success only).
2. **Zero emoji in DOM** on marketing + hub surfaces — icons come from the
   owner's engraved icon sheets (see §6). (Phase 127 removed the last
   emoji renders from /tools, /programs, /memberships.)
3. **Theme parity** — light and dark are the SAME structure, only tokens
   flip (`[data-theme="dark"]`). No element may exist in one theme only.
4. **Zero pure-black / pure-white borders** — borders use `--edge` /
   `--chrome-edge`, never `#000`/`#fff`.
5. **Performance** — fixed-ratio media (no CLS), WebP method=6, no heavy
   animations, `prefers-reduced-motion` respected.

---

## 2. Identity Tokens (globals.css — single source of truth)

> **VRD-V1 (2026-09-23, phase 261 — owner direction «تحسين الهوية الحالية
> دون تغييرها»):** the redesign plan's bronze accent (O-4) was REJECTED by
> the owner; the identity stays monochrome **Chrome/Silver + Black/Graphite
> + Ivory**, now on a WARM neutral ramp with NO new accent color. The
> marble texture was removed (owner order — see §4/§6). Light and Dark are
> equal citizens. Contrast is gated by `scripts/v1_contrast_matrix.py`
> (WCAG 2.1 — measured, not assumed). Full system rewrite lands in V5.

### 2.1 Core palette

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
| `--ai` | `#38C7FF` | `#45D6FF` | **AI-assistant elements ONLY** |

### 2.2 Chrome system

| Variable | Light | Dark |
|---|---|---|
| `--chrome` | `linear-gradient(145deg,#FDFDFD 0%,#CFCBC3 35%,#8E8A82 50%,#E9E6E0 70%,#A09C94 100%)` | same (mode-invariant) |
| `--chrome-hover` | `linear-gradient(145deg,#FFFFFF 0%,#D8D4CC 35%,#98948C 50%,#F0EDE7 70%,#A8A49C 100%)` | same |
| `--chrome-edge` | `#837F77` | `#4A463F` |
| `--border-chrome` | `1px solid #CEC9C0` | `1px solid #3A362F` |
| `--shadow` | `0 8px 24px rgba(32,29,26,.07)` | `0 0 0 1px rgba(255,255,255,.04), 0 12px 32px rgba(0,0,0,.5)` |
| `--radius-chrome` | `14px` | `14px` |

VRD-V1 re-warmed every chrome stop (coldest `#878E94` → `#8E8A82`, plan
§8.4) so the metal belongs to the same warm family as the ivory/graphite
ramp. The `.btn-chrome` label ink is `#1C1710` (≥5.18:1 on every stop,
both modes); dark mode adds a hairline warm-white ring + deeper drop so
the pill reads machined — not washed out — on graphite (audit C-12).

### 2.3 Artwork-backed tokens

`--hero-img`, `--meander-img`, `--prog-backdrop`, `--navbar-bg` — CSS
`url()`/color pairs that flip with the theme (zero hydration flicker; the
browser swaps by `data-theme`, no JS image-src churn). `--marble-img` was
RETIRED in VRD-V1 (marble removal — §4).

### 2.4 Theme engine

- `data-theme="light|dark"` on `<html>`, stamped pre-paint by the
  `#alkemos-theme-init` inline script (root layout) — manual choice
  (localStorage `alkemos-theme`) or OS `prefers-color-scheme`.
- `ThemeToggle` cycles light → dark → system and follows the OS live
  while in system mode.
- `--ai` cyan is EXCLUSIVELY for AI surfaces (EVO widget/chat/glow ring).
  Never use it for links, CTAs, or decoration.

### 2.5 Dark-compatibility shim (Phase 126)

Legacy Apple-light utility classes on secondary surfaces
(`bg-white`, `bg-[#f5f5f7]`, `text-[#1d1d1f]`, `text-[#6e6e73]`,
`border-[#d2d2d7]`) are remapped to identity tokens **in dark mode only**
(globals.css). Light mode is untouched. New code MUST NOT use these
classes — use the `var(--…)` tokens directly (Phase 127 converted all
six hub pages: tools / exercises / programs / foods / blog / memberships).

---

## 3. Typography

### Font Families

| Context | Font Family | Source |
|---|---|---|
| Display (headings, EN) | **Playfair Display** 500/600/700 | `@fontsource/playfair-display` → `--font-display` |
| Body (EN) | **Inter** | `@fontsource/inter` |
| Arabic | **Cairo** | `@fontsource/cairo` (same scale; Arabic never uses the serif) |

The lapidary serif (`font-display` / default `h1–h4`) is the "engraved in
stone" voice. Arabic headings keep Cairo per owner directive §16 — Arabic
readability beats stylistic mirroring.

> **VRD-V0 (2026-09-23, phase 259):** the RTL typography rules live in
> **UNLAYERED CSS** in `globals.css` (after `@layer base`), not in the base
> layer — Tailwind v4's utilities layer always beats `@layer base`, which
> made Arabic headings lose Cairo to `font-display`/`tracking-tight`/
> `leading-tight` utilities (live bug, audit C-1). Unlayered rules win by
> cascade position: Cairo 700, `letter-spacing: 0`, line-height 1.35 (h1) /
> 1.4 (h2) / 1.45 (h3-h4). Cairo is also appended to the `--font-display`
> stack. EN/LTR rendering is untouched. Guarded by
> `src/lib/__tests__/rtl-typography.test.ts`.

### Font Sizes (Tailwind scale)

| Element | Mobile | Desktop |
|---|---|---|
| Hero title | `text-4xl` | `md:text-6xl lg:text-7xl` |
| Page title (h1) | `text-3xl` | `md:text-5xl` |
| Section title (h2) | `text-2xl/3xl` | `md:text-4xl` (Phase 198 Batch 3 unified the homepage on 4xl/36px) |
| Card title (h3) | `text-lg` | `text-lg` |
| Body text | `text-sm/base` | `text-base/lg` |

### Font Weights

Normal (400) body · Semibold (600) titles & chrome buttons · Bold (700)
prices/stat numbers.

---

## 4. Core Recipes (CSS classes in globals.css)

| Class | Recipe | Use |
|---|---|---|
| `.btn-chrome` | chrome gradient bg + `#1C1710` warm-ink text + 1px `--chrome-edge` + radius 999px + 600 weight + `--shadow`; dark mode adds a hairline warm-white ring (VRD-V1) | ALL primary CTAs |
| `.btn-outline` | translucent `--card` fill (65% + blur 6px — VRD-V1, survives hero artwork) + 1px `--text` border + `--text` + radius 999px | Secondary CTAs |
| `.marble-card` | `--card` bg + `--border-chrome` + radius 14 + `--shadow` + **1px machined inner top-edge highlight** (`--card-inner-hl` — VRD-V1 marble removal; class name kept, 123 usages) | Every card surface |
| `.seal-chip` | chrome-border pill, small-caps tracking, `--muted-foreground`, translucent card bg | Stat seals, tags, badges |
| `.chrome-text` | Phase 198 (audit C3) + VRD-V1 warm re-tune: light theme = dark warm-steel ramp (lightest stop ≈ 10:1 on ivory); dark theme = lightened warm ramp. `.chrome-text-on-dark` pins the light ramp on both-theme dark cards (Pro/Coaching) | Numbers, prices, "Learn more ›" links |
| `.meander-divider` | Greek-key band, repeat-x, 28px, opacity .85 (kept — light Greek identity) | Section separators |
| `.navbar-chrome` | sticky, `--navbar-bg` (Phase 198 audit C5: alpha 0.85) + blur(12px) + chrome bottom border; VRD-V2 §12: desktop nav items px-3.5 (+2px) + gap-1 — 64px bar unchanged | Site header |
| `.evo-hero-card` / `.evo-hero-art` | Phase 127 EVO section card — text left, warrior art right with a mask fade into the card; `[dir=rtl]` flips the mask | Homepage EVO section |
| `.hero-art` / `.hero-bg` | Phase 131 unified overlay — artwork = absolute cover layer (ThemeImg pair), content centered INSIDE it; min-height floor 100vw×713/1280 (92vh on wide viewports) | Homepage hero |
| `.footer-marble` | VRD-V1 structural band: light = `--tint` + `--edge` top hairline; dark = deeper step `#0E0C0A` (marble slab removed — audit C-7; name kept, markup untouched) | Site footer |
| `.footer-disc` | VRD-V2 §12 (audit C-8): below lg the five service lists collapse into two native `<details>` groups («الخدمات/Services» + «المنصة/Platform», 44px summary rows, zero JS); lg+ shows the flat 6-column map — href-sync law ×2 (canary-pinned) | Mobile footer |
| `.mhe-cookie-bar` | VRD-V2 S-5 (audit C-16): theme-aware GLASS — `color-mix(--card 92% / 88% dark, transparent)` + `backdrop-filter: blur(16px)`; solid-card `@supports` fallback; worst-case contrast gated in `scripts/v1_contrast_matrix.py` | Cookie consent bar |

**Buttons law:** there are exactly TWO button styles on marketing/hub
surfaces — `.btn-chrome` (primary) and `.btn-outline` (secondary). No
blue buttons, no gradients besides chrome.

---

## 5. Layout & Spacing

### Container Widths

| Context | Max width |
|---|---|
| Landing content sections | ONE `max-w-6xl` container (Phase 198 audit C2 — card edges align across sections); inner text blocks keep their readable bounds (`max-w-2xl/3xl`) |
| Hub pages | `max-w-4xl` (tools) / `max-w-6xl` (explorers, memberships, blog) |
| Article body | `max-w-3xl` |

### Section Padding

Section vertical `py-12` / `md:py-20` · card internal `p-5–p-8` · grid gap
`gap-4` (cards) / `gap-3` (pills).

### Border Radius

Cards `var(--radius-chrome)` = 14px (marble-card) · pills/buttons `9999px`
· small inner cards `rounded-2xl`.

---

## 6. Brand Asset System (`public/images/brand/`)

All artwork comes from the owner's generated sets (v3 upload — the source
directory lives outside the repo; the committed assets under
`public/images/brand/` were rebuilt at Phase 127 by local-only scripts that
were never committed to this repo: `build_assets_v3.py` +
`build_assets_v127.py` + `fix_hero_logo2.py` — documented as history so
they are not requested later):

| Asset | Purpose |
|---|---|
| `hero-light/dark.webp` (1280×713) | Homepage hero background — **logo scrubbed off the artwork (Phase 127): the chrome logo is an HTML element instead** |
| `logo-hero-light/dark.webp` (760px) | Silver-chrome hero lockup (from `logo-main-*`) — displayed full-opacity, upper-center |
| `logo-navbar-light/dark.png` | Horizontal navbar logo (36px height) |
| `logo-footer-white.png` | White mono lockup for the dark-mode footer |
| `logo-footer-black.png` | Black mono lockup for the light-mode footer (RGB-inverted from the white one — Phase 132) |
| `mark-helmet.png` | Helmet mark (favicon set, comparison-table column head) |
| `header-{section}-{light,dark}.webp` (1280×477) | **The owner's 12 PAGE banners** (tools / exercises / programs / foods / blog / pricing) — rendered via `<PageBanner section="…" />` at the top of each hub page (Phase 127: NOT homepage section banners) |
| `evo-card-light/dark.webp` | Programs-card stadium backdrop (12% blur) + EVO page art |
| `evo-hero-light/dark.webp` (640×675) | Phase 127 EVO section warrior crop (warrior at 67–85% of crop width) |
| `evo-widget-light/dark.webp` (480×480) | Widget/avatar bust (72% fill) |
| `texture-marble-light/dark.webp` | **RETIRED from CSS in VRD-V1** (marble removal — owner order 2026-09-23). Asset files kept until the V2 cache-law window per plan §19; delete then |
| `divider-meander-light/dark.webp` | Greek-key repeating band |
| `icons/<name>-{light,dark}.webp` (200×200) | **38 engraved icons** — the ONLY icon set on marketing/hub surfaces (calories, bmi, macros, bodyfat, hydration, mealplanner, dumbbell, house, rack, runner, protein, carbs, fats, fruits, scroll, laurel, evo, checkseal, doric…) |

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
  so SW updates jump over any stale HTTP-cache copy; the worker is
  network-first for everything non-hashed and posts `SW_UPDATED` → the
  page reloads once when a new worker activates.

---

## 7. Page Recipes

### 7.1 Homepage hero (Phase 131 unified overlay)

ONE mode at every viewport (globals.css `.hero-art` / `.hero-bg`): the
artwork is an absolutely-positioned COVER layer (`.hero-bg`, ThemeImg
pair, eager LCP) with the content — chrome logo lockup (`w-32` mobile →
`w-64` desktop) → serif H1 (`.hero-copy` halo) → one-platform subtitle →
compact CTA pair → hero-scoped smaller seal chips (`.hero-seals`) —
centered INSIDE it (owner directive Phase 131: «تصغير اللوجو والنص
والازرار قليلا ثم نقلهم داخل الصورة»; the stats subline is REMOVED).
**CTA pair (Phase 198 — owner-approved UI audit C1, superseding the
Phase 127 no-CTA state):** `.btn-chrome` «Start Free» → memberships
(where the Free plan lives) + translucent-outline «Explore Free Tools»
→ `#tools`, one step smaller (`px-5 py-2.5 text-sm`), inside the artwork
composition. Decision record: docs/UI-IMPLEMENTATION-PLAN.md §0. No
eyebrow wordmark (Phase 127).

Hero copy legibility (Phase 198, audit C4): `.hero-copy` adds a
theme-aware text-shadow halo to H1 + subtitle over artwork details — a
glyph edge, NOT a veil (luminance law below stays intact).

Height floors keep the artwork effectively complete:

- **every viewport:** `min-height: 100vw × 713/1280` (natural artwork
  height) — phones/tablets show the full scene, sides intact; the compact
  content grows the box only a few px (cover then trims ≤ ~6% of the
  decorative side margins).
- **aspect > 1501/1000** (laptops/desktops): `min-height: 92vh`.

Luminance law: the artwork center is clean in BOTH themes (bright in
light / near-black in dark) → no veil ever; verify any new artwork the
same way before shipping.

**Navbar bar (Phase 128):** `[menu][theme] …… logo …… [lang][bell][account]`
— the theme toggle lives on the MENU side (owner directive: it used to hug
the centered logo); RTL mirrors automatically.

### 7.2 Hub page header (Phase 127)

`<SiteHeader variant="landing" />` → `<main>` opens with
`<PageBanner section="{tools|exercises|programs|foods|blog|pricing}" />`
(a 1280×477 owner artwork strip in a marble-card frame, `mb-10`) → h1 +
subline. Works in server components (plain `<img>` pair).

### 7.3 EVO section card (Phase 127 + 128 + 131)

One full-width `marble-card.evo-hero-card`: text column left (**h2 ONLY —
no description (Phase 128) and NO buttons (Phase 131 «ازاله الازرار»)**;
title one step smaller `text-2xl md:text-4xl`), warrior art absolutely
positioned on the inline-end side (60% width desktop / 78% mobile) fading
into the marble via CSS `mask-image`; `[dir=rtl]` mirrors art + mask.
Card min-height `220px` mobile / `260px` desktop; section padding `py-12/md:py-16`
(Phase 198 Batch 2, audit H5 — slim; the card recipe itself is untouched). The floating EVO widget stays the chat entry point.

### 7.4 Pricing cards

Homepage (Phase 198 Batch 2, audit H6): THREE equal-tier `marble-card`s
in a `lg:grid-cols-3` row — Free ($0, `btn-outline` CTA) / Premium /
Pro; Pro stays the visual hero (dark `#0B0B0D` card, 2px chrome gradient
ring via the border-box trick, laurel "Popular" seal-chip, `.btn-chrome`);
prices in `.chrome-text` (`.chrome-text-on-dark` inside the Pro card).
The comparison table collapses behind a NATIVE `<details class="cmp-details">`
(content stays in the served HTML — the Phase 117 SEO order stays honored;
`.cmp-details` hides the default marker, chevron rotates via `group-open`).
`/memberships` keeps its own three-card layout (unchanged).

### 7.5 Comparison tables

**ONE real `<table>` at every breakpoint (Phase 131 «عدله الى شكل جدول»
— the Phase 128 mobile card stack is gone):** 4 columns (Feature /
Alkemos / Traditional trainer / Free apps), Alkemos column highlighted
with `--tint` + `--border-chrome` inset; "yes" = engraved `checkseal`
icon; "no" = muted `×` at opacity .5. Below md the table compacts itself
(`text-xs`, `p-2.5` cells, wrapped text, short trainer header label) so
the grid stays readable with zero cutoff — cards are NEVER used.

### 7.6 Footer (structural band + responsive disclosure)

**VRD-V1:** the marble slab is gone — `.footer-marble` is a clean
structural band (`--tint` + `--edge` hairline light / deeper step
`#0E0C0A` dark), the meander top band stays (light Greek identity), the
lockup is the ThemeImg pair (`logo-footer-black.png` /
`logo-footer-white.png`), headings `var(--text)` 11px/600, links
`var(--muted-2)` 13px / leading-7 → hover `var(--text)` (+ underline).

**VRD-V2 §12 (audit C-8 — the mobile footer measured 1,273px at
390px):** below `lg` the five service lists collapse into TWO native
`<details>` disclosure groups («الخدمات / Services» — Training /
Nutrition / Tools & AI / Coaching & Services with their sub-headings —
and «المنصة / Platform» — the Company list) with 44px summary rows,
zero JS, SSR-rendered, keyboard-native. Collapsed footer: **668px**.
At `lg+` the flat six-column service map (brand + 5 lists, Phase 202)
renders from a separate lg-only grid — the header's own desktop-nav +
drawer pattern. Every link exists in BOTH copies with the exact same
href: the **href-sync law** (each footer href exactly ×2 in
`SiteFooter.tsx`) is canary-pinned in `homepage-adoption.test.ts`.
The bottom credit line stays centered under the newsletter block.

### 7.7 Secondary pages (Phase 132 identity rollout)

Owner feedback «باقي الموقع إعادة التنسيق ليتبع هوية الصفحة الرئيسية» —
all remaining public surfaces joined the Marble & Chrome identity:
about/privacy/terms/faq (StaticPageView), contact, coaching, EVO,
for-coaches, coach landing pages, affiliate program + toolkit, checkout,
meal-planner, the 5 tool result pages, auth, blog article page, and the
shared surfaces (CookieConsent, ShareButtons, CoachShareButtons,
OtherTools, PageBottomPromo, LeadCaptureCard, Pagination, CopyButton).
Recipe: `bg-[var(--bg)] text-[var(--text)]` root · `marble-card` for
cards · `seal-chip` eyebrows · `btn-chrome`/`btn-outline` CTAs ·
`chrome-text` stat numbers · engraved icons instead of emoji tiles
(zero-emoji law enforced on coaching testimonials flags, OtherTools,
ExploreMore) · dark premium bands are `bg-black` + 2px chrome ring
(boxShadow `0 0 0 2px #C9CED3`) in BOTH themes with pinned light-on-dark
text · **the global anchor rule is `var(--muted-2)` (zero-blue law —
the old `var(--primary)` Apple-blue link default is retired)** ·
`::selection` neutral graphite. Semantic colors (destructive/success/
warning) and social-platform brand icons keep their conventional hues.

Authenticated app surfaces (dashboard/coach/admin/referral) still ride
the Phase-126 dark shim; their light-mode restyle is future work.

---

## 8. Bilingual Support (EN/AR)

- Full RTL mirroring via `dir="rtl"` + logical properties
  (`ps/pe/ms/me`, `start/end`, `inset-inline-end`). The EVO card art and
  mask flip with `[dir=rtl]`.
- **Logo lockups stay LTR** (brand artwork is language-neutral).
- Arabic keeps Cairo at the same type scale; no serif for Arabic.
- AR mirrors: `/ar/{exercises,foods,programs,blog,memberships,…}` share
  the EN components with `lang="ar"` — banners/theme/logo pairs are
  language-independent.

---

## 9. Performance Patterns

- Hero artworks `<link rel="preload">`ed in the root layout (no CLS — the
  artwork layer is absolutely positioned; the logo keeps fixed CSS width);
  hero logo light variant preloaded. The `.hero-bg` `<img>` is eager (LCP).
- Theme image pairs: both variants in DOM, CSS shows one — zero JS churn.
- Hub page banners lazy-decode; engraved icons `loading="lazy"`.
- Server components render grids/pills/pagination (explorers) — client
  JS only for search/filter islands.
- All brand raster shipped as WebP method=6 (sources 1.5–2MB → 20–130KB).

---

## 10. Verification Protocol

Before any UI change ships:

1. **Structure parity** light vs dark (same DOM, tokens flip only).
2. **Zero emoji** in rendered DOM on marketing/hub surfaces.
3. **No legacy accent colors** — `#0071e3`, `#34c759`, `#8b5cf6` must not
   appear on hub/marketing surfaces (grep the diff).
4. VLM screenshot pass (light + dark + AR + 390px mobile) against the
   owner's preview references.
5. Full gate suite: `tsc` 0 · `eslint` 0 · `vitest` · `next build` ·
   docs/stale-ref/ui-wiring guards.
