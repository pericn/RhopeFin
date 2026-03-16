// Shared Shell UI Components — TwoPaneLayout, InspectorPanel, Term, etc.
// 统一布局与共享壳层组件
(function() {
  'use strict';

  // 确保 RiloUI 命名空间存在
  window.RiloUI = window.RiloUI || {};

  const InspectorContext = React.createContext(null);
  const useInspector = () => React.useContext(InspectorContext);

  const Term = ({ termKey, children }) => {
    const api = useInspector();
    if (!api) return children;
    const term = window.RiloUI?.getTermDefinition ? window.RiloUI.getTermDefinition(termKey) : null;
    return React.createElement('span', {
      className: 'underline decoration-dotted cursor-help text-[var(--rilo-accent)] hover:text-[var(--rilo-accent-500)]',
      onMouseEnter: () => {
        if (term) {
          api.setActiveSection('glossary');
          api.setSelectedTerm(termKey);
        }
      }
    }, children);
  };

  const SectionButton = ({ active, onClick, children }) =>
    React.createElement('button', {
      onClick,
      className: `px-3 py-1 rounded-full text-sm font-medium transition-colors ${active ? 'bg-[var(--rilo-accent)] text-white' : 'bg-[var(--rilo-surface-2)] text-[var(--rilo-text-2)] hover:bg-[var(--rilo-surface-1)] hover:text-[var(--rilo-text-1)]'}`
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
      const entries = Object.entries(glossaryTerms);
      if (entries.length === 0) return glossary || null;

      return React.createElement('div', { className: 'space-y-3' }, entries.map(([key, def]) =>
        React.createElement('div', {
          key,
          id: `glossary-${key}`,
          className: `rounded-xl border p-3 ${selectedTerm === key ? 'border-[var(--rilo-accent)] bg-[var(--rilo-surface-2)]' : 'border-[var(--rilo-border-deep)] bg-[var(--rilo-surface-1)]'}`
        }, [
          React.createElement('div', { key: 't', className: 'font-semibold text-[var(--rilo-text-1)]' }, def.title || key),
          React.createElement('div', { key: 'b', className: 'text-sm text-[var(--rilo-text-2)] mt-1 leading-relaxed' }, def.body || '')
        ])
      ));
    };

    React.useEffect(() => {
      if (!selectedTerm) return;
      const el = document.getElementById(`glossary-${selectedTerm}`);
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ block: 'nearest' });
      }
    }, [selectedTerm, activeSection]);

    const Section = ({ id, label, children }) =>
      React.createElement('div', { className: 'rounded-2xl bg-[var(--rilo-surface-1)] border border-[var(--rilo-border-deep)] overflow-hidden' }, [
        React.createElement('div', {
          key: 'h',
          className: 'px-4 py-3 flex items-center justify-between bg-[var(--rilo-surface-2)]'
        }, [
          React.createElement('div', { key: 'l', className: 'font-semibold text-[var(--rilo-text-1)]' }, label),
          React.createElement('button', {
            key: 'c',
            className: 'text-xs text-[var(--rilo-text-3)] hover:text-[var(--rilo-accent)]',
            onClick: () => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))
          }, collapsed[id] ? '展开' : '收起')
        ]),
        !collapsed[id] && React.createElement('div', { key: 'b', className: 'px-4 pb-4 text-[var(--rilo-text-2)]' }, children)
      ]);

    window.RiloUI.InspectorPanel = InspectorPanel;

    return React.createElement('div', { className: 'sticky top-4 space-y-3 bg-[var(--rilo-surface-1)] p-4 rounded-2xl border border-[var(--rilo-border-deep)]' }, [
      React.createElement('div', { key: 'title', className: 'px-1' }, [
        React.createElement('div', { key: 't', className: 'text-sm font-semibold text-[var(--rilo-text-1)]' }, title),
        React.createElement('div', { key: 'tabs', className: 'mt-2 flex gap-2 flex-wrap' }, [
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
    const [activeSection, setActiveSection] = React.useState('conclusion');
    const [selectedTerm, setSelectedTerm] = React.useState(null);

    const api = React.useMemo(() => ({
      activeSection,
      setActiveSection,
      selectedTerm,
      setSelectedTerm
    }), [activeSection, selectedTerm]);

    window.RiloUI.TwoPaneLayout = TwoPaneLayout;
    window.RiloUI.useInspector = useInspector;
    window.RiloUI.InspectorContext = InspectorContext;
    window.RiloUI.Term = Term;

    return React.createElement(InspectorContext.Provider, { value: api },
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-12 gap-6' }, [
        React.createElement('div', { key: 'left', className: 'lg:col-span-8 space-y-6' }, [
          leftTitle && React.createElement('div', { key: 'lt', className: 'px-1' }, leftTitle),
          left
        ]),
        React.createElement('div', { key: 'right', className: 'lg:col-span-4' },
          React.createElement(InspectorPanel, {
            title: inspectorTitle,
            conclusion,
            process,
            glossary,
            glossaryTerms
          })
        )
      ])
    );
  };

  // 简单的卡片容器组件（用于统一卡片样式）
  const Card = ({ title, children, className = "", collapsible = false }) => {
    const [collapsed, setCollapsed] = React.useState(false);
    return React.createElement('div', {
      className: `rounded-2xl bg-[var(--rilo-surface-1)] border border-[var(--rilo-border-deep)] shadow-sm overflow-hidden ${collapsible ? 'transition-all' : ''} ${className}`
    }, [
      title && React.createElement('div', {
        key: 'header',
        className: 'px-4 py-3 flex items-center justify-between border-b border-[var(--rilo-border-deep)]'
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