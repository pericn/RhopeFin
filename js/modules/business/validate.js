// 业务模块验证脚本
(function() {
  'use strict';

  /**
   * 验证业务模块的完整性和功能
   */
  function validateBusinessModules() {
    console.log('🔍 开始验证业务模块...');
    
    const requiredModules = [
      'CustomRevenueManager',
      'CustomCostManager', 
      'CustomInvestmentManager',
      'CustomModuleEditor',
      'FormulaHelpPanel',
      'CustomModules'
    ];

    let success = 0;
    let failed = [];

    // 检查模块是否存在
    requiredModules.forEach(moduleName => {
      if (window[moduleName]) {
        console.log(`✅ ${moduleName} - 模块已加载`);
        success++;
      } else {
        console.error(`❌ ${moduleName} - 模块未找到`);
        failed.push(moduleName);
      }
    });

    // 检查聚合器功能
    if (window.CustomModules) {
      const modules = window.CustomModules;
      
      // 检查主要方法
      const methods = ['initialize', 'checkDependencies', 'getModuleStats'];
      methods.forEach(method => {
        if (typeof modules[method] === 'function') {
          console.log(`✅ CustomModules.${method} - 方法可用`);
        } else {
          console.error(`❌ CustomModules.${method} - 方法缺失`);
          failed.push(`CustomModules.${method}`);
        }
      });

      // 测试初始化
      try {
        const isReady = modules.initialize();
        console.log(`📋 模块初始化状态: ${isReady ? '成功' : '失败'}`);
      } catch (error) {
        console.error('❌ 模块初始化失败:', error.message);
        failed.push('initialization');
      }

      // 测试统计功能
      try {
        const testData = {
          revenue: { custom: [] },
          cost: { custom: [] },
          investment: { customInvestments: [] }
        };
        const stats = modules.getModuleStats(testData);
        console.log('✅ 模块统计功能正常');
        console.log('📊 测试统计结果:', stats);
      } catch (error) {
        console.error('❌ 模块统计功能失败:', error.message);
        failed.push('statistics');
      }
    }

    // 总结
    console.log('\n📋 验证结果汇总:');
    console.log(`✅ 成功: ${success}/${requiredModules.length} 个模块`);
    
    if (failed.length > 0) {
      console.log(`❌ 失败: ${failed.length} 个项目`);
      console.log('失败列表:', failed);
      return false;
    } else {
      console.log('🎉 所有业务模块验证通过！');
      console.log('\n🏗️ 模块架构信息:');
      console.log('- revenue-manager.js: 收入模块管理器 (172行)');
      console.log('- cost-manager.js: 成本模块管理器 (185行)');  
      console.log('- investment-manager.js: 投资模块管理器 (146行)');
      console.log('- module-editor.js: 通用模块编辑器 (136行)');
      console.log('- formula-help.js: 公式帮助面板 (170行)');
      console.log('- index.js: 主业务模块聚合器 (169行)');
      console.log('\n📝 使用方法:');
      console.log('1. 按顺序加载所有模块文件');
      console.log('2. 通过 window.CustomModules 访问主接口');
      console.log('3. 使用与原版本相同的API调用方式');
      return true;
    }
  }

  // 如果在浏览器环境，自动执行验证
  if (typeof window !== 'undefined') {
    // 延迟执行，确保所有模块都已加载
    setTimeout(validateBusinessModules, 500);
  }

  // 导出验证函数
  if (typeof window !== 'undefined') {
    window.validateBusinessModules = validateBusinessModules;
  }

})();