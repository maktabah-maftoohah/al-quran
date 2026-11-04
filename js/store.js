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
        jalalayn: null,
        sahih: null,
        pickthall: null,
        kemenag: null,
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
      jawiMode: false,
      hifz: {
        active: false,
        repeatCount: 1,
        delaySeconds: 0,
        blurArabic: false,
        rangeStart: 1,
        rangeEnd: null,
      },
      language: 'ms',
      activeTranslations: {
        basmeih: true,
        jalalayn: false,
        sahih: false,
        pickthall: false,
        kemenag: false,
      },
    };

    this.settings = this.loadSettings();
    this.bookmarks = this.loadBookmarks();
    this.lastRead = this.loadLastRead();
  }

  // --- LocalStorage Helpers ---

  loadSettings() {
    try {
      const savedStr = localStorage.getItem('maktabah_quran_settings');
      if (!savedStr) return { ...this.defaultSettings };
      const saved = JSON.parse(savedStr);
      // Migrate older settings to new defaults: JAKIM only default and default language 'ms'
      if (!saved.schemaVersion || saved.schemaVersion < 2) {
        saved.activeTranslations = {
          basmeih: true,
          jalalayn: false,
          sahih: false,
          pickthall: false,
          kemenag: false,
        };
        saved.language = saved.language || 'ms';
        saved.schemaVersion = 2;
        localStorage.setItem('maktabah_quran_settings', JSON.stringify({ ...this.defaultSettings, ...saved }));
      }
      return { ...this.defaultSettings, ...saved };
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

  getSurahName(meta) {
    if (!meta) return '';
    const lang = this.settings.language || 'ms';
    return lang === 'ms' ? (meta.name_ms || meta.name_latin) : meta.name_latin;
  }

  getSurahTranslation(meta) {
    if (!meta) return '';
    const lang = this.settings.language || 'ms';
    return lang === 'ms' ? (meta.translation_ms || meta.name_translation) : meta.name_translation;
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

  async fetchTranslations(activeOnly = true) {
    const t = this.cache.translations;
    const act = this.settings.activeTranslations || { basmeih: true, jalalayn: false, sahih: false, pickthall: false, kemenag: false };
    const fetchPromises = [];

    if ((!activeOnly || act.basmeih) && !t.basmeih) {
      fetchPromises.push(
        fetch('./data/translations/ms/basmeih.json')
          .then((r) => r.json())
          .then((d) => (t.basmeih = d))
          .catch(() => (t.basmeih = {}))
      );
    }
    if ((!activeOnly || act.jalalayn) && !t.jalalayn) {
      fetchPromises.push(
        fetch('./data/translations/ms/jalalayn.json')
          .then((r) => r.json())
          .then((d) => (t.jalalayn = d))
          .catch(() => (t.jalalayn = {}))
      );
    }
    if ((!activeOnly || act.sahih) && !t.sahih) {
      fetchPromises.push(
        fetch('./data/translations/en/sahih.json')
          .then((r) => r.json())
          .then((d) => (t.sahih = d))
          .catch(() => (t.sahih = {}))
      );
    }
    if ((!activeOnly || act.pickthall) && !t.pickthall) {
      fetchPromises.push(
        fetch('./data/translations/en/pickthall.json')
          .then((r) => r.json())
          .then((d) => (t.pickthall = d))
          .catch(() => (t.pickthall = {}))
      );
    }
    if ((!activeOnly || act.kemenag) && !t.kemenag) {
      fetchPromises.push(
        fetch('./data/translations/id/kemenag.json')
          .then((r) => r.json())
          .then((d) => (t.kemenag = d))
          .catch(() => (t.kemenag = {}))
      );
    }

    if (fetchPromises.length) {
      await Promise.all(fetchPromises);
    }
    return t;
  }

  async fetchTafsir(surahNum, ayahNum, edition = 'ms-al-jalalayn') {
    const key = `${edition}:${surahNum}:${ayahNum}`;
    if (this.cache.tafsir.has(key)) return this.cache.tafsir.get(key);

    if (edition === 'ms-al-jalalayn') {
      try {
        if (!this.cache.translations.jalalayn) {
          const res = await fetch('./data/translations/ms/jalalayn.json');
          if (res.ok) {
            this.cache.translations.jalalayn = await res.json();
          }
        }
        const sStr = String(surahNum);
        const aStr = String(ayahNum);
        const text = this.cache.translations.jalalayn?.[sStr]?.[aStr] || 'Ulasan tafsir tidak tersedia untuk ayat ini.';
        const result = { text, source: 'Tafsir al-Jalalayn (Bahasa Melayu / Nusantara)', error: false };
        this.cache.tafsir.set(key, result);
        return result;
      } catch {
        return { text: 'Ulasan tafsir tidak tersedia.', source: 'Tafsir al-Jalalayn', error: true };
      }
    }

    const url = `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/${edition}/${surahNum}/${ayahNum}.json`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Tafsir not found: ${res.status}`);
      const data = await res.json();
      this.cache.tafsir.set(key, data);
      return data;
    } catch (err) {
      return {
        text: 'Tafsir commentary currently unavailable for this ayah.',
        source: edition === 'en-ibn-kathir' ? 'Tafsir Ibn Kathir' : 'Tafsir al-Jalalayn',
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
