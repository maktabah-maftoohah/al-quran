/**
 * Maktabah Maftoohah Al-Quran - Router Module
 * Handles hash changes and dispatches view transitions.
 */

import { store } from './store.js';

export class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;

    window.addEventListener('hashchange', () => this.handleRouting());
  }

  addRoute(pattern, handler) {
    this.routes.set(pattern, handler);
  }

  init() {
    if (!window.location.hash) {
      const last = store.getLastRead();
      const initialSurah = last ? last.surah : 1;
      window.location.hash = `#surah/${initialSurah}`;
    } else {
      this.handleRouting();
    }
  }

  handleRouting() {
    const rawHash = window.location.hash.slice(1) || 'surah/1';
    const [pathPart, queryPart] = rawHash.split('?');
    const queryParams = new URLSearchParams(queryPart || '');

    // 1. Ayah Deep-Dive: #ayah/:surah/:ayah or #ayah/:surah::ayah
    const ayahMatch = pathPart.match(/^ayah\/(\d+)[/:](\d+)$/);
    if (ayahMatch) {
      const surah = parseInt(ayahMatch[1], 10);
      const ayah = parseInt(ayahMatch[2], 10);
      const handler = this.routes.get('ayah');
      if (handler) handler({ surah, ayah });
      return;
    }

    // 2. Direct Surah Ayah Link: #surah/:surah/:ayah or #surah/:surah::ayah (e.g., #surah/6/12)
    const surahAyahMatch = pathPart.match(/^surah\/(\d+)[/:](\d+)$/);
    if (surahAyahMatch) {
      const surah = parseInt(surahAyahMatch[1], 10);
      const targetAyah = parseInt(surahAyahMatch[2], 10);
      const handler = this.routes.get('surah');
      if (handler) handler({ surah, targetAyah });
      return;
    }

    // 3. Surah View: #surah/:surah (with optional ?ayah= query parameter)
    const surahMatch = pathPart.match(/^surah\/(\d+)$/);
    if (surahMatch) {
      const surah = parseInt(surahMatch[1], 10);
      const targetAyah = queryParams.get('ayah') ? parseInt(queryParams.get('ayah'), 10) : null;
      const handler = this.routes.get('surah');
      if (handler) handler({ surah, targetAyah });
      return;
    }

    // 4. Short form Ayah: #6/12 or #6:12
    const shortAyahMatch = pathPart.match(/^(\d+)[/:](\d+)$/);
    if (shortAyahMatch) {
      const surah = parseInt(shortAyahMatch[1], 10);
      const targetAyah = parseInt(shortAyahMatch[2], 10);
      const handler = this.routes.get('surah');
      if (handler) handler({ surah, targetAyah });
      return;
    }

    // 5. Short form Surah: #6
    const shortSurahMatch = pathPart.match(/^(\d+)$/);
    if (shortSurahMatch) {
      const surah = parseInt(shortSurahMatch[1], 10);
      const targetAyah = queryParams.get('ayah') ? parseInt(queryParams.get('ayah'), 10) : null;
      const handler = this.routes.get('surah');
      if (handler) handler({ surah, targetAyah });
      return;
    }

    // 6. 15-Line Mushaf Page View: #mushaf/:page
    const mushafMatch = pathPart.match(/^mushaf\/(\d+)$/);
    if (mushafMatch) {
      const page = parseInt(mushafMatch[1], 10);
      const handler = this.routes.get('mushaf');
      if (handler) handler({ page });
      return;
    }

    // 7. Bookmarks View: #bookmarks
    if (pathPart === 'bookmarks') {
      const handler = this.routes.get('bookmarks');
      if (handler) handler();
      return;
    }

    // Default fallback
    const defaultHandler = this.routes.get('surah');
    if (defaultHandler) defaultHandler({ surah: 1, targetAyah: null });
  }
}

export const router = new Router();
