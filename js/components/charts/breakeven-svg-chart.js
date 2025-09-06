// SVG盈亏平衡动态图组件
// 功能：使用SVG绘制收入-利润关系图，动态显示当前经营状态相对于盈亏平衡线的位置
window.BreakevenSVGChart = (function() {

  const BreakevenSVGChart = ({ calculations }) => {
    if (!calculations || !calculations.breakeven) return null;

    const breakeven = calculations.breakeven;
    const currentRevenue = calculations.revenue?.total || 0;
    const currentCost = calculations.cost?.total || 0;
    const currentProfit = currentRevenue - currentCost;

    // 创建SVG图表数据点
    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // 计算坐标
    const maxRevenue = Math.max(currentRevenue, currentCost * 1.5);
    const xScale = chartWidth / maxRevenue;
    const yScale = chartHeight / maxRevenue;

    // 平衡线数据点 (成本 = 收入的线)
    const balanceLine = [
      { x: margin.left, y: height - margin.bottom },
      { x: margin.left + chartWidth, y: margin.top }
    ];

    // 当前状态点
    const currentPoint = {
      x: margin.left + (currentRevenue * xScale),
      y: height - margin.bottom - (currentProfit * yScale)
    };

    return React.createElement('div', {
      className: 'bg-white rounded-lg p-4 border'
    }, [
      React.createElement('h5', {
        key: 'title',
        className: 'font-medium text-gray-800 mb-4'
      }, '盈亏平衡动态分析'),
      
      React.createElement('div', {
        key: 'chart-container',
        className: 'flex justify-center'
      },
        React.createElement('svg', {
          width: width,
          height: height,
          viewBox: `0 0 ${width} ${height}`,
          className: 'border rounded'
        }, [
          // 网格线
          ...Array.from({ length: 5 }, (_, i) => {
            const y = margin.top + (chartHeight / 4) * i;
            return React.createElement('line', {
              key: `grid-${i}`,
              x1: margin.left,
              y1: y,
              x2: margin.left + chartWidth,
              y2: y,
              stroke: '#e5e7eb',
              strokeWidth: 1
            });
          }),

          // 平衡线
          React.createElement('line', {
            key: 'balance-line',
            x1: balanceLine[0].x,
            y1: balanceLine[0].y,
            x2: balanceLine[1].x,
            y2: balanceLine[1].y,
            stroke: '#ef4444',
            strokeWidth: 2,
            strokeDasharray: '5,5'
          }),

          // 当前状态点
          React.createElement('circle', {
            key: 'current-point',
            cx: currentPoint.x,
            cy: currentPoint.y,
            r: 6,
            fill: currentProfit > 0 ? '#10b981' : '#ef4444',
            stroke: '#fff',
            strokeWidth: 2
          }),

          // 坐标轴
          React.createElement('line', {
            key: 'x-axis',
            x1: margin.left,
            y1: height - margin.bottom,
            x2: margin.left + chartWidth,
            y2: height - margin.bottom,
            stroke: '#374151',
            strokeWidth: 2
          }),
          React.createElement('line', {
            key: 'y-axis',
            x1: margin.left,
            y1: margin.top,
            x2: margin.left,
            y2: height - margin.bottom,
            stroke: '#374151',
            strokeWidth: 2
          }),

          // 标签
          React.createElement('text', {
            key: 'x-label',
            x: margin.left + chartWidth / 2,
            y: height - 5,
            textAnchor: 'middle',
            fontSize: '12',
            fill: '#374151'
          }, '收入'),
          React.createElement('text', {
            key: 'y-label',
            x: 15,
            y: margin.top + chartHeight / 2,
            textAnchor: 'middle',
            fontSize: '12',
            fill: '#374151',
            transform: `rotate(-90 15 ${margin.top + chartHeight / 2})`
          }, '利润'),

          // 当前点标注
          React.createElement('text', {
            key: 'current-label',
            x: currentPoint.x,
            y: currentPoint.y - 10,
            textAnchor: 'middle',
            fontSize: '10',
            fill: '#374151'
          }, '当前状态')
        ])
      ),

      React.createElement('div', {
        key: 'legend',
        className: 'mt-4 text-xs text-gray-600 text-center'
      }, [
        React.createElement('div', {
          key: 'line-desc',
          className: 'mb-1'
        }, '红色虚线: 盈亏平衡线 (利润 = 0)'),
        React.createElement('div', {
          key: 'point-desc'
        }, currentProfit > 0 ? '绿色点: 当前盈利状态' : '红色点: 当前亏损状态')
      ])
    ]);
  };

  return {
    BreakevenSVGChart
  };

})();