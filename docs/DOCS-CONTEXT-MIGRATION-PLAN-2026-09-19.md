# Documentation & Context Architecture — Migration Plan (PROPOSED)

> **Status: PROPOSED — awaiting owner approval. NOT EXECUTED.**
> **Provenance:** companion to [`docs/DOCS-CONTEXT-AUDIT-REPORT-2026-09-19.md`](DOCS-CONTEXT-AUDIT-REPORT-2026-09-19.md)
> (read it first — every phase below cites its findings as F-xx). Created by the same owner order of 2026-09-19
> («Do not implement the plan yet» — this document plans, it does not act).
> **Design stance:** the existing system (STATE / AGENTS / worklog / archive / docs / CI gates) is kept and
> repaired — nothing is replaced. Phases are small, forward-only, one commit each, every phase independently
> revertible. The repo's own laws apply throughout: §3.5 verification, §3.8 same-frame parity, §12.5.1 worklog
> entries, §12.8 code-wins, no force-push ever.
> **Audit baseline:** `8321e718`. **Target agent:** any competent LLM coding agent (tool-agnostic).

---

## 1. Design principles (each maps to a root cause)

| # | Principle | Fixes | How it shows up in the phases |
|---|---|---|---|
| P1 | Budget **bytes and schemas**, not lines and regexes | RC-2 | STATE byte cap (Phases 3, 5); worklog entry-schema check (Phase 2) |
| P2 | Boundaries must be **derived**, never hand-bumped | RC-3 | tail-freeze invariant computed from the window itself (Phase 2) |
| P3 | Every live file has **exactly one role**; history, evidence, and law live in their own places | RC-1, RC-4 | STATE de-dup (Phase 3), worklog rotation (Phase 5), evidence law (Phase 5) |
| P4 | A gate that is not **required** is a suggestion | RC-5 | branch protection (Phase 6, owner action) |
| P5 | Point-in-time docs get a **lifecycle label + one index** | RC-6 | docs/README.md registry (Phase 4) |
| P6 | Evidence referenced by the log must **exist in the repo** | RC-7 | live-verify scripts committed or marked local-only (Phase 5) |

## 2. Target architecture (reshape of what exists — no new subsystems)

| Surface | Today | After migration | Findings closed |
|---|---|---|---|
| `STATE.md` | 100 lines / 79 KB, history ladder inside "current phase" | ≤100 lines **and** ≤32 KB; top ~5 phase entries + open items + prohibitions + QA(last phase) + source map + protocol; full history = worklog (verified before removal) | F-04, F-07 |
| `worklog.md` | 1 MB, 3 formats, ad-hoc archive boundary | active window (top 12) + rolling date region; everything older rotated **verbatim** to `archive/WORKLOG_ARCHIVE.md`; single §12.5.1 format for live entries; deprecated Phase-82 header note replaced by the current policy | F-05, F-14 |
| `scripts/docs_audit.py` | line cap, one regex, hardcoded baseline | keeps A–J; adds: K entry-schema, derived tail invariant (baseline constant deleted), A-check byte cap (warn→hard across phases) | F-01, F-02, F-04 |
| `AGENTS.md` | law + tombstones + narratives | §12.5/§12.5.2 repointed to `docs/README.md`; §12.5.1 gains entry-size guidance (≤60 lines/entry) + evidence rule; §5/§9 tombstones noted for Phase-5 cleanup decision (owner) | F-06, F-09, F-11 |
| Commit messages | 2–4 KB restating worklog | subject + ≤500-char body + pointer to the worklog entry (§10 amendment) | F-06 |
| `docs/` | unindexed audit pile | `docs/README.md` = registry: file / role / status (LIVE·FROZEN·HISTORICAL·SUPERSEDED-BY) / reading order + token budget per session | F-09, F-12 |
| Enforcement | 3 advisory workflows | same 3 workflows **required** on main (owner enables) | F-03 |

## 3. Phase 0 — Regularization & unblock (fixes what is red now)

