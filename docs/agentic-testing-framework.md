# Agentic Testing & Fixing Framework — Rilo Analysis

> 让测试、发现、修复、验证全部自动化运行，最小化人工介入。

---

## 核心哲学

**旧模式（人工驱动）**：
```
人工 → 跑测试 → 发现问题 → 描述问题 → 等待 agent → 确认 → 重复
```
问题：人工成为 bottleneck，延迟高，容易遗漏。

**新模式（agentic 闭环）**：
```
测试运行（自动）
    ↓
结果收集 + 问题分类
    ↓
每类问题 spawn 一个 fix session（并行）
    ↓
fix 完成后自动验证
    ↓
通过 → 更新 bitable；失败 → 记录 blocker → 通知
```
目标：人工只处理"无法自动判决"的设计决策。

---

## 一、测试套件（必须覆盖的 5 层）

### Layer 1 — Smoke（每次 push 必须通过）
```bash
cd /Users/peric/Documents/Projects/Rilo\ Analysis && bash scripts/smoke.sh
```
- 验证页面可加载（GET 200）
- 验证 JS 无语法错误（`node --check`）
- 快速（< 5 秒）

### Layer 2 — Code Logic（变更相关文件时触发）
- `node --test tests/ui-interaction-refactor.test.js`
- 计算器逻辑验证（如果有）
- 公式引擎边界测试

### Layer 3 — Dynamic Reactivity（核心数据路径）
脚本：`tests/dynamic-calc.test.cjs`
覆盖：
- [ ] App 加载 + Overview KPI 渲染
- [ ] Settings → 改输入 → Overview KPI 响应变化
- [ ] Analysis 场景表渲染（4 行）
- [ ] 页面无 `Unexpected token {` 运行时错误

### Layer 4 — Visual Regression（关键页面截图）
页面点位（固定 viewport=1440x900）：
- Overview 全页
- Settings 全页
- Analysis 全页
- 带 hover/交互状态的关键组件

Baseline 目录：`~/.openclaw/workspace-cody/ledger/ui_visual_baselines/rilo/`
Diff 工具：`~/.openclaw/workspace/scripts/visual/diff.mjs`

### Layer 5 — Edge Cases & Boundary（数据驱动）
覆盖场景：
- [ ] Occupancy = 0% / 100%（边界）
- [ ] ADR = 0 / 超大数值
- [ ] 负数输入处理
- [ ] 空数据状态（无 scenario）
- [ ] 极小净利润（接近 0）

---

## 二、Agentic 闭环工作流

### 触发条件
- 每次 push 到 `feat/rilo-analysis-s2-swarm`
- 每次 heartbeat（每 1 小时）
- 人工显式触发

### Step 1 — 测试运行（自动）
```
我（cody）执行：
1. 跑 smoke
2. 跑 dynamic-calc.test.cjs
3. 跑 ui-interaction tests
4. 截图关键页面
5. 收集 console errors（via Playwright）
```

### Step 2 — 问题分类
每个失败项归类：
- **P0**：运行时 JS 错误（语法/引用）→ 自动可修复
- **P1**：功能路径断裂（KPI 不响应、数据 NaN）→ 自动可修复
- **P2**：视觉不一致（diff > 0）→ 需要人工判决
- **P3**：边界条件失败 → 可自动修复

### Step 3 — 自动 spawn fix session（针对 P0/P1/P3）
规则：
- P0/P1：立即 spawn，描述精确到文件和行
- P3：评估后可 skip
- 每个失败 spawn 1 个独立 session
- Session 标签格式：`rilo-fix/<issue-name>`

### Step 4 — 验证闭环
fix 完成后：
1. 重新跑相关测试
2. 通过 → 更新 bitable 任务状态 + commit
3. 失败 → 记录 `Blocked` + 人工通知

---

## 三、运行命令

### 快速全量测试（手动）
```bash
# 1. Smoke
cd /Users/peric/Documents/Projects/Rilo\ Analysis && bash scripts/smoke.sh

# 2. Unit tests
node --test tests/ui-interaction-refactor.test.js

# 3. Dynamic reactivity
node tests/dynamic-calc.test.cjs

# 4. Visual screenshots
# （通过 Playwright 脚本，输出到 ledger 目录）
```

### Watchdog 汇总
运行后输出格式：
```
UI Watchdog Summary — Rilo Analysis
===================================
Smoke: ✅/❌
Unit tests: ✅/❌
Dynamic tests: ✅/❌ (passed/N)
Console errors: N new
Visual diffs: N files with diff

Done:
- [commit] fix description

Blocked:
- issue name — reason

Next:
1. spawn fix session for [issue]
ETA: [estimation]
```

---

## 四、与 HEARTBEAT 的关系

HEARTBEAT.md 的心跳协议已经集成了这套框架：
- bitable 状态查询 → 发现未完成任务
- smoke + dynamic test → 验证当前状态
- subagent spawn → 自动修复闭环
- bitable 更新 → 记录真相源

---

## 五、已知限制

- 视觉 diff 需要人工确认（P2 类）
- Playwright 截图依赖 headless Chrome（已验证可用）
- Session spawn 有频率限制（Codex ACP 不稳定时退化到人工）
- Bitable 写入依赖飞书 token（目前已通）

---

## 六、改进记录

| 日期 | 改进 |
|------|------|
| 2026-03-27 | 初版框架建立，整合 smoke + dynamic + visual + watchdog |
