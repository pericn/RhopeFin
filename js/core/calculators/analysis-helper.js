// 分析助手模块 - 提供综合分析功能
window.AnalysisHelper = (function() {
  'use strict';

  class AnalysisHelper {
    // 执行综合分析
    static performComprehensiveAnalysis(results) {
      const { revenue, cost, investment, profitability, scenarios, breakeven } = results;

      return {
        healthScore: this.calculateHealthScore(profitability, breakeven, scenarios),
        riskIndicators: this.identifyRiskIndicators(results),
        improvementSuggestions: this.generateImprovementSuggestions(results),
        keySummary: this.generateKeySummary(results),
        investmentGuidance: this.generateInvestmentGuidance(results)
      };
    }

    // 计算财务健康度评分 (0-100)
    static calculateHealthScore(profitability, breakeven, scenarios) {
      let score = 0;

      // 盈利能力权重 40%
      if (profitability.margin > 15) score += 40;
      else if (profitability.margin > 10) score += 30;
      else if (profitability.margin > 5) score += 20;
      else if (profitability.margin > 0) score += 10;

      // 安全边际权重 30%
      if (breakeven.safetyMargin?.safetyMarginRate > 20) score += 30;
      else if (breakeven.safetyMargin?.safetyMarginRate > 10) score += 20;
      else if (breakeven.safetyMargin?.safetyMarginRate > 5) score += 10;

      // 情景稳定性权重 30%
      if (scenarios.conservative?.profit > 0) {
        score += 20;
        if (scenarios.conservative.margin > 5) score += 10;
      }

      const finalScore = Math.min(100, score);
      return {
        score: finalScore,
        grade: this.getHealthGrade(finalScore),
        description: this.getHealthDescription(finalScore)
      };
    }

    // 识别风险指标
    static identifyRiskIndicators(results) {
      const indicators = [];

      if (results.profitability.margin < 5) {
        indicators.push({
          type: 'profitability', level: 'high',
          message: '利润率过低，盈利能力不足',
          metric: results.profitability.margin
        });
      }

      if (results.profitability.paybackYears > 5) {
        indicators.push({
          type: 'payback', level: 'high',
          message: '投资回本周期过长',
          metric: results.profitability.paybackYears
        });
      }

      if (results.scenarios.conservative?.profit < 0) {
        indicators.push({
          type: 'scenario', level: 'high',
          message: '保守情景下出现亏损',
          metric: results.scenarios.conservative.profit
        });
      }

      if (results.breakeven.safetyMargin?.safetyMarginRate < 10) {
        indicators.push({
          type: 'safety_margin', level: 'medium',
          message: '安全边际不足，抗风险能力偏低',
          metric: results.breakeven.safetyMargin.safetyMarginRate
        });
      }

      if (results.profitability.monthlyCashFlow < 0) {
        indicators.push({
          type: 'cash_flow', level: 'critical',
          message: '月度现金流为负，运营资金紧张',
          metric: results.profitability.monthlyCashFlow
        });
      }

      return indicators;
    }

    // 生成改进建议
    static generateImprovementSuggestions(results) {
      const suggestions = [];
      const topRevenueSource = this.findTopRevenueSource(results.revenue);

      // 主要建议
      suggestions.push({
        category: 'revenue', priority: 'high', title: '收入优化',
        description: `重点优化${topRevenueSource.name}业务板块`
      });

      if (results.cost.fixed.total / results.cost.total > 0.7) {
        suggestions.push({
          category: 'cost', priority: 'medium', title: '成本控制',
          description: '固定成本占比较高，需要提高运营效率'
        });
      }

      if (results.profitability.paybackYears > 3) {
        suggestions.push({
          category: 'investment', priority: 'high', title: '投资优化',
          description: '回本周期较长，建议调整投资策略'
        });
      }

      return suggestions;
    }

    // 生成关键指标摘要
    static generateKeySummary(results) {
      return {
        revenue: {
          total: results.revenue.total,
          monthlyAverage: results.revenue.total / 12,
          topSource: this.findTopRevenueSource(results.revenue)
        },
        profitability: {
          profit: results.profitability.profit,
          margin: results.profitability.margin,
          level: results.profitability.profitLevel
        },
        investment: {
          total: results.investment.total,
          paybackYears: results.profitability.paybackYears,
          roi: results.profitability.roi
        },
        risks: {
          count: this.identifyRiskIndicators(results).length,
          level: this.getOverallRiskLevel(results)
        }
      };
    }

    // 生成投资决策指导
    static generateInvestmentGuidance(results) {
      const { profitability, scenarios, breakeven } = results;
      
      let recommendation = 'hold';
      const reasons = [];
      const conditions = [];

      if (profitability.margin > 10 && scenarios.conservative?.profit > 0) {
        recommendation = 'proceed';
        reasons.push('盈利能力强且风险可控');
      } else if (profitability.margin > 5 && breakeven.safetyMargin?.safetyMarginRate > 10) {
        recommendation = 'proceed';
        reasons.push('盈利能力可接受且有安全边际');
        conditions.push('建议制定风险应对预案');
      } else if (profitability.margin > 0) {
        recommendation = 'hold';
        reasons.push('盈利微薄，需要谨慎评估');
        conditions.push('建议优化成本结构后再决策');
      } else {
        recommendation = 'reject';
        reasons.push('当前模型显示亏损风险较高');
      }

      return {
        recommendation, reasons, conditions,
        confidenceLevel: this.calculateDecisionConfidence(results)
      };
    }

    // 辅助方法
    static findTopRevenueSource(revenue) {
      const sources = [
        { name: '会员收入', value: revenue.member },
        { name: '寄养收入', value: revenue.boarding },
        { name: '医疗收入', value: revenue.medical },
        { name: '零售收入', value: revenue.retail },
        { name: '餐饮收入', value: revenue.cafe }
      ];
      
      return sources.reduce((max, current) => 
        current.value > max.value ? current : max
      );
    }

    static getHealthGrade(score) {
      if (score >= 80) return 'A';
      if (score >= 70) return 'B';
      if (score >= 60) return 'C';
      if (score >= 50) return 'D';
      return 'F';
    }

    static getHealthDescription(score) {
      if (score >= 80) return '财务状况优秀';
      if (score >= 70) return '财务状况良好';
      if (score >= 60) return '财务状况一般';
      if (score >= 50) return '财务状况需要改善';
      return '财务状况存在较大风险';
    }

    static getOverallRiskLevel(results) {
      const riskIndicators = this.identifyRiskIndicators(results);
      const highRiskCount = riskIndicators.filter(r => r.level === 'high' || r.level === 'critical').length;
      
      if (highRiskCount >= 2) return 'high';
      if (highRiskCount >= 1) return 'medium';
      return 'low';
    }

    static calculateDecisionConfidence(results) {
      let confidence = 50;
      if (results.scenarios.conservative?.profit > 0) confidence += 20;
      if (results.profitability.margin > 10) confidence += 15;
      if (results.breakeven.safetyMargin?.safetyMarginRate > 15) confidence += 15;
      return Math.min(100, confidence);
    }
  }

  return AnalysisHelper;
})();