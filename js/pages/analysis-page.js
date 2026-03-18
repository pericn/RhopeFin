// 敏感度分析页面 v2.0 - 移除右侧 Inspector，专注主内容
window.AnalysisPage = (function() {

  // 辅助函数：确保对象路径存在
  const ensurePath = (obj, path) => {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (!current[key]) current[key] = {};
      current = current[key];
    }
    return current;
  };

  // 获取自定义收入名称的辅助函数
  const getCustomRevenueName = (data) => {
    if (data && data.revenue?.custom && data.revenue.custom.length > 0) {
      const groomingItem = data.revenue.custom.find(item => 
        item.name && item.name.includes('洗护'));
      if (groomingItem) {
        return groomingItem.name;
      }
      return data.revenue.custom[0]?.name || '自定义收入';
    }
    return '自定义收入';
  };

  // 敏感度分析页面组件（移除右侧 Inspector）
  const AnalysisPage = ({ data, calculations, formulaEngine, currency = "¥" }) => {
    const Term = window.RiloUI?.Term;
    const [showDrawer, setShowDrawer] = React.useState(false);
    const [selectedParam, setSelectedParam] = React.useState('fitoutStandard');
    const [paramRange, setParamRange] = React.useState(20);
    const [impactMetric, setImpactMetric] = React.useState('paybackYears');

    const glossaryTerms = {
      margin: { title: '利润率/毛利率', body: '利润率看整体经营效率；毛利率看"卖出去的东西"本身赚不赚钱。' }
    };

    // Build conclusion summary (for Inspector) using KPI cards with Term hover
    const conclusion = (() => {
      if (!calculations) return null;
      const { profitability } = calculations;
      const profit = profitability?.profit || 0;
      const margin = profitability?.margin || 0;
      const payback = profitability?.paybackYears;
      const KPI = window.UIComponents?.KPI;
      if (!KPI) {
        // Fallback plain text
        return React.createElement('div', { className: 'space-y-2 text-sm' }, [
          React.createElement('div', { key: 'param' }, `参数: ${selectedParam}`),
          React.createElement('div', { key: 'range' }, `变化范围: ±${paramRange}%`),
          React.createElement('div', { key: 'metric' }, `影响指标: ${impactMetric === 'paybackYears' ? '回本周期' : impactMetric === 'netMargin' ? '净利润率' : '综合毛利率'}`),
          React.createElement('div', { key: 'profit' }, `净利润: ¥${profit ? (profit/10000).toFixed(2) : 0} 万元`),
          React.createElement('div', { key: 'margin' }, `净利润率: ${margin.toFixed(1)}%`),
          React.createElement('div', { key: 'payback' }, `回本周期: ${payback === Infinity ? '无法回本' : (payback || 0).toFixed(1)} 年`)
        ]);
      }
      // Use KPI components with Term for titles
      const titleNode = (termKey, text) => Term ? React.createElement(Term, { termKey }, text) : text;
      return React.createElement('div', { className: 'space-y-3' }, [
        React.createElement(KPI, {
          key: 'profit',
          title: titleNode('profit', '净利润'),
          value: profit ? (profit/10000).toFixed(2) : 0,
          format: 'currency',
          color: profit >= 0 ? 'success' : 'danger',
          size: 'small'
        }),
        React.createElement(KPI, {
          key: 'margin',
          title: titleNode('netMargin', '净利润率'),
          value: margin ? margin.toFixed(1) : 0,
          format: 'percent',
          color: margin >= 0 ? 'success' : 'danger',
          size: 'small'
        }),
        React.createElement(KPI, {
          key: 'payback',
          title: titleNode('payback', '回本周期'),
          value: payback === Infinity ? '无法回本' : (payback || 0).toFixed(1),
          color: payback === Infinity || (profit && profit <= 0) ? 'danger' : 'warning',
          size: 'small'
        })
      ]);
    })();

    // Process section: describe sensitivity method
    const process = React.createElement('div', { className: 'space-y-2 text-sm' }, [
      React.createElement('div', { key: 'desc' }, '敏感度分析通过单一参数变动评估经营稳定性：'),
      React.createElement('div', { key: 'method' }, `固定其他变量，改变「${selectedParam}」从 -${paramRange}% 到 +${paramRange}%`),
      React.createElement('div', { key: 'action' }, '重算目标指标，观察其变化幅度与方向。'),
      React.createElement('div', { key: 'purpose' }, '结果用于识别关键经营杠杆与风险点。')
    ]);

    const left = React.createElement('div', { className: 'space-y-8 rilo-zh-page' }, [
      React.createElement(PageHeader, {
        key: 'header',
        onOpenGlossaryFallback: () => setShowDrawer(true)
      }),
      React.createElement(ControlPanel, {
        key: 'control-panel',
        selectedParam,
        paramRange,
        impactMetric,
        onParamChange: setSelectedParam,
        onRangeChange: setParamRange,
        onMetricChange: setImpactMetric,
        data
      }),
      React.createElement(SensitivityChart, {
        key: 'sensitivity-chart',
        data,
        calculations,
        selectedParam,
        paramRange,
        impactMetric,
        currency
      }),
      React.createElement(ScenarioTable, {
        key: 'scenario-table',
        data,
        calculations,
        selectedParam,
        paramRange,
        currency
      })
    ]);

    const mainContent = window.RiloUI?.TwoPaneLayout
      ? React.createElement(window.RiloUI.TwoPaneLayout, {
          leftTitle: null,
          left,
          inspectorTitle: '敏感度分析 Inspector',
          conclusion,
          process,
          glossaryTerms
        })
      : left;

    return React.createElement(React.Fragment, null, [
      mainContent,
      !window.RiloUI?.TwoPaneLayout && window.RiloUI?.DefinitionsDrawer ? React.createElement(window.RiloUI.DefinitionsDrawer, {
        key: 'analysis-drawer',
        isOpen: showDrawer,
        onClose: () => setShowDrawer(false),
        glossaryTerms: Object.assign({}, window.RiloUI.termRegistry || {}, glossaryTerms)
      }) : null
    ]);
  };

  // 页面标题组件（简化版，移除 inspector API 调用）
  const PageHeader = ({ onOpenGlossaryFallback }) => {
    const Button = window.UIComponents?.Button || 'button';
    const buttonProps = Button === 'button'
      ? {
          className: 'rounded-full border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] px-4 py-2 text-sm font-medium text-[var(--rilo-text-1)] hover:border-[var(--rilo-accent)] hover:text-[var(--rilo-accent)] whitespace-nowrap'
        }
      : {
          variant: 'outline',
          size: 'small',
          className: 'whitespace-nowrap'
        };

    // Prefer Inspector glossary, fallback to drawer
    const useInspector = window.RiloUI?.useInspector;
    const inspector = useInspector ? useInspector() : null;
    const openGlossary = () => {
      if (inspector?.setActiveSection && inspector?.setSelectedTerm) {
        inspector.setActiveSection('glossary');
        inspector.setSelectedTerm(null);
      } else if (onOpenGlossaryFallback) {
        onOpenGlossaryFallback();
      }
    };

    return React.createElement('div', {
      className: 'space-y-4 mb-8'
    }, [
      React.createElement('div', {
        key: 'header-main',
        className: 'flex flex-col gap-4 md:flex-row md:items-start md:justify-between'
      }, [
        React.createElement('div', {
          key: 'copy',
          className: 'text-center md:text-left'
        }, [
          React.createElement('h1', {
            key: 'title',
            className: 'text-3xl font-bold text-[var(--rilo-text-1)] mb-3'
          }, '📊 敏感度分析'),
          React.createElement('p', {
            key: 'subtitle',
            className: 'text-lg text-[var(--rilo-text-2)] max-w-2xl'
          }, '全局敏感度分析：在全局口径下观察单参数变化对回本/利润率/毛利率的影响')
        ]),
        React.createElement('div', {
          key: 'actions',
          className: 'flex justify-center md:justify-end'
        }, [
          onOpenGlossaryFallback && React.createElement(Button, {
            key: 'glossary-btn',
            onClick: openGlossary,
            ...buttonProps
          }, '📖 术语解释')
        ])
      ])
    ]);
  };

  // ControlPanel 组件（保持原样）
  const ControlPanel = ({ selectedParam, paramRange, impactMetric, onParamChange, onRangeChange, onMetricChange, data }) => {
    const paramOptions = [
      { value: 'fitoutStandard', label: '装修标准' },
      { value: 'occ', label: '入住率' },
      { value: 'adr', label: '平均房价' },
      { value: 'memberRatio', label: '会员占比' }
    ];

    const metricOptions = [
      { value: 'paybackYears', label: '回本周期' },
      { value: 'netMargin', label: '净利润率' },
      { value: 'grossMargin', label: '综合毛利率' }
    ];

    return React.createElement('div', { className: 'bg-[var(--rilo-surface-1)] border border-[var(--rilo-border-deep)] rounded-2xl p-6 mb-8 rilo-zh-page' }, [
      React.createElement('h3', { key: 'title', className: 'text-lg font-semibold text-[var(--rilo-text-1)] mb-4' }, '控制面板'),
      React.createElement('div', { key: 'controls', className: 'grid grid-cols-1 md:grid-cols-3 gap-6' }, [
        React.createElement('div', { key: 'param-select' }, [
          React.createElement('label', { key: 'label', className: 'block text-sm font-medium text-[var(--rilo-text-2)] mb-2' }, '选择参数'),
          React.createElement('select', {
            key: 'select',
            value: selectedParam,
            onChange: (e) => onParamChange(e.target.value),
            className: 'w-full px-3 py-2 border border-[var(--rilo-border-deep)] rounded-lg bg-[var(--rilo-surface-2)] text-[var(--rilo-text-1)] focus:outline-none focus:ring-2 focus:ring-[var(--rilo-accent)]'
          }, paramOptions.map(opt => React.createElement('option', { key: opt.value, value: opt.value }, opt.label)))
        ]),
        React.createElement('div', { key: 'range-slider' }, [
          React.createElement('label', { key: 'label', className: 'block text-sm font-medium text-[var(--rilo-text-2)] mb-2' }, `变化范围: ±${paramRange}%`),
          React.createElement('input', {
            key: 'slider',
            type: 'range',
            min: '5',
            max: '50',
            value: paramRange,
            onChange: (e) => onRangeChange(Number(e.target.value)),
            className: 'w-full accent-[var(--rilo-accent)]'
          })
        ]),
        React.createElement('div', { key: 'metric-select' }, [
          React.createElement('label', { key: 'label', className: 'block text-sm font-medium text-[var(--rilo-text-2)] mb-2' }, '影响指标'),
          React.createElement('select', {
            key: 'select',
            value: impactMetric,
            onChange: (e) => onMetricChange(e.target.value),
            className: 'w-full px-3 py-2 border border-[var(--rilo-border-deep)] rounded-lg bg-[var(--rilo-surface-2)] text-[var(--rilo-text-1)] focus:outline-none focus:ring-2 focus:ring-[var(--rilo-accent)]'
          }, metricOptions.map(opt => React.createElement('option', { key: opt.value, value: opt.value }, opt.label)))
        ])
      ])
    ]);
  };

  // SensitivityChart 组件（简化版图表）
  const SensitivityChart = ({ data, calculations, selectedParam, paramRange, impactMetric, currency }) => {
    if (!calculations) return null;

    // 这里应该实现真实的敏感度计算，暂时用静态数据演示
    return React.createElement('div', { className: 'bg-[var(--rilo-surface-1)] border border-[var(--rilo-border-deep)] rounded-2xl p-6 mb-8 rilo-zh-page' }, [
      React.createElement('h3', { key: 'title', className: 'text-lg font-semibold text-[var(--rilo-text-1)] mb-4' }, '敏感度图表'),
      React.createElement('div', { key: 'chart-placeholder', className: 'h-64 flex items-center justify-center border border-dashed border-[var(--rilo-border-deep)] rounded-xl' }, [
        React.createElement('p', { key: 'text', className: 'text-[var(--rilo-text-2)]' }, `参数: ${selectedParam} | 范围: ±${paramRange}% | 指标: ${impactMetric}`)
      ])
    ]);
  };

  // ScenarioTable 组件（情景对比表）
  const ScenarioTable = ({ data, calculations, selectedParam, paramRange, currency }) => {
    if (!calculations) return null;
    const Term = window.RiloUI?.Term;
    const titleNode = (termKey, text) => Term ? React.createElement(Term, { termKey }, text) : text;

    const scenarios = [
      { name: '保守', change: -paramRange, profit: calculations.profitability.profit * 0.75, margin: calculations.profitability.margin * 0.85, payback: (calculations.investment.total / (calculations.profitability.profit * 0.75)) || Infinity },
      { name: '当前', change: 0, profit: calculations.profitability.profit, margin: calculations.profitability.margin, payback: calculations.profitability.paybackYears },
      { name: '优化', change: paramRange, profit: calculations.profitability.profit * 1.25, margin: calculations.profitability.margin * 1.15, payback: (calculations.investment.total / (calculations.profitability.profit * 1.25)) || Infinity }
    ];

    return React.createElement('div', { className: 'bg-[var(--rilo-surface-1)] border border-[var(--rilo-border-deep)] rounded-2xl p-6 rilo-zh-page' }, [
      React.createElement('h3', { key: 'title', className: 'text-lg font-semibold text-[var(--rilo-text-1)] mb-4' }, '情景对比'),
      React.createElement('div', { key: 'table-container', className: 'overflow-x-auto' }, [
        React.createElement('table', { key: 'table', className: 'w-full text-sm rilo-zh-page' }, [
          React.createElement('thead', { key: 'thead' }, [
            React.createElement('tr', { key: 'row' }, [
              React.createElement('th', { key: 'scenario', className: 'text-left pb-3 border-b border-[var(--rilo-border-deep)] text-[var(--rilo-text-2)]' }, '情景'),
              React.createElement('th', { key: 'profit', className: 'text-right pb-3 border-b border-[var(--rilo-border-deep)] text-[var(--rilo-text-2)]' }, titleNode('profit', '年净利润')),
              React.createElement('th', { key: 'margin', className: 'text-right pb-3 border-b border-[var(--rilo-border-deep)] text-[var(--rilo-text-2)]' }, titleNode('netMargin', '净利润率')),
              React.createElement('th', { key: 'payback', className: 'text-right pb-3 border-b border-[var(--rilo-border-deep)] text-[var(--rilo-text-2)]' }, titleNode('payback', '回本周期'))
            ])
          ]),
          React.createElement('tbody', { key: 'tbody' }, scenarios.map((s, idx) => 
            React.createElement('tr', { 
              key: s.name,
              className: idx === 1 ? 'bg-[rgba(37,99,235,0.08)]' : ''
            }, [
              React.createElement('td', { key: 'name', className: 'py-3 text-[var(--rilo-text-1)]' }, s.name),
              React.createElement('td', { key: 'profit', className: 'text-right text-[var(--rilo-text-1)]' }, `${currency}${(s.profit/10000).toFixed(1)}万`),
              React.createElement('td', { key: 'margin', className: 'text-right text-[var(--rilo-text-1)]' }, `${s.margin.toFixed(1)}%`),
              React.createElement('td', { key: 'payback', className: 'text-right text-[var(--rilo-text-1)]' }, s.payback === Infinity ? '无法回本' : `${s.payback.toFixed(1)}年`)
            ])
          ))
        ])
      ])
    ]);
  };

  // 导出
  window.AnalysisPage = AnalysisPage;
  return AnalysisPage;
})();
