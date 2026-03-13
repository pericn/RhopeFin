# Impeccable Visual Plan — Deep‑Mode First / Weak‑Motion / Warm‑Professional / Jewel‑Accent / High Hierarchy

目的：在不破坏现有计算能力的前提下，完成一次“稳妥落地”的视觉系统升级计划。以深色优先（deep‑mode‑first）作为默认气质，降低动效强度（weak‑motion），整体传达温暖而专业（warm‑professional），以“宝石色点睛”（jewel‑accent）建立明确的信息层级（high information hierarchy）。

本计划与以下文件一致并向前推进：
- CLAUDE.md（深色优先、信息层级优先、弱动效）
- docs/ui-guidelines.md（KPI 分层、14/10 布局、右侧 Inspector）
- docs/design-tokens.md（单一事实来源 token）
- docs/decision-log.md（不删除有价值数据、中文优先、HQ 费用口径）

—

## 1) Tokens（精确数值，先深色）
说明：先把“深色主皮肤 + 温暖中性 + 宝石强调”抽象为统一 token；AntD 通过 ConfigProvider theme.token 接入，非 AntD 区域走 CSS 变量。今晚仅“新增 + 映射”，不大面积替换旧 class，降低回归风险。

### 1.1 Core Neutrals（Deep Mode）
- --rilo-bg-deep: #11100E           // 背景（暖黑）
- --rilo-surface-1: #171513         // 一级表面（卡片/主要容器）
- --rilo-surface-2: #1E1B18         // 二级表面（次级卡片/图表底）
- --rilo-border-deep: #2A2622       // 边框（深色）
- --rilo-text-1: #ECE7E1            // 正文/标题（高对比暖白）
- --rilo-text-2: #B6B0A8            // 次要文字
- --rilo-text-3: #8A847D            // 说明/占位

保留当前浅色变量以便日后切换：
- --rilo-fog: #F8FAFC
- --rilo-ink: #0F172A

### 1.2 Jewel Accent（点睛，不铺底）
- --rilo-brand: #221C86             // 品牌主色（深群青）
- --rilo-accent: #2563EB            // 现用主强调（Sapphire Blue，沿用现值便于“今晚安全”）
- --rilo-jewel-sapphire: #2D3A8C    // 次强调（数据/链接）
- --rilo-jewel-amethyst: #6D28D9    // 强调2（标签/次级按钮）
- --rilo-jewel-emerald: #10B981     // 成功/改善
- --rilo-jewel-citrine: #F59E0B     // 提醒/注意
- --rilo-jewel-ruby: #EF4444        // 风险/恶化

语义映射（统一语义色，不再使用“随机主题色”）：
- --rilo-sem-success: var(--rilo-jewel-emerald)
- --rilo-sem-warning: var(--rilo-jewel-citrine)
- --rilo-sem-danger: var(--rilo-jewel-ruby)
- --rilo-sem-info: var(--rilo-accent)

### 1.3 Radius / Shadow / Spacing
- --rilo-radius-card: 16px
- --rilo-radius-control: 12px
- --rilo-shadow-card: 0 8px 24px rgba(0,0,0,0.25)
- --rilo-gap-page: 24px
- --rilo-gap-form: 16px

### 1.4 Motion（弱动效）
- --rilo-motion-ease: cubic-bezier(0.2, 0.8, 0.2, 1)
- --rilo-motion-fast: 120ms
- --rilo-motion-mid: 180ms
- --rilo-motion-slow: 240ms
规则：默认只给 hover/focus 微动画；布局/进出场不超过 180ms；尊重 prefers-reduced-motion。

### 1.5 AntD 主题映射（v5 ConfigProvider）
建议 tonight 仅追加，不破坏现有 colorPrimary 指向：
- colorPrimary: 'var(--rilo-accent)'        // 今晚不改
- colorInfo: 'var(--rilo-accent)'
- colorBgBase: 'var(--rilo-bg-deep)'
- colorTextBase: 'var(--rilo-text-1)'
- colorBgContainer: 'var(--rilo-surface-1)'
- colorBorder: 'var(--rilo-border-deep)'
- borderRadius: 8
- motionDurationFast: 'var(--rilo-motion-fast)'
- motionEaseInOut: 'var(--rilo-motion-ease)'

