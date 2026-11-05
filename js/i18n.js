/**
 * Maktabah Maftoohah Al-Quran - Internationalization (i18n) Module
 * Supports dual language interface: Bahasa Melayu (MY - Default) & English (EN).
 */

export const translations = {
  ms: {
    app: {
      title: "Al-Quran — Maktabah Maftoohah",
      subtitle: "maktabah-maftoohah",
    },
    nav: {
      searchPlaceholder: "Cari Quran...",
      searchAria: "Buka enjin carian",
      mushafBtn: "📄 Mushaf",
      mushafTitle: "Paparan Mushaf Madinah 15-Baris",
      hifzBtn: "🧠 Hifz",
      hifzTitle: "Togol Mod Ujian Hafazan (Hifz)",
      offlinePill: "📶 Luar Talian",
      offlineTitle: "Mod Luar Talian: Teks dan audio sedia ada tanpa internet",
      wakeLockTitle: "Kekalkan Skrin Menyala (Wake Lock)",
      typographyTitle: "Tetapan Paparan & Tipografi",
      bookmarksTitle: "Penanda Buku",
      sourceGithub: "Lihat Kod Sumber di GitHub",
      toggleDrawerAria: "Buka/Tutup laci navigasi",
      toggleDrawerTitle: "Togol Navigasi (Ctrl+B / [)",
      languageToggle: "Tukar Bahasa (Switch Language)",
    },
    sidebar: {
      tabSurahs: "Surah (114)",
      tabBookmarks: "Penanda Buku",
      tabNotes: "Nota",
      filterPlaceholder: "Tapis nombor, nama, atau Arab...",
      ayahsReady: "{n} ayat • Sedia",
      noBookmarks: "Tiada penanda buku lagi.",
      noNotes: "Tiada nota lagi.",
    },
    settings: {
      title: "Paparan & Tipografi",
      interfaceLanguage: "Bahasa Antara Muka",
      langMalay: "🇲🇾 Melayu",
      langEnglish: "🇬🇧 English",
      arabicFontSize: "Saiz Fon Arab",
      translationFontSize: "Saiz Terjemahan",
      activeTranslations: "Terjemahan Aktif",
      jawiScript: "🇲🇾 Tulisan Jawi (Jawi Script)",
      wakeLockLabel: "💡 Kekalkan Skrin Menyala (Tiada Pemasa)",
      offlineStorage: "Storan Luar Talian (IndexedDB)",
      storageAudio: "Audio: {size}",
      lockBtn: "Kunci",
      lockBtnTitle: "Kekalkan storan berterusan supaya tidak dipadam oleh pelayar",
      clearAudioBtn: "Padam Audio",
      backupTitle: "Sandaran & Pulihkan Data",
      backupBtn: "📥 Sandar JSON",
      backupTitleTip: "Eksport semua nota, penanda buku dan tetapan sebagai fail JSON",
      restoreBtn: "📤 Pulih",
      restoreTitleTip: "Pulihkan nota dan penanda buku daripada fail JSON",
    },
    surah: {
      meccan: "Makkiyyah",
      medinan: "Madaniyyah",
      versesCount: "{n} Ayat",
      surahNumber: "Surah Ke-{n}",
      playFullSurah: "Mainkan Keseluruhan Surah",
      pauseSurah: "Jeda Surah",
      openMushaf: "Buka Paparan Mushaf",
      hifzActiveBanner: "Mod Hifz Aktif: Semua ayat dikaburkan untuk ujian ingatan. Ketik mana-mana ayat untuk semak.",
      exitHifzBtn: "Keluar Mod Hifz",
      btnPlay: "Main",
      btnCard: "Kad",
      btnBookmark: "Tanda",
      btnBookmarked: "Ditanda",
      btnNote: "Nota",
      btnCopy: "Salin",
      btnLink: "Pautan",
      btnDeepDive: "Terperinci",
      studyNoteHeader: "📝 Nota Pengajian",
      toastCopied: "Ayat {ref} disalin ke papan klip",
      toastLinkCopied: "Pautan ke ayat {ref} disalin ke papan klip",
      toastCopyFailed: "Gagal menyalin ayat",
      toastBookmarkAdded: "Penanda buku ditambah: {ref}",
      toastBookmarkRemoved: "Penanda buku dipadam: {ref}",
      toastNoteSaved: "Nota disimpan untuk {ref}",
      toastNoteDeleted: "Nota dipadam untuk {ref}",
    },
    deepDive: {
      backBtn: "← Kembali ke Surah {n}",
      heading: "Kajian Terperinci Ayat {ref}",
      tabMorphology: "Nahu & Morfologi",
      tabTranslations: "Terjemahan",
      tabTafsir: "Tafsir",
      morphologyNotice: "Klik mana-mana perkataan untuk periksa kata dasar, lema, dan sintaks nahu di laci tatabahasa.",
      classicalCommentary: "Ulasan Tafsir Klasik",
      selectJalalaynMs: "🇲🇾 Tafsir al-Jalalayn (Bahasa Melayu / Nusantara)",
      selectJalalaynEn: "🇬🇧 Tafsir al-Jalalayn (English)",
      selectIbnKathirEn: "🇬🇧 Tafsir Ibn Kathir (English)",
      drawerTitle: "Morfologi & Kata Dasar Perkataan",
      drawerPosition: "Kedudukan Perkataan",
      drawerRoot: "Kata Dasar (Root / الجذر)",
      drawerLemma: "Lema (Lemma)",
      drawerPos: "Golongan Kata (Part of Speech)",
      drawerGloss: "Makna Kata (Gloss)",
      drawerCorpus: "Pautan Korpus",
      drawerPronounce: "Sebut Perkataan",
    },
    player: {
      prevAyahTitle: "Ayat Sebelumnya (Alt + ←)",
      playPauseTitle: "Main / Jeda (Space)",
      nextAyahTitle: "Ayat Seterusnya (Alt + →)",
      reciterTitle: "Tukar Qari",
      loopTitle: "Ulang ayat semasa",
      loopLabel: "Ulang",
      scrollTitle: "Tatal automatik ke ayat aktif",
      scrollLabel: "Tatal",
    },
    search: {
      placeholder: "Cari surah, lompat ayat (112:1), atau kata kunci...",
      initialPrompt: "Taip nombor ayat (cth. 1:1, 112:1), nama surah, atau kata kunci carian...",
      noResults: "Tiada ayat ditemui sepadan dengan carian anda.",
      directJump: "⚡ LOMPAT AYAT TERUS",
      surahMatch: "📖 SURAH",
      btnDeepDive: "Terperinci",
    },
    card: {
      modalTitle: "📸 Kad Ayat Kongsi",
      formatLabel: "Format:",
      squareOption: "Segi Empat (1:1 Suapan / Status)",
      storyOption: "Cerita (9:16 Potret)",
      btnShare: "📤 Kongsi",
      btnDownload: "💾 PNG",
      btnCopy: "📋 Salin",
      toastCopySuccess: "Imej kad ayat disalin ke papan klip",
      toastCopyFailed: "Gagal menyalin imej kad",
    },
    note: {
      modalTitle: "📝 Nota Pengajian Ayat",
      placeholder: "Tulis refleksi peribadi, nota tafsir, atau peringatan hafazan anda di sini...",
      btnDelete: "🗑 Padam Nota",
      btnCancel: "Batal",
      btnSave: "💾 Simpan Nota",
    },
    bookmarks: {
      title: "Penanda Buku Disimpan",
      emptyDesc: "Anda belum menandakan sebarang ayat lagi.",
      startReading: "Mula Membaca Al-Fatihah",
      openVerse: "Buka Ayat",
      deepDive: "🔬 Terperinci",
      btnRemove: "✕ Padam",
    },
    mushaf: {
      prevPage: "Halaman {p}",
      nextPage: "Halaman {p}",
      pageLabel: "Halaman",
      readingView: "📖 Paparan Surah",
      juz: "Juzuk",
      loading: "Memuatkan Halaman Mushaf {p}...",
      selectSurah: "Pilih Surah",
      selectJuz: "Pilih Juzuk",
      sajdah: "Sujud Tilawah",
    }
  },
  en: {
    app: {
      title: "Al-Quran — Maktabah Maftoohah",
      subtitle: "maktabah-maftoohah",
    },
    nav: {
      searchPlaceholder: "Search Quran...",
      searchAria: "Open search engine",
      mushafBtn: "📄 Mushaf",
      mushafTitle: "15-Line Madinah Mushaf Page View",
      hifzBtn: "🧠 Hifz",
      hifzTitle: "Toggle Tahfiz / Hifz Memorization Mode",
      offlinePill: "📶 Offline",
      offlineTitle: "Offline Mode: Cached text and audio are available",
      wakeLockTitle: "Keep Screen Awake (Wake Lock)",
      typographyTitle: "Text & Display Settings",
      bookmarksTitle: "Saved Bookmarks",
      sourceGithub: "View Source on GitHub",
      toggleDrawerAria: "Toggle navigation drawer",
      toggleDrawerTitle: "Toggle Sidebar (Ctrl+B / [)",
      languageToggle: "Switch Language / Tukar Bahasa",
    },
    sidebar: {
      tabSurahs: "Surahs (114)",
      tabBookmarks: "Bookmarks",
      tabNotes: "Notes",
      filterPlaceholder: "Filter by number, name, or Arabic...",
      ayahsReady: "{n} ayahs • Ready",
      noBookmarks: "No bookmarks yet.",
      noNotes: "No notes yet.",
    },
    settings: {
      title: "Display & Typography",
      interfaceLanguage: "Interface Language",
      langMalay: "🇲🇾 Melayu",
      langEnglish: "🇬🇧 English",
      arabicFontSize: "Arabic Font Size",
      translationFontSize: "Translation Size",
      activeTranslations: "Active Translations",
      jawiScript: "🇲🇾 Jawi Script (tulisan Jawi)",
      wakeLockLabel: "💡 Keep Screen Awake (No Timeout)",
      offlineStorage: "Offline Storage (IndexedDB)",
      storageAudio: "Audio: {size}",
      lockBtn: "Lock",
      lockBtnTitle: "Keep storage persistent so browser does not evict it",
      clearAudioBtn: "Clear Audio",
      backupTitle: "Data Backup & Restore",
      backupBtn: "📥 Backup JSON",
      backupTitleTip: "Export all notes, bookmarks, and settings as JSON file",
      restoreBtn: "📤 Restore",
      restoreTitleTip: "Restore notes and bookmarks from JSON file",
    },
    surah: {
      meccan: "Meccan",
      medinan: "Medinan",
      versesCount: "{n} Verses",
      surahNumber: "Surah #{n}",
      playFullSurah: "Play Full Surah Continuous",
      pauseSurah: "Pause Surah",
      openMushaf: "Open in Mushaf View",
      hifzActiveBanner: "Hifz Active: All verses blurred for recall. Click any verse to check.",
      exitHifzBtn: "Exit Hifz Mode",
      btnPlay: "Play",
      btnCard: "Card",
      btnBookmark: "Bookmark",
      btnBookmarked: "Bookmarked",
      btnNote: "Note",
      btnCopy: "Copy",
      btnLink: "Link",
      btnDeepDive: "Deep-Dive",
      studyNoteHeader: "📝 Study Note",
      toastCopied: "Verse {ref} copied to clipboard",
      toastLinkCopied: "Link for verse {ref} copied to clipboard",
      toastCopyFailed: "Failed to copy verse",
      toastBookmarkAdded: "Bookmark saved: {ref}",
      toastBookmarkRemoved: "Bookmark removed: {ref}",
      toastNoteSaved: "Note saved for {ref}",
      toastNoteDeleted: "Note deleted for {ref}",
    },
    deepDive: {
      backBtn: "← Back to Surah {n}",
      heading: "Verse {ref} Deep-Dive",
      tabMorphology: "Grammar & Morphology",
      tabTranslations: "Translations",
      tabTafsir: "Tafsir",
      morphologyNotice: "Click any word to inspect root, lemma, and syntax in the grammar drawer.",
      classicalCommentary: "Classical Commentary",
      selectJalalaynMs: "🇲🇾 Tafsir al-Jalalayn (Bahasa Melayu / Nusantara)",
      selectJalalaynEn: "🇬🇧 Tafsir al-Jalalayn (English)",
      selectIbnKathirEn: "🇬🇧 Tafsir Ibn Kathir (English)",
      drawerTitle: "Word Morphology & Root",
      drawerPosition: "Word Position",
      drawerRoot: "Root (الجذر)",
      drawerLemma: "Lemma",
      drawerPos: "Part of Speech (POS)",
      drawerGloss: "English / Malay Gloss",
      drawerCorpus: "Corpus Link",
      drawerPronounce: "Pronounce Word",
    },
    player: {
      prevAyahTitle: "Previous Ayah (Alt + ←)",
      playPauseTitle: "Play / Pause (Space)",
      nextAyahTitle: "Next Ayah (Alt + →)",
      reciterTitle: "Change Reciter",
      loopTitle: "Toggle repeat current verse",
      loopLabel: "Loop",
      scrollTitle: "Toggle auto-scroll to active verse",
      scrollLabel: "Scroll",
    },
    search: {
      placeholder: "Search surah, verse jump (112:1), or keywords...",
      initialPrompt: "Type a verse jump (e.g. 1:1, 112:1), surah name, or search query...",
      noResults: "No matches found.",
      directJump: "⚡ DIRECT VERSE JUMP",
      surahMatch: "📖 SURAH",
      btnDeepDive: "Deep-Dive",
    },
    card: {
      modalTitle: "📸 Shareable Verse Card",
      formatLabel: "Format:",
      squareOption: "Square (1:1 Feed / Status)",
      storyOption: "Story (9:16 Portrait)",
      btnShare: "📤 Share",
      btnDownload: "💾 PNG",
      btnCopy: "📋 Copy",
      toastCopySuccess: "Verse card copied to clipboard",
      toastCopyFailed: "Failed to copy card image",
    },
    note: {
      modalTitle: "📝 Verse Study Note",
      placeholder: "Write your personal reflections, tafsir notes, or memorization reminders here...",
      btnDelete: "🗑 Delete Note",
      btnCancel: "Cancel",
      btnSave: "💾 Save Note",
    },
    bookmarks: {
      title: "Saved Bookmarks",
      emptyDesc: "You haven't bookmarked any verses yet.",
      startReading: "Start Reading Al-Fatihah",
      openVerse: "Open Verse",
      deepDive: "🔬 Deep-Dive",
      btnRemove: "✕ Remove",
    },
    mushaf: {
      prevPage: "Page {p}",
      nextPage: "Page {p}",
      pageLabel: "Page",
      readingView: "📖 Surah View",
      juz: "Juz",
      loading: "Loading Mushaf Page {p}...",
      selectSurah: "Select Surah",
      selectJuz: "Select Juz",
      sajdah: "Sajdah (Prostration)",
    }
  }
};

