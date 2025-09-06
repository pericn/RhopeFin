// 盈亏平衡分析工具函数模块
window.BreakevenUtils = (function() {
  'use strict';

  /**
   * 根据最大收入下降百分比获取风险等级
   * @param {number} maxDecreasePercent - 最大收入下降百分比
   * @returns {string} 风险等级描述
   */
  const getRiskLevel = (maxDecreasePercent) => {
    if (maxDecreasePercent >= 30) return '低风险';
    if (maxDecreasePercent >= 20) return '中低风险';
    if (maxDecreasePercent >= 10) return '中等风险';
    if (maxDecreasePercent >= 5) return '中高风险';
    return '高风险';
  };

  /**
   * 根据最大收入下降百分比获取风险等级对应的颜色类名
   * @param {number} maxDecreasePercent - 最大收入下降百分比
   * @returns {string} Tailwind CSS 颜色类名
   */
  const getRiskLevelColor = (maxDecreasePercent) => {
    if (maxDecreasePercent >= 30) return 'text-green-600';
    if (maxDecreasePercent >= 20) return 'text-blue-600';
    if (maxDecreasePercent >= 10) return 'text-yellow-600';
    if (maxDecreasePercent >= 5) return 'text-orange-600';
    return 'text-red-600';
  };

  /**
   * 根据最大收入下降百分比获取风险描述
   * @param {number} maxDecreasePercent - 最大收入下降百分比
   * @returns {string} 风险描述文本
   */
  const getRiskDescription = (maxDecreasePercent) => {
    if (maxDecreasePercent >= 30) return '抗风险能力强，收入大幅下降仍可盈利';
    if (maxDecreasePercent >= 20) return '抗风险能力良好，可承受较大收入波动';
    if (maxDecreasePercent >= 10) return '抗风险能力一般，需关注收入稳定性';
    if (maxDecreasePercent >= 5) return '抗风险能力较弱，收入波动影响较大';
    return '抗风险能力很弱，需要提高盈利能力';
  };

  /**
   * 格式化目标利润率名称映射
   * @param {number} margin - 利润率百分比
   * @returns {string} 对应的属性名
   */
  const getMarginPropertyName = (margin) => {
    const mapping = {
      5: 'fivePercent',
      10: 'tenPercent', 
      15: 'fifteenPercent',
      20: 'twentyPercent'
    };
    return mapping[margin] || 'fivePercent';
  };

  /**
   * 判断目标利润率是否可实现
   * @param {number} requiredRevenue - 所需收入
   * @param {number} currentRevenue - 当前收入
   * @param {number} maxIncreasePercent - 最大允许的收入增长百分比（默认100%）
   * @returns {boolean} 是否可实现
   */
  const isTargetMarginAchievable = (requiredRevenue, currentRevenue, maxIncreasePercent = 100) => {
    if (requiredRevenue === Infinity) return false;
    if (currentRevenue <= 0) return false;
    
    const increasePercent = ((requiredRevenue - currentRevenue) / currentRevenue) * 100;
    return increasePercent <= maxIncreasePercent;
  };

  /**
   * 计算收入增长百分比
   * @param {number} requiredRevenue - 所需收入
   * @param {number} currentRevenue - 当前收入
   * @returns {number} 增长百分比
   */
  const calculateIncreasePercent = (requiredRevenue, currentRevenue) => {
    if (currentRevenue <= 0) return 0;
    return ((requiredRevenue - currentRevenue) / currentRevenue) * 100;
  };

  /**
   * 创建图表数据点
   * @param {number} maxRevenue - 最大收入值
   * @param {number} totalCost - 总成本
   * @param {number} steps - 数据点数量
   * @returns {Array} 数据点数组
   */
  const createChartDataPoints = (maxRevenue, totalCost, steps = 10) => {
    const dataPoints = [];
    
    for (let i = 0; i <= steps; i++) {
      const currentRevenue = (maxRevenue / steps) * i;
      const currentProfit = currentRevenue - totalCost;
      dataPoints.push({
        revenue: currentRevenue,
        profit: currentProfit,
        isBreakeven: Math.abs(currentProfit) < maxRevenue * 0.01
      });
    }
    
    return dataPoints;
  };

  /**
   * 查找盈亏平衡点
   * @param {Array} dataPoints - 数据点数组
   * @param {number} totalCost - 总成本（作为备用值）
   * @returns {Object} 盈亏平衡点对象
   */
  const findBreakevenPoint = (dataPoints, totalCost) => {
    return dataPoints.find(point => point.isBreakeven) || 
           dataPoints.find(point => point.profit >= 0) ||
           { revenue: totalCost, profit: 0 };
  };

  // 暴露公共API
  return {
    getRiskLevel,
    getRiskLevelColor,
    getRiskDescription,
    getMarginPropertyName,
    isTargetMarginAchievable,
    calculateIncreasePercent,
    createChartDataPoints,
    findBreakevenPoint
  };

})();