Tailwind 侧建议（Later）：收敛 class，改为语义化 utility（或少量自定义类）。

—

## 2) 信息层级（High Hierarchy）
采用“Hero → Drivers → Diagnostics”三层：
- Hero（3）：净利润、净利润率、回本周期（概览/右侧结论首屏）
- Drivers（3–6）：总营收、总成本、毛利润/毛利率、关键输入（入住率/ADR/房晚）
- Diagnostics（折叠/右侧“过程”）：细分明细、公式解释、情景对比

卡片统一外观（深色版）：
- 背景：var(--rilo-surface-1)
- 文本：var(--rilo-text-1)
- 辅助文本：var(--rilo-text-2)
- 边框：1px solid var(--rilo-border-deep)
- 圆角/阴影：--rilo-radius-card / --rilo-shadow-card

—

## 3) Page‑by‑Page Visual Adjustments（精确到实现）

### 3.1 Settings（参数配置页）
目标：左主内容聚焦“可操作输入 + 最小基础结果”；右侧 Inspector 用于“结论/过程/术语”。

具体调整：
- 左侧“基础结果”KPI：仅 5 项（年营收/年成本/净利润/净利润率/回本），使用语义色：
  - 净利润 ≥ 0：--rilo-sem-success；< 0：--rilo-sem-danger
  - 净利润率：≥15% 使用 success，5–15% 使用 info，<5% 使用 warning
- 控件外观统一：
  - InputNumber/Select/Switch 圆角 12px，focus ring 使用 var(--rilo-accent) 40% 透明度
  - 百分比一律 PercentSlider（0–100、step 可配置），单位在 addonAfter
- 去掉大面积浅色渐变背景；用 var(--rilo-surface-1) 作为表面，容器内间距 24px
- 右侧 Inspector 结论区：
  - 只保留 2–3 条“可行动”结论；色彩弱化，使用 info/neutral，不用高饱和色块
代码锚点：`js/pages/settings-page-v2.js`（TwoPaneLayout 已就绪，今晚不动结构，仅样式约束在 tokens 生效后逐步替换）

### 3.2 Overview（经营概览页）
目标：建立“Hero → Drivers → Diagnostics”秩序，弱化花哨元素；新增 RevPAR（次级指标）。

具体调整：
- Hero 区（上排 3 个 KPI）：净利润、净利润率、回本周期；值域/颜色同上
- Drivers：
  - 总营收、总成本、毛利润、综合毛利率、RevPAR（ADR×入住率；单位 ¥/房晚）
  - 颜色语义：营收/毛利率（info/teal），成本（danger），毛利润（teal/info）
- Diagnostics：保留“收入结构/成本结构图”，卡片背景改为 var(--rilo-surface-2)
- 警示与洞察：使用 AlertCard/InsightCard，但色彩映射到 --rilo-sem-*，不使用任意主题色
代码锚点：`js/pages/overview-page.js`（已有 TODO：RevPAR；图表卡片使用统一外壳）

### 3.3 Analysis（敏感度分析页）
目标：弱动效、降干扰、强可读。

具体调整：
- 去除控制面板渐变（from-blue-50 → indigo-50）；改为 var(--rilo-surface-1) + 边框 var(--rilo-border-deep)
- RangeSlider：弱动效（180ms），选中轨道用 var(--rilo-accent) 80% 不透明度；刻度/标签使用 var(--rilo-text-2)
- 条形图颜色逻辑保持“好=绿、坏=红、中性=灰”，映射为 --rilo-sem-success/danger + 中性 #9CA3AF
- Inspector“过程”首卡仅一条关键提示，长文下沉到 Collapse
代码锚点：`js/pages/analysis-page.js`（ChartBars/RangeSlider/ControlPanel 样式替换即可，不动计算）

—

## 4) 实施指南（Tonight vs Later）

### Tonight（最安全落地，0 回归风险优先）
1) 新增深色 tokens（仅定义）：在 `index.html :root` 追加 1.1–1.4 所有变量（不删除旧变量）
2) AntD 主题增强（只加不改）：在 `js/components/ui-components-antd.js` 的 ConfigProvider theme.token 增加 colorBgBase/colorTextBase/colorBgContainer/colorBorder/motion*
3) RevPAR 位置锚定：在 `js/pages/overview-page.js` 的 TODO 处确认展示位于 Drivers 区（暂不实现计算，避免耦合）
4) 记录设计决策：本文件落库 + `docs/worklog.md` 节拍一条

