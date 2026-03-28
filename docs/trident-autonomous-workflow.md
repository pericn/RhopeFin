# 三叉戟自动化开发工作流

> 基于 Rilo Analysis 三天对话复盘 × Autoresearch 框架深度研究

---

## 第一部分：Rilo 分析 — 对话模式与摩擦点

### 三天对话中的 5 个核心 Pattern

#### Pattern 1：需求文档与实现之间的语义漂移（最严重）

**发生了什么：**
- acceptance.md 写"Drawer 形态 + tab 切换" → 用户实际要的是"默认关闭的 Drawer + accordion"
- acceptance.md 写"术语解释按钮" → 用户说要移除这个按钮
- acceptance.md 写"C0 Hover 可见性" → 我把 term registry 有没有注册理解为是否显示下划线（完全不同的层次）

**根因：** 验收标准用自然语言描述，描述者和实现者对"Drawert形态"、"tab"、"accordion"这些词的理解可能不同，且没有在开发前对齐。

**这不是 bug，是规格书的失败。**

#### Pattern 2：自动化测试的覆盖盲区

**发生了什么：**
- smoke ✅ → 只验证"页面能加载"
- screenshot 对比 → 只验证"像素没变"
- 这两个都无法发现"交互方式从 tab 变成了 accordion"这种语义差异

**测试覆盖了形式，没覆盖意图。** accordion vs tab 是用户意图层面的差异，视觉像素无法区分。

#### Pattern 3：Session 生命周期的脆弱性

**发生了什么：**
- 3 个 Codex spawn 全部在 44-165ms 内失败（没有输出任何内容）
- 原因是 Codex ACP 会话创建机制在某种条件下直接返回空 session
- 我无法区分"任务太复杂所以失败"vs"机制性问题所以失败"

**后果：** 任务无法并行推进，退化成串行。

#### Pattern 4：分布式 agents 的单点故障

**所有 spawn 全部失败**时，没有降级策略。整个系统依赖 Codex ACP，而它在该场景里完全失效。

#### Pattern 5：记忆层的不完整性

**发生了什么：**
- memory_search 召回的摘要里没有具体内容（skill 名称、决策结论）
- sessions_history 查不到历史 session
- 正确流程应该是"session 文件 → memory_store → memory_search"，但第三步我常常跳过

---

## 第二部分：Autoresearch 框架研究

### 2.1 Karpathy auto-agents

**核心概念：**

```
DAG of subtasks — 不是扁平的任务列表，是有向无环图
```

每个子任务有前置依赖，形成有向无环图。这对复杂项目至关重要：T37（Inspector drawer）依赖 T11（Inspector 基础结构），而 T11 依赖对交互原则的澄清。

**第二个概念：agentic-few-shot**
每个 agent 从 memory 中自主选择 few-shot 示例，而不是每次从零开始。这解决了"Session 生命周期脆弱性"——即使 session 断了，few-shot memory 还在。

### 2.2 itsolelehmann autoresearch

**核心贡献：把实验当作第一公民**

```python
@dataclass
class Experiment:
    id: str
    task: str                    # 任务描述
    hypothesis: str               # 假设（为什么这样做）
    experiment: str               # 实验设计（怎么验证）
    result: Any                  # 执行结果
    reflection: str               # 反思（从结果中学到什么）
    status: Literal["pending", "running", "done", "failed"]
```

**三个专业化范式：**

1. `autonomous_researcher()` — 通用研究循环
2. `autonomous_debugger()` — 专门调试：假设根因 → 设计测试 → 验证 → 迭代
3. `autonomous_builder()` — 专门构建：实现功能 → 运行测试 → 迭代

**关键模式：Reflection Checkpoint**

```python
def reflect(experiment):
    if experiment.result meets acceptance:
        return "done"      # 接受这个解
    elif experiment.result is improvement:
        return "iterate"   # 继续改进
    else:
        return "pivot"     # 放弃假设，换方向
```

### 2.3 SWE-bench 的教训

SWE-bench 的核心发现：**自动验证比自动生成难 10 倍。**

