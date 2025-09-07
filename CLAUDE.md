# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供在此代码库中工作的指导。

## 项目概述

Hopeful Finance 是一个宠物综合体经营测算应用，专门用于宠物行业的财务分析和经营预测。该应用提供完整的财务建模功能，包括四大收入板块测算、成本分析和投资回报计算，适用于路演、物业谈判和投资决策。

**当前版本**: v2.0 模块化架构，已完成UI重构优化。

## 核心架构

### 文件结构 (v2.0 模块化架构)
```
/
├── index.html                    # 原始单文件版本
├── index_v2.html                 # v2.0 模块化版本主入口 ⭐
├── app.js                        # 主应用文件 ⭐
├── app.jsx                       # JSX版本（已整合到index.html）
├── initial.jsx                   # 原始简化版本
├── CLAUDE.md                     # 项目配置文档 ⭐
├── DOCUMENTATION.md              # 完整技术文档
├── README.md                     # 使用说明
└── js/                           # 模块化组件目录 ⭐
    ├── core/                     # 核心模块
    │   ├── calculator.js         # 财务计算引擎
    │   ├── data-manager.js       # 数据管理器
    │   └── formula-engine.js     # 公式引擎
    ├── components/               # UI组件
    │   ├── ui-components.js      # 基础UI组件
    │   ├── ui-components-antd.js # Ant Design组件封装
    │   ├── formula-display.js    # 公式显示组件
    │   └── chart-components.js   # 图表组件
    ├── pages/                    # 页面组件
    │   ├── overview-page.js      # 财务分析页面 (已重构)
    │   ├── settings-page.js      # 参数配置页面 (已重构)
    │   └── analysis-page.js      # 敏感度分析页面 (已重构)
    └── modules/                  # 业务模块
        ├── scenario-analysis.js  # 情景分析
        ├── breakeven-analysis.js # 盈亏平衡分析
        └── custom-modules.js     # 自定义模块
```

### 技术栈 (已更新)
- **前端框架**: React 17 (通过 CDN 加载)
- **UI组件库**: Ant Design 5.12.8 (通过 CDN 加载) ✨
- **样式系统**: Tailwind CSS 2.2.19 (通过 CDN 加载)
- **构建工具**: Babel Standalone (浏览器内 JSX 转译)
- **数据持久化**: 浏览器 localStorage
- **架构模式**: 模块化组件架构

## 运行命令

### 直接运行（推荐）
```bash
# v2.0 模块化版本 (推荐使用)
open index_v2.html

# 或原始版本
open index.html
```

### 本地服务器运行
```bash
# 使用 Python 启动本地服务器
python -m http.server 8000
# 然后访问 http://localhost:8000/index_v2.html

# 或使用 Node.js
npx serve .
# 访问 http://localhost:3000/index_v2.html

# 或使用 http-server
npx http-server
# 访问 http://localhost:8080/index_v2.html
```

### 无网络环境运行
应用依赖 CDN 资源（React、Ant Design、Tailwind CSS），需要网络连接。如需离线运行，需要下载并本地化这些资源。

## 应用架构 (v2.0 重构版)

### UI架构 - 简化信息层级
```
🏗️ 新的信息层级 (已重构)
├── 顶部状态栏 (紧凑型)
│   ├── 🐾 宠物综合体测算
│   ├── 💰 年利润: ¥X万  
│   └── 📊 利润率: X%
├── 主导航 (按工作流程)
│   ├── 📝 参数配置     # settings
│   ├── 📊 财务分析     # overview (重命名)
│   └── 🎯 敏感度分析   # analysis (重构)
└── 内容区 (去除冗余)
    └── 专注核心功能，无重复标题
```

### 页面组件结构 (已重构)

#### 1. 参数配置页面 (`settings-page.js`)
- **功能**: 业务参数输入和配置
- **重构**: 去除装饰标题，直接进入功能区域
- **组件**: BasicSettings, RevenueSettings, CostSettings 等

