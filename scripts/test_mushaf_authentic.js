/**
 * Verification test for Authentic Uthmani / Madinah Mushaf Features
 */

import { chromium } from 'playwright';
import assert from 'assert';

const PORT = process.env.PORT || 8000;

async function runMushafVerification() {
  console.log('--- Testing Authentic Madinah Mushaf Features ---');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
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

    console.log('\n====================================');
    console.log('ALL AUTHENTIC MUSHAF CHECKS PASSED!');
    console.log('====================================');
  } finally {
    await browser.close();
  }
}

runMushafVerification().catch((err) => {
  console.error('\n[MUSHAF TEST FAILED]:', err);
  process.exit(1);
});
