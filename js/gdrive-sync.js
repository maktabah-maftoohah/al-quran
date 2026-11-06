/**
 * Maktabah Maftoohah Al-Quran - Google Drive Sync Engine (gdrive-sync.js)
 * Synchronizes personal notes, bookmarks, settings, and reading progress using
 * Google Drive's sandboxed appDataFolder.
 * Pure vanilla ES6, zero external dependencies.
 */

import { APP_CONFIG } from './config.js';
import { store } from './store.js';
import { storageDB } from './storage-db.js';

class GDriveSyncManager {
  constructor() {
    this.accessToken = null;
    this.tokenExpiresAt = 0;
    this.userEmail = null;
    this.syncFileId = null;
    this.lastSyncedAt = null;
    this.isSyncing = false;
    this.listeners = new Set();
    this.debounceTimer = null;
    this.storage = storageDB;

    this.loadPersistedState();
  }

  /**
   * Loads cached sync metadata from localStorage.
   */
  loadPersistedState() {
    try {
      if (typeof localStorage === 'undefined') return;
      const saved = localStorage.getItem('maktabah_gdrive_sync_meta');
      if (saved) {
        const meta = JSON.parse(saved);
        this.userEmail = meta.userEmail || null;
        this.syncFileId = meta.syncFileId || null;
        this.lastSyncedAt = meta.lastSyncedAt ? new Date(meta.lastSyncedAt) : null;
      }
    } catch (e) {
      console.warn('Failed to load gdrive sync metadata:', e);
    }
  }

