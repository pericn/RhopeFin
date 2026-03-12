// 数据管理模块 - 负责数据结构定义、localStorage操作和数据状态管理
class DataManager {
  constructor() {
    this.storageKey = 'hopefulFinanceData';
    this.listeners = [];
  }

  // 获取初始数据结构
  getInitialData() {
    return {
      basic: {
        currency: "¥",
        projectName: "Hopeful 宠物综合体（示例）",
        areaSqm: 300,
        daysPerYear: 365
      },
      
      custom: {
        var1: 0,
        var2: 0,
        var3: 0,
        var4: 0
      },
      
      investment: {
        fitoutStandard: 7000,
        medicalInitial: 600000,
        customInvestments: []
      },

      revenue: {
        member: {
          count: 300,
          basePct: 60,
          basePrice: 2499,
          proPct: 35,
          proPrice: 4999,
          vipPct: 5,
          vipPrice: 29999,
          note: ""
        },
        boarding: {
          rooms: 12,
          adr: 400,
          occ: 70,
          note: ""
        },
        medical: {
          monthlyRevenue: 120000,
          note: ""
        },
        retail: {
          monthlyRevenue: 35000,
          note: ""
        },
        cafe: {
          monthlyRevenue: 20000,
          note: ""
        },
        custom: [] // 自定义收入模块
      },

      cost: {
        fixed: {
          rentPerSqmPerDay: 2.5,
          propertyPerSqmPerMonth: 39,
          cleaningOtherFixed: 49275,
          staffCount: 9,
          staffSalaryPerMonth: 12000,
          hqFeePctOfRevenue: 8
        },
        variable: {
          utilitiesPerYear: 240000,
          miscVariableAnnual: 48300
        },
        margins: {
          members: 95,
          boarding: 90,
          medical: 70,
          retail: 45,
          cafe: 35
        },
        custom: [] // 自定义成本模块
      },

      // Cross-module business assumptions (used for marketing efficiency / unit economics)
      assumptions: {
        // Customer Acquisition Cost: cost to acquire one paying customer (or one new member)
        cac: 300,
        // Lifetime Value: expected gross contribution (or revenue) per customer over the lifetime
        ltv: 6000
      },

      scenario: {
        optimisticRevenueFactor: 120,
        conservativeRevenueFactor: 80,
        optimisticCostFactor: 95,
        conservativeCostFactor: 110
      }
    };
  }

