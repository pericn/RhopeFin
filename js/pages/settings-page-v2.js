// 参数设置页面 v2.1 - 统一"左主内容 + 右侧 InspectorPanel（概览/过程/术语）"布局
window.SettingsPage = (function() {

  // 主设置页面组件
  const SettingsPage = ({ data, updateData, formulaEngine }) => {
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

    // `netMargin` / `payback` 统一走 shared term-registry；这里只保留本页特有术语
    const glossaryTerms = {
      fitout: { title: '装修标准', body: '每平米装修投入标准。影响初始投资与回本周期。' }
    };

    const left = React.createElement('div', { className: 'space-y-5 lg:space-y-6 rilo-zh-page' }, [
      React.createElement(SettingsGlossaryHeader, {
        key: 'settings-glossary-header',
        onOpenGlossaryFallback: () => window.RiloUI?.openDefinitionsDrawer?.(null, 'glossary'),
        data,
        calculations,
        paybackLabel
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
              React.createElement(window.RiloUI?.Term || 'span', { key: 't1', termKey: 'netMargin' }, '净利润 ÷ 总收入')
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
        className: 'rilo-top-tools is-hidden mt-8 pt-6 border-t border-[var(--rilo-border-deep)]'
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

    const conclusion = null;

    const process = React.createElement('div', { className: 'space-y-3 rilo-zh-page' }, [
      React.createElement('div', { key: 'p1', className: 'text-xs text-[var(--rilo-text-3)] rilo-zh-subtle' }, '这里展示公式与中间计算值，供核对参数口径与结果来源。'),
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

    return React.createElement(React.Fragment, null, mainContent);
  };

  const SettingsGlossaryHeader = ({ onOpenGlossaryFallback, data, calculations, paybackLabel }) => {
    const useInspector = window.RiloUI?.useInspector;
    const inspector = useInspector ? useInspector() : null;
    const inspectorApi = inspector || window.RiloUI?.activeInspectorApi;

    const openGlossary = () => {
      if (inspectorApi?.setActiveSection && inspectorApi?.setSelectedTerm) {
        inspectorApi.setActiveSection('glossary');
        inspectorApi.setSelectedTerm(null);
        return;
      }

      if (window.RiloUI?.openDefinitionsDrawer) {
        window.RiloUI.openDefinitionsDrawer(null, 'glossary');
        return;
      }

      if (onOpenGlossaryFallback) onOpenGlossaryFallback();
    };

    const currency = data?.basic?.currency || '¥';
    const projectName = data?.basic?.projectName || 'Rilo Analysis';
    const monthlyRent = Number(data?.basic?.rentMonthly || 0);
    const fitout = Number(data?.investment?.fitoutStandard || 0);
    const margin = calculations?.profitability?.margin || 0;

    return React.createElement('div', {
      className: 'rilo-ledger-panel rilo-card-hierarchy-high rounded-2xl border border-[var(--rilo-border-deep)] px-5 py-5 md:px-6 md:py-6 rilo-zh-page'
    }, [
      React.createElement('div', {
        key: 'top',
        className: 'rilo-ledger-header'
      }, [
        React.createElement('div', {
          key: 'row',
          className: 'flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between'
        }, [
          React.createElement('div', { key: 'copy', className: 'rilo-ledger-header-copy' }, [
            React.createElement('div', {
              key: 'eyebrow',
              className: 'rilo-ledger-eyebrow'
            }, 'Settings'),
            React.createElement('h1', {
              key: 'title',
              className: 'rilo-ledger-title rilo-zh-header'
            }, '参数配置'),
            React.createElement('p', {
              key: 'hint',
              className: 'rilo-ledger-subtitle rilo-zh-subtle'
            }, '先校准基础盘子、租金与装修投入，再补充成本与收入参数。'),
            React.createElement('p', {
              key: 'hover-tutorial',
              className: 'mt-2 text-sm text-[var(--rilo-accent)]/90'
            }, 'Hover 教程：把鼠标移到 ADR / Occ / Rooms / Days 等浅蓝下划线术语上，可先看解释，再点“查看更多”打开术语抽屉。')
          ]),
          React.createElement(window.UIComponents.Button, {
            key: 'terms-btn',
            onClick: openGlossary,
            variant: 'outline',
            size: 'small',
            className: 'self-start'
          }, '📖 术语解释')
        ]),
        React.createElement('div', { key: 'metrics', className: 'rilo-ledger-metrics' }, [
          React.createElement('div', { key: 'm1', className: 'rilo-ledger-metric' }, [
            React.createElement('div', { key: 'label', className: 'rilo-ledger-metric-label' }, '项目'),
            React.createElement('div', { key: 'value', className: 'rilo-ledger-metric-value' }, projectName),
            React.createElement('div', { key: 'note', className: 'rilo-ledger-metric-note' }, `当前计价货币：${currency}`)
          ]),
          React.createElement('div', { key: 'm2', className: 'rilo-ledger-metric' }, [
            React.createElement('div', { key: 'label', className: 'rilo-ledger-metric-label' }, '固定盘子'),
            React.createElement('div', { key: 'value', className: 'rilo-ledger-metric-value' }, `${currency}${monthlyRent.toLocaleString()}/月`),
            React.createElement('div', { key: 'note', className: 'rilo-ledger-metric-note' }, `装修标准 ${currency}${fitout.toLocaleString()}/㎡`)
          ]),
          React.createElement('div', { key: 'm3', className: 'rilo-ledger-metric' }, [
            React.createElement('div', { key: 'label', className: 'rilo-ledger-metric-label' }, '结果预览'),
            React.createElement('div', { key: 'value', className: 'rilo-ledger-metric-value' }, paybackLabel),
            React.createElement('div', { key: 'note', className: 'rilo-ledger-metric-note' }, `净利润率 ${margin.toFixed(1)}%`)
          ])
        ]),
        React.createElement('div', { key: 'band', className: 'rilo-ledger-band' }, [
          React.createElement('span', { key: 'p1', className: 'rilo-ledger-pill' }, [React.createElement('strong', { key: 'k' }, '分组'), ' 基础设置 / 投资 / 成本 / 收入']),
          React.createElement('span', { key: 'p2', className: 'rilo-ledger-pill' }, [React.createElement('strong', { key: 'k' }, '复核重点'), ' 租金、人力、装修单价']),
          React.createElement('span', { key: 'p3', className: 'rilo-ledger-pill' }, [React.createElement('strong', { key: 'k' }, 'Drawer'), ' 术语与过程统一从右侧打开'])
        ])
      ])
    ]);
  };

  return { SettingsPage };

})();
