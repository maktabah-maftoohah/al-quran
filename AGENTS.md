# Project Invariants: Maktabah Maftoohah Al-Quran

## Core Architectural Invariants
1. **GitHub Pages Subpath Compatibility**:
   - All network requests for assets and data MUST use relative paths (e.g., `./data/...`, `./css/...`, `./js/...`).
   - Absolute root paths (e.g. `/data/...`) break under subpath hosting (`https://maktabah-maftoohah.github.io/al-quran/`).

2. **Encoding & File Standards**:
   - All text files (JSON, JS, CSS, HTML, MD, PY) MUST strictly use UTF-8 encoding without BOM.
   - Python output operations MUST specify `encoding="utf-8"` and `ensure_ascii=False`.

3. **Zero-Build ES6 Architecture**:
   - Modern browser vanilla ES6 modules (`import` / `export`) only.
   - Zero compilation, bundling, or external npm runtime dependencies.
   - Entry point loaded via `<script type="module" src="./js/app.js"></script>`.

4. **Strict JSON Schemas**:
   - `data/surahs.json`: Master catalogue of 114 surah metadata objects with `seeded` flag.
   - `data/arabic/{n}.json`: Uthmani and simple clean text keyed by ayah number string.
   - `data/morphology/{n}.json`: Word-by-word token array per ayah with transliteration, gloss, root, lemma, POS, and corpus link.
   - `data/translations/{lang}/{edition}.json`: Text keyed by surah and ayah strings (`ms/basmeih`, `ms/jalalayn`, `en/sahih`, `en/pickthall`, `id/kemenag`).
   - `data/search-index.json`: Flat array of searchable tokens with normalized Arabic and multilingual translations.
   - `data/pages-meta.json`: 604 Madinah Mushaf page definitions.

5. **Verification & Testing Commands**:
   - Project & Data Integrity: `python scripts/verify_project.py` && `python scripts/verify_data_integrity.py`.
   - Browser QA & E2E Suites: `npm test` (`node scripts/test_release_qa.js`) and `node scripts/test_ui_comprehensive.js`.
   - Dev Server: `python scripts/serve.py --port 8000` (or `npm run serve`).
