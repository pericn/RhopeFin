# UI Guidelines（信息架构 + 设计系统）

目标：把「看不懂」变成「一眼知道该看哪里、该改哪里」。这份规范偏“可落地到代码”，不是审美论文。

> 适用范围：Settings（参数配置）/ Overview（财务分析）/ Analysis（敏感度分析）三页 + 右侧信息面板。

---

## 0. Design Tokens（P0，必须全局一致）

> 这不是“视觉参考”，是代码可直接用的 **统一 token**。AntD 走 `ConfigProvider theme.token`；非 AntD 区域走 CSS 变量（见 `index.html :root`）。

### 0.1 颜色（Color）
- **背景（Layout Background）**：`--rilo-bg-deep` = `#11100E`
- **表面（Surface / Card）**：`--rilo-surface-1` = `#171513`；`--rilo-surface-2` = `#1E1B18`
- **边框（Border）**：`--rilo-border-deep` = `#2A2622`
- **文本（Text）**：`--rilo-text-1` = `#ECE7E1`；`--rilo-text-2` = `#B6B0A8`；`--rilo-text-3` = `#8A847D`
- **品牌主色（Rilo Brand / Primary）**：`--rilo-brand` = `#221C86`
- **强调色（Accent）**：`--rilo-accent` = `#2563EB`
- **语义色（Semantic）**：
  - Success：`--rilo-sem-success` = `#10B981`
  - Warning：`--rilo-sem-warning` = `#F59E0B`
  - Danger：`--rilo-sem-danger` = `#EF4444`
  - Info：`--rilo-sem-info` = `--rilo-accent`

### 0.2 字体（Typography）
- Font family：`Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial`
- 字号层级（建议，不要跳级）：
  - Page Title：24 / Bold
  - Section Title：18 / Semibold
  - Body：14 / Regular
  - Caption / Hint：12 / Regular

### 0.3 间距（Spacing）
- 页面区块间距：24
- 卡片内边距：24
- 表单控件垂直间距：16

### 0.4 圆角与阴影（Radius / Shadow）
- Card radius：16（`--rilo-radius-card`）
- Control radius：12（`--rilo-radius-control`）
- Card shadow：`--rilo-shadow-card`（统一，不要每个组件自带一套阴影）

### 0.5 组件外观规范（P0）
- **卡片（Card）**：统一使用 `rilo-card`（背景/边框/阴影/圆角一致）
- **按钮（Button）**：主按钮用品牌色；次按钮为浅底+边框；危险按钮用语义红
- **输入（InputNumber / Input）**：单位放在 `addonAfter`，不要塞进 value 文本
- **Hover / Focus**：
  - Focus ring 必须可见（对比足够），且全局一致
  - Hover 只做轻量提升（阴影/边框/背景微变），不要跳动

---

## 1. 交互控件规则（全局强制）

- **所有百分比值**：一律使用 `PercentSlider`（Slider + 数值输入显示，范围 0–100，step 可配置）
- **有限选项**：一律使用 `Select` 下拉（禁止混用原生 `<select>` / Radio / 自定义下拉）
- **Checkbox / Radio 的使用边界（统一口径）**：
  - Checkbox：仅用于“开/关、是否启用、包含/不包含”这类 **布尔开关**
  - Radio：仅用于 **2–3 个互斥且需要立即可见的选项**（否则用 Select）

---

## 2. 三个“可落地”的范式（本项目采用）

### 范式 A：Dashboard KPI Hierarchy（KPI 分层仪表盘）
**一句话**：先给结论（Hero KPI），再给解释（Drivers），最后给诊断（Diagnostics）。

**落地规则**
- **P0（默认）只露出 6–12 个 KPI**：
  - **Hero（3 个）**：净利润、净利润率、回本周期
  - **Drivers（3–6 个）**：总营收、总成本、毛利润/毛利率、关键输入（Rooms/Days/ADR/Occ）
  - **Diagnostics（折叠）**：细分收入/成本、详细计算过程、公式/假设
- KPI 卡片必须符合：
  - `title`（中文、可 hover 术语）
  - `value`（对齐单位/格式化）
  - `suffix`（单位，不要塞进 value）
  - `statusColor`（语义色，不是装饰色）

