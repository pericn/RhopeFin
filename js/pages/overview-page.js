// 经营概览页面 - 展示关键指标和财务状况概览
window.OverviewPage = (function() {
  
  // 简化的创建元素辅助函数
  const h = React.createElement;
  
  // 页面头部组件
  const PageHeader = ({ projectName }) => null;
  
  // 货币选择器组件
  const CurrencySelector = ({ currency, onChange }) =>
    h('div', { className: 'flex items-center gap-2' }, [
      h('label', { key: 'label', className: 'text-sm text-gray-600' }, '货币:'),
      h('select', {
        key: 'select',
        className: 'px-2 py-1 rounded border text-sm',
        value: currency || '¥',
        onChange: e => onChange(e.target.value)
      }, [
        h('option', { key: 'cny', value: '¥' }, '¥ 人民币'),
        h('option', { key: 'usd', value: '$' }, '$ 美元')
      ])
    ]);
  
  // 导入按钮组件
  const ImportButton = ({ onImport }) =>
    h('div', { className: 'relative' }, [
      h('input', {
        key: 'file-input',
        type: 'file',
        accept: '.json',
        onChange: onImport,
        className: 'absolute inset-0 w-full h-full opacity-0 cursor-pointer'
      }),
      h(window.UIComponents.Button, {
        key: 'import-btn',
        variant: 'outline',
        size: 'small',
        className: 'w-full pointer-events-none'
      }, '导入数据')
    ]);
  
  // 主概览页面组件（统一两栏：左主内容 + 右侧 InspectorPanel）
  const OverviewPage = ({ data, calculations, updateData, currency = "¥" }) => {
    const Term = window.RiloUI?.Term;

    const glossaryTerms = {
      cogs: { title: 'COGS / 业务成本', body: 'Cost of Goods Sold。直接随收入发生的成本（原材料、耗材、外包等），不含租金/人工等固定成本。' },
      grossMargin: { title: '综合毛利率', body: '毛利润 ÷ 总收入。反映“卖出去的东西”本身赚不赚钱。' },
      netMargin: { title: '净利润率', body: '净利润 ÷ 总收入。反映整体经营效率（扣除所有成本）。' },
      payback: { title: '回本周期', body: '初始投资 ÷ 年净利润。若净利润≤0，则视为无法回本（Infinity）。' }
    };

    const left = h('div', { className: 'space-y-6' }, [
      h(KeyMetrics, { key: 'key-metrics', data, calculations, currency, showDetails: false }),
      h(BusinessOverview, { key: 'business-overview', data, calculations, currency }),
      h(ScenarioQuickView, { key: 'scenario-view', calculations, currency }),
      h(AlertsAndInsights, { key: 'alerts', calculations, data, currency })
    ]);

    const profit = calculations?.profitability?.profit || 0;
    const margin = calculations?.profitability?.margin || 0;
    const paybackYears = calculations?.profitability?.paybackYears ?? Infinity;

    const conclusion = h('div', { className: 'space-y-3 text-sm text-gray-700' }, [
      h('div', { key: 's1', className: 'rounded-xl border border-gray-200 bg-white p-3' }, [
        h('div', { key: 't', className: 'font-semibold text-gray-900' }, '当前状态'),
        h('div', { key: 'b' }, profit > 0 ? `✅ 年净利润为正（约 ${currency}${Math.round(profit/10000)} 万）` : `❌ 年净利润为负（约 ${currency}${Math.round(profit/10000)} 万）`)
      ]),
      h('div', { key: 's2', className: 'rounded-xl border border-gray-200 bg-white p-3' }, [
        h('div', { key: 't', className: 'font-semibold text-gray-900' }, '关键结论'),
        h('div', { key: 'b' }, [
          h('div', { key: 'm' }, ['净利润率：', Term ? h(Term, { termKey: 'netMargin' }, `${margin.toFixed(1)}%`) : `${margin.toFixed(1)}%`]),
          h('div', { key: 'p' }, ['回本周期：', Term ? h(Term, { termKey: 'payback' }, paybackYears === Infinity ? '无法回本' : `${paybackYears.toFixed(1)} 年`) : (paybackYears === Infinity ? '无法回本' : `${paybackYears.toFixed(1)} 年`)])
        ])
      ])
    ]);

    const process = h('div', { className: 'space-y-4' }, [
      h('div', { key: 'hint', className: 'text-xs text-gray-500' }, '默认收起：需要时再展开细节。'),
      h(DetailedCalculationDisplay, { key: 'detailed-calc', calculations, currency })
    ]);

    return window.RiloUI?.TwoPaneLayout ?
      h(window.RiloUI.TwoPaneLayout, {
        left,
        inspectorTitle: '财务分析 Inspector',
        conclusion,
        process,
        glossaryTerms
      }) : left;
  };

  // 数据操作区
  const DataActions = ({ data, updateData }) => {
    const handleImport = (event) => {
      const file = event.target.files[0];
      if (file && window.dataManager) {
        window.dataManager.importData(file, (error, importedData) => {
          alert(error ? '导入失败: ' + error.message : '数据导入成功！');
          if (!error) updateData(importedData);
          event.target.value = '';
        });
      }
    };
    
    const actions = {
      exportData: () => window.dataManager && window.dataManager.exportData(data),
      clearData: () => confirm('确认清除所有保存的数据？') && window.dataManager && updateData(window.dataManager.clearStorage())
    };
    
    return h('div', { className: 'bg-white rounded-2xl shadow p-4' }, [
      h('div', { key: 'actions', className: 'flex justify-center gap-3' }, [
        h(window.UIComponents.Button, { key: 'export', onClick: actions.exportData, variant: 'outline', size: 'small' }, '📤 导出数据'),
        h(ImportButton, { key: 'import', onImport: handleImport }),
        h(window.UIComponents.Button, { key: 'clear', onClick: actions.clearData, variant: 'danger', size: 'small' }, '🗑️ 清除数据')
      ])
    ]);
  };

  // 详细计算过程展示组件
  const DetailedCalculationDisplay = ({ calculations, currency }) => {
    if (!calculations) return null;
    
    const { revenue, cost, profitability, investment } = calculations;
    const cogs = cost?.cogs?.total || 0;
    const fixed = cost?.fixed || 0;
    const variable = cost?.variable || 0;
    const grossProfit = (revenue?.total || 0) - cogs;
    const netProfit = profitability?.profit || 0;
    
    return h('div', { className: 'mt-6 bg-gray-50 rounded-lg p-4' }, [
      h('h3', { key: 'title', className: 'text-md font-semibold text-gray-800 mb-4' }, '🧮 详细计算过程'),
      
      // 收入计算展示
      h('div', { key: 'revenue-calc', className: 'mb-4' }, [
        h('h4', { key: 'title', className: 'text-sm font-medium text-blue-700 mb-2' }, '💰 收入计算'),
        h('div', { key: 'breakdown', className: 'text-xs text-gray-600 space-y-1' }, [
          revenue?.member && h('div', { key: 'member' }, `会员收入: ¥${(revenue.member / 10000).toFixed(2)}万`),
          revenue?.boarding && h('div', { key: 'boarding' }, `寄养收入: ¥${(revenue.boarding / 10000).toFixed(2)}万`),
          revenue?.medical && h('div', { key: 'medical' }, `医疗收入: ¥${(revenue.medical / 10000).toFixed(2)}万`),
          revenue?.retail && h('div', { key: 'retail' }, `零售收入: ¥${(revenue.retail / 10000).toFixed(2)}万`),
          revenue?.cafe && h('div', { key: 'cafe' }, `餐饮收入: ¥${(revenue.cafe / 10000).toFixed(2)}万`),
          h('div', { key: 'total', className: 'font-medium border-t border-gray-300 pt-1 mt-2' }, 
            `总收入 = ¥${(revenue.total / 10000).toFixed(2)}万`)
        ])
      ]),
      
      // 业务成本计算展示
      h('div', { key: 'cogs-calc', className: 'mb-4' }, [
        h('h4', { key: 'title', className: 'text-sm font-medium text-orange-700 mb-2' }, '📋 业务成本 (COGS) 计算'),
        h('div', { key: 'breakdown', className: 'text-xs text-gray-600 space-y-1' }, [
          cost?.cogs?.member && h('div', { key: 'member' }, `会员业务成本: ¥${(cost.cogs.member / 10000).toFixed(2)}万`),
          cost?.cogs?.boarding && h('div', { key: 'boarding' }, `寄养业务成本: ¥${(cost.cogs.boarding / 10000).toFixed(2)}万`),
          cost?.cogs?.medical && h('div', { key: 'medical' }, `医疗业务成本: ¥${(cost.cogs.medical / 10000).toFixed(2)}万`),
          cost?.cogs?.retail && h('div', { key: 'retail' }, `零售业务成本: ¥${(cost.cogs.retail / 10000).toFixed(2)}万`),
          cost?.cogs?.cafe && h('div', { key: 'cafe' }, `餐饮业务成本: ¥${(cost.cogs.cafe / 10000).toFixed(2)}万`),
          h('div', { key: 'total', className: 'font-medium border-t border-gray-300 pt-1 mt-2' }, 
            `业务成本总计 = ¥${(cogs / 10000).toFixed(2)}万`)
        ])
      ]),
      
      // 毛利润计算
      h('div', { key: 'gross-profit-calc', className: 'mb-4' }, [
        h('h4', { key: 'title', className: 'text-sm font-medium text-teal-700 mb-2' }, '📊 毛利润计算'),
        h('div', { key: 'formula', className: 'text-xs text-gray-600' }, [
          h('div', { key: 'calc' }, `毛利润 = 总收入 - 业务成本`),
          h('div', { key: 'numbers' }, `= ¥${(revenue.total / 10000).toFixed(2)}万 - ¥${(cogs / 10000).toFixed(2)}万`),
          h('div', { key: 'result', className: 'font-medium text-teal-700' }, `= ¥${(grossProfit / 10000).toFixed(2)}万`),
          h('div', { key: 'margin', className: 'mt-1' }, 
            `综合毛利率 = ${revenue.total > 0 ? ((grossProfit / revenue.total) * 100).toFixed(1) : 0}%`)
        ])
      ]),
      
      // 运营成本计算
      h('div', { key: 'operating-costs', className: 'mb-4' }, [
        h('h4', { key: 'title', className: 'text-sm font-medium text-red-700 mb-2' }, '💸 运营成本计算'),
        h('div', { key: 'breakdown', className: 'text-xs text-gray-600 space-y-1' }, [
          h('div', { key: 'fixed' }, `固定成本: ¥${(fixed / 10000).toFixed(2)}万 (租金、人工等)`),
          h('div', { key: 'variable' }, `变动成本: ¥${(variable / 10000).toFixed(2)}万 (水电、其他)`),
          h('div', { key: 'total', className: 'font-medium border-t border-gray-300 pt-1 mt-2' }, 
            `运营成本总计 = ¥${((fixed + variable) / 10000).toFixed(2)}万`)
        ])
      ]),
      
      // 净利润计算
      h('div', { key: 'net-profit-calc', className: 'mb-4' }, [
        h('h4', { key: 'title', className: 'text-sm font-medium text-blue-700 mb-2' }, '📈 净利润计算'),
        h('div', { key: 'formula', className: 'text-xs text-gray-600' }, [
          h('div', { key: 'calc' }, `净利润 = 毛利润 - 运营成本`),
          h('div', { key: 'numbers' }, `= ¥${(grossProfit / 10000).toFixed(2)}万 - ¥${((fixed + variable) / 10000).toFixed(2)}万`),
          h('div', { key: 'result', className: `font-medium ${netProfit > 0 ? 'text-blue-700' : 'text-red-700'}` }, 
            `= ¥${(netProfit / 10000).toFixed(2)}万`),
          h('div', { key: 'margin', className: 'mt-1' }, 
            `净利润率 = ${revenue.total > 0 ? ((netProfit / revenue.total) * 100).toFixed(1) : 0}%`)
        ])
      ]),
      
      // 投资回报计算
      investment?.total > 0 && h('div', { key: 'roi-calc', className: 'mb-4' }, [
        h('h4', { key: 'title', className: 'text-sm font-medium text-purple-700 mb-2' }, '💎 投资回报计算'),
        h('div', { key: 'formula', className: 'text-xs text-gray-600' }, [
          h('div', { key: 'investment' }, `初始投资: ¥${(investment.total / 10000).toFixed(2)}万`),
          h('div', { key: 'payback' }, 
            `回本周期 = 初始投资 ÷ 年净利润 = ${netProfit > 0 ? (investment.total / netProfit).toFixed(1) : '∞'}年`),
          h('div', { key: 'roi' }, 
            `投资回报率 = (年净利润 ÷ 初始投资) × 100% = ${investment.total > 0 ? ((netProfit / investment.total) * 100).toFixed(1) : 0}%`)
        ])
      ])
    ]);
  };
  
  // 状态指示器组件
  const StatusIndicator = ({ profit }) => {
    const isProfit = profit > 0;
    return h('div', { className: 'mt-6 text-center' },
      h('div', { className: `inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
        isProfit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}` }, [
        h('span', { key: 'icon', className: 'text-lg' }, isProfit ? '✅' : '❌'),
        h('span', { key: 'text' }, isProfit ? '项目当前盈利状态良好' : '项目当前处于亏损状态')
      ])
    );
  };
  
  // 关键指标展示
  // TODO: 添加 RevPAR（每间可售房晚收入）作为次级指标，来源 ADR×入住率（data.revenue.boarding.adr × data.revenue.boarding.occ%）
  const KeyMetrics = ({ data, calculations, currency, showDetails = true }) => {
    if (!calculations) return null;
    const { revenue, cost, profitability, investment } = calculations;
    const profit = profitability?.profit || 0;
    const margin = profitability?.margin || 0;
    const paybackYears = profitability?.paybackYears ?? Infinity;
    
    // 计算毛利润相关指标
    const cogs = cost?.cogs?.total || 0;
    const grossProfit = (revenue?.total || 0) - cogs;
    const grossMargin = revenue?.total > 0 ? (grossProfit / revenue.total) * 100 : 0;

    // Unit economics (simple): LTV:CAC from settings assumptions
    const cac = data?.assumptions?.cac ?? 0;
    const ltv = data?.assumptions?.ltv ?? 0;
    const ltvCac = cac > 0 ? (ltv / cac) : null;
    
    const metrics = [
      [// 主要指标（成本前置：确保总成本上主行）
        { key: 'revenue', title: '年总营收', value: revenue?.total ? (revenue.total / 10000).toFixed(2) : 0, suffix: '万元', color: 'green', size: 'large' },
        { key: 'total-cost', title: '年总成本', value: cost?.total ? (cost.total / 10000).toFixed(2) : 0, suffix: '万元', color: 'red' },
        { key: 'gross-profit', title: '毛利润', value: grossProfit ? (grossProfit / 10000).toFixed(2) : 0, suffix: '万元', color: grossProfit > 0 ? 'teal' : 'red', size: 'large' },
        { key: 'gross-margin', title: '综合毛利率', value: grossMargin.toFixed(1), suffix: '%', color: grossMargin > 0 ? 'teal' : 'red' }
      ],
      [// 运营指标（下沉 COGS，保持净利与净利率）
        { key: 'cogs', title: '业务成本', value: cogs ? (cogs / 10000).toFixed(2) : 0, suffix: '万元', color: 'orange' },
        { key: 'profit', title: '年净利润', value: profit ? (profit / 10000).toFixed(2) : 0, suffix: '万元', color: profit > 0 ? 'blue' : 'red' },
        { key: 'margin', title: '净利润率', value: margin.toFixed(2), suffix: '%', color: margin > 0 ? 'blue' : 'red' }
      ],
      [// 投资指标（ROI 不进入主 KPI，保留回本周期）  
        { key: 'investment', title: '初始投资', value: investment?.total ? (investment.total / 10000).toFixed(2) : 0, suffix: '万元', color: 'purple' },
        { key: 'payback', title: '投资回本周期', value: paybackYears === Infinity ? '无法回本' : `${paybackYears.toFixed(1)}年`, 
          color: paybackYears < 3 ? 'green' : paybackYears < 5 ? 'orange' : 'red' },
        { key: 'monthly-cashflow', title: '月度现金流', value: profit ? (profit / 12 / 10000).toFixed(2) : 0, suffix: '万元', color: profit > 0 ? 'green' : 'red' },
        { key: 'ltv-cac', title: 'LTV:CAC', value: ltvCac === null ? '—' : ltvCac.toFixed(1), suffix: 'x', color: ltvCac !== null && ltvCac >= 3 ? 'success' : ltvCac !== null && ltvCac >= 1 ? 'warning' : 'danger' }
      ]
    ];

    return h('div', { className: 'bg-white rounded-2xl shadow p-6' }, [
      h('h2', { key: 'title', className: 'text-lg font-semibold mb-6' }, '📊 关键财务指标'),
      h('div', { key: 'primary', className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4' },
        metrics[0].map(metric => h(window.UIComponents.KPI, { key: metric.key, ...metric }))),
      h('div', { key: 'secondary', className: 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-4' },
        metrics[1].map(metric => h(window.UIComponents.KPI, { key: metric.key, ...metric }))),
      h('div', { key: 'tertiary', className: 'grid grid-cols-1 md:grid-cols-4 gap-4 mb-4' },
        metrics[2].map(metric => h(window.UIComponents.KPI, { key: metric.key, ...metric }))),
      showDetails && h(DetailedCalculationDisplay, { key: 'detailed-calc', calculations, currency }),
      h(StatusIndicator, { key: 'status', profit })
    ]);
  };

  // 图表卡片组件
  const ChartCard = ({ title, children }) =>
    h('div', { className: 'bg-white rounded-2xl shadow p-6' }, [
      h('h3', { key: 'title', className: 'text-lg font-semibold mb-4' }, title),
      children
    ]);
  
  // 业务概览
  const BusinessOverview = ({ data, calculations, currency }) => {
    if (!calculations) return null;
    
    return h('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' }, [
      h(ChartCard, { key: 'revenue', title: '💰 收入结构分析' },
        h(window.ChartComponents.RevenueStructureChart, { calculations, currency })
      ),
      h(ChartCard, { key: 'cost', title: '💸 成本结构分析' },
        h(window.ChartComponents.CostStructureChart, { calculations, currency })
      )
    ]);
  };

  // 情景快速预览
  const ScenarioQuickView = ({ calculations, currency }) => {
    if (!calculations?.scenarios) return null;
    
    return h(ChartCard, { title: '🎯 情景分析预览' },
      h(window.ChartComponents.ScenarioComparisonChart, { calculations, currency })
    );
  };

  // 提醒卡片组件  
  const AlertCard = ({ alert, colorClasses }) => h('div', { className: `border rounded-lg p-4 ${colorClasses[alert.type]}` }, [
    h('div', { key: 'header', className: 'flex items-center gap-2 mb-2' }, [
      h('span', { key: 'icon', className: 'text-lg' }, alert.icon),
      h('h5', { key: 'title', className: 'font-medium' }, alert.title)
    ]),
    h('p', { key: 'message', className: 'text-sm' }, alert.message)
  ]);
  
  // 洞察卡片组件
  const InsightCard = ({ insight }) => h('div', { className: 'bg-green-50 border border-green-200 text-green-800 rounded-lg p-4' }, [
    h('div', { key: 'header', className: 'flex items-center gap-2 mb-2' }, [
      h('span', { key: 'icon', className: 'text-lg' }, insight.icon),
      h('h5', { key: 'title', className: 'font-medium' }, insight.title)
    ]),
    h('p', { key: 'message', className: 'text-sm' }, insight.message)
  ]);
  
  // 警告和洞察
  const AlertsAndInsights = ({ calculations, data, currency }) => {
    if (!calculations) return null;
    const { profit = 0, margin = 0, paybackYears = Infinity } = calculations.profitability || {};
    const conservativeProfit = calculations.scenarios?.conservative?.profit || 0;
    const totalMemberPct = (data?.revenue?.member?.basePct || 0) + (data?.revenue?.member?.proPct || 0) + (data?.revenue?.member?.vipPct || 0);
    
    const alerts = [
      profit <= 0 && { type: 'error', title: '当前项目亏损', message: `当前配置下项目年亏损${currency}${Math.abs(profit).toLocaleString()}，需要优化收入或降低成本`, icon: '⚠️' },
      margin > 0 && margin < 5 && { type: 'warning', title: '利润率偏低', message: `当前利润率仅${margin.toFixed(1)}%，建议提高毛利率或降低运营成本`, icon: '📉' },
      conservativeProfit <= 0 && profit > 0 && { type: 'warning', title: '抗风险能力较弱', message: '保守情况下项目将出现亏损，建议增强风险抵御能力', icon: '🛡️' },
      totalMemberPct > 100 && { type: 'error', title: '会员比例设置错误', message: `会员类型比例总和为${totalMemberPct}%，不能超过100%`, icon: '❌' }
    ].filter(Boolean);
    
    const insights = [
      profit > 0 && margin >= 15 && { type: 'success', title: '盈利能力优秀', message: `当前利润率达到${margin.toFixed(1)}%，属于优秀水平，可考虑扩大规模`, icon: '🎉' },
      paybackYears < 3 && { type: 'success', title: '投资回收快速', message: `预计${paybackYears.toFixed(1)}年即可回本，投资回报周期理想`, icon: '⚡' }
    ].filter(Boolean);
    
    if (!alerts.length && !insights.length) return null;
    const colorClasses = { error: 'bg-red-50 border-red-200 text-red-800', warning: 'bg-yellow-50 border-yellow-200 text-yellow-800' };
    
    return h('div', { className: 'bg-white rounded-2xl shadow p-6' }, [
      h('h3', { key: 'title', className: 'text-lg font-semibold mb-4' }, '💡 系统提醒与洞察'),
      h('div', { key: 'content', className: 'space-y-4' }, [
        alerts.length > 0 && h('div', { key: 'alerts', className: 'space-y-3' }, alerts.map((alert, i) => h(AlertCard, { key: i, alert, colorClasses }))),
        insights.length > 0 && h('div', { key: 'insights', className: 'space-y-3' }, insights.map((insight, i) => h(InsightCard, { key: i, insight })))
      ])
    ]);
  };

  return { OverviewPage, DataActions, KeyMetrics, BusinessOverview, ScenarioQuickView, AlertsAndInsights, PageHeader, CurrencySelector, ImportButton, ChartCard, StatusIndicator, AlertCard, InsightCard };

})();
