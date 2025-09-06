// 情景对比分析模块
// 提供三种情景（保守、基准、乐观）的详细对比分析

window.ScenarioComparison = (function() {

  // 情景对比表格组件
  const ScenarioComparison = ({ calculations, currency }) => {
    const scenarios = buildScenarioData(calculations);

    return React.createElement(window.UIComponents.Section, {
      title: '📋 情景对比分析',
      className: 'col-span-full'
    }, [
      React.createElement('div', {
        key: 'comparison-grid',
        className: 'grid grid-cols-1 lg:grid-cols-3 gap-4'
      }, scenarios.map(scenario => 
        React.createElement(ScenarioCard, {
          key: scenario.name,
          scenario: scenario,
          currency: currency
        })
      ))
    ]);
  };

  // 单个情景卡片组件
  const ScenarioCard = ({ scenario, currency }) => {
    return React.createElement('div', {
      className: `${scenario.bgColor} rounded-lg p-4 border`
    }, [
      // 卡片头部
      React.createElement('div', {
        key: 'header',
        className: `flex items-center gap-2 mb-4 ${scenario.textColor}`
      }, [
        React.createElement('span', {
          key: 'icon',
          className: 'text-lg'
        }, scenario.icon),
        React.createElement('h4', {
          key: 'name',
          className: 'font-semibold'
        }, scenario.name)
      ]),

      // 财务指标
      React.createElement('div', {
        key: 'metrics',
        className: 'space-y-3'
      }, [
        React.createElement(MetricRow, {
          key: 'revenue',
          label: '年收入',
          value: scenario.data.revenue || 0,
          currency: currency,
          valueClass: 'font-bold text-green-600'
        }),

        React.createElement(MetricRow, {
          key: 'cost',
          label: '年成本',
          value: scenario.data.cost || 0,
          currency: currency,
          valueClass: 'font-bold text-red-600'
        }),

        React.createElement('hr', {
          key: 'divider',
          className: 'border-gray-200'
        }),

        React.createElement(MetricRow, {
          key: 'profit',
          label: '净利润',
          value: scenario.data.profit || 0,
          currency: currency,
          valueClass: `font-bold ${(scenario.data.profit || 0) > 0 ? 'text-green-600' : 'text-red-600'}`
        }),

        React.createElement('div', {
          key: 'margin',
          className: 'flex justify-between items-center'
        }, [
          React.createElement('span', {
            key: 'label',
            className: 'text-sm text-gray-600'
          }, '利润率'),
          React.createElement('span', {
            key: 'value',
            className: `font-bold ${(scenario.data.margin || 0) > 0 ? 'text-green-600' : 'text-red-600'}`
          }, `${(scenario.data.margin || 0).toFixed(1)}%`)
        ]),

        React.createElement('div', {
          key: 'payback',
          className: 'flex justify-between items-center'
        }, [
          React.createElement('span', {
            key: 'label',
            className: 'text-sm text-gray-600'
          }, '回本周期'),
          React.createElement('span', {
            key: 'value',
            className: 'font-bold text-purple-600'
          }, scenario.data.paybackYears === Infinity ? '无法回本' : `${(scenario.data.paybackYears || 0).toFixed(1)}年`)
        ]),

        // 盈利状态指示器
        React.createElement('div', {
          key: 'status',
          className: 'text-center mt-4'
        }, [
          React.createElement('div', {
            key: 'indicator',
            className: `px-3 py-1 rounded-full text-xs font-medium ${
              (scenario.data.profit || 0) > 0 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`
          }, (scenario.data.profit || 0) > 0 ? '✅ 盈利' : '❌ 亏损')
        ])
      ])
    ]);
  };

  // 指标行组件
  const MetricRow = ({ label, value, currency, valueClass }) => {
    return React.createElement('div', {
      className: 'flex justify-between items-center'
    }, [
      React.createElement('span', {
        key: 'label',
        className: 'text-sm text-gray-600'
      }, label),
      React.createElement('span', {
        key: 'value',
        className: valueClass
      }, `${currency}${value.toLocaleString()}`)
    ]);
  };

  // 构建情景数据
  const buildScenarioData = (calculations) => {
    return [
      {
        name: '保守情况',
        data: calculations.scenarios.conservative,
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-800',
        icon: '📉'
      },
      {
        name: '基准情况',
        data: {
          revenue: calculations.revenue?.total || 0,
          cost: calculations.cost?.total || 0,
          profit: calculations.profitability?.profit || 0,
          margin: calculations.profitability?.margin || 0,
          paybackYears: calculations.profitability?.paybackYears || Infinity
        },
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-800',
        icon: '📊'
      },
      {
        name: '乐观情况',
        data: calculations.scenarios.optimistic,
        bgColor: 'bg-green-50',
        textColor: 'text-green-800',
        icon: '📈'
      }
    ];
  };

  // 获取最佳/最差情景
  const getBestWorstScenarios = (calculations) => {
    const scenarios = buildScenarioData(calculations);
    const sortedByProfit = scenarios.sort((a, b) => (b.data.profit || 0) - (a.data.profit || 0));
    
    return {
      best: sortedByProfit[0],
      worst: sortedByProfit[sortedByProfit.length - 1]
    };
  };

  // 计算情景差异
  const calculateScenarioDifferences = (calculations) => {
    const baseProfit = calculations.profitability?.profit || 0;
    const optimisticProfit = calculations.scenarios.optimistic?.profit || 0;
    const conservativeProfit = calculations.scenarios.conservative?.profit || 0;

    return {
      optimisticUpside: optimisticProfit - baseProfit,
      conservativeDownside: baseProfit - conservativeProfit,
      totalRange: optimisticProfit - conservativeProfit,
      upsidePercentage: baseProfit !== 0 ? ((optimisticProfit - baseProfit) / Math.abs(baseProfit)) * 100 : 0,
      downsidePercentage: baseProfit !== 0 ? ((baseProfit - conservativeProfit) / Math.abs(baseProfit)) * 100 : 0
    };
  };

  return {
    ScenarioComparison,
    ScenarioCard,
    MetricRow,
    buildScenarioData,
    getBestWorstScenarios,
    calculateScenarioDifferences
  };

})();