### 范式 B：Progressive Disclosure（渐进式披露）+ 右侧 Inspector（结论/过程/术语）
**一句话**：默认只显示关键内容；“想深入的人”有二级入口。

**落地规则**
- 所有页面都保持同一种“右侧信息面板”语言与结构：
  - Tab：**结论 / 过程 / 术语**
  - 面板标题：**计算面板**（说明其职责：先看结论，再看过程，最后查术语）
- “高级内容”只允许出现在：
  1) 右侧面板的 **过程**
  2) 页面底部的 **折叠区（Collapse）**
- 禁止在默认视图堆叠 3 层以上信息（例如：图表 + 表格 + 解释长文同时铺开）。

### 范式 C：Card System + Spacing/Type Scale（卡片系统 + 间距/字号标尺）
**一句话**：组件要像“积木”，同类信息同一种卡片。

**落地规则（Tailwind / antd 混用也能执行）**
- 场景卡片（Card）统一：`bg-[var(--rilo-surface-1)] border border-[var(--rilo-border-deep)] rounded-2xl shadow p-6`（或 antd Card，但外观保持一致）
- 页面纵向节奏：
  - 区块间距：`space-y-6`
  - 卡片内标题与内容：`mb-4`
- 标题层级（不要跳级）：
  - Page Title：`text-2xl font-bold`（全局顶部已有，页面内一般用 Section Title）
  - Section Title：`text-lg font-semibold`
  - SubTitle/Hint：`text-sm text-[var(--rilo-text-2)]`
  - Help Text：`text-xs text-[var(--rilo-text-3)]`

---

## 1. 全局布局规范（Settings / Overview / Analysis 必须一致）

### 1.1 页面结构（建议 2 栏 14/10）
- **左栏（主内容）**：当前页面的关键输入/关键输出
- **右栏（信息面板）**：结论/过程/术语（InspectorPanel）

> Settings 已落地 14/10；Overview/Analysis 也应对齐。

### 1.2 右侧面板职责边界
- **结论**：只放“可行动”的结论摘要（Top KPIs + 关键提示）
- **过程**：放公式、推导、详细计算过程（可长）
- **术语**：所有术语解释都集中在这里（Definitions），其它地方只用 hover

---

## 2. 文案与命名规则（强制）

### 2.1 中文优先
- 页面/按钮/标签/提示 **全部中文**。
- 缩写（ADR/Occ/RevPAR 等）**仅允许**出现在：
  - 公式
  - hover 术语的 `term` key（用户看到的是中文）

### 2.2 术语 hover 规则
- 除明确单词外的缩写必须可 hover。
- Hover 呈现：浅蓝下划线 + Popover（含“查看更多”跳到右侧术语面板并定位）。
- 用法：`<Term term="ADR">平均房价</Term>`

---

## 3. 颜色语义（不要把颜色当装饰）

- **成功/改善**：green
- **风险/恶化**：red
- **提醒**：yellow/orange
- **中性信息**：gray/blue

规则：颜色必须对应“更好/更坏/需要注意”，不要同一页面出现 6 种随机主题色。

---

## 4. 表单 UX（Settings）

- 每个输入都必须配：
  - 中文标签（必要时加 hover 术语）
  - 单位
  - 默认值/占位
  - 约束（范围、精度）
- 高级假设（如 CAC/LTV）默认折叠，或放到“高级参数”区。

---

## 5. 组件清单（建议）

- `KPI`：只负责展示数值（title/value/suffix/color）
- `ChartCard`：图表外壳（标题 + 图表内容）
- `InspectorPanel`：右侧信息面板（结论/过程/术语）
- `Collapse`：高级内容折叠容器（例如“详细情景表”、“详细计算过程”）

---

## 6. Code Review Checklist（改 UI 必过）

- [ ] 页面是否遵循 14/10 双栏（主内容 + 右侧面板）
- [ ] 默认视图是否只显示关键 KPI/关键输入
- [ ] 所有缩写是否隐藏在 hover/公式里（用户看到的是中文）
- [ ] 右侧面板 Tab 是否为中文：结论/过程/术语
- [ ] 颜色是否是语义色（而不是随机配色）
- [ ] 高级内容是否折叠/二级入口
