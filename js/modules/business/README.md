# 自定义模块业务系统

## 概述

本目录包含Hopeful Finance应用的自定义模块业务系统，将原来的`custom-modules.js`拆分为多个独立的业务模块，提供更清晰的代码结构和更好的可维护性。

## 目录结构

```
js/modules/business/
├── README.md                 # 使用文档（本文件）
├── index.js                  # 主业务模块聚合器
├── revenue-manager.js        # 自定义收入模块管理器
├── cost-manager.js          # 自定义成本模块管理器  
├── investment-manager.js    # 自定义投资模块管理器
├── module-editor.js         # 通用模块编辑器
└── formula-help.js          # 公式帮助面板
```

## 模块说明

### 1. index.js - 主业务模块聚合器
- **作用**: 统一管理所有子业务模块的入口点
- **功能**: 模块依赖检查、初始化、统计信息获取
- **向后兼容**: 保持与原`window.CustomModules`的API兼容
- **行数**: ~150行

### 2. revenue-manager.js - 收入模块管理器  
- **作用**: 管理自定义收入模块的增删改查
- **功能**: 收入模块创建、更新、删除、复制
- **依赖**: `window.CustomModuleEditor`
- **行数**: ~130行

### 3. cost-manager.js - 成本模块管理器
- **作用**: 管理固定/变动成本模块的增删改查  
- **功能**: 成本模块创建、更新、删除、复制，支持固定/变动类型
- **依赖**: `window.CustomModuleEditor`
- **行数**: ~150行

### 4. investment-manager.js - 投资模块管理器
- **作用**: 管理自定义投资项目
- **功能**: 投资项目增删改，货币格式化显示
- **依赖**: `window.UIComponents`
- **行数**: ~100行

### 5. module-editor.js - 通用模块编辑器
- **作用**: 提供收入/成本模块的详细编辑界面
- **功能**: 公式编辑、变量管理、结果显示、启用/禁用切换
- **依赖**: `window.UIComponents`
- **行数**: ~200行

### 6. formula-help.js - 公式帮助面板
- **作用**: 提供公式编写的帮助文档和示例
- **功能**: 运算符说明、系统变量列表、公式示例
- **依赖**: `window.UIComponents`
- **行数**: ~120行

## 使用方式

### 引入方式

在HTML中按顺序引入所有模块文件：

```html
<!-- 先引入UI组件和依赖 -->
<script src="js/components/ui-components.js"></script>
<script src="js/core/data-manager.js"></script>

<!-- 按顺序引入业务模块 -->
<script src="js/modules/business/module-editor.js"></script>
<script src="js/modules/business/formula-help.js"></script>
<script src="js/modules/business/revenue-manager.js"></script>
<script src="js/modules/business/cost-manager.js"></script>
<script src="js/modules/business/investment-manager.js"></script>
<script src="js/modules/business/index.js"></script>
```

### 代码使用

业务模块保持与原API的兼容性：

```javascript
// 使用收入管理器
const revenueManager = React.createElement(window.CustomModules.CustomRevenueManager, {
  data: appData,
  updateData: updateAppData,
  formulaEngine: formulaEngineInstance
});

// 使用成本管理器  
const costManager = React.createElement(window.CustomModules.CustomCostManager, {
  data: appData,
  updateData: updateAppData,
  formulaEngine: formulaEngineInstance
});

// 使用投资管理器
const investmentManager = React.createElement(window.CustomModules.CustomInvestmentManager, {
  data: appData,
  updateData: updateAppData
});

// 获取模块统计信息
const stats = window.CustomModules.getModuleStats(appData);
console.log('模块统计:', stats);
```

## 依赖关系

```
index.js (主聚合器)
├── revenue-manager.js
│   └── module-editor.js
│       └── formula-help.js
├── cost-manager.js  
│   └── module-editor.js
│       └── formula-help.js
├── investment-manager.js
├── module-editor.js
└── formula-help.js
```

### 外部依赖
- `window.React`: React库
- `window.UIComponents`: UI组件库
- `window.dataManager`: 数据管理器
- `window.formulaEngine`: 公式引擎

## 特性

### ✅ 完整功能保持
- 所有原有业务逻辑和API接口完全保持不变
- 向后兼容，现有代码无需修改

### ✅ 模块化设计
- 每个业务模块独立文件，单一职责
- 清晰的模块边界和接口定义
- 便于单独测试和维护

### ✅ 代码优化
- 详细的JSDoc注释和说明
- 标准的模块格式：`window.ModuleName = (function() { ... })()`
- 错误处理和依赖检查

### ✅ 开发体验
- 完整的使用文档和示例
- 模块加载状态检查和提示
- 开发调试信息输出

## 迁移指南

### 从原版本迁移
1. 替换原来的单一文件引入
2. 按新的引入顺序加载所有模块文件  
3. 代码使用方式保持不变，无需修改

### 开发新功能
1. 在对应的业务模块文件中添加功能
2. 保持模块接口的一致性
3. 更新相关文档和注释

## 注意事项

1. **加载顺序**: 必须按正确顺序加载模块文件，先加载依赖再加载主模块
2. **依赖检查**: 系统会自动检查依赖，在控制台显示加载状态
3. **错误处理**: 缺少依赖时会显示警告信息和解决方案
4. **调试模式**: 开发时可查看控制台输出获取详细信息

## 版本信息

- **版本**: 2.0.0
- **兼容性**: 完全向后兼容1.0版本
- **最后更新**: 2024年9月3日
- **维护者**: Claude Code Assistant