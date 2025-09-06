// 盈亏平衡洞察分析模块
window.BreakevenInsightsAnalysis = (function() {
  'use strict';

  /**
   * 分析盈亏平衡位置
   * @param {Object} metrics - 图表指标
   * @returns {Object} 盈亏平衡位置分析
   */
  const analyzeBreakevenPosition = (metrics) => {
    const position = {
      distance: Math.abs(metrics.currentRevenue - metrics.breakevenRevenue),
      percentage: metrics.breakevenRevenue > 0 ? 
        (Math.abs(metrics.currentRevenue - metrics.breakevenRevenue) / metrics.breakevenRevenue) * 100 : 0,
      direction: metrics.currentRevenue > metrics.breakevenRevenue ? 'above' : 'below'
    };

    position.status = getBreakevenStatus(position.direction, position.percentage);
    
    return position;
  };

  /**
   * 分析利润趋势
   * @param {Object} chartData - 图表数据
   * @returns {Object} 利润趋势分析
   */
  const analyzeProfitTrend = (chartData) => {
    if (!chartData.profit || chartData.profit.length < 2) {
      return { trend: 'unknown', slope: 0 };
    }

    const profits = chartData.profit;
    const revenues = chartData.revenue;
    
    // 计算利润对收入的斜率（边际利润率）
    const marginalProfitability = calculateMarginalProfitability(revenues, profits);
    
    return {
      trend: marginalProfitability > 0 ? 'improving' : 'deteriorating',
      slope: marginalProfitability,
      interpretation: interpretMarginalProfitability(marginalProfitability)
    };
  };

  /**
   * 计算边际盈利能力
   * @param {Array} revenues - 收入数组
   * @param {Array} profits - 利润数组
   * @returns {number} 边际盈利能力
   */
  const calculateMarginalProfitability = (revenues, profits) => {
    if (revenues.length < 2) return 0;
    
    const revenueChange = revenues[revenues.length - 1] - revenues[0];
    const profitChange = profits[profits.length - 1] - profits[0];
    
    return revenueChange !== 0 ? profitChange / revenueChange : 0;
  };

  /**
   * 解释边际盈利能力
   * @param {number} marginalProfitability - 边际盈利能力
   * @returns {string} 解释说明
   */
  const interpretMarginalProfitability = (marginalProfitability) => {
    if (marginalProfitability >= 0.8) return '每增加1元收入带来超过0.8元净利润，盈利能力极强';
    if (marginalProfitability >= 0.5) return '每增加1元收入带来0.5-0.8元净利润，盈利能力良好';
    if (marginalProfitability >= 0.2) return '每增加1元收入带来0.2-0.5元净利润，盈利能力一般';
    if (marginalProfitability > 0) return '每增加1元收入带来少于0.2元净利润，盈利能力较弱';
    return '收入增加无法带来净利润增长，存在结构性问题';
  };

  /**
   * 获取盈亏平衡状态描述
   * @param {string} direction - 方向 (above/below)
   * @param {number} percentage - 百分比距离
   * @returns {string} 状态描述
   */
  const getBreakevenStatus = (direction, percentage) => {
    if (direction === 'above') {
      if (percentage > 50) return '远超盈亏平衡点';
      if (percentage > 20) return '明显超过盈亏平衡点';
      if (percentage > 5) return '略超盈亏平衡点';
      return '接近盈亏平衡点';
    } else {
      if (percentage > 50) return '远低于盈亏平衡点';
      if (percentage > 20) return '明显低于盈亏平衡点';
      if (percentage > 5) return '略低于盈亏平衡点';
      return '接近盈亏平衡点';
    }
  };

  /**
   * 生成可视化推荐建议
   * @param {Object} metrics - 图表指标
   * @param {string} currency - 货币符号
   * @returns {Array} 推荐建议数组
   */
  const generateVisualizationRecommendations = (metrics, currency) => {
    const recommendations = [];
    
    // 基于当前盈利状态的建议
    if (metrics.currentProfit < 0) {
      recommendations.push({
        type: 'urgent',
        title: '立即行动',
        message: `当前亏损 ${currency}${Math.abs(metrics.currentProfit).toLocaleString()}`,
        actions: [
          `需增加收入 ${currency}${metrics.revenueGap.toLocaleString()} 达到盈亏平衡`,
          '审查成本结构，寻找削减机会',
          '制定紧急增收计划'
        ]
      });
    } else if (metrics.currentProfit > 0 && metrics.profitMargin < 10) {
      recommendations.push({
        type: 'caution',
        title: '利润率偏低',
        message: `虽然盈利但利润率仅 ${metrics.profitMargin.toFixed(1)}%`,
        actions: [
          '寻找提升利润率的机会',
          '优化产品或服务组合',
          '考虑适当提价策略'
        ]
      });
    } else if (metrics.profitMargin > 20) {
      recommendations.push({
        type: 'positive',
        title: '盈利状况良好',
        message: `利润率达到 ${metrics.profitMargin.toFixed(1)}%`,
        actions: [
          '可考虑扩大投资规模',
          '建立更多盈利缓冲',
          '探索新的增长机会'
        ]
      });
    }
    
    return recommendations;
  };

  /**
   * 生成可视化洞察报告
   * @param {Object} chartData - 图表数据
   * @param {Object} chartMetrics - 图表指标
   * @param {string} currency - 货币符号
   * @returns {Object} 洞察报告
   */
  const generateVisualizationInsights = (chartData, chartMetrics, currency) => {
    const insights = {
      status: chartMetrics.currentProfit > 0 ? 'profitable' : 'loss',
      breakevenAnalysis: analyzeBreakevenPosition(chartMetrics),
      trendAnalysis: analyzeProfitTrend(chartData),
      recommendations: generateVisualizationRecommendations(chartMetrics, currency)
    };

    return insights;
  };

  // 暴露公共API
  return {
    analyzeBreakevenPosition,
    analyzeProfitTrend,
    generateVisualizationRecommendations,
    generateVisualizationInsights
  };

})();