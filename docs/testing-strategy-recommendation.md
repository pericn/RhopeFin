# 测试策略推荐 — Rilo Analysis（基于 v5 样式重构）

## 📊 当前状态分析
- **项目类型**：单文件 HTML + React (via Babel Standalone) + AntD 5 (CDN) + Tailwind CSS
- **构建系统**：无（静态文件直接运行）
- **已有工具**：`scripts/smoke.sh`（仅验证服务器启动）
- **测试缺口**：无单元测试、无 UI 自动化测试、无视觉回归

---

## ✅ 推荐测试方案（按优先级）

### 方案 A：Playwright + 视觉回归（首选，适合长期维护）
**理由**：
- 直接控制真实浏览器，截图对比最准确
- 支持组件交互测试（输入、点击、状态更新）
- 可集成到 CI
- 学习曲线平缓

**实施**：
1. `npm init -y`（如果无 package.json）
2. `npm i -D @playwright/test`
3. `npx playwright install chromium`
4. 写 tests：
   - `tests/smoke.spec.js`：三页面加载，无 JS error
   - `tests/visual.spec.js`：截图 baseline → 修改样式 → 对比
   - `tests/interaction.spec.js`：输入参数，验证结果更新

**成本**：约 100-150 lines 测试代码，覆盖核心路径

---

### 方案 B：Vitest + @testing-library/react + jest-image-snapshot（轻量单元 + 组件快照）
**理由**：
- 已有 `@vitest` node_modules（可能来自之前尝试）
- 适合纯逻辑测试（calculator 函数）
- 但需要将 React 组件拆分为可测试单元（当前全在 app.jsx）

**限制**：
- 当前 monolith 结构不利于单元测试
- 视觉回归需要 jsdom + 截图（复杂）

**不推荐**：因项目结构，改造成本高

---

### 方案 C：Percy / Chromatic（SaaS 服务）
**理由**：
- 零配置 visual testing
- 但需要提交代码到 SaaS，可能有隐私/成本问题

**不推荐**：本项目为内部工具，无需商业服务

---

## 🎯 针对 v5 样式重构的测试策略（最小可行）

> 目标：用最少 token 保证样式改造不破坏功能

### 1. 立即自建（我来写，20 分钟）
- **文件**：`tests/playwright.config.js` + `tests/rilo.smoke.spec.js`
- **内容**：
  - 启动 python http.server (4173)
  - 访问 `/index.html`，等待 React 挂载
  - 检查三页 Tab 切换正常
  - 在 Settings 输入数值，Overview KPI 更新
  - 截图（用于后续视觉回归 baseline）
- **运行**：`npx playwright test`

### 2. 视觉基线（v5 改造后）
- 改造完成后，运行一次截图，保存到 `tests/baseline/`
- 后续每次修改样式自动对比，diff 图片输出到 `tests/diff/`

### 3. 集成到现有脚本
- 修改 `scripts/smoke.sh` 增加 playwright 检查：
  ```bash
  npx playwright test --grep "smoke" || exit 1
  ```
- 新增 `scripts/visual-regression.sh`：
  ```bash
  npx playwright test --grep "visual"  # 更新或验证 baseline
  ```

---

## 📋 验收清单（DoD - Testing）

- [ ] **Smoke 通过**：三页面可加载，无 console.error
- [ ] **交互基本正常**：Settings 修改 → Overview 数据刷新
- [ ] **视觉回归对比**（可选但推荐）：改造前后截图差异 < 阈值

---

## 🚀 执行建议

1. **现在**（样式重构期间）：
   - 只保留 `smoke.sh`（服务器启动）作为快速检查
   - 手工验证三页切换和关键输入

2. **样式收尾后**（一旦 v5 完成）：
   - 立即建立 Playwright 测试（我来写，约 20 分钟）
   - 生成 baseline 截图
   - 加入 git pre-push hook 或 CI 步骤

---

## 🔍 Research 结论（基于 Web Search）

- **AntD 官方**：使用 `jest-puppeteer`（但 Playwright 更现代）
- **行业 2025**：Playwright 是 React 视觉测试的主流选择
- **关键实践**：
  - 设置阈值（抗锯齿差异允许 0.1% 像素差异）
  - 只对比关键区域（KPI 卡片、图表容器），忽略动态数据区域
  - 使用 `waitForLoadState('networkidle')` 确保图表渲染完成

---

**最终建议**：立即开始 v5 样式重构，暂不引入测试框架（避免 token 消耗）；待 v1.0 视觉冻结后，用 1 小时快速搭建 Playwright 视觉回归。现阶段 smoke.sh + 手工验收足够。