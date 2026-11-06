/**
 * Maktabah Maftoohah Al-Quran - Dedicated Search Web Worker (search-worker.js)
 * Executes full-text search, Arabic diacritic stripping, and keyword matching
 * completely off the main UI thread for guaranteed 60fps responsiveness.
 */

let searchIndex = null;
let asbabData = null;
let verseMap = null;

function getSnippet(text, query, maxLen = 140) {
  if (!text) return '';
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) {
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
  }
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + query.length + 60);
  const prefix = start > 0 ? '...' : '';
  const suffix = end < text.length ? '...' : '';
  return highlightMatch(prefix + text.slice(start, end) + suffix, query);
}

function normalizeArabic(text) {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/\s+/g, ' ')
    .trim();
}

function highlightMatch(text, query) {
  if (!text || !query) return text || '';
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

self.onmessage = async (e) => {
  const { action, id, data } = e.data;

  if (action === 'INIT_INDEX') {
    if (data && data.index) {
      searchIndex = data.index;
      asbabData = data.asbab || null;
    } else {
      searchIndex = data;
    }
    verseMap = null;
    self.postMessage({ action: 'INDEX_READY', id });
    return;
  }

  if (action === 'SEARCH') {
    const { query, limit = 40 } = data;
    if (!query || !query.trim()) {
      self.postMessage({ action: 'SEARCH_RESULTS', id, results: [] });
      return;
    }

    if (!searchIndex || !searchIndex.length) {
      self.postMessage({ action: 'SEARCH_RESULTS', id, results: [] });
      return;
    }

    const trimmed = query.trim();
    const jumpMatch = trimmed.match(/^(\d{1,3}):(\d{1,3})$/);

    // 1. Direct Verse Jump Regex Match (e.g. 112:1)
    if (jumpMatch) {
      const s = parseInt(jumpMatch[1], 10);
      const a = parseInt(jumpMatch[2], 10);
      const match = searchIndex.find((item) => item.s === s && item.a === a);
      if (match) {
        self.postMessage({
          action: 'SEARCH_RESULTS',
          id,
          results: [
            {
              ...match,
              isJump: true,
              highlightedAr: match.ar,
              highlightedMs: match.ms,
              highlightedEn: match.en,
            },
          ],
        });
        return;
      }
    }

    // 2. Multi-language and Arabic text search
    const qLower = trimmed.toLowerCase();
    const qNormArabic = normalizeArabic(trimmed);
    const results = [];

    for (let i = 0; i < searchIndex.length; i++) {
      const item = searchIndex[i];
      let matched = false;
      let matchField = null;

      // Arabic match
      if (qNormArabic && item.ar && normalizeArabic(item.ar).includes(qNormArabic)) {
        matched = true;
        matchField = 'ar';
      }
      // English match
      else if (item.en && item.en.toLowerCase().includes(qLower)) {
        matched = true;
        matchField = 'en';
      }
      // Malay match
      else if (item.ms && item.ms.toLowerCase().includes(qLower)) {
        matched = true;
        matchField = 'ms';
      }
      // Indonesian match
      else if (item.id && item.id.toLowerCase().includes(qLower)) {
        matched = true;
        matchField = 'id';
      }

      if (matched) {
        results.push({
          ref: item.ref,
          s: item.s,
          a: item.a,
          ar: item.ar,
          ms: item.ms,
          en: item.en,
          id: item.id,
          matchField,
          highlightedAr: matchField === 'ar' ? highlightMatch(item.ar, trimmed) : item.ar,
          highlightedMs: matchField === 'ms' ? highlightMatch(item.ms, trimmed) : item.ms,
          highlightedEn: matchField === 'en' ? highlightMatch(item.en, trimmed) : item.en,
          highlightedId: matchField === 'id' ? highlightMatch(item.id, trimmed) : item.id,
        });

        if (results.length >= limit) break;
      }
    }

    // 3. Search Asbabun Nuzul Narratives (historical context matching)
    if (asbabData && results.length < limit) {
      if (!verseMap && searchIndex) {
        verseMap = new Map();
        for (let j = 0; j < searchIndex.length; j++) {
          verseMap.set(`${searchIndex[j].s}:${searchIndex[j].a}`, searchIndex[j]);
        }
      }
      const existingKeys = new Set(results.map((r) => `${r.s}:${r.a}`));
      for (const k in asbabData) {
        if (results.length >= limit) break;
        const entry = asbabData[k];
        let asbabMatched = false;
        let matchedText = '';
        if (entry.text && entry.text.toLowerCase().includes(qLower)) {
          asbabMatched = true;
          matchedText = entry.text;
        } else if (entry.text_en && entry.text_en.toLowerCase().includes(qLower)) {
          asbabMatched = true;
          matchedText = entry.text_en;
        } else if (qNormArabic && entry.arabic && normalizeArabic(entry.arabic).includes(qNormArabic)) {
          asbabMatched = true;
          matchedText = entry.arabic;
        } else if (entry.source && entry.source.toLowerCase().includes(qLower)) {
          asbabMatched = true;
          matchedText = `${entry.source}: ${entry.text || ''}`;
        }

        if (asbabMatched) {
          const verseKey = `${entry.surah}:${entry.ayah}`;
          const snippet = getSnippet(matchedText, trimmed);
          if (existingKeys.has(verseKey)) {
            const existing = results.find((r) => r.s === entry.surah && r.a === entry.ayah);
            if (existing) {
              existing.hasAsbabMatch = true;
              existing.asbabSnippet = snippet;
            }
          } else {
            const v = verseMap ? verseMap.get(verseKey) : null;
            if (v) {
              results.push({
                ref: v.ref,
                s: v.s,
                a: v.a,
                ar: v.ar,
                ms: v.ms,
                en: v.en,
                id: v.id,
                matchField: 'asbab',
                hasAsbabMatch: true,
                asbabSnippet: snippet,
                highlightedAr: v.ar,
                highlightedMs: v.ms,
                highlightedEn: v.en,
                highlightedId: v.id,
              });
              existingKeys.add(verseKey);
            }
          }
        }
      }
    }

    self.postMessage({ action: 'SEARCH_RESULTS', id, results });
  }
};
