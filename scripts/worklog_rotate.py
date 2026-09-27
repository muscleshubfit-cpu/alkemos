#!/usr/bin/env python3
"""worklog.md hard-cap rotation (Phase 288 — ARCH-REMEDIATION, audit P1-1).

The live worklog IS the active window: at most 12 Task-ID entries AND at
most 128 KB (enforced by scripts/docs_audit.py check H5). This script makes
the rotation mechanical: entries below the window — or the byte-budget
excess — rotate VERBATIM to archive/WORKLOG_ARCHIVE.md in the same commit.
Size-driven, never calendar-driven, never one-shot (the Phase-237 lesson:
a single manual rotation regrew the live file to 740 KB within 9 days).

Usage:
  python3 scripts/worklog_rotate.py            # rotate (rewrites both files)
  python3 scripts/worklog_rotate.py --dry-run  # report only, write nothing
Exit:  0 = within caps (no-op) or rotated · 1 = parse error
"""
import re
import sys
from datetime import date
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
LIVE = REPO / "worklog.md"
ARCHIVE = REPO / "archive/WORKLOG_ARCHIVE.md"

KEEP_ENTRIES = 12          # docs_audit.py H5 — entry cap
CAP_BYTES = 128 * 1024     # docs_audit.py H5 — byte cap
DRY = "--dry-run" in sys.argv

if not LIVE.exists():
    print("worklog.md missing — nothing to rotate")
    sys.exit(1)

text = LIVE.read_text()
lines = text.splitlines(keepends=True)

# ---- parse: preamble + entry blocks (each block = its `---` separator,
# the Task ID line, and everything up to the next entry's separator).
starts = [i for i, ln in enumerate(lines) if re.match(r"^Task ID:\s", ln)]
if not starts:
    print("no Task ID entries found — parse error")
    sys.exit(1)

def block_start(task_idx: int) -> int:
    """Index of the `---` separator immediately above the Task ID line."""
    j = task_idx - 1
    while j >= 0 and lines[j].strip() == "":
        j -= 1
    return j if j >= 0 and lines[j].strip() == "---" else task_idx

bounds = [block_start(s) for s in starts] + [len(lines)]
preamble = lines[:bounds[0]]
blocks = [lines[bounds[k]:bounds[k + 1]] for k in range(len(starts))]

# ---- decide the keep-set: newest-on-top → keep the FIRST blocks.
keep = blocks[:KEEP_ENTRIES]
overflow = blocks[KEEP_ENTRIES:]

# byte cap: even ≤ 12 entries may exceed 128 KB — shed the oldest kept
# entries into the overflow (they are NEWER than the existing overflow,
# so they go in FRONT of it, preserving newest-on-top order).
def joined(blocks) -> int:
    """UTF-8 byte size of preamble + the given entry blocks (matches
    docs_audit.py H5, which measures encoded bytes — Arabic prose is
    ~1.5–2 bytes/char)."""
    text = "".join(preamble) + "".join("".join(b) for b in blocks)
    return len(text.encode("utf-8"))

while keep and joined(keep) > CAP_BYTES and len(keep) > 1:
    overflow = [keep.pop()] + overflow

if not overflow and joined(keep) <= CAP_BYTES:
    print(f"within caps — no-op (entries={len(keep)}, "
          f"bytes={joined(keep):,}; caps: {KEEP_ENTRIES} entries / "
          f"{CAP_BYTES:,} bytes)")
    sys.exit(0)

moved = len(overflow)
kept_bytes = joined(keep)
moved_bytes = len("".join("".join(b) for b in overflow).encode("utf-8"))
print(f"rotating {moved} entr{'y' if moved == 1 else 'ies'} "
      f"({moved_bytes:,} bytes) → archive/WORKLOG_ARCHIVE.md · "
      f"live window keeps {len(keep)} entries / {kept_bytes:,} bytes")

if DRY:
    for b in overflow:
        print("  would move:", b[1].strip()[:80])
    sys.exit(0)

new_live = "".join(preamble) + "".join("".join(b) for b in keep)
if not new_live.endswith("\n"):
    new_live += "\n"
live_bytes = len(new_live.encode("utf-8"))

marker = (f"<!-- rotated {date.today().isoformat()} by "
          f"scripts/worklog_rotate.py (Phase 288, ARCH-REMEDIATION): "
          f"{moved} entries moved verbatim from worklog.md -->\n")
with ARCHIVE.open("a", encoding="utf-8") as ar:
    ar.write("\n" + marker)
    ar.write("".join("".join(b) for b in overflow))

LIVE.write_text(new_live, encoding="utf-8")
print(f"done — worklog.md is now {live_bytes:,} bytes; run "
      f"`python3 scripts/docs_audit.py` to confirm H5 is green")
