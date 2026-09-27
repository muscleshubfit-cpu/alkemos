# Documentation & Agent-Context Architecture Audit — Alkemos

> **Provenance:** Created by direct owner order 2026-09-19 («Perform a deep architectural audit of the project's
> current documentation and agent-context system… Document the complete audit and implementation plan in the
> repository… Do not implement the plan yet»). This file + its companion `DOCS-CONTEXT-MIGRATION-PLAN-2026-09-19.md`
> are the sanctioned exception to the AGENTS.md §12.5 no-new-docs law for this order.
> **Audit baseline:** `origin/main` HEAD `8321e718` (2026-09-18) — every finding below was verified against this tree.
> **Method:** read-only inspection — full file inventory, line/byte metrics, gate re-runs (`docs_audit.py`,
> `docs_parity.py`), cross-reference extraction across all 34 tracked `.md` files, worklog chronology mapping,
> GitHub Actions status check. No project file was modified, moved, renamed, or deleted.
> **Scope:** the documentation/agent-context SYSTEM only (STATE/AGENTS/worklog/archive/docs/CI gates/commit
> conventions). Product-code audits live elsewhere (Phase 214 report; DEEP-UX-AUDIT-REPORT-2026-09-18).
> **Companion plan:** [`docs/DOCS-CONTEXT-MIGRATION-PLAN-2026-09-19.md`](DOCS-CONTEXT-MIGRATION-PLAN-2026-09-19.md) — status: **EXECUTED** (Phases 0–5 landed as repo Phases 232–237 — Phase 5 executed as option (b) rotation per owner order 2026-09-19 «Continue with Phase 5 using option (b)»; closure = repo Phase 238; Phase 6 owner actions attempted by the ordered agent → HTTP 403 (token scope) — §12.9 walkthrough in worklog entry DOCS-CONTEXT-MIGRATION-P6-CLOSURE-2026-09-19; F-03 closes on application).

---

## 1. Executive summary

The repo runs one of the most disciplined agent-context systems this audit has seen enforced as code: a single
living status file (STATE.md, Phase 115), a law file (AGENTS.md), an append-only worklog, a frozen archive
pattern, provenance banners, and CI gates that re-derive truth from the filesystem on every push. That said,
the system is now failing in three places **right now at HEAD**, and carries structural debt that grows with
every phase:

1. **The knowledge gate is RED on main.** `docs_audit.py` reports `[H/worklog-tail-freeze]` at `8321e718` —
   confirmed by GitHub Actions (Docs & schema parity gate: `failure` on `8321e718` and `b1fc74ae`). The last two
   pushes landed despite it because no branch protection requires the gate.
2. **The newest worklog entry broke the law invisibly.** `## Task ID: VERCEL-USAGE-4 (2026-09-19)` sits at the
   very **bottom** of `worklog.md` (line 5108 of 5123) in a non-standard header format the gate's `^Task ID:`
   parser never sees — so the newest-on-top law is actually violated while the gate stays blind to it.
3. **The budgets are gamed.** STATE.md holds to its 100-line cap by averaging **789 characters per line**
   (max 4,073; a 45-level nested phase chain on one line). The "30-second read" is now ~79 KB ≈ 20K+ tokens.

Root pattern: the system measures **proxies** (line counts, one regex format, a hand-bumped baseline constant)
instead of **invariants** (byte budgets, entry schema, derived boundaries) — and its append-only culture has no
compaction cycle for anything except the status files. Full findings, evidence, and root causes below; the
companion plan fixes them in 7 phases without redesigning the system.

---

## 2. How the context system actually works today (verified map)

Session loop every agent is required to run (AGENTS.md §3.6 + STATE.md tail):

```
open session → read STATE.md (law: first file) → git fetch + last 3 worklog entries + last 5 commit subjects
→ trust no number outside its mapped source (STATE "خريطة مصادر الحقيقة") → work → IMPLEMENT→VALIDATE→DOCUMENT→COMMIT→PUSH (§12.2)
→ same-frame docs parity: worklog entry (§12.5.1 template) + STATE refresh (§3.6/§3.8) + every file describing the change
```

Layers (roles as actually enforced, not as aspirationally described):

