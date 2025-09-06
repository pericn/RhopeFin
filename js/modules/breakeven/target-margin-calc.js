// 目标利润率计算模块
window.BreakevenTargetMarginCalc = (function() {
  'use strict';

  /**
   * 计算目标利润率所需收入
   * @param {number} totalCost - 总成本
   * @param {number} targetMarginPercent - 目标利润率（百分比）
   * @returns {number} 所需收入
   */
  const calculateRequiredRevenue = (totalCost, targetMarginPercent) => {
    if (targetMarginPercent >= 100) return Infinity;
    return totalCost / (1 - targetMarginPercent / 100);
  };

  /**
   * 生成所有目标利润率的所需收入
   * @param {number} totalCost - 总成本
   * @returns {Object} 包含各目标利润率所需收入的对象
   */
  const generateTargetRevenueRequirements = (totalCost) => {
    return {
      fivePercent: calculateRequiredRevenue(totalCost, 5),
      tenPercent: calculateRequiredRevenue(totalCost, 10),
      fifteenPercent: calculateRequiredRevenue(totalCost, 15),
      twentyPercent: calculateRequiredRevenue(totalCost, 20)
    };
  };

  /**
   * 分析目标可达性
   * @param {number} currentRevenue - 当前收入
   * @param {Object} requiredRevenueFor - 各目标的所需收入
   * @returns {Object} 可达性分析结果
   */
  const analyzeTargetAchievability = (currentRevenue, requiredRevenueFor) => {
    const analysis = {};
    
    Object.keys(requiredRevenueFor).forEach(key => {
      const requiredRevenue = requiredRevenueFor[key];
      const isAchievable = window.BreakevenUtils.isTargetMarginAchievable(requiredRevenue, currentRevenue);
      const increasePercent = window.BreakevenUtils.calculateIncreasePercent(requiredRevenue, currentRevenue);
      
      analysis[key] = {
        requiredRevenue,
        isAchievable,
        increasePercent,
        revenueGap: Math.max(0, requiredRevenue - currentRevenue),
        difficulty: getDifficultyLevel(increasePercent)
      };
    });
    
    return analysis;
  };

  /**
   * 获取目标实现难度等级
   * @param {number} increasePercent - 需要的收入增长百分比
   * @returns {string} 难度等级
   */
  const getDifficultyLevel = (increasePercent) => {
    if (increasePercent <= 0) return '已达到';
    if (increasePercent <= 20) return '容易';
    if (increasePercent <= 50) return '中等';
    if (increasePercent <= 100) return '困难';
    return '极困难';
  };

  /**
   * 获取目标实现建议
   * @param {Object} targetAnalysis - 目标分析结果
   * @param {string} currency - 货币符号
   * @returns {Array} 建议列表
   */
  const getTargetRecommendations = (targetAnalysis, currency) => {
    const recommendations = [];
    
    // 分析最容易实现的目标
    const easiestTarget = Object.entries(targetAnalysis)
      .filter(([key, data]) => data.isAchievable)
      .sort((a, b) => a[1].increasePercent - b[1].increasePercent)[0];
    
    if (easiestTarget) {
      const [targetKey, data] = easiestTarget;
      const marginPercent = getMarginFromKey(targetKey);
      recommendations.push({
        type: 'success',
        title: `优先目标：${marginPercent}% 利润率`,
        message: `只需增加收入 ${data.increasePercent.toFixed(1)}%，相对容易实现`,
        action: `增加收入 ${currency}${data.revenueGap.toLocaleString()}`
      });
    }
    
    // 分析收入增长策略
    const totalGap = Math.min(...Object.values(targetAnalysis).map(data => data.revenueGap));
    if (totalGap > 0) {
      recommendations.push({
        type: 'info',
        title: '收入提升策略',
        message: '建议从以下方面着手提升收入',
        actions: [
          '提高客单价或服务价格',
          '扩大客户基数',
          '增加新的收入来源',
          '提升服务频次或复购率'
        ]
      });
    }
    
    return recommendations;
  };

  /**
   * 从属性键获取利润率百分比
   * @param {string} key - 属性键名
   * @returns {number} 利润率百分比
   */
  const getMarginFromKey = (key) => {
    const mapping = {
      'fivePercent': 5,
      'tenPercent': 10,
      'fifteenPercent': 15,
      'twentyPercent': 20
    };
    return mapping[key] || 0;
  };

  // 暴露公共API
  return {
    calculateRequiredRevenue,
    generateTargetRevenueRequirements,
    analyzeTargetAchievability,
    getDifficultyLevel,
    getTargetRecommendations,
    getMarginFromKey
  };

})();