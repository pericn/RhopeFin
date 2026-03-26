// 盈亏平衡可视化模块 - 主组件
window.BreakevenVisualization = (function() {
  'use strict';

  /**
   * 盈亏平衡可视化图表组件
   * 提供可视化的盈亏平衡分析图表
   * @param {Object} props - 组件属性
   * @param {Object} props.calculations - 计算数据
   * @param {string} props.currency - 货币符号
   * @returns {React.Element} React 组件
   */
  const BreakevenVisualization = ({ calculations, currency }) => {
    if (!calculations) return null;

    const revenue = calculations.revenue?.total || 0;
    const fixedCost = calculations.cost?.fixed.total || 0;
    const variableCost = calculations.cost?.variable.total || 0;
    const totalCost = fixedCost + variableCost;

    // 创建图表数据点
    const maxRevenue = Math.max(revenue, totalCost) * 1.5;
    const dataPoints = window.BreakevenUtils.createChartDataPoints(maxRevenue, totalCost, 10);

    // 找到盈亏平衡点
    const breakevenPoint = window.BreakevenUtils.findBreakevenPoint(dataPoints, totalCost);

    // 当前状态点
    const currentPoint = {
      revenue: revenue,
      profit: revenue - totalCost
    };

    return React.createElement(window.UIComponents.Section, {
      title: '盈亏平衡可视化',
      className: 'col-span-full'
    }, [
      // 图表容器
      React.createElement('div', {
        key: 'chart-container',
        className: 'bg-white rounded-lg p-6'
      }, [
        // SVG 图表
        React.createElement('div', {
          key: 'chart',
          className: 'relative h-80'
        }, [
          React.createElement('svg', {
            key: 'svg',
            className: 'w-full h-full',
            viewBox: '0 0 400 300'
          }, [
            // 坐标轴
            ...window.BreakevenVisualizationCore.createAxes(),

            // 零线（盈亏平衡基准线）
            React.createElement('line', {
              key: 'zero-line',
              x1: '40',
              y1: '140',
              x2: '380',
              y2: '140',
              stroke: '#9CA3AF',
              strokeWidth: '1',
              strokeDasharray: '5,5'
            }),

            // 盈亏平衡线
            React.createElement('line', {
              key: 'breakeven-line',
              x1: '40',
              y1: '260',
              x2: '380',
              y2: '20',
              stroke: '#EF4444',
              strokeWidth: '2',
              strokeDasharray: '8,4'
            }),

            // 利润线
            ...window.BreakevenVisualizationCore.createProfitLine(dataPoints, maxRevenue),

            // 盈亏平衡点
            React.createElement('circle', {
              key: 'breakeven-point',
              cx: (40 + (breakevenPoint.revenue / maxRevenue) * 340).toString(),
              cy: '140',
              r: '5',
              fill: '#F59E0B',
              stroke: '#fff',
              strokeWidth: '2'
            }),

            // 当前状态点
            React.createElement('circle', {
              key: 'current-point',
              cx: (40 + (currentPoint.revenue / maxRevenue) * 340).toString(),
              cy: (140 - (currentPoint.profit / maxRevenue) * 120).toString(),
              r: '6',
              fill: currentPoint.profit > 0 ? '#10B981' : '#EF4444',
              stroke: '#fff',
              strokeWidth: '2'
            }),

            // 坐标轴标签
            ...window.BreakevenVisualizationCore.createAxisLabels(),

            // 点标注
            ...window.BreakevenVisualizationCore.createPointLabels(breakevenPoint, currentPoint, maxRevenue)
          ])
        ]),

        // 图例
        React.createElement('div', {
          key: 'legend',
          className: 'mt-4 flex justify-center space-x-6 text-sm'
        }, window.BreakevenVisualizationCore.createLegend(currentPoint))
      ]),

      // 洞察面板
      React.createElement('div', {
        key: 'insights',
        className: 'mt-4 grid grid-cols-1 md:grid-cols-3 gap-4'
      }, window.BreakevenVisualizationInsights.createInsightPanels(breakevenPoint, currentPoint, currency))
    ]);
  };

  // 从核心模块暴露功能
  const generateAdvancedChartData = window.BreakevenVisualizationCore.generateAdvancedChartData;
  const calculateChartMetrics = window.BreakevenVisualizationCore.calculateChartMetrics;

  // 从洞察模块暴露功能
  const generateVisualizationInsights = window.BreakevenVisualizationInsights.generateVisualizationInsights;
  const analyzeBreakevenPosition = window.BreakevenVisualizationInsights.analyzeBreakevenPosition;

  // 暴露公共API
  return {
    BreakevenVisualization,
    generateAdvancedChartData,
    calculateChartMetrics,
    generateVisualizationInsights,
    analyzeBreakevenPosition
  };

})();