// 情景分析洞察模块
// 提供基于情景分析结果的智能洞察和分析

window.ScenarioInsights = (function() {

  // 主要洞察组件
  const ScenarioInsights = ({ calculations, currency }) => {
    const insights = generateInsights(calculations, currency);

    return React.createElement(window.UIComponents.Section, {
      title: '💡 情景分析洞察'
    }, [
      insights.length === 0 && React.createElement('div', {
        key: 'no-insights',
        className: 'text-center py-8 text-gray-500'
      }, '暂无分析洞察'),

      React.createElement('div', {
        key: 'insights',
        className: 'space-y-4'
      }, insights.map((insight, index) => 
        React.createElement(window.RiloUI.InsightCard, {
          key: index,
          insight: insight
        })
      ))
    ]);
  };

  // 生成洞察分析
  const generateInsights = (calculations, currency) => {
    const insights = [];
    const analysisData = extractAnalysisData(calculations);

    // 收益潜力分析
    insights.push(...generateRevenueInsights(analysisData, currency));
    
    // 风险敞口分析
    insights.push(...generateRiskInsights(analysisData, currency));
    
    // 盈利稳定性分析
    insights.push(...generateStabilityInsights(analysisData));
    
    // 投资回本分析
    insights.push(...generatePaybackInsights(analysisData));

    return insights;
  };

  // 提取分析数据
  const extractAnalysisData = (calculations) => {
    const baseProfit = calculations.profitability?.profit || 0;
    const optimisticProfit = calculations.scenarios.optimistic?.profit || 0;
    const conservativeProfit = calculations.scenarios.conservative?.profit || 0;

    const optimisticUpside = optimisticProfit - baseProfit;
    const conservativeDownside = baseProfit - conservativeProfit;

    const optimisticPayback = calculations.scenarios.optimistic?.paybackYears || Infinity;
    const conservativePayback = calculations.scenarios.conservative?.paybackYears || Infinity;
    const basePayback = calculations.profitability?.paybackYears || Infinity;

    return {
      baseProfit,
      optimisticProfit,
      conservativeProfit,
      optimisticUpside,
      conservativeDownside,
      optimisticPayback,
      conservativePayback,
      basePayback
    };
  };

  // 收益潜力洞察
  const generateRevenueInsights = (data, currency) => {
    const insights = [];
    
    if (data.optimisticUpside > 0) {
      const upsidePercent = Math.abs(data.baseProfit) > 0 ? 
        ((data.optimisticUpside / Math.abs(data.baseProfit)) * 100).toFixed(1) : 0;
      
      insights.push({
        type: 'positive',
        title: '乐观收益潜力',
        content: `乐观情况下可额外获得${currency}${data.optimisticUpside.toLocaleString()}收益，增幅${upsidePercent}%`,
        icon: '🚀'
      });
    }

    return insights;
  };

  // 风险敞口洞察
  const generateRiskInsights = (data, currency) => {
    const insights = [];
    
    if (data.conservativeDownside > 0) {
      const downsidePercent = Math.abs(data.baseProfit) > 0 ? 
        ((data.conservativeDownside / Math.abs(data.baseProfit)) * 100).toFixed(1) : 0;
      
      insights.push({
        type: 'warning',
        title: '保守风险敞口',
        content: `保守情况下可能损失${currency}${data.conservativeDownside.toLocaleString()}收益，降幅${downsidePercent}%`,
        icon: '⚠️'
      });
    }

    return insights;
  };

  // 盈利稳定性洞察
  const generateStabilityInsights = (data) => {
    const insights = [];
    
    const allProfitable = data.optimisticProfit > 0 && data.baseProfit > 0 && data.conservativeProfit > 0;
    const allLoss = data.optimisticProfit <= 0 && data.baseProfit <= 0 && data.conservativeProfit <= 0;

    if (allProfitable) {
      insights.push({
        type: 'positive',
        title: '盈利稳定性高',
        content: '所有情景下均能实现盈利，业务模型具有较强抗风险能力',
        icon: '💪'
      });
    } else if (allLoss) {
      insights.push({
        type: 'negative',
        title: '需要优化模型',
        content: '所有情景下均存在亏损，建议重新评估收入和成本结构',
        icon: '🔄'
      });
    } else {
      insights.push({
        type: 'info',
        title: '盈利能力波动较大',
        content: '不同情景下盈利能力差异明显，需要关注关键风险因素',
        icon: '📊'
      });
    }

    return insights;
  };

  // 投资回本洞察
  const generatePaybackInsights = (data) => {
    const insights = [];
    
    if (data.optimisticPayback < Infinity && data.conservativePayback < Infinity) {
      const paybackRange = Math.abs(data.optimisticPayback - data.conservativePayback);
      
      if (paybackRange < 2) {
        insights.push({
          type: 'positive',
          title: '回本周期稳定',
          content: `各情景回本周期差异较小(${paybackRange.toFixed(1)}年)，投资风险可控`,
          icon: '⏰'
        });
      } else {
        insights.push({
          type: 'warning',
          title: '回本周期波动大',
          content: `各情景回本周期相差${paybackRange.toFixed(1)}年，需要谨慎评估投资风险`,
          icon: '⏱️'
        });
      }
    }

    return insights;
  };

  // 计算关键指标
  const calculateKeyMetrics = (calculations) => {
    const data = extractAnalysisData(calculations);
    
    return {
      riskRewardRatio: Math.abs(data.conservativeDownside) > 0 ? 
        data.optimisticUpside / Math.abs(data.conservativeDownside) : Infinity,
      profitVolatility: Math.abs(data.optimisticProfit - data.conservativeProfit),
      scenarioRange: {
        profit: data.optimisticProfit - data.conservativeProfit,
        payback: data.optimisticPayback !== Infinity && data.conservativePayback !== Infinity ? 
          data.optimisticPayback - data.conservativePayback : Infinity
      }
    };
  };

  // 生成洞察摘要
  const generateInsightsSummary = (calculations, currency) => {
    const insights = generateInsights(calculations, currency);
    const metrics = calculateKeyMetrics(calculations);
    
    const positiveCount = insights.filter(i => i.type === 'positive').length;
    const warningCount = insights.filter(i => i.type === 'warning').length;
    const negativeCount = insights.filter(i => i.type === 'negative').length;
    
    return {
      totalInsights: insights.length,
      positiveCount,
      warningCount,
      negativeCount,
      overallRisk: negativeCount > positiveCount ? 'high' : 
                   warningCount > positiveCount ? 'medium' : 'low',
      keyMetrics: metrics
    };
  };

  return {
    ScenarioInsights,
    generateInsights,
    extractAnalysisData,
    calculateKeyMetrics,
    generateInsightsSummary
  };

})();
