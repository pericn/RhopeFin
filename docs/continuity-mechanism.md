# Continuity Mechanism — Rilo Analysis

> 目标：降低“API 停止 / 执行中断 / 上下文漂移”对开发节奏的影响，让任务通过文件接力持续推进。

## 核心机制

### 1. 一轮一任务（Bounded Round）
- 每一轮 Codex 只做 **一个小目标**。
- 目标必须小到：
  - 能在 2–10 分钟内看出进展
  - 失败也不会丢大片上下文
- 禁止“一个 prompt 同时做 6 件事”。

### 2. Baton 接力文件
- 文件：`docs/round-baton.md`
- 作用：不依赖聊天上下文，明确记录：
  - 当前轮次
  - 当前目标
  - 当前状态
  - 下一步命令
  - 最近日志路径
- 任何新一轮执行，都应先读取 baton，再继续。

### 3. 五分钟节拍
- 文件：`docs/worklog.md`
- 每 5 分钟至少有一条节拍记录：
  - 当前子任务
  - 状态（doing / blocked / done）
  - 风险 / 阻塞
  - 下一步
  - 是否快照

### 4. 快照机制
- 脚本：`scripts/quick_snapshot.sh`
- 触发时机：
  - API 响应明显变慢
  - 刚完成一个小里程碑
  - 准备做目录重构 / 大范围改动
  - 发现当前轮可能被中断
- 快照内容：
  - git status
  - git diff
  - worklog 副本
  - round baton 副本

### 5. 脚本化轮次执行
- 脚本：`scripts/codex_round.sh`
- 作用：
  - 启动前自动写入 baton
  - 自动把本轮 prompt 固化到日志目录
  - 执行结束后自动更新 baton 状态
  - 即使失败，也保留日志与下轮接续点

## 建议运行方式
1. 先写本轮 prompt 文件（例如 `tmp/round-01.prompt.md`）
2. 执行：
   ```bash
   scripts/codex_round.sh tmp/round-01.prompt.md "Round 01 - 概览页骨架重构"
   ```
3. 若感觉 API 变慢：
   ```bash
   scripts/quick_snapshot.sh "before-overview-layout"
   ```
4. 下一轮开始前，先看：
   - `docs/round-baton.md`
   - `docs/worklog.md`

## 执行纪律
- 不中断时：按 baton 接着跑
- 中断时：先快照，再开下一轮
- 不再依赖“上一条聊天消息”承接复杂任务
- 以文件为主、聊天为辅
