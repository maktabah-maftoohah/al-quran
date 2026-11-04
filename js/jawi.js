/**
 * Maktabah Maftoohah Al-Quran - Jawi Script Engine
 * Translates Rumi (Latin Malay) to traditional Jawi (Arabic-script Malay).
 */

const JAWI_DICTIONARY = {
  allah: 'الله',
  dan: 'دان',
  yang: 'يڠ',
  ini: 'اين',
  itu: 'ايت',
  dengan: 'دڠن',
  nama: 'نام',
  kepada: 'كڤد',
  dari: 'دري',
  daripada: 'درڤد',
  pada: 'ڤد',
  di: 'د',
  ke: 'ک',
  oleh: 'اوليه',
  untuk: 'اونتوق',
  iaitu: 'ياءيت',
  maha: 'مها',
  pemurah: 'ڤموره',
  lagi: 'لاݢي',
  penyayang: 'ڤڽايڠ',
  pengasih: 'ڤڠاسيه',
  segala: 'سݢالا',
  puji: 'ڤوجي',
  tertentu: 'ترتنتو',
  bagi: 'باݢي',
  tuhan: 'توهن',
  sekalian: 'سكالين',
  alam: 'عالم',
  hari: 'هاري',
  pembalasan: 'ڤمبالسن',
  engkau: 'اڠكاو',
  kami: 'كامي',
  sembah: 'سمبه',
  minta: 'مينتا',
  pertolongan: 'ڤرتولوڠن',
  tunjuklah: 'تونجوقله',
  jalan: 'جالن',
  lurus: 'لوروس',
  mereka: 'مريك',
  telah: 'تله',
  beri: 'بري',
  nikmat: 'نعمت',
  bukan: 'بوكن',
  dimurkai: 'دموركاءي',
  sesat: 'سست',
  katakanlah: 'كاتاكنله',
  wahai: 'واهاي',
  muhammad: 'محمد',
  dialah: 'دياله',
  esa: 'اسا',
  tunggal: 'توڠݢل',
  tempat: 'تمڤت',
  meminta: 'ممينتا',
  segala: 'سݢالا',
  hajat: 'حاجة',
  ia: 'اي',
  tiada: 'تياد',
  beranak: 'برانق',
  dan: 'دان',
  tidak: 'تيدق',
  pula: 'ڤولا',
  diperanakkan: 'دڤرانقكن',
  setara: 'ستارا',
  sesiapapun: 'سسياڤاڤون',
  berlindung: 'برليندوڠ',
  subuh: 'صبح',
  kejahatan: 'كجاهتن',
  makhluk: 'مخلوق',
  malam: 'ملم',
  apabila: 'اڤابيلا',
  gelap: 'ݢلڤ',
  gulita: 'ݢوليتا',
  ahli: 'اهلي',
  sihir: 'سحير',
  meniup: 'منيول',
  ikatan: 'ايكتن',
  orang: 'اورڠ',
  dengki: 'دڠكي',
  manusia: 'ماءنسي',
  raja: 'راج',
  sembahan: 'سمبهن',
  bisikan: 'بيسيكن',
  syaitan: 'شيطان',
  yang: 'يڠ',
  bersembunyi: 'برسمبوڽي',
  membisikkan: 'ممبيسيقكن',
  dalam: 'دالم',
  dada: 'دادا',
  golongan: 'ݢولوڠن',
  jin: 'جين',
};

export function rumiToJawi(text) {
  if (!text) return '';

  return text
    .split(/(\s+|[.,!?:;"'()\-–—]+)/)
    .map((token) => {
      if (!token || /^\s+$/.test(token) || /^[.,!?:;"'()\-–—]+$/.test(token)) {
        return token;
      }

      const cleanLower = token.toLowerCase().replace(/[^a-z]/g, '');
      if (JAWI_DICTIONARY[cleanLower]) {
        return JAWI_DICTIONARY[cleanLower];
      }

      // Phonetic fallback transliteration
      return transliterateWord(cleanLower);
    })
    .join('');
}

function transliterateWord(word) {
  if (!word) return '';

  let res = '';
  let i = 0;
  const len = word.length;

  while (i < len) {
    const pair = word.slice(i, i + 2);
    if (pair === 'ng') {
      res += 'ڠ';
      i += 2;
      continue;
    }
    if (pair === 'ny') {
      res += 'ڽ';
      i += 2;
      continue;
    }
    if (pair === 'sy') {
      res += 'ش';
      i += 2;
      continue;
    }
    if (pair === 'kh') {
      res += 'خ';
      i += 2;
      continue;
    }
    if (pair === 'gh') {
      res += 'غ';
      i += 2;
      continue;
    }

    const c = word[i];
    switch (c) {
      case 'b': res += 'ب'; break;
      case 'c': res += 'چ'; break;
      case 'd': res += 'د'; break;
      case 'f': res += 'ف'; break;
      case 'g': res += 'ݢ'; break;
      case 'h': res += 'ه'; break;
      case 'j': res += 'ج'; break;
      case 'k': res += (i === len - 1) ? 'ق' : 'ك'; break;
      case 'l': res += 'ل'; break;
      case 'm': res += 'م'; break;
      case 'n': res += 'ن'; break;
      case 'p': res += 'ڤ'; break;
      case 'q': res += 'ق'; break;
      case 'r': res += 'ر'; break;
      case 's': res += 'س'; break;
      case 't': res += 'ت'; break;
      case 'v': res += 'ۏ'; break;
      case 'w': res += 'و'; break;
      case 'y': res += 'ي'; break;
      case 'z': res += 'ز'; break;
      case 'a': res += (i === 0) ? 'ا' : 'ا'; break;
      case 'i': res += (i === 0) ? 'اي' : 'ي'; break;
      case 'u': res += (i === 0) ? 'او' : 'و'; break;
      case 'o': res += (i === 0) ? 'او' : 'و'; break;
      case 'e':
        if (i === 0) res += 'اي';
        break;
      default:
        res += c;
    }
    i++;
  }

  return res;
}
