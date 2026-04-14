// 基础设置组件 - 项目基本信息配置
window.BasicSettings = (function() {

  const BasicSettings = ({ data, updateData }) => {
    const updateField = (path, value) => {
      if (window.dataManager) {
        // 从 dataManager 读取最新数据，避免闭包捕获旧 data prop
        const latestData = window.dataManager.getData() || data;
        const newData = window.dataManager.updateDataPath(latestData, path, value);
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
      title: '基础参数'
    }, React.createElement(window.UIComponents.Space, {
      direction: 'vertical',
      size: 'middle',
      style: { width: '100%' }
    }, [
      React.createElement('div', {
        key: 'basic-primary-grid',
        className: 'settings-basic-grid'
      }, [
        React.createElement(window.UIComponents.Input, {
          key: 'area-input',
          label: '营业面积',
          value: data?.basic?.areaSqm || 0,
          onChange: (value) => updateField('basic.areaSqm', value),
          suffix: '㎡',
          hint: '填写实际营业面积',
          width: '100%'
        }),
        React.createElement(window.UIComponents.Input, {
          key: 'days-input',
          label: '营业天数',
          value: data?.basic?.daysPerYear || 365,
          onChange: (value) => updateField('basic.daysPerYear', value),
          hint: '按全年实际开门天数填写',
          width: '100%'
        })
      ]),

      React.createElement('div', {
        key: 'assumptions-row',
        className: 'settings-basic-grid settings-basic-grid--compact'
      }, [
        React.createElement(window.UIComponents.Input, {
          key: 'cac-input',
          label: 'CAC（获客成本）',
          value: data?.assumptions?.cac ?? 0,
          onChange: (value) => updateField('assumptions.cac', value),
          hint: '单个付费客户的平均获客成本',
          width: '100%'
        }),
        React.createElement(window.UIComponents.Input, {
          key: 'ltv-input',
          label: 'LTV（客户生命周期价值）',
          value: data?.assumptions?.ltv ?? 0,
          onChange: (value) => updateField('assumptions.ltv', value),
          hint: '单客户预期贡献，可先用收入近似',
          width: '100%'
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
      className: 'settings-field-copy',
      style: {
        marginTop: '8px',
        paddingTop: '10px',
        borderTop: '1px solid rgba(34, 31, 26, 0.08)'
      }
    }, [
      React.createElement('div', {
        key: 'area-info',
        className: 'text-xs text-[var(--rilo-text-2)]',
        style: { marginBottom: '4px' }
      }, `营业面积：${data.dailyArea}㎡/日 | ${data.monthlyArea}㎡/月`),
      React.createElement('div', {
        key: 'days-info',
        className: 'text-xs text-[var(--rilo-text-2)]'
      }, `年度面积：${data.yearlyArea.toLocaleString()}㎡·天`)
    ]);
  };

  return {
    BasicSettings
  };

})();
