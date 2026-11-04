#!/usr/bin/env python3
"""
scripts/extract_quran.py
Quran ETL Pipeline for Maktabah Maftoohah 'al-quran'
Builds and validates Quranic Arabic, translations, morphology, and search index.
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
ARABIC_DIR = DATA_DIR / "arabic"
MORPHOLOGY_DIR = DATA_DIR / "morphology"
TRANSLATIONS_MS_DIR = DATA_DIR / "translations" / "ms"
TRANSLATIONS_EN_DIR = DATA_DIR / "translations" / "en"
TRANSLATIONS_ID_DIR = DATA_DIR / "translations" / "id"

SEED_SURAHS = [1, 112, 113, 114]
TOTAL_SURAHS = 114

USER_AGENT = "MaktabahMaftoohah-QuranBot/1.0 (+https://github.com/maktabah-maftoohah/al-quran)"
MORPHOLOGY_URL = "https://raw.githubusercontent.com/mustafa0x/quran-morphology/master/quran-morphology.txt"


def fetch_url(url: str, retries: int = 5, backoff: float = 2.0) -> bytes:
    """Fetch URL with exponential backoff and retry."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=25) as resp:
                return resp.read()
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
            if attempt == retries:
                raise RuntimeError(f"Failed to fetch {url} after {retries} attempts: {e}")
            wait_time = backoff * (2 ** (attempt - 1))
            print(f"  [Retry {attempt}/{retries}] {url} failed ({e}), retrying in {wait_time:.1f}s...")
            time.sleep(wait_time)
    raise RuntimeError(f"Unexpected termination fetching {url}")


def fetch_json(url: str, retries: int = 5) -> dict:
    raw = fetch_url(url, retries=retries)
    return json.loads(raw.decode("utf-8"))


def normalize_arabic(text: str) -> str:
    """Strip diacritics / tashkeel and normalize alifs for search matching."""
    text = text.replace("\ufeff", "").strip()
    # Strip tashkeel / diacritics
    text = re.sub(r"[\u064B-\u065F\u0670\u06D6-\u06ED]", "", text)
    # Normalize alifs: أ, إ, آ, ٱ -> ا
    text = re.sub(r"[أإآٱ]", "ا", text)
    # Remove extra spaces
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def strip_leading_basmalah(text: str, is_uthmani: bool = True) -> str:
    """Strip leading Basmalah from Ayah 1 on Surahs 2-114 (except Surah 9)."""
    text = text.replace("\ufeff", "").strip()
    if is_uthmani:
        # Match standard Uthmani Basmalah
        pattern = r"^(?:بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ|بِّسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ)\s*"
    else:
        # Match clean simple Basmalah
        pattern = r"^(?:بسم الله الرحمن الرحيم)\s*"
    return re.sub(pattern, "", text).strip()


