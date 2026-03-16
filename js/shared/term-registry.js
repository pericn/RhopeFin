// Terminology Registry
// 全局术语定义，用于 Definitions Drawer 和 Term 组件
window.RiloUI = window.RiloUI || {};

window.RiloUI.termRegistry = {
  '净利率': {
    title: '净利率',
    definition: '净利润与总收入的比率，反映企业的最终盈利能力。计算公式：净利润 ÷ 总收入 × 100%。'
  },
  '回本周期': {
    title: '回本周期',
    definition: '累计净利润覆盖初始投资所需的时间（年）。回本周期越短，投资风险越低。'
  },
  '毛利率': {
    title: '毛利率',
    definition: '毛利润与总收入的比率，反映核心业务盈利能力。计算公式：（总收入 - 直接成本）÷ 总收入 × 100%。'
  },
  '入住率': {
    title: '入住率',
    definition: '实际售出房间数占可售房间数的百分比，是衡量客房利用情况的核心指标。'
  },
  'RevPAR': {
    title: '每间可售房晚收入',
    definition: 'Revenue per Available Room，平均房价（ADR）与入住率的乘积，单位：元/间夜。综合性反映客房收入水平。'
  },
  'HQ费用': {
    title: '总部费用',
    definition: '按总收入一定比例计提的管理费用，用于覆盖总部运营、品牌、系统等公共成本。'
  },
  '总投资': {
    title: '总投资',
    definition: '包括客房装修、设备采购、开业筹备等全部前期投入。'
  },
  '情景分析': {
    title: '情景分析',
    definition: '通过设定保守、基准、乐观三种情景，评估不同经营假设下的财务表现和风险边界。'
  }
};

// 合并到 RiloUI
window.RiloUI.getTermDefinition = function(key) {
  return window.RiloUI.termRegistry[key] || null;
};
