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
    const resolvedCurrency = data?.basic?.currency || currency;

    const glossaryTerms = {}; // 统一走 shared term-registry；本页不再覆写全局术语定义

    const conclusion = null;

    // Process section: detailed calculations
    const process = h(DetailedCalculationDisplay, { calculations, currency: resolvedCurrency });

    const left = h('div', { className: 'space-y-4 lg:space-y-5 rilo-zh-page' }, [
      h(KeyMetrics, { key: 'key-metrics', data, calculations, currency: resolvedCurrency, showDetails: false }),
      h(BusinessOverview, { key: 'business-overview', data, currency: resolvedCurrency }),
      h(ScenarioQuickView, { key: 'scenario-view', calculations, currency: resolvedCurrency })
    ]);

    const mainContent = window.RiloUI?.TwoPaneLayout
      ? h(window.RiloUI.TwoPaneLayout, {
          leftTitle: null,
          left,
          inspectorTitle: '项目概况',
          conclusion,
          process,
          glossaryTerms
        })
      : left; // 保持回退逻辑

    return h(React.Fragment, null, [mainContent]);
  };

  const SectionHeader = ({ eyebrow, title, subtitle, aside }) =>
    h('div', { className: 'flex flex-col gap-2 md:flex-row md:items-end md:justify-between' }, [
      h('div', { key: 'copy', className: 'space-y-1' }, [
        eyebrow && h('div', { key: 'eyebrow', className: 'text-[11px] uppercase tracking-[0.22em] text-[var(--rilo-text-3)]' }, eyebrow),
        h('h2', { key: 'title', className: 'text-lg font-semibold text-[var(--rilo-text-1)] rilo-zh-header' }, title),
        subtitle && h('p', { key: 'subtitle', className: 'text-sm text-[var(--rilo-text-2)] rilo-zh-subtle max-w-3xl' }, subtitle)
      ]),
      aside ? h('div', { key: 'aside', className: 'text-xs text-[var(--rilo-text-3)] rilo-zh-subtle md:text-right' }, aside) : null
    ]);



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
    
    return h('div', { className: 'rilo-ledger-panel rounded-2xl border border-[var(--rilo-border-deep)] shadow-sm p-4 lg:p-5 rilo-zh-page' }, [
      h('div', { key: 'actions', className: 'flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between' }, [
        h('div', { key: 'currency', className: 'flex items-center gap-3' }, [
          h('span', { key: 'label', className: 'text-sm text-[var(--rilo-text-3)] rilo-zh-subtle' }, '工具区'),
          h(CurrencySelector, { key: 'currency-selector', currency, onChange: handleCurrencyChange })
        ]),
        h('div', { key: 'buttons', className: 'flex flex-wrap justify-start gap-3 lg:justify-end' }, [
          h(window.UIComponents.Button, { key: 'export', onClick: actions.exportData, variant: 'outline', size: 'small' }, '导出数据'),
          h(ImportButton, { key: 'import', onImport: handleImport }),
          h(window.UIComponents.Button, { key: 'clear', onClick: actions.clearData, variant: 'danger', size: 'small' }, '清除数据')
        ])
      ])
    ]);
  };

  // 详细计算过程展示组件
  const DetailedCalculationDisplay = ({ calculations, currency }) => {
    if (!calculations) return null;
    
    const { revenue, cost, profitability, investment } = calculations;
    const cogs = cost?.cogs?.total || 0;
    const fixed = cost?.fixed?.total || 0;
    const variable = cost?.variable?.total || 0;
    const grossProfit = (revenue?.total || 0) - cogs;
    const netProfit = profitability?.profit || 0;
    
    return h('div', { className: 'bg-[var(--rilo-surface-2)] rounded-2xl border border-[var(--rilo-border-deep)] p-4 rilo-zh-page' }, [
      h('h3', { key: 'title', className: 'mb-3 text-md font-semibold text-[var(--rilo-text-1)]' }, '详细计算过程'),
      
      // 收入计算展示
      h('div', { key: 'revenue-calc', className: 'mb-4' }, [
        h('h4', { key: 'title', className: 'text-sm font-medium text-[var(--rilo-value-info)] mb-2' }, '收入计算'),
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
        h('h4', { key: 'title', className: 'text-sm font-medium text-[var(--rilo-value-warning)] mb-2' }, '业务成本（COGS）计算'),
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
        h('h4', { key: 'title', className: 'text-sm font-medium text-[var(--rilo-value-info)] mb-2' }, '毛利润计算'),
        h('div', { key: 'formula', className: 'text-xs text-[var(--rilo-text-2)]' }, [
          h('div', { key: 'calc' }, `毛利润 = 总收入 - 业务成本`),
          h('div', { key: 'numbers' }, `= ¥${(revenue.total / 10000).toFixed(2)}万 - ¥${(cogs / 10000).toFixed(2)}万`),
          h('div', { key: 'result', className: 'font-medium text-[var(--rilo-value-info)]' }, `= ¥${(grossProfit / 10000).toFixed(2)}万`),
          h('div', { key: 'margin', className: 'mt-1' }, 
            `综合毛利率 = ${revenue.total > 0 ? ((grossProfit / revenue.total) * 100).toFixed(1) : 0}%`)
        ])
      ]),
      
      // 运营成本计算
      h('div', { key: 'operating-costs', className: 'mb-4' }, [
        h('h4', { key: 'title', className: 'text-sm font-medium text-[var(--rilo-value-danger)] mb-2' }, '运营成本计算'),
        h('div', { key: 'breakdown', className: 'text-xs text-[var(--rilo-text-2)] space-y-1' }, [
          h('div', { key: 'fixed' }, `固定成本: ¥${(fixed / 10000).toFixed(2)}万 (租金、人工等)`),
          h('div', { key: 'variable' }, `变动成本: ¥${(variable / 10000).toFixed(2)}万 (水电、其他)`),
          h('div', { key: 'total', className: 'font-medium border-t border-[var(--rilo-border-deep)] pt-1 mt-2' }, 
            `运营成本总计 = ¥${((fixed + variable) / 10000).toFixed(2)}万`)
        ])
      ]),
      
      // 净利润计算
      h('div', { key: 'net-profit-calc', className: 'mb-4' }, [
        h('h4', { key: 'title', className: 'text-sm font-medium text-[var(--rilo-value-info)] mb-2' }, '净利润计算'),
        h('div', { key: 'formula', className: 'text-xs text-[var(--rilo-text-2)]' }, [
          h('div', { key: 'calc' }, `净利润 = 毛利润 - 运营成本`),
          h('div', { key: 'numbers' }, `= ¥${(grossProfit / 10000).toFixed(2)}万 - ¥${((fixed + variable) / 10000).toFixed(2)}万`),
          h('div', { key: 'result', className: `font-medium ${netProfit > 0 ? 'text-[var(--rilo-value-success)]' : 'text-[var(--rilo-value-danger)]'}` }, 
            `= ¥${(netProfit / 10000).toFixed(2)}万`),
          h('div', { key: 'margin', className: 'mt-1' }, 
            `净利润率 = ${revenue.total > 0 ? ((netProfit / revenue.total) * 100).toFixed(1) : 0}%`)
        ])
      ]),
      
      // 投资回报计算
      investment?.total > 0 && h('div', { key: 'roi-calc', className: 'mb-4' }, [
        h('h4', { key: 'title', className: 'text-sm font-medium text-[var(--rilo-value-info)] mb-2' }, '投资回报计算'),
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
  const StatusIndicator = () => null;
  
  // 关键指标展示
  // 已添加 RevPAR（每间可售房晚收入）作为次级指标：ADR × 入住率（%）
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
    const titleNode = (termKey, text) => {
      const Term = window.RiloUI?.Term;
      if (!Term) return text;
      return React.createElement(Term, { termKey }, text);
    };
    
    const metricGroups = [
      {
        key: 'primary',
        eyebrow: 'Core KPI',
        title: '全局关键指标',
        subtitle: null,
        aside: null,
        gridClassName: 'rilo-kpi-grid-tight grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3',
        items: [
          { key: 'revenue', title: '年总营收', value: revenue?.total ? (revenue.total / 10000).toFixed(2) : 0, suffix: '万元', color: 'success', size: 'large' },
          { key: 'total-cost', title: '年总成本', value: cost?.total ? (cost.total / 10000).toFixed(2) : 0, suffix: '万元', color: 'danger' },
          { key: 'gross-profit', title: '毛利润', value: grossProfit ? (grossProfit / 10000).toFixed(2) : 0, suffix: '万元', color: grossProfit > 0 ? 'info' : 'danger' },
          { key: 'profit', title: titleNode('profit', '年净利润'), value: profit ? (profit / 10000).toFixed(2) : 0, suffix: '万元', color: profit > 0 ? 'success' : 'danger' },
          { key: 'margin', title: titleNode('netMargin', '净利润率'), value: margin.toFixed(1), suffix: '%', color: margin > 0 ? 'success' : 'danger' },
          { key: 'payback', title: titleNode('payback', '回本周期'), value: paybackYears === Infinity ? '无法回本' : `${paybackYears.toFixed(1)}年`, color: paybackYears < 3 ? 'success' : paybackYears < 5 ? 'warning' : 'danger' }
        ]
      }
    ];

    return h('div', { className: 'rounded-2xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] p-5 shadow-sm rilo-zh-page' }, [
      ...metricGroups.map((group, index) =>
        h('section', { key: group.key, className: index === 0 ? 'space-y-3' : 'mt-6 space-y-3' }, [
          h('div', { key: 'group-header', className: 'flex flex-col gap-1 md:flex-row md:items-end md:justify-between' }, [
            h('div', { key: 'copy' }, [
              h('div', { key: 'eyebrow', className: 'text-[11px] uppercase tracking-[0.22em] text-[var(--rilo-text-3)]' }, group.eyebrow),
              h('h3', { key: 'title', className: 'text-base font-semibold text-[var(--rilo-text-1)]' }, group.title),
              h('p', { key: 'subtitle', className: 'text-sm text-[var(--rilo-text-2)] rilo-zh-subtle' }, group.subtitle)
            ]),
            group.aside ? h('div', { key: 'aside', className: 'text-xs text-[var(--rilo-text-3)] rilo-zh-subtle md:max-w-xs md:text-right' }, group.aside) : null
          ]),
          h('div', { key: 'grid', className: group.gridClassName },
            group.items.map(metric => h(window.UIComponents.KPI, { key: metric.key, ...metric })))
        ])
      ),
      showDetails && h('details', {
        key: 'advanced-calc',
        className: 'mt-6 rounded-2xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-2)] px-4 py-3'
      }, [
        h('summary', {
          key: 'summary',
          className: 'cursor-pointer list-none text-sm font-medium text-[var(--rilo-text-1)]'
        }, '高级：详细计算过程'),
        h('div', { key: 'body', className: 'mt-4' },
          h(DetailedCalculationDisplay, { calculations, currency: resolvedCurrency })
        )
      ]),
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
      proceed: '推进',
      hold: '观察',
      reject: '暂缓'
    };

    return h('div', { className: 'space-y-5 rounded-2xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] p-5 shadow-sm rilo-zh-page' }, [
      h('div', { key: 'header', className: 'flex flex-col gap-2 md:flex-row md:items-end md:justify-between' }, [
        h('div', { key: 'copy' }, [
          h('h2', { key: 'title', className: 'text-xl font-semibold text-[var(--rilo-text-1)]' }, '综合状态'),
          h('p', { key: 'subtitle', className: 'text-sm text-[var(--rilo-text-2)]' }, '汇总评分、风险读数与结构信息。')
        ]),
        h('div', { key: 'score', className: 'rounded-2xl bg-[var(--rilo-surface-2)] px-4 py-3 text-right' }, [
          h('div', { key: 'label', className: 'text-xs uppercase tracking-wide text-[var(--rilo-text-3)]' }, '综合评分'),
          h('div', { key: 'value', className: 'text-2xl font-bold text-[var(--rilo-text-1)]' }, `${health.score} / 100 · ${health.grade}`),
          h('div', { key: 'desc', className: 'text-sm text-[var(--rilo-text-2)]' }, health.description)
        ])
      ]),
      h('div', { key: 'grid', className: 'grid grid-cols-1 gap-4 lg:grid-cols-2' }, [
        h('div', { key: 'guidance', className: 'rounded-2xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-2)] p-4' }, [
          h('h3', { key: 'title', className: 'text-base font-semibold text-[var(--rilo-text-1)]' }, '模型输出'),
          h('div', { key: 'recommendation', className: 'mt-2 text-lg font-semibold text-[var(--rilo-text-1)]' }, recommendationLabelMap[guidance.recommendation] || '待补充数据'),
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
        h('h3', { key: 'title', className: 'text-base font-semibold text-[var(--rilo-text-1)]' }, '补充说明'),
        (comprehensive.improvementSuggestions || []).length > 0
          ? h('div', { key: 'items', className: 'mt-3 space-y-3' }, comprehensive.improvementSuggestions.map((suggestion, index) =>
              RecommendationCard
                ? h(RecommendationCard, {
                    key: `suggestion-${index}`,
                    recommendation: {
                      priority: suggestion.priority || 'medium',
                      icon: '',
                      title: suggestion.title || suggestion.category || '补充说明',
                      content: suggestion.description || '可结合右侧过程与术语继续核对。'
                    }
                  })
                : h('div', {
                    key: `suggestion-${index}`,
                    className: 'rounded-xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] p-3'
                  }, [
                    h('div', { key: 'title', className: 'font-semibold text-[var(--rilo-text-1)]' }, suggestion.title || suggestion.category || '补充说明'),
                    h('div', { key: 'content', className: 'mt-1 text-sm text-[var(--rilo-text-2)]' }, suggestion.description || '可结合右侧过程与术语继续核对。')
                  ])
            ))
          : h('div', { key: 'empty', className: 'mt-3 text-sm text-[var(--rilo-text-3)]' }, '当前暂无额外补充信息。')
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
  // 收入结构条形图（同步计算，不依赖父组件 state）
  const InlineRevenueChart = ({ currency }) => {
    const revData = (() => { console.log("InlineRevenueChart IIFE running");
      try {
        const dm = window.dataManager;
        const calc = window.calculator;
        if (dm && calc) {
          const data = dm.getInitialData();
          if (data) {
            const result = calc.calculate(data);
            return result;
          }
        }
      } catch(e) {}
      return null;
    })();
    
    const rev = revData?.revenue || {};
    const total = rev.total || 0;
    if (!revData || total <= 0) {
      return h('div', { className: 'text-center py-6 text-[var(--rilo-text-3)] text-sm' }, '暂无收入数据');
    }
    const items = [
      { name: '会员收入', value: rev.member || 0, color: '#8b7355' },
      { name: '寄养收入', value: rev.boarding || 0, color: '#6b8e6b' },
      { name: '医疗收入', value: rev.medical || 0, color: '#7a8a9a' },
      { name: '零售收入', value: rev.retail || 0, color: '#9a8a7a' },
      { name: '餐饮收入', value: rev.cafe || 0, color: '#8a7a6a' }
    ].filter(i => i.value > 0);
    const maxVal = Math.max(...items.map(i => i.value), 1);
    return h('div', { className: 'space-y-3' }, [
      h('div', { key: 'bars', className: 'space-y-2.5' },
        items.map(item => {
          const pct = (item.value / total * 100).toFixed(1);
          return h('div', { key: item.name, className: 'space-y-1' }, [
            h('div', { key: 'lbl', className: 'flex justify-between text-xs' }, [
              h('span', { key: 'n', className: 'text-[var(--rilo-text-2)]' }, item.name),
              h('span', { key: 'v', className: 'text-[var(--rilo-text-1)] font-medium' },
                `${currency}${(item.value/10000).toFixed(1)}万 (${pct}%)`)
            ]),
            h('div', { key: 'track', className: 'h-2 rounded-full overflow-hidden', style: { background: 'rgba(34,31,26,0.08)' } }, [
              h('div', { key: 'fill', className: 'h-full rounded-full', style: { width: Math.max(4, item.value/maxVal*100)+'%', background: item.color } })
            ])
          ]);
        })
      ),
      h('div', { key: 'tot', className: 'pt-2 border-t flex justify-between text-sm', style: { borderColor: 'var(--rilo-border-deep)' } }, [
        h('span', { className: 'text-[var(--rilo-text-2)]' }, '合计'),
        h('span', { className: 'text-[var(--rilo-text-1)] font-semibold' }, `${currency}${(total/10000).toFixed(1)}万`)
      ])
    ]);
  };

  // 成本结构条形图（内联实现）
  const InlineCostChart = ({ currency }) => {
    const costData = React.useMemo(() => {
      try {
        const dm = window.dataManager;
        const calc = window.calculator;
        if (dm && calc) {
          const data = dm.getInitialData();
          if (data) return calc.calculate(data);
        }
      } catch(e) {}
      return null;
    }, []);
    
    const cost = costData?.cost || {};
    const total = cost.total || 0;
    if (!costData || total <= 0) {
      return h('div', { className: 'text-center py-6 text-[var(--rilo-text-3)] text-sm' }, '暂无成本数据');
    }
    const fixed = cost.fixed?.total || 0;
    const variable = cost.variable?.total || 0;
    const cogs = cost.cogs?.total || 0;
    const items = [
      { name: '固定成本', value: fixed, color: '#9a8a7a' },
      { name: '变动成本', value: variable, color: '#7a8a6a' },
      { name: 'COGS', value: cogs, color: '#8a7a6a' }
    ].filter(i => i.value > 0);
    const maxVal = Math.max(...items.map(i => i.value), 1);
    return h('div', { className: 'space-y-3' }, [
      h('div', { key: 'bars', className: 'space-y-2.5' },
        items.map(item => {
          const pct = (item.value / total * 100).toFixed(1);
          return h('div', { key: item.name, className: 'space-y-1' }, [
            h('div', { key: 'lbl', className: 'flex justify-between text-xs' }, [
              h('span', { key: 'n', className: 'text-[var(--rilo-text-2)]' }, item.name),
              h('span', { key: 'v', className: 'text-[var(--rilo-text-1)] font-medium' },
                `${currency}${(item.value/10000).toFixed(1)}万 (${pct}%)`)
            ]),
            h('div', { key: 'track', className: 'h-2 rounded-full overflow-hidden', style: { background: 'rgba(34,31,26,0.08)' } }, [
              h('div', { key: 'fill', className: 'h-full rounded-full', style: { width: Math.max(4, item.value/maxVal*100)+'%', background: item.color } })
            ])
          ]);
        })
      ),
      h('div', { key: 'tot', className: 'pt-2 border-t flex justify-between text-sm', style: { borderColor: 'var(--rilo-border-deep)' } }, [
        h('span', { className: 'text-[var(--rilo-text-2)]' }, '合计'),
        h('span', { className: 'text-[var(--rilo-text-1)] font-semibold' }, `${currency}${(total/10000).toFixed(1)}万`)
      ])
    ]);
  };

  const BusinessOverview = ({ data, currency }) => {
    
    return h('div', { className: 'rounded-2xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] p-5 shadow-sm rilo-zh-page' }, [
      h(SectionHeader, {
        key: 'header',
        eyebrow: 'Business Overview',
        title: '业务结构概览',
        subtitle: '先对照收入与成本构成，再看盈亏平衡点与规模门槛。',
        aside: null
      }),
      h('div', { key: 'grid', className: 'mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2' }, [
        h(window.RiloUI.ChartCard, { key: 'revenue', title: '收入结构分析' },
          h(InlineRevenueChart, { currency })
        ),
        h(window.RiloUI.ChartCard, { key: 'cost', title: '成本结构分析' },
          h(InlineCostChart, { currency })
        )
      ]),
      h('div', { key: 'breakeven-wrap', className: 'mt-5' }, [
        h(window.RiloUI.ChartCard, { key: 'breakeven', title: '盈亏平衡分析' },
          h(InlineCostChart, { currency })
        )
      ])
    ]);
  };

  // 情景快速预览
  const ScenarioQuickView = ({ calculations, currency }) => {
    if (!calculations?.scenarios) return null;
    
    return h('div', { className: 'rounded-2xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] p-5 shadow-sm rilo-zh-page' }, [
      h(SectionHeader, {
        key: 'header',
        eyebrow: 'Scenario Analysis',
        title: '情景分析',
        subtitle: '在同一版式下对比保守、基础、乐观三种利润表现，聚焦区间差异而不是语义底色。',
        aside: '三种情景同一底色'
      }),
      h('div', { key: 'content', className: 'mt-5' }, [
        h(window.ChartComponents.ScenarioComparisonChart, { key: 'chart', calculations, currency })
      ])
    ]);
  };

  // 警告和洞察
  const AlertsAndInsights = ({ calculations, data, currency }) => {
    if (!calculations) return null;
    const { profit = 0, margin = 0, paybackYears = Infinity } = calculations.profitability || {};
    const conservativeProfit = calculations.scenarios?.conservative?.profit || 0;
    const totalMemberPct = (data?.revenue?.member?.basePct || 0) + (data?.revenue?.member?.proPct || 0) + (data?.revenue?.member?.vipPct || 0);
    
    const alerts = [
      profit <= 0 && { type: 'error', title: '净利润为负', message: `当前口径下年净利润为 ${currency}${(Math.abs(profit)/10000).toFixed(2)}万` },
      margin > 0 && margin < 5 && { type: 'warning', title: '净利润率读数', message: `当前净利润率为 ${margin.toFixed(1)}%` },
      conservativeProfit <= 0 && profit > 0 && { type: 'warning', title: '保守情景净利润', message: `保守情景下年净利润为 ${currency}${(conservativeProfit/10000).toFixed(2)}万` },
      totalMemberPct > 100 && { type: 'error', title: '会员比例总和', message: `会员类型比例合计为 ${totalMemberPct}%` }
    ].filter(Boolean);
    
    const insights = [
      profit > 0 && margin >= 15 && { type: 'success', title: '净利润率读数', message: `当前净利润率为 ${margin.toFixed(1)}%` },
      paybackYears < 3 && { type: 'success', title: '回本周期读数', message: `当前回本周期为 ${paybackYears.toFixed(1)} 年` }
    ].filter(Boolean);
    
    if (!alerts.length && !insights.length) return null;
    const colorClasses = { error: 'bg-red-50 border-red-200 text-red-800', warning: 'bg-yellow-50 border-yellow-200 text-yellow-800' };
    const summary = [
      alerts.length > 0 ? `${alerts.length} 条需优先处理` : null,
      insights.length > 0 ? `${insights.length} 条高位读数` : null
    ].filter(Boolean).join(' · ');
    
    return h('div', { className: 'rounded-2xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] p-5 shadow-sm rilo-zh-page' }, [
      h(SectionHeader, {
        key: 'header',
        eyebrow: 'Signals',
        title: '系统信号',
        subtitle: '集中显示当前模型中的风险读数与高位读数。',
        aside: summary
      }),
      h('div', { key: 'content', className: 'mt-5 space-y-4' }, [
        alerts.length > 0 && h('section', { key: 'alerts-group', className: 'space-y-3 rounded-2xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-2)] p-4' }, [
          h('div', { key: 'head', className: 'flex items-center justify-between gap-3' }, [
            h('div', { key: 'copy' }, [
              h('h3', { key: 'title', className: 'text-base font-semibold text-[var(--rilo-text-1)]' }, '风险信号'),
              h('p', { key: 'subtitle', className: 'text-sm text-[var(--rilo-text-2)] rilo-zh-subtle' }, '这些信号会影响利润表现、抗风险能力或输入有效性。')
            ]),
            h('span', { key: 'count', className: 'rounded-full bg-[var(--rilo-surface-1)] px-3 py-1 text-xs font-medium text-[var(--rilo-text-2)]' }, `${alerts.length} 条`)
          ]),
          h('div', { key: 'cards', className: 'space-y-3' }, alerts.map((alert, i) => h(window.RiloUI.AlertCard, { key: i, alert, colorClasses })))
        ]),
        insights.length > 0 && h('section', { key: 'insights-group', className: 'space-y-3 rounded-2xl border border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-2)] p-4' }, [
          h('div', { key: 'head', className: 'flex items-center justify-between gap-3' }, [
            h('div', { key: 'copy' }, [
              h('h3', { key: 'title', className: 'text-base font-semibold text-[var(--rilo-text-1)]' }, '高位读数'),
              h('p', { key: 'subtitle', className: 'text-sm text-[var(--rilo-text-2)] rilo-zh-subtle' }, '这些读数表示当前口径下部分指标处于较高区间。')
            ]),
            h('span', { key: 'count', className: 'rounded-full bg-[var(--rilo-surface-1)] px-3 py-1 text-xs font-medium text-[var(--rilo-text-2)]' }, `${insights.length} 条`)
          ]),
          h('div', { key: 'cards', className: 'space-y-3' }, insights.map((insight, i) => h(window.RiloUI.InsightCard, { key: i, insight })))
        ])
      ])
    ]);
  };

  return { OverviewPage, DataActions, KeyMetrics, BusinessOverview, ScenarioQuickView, AlertsAndInsights, CurrencySelector, ImportButton, StatusIndicator };

})();
