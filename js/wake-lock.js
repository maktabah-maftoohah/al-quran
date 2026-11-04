/**
 * Maktabah Maftoohah Al-Quran - Screen Wake Lock Controller (wake-lock.js)
 * Prevents device screen dimming and auto-locking during recitation, Hifz, and reading.
 */

class WakeLockController {
  constructor() {
    this.wakeLock = null;
    this.isEnabled = false;
    this.init();
  }

  init() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', async () => {
        if (this.isEnabled && document.visibilityState === 'visible' && !this.wakeLock) {
          await this.request();
        }
      });
    }
  }

  isSupported() {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  }

  async request() {
    if (!this.isSupported()) return false;
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.isEnabled = true;
      this.wakeLock.addEventListener('release', () => {
        this.wakeLock = null;
      });
      return true;
    } catch (err) {
      console.warn('Wake lock error:', err);
      this.wakeLock = null;
      return false;
    }
  }

  async release() {
    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
      } catch (err) {
        console.warn('Wake lock release error:', err);
      }
      this.wakeLock = null;
    }
    this.isEnabled = false;
  }

  async toggle() {
    if (this.isActive()) {
      await this.release();
      return false;
    } else {
      return await this.request();
    }
  }

  isActive() {
    return this.wakeLock !== null;
  }
}

export const wakeLockController = new WakeLockController();
