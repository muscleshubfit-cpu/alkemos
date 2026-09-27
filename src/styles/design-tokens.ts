/**
 * ALKEMOS DESIGN TOKENS — pointer-only module (Phase 292 — ARCH-REMEDIATION).
 *
 * DESIGN-MIRROR UNIFICATION (owner-approved architecture audit 2026-09-28,
 * P3-4): `DESIGN.md` is the single binding design law and
 * `src/app/globals.css` is the runtime single source of truth for every
 * token (`:root` + `[data-theme="dark"]`). This typed mirror was retired —
 * it had ZERO importers and duplicated globals.css values by hand (a drifted
 * mirror is worse than no mirror). The full typed registry is preserved in
 * git history through Phase 291; contrast gating parses globals.css
 * directly (`scripts/v1_contrast_matrix.py`).
 *
 * Do NOT re-add token constants here — extend globals.css and document the
 * law in DESIGN.md in the same commit.
 */

export {};
