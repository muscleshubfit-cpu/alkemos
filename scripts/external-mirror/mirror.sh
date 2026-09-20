#!/usr/bin/env bash
# External Git Mirror — P0-1 of docs/EMERGENCY-RECOVERY-HARDENING-PLAN-2026-09-20.md
#
# WHY: one GitHub account currently holds EVERYTHING (public code + PRIVATE
# daily snapshots with PII + secrets + automation) — audit 2026-09-20 blocker
# B2 (single point of total failure). This script mirrors BOTH repositories,
# full history and all refs, to EXTERNAL private remotes, breaking that
# single-account failure mode.
#
# WHERE IT RUNS: the owner's machine (cron) OR the dormant workflow
# .github/workflows/external-mirror.yml (activates after the one-time setup
# in docs/RECOVERY-MIRROR-SETUP.md — nothing is mirrored until the owner
# provides the external credentials; by design this script is NOT a mirror
# creation by itself).
#
# MANDATORY: both external repositories MUST be PRIVATE — the snapshots
# repository contains user PII (emails/names). See the setup doc.
#
# USAGE (owner machine):
#   MAIN_TOKEN=<github-read-token-for-the-private-repo> \
#   MIRROR_TOKEN=<external-provider-push-token> \
#   MIRROR_REMOTE_MAIN=https://<provider>/<you>/alkemos-mirror.git \
#   MIRROR_REMOTE_BACKUPS=https://<provider>/<you>/musclehubeg-backups-mirror.git \
#     bash scripts/external-mirror/mirror.sh
#   (MAIN_TOKEN may be empty when running where the public repo is enough —
#   the PRIVATE snapshots repo always requires it.)
#
# VERIFICATION: the script compares the mirrored main HEAD SHA with the
# source after every push and exits non-zero on any mismatch. Tokens are
# never printed (they only ever live inside the temp clone's remote URLs,
# which Actions masks in logs).

set -euo pipefail

MAIN_SOURCE="${MAIN_SOURCE:-https://github.com/muscleshubfit-cpu/alkemos.git}"
BACKUPS_SOURCE="${BACKUPS_SOURCE:-https://github.com/muscleshubfit-cpu/musclehubeg-backups.git}"
: "${MIRROR_REMOTE_MAIN:?MIRROR_REMOTE_MAIN is required — the external PRIVATE repo URL for alkemos}"
: "${MIRROR_REMOTE_BACKUPS:?MIRROR_REMOTE_BACKUPS is required — the external PRIVATE repo URL for musclehubeg-backups}"
: "${MIRROR_TOKEN:?MIRROR_TOKEN is required — a provider token with push access to BOTH external repos}"
MAIN_TOKEN="${MAIN_TOKEN:-}"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

inject() { # <url> <token-or-empty> → https://x-access-token:<token>@host/…
  if [ -n "${2:-}" ]; then printf '%s' "$1" | sed "s#^https://#https://x-access-token:${2}@#"; else printf '%s' "$1"; fi
}

mirror_one() { # <name> <source-url> <remote-url>
  local name="$1" src dst dir src_head dst_head
  src="$(inject "$2" "${MAIN_TOKEN}")"
  dst="$(inject "$3" "$MIRROR_TOKEN")"
  dir="$WORK/$name"
  echo "==> mirroring $name (full history, all refs)"
  git clone --quiet --mirror "$src" "$dir"
  git -C "$dir" push --quiet --mirror "$dst"
  src_head="$(git -C "$dir" rev-parse --verify refs/heads/main 2>/dev/null || git -C "$dir" rev-parse --verify HEAD)"
  dst_head="$(git ls-remote "$dst" refs/heads/main | cut -f1)"
  if [ -z "$dst_head" ]; then
    echo "mirror: $name — remote refs/heads/main not found after push" >&2
    exit 1
  fi
  if [ "$src_head" = "$dst_head" ]; then
    echo "    ok: $name — main ${src_head:0:10} mirrored (SHA match verified)"
  else
    echo "mirror: $name SHA MISMATCH — src=${src_head:0:10} remote=${dst_head:0:10}" >&2
    exit 1
  fi
}

mirror_one alkemos "$MAIN_SOURCE" "$MIRROR_REMOTE_MAIN"
mirror_one musclehubeg-backups "$BACKUPS_SOURCE" "$MIRROR_REMOTE_BACKUPS"

echo "mirror: done — both repositories mirrored and SHA-verified."