| Layer | File(s) | Role | Enforcement |
|---|---|---|---|
| Status (now) | `STATE.md` | Single living status: phase, open items, prohibitions, QA summary, source-of-truth map | `docs_audit.py` A/B/C checks: ≤100 lines, required sections, recorded commit must be ancestor of HEAD |
| Law | `AGENTS.md` | Binding operating rules §1–§12.10 (verification commands §3.5, parity law §3.8, worklog template §12.5.1, hierarchy §12.8) | E-check: no duplicate § numbers; cited by all gates |
| History | `worklog.md` | Append-only task log, newest-on-top active region + frozen legacy tail | H-check: top-12 window order + tail freeze vs hardcoded baseline `2026-09-17` |
| Frozen history | `archive/PROGRESS.md`, `archive/QA_CHECKLIST.md` (verbatim-frozen), `*_ARCHIVE.md` (append-only) | Phase-115 merged status files + overflow | J-check: frozen pair untouched since 2026-09-16; F-check: root resurrection gated |
| Reference | `docs/TECH_REFERENCE.md`, `docs/CI_GATES.md` | Deep technical narrative + gate narrative | I-check (header date) via governed-docs set |
| Point-in-time audits | `docs/DEEP-*.md`, `docs/VERCEL-USAGE-AUDIT-*.md`, `docs/UI-*.md`, `docs/_AUDIT.md`, `docs/_NAV_MAP.md` | Owner-ordered audit reports/plans | None — lifecycle status lives only in STATE prose |
| Registries | `supabase/migrations/INDEX.md`, `.env.example` | Migration ledger + env reference | `docs_parity.py`: INDEX heading == filesystem truth |
| Gates | `scripts/docs_audit.py` (408 ln), `docs_parity.py` (111), `migration_audit.py` (333), `check-stale-refs.sh` (49), `check-ui-wiring.sh` | Knowledge/schema/anti-regression enforcement on GitHub runners | 3 workflows on every push/PR to main — **advisory: no branch protection** |

Commit conventions (§10): direct commits to `main`, prefixes `feat:/fix:/docs:/…`, agent commits as the owner
identity, forward-only pushes. Commit messages have become a **third narrative store** (see F-06).

---

## 3. Inventory & metrics (audit baseline 8321e718, 2026-09-18)

### 3.1 Core agent-context files

| File | Lines | Bytes | Commits touching | Last commit | Role |
|---|---:|---:|---:|---|---|
| `worklog.md` | 5,123 | 1,031,756 | 524 | 2026-09-18 | Append-only task history (≈300K+ tokens whole-file) |
| `STATE.md` | 100 | 79,066 | 251 | 2026-09-18 | Living status — **79 KB in 100 lines** (avg 789 chars/line, max 4,073) |
| `AGENTS.md` | 280 | 38,767 | 86 | 2026-09-16 | Law file — required reading |
| `README.md` | 596 | 76,029 | 63 | 2026-09-18 | Front door + feature law surface |
| `DEVELOPER_GUIDE.md` | 826 | 50,557 | — | 2026-09-18 | Onboarding + architecture |
| `SECURITY.md` | 781 | 39,381 | — | 2026-09-18 | Security policy |
| `DESIGN.md` | 361 | 18,579 | — | governed | Design system |
| `CONTRIBUTING.md` | 5 | 478 | — | — | Contribution policy |
| `CHANGELOG.md` | 0 | 0 | — | — | **Empty tracked placeholder** |

### 3.2 Archive layer (~1.09 MB frozen)

| File | Lines | Bytes | Note |
|---|---:|---:|---|
| `archive/PROGRESS_ARCHIVE.md` | 4,191 | 558,518 | Append-only overflow |
| `archive/WORKLOG_ARCHIVE.md` | 3,671 | 320,008 | 134 entries — **newest are 2026-09-16 (Phases 207/208)**, not "old history" |
| `archive/QA_CHECKLIST_ARCHIVE.md` | 1,420 | 188,356 | Append-only overflow |
| `archive/PROGRESS.md` | 94 | 18,312 | Frozen verbatim @ Phase 115 (J-check guarded) |
| `archive/QA_CHECKLIST.md` | 120 | 19,849 | Frozen verbatim @ Phase 115 (J-check guarded) |

### 3.3 docs/ suite

