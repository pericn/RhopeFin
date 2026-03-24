const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PREVIEW_URL = process.env.PREVIEW_URL || 'http://127.0.0.1:4173/index.html';
const OUT_DIR = path.resolve(ROOT, process.env.VISUAL_OUT_DIR || 'artifacts/visual/current');
const LOG_DIR = path.join(OUT_DIR, 'logs');
const PAGE_ORDER = [
  { key: 'overview', label: '项目概况' },
  { key: 'settings', label: '经营设置' },
  { key: 'analysis', label: '敏感度分析' }
];
const VIEWPORTS = [
  { key: 'desktop', width: 1440, height: 1600, isMobile: false, deviceScaleFactor: 1 },
  { key: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
];

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const sanitize = (value) => String(value || '').replace(/[^a-z0-9-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();

const waitForAppReady = async (page) => {
  await page.goto(PREVIEW_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.rilo-app-shell');
  await page.waitForTimeout(400);
};

const openPage = async (page, pageLabel) => {
  await page.getByRole('button', { name: new RegExp(pageLabel) }).click();
  await page.waitForTimeout(300);
};

const captureGlossaryDrawer = async (page, viewportKey) => {
  await page.evaluate(() => {
    window.RiloUI?.openDefinitionsDrawer?.('netMargin', 'glossary');
  });
  await page.waitForSelector('.fixed.inset-0.z-50');
  const drawerPath = path.join(OUT_DIR, viewportKey, 'glossary-drawer.png');
  await page.screenshot({ path: drawerPath, fullPage: true });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  return drawerPath;
};

const loadPlaywright = () => {
  const candidates = [
    'playwright',
    '/opt/homebrew/lib/python3.14/site-packages/playwright/driver/package/index.js'
  ];

  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (error) {
      if (candidate === candidates[candidates.length - 1]) {
        throw error;
      }
    }
  }

  throw new Error('Playwright runtime not found');
};

const main = async () => {
  const { chromium } = loadPlaywright();
  ensureDir(OUT_DIR);
  ensureDir(LOG_DIR);

  const summary = {
    previewUrl: PREVIEW_URL,
    pageOrder: PAGE_ORDER.map((item) => item.key),
    viewports: VIEWPORTS.map((item) => item.key),
    generatedAt: new Date().toISOString(),
    screenshots: [],
    consoleErrors: [],
    pageErrors: []
  };

  for (const viewport of VIEWPORTS) {
    ensureDir(path.join(OUT_DIR, viewport.key));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
      hasTouch: viewport.hasTouch || false,
      deviceScaleFactor: viewport.deviceScaleFactor
    });
    const page = await context.newPage();

    page.on('console', (message) => {
      if (message.type() === 'error') {
        summary.consoleErrors.push({
          viewport: viewport.key,
          text: message.text()
        });
      }
    });
    page.on('pageerror', (error) => {
      summary.pageErrors.push({
        viewport: viewport.key,
        text: error.message
      });
    });

    await waitForAppReady(page);

    for (const entry of PAGE_ORDER) {
      if (entry.key !== 'overview') {
        await openPage(page, entry.label);
      }
      const outputPath = path.join(OUT_DIR, viewport.key, `${sanitize(entry.key)}.png`);
      await page.screenshot({ path: outputPath, fullPage: true });
      summary.screenshots.push(path.relative(ROOT, outputPath));
    }

    await openPage(page, '项目概况');
    const drawerScreenshot = await captureGlossaryDrawer(page, viewport.key);
    summary.screenshots.push(path.relative(ROOT, drawerScreenshot));

    await context.close();
    await browser.close();
  }

  fs.writeFileSync(path.join(LOG_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(LOG_DIR, 'console-errors.json'), JSON.stringify(summary.consoleErrors, null, 2));
  fs.writeFileSync(path.join(LOG_DIR, 'page-errors.json'), JSON.stringify(summary.pageErrors, null, 2));

  if (summary.consoleErrors.length > 0 || summary.pageErrors.length > 0) {
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
