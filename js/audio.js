/**
 * Maktabah Maftoohah Al-Quran - Audio Engine
 * Manages EveryAyah streaming, Word-by-Word pronunciation, continuous surah playback,
 * auto-scroll, playback rate, and sticky mini-player controls.
 */

import { store } from './store.js';

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

    this.state.currentSurah = sNum;
    this.state.currentAyah = aNum;
    if (options.totalAyahs) this.state.totalAyahs = options.totalAyahs;
    if (options.surahName) this.state.surahName = options.surahName;
    if (options.continuous !== undefined) this.state.isContinuous = options.continuous;

    const reciter = store.settings.reciter || 'Alafasy_128kbps';
    const url = this.formatEveryAyahUrl(reciter, sNum, aNum);

    this.recitationAudio.src = url;
    this.recitationAudio.playbackRate = store.settings.speed || 1.0;

    try {
      await this.recitationAudio.play();
      this.updateMediaSession();
    } catch (err) {
      console.error('Audio play error:', err);
    }
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

  nextAyah() {
    if (this.state.currentAyah < this.state.totalAyahs) {
      this.playAyah(this.state.currentSurah, this.state.currentAyah + 1, {
        continuous: this.state.isContinuous,
        totalAyahs: this.state.totalAyahs,
        surahName: this.state.surahName,
      });
    } else {
      this.pause();
      this.state.isContinuous = false;
      this.notify();
    }
  }

  prevAyah() {
    if (this.state.currentAyah > 1) {
      this.playAyah(this.state.currentSurah, this.state.currentAyah - 1, {
        continuous: this.state.isContinuous,
        totalAyahs: this.state.totalAyahs,
        surahName: this.state.surahName,
      });
    }
  }

  handleAyahEnded() {
    if (store.settings.loopAyah) {
      this.playAyah(this.state.currentSurah, this.state.currentAyah, {
        continuous: this.state.isContinuous,
        totalAyahs: this.state.totalAyahs,
        surahName: this.state.surahName,
      });
      return;
    }

    if (this.state.isContinuous && this.state.currentAyah < this.state.totalAyahs) {
      this.nextAyah();
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
