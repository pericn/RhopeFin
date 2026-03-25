// 敏感度分析页面 v2.0 - 聚焦真实经营杠杆与结果映射
window.AnalysisPage = (function() {
  const getCustomRevenueName = (data) => {
    if (data && data.revenue?.custom && data.revenue.custom.length > 0) {
      const groomingItem = data.revenue.custom.find(item => item.name && item.name.includes('洗护'));
      if (groomingItem) return groomingItem.name;
      return data.revenue.custom[0]?.name || '自定义收入';
    }
    return '自定义收入';
  };

  const getParamLabel = (selectedParam, data) => {
    switch (selectedParam) {
      case 'fitoutStandard': return '装修标准';
      case 'occ': return '入住率';
      case 'adr': return '平均房价';
      case 'memberRatio': return '会员占比';
      case 'customRevenue': return getCustomRevenueName(data);
      default: return selectedParam;
    }
  };

  const getMetricLabel = (impactMetric) => {
    if (impactMetric === 'paybackYears') return '回本周期';
    if (impactMetric === 'netMargin') return '净利润率';
    if (impactMetric === 'grossMargin') return '综合毛利率';
    return impactMetric;
  };

  const formatMetricValue = (metricKey, value, currency = '¥') => {
    const numericValue = Number(value);

    if (metricKey === 'paybackYears') {
      return value === Infinity || !Number.isFinite(numericValue) ? '无法回本' : `${numericValue.toFixed(1)}年`;
    }
    if (metricKey === 'netMargin' || metricKey === 'grossMargin') {
      return `${(Number.isFinite(numericValue) ? numericValue : 0).toFixed(1)}%`;
    }
    if (metricKey === 'profit') {
      return `${currency}${((Number.isFinite(numericValue) ? numericValue : 0) / 10000).toFixed(1)}万`;
    }
    return `${(Number.isFinite(numericValue) ? numericValue : 0).toFixed(1)}`;
  };

  const getImpactValue = (scenario, impactMetric) => {
    if (impactMetric === 'paybackYears') return scenario.payback;
    if (impactMetric === 'grossMargin') return scenario.grossMargin;
    return scenario.margin;
  };

  const getImpactDelta = (baseValue, compareValue, impactMetric) => {
    if (baseValue === Infinity && compareValue === Infinity) return null;
    if (baseValue === Infinity) return Number.NEGATIVE_INFINITY;
    if (compareValue === Infinity) return Number.POSITIVE_INFINITY;
    if (impactMetric === 'paybackYears') return compareValue - baseValue;
    return compareValue - baseValue;
  };

  const formatDeltaLabel = (impactMetric, delta) => {
    if (!Number.isFinite(delta)) return null;
    if (impactMetric === 'paybackYears') {
      return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}年`;
    }
    if (impactMetric === 'netMargin' || impactMetric === 'grossMargin') {
      return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}pt`;
    }
    return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}`;
  };

  const getNarrative = (selectedParam, downside, upside, impactMetric) => {
    const dominatesDownside = Math.abs(downside) >= Math.abs(upside);
    const lead = dominatesDownside ? '下行风险更陡' : '上行弹性更明显';

    const paramTextMap = {
      fitoutStandard: '装修标准直接推高前期投入，通常先影响回本节奏，再决定项目容错空间。',
      occ: '入住率更接近日常运营杠杆，轻微波动就会连续传导到收入和利润。',
      adr: '平均房价是提效杠杆，但前提是交付能力与客单接受度能一起跟上。',
      memberRatio: '会员占比影响收入结构稳定性，适合和复购/套餐策略一起看。',
      customRevenue: '自定义收入更像增量抓手，适合验证新服务是否真能补利润。'
    };

    const metricHint = impactMetric === 'paybackYears'
      ? '优先看回本是否被明显拉长。'
      : `优先看${getMetricLabel(impactMetric)}是否在负向扰动里快速塌陷。`;

    return `${lead}。${paramTextMap[selectedParam] || '这个参数值得做单独复核。'}${metricHint}`;
  };

  const ExplanationCard = ({ label, title, copy }) => React.createElement('div', {
    className: 'rilo-explainer-card'
  }, [
    React.createElement('div', { key: 'label', className: 'rilo-explainer-label' }, label),
    React.createElement('div', { key: 'title', className: 'rilo-explainer-title' }, title),
    React.createElement('div', { key: 'copy', className: 'rilo-explainer-copy' }, copy)
  ]);

  const createFallbackScenario = (name, change = 0) => ({
    name,
    change,
    profit: 0,
    margin: 0,
    grossMargin: 0,
    payback: Infinity
  });

  const toSafeMetricNumber = (value, fallback = 0) => {
    if (value === Infinity) return Infinity;
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : fallback;
  };

  const normalizeScenarioMetrics = (scenario, fallbackMetrics = {}) => ({
    name: scenario?.name || '基准',
    change: toSafeMetricNumber(scenario?.change, 0),
    // BUGFIX-1: 标准化敏感度图表输入，避免字符串/undefined 指标把条状图宽度算成 NaN 后直接不渲染。
    profit: toSafeMetricNumber(scenario?.profit, fallbackMetrics.profit ?? 0),
    margin: toSafeMetricNumber(scenario?.margin, fallbackMetrics.margin ?? 0),
    grossMargin: toSafeMetricNumber(scenario?.grossMargin, fallbackMetrics.grossMargin ?? 0),
    payback: scenario?.payback === Infinity ? Infinity : toSafeMetricNumber(scenario?.payback, fallbackMetrics.payback ?? Infinity)
  });

  const hasRenderableScenarioData = (scenarios = []) => scenarios.some((item) =>
    Math.abs(Number(item?.profit || 0)) > 0 ||
    Math.abs(Number(item?.margin || 0)) > 0 ||
    Math.abs(Number(item?.grossMargin || 0)) > 0 ||
    Number.isFinite(item?.payback)
  );

  const buildSensitivityScenarios = ({ data, calculations, formulaEngine, selectedParam, paramRange }) => {
    const variations = [-paramRange, 0, paramRange];
    const labels = ['下调', '基准', '上调'];
    const baseline = {
      profit: calculations?.profitability?.profit ?? 0,
      margin: calculations?.profitability?.margin ?? 0,
      grossMargin: calculations?.profitability?.grossMargin ?? 0,
      payback: calculations?.profitability?.paybackYears ?? Infinity
    };

    const adjustParam = (baseData, pctChange) => {
      const adjusted = JSON.parse(JSON.stringify(baseData || {}));
      const factor = 1 + pctChange / 100;

      switch (selectedParam) {
        case 'fitoutStandard':
          adjusted.investment = adjusted.investment || {};
          adjusted.investment.fitoutStandard = (adjusted.investment.fitoutStandard || 0) * factor;
          break;
        case 'occ':
          adjusted.revenue = adjusted.revenue || {};
          adjusted.revenue.boarding = adjusted.revenue.boarding || {};
          adjusted.revenue.boarding.occ = Math.min(100, Math.max(0, (adjusted.revenue.boarding.occ || 0) * factor));
          break;
        case 'adr':
          adjusted.revenue = adjusted.revenue || {};
          adjusted.revenue.boarding = adjusted.revenue.boarding || {};
          adjusted.revenue.boarding.adr = (adjusted.revenue.boarding.adr || 0) * factor;
          break;
        case 'memberRatio': {
          adjusted.revenue = adjusted.revenue || {};
          adjusted.revenue.member = adjusted.revenue.member || {};
          const base = adjusted.revenue.member.basePct || 0;
          const pro = adjusted.revenue.member.proPct || 0;
          const vip = adjusted.revenue.member.vipPct || 0;
          if (base + pro + vip > 0) {
            const newBase = Math.max(0, base * factor);
            const sum = newBase + pro + vip;
            if (sum > 0) {
              adjusted.revenue.member.basePct = (newBase / sum) * 100;
              adjusted.revenue.member.proPct = (pro / sum) * 100;
              adjusted.revenue.member.vipPct = (vip / sum) * 100;
            }
          }
          break;
        }
        default:
          break;
      }

      return adjusted;
    };

    const recalc = (inputData) => {
      if (window.MainCalculator && formulaEngine && inputData) {
        try {
          const calculator = new window.MainCalculator(formulaEngine);
          const result = calculator.calculate(inputData);
          return {
            profit: result?.profitability?.profit ?? baseline.profit,
            margin: result?.profitability?.margin ?? baseline.margin,
            grossMargin: result?.profitability?.grossMargin ?? baseline.grossMargin,
            payback: result?.profitability?.paybackYears ?? baseline.payback
          };
        } catch (error) {
          console.warn('Sensitivity recalc failed, falling back to baseline', error);
        }
      }

      return baseline;
    };

    try {
      return variations.map((pctChange, index) => {
        const metrics = recalc(adjustParam(data, pctChange));
        return normalizeScenarioMetrics({
          name: labels[index],
          change: pctChange,
          profit: metrics?.profit,
          margin: metrics?.margin,
          grossMargin: metrics?.grossMargin,
          payback: metrics?.payback
        }, baseline);
      });
    } catch (error) {
      console.error('Sensitivity scenario build failed:', error);
      return [
        createFallbackScenario(labels[0], variations[0]),
        { ...createFallbackScenario(labels[1], variations[1]), ...baseline },
        createFallbackScenario(labels[2], variations[2])
      ];
    }
  };

  const AnalysisPage = ({ data, calculations, formulaEngine, currency = '¥' }) => {
    const Term = window.RiloUI?.Term;
    const [selectedParam, setSelectedParam] = React.useState('fitoutStandard');
    const [paramRange, setParamRange] = React.useState(20);
    const [impactMetric, setImpactMetric] = React.useState('paybackYears');
    const profitability = calculations?.profitability || {};
    const hasFiniteMetricValue = (value) => Number.isFinite(Number(value));
    const hasCalculationData = Boolean(
      calculations && (
        hasFiniteMetricValue(profitability?.profit) ||
        hasFiniteMetricValue(profitability?.margin) ||
        hasFiniteMetricValue(profitability?.grossMargin) ||
        hasFiniteMetricValue(profitability?.paybackYears)
      )
    );

    const glossaryTerms = {
      margin: { title: '利润率/毛利率', body: '利润率看整体经营效率；毛利率看“卖出去的东西”本身赚不赚钱。' },
      sensitivity: { title: '敏感度分析', body: '保持其他假设不变，只扰动单一参数，判断结果会被拉动多大。' }
    };

    const scenarios = React.useMemo(() => {
      const nextScenarios = buildSensitivityScenarios({
        data,
        calculations,
        formulaEngine,
        selectedParam,
        paramRange
      });

      return Array.isArray(nextScenarios) && nextScenarios.length === 3
        ? nextScenarios
        : [
            createFallbackScenario('下调', -paramRange),
            createFallbackScenario('基准', 0),
            createFallbackScenario('上调', paramRange)
          ];
    }, [data, calculations, formulaEngine, selectedParam, paramRange]);

    const process = React.createElement('div', { className: 'space-y-3 text-sm text-[var(--rilo-text-2)] rilo-zh-page' }, [
      React.createElement('div', { key: 'summary', className: 'rounded-2xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] p-4' }, [
        React.createElement('div', { key: 't', className: 'text-sm font-semibold text-[var(--rilo-text-1)]' }, '当前口径'),
        React.createElement('div', { key: 'b', className: 'mt-2 space-y-1 text-sm text-[var(--rilo-text-2)]' }, [
          React.createElement('div', { key: 'p' }, `参数：${getParamLabel(selectedParam, data)}`),
          React.createElement('div', { key: 'r' }, `范围：±${paramRange}%`),
          React.createElement('div', { key: 'm' }, `指标：${getMetricLabel(impactMetric)}`)
        ])
      ]),
      !hasCalculationData && React.createElement('div', {
        key: 'empty-note',
        className: 'rounded-2xl border border-dashed border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] p-4 text-[var(--rilo-text-3)]'
      }, '缺少完整计算结果时，页面会先显示安全占位值，避免敏感度分析直接报错。')
    ]);

    const left = React.createElement('div', { className: 'space-y-6 rilo-zh-page' }, [
      React.createElement(PageHeader, {
        key: 'header',
        data,
        selectedParam,
        paramRange,
        impactMetric,
        calculations,
        currency,
        scenarios
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
      React.createElement(SensitivitySnapshot, {
        key: 'snapshot',
        data,
        selectedParam,
        impactMetric,
        currency,
        scenarios
      }),
      React.createElement(SensitivityChart, {
        key: 'chart',
        data,
        selectedParam,
        paramRange,
        impactMetric,
        currency,
        scenarios
      }),
      React.createElement(ScenarioTable, {
        key: 'table',
        data,
        selectedParam,
        impactMetric,
        currency,
        scenarios
      })
    ]);

    const mainContent = window.RiloUI?.TwoPaneLayout
      ? React.createElement(window.RiloUI.TwoPaneLayout, {
          leftTitle: null,
          left,
          inspectorTitle: '计算面板',
          conclusion: null,
          process,
          glossaryTerms
        })
      : left;

    return React.createElement(React.Fragment, null, [mainContent]);
  };

  const EmptyPanel = ({ title, copy }) => React.createElement('div', {
    className: 'rounded-[var(--radius-lg)] border border-dashed border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] p-5 text-sm leading-7 text-[var(--rilo-text-2)]'
  }, [
    React.createElement('div', { key: 'title', className: 'font-semibold text-[var(--rilo-text-1)]' }, title),
    React.createElement('div', { key: 'copy', className: 'mt-2' }, copy)
  ]);

  const PageHeader = ({ data, selectedParam, paramRange, impactMetric, calculations, currency, scenarios }) => {
    const profit = calculations?.profitability?.profit || 0;
    const Term = window.RiloUI?.Term;
    const titleNode = (termKey, text) => Term ? React.createElement(Term, { termKey }, text) : text;
    const margin = calculations?.profitability?.margin || 0;
    const payback = calculations?.profitability?.paybackYears;

    return React.createElement('div', {
      className: 'rilo-ledger-panel rilo-card-hierarchy-high rounded-[var(--radius-lg)] border border-[rgba(34,31,26,0.10)] px-5 py-5 md:px-6 md:py-6 shadow-[var(--rilo-shadow-card)] rilo-zh-page'
    }, [
      React.createElement('div', { key: 'header-main', className: 'rilo-ledger-header' }, [
        React.createElement('div', {
          key: 'top-row',
          className: 'flex flex-col gap-3'
        }, [
            React.createElement('div', { key: 'copy', className: 'rilo-ledger-header-copy text-left' }, [
            React.createElement('div', { key: 'eyebrow', className: 'rilo-ledger-eyebrow' }, '单参复核'),
            React.createElement('h1', { key: 'title', className: 'rilo-ledger-title' }, '敏感度分析'),
            React.createElement('p', {
              key: 'hint',
              className: 'rilo-ledger-subtitle rilo-zh-subtle'
            }, '固定其他条件，展示单一参数扰动后的三档重算结果。')
          ])
        ]),
        React.createElement('div', { key: 'summary-strip', className: 'rilo-ledger-metrics' }, [
          React.createElement('div', { key: 's1', className: 'rilo-ledger-metric' }, [
            React.createElement('div', { key: 'l', className: 'rilo-ledger-metric-label' }, titleNode('profit', '年净利润')),
            React.createElement('div', { key: 'v', className: 'rilo-ledger-metric-value' }, formatMetricValue('profit', profit, currency)),
            React.createElement('div', { key: 'n', className: 'rilo-ledger-metric-note' }, '当前口径')
          ]),
          React.createElement('div', { key: 's2', className: 'rilo-ledger-metric' }, [
            React.createElement('div', { key: 'l', className: 'rilo-ledger-metric-label' }, titleNode('netMargin', '净利润率')),
            React.createElement('div', { key: 'v', className: 'rilo-ledger-metric-value' }, formatMetricValue('netMargin', margin, currency)),
            React.createElement('div', { key: 'n', className: 'rilo-ledger-metric-note' }, '全年营收与成本')
          ]),
          React.createElement('div', { key: 's3', className: 'rilo-ledger-metric' }, [
            React.createElement('div', { key: 'l', className: 'rilo-ledger-metric-label' }, titleNode('payback', '回本周期')),
            React.createElement('div', { key: 'v', className: 'rilo-ledger-metric-value' }, Number.isFinite(payback) ? `${payback.toFixed(1)}年` : '暂时无法回本'),
            React.createElement('div', { key: 'n', className: 'rilo-ledger-metric-note' }, '当前口径')
          ])
        ]),
        React.createElement('div', { key: 'band', className: 'rilo-ledger-band' }, [
          React.createElement('span', { key: 'b1', className: 'rilo-ledger-pill' }, [React.createElement('strong', { key: 'k1' }, '参数'), ` ${getParamLabel(selectedParam, data)}`]),
          React.createElement('span', { key: 'b2', className: 'rilo-ledger-pill' }, [React.createElement('strong', { key: 'k2' }, '指标'), ` ${getMetricLabel(impactMetric)}`])
        ])
      ])
    ]);
  };

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

    return React.createElement('div', { className: 'rilo-ledger-panel rilo-card-hierarchy-high border border-[rgba(34,31,26,0.10)] rounded-[var(--radius-lg)] p-6 shadow-[var(--rilo-shadow-card)] rilo-zh-page' }, [
      React.createElement('div', { key: 'heading', className: 'mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between border-b border-[var(--line)] pb-4' }, [
        React.createElement('div', { key: 'copy' }, [
          React.createElement('h3', { key: 'title', className: 'mt-2 text-lg font-semibold text-[var(--rilo-text-1)]' }, '控制面板')
        ]),
        React.createElement('p', { key: 'hint', className: 'max-w-xl text-sm text-[var(--rilo-text-2)]' }, '选择参数与观察指标。')
      ]),
      React.createElement('div', { key: 'controls', className: 'grid grid-cols-1 gap-6 md:grid-cols-3' }, [
        React.createElement('div', { key: 'param-select', className: 'rilo-control-field' }, [
          React.createElement('label', { key: 'label', className: 'mb-2 block text-sm font-medium text-[var(--rilo-text-2)]' }, '选择参数'),
          React.createElement('select', {
            key: 'select',
            value: selectedParam,
            onChange: (e) => onParamChange(e.target.value),
            className: 'w-full rounded-xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-card)] px-3 py-2.5 text-[var(--rilo-text-1)] shadow-[var(--rilo-shadow-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--rilo-accent)]/15'
          }, paramOptions.map(opt => React.createElement('option', { key: opt.value, value: opt.value }, opt.label)))
        ]),
        React.createElement('div', { key: 'range-slider', className: 'rilo-control-field' }, [
          React.createElement('label', { key: 'label', className: 'mb-2 block text-sm font-medium text-[var(--rilo-text-2)]' }, `变化范围：±${paramRange}%`),
          React.createElement('input', {
            key: 'slider',
            type: 'range',
            min: '5',
            max: '50',
            value: paramRange,
            onChange: (e) => onRangeChange(Number(e.target.value)),
            className: 'w-full accent-[var(--rilo-accent)]'
          }),
        ]),
        React.createElement('div', { key: 'metric-select', className: 'rilo-control-field' }, [
          React.createElement('label', { key: 'label', className: 'mb-2 block text-sm font-medium text-[var(--rilo-text-2)]' }, '影响指标'),
          React.createElement('select', {
            key: 'select',
            value: impactMetric,
            onChange: (e) => onMetricChange(e.target.value),
            className: 'w-full rounded-xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-card)] px-3 py-2.5 text-[var(--rilo-text-1)] shadow-[var(--rilo-shadow-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--rilo-accent)]/15'
          }, metricOptions.map(opt => React.createElement('option', { key: opt.value, value: opt.value }, opt.label)))
        ])
      ])
    ]);
  };

  const SensitivitySnapshot = ({ data, selectedParam, impactMetric, currency, scenarios }) => {
    const hasScenarioData = hasRenderableScenarioData(scenarios);

    if (!hasScenarioData) {
      return React.createElement(EmptyPanel, {
        title: '结果快照待生成',
        copy: '补齐经营设置后，这里会展示下调、基准、上调三档结果。'
      });
    }

    const currentValue = getImpactValue(scenarios[1], impactMetric);
    const downsideValue = getImpactValue(scenarios[0], impactMetric);
    const upsideValue = getImpactValue(scenarios[2], impactMetric);
    const downsideDelta = getImpactDelta(currentValue, downsideValue, impactMetric);
    const upsideDelta = getImpactDelta(currentValue, upsideValue, impactMetric);

    const cardTone = (delta, metricKey) => {
      if (metricKey === 'paybackYears') return delta > 0 ? 'danger' : 'success';
      return delta >= 0 ? 'success' : 'danger';
    };

    const insightCards = [
      {
        key: 'downside',
        title: '下调档',
        value: formatMetricValue(impactMetric, downsideValue, currency),
        note: `${getParamLabel(selectedParam, data)} -${Math.abs(scenarios[0].change)}%`,
        color: cardTone(downsideDelta, impactMetric),
        change: downsideDelta,
        changeLabel: formatDeltaLabel(impactMetric, downsideDelta)
      },
      {
        key: 'base',
        title: '当前档',
        value: formatMetricValue(impactMetric, currentValue, currency),
        note: '当前经营假设',
        color: 'info'
      },
      {
        key: 'upside',
        title: '上调档',
        value: formatMetricValue(impactMetric, upsideValue, currency),
        note: `${getParamLabel(selectedParam, data)} +${scenarios[2].change}%`,
        color: cardTone(upsideDelta, impactMetric),
        change: upsideDelta,
        changeLabel: formatDeltaLabel(impactMetric, upsideDelta)
      }
    ];

    const KPI = window.UIComponents?.KPI;

    return React.createElement('div', { className: 'rilo-ledger-panel border border-[rgba(34,31,26,0.10)] rounded-[var(--radius-lg)] p-6 shadow-[var(--rilo-shadow-card)] rilo-zh-page' }, [
      React.createElement('div', { key: 'heading', className: 'mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between border-b border-[var(--line)] pb-4' }, [
        React.createElement('div', { key: 'copy' }, [
          React.createElement('h3', { key: 'title', className: 'mt-2 text-lg font-semibold text-[var(--rilo-text-1)]' }, '三档结果快照')
        ]),
        React.createElement('div', { key: 'note', className: 'max-w-xl text-sm text-[var(--rilo-text-2)]' }, `${getParamLabel(selectedParam, data)} 在 ±${Math.abs(scenarios[2].change)}% 扰动下的结果对比。`)
      ]),
      React.createElement('div', { key: 'grid', className: 'grid grid-cols-1 gap-3 md:grid-cols-3' },
        insightCards.map(card => {
          if (KPI) {
            return React.createElement(KPI, {
              key: card.key,
              title: card.title,
              value: card.value,
              color: card.color,
              change: Number.isFinite(card.change) ? card.change : null,
              changeLabel: card.changeLabel
            });
          }

          return React.createElement('div', {
            key: card.key,
            className: 'rounded-[var(--radius-md)] border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-card)] p-4 shadow-[var(--rilo-shadow-soft)]'
          }, [
            React.createElement('div', { key: 't', className: 'text-[11px] uppercase tracking-[0.18em] text-[var(--rilo-text-3)]' }, card.title),
            React.createElement('div', { key: 'v', className: 'mt-3 text-xl font-semibold text-[var(--rilo-text-1)]' }, card.value),
            React.createElement('div', { key: 'n', className: 'mt-2 text-sm text-[var(--rilo-text-2)]' }, card.note)
          ]);
        })
      )
    ]);
  };

  const SensitivityChart = ({ data, selectedParam, paramRange, impactMetric, currency, scenarios }) => {
    const hasScenarioData = hasRenderableScenarioData(scenarios);

    if (!hasScenarioData) {
      return React.createElement(EmptyPanel, {
        title: '敏感度图表待生成',
        copy: '当前没有足够的测算结果可画图，先到经营设置页补齐关键参数。'
      });
    }

    const paramLabel = getParamLabel(selectedParam, data);
    const metricLabel = getMetricLabel(impactMetric);
    const metricValues = scenarios.map(item => getImpactValue(item, impactMetric)).map((value) => {
      if (value === Infinity) return Infinity;
      return toSafeMetricNumber(value, 0);
    });

    const finiteValues = metricValues.filter(value => value !== Infinity && Number.isFinite(value));
    const maxAbs = finiteValues.length > 0 ? Math.max(...finiteValues.map(value => Math.abs(value))) : 1;
    const widthFor = (value) => {
      if (value === Infinity) return 92;
      return Math.max(24, Math.min(92, 26 + (Math.abs(value) / (maxAbs || 1)) * 66));
    };

    return React.createElement('div', { className: 'rilo-ledger-panel border border-[rgba(34,31,26,0.10)] rounded-[var(--radius-lg)] p-6 shadow-[var(--rilo-shadow-card)] rilo-zh-page' }, [
      React.createElement('div', { key: 'heading', className: 'mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between border-b border-[var(--line)] pb-4' }, [
        React.createElement('div', { key: 'copy' }, [
          React.createElement('h3', { key: 'title', className: 'mt-2 text-lg font-semibold text-[var(--rilo-text-1)]' }, '敏感度图表')
        ]),
        React.createElement('div', { key: 'note', className: 'text-sm text-[var(--rilo-text-2)]' }, `${paramLabel} · ${metricLabel}`)
      ]),
      React.createElement('div', { key: 'chart-shell', className: 'overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.50),rgba(245,236,224,0.82))]' }, [
        React.createElement('div', { key: 'meta', className: 'grid grid-cols-1 gap-3 border-b border-[var(--line)] p-4 md:grid-cols-3' }, [
          React.createElement('div', { key: 'm1', className: 'rounded-[var(--radius-md)] bg-[var(--rilo-surface-card)] px-4 py-3 shadow-[var(--rilo-shadow-soft)]' }, [
            React.createElement('div', { key: 'l', className: 'text-[11px] uppercase tracking-[0.18em] text-[var(--rilo-text-3)]' }, '观察参数'),
            React.createElement('div', { key: 'v', className: 'mt-1 font-semibold text-[var(--rilo-text-1)]' }, paramLabel)
          ]),
          React.createElement('div', { key: 'm2', className: 'rounded-[var(--radius-md)] bg-[var(--rilo-surface-card)] px-4 py-3 shadow-[var(--rilo-shadow-soft)]' }, [
            React.createElement('div', { key: 'l', className: 'text-[11px] uppercase tracking-[0.18em] text-[var(--rilo-text-3)]' }, '变化范围'),
            React.createElement('div', { key: 'v', className: 'mt-1 font-semibold text-[var(--rilo-text-1)]' }, `-${paramRange}% ~ +${paramRange}%`)
          ]),
          React.createElement('div', { key: 'm3', className: 'rounded-[var(--radius-md)] bg-[var(--rilo-surface-card)] px-4 py-3 shadow-[var(--rilo-shadow-soft)]' }, [
            React.createElement('div', { key: 'l', className: 'text-[11px] uppercase tracking-[0.18em] text-[var(--rilo-text-3)]' }, '影响指标'),
            React.createElement('div', { key: 'v', className: 'mt-1 font-semibold text-[var(--rilo-text-1)]' }, metricLabel)
          ])
        ]),
        React.createElement('div', { key: 'visual', className: 'grid gap-4 p-5 md:grid-cols-[1.2fr,0.8fr]' }, [
          React.createElement('div', { key: 'bars', className: 'space-y-4' }, scenarios.map((item, index) => {
            const metricValue = getImpactValue(item, impactMetric);
            const tone = index === 1
              ? 'bg-[#566379]'
              : index === 0
                ? 'bg-[#8d756f]'
                : 'bg-[#768b76]';
            return React.createElement('div', { key: item.name }, [
              React.createElement('div', { key: 'row-top', className: 'mb-1.5 flex items-center justify-between text-sm' }, [
                React.createElement('span', { key: 'label', className: 'text-[var(--rilo-text-1)]' }, `${item.name} · ${item.change > 0 ? `+${item.change}%` : `${item.change}%`}`),
                React.createElement('span', { key: 'axis', className: 'text-[var(--rilo-text-3)]' }, formatMetricValue(impactMetric, metricValue, currency))
              ]),
              React.createElement('div', { key: 'track', className: 'h-3 overflow-hidden rounded-full bg-[rgba(34,31,26,0.08)]' },
                React.createElement('div', { className: `h-full rounded-full ${tone}`, style: { width: `${widthFor(metricValue)}%` } })
              )
            ]);
          })),
          React.createElement('div', { key: 'reading', className: 'rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--rilo-surface-card)] p-4' }, [
            React.createElement('div', { key: 't', className: 'text-sm font-semibold text-[var(--rilo-text-1)] rilo-section-title' }, '图表说明'),
            React.createElement('ul', { key: 'list', className: 'mt-3 space-y-2 text-sm leading-6 text-[var(--rilo-text-2)]' }, [
              React.createElement('li', { key: 'i1' }, '条形长度对应三档真实重算结果。'),
              React.createElement('li', { key: 'i2' }, '下调档与基准档的差值用于查看负向扰动幅度。'),
              React.createElement('li', { key: 'i3' }, '上调档与基准档的差值用于查看正向扰动幅度。')
            ])
          ])
        ])
      ])
    ]);
  };

  const ScenarioTable = ({ data, selectedParam, impactMetric, currency, scenarios }) => {
    const hasScenarioData = hasRenderableScenarioData(scenarios);

    if (!hasScenarioData) {
      return React.createElement(EmptyPanel, {
        title: '情景对比待生成',
        copy: '没有有效结果时先显示占位说明，避免表格区域出现空白。'
      });
    }

    const Term = window.RiloUI?.Term;
    const titleNode = (termKey, text) => Term ? React.createElement(Term, { termKey }, text) : text;

    return React.createElement('div', { className: 'rilo-ledger-panel border border-[rgba(34,31,26,0.10)] rounded-[var(--radius-lg)] p-6 shadow-[var(--rilo-shadow-card)] rilo-zh-page' }, [
      React.createElement('div', { key: 'heading', className: 'mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between border-b border-[var(--line)] pb-4' }, [
        React.createElement('div', { key: 'copy' }, [
          React.createElement('h3', { key: 'title', className: 'mt-2 text-lg font-semibold text-[var(--rilo-text-1)] rilo-section-title' }, '情景对比')
        ]),
        React.createElement('div', { key: 'note', className: 'text-sm text-[var(--rilo-text-2)]' }, `${getParamLabel(selectedParam, data)} · 三档快速复核 · 当前焦点 ${getMetricLabel(impactMetric)}`)
      ]),
      React.createElement('div', { key: 'table-container', className: 'overflow-x-auto' }, [
        React.createElement('table', { key: 'table', className: 'w-full text-sm rilo-zh-page' }, [
          React.createElement('thead', { key: 'thead' }, [
            React.createElement('tr', { key: 'row' }, [
              React.createElement('th', { key: 'scenario', className: 'pb-3 text-left text-[var(--rilo-text-2)] border-b border-[var(--line)]' }, '情景'),
              React.createElement('th', { key: 'profit', className: 'pb-3 text-right text-[var(--rilo-text-2)] border-b border-[var(--line)]' }, titleNode('profit', '年净利润')),
              React.createElement('th', { key: 'margin', className: 'pb-3 text-right text-[var(--rilo-text-2)] border-b border-[var(--line)]' }, titleNode('netMargin', '净利润率')),
              React.createElement('th', { key: 'gross', className: 'pb-3 text-right text-[var(--rilo-text-2)] border-b border-[var(--line)]' }, titleNode('grossMargin', '综合毛利率')),
              React.createElement('th', { key: 'payback', className: 'pb-3 text-right text-[var(--rilo-text-2)] border-b border-[var(--line)]' }, titleNode('payback', '回本周期'))
            ])
          ]),
          React.createElement('tbody', { key: 'tbody' }, scenarios.map((item, index) =>
            React.createElement('tr', {
              key: item.name,
              className: index === 1 ? 'bg-[var(--rilo-accent-50)]' : 'border-b border-[rgba(34,31,26,0.06)] last:border-b-0'
            }, [
              React.createElement('td', { key: 'name', className: 'py-3 font-medium text-[var(--rilo-text-1)]' }, `${item.name} (${item.change > 0 ? `+${item.change}%` : `${item.change}%`})`),
              React.createElement('td', { key: 'profit', className: 'text-right text-[var(--rilo-text-1)]' }, formatMetricValue('profit', item.profit, currency)),
              React.createElement('td', { key: 'margin', className: 'text-right text-[var(--rilo-text-1)]' }, formatMetricValue('netMargin', item.margin, currency)),
              React.createElement('td', { key: 'gross', className: 'text-right text-[var(--rilo-text-1)]' }, formatMetricValue('grossMargin', item.grossMargin, currency)),
              React.createElement('td', { key: 'payback', className: 'text-right text-[var(--rilo-text-1)]' }, formatMetricValue('paybackYears', item.payback, currency))
            ])
          ))
        ])
      ])
    ]);
  };

  window.AnalysisPage = AnalysisPage;
  window.AnalysisPage.AnalysisPage = AnalysisPage;
  return AnalysisPage;
})();
