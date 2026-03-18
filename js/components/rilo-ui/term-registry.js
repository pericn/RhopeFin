// Compatibility shim for the planned rilo-ui term registry path.
// Runtime registry remains sourced from js/shared/term-registry.js.
(function() {
  'use strict';

  window.RiloUI = window.RiloUI || {};
  window.RiloUI.termRegistry = window.RiloUI.termRegistry || {};
  window.RiloUI.Term = window.RiloUI.Term || function TermPlaceholder({ children }) {
    return children;
  };
})();
