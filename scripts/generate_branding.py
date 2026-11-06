import pathlib
from playwright.sync_api import sync_playwright

root = pathlib.Path(__file__).resolve().parent.parent
assets_dir = root / "assets"
assets_dir.mkdir(parents=True, exist_ok=True)

# 1. LOGO MARK SVG (512x512)
logo_mark_inner = '''
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080c14" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#162032" />
    </linearGradient>

    <!-- Radiant Gold Gradients -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="30%" stop-color="#f59e0b" />
      <stop offset="70%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <linearGradient id="goldLight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fffbeb" />
      <stop offset="100%" stop-color="#fcd34d" />
    </linearGradient>

    <!-- Spiritual Emerald Gradients -->
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6ee7b7" />
      <stop offset="40%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>

    <!-- Page Gradients -->
    <linearGradient id="pageLeft" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="60%" stop-color="#f1f5f9" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>
    <linearGradient id="pageRight" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="60%" stop-color="#f1f5f9" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>

    <!-- Rehal (Bookstand) Gradients -->
    <linearGradient id="rehalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d97706" />
      <stop offset="50%" stop-color="#92400e" />
      <stop offset="100%" stop-color="#78350f" />
    </linearGradient>

    <!-- Ambient Glows -->
    <radialGradient id="glowEmerald" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.35" />
      <stop offset="60%" stop-color="#10b981" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#10b981" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowGold" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.38" />
      <stop offset="55%" stop-color="#f59e0b" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
    </radialGradient>

    <!-- Drop Shadow -->
    <filter id="shadowHeavy" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.65" />
    </filter>
    <filter id="glowFilter" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- 1. Background Base -->
  <rect width="512" height="512" rx="120" fill="url(#bgGrad)" />
  <rect width="502" height="502" x="5" y="5" rx="115" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-opacity="0.35" />

  <!-- 2. Ambient Celestial Radiance -->
  <circle cx="256" cy="248" r="210" fill="url(#glowEmerald)" />
  <circle cx="256" cy="248" r="140" fill="url(#glowGold)" />

  <!-- 3. Geometric Background Rays (Sacred Illumination) -->
  <g stroke="rgba(245, 158, 11, 0.12)" stroke-width="1.5">
    <line x1="256" y1="38" x2="256" y2="458" />
    <line x1="46" y1="248" x2="466" y2="248" />
    <line x1="107" y1="99" x2="405" y2="397" />
    <line x1="405" y1="99" x2="107" y2="397" />
    <line x1="175" y1="67" x2="337" y2="429" />
    <line x1="337" y1="67" x2="175" y2="429" />
    <line x1="75" y1="167" x2="437" y2="329" />
    <line x1="437" y1="167" x2="75" y2="329" />
  </g>

  <!-- 4. Concentric Sacred Geometry Rings -->
  <circle cx="256" cy="248" r="192" fill="none" stroke="rgba(16, 185, 129, 0.28)" stroke-width="2" stroke-dasharray="4 8" />
  <circle cx="256" cy="248" r="176" fill="none" stroke="url(#goldGrad)" stroke-width="1" stroke-opacity="0.4" />

  <!-- 5. Rub' al-Hizb (۞) 8-Pointed Star Motif -->
  <!-- Square 1 -->
  <rect x="91" y="83" width="330" height="330" rx="28" fill="none" stroke="url(#goldGrad)" stroke-width="3" stroke-opacity="0.85" filter="url(#shadowHeavy)" />
  <!-- Square 2 (Rotated 45°) -->
  <rect x="91" y="83" width="330" height="330" rx="28" fill="none" stroke="url(#goldGrad)" stroke-width="3" stroke-opacity="0.85" transform="rotate(45 256 248)" filter="url(#shadowHeavy)" />

  <!-- Inner 16-point geometric tracer ring -->
  <circle cx="256" cy="248" r="148" fill="none" stroke="url(#emeraldGrad)" stroke-width="1.5" stroke-opacity="0.6" />

  <!-- 8 Cardinal/Diagonal Star Jewel Accents -->
  <g fill="url(#goldLight)" filter="url(#glowFilter)">
    <circle cx="256" cy="62" r="5" />
    <circle cx="256" cy="434" r="5" />
    <circle cx="70" cy="248" r="5" />
    <circle cx="442" cy="248" r="5" />
    <circle cx="124" cy="116" r="4.5" />
    <circle cx="388" cy="116" r="4.5" />
    <circle cx="124" cy="380" r="4.5" />
    <circle cx="388" cy="380" r="4.5" />
  </g>

  <!-- 6. Mihrab Sanctuary Arch (Spiritual Archway) -->
  <path d="M 170 330 L 170 215 C 170 148, 256 112, 256 112 C 256 112, 342 148, 342 215 L 342 330" 
        fill="rgba(16, 185, 129, 0.08)" stroke="url(#emeraldGrad)" stroke-width="2" stroke-opacity="0.5" />
  <path d="M 186 330 L 186 222 C 186 166, 256 132, 256 132 C 256 132, 326 166, 326 222 L 326 330" 
        fill="none" stroke="url(#goldGrad)" stroke-width="1" stroke-opacity="0.4" stroke-dasharray="3 3" />

  <!-- 7. The Rehal (Traditional Carved Wooden Quran Stand) -->
  <g filter="url(#shadowHeavy)">
    <!-- Main Interlocking Rehal Legs -->
    <path d="M 152 404 C 188 388, 230 354, 256 332 C 282 354, 324 388, 360 404 C 348 412, 320 398, 292 386 L 256 356 L 220 386 C 192 398, 164 412, 152 404 Z" 
          fill="url(#rehalGrad)" stroke="url(#goldGrad)" stroke-width="1.5" />
    <!-- Rehal Base Feet & Traditional Arch Cutout -->
    <path d="M 166 400 L 195 388 L 222 396 L 256 366 L 290 396 L 317 388 L 346 400 C 328 414, 286 402, 256 402 C 226 402, 184 414, 166 400 Z" 
          fill="#5c2605" opacity="0.9" />
    <!-- Center Carved Diamond Medallion on Rehal -->
    <polygon points="256,366 266,378 256,390 246,378" fill="url(#goldGrad)" />
  </g>

  <!-- 8. The Holy Quran (Open Mushaf with Curved Luminous Pages) -->
  <g filter="url(#shadowHeavy)">
    <!-- Depth/Page Layers Underneath -->
    <path d="M 256 324 C 218 316, 162 306, 134 312 C 128 262, 136 218, 142 212 C 160 207, 216 215, 256 220 Z" 
          fill="#1e293b" opacity="0.8" />
    <path d="M 256 324 C 294 316, 350 306, 378 312 C 384 262, 376 218, 370 212 C 352 207, 296 215, 256 220 Z" 
          fill="#1e293b" opacity="0.8" />

    <!-- Left Open Page (Gentle S-Curve for Realism) -->
    <path d="M 256 318 C 216 310, 164 298, 140 304 C 134 252, 142 210, 148 206 C 170 201, 218 209, 256 214 Z" 
          fill="url(#pageLeft)" stroke="url(#goldGrad)" stroke-width="1.5" />
    
    <!-- Right Open Page (Gentle S-Curve for Realism) -->
    <path d="M 256 318 C 296 310, 348 298, 372 304 C 378 252, 370 210, 364 206 C 342 201, 294 209, 256 214 Z" 
          fill="url(#pageRight)" stroke="url(#goldGrad)" stroke-width="1.5" />

    <!-- Scripture Lines (Golden / Emerald Ayaat Mimicry) -->
    <!-- Left Page Ayaat Lines -->
    <g stroke="rgba(245, 158, 11, 0.75)" stroke-width="2.5" stroke-linecap="round">
      <line x1="164" y1="230" x2="238" y2="235" />
      <line x1="158" y1="248" x2="238" y2="253" />
      <line x1="156" y1="266" x2="238" y2="271" />
      <line x1="160" y1="284" x2="238" y2="289" />
    </g>
    <!-- Right Page Ayaat Lines -->
    <g stroke="rgba(16, 185, 129, 0.75)" stroke-width="2.5" stroke-linecap="round">
      <line x1="274" y1="235" x2="348" y2="230" />
      <line x1="274" y1="253" x2="354" y2="248" />
      <line x1="274" y1="271" x2="356" y2="266" />
      <line x1="274" y1="289" x2="352" y2="284" />
    </g>

    <!-- Spine Binding Ridge & Shadow -->
    <path d="M 254 214 L 254 318 L 258 318 L 258 214 Z" fill="#94a3b8" opacity="0.6" />

    <!-- Hanging Bookmark Ribbon (Tahfeez / Dhabit Ribbon) -->
    <g filter="url(#shadowHeavy)">
      <path d="M 253 214 L 253 346 L 256 341 L 259 346 L 259 214 Z" fill="url(#goldGrad)" />
      <!-- Golden Tassel Diamond -->
      <polygon points="256,346 261,354 256,362 251,354" fill="url(#goldLight)" />
    </g>
  </g>

  <!-- 9. Crown Star of Divine Guidance (Nur / Rub' al-Hizb ۞) -->
  <g transform="translate(256, 160)" filter="url(#glowFilter)">
    <!-- Glowing Halo -->
    <circle cx="0" cy="0" r="18" fill="url(#glowGold)" />
    <!-- 8-Point Miniature Gold Star -->
    <polygon points="0,-16 4,-5 15,-5 7,2 10,13 0,6 -10,13 -7,2 -15,-5 -4,-5" fill="url(#goldLight)" />
    <!-- Center Jewel -->
    <circle cx="0" cy="0" r="3.5" fill="#10b981" />
  </g>
'''

