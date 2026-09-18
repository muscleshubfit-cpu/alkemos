#!/usr/bin/env python3
"""Knowledge operating system gate — Phase 107 (owner-approved study).

Owner problem: «ملفات التوثيق دايما بتسبب مشاكل» + «كل وكيل/محادثة جديدة
= لبس وتضارب» + شغل ضاع بسبب مسح مساحة العمل. The approved study diagnosed
the root causes (every fact written in 4-5 places, memory outside GitHub,
no single entry point, the law file itself carrying a duplicated §3.6)
and this gate enforces the cure as code, on every push/PR.

Checks (any failure = exit 1, ::error:: annotations in --ci):
  A. STATE.md exists, ≤ 100 lines, contains the required sections
     (المرحلة الحالية · المفتوح الآن · بانتظار موافقة المالك ·
      ممنوعات نشطة · خريطة مصادر الحقيقة · ملخص جودة المرحلة).
  B. STATE.md «آخر كوميت متحقق منه» is a real commit that is an
     ancestor-or-equal of HEAD (the state never points forward).
  C. STATE.md phase parseable + the Phase 115 frozen status files
     exist: archive/PROGRESS.md + archive/QA_CHECKLIST.md (owner
     «الأمر الخامس»: STATE.md is the single living status file —
     PROGRESS/QA were merged into it and frozen verbatim).
  D. Number-free docs: README.md + DEVELOPER_GUIDE.md carry ZERO
     variable counts (the AGENTS.md §3.8 single-source law). Numbers
     live in the code / INDEX.md only. This check was SENSITIVITY-PROVEN
     against the pre-Phase-107 docs (13 hits) before they were stripped.
  E. AGENTS.md: no duplicate section numbers (### N.N / ## N.) — born
     from the real duplicated §3.6 (lines 134 + 191).
  F. Merged status law (Phase 115, owner «الأمر الخامس»): PROGRESS.md /
     QA_CHECKLIST.md must NOT exist at the root (merged into STATE.md
     and frozen in archive/ — resurrection is gated); STATE.md keeps
     its archive/ pointer; the append-only archives must exist.
  G. STATE.md discoverability: README.md links it (the entry-point doc
     must be reachable from the front door).
  H. (Phase 215 / P1-4, 2026-09-16 — deep-audit finding المؤكد 6)
     worklog.md newest-on-top, ACTIVE region: the top 12 entries must
     be date-descending (undated Task IDs inherit the date below;
     same-date parseable phase numbers non-increasing — LIVE-VERIF
     entries are phase-exempt, they verify multiple phases), the FIRST
     entry must carry the newest date in the file, and nothing below
     the window may be newer than the oldest dated entry INSIDE it
     (Phase 234: derived tail invariant — the hand-bumped baseline
     constant is retired; a window slide can never trip this, a
     bottom-append always will).
  K. (Phase 234 — migration Phase 2) worklog entry schema: a «## Task ID:»
     line is a malformed header → hard fail (the F-02 escape class).
     Entries missing the §12.5.1 skeleton (Agent/Task/Work Log/Stage
     Summary) are reported as WARNINGS until the migration Phase-5
     normalization flips them to hard failures.
  I. (Phase 215 / P1-4 — finding المؤكد 22) governed docs
     (AGENTS/README/DEVELOPER_GUIDE/SECURITY/DESIGN) must carry a
     parseable «Last updated/آخر تحديث» date, and any doc touched by
     a commit since the gate birthday (2026-09-16) must have its
     header ≥ that commit's date — forward-only: pre-gate drift is
     Phase 217 / P3-1 scope.
  J. (Phase 215 / P1-4 — finding المؤكد 25) the Phase-115
     frozen-verbatim files (archive/PROGRESS.md +
     archive/QA_CHECKLIST.md) must have ZERO commits since the gate
     birthday (2026-09-16). The 2026-09-08 post-freeze edit (680833f9)
     predates the gate and is documented in the audit report.

Usage:  python3 scripts/docs_audit.py            # human report
        python3 scripts/docs_audit.py --ci       # GitHub Actions
Exit:   0 = knowledge system consistent · 1 = violations (list printed)
"""
import os
import re
import subprocess
import sys
from pathlib import Path

REPO = Path(os.environ.get(
    "REPO_ROOT", Path(__file__).resolve().parent.parent))

CI = "--ci" in sys.argv

