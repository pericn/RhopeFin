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
      suffix: config.suffix
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
      style: { width: '100%' }
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
          className: 'pointer-events-none absolute right-3 top-2 text-sm text-[var(--rilo-text-3)]'
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

  const FieldGrid = ({ children }) => React.createElement('div', {
    className: 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'
  }, children);

  const Subsection = ({ title, hint = '', children }) => React.createElement('div', {
    className: 'rounded-2xl border border-[var(--rilo-border-deep)] bg-[rgba(255,255,255,0.44)] p-4'
  }, [
    React.createElement('div', {
      key: 'header',
      className: 'mb-3 flex flex-col gap-1'
    }, [
      React.createElement('div', {
        key: 'title',
        className: 'text-sm font-semibold text-[var(--rilo-text-1)]'
      }, title),
      hint && React.createElement('div', {
        key: 'hint',
        className: 'text-xs text-[var(--rilo-text-3)]'
      }, hint)
    ]),
    children
  ]);

  const RevenueReadout = ({ items }) => React.createElement('div', {
    className: 'grid gap-3 md:grid-cols-3'
  }, items.map((item) => React.createElement('div', {
    key: item.label,
    className: 'rounded-2xl border border-[var(--rilo-border-deep)] bg-[rgba(255,255,255,0.52)] px-3 py-3'
  }, [
    React.createElement('div', {
      key: 'label',
      className: 'text-[11px] uppercase tracking-[0.18em] text-[var(--rilo-text-3)]'
    }, item.label),
    React.createElement('div', {
      key: 'value',
      className: 'mt-1 text-base font-semibold text-[var(--rilo-text-1)]'
    }, item.value),
    item.note && React.createElement('div', {
      key: 'note',
      className: 'mt-1 text-xs text-[var(--rilo-text-3)]'
    }, item.note)
  ])));

  const RevenueSettings = ({ data, updateData, formulaEngine }) => {
    const [activeTab, setActiveTab] = React.useState('member');
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
    const tabItems = [
      { id: 'member', label: '会员' },
      { id: 'boarding', label: '寄养' },
      { id: 'services', label: '服务' },
      { id: 'custom', label: '自定义' }
    ];
    const tabPanels = {
      member: React.createElement(MemberRevenueSettings, {
        key: 'member-revenue',
        data,
        updateField,
        revenueData
      }),
      boarding: React.createElement(BoardingRevenueSettings, {
        key: 'boarding-revenue',
        data,
        updateField,
        revenueData
      }),
      services: React.createElement(React.Fragment, { key: 'service-panels' }, [
        React.createElement(MedicalRevenueSettings, {
          key: 'medical-revenue',
          data,
          updateField,
          revenueData
        }),
        React.createElement(RetailRevenueSettings, {
          key: 'retail-revenue',
          data,
          updateField,
          revenueData
        }),
        React.createElement(CafeRevenueSettings, {
          key: 'cafe-revenue',
          data,
          updateField,
          revenueData
        })
      ]),
      custom: React.createElement(window.UIComponents.Section, {
        key: 'custom-revenue',
        title: '💰 自定义收入'
      }, React.createElement(window.CustomModules.CustomRevenueManager, {
        data,
        updateData,
        formulaEngine
      }))
    };

    return React.createElement(window.UIComponents.Space, {
      direction: 'vertical',
      size: 'large',
      style: { width: '100%' }
    }, [
      React.createElement(Subsection, {
        key: 'revenue-overview',
        title: '收入总览',
        hint: '先看年度结构，再进入单板块调整假设。'
      }, React.createElement(RevenueReadout, {
        items: [
          { label: '总日均收入', value: `¥${Math.round(revenueData.totalDaily || 0).toLocaleString()}` },
          { label: '总年度收入', value: `${(revenueData.totalRevenue / 10000).toFixed(2)} 万元` },
          { label: '寄养占比', value: `${revenueData.totalRevenue > 0 ? ((revenueData.boardingRevenue / revenueData.totalRevenue) * 100).toFixed(1) : '0.0'}%`, note: '快速判断房量逻辑是否过重' }
        ]
      })),
      window.UIComponents.Tabs
        ? React.createElement('div', { key: 'revenue-tabs' }, [
            // BUGFIX-5: 收入设置拆成 Tabs，避免不同收入维度在同一长页面里堆叠失控。
            React.createElement(window.UIComponents.Tabs, {
              key: 'tabs',
              tabs: tabItems,
              activeTab,
              onTabChange: setActiveTab
            }),
            React.createElement('div', {
              key: 'tab-panel',
              className: 'mt-4'
            }, tabPanels[activeTab] || tabPanels.member)
          ])
        : tabPanels.member
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
      React.createElement(Subsection, {
        key: 'member-scale',
        title: '规模与盈利口径',
        hint: '先确认全年会员池和毛利率。'
      }, React.createElement(FieldGrid, null, [
        React.createElement(window.UIComponents.Input, {
          key: 'count',
          label: '会员总数',
          value: data?.revenue?.member?.count || 0,
          onChange: (value) => updateField('revenue.member.count', value)
        }),
        React.createElement(window.UIComponents.Input, {
          key: 'margin',
          label: '会员毛利率 (%)',
          value: data?.cost?.margins?.members || 0,
          onChange: (value) => updateField('cost.margins.members', value),
          suffix: '%'
        })
      ])),
      React.createElement(Subsection, {
        key: 'member-mix',
        title: '会员结构占比',
        hint: '三档占比建议合计为 100%。'
      }, React.createElement(MemberTypePercentages, {
        data: data,
        updateField: updateField
      })),
      React.createElement(Subsection, {
        key: 'member-pricing',
        title: '会员单价',
        hint: '按年费口径输入各档位价格。'
      }, React.createElement(MemberPrices, {
        data: data,
        updateField: updateField
      })),
      React.createElement(Subsection, {
        key: 'member-output',
        title: '收入产出',
        hint: '快速复核日均、年度和人均贡献。'
      }, React.createElement(RevenueReadout, {
        items: [
          { label: '日均收入', value: `¥${(revenueData.memberDaily || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: '年度收入', value: `${(revenueData.memberRevenue / 10000).toFixed(2)} 万元` },
          { label: '人均年收入', value: `¥${Math.round((revenueData.memberRevenue || 0) / Math.max(data?.revenue?.member?.count || 1, 1)).toLocaleString()}`, note: `当前结构合计 ${((data?.revenue?.member?.basePct || 0) + (data?.revenue?.member?.proPct || 0) + (data?.revenue?.member?.vipPct || 0)).toFixed(0)}%` }
        ]
      }))
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
        className: 'mb-3 text-sm text-[var(--rilo-text-3)]'
      }, '会员类型分布'),
      React.createElement(FieldGrid, {
        key: 'inputs'
      }, [
        // 基础会员比例 (数字输入 - 25% width)
        React.createElement(window.UIComponents.Input, {
          label: '基础会员比例 (%)',
          value: data?.revenue?.member?.basePct || 0,
          onChange: (value) => updateField('revenue.member.basePct', value),
          suffix: '%',
        }),

        // 高级会员比例 (数字输入 - 25% width)
        React.createElement(window.UIComponents.Input, {
          label: '高级会员比例 (%)',
          value: data?.revenue?.member?.proPct || 0,
          onChange: (value) => updateField('revenue.member.proPct', value),
          suffix: '%',
        }),

        // VIP会员比例 (数字输入 - 25% width)
        React.createElement(window.UIComponents.Input, {
          label: 'VIP会员比例 (%)',
          value: data?.revenue?.member?.vipPct || 0,
          onChange: (value) => updateField('revenue.member.vipPct', value),
          suffix: '%',
        })
      ]),
      React.createElement('div', {
        key: 'total',
        className: 'mt-2 text-sm text-[var(--rilo-text-3)]'
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
        className: 'mb-3 text-sm text-[var(--rilo-text-3)]'
      }, '会员年费设置'),
      React.createElement(FieldGrid, {
        key: 'inputs'
      }, memberPrices.map(price => 
        React.createElement(window.UIComponents.Input, {
          key: price.key,
          label: price.label,
          value: data?.revenue?.member?.[price.key] || 0,
          onChange: (value) => updateField(`revenue.member.${price.key}`, value),
          suffix: '元'
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
      React.createElement(Subsection, {
        key: 'boarding-capacity',
        title: '房量与房价',
        hint: '先确认可售房量，再校准日价。'
      }, React.createElement(FieldGrid, null, boardingFields.map(field => createInputField(field, data, updateField)))),
      React.createElement(Subsection, {
        key: 'boarding-conversion',
        title: '入住与毛利',
        hint: '入住率和毛利率决定寄养收入质量。'
      }, React.createElement('div', {
        className: 'grid gap-4 md:grid-cols-2'
      }, boardingPercentageFields.map(field => {
        const currentValue = field.path === 'cost.margins.boarding'
          ? data?.cost?.margins?.boarding
          : data?.revenue?.boarding?.occ;
        return createDualPercentageField(field, currentValue || 0, updateField);
      }))),
      React.createElement(Subsection, {
        key: 'boarding-output',
        title: '收入产出',
        hint: '检查房间效率和年化收入。'
      }, React.createElement(RevenueReadout, {
        items: [
          { label: '日均收入', value: `¥${(revenueData.boardingDaily || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: '年度收入', value: `${(revenueData.boardingRevenue / 10000).toFixed(2)} 万元` },
          { label: '单房年收入', value: `¥${Math.round((revenueData.boardingRevenue || 0) / Math.max(data?.revenue?.boarding?.rooms || 1, 1)).toLocaleString()}` }
        ]
      }))
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
      React.createElement(Subsection, {
        key: 'medical-assumption',
        title: '基础假设',
        hint: '月均收入与毛利率分开校准。'
      }, React.createElement(FieldGrid, null, [
        React.createElement(window.UIComponents.Input, {
          key: 'revenue',
          label: '月均医疗收入',
          value: data?.revenue?.medical?.monthlyRevenue || 0,
          onChange: (value) => updateField('revenue.medical.monthlyRevenue', value),
          suffix: '元'
        }),
        React.createElement(window.UIComponents.Input, {
          key: 'margin',
          label: '医疗毛利率 (%)',
          value: data?.cost?.margins?.medical || 0,
          onChange: (value) => updateField('cost.margins.medical', value),
          suffix: '%'
        })
      ])),
      React.createElement(Subsection, {
        key: 'medical-output',
        title: '收入产出'
      }, React.createElement(RevenueReadout, {
        items: [
          { label: '日均收入', value: `¥${(revenueData.medicalDaily || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: '年度收入', value: `${(revenueData.medicalRevenue / 10000).toFixed(2)} 万元` },
          { label: '月均折算', value: `¥${Math.round((revenueData.medicalRevenue || 0) / 12).toLocaleString()}` }
        ]
      }))
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
      React.createElement(Subsection, {
        key: 'retail-assumption',
        title: '基础假设'
      }, React.createElement(FieldGrid, null, [
        React.createElement(window.UIComponents.Input, {
          key: 'revenue',
          label: '月均零售收入',
          value: data?.revenue?.retail?.monthlyRevenue || 0,
          onChange: (value) => updateField('revenue.retail.monthlyRevenue', value),
          suffix: '元'
        }),
        React.createElement(window.UIComponents.Input, {
          key: 'margin',
          label: '零售毛利率 (%)',
          value: data?.cost?.margins?.retail || 0,
          onChange: (value) => updateField('cost.margins.retail', value),
          suffix: '%'
        })
      ])),
      React.createElement(Subsection, {
        key: 'retail-output',
        title: '收入产出'
      }, React.createElement(RevenueReadout, {
        items: [
          { label: '日均收入', value: `¥${(revenueData.retailDaily || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: '年度收入', value: `${(revenueData.retailRevenue / 10000).toFixed(2)} 万元` },
          { label: '月均折算', value: `¥${Math.round((revenueData.retailRevenue || 0) / 12).toLocaleString()}` }
        ]
      }))
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
      React.createElement(Subsection, {
        key: 'cafe-assumption',
        title: '基础假设'
      }, React.createElement(FieldGrid, null, [
        React.createElement(window.UIComponents.Input, {
          key: 'revenue',
          label: '月均餐饮/社交收入',
          value: data?.revenue?.cafe?.monthlyRevenue || 0,
          onChange: (value) => updateField('revenue.cafe.monthlyRevenue', value),
          suffix: '元'
        }),
        React.createElement(window.UIComponents.Input, {
          key: 'margin',
          label: '餐饮毛利率 (%)',
          value: data?.cost?.margins?.cafe || 0,
          onChange: (value) => updateField('cost.margins.cafe', value),
          suffix: '%'
        })
      ])),
      React.createElement(Subsection, {
        key: 'cafe-output',
        title: '收入产出'
      }, React.createElement(RevenueReadout, {
        items: [
          { label: '日均收入', value: `¥${(revenueData.cafeDaily || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: '年度收入', value: `${(revenueData.cafeRevenue / 10000).toFixed(2)} 万元` },
          { label: '月均折算', value: `¥${Math.round((revenueData.cafeRevenue || 0) / 12).toLocaleString()}` }
        ]
      }))
    ]));
  };

  return {
    RevenueSettings
  };

})();
