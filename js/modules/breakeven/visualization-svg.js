// 盈亏平衡可视化SVG组件模块
window.BreakevenVisualizationSVG = (function() {
  'use strict';

  /**
   * 创建坐标轴
   * @returns {Array} 坐标轴元素数组
   */
  const createAxes = () => {
    return [
      // X轴
      React.createElement('line', {
        key: 'x-axis',
        x1: '40',
        y1: '260',
        x2: '380',
        y2: '260',
        stroke: '#374151',
        strokeWidth: '2'
      }),
      // Y轴
      React.createElement('line', {
        key: 'y-axis',
        x1: '40',
        y1: '20',
        x2: '40',
        y2: '260',
        stroke: '#374151',
        strokeWidth: '2'
      })
    ];
  };

  /**
   * 创建利润线
   * @param {Array} dataPoints - 数据点数组
   * @param {number} maxRevenue - 最大收入值
   * @returns {Array} 利润线元素数组
   */
  const createProfitLine = (dataPoints, maxRevenue) => {
    return dataPoints.map((point, index) => {
      if (index === 0) return null;
      const prevPoint = dataPoints[index - 1];
      const x1 = 40 + (prevPoint.revenue / maxRevenue) * 340;
      const y1 = 140 - (prevPoint.profit / maxRevenue) * 120;
      const x2 = 40 + (point.revenue / maxRevenue) * 340;
      const y2 = 140 - (point.profit / maxRevenue) * 120;

      return React.createElement('line', {
        key: `profit-line-${index}`,
        x1: x1.toString(),
        y1: y1.toString(),
        x2: x2.toString(),
        y2: y2.toString(),
        stroke: '#10B981',
        strokeWidth: '3'
      });
    }).filter(Boolean);
  };

  /**
   * 创建坐标轴标签
   * @returns {Array} 标签元素数组
   */
  const createAxisLabels = () => {
    return [
      React.createElement('text', {
        key: 'x-label',
        x: '210',
        y: '290',
        textAnchor: 'middle',
        fontSize: '12',
        fill: '#374151'
      }, '收入'),
      React.createElement('text', {
        key: 'y-label',
        x: '20',
        y: '145',
        textAnchor: 'middle',
        fontSize: '12',
        fill: '#374151',
        transform: 'rotate(-90 20 145)'
      }, '利润')
    ];
  };

  /**
   * 创建点标注
   * @param {Object} breakevenPoint - 盈亏平衡点
   * @param {Object} currentPoint - 当前状态点
   * @param {number} maxRevenue - 最大收入值
   * @returns {Array} 标注元素数组
   */
  const createPointLabels = (breakevenPoint, currentPoint, maxRevenue) => {
    return [
      React.createElement('text', {
        key: 'breakeven-label',
        x: (40 + (breakevenPoint.revenue / maxRevenue) * 340).toString(),
        y: '125',
        textAnchor: 'middle',
        fontSize: '10',
        fill: '#F59E0B'
      }, '平衡点'),
      React.createElement('text', {
        key: 'current-label',
        x: (40 + (currentPoint.revenue / maxRevenue) * 340).toString(),
        y: (125 - (currentPoint.profit / maxRevenue) * 120).toString(),
        textAnchor: 'middle',
        fontSize: '10',
        fill: '#374151'
      }, '当前')
    ];
  };

  /**
   * 创建图例
   * @param {Object} currentPoint - 当前状态点
   * @returns {Array} 图例元素数组
   */
  const createLegend = (currentPoint) => {
    return [
      React.createElement('div', {
        key: 'profit-line',
        className: 'flex items-center'
      }, [
        React.createElement('div', {
          key: 'color',
          className: 'w-4 h-0.5 bg-green-500 mr-2'
        }),
        React.createElement('span', {
          key: 'label'
        }, '利润线')
      ]),
      React.createElement('div', {
        key: 'breakeven-line',
        className: 'flex items-center'
      }, [
        React.createElement('div', {
          key: 'color',
          className: 'w-4 h-0.5 bg-red-500 border-dashed mr-2'
        }),
        React.createElement('span', {
          key: 'label'
        }, '盈亏平衡线')
      ]),
      React.createElement('div', {
        key: 'breakeven-point',
        className: 'flex items-center'
      }, [
        React.createElement('div', {
          key: 'color',
          className: 'w-3 h-3 bg-yellow-500 rounded-full mr-2'
        }),
        React.createElement('span', {
          key: 'label'
        }, '平衡点')
      ]),
      React.createElement('div', {
        key: 'current-point',
        className: 'flex items-center'
      }, [
        React.createElement('div', {
          key: 'color',
          className: `w-3 h-3 rounded-full mr-2 ${currentPoint.profit > 0 ? 'bg-green-500' : 'bg-red-500'}`
        }),
        React.createElement('span', {
          key: 'label'
        }, '当前状态')
      ])
    ];
  };

  // 暴露公共API
  return {
    createAxes,
    createProfitLine,
    createAxisLabels,
    createPointLabels,
    createLegend
  };

})();