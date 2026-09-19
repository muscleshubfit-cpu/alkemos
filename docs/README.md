# docs/ — Documentation Lifecycle Registry

> **Provenance:** created Phase 236 (2026-09-19) by the owner-approved Documentation & Context
> Architecture Migration Plan §7 — the sanctioned exception to AGENTS.md §12.5's no-new-docs law
> (plan: `docs/DOCS-CONTEXT-MIGRATION-PLAN-2026-09-19.md`).
> **Law:** any new documentation file lands WITH its row here in the SAME commit (§3.8 parity);
> a status that stops being true is a bug — the §12.5.2 audit re-verifies this table.
> **Agent session reading budget (§3.6, sized after the Phase-235 de-dup):**
> `STATE.md` (~22 KB) → `AGENTS.md` §1–§4 + §12 (~39 KB) → top-3 `worklog.md` entries (~130 lines)
> → everything else ON DEMAND via STATE's source-of-truth map. Do not read this file top-to-bottom
> in a normal session — jump to the row you need.

## Registry — core context sphere (repo root)

| File | Role | Status | Last updated | Law-ref |
|---|---|---|---|---|
| `STATE.md` | Living status — FIRST file of every session | LIVE | 2026-09-19 (Ph 237) | §3.6/§3.8 |
| `AGENTS.md` | Binding law for every agent | LIVE | 2026-09-19 (Ph 237) | §1–§12.10 |
| `worklog.md` | Task log — active window (top-12 + rolling date buffer), newest on top; full history in the archive | LIVE | 2026-09-19 (Ph 237 rotation) | §12.5.1 |
| `README.md` | Front door + feature law surface | LIVE | 2026-09-19 (Ph 239 — public-interface rewrite: current-Alkemos-only, number-law + STATE-link preserved) | §3.8 |
| `DEVELOPER_GUIDE.md` | Onboarding + architecture | LIVE | 2026-09-19 (Ph 233) | — |
| `SECURITY.md` | Security policy | LIVE | 2026-09-18 | §7 |
| `DESIGN.md` | Design system — binding UI/UX reference | LIVE | 2026-09-19 (Ph 233) | — |
| `CONTRIBUTING.md` | Contribution policy (static) | LIVE | 2026-08-21 | §12.5 exception |
| `CHANGELOG.md` | Pointer to per-phase tracking (STATE/worklog) | LIVE | 2026-09-19 (filled Ph 233 — Phase-111 order honored) | §12.5 exception |
| `archive/PROGRESS.md` + `archive/QA_CHECKLIST.md` | Phase-115 merged status files, verbatim | FROZEN (docs_audit J guards zero commits since 2026-09-16) | — | §3.8 |
| `archive/PROGRESS_ARCHIVE.md` · `archive/WORKLOG_ARCHIVE.md` · `archive/QA_CHECKLIST_ARCHIVE.md` | Append-only history overflow | ARCHIVE — append-only (received the pre-2026-09-10 worklog tail — Phase-237 rotation, verbatim) | — | §3.8 |

## Registry — docs/ suite

