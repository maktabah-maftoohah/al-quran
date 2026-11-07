#!/usr/bin/env python3
"""
scripts/generate_harfiah_translation.py

Generates a clean, literal translation dataset based on the core text of JAKIM /
Sheikh Abdullah Muhammad Basmeih (Tafsir Pimpinan Ar-Rahman) with interpolations,
tafsir, and commentary brackets strictly removed.

Target: data/translations/ms/basmeih-harfiah.json
"""
import json
import re
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
BASMEIH_FILE = ROOT_DIR / "data" / "translations" / "ms" / "basmeih.json"
OUTPUT_FILE = ROOT_DIR / "data" / "translations" / "ms" / "basmeih-harfiah.json"

# Essential pronouns / grammatical repairs where Basmeih bracketed
# an intrinsic Arabic pronoun (dhamir / nahu) that is required in Malay.
PRONOUN_FIXES = [
    # 112:1 Qul Huwa Allahu Ahad -> Katakanlah: "Dialah Allah Yang Maha Esa;
    (r'\"\(Tuhanku\)\s*ialah\s*Allah', '"Dialah Allah'),
    (r'\(Tuhanku\)\s*ialah\s*Allah', 'Dialah Allah'),
    (r'\((Dia|Ia|Mereka|Kami|Engkau|Beliau)\)', r'\1'),
    (r'\((dia|ia|mereka|kami|engkau|beliau)\)', r'\1'),
]

def clean_ayah_text(text: str) -> str:
    cleaned = text

    # 1. Apply core pronoun restorations
    for pattern, repl in PRONOUN_FIXES:
        cleaned = re.sub(pattern, repl, cleaned)

    # 2. Iteratively remove balanced bracketed clauses (tafsir, asbabun nuzul, vocatives)
    while True:
        subbed = re.sub(r'\s*\([^()]*\)', '', cleaned)
        if subbed == cleaned:
            break
        cleaned = subbed

    # 3. Strip any stray unpaired bracket characters from source transcription typos
    cleaned = cleaned.replace('(', '').replace(')', '')

    # 4. Normalize punctuation artifacts
    cleaned = re.sub(r'\"\,\s*', '"', cleaned)
    cleaned = re.sub(r'\"\,\s*', '"', cleaned)
    cleaned = re.sub(r':\s*,\s*', ': ', cleaned)
    cleaned = re.sub(r':\s*;\s*', ': ', cleaned)
    cleaned = re.sub(r'^\s*[,;:\-]\s*', '', cleaned)
    cleaned = re.sub(r'\"\s*[,;:\-]\s*', '"', cleaned)
    cleaned = re.sub(r'\s*,\s*,+', ',', cleaned)
    cleaned = re.sub(r'\s*;\s*;+', ';', cleaned)
    cleaned = re.sub(r'\s*-\s*$', '', cleaned)
    cleaned = re.sub(r'\s+([,.;:!?])', r'\1', cleaned)
    cleaned = re.sub(r'[ \t]{2,}', ' ', cleaned)
    cleaned = cleaned.strip()

    # 5. Capitalize first letter if stripped bracket was at the start
    if cleaned and cleaned[0].islower():
        cleaned = cleaned[0].upper() + cleaned[1:]
    elif len(cleaned) > 1 and cleaned[0] == '"' and cleaned[1].islower():
        cleaned = '"' + cleaned[1].upper() + cleaned[2:]

    return cleaned

def generate_all():
    print(f"Reading master Basmeih translation from: {BASMEIH_FILE}")
    with open(BASMEIH_FILE, "r", encoding="utf-8") as f:
        basmeih_data = json.load(f)

    harfiah_data = {}
    total_ayahs = 0
    empty_ayahs = []

    for surah_str, ayahs in basmeih_data.items():
        harfiah_data[surah_str] = {}
        for ayah_str, text in ayahs.items():
            total_ayahs += 1
            cleaned = clean_ayah_text(text)
            if not cleaned:
                empty_ayahs.append((surah_str, ayah_str, text))
            harfiah_data[surah_str][ayah_str] = cleaned

    print(f"Processed {total_ayahs} ayahs across {len(harfiah_data)} surahs.")
    if empty_ayahs:
        raise ValueError(f"Found {len(empty_ayahs)} empty ayahs: {empty_ayahs}")

    # Ensure target directory exists
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    # Write output strictly in UTF-8 without BOM, ensure_ascii=False, indent 2
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(harfiah_data, f, ensure_ascii=False, indent=2)

    print(f"[PASS] Successfully generated: {OUTPUT_FILE}")
    return True

if __name__ == "__main__":
    generate_all()
