/**
 * Maktabah Maftoohah Al-Quran - Configuration Module (config.js)
 * Manages cloud sync settings and client-side credentials.
 * Vanilla ES6, zero external dependencies.
 */

export const APP_CONFIG = {
  // Google OAuth 2.0 Web Client ID
  // Can be configured here or overridden by the user via the settings UI (saved in localStorage).
  defaultGoogleClientId: '850493350755-g12kg4snt6h6uacmgb40jcoqk3o6kmgt.apps.googleusercontent.com',
  googleDriveScope: 'https://www.googleapis.com/auth/drive.appdata',
  syncFileName: 'maktabah-quran-sync.json',
  corpusBaseUrl: 'https://maktabah-maftoohah.github.io/korpus-quran/',

  // Google Tag Manager / Analytics ID
  defaultAnalyticsId: 'GTM-W6BKLCZK',

  /**
   * Gets the active Google Analytics Measurement ID (from localStorage override, or default).
   */
  getAnalyticsId() {
    try {
      const stored = localStorage.getItem('maktabah_ga_id');
      if (stored && stored.trim()) return stored.trim();
    } catch {
      // ignore localStorage error
    }
    return this.defaultAnalyticsId;
  },

  /**
   * Sets a custom Google Analytics Measurement ID in localStorage.
   */
  setAnalyticsId(analyticsId) {
    try {
      if (analyticsId && analyticsId.trim()) {
        localStorage.setItem('maktabah_ga_id', analyticsId.trim());
      } else {
        localStorage.removeItem('maktabah_ga_id');
      }
    } catch (e) {
      console.warn('Failed to persist custom Analytics ID:', e);
    }
  },

  /**
   * Generates a corpus reference URL retaining the active interface language.
   */
  getCorpusUrl(lang = 'ms', hash = '') {
    const l = lang === 'en' ? 'en' : 'ms';
    const base = this.corpusBaseUrl.replace(/\/?$/, '/');
    const h = hash ? (hash.startsWith('#') ? hash : `#${hash}`) : '';
    return `${base}?lang=${l}${h}`;
  },

  /**
   * Gets the active Google Client ID (from localStorage override, or default).
   */
  getGoogleClientId() {
    try {
      const stored = localStorage.getItem('maktabah_gdrive_client_id');
      if (stored && stored.trim()) return stored.trim();
    } catch {
      // ignore localStorage error
    }
    return this.defaultGoogleClientId;
  },

  /**
   * Sets a custom Google Client ID in localStorage.
   */
  setGoogleClientId(clientId) {
    try {
      if (clientId && clientId.trim()) {
        localStorage.setItem('maktabah_gdrive_client_id', clientId.trim());
      } else {
        localStorage.removeItem('maktabah_gdrive_client_id');
      }
    } catch (e) {
      console.warn('Failed to persist custom Google Client ID:', e);
    }
  },
};
