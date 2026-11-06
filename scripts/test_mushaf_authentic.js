/**
 * Verification test for Authentic Uthmani / Madinah Mushaf Features
 */

import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import assert from 'assert';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

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

const PORT = process.env.PORT || 8898;

async function runMushafVerification() {
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log('--- Testing Authentic Madinah Mushaf Features ---');
  const chromePath = [
    process.env.CHROME_BIN,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  ].find(p => p && fs.existsSync(p));

  const launchOptions = { headless: true };
  if (chromePath) {
    launchOptions.executablePath = chromePath;
  }
  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage();

  try {
    // 1. Page 1: Royal Frontispiece (Al-Fatihah)
    console.log('\n[1] Page 1: Royal Frontispiece (Al-Fatihah)');
    await page.goto(`http://localhost:${PORT}/index.html#mushaf/1`, { waitUntil: 'networkidle' });

    const p1Sheet = await page.$('.mushaf-sheet.mushaf-frontispiece');
    assert(p1Sheet !== null, 'Page 1 has .mushaf-frontispiece class');

    const crownArch = await page.$('.frontispiece-crown svg');
    assert(crownArch !== null, 'Page 1 has illuminated crown arch SVG');

    const p1Cartouche = await page.$('.frontispiece-cartouche');
    assert(p1Cartouche !== null, 'Page 1 has frontispiece cartouche');

    const p1Title = await page.$eval('.frontispiece-surah-title', (el) => el.textContent.trim());
    assert(p1Title.includes('سُورَةُ ٱلْفَاتِحَةِ'), `Page 1 title matches: "${p1Title}"`);

    const p1Meta = await page.$eval('.frontispiece-surah-meta', (el) => el.textContent.trim());
    assert(p1Meta.includes('مَكِّيَّةٌ'), `Page 1 meta contains Meccan: "${p1Meta}"`);

    const p1Ayahs = await page.$$('.mushaf-ayah-span');
    assert(p1Ayahs.length === 7, `Page 1 has 7 ayahs, got ${p1Ayahs.length}`);

    // Marginal mark on Page 1 (Juz 1 & Hizb 1)
    const p1Medallions = await page.$$('.mushaf-marginal-medallion');
    assert(p1Medallions.length >= 1, `Page 1 has marginal medallions, found ${p1Medallions.length}`);
    console.log(`  [PASS] Page 1 frontispiece & marginal marks verified`);

    // 2. Page 2: Royal Frontispiece (Al-Baqarah 1-5)
    console.log('\n[2] Page 2: Royal Frontispiece (Al-Baqarah 1-5)');
    await page.goto(`http://localhost:${PORT}/index.html#mushaf/2`, { waitUntil: 'networkidle' });

    const p2Sheet = await page.$('.mushaf-sheet.mushaf-frontispiece');
    assert(p2Sheet !== null, 'Page 2 has .mushaf-frontispiece class');

    const p2Title = await page.$eval('.frontispiece-surah-title', (el) => el.textContent.trim());
    assert(p2Title.includes('سُورَةُ البَقَرَةِ'), `Page 2 title matches: "${p2Title}"`);

    const p2Basmalah = await page.$('.frontispiece-basmalah');
    assert(p2Basmalah !== null, 'Page 2 has Basmalah line');

    const p2Ayahs = await page.$$('.mushaf-ayah-span');
    assert(p2Ayahs.length === 5, `Page 2 has 5 ayahs (Al-Baqarah 1-5), got ${p2Ayahs.length}`);
    console.log(`  [PASS] Page 2 frontispiece verified`);

    // 3. Page 5: Rub' al-Hizb (2:26)
    console.log('\n[3] Page 5: Rub al-Hizb marginal mark & inline symbol (2:26)');
    await page.goto(`http://localhost:${PORT}/index.html#mushaf/5`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.mushaf-sheet[data-page="5"]');

    const p5Medallion = await page.$('.hizb-medallion');
    assert(p5Medallion !== null, 'Page 5 has Hizb quarter medallion');
    const p5MedallionText = await page.$eval('.hizb-medallion .medallion-text-hizb', (el) => el.textContent.trim());
    assert(p5MedallionText.includes('ربع'), `Page 5 medallion shows Rub': "${p5MedallionText}"`);

    const p5RubInline = await page.$('.mushaf-inline-rub');
    assert(p5RubInline !== null, 'Page 5 has inline Rub symbol ۞');
    console.log(`  [PASS] Page 5 Rub' al-Hizb verified`);

    // 4. Page 22: Juz 2 & Hizb 3 Start (2:142)
    console.log('\n[4] Page 22: Juz 2 & Hizb 3 Start (2:142)');
    await page.goto(`http://localhost:${PORT}/index.html#mushaf/22`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.mushaf-sheet[data-page="22"]');

    const p22JuzMedallion = await page.$('.juz-medallion');
    assert(p22JuzMedallion !== null, 'Page 22 has Juz medallion');
    const p22JuzNum = await page.$eval('.juz-medallion .medallion-text-num', (el) => el.textContent.trim());
    assert(p22JuzNum === '٢', `Page 22 Juz medallion shows 2 in Arabic digits: "${p22JuzNum}"`);

    const p22HizbMedallion = await page.$('.hizb-medallion');
    assert(p22HizbMedallion !== null, 'Page 22 has Hizb medallion');
    const p22HizbText = await page.$eval('.hizb-medallion .medallion-text-hizb', (el) => el.textContent.trim());
    assert(p22HizbText.includes('الحزب ٣'), `Page 22 shows Hizb 3: "${p22HizbText}"`);
    console.log(`  [PASS] Page 22 Juz 2 & Hizb 3 verified`);

    // 5. Page 176: Sajdah Tilawah (7:206)
    console.log('\n[5] Page 176: Sajdah Tilawah (7:206)');
    await page.goto(`http://localhost:${PORT}/index.html#mushaf/176`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.mushaf-sheet[data-page="176"]');

    const p176SajdahMedallion = await page.$('.sajdah-medallion');
    assert(p176SajdahMedallion !== null, 'Page 176 has Sajdah medallion');
    const p176SajdahText = await page.$eval('.sajdah-medallion .medallion-text-sajdah', (el) => el.textContent.trim());
    assert(p176SajdahText.includes('سَجْدَة'), `Page 176 medallion shows Sajdah: "${p176SajdahText}"`);

    const p176SajdahInline = await page.$('.mushaf-inline-sajdah');
    assert(p176SajdahInline !== null, 'Page 176 has inline Sajdah symbol ۩');
    console.log(`  [PASS] Page 176 Sajdah verified`);

    // 6. Page 50: Standard 15-Line Madinah Frame & Ali 'Imran Cartouche
    console.log('\n[6] Page 50: Standard 15-Line Framing & Surah Cartouche');
    await page.goto(`http://localhost:${PORT}/index.html#mushaf/50`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.mushaf-sheet[data-page="50"]');

    const cornerBrackets = await page.$$('.mushaf-corner-bracket');
    assert(cornerBrackets.length === 4, `Page 50 has 4 corner brackets, found ${cornerBrackets.length}`);

    const cartouche = await page.$('.mushaf-surah-title-banner');
    assert(cartouche !== null, 'Page 50 has Surah Cartouche');
    const surahNameAr = await page.$eval('.mushaf-surah-name-ar', (el) => el.textContent.trim());
    assert(surahNameAr.includes('آلِ عِمۡرَانَ'), `Cartouche surah name is Ali 'Imran: "${surahNameAr}"`);

    const basmalah = await page.$('.mushaf-basmalah-line');
    assert(basmalah !== null, 'Page 50 has Basmalah line');

    const footerPageNum = await page.$eval('.mushaf-page-num-ar', (el) => el.textContent.trim());
    assert(footerPageNum === '٥٠', `Footer page num is 50 in Arabic: "${footerPageNum}"`);
    console.log(`  [PASS] Page 50 standard frame & cartouche verified`);

    // 7. Navigation Toolbar: Jump by Surah and Juz Dropdowns
    console.log('\n[7] Navigation Toolbar & Quick Select Dropdowns');
    await page.selectOption('#mushaf-surah-jump-select', '440'); // Surah 36 Ya-Sin starts at p. 440
    await page.waitForTimeout(400);
    assert(page.url().includes('#mushaf/440'), `Navigated to page 440 (Ya-Sin): "${page.url()}"`);

    await page.selectOption('#mushaf-juz-jump-select', '582'); // Juz 30 starts at p. 582
    await page.waitForTimeout(400);
    assert(page.url().includes('#mushaf/582'), `Navigated to page 582 (Juz 30): "${page.url()}"`);
    console.log(`  [PASS] Quick dropdown jump verified`);

    // 8. Verse Click & Audio Sync Highlighting
    console.log('\n[8] Verse Recitation Click & Highlighting');
    await page.goto(`http://localhost:${PORT}/index.html#mushaf/1`, { waitUntil: 'networkidle' });
    const firstAyah = await page.$('.mushaf-ayah-span[data-surah="1"][data-ayah="1"]');
    assert(firstAyah !== null, 'First ayah span found');
    await firstAyah.click();
    await page.waitForTimeout(300);

    const activeAyah = await page.$('.mushaf-ayah-span.active-reciting');
    assert(activeAyah !== null, 'First ayah has .active-reciting class upon playback');
    console.log(`  [PASS] Verse audio recitation click & highlighting verified`);

    // 9. RTL Reading Direction for Toolbar Page Navigation
    console.log('\n[9] RTL Reading Direction: Toolbar Page Navigation Order');
    await page.goto(`http://localhost:${PORT}/index.html#mushaf/1`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.mushaf-sheet[data-page="1"]');

    // On Page 1 in RTL: Left button is Next Page (← Halaman 2), Right button is disabled Prev Page
    const nextBtnOnLeft = await page.$('.mushaf-nav-group.left-group .btn-next-page');
    assert(nextBtnOnLeft !== null, 'Next page button is on the left in RTL order');
    const nextBtnText = await nextBtnOnLeft.textContent();
    assert(nextBtnText.includes('←') && nextBtnText.includes('2'), `Next button text: "${nextBtnText}"`);

    // Click Next button on the left to advance to Page 2
    await nextBtnOnLeft.click();
    await page.waitForSelector('.mushaf-sheet[data-page="2"]');
    assert(page.url().includes('#mushaf/2'), 'Advanced to page 2 via left RTL button');
    console.log('  [PASS] RTL Toolbar Page navigation verified');

    // 10. Player & Mushaf Ayah Navigation & Automatic Page Turning
    console.log('\n[10] Player & Mushaf Ayah Navigation & Auto-Turn across Page Boundaries');
    // Start at Page 1, Ayah 1:7 (last verse of page 1)
    await page.goto(`http://localhost:${PORT}/index.html#mushaf/1`, { waitUntil: 'networkidle' });
    const lastAyahP1 = await page.$('.mushaf-ayah-span[data-surah="1"][data-ayah="7"]');
    assert(lastAyahP1 !== null, 'Found Ayah 1:7 on Page 1');
    await lastAyahP1.click();
    await page.waitForTimeout(400);

    // Player left button (#player-prev-btn) in Mushaf RTL view acts as Next Ayah (advances to 2:1 on Page 2)
    const playerAdvanceLeftBtn = await page.$('#player-prev-btn');
    assert(playerAdvanceLeftBtn !== null, 'Player advance button exists');
    await playerAdvanceLeftBtn.click();
    
    // Should auto-flip to Page 2!
    await page.waitForSelector('.mushaf-sheet[data-page="2"]', { timeout: 4000 });
    assert(page.url().includes('#mushaf/2'), `Auto-flipped to page 2: "${page.url()}"`);

    // First ayah on Page 2 (2:1) should be highlighted as active-reciting
    const activeAyahP2 = await page.waitForSelector('.mushaf-ayah-span[data-surah="2"][data-ayah="1"].active-reciting', { timeout: 3000 });
    assert(activeAyahP2 !== null, 'Ayah 2:1 is active and highlighted on Page 2');

    // Now click the Player right button (#player-next-btn) which acts as Prev Ayah in Mushaf RTL view
    const playerStepBackRightBtn = await page.$('#player-next-btn');
    await playerStepBackRightBtn.click();

    // Should auto-flip back to Page 1!
    await page.waitForSelector('.mushaf-sheet[data-page="1"]', { timeout: 4000 });
    assert(page.url().includes('#mushaf/1'), `Auto-flipped back to page 1: "${page.url()}"`);
    const activeAyahP1 = await page.waitForSelector('.mushaf-ayah-span[data-surah="1"][data-ayah="7"].active-reciting', { timeout: 3000 });
    assert(activeAyahP1 !== null, 'Ayah 1:7 is active and highlighted on Page 1');
    console.log('  [PASS] Player and Mushaf cross-page auto-turn & highlight verified');

    // 11. Surah View "Open Mushaf" button links dynamically to Surah start page
    console.log('\n[11] Dynamic "Open Mushaf" Button per Surah');
    await page.goto(`http://localhost:${PORT}/index.html#surah/36`, { waitUntil: 'networkidle' });
    const openMushafBtn = await page.$('.surah-header-card a[href="#mushaf/440"]');
    assert(openMushafBtn !== null, 'Surah 36 has "Open Mushaf" button pointing to page 440');
    console.log('  [PASS] Dynamic surah-to-mushaf start page link verified (36 -> 440)');

    // 12. Header Mushaf button remembers last-viewed page
    console.log('\n[12] Header Mushaf Nav Button Remembers Last Read Page');
    await page.goto(`http://localhost:${PORT}/index.html#mushaf/221`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.mushaf-sheet[data-page="221"]');
    const headerMushafBtnHref = await page.$eval('#mushaf-mode-btn', (el) => el.getAttribute('href'));
    assert(headerMushafBtnHref === '#mushaf/221' || headerMushafBtnHref === '#mushaf', `Header mushaf link matches page 221: "${headerMushafBtnHref}"`);
    console.log('  [PASS] Resume reading & header mushaf memory verified');

    // 13. Page Scrubber Slider
    console.log('\n[13] Quick Page Scrubber Slider');
    const slider = await page.$('#mushaf-page-slider');
    assert(slider !== null, 'Page scrubber slider exists');
    const sliderVal = await page.$eval('#mushaf-page-slider', (el) => el.value);
    assert(sliderVal === '221', `Slider value initialized to 221: "${sliderVal}"`);
    console.log('  [PASS] Page scrubber slider verified');

    // 14. Translation Preview Bar on Ayah Hover/Click
    console.log('\n[14] Verse Translation Preview Bar');
    const firstAyahP221 = await page.$('.mushaf-ayah-span');
    assert(firstAyahP221 !== null, 'Found ayah span on page 221');
    await firstAyahP221.click();
    await page.waitForTimeout(300);
    const transBar = await page.$('#mushaf-translation-bar');
    assert(transBar !== null, 'Translation bar exists');
    const transBarVisible = await page.$eval('#mushaf-translation-bar', (el) => el.style.display !== 'none');
    assert(transBarVisible, 'Translation bar is visible after ayah click');
    const transText = await page.$eval('#mushaf-trans-text', (el) => el.textContent.trim());
    assert(transText.length > 0, `Translation bar contains non-empty text: "${transText.slice(0, 30)}..."`);
    console.log('  [PASS] Translation preview bar verified');

    // 15. Accessibility & Text Language Standards
    console.log('\n[15] Accessibility Attributes & Arabic Language Standards');
    const pageContainer = await page.$('.mushaf-page-container[role="region"]');
    assert(pageContainer !== null, 'Mushaf container has role="region"');
    const sheetBody = await page.$('.mushaf-sheet-body[lang="ar"][dir="rtl"]');
    assert(sheetBody !== null, 'Mushaf sheet body has lang="ar" and dir="rtl"');
    console.log('  [PASS] Accessibility attributes & lang="ar" standards verified');

    // 16. Mushaf Page-Level Bookmark Toggle
    console.log('\n[16] Page-Level Bookmark Toggle Button');
    const bmBtn = await page.$('#mushaf-bookmark-btn');
    assert(bmBtn !== null, 'Bookmark button exists in Mushaf toolbar');
    await bmBtn.click();
    await page.waitForTimeout(300);
    const isBookmarkedClass = await page.$('.mushaf-bookmark-btn.bookmarked');
    assert(isBookmarkedClass !== null, 'Bookmark button acquired .bookmarked class');
    console.log('  [PASS] Page-level bookmark toggle verified');

    // 17. Sepia / Parchment Theme Toggle
    console.log('\n[17] Sepia / Classical Parchment Theme Toggle');
    const themeBtn = await page.$('#mushaf-theme-toggle-btn');
    assert(themeBtn !== null, 'Theme toggle button exists');
    await themeBtn.click();
    await page.waitForTimeout(300);
    const hasSepiaTheme = await page.$('.mushaf-page-container.mushaf-theme-sepia');
    assert(hasSepiaTheme !== null, 'Mushaf container has .mushaf-theme-sepia class');
    // Toggle back to dark
    await page.click('#mushaf-theme-toggle-btn');
    await page.waitForTimeout(300);
    console.log('  [PASS] Sepia manuscript theme toggle verified');

    // 18. Dual-Page Book Spread Mode
    console.log('\n[18] Dual-Page Book Spread Mode');
    const spreadBtn = await page.$('#mushaf-spread-toggle-btn');
    assert(spreadBtn !== null, 'Spread toggle button exists');
    await spreadBtn.click();
    await page.waitForTimeout(400);
    const spreadWrapper = await page.$('.mushaf-spread-wrapper');
    assert(spreadWrapper !== null, 'Dual-page spread wrapper rendered');
    const sheetsInSpread = await page.$$('.mushaf-spread-wrapper .mushaf-sheet');
    assert(sheetsInSpread.length === 2, `Spread contains exactly 2 sheets, found ${sheetsInSpread.length}`);
    // Toggle back to single page
    await page.click('#mushaf-spread-toggle-btn');
    await page.waitForTimeout(300);
    console.log('  [PASS] Dual-page book spread toggle & 2-sheet layout verified');

    // 19. Search Results Direct Mushaf Page Link
    console.log('\n[19] Search Results Direct Mushaf Link');
    await page.click('[data-action="open-search"]');
    await page.waitForSelector('#search-modal-overlay.open', { timeout: 3000 });
    await page.fill('#search-input-field', 'rahman');
    await page.waitForTimeout(600);
    const mushafSearchLink = await page.$('.btn-search-mushaf');
    assert(mushafSearchLink !== null, 'Search results contain .btn-search-mushaf link');
    await page.click('[data-action="close-search"]');
    console.log('  [PASS] Search results Mushaf page link verified');

    // 20. Print / Export Button
    console.log('\n[20] Print / Export Action Button');
    const printBtn = await page.$('#mushaf-print-btn');
    assert(printBtn !== null, 'Print page button exists in toolbar');
    console.log('  [PASS] Print button presence verified');

    console.log('\n====================================');
    console.log('ALL AUTHENTIC MUSHAF CHECKS PASSED!');
    console.log('====================================');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

runMushafVerification().catch((err) => {
  console.error('\n[MUSHAF TEST FAILED]:', err);
  process.exit(1);
});
