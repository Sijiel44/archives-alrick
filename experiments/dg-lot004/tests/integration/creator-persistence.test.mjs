import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {createGuardedCreatorPersistence,CYCLE_KEY,CYCLE_SCHEMA,ENVELOPE} from '../../tools/creator-persistence.mjs';
function memory(init={}){
 const store=new Map(Object.entries(init));
 return {store,getItem:k=>store.has(k)?store.get(k):null,
  setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
}
function locks(){
 const queues=new Map();
 return {request:async(key,_opt,fn)=>{
  const prior=queues.get(key)??Promise.resolve();
  let release;const pending=new Promise(r=>release=r);
  queues.set(key,pending);
  await prior;try{return await fn();}finally{release();if(queues.get(key)===pending)queues.delete(key);}
 }};
}
function make(area,l){return createGuardedCreatorPersistence({area,locks:l,cryptoAPI:webcrypto});}
function cycle(rev,id='cycle-fictive-1'){return {schema:CYCLE_SCHEMA,id,revision:rev,
  drafts:{item:{future:'keep'}},extensions:{privateNotes:'CANARY_PRIVATE'} };}
test('P0 S07: foreign opaque JSON at existing key refused before mount, never overwritten or deleted',async()=>{
 const value='{"kind":"legacy-or-real","private":"CONFIDENTIEL"}',area=memory({[CYCLE_KEY]:value});
 assert.throws(()=>make(area,locks()),/FOREIGN_CREATOR_KEY/);
 assert.equal(area.getItem(CYCLE_KEY),value);
});
test('P0 S07b: valid but untagged old L004 cycle refused and retained exactly',()=>{
 const value=JSON.stringify(cycle(5)),area=memory({[CYCLE_KEY]:value});
 assert.throws(()=>make(area,locks()),/FOREIGN_CREATOR_KEY/);
 assert.equal(area.getItem(CYCLE_KEY),value);
});
test('P0 S08: two tabs same revision: first confirmed, stale second rejected (no overwrite)',async()=>{
 const area=memory(),l=locks(),a=make(area,l),b=make(area,l);
 assert.deepEqual(await a.save(cycle(1)),{saved:true,revision:1});
 const aLoaded=await a.load(),bLoaded=await b.load();
 assert.deepEqual(aLoaded,bLoaded);
 const [one,two]=await Promise.allSettled([a.save({...aLoaded,revision:2,from:'A'}),b.save({...bLoaded,revision:2,from:'B'})]);
 assert.equal([one.status,two.status].filter(x=>x==='fulfilled').length,1);
 assert.equal([one.status,two.status].filter(x=>x==='rejected').length,1);
 assert.equal((await a.load()).revision,2);
 assert.ok(['A','B'].includes((await a.load()).from));
});
test('P0 S09: stale cleanup never deletes new revision, then exact owner cleanup permitted',async()=>{
 const area=memory(),l=locks(),a=make(area,l),b=make(area,l);
 await a.save(cycle(1));await b.save(cycle(2));
 const raw=area.getItem(CYCLE_KEY);
 await assert.rejects(a.deleteIfOwned({cycleId:'cycle-fictive-1',revision:1}),/CLEANUP_CONFLICT/);
 assert.equal(area.getItem(CYCLE_KEY),raw);
 await assert.rejects(a.deleteIfOwned({cycleId:'other',revision:2}),/CLEANUP_CONFLICT/);
 assert.equal(area.getItem(CYCLE_KEY),raw);
 assert.equal((await b.deleteIfOwned({cycleId:'cycle-fictive-1',revision:2})).deleted,true);
 assert.equal(area.getItem(CYCLE_KEY),null);
});
test('P0: incorrect digest prevents reading and overwriting a tampered envelope',async()=>{
 const area=memory(),a=make(area,locks());await a.save(cycle(1));
 const e=JSON.parse(area.getItem(CYCLE_KEY));assert.equal(e.kind,ENVELOPE);
 e.cycle.extensions.privateNotes='MUTATED';area.setItem(CYCLE_KEY,JSON.stringify(e));
 const value=area.getItem(CYCLE_KEY);
 await assert.rejects(a.load(),/DIGEST_DRIFT/);
 await assert.rejects(a.save(cycle(2)),/DIGEST_DRIFT/);
 assert.equal(area.getItem(CYCLE_KEY),value);
});
test('P0: failed write or missing intertab lock cannot be passed off as saved',async()=>{
 const area=memory(),blocked={...area,setItem:()=>{throw Error('QUOTA_EXCEEDED');}};
 const a=make(blocked,locks());await assert.rejects(a.save(cycle(1)),/QUOTA_EXCEEDED/);
 assert.equal(area.getItem(CYCLE_KEY),null);
 assert.throws(()=>createGuardedCreatorPersistence({area,cryptoAPI:webcrypto}),/Web Locks requis/);
});
test('P0: unknown private fields remain intact through durable reload; no side effects',async()=>{
 const area=memory(),a=make(area,locks()),state=cycle(1);
 state.extensions.extra={unknown:['A','B'],private:'KEEP'};
 await a.save(state);const out=await a.load();
 assert.deepEqual(out.extensions,state.extensions);
 assert.notStrictEqual(out,state);
 assert.equal(JSON.parse(area.getItem(CYCLE_KEY)).cycle.extensions.privateNotes,'CANARY_PRIVATE');
});
