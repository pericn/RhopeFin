// 参数设置页面 v2.1 - 紧凑双栏编辑布局
window.SettingsPage = (function() {
  const h = React.createElement;

  const CATEGORIES = [
    { key: 'basic', label: '基础设置', note: '项目与基础盘子' },
    { key: 'investment', label: '投资参数', note: '装修与投入结构' },
    { key: 'cost', label: '成本参数', note: '固定与变动成本' },
    { key: 'revenue', label: '收入参数', note: '房量、入住与客单' }
  ];

  const SettingsPage = ({ data, updateData, formulaEngine }) => {
    const [activeCategory, setActiveCategory] = React.useState('basic');

    let calculations = null;
    if (window.MainCalculator && formulaEngine) {
      try {
        const calculator = new window.MainCalculator(formulaEngine);
        calculations = calculator.calculate(data);
      } catch (error) {
        console.warn('基础结果计算失败', error);
      }
    }

    const paybackLabel = (() => {
      const profit = calculations?.profitability?.profit || 0;
      const paybackYears = calculations?.profitability?.paybackYears;
      if (!calculations) return '-';
      if (!isFinite(paybackYears) || profit <= 0) return '无法回本';
      return `${paybackYears.toFixed(1)} 年`;
    })();

    const glossaryTerms = {
      fitout: { title: '装修标准', body: '每平米装修投入标准，直接影响初始投资额与回本周期。' }
    };

    const editorSurface = h('div', { className: 'settings-form' }, [
      activeCategory === 'basic' && h(window.BasicSettings.BasicSettings, {
        key: 'basic-settings',
        data,
        updateData
      }),
      activeCategory === 'investment' && h(window.InvestmentSettings.InvestmentSettings, {
        key: 'investment-settings',
        data,
        updateData
      }),
      activeCategory === 'cost' && h(window.CostSettings.CostSettings, {
        key: 'cost-settings',
        data,
        updateData,
        formulaEngine
      }),
      activeCategory === 'revenue' && h(window.RevenueSettings.RevenueSettings, {
        key: 'revenue-settings',
        data,
        updateData,
        formulaEngine
      }),
    ]);

    const left = h('div', { className: 'space-y-4 lg:space-y-5 rilo-zh-page' }, [
      h(SettingsGlossaryHeader, {
        key: 'settings-header',
        onOpenGlossaryFallback: () => window.RiloUI?.openDefinitionsDrawer?.(null, 'glossary'),
        data,
        calculations,
        paybackLabel
      }),
      h(SettingsOutcomeStrip, {
        key: 'outcomes',
        calculations
      }),
      h('div', { key: 'settings-layout', className: 'settings-layout settings-layout--reset' }, [
        h('aside', { key: 'settings-sidebar', className: 'settings-sidebar' }, [
          h('div', { key: 'sidebar-card', className: 'settings-sidebar-card' }, [
            h('div', { key: 'sidebar-title', className: 'settings-sidebar-title' }, '参数分组'),
            h('nav', { key: 'settings-nav', className: 'settings-cat-nav', 'aria-label': '参数分组' },
              CATEGORIES.map((category, index) => h('button', {
                key: category.key,
                type: 'button',
                className: `cat-item ${activeCategory === category.key ? 'active' : ''}`,
                onClick: () => setActiveCategory(category.key)
              }, [
                h('span', { key: 'index', className: 'cat-item-index' }, `${index + 1}`.padStart(2, '0')),
                h('span', { key: 'copy', className: 'cat-item-copy' }, [
                  h('span', { key: 'label', className: 'cat-item-label' }, category.label),
                  h('span', { key: 'note', className: 'cat-item-note' }, category.note)
                ]),
                h('span', { key: 'dot', className: 'cat-item-dot' })
              ]))
            )
          ])
        ]),
        h('section', { key: 'editor', className: 'settings-editor' }, [
          h('div', { key: 'editor-head', className: 'settings-editor-header' }, [
            h('div', { key: 'eyebrow', className: 'settings-editor-eyebrow' }, '当前分组'),
            h('h2', { key: 'title', className: 'settings-editor-title' }, CATEGORIES.find(item => item.key === activeCategory)?.label || '参数配置')
          ]),
          editorSurface
        ])
      ])
    ]);

    const process = h('div', { className: 'space-y-3 rilo-zh-page' }, [
      h('div', { key: 'panel', className: 'bg-[var(--rilo-surface-2)] rounded-2xl p-4 border border-[var(--rilo-border-deep)]' }, [
        h('h3', { key: 'title', className: 'text-sm font-semibold text-[var(--rilo-text-1)] mb-2' }, '计算公式'),
        h(window.FormulaDisplay.FormulaDisplay, {
          key: 'formula-display-component',
          data,
          formulaEngine
        })
      ])
    ]);

    const mainContent = window.RiloUI?.TwoPaneLayout
      ? h(window.RiloUI.TwoPaneLayout, {
          leftTitle: null,
          left,
          inspectorTitle: '经营设置',
          conclusion: null,
          process,
          glossaryTerms
        })
      : left;

    return h(React.Fragment, null, mainContent);
  };

  const SettingsOutcomeStrip = ({ calculations }) => h('div', {
    className: 'settings-outcome-strip'
  }, [
    h(window.UIComponents.KPI, {
      key: 'revenue',
      title: '年总营收',
      value: calculations?.revenue?.total || 0,
      format: 'currency',
      color: 'info'
    }),
    h(window.UIComponents.KPI, {
      key: 'cost',
      title: '年总成本',
      value: calculations?.cost?.total || 0,
      format: 'currency',
      color: 'danger'
    }),
    h(window.UIComponents.KPI, {
      key: 'profit',
      title: '年净利润',
      value: calculations?.profitability?.profit || 0,
      format: 'currency',
      color: (calculations?.profitability?.profit || 0) >= 0 ? 'success' : 'danger'
    }),
    h(window.UIComponents.KPI, {
      key: 'margin',
      title: '净利润率',
      value: calculations?.profitability?.margin || 0,
      format: 'percent',
      color: (calculations?.profitability?.margin || 0) >= 0 ? 'success' : 'danger'
    }),
  ]);

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
    return h('div', {
      className: 'rilo-ledger-panel rilo-card-hierarchy-high rounded-2xl border border-[var(--rilo-border-deep)] px-5 py-5 md:px-6 md:py-6 rilo-zh-page'
    }, [
      h('div', { key: 'top', className: 'rilo-ledger-header' }, [
        h('div', { key: 'row', className: 'flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between' }, [
          h('div', { key: 'copy', className: 'rilo-ledger-header-copy' }, [
            h('div', { key: 'eyebrow', className: 'rilo-ledger-eyebrow' }, 'Settings'),
            h('h1', { key: 'title', className: 'rilo-ledger-title rilo-zh-header' }, '经营设置'),
            h('p', { key: 'hint', className: 'rilo-ledger-subtitle rilo-zh-subtle' }, '左侧选择分组，右侧只编辑当前分组参数。'),
            h('p', {
              key: 'hover-tutorial',
              className: 'text-xs text-[var(--rilo-text-3)] rilo-zh-subtle'
            }, 'Hover 教程：将鼠标移到浅蓝下划线术语上可查看解释，点“查看更多”会打开术语面板。')
          ]),
          h(window.UIComponents.Button, {
            key: 'terms-btn',
            onClick: openGlossary,
            variant: 'outline',
            size: 'small',
            className: 'self-start'
          }, '术语解释')
        ]),
        h('div', { key: 'metrics', className: 'rilo-ledger-band' }, [
          h('span', { key: 'm1', className: 'rilo-ledger-pill' }, [h('strong', { key: 'label' }, '项目'), ` ${projectName}`]),
          h('span', { key: 'm2', className: 'rilo-ledger-pill' }, [h('strong', { key: 'label' }, '货币'), ` ${currency}`]),
          h('span', { key: 'm3', className: 'rilo-ledger-pill' }, [h('strong', { key: 'label' }, '回本'), ` ${paybackLabel}`])
        ])
      ])
    ]);
  };

  return { SettingsPage };
})();
