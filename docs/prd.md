# PRD — Rilo Analysis（产品整体重构 / Phase 1）

> 目标：**产品整体信息架构重构（不减功能）**。把现有“能算、能改、能看、能解释、能测试”的能力，整理成更直觉、更少认知负担的用户流程。

## 1. 背景与问题
当前版本功能很全，但“信息散落 + 重复展示 + 默认展开太多”导致：
- 新手不知道从哪里开始、应该先看什么
- 熟手也容易被大量公式/明细打断
- 术语解释（指标字典 Drawer）与右侧公式/数据区域存在重复，维护与认知成本都高

## 2. 目标用户
- **新手（Boss/业务侧）**：需要快速得到结论（能不能赚钱、回本多久、关键驱动是什么），不想被公式淹没。
- **熟手（分析/财务/产品）**：需要核对口径、公式、分项计算过程，能快速定位问题。

## 3. 核心任务（Jobs-to-be-done）
1) **调参数 → 看到关键结论**（盈利/亏损、净利率、回本周期）
2) **解释为什么**：能追溯到公式与分项（收入/成本/COGS/投资/回报）
3) **查术语**：遇到 ADR/Occ/RevPAR 等，不打断主流程就能查到
4) **做情景/敏感度/盈亏平衡**：用于“假设变化下的风险与弹性”
5) **导入/导出/示例参数/清除数据**：保证可复用与可迁移

## 4. 功能全盘梳理（现有能力清单，不可削弱）
### 4.1 参数配置（Settings）
- 基础信息：项目名、币种、营业天数、面积等
- 投资：装修标准、医疗设备、其他投资、（自定义投资模块）
- 成本：固定成本、变动成本、各业务毛利率、（自定义成本模块）
- 收入：会员、寄养（Rooms/ADR/Occ）、医疗、零售、餐饮、（自定义收入模块）
- 公式帮助面板（FormulaHelpPanel）

### 4.2 财务分析（Overview）
- KPI：营收、COGS、毛利润、毛利率、总成本、净利润、净利率、投资、回本、月现金流
- 图表：收入结构、成本结构
- **盈亏平衡**：BreakevenChart（收入 vs 成本）
- **综合建议/决策提示**：使用 `calculator.calculate()` 的 `comprehensive`（健康度、风险指标、投资建议、改进建议）
- 情景预览：ScenarioComparisonChart
- 系统提醒与洞察（Alerts/Insights）
- （目前有“详细计算过程”块，展示分项计算）

### 4.3 敏感度分析（Analysis）
- 参数选择、范围滑杆、影响指标选择
- 图表：不同变化幅度下的回本/利润率/毛利率变化
- 情景对比表

### 4.4 术语解释（Metric Dictionary / Glossary）
- ADR/Occ/RevPAR/Rooms/Days 等解释与 Phase 1 口径

### 4.5 测试
- `npm test`：寄养收入公式与边界 clamp 等最小护栏
- `scripts/smoke.sh`：最小烟测（起 http server + curl 检测 index.html 返回 200）

### 4.6 Phase 1 指标补齐范围（P0：今晚必须可见）
> 原则：**不等 Phase 2**，先把关键新增指标作为「Phase 1 扩展 KPI」在 UI 展示，并写清口径/公式；计算优先用现有字段推导。

必须落地展示（Settings Summary + Overview）：
- **Rent-to-sales（租金占收比）**：Rent ÷ Total Revenue
- **Breakeven Occ（盈亏平衡入住率）**：用贡献利润法，近似：
  - 分子：Fixed + Variable + Other COGS
  - 分母：Rooms × Days × ADR × CMRate（CMRate=1-寄养COGS率）
- **Contribution margin per room-night（每间夜贡献利润）**：
  - (Boarding Revenue - Boarding COGS) ÷ Sold room-nights
- **Peak funding gap / cash low point（资金低点 / 最大资金缺口）**：
  - 简化现金流：t=0 支出初始投资；每月净现金流≈年净利润/12；在 12 个月窗口取最低点
- **CAC / LTV / LTV:CAC**：Phase 1 先做「可填假设 + 展示结果」，不强依赖真实业务数据

## 5. 信息架构（目标 IA）
### 5.1 页面级 IA
- 顶层 Tabs：
  - **参数配置（Settings）**：输入 + 右侧解释/结果
  - **财务分析（Overview）**：结论、结构、提醒、建议
  - **敏感度分析（Analysis）**：变化影响与风险弹性

### 5.2 “解释系统”三层（贯穿 Settings / Overview）
- **Summary（关键结果）**：回答「算出来多少？」（默认）
- **Details（公式与中间变量）**：回答「怎么得出来的？」（按需展开/切换）
- **Definitions（术语解释）**：回答「这个词是什么意思？」（单一权威来源）

## 6. 关键交互
### 6.1 新手最短路径（默认视图）
- 打开应用 → Settings 调 3-5 个核心参数 → 右侧 Summary 立刻看到：
  - 年总营收 / 年净利润 / 净利率 / 回本周期
- 不懂术语 → 点“术语解释”直接进入 Definitions
- 想看原因 → 切到 Details

### 6.2 熟手路径
- Settings 调参 → 直接切 Details 核对公式/明细
- 需要时用 Definitions 查词，不打断调参节奏

## 7. 非目标（本轮不做）
- 不引入后端/账号/存储升级
- 不引入复杂构建链（保持打开 index.html 即可运行）
- 不改变财务口径与计算逻辑（除非是明显 bug 修复且有测试护栏）

## 8. 验收标准（PRD 级）
- 不减任何功能：收入/成本/投资/回报/情景/盈亏平衡/综合建议/自定义模块/导入导出/示例/清除/公式帮助/术语解释均可用
- 信息架构清晰：默认只露出关键结果，细节可展开（Summary/Details/Definitions 层级明确）
- 术语解释不重复维护：Drawer/Panel 使用同一内容源
- `npm test` 通过
- docs/acceptance.md 有可执行的 UI 自测清单（关键路径覆盖）

## 9. 开发流程约束（强制）
- **PR = Pull Request**：一次把分支改动合并进 main 的变更提案。
- 最简流程：**branch → commit → PR → review → merge**。
- 本项目要求：每次合并到 main 前，必须跑一次本地 review gate：`scripts/review_codex.sh staged`（详见 `docs/review.md` / `docs/agent.md`）。