def load_morphology_cache(target_surahs: set[int]) -> dict:
    """
    Download and parse Corpus Quran morphology dataset from mustafa0x/quran-morphology.
    Returns map of (surah, ayah, word_pos) -> {root, lemma, pos_tag}
    """
    cache_file = BASE_DIR / "scripts" / ".quran-morphology.cache.txt"
    if cache_file.exists():
        print(f"Loading cached morphology data from {cache_file}...")
        raw_lines = cache_file.read_text(encoding="utf-8").splitlines()
    else:
        print(f"Fetching morphology dataset from {MORPHOLOGY_URL}...")
        try:
            raw_bytes = fetch_url(MORPHOLOGY_URL, retries=3, backoff=2.0)
            cache_file.write_bytes(raw_bytes)
            raw_lines = raw_bytes.decode("utf-8").splitlines()
        except Exception as e:
            print(f"  [Warning] Could not fetch morphology text dataset: {e}. Falling back to API parser.")
            return {}

    morph_map = {}
    for line in raw_lines:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) < 4:
            continue
        loc, _, tag, features = parts[0], parts[1], parts[2], parts[3]
        loc_parts = loc.split(":")
        if len(loc_parts) != 4:
            continue
        try:
            s = int(loc_parts[0])
            a = int(loc_parts[1])
            w = int(loc_parts[2])
        except ValueError:
            continue

        if s not in target_surahs:
            continue

        key = (s, a, w)
        if key not in morph_map:
            morph_map[key] = {
                "tags": [],
                "root": "",
                "lemma": "",
            }

        morph_map[key]["tags"].append(tag)
        feats = features.split("|")
        has_root = False
        seg_root = ""
        seg_lem = ""
        for f in feats:
            if f.startswith("ROOT:"):
                seg_root = " ".join(list(f[5:]))
                has_root = True
            elif f.startswith("LEM:"):
                seg_lem = f[4:]

        if seg_root and not morph_map[key]["root"]:
            morph_map[key]["root"] = seg_root
        if has_root and seg_lem:
            # Prioritize stem lemma over grammatical affix prefix
            morph_map[key]["lemma"] = seg_lem
        elif seg_lem and not morph_map[key]["lemma"]:
            morph_map[key]["lemma"] = seg_lem

    print(f"Morphology index loaded for {len(morph_map)} word tokens.")
    return morph_map


def ensure_directories():
    for d in [DATA_DIR, ARABIC_DIR, MORPHOLOGY_DIR, TRANSLATIONS_MS_DIR, TRANSLATIONS_EN_DIR, TRANSLATIONS_ID_DIR]:
        d.mkdir(parents=True, exist_ok=True)


