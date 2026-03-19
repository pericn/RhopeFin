# 样式重构计划 — Rilo Analysis（v5 视觉落地）

## 🎯 任务本质
- **目标**：给现有功能页面（Settings/Overview/Analysis）应用 v5 prototype 的视觉风格
- **范围**：纯 CSS + 布局微调，不改 JavaScript 计算逻辑，不破坏数据结构
- **交付物**：三页面统一视觉风格 + 更新 `docs/ui-guidelines.md` 以反映最终实现

---

## 📐 v5 视觉语言核心（从 prototype 提取）

### 1. 色彩系统（Paper + Jewel）
- **纸张基底**：
  - `--paper-base: #f6f0e6`
  - `--paper-warm: #efe5d7`
  - `--paper-fold: #ccb9a2`
  - `--line: rgba(34, 31, 26, 0.13)`
- **墨水（文本）**：
  - `--ink-1: #221f1a`（主文本）
  - `--ink-2: #5f564a`（次要）
  - `--ink-3: #8c8275`（提示）
- **宝石 accent**（语义色映射）：
  - `--rilo-accent: #221C8B`（品牌主色）
  - `--emerald: #2f7d67`（成功/正向）
  - `--amber: #b78128`（警告）
  - `--brick: #9d5b4b`（危险）
  - `--plum: #835b7d`（中性强调）

### 2. 排版
- **西文衬线体**：`"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Baskerville, Georgia, serif`
- **中文字体**：`"Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`
- **行高**：1.85（正文）、1.24（标题）
- **字间距**：0.02em（正文）

### 3. 形状与阴影
- **圆角**：`--radius-xl: 30px`、`--radius-lg: 22px`、`--radius-md: 16px`
- **卡片阴影**：`--shadow: 0 26px 80px rgba(85, 61, 28, 0.12)`
- **边框**：`1px solid var(--line)` 或 `var(--line-strong)`

### 4. 布局结构
- **容器**：`width: min(1520px, calc(100% - 28px)); margin: 18px auto; border-radius: 34px;`
- **双栏**：主内容 + 右侧面板（14/10 分割）
- **间距标尺**：`--space-1: 12px`、`--space-2: 16px`、`--space-3: 20px`、`--space-4: 28px`、`--space-5: 38px`、`--space-6: 50px`

---

## 🛠️ 实现计划（三阶段）

### 阶段 0：预适配（不破坏现有功能）
1. **保留 AntD 默认样式**，在其基础上覆盖
2. **添加 v5 CSS 变量到 `index.html`**（不删除现有变量）
3. **测试 smoke**：确保应用正常启动，计算正确
4. **备份当前 diff**：`git commit -am "pre-style-refactor"`

### 阶段 1：全局视觉基座（15 分钟）
1. **背景与纸张质感**：
   - `body` 应用 v5 渐变背景 + `mix-blend-mode` 纹理
   - `.app` 容器改为半透明白底 + 阴影 + 边框
2. **字体与排版**：
   - 全局应用 `--rilo-font-cn` 与行高
   - 标题使用衬线字体栈
3. **AntD 主题覆盖**：
   - 通过 `ConfigProvider` 设置 `token`：
     - `colorPrimary`: `#221C8B`
     - `borderRadius`: `12`
     - `fontFamily`: `var(--rilo-font-cn)`
   - 覆盖 `.ant-card`, `.ant-btn`, `.ant-input` 为统一外观

### 阶段 2：三页面分治（每页 20 分钟 × 3）

#### Settings（参数配置页）
- **布局**：确保 TwoPaneLayout 生效（左表单 + 右面板）
- **输入控件**：
  - `InputNumber` + `Slider` 并排（入住率）
  - 统一边框：`1px solid var(--line)`，圆角 `12px`
  - 标签字体：`text-sm text-[var(--ink-2)]`
  - Hover/Focus ring：`border-color: var(--rilo-accent); box-shadow: 0 0 0 2px rgba(34, 28, 139, 0.15)`
- **分组卡片**：`bg-[var(--paper-warm)] border border-[var(--line)] rounded-[var(--radius-lg)] p-[var(--space-4)] mb-[var(--space-4)]`
- **即时结果区**（底部）：
  - 4 个 KPI 卡片横向排列，使用 grid gap-4
  - 卡片样式：`bg-white/60 border border-[var(--line-strong)] rounded-[var(--radius-lg)] p-4 text-center`
- **右侧面板**：Inspector Tabs（结论/过程/术语）
  - 标签样式：中文字体，选中底部边框 `2px solid var(--rilo-accent)`

#### Overview（概览页）
- **KPI 卡片**：
  - Title（`text-sm text-[var(--ink-2)]`）+ Value（`text-2xl font-semibold text-[var(--ink-1)]`）+ Suffix（`text-sm text-[var(--ink-3)]`）
  - 语义色 class：`.text-success`/`.text-danger`/`.text-warning`
- **图表区**：
  - `ChartCard`：`bg-[var(--paper-warm)] rounded-[var(--radius-lg)] border border-[var(--line)] p-4`
  - 图表标题：`text-base font-semibold mb-3 text-[var(--ink-1)]`
