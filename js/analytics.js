/**
 * Maktabah Maftoohah Al-Quran - Analytics Module (analytics.js)
 * Google Tag Manager (GTM) and Google Analytics 4 (GA4) integration
 * with SPA virtual pageview tracking and specialized Islamic event metrics.
 * 
 * Invariants:
 * - Zero external build dependencies (Vanilla ES6).
 * - Offline-first resilient: fails silently when offline without throwing errors.
 * - Respects Do Not Track (DNT) header.
 * - Dual GTM dataLayer & gtag compatibility.
 */

import { APP_CONFIG } from './config.js';

class AnalyticsService {
  constructor() {
    this.initialized = false;
    this.measurementId = null;
    this.lastTrackedPath = null;
  }

  /**
   * Initialize GTM/GA4 snippet dynamically if measurement ID is valid and not a placeholder.
   */
  init(customId = null) {
    if (this.initialized) return;

    this.measurementId = customId || APP_CONFIG.getAnalyticsId();

    // Do nothing if placeholder or unset
    if (!this.measurementId || this.measurementId === 'G-XXXXXXXXXX') {
      return;
    }

    // Respect Do-Not-Track
    if (typeof navigator !== 'undefined') {
      const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
      if (dnt === '1' || dnt === 'yes') {
        return;
      }
    }

    // Ensure dataLayer & gtag exist
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function() {
      window.dataLayer.push(arguments);
    };

    // Check if GTM or GA4 is already embedded in the DOM via static script tag
    const existingScript = document.querySelector('script[src*="googletagmanager.com/gtm.js"], script[src*="googletagmanager.com/gtag/js"]');

    if (!existingScript) {
      // Avoid network request when offline
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        if (typeof window !== 'undefined') {
          window.addEventListener('online', () => this.init(this.measurementId), { once: true });
        }
        return;
      }

      try {
        const isGtm = this.measurementId.startsWith('GTM-');
        const scriptUrl = isGtm
          ? `https://www.googletagmanager.com/gtm.js?id=${this.measurementId}`
          : `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;

        if (!isGtm) {
          window.gtag('js', new Date());
          window.gtag('config', this.measurementId, {
            send_page_view: false,
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure'
          });
        }

        const script = document.createElement('script');
        script.async = true;
        script.src = scriptUrl;
        script.onerror = () => {};
        document.head.appendChild(script);
      } catch {
        // Safe fail
      }
    }

    this.initialized = true;

    // Track initial route once DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.trackCurrentRoute());
    } else {
      this.trackCurrentRoute();
    }
  }

  /**
   * Dispatches custom event to GTM dataLayer and GA4 safely.
   */
  trackEvent(eventName, params = {}) {
    const payload = {
      ...params,
      app_name: 'Maktabah Maftoohah Al-Quran'
    };

    // Push event to GTM dataLayer
    try {
      if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
          event: eventName,
          ...payload
        });
      }
    } catch {
      // Silent error handling for offline/sandboxed contexts
    }

    // Also call gtag if present
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      try {
        window.gtag('event', eventName, payload);
      } catch {
        // Silent
      }
    }
  }

  /**
   * Tracks a virtual pageview for SPA hash routes (e.g. /al-quran/#surah/1).
   */
  trackPageView(pagePath, pageTitle) {
    const path = pagePath || (window.location.pathname + window.location.hash);
    if (path === this.lastTrackedPath) return;
    this.lastTrackedPath = path;

    const title = pageTitle || document.title || 'Maktabah Maftoohah Al-Quran';
    const payload = {
      page_path: path,
      page_title: title,
      page_location: window.location.href,
      app_name: 'Maktabah Maftoohah Al-Quran'
    };

    // Push to GTM dataLayer
    try {
      if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
          event: 'page_view',
          ...payload
        });
      }
    } catch {
      // Safe fail
    }

    // Dispatch via gtag
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      try {
        window.gtag('event', 'page_view', payload);
      } catch {
        // Safe fail
      }
    }
  }

  trackCurrentRoute() {
    this.trackPageView(window.location.pathname + (window.location.hash || '#surah/1'));
  }

  // Specialized Islamic event helpers
  trackSurahView(surahNumber, surahName = '') {
    this.trackEvent('view_surah', {
      surah_number: Number(surahNumber),
      surah_name: surahName
    });
  }

  trackAyahView(surahNumber, ayahNumber) {
    this.trackEvent('view_ayah', {
      surah_number: Number(surahNumber),
      ayah_number: Number(ayahNumber)
    });
  }

  trackMushafPage(pageNumber) {
    this.trackEvent('view_mushaf_page', {
      page_number: Number(pageNumber)
    });
  }

  trackAudioPlay(surahNumber, ayahNumber, reciterId) {
    this.trackEvent('play_audio', {
      surah_number: Number(surahNumber),
      ayah_number: Number(ayahNumber),
      reciter_id: reciterId
    });
  }

  trackSearch(query, resultCount = 0) {
    if (!query || !query.trim()) return;
    this.trackEvent('search', {
      search_term: query.trim(),
      result_count: resultCount
    });
  }

  trackTranslationChange(translationId) {
    this.trackEvent('change_translation', {
      translation_id: translationId
    });
  }

  trackBookmarkAdd(surahNumber, ayahNumber) {
    this.trackEvent('add_bookmark', {
      surah_number: Number(surahNumber),
      ayah_number: Number(ayahNumber)
    });
  }

  trackAsbabunNuzulView(surahNumber, ayahNumber) {
    this.trackEvent('view_asbabun_nuzul', {
      surah_number: Number(surahNumber),
      ayah_number: Number(ayahNumber)
    });
  }
}

export const analytics = new AnalyticsService();
