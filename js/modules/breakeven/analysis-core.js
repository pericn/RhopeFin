// 盈亏平衡分析核心计算模块
window.BreakevenAnalysisCore = (function() {
  'use strict';

  /**
   * 计算完整的盈亏平衡分析数据
   * @param {Object} calculations - 基础财务计算数据
   * @returns {Object} 完整的盈亏平衡分析数据
   */
  const calculateBreakevenAnalysis = (calculations) => {
    const currentRevenue = calculations.revenue?.total || 0;
    const fixedCost = calculations.cost?.fixed?.total || 0;
    const variableCost = calculations.cost?.variable?.total || 0;
    const totalCost = fixedCost + variableCost;
    const currentProfit = currentRevenue - totalCost;
    const currentMargin = currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0;

    // 基本盈亏平衡指标
    const breakEvenRevenue = totalCost;
    const revenueGap = Math.max(0, breakEvenRevenue - currentRevenue);

    // 风险承受能力指标
    const riskTolerance = window.BreakevenRiskTolerance.calculateRiskTolerance(
      currentRevenue, totalCost, fixedCost
    );

    // 目标利润率所需收入
    const requiredRevenueFor = window.BreakevenTargetMargin.generateTargetRevenueRequirements(totalCost);

    // 敏感性分析
    const sensitivity = window.BreakevenSensitivity.calculateSensitivityAnalysis(
      currentRevenue, totalCost, currentMargin
    );

    return {
      // 基本指标
      currentMargin,
      breakEvenRevenue,
      revenueGap,
      currentProfit,
      
      // 风险承受能力
      maxCostIncrease: riskTolerance.maxCostIncrease,
      maxCostIncreasePercent: riskTolerance.maxCostIncreasePercent,
      maxRevenueDecrease: riskTolerance.maxRevenueDecrease,
      maxRevenueDecreasePercent: riskTolerance.maxRevenueDecreasePercent,
      
      // 目标利润率分析
      requiredRevenueFor,
      
      // 敏感性分析
      sensitivity
    };
  };

  /**
   * 获取盈亏平衡分析洞察和建议
   * @param {Object} breakevenData - 盈亏平衡分析数据
   * @param {string} currency - 货币符号
   * @returns {Object} 洞察和建议
   */
  const getBreakevenInsights = (breakevenData, currency = "¥") => {
    const insights = {
      riskInsights: window.BreakevenRiskTolerance.getRiskInsights(
        {
          maxCostIncreasePercent: breakevenData.maxCostIncreasePercent,
          maxRevenueDecreasePercent: breakevenData.maxRevenueDecreasePercent
        },
        currency
      ),
      targetInsights: window.BreakevenTargetMargin.getTargetRecommendations(
        window.BreakevenTargetMargin.analyzeTargetAchievability(
          breakevenData.currentRevenue || 0,
          breakevenData.requiredRevenueFor
        ),
        currency
      ),
      sensitivityInsights: window.BreakevenSensitivity.analyzeSensitivityResults(
        breakevenData.sensitivity,
        breakevenData.currentMargin
      )
    };

    // 综合建议
    insights.overallRecommendations = generateOverallRecommendations(breakevenData, currency);

    return insights;
  };

  /**
   * 生成综合建议
   * @param {Object} breakevenData - 盈亏平衡分析数据
   * @param {string} currency - 货币符号
   * @returns {Array} 综合建议数组
   */
  const generateOverallRecommendations = (breakevenData, currency) => {
    const recommendations = [];
    
    // 如果当前亏损
    if (breakevenData.currentMargin < 0) {
      recommendations.push({
        priority: 'high',
        category: '紧急',
        title: '当前处于亏损状态',
        description: `需要立即行动改善财务状况，收入缺口为 ${currency}${breakevenData.revenueGap.toLocaleString()}`,
        actions: [
          '立即审查和优化成本结构',
          '寻找快速增收机会',
          '考虑暂停非必要支出'
        ]
      });
    }
    
    // 风险承受能力较弱
    if (breakevenData.maxRevenueDecreasePercent < 10) {
      recommendations.push({
        priority: 'high',
        category: '风险管控',
        title: '抗风险能力较弱',
        description: '收入下降超过10%就可能导致亏损，需要加强风险管理',
        actions: [
          '建立多元化收入来源',
          '提升客户粘性和续费率',
          '建立应急资金储备'
        ]
      });
    }
    
    // 成本敏感性高
    if (breakevenData.maxCostIncreasePercent < 5) {
      recommendations.push({
        priority: 'medium',
        category: '成本优化',
        title: '成本控制要求严格',
        description: '成本增加5%就会显著影响盈利，需要严格的成本管控',
        actions: [
          '实施精细化成本管理',
          '寻找供应商优化机会',
          '提升运营效率降低单位成本'
        ]
      });
    }
    
    return recommendations;
  };

  /**
   * 导出盈亏平衡分析报告
   * @param {Object} calculations - 财务计算数据
   * @param {Object} options - 导出选项
   * @returns {Object} 分析报告数据
   */
  const exportAnalysisReport = (calculations, options = {}) => {
    const breakevenData = calculateBreakevenAnalysis(calculations);
    const insights = getBreakevenInsights(breakevenData, options.currency);
    const chartData = window.BreakevenVisualization.generateAdvancedChartData(calculations);
    const chartMetrics = window.BreakevenVisualization.calculateChartMetrics(calculations);

    return {
      timestamp: new Date().toISOString(),
      currency: options.currency || "¥",
      
      // 核心数据
      breakevenData,
      chartData,
      chartMetrics,
      
      // 分析洞察
      insights,
      
      // 关键指标摘要
      summary: {
        currentStatus: breakevenData.currentMargin > 0 ? '盈利' : '亏损',
        breakevenRevenue: breakevenData.breakEvenRevenue,
        revenueGap: breakevenData.revenueGap,
        riskLevel: window.BreakevenUtils.getRiskLevel(breakevenData.maxRevenueDecreasePercent),
        profitMargin: breakevenData.currentMargin
      }
    };
  };

  // 暴露公共API
  return {
    calculateBreakevenAnalysis,
    getBreakevenInsights,
    generateOverallRecommendations,
    exportAnalysisReport
  };

})();