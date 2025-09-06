// 情景分析图表模块
// 提供可视化的利润和利润率对比图表

window.ScenarioChart = (function() {

  // 主要图表组件
  const ScenarioChart = ({ calculations, currency }) => {
    const chartData = buildChartData(calculations);

    return React.createElement(window.UIComponents.Section, {
      title: '📊 情景分析图表',
      className: 'col-span-full'
    }, [
      React.createElement('div', {
        key: 'charts',
        className: 'grid grid-cols-1 lg:grid-cols-2 gap-6'
      }, [
        React.createElement(ProfitChart, {
          key: 'profit-chart',
          scenarios: chartData.scenarios,
          maxProfit: chartData.maxProfit,
          currency: currency
        }),
        React.createElement(MarginChart, {
          key: 'margin-chart',
          scenarios: chartData.scenarios,
          maxMargin: chartData.maxMargin
        })
      ])
    ]);
  };

  // 利润对比图表
  const ProfitChart = ({ scenarios, maxProfit, currency }) => {
    return React.createElement('div', {
      className: 'bg-white rounded-lg p-4'
    }, [
      React.createElement('h5', {
        key: 'title',
        className: 'font-medium text-gray-800 mb-4'
      }, '利润对比'),
      React.createElement('div', {
        key: 'bars',
        className: 'space-y-3'
      }, scenarios.map(scenario => 
        React.createElement(ProfitBar, {
          key: scenario.name,
          scenario: scenario,
          maxProfit: maxProfit,
          currency: currency
        })
      ))
    ]);
  };

  // 利润率对比图表
  const MarginChart = ({ scenarios, maxMargin }) => {
    return React.createElement('div', {
      className: 'bg-white rounded-lg p-4'
    }, [
      React.createElement('h5', {
        key: 'title',
        className: 'font-medium text-gray-800 mb-4'
      }, '利润率对比'),
      React.createElement('div', {
        key: 'bars',
        className: 'space-y-3'
      }, scenarios.map(scenario => 
        React.createElement(MarginBar, {
          key: scenario.name,
          scenario: scenario,
          maxMargin: maxMargin
        })
      ))
    ]);
  };

  // 利润柱状图条
  const ProfitBar = ({ scenario, maxProfit, currency }) => {
    const isPositive = scenario.profit > 0;
    const barWidth = maxProfit > 0 ? (Math.abs(scenario.profit) / maxProfit) * 100 : 0;
    
    return React.createElement('div', {
      className: 'space-y-1'
    }, [
      React.createElement('div', {
        key: 'header',
        className: 'flex justify-between items-center'
      }, [
        React.createElement('span', {
          key: 'name',
          className: 'text-sm font-medium'
        }, scenario.name),
        React.createElement('span', {
          key: 'value',
          className: `text-sm font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`
        }, `${currency}${scenario.profit.toLocaleString()}`)
      ]),
      React.createElement('div', {
        key: 'bar-container',
        className: 'w-full bg-gray-100 rounded-full h-3 relative overflow-hidden'
      }, [
        React.createElement('div', {
          key: 'bar',
          className: `h-3 rounded-full ${isPositive ? scenario.color : 'bg-red-500'} transition-all duration-500`,
          style: { width: `${barWidth}%` }
        }),
        React.createElement('div', {
          key: 'label',
          className: 'absolute inset-0 flex items-center justify-center text-xs text-white font-medium'
        }, isPositive ? '盈利' : '亏损')
      ])
    ]);
  };

  // 利润率柱状图条
  const MarginBar = ({ scenario, maxMargin }) => {
    const isPositive = scenario.margin > 0;
    const barWidth = maxMargin > 0 ? (Math.abs(scenario.margin) / maxMargin) * 100 : 0;
    
    return React.createElement('div', {
      className: 'space-y-1'
    }, [
      React.createElement('div', {
        key: 'header',
        className: 'flex justify-between items-center'
      }, [
        React.createElement('span', {
          key: 'name',
          className: 'text-sm font-medium'
        }, scenario.name),
        React.createElement('span', {
          key: 'value',
          className: `text-sm font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`
        }, `${scenario.margin.toFixed(1)}%`)
      ]),
      React.createElement('div', {
        key: 'bar-container',
        className: 'w-full bg-gray-100 rounded-full h-3 relative overflow-hidden'
      }, [
        React.createElement('div', {
          key: 'bar',
          className: `h-3 rounded-full ${isPositive ? scenario.color : 'bg-red-500'} transition-all duration-500`,
          style: { width: `${barWidth}%` }
        }),
        React.createElement('div', {
          key: 'label',
          className: 'absolute inset-0 flex items-center justify-center text-xs text-white font-medium'
        }, `${scenario.margin.toFixed(1)}%`)
      ])
    ]);
  };

  // 构建图表数据
  const buildChartData = (calculations) => {
    const scenarios = [
      {
        name: '保守',
        profit: calculations.scenarios.conservative?.profit || 0,
        margin: calculations.scenarios.conservative?.margin || 0,
        color: 'bg-orange-500'
      },
      {
        name: '基准',
        profit: calculations.profitability?.profit || 0,
        margin: calculations.profitability?.margin || 0,
        color: 'bg-blue-500'
      },
      {
        name: '乐观',
        profit: calculations.scenarios.optimistic?.profit || 0,
        margin: calculations.scenarios.optimistic?.margin || 0,
        color: 'bg-green-500'
      }
    ];

    const maxProfit = Math.max(...scenarios.map(s => Math.abs(s.profit)));
    const maxMargin = Math.max(...scenarios.map(s => Math.abs(s.margin)));

    return {
      scenarios,
      maxProfit,
      maxMargin
    };
  };

  // 生成图表摘要
  const generateChartSummary = (calculations) => {
    const chartData = buildChartData(calculations);
    const { scenarios } = chartData;
    
    const profitableScenariosCount = scenarios.filter(s => s.profit > 0).length;
    const bestScenario = scenarios.reduce((best, current) => 
      current.profit > best.profit ? current : best
    );
    const worstScenario = scenarios.reduce((worst, current) => 
      current.profit < worst.profit ? current : worst
    );

    return {
      profitableScenariosCount,
      bestScenario,
      worstScenario,
      profitRange: bestScenario.profit - worstScenario.profit,
      marginRange: bestScenario.margin - worstScenario.margin
    };
  };

  // 导出图表数据（用于其他用途）
  const exportChartData = (calculations, format = 'json') => {
    const chartData = buildChartData(calculations);
    
    if (format === 'csv') {
      let csv = 'Scenario,Profit,Margin\n';
      chartData.scenarios.forEach(scenario => {
        csv += `${scenario.name},${scenario.profit},${scenario.margin}\n`;
      });
      return csv;
    }
    
    return JSON.stringify(chartData, null, 2);
  };

  return {
    ScenarioChart,
    ProfitChart,
    MarginChart,
    ProfitBar,
    MarginBar,
    buildChartData,
    generateChartSummary,
    exportChartData
  };

})();