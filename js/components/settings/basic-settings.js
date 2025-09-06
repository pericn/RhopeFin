// 基础设置组件 - 项目基本信息配置
window.BasicSettings = (function() {

  const BasicSettings = ({ data, updateData }) => {
    const updateField = (path, value) => {
      if (window.dataManager) {
        const newData = window.dataManager.updateDataPath(data, path, value);
        updateData(newData);
      }
    };

    // 计算基础数据
    const calculateBasicData = () => {
      const area = data?.basic?.areaSqm || 0;
      const days = data?.basic?.daysPerYear || 365;
      return {
        dailyArea: area,
        monthlyArea: area * 30,
        yearlyArea: area * days
      };
    };

    const basicData = calculateBasicData();

    return React.createElement(window.UIComponents.Section, {
      title: '🏢 基础设置'
    }, React.createElement(window.UIComponents.Space, {
      direction: 'vertical',
      size: 'middle',
      style: { width: '100%' }
    }, [
      // 自左排列的输入框布局 - 固定间距，指定输入框尺寸
      React.createElement('div', {
        key: 'basic-inputs-row',
        className: 'flex gap-4 w-full mb-4'
      }, [
        // 项目名称 (文字输入 - 50% width)
        React.createElement(window.UIComponents.Input, {
          label: '项目名称',
          type: 'text',
          value: data?.basic?.projectName || '',
          onChange: (value) => updateField('basic.projectName', value),
          width: '50%'
        }),

        // 营业面积 (数字输入 - 25% width)
        React.createElement(window.UIComponents.Input, {
          label: '营业面积 (㎡)',
          value: data?.basic?.areaSqm || 0,
          onChange: (value) => updateField('basic.areaSqm', value),
          hint: '店面的总营业面积',
          width: '25%'
        }),

        // 年营业天数 (数字输入 - 25% width)
        React.createElement(window.UIComponents.Input, {
          key: 'days-input',
          label: '年营业天数',
          value: data?.basic?.daysPerYear || 365,
          onChange: (value) => updateField('basic.daysPerYear', value),
          hint: '每年实际营业的天数',
          width: '25%'
        })
      ]),

      React.createElement(BasicDataDisplay, {
        key: 'basic-calculations',
        data: basicData
      })
    ]));
  };

  // 基础计算数据显示组件
  const BasicDataDisplay = ({ data }) => {
    return React.createElement('div', {
      style: { 
        marginTop: '8px',
        paddingTop: '8px',
        borderTop: '1px solid #f0f0f0'
      }
    }, [
      React.createElement('div', {
        key: 'area-info',
        className: 'text-xs text-gray-500',
        style: { marginBottom: '4px' }
      }, `营业面积: ${data.dailyArea}㎡/日 | ${data.monthlyArea}㎡/月`),
      React.createElement('div', {
        key: 'days-info',
        className: 'text-xs text-gray-500'
      }, `年度面积: ${data.yearlyArea.toLocaleString()}㎡·天`)
    ]);
  };

  return {
    BasicSettings
  };

})();