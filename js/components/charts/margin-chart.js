// 毛利率分析图表组件 - 详细展示各业务板块毛利率计算过程和对比分析
window.MarginChart = (function() {

  const MarginComparisonChart = ({ calculations, currency = '¥' }) => {
    if (!calculations || !calculations.revenue) return null;

    const revenue = calculations.revenue;
    const cost = calculations.cost;
    const cogs = cost?.cogs?.total || 0;

    // 计算各业务板块的毛利率及详细数据
    const businessMargins = [
      {
        name: '会员业务',
        icon: '👥',
        revenue: revenue.member || 0,
        cogs: cost?.cogs?.member || 0,
        margin: revenue.member > 0 ? ((revenue.member - (cost?.cogs?.member || 0)) / revenue.member * 100) : 0,
        color: '#3b82f6'
      },
      {
        name: '寄养业务',
        icon: '🏨', 
        revenue: revenue.boarding || 0,
        cogs: cost?.cogs?.boarding || 0,
        margin: revenue.boarding > 0 ? ((revenue.boarding - (cost?.cogs?.boarding || 0)) / revenue.boarding * 100) : 0,
        color: '#10b981'
      },
      {
        name: '医疗业务',
        icon: '🏥',
        revenue: revenue.medical || 0,
        cogs: cost?.cogs?.medical || 0,
        margin: revenue.medical > 0 ? ((revenue.medical - (cost?.cogs?.medical || 0)) / revenue.medical * 100) : 0,
        color: '#f59e0b'
      },
      {
        name: '零售业务',
        icon: '🛍️',
        revenue: revenue.retail || 0,
        cogs: cost?.cogs?.retail || 0,
        margin: revenue.retail > 0 ? ((revenue.retail - (cost?.cogs?.retail || 0)) / revenue.retail * 100) : 0,
        color: '#8b5cf6'
      },
      {
        name: '餐饮业务',
        icon: '☕',
        revenue: revenue.cafe || 0,
        cogs: cost?.cogs?.cafe || 0,
        margin: revenue.cafe > 0 ? ((revenue.cafe - (cost?.cogs?.cafe || 0)) / revenue.cafe * 100) : 0,
        color: '#ef4444'
      }
    ].filter(item => item.revenue > 0);

    // 综合毛利率
    const overallMargin = revenue.total > 0 ? ((revenue.total - cogs) / revenue.total * 100) : 0;
    const totalGrossProfit = revenue.total - cogs;

    return React.createElement('div', {
      className: 'space-y-6'
    }, [
      // 毛利率计算公式说明
      React.createElement('div', {
        key: 'formula-explanation',
        className: 'bg-blue-50 rounded-lg p-4'
      }, [
        React.createElement('h4', {
          key: 'title',
          className: 'text-lg font-semibold text-blue-800 mb-3'
        }, '📊 毛利率分析与计算'),
        React.createElement('div', {
          key: 'formula',
          className: 'bg-white rounded p-3 mb-3'
        }, [
          React.createElement('div', {
            key: 'title',
            className: 'text-sm font-semibold text-gray-800 mb-2'
          }, '毛利率计算公式：'),
          React.createElement('div', {
            key: 'formula-text',
            className: 'font-mono text-sm bg-gray-100 p-2 rounded'
          }, '毛利率 = (收入 - 业务成本) ÷ 收入 × 100%'),
          React.createElement('div', {
            key: 'note',
            className: 'text-xs text-gray-600 mt-2'
          }, '业务成本 (COGS) = 收入 × (100% - 设置的毛利率) ÷ 100%')
        ])
      ]),

      // 综合毛利率显示
      React.createElement('div', {
        key: 'overall-margin',
        className: 'bg-teal-50 rounded-lg p-4'
      }, [
        React.createElement('h4', {
          key: 'title',
          className: 'text-lg font-semibold text-teal-800 mb-3'
        }, '🎯 综合毛利率分析'),
        React.createElement('div', {
          key: 'main-display',
          className: 'text-center mb-4'
        }, [
          React.createElement('div', {
            key: 'value',
            className: 'text-4xl font-bold text-teal-600 mb-2'
          }, `${overallMargin.toFixed(1)}%`),
          React.createElement('div', {
            key: 'label',
            className: 'text-sm text-gray-600'
          }, '综合毛利率')
        ]),
        React.createElement('div', {
          key: 'calculation-process',
          className: 'bg-white rounded p-3'
        }, [
          React.createElement('div', {
            key: 'title',
            className: 'text-sm font-medium text-gray-800 mb-2'
          }, '计算过程：'),
          React.createElement('div', {
            key: 'steps',
            className: 'text-xs text-gray-600 space-y-1'
          }, [
            React.createElement('div', { key: 'step1' }, `总收入: ${currency}${(revenue.total/10000).toFixed(2)}万`),
            React.createElement('div', { key: 'step2' }, `业务成本: ${currency}${(cogs/10000).toFixed(2)}万`),
            React.createElement('div', { key: 'step3' }, `毛利润: ${currency}${(totalGrossProfit/10000).toFixed(2)}万`),
            React.createElement('div', { key: 'step4', className: 'font-medium border-t border-gray-200 pt-1' }, 
              `综合毛利率 = ¥${(totalGrossProfit/10000).toFixed(2)}万 ÷ ¥${(revenue.total/10000).toFixed(2)}万 × 100% = ${overallMargin.toFixed(1)}%`)
          ])
        ])
      ]),
      
      // 各业务板块详细毛利率分析
      React.createElement('div', {
        key: 'business-margins',
        className: 'space-y-4'
      }, [
        React.createElement('h4', {
          key: 'title',
          className: 'text-lg font-semibold text-gray-800'
        }, '💼 各业务板块毛利率详解'),
        
        ...businessMargins.map((item, index) => 
          React.createElement('div', {
            key: index,
            className: 'bg-white border-2 border-gray-100 rounded-lg p-4 hover:shadow-lg transition-shadow'
          }, [
            React.createElement('div', {
              key: 'header',
              className: 'flex justify-between items-center mb-3'
            }, [
              React.createElement('div', {
                key: 'name',
                className: 'flex items-center'
              }, [
                React.createElement('span', {
                  key: 'icon',
                  className: 'text-xl mr-2'
                }, item.icon),
                React.createElement('span', {
                  key: 'text',
                  className: 'font-semibold text-gray-800'
                }, item.name)
              ]),
              React.createElement('div', {
                key: 'margin-display',
                className: 'text-right'
              }, [
                React.createElement('div', {
                  key: 'percentage',
                  className: `text-2xl font-bold ${item.margin >= 0 ? 'text-green-600' : 'text-red-600'}`
                }, `${item.margin.toFixed(1)}%`),
                React.createElement('div', {
                  key: 'label',
                  className: 'text-xs text-gray-500'
                }, '毛利率')
              ])
            ]),
            
            React.createElement('div', {
              key: 'detailed-breakdown',
              className: 'grid grid-cols-1 md:grid-cols-2 gap-4'
            }, [
              // 财务数据
              React.createElement('div', {
                key: 'financial-data',
                className: 'space-y-2'
              }, [
                React.createElement('div', {
                  key: 'title',
                  className: 'text-sm font-medium text-gray-700 border-b border-gray-200 pb-1'
                }, '财务数据：'),
                React.createElement('div', { key: 'revenue', className: 'text-sm flex justify-between' }, [
                  React.createElement('span', { key: 'label', className: 'text-gray-600' }, '业务收入:'),
                  React.createElement('span', { key: 'value', className: 'font-medium' }, `${currency}${(item.revenue/10000).toFixed(2)}万`)
                ]),
                React.createElement('div', { key: 'cogs', className: 'text-sm flex justify-between' }, [
                  React.createElement('span', { key: 'label', className: 'text-gray-600' }, '业务成本:'),
                  React.createElement('span', { key: 'value', className: 'font-medium text-orange-600' }, `${currency}${(item.cogs/10000).toFixed(2)}万`)
                ]),
                React.createElement('div', { key: 'profit', className: 'text-sm flex justify-between border-t border-gray-100 pt-1' }, [
                  React.createElement('span', { key: 'label', className: 'text-gray-600' }, '毛利润:'),
                  React.createElement('span', { key: 'value', className: `font-bold ${(item.revenue - item.cogs) >= 0 ? 'text-green-600' : 'text-red-600'}` }, 
                    `${currency}${((item.revenue - item.cogs)/10000).toFixed(2)}万`)
                ])
              ]),
              
              // 计算过程
              React.createElement('div', {
                key: 'calculation-process',
                className: 'bg-gray-50 rounded p-3'
              }, [
                React.createElement('div', {
                  key: 'title',
                  className: 'text-sm font-medium text-gray-700 mb-2'
                }, '计算过程：'),
                React.createElement('div', {
                  key: 'formula',
                  className: 'text-xs text-gray-600 space-y-1'
                }, [
                  React.createElement('div', { key: 'step1' }, '毛利润 = 收入 - 成本'),
                  React.createElement('div', { key: 'step2' }, `= ¥${(item.revenue/10000).toFixed(2)}万 - ¥${(item.cogs/10000).toFixed(2)}万`),
                  React.createElement('div', { key: 'step3' }, `= ¥${((item.revenue - item.cogs)/10000).toFixed(2)}万`),
                  React.createElement('div', { key: 'step4', className: 'border-t border-gray-300 pt-1 mt-1' }, '毛利率 = 毛利润 ÷ 收入 × 100%'),
                  React.createElement('div', { key: 'step5', className: 'font-medium' }, 
                    `= ¥${((item.revenue - item.cogs)/10000).toFixed(2)}万 ÷ ¥${(item.revenue/10000).toFixed(2)}万 × 100% = ${item.margin.toFixed(1)}%`)
                ])
              ])
            ]),
            
            // 可视化进度条
            React.createElement('div', {
              key: 'progress-bar',
              className: 'mt-4'
            }, [
              React.createElement('div', {
                key: 'bar-container',
                className: 'w-full bg-gray-200 rounded-full h-3 overflow-hidden'
              }, React.createElement('div', {
                className: 'h-3 rounded-full transition-all duration-500',
                style: { 
                  width: `${Math.min(Math.max(item.margin, 0), 100)}%`,
                  backgroundColor: item.color
                }
              })),
              React.createElement('div', {
                key: 'bar-labels',
                className: 'flex justify-between text-xs text-gray-500 mt-1'
              }, [
                React.createElement('span', { key: 'start' }, '0%'),
                React.createElement('span', { key: 'end' }, '100%')
              ])
            ])
          ])
        )
      ]),

      // 毛利率对比和分析总结
      React.createElement('div', {
        key: 'comparison-analysis',
        className: 'bg-purple-50 rounded-lg p-4'
      }, [
        React.createElement('h4', {
          key: 'title',
          className: 'text-lg font-semibold text-purple-800 mb-3'
        }, '📈 毛利率对比分析'),
        React.createElement('div', {
          key: 'analysis',
          className: 'grid grid-cols-1 md:grid-cols-2 gap-4'
        }, [
          React.createElement('div', {
            key: 'highest-margin',
            className: 'bg-white rounded p-3'
          }, [
            React.createElement('div', {
              key: 'title',
              className: 'text-sm font-medium text-gray-700 mb-2'
            }, '最高毛利率业务:'),
            React.createElement('div', {
              key: 'content'
            }, businessMargins.length > 0 ? (() => {
              const highest = businessMargins.reduce((prev, current) => (prev.margin > current.margin) ? prev : current);
              return [
                React.createElement('div', { key: 'name', className: 'font-semibold text-purple-600' }, 
                  `${highest.icon} ${highest.name}`),
                React.createElement('div', { key: 'value', className: 'text-2xl font-bold text-purple-700' }, 
                  `${highest.margin.toFixed(1)}%`)
              ];
            })() : React.createElement('span', { className: 'text-gray-500' }, '暂无数据'))
          ]),
          React.createElement('div', {
            key: 'average-margin',
            className: 'bg-white rounded p-3'
          }, [
            React.createElement('div', {
              key: 'title',
              className: 'text-sm font-medium text-gray-700 mb-2'
            }, '平均毛利率:'),
            React.createElement('div', {
              key: 'value',
              className: 'text-2xl font-bold text-gray-700'
            }, businessMargins.length > 0 ? 
              `${(businessMargins.reduce((sum, item) => sum + item.margin, 0) / businessMargins.length).toFixed(1)}%` : '0.0%')
          ])
        ])
      ])
    ]);
  };

  return {
    MarginComparisonChart
  };

})();