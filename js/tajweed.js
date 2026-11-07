/**
 * Maktabah Maftoohah Al-Quran - Color-Coded Tajweed Engine (tajweed.js)
 * Implements rule-based, authentic Uthmani script Tajweed colorization.
 * 
 * Invariants:
 * - Zero build dependencies (Vanilla ES6).
 * - Offline-first, fast regex tokenizer.
 * - Non-destructive: preserves original Arabic characters and diacritics.
 */

export const TAJWEED_LEGEND = [
  {
    id: 'madd',
    color: '#f43f5e',
    name_ar: 'المد الواجب / الجائز / اللازم',
    name_ms: 'Mad (4 – 6 Harakat)',
    name_en: 'Madd (4 – 6 Vowel Counts)',
    desc_ms: 'Pemanjangan suara pada huruf mad yang mempunyai tanda mad (~). Wajib dibaca 4 hingga 6 harakat.',
    desc_en: 'Prolongation of the vowel sound for letters with madd sign (~). Recited for 4 to 6 vowel counts.',
    example: 'السَّمَاۤءِ • الضَّآلِّينَ'
  },
  {
    id: 'ghunnah',
    color: '#06b6d4',
    name_ar: 'الغنة المشددة',
    name_ms: 'Ghunnah (Dengung 2 Harakat)',
    name_en: 'Ghunnah (Nasalization 2 Counts)',
    desc_ms: 'Dengung sempurna pada huruf Nun (نّ) atau Mim (مّ) bertasydid. Didengungkan selama 2 harakat.',
    desc_en: 'Nasalized drone on Nun (نّ) or Meem (مّ) with shaddah, held for 2 vowel counts.',
    example: 'إِنَّ • ثُمَّ'
  },
  {
    id: 'ikhfa',
    color: '#10b981',
    name_ar: 'الإخفاء الحقيقي',
    name_ms: 'Ikhfa\' Hakiki (Samar Dengung)',
    name_en: 'Ikhfa (Concealment)',
    desc_ms: 'Menyembunyikan bunyi Nun Sakinah atau Tanwin ke dalam 15 huruf ikhfa dengan dengung.',
    desc_en: 'Concealing the sound of Nun Sakinah or Tanween into one of the 15 Ikhfa letters with nasalization.',
    example: 'مِن قَبْلِ • كُنتُمْ'
  },
  {
    id: 'idgham',
    color: '#f59e0b',
    name_ar: 'الإدغام (بغنة / بغير غنة)',
    name_ms: 'Idgham (Memasukkan Bunyi)',
    name_en: 'Idgham (Merging)',
    desc_ms: 'Memasukkan bunyi huruf pertama ke dalam huruf kedua (huruf يرملون).',
    desc_en: 'Merging the first unvoweled letter into the subsequent letter of يرملون.',
    example: 'مَن يَّقُولُ • مِن رَّبِّهِمْ'
  },
  {
    id: 'qalqalah',
    color: '#38bdf8',
    name_ar: 'القلقلة',
    name_ms: 'Qalqalah (Lantunan Bunyi)',
    name_en: 'Qalqalah (Echoing / Bouncing)',
    desc_ms: 'Bunyi lantunan getaran pada huruf قطبجد semasa berbaris sukun atau wakaf.',
    desc_en: 'Echoing bounce produced on letters قطبجد when marked with sukun or at pause.',
    example: 'الفَلَقِ • أَحَدٌ • يَجْعَلْ'
  },
  {
    id: 'iqlab',
    color: '#a855f7',
    name_ar: 'الإقلاب',
    name_ms: 'Iqlab (Menukar Bunyi ke Mim)',
    name_en: 'Iqlab (Conversion to Meem)',
    desc_ms: 'Menukarkan sebutan Nun Sakinah atau Tanwin kepada Mim (م) sebelum huruf Ba.',
    desc_en: 'Converting the sound of Nun Sakinah or Tanween into Meem (م) before Ba.',
    example: 'مِنۢ بَعْدِ • أَنۢبِئْهُم'
  }
];

/**
 * Colorizes authentic Uthmani Quran text with standard Tajweed semantic spans.
 * @param {string} text - Raw authentic Uthmani verse or word text
 * @returns {string} HTML string with styled Tajweed span classes
 */
export function colorizeTajweed(text) {
  if (!text || typeof text !== 'string') return '';

  let html = text;

  // 1. Madd (~ marker: \u06e4 or \u0653 or \u0670 with maddah)
  // Example: ٱلسَّمَآءَ, أُوْلَٰٓئِكَ, جَاۤءَ
  html = html.replace(/([\u0621-\u064A\u0671\u0670][\u064B-\u065F]*[\u06E4\u0653][\u064B-\u065F]*)/g, 
    '<span class="tajweed-rule tajweed-madd" title="Mad (4-6 Harakat)">$1</span>');

  // 2. Iqlab (Nun or Tanween followed by small meem \u06E2 or \u06ED before Ba)
  // Example: مِنۢ بَعْدِ
  html = html.replace(/([\u0646\u064B\u064C\u064D][\u064B-\u065F]*[\u06E2\u06ED])/g,
    '<span class="tajweed-rule tajweed-iqlab" title="Iqlab">$1</span>');

  // 3. Ghunnah Mushaddadah (Nun or Meem with Shaddah: \u0651)
  // Example: إِنَّ, ثُمَّ
  html = html.replace(/([\u0646\u0645][\u064B-\u0650]?\u0651[\u064B-\u0650]?)/g,
    '<span class="tajweed-rule tajweed-ghunnah" title="Ghunnah (2 Harakat)">$1</span>');

  // 4. Qalqalah (قطبجد with sukun \u0652 or jazm \u06E1)
  // Example: قۡ, طۡ, بۡ, جۡ, دۡ
  html = html.replace(/([قطبجد][\u0652\u06E1])/g,
    '<span class="tajweed-rule tajweed-qalqalah" title="Qalqalah">$1</span>');

  // 5. Idgham (Nun sakinah or tanween followed by shaddah on Yaa, Raa, Meem, Laam, Waw, Nun)
  // Example: مِن رَّبِّهِمْ, مَن يَّشَاءُ
  html = html.replace(/([\u0646][\u0652\u06E1]?\s*[يرملون]\u0651)/g,
    '<span class="tajweed-rule tajweed-idgham" title="Idgham">$1</span>');

  // 6. Ikhfa' Hakiki (Nun sakinah or unvoweled Nun before 15 Ikhfa letters: ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك)
  html = html.replace(/([\u0646][\u0652\u06E1]?\s*[تثجGroupدذزسشصضطظفقك])/g,
    (match) => {
      if (match.includes('tajweed-')) return match;
      return `<span class="tajweed-rule tajweed-ikhfa" title="Ikhfa' Hakiki">${match}</span>`;
    });

  return html;
}
