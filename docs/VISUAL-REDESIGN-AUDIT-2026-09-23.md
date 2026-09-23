# Visual Redesign Audit & Implementation Plan — 2026-09-23

> **Provenance:** owner order (fresh agent session, 2026-09-23) — «Perform a complete visual design,
> UX, UI, and website-copy audit of the current Alkemos website before making any code changes.»
> **Status:** LIVE — read-only audit + implementation plan. **ZERO application code, assets, business
> logic, APIs, DB behavior, SEO architecture, or functionality changed in this commit** (docs-only).
> **Verified against:** commit `bf47cd29` (HEAD = origin/main at audit time) **+ the live production
> site** alkemos.com on 2026-09-23.
> **Evidence base:** live headless-browser inspection in 6 contexts (EN/AR × light/dark × 1440px/390px),
> DOM computed-style measurements, network transfer measurements, VLM screenshot passes (12 full-page
> captures + zoomed detail crops), full source review (`src/app/globals.css`, `src/components/views/
> LandingView.tsx`, `SiteHeader.tsx`, `SiteFooter.tsx`, `ThemeImg.tsx`, `PageBanner.tsx`,
> `src/app/metadata.ts`, `src/lib/__tests__/homepage-adoption.test.ts`), and the governing docs
> (`AGENTS.md`, `DESIGN.md`, `STATE.md`, `worklog.md`, `docs/README.md` registry).
> **Audience:** the future execution session(s) that implement this plan + the owner.
> **Reading law:** «Confirmed» = measured/verified fact. «Recommendation» = judgment call.
> «Decision» = settled direction the execution session MUST follow. «Open» = owner picks before or at
> implementation. All line numbers refer to commit `bf47cd29`.

---

## 0. Executive summary

The current «Marble & Chrome» system (Phase 126/127) is **well-engineered but visually exhausted**.
The engineering underneath is genuinely good — theme parity, the dual light/dark image system (proven
zero-waste, §9.4), RTL mirroring, performance discipline — and should be kept. The problems are
concentrated in three layers:

1. **Palette** — pure-white / pure-gray / blue-black neutrals with zero warm undertone and zero
   accent color. Measured live: the entire homepage renders in 2 achromatic neutrals + 1 chrome
   gradient. The owner's verdict («dull, cold, lifeless») is confirmed by inspection: every surface is
   neutral, so nothing has hierarchy *by color* — only by size and weight.
2. **Decorative marble layer** — the marble texture overlays on cards (5%/7% opacity) are nearly
   invisible (VLM: «technical success, decorative failure»), the marble footer slab fights link
   readability, and the two meander dividers + footer meander band push the site toward «heavily
   themed Greek website» — the exact thing the owner wants to move away from.
3. **Accumulated typography defects** — including one **real live bug**: the Arabic hero H1 renders in
   the OS default Arabic serif (not Cairo) because Tailwind v4 utility classes defeat the base-layer
   RTL rules (§1 C-1, with pixel-measured proof).

The plan: keep the architecture (tokens, ThemeImg, theme engine, two-button law, section rhythm),
replace the achromatic palette with a **warm ivory / warm graphite / bronze-steel** system in both
modes as equal citizens, remove the marble-texture and meander decoration in favor of structural
separation, fix the RTL typography defects, tighten mobile density (footer = 151% of viewport
height), and apply a short list of surgical copy refinements. The chrome logo is kept in both modes
with an optional stronger light-mode treatment. Wave plan in §20; canaries affected listed in §19.

---

# PART I — AUDIT FINDINGS

## 1. Confirmed problems (verified on the live site and in source)

