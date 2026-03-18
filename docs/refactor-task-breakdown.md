# 重构任务拆解 — Rilo Analysis（细粒度）

> 目标：在不破坏现有测算能力的前提下，落实视觉/交互/信息架构重构，并降低耦合度。遵循 docs/decision-log.md 已拍板决策。

## 全局前置（依赖与约束）
- 不移除任何现有计算能力；仅做视觉与结构层重构。
- UI 文案统一中文；缩写仅在公式/代码层使用。
- 定义说明采用右侧抽屉（轻量按钮触发），不常驻。
- HQ 费用口径按“总收入”计提，吻合决策日志。
- 三页面统一骨架，但保留各自侧重：参数配置/概览/敏感度。

## 当前优先级（按必要性）
- **P0**：入住率双通道输入（Slider + 数字输入）、0–100 clamp、保留 1 位小数、粘贴清洗（Settings）。
- **P0**：术语入口一致性与 hover 链路回归（Settings/Overview/Analysis）。
- **P0**：review/smoke gate 可用且 tmp 不污染 diff。
- **P1**：术语内容收敛到单一事实源（term-registry 为主）。
- **P1**：深色主题残留 class 清理（bg-white/text-gray 等）。
- **P2**：系统性改名（Hopeful Finance → Rilo Analysis）与文档收尾。
- **Prototype 使用原则**：`prototypes/rilo-upgrade-v2-cn.html` 作为结构/交互参考；`rilo-editorial-premium-prototype.html` 仅做视觉灵感，不作为验收标准。

---

## 参数配置页（js/pages/settings-page-v2.js）
- 布局
  - 保持 TwoPaneLayout 兼容：`window.RiloUI?.TwoPaneLayout ?: left` 回退逻辑保留。
  - 左列按分组堆叠：BasicSettings → InvestmentSettings → CostSettings → RevenueSettings。
  - 右侧 Inspector：使用 conclusion（引导/建议）+ process（公式/中间值）+ glossaryTerms（术语）。
- 控件规范（交互规则落地）
  - 入住率输入：同时支持滑杆+数字输入；范围 0–100，保留 1 位小数；越界自动夹到 [0,100]。
  - 数字输入统一千分位展示、粘贴清洗（去空格/非数字）。
  - 预设参数按钮保留项目名：见现有 `applyPreset()` 后 projectName 覆写逻辑。
- 即时结果展示（最小可行）
  - 在页面左列底部新增“基础结果”区域（不做卡片爆炸）：显示 年总营收/年总成本/年净利润/净利润率/回本周期。
  - paybackYears ≤ 0 或不可计算时展示“无法回本”。
- 公式/过程展示
  - 右侧 process 中使用 `FormulaDisplay`，默认折叠细节，仅在核对时展开。
- 数据与状态
  - 严格只通过 `updateData` 改写；避免在子组件内部副作用写 storage。
  - 容错：空数据/NaN/Infinity 均有兜底展示。
- 待办点（当前未收口）
  - 入住率双通道输入（Slider + 数字输入）、0–100 clamp、保留 1 位小数、粘贴清洗。
- 验证
  - 手动：边界值 0、100、101、-1、33.3、33.34；粘贴“ 45 % ”清洗；预设切换后 projectName 保留。

---

## 概览页（js/pages/overview-page.js）
- 信息架构
  - 左列：KeyMetrics → BusinessOverview（收入/成本结构图）→ ScenarioQuickView（轻量情景预览）→ AlertsAndInsights。
  - 右侧 Inspector：conclusion（盈利状态/关键结论）+ process（DetailedCalculationDisplay）。
- 指标与文案
  - 成本必须可见：KeyMetrics 中保留 cost.total；不做极简只剩少量 KPI。
  - 弱化投资回报率：ROI 仅在 process 区出现，不进入主 KPI。
  - 新增“每间可售房晚收入（RevPAR 等价）”为次级结果位：`RevPAR = ADR × 入住率`（使用 `revenue.boarding.adr` 与 `revenue.boarding.occ`）。
