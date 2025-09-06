// 成本结构分析图表组件
// 功能：显示COGS、固定成本和变动成本的完整分析，包含详细计算过程
window.CostChart = (function() {

  const CostStructureChart = ({ calculations, currency = "¥" }) => {
    if (!calculations || !calculations.cost) return null;

    const { cost, revenue } = calculations;
    const fixed = cost.fixed || 0;
    const variable = cost.variable || 0;
    const cogs = cost.cogs?.total || 0;
    const total = fixed + variable + cogs;
    
    if (total <= 0) {
      return React.createElement('div', {
        className: 'text-center py-8 text-gray-500'
      }, '暂无成本数据');
    }

    const costItems = [
      { 
        name: '业务成本(COGS)', 
        value: cogs, 
        color: '#f59e0b', 
        percentage: (cogs / total * 100).toFixed(1),
        description: '直接与收入关联的业务成本'
      },
      { 
        name: '固定成本', 
        value: fixed, 
        color: '#ef4444', 
        percentage: (fixed / total * 100).toFixed(1),
        description: '租金、人工等不随收入变化的成本'
      },
      { 
        name: '变动成本', 
        value: variable, 
        color: '#8b5cf6', 
        percentage: (variable / total * 100).toFixed(1),
        description: '水电、其他随经营变动的成本'
      }
    ].filter(item => item.value > 0);

    return React.createElement('div', {
      className: 'space-y-4'
    }, [
      // 成本结构总览
      React.createElement('div', {
        key: 'overview',
        className: 'bg-red-50 rounded-lg p-4'
      }, [
        React.createElement('h5', {
          key: 'title',
          className: 'font-medium text-red-800 mb-3'
        }, `💸 成本结构分析 (总计: ${currency}${(total/10000).toFixed(2)}万)`),
        
        React.createElement('div', {
          key: 'breakdown',
          className: 'space-y-3'
        }, costItems.map((item, index) => 
          React.createElement('div', {
            key: index,
            className: 'space-y-2'
          }, [
            React.createElement('div', {
              key: 'header',
              className: 'flex justify-between items-center'
            }, [
              React.createElement('div', {
                key: 'label',
                className: 'flex items-center'
              }, [
                React.createElement('div', {
                  key: 'color',
                  className: 'w-3 h-3 rounded-full mr-2',
                  style: { backgroundColor: item.color }
                }),
                React.createElement('span', {
                  key: 'name',
                  className: 'text-sm font-medium text-gray-700'
                }, item.name)
              ]),
              React.createElement('div', {
                key: 'value',
                className: 'text-sm font-bold text-gray-900'
              }, `${currency}${(item.value/10000).toFixed(2)}万 (${item.percentage}%)`)
            ]),
            React.createElement('div', {
              key: 'description',
              className: 'text-xs text-gray-500 ml-5'
            }, item.description),
            React.createElement('div', {
              key: 'bar',
              className: 'w-full bg-gray-200 rounded-full h-2'
            }, React.createElement('div', {
              className: 'h-2 rounded-full transition-all duration-300',
              style: { 
                width: `${item.percentage}%`,
                backgroundColor: item.color
              }
            }))
          ])
        ))
      ]),

      // 详细计算过程
      React.createElement('div', {
        key: 'detailed-calculation',
        className: 'bg-blue-50 rounded-lg p-4'
      }, [
        React.createElement('h5', {
          key: 'title',
          className: 'font-medium text-blue-800 mb-3'
        }, '🧮 成本计算过程详解'),
        
        // COGS计算详解
        cogs > 0 && React.createElement('div', {
          key: 'cogs-calculation',
          className: 'mb-4 p-3 bg-white rounded border-l-4 border-orange-400'
        }, [
          React.createElement('div', {
            key: 'title',
            className: 'text-sm font-semibold text-orange-700 mb-2'
          }, '📋 业务成本 (COGS) 计算方法'),
          React.createElement('div', {
            key: 'formula',
            className: 'text-xs text-gray-600 mb-2 font-mono bg-gray-100 p-2 rounded'
          }, 'COGS = 各业务收入 × (100% - 毛利率) ÷ 100%'),
          React.createElement('div', {
            key: 'breakdown',
            className: 'space-y-1 text-xs text-gray-600'
          }, [
            cost.cogs?.member > 0 && React.createElement('div', { key: 'member' }, 
              `• 会员业务成本: ¥${(cost.cogs.member/10000).toFixed(2)}万`),
            cost.cogs?.boarding > 0 && React.createElement('div', { key: 'boarding' }, 
              `• 寄养业务成本: ¥${(cost.cogs.boarding/10000).toFixed(2)}万`),
            cost.cogs?.medical > 0 && React.createElement('div', { key: 'medical' }, 
              `• 医疗业务成本: ¥${(cost.cogs.medical/10000).toFixed(2)}万`),
            cost.cogs?.retail > 0 && React.createElement('div', { key: 'retail' }, 
              `• 零售业务成本: ¥${(cost.cogs.retail/10000).toFixed(2)}万`),
            cost.cogs?.cafe > 0 && React.createElement('div', { key: 'cafe' }, 
              `• 餐饮业务成本: ¥${(cost.cogs.cafe/10000).toFixed(2)}万`)
          ])
        ]),
        
        // 固定成本计算详解
        fixed > 0 && React.createElement('div', {
          key: 'fixed-calculation',
          className: 'mb-4 p-3 bg-white rounded border-l-4 border-red-400'
        }, [
          React.createElement('div', {
            key: 'title',
            className: 'text-sm font-semibold text-red-700 mb-2'
          }, '🏢 固定成本计算构成'),
          React.createElement('div', {
            key: 'formula',
            className: 'text-xs text-gray-600 mb-2 font-mono bg-gray-100 p-2 rounded'
          }, '固定成本 = 租金 + 人工 + 物业 + 其他固定支出'),
          React.createElement('div', {
            key: 'details',
            className: 'space-y-1 text-xs text-gray-600'
          }, [
            React.createElement('div', { key: 'rent' }, `• 租金成本: 营业面积 × 日租金 × 365天`),
            React.createElement('div', { key: 'staff' }, `• 人工成本: 员工数 × 月薪 × 12个月`),
            React.createElement('div', { key: 'property' }, `• 物业管理: 营业面积 × 物业费`),
            React.createElement('div', { key: 'other' }, `• 其他固定: 保险、装修摊销等`)
          ])
        ]),
        
        // 变动成本计算详解
        variable > 0 && React.createElement('div', {
          key: 'variable-calculation',
          className: 'p-3 bg-white rounded border-l-4 border-purple-400'
        }, [
          React.createElement('div', {
            key: 'title',
            className: 'text-sm font-semibold text-purple-700 mb-2'
          }, '⚡ 变动成本计算构成'),
          React.createElement('div', {
            key: 'formula',
            className: 'text-xs text-gray-600 mb-2 font-mono bg-gray-100 p-2 rounded'
          }, '变动成本 = 水电费 + 营销费用 + 其他可变支出'),
          React.createElement('div', {
            key: 'details',
            className: 'space-y-1 text-xs text-gray-600'
          }, [
            React.createElement('div', { key: 'utilities' }, `• 水电费用: 根据经营规模和使用强度`),
            React.createElement('div', { key: 'marketing' }, `• 营销推广: 广告、促销等市场费用`),
            React.createElement('div', { key: 'maintenance' }, `• 维护费用: 设备保养、维修等`),
            React.createElement('div', { key: 'misc' }, `• 其他变动: 季节性、临时性支出`)
          ])
        ])
      ]),

      // 成本效率分析
      revenue?.total > 0 && React.createElement('div', {
        key: 'efficiency-analysis',
        className: 'bg-green-50 rounded-lg p-4'
      }, [
        React.createElement('h5', {
          key: 'title',
          className: 'font-medium text-green-800 mb-3'
        }, '📊 成本效率与结构分析'),
        React.createElement('div', {
          key: 'metrics',
          className: 'grid grid-cols-3 gap-4 text-center'
        }, [
          React.createElement('div', {
            key: 'cost-revenue-ratio'
          }, [
            React.createElement('div', {
              key: 'value',
              className: 'text-lg font-bold text-green-700'
            }, `${((total / revenue.total) * 100).toFixed(1)}%`),
            React.createElement('div', {
              key: 'label',
              className: 'text-xs text-gray-600'
            }, '成本占收入比'),
            React.createElement('div', {
              key: 'note',
              className: 'text-xs text-gray-500'
            }, '越低越好')
          ]),
          React.createElement('div', {
            key: 'cogs-ratio'
          }, [
            React.createElement('div', {
              key: 'value',
              className: 'text-lg font-bold text-orange-600'
            }, `${((cogs / total) * 100).toFixed(1)}%`),
            React.createElement('div', {
              key: 'label',
              className: 'text-xs text-gray-600'
            }, 'COGS占总成本比'),
            React.createElement('div', {
              key: 'note',
              className: 'text-xs text-gray-500'
            }, '业务直接成本')
          ]),
          React.createElement('div', {
            key: 'fixed-ratio'
          }, [
            React.createElement('div', {
              key: 'value',
              className: 'text-lg font-bold text-red-600'
            }, `${((fixed / total) * 100).toFixed(1)}%`),
            React.createElement('div', {
              key: 'label',
              className: 'text-xs text-gray-600'
            }, '固定成本占比'),
            React.createElement('div', {
              key: 'note',
              className: 'text-xs text-gray-500'
            }, '运营基础成本')
          ])
        ])
      ])
    ]);
  };

  return {
    CostStructureChart
  };

})();