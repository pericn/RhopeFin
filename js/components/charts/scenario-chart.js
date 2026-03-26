// 情景对比图表组件
// 功能：展示保守、基础、乐观三种情况下的利润对比分析
window.ScenarioChart = (function() {

  const ScenarioComparisonChart = ({ calculations, currency = "¥" }) => {
    if (!calculations || !calculations.scenarios) return null;

    const baseProfit = calculations.profitability?.profit || 0;
    const optimisticProfit = calculations.scenarios.optimistic?.profit || 0;
    const conservativeProfit = calculations.scenarios.conservative?.profit || 0;

    const maxProfit = Math.max(Math.abs(baseProfit), Math.abs(optimisticProfit), Math.abs(conservativeProfit));
    
    if (maxProfit === 0) {
      return React.createElement('div', {
        className: 'text-center py-8 text-gray-500'
      }, '暂无情景分析数据');
    }

    const scenarios = [
      {
        name: '保守情况',
        profit: conservativeProfit,
        margin: calculations.scenarios.conservative?.margin || 0,
        color: 'bg-blue-500'
      },
      {
        name: '基础情况',
        profit: baseProfit,
        margin: calculations.profitability?.margin || 0,
        color: 'bg-blue-500'
      },
      {
        name: '乐观情况',
        profit: optimisticProfit,
        margin: calculations.scenarios.optimistic?.margin || 0,
        color: 'bg-green-500'
      }
    ];

    return React.createElement('div', {
      className: 'rounded-2xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-2)] p-4 shadow-[var(--rilo-shadow-soft)]'
    }, [
      React.createElement('h5', {
        key: 'title',
        className: 'mb-4 text-sm font-semibold text-[var(--rilo-text-1)]'
      }, '情景对比分析'),
      
      React.createElement('div', {
        key: 'scenarios',
        className: 'grid grid-cols-1 md:grid-cols-3 gap-4'
      }, scenarios.map(scenario => {
        const isPositive = scenario.profit > 0;
        const barWidth = Math.abs(scenario.profit) / maxProfit * 100;
        
        return React.createElement('div', {
          key: scenario.name,
          className: 'rounded-xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] p-4 shadow-[var(--rilo-shadow-soft)]'
        }, [
          React.createElement('h6', {
            key: 'name',
            className: 'mb-2 text-sm font-medium text-[var(--rilo-text-1)]'
          }, scenario.name),
          
          React.createElement('div', {
            key: 'profit',
            className: 'mb-2'
          }, [
            React.createElement('div', {
              key: 'amount',
              className: `text-sm font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`
            }, `${currency}${Math.abs(scenario.profit).toLocaleString()}`),
            React.createElement('div', {
              key: 'margin',
              className: 'text-xs text-[var(--rilo-text-3)]'
            }, `利润率: ${scenario.margin.toFixed(1)}%`)
          ]),

          React.createElement('div', {
            key: 'bar-container',
            className: 'h-2 w-full rounded-full bg-[rgba(53,39,24,0.10)]'
          },
            React.createElement('div', {
              className: `h-2 rounded-full ${isPositive ? scenario.color : 'bg-red-500'} transition-all duration-500`,
              style: { width: `${barWidth}%` }
            })
          ),

          React.createElement('div', {
            key: 'status',
            className: 'mt-2 text-center text-xs text-[var(--rilo-text-3)]'
          }, isPositive ? '盈利' : '亏损')
        ]);
      }))
    ]);
  };

  return {
    ScenarioComparisonChart
  };

})();
