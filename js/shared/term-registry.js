// Terminology Registry
// 全局术语定义，用于 Definitions Drawer 和 Term 组件
window.RiloUI = window.RiloUI || {};

window.RiloUI.normalizeTermDefinition = function(term, key) {
  if (!term) return null;

  return {
    key,
    title: term.title || key,
    body: term.body || term.definition || '',
    definition: term.definition || term.body || ''
  };
};

window.RiloUI.getGlossaryEntries = function(...sources) {
  const merged = Object.assign({}, ...sources.filter(Boolean));
  const seenTitles = new Set();

  return Object.entries(merged)
    .map(([key, def]) => [
      key,
      window.RiloUI.normalizeTermDefinition ? window.RiloUI.normalizeTermDefinition(def, key) : def
    ])
    .filter(([, def]) => !!def)
    .filter(([, def]) => {
      const fingerprint = `${String(def.title || '').trim().toLowerCase()}::${String(def.body || def.definition || '').trim()}`;
      if (!fingerprint || seenTitles.has(fingerprint)) return false;
      seenTitles.add(fingerprint);
      return true;
    });
};

window.RiloUI.termRegistry = {
  'adr': {
    title: 'ADR',
    definition: 'Average Daily Rate，平均房价。用于衡量每个已售房晚平均卖多少钱。'
  },
  'occ': {
    title: 'Occ',
    definition: 'Occupancy，入住率。实际售出房晚占可售房晚的比例，输入会被限制在 0–100%。'
  },
  'rooms': {
    title: 'Rooms',
    definition: '可售房间数。用于估算寄养业务的最大供给能力。'
  },
  'days': {
    title: 'Days',
    definition: '年营业天数。用于把日均经营能力换算成全年规模。'
  },
  'revpar': {
    title: 'RevPAR',
    definition: 'Revenue per Available Room，每间可售房晚收入，约等于 ADR × 入住率。'
  },
  'rentToSales': {
    title: '租金占收比',
    definition: '租金占总收入的比例，用于判断房租压力是否健康。常见经验值是控制在 15%–25% 区间内。'
  },
  'breakevenOcc': {
    title: '盈亏平衡入住率',
    definition: '在当前房价、房量、营业天数与成本结构下，寄养业务刚好覆盖成本所需的最低入住率。'
  },
  'cmPerRoomNight': {
    title: '每间夜贡献利润',
    definition: '每卖出一个房晚带来的贡献利润，约等于寄养收入减去寄养直接成本后，再除以已售房晚。'
  },
  'acquisitionEfficiency': {
    title: '获客效率',
    definition: '这里用 LTV:CAC 近似表示，即单个客户生命周期价值除以获客成本；越高说明获客越划算。'
  },
  'profit': {
    title: '净利润',
    definition: '年度总收入减去年度总成本后的结果，反映经营最终留下来的利润。'
  },
  'netMargin': {
    title: '净利润率',
    definition: '净利润 ÷ 总收入 × 100%，用于衡量整体经营效率。'
  },
  'grossMargin': {
    title: '综合毛利率',
    definition: '毛利润 ÷ 总收入 × 100%，反映核心业务本身的赚钱能力。'
  },
  'payback': {
    title: '回本周期',
    definition: '初始投资 ÷ 年净利润；若净利润≤0，则视为无法回本。'
  },
  'sensitivity': {
    title: '敏感度分析',
    definition: '固定其他条件，只改变一个参数，观察关键结果如何变化，用来识别最敏感的经营杠杆。'
  },
  'cogs': {
    title: '业务成本 (COGS)',
    definition: 'Cost of Goods Sold。直接随收入发生的成本，不含租金、人工等固定成本。'
  }
};

// 合并到 RiloUI
window.RiloUI.getTermDefinition = function(key) {
  return window.RiloUI.normalizeTermDefinition(window.RiloUI.termRegistry[key], key);
};