Rilo Analysis 的教训与此一致：
- 生成一个 Inspector 组件（代码）很容易
- 验证它是否"符合用户意图"极难

**可执行验收标准（Executable Acceptance Criteria）** 是解法：
- 不是"术语hover正常"（自然语言，可多种理解）
- 是"hover 后 500ms 内 popover 可见，且 popover 包含该术语的定义文本"（可自动验证）

---

## 第三部分：三叉戟自动化开发工作流设计

### A. 信息收集与需求验证（第一天）

#### A1. 强制对齐会议（Kickoff 对齐）

在开始任何开发前，必须完成：

**文档一致性检查：**
```
对于 acceptance.md 里每一个 "✅" 的条目：
1. 用自然语言写出"我理解这个条目是什么意思"
2. 对照 interaction-principles.md 和 ui-guidelines.md
3. 如果有不一致 → 在对齐会议里明确澄清
4. 澄清结果写入项目的 CONFUSED_ITEMS.md
```

**Rilo Analysis 的教训：** 很多"bug"其实是"对齐失败"。

#### A2. 信息来源分级

```
L1 — 权威文档（interaction-principles.md, ui-guidelines.md, Figma）
L2 — 用户对话记录（私信摘要）
L3 — 记忆文件（MEMORY.md, memory/*.md）
L4 — 实现代码（当前代码库）
L5 — AI 推测（我的理解）

处理优先级：L1 > L2 > L3 > L4 > L5
冲突时：低优先级必须向高优先级对齐
```

#### A3. 早期可执行标准

在设计阶段就开始写可执行测试，不是等代码写完再测：

```javascript
// examples/acceptance-example.js
// 每个功能在写代码之前，先写这个
test('Inspector accordion: 过程和术语都是独立可展开的 section', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="open-inspector"]');
  
  // 验证默认状态
  const processSection = page.locator('[data-section="process"]');
  const glossarySection = page.locator('[data-section="glossary"]');
  
  await expect(processSection).toBeVisible();  // 默认展开
  await expect(glossarySection).toBeHidden();  // 默认收起
  
  // 验证 accordion 行为
  await page.click('[data-testid="glossary-header"]');
  await expect(glossarySection).toBeVisible();
  
  // 验证两个 section 可以同时展开
  await expect(processSection).toBeVisible();
});
```

**这不是 TDD，这是"对齐验证"**。在写代码前就写出这个测试 = 确认双方对"accordion"的理解一致。

---

### B. 任务系统架构

#### B1. 为什么 bitable 在 Rilo 里遇到 OAuth 问题

飞书 Bitable 的写入需要 **User Access Token**，有效期 2 小时，且 refresh_token 在 7 天后失效。这意味着一旦用户超过 7 天不点授权，bitable 写入就彻底失败。

#### B2. 三叉戟任务系统设计

```
┌─────────────────────────────────────────────────────┐
│  Shared State（Notion/本地 JSONL/Git）              │
│  - 任务 ID                                          │
│  - 状态：pending/running/done/blocked                │
│  - commit hash（可验证代码变更）                     │
│  - 可执行测试结果（pass/fail/pending）              │
│  - blocker 描述                                      │
│  - last_updated timestamp                           │
└─────────────────────────────────────────────────────┘
        ↑ 写入                    ↑ 读取
┌─────────────────────────────────────────────────────┐
│  Agent Team（多个并行的 agents）                     │
│  - Planner: 分解任务、优先级排序                      │
│  - Builder: 执行代码变更                             │
│  - Reviewer: 检查代码质量                            │
│  - Auditor: 运行测试并记录结果                        │
│  - Communicator: 通知人类关键决策点                  │
└─────────────────────────────────────────────────────┘
```

**为什么不用飞书 bitable 作为唯一真相源：**
- OAuth 依赖人，不适合 12 小时 autonomous 运行
- 推荐：Git-based JSONL 文件作为任务真相源，辅以可选的飞书 bitable（当 token 有效时同步）

#### B3. 任务生命周期

```
pending → running → done
              └→ blocked（等待人类决策）→ running
              └→ failed（测试失败）→ pending（重新分析）
```