logo_mark_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
{logo_mark_inner}
</svg>'''

(assets_dir / "logo-mark.svg").write_text(logo_mark_svg, encoding="utf-8")
print("[SUCCESS] Wrote assets/logo-mark.svg")

# Also update data/icon.svg to this high-fidelity mark!
(root / "data" / "icon.svg").write_text(logo_mark_svg, encoding="utf-8")
print("[SUCCESS] Updated data/icon.svg")


# 2. GITHUB CIRCULAR AVATAR SVG (512x512 with Circular Crop Optimization)
github_avatar_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    {logo_mark_inner.split('<defs>')[1].split('</defs>')[0]}
    <clipPath id="circleClip">
      <circle cx="256" cy="256" r="256" />
    </clipPath>
  </defs>

  <!-- Full Background Canvas -->
  <rect width="512" height="512" fill="#060911" />

  <!-- Circular Masked Body -->
  <g clip-path="url(#circleClip)">
    <!-- Circular Slate Background -->
    <circle cx="256" cy="256" r="256" fill="url(#bgGrad)" />

    <!-- Outer Concentric Circular Borders designed specifically for GitHub circle crop -->
    <circle cx="256" cy="256" r="248" fill="none" stroke="url(#goldGrad)" stroke-width="3" stroke-opacity="0.85" />
    <circle cx="256" cy="256" r="240" fill="none" stroke="url(#emeraldGrad)" stroke-width="1.8" stroke-dasharray="5 7" stroke-opacity="0.75" />
    <circle cx="256" cy="256" r="228" fill="none" stroke="rgba(245, 158, 11, 0.4)" stroke-width="1" />

    <!-- Scaled Central Sacred Emblem with Safe Margins -->
    <g transform="translate(256, 256) scale(0.88) translate(-256, -248)">
      {logo_mark_inner.split('</defs>')[1]}
    </g>
  </g>
</svg>'''

