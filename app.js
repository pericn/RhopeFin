// 主应用文件 - 整合所有模块并启动应用
(function() {
  'use strict';


  // 主应用组件
  const App = () => {
    const [data, setData] = React.useState(null);
    const [calculations, setCalculations] = React.useState(null);
    const [activeTab, setActiveTab] = React.useState('settings'); // 恢复页签模式
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
      { key: 'settings', label: '参数配置', icon: '⚙️' },
      { key: 'overview', label: '财务分析', icon: '📊' },
      { key: 'analysis', label: '敏感度分析', icon: '📈' }
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
              }, data?.basic?.projectName || '宠物综合体经营测算'),
              React.createElement('p', {
                key: 'subtitle',
                className: 'rilo-app-brand-copy'
              }, '左侧切页，右侧只保留当前页面的指标、图表与明细入口。')
            ]),
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
              React.createElement('span', { key: 'label', className: 'rilo-app-nav-label' }, tab.label),
              React.createElement('span', { key: 'meta', className: 'rilo-app-nav-meta' }, tab.key === 'settings' ? '参数与输入' : tab.key === 'overview' ? '全局经营读数' : '单参数扰动')
            ]))),
            React.createElement('div', {
              key: 'sidebar-footer',
              className: 'rilo-app-sidebar-footer'
            }, [
              React.createElement('div', {
                key: 'profit-status',
                className: `rilo-app-status ${calculations?.profitability?.profit > 0 ? 'is-positive' : 'is-negative'}`
              }, calculations?.profitability?.profit > 0 ? '✅ 当前模型为盈利状态' : '⚠️ 当前模型仍为亏损状态'),
              React.createElement('button', {
                key: 'glossary-btn',
                type: 'button',
                className: 'rilo-app-sidebar-link',
                onClick: () => {
                  setDrawerTermKey(null);
                  setDrawerSection('glossary');
                  setIsDrawerOpen(true);
                }
              }, '📖 打开术语说明')
            ])
          ]),

          React.createElement('div', {
            key: 'main',
            className: 'rilo-app-main'
          }, [
            React.createElement('div', {
              key: 'header',
              className: 'rilo-app-header'
            }, [
              React.createElement('div', {
                key: 'header-main',
                className: 'rilo-app-header-main'
              }),
              React.createElement('div', {
                key: 'header-row',
                className: 'flex items-center justify-between gap-4'
              }, [
                React.createElement('div', {
                  key: 'title-stack',
                  className: 'space-y-1'
                }, [
                  React.createElement('div', {
                    key: 'current-tab',
                    className: 'text-xs uppercase tracking-[0.24em] text-[var(--rilo-text-3)]'
                  }, tabs.find(tab => tab.key === activeTab)?.label || '页面'),
                  React.createElement('h2', {
                    key: 'title',
                    className: 'text-2xl font-semibold text-[var(--rilo-text-1)]'
                  }, data?.basic?.projectName || 'Rilo Analysis'),
                  React.createElement('p', {
                    key: 'subtitle',
                    className: 'text-sm text-[var(--rilo-text-2)]'
                  }, '保持全局指标在上，业务细节下沉，术语与过程通过 Drawer 查看。')
                ]),
                React.createElement('div', {
                  key: 'status',
                  className: 'text-right'
                }, [
                  React.createElement('div', {
                    key: 'profit-status',
                    className: `text-sm font-medium ${
                      calculations?.profitability?.profit > 0 ? 'text-[var(--rilo-sem-success)]' : 'text-[var(--rilo-sem-danger)]'
                    }`
                  }, calculations?.profitability?.profit > 0 ? '✅ 盈利中' : '❌ 亏损中'),
                  React.createElement('div', {
                    key: 'amount',
                    className: 'text-xs text-[var(--rilo-text-3)]'
                  }, `${data?.basic?.currency || '¥'}${(calculations?.profitability?.profit || 0).toLocaleString()}/年`)
                ])
              ]),

              React.createElement('div', {
                key: 'quick-actions-row',
                className: 'rilo-top-tools is-hidden flex items-center justify-between border-t pt-4'
              }, [
                React.createElement('div', {
                  key: 'quick-actions',
                  className: 'flex gap-3'
                }, [
                  React.createElement(window.UIComponents.Button, {
                    key: 'preset',
                    size: 'small',
                    variant: 'secondary',
                    onClick: () => {
                      const presetData = dataManager.getPresetData();
                      // 保留用户的项目名称
                      const preservedProjectName = data?.basic?.projectName;
                      if (preservedProjectName && preservedProjectName !== "Rilo Analysis 示例") {
                        presetData.basic.projectName = preservedProjectName;
                      }
                      setData(presetData);
                      updateData(presetData);
                    }
                  }, '📋 示例参数'),
                  React.createElement(window.UIComponents.Button, {
                    key: 'export',
                    size: 'small',
                    variant: 'primary',
                    onClick: () => dataManager.exportData(data)
                  }, '📤 导出数据'),
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
                      className: 'absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                    }),
                    React.createElement(window.UIComponents.Button, {
                      key: 'import',
                      size: 'small',
                      variant: 'outline',
                      onClick: (event) => {
                        const input = event.target.closest('.relative').querySelector('input[type="file"]');
                        if (input) input.click();
                      }
                    }, '📥 导入数据')
                  ]),
                  React.createElement(window.UIComponents.Button, {
                    key: 'clear',
                    size: 'small',
                    variant: 'danger',
                    onClick: () => {
                      if (confirm('确认清除所有保存的数据？')) {
                        const clearedData = dataManager.clearStorage();
                        setData(clearedData);
                        updateData(clearedData);
                      }
                    }
                  }, '🗑️ 清除数据')
                ]),
                // 页签导航
                React.createElement(window.UIComponents.Tabs, {
                  key: 'tabs',
                  tabs: tabs,
                  activeTab: activeTab,
                  onTabChange: setActiveTab
                })
              ])
            ]),

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
