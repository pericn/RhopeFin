// 盈亏平衡可视化数据处理模块
window.BreakevenVisualizationData = (function() {
  'use strict';

  /**
   * 生成高级图表数据用于更复杂的可视化
   * @param {Object} calculations - 财务计算数据
   * @param {number} steps - 数据点数量
   * @returns {Object} 高级图表数据
   */
  const generateAdvancedChartData = (calculations, steps = 20) => {
    const revenue = calculations.revenue?.total || 0;
    const totalCost = (calculations.cost?.fixed.total || 0) + (calculations.cost?.variable.total || 0);
    const maxRevenue = Math.max(revenue, totalCost) * 2;
    
    const data = {
      revenue: [],
      cost: [],
      profit: [],
      margin: []
    };
    
    for (let i = 0; i <= steps; i++) {
      const currentRevenue = (maxRevenue / steps) * i;
      const currentProfit = currentRevenue - totalCost;
      const currentMargin = currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0;
      
      data.revenue.push(currentRevenue);
      data.cost.push(totalCost);
      data.profit.push(currentProfit);
      data.margin.push(currentMargin);
    }
    
    return data;
  };

  /**
   * 计算图表关键指标
   * @param {Object} calculations - 财务计算数据
   * @returns {Object} 图表关键指标
   */
  const calculateChartMetrics = (calculations) => {
    const revenue = calculations.revenue?.total || 0;
    const totalCost = (calculations.cost?.fixed.total || 0) + (calculations.cost?.variable.total || 0);
    
    return {
      breakevenRevenue: totalCost,
      currentRevenue: revenue,
      currentProfit: revenue - totalCost,
      profitMargin: revenue > 0 ? ((revenue - totalCost) / revenue) * 100 : 0,
      revenueGap: Math.max(0, totalCost - revenue),
      profitBuffer: Math.max(0, revenue - totalCost)
    };
  };

  /**
   * 生成图表配置选项
   * @param {Object} options - 自定义选项
   * @returns {Object} 图表配置
   */
  const generateChartOptions = (options = {}) => {
    return {
      width: options.width || 400,
      height: options.height || 300,
      margin: options.margin || { top: 20, right: 20, bottom: 60, left: 40 },
      colors: {
        profitLine: options.profitColor || '#10B981',
        breakevenLine: options.breakevenColor || '#EF4444',
        currentPoint: options.currentColor || '#3B82F6',
        breakevenPoint: options.breakevenPointColor || '#F59E0B'
      },
      showGrid: options.showGrid !== false,
      showLabels: options.showLabels !== false
    };
  };

  /**
   * 转换数据用于外部图表库
   * @param {Object} chartData - 内部图表数据
   * @param {string} format - 输出格式 ('chartjs', 'd3', 'plotly')
   * @returns {Object} 转换后的数据
   */
  const convertDataForExternalLibrary = (chartData, format = 'chartjs') => {
    switch (format) {
      case 'chartjs':
        return {
          labels: chartData.revenue.map((r, i) => `${(r / 1000).toFixed(0)}K`),
          datasets: [
            {
              label: '利润',
              data: chartData.profit,
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true
            },
            {
              label: '成本线',
              data: chartData.cost,
              borderColor: '#EF4444',
              borderDash: [5, 5],
              fill: false
            }
          ]
        };
      
      case 'd3':
        return chartData.revenue.map((revenue, i) => ({
          revenue,
          profit: chartData.profit[i],
          cost: chartData.cost[i],
          margin: chartData.margin[i]
        }));
      
      case 'plotly':
        return [
          {
            x: chartData.revenue,
            y: chartData.profit,
            type: 'scatter',
            mode: 'lines',
            name: '利润线',
            line: { color: '#10B981' }
          },
          {
            x: chartData.revenue,
            y: chartData.cost,
            type: 'scatter',
            mode: 'lines',
            name: '成本线',
            line: { color: '#EF4444', dash: 'dash' }
          }
        ];
      
      default:
        return chartData;
    }
  };

  // 暴露公共API
  return {
    generateAdvancedChartData,
    calculateChartMetrics,
    generateChartOptions,
    convertDataForExternalLibrary
  };

})();