**Goal:** main green again; this audit pair wired into the repo's own protocol. Smallest possible change.
**Preconditions:** owner approval of this plan; session opened per AGENTS.md §3.6; `HEAD == origin/main`.

1. Normalize the misplaced entry (F-02): move the **content verbatim** of worklog.md:5108–5123
   (`## Task ID: VERCEL-USAGE-4 (2026-09-19)`) to the **top** of `worklog.md` as a standard §12.5.1 entry:
   `Task ID: VERCEL-USAGE-4-2026-09-19` (keep the `---` separator rule; keep every bullet unchanged).
2. Bump `WORKLOG_TAIL_BASELINE` in `scripts/docs_audit.py:229` → `"2026-09-18"` **in the same commit**
   (the documented Phase-216/226 precedent) — this alone clears the current H failure (F-01).
3. Add the §12.5.1 worklog entry for **this audit's commit** (`DOCS-CONTEXT-AUDIT-2026-09-19`): the audit pair
   shipped without one only because the owner order prohibited touching existing files; this step regularizes it.
4. STATE.md refresh (§3.6 duty): new phase header line (next number N), one `(٠٠)` entry for the audit, and a
   pointer to both new docs in the open-items section. Keep 100 lines (apply a sanctioned merge if needed).
5. Commit (`docs: Phase N — docs/context architecture audit (owner order 2026-09-19) + gate unblock`),
   subject ≤72 chars, body ≤500 chars.

**Validation:** `python3 scripts/docs_audit.py` → 0 violations · `python3 scripts/docs_parity.py` → PASS ·
worklog top entry = VERCEL-USAGE-4 (normalized), second = this audit entry · push · GitHub Actions: all three
gate workflows green (verify: `gh api repos/muscleshubfit-cpu/alkemos/actions/runs?per_page=3` or the Actions page).
**Rollback:** `git revert <sha>`; push; re-run gates; note the revert in a new worklog entry.

## 4. Phase 1 — Stale-reference hygiene (docs-only, no logic changes)

**Goal:** every reference in governed docs resolves or is explicitly marked historical.

1. `DEVELOPER_GUIDE.md:8` — replace «See also `PROGRESS.md` § …» with a pointer to `STATE.md` (+ `archive/PROGRESS.md` for history).
2. `DEVELOPER_GUIDE.md:757` — «انظر `PROGRESS.md` Phase 5» → «انظر `archive/PROGRESS_ARCHIVE.md` (Phase 5)» after verifying the content location; if not there, point to the worklog phase entry instead.
3. `DESIGN.md:163-164` — reword to past tense + git-history pointer for `build_assets_v127.py` / `build_assets_v3.py` / `fix_hero_logo2.py` («rebuilt at Phase 127 by (deleted) scripts — see git history a3e2bfc4^»), or re-add the current asset-build path if one exists (verify before writing).
4. `README.md` Additional Documentation — worklog line reworded: «full append-only history; pre-Phase-209 entries also preserved in `archive/WORKLOG_ARCHIVE.md`» (matches reality post-Phase-82-policy deprecation).
5. `AGENTS.md:144` — add «(file deleted with the surface)» after `docs/EVO-PARTNER-API.md` so link-checkers and agents read it as history.
6. `CHANGELOG.md` — owner decision point (default recommendation): delete the 0-byte file (`git rm`, per §3.8 dead-file law) OR fill it with a 3-line pointer to STATE/worklog. Do not leave it empty.

**Validation:** every link/backtick path in the 6 governed docs resolves (re-run the audit's Appendix-A rg commands;
all must come back clean) · `docs_audit.py` I-check passes (headers bumped same-commit for every touched governed doc) · all gates.
**Rollback:** single revert.

## 5. Phase 2 — Gate hardening (scripts/docs_audit.py only)

**Goal:** close the two escape classes this audit caught; kill the hand-bumped constant.

1. **Derived tail invariant (replaces the constant):** delete `WORKLOG_TAIL_BASELINE`; new H3 rule =
   *no entry below the top-12 window may be newer than the oldest dated entry inside the window*
   (`max(tail_dates) <= min(window_dates)`, same date-inheritance logic). Legitimate window slides can never
   trip it; a bottom-append (VERCEL-USAGE-4 class) always will. Update the workflow comment block accordingly.
