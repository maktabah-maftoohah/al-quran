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
      mushafLabel: "Mushaf",
      mushafTitle: "Paparan Mushaf Madinah 15-Baris",
      hifzBtn: "🧠 Hifz",
      hifzLabel: "Hifz",
      hifzTitle: "Togol Mod Ujian Hafazan (Hifz)",
      offlinePill: "📶 Luar Talian",
      offlineTitle: "Mod Luar Talian: Teks dan audio sedia ada tanpa internet",
      wakeLockTitle: "Kekalkan Skrin Menyala (Wake Lock)",
      typographyTitle: "Tetapan Paparan & Tipografi",
      bookmarksTitle: "Penanda Buku",
      sourceGithub: "Lihat Kod Sumber di GitHub",
      loginBtn: "Log Masuk",
      loginTitle: "Log Masuk Google & Penyegerakan Drive",
      loggedIn: "Disambung",
      toggleDrawerAria: "Buka/Tutup laci navigasi",
      toggleDrawerTitle: "Togol Navigasi (Ctrl+B / [)",
      languageToggle: "Tukar Bahasa (Switch Language)",
    },
    sidebar: {
      tabSurahs: "Surah (114)",
      tabBookmarks: "Penanda Buku",
      tabNotes: "Nota",
      tabAsbab: "📜 Asbab",
      noAsbab: "Tiada rekod Asbabun Nuzul ditemui.",
      filterPlaceholder: "Tapis nombor, nama, atau Arab...",
      filterBookmarksPlaceholder: "Tapis penanda buku...",
      filterNotesPlaceholder: "Tapis nota & refleksi...",
      filterAsbabPlaceholder: "Tapis surah atau ayat Asbab...",
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
      wbwLanguage: "Bahasa Kata-demi-Kata",
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
      gdriveTitle: "Penyegerakan Google Drive",
      gdriveConnect: "Sambung Drive",
      gdriveSyncNow: "Segerak",
      gdriveDisconnect: "Putus",
      gdriveConfig: "Konfigurasi Client ID",
      gdriveNotConnected: "Belum disambung. Segerakkan nota & penanda buku merentas peranti.",
      gdriveConnected: "Disambung ({email})",
      gdriveLastSynced: "Disambung. Terakhir: {time}",
      gdriveSyncing: "Sedang menyegerak data...",
      gdriveSaveId: "Simpan",
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
      btnAsbab: "📜 Asbab",
      btnAsbab: "Asbabun Nuzul",
      tooltipPlay: "Mainkan Audio",
      tooltipPause: "Jeda Audio",
      tooltipCard: "Jana Kad Perkongsian",
      tooltipBookmark: "Tanda Buku Ayat",
      tooltipBookmarked: "Padam Penanda Buku",
      tooltipNote: "Nota Pengajian",
      tooltipCopy: "Salin Teks & Terjemahan",
      tooltipLink: "Salin Pautan Terus",
      tooltipDeepDive: "Kajian Nahu Terperinci",
      tooltipAsbab: "Lihat Asbabun Nuzul (Sebab Turun Wahyu)",
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
      btnCopyLink: "🔗 Pautan",
      btnCopyAi: "🤖 Rujukan AI",
      toastAiCopied: "Format rujukan AI untuk ayat {ref} disalin!",
      backBtn: "← Kembali ke Surah {n}",
      heading: "Kajian Terperinci Ayat {ref}",
      tabMorphology: "Nahu & Morfologi",
      tabTranslations: "Terjemahan",
      tabTafsir: "Tafsir",
      tabAsbab: "Asbabun Nuzul",
      asbabHeader: "Sebab & Latar Belakang Turun Wahyu (Asbabun Nuzul)",
      asbabSourceTitle: "Sumber Riwayat & Rujukan Hadis",
      asbabHadithText: "Teks Riwayat Sahih (Bahasa Arab)",
      asbabEmptyTitle: "Tiada Riwayat Sebab Turun Khusus",
      asbabEmptyDesc: "Ayat ini tidak mempunyai riwayat asbabun nuzul khusus. Kebanyakan ayat Al-Quran diturunkan secara langsung sebagai petunjuk keimanan, prinsip akhlak, ketetapan hukum umum, atau tazkirah tanpa terikat dengan sesuatu peristiwa tertentu.",
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
      drawerCorpusBtn: "Korpus Al-Quran ↗",
      drawerPronounce: "Sebut Perkataan",
      playRecitation: "Mainkan Bacaan",
      pauseRecitation: "Jeda Bacaan",
      loopAyah: "Ulang Ayat",
      wbwSectionTitle: "Analisis Perkataan & Morfologi Interaktif",
      wbwHint: "(Klik perkataan untuk semak kata dasar & tatabahasa)",
      tabNotes: "Nota Peribadi",
      personalReflection: "Refleksi Peribadi (IndexedDB)",
      noteSaved: "Disimpan: {date}",
      noNoteYet: "Tiada nota disimpan lagi",
      notePlaceholder: "Tulis refleksi peribadi atau nota kajian tafsir anda untuk ayat ini...",
      deleteNote: "Padam Nota",
      saveNote: "Simpan Nota",
      noTranslationsNotice: "Sila pilih sekurang-kurangnya satu terjemahan dalam panel Paparan & Tipografi (T).",
      loadCommentaryPlaceholder: "Klik untuk memuatkan huraian bagi {ref}...",
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
      btnAsbab: "📜 Asbab",
    },
    card: {
      modalTitle: "📸 Kad Ayat Kongsi",
      directLinkTitle: "Pautan Terus & Rujukan AI:",
      btnCopyLink: "🔗 Salin",
      btnCopyAi: "🤖 Format AI",
      toastAiCopied: "Format rujukan AI untuk ayat {ref} disalin!",
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
      sliderAria: "Gelongsor pantas halaman mushaf 1 hingga 604",
      translationTitle: "Terjemahan Ayat",
      translationClose: "Tutup terjemahan",
      bookmarkPage: "Tanda Halaman",
      bookmarkedPage: "Halaman Ditanda",
      spreadMode: "Hamparan 2 Halaman",
      singleMode: "1 Halaman",
      themeSepia: "Sepia (Kertas)",
      themeDark: "Tema Gelap",
      printPage: "Cetak Halaman",
    },
    khatam: {
      streakTitle: "Sasaran Khatam & Jejak Bacaan Harian",
      modalTitle: "Sasaran Khatam & Jejak Bacaan",
      streakCount: "{n} Hari Berturut-turut",
      progressText: "{completed} / 604 Halaman Selesai ({pct}%)",
      targetLabel: "Sasaran Tempoh:",
      days30: "30 Hari (Juzuk Sehari)",
      days60: "60 Hari (~10 Halaman)",
      days90: "90 Hari (~7 Halaman)",
      days180: "180 Hari (~3-4 Halaman)",
      days365: "365 Hari (~1-2 Halaman)",
      dailyPace: "Sasaran Harian: ~{n} muka surat sehari",
      btnMarkPage: "Tanda Halaman Ini Selesai",
      btnPageDone: "Halaman Ditanda Selesai ✓",
      btnReset: "Mulakan Semula Khatam",
      resetConfirm: "Adakah anda pasti mahu memulakan semula jejak khatam?",
      streakPill: "🔥 {streak}h | {pct}%",
    },
    hifzMastery: {
      badgeTitle: "Status Hafazan Ayat (Ketik untuk tukar)",
      unmarked: "Belum Ditanda",
      learning: "Sedang Dihafal",
      memorized: "Sudah Dihafal",
      needsReview: "Perlu Muraja'ah",
      toastUpdated: "Status hafazan {ref}: {status}",
    },
    audioResume: {
      prompt: "Sambung bacaan Surah {surah}:{ayah} ({reciter})?",
      play: "Dengar Sekarang",
      dismiss: "Tutup",
    },
    folders: {
      all: "Semua",
      newFolder: "+ Folder",
      promptNew: "Masukkan nama folder baru:",
      defaultFolder: "Lalai",
      moveToFolder: "Pindah ke folder...",
      folderBadge: "📁 {name}",
    },
    calendar: {
      fridayTitle: "Peringatan Al-Kahf Jumaat",
      fridayDesc: "Tambah peringatan berulang ke Google Calendar setiap Jumaat.",
      btnFriday: "🗓️ Peringatan Al-Kahf",
      khatamTitle: "Jadual Khatam Harian",
      khatamDesc: "Tambah peringatan harian tadarus ke Google Calendar.",
      btnKhatam: "🗓️ Peringatan Khatam",
    },
    gdriveFeatures: {
      exportNotesBtn: "📄 Eksport Nota ke Drive",
      revisionsBtn: "⏱️ Sejarah Semakan",
      calendarBtn: "🗓️ Peringatan Kalendar",
      exportSuccess: "Nota berjaya dieksport ke Google Drive!",
      exportFailed: "Gagal mengeksport nota: {error}",
      revisionsTitle: "Sejarah Semakan Sandaran Drive",
      revisionsEmpty: "Tiada semakan sandaran ditemui.",
      restoreBtn: "Pulihkan",
      restoreConfirm: "Adakah anda pasti mahu memulakan semula data dari semakan {time}?",
      restoring: "Sedang memulihkan...",
      restoreSuccess: "Data berjaya dipulihkan dari semakan!",
      restoreFailed: "Gagal memulihkan semakan: {error}",
      openDoc: "Buka Dokumen",
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
      mushafLabel: "Mushaf",
      mushafTitle: "15-Line Madinah Mushaf Page View",
      hifzBtn: "🧠 Hifz",
      hifzLabel: "Hifz",
      hifzTitle: "Toggle Tahfiz / Hifz Memorization Mode",
      offlinePill: "📶 Offline",
      offlineTitle: "Offline Mode: Cached text and audio are available",
      wakeLockTitle: "Keep Screen Awake (Wake Lock)",
      typographyTitle: "Text & Display Settings",
      bookmarksTitle: "Saved Bookmarks",
      sourceGithub: "View Source on GitHub",
      loginBtn: "Login",
      loginTitle: "Google Login & Drive Sync",
      loggedIn: "Connected",
      toggleDrawerAria: "Toggle navigation drawer",
      toggleDrawerTitle: "Toggle Sidebar (Ctrl+B / [)",
      languageToggle: "Switch Language / Tukar Bahasa",
    },
    sidebar: {
      tabSurahs: "Surahs (114)",
      tabBookmarks: "Bookmarks",
      tabNotes: "Notes",
      tabAsbab: "📜 Asbab",
      noAsbab: "No Asbab al-Nuzul records found.",
      filterPlaceholder: "Filter by number, name, or Arabic...",
      filterBookmarksPlaceholder: "Filter bookmarks...",
      filterNotesPlaceholder: "Filter notes & reflections...",
      filterAsbabPlaceholder: "Filter asbab by surah or ayah...",
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
      gdriveTitle: "Google Drive Sync",
      gdriveConnect: "Connect Drive",
      gdriveSyncNow: "Sync",
      gdriveDisconnect: "Disconnect",
      gdriveConfig: "Configure Client ID",
      gdriveNotConnected: "Not connected. Sync notes & bookmarks across devices.",
      gdriveConnected: "Connected ({email})",
      gdriveLastSynced: "Connected. Last synced: {time}",
      gdriveSyncing: "Syncing data...",
      gdriveSaveId: "Save",
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
      btnAsbab: "📜 Asbab",
      btnAsbab: "Asbab al-Nuzul",
      tooltipPlay: "Play Audio",
      tooltipPause: "Pause Audio",
      tooltipCard: "Generate Share Card",
      tooltipBookmark: "Bookmark Verse",
      tooltipBookmarked: "Remove Bookmark",
      tooltipNote: "Study Note",
      tooltipCopy: "Copy Verse Text & Translation",
      tooltipLink: "Copy Direct Link",
      tooltipDeepDive: "Word-by-Word Deep-Dive",
      tooltipAsbab: "View Asbab al-Nuzul (Occasion of Revelation)",
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
      btnCopyLink: "🔗 Link",
      btnCopyAi: "🤖 AI Citation",
      toastAiCopied: "AI citation for verse {ref} copied!",
      backBtn: "← Back to Surah {n}",
      heading: "Verse {ref} Deep-Dive",
      tabMorphology: "Grammar & Morphology",
      tabTranslations: "Translations",
      tabTafsir: "Tafsir",
      tabAsbab: "Asbab al-Nuzul",
      asbabHeader: "Occasion & Historical Context of Revelation (Asbab al-Nuzul)",
      asbabSourceTitle: "Scholarly Sources & Hadith References",
      asbabHadithText: "Authentic Narration (Arabic Text)",
      asbabEmptyTitle: "No Specific Occasion Recorded",
      asbabEmptyDesc: "This verse does not have a specific recorded occasion of revelation. The majority of Quranic verses were revealed directly as universal guidance, core creed, moral wisdom, and parables without being tied to an immediate earthly incident.",
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
      drawerCorpusBtn: "Quran Corpus ↗",
      drawerPronounce: "Pronounce Word",
      playRecitation: "Play Recitation",
      pauseRecitation: "Pause Recitation",
      loopAyah: "Loop Ayah",
      wbwSectionTitle: "Interactive Word-by-Word & Morphology",
      wbwHint: "(Click word to inspect root & grammar)",
      tabNotes: "Personal Notes",
      personalReflection: "Personal Reflection (IndexedDB)",
      noteSaved: "Saved: {date}",
      noNoteYet: "No note saved yet",
      notePlaceholder: "Write your personal reflections or tafsir study notes for this ayah...",
      deleteNote: "Delete Note",
      saveNote: "Save Note",
      noTranslationsNotice: "Please enable at least one translation in Typography settings (T).",
      loadCommentaryPlaceholder: "Click to load commentary for {ref}...",
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
      btnAsbab: "📜 Asbab",
    },
    card: {
      modalTitle: "📸 Shareable Verse Card",
      directLinkTitle: "Direct Verse Link & AI Citation:",
      btnCopyLink: "🔗 Copy",
      btnCopyAi: "🤖 Copy AI",
      toastAiCopied: "AI citation for verse {ref} copied!",
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
      sliderAria: "Quick mushaf page scrubber from 1 to 604",
      translationTitle: "Verse Translation",
      translationClose: "Close translation",
      bookmarkPage: "Bookmark Page",
      bookmarkedPage: "Page Bookmarked",
      spreadMode: "2-Page Spread",
      singleMode: "Single Page",
      themeSepia: "Sepia (Parchment)",
      themeDark: "Dark Theme",
      printPage: "Print Page",
    },
    khatam: {
      streakTitle: "Khatam Goal & Daily Reading Streak",
      modalTitle: "Khatam Goal & Daily Tracker",
      streakCount: "{n} Day Streak",
      progressText: "{completed} / 604 Pages Completed ({pct}%)",
      targetLabel: "Target Duration:",
      days30: "30 Days (1 Juz / day)",
      days60: "60 Days (~10 Pages)",
      days90: "90 Days (~7 Pages)",
      days180: "180 Days (~3-4 Pages)",
      days365: "365 Days (~1-2 Pages)",
      dailyPace: "Daily Pace: ~{n} pages per day",
      btnMarkPage: "Mark Current Page Completed",
      btnPageDone: "Page Completed ✓",
      btnReset: "Reset Khatam Progress",
      resetConfirm: "Are you sure you want to reset your khatam tracker?",
      streakPill: "🔥 {streak}d | {pct}%",
    },
    hifzMastery: {
      badgeTitle: "Ayah Memorization Status (Click to toggle)",
      unmarked: "Unmarked",
      learning: "Learning",
      memorized: "Memorized",
      needsReview: "Needs Review",
      toastUpdated: "Hifz status for {ref}: {status}",
    },
    audioResume: {
      prompt: "Resume recitation Surah {surah}:{ayah} ({reciter})?",
      play: "Listen Now",
      dismiss: "Dismiss",
    },
    folders: {
      all: "All",
      newFolder: "+ Folder",
      promptNew: "Enter new folder name:",
      defaultFolder: "Default",
      moveToFolder: "Move to folder...",
      folderBadge: "📁 {name}",
    },
    calendar: {
      fridayTitle: "Friday Al-Kahf Reminder",
      fridayDesc: "Add a recurring reminder to Google Calendar every Friday.",
      btnFriday: "🗓️ Al-Kahf Reminder",
      khatamTitle: "Daily Khatam Schedule",
      khatamDesc: "Add daily reading reminder to Google Calendar.",
      btnKhatam: "🗓️ Khatam Reminder",
    },
    gdriveFeatures: {
      exportNotesBtn: "📄 Export Notes to Drive",
      revisionsBtn: "⏱️ Revision History",
      calendarBtn: "🗓️ Calendar Reminders",
      exportSuccess: "Notes successfully exported to Google Drive!",
      exportFailed: "Failed to export notes: {error}",
      revisionsTitle: "Google Drive Backup Revisions",
      revisionsEmpty: "No backup revisions found.",
      restoreBtn: "Restore",
      restoreConfirm: "Are you sure you want to restore data from revision {time}?",
      restoring: "Restoring...",
      restoreSuccess: "Data successfully restored from revision!",
      restoreFailed: "Failed to restore revision: {error}",
      openDoc: "Open Document",
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
