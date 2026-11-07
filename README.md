<p align="center">
  <img src="./assets/site-banner.png" alt="Banner Maktabah Maftoohah Al-Quran" width="100%">
</p>

# Maktabah Maftoohah — Al-Quran (المكتبة المفتوحة)

<p align="center">
  🇲🇾 <strong>Bahasa Melayu</strong> &nbsp;|&nbsp; <a href="README.en.md">🇬🇧 <strong>English Version</strong></a>
</p>

[![Aplikasi Web Langsung](https://img.shields.io/badge/Aplikasi%20Langsung-GitHub%20Pages-059669?style=for-the-badge&logo=github)](https://maktabah-maftoohah.github.io/al-quran/)
[![Versi Keluaran](https://img.shields.io/github/v/release/maktabah-maftoohah/al-quran?style=for-the-badge&color=2563eb)](https://github.com/maktabah-maftoohah/al-quran/releases)
[![Lesen: MIT](https://img.shields.io/badge/Lesen-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![PWA Siap Guna](https://img.shields.io/badge/PWA-Luar%20Talian-6366f1?style=for-the-badge)](manifest.webmanifest)
[![Seni Bina: Zero Build](https://img.shields.io/badge/Seni%20Bina-Zero--Build%20ES6-10b981?style=for-the-badge)](js/app.js)

**Maktabah Maftoohah Al-Quran** ialah aplikasi web kajian digital Al-Quran sumber terbuka, tanpa kompilasi (*zero-build*), dan sedia luar talian (*offline-first PWA*). Ia menyediakan persekitaran pembacaan dan tadabbur yang pantas serta bebas gangguan untuk membaca, mendengar, menghafal (tahfiz), dan meneliti Al-Quran secara mendalam melalui analisis morfologi kalimah demi kalimah, terjemahan pelbagai bahasa, tafsir, dan audio bacaan qari terkemuka.

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

### 🔬 Analisis Morfologi Kalimah demi Kalimah & Kajian Mendalam
* **Analisis Tahap Token**: Kad kalimah Arab interaktif yang memaparkan transliterasi sebutan Rumi, terjemahan harfiah Bahasa Melayu/Inggeris, label golongan kata (*POS tags*), lema, serta akar kata dasar (`الجذر`).
* **Laci Tatabahasa & Integrasi Korpus Al-Quran**: Huraian sintaksis dan tatabahasa lengkap bagi setiap kalimah dengan pautan terus ke [Maktabah Maftoohah Korpus Al-Quran](https://maktabah-maftoohah.github.io/korpus-quran/).
* **Tafsir al-Jalalayn & Ibn Kathir**: Integrasi ulasan tafsir muktabar secara terus dalam paparan kajian mendalam ayat (menampilkan Bahasa Melayu / Nusantara dan Bahasa Inggeris).
* **Asbabun Nuzul (Sebab Turun Wahyu)**: Konteks sejarah dan sebab penurunan wahyu bagi 657 ayat merentasi 85 surah, menggabungkan riwayat daripada *Kitab Asbab an-Nuzul* (Al-Wahidi), *Lubabun Nuqul* (As-Suyuthi), dan *Sahih Asbab an-Nuzul* (Ibrahim al-Ali) lengkap dengan matan hadis Arab, ulasan Bahasa Melayu, dan rujukan kitab.

### 🌍 Terjemahan Pelbagai Bahasa, Tulisan Jawi & Antara Muka Dwi-Bahasa
* **Antara Muka Dwi-Bahasa (MY / EN)**: Penyetempatan penuh dalam **Bahasa Melayu (Lalai)** dan **Bahasa Inggeris**, dengan penukaran pantas satu klik pada bar kepala dan panel tetapan.
* **Nama & Tajuk Surah Piawai Malaysia**: Dalam mod Bahasa Melayu, ejaan nama surah dan terjemahan mengikut piawaian rasmi Malaysia (contoh: *Al-Fatihah: Pembukaan, Al-Baqarah: Lembu Betina, Ali 'Imran: Keluarga Imran, An-Nisa': Wanita, dll.*).
* **Paparan Pintar Terjemahan Tunggal**: Menyembunyikan label nama terjemahan secara automatik apabila hanya satu terjemahan dipilih bagi memberikan pengalaman membaca yang tenang dan bersih.
* **5 Edisi Terjemahan & Tafsir Lengkap**:
  * 🇲🇾 **Bahasa Melayu (JAKIM - Lalai)** — *Tafsir Pimpinan Ar-Rahman* (Sheikh Abdullah Muhammad Basmeih / JAKIM)
  * 🇲🇾 **Tafsir al-Jalalayn** — Tafsir Klasik Bahasa Melayu / Nusantara (Jalaluddin al-Mahalli & Jalaluddin as-Suyuti)
  * 🇬🇧 **Bahasa Inggeris** — Saheeh International
  * 🇬🇧 **Bahasa Inggeris (Sastera)** — Muhammad Marmaduke Pickthall
  * 🇮🇩 **Bahasa Indonesia** — Kementerian Agama Republik Indonesia (Kemenag)
* **Pemuatan Terjemahan Selektif**: Hanya memuat turun terjemahan yang sedang aktif untuk menjimatkan penggunaan kuota data internet.
* **Transliterasi Jawi Dinamik**: Penukar algoritma Rumi ke Jawi terbina (*tulisan Jawi*) untuk kemudahan pembaca rantau Melayu.

### 🎧 Enjin Audio Bacaan & Storan Luar Talian
* **Audio Berterusan & Ayat demi Ayat**: Pemain audio melekat (*sticky audio player*) di bahagian bawah dengan tatalan dan peralihan ayat automatik.
* **Qari Terkemuka Dunia**:
  * Mishary Rashid Alafasy
  * Abu Bakr Al-Shatri
  * Abdul Basit Murattal
* **Sebutan Setiap Perkataan**: Tekan mana-mana kalimah dalam paparan kajian mendalam untuk mendengar sebutan audio khusus bagi kalimah tersebut.
* **Storan Audio Luar Talian**: Muat turun pakej audio surah penuh terus ke dalam storan IndexedDB pelayar untuk didengari tanpa sambungan internet.

### 🧠 Mod Hafazan / Tahfiz (Hifz Mode)
* **Ujian Ingatan Aktif**: Aktifkan mod Hifz untuk mengaburkan teks Arab bagi menguji kekuatan hafazan anda.
* **Sentuh untuk Dedahkan (Tap-to-Reveal)**: Sentuh atau klik mana-mana ayat yang kabur untuk memaparkan teksnya bagi tujuan semakan segera.
* **Pengulangan Selang Masa**: Tetapkan bilangan ulangan ayat dan jeda masa untuk mengukuhkan ingatan hafazan.

### ⚡ Enjin Carian Web Worker Luar Benang
* **Web Worker Khas**: Carian pantas dijalankan di luar benang utama UI (*off-thread*), memastikan pelayar sentiasa lancar dan responsif merentasi kesemua 6,236 ayat.
* **Penormalan Teks Arab**: Membuang tanda baris (*tashkeel*), variasi hamzah, dan alif waslah secara pintar untuk ketepatan hasil carian.
* **Lompat Ayat Segera**: Taip `112:1`, `2:255`, atau nombor surah `36` untuk terus pergi ke surah atau ayat tersebut.

### 🎨 Penjana Kad Ayat Media Sosial
* **Eksport HTML5 Canvas**: Hasilkan kad ayat Al-Quran beresolusi tinggi yang indah dan kemas.
* **Pilihan Nisbah Dimensi**: Eksport dalam format **1:1 (Segi Empat Sama)** untuk suapan media sosial atau **9:16 (Story/Status)** untuk peranti mudah alih.
* **Perkongsian Web Asli**: Kongsi terus ke aplikasi mesej dan media sosial melalui Web Share API, salin imej ke papan keratan (*clipboard*), atau muat turun fail PNG.

### 📝 Nota Kajian Peribadi & Sandaran 1-Klik
* **Enjin Nota Kekal**: Tulis refleksi peribadi, catatan tadabbur, dan nota pengajian pada mana-mana ayat, disimpan secara selamat dalam IndexedDB tempatan peranti anda.
* **Eksport & Pulih Sandaran JSON 1-Klik**: Simpan semua penanda buku, nota peribadi, dan tetapan ke dalam fail sandaran JSON bertarikh dengan ciri pemulihan segera.
* **Bar Sisi Bebas Gangguan**: Sembunyi atau paparkan bar sisi menggunakan pintasan papan kekunci <kbd>[</kbd> atau butang bar tajuk.
* **API Kunci Bangun Skrin (Screen Wake Lock)**: Memastikan skrin peranti kekal menyala tanpa malap semasa anda membaca atau menghafal Al-Quran.

---

## ⌨️ Pintasan Papan Kekunci

| Pintasan | Tindakan |
| :--- | :--- |
| <kbd>/</kbd> | Buka Modal Carian & Lompat Ayat |
| <kbd>[</kbd> | Buka / Tutup Bar Sisi (Mod Pembacaan Tenang) |
| <kbd>Esc</kbd> | Tutup Modal, Laci, atau Popover |
| <kbd>Space</kbd> | Main / Jeda Audio Semasa |
| <kbd>Alt</kbd> + <kbd>→</kbd> | Ayat Seterusnya |
| <kbd>Alt</kbd> + <kbd>←</kbd> | Ayat Sebelumnya |

---

## 🔗 Format Pautan Terus & Penghala URL

Aplikasi ini menggunakan penghala berasaskan hash yang menyokong penandaan buku dan perkongsian pautan secara terus:

| Format URL | Destinasi |
| :--- | :--- |
| `/#1` atau `/#surah/1` | Buka Surah 1 (Al-Fatihah) |
| `/#6:12` atau `/#surah/6/12` | Lompat terus ke Surah 6 Ayat 12 dengan tatalan automatik dan sorotan |
| `/#ayah/1/1` | Buka paparan kajian mendalam (Deep-Dive) berserta analisis morfologi dan tafsir |
| `/#mushaf/1` | Buka paparan halaman Mushaf Madinah (halaman 1 hingga 604) |
| `/#search/iman` | Buka carian dengan kata kunci sedia diisi |

---

## 🏗️ Seni Bina Teknikal & Invarian Projek

Projek ini berpegang kepada prinsip reka bentuk yang ketat untuk ketahanan, kelajuan, dan kemudahan jangka panjang:

1. **Zero-Build Vanilla ES6**:
   * Modul ES6 asli (`import` / `export`) yang dijalankan terus oleh pelayar moden tanpa langkah kompilasi.
   * Bebas daripada pembungkus (*bundler*) seperti Webpack, Vite, Rollup, atau Babel.
   * Tiada sebarang pergantungan runtime npm.
2. **Keserasian Subpath Hosting**:
   * Semua permintaan aset dan data menggunakan laluan relatif (`./data/...`, `./css/...`, `./js/...`), memastikan aplikasi berfungsi sempurna di persekitaran subpath seperti GitHub Pages (`https://<organisasi>.github.io/<projek>/`).
3. **PWA Sedia Luar Talian (Service Worker v14)**:
   * Strategi *stale-while-revalidate* memberikan kelajuan pemuatan segera dari cache luar talian sambil menyelaraskan kemas kini latar belakang secara automatik dari GitHub.
4. **Seni Bina Storan Tempatan**:
   * **IndexedDB** (`maktabah_quran_db`): Menyimpan audio MP3 luar talian dan nota kajian peribadi.
   * **localStorage**: Menyimpan pilihan antaramuka, penanda buku, dan penanda bacaan terakhir.
   * **Cache Storage**: Menyimpan rangka aplikasi, helaian gaya (CSS), ikon, dan fail data JSON Al-Quran.
5. **Skema Data Ketat & Pengekodan UTF-8**:
   * Kesemua fail menggunakan format UTF-8 tanpa BOM.

---

## 📁 Struktur Direktori Repositori

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
│   │   └── ms/                      # Bahasa Melayu (basmeih.json, jalalayn.json)
│   ├── pages-meta.json              # Definisi 604 halaman Mushaf Madinah
│   ├── search-index.json            # Indeks carian seluruh 6,236 ayat
│   ├── surahs.json                  # Katalog 114 Surah dengan nama piawai rasmi
│   └── icon.svg                     # Ikon vektor aplikasi
├── js/
│   ├── app.js                       # Pengawal selia utama aplikasi
│   ├── audio.js                     # Enjin audio bacaan HTML5
│   ├── backup.js                    # Pengurus sandaran & pemulihan JSON 1-klik
│   ├── card-generator.js            # Penjana kad ayat HTML5 Canvas
│   ├── config.js                    # Konfigurasi aplikasi & pautan korpus
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
│   ├── test_release_qa.js           # Ujian utama Playwright QA (81 semakan)
│   ├── test_ui_comprehensive.js     # Ujian automatik UI & responsif (35 semakan)
│   ├── update_surah_names_ms.py     # Pengemas kini nama surah piawai Malaysia
│   ├── verify_data_integrity.py     # Pengesah integriti data & skema UTF-8
│   └── verify_project.py            # Pengesah invarian projek & laluan relatif
├── index.html                       # Titik masuk semantik HTML5
├── manifest.webmanifest             # Manifes Progressive Web App
├── sw.js                            # Service Worker PWA (v14)
├── AGENTS.md                        # Invarian projek untuk ejen kecerdasan buatan
├── CONTRIBUTING.md                  # Panduan sumbangan komuniti (Bahasa Melayu)
├── CONTRIBUTING.en.md               # Panduan sumbangan komuniti (Bahasa Inggeris)
├── LICENSE                          # Lesen MIT
├── package.json                     # Konfigurasi skrip ujian Playwright
├── README.md                        # Dokumentasi utama projek (Bahasa Melayu)
└── README.en.md                     # Dokumentasi projek (Bahasa Inggeris)
```

---

## 🚀 Pembangunan Tempatan

Disebabkan projek ini menggunakan seni bina *zero-build*, tiada langkah kompilasi atau *bundling* diperlukan. Anda hanya perlu melancarkan direktori ini dengan sebarang pelayan HTTP tempatan:

### Pilihan 1: Menggunakan Pelayan Pembangunan Terbina (Disyorkan)
```bash
# Melancarkan pelayan tempatan dengan mod tanpa-cache (no-cache):
python scripts/serve.py --port 8000
# atau:
npm run serve
```

### Pilihan 2: Menggunakan Pelayan Standard Python
```bash
python -m http.server 8080
```
Buka [http://localhost:8080](http://localhost:8080) pada pelayar web anda.

### Pilihan 3: Menggunakan Node.js
```bash
npx serve .
```

---

## 🧪 Pengujian & Pengesahan Kualiti

Projek ini dilengkapi dengan set suite ujian pengesahan automatik yang merangkumi integriti data, invarian seni bina, dan ujian aliran pelayar:

```bash
# 1. Sahkan Invarian Projek, Laluan Relatif & Skema
python scripts/verify_project.py

# 2. Sahkan Integriti Data Al-Quran (114 Surah, 6,236 Ayat, Skema & UTF-8)
python scripts/verify_data_integrity.py
# (Atau jalankan kedua-duanya sekali gus: npm run verify)

# 3. Jalankan Suite Ujian Utama QA Playwright (81 Semakan)
npm test
# atau: node scripts/test_release_qa.js

# 4. Jalankan Suite Ujian UI Komprehensif & Responsif (35 Semakan)
npm run test:ui
# atau: node scripts/test_ui_comprehensive.js

# 5. Jalankan Suite Ujian Mushaf Madinah Autentik (10 Semakan)
npm run test:mushaf
# atau: node scripts/test_mushaf_authentic.js
```

---

## 📚 Sumber Data & Penghargaan

Setinggi-tinggi penghargaan dirakamkan kepada komuniti sumber terbuka dan institusi keilmuan Islam yang menyediakan sumber rujukan bagi projek ini:

* **[Projek Tanzil](https://tanzil.net)** — Teks Uthmani Al-Quran dan transliterasi yang disemak rapi.
* **[Maktabah Maftoohah Korpus Al-Quran](https://maktabah-maftoohah.github.io/korpus-quran/)** — Korpus Al-Quran dan analisis morfologi.
* **[EveryAyah.com](https://everyayah.com)** — Rakaman audio bacaan ayat Al-Quran berkualiti tinggi.
* **[Kompleks Percetakan Al-Quran Raja Fahd Madinah](https://qurancomplex.gov.sa/)** — Piawaian susun atur halaman Mushaf Madinah 15 baris.
* **Kementerian Agama Republik Indonesia** & **Sheikh Abdullah Muhammad Basmeih / JAKIM** — Terjemahan rasmi Bahasa Melayu dan Nusantara.

---

## 📄 Lesen

Perisian ini dikeluarkan di bawah **[Lesen MIT](LICENSE)**.

Teks Al-Quran Bahasa Arab, terjemahan, data morfologi, dan audio bacaan kekal di bawah domain keilmuan dan hak cipta awam masing-masing.
