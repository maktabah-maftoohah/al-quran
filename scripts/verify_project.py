#!/usr/bin/env python3
"""
scripts/verify_project.py
Validates project integrity, relative URLs, schemas, and invariants.
"""
import json
import pathlib
import re
import sys

def main():
    root = pathlib.Path(__file__).resolve().parent.parent

    # 1. Check relative paths in HTML, CSS, JS
    violations = []
    for pattern in ["*.html", "css/*.css", "js/*.js"]:
        for p in root.glob(pattern):
            content = p.read_text(encoding="utf-8")
            # Look for absolute paths to /data, /css, /js
            matches = re.findall(r'["\'](/(?:data|css|js)/[^"\']*)["\']', content)
            if matches:
                violations.append((p.name, matches))

    if violations:
        print("[FAIL] Found absolute paths instead of relative paths:")
        for name, m in violations:
            print(f"  {name}: {m}")
        sys.exit(1)
    print("[PASS] Check 1: All paths in HTML, CSS, and JS are strictly relative.")

    # 2. Check AGENTS.md
    agents_file = root / "AGENTS.md"
    assert agents_file.exists(), "AGENTS.md missing"
    lines = agents_file.read_text(encoding="utf-8").splitlines()
    assert len(lines) < 45, f"AGENTS.md has {len(lines)} lines (must be < 45)"
    print(f"[PASS] Check 2: AGENTS.md verified ({len(lines)} lines < 45).")

    # 3. Check .nojekyll
    assert (root / ".nojekyll").exists(), ".nojekyll missing"
    print("[PASS] Check 3: .nojekyll verified.")

    # 4. Check SKILL.md
    skill_file = root / ".agents" / "skills" / "quran-etl" / "SKILL.md"
    assert skill_file.exists(), "SKILL.md missing"
    skill_content = skill_file.read_text(encoding="utf-8")
    assert "name: quran-etl" in skill_content, "Missing name in SKILL.md"
    assert "description:" in skill_content, "Missing description in SKILL.md"
    assert "--seed" in skill_content and "--all" in skill_content, "Missing options documentation"
    print("[PASS] Check 4: SKILL.md YAML frontmatter and documentation verified.")

    # 5. Check JSON Schemas
    with open(root / "data" / "surahs.json", encoding="utf-8") as f:
        surahs = json.load(f)
    assert len(surahs) == 114, f"Expected 114 surahs, got {len(surahs)}"
    first_s = surahs[0]
    for key in ["number", "name_arabic", "name_latin", "name_translation", "total_ayahs", "revelation_type", "seeded"]:
        assert key in first_s, f"Missing key {key} in surahs.json"
    print("[PASS] Check 5: data/surahs.json verified (114 surahs).")

    # 6. Check Arabic and Basmalah
    for s_num in [1, 112, 113, 114]:
        with open(root / "data" / "arabic" / f"{s_num}.json", encoding="utf-8") as f:
            ar_doc = json.load(f)
        assert ar_doc["surah"] == s_num
        assert "1" in ar_doc["ayahs"]
        assert "uthmani" in ar_doc["ayahs"]["1"]
        assert "simple" in ar_doc["ayahs"]["1"]

    # Verify Basmalah stripped on 112:1 but present on 1:1
    ar1 = json.load(open(root / "data" / "arabic" / "1.json", encoding="utf-8"))
    ar112 = json.load(open(root / "data" / "arabic" / "112.json", encoding="utf-8"))
    assert ar1["ayahs"]["1"]["uthmani"].startswith("بِسْمِ ٱللَّهِ")
    assert not ar112["ayahs"]["1"]["uthmani"].startswith("بِسْمِ ٱللَّهِ")
    assert "قُلْ هُوَ ٱللَّهُ أَحَدٌ" in ar112["ayahs"]["1"]["uthmani"]
    print("[PASS] Check 6: Arabic Uthmani text and Basmalah rules verified.")

    # 7. Check Morphology
    for s_num in [1, 112, 113, 114]:
        with open(root / "data" / "morphology" / f"{s_num}.json", encoding="utf-8") as f:
            mo_doc = json.load(f)
        assert mo_doc["surah"] == s_num
        assert "1" in mo_doc["ayahs"]
        tokens = mo_doc["ayahs"]["1"]
        assert len(tokens) > 0
        for tok in tokens:
            for field in ["pos", "ar", "tr", "en", "root", "lemma", "pos_tag", "corpus_url"]:
                assert field in tok, f"Missing {field} in token {tok}"
    print("[PASS] Check 7: Morphology tokens and schemas verified.")

    # 8. Check Translations
    for subpath in ["ms/basmeih.json", "en/sahih.json", "en/pickthall.json"]:
        with open(root / "data" / "translations" / subpath, encoding="utf-8") as f:
            t_doc = json.load(f)
        for s_str in ["1", "112", "113", "114"]:
            assert s_str in t_doc, f"Missing surah {s_str} in translations/{subpath}"
    print("[PASS] Check 8: Translations verified across Malay and English.")

    # 9. Check Search Index
    with open(root / "data" / "search-index.json", encoding="utf-8") as f:
        s_idx = json.load(f)
    assert len(s_idx) in (22, 6236), f"Expected 22 or 6236 search entries, got {len(s_idx)}"
    for item in s_idx:
        assert all(k in item for k in ["ref", "s", "a", "ar", "ms", "en"])
    print(f"[PASS] Check 9: Search index verified ({len(s_idx)} verses).")

    # 10. Check GitHub Actions Workflow
    wf = root / ".github" / "workflows" / "deploy.yml"
    assert wf.exists()
    wf_text = wf.read_text(encoding="utf-8")
    assert "actions/cache@v4" in wf_text
    assert "scripts/extract_quran.py --all" in wf_text
    assert "actions/deploy-pages@v4" in wf_text
    print("[PASS] Check 10: GitHub Pages deploy workflow verified.")

    # 11. Check PWA, Advanced Modules & Nusantara Translation
    assert (root / "manifest.webmanifest").exists(), "manifest.webmanifest missing"
    assert (root / "sw.js").exists(), "sw.js missing"
    assert (root / "data" / "icon.svg").exists(), "icon.svg missing"
    assert (root / "data" / "pages-meta.json").exists(), "pages-meta.json missing"
    assert (root / "data" / "translations" / "id" / "kemenag.json").exists(), "kemenag.json missing"
    assert (root / "js" / "jawi.js").exists(), "jawi.js missing"
    assert (root / "js" / "card-generator.js").exists(), "card-generator.js missing"
    assert (root / "js" / "mushaf.js").exists(), "mushaf.js missing"
    assert (root / "data" / "asbabun-nuzul.json").exists(), "asbabun-nuzul.json missing"
    print("[PASS] Check 11: PWA manifest, service worker, Jawi, Mushaf, Asbabun Nuzul, and Indonesian translation verified.")

    print("\n>>> ALL 11 COMPREHENSIVE VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<")


if __name__ == "__main__":
    main()