- **收入/成本结构图**：使用简洁堆叠柱状图，配色用 emerald/amber/brick
- **RevPAR 次级指标**：在 KPI 区末尾加一个小卡片 `bg-[var(--paper-base)] rounded-[var(--radius-md)] p-3`

#### Analysis（敏感度页）
- **控制面板**（参数选择 + 范围 + 指标）：
  - `Select` 与 `InputNumber` 统一样式
  - 按钮：Primary (`bg-[var(--rilo-accent)]`), Secondary (`bg-transparent border border-[var(--line)]`)
- **图表**：
  - 单选条形图（正向/负向颜色：emerald / brick）
  - 坐标轴文字：`text-xs text-[var(--ink-3)]`
- **情景表**（ScenarioTable）：
  - 表格样式：`bg-[var(--paper-base)] rounded-[var(--radius-md)] overflow-hidden`
  - 表头：`bg-[var(--paper-warm)] text-[var(--ink-2)] text-xs uppercase`
  - 行边框：`border-b border-[var(--line)]`

### 阶段 3：术语系统统一（20 分钟）
1. **确保所有缩写可 hover**：ADR、Occ、RevPAR、COGS 等
2. **右侧面板术语 Tab**：与 `term-registry.js` 联动，显示 `title + body`
3. **Hover 样式**：`border-bottom: 1px dotted var(--rilo-accent); cursor: help;`
4. **Popover 样式**：`bg-white/95 border border-[var(--line-strong)] rounded-[var(--radius-md)] shadow-lg p-3 text-sm text-[var(--ink-1)] max-w-xs`

---

## 📝 UI Guidelines 同步更新

需要修改 `docs/ui-guidelines.md`：
1. **设计 Token 表**：完全替换为 v5 的 CSS 变量（含语义映射）
2. **组件外观规范**：明确 antd 覆盖规则（圆角、边框、阴影）
3. **颜色语义**：映射 `emerald`/`amber`/`brick` 为成功/警告/危险
4. **排版**：标题使用衬线字体，正文无衬线
5. **间距标尺**：更新为 `--space-1` 至 `--space-6`
6. **Card System**：统一 `.rilo-card` 样式类（复制 v5 的卡片样式）
7. **KPI 格式**：title/value/suffix 三件套 + 语义色

---

## ✅ 验收标准（DoD - Done）

### 功能无损
- [ ] 所有输入正常工作，计算结果与样式改造前完全一致
- [ ] localStorage 读写正常
- [ ] 预设参数按钮可用

### 样式统一
- [ ] 三页面使用一致的色彩（纸张基底 + 墨水 + 宝石 accent）
- [ ] 字体层级符合 v5 规范（标题衬线，正文无衬线）
- [ ] 所有卡片、输入、按钮的圆角 ≥ 16px，阴影统一
- [ ] 右侧面板（若存在）Tab 为中文：结论/过程/术语
- [ ] 语义色正确应用（绿色=正向，红色=负向，琥珀=警告）

### 细节落地
- [ ] 所有缩写（ADR、Occ、RevPAR、COGS）都可 hover 查看术语
- [ ] 颜色不是装饰性，只用于语义表达
- [ ] 没有 Tailwind 冲突（优先级：v5 CSS 变量 > antd default > tailwind）
- [ ] 无深色模式残留类名（如 `bg-white` 仅用于卡片内次要区域）

### 交付物
- [ ] `index.html` + `app.jsx` 仅包含样式改动，无功能逻辑变更
- [ ] `docs/ui-guidelines.md` 已更新为 v5 视觉系统
- [ ] `smoke.sh` 通过（服务器启动，页面可加载）
- [ ] 可选：手动检查边界值输入（0、100、负数、小数）

---

## ⚠️ 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| AntD 样式覆盖不彻底 | 部分控件仍为默认蓝/白 | 使用 `:where()` 提高特异性；关键 class 直接写在 `index.html` |
| 字体加载慢 | 衬线体回退到系统字体 | 提供平实 fallback；不影响功能 |
| 现有代码依赖 Tailwind 类 | 样式冲突 | 保留 Tailwind 布局类（flex/grid/padding），覆盖颜色/字体/圆角 |
| 计算错误（极小概率） | 功能受损 | 阶段 0 做 full git commit，随时可回退；每阶段运行 smoke |

---

## 🚀 执行顺序（建议）

1. **杀掉所有可能干扰**：`codex` 进程先挂起，避免并行写冲突
2. **阶段 0 预适配**（10 分钟）
3. **阶段 1 全局基座**（15 分钟）
4. **Settings 页面**（20 分钟）
5. **Overview 页面**（20 分钟）
6. **Analysis 页面**（20 分钟）
7. **术语系统检查**（10 分钟）
8. **smoke + 手动边界测试**（10 分钟）
9. **更新 UI guidelines 文档**（20 分钟）
10. **最终 commit + 汇报**

**总计**：约 2 小时（含测试）

---

**决策点**：是否立即开始执行？还是先精简计划？