(assets_dir / "github-avatar.svg").write_text(github_avatar_svg, encoding="utf-8")
print("[SUCCESS] Wrote assets/github-avatar.svg")


# 3. HORIZONTAL LOGO LOCKUP SVG (800x200)
logo_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200" width="800" height="200">
  <defs>
    <!-- Fonts import -->
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@700&amp;family=Inter:wght@400;600;700;800&amp;display=swap');
      .ar-title {{ font-family: 'Amiri', 'Scheherazade New', serif; font-size: 38px; font-weight: 700; fill: url(#goldGrad); }}
      .latin-title {{ font-family: 'Inter', system-ui, sans-serif; font-size: 44px; font-weight: 800; fill: #f8fafc; letter-spacing: -0.02em; }}
      .badge-text {{ font-family: 'Inter', system-ui, sans-serif; font-size: 13.5px; font-weight: 700; fill: #10b981; letter-spacing: 0.16em; }}
      .sub-text {{ font-family: 'Inter', system-ui, sans-serif; font-size: 13.5px; font-weight: 500; fill: #94a3b8; }}
    </style>
    {logo_mark_inner.split('<defs>')[1].split('</defs>')[0]}
  </defs>

  <!-- Background Base Container -->
  <rect width="800" height="200" rx="32" fill="#0b0f19" />
  <rect width="794" height="194" x="3" y="3" rx="29" fill="none" stroke="rgba(245, 158, 11, 0.25)" stroke-width="1.5" />

  <!-- Left: Scaled Logo Mark (160x160 centered at x=100, y=100) -->
  <g transform="translate(20, 20) scale(0.3125)">
    <!-- We reuse the visual elements from logo_mark -->
    {logo_mark_inner.split('</defs>')[1]}
  </g>

  <!-- Vertical Subtle Divider -->
  <line x1="205" y1="36" x2="205" y2="164" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1.5" />

  <!-- Right Typography Block -->
  <!-- Arabic Calligraphy Headline -->
  <text x="235" y="70" class="ar-title">القرآن الكريم</text>
  
  <!-- Latin Primary Title -->
  <text x="235" y="122" class="latin-title">Al-Quran</text>

  <!-- Category / Platform Subtitle -->
  <g transform="translate(235, 142)">
    <!-- Pill Box -->
    <rect x="0" y="0" width="202" height="26" rx="6" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.3)" stroke-width="1" />
    <text x="10" y="17" class="badge-text">MAKTABAH MAFTOOHAH</text>
    <text x="216" y="17" class="sub-text">• Open Digital Quran Platform</text>
  </g>
</svg>'''

(assets_dir / "logo.svg").write_text(logo_svg, encoding="utf-8")
print("[SUCCESS] Wrote assets/logo.svg")


# 4. SITE BANNER SVG (1280x640)
site_banner_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 640" width="1280" height="640">
  <defs>
    <!-- Fonts import -->
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,700;1,400&amp;family=Inter:wght@400;500;600;700;800;900&amp;display=swap');
      .b-ar-bismillah {{ font-family: 'Amiri', serif; font-size: 20px; fill: #f59e0b; opacity: 0.85; }}
      .b-ar-title {{ font-family: 'Amiri', serif; font-size: 56px; font-weight: 700; fill: url(#goldGrad); }}
      .b-main-title {{ font-family: 'Inter', system-ui, sans-serif; font-size: 64px; font-weight: 900; fill: #ffffff; letter-spacing: -0.03em; }}
      .b-org-badge {{ font-family: 'Inter', system-ui, sans-serif; font-size: 14px; font-weight: 700; fill: #10b981; letter-spacing: 0.18em; }}
      .b-desc {{ font-family: 'Inter', system-ui, sans-serif; font-size: 20px; font-weight: 500; fill: #cbd5e1; }}
      .b-subdesc {{ font-family: 'Inter', system-ui, sans-serif; font-size: 15px; font-weight: 400; fill: #94a3b8; }}
      .pill-text {{ font-family: 'Inter', system-ui, sans-serif; font-size: 13.5px; font-weight: 600; fill: #f8fafc; }}
      .b-url {{ font-family: 'Inter', monospace, sans-serif; font-size: 14px; font-weight: 600; fill: #38bdf8; }}
    </style>

    <!-- Deep Ambient Gradients -->
    <linearGradient id="bannerBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#060911" />
      <stop offset="45%" stop-color="#0b1120" />
      <stop offset="80%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#070c17" />
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

    {logo_mark_inner.split('<defs>')[1].split('</defs>')[0]}
  </defs>

  <!-- 1. Background Base & Lattice -->
  <rect width="1280" height="640" fill="url(#bannerBg)" />
  <rect width="1280" height="640" fill="url(#islamicGrid)" />

  <!-- 2. Ambient Lighting Glows -->
  <rect width="1280" height="640" fill="url(#bannerEmeraldGlow)" />
  <rect width="1280" height="640" fill="url(#bannerGoldGlow)" />

  <!-- 3. Elegant Double Outer Border with Corner Flourishes -->
  <rect x="20" y="20" width="1240" height="600" rx="20" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-opacity="0.4" />
  <rect x="28" y="28" width="1224" height="584" rx="16" fill="none" stroke="rgba(16, 185, 129, 0.3)" stroke-width="1" />

  <!-- Corner 8-Point Star Medallions -->
  <g fill="url(#goldLight)" filter="url(#glowFilter)">
    <polygon points="28,28 32,22 38,28 32,34" />
    <polygon points="1252,28 1256,22 1262,28 1256,34" />
    <polygon points="28,612 32,606 38,612 32,618" />
    <polygon points="1252,612 1256,606 1262,612 1256,618" />
  </g>

  <!-- 4. Left Hero Visual: The Illuminated Quranic Emblem Mark (Scale: 0.72) -->
  <g transform="translate(70, 136) scale(0.72)">
    {logo_mark_inner.split('</defs>')[1]}
  </g>

  <!-- Center Decorative Vertical Separator with Arabesque Knot -->
  <g transform="translate(485, 100)">
    <line x1="0" y1="40" x2="0" y2="400" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />
    <circle cx="0" cy="220" r="16" fill="#0f172a" stroke="url(#goldGrad)" stroke-width="1.5" />
    <polygon points="0,210 6,220 0,230 -6,220" fill="url(#emeraldGrad)" />
  </g>

  <!-- 5. Right Content & Information Architecture -->
  <!-- Top Category / Org Pill -->
  <g transform="translate(530, 95)">
    <rect x="0" y="0" width="280" height="32" rx="16" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.35)" stroke-width="1.2" />
    <circle cx="16" cy="16" r="4.5" fill="#10b981" />
    <text x="30" y="21" class="b-org-badge">MAKTABAH MAFTOOHAH</text>
    <text x="215" y="21" font-family="'Amiri', serif" font-size="15" fill="#f59e0b">المكتبة المفتوحة</text>
  </g>

  <!-- Arabic Calligraphic Crown -->
  <text x="530" y="185" class="b-ar-title">القرآن الكريم</text>

  <!-- Primary Latin Headline -->
  <text x="530" y="255" class="b-main-title">Al-Quran</text>

  <!-- Tagline / Value Proposition -->
  <text x="530" y="300" class="b-desc">Open-Source, Offline-First Digital Quran Study Platform</text>
  <text x="530" y="330" class="b-subdesc">Deep grammatical morphology, 15-line Madinah Mushaf, recitations &amp; multilingual exegesis.</text>

  <!-- Feature Pill Badges -->
  <g transform="translate(530, 365)">
    <!-- Pill 1: 15-Line Mushaf -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="160" height="36" rx="8" fill="#151d2f" stroke="rgba(245, 158, 11, 0.35)" stroke-width="1.2" />
      <text x="14" y="23" class="pill-text">📖 15-Line Mushaf</text>
    </g>
    <!-- Pill 2: Word-by-Word Morphology -->
    <g transform="translate(172, 0)">
      <rect x="0" y="0" width="168" height="36" rx="8" fill="#151d2f" stroke="rgba(16, 185, 129, 0.35)" stroke-width="1.2" />
      <text x="14" y="23" class="pill-text">🔬 Word Morphology</text>
    </g>
    <!-- Pill 3: Audio Recitation -->
    <g transform="translate(352, 0)">
      <rect x="0" y="0" width="158" height="36" rx="8" fill="#151d2f" stroke="rgba(56, 189, 248, 0.35)" stroke-width="1.2" />
      <text x="14" y="23" class="pill-text">🎧 Offline Reciters</text>
    </g>
    <!-- Pill 4: Tahfiz / Hifz Mode -->
    <g transform="translate(522, 0)">
      <rect x="0" y="0" width="138" height="36" rx="8" fill="#151d2f" stroke="rgba(168, 85, 247, 0.35)" stroke-width="1.2" />
      <text x="14" y="23" class="pill-text">🧠 Hifz Mode</text>
    </g>
  </g>

  <!-- Secondary Row of Badges & Language Support -->
  <g transform="translate(530, 415)">
    <!-- Pill 5: Dual Language -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="176" height="34" rx="8" fill="#111827" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
      <text x="12" y="22" class="pill-text" font-size="12.5">🇲🇾 Melayu &amp; 🇬🇧 English</text>
    </g>
    <!-- Pill 6: Zero-Build PWA -->
    <g transform="translate(188, 0)">
      <rect x="0" y="0" width="164" height="34" rx="8" fill="#111827" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
      <text x="12" y="22" class="pill-text" font-size="12.5">⚡ Zero-Build PWA</text>
    </g>
    <!-- Pill 7: Tafsir Basmeih & Jalalayn -->
    <g transform="translate(364, 0)">
      <rect x="0" y="0" width="195" height="34" rx="8" fill="#111827" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
      <text x="12" y="22" class="pill-text" font-size="12.5">📚 Tafsir Basmeih &amp; Jalalayn</text>
    </g>
  </g>

  <!-- Bottom Details & Live Web Link -->
  <g transform="translate(530, 495)">
    <!-- Live App Badge Box -->
    <rect x="0" y="0" width="410" height="42" rx="10" fill="#0b1324" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1.2" />
    <circle cx="20" cy="21" r="5" fill="#10b981" />
    <text x="36" y="26" class="b-url">maktabah-maftoohah.github.io/al-quran</text>

    <!-- GitHub Badge -->
    <g transform="translate(425, 0)">
      <rect x="0" y="0" width="220" height="42" rx="10" fill="#1e293b" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.2" />
      <text x="16" y="26" class="pill-text" font-size="13">⭐ Free &amp; Open Source</text>
    </g>
  </g>
</svg>'''

(assets_dir / "site-banner.svg").write_text(site_banner_svg, encoding="utf-8")
print("[SUCCESS] Wrote assets/site-banner.svg")

# 5. RENDER TO HIGH-RES PNGs VIA PLAYWRIGHT
print("Rendering SVGs to high-resolution PNGs with Playwright Chromium...")
with sync_playwright() as p:
    browser = p.chromium.launch()
    
    # 5a. GitHub Avatar (1000x1000 Retina)
    page = browser.new_page(viewport={"width": 500, "height": 500}, device_scale_factor=2)
    page.goto(f"file://{assets_dir / 'github-avatar.svg'}")
    page.wait_for_timeout(1000)
    page.screenshot(path=str(assets_dir / "github-avatar.png"), full_page=False)
    page.screenshot(path=str(assets_dir / "avatar.png"), full_page=False)
    print("[SUCCESS] Generated assets/github-avatar.png and assets/avatar.png (1000x1000 Retina)")

    # 5b. Site Banner (1280x640)
    page = browser.new_page(viewport={"width": 1280, "height": 640}, device_scale_factor=2)
    page.goto(f"file://{assets_dir / 'site-banner.svg'}")
    page.wait_for_timeout(1000)
    page.screenshot(path=str(assets_dir / "site-banner.png"), full_page=False)
    print("[SUCCESS] Generated assets/site-banner.png (Retina 2560x1280)")

    # 5c. Logo (800x200)
    page = browser.new_page(viewport={"width": 800, "height": 200}, device_scale_factor=2)
    page.goto(f"file://{assets_dir / 'logo.svg'}")
    page.wait_for_timeout(1000)
    page.screenshot(path=str(assets_dir / "logo.png"), full_page=False)
    print("[SUCCESS] Generated assets/logo.png (Retina 1600x400)")

    # 5d. Logo Mark (512x512)
    page = browser.new_page(viewport={"width": 512, "height": 512}, device_scale_factor=2)
    page.goto(f"file://{assets_dir / 'logo-mark.svg'}")
    page.wait_for_timeout(1000)
    page.screenshot(path=str(assets_dir / "logo-mark.png"), full_page=False)
    print("[SUCCESS] Generated assets/logo-mark.png (Retina 1024x1024)")

    # 5e. PWA Icons 512x512 and 192x192
    page = browser.new_page(viewport={"width": 512, "height": 512}, device_scale_factor=1)
    page.goto(f"file://{assets_dir / 'logo-mark.svg'}")
    page.screenshot(path=str(assets_dir / "icon-512.png"))
    print("[SUCCESS] Generated assets/icon-512.png (512x512)")

    page = browser.new_page(viewport={"width": 192, "height": 192}, device_scale_factor=1)
    page.goto(f"file://{assets_dir / 'logo-mark.svg'}")
    page.screenshot(path=str(assets_dir / "icon-192.png"))
    print("[SUCCESS] Generated assets/icon-192.png (192x192)")

    browser.close()

print("\n>>> ALL BRANDING ASSETS SUCCESSFULLY GENERATED! <<<")
