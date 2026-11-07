# Panduan Menyumbang kepada Maktabah Maftoohah Al-Quran

<p align="center">
  🇲🇾 <strong>Bahasa Melayu</strong> &nbsp;|&nbsp; <a href="CONTRIBUTING.en.md">🇬🇧 <strong>English Version</strong></a>
</p>

Terima kasih atas minat anda untuk menyumbang kepada projek **Maktabah Maftoohah Al-Quran**! Kami mengalu-alukan sumbangan komuniti bagi mempertingkatkan ketepatan terjemahan, data morfologi, aksesibiliti antaramuka pengguna (UI), dan prestasi aplikasi.

---

## 🏛️ Invarian Seni Bina Projek

Sebelum membuat sebarang sumbangan kod, sila fahami dan patuhi invarian teras projek ini:

1. **Zero-Build Vanilla ES6**:
   * Kami tidak menggunakan sebarang pembungkus (*bundler* seperti Webpack, Vite, Rollup) atau pemproses kompilasi (*transpiler* seperti Babel, TypeScript).
   * Semua fail JavaScript mestilah menggunakan modul standard ES6 (`import` / `export`) yang dapat dijalankan secara langsung dalam pelayar moden.
   * Dilarang memperkenalkan sebarang kebergantungan runtime npm.

2. **Keserasian Subpath Hosting**:
   * Semua permintaan rangkaian untuk aset dan data **MESTI** menggunakan laluan relatif (contoh: `./data/...`, `./css/...`, `./js/...`).
   * Jangan sekali-kali menggunakan laluan mutlak (contoh: `/data/...`) kerana ia akan rosak apabila dihoskan di bawah subpath seperti `https://maktabah-maftoohah.github.io/al-quran/`.

3. **Pengekodan Ketat & Piawaian Fail**:
   * Semua fail (`.json`, `.js`, `.css`, `.html`, `.md`, `.py`) mesti menggunakan **UTF-8 tanpa BOM**.
   * Skrip Python yang menulis fail mesti menyatakan `encoding="utf-8"` dan `ensure_ascii=False`.

4. **Pengemaskinian Versi Service Worker**:
   * Apabila mengubah fail helaian gaya teras atau skrip JavaScript, jangan lupa untuk menaikkan versi `CACHE_NAME` dalam `sw.js` (contoh: `v14` $\rightarrow$ `v15`) agar cache luar talian diselaraskan secara bersih pada pelayar pengguna.

---

## 🛠️ Aliran Kerja Sumbangan (Contribution Workflow)

1. **Fork Repositori**: Cipta salinan peribadi (*fork*) di GitHub.
2. **Cipta Cawangan Ciri (Feature Branch)**:
   ```bash
   git checkout -b feature/penambahbaikan-saya
   ```
3. **Pembangunan Tempatan**:
   ```bash
   # Jalankan pelayan pembangunan tempatan dengan mod tanpa-cache:
   python scripts/serve.py --port 8000
   # atau
   npm run serve
   ```
4. **Lakukan Perubahan**: Pastikan kod kemas, berasingan (*modular*), dan disertakan ulasan yang jelas.
5. **Jalankan Suite Ujian & Pengesahan**:
   ```bash
   # 1. Sahkan Invarian Projek & Skema Data Al-Quran
   npm run verify
   # atau:
   python scripts/verify_project.py
   python scripts/verify_data_integrity.py

   # 2. Jalankan Ujian Komprehensif QA Pelayar (Playwright)
   npm test
   npm run test:ui
   ```
6. **Lakukan Komit**: Gunakan format mesej komit konvensional (*conventional commits*):
   ```bash
   git commit -m "feat(ui): tambah kawalan kelajuan audio bacaan"
   ```
7. **Hantar Permohonan Tarik (Pull Request)**: Terangkan perubahan yang dibuat, rasionalnya, dan sertakan bukti keputusan ujian yang lulus.

---

## 🐛 Melaporkan Pepijat & Cadangan

Sekiranya anda menemui pepijat, kesilapan paparan, atau ralat ejaan:
1. Semak senarai isu sedia ada di [GitHub Issues](https://github.com/maktabah-maftoohah/al-quran/issues) untuk memastikan ia belum dilaporkan.
2. Buka isu baharu dengan langkah penghasilan semula yang jelas, jenis pelayar/OS, dan tangkapan skrin jika berkaitan.

Semoga Allah SWT memberkati dan memberi ganjaran atas segala usaha anda dalam berkhidmat kepada Al-Quran dan masyarakat.