failures: list[tuple[str, str]] = []


def fail(check: str, msg: str) -> None:
    failures.append((check, msg))
    if CI:
        print(f"::error::docs_audit [{check}] {msg}")


def read(rel: str) -> str:
    p = REPO / rel
    if not p.exists():
        fail("file-exists", f"{rel} MISSING — the knowledge system "
                            f"requires it (AGENTS.md §3.6/§3.8)")
        return ""
    return p.read_text(errors="replace")


# ------------------------------------------------------------------ A
state = read("STATE.md")
state_bytes = len(state.encode("utf-8")) if state else 0
if state and state_bytes > 48_000:
    print(f"⚠ A/state-size (warning): STATE.md is {state_bytes:,} bytes "
          f"(> 48,000) — the migration Phase-3 de-dup target is ≤ 48,000; "
          f"the hard cap (32,000) arrives with migration Phase 5")
if state:
    lines = state.splitlines()
    if len(lines) > 100:
        fail("A/state-size",
             f"STATE.md is {len(lines)} lines — the law caps it at 100 "
             f"(it must stay a 30-second read); compress or archive")
    for marker in ("## المرحلة الحالية", "## المفتوح الآن",
                   "## بانتظار موافقة المالك", "## ممنوعات نشطة",
                   "## خريطة مصادر الحقيقة", "## ملخص جودة المرحلة"):
        if marker not in state:
            fail("A/state-sections", f"STATE.md lost required section "
                                     f"«{marker}»")

# ------------------------------------------------------------------ B
m = re.search(r"آخر كوميت متحقق منه:\*\*\s*([0-9a-f]{7,40})", state)
if state and not m:
    fail("B/state-commit",
         "STATE.md «آخر كوميت متحقق منه» missing/unparseable — "
         "format: «- **آخر كوميت متحقق منه:** <sha> (...)»")
