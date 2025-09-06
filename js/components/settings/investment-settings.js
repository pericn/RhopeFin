// 投资设置组件 - 初始投资配置
window.InvestmentSettings = (function() {

  const InvestmentSettings = ({ data, updateData }) => {
    const updateField = (path, value) => {
      if (window.dataManager) {
        const newData = window.dataManager.updateDataPath(data, path, value);
        updateData(newData);
      }
    };

    // 计算投资数据
    const calculateInvestmentData = () => {
      const area = data?.basic?.areaSqm || 0;
      const fitoutStandard = data?.investment?.fitoutStandard || 0;
      const medical = data?.investment?.medicalInitial || 0;
      const customTotal = (data?.investment?.customInvestments || []).reduce((sum, item) => 
        sum + (item.value || 0), 0
      );

      return {
        fitoutTotal: (area * fitoutStandard) / 10000,
        medicalTotal: medical / 10000,
        customTotal: customTotal,
        grandTotal: ((area * fitoutStandard) + medical + (customTotal * 10000)) / 10000
      };
    };

    const investmentData = calculateInvestmentData();

    return React.createElement(window.UIComponents.Space, {
      direction: 'vertical',
      size: 'large',
      style: { width: '100%' }
    }, [
      React.createElement(BasicInvestmentSettings, {
        key: 'basic-investment',
        data: data,
        updateField: updateField,
        updateData: updateData,
        investmentData: investmentData
      })
    ]);
  };

  // 基础投资设置组件
  const BasicInvestmentSettings = ({ data, updateField, updateData, investmentData }) => {
    return React.createElement(window.UIComponents.Section, {
      title: '🏗️ 投资设置'
    }, React.createElement(window.UIComponents.Space, {
      direction: 'vertical',
      size: 'middle',
      style: { width: '100%' }
    }, [
      React.createElement('div', {
        key: 'investment-inputs',
        className: 'flex gap-4 w-full'
      }, [
        // 装修标准 (数字输入 - 25% width)
        React.createElement(window.UIComponents.Input, {
          label: '装修标准 (元/㎡)',
          value: data?.investment?.fitoutStandard || 0,
          onChange: (value) => updateField('investment.fitoutStandard', value),
          width: '25%'
        }),

        // 医疗设备投资 (数字输入 - 25% width)
        React.createElement(window.UIComponents.Input, {
          label: '医疗设备初始投资 (万元)',
          value: (data?.investment?.medicalInitial || 0) / 10000,
          onChange: (value) => updateField('investment.medicalInitial', value * 10000),
          step: 0.1,
          width: '25%'
        })
      ]),

      React.createElement(CustomInvestmentManager, {
        key: 'custom-investment',
        data: data,
        updateData: updateData
      }),

      React.createElement(InvestmentSummary, {
        key: 'investment-summary',
        investmentData: investmentData
      })
    ]));
  };

  // 装修标准输入组件
  const FitoutStandardInput = ({ value, onChange }) => {
    return React.createElement(window.UIComponents.Input, {
      label: '装修标准 (元/㎡)',
      value: value,
      onChange: onChange,
      width: 'full'
    });
  };

  // 医疗设备投资输入组件
  const MedicalEquipmentInput = ({ value, onChange }) => {
    return React.createElement(window.UIComponents.Input, {
      label: '医疗设备初始投资 (万元)',
      value: value,
      onChange: onChange,
      step: 0.1,
      width: 'full'
    });
  };

  // 投资汇总显示组件
  const InvestmentSummary = ({ investmentData }) => {
    return React.createElement('div', {
      style: { 
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid #f0f0f0'
      }
    }, [
      React.createElement('div', {
        key: 'summary-title',
        className: 'text-xs font-medium text-gray-500 mb-2'
      }, '投资计算数据'),
      
      React.createElement('div', {
        key: 'fitout-item',
        className: 'text-sm text-gray-600 mb-1'
      }, [
        React.createElement('span', {
          key: 'fitout-label'
        }, '装修投资: '),
        React.createElement('span', {
          key: 'fitout-value',
          className: 'font-medium'
        }, `${investmentData.fitoutTotal.toFixed(2)} 万元`)
      ]),
      
      React.createElement('div', {
        key: 'medical-item',
        className: 'text-sm text-gray-600 mb-1'
      }, [
        React.createElement('span', {
          key: 'medical-label'
        }, '医疗设备: '),
        React.createElement('span', {
          key: 'medical-value',
          className: 'font-medium'
        }, `${investmentData.medicalTotal.toFixed(2)} 万元`)
      ]),
      
      React.createElement('div', {
        key: 'custom-item',
        className: 'text-sm text-gray-600 mb-1'
      }, [
        React.createElement('span', {
          key: 'custom-label'
        }, '自定义投资: '),
        React.createElement('span', {
          key: 'custom-value',
          className: 'font-medium'
        }, `${investmentData.customTotal.toFixed(2)} 万元`)
      ]),
      
      React.createElement('div', {
        key: 'total-item',
        className: 'text-sm text-blue-600 font-medium mt-2 pt-2 border-t border-gray-100'
      }, [
        React.createElement('span', {
          key: 'total-label'
        }, '总投资: '),
        React.createElement('span', {
          key: 'total-value',
          className: 'font-bold text-lg'
        }, `${investmentData.grandTotal.toFixed(2)} 万元`)
      ])
    ]);
  };

  // 自定义投资管理组件
  const CustomInvestmentManager = ({ data, updateData }) => {
    // 如果CustomModules.CustomInvestmentManager存在，使用它
    if (window.CustomModules && window.CustomModules.CustomInvestmentManager) {
      return React.createElement(window.CustomModules.CustomInvestmentManager, {
        data: data,
        updateData: updateData
      });
    }

    // 否则提供一个简化版本
    return React.createElement(window.UIComponents.Section, {
      title: '💰 自定义投资'
    }, React.createElement('div', {
      className: 'text-gray-500 text-center p-4'
    }, '自定义投资模块加载中...'));
  };

  return {
    InvestmentSettings
  };

})();