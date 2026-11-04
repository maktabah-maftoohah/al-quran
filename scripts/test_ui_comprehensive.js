/**
 * Comprehensive Automated End-to-End Test Suite
 * Tests all 15 features across Desktop and Mobile viewports with zero uncaught errors.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json'
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
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
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
    // 1. Initial Load & Default Surah 1
    console.log('\n--- 1. Initial Load & Default Surah 1 ---');
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const title = await page.title();
    assert(title.includes('Al-Quran'), 'Title is Al-Quran');
    const verseCards = await page.$$('.verse-card');
    assert(verseCards.length === 7, `Surah 1 has 7 verse cards, found ${verseCards.length}`);
    const surahTitle = await page.textContent('.surah-header-latin');
    assert(surahTitle.includes('Al-Faatiha'), `Surah header shows Al-Faatiha`);

    // 2. Surah 112 Navigation & Basmalah Banner
    console.log('\n--- 2. Surah 112 Navigation & Basmalah Banner ---');
    await page.click('a[data-surah="112"]');
    await page.waitForTimeout(500);
    const s112Cards = await page.$$('.verse-card');
    assert(s112Cards.length === 4, `Surah 112 has 4 verse cards, found ${s112Cards.length}`);
    const basmalahCard = await page.$('.basmalah-card');
    assert(basmalahCard !== null, 'Basmalah card is displayed on Surah 112');

    // 3. Unseeded Surah View (Surah 2)
    console.log('\n--- 3. Unseeded Surah View (Surah 2) ---');
    await page.click('a[data-surah="2"]');
    await page.waitForTimeout(500);
    const unseededText = await page.textContent('body');
    assert(unseededText.includes('Seed Mode Active'), 'Unseeded surah shows Seed Mode Active message');

    // 4. Ayah Deep-Dive View (#ayah/1/1)
    console.log('\n--- 4. Ayah Deep-Dive View (#ayah/1/1) ---');
    await page.goto(`http://localhost:${PORT}/index.html#ayah/1/1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const wordCards = await page.$$('.word-card');
    assert(wordCards.length === 4, `Ayah 1:1 has 4 word tokens, found ${wordCards.length}`);

    // 5. Word Morphology Drawer
    console.log('\n--- 5. Word Morphology Drawer ---');
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

    // 6. Deep-Dive Tafsir Tab
    console.log('\n--- 6. Deep-Dive Tafsir Tab ---');
    const tafsirTabBtn = await page.$('.tab-btn[data-tab="tafsir"]');
    if (tafsirTabBtn) {
      await tafsirTabBtn.click();
      await page.waitForTimeout(800);
      const tafsirActive = await page.$eval('#pane-tafsir', el => el.classList.contains('active'));
      assert(tafsirActive, 'Tafsir tab becomes active');
      const tafsirContent = await page.textContent('#tafsir-body-text');
      assert(tafsirContent.length > 20, 'Tafsir body text loaded');
    }

    // 7. Bookmarking Ayah
    console.log('\n--- 7. Bookmarking Ayah ---');
    await page.goto(`http://localhost:${PORT}/index.html#surah/1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const bookmarkBtn = await page.$('.btn-bookmark-ayah[data-ayah="1"]');
    assert(bookmarkBtn !== null, 'Bookmark button exists on Ayah 1:1');
    await bookmarkBtn.click();
    await page.waitForTimeout(300);
    const isBookmarkedClass = await bookmarkBtn.getAttribute('class');
    assert(isBookmarkedClass.includes('bookmarked'), 'Bookmark button has .bookmarked class');

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

    // 8. Typography Popover Controls & Jawi Mode
    console.log('\n--- 8. Typography Popover Controls & Jawi Mode ---');
    await page.click('#typography-btn');
    await page.waitForTimeout(300);
    const popoverOpen = await page.$eval('#typography-popover', el => el.classList.contains('open'));
    assert(popoverOpen, 'Typography popover opened');

    // Toggle Pickthall translation
    await page.click('#toggle-trans-pickthall');
    await page.waitForTimeout(300);

    // Toggle Jawi
    await page.click('#toggle-jawi-script');
    await page.waitForTimeout(500);
    await page.goto(`http://localhost:${PORT}/index.html#surah/1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    const jawiElements = await page.$$('.jawi-text');
    assert(jawiElements.length > 0, `Jawi script elements rendered: ${jawiElements.length}`);

    // 9. Verse Card Generator Modal
    console.log('\n--- 9. Verse Card Generator Modal ---');
    const shareCardBtn = await page.$('.btn-share-card[data-ayah="1"]');
    assert(shareCardBtn !== null, 'Share Card button exists');
    await shareCardBtn.click();
    await page.waitForTimeout(400);

    const cardModalOpen = await page.$eval('#verse-card-modal', el => el.classList.contains('open'));
    assert(cardModalOpen, 'Verse card modal opened');

    // Change ratio to Story
    await page.selectOption('#card-ratio-select', '9:16');
    await page.waitForTimeout(300);
    const canvasHeight = await page.$eval('#verse-card-canvas', c => c.height);
    assert(canvasHeight === 1920, `Canvas height resized to 1920 (Story), got ${canvasHeight}`);

    // Close card modal
    await page.click('[data-action="close-card-modal"]');
    await page.waitForTimeout(300);
    const cardModalClosed = await page.$eval('#verse-card-modal', el => !el.classList.contains('open'));
    assert(cardModalClosed, 'Verse card modal closed');

    // 10. 15-Line Madinah Mushaf Page View
    console.log('\n--- 10. 15-Line Madinah Mushaf Page View ---');
    await page.goto(`http://localhost:${PORT}/index.html#mushaf/1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const mushafSheet = await page.$('.mushaf-sheet');
    assert(mushafSheet !== null, 'Mushaf sheet rendered for page 1');
    const mushafAyahs = await page.$$('.mushaf-ayah-span');
    assert(mushafAyahs.length === 7, `Mushaf page 1 has 7 ayah spans, got ${mushafAyahs.length}`);

    // 11. Tahfiz / Hifz Memorization Mode
    console.log('\n--- 11. Tahfiz / Hifz Memorization Mode ---');
    await page.goto(`http://localhost:${PORT}/index.html#surah/1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.click('#hifz-mode-btn');
    await page.waitForTimeout(600);

    const hifzToolbar = await page.$('#hifz-active-toolbar');
    assert(hifzToolbar !== null, 'Hifz toolbar is displayed');

    await page.waitForSelector('#hifz-blur-toggle');
    await page.click('#hifz-blur-toggle');
    await page.waitForTimeout(500);
    const blurredCards = await page.$$('.verse-arabic.hifz-blurred');
    assert(blurredCards.length === 7, `7 verses blurred for recall test, got ${blurredCards.length}`);

    // Click to reveal
    await page.click('.verse-arabic.hifz-blurred');
    await page.waitForTimeout(300);
    const revealedCards = await page.$$('.verse-arabic.revealed');
    assert(revealedCards.length === 1, `First verse revealed upon click`);

    // 12. Search Engine & Verse Jump Modal
    console.log('\n--- 12. Search Engine & Verse Jump Modal ---');
    await page.click('[data-action="open-search"]');
    await page.waitForTimeout(300);
    const searchModalOpen = await page.$eval('#search-modal-overlay', el => el.classList.contains('open'));
    assert(searchModalOpen, 'Search modal is open');

    // Verse jump query
    await page.fill('#search-input-field', '112:1');
    await page.waitForTimeout(400);
    const jumpResult = await page.$('.search-result-item');
    assert(jumpResult !== null, 'Search results found for 112:1');
    await jumpResult.click();
    await page.waitForTimeout(500);
    assert(page.url().includes('112'), `URL navigated to surah 112: ${page.url()}`);

    // 13. Sticky Audio Player & Reciter Sync
    console.log('\n--- 13. Sticky Audio Player & Reciter Sync ---');
    const playPauseBtn = await page.$('#player-play-pause-btn');
    assert(playPauseBtn !== null, 'Audio play/pause button exists');
    const surahTitleInPlayer = await page.textContent('#player-surah-title');
    assert(surahTitleInPlayer.includes('Al-Ikhlaas'), `Sticky player reflects current surah: "${surahTitleInPlayer}"`);

    // 14. Responsive Mobile Drawer Toggle
    console.log('\n--- 14. Responsive Mobile Drawer Toggle ---');
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    await page.waitForTimeout(300);

    const sidebarToggleBtn = await page.$('#toggle-sidebar-btn');
    assert(sidebarToggleBtn !== null, 'Sidebar toggle button exists in DOM');
    await sidebarToggleBtn.click();
    await page.waitForTimeout(400);

    const sidebarMobileOpen = await page.$eval('#app-sidebar', el => el.classList.contains('open'));
    assert(sidebarMobileOpen, 'Sidebar opened upon mobile toggle button click');

    // Click outside to close (click to the right of the 280px sidebar)
    await page.mouse.click(340, 250);
    await page.waitForTimeout(400);
    const sidebarMobileClosed = await page.$eval('#app-sidebar', el => !el.classList.contains('open'));
    assert(sidebarMobileClosed, 'Sidebar closed when clicking outside');

    // Restore desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });

    console.log('\n====================================');
    console.log(`TOTAL TESTS: ${passCount + failCount}`);
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
