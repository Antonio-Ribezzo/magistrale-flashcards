import {cyberMixedCases, mixedMethods} from './mixed-methods.js';
import {verificationCases} from './verification-cases.js';

export const verificationKinds = {
  recall: 'Ricorda',
  connect: 'Spiega il collegamento',
  apply: 'Applica'
};

export const verificationCriteria = {
  recall: ['Richiama gli elementi essenziali.', 'Usa termini e definizioni precisi.'],
  connect: ['Spiega il nesso o la differenza.', 'Indica una conseguenza o un esempio pertinente.'],
  apply: ['Scegli un criterio o procedimento pertinente.', 'Motiva i passaggi e interpreta l’esito.']
};

const recall = /^(che cos[’']è|cosa si intende|come si definisce|qual è la definizione|definisci|che cosa misura)/i;
const connect = /differenza|distingu|confront|relazione tra|collega|perché/i;
const exercise = /\b(calcola|calcolare|determina|quanto vale|quanto ammonta|quale risultato|come si ricava)\b|^(se |dato |dati )/i;

const cyberPrompts = [
  [[1,'Quali compiti svolgono scheda di rete, switch e router?'],[2,'Come si collegano TCP/IP, OSI e incapsulamento?'],[4,'Un utente apre un sito HTTPS. Ricostruisci il percorso dal nome del sito allo scambio HTTP e indica dove vale la protezione.']],
  [[1,'Definisci riservatezza, integrità e disponibilità.'],[3,'Come contribuiscono asset, esposizione e conseguenze alla definizione del rischio?'],[4,'Un servizio essenziale si interrompe. Usa le quattro fasi del ciclo di sicurezza per organizzare il riesame.']],
  [[1,'Che cosa rende verificabile una progettazione di sicurezza?'],[3,'Come si collegano confini di fiducia, incapsulamento e modularità?'],[2,'Due persone devono approvare una decisione critica. Come separeresti i compiti e limiteresti i permessi?']],
  [[1,'Quali garanzie offre la cifratura simmetrica autenticata?'],[3,'Confronta hash, MAC e firma per garanzie e ruolo delle chiavi.'],[4,'Devi proteggere un archivio e le password. Quali meccanismi useresti per i due tipi di dati?']],
  [[1,'Distingui identificazione, autenticazione, autorizzazione e accounting.'],[3,'Confronta DAC, MAC, RBAC e ABAC rispetto alla decisione di accesso.'],[4,'Una persona cambia reparto e usa servizi federati. Quali diritti e verifiche aggiorneresti?']],
  [[1,'Quali fonti aiutano a rilevare un incidente malware?'],[4,'Come si completano i controlli sui limiti e le mitigazioni della piattaforma?'],[3,'Un portale è sovraccarico durante un picco. Come proteggeresti la disponibilità e misureresti l’impatto sugli utenti?']],
  [[1,'Quali fonti osservano rispettivamente i sensori di rete e di host?'],[2,'Come si collegano precision, recall e triage degli allarmi?'],[4,'Un controllo automatico blocca sempre più accessi legittimi. Come valuteresti la scelta tra segnalazione e blocco?']],
  [[1,'Quali elementi definiscono il contesto di un risk assessment?'],[2,'Come guidano probabilità e impatto la prioritizzazione?'],[3,'Un evento costa 10.000 € e si stima una volta ogni cinque anni. Calcola la perdita annua attesa e indica un limite della stima.']],
  [[3,'A quale livello opera IPsec e che cosa determina il suo perimetro?'],[1,'Come differiscono la protezione con S/MIME e la verifica del dominio nella posta?'],[2,'Un portale termina TLS su un proxy. Quali collegamenti esamineresti per capire dove valgono le garanzie del canale?']],
  [[1,'Quali ruoli svolgono accesso radio e rete centrale?'],[3,'Come si collegano autenticazione, cifratura e protezione dei frame di gestione?'],[4,'Un ufficio ha dispositivi propri, ospiti e IoT. Come organizzeresti segmenti, autenticazione e monitoraggio?']],
  [[1,'Che cosa separa una VLAN e a quale livello?'],[2,'Come si collegano porte access, trunk e tag 802.1Q?'],[3,'Un host deve raggiungere un solo servizio in un’altra VLAN. Spiega il ruolo di gateway, routing e policy e quali esiti verificheresti.']],
  [[1,'Distingui pseudonimizzazione, anonimizzazione e cifratura.'],[2,'Come si collegano finalità, minimizzazione e conservazione limitata?'],[4,'Un fornitore segnala una possibile esposizione di dati personali. Quali informazioni raccoglieresti e quali decisioni documenteresti?']],
  [[1,'Qual è la differenza tra una prova positiva e una negativa per una policy?'],[2,'Come distingui un problema di livello 2 da uno di routing o applicativo?'],[3,'Un client riceve un certificato con dominio inatteso. Quali proprietà del canale verificheresti e come documenteresti l’esito?']],
  [[1,'Quale struttura puoi seguire per rispondere a una domanda tecnica all’orale?'],[2,'Come distingui autenticazione, autorizzazione e integrità di un messaggio?'],[4,'Un servizio è ripristinato dopo un incidente. Come dimostri il recupero e quali responsabilità e controlli riesamini?']]
];

const cyberSolutions = {
  'cyber-c07': 'La frequenza annua stimata è 1/5 = 0,2. La perdita annua attesa è 10.000 × 0,2 = 2.000 €. Il valore dipende dalle stime di frequenza e perdita.'
};

export function canVerify(chapter) {
  return chapter.subjectId === 'cyber'
    ? !chapter.local && /^cyber-c(?:0\d|1[0-3])$/.test(chapter.id)
    : chapter.cards.length >= 3;
}

function fromCard(card, kind) {
  const prompt = kind === 'apply' && !exercise.test(card.question)
    ? card.question + '\nDescrivi anche un caso concreto e spiega come applicheresti il concetto.'
    : card.question;
  return {
    id:kind+':'+card.id,kind,prompt,answer:card.answer,
    details:kind==='connect' ? card.connections.join('\n\n') : card.example,
    topicId:card.topicId,reference:card.reference
  };
}

function chapterCase(chapter) {
  const base = verificationCases[chapter.subjectId]?.[Number(chapter.id.slice(-2))];
  if (chapter.local || !base) return null;
  const [prompt,answer,page] = base;
  return {id:'apply:case-'+chapter.id,kind:'apply',prompt,answer,page};
}

export function makeVerification(chapter, reader, attempts = [], retry = false) {
  if (!canVerify(chapter)) return [];
  if (chapter.subjectId === 'cyber') {
    if (!reader) return [];
    const specs = cyberPrompts[Number(chapter.id.slice(-2))];
    const items = Object.keys(verificationKinds).flatMap((kind,index) => {
      const [sectionId,prompt] = specs[index];
      const section = reader.sections.find(s => s.id === String(sectionId));
      if (!section) return [];
      const answer = (kind==='apply' && cyberSolutions[chapter.id]) || section.blocks[0].text;
      return [{id:kind+':'+chapter.id,kind,prompt,answer,sectionId:section.id,page:section.pages?.[0]}];
    });
    return retry ? items.filter(item => attempts.some(attempt => attempt.questionId===item.id && attempt.result!=='ok')) : items;
  }

  const application = chapterCase(chapter);
  if (retry) {
    return attempts.filter(attempt => attempt.result !== 'ok').flatMap(attempt => {
      if (application?.id===attempt.questionId) return [application];
      const [kind,cardId] = attempt.questionId.split(':');
      const card = chapter.cards.find(c => c.id === cardId);
      return card && Object.hasOwn(verificationKinds,kind) ? [fromCard(card,kind)] : [];
    }).slice(0,3);
  }

  const rank = new Map(attempts.map((attempt,index) => [attempt.questionId, attempts.length-index]));
  const picked = [];
  const select = (kind,match) => {
    const remaining = chapter.cards.filter(card => !picked.some(item => item.id.endsWith(':'+card.id)));
    const matching = remaining.filter(match);
    const candidates = matching.length ? matching : remaining;
    const score = card => (rank.get(kind+':'+card.id)||0) + 3*picked.filter(item => item.topicId===card.topicId).length;
    const card = candidates.reduce((best,next) => score(next)<score(best)?next:best);
    picked.push(fromCard(card,kind));
  };
  select('recall',card=>recall.test(card.question));
  select('connect',card=>connect.test(card.question) && card.connections.length);
  if (application) picked.push(application);
  else select('apply',card=>exercise.test(card.question) && card.question.length >= 45);
  return picked;
}

export function latestVerificationAttempts(settings, chapterId) {
  const latest = new Map();
  const entries = Object.entries(settings).filter(([key,value]) =>
    key.startsWith('verification-attempt:') && value && (!chapterId || value.chapterId===chapterId) &&
    typeof value.questionId==='string' && typeof value.at==='string' &&
    ['again','partial','ok'].includes(value.result)
  ).sort(([,a],[,b])=>b.at.localeCompare(a.at));
  for (const [,attempt] of entries) {
    if (!latest.has(attempt.questionId)) latest.set(attempt.questionId,attempt);
  }
  return [...latest.values()];
}

const cdgMixedMethods = [
  null,
  ['Performance', 'Efficienza ed efficacia'],
  ['Bilancio', 'Equazione patrimoniale'],
  ['Costi', 'Costo e margine di commessa'],
  ['Costi', 'Metodo del massimo–minimo', 'I costi totali sono 8.000 € a 500 ore e 11.000 € a 800 ore. Supponi che il costo cresca linearmente con le ore. Quanto costa un’ora aggiuntiva e quale costo rimane a ore zero?'],
  ['Costi', 'Imputazione dei costi indiretti'],
  ['Costi', 'Activity-Based Costing'],
  ['Costi', 'Unità equivalenti di produzione', 'Un reparto completa 800 unità e ne lascia 200 al 50% di lavorazione. Quanto lavoro di conversione rappresentano, espresso in unità interamente lavorate?'],
  ['Budget', 'Scostamento di efficienza', 'Per il volume effettivo sono autorizzati 500 kg a 4 €/kg. Ne sono stati usati 540. Qual è l’effetto economico del maggior consumo, a prezzo invariato? Indica il segno usando standard meno effettivo.'],
  ['Volume', 'Punto di pareggio', 'Prezzo 30 €, costo variabile unitario 18 €, costi fissi 60.000 €. Quanti pezzi devi vendere per coprire tutti i costi e quale risultato ottieni a 6.000 pezzi?'],
  ['Breve periodo', 'Analisi differenziale di un ordine'],
  ['Investimenti', 'Valore attuale netto', 'Un investimento costa 10.000 € oggi e genera 6.000 € alla fine di ciascuno dei prossimi due anni. Con un rendimento richiesto del 10%, quanto valore crea oggi e prenderesti il progetto?'],
  ['Budget', 'Budget della produzione'],
  ['Budget', 'Budget flessibile', 'Il piano prevedeva 1.000 unità e 10 € di costo variabile per pezzo. Sono state prodotte 1.200 unità per 12.600 €. Quanto del maggior costo rimane dopo aver tenuto conto del volume?'],
  ['Performance', 'Redditività e scomposizione DuPont', 'Un centro ha EBIT 60.000 €, ricavi 600.000 € e capitale investito 300.000 €. Calcola la redditività del capitale e spiegala attraverso il margine sulle vendite e il ricavo per euro investito.'],
  ['Performance', 'Obiettivi e indicatori della Balanced Scorecard']
];

function shuffle(items) {
  const result = [...items];
  for (let i = result.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [result[i],result[j]] = [result[j],result[i]];
  }
  return result;
}

export function mixedCases(chapters) {
  return chapters.flatMap(chapter => {
    if (chapter.local) return [];
    const number = Number(chapter.id.slice(-2));
    const methods = chapter.subjectId==='cdg' ? cdgMixedMethods : mixedMethods[chapter.subjectId];
    const setup = methods?.[number];
    if (!setup) return [];
    const [group,method,promptOverride] = setup;
    const base = chapter.subjectId==='cyber' ? cyberMixedCases[number] : verificationCases[chapter.subjectId]?.[number];
    if (!base) return [];
    const [prompt,answer,page] = base;
    return [{id:'mixed:'+chapter.id,chapterId:chapter.id,kind:'apply',group,method,prompt:promptOverride||prompt,answer,page}];
  });
}

export function pickMixedCases(items, attempts, retry = false) {
  const last = new Map(attempts.map(attempt=>[attempt.questionId,attempt]));
  const eligible = retry ? items.filter(item=>last.has(item.id) && last.get(item.id).result!=='ok') : items;
  const ranked = shuffle(eligible).sort((a,b)=>(last.get(a.id)?.at||'').localeCompare(last.get(b.id)?.at||''));
  const picked = [];
  for (const item of ranked) {
    if (picked.length===3) break;
    if (picked.some(entry=>entry.group===item.group)) continue;
    picked.push(item);
  }
  return shuffle([...picked,...ranked.filter(item=>!picked.includes(item)).slice(0,3-picked.length)]);
}