  // 从localStorage加载数据
  loadFromStorage() {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // 调试：记录原始保存的项目名称
        if (window.DEBUG_MODE || true) { // 临时启用调试
          console.log('📂 加载原始数据 - 项目名称:', parsedData?.basic?.projectName);
        }
        
        // 合并保存的数据和默认数据，确保新字段不丢失
        const mergedData = this.mergeWithDefaults(parsedData, this.getInitialData());
        
        // 调试：记录合并后的项目名称
        if (window.DEBUG_MODE || true) {
          console.log('🔀 合并后数据 - 项目名称:', mergedData?.basic?.projectName);
        }
        
        // 验证和清理数据，确保不包含NaN值
        const cleanedData = this.validateAndCleanData(mergedData);
        
        // 调试：记录清理后的项目名称
        if (window.DEBUG_MODE || true) {
          console.log('🧹 清理后数据 - 项目名称:', cleanedData?.basic?.projectName);
        }
        
        return cleanedData;
      }
    } catch (error) {
      console.error('加载本地数据失败:', error);
    }
    // 返回清理后的初始数据
    const initialData = this.validateAndCleanData(this.getInitialData());
    
    // 调试：记录初始数据的项目名称
    if (window.DEBUG_MODE || true) {
      console.log('🎬 初始数据 - 项目名称:', initialData?.basic?.projectName);
    }
    
    return initialData;
  }

  // 保存数据到localStorage
  saveToStorage(data) {
    try {
      // 验证和清理数据，确保不包含NaN值
      const cleanData = this.validateAndCleanData(data);
      
      // 调试：记录项目名称保存情况
      if (window.DEBUG_MODE || true) { // 临时启用调试
        console.log('📝 保存数据 - 项目名称:', cleanData?.basic?.projectName);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(cleanData));
      this.notifyListeners(cleanData);
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  }

  // 清除本地存储数据
  clearStorage() {
    try {
      localStorage.removeItem(this.storageKey);
      const initialData = this.getInitialData();
      this.notifyListeners(initialData);
      return initialData;
    } catch (error) {
      console.error('清除数据失败:', error);
      return this.getInitialData();
    }
  }

  // 合并保存的数据和默认数据，确保新字段不丢失且不包含NaN
  mergeWithDefaults(savedData, defaultData) {
    const merged = { ...defaultData };
    
    const mergeRecursive = (target, source) => {
      Object.keys(source).forEach(key => {
        if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key]) target[key] = {};
          mergeRecursive(target[key], source[key]);
        } else {
          // 确保数值类型不为NaN，字符串保持原样
          const value = source[key];
          if (typeof value === 'number' && isNaN(value)) {
            target[key] = defaultData[key] || 0;
          } else {
            target[key] = value;
          }
        }
      });
    };
    
    mergeRecursive(merged, savedData);
    return merged;
  }

  // 更新数据路径 - 安全地更新嵌套对象属性
  updateDataPath(originalData, path, newValue) {
    // 只对数值类型进行NaN检查，保持字符串原样
    const cleanValue = (typeof newValue === 'number' && isNaN(newValue)) ? 0 : newValue;
    
    if (!path || typeof path !== 'string') {
      console.warn('Invalid path for data update:', path);
      return originalData;
    }

    const keys = path.split('.');
    const newData = JSON.parse(JSON.stringify(originalData)); // 深拷贝
    
    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) current[key] = {};
      current = current[key];
    }
    
    // 设置最终值，确保不为NaN
    current[keys[keys.length - 1]] = cleanValue;
    
    return newData;
  }

  // 获取数据路径的值
  getDataPath(data, path) {
    const keys = path.split('.');
    let current = data;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  // 添加数据变化监听器
  addListener(callback) {
    this.listeners.push(callback);
  }

  // 移除监听器
  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // 通知所有监听器
  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('监听器回调错误:', error);
      }
    });
  }

  // 套用预设参数
  applyPreset() {
    const presetData = {
      ...this.getInitialData(),
      basic: {
        ...this.getInitialData().basic,
        projectName: "Hopeful 宠物综合体（预设示例）"
      }
    };
    
    // 验证和清理预设数据
    const cleanPresetData = this.validateAndCleanData(presetData);
    this.saveToStorage(cleanPresetData);
    return cleanPresetData;
  }

  // 验证数据完整性
  validateData(data) {
    const errors = [];
    
    // 验证会员比例总和
    const memberTotal = (data.revenue?.member?.basePct || 0) + 
                       (data.revenue?.member?.proPct || 0) + 
                       (data.revenue?.member?.vipPct || 0);
    
    if (memberTotal > 100) {
      errors.push('会员类型比例总和不能超过100%');
    }
    
    // 验证必要的数值字段
    const requiredFields = [
      'basic.areaSqm',
      'basic.daysPerYear',
      'revenue.member.count',
      'revenue.boarding.rooms',
      'cost.fixed.staffCount'
    ];
    
    for (const field of requiredFields) {
      const value = this.getDataPath(data, field);
      if (value === undefined || value === null || (typeof value === 'number' && (value < 0 || isNaN(value)))) {
        errors.push(`字段 ${field} 必须为有效的正数`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 验证和清理数据，确保不包含NaN值
  validateAndCleanData(data) {
    const cleanData = JSON.parse(JSON.stringify(data)); // 深拷贝
    
    const cleanRecursive = (obj) => {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          cleanRecursive(value);
        } else if (typeof value === 'number' && isNaN(value)) {
          // 将NaN值替换为0
          obj[key] = 0;
        } else if (typeof value === 'number' && !isFinite(value)) {
          // 将Infinity值替换为0
          obj[key] = 0;
        }
      });
    };
    
    cleanRecursive(cleanData);
    return cleanData;
  }

  // 导出数据
  exportData(data) {
    const exportData = {
      ...data,
      exportTime: new Date().toISOString(),
      version: "2.0"
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `hopeful-finance-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  // 导入数据
  importData(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        const mergedData = this.mergeWithDefaults(importedData, this.getInitialData());
        // 验证和清理导入的数据
        const cleanMergedData = this.validateAndCleanData(mergedData);
        const validation = this.validateData(cleanMergedData);
        
        if (validation.isValid) {
          this.saveToStorage(cleanMergedData);
          callback(null, cleanMergedData);
        } else {
          callback(new Error(`数据验证失败: ${validation.errors.join(', ')}`), null);
        }
      } catch (error) {
        callback(error, null);
      }
    };
    reader.readAsText(file);
  }
}

// 创建全局数据管理器实例
window.DataManager = DataManager;