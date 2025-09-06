# 图表组件库 - 使用说明

本目录包含Hopeful Finance项目的所有图表可视化组件，已从原始的单文件架构重构为模块化的独立组件。

## 文件结构

```
js/components/charts/
├── index.js                 # 统一索引文件
├── revenue-chart.js         # 收入结构分析图表
├── cost-chart.js           # 成本结构分析图表  
├── breakeven-chart.js      # 盈亏平衡分析图表
├── scenario-chart.js       # 情景对比分析图表
├── breakeven-svg-chart.js  # SVG动态盈亏平衡图
├── margin-chart.js         # 毛利率对比图表
└── README.md               # 本说明文件
```

## 组件详情

### 1. RevenueStructureChart (收入结构分析)
- **文件**: `revenue-chart.js` 
- **功能**: 展示各收入板块占比的可视化图表
- **特性**: 进度条显示、百分比计算、金额格式化

### 2. CostStructureChart (成本结构分析)  
- **文件**: `cost-chart.js`
- **功能**: 显示固定成本和变动成本的占比分析
- **特性**: 分层成本展示、明细项目显示

### 3. BreakevenChart (盈亏平衡分析)
- **文件**: `breakeven-chart.js`
- **功能**: 对比显示总收入与总成本
- **特性**: 盈利状态指示、净利润计算

### 4. ScenarioComparisonChart (情景对比分析)
- **文件**: `scenario-chart.js` 
- **功能**: 展示保守、基础、乐观三种情况对比
- **特性**: 利润率显示、盈亏状态标识

### 5. BreakevenSVGChart (SVG动态盈亏平衡图)
- **文件**: `breakeven-svg-chart.js`
- **功能**: 使用SVG绘制收入-利润关系图
- **特性**: 动态坐标系、平衡线显示、当前状态标注

### 6. MarginComparisonChart (毛利率对比)  
- **文件**: `margin-chart.js`
- **功能**: 横向展示各业务板块毛利率
- **特性**: 百分比进度条、颜色编码

## 使用方式

### 方式一：使用统一索引（推荐）

```html
<!-- 引入所有独立组件 -->
<script src="js/components/charts/revenue-chart.js"></script>
<script src="js/components/charts/cost-chart.js"></script>
<script src="js/components/charts/breakeven-chart.js"></script>
<script src="js/components/charts/scenario-chart.js"></script>
<script src="js/components/charts/breakeven-svg-chart.js"></script>
<script src="js/components/charts/margin-chart.js"></script>

<!-- 引入索引文件 -->
<script src="js/components/charts/index.js"></script>

<script>
// 使用统一索引访问组件
const { RevenueStructureChart } = window.Charts;
</script>
```

### 方式二：直接使用独立组件

```html
<!-- 只引入需要的组件 -->
<script src="js/components/charts/revenue-chart.js"></script>

<script>
// 直接访问组件
const { RevenueStructureChart } = window.RevenueChart;
</script>
```

### 方式三：保持原有兼容性

```html
<!-- 引入所有独立组件 -->
<script src="js/components/charts/revenue-chart.js"></script>
<script src="js/components/charts/cost-chart.js"></script>
<script src="js/components/charts/breakeven-chart.js"></script>
<script src="js/components/charts/scenario-chart.js"></script>
<script src="js/components/charts/breakeven-svg-chart.js"></script>
<script src="js/components/charts/margin-chart.js"></script>

<!-- 引入重构后的聚合文件（向后兼容） -->
<script src="js/components/chart-components.js"></script>

<script>
// 使用原有方式访问（完全兼容）
const { RevenueStructureChart } = window.ChartComponents;
</script>
```

## 组件API

所有图表组件都遵循相同的调用模式：

```javascript
// 基本用法
React.createElement(ComponentName, {
  calculations: calculationData,  // 财务计算数据
  currency: "¥"                  // 货币符号（可选，默认为¥）
});
```

### 数据格式要求

```javascript
const calculations = {
  revenue: {
    total: 1000000,
    member: 300000,
    boarding: 250000,
    medical: 200000,
    retail: 150000,
    cafe: 80000,
    custom: 20000
  },
  cost: {
    total: 800000,
    fixed: {
      total: 500000,
      rent: 200000,
      staff: 200000,
      property: 100000
    },
    variable: {
      total: 300000
    },
    margins: {
      members: 70,
      boarding: 60,
      medical: 80,
      retail: 40,
      cafe: 50
    }
  },
  scenarios: {
    conservative: { profit: 100000, margin: 10 },
    optimistic: { profit: 300000, margin: 25 }
  },
  profitability: {
    profit: 200000,
    margin: 20
  },
  breakeven: { /* 平衡点数据 */ }
};
```

## 性能考虑

1. **按需加载**: 只引入需要使用的组件文件
2. **缓存友好**: 每个组件文件独立，便于浏览器缓存
3. **体积控制**: 单个组件文件均小于200行，便于维护

## 维护说明

1. 修改单个图表功能时，只需编辑对应的独立文件
2. 新增图表组件时，创建新的独立文件并更新index.js
3. 删除图表组件时，移除对应文件并更新相关引用
4. 保持向后兼容性，确保原有引用方式仍然有效