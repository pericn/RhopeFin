#!/usr/bin/env bash
set -euo pipefail

trim_trailing_space() {
  sed 's/[[:space:]]\+$//'
}

extract_last_review_block() {
  awk '
    function reset_block(line) {
      block = line ORS
      state = 1
    }

    function finalize_block() {
      if (state >= 3) {
        last = block
      }
      block = ""
      state = 0
    }

    /^VERDICT: patch is (correct|incorrect)[[:space:]]*$/ {
      finalize_block()
      reset_block($0)
      next
    }

    state == 1 {
      if (/^[[:space:]]*$/) {
        block = block $0 ORS
        next
      }

      if (/^CONFIDENCE: /) {
        block = block $0 ORS
        state = 2
        next
      }

      finalize_block()
      next
    }

    state == 2 {
      if (/^[[:space:]]*$/) {
        block = block $0 ORS
        next
      }

      if (/^FINDINGS:[[:space:]]*$/) {
        block = block $0 ORS
        state = 3
        next
      }

      finalize_block()
      next
    }

    state >= 3 {
      if (/^tokens used([[:space:]]|:|$)/) {
        finalize_block()
        next
      }

      block = block $0 ORS
      next
    }

    END {
      finalize_block()
      if (last != "") {
        printf "%s", last
      }
    }
  '
}

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
OUT_DIR="${CODEX_REVIEW_OUT_DIR:-tmp/review-artifacts}"
OUT_FILE="$OUT_DIR/codex_review.md"

mkdir -p "$OUT_DIR"

