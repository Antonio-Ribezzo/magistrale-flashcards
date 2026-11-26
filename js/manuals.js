const manualFiles = new Map([
  ['cdg', 'Controllo_di_Gestione_Manuale.pdf'],
  ['mca', 'Marketing_e_Customer_Analytics_Manuale.pdf'],
  ['cyber', 'Fondamenti_di_Cybersecurity_Manuale.pdf'],
  ['si', 'Sistemi_Informativi_Manuale.pdf']
]);

export function subjectManual(subjectId) {
  const file = manualFiles.get(subjectId);
  return file ? new URL('../docs/' + file, import.meta.url).href : null;
}

export function chapterManual(chapter) {
  const url = subjectManual(chapter.subjectId);
  if (!url || chapter.local || typeof chapter.source !== 'string') return null;
  const pages = chapter.source.match(/\bpagin[ae] PDF\s+([1-9]\d*)(?:\s*[–—-]\s*([1-9]\d*))?/i);
  if (!pages) return null;

  const first = Number(pages[1]);
  const last = Number(pages[2] ?? pages[1]);
  if (!Number.isSafeInteger(last) || last < first) return null;
  return {url: url + '#page=' + first, first, last};
}
