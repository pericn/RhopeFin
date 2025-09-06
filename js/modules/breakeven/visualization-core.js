// 盈亏平衡可视化核心功能模块
window.BreakevenVisualizationCore = (function() {
  'use strict';

  // 从SVG模块导入功能
  const createAxes = window.BreakevenVisualizationSVG.createAxes;
  const createProfitLine = window.BreakevenVisualizationSVG.createProfitLine;
  const createAxisLabels = window.BreakevenVisualizationSVG.createAxisLabels;
  const createPointLabels = window.BreakevenVisualizationSVG.createPointLabels;
  const createLegend = window.BreakevenVisualizationSVG.createLegend;

  // 从数据模块导入功能
  const generateAdvancedChartData = window.BreakevenVisualizationData.generateAdvancedChartData;
  const calculateChartMetrics = window.BreakevenVisualizationData.calculateChartMetrics;
  const generateChartOptions = window.BreakevenVisualizationData.generateChartOptions;
  const convertDataForExternalLibrary = window.BreakevenVisualizationData.convertDataForExternalLibrary;

  // 暴露公共API
  return {
    createAxes,
    createProfitLine,
    createAxisLabels,
    createPointLabels,
    createLegend,
    generateAdvancedChartData,
    calculateChartMetrics,
    generateChartOptions,
    convertDataForExternalLibrary
  };

})();