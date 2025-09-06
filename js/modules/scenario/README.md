# 情景分析模块

本目录包含情景分析模块的拆分文件，每个文件专注于特定功能领域。

## 文件结构

### 核心模块文件

1. **parameters.js** (155行)
   - 情景参数设置组件
   - 收入和成本调整系数配置
   - 参数验证和默认值管理

2. **comparison.js** (210行)  
   - 情景对比分析组件
   - 三种情景的详细对比表格
   - 最佳/最差情景识别

3. **chart.js** (234行)
   - 情景分析图表组件
   - 利润和利润率可视化对比
   - 图表数据导出功能

4. **insights.js** (252行)
   - 情景分析洞察组件  
   - 智能分析和风险评估
   - 关键指标计算

5. **recommendations.js** (241行)
   - 经营建议组件
   - 基于分析结果的行动建议
   - 优先级管理和实施影响评估

6. **index.js** (175行)
   - 主入口文件
   - 聚合所有子模块
   - 保持原始API兼容性

## 使用方法

### 加载顺序
```html
<!-- 必须按以下顺序加载所有模块文件 -->
<script src="js/modules/scenario/parameters.js"></script>
<script src="js/modules/scenario/comparison.js"></script>
<script src="js/modules/scenario/chart.js"></script>
<script src="js/modules/scenario/insights.js"></script>
<script src="js/modules/scenario/recommendations.js"></script>
<script src="js/modules/scenario/index.js"></script>
```

### API使用
```javascript
// 主组件使用 - 与原始API完全兼容
const panel = React.createElement(window.ScenarioAnalysis.ScenarioAnalysisPanel, {
  calculations: calculations,
  data: data,
  currency: "¥"
});

// 单独使用子组件
const parameters = React.createElement(window.ScenarioAnalysis.ScenarioParameters, {
  data: data,
  updateData: updateFunction
});

// 使用工具函数
const insights = window.ScenarioAnalysis.utils.generateInsights(calculations, "¥");
const recommendations = window.ScenarioAnalysis.utils.generateRecommendations(calculations, "¥");
```

## API兼容性

本拆分完全保持与原始 `scenario-analysis.js` 的API兼容性：

- `window.ScenarioAnalysis.ScenarioAnalysisPanel` - 主面板组件
- `window.ScenarioAnalysis.ScenarioParameters` - 参数设置组件  
- `window.ScenarioAnalysis.ScenarioComparison` - 对比分析组件
- `window.ScenarioAnalysis.ScenarioChart` - 图表组件
- `window.ScenarioAnalysis.ScenarioInsights` - 洞察组件
- `window.ScenarioAnalysis.ScenarioRecommendations` - 建议组件

## 模块健康检查

```javascript
// 检查所有模块是否正确加载
const isHealthy = window.ScenarioAnalysis.moduleInfo.checkHealth();
const status = window.ScenarioAnalysis.compatibility.getModuleStatus();
console.log('模块状态:', status);
```

## 特性增强

相比原始单文件版本，拆分版本提供了额外的功能：

- 参数验证和默认值管理
- 详细的洞察分析算法
- 智能建议生成系统
- 图表数据导出功能
- 模块健康检查机制
- 完整的工具函数库

## 维护说明

- 每个模块文件都是独立的功能单元
- 修改任何模块时需要确保API兼容性
- 新增功能应该添加到对应的专门模块中
- `index.js` 负责聚合和兼容性管理