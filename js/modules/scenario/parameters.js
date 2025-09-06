// 情景参数设置模块
// 提供情景分析的参数配置界面，包括收入和成本调整系数设置

window.ScenarioParameters = (function() {

  // 情景参数设置组件
  const ScenarioParameters = ({ data, updateData }) => {
    if (!data || !updateData) return null;

    return React.createElement(window.UIComponents.Section, {
      title: '⚙️ 情景参数设置'
    }, [
      // 收入调整系数设置
      React.createElement('div', {
        key: 'revenue-factors',
        className: 'bg-blue-50 rounded-lg p-4'
      }, [
        React.createElement('h5', {
          key: 'title',
          className: 'font-medium text-blue-800 mb-3'
        }, '收入调整系数'),
        React.createElement('div', {
          key: 'inputs',
          className: 'grid grid-cols-1 md:grid-cols-2 gap-4'
        }, [
          React.createElement(window.UIComponents.Input, {
            key: 'optimistic-revenue',
            label: '乐观情况收入系数 (%)',
            value: data.scenario?.optimisticRevenueFactor || 120,
            onChange: (value) => updateData(data, 'scenario.optimisticRevenueFactor', value),
            hint: '乐观预期下收入的增长比例'
          }),
          React.createElement(window.UIComponents.Input, {
            key: 'conservative-revenue',
            label: '保守情况收入系数 (%)',
            value: data.scenario?.conservativeRevenueFactor || 80,
            onChange: (value) => updateData(data, 'scenario.conservativeRevenueFactor', value),
            hint: '保守预期下收入的下降比例'
          })
        ])
      ]),

      // 成本调整系数设置
      React.createElement('div', {
        key: 'cost-factors',
        className: 'bg-red-50 rounded-lg p-4'
      }, [
        React.createElement('h5', {
          key: 'title',
          className: 'font-medium text-red-800 mb-3'
        }, '成本调整系数'),
        React.createElement('div', {
          key: 'inputs',
          className: 'grid grid-cols-1 md:grid-cols-2 gap-4'
        }, [
          React.createElement(window.UIComponents.Input, {
            key: 'optimistic-cost',
            label: '乐观情况成本系数 (%)',
            value: data.scenario?.optimisticCostFactor || 95,
            onChange: (value) => updateData(data, 'scenario.optimisticCostFactor', value),
            hint: '乐观预期下变动成本的优化比例'
          }),
          React.createElement(window.UIComponents.Input, {
            key: 'conservative-cost',
            label: '保守情况成本系数 (%)',
            value: data.scenario?.conservativeCostFactor || 110,
            onChange: (value) => updateData(data, 'scenario.conservativeCostFactor', value),
            hint: '保守预期下变动成本的增加比例'
          })
        ])
      ]),

      // 参数说明
      React.createElement('div', {
        key: 'explanation',
        className: 'bg-yellow-50 rounded-lg p-4'
      }, [
        React.createElement('h5', {
          key: 'title',
          className: 'font-medium text-yellow-800 mb-2'
        }, '💡 参数说明'),
        React.createElement('div', {
          key: 'content',
          className: 'text-sm text-yellow-700 space-y-1'
        }, [
          React.createElement('div', {
            key: 'note1'
          }, '• 收入系数: 120% 表示收入比基准情况增长20%'),
          React.createElement('div', {
            key: 'note2'
          }, '• 成本系数: 仅影响变动成本，固定成本保持不变'),
          React.createElement('div', {
            key: 'note3'
          }, '• 乐观情况: 通常设置收入增长、成本优化'),
          React.createElement('div', {
            key: 'note4'
          }, '• 保守情况: 通常设置收入下降、成本增加')
        ])
      ])
    ]);
  };

  // 参数验证函数
  const validateParameters = (data) => {
    const warnings = [];
    
    if (!data.scenario) return warnings;
    
    const { optimisticRevenueFactor, conservativeRevenueFactor, optimisticCostFactor, conservativeCostFactor } = data.scenario;
    
    // 检查收入系数合理性
    if (optimisticRevenueFactor <= conservativeRevenueFactor) {
      warnings.push('乐观情况的收入系数应该高于保守情况');
    }
    
    // 检查成本系数合理性
    if (optimisticCostFactor >= conservativeCostFactor) {
      warnings.push('乐观情况的成本系数应该低于保守情况');
    }
    
    // 检查极值情况
    if (optimisticRevenueFactor > 200) {
      warnings.push('乐观情况收入系数过高，可能不现实');
    }
    
    if (conservativeRevenueFactor < 50) {
      warnings.push('保守情况收入系数过低，可能过于悲观');
    }
    
    return warnings;
  };

  // 获取默认参数
  const getDefaultParameters = () => ({
    optimisticRevenueFactor: 120,
    conservativeRevenueFactor: 80,
    optimisticCostFactor: 95,
    conservativeCostFactor: 110
  });

  // 参数重置函数
  const resetParameters = (updateData, data) => {
    const defaults = getDefaultParameters();
    Object.keys(defaults).forEach(key => {
      updateData(data, `scenario.${key}`, defaults[key]);
    });
  };

  return {
    ScenarioParameters,
    validateParameters,
    getDefaultParameters,
    resetParameters
  };

})();