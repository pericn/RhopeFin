// Shared Card Components for Rilo Analysis
// These components are attached to window.RiloUI
(function() {
  'use strict';

  // Ensure RiloUI namespace exists (rilo-ui.js defines it, but be safe)
  window.RiloUI = window.RiloUI || {};

  // ChartCard: Simple container for a chart with title
  const ChartCard = ({ title, children }) =>
    React.createElement('div', { className: 'rilo-ledger-panel rilo-card-hierarchy-high rounded-2xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] p-6 shadow-[var(--rilo-shadow-card)]' }, [
      React.createElement('div', { key: 'header', className: 'mb-4 border-b border-[var(--line)] pb-4' }, [
        React.createElement('div', { key: 'eyebrow', className: 'text-[11px] uppercase tracking-[0.22em] text-[var(--rilo-text-3)]' }, 'Reading'),
        React.createElement('h3', { key: 'title', className: 'mt-2 text-lg font-semibold text-[var(--rilo-text-1)]' }, title)
      ]),
      children
    ]);
  window.RiloUI.ChartCard = ChartCard;

  // AlertCard: For displaying alerts (warnings, errors) with dynamic colors
  const AlertCard = ({ alert, colorClasses }) => {
    // Use semantic tokens if colorClasses not provided
    const defaultColors = {
      warning: 'bg-[var(--rilo-sem-warning)]/10 border-[var(--rilo-sem-warning)] text-[var(--rilo-sem-warning)]',
      error: 'bg-[var(--rilo-sem-danger)]/10 border-[var(--rilo-sem-danger)] text-[var(--rilo-sem-danger)]',
      info: 'bg-[var(--rilo-sem-info)]/10 border-[var(--rilo-sem-info)] text-[var(--rilo-sem-info)]'
    };
    const colors = colorClasses ? colorClasses[alert.type] : defaultColors[alert.type] || defaultColors.info;
    return React.createElement('div', { className: `rilo-card-hierarchy-mid border rounded-[var(--radius-md)] p-4 bg-[rgba(255,251,246,0.72)] ${colors}` }, [
      React.createElement('div', { key: 'header', className: 'flex items-center gap-2 mb-2' }, [
        React.createElement('h5', { key: 'title', className: 'font-medium' }, alert.title)
      ]),
      React.createElement('p', { key: 'message', className: 'text-sm' }, alert.message)
    ]);
  };
  window.RiloUI.AlertCard = AlertCard;

  // InsightCard: Flexible card for insights with type-based styling
  // Accepts both 'content' and 'message' fields for backward compatibility
  const InsightCard = ({ insight }) => {
    // Map 'success' to 'positive' for compatibility
    const typeMap = {
      positive: 'positive',
      success: 'positive',
      warning: 'warning',
      negative: 'negative',
      info: 'info'
    };
    const mappedType = typeMap[insight.type] || 'info';

    const colorClasses = {
      positive: 'bg-[var(--rilo-value-success-soft)] border-[var(--rilo-value-success-border)] text-[var(--rilo-value-success)]',
      warning: 'bg-[var(--rilo-value-warning-soft)] border-[var(--rilo-value-warning-border)] text-[var(--rilo-value-warning)]',
      negative: 'bg-[var(--rilo-value-danger-soft)] border-[var(--rilo-value-danger-border)] text-[var(--rilo-value-danger)]',
      info: 'bg-[var(--rilo-value-info-soft)] border-[var(--rilo-value-info-border)] text-[var(--rilo-value-info)]'
    };
    const cls = colorClasses[mappedType];

    return React.createElement('div', { className: `rilo-card-hierarchy-mid border rounded-[var(--radius-md)] p-4 bg-[rgba(255,251,246,0.72)] ${cls}` }, [
      React.createElement('div', { key: 'header', className: 'flex items-center gap-2 mb-2' }, [
        React.createElement('h5', { key: 'title', className: 'font-medium' }, insight.title)
      ]),
      React.createElement('p', { key: 'content', className: 'text-sm' }, insight.content ?? insight.message)
    ]);
  };
  window.RiloUI.InsightCard = InsightCard;

  // RecommendationCard: For displaying recommendations with priority styling
  const RecommendationCard = ({ recommendation }) => {
    const priorityColors = {
      high: 'bg-[var(--rilo-sem-danger)]/10 border-[var(--rilo-sem-danger)] text-[var(--rilo-sem-danger)]',
      medium: 'bg-[var(--rilo-sem-warning)]/10 border-[var(--rilo-sem-warning)] text-[var(--rilo-sem-warning)]',
      low: 'bg-[var(--rilo-sem-info)]/10 border-[var(--rilo-sem-info)] text-[var(--rilo-sem-info)]'
    };
    const priorityBadgeClass = {
      high: 'bg-[var(--rilo-value-danger)] text-[#f7f2ea]',
      medium: 'bg-[var(--rilo-value-warning)] text-[#f7f2ea]',
      low: 'bg-[var(--rilo-value-info)] text-[#f7f2ea]'
    };
    const priorityLabel = {
      high: '高优先级',
      medium: '中优先级',
      low: '低优先级'
    };

    return React.createElement('div', {
      className: `rilo-card-hierarchy-mid border rounded-[var(--radius-md)] p-4 bg-[rgba(255,251,246,0.72)] ${priorityColors[recommendation.priority]}`
    }, [
      React.createElement('div', {
        key: 'header',
        className: 'flex items-center gap-2 mb-2'
      }, [
        null,
        React.createElement('h5', { key: 'title', className: 'font-medium' }, recommendation.title),
        React.createElement('span', {
          key: 'priority',
          className: `text-xs px-2 py-1 rounded-full font-medium ${priorityBadgeClass[recommendation.priority]}`
        }, priorityLabel[recommendation.priority])
      ]),
      React.createElement('div', {
        key: 'content',
        className: 'text-sm whitespace-pre-line'
      }, recommendation.content)
    ]);
  };
  window.RiloUI.RecommendationCard = RecommendationCard;

  // ScenarioCard: Displays scenario (conservative, base, optimistic) metrics
  // Includes internal MetricRow helper (not exposed globally)
  const MetricRow = ({ label, value, currency, valueClass }) => {
    return React.createElement('div', {
      className: 'flex justify-between items-center'
    }, [
      React.createElement('span', { key: 'label', className: 'text-sm text-[var(--rilo-text-3)]' }, label),
      React.createElement('span', { key: 'value', className: valueClass }, `${currency}${value.toLocaleString()}`)
    ]);
  };

  const ScenarioCard = ({ scenario, currency }) => {
    return React.createElement('div', {
      className: 'rilo-ledger-panel rounded-[var(--radius-md)] border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] p-4 shadow-[var(--rilo-shadow-soft)]'
    }, [
      // 卡片头部
      React.createElement('div', {
        key: 'header',
        className: `flex items-center gap-2 mb-4 text-[var(--rilo-text-1)]`
      }, [
        null,
        React.createElement('h4', { key: 'name', className: 'font-semibold' }, scenario.name)
      ]),

      // 财务指标
      React.createElement('div', {
        key: 'metrics',
        className: 'space-y-3 text-[var(--rilo-text-2)]'
      }, [
        React.createElement(MetricRow, {
          key: 'revenue',
          label: '年收入',
          value: scenario.data.revenue || 0,
          currency: currency,
          valueClass: 'font-bold text-[var(--rilo-value-success)]'
        }),

        React.createElement(MetricRow, {
          key: 'cost',
          label: '年成本',
          value: scenario.data.cost || 0,
          currency: currency,
          valueClass: 'font-bold text-[var(--rilo-sem-danger)]'
        }),

        React.createElement('hr', {
          key: 'divider',
          className: 'border-[var(--rilo-border-deep)]'
        }),

        React.createElement(MetricRow, {
          key: 'profit',
          label: '净利润',
          value: scenario.data.profit || 0,
          currency: currency,
          valueClass: `font-bold ${(scenario.data.profit || 0) > 0 ? 'text-[var(--rilo-value-success)]' : 'text-[var(--rilo-value-danger)]'}`
        }),

        React.createElement('div', {
          key: 'margin',
          className: 'flex justify-between items-center'
        }, [
          React.createElement('span', { key: 'label', className: 'text-sm' }, '利润率'),
          React.createElement('span', {
            key: 'value',
            className: `font-bold ${(scenario.data.margin || 0) > 0 ? 'text-[var(--rilo-value-success)]' : 'text-[var(--rilo-value-danger)]'}`
          }, `${(scenario.data.margin || 0).toFixed(1)}%`)
        ]),

        React.createElement('div', {
          key: 'payback',
          className: 'flex justify-between items-center'
        }, [
          React.createElement('span', { key: 'label', className: 'text-sm' }, '回本周期'),
          React.createElement('span', {
            key: 'value',
            className: 'font-bold text-[var(--rilo-value-info)]'
          }, scenario.data.paybackYears === Infinity ? '无法回本' : `${(scenario.data.paybackYears || 0).toFixed(1)}年`)
        ]),

        // 盈利状态指示器
        React.createElement('div', {
          key: 'status',
          className: 'text-center mt-4'
        }, [
          React.createElement('div', {
            key: 'indicator',
            className: `px-3 py-1 rounded-full text-xs font-medium ${
              (scenario.data.profit || 0) > 0
                ? 'bg-[var(--rilo-value-success-soft)] text-[var(--rilo-value-success)] border border-[var(--rilo-value-success-border)]'
                : 'bg-[var(--rilo-value-danger-soft)] text-[var(--rilo-value-danger)] border border-[var(--rilo-value-danger-border)]'
            }`
          }, (scenario.data.profit || 0) > 0 ? '净利润读数 > 0' : '净利润读数 < 0')
        ])
      ])
    ]);
  };
  window.RiloUI.ScenarioCard = ScenarioCard;

  // Optionally, could include other UI cards like StatusIndicator in the future.
  // For now, these are the core shared card components.

})();
