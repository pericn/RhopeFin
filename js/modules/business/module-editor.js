// 通用自定义模块编辑器
window.CustomModuleEditor = (function() {
  'use strict';

  // 确保公式引擎有默认系统变量的辅助函数
  const ensureSystemVariables = (formulaEngine) => {
    if (formulaEngine && (!formulaEngine.systemVariables || !formulaEngine.systemVariables.daysPerYear)) {
      formulaEngine.updateSystemContext({
        basic: { daysPerYear: 365, areaSqm: 500 },
        revenue: { member: { count: 300 } },
        cost: { fixed: {} }
      });
    }
  };

  /**
   * 通用自定义模块编辑器组件
   * 用于编辑收入和成本模块的详细参数
   */
  const ModuleEditor = ({ 
    module, 
    type, 
    formulaEngine, 
    onUpdate, 
    onUpdateVariable, 
    onDelete, 
    onDuplicate 
  }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [formulaError, setFormulaError] = React.useState(null);

    // 验证公式
    React.useEffect(() => {
      if (module.formula && formulaEngine) {
        ensureSystemVariables(formulaEngine);
        const validation = formulaEngine.validateFormula(module.formula, module.variables);
        setFormulaError(validation.isValid ? null : validation.error);
      }
    }, [module.formula, module.variables, formulaEngine]);

    // 计算结果
    const result = formulaEngine ? (() => {
      ensureSystemVariables(formulaEngine);
      return formulaEngine.evaluateFormula(module.formula, module.variables);
    })() : 0;
    const dailyResult = result / 365;

    // 样式配置
    const isRevenue = type === 'revenue';
    const borderColor = isRevenue ? 'border-green-200' : 'border-red-200';
    const bgColor = isRevenue ? 'bg-green-50' : 'bg-red-50';
    const headerColor = isRevenue ? 'text-green-800' : 'text-red-800';

    // 辅助方法
    const getBadgeClasses = () => module.isFixed ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600';
    const getToggleClasses = () => `relative w-11 h-6 rounded-full transition-colors ${module.enabled ? 'bg-green-600' : 'bg-gray-200'}`;
    const getThumbClasses = () => `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${module.enabled ? 'transform translate-x-5' : ''}`;

    // 渲染变量输入
    const renderVariables = () => module.variables.map((variable, index) => 
      React.createElement('div', { key: index, className: 'space-y-2' }, [
        React.createElement('label', { key: 'label', className: 'text-xs font-medium text-gray-600' }, `变量 %${index + 1}`),
        React.createElement('div', { key: 'inputs', className: 'grid grid-cols-2 gap-2' }, [
          React.createElement('input', {
            key: 'name', type: 'text', className: 'px-2 py-1 border rounded text-xs', placeholder: '名称',
            value: variable?.name || '', onChange: (e) => onUpdateVariable(module.id, index, 'name', e.target.value)
          }),
          React.createElement('input', {
            key: 'value', type: 'number', className: 'px-2 py-1 border rounded text-xs', placeholder: '数值',
            value: variable?.value || 0, onChange: (e) => onUpdateVariable(module.id, index, 'value', Number(e.target.value))
          })
        ])
      ])
    );

    // 主渲染
    return React.createElement('div', { className: `${bgColor} rounded-lg p-4 border ${borderColor}` }, [
      // 头部
      React.createElement('div', { key: 'header', className: 'flex items-center justify-between mb-3' }, [
        React.createElement('div', { key: 'title', className: 'flex items-center gap-2' }, [
          React.createElement('input', {
            key: 'name', type: 'text',
            className: `${headerColor} font-medium bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1`,
            value: module.name, onChange: (e) => onUpdate(module.id, 'name', e.target.value)
          }),
          module.isFixed !== undefined && React.createElement('span', {
            key: 'badge', className: `text-xs px-2 py-1 rounded-full ${getBadgeClasses()}`
          }, module.isFixed ? '固定成本' : '变动成本')
        ]),
        React.createElement('div', { key: 'controls', className: 'flex items-center gap-2' }, [
          React.createElement('div', { key: 'result', className: 'text-sm' }, [
            React.createElement('div', { key: 'annual', className: `font-bold ${headerColor}` }, `¥${result.toLocaleString()}/年`),
            React.createElement('div', { key: 'daily', className: 'text-xs text-gray-500' }, `¥${dailyResult.toLocaleString()}/日`)
          ]),
          React.createElement('label', { key: 'toggle', className: 'flex items-center cursor-pointer' }, [
            React.createElement('input', {
              key: 'checkbox', type: 'checkbox', className: 'sr-only',
              checked: module.enabled, onChange: (e) => onUpdate(module.id, 'enabled', e.target.checked)
            }),
            React.createElement('div', { key: 'switch', className: getToggleClasses() },
              React.createElement('div', { className: getThumbClasses() })
            )
          ]),
          React.createElement('button', {
            key: 'expand', className: 'text-gray-500 hover:text-gray-700',
            onClick: () => setIsExpanded(!isExpanded)
          }, isExpanded ? '▲' : '▼')
        ])
      ]),

      // 公式输入
      React.createElement('div', { key: 'formula', className: 'mb-3' }, [
        React.createElement('div', { key: 'input', className: 'flex gap-2' }, [
          React.createElement('input', {
            key: 'field', type: 'text',
            className: `flex-1 px-3 py-2 border rounded-lg text-sm font-mono ${formulaError ? 'border-red-300 bg-red-50' : 'border-gray-300'}`,
            value: module.formula, onChange: (e) => onUpdate(module.id, 'formula', e.target.value),
            placeholder: '输入计算公式，如: memberCount * 100'
          }),
          React.createElement(window.UIComponents.Tooltip, {
            key: 'help', content: '可使用系统变量(如memberCount)和自定义变量(%1, %2, %3, %4)及数学函数', position: 'top'
          }, React.createElement('button', { className: 'px-3 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm hover:bg-blue-200' }, '?'))
        ]),
        formulaError && React.createElement('div', { key: 'error', className: 'text-xs text-red-600 mt-1' }, formulaError)
      ]),

      // 展开内容
      isExpanded && React.createElement('div', { key: 'expanded', className: 'space-y-4 pt-4 border-t border-gray-200' }, [
        React.createElement('div', { key: 'variables', className: 'grid grid-cols-1 md:grid-cols-2 gap-3' }, renderVariables()),
        // 毛利率设置（仅对收入模块）
        isRevenue && React.createElement('div', { key: 'margin', className: 'space-y-2' }, [
          React.createElement('label', { key: 'label', className: 'text-xs font-medium text-gray-600' }, '毛利率 (%)'),
          React.createElement('div', { key: 'input', className: 'flex items-center gap-2' }, [
            React.createElement('input', {
              key: 'field', type: 'number', min: 0, max: 100, step: 1,
              className: 'px-3 py-2 border rounded-lg text-sm w-24',
              value: module.margin || 80, 
              onChange: (e) => onUpdate(module.id, 'margin', Number(e.target.value))
            }),
            React.createElement('span', { key: 'suffix', className: 'text-sm text-gray-600' }, '%')
          ])
        ]),
        React.createElement('div', { key: 'note', className: 'space-y-2' }, [
          React.createElement('label', { key: 'label', className: 'text-xs font-medium text-gray-600' }, '备注说明'),
          React.createElement('textarea', {
            key: 'textarea', className: 'w-full px-3 py-2 border rounded-lg text-sm resize-none',
            rows: 2, placeholder: '添加备注说明...', value: module.note || '',
            onChange: (e) => onUpdate(module.id, 'note', e.target.value)
          })
        ]),
        React.createElement('div', { key: 'actions', className: 'flex justify-end gap-2 pt-2' }, [
          React.createElement(window.UIComponents.Button, {
            key: 'duplicate', onClick: () => onDuplicate(module.id), variant: 'outline', size: 'small'
          }, '复制'),
          React.createElement(window.UIComponents.Button, {
            key: 'delete', onClick: () => onDelete(module.id), variant: 'danger', size: 'small'
          }, '删除')
        ])
      ])
    ]);
  };

  return ModuleEditor;

})();