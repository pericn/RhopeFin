// 自定义公式引擎 - 支持%1, %2, %3, %4变量引用和系统变量
class FormulaEngine {
  constructor() {
    this.systemVariables = {};
  }

  // 更新系统变量上下文
  updateSystemContext(data) {
    this.systemVariables = {
      // 基础参数
      memberCount: data.revenue?.member?.count || 0,
      areaSqm: data.basic?.areaSqm || 0,
      daysPerYear: data.basic?.daysPerYear || 365,
      
      // 寄养参数
      boardingRooms: data.revenue?.boarding?.rooms || 0,
      boardingADR: data.revenue?.boarding?.adr || 0,
      boardingOcc: data.revenue?.boarding?.occ || 0,
      
      // 人员参数
      staffCount: data.cost?.fixed?.staffCount || 0,
      staffSalaryPerMonth: data.cost?.fixed?.staffSalaryPerMonth || 0,
      
      // 收入参数
      medicalMonthlyRevenue: data.revenue?.medical?.monthlyRevenue || 0,
      retailMonthlyRevenue: data.revenue?.retail?.monthlyRevenue || 0,
      cafeMonthlyRevenue: data.revenue?.cafe?.monthlyRevenue || 0,
      
      // 成本参数
      rentPerSqmPerDay: data.cost?.fixed?.rentPerSqmPerDay || 0,
      propertyPerSqmPerMonth: data.cost?.fixed?.propertyPerSqmPerMonth || 0,
      utilitiesPerYear: data.cost?.variable?.utilitiesPerYear || 0
    };
  }

  // 计算自定义公式
  evaluateFormula(formula, customVariables = []) {
    try {
      if (!formula || formula.trim() === "") return 0;
      
      let processedFormula = formula.toString();
      
      // 首先替换%1, %2, %3, %4等自定义变量
      customVariables.forEach((variable, index) => {
        const placeholder = `%${index + 1}`;
        const regex = new RegExp(`\\${placeholder}\\b`, 'g');
        const value = variable?.value || 0;
        processedFormula = processedFormula.replace(regex, value.toString());
      });
      
      // 然后替换系统变量
      Object.keys(this.systemVariables).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        processedFormula = processedFormula.replace(regex, this.systemVariables[key].toString());
      });
      
