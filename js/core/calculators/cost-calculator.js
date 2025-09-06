// 成本计算模块 - 负责固定成本和变动成本计算
window.CostCalculator = (function() {
  'use strict';

  class CostCalculator {
    constructor(formulaEngine) {
      this.formulaEngine = formulaEngine;
    }

    // 主成本计算方法
    calculate(data, revenue) {
      if (!data || !data.cost) {
        console.warn('Cost calculation: incomplete data structure');
        return {
          fixed: { total: 0 },
          variable: { total: 0 },
          cogs: { total: 0 },
          total: 0,
          breakdown: {}
        };
      }

      const fixed = this.calculateFixedCost(data, revenue?.total || 0);
      const variable = this.calculateVariableCost(data, revenue || {});
      const cogs = this.calculateCOGS(data, revenue || {});
      const total = fixed.total + variable.total + cogs.total;

      return {
        fixed,
        variable,
        cogs,
        total,
        breakdown: {
          fixedFormulas: this.getFixedCostFormulas(data),
          variableFormulas: this.getVariableCostFormulas(data),
          cogsFormulas: this.getCOGSFormulas(data)
        }
      };
    }

    // 固定成本计算
    calculateFixedCost(data, medicalRevenue) {
      if (!data?.basic || !data?.cost?.fixed) {
        return {
          rent: 0, property: 0, staff: 0, cleaning: 0, hqFee: 0, custom: 0, total: 0,
          details: { rentDaily: 0, propertyMonthly: 0, staffMonthly: 0, staffCount: 0 }
        };
      }

      // 确保所有值不为NaN
      const areaSqm = isNaN(data.basic.areaSqm) ? 0 : (data.basic.areaSqm || 0);
      const daysPerYear = isNaN(data.basic.daysPerYear) ? 365 : (data.basic.daysPerYear || 365);
      const rentPerSqmPerDay = isNaN(data.cost.fixed.rentPerSqmPerDay) ? 0 : (data.cost.fixed.rentPerSqmPerDay || 0);
      const propertyPerSqmPerMonth = isNaN(data.cost.fixed.propertyPerSqmPerMonth) ? 0 : (data.cost.fixed.propertyPerSqmPerMonth || 0);
      const staffCount = isNaN(data.cost.fixed.staffCount) ? 0 : (data.cost.fixed.staffCount || 0);
      const staffSalaryPerMonth = isNaN(data.cost.fixed.staffSalaryPerMonth) ? 0 : (data.cost.fixed.staffSalaryPerMonth || 0);
      const cleaningOtherFixed = isNaN(data.cost.fixed.cleaningOtherFixed) ? 0 : (data.cost.fixed.cleaningOtherFixed || 0);
      const hqFeePctOfRevenue = isNaN(data.cost.fixed.hqFeePctOfRevenue) ? 0 : (data.cost.fixed.hqFeePctOfRevenue || 0);
      const medicalRev = isNaN(medicalRevenue) ? 0 : (medicalRevenue || 0);

      const rent = ((areaSqm * rentPerSqmPerDay * daysPerYear) || 0);
      const property = ((areaSqm * propertyPerSqmPerMonth * 12) || 0);
      const staff = ((staffCount * staffSalaryPerMonth * 12) || 0);
      const cleaning = cleaningOtherFixed || 0;
      const hqFee = (((medicalRev * hqFeePctOfRevenue) / 100) || 0);
      const custom = this.calculateCustomFixedCost(data.cost.custom || []) || 0;

      const total = (rent + property + staff + cleaning + hqFee + custom) || 0;

      return {
        rent,
        property,
        staff,
        cleaning,
        hqFee,
        custom,
        total,
        details: {
          rentDaily: rentPerSqmPerDay || 0,
          propertyMonthly: propertyPerSqmPerMonth || 0,
          staffMonthly: staffSalaryPerMonth || 0,
          staffCount: staffCount || 0
        }
      };
    }

    // 业务成本(COGS)计算 - 基于毛利率
    calculateCOGS(data, revenue) {
      if (!data?.cost?.margins) {
        return {
          members: 0, boarding: 0, medical: 0, retail: 0, cafe: 0,
          custom: 0, total: 0, margins: {}
        };
      }

      // 确保收入值不为NaN
      const memberRevenue = isNaN(revenue.member) ? 0 : (revenue.member || 0);
      const boardingRevenue = isNaN(revenue.boarding) ? 0 : (revenue.boarding || 0);
      const medicalRevenue = isNaN(revenue.medical) ? 0 : (revenue.medical || 0);
      const retailRevenue = isNaN(revenue.retail) ? 0 : (revenue.retail || 0);
      const cafeRevenue = isNaN(revenue.cafe) ? 0 : (revenue.cafe || 0);

      const members = ((memberRevenue * (100 - (data.cost.margins.members || 0))) / 100) || 0;
      const boarding = ((boardingRevenue * (100 - (data.cost.margins.boarding || 0))) / 100) || 0;
      const medical = ((medicalRevenue * (100 - (data.cost.margins.medical || 0))) / 100) || 0;
      const retail = ((retailRevenue * (100 - (data.cost.margins.retail || 0))) / 100) || 0;
      const cafe = ((cafeRevenue * (100 - (data.cost.margins.cafe || 0))) / 100) || 0;
      const custom = this.calculateCustomCOGS(data.revenue?.custom || [], data.cost.margins);

      const total = (members + boarding + medical + retail + cafe + custom) || 0;

      return {
        members,
        boarding,
        medical,
        retail,
        cafe,
        custom,
        total,
        margins: data.cost.margins || {}
      };
    }

    // 变动成本计算 - 真正的变动成本(不包含COGS)
    calculateVariableCost(data, revenue) {
      if (!data?.cost?.variable) {
        return {
          utilities: 0, misc: 0, custom: 0, total: 0
        };
      }

      // 确保所有值不为NaN
      const utilitiesPerYear = isNaN(data.cost.variable.utilitiesPerYear) ? 0 : (data.cost.variable.utilitiesPerYear || 0);
      const miscVariableAnnual = isNaN(data.cost.variable.miscVariableAnnual) ? 0 : (data.cost.variable.miscVariableAnnual || 0);

      const utilities = utilitiesPerYear || 0;
      const misc = miscVariableAnnual || 0;
      const custom = this.calculateCustomVariableCost(data.cost.custom || [], data.revenue?.custom || []) || 0;

      const total = (utilities + misc + custom) || 0;

      return {
        utilities,
        misc,
        custom,
        total
      };
    }

    // 自定义固定成本计算
    calculateCustomFixedCost(customModules) {
      if (!Array.isArray(customModules)) return 0;
      return customModules
        .filter(module => module && module.isFixed && module.enabled !== false)
        .reduce((total, module) => {
          try {
            const cost = this.formulaEngine ? 
              this.formulaEngine.evaluateFormula(module.formula || '0', module.variables || []) : 0;
            // 确保成本不为NaN
            const cleanCost = isNaN(cost) ? 0 : (cost || 0);
            return total + cleanCost;
          } catch (error) {
            console.warn('Custom fixed cost calculation error:', error);
            return total;
          }
        }, 0);
    }

    // 自定义变动成本计算
    // 包括两部分：1) 用户自定义的成本模块 2) 自定义收入模块的自动变动成本
    calculateCustomVariableCost(customModules, customRevenueModules = []) {
      if (!Array.isArray(customModules) && !Array.isArray(customRevenueModules)) return 0;
      
      // 1. 用户自定义的成本模块
      const customCostModules = customModules
        .filter(module => module && !module.isFixed && module.enabled !== false)
        .reduce((total, module) => {
          try {
            const cost = this.formulaEngine ? 
              this.formulaEngine.evaluateFormula(module.formula || '0', module.variables || []) : 0;
            // 确保成本不为NaN
            const cleanCost = isNaN(cost) ? 0 : (cost || 0);
            return total + cleanCost;
          } catch (error) {
            console.warn('Custom variable cost calculation error:', error);
            return total;
          }
        }, 0);
      
      // 自定义收入模块不直接产生变动成本（成本已在其他地方计算）
      const customRevenueCosts = 0;
      
      const finalTotal = (customCostModules + customRevenueCosts) || 0;
      return finalTotal;
    }

    // 自定义收入模块的COGS计算
    calculateCustomCOGS(customRevenueModules, margins) {
      if (!Array.isArray(customRevenueModules)) return 0;
      
      return customRevenueModules.reduce((total, module) => {
        try {
          const revenue = this.formulaEngine ? 
            this.formulaEngine.evaluateFormula(module.formula || '0', module.variables || []) : 0;
          // 确保收入和毛利率不为NaN
          const cleanRevenue = isNaN(revenue) ? 0 : (revenue || 0);
          const margin = isNaN(module.margin) ? 0 : (module.margin || 0);
          const cogs = (cleanRevenue * (100 - margin) / 100) || 0;
          return total + cogs;
        } catch (error) {
          console.warn('Custom COGS calculation error:', error);
          return total;
        }
      }, 0);
    }

    // 获取固定成本公式显示
    getFixedCostFormulas(data) {
      return {
        rent: {
          title: '租金成本',
          formula: '面积 × 租金单价/天 × 年营业天数',
          calculation: `${data.basic?.areaSqm || 0} × ${data.cost?.fixed?.rentPerSqmPerDay || 0} × ${data.basic?.daysPerYear || 365}`
        },
        property: {
          title: '物业成本',
          formula: '面积 × 物业单价/月 × 12',
          calculation: `${data.basic?.areaSqm || 0} × ${data.cost?.fixed?.propertyPerSqmPerMonth || 0} × 12`
        },
        staff: {
          title: '人工成本',
          formula: '员工数 × 月薪 × 12',
          calculation: `${data.cost?.fixed?.staffCount || 0} × ${data.cost?.fixed?.staffSalaryPerMonth || 0} × 12`
        }
      };
    }

    // 获取变动成本公式显示
    getVariableCostFormulas(data) {
      return {
        members: {
          title: '会员变动成本',
          formula: '会员收入 × (100% - 毛利率%)',
          calculation: `收入 × (100% - ${data.cost?.margins?.members || 0}%)`
        },
        boarding: {
          title: '寄养变动成本',
          formula: '寄养收入 × (100% - 毛利率%)',
          calculation: `收入 × (100% - ${data.cost?.margins?.boarding || 0}%)`
        },
        medical: {
          title: '医疗变动成本',
          formula: '医疗收入 × (100% - 毛利率%)',
          calculation: `收入 × (100% - ${data.cost?.margins?.medical || 0}%)`
        }
      };
    }

    // 获取业务成本(COGS)公式显示
    getCOGSFormulas(data) {
      return {
        members: {
          title: '会员业务成本',
          formula: '会员收入 × (100 - 会员毛利率) / 100',
          calculation: `¥{memberRevenue} × (100 - ${data?.cost?.margins?.members || 0}%) / 100`
        },
        boarding: {
          title: '寄养业务成本',
          formula: '寄养收入 × (100 - 寄养毛利率) / 100', 
          calculation: `¥{boardingRevenue} × (100 - ${data?.cost?.margins?.boarding || 0}%) / 100`
        },
        medical: {
          title: '医疗业务成本',
          formula: '医疗收入 × (100 - 医疗毛利率) / 100',
          calculation: `¥{medicalRevenue} × (100 - ${data?.cost?.margins?.medical || 0}%) / 100`
        },
        retail: {
          title: '零售业务成本', 
          formula: '零售收入 × (100 - 零售毛利率) / 100',
          calculation: `¥{retailRevenue} × (100 - ${data?.cost?.margins?.retail || 0}%) / 100`
        },
        cafe: {
          title: '餐饮业务成本',
          formula: '餐饮收入 × (100 - 餐饮毛利率) / 100', 
          calculation: `¥{cafeRevenue} × (100 - ${data?.cost?.margins?.cafe || 0}%) / 100`
        }
      };
    }
  }

  return CostCalculator;
})();