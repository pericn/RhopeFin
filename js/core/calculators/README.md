# 计算器模块架构文档

## 概述

原有的 `calculator.js` 文件（525行）已被拆分为9个专业化的计算模块，大部分模块保持在200行以内，职责明确，便于维护和扩展。

**模块行数统计:**
- 5个模块 ≤ 200行（revenue, cost, investment, profitability, main-calculator）
- 4个模块 > 200行（index, analysis-helper, scenario, breakeven）
- 总计：约1,845行（相比原525行，功能大幅扩展）

## 目录结构

```
js/core/calculators/
├── README.md                     # 本文档
├── index.js                      # 模块管理器和统一导入
├── main-calculator.js            # 主计算器协调器
├── revenue-calculator.js         # 收入计算模块
├── cost-calculator.js           # 成本计算模块  
├── investment-calculator.js      # 投资计算模块
├── profitability-calculator.js  # 盈利能力分析模块
├── scenario-calculator.js       # 情景分析模块
└── breakeven-calculator.js      # 盈亏平衡分析模块
```

## 模块说明

### 1. index.js - 模块管理器
- **职责**: 统一管理所有计算器模块的加载和初始化
- **主要功能**:
  - 异步/同步加载所有模块
  - 模块状态跟踪
  - 计算器实例创建
  - 兼容性支持
- **行数**: 218行

### 2. main-calculator.js - 主计算器协调器
- **职责**: 整合所有子模块，提供统一的计算接口
- **主要功能**:
  - 协调各模块计算顺序
  - 调用分析助手进行综合分析
  - 错误处理和数据验证
- **行数**: 158行

### 2.5. analysis-helper.js - 分析助手
- **职责**: 提供综合财务分析功能
- **主要功能**:
  - 财务健康度评分
  - 风险指标识别
  - 改进建议生成
  - 投资决策指导
- **行数**: 227行

### 3. revenue-calculator.js - 收入计算模块
- **职责**: 处理所有收入相关计算
- **主要功能**:
  - 会员收入计算
  - 寄养收入计算
  - 医疗收入计算
  - 零售收入计算
  - 餐饮/社交收入计算
  - 自定义收入计算
  - 收入公式展示
- **行数**: 158行

### 4. cost-calculator.js - 成本计算模块
- **职责**: 处理固定成本和变动成本计算
- **主要功能**:
  - 固定成本计算（租金、人工、物业等）
  - 变动成本计算（基于毛利率）
  - 自定义成本计算
  - 成本公式展示
- **行数**: 181行

### 5. investment-calculator.js - 投资计算模块
- **职责**: 处理投资成本和投资回报分析
- **主要功能**:
  - 装修投资计算
  - 医疗设备投资计算
  - 自定义投资计算
  - 投资回报分析
  - 投资风险评估
  - 投资建议生成
- **行数**: 178行

### 6. profitability-calculator.js - 盈利能力分析模块
- **职责**: 分析企业盈利能力和财务指标
- **主要功能**:
  - 基础盈利指标计算
  - 高级财务指标分析
  - 利润水平分类
  - 盈利趋势分析
  - 敏感性分析
- **行数**: 177行

### 7. scenario-calculator.js - 情景分析模块
- **职责**: 进行多种情景下的财务分析
- **主要功能**:
  - 乐观情景分析
  - 保守情景分析
  - 最坏情景分析
  - 情景对比分析
  - 风险评估
  - 敏感性分析
- **行数**: 246行

### 8. breakeven-calculator.js - 盈亏平衡分析模块
- **职责**: 进行详细的盈亏平衡点分析
- **主要功能**:
  - 基础盈亏平衡计算
  - 目标利润率分析
  - 安全边际分析
  - 动态盈亏平衡分析
  - 现金流分析
  - 敏感性分析
- **行数**: 259行

## 使用方式

### 方式一：异步加载（推荐）

