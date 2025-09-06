// 敏感性分析计算模块
window.BreakevenSensitivityCalc = (function() {
  'use strict';

  /**
   * 计算敏感性分析数据
   * @param {number} currentRevenue - 当前收入
   * @param {number} totalCost - 总成本
   * @param {number} currentMargin - 当前利润率
   * @returns {Object} 敏感性分析数据
   */
  const calculateSensitivityAnalysis = (currentRevenue, totalCost, currentMargin) => {
    return {
      costIncrease5Pct: calculateScenario(currentRevenue, totalCost * 1.05, currentRevenue),
      costIncrease10Pct: calculateScenario(currentRevenue, totalCost * 1.10, currentRevenue),
      revenueDecrease5Pct: calculateScenario(currentRevenue * 0.95, totalCost, currentRevenue * 0.95),
      revenueDecrease10Pct: calculateScenario(currentRevenue * 0.90, totalCost, currentRevenue * 0.90),
      combinedWorstCase: calculateScenario(currentRevenue * 0.95, totalCost * 1.05, currentRevenue * 0.95)
    };
  };

  /**
   * 计算单个场景的财务指标
   * @param {number} revenue - 场景收入
   * @param {number} cost - 场景成本
   * @param {number} originalRevenue - 原始收入（用于计算利润率）
   * @returns {Object} 场景财务指标
   */
  const calculateScenario = (revenue, cost, originalRevenue) => {
    const profit = revenue - cost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    return {
      revenue,
      cost,
      profit,
      margin,
      isProfitable: profit > 0,
      breakeven: cost // 该场景下的盈亏平衡点
    };
  };

  /**
   * 执行多参数敏感性分析
   * @param {number} baseRevenue - 基准收入
   * @param {number} baseCost - 基准成本
   * @param {Array} revenueChanges - 收入变化百分比数组
   * @param {Array} costChanges - 成本变化百分比数组
   * @returns {Object} 多参数敏感性分析结果
   */
  const performMultiParameterAnalysis = (baseRevenue, baseCost, revenueChanges = [-10, -5, 0, 5, 10], costChanges = [-5, 0, 5, 10, 15]) => {
    const results = {};
    
    costChanges.forEach(costChange => {
      revenueChanges.forEach(revenueChange => {
        const scenarioRevenue = baseRevenue * (1 + revenueChange / 100);
        const scenarioCost = baseCost * (1 + costChange / 100);
        const key = `cost${costChange >= 0 ? '+' : ''}${costChange}_revenue${revenueChange >= 0 ? '+' : ''}${revenueChange}`;
        
        results[key] = calculateScenario(scenarioRevenue, scenarioCost, scenarioRevenue);
      });
    });
    
    return results;
  };

  /**
   * 分析敏感性结果并提供洞察
   * @param {Object} sensitivityData - 敏感性分析数据
   * @param {number} baseMargin - 基准利润率
   * @returns {Array} 洞察和建议数组
   */
  const analyzeSensitivityResults = (sensitivityData, baseMargin) => {
    const insights = [];
    
    // 成本敏感性分析
    const costImpact = baseMargin - sensitivityData.costIncrease5Pct.margin;
    if (costImpact > 5) {
      insights.push({
        type: 'warning',
        title: '成本敏感性较高',
        message: `成本增加5%将导致利润率下降${costImpact.toFixed(1)}个百分点`,
        recommendation: '建议加强成本控制，优化运营效率'
      });
    }
    
    // 收入敏感性分析
    const revenueImpact = baseMargin - sensitivityData.revenueDecrease5Pct.margin;
    if (revenueImpact > 8) {
      insights.push({
        type: 'warning',
        title: '收入依赖性较高',
        message: `收入减少5%将导致利润率下降${revenueImpact.toFixed(1)}个百分点`,
        recommendation: '建议多元化收入来源，提升抗风险能力'
      });
    }
    
    // 综合风险分析
    if (sensitivityData.combinedWorstCase && !sensitivityData.combinedWorstCase.isProfitable) {
      insights.push({
        type: 'danger',
        title: '综合风险较高',
        message: '在成本上升和收入下降同时发生时可能出现亏损',
        recommendation: '建议建立风险预警机制，准备应急预案'
      });
    }
    
    return insights;
  };

  /**
   * 获取关键敏感性指标
   * @param {Object} sensitivityData - 敏感性分析数据
   * @returns {Object} 关键指标
   */
  const getKeySensitivityMetrics = (sensitivityData) => {
    return {
      costElasticity: calculateElasticity(sensitivityData.costIncrease5Pct, 5, 'cost'),
      revenueElasticity: calculateElasticity(sensitivityData.revenueDecrease5Pct, -5, 'revenue'),
      worstCaseMargin: sensitivityData.combinedWorstCase ? sensitivityData.combinedWorstCase.margin : 0,
      riskScore: calculateRiskScore(sensitivityData)
    };
  };

  /**
   * 计算弹性系数
   * @param {Object} scenario - 场景数据
   * @param {number} changePercent - 变化百分比
   * @param {string} type - 类型（cost/revenue）
   * @returns {number} 弹性系数
   */
  const calculateElasticity = (scenario, changePercent, type) => {
    const marginChange = scenario.margin;
    return Math.abs(marginChange / changePercent);
  };

  /**
   * 计算综合风险评分
   * @param {Object} sensitivityData - 敏感性分析数据
   * @returns {number} 风险评分（0-100）
   */
  const calculateRiskScore = (sensitivityData) => {
    let score = 0;
    
    // 成本风险
    if (sensitivityData.costIncrease5Pct.margin < 0) score += 30;
    else if (sensitivityData.costIncrease5Pct.margin < 5) score += 20;
    else if (sensitivityData.costIncrease5Pct.margin < 10) score += 10;
    
    // 收入风险
    if (sensitivityData.revenueDecrease5Pct.margin < 0) score += 40;
    else if (sensitivityData.revenueDecrease5Pct.margin < 5) score += 30;
    else if (sensitivityData.revenueDecrease5Pct.margin < 10) score += 15;
    
    // 综合风险
    if (sensitivityData.combinedWorstCase && !sensitivityData.combinedWorstCase.isProfitable) {
      score += 30;
    }
    
    return Math.min(100, score);
  };

  // 暴露公共API
  return {
    calculateSensitivityAnalysis,
    performMultiParameterAnalysis,
    analyzeSensitivityResults,
    getKeySensitivityMetrics,
    calculateScenario
  };

})();