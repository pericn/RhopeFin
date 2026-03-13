#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-4173}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"

# Start a tiny static server
python3 -m http.server "$PORT" >"/tmp/rilo_smoke_http.log" 2>&1 &
PID=$!
trap 'kill "$PID" 2>/dev/null || true' EXIT

# Wait until server is ready (max ~3s)
for i in {1..10}; do
  if curl -fsS "http://127.0.0.1:${PORT}/index.html" >/dev/null 2>&1; then
    echo "✅ smoke ok: GET /index.html (200)"
    exit 0
  fi
  sleep 0.3
done

echo "❌ smoke failed: server not ready or /index.html not reachable" >&2
exit 1
