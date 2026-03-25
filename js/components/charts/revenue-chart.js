// 收入结构图表 - 展示各收入来源占比
window.RevenueChart = (function() {

  const RevenueStructureChart = ({ calculations, currency = "¥" }) => {
    // Defensively extract revenue data from various possible shapes
    if (calculations) {
      console.log('RevenueChart: calculations.revenue =', calculations.revenue);
    } else {
      console.log('RevenueChart: calculations is', calculations);
    }
    const rev = calculations?.revenue || {};
    const total = rev.total || 0;

    // Show meaningful fallback if no data
    if (total <= 0) {
      return React.createElement('div', {
        className: 'text-center py-6 text-[var(--rilo-text-3)] text-sm'
      }, '暂无收入数据 — 请在经营设置中完善收入参数');
    }

    // Ensure all revenue items have defaults
    const items = [
      { name: '会员收入', value: rev.member || 0, color: '#8b7355' },
      { name: '寄养收入', value: rev.boarding || 0, color: '#6b8e6b' },
      { name: '医疗收入', value: rev.medical || 0, color: '#7a8a9a' },
      { name: '零售收入', value: rev.retail || 0, color: '#9a8a7a' },
      { name: '餐饮收入', value: rev.cafe || 0, color: '#8a7a6a' },
      { name: '自定义收入', value: rev.custom || 0, color: '#7a6a5a' }
    ].filter(item => item.value > 0);

    const maxValue = Math.max(...items.map(i => i.value), 1);

    return React.createElement('div', { className: 'space-y-3' }, [
      React.createElement('div', { key: 'bars', className: 'space-y-2.5' },
        items.map(item => {
          const pct = (item.value / total * 100).toFixed(1);
          return React.createElement('div', { key: item.name, className: 'space-y-1' }, [
            React.createElement('div', {
              key: 'label',
              className: 'flex justify-between text-xs'
            }, [
              React.createElement('span', {
                key: 'name',
                className: 'text-[var(--rilo-text-2)]'
              }, item.name),
              React.createElement('span', {
                key: 'val',
                className: 'text-[var(--rilo-text-1)] font-medium'
              }, `${currency}${(item.value / 10000).toFixed(1)}万 (${pct}%)`)
            ]),
            React.createElement('div', {
              key: 'track',
              className: 'h-2 rounded-full bg-[rgba(34,31,26,0.08)] overflow-hidden'
            }, [
              React.createElement('div', {
                key: 'fill',
                className: 'h-full rounded-full transition-all duration-500',
                style: {
                  width: `${Math.max(4, (item.value / maxValue) * 100)}%`,
                  backgroundColor: item.color
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

  return { RevenueStructureChart };
})();
