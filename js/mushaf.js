/**
 * Maktabah Maftoohah Al-Quran - 15-Line Madinah Mushaf Page Layout
 * Renders pages 1-604 with classical Madinah Mushaf framing, Juz indicators, and continuous ayah flow.
 */

import { store } from './store.js';
import { audio } from './audio.js';
import { i18n } from './i18n.js';

export function toArabicDigits(num) {
  return String(num).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
}

export class MushafViewer {
  constructor() {
    this.pagesMeta = null;
  }

  async loadPagesMeta() {
    if (this.pagesMeta) return this.pagesMeta;
    try {
      const res = await fetch('./data/pages-meta.json');
      if (res.ok) {
        this.pagesMeta = await res.json();
      }
    } catch (e) {
      console.warn('Failed to load pages-meta:', e);
    }
    return this.pagesMeta;
  }

  async renderPage(pageNum, container) {
    const page = Math.max(1, Math.min(604, parseInt(pageNum, 10) || 1));
    container.innerHTML = `<div style="padding: 3rem; text-align: center; color: var(--text-muted);">${i18n.t('mushaf.loading', { p: page })}</div>`;

    const meta = await this.loadPagesMeta();
    const surahs = await store.fetchSurahs();

    // Determine target surah(s) for this page
    let candidateSurahs = [];
    if (meta && meta.pages && meta.pages[page - 1]) {
      const startRef = meta.pages[page - 1];
      const endRef = meta.pages[page] || { surah: 114, ayah: 6 };
      for (let s = startRef.surah; s <= endRef.surah; s++) {
        candidateSurahs.push(s);
      }
    } else {
      // Fallback
      candidateSurahs = page <= 2 ? [1, 2] : [Math.min(114, Math.ceil(page / 5))];
    }

    // Fetch chapters
    const pageAyahs = [];
    let currentJuz = 1;

    for (const sNum of candidateSurahs) {
      try {
        const sMeta = surahs.find((s) => s.number === sNum);
        if (sMeta && sMeta.seeded === false) {
          continue;
        }
        const arDoc = await store.fetchArabic(sNum);
        for (const [aStr, aData] of Object.entries(arDoc.ayahs)) {
          if (aData.page === page || (!aData.page && page === 1 && sNum === 1)) {
            pageAyahs.push({
              surah: sNum,
              ayah: parseInt(aStr, 10),
              surahName: sMeta ? store.getSurahName(sMeta) : `Surah ${sNum}`,
              surahArabic: sMeta ? sMeta.name_arabic : '',
              totalAyahs: sMeta ? sMeta.total_ayahs : 7,
              uthmani: aData.uthmani,
              juz: aData.juz || 1,
            });
            if (aData.juz) currentJuz = aData.juz;
          }
        }
      } catch (e) {
        // Unseeded or missing chapter
      }
    }

    if (!pageAyahs.length) {
      container.innerHTML = `
        <div class="mushaf-page-container">
          <div class="mushaf-nav-bar">
            <button class="btn" onclick="window.location.hash='#mushaf/${Math.max(1, page - 1)}'" ${page === 1 ? 'disabled' : ''}>← Previous Page</button>
            <span style="font-weight: 700;">Page ${page} of 604</span>
            <button class="btn" onclick="window.location.hash='#mushaf/${Math.min(604, page + 1)}'" ${page === 604 ? 'disabled' : ''}>Next Page →</button>
          </div>
          <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 2rem; text-align: center; margin-top: 1rem;">
            <h3 style="color: var(--accent-gold); margin-bottom: 0.5rem;">Page ${page} Data Not Loaded Locally</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
              In seed mode, Surahs 1, 112, 113, and 114 are loaded. Page 1 (Al-Fatihah) and Page 604 (Al-Ikhlas, Al-Falaq, An-Nas) are available to view immediately!
            </p>
            <div style="display: flex; gap: 0.75rem; justify-content: center;">
              <a href="#mushaf/1" class="btn btn-primary">Open Page 1 (Al-Fatihah)</a>
              <a href="#mushaf/604" class="btn">Open Page 604 (Mu'awwidhatayn)</a>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Primary Surah name for page header
    const primarySurah = pageAyahs[0];
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < 604 ? page + 1 : null;

    // Generate page continuous text flow
    let renderedTextHtml = '';
    let lastSurahRendered = null;

    for (const item of pageAyahs) {
      // If new surah begins on this page
      if (item.surah !== lastSurahRendered) {
        if (item.ayah === 1) {
          renderedTextHtml += `
            <div class="mushaf-surah-title-banner">
              <span class="mushaf-surah-name-ar">سُورَةُ ${item.surahArabic}</span>
            </div>
          `;
          if (item.surah !== 1 && item.surah !== 9) {
            renderedTextHtml += `
              <div class="mushaf-basmalah-line">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </div>
            `;
          }
        }
        lastSurahRendered = item.surah;
      }

      // Verse text + ornamental end mark
      const glyph = toArabicDigits(item.ayah);
      renderedTextHtml += `
        <span class="mushaf-ayah-span" data-surah="${item.surah}" data-ayah="${item.ayah}" data-total="${item.totalAyahs}">
          ${item.uthmani}
          <span class="mushaf-ayah-marker" title="Ayah ${item.surah}:${item.ayah} (Click to play)">﴿${glyph}﴾</span>
        </span>
      `;
    }

    container.innerHTML = `
      <div class="mushaf-page-container">
        <!-- Top Toolbar & Navigation -->
        <div class="mushaf-nav-bar">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${prevPage ? `<a href="#mushaf/${prevPage}" class="btn" title="Previous Page (Alt+P)">${i18n.t('mushaf.prevPage', { p: prevPage })}</a>` : ''}
            <div style="display: flex; align-items: center; gap: 0.35rem;">
              <span style="font-size: 0.85rem; color: var(--text-muted);">${i18n.t('mushaf.pageLabel')}</span>
              <input type="number" id="mushaf-page-jump-input" min="1" max="604" value="${page}" style="width: 58px; background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); border-radius: 4px; padding: 0.25rem 0.4rem; text-align: center; font-size: 0.85rem;">
              <span style="font-size: 0.85rem; color: var(--text-muted);">/ 604</span>
            </div>
            ${nextPage ? `<a href="#mushaf/${nextPage}" class="btn" title="Next Page (Alt+N)">${i18n.t('mushaf.nextPage', { p: nextPage })}</a>` : ''}
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <a href="#surah/${primarySurah.surah}?ayah=${primarySurah.ayah}" class="btn">
              ${i18n.t('mushaf.readingView')}
            </a>
          </div>
        </div>

        <!-- 15-Line Madinah Mushaf Classical Frame -->
        <div class="mushaf-sheet">
          <!-- Top Ornamental Header -->
          <div class="mushaf-sheet-header">
            <span class="mushaf-header-item">سُورَةُ ${primarySurah.surahArabic}</span>
            <span class="mushaf-header-item gold">المصحف الشريف</span>
            <span class="mushaf-header-item">الجزء ${toArabicDigits(currentJuz)}</span>
          </div>

          <!-- Main Continuous Verse Body -->
          <div class="mushaf-sheet-body">
            ${renderedTextHtml}
          </div>

          <!-- Bottom Ornamental Footer -->
          <div class="mushaf-sheet-footer">
            <span class="mushaf-page-num-ar">${toArabicDigits(page)}</span>
          </div>
        </div>
      </div>
    `;

    // Attach event listeners for Ayah clicking in Mushaf view
    container.querySelectorAll('.mushaf-ayah-span').forEach((el) => {
      el.addEventListener('click', (e) => {
        const s = parseInt(el.getAttribute('data-surah'), 10);
        const a = parseInt(el.getAttribute('data-ayah'), 10);
        const total = parseInt(el.getAttribute('data-total'), 10);
        audio.playAyah(s, a, { continuous: true, totalAyahs: total });
      });
    });

    // Jump page input
    const jumpInput = document.getElementById('mushaf-page-jump-input');
    if (jumpInput) {
      jumpInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = parseInt(jumpInput.value, 10);
          if (val >= 1 && val <= 604) {
            window.location.hash = `#mushaf/${val}`;
          }
        }
      });
    }
  }
}

export const mushafViewer = new MushafViewer();
