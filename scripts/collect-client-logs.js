const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function capture(url, name) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', msg => logs.push({ type: 'console', text: msg.text(), location: msg.location() }));
  page.on('pageerror', err => logs.push({ type: 'pageerror', text: err.message }));
  page.on('requestfailed', req => logs.push({ type: 'requestfailed', url: req.url(), err: req.failure() }));
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  } catch (e) {
    logs.push({ type: 'gotoError', text: e.message });
  }
  const screenshotsDir = path.join(__dirname, '..');
  const shotPath = path.join(screenshotsDir, `${name}.png`);
  try { await page.screenshot({ path: shotPath, fullPage: true }); } catch (e) { logs.push({ type: 'screenshotError', text: e.message }); }
  const out = { url, logs };
  await browser.close();
  return out;
}

async function runAll() {
  const base = process.env.E2E_BASE || 'http://127.0.0.1:4000';
  const pages = ['login.html','index.html','results.html','admin.html','autoseed.html','data.html'];
  const results = {};
  for (const p of pages) {
    console.log('Checking', p);
    results[p] = await capture(`${base}/${p}`, p.replace('.','_'));
  }
  const outPath = path.join(__dirname, '..', 'client-logs.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log('Saved client logs to', outPath);
}

run().catch(err => { console.error(err); process.exit(1); });
