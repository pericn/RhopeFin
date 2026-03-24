# Acceptance / 验收清单 — Rilo Analysis（整体重构）

> 目标：保证“重构不减功能”，并让关键路径可被重复验证。

## A. 自动化测试
- [ ] 最小烟测：`./scripts/smoke.sh` → 输出 "smoke ok"
- [ ] 视觉验收采集：`bash scripts/visual-acceptance.sh` → 输出 `artifacts/visual/current/`
- [ ] Review gate：`scripts/review_codex.sh worktree` → 输出单一 VERDICT/CONFIDENCE/FINDINGS，且 verdict 为 correct
- [ ] `npm test`：若存在 package.json / 测试脚本时执行；若不存在则标记 N/A 并记录原因

## A1. 视觉验收最小脚手架
- 固定预览命令：`python3 -m http.server 4173`
- 固定预览 URL：`http://127.0.0.1:4173/index.html`
- 固定页面顺序：`overview -> settings -> analysis -> glossary-drawer`
- 固定截图输出：`artifacts/visual/current/{desktop,mobile}/`
- 控制台与页面错误输出：`artifacts/visual/current/logs/console-errors.json` 与 `artifacts/visual/current/logs/page-errors.json`
- 浏览器只负责采集；最终判读仍由人工基于截图与日志完成

## B. 启动与基础可用性
- [ ] 浏览器直接打开 `index.html` 可以正常渲染
- [ ] 页面主结构符合新 prototype：左侧导航 + 右侧内容区
- [ ] 顶部 Tabs：参数配置 / 财务分析 / 敏感度分析 可切换
- [ ] 顶部工具区默认隐藏，但代码仍保留、可回退

## C. 参数配置（Settings）关键路径
### C0. Hover 可见性（必须）
- [ ] Settings 页面基础设置/寄养收入设置中：ADR / Occ / Rooms / Days 等术语以**浅蓝下划线**展示
- [ ] 鼠标悬停下划线术语：出现解释 Popover
- [ ] Popover 内点击“查看更多”：打开 Drawer 并切到「术语」tab，自动定位/高亮对应条目
- [ ] Settings 标题下方能看到一行「Hover 教程」提示

### C1. Inspector / Drawer（三层）
- [ ] Inspector 继续保持 Drawer 形态，而不是常驻右栏
- [ ] Drawer 内包含：结论 / 过程 / 术语
- [ ] 切到「过程」可看到完整公式与明细（不缺项）
- [ ] 切到「术语」可看到术语解释（ADR/Occ/RevPAR/Rooms/Days 等）

### C2. 指标解释入口一致性
- [ ] Settings / Overview / Analysis 顶部不再出现“术语解释”按钮
- [ ] 通过术语 Hover 的“查看更多”或脚本/API 触发：Drawer 打开并切到「术语」tab

### C3. 寄养关键功能回归
- [ ] 入住率输入为双通道（Slider + 数字输入），范围 0–100，保留 1 位小数，粘贴清洗可用
- [ ] Rooms/ADR/Occ slider 调整后：Summary 的关键结果实时更新
- [ ] Occ 超过 100 或小于 0 时：逻辑 clamp 正常（结果不异常）
- [ ] Details 中能看到寄养收入的公式/计算过程（或等价明细）

## D. 财务分析（Overview）
- [ ] KPI 正常显示（仅保留全局指标：营收/成本/毛利润/净利润/回本等）
- [ ] Overview 的 KPI 标题中能看到并可悬停：净利润 / 净利润率 / 回本周期（浅蓝下划线术语）
- [ ] 顶部关键指标区域不出现单业务 KPI；单业务内容下沉到下方详情区
- [ ] 收入结构/成本结构图表正常渲染
- [ ] **盈亏平衡** 图表正常渲染（收入 vs 成本）
- [ ] 情景分析预览正常渲染
- [ ] 页面默认不出现综合建议、健康度评分、风险提示、建议性摘要这类报告内容

## E. 敏感度分析（Analysis）
- [ ] 参数下拉可切换；范围滑杆可调整
- [ ] Analysis 右侧核心指标卡中能看到并可悬停：净利润 / 净利润率 / 回本周期（浅蓝下划线术语）
- [ ] 图表随参数变化更新
- [ ] 情景对比表能渲染，且“当前情况”高亮

## F. 不减功能声明（人工确认）
- [ ] 自定义收入/成本/投资模块入口仍可用
- [ ] 公式帮助面板仍可用
- [ ] 不存在明显的页面缺失、按钮失效、数据不更新

## H. 视觉一致性（主题收口）
- [ ] 颜色/背景/文字遵循 index.html token（rilo-bg-deep / surface / text），无明显 bg-white/text-gray 残留
- [ ] 配色跟随 prototype 色板，整体克制统一，不出现花哨的随机主题色

## G. 自测脚本（看不懂 → 看懂）
> 目标：用 3 分钟自测，确认信息架构清晰、术语可解释、默认信息密度可接受。

1) **先看结论（30 秒）**
   - 进入「财务分析（Overview）」
   - 只看第一屏：净利润 / 净利润率 / 回本周期 是否一眼可读

2) **再定位驱动（60 秒）**
   - 在 Overview 找到关键驱动：营收/成本/毛利润 + Rooms/Days/ADR/Occ
   - 鼠标悬停带浅蓝下划线的中文指标名：能弹出解释；点「查看更多」能打开 Drawer 的「术语」tab 并定位

3) **最后看诊断（60 秒）**
   - 在 Overview 打开折叠区「高级：详细计算过程」：能看到详细拆解
   - 在敏感度分析（Analysis）只改 1 个参数（如装修标准）+ 调整范围：图表/指标有响应变化

4) **术语入口一致性（30 秒）**
   - 在 Settings / Overview / Analysis 任一页面悬停浅蓝下划线术语：会出现 Popover
   - 点击 Popover 的「查看更多」：打开 Drawer，并切到「术语」tab
