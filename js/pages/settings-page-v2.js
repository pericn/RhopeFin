// 参数设置页面 v2.1 - 紧凑双栏编辑布局
window.SettingsPage = (function() {
  const h = React.createElement;

  const CATEGORIES = [
    { key: 'basic', label: '基础设置', note: '面积与营业节奏' },
    { key: 'investment', label: '投资参数', note: '装修与一次性投入' },
    { key: 'cost', label: '成本参数', note: '固定与变动支出' },
    { key: 'revenue', label: '收入参数', note: '房量与客单价' }
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
        key: 'settings-header'
      }),
      h('div', { key: 'settings-layout', className: 'settings-layout settings-layout--reset settings-layout--adaptive' }, [
        h('aside', { key: 'settings-sidebar', className: 'settings-sidebar' }, [
          h('div', { key: 'sidebar-card', className: 'settings-sidebar-card' }, [
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
            h('h2', { key: 'title', className: 'settings-editor-title rilo-section-title' }, CATEGORIES.find(item => item.key === activeCategory)?.label || '参数配置')
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

  const SettingsGlossaryHeader = () => {
    return h('div', {
      className: 'rilo-ledger-panel rilo-card-hierarchy-high rounded-2xl border border-[var(--rilo-border-deep)] px-5 py-5 md:px-6 md:py-6 rilo-zh-page'
    }, [
      h('div', { key: 'top', className: 'rilo-ledger-header' }, [
        h('div', { key: 'row', className: 'flex flex-col gap-4' }, [
          h('div', { key: 'copy', className: 'rilo-ledger-header-copy' }, [
            h('div', { key: 'eyebrow', className: 'rilo-ledger-eyebrow' }, '经营参数'),
            h('h1', { key: 'title', className: 'rilo-ledger-title rilo-display-serif rilo-zh-header' }, '经营设置'),
            h('p', { key: 'hint', className: 'rilo-ledger-subtitle rilo-zh-subtle' }, null)
          ])
        ])
      ])
    ]);
  };

  return { SettingsPage };
})();