| File | Lines | Last commit | Lifecycle reality |
|---|---:|---|---|
| `SEO-GEO-MASTER-PLAN.md` | 1,839 | 2026-09-16 | Plan doc; §12 "Implementation Log" = lines 662–1790 ≈ **61% of the file is a log** |
| `_AUDIT.md` | 691 | 2026-09-05* | **Historical snapshot 2026-08-25** — yet AGENTS.md §12.5/§12.5.2 still cite it as the operative audit procedure |
| `_NAV_MAP.md` | 425 | 2026-09-05* | Historical snapshot 2026-08-25 |
| `TECH_REFERENCE.md` | 308 | 2026-09-18 | Live reference (post-214 refresh) |
| `DEEP-AUDIT-REPORT-2026-09-16.md` | 271 | 2026-09-16 | Point-in-time (code+docs audit; findings 4–24 → remediated 215–217) |
| `VERCEL-USAGE-AUDIT-2026-09-16.md` | 227 | 2026-09-18 | Point-in-time (items 1–4 executed per worklog) |
| `SEO-EEAT-FRAMEWORK.md` | 210 | 2026-08-25 | Reference (static) |
| `DEEP-UX-AUDIT-REPORT-2026-09-18.md` | 183 | 2026-09-18 | Point-in-time (items closed 225–229 per STATE) |
| `SEO-SCHEMA-REFERENCE.md` | 133 | 2026-09-15 | Reference |
| `UI-AUDIT-HOMEPAGE.md` | 116 | 2026-09-14 | Point-in-time (executed: STATE entry 198) |
| `EVO-MASTER-PLAN.md` | 116 | 2026-09-10 | Plan (EVO-6 removed; decisions §7) |
| `SEO-CWV-THRESHOLDS.md` | 110 | 2026-08-25 | Reference |
| `UI-IMPLEMENTATION-PLAN.md` | 90 | 2026-09-14 | Point-in-time (executed) |
| `CI_GATES.md` | 80 | 2026-09-16 | Live gate narrative |

\* last real content 2026-09-01 (Phase 82 banners); 2026-09-05 was the Phase-121 rebrand sweep.

### 3.4 Chronology stress data (worklog entries per day, live file)

| Date | 2026-09-14 | 09-15 | 09-16 | 09-17 | 09-18 | 09-19 |
|---|---:|---:|---:|---:|---:|---:|
| Parsed entries | 12 | 9 | 13 (+ more archived) | 9 | 13 | **0 parsed — 1 unparsed at bottom** |

The 12-entry active window **cannot survive any day with >12 entries** without a manual baseline bump
(see F-01/F-14). 2026-09-18 alone produced 13.

---

## 4. Findings (evidence: file:line @ 8321e718)

Severity: 🔴 P0 = breaking now · 🟠 P1 = degrades every session · 🟡 P2 = debt actively growing · ⚪ P3 = polish.

### 🔴 F-01 — Knowledge gate RED on main right now
- **Evidence:** local run: `python3 scripts/docs_audit.py` → `1 knowledge-system violation(s): ❌ [H/worklog-tail-freeze] worklog.md entries below the top 12 include dates up to 2026-09-18 — newer than the frozen-tail baseline 2026-09-17`. GitHub Actions (API, 2026-09-19): *Docs & schema parity gate = failure* on `8321e718` and `b1fc74ae`; quality gate & stale-refs = success.
- **Mechanism:** entry #13 `DEEP-UX-AUDIT-224-2026-09-18` (worklog.md:282) slid below the top-12 window when Phases 225–231 added 9 more entries on 2026-09-18; `WORKLOG_TAIL_BASELINE` (docs_audit.py:229, hardcoded `"2026-09-17"`) was last bumped at Phase 226 and not since.
- **Impact:** the "docs can't lie" guarantee is currently suspended; red-on-main normalizes ignoring the gate (two consecutive pushes landed on top of it).

### 🔴 F-02 — Newest worklog entry is at the file bottom, invisible to the gate
- **Evidence:** worklog.md:5108 — `## Task ID: VERCEL-USAGE-4 (2026-09-19)` … file ends at 5123. The gate parses `^Task ID:` (docs_audit.py:236) → 208 entries, this is not one of them. Header format also violates the §12.5.1 template (`Task ID: <ID>` with date suffix inside the ID, no `##` prefix).
- **Impact:** the newest state (storage-overage fix, 2026-09-19) is where agents are *least* likely to look (§3.6 protocol reads the **top** 3 entries), and the newest-on-top invariant is silently false. This is the second real-world escape of the H-check (the first class was documented in Phase 215).

