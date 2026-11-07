/**
 * Maktabah Maftoohah Al-Quran - Main Application Module
 * Assembles SPA components, view renderers, event delegation, and UI state.
 */

import { store } from './store.js';
import { audio, RECITERS } from './audio.js';
import { searchEngine } from './search.js';
import { router } from './router.js';
import { rumiToJawi } from './jawi.js';
import { cardGenerator } from './card-generator.js';
import { mushafViewer, SURAH_START_PAGES } from './mushaf.js';
import { storageDB } from './storage-db.js';
import { wakeLockController } from './wake-lock.js';
import { backupManager } from './backup.js';
import { gdriveSync } from './gdrive-sync.js';
import { APP_CONFIG } from './config.js';
import { analytics } from './analytics.js';
import { i18n } from './i18n.js';
import { colorizeTajweed, TAJWEED_LEGEND } from './tajweed.js';

class App {
  constructor() {
    this.mainContainer = document.getElementById('main-viewport');
    this.surahListContainer = document.getElementById('sidebar-surah-list');
    this.bookmarksListContainer = document.getElementById('sidebar-bookmarks-list');
    this.notesListContainer = document.getElementById('sidebar-notes-list');
    this.asbabListContainer = document.getElementById('sidebar-asbab-list');
    this.sidebarEl = document.getElementById('app-sidebar');
    this.morphDrawer = document.getElementById('morphology-drawer');
    this.morphOverlay = document.getElementById('drawer-overlay');
    this.noteModal = document.getElementById('note-modal-overlay');
    this.activeNoteContext = null;
    this.renderedSurah = null;
    this.activeBookmarkFolder = 'all';
  }

