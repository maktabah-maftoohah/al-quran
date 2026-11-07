#!/usr/bin/env python3
"""
scripts/generate_og_pages.py
Generates lightweight static Open Graph preview & redirect stubs for all 114 Surahs
and all 6,236 Ayahs. Enables rich link unfurling on WhatsApp, Facebook, Telegram, Twitter,
and Discord while instantly redirecting human visitors into the SPA reading view.
"""

import html
import json
import shutil
import sys
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

def clean_og_pages():
    cleaned = 0
    for s_num in range(1, 115):
        s_dir = ROOT_DIR / str(s_num)
        if s_dir.exists() and s_dir.is_dir():
            shutil.rmtree(s_dir)
            cleaned += 1
    print(f"Cleaned {cleaned} generated surah directory trees.")

def main():
    if "--clean" in sys.argv:
        clean_og_pages()
        return

    start_time = time.time()
    surahs_file = ROOT_DIR / "data" / "surahs.json"
    basmeih_file = ROOT_DIR / "data" / "translations" / "ms" / "basmeih.json"
    sahih_file = ROOT_DIR / "data" / "translations" / "en" / "sahih.json"

    with open(surahs_file, "r", encoding="utf-8") as f:
        surahs = json.load(f)
    with open(basmeih_file, "r", encoding="utf-8") as f:
        basmeih = json.load(f)
    with open(sahih_file, "r", encoding="utf-8") as f:
        sahih = json.load(f)

    verse_count = 0
    surah_count = 0

    base_url = "https://maktabah-maftoohah.github.io/al-quran"
    banner_url = f"{base_url}/assets/og-banner.jpg"

    for s in surahs:
        s_num = s["number"]
        s_str = str(s_num)
        s_name_lat = s.get("name_ms") or s.get("name_latin")
        s_name_ar = s.get("name_arabic")
        total_ayahs = s["total_ayahs"]
        rev_type = s.get("revelation_type", "Makkiyah")

        # Load Arabic data for this surah
        ar_file = ROOT_DIR / "data" / "arabic" / f"{s_num}.json"
        ar_ayahs = {}
        if ar_file.exists():
            with open(ar_file, "r", encoding="utf-8") as f:
                ar_data = json.load(f)
                ar_ayahs = ar_data.get("ayahs", {})

        # 1. Generate Surah Level: /{s_num}/index.html
        surah_dir = ROOT_DIR / s_str
        surah_dir.mkdir(parents=True, exist_ok=True)
        surah_index = surah_dir / "index.html"

        surah_title = f"Surah {s_name_lat} ({s_num}) — Maktabah Maftoohah Al-Quran"
        surah_desc = f"Baca dan hayati Surah {s_name_lat} ({s_name_ar}) dengan {total_ayahs} ayat ({rev_type}), terjemahan Melayu & Inggeris, morfologi kata, dan audio penuh."
        surah_url = f"{base_url}/{s_num}"

        surah_html = f"""<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{html.escape(surah_title)}</title>

  <!-- Open Graph & Twitter Social Card Meta Tags -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Maktabah Maftoohah Al-Quran">
  <meta property="og:title" content="{html.escape(surah_title)}">
  <meta property="og:description" content="{html.escape(surah_desc)}">
  <meta property="og:image" content="{banner_url}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="{surah_url}">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{html.escape(surah_title)}">
  <meta name="twitter:description" content="{html.escape(surah_desc)}">
  <meta name="twitter:image" content="{banner_url}">

  <!-- Immediate Redirect for Human Visitors -->
  <meta http-equiv="refresh" content="0; url=../#surah/{s_num}">
  <script>
    (function() {{
      var p = window.location.pathname;
      var base = p.indexOf('/al-quran') === 0 ? '/al-quran/' : '/';
      window.location.replace(base + '#surah/{s_num}');
    }})();
  </script>
</head>
<body style="background: #0b0f19; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1.5rem; box-sizing: border-box;">
  <div style="max-width: 600px; text-align: center; background: #131b2e; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    <div style="font-size: 0.85rem; color: #10b981; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Maktabah Maftoohah Al-Quran</div>
    <h1 style="font-size: 1.5rem; color: #f8fafc; margin: 0 0 0.5rem 0;">Surah {html.escape(s_name_lat)} ({html.escape(s_name_ar)})</h1>
    <p style="font-size: 0.95rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1.5rem;">{html.escape(surah_desc)}</p>
    <a href="../#surah/{s_num}" style="display: inline-block; background: #10b981; color: #0b0f19; text-decoration: none; font-weight: 600; padding: 0.6rem 1.25rem; border-radius: 8px;">Buka Surah Penuh</a>
  </div>
</body>
</html>
"""
        surah_index.write_text(surah_html, encoding="utf-8")
        surah_count += 1

        # 2. Generate Verse Level: /{s_num}/{a_num}/index.html
        for a_num in range(1, total_ayahs + 1):
            a_str = str(a_num)
            ar_text = ar_ayahs.get(a_str, {}).get("uthmani", "")
            ms_text = basmeih.get(s_str, {}).get(a_str, "")
            en_text = sahih.get(s_str, {}).get(a_str, "")

            trans_snippet = ms_text or en_text or ""
            desc = f"{ar_text} — \"{trans_snippet}\"" if ar_text else trans_snippet
            if len(desc) > 290:
                desc = desc[:287] + "..."

            verse_title = f"Surah {s_name_lat} ({s_num}:{a_num}) — Al-Quran"
            verse_url = f"{base_url}/{s_num}/{a_num}"

            ayah_dir = surah_dir / a_str
            ayah_dir.mkdir(parents=True, exist_ok=True)
            ayah_index = ayah_dir / "index.html"

            ayah_html = f"""<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{html.escape(verse_title)}</title>

  <!-- Open Graph & Twitter Social Card Meta Tags -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Maktabah Maftoohah Al-Quran">
  <meta property="og:title" content="{html.escape(verse_title)}">
  <meta property="og:description" content="{html.escape(desc)}">
  <meta property="og:image" content="{banner_url}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="{verse_url}">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{html.escape(verse_title)}">
  <meta name="twitter:description" content="{html.escape(desc)}">
  <meta name="twitter:image" content="{banner_url}">

  <!-- Immediate Redirect for Human Visitors -->
  <meta http-equiv="refresh" content="0; url=../../#{s_num}:{a_num}">
  <script>
    (function() {{
      var p = window.location.pathname;
      var base = p.indexOf('/al-quran') === 0 ? '/al-quran/' : '/';
      window.location.replace(base + '#{s_num}:{a_num}');
    }})();
  </script>
</head>
<body style="background: #0b0f19; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1.5rem; box-sizing: border-box;">
  <div style="max-width: 600px; text-align: center; background: #131b2e; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    <div style="font-size: 0.85rem; color: #10b981; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Maktabah Maftoohah Al-Quran</div>
    <h1 style="font-size: 1.35rem; color: #f8fafc; margin: 0 0 1.25rem 0;">Surah {html.escape(s_name_lat)} ({s_num}:{a_num})</h1>
    <div style="font-family: 'Amiri', 'Traditional Arabic', serif; font-size: 1.55rem; color: #f59e0b; direction: rtl; line-height: 1.8; margin-bottom: 1.25rem;">{html.escape(ar_text)}</div>
    <p style="font-size: 0.95rem; color: #cbd5e1; line-height: 1.6; margin-bottom: 1.5rem;">"{html.escape(trans_snippet)}"</p>
    <a href="../../#{s_num}:{a_num}" style="display: inline-block; background: #10b981; color: #0b0f19; text-decoration: none; font-weight: 600; padding: 0.6rem 1.25rem; border-radius: 8px;">Buka Ayat Penuh / Open Full Verse</a>
  </div>
</body>
</html>
"""
            ayah_index.write_text(ayah_html, encoding="utf-8")
            verse_count += 1

    elapsed = time.time() - start_time
    print(f"Generated {surah_count} Surah pages and {verse_count} Ayah preview pages in {elapsed:.2f}s")

if __name__ == "__main__":
    main()
