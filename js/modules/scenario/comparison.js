// 情景对比分析模块
// 提供三种情景（保守、基准、乐观）的详细对比分析

window.ScenarioComparison = (function() {

  // 情景对比表格组件
  const ScenarioComparison = ({ calculations, currency }) => {
    const scenarios = buildScenarioData(calculations);

    return React.createElement(window.UIComponents.Section, {
      title: '情景对比分析',
      className: 'col-span-full'
    }, [
      React.createElement('div', {
        key: 'comparison-grid',
        className: 'grid grid-cols-1 lg:grid-cols-3 gap-4'
      }, scenarios.map(scenario => 
        React.createElement(window.RiloUI.ScenarioCard, {
          key: scenario.name,
          scenario: scenario,
          currency: currency
        })
      ))
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
        icon: ''
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
        icon: ''
      },
      {
        name: '乐观情况',
        data: calculations.scenarios.optimistic,
        bgColor: 'bg-green-50',
        textColor: 'text-green-800',
        icon: ''
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
    buildScenarioData,
    getBestWorstScenarios,
    calculateScenarioDifferences
  };

})();