### 🔴 F-03 — Gates are advisory: no branch protection on main
- **Evidence:** STATE.md:50 (owner optional items: «أمان GitHub (Dependabot + فحوصات إلزامية على main)»); F-01's red gate coexisting with green pushes proves it.
- **Impact:** every gate's guarantee ends at "the run goes red". Required-status checks would convert the entire gate stack from advisory to enforcing at near-zero cost.

### 🟠 F-04 — STATE.md's 100-line budget is gamed by density
- **Evidence:** 79,066 bytes / 100 lines; avg 789 chars/line; line 6 (header) ≈ 4,073 chars; line 9 carries a **45-level nested phase chain** («فوق 230 (فوق 229 (فوق 228…»); §3.6/STATE header claim «~30 s» read.
- **Impact:** ~20K+ tokens for the "first file of every session" (likely 5–15 minutes of agent reading, not 30 seconds), mostly **phase history** rather than current state (see F-07). The line-count proxy no longer measures the budget it was designed for (Phase 107: "30-second read").

### 🟠 F-05 — worklog.md: 1 MB, three format generations, ad-hoc archive boundary
- **Evidence:** 5,123 lines / 1,031,756 bytes; three coexisting formats — standard template (line 7+), legacy `## Phase N` prose blocks (2122–5108), malformed `## Task ID:` (5108); mid-region chronology is non-monotonic (Phase 57 → 65-69 → 72 → … → 163 → … → SEO-GEO-6.10). The Phase-82 archive note at the top («آخر 10 مهام فقط») is marked deprecated (2026-09-17) but still describes a policy that no longer operates. Meanwhile `archive/WORKLOG_ARCHIVE.md` holds entries as fresh as 2026-09-16 (lines 3596, 3641 — Phases 207/208) while the live tail must freeze at 2026-09-17 — the live/archive boundary is wherever the last agent decided it was.
- **Impact:** no agent can hold the file; greps pull megabytes of context; the "active window" is a hairline in a 1 MB haystack; every new session risks re-deriving history that exists but can't be found.

### 🟠 F-06 — Triple storage of the same narrative (worklog + STATE + commit message)
- **Evidence:** HEAD commit `8321e718` body and the two before it carry multi-thousand-character messages that substantially restate their worklog entries (compare commit `9bf21018` body vs worklog entry `SHARE-UNIFY-231-2026-09-18`). STATE phase entries are a third compression of the same content.
- **Impact:** 3× write+review cost per phase, git history bloat, and three surfaces that can drift (and must be re-synced when one is corrected).

### 🟡 F-07 — STATE "المرحلة الحالية" is a history ladder, not current state
- **Evidence:** STATE.md lines 10–43 hold ~45 `(٠٠)` phase entries down to Phase 185, kept at exactly 100 lines via "sanctioned merges" (documented in QA rows) — content that duplicates worklog entries in compressed form.
- **Impact:** the cap meant to keep STATE a 30-second read is spent on history; the highest-value sections (source-of-truth map, prohibitions, open items) compete with it for lines, driving the density gaming of F-04.

### 🟡 F-08 — SEO-GEO-MASTER-PLAN.md is 61% execution log
- **Evidence:** §12 «سجل التنفيذ» spans lines 662–1790 of 1,839; STATE cross-references deep log sections (§12.53, §12.58, §12.59).
- **Impact:** plan and log in one file = the plan can never be slimmed without touching history; same pattern that made PROGRESS.md unmanageable pre-Phase-115, one layer deeper.

### 🟡 F-09 — Point-in-time audit docs accrete with no lifecycle index
- **Evidence:** 5 audit/plan docs in docs/ (`DEEP-AUDIT-*`, `DEEP-UX-AUDIT-REPORT`, `VERCEL-USAGE-AUDIT`, `UI-*`) — which are closed vs open is only recoverable from STATE prose; `docs/_AUDIT.md` (2026-08-25 snapshot) is still cited by AGENTS.md §12.5 («executed via docs/_AUDIT.md») and §12.5.2 (periodic audit cadence "per docs/_AUDIT.md") **as the operative procedure**, while its own header says «not a statement of current status». The Phase-214 audit already flagged the dead cadence («إيقاف §12.5.2 منذ 08-25»); the pointer itself was never fixed.
- **Impact:** new agents read a law pointing at a stale snapshot; future audits (including this one) add more files to an unindexed pile — the repo's front door (README "Additional Documentation") links none of the audit docs individually.

### 🟡 F-10 — Stale references inside governed docs
- `DEVELOPER_GUIDE.md:8` — «See also `PROGRESS.md` § "Reconciled Status"» → root file deleted at Phase 115 (frozen at `archive/PROGRESS.md`).
- `DEVELOPER_GUIDE.md:757` — «انظر `PROGRESS.md` Phase 5» → same.
- `DESIGN.md:163-164` — assets "rebuilt by `scripts/build_assets_v127.py` and … `build_assets_v3.py` + `fix_hero_logo2.py`" → **none of these scripts exist** in the tree (verified against `scripts/`), and `download/alkemos-brand/v3/` is untracked.
- `README.md` (Additional Documentation) — «worklog.md — Per-agent change log (older entries archived in archive/)» → deprecated description (see F-05).
- `AGENTS.md:144` — cites `docs/EVO-PARTNER-API.md` inside the EVO-6 REMOVED law → file intentionally deleted Phase 169; acceptable as history, but reads as a live pointer to any link-checking agent.
- `CHANGELOG.md` — tracked, 0 bytes: a dead placeholder with no decision recorded.

### 🟡 F-11 — Verification evidence referenced but not committed
- **Evidence:** 13 worklog entries are `LIVE-VERIF` records; e.g. entry `SHARE-UNIFY-231-LIVE-VERIF-2026-09-18` says «All checks recorded by scripts (local): scripts/live-verify-231.sh output + agent-browser transcripts» — `git ls-files` shows **no** `live-verify*` file was ever committed.
- **Impact:** violates the repo's own GUARD-COMMITMENT corollary in spirit («a guard that is not committed is not a guard»); live-verification claims cannot be reproduced from a clean clone, and §3.6's ephemeral-workspace law silently ate the evidence.

### ⚪ F-12 — Structure/role overlap between README and DEVELOPER_GUIDE; no agent reading-order map
- **Evidence:** README «🏗️ Project Structure» (221–330) vs GUIDE §2 «هيكلية الملفات التفصيلية» (106–217) cover the same tree at different depths (by design, but unmaintained duplication); no doc states the canonical per-session reading set + sizes (STATE → AGENTS → top-3 worklog → on-demand map).
- **Impact:** new agents discover the context system by folklore, not by a map; duplicated structure sections drift (GUIDE's is the one carrying stale refs today, F-10).

### ⚪ F-13 — Language split across the context sphere
- **Evidence:** AGENTS.md (English) · STATE.md / CI_GATES.md / DEVELOPER_GUIDE.md / TECH_REFERENCE.md (Arabic) · README + SECURITY.md (mixed/English).
- **Impact:** per-file consistency mostly holds, but cross-file greps need bilingual patterns (docs_audit I-check already handles both «Last updated»/«آخر تحديث») — a maintenance tax worth recording, not necessarily changing (owner culture decision).

### ⚪ F-14 — The tail-freeze mechanism depends on a hand-bumped constant
- **Evidence:** `WORKLOG_TAIL_BASELINE = "2026-09-17"` (docs_audit.py:229) with in-code comments documenting two prior manual bumps (Phase 216, Phase 226) — and F-01 is precisely the third, missed bump.
- **Impact:** every busy day (>12 entries) creates a same-commit human-memory duty; the mechanism has now failed once per ~10 phases.

### 4.1 Verified-healthy (so the plan preserves it — do not break)
- Gate-as-code on GitHub runners, independent of any agent session (born from real incidents; runs in seconds).
- Single-source number law (D-check) — README/GUIDE carry zero variable counts; verified PASS at audit time.
- STATE ancestry check (B) — state never points forward; PASS.
- Archive freeze (J) + root-resurrection gate (F) — PASS.
- Migration registry parity (`docs_parity.py`) — PASS (pages=118 · endpoints=75 · sql=102 · newest 0089 == INDEX.md).
- Provenance banners + owner-order citation culture — uniquely strong traceability.
- `docs/TECH_REFERENCE.md`, `docs/CI_GATES.md` split of "law vs narrative" (Phase 112/111) — working as designed.

---

## 5. Root causes

| ID | Root cause | Manifests as |
|---|---|---|
| RC-1 | **Append-only growth with no compaction cycle** except status files (Phase 115 treated the symptom for PROGRESS/QA only; worklog, STATE-history, plan-logs never got the same treatment) | F-04, F-05, F-07, F-08 |
| RC-2 | **Gates measure proxies, not invariants** — line counts instead of bytes; a single regex instead of an entry schema | F-02, F-04 |
| RC-3 | **Manual forward-only baselines** hardcoded in gate code, requiring same-commit discipline under load | F-01, F-14 |
| RC-4 | **Role mixing in single files** — law+history (AGENTS §8 narratives), plan+log (SEO §12), evidence+narrative (LIVE-VERIF) — the STATE/archive split was never generalized | F-06, F-08, F-11 |
| RC-5 | **Advisory enforcement** — no required status checks on main | F-03 |
| RC-6 | **No lifecycle labels or index for point-in-time docs**; each audit adds files instead of updating a registry | F-09 |
| RC-7 | **Evidence artifacts stay in ephemeral workspaces** — the §3.6 survival law is applied to docs but not to verification scripts | F-11 |

---

## 6. What the Phase-214 audit already caught (and this audit confirms closed/open)

The DEEP-AUDIT-REPORT-2026-09-16 documented 24 doc problems; waves 215–217 fixed most. This audit re-verified:
**closed:** worklog 206–211 ordering (H-check now exists), false Last-updated headers (I-check), archive post-freeze edits (J-check), TECH_REFERENCE migration lag (now current through 0089), CI_GATES workflow coverage (14/14 listed), README/GUIDE number law (D-check PASS).
**still open:** §12.5.2 periodic audit cadence dead since 2026-08-25 with §12.5 still pointing at the frozen `_AUDIT.md` (F-09); plus everything above that post-dates or escaped that audit's scope (F-01, F-02, F-04 density, F-06, F-10 GUIDE refs, F-11).

---

## 7. Appendix A — verification commands used (reproducible)

```bash
git clone https://github.com/muscleshubfit-cpu/alkemos && cd alkemos && git rev-parse HEAD   # 8321e718…
wc -l -c STATE.md AGENTS.md worklog.md README.md DEVELOPER_GUIDE.md SECURITY.md DESIGN.md
python3 scripts/docs_audit.py            # → 1 violation: H/worklog-tail-freeze  (F-01)
python3 scripts/docs_parity.py           # → PASS
# GitHub Actions (owner PAT, read): GET /repos/muscleshubfit-cpu/alkemos/actions/runs?per_page=6
#   → "Docs & schema parity gate" conclusion=failure @ 8321e718, b1fc74ae   (F-01/F-03)
rg -n '^Task ID:' worklog.md | wc -l      # 208 — VERCEL-USAGE-4 (line 5108, '## Task ID:' prefix) not among them (F-02)
sed -n '5108p' worklog.md                # the malformed newest entry
rg -n 'WORKLOG_TAIL_BASELINE' scripts/docs_audit.py   # line 229: '2026-09-17'  (F-14)
awk 'NR==9' STATE.md | rg -o 'فوق' | wc -l            # 45 nested phase levels      (F-04)
rg -n 'PROGRESS\.md' DEVELOPER_GUIDE.md | head        # lines 8, 757 bare refs       (F-10)
rg -n 'build_assets_v127|fix_hero_logo2' DESIGN.md    # lines 163-164 dead scripts   (F-10)
git ls-files | rg 'live-verify'                       # (empty) — F-11
rg -n '^## ' worklog.md | head -30                    # mixed-format legacy region  (F-05)
rg -n 'Task ID:' archive/WORKLOG_ARCHIVE.md | tail -3 # Phases 207/208 (2026-09-16) in archive (F-05)
```

## 8. Appendix B — cross-reference scan summary

All 34 tracked `.md` files scanned for relative file references (markdown links + backticked paths):
- **Genuinely broken/stale (documented in F-10):** 2× bare `PROGRESS.md` (DEVELOPER_GUIDE), 3× deleted scripts (DESIGN), 1× deleted doc pointer in a REMOVED-law narrative (AGENTS §8 EVO-6 — intentional history), `PROJECT_CONTEXT.md` mentions (archives — historical).
- **False-positive classes (reference-by-basename; files exist elsewhere):** workflow yml names cited without `.github/workflows/` prefix; migration filenames cited without `supabase/migrations/` prefix — these are shorthand the repo uses consistently; a future link-check gate (plan Phase 2, optional) should resolve against the full tree before flagging.
- **Zero inbound references:** `CHANGELOG.md` (empty), this audit's two new files until indexed (plan Phase 4), several point-in-time audit docs are linked only from STATE/README prose, not from any doc index (F-09/F-12).
