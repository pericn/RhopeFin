// 盈亏平衡分析模块 - 主入口文件
// 聚合所有盈亏平衡分析子模块，提供统一的API接口

window.BreakevenAnalysis = (function() {
  'use strict';

  /**
   * 主要盈亏平衡分析组件
   * 整合所有子模块功能，提供完整的盈亏平衡分析面板
   * @param {Object} props - 组件属性
   * @param {Object} props.calculations - 财务计算数据
   * @param {Object} props.data - 原始财务数据
   * @param {string} props.currency - 货币符号，默认为"¥"
   * @returns {React.Element} React 组件
   */
  const BreakevenAnalysisPanel = ({ calculations, data, currency = "¥" }) => {
    if (!calculations || !calculations.breakeven) return null;

    const breakeven = calculations.breakeven;
    const currentRevenue = calculations.revenue?.total || 0;
    const currentCost = calculations.cost?.total || 0;
    const currentProfit = currentRevenue - currentCost;

    return React.createElement('div', {
      className: 'space-y-6'
    }, [
      // 标题
      React.createElement('h2', {
        key: 'title',
        className: 'text-xl font-bold text-gray-800'
      }, '⚖️ 盈亏平衡分析'),

      // 关键指标概览
      React.createElement('div', {
        key: 'overview',
        className: 'grid grid-cols-1 md:grid-cols-3 gap-4'
      }, [
        React.createElement(window.UIComponents.KPI, {
          key: 'current-margin',
          title: '当前净利润率',
          value: breakeven.currentMargin,
          format: 'percent',
          color: breakeven.currentMargin > 0 ? 'green' : 'red'
        }),
        React.createElement(window.UIComponents.KPI, {
          key: 'breakeven-revenue',
          title: '盈亏平衡收入',
          value: breakeven.breakEvenRevenue,
          format: 'currency',
          color: 'blue'
        }),
        React.createElement(window.UIComponents.KPI, {
          key: 'revenue-gap',
          title: '收入缺口',
          value: breakeven.revenueGap,
          format: 'currency',
          color: breakeven.revenueGap > 0 ? 'red' : 'green'
        })
      ]),

      // 风险承受能力分析
      React.createElement(window.BreakevenRiskTolerance.RiskToleranceAnalysis, {
        key: 'risk-analysis',
        breakeven: breakeven,
        currency: currency
      }),

      // 目标利润率分析
      React.createElement(window.BreakevenTargetMargin.TargetMarginAnalysis, {
        key: 'target-analysis',
        breakeven: breakeven,
        currentRevenue: currentRevenue,
        currency: currency
      }),

      // 敏感性分析
      React.createElement(window.BreakevenSensitivity.SensitivityAnalysis, {
        key: 'sensitivity-analysis',
        breakeven: breakeven,
        currency: currency
      }),

      // 可视化图表
      React.createElement(window.BreakevenVisualization.BreakevenVisualization, {
        key: 'visualization',
        calculations: calculations,
        currency: currency
      })
    ]);
  };

  // 从核心分析模块暴露功能
  const calculateBreakevenAnalysis = window.BreakevenAnalysisCore.calculateBreakevenAnalysis;
  const getBreakevenInsights = window.BreakevenAnalysisCore.getBreakevenInsights;
  const exportAnalysisReport = window.BreakevenAnalysisCore.exportAnalysisReport;

  // 暴露公共API，保持与原模块完全兼容
  return {
    // 主要组件（保持原API）
    BreakevenAnalysisPanel,
    
    // 子组件（通过子模块暴露）
    RiskToleranceAnalysis: window.BreakevenRiskTolerance.RiskToleranceAnalysis,
    TargetMarginAnalysis: window.BreakevenTargetMargin.TargetMarginAnalysis,
    SensitivityAnalysis: window.BreakevenSensitivity.SensitivityAnalysis,
    BreakevenVisualization: window.BreakevenVisualization.BreakevenVisualization,
    
    // 计算和分析功能（新增）
    calculateBreakevenAnalysis,
    getBreakevenInsights,
    exportAnalysisReport,
    
    // 子模块直接访问（用于高级用法）
    modules: {
      utils: window.BreakevenUtils,
      riskTolerance: window.BreakevenRiskTolerance,
      targetMargin: window.BreakevenTargetMargin,
      sensitivity: window.BreakevenSensitivity,
      visualization: window.BreakevenVisualization,
      analysisCore: window.BreakevenAnalysisCore,
      visualizationCore: window.BreakevenVisualizationCore,
      visualizationInsights: window.BreakevenVisualizationInsights
    }
  };

})();