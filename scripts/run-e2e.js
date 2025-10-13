const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

function waitForServer(url, timeout = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function check() {
      const req = http.get(url, res => { res.resume(); resolve(); });
      req.on('error', () => {
        if (Date.now() - start > timeout) return reject(new Error('Timeout waiting for server'));
        setTimeout(check, 300);
      });
      req.setTimeout(2000, () => { req.destroy(); if (Date.now() - start > timeout) return reject(new Error('Timeout waiting for server')); setTimeout(check, 300); });
    })();
  });
}

async function run() {
  const serverCmd = spawn(process.execPath, [path.join(__dirname, '..', 'server', 'index.js')], { stdio: 'inherit' });
  try {
    await waitForServer('http://127.0.0.1:4000/', 15000);
    console.log('Server is up, running E2E...');
    const e2e = spawn(process.execPath, [path.join(__dirname, 'e2e.js')], { stdio: 'inherit' });
    const code = await new Promise(resolve => e2e.on('close', resolve));
    console.log('E2E finished with code', code);
    process.exitCode = code;
  } catch (err) {
    console.error('Runner error:', err);
    process.exitCode = 1;
  } finally {
    try { serverCmd.kill(); } catch (e) {}
  }
}

run();