def main():
    parser = argparse.ArgumentParser(description="Quran ETL Pipeline for Maktabah Maftoohah")
    parser.add_argument("--seed", action="store_true", help="Extract seed Surahs (1, 112, 113, 114)")
    parser.add_argument("--all", action="store_true", help="Extract all 114 Surahs")
    args = parser.parse_args()

    if not args.seed and not args.all:
        print("Please specify either --seed or --all")
        sys.exit(1)

    ensure_directories()
    target_surahs = set(range(1, TOTAL_SURAHS + 1)) if args.all else set(SEED_SURAHS)
    mode_name = "ALL (1-114)" if args.all else f"SEED {SEED_SURAHS}"
    print(f"Starting Quran ETL Pipeline in {mode_name} mode...")

    # 1. Fetch Surah master metadata
    print("Fetching Surah metadata index...")
    surahs_api_url = "https://api.alquran.cloud/v1/surah"
    surahs_raw = fetch_json(surahs_api_url)
    surahs_meta = []
    for item in surahs_raw.get("data", []):
        s_num = item["number"]
        clean_ar_name = re.sub(r"^سُورَةُ?\s*", "", item["name"]).replace("\ufeff", "").strip()
        surahs_meta.append({
            "number": s_num,
            "name_arabic": clean_ar_name,
            "name_latin": item["englishName"],
            "name_translation": item["englishNameTranslation"],
            "total_ayahs": item["numberOfAyahs"],
            "revelation_type": item["revelationType"],
            "seeded": (s_num in target_surahs),
        })

    surahs_file = DATA_DIR / "surahs.json"
    with open(surahs_file, "w", encoding="utf-8") as f:
        json.dump(surahs_meta, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(surahs_meta)} surahs to {surahs_file}")

    # 2. Load morphology dictionary for target surahs
    morph_data = load_morphology_cache(target_surahs)

    # 3. Fetch Pages & Juz metadata index
    print("Fetching Pages & Juz metadata index...")
    try:
        meta_raw = fetch_json("https://api.alquran.cloud/v1/meta")
        pages_references = meta_raw.get("data", {}).get("pages", {}).get("references", [])
        juzs_references = meta_raw.get("data", {}).get("juzs", {}).get("references", [])
        pages_file = DATA_DIR / "pages-meta.json"
        with open(pages_file, "w", encoding="utf-8") as f:
            json.dump({
                "pages": pages_references,
                "juzs": juzs_references
            }, f, ensure_ascii=False, indent=2)
        print(f"Saved {len(pages_references)} page references to {pages_file}")
    except Exception as e:
        print(f"  [Warning] Failed to fetch pages meta: {e}")

    # Prepare containers for translations and search index
    ms_basmeih = {}
    en_sahih = {}
    en_pickthall = {}
    id_kemenag = {}
    search_index = []

    # If partial runs already exist, preserve existing translations
    for filepath, container in [
        (TRANSLATIONS_MS_DIR / "basmeih.json", ms_basmeih),
        (TRANSLATIONS_EN_DIR / "sahih.json", en_sahih),
        (TRANSLATIONS_EN_DIR / "pickthall.json", en_pickthall),
        (TRANSLATIONS_ID_DIR / "kemenag.json", id_kemenag),
    ]:
        if filepath.exists():
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    container.update(json.load(f))
            except Exception:
                pass

    sorted_surahs = sorted(list(target_surahs))
    total_to_process = len(sorted_surahs)

    for idx, s_num in enumerate(sorted_surahs, 1):
        print(f"[{idx}/{total_to_process}] Processing Surah {s_num}...")
        # Fetch Arabic (uthmani & simple-clean) and 4 translations in one call
        editions_url = (
            f"https://api.alquran.cloud/v1/surah/{s_num}/editions/"
            "quran-uthmani,quran-simple-clean,ms.basmeih,en.sahih,en.pickthall,id.indonesian"
        )
        editions_resp = fetch_json(editions_url)
        editions_data = {ed["edition"]["identifier"]: ed["ayahs"] for ed in editions_resp.get("data", [])}

        uthmani_ayahs = editions_data.get("quran-uthmani", [])
        simple_ayahs = editions_data.get("quran-simple-clean", [])
        ms_ayahs = editions_data.get("ms.basmeih", [])
        sahih_ayahs = editions_data.get("en.sahih", [])
        pickthall_ayahs = editions_data.get("en.pickthall", [])
        id_ayahs = editions_data.get("id.indonesian", [])

        # Build Arabic chapter file
        arabic_doc = {"surah": s_num, "ayahs": {}}
        s_str = str(s_num)
        ms_basmeih[s_str] = {}
        en_sahih[s_str] = {}
        en_pickthall[s_str] = {}
        id_kemenag[s_str] = {}

        for i, a_obj in enumerate(uthmani_ayahs):
            a_num = a_obj["numberInSurah"]
            a_str = str(a_num)
            raw_uthmani = a_obj["text"].replace("\ufeff", "").strip()
            raw_simple = simple_ayahs[i]["text"].replace("\ufeff", "").strip() if i < len(simple_ayahs) else ""

            # Strip leading Basmalah for Ayah 1 on Surahs 2-114 (except Surah 9)
            if s_num != 1 and s_num != 9 and a_num == 1:
                clean_uthmani = strip_leading_basmalah(raw_uthmani, is_uthmani=True)
                clean_simple = strip_leading_basmalah(raw_simple, is_uthmani=False)
            else:
                clean_uthmani = raw_uthmani
                clean_simple = raw_simple

            arabic_doc["ayahs"][a_str] = {
                "uthmani": clean_uthmani,
                "simple": clean_simple,
                "page": a_obj.get("page", 1),
                "juz": a_obj.get("juz", 1),
            }

            # Translations
            ms_text = ms_ayahs[i]["text"].replace("\ufeff", "").strip() if i < len(ms_ayahs) else ""
            sahih_text = sahih_ayahs[i]["text"].replace("\ufeff", "").strip() if i < len(sahih_ayahs) else ""
            pickthall_text = pickthall_ayahs[i]["text"].replace("\ufeff", "").strip() if i < len(pickthall_ayahs) else ""
            id_text = id_ayahs[i]["text"].replace("\ufeff", "").strip() if i < len(id_ayahs) else ""

            ms_basmeih[s_str][a_str] = ms_text
            en_sahih[s_str][a_str] = sahih_text
            en_pickthall[s_str][a_str] = pickthall_text
            id_kemenag[s_str][a_str] = id_text

            # Search Index item
            search_index.append({
                "ref": f"{s_num}:{a_num}",
                "s": s_num,
                "a": a_num,
                "ar": normalize_arabic(clean_simple or clean_uthmani),
                "ms": ms_text,
                "en": sahih_text,
                "id": id_text,
            })

        arabic_file = ARABIC_DIR / f"{s_num}.json"
        with open(arabic_file, "w", encoding="utf-8") as f:
            json.dump(arabic_doc, f, ensure_ascii=False, indent=2)

        # 3. Fetch word-by-word morphology from Quran.com API v4
        quran_com_url = (
            f"https://api.quran.com/api/v4/verses/by_chapter/{s_num}?"
            "language=en&words=true&per_page=300&word_fields=text_uthmani,location"
        )
        quran_com_resp = fetch_json(quran_com_url)
        morph_doc = {"surah": s_num, "ayahs": {}}

        for v in quran_com_resp.get("verses", []):
            verse_num = v.get("verse_number")
            v_str = str(verse_num)
            tokens = []
            word_counter = 1

            for w in v.get("words", []):
                if w.get("char_type_name") != "word":
                    continue

                pos = word_counter
                word_counter += 1
                ar_text = w.get("text_uthmani") or w.get("text") or ""
                tr_text = (w.get("transliteration") or {}).get("text") or ""
                en_text = (w.get("translation") or {}).get("text") or ""

                # Morphology enrichment
                morph_info = morph_data.get((s_num, verse_num, pos), {})
                root = morph_info.get("root", "")
                lemma = morph_info.get("lemma", "")
                pos_tag = "+".join(morph_info.get("tags", [])) or "N"
                corpus_url = f"https://corpus.quran.com/wordmorphology.jsp?location=({s_num}:{verse_num}:{pos})"

                tokens.append({
                    "pos": pos,
                    "ar": ar_text,
                    "tr": tr_text,
                    "en": en_text,
                    "root": root,
                    "lemma": lemma,
                    "pos_tag": pos_tag,
                    "corpus_url": corpus_url,
                })

            morph_doc["ayahs"][v_str] = tokens

        morph_file = MORPHOLOGY_DIR / f"{s_num}.json"
        with open(morph_file, "w", encoding="utf-8") as f:
            json.dump(morph_doc, f, ensure_ascii=False, indent=2)

    # 4. Save Translations
    print("Writing translation dictionaries...")
    with open(TRANSLATIONS_MS_DIR / "basmeih.json", "w", encoding="utf-8") as f:
        json.dump(ms_basmeih, f, ensure_ascii=False, indent=2)
    with open(TRANSLATIONS_EN_DIR / "sahih.json", "w", encoding="utf-8") as f:
        json.dump(en_sahih, f, ensure_ascii=False, indent=2)
    with open(TRANSLATIONS_EN_DIR / "pickthall.json", "w", encoding="utf-8") as f:
        json.dump(en_pickthall, f, ensure_ascii=False, indent=2)
    with open(TRANSLATIONS_ID_DIR / "kemenag.json", "w", encoding="utf-8") as f:
        json.dump(id_kemenag, f, ensure_ascii=False, indent=2)

    # 5. Save Search Index
    print(f"Writing search index with {len(search_index)} indexed verses...")
    with open(DATA_DIR / "search-index.json", "w", encoding="utf-8") as f:
        json.dump(search_index, f, ensure_ascii=False, indent=2)

    print("Quran ETL Pipeline completed successfully!")


if __name__ == "__main__":
    main()
