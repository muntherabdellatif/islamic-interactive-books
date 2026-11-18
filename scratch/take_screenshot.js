const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = path.resolve('preview/index.html');
const outPng = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\0b05f099-d548-4b08-b858-8359cab76c5f\\page_60_reviewed.png';
const tmpDir = path.join(os.tmpdir(), 'chrome_headless_' + Date.now());

fs.mkdirSync(tmpDir, { recursive: true });
if (fs.existsSync(outPng)) fs.unlinkSync(outPng);

const targetUrl = 'http://localhost:3333/compare?book=al-nashr&page=60';
console.log('Target URL:', targetUrl);
console.log('Output PNG:', outPng);

const tempShot = path.join(tmpDir, 'snap.png');

const args = [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--no-first-run',
  '--no-default-browser-check',
  `--user-data-dir=${tmpDir}`,
  '--window-size=1440,900',
  `--screenshot=${tempShot}`,
  targetUrl
];

const res = spawnSync(chromePath, args, { cwd: tmpDir, encoding: 'utf8', timeout: 20000 });
console.log('Exit status:', res.status);
if (res.error) console.log('Error:', res.error.message);
if (res.stdout) console.log('Stdout:', res.stdout);
if (res.stderr) console.log('Stderr:', res.stderr);

if (fs.existsSync(tempShot)) {
  fs.copyFileSync(tempShot, outPng);
}

if (fs.existsSync(outPng)) {
  console.log('SUCCESS! Screenshot generated, size:', fs.statSync(outPng).size);
} else {
  console.log('FAILED: Screenshot not found');
}

// cleanup tmpDir
try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch(e) {}
