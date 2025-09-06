// 业务模块聚合器 - 自定义模块管理系统
window.CustomModules = (function() {
  'use strict';

  /**
   * 确保所有业务模块已加载
   * 在使用前检查必要的依赖是否存在
   */
  const checkDependencies = () => {
    const requiredModules = [
      'CustomRevenueManager',
      'CustomCostManager', 
      'CustomInvestmentManager',
      'CustomModuleEditor',
      'FormulaHelpPanel'
    ];

    const missingModules = requiredModules.filter(moduleName => !window[moduleName]);
    
    if (missingModules.length > 0) {
      console.warn('Missing required business modules:', missingModules);
      console.warn('Please ensure all business module files are loaded in the correct order:');
      console.warn('- revenue-manager.js');
      console.warn('- cost-manager.js');
      console.warn('- investment-manager.js');
      console.warn('- module-editor.js');
      console.warn('- formula-help.js');
    }

    return missingModules.length === 0;
  };

  /**
   * 获取自定义收入模块管理器
   * @param {Object} props - 组件属性
   * @returns {ReactElement} 收入管理器组件
   */
  const getRevenueManager = (props) => {
    if (!window.CustomRevenueManager) {
      console.error('CustomRevenueManager not found. Please load revenue-manager.js');
      return null;
    }
    return React.createElement(window.CustomRevenueManager, props);
  };

  /**
   * 获取自定义成本模块管理器
   * @param {Object} props - 组件属性
   * @returns {ReactElement} 成本管理器组件
   */
  const getCostManager = (props) => {
    if (!window.CustomCostManager) {
      console.error('CustomCostManager not found. Please load cost-manager.js');
      return null;
    }
    return React.createElement(window.CustomCostManager, props);
  };

  /**
   * 获取自定义投资模块管理器
   * @param {Object} props - 组件属性
   * @returns {ReactElement} 投资管理器组件
   */
  const getInvestmentManager = (props) => {
    if (!window.CustomInvestmentManager) {
      console.error('CustomInvestmentManager not found. Please load investment-manager.js');
      return null;
    }
    return React.createElement(window.CustomInvestmentManager, props);
  };

  /**
   * 获取公式帮助面板
   * @param {Object} props - 组件属性
   * @returns {ReactElement} 帮助面板组件
   */
  const getFormulaHelpPanel = (props) => {
    if (!window.FormulaHelpPanel) {
      console.error('FormulaHelpPanel not found. Please load formula-help.js');
      return null;
    }
    return React.createElement(window.FormulaHelpPanel, props);
  };

  /**
   * 模块初始化函数
   * 确保所有依赖模块正确加载
   */
  const initialize = () => {
    const isReady = checkDependencies();
    
    if (isReady) {
      if (window.DEBUG_MODE) {
        console.log('✅ Business modules ready (5 modules loaded)');
      }
    } else {
      console.error('❌ Some business modules are missing');
    }

    return isReady;
  };

  /**
   * 获取模块统计信息
   * @param {Object} data - 应用数据
   * @returns {Object} 统计信息
   */
  const getModuleStats = (data) => {
    const revenueModules = data.revenue?.custom || [];
    const costModules = data.cost?.custom || [];
    const investmentModules = data.investment?.customInvestments || [];

    const enabledRevenueModules = revenueModules.filter(m => m.enabled).length;
    const enabledCostModules = costModules.filter(m => m.enabled).length;

    return {
      revenue: {
        total: revenueModules.length,
        enabled: enabledRevenueModules,
        disabled: revenueModules.length - enabledRevenueModules
      },
      cost: {
        total: costModules.length,
        enabled: enabledCostModules,
        disabled: costModules.length - enabledCostModules,
        fixed: costModules.filter(m => m.isFixed).length,
        variable: costModules.filter(m => !m.isFixed).length
      },
      investment: {
        total: investmentModules.length
      }
    };
  };

  // 在模块加载时自动初始化
  setTimeout(initialize, 100);

  // 向后兼容 - 保持原有API接口
  return {
    // 主要管理器组件
    CustomRevenueManager: getRevenueManager,
    CustomCostManager: getCostManager, 
    CustomInvestmentManager: getInvestmentManager,
    
    // 编辑器和帮助组件 (通过全局window对象访问)
    CustomModuleEditor: window.CustomModuleEditor,
    FormulaHelpPanel: getFormulaHelpPanel,

    // 工具方法
    initialize,
    checkDependencies,
    getModuleStats,

    // 模块信息
    version: '2.0.0',
    description: '宠物综合体经营测算应用 - 自定义模块管理系统',
    modules: [
      'revenue-manager: 收入模块管理器',
      'cost-manager: 成本模块管理器', 
      'investment-manager: 投资模块管理器',
      'module-editor: 通用模块编辑器',
      'formula-help: 公式帮助面板'
    ]
  };

})();