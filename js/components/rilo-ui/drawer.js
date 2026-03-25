// Definitions Drawer Component
// 右侧滑出式定义抽屉
// 用法：作为全局组件，通过 UI 触发显示/隐藏

(function() {
  'use strict';

  window.RiloUI = window.RiloUI || {};

  const toDrawerGlossaryDomId = (termKey) => `drawer-glossary-${encodeURIComponent(String(termKey || '').trim())}`;

  // 抽屉容器组件
  const DefinitionsDrawer = ({
    isOpen,
    onClose,
    title = '信息面板',
    activeSection = 'glossary',
    onSectionChange,
    conclusion = null,
    process = null,
    glossaryTerms = {},
    selectedTerm = null
  }) => {
    const [localSection, setLocalSection] = React.useState(activeSection || 'glossary');

    React.useEffect(() => {
      setLocalSection(activeSection || 'glossary');
    }, [activeSection]);

    React.useEffect(() => {
      if (!isOpen) return undefined;

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }, [isOpen]);

    // ESC 键关闭
    React.useEffect(() => {
      if (!isOpen) return undefined;

      const handleEsc = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // 点击遮罩关闭
    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) onClose();
    };

    const entries = window.RiloUI?.getGlossaryEntries
      ? window.RiloUI.getGlossaryEntries(window.RiloUI?.termRegistry || {}, glossaryTerms || {})
      : Object.entries(Object.assign({}, window.RiloUI?.termRegistry || {}, glossaryTerms || {}));

    const currentSection = localSection || 'glossary';
    const switchSection = (nextSection) => {
      setLocalSection(nextSection);
      if (onSectionChange) onSectionChange(nextSection);
    };

    React.useEffect(() => {
      if (!isOpen || currentSection !== 'glossary' || !selectedTerm) return;

      const el = document.getElementById(toDrawerGlossaryDomId(selectedTerm));
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ block: 'nearest' });
      }
    }, [selectedTerm, currentSection, isOpen]);

    if (!isOpen) return null;

    const sectionButton = (sectionKey, label) => React.createElement('button', {
      key: sectionKey,
      type: 'button',
      className: `min-h-[36px] px-3.5 py-1.5 rounded-[14px] text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--rilo-accent)]/15 ${currentSection === sectionKey ? 'rilo-btn-strong' : 'rilo-btn-soft text-[var(--rilo-text-2)] hover:text-[var(--rilo-text-1)]'}`,
      onClick: () => switchSection(sectionKey)
    }, label);

    const glossaryDom = entries.length > 0
      ? entries.map(([key, def]) =>
          React.createElement('div', {
            key,
            id: toDrawerGlossaryDomId(key),
            className: `mb-6 rounded-2xl pb-6 border-b border-[var(--rilo-border-deep)] last:border-0 ${selectedTerm === key ? 'bg-[var(--rilo-surface-2)] px-3 pt-3' : ''}`
          }, [
            React.createElement('h3', {
              key: 'title',
              className: 'text-base font-semibold text-[var(--rilo-accent)] mb-2'
            }, def.title || key),
            React.createElement('p', {
              key: 'body',
              className: 'text-sm text-[var(--rilo-text-2)] leading-relaxed'
            }, def.body || def.definition || '')
          ])
        )
      : React.createElement('div', {
          className: 'text-center text-[var(--rilo-text-3)] py-12'
        }, '暂无术语说明');

    const sectionContent = {
      conclusion: conclusion || React.createElement('div', {
        className: 'text-sm text-[var(--rilo-text-3)] py-6'
      }, '暂无相关结论'),
      process: process || React.createElement('div', {
        className: 'text-sm text-[var(--rilo-text-3)] py-6'
      }, '当前页暂无额外过程说明，可先查看左侧结果区。'),
      glossary: React.createElement(React.Fragment, null, glossaryDom)
    };

    return React.createElement('div', {
      className: 'fixed inset-0 z-50 flex justify-end',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': title
    }, [
      // 遮罩层
      React.createElement('div', {
        key: 'backdrop',
        className: 'absolute inset-0 bg-black/50 backdrop-blur-sm',
        onClick: handleBackdropClick
      }),

      // 抽屉面板
      React.createElement('div', {
        key: 'drawer',
        className: 'relative w-full max-w-lg bg-[var(--rilo-surface-1)] border-l border-[var(--rilo-border-deep)] h-full shadow-2xl transform transition-transform duration-300 ease-out'
      }, [
        // 抽屉头部
        React.createElement('div', {
          className: 'flex items-center justify-between px-6 py-4 border-b border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-2)]'
        }, [
          React.createElement('div', { key: 'copy', className: 'space-y-3' }, [
            React.createElement('h2', {
              key: 'title',
              className: 'text-lg font-semibold text-[var(--rilo-text-1)]'
            }, title),
            React.createElement('div', {
              key: 'tabs',
              className: 'flex flex-wrap gap-2'
            }, [
              sectionButton('conclusion', '结论'),
              sectionButton('process', '过程'),
              sectionButton('glossary', '术语')
            ])
          ]),
          React.createElement('button', {
            key: 'close',
            className: 'text-[var(--rilo-text-3)] hover:text-[var(--rilo-accent)] text-2xl leading-none',
            onClick: onClose
          }, '×')
        ]),

        // 抽屉内容
        React.createElement('div', {
          className: 'p-6 overflow-y-auto h-[calc(100%-110px)]'
        }, sectionContent[currentSection] || sectionContent.glossary)
      ])
    ]);
  };

  // 注册到全局
  window.RiloUI.DefinitionsDrawer = DefinitionsDrawer;

})();
