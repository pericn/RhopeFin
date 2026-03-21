// Shared Shell UI Components — TwoPaneLayout, InspectorPanel, Term, etc.
// 统一布局与共享壳层组件
(function() {
  'use strict';

  // 确保 RiloUI 命名空间存在
  window.RiloUI = window.RiloUI || {};

  const toGlossaryDomId = (termKey) => `glossary-${encodeURIComponent(String(termKey || '').trim())}`;

  const InspectorContext = React.createContext(null);
  const useInspector = () => React.useContext(InspectorContext);

  const Term = ({ termKey, children }) => {
    const api = useInspector();
    const term = React.useMemo(() => {
      if (!termKey) return null;

      const mergedTerms = Object.assign({}, window.RiloUI?.termRegistry || {}, api?.glossaryTerms || {});
      const rawTerm = mergedTerms[termKey];

      if (window.RiloUI?.normalizeTermDefinition) {
        return window.RiloUI.normalizeTermDefinition(rawTerm, termKey);
      }

      if (!rawTerm) return null;

      return {
        key: termKey,
        title: rawTerm.title || termKey,
        body: rawTerm.body || rawTerm.definition || '',
        definition: rawTerm.definition || rawTerm.body || ''
      };
    }, [api?.glossaryTerms, termKey]);
    const [open, setOpen] = React.useState(false);
    const popoverId = React.useMemo(
      () => `term-popover-${encodeURIComponent(String(termKey || '').trim())}`,
      [termKey]
    );

    if (!term) return children;

    const closeIfLeaving = (event) => {
      if (!event?.currentTarget?.contains(event?.relatedTarget)) {
        setOpen(false);
      }
    };

    const openGlossary = () => {
      if (window.RiloUI?.inspectorMode === 'drawer' && window.RiloUI?.openDefinitionsDrawer) {
        window.RiloUI.openDefinitionsDrawer(termKey, 'glossary');
        setOpen(false);
        return;
      }

      if (api?.setActiveSection && api?.setSelectedTerm) {
        api.setActiveSection('glossary');
        api.setSelectedTerm(termKey);
        setOpen(false);
        return;
      }

      if (window.RiloUI?.openDefinitionsDrawer) {
        window.RiloUI.openDefinitionsDrawer(termKey);
        setOpen(false);
      }
    };

    return React.createElement('span', {
      className: 'relative inline-flex items-center',
      onMouseEnter: () => setOpen(true),
      onMouseLeave: () => setOpen(false),
      onFocus: () => setOpen(true),
      onBlur: closeIfLeaving
    }, [
      React.createElement('span', {
        key: 'trigger',
        role: 'button',
        tabIndex: 0,
        'aria-expanded': open,
        'aria-controls': popoverId,
        className: 'underline decoration-[var(--rilo-accent)]/45 underline-offset-4 cursor-help text-[var(--rilo-accent)] hover:text-[var(--rilo-accent-500)] focus:outline-none focus:ring-2 focus:ring-[var(--rilo-accent)]/20 rounded-sm transition-colors',
        onClick: () => setOpen((prev) => !prev),
        onKeyDown: (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen((prev) => !prev);
          }

          if (event.key === 'Escape') {
            setOpen(false);
          }
        }
      }, children),
      open && React.createElement('div', {
        key: 'popover',
        id: popoverId,
        className: 'absolute left-0 top-full z-30 mt-2 w-72 rounded-[var(--radius-lg)] border border-[var(--rilo-border-strong)] bg-[var(--rilo-surface-1)] p-3.5 shadow-[var(--rilo-shadow-card)] backdrop-blur-sm'
      }, [
        React.createElement('div', {
          key: 'title',
          className: 'text-sm font-semibold text-[var(--rilo-text-1)]'
        }, term.title),
        React.createElement('div', {
          key: 'body',
          className: 'mt-1 text-xs leading-5 text-[var(--rilo-text-2)]'
        }, term.body),
        React.createElement('button', {
          key: 'more',
          type: 'button',
          className: 'mt-3 text-xs font-medium text-[var(--rilo-accent)] hover:text-[var(--rilo-accent-500)]',
          onClick: openGlossary
        }, '查看更多')
      ])
    ]);
  };

  const SectionButton = ({ active, onClick, children }) =>
    React.createElement('button', {
      onClick,
      className: `min-h-[36px] px-3.5 py-1.5 rounded-[14px] text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--rilo-accent)]/15 ${active ? 'rilo-btn-strong' : 'rilo-btn-soft hover:-translate-y-px text-[var(--rilo-text-2)] hover:text-[var(--rilo-text-1)]'}`
    }, children);

  const InspectorPanel = ({ title = 'Inspector', conclusion, process, glossary, glossaryTerms = {} }) => {
    const { activeSection, setActiveSection, selectedTerm } = useInspector();
    const [collapsed, setCollapsed] = React.useState({ conclusion: false, process: true, glossary: true });

    React.useEffect(() => {
      setCollapsed(prev => ({ ...prev, [activeSection]: false }));
    }, [activeSection]);

    React.useEffect(() => {
      if (selectedTerm) setActiveSection('glossary');
    }, [selectedTerm]);

    const renderGlossary = () => {
      const entries = window.RiloUI?.getGlossaryEntries
        ? window.RiloUI.getGlossaryEntries(window.RiloUI?.termRegistry || {}, glossaryTerms || {})
        : Object.entries(Object.assign({}, window.RiloUI?.termRegistry || {}, glossaryTerms || {}));
      if (entries.length === 0) return glossary || null;

      return React.createElement('div', { className: 'space-y-3' }, entries.map(([key, def]) =>
        React.createElement('div', {
          key,
          id: toGlossaryDomId(key),
          className: `rounded-[var(--radius-md)] border p-3.5 shadow-[var(--rilo-shadow-soft)] ${selectedTerm === key ? 'border-[var(--rilo-accent)] bg-[var(--rilo-accent-50)]' : 'border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)]'}`
        }, [
          React.createElement('div', { key: 't', className: 'font-semibold text-[var(--rilo-text-1)]' }, def.title || key),
          React.createElement('div', { key: 'b', className: 'text-sm text-[var(--rilo-text-2)] mt-1 leading-relaxed' }, def.body || def.definition || '')
        ])
      ));
    };

    React.useEffect(() => {
      if (!selectedTerm) return;
      const el = document.getElementById(toGlossaryDomId(selectedTerm));
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ block: 'nearest' });
      }
    }, [selectedTerm, activeSection]);

    const Section = ({ id, label, children }) =>
      React.createElement('div', { className: 'rilo-inspector-section' }, [
        React.createElement('div', {
          key: 'h',
          className: 'rilo-inspector-section-header'
        }, [
          React.createElement('div', { key: 'l', className: 'font-semibold text-[var(--rilo-text-1)]' }, label),
          React.createElement('button', {
            key: 'c',
            className: 'text-xs text-[var(--rilo-text-3)] hover:text-[var(--rilo-accent)]',
            onClick: () => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))
          }, collapsed[id] ? '展开' : '收起')
        ]),
        !collapsed[id] && React.createElement('div', { key: 'b', className: 'rilo-inspector-section-body' }, children)
      ]);

    window.RiloUI.InspectorPanel = InspectorPanel;

    return React.createElement('div', { className: 'rilo-inspector-panel' }, [
      React.createElement('div', { key: 'title', className: 'rilo-inspector-header' }, [
        React.createElement('div', { key: 'kicker', className: 'rilo-inspector-kicker' }, 'Inspector'),
        React.createElement('div', { key: 't', className: 'text-sm font-semibold text-[var(--rilo-text-1)]' }, title),
        React.createElement('div', { key: 'tabs', className: 'rilo-inspector-tabs' }, [
          React.createElement(SectionButton, { key: 'c', active: activeSection === 'conclusion', onClick: () => setActiveSection('conclusion') }, '结论'),
          React.createElement(SectionButton, { key: 'p', active: activeSection === 'process', onClick: () => setActiveSection('process') }, '过程'),
          React.createElement(SectionButton, { key: 'g', active: activeSection === 'glossary', onClick: () => setActiveSection('glossary') }, '术语')
        ])
      ]),

      React.createElement(Section, { key: 'sec-c', id: 'conclusion', label: '结论' }, conclusion),
      React.createElement(Section, { key: 'sec-p', id: 'process', label: '过程' }, process),
      React.createElement(Section, { key: 'sec-g', id: 'glossary', label: '术语' }, renderGlossary())
    ]);
  };

  const TwoPaneLayout = ({ leftTitle = null, left, inspectorTitle, conclusion, process, glossary, glossaryTerms }) => {
    const api = React.useMemo(() => ({
      glossaryTerms: Object.assign({}, glossaryTerms || {})
    }), [glossaryTerms]);

    window.RiloUI.TwoPaneLayout = TwoPaneLayout;
    window.RiloUI.useInspector = useInspector;
    window.RiloUI.InspectorContext = InspectorContext;
    window.RiloUI.Term = Term;

    React.useEffect(() => {
      if (typeof window.RiloUI?.setDefinitionsDrawerContent === 'function') {
        window.RiloUI.setDefinitionsDrawerContent({
          title: inspectorTitle,
          conclusion,
          process,
          glossary,
          glossaryTerms: Object.assign({}, glossaryTerms || {})
        });
      }
    }, [inspectorTitle, conclusion, process, glossary, glossaryTerms]);

    return React.createElement(InspectorContext.Provider, { value: api },
      React.createElement('div', { className: 'rilo-shell-grid' }, [
        React.createElement('div', { key: 'left', className: 'rilo-shell-main' }, [
          leftTitle && React.createElement('div', { key: 'lt', className: 'px-1' }, leftTitle),
          left
        ])
      ])
    );
  };

  // 注册共享组件到全局（避免依赖组件渲染时才挂载）
  window.RiloUI.InspectorPanel = InspectorPanel;
  window.RiloUI.TwoPaneLayout = TwoPaneLayout;
  window.RiloUI.useInspector = useInspector;
  window.RiloUI.InspectorContext = InspectorContext;
  window.RiloUI.Term = Term;

  // 简单的卡片容器组件（用于统一卡片样式）
  const Card = ({ title, children, className = "", collapsible = false }) => {
    const [collapsed, setCollapsed] = React.useState(false);
    return React.createElement('div', {
      className: `rilo-card rilo-card-hierarchy-mid overflow-hidden ${collapsible ? 'transition-all' : ''} ${className}`
    }, [
      title && React.createElement('div', {
        key: 'header',
        className: 'px-4 py-3.5 flex items-center justify-between border-b border-[var(--line)] bg-[rgba(244,235,223,0.72)]'
      }, [
        React.createElement('h3', { key: 'title', className: 'font-semibold text-[var(--rilo-text-1)]' }, title),
        collapsible && React.createElement('button', {
          key: 'toggle',
          className: 'text-xs text-[var(--rilo-text-3)] hover:text-[var(--rilo-accent)]',
          onClick: () => setCollapsed(!collapsed)
        }, collapsed ? '展开' : '收起')
      ]),
      (!collapsed || !title) && React.createElement('div', { key: 'content', className: 'p-4 text-[var(--rilo-text-2)]' }, children)
    ]);
  };
  window.RiloUI.Card = Card;

  // 图表卡片组件（统一图表容器）
  const ChartCard = ({ title, children, className = "" }) => {
    return React.createElement(Card, { title, className });
  };
  window.RiloUI.ChartCard = ChartCard;

})();
