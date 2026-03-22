// 主应用文件 - 整合所有模块并启动应用
(function() {
  'use strict';


  // 主应用组件
  const App = () => {
    const [data, setData] = React.useState(null);
    const [calculations, setCalculations] = React.useState(null);
    const [activeTab, setActiveTab] = React.useState('overview');
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false); // 抽屉状态
    const [drawerTermKey, setDrawerTermKey] = React.useState(null);
    const [drawerSection, setDrawerSection] = React.useState('glossary');
    const [drawerContent, setDrawerContent] = React.useState({
      title: '说明面板',
      conclusion: null,
      process: null,
      glossaryTerms: {}
    });

    // 初始化数据管理器和计算引擎
    const [dataManager] = React.useState(() => new window.DataManager());
    const [formulaEngine] = React.useState(() => new window.FormulaEngine());
    const [calculator] = React.useState(() => {
      // 确保所有计算器模块已加载
      if (window.CalculatorModules && window.CalculatorModules.areAllModulesLoaded() && window.MainCalculator) {
        try {
          return new window.MainCalculator(formulaEngine);
        } catch (error) {
          console.error('Failed to create MainCalculator:', error);
        }
      }
      // 如果模块未完全加载，返回一个空的计算器对象
      return {
        calculate: () => ({}),
        calculateRevenue: () => ({}),
        calculateCost: () => ({}),
        calculateInvestment: () => ({}),
        calculateProfitability: () => ({}),
        calculateScenarios: () => ({}),
        calculateBreakeven: () => ({}),
        generateDataHash: () => ''
      };
    });

    // 将全局引用设置给其他模块使用
    React.useEffect(() => {
      window.dataManager = dataManager;
      window.formulaEngine = formulaEngine;
      window.calculator = calculator;
    }, [dataManager, formulaEngine, calculator]);

    React.useEffect(() => {
      window.RiloUI = window.RiloUI || {};
      window.RiloUI.inspectorMode = 'drawer';
      window.RiloUI.setDefinitionsDrawerContent = (content = {}) => {
        setDrawerContent(prev => ({
          ...prev,
          ...content,
          glossaryTerms: Object.assign({}, prev.glossaryTerms || {}, content.glossaryTerms || {})
        }));
      };

      window.RiloUI.openDefinitionsDrawer = (termKey = null, section = 'glossary') => {
        setDrawerTermKey(termKey);
        setDrawerSection(section || 'glossary');
        setIsDrawerOpen(true);
      };

      return () => {
        if (window.RiloUI?.setDefinitionsDrawerContent) {
          delete window.RiloUI.setDefinitionsDrawerContent;
        }

        if (window.RiloUI?.openDefinitionsDrawer) {
          delete window.RiloUI.openDefinitionsDrawer;
        }

        if (window.RiloUI) {
          delete window.RiloUI.inspectorMode;
        }
      };
    }, []);

    // 页签配置
    const tabs = [
      { key: 'overview', label: '项目概况', detail: '默认落点' },
      { key: 'settings', label: '经营设置', detail: '输入与校准' },
      { key: 'analysis', label: '敏感度分析', detail: '参数扰动' }
    ];

    const pageActionButtonProps = {
      variant: 'outline',
      size: 'small'
    };

    const settingsPageActions = [
      React.createElement(window.UIComponents.Button, {
        key: 'preset',
        onClick: () => {
          const presetData = dataManager.getPresetData();
          const preservedProjectName = data?.basic?.projectName;
          if (preservedProjectName && preservedProjectName !== 'Rilo Analysis 示例') {
            presetData.basic.projectName = preservedProjectName;
          }
          setData(presetData);
          updateData(presetData);
        },
        ...pageActionButtonProps
      }, '示例参数'),
      React.createElement(window.UIComponents.Button, {
        key: 'export',
        onClick: () => dataManager.exportData(data),
        ...pageActionButtonProps
      }, '导出数据'),
      React.createElement('div', {
        key: 'import-wrapper',
        className: 'relative'
      }, [
        React.createElement('input', {
          key: 'import-input',
          type: 'file',
          accept: '.json',
          onChange: (event) => {
            const file = event.target.files[0];
            if (file && dataManager) {
              dataManager.importData(file, (error, importedData) => {
                alert(error ? '导入失败: ' + error.message : '数据导入成功！');
                if (!error) updateData(importedData);
                event.target.value = '';
              });
            }
          },
          className: 'absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0'
        }),
        React.createElement(window.UIComponents.Button, {
          key: 'import-button',
          ...pageActionButtonProps,
          className: 'pointer-events-none'
        }, '导入数据')
      ]),
      React.createElement(window.UIComponents.Button, {
        key: 'clear',
        onClick: () => {
          if (confirm('确认清除所有保存的数据？')) {
            const clearedData = dataManager.clearStorage();
            setData(clearedData);
            updateData(clearedData);
          }
        },
        danger: true,
        ...pageActionButtonProps
      }, '清除数据'),
      React.createElement(window.UIComponents.Button, {
        key: 'glossary',
        onClick: () => {
          setDrawerTermKey(null);
          setDrawerSection('glossary');
          setIsDrawerOpen(true);
        },
        ...pageActionButtonProps
      }, '术语解释')
    ];

    // 初始化数据
    React.useEffect(() => {
      const initializeApp = async () => {
        try {
          setIsLoading(true);
          setError(null);

          // 加载数据
          const initialData = dataManager.loadFromStorage();
          setData(initialData);

          // 验证数据
          const validation = dataManager.validateData(initialData);
          if (!validation.isValid) {
            console.warn('数据验证警告:', validation.errors);
          }

          setIsLoading(false);
        } catch (err) {
          console.error('应用初始化失败:', err);
          setError('应用初始化失败，请刷新页面重试');
          setIsLoading(false);
        }
      };

      initializeApp();
    }, [dataManager]);

    // 计算财务指标
    React.useEffect(() => {
      if (data) {
        try {
          const results = calculator.calculate(data);
          setCalculations(results);
        } catch (err) {
          console.error('财务计算错误:', err);
          setError('财务计算出现错误');
        }
      }
    }, [data, calculator]);

    // 数据更新处理
    const updateData = React.useCallback((newData) => {
      try {
        // 验证新数据
        const validation = dataManager.validateData(newData);
        if (!validation.isValid) {
          console.warn('数据验证警告:', validation.errors);
        }

        // 保存数据
        dataManager.saveToStorage(newData);
        setData(newData);
        setError(null);
      } catch (err) {
        console.error('数据更新失败:', err);
        setError('数据更新失败');
      }
    }, [dataManager]);

    // 错误处理
    if (error) {
      return React.createElement('div', {
        className: 'min-h-screen bg-red-50 flex items-center justify-center'
      }, [
        React.createElement('div', {
          key: 'error-card',
          className: 'bg-white rounded-2xl shadow-xl p-8 max-w-md'
        }, [
          React.createElement('div', {
            key: 'icon',
            className: 'text-6xl text-center mb-4'
          }, '❌'),
          React.createElement('h2', {
            key: 'title',
            className: 'text-xl font-bold text-red-600 text-center mb-4'
          }, '应用错误'),
          React.createElement('p', {
            key: 'message',
            className: 'text-gray-600 text-center mb-6'
          }, error),
          React.createElement('div', {
            key: 'actions',
            className: 'flex justify-center gap-4'
          }, [
            React.createElement(window.UIComponents.Button, {
              key: 'reload',
              onClick: () => window.location.reload(),
              variant: 'primary'
            }, '重新加载'),
            React.createElement(window.UIComponents.Button, {
              key: 'clear',
              onClick: () => {
                dataManager.clearStorage();
                window.location.reload();
              },
              variant: 'secondary'
            }, '清除数据')
          ])
        ])
      ]);
    }

    // 加载状态
    if (isLoading) {
      return React.createElement('div', {
        className: 'min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center'
      }, [
        React.createElement('div', {
          key: 'loading-card',
          className: 'bg-white rounded-2xl shadow-xl p-8 text-center'
        }, [
          React.createElement(window.UIComponents.Loading, {
            key: 'spinner',
            size: 'large',
            color: 'blue'
          }),
          React.createElement('div', {
            key: 'text',
            className: 'mt-4 text-gray-600'
          }, '正在加载应用...')
        ])
      ]);
    }

    if (!data) {
      return React.createElement('div', {
        className: 'min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center'
      }, [
        React.createElement('div', {
          key: 'no-data',
          className: 'text-center text-gray-500'
        }, '数据加载中...')
      ]);
    }

    // 使用 Ant Design ConfigProvider 包装应用
    return window.UIComponents.createAntdApp(
      React.createElement('div', {
        key: 'app-wrapper',
        className: 'app-container'
      }, [
        // 术语抽屉
        window.RiloUI?.DefinitionsDrawer ? React.createElement(window.RiloUI.DefinitionsDrawer, {
          key: 'definitions-drawer',
          isOpen: isDrawerOpen,
          onClose: () => {
            setIsDrawerOpen(false);
            setDrawerTermKey(null);
          },
          title: drawerContent.title || '计算面板',
          activeSection: drawerSection,
          onSectionChange: setDrawerSection,
          conclusion: drawerContent.conclusion,
          process: drawerContent.process,
          glossaryTerms: Object.assign({}, window.RiloUI.termRegistry || {}, drawerContent.glossaryTerms || {}),
          selectedTerm: drawerTermKey
        }) : null,

        React.createElement('div', {
          key: 'container',
          className: 'rilo-app-shell'
        }, [
          React.createElement('div', {
            key: 'sidebar',
            className: 'rilo-app-sidebar'
          }, [
            React.createElement('div', {
              key: 'brand',
              className: 'rilo-app-brand'
            }, [
              React.createElement('div', {
                key: 'eyebrow',
                className: 'rilo-app-brand-kicker'
              }, 'Rilo Analysis'),
              React.createElement('h1', {
                key: 'title',
                className: 'rilo-app-brand-title'
              }, 'Rilo Analysis'),
              React.createElement('p', {
                key: 'subtitle',
                className: 'rilo-app-brand-copy'
              }, 'V5 frame, calm operating model workspace')
            ]),
            React.createElement('div', {
              key: 'sidebar-actions',
              className: 'rilo-app-sidebar-actions'
            }, [
              React.createElement('span', {
                key: 'icon-slot',
                className: 'rilo-app-icon-slot',
                'aria-hidden': 'true'
              }),
              React.createElement(window.UIComponents.Button, {
                key: 'reload-analysis',
                onClick: () => window.location.reload(),
                variant: 'outline',
                size: 'small',
                className: 'justify-center'
              }, '重新加载分析')
            ]),
            React.createElement('div', {
              key: 'nav-section-title',
              className: 'rilo-app-sidebar-section-title'
            }, '页面'),
            React.createElement('nav', {
              key: 'nav',
              className: 'rilo-app-nav',
              'aria-label': '主导航'
            }, tabs.map(tab => React.createElement('button', {
              key: tab.key,
              type: 'button',
              className: `rilo-app-nav-item ${activeTab === tab.key ? 'is-active' : ''}`,
              onClick: () => setActiveTab(tab.key)
            }, [
              React.createElement('span', { key: 'index', className: 'rilo-app-nav-index' }, tab.key === 'overview' ? '01' : tab.key === 'settings' ? '02' : '03'),
              React.createElement('span', { key: 'label', className: 'rilo-app-nav-label' }, tab.label),
              React.createElement('span', { key: 'meta', className: 'rilo-app-nav-meta' }, tab.detail),
              React.createElement('span', { key: 'dot', className: 'rilo-app-nav-dot' })
            ]))),
          ]),

          React.createElement('div', {
            key: 'main',
            className: 'rilo-app-main'
          }, [
            activeTab === 'settings' && React.createElement('div', {
              key: 'settings-actions',
              className: 'mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] px-4 py-3'
            }, settingsPageActions),
            React.createElement('div', {
              key: 'page-content',
              className: 'rilo-app-content'
            }, [
              activeTab === 'settings' && React.createElement((window.SettingsPage?.SettingsPage || window.SettingsPage), {
                key: 'settings',
                data: data,
                updateData: updateData,
                formulaEngine: formulaEngine
              }),

              activeTab === 'overview' && React.createElement((window.OverviewPage?.OverviewPage || window.OverviewPage), {
                key: 'overview',
                data: data,
                calculations: calculations,
                formulaEngine: formulaEngine,
                currency: data?.basic?.currency || '¥'
              }),

              activeTab === 'analysis' && React.createElement((window.AnalysisPage?.AnalysisPage || window.AnalysisPage), {
                key: 'analysis',
                data: data,
                calculations: calculations,
                formulaEngine: formulaEngine,
                currency: data?.basic?.currency || '¥'
              })
            ])
          ])
        ])
      ])
    );
  };

  // 错误边界组件
  const ErrorBoundary = ({ children }) => {
    const [hasError, setHasError] = React.useState(false);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      const handleError = (error) => {
        console.error('React Error Boundary:', error);
        setHasError(true);
        setError(error);
      };

      const handleUnhandledRejection = (event) => {
        handleError(event.reason);
      };

      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }, []);

    if (hasError) {
      // 如果 UIComponents 尚未就绪，降级使用原生 button，避免再次触发 React #130
      const SafeButton = window.UIComponents?.Button || 'button';

      return React.createElement('div', {
        className: 'min-h-screen bg-red-50 flex items-center justify-center p-4'
      }, [
        React.createElement('div', {
          key: 'error-container',
          className: 'bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full'
        }, [
          React.createElement('div', {
            key: 'icon',
            className: 'text-6xl text-center mb-4'
          }, '💥'),
          React.createElement('h2', {
            key: 'title',
            className: 'text-2xl font-bold text-red-600 text-center mb-4'
          }, '应用崩溃'),
          React.createElement('p', {
            key: 'message',
            className: 'text-gray-600 text-center mb-6'
          }, '抱歉，应用遇到了意外错误。请尝试刷新页面或清除数据。'),
          React.createElement('div', {
            key: 'error-details',
            className: 'bg-gray-50 rounded-lg p-4 mb-6 text-xs text-gray-700 max-h-32 overflow-y-auto'
          }, error?.toString() || '未知错误'),
          React.createElement('div', {
            key: 'actions',
            className: 'flex flex-col sm:flex-row gap-3 justify-center'
          }, [
            React.createElement(SafeButton, {
              key: 'reload',
              onClick: () => window.location.reload(),
              variant: 'primary'
            }, '🔄 重新加载'),
            React.createElement(SafeButton, {
              key: 'clear',
              onClick: () => {
                localStorage.clear();
                window.location.reload();
              },
              variant: 'secondary'
            }, '🗑️ 清除数据重启'),
            React.createElement(SafeButton, {
              key: 'report',
              onClick: () => {
                const subject = encodeURIComponent('Rilo Analysis 应用错误报告');
                const body = encodeURIComponent(`错误详情：\n${error?.toString() || '未知错误'}\n\n浏览器：${navigator.userAgent}\n时间：${new Date().toISOString()}`);
                window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
              },
              variant: 'outline'
            }, '📧 报告错误')
          ])
        ])
      ]);
    }

    return children;
  };

  // 应用初始化检查 - 增强版
  // 说明：React 报错 #130 通常是 createElement 传入了 undefined 组件。
  // 这里除了检查全局模块对象外，也要检查实际渲染用到的“嵌套导出”（例如 SettingsPage.SettingsPage）。
  const checkDependencies = () => {
    const requiredGlobals = [
      'React',
      'ReactDOM',
      'DataManager',
      'FormulaEngine',
      'Calculator',
      'UIComponents',
      'ChartComponents',
      'FormulaDisplay',
      'CustomModules',
      'BreakevenAnalysis',
      'ScenarioAnalysis',
      'OverviewPage',
      'SettingsPage',
      'AnalysisPage'
    ];

    const missingDependencies = requiredGlobals.filter(dep => !window[dep]);

    // 额外检查：UI 组件与页面组件的实际导出是否存在
    const missingExports = [];

    const requireFn = (name, fn) => {
      try {
        if (!fn()) missingExports.push(name);
      } catch (e) {
        missingExports.push(name);
      }
    };

    requireFn('UIComponents.Button', () => typeof window.UIComponents?.Button === 'function');
    requireFn('UIComponents.Tabs', () => typeof window.UIComponents?.Tabs === 'function');
    requireFn('UIComponents.Loading', () => typeof window.UIComponents?.Loading === 'function');

    // 页面组件兼容两种导出：
    // 1) window.XxxPage = { XxxPage }
    // 2) window.XxxPage = function XxxPage() {}
    requireFn('SettingsPage', () => typeof (window.SettingsPage?.SettingsPage || window.SettingsPage) === 'function');
    requireFn('OverviewPage', () => typeof (window.OverviewPage?.OverviewPage || window.OverviewPage) === 'function');
    requireFn('AnalysisPage', () => typeof (window.AnalysisPage?.AnalysisPage || window.AnalysisPage) === 'function');

    if (missingDependencies.length > 0 || missingExports.length > 0) {
      if (missingDependencies.length > 0) {
        console.warn('暂时缺失的依赖模块:', missingDependencies);
      }
      if (missingExports.length > 0) {
        console.warn('依赖模块已存在，但缺少必要导出:', missingExports);
      }
      console.info('等待模块完全加载...');
      return false;
    }

    console.info('✅ 所有依赖模块已加载完成');
    return true;
  };

  // 启动应用 - 优化版
  let retryCount = 0;
  let appStarted = false;
  const maxRetries = 50; // 最多重试50次（10秒）
  
  const startApp = () => {
    if (appStarted) {
      console.log('应用已启动，跳过重复启动');
      return;
    }
    
    if (!checkDependencies()) {
      retryCount++;
      if (retryCount >= maxRetries) {
        // 超过重试次数，显示错误
        document.getElementById('root').innerHTML = `
          <div class="min-h-screen bg-red-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
              <div class="text-6xl mb-4">⚠️</div>
              <h2 class="text-xl font-bold text-red-600 mb-4">模块加载失败</h2>
              <p class="text-gray-600 mb-6">部分必需的模块未能正确加载，请检查网络连接或刷新页面重试。</p>
              <button 
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                onclick="window.location.reload()"
              >
                🔄 重新加载
              </button>
            </div>
          </div>
        `;
        return;
      }
      // 延迟重试，等待更多模块加载
      setTimeout(startApp, 200);
      return;
    }

    // 标记应用已启动
    appStarted = true;
    
    // 渲染应用
    ReactDOM.render(
      React.createElement(ErrorBoundary, null,
        React.createElement(App)
      ),
      document.getElementById('root')
    );

    console.log('🐾 Rilo Analysis 应用已启动 v2.0');
    console.log('📊 模块化架构 · 所有功能已加载');
  };

  // 将startApp暴露为全局函数，供模块加载完成后调用
  window.startApp = startApp;
  
  // 等待DOM就绪后启动应用
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
  } else {
    startApp();
  }

  // 全局错误处理
  window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
  });

})();