2. **K-check (entry schema):** every parsed `^Task ID:` entry must contain the §12.5.1 skeleton
   (`Agent:` · `Task:` · `Work Log:` · `Stage Summary:`); and flag any line matching `^##\s+Task ID:` as a
   malformed header (F-02 class) with a clear `::error::` message.
3. **A-check extension (byte cap, warn-only first):** print STATE.md byte size in the report line and emit a
   `⚠` (non-failing) if > 48,000 bytes — the number the de-duped Phase-3 STATE must fit; hard-fail flips on in
   Phase 5 at 32,000 bytes.
4. Update `docs/CI_GATES.md` (knowledge-gate row + a "Phase-2 hardening" provenance line) in the same commit.

**Validation:** local gate runs on a **scratch copy** (never the repo) with 3 injected defects (bottom-append
with new date; `## Task ID:` header; 110-line STATE) — all three must fail the scratch run; the real repo run
must PASS · push · CI green · `docs_parity.py` unaffected.
**Rollback:** revert (gate is self-contained; no doc content depends on it).

## 6. Phase 3 — STATE.md de-duplication (history moves out of the status file)

**Goal:** STATE = current state again; ≤100 lines **and** ≤48 KB (warn-limit from Phase 2).

1. For **each** `(٠٠)` phase entry below the top 5 (STATE.md:10–43, down to Phase 185): verify the phase has a
   worklog entry (or is a documented merge like "217+216+215 محفوظة"). Covered → delete the STATE copy.
   Uncovered (merge-only) → first append its STATE text verbatim into worklog at its chronological position,
   then delete from STATE.
2. Flatten the line-9 phase chain to: current number + one parent level + «full chain: worklog/INDEX-style
   ledger» pointer (the chain data already exists per-phase in worklog headers).
3. Recompute: STATE must pass A–C checks, keep all six required sections, ≤100 lines, ≤48,000 bytes.
4. QA-summary section: keep the current phase row only; older rows live in worklog entries already.
5. Worklog entry + STATE refresh in the same commit, as always (§3.8).

**Validation:** `docs_audit.py` 0 violations (A/B/C incl. new byte report) · byte size ≤48,000 · **spot-check
5 random removed phases resolve in worklog** (rg their Task IDs / `## Phase N` headers) · all gates green after push.
**Rollback:** single revert; zero information loss possible (git preserves; the ledger is in worklog).

## 7. Phase 4 — Docs lifecycle registry (one new file, sanctioned by this plan's approval)

**Goal:** F-09/F-12 closed — one index answers "what is this doc, is it alive, when do I read it".

1. Create `docs/README.md` — the registry, modeled on the inventory tables of the audit report:
   `file | role | status (LIVE / FROZEN / HISTORICAL / SUPERSEDED-BY <x>) | last-updated | law-ref`.
   Seed statuses from the audit's §3.3 table (e.g., `_AUDIT.md` HISTORICAL 2026-08-25; `DEEP-UX-AUDIT-REPORT-2026-09-18`
   EXECUTED/CLOSED per STATE 225–229; the VERCEL audit EXECUTED items 1–4).
   Add the **agent session reading budget**: STATE (~≤32 KB after Phase 3) → AGENTS §1–§4+§12 (39 KB) → top-3
   worklog entries (~130 lines) → on-demand map via STATE's source-of-truth table.
