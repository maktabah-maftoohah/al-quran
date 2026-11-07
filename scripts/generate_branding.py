import os
import urllib.request
import pathlib
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from playwright.sync_api import sync_playwright

root = pathlib.Path(__file__).resolve().parent.parent
assets_dir = root / "assets"

cache_dir = root / "scripts" / ".cache_fonts"
cache_dir.mkdir(parents=True, exist_ok=True)

amiri_font_path = cache_dir / "Amiri-Bold.ttf"
inter_font_path = cache_dir / "Inter.ttf"

def ensure_font(path, url):
    if not path.exists():
        print(f"Downloading {path.name}...")
        urllib.request.urlretrieve(url, path)

ensure_font(amiri_font_path, "https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Bold.ttf")
ensure_font(inter_font_path, "https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf")

def text_to_path(font_path, text, font_size, direction='ltr', language='en', script='Latn'):
    font_data = open(font_path, 'rb').read()
    ttfont = TTFont(font_path)
    glyph_set = ttfont.getGlyphSet()
    
    face = hb.Face(font_data)
    font = hb.Font(face)
    
    upem = ttfont['head'].unitsPerEm
    scale = font_size / upem
    
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    if direction:
        buf.direction = direction
    if language:
        buf.language = language
    if script:
        buf.script = script
        
    hb.shape(font, buf)
    
    cursor_x = 0
    cursor_y = 0
    path_commands = []
    
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        glyph_name = ttfont.getGlyphName(info.codepoint)
        x_offset = (cursor_x + pos.x_offset) * scale
        y_offset = (cursor_y + pos.y_offset) * scale
        
        pen = SVGPathPen(glyph_set)
        tpen = TransformPen(pen, (scale, 0, 0, -scale, x_offset, -y_offset))
        glyph_set[glyph_name].draw(tpen)
        cmd = pen.getCommands()
        if cmd:
            path_commands.append(cmd)
            
        cursor_x += pos.x_advance
        cursor_y += pos.y_advance
        
    total_width = cursor_x * scale
    return ' '.join(path_commands), total_width

print("Generating vector text outlines...")

# 1. Arabic & Latin texts for site-banner.svg
p_banner_ar, _ = text_to_path(amiri_font_path, 'القرآن الكريم', 56, direction='rtl', language='ar', script='Arab')
p_banner_ar_sub, _ = text_to_path(amiri_font_path, 'المكتبة المفتوحة', 15, direction='rtl', language='ar', script='Arab')
p_banner_org, _ = text_to_path(inter_font_path, 'MAKTABAH MAFTOOHAH', 13.5)
p_banner_title, _ = text_to_path(inter_font_path, 'Al-Quran', 64)
p_banner_desc, _ = text_to_path(inter_font_path, 'Open-Source, Offline-First Digital Quran Study Platform', 20)
p_banner_subdesc, _ = text_to_path(inter_font_path, 'Deep grammatical morphology, 15-line Madinah Mushaf, recitations & multilingual exegesis.', 15)

# Pills text
p_pill1, _ = text_to_path(inter_font_path, '15-Line Mushaf', 13.5)
p_pill2, _ = text_to_path(inter_font_path, 'Word Morphology', 13.5)
p_pill3, _ = text_to_path(inter_font_path, 'Offline Reciters', 13.5)
p_pill4, _ = text_to_path(inter_font_path, 'Hifz Mode', 13.5)
p_pill5, _ = text_to_path(inter_font_path, 'Melayu & English', 12.5)
p_pill6, _ = text_to_path(inter_font_path, 'Zero-Build PWA', 12.5)
p_pill7, _ = text_to_path(inter_font_path, 'Tafsir Basmeih & Jalalayn', 12.5)
p_url, _ = text_to_path(inter_font_path, 'maktabah-maftoohah.github.io/al-quran', 14)
p_star_text, _ = text_to_path(inter_font_path, 'Free & Open Source', 13)

# 2. Texts for logo.svg
p_logo_ar, _ = text_to_path(amiri_font_path, 'القرآن الكريم', 38, direction='rtl', language='ar', script='Arab')
p_logo_title, _ = text_to_path(inter_font_path, 'Al-Quran', 44)
p_logo_org, _ = text_to_path(inter_font_path, 'MAKTABAH MAFTOOHAH', 13.5)
p_logo_sub, _ = text_to_path(inter_font_path, '• Open Digital Quran Platform', 13.5)

# Read clean user-edited logo-mark.svg
logo_mark_raw = (assets_dir / "logo-mark.svg").read_text(encoding="utf-8")
svg_tag_start = logo_mark_raw.find("<svg")
logo_mark_clean = logo_mark_raw[svg_tag_start:]

