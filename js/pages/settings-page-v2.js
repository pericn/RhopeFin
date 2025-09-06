// 参数设置页面 v2.0 - 左右双栏布局，使用模块化组件
window.SettingsPage = (function() {

  // 主设置页面组件 - 左右双栏布局
  const SettingsPage = ({ data, updateData, formulaEngine }) => {
    return React.createElement('div', {
      className: 'space-y-6'
    }, [
      // 基础设置 - 占据100%宽度
      React.createElement(window.BasicSettings.BasicSettings, {
        key: 'basic-settings',
        data: data,
        updateData: updateData
      }),

      // 左右双栏布局 (3:2)
      React.createElement(window.UIComponents.Row, {
        key: 'main-content',
        gutter: [24, 24]
      }, [
        // 左栏：投资设置 + 成本设置 + 收入设置 (3/5宽度)
        React.createElement(window.UIComponents.Col, {
          key: 'left-column',
          xs: 24,
          lg: 14
        }, React.createElement(window.UIComponents.Space, {
          direction: 'vertical',
          size: 'large',
          style: { width: '100%' }
        }, [
          // 投资设置
          React.createElement(window.InvestmentSettings.InvestmentSettings, {
            key: 'investment-settings',
            data: data,
            updateData: updateData
          }),

          // 成本设置
          React.createElement(window.CostSettings.CostSettings, {
            key: 'cost-settings',
            data: data,
            updateData: updateData,
            formulaEngine: formulaEngine
          }),

          // 收入设置
          React.createElement(window.RevenueSettings.RevenueSettings, {
            key: 'revenue-settings',
            data: data,
            updateData: updateData,
            formulaEngine: formulaEngine
          })
        ])),

        // 右栏：计算数据和公式显示 (2/5宽度)
        React.createElement(window.UIComponents.Col, {
          key: 'right-column',
          xs: 24,
          lg: 10
        }, React.createElement('div', {
          key: 'formula-display',
          className: 'bg-gray-50 rounded-2xl p-4 border border-gray-200'
        }, [
          React.createElement('h3', {
            key: 'title',
            className: 'text-md font-semibold text-gray-700 mb-3'
          }, '📊 计算公式与数据'),
          React.createElement(window.FormulaDisplay.FormulaDisplay, {
            key: 'formula-display-component',
            data: data,
            formulaEngine: formulaEngine
          })
        ]))
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
          React.createElement(window.UIComponents.Col, {
            key: 'help-col'
          }, React.createElement(window.CustomModules.FormulaHelpPanel, {
            formulaEngine: formulaEngine
          })),

          React.createElement(window.UIComponents.Col, {
            key: 'actions-col'
          }, React.createElement(window.UIComponents.Space, null, [
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
                if (window.dataManager) {
                  window.dataManager.exportData(data);
                }
              },
              variant: 'secondary'
            }, '💾 导出数据')
          ]))
        ])
      ])
    ]);
  };

  return {
    SettingsPage
  };

})();