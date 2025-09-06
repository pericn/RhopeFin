// 盈亏平衡可视化洞察面板模块
window.BreakevenVisualizationInsights = (function() {
  'use strict';

  /**
   * 创建洞察面板
   * @param {Object} breakevenPoint - 盈亏平衡点
   * @param {Object} currentPoint - 当前状态点
   * @param {string} currency - 货币符号
   * @returns {Array} 洞察面板元素数组
   */
  const createInsightPanels = (breakevenPoint, currentPoint, currency) => {
    return [
      // 盈亏平衡点洞察
      React.createElement('div', {
        key: 'breakeven-insight',
        className: 'bg-yellow-50 rounded-lg p-4'
      }, [
        React.createElement('h5', {
          key: 'title',
          className: 'font-medium text-yellow-800 mb-2'
        }, '盈亏平衡点'),
        React.createElement('div', {
          key: 'value',
          className: 'text-lg font-bold text-yellow-700'
        }, `${currency}${breakevenPoint.revenue.toLocaleString()}`),
        React.createElement('div', {
          key: 'description',
          className: 'text-sm text-yellow-600'
        }, '达到此收入水平开始盈利')
      ]),

      // 当前状态洞察
      React.createElement('div', {
        key: 'current-insight',
        className: `rounded-lg p-4 ${currentPoint.profit > 0 ? 'bg-green-50' : 'bg-red-50'}`
      }, [
        React.createElement('h5', {
          key: 'title',
          className: `font-medium mb-2 ${currentPoint.profit > 0 ? 'text-green-800' : 'text-red-800'}`
        }, '当前状态'),
        React.createElement('div', {
          key: 'value',
          className: `text-lg font-bold ${currentPoint.profit > 0 ? 'text-green-700' : 'text-red-700'}`
        }, currentPoint.profit > 0 ? '盈利中' : '亏损中'),
        React.createElement('div', {
          key: 'amount',
          className: `text-sm ${currentPoint.profit > 0 ? 'text-green-600' : 'text-red-600'}`
        }, `${currency}${Math.abs(currentPoint.profit).toLocaleString()}`)
      ]),

      // 收入缺口/盈利缓冲洞察
      React.createElement('div', {
        key: 'gap-insight',
        className: 'bg-blue-50 rounded-lg p-4'
      }, [
        React.createElement('h5', {
          key: 'title',
          className: 'font-medium text-blue-800 mb-2'
        }, currentPoint.profit > 0 ? '盈利缓冲' : '收入缺口'),
        React.createElement('div', {
          key: 'value',
          className: 'text-lg font-bold text-blue-700'
        }, `${currency}${Math.abs(currentPoint.revenue - breakevenPoint.revenue).toLocaleString()}`),
        React.createElement('div', {
          key: 'description',
          className: 'text-sm text-blue-600'
        }, currentPoint.profit > 0 ? '超出盈亏平衡点的收入' : '距离盈亏平衡点的收入差距')
      ])
    ];
  };

  // 从分析模块导入功能
  const generateVisualizationInsights = window.BreakevenInsightsAnalysis.generateVisualizationInsights;
  const analyzeBreakevenPosition = window.BreakevenInsightsAnalysis.analyzeBreakevenPosition;
  const analyzeProfitTrend = window.BreakevenInsightsAnalysis.analyzeProfitTrend;

  // 暴露公共API
  return {
    createInsightPanels,
    generateVisualizationInsights,
    analyzeBreakevenPosition,
    analyzeProfitTrend
  };

})();