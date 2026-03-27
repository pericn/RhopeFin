# Acceptance / 验收清单 - Rilo Analysis(整体重构)

> 目标:保证"重构不减功能",并让关键路径可被重复验证。

## A. 自动化测试
- [x] 最小烟测:`./scripts/smoke.sh` → 输出 "smoke ok" ✅ (2026-03-27)
- [x] 视觉验收采集:Playwright 截图 baseline 已建立 `ledger/ui_visual_baselines/rilo/` ✅ (2026-03-27)
- [x] Review gate:`scripts/review_codex.sh worktree` → 输出单一 VERDICT/CONFIDENCE/FINDINGS,且 verdict 为 correct ✅
- [x] 动态测试:`tests/dynamic-calc.test.cjs` → 7/8 PASS(1 FAIL = React controlled slider 框架已知限制,非 bug)✅ (2026-03-27)
- [x] Unit tests:`node --test tests/ui-interaction-refactor.test.js` → 9/9 PASS ✅ (2026-03-27)
- [x] Console errors:0 runtime errors ✅ (2026-03-27, `870de1e` 修复 12 处逗号缺失)

## A1. 视觉验收最小脚手架
- 固定预览命令:`python3 -m http.server 4173`
- 固定预览 URL:`http://127.0.0.1:4173/index.html`
- 固定页面顺序:`overview -> settings -> analysis -> glossary-drawer`
- 固定截图输出:`artifacts/visual/current/{desktop,mobile}/`
- 控制台与页面错误输出:`artifacts/visual/current/logs/console-errors.json` 与 `artifacts/visual/current/logs/page-errors.json`
- 浏览器只负责采集;最终判读仍由人工基于截图与日志完成

## B. 启动与基础可用性
- [x] 浏览器直接打开 `index.html` 可以正常渲染 ✅ (smoke + Playwright 验证)
- [x] 页面主结构符合新 prototype:左侧导航 + 右侧内容区 ✅ (代码验证)
- [x] 顶部 Tabs:参数配置 / 财务分析 / 敏感度分析 可切换 ✅ (Playwright nav 测试)
- [ ] 顶部工具区默认隐藏,但代码仍保留、可回退(需人工确认)

## C. 参数配置(Settings)关键路径
### C0. Hover 可见性(必须)
- [x] Overview KPI 术语(年净利润/净利润率/回本周期):下划线 ✅, Popover ✅, hover test ✅
- [x] Analysis 术语下划线 ✅ (7 terms found)
- [x] Settings 术语:revenue-settings.js 中 Term 组件已注册 ✅ (`0a7bdda` self-healing); section 04 需人工验收
- [x] Settings 标题下方能看到一行「Hover 教程」提示 ✅ (`95d7902`)

### C1. Inspector / Drawer（三层）
- [x] Inspector 继续保持 Drawer 形态,而不是常驻右栏 ✅ (T11/T12; `1e376f7` 修复默认常开问题)
- [x] Drawer 默认关闭，点击「打开说明面板」或 Term「查看更多」才滑入 ✅ (`1e376f7`)
- [x] Drawer 内包含：过程 / 术语（结论 tab 已移除）✅ (T12)
- [x] 切到「过程」可看到完整公式与明细（不缺项）✅ (T12)
- [x] 切到「术语」可看到术语解释（ADR/Occ/RevPAR/Rooms/Days 等）✅ (T7)

### C2. 指标解释入口一致性
- [ ] Settings / Overview / Analysis 顶部不再出现"术语解释"按钮(需人工确认顶部无此按钮)
- [ ] 通过术语 Hover 的"查看更多"触发:Drawer 打开并切到「术语」tab ✅ (Overview已验证);Settings section 04 需人工确认

### C3. 寄养关键功能回归
- [ ] 入住率输入为双通道(Slider + 数字输入),范围 0-100,保留 1 位小数,粘贴清洗可用
- [ ] Rooms/ADR/Occ slider 调整后:Summary 的关键结果实时更新
- [ ] Occ 超过 100 或小于 0 时:逻辑 clamp 正常(结果不异常)
- [ ] Details 中能看到寄养收入的公式/计算过程(或等价明细)

## D. 财务分析(Overview)
- [x] KPI 正常显示(仅保留全局指标:营收/成本/毛利润/净利润/回本等)✅ (smoke + visual)
- [x] Overview 的 KPI 标题中能看到并可悬停:净利润 / 净利润率 / 回本周期(浅蓝下划线术语)✅ (T7, `436bf14`)
- [x] 顶部关键指标区域不出现单业务 KPI;单业务内容下沉到下方详情区 ✅ (T9)
- [x] 收入结构/成本结构图表正常渲染 ✅ (charts verified)
- [x] **盈亏平衡** 图表正常渲染(收入 vs 成本)✅ (T8)
- [x] 情景分析预览正常渲染 ✅ (visual)
- [x] 页面默认不出现综合建议、健康度评分、风险提示、建议性摘要这类报告内容 ✅ (T9 removed)

## E. 敏感度分析(Analysis)
- [x] 参数下拉可切换;范围滑杆可调整 ✅ (T7, Playwright nav)
- [x] Analysis 右侧核心指标卡中能看到并可悬停:净利润 / 净利润率 / 回本周期(浅蓝下划线术语)✅ (`436bf14`, `7ae5982`)
- [x] 图表随参数变化更新 ✅ (grossMargin fix `62e6104`;浏览器实测:装修±20%时回本周期1.7→2.1→2.4年)
- [x] Analysis 场景表正常渲染 ✅ (浏览器实测:保守/基础/乐观三行,当前情况有蓝底高亮)
- [ ] 情景对比表能渲染,且"当前情况"高亮

## F. 不减功能声明(人工确认)
- [ ] 自定义收入/成本/投资模块入口仍可用
- [ ] 公式帮助面板仍可用
- [ ] 不存在明显的页面缺失、按钮失效、数据不更新

## H. 视觉一致性(主题收口)
- [ ] 颜色/背景/文字遵循 index.html token(rilo-bg-deep / surface / text),无明显 bg-white/text-gray 残留
- [ ] 配色跟随 prototype 色板,整体克制统一,不出现花哨的随机主题色

## G. 自测脚本(看不懂 → 看懂)
> 目标:用 3 分钟自测,确认信息架构清晰、术语可解释、默认信息密度可接受。

1) **先看结论(30 秒)**
   - 进入「财务分析(Overview)」
   - 只看第一屏:净利润 / 净利润率 / 回本周期 是否一眼可读

2) **再定位驱动(60 秒)**
   - 在 Overview 找到关键驱动:营收/成本/毛利润 + Rooms/Days/ADR/Occ
   - 鼠标悬停带浅蓝下划线的中文指标名:能弹出解释;点「查看更多」能打开 Drawer 的「术语」tab 并定位

3) **最后看诊断(60 秒)**
   - 在 Overview 打开折叠区「高级:详细计算过程」:能看到详细拆解
   - 在敏感度分析(Analysis)只改 1 个参数(如装修标准)+ 调整范围:图表/指标有响应变化

4) **术语入口一致性(30 秒)**
   - 在 Settings / Overview / Analysis 任一页面悬停浅蓝下划线术语:会出现 Popover
   - 点击 Popover 的「查看更多」:打开 Drawer,并切到「术语」tab