| # | Problem | Evidence (measured / file:line) |
|---|---------|----------------------------------|
| **C-1** | **AR hero H1 renders in the wrong font.** The RTL base rule (`globals.css:665-678`) sets Cairo for `h1–h4/.font-display`, but the hero H1 carries Tailwind utilities `font-display font-semibold tracking-tight leading-tight` (`LandingView.tsx:336`), and **utilities layer beats base layer** in the Tailwind v4 cascade. Computed live stack: `"Playfair Display", "Playfair Display Fallback", Inter, "Inter Fallback", ui-serif, Georgia, serif` — **no Arabic-capable font before the generic `serif`**, so Arabic glyphs fall through to the OS default Arabic serif (Naskh-style on most devices — Geeza Pro on iOS/macOS, Traditional Arabic on Windows). Pixel proof: the H1 stack renders «خطتك للياقة تبدأ من هنا.» at 592.4px vs 613.5px in Cairo at the same size (≠). Same mechanism also defeats the RTL letter-spacing 0 / weight 700 / line-height 1.2 corrections on any element using those utilities. | live computed styles + canvas measurement, 2026-09-23; `globals.css:655-678`; `LandingView.tsx:336` |
| **C-2** | **Negative letter-spacing applied to Arabic text.** All section H2s use `tracking-tight` (-0.025em → -0.9px at 36px); hero H1 -1.5px at 60px. Arabic is a connected script; tracking is typographically wrong for it (and the project's own base rule says `letter-spacing: 0` for RTL). Computed live on AR page: every H2 `letter-spacing: -0.9px`. | live computed styles, AR page |
| **C-3** | **Arabic heading line-height too tight.** H2s compute 40px/36px = **1.11**; hero H1 `leading-tight` = 1.25. Cairo has tall ascenders/descenders; 1.11 clips visually. Project's own RTL rule intends 1.2; Arabic comfortable range is ≈1.35–1.5 for headings. | live computed styles, AR page |
| **C-4** | **Indigo focus ring violates the project's own zero-blue law.** `globals.css:858-862`: `*:focus-visible { box-shadow: 0 0 0 2px rgba(99,102,241,0.4) }` — legacy «Liquid Glass» indigo. Also `viewport themeColor: "#0071e3"` (Apple blue) in `metadata.ts:129` clashes with the identity; legacy `:root --primary: #0071e3` (`globals.css:117`) and a dead `.dark` indigo block (`:186`) still exist. | `globals.css:858-862`, `:117`, `:186`; `metadata.ts:129` |
| **C-5** | **Dark-mode section alternation is imperceptible.** Light mode alternates `#FFFFFF` ↔ `#F5F6F8` (visible); dark alternates `#0B0B0D` ↔ `#121316` — a ΔL of ~1.5%. VLM verdict: «almost invisible; defeats its own purpose». The alternating rhythm the design relies on does not function in dark mode. | live computed bgs (§ measured section list); VLM pass |
| **C-6** | **Marble card texture is decorative dead weight.** `.marble-card::before` overlays `--marble-img` at 5% (light) / 7% (dark). VLM: in dark mode it is «nearly invisible… fails as a decorative element»; in light mode it contributes a faint muddiness on 36 homepage cards + ~40 other surfaces (123 usages in 42 files). Cost: texture-marble-dark.webp is 24.4KB fetched once (fine), but the layer adds a paint layer per card for an effect users cannot perceive. | `globals.css:374-393`; asset sizes §9; VLM pass |
| **C-7** | **Marble footer slab hurts readability.** Full-bleed marble texture behind 6 columns of small grey links — VLM: «the veins in the marble compete with the thin sans-serif type… vibration». Owner already dislikes marble as background. | `SiteFooter.tsx:48` (`.footer-marble`); VLM pass |
| **C-8** | **Footer consumes 151% of viewport height on mobile.** Measured 1,273px at 390×844. Six desktop columns collapse to a 2-col grid of 5 link lists + brand col + newsletter + meander band + credit line. Excessive scroll to reach the end of the page. | live measurement, mobile EN |
| **C-9** | **Mobile hero is over-compressed and the CTA row is cramped.** Hero box = 332px (39% of viewport) at 390px width — the 1280×713 landscape artwork cover-crops to a thin band holding logo + H1 + subtitle + 2 side-by-side CTAs + a «Log in» link that sits close enough to risk mis-taps (VLM). The artwork that makes the desktop hero premium is mostly cropped away on phones. | live measurement + VLM mobile pass |
| **C-10** | **Mobile pacing: two full screens of marketing before the first product content.** Order on mobile: hero → 3 stacked full-width path cards (section = 1,074px) → plan card (938px) → only then exercises. Total page 11,374px (13.5 viewports). VLM: «the Paths section acts as a barrier to entry». | live measurements; VLM mobile pass |
| **C-11** | **Muscle-chip row wraps raggedly on mobile.** 7 chips flex-wrap into 2–3 rows with an orphaned last chip — reads as a layout error (VLM). (The prior audit's single scroll-snap row fix — Phase 200 M-fix — is not present on the current homepage build.) | VLM mobile pass; `LandingView.tsx:539` chip list |
| **C-12** | **Outline CTAs lose contrast over busy artwork.** The translucent-outline secondary hero CTA over the light hero artwork can wash out (VLM both modes); in dark mode chrome buttons read «slightly washed out — more light-gray gradients than liquid metal» (VLM). | VLM passes EN light/dark |
| **C-13** | **Memberships section has a weak click invitation.** Both paths use `btn-outline` ghost buttons «that look like secondary actions» inside an already-light section (VLM). The section is the commercial heart of the page; nothing in it is visually primary. | VLM pass; `LandingView.tsx:771-901` |
| **C-14** | **EVO warrior mask banding in dark mode.** The `.evo-art-mask` linear-gradient fade shows a visible transition band against the dark marble card (VLM: «abrupt on the left edge… banding»). Light mode fades cleanly. | VLM dark pass; `globals.css:497-504` |
| **C-15** | **Some touch targets are below the 44px guideline.** Carousel arrows 36×36 (`h-9 w-9`); several `btn-outline` links measure 42px tall on mobile; FAQ chevron is small and low-contrast (VLM). All pass WCAG 2.5.8 (≥24px) but fail Apple HIG 44px. | live measurements; `LandingView.tsx:99-217` |
| **C-16** | **Cookie consent bar cuts the hero composition on first visit.** Fixed white bar overlays the bottom of the hero artwork (barbell crop) before consent — VLM flagged it as the most jarring element on first load. (Functional overlay, not a layout bug — but its styling ignores the theme system: solid `var(--card)`, no blur.) | VLM light pass; `globals.css:538-552` |
| **C-17** | **AR/EN meaning drift in three copy spots** (full copy audit §14): the featured-coaches heading «مدربون على المنصة» drops «Featured» that EN carries; newsletter AR «اشترك الآن مجانًا» adds sales-urgency «الآن» the EN «Subscribe free» deliberately avoids; footer credit «صُنع بحب» («with love») vs EN «Built with care». | `LandingView.tsx:855`; `NewsletterForm.tsx:177`; `SiteFooter.tsx:191` |
| **C-18** | **Dead/legacy CSS and duplicated token generations still ship.** Two `:root` generations coexist (Apple-style `:101-197` incl. dead `.dark` indigo block, then Marble & Chrome `:206-291`); dead utilities `glass`, `gradient-border`, `grid-bg`, `neon-text`, `text-shimmer`; unused `.hero-seals`, `.cmp-details`. Confuses every future session and risks accidental reuse of forbidden blues. | `globals.css` full review |

## 2. Gemini observation — independent verification matrix

Each external claim was re-tested against the live site and source. **Verdicts: 5 confirmed (with
corrected specifics), 4 partially confirmed, 3 refuted, 1 not applicable.**

| Gemini claim | Verdict | What verification found |
|---|---|---|
| «Cards excessively vertical; large empty spaces» | **Partially confirmed** | True for: the 3 path cards on mobile (stacked, 1,074px section), the 2 memberships cards on mobile (943px), and the food cards' internal dead space between title and macro grid (VLM). **False** for exercise/food grids, which are already 2-up mobile / 4-up desktop with tight cards (276×351px). |
| «Use CSS grid: ~2 cards/row mobile, 3–4 desktop» | **Partially confirmed / already implemented** | The site ALREADY uses responsive CSS grids at exactly those densities (`grid-cols-2 md:grid-cols-4` for samples; `md:grid-cols-3` for paths/programs). The real gap is density of the *single-column* sections on mobile (paths/plan/memberships) and the footer — not a missing grid system. |
| «Reduce excessive internal card spacing» | **Partially confirmed** | Path cards `p-6/md:p-7` (28px) and plan card `p-6/md:p-10` (40px) are generous-but-premium on desktop; on mobile they inflate the scroll wall (C-10). Food cards are `p-4` (tight). Recommend mobile-specific tightening, not a global cut. |
| «Keep image, title, info, CTA visually connected» | **Confirmed** | Food cards spread title → macros → link with dead space between (VLM «visual tension» between macro grid and link). Exercise cards connect well. |
| «Subtle borders/radius + restrained hover elevation» | **Confirmed as a gap** | Borders/radius already exist (14px, chrome hairlines) and are good. Hover elevation exists ONLY on the 3 path cards (`hover:-translate-y-0.5`); sample cards, blog cards, membership cards have no hover feedback (VLM: «slightly anemic»). |
| «Insufficient hierarchy between headings, text, buttons» | **Refuted as stated / confirmed differently** | Size hierarchy is strong (H1 60px, H2 36px/600, body 14-18px/400 — VLM: «editorial excellence»). The real hierarchy problem is *achromatic*: with zero accent color, primary and secondary actions differ only by border/fill subtleties (C-12/C-13), and in dark mode the section alternation that creates rhythm is invisible (C-5). |
| «Section headings ≈28–32px bold; body 14–16px; AR line-height ≈1.7» | **Refuted as numbers / confirmed as direction** | 36px/600 H2 at 1440px is correct for this scale — do NOT shrink to 28–32 (§23). Body 16-18px already at the top of Gemini's range. AR line-height: headings measured 1.11 (too tight — confirmed problem, C-3); body 1.55–1.63 (close to 1.7, minor bump only). |
| «Check inappropriate letter-spacing on Arabic» | **Confirmed — and worse than Gemini knew** | -0.9px on all AR H2s, -1.5px on the AR H1, PLUS the C-1 font-fallback bug Gemini did not detect. |
| «Header/footer consume excessive vertical space» | **Partially confirmed** | Header 64px sticky = standard, fine. Desktop footer 636px = acceptable; **mobile footer 1,273px = confirmed excessive** (C-8). |
| «Desktop not using horizontal space efficiently» | **Refuted** | `max-w-6xl` (1,152px) containers with `md:grid-cols-3/4` grids use width well at 1440px; VLM found the grids balanced. The single-column plan card (max-w-4xl) is intentional narrative focus, not waste. |
| «Subtle alternating section backgrounds» | **Already implemented** | Alternation exists (`--bg`/`--tint`); the actual defect is that it is invisible in dark mode (C-5) and both tints are cold/achromatic. |
| «Tables should remain usable on mobile with horizontal scroll» | **Not applicable (homepage)** | The homepage comparison table was retired in Phase 257 (test-banned). Comparison tables live on `/memberships` + `/compare/*` and already compact below md (Phase 131 law). No homepage action. |

## 3. Existing elements worth PRESERVING (verified good)

| # | Element | Why keep it |
|---|---------|-------------|
| P-1 | **Dual light/dark image system (`ThemeImg`)** | Measured live: in light mode **0 KB of dark-variant assets are fetched** (20 brand requests, 140KB total; dark variants `display:none` + `loading=lazy` are never requested). Zero hydration flicker, zero JS churn. The owner's question «does it create a meaningful performance problem?» is answered: **no — preserve the system as-is.** |
| P-2 | **Chrome logo lockups (hero + navbar mark + footer)** | Owner-liked. VLM: dark-mode treatment «excellent, luminance pop»; light-mode treatment is brushed steel (see §9.3 for the optional strengthening). Helmet mark + wordmark system is distinctive. |
| P-3 | **Hero/EVO/page-banner photography** | The owner likes existing imagery; VLM confirms the hero artwork («temple of the body… feels expensive»), the EVO warrior, and the 12 hub page banners («premium & distinctive») are the strongest brand assets. Photographic marble *scenes* are not the problem — *texture overlays and dividers* are. |
| P-4 | **Theme engine** | `data-theme` pre-paint inline script, three-state toggle, OS tracking, CSS-var-only switching — robust, flicker-free, and mode-agnostic. Unchanged by this redesign. |
| P-5 | **Typography families** | Playfair Display (EN display) + Inter (EN body) + Cairo (AR) — VLM: «editorial excellence». Keep all three. |
| P-6 | **Two-button law + pill chrome CTAs** | `.btn-chrome`/`.btn-outline` restraint is right for a premium platform (VLM: chrome buttons «restrained… lands on the right side of expensive»). Keep the law; refine contrast/consistency (§13). |
| P-7 | **Section rhythm & container discipline** | `py-12/md:py-20`, one `max-w-6xl`, alternation concept, 36px H2 scale — the Phase-198 system is sound; only the dark-mode tint values fail (C-5). |
| P-8 | **10-section narrative structure + account-driven CTA law + EVO chat-surface law + no-prices law** | Owner-approved blueprint (Phase 257) two days before this audit; canaries pin it. The redesign is visual, not structural. |
| P-9 | **Engraved icon system** | 22 light/dark pairs read clearly (VLM on /tools: «stamped texture adds tactile depth without sacrificing legibility»). Zero-emoji law stays. |
| P-10 | **A11y foundations** | Skip-link, drawer dialog semantics, `prefers-reduced-motion` blocks, aria labels (118 across 52 files), RTL logical properties. Solid base — extend, don't rebuild. |
| P-11 | **Seal-chip proof-point pattern** | Live counts (868+ / 8,830+) as chips communicate substance (VLM: «reduce cognitive load»). Keep pattern; restyle token. |
| P-12 | **Secondary-page consistency** | /memberships + /tools verified live: pricing cards, comparison table, banners all hang together. The token change will re-skin them automatically — no structural work needed there. |

## 4. Existing elements recommended for REPLACEMENT

| # | Element | Replacement |
|---|---------|-------------|
| R-1 | **Achromatic neutral palette** (pure `#FFFFFF`/`#0B0B0D` cold grays) | Warm ivory / warm graphite ramp with a bronze-steel accent — §8. |
| R-2 | **Marble texture overlays** (`.marble-card::before`, `.footer-marble` slab) | Clean surfaces + refined hairline borders + one restrained warm sheen; footer becomes a structural dark/light band — §9. |
| R-3 | **Meander dividers** (homepage ×2 + footer band) | Structural whitespace + hairline; at most a single micro-motif in the footer — §9.5. |
| R-4 | **`--tint` section alternation values (both modes)** | Perceptible, warm-tinted alternation (dark ΔL ≥ 3%) — §8.2. |
| R-5 | **Indigo focus ring / Apple-blue themeColor / legacy token debris** | On-brand focus ring + warm themeColor + dead-CSS cleanup — §17, §19. |
| R-6 | **Cold `.chrome-text` ramps** | Steel ramps retuned to the warm graphite/bronze family (keep the WCAG-fixed light ramp's ≥9.8:1 discipline) — §8.4. |

## 5. Subjective recommendations (judgment calls, not defects)

- **S-1** Give the memberships card CTA pair primary/secondary asymmetry (one filled, one outline) — VLM-confirmed weakness, but the specific split is an owner call (§13.3).
- **S-2** Mobile hero: taller art box (~56–60% viewport) with stacked full-width primary CTA — trades a little marketing copy visibility for composition (§16.2).
- **S-3** Blog featured card: add a subtle typographic scale-up or accent edge so «featured» reads beyond position (VLM).
- **S-4** Food cards: optional 48px thumbnail column to break the typographic monotony of the 8-card grid (VLM suggestion — only if data supports thumbnails; otherwise tighten spacing only).
- **S-5** Cookie bar: theme-aware glass treatment instead of solid slab (C-16).
- **S-6** Footer desktop: consider 3 groups × 2 sub-lists instead of 6 flat columns (VLM density note; mobile fix is the confirmed part, desktop regrouping is optional).

## 6. Design-rule triage — mandatory vs. historical

Which documented rules bind this redesign? (Sources: `DESIGN.md`, `AGENTS.md`, canary tests.)

**MANDATORY (must survive the redesign):**
- Theme parity law — same DOM, tokens flip; no element exists in one theme only (DESIGN.md §1.3).
- Zero emoji on marketing/hub surfaces; engraved icons only (§1.2).
- EVO cyan `--ai` reserved for AI surfaces only; never CTAs/links/decoration (§2.4).
- EVO chat-surface law — homepage EVO CTA opens the floating widget, never a link (test-pinned).
- Account-driven CTA law (Phase 203) — hero/final CTA labels + destinations per auth state (test-pinned).
- No prices / no tier ladder / no comparison table on the homepage (test-banned strings).
- Homepage 10-section id map + order (test-pinned `homepage-adoption.test.ts`).
- FAQ single-source law — `faqs` array feeds both DOM and FAQPage JSON-LD.
- SEO mirrors — canonicals, hreflang, OG cards, metadata titles (§19 notes the one themeColor change).
- MSA law for Arabic copy (blog/tools precedent) — no Egyptian colloquial.
- Performance patterns — fixed-ratio media, WebP, `prefers-reduced-motion`, lazy dark variants.
- Bundle law — `home-samples.ts` serialization only; never import `exercises.ts`/`foods.ts` client-side.
- Live-number law — counts only from `EX_PLUS`/`FOODS_PLUS` where the blueprint allows.

**HISTORICAL (owner has now superseded — safe to change in this redesign):**
- «Monochrome by default; no accents outside semantic colors» (DESIGN.md §1.1) — **superseded by the
  owner's 2026-09-23 direction**: richer, warm, characterful palette. The redesign keeps *restraint*
  (one accent family) but drops achromatic-only.
- «Marble texture on every card + marble footer slab» (§4 recipes) — owner dislikes marble imagery as
  backgrounds/dividers; replace (R-2).
- «Meander divider as section separator» (§4) — replace (R-3).
- The specific hex values of `--bg/--text/--muted/--tint/--edge/--chrome` — these are Phase-126
  implementation choices, not owner-mandated colors. The *token architecture* stays; values change.
- «Authenticated app surfaces ride the Phase-126 dark shim; light restyle is future work» (§7.7) —
  remains future work; NOT in scope of this redesign (keeps the blast radius public-surface-only).
- Zero-blue law — **amended, not dropped**: the *Apple-blue UI accents* stay banned; the new bronze
  accent becomes the sanctioned non-semantic accent, and the indigo focus ring is removed. AI cyan
  keeps its exclusive reservation.

---

# PART II — NEW VISUAL DIRECTION

## 7. Design principles (Decision)

1. **Warm, not colorful.** The fix for «cold and lifeless» is undertone (warm ivory, warm graphite,
   bronze), not saturation. No hue outside the bronze/steel family on marketing surfaces.
2. **One accent, three jobs.** Bronze-steel is the single accent: (a) primary CTA fill, (b) active/
   hover state, (c) proof-point numerals. It never decorates; it always signals.
3. **Structure over texture.** Separation comes from spacing, hairlines, and perceptible surface
   steps — not from marble overlays or ornament bands.
4. **Two equal modes.** Dark mode is designed first-class: its own perceptible tint steps, its own
   contrast-tuned accent, not a light-mode inversion.
5. **Athletic premium, not sales landing.** Copy and CTAs stay understated; confidence comes from
   typography scale, live numbers, and photography.
6. **Greek heritage carried by the mark and the artwork** (helmet, chrome logo, hero photography,
   laurel icon) — not by dividers, textures, or motifs sprinkled across sections.

## 8. Color system proposal

### 8.1 The direction (Decision — values are the proposal, final contrast validation in §21)

**«Ivory & Bronze Steel»** — warm neutral ramp + bronze metallic accent, in both modes.

The accent rationale: bronze = the Olympic/laurel metal. It is warm, athletic, premium, reads
clearly on both ivory and graphite, and is completely absent from the «neon fitness» cliché space.
It pairs naturally with the existing chrome logo (silver + bronze is a classic metal pairing) and
gives the platform the «character and depth» the owner asked for with zero saturation risk.

### 8.2 Token table (proposal — every value subject to the §21 contrast gate)

| Token | Light (warm ivory mode) | Dark (warm graphite mode) | Notes |
|---|---|---|---|
| `--bg` | `#FAF8F5` warm ivory | `#12100E` warm near-black | kills the cold cast; dark gets a warm undertone |
| `--bg-alt` (tint step) | `#F1EDE7` | `#1A1714` | alternation becomes **perceptible in both modes** (fixes C-5; dark ΔL ≈ 3.5%) |
| `--text` | `#201D1A` warm ink | `#F4F1EC` warm white | |
| `--muted` | `#6E675E` | `#A8A199` | secondary text — must pass 4.5:1 on `--bg` |
| `--muted-2` | `#4E4840` | `#C6C0B8` | body copy on tinted surfaces |
| `--card` | `#FFFFFF` | `#1B1815` | one step up from `--bg-alt` — visible surface elevation in dark |
| `--edge` | `#E5DFD6` | `#2E2A25` | hairlines |
| `--accent` (NEW) | `#8C6A3F` bronze (text-grade) | `#D2A96E` bronze (lightened) | text/links/small UI — gate ≥4.5:1 on bg |
| `--accent-strong` | `#A67C46` | `#E3BC82` | numerals, prices, `.chrome-text` successor base |
| `--accent-deep` | `#6E5230` | `#B78F55` | hover/active states, focus ring |
| `--chrome` (kept) | existing chrome gradient (retuned stops, §8.4) | same | logo/hero metal language stays |
| `--ai` | `#38C7FF` unchanged | `#45D6FF` unchanged | AI surfaces only — unchanged law |
| semantic success/warning/destructive | keep current (`#34c759`/`#ff9500`/destructive) | keep | deep-app semantics unchanged |

### 8.3 What changes in practice

- **Primary CTA (`.btn-chrome` successor, class name kept):** bronze-steel gradient fill
  (`linear-gradient(145deg, #C89B62, #8C6A3F 50%, #B08D57)` light; lightened ramp dark) + warm ink
  text (`#1C1710`) light / `#14100B` dark — keeps the metallic language of the logo but carries
  warmth and reads unmistakably as THE primary action (fixes C-12/C-13 hierarchy).
- **Secondary CTA (`.btn-outline`):** `--text` border + `--text` label + translucent `--card` fill
  (60–70% + blur) so it survives over hero artwork (fixes C-12).
- **Proof-point numerals / «View ›» links:** bronze `.chrome-text` successor (`.accent-text`),
  preserving the Phase-198 WCAG discipline (light-mode ramp stops ≥4.5:1 measured, not assumed).
- **`::selection`, focus ring, scrollbar accents:** bronze family (fixes C-4).
- **`viewport themeColor`:** `#FAF8F5` / dark `#12100E` (two-value format) — replaces Apple blue.

### 8.4 Chrome gradient retune

Keep the chrome gradient for the hero/final-CTA *border ring*, seal chips, and the logo (metal
language), but retune stops toward warm silver (swap the coldest stop `#878E94` → `#8E8A82`) so
chrome and bronze belong to the same metal family. The button fill moves to bronze (§8.3) so
«chrome» stops competing with itself as a CTA color.

### 8.5 What does NOT change

`--ai` cyan and its exclusive reservation; semantic status colors; social brand icon colors; the
token *architecture* (same names + `--bg-alt`/`--accent*` additions); `data-theme` engine; the
dark-compatibility shim mapping (values only).

## 9. Background & imagery strategy

### 9.1 Marble textures → removed (Decision)

- `.marble-card::before` texture overlay: **delete** from the recipe. Cards get: `--card` surface +
  `--edge` hairline + existing soft shadow + (new) a 1px inner top-edge highlight
  (`inset 0 1px 0 rgba(255,255,255,.5)` light / `rgba(255,255,255,.06)` dark) — this gives the
  «machined metal edge» depth the marble was failing to deliver, at zero asset cost.
- `.footer-marble` slab: footer becomes a clean structural band — light mode `--bg-alt` with
  `--edge` top hairline; dark mode a slightly deeper step (`#0E0C0A`) so it closes the page.

### 9.2 Meander dividers → removed (Decision)

- The two homepage `.meander-divider` bands and `.footer-meander-top` are replaced by plain section
  boundaries (the alternation rhythm does the separating). Optional micro-motif: a single 24px
  laurel-separator centered in the footer top hairline — **Open O-2** (default: none).

### 9.3 Chrome logo treatment (Decision: keep both; Open: light-mode strengthening)

Verified: light mode already carries a *brushed-steel* chrome lockup (not the absence of chrome) —
it is flatter than dark mode's high-gloss treatment, with a mild wash-out risk against light
marble (VLM). Options:

- **O-1a (default):** keep the two current lockups as-is. They are owner-liked and legible.
- **O-1b (recommended if the owner wants stronger light-mode chrome):** regenerate
  `logo-hero-light.webp` with *inverted lighting logic* — bright specular highlights + medium
  charcoal reflections (RGB ~60–80), never near-black shadows — so it reads «polished chrome» on
  ivory without losing legibility (VLM's execution guidance). This is an asset regeneration
  (owner-generated asset pipeline), not a code change — scheduled in wave V4.

### 9.4 Dual light/dark asset system → PRESERVED (Decision, evidence-based)

Measured live (2026-09-23): light-mode session fetched **0 KB** of dark-variant brand assets (dark
`<img>`s are `display:none` + `loading=lazy`, never requested); 20 brand requests / ~140KB total;
zero broken images after full scroll. There is **no real-world performance problem** — the system
is preserved untouched (answers the owner's §imagery question). No consolidation.

### 9.5 Imagery kept as-is (Decision)

Hero artwork pair, EVO warrior pair + widget bust, 12 hub page banners, engraved icon set — all
preserved (P-2/P-3/P-9). Only asset-level change candidate is O-1b. The EVO dark-mode mask gets a
softer multi-stop gradient (fixes C-14) — CSS only.

## 10. Typography hierarchy (Decision + fixes)

### 10.1 Scale (keeps the verified hierarchy; adds AR-specific overrides)

| Role | EN (unchanged) | AR (new rules) |
|---|---|---|
| Hero H1 | `text-2xl md:text-5xl lg:text-6xl` Playfair 600, lh 1.08 | **Cairo 700, lh 1.35, letter-spacing 0** |
| Section H2 | `text-3xl md:text-4xl` (30/36px) 600, lh 1.11 EN | **Cairo 700, lh 1.4, ls 0** |
| Card H3 | 20px/600 lh 1.4 | Cairo 700, lh 1.45, ls 0 |
| Body | 14–18px/400, lh 1.55–1.63 | lh **1.7** (bump from 1.55 on section subs), ls 0 |
| Seal chips | 11px/600/0.08em uppercase | AR: ls 0.02em (no uppercase transform — Arabic has none) |

Gemini's 28–32px H2 is explicitly rejected — 36px is right (§23).

### 10.2 The systemic RTL fix (fixes C-1/C-2/C-3)

Root cause: Tailwind v4 **utilities layer always beats base layer**, so `font-display`,
`tracking-tight`, `font-semibold`, `leading-tight` on RTL elements override the `html[dir=rtl]`
base rules. Fix (all three, belt and braces):

1. **Stack fix:** append Cairo to the display stack — `@theme` `--font-display:
   var(--font-playfair), var(--font-cairo), var(--font-inter), ui-serif, Georgia, serif` — so any
   Arabic glyph inside a `font-display` element resolves to Cairo even if utilities win.
2. **Layer fix:** move the RTL typography overrides OUT of `@layer base` into unlayered CSS (or
   `@layer utilities` after Tailwind's): `[dir="rtl"] .font-display, [dir="rtl"] h1…h4 {
   font-family: var(--font-arabic); letter-spacing: 0 !important-free wins by layer; … }`.
3. **Utility discipline:** in RTL components, replace `tracking-tight` with `tracking-normal` on
   Arabic-bearing headings (hero H1, H2s) and `leading-tight` with `leading-snug`+.

Verification: re-run the pixel-width test (`h1Stack` vs `Cairo` must be equal) in both AR routes.

## 11. Card & grid strategy

- **Keep** the existing grid densities (2-up mobile / 3–4-up desktop for samples; they already match
  the sensible part of Gemini's advice) and the `marble-card` recipe *name* (123 usages) — restyle
  the recipe once, every surface inherits.
- **New card recipe (Decision):** `--card` surface, `--edge` hairline, 14px radius (keep), soft
  shadow (keep), inner top-edge highlight (§9.1), **unified hover**: `translateY(-2px)` + shadow
  lift + `--edge`→`--accent-deep` border shift, 200ms ease, `prefers-reduced-motion`-safe (fixes
  the VLM «anemic» hover gap).
- **Mobile density (fixes C-10):** path cards on `<md`: icon+title on one row, description clamped
  to 2 lines, `p-5`, CTA inline — target ≤ 720px for the 3-card block (from 1,074px). Plan and
  memberships cards: `p-5` mobile / `md:p-8` desktop, descriptions clamped 3 lines mobile.
- **Food cards (fixes C-1 VLM note):** remove mid-card dead space — title → macros → link with
  `gap-2`, min-height unified; whole card becomes the link (fixes the tap-target note).
- **Exercise/program cards:** unchanged except inherited recipe restyle.
- **Blog carousel:** keep; optional featured-card accent edge (S-3).

## 12. Header & footer strategy

**Header:** keep 64px sticky chrome navbar (P-7). Changes: desktop nav item padding +2px and 14px
labels (VLM «cramped» note); nav dropdown panels inherit tokens automatically; drawer unchanged.

**Footer (fixes C-7/C-8):**
- Desktop: keep 6-column layout but 13px links, `leading-7`, hover `--accent` (was underline-only),
  headings 11px/600 bronze. Marble slab → structural band (§9.1).
- Mobile: 5 link lists collapse into **2 accordion groups** («المنصة / Platform», «الخدمات /
  Services») with 44px rows — footer drops from 1,273px to ≈ 700px; newsletter input+button stack
  full-width; meander band removed; credit line kept.

## 13. CTA strategy

1. **Two-button law stays** (P-6) — `.btn-chrome` (bronze-steel fill) + `.btn-outline`
   (text border + translucent fill over artwork).
2. **Sizing standard (fixes C-15):** primary 48px mobile / 52px desktop height; secondary 44/48;
   carousel arrows 36px desktop → **44px on touch** (`max-md:` variant); min-width 44px everywhere.
3. **Section CTA hierarchy (fixes C-13):** exactly one primary (bronze) CTA per viewport-fold on
   the page: hero «Start free», plan «Create My Plan», EVO «Try EVO», final band «Start free».
   Memberships section: memberships card gets the filled button, coaching card keeps outline
   (S-1 → Decision pending owner confirmation, Open O-3).
4. **Focus/hover:** bronze focus ring on all interactive elements; `.btn-chrome` hover gets
   brightness lift + 1px translate (existing pattern kept).
5. **Account-driven law, destinations, labels:** untouched (test-pinned).

## 14. Arabic/English copy recommendations

Overall verdict: the copy is in **good shape** — proper MSA, confident athletic tone, no hype, no
colloquial. The Phase-257 rewrite already embodies the requested voice. Recommendations are
surgical:

| # | Location | Current | Recommendation | Type |
|---|---|---|---|---|
| K-1 | Memberships card + FAQ (×3) | «توليدات خطط أكثر» | «توليد خطط أكثر» — «توليدات» is a mechanical pseudo-plural; the verbal noun is natural MSA | Refine (AR) |
| K-2 | Featured coaches H2 | «مدربون على المنصة» vs EN "Featured Coaches on Alkemos" | «مدربون مميزون على Alkemos» — restore the «featured» meaning (C-17) | Fix (AR) |
| K-3 | Newsletter button | «اشترك الآن مجانًا» | «اشترك مجانًا» — drop the salesy «الآن» the EN deliberately avoids (C-17) | Fix (AR) |
| K-4 | Footer credit | «صُنع بحب لمجتمع اللياقة» / "Built with care for the fitness community" | align: «صُنع بعناية لمجتمع اللياقة» (C-17) | Fix (AR) |
| K-5 | Muscle chip | «بطن/كور» | «الجذع (كور)» or plain «كور» — the slash pair reads as an unfinished edit | Refine (AR) |
| K-6 | Hero subtitle (both) | EN 17 words / AR 13-word sentence | trim ~25%: EN «Training, nutrition, and smart tools — one plan that moves with you toward your goal.» AR «تدريب وتغذية وأدوات ذكية — خطة واحدة تقترب بك من هدفك.» (shorter line also relieves C-9) | Refine (both) |
| K-7 | Memberships card descriptions (both) | 30+ word paragraphs in a 2-col card | cut ~20% (drop the enumeration to 3 items max); EN keeps «more AI plan generations, unlimited EVO chat, ad-free» core | Refine (both) |
| K-8 | FAQ answers (both) | 40–60 words each | acceptable on desktop (trust-building); keep as-is — they mirror real entitlements (law). No change. | Keep |
| K-9 | Path card bodies (mobile impact) | 20–25 words each | clamp 2 lines mobile (CSS), full text desktop — no copy change needed | Layout-only |
| K-10 | EVO sub-line | «تجده في فقاعة المحادثة أسفل كل صفحة…» | fine MSA, clear; keep | Keep |

No copy introduces hype/aggressive commercial language; none should. The tagline «اصنع قوّتك
الأسطورية.» / "Forge Your Legendary Strength." stays — it is the brand line, not a sales CTA.

## 15. Light/Dark mode strategy (Decision)

- Both modes are designed as equals from the same token table (§8.2) — dark is not a derived mode.
- Dark mode gets: perceptible `--bg`/`--bg-alt`/`--card` surface steps (3-level elevation), a
  lightened bronze accent with its own contrast gate, warm (not blue) near-black base.
- Theme parity law unchanged: same DOM, tokens flip only. ThemeImg dual-asset system unchanged.
- `--chrome` gradient identical in both modes (current behavior) with warm retune.
- The Phase-126 dark shim for authenticated app surfaces stays until its own future project.

## 16. Responsive/mobile strategy

1. **Pacing (fixes C-10):** compress paths/plan/memberships blocks on mobile per §11; target page
   height ≤ 9,500px (from 11,374px) with zero content removal.
2. **Hero (fixes C-9):** mobile hero min-height → `max(56vh, 100vw×713/1280)`; CTAs stack
   (full-width primary, full-width secondary), «Log in» becomes a quiet centered link with 16px
   clearance; artwork object-position tuned to keep the barbell/columns focal band.
3. **Chips row (fixes C-11):** single horizontal scroll-snap row with edge fade masks (the Phase-200
   pattern) — no wrapping.
4. **Tables:** no homepage tables (retired); `/compare` + `/memberships` mobile table compaction
   already handled (Phase 131) — verify only.
5. **Breakpoint checks:** 390 / 768 / 1024 / 1440 in both languages and both modes, zero horizontal
   overflow (currently clean — keep it clean).

## 17. Accessibility considerations

- **Fix C-4:** focus ring → `--accent-deep` 2px (contrast-checked); remove indigo.
- **Fix C-1/C-2/C-3:** Arabic font/ls/lh (§10.2) — the single biggest a11y-of-reading win.
- **Touch targets (C-15):** 44px minimum on mobile for all interactive elements including carousel
  arrows and footer accordion rows.
- **Contrast gates (new, enforced in §21):** `--text`/`--muted`/`--accent` on `--bg`, `--bg-alt`,
  `--card` in BOTH modes ≥ 4.5:1 (small text) — computed, not eyeballed; `.accent-text` ramps keep
  the Phase-198 ≥9.8:1-style light-mode discipline.
- **FAQ chevron:** increase size/contrast; full-row hover state (VLM).
- **Cookie bar:** keep 44px+ buttons; theme-aware glass (S-5) must keep ≥4.5:1 label contrast.
- **`prefers-reduced-motion`:** all new hover/translate effects added to the existing kill-switch
  blocks.
- Keep: skip-link, dialog semantics, aria labels, RTL logical properties (P-10).

## 18. Performance considerations

- **No new assets** except optional O-1b logo regeneration. All color/background changes are pure
  CSS (var values + recipe edits).
- **Removed requests:** texture-marble (3.1KB + 24.4KB), divider-meander (15.9KB + 9.4KB) — ~53KB
  and 4 requests saved on first visit; one paint layer fewer per card (123 surfaces).
- **Kept:** WebP discipline, fixed-ratio media, lazy dark variants, `font-display: optional` Cairo,
  preloads — all unchanged (P-1/P-4, DESIGN.md §9).
- **CWV expectation:** neutral-to-positive (LCP untouched — hero artwork path identical; CLS none —
  no layout-affecting changes; paint cost slightly lower). Validate against
  `docs/SEO-CWV-THRESHOLDS.md` in §21.

---

# PART III — IMPLEMENTATION PLAN

## 19. Affected components & files

| File | Change |
|---|---|
| `src/app/globals.css` | Token values (§8.2) + `--bg-alt`/`--accent*` additions; `.btn-chrome`/`.btn-outline` restyle; `.marble-card` recipe (texture → inner highlight); `.meander-divider`/`.footer-marble`/`.footer-meander-top` retirement; RTL typography layer fix (§10.2); focus ring; `.evo-art-mask` multi-stop; dark shim values; delete dead CSS (C-18); `--font-display` stack fix |
| `src/components/views/LandingView.tsx` | Hero mobile composition (§16.2), CTA stacking, chips scroll-snap row, path/plan/memberships mobile density, memberships CTA asymmetry (O-3), copy K-1/K-2/K-5/K-6/K-7, hover classes |
| `src/components/SiteFooter.tsx` | Structural band, mobile accordion groups, link sizing/hover, credit K-4, meander removal |
| `src/components/SiteHeader.tsx` | Nav item spacing/labels only |
| `src/app/metadata.ts` | `themeColor` → ivory/graphite pair (C-4) |
| `src/components/NewsletterForm.tsx` | Button label K-3 |
| `tailwind.config.ts` | Remove indigo `glow`/`gold` shadows + legacy mappings if unreferenced (verify by grep in V4) |
| `src/lib/__tests__/homepage-adoption.test.ts` + `marketing-msa-surface.test.ts` | Re-pin canaries affected by copy K-1/K-2/K-5 (banned-string + required-string lists) — **law: canaries change in the SAME commit as the copy** |
| `public/images/brand/` | (V4, O-1b only) regenerate `logo-hero-light.webp` (+srcSet variants); delete texture-marble/divider-meander pairs **only after** the CSS retirement wave ships (cache law: filenames changing content keep the no-cache rule) |
| `DESIGN.md` | Full rewrite to the new system in the final wave (§20 V5) — it is the binding UI reference |
| `docs/README.md` + `STATE.md` + `worklog.md` | Registry row (this commit), STATE refresh per wave, worklog entries per wave |
| **NOT touched** | `ThemeImg.tsx`, `PageBanner.tsx` (inherits tokens), business logic, APIs, DB, SEO mirrors/routes, `home-samples.ts`, EVO widget law, membership logic, authenticated app surfaces (beyond inherited shim values) |

## 20. Implementation order (waves — each is one commit with full §3.5 gates + §21 checks)

| Wave | Scope | Exit criteria |
|---|---|---|
| **V0 — Typography & a11y fixes (no palette change)** | C-1/C-2/C-3 RTL fix (§10.2), focus ring C-4, themeColor, touch targets C-15, FAQ chevron | AR pixel-font test passes; tsc/eslint/vitest/build green; AR+EN screenshots: H1 renders Cairo, ls 0 |
| **V1 — Token foundation** | §8.2 token values in `globals.css` (both modes), `--chrome` retune, `.btn-*` restyle, dark shim values | Contrast matrix (§21.1) all ≥ thresholds; light+dark+AR visual pass; canaries green |
| **V2 — Surfaces & structure** | `.marble-card` recipe (no texture + highlight), footer rebuild (§12), meander removal, header spacing, cookie bar glass (S-5) | Footer mobile ≤ ~750px; VLM pass 6 contexts; no horizontal overflow 390px |
| **V3 — Homepage density & CTAs** | §11 mobile density, §13 CTA standard + stacking, §16 hero mobile + chips row, memberships asymmetry (O-3 if approved) | Page ≤ 9,500px mobile; CTA audit table green; live-E2E both languages both modes |
| **V4 — Copy & assets** | K-1…K-7 copy + canary re-pins in the same commit; optional O-1b logo regeneration | FAQ JSON-LD still single-source; og:title/description unchanged; MSA detector clean |
| **V5 — Sweep & docs** | Secondary pages visual pass (memberships/tools/blog/evo/auth surfaces inherit), dead-CSS deletion (C-18), `DESIGN.md` rewrite, STATE/worklog closure | Full gate suite + `docs_audit.py` + `check-stale-refs` + `check-ui-wiring`; VLM final 6-context pass |

Waves are independently shippable and reversible; V0 can land immediately (it fixes a live bug
with zero visual-direction dependency).

## 21. Validation & testing requirements (per wave)

1. **Contrast matrix (script, committed to `scripts/`):** compute WCAG ratios for every
   text-token × surface-token pair in both modes; hard-fail < 4.5:1 (normal text) / 3:1 (large,
   UI borders). Includes `.accent-text` ramp stops (Phase-198 discipline).
2. **Canonical gates (AGENTS.md §3.5):** `tsc --noEmit` 0 · `eslint` 0 · `vitest run` ·
   `next build` · `docs_audit.py` · `docs_parity.py` · `migration_audit.py` ·
   `check-stale-refs.sh` · `check-ui-wiring.sh`.
3. **Canary law:** any copy/structure change lands with its test re-pin in the same commit
   (homepage-adoption, marketing-msa, ai-meal-planner).
4. **Visual regression pass (DESIGN.md §10 protocol):** VLM screenshot review in 6 contexts —
   EN/AR × light/dark × 1440/390 — per wave, against owner previews for direction sign-off.
5. **AR font regression check:** the §10.2 pixel-width test scripted and added to the wave report
   (h1 stack == Cairo width on `/ar`).
6. **Live smoke:** all 23 homepage-linked routes 200 (Phase-257 protocol), both languages.
7. **CWV:** Lighthouse mobile ≥ thresholds in `docs/SEO-CWV-THRESHOLDS.md`; expect neutral/positive.
8. **RTL mirror checklist:** carousel arrows mirrored (verified correct today — keep), EVO mask
   flip, steps 01→03 flow, chips row direction, footer accordion chevrons.

## 22. Risks & rollback

| Risk | Severity | Mitigation |
|---|---|---|
| `.marble-card` recipe change touches 123 usages / 42 files (visual regression breadth) | High | Recipe-level change (one CSS edit) + VLM 6-context pass + staged waves V2 before V3; surfaces verified on secondary pages in V5 |
| Canary tests pin current copy/structure | Medium | §19 same-commit re-pin law; never edit tests to «make it pass» without the owner's copy approval |
| Bronze accent contrast fails on a surface (esp. `--accent` on `--bg-alt`) | Medium | §21.1 hard gate before merge; token values are proposals until the matrix passes |
| RTL layer fix changes EN rendering unexpectedly | Medium | Unlayered block scoped `[dir="rtl"]` only; EN screenshot diff in V0 |
| Owner dislikes bronze direction after V1 | Medium | V1 is one token commit — revert restores Phase-126 palette; O-1 decisions are isolated |
| Logo regeneration (O-1b) degrades light-mode legibility | Low | Optional wave; A/B against current lockup with VLM + owner sign-off; keep old asset until approved |
| Dark shim values drift for authenticated app surfaces | Low | Shim maps to the same token names — values inherit; authenticated surfaces explicitly out of scope (P-8 triage) |
| Rollback | — | Each wave = one revertable commit; no data/schema/API changes anywhere in this plan |

## 23. Recommendations that should NOT be implemented (explicitly rejected)

1. **Do NOT shrink section H2s to Gemini's 28–32px** — 36px is correct for this scale and the
   verified hierarchy; only AR line-height/spacing changes.
2. **Do NOT add more color** beyond the single bronze/steel accent family — no second accent, no
   gradients on sections, no neon, no expanding `--ai` cyan beyond AI surfaces.
3. **Do NOT consolidate the light/dark image assets or switch to JS theme images** — measured
   zero-waste (§9.4); the current CSS-pair system is preserved.
4. **Do NOT make every section a card / add card chrome to everything** — sections stay open with
   alternation; only true interactive items are cards.
5. **Do NOT make every button a prominent conversion CTA** — two-button law + one-primary-per-fold
   (§13) preserves the «serious platform, not sales page» feel.
6. **Do NOT add Greek decorative motifs** (meander bands, column silhouettes, patterned
   backgrounds) — heritage lives in the mark, logo, and photography only.
7. **Do NOT apply global letter-spacing / uppercase transforms to Arabic** (uppercase transform is
   a no-op but the tracking is harmful) — §10.1 AR column governs.
8. **Do NOT touch**: account-driven CTA logic, EVO chat-surface law, no-prices law, FAQ
   single-source, SEO canonical/hreflang/OG architecture, `home-samples` bundle law, authenticated
   app surfaces, business logic, DB, APIs.
9. **Do NOT rewrite the copy wholesale** — the Phase-257 voice is already right; only K-1…K-7 land.

## 24. Open decisions for the owner (defaults chosen so execution can proceed)

| # | Question | Default if no answer |
|---|---|---|
| O-1 | Strengthen light-mode chrome logo (regenerate asset, §9.3)? | **No** — keep current pair (V4 skips logo regen) |
| O-2 | Footer micro-motif (single laurel separator)? | **No motif** — clean hairline |
| O-3 | Memberships CTA asymmetry: memberships filled + coaching outline? | **Yes** (recommended — fixes C-13) |
| O-4 | Bronze exact hue: warmer (#8C6A3F proposal) vs cooler steel-bronze? | Proposal values, subject to §21.1 matrix |
| O-5 | Execute waves V0–V5 back-to-back or pause after V1 for direction sign-off? | **Pause after V1** for owner visual approval (one screenshot review), then continue |

## 25. Owner decisions record — V1 execution directive (2026-09-23, supersedes the bronze direction)

After seeing the V1 bronze preview (`download/v1-preview/`, owner session 2026-09-23) the owner
rejected the bronze accent («مش عاجبنى لون البرونز») and settled the direction as
**«تحسين الهوية الحالية دون تغييرها»** — enhance the current identity without changing it:

| # | Decision (owner, 2026-09-23) | Consequence for this plan |
|---|---|---|
| O-4 (REVISED) | **Bronze rejected.** Foundation = **Chrome/Silver + Black/Graphite + Ivory/Warm Off-White**, **no new accent color**. Keep the Alkemos images, EVO, Chrome, the athletic identity, and the light Greek identity. | §8.2 keeps the warm neutral ramp (ivory/graphite) but DROPS the `--accent*` family entirely; §8.3's accent roles stay with the existing families (`.chrome-text` numerals re-warmed, token links, graphite focus ring). §8.4's chrome warm retune stands (coldest stop `#878E94` → `#8E8A82`). Result brief: premium / athletic / clean — not flashy, not salesy. |
| V1 scope (EXTENDED) | **Marble treatment removed per V1** (owner order — the plan had it in V2). | `.marble-card::before` + `.footer-marble` slab retired in the V1 commit; cards get the §9.1 inner top-edge highlight; footer becomes the structural band. **Meander dividers STAY** (light Greek identity kept). V2 keeps the remaining surface work (footer rebuild, header spacing, cookie glass). |
| Modes | **Light and Dark are equal citizens** (§15 unchanged). | Dark shim values land in the same V1 token commit. |
| O-1/O-2/O-3/O-5 | Provisional adoption stands: no logo regen · no footer motif · CTA asymmetry YES (lands V3) · **pause after V1** for the owner's visual review before V2–V5. | Execution session stops after V1 + live verification and awaits the owner. |
| **V2 GO (owner order 2026-09-23 «اكمل المرحلة التالية»)** | **V2 executed** (phase 262): footer rebuild (§12/C-8 — mobile 1,273px → **668px**: two native `<details>` groups «الخدمات/Services» + «المنصة/Platform», 44px rows, lg+ keeps the 6-col map via the desktop/drawer pattern; href-sync law ×2 canary-pinned; 13px/leading-7 links + 11px headings) · header spacing (§12: nav items px-3.5 +2px, gap-1) · cookie glass (S-5/C-16: `color-mix(--card 92%/88% dark)` + `blur(16px)` + `@supports` solid fallback). **Meander stays everywhere** (owner direction — §25 V1 row supersedes the plan's §9.2 removal; footer-meander-top + both homepage dividers kept). Contrast gate extended: glass worst-case underlay (synthetic black/white) — label 7.58/6.87 · ink 14.07/11.01, all ≥4.5:1. | Desktop/mobile × EN/AR × light/dark verified (5-col grid aligned, RTL, zero overflow 390px, VLM pass); next wave V3 awaits the owner's order per O-5 discipline. |

Validation: `scripts/v1_contrast_matrix.py` (committed with V1 — §21.1 made real for the monochrome
system: text/surfaces ≥4.5:1 both modes, chrome-stop ink ≥4.5:1, `.chrome-text` ramps ≥4.5:1 incl.
the pinned-black cards, focus ring ≥3:1, alternation ΔL* ≥2.8 both modes — measured from
`globals.css` at run time, never hand-copied; **extended in V2** with the cookie-glass worst-case
underlay gates).