2. Repoint AGENTS.md §12.5 consolidated note and §12.5.2 cadence at `docs/README.md` (the frozen `_AUDIT.md`
   reference is retired; §12.5.2's monthly cadence becomes: "audit checklist = docs/README.md statuses +
   the audit-report Appendix-A command list" — or the owner formally deprecates the cadence; decision point).
3. README.md "Additional Documentation": link `docs/README.md` as the doc index.
4. Mark the audit pair (this file + the report) status EXECUTED progressively as phases land (each phase updates
   its row) — the registry is how the next audit avoids re-auditing.

**Validation:** every registry row's file exists (xref script from audit Appendix A adapted, or rg sweep) ·
`docs_audit.py` PASS · human owner review of statuses (10 minutes).
**Rollback:** single revert.

## 8. Phase 5 — Worklog rotation + evidence law (heaviest; owner sign-off on the choice)

**Goal:** worklog.md becomes greppable and window-shaped; evidence exists in-repo.

**Owner decision point — pick one:**
- **(a) Format normalization only:** convert legacy `## Phase N` blocks / bare `Task ID: N` entries
  **in place** to the standard template (content verbatim); file keeps full history (~1 MB).
- **(b) Rotation (recommended):** move everything below the active window **verbatim** to
  `archive/WORKLOG_ARCHIVE.md` (append-only law respected); worklog.md = top-12 window + 30-day buffer;
  header note replaced with the current policy («active region = newest-on-top; full history in archive/»).
  Shrinks the live file to ~1.5–2 K lines; greps stay cheap; the derived invariant (Phase 2) guards the boundary forever.

Whichever is chosen, in the same phase:
1. Worklog entry-size guidance lands in AGENTS.md §12.5.1: ≤60 lines per entry (LIVE-VERIF ≤40); detail belongs
   in committed scripts or the registry, not prose.
2. Evidence rule (F-11): any worklog entry referencing a verification script must point to a **committed**
   path (`scripts/live-verify/<task>.sh`) or state «local-only, not preserved» explicitly. Optional Phase-2
   follow-up: L-check flagging `scripts/*.sh` mentions in the window that don't exist on disk.
3. Byte cap flips to **hard-fail at 32,000 bytes** for STATE.md (Phase-2 warn limit retires).
4. Commit-message budget lands in AGENTS.md §10: subject ≤72 chars, body ≤500 chars, pointer to worklog entry
   (F-06). Apply from this commit forward (history untouched).

**Validation (b-specific):** `diff` of moved region against pre-move copy = identical (pure move, zero edits) ·
10 random entries from the moved region findable in archive · top-3 entries unchanged · `docs_audit.py` PASS ·
worklog byte size before/after recorded in the worklog entry · all gates green after push.
**Rollback:** single revert (the move is one commit; forward-only revert restores exactly).

## 9. Phase 6 — Owner actions (not agent-executable; listed for completeness)

1. Branch protection on `main`: require *Quality gate*, *Docs & schema parity gate*, *Anti-regression guard*,
   and the Supabase Preview check; "include administrators" off (keeps the owner hotfix path).
2. Enable Dependabot (already an optional item in STATE.md:50).
3. **Rotate the PAT used for this audit and any other secrets shared in chat** (the repo's own VERCEL-USAGE-4
   entry already lists «تدوير الأسرار المنشورة بالمحادثة» as a pending owner action — this audit reiterates it).

---

## 10. Global validation & rollback requirements (apply to every phase)

- **Pre-push:** run locally — `python3 scripts/docs_audit.py` · `python3 scripts/docs_parity.py` ·
  `python3 scripts/migration_audit.py --ci` · `bash scripts/check-stale-refs.sh --ci` ·
  `bash scripts/check-ui-wiring.sh`; plus `npx tsc --noEmit` / `npx eslint .` / `npx vitest run` **whenever any
  code file is touched** (docs-only phases exempt per Phase-223 precedent).
- **Post-push:** GitHub Actions — all three gate workflows green on the pushed SHA (Actions page or
  `gh api repos/muscleshubfit-cpu/alkemos/actions/runs?per_page=5`); `git fetch` + `rev-parse` sync check (§3.5 step 5).
- **Per-phase worklog entry + STATE refresh in the same commit** (§3.8) — no exceptions, including this plan's
  own phases.
- **Rollback protocol:** `git revert <phase-commit>` → run the same local battery → push → verify green →
  worklog entry documenting what was reverted and why. **Never** `--force`, never `reset --hard` (§3.7).
  Phases are one commit each by design so any phase reverts in isolation.
- **Stop-and-ask:** any discovery that contradicts this plan's assumptions (e.g., a finding that no longer
  reproduces) → stop, document in worklog, ask the owner (§11) — do not improvise (§12.10).