预计改动范围：纯配置 + 文档；UI 行为不变，零回归风险。

### Later（稳定后逐步替换，分批验证）
5) 组件皮肤替换：统一卡片/按钮/输入的表面、边框、圆角（语义类或小型 CSS 层）；逐页灰度
6) 颜色语义化：KPI/Alert/Insight/ChartBar 全面改为 --rilo-sem-*，去除随意色值
7) 去渐变/降动效：剥离页面级渐变背景与重型阴影，统一弱动效曲线
8) Typography 收敛：标题/正文/说明使用固定级联：24/18/14/12；中文术语 hover 统一样式
9) Tailwind 减量：把易变色 class 替换为语义类（rilo-card / rilo-muted / rilo-accent-text）
10) Light 模式（备选）：在 tokens 基础上新增 Light 套件并挂到切换开关（非当下优先）

—

## 5) 精确改动建议（代码片段，仅供后续实施）

在 `index.html` 的 `:root` 追加（节选）：
```css
:root {
  /* Deep neutrals */
  --rilo-bg-deep:#11100E; --rilo-surface-1:#171513; --rilo-surface-2:#1E1B18;
  --rilo-border-deep:#2A2622; --rilo-text-1:#ECE7E1; --rilo-text-2:#B6B0A8; --rilo-text-3:#8A847D;
  /* Jewel accents */
  --rilo-brand:#221C86; --rilo-jewel-sapphire:#2D3A8C; --rilo-jewel-amethyst:#6D28D9;
  --rilo-jewel-emerald:#10B981; --rilo-jewel-citrine:#F59E0B; --rilo-jewel-ruby:#EF4444;
  --rilo-sem-success:var(--rilo-jewel-emerald); --rilo-sem-warning:var(--rilo-jewel-citrine);
  --rilo-sem-danger:var(--rilo-jewel-ruby); --rilo-sem-info:var(--rilo-accent);
  /* Motion */
  --rilo-motion-ease:cubic-bezier(0.2,0.8,0.2,1); --rilo-motion-fast:120ms; --rilo-motion-mid:180ms; --rilo-motion-slow:240ms;
}
```

在 `js/components/ui-components-antd.js` 的 `createAntdApp` 中扩展：
```js
theme:{ token:{
  colorPrimary:'var(--rilo-accent)', colorInfo:'var(--rilo-accent)',
  colorBgBase:'var(--rilo-bg-deep)', colorTextBase:'var(--rilo-text-1)',
  colorBgContainer:'var(--rilo-surface-1)', colorBorder:'var(--rilo-border-deep)',
  motionDurationFast:'var(--rilo-motion-fast)', motionEaseInOut:'var(--rilo-motion-ease)'
}}
```

Overview Drivers 新增 RevPAR（稍后落地）：
```js
{ key:'revpar', title:'RevPAR', value: ((adr||0)*((occ||0)/100)).toFixed(0), suffix:'元/房晚', color:'info' }
```

—

## 6) 验收标准（Design QA）
- 页面在深色背景下文字对比满足 WCAG AA（正文对比度 ≥ 4.5）
- KPI 的语义色仅使用 --rilo-sem-*；无随机色
- 动效时长 ≤ 180ms，且在“减少动效”系统设置下动画被禁用或极弱
- Inspector“结论”≤ 3 条、可行动；“过程”可长但默认折叠
- 三页一致的 14/10 布局；警示/洞察卡片风格一致

—

## 7) 风险与回滚
- 今晚仅定义 token 与主题映射，不替换现有样式；若出现渲染异常，可一键回滚 ConfigProvider 的新增 token 项
- Later 分批替换，每步留存 diff，必要时按页面粒度回退

—

## 8) 里程碑
- Tonight：tokens 定义 + AntD 主题增强 + 计划入库
- D+1：Overview Drivers 整理（含 RevPAR）+ Alert/Insight 语义化
- D+2：Settings 控件统一皮肤 + Inspector 收敛
- D+3：Analysis 去渐变/弱动效 + 条形图语义化

