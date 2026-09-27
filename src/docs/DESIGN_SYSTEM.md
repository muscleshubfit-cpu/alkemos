# Alkemos Design System — pointer (single-source unification)

> **Status:** POINTER-ONLY (Phase 292 — ARCH-REMEDIATION, audit P3-4): the
> DESIGN-mirror unification — **`DESIGN.md` (repo root) is the single binding
> design law**, and `src/app/globals.css` is the runtime source of truth for
> every token (`:root` + `[data-theme="dark"]`) and recipe class. This file
> and `src/styles/design-tokens.ts` stopped mirroring them: a mirror that
> must be hand-synced in every UI frame is a third copy of the same truth
> (a UI change used to touch three docs), and the 2026-09-28 architecture
> audit (Part C §12 / P3-4) unified the surfaces into one law + one runtime
> source — a UI change now touches `DESIGN.md` + `globals.css` only.
> **Provenance:** born 2026-09-25 (VRD-V6 owner directive — «حدّث/أنشئ
> `src/styles/design-tokens.ts` و `src/docs/DESIGN_SYSTEM.md`») as the
> implementation-facing reference; its full content (philosophy, token tables,
> recipes, page-order tables) is preserved verbatim in git history through
> Phase 291, and the binding content lives in `DESIGN.md` + the recipe
> classes in `globals.css`.
> **On conflict:** code wins (AGENTS.md §12.8) — `globals.css` first, then
> `DESIGN.md`, then this pointer.
