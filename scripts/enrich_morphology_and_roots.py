#!/usr/bin/env python3
"""
scripts/enrich_morphology_and_roots.py
Enriches all 114 Surahs morphology datasets and roots index with:
- Tier 5 Advanced Sarf: Verb Form (I-XII), Aspect (Madhi/Mudhari'/Amr), Voice (Active/Passive), Mood, PGN, Derivation
- Tier 6 Syntax Roles: Syntactic particle classification and case markers
"""

import json
import re
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
AL_QURAN_DATA = BASE_DIR / "data"
KORPUS_DIR = BASE_DIR.parent / "korpus-quran"
KORPUS_DATA = KORPUS_DIR / "data"

CACHE_FILE = BASE_DIR / "scripts" / ".quran-morphology.cache.txt"
if not CACHE_FILE.exists():
    print(f"Error: Cache file not found: {CACHE_FILE}")
    sys.exit(1)

print("Loading raw morphology dataset from cache...")
lines = CACHE_FILE.read_text(encoding="utf-8").splitlines()
pgn_pat = re.compile(r"^(1[SP]|2[MF][SPD]|3[MF][SPD])$")
syntax_tags = {
    "CIRC", "COM", "COND", "CONJ", "DEM", "EMPH", "EQ", "EXH", "EXL", "EXP",
    "FUT", "INC", "INL", "INT", "INTG", "LOC", "NEG", "PREV", "PRO", "PRON",
    "PRP", "REL", "REM", "RES", "RET", "RSLT", "SUB", "SUR", "T", "VOC"
}

# Map: (surah, ayah, word) -> feature dict
features_by_token = {}

for line in lines:
    line = line.strip()
    if not line or line.startswith("#"):
        continue
    parts = line.split("\t")
    if len(parts) < 4:
        continue
    loc, seg_tag, feats = parts[0], parts[2], parts[3].split("|")
    loc_parts = loc.split(":")
    if len(loc_parts) != 4:
        continue
    try:
        s, a, w = int(loc_parts[0]), int(loc_parts[1]), int(loc_parts[2])
    except ValueError:
        continue

    key = (s, a, w)
    if key not in features_by_token:
        features_by_token[key] = {"tags": [], "feats": []}
    features_by_token[key]["tags"].append(seg_tag)
    features_by_token[key]["feats"].extend(feats)

print(f"Parsed features for {len(features_by_token)} tokens from cache.")

def extract_word_properties(data):
    tags, feats = data["tags"], data["feats"]
    vf = next((int(f[3:]) for f in feats if f.startswith("VF:")), None)
    asp = next((f for f in feats if f in ("PERF", "IMPF", "IMPV")), None)
    vox = "PASS" if "PASS" in feats else ("ACT" if "V" in tags else None)
    mood = next((f[5:] for f in feats if f.startswith("MOOD:")), None)
    case = next((f for f in feats if f in ("NOM", "ACC", "GEN")), None)
    pgn = next((f for f in feats if pgn_pat.match(f)), None)
    deriv = next((f for f in feats if f in ("ACT_PCPL", "PASS_PCPL", "VN")), None)
    notable_syntax = [f for f in feats if f in syntax_tags and f not in ("PRON", "CONJ")]
    syntax_role = notable_syntax[0] if notable_syntax else None

    props = {}
    if vf is not None:
        props["verb_form"] = vf
    if asp is not None:
        props["aspect"] = asp
    if vox is not None:
        props["voice"] = vox
    if mood is not None:
        props["mood"] = mood
    if case is not None:
        props["case"] = case
    if pgn is not None:
        props["pgn"] = pgn
    if deriv is not None:
        props["derivation"] = deriv
    if syntax_role is not None:
        props["syntax_role"] = syntax_role

    return props

print("\nEnriching morphology files across all 114 Surahs...")
for s in range(1, 115):
    f_path = AL_QURAN_DATA / "morphology" / f"{s}.json"
    if not f_path.exists():
        continue
    m_data = json.loads(f_path.read_text(encoding="utf-8"))
    ayahs = m_data.get("ayahs", {})
    for a_str, tokens in ayahs.items():
        a = int(a_str)
        for token in tokens:
            w = token.get("pos")
            raw_props = features_by_token.get((s, a, w))
            if raw_props:
                extra = extract_word_properties(raw_props)
                token.update(extra)

    # Save to al-quran
    f_path.write_text(json.dumps(m_data, ensure_ascii=False, indent=2), encoding="utf-8")
    
    # Save to korpus-quran if present
    k_path = KORPUS_DATA / "morphology" / f"{s}.json"
    if k_path.parent.exists():
        k_path.write_text(json.dumps(m_data, ensure_ascii=False, indent=2), encoding="utf-8")

