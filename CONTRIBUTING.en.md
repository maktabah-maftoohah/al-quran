# Contributing to Maktabah Maftoohah Al-Quran

<p align="center">
  <a href="CONTRIBUTING.md">🇲🇾 <strong>Bahasa Melayu</strong></a> &nbsp;|&nbsp; 🇬🇧 <strong>English Version</strong>
</p>

Thank you for your interest in contributing to **Maktabah Maftoohah Al-Quran**! We welcome community contributions to help improve translations, morphology data, UI accessibility, and performance.

---

## 🏛️ Architectural Invariants

Before making code contributions, please be aware of the project's core invariants:

1. **Zero-Build Vanilla ES6**:
   * We do not use bundlers (Webpack, Vite, Rollup, etc.) or transpilers (Babel, TypeScript).
   * All JavaScript files must be standard ES6 modules (`import` / `export`) runnable natively in modern browsers.
   * Do not introduce npm runtime dependencies.

2. **GitHub Pages Subpath Compatibility**:
   * All network requests for assets and data **MUST** use relative paths (e.g., `./data/...`, `./css/...`, `./js/...`).
   * Never use absolute root paths (e.g., `/data/...`) as they break when hosted on subpaths like `https://maktabah-maftoohah.github.io/al-quran/`.

3. **Strict Encoding & File Standards**:
   * All files (`.json`, `.js`, `.css`, `.html`, `.md`, `.py`) must use strict **UTF-8 encoding without BOM**.
   * Python scripts writing files must specify `encoding="utf-8"` and `ensure_ascii=False`.

4. **Service Worker Versioning**:
   * When modifying core stylesheets or scripts, remember to bump `CACHE_NAME` in `sw.js` (e.g., `v14` $\rightarrow$ `v15`) so offline caches invalidate cleanly across user browsers.

---

## 🛠️ Contribution Workflow

1. **Fork the Repository**: Create a personal fork on GitHub.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/my-enhancement
   ```
3. **Local Development**:
   ```bash
   # Run the local development server with auto-reload and no-cache headers
   python scripts/serve.py --port 8000
   # or
   npm run serve
   ```
4. **Make Your Changes**: Keep modifications modular, clean, and well-commented.
5. **Run the Test & Verification Suite**:
   ```bash
   # 1. Verify Project Invariants & Quranic Data Schemas
   npm run verify
   # or:
   python scripts/verify_project.py
   python scripts/verify_data_integrity.py

   # 2. Run Comprehensive QA & Browser Tests (Playwright)
   npm test
   npm run test:ui
   ```
6. **Commit Your Changes**: Follow conventional commit messages:
   ```bash
   git commit -m "feat(ui): add new audio speed playback control"
   ```
7. **Submit a Pull Request**: Describe your changes, motivation, and test verification results in the PR description.

---

## 🐛 Reporting Bugs & Issues

If you find a bug, rendering discrepancy, or typographical issue in the text:
1. Check existing [GitHub Issues](https://github.com/maktabah-maftoohah/al-quran/issues) to see if it has already been reported.
2. Open a new issue with clear reproduction steps, browser/OS version, and screenshots if applicable.

May Allah reward your efforts in serving the Quran and the community.
