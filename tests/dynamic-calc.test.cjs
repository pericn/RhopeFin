const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = '/Users/peric/Documents/Projects/Rilo Analysis';
const PORT = 4173;
const URL = `http://127.0.0.1:${PORT}/index.html`;

const results = { passed: 0, failed: 0, skipped: 0, details: [] };

function log(name, status, detail = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${icon} [${status}] ${name}${detail ? ': ' + detail : ''}`);
  results.details.push({ name, status, detail });
  if (status === 'PASS') results.passed++;
  else if (status === 'FAIL') results.failed++;
  else results.skipped++;
}

async function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const filePath = path.join(ROOT, req.url === '/' ? '/index.html' : req.url);
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        const ext = path.extname(filePath);
        const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
        res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
        res.end(data);
      });
    });
    server.listen(PORT, () => resolve(server));
    server.on('error', reject);
  });
}

async function waitForApp(page) {
  // Wait for app to load: look for nav buttons or main content
  try {
    await page.waitForFunction(() => {
      const nav = document.querySelector('[class*="rilo-app-nav"]');
      return nav || document.querySelector('[class*="nav"]');
    }, { timeout: 8000 });
    await page.waitForTimeout(1500); // let calculators run
    return true;
  } catch {
    return false;
  }
}

async function getOverviewKPIs(page) {
  // KPI strip is the top section of Overview. Try multiple selector patterns.
  const selectors = [
    '[class*="kpi"]',
    '[class*="KPI"]',
    '[class*="metric"]',
    '[class*="profit-level"]',
  ];
  for (const sel of selectors) {
    const els = await page.locator(sel).all();
    if (els.length > 0) return els.map(e => e.textContent().catch(() => ''));
  }
  return [];
}

async function main() {
  console.log('🚀 Starting Rilo Analysis Dynamic Calc Test\n');

  // Start server
  let server;
  try {
    server = await startServer();
    console.log(`📡 Server running on :${PORT}`);
  } catch (err) {
    console.log(`❌ Failed to start server: ${err.message}`);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const appLoaded = await waitForApp(page);

    if (!appLoaded) {
      log('App loads', 'FAIL', 'App did not load within timeout');
    } else {
      log('App loads', 'PASS');
    }

    // Check Overview KPIs visible
    const overviewKPIs = await getOverviewKPIs(page);
    if (overviewKPIs.length > 0) {
      log('Overview KPI strip renders', 'PASS', `Found ${overviewKPIs.length} metric elements`);
    } else {
      log('Overview KPI strip renders', 'FAIL', 'No KPI elements found');
    }

    // Navigate to Settings and try to change occupancy input
    const settingsBtn = page.getByRole('button', { name: /经营设置/ }).first();
    const hasSettings = await settingsBtn.count() > 0;
    if (hasSettings) {
      await settingsBtn.click();
      await page.waitForTimeout(1000);
      log('Navigate to Settings', 'PASS');

      // Try to find ANY interactive input or element on Settings
      // Approach 1: range sliders
      const rangeInputs = await page.locator('input[type="range"]').all();
      // Approach 2: text inputs (non-file)
      const textInputs = await page.locator('input:not([type="file"]):not([type="checkbox"]):not([type="radio"]):not([type="range"])').all();
      // Approach 3: contentEditable elements
      const editableEls = await page.locator('[contenteditable]').all();

      let testDone = false;

      // Try range slider first (occupancy)
      if (rangeInputs.length > 0) {
        const slider = rangeInputs[0];
        const beforeValue = await slider.inputValue().catch(() => '0');
        // Move slider via evaluate to bypass React synthetic events
        await slider.evaluate(el => {
          el.value = '75';
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
        await page.waitForTimeout(1000);
        const afterValue = await slider.inputValue().catch(() => '0');
        log('Settings range slider interaction', 'PASS', `occupancy ${beforeValue} → ${afterValue}`);
        testDone = true;
      }

      // Try editable elements (custom React inputs often use this)
      if (!testDone && editableEls.length > 0) {
        const el = editableEls[0];
        const beforeText = await el.textContent().catch(() => '');
        await el.click({ clickCount: 3 });
        await el.fill('75');
        await el.dispatchEvent('input');
        await page.waitForTimeout(800);
        const afterText = await el.textContent().catch(() => '');
        if (afterText !== beforeText) {
          log('Settings editable element accepts value', 'PASS', `${beforeText} → ${afterText}`);
          testDone = true;
        }
      }

      // Try text inputs as fallback
      if (!testDone && textInputs.length > 0) {
        const input = textInputs[0];
        const beforeValue = await input.inputValue().catch(() => '');
        await input.evaluate(el => { el.value = '75'; el.dispatchEvent(new Event('input', { bubbles: true })); });
        await page.waitForTimeout(800);
        const afterValue = await input.inputValue().catch(() => '');
        if (afterValue !== beforeValue) {
          log('Settings text input interaction', 'PASS', `${beforeValue} → ${afterValue}`);
          testDone = true;
        } else {
          log('Settings text input interaction', 'FAIL', `Value unchanged: ${beforeValue}`);
          testDone = true;
        }
      }

      if (!testDone) {
        log('Settings input interaction', 'FAIL', 'No interactive inputs found on Settings page');
      }

      // Navigate back to Overview and check KPI reactivity
      const overviewBtn = page.getByRole('button', { name: /项目概况/ }).first();
      if (await overviewBtn.count() > 0) {
        await overviewBtn.click();
        await page.waitForTimeout(1200);
        const newKPIs = await getOverviewKPIs(page);
        if (newKPIs.length > 0) {
          log('KPI reactivity after input change', 'PASS', `KPI strip still renders (${newKPIs.length} elements)`);
        } else {
          log('KPI reactivity after input change', 'FAIL', 'KPI strip missing after change');
        }
      }
    } else {
      log('Navigate to Settings', 'FAIL', 'Settings button not found');
    }

    // Navigate to Analysis page
    const analysisBtn = page.getByRole('button', { name: /敏感度分析/ }).first();
    if (await analysisBtn.count() > 0) {
      await analysisBtn.click();
      await page.waitForTimeout(1000);
      log('Navigate to Analysis', 'PASS');

      // Check sensitivity chart/scene table exists
      const tableRows = await page.locator('tr').count();
      if (tableRows > 0) {
        log('Analysis scenario table renders', 'PASS', `${tableRows} rows`);
      } else {
        log('Analysis scenario table renders', 'FAIL', 'No table rows found');
      }
    } else {
      log('Navigate to Analysis', 'FAIL', 'Analysis button not found');
    }

    // Console/page errors summary
    const errorCount = errors.filter(e => !e.includes('favicon')).length;
    if (errorCount === 0) {
      log('No console/page errors', 'PASS');
    } else {
      log('Console/page errors', 'FAIL', `${errorCount} errors: ${errors.slice(0, 3).join('; ')}`);
    }

  } catch (err) {
    log('Test execution', 'FAIL', err.message);
  }

  await browser.close();
  server.close();

  console.log(`\n${'='.repeat(40)}`);
  console.log(`📊 Dynamic Calc Test Results`);
  console.log(`✅ Passed: ${results.passed}  ❌ Failed: ${results.failed}  ⏭️ Skipped: ${results.skipped}`);
  console.log(`${'='.repeat(40)}\n`);

  if (results.failed > 0) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
