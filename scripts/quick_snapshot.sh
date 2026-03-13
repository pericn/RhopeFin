#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LABEL="${1:-manual}"
TS_ID="$(TZ=Asia/Shanghai date '+%Y%m%d-%H%M%S')"
SNAP_DIR="$ROOT_DIR/tmp/snapshots/${TS_ID}-${LABEL}"
mkdir -p "$SNAP_DIR"

(
  cd "$ROOT_DIR"
  git status -sb > "$SNAP_DIR/git-status.txt" || true
  git diff > "$SNAP_DIR/git-diff.patch" || true
)

cp "$ROOT_DIR/docs/worklog.md" "$SNAP_DIR/worklog.md" 2>/dev/null || true
cp "$ROOT_DIR/docs/round-baton.md" "$SNAP_DIR/round-baton.md" 2>/dev/null || true
cp "$ROOT_DIR/docs/decision-log.md" "$SNAP_DIR/decision-log.md" 2>/dev/null || true

printf 'snapshot saved: %s\n' "$SNAP_DIR"
