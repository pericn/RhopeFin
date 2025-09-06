// 盈利能力计算模块 - 负责盈利指标分析
window.ProfitabilityCalculator = (function() {
  'use strict';

  class ProfitabilityCalculator {
    constructor() {
      // 盈利能力计算器不需要外部依赖
    }

    // 主盈利能力计算方法
    calculate(revenue, cost, investment) {
      // 确保输入值不为NaN
      const revTotal = isNaN(revenue.total) ? 0 : (revenue.total || 0);
      const costTotal = isNaN(cost.total) ? 0 : (cost.total || 0);
      const invTotal = isNaN(investment.total) ? 0 : (investment.total || 0);
      
      const profit = (revTotal - costTotal) || 0;
      const margin = (revTotal > 0 && Math.abs(revTotal) >= 1) ? ((profit / revTotal) * 100) || 0 : 0;
      const paybackYears = (profit > 0 && invTotal > 0) ? (invTotal / profit) || 0 : Infinity;

      // ROI计算
      const roi = invTotal > 0 ? ((profit / invTotal) * 100) || 0 : 0;
      
      // 现金流分析
      const monthlyCashFlow = (profit / 12) || 0;
      const breakEvenRevenue = costTotal || 0;

      // 额外的逻辑验证 - 确保财务逻辑正确性
      let finalMargin = isNaN(margin) ? 0 : margin;
      if (Math.abs(revTotal) < 1 && Math.abs(finalMargin) > 0.01) {
        console.warn(`ProfitabilityCalculator: 总营收为${revTotal}，强制利润率从${finalMargin}%修正为0%`);
        finalMargin = 0;
      }

      return {
        profit: isNaN(profit) ? 0 : profit,
        margin: finalMargin,
        paybackYears: isNaN(paybackYears) ? Infinity : paybackYears,
        roi: isNaN(roi) ? 0 : roi,
        monthlyCashFlow: isNaN(monthlyCashFlow) ? 0 : monthlyCashFlow,
        breakEvenRevenue: isNaN(breakEvenRevenue) ? 0 : breakEvenRevenue,
        isProfitable: profit > 0,
        profitLevel: this.categorizeProfitLevel(finalMargin),
        metrics: this.calculateAdvancedMetrics(revenue, cost, investment, profit)
      };
    }

    // 计算高级盈利指标
    calculateAdvancedMetrics(revenue, cost, investment, profit) {
      // 确保输入值不为NaN
      const revTotal = isNaN(revenue.total) ? 0 : (revenue.total || 0);
      const costVariableTotal = isNaN(cost.variable.total) ? 0 : (cost.variable.total || 0);
      const costFixedTotal = isNaN(cost.fixed.total) ? 0 : (cost.fixed.total || 0);
      const costCOGSTotal = isNaN(cost.cogs?.total) ? 0 : (cost.cogs?.total || 0);
      const invTotal = isNaN(investment.total) ? 0 : (investment.total || 0);
      
      // 综合毛利率应该使用COGS而不是变动成本
      const grossProfit = (revTotal - costCOGSTotal) || 0;
      const grossMargin = (revTotal > 0 && Math.abs(revTotal) >= 1) ? (((revTotal - costCOGSTotal) / revTotal) * 100) || 0 : 0;
      
      // 净利润率
      const netMargin = (revTotal > 0 && Math.abs(revTotal) >= 1) ? ((profit / revTotal) * 100) || 0 : 0;
      
      // 投资回报率（年化）
      const annualROI = invTotal > 0 ? ((profit / invTotal) * 100) || 0 : 0;
      
      // 资产周转率
      const assetTurnover = invTotal > 0 ? ((revTotal / invTotal) || 0) : 0;
      
      // 盈亏平衡点分析
      const breakEvenPoint = this.calculateBreakEvenPoint(costFixedTotal, costVariableTotal, revTotal);
      
      // 运营杠杆系数
      const operatingLeverage = this.calculateOperatingLeverage(revenue, cost);
      
      // 现金回收周期
      const cashRecoveryPeriod = (profit > 0) ? ((invTotal / (profit + costFixedTotal)) || 0) : Infinity;

      // 额外的逻辑验证 - 确保毛利率逻辑正确性
      let finalGrossMargin = isNaN(grossMargin) ? 0 : grossMargin;
      if (Math.abs(revTotal) < 1 && Math.abs(finalGrossMargin) > 0.01) {
        console.warn(`ProfitabilityCalculator: 总营收为${revTotal}，强制毛利率从${finalGrossMargin}%修正为0%`);
        finalGrossMargin = 0;
      }

      return {
        // 毛利润和毛利率
        grossProfit: isNaN(grossProfit) ? 0 : grossProfit,
        grossMargin: finalGrossMargin,
        
        // 净利润率
        netMargin: isNaN(netMargin) ? 0 : netMargin,
        
        // 投资回报率（年化）
        annualROI: isNaN(annualROI) ? 0 : annualROI,
        
        // 资产周转率
        assetTurnover: isNaN(assetTurnover) ? 0 : assetTurnover,
        
        // 盈亏平衡点分析
        breakEvenPoint: isNaN(breakEvenPoint) ? Infinity : breakEvenPoint,
        
        // 运营杠杆系数
        operatingLeverage: isNaN(operatingLeverage) ? Infinity : operatingLeverage,
        
        // 现金回收周期
        cashRecoveryPeriod: isNaN(cashRecoveryPeriod) ? Infinity : cashRecoveryPeriod
      };
    }

    // 计算盈亏平衡点
    calculateBreakEvenPoint(fixedCost, variableCost, revenue) {
      // 确保输入值不为NaN
      const fixed = isNaN(fixedCost) ? 0 : (fixedCost || 0);
      const variable = isNaN(variableCost) ? 0 : (variableCost || 0);
      const rev = isNaN(revenue) ? 0 : (revenue || 0);
      
      if (rev <= 0) return Infinity;
      
      const variableCostRate = (variable / rev) || 0;
      const contributionMarginRate = 1 - variableCostRate;
      
      if (contributionMarginRate <= 0) return Infinity;
      
      const breakEven = (fixed / contributionMarginRate) || 0;
      return isNaN(breakEven) ? Infinity : breakEven;
    }

    // 计算运营杠杆系数
    calculateOperatingLeverage(revenue, cost) {
      // 确保输入值不为NaN
      const revTotal = isNaN(revenue.total) ? 0 : (revenue.total || 0);
      const costVariableTotal = isNaN(cost.variable.total) ? 0 : (cost.variable.total || 0);
      const costFixedTotal = isNaN(cost.fixed.total) ? 0 : (cost.fixed.total || 0);
      
      const contributionMargin = (revTotal - costVariableTotal) || 0;
      const operatingIncome = (contributionMargin - costFixedTotal) || 0;
      
      if (operatingIncome <= 0) return Infinity;
      
      const leverage = (contributionMargin / operatingIncome) || 0;
      return isNaN(leverage) ? Infinity : leverage;
    }

    // 利润水平分类
    categorizeProfitLevel(marginPercent) {
      if (marginPercent >= 20) return 'excellent';
      if (marginPercent >= 15) return 'good';
      if (marginPercent >= 10) return 'fair';
      if (marginPercent >= 5) return 'poor';
      if (marginPercent > 0) return 'marginal';
      return 'loss';
    }

    // 获取利润水平描述
    getProfitLevelDescription(level) {
      const descriptions = {
        excellent: { text: '优秀', color: 'green', recommendation: '盈利能力很强，可考虑扩大规模' },
        good: { text: '良好', color: 'blue', recommendation: '盈利水平健康，保持现有策略' },
        fair: { text: '一般', color: 'yellow', recommendation: '盈利能力中等，需要优化运营' },
        poor: { text: '较差', color: 'orange', recommendation: '盈利能力偏低，需要改进成本结构' },
        marginal: { text: '微利', color: 'red', recommendation: '微利状态，急需优化或重新评估' },
        loss: { text: '亏损', color: 'red', recommendation: '当前亏损，需要重大调整' }
      };
      
      return descriptions[level] || descriptions.loss;
    }

    // 盈利趋势分析
    analyzeTrends(currentMetrics, previousMetrics = null) {
      if (!previousMetrics) {
        return {
          trend: 'stable',
          changes: {},
          recommendations: ['建立历史数据对比基础']
        };
      }

      const changes = {
        profit: ((currentMetrics.profit - previousMetrics.profit) / Math.abs(previousMetrics.profit || 1)) * 100,
        margin: currentMetrics.margin - previousMetrics.margin,
        roi: currentMetrics.roi - previousMetrics.roi
      };

      let trend = 'stable';
      const recommendations = [];

      if (changes.profit > 10) {
        trend = 'improving';
        recommendations.push('盈利持续增长，可考虑投资扩张');
      } else if (changes.profit < -10) {
        trend = 'declining';
        recommendations.push('盈利下滑，需要分析原因并采取措施');
      }

      if (changes.margin > 2) {
        recommendations.push('利润率提升，运营效率改善');
      } else if (changes.margin < -2) {
        recommendations.push('利润率下降，需要控制成本或提高收入');
      }

      return {
        trend,
        changes,
        recommendations
      };
    }

    // 敏感性分析
    performSensitivityAnalysis(baseRevenue, baseCost, investment) {
      const scenarios = [
        { name: '收入+10%', revenue: baseRevenue.total * 1.1, cost: baseCost.total },
        { name: '收入-10%', revenue: baseRevenue.total * 0.9, cost: baseCost.total },
        { name: '成本+10%', revenue: baseRevenue.total, cost: baseCost.total * 1.1 },
        { name: '成本-10%', revenue: baseRevenue.total, cost: baseCost.total * 0.9 },
        { name: '收入+10%成本+5%', revenue: baseRevenue.total * 1.1, cost: baseCost.total * 1.05 }
      ];

      return scenarios.map(scenario => {
        const profit = scenario.revenue - scenario.cost;
        const margin = scenario.revenue > 0 ? (profit / scenario.revenue) * 100 : 0;
        const paybackYears = profit > 0 ? investment.total / profit : Infinity;
        const roi = investment.total > 0 ? (profit / investment.total) * 100 : 0;

        return {
          name: scenario.name,
          profit,
          margin,
          paybackYears,
          roi,
          profitLevel: this.categorizeProfitLevel(margin)
        };
      });
    }
  }

  return ProfitabilityCalculator;
})();