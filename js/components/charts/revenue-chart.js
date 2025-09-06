// 收入结构分析图表组件
// 功能：显示各收入板块占比的可视化图表，包含进度条和百分比展示
window.RevenueChart = (function() {

  const RevenueStructureChart = ({ calculations, currency = "¥" }) => {
    if (!calculations || !calculations.revenue) return null;

    const revenue = calculations.revenue;
    const total = revenue.total;
    
    if (total <= 0) {
      return React.createElement('div', {
        className: 'text-center py-8 text-gray-500'
      }, '暂无收入数据');
    }

    const revenueItems = [
      { name: '会员收入', value: revenue.member, color: 'bg-green-500' },
      { name: '寄养收入', value: revenue.boarding, color: 'bg-blue-500' },
      { name: '医疗收入', value: revenue.medical, color: 'bg-purple-500' },
      { name: '零售收入', value: revenue.retail, color: 'bg-orange-500' },
      { name: '餐饮/社交收入', value: revenue.cafe, color: 'bg-pink-500' },
      { name: '自定义收入', value: revenue.custom, color: 'bg-gray-500' }
    ].filter(item => item.value > 0);

    return React.createElement('div', {
      className: 'bg-green-50 rounded-lg p-4'
    }, [
      React.createElement('h5', {
        key: 'title',
        className: 'font-medium text-green-800 mb-3'
      }, '收入构成'),
      React.createElement('div', {
        key: 'items',
        className: 'space-y-3'
      }, revenueItems.map(item => {
        const percentage = (item.value / total) * 100;
        return React.createElement('div', {
          key: item.name,
          className: 'space-y-1'
        }, [
          React.createElement('div', {
            key: 'header',
            className: 'flex justify-between items-center'
          }, [
            React.createElement('span', {
              key: 'name',
              className: 'text-sm text-gray-600'
            }, item.name),
            React.createElement('div', {
              key: 'values',
              className: 'text-sm'
            }, [
              React.createElement('span', {
                key: 'amount',
                className: 'font-medium'
              }, `${currency}${item.value.toLocaleString()}`),
              React.createElement('span', {
                key: 'percentage',
                className: 'text-gray-500 ml-2'
              }, `${percentage.toFixed(1)}%`)
            ])
          ]),
          React.createElement('div', {
            key: 'bar',
            className: 'w-full bg-green-100 rounded-full h-2'
          },
            React.createElement('div', {
              className: `h-2 rounded-full ${item.color} transition-all duration-500`,
              style: { width: `${percentage}%` }
            })
          )
        ]);
      }))
    ]);
  };

  return {
    RevenueStructureChart
  };

})();