/**
 * Maktabah Maftoohah Al-Quran - Data Backup & Restore Engine (backup.js)
 * Manages 1-click JSON export and restore for personal study notes, bookmarks, and settings.
 * Pure vanilla ES6, zero external dependencies.
 */

import { store } from './store.js';
import { storageDB } from './storage-db.js';

class BackupManager {
  /**
   * Bundles all client data (IndexedDB notes, bookmarks, settings, last read) into a downloadable JSON file.
   */
  async exportBackup() {
    const notes = await storageDB.getAllNotes();
    const bookmarks = store.bookmarks || [];
    const settings = store.settings || {};
    const lastRead = store.getLastRead();

    const backupData = {
      app: 'maktabah-maftoohah-al-quran',
      version: 1,
      exportedAt: new Date().toISOString(),
      counts: {
        notes: notes.length,
        bookmarks: bookmarks.length,
      },
      data: {
        notes,
        bookmarks,
        settings,
        lastRead,
      },
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.href = url;
    link.download = `maktabah-quran-backup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      notesCount: notes.length,
      bookmarksCount: bookmarks.length,
    };
  }

  /**
   * Imports and restores a backup JSON file into IndexedDB and localStorage.
   */
  async importBackup(file) {
    if (!file) throw new Error('No file provided');

    const text = await file.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error('Invalid JSON backup file');
    }

    if (parsed.app !== 'maktabah-maftoohah-al-quran' || !parsed.data) {
      throw new Error('File is not a valid Maktabah Maftoohah Quran backup');
    }

    const { notes = [], bookmarks = [], settings, lastRead } = parsed.data;

    // 1. Restore Bookmarks to store & localStorage
    if (Array.isArray(bookmarks)) {
      const existingRefs = new Set((store.bookmarks || []).map((b) => b.ref));
      for (const bm of bookmarks) {
        if (!existingRefs.has(bm.ref)) {
          store.bookmarks.push(bm);
        }
      }
      try {
        localStorage.setItem('maktabah_quran_bookmarks', JSON.stringify(store.bookmarks));
      } catch (e) {
        console.warn('Failed to save bookmarks:', e);
      }
    }

    // 2. Restore Notes to IndexedDB
    let notesRestored = 0;
    if (Array.isArray(notes)) {
      for (const note of notes) {
        if (note.ref && note.text) {
          await storageDB.saveNote(note.ref, {
            surah: note.surah,
            ayah: note.ayah,
            surahName: note.surahName,
            ar: note.ar,
            translation: note.translation,
            text: note.text,
          });
          notesRestored++;
        }
      }
    }

    // 3. Restore Settings if present
    if (settings && typeof settings === 'object') {
      store.updateSettings(settings);
    }

    // 4. Restore Last Read if present
    if (lastRead && lastRead.surah) {
      store.setLastRead(lastRead.surah, lastRead.ayah, lastRead.surahName);
    }

    return {
      notesCount: notesRestored,
      bookmarksCount: bookmarks.length,
    };
  }
}

export const backupManager = new BackupManager();
