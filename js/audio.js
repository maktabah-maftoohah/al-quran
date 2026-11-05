/**
 * Maktabah Maftoohah Al-Quran - Audio Engine
 * Manages EveryAyah streaming, Word-by-Word pronunciation, continuous surah playback,
 * auto-scroll, playback rate, and sticky mini-player controls.
 */

import { store } from './store.js';
import { storageDB } from './storage-db.js';

export const RECITERS = {
  Alafasy_128kbps: {
    id: 'Alafasy_128kbps',
    name: 'Mishary Rashid Alafasy',
    subtext: '128 kbps Murattal',
  },
  Husary_128kbps: {
    id: 'Husary_128kbps',
    name: 'Mahmoud Khalil Al-Husary',
    subtext: '128 kbps Murattal',
  },
  Abdul_Basit_Murattal_192kbps: {
    id: 'Abdul_Basit_Murattal_192kbps',
    name: 'Abdul Basit Abdul Samad',
    subtext: '192 kbps Murattal',
  },
};

class AudioEngine {
  constructor() {
    this.recitationAudio = new Audio();
    this.wbwAudio = new Audio();
    this.currentBlobUrl = null;

    this.state = {
      isPlaying: false,
      currentSurah: 1,
      currentAyah: 1,
      totalAyahs: 7,
      surahName: 'Al-Faatiha',
      isContinuous: false,
      activeWordLoc: null,
    };

    this.listeners = new Set();
    this.hifzRepeatTracker = 1;
    this.initAudioEvents();
  }

  initAudioEvents() {
    this.recitationAudio.addEventListener('play', () => {
      this.state.isPlaying = true;
      this.notify();
      this.highlightActiveVerse();
    });

    this.recitationAudio.addEventListener('pause', () => {
      this.state.isPlaying = false;
      this.notify();
    });

    this.recitationAudio.addEventListener('ended', () => {
      this.handleAyahEnded();
    });

    this.recitationAudio.addEventListener('error', (e) => {
      console.warn('Recitation audio error:', e);
      this.state.isPlaying = false;
      this.notify();
    });

    this.wbwAudio.addEventListener('ended', () => {
      this.state.activeWordLoc = null;
      this.notify();
    });
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  formatEveryAyahUrl(reciter, surah, ayah) {
    const s = String(surah).padStart(3, '0');
    const a = String(ayah).padStart(3, '0');
    return `https://everyayah.com/data/${reciter}/${s}${a}.mp3`;
  }

  formatWbwUrl(surah, ayah, wordPos) {
    const s = String(surah).padStart(3, '0');
    const a = String(ayah).padStart(3, '0');
    const w = String(wordPos).padStart(3, '0');
    return `https://audio.qurancdn.com/wbw/${s}_${a}_${w}.mp3`;
  }

  async playAyah(surah, ayah, options = {}) {
    const sNum = parseInt(surah, 10);
    const aNum = parseInt(ayah, 10);

    if (this.state.currentSurah !== sNum || this.state.currentAyah !== aNum) {
      this.hifzRepeatTracker = 1;
    }

    this.state.currentSurah = sNum;
    this.state.currentAyah = aNum;
    if (options.totalAyahs) this.state.totalAyahs = options.totalAyahs;
    if (options.surahName) this.state.surahName = options.surahName;
    if (options.continuous !== undefined) this.state.isContinuous = options.continuous;

    const reciter = store.settings.reciter || 'Alafasy_128kbps';
    const cdnUrl = this.formatEveryAyahUrl(reciter, sNum, aNum);

    // Revoke previous blob URL to prevent memory leaks
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }

    // Check IndexedDB audio cache first for instant offline playback
    let cachedBlob = null;
    try {
      cachedBlob = await storageDB.getAudio(reciter, sNum, aNum);
    } catch (e) {
      console.warn('IDB audio fetch error:', e);
    }

    if (cachedBlob) {
      this.currentBlobUrl = URL.createObjectURL(cachedBlob);
      this.recitationAudio.src = this.currentBlobUrl;
    } else {
      this.recitationAudio.src = cdnUrl;

      // Asynchronously cache into IndexedDB for future offline / instant replay
      fetch(cdnUrl)
        .then((res) => (res.ok ? res.blob() : null))
        .then((blob) => {
          if (blob) storageDB.saveAudio(reciter, sNum, aNum, blob);
        })
        .catch(() => {});
    }

    this.recitationAudio.playbackRate = store.settings.speed || 1.0;

    try {
      await this.recitationAudio.play();
      this.updateMediaSession();
    } catch (err) {
      console.error('Audio play error:', err);
    }
  }