print("All 114 morphology files successfully enriched!")

# Now rebuild roots.json and roots-index.json in korpus-quran
print("\nRebuilding roots and concordance index in korpus-quran...")
roots_collector = {}

for s in range(1, 115):
    f_path = KORPUS_DATA / "morphology" / f"{s}.json"
    if not f_path.exists():
        continue
    m_data = json.loads(f_path.read_text(encoding="utf-8"))
    ayahs = m_data.get("ayahs", {})
    for a_str, tokens in ayahs.items():
        a = int(a_str)
        for t in tokens:
            r = (t.get("root") or "").strip()
            if not r:
                continue
            clean_r = re.sub(r"\s+", "", r)
            norm_r = re.sub(r"[أإآٱ]", "ا", clean_r)

            if clean_r not in roots_collector:
                roots_collector[clean_r] = {
                    "root": r,
                    "root_clean": clean_r,
                    "root_norm": norm_r,
                    "count": 0,
                    "lemmas": set(),
                    "meanings_ms": set(),
                    "meanings_en": set(),
                    "verb_forms": set(),
                    "occurrences": []
                }

            rc = roots_collector[clean_r]
            rc["count"] += 1
            if t.get("lemma"):
                rc["lemmas"].add(t["lemma"])
            if t.get("ms"):
                rc["meanings_ms"].add(t["ms"])
            if t.get("en"):
                rc["meanings_en"].add(t["en"])
            if t.get("verb_form"):
                rc["verb_forms"].add(t["verb_form"])

            occ_rec = {
                "s": s,
                "a": a,
                "p": t.get("pos"),
                "ar": t.get("ar", ""),
                "tr": t.get("tr", ""),
                "lemma": t.get("lemma", ""),
                "ms": t.get("ms", "") or "",
                "en": t.get("en", "") or "",
                "pos_tag": t.get("pos_tag", "")
            }
            if t.get("verb_form"):
                occ_rec["vf"] = t["verb_form"]
            if t.get("aspect"):
                occ_rec["asp"] = t["aspect"]
            if t.get("voice"):
                occ_rec["vox"] = t["voice"]
            if t.get("mood"):
                occ_rec["mood"] = t["mood"]
            if t.get("case"):
                occ_rec["case"] = t["case"]
            if t.get("pgn"):
                occ_rec["pgn"] = t["pgn"]
            if t.get("derivation"):
                occ_rec["deriv"] = t["derivation"]
            if t.get("syntax_role"):
                occ_rec["syntax"] = t["syntax_role"]

            rc["occurrences"].append(occ_rec)

sorted_roots = sorted(roots_collector.values(), key=lambda x: -x["count"])

final_full_roots = []
final_roots_index = []

for r in sorted_roots:
    full_obj = {
        "root": r["root"],
        "root_clean": r["root_clean"],
        "root_norm": r["root_norm"],
        "count": r["count"],
        "lemmas": sorted(list(r["lemmas"])),
        "meanings_ms": sorted(list(r["meanings_ms"]))[:10],
        "meanings_en": sorted(list(r["meanings_en"]))[:10],
        "verb_forms": sorted(list(r["verb_forms"])),
        "occurrences": r["occurrences"]
    }
    final_full_roots.append(full_obj)

    idx_obj = {
        "root": r["root"],
        "root_clean": r["root_clean"],
        "root_norm": r["root_norm"],
        "count": r["count"],
        "lemmas": sorted(list(r["lemmas"]))[:5],
        "meanings_ms": sorted(list(r["meanings_ms"]))[:5],
        "meanings_en": sorted(list(r["meanings_en"]))[:5],
        "verb_forms": sorted(list(r["verb_forms"])),
        "sample": r["occurrences"][0] if r["occurrences"] else None
    }
    final_roots_index.append(idx_obj)

(KORPUS_DATA / "roots.json").write_text(
    json.dumps(final_full_roots, ensure_ascii=False, indent=None, separators=(',', ':')),
    encoding="utf-8"
)
(KORPUS_DATA / "roots-index.json").write_text(
    json.dumps(final_roots_index, ensure_ascii=False, indent=2),
    encoding="utf-8"
)

print(f"Successfully generated {len(final_full_roots)} roots with Tier 5/6 Sarf & Syntax properties!")
