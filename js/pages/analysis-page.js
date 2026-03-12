// 敏感度分析页面 - 专注于关键参数的影响分析
window.AnalysisPage = (function() {

  // 辅助函数：确保对象路径存在
  const ensurePath = (obj, path) => {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (!current[key]) current[key] = {};
      current = current[key];
    }
    return current;
  };

  // 获取自定义收入名称的辅助函数
  const getCustomRevenueName = (data) => {
    if (data && data.revenue?.custom && data.revenue.custom.length > 0) {
      // 首先尝试找包含"洗护"的项目
      const groomingItem = data.revenue.custom.find(item => 
        item.name && item.name.includes('洗护'));
      if (groomingItem) {
        return groomingItem.name;
      }
      // 如果没找到，返回第一个自定义收入项的名称
      return data.revenue.custom[0]?.name || '自定义收入';
    }
    return '自定义收入'; // 默认名称
  };

  // 敏感度分析页面组件（统一两栏：左主内容 + 右侧 InspectorPanel）
  const AnalysisPage = ({ data, calculations, formulaEngine, currency = "¥" }) => {
    const Term = window.RiloUI?.Term;
    const [selectedParam, setSelectedParam] = React.useState('fitoutStandard');
    const [paramRange, setParamRange] = React.useState(20); // 参数变化范围百分比
    const [impactMetric, setImpactMetric] = React.useState('paybackYears'); // 影响指标

    const glossaryTerms = {
      sensitivity: { title: '敏感度分析', body: '在其它条件不变的情况下，只改变一个参数，观察结果指标的变化，用于识别最“要命”的杠杆。' },
      payback: { title: '回本周期', body: '初始投资 ÷ 年净利润。净利润≤0 时为 Infinity（无法回本）。' },
      margin: { title: '利润率/毛利率', body: '利润率看整体经营效率；毛利率看“卖出去的东西”本身赚不赚钱。' }
    };

    const left = React.createElement('div', { className: 'space-y-8' }, [
      React.createElement(PageHeader, { key: 'header' }),
      React.createElement(ControlPanel, {
        key: 'control-panel',
        selectedParam,
        paramRange,
        impactMetric,
        onParamChange: setSelectedParam,
        onRangeChange: setParamRange,
        onMetricChange: setImpactMetric,
        data
      }),
      React.createElement(SensitivityChart, {
        key: 'sensitivity-chart',
        data,
        calculations,
        selectedParam,
        paramRange,
        impactMetric,
        currency
      }),
      React.createElement(ScenarioTable, {
        key: 'scenario-table',
        data,
        calculations,
        selectedParam,
        paramRange,
        currency
      })
    ]);

    const conclusion = React.createElement('div', { className: 'space-y-3 text-sm text-gray-700' }, [
      React.createElement('div', { key: 'c0', className: 'rounded-xl border border-gray-200 bg-white p-3' }, [
        React.createElement('div', { key: 't', className: 'font-semibold text-gray-900' }, '你在看什么'),
        React.createElement('div', { key: 'b', className: 'mt-1' }, [
          Term ? React.createElement(Term, { termKey: 'sensitivity' }, '敏感度分析') : '敏感度分析',
          '：把一个参数在±范围内滑动，看回本/利润率/毛利率怎么变。'
        ])
      ]),
      React.createElement(QuickInsights, { key: 'quick-insights', selectedParam, paramRange })
    ]);

    const process = React.createElement('div', { className: 'space-y-4' }, [
      React.createElement(KeyMetrics, { key: 'key-metrics', data, calculations, selectedParam, currency }),
      React.createElement('div', { key: 'p-tip', className: 'text-xs text-gray-500' }, '提示：把 impactMetric 切到“利润率/综合毛利率”，更容易看出“赚钱能力”对参数的响应。')
    ]);

    return window.RiloUI?.TwoPaneLayout ? React.createElement(window.RiloUI.TwoPaneLayout, {
      left,
      inspectorTitle: '敏感度分析 Inspector',
      conclusion,
      process,
      glossaryTerms
    }) : left;
  };

  // 页面标题组件
  const PageHeader = () => {
    return React.createElement('div', {
      className: 'text-center mb-8'
    }, [
      React.createElement('h1', {
        key: 'title',
        className: 'text-3xl font-bold text-gray-900 mb-4'
      }, '📊 敏感度分析'),
      React.createElement('p', {
        key: 'subtitle',
        className: 'text-lg text-gray-600 max-w-2xl mx-auto'
      }, '分析关键参数变化对经营利润的影响程度，为决策提供数据支持')
    ]);
  };

  // 控制面板组件
  const ControlPanel = ({ selectedParam, paramRange, impactMetric, onParamChange, onRangeChange, onMetricChange, data }) => {
    return React.createElement('div', {
      className: 'bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-200'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'text-xl font-semibold text-blue-900 mb-6 flex items-center'
      }, [
        React.createElement('span', {
          key: 'icon',
          className: 'mr-2'
        }, '⚙️'),
        '分析参数设置'
      ]),
      
      React.createElement('div', {
        key: 'controls',
        className: 'grid grid-cols-1 md:grid-cols-3 gap-8'
      }, [
        React.createElement(ParameterSelect, {
          key: 'param-select',
          selectedParam: selectedParam,
          onParamChange: onParamChange,
          data: data
        }),
        
        React.createElement(RangeSlider, {
          key: 'range-slider',
          paramRange: paramRange,
          onRangeChange: onRangeChange
        }),
        
        React.createElement(MetricSelect, {
          key: 'metric-select',
          impactMetric: impactMetric,
          onMetricChange: onMetricChange
        })
      ])
    ]);
  };

  // 参数下拉选择组件
  const ParameterSelect = ({ selectedParam, onParamChange, data = {} }) => {
    const parameters = [
      { value: 'fitoutStandard', label: '🔨 装修标准', desc: '每平米装修投入标准' },
      { value: 'memberCount', label: '👥 会员数量', desc: '目标会员总数' },
      { value: 'membershipPrice', label: '💳 会员费', desc: '加权平均年费价格' },
      { value: 'boardingPrice', label: '🏠 寄养单价', desc: '每日寄养服务价格' },
      { value: 'occupancyRate', label: '📈 入住率', desc: '寄养房间平均入住率' },
      { value: 'medicalRevenue', label: '🏥 医疗收入', desc: '月度医疗服务收入' },
      { value: 'retailRevenue', label: '🛍️ 零售收入', desc: '月度零售业务收入' },
      { value: 'cafeRevenue', label: '☕ 餐饮收入', desc: '月度餐饮业务收入' },
      { value: 'groomingRevenue', label: `🛁 ${getCustomRevenueName(data)}`, desc: `年度${getCustomRevenueName(data)}` },
      { value: 'utilitiesCost', label: '⚡ 水电费用', desc: '年度水电费用支出' },
      { value: 'variableCost', label: '📊 其他变动成本', desc: '年度其他变动成本' },
      { value: 'avgSalary', label: '👥 人员薪资', desc: '员工平均月薪水平' },
      { value: 'totalRevenue', label: '💰 总营收', desc: '年度总营业收入' },
      { value: 'totalCost', label: '💸 总成本', desc: '年度总经营成本' },
      { value: 'totalCOGS', label: '📦 总业务成本', desc: '年度总业务成本(COGS)' }
    ];

    const currentParam = parameters.find(p => p.value === selectedParam);

    return React.createElement('div', {
      className: 'space-y-3'
    }, [
      React.createElement('label', {
        key: 'label',
        className: 'block text-lg font-semibold text-blue-900 mb-2'
      }, '📋 分析参数'),
      React.createElement('select', {
        key: 'select',
        value: selectedParam,
        onChange: (e) => onParamChange(e.target.value),
        className: 'w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:ring-3 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm'
      }, parameters.map(param => 
        React.createElement('option', {
          key: param.value,
          value: param.value
        }, param.label)
      )),
      React.createElement('p', {
        key: 'description',
        className: 'text-sm text-blue-700 mt-2'
      }, currentParam?.desc || '')
    ]);
  };

  // 范围滑块组件
  const RangeSlider = ({ paramRange, onRangeChange }) => {
    return React.createElement('div', {
      className: 'space-y-3'
    }, [
      React.createElement('label', {
        key: 'label',
        className: 'block text-lg font-semibold text-blue-900 mb-2'
      }, '📊 分析范围'),
      React.createElement('div', {
        key: 'range-container',
        className: 'relative'
      }, [
        React.createElement('input', {
          key: 'range',
          type: 'range',
          min: '10',
          max: '100',
          step: '10',
          value: paramRange,
          onChange: (e) => onRangeChange(Number(e.target.value)),
          className: 'w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer slider'
        }),
        React.createElement('div', {
          key: 'range-labels',
          className: 'flex justify-between text-xs text-blue-600 mt-2'
        }, [
          React.createElement('span', { key: 'min' }, '±10%'),
          React.createElement('span', {
            key: 'current',
            className: 'font-bold text-blue-800 bg-blue-100 px-2 py-1 rounded'
          }, `±${paramRange}%`),
          React.createElement('span', { key: 'max' }, '±100%')
        ])
      ]),
      React.createElement('p', {
        key: 'explanation',
        className: 'text-sm text-blue-700'
      }, `参数将在当前值的 ${paramRange}% 范围内变动`)
    ]);
  };

  // 影响指标选择组件
  const MetricSelect = ({ impactMetric, onMetricChange }) => {
    const metrics = [
      { value: 'paybackYears', label: '⏰ 回本周期' },
      { value: 'profitMargin', label: '💰 利润率' },
      { value: 'grossMargin', label: '📊 综合毛利率' }
    ];

    return React.createElement('div', {
      className: 'space-y-3'
    }, [
      React.createElement('label', {
        key: 'label',
        className: 'block text-lg font-semibold text-blue-900 mb-2'
      }, '📈 影响指标'),
      React.createElement('select', {
        key: 'select',
        value: impactMetric || 'paybackYears',
        onChange: (e) => onMetricChange(e.target.value),
        className: 'w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:ring-3 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm'
      }, metrics.map(metric => 
        React.createElement('option', {
          key: metric.value,
          value: metric.value
        }, metric.label)
      )),
      React.createElement('p', {
        key: 'description',
        className: 'text-sm text-blue-700'
      }, '选择要分析的影响指标')
    ]);
  };

  // 关键指标卡片组件
  const KeyMetrics = ({ data = {}, calculations, selectedParam, currency }) => {
    const currentParam = {
      'fitoutStandard': { name: '装修标准', unit: '元/㎡', icon: '🔨' },
      'memberCount': { name: '会员数量', unit: '人', icon: '👥' },
      'membershipPrice': { name: '加权会员费', unit: '元/年', icon: '💳' },
      'boardingPrice': { name: '寄养单价', unit: '元/天', icon: '🏠' },
      'occupancyRate': { name: '入住率', unit: '%', icon: '📈' },
      'medicalRevenue': { name: '医疗收入', unit: '元/月', icon: '🏥' },
      'retailRevenue': { name: '零售收入', unit: '元/月', icon: '🛍️' },
      'cafeRevenue': { name: '餐饮收入', unit: '元/月', icon: '☕' },
      'groomingRevenue': { name: getCustomRevenueName(data), unit: '元/年', icon: '🛁' },
      'utilitiesCost': { name: '水电费用', unit: '元/年', icon: '⚡' },
      'variableCost': { name: '其他变动成本', unit: '元/年', icon: '📊' },
      'avgSalary': { name: '人员薪资', unit: '元/月', icon: '👥' },
      'totalRevenue': { name: '总营收', unit: '元/年', icon: '💰' },
      'totalCost': { name: '总成本', unit: '元/年', icon: '💸' },
      'totalCOGS': { name: '总业务成本', unit: '元/年', icon: '📦' }
    }[selectedParam];

    const currentValue = React.useMemo(() => {
      return getParamValue(data, selectedParam, calculations);
    }, [data, selectedParam, calculations]);
    const currentProfit = calculations?.profitability?.profit || 0;
    const profitMargin = calculations?.profitability?.margin || 0;
    const totalRevenue = calculations?.revenue?.total || 0;
    const totalCost = calculations?.cost?.total || 0;

    return React.createElement('div', {
      className: 'bg-white rounded-xl p-6 shadow-lg border'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'text-lg font-bold text-gray-800 mb-4 flex items-center'
      }, [
        React.createElement('span', { key: 'icon', className: 'mr-2' }, currentParam?.icon),
        '核心指标'
      ]),
      
      React.createElement('div', {
        key: 'metrics',
        className: 'space-y-4'
      }, [
        // 当前参数值
        React.createElement('div', {
          key: 'param-value',
          className: 'bg-blue-50 rounded-lg p-4'
        }, [
          React.createElement('div', {
            key: 'param-label',
            className: 'text-sm text-blue-600 mb-1'
          }, currentParam?.name),
          React.createElement('div', {
            key: 'param-val',
            className: 'text-2xl font-bold text-blue-900'
          }, `${currentValue?.toLocaleString()} ${currentParam?.unit}`)
        ]),
        
        // 当前营收
        React.createElement('div', {
          key: 'revenue-value',
          className: 'bg-cyan-50 rounded-lg p-4'
        }, [
          React.createElement('div', {
            key: 'revenue-label',
            className: 'text-sm text-cyan-600 mb-1'
          }, '年度总营收'),
          React.createElement('div', {
            key: 'revenue-val',
            className: 'text-xl font-bold text-cyan-900'
          }, `${currency}${Math.round(totalRevenue / 10000)}万`)
        ]),
        
        // 当前成本
        React.createElement('div', {
          key: 'cost-value',
          className: 'bg-red-50 rounded-lg p-4'
        }, [
          React.createElement('div', {
            key: 'cost-label',
            className: 'text-sm text-red-600 mb-1'
          }, '年度总成本'),
          React.createElement('div', {
            key: 'cost-val',
            className: 'text-xl font-bold text-red-900'
          }, `${currency}${Math.round(totalCost / 10000)}万`)
        ]),
        
        // 当前利润
        React.createElement('div', {
          key: 'profit-value',
          className: 'bg-green-50 rounded-lg p-4'
        }, [
          React.createElement('div', {
            key: 'profit-label',
            className: 'text-sm text-green-600 mb-1'
          }, '年度净利润'),
          React.createElement('div', {
            key: 'profit-val',
            className: `text-2xl font-bold ${currentProfit >= 0 ? 'text-green-900' : 'text-red-900'}`
          }, `${currency}${Math.round(currentProfit / 10000)}万`)
        ]),
        
        // 利润率
        React.createElement('div', {
          key: 'margin-value',
          className: 'bg-purple-50 rounded-lg p-4'
        }, [
          React.createElement('div', {
            key: 'margin-label',
            className: 'text-sm text-purple-600 mb-1'
          }, '净利润率'),
          React.createElement('div', {
            key: 'margin-val',
            className: `text-2xl font-bold ${profitMargin >= 0 ? 'text-purple-900' : 'text-red-900'}`
          }, `${profitMargin.toFixed(1)}%`)
        ])
      ])
    ]);
  };

  // 快速洞察组件
  const QuickInsights = ({ selectedParam, paramRange }) => {
    const insights = {
      'fitoutStandard': '装修标准影响初期投资规模和长期品牌形象，是重要的战略决策',
      'memberCount': '会员数量决定稳定收入基础，是商业模式的核心指标',
      'membershipPrice': '加权会员费反映真实定价水平，高毛利稳定收入来源',
      'boardingPrice': '寄养价格影响收入规模和市场竞争力',
      'occupancyRate': '入住率决定收入实现程度，是关键运营指标',
      'avgSalary': '人力成本占比较高，需要平衡服务质量与成本'
    };

    return React.createElement('div', {
      className: 'bg-amber-50 rounded-xl p-6 shadow-lg border border-amber-200'
    }, [
      React.createElement('h4', {
        key: 'title',
        className: 'text-lg font-bold text-amber-800 mb-3 flex items-center'
      }, [
        React.createElement('span', { key: 'icon', className: 'mr-2' }, '💡'),
        '分析洞察'
      ]),
      React.createElement('p', {
        key: 'insight',
        className: 'text-amber-700 text-sm leading-relaxed'
      }, insights[selectedParam] || '选择参数进行敏感度分析')
    ]);
  };

  // 敏感度分析图表组件
  const SensitivityChart = ({ data = {}, calculations, selectedParam, paramRange, impactMetric, currency }) => {
    const chartData = React.useMemo(() => {
      return generateChartData(data, calculations, selectedParam, paramRange);
    }, [data, calculations, selectedParam, paramRange]);
    
    const paramInfo = React.useMemo(() => {
      const allParamInfo = {
        'fitoutStandard': { name: '装修标准', unit: '元/㎡', icon: '🔨', currentValue: getParamValue(data, 'fitoutStandard', calculations) },
        'memberCount': { name: '会员数量', unit: '人', icon: '👥', currentValue: getParamValue(data, 'memberCount', calculations) },
        'membershipPrice': { name: '加权会员费', unit: '元/年', icon: '💳', currentValue: getParamValue(data, 'membershipPrice', calculations) },
        'boardingPrice': { name: '寄养单价', unit: '元/天', icon: '🏠', currentValue: getParamValue(data, 'boardingPrice', calculations) },
        'occupancyRate': { name: '入住率', unit: '%', icon: '📈', currentValue: getParamValue(data, 'occupancyRate', calculations) },
        'medicalRevenue': { name: '医疗收入', unit: '元/月', icon: '🏥', currentValue: getParamValue(data, 'medicalRevenue', calculations) },
        'retailRevenue': { name: '零售收入', unit: '元/月', icon: '🛍️', currentValue: getParamValue(data, 'retailRevenue', calculations) },
        'cafeRevenue': { name: '餐饮收入', unit: '元/月', icon: '☕', currentValue: getParamValue(data, 'cafeRevenue', calculations) },
        'groomingRevenue': { name: getCustomRevenueName(data), unit: '元/年', icon: '🛁', currentValue: getParamValue(data, 'groomingRevenue', calculations) },
        'utilitiesCost': { name: '水电费用', unit: '元/年', icon: '⚡', currentValue: getParamValue(data, 'utilitiesCost', calculations) },
        'variableCost': { name: '其他变动成本', unit: '元/年', icon: '📊', currentValue: getParamValue(data, 'variableCost', calculations) },
        'avgSalary': { name: '人员薪资', unit: '元/月', icon: '👥', currentValue: getParamValue(data, 'avgSalary', calculations) },
        'totalRevenue': { name: '总营收', unit: '元/年', icon: '💰', currentValue: getParamValue(data, 'totalRevenue', calculations) },
        'totalCost': { name: '总成本', unit: '元/年', icon: '💸', currentValue: getParamValue(data, 'totalCost', calculations) },
        'totalCOGS': { name: '总业务成本', unit: '元/年', icon: '📦', currentValue: getParamValue(data, 'totalCOGS', calculations) }
      };
      return allParamInfo[selectedParam];
    }, [data, calculations, selectedParam]);
    
    return React.createElement('div', {
      className: 'bg-white rounded-xl p-6 shadow-lg border'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'text-xl font-bold text-gray-800 mb-6 flex items-center'
      }, [
        React.createElement('span', { key: 'icon', className: 'mr-2' }, '📈'),
        '参数敏感度图表'
      ]),
      
      React.createElement(ChartBars, {
        key: 'chart',
        data: chartData,
        paramRange: paramRange,
        paramInfo: paramInfo,
        impactMetric: impactMetric
      })
    ]);
  };

  // 图表条形图组件
  const ChartBars = ({ data, paramRange, paramInfo, impactMetric }) => {
    // 计算基准值
    const baseValue = data.find(point => point.paramChange === 0)?.[impactMetric] || 0;
    
    // 为每个数据点添加变化值
    const dataWithChanges = data.map(point => ({
      ...point,
      valueChange: point[impactMetric] - baseValue
    }));
    
    return React.createElement('div', {
      className: 'space-y-6'
    }, [
      React.createElement(ChartHeader, {
        key: 'header',
        paramRange: paramRange,
        impactMetric: impactMetric
      }),
      
      React.createElement('div', {
        key: 'bars',
        className: 'space-y-3 bg-gray-50 rounded-lg p-4'
      }, dataWithChanges.map((point, index) => 
        React.createElement(ChartBar, {
          key: index,
          point: point,
          isCenter: point.paramChange === 0,
          paramInfo: paramInfo,
          impactMetric: impactMetric
        })
      ))
    ]);
  };

  // 图表标题组件 - 简化版本
  const ChartHeader = ({ paramRange, impactMetric }) => {
    const metricLabels = {
      paybackYears: '回本周期',
      profitMargin: '利润率',
      grossMargin: '综合毛利率'
    };
    
    const metricUnits = {
      paybackYears: '年',
      profitMargin: '%',
      grossMargin: '%'
    };
    
    const currentMetric = metricLabels[impactMetric] || '回本周期';
    const currentUnit = metricUnits[impactMetric] || '年';
    
    return React.createElement('div', { className: 'text-center mb-4' }, [
      React.createElement('div', { key: 'title', className: 'text-lg font-semibold text-gray-700 mb-2' }, `参数变化对${currentMetric}的影响`),
      React.createElement('div', { key: 'range-info', className: 'flex justify-between items-center text-sm font-medium' }, [
        ['📉 -', '📊 基准值', '📈 +'].map((icon, i) => React.createElement('span', {
          key: i, className: `px-3 py-1 rounded-full ${['text-red-600 bg-red-100', 'text-gray-600 bg-gray-100', 'text-green-600 bg-green-100'][i]}`
        }, i === 1 ? icon : `${icon}${paramRange}%`))
      ]),
      React.createElement('div', { key: 'legend', className: 'flex justify-between text-xs text-gray-500 mt-2' }, [
        React.createElement('span', { key: 'param-legend' }, '参数值 (变动%)'),
        React.createElement('span', { key: 'result-legend' }, `${currentMetric} (变化${currentUnit})`)
      ])
    ]);
  };

  // 简化图表条组件
  const ChartBar = ({ point, isCenter, paramInfo, impactMetric }) => {
    const impactValue = point[impactMetric] || 0;
    const valueChange = point.valueChange || 0;
    const baseValue = impactValue - valueChange; // 基准值
    
    // 根据影响指标调整条形图宽度计算
    let barWidth = 0;
    let displayValue = '';
    let displayChange = '';
    
    switch(impactMetric) {
      case 'paybackYears':
        // 对于回本周期，使用更大的缩放因子使变化更明显
        barWidth = Math.min((Math.abs(impactValue) / 5) * 100, 100); // 从10改为5
        displayValue = `${impactValue.toFixed(1)}年`;
        displayChange = `${valueChange >= 0 ? '+' : ''}${valueChange.toFixed(1)}年`;
        break;
      case 'profitMargin':
      case 'grossMargin':
        // 对于百分比指标，使用绝对值变化计算进度条宽度，更直观
        const absoluteChange = Math.abs(valueChange);
        barWidth = Math.min(absoluteChange * 2, 100); // 每1%变化对应2%的进度条宽度
        displayValue = `${impactValue.toFixed(1)}%`;
        displayChange = `${valueChange >= 0 ? '+' : ''}${valueChange.toFixed(1)}%`;
        break;
      default:
        barWidth = Math.min((Math.abs(impactValue) / 5) * 100, 100); // 从10改为5
        displayValue = `${impactValue.toFixed(1)}年`;
        displayChange = `${valueChange >= 0 ? '+' : ''}${valueChange.toFixed(1)}年`;
    }
    
    // 颜色逻辑：对于回本周期，数值越小越好；对于利润率和毛利率，数值越大越好
    let colors = ['bg-gray-400', 'text-gray-600']; // 默认中心点颜色
    if (!isCenter) {
      if (impactMetric === 'paybackYears') {
        // 回本周期：数值越小越好
        if (valueChange < -Math.abs(baseValue) * 0.05) {
          colors = ['bg-green-700', 'text-green-700']; // 显著改善
        } else if (valueChange < 0) {
          colors = ['bg-green-500', 'text-green-500']; // 轻微改善
        } else if (valueChange > Math.abs(baseValue) * 0.05) {
          colors = ['bg-red-700', 'text-red-700']; // 显著恶化
        } else if (valueChange > 0) {
          colors = ['bg-red-500', 'text-red-500']; // 轻微恶化
        }
      } else {
        // 利润率和毛利率：数值越大越好
        if (valueChange > Math.abs(baseValue) * 0.05) {
          colors = ['bg-green-700', 'text-green-700']; // 显著改善
        } else if (valueChange > 0) {
          colors = ['bg-green-500', 'text-green-500']; // 轻微改善
        } else if (valueChange < -Math.abs(baseValue) * 0.05) {
          colors = ['bg-red-700', 'text-red-700']; // 显著恶化
        } else if (valueChange < 0) {
          colors = ['bg-red-500', 'text-red-500']; // 轻微恶化
        }
      }
    }
    
    return React.createElement('div', { className: `flex items-center space-x-6 p-3 rounded-lg ${isCenter ? 'bg-gray-100 border-2 border-gray-300' : 'bg-white'}` }, [
      React.createElement('div', { key: 'label', className: `w-32 text-center font-semibold ${isCenter ? 'text-gray-800' : point.paramChange > 0 ? 'text-green-700' : 'text-red-700'}` }, [
        React.createElement('div', { key: 'param-value', className: 'text-sm' }, `${Math.round(paramInfo.currentValue * (1 + point.paramChange / 100)).toLocaleString()} ${paramInfo.unit}`),
        React.createElement('div', { key: 'param-change', className: 'text-xs' }, `${point.paramChange >= 0 ? '+' : ''}${point.paramChange}%`)
      ]),
      React.createElement('div', { key: 'bar-container', className: 'flex-1 flex items-center h-8 bg-gray-200 rounded-lg overflow-hidden' }, [
        React.createElement('div', { key: 'bar', className: `h-full transition-all duration-500 ease-out ${colors[0]} flex items-center justify-end pr-2`, style: { width: `${Math.max(barWidth, 5)}%` }}, 
          barWidth > 10 ? React.createElement('span', { key: 'inner-text', className: 'text-xs font-semibold text-white' }, displayValue) : null)
      ]),
      React.createElement('div', { key: 'value', className: 'w-32 text-center' }, [
        React.createElement('div', { key: 'impact-value', className: `text-lg font-bold ${isCenter ? 'text-gray-700' : colors[1]}` }, displayValue),
        React.createElement('div', { key: 'impact-change', className: 'text-xs flex items-center justify-center' }, [
          React.createElement('span', { key: 'change-text', className: `font-bold ${valueChange > 0 ? 'text-green-700' : valueChange < 0 ? 'text-red-700' : 'text-gray-600'}` }, displayChange),
          valueChange !== 0 && React.createElement('span', { 
            key: 'arrow', 
            className: `ml-1 text-xl font-bold ${valueChange > 0 ? 'text-green-700' : 'text-red-700'}` 
          }, valueChange > 0 ? '↗' : '↘')
        ])
      ])
    ]);
  };

  // 情景对比分析表组件
  const ScenarioTable = ({ data, calculations, selectedParam, paramRange, currency }) => {
    const scenarios = generateScenarios(data, calculations, selectedParam, paramRange);
    
    return React.createElement('div', {
      className: 'bg-white rounded-xl p-8 shadow-lg border'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'text-2xl font-bold text-gray-800 mb-6 flex items-center'
      }, [
        React.createElement('span', { key: 'icon', className: 'mr-3' }, '📋'),
        '详细情景对比分析'
      ]),
      
      React.createElement('div', {
        key: 'table',
        className: 'overflow-x-auto'
      }, [
        React.createElement('table', {
          key: 'scenarios-table',
          className: 'w-full border-collapse'
        }, [
          React.createElement(TableHeader, { key: 'thead' }),
          React.createElement(TableBody, {
            key: 'tbody',
            scenarios: scenarios,
            currency: currency,
            selectedParam: selectedParam
          })
        ])
      ])
    ]);
  };

  // 表格头部组件
  const TableHeader = () => {
    const headers = [
      { key: 'scenario', label: '📊 分析情景', width: 'w-1/4' },
      { key: 'param', label: '📋 参数值', width: 'w-1/4' },
      { key: 'payback', label: '⏰ 回本周期', width: 'w-1/4' },
      { key: 'change', label: '📈 周期变化', width: 'w-1/4' }
    ];
    
    return React.createElement('thead', {
      className: 'bg-gradient-to-r from-blue-50 to-indigo-50'
    }, [
      React.createElement('tr', {
        key: 'header-row',
        className: 'border-b-2 border-blue-200'
      }, headers.map(header =>
        React.createElement('th', {
          key: header.key,
          className: `text-left py-4 px-6 font-bold text-blue-900 ${header.width}`
        }, header.label)
      ))
    ]);
  };

  // 表格主体组件
  const TableBody = ({ scenarios, currency, selectedParam }) => {
    const paramInfo = {
      'fitoutStandard': { unit: '元/㎡', icon: '🔨' },
      'memberCount': { unit: '人', icon: '👥' },
      'membershipPrice': { unit: '元/年', icon: '💳' },
      'boardingPrice': { unit: '元/天', icon: '🏠' },
      'occupancyRate': { unit: '%', icon: '📈' },
      'avgSalary': { unit: '元/月', icon: '👥' }
    };

    const scenarioIcons = {
      '悲观情况': '😰',
      '当前情况': '😐',
      '乐观情况': '😄'
    };

    return React.createElement('tbody', null, scenarios.map((scenario, index) =>
      React.createElement('tr', {
        key: scenario.name,
        className: `border-b border-gray-100 hover:bg-gray-50 transition-colors ${
          scenario.name === '当前情况' ? 'bg-yellow-50 border-yellow-200' : ''
        }`
      }, [
        React.createElement('td', {
          key: 'name',
          className: 'py-6 px-6 font-bold text-lg'
        }, [
          React.createElement('div', {
            key: 'scenario-info',
            className: 'flex items-center'
          }, [
            React.createElement('span', {
              key: 'icon',
              className: 'mr-2 text-2xl'
            }, scenarioIcons[scenario.name]),
            React.createElement('span', {
              key: 'name',
              className: `text-${scenario.color}-700`
            }, scenario.name)
          ])
        ]),
        React.createElement('td', {
          key: 'value',
          className: 'py-6 px-6 text-center'
        }, [
          React.createElement('div', {
            key: 'param-value',
            className: 'text-lg font-semibold text-gray-800'
          }, scenario.paramValue.toLocaleString()),
          React.createElement('div', {
            key: 'param-unit',
            className: 'text-sm text-gray-500'
          }, `${paramInfo[selectedParam]?.icon} ${paramInfo[selectedParam]?.unit}`)
        ]),
        React.createElement('td', {
          key: 'payback',
          className: `py-6 px-6 text-center`
        }, [
          React.createElement('div', {
            key: 'payback-value',
            className: `text-xl font-bold text-${scenario.color}-600`
          }, `${scenario.paybackYears?.toFixed(1) || '0.0'}年`),
          React.createElement('div', {
            key: 'payback-label',
            className: 'text-xs text-gray-500'
          }, '投资回本周期')
        ]),
        React.createElement('td', {
          key: 'change',
          className: `py-6 px-6 text-center`
        }, [
          React.createElement('div', {
            key: 'change-value',
            className: `text-lg font-bold text-${scenario.color}-600`
          }, scenario.changeText),
          React.createElement('div', {
            key: 'change-label',
            className: 'text-xs text-gray-500'
          }, '相比基准周期')
        ])
      ])
    ));
  };

  // 数据生成函数 - 真实计算参数影响（回本周期、利润率、综合毛利率）
  function generateChartData(data, calculations, selectedParam, paramRange) {
    const baseValue = getParamValue(data, selectedParam, calculations);
    const basePaybackYears = calculations?.profitability?.paybackYears || 8;
    const baseProfitMargin = calculations?.profitability?.margin || 0;
    const baseGrossMargin = calculations?.profitability?.grossMargin || 0;
    const dataPoints = [];
    
    console.log(`[基准值验证] 参数:${selectedParam}`, {
      baseValue,
      basePaybackYears,
      baseProfitMargin,
      baseGrossMargin,
      calculationsSource: !!calculations?.profitability,
      totalRevenue: calculations?.revenue?.total,
      totalCost: calculations?.cost?.total
    });
    
    // 如果没有计算器或基础数据，返回估算值
    if (!window.calculator || !data) {
      console.warn('敏感度分析：使用估算模式 - 计算器:', !!window.calculator, '数据:', !!data, '基准回本:', basePaybackYears);
      
      for (let i = -paramRange; i <= paramRange; i += paramRange / 5) {
        const variation = i / 100;
        // 简单估算：参数改善会缩短回本周期
        const estimatedPayback = basePaybackYears * (1 - variation * 0.3);
        const estimatedProfitMargin = baseProfitMargin * (1 + variation * 0.1);
        const estimatedGrossMargin = baseGrossMargin * (1 + variation * 0.05);
        
        dataPoints.push({
          paramChange: i,
          paybackYears: Math.max(estimatedPayback, 0.1), // 最少0.1年
          profitMargin: estimatedProfitMargin,
          grossMargin: estimatedGrossMargin
        });
      }
      return dataPoints;
    }
    
    // 使用真实计算器进行敏感度分析
    console.log('敏感度分析：使用真实计算模式，参数:', selectedParam, '基准值:', baseValue, '基准回本:', basePaybackYears + '年');
    const stepSize = Math.max(5, paramRange / 5); // 保证至少有几个数据点
    
    for (let i = -paramRange; i <= paramRange; i += stepSize) {
      const variation = i / 100;
      
      // 当i=0时（基准点），直接使用已计算的基准值，不重新计算
      if (i === 0) {
        console.log('基准点: 直接使用已计算值 - 回本周期', basePaybackYears + '年', '利润率:', baseProfitMargin + '%', '综合毛利率:', baseGrossMargin + '%');
        dataPoints.push({
          paramChange: 0,
          paybackYears: Math.round(basePaybackYears * 10) / 10,
          profitMargin: Math.round(baseProfitMargin * 10) / 10,
          grossMargin: Math.round(baseGrossMargin * 10) / 10
        });
        continue;
      }
      
      let newValue = baseValue * (1 + variation);
      
      // 设置合理的约束，避免不合理的值
      if (selectedParam === 'totalRevenue' || selectedParam === 'totalCost' || selectedParam === 'totalCOGS') {
        newValue = Math.max(newValue, baseValue * 0.1); // 最低不低于基准值的10%
      } else if (selectedParam.includes('Revenue') || selectedParam.includes('Price')) {
        newValue = Math.max(newValue, 0); // 收入和价格不能为负
      } else if (selectedParam === 'occupancyRate') {
        newValue = Math.max(0, Math.min(100, newValue)); // 入住率在0-100%之间
      } else if (selectedParam === 'memberCount') {
        newValue = Math.max(0, Math.round(newValue)); // 会员数量不能为负，且为整数
      } else if (selectedParam.includes('Cost') || selectedParam.includes('Salary')) {
        newValue = Math.max(0, newValue); // 成本不能为负
      }
      
      const modifiedData = createModifiedData(data, selectedParam, newValue, calculations);
      
      try {
        const newCalculations = window.calculator.calculate(modifiedData);
        const newPaybackYears = newCalculations?.profitability?.paybackYears || 0;
        let newProfitMargin = newCalculations?.profitability?.margin || 0;
        let newGrossMargin = newCalculations?.profitability?.grossMargin || 0;
        
        // 验证计算结果的逻辑合理性
        const totalRevenue = newCalculations?.revenue?.total || 0;
        const totalCost = newCalculations?.cost?.total || 0;
        const profit = newCalculations?.profitability?.profit || 0;
        
        // 强制逻辑验证 - 总营收接近0时，所有利润率必须为0
        if (Math.abs(totalRevenue) < 1) {
          if (Math.abs(newProfitMargin) > 0.01) {
            console.warn(`逻辑修正: 总营收为${totalRevenue}，强制利润率从${newProfitMargin}%修正为0%`, {
              selectedParam, variation, newValue, totalRevenue, totalCost, profit, newProfitMargin
            });
            newProfitMargin = 0;
          }
          if (Math.abs(newGrossMargin) > 0.01) {
            console.warn(`逻辑修正: 总营收为${totalRevenue}，强制毛利率从${newGrossMargin}%修正为0%`);
            newGrossMargin = 0;
          }
        }
        
        // 额外的NaN和无效值清理
        if (isNaN(newProfitMargin) || !isFinite(newProfitMargin)) {
          console.warn('利润率为NaN或无限值，重置为0');
          newProfitMargin = 0;
        }
        if (isNaN(newGrossMargin) || !isFinite(newGrossMargin)) {
          console.warn('毛利率为NaN或无限值，重置为0');
          newGrossMargin = 0;
        }
        
        // 更多逻辑验证
        if (profit > totalRevenue) {
          console.warn(`逻辑错误: 利润(${profit})大于总营收(${totalRevenue})`);
        }
        
        if (totalRevenue < 0 || totalCost < 0) {
          console.warn(`逻辑错误: 存在负数值 - 营收:${totalRevenue}, 成本:${totalCost}`);
        }
        
        dataPoints.push({
          paramChange: Math.round(i * 10) / 10,
          paybackYears: Math.round(newPaybackYears * 10) / 10,
          profitMargin: Math.round(newProfitMargin * 10) / 10,
          grossMargin: Math.round(newGrossMargin * 10) / 10
        });
      } catch (error) {
        console.warn('计算敏感度数据时出错:', error);
        // 回退到估算值
        const estimatedPayback = basePaybackYears * (1 - variation * 0.3);
        const estimatedProfitMargin = baseProfitMargin * (1 + variation * 0.1);
        const estimatedGrossMargin = baseGrossMargin * (1 + variation * 0.05);
        dataPoints.push({
          paramChange: Math.round(i * 10) / 10,
          paybackYears: Math.max(estimatedPayback, 0.1),
          profitMargin: estimatedProfitMargin,
          grossMargin: estimatedGrossMargin
        });
      }
    }
    
    return dataPoints;
  }

  function generateScenarios(data, calculations, selectedParam, paramRange) {
    const baseValue = getParamValue(data, selectedParam, calculations);
    const basePaybackYears = calculations?.profitability?.paybackYears || 8;
    
    const scenarios = [];
    const scenarioConfigs = [
      { name: '悲观情况', factor: 1 - paramRange / 100, color: 'red' },
      { name: '当前情况', factor: 1, color: 'gray' },
      { name: '乐观情况', factor: 1 + paramRange / 100, color: 'green' }
    ];
    
    scenarioConfigs.forEach(config => {
      const paramValue = baseValue * config.factor;
      let paybackYears = basePaybackYears;
      let changeText = '-';
      
      if (config.factor !== 1 && window.calculator && data) {
        try {
          const modifiedData = createModifiedData(data, selectedParam, paramValue, calculations);
          const newCalculations = window.calculator.calculate(modifiedData);
          paybackYears = newCalculations?.profitability?.paybackYears || basePaybackYears;
          
          // 计算回本周期变化
          const yearsDifference = paybackYears - basePaybackYears;
          if (Math.abs(yearsDifference) < 0.1) {
            changeText = '无变化';
          } else {
            changeText = yearsDifference > 0 ? 
              `+${yearsDifference.toFixed(1)}年` : 
              `${yearsDifference.toFixed(1)}年`;
          }
        } catch (error) {
          console.warn('计算情景数据时出错:', error);
          // 回退到简单估算
          paybackYears = basePaybackYears * (2 - config.factor);
          const yearsDifference = paybackYears - basePaybackYears;
          changeText = config.factor === 1 ? '-' : 
            (yearsDifference > 0 ? `+${yearsDifference.toFixed(1)}年` : `${yearsDifference.toFixed(1)}年`);
        }
      }
      
      scenarios.push({
        name: config.name,
        paramValue: paramValue,
        paybackYears: paybackYears,
        color: config.color,
        changeText: changeText
      });
    });
    
    return scenarios;
  }

  // 创建修改后的数据副本 - 修正数据路径映射
  function createModifiedData(originalData, paramName, newValue, baseCalculations = null) {
    const modifiedData = JSON.parse(JSON.stringify(originalData));
    
    // 根据实际数据结构设置数据路径
    switch (paramName) {
      case 'fitoutStandard':
        ensurePath(modifiedData, 'investment').fitoutStandard = newValue;
        break;
        
      case 'memberCount':
        ensurePath(modifiedData, 'revenue.member').count = newValue;
        break;
        
      case 'membershipPrice':
        // 加权会员费: 按比例调整三个会员价格
        const member = ensurePath(modifiedData, 'revenue.member');
        const currentWeighted = getParamValue(originalData, 'membershipPrice');
        const ratio = newValue / currentWeighted;
        
        // 按相同比例调整三个价格
        if (member.basePrice) member.basePrice = Math.round(member.basePrice * ratio);
        if (member.proPrice) member.proPrice = Math.round(member.proPrice * ratio);
        if (member.vipPrice) member.vipPrice = Math.round(member.vipPrice * ratio);
        break;
        
      case 'boardingPrice':
        ensurePath(modifiedData, 'revenue.boarding').adr = newValue;
        break;
        
      case 'occupancyRate':
        ensurePath(modifiedData, 'revenue.boarding').occ = newValue;
        break;
        
      case 'medicalRevenue':
        ensurePath(modifiedData, 'revenue.medical').monthlyRevenue = newValue;
        break;
        
      case 'retailRevenue':
        ensurePath(modifiedData, 'revenue.retail').monthlyRevenue = newValue;
        break;
        
      case 'cafeRevenue':
        ensurePath(modifiedData, 'revenue.cafe').monthlyRevenue = newValue;
        break;
        
      case 'groomingRevenue':
        // 自定义收入 - 修改第一个自定义收入项或创建新项目
        // 注意：newValue是年度值，需要转换为月度值存储
        const monthlyValue = Math.round(newValue / 12);
        if (!modifiedData.revenue.custom) modifiedData.revenue.custom = [];
        if (modifiedData.revenue.custom.length === 0) {
          // 如果没有自定义收入项，创建一个通用的自定义收入项
          modifiedData.revenue.custom.push({
            name: '自定义收入',
            monthlyRevenue: monthlyValue,
            margin: 60, // 默认毛利率60%
            formula: `${monthlyValue} * 12`, // 月度值 × 12 = 年度值
            variables: [],
            enabled: true
          });
        } else {
          // 优先寻找包含"洗护"的项目，否则使用第一个自定义收入项
          const groomingIndex = modifiedData.revenue.custom.findIndex(item => 
            item.name && item.name.includes('洗护'));
          if (groomingIndex >= 0) {
            modifiedData.revenue.custom[groomingIndex].monthlyRevenue = monthlyValue;
            modifiedData.revenue.custom[groomingIndex].formula = `${monthlyValue} * 12`;
          } else {
            modifiedData.revenue.custom[0].monthlyRevenue = monthlyValue;
            modifiedData.revenue.custom[0].formula = `${monthlyValue} * 12`;
          }
        }
        break;
        
      case 'utilitiesCost':
        ensurePath(modifiedData, 'cost.variable').utilitiesPerYear = newValue;
        break;
        
      case 'variableCost':
        ensurePath(modifiedData, 'cost.variable').miscVariableAnnual = newValue;
        break;
        
      case 'avgSalary':
        ensurePath(modifiedData, 'cost.fixed').staffSalaryPerMonth = newValue;
        break;
        
      case 'totalRevenue':
        // 总营收是计算结果，需要按比例调整所有收入来源
        const currentTotalRevenue = baseCalculations?.revenue?.total || getParamValue(modifiedData, 'totalRevenue'); // 优先使用准确的基准值
        if (currentTotalRevenue > 0) {
          const scaleFactor = newValue / currentTotalRevenue;
          
          // 按比例调整所有主要收入来源
          const currentBasePrice = modifiedData.revenue?.member?.basePrice || 2499;
          ensurePath(modifiedData, 'revenue.member').basePrice = Math.round(Math.max(0, currentBasePrice * scaleFactor));
          
          const currentMedical = modifiedData.revenue?.medical?.monthlyRevenue || 50000;
          ensurePath(modifiedData, 'revenue.medical').monthlyRevenue = Math.round(Math.max(0, currentMedical * scaleFactor));
          
          const currentRetail = modifiedData.revenue?.retail?.monthlyRevenue || 30000;
          ensurePath(modifiedData, 'revenue.retail').monthlyRevenue = Math.round(Math.max(0, currentRetail * scaleFactor));
          
          const currentCafe = modifiedData.revenue?.cafe?.monthlyRevenue || 25000;
          ensurePath(modifiedData, 'revenue.cafe').monthlyRevenue = Math.round(Math.max(0, currentCafe * scaleFactor));
          
          // 调整自定义收入
          if (modifiedData.revenue?.custom && modifiedData.revenue.custom.length > 0) {
            modifiedData.revenue.custom.forEach(item => {
              if (item.monthlyRevenue) {
                item.monthlyRevenue = Math.round(Math.max(0, item.monthlyRevenue * scaleFactor));
                item.formula = `${item.monthlyRevenue} * 12`;
              }
            });
          }
        } else {
          // 如果当前总营收为0，将所有收入设为0
          ensurePath(modifiedData, 'revenue.member').basePrice = 0;
          ensurePath(modifiedData, 'revenue.medical').monthlyRevenue = 0;
          ensurePath(modifiedData, 'revenue.retail').monthlyRevenue = 0;
          ensurePath(modifiedData, 'revenue.cafe').monthlyRevenue = 0;
          if (modifiedData.revenue?.custom) {
            modifiedData.revenue.custom.forEach(item => {
              item.monthlyRevenue = 0;
              item.formula = '0';
            });
          }
        }
        break;
        
      case 'totalCost':
        // 总成本也是计算结果，需要按比例调整主要成本组件
        const currentTotalCost = baseCalculations?.cost?.total || getParamValue(modifiedData, 'totalCost'); // 优先使用准确的基准值
        if (currentTotalCost > 0) {
          const costScaleFactor = newValue / currentTotalCost;
          
          // 调整固定成本
          const currentRentPerDay = modifiedData.cost?.fixed?.rentPerSqmPerDay || 8;
          ensurePath(modifiedData, 'cost.fixed').rentPerSqmPerDay = Math.round(Math.max(0, currentRentPerDay * costScaleFactor));
          
          const currentSalary = modifiedData.cost?.fixed?.staffSalaryPerMonth || 12000;
          ensurePath(modifiedData, 'cost.fixed').staffSalaryPerMonth = Math.round(Math.max(0, currentSalary * costScaleFactor));
          
          // 调整变动成本
          const currentUtilities = modifiedData.cost?.variable?.utilitiesPerYear || 240000;
          ensurePath(modifiedData, 'cost.variable').utilitiesPerYear = Math.round(Math.max(0, currentUtilities * costScaleFactor));
          
          const currentMisc = modifiedData.cost?.variable?.miscVariableAnnual || 48300;
          ensurePath(modifiedData, 'cost.variable').miscVariableAnnual = Math.round(Math.max(0, currentMisc * costScaleFactor));
        } else {
          // 如果目标总成本为0，将主要成本组件设为0（但这在实际中不合理）
          ensurePath(modifiedData, 'cost.fixed').rentPerSqmPerDay = 0;
          ensurePath(modifiedData, 'cost.fixed').staffSalaryPerMonth = 0;
          ensurePath(modifiedData, 'cost.variable').utilitiesPerYear = 0;
          ensurePath(modifiedData, 'cost.variable').miscVariableAnnual = 0;
        }
        break;
        
      case 'totalCOGS':
        // 总业务成本通过调整会员毛利率来影响
        const currentMemberMargin = modifiedData.cost?.margins?.members || 60;
        const currentCOGS = baseCalculations?.cost?.cogs?.total || getParamValue(modifiedData, 'totalCOGS'); // 优先使用准确的基准值
        if (currentCOGS > 0) {
          const cogsScaleFactor = newValue / currentCOGS;
          // 反向计算所需的毛利率调整
          const newMargin = Math.max(0, Math.min(95, currentMemberMargin / cogsScaleFactor));
          ensurePath(modifiedData, 'cost.margins').members = Math.round(newMargin);
        }
        break;
        
      default:
        console.warn('未知参数:', paramName);
    }
    
    return modifiedData;
  }
  
  // 获取参数值 - 按实际数据结构修正
  function getParamValue(data, selectedParam, calculations = null) {
    if (!data) return 100;
    
    switch (selectedParam) {
      case 'fitoutStandard':
        // 装修标准: investment.fitoutStandard
        return data.investment?.fitoutStandard || 7000;
        
      case 'memberCount':
        // 会员数量: revenue.member.count
        return data.revenue?.member?.count || 300;
        
      case 'membershipPrice':
        // 加权会员费: 计算加权平均价格
        const member = data.revenue?.member;
        if (!member) return 2499;
        
        const basePct = member.basePct || 60;
        const proPct = member.proPct || 35;
        const vipPct = member.vipPct || 5;
        const basePrice = member.basePrice || 2499;
        const proPrice = member.proPrice || 4999;
        const vipPrice = member.vipPrice || 29999;
        
        const weightedPrice = (basePrice * basePct + proPrice * proPct + vipPrice * vipPct) / 100;
        return Math.round(weightedPrice);
        
      case 'boardingPrice':
        // 寄养单价: revenue.boarding.adr
        return data.revenue?.boarding?.adr || 400;
        
      case 'occupancyRate':
        // 入住率: revenue.boarding.occ
        return data.revenue?.boarding?.occ || 70;
        
      case 'medicalRevenue':
        // 医疗收入: revenue.medical.monthlyRevenue
        return data.revenue?.medical?.monthlyRevenue || 50000;
        
      case 'retailRevenue':
        // 零售收入: revenue.retail.monthlyRevenue
        return data.revenue?.retail?.monthlyRevenue || 30000;
        
      case 'cafeRevenue':
        // 餐饮收入: revenue.cafe.monthlyRevenue
        return data.revenue?.cafe?.monthlyRevenue || 25000;
        
      case 'groomingRevenue':
        // 自定义收入: 优先从计算结果中获取，然后从原始数据获取
        if (calculations?.revenue?.custom) {
          return calculations.revenue.custom;
        }
        // 从原始数据中获取自定义收入
        if (data.revenue?.custom && data.revenue.custom.length > 0) {
          const groomingItem = data.revenue.custom.find(item => 
            item.name && item.name.includes('洗护'));
          if (groomingItem) {
            return groomingItem.monthlyRevenue * 12 || 0; // 转换为年度值
          }
          // 如果没找到包含"洗护"的项目，使用第一个自定义收入项
          return (data.revenue.custom[0]?.monthlyRevenue || 0) * 12; // 转换为年度值
        }
        return 240000; // 默认年度值 (20000*12)
        
      case 'utilitiesCost':
        // 水电费用: cost.variable.utilitiesPerYear
        return data.cost?.variable?.utilitiesPerYear || 240000;
        
      case 'variableCost':
        // 其他变动成本: cost.variable.miscVariableAnnual
        return data.cost?.variable?.miscVariableAnnual || 48300;
        
      case 'avgSalary':
        // 人员薪资: cost.fixed.staffSalaryPerMonth
        return data.cost?.fixed?.staffSalaryPerMonth || 12000;
        
      case 'totalRevenue':
        // 总营收: 从计算结果中获取，如果没有则使用基础数据估算
        if (calculations?.revenue?.total) {
          return calculations.revenue.total;
        }
        // 备用估算
        const memberRevenue = (data.revenue?.member?.count || 300) * (data.revenue?.member?.basePrice || 2499);
        const boardingRevenue = (data.revenue?.boarding?.rooms || 20) * (data.revenue?.boarding?.adr || 400) * 365 * ((data.revenue?.boarding?.occ || 70) / 100);
        const medicalRevenue = (data.revenue?.medical?.monthlyRevenue || 50000) * 12;
        const retailRevenue = (data.revenue?.retail?.monthlyRevenue || 30000) * 12;
        const cafeRevenue = (data.revenue?.cafe?.monthlyRevenue || 25000) * 12;
        return memberRevenue + boardingRevenue + medicalRevenue + retailRevenue + cafeRevenue;
        
      case 'totalCost':
        // 总成本: 从计算结果中获取，如果没有则使用估算
        if (calculations?.cost?.total) {
          return calculations.cost.total;
        }
        // 备用估算
        const fixedCostEstimate = 
          (data.basic?.areaSqm || 600) * (data.cost?.fixed?.rentPerSqmPerDay || 8) * 365 + // 租金
          (data.cost?.fixed?.staffCount || 12) * (data.cost?.fixed?.staffSalaryPerMonth || 12000) * 12; // 人工
        const variableCostEstimate = (data.cost?.variable?.utilitiesPerYear || 240000) + (data.cost?.variable?.miscVariableAnnual || 48300);
        return fixedCostEstimate + variableCostEstimate + 500000; // 加上COGS估算
        
      case 'totalCOGS':
        // 总业务成本: 从计算结果中获取，如果没有则使用估算
        if (calculations?.cost?.cogs?.total) {
          return calculations.cost.cogs.total;
        }
        // 备用估算
        const totalRevenueForCOGS = 
          (data.revenue?.member?.count || 300) * (data.revenue?.member?.basePrice || 2499) + 
          (data.revenue?.medical?.monthlyRevenue || 50000) * 12 + 
          (data.revenue?.retail?.monthlyRevenue || 30000) * 12;
        const avgMargin = 60; // 假设平均毛利率60%
        return totalRevenueForCOGS * (100 - avgMargin) / 100;
        
      default:
        console.warn('未知参数:', selectedParam);
        return 100;
    }
  }

  return {
    AnalysisPage
  };

})();