- 视觉与一致性
  - 统一 KPI 组件色阶：正向（teal/green/blue），负向（red）；单位统一（万元/%/年）。
  - 货币选择器与导入/导出按钮放入 DataActions（右上或工具区）。
- 术语
  - 为 cogs/grossMargin/netMargin/payback 等提供 `glossaryTerms`，并可选通过 `RiloUI.Term` 包装。
- 已落地
  - RevPAR（每间可售房晚收入，ADR×入住率）已在 KeyMetrics 附近呈现。
- 验证
  - 边界：profit ≤0 提醒、margin <5% 告警、member 配比 >100% 报错路径已存在，复测。

---

## 敏感度分析页（js/pages/analysis-page.js）
- 信息架构
  - 左列：PageHeader → ControlPanel（参数/范围/指标）→ SensitivityChart → ScenarioTable。
  - 右侧 Inspector：结论卡片（你在看什么/洞察）+ KeyMetrics（与所选参数关联）。
- 参数映射与生成逻辑
  - 校准 `getParamValue` 与 `createModifiedData` 的路径映射，确保每个参数单点变更能触发 calculator 重算。
  - 默认 Impact 指标：paybackYears；可切到 profitMargin/grossMargin。
- 图表刻度与可读性
  - paybackYears 采用更敏感的缩放（现已 5 年基准）；百分比指标以绝对变化映射条宽；中心基准对齐。
- 术语
  - glossary 中加入 sensitivity/payback/margin 简释；统一中文。
- 待办点（最小补丁）
  - 在 `MetricSelect` 上方加入 TODO 注释“默认指标保持回本周期；百分比指标展示为一位小数”。
- 验证
  - 参数：±10/±50/±100% 三档；负向/正向变化均有颜色语义；回本=∞ 时的条形图与标签兜底。

---

## 定义说明抽屉（Definitions Drawer）
- 触发与容器
  - 统一一个轻量按钮触发右侧抽屉；抽屉承载 conclusion/process/glossary 三区。
  - 采用 `RiloUI.TwoPaneLayout` inspector 区；无该组件时页面退化为单栏。
- 术语与数据源
  - 统一术语注册（Term Registry）：`key → title/body/alias/tags`，页面通过 `RiloUI.Term` 渲染。
  - 公式显示统一走 `FormulaDisplay`，避免各页重复实现。
- 文案与口径
  - 中文术语为主；缩写（如 COGS）仅在公式/代码说明中出现。
- 已落地
  - 术语注册表在 `js/shared/term-registry.js`；后续需收敛各页 glossaryTerms 到该源。
- 验证
  - 术语 hover/点击可见；抽屉初始收起；不抢主视觉空间。

---

## 共享视觉/壳层（Shell & Tokens）
- 组件骨架
  - TwoPaneLayout：左主内容 + 右侧 Inspector（可滚动/粘滞头部）；兼容移动端折叠。
  - 公共卡片/区块：Card、KPI、ChartCard、Toolbar 的最小统一样式。
- 设计 Token
  - 使用 index.html 中的 CSS 变量（--rilo-bg-deep / surface / text / accent / brand 等）；必要时新增 spacing/radius/shadow token。
  - 颜色语义：success/warning/error/info 的统一 class 映射。
- 行为一致性
  - 过渡/阴影/圆角半径统一；打印样式保留（去阴影）。
- 待办点（最小补丁）
  - 若无 `RiloUI.TwoPaneLayout`：添加极简实现文件（后续 PR），不影响现有回退逻辑。
- 验证
  - 三页在存在/不存在 TwoPaneLayout 时均可用；主题色一致；无布局抖动。

---

## 交付与验收（DoD）
- 三页面统一骨架成立；参数页出现即时基础结果；概览页展示成本并弱化 ROI；敏感度页保持“全局分析”。
- 定义说明右侧抽屉可用，默认不干扰主视图。
- HQ 费用按总收入计提，口径在展示与计算保持一致。
- 关键边界值均有兜底（0、∞、NaN）。