# Vector Icons Definitions (for pills)
# Book icon (15-Line Mushaf)
icon_book = '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z M6 6h10 M6 10h10" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="scale(0.7) translate(8, 6)"/>'
# Microscope/Atom icon (Word Morphology)
icon_microscope = '<path d="M6 18h8 M10 14v4 M12 6a4 4 0 0 0-4 4v1h8v-1a4 4 0 0 0-4-4Z M10 2v4" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="scale(0.7) translate(8, 6)"/>'
# Headphones icon (Offline Reciters)
icon_headphones = '<path d="M3 18v-6a9 9 0 0 1 18 0v6 M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="scale(0.7) translate(8, 6)"/>'
# Brain/Mind icon (Hifz Mode)
icon_brain = '<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04z M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04z" fill="none" stroke="#c084fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="scale(0.7) translate(8, 6)"/>'
# Globe icon (Melayu & English)
icon_globe = '<circle cx="12" cy="12" r="10" fill="none" stroke="#94a3b8" stroke-width="2" transform="scale(0.65) translate(8, 7)"/><line x1="2" y1="12" x2="22" y2="12" stroke="#94a3b8" stroke-width="2" transform="scale(0.65) translate(8, 7)"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="none" stroke="#94a3b8" stroke-width="2" transform="scale(0.65) translate(8, 7)"/>'
# Lightning icon (Zero-Build PWA)
icon_lightning = '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#10b981" transform="scale(0.65) translate(8, 7)"/>'
# Book Stack icon (Tafsir Basmeih & Jalalayn)
icon_books = '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z M6 6h10" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="scale(0.65) translate(8, 7)"/>'
# Star icon (Free & Open Source)
icon_star = '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#f59e0b" transform="scale(0.7) translate(14, 11)"/>'


