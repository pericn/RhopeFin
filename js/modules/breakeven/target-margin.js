// 目标利润率分析模块 - 主组件
window.BreakevenTargetMargin = (function() {
  'use strict';

  /**
   * 目标利润率分析组件
   * 分析达到不同利润率目标所需的收入水平
   * @param {Object} props - 组件属性
   * @param {Object} props.breakeven - 盈亏平衡分析数据
   * @param {number} props.currentRevenue - 当前收入
   * @param {string} props.currency - 货币符号
   * @returns {React.Element} React 组件
   */
  const TargetMarginAnalysis = ({ breakeven, currentRevenue, currency }) => {
    if (!breakeven || !breakeven.requiredRevenueFor) return null;

    const targetMargins = [5, 10, 15, 20];

    return React.createElement(window.UIComponents.Section, {
      title: '目标利润率分析'
    }, [
      // 说明文本
      React.createElement('div', {
        key: 'explanation',
        className: 'bg-blue-50 rounded-lg p-3 mb-4 text-sm text-blue-700'
      }, '分析达到不同利润率目标所需的收入水平'),

      // 目标列表
      React.createElement('div', {
        key: 'targets',
        className: 'space-y-3'
      }, targetMargins.map(margin => {
        const propertyName = window.BreakevenUtils.getMarginPropertyName(margin);
        const requiredRevenue = breakeven.requiredRevenueFor[propertyName] || Infinity;
        const revenueIncrease = requiredRevenue - currentRevenue;
        const increasePercent = window.BreakevenUtils.calculateIncreasePercent(requiredRevenue, currentRevenue);
        const isAchievable = window.BreakevenUtils.isTargetMarginAchievable(requiredRevenue, currentRevenue);

        return React.createElement('div', {
          key: margin,
          className: `border rounded-lg p-4 ${isAchievable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`
        }, [
          // 头部信息
          React.createElement('div', {
            key: 'header',
            className: 'flex items-center justify-between mb-2'
          }, [
            React.createElement('span', {
              key: 'label',
              className: 'font-medium'
            }, `${margin}% 利润率`),
            React.createElement('span', {
              key: 'status',
              className: `text-xs px-2 py-1 rounded-full ${
                isAchievable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`
            }, isAchievable ? '可实现' : '困难')
          ]),

          // 详细信息
          React.createElement('div', {
            key: 'details',
            className: 'text-sm space-y-1'
          }, [
            // 所需收入
            React.createElement('div', {
              key: 'required',
              className: 'flex justify-between'
            }, [
              React.createElement('span', {
                key: 'label'
              }, '所需收入:'),
              React.createElement('span', {
                key: 'value',
                className: 'font-mono'
              }, requiredRevenue === Infinity ? '无法达到' : `${currency}${requiredRevenue.toLocaleString()}`)
            ]),

            // 需要增加的收入（仅在可实现时显示）
            isAchievable && React.createElement('div', {
              key: 'increase',
              className: 'flex justify-between'
            }, [
              React.createElement('span', {
                key: 'label'
              }, '需要增加:'),
              React.createElement('span', {
                key: 'value',
                className: 'font-mono'
              }, `${currency}${revenueIncrease.toLocaleString()} (+${increasePercent.toFixed(1)}%)`)
            ])
          ])
        ]);
      }))
    ]);
  };

  // 从计算模块暴露功能，保持API兼容性
  const calculateRequiredRevenue = window.BreakevenTargetMarginCalc.calculateRequiredRevenue;
  const generateTargetRevenueRequirements = window.BreakevenTargetMarginCalc.generateTargetRevenueRequirements;
  const analyzeTargetAchievability = window.BreakevenTargetMarginCalc.analyzeTargetAchievability;
  const getDifficultyLevel = window.BreakevenTargetMarginCalc.getDifficultyLevel;
  const getTargetRecommendations = window.BreakevenTargetMarginCalc.getTargetRecommendations;

  // 暴露公共API
  return {
    TargetMarginAnalysis,
    calculateRequiredRevenue,
    generateTargetRevenueRequirements,
    analyzeTargetAchievability,
    getDifficultyLevel,
    getTargetRecommendations
  };

})();