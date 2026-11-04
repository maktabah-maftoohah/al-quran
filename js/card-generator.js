/**
 * Maktabah Maftoohah Al-Quran - Verse Card Generator
 * Uses HTML5 Canvas to render social-shareable high-resolution cards.
 */

export class VerseCardGenerator {
  constructor() {
    this.modal = null;
    this.canvas = null;
    this.currentData = null;
  }

  init() {
    this.modal = document.getElementById('verse-card-modal');
    this.canvas = document.getElementById('verse-card-canvas');

    if (!this.modal || !this.canvas) return;

    // Close button & overlay click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal || e.target.closest('[data-action="close-card-modal"]')) {
        this.close();
      }
    });

    // Ratio change
    const ratioSelect = document.getElementById('card-ratio-select');
    if (ratioSelect) {
      ratioSelect.addEventListener('change', () => {
        if (this.currentData) {
          this.currentData.ratio = ratioSelect.value;
          this.drawCard();
        }
      });
    }

    // Download button
    const downloadBtn = document.getElementById('btn-download-card');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.downloadCard());
    }

    // Copy to clipboard
    const copyBtn = document.getElementById('btn-copy-card-image');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyToClipboard());
    }

    // Native Web Share API
    const shareBtn = document.getElementById('btn-share-card-native');
    if (shareBtn) {
      if (typeof navigator !== 'undefined' && navigator.share) {
        shareBtn.addEventListener('click', () => this.shareNative());
      } else {
        shareBtn.style.display = 'none';
      }
    }
  }

  open(data) {
    this.currentData = {
      ar: data.ar || '',
      trans: data.trans || '',
      transLabel: data.transLabel || 'Translation',
      surahName: data.surahName || 'Al-Quran',
      ref: data.ref || '1:1',
      ratio: document.getElementById('card-ratio-select')?.value || '1:1',
    };

    if (this.modal) {
      this.modal.classList.add('open');
      this.drawCard();
    }
  }

  close() {
    if (this.modal) {
      this.modal.classList.remove('open');
    }
  }

  drawCard() {
    if (!this.canvas || !this.currentData) return;
    const ctx = this.canvas.getContext('2d');
    const isStory = this.currentData.ratio === '9:16';

    const width = 1080;
    const height = isStory ? 1920 : 1080;
    this.canvas.width = width;
    this.canvas.height = height;

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0a0e17');
    bgGrad.addColorStop(0.5, '#131b2e');
    bgGrad.addColorStop(1, '#070a10');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle radial glow
    const radial = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.75);
    radial.addColorStop(0, 'rgba(16, 185, 129, 0.08)');
    radial.addColorStop(0.5, 'rgba(245, 158, 11, 0.04)');
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    // 2. Ornamental Border
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 4;
    const padding = 54;
    ctx.strokeRect(padding, padding, width - padding * 2, height - padding * 2);

    // Inner subtle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(padding + 16, padding + 16, width - (padding + 16) * 2, height - (padding + 16) * 2);

    // Corner decorative accents
    this.drawCornerOrnament(ctx, padding + 16, padding + 16);
    this.drawCornerOrnament(ctx, width - padding - 16, padding + 16);
    this.drawCornerOrnament(ctx, padding + 16, height - padding - 16);
    this.drawCornerOrnament(ctx, width - padding - 16, height - padding - 16);

    // 3. Top Header Badge: Surah Name & Ref
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 34px Inter, sans-serif';
    ctx.textAlign = 'center';
    const topY = isStory ? 240 : 160;
    ctx.fillText(`${this.currentData.surahName.toUpperCase()} • ${this.currentData.ref}`, width / 2, topY);

    // Top ornamental divider
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 140, topY + 28);
    ctx.lineTo(width / 2 + 140, topY + 28);
    ctx.stroke();

    // 4. Center Arabic Text
    ctx.fillStyle = '#f8fafc';
    ctx.font = '56px Amiri, Scheherazade New, serif';
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';

    const maxTextWidth = width - 240;
    const arLines = this.wrapText(ctx, this.currentData.ar, maxTextWidth);
    const arLineHeight = 90;
    let currentY = isStory ? height * 0.32 : height * 0.36;

    for (const line of arLines) {
      ctx.fillText(line, width / 2, currentY);
      currentY += arLineHeight;
    }

    // 5. Divider
    currentY += 20;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 80, currentY);
    ctx.lineTo(width / 2 + 80, currentY);
    ctx.stroke();
    currentY += 50;

    // 6. Translation Text
    ctx.direction = 'ltr';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(241, 245, 249, 0.88)';
    ctx.font = '32px Inter, sans-serif';

    const transLines = this.wrapText(ctx, `"${this.currentData.trans}"`, maxTextWidth);
    const transLineHeight = 52;

    for (const line of transLines.slice(0, 7)) {
      ctx.fillText(line, width / 2, currentY);
      currentY += transLineHeight;
    }

    // Translation source badge
    currentY += 15;
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 24px Inter, sans-serif';
    ctx.fillText(this.currentData.transLabel, width / 2, currentY);

    // 7. Footer Watermark
    ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
    ctx.font = '600 24px Inter, sans-serif';
    const footerY = height - (padding + 34);
    ctx.fillText('MAKTABAH MAFTOOHAH • AL-QURAN', width / 2, footerY);
  }

  drawCornerOrnament(ctx, x, y) {
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  downloadCard() {
    if (!this.canvas || !this.currentData) return;
    const link = document.createElement('a');
    link.download = `quran_${this.currentData.ref.replace(':', '_')}.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  async copyToClipboard() {
    if (!this.canvas) return;
    this.canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        if (window.app && window.app.showToast) {
          window.app.showToast('Verse card copied to clipboard!');
        }
      } catch (e) {
        if (window.app && window.app.showToast) {
          window.app.showToast('Could not copy image directly to clipboard.');
        }
      }
    });
  }

  async shareNative() {
    if (!this.canvas || !this.currentData) return;
    this.canvas.toBlob(async (blob) => {
      if (!blob) return;
      const filename = `quran_${this.currentData.ref.replace(':', '_')}.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `Surah ${this.currentData.surahName} (${this.currentData.ref})`,
            text: `Al-Quran — Surah ${this.currentData.surahName} [${this.currentData.ref}]\n${this.currentData.trans}`,
            files: [file],
          });
          return;
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.warn('Share error:', err);
          }
        }
      } else if (navigator.share) {
        try {
          await navigator.share({
            title: `Surah ${this.currentData.surahName} (${this.currentData.ref})`,
            text: `Al-Quran — Surah ${this.currentData.surahName} [${this.currentData.ref}]\n${this.currentData.ar}\n\n${this.currentData.trans}`,
            url: window.location.href,
          });
          return;
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.warn('Share error:', err);
          }
        }
      } else {
        this.downloadCard();
      }
    });
  }
}

export const cardGenerator = new VerseCardGenerator();
