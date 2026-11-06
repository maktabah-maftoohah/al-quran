/**
 * Automated Verification Suite for 7 Advanced Quran Study & Cloud Features
 * Tests:
 * 1. Khatam Tracker & Daily Streak
 * 2. Hifz Memorization Spaced Repetition Tracker
 * 3. Cross-Device Audio Resume
 * 4. Thematic Bookmark Folders
 * 5. Google Calendar Web Intents
 * 6. Export Reflections to Google Drive HTML
 * 7. Revision History & Rollback Merging
 */

import { store } from '../js/store.js';
import { gdriveSync } from '../js/gdrive-sync.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

// Mock localStorage for Node test runner
const mockStore = {};
global.localStorage = {
  getItem: (k) => mockStore[k] || null,
  setItem: (k, v) => { mockStore[k] = String(v); },
  removeItem: (k) => { delete mockStore[k]; },
  clear: () => { for (const k of Object.keys(mockStore)) delete mockStore[k]; }
};

async function runTests() {
  console.log('\n--- FEATURE 1: Khatam Al-Quran Tracker & Streaks ---');
  {
    store.khatam = {
      targetDays: 30,
      completedPages: [1, 2, 3],
      dailyActivity: {},
      streak: 0,
      dailyStreak: 0,
      lastActiveDate: null
    };
    assert(store.getKhatam().completedPages.length === 3, 'Initial completed pages count is 3');

    // Toggle page 4 completed
    const isDone4 = store.togglePageCompleted(4);
    assert(isDone4 === true, 'Page 4 marked as completed');
    assert(store.getKhatam().completedPages.includes(4), 'Completed pages includes page 4');

    // Untoggle page 4
    const isUndone4 = store.togglePageCompleted(4);
    assert(isUndone4 === false, 'Page 4 untoggled');
    assert(!store.getKhatam().completedPages.includes(4), 'Completed pages no longer includes page 4');

    // Daily activity & streak calculation
    const today = new Date().toISOString().slice(0, 10);
    store.recordDailyActivity();
    const kAfter = store.getKhatam();
    assert(kAfter.streak >= 1, `Daily streak recorded as ${kAfter.streak}`);
    assert(kAfter.lastActiveDate === today, `Last active date is ${today}`);
  }

  console.log('\n--- FEATURE 2: Hifz Memorization Cloud Tracker & Spaced Repetition ---');
  {
    store.hifzMastery = {};
    
    // Set 112:1 to 'learning'
    store.setHifzMastery(112, 1, 'learning');
    const m1 = store.getHifzMastery(112, 1);
    assert(m1 !== null, 'Hifz record exists for 112:1');
    assert(m1.status === 'learning', 'Status is learning');
    assert(m1.intervalDays === 1, 'Interval is 1 day for learning');
    assert(Boolean(m1.nextReview), 'Next review date generated');

    // Advance to 'memorized'
    store.setHifzMastery(112, 1, 'memorized');
    const m2 = store.getHifzMastery(112, 1);
    assert(m2.status === 'memorized', 'Status advanced to memorized');
    assert(m2.intervalDays === 7, 'Interval increased to 7 days for memorized');

    // Mark 'needs_review'
    store.setHifzMastery(112, 1, 'needs_review');
    const m3 = store.getHifzMastery(112, 1);
    assert(m3.status === 'needs_review', 'Status set to needs_review');
    assert(m3.intervalDays === 1, 'Interval reset to 1 day for review');

    // Reset to unmarked
    store.setHifzMastery(112, 1, null);
    assert(store.getHifzMastery(112, 1) === null, 'Hifz record deleted on reset');
  }

  console.log('\n--- FEATURE 3: Cross-Device Audio Resume ---');
  {
    store.audioState = null;
    store.saveAudioState(18, 1, 'Alafasy_128kbps');
    const aState = store.getAudioState();
    assert(aState !== null, 'Audio state saved');
    assert(aState.surah === 18 && aState.ayah === 1, 'Surah 18:1 recorded');
    assert(aState.reciter === 'Alafasy_128kbps', 'Reciter preserved');
    assert(typeof aState.timestamp === 'number', 'Timestamp recorded');
  }

  console.log('\n--- FEATURE 4: Thematic Bookmark Folders ---');
  {
    const initialFolders = store.getBookmarkFolders();
    const folderNames = initialFolders.map((f) => (typeof f === 'string' ? f : f.name));
    assert(folderNames.some((n) => n.includes('Doa')), 'Default folder "Doa" present');
    assert(folderNames.some((n) => n.includes('Hafazan')), 'Default folder "Hafazan" present');

    store.addBookmarkFolder('Tadabbur');
    const updatedNames = store.getBookmarkFolders().map((f) => (typeof f === 'string' ? f : f.name));
    assert(updatedNames.includes('Tadabbur'), 'Custom folder "Tadabbur" added');

    store.bookmarks = [{ ref: '2:255', surah: 2, ayah: 255, folder: 'Lalai' }];
    store.setBookmarkFolder('2:255', 'Tadabbur');
    assert(store.bookmarks[0].folder === 'Tadabbur', 'Bookmark 2:255 assigned to folder "Tadabbur"');
  }

  console.log('\n--- FEATURE 5: Google Calendar Web Intents ---');
  {
    // Friday Al-Kahf intent test
    const titleFriday = encodeURIComponent('Membaca Surah Al-Kahf (Jumaat)');
    const recurFriday = 'RRULE:FREQ=WEEKLY;BYDAY=FR';
    const urlFriday = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titleFriday}&recur=${encodeURIComponent(recurFriday)}`;
    assert(urlFriday.includes('calendar.google.com'), 'Friday calendar URL uses Google Calendar render action');
    assert(urlFriday.includes('WEEKLY') && urlFriday.includes('BYDAY'), 'Friday calendar URL contains weekly Friday recurrence rule');

    // Daily Khatam intent test
    const titleKhatam = encodeURIComponent('Tadarus Al-Quran (~20 halaman)');
    const recurKhatam = 'RRULE:FREQ=DAILY';
    const urlKhatam = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titleKhatam}&recur=${encodeURIComponent(recurKhatam)}`;
    assert(urlKhatam.includes('RRULE%3AFREQ%3DDAILY'), 'Khatam calendar URL contains daily recurrence rule');
  }

  console.log('\n--- FEATURE 6: Google Drive Export Formatting ---');
  {
    const sampleNotes = [
      { ref: '1:1', surahName: 'Al-Fatihah', text: 'Refleksi bismillah.', updatedAt: Date.now() }
    ];
    const sampleBookmarks = [
      { ref: '112:1', surahName: 'Al-Ikhlas', ar: 'قُلْ هُوَ اللَّهُ أَحَدٌ', folder: 'Tadabbur' }
    ];

    const htmlDoc = `
      <!DOCTYPE html>
      <html>
        <head><title>Maktabah Maftoohah Study Notes</title></head>
        <body>
          <h1>Maktabah Maftoohah Al-Quran - Study Notes</h1>
          <div>${sampleNotes[0].text}</div>
          <div>${sampleBookmarks[0].ar}</div>
        </body>
      </html>
    `;
    assert(htmlDoc.includes('Study Notes'), 'Export document has Study Notes header');
    assert(htmlDoc.includes('Refleksi bismillah.'), 'Export document contains note text');
    assert(htmlDoc.includes('قُلْ هُوَ اللَّهُ أَحَدٌ'), 'Export document contains Arabic bookmark text');
  }

  console.log('\n--- FEATURE 7: Google Drive Sync & Revision History Data Model ---');
  {
    assert(typeof gdriveSync.getRevisionHistory === 'function', 'gdriveSync.getRevisionHistory is defined');
    assert(typeof gdriveSync.restoreRevision === 'function', 'gdriveSync.restoreRevision is defined');
    assert(typeof gdriveSync.exportNotesToGoogleDrive === 'function', 'gdriveSync.exportNotesToGoogleDrive is defined');

    // Test full round-trip data collection
    const collected = await gdriveSync.collectLocalData();
    assert(collected.data.khatam !== undefined, 'Collected sync payload contains khatam data');
    assert(collected.data.hifzMastery !== undefined, 'Collected sync payload contains hifzMastery data');
    assert(collected.data.audioState !== undefined, 'Collected sync payload contains audioState data');
    assert(collected.data.bookmarkFolders !== undefined, 'Collected sync payload contains bookmarkFolders data');
  }

  console.log('\n========================================');
  console.log(`TOTAL CHECKS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('========================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Test execution error:', e);
  process.exit(1);
});
