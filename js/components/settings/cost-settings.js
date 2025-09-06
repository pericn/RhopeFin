// 成本设置组件 - 固定成本和变动成本配置
window.CostSettings = (function() {

  const CostSettings = ({ data, updateData, formulaEngine }) => {
    const updateField = (path, value) => {
      if (window.dataManager) {
        const newData = window.dataManager.updateDataPath(data, path, value);
        updateData(newData);
      }
    };

    // 计算成本数据
    const calculateCostData = () => {
      const area = data?.basic?.areaSqm || 0;
      const days = data?.basic?.daysPerYear || 365;
      const fixed = data?.cost?.fixed || {};
      const variable = data?.cost?.variable || {};

      const rentTotal = (area * (fixed.rentPerSqmPerDay || 0) * days) / 10000;
      const propertyTotal = (area * (fixed.propertyPerSqmPerMonth || 0) * 12) / 10000;
      const staffTotal = ((fixed.staffCount || 0) * (fixed.staffSalaryPerMonth || 0) * 12) / 10000;
      const cleaningTotal = (fixed.cleaningOtherFixed || 0) / 10000;
      const utilitiesTotal = (variable.utilitiesPerYear || 0) / 10000;
      const miscTotal = (variable.miscVariableAnnual || 0) / 10000;
      
      const fixedTotal = rentTotal + propertyTotal + staffTotal + cleaningTotal;
      const variableTotal = utilitiesTotal + miscTotal;
      const totalCost = fixedTotal + variableTotal;

      return {
        rentTotal,
        propertyTotal,
        staffTotal,
        cleaningTotal,
        utilitiesTotal,
        miscTotal,
        fixedTotal,
        variableTotal,
        totalCost,
        rentDaily: (rentTotal * 10000) / days,
        propertyDaily: (propertyTotal * 10000) / days,
        staffDaily: (staffTotal * 10000) / days,
        cleaningDaily: (cleaningTotal * 10000) / days,
        utilitiesDaily: (utilitiesTotal * 10000) / days,
        miscDaily: (miscTotal * 10000) / days,
        fixedDaily: (fixedTotal * 10000) / days,
        variableDaily: (variableTotal * 10000) / days,
        totalDaily: (totalCost * 10000) / days
      };
    };

    const costData = calculateCostData();

    return React.createElement(window.UIComponents.Space, {
      direction: 'vertical',
      size: 'large',
      style: { width: '100%' }
    }, [
      React.createElement(FixedCostSettings, {
        key: 'fixed-cost',
        data: data,
        updateField: updateField,
        costData: costData
      }),

      React.createElement(VariableCostSettings, {
        key: 'variable-cost',
        data: data,
        updateField: updateField,
        costData: costData
      }),

      React.createElement(CustomCostManager, {
        key: 'custom-cost',
        data: data,
        updateData: updateData,
        formulaEngine: formulaEngine
      })
    ]);
  };

  // 固定成本设置组件
  const FixedCostSettings = ({ data, updateField, costData }) => {
    return React.createElement(window.UIComponents.Section, {
      title: '🏢 固定成本设置'
    }, React.createElement(window.UIComponents.Space, {
      direction: 'vertical',
      size: 'middle',
      style: { width: '100%' }
    }, [
      React.createElement(RentAndPropertyInputs, {
        key: 'rent-property',
        data: data,
        updateField: updateField
      }),

      React.createElement(StaffCostInputs, {
        key: 'staff-costs',
        data: data,
        updateField: updateField
      }),

      // 其他固定成本已整合到员工成本输入组件中
      // React.createElement(OtherFixedCostInput, {
      //   key: 'other-fixed',
      //   value: (data?.cost?.fixed?.cleaningOtherFixed || 0) / 10000,
      //   onChange: (value) => updateField('cost.fixed.cleaningOtherFixed', value * 10000)
      // }),

      React.createElement(FixedCostSummary, {
        key: 'fixed-summary',
        costData: costData
      })
    ]));
  };

  // 租金和物业费输入组件
  const RentAndPropertyInputs = ({ data, updateField }) => {
    return React.createElement('div', {
      className: 'flex gap-4 w-full'
    }, [
      // 租金单价 (数字输入 - 25% width)
      React.createElement(window.UIComponents.Input, {
        label: '租金单价 (元/㎡/天)',
        value: data?.cost?.fixed?.rentPerSqmPerDay || 0,
        onChange: (value) => updateField('cost.fixed.rentPerSqmPerDay', value),
        step: 0.1,
        width: '25%'
      }),

      // 物业费 (数字输入 - 25% width)
      React.createElement(window.UIComponents.Input, {
        label: '物业费 (元/㎡/月)',
        value: data?.cost?.fixed?.propertyPerSqmPerMonth || 0,
        onChange: (value) => updateField('cost.fixed.propertyPerSqmPerMonth', value),
        width: '25%'
      })
    ]);
  };

  // 员工成本输入组件
  const StaffCostInputs = ({ data, updateField }) => {
    return React.createElement('div', {
      className: 'flex gap-4 w-full'
    }, [
      // 员工总数 (数字输入 - 25% width)
      React.createElement(window.UIComponents.Input, {
        label: '员工总数',
        value: data?.cost?.fixed?.staffCount || 0,
        onChange: (value) => updateField('cost.fixed.staffCount', value),
        width: '25%'
      }),

      // 员工月薪 (数字输入 - 25% width)
      React.createElement(window.UIComponents.Input, {
        label: '员工月薪 (元)',
        value: data?.cost?.fixed?.staffSalaryPerMonth || 0,
        onChange: (value) => updateField('cost.fixed.staffSalaryPerMonth', value),
        width: '25%'
      }),

      // 总部管理费 (数字输入 - 25% width)
      React.createElement(window.UIComponents.Input, {
        label: '总部管理费 (%)',
        value: data?.cost?.fixed?.hqFeePctOfRevenue || 0,
        onChange: (value) => updateField('cost.fixed.hqFeePctOfRevenue', value),
        suffix: '%',
        width: '25%'
      }),

      // 其他固定成本 (数字输入 - 25% width)
      React.createElement(window.UIComponents.Input, {
        label: '其他固定成本 (万元)',
        value: (data?.cost?.fixed?.cleaningOtherFixed || 0) / 10000,
        onChange: (value) => updateField('cost.fixed.cleaningOtherFixed', value * 10000),
        step: 0.1,
        width: '25%'
      })
    ]);
  };

  // 其他固定成本输入组件
  const OtherFixedCostInput = ({ value, onChange }) => {
    return React.createElement(window.UIComponents.Input, {
      label: '其他固定成本 (万元/年)',
      value: value,
      onChange: onChange,
      step: 0.1
    });
  };

  // 固定成本汇总组件
  const FixedCostSummary = ({ costData }) => {
    const fixedCostItems = [
      { key: 'rent', label: '租金成本', value: costData.rentTotal },
      { key: 'property', label: '物业费', value: costData.propertyTotal },
      { key: 'staff', label: '员工工资', value: costData.staffTotal },
      { key: 'cleaning', label: '其他固定', value: costData.cleaningTotal }
    ];

    const totalFixed = fixedCostItems.reduce((sum, item) => sum + item.value, 0);

    return React.createElement('div', {
      key: 'fixed-cost-summary',
      style: { 
        marginTop: '8px',
        paddingTop: '8px',
        borderTop: '1px solid #f0f0f0'
      }
    }, [
      React.createElement('div', {
        key: 'title',
        className: 'text-xs font-medium text-gray-500 mb-1'
      }, '成本预测'),
      React.createElement('div', {
        key: 'daily',
        className: 'text-sm text-gray-600 mb-1'
        }, [
        React.createElement('span', {
          key: 'daily-label'
        }, '日均成本: '),
        React.createElement('span', {
          key: 'daily-value',
          className: 'font-medium'
        }, `¥${(costData.fixedDaily || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`)
      ]),
      React.createElement('div', {
        key: 'annual',
        className: 'text-sm text-gray-600'
      }, [
        React.createElement('span', {
          key: 'annual-label'
        }, '年度成本: '),
        React.createElement('span', {
          key: 'annual-value',
          className: 'font-medium'
        }, `${costData.fixedTotal.toFixed(2)} 万元`)
      ])
    ]);
  };

  // 变动成本设置组件
  const VariableCostSettings = ({ data, updateField, costData }) => {
    return React.createElement(window.UIComponents.Section, {
      title: '⚡ 变动成本设置'
    }, React.createElement(window.UIComponents.Space, {
      direction: 'vertical',
      size: 'middle',
      style: { width: '100%' }
    }, [
      React.createElement('div', {
        key: 'variable-cost-inputs',
        className: 'flex gap-4 w-full'
      }, [
        // 水电费 (数字输入 - 25% width)
        React.createElement(window.UIComponents.Input, {
          label: '水电费 (万元/年)',
          value: (data?.cost?.variable?.utilitiesPerYear || 0) / 10000,
          onChange: (value) => updateField('cost.variable.utilitiesPerYear', value * 10000),
          step: 0.1,
          width: '25%'
        }),

        // 其他变动成本 (数字输入 - 25% width)
        React.createElement(window.UIComponents.Input, {
          label: '其他变动成本 (万元/年)',
          value: (data?.cost?.variable?.miscVariableAnnual || 0) / 10000,
          onChange: (value) => updateField('cost.variable.miscVariableAnnual', value * 10000),
          step: 0.1,
          width: '25%'
        })
      ]),

      React.createElement(VariableCostSummary, {
        key: 'variable-summary',
        costData: costData
      })
    ]));
  };

  // 水电费输入组件
  const UtilitiesCostInput = ({ value, onChange }) => {
    return React.createElement(window.UIComponents.Input, {
      label: '水电费 (万元/年)',
      value: value,
      onChange: onChange,
      step: 0.1,
      width: 'full'
    });
  };

  // 其他变动成本输入组件
  const MiscVariableCostInput = ({ value, onChange }) => {
    return React.createElement(window.UIComponents.Input, {
      label: '其他变动成本 (万元/年)',
      value: value,
      onChange: onChange,
      step: 0.1,
      width: 'full'
    });
  };

  // 变动成本汇总组件
  const VariableCostSummary = ({ costData }) => {
    const totalVariable = costData.utilitiesTotal + costData.miscTotal;
    
    return React.createElement('div', {
      key: 'variable-cost-summary',
      style: { 
        marginTop: '8px',
        paddingTop: '8px',
        borderTop: '1px solid #f0f0f0'
      }
    }, [
      React.createElement('div', {
        key: 'title',
        className: 'text-xs font-medium text-gray-500 mb-1'
      }, '成本预测'),
      React.createElement('div', {
      key: 'daily',
      className: 'text-sm text-gray-600 mb-1'
    }, [
      React.createElement('span', {
        key: 'daily-label'
      }, '日均成本: '),
      React.createElement('span', {
        key: 'daily-value',
        className: 'font-medium'
      }, `¥${(costData.variableDaily || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`)
    ]),
      React.createElement('div', {
        key: 'annual',
        className: 'text-sm text-gray-600'
      }, [
        React.createElement('span', {
          key: 'annual-label'
        }, '年度成本: '),
        React.createElement('span', {
          key: 'annual-value',
          className: 'font-medium'
        }, `${totalVariable.toFixed(2)} 万元`)
      ])
    ]);
  };

  // 自定义成本管理组件
  const CustomCostManager = ({ data, updateData, formulaEngine }) => {
    // 如果CustomModules.CustomCostManager存在，使用它
    if (window.CustomModules && window.CustomModules.CustomCostManager) {
      return React.createElement(window.CustomModules.CustomCostManager, {
        data: data,
        updateData: updateData,
        formulaEngine: formulaEngine
      });
    }

    // 否则提供一个简化版本
    return React.createElement(window.UIComponents.Section, {
      title: '💸 自定义成本'
    }, React.createElement('div', {
      className: 'text-gray-500 text-center p-4'
    }, '自定义成本模块加载中...'));
  };

  return {
    CostSettings
  };

})();