# BUILD OUTLINED site-banner.svg
site_banner_svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1280 640" width="1280" height="640">
  <defs>
    <!-- Deep Ambient Gradients -->
    <linearGradient id="bannerBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#060911" />
      <stop offset="45%" stop-color="#0b1120" />
      <stop offset="80%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#070c17" />
    </linearGradient>

    <linearGradient id="bannerGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="30%" stop-color="#f59e0b" />
      <stop offset="70%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>

    <!-- Giant Ambient Glows -->
    <radialGradient id="bannerEmeraldGlow" cx="25%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.28" />
      <stop offset="50%" stop-color="#10b981" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#10b981" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="bannerGoldGlow" cx="75%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.22" />
      <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
    </radialGradient>

    <!-- Islamic Geometric Arabesque Tile Pattern (Octagram Lattice) -->
    <pattern id="islamicGrid" width="90" height="90" patternUnits="userSpaceOnUse">
      <path d="M 45 0 L 90 45 L 45 90 L 0 45 Z" fill="none" stroke="rgba(245, 158, 11, 0.05)" stroke-width="1" />
      <rect x="22.5" y="22.5" width="45" height="45" fill="none" stroke="rgba(16, 185, 129, 0.04)" stroke-width="1" />
      <circle cx="45" cy="45" r="18" fill="none" stroke="rgba(245, 158, 11, 0.04)" stroke-width="0.75" />
      <circle cx="0" cy="0" r="12" fill="none" stroke="rgba(16, 185, 129, 0.04)" stroke-width="0.75" />
      <circle cx="90" cy="0" r="12" fill="none" stroke="rgba(16, 185, 129, 0.04)" stroke-width="0.75" />
      <circle cx="0" cy="90" r="12" fill="none" stroke="rgba(16, 185, 129, 0.04)" stroke-width="0.75" />
      <circle cx="90" cy="90" r="12" fill="none" stroke="rgba(16, 185, 129, 0.04)" stroke-width="0.75" />
    </pattern>
  </defs>

  <!-- 1. Background Base & Lattice -->
  <rect width="1280" height="640" fill="url(#bannerBg)" />
  <rect width="1280" height="640" fill="url(#islamicGrid)" />

  <!-- 2. Ambient Lighting Glows -->
  <rect width="1280" height="640" fill="url(#bannerEmeraldGlow)" />
  <rect width="1280" height="640" fill="url(#bannerGoldGlow)" />

  <!-- 3. Elegant Double Outer Border with Corner Flourishes -->
  <rect x="20" y="20" width="1240" height="600" rx="20" fill="none" stroke="url(#bannerGoldGrad)" stroke-width="1.5" stroke-opacity="0.4" />
  <rect x="28" y="28" width="1224" height="584" rx="16" fill="none" stroke="rgba(16, 185, 129, 0.3)" stroke-width="1" />

  <!-- Corner 8-Point Star Medallions -->
  <g fill="#fffbeb">
    <polygon points="28,28 32,22 38,28 32,34" />
    <polygon points="1252,28 1256,22 1262,28 1256,34" />
    <polygon points="28,612 32,606 38,612 32,618" />
    <polygon points="1252,612 1256,606 1262,612 1256,618" />
  </g>

  <!-- 4. Left Hero Visual: User-Edited Logo Mark SVG (368x368 at x=70, y=136) -->
  <svg x="70" y="136" width="368" height="368" viewBox="0 0 512 512">
    {logo_mark_clean}
  </svg>

  <!-- Center Decorative Vertical Separator with Arabesque Knot -->
  <g transform="translate(485, 100)">
    <line x1="0" y1="40" x2="0" y2="400" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />
    <circle cx="0" cy="220" r="16" fill="#0f172a" stroke="url(#bannerGoldGrad)" stroke-width="1.5" />
    <polygon points="0,210 6,220 0,230 -6,220" fill="#10b981" />
  </g>

  <!-- 5. Right Content - 100% Vector Outlines (Zero Font Errors in Illustrator) -->
  <!-- Top Category / Org Pill -->
  <g transform="translate(530, 95)">
    <rect x="0" y="0" width="330" height="32" rx="16" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.35)" stroke-width="1.2" />
    <circle cx="16" cy="16" r="4.5" fill="#10b981" />
    <!-- Outlined "MAKTABAH MAFTOOHAH" -->
    <path d="{p_banner_org}" fill="#10b981" transform="translate(30, 21)" />
    <!-- Outlined "المكتبة المفتوحة" -->
    <path d="{p_banner_ar_sub}" fill="#f59e0b" transform="translate(225, 21)" />
  </g>

  <!-- Outlined Arabic Calligraphic Crown: "القرآن الكريم" -->
  <path d="{p_banner_ar}" fill="url(#bannerGoldGrad)" transform="translate(530, 185)" />

  <!-- Outlined Primary Latin Headline: "Al-Quran" -->
  <path d="{p_banner_title}" fill="#ffffff" transform="translate(530, 255)" />

  <!-- Outlined Tagline / Value Proposition -->
  <path d="{p_banner_desc}" fill="#cbd5e1" transform="translate(530, 295)" />
  <path d="{p_banner_subdesc}" fill="#94a3b8" transform="translate(530, 325)" />

  <!-- Feature Pill Badges - Vector Icons & Outlined Text -->
  <g transform="translate(530, 360)">
    <!-- Pill 1: 15-Line Mushaf -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="168" height="36" rx="8" fill="#151d2f" stroke="rgba(245, 158, 11, 0.35)" stroke-width="1.2" />
      {icon_book}
      <path d="{p_pill1}" fill="#f8fafc" transform="translate(38, 23)" />
    </g>
    <!-- Pill 2: Word Morphology -->
    <g transform="translate(180, 0)">
      <rect x="0" y="0" width="180" height="36" rx="8" fill="#151d2f" stroke="rgba(16, 185, 129, 0.35)" stroke-width="1.2" />
      {icon_microscope}
      <path d="{p_pill2}" fill="#f8fafc" transform="translate(38, 23)" />
    </g>
    <!-- Pill 3: Offline Reciters -->
    <g transform="translate(372, 0)">
      <rect x="0" y="0" width="165" height="36" rx="8" fill="#151d2f" stroke="rgba(56, 189, 248, 0.35)" stroke-width="1.2" />
      {icon_headphones}
      <path d="{p_pill3}" fill="#f8fafc" transform="translate(38, 23)" />
    </g>
    <!-- Pill 4: Hifz Mode -->
    <g transform="translate(549, 0)">
      <rect x="0" y="0" width="135" height="36" rx="8" fill="#151d2f" stroke="rgba(168, 85, 247, 0.35)" stroke-width="1.2" />
      {icon_brain}
      <path d="{p_pill4}" fill="#f8fafc" transform="translate(38, 23)" />
    </g>
  </g>

  <!-- Secondary Row of Badges -->
  <g transform="translate(530, 412)">
    <!-- Pill 5: Melayu & English -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="176" height="34" rx="8" fill="#111827" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
      {icon_globe}
      <path d="{p_pill5}" fill="#f8fafc" transform="translate(38, 22)" />
    </g>
    <!-- Pill 6: Zero-Build PWA -->
    <g transform="translate(188, 0)">
      <rect x="0" y="0" width="164" height="34" rx="8" fill="#111827" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
      {icon_lightning}
      <path d="{p_pill6}" fill="#f8fafc" transform="translate(38, 22)" />
    </g>
    <!-- Pill 7: Tafsir Basmeih & Jalalayn -->
    <g transform="translate(364, 0)">
      <rect x="0" y="0" width="220" height="34" rx="8" fill="#111827" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
      {icon_books}
      <path d="{p_pill7}" fill="#f8fafc" transform="translate(38, 22)" />
    </g>
  </g>

  <!-- Bottom Details & Live Web Link -->
  <g transform="translate(530, 495)">
    <!-- Live App Badge Box -->
    <rect x="0" y="0" width="410" height="42" rx="10" fill="#0b1324" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1.2" />
    <circle cx="20" cy="21" r="5" fill="#10b981" />
    <path d="{p_url}" fill="#38bdf8" transform="translate(36, 26)" />

    <!-- GitHub Badge -->
    <g transform="translate(425, 0)">
      <rect x="0" y="0" width="220" height="42" rx="10" fill="#1e293b" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.2" />
      {icon_star}
      <path d="{p_star_text}" fill="#f8fafc" transform="translate(44, 26)" />
    </g>
  </g>
