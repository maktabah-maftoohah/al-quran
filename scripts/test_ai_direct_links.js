/**
 * scripts/test_ai_direct_links.js
 * E2E tests verifying direct verse deep-linking, query parameter routing,
 * AI citation formatting, and llms.txt / robots.txt metadata.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8891;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function createStaticServer() {
  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0].split('#')[0];
    if (reqPath === '/') reqPath = '/index.html';

    const filePath = path.join(ROOT_DIR, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`[PASS] ${message}`);
}

async function runTests() {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Test server running at http://localhost:${PORT}`);

  const chromePath = [
    process.env.CHROME_BIN,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ].find((p) => p && fs.existsSync(p));

  const launchOptions = { headless: true };
  if (chromePath) {
    launchOptions.executablePath = chromePath;
  }

  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const page = await context.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  try {
    // 1. Direct Verse Hash (#2:255 - Ayat Al-Kursi)
    console.log('\n--- 1. Direct Verse Hash (#2:255) ---');
    await page.goto(`http://localhost:${PORT}/index.html#2:255`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const card2_255 = await page.$('#verse-2-255');
    assert(card2_255 !== null, 'Verse card #verse-2-255 rendered in DOM');
    const isHighlighted = await page.$eval('#verse-2-255', (el) => el.classList.contains('highlight-target'));
    assert(isHighlighted, 'Verse 2:255 has .highlight-target class');

    const pageTitle = await page.title();
    assert(pageTitle.includes('2:255'), `Page title contains 2:255: "${pageTitle}"`);
    assert(pageTitle.includes('Al-Baqarah'), `Page title contains surah name Al-Baqarah: "${pageTitle}"`);

    // 2. Direct Verse Deep-Dive (#ayah/2/255)
    console.log('\n--- 2. Single Ayah Deep-Dive View (#ayah/2/255) ---');
    await page.goto(`http://localhost:${PORT}/index.html#ayah/2/255`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const deepDiveTitle = await page.title();
    assert(deepDiveTitle.includes('2:255'), `Deep-dive page title reflects 2:255: "${deepDiveTitle}"`);

    const deepLinkBtn = await page.$('.btn-copy-deepdive-link');
    assert(deepLinkBtn !== null, 'Deep-dive has direct link copy button');

    const aiCitationBtn = await page.$('.btn-copy-deepdive-ai');
    assert(aiCitationBtn !== null, 'Deep-dive has AI citation copy button');

    await aiCitationBtn.click();
    await page.waitForTimeout(300);
    const aiClipboard = await page.evaluate(() => navigator.clipboard.readText());
    assert(aiClipboard.includes('#2:255'), `AI citation clipboard text contains canonical link #2:255: "${aiClipboard}"`);
    assert(aiClipboard.includes('Surah Al-Baqarah (2:255)'), `AI citation contains Surah reference: "${aiClipboard}"`);

    // 3. Query Parameter Direct Link (?surah=2&ayah=255)
    console.log('\n--- 3. Query Parameter Direct Link (?surah=2&ayah=255) ---');
    await page.goto(`http://localhost:${PORT}/index.html?surah=2&ayah=255`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const qCard = await page.$('#verse-2-255');
    assert(qCard !== null, 'Query parameter ?surah=2&ayah=255 resolved to #verse-2-255');
    const qHighlighted = await page.$eval('#verse-2-255', (el) => el.classList.contains('highlight-target'));
    assert(qHighlighted, 'Verse 2:255 highlighted from query parameter link');

    // 4. Query Parameter Short Reference (?ref=18:10)
    console.log('\n--- 4. Query Parameter Short Reference (?ref=18:10) ---');
    await page.goto(`http://localhost:${PORT}/index.html?ref=18:10`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const kahfCard = await page.$('#verse-18-10');
    assert(kahfCard !== null, 'Query parameter ?ref=18:10 resolved to #verse-18-10');
    const kahfHighlighted = await page.$eval('#verse-18-10', (el) => el.classList.contains('highlight-target'));
    assert(kahfHighlighted, 'Verse 18:10 highlighted from ?ref=18:10');

    // 5. Named Surah Slug Deep-Link (#al-baqarah:255)
    console.log('\n--- 5. Named Surah Slug Deep-Link ---');
    await page.goto(`http://localhost:${PORT}/index.html#al-baqarah:255`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const slugCard = await page.$('#verse-2-255');
    assert(slugCard !== null, 'Named slug #al-baqarah:255 successfully resolved to verse 2:255');

    // 6. Share Card Modal with Direct Link & AI Copy
    console.log('\n--- 6. Share Card Modal Direct Link & AI Citation ---');
    await page.goto(`http://localhost:${PORT}/index.html#surah/1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const shareCardBtn = await page.$('#verse-1-1 .btn-share-card');
    assert(shareCardBtn !== null, 'Share Card button exists on verse 1:1');
    await shareCardBtn.click();
    await page.waitForTimeout(300);

    const modalLinkInput = await page.$('#card-modal-link-input');
    assert(modalLinkInput !== null, 'Modal link input field exists in share card modal');
    const linkVal = await page.$eval('#card-modal-link-input', (el) => el.value);
    assert(linkVal.includes('#1:1'), `Modal link input contains #1:1 direct link: "${linkVal}"`);

    const copyModalAiBtn = await page.$('#btn-copy-modal-ai');
    assert(copyModalAiBtn !== null, 'Modal AI copy button exists in share card modal');
    await copyModalAiBtn.click();
    await page.waitForTimeout(300);
    const modalAiClip = await page.evaluate(() => navigator.clipboard.readText());
    assert(modalAiClip.includes('#1:1'), `Modal AI citation clipboard text contains #1:1: "${modalAiClip}"`);

    // 7. llms.txt and robots.txt
    console.log('\n--- 7. llms.txt & robots.txt Metadata ---');
    const llmsRes = await page.goto(`http://localhost:${PORT}/llms.txt`);
    assert(llmsRes.status() === 200, 'llms.txt returns HTTP 200 OK');
    const llmsContent = await llmsRes.text();
    assert(llmsContent.includes('# Maktabah Maftoohah Al-Quran'), 'llms.txt contains app header');
    assert(llmsContent.includes('https://maktabah-maftoohah.github.io/al-quran/#{surah}:{ayah}'), 'llms.txt documents #{surah}:{ayah} schema');
    assert(llmsContent.includes('Al-Baqarah'), 'llms.txt lists Surah catalogue');

    const robotsRes = await page.goto(`http://localhost:${PORT}/robots.txt`);
    assert(robotsRes.status() === 200, 'robots.txt returns HTTP 200 OK');
    const robotsContent = await robotsRes.text();
    assert(robotsContent.includes('llms.txt:'), 'robots.txt points to llms.txt');
    assert(robotsContent.includes('GPTBot'), 'robots.txt declares GPTBot');
    assert(robotsContent.includes('ClaudeBot'), 'robots.txt declares ClaudeBot');

    console.log('\n====================================');
    console.log('ALL AI DIRECT LINK TESTS PASSED (7/7)');
    console.log('====================================');
  } finally {
    await browser.close();
    server.close();
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
