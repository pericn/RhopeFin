// 经营概览页面 - 展示关键指标和财务状况概览
window.OverviewPage = (function() {
  
  // 简化的创建元素辅助函数
  const h = React.createElement;
  
  // 货币选择器组件
  const CurrencySelector = ({ currency, onChange }) =>
    h('div', { className: 'flex items-center gap-2' }, [
      h('label', { key: 'label', className: 'text-sm text-[var(--rilo-text-2)]' }, '货币:'),
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
    const [showDrawer, setShowDrawer] = React.useState(false);
    const resolvedCurrency = data?.basic?.currency || currency;

    const glossaryTerms = {
      cogs: { title: 'COGS / 业务成本', body: 'Cost of Goods Sold。直接随收入发生的成本（原材料、耗材、外包等），不含租金/人工等固定成本。' },
      grossMargin: { title: '综合毛利率', body: '毛利润 ÷ 总收入。反映“卖出去的东西”本身赚不赚钱。' },
      netMargin: { title: '净利润率', body: '净利润 ÷ 总收入。反映整体经营效率（扣除所有成本）。' },
      payback: { title: '回本周期', body: '初始投资 ÷ 年净利润。若净利润≤0，则视为无法回本（Infinity）。' }
    };

    // Build conclusion summary (for Inspector)
    const conclusion = h('div', { className: 'space-y-2 text-sm' }, [
      h('div', { key: 'profit' }, `净利润: ¥${calculations?.profitability?.profit ? (calculations.profitability.profit/10000).toFixed(2) : 0} 万元`),
      h('div', { key: 'margin' }, `净利润率: ${calculations?.profitability?.margin?.toFixed(1) || 0}%`),
      h('div', { key: 'payback' }, `回本周期: ${calculations?.profitability?.paybackYears === Infinity ? '无法回本' : (calculations.profitability.paybackYears || 0).toFixed(1)} 年`)
    ]);

    // Process section: detailed calculations
    const process = h(DetailedCalculationDisplay, { calculations, currency: resolvedCurrency });

    const left = h('div', { className: 'space-y-5 lg:space-y-6 rilo-zh-page' }, [
      h(PageHeader, { key: 'page-header', onOpenGlossaryFallback: () => setShowDrawer(true) }),
      h(DataActions, { key: 'data-actions', data, updateData, currency: resolvedCurrency }),
      h(KeyMetrics, { key: 'key-metrics', data, calculations, currency: resolvedCurrency, showDetails: false }),
      h(BusinessOverview, { key: 'business-overview', data, calculations, currency: resolvedCurrency }),
      h(ScenarioQuickView, { key: 'scenario-view', calculations, currency: resolvedCurrency }),
      h(AlertsAndInsights, { key: 'alerts', calculations, data, currency: resolvedCurrency }),
      h(ComprehensiveRecommendations, { key: 'comprehensive-recommendations', calculations, currency: resolvedCurrency })
    ]);

    const mainContent = window.RiloUI?.TwoPaneLayout
      ? h(window.RiloUI.TwoPaneLayout, {
          leftTitle: null,
          left,
          inspectorTitle: '财务分析 Inspector',
          conclusion,
          process,
          glossaryTerms
        })
      : left; // 保持回退逻辑

    return h(React.Fragment, null, [
      mainContent,
      !window.RiloUI?.TwoPaneLayout && window.RiloUI?.DefinitionsDrawer ? h(window.RiloUI.DefinitionsDrawer, {
        key: 'overview-drawer',
        isOpen: showDrawer,
        onClose: () => setShowDrawer(false),
        glossaryTerms: Object.assign({}, window.RiloUI.termRegistry || {}, glossaryTerms)
      }) : null
    ]);
  };

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

    return h('div', { className: 'rounded-2xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] px-5 py-4 md:px-6 md:py-5 rilo-zh-page' }, [
      h('div', { key: 'row', className: 'flex flex-col gap-3 md:flex-row md:items-start md:justify-between' }, [
        h('div', { key: 'copy' }, [
          h('h1', { key: 'title', className: 'text-3xl font-bold text-[var(--rilo-text-1)] rilo-zh-header' }, '📊 财务分析'),
          h('p', { key: 'subtitle', className: 'mt-2 max-w-2xl text-sm text-[var(--rilo-text-2)] rilo-zh-subtle' }, '先看关键结果，再通过参数设置调整变量。')
        ]),
        h('div', { key: 'actions', className: 'flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3' }, [
          h('span', { key: 'glossary-entry', className: 'text-xs text-[var(--rilo-text-3)] rilo-zh-subtle' }, '术语解释可在参数设置页打开'),
          onOpenGlossaryFallback && h(Button, {
            key: 'glossary-btn',
            onClick: openGlossary,
            ...buttonProps
          }, '📖 术语解释')
        ])
      ])
    ]);
  };

  // 数据操作区
  const DataActions = ({ data, updateData, currency = '¥' }) => {
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

    const handleCurrencyChange = (nextCurrency) => {
      updateData({
        ...data,
        basic: {
          ...(data?.basic || {}),
          currency: nextCurrency
        }
      });
    };
    
    return h('div', { className: 'bg-[var(--rilo-surface-1)] rounded-2xl border border-[var(--rilo-border-deep)] shadow-sm p-4 lg:p-5 rilo-zh-page' }, [
      h('div', { key: 'actions', className: 'flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between' }, [
        h('div', { key: 'currency', className: 'flex items-center gap-3' }, [
          h('span', { key: 'label', className: 'text-sm text-[var(--rilo-text-3)] rilo-zh-subtle' }, '工具区'),
          h(CurrencySelector, { key: 'currency-selector', currency, onChange: handleCurrencyChange })
        ]),
        h('div', { key: 'buttons', className: 'flex flex-wrap justify-start gap-3 lg:justify-end' }, [
          h(window.UIComponents.Button, { key: 'export', onClick: actions.exportData, variant: 'outline', size: 'small' }, '📤 导出数据'),
          h(ImportButton, { key: 'import', onImport: handleImport }),
          h(window.UIComponents.Button, { key: 'clear', onClick: actions.clearData, variant: 'danger', size: 'small' }, '🗑️ 清除数据')
        ])
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
    
    return h('div', { className: 'bg-[var(--rilo-surface-2)] rounded-2xl border border-[var(--rilo-border-deep)] p-4 rilo-zh-page' }, [
      h('h3', { key: 'title', className: 'mb-3 text-md font-semibold text-[var(--rilo-text-1)]' }, '🧮 详细计算过程'),
      
      // 收入计算展示
      h('div', { key: 'revenue-calc', className: 'mb-4' }, [
        h('h4', { key: 'title', className: 'text-sm font-medium text-blue-700 mb-2' }, '💰 收入计算'),
        h('div', { key: 'breakdown', className: 'text-xs text-[var(--rilo-text-2)] space-y-1' }, [
          revenue?.member && h('div', { key: 'member' }, `会员收入: ¥${(revenue.member / 10000).toFixed(2)}万`),
          revenue?.boarding && h('div', { key: 'boarding' }, `寄养收入: ¥${(revenue.boarding / 10000).toFixed(2)}万`),
          revenue?.medical && h('div', { key: 'medical' }, `医疗收入: ¥${(revenue.medical / 10000).toFixed(2)}万`),
          revenue?.retail && h('div', { key: 'retail' }, `零售收入: ¥${(revenue.retail / 10000).toFixed(2)}万`),
          revenue?.cafe && h('div', { key: 'cafe' }, `餐饮收入: ¥${(revenue.cafe / 10000).toFixed(2)}万`),
          h('div', { key: 'total', className: 'font-medium border-t border-[var(--rilo-border-deep)] pt-1 mt-2' }, 
            `总收入 = ¥${(revenue.total / 10000).toFixed(2)}万`)
        ])
      ]),
      
      // 业务成本计算展示
      h('div', { key: 'cogs-calc', className: 'mb-4' }, [
        h('h4', { key: 'title', className: 'text-sm font-medium text-orange-700 mb-2' }, '📋 业务成本 (COGS) 计算'),
        h('div', { key: 'breakdown', className: 'text-xs text-[var(--rilo-text-2)] space-y-1' }, [
          cost?.cogs?.member && h('div', { key: 'member' }, `会员业务成本: ¥${(cost.cogs.member / 10000).toFixed(2)}万`),
          cost?.cogs?.boarding && h('div', { key: 'boarding' }, `寄养业务成本: ¥${(cost.cogs.boarding / 10000).toFixed(2)}万`),
          cost?.cogs?.medical && h('div', { key: 'medical' }, `医疗业务成本: ¥${(cost.cogs.medical / 10000).toFixed(2)}万`),
          cost?.cogs?.retail && h('div', { key: 'retail' }, `零售业务成本: ¥${(cost.cogs.retail / 10000).toFixed(2)}万`),
          cost?.cogs?.cafe && h('div', { key: 'cafe' }, `餐饮业务成本: ¥${(cost.cogs.cafe / 10000).toFixed(2)}万`),
          h('div', { key: 'total', className: 'font-medium border-t border-[var(--rilo-border-deep)] pt-1 mt-2' }, 
            `业务成本总计 = ¥${(cogs / 10000).toFixed(2)}万`)
        ])
      ]),
      
      // 毛利润计算
      h('div', { key: 'gross-profit-calc', className: 'mb-4' }, [
        h('h4', { key: 'title', className: 'text-sm font-medium text-[var(--rilo-accent)] mb-2' }, '📊 毛利润计算'),
        h('div', { key: 'formula', className: 'text-xs text-[var(--rilo-text-2)]' }, [
          h('div', { key: 'calc' }, `毛利润 = 总收入 - 业务成本`),
          h('div', { key: 'numbers' }, `= ¥${(revenue.total / 10000).toFixed(2)}万 - ¥${(cogs / 10000).toFixed(2)}万`),
          h('div', { key: 'result', className: 'font-medium text-[var(--rilo-accent)]' }, `= ¥${(grossProfit / 10000).toFixed(2)}万`),
          h('div', { key: 'margin', className: 'mt-1' }, 
            `综合毛利率 = ${revenue.total > 0 ? ((grossProfit / revenue.total) * 100).toFixed(1) : 0}%`)
        ])
      ]),
      
      // 运营成本计算
      h('div', { key: 'operating-costs', className: 'mb-4' }, [
        h('h4', { key: 'title', className: 'text-sm font-medium text-[var(--rilo-sem-danger)] mb-2' }, '💸 运营成本计算'),
        h('div', { key: 'breakdown', className: 'text-xs text-[var(--rilo-text-2)] space-y-1' }, [
          h('div', { key: 'fixed' }, `固定成本: ¥${(fixed / 10000).toFixed(2)}万 (租金、人工等)`),
          h('div', { key: 'variable' }, `变动成本: ¥${(variable / 10000).toFixed(2)}万 (水电、其他)`),
          h('div', { key: 'total', className: 'font-medium border-t border-[var(--rilo-border-deep)] pt-1 mt-2' }, 
            `运营成本总计 = ¥${((fixed + variable) / 10000).toFixed(2)}万`)
        ])
      ]),
      
      // 净利润计算
      h('div', { key: 'net-profit-calc', className: 'mb-4' }, [
        h('h4', { key: 'title', className: 'text-sm font-medium text-[var(--rilo-accent)] mb-2' }, '📈 净利润计算'),
        h('div', { key: 'formula', className: 'text-xs text-[var(--rilo-text-2)]' }, [
          h('div', { key: 'calc' }, `净利润 = 毛利润 - 运营成本`),
          h('div', { key: 'numbers' }, `= ¥${(grossProfit / 10000).toFixed(2)}万 - ¥${((fixed + variable) / 10000).toFixed(2)}万`),
          h('div', { key: 'result', className: `font-medium ${netProfit > 0 ? 'text-[var(--rilo-sem-success)]' : 'text-[var(--rilo-sem-danger)]'}` }, 
            `= ¥${(netProfit / 10000).toFixed(2)}万`),
          h('div', { key: 'margin', className: 'mt-1' }, 
            `净利润率 = ${revenue.total > 0 ? ((netProfit / revenue.total) * 100).toFixed(1) : 0}%`)
        ])
      ]),
      
      // 投资回报计算
      investment?.total > 0 && h('div', { key: 'roi-calc', className: 'mb-4' }, [
        h('h4', { key: 'title', className: 'text-sm font-medium text-purple-700 mb-2' }, '💎 投资回报计算'),
        h('div', { key: 'formula', className: 'text-xs text-[var(--rilo-text-2)]' }, [
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
  // 已添加 RevPAR（每间可售房晚收入）作为次级指标：ADR × 入住率（%）
  const KeyMetrics = ({ data, calculations, currency, showDetails = true }) => {
    if (!calculations) return null;
    const Term = window.RiloUI?.Term;
    const { revenue, cost, profitability, investment } = calculations;
    const profit = profitability?.profit || 0;
    const margin = profitability?.margin || 0;
    const paybackYears = profitability?.paybackYears ?? Infinity;
    
    // 计算毛利润相关指标
    const cogs = cost?.cogs?.total || 0;
    const grossProfit = (revenue?.total || 0) - cogs;
    const grossMargin = revenue?.total > 0 ? (grossProfit / revenue.total) * 100 : 0;

    // RevPAR（每间可售房晚收入）= ADR × 入住率
    const adr = Number(data?.revenue?.boarding?.adr) || 0;
    const occPctRaw = Number(data?.revenue?.boarding?.occ);
    const occPct = isNaN(occPctRaw) ? 0 : Math.min(Math.max(occPctRaw, 0), 100);
    const revpar = adr * (occPct / 100);

    // Unit economics (simple): LTV:CAC from settings assumptions
    const cac = data?.assumptions?.cac ?? 0;
    const ltv = data?.assumptions?.ltv ?? 0;
    const ltvCac = cac > 0 ? (ltv / cac) : null;
    const rooms = Number(data?.revenue?.boarding?.rooms) || 0;
    const days = Number(data?.basic?.daysPerYear) || 0;
    const boardingMarginPct = Number(data?.cost?.margins?.boarding) || 0;
    const otherCogs = Math.max(0, (cost?.cogs?.total || 0) - (cost?.cogs?.boarding || 0));
    const breakevenOccDenominator = rooms * days * adr * (boardingMarginPct / 100);
    const breakevenOcc = breakevenOccDenominator > 0
      ? ((cost?.fixed?.total || 0) + (cost?.variable?.total || 0) + otherCogs) / breakevenOccDenominator * 100
      : null;
    const soldRoomNights = rooms * days * (occPct / 100);
    const cmPerRoomNight = soldRoomNights > 0
      ? (((revenue?.boarding || 0) - (cost?.cogs?.boarding || 0)) / soldRoomNights)
      : 0;
    const rentToSales = revenue?.total > 0 ? ((cost?.fixed?.rent || 0) / revenue.total) * 100 : 0;
    const titleNode = (termKey, text) => Term ? h(Term, { termKey }, text) : text;
    
    const metrics = [
      [// 主要指标（成本前置：确保总成本上主行）
        { key: 'revenue', title: '年总营收', value: revenue?.total ? (revenue.total / 10000).toFixed(2) : 0, suffix: '万元', color: 'success', size: 'large' },
        { key: 'total-cost', title: '年总成本', value: cost?.total ? (cost.total / 10000).toFixed(2) : 0, suffix: '万元', color: 'danger' },
        { key: 'gross-profit', title: '毛利润', value: grossProfit ? (grossProfit / 10000).toFixed(2) : 0, suffix: '万元', color: grossProfit > 0 ? 'info' : 'danger', size: 'large' },
        { key: 'gross-margin', title: titleNode('grossMargin', '综合毛利率'), value: grossMargin.toFixed(1), suffix: '%', color: grossMargin > 0 ? 'info' : 'danger' }
      ],
      [// 运营指标（下沉 COGS，保持净利与净利率，并加入 RevPAR 次级位）
        { key: 'cogs', title: '业务成本', value: cogs ? (cogs / 10000).toFixed(2) : 0, suffix: '万元', color: 'warning' },
        { key: 'revpar', title: titleNode('revpar', '每间可售房晚收入'), value: revpar.toFixed(0), suffix: '元/间夜', color: 'info' },
        { key: 'profit', title: titleNode('profit', '年净利润'), value: profit ? (profit / 10000).toFixed(2) : 0, suffix: '万元', color: profit > 0 ? 'success' : 'danger' },
        { key: 'margin', title: titleNode('netMargin', '净利润率'), value: margin.toFixed(2), suffix: '%', color: margin > 0 ? 'success' : 'danger' }
      ],
      [// 投资指标（ROI 不进入主 KPI，保留回本周期）  
        { key: 'investment', title: '初始投资', value: investment?.total ? (investment.total / 10000).toFixed(2) : 0, suffix: '万元', color: 'info' },
        { key: 'payback', title: titleNode('payback', '投资回本周期'), value: paybackYears === Infinity ? '无法回本' : `${paybackYears.toFixed(1)}年`, 
          color: paybackYears < 3 ? 'success' : paybackYears < 5 ? 'warning' : 'danger' },
        { key: 'monthly-cashflow', title: '月度现金流', value: profit ? (profit / 12 / 10000).toFixed(2) : 0, suffix: '万元', color: profit > 0 ? 'success' : 'danger' },
        { key: 'ltv-cac', title: 'LTV:CAC', value: ltvCac === null ? '—' : ltvCac.toFixed(1), suffix: 'x', color: ltvCac !== null && ltvCac >= 3 ? 'success' : ltvCac !== null && ltvCac >= 1 ? 'warning' : 'danger' }
      ]
    ];

    const phaseOneMetrics = [
      { key: 'rent-to-sales', title: titleNode('rentToSales', '租金占收比'), value: rentToSales.toFixed(1), suffix: '%', color: rentToSales <= 15 ? 'success' : rentToSales <= 25 ? 'warning' : 'danger' },
      { key: 'breakeven-occ', title: titleNode('breakevenOcc', '盈亏平衡入住率'), value: breakevenOcc === null ? '—' : breakevenOcc.toFixed(1), suffix: breakevenOcc === null ? '' : '%', color: breakevenOcc !== null && breakevenOcc <= 70 ? 'success' : breakevenOcc !== null && breakevenOcc <= 100 ? 'warning' : 'danger' },
      { key: 'cm-per-room-night', title: titleNode('cmPerRoomNight', '每间夜贡献利润'), value: cmPerRoomNight.toFixed(0), suffix: '元/间夜', color: cmPerRoomNight >= 0 ? 'info' : 'danger' },
      { key: 'acquisition-efficiency', title: titleNode('acquisitionEfficiency', '获客效率'), value: ltvCac === null ? '—' : ltvCac.toFixed(1), suffix: ltvCac === null ? '' : 'x', color: ltvCac !== null && ltvCac >= 3 ? 'success' : ltvCac !== null && ltvCac >= 1 ? 'warning' : 'danger' }
    ];

    return h('div', { className: 'rounded-2xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] p-5 shadow-sm rilo-zh-page' }, [
      h('h2', { key: 'title', className: 'mb-5 text-lg font-semibold text-[var(--rilo-text-1)] rilo-zh-header' }, '📊 关键财务指标'),
      h('div', { key: 'primary', className: 'rilo-kpi-grid-tight mb-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4' },
        metrics[0].map(metric => h(window.UIComponents.KPI, { key: metric.key, ...metric }))),
      h('div', { key: 'secondary', className: 'rilo-kpi-grid-tight mb-3 grid grid-cols-1 gap-3 md:grid-cols-3' },
        metrics[1].map(metric => h(window.UIComponents.KPI, { key: metric.key, ...metric }))),
      h('div', { key: 'tertiary', className: 'rilo-kpi-grid-tight mb-3 grid grid-cols-1 gap-3 md:grid-cols-4' },
        metrics[2].map(metric => h(window.UIComponents.KPI, { key: metric.key, ...metric }))),
      h('div', { key: 'phase-one-header', className: 'mb-3 mt-5 flex items-center justify-between gap-3' }, [
        h('h3', { key: 'title', className: 'text-base font-semibold text-[var(--rilo-text-1)]' }, 'Phase 1 扩展 KPI'),
        h('span', { key: 'hint', className: 'text-xs text-[var(--rilo-text-3)] rilo-zh-subtle' }, '补齐 Phase 1：租金效率、盈亏平衡、单间夜贡献、获客效率')
      ]),
      h('div', { key: 'phase-one-grid', className: 'rilo-kpi-grid-tight mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4' },
        phaseOneMetrics.map(metric => h(window.UIComponents.KPI, { key: metric.key, ...metric }))),
      showDetails && h(DetailedCalculationDisplay, { key: 'detailed-calc', calculations, currency }),
      h(StatusIndicator, { key: 'status', profit })
    ]);
  };

  const ComprehensiveRecommendations = ({ calculations, currency }) => {
    if (!calculations?.comprehensive) return null;

    const comprehensive = calculations.comprehensive;
    const InsightCard = window.RiloUI?.InsightCard;
    const RecommendationCard = window.RiloUI?.RecommendationCard;
    const health = comprehensive.healthScore || { score: 0, grade: '—', description: '暂无' };
    const guidance = comprehensive.investmentGuidance || {};
    const recommendationLabelMap = {
      proceed: '建议推进',
      hold: '建议观察',
      reject: '建议谨慎 / 暂缓'
    };

    return h('div', { className: 'space-y-5 rounded-2xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] p-5 shadow-sm rilo-zh-page' }, [
      h('div', { key: 'header', className: 'flex flex-col gap-2 md:flex-row md:items-end md:justify-between' }, [
        h('div', { key: 'copy' }, [
          h('h2', { key: 'title', className: 'text-xl font-semibold text-[var(--rilo-text-1)]' }, '🧭 综合建议'),
          h('p', { key: 'subtitle', className: 'text-sm text-[var(--rilo-text-2)]' }, '汇总健康度、投资建议、风险指标与优化动作，方便先看方向再下钻。')
        ]),
        h('div', { key: 'score', className: 'rounded-2xl bg-[var(--rilo-surface-2)] px-4 py-3 text-right' }, [
          h('div', { key: 'label', className: 'text-xs uppercase tracking-wide text-[var(--rilo-text-3)]' }, '健康度评分'),
          h('div', { key: 'value', className: 'text-2xl font-bold text-[var(--rilo-text-1)]' }, `${health.score} / 100 · ${health.grade}`),
          h('div', { key: 'desc', className: 'text-sm text-[var(--rilo-text-2)]' }, health.description)
        ])
      ]),
      h('div', { key: 'grid', className: 'grid grid-cols-1 gap-4 lg:grid-cols-2' }, [
        h('div', { key: 'guidance', className: 'rounded-2xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-2)] p-4' }, [
          h('h3', { key: 'title', className: 'text-base font-semibold text-[var(--rilo-text-1)]' }, '投资建议'),
          h('div', { key: 'recommendation', className: 'mt-2 text-lg font-semibold text-[var(--rilo-text-1)]' }, recommendationLabelMap[guidance.recommendation] || '建议补充数据'),
          h('div', { key: 'confidence', className: 'mt-1 text-sm text-[var(--rilo-text-2)]' }, `置信度：${guidance.confidenceLevel ?? 0}%`),
          h('ul', { key: 'reasons', className: 'mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--rilo-text-2)]' }, (guidance.reasons || []).map((reason, index) =>
            h('li', { key: `reason-${index}` }, reason)
          ))
        ]),
        h('div', { key: 'risks', className: 'rounded-2xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-2)] p-4' }, [
          h('h3', { key: 'title', className: 'text-base font-semibold text-[var(--rilo-text-1)]' }, '风险指标'),
          (comprehensive.riskIndicators || []).length > 0
            ? h('div', { key: 'items', className: 'mt-3 space-y-3' }, comprehensive.riskIndicators.map((risk, index) =>
                InsightCard
                  ? h(InsightCard, {
                      key: `risk-${index}`,
                      insight: {
                        type: risk.level === 'high' || risk.level === 'critical' ? 'danger' : 'warning',
                        title: risk.type || '风险提示',
                        message: risk.message || risk.description || '请关注该风险项'
                      }
                    })
                  : h('div', {
                      key: `risk-${index}`,
                      className: 'rounded-xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] p-3'
                    }, [
                      h('div', { key: 'title', className: 'font-semibold text-[var(--rilo-text-1)]' }, risk.type || '风险提示'),
                      h('div', { key: 'message', className: 'mt-1 text-sm text-[var(--rilo-text-2)]' }, risk.message || risk.description || '请关注该风险项')
                    ])
              ))
            : h('div', { key: 'empty', className: 'mt-3 text-sm text-[var(--rilo-text-3)]' }, '当前未识别到高优先级风险指标。')
        ])
      ]),
      h('div', { key: 'suggestions', className: 'rounded-2xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-2)] p-4' }, [
        h('h3', { key: 'title', className: 'text-base font-semibold text-[var(--rilo-text-1)]' }, '优化建议'),
        (comprehensive.improvementSuggestions || []).length > 0
          ? h('div', { key: 'items', className: 'mt-3 space-y-3' }, comprehensive.improvementSuggestions.map((suggestion, index) =>
              RecommendationCard
                ? h(RecommendationCard, {
                    key: `suggestion-${index}`,
                    recommendation: {
                      priority: suggestion.priority || 'medium',
                      icon: '🛠️',
                      title: suggestion.title || suggestion.category || '优化建议',
                      content: suggestion.description || '建议结合右侧过程与术语继续核对。'
                    }
                  })
                : h('div', {
                    key: `suggestion-${index}`,
                    className: 'rounded-xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] p-3'
                  }, [
                    h('div', { key: 'title', className: 'font-semibold text-[var(--rilo-text-1)]' }, suggestion.title || suggestion.category || '优化建议'),
                    h('div', { key: 'content', className: 'mt-1 text-sm text-[var(--rilo-text-2)]' }, suggestion.description || '建议结合右侧过程与术语继续核对。')
                  ])
            ))
          : h('div', { key: 'empty', className: 'mt-3 text-sm text-[var(--rilo-text-3)]' }, '当前暂无额外优化建议。')
      ]),
      window.ScenarioRecommendations?.ScenarioRecommendations
        ? h(window.ScenarioRecommendations.ScenarioRecommendations, {
            key: 'scenario-recommendations',
            calculations,
            currency
          })
        : null
    ]);
  };

  // 业务概览
  const BusinessOverview = ({ data, calculations, currency }) => {
    if (!calculations) return null;
    
    return h('div', { className: 'grid grid-cols-1 gap-5 lg:grid-cols-2' }, [
      h(window.RiloUI.ChartCard, { key: 'revenue', title: '💰 收入结构分析' },
        h(window.ChartComponents.RevenueStructureChart, { calculations, currency })
      ),
      h(window.RiloUI.ChartCard, { key: 'cost', title: '💸 成本结构分析' },
        h(window.ChartComponents.CostStructureChart, { calculations, currency })
      ),
      h(window.RiloUI.ChartCard, { key: 'breakeven', title: '⚖️ 盈亏平衡分析' },
        window.ChartComponents.BreakevenSVGChart
          ? h(window.ChartComponents.BreakevenSVGChart, { calculations, currency })
          : h(window.ChartComponents.BreakevenChart, { calculations, currency })
      )
    ]);
  };

  // 情景快速预览
  const ScenarioQuickView = ({ calculations, currency }) => {
    if (!calculations?.scenarios) return null;
    
    return h(window.RiloUI.ChartCard, { title: '🎯 情景分析预览' },
      h(window.ChartComponents.ScenarioComparisonChart, { calculations, currency })
    );
  };

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
    
    return h('div', { className: 'rounded-2xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] p-5 shadow-sm rilo-zh-page' }, [
      h('h3', { key: 'title', className: 'mb-4 text-lg font-semibold text-[var(--rilo-text-1)] rilo-zh-header' }, '💡 系统提醒与洞察'),
      h('div', { key: 'content', className: 'space-y-4' }, [
        alerts.length > 0 && h('div', { key: 'alerts', className: 'space-y-3' }, alerts.map((alert, i) => h(window.RiloUI.AlertCard, { key: i, alert, colorClasses }))),
        insights.length > 0 && h('div', { key: 'insights', className: 'space-y-3' }, insights.map((insight, i) => h(window.RiloUI.InsightCard, { key: i, insight })))
      ])
    ]);
  };

  return { OverviewPage, DataActions, KeyMetrics, BusinessOverview, ScenarioQuickView, AlertsAndInsights, PageHeader, CurrencySelector, ImportButton, StatusIndicator };

})();
