import test from 'node:test';
import assert from 'node:assert/strict';
import {localDay,addCalendarDays,scoreReview,isDue,reviewState,summaryFor,isMastered} from '../js/scheduler.js';
import {validateChapter,combineCatalog} from '../js/catalog.js';

const chapter = {
 schemaVersion:1, subjectId:'cdg',chapter:{id:'cdg-c01',title:'Capitolo di test',topics:[{id:'topic-01',title:'Tema di test'}]},
 coverage:{sections:[{label:'Paragrafo di test',cardIds:['cdg-c01-q01']}]},
 cards:[{id:'cdg-c01-q01',topicId:'topic-01',question:'Domanda di test?',answer:'Risposta di test.'}]
};
test('testo capitolo conforme e collegamento argomenti',()=>{
 const c=validateChapter(chapter,'cdg');
 assert.equal(c.cards.length,1);assert.equal(c.cards[0].topicTitle,'Tema di test');
});
test('rifiuta ID delle schede duplicati',()=>{
 const copy=structuredClone(chapter);copy.cards.push(copy.cards[0]);
 assert.throws(()=>validateChapter(copy),/duplicato/);
});
test('rifiuta mappa di copertura con ID inesistenti',()=>{
 const copy=structuredClone(chapter);copy.coverage.sections[0].cardIds=['missing'];
 assert.throws(()=>validateChapter(copy),/non trovata/);
});
test('intervalli calendariali gestiscono il passaggio ora legale',()=>{
 assert.equal(addCalendarDays('2027-03-27',1),'2027-03-28');
 assert.equal(addCalendarDays('2027-10-30',1),'2027-10-31');
});
test('prima scheda: risposte buona e perfetta producono intervalli progressivi',()=>{
 const at=new Date(2026,10,23,18,10);
 const base={id:'abc',subjectId:'cdg',chapterId:'cdg-c01'};
 const good=scoreReview(base,2,at);assert.equal(good.intervalDays,1);assert.equal(good.dueOn,'2026-11-24');
 const perfect=scoreReview(good,3,at);assert.equal(perfect.intervalDays,7);
 assert.equal(perfect.stage,2);
});
test('errore riporta a un giorno e interrompe il consolidamento',()=>{
 const at=new Date(2026,10,23,18,10);
 const prior={id:'abc',subjectId:'cdg',chapterId:'cdg-c01',attempts:4,successes:4,stage:5,streak:4};
 const after=scoreReview(prior,0,at);assert.equal(after.intervalDays,1);assert.equal(after.streak,0);
 assert.equal(after.lastRating,0);
});
test('scadenza a data locale: non dipende dall’ora',()=>{
 assert.ok(isDue({attempts:1,dueOn:'2026-11-23'},'2026-11-23'));
 assert.equal(isDue({attempts:1,dueOn:'2026-11-24'},'2026-11-23'),false);
});
test('mai vista non risulta consolidata, anche se presente nel catalogo',()=>{
 const cards=validateChapter(chapter).cards;
 const x=summaryFor(cards,{},'2026-11-23');
 assert.equal(x.new,1);assert.equal(x.studied,0);assert.equal(x.mastered,0);
});
test('capitolo pubblicato prevale sul corrispondente locale',()=>{
 const pub={subjects:[{id:'cdg'}],chapters:[validateChapter(chapter)],errors:[]};
 const out=combineCatalog(pub,[chapter]);
 assert.equal(out.chapters.length,1);
});

test('padronanza rimane verificata anche quando una scheda torna in scadenza',()=>{
 const cards=validateChapter(chapter).cards;
 const rev={id:cards[0].id,attempts:3,successes:3,lastRating:2,stage:3,dueOn:'2026-11-22'};
 assert.ok(isMastered(rev));
 const x=summaryFor(cards,{[cards[0].id]:rev},'2026-11-23');
 assert.equal(x.mastered,1);assert.equal(x.due,1);
});