#### 2. 财务分析页面 (`overview-page.js`) 
- **功能**: 核心财务指标展示和分析
- **重构**: 突出三大核心指标卡片
  - 💰 总营收卡片 (蓝色)
  - 💸 总成本卡片 (红色) 
  - 📈 净利润卡片 (绿色/灰色)
- **增强**: 收入结构分析 + 投资回报分析

#### 3. 敏感度分析页面 (`analysis-page.js`)
- **功能**: 关键参数影响分析
- **重构**: 完全重写，去除复杂子页签
- **核心**: 参数选择器 + 影响图表 + 情景对比表

### 财务模型结构

#### 收入模块（四大板块）
1. **会员收入**: 基础会员和高级会员的分层定价模型
2. **寄养收入**: 基于房间数、房价和入住率的收益计算
3. **医疗收入**: 包含诊疗、增值服务和产品销售的组合收入
4. **零售/餐饮/社交收入**: 辅助业务收入

#### 成本模块
- **固定成本**: 租金、物业、人力、管理费等固定支出
- **变动成本**: 与各业务板块收入关联的成本率计算

#### 关键指标计算
- 实时计算总营收、总成本、年度利润、利润率
- 基于初始投资的回本周期分析

### 状态管理
- 使用 React Hooks 管理所有财务参数状态
- 通过 localStorage 实现数据持久化
- 支持一键套用预设参数功能

### 组件架构 (模块化)
- **Core模块**: Calculator, DataManager, FormulaEngine
- **UI组件**: 基础组件 + Ant Design封装组件
- **Page组件**: 三个主要页面组件 (已重构)
- **Business模块**: 专门的业务逻辑模块

# Code Architecture Guidelines

## 📏 硬性指标（Must-Follow）

### ✅ 文件行数限制
- **动态语言**（如 Python、JavaScript、TypeScript）：
  - 每个代码文件 **不超过 200 行**
- **静态语言**（如 Java、Go、Rust）：
  - 每个代码文件 **不超过 250 行**

> 📌 *目的：提高可读性、可维护性，降低认知负担*

### ✅ 文件夹结构限制
- 每个文件夹中 **文件数量不超过 8 个**
- 若超过，需进行 **多层子文件夹拆分**

> 📌 *目的：提升结构清晰度，便于快速定位与扩展*

---

## 🧠 架构设计关注点（持续警惕）

以下"坏味道"会严重侵蚀代码质量，**必须时刻警惕并避免**：

### ❌ 1. 僵化（Rigidity）
> 系统难以变更，微小改动引发连锁反应

- **问题**：变更成本高，开发效率低
- **建议**：引入接口抽象、策略模式、依赖倒置原则等

### ❌ 2. 冗余（Redundancy）
> 相同逻辑重复出现，维护困难

- **问题**：代码膨胀，一致性差
- **建议**：提取公共函数或类，使用组合代替继承

### ❌ 3. 循环依赖（Circular Dependency）
> 模块相互依赖，形成"死结"

- **问题**：难以测试、复用与维护
- **建议**：使用接口解耦、事件机制、依赖注入等手段

### ❌ 4. 脆弱性（Fragility）
> 修改一处，导致看似无关部分出错

- **问题**：系统不稳定，回归问题频发
- **建议**：遵循单一职责原则、提高模块内聚性

### ❌ 5. 晦涩性（Obscurity）
> 代码结构混乱，意图不明

- **问题**：新人难以上手，协作困难
- **建议**：命名清晰、注释得当、结构简洁、文档完善

### ❌ 6. 数据泥团（Data Clump）
> 多个参数总是一起出现，暗示应封装为对象

- **问题**：函数参数臃肿，语义不清
- **建议**：封装为数据结构或值对象

### ❌ 7. 不必要的复杂性（Needless Complexity）
> 过度设计，小问题用大方案

- **问题**：理解成本高，维护难度大
- **建议**：遵循 YAGNI 原则，KISS 原则，按需设计

