// UI组件库 - 基于 Ant Design 的 UI 组件集合
window.UIComponents = (function() {
  'use strict';

  // 设置中文本地化
  if (typeof dayjs !== 'undefined' && typeof antd !== 'undefined') {
    dayjs.locale('zh-cn');
    // Ant Design v5 不再需要全局配置，使用 ConfigProvider 在组件级别配置
    // antd.ConfigProvider.config({
    //   locale: {
    //     ...antd.locale.zhCN,
    //     locale: 'zh-cn',
    //   }
    // });
  }

  // Ant Design 组件解构
  const {
    Input: AntInput,
    InputNumber,
    Button: AntButton,
    Card,
    Tabs,
    Row,
    Col,
    Space,
    Typography,
    Divider,
    Spin,
    Modal: AntModal,
    Tooltip: AntTooltip,
    Switch,
    Badge,
    Progress,
    Statistic,
    ConfigProvider
  } = antd;

  const { Title, Text } = Typography;

  // 通用输入组件 - 包装 Ant Design InputNumber
  const Input = ({ label, value, onChange, type = "number", step = 1, suffix = "", hint = "", required = false, width = "100%" }) => {
    // 支持四种预设宽度：25%, 50%, 75%, 100%
    const getWidthStyle = (width) => {
      if (typeof width === 'string') {
        return width;
      }
      switch (width) {
        case 'small': return '25%';
        case 'medium': return '50%';
        case 'large': return '75%';
        case 'full': return '100%';
        default: return width;
      }
    };

    return React.createElement(Space, {
      direction: 'vertical',
      size: 4,
      style: { width: getWidthStyle(width) }
    }, [
      label && React.createElement(Text, {
        key: 'label',
        type: required && !value ? 'danger' : undefined,
        strong: required
      }, [
        label,
        required && React.createElement('span', {
          key: 'required',
          style: { color: '#ff4d4f', marginLeft: 4 }
        }, '*')
      ]),
      
      type === 'number' ? React.createElement(InputNumber, {
        key: 'input',
        value: value,
        onChange: onChange,
        step: step,
        style: { width: '100%' },
        addonAfter: suffix || undefined,
        placeholder: hint,
        status: required && !value ? 'error' : undefined
      }) : React.createElement(AntInput, {
        key: 'input',
        value: value,
        onChange: (e) => onChange(e.target.value),
        suffix: suffix,
        placeholder: hint,
        status: required && !value ? 'error' : undefined
      }),
      
      hint && React.createElement(Text, {
        key: 'hint',
        type: 'secondary',
        style: { fontSize: 12 }
      }, hint)
    ]);
  };

  // 文本域组件 - 包装 Ant Design Input.TextArea
  const TextArea = ({ label, value, onChange, placeholder = "", rows = 3 }) => {
    return React.createElement(Space, {
      direction: 'vertical',
      size: 4,
      style: { width: '100%' }
    }, [
      label && React.createElement(Text, {
        key: 'label',
        strong: true
      }, label),
      
      React.createElement(AntInput.TextArea, {
        key: 'textarea',
        rows: rows,
        value: value,
        placeholder: placeholder,
        onChange: (e) => onChange(e.target.value)
      })
    ]);
  };

  // 按钮组件 - 包装 Ant Design Button
  const Button = ({ children, onClick, variant = 'primary', size = 'middle', disabled = false, loading = false, ...props }) => {
    const typeMap = {
      'primary': 'primary',
      'secondary': 'default',
      'success': 'primary',
      'danger': 'primary',
      'outline': 'default'
    };

    const colorMap = {
      'success': '#52c41a',
      'danger': '#ff4d4f'
    };

    return React.createElement(AntButton, {
      type: typeMap[variant],
      size: size,
      onClick: onClick,
      disabled: disabled,
      loading: loading,
      style: colorMap[variant] ? { backgroundColor: colorMap[variant], borderColor: colorMap[variant] } : undefined,
      ...props
    }, children);
  };

  // 卡片/节组件 - 包装 Ant Design Card
  const Section = ({ title, children, className = "", icon = "" }) => {
    return React.createElement(Card, {
      title: React.createElement(Space, null, [
        icon && React.createElement('span', { key: 'icon' }, icon),
        React.createElement(Text, { key: 'title', strong: true }, title)
      ]),
      className: className,
      style: { marginBottom: 16 }
    }, children);
  };

  // 关键指标组件 - 使用 Ant Design Statistic
  const KPI = ({ title, value, prefix = "", suffix = "", trend = null, color = "default", className = "" }) => {
    const colorMap = {
      'success': '#52c41a',
      'danger': '#ff4d4f',
      'warning': '#faad14',
      'info': '#1890ff',
      'default': '#000000'
    };

    return React.createElement(Card, {
      className: className,
      style: { textAlign: 'center' }
    }, [
      React.createElement(Statistic, {
        key: 'statistic',
        title: title,
        value: value,
        prefix: prefix,
        suffix: suffix,
        valueStyle: { color: colorMap[color] }
      }),
      
      trend && React.createElement(Space, {
        key: 'trend',
        style: { marginTop: 8 }
      }, [
        React.createElement('span', {
          key: 'trend-icon',
          style: { color: trend > 0 ? '#52c41a' : trend < 0 ? '#ff4d4f' : '#999' }
        }, trend > 0 ? '↗' : trend < 0 ? '↘' : '→'),
        React.createElement(Text, {
          key: 'trend-text',
          type: 'secondary',
          style: { fontSize: 12 }
        }, `${Math.abs(trend)}%`)
      ])
    ]);
  };

  // 页签组件 - 包装 Ant Design Tabs
  const TabsComponent = ({ tabs = [], activeTab, onTabChange, className = "" }) => {
    const tabItems = tabs.map(tab => ({
      key: tab.id,
      label: React.createElement(Space, null, [
        tab.icon && React.createElement('span', { key: 'icon' }, tab.icon),
        React.createElement('span', { key: 'label' }, tab.label)
      ])
    }));

    return React.createElement(Tabs, {
      activeKey: activeTab,
      onChange: onTabChange,
      items: tabItems,
      className: className
    });
  };

  // 模态框组件 - 包装 Ant Design Modal
  const Modal = ({ isOpen, onClose, title, children, size = 'default', footer = null }) => {
    const widthMap = {
      'small': 520,
      'default': 700,
      'large': 1000,
      'extra-large': 1200
    };

    return React.createElement(AntModal, {
      open: isOpen,
      onCancel: onClose,
      title: title,
      width: widthMap[size],
      footer: footer,
      centered: true
    }, children);
  };

  // 提示组件 - 包装 Ant Design Tooltip
  const Tooltip = ({ content, children, position = 'top' }) => {
    return React.createElement(AntTooltip, {
      title: content,
      placement: position
    }, children);
  };

  // 加载组件 - 包装 Ant Design Spin
  const Loading = ({ size = 'default', color = 'primary' }) => {
    return React.createElement(Spin, {
      size: size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'
    });
  };

  // 网格布局组件 - 包装 Ant Design Row/Col
  const Grid = ({ children, cols = 1, gap = 16, className = "" }) => {
    const span = 24 / cols;
    
    return React.createElement(Row, {
      gutter: [gap, gap],
      className: className
    }, React.Children.map(children, (child, index) => 
      React.createElement(Col, {
        key: index,
        span: span,
        xs: 24,
        sm: cols > 2 ? 12 : span,
        md: span
      }, child)
    ));
  };

  // 分隔线组件 - 包装 Ant Design Divider
  const Separator = ({ text = "", orientation = 'center' }) => {
    return React.createElement(Divider, {
      orientation: orientation
    }, text);
  };

  // 警告/通知组件 - 包装 Ant Design Alert
  const Alert = ({ type = 'info', message, description, showIcon = true, closable = false }) => {
    return React.createElement(antd.Alert, {
      type: type,
      message: message,
      description: description,
      showIcon: showIcon,
      closable: closable,
      style: { marginBottom: 16 }
    });
  };

  // 进度条组件 - 包装 Ant Design Progress
  const ProgressBar = ({ percent = 0, status = 'active', showInfo = true, strokeColor }) => {
    return React.createElement(Progress, {
      percent: Math.round(percent),
      status: status,
      showInfo: showInfo,
      strokeColor: strokeColor
    });
  };

  // 徽章组件 - 包装 Ant Design Badge
  const BadgeComponent = ({ count, children, color, text }) => {
    return React.createElement(Badge, {
      count: count,
      color: color,
      text: text
    }, children);
  };

  // 开关组件 - 包装 Ant Design Switch
  const SwitchComponent = ({ checked, onChange, checkedChildren, unCheckedChildren, disabled = false }) => {
    return React.createElement(Switch, {
      checked: checked,
      onChange: onChange,
      checkedChildren: checkedChildren,
      unCheckedChildren: unCheckedChildren,
      disabled: disabled
    });
  };

  // 导出所有组件
  return {
    Input,
    TextArea,
    Button,
    Section,
    KPI,
    Tabs: TabsComponent,
    Modal,
    Tooltip,
    Loading,
    Grid,
    Separator,
    Alert,
    Progress: ProgressBar,
    Badge: BadgeComponent,
    Switch: SwitchComponent,
    
    // Ant Design 原生组件的直接导出
    Space,
    Row,
    Col,
    Card,
    Typography,
    Divider,
    ConfigProvider,
    
    // 工具函数
    createAntdApp: (children) => {
      return React.createElement(ConfigProvider, {
        // locale: antd.locale.zhCN, // 暂时禁用，需要正确的 v5 locale 导入方式
        theme: {
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 8,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
          }
        }
      }, children);
    }
  };

})();