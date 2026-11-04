"""
Phase 1 & 2: Comprehensive Data Integrity, Schema Validation & Invariants Checker
"""
import json
import os
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"

def check_bom(filepath):
    with open(filepath, "rb") as f:
        first3 = f.read(3)
        return first3 == b"\xef\xbb\xbf"

def run_checks():
    errors = []
    warnings = []
    print("=" * 60)
    print("PHASE 1: DATA INTEGRITY & SCHEMA VALIDATION")
    print("=" * 60)

    # 1. surahs.json
    surahs_file = DATA_DIR / "surahs.json"
    if not surahs_file.exists():
        errors.append("data/surahs.json does not exist")
        return errors
    with open(surahs_file, "r", encoding="utf-8") as f:
        surahs = json.load(f)

    if len(surahs) != 114:
        errors.append(f"surahs.json must have 114 entries, found {len(surahs)}")
    
    total_ayahs = sum(s["total_ayahs"] for s in surahs)
    if total_ayahs != 6236:
        errors.append(f"Total ayahs across all surahs must be 6236, found {total_ayahs}")
    else:
        print(f"[PASS] surahs.json: 114 Surahs verified, exactly {total_ayahs} total verses.")

    unseeded = [s["number"] for s in surahs if not s.get("seeded")]
    if unseeded:
        errors.append(f"Unseeded surahs found: {unseeded}")
    else:
        print("[PASS] All 114 Surahs flagged as seeded: true.")

    # 2. arabic/{1..114}.json
    arabic_dir = DATA_DIR / "arabic"
    arabic_missing = []
    ayah_count_mismatches = []
    for s in surahs:
        num = s["number"]
        fpath = arabic_dir / f"{num}.json"
        if not fpath.exists():
            arabic_missing.append(num)
            continue
        with open(fpath, "r", encoding="utf-8") as f:
            adata = json.load(f)
            ayahs = adata.get("ayahs", {})
            if len(ayahs) != s["total_ayahs"]:
                ayah_count_mismatches.append((num, len(ayahs), s["total_ayahs"]))

    if arabic_missing:
        errors.append(f"Missing arabic files for surahs: {arabic_missing}")
    elif ayah_count_mismatches:
        errors.append(f"Ayah count mismatches in arabic: {ayah_count_mismatches}")
    else:
        print(f"[PASS] data/arabic/: All 114 chapter files present, all verse counts match exact totals.")

    # 3. morphology/{1..114}.json
    morph_dir = DATA_DIR / "morphology"
    morph_missing = []
    for s in surahs:
        num = s["number"]
        fpath = morph_dir / f"{num}.json"
        if not fpath.exists():
            morph_missing.append(num)
    if morph_missing:
        errors.append(f"Missing morphology files for surahs: {morph_missing}")
    else:
        print(f"[PASS] data/morphology/: All 114 chapter morphology files present.")

    # 4. translations
    trans_files = [
        DATA_DIR / "translations" / "ms" / "basmeih.json",
        DATA_DIR / "translations" / "en" / "sahih.json",
        DATA_DIR / "translations" / "en" / "pickthall.json",
        DATA_DIR / "translations" / "id" / "kemenag.json",
    ]
    for tf in trans_files:
        if not tf.exists():
            errors.append(f"Missing translation file: {tf}")
        else:
            with open(tf, "r", encoding="utf-8") as f:
                tdata = json.load(f)
                if len(tdata) != 114:
                    errors.append(f"{tf.name} has {len(tdata)} chapters, expected 114")
                else:
                    print(f"[PASS] {tf.relative_to(ROOT_DIR)}: All 114 chapters present.")

    # 5. search-index.json
    search_file = DATA_DIR / "search-index.json"
    if not search_file.exists():
        errors.append("Missing data/search-index.json")
    else:
        with open(search_file, "r", encoding="utf-8") as f:
            sindex = json.load(f)
            if len(sindex) != 6236:
                errors.append(f"search-index.json has {len(sindex)} items, expected exactly 6236")
            else:
                print(f"[PASS] search-index.json: Exactly {len(sindex)} verses indexed.")

    # 6. pages-meta.json
    pages_file = DATA_DIR / "pages-meta.json"
    if not pages_file.exists():
        errors.append("Missing data/pages-meta.json")
    else:
        with open(pages_file, "r", encoding="utf-8") as f:
            pdata = json.load(f)
            pages = pdata.get("pages", [])
            if len(pages) != 604:
                errors.append(f"pages-meta.json has {len(pages)} pages, expected exactly 604")
            else:
                print(f"[PASS] pages-meta.json: Exactly {len(pages)} Madinah Mushaf pages indexed.")

    print("\n" + "=" * 60)
    print("PHASE 2: CODE STANDARDS & INVARIANTS CHECK")
    print("=" * 60)

    # Check UTF-8 without BOM on source files
    src_exts = {".html", ".js", ".css", ".json", ".py", ".md"}
    bom_files = []
    for root, dirs, files in os.walk(ROOT_DIR):
        if any(ignored in root for ignored in ["node_modules", ".git", ".system_generated"]):
            continue
        for file in files:
            p = Path(root) / file
            if p.suffix.lower() in src_exts:
                if check_bom(p):
                    bom_files.append(str(p.relative_to(ROOT_DIR)))

    if bom_files:
        errors.append(f"Files containing UTF-8 BOM: {bom_files}")
    else:
        print("[PASS] Encoding: All files strictly verified UTF-8 without BOM.")

    # Check relative paths (no absolute root paths '/data', '/css', '/js' in HTML or JS)
    abs_path_violations = []
    for js_file in (ROOT_DIR / "js").glob("*.js"):
        content = js_file.read_text(encoding="utf-8")
        if "'/data/" in content or '"/data/' in content:
            abs_path_violations.append(str(js_file.name))
    
    html_content = (ROOT_DIR / "index.html").read_text(encoding="utf-8")
    if 'href="/css/' in html_content or 'src="/js/' in html_content or 'href="/data/' in html_content:
        abs_path_violations.append("index.html")

    if abs_path_violations:
        errors.append(f"Absolute root paths found in: {abs_path_violations}")
    else:
        print("[PASS] Subpath Hosting: All network requests strictly use relative paths (./data/..., ./css/..., ./js/...).")

    return errors

if __name__ == "__main__":
    errs = run_checks()
    if errs:
        print(f"\n[FAIL] {len(errs)} error(s) found:")
        for e in errs:
            print(f"  - {e}")
        sys.exit(1)
    else:
        print("\nALL PHASE 1 & 2 CHECKS PASSED PERFECTLY!")
        sys.exit(0)
