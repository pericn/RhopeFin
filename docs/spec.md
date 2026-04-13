# Spec — Rilo Analysis（项目规格 / Single Source of Truth）

> 本文件用于记录**整体产品规格**与“重构计划”。
> 计算口径与关键公式仍以代码实现为准；若需对外同步，以此文档为准。

## 1. 运行方式
- 无构建：直接打开 `index.html`
- 测试：`npm test`

## 2. Phase 1 关键口径（寄养）
- **Boarding Revenue = Rooms × Days × ADR × Occ**
- Occ 输入 0–100%，系统会 clamp

## 3. 整体产品架构重构计划（不减功能）
### 3.1 为什么要重构
- 功能已经齐全，但信息架构与默认展示导致：
  - 新手第一屏信息过载
  - 术语解释与公式/数据重复，维护成本高
  - 熟手找“明细/公式/变量”缺少稳定入口

### 3.2 重构目标（Outcome）
- **三层解释系统**落地（贯穿 Settings）：
  - Summary（关键结果）
  - Details（公式与明细）
  - Definitions（术语解释）
- **默认只展示关键结果 + 核心输入**；高级信息可展开
- 术语解释：Drawer 与面板复用同一内容源

### 3.3 范围与约束
- 不删任何现有功能（含自定义模块、情景/敏感度/盈亏平衡、导入导出等）
- 不引入 bundler / 后端
- 不改变财务口径（除非明确的 bug 修复且有测试护栏）

### 3.4 里程碑（更新）
**P0（今晚必须用户可感知）**
1) 文档补齐：`docs/prd.md` / `docs/ux.md` / `docs/spec.md` / `docs/acceptance.md`
2) Hover 可见性：术语浅蓝下划线 + hover Popover + 「查看更多→Definitions」链路打通
3) Phase 1 扩展 KPI：Rent-to-sales / Breakeven Occ / CM per room-night / Peak funding gap / CAC/LTV/LTV:CAC（先假设+展示）
4) 最小验收：`npm test` + `./scripts/smoke.sh`

**P1（1-2 天）**
- 扩大 hover 点位覆盖到 Overview/Analysis 更多 KPI 标题与图表 legend
- 把“Phase 1 扩展 KPI”的口径/公式在 Details 中展示更完整（可折叠）

**Phase 2（后续）**
- 现金流口径从简化版升级为可配置的月度模型（含租金/人力节奏、增长曲线、季节性）
- CAC/LTV 从“假设输入”升级为“模型推导”（含渠道、转化率、留存/复购）
