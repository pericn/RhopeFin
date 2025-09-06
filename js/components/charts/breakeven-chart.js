// 盈亏平衡可视化图表组件
// 功能：对比显示总收入与总成本，直观展示盈利状态和净利润
window.BreakevenChart = (function() {

  const BreakevenChart = ({ calculations, currency = "¥" }) => {
    if (!calculations) return null;

    const revenue = calculations.revenue?.total || 0;
    const cost = calculations.cost?.total || 0;
    const maxValue = Math.max(revenue, cost);
    
    if (maxValue <= 0) {
      return React.createElement('div', {
        className: 'text-center py-8 text-gray-500'
      }, '暂无数据');
    }

    const revenuePercent = (revenue / maxValue) * 100;
    const costPercent = (cost / maxValue) * 100;
    const isProfitable = revenue > cost;

    return React.createElement('div', {
      className: 'bg-white rounded-lg p-4 border'
    }, [
      React.createElement('h5', {
        key: 'title',
        className: 'font-medium text-gray-800 mb-4'
      }, '收支平衡分析'),
      
      React.createElement('div', {
        key: 'chart',
        className: 'space-y-4'
      }, [
        // 收入条
        React.createElement('div', {
          key: 'revenue-row',
          className: 'space-y-2'
        }, [
          React.createElement('div', {
            key: 'label',
            className: 'flex justify-between items-center'
          }, [
            React.createElement('span', {
              key: 'name',
              className: 'text-sm text-green-600 font-medium'
            }, '总收入'),
            React.createElement('span', {
              key: 'amount',
              className: 'text-sm font-bold text-green-700'
            }, `${currency}${revenue.toLocaleString()}`)
          ]),
          React.createElement('div', {
            key: 'bar',
            className: 'w-full bg-gray-100 rounded-full h-3 relative'
          }, [
            React.createElement('div', {
              key: 'fill',
              className: 'h-3 rounded-full bg-green-500 transition-all duration-500',
              style: { width: `${revenuePercent}%` }
            }),
            React.createElement('div', {
              key: 'text',
              className: 'absolute inset-0 flex items-center justify-center text-xs font-medium text-white'
            }, `${revenuePercent.toFixed(1)}%`)
          ])
        ]),

        // 成本条
        React.createElement('div', {
          key: 'cost-row',
          className: 'space-y-2'
        }, [
          React.createElement('div', {
            key: 'label',
            className: 'flex justify-between items-center'
          }, [
            React.createElement('span', {
              key: 'name',
              className: 'text-sm text-red-600 font-medium'
            }, '总成本'),
            React.createElement('span', {
              key: 'amount',
              className: 'text-sm font-bold text-red-700'
            }, `${currency}${cost.toLocaleString()}`)
          ]),
          React.createElement('div', {
            key: 'bar',
            className: 'w-full bg-gray-100 rounded-full h-3 relative'
          }, [
            React.createElement('div', {
              key: 'fill',
              className: 'h-3 rounded-full bg-red-500 transition-all duration-500',
              style: { width: `${costPercent}%` }
            }),
            React.createElement('div', {
              key: 'text',
              className: 'absolute inset-0 flex items-center justify-center text-xs font-medium text-white'
            }, `${costPercent.toFixed(1)}%`)
          ])
        ]),

        // 平衡状态
        React.createElement('div', {
          key: 'status',
          className: 'text-center pt-2'
        }, [
          React.createElement('div', {
            key: 'indicator',
            className: `text-sm font-medium ${isProfitable ? 'text-green-600' : 'text-red-600'}`
          }, isProfitable ? '✅ 已实现盈利' : '❌ 暂未盈利'),
          isProfitable && React.createElement('div', {
            key: 'profit',
            className: 'text-xs text-gray-600 mt-1'
          }, `净利润: ${currency}${(revenue - cost).toLocaleString()}`)
        ])
      ])
    ]);
  };

  return {
    BreakevenChart
  };

})();