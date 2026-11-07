<p align="center">
  <img src="./assets/site-banner.png" alt="Banner Maktabah Maftoohah Al-Quran" width="100%">
</p>

# Maktabah Maftoohah — Al-Quran (المكتبة المفتوحة)

<p align="center">
  🇲🇾 <strong>Bahasa Melayu</strong> &nbsp;|&nbsp; <a href="README.en.md">🇬🇧 <strong>English Version</strong></a>
</p>

[![Aplikasi Web Langsung](https://img.shields.io/badge/Aplikasi%20Langsung-GitHub%20Pages-059669?style=for-the-badge&logo=github)](https://maktabah-maftoohah.github.io/al-quran/)
[![Keluaran](https://img.shields.io/github/v/release/maktabah-maftoohah/al-quran?style=for-the-badge&color=2563eb)](https://github.com/maktabah-maftoohah/al-quran/releases)
[![Lesen: MIT](https://img.shields.io/badge/Lesen-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![PWA Sedia Luar Talian](https://img.shields.io/badge/PWA-Sedia%20Luar%20Talian-6366f1?style=for-the-badge)](manifest.webmanifest)
[![Seni Bina: Zero-Build](https://img.shields.io/badge/Seni%20Bina-Zero--Build%20ES6-10b981?style=for-the-badge)](js/app.js)

**Maktabah Maftoohah Al-Quran** ialah aplikasi kajian Al-Quran digital sumber terbuka, tanpa kompilasi (zero-build), dan berkeutamaan luar talian (offline-first) berasaskan Progressive Web App (PWA). Aplikasi ini menyediakan persekitaran yang pantas, bebas gangguan untuk membaca, mendengar bacaan murattal, menghafaz, dan menganalisis Al-Quran secara mendalam dengan morfologi tatabahasa kata-demi-kata dwi-bahasa (Melayu & Inggeris), pelbagai edisi terjemahan muktabar, serta konteks sejarah Asbabun Nuzul.

🌐 **Aplikasi Web Langsung:** [https://maktabah-maftoohah.github.io/al-quran/](https://maktabah-maftoohah.github.io/al-quran/)

---

## 🌟 Ciri-Ciri Utama

### 📖 Teks Al-Quran Sahih & Paparan Mushaf Madinah Tradisional
* **Dataset Al-Quran Lengkap**: Seluruh 114 Surah dan 6,236 ayat dalam rasm Uthmani yang disemak rapi.
* **Paparan Mushaf Madinah 15 Baris**: Pemetaan susun atur halaman demi halaman merangkumi kesemua 604 halaman mushaf Madinah piawai (`#mushaf/{halaman}`) dengan penanda ayat dan navigasi pantas.
* **Hiasan Iluminasi Awal Surah Diraja**: Gerbang mahkota dan bingkai tajuk surah beriluminasi autentik untuk Halaman 1 (Al-Fatihah) dan Halaman 2 (Al-Baqarah).
* **Penunjuk Marginal & Tanda Tilawah**: Medalion Juzuk, Hizb, Rub' al-Hizb, serta penunjuk tanda Sajdah Tilawah berpandukan piawaian Percetakan Al-Quran Kompleks Raja Fahd.
* **Navigasi RTL & Selak Halaman Automatik**: Bar navigasi kanan ke kiri (RTL) sebenar dan pembalikan halaman automatik semasa bacaan audio melepasi sempadan halaman.
* **Logik Peletakan Basmalah**: Memaparkan sepanduk Basmalah hiasan secara automatik pada surah yang bersesuaian, dan meniadakannya secara tepat pada Surah 9 (At-Tawbah) mengikut tradisi disiplin ilmu Al-Quran.
* **Pautan Terus Ayat (Deep-Linking)**: Lompat terus ke mana-mana ayat dengan tatalan automatik dan sorotan (*highlight*) menggunakan notasi ringkas (`#6:12`), laluan surah (`#surah/6/12`), atau laluan kajian terperinci (`#ayah/6/12`).

### 🔬 Morfologi Kalimah demi Kalimah & Kajian Mendalam
* **Enjin Morfologi Dwi-Bahasa**: Kad kalimah Arab interaktif yang memaparkan transliterasi sebutan Rumi, glos serentak dalam **🌐 Mod Dwi-Bahasa (Melayu + English)**, **🇲🇾 Bahasa Melayu (Standard)**, **🇬🇧 English**, atau **🇮🇩 Bahasa Indonesia**, label golongan kata (*POS tags*), lema, serta akar kata dasar (`الجذر`).
* **Laci Tatabahasa & Integrasi Korpus Al-Quran**: Huraian sintaksis dan tatabahasa lengkap bagi setiap kalimah dengan pautan terus ke [Maktabah Maftoohah Korpus Al-Quran](https://maktabah-maftoohah.github.io/korpus-quran/) serta senarai konkordans kata dasar merentas ayat.
* **Terjemahan Harfiah Basmeih (Basmeih Harfiah)**: Edisi khas terjemahan Melayu bebas interpolasi (tanpa perkataan dalam kurungan atau ulasan penterjemah), sangat sesuai untuk kajian teks autentik, linguistik perbandingan, dan rujukan dialog tanpa pertikaian tambahan makna.
* **Tafsir al-Jalalayn & Ibn Kathir**: Integrasi ulasan tafsir muktabar secara terus dalam paparan kajian mendalam ayat (menampilkan Bahasa Melayu / Nusantara dan Bahasa Inggeris).
* **Asbabun Nuzul (Sebab Turun Wahyu)**: Konteks sejarah dan sebab penurunan wahyu bagi 657 ayat merentasi 85 surah, menggabungkan riwayat daripada *Kitab Asbab an-Nuzul* (Al-Wahidi), *Lubabun Nuqul* (As-Suyuthi), dan *Sahih Asbab an-Nuzul* (Ibrahim al-Ali) lengkap dengan matan hadis Arab, ulasan Bahasa Melayu, dan rujukan kitab.

### 🌍 Terjemahan Pelbagai Bahasa, Tulisan Jawi & Antara Muka Dwi-Bahasa
* **Antara Muka Dwi-Bahasa (MY / EN)**: Penyetempatan penuh dalam **Bahasa Melayu (Lalai)** dan **Bahasa Inggeris**, dengan penukaran pantas satu klik pada bar kepala dan panel tetapan.
* **Nama & Tajuk Surah Piawai Malaysia**: Dalam mod Bahasa Melayu, ejaan nama surah dan terjemahan mengikut piawaian rasmi Malaysia (contoh: *Al-Fatihah: Pembukaan, Al-Baqarah: Lembu Betina, Ali 'Imran: Keluarga Imran, An-Nisa': Wanita, dll.*).
* **Paparan Pintar Terjemahan Tunggal**: Menyembunyikan label nama terjemahan secara automatik apabila hanya satu terjemahan dipilih bagi memberikan pengalaman membaca yang tenang dan bersih.
* **6 Edisi Terjemahan & Tafsir Lengkap**:
  * 🇲🇾 **Basmeih Harfiah (Lalai)** — Terjemahan terus perkataan demi perkataan berasaskan Sheikh Abdullah Basmeih tanpa sebarang kurungan tambahan.
  * 🇲🇾 **Bahasa Melayu (JAKIM)** — *Tafsir Pimpinan Ar-Rahman* (Sheikh Abdullah Muhammad Basmeih / JAKIM)
  * 🇲🇾 **Tafsir al-Jalalayn** — Tafsir klasik Bahasa Melayu / Nusantara (Jalaluddin al-Mahalli & Jalaluddin as-Suyuti)
  * 🇬🇧 **Bahasa Inggeris** — Saheeh International
  * 🇬🇧 **Bahasa Inggeris (Sastera)** — Muhammad Marmaduke Pickthall
  * 🇮🇩 **Bahasa Indonesia** — Kementerian Agama Republik Indonesia (Kemenag)
* **Pemuatan Terjemahan Selektif**: Mengambil data terjemahan aktif sahaja secara dinamik untuk menjimatkan penggunaan data internet.
* **Transliterasi Jawi Dinamik**: Penukar algoritma Rumi ke Tulisan Jawi terbina dalam untuk pembaca yang menggemari teks Jawi warisan.

### 🎧 Enjin Bacaan Audio & Storan Luar Talian
* **Audio Berterusan & Ayat demi Ayat**: Pemain audio lekat di bahagian bawah dengan tatalan auto dan peralihan ayat lancar.
* **Qari Tersohor Dunia**:
  * Mishary Rashid Alafasy
  * Abu Bakr Al-Shatri
  * Abdul Basit Murattal
* **Sebutan Kalimah Individu**: Klik mana-mana kalimah Arab dalam paparan kajian terperinci untuk mendengar sebutan audio khusus kalimah tersebut.
* **Pemuat Turun Audio Luar Talian**: Simpan bacaan surah lengkap secara terus ke storan IndexedDB pelayar untuk didengar tanpa sambungan internet.

### 🧠 Mod Hafazan / Tahfiz (Hifz Mode)
* **Ujian Ingatan Aktif (*Active Recall*)**: Aktifkan mod Hifz untuk mengaburkan teks ayat Arab bagi menguji kekuatan hafazan anda.
* **Ketik untuk Papar (*Tap-to-Reveal*)**: Ketik mana-mana ayat yang dikaburkan untuk menyemak ketepatan bacaan secara serta-merta.
* **Gelung Ulangan Selang Masa**: Tetapkan bilangan ulangan ayat dan jeda bacaan untuk memantapkan hafazan.

### ⚡ Enjin Carian Pantas Melalui Web Worker
* **Web Worker Dedikasi**: Carian pantas dijalankan di luar utas utama (*off the main UI thread*), memastikan antara muka kekal lancar dan responsif merentasi kesemua 6,236 ayat.
* **Pemadanan Arab Ternormal**: Menyingkirkan tanda baris (*tashkeel*), variasi huruf hamzah, dan alif waslah secara pintar untuk carian yang fleksibel.
* **Lompatan Ayat Segera**: Taip `112:1`, `2:255`, atau `36` untuk lompat serta-merta ke surah atau ayat tertentu.

### 🎨 Penjana Kad Ayat Kongsi (*Shareable Verse Card*)
* **Eksport HTML5 Canvas**: Hasilkan kad ayat Al-Quran beresolusi tinggi dengan tipografi yang indah.
* **Nisbah Aspek**: Pilihan eksport format **1:1 (Segi Empat Sama)** untuk suapan media sosial atau **9:16 (Story / Reels)** untuk status peranti mudah alih.
* **Perkongsian Terus Pelayar**: Kongsi terus ke aplikasi permesejan melalui Web Share API, salin imej ke papan keratan (*clipboard*), atau muat turun fail PNG.

### 📝 Nota Kajian Peribadi & Sandaran 1-Klik
* **Enjin Nota Tersimpan**: Tulis refleksi peribadi, mutiara tadabbur, dan nota tafsir terus pada ayat, disimpan selamat dalam IndexedDB.
* **Sandaran & Pemulihan JSON 1-Klik**: Eksport semua penanda buku, nota peribadi, dan tetapan pengguna ke dalam fail JSON bertanda masa dengan pemulihan serta-merta.
* **Sembunyi Bar Sisi**: Buka dan tutup bar sisi dengan pintasan papan kekunci <kbd>[</kbd> untuk bacaan tanpa gangguan.
* **Kekal Skrin Menyala (Screen Wake Lock API)**: Skrin peranti kekal menyala tanpa malap semasa membaca atau menghafaz.

---

## ⌨️ Pintasan Papan Kekunci (*Keyboard Shortcuts*)

| Pintasan | Tindakan |
| :--- | :--- |
| <kbd>/</kbd> | Buka Modal Carian & Lompatan Ayat |
| <kbd>[</kbd> | Buka / Tutup Bar Sisi (Bacaan Bebas Gangguan) |
| <kbd>Esc</kbd> | Tutup Modal, Laci, atau Popover |
| <kbd>Space</kbd> | Main / Jeda Audio Semasa |
| <kbd>Alt</kbd> + <kbd>→</kbd> | Ayat Seterusnya |
| <kbd>Alt</kbd> + <kbd>←</kbd> | Ayat Sebelumnya |

---

## 🔗 Struktur Laluan URL (*Deep-Linking*)

Aplikasi ini menggunakan penghala berasaskan tanda pagar (*hash-based router*) yang menyokong penandaan dan perkongsian terus:

| Laluan URL | Destinasi |
| :--- | :--- |
| `/#1` atau `/#surah/1` | Membuka Surah 1 (Al-Fatihah) |
| `/#6:12` atau `/#surah/6/12` | Lompat terus ke Surah 6, Ayat 12 dengan tatalan auto dan sorotan |
| `/#ayah/1/1` | Buka Paparan Kajian Mendalam (*Deep-Dive*) dengan analisis morfologi kalimah demi kalimah dan tafsir |
| `/#mushaf/1` | Buka Paparan Halaman Mushaf Madinah 15 Baris (Halaman 1 hingga 604) |
| `/#search/iman` | Mengisi automatik dan memulakan carian kalimah |

---

## 🏗️ Prinsip Seni Bina & Invarian Teknikal

Projek ini berpandukan prinsip kejuruteraan perisian yang mementingkan ketahanan jangka panjang, prestasi tinggi, dan kesederhanaan:

1. **Zero-Build ES6**:
   * Modul natif ES6 tulen (`import` / `export`) yang dijalankan terus oleh pelayar moden.
   * Tanpa sebarang alat kompilasi atau pembungkus (tanpa Webpack, Vite, Rollup, atau Babel).
   * Sifar kebergantungan runtime npm.
2. **Keserasian Subpath GitHub Pages**:
   * Semua permintaan rangkaian menggunakan laluan relatif secara ketat (`./data/...`, `./css/...`, `./js/...`), memastikan aplikasi berjalan lancar di bawah subpath pengehosan seperti `https://maktabah-maftoohah.github.io/al-quran/`.
3. **PWA Berkeutamaan Luar Talian (Service Worker v23)**:
   * Pengoptimuman caching *stale-while-revalidate* menyediakan pemuatan pantas serta-merta semasa luar talian di samping mengambil kemas kini di latar belakang.
4. **Seni Bina Storan Tempatan**:
   * **IndexedDB** (`maktabah_quran_db`): Storan audio MP3 luar talian yang tahan lama dan nota kajian pengguna.
   * **localStorage**: Pilihan antara muka, penanda buku, dan penanda bacaan terakhir.
   * **Cache Storage**: Fail teras aplikasi, CSS, ikon, dan dataset JSON Al-Quran.
5. **Skema JSON Ketat & Pengekodan UTF-8**:
   * Kesemua fail data dan kod menggunakan pengekodan UTF-8 tanpa BOM.

---

## 📁 Struktur Repositori

```
al-quran/
├── .agents/
│   └── skills/
│       └── quran-etl/
│           └── SKILL.md             # Panduan dan arahan ETL Al-Quran
├── .github/
│   └── workflows/
│       └── deploy.yml               # Saluran CI/CD automatik GitHub Pages
├── css/
│   └── style.css                    # Susun atur responsif, tipografi, tema gelap
├── data/
│   ├── arabic/                      # 114 fail surah teks Uthmani & teks ringkas
│   ├── morphology/                  # 114 fail analisis morfologi kalimah demi kalimah
│   ├── translations/                # Terjemahan pelbagai bahasa & tafsir
│   │   ├── en/                      # Bahasa Inggeris (sahih.json, pickthall.json)
│   │   ├── id/                      # Bahasa Indonesia (kemenag.json)
│   │   └── ms/                      # Bahasa Melayu (basmeih.json, basmeih-harfiah.json, jalalayn.json)
│   ├── pages-meta.json              # Definisi 604 halaman Mushaf Madinah
│   ├── search-index.json            # Indeks carian seluruh 6,236 ayat
│   ├── surahs.json                  # Katalog 114 Surah dengan nama piawai rasmi
│   ├── asbabun-nuzul.json           # 657 riwayat sebab penurunan wahyu
│   └── icon.svg                     # Ikon vektor aplikasi
├── js/
│   ├── app.js                       # Pengawal & penyelaras aplikasi utama
│   ├── audio.js                     # Enjin bacaan audio HTML5
│   ├── backup.js                    # Pengurus sandaran & pemulihan JSON 1-klik
│   ├── card-generator.js            # Penjana kad ayat Al-Quran HTML5 Canvas
│   ├── i18n.js                      # Penyetempatan dwi-bahasa (MY / EN)
│   ├── jawi.js                      # Penukar algoritma Rumi ke Jawi
│   ├── mushaf.js                    # Pemapar Mushaf Madinah 15 baris
│   ├── router.js                    # Penghala SPA berasaskan hash
│   ├── search-worker.js             # Web Worker latar belakang untuk carian
│   ├── search.js                    # Pengendali UI & carian papan kekunci
│   ├── storage-db.js                # Enjin storan IndexedDB
│   ├── store.js                     # Pengurus keadaan reaktif & data
│   └── wake-lock.js                 # Pengawal selia Screen Wake Lock API
├── scripts/
│   ├── extract_quran.py             # Saluran Python ETL untuk pengekstrakan data
│   ├── serve.py                     # Pelayan pembangunan tempatan tanpa kebergantungan
│   ├── test_mushaf_authentic.js     # Ujian Mushaf Madinah autentik (10 semakan)
│   ├── test_release_qa.js           # Ujian utama Playwright QA (99 semakan)
│   ├── test_ui_comprehensive.js     # Ujian automatik UI & responsif (35 semakan)
│   ├── update_surah_names_ms.py     # Pengemas kini nama surah piawai Malaysia
│   ├── verify_data_integrity.py     # Pengesah integriti data & skema UTF-8
│   └── verify_project.py            # Pengesah invarian projek & laluan relatif
├── index.html                       # Titik masuk semantik HTML5
├── manifest.webmanifest             # Manifes Progressive Web App
├── sw.js                            # Service Worker PWA (v23)
├── AGENTS.md                        # Invarian projek & panduan untuk ejen AI
├── CONTRIBUTING.md                  # Panduan sumbangan & aliran kerja (Bahasa Melayu)
├── CONTRIBUTING.en.md               # Panduan sumbangan & aliran kerja (English)
├── LICENSE                          # Lesen MIT
├── package.json                     # Konfigurasi ujian & skrip npm
├── README.md                        # Dokumentasi utama repositori (Bahasa Melayu)
├── README.ms.md                     # Cermin dokumentasi Bahasa Melayu
└── README.en.md                     # Dokumentasi versi Bahasa Inggeris
```

---

## 🚀 Pembangunan Tempatan (*Local Development*)

Oleh kerana projek ini menggunakan seni bina zero-build, tiada proses kompilasi diperlukan. Cukup dengan menjalankan mana-mana pelayan HTTP tempatan pada direktori repositori:

### Kaedah 1: Menggunakan Pelayan Pembangunan Terbina Dalam (Disyorkan)
```bash
# Melancarkan pelayan tempatan dengan tajuk tanpa-cache (no-cache headers):
python scripts/serve.py --port 8000
# atau:
npm run serve
```

### Kaedah 2: Menggunakan Pelayan Standard Python
```bash
python -m http.server 8080
```
Buka [http://localhost:8080](http://localhost:8080) pada pelayar anda.

### Kaedah 3: Menggunakan Node.js
```bash
npx serve .
```

---

## 🧪 Ujian & Pengesahan Kualiti (*Testing & Verification*)

Projek ini dilengkapi dengan suite ujian automatik yang komprehensif bagi memastikan integriti data, kepatuhan seni bina, dan fungsi pelayar:

```bash
# 1. Sahkan Invarian Projek, Laluan Relatif & Skema
python scripts/verify_project.py

# 2. Sahkan Integriti Data Al-Quran (114 Surah, 6,236 Ayat, Skema & UTF-8)
python scripts/verify_data_integrity.py
# (Atau jalankan kedua-duanya sekali gus: npm run verify)

# 3. Jalankan Suite Ujian Playwright QA Utama (99 Semakan)
npm test
# atau: node scripts/test_release_qa.js

# 4. Jalankan Suite Ujian UI & Responsif (35 Semakan)
npm run test:ui
# atau: node scripts/test_ui_comprehensive.js

# 5. Jalankan Suite Ujian Mushaf Madinah Tulen (10 Semakan)
npm run test:mushaf
# atau: node scripts/test_mushaf_authentic.js
```

---

## 📚 Sumber Data & Penghargaan

Setinggi-tinggi penghargaan dirakamkan kepada komuniti sumber terbuka dan institusi keilmuan Islam yang menyediakan data bernilai ini:

* **[Projek Tanzil](https://tanzil.net)** — Teks Rasm Uthmani Al-Quran yang disahkan dan transliterasi.
* **[Maktabah Maftoohah Korpus Al-Quran](https://maktabah-maftoohah.github.io/korpus-quran/)** / **[Quranic Arabic Corpus](https://corpus.quran.com)** — Data morfologi dan pohon sintaksis tatabahasa Al-Quran.
* **[EveryAyah.com](https://everyayah.com)** — Rakaman bacaan audio ayat demi ayat berkualiti tinggi.
* **[Kompleks Percetakan Al-Quran Raja Fahd](https://qurancomplex.gov.sa/)** — Definisi susun atur halaman Mushaf Madinah 15 baris yang tulen.
* **Kementerian Agama Republik Indonesia** & **Ustaz Abdullah Muhammad Basmeih** — Edisi terjemahan rasmi.

---

## 📄 Lesen

Perisian ini diedarkan di bawah **[Lesen MIT](LICENSE)**.

Teks Al-Quran Bahasa Arab, terjemahan, data morfologi, dan bacaan audio kekal berada di bawah domain awam dan hak cipta ulama serta institusi penerbit masing-masing.
