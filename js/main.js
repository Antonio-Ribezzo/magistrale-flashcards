import {loadPublishedCatalog, combineCatalog, validateChapter} from './catalog.js';
import {localDay, scoreReview, summaryFor, reviewState, isDue, isDifficult, isMastered, RATINGS} from './scheduler.js';
import {initDatabase, isTemporaryStorage, getAll, put, remove, exportBackup, importBackup} from './db.js';

const $ = (s) => document.querySelector(s);
const esc = (value='') => String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const percent = (n,d) => d ? Math.round(n / d * 100) : 0;
const fmtDate = (date=new Date()) => new Intl.DateTimeFormat('it-IT',{day:'numeric',month:'long',year:'numeric'}).format(date);
const root = $('#app');
const icons={
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 cards:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
 repeat:'<path d="M4 7h14l-3-3m3 3-3 3M20 17H6l3-3m-3 3 3 3"/>',
 settings:'<path d="M10.5 2h3l.7 2.2 2 .9 2.1-1.1 2.1 2.1-1.1 2.1.9 2L22 10.5v3l-2.2.7-.9 2 1.1 2.1-2.1 2.1-2.1-1.1-2 .9-.7 2.2h-3l-.7-2.2-2-.9-2.1 1.1-2.1-2.1 1.1-2.1-.9-2L2 13.5v-3l2.2-.7.9-2L4 5.7l2.1-2.1 2.1 1.1 2-.9z"/><circle cx="12" cy="12" r="3"/>',
 chart:'<path d="M4 20V4M4 20h17M8 16l4-5 3 2 5-8"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 shield:'<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m9 12 2 2 4-4"/>',
 database:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
 moon:'<path d="M20 14.2A8.6 8.6 0 0 1 9.8 4a8.7 8.7 0 1 0 10.4 10.2z"/>',
 arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 back:'<path d="M20 12H4m6-6-6 6 6 6"/>',
 chevron:'<path d="m9 18 6-6-6-6"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
 upload:'<path d="M12 21V9m-5 5 5-5 5 5M4 7V3h16v4"/>',
 spark:'<path d="m12 2 2.3 7.7L22 12l-7.7 2.3L12 22l-2.3-7.7L2 12l7.7-2.3z"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
 layers:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M8 2h8M8 9h8M8 13h8"/>',
 check:'<path d="m5 12 5 5L20 7"/>',
 book:'<path d="M12 6c-2-2-6-2-9-1v15c4-1 7-1 9 1 2-2 5-2 9-1V5c-3-1-7-1-9 1zM12 6v15"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7h.01"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
 shuffle:'<path d="m17 3 4 4-4 4M3 17h4c6 0 7-10 13-10h1M17 21l4-4-4-4M3 7h4c2 0 3 1 4 3m2 4c2 3 4 3 8 3"/>',
 eye:'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 alert:'<path d="m12 2 10 19H2zM12 9v5m0 3h.01"/>',
 close:'<path d="M5 5 19 19M19 5 5 19"/>',
 list:'<path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
 help:'<circle cx="12" cy="12" r="10"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2.5-3 5M12 17h.01"/>',
 star:'<path d="m12 2 3 6.5 7 .8-5 5 1.3 7L12 18l-6.3 3.3 1.3-7-5-5 7-.8z"/>',
 cloud:'<path d="M7 19h11a4 4 0 0 0 .3-8 7 7 0 0 0-13-1A5 5 0 0 0 7 19z"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 filter:'<path d="M3 5h18l-7 8v6l-4 2v-8z"/>'
};
function icon(name,attrs='') {return `<svg class="svg-icon" viewBox="0 0 24 24" aria-hidden="true" ${attrs}>${icons[name]||icons.cards}</svg>`;}
function btn(text,action,extra='',classes='btn outline') {return `<button type="button" class="${classes}" data-action="${esc(action)}" ${extra}>${text}</button>`;}
function link(to,text,classes='btn outline'){return `<a class="${classes}" href="${esc(to)}">${text}</a>`;}
function rich(text) {
  if(!text) return '';
  const inl = s => esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*([^*\n]+)\*/g,'<em>$1</em>').replace(/`([^`]+)`/g,'<code>$1</code>');
  return String(text).split(/\n\s*\n/).map(block=>{
    const rows=block.split('\n');
    if(rows.every(row=>/^\s*[-•] /.test(row)))return `<ul>${rows.map(row=>`<li>${inl(row.replace(/^\s*[-•] /,''))}</li>`).join('')}</ul>`;
    if(rows.every(row=>/^\s*\d+\. /.test(row)))return `<ol>${rows.map(row=>`<li>${inl(row.replace(/^\s*\d+\. /,''))}</li>`).join('')}</ol>`;
    return `<p>${rows.map(inl).join('<br>')}</p>`;
  }).join('');
}
let published=null;let catalog=null;let reviews={};let history=[];let settings={theme:'light'};let localChapters=[];
let session=null;let toastTimer=null;let libraryFilter={subject:'',chapter:'',topic:'',mode:'all',search:''};

const subjectCards = id => catalog.cards.filter(c=>!id||c.subjectId===id);
const subjectChapters = id => catalog.chapters.filter(c=>c.subjectId===id);
const getSub = id => catalog.subjects.find(s=>s.id===id);
const stats = cards => summaryFor(cards,reviews);
const pctWidth = v => Math.max(0,Math.min(100,v));
function renderBar(value,cls=''){return `<div class="meter ${cls}"><span style="width:${pctWidth(value)}%"></span></div>`;}
function todayDate(){return fmtDate(new Date());}
function routeParts(){
  const [path,query='']=(window.location.hash||'#/').slice(1).split('?');
  return {segments:path.split('/').filter(Boolean),params:new URLSearchParams(query)};
}
function toast(message,type='info'){
  $('.toast')?.remove();clearTimeout(toastTimer);
  const el=document.createElement('div');el.className=`toast ${type}`;el.setAttribute('role','status');el.textContent=message;document.body.appendChild(el);
  toastTimer=setTimeout(()=>el.remove(),5000);
}
function layout(content,section='dashboard',crumb='Panoramica'){
  const nav=(key,label,ic,route,count='')=>`<a class="nav-link ${section===key?'active':''}" href="${route}">${icon(ic)}<span>${label}</span>${count?`<span class="nav-count">${count}</span>`:''}</a>`;
  const subjects=catalog.subjects.map(s=>`<a class="nav-link ${section==='subject-'+s.id?'active':''}" href="#/subject/${esc(s.id)}"><span class="nav-subject-dot ${esc(s.accent)}"></span><span>${esc(s.shortName||s.name)}</span></a>`).join('');
  return `<div class="shell"><aside class="sidebar"><div class="brand"><div class="brand-mark">M<span class="brand-dot"></span></div><div><div class="brand-name">Magistrale</div><span class="brand-sub">FLASHCARDS</span></div></div><div class="nav-label">IL TUO SPAZIO</div>${nav('dashboard','Panoramica','home','#/')}${nav('reviews','Ripassi di oggi','repeat','#/reviews',stats(catalog.cards).due||'')}${nav('library','Tutte le schede','cards','#/library')}<div class="nav-label">INSEGNAMENTI</div>${subjects}<div class="nav-spacer"></div>${nav('settings','Impostazioni','settings','#/settings')}<div class="sidebar-bottom"><div class="session-box"><span>IL TUO OBIETTIVO</span><strong>Sessione invernale 2027</strong><p>Quattro materie, un percorso.<br>Un ripasso alla volta.</p></div><div class="sidebar-foot">Magistrale Flashcards · v1.0</div></div></aside>
  <div class="main"><header class="topbar"><div class="breadcrumbs"><span>Il mio studio</span>${icon('chevron')}<strong>${esc(crumb)}</strong></div><div class="top-actions"><span class="pill-date">${icon('calendar')}${esc(todayDate())}</span>${btn(icon(settings.theme==='dark'?'sun':'moon'),'theme','aria-label="Cambia tema" title="Cambia tema"','icon-btn')}</div></header><main class="page" id="page">${isTemporaryStorage()?`<div class="note warning" style="margin-bottom:20px">${icon('alert')} Attenzione: archivio locale non disponibile. I progressi potrebbero andare persi chiudendo il browser.</div>`:''}${catalog.errors.length?`<div class="note warning" style="margin-bottom:20px"><strong>Alcuni capitoli non sono stati caricati:</strong> ${esc(catalog.errors.slice(0,3).join(' · '))}${catalog.errors.length>3?' …':''}</div>`:''}${content}<p class="footer-hint">Magistrale Flashcards · Studio consapevole, progressi misurabili. I tuoi dati restano su questo dispositivo.</p></main></div>
  <nav class="mobile-bar" aria-label="Navigazione principale">${[['dashboard','home','Home','#/'],['reviews','repeat','Ripassi','#/reviews'],['library','cards','Schede','#/library'],['settings','settings','Opzioni','#/settings']].map(([key,ic,label,path])=>`<a class="mobile-item ${section===key?'active':''}" href="${path}">${icon(ic)}<span>${label}</span></a>`).join('')}</nav></div>`;
}
function renderDashboard(){
  const all=stats(catalog.cards);
  const hero = `<div class="hero"><div class="hero-content"><div class="eyebrow">IL TUO PERCORSO DI APPRENDIMENTO</div><h1>Ogni grande traguardo inizia da una domanda.</h1><p>Studia, richiama dalla memoria e ripassa al momento giusto. Tutte le materie, un unico spazio pensato per te.</p><div class="hero-cta">${all.due?btn(`Ripassa le ${all.due} schede di oggi ${icon('arrow')}`,'start','data-mode="due"','btn light'):all.total?btn(`Inizia a studiare ${icon('arrow')}`,'start','data-mode="new"','btn light'):link('#/settings',`Prepara il primo capitolo ${icon('arrow')}`,'btn light')}</div></div><div class="hero-art"><div class="orb one"></div><div class="orb two"></div><div class="orb three"></div><div class="spark">✦</div></div></div>`;
  const metrics=[['Schede disponibili',all.total,'cards','Nei quattro insegnamenti'],['Schede affrontate',all.studied,'book',all.coverage+'% di copertura'],['Da ripassare oggi',all.due,'clock','Ripassi in scadenza'],['Consolidate',all.mastered,'check',all.mastery+'% di padronanza']];
  const panels=metrics.map(([title,num,ic,sub])=>`<div class="stat-card"><div class="stat-top">${esc(title)}<div class="stat-icon">${icon(ic)}</div></div><div class="stat-number">${num}</div><div class="stat-desc">${esc(sub)}</div></div>`).join('');
  const subjects=catalog.subjects.map(s=>{
    const ch=subjectChapters(s.id);const ss=stats(subjectCards(s.id));
    return `<a class="subject-card" href="#/subject/${esc(s.id)}"><div class="subject-top"><div class="subject-symbol ${esc(s.accent)}">${icon(s.icon)}</div><span class="tag">${esc(s.code)}</span></div><h3>${esc(s.name)}</h3><p>${esc(s.description||'')}</p><div class="subject-metrics"><span><strong>${ch.length}</strong> capitoli</span><span><strong>${ss.total}</strong> flashcard</span><span><strong>${ss.due}</strong> da ripassare</span></div><div class="progress-label"><span>Copertura</span><strong>${ss.coverage}%</strong></div>${renderBar(ss.coverage,s.accent)}<div class="progress-label" style="margin-top:10px"><span>Padronanza verificata</span><strong>${ss.mastery}%</strong></div>${renderBar(ss.mastery,s.accent)}<div class="subject-footer"><span>${ss.total?'Apri il programma e continua':'In attesa del primo capitolo'}</span><span class="arrow">${icon('arrow')}</span></div></a>`;
  }).join('');
  return layout(`${hero}<div class="stats-grid">${panels}</div><div class="section-heading"><div><h2>I tuoi insegnamenti</h2><p>Una panoramica dei quattro percorsi di studio.</p></div>${link('#/library','Esplora le schede '+icon('arrow'),'text-link')}</div><div class="subject-grid">${subjects}</div><div class="info-strip">${icon('info')}<div><strong>${all.total?'Come funziona il progresso':'I contenuti arriveranno dai tuoi manuali'}</strong><p>${all.total?'La copertura indica quante schede hai già valutato; la padronanza indica quante sono state consolidate con ripassi successivi. Sono misure diverse.':'Le quattro materie sono già configurate, ma non abbiamo aggiunto schede didattiche inventate. Carica un capitolo JSON validato o pubblicalo nel catalogo quando avrai fornito il relativo manuale.'}</p></div>${link('#/settings','Gestisci contenuti','text-link')}</div>`);
}
function renderSubject(id){
  const s=getSub(id);if(!s)return layout(errorView('Materia non trovata'),'dashboard','Errore');
  const chapters=subjectChapters(id);const cards=subjectCards(id);const m=stats(cards);
  const list=chapters.length?`<div class="chapter-list">${chapters.map((ch,i)=>{
    const cstats=stats(ch.cards);
    return `<div class="chapter-row"><span class="chapter-index">${String(i+1).padStart(2,'0')}</span><div class="chapter-main"><h3>${esc(ch.title)} ${ch.local?'<span class="badge info">Solo su questo dispositivo</span>':''}</h3><p>${ch.topics.length} argomenti · ${ch.cards.length} schede · ${cstats.coverage}% affrontate · ${cstats.due} ripassi</p></div><div class="chapter-actions">${btn('Studia '+icon('arrow'),'start',`data-subject="${esc(id)}" data-chapter="${esc(ch.id)}" data-mode="all"`,'btn outline small')}</div></div>`;
  }).join('')}</div>`:emptyView('book','Nessun capitolo disponibile','I capitoli verranno aggiunti progressivamente, dopo la verifica dei contenuti del manuale definitivo.',link('#/settings','Come aggiungere un capitolo','btn primary'));
  const counts=`<div class="detail-grid"><div class="detail-metric"><span>Schede totali</span><strong>${m.total}</strong></div><div class="detail-metric"><span>Affrontate</span><strong>${m.studied}</strong></div><div class="detail-metric"><span>Consolidate</span><strong>${m.mastered}</strong></div></div>`;
  return layout(`<a class="top-back" href="#/">${icon('back')} Torna alla panoramica</a><div class="subject-banner"><div class="subject-symbol ${esc(s.accent)}">${icon(s.icon)}</div><div><div class="eyebrow">${esc(s.code)} · INSEGNAMENTO</div><h2>${esc(s.name)}</h2><p>${esc(s.description||'')} · ${chapters.length} capitoli disponibili</p></div><div class="banner-cta">${btn('Studia questa materia '+icon('arrow'),'start',`data-subject="${esc(s.id)}" data-mode="all"`,'btn primary')}</div></div>${counts}<div class="section-heading"><div><h2>Capitoli e argomenti</h2><p>Procedi un capitolo alla volta, senza perdere il filo.</p></div><div class="page-header-actions">${btn('Schede nuove','start',`data-subject="${esc(s.id)}" data-mode="new"`,'btn outline small')}${btn('Da ripassare','start',`data-subject="${esc(s.id)}" data-mode="due"`,'btn outline small')}</div></div>${list}`,`subject-${id}`,s.shortName||s.name);
}
function emptyView(ic,title,description,action=''){return `<div class="empty"><div class="empty-icon">${icon(ic)}</div><h3>${esc(title)}</h3><p>${esc(description)}</p>${action}</div>`;}
function errorView(message){return `<div class="error-panel">${icon('alert')} ${esc(message)}. ${link('#/','Torna alla home','text-link')}</div>`;}
function renderReviews(){
  const today=localDay();const due=catalog.cards.filter(c=>isDue(reviews[c.id],today));
  const dueSubjects=catalog.subjects.map(s=>{const arr=due.filter(c=>c.subjectId===s.id);return `<div class="chapter-row"><div class="subject-symbol ${esc(s.accent)}" style="width:40px;height:40px">${icon(s.icon)}</div><div class="chapter-main"><h3>${esc(s.name)}</h3><p>${arr.length} schede da ripassare</p></div>${btn('Ripassa '+icon('arrow'),'start',`data-subject="${esc(s.id)}" data-mode="due"`,'btn small outline')}</div>`;}).join('');
  return layout(`<div class="eyebrow">RIPETIZIONE DILAZIONATA</div><h1 class="page-title">I ripassi di oggi</h1><p class="page-subtitle">Le schede in scadenza vengono calcolate dalle tue valutazioni. Quelle incerte ritornano prima, quelle ben conosciute a intervalli maggiori.</p><div class="stats-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));max-width:610px"><div class="stat-card"><div class="stat-top">Pronte per il ripasso ${icon('clock')}</div><div class="stat-number">${due.length}</div><div class="stat-desc">In tutte le materie</div></div><div class="stat-card"><div class="stat-top">Schede consolidate ${icon('check')}</div><div class="stat-number">${stats(catalog.cards).mastered}</div><div class="stat-desc">Progresso verificato</div></div></div><div class="section-heading"><h2>Ripassi per materia</h2>${due.length?btn('Ripassa tutte '+icon('arrow'),'start','data-mode="due"','btn primary'):''}</div><div class="chapter-list">${dueSubjects}</div><div class="info-strip">${icon('info')}<div><strong>Un ripasso alla volta</strong><p>Mostrare la risposta non equivale a conoscere la scheda. Solo la tua autovalutazione aggiorna l'intervallo di ripetizione.</p></div></div>`,'reviews','Ripassi');
}
function libraryData(){let arr=[...catalog.cards];const f=libraryFilter;
  if(f.subject)arr=arr.filter(c=>c.subjectId===f.subject);
  if(f.chapter)arr=arr.filter(c=>c.chapterId===f.chapter);
  if(f.topic)arr=arr.filter(c=>c.topicId===f.topic);
  if(f.mode==='new')arr=arr.filter(c=>reviewState(reviews[c.id])==='new');
  if(f.mode==='due')arr=arr.filter(c=>isDue(reviews[c.id]));
  if(f.mode==='hard')arr=arr.filter(c=>isDifficult(reviews[c.id]));
  if(f.mode==='mastered')arr=arr.filter(c=>isMastered(reviews[c.id]));
  if(f.search){const q=f.search.toLocaleLowerCase('it');arr=arr.filter(c=>(c.question+' '+c.answer+' '+c.topicTitle).toLocaleLowerCase('it').includes(q));}
  return arr;
}
function renderLibrary(){
  const f=libraryFilter;
  const chapters=catalog.chapters.filter(c=>!f.subject||c.subjectId===f.subject);
  const topics=chapters.filter(ch=>!f.chapter||ch.id===f.chapter).flatMap(ch=>ch.topics.map(t=>({...t,chapterId:ch.id})));
  const data=libraryData();
  const opts=(items,selected,placeholder)=>`<option value="">${esc(placeholder)}</option>${items.map(([val,name])=>`<option value="${esc(val)}" ${selected===val?'selected':''}>${esc(name)}</option>`).join('')}`;
  const table=data.length?`<div class="panel scroll-x"><table class="card-table"><thead><tr><th>Domanda</th><th>Materia e capitolo</th><th>Stato</th><th></th></tr></thead><tbody>${data.slice(0,200).map(c=>{
    const state=reviewState(reviews[c.id]);const sub=getSub(c.subjectId);
    const stateNames={new:'Nuova',learning:'In apprendimento',due:'Da ripassare',mastered:'Consolidata'};
    return `<tr><td><strong>${esc(c.question)}</strong><div class="mini-label" style="margin-top:5px">${esc(c.topicTitle)}</div></td><td>${esc(sub?.shortName||c.subjectId)}<div class="mini-label">${esc(c.chapterTitle)}</div></td><td><span class="badge ${state==='mastered'?'success':state==='due'?'warning':''}">${esc(stateNames[state])}</span></td><td>${btn(icon('arrow'),'start',`data-card="${esc(c.id)}" aria-label="Studia scheda"`,'icon-btn')}</td></tr>`;
  }).join('')}</tbody></table>${data.length>200?`<p class="note">Sono mostrate le prime 200 schede. Applica i filtri per restringere l'elenco.</p>`:''}</div>`:emptyView('search','Nessuna flashcard trovata',catalog.cards.length?'Prova a cambiare i filtri o la ricerca.':'Non è ancora stato aggiunto nessun capitolo dal manuale.',catalog.cards.length?'':link('#/settings','Aggiungi il primo capitolo','btn outline'));
  return layout(`<div class="eyebrow">BIBLIOTECA DIDATTICA</div><h1 class="page-title">Tutte le flashcard</h1><p class="page-subtitle">Naviga tra capitoli, argomenti e schede. Le domande appartengono esclusivamente ai manuali inseriti nel catalogo.</p><div class="filter-panel"><div class="field"><label for="search-box">Cerca una domanda</label><input id="search-box" data-filter="search" placeholder="Cerca per domanda, risposta o argomento..." value="${esc(f.search)}" /></div><div class="field"><label for="filter-subject">Materia</label><select id="filter-subject" data-filter="subject">${opts(catalog.subjects.map(s=>[s.id,s.shortName||s.name]),f.subject,'Tutte le materie')}</select></div><div class="field"><label for="filter-chapter">Capitolo</label><select id="filter-chapter" data-filter="chapter">${opts(chapters.map(c=>[c.id,c.title]),f.chapter,'Tutti i capitoli')}</select></div><div class="field"><label for="filter-topic">Argomento</label><select id="filter-topic" data-filter="topic">${opts(topics.map(t=>[t.id,t.title]),f.topic,'Tutti gli argomenti')}</select></div><div class="field"><label for="filter-mode">Mostra</label><select id="filter-mode" data-filter="mode">${opts([['all','Tutte'],['new','Mai affrontate'],['due','Da ripassare'],['hard','Incerte / difficili'],['mastered','Consolidate']],f.mode,'Tutte')}</select></div></div><div class="section-heading"><div><h2>${data.length} schede trovate</h2><p>Puoi iniziare una sessione limitata ai risultati filtrati.</p></div><div class="page-header-actions">${btn('Ordine casuale '+icon('shuffle'),'start-filtered','data-random="true"','btn outline small')}${btn('Studia selezione '+icon('arrow'),'start-filtered','','btn primary small')}</div></div>${table}`,'library','Biblioteca');
}
function getSessionSelection({subject='',chapter='',topic='',mode='all',card='',random=false}={}) {
  let arr=catalog.cards.filter(c=>(!subject||c.subjectId===subject)&&(!chapter||c.chapterId===chapter)&&(!topic||c.topicId===topic));
  if(card)arr=arr.filter(c=>c.id===card);
  if(mode==='due')arr=arr.filter(c=>isDue(reviews[c.id]));
  if(mode==='new')arr=arr.filter(c=>reviewState(reviews[c.id])==='new');
  if(mode==='hard')arr=arr.filter(c=>isDifficult(reviews[c.id]));
  if(random)arr=arr.map(v=>({v,r:Math.random()})).sort((a,b)=>a.r-b.r).map(x=>x.v);
  return arr;
}
function startStudy(filter,customCards=null){
  const chosen=customCards||getSessionSelection(filter);
  if(!chosen.length){toast('Non ci sono flashcard disponibili per questa selezione.','info');return;}
  session={cards:chosen.map(c=>c.id),index:0,revealed:false,answered:0,filter:{...filter}};
  window.location.hash='#/study';render();window.scrollTo(0,0);
}
function sectionDetails(title,contents){return contents?`<details class="detail-section"><summary>${esc(title)}</summary><div class="rich">${rich(contents)}</div></details>`:'';}
function renderCardBody(card,revealed){
  const subject=getSub(card.subjectId);
  const mark=reviews[card.id];
  const header=`<div class="flashcard-top"><span class="badge">${esc(subject?.shortName||card.subjectId)} · ${esc(card.topicTitle)}</span>${btn(icon('star'),'hard',`data-card="${esc(card.id)}" aria-label="${mark?.hard?'Rimuovi dai difficili':'Segna come difficile'}" title="${mark?.hard?'Rimuovi dai difficili':'Segna come difficile'}" style="color:${mark?.hard?'#db9f48':'#8b9db2'}"`,'icon-btn')}</div>`;
  const answer = revealed?`<div class="answer-block"><h3>${icon('check')} Risposta fondamentale</h3><div class="rich">${rich(card.answer)}</div>${sectionDetails('Spiegazione approfondita',card.detail)}${sectionDetails('Esempio applicativo',card.example)}${card.formulas?.length?`<details class="detail-section"><summary>Formule e significato</summary><div class="rich">${card.formulas.map(f=>`<div class="math-block">\\[${esc(f.latex)}\\]</div>${rich(f.meaning||'')}`).join('')}</div></details>`:''}${sectionDetails('Collegamenti concettuali',card.connections?.map(c=>'- '+c).join('\n'))}${sectionDetails('Errori frequenti',card.mistakes)}${card.reference?`<div class="mini-label" style="margin-top:20px">${icon('book')} Fonte: ${esc(card.reference)}</div>`:''}</div>`:'';
  const footer=revealed?`<div class="reveal-area"><div class="hstack between"><strong style="font-size:12px">Come valuti la tua risposta?</strong><span class="mini-label">Valuta senza guardare la fonte</span></div><div class="rating-grid">${RATINGS.map(r=>btn(`<span class="rating-dot"></span>${esc(r.short)}`,'rate',`data-rating="${r.value}"`,'rating-btn r'+r.value)).join('')}</div></div>`:`<div class="reveal-area"><div class="hstack between wrap"><span class="mini-label">Prova a rispondere prima di scoprire la soluzione.</span>${btn('Mostra risposta '+icon('eye'),'reveal','','btn primary')}</div></div>`;
  return `<div class="flashcard">${header}<div class="flashcard-body"><div class="eyebrow" style="margin:0 0 13px">DOMANDA TEORICA</div><h2 class="flashcard-question">${esc(card.question)}</h2><p class="flashcard-hint">${revealed?'Confronta mentalmente ciò che hai ricordato con la risposta.':'Richiama dalla memoria: definizioni, collegamenti e un esempio, se pertinente.'}</p>${answer}</div>${footer}</div>`;
}
function renderStudy(){
  if(!session)return layout(emptyView('cards','Sessione non disponibile','La sessione attiva non viene conservata dopo un aggiornamento della pagina. I ripassi già valutati, invece, sono salvati.',link('#/library','Scegli le flashcard','btn primary')),'library','Studio');
  if(session.index>=session.cards.length){
    return layout(`<div class="study-shell">${emptyView('check','Sessione completata!',`Hai valutato ${session.answered} schede. Le nuove date di ripasso sono state aggiornate; puoi riprendere da una materia o controllare i ripassi di oggi.`,link('#/','Vai alla panoramica','btn primary')+' '+link('#/reviews','Visualizza i ripassi','btn outline'))}</div>`,'library','Fine sessione');
  }
  const card=catalog.cards.find(c=>c.id===session.cards[session.index]);if(!card){session.index++;return renderStudy();}
  const progress=percent(session.index,session.cards.length);
  return layout(`<div class="study-shell"><div class="study-header"><div class="study-heading"><button class="top-back" data-action="end" type="button">${icon('back')} Esci dalla sessione</button><h1 class="page-title" style="font-size:22px;margin-top:11px">Un concetto alla volta.</h1></div><div class="session-progress">Scheda ${session.index+1} di ${session.cards.length}</div></div><div class="study-progress-bar"><span style="width:${progress}%"></span></div>${renderCardBody(card,session.revealed)}<div class="study-navigation"><span class="mini-label">${esc(card.chapterTitle)}</span>${btn('Salta per ora '+icon('arrow'),'skip','','btn outline small')}</div></div>`,'library','Sessione di studio');
}
function renderSettings(){
  const local=catalog.chapters.filter(ch=>ch.local);
  return layout(`<div class="eyebrow">CONTROLLO E SICUREZZA</div><h1 class="page-title">Impostazioni</h1><p class="page-subtitle">Contenuti separati dal codice, progressi salvati sul dispositivo e strumenti per esportare i tuoi dati senza un account.</p><div class="settings-grid" style="margin-top:25px">
    <div class="panel setting-card"><div class="subject-symbol blue" style="margin-bottom:15px">${icon('download')}</div><h3>Backup dei progressi</h3><p>Esporta valutazioni, storico dei ripassi, preferenze e capitoli caricati localmente. Conserva il file in un posto sicuro e trasferiscilo su altri dispositivi quando vuoi.</p>${btn('Esporta backup JSON '+icon('download'),'export','','btn primary full')}</div>
    <div class="panel setting-card"><div class="subject-symbol purple" style="margin-bottom:15px">${icon('upload')}</div><h3>Ripristina un backup</h3><p>L'importazione predefinita aggiunge solo i record mancanti. I progressi già presenti non vengono sostituiti senza una tua scelta esplicita.</p><label class="inline-check" style="margin-bottom:14px"><input type="checkbox" id="overwrite-import"/> Sovrascrivi i record esistenti (scelta esplicita)</label><label class="upload-label" for="backup-file">${icon('upload')} Seleziona file di backup<input id="backup-file" type="file" accept="application/json,.json" /></label></div>
    <div class="panel setting-card"><div class="subject-symbol teal" style="margin-bottom:15px">${icon('plus')}</div><h3>Anteprima di un capitolo JSON</h3><p>Carica un capitolo validato sul solo dispositivo corrente, senza modificare il repository. È utile per verificare i contenuti prima della pubblicazione.</p><label class="upload-label" for="chapter-file">${icon('upload')} Carica capitolo JSON<input id="chapter-file" type="file" accept="application/json,.json" /></label><p style="margin-top:14px"><strong>${local.length}</strong> capitoli solo locali. Anche questi sono inclusi nel backup.</p>${local.length?`<div class="stack gap-sm">${local.map(c=>`<div class="hstack between" style="font-size:11px;gap:8px"><span>${esc(c.title)}</span>${btn('Elimina','delete-local',`data-chapter="${esc(c.id)}"`,'btn small danger')}</div>`).join('')}</div>`:''}</div>
    <div class="panel setting-card"><div class="subject-symbol orange" style="margin-bottom:15px">${icon('cloud')}</div><h3>Pubblica i capitoli per tutti i dispositivi</h3><p>Metti il file JSON nella cartella <code>content/subjects/</code> del repository GitHub e registra il capitolo in <code>content/manifest.json</code>. Non occorre modificare JavaScript o interfaccia.</p><p>Il sito pubblico può essere letto da chi conosce il suo URL: non inserire dati privati nei capitoli.</p><a class="text-link" href="https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site" target="_blank" rel="noopener noreferrer">Guida GitHub Pages ${icon('arrow')}</a></div>
  </div><div class="section-heading"><h2>Informazioni sui tuoi dati</h2></div><div class="panel"><div class="stack"><div class="switchline"><div><strong style="font-size:13px">Salvataggio locale</strong><p class="page-subtitle">${isTemporaryStorage()?'Archivio temporaneo: IndexedDB non disponibile.':'IndexedDB attivo su questo browser.'}</p></div><span class="badge ${isTemporaryStorage()?'warning':'success'}">${isTemporaryStorage()?'Temporaneo':'Locale'}</span></div><hr style="border:0;border-top:1px solid var(--line);width:100%"><div class="switchline"><div><strong style="font-size:13px">Nessuna sincronizzazione automatica</strong><p class="page-subtitle">Le valutazioni su due dispositivi diversi non si sincronizzano da sole. Usa il backup JSON per trasferirle.</p></div>${icon('lock')}</div><div class="note warning">${icon('alert')} Cancellare i dati del browser, utilizzare la navigazione privata o cambiare dispositivo può eliminare i progressi non esportati. Esporta periodicamente un backup.</div></div></div>`,'settings','Impostazioni');
}
function render(){
  if(!catalog)return;
  const {segments}=routeParts();const section=segments[0]||'dashboard';
  const view=section==='dashboard'?renderDashboard():section==='subject'?renderSubject(segments[1]):section==='reviews'?renderReviews():section==='library'?renderLibrary():section==='study'?renderStudy():section==='settings'?renderSettings():layout(errorView('Pagina non trovata'),'dashboard','Errore');
  root.innerHTML=view;
  document.documentElement.dataset.theme=settings.theme;
  document.body.classList.toggle('dark',settings.theme==='dark');
  renderMathIfNeeded();
}
let mathPromise=null;
function renderMathIfNeeded(){
  if(!root.querySelector('.math-block, .math-inline'))return;
  if(!mathPromise){
    mathPromise=new Promise((resolve,reject)=>{
      window.MathJax={tex:{inlineMath:[['\\(','\\)']],displayMath:[['\\[','\\]']],processEscapes:true},options:{skipHtmlTags:['script','noscript','style','textarea','pre','code']}};
      const sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';sc.async=true;sc.onload=resolve;sc.onerror=()=>reject(new Error('Formula non renderizzata: servizio esterno non disponibile'));document.head.appendChild(sc);
    });
  }
  mathPromise.then(()=>window.MathJax?.typesetPromise?.(root.querySelectorAll('.math-block, .math-inline'))).catch(()=>{
    if(!window.mathWarningShown){window.mathWarningShown=true;toast('Le formule TeX sono visualizzate come testo: connessione a MathJax non disponibile.','error');}
  });
}
async function refreshFromStorage(){
  const [r,h,s,l]=await Promise.all(['reviews','history','settings','localChapters'].map(getAll));
  reviews=Object.fromEntries(r.map(x=>[x.id,x]));history=h;settings={theme:'light',...Object.fromEntries(s.map(x=>[x.key,x.value]))};localChapters=l;
  catalog=combineCatalog(published,localChapters.map(x=>x.data));
}
async function doRate(rating){
  if(!session||!session.revealed)return;
  const card=catalog.cards.find(c=>c.id===session.cards[session.index]);if(!card)return;
  const old=reviews[card.id]||{id:card.id,subjectId:card.subjectId,chapterId:card.chapterId,topicId:card.topicId};
  const next=scoreReview(old,rating);
  const entry={id:`${card.id}:${Date.now()}:${Math.random().toString(36).slice(2,10)}`,cardId:card.id,subjectId:card.subjectId,chapterId:card.chapterId,rating,at:next.lastReviewedAt,dueOn:next.dueOn};
  try {await put('reviews',next);await put('history',entry);}catch(error){toast('Impossibile salvare il ripasso: '+error.message,'error');return;}
  reviews[card.id]=next;history.push(entry);session.answered++;session.index++;session.revealed=false;render();window.scrollTo(0,0);
}
async function updateDifficult(cardId){
  const card=catalog.cards.find(c=>c.id===cardId);if(!card)return;
  const old=reviews[cardId]||{id:cardId,subjectId:card.subjectId,chapterId:card.chapterId,topicId:card.topicId,attempts:0,successes:0,stage:-1};
  const next={...old,hard:!old.hard,updatedAt:new Date().toISOString()};
  try{await put('reviews',next);reviews[cardId]=next;render();toast(next.hard?'Scheda segnata come difficile':'Scheda rimossa dai difficili','success');}catch(error){toast(error.message,'error');}
}
async function handleBackupUpload(input){
  const file=input.files[0];if(!file)return;
  try {
    if(file.size>20_000_000)throw new Error('Backup troppo grande (massimo 20 MB)');
    const raw=JSON.parse(await file.text());
    const overwrite=$('#overwrite-import')?.checked||false;
    if(overwrite&&!confirm('Stai per sovrascrivere i progressi locali che hanno lo stesso ID. Confermi?'))return;
    const result=await importBackup(raw,{overwrite});
    await refreshFromStorage();render();toast(`Backup importato: ${result.added} aggiunti, ${result.overwritten} sostituiti, ${result.skipped} preservati.`,'success');
  }catch(error){toast('Importazione fallita: '+error.message,'error');}
}
async function handleChapterUpload(input){
  const file=input.files[0];if(!file)return;
  try{
    if(file.size>5_000_000)throw new Error('Capitolo troppo grande (massimo 5 MB)');
    const raw=JSON.parse(await file.text());
    const normalized=validateChapter(raw);
    if(!getSub(normalized.subjectId))throw new Error('Materia non riconosciuta. Usa uno degli ID del manifest.');
    if(published.chapters.some(ch=>ch.id===normalized.id))throw new Error('Questo capitolo è già pubblicato: aggiorna il relativo file nel repository.');
    const otherCards=catalog.cards.filter(c=>c.chapterId!==normalized.id);
    if(normalized.cards.some(c=>otherCards.some(x=>x.id===c.id)))throw new Error('Almeno un ID flashcard è utilizzato in un altro capitolo');
    const existing=catalog.chapters.find(ch=>ch.id===normalized.id);
    if(existing&&!confirm('Esiste già un capitolo locale con lo stesso ID. Vuoi aggiornarlo, mantenendo i progressi delle schede con ID invariati?'))return;
    await put('localChapters',{id:normalized.id,data:raw,updatedAt:new Date().toISOString()});
    await refreshFromStorage();render();toast(`Capitolo importato: ${normalized.cards.length} schede. Rimane sul dispositivo fino alla pubblicazione.`, 'success');
  }catch(error){toast('Capitolo non caricato: '+error.message,'error');}
}
function downloadBlob(contents,name){
  const blob=new Blob([contents],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function redrawFilter(key,value){
  libraryFilter[key]=value;
  if(key==='subject'){libraryFilter.chapter='';libraryFilter.topic='';}
  if(key==='chapter')libraryFilter.topic='';
  render();
}
root.addEventListener('click',async event=>{
  const control=event.target.closest('[data-action]');if(!control)return;
  const action=control.dataset.action;
  try{
    if(action==='theme'){
      settings.theme=settings.theme==='dark'?'light':'dark';await put('settings',{key:'theme',value:settings.theme});render();
    }else if(action==='start'){
      startStudy({subject:control.dataset.subject||'',chapter:control.dataset.chapter||'',topic:control.dataset.topic||'',card:control.dataset.card||'',mode:control.dataset.mode||'all'});
    }else if(action==='start-filtered'){
      const arr=libraryData();const random=control.dataset.random==='true';startStudy({mode:'all',random},random?arr.map(v=>({r:Math.random(),v})).sort((a,b)=>a.r-b.r).map(x=>x.v):arr);
    }else if(action==='reveal'){
      if(session){session.revealed=true;render();}
    }else if(action==='rate'){
      await doRate(Number(control.dataset.rating));
    }else if(action==='skip'){
      if(session){session.index++;session.revealed=false;render();window.scrollTo(0,0);}
    }else if(action==='end'){
      if(session&&session.index<session.cards.length&&!confirm('Uscire dalla sessione? Le valutazioni già effettuate sono salvate.'))return;
      session=null;window.location.hash='#/library';
    }else if(action==='hard'){
      await updateDifficult(control.dataset.card);
    }else if(action==='export'){
      const backup=await exportBackup();downloadBlob(JSON.stringify(backup,null,2),`magistrale-backup-${localDay()}.json`);toast('Backup esportato. Conservalo in un luogo sicuro.','success');
    }else if(action==='delete-local'){
      if(confirm('Eliminare questo capitolo locale? I progressi registrati delle sue schede resteranno nel database e nel backup.')){
        await remove('localChapters',control.dataset.chapter);await refreshFromStorage();render();toast('Capitolo locale rimosso; valutazioni preservate.','success');
      }
    }
  }catch(error){console.error(error);toast(error.message,'error');}
});
let searchTimer=null;
root.addEventListener('change',event=>{
  const target=event.target;
  if(target.id==='backup-file'){handleBackupUpload(target);return;}
  if(target.id==='chapter-file'){handleChapterUpload(target);return;}
  if(target.dataset.filter)redrawFilter(target.dataset.filter,target.value);
});
root.addEventListener('input',event=>{
  const t=event.target;if(t.dataset.filter!=='search')return;
  clearTimeout(searchTimer);searchTimer=setTimeout(()=>{
    const pos=t.selectionStart;libraryFilter.search=t.value;
    render();const element=$('#search-box');if(element){element.focus();element.setSelectionRange(pos,pos);}
  },250);
});
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);});

(async()=>{
  try{
    await initDatabase();
    published=await loadPublishedCatalog();
    await refreshFromStorage();render();
  }catch(error){console.error(error);root.innerHTML=`<div class="loading-screen"><div class="error-panel"><h2>Impossibile avviare l'applicazione</h2><p>${esc(error.message)}</p><p>Avvia un server web locale oppure pubblica i file su GitHub Pages. L'apertura diretta tramite <code>file://</code> potrebbe bloccare il caricamento dei JSON.</p></div></div>`;}
})();
