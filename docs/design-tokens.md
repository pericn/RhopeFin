# Design Tokens (Hopeful Finance)

目的：把颜色/间距/圆角等“全站一致的东西”抽成 token，避免蓝色到处硬编码（Tailwind class / hex / antd token 混杂）。

## 1) Accent / Primary（强调色）

当前 repo 里出现了几套“蓝色强调”：
- Tailwind class：`text-blue-600 / bg-blue-600 / border-blue-500 ...`
- Hex：`#3B82F6`（blue-500，见 loading spinner、部分图表点位）
- Ant Design token：`colorPrimary: '#1890ff'`（ui-components-antd.js）

建议做法：
- 以 **一个 CSS 变量**作为单一事实来源：
  - `--rilo-accent: #2563EB`（Tailwind v2 blue-600）
- Ant Design `ConfigProvider` 的 `colorPrimary` 也指向它：
  - `colorPrimary: 'var(--rilo-accent)'`
- 图表/可视化里避免硬编码 hex，优先从 `--rilo-accent` 读取（必要时提供 fallback）。

> 结果：后续如果想把“品牌蓝”换成更偏青/更偏紫，只改一个地方。

### 已落地的 token（当前实现）
在 `index.html` 的 `:root`：
- `--rilo-accent: #2563EB`
- `--rilo-accent-500: #3B82F6`
- `--rilo-accent-50: #EFF6FF`

## 2) Neutral / Text（中性色）

- `--rilo-ink: #0F172A`（深墨色，正文/标题）
- `--rilo-muted: #6B7280`（次要文字/说明）
- `--rilo-fog: #F8FAFC`（浅雾白，背景/卡片外层）

## 3) 文艺配色 B（冷诗性：雾蓝/青黛 + 纸感背景）

适用场景：
- 在不破坏“专业金融工具”的前提下，让界面更柔和、有一点“纸感”。

建议 token：
- `--rilo-qingdai: #2F3A4A`（青黛：比黑更柔和的深色，用于标题/强调文字）
- `--rilo-mist-blue: #AFC4DA`（雾蓝：大面积背景点缀、分割、浅色徽标）
- `--rilo-fog: #F8FAFC`（纸感底色）

搭配建议（可选）：
- 页面背景：`linear-gradient(135deg, var(--rilo-fog), #ECFEFF /* very light cyan */)`
- 卡片背景：纯白或 `rgba(255,255,255,0.92)`
- 强调蓝：仍用 `--rilo-accent`，但减少高饱和大面积铺色

## 4) 下一步（如果要更“系统化”）

- 把 token 拆到单独文件（例如 `css/tokens.css`）并在 index 引入。
- 用更少的 Tailwind “颜色 class”，更多用语义 class：
  - `.rilo-accent-text` / `.rilo-accent-bg` / `.rilo-muted` …
- KPI/Badge 颜色不要传 `green/orange/teal` 这种非 antd 语义色；统一映射到 `success/warning/danger/info`。