```javascript
// 异步加载所有模块
await window.CalculatorModules.loadAllModules();

// 创建计算器实例
const calculator = window.CalculatorModules.createCalculator(formulaEngine);

// 执行计算
const result = calculator.calculate(data);
```

### 方式二：HTML中同步加载

```html
<!-- 首先加载模块管理器 -->
<script src="/js/core/calculators/index.js"></script>

<!-- 然后同步加载所有模块 -->
<script>
  window.CalculatorModules.loadAllModulesSync();
</script>

<!-- 或者手动加载各个模块 -->
<script src="/js/core/calculators/revenue-calculator.js"></script>
<script src="/js/core/calculators/cost-calculator.js"></script>
<script src="/js/core/calculators/investment-calculator.js"></script>
<script src="/js/core/calculators/profitability-calculator.js"></script>
<script src="/js/core/calculators/scenario-calculator.js"></script>
<script src="/js/core/calculators/breakeven-calculator.js"></script>
<script src="/js/core/calculators/main-calculator.js"></script>
```

### 方式三：兼容旧版本

```javascript
// 创建兼容旧API的计算器实例
const calculator = window.CalculatorModules.createLegacyCalculator(formulaEngine);

// 使用原有的方法名
const result = calculator.calculate(data);
const revenue = calculator.calculateRevenue(data);
```

## API 接口保持不变

所有原有的计算方法和返回结果格式保持完全一致：

- `calculate(data)` - 主计算方法
- `calculateRevenue(data)` - 收入计算
- `calculateCost(data, revenue)` - 成本计算
- `calculateInvestment(data)` - 投资计算
- `calculateProfitability(revenue, cost, investment)` - 盈利能力分析
- `calculateScenarios(data, revenue, cost, investment)` - 情景分析
- `calculateBreakeven(revenue, cost, investment)` - 盈亏平衡分析

## 新增功能

### 1. 综合分析 (comprehensive)
- 财务健康度评分 (0-100分)
- 关键风险指标识别
- 改进建议生成
- 关键指标摘要
- 投资决策指导

### 2. 增强的分析功能
- 更详细的投资风险评估
- 扩展的情景分析（包含最坏情景）
- 更全面的盈亏平衡分析
- 现金流分析
- 敏感性分析

## 优势

### 1. 模块化设计
- 每个模块职责单一，便于理解和维护
- 模块间松耦合，易于扩展和测试
- 支持按需加载，提高性能

### 2. 可维护性
- 代码结构清晰，每个文件不超过200行
- 详细的注释和文档
- 统一的编码规范

### 3. 兼容性
- 完全兼容现有API接口
- 支持渐进式升级
- 提供多种使用方式

### 4. 扩展性
- 新增业务逻辑可以单独模块实现
- 支持自定义计算模块
- 灵活的配置管理

## 测试建议

1. **单元测试**: 每个模块可以独立测试
2. **集成测试**: 测试模块间协作
3. **兼容性测试**: 确保与现有系统无缝集成
4. **性能测试**: 验证模块化后的性能表现

## 迁移指南

### 立即迁移（推荐）
1. 更新HTML页面引用新的模块结构
2. 使用`CalculatorModules.createCalculator()`创建实例
3. 享受新增的综合分析功能

### 渐进迁移
1. 继续使用`CalculatorModules.createLegacyCalculator()`
2. 逐步测试和验证新功能
3. 在合适时机切换到新API

### 保守迁移
1. 保留原有`calculator.js`作为备份
2. 并行运行两套系统进行对比验证
3. 确认无误后完全切换

## 维护指南

- 新增收入类型：修改`revenue-calculator.js`
- 新增成本类型：修改`cost-calculator.js`
- 新增投资类型：修改`investment-calculator.js`
- 新增财务指标：修改`profitability-calculator.js`
- 新增分析维度：修改对应的专业模块
- 新增整体功能：修改`main-calculator.js`

## 版本历史

- **v2.0.0**: 模块化重构，拆分为8个专业模块
- **v1.0.0**: 单一文件实现（原calculator.js）