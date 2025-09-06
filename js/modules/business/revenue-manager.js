// 自定义收入模块管理器
window.CustomRevenueManager = (function() {
  'use strict';

  /**
   * 自定义收入模块管理器组件
   * 负责管理和渲染自定义收入模块的增删改查功能
   * 
   * @param {Object} props - 组件属性
   * @param {Object} props.data - 应用数据对象
   * @param {Function} props.updateData - 数据更新函数
   * @param {Object} props.formulaEngine - 公式引擎实例
   * @returns {ReactElement} 收入管理器组件
   */
  const RevenueManager = ({ data, updateData, formulaEngine }) => {
    const customModules = data.revenue?.custom || [];

    /**
     * 添加新的自定义收入模块
     */
    const addModule = () => {
      const newModule = {
        id: Date.now().toString(),
        name: `自定义收入${customModules.length + 1}`,
        formula: '0',
        variables: [
          { name: '', value: 0 },
          { name: '', value: 0 },
          { name: '', value: 0 },
          { name: '', value: 0 }
        ],
        margin: 80, // 默认毛利率80%
        enabled: true,
        note: ''
      };
      
      const newModules = [...customModules, newModule];
      if (window.dataManager) {
        const newData = window.dataManager.updateDataPath(data, 'revenue.custom', newModules);
        updateData(newData);
      }
    };

    /**
     * 更新模块属性
     * @param {string} moduleId - 模块ID
     * @param {string} field - 字段名
     * @param {*} value - 新值
     */
    const updateModule = (moduleId, field, value) => {
      const newModules = customModules.map(module => 
        module.id === moduleId 
          ? { ...module, [field]: value }
          : module
      );
      if (window.dataManager) {
        const newData = window.dataManager.updateDataPath(data, 'revenue.custom', newModules);
        updateData(newData);
      }
    };

    /**
     * 更新模块变量
     * @param {string} moduleId - 模块ID
     * @param {number} variableIndex - 变量索引
     * @param {string} field - 字段名(name|value)
     * @param {*} value - 新值
     */
    const updateModuleVariable = (moduleId, variableIndex, field, value) => {
      const newModules = customModules.map(module => {
        if (module.id === moduleId) {
          const newVariables = [...module.variables];
          newVariables[variableIndex] = { ...newVariables[variableIndex], [field]: value };
          return { ...module, variables: newVariables };
        }
        return module;
      });
      if (window.dataManager) {
        const newData = window.dataManager.updateDataPath(data, 'revenue.custom', newModules);
        updateData(newData);
      }
    };

    /**
     * 删除模块
     * @param {string} moduleId - 模块ID
     */
    const deleteModule = (moduleId) => {
      if (confirm('确认删除此自定义收入模块？')) {
        const newModules = customModules.filter(module => module.id !== moduleId);
        if (window.dataManager) {
          const newData = window.dataManager.updateDataPath(data, 'revenue.custom', newModules);
          updateData(newData);
        }
      }
    };

    /**
     * 复制模块
     * @param {string} moduleId - 模块ID
     */
    const duplicateModule = (moduleId) => {
      const originalModule = customModules.find(m => m.id === moduleId);
      if (originalModule) {
        const newModule = {
          ...originalModule,
          id: Date.now().toString(),
          name: `${originalModule.name} (副本)`
        };
        const newModules = [...customModules, newModule];
        if (window.dataManager) {
          const newData = window.dataManager.updateDataPath(data, 'revenue.custom', newModules);
          updateData(newData);
        }
      }
    };

    // 渲染组件
    return React.createElement('div', {
      className: 'space-y-4'
    }, [
      // 头部区域
      React.createElement('div', {
        key: 'header',
        className: 'flex items-center justify-between'
      }, [
        React.createElement('h3', {
          key: 'title',
          className: 'text-lg font-semibold text-green-800'
        }, '💰 自定义收入模块'),
        React.createElement(window.UIComponents.Button, {
          key: 'add-btn',
          onClick: addModule,
          variant: 'success',
          size: 'small'
        }, '+ 添加收入模块')
      ]),

      // 空状态提示
      customModules.length === 0 && React.createElement('div', {
        key: 'empty',
        className: 'text-center py-8 text-gray-500 bg-gray-50 rounded-lg'
      }, [
        React.createElement('div', {
          key: 'icon',
          className: 'text-4xl mb-2'
        }, '📊'),
        React.createElement('div', {
          key: 'text'
        }, '暂无自定义收入模块，点击上方按钮添加')
      ]),

      // 模块列表
      React.createElement('div', {
        key: 'modules',
        className: 'space-y-4'
      }, customModules.map(module => 
        React.createElement(window.CustomModuleEditor, {
          key: module.id,
          module: module,
          type: 'revenue',
          formulaEngine: formulaEngine,
          onUpdate: updateModule,
          onUpdateVariable: updateModuleVariable,
          onDelete: deleteModule,
          onDuplicate: duplicateModule
        })
      ))
    ]);
  };

  return RevenueManager;

})();