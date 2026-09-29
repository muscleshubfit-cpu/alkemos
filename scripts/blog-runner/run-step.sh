#!/usr/bin/env bash
# =====================================================================
# scripts/blog-runner/run-step.sh
#
# Retry wrapper around run-step.mts for GitHub Actions:
#   • up to MAX_ATTEMPTS tries per pipeline step
#   • linear backoff: 120s after attempt 1, 240s after attempt 2
#     (matches the previous curl-based workflow policy)
#   • captures queueId from step1 JSON into $GITHUB_ENV so later
#     steps receive it automatically
#
# R1 REPAIR LOOP (Execution-Path Audit §8.2 A3, 2026-09-29 —
# docs/EXECUTION-PATH-AUDIT-AND-RECOVERY-PLAN-2026-09-29.md):
#   • a DETERMINISTIC gate failure at P5 (exit code 3 from run-step.mts
#     + a "RERUN_TARGET=<step>" stdout line) is a REPAIR DIRECTIVE, not
#     a transient error. The blind ×3 retry re-runs the SAME gates on
#     the SAME immutable bundle and fails byte-identically (live
#     evidence: three identical P5 failures, ~6 wasted minutes, run
#     36507693416) — so this wrapper now EXECUTES the directive in-run:
#     it re-runs the targeted step and every step between it and P5 on
#     the SAME queue row (status gates advance: p2 → p3 → p4 → p5),
#     then re-attempts P5. Budget: ≤ MAX_REPAIRS (2) repair cycles,
#     then the honest markFailed of today. No gate/threshold changed.
#   • steps P0–P4 keep their plain ×3 transient retry (they never
#     exit 3 — the contract is emitted only by P5's deterministic
#     gates; quota/duplicate skips are 200s and never reach here).
#   • p2-content repair re-runs with P2_FORCE_REGENERATE=1 (the
#     ?force=1 contract — regenerate content over the draft while
#     research0/outline/images stay in the bundle).
#   • recursive repair calls pin MAX_REPAIRS=0 — the repair chain
#     never nests another repair loop.
#
# R5 REPAIR OBSERVABILITY (Execution-Path Audit §10 Phase R5,
# 2026-09-30): each repair increment appends REPAIRS_USED=<n> to
# $GITHUB_ENV — the workflow's Summary step prints it as the run's
# repair-loop line («repair-first vs regenerate»). Only the top-level
# p5-publish invocation can be in the repair loop (the chain re-runs
# p2..p4, never p5), so no recursive child can clobber the counter; a
# clean zero-repair run writes nothing and the summary defaults to 0.
#
# Usage:  bash scripts/blog-runner/run-step.sh <step-name> [max-attempts]
# Env:    QUEUE_ID (optional input from previous steps)
#         PIPELINE_LANG ("en"|"ar") — language-split pipelines (2026-08-27);
#         forwarded as --lang so P0 creates a single-language row.
#         GITHUB_ENV (provided by Actions runtime)
#         MAX_REPAIRS (default 2 — R1 repair-cycle budget)
#         P2_FORCE_REGENERATE ("1" — set ONLY by this wrapper's repair
#         chain; never by workflows or humans)
# Exit:   0 on success, 1 if all attempts/repairs failed
# =====================================================================
set -uo pipefail

STEP="${1:?usage: run-step.sh <step-name> [max-attempts]}"
MAX_ATTEMPTS="${2:-3}"
MAX_REPAIRS="${MAX_REPAIRS:-2}"

# The ordered pipeline (v3). The repair chain re-runs everything from
# the rerunTarget through p4-review; P5 itself is re-attempted by this
# loop right after the chain (indices: p0=0 p1=1 p2=2 p3=3 p4=4 p5=5).
PIPELINE_STEPS=(p0-research p1-outline p2-content p3-images p4-review p5-publish)
P4_INDEX=4

ARGS=(--step "$STEP")
if [ -n "${QUEUE_ID:-}" ]; then
  ARGS+=(--queueId "$QUEUE_ID")
fi
if [ -n "${PIPELINE_LANG:-}" ]; then
  ARGS+=(--lang "$PIPELINE_LANG")
fi
# PHASE 162 (coach pipeline parity): optional topic override — set only by
# workflow_dispatch runs the coach triggered; scheduled runs never set it.
if [ -n "${PIPELINE_TOPIC:-}" ]; then
  ARGS+=(--topic "$PIPELINE_TOPIC")
fi

