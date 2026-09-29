#!/usr/bin/env bash
# =====================================================================
# scripts/blog-runner/run-step-loop-test.sh
#
# R1 REPAIR LOOP integration test (Execution-Path Audit §8.2 A3,
# 2026-09-29) — verifies the run-step.sh LOOP MECHANICS locally in a
# simulated GHA environment, with ZERO network, ZERO Supabase, ZERO
# AI calls: a stub `npx` on PATH emulates run-step.mts per scripted
# behaviors (exit codes + stdout lines, including the RERUN_TARGET
# contract), while the REAL run-step.sh wrapper runs unmodified —
# arg threading, exit-code translation, repair-chain sequencing,
# force-flag propagation, budget exhaustion, and the legacy ×3
# transient policy are all exercised for real.
#
# The leaf route logic itself (message→target map) is unit-pinned in
# src/lib/__tests__/blog-repair-target.test.ts; the end-to-end proof
# on a live row rides the next monitored scheduled/dispatch run.
#
# Usage:   bash scripts/blog-runner/run-step-loop-test.sh
# Exit:    0 = all scenarios green · 1 = at least one failed
# =====================================================================
set -uo pipefail
cd "$(dirname "$0")/../.." || exit 1

TMP="$(mktemp -d /tmp/r1-loop-test.XXXXXX)"
trap 'rm -rf "$TMP"' EXIT
QID="11111111-2222-3333-4444-555555555555"

# ── the stub npx: emulate `npx --no-install tsx run-step.mts --step …`
mkdir -p "$TMP/bin" "$TMP/state"
cat > "$TMP/bin/npx" <<'SHIM'
#!/usr/bin/env bash
# stub npx — parses --step/--queueId, pops the next scripted behavior
# line ("<exit>|<stdout text>"), records the call, acts it out.
STEP=""; QID=""; prev=""
for a in "$@"; do
  [ "$prev" = "--step" ] && STEP="$a"
  [ "$prev" = "--queueId" ] && QID="$a"
  prev="$a"
done
CNT="$STUB_STATE/$STEP.n"
n=1; [ -f "$CNT" ] && n=$(( $(cat "$CNT") + 1 ))
echo "$n" > "$CNT"
LINE="$(sed -n "${n}p" "$STUB_SCENARIO/$STEP.txt")"
if [ -z "$LINE" ]; then
  # more invocations than scripted — the expected-log comparison will
  # surface this as a visible mismatch (never pass silently)
  echo "CALL step=$STEP qid=$QID force=${P2_FORCE_REGENERATE:-0} UNSCRIPTED-CALL" >> "$STUB_LOG"
  exit 99
fi
CODE="${LINE%%|*}"; TEXT="${LINE#*|}"
echo "CALL step=$STEP qid=$QID force=${P2_FORCE_REGENERATE:-0} n=$n" >> "$STUB_LOG"
[ "$TEXT" != "$CODE" ] && [ -n "$TEXT" ] && echo "$TEXT"
exit "$CODE"
SHIM
chmod +x "$TMP/bin/npx"

OK_JSON_P2='{"ok":true,"step":"p2","queueId":"'$QID'","regenerated":true}'
OK_JSON_P3='{"ok":true,"step":"p3","queueId":"'$QID'","images":4}'
OK_JSON_P4='{"ok":true,"step":"p4","queueId":"'$QID'"}'
OK_JSON_P5='{"ok":true,"step":"p5","queueId":"'$QID'","postId":"abc"}'

mk_scenario() { # mk_scenario <name> <step-file> <lines...>
  local name="$1" step="$2"; shift 2
  mkdir -p "$TMP/sc/$name"
  printf '%s\n' "$@" > "$TMP/sc/$name/$step.txt"
}

run_case() { # run_case <label> <scenario> <expected-exit> <expected-log> <attempts> [extra env as VAR=VAL...]
  local label="$1" scen="$2" want="$3" wantlog="$4" attempts="$5"; shift 5
  local log="$TMP/calls.log"
  rm -f "$log" "$TMP/state/"*.n
  set +e
  timeout 60 env -u GITHUB_ENV PATH="$TMP/bin:$PATH" \
    STUB_SCENARIO="$TMP/sc/$scen" STUB_STATE="$TMP/state" STUB_LOG="$log" \
    QUEUE_ID="$QID" PIPELINE_LANG=en "$@" \
    bash scripts/blog-runner/run-step.sh p5-publish "$attempts" \
    > "$TMP/out.txt" 2>&1
  local got=$?
  set -u
  local gotlog
  gotlog="$(grep '^CALL ' "$log" 2>/dev/null | sed 's/ n=[0-9]*$//')"

  local pass=1
  [ "$got" -ne "$want" ] && pass=0
  [ "$gotlog" != "$wantlog" ] && pass=0

  if [ "$pass" -eq 1 ]; then
    echo "✓ $label"
  else
    echo "❌ $label"
    echo "   expected exit=$want got=$got"
    echo "   expected call sequence:"; printf '%s\n' "$wantlog" | sed 's/^/     /'
    echo "   actual call sequence:";   printf '%s\n' "$gotlog" | sed 's/^/     /'
    echo "   wrapper output (tail):"; tail -12 "$TMP/out.txt" | sed 's/^/     /'
    FAILURES=$((FAILURES + 1))
  fi
}

