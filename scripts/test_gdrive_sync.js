/**
 * Test Suite: Google Drive Sync & Conflict Resolution Engine
 */

if (typeof localStorage === 'undefined') {
  const storeMap = new Map();
  globalThis.localStorage = {
    getItem(k) { return storeMap.get(k) || null; },
    setItem(k, v) { storeMap.set(k, String(v)); },
    removeItem(k) { storeMap.delete(k); },
    clear() { storeMap.clear(); },
  };
}

import { APP_CONFIG } from '../js/config.js';
import { gdriveSync } from '../js/gdrive-sync.js';
import { store } from '../js/store.js';

let passes = 0;
let fails = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passes++;
  } else {
    console.error(`  [FAIL] ${message}`);
    fails++;
  }
}

console.log('--- TEST 1: Configuration & Client ID ---');
assert(
  APP_CONFIG.getGoogleClientId() === '850493350755-g12kg4snt6h6uacmgb40jcoqk3o6kmgt.apps.googleusercontent.com',
  'Default Google Client ID is configured correctly'
);

console.log('\n--- TEST 2: Conflict Resolution & Merging ---');
const localNotes = [
  { ref: '1:1', surah: 1, ayah: 1, text: 'Local Note 1', updatedAt: 1000 },
  { ref: '2:255', surah: 2, ayah: 255, text: 'Ayatul Kursi Local', updatedAt: 3000 },
];
store.bookmarks = [
  { ref: '1:1', surah: 1, ayah: 1 },
  { ref: '2:255', surah: 2, ayah: 255 },
];
store.lastRead = { surah: 1, ayah: 1, timestamp: 1000 };

const remotePayload = {
  app: 'maktabah-maftoohah-al-quran',
  version: 1,
  data: {
    notes: [
      // Older remote note should NOT overwrite newer local
      { ref: '1:1', surah: 1, ayah: 1, text: 'Remote Note 1 Older', updatedAt: 500 },
      // Newer remote note SHOULD overwrite older local
      { ref: '2:255', surah: 2, ayah: 255, text: 'Ayatul Kursi Remote Newer', updatedAt: 5000 },
      // New note from remote
      { ref: '3:18', surah: 3, ayah: 18, text: 'Shahidallah', updatedAt: 4000 },
    ],
    bookmarks: [
      { ref: '1:1', surah: 1, ayah: 1 },
      { ref: '36:1', surah: 36, ayah: 1 }, // New bookmark from remote
    ],
    lastRead: { surah: 2, ayah: 255, timestamp: 2000 }, // Newer remote lastRead
    khatam: {
      completedPages: [1, 2, 3],
      dailyStreak: 7,
      lastActiveDate: '2026-11-06',
    },
    hifzMastery: {
      '112:1': { ref: '112:1', status: 'memorized', level: 3, updatedAt: 5000 },
    },
    audioState: {
      surah: 18,
      ayah: 10,
      reciter: 'Alafasy_128kbps',
      timestamp: 3000,
    },
    bookmarkFolders: [
      { id: 'f_custom', name: 'Ayat Syukur', icon: '🤲' },
    ],
  },
};

// Mock storageDB in test environment
const mockStorage = new Map(localNotes.map((n) => [n.ref, n]));
gdriveSync.storage = {
  async getAllNotes() {
    return Array.from(mockStorage.values());
  },
  async saveNote(ref, data) {
    mockStorage.set(ref, data);
    return true;
  },
};

const merged = await gdriveSync.mergeData(remotePayload);

assert(store.bookmarks.some((b) => b.ref === '36:1'), 'Remote bookmark 36:1 merged into local bookmarks');
assert(store.bookmarks.length === 3, 'Total bookmarks count is 3 (set union without duplicates)');
assert(store.getLastRead().surah === 2, 'Newer remote reading progress (Surah 2) accepted');

const note1 = mockStorage.get('1:1');
assert(note1.text === 'Local Note 1', 'Newer local note 1:1 preserved');

const note2 = mockStorage.get('2:255');
assert(note2.text === 'Ayatul Kursi Remote Newer', 'Newer remote note 2:255 accepted');

const note3 = mockStorage.get('3:18');
assert(note3 && note3.text === 'Shahidallah', 'New remote note 3:18 imported');

assert(store.getKhatam().dailyStreak === 7, 'Khatam streak merged correctly (7 days)');
assert(store.getKhatam().completedPages.includes(2), 'Khatam completed page 2 merged');
assert(store.getHifzMastery('112:1')?.status === 'memorized', 'Hifz mastery for 112:1 merged');
assert(store.getAudioState()?.surah === 18, 'Audio resume state for Surah 18 merged');
assert(store.getBookmarkFolders().some((f) => f.id === 'f_custom'), 'Custom bookmark folder merged');

console.log(`\n================================`);
console.log(`TOTAL: ${passes + fails}, PASSED: ${passes}, FAILED: ${fails}`);
console.log(`================================`);

if (fails > 0) process.exit(1);