| File | Role | Status | Last updated |
|---|---|---|---|
| `docs/README.md` (this file) | Documentation lifecycle registry | LIVE | 2026-09-19 (Ph 236) |
| `docs/TECH_REFERENCE.md` | Deep technical reference (Supabase/RLS/migrations/storage) | LIVE | 2026-09-18 |
| `docs/CI_GATES.md` | Gate narrative (what each CI gate derives and why) | LIVE | 2026-09-19 (Ph 234 + 237 hardening) |
| `docs/SEO-GEO-MASTER-PLAN.md` | SEO/GEO plan + §12 execution log (log is append-only) | LIVE | 2026-09-16 |
| `docs/SEO-EEAT-FRAMEWORK.md` | SEO reference (static) | LIVE | 2026-08-25 |
| `docs/SEO-SCHEMA-REFERENCE.md` | SEO schema reference | LIVE | 2026-09-15 |
| `docs/SEO-CWV-THRESHOLDS.md` | CWV thresholds reference (static) | LIVE | 2026-08-25 |
| `docs/EVO-MASTER-PLAN.md` | EVO plan (EVO-6 partner API removed; decisions §7) | LIVE | 2026-09-10 |
| `docs/_AUDIT.md` | Historical audit snapshot | **HISTORICAL** (2026-08-25) — retired as the operative procedure by Ph 236 (§12.5.2 now points here) | 2026-09-01 |
| `docs/_NAV_MAP.md` | Historical navigation snapshot | **HISTORICAL** (2026-08-25) | 2026-09-01 |
| `docs/DEEP-AUDIT-PLAN-2026-09-16.md` | Point-in-time remediation plan | **EXECUTED** (waves 215–217) | 2026-09-13 |
| `docs/DEEP-AUDIT-REPORT-2026-09-16.md` | Point-in-time deep audit | **EXECUTED** (findings 4–24 remediated 215–217) | 2026-09-16 |
| `docs/VERCEL-USAGE-AUDIT-2026-09-16.md` | Point-in-time Vercel usage audit | **EXECUTED** (items 1–4; §5.4/§9 updated by VERCEL-USAGE-4 2026-09-19) | 2026-09-19 |
| `docs/DEEP-UX-AUDIT-REPORT-2026-09-18.md` | Point-in-time UX audit | **EXECUTED/CLOSED** (items closed by Phases 225–229) | 2026-09-18 |
| `docs/UI-AUDIT-HOMEPAGE.md` | Point-in-time UI audit | **EXECUTED** (STATE entry 198) | 2026-09-14 |
| `docs/UI-IMPLEMENTATION-PLAN.md` | Point-in-time UI plan | **EXECUTED** | 2026-09-14 |
| `docs/DOCS-CONTEXT-AUDIT-REPORT-2026-09-19.md` | Docs/context architecture audit (F-01..F-14, RC-1..RC-7) | **EXECUTED** (findings closed by Phases 232–237 = plan Phases 0–5; F-03 closes with the owner's branch-protection UI step; closure = Phase 238) | 2026-09-19 |
| `docs/DOCS-CONTEXT-MIGRATION-PLAN-2026-09-19.md` | The migration plan this registry was born from | **EXECUTED** (Phases 0–5 landed: 2d9c4e32 · c0fee8a6 · 73ad3065 · ebda6c54 · 2651cfa9 · 3fdc7a09; closure = Phase 238; Phase 6 = owner UI actions — walkthrough in the P6-CLOSURE worklog entry) | 2026-09-19 |
| `docs/investor/INVESTOR-TECHNICAL-MASTER.md` | Investor technical master audit — code-verified source of truth for the future AR/EN investor decks (audit of commit 6795b5b0; docs-only, zero code change) | LIVE (input artifact for the deferred investor-materials stage in STATE) | 2026-09-19 |
| `docs/FOOD-DATA-LANGUAGE-AUDIT-REPORT-2026-09-19.md` | Point-in-time read-only audit — food data language separation: root cause (80 curated bilingual vs 8,750 USDA English-only `nameAr`), scope across datasets, live production URL evidence, SEO/GEO impact split confirmed/likely | **EXECUTED** (read-only by owner order — findings delivered; any remediation awaits a new owner order) | 2026-09-19 |
| `docs/FOOD-DATA-ARABIZATION-PLAN-2026-09-19.md` | Arabization plan for the 8,750-row USDA tail — field-by-field scope (`nameAr` only; tags/serving decisions), size/perf/build/sitemap/SEO-GEO impact (incl. the EVO grounding unlock), hybrid tiered-band strategy, CI guards, immutables, phased execution plan | **EXECUTING** (owner order 2026-09-19 — Phase 1 pilot executed, see the pilot report; Phase 2+ await GSC-gated owner orders) | 2026-09-19 |
| `docs/FOOD-ARABIZATION-PILOT-1-REPORT-2026-09-19.md` | Pilot-1 execution report — 481 USDA foods Arabized (nameAr, MSA, fail-closed pipeline), Phase-0 infra (SEO_FOOD_BAND manifest + ?lang param), all seven plan guards shipped, sitemap policy deliberately HELD, full local verification evidence | **EXECUTED** (Phase 240; GSC 30-day measurement window now open) | 2026-09-19 |

Other registries (outside `docs/`): `supabase/migrations/INDEX.md` — binding migration ledger (LIVE, guarded by `docs_parity.py`) · `.env.example` — environment reference (LIVE).

## How to keep this registry true

1. **New doc lands → new row in the same commit** (name it in the commit body too).
2. **Point-in-time docs** (audits/plans) get their status flipped to EXECUTED when their findings land, with the closing phase numbers.
3. **§12.5.2 monthly audit** = re-verify this table (files exist, statuses true, dates match `git log -1 --format=%as -- <file>`) + re-run the Appendix-A one-liners of `docs/DOCS-CONTEXT-AUDIT-REPORT-2026-09-19.md`.
4. A doc that stops being cited anywhere and describes nothing live is FROZEN-to-archive material (§3.8) — move it, don't delete history.