  /**
   * Downloads and caches all verse audio files of a Surah into IndexedDB.
   */
  async downloadSurahAudio(surah, totalAyahs, onProgress) {
    const reciter = store.settings.reciter || 'Alafasy_128kbps';
    const sNum = parseInt(surah, 10);
    const total = parseInt(totalAyahs, 10);

    for (let a = 1; a <= total; a++) {
      if (onProgress) onProgress({ current: a, total, status: 'downloading' });
      const exists = await storageDB.getAudio(reciter, sNum, a);
      if (!exists) {
        const url = this.formatEveryAyahUrl(reciter, sNum, a);
        try {
          const res = await fetch(url);
          if (res.ok) {
            const blob = await res.blob();
            await storageDB.saveAudio(reciter, sNum, a, blob);
          }
        } catch (e) {
          console.warn(`Failed to download audio for ${sNum}:${a}:`, e);
        }
      }
    }
    if (onProgress) onProgress({ current: total, total, status: 'complete' });
  }

  async playWord(surah, ayah, wordPos) {
    const url = this.formatWbwUrl(surah, ayah, wordPos);
    this.state.activeWordLoc = `${surah}:${ayah}:${wordPos}`;
    this.notify();

    this.wbwAudio.src = url;
    try {
      await this.wbwAudio.play();
    } catch (e) {
      console.warn('Word audio playback failed:', e);
    }
  }

  pause() {
    this.recitationAudio.pause();
  }

  resume() {
    if (this.recitationAudio.src) {
      this.recitationAudio.play().catch(console.warn);
    } else {
      this.playAyah(this.state.currentSurah, this.state.currentAyah);
    }
  }

