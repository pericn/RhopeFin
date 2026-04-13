// 情景分析模块主入口文件
// 聚合所有子模块，提供统一的API接口，保持与原始代码的完全兼容性

// 确保所有子模块已加载
(function() {
  'use strict';

  // 检查依赖的子模块是否已加载
  function checkDependencies() {
    const requiredModules = [
      'ScenarioParameters',
      'ScenarioComparison', 
      'ScenarioChart',
      'ScenarioInsights',
      'ScenarioRecommendations'
    ];

    const missingModules = requiredModules.filter(module => !window[module]);
    
    if (missingModules.length > 0) {
      console.warn('情景分析模块缺少依赖:', missingModules);
      return false;
    }
    
    return true;
  }

  // 主要情景分析面板组件 - 保持原始API
  const ScenarioAnalysisPanel = ({ calculations, data, currency = "¥" }) => {
    if (!calculations || !calculations.scenarios) return null;

    return React.createElement('div', {
      className: 'space-y-6'
    }, [
      React.createElement('h2', {
        key: 'title',
        className: 'text-xl font-bold text-gray-800'
      }, '情景分析预测'),

      React.createElement(window.ScenarioParameters.ScenarioParameters, {
        key: 'parameters',
        data: data,
        updateData: window.dataManager?.updateDataPath
      }),

      React.createElement(window.ScenarioComparison.ScenarioComparison, {
        key: 'comparison',
        calculations: calculations,
        currency: currency
      }),

      React.createElement(window.ScenarioChart.ScenarioChart, {
        key: 'chart',
        calculations: calculations,
        currency: currency
      }),

      React.createElement(window.ScenarioInsights.ScenarioInsights, {
        key: 'insights',
        calculations: calculations,
        currency: currency
      }),

      React.createElement(window.ScenarioRecommendations.ScenarioRecommendations, {
        key: 'recommendations',
        calculations: calculations,
        currency: currency
      })
    ]);
  };

  // 创建综合的情景分析模块对象
  window.ScenarioAnalysis = (function() {
    
    // 检查依赖
    if (!checkDependencies()) {
      console.error('情景分析模块初始化失败：缺少必要的子模块');
      return {};
    }

    return {
      // 主组件 - 保持原始API
      ScenarioAnalysisPanel: ScenarioAnalysisPanel,

      // 子组件 - 从各自模块导出
      ScenarioParameters: window.ScenarioParameters?.ScenarioParameters,
      ScenarioComparison: window.ScenarioComparison?.ScenarioComparison,
      ScenarioChart: window.ScenarioChart?.ScenarioChart,
      ScenarioInsights: window.ScenarioInsights?.ScenarioInsights,
      ScenarioRecommendations: window.ScenarioRecommendations?.ScenarioRecommendations,

      // 工具函数和高级功能
      utils: {
        // 参数管理
        validateParameters: window.ScenarioParameters?.validateParameters,
        getDefaultParameters: window.ScenarioParameters?.getDefaultParameters,
        resetParameters: window.ScenarioParameters?.resetParameters,

        // 比较分析
        getBestWorstScenarios: window.ScenarioComparison?.getBestWorstScenarios,
        calculateScenarioDifferences: window.ScenarioComparison?.calculateScenarioDifferences,
        buildScenarioData: window.ScenarioComparison?.buildScenarioData,

        // 图表数据
        buildChartData: window.ScenarioChart?.buildChartData,
        generateChartSummary: window.ScenarioChart?.generateChartSummary,
        exportChartData: window.ScenarioChart?.exportChartData,

        // 洞察分析
        generateInsights: window.ScenarioInsights?.generateInsights,
        calculateKeyMetrics: window.ScenarioInsights?.calculateKeyMetrics,
        generateInsightsSummary: window.ScenarioInsights?.generateInsightsSummary,

        // 建议管理
        generateRecommendations: window.ScenarioRecommendations?.generateRecommendations,
        generateActionPlan: window.ScenarioRecommendations?.generateActionPlan,
        assessImplementationImpact: window.ScenarioRecommendations?.assessImplementationImpact
      },

      // 模块信息
      moduleInfo: {
        version: '2.0.0',
        modules: [
          'parameters.js',
          'comparison.js', 
          'chart.js',
          'insights.js',
          'recommendations.js'
        ],
        loadedModules: Object.keys(window).filter(key => key.startsWith('Scenario')),
        checkHealth: checkDependencies
      },

      // 兼容性方法 - 确保旧代码仍然工作
      compatibility: {
        // 检查是否所有必要的组件都可用
        isFullyLoaded: () => {
          return checkDependencies() && 
                 window.ScenarioAnalysis && 
                 window.ScenarioAnalysis.ScenarioAnalysisPanel;
        },
        
        // 获取模块状态报告
        getModuleStatus: () => {
          const modules = [
            'ScenarioParameters',
            'ScenarioComparison',
            'ScenarioChart', 
            'ScenarioInsights',
            'ScenarioRecommendations'
          ];
          
          return modules.reduce((status, module) => {
            status[module] = {
              loaded: !!window[module],
              hasComponents: window[module] && Object.keys(window[module]).length > 0
            };
            return status;
          }, {});
        }
      }
    };

  })();

  // 如果依赖检查失败，提供错误信息
  if (!window.ScenarioAnalysis || Object.keys(window.ScenarioAnalysis).length === 0) {
    console.error('情景分析模块加载失败。请确保以下文件已正确加载：');
    console.error('- js/modules/scenario/parameters.js');
    console.error('- js/modules/scenario/comparison.js');
    console.error('- js/modules/scenario/chart.js');
    console.error('- js/modules/scenario/insights.js');
    console.error('- js/modules/scenario/recommendations.js');
  }

})();