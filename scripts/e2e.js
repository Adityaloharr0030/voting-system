const { spawn } = require('child_process');
const path = require('path');
const puppeteer = require('puppeteer');

const http = require('http');

async function isServerRunning(url) {
  return new Promise(resolve => {
    const req = http.get(url, res => { res.resume(); resolve(true); });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => { req.destroy(); resolve(false); });
  });
}


// No need to start server; but check both localhost and 127.0.0.1 with retries
async function startServer() {
  const hosts = ['http://127.0.0.1:4000/', 'http://localhost:4000/'];
  for (const h of hosts) {
    for (let attempt = 0; attempt < 8; attempt++) {
      if (await isServerRunning(h)) {
        console.log('Detected existing server at', h, '- reusing it');
        return null;
      }
      // progressively longer backoff
      await new Promise(r => setTimeout(r, 250 * (attempt + 1)));
    }
  }
  throw new Error('Express server not running on port 4000 (127.0.0.1 or localhost). Please start it before running E2E.');
}

async function run() {
  const server = await startServer();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  page.setDefaultTimeout(60000);
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
  try {
  const base = process.env.E2E_BASE || 'http://127.0.0.1:4000';
    // Seed via autoseed page and wait until LS_USERS exists
    console.log('Opening autoseed at', base + '/autoseed.html');
    await page.goto(base + '/autoseed.html', { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => {
      try { return !!localStorage.getItem('LS_USERS'); } catch { return false; }
    }, { timeout: 15000 });


    // Login as admin
    await page.goto(base + '/login.html', { waitUntil: 'load' });
    await page.type('#email', 'admin@example.com');
    await page.type('#password', 'adminpass');
    await Promise.all([page.click('#loginBtn'), page.waitForNavigation({ waitUntil: 'load', timeout: 60000 })]);

    // Go to admin page, add candidate
    await page.goto(base + '/admin.html', { waitUntil: 'load' });
    await page.type('#candidateName', 'E2E Candidate');
  await page.click('form#addCandidateForm button[type=submit]');
  await sleep(1200);

    // Logout by clearing session and login as alice
    await page.evaluate(() => localStorage.removeItem('LS_SESSION'));
    await page.goto(base + '/login.html', { waitUntil: 'load' });
    await page.type('#email', 'alice@example.com');
    await page.type('#password', 'password');
    await Promise.all([page.click('#loginBtn'), page.waitForNavigation({ waitUntil: 'load', timeout: 60000 })]);

    // Vote on first candidate (use .candidate-card)
    await page.goto(base + '/index.html', { waitUntil: 'load' });
  await page.waitForSelector('.candidate-card', { timeout: 15000 });
  await page.click('.candidate-card button.vote-btn');
  await sleep(800);

    // Open results and screenshot
    await page.goto(base + '/results.html', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.resolve(__dirname, '..', 'e2e-results.png'), fullPage: true });

    console.log('E2E completed; screenshot saved to e2e-results.png');
  } catch (err) {
    console.error('E2E failed', err);
  } finally {
    await browser.close();
    if (server) {
      try { server.kill(); } catch (e) {}
    }
  }
}

run();