  togglePlayPause() {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  async nextAyah() {
    const surahs = await store.fetchSurahs();
    let sNum = this.state.currentSurah || 1;
    let aNum = this.state.currentAyah || 0;
    let total = this.state.totalAyahs || 7;
    let sName = this.state.surahName;

    // In Mushaf view, if no active verse on current page, pick first verse on page
    if (window.location.hash.startsWith('#mushaf')) {
      const activeSpan = document.querySelector('.mushaf-ayah-span.active-reciting');
      const allSpans = Array.from(document.querySelectorAll('.mushaf-ayah-span'));
      if (!activeSpan && allSpans.length > 0) {
        const first = allSpans[0];
        sNum = parseInt(first.getAttribute('data-surah'), 10);
        aNum = parseInt(first.getAttribute('data-ayah'), 10);
        const sMeta = surahs.find((item) => item.number === sNum);
        total = sMeta ? sMeta.total_ayahs : 7;
        sName = sMeta ? store.getSurahName(sMeta) : `Surah ${sNum}`;
        await this.playAyah(sNum, aNum, { continuous: true, totalAyahs: total, surahName: sName });
        return;
      }
    }

    if (aNum < total) {
      await this.playAyah(sNum, aNum + 1, {
        continuous: true,
        totalAyahs: total,
        surahName: sName,
      });
    } else if (sNum < 114) {
      const nextSurah = sNum + 1;
      const nextMeta = surahs.find((s) => s.number === nextSurah);
      const nextTotal = nextMeta ? nextMeta.total_ayahs : 7;
      const nextName = nextMeta ? store.getSurahName(nextMeta) : `Surah ${nextSurah}`;
      await this.playAyah(nextSurah, 1, {
        continuous: true,
        totalAyahs: nextTotal,
        surahName: nextName,
      });
    } else {
      this.pause();
      this.state.isContinuous = false;
      this.notify();
    }
  }

  async prevAyah() {
    const surahs = await store.fetchSurahs();
    let sNum = this.state.currentSurah || 1;
    let aNum = this.state.currentAyah || 1;
    let total = this.state.totalAyahs || 7;
    let sName = this.state.surahName;

    // In Mushaf view, if no active verse on current page, pick first verse on page
    if (window.location.hash.startsWith('#mushaf')) {
      const activeSpan = document.querySelector('.mushaf-ayah-span.active-reciting');
      const allSpans = Array.from(document.querySelectorAll('.mushaf-ayah-span'));
      if (!activeSpan && allSpans.length > 0) {
        const first = allSpans[0];
        sNum = parseInt(first.getAttribute('data-surah'), 10);
        aNum = parseInt(first.getAttribute('data-ayah'), 10);
        const sMeta = surahs.find((item) => item.number === sNum);
        total = sMeta ? sMeta.total_ayahs : 7;
        sName = sMeta ? store.getSurahName(sMeta) : `Surah ${sNum}`;
        await this.playAyah(sNum, aNum, { continuous: true, totalAyahs: total, surahName: sName });
        return;
      }
    }

    if (aNum > 1) {
      await this.playAyah(sNum, aNum - 1, {
        continuous: true,
        totalAyahs: total,
        surahName: sName,
      });
    } else if (sNum > 1) {
      const prevSurah = sNum - 1;
      const prevMeta = surahs.find((s) => s.number === prevSurah);
      const prevTotal = prevMeta ? prevMeta.total_ayahs : 7;
      const prevName = prevMeta ? store.getSurahName(prevMeta) : `Surah ${prevSurah}`;
      await this.playAyah(prevSurah, prevTotal, {
        continuous: true,
        totalAyahs: prevTotal,
        surahName: prevName,
      });
    }
  }

  handleAyahEnded() {
    const hifz = store.settings.hifz || {};

    // 1. Hifz Repetition Counter (repeat same ayah N times)
    if (hifz.active && hifz.repeatCount > 1) {
      if (this.hifzRepeatTracker < hifz.repeatCount) {
        this.hifzRepeatTracker++;
        const delay = (hifz.delaySeconds || 0) * 1000;
        if (delay > 0) {
          setTimeout(() => {
            this.playAyah(this.state.currentSurah, this.state.currentAyah, {
              continuous: this.state.isContinuous,
              totalAyahs: this.state.totalAyahs,
              surahName: this.state.surahName,
            });
          }, delay);
        } else {
          this.playAyah(this.state.currentSurah, this.state.currentAyah, {
            continuous: this.state.isContinuous,
            totalAyahs: this.state.totalAyahs,
            surahName: this.state.surahName,
          });
        }
        return;
      }
      this.hifzRepeatTracker = 1;
    }

    // 2. Single Ayah Loop
    if (store.settings.loopAyah) {
      this.playAyah(this.state.currentSurah, this.state.currentAyah, {
        continuous: this.state.isContinuous,
        totalAyahs: this.state.totalAyahs,
        surahName: this.state.surahName,
      });
      return;
    }

    // 3. Hifz Range Looper (e.g. Ayah 1 to 5)
    if (hifz.active && hifz.rangeEnd && this.state.currentAyah >= hifz.rangeEnd) {
      const targetStart = hifz.rangeStart || 1;
      const delay = (hifz.delaySeconds || 0) * 1000;
      setTimeout(() => {
        this.playAyah(this.state.currentSurah, targetStart, {
          continuous: true,
          totalAyahs: this.state.totalAyahs,
          surahName: this.state.surahName,
        });
      }, delay);
      return;
    }

    // 4. Continuous Playback with optional recitation delay pause
    if (this.state.isContinuous && this.state.currentAyah < this.state.totalAyahs) {
      const delay = (hifz.active ? (hifz.delaySeconds || 0) : 0) * 1000;
      if (delay > 0) {
        setTimeout(() => this.nextAyah(), delay);
      } else {
        this.nextAyah();
      }
    } else {
      this.state.isPlaying = false;
      this.notify();
    }
  }

  setSpeed(speed) {
    store.updateSettings({ speed });
    this.recitationAudio.playbackRate = speed;
    this.notify();
  }

  setReciter(reciterId) {
    store.updateSettings({ reciter: reciterId });
    if (this.state.isPlaying) {
      this.playAyah(this.state.currentSurah, this.state.currentAyah, {
        continuous: this.state.isContinuous,
        totalAyahs: this.state.totalAyahs,
        surahName: this.state.surahName,
      });
    } else {
      this.notify();
    }
  }

  highlightActiveVerse() {
    document.querySelectorAll('.verse-card').forEach((el) => el.classList.remove('playing'));
    const target = document.querySelector(`.verse-card[data-ayah="${this.state.currentAyah}"]`);
    if (target) {
      target.classList.add('playing');
      if (store.settings.autoScroll) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Synchronize 15-Line Madinah Mushaf View active verse
    document.querySelectorAll('.mushaf-ayah-span').forEach((el) => el.classList.remove('active-reciting'));
    const mushafTarget = document.querySelector(
      `.mushaf-ayah-span[data-surah="${this.state.currentSurah}"][data-ayah="${this.state.currentAyah}"]`
    );
    if (mushafTarget) {
      mushafTarget.classList.add('active-reciting');
      mushafTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (window.location.hash.startsWith('#mushaf')) {
      // Auto-turn Mushaf page when active verse transitions across page boundaries
      store.fetchPagesMeta().then(() => {
        const targetPage = store.getPageForAyah(this.state.currentSurah, this.state.currentAyah);
        if (targetPage) {
          const curMatch = window.location.hash.match(/#mushaf\/(\d+)/);
          const curP = curMatch ? parseInt(curMatch[1], 10) : 1;
          if (targetPage !== curP) {
            window.location.hash = `#mushaf/${targetPage}`;
          }
        }
      });
    }
  }

  updateMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `Ayah ${this.state.currentAyah} - ${this.state.surahName}`,
        artist: RECITERS[store.settings.reciter]?.name || 'Quran Recitation',
        album: 'Maktabah Maftoohah Al-Quran',
      });

      navigator.mediaSession.setActionHandler('play', () => this.resume());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.prevAyah());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.nextAyah());
    }
  }
}

export const audio = new AudioEngine();