DIFF_FILE="$OUT_DIR/codex_review.diff"

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "")
DIFF_EXCLUDES=()
if [[ -n "$REPO_ROOT" ]]; then
  if [[ "$OUT_DIR" != /* ]]; then
    DIFF_EXCLUDES=(":(exclude)$OUT_DIR/**")
  else
    case "$OUT_DIR" in
      "$REPO_ROOT"/*)
        rel_dir="${OUT_DIR#"$REPO_ROOT"/}"
        DIFF_EXCLUDES=(":(exclude)$rel_dir/**")
        ;;
    esac
  fi
fi

GIT_CMD=(git)
if [[ -n "$REPO_ROOT" ]]; then
  GIT_CMD=(git -C "$REPO_ROOT")
fi

case "$MODE" in
  staged)
    "${GIT_CMD[@]}" diff --cached -- . "${DIFF_EXCLUDES[@]}" > "$DIFF_FILE"
    ;;
  worktree)
    "${GIT_CMD[@]}" diff -- . "${DIFF_EXCLUDES[@]}" > "$DIFF_FILE"
    ;;
  range)
    BASE="${2:-}"
    HEAD="${3:-}"
    if [[ -z "$BASE" || -z "$HEAD" ]]; then
      echo "usage: $0 range <base> <head>" >&2
      exit 2
    fi
    "${GIT_CMD[@]}" diff "$BASE".."$HEAD" -- . "${DIFF_EXCLUDES[@]}" > "$DIFF_FILE"
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

PROMPT=$(cat <<'PROMPT_EOF'
You are a senior code reviewer.

Rules:
- Focus on correctness, security, performance, maintainability, and DX.
- Avoid nitpicks.
- Be concrete and actionable.
- Do not invent hypothetical failures that are not evidenced by the diff.
- When reviewing parser or shell-script changes, prefer observed contract violations over speculative future output variations.
- If a behavior is an intentional tradeoff to tolerate known Codex CLI noise while preserving the stated output contract, do not mark the patch incorrect for that tradeoff alone.

Review only the unified diff included below.
Do not ask for AGENTS.md, repository context, or extra files.
If the diff is sufficient, produce the review directly.

Output MUST contain these lines:
VERDICT: patch is correct|patch is incorrect
CONFIDENCE: 0.xx

Then:
FINDINGS:
- [P0|P1|P2] <short title> — <what/why> — <suggestion> (include file/line if possible)

PROMPT_EOF
)

PROMPT_FILE="$OUT_DIR/codex_review.prompt.txt"

{
  printf '%s\n\n' "$PROMPT"
  printf '%s\n\n' 'Unified diff to review:'
  printf '%s\n' '```diff'
  cat "$DIFF_FILE"
  printf '\n```\n'
} > "$PROMPT_FILE"

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

set +e
codex exec -m "$MODEL" -s read-only -C . < "$PROMPT_FILE" 2>&1 \
  | tee -a "$OUT_FILE"
codex_status=${PIPESTATUS[0]}
set -e

if [[ "$codex_status" -ne 0 ]]; then
  if grep -q '429 Too Many Requests' "$OUT_FILE"; then
    echo "Codex review FAILED: codex exec hit 429 Too Many Requests (see $OUT_FILE)" >&2
  else
    echo "Codex review FAILED: codex exec exited with status $codex_status (see $OUT_FILE)" >&2
  fi
  exit 1
fi

if ! grep -Eq '^VERDICT: patch is (correct|incorrect)[[:space:]]*$' "$OUT_FILE"; then
  echo "Codex review FAILED: missing VERDICT block (see $OUT_FILE)" >&2
  exit 1
fi

PARSED_FILE="$OUT_DIR/codex_review.parsed.md"
extract_last_review_block < "$OUT_FILE" | trim_trailing_space > "$PARSED_FILE"

if [[ ! -s "$PARSED_FILE" ]]; then
  echo "Codex review FAILED: unable to isolate final review block (see $OUT_FILE)" >&2
  exit 1
fi

first_line=$(head -n1 "$PARSED_FILE" || true)
if [[ "$first_line" != VERDICT:* ]]; then
  echo "Codex review FAILED: missing leading VERDICT block (see $OUT_FILE)" >&2
  exit 1
fi

verdict_count=$(grep -Ec '^VERDICT: patch is (correct|incorrect)[[:space:]]*$' "$PARSED_FILE" || true)
confidence_count=$(grep -Ec '^CONFIDENCE: ' "$PARSED_FILE" || true)
findings_count=$(grep -Ec '^FINDINGS:[[:space:]]*$' "$PARSED_FILE" || true)

if [[ "$verdict_count" -ne 1 ]]; then
  echo "Codex review FAILED: expected exactly 1 VERDICT, got $verdict_count (see $OUT_FILE)" >&2
  exit 1
fi

if [[ "$confidence_count" -ne 1 ]]; then
  echo "Codex review FAILED: expected exactly 1 CONFIDENCE, got $confidence_count (see $OUT_FILE)" >&2
  exit 1
fi

if [[ "$findings_count" -ne 1 ]]; then
  echo "Codex review FAILED: expected exactly 1 FINDINGS header, got $findings_count (see $OUT_FILE)" >&2
  exit 1
fi

if ! grep -Eq '^VERDICT: patch is (correct|incorrect)[[:space:]]*$' "$PARSED_FILE"; then
  echo "Codex review FAILED: missing or malformed VERDICT (see $OUT_FILE)" >&2
  exit 1
fi

if ! grep -Eq '^CONFIDENCE: ' "$PARSED_FILE"; then
  echo "Codex review FAILED: missing CONFIDENCE (see $OUT_FILE)" >&2
  exit 1
fi

if ! grep -Eq '^FINDINGS:[[:space:]]*$' "$PARSED_FILE"; then
  echo "Codex review FAILED: missing FINDINGS header (see $OUT_FILE)" >&2
  exit 1
fi

verdict_line=$(grep -En '^VERDICT: patch is (correct|incorrect)[[:space:]]*$' "$PARSED_FILE" | head -n1 | cut -d: -f1 || true)
confidence_line=$(grep -En '^CONFIDENCE: ' "$PARSED_FILE" | head -n1 | cut -d: -f1 || true)
findings_line=$(grep -En '^FINDINGS:[[:space:]]*$' "$PARSED_FILE" | head -n1 | cut -d: -f1 || true)

if [[ -z "$verdict_line" || -z "$confidence_line" || -z "$findings_line" ]]; then
  echo "Codex review FAILED: missing required review fields (see $OUT_FILE)" >&2
  exit 1
fi

if (( confidence_line <= verdict_line || findings_line <= confidence_line )); then
  echo "Codex review FAILED: VERDICT / CONFIDENCE / FINDINGS block malformed or out of order (see $OUT_FILE)" >&2
  exit 1
fi

# Allow empty findings list for clean patches. If findings are present, every
# non-blank line after FINDINGS must follow the severity checklist format.
if [[ -s "$PARSED_FILE" ]]; then
  findings_body=$(tail -n +$((findings_line + 1)) "$PARSED_FILE" || true)
  non_blank_findings=$(printf '%s\n' "$findings_body" | sed '/^[[:space:]]*$/d')
  if [[ -n "$non_blank_findings" ]]; then
    if printf '%s\n' "$non_blank_findings" | grep -Ev '^[[:space:]]*- \[(P0|P1|P2)\] ' | grep -q .; then
      echo "Codex review FAILED: malformed findings list (see $OUT_FILE)" >&2
      exit 1
    fi
  fi
fi

if grep -Eq '^VERDICT: patch is incorrect[[:space:]]*$' "$PARSED_FILE"; then
  echo "Codex review FAILED (see $OUT_FILE)" >&2
  exit 1
fi

echo "Codex review PASSED (see $OUT_FILE; parsed block: $PARSED_FILE)"
