# Implementation Map — Rilo Analysis

- 参数配置页
  - `app.jsx`：单文件参数配置与结果演示（现用 Demo）。
  - `initial.jsx`：更早的单文件版本（保留作对照）。
  - 依赖：`js/core/calculators/main-calculator.js`（聚合调用子计算器）。

- 概览页
  - 结果数据源：`js/core/calculators/main-calculator.js` 产出的 `revenue/cost/investment/profitability` 聚合结果。
  - 现阶段在 `app.jsx` 的结果区呈现（独立视图后可抽离）。

- 敏感度分析页
  - 计算内核：`ScenarioCalculator`（由 `js/core/calculators/main-calculator.js` 进行 orchestrate 调用）。
  - 输出：场景/敏感度对比所需的指标集。

- 定义说明
  - 口径/决策：`docs/decision-log.md`（财务口径、交互与信息架构）。
  - 补充说明位：右侧抽屉（UI 层实现，调用核心指标释义）。

- 共享壳层/样式
  - 容器：`index.html`（挂载点与基础样式入口）。
  - 公共计算内核：`js/core/calculators/*`（Revenue/Cost/Investment/Profitability/Scenario 等）。

- 测试与脚本
  - 脚本：`scripts/` 下的工具与任务脚本。
  - 试验页：`test-member.html`、`test-modules.html`（本地验证用）。
