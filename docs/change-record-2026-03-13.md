# Change Record — 2026-03-13 Sprint

> 范围：记录本次 Hopeful Finance / Rilo Analysis 重构冲刺中，实际已落到仓库的改动、产物与验证结论。
>
> 主要代码交付 commit：`a0144a0` (`feat: sprint landing for settings overview and analysis`)
> 基线 checkpoint：`93a3d36` (`chore: checkpoint swarm baseline`)

## 1. 核心代码改动

### 1.1 `js/core/calculators/cost-calculator.js`
目标：统一 HQ 费用口径展示，避免“按医疗收入计提”的误导。

已改：
- 将固定成本计算注释明确为：**HQ 费用按总收入计提**。
- 将内部变量/参数命名改为更明确的 total revenue 语义。
- 将 HQ 费用公式显示文案明确为：
  - `按总收入计提：总收入 × 管理费率%`

影响：
- 口径表达与用户拍板一致。
- 减少后续开发者误解为“按医疗收入计提”的风险。

---

### 1.2 `js/pages/settings-page-v2.js`
目标：让参数配置页不只是输入区，而是成为“边调边看”的测算工作台。

已改：
- 在页面中新增 **基础结果** 区域。
- 当前基础结果区至少包含：
  - 年总营收
  - 年总成本
  - 年净利润
  - 净利润率
  - 回本周期
- 保持当前可调参数显式可见，不以“聚焦主线”为由默认折叠。
- 新增一个入住率交互规则 TODO：
  - 0–100
  - 保留 1 位小数
  - 越界自动夹到 `[0,100]`
- 新增轻量术语提示锚点，覆盖：
  - 净利润率
  - 回本周期
- 优化基础结果区颜色逻辑：
  - 净利润率为负时显示风险色
  - 无法回本时回本周期显示风险色

影响：
- 参数配置页现在有明显更强的“测算反馈感”。
- 结果反馈不再只能依赖跳转到其他页面。

---

### 1.3 `js/pages/overview-page.js`
目标：让概览页更像经营测算工作台，而不是只看利润的 summary。

已改：
- 调整 KPI 层级：
  - **年总成本** 前置到主结果层
  - **业务成本** 下沉到次级层
- 明确弱化 ROI，不再把 ROI 作为主结果强调对象。
- 将 **每间可售房晚收入**（RevPAR 等价表达）真正落地为次级结果位，而非仅停留在 TODO：
  - 计算方式：`平均房价 × 入住率`
  - 单位：`元/间夜`
- 保留并增强测算语言链：
  - 总收入
  - 总成本
  - 毛利润 / 毛利率
  - 净利润 / 净利润率
  - 每间可售房晚收入

影响：
- 概览页的经营结构更清楚。
- 成本被更明确地纳入第一层决策视图。

---

### 1.4 `js/pages/analysis-page.js`
目标：保证敏感度分析页继续扮演“全局敏感度分析”角色，并修 correctness 问题。

已改：
- 修复 **综合毛利率** 读取路径：
  - 从错误/不稳定的顶层路径，改为读取 `profitability.metrics.grossMargin`
- 调整页面副标题，使其明确表达：
  - 这是全局口径下观察单参数变化对回本、利润率、毛利率的影响
- 增加 TODO：
  - 默认指标保持回本周期
  - 百分比指标展示为一位小数
- 增加轻微文案 polish：
  - 将“影响”表述为“全局影响”，避免页面被误读成局部利润分析页

影响：
- 切换到“综合毛利率”时，结果不再容易异常为 0 或失真。
- 页面角色回到“全局敏感度分析”。

---

### 1.5 `CLAUDE.md`
目标：把用户拍板的设计偏好固化为项目级持续上下文。

已改：
- 新增 `## Design Context`，包含：
  - 用户群体与使用情境
  - 品牌气质
  - 美学方向
  - 动效策略
  - 设计原则

固化内容包括：
- 有质感、文艺、冷静、专业
- 温暖、专业、理性与感性平衡
- 深色优先
- 弱动效
- 中文优先
- 信息层级第一

影响：
- 后续 Codex / 子线 / 人工重构都可共享同一设计基线。

---

## 2. 新增文档与流程产物

### 2.1 决策与执行文档
本次 sprint 新增下列文档，作为重构过程中的“单一事实源”与项目状态记录：

- `docs/decision-log.md`
  - 记录用户明确拍板的产品、交互、IA、视觉、财务口径决策
- `docs/execution-plan.md`
  - 记录分 workstream 的执行计划
