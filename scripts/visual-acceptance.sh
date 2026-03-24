#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-4173}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PREVIEW_URL="${PREVIEW_URL:-http://127.0.0.1:${PORT}/index.html}"

cd "$ROOT"

python3 -m http.server "$PORT" >/dev/null 2>&1 &
PID=$!
trap 'kill "$PID" 2>/dev/null || true' EXIT

for i in {1..10}; do
  if curl -fsS "$PREVIEW_URL" >/dev/null 2>&1; then
    PREVIEW_URL="$PREVIEW_URL" node scripts/visual-acceptance.cjs
    exit $?
  fi
  sleep 0.3
done

echo "preview server not ready at $PREVIEW_URL" >&2
exit 1
