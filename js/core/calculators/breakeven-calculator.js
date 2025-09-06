// 盈亏平衡分析计算模块 - 负责盈亏平衡点分析
window.BreakevenCalculator = (function() {
  'use strict';

  class BreakevenCalculator {
    constructor() {
      // 盈亏平衡计算器不需要外部依赖
    }

    // 主盈亏平衡分析计算方法
    calculate(revenue, cost, investment) {
      // 确保输入值不为NaN
      const revTotal = isNaN(revenue.total) ? 0 : (revenue.total || 0);
      const costTotal = isNaN(cost.total) ? 0 : (cost.total || 0);
      const invTotal = isNaN(investment.total) ? 0 : (investment.total || 0);
      
      const currentProfit = (revTotal - costTotal) || 0;
      const currentMargin = revTotal > 0 ? (((currentProfit / revTotal) * 100) || 0) : 0;
      
      // 基础盈亏平衡分析
      const basicBreakeven = this.calculateBasicBreakeven(revenue, cost);
      
      // 目标利润率分析
      const targetAnalysis = this.calculateTargetProfitAnalysis(cost);
      
      // 安全边际分析
      const safetyMargin = this.calculateSafetyMargin(revenue, cost);
      
      // 敏感性分析
      const sensitivity = this.calculateSensitivity(revenue, cost);
      
      // 动态盈亏平衡分析
      const dynamicAnalysis = this.calculateDynamicBreakeven(revenue, cost, investment);

      return {
        currentMargin: isNaN(currentMargin) ? 0 : currentMargin,
        basicBreakeven,
        targetAnalysis,
        safetyMargin,
        sensitivity,
        dynamicAnalysis,
        recommendations: this.generateBreakevenRecommendations(currentMargin, basicBreakeven, safetyMargin)
      };
    }

    // 基础盈亏平衡分析
    calculateBasicBreakeven(revenue, cost) {
      // 确保输入值不为NaN
      const revTotal = isNaN(revenue.total) ? 0 : (revenue.total || 0);
      const costTotal = isNaN(cost.total) ? 0 : (cost.total || 0);
      const costFixedTotal = isNaN(cost.fixed.total) ? 0 : (cost.fixed.total || 0);
      const costVariableTotal = isNaN(cost.variable.total) ? 0 : (cost.variable.total || 0);
      
      const breakEvenRevenue = costTotal || 0;
      const revenueGap = Math.max(0, (costTotal - revTotal) || 0);
      const revenueGapPercent = revTotal > 0 ? (((revenueGap / revTotal) * 100) || 0) : 0;

      return {
        breakEvenRevenue: isNaN(breakEvenRevenue) ? 0 : breakEvenRevenue,
        revenueGap: isNaN(revenueGap) ? 0 : revenueGap,
        revenueGapPercent: isNaN(revenueGapPercent) ? 0 : revenueGapPercent,
        isBreakEven: revenueGap <= 0,
        breakevenStatus: this.getBreakevenStatus(revenue.total, cost.total)
      };
    }

    // 目标利润率分析
    calculateTargetProfitAnalysis(cost) {
      // 确保输入值不为NaN
      const costFixedTotal = isNaN(cost.fixed.total) ? 0 : (cost.fixed.total || 0);
      const costVariableTotal = isNaN(cost.variable.total) ? 0 : (cost.variable.total || 0);
      
      // 目标利润率 (不同目标下的收入要求)
      const targets = [5, 10, 15, 20]; // 目标利润率百分比
      
      const requiredRevenues = targets.map(target => {
        // 假设变动成本率保持不变
        const variableCostRate = costVariableTotal > 0 ? ((costVariableTotal / (costVariableTotal + costFixedTotal)) || 0) : 0;
        const contributionMarginRate = Math.max(0, 1 - variableCostRate);
        
        if (contributionMarginRate <= 0) {
          return {
            targetMargin: target,
            requiredRevenue: Infinity,
            requiredProfit: 0
          };
        }
        
        const requiredRevenue = contributionMarginRate > 0 ? (((costFixedTotal + (costFixedTotal * target / 100)) / contributionMarginRate) || 0) : Infinity;
        const requiredProfit = (requiredRevenue * target / 100) || 0;
        
        return {
          targetMargin: target,
          requiredRevenue: isNaN(requiredRevenue) ? Infinity : requiredRevenue,
          requiredProfit: isNaN(requiredProfit) ? 0 : requiredProfit
        };
      });

      return {
        targets: requiredRevenues,
        summary: this.generateTargetSummary(requiredRevenues, costFixedTotal)
      };
    }

    // 生成目标利润率汇总信息
    generateTargetSummary(requiredRevenues, costFixedTotal) {
      if (!requiredRevenues || requiredRevenues.length === 0) {
        return {
          feasible: false,
          lowestTarget: null,
          highestTarget: null,
          avgRevenue: 0
        };
      }

      // 过滤掉无限大的值
      const feasibleTargets = requiredRevenues.filter(r => 
        r.requiredRevenue !== Infinity && !isNaN(r.requiredRevenue)
      );

      if (feasibleTargets.length === 0) {
        return {
          feasible: false,
          lowestTarget: null,
          highestTarget: null,
          avgRevenue: 0
        };
      }

      const sortedByRevenue = feasibleTargets.sort((a, b) => a.requiredRevenue - b.requiredRevenue);
      const avgRevenue = feasibleTargets.reduce((sum, t) => sum + t.requiredRevenue, 0) / feasibleTargets.length;

      return {
        feasible: true,
        lowestTarget: sortedByRevenue[0],
        highestTarget: sortedByRevenue[sortedByRevenue.length - 1],
        avgRevenue: isNaN(avgRevenue) ? 0 : avgRevenue,
        feasibleCount: feasibleTargets.length,
        totalTargets: requiredRevenues.length
      };
    }

    // 安全边际分析
    calculateSafetyMargin(revenue, cost) {
      // 确保输入值不为NaN
      const revTotal = isNaN(revenue.total) ? 0 : (revenue.total || 0);
      const costTotal = isNaN(cost.total) ? 0 : (cost.total || 0);
      
      if (revTotal <= 0) {
        return {
          safetyMargin: 0,
          safetyMarginRate: 0,
          riskLevel: 'high'
        };
      }

      const safetyMargin = (revTotal - costTotal) || 0;
      const safetyMarginRate = (((safetyMargin / revTotal) * 100) || 0);
      const riskLevel = safetyMarginRate > 20 ? 'low' : safetyMarginRate > 10 ? 'medium' : 'high';

      return {
        safetyMargin: isNaN(safetyMargin) ? 0 : safetyMargin,
        safetyMarginRate: isNaN(safetyMarginRate) ? 0 : safetyMarginRate,
        riskLevel
      };
    }

    // 敏感性分析
    calculateSensitivity(revenue, cost) {
      // 确保输入值不为NaN
      const revTotal = isNaN(revenue.total) ? 0 : (revenue.total || 0);
      const costFixedTotal = isNaN(cost.fixed.total) ? 0 : (cost.fixed.total || 0);
      const costVariableTotal = isNaN(cost.variable.total) ? 0 : (cost.variable.total || 0);
      
      if (revTotal <= 0) {
        return {
          priceSensitivity: 0,
          costSensitivity: 0,
          volumeSensitivity: 0
        };
      }

      // 价格敏感性 (收入变化10%对利润的影响)
      const priceImpact = (revTotal * 0.1) || 0;
      const priceSensitivity = priceImpact > 0 ? ((priceImpact / revTotal) * 100) || 0 : 0;

      // 成本敏感性 (固定成本增加10%对利润的影响)
      const costImpact = (costFixedTotal * 0.1) || 0;
      const costSensitivity = costImpact > 0 ? ((costImpact / revTotal) * 100) || 0 : 0;

      // 销量敏感性 (销量变化10%对利润的影响)
      const volumeImpact = (revTotal * 0.1) || 0;
      const volumeSensitivity = volumeImpact > 0 ? ((volumeImpact / revTotal) * 100) || 0 : 0;

      return {
        priceSensitivity: isNaN(priceSensitivity) ? 0 : priceSensitivity,
        costSensitivity: isNaN(costSensitivity) ? 0 : costSensitivity,
        volumeSensitivity: isNaN(volumeSensitivity) ? 0 : volumeSensitivity
      };
    }

    // 动态盈亏平衡分析
    calculateDynamicBreakeven(revenue, cost, investment) {
      // 确保输入值不为NaN
      const revTotal = isNaN(revenue.total) ? 0 : (revenue.total || 0);
      const costTotal = isNaN(cost.total) ? 0 : (cost.total || 0);
      const costFixedTotal = isNaN(cost.fixed.total) ? 0 : (cost.fixed.total || 0);
      const costVariableTotal = isNaN(cost.variable.total) ? 0 : (cost.variable.total || 0);
      const invTotal = isNaN(investment.total) ? 0 : (investment.total || 0);
      
      const currentProfit = (revTotal - costTotal) || 0;
      
      if (revTotal <= 0 || currentProfit <= 0) {
        return {
          monthlyBreakeven: 0,
          timeToBreakeven: Infinity,
          requiredGrowth: 0
        };
      }

      // 月度盈亏平衡点
      const monthlyFixedCost = ((costFixedTotal / 12) || 0);
      const variableCostRate = (costVariableTotal / revTotal) || 0;
      const contributionMarginRate = Math.max(0, 1 - variableCostRate);
      const monthlyBreakeven = contributionMarginRate > 0 ? ((monthlyFixedCost / contributionMarginRate) || 0) : 0;

      // 回本时间
      const timeToBreakeven = (currentProfit > 0 && invTotal > 0) ? ((invTotal / currentProfit) || 0) : Infinity;

      // 所需增长率
      const requiredGrowth = ((costTotal - revTotal) / revTotal) * 100 || 0;

      return {
        monthlyBreakeven: isNaN(monthlyBreakeven) ? 0 : monthlyBreakeven,
        timeToBreakeven: isNaN(timeToBreakeven) ? Infinity : timeToBreakeven,
        requiredGrowth: isNaN(requiredGrowth) ? 0 : requiredGrowth
      };
    }

    // 现金流分析（简化版）
    analyzeCashFlow(revenue, cost, investment, monthlyProfit) {
      const breakEvenMonth = monthlyProfit > 0 ? Math.ceil(investment.total / monthlyProfit) : null;
      const maxNegativeCashFlow = -investment.total;
      const cashFlowTrend = monthlyProfit > 0 ? 'improving' : monthlyProfit === 0 ? 'stable' : 'declining';

      return {
        breakEvenMonth,
        maxNegativeCashFlow,
        cashFlowTrend,
        monthlyProfit
      };
    }

    // 生成盈亏平衡预测
    generateBreakevenProjections(monthlyProfit, totalInvestment) {
      if (monthlyProfit <= 0) {
        return {
          canBreakEven: false,
          requiredImprovement: Math.abs(monthlyProfit) + 1,
          timeframe: 'N/A'
        };
      }

      const monthsToBreakEven = Math.ceil(totalInvestment / monthlyProfit);
      const yearsToBreakEven = monthsToBreakEven / 12;

      return {
        canBreakEven: true,
        monthsToBreakEven,
        yearsToBreakEven: yearsToBreakEven.toFixed(1),
        timeframe: yearsToBreakEven < 1 ? `${monthsToBreakEven}个月` : `${yearsToBreakEven.toFixed(1)}年`
      };
    }

    // 获取盈亏平衡状态
    getBreakevenStatus(revenue, totalCost) {
      const margin = revenue > 0 ? ((revenue - totalCost) / revenue) * 100 : 0;
      const statuses = [
        [10, 'profitable', '盈利良好'],
        [5, 'marginally_profitable', '微利状态'],
        [0, 'breakeven', '刚好盈亏平衡'],
        [-5, 'near_breakeven', '接近盈亏平衡'],
        [-Infinity, 'loss', '亏损状态']
      ];
      
      const [, status, description] = statuses.find(([threshold]) => margin > threshold);
      return { status, description };
    }

    // 评估安全边际风险
    assessSafetyMarginRisk(safetyMarginRate) {
      const risks = [
        [20, 'low', '安全边际充足'],
        [10, 'medium', '安全边际一般'], 
        [0, 'high', '安全边际不足'],
        [-Infinity, 'critical', '无安全边际']
      ];
      const [, level, description] = risks.find(([threshold]) => safetyMarginRate > threshold);
      return { level, description };
    }

    // 分类影响程度
    categorizeImpact(marginChange) {
      if (Math.abs(marginChange) > 10) return 'high';
      if (Math.abs(marginChange) > 5) return 'medium';
      return 'low';
    }

    // 生成盈亏平衡建议
    generateBreakevenRecommendations(currentMargin, basicBreakeven, safetyMargin) {
      const recommendations = [];

      if (currentMargin < 0) {
        recommendations.push('当前处于亏损状态，需要立即采取措施提高收入或降低成本');
        recommendations.push(`需要增加收入 ${basicBreakeven.revenueGap.toFixed(0)} 元才能达到盈亏平衡`);
      } else if (currentMargin < 5) {
        recommendations.push('目前微利经营，建议提高安全边际');
        recommendations.push('关注成本控制，防止成本上涨导致亏损');
      } else if (currentMargin < 10) {
        recommendations.push('盈利水平一般，有继续优化空间');
        recommendations.push('可以考虑适度投资扩大规模');
      } else {
        recommendations.push('盈利状况良好，可考虑扩张或提高分红');
      }

      if (safetyMargin.safetyMarginRate < 10) {
        recommendations.push('安全边际偏低，需要建立风险缓冲机制');
      }

      if (safetyMargin.maxCostIncreasePercent < 5) {
        recommendations.push('成本控制空间有限，需要重点关注成本管理');
      }

      return recommendations;
    }
  }

  return BreakevenCalculator;
})();