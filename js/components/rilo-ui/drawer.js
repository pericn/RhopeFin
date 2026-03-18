// Definitions Drawer Component
// 右侧滑出式定义说明抽屉
// 用法：作为全局组件，通过 UI 触发显示/隐藏

(function() {
  'use strict';

  window.RiloUI = window.RiloUI || {};

  const toDrawerGlossaryDomId = (termKey) => `drawer-glossary-${encodeURIComponent(String(termKey || '').trim())}`;

  // 抽屉容器组件
  const DefinitionsDrawer = ({ isOpen, onClose, glossaryTerms = {}, selectedTerm = null }) => {
    if (!isOpen) return null;

    // ESC 键关闭
    React.useEffect(() => {
      const handleEsc = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // 点击遮罩关闭
    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) onClose();
    };

    const entries = window.RiloUI?.getGlossaryEntries
      ? window.RiloUI.getGlossaryEntries(glossaryTerms)
      : Object.entries(glossaryTerms);

    React.useEffect(() => {
      if (!selectedTerm) return;

      const el = document.getElementById(toDrawerGlossaryDomId(selectedTerm));
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ block: 'nearest' });
      }
    }, [selectedTerm]);

    return React.createElement('div', {
      className: 'fixed inset-0 z-50 flex justify-end'
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
          React.createElement('h2', {
            className: 'text-lg font-semibold text-[var(--rilo-text-1)]'
          }, '术语说明'),
          React.createElement('button', {
            className: 'text-[var(--rilo-text-3)] hover:text-[var(--rilo-accent)] text-2xl leading-none',
            onClick: onClose
          }, '×')
        ]),

        // 抽屉内容
        React.createElement('div', {
          className: 'p-6 overflow-y-auto h-[calc(100%-80px)]'
        }, entries.length > 0 ? entries.map(([key, def]) =>
          React.createElement('div', {
            key,
            id: toDrawerGlossaryDomId(key),
            className: `mb-6 rounded-2xl pb-6 border-b border-[var(--rilo-border-deep)] last:border-0 ${selectedTerm === key ? 'bg-[var(--rilo-surface-2)] px-3 pt-3' : ''}`
          }, [
            React.createElement('h3', {
              className: 'text-base font-semibold text-[var(--rilo-accent)] mb-2'
            }, def.title || key),
            React.createElement('p', {
              className: 'text-sm text-[var(--rilo-text-2)] leading-relaxed'
            }, def.body || def.definition || '')
          ])
        ) : React.createElement('div', {
          className: 'text-center text-[var(--rilo-text-3)] py-12'
        }, '暂无术语说明'))
      ])
    ]);
  };

  // 注册到全局
  window.RiloUI.DefinitionsDrawer = DefinitionsDrawer;

})();
