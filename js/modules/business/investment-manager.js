// 自定义投资变量管理器
window.CustomInvestmentManager = (function() {
  'use strict';

  /**
   * 自定义投资变量管理器组件
   * 负责管理自定义投资项目的增删改查功能
   * 
   * @param {Object} props - 组件属性
   * @param {Object} props.data - 应用数据对象
   * @param {Function} props.updateData - 数据更新函数
   * @returns {ReactElement} 投资管理器组件
   */
  const InvestmentManager = ({ data, updateData }) => {
    const investments = data.investment?.customInvestments || [];

    /**
     * 更新投资项目属性
     * @param {number} index - 投资项目索引
     * @param {string} field - 字段名(name|value)
     * @param {*} value - 新值
     */
    const updateInvestment = (index, field, value) => {
      const newInvestments = investments.map((investment, i) => 
        i === index 
          ? { ...investment, [field]: value }
          : investment
      );
      if (window.dataManager) {
        const newData = window.dataManager.updateDataPath(data, 'investment.customInvestments', newInvestments);
        updateData(newData);
      }
    };

    /**
     * 添加新的投资项目
     */
    const addInvestment = () => {
      const newInvestments = [...investments, { name: `其他投资${investments.length + 1}`, value: 0 }];
      if (window.dataManager) {
        const newData = window.dataManager.updateDataPath(data, 'investment.customInvestments', newInvestments);
        updateData(newData);
      }
    };

    /**
     * 删除投资项目
     * @param {number} index - 项目索引
     */
    const removeInvestment = (index) => {
      if (confirm('确认删除此投资项目？')) {
        const newInvestments = investments.filter((_, i) => i !== index);
        if (window.dataManager) {
        const newData = window.dataManager.updateDataPath(data, 'investment.customInvestments', newInvestments);
        updateData(newData);
      }
      }
    };

    /**
     * 计算投资项目的货币显示值
     * @param {number} value - 投资金额（万元）
     * @returns {string} 格式化的人民币金额
     */
    const formatCurrency = (value) => {
      return ((value || 0) * 10000).toLocaleString();
    };

    // 渲染组件
    return React.createElement('div', {
      className: 'space-y-4'
    }, [
      // 头部区域
      React.createElement('div', {
        key: 'header',
        className: 'flex items-center justify-between'
      }, [
        React.createElement('h3', {
          key: 'title',
          className: 'text-lg font-semibold text-purple-800'
        }, '🏗️ 自定义投资项目'),
        React.createElement(window.UIComponents.Button, {
          key: 'add-btn',
          onClick: addInvestment,
          variant: 'primary',
          size: 'small'
        }, '+ 添加投资项目')
      ]),

      // 投资项目列表
      React.createElement('div', {
        key: 'investments',
        className: 'space-y-4'
      }, investments.map((investment, index) => 
        React.createElement('div', {
          key: index,
          className: 'bg-purple-50 rounded-lg p-4 border border-purple-200'
        }, [
          // 项目头部
          React.createElement('div', {
            key: 'header',
            className: 'flex items-center justify-between mb-3'
          }, [
            React.createElement('span', {
              key: 'title',
              className: 'text-sm font-medium text-purple-800'
            }, `投资项目 ${index + 1}`),
            React.createElement('button', {
              key: 'delete',
              className: 'text-red-500 hover:text-red-700',
              onClick: () => removeInvestment(index),
              title: '删除投资项目'
            }, '✕')
          ]),

          // 输入元件行 - 固定间距，指定输入框尺寸
          React.createElement('div', {
            key: 'inputs-row',
            className: 'flex flex-wrap gap-4 mb-2'
          }, [
            // 项目名称输入 (50% width)
            React.createElement('div', {
              key: 'name-container',
              className: 'w-[50%]'
            }, React.createElement(window.UIComponents.Input, {
              key: 'name',
              label: '项目名称',
              type: 'text',
              value: investment.name,
              onChange: (value) => updateInvestment(index, 'name', value)
            })),

            // 投资金额输入 (25% width)
            React.createElement('div', {
              key: 'value-container',
              className: 'w-[25%]'
            }, React.createElement(window.UIComponents.Input, {
              key: 'value',
              label: '投资金额 (万元)',
              type: 'number',
              step: 0.1,
              value: investment.value,
              onChange: (value) => updateInvestment(index, 'value', value)
            }))
          ]),

          // 货币转换显示
          React.createElement('div', {
            key: 'converted',
            className: 'text-xs text-purple-600'
          }, `约合: ¥${formatCurrency(investment.value)}`)
        ])
      ))
    ]);
  };

  return InvestmentManager;

})();