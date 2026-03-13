#!/usr/bin/env bash
set -euo pipefail

# Codex review gate (local)
# Usage:
#   scripts/review_codex.sh staged
#   scripts/review_codex.sh worktree
#   scripts/review_codex.sh range <base> <head>
#
# Exit codes:
#   0 = pass
#   1 = fail (VERDICT incorrect)
#   2 = usage / missing diff

MODE="${1:-staged}" # staged|worktree|range
MODEL="${CODEX_MODEL:-gpt-5.2-codex}"
OUT_DIR="${CODEX_REVIEW_OUT_DIR:-tmp}"
OUT_FILE="$OUT_DIR/codex_review.md"

mkdir -p "$OUT_DIR"

DIFF_FILE="$OUT_DIR/codex_review.diff"

case "$MODE" in
  staged)
    git diff --cached > "$DIFF_FILE"
    ;;
  worktree)
    git diff > "$DIFF_FILE"
    ;;
  range)
    BASE="${2:-}"
    HEAD="${3:-}"
    if [[ -z "$BASE" || -z "$HEAD" ]]; then
      echo "usage: $0 range <base> <head>" >&2
      exit 2
    fi
    git diff "$BASE".."$HEAD" > "$DIFF_FILE"
    ;;
  *)
    echo "usage: $0 staged|worktree|range <base> <head>" >&2
    exit 2
    ;;
esac

if [[ ! -s "$DIFF_FILE" ]]; then
  echo "No diff to review (mode=$MODE)." >&2
  exit 2
fi

PROMPT=$(cat <<'EOF'
You are a senior code reviewer.

Rules:
- Focus on correctness, security, performance, maintainability, and DX.
- Avoid nitpicks.
- Be concrete and actionable.

Output MUST contain these lines:
VERDICT: patch is correct|patch is incorrect
CONFIDENCE: 0.xx

Then:
FINDINGS:
- [P0|P1|P2] <short title> — <what/why> — <suggestion> (include file/line if possible)

EOF
)

{
  echo "# Codex Review"
  echo
  echo "- mode: $MODE"
  echo "- model: $MODEL"
  echo "- time: $(date '+%Y-%m-%d %H:%M:%S')"
  echo
  echo '---'
  echo
} > "$OUT_FILE"

cat "$DIFF_FILE" | codex exec -m "$MODEL" -s read-only -a never -C . "$PROMPT" \
  | tee -a "$OUT_FILE"

if grep -q "^VERDICT: patch is incorrect" "$OUT_FILE"; then
  echo "Codex review FAILED (see $OUT_FILE)" >&2
  exit 1
fi

echo "Codex review PASSED (see $OUT_FILE)"
