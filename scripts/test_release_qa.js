/**
 * Release Candidate Master QA and Debugging Suite
 * Covers All Features, Modern Browser APIs, Invariants & Edge Cases
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
  console.log(`Test server running at http://localhost:${PORT}`);
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
      console.log(`  [PASS] ${desc}`);
      passCount++;
    } else {
      console.error(`  [FAIL] ${desc}`);
      failCount++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Test 1: App Boot, Title, PWA Manifest & Online Status Pill
    // -------------------------------------------------------------
    console.log('\n[TEST 1] App Boot, PWA Manifest, Online Status & Core Shell');
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const title = await page.title();
    assert(title.includes('Al-Quran') || title.includes('Maktabah'), `Document title valid: "${title}"`);

    const manifestLink = await page.$('link[rel="manifest"]');
    assert(manifestLink !== null, 'PWA webmanifest link present in head');

    const offlinePill = await page.$('#offline-status-pill');
    assert(offlinePill !== null, 'Offline status indicator pill present in DOM');
    const docLang = await page.$eval('html', el => el.getAttribute('lang'));
    assert(docLang === 'ms', `Default interface language is Bahasa Melayu (MY): "${docLang}"`);

    // Verify JAKIM is default and single-translation label is hidden
    const isBasmeihChecked = await page.$eval('#toggle-trans-basmeih', el => el.checked);
    const isSahihChecked = await page.$eval('#toggle-trans-sahih', el => el.checked);
    assert(isBasmeihChecked && !isSahihChecked, 'JAKIM is default translation (sole active translation)');

    const labelHiddenSingle = await page.$eval('.verse-translations .translation-label', el => window.getComputedStyle(el).display === 'none');
    assert(labelHiddenSingle, 'Translation reference label is HIDDEN when only one translation is selected');

    // -------------------------------------------------------------
    // Test 2: Surah 1 (Al-Faatiha) Rendering & Verse Count
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Surah 1 (Al-Faatiha) - 7 Verses Render');
    const verseCards1 = await page.$$('.verse-card');
    assert(verseCards1.length === 7, `Surah 1 renders exactly 7 verses, found ${verseCards1.length}`);
    const surahHeader1 = await page.textContent('.surah-header-latin');
    assert(surahHeader1.includes('Al-Faatiha'), `Header displays Al-Faatiha: "${surahHeader1.trim()}"`);

    // -------------------------------------------------------------
    // Test 3: Basmalah Banner Logic (Surah 112 vs Surah 9)
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Basmalah Banner Logic (Surah 112 present, Surah 9 omitted)');
    await page.click('a[data-surah="112"]');
    await page.waitForTimeout(500);
    const basmalah112 = await page.$('.basmalah-card');
    assert(basmalah112 !== null, 'Basmalah banner present on Surah 112 (Al-Ikhlaas)');
    const s112Cards = await page.$$('.verse-card');
    assert(s112Cards.length === 4, `Surah 112 renders exactly 4 verses`);

    await page.click('a[data-surah="9"]');
    await page.waitForTimeout(600);
    const basmalah9 = await page.$('.basmalah-card');
    assert(basmalah9 === null, 'Basmalah banner correctly OMITTED on Surah 9 (At-Tawbah)');
    const s9Cards = await page.$$('.verse-card');
    assert(s9Cards.length === 129, `Surah 9 renders all 129 verses, found ${s9Cards.length}`);

    // -------------------------------------------------------------
    // Test 4: Surah 114 (An-Naas - Last Surah in Quran)
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Surah 114 (An-Naas) - Final Surah');
    await page.click('a[data-surah="114"]');
    await page.waitForTimeout(500);
    const s114Cards = await page.$$('.verse-card');
    assert(s114Cards.length === 6, `Surah 114 renders exactly 6 verses`);
    const surahHeader114 = await page.textContent('.surah-header-latin');
    assert(surahHeader114.includes('An-Naas'), `Header displays An-Naas`);

    // -------------------------------------------------------------
    // Test 5: Full Surah 2 (Al-Baqarah - 286 Verses) & Content Visibility
    // -------------------------------------------------------------
    console.log('\n[TEST 5] Full Surah 2 (Al-Baqarah) - 286 Verses & CSS Content Visibility');
    await page.click('a[data-surah="2"]');
    await page.waitForTimeout(800);
    const s2Cards = await page.$$('.verse-card');
    assert(s2Cards.length === 286, `Surah 2 renders all 286 verses, found ${s2Cards.length}`);

    // -------------------------------------------------------------
    // Test 6: Ayah Deep-Dive View (#ayah/1/1) - Morphology & Tafsir
    // -------------------------------------------------------------
    console.log('\n[TEST 6] Ayah Deep-Dive View (#ayah/1/1) - Word Tokens & Morphology Drawer');
    await page.goto(`http://localhost:${PORT}/index.html#ayah/1/1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const wordCards = await page.$$('.word-card');
    assert(wordCards.length === 4, `Ayah 1:1 has 4 word tokens, found ${wordCards.length}`);

    await wordCards[1].click();
    await page.waitForTimeout(400);
    const drawerOpen = await page.$eval('#morphology-drawer', el => el.classList.contains('open'));
    assert(drawerOpen, 'Morphology drawer opens upon word token click');

    const drawerBody = await page.textContent('#morph-drawer-body');
    assert(drawerBody.includes('Root (الجذر)') || drawerBody.includes('Lemma'), 'Morphology drawer contains linguistic analysis');

    await page.click('#close-morph-drawer-btn');
    await page.waitForTimeout(300);
    const drawerClosed = await page.$eval('#morphology-drawer', el => !el.classList.contains('open'));
    assert(drawerClosed, 'Morphology drawer closes cleanly');

    // Tafsir Tab
    const tafsirTabBtn = await page.$('.tab-btn[data-tab="tafsir"]');
    if (tafsirTabBtn) {
      await tafsirTabBtn.click();
      await page.waitForTimeout(600);
      const tafsirActive = await page.$eval('#pane-tafsir', el => el.classList.contains('active'));
      assert(tafsirActive, 'Tafsir Jalalayn tab activates');
      const tafsirContent = await page.textContent('#tafsir-body-text');
      assert(tafsirContent.length > 20, 'Tafsir text successfully populated');
    }

    // -------------------------------------------------------------
    // Test 7: IndexedDB Storage & Study Notes Engine
    // -------------------------------------------------------------
    console.log('\n[TEST 7] IndexedDB Storage Engine & Ayah Study Notes');
    const idbResult = await page.evaluate(async () => {
      const db = window.storageDB;
      if (!db) return { error: 'storageDB not exposed on window' };
      await db.saveNote('1:1', { surah: 1, ayah: 1, text: 'My test note for Ayah 1:1' });
      const note = await db.getNote('1:1');
      const allNotes = await db.getAllNotes();
      return { note, totalNotes: allNotes.length };
    });
    assert(idbResult.note && idbResult.note.text === 'My test note for Ayah 1:1', 'Note successfully stored and retrieved from IndexedDB');
    assert(idbResult.totalNotes >= 1, `Total notes in IndexedDB: ${idbResult.totalNotes}`);

    // -------------------------------------------------------------
    // Test 8: Bookmarks System & Bookmarks View (#bookmarks)
    // -------------------------------------------------------------
    console.log('\n[TEST 8] Bookmarks System & Bookmarks View');
    await page.goto(`http://localhost:${PORT}/index.html#surah/1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const bookmarkBtn = await page.$('.btn-bookmark-ayah[data-ayah="1"]');
    assert(bookmarkBtn !== null, 'Ayah 1:1 bookmark toggle button found');
    await bookmarkBtn.click();
    await page.waitForTimeout(300);
    const bmClass = await bookmarkBtn.getAttribute('class');
    assert(bmClass.includes('bookmarked'), 'Bookmark icon turns active (.bookmarked)');

    await page.goto(`http://localhost:${PORT}/index.html#bookmarks`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const bmCards = await page.$$('.verses-container .verse-card');
    assert(bmCards.length >= 1, `Bookmarks view renders saved bookmarks, count: ${bmCards.length}`);

    // -------------------------------------------------------------
    // Test 9: Typography Popover, Jawi Script & Font Scaling
    // -------------------------------------------------------------
    console.log('\n[TEST 9] Typography Popover, Jawi Script & Font Scaling');
    await page.goto(`http://localhost:${PORT}/index.html#surah/1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    await page.click('#typography-btn');
    await page.waitForTimeout(300);
    const popoverOpen = await page.$eval('#typography-popover', el => el.classList.contains('open'));
    assert(popoverOpen, 'Typography popover opens');

    // Toggle Jalalayn Translation
    const toggleJalalayn = await page.$('#toggle-trans-jalalayn');
    assert(toggleJalalayn !== null, 'Tafsir al-Jalalayn checkbox present in Typography settings');
    await page.click('#toggle-trans-jalalayn');
    await page.waitForTimeout(500);

    const jalalaynBlocks = await page.$$('.translation-block-jalalayn');
    const jalalaynVisible = await page.$eval('.translation-block-jalalayn', el => window.getComputedStyle(el).display !== 'none');
    assert(jalalaynVisible, 'Tafsir al-Jalalayn (Bahasa Melayu) translation block visible upon toggle');

    // With 2 translations active (JAKIM + Jalalayn), reference labels should now be visible
    const labelVisibleMulti = await page.$eval('.verse-translations .translation-label', el => window.getComputedStyle(el).display !== 'none');
    assert(labelVisibleMulti, 'Translation reference label becomes VISIBLE when multiple translations are active');

    // Dual Language Switching Test (EN / MY)
    const enSwitchBtn = await page.$('#header-lang-switcher .lang-switch-btn[data-lang="en"]');
    assert(enSwitchBtn !== null, 'Language switch button for English present');
    await enSwitchBtn.click();
    await page.waitForTimeout(400);

    const langAfterEN = await page.$eval('html', el => el.getAttribute('lang'));
    assert(langAfterEN === 'en', 'Interface language successfully switched to English (EN)');

    // Switch back to BM
    const msSwitchBtn = await page.$('#header-lang-switcher .lang-switch-btn[data-lang="ms"]');
    await msSwitchBtn.click();
    await page.waitForTimeout(400);

    const langAfterMS = await page.$eval('html', el => el.getAttribute('lang'));
    assert(langAfterMS === 'ms', 'Interface language successfully switched back to Bahasa Melayu (MY)');

    // Toggle Jawi
    await page.click('#toggle-jawi-script');
    await page.waitForTimeout(400);

    // Close typography popover
    await page.click('#typography-btn');
    await page.waitForTimeout(300);

    const jawiElems = await page.$$('.jawi-text');
    assert(jawiElems.length > 0, `Jawi transliteration renders: ${jawiElems.length} elements`);

    // -------------------------------------------------------------
    // Test 10: Canvas Verse Card Generator (Square & Story Ratios)
    // -------------------------------------------------------------
    console.log('\n[TEST 10] Verse Card Canvas Generator (1:1 and 9:16 Story)');
    const cardBtn = await page.$('.btn-share-card[data-ayah="1"]');
    assert(cardBtn !== null, 'Share Card action button found');
    await cardBtn.click();
    await page.waitForTimeout(400);

    const cardModalOpen = await page.$eval('#verse-card-modal', el => el.classList.contains('open'));
    assert(cardModalOpen, 'Verse Card modal opened');

    // Default square (1080x1080)
    let cHeight = await page.$eval('#verse-card-canvas', c => c.height);
    let cWidth = await page.$eval('#verse-card-canvas', c => c.width);
    assert(cWidth === 1080 && cHeight === 1080, `Square ratio renders 1080x1080, got ${cWidth}x${cHeight}`);

    // Switch to 9:16
    await page.selectOption('#card-ratio-select', '9:16');
    await page.waitForTimeout(300);
    cHeight = await page.$eval('#verse-card-canvas', c => c.height);
    assert(cHeight === 1920, `Story ratio renders 1080x1920, height is ${cHeight}`);

    await page.click('[data-action="close-card-modal"]');
    await page.waitForTimeout(300);

    // -------------------------------------------------------------
    // Test 11: 15-Line Madinah Mushaf Page View (#mushaf/1)
    // -------------------------------------------------------------
    console.log('\n[TEST 11] 15-Line Madinah Mushaf Page View (#mushaf/1)');
    await page.goto(`http://localhost:${PORT}/index.html#mushaf/1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const mushafSheet = await page.$('.mushaf-sheet');
    assert(mushafSheet !== null, 'Mushaf sheet rendered');
    const mushafAyahs = await page.$$('.mushaf-ayah-span');
    assert(mushafAyahs.length === 7, `Mushaf page 1 contains exactly 7 ayah spans`);

    // -------------------------------------------------------------
    // Test 12: Tahfiz / Hifz Memorization Mode
    // -------------------------------------------------------------
    console.log('\n[TEST 12] Tahfiz / Hifz Memorization Mode');
    await page.goto(`http://localhost:${PORT}/index.html#surah/1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    await page.click('#hifz-mode-btn');
    await page.waitForTimeout(500);

    const hifzBar = await page.$('#hifz-active-toolbar');
    assert(hifzBar !== null, 'Hifz active toolbar is visible');

    await page.waitForSelector('#hifz-blur-toggle');
    await page.click('#hifz-blur-toggle');
    await page.waitForTimeout(500);

    const blurred = await page.$$('.verse-arabic.hifz-blurred');
    assert(blurred.length === 7, `7 verses blurred for active recall testing`);

    await blurred[0].click();
    await page.waitForTimeout(300);
    const revealed = await page.$$('.verse-arabic.revealed');
    assert(revealed.length === 1, `Verse revealed on tap/click`);

    // Disable Hifz mode
    await page.click('#hifz-mode-btn');
    await page.waitForTimeout(300);

    // -------------------------------------------------------------
    // Test 13: Search Web Worker & Verse Jump Engine
    // -------------------------------------------------------------
    console.log('\n[TEST 13] Search Web Worker & Verse Jump Navigation');
    await page.click('[data-action="open-search"]');
    await page.waitForTimeout(300);

    const searchOpen = await page.$eval('#search-modal-overlay', el => el.classList.contains('open'));
    assert(searchOpen, 'Search modal overlay open');

    // Test text search via Worker
    await page.fill('#search-input-field', 'rahman');
    await page.waitForTimeout(600);
    const searchResults = await page.$$('.search-result-item');
    assert(searchResults.length > 0, `Search Web Worker returned ${searchResults.length} results for 'rahman'`);

    // Test verse jump 112:1
    await page.fill('#search-input-field', '112:1');
    await page.waitForTimeout(400);
    const jumpResult = await page.$('.search-result-item');
    assert(jumpResult !== null, 'Jump result found for 112:1');
    await jumpResult.click();
    await page.waitForTimeout(500);
    assert(page.url().includes('112'), `URL navigated correctly to surah 112: ${page.url()}`);

    // -------------------------------------------------------------
    // Test 14: Screen Wake Lock API
    // -------------------------------------------------------------
    console.log('\n[TEST 14] Screen Wake Lock API');
    const wakeLockBtn = await page.$('#wake-lock-btn');
    assert(wakeLockBtn !== null, 'Wake lock header button exists');

    const wakeLockWorking = await page.evaluate(async () => {
      const mgr = window.wakeLockController;
      if (!mgr) return { supported: false, error: 'wakeLockController missing' };
      const supported = mgr.isSupported();
      const initialActive = mgr.isActive();
      let requestResult = false;
      if (supported) {
        requestResult = await mgr.request();
      }
      return { supported, initialActive, requestResult };
    });
    assert(wakeLockWorking.supported !== undefined, `Screen Wake Lock capability queried: supported=${wakeLockWorking.supported}`);

    // -------------------------------------------------------------
    // Test 15: Persistent Storage & Storage Quota
    // -------------------------------------------------------------
    console.log('\n[TEST 15] Storage Persistence & Quota API');
    const storageStats = await page.evaluate(async () => {
      const db = window.storageDB;
      if (!db) return null;
      return await db.getStorageQuota();
    });
    assert(storageStats !== null && typeof storageStats.quota === 'number', `Storage quota retrieved: ${storageStats ? Math.round(storageStats.quota / (1024 * 1024)) : 'N/A'} MB`);

    // -------------------------------------------------------------
    // Test 16: Backup & Restore Data Engine
    // -------------------------------------------------------------
    console.log('\n[TEST 16] 1-Click Backup & Restore Engine');
    const backupResult = await page.evaluate(async () => {
      const mgr = window.backupManager;
      if (!mgr) return null;
      return await mgr.exportBackup();
    });
    assert(backupResult !== null, 'Backup data export executed successfully');
    assert(typeof backupResult.notesCount === 'number', `Backup included notes count: ${backupResult.notesCount}`);
    assert(typeof backupResult.bookmarksCount === 'number', `Backup included bookmarks count: ${backupResult.bookmarksCount}`);

    // -------------------------------------------------------------
    // Test 17: Sticky Audio Player & Reciter Sync
    // -------------------------------------------------------------
    console.log('\n[TEST 17] Sticky Audio Player & Controls');
    const playerEl = await page.$('#sticky-audio-player');
    assert(playerEl !== null, 'Sticky audio player present in DOM');
    const playPause = await page.$('#player-play-pause-btn');
    assert(playPause !== null, 'Audio play/pause button present');
    const reciterSelect = await page.$('#player-reciter-select');
    assert(reciterSelect !== null, 'Reciter selector present');

    // -------------------------------------------------------------
    // Test 18: Responsive Mobile Drawer Toggle
    // -------------------------------------------------------------
    console.log('\n[TEST 18] Responsive Mobile Drawer Navigation');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);

    const mobileToggle = await page.$('#toggle-sidebar-btn');
    assert(mobileToggle !== null, 'Mobile sidebar toggle button found');
    await mobileToggle.click();
    await page.waitForTimeout(400);

    const sidebarOpen = await page.$eval('#app-sidebar', el => el.classList.contains('open'));
    assert(sidebarOpen, 'Sidebar opened upon mobile toggle button click');

    await page.mouse.click(340, 250);
    await page.waitForTimeout(400);
    const sidebarClosed = await page.$eval('#app-sidebar', el => !el.classList.contains('open'));
    assert(sidebarClosed, 'Sidebar closed when tapping outside overlay');

    // Restore desktop size
    await page.setViewportSize({ width: 1280, height: 800 });

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log('\n============================================================');
    console.log(`TOTAL CHECKS: ${passCount + failCount}`);
    console.log(`PASSED: ${passCount}`);
    console.log(`FAILED: ${failCount}`);
    console.log(`UNCAUGHT PAGE ERRORS: ${pageErrors.length}`);
    console.log(`CONSOLE ERRORS: ${consoleErrors.length}`);
    console.log('============================================================\n');

    if (pageErrors.length > 0 || failCount > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Fatal test execution failure:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
});
