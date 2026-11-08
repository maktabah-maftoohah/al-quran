/**
 * Maktabah Maftoohah Al-Quran - Authentic 15-Line Madinah Mushaf Page Layout
 * Faithful to the King Fahd Complex (KFC / Uthman Taha standard):
 * - Classical multi-layered gold & slate framing with Islamic geometric corner brackets
 * - Royal illuminated frontispieces (Tazhib) for Page 1 (Al-Fatihah) and Page 2 (Al-Baqarah 1-5)
 * - Ornate Surah title cartouches with revelation type, Arabic name, and ayah count
 * - Classical 15-line justified text flow and authentic verse end rosettes
 * - Marginal annotations (Hawamisy: Juz, Hizb, Rub' al-Hizb, and Sajdah Tilawah)
 * - Recitation audio synchronization with glowing active verse highlight
 * - Dual-Page Book Spread mode on wide screens
 * - Sepia / Classical Manuscript Theme toggle
 * - Page-level Bookmarks integration
 * - Quick Page Scrubber Slider & Verse Translation Preview
 * - Mobile Touch Swipe & Print / PDF Export support
 */

import { store } from './store.js';
import { audio } from './audio.js';
import { i18n } from './i18n.js';

export function toArabicDigits(num) {
  return String(num).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
}

export const SURAH_START_PAGES = {
  1:1, 2:2, 3:50, 4:77, 5:106, 6:128, 7:151, 8:177, 9:187, 10:208,
  11:221, 12:235, 13:249, 14:255, 15:262, 16:267, 17:282, 18:293, 19:305, 20:312,
  21:322, 22:332, 23:342, 24:350, 25:359, 26:367, 27:377, 28:385, 29:396, 30:404,
  31:411, 32:415, 33:418, 34:428, 35:434, 36:440, 37:446, 38:453, 39:458, 40:467,
  41:477, 42:483, 43:489, 44:496, 45:499, 46:502, 47:507, 48:511, 49:515, 50:518,
  51:520, 52:523, 53:526, 54:528, 55:531, 56:534, 57:537, 58:542, 59:545, 60:549,
  61:551, 62:553, 63:554, 64:556, 65:558, 66:560, 67:562, 68:564, 69:566, 70:568,
  71:570, 72:572, 73:574, 74:575, 75:577, 76:578, 77:580, 78:582, 79:583, 80:585,
  81:586, 82:587, 83:587, 84:589, 85:590, 86:591, 87:591, 88:592, 89:593, 90:594,
  91:595, 92:595, 93:596, 94:596, 95:597, 96:597, 97:598, 98:598, 99:599, 100:599,
  101:600, 102:600, 103:601, 104:601, 105:601, 106:602, 107:602, 108:602, 109:603, 110:603,
  111:603, 112:604, 113:604, 114:604
};

export const JUZ_START_PAGES = {
  1:1, 2:22, 3:42, 4:63, 5:82, 6:102, 7:122, 8:142, 9:162, 10:182,
  11:202, 12:222, 13:242, 14:262, 15:282, 16:302, 17:322, 18:342, 19:362, 20:382,
  21:402, 22:422, 23:442, 24:462, 25:482, 26:503, 27:522, 28:542, 29:562, 30:582
};

