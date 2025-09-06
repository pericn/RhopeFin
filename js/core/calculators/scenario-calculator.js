// 情景分析计算模块 - 负责乐观/保守情景分析
window.ScenarioCalculator = (function() {
  'use strict';

  class ScenarioCalculator {
    constructor() {
      // 情景分析计算器不需要外部依赖
    }

    // 主情景分析计算方法
    calculate(data, baseRevenue, baseCost, investment) {
      // 检查情景数据是否存在，如果不存在则使用默认值
      const scenarioData = data.scenario || this.getDefaultScenarioFactors();

      // 乐观情景
      const optimistic = this.calculateOptimisticScenario(
        scenarioData, baseRevenue, baseCost, investment
      );

      // 保守情景
      const conservative = this.calculateConservativeScenario(
        scenarioData, baseRevenue, baseCost, investment
      );

      // 最坏情景
      const pessimistic = this.calculatePessimisticScenario(
        scenarioData, baseRevenue, baseCost, investment
      );

      // 情景对比分析
      const comparison = this.compareScenarios(optimistic, conservative, pessimistic);

      return {
        optimistic,
        conservative,
        pessimistic,
        comparison,
        sensitivity: this.performSensitivityAnalysis(baseRevenue, baseCost, investment)
      };
    }

    // 计算乐观情景
    calculateOptimisticScenario(scenarioData, baseRevenue, baseCost, investment) {
      const revenueFactor = isNaN(scenarioData.optimisticRevenueFactor) ? 1.2 : ((scenarioData.optimisticRevenueFactor || 120) / 100);
      const costFactor = isNaN(scenarioData.optimisticCostFactor) ? 0.95 : ((scenarioData.optimisticCostFactor || 95) / 100);

      // 确保基础值不为NaN
      const baseRev = isNaN(baseRevenue.total) ? 0 : (baseRevenue.total || 0);
      const baseVarCost = isNaN(baseCost.variable.total) ? 0 : (baseCost.variable.total || 0);
      const baseFixCost = isNaN(baseCost.fixed.total) ? 0 : (baseCost.fixed.total || 0);
      const invTotal = isNaN(investment.total) ? 0 : (investment.total || 0);

      const revenue = (baseRev * revenueFactor) || 0;
      const variableCost = (baseVarCost * costFactor) || 0;
      const totalCost = (baseFixCost + variableCost) || 0;
      const profit = (revenue - totalCost) || 0;
      const margin = revenue > 0 ? (((profit / revenue) * 100) || 0) : 0;
      const paybackYears = (profit > 0 && invTotal > 0) ? ((invTotal / profit) || 0) : Infinity;

      return {
        revenue: isNaN(revenue) ? 0 : revenue,
        cost: {
          fixed: baseFixCost,
          variable: isNaN(variableCost) ? 0 : variableCost,
          total: isNaN(totalCost) ? 0 : totalCost
        },
        profit: isNaN(profit) ? 0 : profit,
        margin: isNaN(margin) ? 0 : margin,
        paybackYears: isNaN(paybackYears) ? Infinity : paybackYears,
        roi: invTotal > 0 ? (((profit / invTotal) * 100) || 0) : 0
      };
    }

    // 计算保守情景
    calculateConservativeScenario(scenarioData, baseRevenue, baseCost, investment) {
      const revenueFactor = isNaN(scenarioData.conservativeRevenueFactor) ? 0.9 : ((scenarioData.conservativeRevenueFactor || 90) / 100);
      const costFactor = isNaN(scenarioData.conservativeCostFactor) ? 1.05 : ((scenarioData.conservativeCostFactor || 105) / 100);

      // 确保基础值不为NaN
      const baseRev = isNaN(baseRevenue.total) ? 0 : (baseRevenue.total || 0);
      const baseVarCost = isNaN(baseCost.variable.total) ? 0 : (baseCost.variable.total || 0);
      const baseFixCost = isNaN(baseCost.fixed.total) ? 0 : (baseCost.fixed.total || 0);
      const invTotal = isNaN(investment.total) ? 0 : (investment.total || 0);

      const revenue = (baseRev * revenueFactor) || 0;
      const variableCost = (baseVarCost * costFactor) || 0;
      const totalCost = (baseFixCost + variableCost) || 0;
      const profit = (revenue - totalCost) || 0;
      const margin = revenue > 0 ? (((profit / revenue) * 100) || 0) : 0;
      const paybackYears = (profit > 0 && invTotal > 0) ? ((invTotal / profit) || 0) : Infinity;

      return {
        revenue: isNaN(revenue) ? 0 : revenue,
        cost: {
          fixed: baseFixCost,
          variable: isNaN(variableCost) ? 0 : variableCost,
          total: isNaN(totalCost) ? 0 : totalCost
        },
        profit: isNaN(profit) ? 0 : profit,
        margin: isNaN(margin) ? 0 : margin,
        paybackYears: isNaN(paybackYears) ? Infinity : paybackYears,
        roi: invTotal > 0 ? (((profit / invTotal) * 100) || 0) : 0
      };
    }

    // 计算悲观情景
    calculatePessimisticScenario(scenarioData, baseRevenue, baseCost, investment) {
      const revenueFactor = isNaN(scenarioData.pessimisticRevenueFactor) ? 0.8 : ((scenarioData.pessimisticRevenueFactor || 80) / 100);
      const costFactor = isNaN(scenarioData.pessimisticCostFactor) ? 1.1 : ((scenarioData.pessimisticCostFactor || 110) / 100);

      // 确保基础值不为NaN
      const baseRev = isNaN(baseRevenue.total) ? 0 : (baseRevenue.total || 0);
      const baseVarCost = isNaN(baseCost.variable.total) ? 0 : (baseCost.variable.total || 0);
      const baseFixCost = isNaN(baseCost.fixed.total) ? 0 : (baseCost.fixed.total || 0);
      const invTotal = isNaN(investment.total) ? 0 : (investment.total || 0);

      const revenue = (baseRev * revenueFactor) || 0;
      const variableCost = (baseVarCost * costFactor) || 0;
      const totalCost = (baseFixCost + variableCost) || 0;
      const profit = (revenue - totalCost) || 0;
      const margin = revenue > 0 ? (((profit / revenue) * 100) || 0) : 0;
      const paybackYears = (profit > 0 && invTotal > 0) ? ((invTotal / profit) || 0) : Infinity;

      return {
        revenue: isNaN(revenue) ? 0 : revenue,
        cost: {
          fixed: baseFixCost,
          variable: isNaN(variableCost) ? 0 : variableCost,
          total: isNaN(totalCost) ? 0 : totalCost
        },
        profit: isNaN(profit) ? 0 : profit,
        margin: isNaN(margin) ? 0 : margin,
        paybackYears: isNaN(paybackYears) ? Infinity : paybackYears,
        roi: invTotal > 0 ? (((profit / invTotal) * 100) || 0) : 0
      };
    }

    // 情景对比分析
    compareScenarios(optimistic, conservative, pessimistic) {
      return {
        profitRange: {
          max: optimistic.profit,
          min: pessimistic.profit,
          spread: optimistic.profit - pessimistic.profit
        },
        marginRange: {
          max: optimistic.margin,
          min: pessimistic.margin,
          spread: optimistic.margin - pessimistic.margin
        },
        paybackRange: {
          min: optimistic.paybackYears,
          max: pessimistic.paybackYears === Infinity ? 'N/A' : pessimistic.paybackYears
        },
        riskAssessment: this.assessScenarioRisk(optimistic, conservative, pessimistic),
        recommendations: this.generateScenarioRecommendations(optimistic, conservative, pessimistic)
      };
    }

    // 评估情景风险
    assessScenarioRisk(optimistic, conservative, pessimistic) {
      let riskLevel = 'low';
      const riskFactors = [];

      // 检查保守情景是否盈利
      if (conservative.profit <= 0) {
        riskLevel = 'high';
        riskFactors.push('保守情景下出现亏损');
      }

      // 检查最坏情景的亏损程度
      if (pessimistic.profit < 0 && Math.abs(pessimistic.profit) > optimistic.profit) {
        riskLevel = 'high';
        riskFactors.push('最坏情景亏损严重');
      }

      // 检查利润波动性
      const profitVolatility = (optimistic.profit - pessimistic.profit) / Math.abs(conservative.profit || 1);
      if (profitVolatility > 2) {
        if (riskLevel !== 'high') riskLevel = 'medium';
        riskFactors.push('盈利波动性较大');
      }

      // 检查回本周期的稳定性
      if (conservative.paybackYears > 5 || pessimistic.paybackYears === Infinity) {
        riskLevel = 'high';
        riskFactors.push('回本周期不稳定');
      }

      return {
        level: riskLevel,
        factors: riskFactors,
        profitVolatility: profitVolatility.toFixed(2)
      };
    }

    // 生成情景分析建议
    generateScenarioRecommendations(optimistic, conservative, pessimistic) {
      const recommendations = [];

      if (conservative.profit > 0 && pessimistic.profit > 0) {
        recommendations.push('各情景下均可盈利，投资风险较低');
        recommendations.push('建议制定积极的发展策略');
      } else if (conservative.profit > 0) {
        recommendations.push('保守情景下可盈利，但需要防范下行风险');
        recommendations.push('建议建立风险应对机制');
      } else {
        recommendations.push('投资风险较高，需要重新评估商业模式');
        recommendations.push('建议优化成本结构或延迟投资');
      }

      if (optimistic.paybackYears < 3) {
        recommendations.push('乐观情景下回报快速，可考虑加快投资进度');
      }

      if (pessimistic.margin < 0) {
        recommendations.push('制定应急预案，准备额外资金缓冲');
      }

      return recommendations;
    }

    // 简化的敏感性分析
    performSensitivityAnalysis(baseRevenue, baseCost, investment) {
      const scenarios = [
        { name: '收入+10%', revenue: baseRevenue.total * 1.1, cost: baseCost.total },
        { name: '收入-10%', revenue: baseRevenue.total * 0.9, cost: baseCost.total },
        { name: '成本+10%', revenue: baseRevenue.total, cost: baseCost.total * 1.1 },
        { name: '成本-10%', revenue: baseRevenue.total, cost: baseCost.total * 0.9 }
      ];

      return scenarios.map(scenario => {
        const profit = scenario.revenue - scenario.cost;
        const margin = scenario.revenue > 0 ? (profit / scenario.revenue) * 100 : 0;
        return { name: scenario.name, profit, margin };
      });
    }

    // 获取默认情景因子
    getDefaultScenarioFactors() {
      return {
        optimisticRevenueFactor: 120,
        optimisticCostFactor: 95,
        conservativeRevenueFactor: 85,
        conservativeCostFactor: 105,
        pessimisticRevenueFactor: 70,
        pessimisticCostFactor: 115
      };
    }
  }

  return ScenarioCalculator;
})();