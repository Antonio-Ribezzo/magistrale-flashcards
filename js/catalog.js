const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,99}$/;
const textField = (v) => typeof v === 'string' && v.trim().length > 0;

export function validateChapter(raw, expectedSubject = null) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Il capitolo deve essere un oggetto JSON');
  if (raw.schemaVersion !== 1) throw new Error('Versione schema capitolo non supportata (attesa 1)');
  if (!ID_PATTERN.test(raw.subjectId || '')) throw new Error('ID materia non valido');
  if (expectedSubject && raw.subjectId !== expectedSubject) throw new Error('Il capitolo appartiene a un’altra materia');
  const ch = raw.chapter;
  if (!ch || !ID_PATTERN.test(ch.id || '') || !textField(ch.title)) throw new Error('Dati capitolo mancanti (id / title)');
  if (!Array.isArray(ch.topics)) throw new Error('La lista chapter.topics deve essere un array');
  if (!Array.isArray(raw.cards)) throw new Error('La lista cards deve essere un array');
  const topicIds = new Set();
  const topics = ch.topics.map(topic => {
    if (!topic || !ID_PATTERN.test(topic.id || '') || !textField(topic.title)) throw new Error('Argomento senza ID o titolo valido');
    if (topicIds.has(topic.id)) throw new Error(`ID argomento duplicato: ${topic.id}`);
    topicIds.add(topic.id);
    return {id: topic.id, title: topic.title.trim()};
  });
  const cardIds = new Set();
  const cards = raw.cards.map(card => {
    if (!card || !ID_PATTERN.test(card.id || '') || !textField(card.question) || !textField(card.answer)) throw new Error('Flashcard non valida: id, question e answer obbligatori');
    if (cardIds.has(card.id)) throw new Error(`ID flashcard duplicato: ${card.id}`);
    cardIds.add(card.id);
    if (!topicIds.has(card.topicId)) throw new Error(`La scheda ${card.id} usa un topicId non presente nel capitolo`);
    if (card.formulas != null && (!Array.isArray(card.formulas) || card.formulas.some(f => !f || !textField(f.latex)))) throw new Error(`Formule non valide nella scheda ${card.id}`);
    if (card.connections != null && (!Array.isArray(card.connections) || card.connections.some(c => typeof c !== 'string'))) throw new Error(`Collegamenti non validi nella scheda ${card.id}`);
    return {
      id:card.id,subjectId:raw.subjectId,chapterId:ch.id,chapterTitle:ch.title,topicId:card.topicId,
      topicTitle:topics.find(t => t.id === card.topicId).title,
      question:card.question.trim(),answer:card.answer.trim(),detail:card.detail || '',
      example:card.example || '',formulas:card.formulas || [],connections:card.connections || [],
      mistakes:card.mistakes || '',reference:card.reference || ''
    };
  });
  const coverage = raw.coverage || {sections:[]};
  if (coverage.sections != null && !Array.isArray(coverage.sections)) throw new Error('coverage.sections deve essere un array');
  for (const section of coverage.sections || []) {
    if (!textField(section.label) || !Array.isArray(section.cardIds)) throw new Error('Mappa di copertura non valida');
    for (const id of section.cardIds) if (!cardIds.has(id)) throw new Error(`Mappa di copertura: flashcard non trovata (${id})`);
  }
  return {id:ch.id,title:ch.title,subjectId:raw.subjectId,order:Number(ch.order)||0,
    topics,cards,coverage,source:raw.source || '',local:false};
}

export async function loadPublishedCatalog() {
  const response = await fetch(new URL('../content/manifest.json', import.meta.url), {cache:'no-cache'});
  if (!response.ok) throw new Error(`Manifest non trovato: HTTP ${response.status}`);
  const manifest = await response.json();
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.subjects)) throw new Error('Manifest non valido');
  const subjectIds = new Set();
  for (const s of manifest.subjects) {
    if (!ID_PATTERN.test(s.id || '') || !textField(s.name) || subjectIds.has(s.id) || !Array.isArray(s.chapters)) throw new Error('Materia non valida o duplicata nel manifest');
    subjectIds.add(s.id);
  }
  const chapterSources = manifest.subjects.flatMap(s => s.chapters.map(ch => ({subjectId:s.id, file:ch.file, id:ch.id})));
  const chapters = []; const errors = []; const seen = new Set(); const seenCards = new Set();
  const results = await Promise.all(chapterSources.map(async entry => {
    try {
      if (typeof entry.file !== 'string' || !/^content\/subjects\/[a-zA-Z0-9/_-]+\.json$/.test(entry.file)) throw new Error('Percorso file capitolo non valido');
      const response = await fetch(new URL('../' + entry.file, import.meta.url), {cache:'no-cache'});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw = await response.json();
      const chapter = validateChapter(raw, entry.subjectId);
      if (chapter.id !== entry.id) throw new Error('ID capitolo diverso dal manifest');
      return {chapter};
    } catch(error) { return {error:`${entry.file}: ${error.message}`}; }
  }));
  for(const result of results){
    if(result.error){errors.push(result.error);continue;}
    const ch = result.chapter;
    if(seen.has(ch.id) || ch.cards.some(c => seenCards.has(c.id))){errors.push(`Capitolo ${ch.id}: ID duplicato nel catalogo`);continue;}
    seen.add(ch.id);ch.cards.forEach(c=>seenCards.add(c.id));chapters.push(ch);
  }
  return {subjects:manifest.subjects,chapters,errors};
}

export function combineCatalog(published, localChapters = []) {
  const chapters = [...published.chapters];
  const errors = [...published.errors];
  const seenChapters = new Set(chapters.map(c=>c.id));
  const seenCards = new Set(chapters.flatMap(c=>c.cards.map(card=>card.id)));
  for(const raw of localChapters){
    try{
      const ch = validateChapter(raw);
      if (!published.subjects.some(s=>s.id===ch.subjectId)) throw new Error('Materia non riconosciuta');
      if (seenChapters.has(ch.id)) continue; // Published version replaces local preview; progress IDs stay stable.
      if (ch.cards.some(card=>seenCards.has(card.id))) throw new Error('ID flashcard già presente in un altro capitolo');
      ch.local = true;chapters.push(ch);
      seenChapters.add(ch.id);ch.cards.forEach(card=>seenCards.add(card.id));
    }catch(error){errors.push(`Importazione locale: ${error.message}`);}
  }
  chapters.sort((a,b)=>a.subjectId.localeCompare(b.subjectId)||a.order-b.order||a.title.localeCompare(b.title));
  const cards = chapters.flatMap(ch=>ch.cards);
  return {...published,chapters,cards,errors};
}