每个任务记录：
```json
{
  "id": "T001",
  "description": "Inspector 改为 accordion 交互",
  "hypothesis": "accordion 更符合 V5 原型设计意图（用户可同时查看过程和术语）",
  "experiments": ["浏览器实测 accordion 行为", "可执行测试覆盖 accordion 展开/折叠"],
  "test_result": "pass",
  "commit": "7ebd8a1",
  "status": "done",
  "blocker": null,
  "last_updated": "2026-03-28T02:30:00Z"
}
```

---

### C. Agent Team 架构

#### C1. 角色定义

**Planner（我/Cody）**
- 职责：任务分解、优先级排序、决定下一步
- 工具：memory_search、sessions_spawn、bitable/JSONL
- 不做什么：不做具体代码实现（避免 context 过长）

**Builder（Codex/Claude）**
- 职责：接收窄任务，执行代码变更，commit + push
- 触发方式：sessions_spawn with 明确的任务描述 + 验收条件
- 降级：Codex 失败 → 尝试 Claude Code CLI → 人工

**Reviewer（Codex 独立 session）**
- 职责：检查 builder 的代码变更
- 运行方式：每次 builder push 后自动触发
- 输出：VERDICT + 发现的 issue 列表

**Auditor（独立测试 agent）**
- 职责：运行自动化测试套件（smoke + unit + dynamic + visual）
- 阈值：P0/P1 issues → 必须修复才可继续

**Communicator（我/Cody）**
- 职责：当 P0/P1 出现、或任务完成时通知人类
- 不打扰：低优先级事项不通知人类

#### C2. 通信协议

```
Planner ←→ Builder: sessions_spawn（窄任务）
Builder ←→ Reviewer: git diff + PR comment
Reviewer → Auditor: test trigger
Auditor → Planner: test results + blocked list
Planner → Human: [P0 blocker notification]
Human → Planner: [decision if blocked]
```

#### C3. 避免 Codex 全军覆没

**方案：不把所有鸡蛋放一个篮子**

```
Builder: Codex（80% 任务） + Claude Code CLI（降级，20%）
Reviewer: 独立 Codex session（不依赖 Builder 的 session）
Auditor: Playwright 脚本（不依赖 LLM）
```

每次 spawn 多个 builder 时：
- 主任务给 Codex
- 备份任务给 Claude Code CLI
- 如果 Codex 失败但 Claude 成功 → 用 Claude 的结果，继续

---

### D. 自动化测试策略（关键创新）

#### D1. 五层测试金字塔

```
              ▲
             /E\          E: Edge Cases（边界值、超大输入、负数）
            /E E\
           /D D D\        D: Dynamic（数据响应、交互链路）
          /D D D D\
         /C C C C C\      C: Component（组件功能、计算逻辑）
        /B B B B B B\      B: Visual（截图回归、像素对比）
       /A A A A A A A\    A: Smoke（页面加载、无崩溃）
      /_________________\
```

**Rilo Analysis 的教训：**
- 之前的测试只做了 A + B（smoke + screenshot）
- 漏掉了 C（组件逻辑：grossMargin 字段路径）
- 漏掉了 D（交互：accordion vs tab 的差异）
- 漏掉了 E（边界：OCC > 100 的 clamp）

#### D2. 可执行验收标准的结构

每个验收条目必须包含：

```
条目：[C1] Inspector 为 accordion 展开/折叠

可执行测试（必须存在）：
- test_accordion_default_closed(): Inspector 默认收起
- test_accordion_process_expanded(): 过程 section 默认展开
- test_accordion_toggle(): 点击 header 切换展开/收起
- test_accordion_both_open(): 两个 section 可同时展开
- test_term_click_expands_glossary(): 点击术语自动展开术语 section

验证方法：Playwright + data-testid（不是 className）
```

#### D3. 数据驱动测试

针对三叉戟的核心功能（数据计算），设计动态测试：

