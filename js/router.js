/**
 * Maktabah Maftoohah Al-Quran - Router Module
 * Handles hash changes, query parameters, and dispatches view transitions.
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

  async init() {
    // 1. Process path-based routes like /al-quran/69/47 or /69/47 if no hash is specified
    if (!window.location.hash) {
      const pathname = window.location.pathname;
      let subPath = pathname;
      if (pathname.startsWith('/al-quran')) {
        subPath = pathname.slice('/al-quran'.length);
      }
      subPath = subPath.replace(/^\/+|\/+$/g, '');
      if (subPath && subPath !== 'index.html' && subPath !== '404.html' && !subPath.includes('.')) {
        const pathAyahMatch = subPath.match(/^([^/:]+)[/:](\d+)$/);
        if (pathAyahMatch) {
          const s = await store.resolveSurahNumber(pathAyahMatch[1]);
          if (s) {
            window.location.hash = `#${s}:${pathAyahMatch[2]}`;
            return;
          }
        }
        const pathSurahMatch = subPath.match(/^(?:surah\/)?([^/:]+)$/);
        if (pathSurahMatch && pathSurahMatch[1] !== 'bookmarks' && !pathSurahMatch[1].startsWith('mushaf')) {
          const s = await store.resolveSurahNumber(pathSurahMatch[1]);
          if (s) {
            window.location.hash = `#surah/${s}`;
            return;
          }
        }
      }
    }

    // 2. Process query parameters in URL if no hash is specified (e.g. ?surah=2&ayah=255, ?ref=2:255, ?ayah=2:255)
    if (!window.location.hash && window.location.search) {
      const sp = new URLSearchParams(window.location.search);
      let s = sp.get('surah') || sp.get('s');
      let a = sp.get('ayah') || sp.get('a');
      const ref = sp.get('ref') || sp.get('q');
      const view = sp.get('view'); // 'deep' / 'ayah' or 'surah'

      if (ref && (ref.includes(':') || ref.includes('/'))) {
        const parts = ref.split(/[:/]/);
        s = s || parts[0];
        a = a || parts[1];
      } else if (a && (a.includes(':') || a.includes('/'))) {
        const parts = a.split(/[:/]/);
        s = parts[0];
        a = parts[1];
      }

      if (s) {
        const resolvedS = await store.resolveSurahNumber(s);
        if (resolvedS) {
          const targetA = a ? parseInt(a, 10) : null;
          const targetHash = (view === 'deep' || view === 'ayah') && targetA
            ? `#ayah/${resolvedS}/${targetA}`
            : targetA
            ? `#${resolvedS}:${targetA}`
            : `#surah/${resolvedS}`;
          
          window.location.hash = targetHash;
          return;
        }
      }
    }

    if (!window.location.hash) {
      const last = store.getLastRead();
      const initialSurah = last ? last.surah : 1;
      window.location.hash = `#surah/${initialSurah}`;
    } else {
      await this.handleRouting();
    }
  }

  async handleRouting() {
    const rawHash = window.location.hash.slice(1) || 'surah/1';
    const [pathPart, queryPart] = rawHash.split('?');
    const queryParams = new URLSearchParams(queryPart || '');

    // 1. Ayah Deep-Dive: #ayah/:surah/:ayah or #ayah/:surah::ayah or #ayah/:surah-:ayah
    const ayahMatch = pathPart.match(/^ayah\/([^/:]+)[/:-](\d+)$/);
    if (ayahMatch) {
      const surah = await store.resolveSurahNumber(ayahMatch[1]);
      const ayah = parseInt(ayahMatch[2], 10);
      const tab = queryParams.get('tab');
      const handler = this.routes.get('ayah');
      if (handler && surah) {
        handler({ surah, ayah, tab });
        return;
      }
    }

    // 2. Direct Surah Ayah Link: #surah/:surah/:ayah or #surah/:surah::ayah
    const surahAyahMatch = pathPart.match(/^surah\/([^/:]+)[/:-](\d+)$/);
    if (surahAyahMatch) {
      const surah = await store.resolveSurahNumber(surahAyahMatch[1]);
      const targetAyah = parseInt(surahAyahMatch[2], 10);
      const handler = this.routes.get('surah');
      if (handler && surah) {
        handler({ surah, targetAyah });
        return;
      }
    }

    // 3. Surah View: #surah/:surah (with optional ?ayah= query parameter)
    const surahMatch = pathPart.match(/^surah\/([^/:]+)$/);
    if (surahMatch) {
      const surah = await store.resolveSurahNumber(surahMatch[1]);
      const targetAyah = queryParams.get('ayah') ? parseInt(queryParams.get('ayah'), 10) : null;
      const handler = this.routes.get('surah');
      if (handler && surah) {
        handler({ surah, targetAyah });
        return;
      }
    }

    // 4. Short form Ayah: #2:255, #2/255, #2-255 or #al-baqarah:255
    const shortAyahMatch = pathPart.match(/^([^/:]+)[/:-](\d+)$/);
    if (shortAyahMatch) {
      const surah = await store.resolveSurahNumber(shortAyahMatch[1]);
      const targetAyah = parseInt(shortAyahMatch[2], 10);
      const handler = this.routes.get('surah');
      if (handler && surah) {
        handler({ surah, targetAyah });
        return;
      }
    }

    // 5. Short form Surah: #6 or #al-kahf
    const shortSurahMatch = pathPart.match(/^([^/:]+)$/);
    if (shortSurahMatch && pathPart !== 'bookmarks' && !pathPart.startsWith('mushaf')) {
      const surah = await store.resolveSurahNumber(shortSurahMatch[1]);
      if (surah) {
        const targetAyah = queryParams.get('ayah') ? parseInt(queryParams.get('ayah'), 10) : null;
        const handler = this.routes.get('surah');
        if (handler) {
          handler({ surah, targetAyah });
          return;
        }
      }
    }

    // 6. 15-Line Mushaf Page View: #mushaf/:page
    const mushafMatch = pathPart.match(/^mushaf(?:\/(\d+))?$/);
    if (mushafMatch) {
      const page = mushafMatch[1] ? parseInt(mushafMatch[1], 10) : (store.getLastMushafPage() || 1);
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