attempt=1
repairs_used=0
while :; do
  echo "--- [$STEP] attempt $attempt / $MAX_ATTEMPTS ---"

  set +e
  npx --no-install tsx scripts/blog-runner/run-step.mts "${ARGS[@]}" 2>&1 | tee /tmp/"$STEP".out
  CODE=${PIPESTATUS[0]}
  set -u

  if [ "$CODE" -eq 0 ]; then
    # Capture queueId once (step1 only — uuid v4 quoted string).
    QID="$(grep -o '"queueId":"[^"]*"' /tmp/"$STEP".out | head -1 | cut -d'"' -f4)"
    if [ -n "$QID" ] && [ -n "${GITHUB_ENV:-}" ]; then
      echo "QUEUE_ID=$QID" >> "$GITHUB_ENV"
      echo "[$STEP] captured QUEUE_ID=$QID"
    fi
    echo "✓ $STEP succeeded"
    exit 0
  fi

  # ── R1 REPAIR CONTRACT: exit 3 = deterministic gate failure ────────
  if [ "$CODE" -eq 3 ]; then
    TARGET="$(grep -a -o '^RERUN_TARGET=[a-z0-9-]*' /tmp/"$STEP".out | tail -1 | cut -d= -f2)"

    # Contract sanity — anything off is an honest exit-1 failure.
    if [ -z "$TARGET" ]; then
      echo "❌ [$STEP] exit 3 without a parseable RERUN_TARGET line — honest failure"
      exit 1
    fi
    case "$TARGET" in
      p2-content|p4-review) ;;
      *)
        echo "❌ [$STEP] RERUN_TARGET '$TARGET' outside the repair contract — honest failure"
        exit 1
        ;;
    esac
    if [ "$STEP" != "p5-publish" ]; then
      # P0–P4 routes never emit rerunTarget; guard the contract anyway.
      echo "❌ [$STEP] repair contract from a non-P5 step — honest failure"
      exit 1
    fi
    if [ -z "${QUEUE_ID:-}" ]; then
      echo "❌ [$STEP] repair contract without QUEUE_ID — honest failure"
      exit 1
    fi
    if [ "$repairs_used" -ge "$MAX_REPAIRS" ]; then
      echo "❌ [$STEP] repair budget exhausted ($MAX_REPAIRS cycle(s), last target: $TARGET) — honest failure (markFailed stands)"
      exit 1
    fi

    repairs_used=$((repairs_used + 1))
    # R5: surface the count to the job Summary (appends are read by
    # LATER steps; the last line wins, so this is always the latest
    # cycle count for this run).
    if [ -n "${GITHUB_ENV:-}" ]; then
      echo "REPAIRS_USED=$repairs_used" >> "$GITHUB_ENV"
    fi
    echo "🔁 [$STEP] R1 repair cycle $repairs_used/$MAX_REPAIRS: re-running from $TARGET on queue row $QUEUE_ID (bundle preserved)"

    # Re-run every step from TARGET through P4 (advances the status
    # chain; p2-content regenerates over its draft via force=1). If a
    # repair step fails, the chain stops — P5 below re-evaluates the
    # unchanged bundle and either exits 3 again (next repair cycle /
    # honest failure) or succeeds; a deterministic P5 pass costs only
    # pure-code time (no AI).
    CHAIN_FROM=-1
    for i in "${!PIPELINE_STEPS[@]}"; do
      if [ "${PIPELINE_STEPS[$i]}" = "$TARGET" ]; then
        CHAIN_FROM=$i
        break
      fi
    done
    if [ "$CHAIN_FROM" -lt 0 ]; then
      echo "❌ [$STEP] RERUN_TARGET '$TARGET' not a pipeline step — honest failure"
      exit 1
    fi

    i="$CHAIN_FROM"
    while [ "$i" -le "$P4_INDEX" ]; do
      RS="${PIPELINE_STEPS[$i]}"
      echo "   └─ repair step: $RS"
      if [ "$RS" = "p2-content" ]; then
        if ! MAX_REPAIRS=0 P2_FORCE_REGENERATE=1 bash "$0" "$RS" "$MAX_ATTEMPTS"; then
          echo "   └─ repair step $RS failed — chain stops (P5 re-evaluates next)"
          break
        fi
      else
        if ! MAX_REPAIRS=0 bash "$0" "$RS" "$MAX_ATTEMPTS"; then
          echo "   └─ repair step $RS failed — chain stops (P5 re-evaluates next)"
          break
        fi
      fi
      i=$((i + 1))
    done

    # Re-attempt the failed step immediately — the repair IS the
    # strategy change; no backoff sleep between repair cycles (audit:
    # the old policy burned ~6 idle minutes on deterministic retries).
    attempt=$((attempt + 1))
    continue
  fi

  # ── transient failure (exit 1/2): the legacy ×3 + backoff policy ──
  echo "↻ [$STEP] attempt $attempt failed (exit $CODE)"
  if [ "$attempt" -lt "$MAX_ATTEMPTS" ]; then
    WAIT=$((120 * attempt))
    echo "   retrying in ${WAIT}s ..."
    sleep "$WAIT"
    attempt=$((attempt + 1))
    continue
  fi
  break
done

echo "❌ [$STEP] failed after $MAX_ATTEMPTS attempts"
exit 1