export class MushafViewer {
  constructor() {
    this.pagesMeta = null;
    this.keyHandlerBound = false;
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

  getMarginalMarks(page, pageAyahs, currentJuz) {
    const marks = [];
    const hasSajdahMap = new Set();
    const hasRubMap = new Map();

    if (!this.pagesMeta) return { marks, hasSajdahMap, hasRubMap };

    // 1. Check if a new Juz starts on this page
    if (JUZ_START_PAGES[currentJuz] === page) {
      marks.push({
        type: 'juz',
        title: `Awal Juzuk ${currentJuz}`,
        arabicTitle: 'الجزء',
        arabicNumber: toArabicDigits(currentJuz),
      });
    }

    // 2. Check Hizb and Quarters (Rub\' al-Hizb)
    const quarters = this.pagesMeta.quarters || [];
    for (const item of pageAyahs) {
      const q = quarters.find((x) => x.surah === item.surah && x.ayah === item.ayah);
      if (q) {
        const qIdx = q.index; // 1 to 240
        const hizbNum = Math.floor((qIdx - 1) / 4) + 1;
        const quarterInHizb = (qIdx - 1) % 4;

        let label = '';
        let fullTitle = '';
        if (quarterInHizb === 0) {
          label = `الحزب ${toArabicDigits(hizbNum)}`;
          fullTitle = `Awal Hizb ${hizbNum}`;
        } else if (quarterInHizb === 1) {
          label = `ربع الحزب ${toArabicDigits(hizbNum)}`;
          fullTitle = `Rub\' (Suku) Hizb ${hizbNum}`;
        } else if (quarterInHizb === 2) {
          label = `نصف الحزب ${toArabicDigits(hizbNum)}`;
          fullTitle = `Nisf (Separuh) Hizb ${hizbNum}`;
        } else if (quarterInHizb === 3) {
          label = `ثلاثة أرباع الحزب ${toArabicDigits(hizbNum)}`;
          fullTitle = `Tiga Suku Hizb ${hizbNum}`;
        }

        marks.push({
          type: 'hizb',
          title: fullTitle,
          arabicTitle: label,
          hizb: hizbNum,
          quarter: quarterInHizb,
        });

        hasRubMap.set(`${item.surah}:${item.ayah}`, label);
      }

      // 3. Check Sajdah Tilawah
      const sajdas = this.pagesMeta.sajdas || [];
      const s = sajdas.find((x) => x.surah === item.surah && x.ayah === item.ayah);
      if (s) {
        marks.push({
          type: 'sajdah',
          title: 'Sujud Tilawah (Disunatkan Bersujud)',
          arabicTitle: 'سَجْدَة',
          surah: item.surah,
          ayah: item.ayah,
        });
        hasSajdahMap.add(`${item.surah}:${item.ayah}`);
      }
    }

    return { marks, hasSajdahMap, hasRubMap };
  }

  renderCornerBrackets() {
    return `
      <div class="mushaf-corner-bracket top-left">
        <svg viewBox="0 0 44 44" fill="none">
          <path d="M 4 40 L 4 14 C 4 8.5 8.5 4 14 4 L 40 4" stroke="#c5a059" stroke-width="2" stroke-linecap="round"/>
          <path d="M 10 40 L 10 18 C 10 13.5 13.5 10 18 10 L 40 10" stroke="#c5a059" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
          <circle cx="14" cy="14" r="3" fill="#f59e0b"/>
          <circle cx="4" cy="4" r="1.5" fill="#c5a059"/>
        </svg>
      </div>
      <div class="mushaf-corner-bracket top-right">
        <svg viewBox="0 0 44 44" fill="none">
          <path d="M 4 40 L 4 14 C 4 8.5 8.5 4 14 4 L 40 4" stroke="#c5a059" stroke-width="2" stroke-linecap="round"/>
          <path d="M 10 40 L 10 18 C 10 13.5 13.5 10 18 10 L 40 10" stroke="#c5a059" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
          <circle cx="14" cy="14" r="3" fill="#f59e0b"/>
          <circle cx="4" cy="4" r="1.5" fill="#c5a059"/>
        </svg>
      </div>
      <div class="mushaf-corner-bracket bottom-left">
        <svg viewBox="0 0 44 44" fill="none">
          <path d="M 4 40 L 4 14 C 4 8.5 8.5 4 14 4 L 40 4" stroke="#c5a059" stroke-width="2" stroke-linecap="round"/>
          <path d="M 10 40 L 10 18 C 10 13.5 13.5 10 18 10 L 40 10" stroke="#c5a059" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
          <circle cx="14" cy="14" r="3" fill="#f59e0b"/>
          <circle cx="4" cy="4" r="1.5" fill="#c5a059"/>
        </svg>
      </div>
      <div class="mushaf-corner-bracket bottom-right">
        <svg viewBox="0 0 44 44" fill="none">
          <path d="M 4 40 L 4 14 C 4 8.5 8.5 4 14 4 L 40 4" stroke="#c5a059" stroke-width="2" stroke-linecap="round"/>
          <path d="M 10 40 L 10 18 C 10 13.5 13.5 10 18 10 L 40 10" stroke="#c5a059" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
          <circle cx="14" cy="14" r="3" fill="#f59e0b"/>
          <circle cx="4" cy="4" r="1.5" fill="#c5a059"/>
        </svg>
      </div>
    `;
  }

  renderMarginalBadges(marks) {
    if (!marks || !marks.length) return '';
    return marks
      .map((m) => {
        if (m.type === 'juz') {
          return `
            <div class="mushaf-marginal-medallion juz-medallion" title="${m.title}">
              <svg class="medallion-svg" viewBox="0 0 60 60" fill="none">
                <polygon points="30,2 38,14 52,10 48,24 60,30 48,36 52,50 38,46 30,58 22,46 8,50 12,36 0,30 12,24 8,10 22,14" fill="#0e1726" stroke="#c5a059" stroke-width="2"/>
                <circle cx="30" cy="30" r="18" fill="rgba(245, 158, 11, 0.08)" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2,2"/>
              </svg>
              <div class="medallion-label">
                <span class="medallion-text-top">${m.arabicTitle}</span>
                <span class="medallion-text-num">${m.arabicNumber}</span>
              </div>
            </div>
          `;
        } else if (m.type === 'hizb') {
          return `
            <div class="mushaf-marginal-medallion hizb-medallion" title="${m.title}">
              <svg class="medallion-svg" viewBox="0 0 60 60" fill="none">
                <polygon points="30,2 38,14 52,10 48,24 60,30 48,36 52,50 38,46 30,58 22,46 8,50 12,36 0,30 12,24 8,10 22,14" fill="#0e1726" stroke="#c5a059" stroke-width="1.8"/>
                <circle cx="30" cy="30" r="17" fill="rgba(16, 185, 129, 0.08)" stroke="#10b981" stroke-width="1"/>
              </svg>
              <div class="medallion-label">
                <span class="medallion-text-hizb">${m.arabicTitle}</span>
              </div>
            </div>
          `;
        } else if (m.type === 'sajdah') {
          return `
            <div class="mushaf-marginal-medallion sajdah-medallion" title="${m.title}">
              <svg class="medallion-svg" viewBox="0 0 60 60" fill="none">
                <path d="M12 54 V30 C12 18 20 6 30 2 C40 6 48 18 48 30 V54 H12 Z" fill="#0e1726" stroke="#c5a059" stroke-width="2"/>
                <path d="M18 50 V30 C18 22 24 14 30 10 C36 14 42 22 42 30 V50 H18 Z" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="1.2"/>
              </svg>
              <div class="medallion-label">
                <span class="medallion-text-sajdah">${m.arabicTitle}</span>
                <span class="medallion-icon-sajdah">۩</span>
              </div>
            </div>
          `;
        }
        return '';
      })
      .join('');
  }

  async loadPageAyahs(page, meta, surahs) {
    let candidateSurahs = [];
    if (meta && meta.pages && meta.pages[page - 1]) {
      const startRef = meta.pages[page - 1];
      const endRef = meta.pages[page] || { surah: 114, ayah: 6 };
      for (let s = startRef.surah; s <= endRef.surah; s++) {
        candidateSurahs.push(s);
      }
    } else {
      candidateSurahs = page <= 2 ? [1, 2] : [Math.min(114, Math.ceil(page / 5))];
    }

    const pageAyahs = [];
    let currentJuz = 1;

    for (const sNum of candidateSurahs) {
      try {
        const sMeta = surahs.find((s) => s.number === sNum);
        if (sMeta && sMeta.seeded === false) continue;
        const arDoc = await store.fetchArabic(sNum);
        for (const [aStr, aData] of Object.entries(arDoc.ayahs)) {
          if (aData.page === page || (!aData.page && page === 1 && sNum === 1)) {
            pageAyahs.push({
              surah: sNum,
              ayah: parseInt(aStr, 10),
              surahName: sMeta ? store.getSurahName(sMeta) : `Surah ${sNum}`,
              surahArabic: sMeta ? sMeta.name_arabic : '',
              totalAyahs: sMeta ? sMeta.total_ayahs : 7,
              revelationType: sMeta ? sMeta.revelation_type : 'Meccan',
              uthmani: aData.uthmani,
              juz: aData.juz || 1,
            });
            if (aData.juz) currentJuz = aData.juz;
          }
        }
      } catch (e) {
        console.warn(`Error loading surah ${sNum} for page ${page}:`, e);
      }
    }
    return { pageAyahs, currentJuz };
  }

  buildSheetHtml(page, pageAyahs, currentJuz) {
    if (!pageAyahs || !pageAyahs.length) {
      return null;
    }

    const primarySurah = pageAyahs[0];
    const isOddPage = page % 2 === 1;
    const isFrontispiece = page === 1 || page === 2;

    const { marks, hasSajdahMap, hasRubMap } = this.getMarginalMarks(page, pageAyahs, currentJuz);
    const marginalBadgesHtml = this.renderMarginalBadges(marks);

    let renderedTextHtml = '';
    let lastSurahRendered = null;

    for (const item of pageAyahs) {
      if (item.surah !== lastSurahRendered) {
        if (item.ayah === 1 && !isFrontispiece) {
          const isMeccan = (item.revelationType || '').toLowerCase() === 'meccan';
          renderedTextHtml += `
            <div class="mushaf-surah-title-banner">
              <div class="cartouche-wing right">
                <span class="cartouche-meta-badge">${isMeccan ? 'مَكِّيَّةٌ' : 'مَدَنِيَّةٌ'}</span>
              </div>
              <div class="cartouche-center">
                <span class="cartouche-ornament">⟡</span>
                <span class="mushaf-surah-name-ar">سُورَةُ ${item.surahArabic}</span>
                <span class="cartouche-ornament">⟡</span>
              </div>
              <div class="cartouche-wing left">
                <span class="cartouche-meta-badge">آيَاتُهَا ${toArabicDigits(item.totalAyahs)}</span>
              </div>
            </div>
          `;
          if (item.surah !== 1 && item.surah !== 9) {
            renderedTextHtml += `
              <div class="mushaf-basmalah-line">
                <span class="basmalah-flourish">⟡</span>
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                <span class="basmalah-flourish">⟡</span>
              </div>
            `;
          }
        }
        lastSurahRendered = item.surah;
      }

      const glyph = toArabicDigits(item.ayah);
      const key = `${item.surah}:${item.ayah}`;
      const isSajdah = hasSajdahMap.has(key);
      const rubLabel = hasRubMap.get(key);

      const rubPrefix = rubLabel ? `<span class="mushaf-inline-rub" title="${rubLabel}">۞ </span>` : '';
      const sajdahSuffix = isSajdah ? `<span class="mushaf-inline-sajdah" title="Sujud Tilawah"> ۩</span>` : '';

      const tCache = store.cache.translations;
      const isEn = i18n.currentLang === 'en';
      let trans = '';
      if (isEn) {
        trans = (tCache.sahih && tCache.sahih[item.surah] && tCache.sahih[item.surah][item.ayah])
          || (tCache.pickthall && tCache.pickthall[item.surah] && tCache.pickthall[item.surah][item.ayah])
          || (tCache.basmeihHarfiah && tCache.basmeihHarfiah[item.surah] && tCache.basmeihHarfiah[item.surah][item.ayah])
          || (tCache.basmeih && tCache.basmeih[item.surah] && tCache.basmeih[item.surah][item.ayah])
          || '';
      } else {
        trans = (tCache.basmeihHarfiah && tCache.basmeihHarfiah[item.surah] && tCache.basmeihHarfiah[item.surah][item.ayah])
          || (tCache.basmeih && tCache.basmeih[item.surah] && tCache.basmeih[item.surah][item.ayah])
          || (tCache.jalalayn && tCache.jalalayn[item.surah] && tCache.jalalayn[item.surah][item.ayah])
          || (tCache.sahih && tCache.sahih[item.surah] && tCache.sahih[item.surah][item.ayah])
          || '';
      }

      renderedTextHtml += `
        <span class="mushaf-ayah-span" role="button" tabindex="0" data-surah="${item.surah}" data-ayah="${item.ayah}" data-total="${item.totalAyahs}" data-trans="${this.escapeHtml(trans)}" data-surahname="${this.escapeHtml(item.surahName)}" aria-label="${isEn ? `Verse ${item.ayah}, ${item.surahName}` : `Ayat ${item.ayah}, ${item.surahName}`}">
          ${rubPrefix}${item.uthmani}
          <span class="mushaf-ayah-marker" title="Ayah ${item.surah}:${item.ayah} (Klik untuk dengar / Terjemahan)" aria-label="Ayat ${item.ayah}">﴿${glyph}﴾</span>${sajdahSuffix}
        </span>
      `;
    }

    const headerRightText = isOddPage ? `الجزء ${toArabicDigits(currentJuz)}` : `سُورَةُ ${primarySurah.surahArabic}`;
    const headerLeftText = isOddPage ? `سُورَةُ ${primarySurah.surahArabic}` : `الجزء ${toArabicDigits(currentJuz)}`;

    let sheetContentHtml = '';
    if (isFrontispiece) {
      const isP1 = page === 1;
      const frontispieceTitle = isP1 ? 'سُورَةُ ٱلْفَاتِحَةِ' : 'سُورَةُ البَقَرَةِ';
      const frontispieceMeta = isP1 ? 'مَكِّيَّةٌ • آيَاتُهَا ٧' : 'مَدَنِيَّةٌ • آيَاتُهَا ٢٨٦';
      sheetContentHtml = `
        <div class="mushaf-frontispiece-frame">
          <div class="frontispiece-crown">
            <svg class="frontispiece-arch-svg" viewBox="0 0 600 70" fill="none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="tazhibGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#c5a059"/>
                  <stop offset="50%" stop-color="#fcd34d"/>
                  <stop offset="100%" stop-color="#c5a059"/>
                </linearGradient>
              </defs>
              <path d="M 20 65 C 140 65, 220 18, 300 4 C 380 18, 460 65, 580 65" stroke="url(#tazhibGoldGrad)" stroke-width="3" fill="none"/>
              <path d="M 40 70 C 150 70, 230 28, 300 14 C 370 28, 450 70, 560 70" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4,3" fill="none"/>
              <circle cx="300" cy="4" r="4" fill="#f59e0b"/>
              <circle cx="270" cy="16" r="2.5" fill="#38bdf8"/>
              <circle cx="330" cy="16" r="2.5" fill="#38bdf8"/>
            </svg>
          </div>

          <div class="frontispiece-cartouche">
            <div class="frontispiece-surah-title">${frontispieceTitle}</div>
            <div class="frontispiece-surah-meta">${frontispieceMeta}</div>
          </div>

          ${
            !isP1
              ? `
            <div class="mushaf-basmalah-line frontispiece-basmalah">
              <span class="basmalah-flourish">⟡</span>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              <span class="basmalah-flourish">⟡</span>
            </div>
          `
              : ''
          }

          <div class="mushaf-sheet-body frontispiece-body" lang="ar" dir="rtl">
            ${renderedTextHtml}
          </div>

          <div class="frontispiece-footer-ornament">
            <svg viewBox="0 0 240 28" fill="none" style="max-width: 220px; margin: 0 auto; display: block;">
              <path d="M 10 14 Q 60 4 120 14 Q 180 24 230 14" stroke="#c5a059" stroke-width="1.5" fill="none"/>
              <circle cx="120" cy="14" r="5" fill="#f59e0b" stroke="#c5a059" stroke-width="1"/>
              <circle cx="100" cy="14" r="2.5" fill="#10b981"/>
              <circle cx="140" cy="14" r="2.5" fill="#10b981"/>
            </svg>
          </div>
        </div>
      `;
    } else {
      sheetContentHtml = `
        ${this.renderCornerBrackets()}

        <div class="mushaf-sheet-header">
          <span class="mushaf-header-item right-item">${headerRightText}</span>
          <div class="mushaf-header-center">
            <span class="header-divider">✦</span>
            <span class="mushaf-header-title">المصحف الشريف</span>
            <span class="header-divider">✦</span>
          </div>
          <span class="mushaf-header-item left-item">${headerLeftText}</span>
        </div>

        <div class="mushaf-inner-border">
          <div class="mushaf-sheet-body" lang="ar" dir="rtl">
            ${renderedTextHtml}
          </div>
        </div>

        <div class="mushaf-sheet-footer">
          <div class="mushaf-page-cartouche">
            <span class="cartouche-bracket">﴾</span>
            <span class="mushaf-page-num-ar">${toArabicDigits(page)}</span>
            <span class="cartouche-bracket">﴿</span>
          </div>
        </div>
      `;
    }

    return {
      page,
      sheetContentHtml,
      marginalBadgesHtml,
      isFrontispiece,
      isOddPage,
      primarySurah,
      marks,
      pageAyahs,
    };
  }

  async renderPage(pageNum, container) {
    const page = Math.max(1, Math.min(604, parseInt(pageNum, 10) || 1));
    container.innerHTML = `<div style="padding: 3.5rem 1rem; text-align: center; color: var(--accent-gold); font-size: 1.1rem;"><span class="spinner" style="display:inline-block; margin-right: 0.5rem;">✦</span> ${i18n.t('mushaf.loading', { p: page })}</div>`;

    const [meta, surahs] = await Promise.all([
      this.loadPagesMeta(),
      store.fetchSurahs(),
      store.fetchTranslations(),
      store.fetchAsbab().catch(() => ({})),
    ]);
    store.setLastMushafPage(page);
    const mushafNavBtn = document.getElementById('mushaf-mode-btn');
    if (mushafNavBtn) {
      mushafNavBtn.href = `#mushaf/${page}`;
    }

    const isSepia = store.settings.mushafTheme === 'sepia' || store.settings.theme === 'sepia';
    const isSpread = store.settings.mushafSpread === true;
    const isBookmarked = store.isPageBookmarked(page);

    // Primary page load
    const { pageAyahs, currentJuz } = await this.loadPageAyahs(page, meta, surahs);

    if (pageAyahs.length > 0) {
      const p0 = pageAyahs[0];
      store.setLastRead(p0.surah, p0.ayah, p0.surahName);
    }

    if (!pageAyahs.length) {
      container.innerHTML = `
        <div class="mushaf-page-container ${isSepia ? 'mushaf-theme-sepia' : ''}">
          <div class="mushaf-nav-bar">
            <button class="btn" onclick="window.location.hash='#mushaf/${Math.max(1, page - 1)}'" ${page === 1 ? 'disabled' : ''}>← Previous Page</button>
            <span style="font-weight: 700;">Page ${page} of 604</span>
            <button class="btn" onclick="window.location.hash='#mushaf/${Math.min(604, page + 1)}'" ${page === 604 ? 'disabled' : ''}>Next Page →</button>
          </div>
          <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 2.5rem; text-align: center; margin-top: 1.5rem;">
            <h3 style="color: var(--accent-gold); margin-bottom: 0.5rem;">Halaman ${page} Belum Dimuatkan</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
              Sila pilih halaman 1 hingga 604 dari senarai di atas.
            </p>
            <div style="display: flex; gap: 0.75rem; justify-content: center;">
              <a href="#mushaf/1" class="btn btn-primary">Buka Halaman 1 (Al-Fatihah)</a>
              <a href="#mushaf/604" class="btn">Buka Halaman 604 (Mu\'awwidhatayn)</a>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const sheetData = this.buildSheetHtml(page, pageAyahs, currentJuz);
    const primarySurah = sheetData.primarySurah;
    const isOddPage = sheetData.isOddPage;
    const isFrontispiece = sheetData.isFrontispiece;
    const marginalBadgesHtml = sheetData.marginalBadgesHtml;
    const sheetContentHtml = sheetData.sheetContentHtml;
    const marks = sheetData.marks;

    // Navigation calculation
    const step = isSpread ? 2 : 1;
    const prevPage = page > 1 ? Math.max(1, page - step) : null;
    const nextPage = page < 604 ? Math.min(604, page + step) : null;

    // Dual-page spread handling
    let spreadHtml = '';
    if (isSpread) {
      // In RTL Mushaf: right page is odd, left page is even.
      const rightPageNum = page % 2 === 1 ? page : page - 1;
      const leftPageNum = rightPageNum + 1 <= 604 ? rightPageNum + 1 : null;

      let rightSheetData = null;
      let leftSheetData = null;

      if (rightPageNum === page) {
        rightSheetData = sheetData;
      } else {
        const rData = await this.loadPageAyahs(rightPageNum, meta, surahs);
        rightSheetData = this.buildSheetHtml(rightPageNum, rData.pageAyahs, rData.currentJuz);
      }

      if (leftPageNum) {
        if (leftPageNum === page) {
          leftSheetData = sheetData;
        } else {
          const lData = await this.loadPageAyahs(leftPageNum, meta, surahs);
          leftSheetData = this.buildSheetHtml(leftPageNum, lData.pageAyahs, lData.currentJuz);
        }
      }

      spreadHtml = `
        <div class="mushaf-layout-wrapper mushaf-spread-wrapper">
          <!-- Left Marginal Column (Even Page Margin on Left) -->
          <div class="mushaf-margin-col left-margin">
            ${leftSheetData ? leftSheetData.marginalBadgesHtml : ''}
          </div>

          <!-- Left Sheet (Even Page) -->
          ${
            leftSheetData
              ? `
            <div class="mushaf-sheet sheet-left ${leftSheetData.isFrontispiece ? `mushaf-frontispiece mushaf-frontispiece-p${leftPageNum}` : ''}" data-page="${leftPageNum}">
              ${leftSheetData.sheetContentHtml}
            </div>
          `
              : ''
          }

          <div class="mushaf-spread-spine"></div>

          <!-- Right Sheet (Odd Page) -->
          <div class="mushaf-sheet sheet-right ${rightSheetData.isFrontispiece ? `mushaf-frontispiece mushaf-frontispiece-p${rightPageNum}` : ''}" data-page="${rightPageNum}">
            ${rightSheetData.sheetContentHtml}
          </div>

          <!-- Right Marginal Column (Odd Page Margin on Right) -->
          <div class="mushaf-margin-col right-margin">
            ${rightSheetData.marginalBadgesHtml}
          </div>
        </div>
      `;
    }

    // Dropdown options
    const surahOptions = surahs
      .map((s) => {
        const startP = SURAH_START_PAGES[s.number] || 1;
        const selected = page >= startP && (s.number === 114 || page < (SURAH_START_PAGES[s.number + 1] || 605)) ? 'selected' : '';
        return `<option value="${startP}" ${selected}>${s.number}. ${s.name_ms || s.name_latin} (m/s ${startP})</option>`;
      })
      .join('');

    const juzOptions = Array.from({ length: 30 }, (_, i) => i + 1)
      .map((j) => {
        const startP = JUZ_START_PAGES[j];
        const selected = currentJuz === j ? 'selected' : '';
        return `<option value="${startP}" ${selected}>Juzuk ${j} (m/s ${startP})</option>`;
      })
      .join('');

    const pageLabel = i18n.currentLang === 'en' ? `Mushaf Page ${page}` : `Halaman Mushaf ${page}`;

    container.innerHTML = `
      <div class="mushaf-page-container ${isSepia ? 'mushaf-theme-sepia' : ''}" role="region" aria-label="${pageLabel}">
        <div class="sr-only" aria-live="polite">${pageLabel}</div>
        
        <!-- Top Toolbar & Navigation -->
        <div class="mushaf-nav-bar">
          <div class="mushaf-nav-group left-group">
            ${nextPage ? `<a href="#mushaf/${nextPage}" class="btn mushaf-nav-btn btn-next-page" title="Halaman Seterusnya (Maju ke kiri ← / Alt+N)"><span class="nav-arrow">←</span> ${i18n.t('mushaf.nextPage', { p: nextPage })}</a>` : `<button class="btn mushaf-nav-btn disabled" disabled><span class="nav-arrow">←</span> ${i18n.t('mushaf.nextPage', { p: 604 })}</button>`}
            
            <div class="mushaf-page-jump-box">
              <span class="jump-label">${i18n.t('mushaf.pageLabel')}</span>
              <input type="number" id="mushaf-page-jump-input" min="1" max="604" value="${page}" title="Taip nombor halaman (1-604) & tekan Enter">
              <span class="jump-total">/ 604</span>
            </div>

            ${prevPage ? `<a href="#mushaf/${prevPage}" class="btn mushaf-nav-btn btn-prev-page" title="Halaman Sebelum (Undur ke kanan → / Alt+P)">${i18n.t('mushaf.prevPage', { p: prevPage })} <span class="nav-arrow">→</span></a>` : `<button class="btn mushaf-nav-btn disabled" disabled>${i18n.t('mushaf.prevPage', { p: 1 })} <span class="nav-arrow">→</span></button>`}
            
            <button type="button" class="btn mushaf-toolbar-btn mushaf-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" id="mushaf-bookmark-btn" title="${i18n.t('mushaf.bookmarkPage')}">
              📌 <span class="btn-text">${isBookmarked ? i18n.t('mushaf.bookmarkedPage') : i18n.t('mushaf.bookmarkPage')}</span>
            </button>
          </div>

          <div class="mushaf-nav-group right-group">
            <select id="mushaf-surah-jump-select" class="mushaf-select" title="Lompat ke Surah">
              <option value="" disabled>-- Pilih Surah --</option>
              ${surahOptions}
            </select>

            <select id="mushaf-juz-jump-select" class="mushaf-select" title="Lompat ke Juzuk">
              <option value="" disabled>-- Pilih Juzuk --</option>
              ${juzOptions}
            </select>

            <button type="button" class="btn mushaf-toolbar-btn" id="mushaf-spread-toggle-btn" title="Togol Hamparan Buku">
              ${isSpread ? '📖 ' + i18n.t('mushaf.singleMode') : '📖📖 ' + i18n.t('mushaf.spreadMode')}
            </button>

            <button type="button" class="btn mushaf-toolbar-btn" id="mushaf-theme-toggle-btn" title="Tukar Tema (Gelap / Sepia)">
              🎨 <span class="theme-text">${isSepia ? i18n.t('mushaf.themeDark') : i18n.t('mushaf.themeSepia')}</span>
            </button>

            <button type="button" class="btn mushaf-toolbar-btn" id="mushaf-print-btn" title="${i18n.t('mushaf.printPage')}">
              🖨️ ${i18n.t('mushaf.printPage')}
            </button>

            <a href="#${primarySurah.surah}:${primarySurah.ayah}" class="btn mushaf-view-switch-btn" title="Tukar ke Paparan Terperinci Ayat">
              ${i18n.t('mushaf.readingView')}
            </a>
          </div>
        </div>

        <!-- Quick Page Scrubber Slider -->
        <div class="mushaf-slider-wrap">
          <input type="range" id="mushaf-page-slider" class="mushaf-page-slider" min="1" max="604" value="${page}" aria-label="${i18n.t('mushaf.sliderAria')}" title="Halaman 1 - 604">
        </div>

        <!-- Mobile Marginal Badges Pill Bar -->
        ${
          marks.length
            ? `
          <div class="mushaf-mobile-marginal-bar">
            ${marks
              .map(
                (m) =>
                  `<span class="mushaf-mobile-badge" title="${m.title}">${m.type === 'sajdah' ? '۩ ' : '۞ '}${m.arabicTitle} ${m.arabicNumber || ''}</span>`
              )
              .join('')}
          </div>
        `
            : ''
        }

        <!-- 15-Line Madinah Mushaf Layout: Single Page or Book Spread -->
        ${
          isSpread
            ? spreadHtml
            : `
          <div class="mushaf-layout-wrapper ${isOddPage ? 'odd-page' : 'even-page'}">
            <!-- Left Marginal Column (Visible on Even Pages) -->
            <div class="mushaf-margin-col left-margin">
              ${!isOddPage ? marginalBadgesHtml : ''}
            </div>

            <!-- Main Sheet Frame -->
            <div class="mushaf-sheet ${isFrontispiece ? `mushaf-frontispiece mushaf-frontispiece-p${page}` : ''}" data-page="${page}">
              ${sheetContentHtml}
            </div>

            <!-- Right Marginal Column (Visible on Odd Pages) -->
            <div class="mushaf-margin-col right-margin">
              ${isOddPage ? marginalBadgesHtml : ''}
            </div>
          </div>
        `
        }

        <!-- Verse Translation Preview Bar -->
        <div id="mushaf-translation-bar" class="mushaf-translation-bar" style="display: none;" role="region" aria-label="${i18n.t('mushaf.translationTitle')}">
          <div class="mushaf-trans-header">
            <span class="mushaf-trans-ref" id="mushaf-trans-ref"></span>
            <button type="button" class="mushaf-trans-close" id="mushaf-trans-close" aria-label="${i18n.t('mushaf.translationClose')}">&times;</button>
          </div>
          <div class="mushaf-trans-text" id="mushaf-trans-text"></div>
        </div>
      </div>
    `;

    // Translation bar controller
    const transBar = document.getElementById('mushaf-translation-bar');
    const transRef = document.getElementById('mushaf-trans-ref');
    const transTextEl = document.getElementById('mushaf-trans-text');
    const transClose = document.getElementById('mushaf-trans-close');
    const showTranslation = (s, a, name, txt) => {
      if (!transBar || !txt) return;
      const hasAsbab = store.hasAsbab(s, a);
      const isMs = i18n.getLanguage() === 'ms';
      const asbabLink = hasAsbab
        ? `<a href="#ayah/${s}/${a}?tab=asbab" class="mushaf-asbab-link" style="margin-left: 0.5rem;" title="${isMs ? 'Buka Asbabun Nuzul' : 'Open Asbab al-Nuzul'}">📜 ${isMs ? 'Asbabun Nuzul' : 'Asbab al-Nuzul'}</a>`
        : '';
      if (transRef) transRef.innerHTML = `<span>📖 ${name || `Surah ${s}`} [${s}:${a}]</span>${asbabLink}`;
      if (transTextEl) transTextEl.textContent = txt;
      transBar.style.display = 'block';
    };

    if (transClose) {
      transClose.addEventListener('click', () => {
        if (transBar) transBar.style.display = 'none';
      });
    }

    // Attach click, hover and keyboard listeners for Ayah playback & translation
    container.querySelectorAll('.mushaf-ayah-span').forEach((el) => {
      const handleAyahActivate = () => {
        const s = parseInt(el.getAttribute('data-surah'), 10);
        const a = parseInt(el.getAttribute('data-ayah'), 10);
        const total = parseInt(el.getAttribute('data-total'), 10);
        const trans = el.getAttribute('data-trans');
        const sName = el.getAttribute('data-surahname');
        const sMeta = surahs.find((item) => item.number === s);
        showTranslation(s, a, sName, trans);
        audio.playAyah(s, a, {
          continuous: true,
          totalAyahs: total,
          surahName: sMeta ? store.getSurahName(sMeta) : `Surah ${s}`,
        });
      };

      el.addEventListener('click', handleAyahActivate);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleAyahActivate();
        }
      });
      el.addEventListener('mouseenter', () => {
        const s = parseInt(el.getAttribute('data-surah'), 10);
        const a = parseInt(el.getAttribute('data-ayah'), 10);
        const trans = el.getAttribute('data-trans');
        const sName = el.getAttribute('data-surahname');
        showTranslation(s, a, sName, trans);
      });
    });

    // Page Scrubber Slider Event
    const pageSlider = document.getElementById('mushaf-page-slider');
    const jumpInputRef = document.getElementById('mushaf-page-jump-input');
    if (pageSlider) {
      pageSlider.addEventListener('input', (e) => {
        if (jumpInputRef) jumpInputRef.value = e.target.value;
      });
      pageSlider.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10);
        if (val >= 1 && val <= 604) {
          window.location.hash = `#mushaf/${val}`;
        }
      });
    }

    // Page Bookmark Button
    const bookmarkBtn = document.getElementById('mushaf-bookmark-btn');
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', () => {
        const sName = primarySurah ? primarySurah.surahName : `Halaman ${page}`;
        const added = store.togglePageBookmark(page, sName);
        bookmarkBtn.classList.toggle('bookmarked', added);
        const btnText = bookmarkBtn.querySelector('.btn-text');
        if (btnText) {
          btnText.textContent = added ? i18n.t('mushaf.bookmarkedPage') : i18n.t('mushaf.bookmarkPage');
        }
        if (window.app && window.app.showToast) {
          window.app.showToast(
            added
              ? (i18n.currentLang === 'en' ? `Page ${page} bookmarked` : `Halaman ${page} telah disimpan dalam tanda buku`)
              : (i18n.currentLang === 'en' ? `Page ${page} bookmark removed` : `Tanda buku halaman ${page} dipadam`)
          );
          window.app.renderSidebarBookmarks();
        }
      });
    }

    // Spread Mode Toggle Button
    const spreadBtn = document.getElementById('mushaf-spread-toggle-btn');
    if (spreadBtn) {
      spreadBtn.addEventListener('click', () => {
        store.updateSettings({ mushafSpread: !isSpread });
        this.renderPage(page, container);
      });
    }

    // Theme Toggle Button (Sepia / Dark)
    const themeBtn = document.getElementById('mushaf-theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const nextTheme = isSepia ? 'dark' : 'sepia';
        store.updateSettings({ theme: nextTheme, mushafTheme: nextTheme });
        this.renderPage(page, container);
      });
    }

    // Print Button
    const printBtn = document.getElementById('mushaf-print-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Mobile Swipe Gesture Navigation
    const layoutWrapper = container.querySelector('.mushaf-layout-wrapper');
    if (layoutWrapper) {
      let touchStartX = 0;
      let touchStartY = 0;
      let touchStartTime = 0;

      layoutWrapper.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchStartTime = Date.now();
        }
      }, { passive: true });

      layoutWrapper.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 1) {
          const diffX = e.changedTouches[0].clientX - touchStartX;
          const diffY = e.changedTouches[0].clientY - touchStartY;
          const elapsed = Date.now() - touchStartTime;

          if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.2 && elapsed < 600) {
            if (diffX < 0) {
              if (page < 604) {
                window.location.hash = `#mushaf/${Math.min(604, page + step)}`;
              }
            } else {
              if (page > 1) {
                window.location.hash = `#mushaf/${Math.max(1, page - step)}`;
              }
            }
          }
        }
      }, { passive: true });
    }

    // Page Jump Input
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
      jumpInput.addEventListener('change', () => {
        const val = parseInt(jumpInput.value, 10);
        if (val >= 1 && val <= 604) {
          window.location.hash = `#mushaf/${val}`;
        }
      });
    }

    // Surah Dropdown Jump
    const surahSelect = document.getElementById('mushaf-surah-jump-select');
    if (surahSelect) {
      surahSelect.addEventListener('change', (e) => {
        const targetPage = parseInt(e.target.value, 10);
        if (targetPage >= 1 && targetPage <= 604) {
          window.location.hash = `#mushaf/${targetPage}`;
        }
      });
    }

    // Juz Dropdown Jump
    const juzSelect = document.getElementById('mushaf-juz-jump-select');
    if (juzSelect) {
      juzSelect.addEventListener('change', (e) => {
        const targetPage = parseInt(e.target.value, 10);
        if (targetPage >= 1 && targetPage <= 604) {
          window.location.hash = `#mushaf/${targetPage}`;
        }
      });
    }

    // Check if audio has an active ayah on this page, and sync highlight & scroll
    if (audio.state.currentSurah && audio.state.currentAyah) {
      const activeEl = container.querySelector(
        `.mushaf-ayah-span[data-surah="${audio.state.currentSurah}"][data-ayah="${audio.state.currentAyah}"]`
      );
      if (activeEl) {
        activeEl.classList.add('active-reciting');
        const activeTrans = activeEl.getAttribute('data-trans');
        const activeName = activeEl.getAttribute('data-surahname');
        showTranslation(audio.state.currentSurah, audio.state.currentAyah, activeName, activeTrans);
        if (audio.state.isPlaying) {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }

    // Keyboard navigation (PageUp / PageDown / ArrowLeft / ArrowRight)
    if (!this.keyHandlerBound) {
      this.keyHandlerBound = true;
      window.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
        if (!window.location.hash.startsWith('#mushaf')) return;

        const match = window.location.hash.match(/#mushaf\/(\d+)/);
        const curP = match ? parseInt(match[1], 10) : 1;
        const currentStep = store.settings.mushafSpread ? 2 : 1;

        if (e.key === 'ArrowLeft' || e.key === 'PageDown') {
          // In RTL Quran reading, Next Page is to the left
          if (curP < 604) {
            e.preventDefault();
            window.location.hash = `#mushaf/${Math.min(604, curP + currentStep)}`;
          }
        } else if (e.key === 'ArrowRight' || e.key === 'PageUp') {
          // Previous Page is to the right
          if (curP > 1) {
            e.preventDefault();
            window.location.hash = `#mushaf/${Math.max(1, curP - currentStep)}`;
          }
        }
      });
    }
  }
}

export const mushafViewer = new MushafViewer();
