/**
 * ARCHIVES P0 — tests contractuels bloquants pour 05, à copier sous
 * experiments/dg-lot004/tests/storage/P0_CAUSALITY_ARCHIVES.test.mjs
 * Exécuter sur le clone #95 : node --import tsx --test experiments/dg-lot004/tests/storage/P0_CAUSALITY_ARCHIVES.test.mjs
 * Vrais modules ARCHIVES+runtime L003 ; stockage Map/locks coopératifs simulés.
 * PAS un test Chrome, PAS une preuve de verrou inter-onglets natif.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as owner from '../../../dg-lot003/src/storage/storage.mjs';
import {createValidatedStorage} from '../../../dg-lot003/tools/runtime.mjs';

const KEY='cer.dg003.private.campaign.v0';
const copy=x=>structuredClone(x);
const base=()=>({schema:owner.STORAGE_SCHEMA,id:'p0-causality-fictive',title:'Fictive',revision:0,
 characters:[],creatures:[],scenes:[],activeSceneId:'',privateNotes:[],
 extensions:{futureUnknown:{opaque:{p:'remain'}}}});
function area(){const m=new Map();return {getItem:k=>m.get(k)??null,
 setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),raw:()=>m.get(KEY)};}
function fakeLocks(){let chain=Promise.resolve();return {request(_name,_options,task){const p=chain.then(task);chain=p.catch(()=>{});return p;}};}
function pair(){const data=area(),locks=fakeLocks();return {data,
 a:createValidatedStorage(owner,data,{indexedDB:null,locks}),
 b:createValidatedStorage(owner,data,{indexedDB:null,locks})};}
async function revisionN(store,n){let p=base();await store.save(p);
 for(let k=1;k<=n;k++){p=copy(p);p.revision=k;p.scenes.push({id:'s'+k,title:'Scène '+k,privateNotes:'MJ only'});await store.save(p);}return p;}

test('Q-CAS-01 stale base R4 cannot overwrite committed R5 by claiming target R9',async()=>{
 const {a,b,data}=pair();await revisionN(a,4);const observedR4=await a.load();
 const r5=copy(observedR4);r5.revision=5;r5.scenes.push({id:'s5',title:'B durable',privateNotes:'secret-B'});
 await b.save(r5);const rawR5=data.raw();const rereadR5=await a.load();assert.deepEqual(rereadR5,r5);
 const forged=copy(observedR4);forged.revision=9;
 forged.scenes.push({id:'stale-r9',title:'A stale',privateNotes:'secret-A'});
 await assert.rejects(a.save(forged),/base|parent|stale|revision|concurr|conflict|empreinte|digest|collision/i,
   'Higher target revision must not bypass parent identity');
 assert.equal(data.raw(),rawR5,'R5 raw storage bytes must be unchanged');
 assert.deepEqual(await b.load(),r5,'R5 and unknown fields must survive');
});

test('Q-RESTORE-02 preview R4 then B commits R5: restore commit must fail closed, preserve R5',async()=>{
 const {a,b,data}=pair();await revisionN(a,4);const r4=await a.load();
 const bytes=await a.exportPrivate(r4);const preview=await a.previewRestore({bytes});
 const restored=await a.restore(preview,{previous:r4});
 const r5=copy(r4);r5.revision=5;r5.scenes.push({id:'s5',title:'B durable',privateNotes:'still private'});
 await b.save(r5);const rawR5=data.raw();
 await assert.rejects(a.save(restored),/restore|base|parent|stale|revision|concurr|conflict|empreinte|digest|collision|confirmation/i,
   'Restore preview must be bound to exact target parent at commit');
 assert.equal(data.raw(),rawR5,'No silent overwrite after preview');
 assert.deepEqual(await b.load(),r5,'Persisted latest must survive');
 const exportedAgain=await b.exportPrivate(r5);
 assert.ok(exportedAgain instanceof Uint8Array&&bytes instanceof Uint8Array);
});

test('Q-CATALOG-03 catalog append must reject a stale parent higher target revision, preserve drafts',async()=>{
 const {a,b,data}=pair();await revisionN(a,4);const stale=await a.load();
 const r5=copy(stale);r5.revision=5;r5.scenes.push({id:'s5',title:'B durable'});await b.save(r5);
 const rawR5=data.raw();const staleTarget=copy(stale);staleTarget.revision=9;
 const entry={id:'proposal:item:fiction',version:'0.1.0',name:'Objet fictif',entryType:'item'};
 const original={schema:'cer.creator.dg003.descriptive.v0',kind:'item',name:'Objet fictif',version:'0.1.0',unknown:'retain'};
 await assert.rejects(a.appendCatalog(staleTarget,entry,()=>({ok:true}),original),
   /base|parent|stale|revision|concurr|conflict|empreinte|digest|collision/i,
   'appendCatalog must share same causal parent precondition');
 assert.equal(data.raw(),rawR5);assert.deepEqual(await b.load(),r5);
});
