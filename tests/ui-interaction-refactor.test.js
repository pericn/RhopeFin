const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (relativePath) =>
  fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

test('settings header exposes hover tutorial and unified glossary entry copy', () => {
  const source = read('js/pages/settings-page-v2.js');
  assert.match(source, /Hover 教程：将鼠标移到浅蓝下划线术语上可查看解释/);
  assert.match(source, /'术语解释'/);
});

test('overview and analysis expose top-level glossary entry buttons', () => {
  const overview = read('js/pages/overview-page.js');
  const analysis = read('js/pages/analysis-page.js');

  assert.match(overview, /window\.RiloUI\?\.openDefinitionsDrawer\?\.\(null, 'glossary'\)/);
  assert.match(analysis, /window\.RiloUI\?\.openDefinitionsDrawer\?\.\(null, 'glossary'\)/);
  assert.match(overview, /'术语解释'/);
  assert.match(analysis, /'术语解释'/);
});

test('overview keeps an on-page folded detailed-calculation entry', () => {
  const overview = read('js/pages/overview-page.js');
  assert.match(overview, /高级：详细计算过程/);
  assert.match(overview, /h\(DetailedCalculationDisplay, \{ calculations, currency \}\)/);
});

test('definitions drawer keeps the three-layer information architecture', () => {
  const drawer = read('js/components/rilo-ui/drawer.js');
  assert.match(drawer, /sectionButton\('conclusion', '结论'\)/);
  assert.match(drawer, /sectionButton\('process', '过程'\)/);
  assert.match(drawer, /sectionButton\('glossary', '术语'\)/);
});