## 11. Exact execution sequence for the implementing agent (after approval)

```
STEP 0  SESSION OPEN (AGENTS.md §3.6):
        git fetch origin --quiet && git rev-parse HEAD origin/main   # must match
        Read STATE.md fully · top-3 worklog entries · last 5 commit subjects.
STEP 1  CONTEXT LOAD: read BOTH:
        docs/DOCS-CONTEXT-AUDIT-REPORT-2026-09-19.md   (findings F-01..F-14, root causes RC-1..RC-7)
        docs/DOCS-CONTEXT-MIGRATION-PLAN-2026-09-19.md (this file — execute top to bottom)
        Verify the audit is still current: re-run the report's Appendix-A one-liners;
        if a finding no longer reproduces, STOP and report (§11 stop-and-ask).
STEP 2  PHASE 0 (§3 above) → §10 validation gate → proceed only if green.
STEP 3  PHASE 1 (§4)       → §10 validation gate.
STEP 4  PHASE 2 (§5)       → §10 + scratch-copy negative tests.
STEP 5  PHASE 3 (§6)       → §10 + phase-coverage spot-checks.
STEP 6  PHASE 4 (§7)       → §10 + owner review of registry statuses (10 min).
STEP 7  PHASE 5 (§8)       → owner picks (a)/(b) FIRST; then §10 + verbatim-move diff.
STEP 8  PHASE 6 (§9): present the 3 owner actions; agents cannot execute these.
STEP 9  CLOSURE: final report per AGENTS.md §12.9 (what/verification/SHAs/push status/next) +
        worklog entry + STATE refresh + update BOTH audit-doc status banners to EXECUTED with the
        closure commit SHA.
```

Each STEP's commit: repo identity (§10), conventional prefix, subject ≤72 chars, body ≤500 chars.
Between phases, one breath of verification — never batch phases into one commit.

## 12. Definition of done (whole migration)

- [ ] `docs_audit.py` 0 violations on main, CI green on the final SHA (all three gate workflows).
- [ ] STATE.md ≤100 lines **and** ≤32 KB, byte cap enforced hard.
- [ ] worklog.md: single format in the live region, derived invariant active, deprecated header note gone.
- [ ] Zero unresolved relative references in the six governed docs (audit Appendix-A commands return clean).
- [ ] `docs/README.md` registry exists, statuses current, AGENTS §12.5/§12.5.2 point to it.
- [ ] Branch protection active on main (owner-confirmed).
- [ ] Both audit docs carry EXECUTED banners + closure SHA; next agent's session (STEP 0–1) finds everything.

## 13. Risks & mitigations

| Risk | Mitigation |
|---|---|
| STATE de-dup deletes an entry not fully covered by worklog | per-phase coverage verification BEFORE deletion (§6.1); unverified content is moved, never dropped |
| Rotation loses an entry | pure verbatim move + pre/post diff must be identical; single-commit revert |
| New gate checks false-positive on legacy shapes | warn-first rollout (Phase 2) + scratch-copy negative tests; hard flags only after live region is normalized (Phase 5) |
| Agent forgets same-frame parity during execution | §10 gate list includes docs_audit A/B/C — a missing worklog entry or STATE refresh fails the push locally |
| Owner unreachable mid-migration | phases are independently shippable; stop points are only Phase 5 (a/b choice) and Phase 6 (owner-only) |

## 14. Approval record

| Field | Value |
|---|---|
| Plan version | 1.0 (2026-09-19) — authored against `8321e718` |
| Owner approval | ☐ approved as-is ☐ approved with changes: ______ ☐ rejected |
| Approved phases | ☐ 0 ☐ 1 ☐ 2 ☐ 3 ☐ 4 ☐ 5(a/☐ b) ☐ 6 |
| Approval citation (repo culture) | owner order quote + date, to be echoed in the executing commit messages |
