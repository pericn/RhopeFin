const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (relativePath) =>
  fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

test('settings header exposes hover tutorial without a dedicated top glossary button', () => {
  const source = read('js/pages/settings-page-v2.js');
  assert.match(source, /Hover 教程：将鼠标移到浅蓝下划线术语上可查看解释/);
  assert.doesNotMatch(source, /key: 'terms-btn'/);
});

test('analysis header removes the dedicated glossary entry button', () => {
  const analysis = read('js/pages/analysis-page.js');

  assert.doesNotMatch(analysis, /key: 'glossary-entry'/);
  assert.doesNotMatch(analysis, /openDefinitionsDrawer\?\.\(null, 'glossary'\)/);
});

test('overview keeps an on-page folded detailed-calculation entry', () => {
  const overview = read('js/pages/overview-page.js');
  assert.match(overview, /高级：详细计算过程/);
  assert.match(overview, /h\(DetailedCalculationDisplay, \{ calculations, currency: resolvedCurrency \}\)/);
});

test('definitions drawer keeps the three-layer information architecture', () => {
  const drawer = read('js/components/rilo-ui/drawer.js');
  assert.match(drawer, /sectionButton\('conclusion', '结论'\)/);
  assert.match(drawer, /sectionButton\('process', '过程'\)/);
  assert.match(drawer, /sectionButton\('glossary', '术语'\)/);
  assert.match(drawer, /role: 'dialog'/);
  assert.match(drawer, /getGlossaryEntries\(window\.RiloUI\?\.termRegistry \|\| \{\}, glossaryTerms \|\| \{\}\)/);
});

test('app shell keeps left nav and no longer renders the sidebar action row or nav meta copy', () => {
  const app = read('app.js');
  assert.match(app, /className: 'rilo-app-nav'/);
  assert.doesNotMatch(app, /key: 'sidebar-actions'/);
  assert.doesNotMatch(app, /rilo-app-nav-meta/);
});

test('analysis page uses explicit fallback panels instead of blank sections', () => {
  const analysis = read('js/pages/analysis-page.js');
  assert.match(analysis, /结果快照待生成/);
  assert.match(analysis, /敏感度图表待生成/);
  assert.match(analysis, /情景对比待生成/);
});

test('visual acceptance scaffold keeps fixed pages and viewports', () => {
  const script = read('scripts/visual_acceptance.py');
  assert.match(script, /"name": "desktop"/);
  assert.match(script, /"name": "mobile"/);
  assert.match(script, /"name": "overview"/);
  assert.match(script, /"name": "settings"/);
  assert.match(script, /"name": "analysis"/);
  assert.match(script, /"name": "analysis-glossary"/);
  assert.match(script, /console\.json/);
});
