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
    const triggerRef = React.useRef(null);

    // Self-healing: force re-render if term wasn't found on first render
    // (first render may have happened before termRegistry was populated)
    const [lookupKey, setLookupKey] = React.useState(0);

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
    }, [api?.glossaryTerms, termKey, lookupKey]);

    // If term is still null after mount, try again once termRegistry becomes available
    React.useEffect(() => {
      if (term === null && lookupKey === 0) {
        const timer = setTimeout(() => setLookupKey(k => k + 1), 100);
        return () => clearTimeout(timer);
      }
    }, [term, lookupKey]);

    const [open, setOpen] = React.useState(false);
    const [popoverStyle, setPopoverStyle] = React.useState(null);
    const popoverId = React.useMemo(
      () => `term-popover-${encodeURIComponent(String(termKey || '').trim())}`,
      [termKey]
    );

    // Always render the underlined trigger, even if term data isn't loaded yet.
    // When term is null, the popover shows a loading state and openGlossary still works via termKey.
    const effectiveTerm = term || { title: termKey, body: '' };

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

    const updatePopoverStyle = React.useCallback(() => {
      if (!triggerRef.current || typeof window === 'undefined') return;
      const rect = triggerRef.current.getBoundingClientRect();
      const width = Math.min(320, Math.max(240, window.innerWidth - 24));
      const left = Math.min(Math.max(12, rect.left), Math.max(12, window.innerWidth - width - 12));
      const top = Math.min(window.innerHeight - 20, rect.bottom + 10);
      setPopoverStyle({ left: `${left}px`, top: `${top}px`, width: `${width}px` });
    }, []);

    React.useEffect(() => {
      if (!open) return undefined;
      updatePopoverStyle();
      window.addEventListener('resize', updatePopoverStyle);
      window.addEventListener('scroll', updatePopoverStyle, true);
      return () => {
        window.removeEventListener('resize', updatePopoverStyle);
        window.removeEventListener('scroll', updatePopoverStyle, true);
      };
    }, [open, updatePopoverStyle]);

    const popoverContent = open && React.createElement('div', {
      key: 'popover',
      id: popoverId,
      className: 'fixed z-[1200] rounded-[var(--radius-lg)] border border-[var(--rilo-border-strong)] bg-white p-3.5 text-left shadow-[0_18px_42px_rgba(34,31,26,0.18)] backdrop-blur-md',
      style: popoverStyle || undefined
    }, [
      React.createElement('div', {
        key: 'title',
        className: 'text-sm font-semibold text-[var(--rilo-text-1)]'
      }, effectiveTerm.title),
      React.createElement('div', {
        key: 'body',
        className: 'mt-1 text-xs leading-5 text-[var(--rilo-text-2)]'
      }, effectiveTerm.body || (term ? '' : '术语信息加载中')),
      React.createElement('button', {
        key: 'more',
        type: 'button',
        className: 'mt-3 text-xs font-medium text-[var(--rilo-accent)] hover:text-[var(--rilo-accent-500)]',
        onClick: openGlossary
      }, '查看更多')
    ]);

    return React.createElement('span', {
      className: 'relative inline-flex items-center',
      onMouseEnter: () => setOpen(true),
      onMouseLeave: () => setOpen(false),
      onFocus: () => setOpen(true),
      onBlur: closeIfLeaving
    }, [
      React.createElement('span', {
        key: 'trigger',
        ref: triggerRef,
        role: 'button',
        tabIndex: 0,
        'aria-expanded': open,
        'aria-controls': popoverId,
        className: 'underline decoration-dashed decoration-[var(--rilo-accent)]/20 underline-offset-8 cursor-help text-[var(--rilo-accent)] hover:text-[var(--rilo-accent-500)] focus:outline-none focus:ring-2 focus:ring-[var(--rilo-accent)]/20 rounded-sm transition-colors',
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
      popoverContent && ReactDOM.createPortal(popoverContent, document.body)
    ]);
  };

  const SectionButton = ({ active, onClick, children }) =>
    React.createElement('button', {
      onClick,
      className: `min-h-[36px] px-3.5 py-1.5 rounded-[14px] text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--rilo-accent)]/15 ${active ? 'rilo-btn-strong' : 'rilo-btn-soft hover:-translate-y-px text-[var(--rilo-text-2)] hover:text-[var(--rilo-text-1)]'}`
    }, children);

  const InspectorPanel = ({ title = '参考', process, glossary, glossaryTerms = {} }) => {
    const { activeSection, setActiveSection, selectedTerm } = useInspector();
    const glossaryEntries = React.useMemo(() => (
      window.RiloUI?.getGlossaryEntries
        ? window.RiloUI.getGlossaryEntries(window.RiloUI?.termRegistry || {}, glossaryTerms || {})
        : Object.entries(Object.assign({}, window.RiloUI?.termRegistry || {}, glossaryTerms || {}))
    ), [glossaryTerms]);

    const fallbackProcess = React.createElement('div', {
      className: 'text-sm text-[var(--rilo-text-3)] py-1'
    }, '暂无相关说明');

    React.useEffect(() => {
      if (selectedTerm && activeSection !== 'glossary') {
        setActiveSection('glossary');
      }
    }, [activeSection, selectedTerm, setActiveSection]);

    const glossaryContent = React.useMemo(() => {
      if (glossaryEntries.length === 0) {
        return glossary || React.createElement('div', {
          className: 'text-sm text-[var(--rilo-text-3)] py-1'
        }, '暂无术语说明。');
      }

      // BUGFIX-3: 术语区内容改为记忆化渲染，减少 Inspector 展开时重复创建大量节点造成的卡顿。
      return React.createElement('div', { className: 'space-y-3' }, glossaryEntries.map(([key, def]) =>
        React.createElement('div', {
          key,
          id: toGlossaryDomId(key),
          className: `rounded-[var(--radius-md)] border p-3.5 shadow-[var(--rilo-shadow-soft)] ${selectedTerm === key ? 'border-[var(--rilo-accent)] bg-[var(--rilo-accent-50)]' : 'border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)]'}`
        }, [
          React.createElement('div', { key: 't', className: 'font-semibold text-[var(--rilo-text-1)]' }, def.title || key),
          React.createElement('div', { key: 'b', className: 'text-sm text-[var(--rilo-text-2)] mt-1 leading-relaxed' }, def.body || def.definition || '')
        ])
      ));
    }, [glossary, glossaryEntries, selectedTerm]);

    React.useEffect(() => {
      if (!selectedTerm) return;
      const el = document.getElementById(toGlossaryDomId(selectedTerm));
      if (el && typeof el.scrollIntoView === 'function') {
        const frameId = window.requestAnimationFrame(() => {
          el.scrollIntoView({ block: 'nearest' });
        });
        return () => window.cancelAnimationFrame(frameId);
      }
      return undefined;
    }, [selectedTerm, activeSection]);

    window.RiloUI.InspectorPanel = InspectorPanel;

    const sectionContent = activeSection === 'glossary'
      ? glossaryContent
      : process || fallbackProcess;

    return React.createElement('div', { className: 'rilo-inspector-panel' }, [
      React.createElement('div', { key: 'title', className: 'rilo-inspector-header' }, [
        React.createElement('div', { key: 'kicker', className: 'rilo-inspector-kicker' }, '参考'),
        React.createElement('div', { key: 't', className: 'text-sm font-semibold text-[var(--rilo-text-1)]' }, title),
        React.createElement('div', { key: 'tabs', className: 'rilo-inspector-tabs' }, [
          React.createElement(SectionButton, { key: 'p', active: activeSection === 'process', onClick: () => setActiveSection('process') }, '过程'),
          React.createElement(SectionButton, { key: 'g', active: activeSection === 'glossary', onClick: () => setActiveSection('glossary') }, '术语')
        ])
      ]),
      React.createElement('div', { key: 'section-body', className: 'rilo-inspector-section-body' }, sectionContent)
    ]);
  };

  const TwoPaneLayout = ({ leftTitle = null, left, inspectorTitle, conclusion, process, glossary, glossaryTerms }) => {
    const [activeSection, setActiveSection] = React.useState('process');
    const [selectedTerm, setSelectedTerm] = React.useState(null);
    const [inspectorOpen, setInspectorOpen] = React.useState(true);
    const mergedGlossaryTerms = React.useMemo(
      () => Object.assign({}, glossaryTerms || {}),
      [glossaryTerms]
    );

    const api = React.useMemo(() => ({
      activeSection,
      setActiveSection,
      selectedTerm,
      setSelectedTerm,
      glossaryTerms: mergedGlossaryTerms,
      inspectorOpen,
      setInspectorOpen,
      toggleInspector: () => setInspectorOpen((open) => !open)
    }), [activeSection, inspectorOpen, mergedGlossaryTerms, selectedTerm]);

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

    React.useEffect(() => {
      window.RiloUI.activeInspectorApi = api;

      return () => {
        if (window.RiloUI?.activeInspectorApi === api) {
          delete window.RiloUI.activeInspectorApi;
        }
      };
    }, [api]);

    const shellGridClassName = `rilo-shell-grid ${inspectorOpen ? 'rilo-shell-grid--with-inspector' : 'rilo-shell-grid--expanded'}`;

    return React.createElement(InspectorContext.Provider, { value: api },
      React.createElement('div', { className: shellGridClassName }, [
        React.createElement('div', { key: 'left', className: 'rilo-shell-main' }, [
          React.createElement('div', { key: 'lt', className: 'flex items-center justify-between px-1' }, [
            leftTitle && React.createElement('span', { key: 'title' }, leftTitle)
          ]),
          left
        ]),
        inspectorOpen && React.createElement('aside', { key: 'side', className: 'rilo-shell-side' },
          React.createElement(InspectorPanel, {
            title: inspectorTitle,
            process,
            glossary,
            glossaryTerms: mergedGlossaryTerms
          })
        )
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
    return React.createElement(Card, { title, className: `border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)] ${className}`.trim() }, children);
  };
  window.RiloUI.ChartCard = ChartCard;

})();