  async init() {
    // Disable automatic browser scroll restoration so deep links and refreshes land accurately
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang === 'en' || urlLang === 'ms') {
        store.settings.language = urlLang;
        store.saveSettings();
      }
    } catch {}

    i18n.init(store.settings.language || 'ms');
    store.applySettingsToDOM();
    searchEngine.init();
    cardGenerator.init();
    this.initPWA();
    this.initSidebar();
    this.initTypographyPopover();
    this.initLanguageSwitcher();
    this.initTajweedControls();
    this.initStickyAudioPlayer();
    this.initMorphologyDrawer();
    this.initNoteModal();
    this.initStorageStats();
    this.initWakeLock();
    this.initNetworkStatus();
    window.app = this;
    this.initBackupControls();
    this.initGDriveSync();
    this.initKhatamTracker();
    this.initCalendarReminders();
    this.initGDriveExtraTools();
    this.initGlobalEvents();
    this.updateMushafNavBtn();

    // Register routes
    store.fetchAsbab().catch(() => {});
    store.fetchHadithRefs().catch(() => {});
    router.addRoute('surah', (params) => {
      this.renderSurahView(params);
      analytics.trackPageView(window.location.pathname + window.location.hash);
      analytics.trackSurahView(params.surah);
    });
    router.addRoute('ayah', (params) => {
      this.renderAyahDeepDive(params);
      analytics.trackPageView(window.location.pathname + window.location.hash);
      analytics.trackAyahView(params.surah, params.ayah);
    });
    router.addRoute('mushaf', (params) => {
      this.renderMushafView(params);
      analytics.trackPageView(window.location.pathname + window.location.hash);
      analytics.trackMushafPage(params.page);
    });
    router.addRoute('bookmarks', () => {
      this.renderBookmarksView();
      analytics.trackPageView(window.location.pathname + window.location.hash);
    });

    // Start routing
    analytics.init();
    router.init();
  }

  initLanguageSwitcher() {
    const updateLangUI = (lang) => {
      document.querySelectorAll('#header-lang-switcher .lang-switch-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
      });
      document.querySelectorAll('#popover-lang-switcher .lang-opt-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
      });
    };

    const handleLangSelect = (lang) => {
      if (lang === i18n.getLanguage()) return;
      store.updateSettings({ language: lang });
      i18n.setLanguage(lang);
      updateLangUI(lang);
      if (this.cachedSurahs) {
        this.renderSidebarSurahs(this.cachedSurahs);
      }
      this.renderedSurah = null;
      router.handleRouting();
    };

    document.querySelectorAll('#header-lang-switcher .lang-switch-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleLangSelect(btn.getAttribute('data-lang'));
      });
    });

    document.querySelectorAll('#popover-lang-switcher .lang-opt-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleLangSelect(btn.getAttribute('data-lang'));
      });
    });

    updateLangUI(store.settings.language || 'ms');
  }

  initTajweedControls() {
    const btn = document.getElementById('tajweed-mode-btn');
    if (!btn) return;

    const updateBtnUI = () => {
      btn.classList.toggle('active', Boolean(store.settings.tajweedMode));
    };

    updateBtnUI();

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const next = !store.settings.tajweedMode;
      store.updateSettings({ tajweedMode: next });
      updateBtnUI();
      if (typeof analytics !== 'undefined') {
        analytics.trackEvent('toggle_tajweed', { active: next });
      }
    });
  }

  initPWA() {
    if ('serviceWorker' in navigator) {
      const register = () => {
        navigator.serviceWorker.register('./sw.js').catch((err) => {
          console.warn('Service worker registration failed:', err);
        });
      };
      if (document.readyState === 'complete') {
        register();
      } else {
        window.addEventListener('load', register);
      }
    }
  }

  // --- UI Notifications & Utilities ---

  showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  async copyToClipboard(text, feedbackMsg = 'Copied to clipboard!') {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast(feedbackMsg);
    } catch (e) {
      this.showToast('Failed to copy to clipboard');
    }
  }

  // --- Sidebar & Navigation ---

  async initSidebar() {
    const filterInput = document.getElementById('sidebar-search-input');
    const filterBox = document.querySelector('.sidebar-filter-box');
    const tabs = document.querySelectorAll('.sidebar-tab');

    const updateFilterForTab = async (tabName) => {
      if (!filterInput || !filterBox) return;
      filterInput.value = '';

      if (tabName === 'surahs') {
        filterBox.style.display = 'block';
        filterInput.placeholder = i18n.t('sidebar.filterPlaceholder');
        this.surahListContainer.querySelectorAll('.surah-list-item').forEach((item) => {
          item.style.display = 'flex';
        });
      } else if (tabName === 'bookmarks') {
        const hasBookmarks = (store.bookmarks || []).length > 0;
        filterBox.style.display = hasBookmarks ? 'block' : 'none';
        filterInput.placeholder = i18n.t('sidebar.filterBookmarksPlaceholder');
        this.bookmarksListContainer.querySelectorAll('.surah-list-item').forEach((item) => {
          item.style.display = 'flex';
        });
      } else if (tabName === 'notes') {
        let hasNotes = false;
        try {
          const notes = await storageDB.getAllNotes();
          hasNotes = notes && notes.length > 0;
        } catch {}
        filterBox.style.display = hasNotes ? 'block' : 'none';
        filterInput.placeholder = i18n.t('sidebar.filterNotesPlaceholder');
        if (this.notesListContainer) {
          this.notesListContainer.querySelectorAll('.sidebar-note-item').forEach((item) => {
            item.style.display = 'block';
          });
        }
      } else if (tabName === 'asbab') {
        filterBox.style.display = 'block';
        filterInput.placeholder = i18n.t('sidebar.filterAsbabPlaceholder');
        if (this.asbabListContainer) {
          this.asbabListContainer.querySelectorAll('.sidebar-asbab-item').forEach((item) => {
            item.style.display = 'flex';
          });
        }
      }
    };

    // Tab switching
    tabs.forEach((tab) => {
      tab.addEventListener('click', async () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const tabName = tab.getAttribute('data-tab');

        if (tabName === 'surahs') {
          this.surahListContainer.style.display = 'block';
          this.bookmarksListContainer.style.display = 'none';
          if (this.notesListContainer) this.notesListContainer.style.display = 'none';
          if (this.asbabListContainer) this.asbabListContainer.style.display = 'none';
        } else if (tabName === 'bookmarks') {
          this.surahListContainer.style.display = 'none';
          this.bookmarksListContainer.style.display = 'block';
          if (this.notesListContainer) this.notesListContainer.style.display = 'none';
          if (this.asbabListContainer) this.asbabListContainer.style.display = 'none';
          this.renderSidebarBookmarks();
        } else if (tabName === 'notes') {
          this.surahListContainer.style.display = 'none';
          this.bookmarksListContainer.style.display = 'none';
          if (this.asbabListContainer) this.asbabListContainer.style.display = 'none';
          if (this.notesListContainer) {
            this.notesListContainer.style.display = 'block';
            await this.renderSidebarNotes();
          }
        } else if (tabName === 'asbab') {
          this.surahListContainer.style.display = 'none';
          this.bookmarksListContainer.style.display = 'none';
          if (this.notesListContainer) this.notesListContainer.style.display = 'none';
          if (this.asbabListContainer) {
            this.asbabListContainer.style.display = 'block';
            this.renderSidebarAsbab();
          }
        }
        await updateFilterForTab(tabName);
      });
    });

    // Populate Surahs list
    try {
      const surahs = await store.fetchSurahs();
      this.cachedSurahs = surahs;
      this.renderSidebarSurahs(surahs);

      if (filterInput) {
        filterInput.addEventListener('input', () => {
          const q = filterInput.value.toLowerCase().trim();
          const activeTab = document.querySelector('.sidebar-tab.active')?.getAttribute('data-tab') || 'surahs';

          if (activeTab === 'surahs') {
            const items = this.surahListContainer.querySelectorAll('.surah-list-item');
            items.forEach((item) => {
              if (!q) {
                item.style.display = 'flex';
                return;
              }
              const sNum = item.getAttribute('data-surah') || '';
              const latin = item.getAttribute('data-latin') || '';
              const trans = item.getAttribute('data-trans') || '';
              const arabic = item.getAttribute('data-arabic') || '';
              const matches = sNum.includes(q) || latin.includes(q) || trans.includes(q) || arabic.includes(q);
              item.style.display = matches ? 'flex' : 'none';
            });
          } else if (activeTab === 'bookmarks') {
            const items = this.bookmarksListContainer.querySelectorAll('.surah-list-item');
            items.forEach((item) => {
              if (!q) {
                item.style.display = 'flex';
                return;
              }
              const text = item.textContent.toLowerCase();
              item.style.display = text.includes(q) ? 'flex' : 'none';
            });
          } else if (activeTab === 'notes') {
            const items = this.notesListContainer.querySelectorAll('.sidebar-note-item');
            items.forEach((item) => {
              if (!q) {
                item.style.display = 'block';
                return;
              }
              const text = item.textContent.toLowerCase();
              item.style.display = text.includes(q) ? 'block' : 'none';
            });
          } else if (activeTab === 'asbab') {
            if (this.asbabListContainer) {
              const asbabItems = this.asbabListContainer.querySelectorAll('.sidebar-asbab-item');
              asbabItems.forEach((item) => {
                if (!q) {
                  item.style.display = 'flex';
                  return;
                }
                const sNum = item.getAttribute('data-surah') || '';
                const latin = item.getAttribute('data-latin') || '';
                const trans = item.getAttribute('data-trans') || '';
                const arabic = item.getAttribute('data-arabic') || '';
                const ayahs = (item.getAttribute('data-ayahs') || '').split(',');
                const matches = sNum.includes(q) || latin.includes(q) || trans.includes(q) || arabic.includes(q) || ayahs.includes(q);
                item.style.display = matches ? 'flex' : 'none';
              });
            }
          }
        });
      }
    } catch (err) {
      console.error('Sidebar surahs failed to load:', err);
    }

    // Toggle sidebar on mobile and desktop
    const toggleBtn = document.getElementById('sidebar-toggle-btn') || document.getElementById('toggle-sidebar-btn');
    if (toggleBtn && this.sidebarEl) {
      // Apply initial desktop collapsed state
      if (store.settings.sidebarCollapsed && window.innerWidth > 900) {
        this.sidebarEl.classList.add('collapsed');
        toggleBtn.classList.add('collapsed');
        toggleBtn.setAttribute('aria-expanded', 'false');
      } else {
        toggleBtn.setAttribute('aria-expanded', 'true');
      }

      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.innerWidth <= 900) {
          // Mobile: toggle slide-over drawer
          const isOpen = this.sidebarEl.classList.toggle('open');
          toggleBtn.setAttribute('aria-expanded', String(isOpen));
        } else {
          // Desktop: toggle collapse/expand distraction-free reading mode
          const isCollapsed = this.sidebarEl.classList.toggle('collapsed');
          toggleBtn.classList.toggle('collapsed', isCollapsed);
          toggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
          store.updateSettings({ sidebarCollapsed: isCollapsed });
        }
      });

      // Auto-close sidebar on mobile after clicking an item
      this.sidebarEl.addEventListener('click', (e) => {
        if (e.target.closest('.surah-list-item') || e.target.closest('.sidebar-asbab-chip') || e.target.closest('.sidebar-asbab-surah-link')) {
          if (window.innerWidth <= 900) {
            this.sidebarEl.classList.remove('open');
            toggleBtn.setAttribute('aria-expanded', 'false');
          }
        }
      });

      // Close sidebar when clicking outside on mobile
      document.addEventListener('click', (e) => {
        if (window.innerWidth <= 900 && this.sidebarEl.classList.contains('open')) {
          if (!this.sidebarEl.contains(e.target) && !toggleBtn.contains(e.target)) {
            this.sidebarEl.classList.remove('open');
            toggleBtn.setAttribute('aria-expanded', 'false');
          }
        }
      });
    }
  }

  renderSidebarSurahs(surahs) {
    if (!this.surahListContainer) return;
    const currentHash = window.location.hash;

    const isMs = i18n.getLanguage() === 'ms';
    const html = surahs
      .map((s) => {
        const isActive = currentHash.includes(`surah/${s.number}`) ? 'active' : '';
        const seededBadge = s.seeded
          ? `<span style="font-size: 0.65rem; color: var(--accent-emerald);">● ${isMs ? 'Sedia' : 'Ready'}</span>`
          : `<span style="font-size: 0.65rem; color: var(--text-muted);">○ ${isMs ? 'Belum' : 'Unseeded'}</span>`;
        const ayahsLabel = isMs ? 'ayat' : 'ayahs';
        const displayName = store.getSurahName(s);
        const displayTrans = store.getSurahTranslation(s);
        const searchTags = `${s.name_latin.toLowerCase()} ${(s.name_ms || '').toLowerCase()} ${(s.name_translation || '').toLowerCase()} ${(s.translation_ms || '').toLowerCase()}`;

        return `
          <a href="#surah/${s.number}" class="surah-list-item ${isActive}" data-surah="${s.number}" data-latin="${searchTags}" data-trans="${searchTags}" data-arabic="${s.name_arabic}">
            <div class="surah-item-left">
              <div class="surah-item-num">${s.number}</div>
              <div class="surah-item-titles">
                <span class="surah-item-latin">${displayName}</span>
                <span class="surah-item-trans">${displayTrans}</span>
              </div>
            </div>
            <div class="surah-item-right">
              <span class="surah-item-arabic">${s.name_arabic}</span>
              <span class="surah-item-ayahs">${s.total_ayahs} ${ayahsLabel} • ${seededBadge}</span>
            </div>
          </a>
        `;
      })
      .join('');

    this.surahListContainer.innerHTML = html;

    // Auto-close sidebar on mobile after clicking item
    this.surahListContainer.querySelectorAll('.surah-list-item').forEach((el) => {
      el.addEventListener('click', () => {
        if (window.innerWidth <= 900 && this.sidebarEl) {
          this.sidebarEl.classList.remove('open');
        }
      });
    });
  }

  renderSidebarBookmarks() {
    if (!this.bookmarksListContainer) return;
    const allBookmarks = store.bookmarks || [];
    const folders = store.getBookmarkFolders ? store.getBookmarkFolders() : ['Semua', 'Doa', 'Sabar', 'Hafazan'];
    const activeFolder = this.activeBookmarkFolder || 'all';

    const filteredBookmarks = activeFolder === 'all'
      ? allBookmarks
      : allBookmarks.filter((b) => (b.folder || 'Lalai') === activeFolder);

    const isMs = i18n.getLanguage() === 'ms';

    const chipsHtml = `
      <div class="folder-chips-bar" id="bookmark-folder-chips">
        <button class="folder-chip ${activeFolder === 'all' ? 'active' : ''}" data-folder="all">
          ${i18n.t('folders.all')} (${allBookmarks.length})
        </button>
        ${folders
          .map(
            (f) => `
          <button class="folder-chip ${activeFolder === f ? 'active' : ''}" data-folder="${f}">
            📁 ${f}
          </button>
        `
          )
          .join('')}
        <button class="folder-chip folder-chip-add" id="btn-add-bookmark-folder">
          ${i18n.t('folders.newFolder')}
        </button>
      </div>
    `;

    if (!filteredBookmarks.length) {
      this.bookmarksListContainer.innerHTML = `
        ${chipsHtml}
        <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          ${allBookmarks.length === 0 ? (isMs ? 'Tiada penanda buku lagi.' : 'No bookmarks saved yet.') : (isMs ? 'Tiada penanda buku dalam folder ini.' : 'No bookmarks in this folder.')}
        </div>
      `;
      this.attachBookmarkFolderEvents();
      return;
    }

    const html = filteredBookmarks
      .map((b) => {
        const folderName = b.folder || 'Lalai';
        if (b.type === 'mushaf') {
          return `
            <div class="surah-list-item" style="flex-direction: column; align-items: flex-start; gap: 0.4rem; position: relative;">
              <a href="#mushaf/${b.page}" style="text-decoration: none; width: 100%; color: inherit;">
                <div style="display: flex; justify-content: space-between; width: 100%;">
                  <span class="ayah-badge">📄 ${isMs ? `Halaman ${b.page}` : `Page ${b.page}`}</span>
                  <span style="font-size: 0.75rem; color: var(--accent-gold);">★ Saved</span>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">
                  ${b.surahName || (isMs ? `Halaman Mushaf ${b.page}` : `Mushaf Page ${b.page}`)}
                </div>
              </a>
              <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 0.2rem;">
                <span class="bookmark-folder-badge">📁 ${folderName}</span>
                <select class="bookmark-folder-select" data-ref="page:${b.page}">
                  ${folders.map((f) => `<option value="${f}" ${folderName === f ? 'selected' : ''}>${f}</option>`).join('')}
                </select>
              </div>
            </div>
          `;
        }
        return `
          <div class="surah-list-item" style="flex-direction: column; align-items: flex-start; gap: 0.4rem; position: relative;">
            <a href="#${b.surah}:${b.ayah}" style="text-decoration: none; width: 100%; color: inherit;">
              <div style="display: flex; justify-content: space-between; width: 100%;">
                <span class="ayah-badge">${b.surahName} (${b.ref})</span>
                <span style="font-size: 0.75rem; color: var(--accent-gold);">★ Saved</span>
              </div>
              <div style="font-family: var(--font-arabic); font-size: 1.1rem; direction: rtl; text-align: right; width: 100%; color: var(--text-primary); margin-top: 0.2rem;">
                ${b.ar ? (b.ar.slice(0, 70) + (b.ar.length > 70 ? '...' : '')) : ''}
              </div>
            </a>
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 0.2rem;">
              <span class="bookmark-folder-badge">📁 ${folderName}</span>
              <select class="bookmark-folder-select" data-ref="${b.ref}">
                ${folders.map((f) => `<option value="${f}" ${folderName === f ? 'selected' : ''}>${f}</option>`).join('')}
              </select>
            </div>
          </div>
        `;
      })
      .join('');

    this.bookmarksListContainer.innerHTML = chipsHtml + html;
    this.attachBookmarkFolderEvents();

    const filterBox = document.querySelector('.sidebar-filter-box');
    const activeTab = document.querySelector('.sidebar-tab.active')?.getAttribute('data-tab');
    if (filterBox && activeTab === 'bookmarks') {
      filterBox.style.display = allBookmarks.length > 0 ? 'block' : 'none';
    }
  }

  attachBookmarkFolderEvents() {
    if (!this.bookmarksListContainer) return;
    this.bookmarksListContainer.querySelectorAll('.folder-chip[data-folder]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.activeBookmarkFolder = btn.getAttribute('data-folder');
        this.renderSidebarBookmarks();
      });
    });

    const addBtn = this.bookmarksListContainer.querySelector('#btn-add-bookmark-folder');
    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const name = prompt(i18n.t('folders.promptNew'));
        if (name && name.trim()) {
          store.addBookmarkFolder(name.trim());
          this.activeBookmarkFolder = name.trim();
          this.renderSidebarBookmarks();
        }
      });
    }

    this.bookmarksListContainer.querySelectorAll('.bookmark-folder-select').forEach((sel) => {
      sel.addEventListener('change', (e) => {
        e.stopPropagation();
        const ref = sel.getAttribute('data-ref');
        const folder = sel.value;
        store.setBookmarkFolder(ref, folder);
        this.renderSidebarBookmarks();
      });
    });
  }

  async renderSidebarNotes() {
    if (!this.notesListContainer) return;
    let notes = [];
    try {
      notes = await storageDB.getAllNotes();
    } catch (e) {
      console.warn('Failed to load notes for sidebar:', e);
    }

    if (!notes.length) {
      this.notesListContainer.innerHTML = `
        <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          No personal study notes yet.<br/>Click <span style="color: var(--accent-gold);">📝 Note</span> on any verse to write your reflections!
        </div>
      `;
      return;
    }

    const html = notes
      .map((n) => {
        const dateStr = new Date(n.updatedAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        return `
          <a href="#${n.surah}:${n.ayah}" class="sidebar-note-item" data-ref="${n.ref}">
            <div class="sidebar-note-ref">
              <span>${n.surahName} (${n.ref})</span>
              <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: normal;">${dateStr}</span>
            </div>
            <div class="sidebar-note-preview">${this.escapeHtml(n.text)}</div>
          </a>
        `;
      })
      .join('');

    this.notesListContainer.innerHTML = html;

    const filterBox = document.querySelector('.sidebar-filter-box');
    const activeTab = document.querySelector('.sidebar-tab.active')?.getAttribute('data-tab');
    if (filterBox && activeTab === 'notes') {
      filterBox.style.display = notes.length > 0 ? 'block' : 'none';
    }

    this.notesListContainer.querySelectorAll('.sidebar-note-item').forEach((el) => {
      el.addEventListener('click', () => {
        if (window.innerWidth <= 900 && this.sidebarEl) {
          this.sidebarEl.classList.remove('open');
        }
      });
    });
  }

  async renderSidebarAsbab() {
    if (!this.asbabListContainer) return;
    const isMs = i18n.getLanguage() === 'ms';
    const asbab = await store.fetchAsbab();
    const surahs = this.cachedSurahs || (await store.fetchSurahs());

    if (!asbab || !Object.keys(asbab).length) {
      this.asbabListContainer.innerHTML = `
        <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          ${i18n.t('sidebar.noAsbab')}
        </div>
      `;
      return;
    }

    const surahGroups = new Map();
    for (const key of Object.keys(asbab)) {
      const [s, a] = key.split(':').map((v) => parseInt(v, 10));
      if (!surahGroups.has(s)) {
        surahGroups.set(s, []);
      }
      surahGroups.get(s).push(a);
    }

    for (const ayahs of surahGroups.values()) {
      ayahs.sort((a, b) => a - b);
    }

    const sortedSurahNums = Array.from(surahGroups.keys()).sort((a, b) => a - b);

    const html = sortedSurahNums
      .map((sNum) => {
        const meta = surahs.find((s) => s.number === sNum);
        const sName = meta ? store.getSurahName(meta) : `Surah ${sNum}`;
        const sTrans = meta ? store.getSurahTranslation(meta) : '';
        const sArabic = meta ? meta.name_arabic : '';
        const ayahs = surahGroups.get(sNum);
        const count = ayahs.length;
        const countLabel = isMs ? `${count} asbab` : `${count} causes`;

        const chipsHtml = ayahs
          .map(
            (aNum) => `
              <a href="#ayah/${sNum}/${aNum}?tab=asbab" class="sidebar-asbab-chip" title="${isMs ? `Surah ${sName} Ayat ${aNum}` : `Surah ${sName} Ayah ${aNum}`}">
                ${isMs ? 'Ayat' : 'Ayah'} ${aNum}
              </a>
            `
          )
          .join('');

        return `
          <div class="sidebar-asbab-item" data-surah="${sNum}" data-latin="${(meta?.name_latin || '').toLowerCase()}" data-trans="${sTrans.toLowerCase()}" data-arabic="${sArabic}" data-ayahs="${ayahs.join(',')}">
            <div class="sidebar-asbab-header">
              <a href="#surah/${sNum}" class="sidebar-asbab-surah-link" title="${isMs ? 'Buka Surah' : 'Open Surah'}">
                <span class="surah-number-badge">${sNum}</span>
                <span class="sidebar-asbab-name">${sName}</span>
                <span class="sidebar-asbab-arabic">${sArabic}</span>
              </a>
              <span class="sidebar-asbab-count">📜 ${countLabel}</span>
            </div>
            <div class="sidebar-asbab-chips">
              ${chipsHtml}
            </div>
          </div>
        `;
      })
      .join('');

    this.asbabListContainer.innerHTML = html;
  }

  // --- Typography Popover ---

  initTypographyPopover() {
    const trigger = document.getElementById('typography-btn');
    const popover = document.getElementById('typography-popover');
    if (!trigger || !popover) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      popover.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!popover.contains(e.target) && e.target !== trigger) {
        popover.classList.remove('open');
      }
    });

    // Sliders
    const arSlider = document.getElementById('slider-arabic-size');
    const trSlider = document.getElementById('slider-trans-size');
    const arValLabel = document.getElementById('label-arabic-size');
    const trValLabel = document.getElementById('label-trans-size');

    if (arSlider) {
      arSlider.value = store.settings.arabicSize;
      arValLabel.textContent = `${store.settings.arabicSize}rem`;
      arSlider.addEventListener('input', () => {
        const val = parseFloat(arSlider.value);
        arValLabel.textContent = `${val}rem`;
        store.updateSettings({ arabicSize: val });
      });
    }

    if (trSlider) {
      trSlider.value = store.settings.translationSize;
      trValLabel.textContent = `${store.settings.translationSize}rem`;
      trSlider.addEventListener('input', () => {
        const val = parseFloat(trSlider.value);
        trValLabel.textContent = `${val}rem`;
        store.updateSettings({ translationSize: val });
      });
    }

    // Translation Toggles
    const toggleBasmeih = document.getElementById('toggle-trans-basmeih');
    const toggleBasmeihHarfiah = document.getElementById('toggle-trans-basmeih-harfiah');
    const toggleJalalayn = document.getElementById('toggle-trans-jalalayn');
    const toggleSahih = document.getElementById('toggle-trans-sahih');
    const togglePickthall = document.getElementById('toggle-trans-pickthall');
    const toggleKemenag = document.getElementById('toggle-trans-kemenag');
    const toggleJawi = document.getElementById('toggle-jawi-script');

    const updateTransSettings = async () => {
      const activeTranslations = {
        basmeih: toggleBasmeih ? toggleBasmeih.checked : false,
        basmeihHarfiah: toggleBasmeihHarfiah ? toggleBasmeihHarfiah.checked : true,
        jalalayn: toggleJalalayn ? toggleJalalayn.checked : false,
        sahih: toggleSahih ? toggleSahih.checked : false,
        pickthall: togglePickthall ? togglePickthall.checked : false,
        kemenag: toggleKemenag ? toggleKemenag.checked : false,
      };
      store.updateSettings({
        jawiMode: toggleJawi ? toggleJawi.checked : false,
        activeTranslations,
      });
      await store.fetchTranslations(true);
      this.populateMissingTranslations();
      this.updateActiveTranslationsDisplay();
    };

    if (toggleBasmeih) {
      toggleBasmeih.checked = store.settings.activeTranslations.basmeih;
      toggleBasmeih.addEventListener('change', updateTransSettings);
    }
    if (toggleBasmeihHarfiah) {
      toggleBasmeihHarfiah.checked = Boolean(store.settings.activeTranslations.basmeihHarfiah);
      toggleBasmeihHarfiah.addEventListener('change', updateTransSettings);
    }
    if (toggleJalalayn) {
      toggleJalalayn.checked = Boolean(store.settings.activeTranslations.jalalayn);
      toggleJalalayn.addEventListener('change', updateTransSettings);
    }
    if (toggleSahih) {
      toggleSahih.checked = Boolean(store.settings.activeTranslations.sahih);
      toggleSahih.addEventListener('change', updateTransSettings);
    }
    if (togglePickthall) {
      togglePickthall.checked = Boolean(store.settings.activeTranslations.pickthall);
      togglePickthall.addEventListener('change', updateTransSettings);
    }
    if (toggleKemenag) {
      toggleKemenag.checked = Boolean(store.settings.activeTranslations.kemenag);
      toggleKemenag.addEventListener('change', updateTransSettings);
    }
    const selectWbwLang = document.getElementById('select-wbw-lang');
    if (selectWbwLang) {
      selectWbwLang.value = store.settings.wbwLanguage || 'dual';
      selectWbwLang.addEventListener('change', () => {
        store.updateSettings({ wbwLanguage: selectWbwLang.value });
        if (window.location.hash.startsWith('#ayah/')) {
          router.handleRouting();
        }
      });
    }

    if (toggleJawi) {
      toggleJawi.checked = store.settings.jawiMode;
      toggleJawi.addEventListener('change', () => {
        store.updateSettings({ jawiMode: toggleJawi.checked });
        this.renderedSurah = null;
        router.handleRouting();
      });
    }
  }

  updateActiveTranslationsDisplay() {
    const act = store.settings.activeTranslations || {};
    document.querySelectorAll('.translation-block-basmeih').forEach((el) => {
      el.style.display = act.basmeih ? 'flex' : 'none';
    });
    document.querySelectorAll('.translation-block-basmeih-harfiah').forEach((el) => {
      el.style.display = act.basmeihHarfiah ? 'flex' : 'none';
    });
    document.querySelectorAll('.translation-block-jalalayn').forEach((el) => {
      el.style.display = act.jalalayn ? 'flex' : 'none';
    });
    document.querySelectorAll('.translation-block-sahih').forEach((el) => {
      el.style.display = act.sahih ? 'flex' : 'none';
    });
    document.querySelectorAll('.translation-block-pickthall').forEach((el) => {
      el.style.display = act.pickthall ? 'flex' : 'none';
    });
    document.querySelectorAll('.translation-block-kemenag').forEach((el) => {
      el.style.display = act.kemenag ? 'flex' : 'none';
    });

    const activeCount = Object.values(act).filter(Boolean).length;
    const isSingle = activeCount <= 1;
    document.querySelectorAll('.verse-translations').forEach((el) => {
      el.classList.toggle('single-translation', isSingle);
      const notice = el.querySelector('.no-translations-notice');
      if (notice) {
        notice.style.display = activeCount === 0 ? 'block' : 'none';
      }
    });
  }

  populateMissingTranslations() {
    const t = store.cache.translations;
    document.querySelectorAll('.verse-card, #pane-translations').forEach((card) => {
      const sNum = card.getAttribute('data-surah');
      const aNum = card.getAttribute('data-ayah');
      if (!sNum || !aNum) return;

      if (t.pickthall && t.pickthall[sNum]?.[aNum]) {
        const pEl = card.querySelector('.translation-block-pickthall p');
        if (pEl && !pEl.textContent.trim()) {
          pEl.textContent = t.pickthall[sNum][aNum];
        }
      }
      if (t.basmeih && t.basmeih[sNum]?.[aNum]) {
        const pEl = card.querySelector('.translation-block-basmeih p');
        if (pEl && !pEl.textContent.trim()) {
          pEl.textContent = store.settings.jawiMode ? rumiToJawi(t.basmeih[sNum][aNum]) : t.basmeih[sNum][aNum];
        }
      }
      if (t.basmeihHarfiah && t.basmeihHarfiah[sNum]?.[aNum]) {
        const pEl = card.querySelector('.translation-block-basmeih-harfiah p');
        if (pEl && !pEl.textContent.trim()) {
          pEl.textContent = store.settings.jawiMode ? rumiToJawi(t.basmeihHarfiah[sNum][aNum]) : t.basmeihHarfiah[sNum][aNum];
        }
      }
      if (t.jalalayn && t.jalalayn[sNum]?.[aNum]) {
        const pEl = card.querySelector('.translation-block-jalalayn p');
        if (pEl && !pEl.textContent.trim()) {
          pEl.textContent = t.jalalayn[sNum][aNum];
        }
      }
      if (t.sahih && t.sahih[sNum]?.[aNum]) {
        const pEl = card.querySelector('.translation-block-sahih p');
        if (pEl && !pEl.textContent.trim()) {
          pEl.textContent = t.sahih[sNum][aNum];
        }
      }
      if (t.kemenag && t.kemenag[sNum]?.[aNum]) {
        const pEl = card.querySelector('.translation-block-kemenag p');
        if (pEl && !pEl.textContent.trim()) {
          pEl.textContent = t.kemenag[sNum][aNum];
        }
      }
    });
  }

  // --- Sticky Bottom Audio Player ---

  initStickyAudioPlayer() {
    const playPauseBtn = document.getElementById('player-play-pause-btn');
    const prevBtn = document.getElementById('player-prev-btn');
    const nextBtn = document.getElementById('player-next-btn');
    const reciterSelect = document.getElementById('player-reciter-select');
    const loopToggle = document.getElementById('player-loop-toggle');
    const autoScrollToggle = document.getElementById('player-autoscroll-toggle');
    const ayahBadge = document.getElementById('player-ayah-badge');
    const surahTitle = document.getElementById('player-surah-title');
    const reciterTitle = document.getElementById('player-reciter-title');

    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', async () => {
        if (!audio.state.isPlaying && window.location.hash.startsWith('#mushaf')) {
          const activeSpan = document.querySelector('.mushaf-ayah-span.active-reciting');
          if (!activeSpan) {
            const firstSpan = document.querySelector('.mushaf-ayah-span');
            if (firstSpan) {
              const sNum = parseInt(firstSpan.getAttribute('data-surah'), 10);
              const aNum = parseInt(firstSpan.getAttribute('data-ayah'), 10);
              const total = parseInt(firstSpan.getAttribute('data-total'), 10);
              const meta = await store.getSurahMeta(sNum);
              await audio.playAyah(sNum, aNum, {
                continuous: true,
                totalAyahs: total,
                surahName: meta ? store.getSurahName(meta) : `Surah ${sNum}`,
              });
              return;
            }
          }
        }
        audio.togglePlayPause();
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (window.location.hash.startsWith('#mushaf')) {
          // In RTL Quran reading, moving forward goes to the left (prevBtn points left ←)
          audio.nextAyah();
        } else {
          audio.prevAyah();
        }
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (window.location.hash.startsWith('#mushaf')) {
          // In RTL Quran reading, moving backward goes to the right (nextBtn points right →)
          audio.prevAyah();
        } else {
          audio.nextAyah();
        }
      });
    }

    if (reciterSelect) {
      reciterSelect.value = store.settings.reciter;
      reciterSelect.addEventListener('change', () => audio.setReciter(reciterSelect.value));
    }

    if (loopToggle) {
      loopToggle.classList.toggle('active', store.settings.loopAyah);
      loopToggle.addEventListener('click', () => {
        const next = !store.settings.loopAyah;
        store.updateSettings({ loopAyah: next });
        loopToggle.classList.toggle('active', next);
        this.showToast(next ? 'Ayah loop enabled' : 'Ayah loop disabled');
      });
    }

    if (autoScrollToggle) {
      autoScrollToggle.classList.toggle('active', store.settings.autoScroll);
      autoScrollToggle.addEventListener('click', () => {
        const next = !store.settings.autoScroll;
        store.updateSettings({ autoScroll: next });
        autoScrollToggle.classList.toggle('active', next);
        this.showToast(next ? 'Auto-scroll enabled' : 'Auto-scroll disabled');
      });
    }

    // Subscribe to Audio Engine state
    audio.subscribe((state) => {
      if (playPauseBtn) {
        playPauseBtn.innerHTML = state.isPlaying
          ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
          : '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
      }
      if (ayahBadge) {
        ayahBadge.textContent = `${state.currentSurah}:${state.currentAyah}`;
      }
      if (surahTitle) {
        surahTitle.textContent = `${state.surahName || `Surah ${state.currentSurah}`}`;
      }
      if (reciterTitle) {
        const rName = RECITERS[store.settings.reciter]?.name || 'Recitation';
        reciterTitle.textContent = `${rName} ${state.isContinuous ? '(Continuous)' : ''}`;
      }

      // Update in-view play buttons
      document.querySelectorAll('.btn-play-ayah').forEach((btn) => {
        const s = parseInt(btn.getAttribute('data-surah'), 10);
        const a = parseInt(btn.getAttribute('data-ayah'), 10);
        if (s === state.currentSurah && a === state.currentAyah && state.isPlaying) {
          btn.innerHTML = '⏸';
          btn.title = i18n.t('surah.tooltipPause');
          btn.setAttribute('aria-label', btn.title);
        } else {
          btn.innerHTML = '▶';
          btn.title = i18n.t('surah.tooltipPlay');
          btn.setAttribute('aria-label', btn.title);
        }
      });

      // Update Play Surah Continuous button if present
      const playSurahBtn = document.getElementById('btn-play-surah-continuous');
      if (playSurahBtn) {
        if (state.isPlaying && state.isContinuous) {
          playSurahBtn.innerHTML = '⏸ Pause Full Surah Continuous';
        } else {
          playSurahBtn.innerHTML = '▶ Play Full Surah Continuous';
        }
      }
    });

    this.updatePlayerControlsDirection();
  }

  updatePlayerControlsDirection() {
    const prevBtn = document.getElementById('player-prev-btn');
    const nextBtn = document.getElementById('player-next-btn');
    if (!prevBtn || !nextBtn) return;
    const isMushaf = window.location.hash.startsWith('#mushaf');
    const isMs = (store.settings.language || 'ms') === 'ms';

    if (isMushaf) {
      prevBtn.title = isMs ? 'Ayat Seterusnya (Maju ke kiri ← / Alt+←)' : 'Next Ayah (Advance left ← / Alt+←)';
      nextBtn.title = isMs ? 'Ayat Sebelumnya (Undur ke kanan → / Alt+→)' : 'Previous Ayah (Step back right → / Alt+→)';
    } else {
      prevBtn.title = isMs ? 'Ayat Sebelumnya (Alt + ←)' : 'Previous Ayah (Alt + ←)';
      nextBtn.title = isMs ? 'Ayat Seterusnya (Alt + →)' : 'Next Ayah (Alt + →)';
    }
    prevBtn.setAttribute('aria-label', prevBtn.title);
    nextBtn.setAttribute('aria-label', nextBtn.title);
  }

  // --- Morphology & Concordance Drawer ---

  initMorphologyDrawer() {
    if (!this.morphOverlay || !this.morphDrawer) return;

    this.morphOverlay.addEventListener('click', () => this.closeMorphologyDrawer());
    const closeBtn = document.getElementById('close-morph-drawer-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeMorphologyDrawer());
    }
  }

  openMorphologyDrawer(token, surahNum, ayahNum) {
    if (!this.morphDrawer || !this.morphOverlay) return;

    const drawerBody = document.getElementById('morph-drawer-body');
    const concordances = store.findRootConcordances(token.root);
    const isMalay = i18n.getLanguage() === 'ms';
    const isJawi = store.settings.jawiMode;
    const wbwLang = store.settings.wbwLanguage || 'dual';
    let gloss = '';
    let glossSecondary = '';
    if (wbwLang === 'dual') {
      const ms = token.ms || token.id || '';
      gloss = isJawi ? rumiToJawi(ms) : ms;
      glossSecondary = token.en || '';
    } else if (wbwLang === 'en') {
      gloss = token.en || '';
    } else if (wbwLang === 'id') {
      gloss = isJawi ? rumiToJawi(token.id || token.ms || token.en || '') : (token.id || token.ms || token.en || '');
    } else {
      gloss = isJawi ? rumiToJawi(token.ms || token.id || token.en || '') : (token.ms || token.id || token.en || '');
    }

    const concordanceHtml = concordances.length
      ? `
        <div style="margin-top: 1rem;">
          <div class="morph-kv-label">${isMalay ? `Konkordans Kata Dasar (${concordances.length} ayat ditemui)` : `Root Concordance (${concordances.length} loaded occurrences)`}</div>
          <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.4rem;">
            ${concordances
              .map(
                (c) => `
              <a href="#ayah/${c.surah}/${c.ayah}" class="btn" style="justify-content: space-between; font-size: 0.8rem; text-decoration: none;" onclick="window.app.closeMorphologyDrawer()">
                <span>Ayah ${c.ref}</span>
                <span style="font-family: var(--font-arabic); font-size: 1.1rem; color: var(--accent-gold);">${c.token.ar}</span>
              </a>
            `
              )
              .join('')}
          </div>
        </div>
      `
      : `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">${isMalay ? 'Tiada kemunculan lain dalam surah yang dimuatkan.' : 'No other loaded occurrences in current chapters.'}</div>`;

    drawerBody.innerHTML = `
      <div class="morph-token-banner">
        <div class="morph-ar-large">${token.ar}</div>
        <div style="font-size: 1rem; color: var(--accent-blue); font-style: italic; margin-top: 0.25rem;">${token.tr}</div>
        <div style="font-size: 1.05rem; color: var(--text-primary); font-weight: 500; margin-top: 0.25rem;">"${gloss}"</div>
        ${glossSecondary ? `<div style="font-size: 0.88rem; color: var(--text-muted); font-style: italic; margin-top: 0.15rem;">(${glossSecondary})</div>` : ''}
      </div>

      <div class="morph-details-grid">
        <div class="morph-kv">
          <div class="morph-kv-label">${i18n.t('deepDive.drawerRoot')}</div>
          <div class="morph-kv-val" style="color: var(--accent-gold); display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
            <span>${token.root || 'N/A'}</span>
            ${token.root ? `<a href="${APP_CONFIG.corpusBaseUrl}?lang=${i18n.getLanguage()}#root/${encodeURIComponent(token.root)}" target="_blank" rel="noopener noreferrer" class="btn" style="padding: 0.15rem 0.45rem; font-size: 0.72rem; text-decoration: none; color: #10b981; border: 1px solid rgba(16,185,129,0.3); background: rgba(16,185,129,0.08);" title="Buka Mu'jam Akar Kata di Korpus Al-Quran">🔬 ${i18n.getLanguage() === 'ms' ? 'Teroka di Korpus' : 'Explore in Corpus'} ↗</a>` : ''}
          </div>
        </div>
        <div class="morph-kv">
          <div class="morph-kv-label">${i18n.t('deepDive.drawerLemma')}</div>
          <div class="morph-kv-val">${token.lemma || 'N/A'}</div>
        </div>
        <div class="morph-kv">
          <div class="morph-kv-label">${i18n.t('deepDive.drawerPos')}</div>
          <div class="morph-kv-val" style="color: var(--accent-emerald);">${token.pos_tag || 'Particle/Noun'}</div>
        </div>
        <div class="morph-kv">
          <div class="morph-kv-label">${i18n.t('deepDive.drawerPosition')}</div>
          <div class="morph-kv-val">${surahNum}:${ayahNum}:${token.pos}</div>
        </div>
        ${token.verb_form ? `
          <div class="morph-kv">
            <div class="morph-kv-label">${isMalay ? 'Wazan Kata Kerja' : 'Verb Form'}</div>
            <div class="morph-kv-val" style="color: var(--accent-gold);">Form ${token.verb_form}</div>
          </div>
        ` : ''}
        ${token.aspect ? `
          <div class="morph-kv">
            <div class="morph-kv-label">${isMalay ? 'Kala (Aspect)' : 'Aspect'}</div>
            <div class="morph-kv-val">${token.aspect === 'PERF' ? (isMalay ? 'Madhi (Lalu)' : 'Past (Perf)') : (token.aspect === 'IMPF' ? (isMalay ? 'Mudhari\' (Kini)' : 'Imperfect') : 'Amr (Command)')}</div>
          </div>
        ` : ''}
        ${token.voice === 'PASS' ? `
          <div class="morph-kv">
            <div class="morph-kv-label">${isMalay ? 'Ragam' : 'Voice'}</div>
            <div class="morph-kv-val" style="color: var(--accent-rose);">${isMalay ? 'Majhul (Pasif)' : 'Passive'}</div>
          </div>
        ` : ''}
        ${token.derivation ? `
          <div class="morph-kv">
            <div class="morph-kv-label">${isMalay ? 'Terbitan' : 'Derivation'}</div>
            <div class="morph-kv-val" style="color: var(--accent-emerald);">${token.derivation === 'ACT_PCPL' ? 'Ism Fa\'il' : (token.derivation === 'PASS_PCPL' ? 'Ism Maf\'ul' : 'Masdar')}</div>
          </div>
        ` : ''}
        ${token.case ? `
          <div class="morph-kv">
            <div class="morph-kv-label">${isMalay ? 'Keadaan I\'rab' : 'Case'}</div>
            <div class="morph-kv-val">${token.case === 'NOM' ? 'Marfu\' (NOM)' : (token.case === 'ACC' ? 'Mansub (ACC)' : 'Majrur (GEN)')}</div>
          </div>
        ` : ''}
      </div>

      <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
        <button class="btn btn-primary" style="flex: 1;" onclick="window.audioEngine.playWord(${surahNum}, ${ayahNum}, ${token.pos})">
          🔊 ${i18n.t('deepDive.drawerPronounce')}
        </button>
        <a href="${APP_CONFIG.getCorpusUrl(i18n.getLanguage() || 'ms', `#word/${surahNum}:${ayahNum}:${token.pos}`)}" target="_blank" rel="noopener noreferrer" class="btn" style="flex: 1; text-decoration: none;" title="${isMalay ? 'Buka analisis morfologi dalam Korpus Al-Quran' : 'Open morphological analysis in Quran Corpus'}">
          ${i18n.t('deepDive.drawerCorpusBtn')}
        </a>
      </div>

      ${concordanceHtml}
    `;

    this.morphDrawer.classList.add('open');
    this.morphOverlay.classList.add('open');
  }

  closeMorphologyDrawer() {
    if (this.morphDrawer) this.morphDrawer.classList.remove('open');
    if (this.morphOverlay) this.morphOverlay.classList.remove('open');
  }

  // --- Keyboard & Global Events ---

  initGlobalEvents() {
    const hifzBtn = document.getElementById('hifz-mode-btn');
    if (hifzBtn) {
      if (store.settings.hifz?.active) {
        hifzBtn.classList.add('btn-primary');
      }
      hifzBtn.addEventListener('click', () => {
        const currentActive = store.settings.hifz?.active || false;
        const nextActive = !currentActive;
        store.updateSettings({
          hifz: {
            ...(store.settings.hifz || {}),
            active: nextActive,
          },
        });
        hifzBtn.classList.toggle('btn-primary', nextActive);
        this.showToast(nextActive ? '🧠 Tahfiz / Hifz Mode Activated' : 'Tahfiz Mode Deactivated');
        this.renderedSurah = null;
        router.handleRouting();
      });
    }

    window.addEventListener('keydown', (e) => {
      // Space for play/pause if not focused on inputs
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        audio.togglePlayPause();
      } else if (e.code === 'ArrowRight' && e.altKey) {
        if (window.location.hash.startsWith('#mushaf')) {
          audio.prevAyah();
        } else {
          audio.nextAyah();
        }
      } else if (e.code === 'ArrowLeft' && e.altKey) {
        if (window.location.hash.startsWith('#mushaf')) {
          audio.nextAyah();
        } else {
          audio.prevAyah();
        }
      } else if ((e.key === '[' || (e.ctrlKey && e.key.toLowerCase() === 'b')) && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        const btn = document.getElementById('toggle-sidebar-btn') || document.getElementById('sidebar-toggle-btn');
        if (btn) btn.click();
      }
    });

    window.app = this;
    window.audioEngine = audio;
    window.storageDB = storageDB;
    window.wakeLockController = wakeLockController;
    window.backupManager = backupManager;
    window.gdriveSync = gdriveSync;
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- IndexedDB: Study Notes Modal ---

  initNoteModal() {
    if (!this.noteModal) return;

    this.noteModal.addEventListener('click', (e) => {
      if (e.target === this.noteModal || e.target.closest('[data-action="close-note-modal"]')) {
        this.closeNoteModal();
      }
    });

    const saveBtn = document.getElementById('note-modal-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        if (!this.activeNoteContext) return;
        const textarea = document.getElementById('note-modal-textarea');
        const text = textarea ? textarea.value.trim() : '';
        const { ref, surah, ayah, surahName, ar, trans } = this.activeNoteContext;

        if (!text) {
          await storageDB.deleteNote(ref);
          this.updateNoteInView(ref, null);
          this.showToast(`Note for ${ref} deleted`);
        } else {
          await storageDB.saveNote(ref, {
            surah,
            ayah,
            surahName,
            ar,
            translation: trans,
            text,
          });
          this.updateNoteInView(ref, text);
          this.showToast(`Note for ${ref} saved`);
        }
        this.closeNoteModal();
        this.renderSidebarNotes();
      });
    }

    const deleteBtn = document.getElementById('note-modal-delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (!this.activeNoteContext) return;
        const { ref } = this.activeNoteContext;
        await storageDB.deleteNote(ref);
        this.updateNoteInView(ref, null);
        this.showToast(`Note for ${ref} deleted`);
        this.closeNoteModal();
        this.renderSidebarNotes();
      });
    }
  }

  async openNoteModal(context) {
    this.activeNoteContext = context;
    if (!this.noteModal) return;

    const refEl = document.getElementById('note-modal-ref');
    const arEl = document.getElementById('note-modal-preview-arabic');
    const transEl = document.getElementById('note-modal-preview-trans');
    const textarea = document.getElementById('note-modal-textarea');
    const deleteBtn = document.getElementById('note-modal-delete-btn');

    if (refEl) refEl.textContent = context.ref;
    if (arEl) arEl.textContent = context.ar;
    if (transEl) transEl.textContent = context.trans;

    let existing = null;
    try {
      existing = await storageDB.getNote(context.ref);
    } catch (e) {
      console.warn('Error reading note from IDB:', e);
    }

    if (textarea) textarea.value = existing ? existing.text : '';
    if (deleteBtn) deleteBtn.style.display = existing ? 'block' : 'none';

    this.noteModal.classList.add('open');
    if (textarea) textarea.focus();
  }

  closeNoteModal() {
    if (this.noteModal) {
      this.noteModal.classList.remove('open');
    }
    this.activeNoteContext = null;
  }

  updateNoteInView(ref, text) {
    gdriveSync.triggerDebouncedSync();
    const btn = document.querySelector(`.btn-note-ayah[data-ref="${ref}"]`);
    if (btn) {
      btn.classList.toggle('has-note', Boolean(text));
    }
    const snippetContainer = document.getElementById(`note-snippet-${ref}`);
    if (snippetContainer) {
      if (text) {
        snippetContainer.className = 'verse-note-snippet';
        snippetContainer.innerHTML = `
          <div class="verse-note-snippet-header">
            <span>📝 Study Note</span>
            <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: normal;">Just now</span>
          </div>
          <div style="line-height: 1.4;">${this.escapeHtml(text)}</div>
        `;
      } else {
        snippetContainer.className = '';
        snippetContainer.innerHTML = '';
      }
    }
  }

  // --- IndexedDB: Storage Stats Management ---

  initStorageStats() {
    this.updateStorageStatsDisplay();

    const clearBtn = document.getElementById('btn-clear-audio-cache');
    if (clearBtn) {
      clearBtn.addEventListener('click', async () => {
        if (confirm('Delete all offline audio recitations stored in IndexedDB?')) {
          await storageDB.clearAllAudio();
          this.updateStorageStatsDisplay();
          this.showToast('All cached offline audio deleted');
        }
      });
    }

    const persistBtn = document.getElementById('btn-request-persist');
    if (persistBtn) {
      persistBtn.addEventListener('click', async () => {
        const granted = await storageDB.requestPersistence();
        this.updateStorageStatsDisplay();
        this.showToast(
          granted
            ? '🔒 Storage marked as persistent (Protected from browser eviction)'
            : 'Persistence could not be granted by browser'
        );
      });
    }
  }

  async updateStorageStatsDisplay() {
    const statEl = document.getElementById('storage-audio-stat');
    const statusEl = document.getElementById('storage-persist-status');
    const persistBtn = document.getElementById('btn-request-persist');

    try {
      const stats = await storageDB.getAudioStorageStats();
      const mb = (stats.bytes / (1024 * 1024)).toFixed(1);
      if (statEl) statEl.textContent = `Audio: ${stats.count} files (${mb} MB)`;

      const quota = await storageDB.getStorageQuota();
      if (quota && statusEl) {
        if (quota.isPersistent) {
          statusEl.textContent = '🔒 Protected';
          statusEl.title = 'Storage is protected by the browser from automatic eviction.';
          if (persistBtn) persistBtn.style.display = 'none';
        } else {
          statusEl.textContent = 'Best-Effort';
          statusEl.title = 'Browser may evict storage if disk space becomes extremely low.';
          if (persistBtn) persistBtn.style.display = 'inline-block';
        }
      }
    } catch {
      if (statEl) statEl.textContent = 'Audio: 0 KB';
    }
  }

  // --- Network Status (Online / Offline Indicator) ---

  initNetworkStatus() {
    const pill = document.getElementById('offline-status-pill');
    const updateStatus = (isOnline, showNotification = true) => {
      if (pill) {
        pill.style.display = isOnline ? 'none' : 'flex';
      }
      if (showNotification) {
        this.showToast(
          isOnline
            ? '🌐 Connection restored — Back online'
            : '📶 Offline Mode — Reading from local cache & storage'
        );
      }
    };

    updateStatus(navigator.onLine, false);
    window.addEventListener('online', () => updateStatus(true, true));
    window.addEventListener('offline', () => updateStatus(false, true));
  }

  // --- Screen Wake Lock API ---

  initWakeLock() {
    const wakeLockBtn = document.getElementById('wake-lock-btn');
    const toggleWakeLock = document.getElementById('toggle-wake-lock');

    const updateWakeLockUI = (active) => {
      if (wakeLockBtn) {
        wakeLockBtn.classList.toggle('active', active);
        wakeLockBtn.title = active
          ? 'Screen Wake Lock Active (Screen will not dim)'
          : 'Keep Screen Awake (Wake Lock)';
      }
      if (toggleWakeLock) {
        toggleWakeLock.checked = active;
      }
    };

    if (wakeLockBtn) {
      if (!wakeLockController.isSupported()) {
        wakeLockBtn.style.display = 'none';
      } else {
        wakeLockBtn.addEventListener('click', async () => {
          const active = await wakeLockController.toggle();
          updateWakeLockUI(active);
          this.showToast(
            active ? '💡 Screen Wake Lock ON (No screen timeout)' : 'Screen Wake Lock OFF'
          );
        });
      }
    }

    if (toggleWakeLock) {
      if (!wakeLockController.isSupported()) {
        toggleWakeLock.parentElement.style.display = 'none';
      } else {
        toggleWakeLock.addEventListener('change', async () => {
          if (toggleWakeLock.checked) {
            await wakeLockController.request();
          } else {
            await wakeLockController.release();
          }
          updateWakeLockUI(wakeLockController.isActive());
        });
      }
    }
  }

  // --- Google Drive Cloud Sync ---

  initGDriveSync() {
    const connectBtn = document.getElementById('btn-gdrive-connect');
    const syncBtn = document.getElementById('btn-gdrive-sync');
    const disconnectBtn = document.getElementById('btn-gdrive-disconnect');
    const statusDesc = document.getElementById('gdrive-status-desc');
    const badge = document.getElementById('gdrive-sync-badge');
    const clientIdInput = document.getElementById('input-gdrive-client-id');
    const saveClientIdBtn = document.getElementById('btn-save-gdrive-client-id');
    const headerLoginBtn = document.getElementById('header-login-btn');
    const headerLoginText = document.getElementById('header-login-text');
    const headerLoginIcon = document.getElementById('header-login-icon');

    if (!connectBtn && !headerLoginBtn) return;

    if (clientIdInput) {
      clientIdInput.value = APP_CONFIG.getGoogleClientId();
    }

    if (saveClientIdBtn && clientIdInput) {
      saveClientIdBtn.addEventListener('click', () => {
        const val = clientIdInput.value.trim();
        APP_CONFIG.setGoogleClientId(val);
        this.showToast('Google Client ID disimpan.');
      });
    }

    const updateUI = () => {
      const isConn = gdriveSync.isConnected();
      const hasSession = gdriveSync.hasSavedSession();

      if (isConn || hasSession) {
        connectBtn.style.display = 'none';
        if (syncBtn) syncBtn.style.display = 'inline-flex';
        if (disconnectBtn) disconnectBtn.style.display = 'inline-flex';
        if (badge) {
          badge.style.display = 'inline-block';
          badge.textContent = isConn ? 'ONLINE' : 'CACHED';
        }

        const email = gdriveSync.userEmail;
        const lastSync = gdriveSync.lastSyncedAt;
        const timeStr = lastSync ? lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

        if (statusDesc) {
          if (timeStr) {
            statusDesc.textContent = i18n.t('settings.gdriveLastSynced', { time: timeStr });
          } else if (email) {
            statusDesc.textContent = i18n.t('settings.gdriveConnected', { email });
          } else {
            statusDesc.textContent = 'Google Drive disambung.';
          }
        }
      } else {
        connectBtn.style.display = 'inline-flex';
        if (syncBtn) syncBtn.style.display = 'none';
        if (disconnectBtn) disconnectBtn.style.display = 'none';
        if (badge) badge.style.display = 'none';
        if (statusDesc) {
          statusDesc.textContent = i18n.t('settings.gdriveNotConnected');
        }
      }

      if (headerLoginBtn) {
        if (isConn || hasSession) {
          const email = gdriveSync.userEmail;
          headerLoginBtn.classList.add('logged-in');
          if (headerLoginText) {
            headerLoginText.textContent = email ? email.split('@')[0] : (i18n.t('nav.loggedIn') || 'Disambung');
          }
          headerLoginBtn.title = email ? `Disambung (${email})` : 'Disambung ke Google Drive';
        } else {
          headerLoginBtn.classList.remove('logged-in');
          if (headerLoginText) {
            headerLoginText.textContent = i18n.t('nav.loginBtn') || 'Log Masuk';
          }
          headerLoginBtn.title = i18n.t('nav.loginTitle') || 'Log Masuk Google';
        }
      }
    };

    gdriveSync.subscribe((event) => {
      if (event.type === 'connecting') {
        if (statusDesc) statusDesc.textContent = 'Menyambung ke Google...';
      } else if (event.type === 'syncing') {
        if (statusDesc) statusDesc.textContent = i18n.t('settings.gdriveSyncing');
        if (syncBtn) syncBtn.classList.add('loading');
      } else if (event.type === 'synced') {
        if (syncBtn) syncBtn.classList.remove('loading');
        updateUI();
        if (event.manual) {
          this.showToast(`Penyegerakan berjaya (${event.notesCount} nota, ${event.bookmarksCount} penanda buku)`);
        }
        this.renderSidebarBookmarks();
        this.renderSidebarNotes();
      } else if (event.type === 'error') {
        if (syncBtn) syncBtn.classList.remove('loading');
        updateUI();
        if (event.code === 'MISSING_CLIENT_ID') {
          this.showToast('Sila masukkan Google Client ID dalam konfigurasi.');
          const details = document.getElementById('gdrive-config-details');
          if (details) details.open = true;
        } else {
          this.showToast(`Ralat penyegerakan: ${event.error}`);
        }
      } else if (event.type === 'disconnected') {
        updateUI();
        this.showToast('Google Drive diputuskan.');
      } else {
        updateUI();
      }
    });

    if (connectBtn) {
      connectBtn.addEventListener('click', async () => {
        try {
          await gdriveSync.connect(true);
        } catch (e) {
          console.warn('Connect error:', e);
        }
      });
    }

    if (headerLoginBtn) {
      headerLoginBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!gdriveSync.isConnected()) {
          try {
            await gdriveSync.connect(true);
          } catch (err) {
            console.warn('Header login connect error:', err);
          }
        } else {
          const popover = document.getElementById('typography-popover');
          if (popover) {
            popover.classList.add('open');
            const gdriveSec = document.getElementById('gdrive-actions-group');
            if (gdriveSec) {
              gdriveSec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }
        }
      });
    }

    if (syncBtn) {
      syncBtn.addEventListener('click', async () => {
        try {
          await gdriveSync.sync({ manual: true });
        } catch (e) {
          this.showToast(`Gagal menyegerak: ${e.message}`);
        }
      });
    }

    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', async () => {
        await gdriveSync.disconnect();
      });
    }

    store.onUserDataChanged(() => {
      gdriveSync.triggerDebouncedSync();
    });

    updateUI();
  }

  // --- Data Backup & Restore ---

  initBackupControls() {
    const exportBtn = document.getElementById('btn-export-backup');
    if (exportBtn) {
      exportBtn.addEventListener('click', async () => {
        try {
          const res = await backupManager.exportBackup();
          this.showToast(
            `Backup exported (${res.notesCount} notes, ${res.bookmarksCount} bookmarks)`
          );
        } catch (e) {
          this.showToast(`Backup failed: ${e.message}`);
        }
      });
    }

    const importInput = document.getElementById('input-import-backup');
    if (importInput) {
      importInput.addEventListener('change', async () => {
        const file = importInput.files?.[0];
        if (!file) return;
        try {
          const res = await backupManager.importBackup(file);
          this.showToast(`Restored ${res.notesCount} notes and ${res.bookmarksCount} bookmarks!`);
          this.renderSidebarBookmarks();
          this.renderSidebarNotes();
          router.handleRouting();
        } catch (e) {
          this.showToast(`Restore failed: ${e.message}`);
        } finally {
          importInput.value = '';
        }
      });
    }
  }

  // =========================================================================
  // VIEW RENDERERS
  // =========================================================================

  /**
   * Surah Reading View (#surah/:surah)
   */
  async renderSurahView({ surah, targetAyah }) {
    this.updatePlayerControlsDirection();
    // If surah is already rendered in the DOM and we are navigating to an ayah within the same chapter
    if (targetAyah && this.renderedSurah === surah && document.getElementById(`verse-${surah}-${targetAyah}`)) {
      document.querySelectorAll('.surah-list-item').forEach((el) => {
        el.classList.toggle('active', el.getAttribute('data-surah') === String(surah));
      });

      const meta = await store.getSurahMeta(surah);
      if (meta) {
        const displayName = store.getSurahName(meta);
        const displayTrans = store.getSurahTranslation(meta);
        store.setLastRead(surah, targetAyah, displayName, displayTrans);
        const basePath = window.location.pathname.replace(/\/index\.html$/, '/');
        this.updatePageMeta({
          title: `Surah ${displayName} ${surah}:${targetAyah} — Maktabah Maftoohah Al-Quran`,
          description: `Surah ${displayName} ${surah}:${targetAyah}`,
          url: `${window.location.origin}${basePath}#${surah}:${targetAyah}`
        });
      }

      this.scrollToAyah(surah, targetAyah, { smooth: false });
      return;
    }

    this.renderedSurah = surah;
    this.mainContainer.innerHTML = '<div style="padding: 3rem; text-align: center; color: var(--text-muted);">Loading Surah data...</div>';

    try {
      const meta = await store.getSurahMeta(surah);
      if (!meta) {
        this.mainContainer.innerHTML = `<div style="padding: 2rem; color: var(--danger);">Surah ${surah} not found.</div>`;
        return;
      }

      // Track active sidebar link
      document.querySelectorAll('.surah-list-item').forEach((el) => {
        el.classList.toggle('active', el.getAttribute('data-surah') === String(surah));
      });

      // Check if chapter is seeded before fetching network assets
      if (!meta.seeded) {
        this.renderUnseededSurahView(meta);
        return;
      }

      // Try fetching Arabic & translations
      let arabicData, translations;
      try {
        [arabicData, translations] = await Promise.all([
          store.fetchArabic(surah),
          store.fetchTranslations(),
          store.fetchAsbab().catch(() => ({})),
        ]);
      } catch (err) {
        this.renderUnseededSurahView(meta);
        return;
      }

      // Check notes and offline audio status in IndexedDB
      const reciter = store.settings.reciter || 'Alafasy_128kbps';
      let allNotes = [];
      try {
        allNotes = await storageDB.getAllNotes();
      } catch (e) {
        console.warn('IDB fetch in renderSurahView:', e);
      }
      const notesMap = new Map(allNotes.map((n) => [n.ref, n]));

      // Update Last Read
      const targetA = targetAyah || 1;
      const displayName = store.getSurahName(meta);
      const displayTrans = store.getSurahTranslation(meta);
      store.setLastRead(surah, targetA, displayName);

      if (!audio.state.isPlaying) {
        audio.state.currentSurah = surah;
        audio.state.currentAyah = targetA;
        audio.state.totalAyahs = meta.total_ayahs;
        audio.state.surahName = displayName;
        audio.notify();
      }

      const sStr = String(surah);
      const basmeihSurah = translations.basmeih?.[sStr] || {};
      const basmeihHarfiahSurah = translations.basmeihHarfiah?.[sStr] || {};
      const jalalaynSurah = translations.jalalayn?.[sStr] || {};
      const sahihSurah = translations.sahih?.[sStr] || {};
      const pickthallSurah = translations.pickthall?.[sStr] || {};
      const kemenagSurah = translations.kemenag?.[sStr] || {};

      // Hifz Memorization Toolbar
      const hifz = store.settings.hifz || {};
      const hifzToolbarHtml = hifz.active
        ? `
          <div class="hifz-toolbar" id="hifz-active-toolbar">
            <div class="hifz-toolbar-title">
              <span>🧠 Tahfiz / Hifz Controls</span>
            </div>
            <div class="hifz-controls-group">
              <label style="font-size: 0.8rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.35rem;">
                <span>Repeat:</span>
                <select id="hifz-repeat-select" class="select-input" style="padding: 0.2rem 0.4rem; font-size: 0.8rem;">
                  <option value="1" ${hifz.repeatCount === 1 ? 'selected' : ''}>1x</option>
                  <option value="2" ${hifz.repeatCount === 2 ? 'selected' : ''}>2x</option>
                  <option value="3" ${hifz.repeatCount === 3 ? 'selected' : ''}>3x</option>
                  <option value="5" ${hifz.repeatCount === 5 ? 'selected' : ''}>5x</option>
                  <option value="10" ${hifz.repeatCount === 10 ? 'selected' : ''}>10x</option>
                </select>
              </label>

              <label style="font-size: 0.8rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.35rem;">
                <span>Pause:</span>
                <select id="hifz-delay-select" class="select-input" style="padding: 0.2rem 0.4rem; font-size: 0.8rem;">
                  <option value="0" ${hifz.delaySeconds === 0 ? 'selected' : ''}>0s</option>
                  <option value="1" ${hifz.delaySeconds === 1 ? 'selected' : ''}>1s</option>
                  <option value="2" ${hifz.delaySeconds === 2 ? 'selected' : ''}>2s</option>
                  <option value="3" ${hifz.delaySeconds === 3 ? 'selected' : ''}>3s</option>
                  <option value="5" ${hifz.delaySeconds === 5 ? 'selected' : ''}>5s</option>
                </select>
              </label>

              <label style="font-size: 0.8rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.35rem;">
                <span>Range:</span>
                <input type="number" id="hifz-range-start" min="1" max="${meta.total_ayahs}" value="${hifz.rangeStart || 1}" style="width: 44px; padding: 2px 4px; background: var(--bg-main); border: 1px solid var(--border-subtle); color: #fff; text-align: center; border-radius: 4px; font-size: 0.8rem;">
                <span>to</span>
                <input type="number" id="hifz-range-end" min="1" max="${meta.total_ayahs}" value="${hifz.rangeEnd || meta.total_ayahs}" style="width: 44px; padding: 2px 4px; background: var(--bg-main); border: 1px solid var(--border-subtle); color: #fff; text-align: center; border-radius: 4px; font-size: 0.8rem;">
              </label>

              <label style="font-size: 0.8rem; color: var(--accent-gold); display: flex; align-items: center; gap: 0.35rem; cursor: pointer;">
                <input type="checkbox" id="hifz-blur-toggle" ${hifz.blurArabic ? 'checked' : ''}>
                <span>Blur (Recall Test)</span>
              </label>

              <button class="btn" id="hifz-toggle-all-reveal-btn" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">Reveal / Hide All</button>
            </div>
          </div>
        `
        : '';

      // Basmalah Banner logic: Show on 2-114 except 9
      const showBasmalah = surah !== 1 && surah !== 9;
      const basmalahHtml = showBasmalah
        ? `
          <div class="basmalah-card">
            <div class="basmalah-arabic">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
          </div>
        `
        : '';

      // Generate Verse Cards
      const isMs = i18n.getLanguage() === 'ms';
      const isJawi = store.settings.jawiMode;
      const isBlurred = hifz.active && hifz.blurArabic;
      const activeCount = Object.values(store.settings.activeTranslations || {}).filter(Boolean).length;
      const singleClass = activeCount <= 1 ? 'single-translation' : '';

      const verseCardsHtml = Object.entries(arabicData.ayahs)
        .map(([ayahNumStr, textObj]) => {
          const aNum = parseInt(ayahNumStr, 10);
          const ref = `${surah}:${aNum}`;
          const isSaved = store.isBookmarked(ref);
          const note = notesMap.get(ref);
          const hasNote = Boolean(note);
          const hasAsbab = store.hasAsbab(surah, aNum);
          const hadithRefs = store.getHadithRefs(surah, aNum);
          const firstHadith = hadithRefs.length > 0 ? hadithRefs[0] : null;
          const msRawText = basmeihSurah[ayahNumStr] || '';
          const msDisplayText = isJawi ? rumiToJawi(msRawText) : msRawText;
          const msHarfiahRawText = basmeihHarfiahSurah[ayahNumStr] || '';
          const msHarfiahDisplayText = isJawi ? rumiToJawi(msHarfiahRawText) : msHarfiahRawText;
          const msJalalaynText = jalalaynSurah[ayahNumStr] || '';
          const enSahihText = sahihSurah[ayahNumStr] || '';
          const enPickthallText = pickthallSurah[ayahNumStr] || '';
          const idKemenagText = kemenagSurah[ayahNumStr] || '';

          const arabicClass = isBlurred ? 'verse-arabic hifz-blurred' : 'verse-arabic';
          const msClass = isJawi ? 'translation-text jawi-text' : 'translation-text';

          const hifzRecord = store.getHifzMastery ? store.getHifzMastery(surah, aNum) : null;
          const hifzStatus = hifzRecord ? hifzRecord.status : null;
          let hifzLabel = i18n.t('hifzMastery.unmarked');
          let hifzClass = '';
          if (hifzStatus === 'learning') {
            hifzLabel = i18n.t('hifzMastery.learning');
            hifzClass = 'hifz-learning';
          } else if (hifzStatus === 'memorized') {
            hifzLabel = i18n.t('hifzMastery.memorized');
            hifzClass = 'hifz-memorized';
          } else if (hifzStatus === 'needs_review') {
            hifzLabel = i18n.t('hifzMastery.needsReview');
            hifzClass = 'hifz-needs_review';
          }

          return `
            <div class="verse-card has-card-body" data-surah="${surah}" data-ayah="${aNum}" id="verse-${surah}-${aNum}">
              <div class="verse-card-top">
                <a href="#${surah}:${aNum}" class="ayah-badge" title="${isMs ? 'Pautan terus ke ayat ini' : 'Direct link to this verse'}">${ref}</a>
                <div class="verse-actions">
                  <button class="verse-action-btn btn-play-ayah" data-surah="${surah}" data-ayah="${aNum}" title="${i18n.t('surah.tooltipPlay')}" aria-label="${i18n.t('surah.tooltipPlay')}">▶</button>
                  <button class="verse-action-btn btn-share-card" data-ref="${ref}" data-surah="${surah}" data-ayah="${aNum}" title="${i18n.t('surah.tooltipCard')}" aria-label="${i18n.t('surah.tooltipCard')}">📸</button>
                  <button class="verse-action-btn btn-hifz-mastery ${hifzClass}" data-ref="${ref}" data-surah="${surah}" data-ayah="${aNum}" title="${i18n.t('hifzMastery.badgeTitle')}: ${hifzLabel}" aria-label="${i18n.t('hifzMastery.badgeTitle')}: ${hifzLabel}">🧠</button>
                  <button class="verse-action-btn btn-bookmark-ayah ${isSaved ? 'bookmarked' : ''}" data-ref="${ref}" data-surah="${surah}" data-ayah="${aNum}" title="${isSaved ? i18n.t('surah.tooltipBookmarked') : i18n.t('surah.tooltipBookmark')}" aria-label="${isSaved ? i18n.t('surah.tooltipBookmarked') : i18n.t('surah.tooltipBookmark')}">★</button>
                  <button class="verse-action-btn btn-note-ayah ${hasNote ? 'has-note' : ''}" data-ref="${ref}" data-surah="${surah}" data-ayah="${aNum}" title="${i18n.t('surah.tooltipNote')}" aria-label="${i18n.t('surah.tooltipNote')}">📝</button>
                  <button class="verse-action-btn btn-copy-ayah" data-ref="${ref}" title="${i18n.t('surah.tooltipCopy')}" aria-label="${i18n.t('surah.tooltipCopy')}">📋</button>
                  <button class="verse-action-btn btn-copy-link-ayah" data-surah="${surah}" data-ayah="${aNum}" title="${isMs ? 'Salin Pautan Terus (#' + surah + ':' + aNum + ')' : 'Copy Direct Link (#' + surah + ':' + aNum + ')'}" aria-label="${isMs ? 'Salin Pautan Terus (#' + surah + ':' + aNum + ')' : 'Copy Direct Link (#' + surah + ':' + aNum + ')'}">🔗</button>
                  <a href="#ayah/${surah}/${aNum}" class="verse-action-btn btn-deepdive-ayah" style="text-decoration: none;" title="${i18n.t('surah.tooltipDeepDive')}" aria-label="${i18n.t('surah.tooltipDeepDive')}">🔬</a>
                  ${firstHadith ? `
                    <a href="../${firstHadith.repo}/#hadith-${firstHadith.hadith_number}" target="_blank" rel="noopener" class="verse-action-btn btn-hadith-badge" style="text-decoration:none; color: #d97706;" title="${isMs ? 'Buka Hadis Berkaitan (' + firstHadith.title + ')' : 'Open Related Hadith (' + firstHadith.title + ')'}" aria-label="Hadith">📖</a>
                  ` : ''}
                  ${hasAsbab ? `
                    <a href="#ayah/${surah}/${aNum}?tab=asbab" class="verse-action-btn btn-asbab-badge" title="${i18n.t('surah.tooltipAsbab')}" aria-label="${i18n.t('surah.tooltipAsbab')}">📜</a>
                  ` : ''}
                </div>
              </div>

              <div class="verse-card-body">
                <div class="${arabicClass}" title="${isBlurred ? 'Click to reveal verse for memorization test' : ''}">${colorizeTajweed(textObj.uthmani)}</div>

              <div class="verse-translations ${singleClass}">
                <div class="translation-block translation-block-basmeih-harfiah">
                  <span class="translation-label"><span class="lang-flag">🇲🇾</span> Basmeih Harfiah${isJawi ? ' (توليسن جاوي)' : ''}</span>
                  <p class="${msClass}">${msHarfiahDisplayText}</p>
                </div>
                <div class="translation-block translation-block-basmeih">
                  <span class="translation-label"><span class="lang-flag">🇲🇾</span> JAKIM — Pimpinan Ar-Rahman (${isJawi ? 'توليسن جاوي' : 'Bahasa Melayu'})</span>
                  <p class="${msClass}">${msDisplayText}</p>
                </div>
                <div class="translation-block translation-block-jalalayn">
                  <span class="translation-label"><span class="lang-flag">🇲🇾</span> Tafsir al-Jalalayn (Bahasa Melayu / Nusantara)</span>
                  <p class="translation-text">${msJalalaynText}</p>
                </div>
                <div class="translation-block translation-block-kemenag">
                  <span class="translation-label"><span class="lang-flag">🇮🇩</span> Kemenag (Bahasa Indonesia)</span>
                  <p class="translation-text">${idKemenagText}</p>
                </div>
                <div class="translation-block translation-block-sahih">
                  <span class="translation-label"><span class="lang-flag">🇬🇧</span> Sahih International (English)</span>
                  <p class="translation-text">${enSahihText}</p>
                </div>
                <div class="translation-block translation-block-pickthall">
                  <span class="translation-label"><span class="lang-flag">🇬🇧</span> Pickthall (English Literary)</span>
                  <p class="translation-text">${enPickthallText}</p>
                </div>
              </div>

              ${
                hasNote
                  ? `
                <div class="verse-note-snippet" id="note-snippet-${ref}">
                  <div class="verse-note-snippet-header">
                    <span>${i18n.t('surah.studyNoteHeader')}</span>
                    <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: normal;">${new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div style="line-height: 1.4;">${this.escapeHtml(note.text)}</div>
                </div>
              `
                  : `<div id="note-snippet-${ref}"></div>`
              }

                <div class="verse-card-footer">
                  <span class="verse-citation">${displayName} : ${aNum}</span>
                </div>
              </div>
            </div>
          `;
        })
        .join('');

      const asbabVersesCount = Object.keys(arabicData.ayahs).filter((aNum) => store.hasAsbab(surah, aNum)).length;
      const revelationText = meta.revelation_place === 'madinah' || meta.revelation_type?.toLowerCase() === 'medinan'
        ? i18n.t('surah.medinan')
        : i18n.t('surah.meccan');

      this.mainContainer.innerHTML = `
        <div class="surah-header-card">
          <div class="surah-header-arabic">${meta.name_arabic}</div>
          <div class="surah-header-latin">${displayName}</div>
          <div class="surah-header-trans">${displayTrans}</div>
          <div class="surah-meta-badges">
            <span class="meta-badge revelation">${revelationText}</span>
            <span class="meta-badge">${i18n.t('surah.versesCount', { n: meta.total_ayahs })}</span>
            <span class="meta-badge">${i18n.t('surah.surahNumber', { n: meta.number })}</span>
            ${asbabVersesCount > 0 ? `<span class="meta-badge asbab-count-badge" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.4); background: rgba(56, 189, 248, 0.08);">📜 ${asbabVersesCount} ${isMs ? 'Asbabun Nuzul' : 'Asbab al-Nuzul'}</span>` : ''}
          </div>
          <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-primary" id="btn-play-surah-continuous">
              ▶ ${i18n.t('surah.playFullSurah')}
            </button>
            <a href="#mushaf/${(SURAH_START_PAGES && SURAH_START_PAGES[surah]) || 1}" class="btn" style="text-decoration: none;">
              📄 ${i18n.t('surah.openMushaf')}
            </a>
          </div>
        </div>

        ${hifzToolbarHtml}
        ${basmalahHtml}

        <div class="verses-container">
          ${verseCardsHtml}
        </div>
      `;

      this.updateActiveTranslationsDisplay();
      this.attachSurahViewEvents(surah, meta, arabicData, basmeihSurah, sahihSurah, basmeihHarfiahSurah);

      // Handle target ayah scroll & highlight (e.g. #surah/6/12, #surah/8/57)
      const basePath = window.location.pathname.replace(/\/index\.html$/, '/');
      if (targetAyah) {
        const ayahAr = arabicData.ayahs[String(targetAyah)]?.uthmani || '';
        const ayahTrans = basmeihHarfiahSurah[String(targetAyah)] || basmeihSurah[String(targetAyah)] || sahihSurah[String(targetAyah)] || '';
        this.updatePageMeta({
          title: `Surah ${displayName} ${surah}:${targetAyah} — Maktabah Maftoohah Al-Quran`,
          description: `${ayahAr} — "${ayahTrans}" (Surah ${displayName} ${surah}:${targetAyah})`,
          url: `${window.location.origin}${basePath}#${surah}:${targetAyah}`
        });
        this.scrollToAyah(surah, targetAyah, { smooth: false });
      } else {
        this.updatePageMeta({
          title: `Surah ${displayName} (${surah}) — Maktabah Maftoohah Al-Quran`,
          description: `Baca dan teliti Surah ${displayName} (${surah}) dengan teks Uthmani, terjemahan Melayu & Inggeris, morfologi kata, dan audio penuh.`,
          url: `${window.location.origin}${basePath}#surah/${surah}`
        });
        if (this.mainContainer) {
          this.mainContainer.scrollTo({ top: 0, behavior: 'auto' });
        }
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    } catch (err) {
      console.error('Error rendering surah view:', err);
      this.mainContainer.innerHTML = `<div style="padding: 2rem; color: var(--danger);">Failed to load surah view: ${err.message}</div>`;
    }
  }

  scrollToAyah(surah, targetAyah, { smooth = false } = {}) {
    if (!targetAyah) return;
    const cardId = `verse-${surah}-${targetAyah}`;
    const card = document.getElementById(cardId);
    if (!card) return;

    // Highlight target card
    document.querySelectorAll('.verse-card.highlight-target').forEach((c) => {
      if (c !== card) c.classList.remove('highlight-target');
    });
    card.classList.add('highlight-target');

    const performScroll = (behavior = 'instant') => {
      const el = document.getElementById(cardId);
      if (!el) return;
      const container = this.mainContainer;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const offset = 20;
        const targetScrollTop = container.scrollTop + (elRect.top - containerRect.top) - offset;
        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: behavior
        });
      }
      window.scrollTo({
        top: 0,
        behavior: 'instant'
      });
    };

    // 1. Initial scroll (instant jump to position without fighting scroll-behavior: smooth)
    performScroll(smooth ? 'smooth' : 'instant');

    // 2. Refined scroll after fonts & dynamic layout settle
    const settleScroll = () => {
      requestAnimationFrame(() => {
        performScroll(smooth ? 'smooth' : 'instant');
      });
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(settleScroll);
    }
    setTimeout(settleScroll, 100);
    setTimeout(settleScroll, 300);
  }

  updatePageMeta({ title, description, url } = {}) {
    if (title) {
      document.title = title;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);
      const twTitle = document.querySelector('meta[name="twitter:title"]');
      if (twTitle) twTitle.setAttribute('content', title);
    }
    if (description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', description);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', description);
      const twDesc = document.querySelector('meta[name="twitter:description"]');
      if (twDesc) twDesc.setAttribute('content', description);
    }
    if (url) {
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', url);
    }
  }

  renderUnseededSurahView(meta) {
    this.renderedSurah = null;
    const displayName = store.getSurahName(meta);
    const displayTrans = store.getSurahTranslation(meta);
    const isMs = i18n.getLanguage() === 'ms';
    const revelationText = isMs
      ? (meta.revelation_type === 'Meccan' ? 'Makkiyyah' : 'Madaniyyah')
      : meta.revelation_type;

    this.mainContainer.innerHTML = `
      <div class="surah-header-card">
        <div class="surah-header-arabic">${meta.name_arabic}</div>
        <div class="surah-header-latin">${displayName}</div>
        <div class="surah-header-trans">${displayTrans}</div>
        <div class="surah-meta-badges">
          <span class="meta-badge revelation">${revelationText}</span>
          <span class="meta-badge">${i18n.t('surah.versesCount', { n: meta.total_ayahs })}</span>
        </div>
      </div>

      <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 2rem; text-align: center;">
        <h3 style="color: var(--accent-gold); margin-bottom: 0.75rem;">Seed Mode Active</h3>
        <p style="color: var(--text-secondary); max-width: 600px; margin: 0 auto 1.5rem; font-size: 0.95rem;">
          Surah ${meta.number} (${displayName}) is indexed, but its full text has not yet been extracted locally.
          In <strong>--seed</strong> mode, Surahs 1 (Al-Fatihah), 112 (Al-Ikhlas), 113 (Al-Falaq), and 114 (An-Nas) are fully compiled.
        </p>
        <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
          <a href="#surah/1" class="btn btn-primary">Open Surah 1 (Al-Fatihah)</a>
          <a href="#surah/112" class="btn">Open Surah 112 (Al-Ikhlas)</a>
          <a href="#surah/113" class="btn">Open Surah 113 (Al-Falaq)</a>
          <a href="#surah/114" class="btn">Open Surah 114 (An-Nas)</a>
        </div>
      </div>
    `;
  }

  attachSurahViewEvents(surah, meta, arabicData, basmeihSurah, sahihSurah, basmeihHarfiahSurah = {}) {
    const displayName = store.getSurahName(meta);
    const isMs = i18n.getLanguage() === 'ms';

    // Play Full Surah continuous
    const playSurahBtn = document.getElementById('btn-play-surah-continuous');
    if (playSurahBtn) {
      playSurahBtn.addEventListener('click', () => {
        if (audio.state.currentSurah === surah && audio.state.isPlaying && audio.state.isContinuous) {
          audio.pause();
        } else {
          audio.playAyah(surah, 1, {
            continuous: true,
            totalAyahs: meta.total_ayahs,
            surahName: displayName,
          });
          this.showToast(isMs ? `Memainkan ${displayName} secara berterusan` : `Playing ${displayName} continuously`);
        }
      });
    }

    // Individual Play Ayah
    this.mainContainer.querySelectorAll('.btn-play-ayah').forEach((btn) => {
      btn.addEventListener('click', () => {
        const aNum = parseInt(btn.getAttribute('data-ayah'), 10);
        if (audio.state.currentSurah === surah && audio.state.currentAyah === aNum && audio.state.isPlaying) {
          audio.pause();
        } else {
          audio.playAyah(surah, aNum, {
            continuous: false,
            totalAyahs: meta.total_ayahs,
            surahName: displayName,
          });
        }
      });
    });

    // Bookmark Toggle
    this.mainContainer.querySelectorAll('.btn-bookmark-ayah').forEach((btn) => {
      btn.addEventListener('click', () => {
        const aNum = parseInt(btn.getAttribute('data-ayah'), 10);
        const ref = `${surah}:${aNum}`;
        const ar = arabicData.ayahs[String(aNum)]?.uthmani || '';
        const en = sahihSurah[String(aNum)] || '';
        const ms = basmeihHarfiahSurah[String(aNum)] || basmeihSurah[String(aNum)] || '';

        const isSaved = store.toggleBookmark({
          ref,
          surah,
          ayah: aNum,
          surahName: displayName,
          ar,
          en,
          ms,
          folder: this.activeBookmarkFolder && this.activeBookmarkFolder !== 'all' ? this.activeBookmarkFolder : 'Lalai',
        });

        btn.classList.toggle('bookmarked', isSaved);
        btn.innerHTML = '★';
        const bmTitle = isSaved ? i18n.t('surah.tooltipBookmarked') : i18n.t('surah.tooltipBookmark');
        btn.title = bmTitle;
        btn.setAttribute('aria-label', bmTitle);
        this.showToast(isSaved ? i18n.t('surah.toastBookmarkAdded', { ref }) : i18n.t('surah.toastBookmarkRemoved', { ref }));
        this.renderSidebarBookmarks();
      });
    });

    // Hifz Mastery Button (Cloud Spaced Repetition)
    this.mainContainer.querySelectorAll('.btn-hifz-mastery').forEach((btn) => {
      btn.addEventListener('click', () => {
        const s = parseInt(btn.getAttribute('data-surah'), 10);
        const a = parseInt(btn.getAttribute('data-ayah'), 10);
        const ref = `${s}:${a}`;
        const cur = store.getHifzMastery ? store.getHifzMastery(s, a)?.status : null;
        let nextStatus = null;
        if (!cur) nextStatus = 'learning';
        else if (cur === 'learning') nextStatus = 'memorized';
        else if (cur === 'memorized') nextStatus = 'needs_review';
        else nextStatus = null;

        if (store.setHifzMastery) {
          store.setHifzMastery(s, a, nextStatus);
        }
        if (store.recordDailyActivity) {
          store.recordDailyActivity();
        }
        this.updateKhatamUI();

        btn.classList.remove('hifz-learning', 'hifz-memorized', 'hifz-needs_review');
        let label = i18n.t('hifzMastery.unmarked');
        if (nextStatus === 'learning') {
          label = i18n.t('hifzMastery.learning');
          btn.classList.add('hifz-learning');
        } else if (nextStatus === 'memorized') {
          label = i18n.t('hifzMastery.memorized');
          btn.classList.add('hifz-memorized');
        } else if (nextStatus === 'needs_review') {
          label = i18n.t('hifzMastery.needsReview');
          btn.classList.add('hifz-needs_review');
        }
        btn.innerHTML = '🧠';
        const hifzTooltip = `${i18n.t('hifzMastery.badgeTitle')}: ${label}`;
        btn.title = hifzTooltip;
        btn.setAttribute('aria-label', hifzTooltip);
        this.showToast(i18n.t('hifzMastery.toastUpdated', { ref, status: label }));
      });
    });

    // Personal Study Note Button (IndexedDB)
    this.mainContainer.querySelectorAll('.btn-note-ayah').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ref = btn.getAttribute('data-ref');
        const s = parseInt(btn.getAttribute('data-surah'), 10);
        const a = parseInt(btn.getAttribute('data-ayah'), 10);
        const ar = arabicData.ayahs[String(a)]?.uthmani || '';
        const trans = basmeihHarfiahSurah[String(a)] || basmeihSurah[String(a)] || sahihSurah[String(a)] || '';
        this.openNoteModal({
          ref,
          surah: s,
          ayah: a,
          surahName: displayName,
          ar,
          trans,
        });
      });
    });

    // Copy Verse (Arabic + Translation + (Al-Quran S:A))
    this.mainContainer.querySelectorAll('.btn-copy-ayah').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ref = btn.getAttribute('data-ref');
        const [s, a] = ref.split(':');
        const card = btn.closest('.verse-card');
        const ar = card?.querySelector('.verse-arabic')?.textContent.trim() || arabicData.ayahs[a]?.uthmani || '';

        // Extract visible translations from the card
        const visibleBlocks = card
          ? Array.from(card.querySelectorAll('.translation-block')).filter(
              (block) => window.getComputedStyle(block).display !== 'none'
            )
          : [];

        let translationText = '';
        if (visibleBlocks.length > 0) {
          const transLines = visibleBlocks
            .map((block) => {
              const p = block.querySelector('.translation-text');
              return p ? p.textContent.trim() : '';
            })
            .filter(Boolean);
          translationText = transLines.join('\n\n');
        }

        // Fallback if no block was found
        if (!translationText) {
          translationText = basmeihHarfiahSurah[a] || basmeihSurah[a] || sahihSurah[a] || '';
        }

        const clipboardText = `${ar}\n\n${translationText}\n\n(Al-Quran ${s}:${a})`;
        this.copyToClipboard(clipboardText, i18n.t('surah.toastCopied', { ref: `${s}:${a}` }));
      });
    });

    // Copy Direct Ayah Link (Clean Path for Rich Social Unfurling)
    this.mainContainer.querySelectorAll('.btn-copy-link-ayah').forEach((btn) => {
      btn.addEventListener('click', () => {
        const s = btn.getAttribute('data-surah');
        const a = btn.getAttribute('data-ayah');
        const repoBase = window.location.pathname.startsWith('/al-quran') ? '/al-quran/' : '/';
        const directUrl = `${window.location.origin}${repoBase}${s}/${a}`;
        this.copyToClipboard(directUrl, i18n.t('surah.toastLinkCopied', { ref: `${s}:${a}` }));
      });
    });

    // Shareable Verse Card
    this.mainContainer.querySelectorAll('.btn-share-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ref = btn.getAttribute('data-ref');
        const [s, a] = ref.split(':');
        const ar = arabicData.ayahs[a]?.uthmani || '';
        const trans = basmeihHarfiahSurah[a] || basmeihSurah[a] || sahihSurah[a] || '';
        const transLabel = basmeihHarfiahSurah[a] ? 'Basmeih Harfiah' : (basmeihSurah[a] ? 'Abdullah Muhammad Basmeih' : 'Saheeh International');
        cardGenerator.open({
          ar,
          trans,
          transLabel,
          surahName: displayName,
          ref,
        });
      });
    });

    // Hifz Blur Click-To-Reveal
    this.mainContainer.querySelectorAll('.verse-arabic.hifz-blurred').forEach((el) => {
      el.addEventListener('click', () => {
        el.classList.toggle('revealed');
      });
    });

    // Hifz Reveal/Hide All Toggle
    const toggleRevealBtn = document.getElementById('hifz-toggle-all-reveal-btn');
    if (toggleRevealBtn) {
      toggleRevealBtn.addEventListener('click', () => {
        const blurredEls = this.mainContainer.querySelectorAll('.verse-arabic.hifz-blurred');
        const allRevealed = Array.from(blurredEls).every((el) => el.classList.contains('revealed'));
        blurredEls.forEach((el) => el.classList.toggle('revealed', !allRevealed));
      });
    }

    // Hifz Setting Controls
    const repeatSelect = document.getElementById('hifz-repeat-select');
    if (repeatSelect) {
      repeatSelect.addEventListener('change', () => {
        store.updateSettings({
          hifz: { ...(store.settings.hifz || {}), repeatCount: parseInt(repeatSelect.value, 10) },
        });
        this.showToast(`Hifz: Repeat set to ${repeatSelect.value}x`);
      });
    }

    const delaySelect = document.getElementById('hifz-delay-select');
    if (delaySelect) {
      delaySelect.addEventListener('change', () => {
        store.updateSettings({
          hifz: { ...(store.settings.hifz || {}), delaySeconds: parseInt(delaySelect.value, 10) },
        });
        this.showToast(`Hifz: Pause delay set to ${delaySelect.value}s`);
      });
    }

    const blurToggle = document.getElementById('hifz-blur-toggle');
    if (blurToggle) {
      blurToggle.addEventListener('change', () => {
        store.updateSettings({
          hifz: { ...(store.settings.hifz || {}), blurArabic: blurToggle.checked },
        });
        this.renderedSurah = null;
        this.renderSurahView({ surah });
      });
    }

    const rangeStart = document.getElementById('hifz-range-start');
    const rangeEnd = document.getElementById('hifz-range-end');
    const handleRangeChange = () => {
      const sVal = parseInt(rangeStart?.value, 10) || 1;
      const eVal = parseInt(rangeEnd?.value, 10) || meta.total_ayahs;
      store.updateSettings({
        hifz: { ...(store.settings.hifz || {}), rangeStart: sVal, rangeEnd: eVal },
      });
    };
    if (rangeStart) rangeStart.addEventListener('change', handleRangeChange);
    if (rangeEnd) rangeEnd.addEventListener('change', handleRangeChange);
  }

  /**
   * Ayah Deep-Dive Comparison View (#ayah/:surah/:ayah)
   */
  async renderAyahDeepDive({ surah, ayah, tab }) {
    this.renderedSurah = null;
    if (this.mainContainer) {
      this.mainContainer.scrollTo({ top: 0, behavior: 'auto' });
    }
    this.mainContainer.innerHTML = '<div style="padding: 3rem; text-align: center; color: var(--text-muted);">Loading Ayah Deep-Dive...</div>';

    try {
      const meta = await store.getSurahMeta(surah);
      if (!meta) {
        this.mainContainer.innerHTML = `<div style="padding: 2rem; color: var(--danger);">Surah ${surah} not found.</div>`;
        return;
      }

      if (!meta.seeded) {
        this.renderUnseededSurahView(meta);
        return;
      }

      const [arabicData, morphologyData, translations, existingNote] = await Promise.all([
        store.fetchArabic(surah),
        store.fetchMorphology(surah),
        store.fetchTranslations(false),
        storageDB.getNote(`${surah}:${ayah}`),
        store.fetchAsbab().catch(() => ({})),
      ]);

      const asbab = store.getAsbab(surah, ayah);

      const aStr = String(ayah);
      const sStr = String(surah);
      const uthmaniText = arabicData.ayahs[aStr]?.uthmani || '';
      const tokens = morphologyData.ayahs[aStr] || [];
      const msText = translations.basmeih?.[sStr]?.[aStr] || '';
      const msHarfiahText = translations.basmeihHarfiah?.[sStr]?.[aStr] || '';
      const msJalalayn = translations.jalalayn?.[sStr]?.[aStr] || '';
      const idText = translations.kemenag?.[sStr]?.[aStr] || '';
      const sahihText = translations.sahih?.[sStr]?.[aStr] || '';
      const pickthallText = translations.pickthall?.[sStr]?.[aStr] || '';

      const isMs = i18n.getLanguage() === 'ms';
      const isJawi = store.settings.jawiMode;
      const msDisplayText = isJawi ? rumiToJawi(msText) : msText;
      const msHarfiahDisplayText = isJawi ? rumiToJawi(msHarfiahText) : msHarfiahText;
      const msClass = isJawi ? 'translation-text jawi-text' : 'translation-text';
      const activeCount = Object.values(store.settings.activeTranslations || {}).filter(Boolean).length;
      const singleClass = activeCount <= 1 ? 'single-translation' : '';

      const displayName = store.getSurahName(meta);
      store.setLastRead(surah, ayah, displayName);

      const ayahTitle = isMs
        ? `Ayat ${surah}:${ayah} (${displayName}) — Maktabah Maftoohah Al-Quran`
        : `Verse ${surah}:${ayah} (${displayName}) — Maktabah Maftoohah Al-Quran`;
      const deepBasePath = window.location.pathname.replace(/\/index\.html$/, '/');
      this.updatePageMeta({
        title: ayahTitle,
        description: `${uthmaniText} — "${msHarfiahText || msText || sahihText}" (Surah ${displayName} ${surah}:${ayah})`,
        url: `${window.location.origin}${deepBasePath}#ayah/${surah}/${ayah}`
      });

      if (!audio.state.isPlaying) {
        audio.state.currentSurah = surah;
        audio.state.currentAyah = ayah;
        audio.state.totalAyahs = meta.total_ayahs;
        audio.state.surahName = displayName;
        audio.notify();
      }

      // Navigation links
      const prevAyah = ayah > 1 ? ayah - 1 : null;
      const nextAyah = ayah < meta.total_ayahs ? ayah + 1 : null;

      // Word cards HTML
      const isMalay = i18n.getLanguage() === 'ms';
      const wbwLang = store.settings.wbwLanguage || 'dual';
      const wordCardsHtml = tokens
        .map(
          (token) => {
            let glossPrimary = '';
            let glossSecondary = '';
            if (wbwLang === 'dual') {
              glossPrimary = token.ms || token.id || '';
              glossSecondary = token.en || '';
            } else if (wbwLang === 'en') {
              glossPrimary = token.en || '';
            } else if (wbwLang === 'id') {
              glossPrimary = token.id || token.ms || token.en || '';
            } else {
              glossPrimary = token.ms || token.id || token.en || '';
            }
            const displayGloss = (isJawi && wbwLang !== 'en') ? rumiToJawi(glossPrimary) : glossPrimary;
            return `
          <div class="word-card" data-pos="${token.pos}">
            <button class="word-speaker-btn" title="${isMalay ? 'Sebut perkataan' : 'Pronounce word'}" data-pos="${token.pos}">
              🔊
            </button>
            <div class="word-arabic">${token.ar}</div>
            <div class="word-translit">${token.tr}</div>
            <div class="word-gloss ${isJawi && wbwLang !== 'en' ? 'jawi-text' : ''}">${displayGloss}</div>
            ${glossSecondary ? `<div class="word-gloss-secondary">${glossSecondary}</div>` : ''}
            ${token.root ? `<a href="${APP_CONFIG.corpusBaseUrl}?lang=${i18n.getLanguage()}#root/${encodeURIComponent(token.root)}" target="_blank" rel="noopener noreferrer" class="word-root-badge" title="${isMalay ? 'Buka Mu\'jam Akar di Korpus' : 'Open Root in Corpus'}">${token.root} ↗</a>` : `<div class="word-root-badge" style="color: var(--text-muted); border-color: var(--border-subtle);">${token.pos_tag}</div>`}
          </div>
        `;
          }
        )
        .join('');

      const backText = i18n.t('deepDive.backBtn', { n: `${displayName} (${surah})` });

      this.mainContainer.innerHTML = `
        <div class="deepdive-container">
          <div class="deepdive-nav-bar">
            <a href="#${surah}:${ayah}" class="breadcrumb-link">
              ${backText}
            </a>
            <div class="deepdive-nav-controls">
              ${prevAyah ? `<a href="#ayah/${surah}/${prevAyah}" class="btn">← Ayah ${prevAyah}</a>` : ''}
              <span class="ayah-badge" style="font-size: 0.95rem;">${surah}:${ayah}</span>
              ${nextAyah ? `<a href="#ayah/${surah}/${nextAyah}" class="btn">Ayah ${nextAyah} →</a>` : ''}
              <button class="btn btn-copy-deepdive-link" data-surah="${surah}" data-ayah="${ayah}" title="${isMs ? 'Salin Pautan Terus (#' + surah + ':' + ayah + ')' : 'Copy Direct Link (#' + surah + ':' + ayah + ')'}">
                ${i18n.t('deepDive.btnCopyLink')}
              </button>
              <button class="btn btn-copy-deepdive-ai" data-surah="${surah}" data-ayah="${ayah}" title="${isMs ? 'Salin Format Rujukan untuk AI (ChatGPT/Claude/Gemini)' : 'Copy Citation for AI Chat'}">
                ${i18n.t('deepDive.btnCopyAi')}
              </button>
            </div>
          </div>

          <!-- Audio Recitation Bar -->
          <div class="deepdive-audio-bar">
            <div class="audio-controls-left">
              <button class="btn btn-primary" id="btn-deepdive-play">
                ▶ ${i18n.t('deepDive.playRecitation')}
              </button>
              <select class="reciter-select" id="deepdive-reciter-select">
                <option value="Alafasy_128kbps">Mishary Alafasy</option>
                <option value="Husary_128kbps">Mahmoud Al-Husary</option>
                <option value="Abdul_Basit_Murattal_192kbps">Abdul Basit</option>
              </select>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <select class="select-input" id="deepdive-speed-select">
                <option value="0.75">0.75x</option>
                <option value="1.0" selected>1.0x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
              </select>
              <label class="player-option-toggle" id="deepdive-loop-toggle">
                <input type="checkbox" ${store.settings.loopAyah ? 'checked' : ''}/>
                <span>${i18n.t('deepDive.loopAyah')}</span>
              </label>
            </div>
          </div>

          <!-- Full Ayah Arabic Card -->
          <div class="verse-card">
            <div class="verse-arabic" style="font-size: calc(var(--arabic-size) * 1.1); margin-bottom: 0;">
              ${colorizeTajweed(uthmaniText)}
            </div>
          </div>

          <!-- Interactive Word-by-Word & Morphology Grid -->
          <div class="wbw-section">
            <div class="section-title" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <span>${i18n.t('deepDive.wbwSectionTitle')}</span>
                <span style="font-size: 0.78rem; font-weight: 500; color: var(--text-muted); margin-left: 0.4rem;">${i18n.t('deepDive.wbwHint')}</span>
              </div>
              <div class="wbw-lang-pills">
                <span style="font-size: 0.75rem; color: var(--text-muted); margin-right: 0.2rem;">${i18n.t('deepDive.wbwLangWord')}</span>
                <button class="btn btn-wbw-lang ${wbwLang === 'dual' ? 'active btn-primary' : ''}" data-wbw="dual">${i18n.t('deepDive.wbwLangDual')}</button>
                <button class="btn btn-wbw-lang ${wbwLang === 'ms' ? 'active btn-primary' : ''}" data-wbw="ms">${i18n.t('deepDive.wbwLangMs')}</button>
                <button class="btn btn-wbw-lang ${wbwLang === 'en' ? 'active btn-primary' : ''}" data-wbw="en">${i18n.t('deepDive.wbwLangEn')}</button>
                <button class="btn btn-wbw-lang ${wbwLang === 'id' ? 'active btn-primary' : ''}" data-wbw="id">${i18n.t('deepDive.wbwLangId')}</button>
              </div>
            </div>
            <div class="wbw-grid">
              ${wordCardsHtml}
            </div>
          </div>

          <!-- Categorized Translations & On-Demand Tafsir -->
          <div class="deepdive-tabs-section">
            <div class="tabs-header">
              <button class="tab-btn active" data-tab="translations">${i18n.t('deepDive.tabTranslations')}</button>
              <button class="tab-btn" data-tab="tafsir">${i18n.t('deepDive.tabTafsir')}</button>
              <button class="tab-btn" data-tab="asbab">📜 ${i18n.t('deepDive.tabAsbab')}${asbab ? ' •' : ''}</button>
              <button class="tab-btn" data-tab="notes">📝 ${i18n.t('deepDive.tabNotes')}</button>
            </div>

            <div class="tab-pane active" id="pane-translations" data-surah="${surah}" data-ayah="${ayah}">
              <div class="verse-translations ${singleClass}" style="border: none; padding: 0;">
                <div class="translation-block translation-block-basmeih-harfiah">
                  <span class="translation-label"><span class="lang-flag">🇲🇾</span> Basmeih Harfiah${isJawi ? ' (توليسن جاوي)' : ''}</span>
                  <p class="${msClass}">${msHarfiahDisplayText}</p>
                </div>
                <div class="translation-block translation-block-basmeih">
                  <span class="translation-label"><span class="lang-flag">🇲🇾</span> JAKIM — Pimpinan Ar-Rahman (${isJawi ? 'توليسن جاوي' : 'Bahasa Melayu'})</span>
                  <p class="${msClass}">${msDisplayText}</p>
                </div>
                <div class="translation-block translation-block-jalalayn">
                  <span class="translation-label"><span class="lang-flag">🇲🇾</span> Tafsir al-Jalalayn (Bahasa Melayu / Nusantara)</span>
                  <p class="translation-text">${msJalalayn}</p>
                </div>
                <div class="translation-block translation-block-kemenag">
                  <span class="translation-label"><span class="lang-flag">🇮🇩</span> Kemenag (Bahasa Indonesia)</span>
                  <p class="translation-text">${idText}</p>
                </div>
                <div class="translation-block translation-block-sahih">
                  <span class="translation-label"><span class="lang-flag">🇬🇧</span> Sahih International (English)</span>
                  <p class="translation-text">${sahihText}</p>
                </div>
                <div class="translation-block translation-block-pickthall">
                  <span class="translation-label"><span class="lang-flag">🇬🇧</span> Pickthall (English Literary)</span>
                  <p class="translation-text">${pickthallText}</p>
                </div>
                <div class="no-translations-notice" style="display: none; padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
                  ${i18n.t('deepDive.noTranslationsNotice')}
                </div>
              </div>
            </div>

            <div class="tab-pane" id="pane-tafsir">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.6rem;">
                <span class="tafsir-source" style="margin: 0;">${i18n.t('deepDive.classicalCommentary')}</span>
                <select id="tafsir-edition-select" class="select-input">
                  <option value="ms-al-jalalayn" selected>🇲🇾 Tafsir al-Jalalayn (Bahasa Melayu / Nusantara)</option>
                  <option value="en-al-jalalayn">🇬🇧 Tafsir al-Jalalayn (English)</option>
                  <option value="en-ibn-kathir">🇬🇧 Tafsir Ibn Kathir (English)</option>
                </select>
              </div>
              <div class="tafsir-content" id="tafsir-body-text">
                <div style="color: var(--text-muted);">${i18n.t('deepDive.loadCommentaryPlaceholder', { ref: `${surah}:${ayah}` })}</div>
              </div>
            </div>

            <div class="tab-pane" id="pane-asbab">
              ${asbab ? `
                <div class="asbab-container">
                  <div class="asbab-header-bar">
                    <div class="asbab-badge-pill">
                      <span class="asbab-icon">📜</span>
                      <span class="asbab-title">${i18n.t('deepDive.asbabHeader')}</span>
                    </div>
                    <span class="asbab-source-tag">${this.escapeHtml(asbab.source || 'Lubabun Nuqul (As-Suyuthi)')}</span>
                  </div>

                  ${asbab.text_ar ? `
                    <div class="asbab-arabic-card">
                      <div class="asbab-section-title">${i18n.t('deepDive.asbabHadithText')}</div>
                      <div class="asbab-ar-text" dir="rtl">${this.escapeHtml(asbab.text_ar)}</div>
                    </div>
                  ` : ''}

                  <div class="asbab-narrative-card">
                    <div class="asbab-section-title">
                      <span class="lang-flag">${isMs ? '🇲🇾' : '🇬🇧'}</span>
                      <span>${isMs ? 'Huraian Peristiwa & Konteks Sejarah' : 'Historical Context & Revelation Occasion'}</span>
                    </div>
                    <p class="asbab-text-body">${this.escapeHtml(isMs ? asbab.text : (asbab.text_en || asbab.text))}</p>
                  </div>

                  ${!isMs && asbab.text ? `
                    <div class="asbab-narrative-card secondary" style="margin-top: 0.85rem; opacity: 0.9;">
                      <div class="asbab-section-title">
                        <span class="lang-flag">🇲🇾</span>
                        <span>Nusantara / Malay Context</span>
                      </div>
                      <p class="asbab-text-body" style="font-size: 0.95rem;">${this.escapeHtml(asbab.text)}</p>
                    </div>
                  ` : ''}

                  ${isMs && asbab.text_en ? `
                    <div class="asbab-narrative-card secondary" style="margin-top: 0.85rem; opacity: 0.88;">
                      <div class="asbab-section-title">
                        <span class="lang-flag">🇬🇧</span>
                        <span>English Context & Summary</span>
                      </div>
                      <p class="asbab-text-body" style="font-size: 0.95rem;">${this.escapeHtml(asbab.text_en)}</p>
                    </div>
                  ` : ''}
                </div>
              ` : `
                <div class="asbab-empty-state">
                  <div class="asbab-empty-icon">📜</div>
                  <div class="asbab-empty-title">${i18n.t('deepDive.asbabEmptyTitle')}</div>
                  <p class="asbab-empty-desc">${i18n.t('deepDive.asbabEmptyDesc')}</p>
                  <div class="asbab-empty-note">
                    <span>ℹ️</span>
                    <span>${isMs ? 'Hanya sekitar ~500 daripada 6,236 ayat Al-Quran yang mempunyai riwayat peristiwa khusus (asbabun nuzul). Ayat-ayat selebihnya diturunkan sebagai prinsip am Islam.' : 'Only about ~500 of 6,236 verses in the Quran have specific historical revelation occasions. Other verses were revealed as universal timeless guidance.'}</span>
                  </div>
                </div>
              `}
            </div>

            <div class="tab-pane" id="pane-notes">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <span class="tafsir-source" style="margin: 0;">${i18n.t('deepDive.personalReflection')}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${existingNote ? i18n.t('deepDive.noteSaved', { date: new Date(existingNote.updatedAt).toLocaleDateString() }) : i18n.t('deepDive.noNoteYet')}</span>
              </div>
              <textarea id="deepdive-note-textarea" class="search-input-field" style="width: 100%; height: 130px; padding: 0.75rem; border-radius: var(--radius-sm); resize: vertical; font-family: var(--font-sans); font-size: 0.9rem;" placeholder="${i18n.t('deepDive.notePlaceholder')}">${existingNote ? this.escapeHtml(existingNote.text) : ''}</textarea>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem;">
                <button class="btn" id="btn-deepdive-delete-note" style="color: var(--danger); border-color: rgba(239, 68, 68, 0.3); ${existingNote ? '' : 'display: none;'}">🗑 ${i18n.t('deepDive.deleteNote')}</button>
                <button class="btn btn-primary" id="btn-deepdive-save-note">💾 ${i18n.t('deepDive.saveNote')}</button>
              </div>
            </div>
          </div>
        </div>
      `;

      this.attachDeepDiveEvents(surah, ayah, meta, tokens, tab);
      this.updateActiveTranslationsDisplay();
    } catch (err) {
      console.error('Error rendering deep dive:', err);
      this.mainContainer.innerHTML = `<div style="padding: 2rem; color: var(--danger);">Failed to load Ayah Deep-Dive: ${err.message}</div>`;
    }
  }

  attachDeepDiveEvents(surah, ayah, meta, tokens, initialTab) {
    const displayName = store.getSurahName(meta);

    // Deep-dive Direct Link copy (Clean Path for Rich Social Unfurling)
    const copyLinkBtn = this.mainContainer.querySelector('.btn-copy-deepdive-link');
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => {
        const repoBase = window.location.pathname.startsWith('/al-quran') ? '/al-quran/' : '/';
        const directUrl = `${window.location.origin}${repoBase}${surah}/${ayah}`;
        this.copyToClipboard(directUrl, i18n.t('surah.toastLinkCopied', { ref: `${surah}:${ayah}` }));
      });
    }

    // Deep-dive AI Citation copy (Clean Path for Rich Social Unfurling)
    const copyAiBtn = this.mainContainer.querySelector('.btn-copy-deepdive-ai');
    if (copyAiBtn) {
      copyAiBtn.addEventListener('click', () => {
        const repoBase = window.location.pathname.startsWith('/al-quran') ? '/al-quran/' : '/';
        const directUrl = `${window.location.origin}${repoBase}${surah}/${ayah}`;
        const transElem = this.mainContainer.querySelector('.tab-pane.active p.translation-text') || this.mainContainer.querySelector('.verse-translations p.translation-text');
        const transText = (transElem?.textContent || '').trim();
        const citation = `> "${transText}"\n> — Surah ${displayName} (${surah}:${ayah})\n${directUrl}`;
        this.copyToClipboard(citation, i18n.t('deepDive.toastAiCopied', { ref: `${surah}:${ayah}` }));
      });
    }

    // Play Ayah button in Deep Dive
    const playBtn = document.getElementById('btn-deepdive-play');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (audio.state.currentSurah === surah && audio.state.currentAyah === ayah && audio.state.isPlaying) {
          audio.pause();
          playBtn.innerHTML = `▶ ${i18n.t('deepDive.playRecitation')}`;
        } else {
          audio.playAyah(surah, ayah, {
            continuous: false,
            totalAyahs: meta.total_ayahs,
            surahName: displayName,
          });
          playBtn.innerHTML = `⏸ ${i18n.t('deepDive.pauseRecitation')}`;
        }
      });
    }

    // Reciter Select
    const recSelect = document.getElementById('deepdive-reciter-select');
    if (recSelect) {
      recSelect.value = store.settings.reciter;
      recSelect.addEventListener('change', () => {
        audio.setReciter(recSelect.value);
      });
    }

    // Speed Select
    const speedSelect = document.getElementById('deepdive-speed-select');
    if (speedSelect) {
      speedSelect.value = store.settings.speed.toString();
      speedSelect.addEventListener('change', () => {
        audio.setSpeed(parseFloat(speedSelect.value));
      });
    }

    // Loop Toggle
    const loopToggle = document.getElementById('deepdive-loop-toggle');
    if (loopToggle) {
      const checkbox = loopToggle.querySelector('input');
      checkbox.addEventListener('change', () => {
        store.updateSettings({ loopAyah: checkbox.checked });
        this.showToast(checkbox.checked ? 'Ayah loop enabled' : 'Ayah loop disabled');
      });
    }

    // Word-by-Word Language Switcher Pills
    this.mainContainer.querySelectorAll('.btn-wbw-lang').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const selected = btn.getAttribute('data-wbw');
        if (selected && selected !== store.settings.wbwLanguage) {
          store.updateSettings({ wbwLanguage: selected });
          const sel = document.getElementById('select-wbw-lang');
          if (sel) sel.value = selected;
          this.renderAyahDeepDive({ surah, ayah, tab: initialTab });
        }
      });
    });

    // Word cards click & speaker click
    this.mainContainer.querySelectorAll('.word-card').forEach((card) => {
      const pos = parseInt(card.getAttribute('data-pos'), 10);
      const token = tokens.find((t) => t.pos === pos);

      card.addEventListener('click', (e) => {
        if (e.target.closest('.word-speaker-btn')) {
          e.stopPropagation();
          audio.playWord(surah, ayah, pos);
          return;
        }
        if (token) {
          this.openMorphologyDrawer(token, surah, ayah);
        }
      });
    });

    // Deep dive tabs (Translations / Tafsir)
    const tabBtns = this.mainContainer.querySelectorAll('.tab-btn');
    const paneTranslations = document.getElementById('pane-translations');
    const paneTafsir = document.getElementById('pane-tafsir');
    const tafsirBody = document.getElementById('tafsir-body-text');
    const tafsirSelect = document.getElementById('tafsir-edition-select');

    const loadTafsirContent = async () => {
      const edition = tafsirSelect ? tafsirSelect.value : 'ms-al-jalalayn';
      const label = edition === 'en-ibn-kathir'
        ? 'Tafsir Ibn Kathir'
        : (edition === 'en-al-jalalayn' ? 'Tafsir al-Jalalayn (English)' : 'Tafsir al-Jalalayn (Melayu)');
      tafsirBody.innerHTML = `<div style="color: var(--accent-emerald);">Loading ${label}...</div>`;
      const tafsirData = await store.fetchTafsir(surah, ayah, edition);
      tafsirBody.innerHTML = `
        <div style="font-size: 1.05rem; line-height: 1.85; color: var(--text-primary);">
          ${this.escapeHtml(tafsirData.text || 'Ulasan tafsir tidak tersedia untuk ayat ini.')}
        </div>
      `;
    };

    if (tafsirSelect) {
      tafsirSelect.addEventListener('change', loadTafsirContent);
    }

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', async () => {
        tabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');

        this.mainContainer.querySelectorAll('.tab-pane').forEach((p) => p.classList.remove('active'));
        const targetPane = document.getElementById(`pane-${tab}`);
        if (targetPane) targetPane.classList.add('active');

        if (tab === 'tafsir') {
          await loadTafsirContent();
        }
      });
    });

    if (initialTab) {
      const activeBtn = this.mainContainer.querySelector(`.tab-btn[data-tab="${initialTab}"]`);
      if (activeBtn) {
        activeBtn.click();
      }
    }

    // Deep Dive Note Save
    const saveNoteBtn = document.getElementById('btn-deepdive-save-note');
    if (saveNoteBtn) {
      saveNoteBtn.addEventListener('click', async () => {
        const textarea = document.getElementById('deepdive-note-textarea');
        const text = textarea ? textarea.value.trim() : '';
        const ref = `${surah}:${ayah}`;
        const delBtn = document.getElementById('btn-deepdive-delete-note');

        if (!text) {
          await storageDB.deleteNote(ref);
          this.showToast(`Note for ${ref} deleted`);
          if (delBtn) delBtn.style.display = 'none';
        } else {
          await storageDB.saveNote(ref, {
            surah,
            ayah,
            surahName: displayName,
            ar: tokens.map((t) => t.ar).join(' '),
            translation: '',
            text,
          });
          this.showToast(`Note for ${ref} saved to IndexedDB`);
          if (delBtn) delBtn.style.display = 'block';
        }
        this.renderSidebarNotes();
      });
    }

    // Deep Dive Note Delete
    const deleteNoteBtn = document.getElementById('btn-deepdive-delete-note');
    if (deleteNoteBtn) {
      deleteNoteBtn.addEventListener('click', async () => {
        const ref = `${surah}:${ayah}`;
        await storageDB.deleteNote(ref);
        const textarea = document.getElementById('deepdive-note-textarea');
        if (textarea) textarea.value = '';
        deleteNoteBtn.style.display = 'none';
        this.showToast(`Note for ${ref} deleted`);
        this.renderSidebarNotes();
      });
    }
  }

  /**
   * 15-Line Madinah Mushaf Page View (#mushaf/:page)
   */
  updateMushafNavBtn() {
    const btn = document.getElementById('mushaf-mode-btn');
    if (btn) {
      const lastP = store.getLastMushafPage() || 1;
      btn.href = `#mushaf/${lastP}`;
    }
  }

  async renderMushafView({ page }) {
    this.updateMushafNavBtn();
    this.renderedSurah = null;
    this.updatePlayerControlsDirection();
    if (this.mainContainer) {
      this.mainContainer.scrollTo({ top: 0, behavior: 'auto' });
    }
    await mushafViewer.renderPage(page || 1, this.mainContainer);
  }

  /**
   * Bookmarks View (#bookmarks)
   */

  // =========================================================================
  // ADVANCED QURAN STUDY & CLOUD SUITE CONTROLLERS
  // =========================================================================

  initKhatamTracker() {
    const btn = document.getElementById('khatam-tracker-btn');
    const modal = document.getElementById('khatam-modal-overlay');
    if (!btn || !modal) return;

    btn.addEventListener('click', () => {
      this.updateKhatamUI();
      modal.classList.add('open');
    });

    modal.querySelectorAll('[data-action="close-khatam-modal"]').forEach((el) => {
      el.addEventListener('click', () => modal.classList.remove('open'));
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });

    modal.querySelectorAll('.khatam-target-btn').forEach((targetBtn) => {
      targetBtn.addEventListener('click', () => {
        modal.querySelectorAll('.khatam-target-btn').forEach((b) => b.classList.remove('active'));
        targetBtn.classList.add('active');
        const days = parseInt(targetBtn.getAttribute('data-days'), 10) || 30;
        const khatam = store.getKhatam();
        khatam.targetDays = days;
        store.saveKhatam(khatam);
        this.updateKhatamUI();
      });
    });

    const markPageBtn = document.getElementById('btn-khatam-mark-page');
    if (markPageBtn) {
      markPageBtn.addEventListener('click', () => {
        let page = 1;
        if (window.location.hash.startsWith('#mushaf/')) {
          page = parseInt(window.location.hash.replace('#mushaf/', ''), 10) || 1;
        } else if (this.renderedSurah && SURAH_START_PAGES) {
          page = SURAH_START_PAGES[this.renderedSurah] || 1;
        }
        const isDone = store.togglePageCompleted(page);
        this.updateKhatamUI();
        this.showToast(isDone ? `Halaman ${page} ditanda selesai ✓` : `Tanda halaman ${page} dibatalkan`);
      });
    }

    const resetBtn = document.getElementById('btn-khatam-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm(i18n.t('khatam.resetConfirm'))) {
          store.saveKhatam({
            targetDays: 30,
            completedPages: [],
            dailyActivity: {},
            streak: 0,
            lastActiveDate: null,
          });
          this.updateKhatamUI();
          this.showToast('Jejak khatam dimulakan semula.');
        }
      });
    }

    const calBtn = document.getElementById('btn-khatam-add-calendar');
    if (calBtn) {
      calBtn.addEventListener('click', () => {
        this.openCalendarIntent('khatam');
      });
    }

    this.updateKhatamUI();
  }

  updateKhatamUI() {
    if (!store.getKhatam) return;
    const khatam = store.getKhatam();
    const streak = khatam.streak || 0;
    const completed = (khatam.completedPages || []).length;
    const totalPages = 604;
    const pct = Math.min(100, Math.round((completed / totalPages) * 100));

    const btnText = document.getElementById('khatam-btn-text');
    if (btnText) {
      btnText.textContent = `${streak}h | ${pct}%`;
    }

    const streakDisplay = document.getElementById('khatam-streak-display');
    if (streakDisplay) {
      streakDisplay.textContent = `${streak} Hari`;
    }

    const progressLabel = document.getElementById('khatam-progress-label');
    if (progressLabel) {
      progressLabel.textContent = `${completed} / ${totalPages} Halaman Selesai (${pct}%)`;
    }

    const pctDisplay = document.getElementById('khatam-pct-display');
    if (pctDisplay) {
      pctDisplay.textContent = `${pct}%`;
    }

    const fillBar = document.getElementById('khatam-progress-fill');
    if (fillBar) {
      fillBar.style.width = `${pct}%`;
    }

    const targetDays = khatam.targetDays || 30;
    const remainingPages = Math.max(0, totalPages - completed);
    const pagesPerDay = Math.max(1, Math.ceil(remainingPages / targetDays));
    const paceEl = document.getElementById('khatam-daily-pace');
    if (paceEl) {
      paceEl.textContent = `Kadar Bacaan: ~${pagesPerDay} muka surat sehari (${targetDays} hari)`;
    }

    document.querySelectorAll('.khatam-target-btn').forEach((b) => {
      b.classList.toggle('active', parseInt(b.getAttribute('data-days'), 10) === targetDays);
    });
  }

  initCalendarReminders() {
    const btn = document.getElementById('btn-calendar-reminders');
    const modal = document.getElementById('calendar-reminders-modal');
    const addFridayBtn = document.getElementById('btn-cal-add-friday');
    const addKhatamBtn = document.getElementById('btn-cal-add-khatam');

    if (btn && modal) {
      btn.addEventListener('click', () => {
        modal.classList.add('open');
      });

      modal.querySelectorAll('[data-action="close-calendar-modal"]').forEach((el) => {
        el.addEventListener('click', () => modal.classList.remove('open'));
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    }

    if (addFridayBtn) {
      addFridayBtn.addEventListener('click', () => {
        this.openCalendarIntent('friday');
      });
    }

    if (addKhatamBtn) {
      addKhatamBtn.addEventListener('click', () => {
        this.openCalendarIntent('khatam');
      });
    }
  }

  openCalendarIntent(type) {
    if (type === 'friday') {
      const title = encodeURIComponent("Membaca Surah Al-Kahf (Jumaat)");
      const details = encodeURIComponent("Sunnah hari Jumaat: Membaca Surah Al-Kahf di Maktabah Maftoohah Al-Quran (https://maktabah-maftoohah.github.io/al-quran/#surah/18)");
      const location = encodeURIComponent("Maktabah Maftoohah Al-Quran");
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&recur=RRULE:FREQ=WEEKLY;BYDAY=FR`;
      window.open(url, '_blank', 'noopener,noreferrer');
      this.showToast('Membuka Google Calendar untuk peringatan Al-Kahf...');
    } else if (type === 'khatam') {
      const khatam = store.getKhatam();
      const remainingPages = Math.max(0, 604 - (khatam.completedPages || []).length);
      const pace = Math.max(1, Math.ceil(remainingPages / (khatam.targetDays || 30)));
      const title = encodeURIComponent(`Tadarus Al-Quran (~${pace} halaman)`);
      const details = encodeURIComponent(`Sasaran Khatam Al-Quran (${khatam.targetDays || 30} hari) di Maktabah Maftoohah: https://maktabah-maftoohah.github.io/al-quran/`);
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&recur=RRULE:FREQ=DAILY`;
      window.open(url, '_blank', 'noopener,noreferrer');
      this.showToast('Membuka Google Calendar untuk jadual khatam harian...');
    }
  }

  initGDriveExtraTools() {
    const exportNotesBtn = document.getElementById('btn-gdrive-export-notes');
    const revisionsBtn = document.getElementById('btn-gdrive-revisions');
    const revModal = document.getElementById('gdrive-revisions-modal');
    const revList = document.getElementById('gdrive-revisions-list');

    if (exportNotesBtn) {
      exportNotesBtn.addEventListener('click', async () => {
        if (!gdriveSync.isConnected()) {
          this.showToast('Menyambung ke Google Drive terlebih dahulu...');
          try {
            await gdriveSync.connect(true);
          } catch (e) {
            this.showToast(`Gagal menyambung: ${e.message}`);
            return;
          }
        }
        this.showToast('Sedang mengeksport nota ke Google Drive...');
        try {
          const notes = await storageDB.getAllNotes();
          const bookmarks = store.bookmarks;
          const res = await gdriveSync.exportNotesToGoogleDrive(notes, bookmarks);
          this.showToast('Nota berjaya dieksport ke Google Drive!');
          if (res.webViewLink) {
            window.open(res.webViewLink, '_blank', 'noopener,noreferrer');
          }
        } catch (e) {
          this.showToast(`Gagal eksport nota: ${e.message}`);
        }
      });
    }

    if (revisionsBtn && revModal) {
      revisionsBtn.addEventListener('click', async () => {
        if (!gdriveSync.isConnected()) {
          this.showToast('Menyambung ke Google Drive terlebih dahulu...');
          try {
            await gdriveSync.connect(true);
          } catch (e) {
            this.showToast(`Gagal menyambung: ${e.message}`);
            return;
          }
        }
        revModal.classList.add('open');
        if (revList) {
          revList.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Memuatkan semakan dari Google Drive...</div>';
          try {
            const revs = await gdriveSync.getRevisionHistory();
            if (!revs || !revs.length) {
              revList.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1.5rem;">${i18n.t('gdriveFeatures.revisionsEmpty')}</div>`;
              return;
            }
            revList.innerHTML = revs
              .map((r) => {
                const dateStr = new Date(r.modifiedTime).toLocaleString();
                const sizeKb = r.size ? `${(parseInt(r.size, 10) / 1024).toFixed(1)} KB` : 'Sandaran';
                return `
                  <div class="revision-item">
                    <div class="revision-meta">
                      <div class="revision-date">⏱️ ${dateStr}</div>
                      <div class="revision-sub">Saiz: ${sizeKb}</div>
                    </div>
                    <button class="btn btn-primary btn-sm btn-restore-revision" data-id="${r.id}" data-time="${dateStr}" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">
                      ${i18n.t('gdriveFeatures.restoreBtn')}
                    </button>
                  </div>
                `;
              })
              .join('');

            revList.querySelectorAll('.btn-restore-revision').forEach((btn) => {
              btn.addEventListener('click', async () => {
                const revId = btn.getAttribute('data-id');
                const time = btn.getAttribute('data-time');
                if (confirm(i18n.t('gdriveFeatures.restoreConfirm', { time }))) {
                  this.showToast(i18n.t('gdriveFeatures.restoring'));
                  try {
                    await gdriveSync.restoreRevision(revId);
                    this.showToast(i18n.t('gdriveFeatures.restoreSuccess'));
                    revModal.classList.remove('open');
                    this.renderSidebarBookmarks();
                    this.renderSidebarNotes();
                    this.updateKhatamUI();
                    router.handleRouting();
                  } catch (e) {
                    this.showToast(i18n.t('gdriveFeatures.restoreFailed', { error: e.message }));
                  }
                }
              });
            });
          } catch (e) {
            revList.innerHTML = `<div style="text-align: center; color: var(--danger); padding: 1.5rem;">Gagal memuatkan semakan: ${e.message}</div>`;
          }
        }
      });

      revModal.querySelectorAll('[data-action="close-revisions-modal"]').forEach((el) => {
        el.addEventListener('click', () => revModal.classList.remove('open'));
      });

      revModal.addEventListener('click', (e) => {
        if (e.target === revModal) revModal.classList.remove('open');
      });
    }
  }

  renderBookmarksView() {
    this.renderedSurah = null;
    if (this.mainContainer) {
      this.mainContainer.scrollTo({ top: 0, behavior: 'auto' });
    }
    const bookmarks = store.bookmarks;
    if (!bookmarks.length) {
      this.mainContainer.innerHTML = `
        <div style="padding: 3rem 1rem; text-align: center;">
          <h2 style="font-size: 1.5rem; color: var(--accent-gold); margin-bottom: 0.5rem;">${i18n.t('bookmarks.title')}</h2>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">${i18n.t('bookmarks.emptyDesc')}</p>
          <a href="#surah/1" class="btn btn-primary">${i18n.t('bookmarks.startReading')}</a>
        </div>
      `;
      return;
    }

    const html = bookmarks
      .map((b) => {
        if (b.type === 'mushaf') {
          return `
            <div class="verse-card" style="margin-bottom: 1.25rem;">
              <div class="verse-card-top">
                <span class="ayah-badge">📄 ${i18n.currentLang === 'en' ? `Mushaf Page ${b.page}` : `Halaman Mushaf ${b.page}`}</span>
                <div class="verse-actions">
                  <a href="#mushaf/${b.page}" class="btn btn-primary" style="padding: 0.25rem 0.6rem; font-size: 0.8rem; text-decoration: none;">
                    📖 ${i18n.currentLang === 'en' ? 'Open Page' : 'Buka Halaman'}
                  </a>
                  <button class="btn btn-remove-bookmark" data-ref="${b.ref}" style="padding: 0.25rem 0.6rem; font-size: 0.8rem; color: var(--danger);">
                    ${i18n.t('bookmarks.btnRemove')}
                  </button>
                </div>
              </div>
              <div style="font-size: 1rem; color: var(--text-primary); margin-top: 0.5rem;">
                ${b.surahName || (i18n.currentLang === 'en' ? `Madinah Mushaf Page ${b.page}` : `Halaman Mushaf Madinah ${b.page}`)}
              </div>
            </div>
          `;
        }
        return `
          <div class="verse-card" style="margin-bottom: 1.25rem;">
            <div class="verse-card-top">
              <span class="ayah-badge">${b.surahName} (${b.ref})</span>
              <div class="verse-actions">
                <a href="#${b.surah}:${b.ayah}" class="btn btn-primary" style="padding: 0.25rem 0.6rem; font-size: 0.8rem; text-decoration: none;">
                  ${i18n.t('bookmarks.openVerse')}
                </a>
                <a href="#ayah/${b.surah}/${b.ayah}" class="btn" style="padding: 0.25rem 0.6rem; font-size: 0.8rem; text-decoration: none;">
                  ${i18n.t('bookmarks.deepDive')}
                </a>
                <button class="btn btn-copy-bookmark" data-ref="${b.ref}" style="padding: 0.25rem 0.6rem; font-size: 0.8rem;">
                  📋 ${i18n.t('surah.btnCopy')}
                </button>
                <button class="btn btn-remove-bookmark" data-ref="${b.ref}" style="padding: 0.25rem 0.6rem; font-size: 0.8rem; color: var(--danger);">
                  ${i18n.t('bookmarks.btnRemove')}
                </button>
              </div>
            </div>
            <div class="verse-arabic" style="font-size: 1.6rem; margin-bottom: 0.75rem;">${b.ar || ''}</div>
            <div class="translation-text" style="color: var(--text-secondary);">${b.en || b.ms || ''}</div>
          </div>
        `;
      })
      .join('');

    this.mainContainer.innerHTML = `
      <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
        <h2 style="font-size: 1.5rem; color: var(--accent-gold);">${i18n.t('bookmarks.title')} (${bookmarks.length})</h2>
      </div>
      <div class="verses-container">
        ${html}
      </div>
    `;

    this.mainContainer.querySelectorAll('.btn-copy-bookmark').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ref = btn.getAttribute('data-ref');
        const b = bookmarks.find((item) => item.ref === ref);
        if (b) {
          const trans = b.ms || b.en || '';
          const clipboardText = `${b.ar}\n\n${trans}\n\n(Al-Quran ${ref})`;
          this.copyToClipboard(clipboardText, i18n.t('surah.toastCopied', { ref }));
        }
      });
    });

    this.mainContainer.querySelectorAll('.btn-remove-bookmark').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ref = btn.getAttribute('data-ref');
        store.toggleBookmark({ ref });
        this.renderBookmarksView();
        this.renderSidebarBookmarks();
        this.showToast(i18n.t('surah.toastBookmarkRemoved', { ref }));
      });
    });
  }
}

// Instantiate and initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