```javascript
test('OCC 边界 clamp', async ({ page }) => {
  const testCases = [
    { input: { occ: -5 }, expected: { occ: 0, clamped: true } },
    { input: { occ: 150 }, expected: { occ: 100, clamped: true } },
    { input: { occ: 75 }, expected: { occ: 75, clamped: false } },
  ];
  
  for (const tc of testCases) {
    await page.fill('[data-testid="occ-input"]', String(tc.input.occ));
    await page.waitForTimeout(500);
    const actual = await page.locator('[data-testid="occ-display"]').textContent();
    expect(parseFloat(actual)).toBeCloseTo(tc.expected.occ, 1);
  }
});
```

---

### E. Autoresearch 集成

#### E1. Experiment dataclass 在开发任务中的应用

```python
@dataclass
class DevelopmentExperiment:
    id: str                      # e.g. "exp-001"
    task_id: str                  # 对应的任务 ID
    hypothesis: str               # "Inspector 应该是 accordion 而不是 tab"
    change: str                   # 具体的代码变更
    test: str                     # 验证这个假设的测试名称
    result: Literal["pass", "fail", "inconclusive"]
    evidence: str                 # 截图/log/测试输出
    reflection: str               # 从结果中学到了什么
    status: Literal["pending", "running", "done"]
```

#### E2. Autonomous Builder 循环

```
while tasks_pending:
    task = planner.choose_next()
    
    experiment = DevelopmentExperiment(
        task_id = task.id,
        hypothesis = task.hypothesis,  # "我认为这样做能满足用户意图"
        change = None,
        test = task.acceptance_test
    )
    
    experiment.change = builder.implement(task)
    experiment.result = auditor.run(task.acceptance_test)
    
    if experiment.result == "pass":
        builder.commit_and_push()
        planner.mark_done(task)
    elif experiment.result == "fail":
        if builder.can_fix():
            builder.revise()  # 自主修复
        else:
            planner.mark_blocked(task, reason="需要人类决策")
            human.notify(task)
    else:
        experiment.reflection = "测试 inconclusive，需要重新设计假设"
        planner.revisit(task.hypothesis)
    
    sleep(delay=5min)  # 避免无脑循环
```

#### E3. Autonomous Debugger（当测试失败时）

```python
def autonomous_debugger(failed_test):
    hypotheses = [
        "代码实现逻辑错误",
        "测试本身的假设错误（测试写错了）",
        "环境/数据问题",
        "依赖的外部 API 行为变更"
    ]
    
    for hypothesis in hypotheses:
        experiment = DesignDiagnosticTest(hypothesis=hypothesis)
        experiment.result = Run(experiment.test)
        
        if experiment.result.confirms(hypothesis):
            if hypothesis == "代码实现逻辑错误":
                return autonomous_builder.Fix(failed_test, hypothesis)
            elif hypothesis == "测试假设错误":
                return RewriteTest(failed_test, hypothesis)
```

---

### F. 12 小时 Autonomous 运行设计

#### F1. 启动序列（Hour 0）

```
[Human] → 启动命令
  ↓
[Planner] → 读取 project brief + acceptance criteria
  ↓
[Planner] → 运行 acceptance 一致性检查（对齐验证）
  ↓
[Planner] → 生成 CONFUSED_ITEMS.md（如有冲突）
  ↓
[Human] → 确认/解决 CONFUSED_ITEMS（如有）
  ↓
[Planner] → 生成 DAG of tasks
  ↓
[Task System] → 写入 JSONL 任务队列
  ↓
[Autonomous Loop Starts]
```

#### F2. Autonomous Loop（Hour 1-11）

```
[Hourly Cycle]
1. Planner: 读取任务队列
2. Builder (并行 × 2): 执行 top-priority 任务
3. Reviewer: 检查 builder 的变更
4. Auditor: 运行验收测试
5. Planner: 更新任务状态
6. If blocked_count > 3: notify human (hour 3+ 后降级为 "daily summary")

[Night Mode（Hour 11-12）]
- 只运行快速测试（smoke + unit）
- 不运行需要人类的测试（visual diff）
- 生成 daily report
```

#### F3. 人类干预的触发条件（最小化打扰）

