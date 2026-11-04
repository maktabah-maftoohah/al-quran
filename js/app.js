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
import { mushafViewer } from './mushaf.js';

class App {
  constructor() {
    this.mainContainer = document.getElementById('main-viewport');
    this.surahListContainer = document.getElementById('sidebar-surah-list');
    this.bookmarksListContainer = document.getElementById('sidebar-bookmarks-list');
    this.continueBanner = document.getElementById('sidebar-continue-banner');
    this.sidebarEl = document.getElementById('app-sidebar');
    this.morphDrawer = document.getElementById('morphology-drawer');
    this.morphOverlay = document.getElementById('drawer-overlay');
  }

  async init() {
    store.applySettingsToDOM();
    searchEngine.init();
    cardGenerator.init();
    this.initPWA();
    this.initSidebar();
    this.initTypographyPopover();
    this.initStickyAudioPlayer();
    this.initMorphologyDrawer();
    this.initGlobalEvents();

    // Register routes
    router.addRoute('surah', (params) => this.renderSurahView(params));
    router.addRoute('ayah', (params) => this.renderAyahDeepDive(params));
    router.addRoute('mushaf', (params) => this.renderMushafView(params));
    router.addRoute('bookmarks', () => this.renderBookmarksView());

    // Start routing
    router.init();
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
    const tabs = document.querySelectorAll('.sidebar-tab');

    // Tab switching
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const tabName = tab.getAttribute('data-tab');

        if (tabName === 'surahs') {
          this.surahListContainer.style.display = 'block';
          this.bookmarksListContainer.style.display = 'none';
        } else {
          this.surahListContainer.style.display = 'none';
          this.bookmarksListContainer.style.display = 'block';
          this.renderSidebarBookmarks();
        }
      });
    });

    // Populate Surahs list
    try {
      const surahs = await store.fetchSurahs();
      this.renderSidebarSurahs(surahs);

      if (filterInput) {
        filterInput.addEventListener('input', () => {
          const q = filterInput.value.toLowerCase().trim();
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
        });
      }
    } catch (err) {
      console.error('Sidebar surahs failed to load:', err);
    }

    // Toggle sidebar on mobile
    const toggleBtn = document.getElementById('sidebar-toggle-btn') || document.getElementById('toggle-sidebar-btn');
    if (toggleBtn && this.sidebarEl) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sidebarEl.classList.toggle('open');
      });

      // Auto-close sidebar on mobile after clicking an item
      this.sidebarEl.addEventListener('click', (e) => {
        if (e.target.closest('.surah-list-item')) {
          if (window.innerWidth <= 900) {
            this.sidebarEl.classList.remove('open');
          }
        }
      });

      // Close sidebar when clicking outside on mobile
      document.addEventListener('click', (e) => {
        if (window.innerWidth <= 900 && this.sidebarEl.classList.contains('open')) {
          if (!this.sidebarEl.contains(e.target) && !toggleBtn.contains(e.target)) {
            this.sidebarEl.classList.remove('open');
          }
        }
      });
    }

    this.updateContinueBanner();
  }

  renderSidebarSurahs(surahs) {
    if (!this.surahListContainer) return;
    const currentHash = window.location.hash;

    const html = surahs
      .map((s) => {
        const isActive = currentHash.includes(`surah/${s.number}`) ? 'active' : '';
        const seededBadge = s.seeded
          ? '<span style="font-size: 0.65rem; color: var(--accent-emerald);">● Ready</span>'
          : '<span style="font-size: 0.65rem; color: var(--text-muted);">○ Unseeded</span>';

        return `
          <a href="#surah/${s.number}" class="surah-list-item ${isActive}" data-surah="${s.number}" data-latin="${s.name_latin.toLowerCase()}" data-trans="${s.name_translation.toLowerCase()}" data-arabic="${s.name_arabic}">
            <div class="surah-item-left">
              <div class="surah-item-num">${s.number}</div>
              <div class="surah-item-titles">
                <span class="surah-item-latin">${s.name_latin}</span>
                <span class="surah-item-trans">${s.name_translation}</span>
              </div>
            </div>
            <div class="surah-item-right">
              <span class="surah-item-arabic">${s.name_arabic}</span>
              <span class="surah-item-ayahs">${s.total_ayahs} ayahs • ${seededBadge}</span>
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
    const bookmarks = store.bookmarks;

    if (!bookmarks.length) {
      this.bookmarksListContainer.innerHTML = `
        <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          No bookmarks saved yet.<br/>Click the bookmark icon on any ayah to save it here.
        </div>
      `;
      return;
    }

    const html = bookmarks
      .map(
        (b) => `
        <a href="#surah/${b.surah}?ayah=${b.ayah}" class="surah-list-item" style="flex-direction: column; align-items: flex-start; gap: 0.4rem;">
          <div style="display: flex; justify-content: space-between; width: 100%;">
            <span class="ayah-badge">${b.surahName} (${b.ref})</span>
            <span style="font-size: 0.75rem; color: var(--accent-gold);">★ Saved</span>
          </div>
          <div style="font-family: var(--font-arabic); font-size: 1.1rem; direction: rtl; text-align: right; width: 100%; color: var(--text-primary);">
            ${b.ar.slice(0, 70)}${b.ar.length > 70 ? '...' : ''}
          </div>
        </a>
      `
      )
      .join('');

    this.bookmarksListContainer.innerHTML = html;
  }

  updateContinueBanner() {
    if (!this.continueBanner) return;
    const last = store.getLastRead();
    if (!last) {
      this.continueBanner.style.display = 'none';
      return;
    }
    this.continueBanner.style.display = 'flex';
    this.continueBanner.innerHTML = `
      <div class="continue-info">
        <span class="continue-label">Continue Reading</span>
        <span class="continue-ref">${last.surahName || `Surah ${last.surah}`} : Ayah ${last.ayah}</span>
      </div>
      <a href="#surah/${last.surah}?ayah=${last.ayah}" class="btn btn-primary" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Resume</a>
    `;
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
    const toggleSahih = document.getElementById('toggle-trans-sahih');
    const togglePickthall = document.getElementById('toggle-trans-pickthall');
    const toggleKemenag = document.getElementById('toggle-trans-kemenag');
    const toggleJawi = document.getElementById('toggle-jawi-script');

    const updateTransSettings = async () => {
      const activeTranslations = {
        basmeih: toggleBasmeih ? toggleBasmeih.checked : true,
        sahih: toggleSahih ? toggleSahih.checked : true,
        pickthall: togglePickthall ? togglePickthall.checked : false,
        kemenag: toggleKemenag ? toggleKemenag.checked : true,
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
    if (toggleSahih) {
      toggleSahih.checked = store.settings.activeTranslations.sahih;
      toggleSahih.addEventListener('change', updateTransSettings);
    }
    if (togglePickthall) {
      togglePickthall.checked = store.settings.activeTranslations.pickthall;
      togglePickthall.addEventListener('change', updateTransSettings);
    }
    if (toggleKemenag) {
      toggleKemenag.checked = store.settings.activeTranslations.kemenag;
      toggleKemenag.addEventListener('change', updateTransSettings);
    }
    if (toggleJawi) {
      toggleJawi.checked = store.settings.jawiMode;
      toggleJawi.addEventListener('change', () => {
        store.updateSettings({ jawiMode: toggleJawi.checked });
        // Re-render current view to reflect Jawi switch immediately
        router.handleRouting();
      });
    }
  }

  updateActiveTranslationsDisplay() {
    const act = store.settings.activeTranslations;
    document.querySelectorAll('.translation-block-basmeih').forEach((el) => {
      el.style.display = act.basmeih ? 'flex' : 'none';
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
  }

  populateMissingTranslations() {
    const t = store.cache.translations;
    document.querySelectorAll('.verse-card').forEach((card) => {
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
      playPauseBtn.addEventListener('click', () => audio.togglePlayPause());
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', () => audio.prevAyah());
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => audio.nextAyah());
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
          btn.innerHTML = '⏸ Pause';
        } else {
          btn.innerHTML = '▶ Play';
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

    const concordanceHtml = concordances.length
      ? `
        <div style="margin-top: 1rem;">
          <div class="morph-kv-label">Root Concordance (${concordances.length} loaded occurrences)</div>
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
      : '<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">No other loaded occurrences in current chapters.</div>';

    drawerBody.innerHTML = `
      <div class="morph-token-banner">
        <div class="morph-ar-large">${token.ar}</div>
        <div style="font-size: 1rem; color: var(--accent-blue); font-style: italic; margin-top: 0.25rem;">${token.tr}</div>
        <div style="font-size: 0.95rem; color: var(--text-secondary); margin-top: 0.15rem;">"${token.en}"</div>
      </div>

      <div class="morph-details-grid">
        <div class="morph-kv">
          <div class="morph-kv-label">Root (الجذر)</div>
          <div class="morph-kv-val" style="color: var(--accent-gold);">${token.root || 'N/A'}</div>
        </div>
        <div class="morph-kv">
          <div class="morph-kv-label">Lemma (المعجم)</div>
          <div class="morph-kv-val">${token.lemma || 'N/A'}</div>
        </div>
        <div class="morph-kv">
          <div class="morph-kv-label">Grammar / POS</div>
          <div class="morph-kv-val" style="color: var(--accent-emerald);">${token.pos_tag || 'Particle/Noun'}</div>
        </div>
        <div class="morph-kv">
          <div class="morph-kv-label">Token Position</div>
          <div class="morph-kv-val">${surahNum}:${ayahNum}:${token.pos}</div>
        </div>
      </div>

      <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
        <button class="btn btn-primary" style="flex: 1;" onclick="window.audioEngine.playWord(${surahNum}, ${ayahNum}, ${token.pos})">
          🔊 Pronounce Word
        </button>
        <a href="${token.corpus_url}" target="_blank" rel="noopener noreferrer" class="btn" style="flex: 1; text-decoration: none;">
          Corpus Quran ↗
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
        router.handleRouting();
      });
    }

    window.addEventListener('keydown', (e) => {
      // Space for play/pause if not focused on inputs
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        audio.togglePlayPause();
      } else if (e.code === 'ArrowRight' && e.altKey) {
        audio.nextAyah();
      } else if (e.code === 'ArrowLeft' && e.altKey) {
        audio.prevAyah();
      }
    });

    window.app = this;
    window.audioEngine = audio;
  }

  // =========================================================================
  // VIEW RENDERERS
  // =========================================================================

  /**
   * Surah Reading View (#surah/:surah)
   */
  async renderSurahView({ surah, targetAyah }) {
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
        [arabicData, translations] = await Promise.all([store.fetchArabic(surah), store.fetchTranslations()]);
      } catch (err) {
        this.renderUnseededSurahView(meta);
        return;
      }

      // Update Last Read
      const targetA = targetAyah || 1;
      store.setLastRead(surah, targetA, meta.name_latin);
      this.updateContinueBanner();

      if (!audio.state.isPlaying) {
        audio.state.currentSurah = surah;
        audio.state.currentAyah = targetA;
        audio.state.totalAyahs = meta.total_ayahs;
        audio.state.surahName = meta.name_latin;
        audio.notify();
      }

      const sStr = String(surah);
      const basmeihSurah = translations.basmeih?.[sStr] || {};
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
      const isJawi = store.settings.jawiMode;
      const isBlurred = hifz.active && hifz.blurArabic;

      const verseCardsHtml = Object.entries(arabicData.ayahs)
        .map(([ayahNumStr, textObj]) => {
          const aNum = parseInt(ayahNumStr, 10);
          const ref = `${surah}:${aNum}`;
          const isSaved = store.isBookmarked(ref);
          const msRawText = basmeihSurah[ayahNumStr] || '';
          const msDisplayText = isJawi ? rumiToJawi(msRawText) : msRawText;
          const enSahihText = sahihSurah[ayahNumStr] || '';
          const enPickthallText = pickthallSurah[ayahNumStr] || '';
          const idKemenagText = kemenagSurah[ayahNumStr] || '';

          const arabicClass = isBlurred ? 'verse-arabic hifz-blurred' : 'verse-arabic';
          const msClass = isJawi ? 'translation-text jawi-text' : 'translation-text';

          return `
            <div class="verse-card" data-surah="${surah}" data-ayah="${aNum}" id="verse-${surah}-${aNum}">
              <div class="verse-card-top">
                <span class="ayah-badge">${ref}</span>
                <div class="verse-actions">
                  <button class="verse-action-btn btn-play-ayah" data-surah="${surah}" data-ayah="${aNum}">
                    ▶ Play
                  </button>
                  <button class="verse-action-btn btn-share-card" data-ref="${ref}" data-surah="${surah}" data-ayah="${aNum}">
                    📸 Card
                  </button>
                  <button class="verse-action-btn btn-bookmark-ayah ${isSaved ? 'bookmarked' : ''}" data-ref="${ref}" data-surah="${surah}" data-ayah="${aNum}">
                    ★ ${isSaved ? 'Saved' : 'Bookmark'}
                  </button>
                  <button class="verse-action-btn btn-copy-ayah" data-ref="${ref}">
                    📋 Copy
                  </button>
                  <a href="#ayah/${surah}/${aNum}" class="verse-action-btn" style="text-decoration: none;">
                    🔬 Deep-Dive
                  </a>
                </div>
              </div>

              <div class="${arabicClass}" title="${isBlurred ? 'Click to reveal verse for memorization test' : ''}">${textObj.uthmani}</div>

              <div class="verse-translations">
                <div class="translation-block translation-block-basmeih">
                  <span class="translation-label"><span class="lang-flag">🇲🇾</span> Basmeih (${isJawi ? 'توليسن جاوي' : 'Bahasa Melayu'})</span>
                  <p class="${msClass}">${msDisplayText}</p>
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
            </div>
          `;
        })
        .join('');

      this.mainContainer.innerHTML = `
        <div class="surah-header-card">
          <div class="surah-header-arabic">${meta.name_arabic}</div>
          <div class="surah-header-latin">${meta.name_latin}</div>
          <div class="surah-header-trans">${meta.name_translation}</div>
          <div class="surah-meta-badges">
            <span class="meta-badge revelation">${meta.revelation_type}</span>
            <span class="meta-badge">${meta.total_ayahs} Verses</span>
            <span class="meta-badge">Surah #${meta.number}</span>
          </div>
          <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-primary" id="btn-play-surah-continuous">
              ▶ Play Full Surah Continuous
            </button>
            <a href="#mushaf/1" class="btn" style="text-decoration: none;">
              📄 Open in Mushaf View
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
      this.attachSurahViewEvents(surah, meta, arabicData, basmeihSurah, sahihSurah);

      // Handle target ayah scroll & highlight
      if (targetAyah) {
        setTimeout(() => {
          const card = document.getElementById(`verse-${surah}-${targetAyah}`);
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.add('highlight-target');
          }
        }, 150);
      }
    } catch (err) {
      console.error('Error rendering surah view:', err);
      this.mainContainer.innerHTML = `<div style="padding: 2rem; color: var(--danger);">Failed to load surah view: ${err.message}</div>`;
    }
  }

  renderUnseededSurahView(meta) {
    this.mainContainer.innerHTML = `
      <div class="surah-header-card">
        <div class="surah-header-arabic">${meta.name_arabic}</div>
        <div class="surah-header-latin">${meta.name_latin}</div>
        <div class="surah-header-trans">${meta.name_translation}</div>
        <div class="surah-meta-badges">
          <span class="meta-badge revelation">${meta.revelation_type}</span>
          <span class="meta-badge">${meta.total_ayahs} Verses</span>
        </div>
      </div>

      <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 2rem; text-align: center;">
        <h3 style="color: var(--accent-gold); margin-bottom: 0.75rem;">Seed Mode Active</h3>
        <p style="color: var(--text-secondary); max-width: 600px; margin: 0 auto 1.5rem; font-size: 0.95rem;">
          Surah ${meta.number} (${meta.name_latin}) is indexed, but its full text has not yet been extracted locally.
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

  attachSurahViewEvents(surah, meta, arabicData, basmeihSurah, sahihSurah) {
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
            surahName: meta.name_latin,
          });
          this.showToast(`Playing ${meta.name_latin} continuously`);
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
            surahName: meta.name_latin,
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
        const ms = basmeihSurah[String(aNum)] || '';

        const isSaved = store.toggleBookmark({
          ref,
          surah,
          ayah: aNum,
          surahName: meta.name_latin,
          ar,
          en,
          ms,
        });

        btn.classList.toggle('bookmarked', isSaved);
        btn.innerHTML = `★ ${isSaved ? 'Saved' : 'Bookmark'}`;
        this.showToast(isSaved ? `Bookmark added for ${ref}` : `Bookmark removed for ${ref}`);
        this.renderSidebarBookmarks();
      });
    });

    // Copy Verse
    this.mainContainer.querySelectorAll('.btn-copy-ayah').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ref = btn.getAttribute('data-ref');
        const [s, a] = ref.split(':');
        const ar = arabicData.ayahs[a]?.uthmani || '';
        const ms = basmeihSurah[a] || '';
        const en = sahihSurah[a] || '';

        const clipboardText = `Surah ${meta.name_latin} (${ref})\n\n${ar}\n\n[Basmeih - MS]: ${ms}\n\n[Sahih - EN]: ${en}`;
        this.copyToClipboard(clipboardText, `Copied Ayah ${ref} to clipboard`);
      });
    });

    // Shareable Verse Card
    this.mainContainer.querySelectorAll('.btn-share-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ref = btn.getAttribute('data-ref');
        const [s, a] = ref.split(':');
        const ar = arabicData.ayahs[a]?.uthmani || '';
        const trans = basmeihSurah[a] || sahihSurah[a] || '';
        const transLabel = basmeihSurah[a] ? 'Abdullah Muhammad Basmeih' : 'Saheeh International';
        cardGenerator.open({
          ar,
          trans,
          transLabel,
          surahName: meta.name_latin,
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
  async renderAyahDeepDive({ surah, ayah }) {
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

      const [arabicData, morphologyData, translations] = await Promise.all([
        store.fetchArabic(surah),
        store.fetchMorphology(surah),
        store.fetchTranslations(false),
      ]);

      const aStr = String(ayah);
      const sStr = String(surah);
      const uthmaniText = arabicData.ayahs[aStr]?.uthmani || '';
      const tokens = morphologyData.ayahs[aStr] || [];
      const msText = translations.basmeih?.[sStr]?.[aStr] || '';
      const idText = translations.kemenag?.[sStr]?.[aStr] || '';
      const sahihText = translations.sahih?.[sStr]?.[aStr] || '';
      const pickthallText = translations.pickthall?.[sStr]?.[aStr] || '';

      const isJawi = store.settings.jawiMode;
      const msDisplayText = isJawi ? rumiToJawi(msText) : msText;
      const msClass = isJawi ? 'translation-text jawi-text' : 'translation-text';

      store.setLastRead(surah, ayah, meta.name_latin);
      this.updateContinueBanner();

      if (!audio.state.isPlaying) {
        audio.state.currentSurah = surah;
        audio.state.currentAyah = ayah;
        audio.state.totalAyahs = meta.total_ayahs;
        audio.state.surahName = meta.name_latin;
        audio.notify();
      }

      // Navigation links
      const prevAyah = ayah > 1 ? ayah - 1 : null;
      const nextAyah = ayah < meta.total_ayahs ? ayah + 1 : null;

      // Word cards HTML
      const wordCardsHtml = tokens
        .map(
          (token) => `
          <div class="word-card" data-pos="${token.pos}">
            <button class="word-speaker-btn" title="Pronounce word" data-pos="${token.pos}">
              🔊
            </button>
            <div class="word-arabic">${token.ar}</div>
            <div class="word-translit">${token.tr}</div>
            <div class="word-gloss">${token.en}</div>
            ${token.root ? `<div class="word-root-badge">${token.root}</div>` : `<div class="word-root-badge" style="color: var(--text-muted); border-color: var(--border-subtle);">${token.pos_tag}</div>`}
          </div>
        `
        )
        .join('');

      this.mainContainer.innerHTML = `
        <div class="deepdive-container">
          <div class="deepdive-nav-bar">
            <a href="#surah/${surah}?ayah=${ayah}" class="breadcrumb-link">
              ← Back to ${meta.name_latin} (${surah})
            </a>
            <div class="deepdive-nav-controls">
              ${prevAyah ? `<a href="#ayah/${surah}/${prevAyah}" class="btn">← Ayah ${prevAyah}</a>` : ''}
              <span class="ayah-badge" style="font-size: 0.95rem;">${surah}:${ayah}</span>
              ${nextAyah ? `<a href="#ayah/${surah}/${nextAyah}" class="btn">Ayah ${nextAyah} →</a>` : ''}
            </div>
          </div>

          <!-- Audio Recitation Bar -->
          <div class="deepdive-audio-bar">
            <div class="audio-controls-left">
              <button class="btn btn-primary" id="btn-deepdive-play">
                ▶ Play Recitation
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
                <span>Loop Ayah</span>
              </label>
            </div>
          </div>

          <!-- Full Ayah Arabic Card -->
          <div class="verse-card">
            <div class="verse-arabic" style="font-size: calc(var(--arabic-size) * 1.1); margin-bottom: 0;">
              ${uthmaniText}
            </div>
          </div>

          <!-- Interactive Word-by-Word & Morphology Grid -->
          <div class="wbw-section">
            <div class="section-title">
              <span>Interactive Word-by-Word & Morphology</span>
              <span style="font-size: 0.78rem; font-weight: 500; color: var(--text-muted);">(Click word to inspect root & grammar)</span>
            </div>
            <div class="wbw-grid">
              ${wordCardsHtml}
            </div>
          </div>

          <!-- Categorized Translations & On-Demand Tafsir -->
          <div class="deepdive-tabs-section">
            <div class="tabs-header">
              <button class="tab-btn active" data-tab="translations">Categorized Translations</button>
              <button class="tab-btn" data-tab="tafsir">Tafsir al-Jalalayn</button>
            </div>

            <div class="tab-pane active" id="pane-translations">
              <div class="verse-translations" style="border: none; padding: 0;">
                <div class="translation-block">
                  <span class="translation-label"><span class="lang-flag">🇲🇾</span> Bahasa Melayu — Abdullah Muhammad Basmeih (${isJawi ? 'توليسن جاوي' : 'Rumi'})</span>
                  <p class="${msClass}" style="font-size: 1.1rem; color: var(--text-primary);">${msDisplayText}</p>
                </div>
                <div class="translation-block" style="margin-top: 1rem;">
                  <span class="translation-label"><span class="lang-flag">🇮🇩</span> Bahasa Indonesia — Kemenag</span>
                  <p class="translation-text" style="font-size: 1.05rem; color: var(--text-primary);">${idText}</p>
                </div>
                <div class="translation-block" style="margin-top: 1rem;">
                  <span class="translation-label"><span class="lang-flag">🇬🇧</span> English — Saheeh International</span>
                  <p class="translation-text" style="font-size: 1.05rem; color: var(--text-primary);">${sahihText}</p>
                </div>
                <div class="translation-block" style="margin-top: 1rem;">
                  <span class="translation-label"><span class="lang-flag">🇬🇧</span> English — Mohammed Marmaduke Pickthall</span>
                  <p class="translation-text" style="font-size: 1.05rem; color: var(--text-secondary);">${pickthallText}</p>
                </div>
              </div>
            </div>

            <div class="tab-pane" id="pane-tafsir">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.6rem;">
                <span class="tafsir-source" style="margin: 0;">Classical Commentary</span>
                <select id="tafsir-edition-select" class="select-input">
                  <option value="en-al-jalalayn" selected>Tafsir al-Jalalayn</option>
                  <option value="en-ibn-kathir">Tafsir Ibn Kathir</option>
                </select>
              </div>
              <div class="tafsir-content" id="tafsir-body-text">
                <div style="color: var(--text-muted);">Click to load commentary for ${surah}:${ayah}...</div>
              </div>
            </div>
          </div>
        </div>
      `;

      this.attachDeepDiveEvents(surah, ayah, meta, tokens);
    } catch (err) {
      console.error('Error rendering deep dive:', err);
      this.mainContainer.innerHTML = `<div style="padding: 2rem; color: var(--danger);">Failed to load Ayah Deep-Dive: ${err.message}</div>`;
    }
  }

  attachDeepDiveEvents(surah, ayah, meta, tokens) {
    // Play Ayah button in Deep Dive
    const playBtn = document.getElementById('btn-deepdive-play');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (audio.state.currentSurah === surah && audio.state.currentAyah === ayah && audio.state.isPlaying) {
          audio.pause();
          playBtn.innerHTML = '▶ Play Recitation';
        } else {
          audio.playAyah(surah, ayah, {
            continuous: false,
            totalAyahs: meta.total_ayahs,
            surahName: meta.name_latin,
          });
          playBtn.innerHTML = '⏸ Pause Recitation';
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
      const edition = tafsirSelect ? tafsirSelect.value : 'en-al-jalalayn';
      const label = edition === 'en-ibn-kathir' ? 'Tafsir Ibn Kathir' : 'Tafsir al-Jalalayn';
      tafsirBody.innerHTML = `<div style="color: var(--accent-emerald);">Fetching ${label} from CDN...</div>`;
      const tafsirData = await store.fetchTafsir(surah, ayah, edition);
      tafsirBody.innerHTML = `
        <div style="font-size: 1.05rem; line-height: 1.85; color: var(--text-primary);">
          ${tafsirData.text || 'No commentary available for this verse.'}
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

        if (tab === 'translations') {
          paneTranslations.classList.add('active');
          paneTafsir.classList.remove('active');
        } else {
          paneTranslations.classList.remove('active');
          paneTafsir.classList.add('active');
          await loadTafsirContent();
        }
      });
    });
  }

  /**
   * 15-Line Madinah Mushaf Page View (#mushaf/:page)
   */
  async renderMushafView({ page }) {
    await mushafViewer.renderPage(page || 1, this.mainContainer);
  }

  /**
   * Bookmarks View (#bookmarks)
   */
  renderBookmarksView() {
    const bookmarks = store.bookmarks;
    if (!bookmarks.length) {
      this.mainContainer.innerHTML = `
        <div style="padding: 3rem 1rem; text-align: center;">
          <h2 style="font-size: 1.5rem; color: var(--accent-gold); margin-bottom: 0.5rem;">Saved Bookmarks</h2>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">You haven't bookmarked any verses yet.</p>
          <a href="#surah/1" class="btn btn-primary">Start Reading Al-Fatihah</a>
        </div>
      `;
      return;
    }

    const html = bookmarks
      .map(
        (b) => `
        <div class="verse-card" style="margin-bottom: 1.25rem;">
          <div class="verse-card-top">
            <span class="ayah-badge">${b.surahName} (${b.ref})</span>
            <div class="verse-actions">
              <a href="#surah/${b.surah}?ayah=${b.ayah}" class="btn btn-primary" style="padding: 0.25rem 0.6rem; font-size: 0.8rem; text-decoration: none;">
                Open Verse
              </a>
              <a href="#ayah/${b.surah}/${b.ayah}" class="btn" style="padding: 0.25rem 0.6rem; font-size: 0.8rem; text-decoration: none;">
                🔬 Deep-Dive
              </a>
              <button class="btn btn-remove-bookmark" data-ref="${b.ref}" style="padding: 0.25rem 0.6rem; font-size: 0.8rem; color: var(--danger);">
                ✕ Remove
              </button>
            </div>
          </div>
          <div class="verse-arabic" style="font-size: 1.6rem; margin-bottom: 0.75rem;">${b.ar}</div>
          <div class="translation-text" style="color: var(--text-secondary);">${b.en || b.ms}</div>
        </div>
      `
      )
      .join('');

    this.mainContainer.innerHTML = `
      <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
        <h2 style="font-size: 1.5rem; color: var(--accent-gold);">Saved Bookmarks (${bookmarks.length})</h2>
      </div>
      <div class="verses-container">
        ${html}
      </div>
    `;

    this.mainContainer.querySelectorAll('.btn-remove-bookmark').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ref = btn.getAttribute('data-ref');
        store.toggleBookmark({ ref });
        this.renderBookmarksView();
        this.renderSidebarBookmarks();
        this.showToast(`Bookmark removed: ${ref}`);
      });
    });
  }
}

// Instantiate and initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
