// 敏感性分析模块 - 主组件
window.BreakevenSensitivity = (function() {
  'use strict';

  /**
   * 敏感性分析组件
   * 分析关键参数变化对盈利能力的影响
   * @param {Object} props - 组件属性
   * @param {Object} props.breakeven - 盈亏平衡分析数据
   * @param {string} props.currency - 货币符号
   * @returns {React.Element} React 组件
   */
  const SensitivityAnalysis = ({ breakeven, currency }) => {
    if (!breakeven || !breakeven.sensitivity) return null;

    const scenarios = [
      {
        name: '成本增加 5%',
        impact: breakeven.sensitivity.costIncrease5Pct,
        type: 'cost',
        changeType: 'increase'
      },
      {
        name: '收入减少 5%',
        impact: breakeven.sensitivity.revenueDecrease5Pct,
        type: 'revenue',
        changeType: 'decrease'
      }
    ];

    return React.createElement(window.UIComponents.Section, {
      title: '📊 敏感性分析'
    }, [
      // 说明文本
      React.createElement('div', {
        key: 'explanation',
        className: 'bg-yellow-50 rounded-lg p-3 mb-4 text-sm text-yellow-700'
      }, '分析关键参数变化对盈利能力的影响'),

      // 场景分析
      React.createElement('div', {
        key: 'scenarios',
        className: 'grid grid-cols-1 md:grid-cols-2 gap-4'
      }, scenarios.map(scenario => {
        const isProfitable = scenario.impact.profit > 0;
        const marginChange = scenario.impact.margin - breakeven.currentMargin;

        return React.createElement('div', {
          key: scenario.name,
          className: `border rounded-lg p-4 ${isProfitable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`
        }, [
          // 场景标题
          React.createElement('h5', {
            key: 'title',
            className: 'font-medium mb-3'
          }, scenario.name),

          // 指标展示
          React.createElement('div', {
            key: 'metrics',
            className: 'space-y-2'
          }, [
            // 预计利润
            React.createElement('div', {
              key: 'profit',
              className: 'flex justify-between'
            }, [
              React.createElement('span', {
                key: 'label',
                className: 'text-sm'
              }, '预计利润:'),
              React.createElement('span', {
                key: 'value',
                className: `text-sm font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`
              }, `${currency}${scenario.impact.profit.toLocaleString()}`)
            ]),

            // 利润率
            React.createElement('div', {
              key: 'margin',
              className: 'flex justify-between'
            }, [
              React.createElement('span', {
                key: 'label',
                className: 'text-sm'
              }, '利润率:'),
              React.createElement('span', {
                key: 'value',
                className: `text-sm font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`
              }, `${scenario.impact.margin.toFixed(1)}%`)
            ]),

            // 利润率变化
            React.createElement('div', {
              key: 'change',
              className: 'flex justify-between'
            }, [
              React.createElement('span', {
                key: 'label',
                className: 'text-sm'
              }, '利润率变化:'),
              React.createElement('span', {
                key: 'value',
                className: `text-sm font-bold ${marginChange >= 0 ? 'text-green-600' : 'text-red-600'}`
              }, `${marginChange >= 0 ? '+' : ''}${marginChange.toFixed(1)}%`)
            ])
          ])
        ]);
      }))
    ]);
  };

  // 从计算模块暴露功能，保持API兼容性
  const calculateSensitivityAnalysis = window.BreakevenSensitivityCalc.calculateSensitivityAnalysis;
  const performMultiParameterAnalysis = window.BreakevenSensitivityCalc.performMultiParameterAnalysis;
  const analyzeSensitivityResults = window.BreakevenSensitivityCalc.analyzeSensitivityResults;
  const getKeySensitivityMetrics = window.BreakevenSensitivityCalc.getKeySensitivityMetrics;
  const calculateScenario = window.BreakevenSensitivityCalc.calculateScenario;

  // 暴露公共API
  return {
    SensitivityAnalysis,
    calculateSensitivityAnalysis,
    performMultiParameterAnalysis,
    analyzeSensitivityResults,
    getKeySensitivityMetrics,
    calculateScenario
  };

})();