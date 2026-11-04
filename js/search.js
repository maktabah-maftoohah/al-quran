/**
 * Maktabah Maftoohah Al-Quran - Global Search Engine
 * Features lazy-loaded search index, Arabic diacritic stripping, Alif normalization,
 * verse jump regex, and <mark> keyword highlighting.
 */

import { store } from './store.js';

export class SearchEngine {
  constructor() {
    this.modal = null;
    this.input = null;
    this.resultsList = null;
    this.selectedIndex = -1;
    this.currentResults = [];
    this.isLoaded = false;
  }

  init() {
    this.modal = document.getElementById('search-modal-overlay');
    this.input = document.getElementById('search-input-field');
    this.resultsList = document.getElementById('search-results-list');

    if (!this.modal || !this.input || !this.resultsList) return;

    // Trigger buttons
    document.querySelectorAll('[data-action="open-search"]').forEach((btn) => {
      btn.addEventListener('click', () => this.open());
    });

    // Close buttons & overlay click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal || e.target.closest('[data-action="close-search"]')) {
        this.close();
      }
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && document.activeElement.tagName !== 'INPUT')) {
        e.preventDefault();
        this.open();
      } else if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    // Input events
    this.input.addEventListener('input', () => this.handleInput());
    this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  isOpen() {
    return this.modal && this.modal.classList.contains('open');
  }

  async open() {
    this.modal.classList.add('open');
    this.input.value = '';
    this.selectedIndex = -1;
    this.resultsList.innerHTML = '<div style="padding: 1rem; color: var(--text-muted); text-align: center;">Type a verse jump (e.g. 1:1, 112:1), surah name, or search query...</div>';
    this.input.focus();

    // Lazy load index on first open
    if (!this.isLoaded) {
      try {
        await store.fetchSearchIndex();
        this.isLoaded = true;
      } catch (err) {
        console.error('Failed to load search index:', err);
      }
    }
  }

  close() {
    if (this.modal) {
      this.modal.classList.remove('open');
    }
  }

  normalizeArabic(text) {
    if (!text) return '';
    return text
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/\s+/g, ' ')
      .trim();
  }

  highlightMatch(text, query) {
    if (!text || !query) return text || '';
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  async handleInput() {
    const rawQuery = this.input.value.trim();
    if (!rawQuery) {
      this.currentResults = [];
      this.resultsList.innerHTML = '<div style="padding: 1rem; color: var(--text-muted); text-align: center;">Type a verse jump (e.g. 1:1, 112:1), surah name, or search query...</div>';
      return;
    }

    const results = [];
    const surahs = await store.fetchSurahs();

    // 1. Direct Verse Jump Check: e.g. "112:1", "112: 1", or "112 1"
    const verseJumpMatch = rawQuery.match(/^(\d{1,3})\s*[:\s]\s*(\d{1,3})$/);
    if (verseJumpMatch) {
      const s = parseInt(verseJumpMatch[1], 10);
      const a = parseInt(verseJumpMatch[2], 10);
      const surahMeta = surahs.find((item) => item.number === s);
      if (surahMeta && a <= surahMeta.total_ayahs) {
        results.push({
          type: 'jump',
          ref: `${s}:${a}`,
          surah: s,
          ayah: a,
          title: `Jump to ${surahMeta.name_latin} (${s}:${a})`,
          subtext: `Ayah ${a} of ${surahMeta.total_ayahs} — ${surahMeta.name_translation}`,
          url: `#surah/${s}?ayah=${a}`,
        });
      }
    }

    // 2. Surah Number Jump: e.g. "112"
    const surahJumpMatch = rawQuery.match(/^(\d{1,3})$/);
    if (surahJumpMatch) {
      const s = parseInt(surahJumpMatch[1], 10);
      const surahMeta = surahs.find((item) => item.number === s);
      if (surahMeta) {
        results.push({
          type: 'surah',
          title: `Surah ${surahMeta.number}: ${surahMeta.name_latin} (${surahMeta.name_arabic})`,
          subtext: `${surahMeta.name_translation} • ${surahMeta.total_ayahs} Ayahs`,
          url: `#surah/${s}`,
        });
      }
    }

    // 3. Surah Name matches
    const lowerQuery = rawQuery.toLowerCase();
    for (const sm of surahs) {
      if (
        sm.name_latin.toLowerCase().includes(lowerQuery) ||
        sm.name_translation.toLowerCase().includes(lowerQuery) ||
        sm.name_arabic.includes(rawQuery)
      ) {
        if (!results.some((r) => r.type === 'surah' && r.url === `#surah/${sm.number}`)) {
          results.push({
            type: 'surah',
            title: `Surah ${sm.number}: ${sm.name_latin} (${sm.name_arabic})`,
            subtext: `${sm.name_translation} • ${sm.total_ayahs} Ayahs`,
            url: `#surah/${sm.number}`,
          });
        }
      }
    }

    // 4. Full Verse Content Search (Arabic, Malay, English)
    const index = await store.fetchSearchIndex();
    const normalizedArQuery = this.normalizeArabic(rawQuery);

    let matchCount = 0;
    const MAX_INDEX_RESULTS = 30;

    for (const item of index) {
      if (matchCount >= MAX_INDEX_RESULTS) break;

      let matched = false;
      let matchedText = '';
      let matchField = '';

      if (normalizedArQuery.length >= 2 && item.ar.includes(normalizedArQuery)) {
        matched = true;
        matchField = 'ar';
        matchedText = item.ar;
      } else if (item.ms && item.ms.toLowerCase().includes(lowerQuery)) {
        matched = true;
        matchField = 'ms';
        matchedText = item.ms;
      } else if (item.en && item.en.toLowerCase().includes(lowerQuery)) {
        matched = true;
        matchField = 'en';
        matchedText = item.en;
      }

      if (matched) {
        matchCount++;
        const surahMeta = surahs.find((s) => s.number === item.s);
        results.push({
          type: 'verse',
          ref: item.ref,
          surah: item.s,
          ayah: item.a,
          surahName: surahMeta ? surahMeta.name_latin : `Surah ${item.s}`,
          ar: item.ar,
          ms: item.ms,
          en: item.en,
          matchedField: matchField,
          rawQuery,
          url: `#surah/${item.s}?ayah=${item.a}`,
        });
      }
    }

    this.currentResults = results;
    this.renderResults();
  }

  renderResults() {
    if (!this.currentResults.length) {
      this.resultsList.innerHTML = '<div style="padding: 1rem; color: var(--text-muted); text-align: center;">No matches found.</div>';
      return;
    }

    const html = this.currentResults
      .map((item, index) => {
        const isSelected = index === this.selectedIndex ? 'selected' : '';
        if (item.type === 'jump' || item.type === 'surah') {
          return `
            <div class="search-result-item ${isSelected}" data-index="${index}" data-url="${item.url}">
              <div class="search-result-ref">${item.type === 'jump' ? '⚡ DIRECT VERSE JUMP' : '📖 SURAH'}</div>
              <div style="font-weight: 600; color: var(--text-primary); font-size: 0.95rem;">${item.title}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">${item.subtext}</div>
            </div>
          `;
        }

        // Verse result
        const highlightedAr = item.matchedField === 'ar'
          ? this.highlightMatch(item.ar, this.normalizeArabic(item.rawQuery))
          : item.ar;

        const highlightedTrans = item.matchedField === 'ms'
          ? this.highlightMatch(item.ms, item.rawQuery)
          : (item.matchedField === 'en'
              ? this.highlightMatch(item.en, item.rawQuery)
              : (item.en || item.ms || ''));

        return `
          <div class="search-result-item ${isSelected}" data-index="${index}" data-url="${item.url}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="search-result-ref">${item.surahName} (${item.ref})</span>
              <a href="#ayah/${item.surah}/${item.ayah}" class="btn" style="padding: 0.15rem 0.45rem; font-size: 0.72rem; text-decoration: none;" onclick="event.stopPropagation(); window.searchEngine.close();">Deep-Dive</a>
            </div>
            <div class="search-result-ar">${highlightedAr}</div>
            <div class="search-result-trans">${highlightedTrans}</div>
          </div>
        `;
      })
      .join('');

    this.resultsList.innerHTML = html;

    // Attach click events
    this.resultsList.querySelectorAll('.search-result-item').forEach((el) => {
      el.addEventListener('click', () => {
        const url = el.getAttribute('data-url');
        if (url) {
          window.location.hash = url;
          this.close();
        }
      });
    });
  }

  handleKeyDown(e) {
    if (!this.currentResults.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selectedIndex = (this.selectedIndex + 1) % this.currentResults.length;
      this.updateSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectedIndex = (this.selectedIndex - 1 + this.currentResults.length) % this.currentResults.length;
      this.updateSelection();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const targetIdx = this.selectedIndex >= 0 ? this.selectedIndex : 0;
      const targetItem = this.currentResults[targetIdx];
      if (targetItem && targetItem.url) {
        window.location.hash = targetItem.url;
        this.close();
      }
    }
  }

  updateSelection() {
    const items = this.resultsList.querySelectorAll('.search-result-item');
    items.forEach((item, idx) => {
      if (idx === this.selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }
}

export const searchEngine = new SearchEngine();
window.searchEngine = searchEngine;