FAILURES=0

# ── scenario behaviors ────────────────────────────────────────────────
# sc1: P5 word-floor failure → full p2 repair chain → publish succeeds
mk_scenario sc1 p5-publish \
  "3|RERUN_TARGET=p2-content" "0|$OK_JSON_P5"
mk_scenario sc1 p2-content "0|$OK_JSON_P2"
mk_scenario sc1 p3-images   "0|$OK_JSON_P3"
mk_scenario sc1 p4-review   "0|$OK_JSON_P4"

# sc2: P5 battery failure → p4-only repair → publish succeeds
mk_scenario sc2 p5-publish \
  "3|RERUN_TARGET=p4-review" "0|$OK_JSON_P5"
mk_scenario sc2 p4-review "0|$OK_JSON_P4"

# sc3: deterministic failure never resolves → both repair cycles spent → honest exit 1
mk_scenario sc3 p5-publish \
  "3|RERUN_TARGET=p4-review" "3|RERUN_TARGET=p4-review" "3|RERUN_TARGET=p4-review"
mk_scenario sc3 p4-review "0|$OK_JSON_P4" "0|$OK_JSON_P4"

# sc4: transient exit-1 (MAX_ATTEMPTS=1) → NO repair, legacy behavior
mk_scenario sc4 p5-publish "1|"

# sc5: exit 3 without a parseable RERUN_TARGET line → honest exit 1
mk_scenario sc5 p5-publish "3|HTTP 500 — no contract line here"

# sc6: exit 3 with an out-of-contract target → honest exit 1
mk_scenario sc6 p5-publish "3|RERUN_TARGET=p1-outline"

# sc7: repair step itself exits 3 (non-P5 guard) → chain stops → exit 1
mk_scenario sc7 p5-publish \
  "3|RERUN_TARGET=p4-review" "3|RERUN_TARGET=p4-review" "3|RERUN_TARGET=p4-review"
mk_scenario sc7 p4-review "3|RERUN_TARGET=p2-content" "3|RERUN_TARGET=p2-content"

# ── assertions ────────────────────────────────────────────────────────
echo "=== R1 repair-loop integration tests (simulated GHA, stubbed runner) ==="

run_case "sc1 word-floor → p2 chain (force) → p3 → p4 → publish" sc1 0 \
"CALL step=p5-publish qid=$QID force=0
CALL step=p2-content qid=$QID force=1
CALL step=p3-images qid=$QID force=0
CALL step=p4-review qid=$QID force=0
CALL step=p5-publish qid=$QID force=0" \
3

run_case "sc2 battery → p4 repair → publish" sc2 0 \
"CALL step=p5-publish qid=$QID force=0
CALL step=p4-review qid=$QID force=0
CALL step=p5-publish qid=$QID force=0" \
3

run_case "sc3 deterministic ×3 → 2 repair cycles → honest exit 1" sc3 1 \
"CALL step=p5-publish qid=$QID force=0
CALL step=p4-review qid=$QID force=0
CALL step=p5-publish qid=$QID force=0
CALL step=p4-review qid=$QID force=0
CALL step=p5-publish qid=$QID force=0" \
3

run_case "sc4 transient exit-1 (×1) → no repair, legacy policy" sc4 1 \
"CALL step=p5-publish qid=$QID force=0" \
1

run_case "sc5 exit 3 without RERUN_TARGET line → honest exit 1" sc5 1 \
"CALL step=p5-publish qid=$QID force=0" \
3

run_case "sc6 out-of-contract target → honest exit 1" sc6 1 \
"CALL step=p5-publish qid=$QID force=0" \
3

run_case "sc7 repair step exits 3 → non-P5 guard, chain stops → exit 1" sc7 1 \
"CALL step=p5-publish qid=$QID force=0
CALL step=p4-review qid=$QID force=0
CALL step=p5-publish qid=$QID force=0
CALL step=p4-review qid=$QID force=0
CALL step=p5-publish qid=$QID force=0" \
3

echo "=== result: $((7 - FAILURES))/7 green ==="
[ "$FAILURES" -eq 0 ] && exit 0
exit 1
