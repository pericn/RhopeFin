const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (relativePath) =>
  fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

test('settings header removes design-spec tutorial copy without a dedicated top glossary button', () => {
  const source = read('js/pages/settings-page-v2.js');
  assert.doesNotMatch(source, /Hover 教程：将鼠标移到浅蓝下划线术语上可查看解释/);
  assert.doesNotMatch(source, /按分组填写核心参数，结果页会同步读取当前口径/);
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

test('definitions drawer stacks process and glossary content without tabs', () => {
  const drawer = read('js/components/rilo-ui/drawer.js');
  assert.doesNotMatch(drawer, /结论/);
  assert.doesNotMatch(drawer, /sectionButton/);
  assert.doesNotMatch(drawer, /switchSection/);
  assert.doesNotMatch(drawer, /currentSection/);
  assert.match(drawer, /title = '参考'/);
  assert.match(drawer, /role: 'dialog'/);
  assert.match(drawer, /getGlossaryEntries\(window\.RiloUI\?\.termRegistry \|\| \{\}, glossaryTerms \|\| \{\}\)/);
  assert.match(drawer, /key: 'process'/);
  assert.match(drawer, /key: 'glossary'/);
});

test('app shell keeps left nav and no longer renders the sidebar action row or nav meta copy', () => {
  const app = read('app.js');
  assert.match(app, /className: 'rilo-app-nav'/);
  assert.doesNotMatch(app, /key: 'sidebar-actions'/);
  assert.doesNotMatch(app, /rilo-app-nav-meta/);
});

test('analysis page fallback panels avoid design-spec copy', () => {
  const analysis = read('js/pages/analysis-page.js');
  assert.match(analysis, /暂无结果快照/);
  assert.match(analysis, /暂无敏感度图表/);
  assert.match(analysis, /暂无情景对比/);
  assert.doesNotMatch(analysis, /固定其他条件，展示单一参数扰动后的三档重算结果/);
  assert.doesNotMatch(analysis, /这里会展示下调、基准、上调三档结果/);
});

test('overview page removes design-spec copy from top sections', () => {
  const overview = read('js/pages/overview-page.js');
  assert.doesNotMatch(overview, /首屏展示当前测算口径下的总盘结果、结构图表与情景对比/);
  assert.doesNotMatch(overview, /顶部只保留全局经营读数；单业务指标与结构明细统一下沉到后续区域/);
});

test('inspector has no conclusion tab, no expand/collapse buttons', () => {
  const shell = read('js/components/rilo-ui/shell.js');
  assert.doesNotMatch(shell, /结论/);
  assert.doesNotMatch(shell, /全部展开|全部收起/);
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
