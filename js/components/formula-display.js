// 设置页面公式显示组件 - 用于右侧栏显示实时计算数据
window.FormulaDisplay = (function() {
  'use strict';

  // 简化版公式显示组件，用于设置页面右侧栏 - 统一两行格式
  const FormulaItem = ({ title, value, formula, calculation, currency = "¥", isHighlighted = false }) => {
    const formatNumber = (num) => {
      if (num === undefined || num === null || isNaN(num)) return '0';
      if (typeof num === 'string') return num;
      // 统一使用"万"作为单位
      return `${(num / 10000).toFixed(2)}万`;
    };

    return React.createElement('div', {
      className: `py-2 ${isHighlighted ? 'bg-blue-50 rounded-lg px-3' : ''}`
    }, [
      React.createElement('div', {
        key: 'header',
        className: 'flex justify-between items-start'
      }, [
        React.createElement('div', {
          key: 'title',
          className: 'text-sm font-medium text-gray-700'
        }, title),
        React.createElement('div', {
          key: 'value',
          className: `text-sm font-bold ${isHighlighted ? 'text-blue-700' : 'text-gray-900'}`
        }, typeof value === 'number' ? `${currency}${formatNumber(value)}` : value)
      ]),
      // 第一行：公式
      formula && React.createElement('div', {
        key: 'formula',
        className: 'mt-1 text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded'
      }, `公式: ${formula}`),
      // 第二行：数字计算过程
      calculation && React.createElement('div', {
        key: 'calculation',
        className: 'mt-1 text-xs text-gray-500'
      }, `计算: ${calculation}`)
    ]);
  };

  // 主公式显示组件
  const FormulaDisplay = ({ data, formulaEngine }) => {
    // 这里需要获取最新的计算结果
    // 由于在设置页面无法直接访问计算结果，我们可以显示一些关键的输入参数和计算公式
    if (!data || !data.basic || !data.revenue || !data.cost || !data.investment) {
      return React.createElement('div', {
        className: 'text-center py-8 text-gray-500'
      }, '暂无数据');
    }

    // 执行计算以获取最新结果
    let calculations = null;
    if (window.MainCalculator && formulaEngine) {
      try {
        const calculator = new window.MainCalculator(formulaEngine);
        calculations = calculator.calculate(data);
      } catch (error) {
        console.warn('计算过程中出现错误:', error);
      }
    }

    // 计算收入数据
    const calculateRevenueData = () => {
      const member = data?.revenue?.member || {};
      const boarding = data?.revenue?.boarding || {};
      const medical = data?.revenue?.medical || {};
      const retail = data?.revenue?.retail || {};
      const cafe = data?.revenue?.cafe || {};
      const daysPerYear = data?.basic?.daysPerYear || 365;

      const memberRevenue = (member.count || 0) * (
        ((member.basePct || 0) / 100 * (member.basePrice || 0)) +
        ((member.proPct || 0) / 100 * (member.proPrice || 0)) +
        ((member.vipPct || 0) / 100 * (member.vipPrice || 0))
      );
      
      const boardingRevenue = (boarding.rooms || 0) * (boarding.adr || 0) * daysPerYear * ((boarding.occ || 0) / 100);
      const medicalRevenue = (medical.monthlyRevenue || 0) * 12;
      const retailRevenue = (retail.monthlyRevenue || 0) * 12;
      const cafeRevenue = (cafe.monthlyRevenue || 0) * 12;
      
      const totalRevenue = memberRevenue + boardingRevenue + medicalRevenue + retailRevenue + cafeRevenue;

      return {
        memberRevenue,
        boardingRevenue,
        medicalRevenue,
        retailRevenue,
        cafeRevenue,
        totalRevenue
      };
    };

    const revenueData = calculateRevenueData();
    
    // 计算业务成本(COGS)
    const totalCOGS = 
      (revenueData.memberRevenue * (100 - (data.cost?.margins?.members || 0)) / 100) +
      (revenueData.boardingRevenue * (100 - (data.cost?.margins?.boarding || 0)) / 100) +
      (revenueData.medicalRevenue * (100 - (data.cost?.margins?.medical || 0)) / 100) +
      (revenueData.retailRevenue * (100 - (data.cost?.margins?.retail || 0)) / 100) +
      (revenueData.cafeRevenue * (100 - (data.cost?.margins?.cafe || 0)) / 100);

    // 计算毛利润和毛利率
    const grossProfit = revenueData.totalRevenue - totalCOGS;
    const grossMargin = revenueData.totalRevenue > 0 ? (grossProfit / revenueData.totalRevenue) * 100 : 0;

    return React.createElement('div', {
      className: 'space-y-4'
    }, [
      React.createElement('div', {
        key: 'summary',
        className: 'space-y-3'
      }, [
        React.createElement('h4', {
          key: 'title',
          className: 'text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2'
        }, '📈 核心指标'),
        
        calculations && React.createElement(FormulaItem, {
          key: 'revenue',
          title: '年度总收入',
          value: calculations.revenue.total,
          formula: '各项收入之和',
          calculation: `会员${(revenueData.memberRevenue/10000).toFixed(2)}万 + 寄养${(revenueData.boardingRevenue/10000).toFixed(2)}万 + 医疗${(revenueData.medicalRevenue/10000).toFixed(2)}万 + 零售${(revenueData.retailRevenue/10000).toFixed(2)}万 + 餐饮${(revenueData.cafeRevenue/10000).toFixed(2)}万`,
          isHighlighted: true
        }),
        
        calculations && React.createElement(FormulaItem, {
          key: 'cogs',
          title: '业务成本总计',
          value: calculations.cost.cogs?.total || 0,
          formula: '各业务收入 × (100% - 毛利率) ÷ 100%',
          calculation: `会员成本${((revenueData.memberRevenue * (100 - (data.cost?.margins?.members || 0)) / 100)/10000).toFixed(2)}万 + 寄养成本${((revenueData.boardingRevenue * (100 - (data.cost?.margins?.boarding || 0)) / 100)/10000).toFixed(2)}万 + 其他业务成本...`,
          isHighlighted: true
        }),
        
        calculations && React.createElement(FormulaItem, {
          key: 'fixed-cost',
          title: '年度固定成本',
          value: calculations.cost?.fixed?.total || 0,
          formula: '租金 + 人工 + 物业 + 其他固定支出',
          calculation: `租金${((data.basic?.areaSqm || 0) * (data.cost?.fixed?.rentPerSqmPerDay || 0) * (data.basic?.daysPerYear || 365) / 10000).toFixed(2)}万 + 人工${((data.cost?.fixed?.staffCount || 0) * (data.cost?.fixed?.staffSalaryPerMonth || 0) * 12 / 10000).toFixed(2)}万 + 物业及其他`,
          isHighlighted: true
        }),
        
        calculations && React.createElement(FormulaItem, {
          key: 'variable-cost',
          title: '年度变动成本',
          value: calculations.cost?.variable?.total || 0,
          formula: '水电费 + 其他变动费用 + 自定义变动成本',
          calculation: `年度水电费¥${((data.cost?.variable?.utilitiesPerYear || 0)/10000).toFixed(2)}万 + 年度其他变动¥${((data.cost?.variable?.miscVariableAnnual || 0)/10000).toFixed(2)}万 + 自定义变动成本`,
          isHighlighted: true
        }),
        
        React.createElement(FormulaItem, {
          key: 'gross-profit',
          title: '年度毛利润',
          value: grossProfit,
          formula: '总收入 - 业务成本',
          calculation: `¥${(revenueData.totalRevenue/10000).toFixed(2)}万 - ¥${(totalCOGS/10000).toFixed(2)}万 = ¥${(grossProfit/10000).toFixed(2)}万`,
          isHighlighted: true
        }),
        
        React.createElement(FormulaItem, {
          key: 'gross-margin',
          title: '年度毛利率',
          value: `${grossMargin.toFixed(1)}%`,
          formula: '(毛利润 ÷ 总收入) × 100%',
          calculation: `(¥${(grossProfit/10000).toFixed(2)}万 ÷ ¥${(revenueData.totalRevenue/10000).toFixed(2)}万) × 100% = ${grossMargin.toFixed(1)}%`,
          isHighlighted: true
        }),
        
        calculations && React.createElement(FormulaItem, {
          key: 'net-profit',
          title: '年度净利润',
          value: calculations.profitability?.profit || 0,
          formula: '毛利润 - 运营成本(固定+变动)',
          calculation: `¥${(grossProfit/10000).toFixed(2)}万 - (固定成本¥${((calculations.cost?.fixed?.total || 0)/10000).toFixed(2)}万 + 变动成本¥${((calculations.cost?.variable?.total || 0)/10000).toFixed(2)}万) = ¥${((calculations.profitability?.profit || 0)/10000).toFixed(2)}万`,
          isHighlighted: true
        }),
        
        calculations && React.createElement(FormulaItem, {
          key: 'margin',
          title: '年度净利率',
          value: `${(calculations.profitability?.margin || 0).toFixed(1)}%`,
          formula: '(净利润 ÷ 总收入) × 100%',
          calculation: `(¥${((calculations.profitability?.profit || 0)/10000).toFixed(2)}万 ÷ ¥${((calculations.revenue?.total || 0)/10000).toFixed(2)}万) × 100% = ${(calculations.profitability?.margin || 0).toFixed(1)}%`,
          isHighlighted: true
        })
      ]),

      React.createElement('div', {
        key: 'additional-metrics',
        className: 'space-y-3'
      }, [
        React.createElement('h4', {
          key: 'title',
          className: 'text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2'
        }, '📊 附加指标'),
        
        data.basic?.daysPerYear > 0 && calculations && React.createElement(FormulaItem, {
          key: 'daily-revenue',
          title: '日均收入',
          value: (calculations.revenue?.total || 0) / (data.basic?.daysPerYear || 1),
          formula: '年度总收入 ÷ 营业天数',
          calculation: `¥${((calculations.revenue?.total || 0)/10000).toFixed(2)}万 ÷ ${data.basic?.daysPerYear || 0}天 = ¥${(((calculations.revenue?.total || 0) / (data.basic?.daysPerYear || 1)) / 10000).toFixed(3)}万/天`
        }),
        
        data.basic?.daysPerYear > 0 && calculations && React.createElement(FormulaItem, {
          key: 'daily-cost',
          title: '日均成本',
          value: (calculations.cost?.total || 0) / (data.basic?.daysPerYear || 1),
          formula: '年度总成本 ÷ 营业天数',
          calculation: `¥${((calculations.cost?.total || 0)/10000).toFixed(2)}万 ÷ ${data.basic?.daysPerYear || 0}天 = ¥${(((calculations.cost?.total || 0) / (data.basic?.daysPerYear || 1)) / 10000).toFixed(3)}万/天`
        }),
        
        data.basic?.areaSqm > 0 && calculations && React.createElement(FormulaItem, {
          key: 'revenue-per-sqm',
          title: '每平米年收入',
          value: (calculations.revenue?.total || 0) / (data.basic?.areaSqm || 1),
          formula: '年度总收入 ÷ 营业面积',
          calculation: `¥${((calculations.revenue?.total || 0)/10000).toFixed(2)}万 ÷ ${data.basic?.areaSqm || 0}㎡ = ¥${((calculations.revenue?.total || 0) / (data.basic?.areaSqm || 1)).toLocaleString()}元/㎡`,
          currency: '¥'
        }),
        
        data.cost?.fixed?.staffCount > 0 && calculations && React.createElement(FormulaItem, {
          key: 'revenue-per-staff',
          title: '人均创收',
          value: (calculations.revenue?.total || 0) / (data.cost?.fixed?.staffCount || 1),
          formula: '年度总收入 ÷ 员工总数',
          calculation: `¥${((calculations.revenue?.total || 0)/10000).toFixed(2)}万 ÷ ${data.cost?.fixed?.staffCount || 0}人 = ¥${((calculations.revenue?.total || 0) / (data.cost?.fixed?.staffCount || 1)).toLocaleString()}元/人`,
          currency: '¥'
        })
      ]),

      React.createElement('div', {
        key: 'revenue-details',
        className: 'space-y-3'
      }, [
        React.createElement('h4', {
          key: 'title',
          className: 'text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2'
        }, '💰 收入明细计算'),
        
        React.createElement(FormulaItem, {
          key: 'member',
          title: '会员收入',
          value: revenueData.memberRevenue,
          formula: '会员数 × (基础%×基础费 + 高级%×高级费 + VIP%×VIP费)',
          calculation: `${data.revenue.member?.count || 0}人 × (${data.revenue.member?.basePct || 0}%×¥${data.revenue.member?.basePrice || 0} + ${data.revenue.member?.proPct || 0}%×¥${data.revenue.member?.proPrice || 0} + ${data.revenue.member?.vipPct || 0}%×¥${data.revenue.member?.vipPrice || 0})`
        }),
        
        React.createElement(FormulaItem, {
          key: 'boarding',
          title: '寄养收入',
          value: revenueData.boardingRevenue,
          formula: '房间数 × 房价 × 365天 × 入住率',
          calculation: `${data.revenue.boarding?.rooms || 0}间 × ¥${data.revenue.boarding?.adr || 0}/天 × 365天 × ${data.revenue.boarding?.occ || 0}% = ¥${revenueData.boardingRevenue.toLocaleString()}`
        }),
        
        React.createElement(FormulaItem, {
          key: 'medical',
          title: '医疗收入',
          value: revenueData.medicalRevenue,
          formula: '月收入 × 12个月',
          calculation: `¥${data.revenue.medical?.monthlyRevenue || 0}/月 × 12个月 = ¥${revenueData.medicalRevenue.toLocaleString()}`
        }),
        
        React.createElement(FormulaItem, {
          key: 'retail',
          title: '零售收入',
          value: revenueData.retailRevenue,
          formula: '月收入 × 12个月',
          calculation: `¥${data.revenue.retail?.monthlyRevenue || 0}/月 × 12个月 = ¥${revenueData.retailRevenue.toLocaleString()}`
        }),
        
        React.createElement(FormulaItem, {
          key: 'cafe',
          title: '餐饮收入',
          value: revenueData.cafeRevenue,
          formula: '月收入 × 12个月',
          calculation: `¥${data.revenue.cafe?.monthlyRevenue || 0}/月 × 12个月 = ¥${revenueData.cafeRevenue.toLocaleString()}`
        })
      ]),

      // 业务成本(COGS)明细计算
      React.createElement('div', {
        key: 'cogs-details', 
        className: 'space-y-3'
      }, [
        React.createElement('h4', {
          key: 'title',
          className: 'text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2'
        }, '📋 业务成本(COGS)计算'),
        
        React.createElement(FormulaItem, {
          key: 'member-cogs',
          title: '会员业务成本',
          value: (revenueData.memberRevenue * (100 - (data.cost?.margins?.members || 0)) / 100),
          formula: '会员收入 × (100% - 会员毛利率) ÷ 100%',
          calculation: `¥${(revenueData.memberRevenue/10000).toFixed(2)}万 × (100% - ${data.cost?.margins?.members || 0}%) ÷ 100% = ¥${((revenueData.memberRevenue * (100 - (data.cost?.margins?.members || 0)) / 100)/10000).toFixed(2)}万`
        }),
        
        React.createElement(FormulaItem, {
          key: 'boarding-cogs',
          title: '寄养业务成本',
          value: (revenueData.boardingRevenue * (100 - (data.cost?.margins?.boarding || 0)) / 100),
          formula: '寄养收入 × (100% - 寄养毛利率) ÷ 100%',
          calculation: `¥${(revenueData.boardingRevenue/10000).toFixed(2)}万 × (100% - ${data.cost?.margins?.boarding || 0}%) ÷ 100% = ¥${((revenueData.boardingRevenue * (100 - (data.cost?.margins?.boarding || 0)) / 100)/10000).toFixed(2)}万`
        }),
        
        React.createElement(FormulaItem, {
          key: 'medical-cogs',
          title: '医疗业务成本',
          value: (revenueData.medicalRevenue * (100 - (data.cost?.margins?.medical || 0)) / 100),
          formula: '医疗收入 × (100% - 医疗毛利率) ÷ 100%',
          calculation: `¥${(revenueData.medicalRevenue/10000).toFixed(2)}万 × (100% - ${data.cost?.margins?.medical || 0}%) ÷ 100% = ¥${((revenueData.medicalRevenue * (100 - (data.cost?.margins?.medical || 0)) / 100)/10000).toFixed(2)}万`
        }),
        
        React.createElement(FormulaItem, {
          key: 'retail-cogs',
          title: '零售业务成本',
          value: (revenueData.retailRevenue * (100 - (data.cost?.margins?.retail || 0)) / 100),
          formula: '零售收入 × (100% - 零售毛利率) ÷ 100%',
          calculation: `¥${(revenueData.retailRevenue/10000).toFixed(2)}万 × (100% - ${data.cost?.margins?.retail || 0}%) ÷ 100% = ¥${((revenueData.retailRevenue * (100 - (data.cost?.margins?.retail || 0)) / 100)/10000).toFixed(2)}万`
        }),
        
        React.createElement(FormulaItem, {
          key: 'cafe-cogs',
          title: '餐饮业务成本',
          value: (revenueData.cafeRevenue * (100 - (data.cost?.margins?.cafe || 0)) / 100),
          formula: '餐饮收入 × (100% - 餐饮毛利率) ÷ 100%',
          calculation: `¥${(revenueData.cafeRevenue/10000).toFixed(2)}万 × (100% - ${data.cost?.margins?.cafe || 0}%) ÷ 100% = ¥${((revenueData.cafeRevenue * (100 - (data.cost?.margins?.cafe || 0)) / 100)/10000).toFixed(2)}万`
        })
      ]),

      // 固定成本和变动成本明细
      React.createElement('div', {
        key: 'cost-details',
        className: 'space-y-3'
      }, [
        React.createElement('h4', {
          key: 'title',
          className: 'text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2'
        }, '💸 运营成本计算'),
        
        React.createElement(FormulaItem, {
          key: 'rent',
          title: '租金成本',
          value: data.basic && data.cost.fixed ? 
            (data.basic.areaSqm * data.cost.fixed.rentPerSqmPerDay * (data.basic.daysPerYear || 365)) : 0,
          formula: '营业面积 × 日租金单价 × 营业天数',
          calculation: `${data.basic?.areaSqm || 0}㎡ × ¥${data.cost?.fixed?.rentPerSqmPerDay || 0}/㎡/天 × ${data.basic?.daysPerYear || 365}天 = ¥${((data.basic?.areaSqm || 0) * (data.cost?.fixed?.rentPerSqmPerDay || 0) * (data.basic?.daysPerYear || 365)).toLocaleString()}`
        }),
        
        React.createElement(FormulaItem, {
          key: 'staff',
          title: '人工成本',
          value: data.cost.fixed ? 
            (data.cost.fixed.staffCount * data.cost.fixed.staffSalaryPerMonth * 12) : 0,
          formula: '员工数 × 月薪 × 12个月',
          calculation: `${data.cost?.fixed?.staffCount || 0}人 × ¥${data.cost?.fixed?.staffSalaryPerMonth || 0}/人/月 × 12个月 = ¥${((data.cost?.fixed?.staffCount || 0) * (data.cost?.fixed?.staffSalaryPerMonth || 0) * 12).toLocaleString()}`
        }),
        
        React.createElement(FormulaItem, {
          key: 'property',
          title: '物业费',
          value: data.basic && data.cost.fixed ? 
            (data.basic.areaSqm * data.cost.fixed.propertyPerSqmPerMonth * 12) : 0,
          formula: '营业面积 × 月物业费单价 × 12个月',
          calculation: `${data.basic?.areaSqm || 0}㎡ × ¥${data.cost?.fixed?.propertyPerSqmPerMonth || 0}/㎡/月 × 12个月 = ¥${((data.basic?.areaSqm || 0) * (data.cost?.fixed?.propertyPerSqmPerMonth || 0) * 12).toLocaleString()}`
        }),
        
        calculations && React.createElement(FormulaItem, {
          key: 'investment',
          title: '初始投资',
          value: calculations.investment?.total || 0,
          formula: '装修投资 + 医疗设备 + 其他投资',
          calculation: `¥${((data.basic?.areaSqm || 0) * (data.investment?.fitoutStandard || 0)).toLocaleString()}装修 + ¥${(data.investment?.medicalInitial || 0).toLocaleString()}设备 + 其他投资`
        })
      ]),

      React.createElement('div', {
        key: 'efficiency-metrics',
        className: 'space-y-3'
      }, [
        React.createElement('h4', {
          key: 'title',
          className: 'text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2'
        }, '⚡ 投资回报分析'),
        
        calculations && data.basic?.areaSqm > 0 && React.createElement(FormulaItem, {
          key: 'roi',
          title: '投资回报率',
          value: `${(calculations.profitability?.roi || 0).toFixed(1)}%`,
          formula: '(年度净利润 ÷ 初始投资) × 100%',
          calculation: `(¥${((calculations.profitability?.profit || 0)/10000).toFixed(2)}万 ÷ ¥${((calculations.investment?.total || 0)/10000).toFixed(2)}万) × 100% = ${(calculations.profitability?.roi || 0).toFixed(1)}%`
        }),
        
        calculations && React.createElement(FormulaItem, {
          key: 'payback-years',
          title: '回本周期',
          value: (calculations.profitability?.paybackYears === Infinity || (calculations.profitability?.profit || 0) <= 0) ? '无法回本' : `${(calculations.profitability?.paybackYears || 0).toFixed(1)}年`,
          formula: '初始投资 ÷ 年度净利润',
          calculation: (calculations.profitability?.paybackYears === Infinity || (calculations.profitability?.profit || 0) <= 0) ? '年度净利润 ≤ 0，无法回本' : `¥${((calculations.investment?.total || 0)/10000).toFixed(2)}万 ÷ ¥${((calculations.profitability?.profit || 0)/10000).toFixed(2)}万 = ${(calculations.profitability?.paybackYears || 0).toFixed(1)}年`
        })
      ])
    ]);
  };

  return {
    FormulaDisplay
  };

})();