  /**
   * Saves sync metadata to localStorage.
   */
  savePersistedState() {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem('maktabah_gdrive_sync_meta', JSON.stringify({
        userEmail: this.userEmail,
        syncFileId: this.syncFileId,
        lastSyncedAt: this.lastSyncedAt ? this.lastSyncedAt.toISOString() : null,
      }));
    } catch (e) {
      console.warn('Failed to save gdrive sync metadata:', e);
    }
  }

  /**
   * Registers a listener callback for sync status changes.
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Emits state changes to all subscribers.
   */
  emit(event) {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Sync listener error:', err);
      }
    }
  }

  /**
   * Checks whether the user is currently connected to Google Drive.
   */
  isConnected() {
    return Boolean(this.accessToken && Date.now() < this.tokenExpiresAt);
  }

  /**
   * Returns whether a previous connection exists (even if token expired and needs silent refresh).
   */
  hasSavedSession() {
    return Boolean(this.userEmail);
  }

  /**
   * Ensures Google Identity Services (GIS) library is loaded.
   */
  async ensureGisLoaded() {
    if (window.google?.accounts?.oauth2) return true;

    return new Promise((resolve) => {
      let script = document.getElementById('gsi-client-script');
      if (!script) {
        script = document.createElement('script');
        script.id = 'gsi-client-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.google?.accounts?.oauth2) {
          clearInterval(checkInterval);
          resolve(true);
        } else if (attempts > 30) {
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 100);
    });
  }

  /**
   * Initiates Google Drive OAuth2 flow.
   */
  async connect(interactive = true) {
    const clientId = APP_CONFIG.getGoogleClientId();
    if (!clientId) {
      const err = new Error('Google Client ID is not configured.');
      this.emit({ type: 'error', error: err.message, code: 'MISSING_CLIENT_ID' });
      throw err;
    }

    const gisReady = await this.ensureGisLoaded();
    if (!gisReady) {
      const err = new Error('Google Identity Services script failed to load. Check your network connection.');
      this.emit({ type: 'error', error: err.message, code: 'GIS_UNAVAILABLE' });
      throw err;
    }

    this.emit({ type: 'connecting' });

    return new Promise((resolve, reject) => {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: APP_CONFIG.googleDriveScope,
          prompt: interactive ? '' : 'none',
          callback: async (resp) => {
            if (resp.error) {
              this.emit({ type: 'error', error: resp.error, code: 'AUTH_FAILED' });
              return reject(new Error(resp.error_description || resp.error));
            }

            this.accessToken = resp.access_token;
            this.tokenExpiresAt = Date.now() + (parseInt(resp.expires_in, 10) || 3599) * 1000;

            // Fetch user profile info if available
            await this.fetchUserInfo();
            this.savePersistedState();

            this.emit({ type: 'connected', email: this.userEmail });

            // Perform initial bidirectional sync
            try {
              await this.sync();
              resolve(true);
            } catch (syncErr) {
              console.warn('Initial sync warning:', syncErr);
              resolve(true);
            }
          },
          error_callback: (err) => {
            this.emit({ type: 'error', error: err.message || 'OAuth error', code: 'POPUP_FAILED' });
            reject(err);
          },
        });

        tokenClient.requestAccessToken({ prompt: interactive ? '' : 'none' });
      } catch (err) {
        this.emit({ type: 'error', error: err.message, code: 'INIT_FAILED' });
        reject(err);
      }
    });
  }

  /**
   * Fetches user email/profile from Google API.
   */
  async fetchUserInfo() {
    if (!this.accessToken) return;
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        this.userEmail = data.email || null;
      }
    } catch {
      // Userinfo is supplementary; ignore failure
    }
  }

  /**
   * Disconnects Google Drive sync and revokes access token.
   */
  async disconnect() {
    if (this.accessToken && window.google?.accounts?.oauth2?.revoke) {
      try {
        window.google.accounts.oauth2.revoke(this.accessToken, () => {});
      } catch (e) {
        console.warn('Failed to revoke Google token:', e);
      }
    }

    this.accessToken = null;
    this.tokenExpiresAt = 0;
    this.userEmail = null;
    this.syncFileId = null;
    this.lastSyncedAt = null;

    try {
      localStorage.removeItem('maktabah_gdrive_sync_meta');
    } catch {}

    this.emit({ type: 'disconnected' });
  }

  /**
   * Ensures a valid access token exists before performing Drive API calls.
   */
  async ensureToken() {
    if (this.isConnected()) return this.accessToken;

    if (this.hasSavedSession()) {
      try {
        await this.connect(false); // Silent refresh attempt
        if (this.isConnected()) return this.accessToken;
      } catch {
        // Fall through to interactive connect
      }
    }

    await this.connect(true);
    return this.accessToken;
  }

  /**
   * Finds the sync file in Google Drive's appDataFolder.
   */
  async findRemoteSyncFile(token) {
    const query = encodeURIComponent(`name='${APP_CONFIG.syncFileName}' and trashed=false`);
    const url = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}&fields=files(id,name,modifiedTime)`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (res.status === 401) {
        this.accessToken = null;
        throw new Error('AUTH_EXPIRED');
      }
      throw new Error(`Drive search error: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0];
    }
    return null;
  }

  /**
   * Downloads sync data from Google Drive.
   */
  async downloadRemoteData(fileId, token) {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Drive download error: ${res.statusText}`);
    }

    return await res.json();
  }

  /**
   * Uploads new sync data file to appDataFolder.
   */
  async createRemoteFile(payload, token) {
    const metadata = {
      name: APP_CONFIG.syncFileName,
      parents: ['appDataFolder'],
      mimeType: 'application/json',
    };

    const boundary = '-------MaktabahQuranSyncBoundary' + Math.random().toString(36).slice(2);
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(payload) +
      closeDelimiter;

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    });

    if (!res.ok) {
      throw new Error(`Drive create error: ${res.statusText}`);
    }

    const created = await res.json();
    return created.id;
  }

  /**
   * Updates an existing sync file in appDataFolder.
   */
  async updateRemoteFile(fileId, payload, token) {
    const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Drive update error: ${res.statusText}`);
    }

    return await res.json();
  }

  /**
   * Collects all local data to prepare a sync snapshot.
   */
  async collectLocalData() {
    let notes = [];
    try {
      if (this.storage && typeof this.storage.getAllNotes === 'function') {
        notes = await this.storage.getAllNotes();
      }
    } catch {}
    const bookmarks = store.bookmarks || [];
    const settings = store.settings || {};
    const lastRead = store.getLastRead();
    const lastMushafPage = store.loadLastMushafPage ? store.loadLastMushafPage() : null;
    const khatam = store.getKhatam ? store.getKhatam() : null;
    const hifzMastery = store.getAllHifzMastery ? store.getAllHifzMastery() : {};
    const audioState = store.getAudioState ? store.getAudioState() : null;
    const bookmarkFolders = store.getBookmarkFolders ? store.getBookmarkFolders() : [];

    return {
      app: 'maktabah-maftoohah-al-quran',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        notes,
        bookmarks,
        settings,
        lastRead,
        lastMushafPage,
        khatam,
        hifzMastery,
        audioState,
        bookmarkFolders,
      },
    };
  }

  /**
   * Merges remote data with local state using conflict resolution rules:
   * - Bookmarks: deduplicated union based on 'ref'
   * - Notes: compare updatedAt, keep newer
   * - Last Read: compare timestamp, keep newer
   * - Settings: merge preserving active options
   */
  async mergeData(remoteBundle) {
    if (!remoteBundle || remoteBundle.app !== 'maktabah-maftoohah-al-quran' || !remoteBundle.data) {
      return await this.collectLocalData();
    }

    const remoteData = remoteBundle.data;
    let localNotes = await this.storage.getAllNotes();
    const localNotesMap = new Map(localNotes.map((n) => [n.ref, n]));

    // 1. Merge Notes
    if (Array.isArray(remoteData.notes)) {
      for (const rNote of remoteData.notes) {
        if (!rNote.ref) continue;
        const lNote = localNotesMap.get(rNote.ref);
        if (!lNote) {
          // New note from remote
          await this.storage.saveNote(rNote.ref, rNote);
          localNotesMap.set(rNote.ref, rNote);
        } else {
          // Compare modified timestamps
          const rTime = rNote.updatedAt || 0;
          const lTime = lNote.updatedAt || 0;
          if (rTime > lTime) {
            await this.storage.saveNote(rNote.ref, rNote);
            localNotesMap.set(rNote.ref, rNote);
          }
        }
      }
    }

    // 2. Merge Bookmarks (Set union)
    const existingRefs = new Set((store.bookmarks || []).map((b) => b.ref));
    let bookmarksChanged = false;
    if (Array.isArray(remoteData.bookmarks)) {
      for (const rBm of remoteData.bookmarks) {
        if (rBm.ref && !existingRefs.has(rBm.ref)) {
          store.bookmarks.push(rBm);
          existingRefs.add(rBm.ref);
          bookmarksChanged = true;
        }
      }
    }
    if (bookmarksChanged) {
      try {
        localStorage.setItem('maktabah_quran_bookmarks', JSON.stringify(store.bookmarks));
      } catch (e) {
        console.warn('Failed to save merged bookmarks:', e);
      }
    }

    // 3. Merge Last Read
    if (remoteData.lastRead) {
      const localLastRead = store.getLastRead();
      const rDate = remoteData.lastRead.timestamp ? new Date(remoteData.lastRead.timestamp).getTime() : 0;
      const lDate = localLastRead?.timestamp ? new Date(localLastRead.timestamp).getTime() : 0;
      if (rDate > lDate) {
        store.setLastRead(
          remoteData.lastRead.surah,
          remoteData.lastRead.ayah,
          remoteData.lastRead.surahName
        );
      }
    }

    // 4. Merge Mushaf Page
    if (remoteData.lastMushafPage && remoteData.lastMushafPage > 0) {
      const localPage = store.loadLastMushafPage ? store.loadLastMushafPage() : 1;
      if (!localPage || localPage === 1) {
        if (store.saveLastMushafPage) {
          store.saveLastMushafPage(remoteData.lastMushafPage);
        }
      }
    }

    // 5. Merge Khatam & Streaks
    if (remoteData.khatam && store.getKhatam) {
      const localKhatam = store.getKhatam();
      const mergedPages = Array.from(new Set([
        ...(localKhatam.completedPages || []),
        ...(remoteData.khatam.completedPages || []),
      ])).sort((a, b) => a - b);

      const maxStreak = Math.max(localKhatam.dailyStreak || 0, remoteData.khatam.dailyStreak || 0);
      const latestActive = (remoteData.khatam.lastActiveDate || '') > (localKhatam.lastActiveDate || '')
        ? remoteData.khatam.lastActiveDate
        : localKhatam.lastActiveDate;

      store.saveKhatam({
        targetDays: remoteData.khatam.targetDays || localKhatam.targetDays || 30,
        completedPages: mergedPages,
        dailyStreak: maxStreak,
        lastActiveDate: latestActive,
      });
    }

    // 6. Merge Hifz Mastery
    if (remoteData.hifzMastery && store.getAllHifzMastery) {
      const localHifz = store.getAllHifzMastery();
      let hifzChanged = false;
      for (const [ref, rH] of Object.entries(remoteData.hifzMastery)) {
        const lH = localHifz[ref];
        if (!lH || (rH.updatedAt || 0) > (lH.updatedAt || 0)) {
          localHifz[ref] = rH;
          hifzChanged = true;
        }
      }
      if (hifzChanged && typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('maktabah_quran_hifz_mastery', JSON.stringify(localHifz));
        } catch {}
      }
    }

    // 7. Merge Audio State & Prompt Resume
    if (remoteData.audioState && store.getAudioState) {
      const localAudio = store.getAudioState();
      const rTime = remoteData.audioState.timestamp || 0;
      const lTime = localAudio?.timestamp || 0;
      if (rTime > lTime) {
        store.saveAudioState(
          remoteData.audioState.surah,
          remoteData.audioState.ayah,
          remoteData.audioState.reciter
        );
        this.emit({
          type: 'audio_resume_available',
          audioState: remoteData.audioState,
        });
      }
    }

    // 8. Merge Bookmark Folders
    if (Array.isArray(remoteData.bookmarkFolders) && store.getBookmarkFolders) {
      const localFolders = store.getBookmarkFolders();
      const knownIds = new Set(localFolders.map((f) => f.id));
      let foldersChanged = false;
      for (const rF of remoteData.bookmarkFolders) {
        if (!knownIds.has(rF.id)) {
          localFolders.push(rF);
          knownIds.add(rF.id);
          foldersChanged = true;
        }
      }
      if (foldersChanged && store.saveBookmarkFolders) {
        store.saveBookmarkFolders(localFolders);
      }
    }

    // 9. Build unified state for remote upload
    const updatedNotes = Array.from(localNotesMap.values());
    return {
      app: 'maktabah-maftoohah-al-quran',
      version: 1,
      exportedAt: new Date().toISOString(),
      counts: {
        notes: updatedNotes.length,
        bookmarks: store.bookmarks.length,
      },
      data: {
        notes: updatedNotes,
        bookmarks: store.bookmarks,
        settings: store.settings,
        lastRead: store.getLastRead(),
        lastMushafPage: store.loadLastMushafPage ? store.loadLastMushafPage() : null,
        khatam: store.getKhatam ? store.getKhatam() : null,
        hifzMastery: store.getAllHifzMastery ? store.getAllHifzMastery() : {},
        audioState: store.getAudioState ? store.getAudioState() : null,
        bookmarkFolders: store.getBookmarkFolders ? store.getBookmarkFolders() : [],
      },
    };
  }

  /**
   * Executes a bidirectional synchronization run.
   */
  async sync() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.emit({ type: 'syncing' });

    try {
      const token = await this.ensureToken();

      // Check remote file in appDataFolder
      const fileInfo = await this.findRemoteSyncFile(token);

      let finalPayload;
      if (fileInfo) {
        this.syncFileId = fileInfo.id;
        const remoteData = await this.downloadRemoteData(fileInfo.id, token);
        finalPayload = await this.mergeData(remoteData);
        await this.updateRemoteFile(fileInfo.id, finalPayload, token);
      } else {
        finalPayload = await this.collectLocalData();
        this.syncFileId = await this.createRemoteFile(finalPayload, token);
      }

      this.lastSyncedAt = new Date();
      this.savePersistedState();

      this.emit({
        type: 'synced',
        lastSyncedAt: this.lastSyncedAt,
        notesCount: finalPayload.data.notes.length,
        bookmarksCount: finalPayload.data.bookmarks.length,
      });

      return {
        success: true,
        lastSyncedAt: this.lastSyncedAt,
      };
    } catch (err) {
      console.error('Google Drive sync error:', err);
      this.emit({ type: 'error', error: err.message });
      throw err;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Debounced sync triggered upon user action (adding bookmark, note, changing setting).
   */
  triggerDebouncedSync(delayMs = 4000) {
    if (!this.isConnected()) return;

    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.sync().catch((e) => console.warn('Debounced sync error:', e));
    }, delayMs);
  }
  /**
   * Fetches Google Drive file revision history.
   */
  async getRevisionHistory() {
    const token = await this.ensureToken();
    if (!this.syncFileId) {
      const fileInfo = await this.findRemoteSyncFile(token);
      if (fileInfo) this.syncFileId = fileInfo.id;
    }
    if (!this.syncFileId) return [];

    const url = `https://www.googleapis.com/drive/v3/files/${this.syncFileId}/revisions?fields=revisions(id,modifiedTime,size,keepForever)`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`Gagal memuatkan sejarah semakan: ${res.statusText}`);
    const data = await res.json();
    return (data.revisions || []).reverse();
  }

  /**
   * Restores data from a specific revision ID.
   */
  async restoreRevision(revisionId) {
    const token = await this.ensureToken();
    if (!this.syncFileId || !revisionId) throw new Error('ID fail atau semakan tidak sah');

    const url = `https://www.googleapis.com/drive/v3/files/${this.syncFileId}/revisions/${revisionId}?alt=media`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`Gagal memuat turun fail semakan: ${res.statusText}`);
    const remoteData = await res.json();
    await this.mergeData(remoteData);
    await this.sync();
    return true;
  }

  /**
   * Exports personal study reflections into a formatted Google Drive file in the user's Drive.
   */
  async exportNotesToGoogleDrive() {
    const token = await this.ensureToken();
    let notes = [];
    try {
      if (this.storage && typeof this.storage.getAllNotes === 'function') {
        notes = await this.storage.getAllNotes();
      }
    } catch {}
    if (!notes.length) throw new Error('Tiada nota pengajian untuk dieksport.');

    const dateStr = new Date().toISOString().slice(0, 10);
    const title = `Maktabah Al-Quran - Nota Tadabbur (${dateStr})`;

    let bodyHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:system-ui,-apple-system,sans-serif;line-height:1.6;padding:2rem;color:#1e293b;max-width:800px;margin:auto;} .note-card{border:1px solid #e2e8f0;border-radius:10px;padding:1.25rem;margin-bottom:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.05);} .ar{font-family:'Amiri',serif;font-size:1.5rem;direction:rtl;margin:0.75rem 0;color:#0f172a;} .trans{color:#475569;font-size:0.95rem;margin-bottom:0.75rem;} .meta{color:#64748b;font-size:0.8rem;} .reflection{background:#f8fafc;padding:0.85rem;border-left:4px solid #10b981;border-radius:4px;margin-top:0.75rem;} h1{color:#047857;border-bottom:2px solid #e2e8f0;padding-bottom:0.5rem;}</style></head><body><h1>${title}</h1><p class="meta">Himpunan Nota Tadabbur Ayat Al-Quran &bull; Maktabah Maftoohah &bull; ${new Date().toLocaleString()}</p>`;

    for (const n of notes) {
      bodyHtml += `
      <div class="note-card">
        <h3>Surah ${n.surahName || n.surah} (${n.ref})</h3>
        ${n.ar ? `<div class="ar">${n.ar}</div>` : ''}
        ${n.translation ? `<div class="trans"><em>${n.translation}</em></div>` : ''}
        <div class="reflection"><strong>Nota &amp; Tadabbur:</strong><br>${(n.text || '').replace(/\n/g, '<br>')}</div>
        <div class="meta" style="margin-top:0.6rem;">Kemaskini: ${new Date(n.updatedAt || Date.now()).toLocaleDateString()}</div>
      </div>`;
    }
    bodyHtml += `</body></html>`;

    const metadata = {
      name: `${title}.html`,
      mimeType: 'text/html',
      description: 'Himpunan Nota Tadabbur Ayat Al-Quran daripada Maktabah Maftoohah Al-Quran',
    };

    const boundary = '-------MaktabahNotesExport' + Math.random().toString(36).slice(2);
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: text/html; charset=UTF-8\r\n\r\n' +
      bodyHtml +
      closeDelimiter;

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    });

    if (!res.ok) throw new Error(`Gagal menyimpan ke Google Drive: ${res.statusText}`);
    return await res.json();
  }
}

export const gdriveSync = new GDriveSyncManager();