**触发通知，不阻断运行：**
- P0 bug 发现
- 3 个连续任务 blocked
- 所有 builder agents 同时失败
- 12 小时窗口结束

**不触发通知（自主决策）：**
- P1/P2 问题（auditor 标记，planner 决定是否修复）
- 测试超时（降级到 smoke only）
- 单个 builder 失败（切换到备用 builder）

---

### G. 关键基础设施决策

**最优先需要解决的一个问题：**

> **可执行验收标准必须在第一天就存在。**

这不是工具问题，不是架构问题，是流程起点问题。

---

## 附录：Rilo Analysis Autonomous Test Loop 实测结果（2026-03-28）

**实验框架**：`scripts/autonomous_test_loop.py`
**运行方式**：7 个 hypotheses → 自动执行 → scoring → reflection → iterate

| ID | Hypothesis | Type | Score | Status |
|----|-----------|------|-------|--------|
| E1 | OCC clamp [0,100] | edge | 1.0 | ✅ PASS |
| E2 | ADR=0 safe | edge | 1.0 | ✅ PASS |
| E3 | Inspector toggle | interaction | 0.0 | ❌ FAIL（测试本身时序问题）|
| E4 | Settings Rooms hover | interaction | 0.0 | ❌ FAIL（Playwright `.filter()` 不存在）|
| E5 | Overview charts | interaction | 1.0 | ✅ PASS |
| E6 | Scenario table ≥3 rows | interaction | 0.0 | ❌ FAIL（selector 错误，tr 不适用于 div-based table）|
| E7 | No NaN regression | interaction | 1.0 | ✅ PASS |

**核心发现：5/7 通过。2 个失败全是"测试脚本写错了"而非"功能坏了"。**

**Reflection Loop 示例（E6）：**
- 初始 hypothesis："Analysis 情景对比表应该有 ≥3 行"
- 第一次运行：score=0（`tr` selector 找到 0 行）
- Reflection：检查 DOM 发现表格使用 div-based rows，不是 `<tr>`
- 更深调查：场景表在"仪表盘" tab 里，需要先点击 tab
- 下一步：修复 selector 后重新运行

这正是 autoresearch 框架的核心：**测试失败 → 诊断是假设错了还是测试写错了 → 对应修复 → 迭代**

Rilo Analysis 的几乎所有"反复"都源于此：
- Inspector tab vs accordion → 因为没有提前写可执行测试
- Settings 无下划线 → 因为没有提前写可执行测试
- grossMargin 0.0% → 因为没有提前写计算逻辑测试

**具体的第一步（Day 0）：**

对于每个功能需求 X：
1. 写 `tests/acceptance/x.accordion.test.js`（或对应格式）
2. 运行它，验证它**当前失败**（这证明测试有效）
3. 告诉 builder："这个测试必须 pass 才能认为功能完成"
4. builder 实现功能
5. 测试 pass → 功能验收通过

---

## 附录：核心决策树

### 当发现测试失败时
```
测试失败
  ├→ 是验收测试失败？
  │     ├→ YES: 运行 autonomous_debugger
  │     └→ NO:  修复测试或跳过（取决于是否是验收必要条件）
  └→ 是谁的责任？
          ├→ Builder: → autonomous_builder.revise()
          ├→ 假设错误: → RewriteTest()
          └→ 环境问题: → EnvFix()
```

### 当 spawn 失败时
```
Builder spawn 失败
  ├→ 次数 < 3: → 等待 30s 重试
  ├→ 次数 3-5: → 切换到备用 builder（Claude Code CLI）
  └→ 次数 > 5: → notify human, 暂停该任务
```

### 当发现文档不一致时
```
acceptance.md vs interaction-principles.md 冲突
  └→ 写入 CONFUSED_ITEMS.md
        ├→ 优先级 P0: → 立即通知 human
        └→ 优先级 P1: → 在 daily report 中记录，等 human 决策
```

---

*文档版本：1.0 | 基于 Rilo Analysis 三天复盘 + Karpathy auto-agents + itsolelehmann autoresearch + SWE-bench 研究 | 2026-03-28*
