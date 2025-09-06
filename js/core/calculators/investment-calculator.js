// 投资计算模块 - 负责投资成本分析
window.InvestmentCalculator = (function() {
  'use strict';

  class InvestmentCalculator {
    constructor() {
      // 投资计算器不需要公式引擎依赖
    }

    // 主投资计算方法
    calculate(data) {
      if (!data?.investment || !data?.basic) {
        return {
          fitout: 0, 
          medical: 0, 
          custom: 0, 
          total: 0,
          breakdown: { 
            fitoutPerSqm: 0, 
            customInvestments: [] 
          }
        };
      }

      const fitout = this.calculateFitoutInvestment(data);
      const medical = this.calculateMedicalInvestment(data);
      const custom = this.calculateCustomInvestment(data);

      const total = (fitout + medical + custom) || 0;

      return {
        fitout: isNaN(fitout) ? 0 : fitout,
        medical: isNaN(medical) ? 0 : medical,
        custom: isNaN(custom) ? 0 : custom,
        total: isNaN(total) ? 0 : total,
        breakdown: {
          fitoutPerSqm: data.investment.fitoutStandard || 0,
          customInvestments: data.investment.customInvestments || [],
          details: this.getInvestmentDetails(data)
        }
      };
    }

    // 装修投资计算
    calculateFitoutInvestment(data) {
      const areaSqm = isNaN(data.basic?.areaSqm) ? 0 : (data.basic?.areaSqm || 0);
      const fitoutStandard = isNaN(data.investment?.fitoutStandard) ? 0 : (data.investment?.fitoutStandard || 0);
      const investment = (areaSqm * fitoutStandard) || 0;
      return isNaN(investment) ? 0 : investment;
    }

    // 医疗设备投资计算
    calculateMedicalInvestment(data) {
      const investment = data.investment?.medicalInitial || 0;
      return isNaN(investment) ? 0 : investment;
    }

    // 自定义投资计算
    calculateCustomInvestment(data) {
      const customInvestments = data.investment?.customInvestments;
      if (!Array.isArray(customInvestments)) return 0;
      
      const total = customInvestments.reduce((sum, investment) => {
        // 自定义投资通常以万元为单位，需要转换为元
        const value = isNaN(investment?.value) ? 0 : (investment?.value || 0);
        const amount = (value * 10000) || 0;
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      
      return isNaN(total) ? 0 : total;
    }

    // 获取投资详细信息
    getInvestmentDetails(data) {
      return {
        fitout: {
          title: '装修投资',
          formula: '面积 × 装修单价',
          calculation: `${data.basic?.areaSqm || 0} × ${data.investment?.fitoutStandard || 0}`,
          amount: this.calculateFitoutInvestment(data)
        },
        medical: {
          title: '医疗设备投资',
          formula: '固定投资额',
          calculation: `${data.investment?.medicalInitial || 0}`,
          amount: this.calculateMedicalInvestment(data)
        },
        custom: {
          title: '自定义投资',
          formula: '各项投资金额之和',
          items: data.investment?.customInvestments || [],
          amount: this.calculateCustomInvestment(data)
        }
      };
    }

    // 投资回报分析
    analyzeROI(investmentTotal, annualProfit) {
      if (!investmentTotal || investmentTotal <= 0) {
        return {
          paybackYears: Infinity,
          roi: 0,
          monthlyROI: 0,
          breakEvenMonths: Infinity
        };
      }

      const paybackYears = annualProfit > 0 ? investmentTotal / annualProfit : Infinity;
      const roi = (annualProfit / investmentTotal) * 100;
      const monthlyROI = roi / 12;
      const breakEvenMonths = annualProfit > 0 ? (investmentTotal / annualProfit) * 12 : Infinity;

      return {
        paybackYears,
        roi,
        monthlyROI,
        breakEvenMonths
      };
    }

    // 投资风险评估
    assessRisk(investment, revenue, profitability) {
      const revenueToInvestmentRatio = investment.total > 0 ? revenue.total / investment.total : 0;
      const profitabilityScore = profitability.margin;
      
      let riskLevel = 'low';
      let riskFactors = [];

      // 基于收入与投资比例评估风险
      if (revenueToInvestmentRatio < 0.5) {
        riskLevel = 'high';
        riskFactors.push('收入相对投资规模偏低');
      } else if (revenueToInvestmentRatio < 1.0) {
        riskLevel = 'medium';
        riskFactors.push('收入回报需要关注');
      }

      // 基于盈利能力评估风险
      if (profitabilityScore < 5) {
        riskLevel = 'high';
        riskFactors.push('盈利能力偏低');
      } else if (profitabilityScore < 10) {
        if (riskLevel !== 'high') riskLevel = 'medium';
        riskFactors.push('盈利水平一般');
      }

      // 基于回本周期评估风险
      const paybackYears = profitability.paybackYears;
      if (paybackYears > 5) {
        riskLevel = 'high';
        riskFactors.push('回本周期过长');
      } else if (paybackYears > 3) {
        if (riskLevel !== 'high') riskLevel = 'medium';
        riskFactors.push('回本周期较长');
      }

      return {
        level: riskLevel,
        factors: riskFactors,
        revenueToInvestmentRatio,
        recommendations: this.generateRecommendations(riskLevel, riskFactors)
      };
    }

    // 生成投资建议
    generateRecommendations(riskLevel, riskFactors) {
      const recommendations = [];

      if (riskLevel === 'high') {
        recommendations.push('建议重新评估投资规模和预期收益');
        recommendations.push('考虑分阶段投资降低风险');
        recommendations.push('加强成本控制和收入优化');
      } else if (riskLevel === 'medium') {
        recommendations.push('关注关键指标变化');
        recommendations.push('制定风险应对预案');
      } else {
        recommendations.push('投资风险较低，可考虑适当扩大规模');
      }

      return recommendations;
    }
  }

  return InvestmentCalculator;
})();