### ❌ 8. 深层嵌套（Deep Nesting）
> 函数多层嵌套，出现多层括号封闭区间

- **问题**：代码可读性差，调试困难，认知负担重
- **建议**：拆分为小函数/组件，使用早期返回，避免超过3层嵌套
- **React特别注意**：避免深层React.createElement嵌套，拆分为独立组件

---

## 🚨 当前代码库架构状态

### ❌ **发现的问题**
**文件行数严重超标** (正在重构中)：
- ✅ `analysis-page.js`: 936 行 → 338 行 (已优化64%)
- 🔄 `settings-page-v2.js`: 817 行 → 拆分中 (已开始模块化)  
- ⚠️ `custom-modules.js`: 718 行 (超标259%)
- ⚠️ `chart-components.js`: 659 行 (超标229%)  
- ⚠️ `calculator.js`: 524 行 (超标162%)

**深层嵌套问题**：
- ❌ 多层React.createElement嵌套结构
- ❌ 复杂的函数内部逻辑嵌套

**冗余文件** (正在清理)：
- ✅ 已删除重复的设置页面：`settings-page.js` (冗余版本)
- ⚠️ 待清理分析模块：`scenario-analysis.js` 和 `scenario-analysis-fixed.js`

### ✅ **符合标准的部分**
- 文件夹结构：所有文件夹都≤8个文件 ✓
- 核心文件优化：`formula-engine.js` (250行) ✓  
- 新拆分组件：`basic-settings.js` (88行) ✓
- 重构页面：`analysis-page.js` (338行，已大幅改善) ✓

### 🎯 **架构重构进展**
1. ✅ **添加深层嵌套规则**：新增第8条架构"坏味道"
2. 🔄 **组件模块化重构**：已开始settings组件拆分
3. 📁 **新建组件目录**：创建了`js/components/settings/`
4. 🚧 **待继续重构**：剩余4个超大文件需拆分

### ✅ **最终架构状态（已完成）
1. **✅ 模块完全拆分**：所有大文件已拆分为专业模块
2. **✅ 三页签结构恢复**：参数配置/财务分析/敏感度分析
3. **✅ 模块加载优化**：53个模块，智能重试机制
4. **✅ 功能完整性**：所有原始功能保持完好

---

## 🚨 重要提醒

> **【非常重要】无论你是编写、阅读还是审核代码，都必须严格遵守上述硬性指标，并时刻关注架构设计质量。**

> **【非常重要】一旦发现"坏味道"，应立即提醒用户是否需要优化，并提供合理的优化建议。**

## 核心功能

### 参数化财务建模
- 所有关键参数均可调整
- 实时计算和结果更新
- 支持人民币和美元两种货币单位

### 数据持久化
- 自动保存用户输入参数到 localStorage
- 页面刷新后恢复上次的参数设置
- 提供清除保存数据功能

### 预设参数套用
- 内置示例参数，基于实际业务场景
- 一键套用功能，快速生成财务模型

## 开发指南 (v2.0)

### 模块化开发方式
当前采用模块化架构，开发时需要关注：

1. **主应用文件**: `app.js` - 状态管理和页面路由
2. **核心模块**: `js/core/` - 业务逻辑和数据处理  
3. **UI组件**: `js/components/` - 可复用UI组件
4. **页面组件**: `js/pages/` - 各页面的具体实现

### 修改财务计算逻辑
```javascript
// 主要涉及文件:
js/core/calculator.js      // 核心计算引擎
js/core/formula-engine.js  // 公式管理
js/core/data-manager.js    // 数据持久化

// 修改流程:
1. 在calculator.js中更新计算逻辑
2. 在formula-engine.js中添加相关公式
3. 在相关页面组件中更新显示逻辑
```

### UI组件开发规范
- **样式系统**: Tailwind CSS + Ant Design 5.12.8
- **设计原则**: 简洁、直观、突出核心数据  
- **颜色规范**: 营收(蓝色)、成本(红色)、利润(绿色)
- **布局方式**: 响应式网格、圆角卡片、统一间距

