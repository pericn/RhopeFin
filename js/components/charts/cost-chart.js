// 成本结构图表 - 展示固定成本、变动成本、COGS 三大类占比
window.CostChart = (function() {

  const CostStructureChart = ({ calculations, currency = "¥" }) => {
    const cost = calculations?.cost || {};
    const total = cost.total || 0;

    if (total <= 0) {
      return React.createElement('div', {
        className: 'text-center py-6 text-[var(--rilo-text-3)] text-sm'
      }, '暂无成本数据 — 请在经营设置中完善成本参数');
    }

    const fixed = cost.fixed?.total || 0;
    const variable = cost.variable?.total || 0;
    const cogs = cost.cogs?.total || 0;

    const categories = [
      {
        name: '固定成本',
        value: fixed,
        color: '#9a8a7a',
        details: cost.fixed ? Object.entries({
          ...(cost.fixed.rent ? { '租金': cost.fixed.rent } : {}),
          ...(cost.fixed.property ? { '物业': cost.fixed.property } : {}),
          ...(cost.fixed.staff ? { '人工': cost.fixed.staff } : {}),
          ...(cost.fixed.cleaning ? { '清洁': cost.fixed.cleaning } : {}),
          ...(cost.fixed.hqFee ? { '管理费': cost.fixed.hqFee } : {}),
        }).filter(([, v]) => v > 0).slice(0, 4) : []
      },
      {
        name: '变动成本',
        value: variable,
        color: '#7a8a6a',
        details: []
      },
      {
        name: 'COGS',
        value: cogs,
        color: '#8a7a6a',
        details: []
      }
    ].filter(c => c.value > 0);

    const maxValue = Math.max(...categories.map(c => c.value));

    return React.createElement('div', { className: 'space-y-3' }, [
      React.createElement('div', { key: 'bars', className: 'space-y-2.5' },
        categories.map(cat => {
          const pct = (cat.value / total * 100).toFixed(1);
          return React.createElement('div', { key: cat.name, className: 'space-y-1' }, [
            React.createElement('div', {
              key: 'label',
              className: 'flex justify-between text-xs'
            }, [
              React.createElement('span', {
                key: 'name',
                className: 'text-[var(--rilo-text-2)]'
              }, cat.name),
              React.createElement('span', {
                key: 'val',
                className: 'text-[var(--rilo-text-1)] font-medium'
              }, `${currency}${(cat.value / 10000).toFixed(1)}万 (${pct}%)`)
            ]),
            React.createElement('div', {
              key: 'track',
              className: 'h-2 rounded-full bg-[rgba(34,31,26,0.08)] overflow-hidden'
            }, [
              React.createElement('div', {
                key: 'fill',
                className: 'h-full rounded-full transition-all duration-500',
                style: {
                  width: `${Math.max(4, (cat.value / maxValue) * 100)}%`,
                  backgroundColor: cat.color
                }
              })
            ])
          ]);
        })
      ),
      React.createElement('div', {
        key: 'total',
        className: 'pt-2 border-t border-[var(--rilo-border-deep)] flex justify-between text-sm'
      }, [
        React.createElement('span', { className: 'text-[var(--rilo-text-2)]' }, '合计'),
        React.createElement('span', {
          className: 'text-[var(--rilo-text-1)] font-semibold'
        }, `${currency}${(total / 10000).toFixed(1)}万`)
      ])
    ]);
  };

  return { CostStructureChart };
})();
