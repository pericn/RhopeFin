// UI组件库 - 通用UI组件集合
window.UIComponents = (function() {

  // 通用输入组件
  const Input = ({ label, value, onChange, type = "number", step = 1, suffix = "", hint = "", required = false, format = "decimal", width = null, className = "" }) => {
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
      className: `flex flex-col gap-1 ${className}`.trim(),
      style: width ? { width } : undefined
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
          className: `px-3 py-2.5 rounded-xl border w-full bg-[var(--rilo-surface-1)] text-[var(--rilo-text-1)] placeholder-[var(--rilo-text-3)] ${required && !value ? 'border-[var(--rilo-sem-danger)]' : 'border-[var(--rilo-border-deep)]'} focus:border-[var(--rilo-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--rilo-accent)]/15`,
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
          className: 'absolute right-3 top-2 text-sm text-[var(--rilo-text-3)]'
        }, suffix)
      ]),
      hint && React.createElement('div', {
        key: 'hint',
        className: 'text-xs text-[var(--rilo-text-3)]'
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
        className: 'text-sm text-[var(--rilo-text-2)]'
      }, label),
      React.createElement('textarea', {
        key: 'textarea',
        className: 'px-3 py-2.5 rounded-xl border w-full resize-none bg-[var(--rilo-surface-1)] border-[var(--rilo-border-deep)] text-[var(--rilo-text-1)] shadow-[var(--rilo-shadow-soft)] focus:border-[var(--rilo-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--rilo-accent)]/15',
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
        className: 'px-3 py-2.5 rounded-xl border w-full bg-[var(--rilo-surface-1)] text-[var(--rilo-text-1)] border-[var(--rilo-border-deep)] shadow-[var(--rilo-shadow-soft)] focus:border-[var(--rilo-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--rilo-accent)]/15',
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
      className: `rilo-ledger-panel rounded-[var(--radius-lg)] border border-[var(--rilo-border-deep)] p-4 lg:p-6 ${className}`
    }, [
      React.createElement('div', {
        key: 'header',
        className: 'flex items-center justify-between mb-5 border-b border-[var(--line)] pb-4'
      }, [
        React.createElement('div', {
          key: 'title-section',
          className: 'flex items-center gap-3'
        }, [
          React.createElement('span', {
            key: 'index',
            className: 'text-[11px] uppercase tracking-[0.24em] text-[var(--rilo-text-3)]'
          }, 'Section'),
          React.createElement('h2', {
            key: 'title',
            className: 'text-lg font-semibold tracking-[var(--rilo-tracking-tight-cn)] text-[var(--rilo-text-1)]'
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
        className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5'
      }, children)
    ]);
  };

  // KPI指标显示组件
  const KPI = ({ title, value, color = "info", size = "normal", change = null, changeLabel = null, format = null, suffix = "" }) => {
    const getColorClasses = (color) => {
      const colors = {
        success: 'bg-[var(--rilo-value-success-soft)] text-[var(--rilo-value-success)] border-[var(--rilo-value-success-border)]',
        danger: 'bg-[var(--rilo-value-danger-soft)] text-[var(--rilo-value-danger)] border-[var(--rilo-value-danger-border)]',
        warning: 'bg-[var(--rilo-value-warning-soft)] text-[var(--rilo-value-warning)] border-[var(--rilo-value-warning-border)]',
        info: 'bg-[var(--rilo-value-info-soft)] text-[var(--rilo-value-info)] border-[var(--rilo-value-info-border)]'
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

    const formattedValue = formatValue(value);
    const showSuffix = suffix && typeof formattedValue === 'string' && !formattedValue.includes(suffix);
    const hasChange = changeLabel !== null || change !== null;
    const changeTone = change > 0
      ? 'bg-[var(--rilo-value-success-soft)] text-[var(--rilo-value-success)]'
      : change < 0
        ? 'bg-[var(--rilo-value-danger-soft)] text-[var(--rilo-value-danger)]'
        : 'bg-[rgba(34,31,26,0.08)] text-[var(--rilo-text-2)]';
    const resolvedChangeLabel = changeLabel || (change !== null
      ? `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
      : null);

    return React.createElement('div', {
      className: `${getColorClasses(color)} rilo-kpi-strong rounded-[var(--radius-md)] p-4 border relative overflow-hidden ${size === 'large' ? 'col-span-2' : ''}`
    }, [
      React.createElement('div', {
        key: 'glow',
        className: 'pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(109,121,136,0.18),transparent)]'
      }),
      React.createElement('div', {
        key: 'title',
        className: 'pr-10 text-[11px] uppercase tracking-[0.22em] text-[var(--rilo-text-3)] mb-3'
      }, title),
      React.createElement('div', {
        key: 'value',
        className: `font-bold ${size === 'large' ? 'text-[2.1rem]' : 'text-[1.55rem]'} tracking-[-0.05em] text-[var(--rilo-text-1)] leading-[1.02]`
      }, [
        React.createElement('span', { key: 'main' }, formattedValue),
        showSuffix && React.createElement('span', {
          key: 'suffix',
          className: 'ml-1.5 text-sm font-medium tracking-normal text-[var(--rilo-text-3)]'
        }, suffix)
      ]),
      hasChange && React.createElement('div', {
        key: 'change',
        className: `mt-3 inline-flex min-h-[28px] items-center rounded-full px-2.5 text-xs font-medium ${changeTone}`
      }, resolvedChangeLabel)
    ]);
  };

  // 按钮组件
  const Button = ({ children, onClick, variant = 'primary', size = 'normal', disabled = false, className = "" }) => {
    const getVariantClasses = (variant) => {
      const variants = {
        primary: 'border border-[rgba(86,101,125,0.18)] bg-[rgba(86,101,125,0.92)] text-[#f7f2ea] hover:-translate-y-px hover:bg-[rgba(86,101,125,0.98)]',
        secondary: 'border border-[rgba(34,31,26,0.11)] bg-[rgba(255,255,255,0.62)] text-[var(--rilo-text-1)] hover:-translate-y-px hover:border-[var(--rilo-border-strong)] hover:bg-[var(--rilo-surface-muted)]',
        success: 'border border-[rgba(118,139,118,0.18)] bg-[rgba(118,139,118,0.92)] text-[#f7f2ea] hover:-translate-y-px',
        danger: 'border border-[rgba(141,117,111,0.18)] bg-[rgba(141,117,111,0.92)] text-[#f7f2ea] hover:-translate-y-px',
        outline: 'rilo-btn-soft hover:-translate-y-px',
        ghost: 'border border-transparent bg-transparent text-[var(--rilo-text-2)] hover:bg-[rgba(255,255,255,0.36)] hover:text-[var(--rilo-text-1)]'
      };
      return variants[variant] || variants.primary;
    };

    const getSizeClasses = (size) => {
      const sizes = {
        small: 'min-h-[36px] px-3.5 py-1.5 text-sm',
        normal: 'min-h-[42px] px-4.5 py-2.5 text-sm',
        large: 'min-h-[48px] px-6 py-3 text-lg'
      };
      return sizes[size] || sizes.normal;
    };

    return React.createElement('button', {
      className: `${getVariantClasses(variant)} ${getSizeClasses(size)} rounded-[14px] font-medium tracking-[0.01em] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--rilo-accent)]/15 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${className}`,
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
    const triggerRef = React.useRef(null);
    const [tooltipStyle, setTooltipStyle] = React.useState(null);

    const updateTooltipStyle = React.useCallback(() => {
      if (!triggerRef.current || typeof window === 'undefined') return;
      const rect = triggerRef.current.getBoundingClientRect();
      const width = Math.min(280, Math.max(200, window.innerWidth - 24));
      const baseLeft = rect.left + (rect.width / 2) - (width / 2);
      const left = Math.min(Math.max(12, baseLeft), Math.max(12, window.innerWidth - width - 12));
      const top = position === 'bottom'
        ? rect.bottom + 10
        : rect.top - 10;
      const translatedTop = position === 'bottom'
        ? top
        : Math.max(12, top - 44);
      setTooltipStyle({ left: `${left}px`, top: `${translatedTop}px`, width: `${width}px` });
    }, [position]);

    React.useEffect(() => {
      if (!isVisible) return undefined;
      updateTooltipStyle();
      window.addEventListener('resize', updateTooltipStyle);
      window.addEventListener('scroll', updateTooltipStyle, true);
      return () => {
        window.removeEventListener('resize', updateTooltipStyle);
        window.removeEventListener('scroll', updateTooltipStyle, true);
      };
    }, [isVisible, updateTooltipStyle]);

    const tooltipContent = isVisible && React.createElement('div', {
      key: 'tooltip',
      className: 'fixed z-[1200] rounded-lg border border-[rgba(34,31,26,0.14)] bg-[rgba(34,31,26,0.96)] px-3 py-2 text-sm text-[rgba(247,242,234,0.96)] shadow-[0_16px_36px_rgba(34,31,26,0.28)]',
      style: tooltipStyle || undefined
    }, content);

    return React.createElement('div', {
      ref: triggerRef,
      className: 'relative inline-block',
      onMouseEnter: () => setIsVisible(true),
      onMouseLeave: () => setIsVisible(false)
    }, [
      children,
      // BUGFIX-4: Tooltip 改为 fixed + portal，避免 hover 浮层被父容器 overflow 裁切且背景发虚。
      tooltipContent && ReactDOM.createPortal(tooltipContent, document.body)
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
