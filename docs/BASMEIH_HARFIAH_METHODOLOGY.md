# Manhaj & Metodologi: Terjemahan Harfiah Berasaskan Teks Teras Basmeih (JAKIM)

## Pengenalan

Naskhah **Basmeih Harfiah (`basmeih-harfiah.json`)** ialah edisi terjemahan Bahasa Melayu yang diterbitkan terus daripada teks terjemahan rasmi Malaysia, ***Tafsir Pimpinan Ar-Rahman kepada Pengertian al-Quran*** (susunan Sheikh Abdullah Muhammad Basmeih, semakan Tan Sri Sheikh Abdul Kadir Talib / Jabatan Kemajuan Islam Malaysia - JAKIM).

Tujuan edisi ini adalah untuk menyediakan teks terjemahan lafaz asal (*terjemahan lafziyyah / harfiah*) yang **bebas daripada sebarang sisipan ulasan tafsir, asbabun nuzul, dan perkataan tambahan penterjemah** yang asalnya diletakkan di dalam tanda kurung `(...)`.

---

## Rasional & Nilai Akademik / Debat

Dalam perbincangan atau perdebatan dengan **golongan Quranist / anti-hadis** atau kelompok yang menolak tafsir tradisional, hujah yang sering dilontarkan terhadap terjemahan arus perdana ialah:
> *"Terjemahan ini telah dipinda oleh penterjemah; perkataan-perkataan dalam kurungan itu memasukkan pengaruh hadis atau pandangan peribadi penterjemah yang tiada dalam lafaz bahasa Arab."*

Dengan menapis keluar semua sisipan kurungan, edisi ini membolehkan pembaca:
1. Meneliti makna langsung lafaz ayat tanpa pertindihan tafsiran penterjemah.
2. Membidas tuduhan pindaan ayat (*verse alteration*) kerana setiap perkataan yang tinggal adalah perkataan teras yang diiktiraf oleh JAKIM.
3. Membandingkan secara langsung teks harfiah ini dengan korpus kata-demi-kata (*word-by-word morphology*) yang disediakan dalam aplikasi.

---

## Prinsip Pembersihan & Metodologi (*Manhaj*)

### 1. Pembuangan Ulasan Eksegetikal (*Tafsir & Huraian*)
Semua nota penerangan, penjelasan teologi, dan ulasan konteks yang diletakkan dalam kurungan dikeluarkan sepenuhnya:
* **Al-Baqarah 2:2**:
  * *Teks Penuh (Basmeih)*: `Kitab Al-Quran ini, tidak ada sebarang syak padanya (tentang datangnya dari Allah dan tentang sempurnanya); ia pula menjadi petunjuk bagi orang-orang yang (hendak) bertaqwa;`
  * *Teks Harfiah*: `Kitab Al-Quran ini, tidak ada sebarang syak padanya; ia pula menjadi petunjuk bagi orang-orang yang bertaqwa;`
* **Al-Baqarah 2:7**:
  * *Teks Penuh (Basmeih)*: `(Dengan sebab keingkaran mereka), Allah mematerikan atas hati mereka...`
  * *Teks Harfiah*: `Allah mematerikan atas hati mereka...`

### 2. Pengguguran Panggilan Tambahan (*Vocative Interpolations*)
Lafaz penyeru tambahan seperti `(wahai Muhammad)` (yang muncul 442 kali) atau `(Ya Allah)` yang tidak wujud secara leksikal dalam teks Arab digugurkan:
* **Al-Fatihah 1:5**:
  * *Teks Penuh*: `Engkaulah sahaja (Ya Allah) Yang Kami sembah...`
  * *Teks Harfiah*: `Engkaulah sahaja Yang Kami sembah...`
* **Al-Ikhlas 112:1**:
  * *Teks Penuh*: `Katakanlah (wahai Muhammad): "(Tuhanku) ialah Allah Yang Maha Esa;`
  * *Teks Harfiah*: `Katakanlah: "Dialah Allah Yang Maha Esa;`

### 3. Pemeliharaan Kata Ganti Diri Teras (*Dhamir & Nahu*)
Di beberapa ayat, penterjemah asal meletakkan kata ganti nama yang mewakili dhamir Arab (seperti *Huwa* atau *Nahnu*) di dalam kurungan. Untuk mengelakkan kecacatan struktur ayat Bahasa Melayu, dhamir hakiki ini dikekalkan:
* Contoh: `قُلْ هُوَ اللَّهُ أَحَدٌ` — Perkataan `هُوَ` (*Huwa* / Dia) yang asalnya diterjemah sebagai `(Tuhanku) ialah Allah` dibersihkan sebagai `"Dialah Allah Yang Maha Esa"` bagi memelihara nahu muktamad.

### 4. Pembetulan Ralat Tipografi Digital Sumber
Dalam fail digitasi asal `basmeih.json`, terdapat 72 ayat yang mempunyai tanda kurung yang tidak seimbang (*unbalanced brackets*) akibat kesilapan OCR/menaip lama. Algoritma penjana `scripts/generate_harfiah_translation.py` memulihkan dan menyeimbangkan tanda kurung ini sebelum proses pembersihan dijalankan.

---

## Integriti Fail

* **Laluan Fail**: `data/translations/ms/basmeih-harfiah.json`
* **Format**: JSON UTF-8 (tanpa BOM), `ensure_ascii=False`.
* **Kandungan**: 114 Surah, 6,236 Ayat lengkap, 0 ayat kosong.
* **Skrip Penjana**: `python scripts/generate_harfiah_translation.py`