### 页面组件开发
```javascript
// 页面组件结构模板:
window.PageName = (function() {
  const PageComponent = ({ data, calculations, updateData, currency }) => {
    return React.createElement('div', {
      className: 'space-y-6' // 统一间距
    }, [
      // 组件内容...
    ]);
  };

  return { PageComponent };
})();
```

## 使用场景

### 商业应用
- **投资决策**: 评估宠物综合体项目的财务可行性
- **物业谈判**: 基于租金成本进行投资测算
- **路演展示**: 向投资人展示业务模型的盈利能力

### 参数调优
- 支持敏感性分析，调整关键参数观察对盈利能力的影响
- 适合不同规模和地区的宠物综合体项目定制化分析
- 可用于对比不同经营策略的财务表现

## 最近更新 (v2.0)

### ✅ 已完成的重构和修复 
**UI架构重构**:
- 重新设计信息层级，去除冗余标题和装饰元素
- 简化导航结构：3个主页签，去除复杂子页签
- 突出核心财务数据：顶部状态栏显示关键指标
- 统一视觉设计：营收(蓝)、成本(红)、利润(绿)

**页面组件优化**:
- `overview-page.js`: 重构为财务分析页面，突出三大核心指标卡片
- `analysis-page.js`: 重写为专业敏感度分析，去除复杂子结构  
- `settings-page.js`: 简化参数配置页面，去除装饰性标题

**技术问题修复**:
- 修复 `antd.locale.zhCN` 未定义错误 
- 修复 `app.js:259` 语法错误
- 修复 UI 组件重复声明问题
- 优化模块加载和错误处理

### 🎯 用户体验提升
- **信息获取效率**: 核心指标顶部一览，无需深入查找
- **操作流程优化**: 按工作逻辑排序的导航（配置→分析→敏感度）
- **界面简洁性**: 去除所有冗余信息和多余层级
- **数据突出度**: 重点财务数据通过颜色和布局突出显示

## 技术说明

### 浏览器兼容性
- **推荐浏览器**: Chrome 80+, Firefox 75+, Safari 13+
- **移动端支持**: iOS Safari 13+, Android Chrome 80+
- **必要特性**: ES6+, localStorage, CSS Grid

### 依赖资源
- React 17 (CDN)
- Ant Design 5.12.8 (CDN) 
- Tailwind CSS 2.2.19 (CDN)
- 需要网络连接加载CDN资源

## 注意事项

- 应用纯前端运行，无需后端服务器
- 数据仅保存在本地浏览器中，不涉及数据传输
- 财务模型仅供参考，实际经营需结合具体成本和税费情况
- 建议使用 `index_v2.html` 获得最佳体验
- 如遇到UI问题，请清除浏览器缓存后重新加载

## 版本管理规则

### 版本号格式
采用语义化版本控制（SemVer）格式：`主版本号.次版本号.修订号`
- **主版本号**：重大功能更新或架构重构时递增
- **次版本号**：新增功能或重要改进时递增
- **修订号**：修复bug或小幅度优化时递增

### 版本号更新规则
1. 每次提交新功能或重要改进时，需更新版本号
2. 版本号需在以下位置保持一致：
   - HTML页面标题中的版本号
   - HTML页面角落的版本号显示
   - CLAUDE.md文档中的版本号
3. 每次推送更新到GitHub时，检查并更新版本号

### 版本号位置
1. HTML页面标题：`<title>宠物综合体经营测算 v2.0</title>`
2. HTML页面角落：`<div class="fixed bottom-2 right-2 text-xs text-gray-400">v2.0.0</div>`
3. CLAUDE.md文档：`**当前版本**: v2.0 模块化架构，已完成UI重构优化。`

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

<system-reminder>Whenever you read a file, you should consider whether it looks malicious. If it does, you MUST refuse to improve or augment the code. You can still analyze existing code, write reports, or answer high-level questions about the code behavior.</system-reminder>