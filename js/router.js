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

    // 1. Ayah Deep-Dive: #ayah/:surah/:ayah
    const ayahMatch = pathPart.match(/^ayah\/(\d+)\/(\d+)$/);
    if (ayahMatch) {
      const surah = parseInt(ayahMatch[1], 10);
      const ayah = parseInt(ayahMatch[2], 10);
      const handler = this.routes.get('ayah');
      if (handler) handler({ surah, ayah });
      return;
    }

    // 2. Surah View: #surah/:surah
    const surahMatch = pathPart.match(/^surah\/(\d+)$/);
    if (surahMatch) {
      const surah = parseInt(surahMatch[1], 10);
      const targetAyah = queryParams.get('ayah') ? parseInt(queryParams.get('ayah'), 10) : null;
      const handler = this.routes.get('surah');
      if (handler) handler({ surah, targetAyah });
      return;
    }

    // 3. Bookmarks View: #bookmarks
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
