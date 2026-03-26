// 公式帮助面板
window.FormulaHelpPanel = (function() {
  'use strict';

  /**
   * 公式帮助面板组件
   * 提供公式编写的帮助信息和参考文档
   * 
   * @param {Object} props - 组件属性
   * @param {Object} props.formulaEngine - 公式引擎实例
   * @returns {ReactElement|null} 帮助面板组件
   */
  const HelpPanel = ({ formulaEngine }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    // 如果没有公式引擎，不渲染组件
    if (!formulaEngine) return null;

    // 获取帮助信息和可用变量
    const help = formulaEngine.generateHelp();
    const variables = formulaEngine.getAvailableVariables();

    /**
     * 渲染概述部分
     */
    const renderOverview = () => {
      return React.createElement('div', {
        key: 'overview',
        className: 'bg-blue-50 rounded-lg p-4'
      }, [
        React.createElement('h4', {
          key: 'title',
          className: 'font-medium text-blue-800 mb-2'
        }, '概述'),
        React.createElement('p', {
          key: 'description',
          className: 'text-sm text-blue-700'
        }, help.overview)
      ]);
    };

    /**
     * 渲染支持的运算符
     */
    const renderOperators = () => {
      return React.createElement('div', {
        key: 'operators',
        className: 'space-y-2'
      }, [
        React.createElement('h4', {
          key: 'title',
          className: 'font-medium text-gray-800'
        }, '支持的运算符'),
        React.createElement('div', {
          key: 'list',
          className: 'text-sm text-gray-600 grid grid-cols-2 gap-1'
        }, help.operators.map(op => 
          React.createElement('div', {
            key: op,
            className: 'bg-gray-100 rounded px-2 py-1 font-mono'
          }, op)
        ))
      ]);
    };

    /**
     * 渲染系统变量列表
     */
    const renderSystemVariables = () => {
      return React.createElement('div', {
        key: 'system-vars',
        className: 'space-y-2'
      }, [
        React.createElement('h4', {
          key: 'title',
          className: 'font-medium text-gray-800'
        }, '系统变量'),
        React.createElement('div', {
          key: 'list',
          className: 'space-y-1 max-h-40 overflow-y-auto'
        }, variables.system.map(variable => 
          React.createElement('div', {
            key: variable.name,
            className: 'text-sm bg-gray-50 rounded px-2 py-1'
          }, [
            React.createElement('code', {
              key: 'name',
              className: 'font-mono text-blue-600'
            }, variable.name),
            React.createElement('span', {
              key: 'desc',
              className: 'text-gray-600 ml-2'
            }, `- ${variable.description} (${variable.value})`)
          ])
        ))
      ]);
    };

    /**
     * 渲染公式示例
     */
    const renderExamples = () => {
      return React.createElement('div', {
        key: 'examples',
        className: 'space-y-2'
      }, [
        React.createElement('h4', {
          key: 'title',
          className: 'font-medium text-gray-800'
        }, '公式示例'),
        React.createElement('div', {
          key: 'list',
          className: 'space-y-2'
        }, help.examples.map((example, index) => 
          React.createElement('div', {
            key: index,
            className: 'bg-green-50 rounded px-3 py-2'
          }, [
            React.createElement('code', {
              key: 'formula',
              className: 'font-mono text-green-700 text-sm'
            }, example.formula),
            React.createElement('div', {
              key: 'desc',
              className: 'text-xs text-green-600 mt-1'
            }, example.description)
          ])
        ))
      ]);
    };

    /**
     * 渲染模态框内容
     */
    const renderModalContent = () => {
      return React.createElement('div', {
        className: 'space-y-6'
      }, [
        renderOverview(),
        renderOperators(),
        renderSystemVariables(),
        renderExamples()
      ]);
    };

    // 主渲染
    return React.createElement('div', {
      className: 'relative'
    }, [
      // 触发按钮
      React.createElement(window.UIComponents.Button, {
        key: 'toggle',
        onClick: () => setIsOpen(!isOpen),
        variant: 'outline',
        size: 'small'
      }, '公式帮助'),

      // 帮助模态框
      isOpen && React.createElement(window.UIComponents.Modal, {
        key: 'modal',
        isOpen: isOpen,
        onClose: () => setIsOpen(false),
        title: '公式编写帮助',
        size: 'large'
      }, renderModalContent())
    ]);
  };

  return HelpPanel;

})();