export class I18nManager {
  constructor() {
    this.currentLang = 'ms'; // Default is MY (Bahasa Melayu)
    this.listeners = [];
  }

  init(initialLang = 'ms') {
    this.currentLang = initialLang === 'en' ? 'en' : 'ms';
    document.documentElement.lang = this.currentLang;
    this.updateDom();
  }

  getLanguage() {
    return this.currentLang;
  }

  setLanguage(lang, triggerListeners = true) {
    this.currentLang = lang === 'en' ? 'en' : 'ms';
    document.documentElement.lang = this.currentLang;
    this.updateDom();
    if (triggerListeners) {
      for (const fn of this.listeners) {
        try {
          fn(this.currentLang);
        } catch (e) {
          console.warn('i18n listener error:', e);
        }
      }
    }
  }

  onLanguageChange(fn) {
    this.listeners.push(fn);
  }

  t(path, params = {}) {
    const keys = path.split('.');
    let cur = translations[this.currentLang];
    for (const k of keys) {
      if (cur && cur[k] !== undefined) {
        cur = cur[k];
      } else {
        // Fallback to English
        let fallback = translations.en;
        for (const fk of keys) {
          if (fallback && fallback[fk] !== undefined) {
            fallback = fallback[fk];
          } else {
            return path;
          }
        }
        cur = fallback;
        break;
      }
    }
    if (typeof cur !== 'string') return cur || path;
    return cur.replace(/\{(\w+)\}/g, (_, name) => params[name] !== undefined ? params[name] : `{${name}}`);
  }

  updateDom() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = this.t(key);
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.setAttribute('placeholder', this.t(key));
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', this.t(key));
      }
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      if (key) {
        el.setAttribute('aria-label', this.t(key));
      }
    });
  }
}

export const i18n = new I18nManager();
