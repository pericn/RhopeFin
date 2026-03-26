// 图表组件库统一入口 - 直接注册全局对象
(function() {
  'use strict';
  
  // 直接创建ChartComponents全局对象
  window.ChartComponents = {};
  
  // 从各个独立模块中获取组件并直接注册
  if (window.RevenueChart && window.RevenueChart.RevenueStructureChart) {
    window.ChartComponents.RevenueStructureChart = window.RevenueChart.RevenueStructureChart;
  }
  
  if (window.CostChart && window.CostChart.CostStructureChart) {
    window.ChartComponents.CostStructureChart = window.CostChart.CostStructureChart;
  }
  
  if (window.BreakevenChart && window.BreakevenChart.BreakevenChart) {
    window.ChartComponents.BreakevenChart = window.BreakevenChart.BreakevenChart;
  }
  
  if (window.ScenarioChart && window.ScenarioChart.ScenarioComparisonChart) {
    window.ChartComponents.ScenarioComparisonChart = window.ScenarioChart.ScenarioComparisonChart;
  }
  
  if (window.BreakevenSVGChart && window.BreakevenSVGChart.BreakevenSVGChart) {
    window.ChartComponents.BreakevenSVGChart = window.BreakevenSVGChart.BreakevenSVGChart;
  }
  
  if (window.MarginChart && window.MarginChart.MarginComparisonChart) {
    window.ChartComponents.MarginComparisonChart = window.MarginChart.MarginComparisonChart;
  }
  
  // 记录注册状态
  const registered = [];
  const missing = [];
  
  const expectedComponents = [
    'RevenueStructureChart',
    'CostStructureChart', 
    'BreakevenChart',
    'ScenarioComparisonChart',
    'BreakevenSVGChart',
    'MarginComparisonChart'
  ];
  
  expectedComponents.forEach(function(key) {
    if (window.ChartComponents[key]) {
      registered.push(key);
    } else {
      missing.push(key);
    }
  });
  
  if (window.DEBUG_MODE) {
    console.log('Charts initialized:', registered.length + '/' + Object.keys(expectedComponents).length);
    if (missing.length > 0) console.warn('Missing:', missing);
  }

})();