// 收入设置组件 - 所有收入板块的配置
window.RevenueSettings = (function() {

  // 通用输入字段创建函数
  const createInputField = (config, data, updateField) => {
    const path = config.path || `revenue.${config.section}.${config.key}`;
    const currentValue = config.path ? 
      (config.path.includes('cost') ? data?.cost?.margins?.[config.section] : data?.revenue?.[config.section]?.[config.key]) :
      data?.revenue?.[config.section]?.[config.key];
      
    return React.createElement(window.UIComponents.Input, {
      label: config.label,
      value: currentValue || config.defaultValue || 0,
      onChange: (value) => updateField(path, value),
      suffix: config.suffix,
      width: '25%'
    });
  };

  const clampPercentage = (value) => Math.max(0, Math.min(100, value));

  const formatPercentageInputValue = (value) => {
    if (value === '' || value === null || value === undefined) return '';
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return '';
    return numericValue.toFixed(1).replace(/\.0$/, '');
  };

  const parsePercentageValue = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return null;
    return Math.round(clampPercentage(numericValue) * 10) / 10;
  };

  const PercentageDualInput = ({ config, value, updateField }) => {
    const [inputValue, setInputValue] = React.useState(formatPercentageInputValue(value));

    React.useEffect(() => {
      setInputValue(formatPercentageInputValue(value));
    }, [value]);

    const applyValue = (nextValue) => {
      const parsedValue = parsePercentageValue(nextValue);
      if (parsedValue === null) {
        setInputValue(formatPercentageInputValue(value));
        return;
      }
      updateField(config.path, parsedValue);
    };

    return React.createElement('div', {
      className: 'flex flex-col gap-2',
      style: { width: '25%' }
    }, [
      React.createElement('label', {
        key: 'label',
        className: 'text-sm text-[var(--rilo-text-2)]'
      }, config.label),
      React.createElement('input', {
        key: 'slider',
        type: 'range',
        min: '0',
        max: '100',
        step: '0.1',
        value: parsePercentageValue(value) ?? 0,
        onChange: (e) => {
          const nextValue = parsePercentageValue(e.target.value);
          if (nextValue === null) return;
          setInputValue(formatPercentageInputValue(nextValue));
          updateField(config.path, nextValue);
        },
        className: 'w-full cursor-pointer accent-[var(--rilo-accent)]'
      }),
      React.createElement('div', {
        key: 'number-row',
        className: 'relative'
      }, [
        React.createElement('input', {
          key: 'number',
          type: 'number',
          min: '0',
          max: '100',
          step: '0.1',
          value: inputValue,
          onChange: (e) => {
            const nextValue = e.target.value;
            setInputValue(nextValue);
            if (nextValue === '' || nextValue.endsWith('.')) return;
            const parsedValue = parsePercentageValue(nextValue);
            if (parsedValue === null) return;
            updateField(config.path, parsedValue);
          },
          onBlur: () => applyValue(inputValue),
          className: 'px-3 py-2 rounded-xl border w-full bg-[var(--rilo-surface-1)] text-[var(--rilo-text-1)] border-[var(--rilo-border-deep)] focus:border-[var(--rilo-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--rilo-accent)]/20'
        }),
        config.suffix && React.createElement('span', {
          key: 'suffix',
          className: 'absolute right-3 top-2 text-gray-400 text-sm'
        }, config.suffix)
      ])
    ]);
  };

  const createDualPercentageField = (config, value, updateField) => React.createElement(PercentageDualInput, {
    key: config.key,
    config,
    value,
    updateField
  });

  const RevenueSettings = ({ data, updateData, formulaEngine }) => {
    const updateField = (path, value) => {
      if (window.dataManager) {
        const newData = window.dataManager.updateDataPath(data, path, value);
        updateData(newData);
      }
    };

    // 计算收入预测数据
    const calculateRevenueData = () => {
      const member = data?.revenue?.member || {};
      const boarding = data?.revenue?.boarding || {};
      const medical = data?.revenue?.medical || {};
      const retail = data?.revenue?.retail || {};
      const cafe = data?.revenue?.cafe || {};
      const daysPerYear = data?.basic?.daysPerYear || 365;

      const memberRevenue = (member.count || 0) * (
        ((member.basePct || 0) / 100 * (member.basePrice || 0)) +
        ((member.proPct || 0) / 100 * (member.proPrice || 0)) +
        ((member.vipPct || 0) / 100 * (member.vipPrice || 0))
      );
      
      const boardingRevenue = (boarding.rooms || 0) * (boarding.adr || 0) * daysPerYear * ((boarding.occ || 0) / 100);
      const medicalRevenue = (medical.monthlyRevenue || 0) * 12;
      const retailRevenue = (retail.monthlyRevenue || 0) * 12;
      const cafeRevenue = (cafe.monthlyRevenue || 0) * 12;
      
      const totalRevenue = memberRevenue + boardingRevenue + medicalRevenue + retailRevenue + cafeRevenue;

      return {
        memberRevenue,
        boardingRevenue,
        medicalRevenue,
        retailRevenue,
        cafeRevenue,
        totalRevenue,
        memberDaily: memberRevenue / daysPerYear,
        boardingDaily: boardingRevenue / daysPerYear,
        medicalDaily: medicalRevenue / daysPerYear,
        retailDaily: retailRevenue / daysPerYear,
        cafeDaily: cafeRevenue / daysPerYear,
        totalDaily: totalRevenue / daysPerYear
      };
    };

    const revenueData = calculateRevenueData();

    return React.createElement(window.UIComponents.Space, {
      direction: 'vertical',
      size: 'large',
      style: { width: '100%' }
    }, [
      React.createElement(MemberRevenueSettings, {
        key: 'member-revenue',
        data: data,
        updateField: updateField,
        revenueData: revenueData
      }),

      React.createElement(BoardingRevenueSettings, {
        key: 'boarding-revenue',
        data: data,
        updateField: updateField,
        revenueData: revenueData
      }),

      React.createElement(MedicalRevenueSettings, {
        key: 'medical-revenue',
        data: data,
        updateField: updateField,
        revenueData: revenueData
      }),

      React.createElement(RetailRevenueSettings, {
        key: 'retail-revenue',
        data: data,
        updateField: updateField,
        revenueData: revenueData
      }),

      React.createElement(CafeRevenueSettings, {
        key: 'cafe-revenue',
        data: data,
        updateField: updateField,
        revenueData: revenueData
      }),

      // 自定义收入模块
      React.createElement(window.UIComponents.Section, {
        key: 'custom-revenue',
        title: '💰 自定义收入'
      }, React.createElement(window.CustomModules.CustomRevenueManager, {
        data: data,
        updateData: updateData,
        formulaEngine: formulaEngine
      }))
    ]);
  };

  // 会员收入设置组件
  const MemberRevenueSettings = ({ data, updateField, revenueData }) => {
    return React.createElement(window.UIComponents.Section, {
      title: '👥 会员收入设置'
    }, React.createElement(window.UIComponents.Space, {
      direction: 'vertical',
      size: 'middle',
      style: { width: '100%' }
    }, [
      React.createElement('div', {
        key: 'member-top-row',
        className: 'flex gap-4 w-full'
      }, [
        // 会员总数 (数字输入 - 25% width)
        React.createElement(window.UIComponents.Input, {
          label: '会员总数',
          value: data?.revenue?.member?.count || 0,
          onChange: (value) => updateField('revenue.member.count', value),
          width: '25%'
        }),

        // 会员毛利率 (数字输入 - 25% width)
        React.createElement(window.UIComponents.Input, {
          label: '会员毛利率 (%)',
          value: data?.cost?.margins?.members || 0,
          onChange: (value) => updateField('cost.margins.members', value),
          suffix: '%',
          width: '25%'
        })
      ]),

      React.createElement(MemberTypePercentages, {
        key: 'type-percentages',
        data: data,
        updateField: updateField
      }),

      React.createElement(MemberPrices, {
        key: 'prices',
        data: data,
        updateField: updateField
      }),

      React.createElement('div', {
        key: 'member-calculation',
        style: { 
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid #f0f0f0'
        }
      }, [
        React.createElement('div', {
          key: 'title',
          className: 'text-xs font-medium text-gray-500 mb-1'
        }, '收入预测'),
        React.createElement('div', {
          key: 'daily',
          className: 'text-sm text-gray-600 mb-1'
        }, [
          React.createElement('span', {
            key: 'daily-label'
          }, '日均收入: '),
          React.createElement('span', {
            key: 'daily-value',
            className: 'font-medium'
          }, `¥${(revenueData.memberDaily || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`)
        ]),
        React.createElement('div', {
          key: 'annual',
          className: 'text-sm text-gray-600'
        }, [
          React.createElement('span', {
            key: 'annual-label'
          }, '年度收入: '),
          React.createElement('span', {
            key: 'annual-value',
            className: 'font-medium'
          }, `${(revenueData.memberRevenue / 10000).toFixed(2)} 万元`)
        ])
      ])
    ]));
  };

  // 会员数量和毛利率
  const MemberCountAndMargin = ({ data, updateField }) => {
    return React.createElement('div', {
      className: 'flex flex-wrap gap-4 w-full'
    }, [
      // 会员总数 (数字输入 - 25% width)
      React.createElement(window.UIComponents.Input, {
        label: '会员总数',
        value: data?.revenue?.member?.count || 0,
        onChange: (value) => updateField('revenue.member.count', value),
        width: '25%'
      }),

      // 会员毛利率 (数字输入 - 25% width)
      React.createElement(window.UIComponents.Input, {
        label: '会员毛利率 (%)',
        value: data?.cost?.margins?.members || 0,
        onChange: (value) => updateField('cost.margins.members', value),
        suffix: '%',
        width: '25%'
      })
    ]);
  };

  // 会员类型比例
  const MemberTypePercentages = ({ data, updateField }) => {
    return React.createElement('div', null, [
      React.createElement('div', {
        key: 'title',
        className: 'text-sm font-medium text-gray-700 mb-3'
      }, '会员类型分布'),
      React.createElement('div', {
        key: 'inputs',
        className: 'flex gap-4 w-full'
      }, [
        // 基础会员比例 (数字输入 - 25% width)
        React.createElement(window.UIComponents.Input, {
          label: '基础会员比例 (%)',
          value: data?.revenue?.member?.basePct || 0,
          onChange: (value) => updateField('revenue.member.basePct', value),
          suffix: '%',
          width: '25%'
        }),

        // 高级会员比例 (数字输入 - 25% width)
        React.createElement(window.UIComponents.Input, {
          label: '高级会员比例 (%)',
          value: data?.revenue?.member?.proPct || 0,
          onChange: (value) => updateField('revenue.member.proPct', value),
          suffix: '%',
          width: '25%'
        }),

        // VIP会员比例 (数字输入 - 25% width)
        React.createElement(window.UIComponents.Input, {
          label: 'VIP会员比例 (%)',
          value: data?.revenue?.member?.vipPct || 0,
          onChange: (value) => updateField('revenue.member.vipPct', value),
          suffix: '%',
          width: '25%'
        })
      ]),
      React.createElement('div', {
        key: 'total',
        className: 'text-xs text-gray-500 mt-2'
      }, `总计: ${(data?.revenue?.member?.basePct || 0) + (data?.revenue?.member?.proPct || 0) + (data?.revenue?.member?.vipPct || 0)}% (应为100%)`)
    ]);
  };

  // 会员价格设置
  const MemberPrices = ({ data, updateField }) => {
    const memberPrices = [
      { key: 'basePrice', label: '基础会员年费' },
      { key: 'proPrice', label: '高级会员年费' },
      { key: 'vipPrice', label: 'VIP会员年费' }
    ];

    return React.createElement('div', null, [
      React.createElement('div', {
        key: 'title',
        className: 'text-sm font-medium text-gray-700 mb-3'
      }, '会员年费设置'),
      React.createElement('div', {
        key: 'inputs',
        className: 'flex gap-4 w-full'
      }, memberPrices.map(price => 
        React.createElement(window.UIComponents.Input, {
          key: price.key,
          label: price.label,
          value: data?.revenue?.member?.[price.key] || 0,
          onChange: (value) => updateField(`revenue.member.${price.key}`, value),
          suffix: '元',
          width: '25%'
        })
      ))
    ]);
  };

  // 寄养收入设置组件 - 简化版本
  const BoardingRevenueSettings = ({ data, updateField, revenueData }) => {
    const Term = window.RiloUI?.Term;
    const boardingFields = [
      { key: 'rooms', label: Term ? React.createElement(React.Fragment, null, ['寄养房间数（', React.createElement(Term, { termKey: 'rooms' }, 'Rooms'), '）']) : '寄养房间数 (Rooms)', suffix: '间', section: 'boarding' },
      { key: 'adr', label: Term ? React.createElement(React.Fragment, null, ['平均房价（', React.createElement(Term, { termKey: 'adr' }, 'ADR'), '）']) : '平均房价 (ADR)', suffix: '元/天', section: 'boarding' }
    ];
    const boardingPercentageFields = [
      { key: 'occ', label: Term ? React.createElement(React.Fragment, null, ['入住率（', React.createElement(Term, { termKey: 'occ' }, 'Occ'), '）']) : '入住率 (Occ)', suffix: '%', path: 'revenue.boarding.occ' },
      { key: 'margin', label: '寄养毛利率 (%)', suffix: '%', path: 'cost.margins.boarding' }
    ];

    return React.createElement(window.UIComponents.Section, {
      title: '🏨 寄养收入设置'
    }, React.createElement(window.UIComponents.Space, {
      direction: 'vertical',
      size: 'middle',
      style: { width: '100%' }
    }, [
      React.createElement('div', {
        key: 'core-inputs',
        className: 'flex gap-4 w-full'
      }, boardingFields.map(field => createInputField(field, data, updateField))),

      React.createElement('div', {
        key: 'percentage-inputs',
        className: 'flex gap-4 w-full'
      }, boardingPercentageFields.map(field => {
        const currentValue = field.path === 'cost.margins.boarding'
          ? data?.cost?.margins?.boarding
          : data?.revenue?.boarding?.occ;
        return createDualPercentageField(field, currentValue || 0, updateField);
      })),

      React.createElement('div', {
        key: 'boarding-calculation',
        style: { 
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid #f0f0f0'
        }
      }, [
        React.createElement('div', {
          key: 'title',
          className: 'text-xs font-medium text-gray-500 mb-1'
        }, '收入预测'),
        React.createElement('div', {
          key: 'daily',
          className: 'text-sm text-gray-600 mb-1'
        }, [
          React.createElement('span', {
            key: 'daily-label'
          }, '日均收入: '),
          React.createElement('span', {
            key: 'daily-value',
            className: 'font-medium'
          }, `¥${(revenueData.boardingDaily || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`)
        ]),
        React.createElement('div', {
          key: 'annual',
          className: 'text-sm text-gray-600'
        }, [
          React.createElement('span', {
            key: 'annual-label'
          }, '年度收入: '),
          React.createElement('span', {
            key: 'annual-value',
            className: 'font-medium'
          }, `${(revenueData.boardingRevenue / 10000).toFixed(2)} 万元`)
        ])
      ])
    ]));
  };

  // 医疗收入设置组件
  const MedicalRevenueSettings = ({ data, updateField, revenueData }) => {
    return React.createElement(window.UIComponents.Section, {
      title: '🏥 医疗收入设置'
    }, React.createElement(window.UIComponents.Space, {
      direction: 'vertical',
      size: 'middle',
      style: { width: '100%' }
    }, [
      React.createElement('div', {
        key: 'medical-row',
        className: 'flex gap-4 w-full'
      }, [
        // 月均医疗收入 (数字输入 - 25% width)
        React.createElement(window.UIComponents.Input, {
          label: '月均医疗收入',
          value: data?.revenue?.medical?.monthlyRevenue || 0,
          onChange: (value) => updateField('revenue.medical.monthlyRevenue', value),
          suffix: '元',
          width: '25%'
        }),

        // 医疗毛利率 (数字输入 - 25% width)
        React.createElement(window.UIComponents.Input, {
          label: '医疗毛利率 (%)',
          value: data?.cost?.margins?.medical || 0,
          onChange: (value) => updateField('cost.margins.medical', value),
          suffix: '%',
          width: '25%'
        })
      ]),

      React.createElement('div', {
        key: 'medical-calculation',
        style: { 
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid #f0f0f0'
        }
      }, [
        React.createElement('div', {
          key: 'title',
          className: 'text-xs font-medium text-gray-500 mb-1'
        }, '收入预测'),
        React.createElement('div', {
          key: 'daily',
          className: 'text-sm text-gray-600 mb-1'
        }, [
          React.createElement('span', {
            key: 'daily-label'
          }, '日均收入: '),
          React.createElement('span', {
            key: 'daily-value',
            className: 'font-medium'
          }, `¥${(revenueData.medicalDaily || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`)
        ]),
        React.createElement('div', {
          key: 'annual',
          className: 'text-sm text-gray-600'
        }, [
          React.createElement('span', {
            key: 'annual-label'
          }, '年度收入: '),
          React.createElement('span', {
            key: 'annual-value',
            className: 'font-medium'
          }, `${(revenueData.medicalRevenue / 10000).toFixed(2)} 万元`)
        ])
      ])
    ]));
  };

  // 零售收入设置组件
  const RetailRevenueSettings = ({ data, updateField, revenueData }) => {
    return React.createElement(window.UIComponents.Section, {
      title: '🛍️ 零售收入设置'
    }, React.createElement(window.UIComponents.Space, {
      direction: 'vertical',
      size: 'middle',
      style: { width: '100%' }
    }, [
      React.createElement('div', {
        key: 'retail-row',
        className: 'flex gap-4 w-full'
      }, [
        // 月均零售收入 (数字输入 - 25% width)
        React.createElement(window.UIComponents.Input, {
          label: '月均零售收入',
          value: data?.revenue?.retail?.monthlyRevenue || 0,
          onChange: (value) => updateField('revenue.retail.monthlyRevenue', value),
          suffix: '元',
          width: '25%'
        }),

        // 零售毛利率 (数字输入 - 25% width)
        React.createElement(window.UIComponents.Input, {
          label: '零售毛利率 (%)',
          value: data?.cost?.margins?.retail || 0,
          onChange: (value) => updateField('cost.margins.retail', value),
          suffix: '%',
          width: '25%'
        })
      ]),

      React.createElement('div', {
        key: 'retail-calculation',
        style: { 
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid #f0f0f0'
        }
      }, [
        React.createElement('div', {
          key: 'title',
          className: 'text-xs font-medium text-gray-500 mb-1'
        }, '收入预测'),
        React.createElement('div', {
          key: 'daily',
          className: 'text-sm text-gray-600 mb-1'
        }, [
          React.createElement('span', {
            key: 'daily-label'
          }, '日均收入: '),
          React.createElement('span', {
            key: 'daily-value',
            className: 'font-medium'
          }, `¥${(revenueData.retailDaily || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`)
        ]),
        React.createElement('div', {
          key: 'annual',
          className: 'text-sm text-gray-600'
        }, [
          React.createElement('span', {
            key: 'annual-label'
          }, '年度收入: '),
          React.createElement('span', {
            key: 'annual-value',
            className: 'font-medium'
          }, `${(revenueData.retailRevenue / 10000).toFixed(2)} 万元`)
        ])
      ])
    ]));
  };

  // 餐饮/社交收入设置组件
  const CafeRevenueSettings = ({ data, updateField, revenueData }) => {
    return React.createElement(window.UIComponents.Section, {
      title: '☕ 餐饮/社交收入设置'
    }, React.createElement(window.UIComponents.Space, {
      direction: 'vertical',
      size: 'middle',
      style: { width: '100%' }
    }, [
      React.createElement('div', {
        key: 'cafe-row',
        className: 'flex gap-4 w-full'
      }, [
        // 月均餐饮/社交收入 (数字输入 - 25% width)
        React.createElement(window.UIComponents.Input, {
          label: '月均餐饮/社交收入',
          value: data?.revenue?.cafe?.monthlyRevenue || 0,
          onChange: (value) => updateField('revenue.cafe.monthlyRevenue', value),
          suffix: '元',
          width: '25%'
        }),

        // 餐饮毛利率 (数字输入 - 25% width)
        React.createElement(window.UIComponents.Input, {
          label: '餐饮毛利率 (%)',
          value: data?.cost?.margins?.cafe || 0,
          onChange: (value) => updateField('cost.margins.cafe', value),
          suffix: '%',
          width: '25%'
        })
      ]),

      React.createElement('div', {
        key: 'cafe-calculation',
        style: { 
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid #f0f0f0'
        }
      }, [
        React.createElement('div', {
          key: 'title',
          className: 'text-xs font-medium text-gray-500 mb-1'
        }, '收入预测'),
        React.createElement('div', {
          key: 'daily',
          className: 'text-sm text-gray-600 mb-1'
        }, [
          React.createElement('span', {
            key: 'daily-label'
          }, '日均收入: '),
          React.createElement('span', {
            key: 'daily-value',
            className: 'font-medium'
          }, `¥${(revenueData.cafeDaily || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`)
        ]),
        React.createElement('div', {
          key: 'annual',
          className: 'text-sm text-gray-600'
        }, [
          React.createElement('span', {
            key: 'annual-label'
          }, '年度收入: '),
          React.createElement('span', {
            key: 'annual-value',
            className: 'font-medium'
          }, `${(revenueData.cafeRevenue / 10000).toFixed(2)} 万元`)
        ])
      ])
    ]));
  };

  return {
    RevenueSettings
  };

})();
