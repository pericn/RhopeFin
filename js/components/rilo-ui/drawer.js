// Definitions Drawer Component
// 右侧滑出式定义抽屉
// 用法：作为全局组件，通过 UI 触发显示/隐藏

(function() {
  'use strict';

  window.RiloUI = window.RiloUI || {};

  const toDrawerGlossaryDomId = (termKey) => `drawer-glossary-${encodeURIComponent(String(termKey || '').trim())}`;

  const ChevronIcon = ({ collapsed }) => React.createElement('svg', {
    width: 14,
    height: 14,
    viewBox: '0 0 16 16',
    fill: 'none',
    'aria-hidden': 'true',
    className: `transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`
  }, React.createElement('path', {
    d: 'M4 6.5L8 10l4-3.5',
    stroke: 'currentColor',
    strokeWidth: '1.6',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  }));

  const DrawerSection = ({ sectionKey, title, collapsed, onToggle, children }) => React.createElement('section', {
    className: 'mb-8'
  }, [
    React.createElement('div', {
      key: `${sectionKey}-header`,
      className: 'mb-3 flex items-center justify-between'
    }, [
      React.createElement('h3', {
        key: `${sectionKey}-title`,
        className: 'text-sm font-semibold tracking-[0.08em] text-[var(--rilo-text-2)]'
      }, title),
      React.createElement('button', {
        key: `${sectionKey}-toggle`,
        type: 'button',
        className: 'inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--rilo-text-3)] transition-colors hover:bg-[var(--rilo-surface-2)] hover:text-[var(--rilo-accent)]',
        onClick: onToggle,
        'aria-label': `${collapsed ? '展开' : '折叠'}${title}`,
        'aria-expanded': !collapsed
      }, React.createElement(ChevronIcon, { collapsed }))
    ]),
    !collapsed && React.createElement('div', {
      key: `${sectionKey}-content`
    }, children)
  ]);

  const DefinitionsDrawer = ({
    isOpen,
    onClose,
    title = '参考',
    process = null,
    glossaryTerms = {},
    selectedTerm = null
  }) => {
    const [collapsedSections, setCollapsedSections] = React.useState({
      process: false,
      glossary: false
    });

    React.useEffect(() => {
      if (!isOpen) return undefined;

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }, [isOpen]);

    React.useEffect(() => {
      if (!isOpen) return;
      setCollapsedSections({
        process: false,
        glossary: false
      });
    }, [isOpen]);

    React.useEffect(() => {
      if (!isOpen) return undefined;

      const handleEsc = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) onClose();
    };

    const entries = window.RiloUI?.getGlossaryEntries
      ? window.RiloUI.getGlossaryEntries(window.RiloUI?.termRegistry || {}, glossaryTerms || {})
      : Object.entries(Object.assign({}, window.RiloUI?.termRegistry || {}, glossaryTerms || {}));

    React.useEffect(() => {
      if (!isOpen || !selectedTerm) return;

      const el = document.getElementById(toDrawerGlossaryDomId(selectedTerm));
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ block: 'nearest' });
      }
    }, [selectedTerm, isOpen]);

    if (!isOpen) return null;

    const toggleSection = (sectionKey) => {
      setCollapsedSections((prev) => ({
        ...prev,
        [sectionKey]: !prev[sectionKey]
      }));
    };

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

    const processDom = process || React.createElement('div', {
      className: 'text-sm text-[var(--rilo-text-3)] py-6'
    }, '暂无相关说明');

    return React.createElement('div', {
      className: 'fixed inset-0 z-50 flex justify-end',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': title
    }, [
      React.createElement('div', {
        key: 'backdrop',
        className: 'absolute inset-0 bg-black/50 backdrop-blur-sm',
        onClick: handleBackdropClick
      }),
      React.createElement('div', {
        key: 'drawer',
        className: 'relative w-full max-w-lg bg-[var(--rilo-surface-1)] border-l border-[var(--rilo-border-deep)] h-full shadow-2xl transform transition-transform duration-300 ease-out'
      }, [
        React.createElement('div', {
          className: 'flex items-center justify-between px-6 py-4 border-b border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-2)]'
        }, [
          React.createElement('div', { key: 'copy' }, [
            React.createElement('h2', {
              key: 'title',
              className: 'text-lg font-semibold text-[var(--rilo-text-1)]'
            }, title)
          ]),
          React.createElement('button', {
            key: 'close',
            className: 'text-[var(--rilo-text-3)] hover:text-[var(--rilo-accent)] text-2xl leading-none',
            onClick: onClose
          }, '×')
        ]),
        React.createElement('div', {
          className: 'p-6 overflow-y-auto h-[calc(100%-110px)]'
        }, [
          React.createElement(DrawerSection, {
            key: 'process',
            sectionKey: 'process',
            title: '过程',
            collapsed: collapsedSections.process,
            onToggle: () => toggleSection('process')
          }, processDom),
          React.createElement(DrawerSection, {
            key: 'glossary',
            sectionKey: 'glossary',
            title: '术语',
            collapsed: collapsedSections.glossary,
            onToggle: () => toggleSection('glossary')
          }, glossaryDom)
        ])
      ])
    ]);
  };

  window.RiloUI.DefinitionsDrawer = DefinitionsDrawer;
})();
