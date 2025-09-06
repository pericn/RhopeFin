// 收入计算模块 - 负责所有收入相关计算
window.RevenueCalculator = (function() {
  'use strict';

  class RevenueCalculator {
    constructor(formulaEngine) {
      this.formulaEngine = formulaEngine;
    }

    // 主收入计算方法
    calculate(data) {
      // 添加防护检查
      if (!data || !data.revenue || !data.basic) {
        console.warn('Revenue calculation: incomplete data structure');
        return {
          member: 0,
          boarding: 0,
          medical: 0,
          retail: 0,
          cafe: 0,
          custom: 0,
          total: 0,
          breakdown: {}
        };
      }

      const member = this.calculateMemberRevenue(data.revenue.member);
      const boarding = this.calculateBoardingRevenue(data.revenue.boarding, data.basic.daysPerYear);
      const medical = this.calculateMedicalRevenue(data.revenue.medical);
      const retail = this.calculateRetailRevenue(data.revenue.retail);
      const cafe = this.calculateCafeRevenue(data.revenue.cafe);
      const custom = this.calculateCustomRevenue(data.revenue.custom || []);

      const total = member + boarding + medical + retail + cafe + custom;

      return {
        member,
        boarding,
        medical,
        retail,
        cafe,
        custom,
        total,
        breakdown: {
          memberFormula: this.getMemberRevenueFormula(data.revenue.member),
          boardingFormula: this.getBoardingRevenueFormula(data.revenue.boarding, data.basic.daysPerYear),
          medicalFormula: this.getMedicalRevenueFormula(data.revenue.medical),
          retailFormula: this.getRetailRevenueFormula(data.revenue.retail),
          cafeFormula: this.getCafeRevenueFormula(data.revenue.cafe)
        }
      };
    }

    // 会员收入计算
    calculateMemberRevenue(memberData) {
      if (!memberData) return 0;
      const count = isNaN(memberData.count) ? 0 : (memberData.count || 0);
      const basePct = isNaN(memberData.basePct) ? 0 : (memberData.basePct || 0);
      const proPct = isNaN(memberData.proPct) ? 0 : (memberData.proPct || 0);
      const vipPct = isNaN(memberData.vipPct) ? 0 : (memberData.vipPct || 0);
      const basePrice = isNaN(memberData.basePrice) ? 0 : (memberData.basePrice || 0);
      const proPrice = isNaN(memberData.proPrice) ? 0 : (memberData.proPrice || 0);
      const vipPrice = isNaN(memberData.vipPrice) ? 0 : (memberData.vipPrice || 0);
      
      const baseMembers = ((count * basePct) / 100) || 0;
      const proMembers = ((count * proPct) / 100) || 0;
      const vipMembers = ((count * vipPct) / 100) || 0;
      
      const revenue = (baseMembers * basePrice + proMembers * proPrice + vipMembers * vipPrice) || 0;
      return revenue;
    }

    // 寄养收入计算
    calculateBoardingRevenue(boardingData, daysPerYear) {
      if (!boardingData) return 0;
      const rooms = isNaN(boardingData.rooms) ? 0 : (boardingData.rooms || 0);
      const adr = isNaN(boardingData.adr) ? 0 : (boardingData.adr || 0);
      const occ = isNaN(boardingData.occ) ? 0 : (boardingData.occ || 0);
      const days = isNaN(daysPerYear) ? 365 : (daysPerYear || 365);
      
      const occupancy = Math.min(Math.max(occ, 0), 100) / 100;
      const revenue = (rooms * adr * days * occupancy) || 0;
      return revenue;
    }

    // 医疗收入计算
    calculateMedicalRevenue(medicalData) {
      if (!medicalData) return 0;
      const monthlyRevenue = isNaN(medicalData.monthlyRevenue) ? 0 : (medicalData.monthlyRevenue || 0);
      const revenue = (monthlyRevenue * 12) || 0;
      return revenue;
    }

    // 零售收入计算
    calculateRetailRevenue(retailData) {
      if (!retailData) return 0;
      const monthlyRevenue = isNaN(retailData.monthlyRevenue) ? 0 : (retailData.monthlyRevenue || 0);
      const revenue = (monthlyRevenue * 12) || 0;
      return revenue;
    }

    // 餐饮/社交收入计算
    calculateCafeRevenue(cafeData) {
      if (!cafeData) return 0;
      const monthlyRevenue = isNaN(cafeData.monthlyRevenue) ? 0 : (cafeData.monthlyRevenue || 0);
      const revenue = (monthlyRevenue * 12) || 0;
      return revenue;
    }

    // 自定义收入计算
    calculateCustomRevenue(customModules) {
      if (!Array.isArray(customModules)) return 0;
      return customModules.reduce((total, module) => {
        if (module && module.enabled !== false && this.formulaEngine) {
          try {
            const revenue = this.formulaEngine.evaluateFormula(module.formula || '0', module.variables || []);
            // 确保收入不为NaN
            const cleanRevenue = isNaN(revenue) ? 0 : (revenue || 0);
            return total + cleanRevenue;
          } catch (error) {
            console.warn('Custom revenue calculation error:', error);
            return total;
          }
        }
        return total;
      }, 0);
    }

    // 获取会员收入公式显示
    getMemberRevenueFormula(memberData) {
      return {
        title: '会员收入计算',
        formula: '会员数 × (基础会员比例% × 基础年费 + 高级会员比例% × 高级年费 + VIP会员比例% × VIP年费)',
        calculation: `${memberData.count} × (${memberData.basePct}% × ${memberData.basePrice} + ${memberData.proPct}% × ${memberData.proPrice} + ${memberData.vipPct}% × ${memberData.vipPrice})`,
        result: this.calculateMemberRevenue(memberData)
      };
    }

    // 获取寄养收入公式显示
    getBoardingRevenueFormula(boardingData, daysPerYear) {
      return {
        title: '寄养收入计算',
        formula: '房间数 × 房价/天 × 年营业天数 × 入住率%',
        calculation: `${boardingData.rooms} × ${boardingData.adr} × ${daysPerYear} × ${boardingData.occ}%`,
        result: this.calculateBoardingRevenue(boardingData, daysPerYear)
      };
    }

    // 获取医疗收入公式显示
    getMedicalRevenueFormula(medicalData) {
      return {
        title: '医疗收入计算',
        formula: '月收入 × 12',
        calculation: `${medicalData.monthlyRevenue} × 12`,
        result: this.calculateMedicalRevenue(medicalData)
      };
    }

    // 获取零售收入公式显示
    getRetailRevenueFormula(retailData) {
      return {
        title: '零售收入计算',
        formula: '月收入 × 12',
        calculation: `${retailData.monthlyRevenue} × 12`,
        result: this.calculateRetailRevenue(retailData)
      };
    }

    // 获取餐饮/社交收入公式显示
    getCafeRevenueFormula(cafeData) {
      return {
        title: '餐饮/社交收入计算',
        formula: '月收入 × 12',
        calculation: `${cafeData.monthlyRevenue} × 12`,
        result: this.calculateCafeRevenue(cafeData)
      };
    }
  }

  return RevenueCalculator;
})();