- `docs/implementation-map.md`
  - 记录当前实际仓库中文件与页面/模块/脚本的映射关系
- `docs/refactor-task-breakdown.md`
  - 将本次重构拆成更细粒度任务，按页面和主题组织
- `docs/worklog.md`
  - 记录冲刺过程中的阶段状态、五分钟节拍、风险、下一步
- `docs/impeccable-visual-plan.md`
  - 记录视觉规划：深色优先、弱动效、温暖专业、宝石感点缀、高信息层级
- `docs/continuity-mechanism.md`
  - 记录如何避免 API / Gateway 中断导致任务掉线
- `docs/round-baton.md`
  - 用作轮次接力文件，承接中断恢复

### 2.2 引入并保留的 docs
以下 docs 文件在本次仓库中进入可追踪状态，并作为后续规范/验收参考：
- `docs/acceptance.md`
- `docs/agent.md`
- `docs/prd.md`
- `docs/review.md`
- `docs/spec.md`
- `docs/ui-guidelines.md`
- `docs/ux.md`

---

## 3. 新增脚本与流程机制

### 3.1 `scripts/codex_round.sh`
目标：把 Codex 执行切成小轮次，避免长 prompt / 长执行造成漂移或中断后难恢复。

功能：
- 启动前写入 baton
- 固化 prompt 文件
- 固化 round log
- 执行后自动回写 baton / worklog

### 3.2 `scripts/quick_snapshot.sh`
目标：在 API 慢、准备大改或执行中断前，快速保存上下文。

功能：
- 保存 `git status`
- 保存 `git diff`
- 保存 `worklog`
- 保存 `round-baton`
- 保存 `decision-log`

### 3.3 `scripts/review_codex.sh`
目标：做本地 review gate。

本次改动：
- 修复与当前 Codex CLI 不兼容的旧参数 `-a never`
- 使脚本能在当前 CLI 下正常运行

### 3.4 `scripts/smoke.sh`
目标：快速验证 `index.html` 可被本地静态服务返回 200。

本次用途：
- 作为本轮最基础的自动化可用性底线

---

## 4. 并线 / 冲刺过程中的执行策略

本次 sprint 中，实际使用了以下执行方式：
- 主线 Codex patch
- 多轮小目标 round 执行
- support subagents 并行出：
  - PM 归纳
  - UI/UX 收敛
  - 计算层审查
  - QA 收尾建议
- 最后采用 worktree swarm：
  - `settings`
  - `overview`
  - `analysis`
  - `visual`
  四条 builder 线并行推进，再合回主线

目标：
- 避免同目录多 agent 抢文件
- 缩短最后一小时的并行吞吐时间

---

## 5. 验证结果

### 5.1 已通过
- `./scripts/smoke.sh`
  - 结果：`smoke ok`
- `./scripts/review_codex.sh staged`
  - 结果：通过
  - reviewer 仅给出一个低优先级脚本建议，不阻塞交付

### 5.2 不适用
- `npm test`
  - 当前项目目录中不存在 `package.json`
  - 因此本轮无法用 npm test 作为自动化门禁

---

## 6. 本轮交付的性质

### 6.1 这轮已经形成的交付
这是一次**阶段性工程 checkpoint**，不是最终视觉成品。

可确认已形成的交付内容：
- HQ 费用口径语义统一
- 参数配置页基础结果区
- 概览页成本前置 + 每间可售房晚收入落位
- 敏感度分析页 correctness 修复
- 设计上下文固化
- 视觉计划固化
- 连续执行机制与收口脚本建立

### 6.2 这轮没有完成的部分
以下属于后续工作，不应误判为本轮已完成：
- 深色优先视觉完整落地
- 定义说明抽屉完整体系
- 系统性改名收尾（Hopeful Finance → Rilo Analysis）
- 更深层的共享组件抽离与耦合下降
- 更大幅度、肉眼一眼可见的 UI 重构成品感

---

## 7. 建议验收方式
如果要验本轮交付，建议按以下顺序：
1. 运行 `./scripts/smoke.sh`
2. 打开参数配置页，确认基础结果区存在且会随参数变化
3. 打开概览页，确认成本前置、每间可售房晚收入出现
4. 打开敏感度分析页，切到综合毛利率，确认不再异常为 0
5. 如需代码 review，优先看：
   - `js/pages/settings-page-v2.js`
   - `js/pages/overview-page.js`
   - `js/pages/analysis-page.js`
   - `js/core/calculators/cost-calculator.js`
   - `docs/impeccable-visual-plan.md`
