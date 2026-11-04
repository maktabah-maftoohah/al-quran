/**
 * Maktabah Maftoohah Al-Quran - Store Module
 * Manages in-memory JSON caches, relative data fetches, and localStorage persistence.
 */

class QuranStore {
  constructor() {
    this.cache = {
      surahs: null,
      arabic: new Map(),
      morphology: new Map(),
      translations: {
        basmeih: null,
        sahih: null,
        pickthall: null,
      },
      tafsir: new Map(),
      searchIndex: null,
    };

    this.defaultSettings = {
      arabicSize: 2.1,
      translationSize: 1.02,
      reciter: 'Alafasy_128kbps',
      speed: 1.0,
      loopAyah: false,
      autoScroll: true,
      activeTranslations: {
        basmeih: true,
        sahih: true,
        pickthall: false,
      },
    };

    this.settings = this.loadSettings();
    this.bookmarks = this.loadBookmarks();
    this.lastRead = this.loadLastRead();
  }

  // --- LocalStorage Helpers ---

  loadSettings() {
    try {
      const saved = localStorage.getItem('maktabah_quran_settings');
      return saved ? { ...this.defaultSettings, ...JSON.parse(saved) } : { ...this.defaultSettings };
    } catch {
      return { ...this.defaultSettings };
    }
  }

  updateSettings(partial) {
    this.settings = { ...this.settings, ...partial };
    try {
      localStorage.setItem('maktabah_quran_settings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
    this.applySettingsToDOM();
    return this.settings;
  }

  applySettingsToDOM() {
    document.documentElement.style.setProperty('--arabic-size', `${this.settings.arabicSize}rem`);
    document.documentElement.style.setProperty('--translation-size', `${this.settings.translationSize}rem`);
  }

  loadBookmarks() {
    try {
      const saved = localStorage.getItem('maktabah_quran_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  isBookmarked(ref) {
    return this.bookmarks.some((b) => b.ref === ref);
  }

  toggleBookmark(item) {
    const exists = this.isBookmarked(item.ref);
    if (exists) {
      this.bookmarks = this.bookmarks.filter((b) => b.ref !== item.ref);
    } else {
      this.bookmarks.unshift({
        ref: item.ref,
        surah: item.surah,
        ayah: item.ayah,
        surahName: item.surahName || `Surah ${item.surah}`,
        ar: item.ar || '',
        en: item.en || '',
        ms: item.ms || '',
        timestamp: Date.now(),
      });
    }
    try {
      localStorage.setItem('maktabah_quran_bookmarks', JSON.stringify(this.bookmarks));
    } catch (e) {
      console.warn('Failed to save bookmarks:', e);
    }
    return !exists;
  }

  loadLastRead() {
    try {
      const saved = localStorage.getItem('maktabah_quran_last_read');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  getLastRead() {
    if (!this.lastRead) {
      this.lastRead = this.loadLastRead();
    }
    return this.lastRead;
  }

  setLastRead(surah, ayah, surahName) {
    this.lastRead = { surah, ayah, surahName, timestamp: Date.now() };
    try {
      localStorage.setItem('maktabah_quran_last_read', JSON.stringify(this.lastRead));
    } catch (e) {
      console.warn('Failed to save last read:', e);
    }
  }

  // --- Network Relative Fetches with In-Memory Caching ---

  async fetchSurahs() {
    if (this.cache.surahs) return this.cache.surahs;
    const res = await fetch('./data/surahs.json');
    if (!res.ok) throw new Error(`Failed to load surahs: ${res.status}`);
    const data = await res.json();
    this.cache.surahs = data;
    return data;
  }

  async getSurahMeta(surahNum) {
    const surahs = await this.fetchSurahs();
    return surahs.find((s) => s.number === parseInt(surahNum, 10)) || null;
  }

  async fetchArabic(surahNum) {
    const key = parseInt(surahNum, 10);
    if (this.cache.arabic.has(key)) return this.cache.arabic.get(key);
    const res = await fetch(`./data/arabic/${key}.json`);
    if (!res.ok) throw new Error(`Failed to load Arabic text for surah ${key}`);
    const data = await res.json();
    this.cache.arabic.set(key, data);
    return data;
  }

  async fetchMorphology(surahNum) {
    const key = parseInt(surahNum, 10);
    if (this.cache.morphology.has(key)) return this.cache.morphology.get(key);
    const res = await fetch(`./data/morphology/${key}.json`);
    if (!res.ok) throw new Error(`Failed to load morphology for surah ${key}`);
    const data = await res.json();
    this.cache.morphology.set(key, data);
    return data;
  }

  async fetchTranslations() {
    const t = this.cache.translations;
    const fetchPromises = [];

    if (!t.basmeih) {
      fetchPromises.push(
        fetch('./data/translations/ms/basmeih.json')
          .then((r) => r.json())
          .then((d) => (t.basmeih = d))
          .catch(() => (t.basmeih = {}))
      );
    }
    if (!t.sahih) {
      fetchPromises.push(
        fetch('./data/translations/en/sahih.json')
          .then((r) => r.json())
          .then((d) => (t.sahih = d))
          .catch(() => (t.sahih = {}))
      );
    }
    if (!t.pickthall) {
      fetchPromises.push(
        fetch('./data/translations/en/pickthall.json')
          .then((r) => r.json())
          .then((d) => (t.pickthall = d))
          .catch(() => (t.pickthall = {}))
      );
    }

    if (fetchPromises.length) {
      await Promise.all(fetchPromises);
    }
    return t;
  }

  async fetchTafsir(surahNum, ayahNum) {
    const key = `${surahNum}:${ayahNum}`;
    if (this.cache.tafsir.has(key)) return this.cache.tafsir.get(key);
    const url = `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/en-al-jalalayn/${surahNum}/${ayahNum}.json`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Tafsir not found: ${res.status}`);
      const data = await res.json();
      this.cache.tafsir.set(key, data);
      return data;
    } catch (err) {
      return {
        text: 'Tafsir commentary currently unavailable for this ayah.',
        source: 'Tafsir al-Jalalayn',
        error: true,
      };
    }
  }

  async fetchSearchIndex() {
    if (this.cache.searchIndex) return this.cache.searchIndex;
    const res = await fetch('./data/search-index.json');
    if (!res.ok) throw new Error('Search index unavailable');
    const data = await res.json();
    this.cache.searchIndex = data;
    return data;
  }

  /**
   * Find concordance occurrences of a given root across cached chapters.
   */
  findRootConcordances(root) {
    if (!root) return [];
    const results = [];
    for (const [surahNum, morphData] of this.cache.morphology.entries()) {
      for (const [ayahNum, tokens] of Object.entries(morphData.ayahs)) {
        for (const token of tokens) {
          if (token.root === root) {
            results.push({
              surah: surahNum,
              ayah: parseInt(ayahNum, 10),
              ref: `${surahNum}:${ayahNum}`,
              token,
            });
            break; // One match per ayah is sufficient for list
          }
        }
      }
    }
    return results;
  }
}

export const store = new QuranStore();
