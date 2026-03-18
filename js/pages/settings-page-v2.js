// 参数设置页面 v2.1 - 统一"左主内容 + 右侧 InspectorPanel（结论/过程/术语）"布局
window.SettingsPage = (function() {

  // 主设置页面组件
  const SettingsPage = ({ data, updateData, formulaEngine }) => {
    const [showDrawer, setShowDrawer] = React.useState(false);
    // TODO(交互校验)：入住率控件需要 0-100 且保留 1 位小数；越界自动夹到 [0,100]

    // 基础计算结果（用于左侧"基础结果"区域）
    let calculations = null;
    if (window.MainCalculator && formulaEngine) {
      try {
        const calculator = new window.MainCalculator(formulaEngine);
        calculations = calculator.calculate(data);
      } catch (e) {
        console.warn('基础结果计算失败', e);
      }
    }

    const paybackLabel = (() => {
      const profit = calculations?.profitability?.profit || 0;
      const pb = calculations?.profitability?.paybackYears;
      if (!calculations) return '-';
      if (!isFinite(pb) || profit <= 0) return '无法回本';
      return `${(pb || 0).toFixed(1)} 年`;
    })();

    const glossaryTerms = {
      fitout: { title: '装修标准', body: '每平米装修投入标准。影响初始投资与回本周期。' },
      margin: { title: '净利润率', body: '净利润 ÷ 总收入。用于衡量整体经营效率。' },
      payback: { title: '回本周期', body: '初始投资 ÷ 年净利润。若年净利润小于或等于 0，则视为暂时无法回本。' }
    };

    const left = React.createElement('div', { className: 'space-y-5 lg:space-y-6 rilo-zh-page' }, [
      React.createElement(SettingsGlossaryHeader, {
        key: 'settings-glossary-header',
        onOpenGlossaryFallback: () => setShowDrawer(true)
      }),

      // 基础设置
      React.createElement(window.BasicSettings.BasicSettings, {
        key: 'basic-settings',
        data,
        updateData
      }),

      // 核心配置（原先左右分栏，这里统一放到左侧作为主内容）
      React.createElement(window.UIComponents.Space, {
        key: 'main-stack',
        direction: 'vertical',
        size: 'large',
        style: { width: '100%' }
      }, [
        React.createElement(window.InvestmentSettings.InvestmentSettings, {
          key: 'investment-settings',
          data,
          updateData
        }),
        React.createElement(window.CostSettings.CostSettings, {
          key: 'cost-settings',
          data,
          updateData,
          formulaEngine
        }),
        React.createElement(window.RevenueSettings.RevenueSettings, {
          key: 'revenue-settings',
          data,
          updateData,
          formulaEngine
        })
      ]),

      // 基础结果（最小可行显示）-- 年总营收 / 年总成本 / 年净利润 / 净利润率 / 回本周期
      React.createElement(window.UIComponents.Section, {
        key: 'basic-outcomes',
        title: '📌 基础结果',
        right: React.createElement(window.UIComponents.Tooltip, {
          key: 'basic-outcomes-hint',
          content: React.createElement('div', { className: 'space-y-1' }, [
            React.createElement('div', { key: 'h1', className: 'text-xs' }, '轻提示：核心术语'),
            React.createElement('div', { key: 'h2', className: 'text-xs text-[var(--rilo-text-3)]' }, ''),
            React.createElement('div', { key: 'b1', className: 'text-xs text-white' }, [
              '净利润率：',
              React.createElement(window.RiloUI?.Term || 'span', { key: 't1', termKey: 'margin' }, '净利润 ÷ 总收入')
            ]),
            React.createElement('div', { key: 'b2', className: 'text-xs text-white' }, [
              '回本周期：',
              React.createElement(window.RiloUI?.Term || 'span', { key: 't2', termKey: 'payback' }, '初始投资 ÷ 年净利润')
            ]),
            React.createElement('div', { key: 'h3', className: 'text-xs opacity-80' }, '在右侧"术语"可查看详情')
          ])
        }, React.createElement('span', { className: 'text-xs text-[var(--rilo-text-3)] underline decoration-dotted cursor-help' }, '术语提示'))
      }, [
        React.createElement(window.UIComponents.KPI, {
          key: 'kpi-revenue',
          title: '年总营收',
          value: calculations?.revenue?.total || 0,
          format: 'currency',
          color: 'info'
        }),
        React.createElement(window.UIComponents.KPI, {
          key: 'kpi-cost',
          title: '年总成本',
          value: calculations?.cost?.total || 0,
          format: 'currency',
          color: 'danger'
        }),
        React.createElement(window.UIComponents.KPI, {
          key: 'kpi-profit',
          title: '年净利润',
          value: calculations?.profitability?.profit || 0,
          format: 'currency',
          color: (calculations?.profitability?.profit || 0) >= 0 ? 'success' : 'danger'
        }),
        React.createElement(window.UIComponents.KPI, {
          key: 'kpi-margin',
          title: '净利润率',
          value: calculations ? (calculations?.profitability?.margin || 0) : 0,
          format: 'percent',
          color: (calculations?.profitability?.margin || 0) >= 0 ? 'success' : 'danger'
        }),
        React.createElement(window.UIComponents.KPI, {
          key: 'kpi-payback',
          title: '回本周期',
          value: paybackLabel,
          color: (!calculations || (calculations?.profitability?.profit || 0) <= 0 || !isFinite(calculations?.profitability?.paybackYears)) ? 'danger' : 'warning'
        })
      ]),

      // 底部工具栏
      React.createElement('div', {
        key: 'bottom-toolbar',
        className: 'mt-8 pt-6 border-t border-[var(--rilo-border-deep)]'
      }, [
        React.createElement(window.UIComponents.Row, {
          key: 'toolbar-row',
          justify: 'space-between',
          align: 'middle'
        }, [
          React.createElement(window.UIComponents.Col, { key: 'help-col' },
            React.createElement(window.CustomModules.FormulaHelpPanel, { formulaEngine })
          ),

          React.createElement(window.UIComponents.Col, { key: 'actions-col' },
            React.createElement(window.UIComponents.Space, null, [
              React.createElement(window.UIComponents.Button, {
                key: 'preset-btn',
                onClick: () => {
                  if (window.dataManager) {
                    const presetData = window.dataManager.applyPreset();
                    // 保留用户的项目名称
                    const preservedProjectName = data?.basic?.projectName;
                    if (preservedProjectName && preservedProjectName !== "Rilo Analysis 示例") {
                      presetData.basic.projectName = preservedProjectName;
                    }
                    updateData(presetData);
                  }
                }
              }, '📋 套用预设参数'),

              React.createElement(window.UIComponents.Button, {
                key: 'export-btn',
                onClick: () => {
                  if (window.dataManager) window.dataManager.exportData(data);
                },
                variant: 'secondary'
              }, '💾 导出数据')
            ])
          )
        ])
      ])
    ]);

    const conclusion = React.createElement('div', { className: 'space-y-3 text-sm text-[var(--rilo-text-2)] rilo-zh-page' }, [
      React.createElement('div', { key: 'c1', className: 'rounded-xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] p-3.5' }, [
        React.createElement('div', { key: 't', className: 'font-semibold text-[var(--rilo-text-1)]' }, '怎么用这个页'),
        React.createElement('div', { key: 'b', className: 'mt-1 text-[var(--rilo-text-2)] rilo-zh-subtle' }, '左侧填参数；右侧 Inspector 里看公式、过程与术语解释。默认把细节收起来，避免信息噪音。')
      ]),
      React.createElement('div', { key: 'c2', className: 'rounded-xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] p-3.5' }, [
        React.createElement('div', { key: 't', className: 'font-semibold text-[var(--rilo-text-1)]' }, '小建议'),
        React.createElement('ul', { key: 'b', className: 'mt-1.5 list-disc pl-5 space-y-1.5 text-[var(--rilo-text-2)] rilo-zh-subtle' }, [
          React.createElement('li', { key: 'i1' }, '先把"基础设置/面积/人力/租金"填准，再调收入结构。'),
          React.createElement('li', { key: 'i2' }, '回本周期跑飞时，多半是净利润≤0 或 初始投资太高。')
        ])
      ])
    ]);

    const process = React.createElement('div', { className: 'space-y-3 rilo-zh-page' }, [
      React.createElement('div', { key: 'p1', className: 'text-xs text-[var(--rilo-text-3)] rilo-zh-subtle' }, '这里展示公式与中间计算值，默认折叠；需要核对时再展开。'),
      React.createElement('div', { key: 'p2', className: 'bg-[var(--rilo-surface-2)] rounded-2xl p-4 border border-[var(--rilo-border-deep)]' }, [
        React.createElement('h3', { key: 't', className: 'text-sm font-semibold text-[var(--rilo-text-1)] mb-2' }, '📊 计算公式与数据'),
        React.createElement(window.FormulaDisplay.FormulaDisplay, {
          key: 'formula-display-component',
          data,
          formulaEngine
        })
      ])
    ]);

    const mainContent = window.RiloUI?.TwoPaneLayout ? React.createElement(window.RiloUI.TwoPaneLayout, {
      leftTitle: null,
      left,
      inspectorTitle: '参数配置 Inspector',
      conclusion,
      process,
      glossaryTerms
    }) : left;

    // 根渲染：主内容 + 抽屉
    return React.createElement(React.Fragment, null,
      mainContent,
      !window.RiloUI?.TwoPaneLayout && window.RiloUI?.DefinitionsDrawer ? React.createElement(window.RiloUI.DefinitionsDrawer, {
        isOpen: showDrawer,
        onClose: () => setShowDrawer(false),
        glossaryTerms: Object.assign({}, glossaryTerms, window.RiloUI.termRegistry || {})
      }) : null
    );
  };

  const SettingsGlossaryHeader = ({ onOpenGlossaryFallback }) => {
    const useInspector = window.RiloUI?.useInspector;
    const inspector = useInspector ? useInspector() : null;
    const inspectorApi = inspector || window.RiloUI?.activeInspectorApi;

    const openGlossary = () => {
      if (inspectorApi?.setActiveSection && inspectorApi?.setSelectedTerm) {
        inspectorApi.setActiveSection('glossary');
        inspectorApi.setSelectedTerm(null);
        return;
      }

      if (onOpenGlossaryFallback) {
        onOpenGlossaryFallback();
      }
    };

    return React.createElement('div', {
      className: 'rounded-2xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] px-5 py-4 md:px-6 md:py-5 rilo-zh-page'
    }, [
      React.createElement('div', {
        key: 'top',
        className: 'flex flex-col gap-3 md:flex-row md:items-start md:justify-between'
      }, [
        React.createElement('div', { key: 'copy' }, [
          React.createElement('h1', {
            key: 'title',
            className: 'text-2xl font-bold text-[var(--rilo-text-1)] rilo-zh-header'
          }, '⚙️ 参数配置'),
          React.createElement('p', {
            key: 'hint',
            className: 'mt-2 max-w-2xl text-sm text-[var(--rilo-text-3)] rilo-zh-subtle'
          }, '提示：带浅蓝下划线的术语可悬停查看解释；点「查看更多」会切到右侧「术语」并定位对应条目。')
        ]),
        React.createElement(window.UIComponents.Button, {
          key: 'terms-btn',
          onClick: openGlossary,
          variant: 'outline',
          size: 'small',
          className: 'self-start'
        }, '📖 术语解释')
      ])
    ]);
  };

  return { SettingsPage };

})();
