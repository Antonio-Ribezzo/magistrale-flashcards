const DB_NAME = 'magistrale-flashcards-v1';
const VERSION = 1;
const STORES = ['reviews', 'history', 'settings', 'localChapters'];
let database = null;
let temporary = false;
const fallback = Object.fromEntries(STORES.map(s=>[s,new Map()]));

export function isTemporaryStorage() {return temporary;}
export async function initDatabase() {
  if (!('indexedDB' in window)) {temporary = true;return false;}
  try {
    database = await new Promise((resolve,reject)=>{
      const request = indexedDB.open(DB_NAME, VERSION);
      request.onupgradeneeded = () => {
        const db=request.result;
        for(const store of STORES) if(!db.objectStoreNames.contains(store)) db.createObjectStore(store,{keyPath:store==='settings'?'key':'id'});
      };
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
      request.onblocked=()=>reject(new Error('Archivio bloccato da un’altra scheda'));
    });
    return true;
  } catch(error) {console.warn('IndexedDB non disponibile:',error);temporary=true;return false;}
}
function requestStore(store,mode,runner){
  if(temporary){return Promise.resolve(runner(null));}
  return new Promise((resolve,reject)=>{
    const tx=database.transaction(store,mode);const os=tx.objectStore(store);
    let result;
    try {result=runner(os);} catch(error){reject(error);return;}
    if(result && typeof result.onsuccess!=='undefined' && mode === 'readonly') {
      result.onsuccess=()=>resolve(result.result);
      result.onerror=()=>reject(result.error);
    } else {
      tx.oncomplete=()=>resolve(result);
      tx.onerror=()=>reject(tx.error);
      tx.onabort=()=>reject(tx.error);
    }
  });
}
export function getAll(store) {
  if(!STORES.includes(store))throw new Error('Archivio non valido');
  if(temporary)return Promise.resolve([...fallback[store].values()]);
  return requestStore(store,'readonly',os=>os.getAll());
}
export function put(store,entry){
  if(!STORES.includes(store))throw new Error('Archivio non valido');
  if(temporary){fallback[store].set(store==='settings'?entry.key:entry.id,structuredClone(entry));return Promise.resolve();}
  return requestStore(store,'readwrite',os=>os.put(entry)).then(()=>undefined);
}
export function remove(store,key){
  if(!STORES.includes(store))throw new Error('Archivio non valido');
  if(temporary){fallback[store].delete(key);return Promise.resolve();}
  return requestStore(store,'readwrite',os=>os.delete(key)).then(()=>undefined);
}
export async function exportBackup(){
  const [reviews,history,settings,localChapters]=await Promise.all(STORES.map(getAll));
  return {format:'magistrale-flashcards-backup',version:1,exportedAt:new Date().toISOString(),reviews,history,settings,localChapters};
}
export async function importBackup(data,{overwrite=false}={}){
  if(!data || data.format!=='magistrale-flashcards-backup' || data.version!==1)throw new Error('Questo file non è un backup compatibile');
  for(const store of STORES)if(!Array.isArray(data[store]))throw new Error(`Backup incompleto: ${store}`);
  // Validate entire backup BEFORE writing anything: avoid partial imports on malformed files.
  for(const store of STORES){
    const key=store==='settings'?'key':'id';
    const seen=new Set();
    for(const item of data[store]){
      if(!item || typeof item!=='object' || typeof item[key]!=='string' || !item[key].trim() || seen.has(item[key]))throw new Error(`Elemento non valido o duplicato: ${store}`);
      seen.add(item[key]);
      if(store==='reviews' && (!Number.isSafeInteger(item.attempts) || item.attempts<0 || (item.attempts>0 && !/^\d{4}-\d{2}-\d{2}$/.test(item.dueOn || ''))))throw new Error('Record di ripasso non valido');
      if(store==='history' && (typeof item.cardId!=='string'||typeof item.at!=='string'))throw new Error('Storico non valido');
      if(store==='localChapters' && (!item.data || item.data.chapter?.id!==item.id))throw new Error('Capitolo locale non valido');
    }
  }
  const existing=Object.fromEntries(await Promise.all(STORES.map(async s=>[s,new Set((await getAll(s)).map(x=>s==='settings'?x.key:x.id))])));
  const counts={added:0,overwritten:0,skipped:0};
  for(const store of STORES){
    const key=store==='settings'?'key':'id';
    for(const item of data[store]){
      if(existing[store].has(item[key])&&!overwrite){counts.skipped++;continue;}
      await put(store,item);if(existing[store].has(item[key]))counts.overwritten++;else counts.added++;
    }
  }
  return counts;
}
