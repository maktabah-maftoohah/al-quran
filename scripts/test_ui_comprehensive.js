/**
 * Comprehensive UI & Interaction Test Suite
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const ROOT_DIR = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(ROOT_DIR, reqPath);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found: ' + reqPath);
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'text/plain',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(content);
  });
});

const PORT = 8899;

server.listen(PORT, async () => {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const pageErrors = [];
  const consoleErrors = [];

  page.on('pageerror', (err) => {
    console.error('PAGE ERROR:', err.toString());
    pageErrors.push(err.toString());
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('CONSOLE ERROR:', msg.text());
      consoleErrors.push(msg.text());
    }
  });

  let passCount = 0;
  let failCount = 0;

  function assert(condition, desc) {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${desc}`);
      failCount++;
    }
  }

  try {
    console.log('\n--- Test 1: Page Load & Default Surah 1 ---');
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const title = await page.title();
    assert(title.includes('Al-Quran'), 'Title is Al-Quran');

    const verseCards = await page.$$('.verse-card');
    assert(verseCards.length === 7, `Surah 1 has 7 verse cards, found ${verseCards.length}`);

    const surahTitle = await page.textContent('.surah-header-latin');
    assert(surahTitle.includes('Al-Faatiha'), `Surah header shows Al-Faatiha: got "${surahTitle}"`);

    console.log('\n--- Test 2: Surah 112 Navigation & Basmalah Banner ---');
    await page.click('a[data-surah="112"]');
    await page.waitForTimeout(500);

    const s112Cards = await page.$$('.verse-card');
    assert(s112Cards.length === 4, `Surah 112 has 4 verse cards, found ${s112Cards.length}`);

    const basmalahCard = await page.$('.basmalah-card');
    assert(basmalahCard !== null, 'Basmalah card is displayed on Surah 112');

    console.log('\n--- Test 3: Unseeded Surah View (Surah 2) ---');
    await page.click('a[data-surah="2"]');
    await page.waitForTimeout(500);

    const unseededText = await page.textContent('body');
    assert(unseededText.includes('Seed Mode Active'), 'Unseeded surah shows Seed Mode Active message');

    console.log('\n--- Test 4: Ayah Deep-Dive View (#ayah/1/1) ---');
    await page.goto(`http://localhost:${PORT}/index.html#ayah/1/1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const wordCards = await page.$$('.word-card');
    assert(wordCards.length === 4, `Ayah 1:1 has 4 word tokens, found ${wordCards.length}`);

    console.log('\n--- Test 5: Word Morphology Drawer ---');
    // Click on the second word card (Allah)
    await wordCards[1].click();
    await page.waitForTimeout(400);

    const drawerOpen = await page.$eval('#morphology-drawer', el => el.classList.contains('open'));
    assert(drawerOpen, 'Morphology drawer opens on word click');

    const drawerBody = await page.textContent('#morph-drawer-body');
    assert(drawerBody.includes('Root (الجذر)') || drawerBody.includes('Lemma'), 'Drawer contains grammar/root breakdown');

    // Close drawer
    await page.click('#close-morph-drawer-btn');
    await page.waitForTimeout(300);
    const drawerClosed = await page.$eval('#morphology-drawer', el => !el.classList.contains('open'));
    assert(drawerClosed, 'Morphology drawer closes on close button');

    console.log('\n--- Test 6: Deep-Dive Tafsir Tab ---');
    const tafsirTabBtn = await page.$('.tab-btn[data-tab="tafsir"]');
    if (tafsirTabBtn) {
      await tafsirTabBtn.click();
      await page.waitForTimeout(600);
      const tafsirActive = await page.$eval('#pane-tafsir', el => el.classList.contains('active'));
      assert(tafsirActive, 'Tafsir tab becomes active');
    }

    console.log('\n--- Test 7: Bookmarking Ayah ---');
    await page.goto(`http://localhost:${PORT}/index.html#surah/1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const bookmarkBtn = await page.$('.btn-bookmark-ayah[data-ayah="1"]');
    assert(bookmarkBtn !== null, 'Bookmark button exists on Ayah 1:1');
    await bookmarkBtn.click();
    await page.waitForTimeout(300);

    const isBookmarkedClass = await bookmarkBtn.getAttribute('class');
    assert(isBookmarkedClass.includes('bookmarked'), 'Bookmark button has .bookmarked class after click');

    // Switch to bookmarks tab in sidebar
    await page.click('.sidebar-tab[data-tab="bookmarks"]');
    await page.waitForTimeout(300);
    const bookmarkItems = await page.$$('.sidebar-list#sidebar-bookmarks-list .surah-list-item');
    assert(bookmarkItems.length >= 1, `Sidebar shows ${bookmarkItems.length} bookmark(s)`);

    // Navigate to bookmarks view
    await page.goto(`http://localhost:${PORT}/index.html#bookmarks`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const bmCards = await page.$$('.verses-container .verse-card');
    assert(bmCards.length >= 1, `Bookmarks page has ${bmCards.length} saved card(s)`);

    console.log('\n--- Test 8: Typography Popover Controls ---');
    await page.click('#typography-btn');
    await page.waitForTimeout(300);
    const popoverOpen = await page.$eval('#typography-popover', el => el.classList.contains('open'));
    assert(popoverOpen, 'Typography popover opened');

    // Toggle Pickthall translation
    await page.click('#toggle-trans-pickthall');
    await page.waitForTimeout(300);
    // Go to Surah 1
    await page.goto(`http://localhost:${PORT}/index.html#surah/1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const pickthallBlockDisplay = await page.$eval('.translation-block-pickthall', el => window.getComputedStyle(el).display);
    assert(pickthallBlockDisplay === 'flex', `Pickthall block is now displayed (display=${pickthallBlockDisplay})`);

    console.log('\n--- Test 9: Search Engine & Modal ---');
    await page.click('[data-action="open-search"]');
    await page.waitForTimeout(300);
    const searchModalOpen = await page.$eval('#search-modal-overlay', el => el.classList.contains('open'));
    assert(searchModalOpen, 'Search modal is open');

    // Type verse jump
    await page.fill('#search-input-field', '112:1');
    await page.waitForTimeout(400);

    const jumpResult = await page.$('.search-result-item');
    assert(jumpResult !== null, 'Search results found for 112:1');

    await jumpResult.click();
    await page.waitForTimeout(500);
    assert(page.url().includes('112'), `URL navigated to surah 112: ${page.url()}`);

    console.log('\n--- Test 10: Audio Player Controls ---');
    const playPauseBtn = await page.$('#player-play-pause-btn');
    assert(playPauseBtn !== null, 'Audio play/pause button exists');
    await playPauseBtn.click();
    await page.waitForTimeout(400);

    const loopToggle = await page.$('#player-loop-toggle');
    assert(loopToggle !== null, 'Loop toggle exists');
    await loopToggle.click();
    await page.waitForTimeout(300);
    const loopActive = await loopToggle.getAttribute('class');
    assert(loopActive.includes('active'), 'Loop toggle active after click');

    console.log('\n====================================');
    console.log(`TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
    console.log(`PAGE ERRORS: ${pageErrors.length}`);
    console.log(`CONSOLE ERRORS: ${consoleErrors.length}`);
    console.log('====================================\n');

    if (pageErrors.length > 0 || failCount > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
});

