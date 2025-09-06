// 计算器模块索引 - 统一导入所有计算器模块
(function() {
  'use strict';

  // 模块加载配置
  const CALCULATOR_MODULES = {
    'revenue-calculator': '/js/core/calculators/revenue-calculator.js',
    'cost-calculator': '/js/core/calculators/cost-calculator.js', 
    'investment-calculator': '/js/core/calculators/investment-calculator.js',
    'profitability-calculator': '/js/core/calculators/profitability-calculator.js',
    'scenario-calculator': '/js/core/calculators/scenario-calculator.js',
    'breakeven-calculator': '/js/core/calculators/breakeven-calculator.js',
    'analysis-helper': '/js/core/calculators/analysis-helper.js',
    'main-calculator': '/js/core/calculators/main-calculator.js'
  };

  // 模块加载状态跟踪
  let loadedModules = new Set();
  let loadingPromises = new Map();

  // 计算器模块管理器
  window.CalculatorModules = {
    // 异步加载单个模块
    async loadModule(moduleName) {
      if (loadedModules.has(moduleName)) {
        return Promise.resolve();
      }

      if (loadingPromises.has(moduleName)) {
        return loadingPromises.get(moduleName);
      }

      const scriptPath = CALCULATOR_MODULES[moduleName];
      if (!scriptPath) {
        throw new Error(`Unknown calculator module: ${moduleName}`);
      }

      const loadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = scriptPath;
        script.onload = () => {
          loadedModules.add(moduleName);
          loadingPromises.delete(moduleName);
          console.log(`Calculator module loaded: ${moduleName}`);
          resolve();
        };
        script.onerror = () => {
          loadingPromises.delete(moduleName);
          reject(new Error(`Failed to load calculator module: ${moduleName}`));
        };
        document.head.appendChild(script);
      });

      loadingPromises.set(moduleName, loadPromise);
      return loadPromise;
    },

    // 异步加载所有模块
    async loadAllModules() {
      const moduleNames = Object.keys(CALCULATOR_MODULES);
      try {
        await Promise.all(moduleNames.map(name => this.loadModule(name)));
        console.log('All calculator modules loaded successfully');
        return true;
      } catch (error) {
        console.error('Failed to load calculator modules:', error);
        throw error;
      }
    },

    // 同步方式加载所有模块（用于HTML中的script标签）
    loadAllModulesSync() {
      const moduleNames = Object.keys(CALCULATOR_MODULES);
      moduleNames.forEach(moduleName => {
        const scriptPath = CALCULATOR_MODULES[moduleName];
        document.write(`<script src="${scriptPath}"></script>`);
      });
    },

    // 检查模块是否已加载
    isModuleLoaded(moduleName) {
      return loadedModules.has(moduleName);
    },

    // 检查所有模块是否已加载
    areAllModulesLoaded() {
      const moduleNames = Object.keys(CALCULATOR_MODULES);
      // 检查loadedModules集合或window对象中是否存在相应的类
      return moduleNames.every(name => {
        if (loadedModules.has(name)) {
          return true;
        }
        // 检查window对象中是否存在相应的类
        const classNameMap = {
          'revenue-calculator': 'RevenueCalculator',
          'cost-calculator': 'CostCalculator',
          'investment-calculator': 'InvestmentCalculator',
          'profitability-calculator': 'ProfitabilityCalculator',
          'scenario-calculator': 'ScenarioCalculator',
          'breakeven-calculator': 'BreakevenCalculator',
          'analysis-helper': 'AnalysisHelper',
          'main-calculator': 'MainCalculator'
        };
        const className = classNameMap[name];
        return className && window[className];
      });
    },

    // 获取已加载的模块列表
    getLoadedModules() {
      return Array.from(loadedModules);
    },

    // 创建计算器实例（确保所有模块已加载）
    createCalculator(formulaEngine) {
      if (!this.areAllModulesLoaded()) {
        throw new Error('Not all calculator modules are loaded. Call loadAllModules() first.');
      }

      // 检查必需的类是否存在
      const requiredClasses = [
        'RevenueCalculator',
        'CostCalculator', 
        'InvestmentCalculator',
        'ProfitabilityCalculator',
        'ScenarioCalculator',
        'BreakevenCalculator',
        'AnalysisHelper',
        'MainCalculator'
      ];

      const missingClasses = requiredClasses.filter(className => !window[className]);
      if (missingClasses.length > 0) {
        throw new Error(`Missing calculator classes: ${missingClasses.join(', ')}`);
      }

      return new window.MainCalculator(formulaEngine);
    },

    // 获取模块信息
    getModuleInfo() {
      return {
        modules: CALCULATOR_MODULES,
        loaded: Array.from(loadedModules),
        totalModules: Object.keys(CALCULATOR_MODULES).length,
        loadedCount: loadedModules.size
      };
    },

    // 重新加载指定模块
    async reloadModule(moduleName) {
      // 移除已加载标记
      loadedModules.delete(moduleName);
      
      // 移除现有的script标签
      const existingScripts = document.querySelectorAll(`script[src*="${moduleName}"]`);
      existingScripts.forEach(script => script.remove());
      
      // 重新加载模块
      return this.loadModule(moduleName);
    },

    // 卸载所有模块
    unloadAllModules() {
      // 移除所有相关的script标签
      Object.keys(CALCULATOR_MODULES).forEach(moduleName => {
        const scripts = document.querySelectorAll(`script[src*="${moduleName}"]`);
        scripts.forEach(script => script.remove());
      });

      // 清理全局变量
      const classNames = [
        'RevenueCalculator',
        'CostCalculator',
        'InvestmentCalculator', 
        'ProfitabilityCalculator',
        'ScenarioCalculator',
        'BreakevenCalculator',
        'AnalysisHelper',
        'MainCalculator'
      ];
      
      classNames.forEach(className => {
        if (window[className]) {
          delete window[className];
        }
      });

      // 重置状态
      loadedModules.clear();
      loadingPromises.clear();
      
      console.log('All calculator modules unloaded');
    }
  };

  // 创建API包装器（辅助函数）
  function createCalculatorWrapper(calculator) {
    return {
      calculate: calculator.calculate.bind(calculator),
      calculateRevenue: calculator.revenueCalculator.calculate.bind(calculator.revenueCalculator),
      calculateCost: calculator.costCalculator.calculate.bind(calculator.costCalculator),
      calculateInvestment: calculator.investmentCalculator.calculate.bind(calculator.investmentCalculator),
      calculateProfitability: calculator.profitabilityCalculator.calculate.bind(calculator.profitabilityCalculator),
      calculateScenarios: calculator.scenarioCalculator.calculate.bind(calculator.scenarioCalculator),
      calculateBreakeven: calculator.breakevenCalculator.calculate.bind(calculator.breakevenCalculator),
      generateDataHash: calculator.generateDataHash.bind(calculator)
    };
  }

  // 兼容性方法：直接创建旧版Calculator实例
  window.CalculatorModules.createLegacyCalculator = function(formulaEngine) {
    if (!window.MainCalculator) {
      throw new Error('No calculator implementation available');
    }
    
    const calculator = new window.MainCalculator(formulaEngine);
    return createCalculatorWrapper(calculator);
  };

  // 自动检测和加载模块（可选）
  window.CalculatorModules.autoLoad = function() {
    // 检查是否在支持async/await的环境中
    if (typeof Promise !== 'undefined') {
      return this.loadAllModules().catch(error => {
        console.warn('Auto-load of calculator modules failed:', error);
        return false;
      });
    }
    return Promise.resolve(false);
  };

  // 为向后兼容，将createLegacyCalculator注册为Calculator全局对象
  if (typeof window !== 'undefined') {
    // 创建一个兼容的Constructor函数，避免递归调用
    window.Calculator = function(formulaEngine) {
      // 直接创建MainCalculator实例，避免递归
      if (window.CalculatorModules.areAllModulesLoaded() && window.MainCalculator) {
        try {
          return new window.MainCalculator(formulaEngine);
        } catch (error) {
          console.error('Failed to create MainCalculator:', error);
        }
      }
      
      // 如果MainCalculator不可用，抛出错误而不是递归调用
      throw new Error('Calculator modules not properly loaded or MainCalculator not available');
    };
    
    // 为了完全兼容，也添加一些静态方法
    window.Calculator.create = function(formulaEngine) {
      return new window.Calculator(formulaEngine);
    };
    
    if (window.DEBUG_MODE) console.log('✅ Calculator initialized');
  }
  
  if (window.DEBUG_MODE) console.log('Calculator modules ready');
})();