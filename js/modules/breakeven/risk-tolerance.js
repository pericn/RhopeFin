// 风险承受能力分析模块
window.BreakevenRiskTolerance = (function() {
  'use strict';

  /**
   * 风险承受能力分析组件
   * 分析在当前盈利水平下可承受的成本上升和收入下降幅度
   * @param {Object} props - 组件属性
   * @param {Object} props.breakeven - 盈亏平衡分析数据
   * @param {string} props.currency - 货币符号
   * @returns {React.Element} React 组件
   */
  const RiskToleranceAnalysis = ({ breakeven, currency }) => {
    if (!breakeven) return null;

    return React.createElement(window.UIComponents.Section, {
      title: '风险承受能力分析'
    }, [
      // 成本上升承受度
      React.createElement('div', {
        key: 'cost-tolerance',
        className: 'bg-orange-50 rounded-lg p-4'
      }, [
        React.createElement('h5', {
          key: 'title',
          className: 'font-medium text-orange-800 mb-3'
        }, '成本上升承受度'),
        React.createElement('div', {
          key: 'content',
          className: 'space-y-2'
        }, [
          React.createElement('div', {
            key: 'amount',
            className: 'text-2xl font-bold text-orange-700'
          }, `${currency}${breakeven.maxCostIncrease.toLocaleString()}`),
          React.createElement('div', {
            key: 'percentage',
            className: 'text-sm text-orange-600'
          }, `成本最多可增加 ${breakeven.maxCostIncreasePercent.toFixed(1)}%`),
          React.createElement('div', {
            key: 'explanation',
            className: 'text-xs text-orange-500 mt-2'
          }, '在此范围内成本增加仍可保持盈利')
        ])
      ]),

      // 收入下降承受度
      React.createElement('div', {
        key: 'revenue-tolerance',
        className: 'bg-red-50 rounded-lg p-4'
      }, [
        React.createElement('h5', {
          key: 'title',
          className: 'font-medium text-red-800 mb-3'
        }, '收入下降承受度'),
        React.createElement('div', {
          key: 'content',
          className: 'space-y-2'
        }, [
          React.createElement('div', {
            key: 'amount',
            className: 'text-2xl font-bold text-red-700'
          }, `${currency}${breakeven.maxRevenueDecrease.toLocaleString()}`),
          React.createElement('div', {
            key: 'percentage',
            className: 'text-sm text-red-600'
          }, `收入最多可下降 ${breakeven.maxRevenueDecreasePercent.toFixed(1)}%`),
          React.createElement('div', {
            key: 'explanation',
            className: 'text-xs text-red-500 mt-2'
          }, '在此范围内收入下降仍可保持盈利')
        ])
      ]),

      // 风险等级评估
      React.createElement('div', {
        key: 'risk-level',
        className: 'bg-blue-50 rounded-lg p-4'
      }, [
        React.createElement('h5', {
          key: 'title',
          className: 'font-medium text-blue-800 mb-3'
        }, '风险等级评估'),
        React.createElement('div', {
          key: 'content'
        }, [
          React.createElement('div', {
            key: 'level',
            className: `text-lg font-bold ${window.BreakevenUtils.getRiskLevelColor(breakeven.maxRevenueDecreasePercent)}`
          }, window.BreakevenUtils.getRiskLevel(breakeven.maxRevenueDecreasePercent)),
          React.createElement('div', {
            key: 'description',
            className: 'text-sm text-blue-600 mt-1'
          }, window.BreakevenUtils.getRiskDescription(breakeven.maxRevenueDecreasePercent))
        ])
      ])
    ]);
  };

  /**
   * 计算风险承受能力指标
   * @param {number} currentRevenue - 当前收入
   * @param {number} totalCost - 总成本
   * @param {number} fixedCost - 固定成本
   * @returns {Object} 风险承受能力数据
   */
  const calculateRiskTolerance = (currentRevenue, totalCost, fixedCost) => {
    const currentProfit = currentRevenue - totalCost;
    
    // 成本上升承受度
    const maxCostIncrease = currentProfit;
    const maxCostIncreasePercent = totalCost > 0 ? (maxCostIncrease / totalCost) * 100 : 0;
    
    // 收入下降承受度  
    const maxRevenueDecrease = currentProfit;
    const maxRevenueDecreasePercent = currentRevenue > 0 ? (maxRevenueDecrease / currentRevenue) * 100 : 0;
    
    return {
      maxCostIncrease: Math.max(0, maxCostIncrease),
      maxCostIncreasePercent: Math.max(0, maxCostIncreasePercent),
      maxRevenueDecrease: Math.max(0, maxRevenueDecrease),
      maxRevenueDecreasePercent: Math.max(0, maxRevenueDecreasePercent),
      riskLevel: window.BreakevenUtils.getRiskLevel(maxRevenueDecreasePercent),
      isHighRisk: maxRevenueDecreasePercent < 10
    };
  };

  /**
   * 获取风险承受能力洞察
   * @param {Object} riskTolerance - 风险承受能力数据
   * @param {string} currency - 货币符号
   * @returns {Array} 洞察数组
   */
  const getRiskInsights = (riskTolerance, currency) => {
    const insights = [];
    
    // 成本敏感性洞察
    if (riskTolerance.maxCostIncreasePercent < 5) {
      insights.push({
        type: 'warning',
        title: '成本敏感性高',
        message: '成本控制要求严格，任何成本增加都会显著影响盈利能力',
        recommendation: '建议加强成本管控，寻找降本增效机会'
      });
    } else if (riskTolerance.maxCostIncreasePercent > 20) {
      insights.push({
        type: 'positive',
        title: '成本缓冲充足',
        message: '具备较好的成本上升承受能力',
        recommendation: '可考虑适当的质量或服务升级投入'
      });
    }
    
    // 收入敏感性洞察
    if (riskTolerance.maxRevenueDecreasePercent < 10) {
      insights.push({
        type: 'warning',
        title: '收入风险较高',
        message: '收入稳定性要求很高，市场波动影响较大',
        recommendation: '建议多元化收入来源，提升客户粘性'
      });
    } else if (riskTolerance.maxRevenueDecreasePercent > 30) {
      insights.push({
        type: 'positive', 
        title: '抗风险能力强',
        message: '即使收入出现较大波动也能保持盈利',
        recommendation: '可考虑更积极的市场扩张策略'
      });
    }
    
    return insights;
  };

  // 暴露公共API
  return {
    RiskToleranceAnalysis,
    calculateRiskTolerance,
    getRiskInsights
  };

})();