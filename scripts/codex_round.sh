#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROMPT_FILE="${1:-}"
GOAL="${2:-}"

if [[ -z "$PROMPT_FILE" || ! -f "$PROMPT_FILE" ]]; then
  echo "Usage: scripts/codex_round.sh <prompt-file> [goal]" >&2
  exit 1
fi

if [[ -z "$GOAL" ]]; then
  GOAL="$(head -n 1 "$PROMPT_FILE" | sed 's/^#\+ *//')"
fi

TS_HUMAN="$(TZ=Asia/Shanghai date '+%Y-%m-%d %H:%M GMT+8')"
TS_ID="$(TZ=Asia/Shanghai date '+%Y%m%d-%H%M%S')"
ROUND_ID="round-${TS_ID}"
LOG_DIR="$ROOT_DIR/tmp/codex-rounds"
LOG_PATH="$LOG_DIR/${ROUND_ID}.log"
PROMPT_COPY="$LOG_DIR/${ROUND_ID}.prompt.md"
BATON_FILE="$ROOT_DIR/docs/round-baton.md"
WORKLOG_FILE="$ROOT_DIR/docs/worklog.md"

mkdir -p "$LOG_DIR"
cp "$PROMPT_FILE" "$PROMPT_COPY"

cat > "$BATON_FILE" <<EOF
# Round Baton — Rilo Analysis

- 当前轮次：${ROUND_ID}
- 当前状态：running
- 当前目标：${GOAL}
- Prompt 文件：${PROMPT_COPY#$ROOT_DIR/}
- 日志文件：${LOG_PATH#$ROOT_DIR/}
- 开始时间：${TS_HUMAN}
- 下一步命令：等待本轮完成后由协调者填写
EOF

cat >> "$WORKLOG_FILE" <<EOF

## ${TS_HUMAN}
- 时间：${TS_HUMAN}
- 当前子任务：${GOAL}
- 状态：doing
- 风险 / 阻塞：待观察
- 下一步：执行本轮 Codex patch
- 是否快照：no
EOF

set +e
codex exec --full-auto "$(cat "$PROMPT_COPY")" | tee "$LOG_PATH"
EXIT_CODE=${PIPESTATUS[0]}
set -e

END_TS_HUMAN="$(TZ=Asia/Shanghai date '+%Y-%m-%d %H:%M GMT+8')"
STATUS_WORD="done"
if [[ "$EXIT_CODE" -ne 0 ]]; then
  STATUS_WORD="blocked"
fi

cat > "$BATON_FILE" <<EOF
# Round Baton — Rilo Analysis

- 当前轮次：${ROUND_ID}
- 当前状态：${STATUS_WORD}
- 当前目标：${GOAL}
- Prompt 文件：${PROMPT_COPY#$ROOT_DIR/}
- 日志文件：${LOG_PATH#$ROOT_DIR/}
- 结束时间：${END_TS_HUMAN}
- 退出码：${EXIT_CODE}
- 下一步命令：由协调者根据本轮输出填写
EOF

cat >> "$WORKLOG_FILE" <<EOF
- 时间：${END_TS_HUMAN}
- 当前子任务：${GOAL}
- 状态：${STATUS_WORD}
- 风险 / 阻塞：退出码 ${EXIT_CODE}
- 下一步：查看 ${LOG_PATH#$ROOT_DIR/} 与 docs/round-baton.md，决定下一轮
- 是否快照：no
EOF

exit "$EXIT_CODE"
