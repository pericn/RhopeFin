// 参数设置页面 v2.1 - 统一“左主内容 + 右侧 InspectorPanel（结论/过程/术语）”布局
window.SettingsPage = (function() {

  // 主设置页面组件
  const SettingsPage = ({ data, updateData, formulaEngine }) => {
    const glossaryTerms = {
      fitout: { title: '装修标准', body: '每平米装修投入标准。影响初始投资与回本周期。' },
      cogs: { title: '业务成本 (COGS)', body: '随收入发生的直接成本，不含租金/人工等固定成本。' },
      margin: { title: '利润率', body: '净利润 ÷ 总收入。用于衡量整体经营效率。' }
    };

    const left = React.createElement('div', { className: 'space-y-6' }, [
      // 基础设置
      React.createElement(window.BasicSettings.BasicSettings, {
        key: 'basic-settings',
        data,
        updateData
      }),

      // 核心配置（原先左右分栏，这里统一放到左侧作为主内容）
      React.createElement(window.UIComponents.Space, {
        key: 'main-stack',
        direction: 'vertical',
        size: 'large',
        style: { width: '100%' }
      }, [
        React.createElement(window.InvestmentSettings.InvestmentSettings, {
          key: 'investment-settings',
          data,
          updateData
        }),
        React.createElement(window.CostSettings.CostSettings, {
          key: 'cost-settings',
          data,
          updateData,
          formulaEngine
        }),
        React.createElement(window.RevenueSettings.RevenueSettings, {
          key: 'revenue-settings',
          data,
          updateData,
          formulaEngine
        })
      ]),

      // 底部工具栏
      React.createElement('div', {
        key: 'bottom-toolbar',
        className: 'mt-8 pt-6 border-t border-gray-200'
      }, [
        React.createElement(window.UIComponents.Row, {
          key: 'toolbar-row',
          justify: 'space-between',
          align: 'middle'
        }, [
          React.createElement(window.UIComponents.Col, { key: 'help-col' },
            React.createElement(window.CustomModules.FormulaHelpPanel, { formulaEngine })
          ),

          React.createElement(window.UIComponents.Col, { key: 'actions-col' },
            React.createElement(window.UIComponents.Space, null, [
              React.createElement(window.UIComponents.Button, {
                key: 'preset-btn',
                onClick: () => {
                  if (window.dataManager) {
                    const presetData = window.dataManager.applyPreset();
                    // 保留用户的项目名称
                    const preservedProjectName = data?.basic?.projectName;
                    if (preservedProjectName && preservedProjectName !== "Hopeful 宠物综合体（示例）") {
                      presetData.basic.projectName = preservedProjectName;
                    }
                    updateData(presetData);
                  }
                }
              }, '📋 套用预设参数'),

              React.createElement(window.UIComponents.Button, {
                key: 'export-btn',
                onClick: () => {
                  if (window.dataManager) window.dataManager.exportData(data);
                },
                variant: 'secondary'
              }, '💾 导出数据')
            ])
          )
        ])
      ])
    ]);

    const conclusion = React.createElement('div', { className: 'space-y-3 text-sm text-gray-700' }, [
      React.createElement('div', { key: 'c1', className: 'rounded-xl border border-gray-200 bg-white p-3' }, [
        React.createElement('div', { key: 't', className: 'font-semibold text-gray-900' }, '怎么用这个页'),
        React.createElement('div', { key: 'b', className: 'mt-1' }, '左侧填参数；右侧 Inspector 里看公式/过程/术语解释。默认把细节收起来，避免信息噪音。')
      ]),
      React.createElement('div', { key: 'c2', className: 'rounded-xl border border-gray-200 bg-white p-3' }, [
        React.createElement('div', { key: 't', className: 'font-semibold text-gray-900' }, '小建议'),
        React.createElement('ul', { key: 'b', className: 'mt-1 list-disc pl-5 space-y-1' }, [
          React.createElement('li', { key: 'i1' }, '先把“基础设置/面积/人力/租金”填准，再调收入结构。'),
          React.createElement('li', { key: 'i2' }, '回本周期跑飞时，多半是净利润≤0 或 初始投资太高。')
        ])
      ])
    ]);

    const process = React.createElement('div', { className: 'space-y-3' }, [
      React.createElement('div', { key: 'p1', className: 'text-xs text-gray-500' }, '这里展示公式与中间计算值，默认折叠；需要核对时再展开。'),
      React.createElement('div', { key: 'p2', className: 'bg-gray-50 rounded-2xl p-3 border border-gray-200' }, [
        React.createElement('h3', { key: 't', className: 'text-sm font-semibold text-gray-700 mb-2' }, '📊 计算公式与数据'),
        React.createElement(window.FormulaDisplay.FormulaDisplay, {
          key: 'formula-display-component',
          data,
          formulaEngine
        })
      ])
    ]);

    return window.RiloUI?.TwoPaneLayout ? React.createElement(window.RiloUI.TwoPaneLayout, {
      left,
      inspectorTitle: '参数配置 Inspector',
      conclusion,
      process,
      glossaryTerms
    }) : left;
  };

  return { SettingsPage };

})();
