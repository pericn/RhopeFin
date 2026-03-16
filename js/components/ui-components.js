// UI组件库 - 通用UI组件集合
window.UIComponents = (function() {

  // 通用输入组件
  const Input = ({ label, value, onChange, type = "number", step = 1, suffix = "", hint = "", required = false, format = "decimal" }) => {
    const [inputValue, setInputValue] = React.useState('');
    const [isEditing, setIsEditing] = React.useState(false);

    React.useEffect(() => {
      if (!isEditing) {
        if (type === 'number' && typeof value === 'number') {
          // Format number based on format parameter
          if (format === 'integer') {
            setInputValue(Number.isInteger(value) ? value.toString() : value.toFixed(0));
          } else {
            // For decimal format, show without unnecessary decimals
            setInputValue(Number.isInteger(value) ? value.toString() : value.toString());
          }
        } else {
          setInputValue(value ? value.toString() : '');
        }
      }
    }, [value, isEditing, type, format]);

    const handleBlur = () => {
      setIsEditing(false);
      if (type === 'number' && inputValue !== '' && !isNaN(Number(inputValue))) {
        onChange(Number(inputValue));
      } else if (type === 'text') {
        onChange(inputValue);
      } else if (type === 'number') {
        // Reset to formatted value on blur if invalid
        if (typeof value === 'number') {
          if (format === 'integer') {
            setInputValue(Number.isInteger(value) ? value.toString() : value.toFixed(0));
          } else {
            setInputValue(Number.isInteger(value) ? value.toString() : value.toString());
          }
        } else {
          setInputValue(value ? value.toString() : '');
        }
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.target.blur();
      }
    };

    return React.createElement('div', {
      className: 'flex flex-col gap-1'
    }, [
      React.createElement('label', {
        key: 'label',
        className: `text-sm text-[var(--rilo-text-2)] ${required ? 'font-medium' : ''}`
      }, [
        label,
        required && React.createElement('span', {
          key: 'required',
          className: 'text-[var(--rilo-sem-danger)] ml-1'
        }, '*')
      ]),
      React.createElement('div', {
        key: 'input-wrapper',
        className: 'relative'
      }, [
        React.createElement('input', {
          key: 'input',
          type: type,
          className: `px-3 py-2 rounded-xl border w-full bg-[var(--rilo-surface-1)] text-[var(--rilo-text-1)] placeholder-[var(--rilo-text-3)] ${required && !value ? 'border-[var(--rilo-sem-danger)]' : 'border-[var(--rilo-border-deep)]'} focus:border-[var(--rilo-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--rilo-accent)]/20`,
          value: inputValue,
          step: step,
          onChange: (e) => {
            setInputValue(e.target.value);
            setIsEditing(true);
          },
          onBlur: handleBlur,
          onKeyDown: handleKeyDown,
          placeholder: hint
        }),
        suffix && React.createElement('span', {
          key: 'suffix',
          className: 'absolute right-3 top-2 text-gray-400 text-sm'
        }, suffix)
      ]),
      hint && React.createElement('div', {
        key: 'hint',
        className: 'text-xs text-gray-400'
      }, hint)
    ]);
  };

  // 文本域组件
  const TextArea = ({ label, value, onChange, placeholder = "", rows = 3 }) => {
    const [textValue, setTextValue] = React.useState(value || '');

    React.useEffect(() => {
      setTextValue(value || '');
    }, [value]);

    return React.createElement('div', {
      className: 'flex flex-col gap-1'
    }, [
      React.createElement('label', {
        key: 'label',
        className: 'text-sm text-gray-600'
      }, label),
      React.createElement('textarea', {
        key: 'textarea',
        className: 'px-3 py-2 rounded-xl border w-full resize-none focus:border-blue-500 focus:outline-none',
        rows: rows,
        value: textValue,
        placeholder: placeholder,
        onChange: (e) => setTextValue(e.target.value),
        onBlur: (e) => onChange(e.target.value)
      })
    ]);
  };

  // 选择框组件
  const Select = ({ label, value, onChange, options = [], hint = "" }) => {
    return React.createElement('div', {
      className: 'flex flex-col gap-1'
    }, [
      React.createElement('label', {
        key: 'label',
        className: 'text-sm text-[var(--rilo-text-2)]'
      }, label),
      React.createElement('select', {
        key: 'select',
        className: 'px-3 py-2 rounded-xl border w-full bg-[var(--rilo-surface-1)] text-[var(--rilo-text-1)] border-[var(--rilo-border-deep)] focus:border-[var(--rilo-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--rilo-accent)]/20',
        value: value,
        onChange: (e) => onChange(e.target.value)
      }, options.map(option => 
        React.createElement('option', {
          key: option.value,
          value: option.value
        }, option.label)
      )),
      hint && React.createElement('div', {
        key: 'hint',
        className: 'text-xs text-[var(--rilo-text-3)]'
      }, hint)
    ]);
  };

  // 区块容器组件
  const Section = ({ title, children, right, className = "", collapsible = false }) => {
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    return React.createElement('div', {
      className: `bg-[var(--rilo-surface-1)] rounded-2xl border border-[var(--rilo-border-deep)] p-4 lg:p-6 ${className}`
    }, [
      React.createElement('div', {
        key: 'header',
        className: 'flex items-center justify-between mb-4'
      }, [
        React.createElement('div', {
          key: 'title-section',
          className: 'flex items-center gap-2'
        }, [
          React.createElement('h2', {
            key: 'title',
            className: 'text-lg font-semibold text-[var(--rilo-text-1)]'
          }, title),
          collapsible && React.createElement('button', {
            key: 'toggle',
            className: 'text-[var(--rilo-text-3)] hover:text-[var(--rilo-accent)] transition-colors',
            onClick: () => setIsCollapsed(!isCollapsed)
          }, isCollapsed ? '▶' : '▼')
        ]),
        right
      ]),
      !isCollapsed && React.createElement('div', {
        key: 'content',
        className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
      }, children)
    ]);
  };

  // KPI指标显示组件
  const KPI = ({ title, value, color = "info", size = "normal", change = null, format = null }) => {
    const getColorClasses = (color) => {
      const colors = {
        success: 'bg-[var(--rilo-sem-success)]/10 text-[var(--rilo-sem-success)] border-[var(--rilo-sem-success)]/30',
        danger: 'bg-[var(--rilo-sem-danger)]/10 text-[var(--rilo-sem-danger)] border-[var(--rilo-sem-danger)]/30',
        warning: 'bg-[var(--rilo-sem-warning)]/10 text-[var(--rilo-sem-warning)] border-[var(--rilo-sem-warning)]/30',
        info: 'bg-[var(--rilo-sem-info)]/10 text-[var(--rilo-sem-info)] border-[var(--rilo-sem-info)]/30'
      };
      return colors[color] || colors.info;
    };

    const formatValue = (val) => {
      if (format === 'currency') {
        return `¥${val?.toLocaleString() || '0'}`;
      } else if (format === 'percent') {
        return `${(val || 0).toFixed(1)}%`;
      } else if (format === 'number') {
        return val?.toLocaleString() || '0';
      }
      return val;
    };

    return React.createElement('div', {
      className: `${getColorClasses(color)} rounded-xl p-4 border ${size === 'large' ? 'col-span-2' : ''}`
    }, [
      React.createElement('div', {
        key: 'title',
        className: 'text-xs text-[var(--rilo-text-3)] mb-1'
      }, title),
      React.createElement('div', {
        key: 'value',
        className: `font-bold ${size === 'large' ? 'text-2xl' : 'text-lg'} text-[var(--rilo-text-1)]`
      }, formatValue(value)),
      change && React.createElement('div', {
        key: 'change',
        className: `text-xs mt-1 ${change > 0 ? 'text-[var(--rilo-sem-success)]' : 'text-[var(--rilo-sem-danger)]'}`
      }, `${change > 0 ? '+' : ''}${change.toFixed(1)}%`)
    ]);
  };

  // 按钮组件
  const Button = ({ children, onClick, variant = 'primary', size = 'normal', disabled = false, className = "" }) => {
    const getVariantClasses = (variant) => {
      const variants = {
        primary: 'bg-[var(--rilo-accent)] hover:bg-[var(--rilo-accent-500)] text-white',
        secondary: 'bg-[var(--rilo-text-2)] hover:bg-[var(--rilo-text-1)] text-[var(--rilo-text-1)]',
        success: 'bg-[var(--rilo-sem-success)] hover:bg-[var(--rilo-sem-success)]/90 text-white',
        danger: 'bg-[var(--rilo-sem-danger)] hover:bg-[var(--rilo-sem-danger)]/90 text-white',
        outline: `border border-[var(--rilo-accent)] text-[var(--rilo-accent)] hover:bg-[var(--rilo-accent)]/10`
      };
      return variants[variant] || variants.primary;
    };

    const getSizeClasses = (size) => {
      const sizes = {
        small: 'px-3 py-1 text-sm',
        normal: 'px-4 py-2',
        large: 'px-6 py-3 text-lg'
      };
      return sizes[size] || sizes.normal;
    };

    return React.createElement('button', {
      className: `${getVariantClasses(variant)} ${getSizeClasses(size)} rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`,
      onClick: disabled ? null : onClick,
      disabled: disabled
    }, children);
  };

  // 页签组件
  const Tabs = ({ tabs, activeTab, onTabChange, className = "" }) => {
    return React.createElement('div', {
      className: `border-b border-[var(--rilo-border-deep)] ${className}`
    }, 
      React.createElement('nav', {
        className: 'flex space-x-8'
      }, tabs.map(tab => 
        React.createElement('button', {
          key: tab.id,
          className: `py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === tab.id
              ? 'border-[var(--rilo-accent)] text-[var(--rilo-accent)]'
              : `border-transparent text-[var(--rilo-text-3)] hover:text-[var(--rilo-text-1)] hover:border-[var(--rilo-border-deep)]`
          }`,
          onClick: () => onTabChange(tab.id)
        }, [
          tab.icon && React.createElement('span', {
            key: 'icon',
            className: 'mr-2'
          }, tab.icon),
          tab.label
        ])
      ))
    );
  };

  // 模态框组件
  const Modal = ({ isOpen, onClose, title, children, size = 'normal' }) => {
    const getSizeClasses = (size) => {
      const sizes = {
        small: 'max-w-md',
        normal: 'max-w-lg',
        large: 'max-w-2xl',
        xlarge: 'max-w-4xl'
      };
      return sizes[size] || sizes.normal;
    };

    if (!isOpen) return null;

    return React.createElement('div', {
      className: 'fixed inset-0 z-50 overflow-y-auto',
      onClick: onClose
    }, [
      React.createElement('div', {
        key: 'backdrop',
        className: 'fixed inset-0 bg-black bg-opacity-50 transition-opacity'
      }),
      React.createElement('div', {
        key: 'modal',
        className: 'flex min-h-full items-center justify-center p-4'
      },
        React.createElement('div', {
          className: `bg-white rounded-2xl shadow-xl w-full ${getSizeClasses(size)} transform transition-all`,
          onClick: (e) => e.stopPropagation()
        }, [
          React.createElement('div', {
            key: 'header',
            className: 'px-6 py-4 border-b border-gray-200'
          }, [
            React.createElement('div', {
              key: 'title-row',
              className: 'flex items-center justify-between'
            }, [
              React.createElement('h3', {
                key: 'title',
                className: 'text-lg font-semibold text-gray-900'
              }, title),
              React.createElement('button', {
                key: 'close',
                className: 'text-gray-400 hover:text-gray-600',
                onClick: onClose
              }, '✕')
            ])
          ]),
          React.createElement('div', {
            key: 'content',
            className: 'px-6 py-4'
          }, children)
        ])
      )
    ]);
  };

  // 工具提示组件
  const Tooltip = ({ children, content, position = 'top' }) => {
    const [isVisible, setIsVisible] = React.useState(false);

    const getPositionClasses = (position) => {
      const positions = {
        top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
      };
      return positions[position] || positions.top;
    };

    return React.createElement('div', {
      className: 'relative inline-block',
      onMouseEnter: () => setIsVisible(true),
      onMouseLeave: () => setIsVisible(false)
    }, [
      children,
      isVisible && React.createElement('div', {
        key: 'tooltip',
        className: `absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg ${getPositionClasses(position)}`
      }, content)
    ]);
  };

  // 进度条组件
  const ProgressBar = ({ value, max = 100, color = 'blue', showPercentage = true, label = '' }) => {
    const percentage = Math.min((value / max) * 100, 100);
    
    const getColorClasses = (color) => {
      const colors = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        red: 'bg-red-500',
        orange: 'bg-orange-500'
      };
      return colors[color] || colors.blue;
    };

    return React.createElement('div', {
      className: 'w-full'
    }, [
      label && React.createElement('div', {
        key: 'label',
        className: 'flex justify-between items-center mb-1'
      }, [
        React.createElement('span', {
          key: 'label-text',
          className: 'text-sm text-gray-600'
        }, label),
        showPercentage && React.createElement('span', {
          key: 'percentage',
          className: 'text-sm text-gray-600'
        }, `${percentage.toFixed(1)}%`)
      ]),
      React.createElement('div', {
        key: 'progress-bg',
        className: 'w-full bg-gray-200 rounded-full h-2'
      },
        React.createElement('div', {
          className: `h-2 rounded-full transition-all duration-300 ${getColorClasses(color)}`,
          style: { width: `${percentage}%` }
        })
      )
    ]);
  };

  // 加载指示器组件
  const Loading = ({ size = 'normal', color = 'blue' }) => {
    const getSizeClasses = (size) => {
      const sizes = {
        small: 'w-4 h-4',
        normal: 'w-8 h-8',
        large: 'w-12 h-12'
      };
      return sizes[size] || sizes.normal;
    };

    const getColorClasses = (color) => {
      const colors = {
        blue: 'border-blue-600',
        gray: 'border-gray-600'
      };
      return colors[color] || colors.blue;
    };

    return React.createElement('div', {
      className: `${getSizeClasses(size)} ${getColorClasses(color)} border-2 border-t-transparent rounded-full animate-spin`
    });
  };

  // 返回所有组件
  return {
    Input,
    TextArea,
    Select,
    Section,
    KPI,
    Button,
    Tabs,
    Modal,
    Tooltip,
    ProgressBar,
    Loading
  };

})();