      // 使用Function构造器安全地计算表达式
      const result = new Function('return ' + processedFormula)();
      return isNaN(result) ? 0 : Number(result);
    } catch (error) {
      console.warn('公式计算错误:', formula, error);
      return 0;
    }
  }

  // 验证公式语法
  validateFormula(formula, customVariables = []) {
    try {
      if (!formula || formula.trim() === "") {
        return { isValid: true, error: null };
      }

      // 创建测试变量上下文
      const testVariables = { ...this.systemVariables };
      customVariables.forEach((variable, index) => {
        testVariables[`%${index + 1}`] = 1; // 使用测试值
      });

      // 尝试解析公式
      let testFormula = formula.toString();
      
      // 替换自定义变量
      customVariables.forEach((variable, index) => {
        const placeholder = `%${index + 1}`;
        const regex = new RegExp(`\\${placeholder}\\b`, 'g');
        testFormula = testFormula.replace(regex, '1');
      });
      
      // 替换系统变量
      Object.keys(this.systemVariables).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        testFormula = testFormula.replace(regex, '1');
      });

      // 检查是否还有未替换的变量
      const unresolvedVariables = testFormula.match(/[a-zA-Z_][a-zA-Z0-9_]*|%[0-9]+/g);
      if (unresolvedVariables) {
        const filtered = unresolvedVariables.filter(v => 
          !['Math', 'parseInt', 'parseFloat', 'Number', 'Math.PI', 'Math.E'].includes(v) &&
          !v.match(/^(abs|ceil|floor|round|max|min|pow|sqrt)$/)
        );
        if (filtered.length > 0) {
          return {
            isValid: false,
            error: `未识别的变量: ${filtered.join(', ')}`
          };
        }
      }

      // 尝试执行公式
      new Function('return ' + testFormula)();
      
      return { isValid: true, error: null };
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  // 获取可用的系统变量列表
  getAvailableVariables() {
    return {
      system: Object.keys(this.systemVariables).map(key => ({
        name: key,
        description: this.getVariableDescription(key),
        value: this.systemVariables[key]
      })),
      custom: [
        { name: '%1', description: '自定义变量1' },
        { name: '%2', description: '自定义变量2' },
        { name: '%3', description: '自定义变量3' },
        { name: '%4', description: '自定义变量4' }
      ],
      functions: [
        { name: 'Math.max(a,b)', description: '取较大值' },
        { name: 'Math.min(a,b)', description: '取较小值' },
        { name: 'Math.round(x)', description: '四舍五入' },
        { name: 'Math.ceil(x)', description: '向上取整' },
        { name: 'Math.floor(x)', description: '向下取整' }
      ]
    };
  }

  // 获取变量描述
  getVariableDescription(variableName) {
    const descriptions = {
      memberCount: '会员总数',
      areaSqm: '营业面积(㎡)',
      daysPerYear: '年营业天数',
      boardingRooms: '寄养房间数',
      boardingADR: '平均房价/天',
      boardingOcc: '平均入住率(%)',
      staffCount: '员工数量',
      staffSalaryPerMonth: '人均月薪',
      medicalMonthlyRevenue: '月度医疗营收',
      retailMonthlyRevenue: '月度零售营收',
      cafeMonthlyRevenue: '月度餐饮/社交营收',
      rentPerSqmPerDay: '租金(元/㎡/天)',
      propertyPerSqmPerMonth: '物业费(元/㎡/月)',
      utilitiesPerYear: '年度水电费'
    };
    return descriptions[variableName] || variableName;
  }

  // 格式化公式显示
  formatFormulaDisplay(formula, customVariables = []) {
    if (!formula || formula.trim() === "") return '';

    let displayFormula = formula.toString();
    
    // 替换自定义变量为可读名称
    customVariables.forEach((variable, index) => {
      if (variable && variable.name) {
        const placeholder = `%${index + 1}`;
        const regex = new RegExp(`\\${placeholder}\\b`, 'g');
        displayFormula = displayFormula.replace(regex, variable.name);
      }
    });
    
    // 替换系统变量为中文名称
    Object.keys(this.systemVariables).forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      const description = this.getVariableDescription(key);
      displayFormula = displayFormula.replace(regex, description);
    });

    return displayFormula;
  }

  // 生成公式帮助文档
  generateHelp() {
    return {
      overview: '公式引擎支持基本数学运算和预定义变量',
      operators: [
        '+ (加法)', '- (减法)', '* (乘法)', '/ (除法)',
        '() (括号)', '** 或 Math.pow(x,y) (乘方)'
      ],
      examples: [
        { formula: 'memberCount * 1000', description: '会员数 × 1000' },
        { formula: 'areaSqm * %1', description: '面积 × 自定义变量1' },
        { formula: 'Math.max(boardingRooms * 500, 10000)', description: '房间收入与最低保障取较大值' },
        { formula: 'staffCount * staffSalaryPerMonth * 12', description: '年度人工成本' }
      ]
    };
  }

  // 计算公式的依赖变量
  getDependencies(formula, customVariables = []) {
    const dependencies = {
      systemVariables: [],
      customVariables: [],
      functions: []
    };

    if (!formula || formula.trim() === "") return dependencies;

    const formulaStr = formula.toString();

    // 检查系统变量依赖
    Object.keys(this.systemVariables).forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`);
      if (regex.test(formulaStr)) {
        dependencies.systemVariables.push(key);
      }
    });

    // 检查自定义变量依赖
    for (let i = 1; i <= 4; i++) {
      const regex = new RegExp(`%${i}\\b`);
      if (regex.test(formulaStr)) {
        dependencies.customVariables.push(i);
      }
    }

    // 检查函数依赖
    const mathFunctions = ['max', 'min', 'round', 'ceil', 'floor', 'pow', 'sqrt', 'abs'];
    mathFunctions.forEach(func => {
      const regex = new RegExp(`Math\\.${func}\\s*\\(`);
      if (regex.test(formulaStr)) {
        dependencies.functions.push(`Math.${func}`);
      }
    });

    return dependencies;
  }
}

// 创建全局公式引擎实例
window.FormulaEngine = FormulaEngine;