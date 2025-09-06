// 情景分析建议模块
// 基于情景分析结果生成智能经营建议和行动计划

window.ScenarioRecommendations = (function() {

  // 主要建议组件
  const ScenarioRecommendations = ({ calculations, currency }) => {
    const recommendations = generateRecommendations(calculations, currency);

    return React.createElement(window.UIComponents.Section, {
      title: '📋 经营建议'
    }, [
      recommendations.length === 0 && React.createElement('div', {
        key: 'no-recommendations',
        className: 'text-center py-8 text-gray-500'
      }, '暂无经营建议'),

      React.createElement('div', {
        key: 'recommendations',
        className: 'space-y-4'
      }, recommendations.map((rec, index) => 
        React.createElement(RecommendationCard, {
          key: index,
          recommendation: rec
        })
      ))
    ]);
  };

  // 建议卡片组件
  const RecommendationCard = ({ recommendation }) => {
    const priorityColors = getPriorityColorClasses();

    return React.createElement('div', {
      className: `border rounded-lg p-4 ${priorityColors[recommendation.priority]}`
    }, [
      React.createElement('div', {
        key: 'header',
        className: 'flex items-center gap-2 mb-2'
      }, [
        React.createElement('span', {
          key: 'icon',
          className: 'text-lg'
        }, recommendation.icon),
        React.createElement('h5', {
          key: 'title',
          className: 'font-medium'
        }, recommendation.title),
        React.createElement('span', {
          key: 'priority',
          className: `text-xs px-2 py-1 rounded-full font-medium ${getPriorityBadgeClass(recommendation.priority)}`
        }, getPriorityLabel(recommendation.priority))
      ]),
      React.createElement('div', {
        key: 'content',
        className: 'text-sm whitespace-pre-line'
      }, recommendation.content)
    ]);
  };

  // 生成经营建议
  const generateRecommendations = (calculations, currency) => {
    const recommendations = [];
    const analysisData = extractRecommendationData(calculations);

    // 风险管理建议
    recommendations.push(...generateRiskManagementRecommendations(analysisData));
    
    // 增长机会建议
    recommendations.push(...generateGrowthRecommendations(analysisData));
    
    // 运营优化建议
    recommendations.push(...generateOperationalRecommendations(analysisData));

    // 按优先级排序
    return sortRecommendationsByPriority(recommendations);
  };

  // 提取建议数据
  const extractRecommendationData = (calculations) => {
    const baseProfit = calculations.profitability?.profit || 0;
    const optimisticProfit = calculations.scenarios.optimistic?.profit || 0;
    const conservativeProfit = calculations.scenarios.conservative?.profit || 0;

    return {
      baseProfit,
      optimisticProfit,
      conservativeProfit,
      baseMargin: calculations.profitability?.margin || 0,
      optimisticMargin: calculations.scenarios.optimistic?.margin || 0,
      conservativeMargin: calculations.scenarios.conservative?.margin || 0,
      allProfitable: optimisticProfit > 0 && baseProfit > 0 && conservativeProfit > 0,
      allLoss: optimisticProfit <= 0 && baseProfit <= 0 && conservativeProfit <= 0,
      hasRisk: conservativeProfit <= 0,
      hasGrowthPotential: optimisticProfit > baseProfit * 1.5
    };
  };

  // 风险管理建议
  const generateRiskManagementRecommendations = (data) => {
    const recommendations = [];

    if (data.hasRisk || data.conservativeProfit <= 0) {
      recommendations.push({
        priority: 'high',
        title: '提高抗风险能力',
        content: '保守情况下出现亏损，建议：\n1. 降低固定成本\n2. 提高收入稳定性\n3. 增加多元化收入来源\n4. 建立现金流缓冲\n5. 制定应急预案',
        icon: '🛡️'
      });
    }

    if (data.allLoss) {
      recommendations.push({
        priority: 'high',
        title: '紧急业务调整',
        content: '所有情景均亏损，紧急建议：\n1. 重新评估商业模式\n2. 大幅降低成本结构\n3. 寻找新的收入来源\n4. 考虑业务转型\n5. 评估退出策略',
        icon: '🚨'
      });
    }

    return recommendations;
  };

  // 增长机会建议
  const generateGrowthRecommendations = (data) => {
    const recommendations = [];

    if (data.hasGrowthPotential && data.baseProfit > 0) {
      recommendations.push({
        priority: 'medium',
        title: '把握增长机会',
        content: '乐观情况下收益显著提升，建议：\n1. 制定收入增长计划\n2. 投资营销推广\n3. 扩大业务规模\n4. 提升服务质量\n5. 开拓新市场',
        icon: '📈'
      });
    }

    if (data.optimisticMargin > data.baseMargin + 10) {
      recommendations.push({
        priority: 'medium',
        title: '利润率优化',
        content: '利润率提升潜力较大，建议：\n1. 优化成本结构\n2. 提高定价策略\n3. 改善运营效率\n4. 投资自动化\n5. 强化供应链管理',
        icon: '⚡'
      });
    }

    return recommendations;
  };

  // 运营优化建议
  const generateOperationalRecommendations = (data) => {
    const recommendations = [];

    if (data.allProfitable) {
      recommendations.push({
        priority: 'low',
        title: '优化经营效率',
        content: '所有情景均盈利，可考虑：\n1. 提升服务质量\n2. 探索新业务模式\n3. 建立竞争优势\n4. 投资技术升级\n5. 培养团队能力',
        icon: '⭐'
      });
    }

    if (!data.allProfitable && !data.allLoss) {
      recommendations.push({
        priority: 'medium',
        title: '稳定盈利能力',
        content: '盈利波动较大，建议：\n1. 分析关键风险因素\n2. 建立预警机制\n3. 制定情景应对策略\n4. 提高业务韧性\n5. 加强财务管控',
        icon: '⚖️'
      });
    }

    return recommendations;
  };

  // 按优先级排序建议
  const sortRecommendationsByPriority = (recommendations) => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  };

  // 获取优先级颜色类
  const getPriorityColorClasses = () => ({
    high: 'bg-red-50 border-red-200 text-red-800',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    low: 'bg-blue-50 border-blue-200 text-blue-800'
  });

  // 获取优先级徽章类
  const getPriorityBadgeClass = (priority) => ({
    high: 'bg-red-100',
    medium: 'bg-yellow-100',
    low: 'bg-blue-100'
  }[priority]);

  // 获取优先级标签
  const getPriorityLabel = (priority) => ({
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }[priority]);

  // 生成行动计划
  const generateActionPlan = (calculations, currency) => {
    const recommendations = generateRecommendations(calculations, currency);
    const highPriority = recommendations.filter(r => r.priority === 'high');
    const mediumPriority = recommendations.filter(r => r.priority === 'medium');
    const lowPriority = recommendations.filter(r => r.priority === 'low');

    return {
      immediate: highPriority,
      shortTerm: mediumPriority,
      longTerm: lowPriority,
      timeline: {
        immediate: '1-30天',
        shortTerm: '1-3个月',
        longTerm: '3-12个月'
      }
    };
  };

  // 评估建议实施影响
  const assessImplementationImpact = (recommendation, calculations) => {
    // 基于建议类型评估潜在影响
    const impactScores = {
      '提高抗风险能力': { risk: -30, revenue: 5, cost: -10 },
      '把握增长机会': { risk: 10, revenue: 25, cost: 5 },
      '优化经营效率': { risk: -10, revenue: 10, cost: -15 },
      '紧急业务调整': { risk: -50, revenue: -20, cost: -40 }
    };

    return impactScores[recommendation.title] || { risk: 0, revenue: 0, cost: 0 };
  };

  return {
    ScenarioRecommendations,
    RecommendationCard,
    generateRecommendations,
    generateActionPlan,
    assessImplementationImpact,
    sortRecommendationsByPriority
  };

})();