elif m:
    sha = m.group(1)
    try:
        subprocess.run(
            ["git", "cat-file", "-e", f"{sha}^{{commit}}"],
            cwd=REPO, check=True,
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run(
            ["git", "merge-base", "--is-ancestor", sha, "HEAD"],
            cwd=REPO, check=True,
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        shallow = (REPO / ".git/shallow").exists()
        hint = (" (shallow checkout detected — the gate needs full "
                "history: use actions/checkout fetch-depth: 0)"
                if shallow else
                " (update STATE.md to a verified commit)")
        fail("B/state-commit",
             f"STATE.md commit {sha} is not an ancestor-or-equal of HEAD "
             f"— the recorded state must never point forward{hint}")

# ------------------------------------------------------------------ C
def phase_num(text: str, pattern: str) -> int | None:
    mm = re.search(pattern, text)
    if not mm:
        return None
    return int(re.match(r"\d+", mm.group(1)).group(0))


state_phase = (phase_num(state, r"المرحلة:\*\*\s*(\d+[a-z]?)")
               if state else None)
if state and state_phase is None:
    fail("C/phase-equality",
         "STATE.md «**المرحلة:**» missing/unparseable")

# Phase 115 merged law: the frozen status files must exist in archive/
# (owner «الأمر الخامس» — STATE.md is the single living status file).
for rel in ("archive/PROGRESS.md", "archive/QA_CHECKLIST.md"):
    if not (REPO / rel).exists():
        fail("C/frozen-archive",
             f"{rel} MISSING — the Phase 115 merged law requires the "
             f"frozen status files in archive/ (owner «الأمر الخامس»)")

# ------------------------------------------------------------------ D
FORBIDDEN: list[tuple[str, str]] = [
    (r"\d+\s+SQL\s+files?", "SQL file count"),
    (r"\d+\s*ملف(?:ات)?\s*SQL", "SQL file count (Arabic)"),
    (r"\d+\s*ميجريشن", "migration count (Arabic)"),
    (r"\d+\s+page\.tsx", "page count"),
    (r"\d+\s+API\s+endpoints?", "API endpoint count"),
    (r"\d+\s+endpoints?", "endpoint count"),
    (r"Total:\s*\d+", "Total: N line"),
    (r"\d+\s+route\.tsx?", "route file count"),
    (r"\(\d+\s+views?\)", "view count"),
    (r"\d+\s+views?\b", "view count (loose)"),
    (r"\d+\s+components?\b", "component count"),
    (r"0001\s*(?:→|…|\.\.\.)\s*\d", "registry range 0001→NNNN"),
]
for rel in ("README.md", "DEVELOPER_GUIDE.md"):
    text = read(rel)
    for ln_no, ln in enumerate(text.splitlines(), 1):
        for pat, label in FORBIDDEN:
            if re.search(pat, ln):
                fail("D/number-free-docs",
                     f"{rel}:{ln_no} contains a variable count ({label}, "
                     f"pattern /{pat}/) — AGENTS.md §3.8 single-source "
                     f"law: numbers live in the code or INDEX.md only; "
                     f"line: {ln.strip()[:110]!r}")

# ------------------------------------------------------------------ E
agents = read("AGENTS.md")
if agents:
    seen: dict[tuple[str, str], int] = {}
    for ln_no, ln in enumerate(agents.splitlines(), 1):
        for h, pat in (("h2", r"^## (\d+)\."),
                       ("h3", r"^### (\d+\.\d+)")):
            mm = re.match(pat, ln)
            if mm:
                key = (h, mm.group(1))
                if key in seen:
                    fail("E/agents-duplicates",
                         f"AGENTS.md:{ln_no} DUPLICATE section number "
                         f"§{mm.group(1)} (first at line {seen[key]}) — "
                         f"the duplicated §3.6 incident must stay "
                         f"impossible")
                seen[key] = ln_no

# ------------------------------------------------------------------ F
# Phase 115 merged law: no status files at the root, ever again.
for rel in ("PROGRESS.md", "QA_CHECKLIST.md"):
    if (REPO / rel).exists():
        fail("F/no-root-status",
             f"{rel} must NOT exist at the root — merged into STATE.md "
             f"and frozen in archive/ at Phase 115 (owner «الأمر الخامس»); "
             f"resurrection is gated")
if state and "archive/" not in state:
    fail("F/state-archive-pointer",
         "STATE.md lost its archive/ pointer (history lives there)")
for rel in ("archive/PROGRESS_ARCHIVE.md", "archive/QA_CHECKLIST_ARCHIVE.md"):
    if not (REPO / rel).exists():
        fail("F/archive-exists", f"{rel} MISSING — the archive law "
                                 f"requires it")

# ------------------------------------------------------------------ G
readme = read("README.md")
if readme and "STATE.md" not in readme:
    fail("G/state-discoverable",
         "README.md does not link STATE.md — the entry-point doc must "
         "be reachable from the front door")

# ------------------------------------------------------------------ H
# Phase 215 / P1-4 (owner-approved remediation plan, audit المؤكد 6 + 3):
# the worklog newest-on-top law (AGENTS.md §3.8) was broken twice with
# zero gates noticing. Enforce the ACTIVE region's structure.
# PHASES 216/226/232: the tail was guarded by a hand-bumped baseline
# constant bumped in-commit three times — RC-3/F-14: it missed a bump
# roughly once per 10 phases and went red on 8321e718 (F-01).
# PHASE 234 (2026-09-19, migration Phase 2): the constant is RETIRED —
# the boundary is now DERIVED from the window itself: no entry below
# the top-12 window may be newer than the oldest dated entry inside
# it. A legitimate window slide can never trip it; a bottom-append
# (the VERCEL-USAGE-4 class) always will.
WORKLOG_WINDOW = 12

worklog = read("worklog.md")
wl_tasks: list[str] = []
wl_entries: list[list[str]] = []
if worklog:
    _cur: list[str] | None = None
    for ln in worklog.splitlines():
        m = re.match(r"^Task ID:\s+(.*?)\s*$", ln)
        if m:
            wl_tasks.append(m.group(1))
            if _cur is not None:
                wl_entries.append(_cur)
            _cur = [ln]
        elif _cur is not None:
            _cur.append(ln)
    if _cur is not None:
        wl_entries.append(_cur)

if worklog and len(wl_tasks) < 3:
    fail("H/worklog-parse", f"worklog.md carries only {len(wl_tasks)} "
                            f"Task ID entries — unparseable")


def wl_date(task: str) -> str | None:
    m = re.search(r"(\d{4}-\d{2}-\d{2})", task)
    return m.group(1) if m else None


def wl_phase(task: str) -> int | None:
    # PHASE-N is the norm; -N- immediately before a trailing date covers
    # SEO-GEO-15-BATCH1-206-2026-09-15 style ids. Bare trailing digits are
    # NOT trusted (they would parse the date's day as a phase).
    m = re.search(r"PHASE-(\d+)", task)
    if m:
        return int(m.group(1))
    m = re.search(r"-(\d{2,4})-\d{4}-\d{2}-\d{2}$", task)
    if m:
        return int(m.group(1))
    return None


def wl_phase_checked(task: str) -> int | None:
    # LIVE-VERIF entries verify MULTIPLE phases (e.g. PHASE-196-P197-…)
    # so their own phase number understates their chronology — their
    # position is still guarded by the date checks.
    if "LIVE-VERIF" in task.upper():
        return None
    return wl_phase(task)


if worklog and wl_tasks:
    dates: list[str | None] = [wl_date(t) for t in wl_tasks]
    # undated entries inherit the date of the next dated entry BELOW
    inherited: list[str | None] = list(dates)
    for k in range(len(inherited) - 2, -1, -1):
        if inherited[k] is None:
            inherited[k] = inherited[k + 1]
    known = [d for d in dates if d]
    if known:
        # H2 — newest-at-top
        if dates[0] is None:
            fail("H/worklog-top-date",
                 "worklog.md first entry has no parseable date in its "
                 "Task ID — the protocol read (§3.6) starts here")
        elif dates[0] < max(known):
            fail("H/worklog-newest-top",
                 f"worklog.md first entry ({dates[0]}) is older than the "
                 f"newest entry in the file ({max(known)}) — a newer "
                 f"entry was appended below instead of on top")
        # H1 — top window internally ordered (newest-on-top)
        w = min(WORKLOG_WINDOW, len(inherited))
        window = inherited[:w]
        prev: str | None = None
        for k, d in enumerate(window):
            if d is None:
                continue
            if prev is not None and d > prev:
                fail("H/worklog-window-order",
                     f"worklog.md entry #{k + 1} «{wl_tasks[k]}» is dated "
                     f"{d} — NEWER than the entry above it ({prev}): the "
                     f"active region must read newest-on-top")
            prev = d
        # same-date phase order inside the window (unparseable entries
        # are SKIPPED without resetting the run — the comparison stays
        # chained across them; the run resets implicitly on date change
        # because comparisons only fire when d == run_date_last)
        run_ph: list[int] = []
        run_task: str = ""
        run_date_last: str | None = None
        for k in range(w):
            d = inherited[k]
            ph = wl_phase_checked(wl_tasks[k])
            if d is None or ph is None:
                continue
            if run_ph and d == run_date_last and ph > run_ph[-1]:
                fail("H/worklog-window-order",
                     f"worklog.md «{wl_tasks[k]}» (phase {ph}) sits "
                     f"below «{run_task}» (phase {run_ph[-1]}) on "
                     f"the same date {d} — phases must descend")
            run_ph.append(ph)
            run_task = wl_tasks[k]
            run_date_last = d
        # H3 — tail freeze (Phase 234: DERIVED from the window — no constant)
        tail_dates = [d for d in inherited[w:] if d]
        window_dates = [d for d in inherited[:w] if d]
        if tail_dates and window_dates and max(tail_dates) > min(window_dates):
            fail("H/worklog-tail-freeze",
                 f"worklog.md entries below the top {w} include dates up "
                 f"to {max(tail_dates)} — NEWER than the oldest dated "
                 f"entry inside the window ({min(window_dates)}): new "
                 f"entries belong ON TOP, not appended to the history "
                 f"region")

# ------------------------------------------------------------------ K
# Phase 234 / migration Phase 2: close the two escape classes the
# 2026-09-19 architecture audit caught (report F-02 + F-05's format
# drift). Hard: malformed «## Task ID:» headers the ^Task ID: parser
# never sees. Warn (until the Phase-5 normalization flips it): entries
# missing the §12.5.1 binding skeleton.
K_SKELETON = ("Agent:", "Task:", "Work Log:", "Stage Summary:")
for ln_no, ln in enumerate(worklog.splitlines(), 1) if worklog else []:
    if re.match(r"^##\s+Task ID:", ln):
        fail("K/malformed-header",
             f"worklog.md:{ln_no} is a malformed entry header («## Task "
             f"ID:» — the parser reads «Task ID:» at line start only): "
             f"normalize it to the §12.5.1 template")
schema_warnings: list[str] = []
for entry_lines in wl_entries:
    tid = re.match(r"^Task ID:\s+(.*?)\s*$", entry_lines[0]).group(1)
    missing = [f for f in K_SKELETON
               if not any(l.startswith(f) for l in entry_lines)]
    if missing:
        schema_warnings.append(f"«{tid}» missing {', '.join(missing)}")

# ------------------------------------------------------------------ I
# Phase 215 / P1-4 (audit المؤكد 22): governed docs must not claim a
# Last-updated date OLDER than the commits that touched them since the
# gate birthday. Forward-only by design — pre-gate drift is Phase 217
# (P3-1) scope; from 2026-09-16 on, editing a governed doc without
# bumping its header fails the push.
GATE_BIRTH = "2026-09-16"
GOVERNED_DOCS = ["AGENTS.md", "README.md", "DEVELOPER_GUIDE.md",
                 "SECURITY.md", "DESIGN.md"]


def git_out(args: list[str]) -> str | None:
    try:
        r = subprocess.run(["git", *args], cwd=REPO,
                           stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
                           text=True, timeout=30)
    except (subprocess.SubprocessError, OSError):
        return None
    return r.stdout.strip() if r.returncode == 0 else None


for rel in GOVERNED_DOCS:
    p = REPO / rel
    if not p.exists():
        continue  # read() already failed for it in A-style checks
    text = p.read_text(errors="replace")
    head = "\n".join(text.splitlines()[:15])
    m = re.search(r"(?:last updated|آخر تحديث)[^\d]{0,20}(\d{4}-\d{2}-\d{2})",
                  head, re.IGNORECASE)
    if not m:
        fail("I/last-updated-header",
             f"{rel} carries no parseable «Last updated / آخر تحديث» date "
             f"in its header — the 5 governed docs must carry one")
        continue
    header_date = m.group(1)
    since = git_out(["log", f"--since={GATE_BIRTH}T00:00:00", "-1",
                     "--format=%as", "--", rel])
    if since and header_date < since:
        fail("I/last-updated-truth",
             f"{rel} claims Last updated {header_date} but was modified "
             f"by a commit dated {since} (since the Phase-215 gate) — "
             f"bump the header in the same commit that edits it")

# ------------------------------------------------------------------ J
# Phase 215 / P1-4 (audit المؤكد 25): the Phase-115 frozen-verbatim
# files must never change again. Scoped to the frozen pair on purpose:
# §3.8 still allows APPEND-ONLY growth of the other archive files.
FROZEN_VERBATIM = ["archive/PROGRESS.md", "archive/QA_CHECKLIST.md"]
touched = git_out(["log", f"--since={GATE_BIRTH}T00:00:00", "--oneline",
                   "--", *FROZEN_VERBATIM])
if touched:
    fail("J/archive-freeze",
         f"the Phase-115 frozen-verbatim files were modified after the "
         f"Phase-215 gate birthday ({GATE_BIRTH}):\n{touched}\n"
         f"— frozen means frozen; an owner-ordered exception requires "
         f"updating this baseline in the same commit")

# ------------------------------------------------------------------ report
print("=" * 64)
print(f"knowledge gate : STATE phase={state_phase} · STATE lines="
      f"{len(state.splitlines()) if state else '∅'} · bytes={state_bytes:,} · "
      f"merged law: root PROGRESS/QA absent, frozen copies in archive/ · "
      f"worklog entries={len(wl_tasks)} · truth checks H/I/J (Phase 215) · "
      f"K schema (Phase 234)")
print("=" * 64)
if schema_warnings:
    print(f"⚠ K/entry-schema (warning — {len(schema_warnings)} entries lack "
          f"the full §12.5.1 skeleton; hard-fail arrives with the migration "
          f"Phase-5 normalization):")
    for w_line in schema_warnings[:5]:
        print(f"  ⚠ {w_line}")
    if len(schema_warnings) > 5:
        print(f"  ⚠ … and {len(schema_warnings) - 5} more")

if failures:
    print(f"\n{len(failures)} knowledge-system violation(s):")
    for check, msg in failures:
        print(f"\n❌ [{check}] {msg}")
    print("\nThe docs rot class is gated now — fix, don't bypass "
          "(AGENTS.md §3.6/§3.8).")
    sys.exit(1)

print("\n✓ knowledge operating system consistent (STATE · merged single-"
      "source law · number-free docs · AGENTS structure · frozen archive "
      "· discoverability · worklog order · header truth · archive freeze)")
sys.exit(0)
