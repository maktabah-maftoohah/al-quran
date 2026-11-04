---
name: quran-etl
description: Builds and validates Quranic Arabic, translations, morphology, and search index via scripts/extract_quran.py
---

# Quran ETL Pipeline (`quran-etl`)

This skill extracts, processes, and normalizes Quranic data into static JSON artifacts optimized for GitHub Pages static hosting.

## Execution Modes

### 1. Seed Mode (`--seed`)
Extracts full metadata for all 114 Surahs in `data/surahs.json` (marking seeded chapters with `seeded: true`), and generates complete chapter data for the initial seed suite:
- **Surah 1**: Al-Fatihah
- **Surah 112**: Al-Ikhlas
- **Surah 113**: Al-Falaq
- **Surah 114**: An-Nas

```bash
python scripts/extract_quran.py --seed
```

### 2. Complete Extraction (`--all`)
Extracts all 114 Surahs across Arabic editions (Uthmani & Simple Clean), translations (Malay Basmeih, English Sahih International, English Pickthall), word-by-word morphology, and compiles the global search index.

```bash
python scripts/extract_quran.py --all
```

## Generated Artifacts
- `data/surahs.json`: Master index of all 114 chapters.
- `data/arabic/{surah}.json`: Ayah-level Arabic texts (Uthmani + Simple).
- `data/morphology/{surah}.json`: Word-by-word gloss, transliteration, root, lemma, POS tags, and Corpus Quran links.
- `data/translations/ms/basmeih.json`: Bahasa Melayu translation by Abdullah Muhammad Basmeih.
- `data/translations/en/sahih.json`: English translation by Saheeh International.
- `data/translations/en/pickthall.json`: English translation by Mohammed Marmaduke Pickthall.
- `data/search-index.json`: Flat search index with normalized Arabic text and multilingual translations.

## Invariants & Validation
- Always uses `encoding="utf-8"` with `ensure_ascii=False`.
- Strips leading Basmalah from Ayah 1 on Surahs 2–114 (except Surah 9) in Uthmani text.
- Arabic search terms have diacritics removed and alifs normalized (`أ إ آ ٱ -> ا`).
