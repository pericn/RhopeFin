// 主计算器 - 整合所有计算模块的协调器
window.MainCalculator = (function() {
  'use strict';

  class MainCalculator {
    constructor(formulaEngine) {
      this.formulaEngine = formulaEngine;
      
      // 初始化所有子计算器模块
      this.revenueCalculator = new window.RevenueCalculator(formulaEngine);
      this.costCalculator = new window.CostCalculator(formulaEngine);
      this.investmentCalculator = new window.InvestmentCalculator();
      this.profitabilityCalculator = new window.ProfitabilityCalculator();
      this.scenarioCalculator = new window.ScenarioCalculator();
      this.breakevenCalculator = new window.BreakevenCalculator();
    }

    // 核心财务计算 - 主入口方法
    calculate(data) {
      try {
        // 验证数据完整性
        this.validateData(data);

        // 更新公式引擎的系统变量上下文
        if (this.formulaEngine) {
          this.formulaEngine.updateSystemContext(data);
        }

        // 按顺序执行各模块计算，确保不会出现NaN
        const revenue = this.revenueCalculator.calculate(data);
        // 确保收入计算结果不包含NaN
        const cleanRevenue = {
          member: isNaN(revenue.member) ? 0 : revenue.member,
          boarding: isNaN(revenue.boarding) ? 0 : revenue.boarding,
          medical: isNaN(revenue.medical) ? 0 : revenue.medical,
          retail: isNaN(revenue.retail) ? 0 : revenue.retail,
          cafe: isNaN(revenue.cafe) ? 0 : revenue.cafe,
          custom: isNaN(revenue.custom) ? 0 : revenue.custom,
          total: isNaN(revenue.total) ? 0 : revenue.total,
          breakdown: revenue.breakdown || {}
        };

        const cost = this.costCalculator.calculate(data, cleanRevenue);
        // 确保成本计算结果不包含NaN
        const cleanCost = {
          fixed: {
            rent: isNaN(cost.fixed.rent) ? 0 : cost.fixed.rent,
            property: isNaN(cost.fixed.property) ? 0 : cost.fixed.property,
            staff: isNaN(cost.fixed.staff) ? 0 : cost.fixed.staff,
            cleaning: isNaN(cost.fixed.cleaning) ? 0 : cost.fixed.cleaning,
            hqFee: isNaN(cost.fixed.hqFee) ? 0 : cost.fixed.hqFee,
            custom: isNaN(cost.fixed.custom) ? 0 : cost.fixed.custom,
            total: isNaN(cost.fixed.total) ? 0 : cost.fixed.total,
            details: cost.fixed.details || {}
          },
          variable: {
            utilities: isNaN(cost.variable.utilities) ? 0 : cost.variable.utilities,
            misc: isNaN(cost.variable.misc) ? 0 : cost.variable.misc,
            custom: isNaN(cost.variable.custom) ? 0 : cost.variable.custom,
            total: isNaN(cost.variable.total) ? 0 : cost.variable.total
          },
          cogs: {
            members: isNaN(cost.cogs.members) ? 0 : cost.cogs.members,
            boarding: isNaN(cost.cogs.boarding) ? 0 : cost.cogs.boarding,
            medical: isNaN(cost.cogs.medical) ? 0 : cost.cogs.medical,
            retail: isNaN(cost.cogs.retail) ? 0 : cost.cogs.retail,
            cafe: isNaN(cost.cogs.cafe) ? 0 : cost.cogs.cafe,
            custom: isNaN(cost.cogs.custom) ? 0 : cost.cogs.custom,
            total: isNaN(cost.cogs.total) ? 0 : cost.cogs.total,
            margins: cost.cogs.margins || {}
          },
          total: isNaN(cost.total) ? 0 : cost.total,
          breakdown: cost.breakdown || {}
        };

        const investment = this.investmentCalculator.calculate(data, cleanCost);
        // 确保投资计算结果不包含NaN
        const cleanInvestment = {
          fitout: isNaN(investment.fitout) ? 0 : investment.fitout,
          medical: isNaN(investment.medical) ? 0 : investment.medical,
          custom: isNaN(investment.custom) ? 0 : investment.custom,
          total: isNaN(investment.total) ? 0 : investment.total,
          breakdown: investment.breakdown || {}
        };

        const profitability = this.profitabilityCalculator.calculate(cleanRevenue, cleanCost, cleanInvestment);
        const scenarios = this.scenarioCalculator.calculate(data, cleanRevenue, cleanCost, cleanInvestment);
        const breakeven = this.breakevenCalculator.calculate(cleanRevenue, cleanCost, cleanInvestment);

        // 第二次更新公式引擎上下文，包含计算结果
        if (this.formulaEngine) {
          const calculationResults = {
            revenue: cleanRevenue,
            cost: cleanCost,
            investment: cleanInvestment,
            profitability: profitability
          };
          this.formulaEngine.updateSystemContext(data, calculationResults);
        }

        // 使用分析助手进行综合分析
        const comprehensiveAnalysis = window.AnalysisHelper ? 
          window.AnalysisHelper.performComprehensiveAnalysis({
            revenue: cleanRevenue, cost: cleanCost, investment: cleanInvestment, profitability, scenarios, breakeven
          }) : this.createDefaultAnalysis(cleanRevenue, cleanCost, cleanInvestment, profitability);

        return {
          revenue: cleanRevenue,
          cost: cleanCost,
          investment: cleanInvestment,
          profitability,
          scenarios,
          breakeven,
          comprehensive: comprehensiveAnalysis,
          metadata: {
            calculatedAt: new Date().toISOString(),
            dataVersion: this.generateDataHash(data),
            calculatorVersion: '2.0.0',
            modules: this.getModuleInfo()
          }
        };
      } catch (error) {
        console.error('Calculator error:', error);
        return this.createErrorResult(error);
      }
    }

    // 创建默认分析（当AnalysisHelper不可用时）
    createDefaultAnalysis(revenue, cost, investment, profitability) {
      const profit = revenue.total - cost.total;
      const margin = revenue.total > 0 ? (profit / revenue.total) * 100 : 0;
      
      return {
        healthScore: {
          score: margin > 15 ? 80 : margin > 10 ? 60 : margin > 5 ? 40 : margin > 0 ? 20 : 0,
          grade: margin > 15 ? 'A' : margin > 10 ? 'B' : margin > 5 ? 'C' : margin > 0 ? 'D' : 'F',
          description: margin > 0 ? '基础分析完成' : '需要改进'
        },
        riskIndicators: margin < 5 ? [{ type: 'profitability', level: 'high', message: '盈利能力不足' }] : [],
        improvementSuggestions: [{ category: 'general', priority: 'medium', title: '持续优化', description: '建议使用完整分析模块' }],
        keySummary: {
          revenue: { total: revenue.total },
          profitability: { profit, margin },
          investment: { total: investment.total, paybackYears: profitability.paybackYears }
        },
        investmentGuidance: {
          recommendation: margin > 10 ? 'proceed' : margin > 0 ? 'hold' : 'reject',
          reasons: [margin > 0 ? '基础盈利能力达标' : '亏损风险较高'],
          conditions: [],
          confidenceLevel: 50
        }
      };
    }

    // 生成数据哈希（支持中文字符）
    generateDataHash(data) {
      try {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // 转换为32位整数
        }
        return Math.abs(hash).toString(16).slice(0, 8);
      } catch (error) {
        return Date.now().toString(16).slice(-8);
      }
    }

    // 获取模块信息
    getModuleInfo() {
      return {
        revenue: 'RevenueCalculator',
        cost: 'CostCalculator',
        investment: 'InvestmentCalculator',
        profitability: 'ProfitabilityCalculator',
        scenario: 'ScenarioCalculator',
        breakeven: 'BreakevenCalculator',
        analysis: 'AnalysisHelper'
      };
    }

    // 创建错误结果
    createErrorResult(error) {
      return {
        error: true,
        message: error.message,
        revenue: { total: 0 },
        cost: { total: 0 },
        investment: { total: 0 },
        profitability: { profit: 0, margin: 0, paybackYears: Infinity, roi: 0 },
        scenarios: { optimistic: {}, conservative: {}, pessimistic: {} },
        breakeven: { currentMargin: 0 },
        comprehensive: {
          healthScore: { score: 0, grade: 'F', description: '计算错误' },
          riskIndicators: [],
          improvementSuggestions: [],
          keySummary: {},
          investmentGuidance: { recommendation: 'reject', reasons: ['计算出错'], conditions: [] }
        },
        metadata: {
          calculatedAt: new Date().toISOString(),
          error: error.message
        }
      };
    }

    // 验证数据完整性
    validateData(data) {
      const requiredFields = ['basic', 'revenue', 'cost', 'investment'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required data fields: ${missingFields.join(', ')}`);
      }

      return true;
    }
  }

  return MainCalculator;
})();