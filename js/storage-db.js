/**
 * Maktabah Maftoohah Al-Quran - IndexedDB Storage Engine (storage-db.js)
 * Manages persistent client-side storage for offline audio blobs and personal study notes.
 * Strictly vanilla ES6, zero external dependencies.
 */

export class StorageDB {
  constructor() {
    this.dbName = 'maktabah_quran_idb';
    this.version = 1;
    this.db = null;
    this.initPromise = null;
  }

  /**
   * Initializes the IndexedDB database instance.
   */
  async init() {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve) => {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        console.warn('IndexedDB is not supported in this browser environment.');
        return resolve(null);
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 1. Audio blobs store for offline recitation
        if (!db.objectStoreNames.contains('audio')) {
          const audioStore = db.createObjectStore('audio', { keyPath: 'key' });
          audioStore.createIndex('reciter_surah', ['reciter', 'surah'], { unique: false });
          audioStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 2. Personal study notes & verse reflections store
        if (!db.objectStoreNames.contains('notes')) {
          const notesStore = db.createObjectStore('notes', { keyPath: 'ref' });
          notesStore.createIndex('surah', 'surah', { unique: false });
          notesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.warn('Failed to open IndexedDB:', event.target.error);
        resolve(null);
      };
    });

    return this.initPromise;
  }

  // ==========================================
  // Audio Blobs Storage (Offline Audio Engine)
  // ==========================================

  /**
   * Retrieves an audio blob for a specific verse recitation.
   */
  async getAudio(reciter, surah, ayah) {
    const db = await this.init();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const key = `${reciter}:${surah}:${ayah}`;
        const tx = db.transaction('audio', 'readonly');
        const store = tx.objectStore('audio');
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ? req.result.blob : null);
        req.onerror = () => resolve(null);
      } catch (err) {
        console.warn('getAudio error:', err);
        resolve(null);
      }
    });
  }

  /**
   * Saves an audio blob into IndexedDB for offline access.
   */
  async saveAudio(reciter, surah, ayah, blob) {
    const db = await this.init();
    if (!db || !blob) return false;

    return new Promise((resolve) => {
      try {
        const key = `${reciter}:${surah}:${ayah}`;
        const sNum = parseInt(surah, 10);
        const aNum = parseInt(ayah, 10);
        const tx = db.transaction('audio', 'readwrite');
        const store = tx.objectStore('audio');
        const record = {
          key,
          reciter,
          surah: sNum,
          ayah: aNum,
          blob,
          size: blob.size,
          timestamp: Date.now(),
        };
        const req = store.put(record);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (err) {
        console.warn('saveAudio error:', err);
        resolve(false);
      }
    });
  }

  /**
   * Returns count of cached verses for a given Surah and reciter.
   */
  async getSurahAudioCount(reciter, surah) {
    const db = await this.init();
    if (!db) return 0;

    return new Promise((resolve) => {
      try {
        const sNum = parseInt(surah, 10);
        const tx = db.transaction('audio', 'readonly');
        const index = tx.objectStore('audio').index('reciter_surah');
        const req = index.count(IDBKeyRange.only([reciter, sNum]));
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => resolve(0);
      } catch (err) {
        resolve(0);
      }
    });
  }

  /**
   * Deletes all cached audio for a specific Surah and reciter.
   */
  async deleteSurahAudio(reciter, surah) {
    const db = await this.init();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const sNum = parseInt(surah, 10);
        const tx = db.transaction('audio', 'readwrite');
        const store = tx.objectStore('audio');
        const index = store.index('reciter_surah');
        const req = index.openKeyCursor(IDBKeyRange.only([reciter, sNum]));

        req.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            store.delete(cursor.primaryKey);
            cursor.continue();
          } else {
            resolve(true);
          }
        };
        req.onerror = () => resolve(false);
      } catch (err) {
        resolve(false);
      }
    });
  }

  /**
   * Computes total storage statistics for cached audio.
   */
  async getAudioStorageStats() {
    const db = await this.init();
    if (!db) return { count: 0, bytes: 0 };

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('audio', 'readonly');
        const store = tx.objectStore('audio');
        const req = store.openCursor();
        let count = 0;
        let bytes = 0;

        req.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            count++;
            bytes += cursor.value.size || 0;
            cursor.continue();
          } else {
            resolve({ count, bytes });
          }
        };
        req.onerror = () => resolve({ count: 0, bytes: 0 });
      } catch (err) {
        resolve({ count: 0, bytes: 0 });
      }
    });
  }

  /**
   * Deletes all cached audio across all reciters.
   */
  async clearAllAudio() {
    const db = await this.init();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('audio', 'readwrite');
        const store = tx.objectStore('audio');
        const req = store.clear();
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (err) {
        resolve(false);
      }
    });
  }

  // ==========================================
  // Personal Study Notes & Reflections Store
  // ==========================================

  /**
   * Retrieves a personal note for a specific verse.
   */
  async getNote(ref) {
    const db = await this.init();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('notes', 'readonly');
        const store = tx.objectStore('notes');
        const req = store.get(ref);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  }

  /**
   * Saves or updates a personal study note.
   */
  async saveNote(ref, data) {
    const db = await this.init();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('notes', 'readwrite');
        const store = tx.objectStore('notes');
        const record = {
          ref,
          surah: data.surah,
          ayah: data.ayah,
          surahName: data.surahName || `Surah ${data.surah}`,
          ar: data.ar || '',
          translation: data.translation || '',
          text: data.text || '',
          updatedAt: Date.now(),
        };
        const req = store.put(record);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (err) {
        resolve(false);
      }
    });
  }

  /**
   * Deletes a personal study note.
   */
  async deleteNote(ref) {
    const db = await this.init();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('notes', 'readwrite');
        const store = tx.objectStore('notes');
        const req = store.delete(ref);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (err) {
        resolve(false);
      }
    });
  }

  /**
   * Retrieves all study notes ordered by most recently updated.
   */
  async getAllNotes() {
    const db = await this.init();
    if (!db) return [];

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('notes', 'readonly');
        const store = tx.objectStore('notes');
        const index = store.index('updatedAt');
        const req = index.openCursor(null, 'prev');
        const results = [];

        req.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        req.onerror = () => resolve([]);
      } catch (err) {
        resolve([]);
      }
    });
  }
}

export const storageDB = new StorageDB();