</svg>'''

(assets_dir / "site-banner.svg").write_text(site_banner_svg, encoding="utf-8")
print("[SUCCESS] Wrote 100% outlined assets/site-banner.svg")


# BUILD OUTLINED logo.svg
logo_svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 800 200" width="800" height="200">
  <defs>
    <linearGradient id="goldGradLogo" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="30%" stop-color="#f59e0b" />
      <stop offset="70%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
  </defs>

  <!-- Background Base Container -->
  <rect width="800" height="200" rx="32" fill="#0b0f19" />
  <rect width="794" height="194" x="3" y="3" rx="29" fill="none" stroke="rgba(245, 158, 11, 0.25)" stroke-width="1.5" />

  <!-- Left: Nested Edited Logo Mark (160x160 at x=20, y=20) -->
  <svg x="20" y="20" width="160" height="160" viewBox="0 0 512 512">
    {logo_mark_clean}
  </svg>

  <!-- Vertical Subtle Divider -->
  <line x1="205" y1="36" x2="205" y2="164" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1.5" />

  <!-- Right: 100% Outlined Typography (Zero Font Errors in Illustrator) -->
  <!-- Arabic Calligraphy Headline: "القرآن الكريم" -->
  <path d="{p_logo_ar}" fill="url(#goldGradLogo)" transform="translate(235, 68)" />

  <!-- Latin Primary Title: "Al-Quran" -->
  <path d="{p_logo_title}" fill="#f8fafc" transform="translate(235, 122)" />

  <!-- Category / Platform Subtitle -->
  <g transform="translate(235, 142)">
    <!-- Pill Box -->
    <rect x="0" y="0" width="202" height="26" rx="6" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.3)" stroke-width="1" />
    <!-- "MAKTABAH MAFTOOHAH" -->
    <path d="{p_logo_org}" fill="#10b981" transform="translate(10, 18)" />
    <!-- "• Open Digital Quran Platform" -->
    <path d="{p_logo_sub}" fill="#94a3b8" transform="translate(216, 18)" />
  </g>
</svg>'''

(assets_dir / "logo.svg").write_text(logo_svg, encoding="utf-8")
print("[SUCCESS] Wrote 100% outlined assets/logo.svg")

# Render all raster PNG and JPG images
print("Rendering raster assets with Playwright Chromium...")
with sync_playwright() as p:
    browser = p.chromium.launch()

    # icon-192.png
    page = browser.new_page(viewport={"width": 192, "height": 192}, device_scale_factor=1)
    page.goto(f"file://{assets_dir / 'logo-mark.svg'}")
    page.screenshot(path=str(assets_dir / "icon-192.png"))
    print("[SUCCESS] Generated assets/icon-192.png")

    # logo.png (1600x400 Retina)
    page = browser.new_page(viewport={"width": 800, "height": 200}, device_scale_factor=2)
    page.goto(f"file://{assets_dir / 'logo.svg'}")
    page.wait_for_timeout(500)
    page.screenshot(path=str(assets_dir / "logo.png"))
    print("[SUCCESS] Generated assets/logo.png")

    # site-banner.png (2560x1280 Retina)
    page = browser.new_page(viewport={"width": 1280, "height": 640}, device_scale_factor=2)
    page.goto(f"file://{assets_dir / 'site-banner.svg'}")
    page.wait_for_timeout(500)
    page.screenshot(path=str(assets_dir / "site-banner.png"))
    print("[SUCCESS] Generated assets/site-banner.png")

    # og-banner.jpg (1280x640 JPEG)
    page = browser.new_page(viewport={"width": 1280, "height": 640}, device_scale_factor=1)
    page.goto(f"file://{assets_dir / 'site-banner.svg'}")
    page.wait_for_timeout(500)
    page.screenshot(path=str(assets_dir / "og-banner.jpg"), type="jpeg", quality=95)
    print("[SUCCESS] Generated assets/og-banner.jpg")

    browser.close()

print("\n>>> ALL OUTLINED VECTOR AND RASTER ASSETS READY! <<<")
