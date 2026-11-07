/** Rescue-only regression: uses real L003 ARCHIVES/runtime, fictional Map + serialized locks. */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as owner from '../../../dg-lot003/src/storage/storage.mjs';
import {createValidatedStorage} from '../../../dg-lot003/tools/runtime.mjs';
import {archiveToStudio} from '../../../dg-lot003/tools/adapters.mjs';
const KEY='cer.dg003.private.campaign.v0';
const cp=x=>structuredClone(x);
const base=()=>({schema:owner.STORAGE_SCHEMA,id:'rescue-fiction',title:'Fiction causale',revision:0,
 characters:[],creatures:[],scenes:[],activeSceneId:'',privateNotes:[],
 extensions:{futureUnknown:{deep:{keep:'ALWAYS'}},privateSentinel:'MJ_ONLY_NOT_PUBLIC'}});
function setup(){
 const m=new Map(),disk={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),raw:()=>m.get(KEY)};
 let serial=Promise.resolve();const locks={request(_n,_o,fn){const p=serial.then(fn);serial=p.catch(()=>{});return p;}};
 return {disk,open:()=>createValidatedStorage(owner,disk,{indexedDB:null,locks})};
}
async function write4(port){let p=base();await port.save(p);
 for(let i=1;i<=4;i++){p=cp(p);p.revision=i;p.scenes.push({id:'s'+i,title:'Scene '+i,privateNotes:'Secret '+i});p.activeSceneId='s'+i;await port.save(p);}
 return p;
}
async function setup5(){const env=setup(),a=env.open(),b=env.open(),r4=await write4(a);
 await b.load();const r5=cp(r4);r5.revision=5;r5.scenes.push({id:'s5',title:'B durable',privateNotes:'MJ_B'});r5.activeSceneId='s5';await b.save(r5);
 return {...env,a,b,r4,r5};
}
const refuses=p=>assert.rejects(p,/causal|parent|draft|stale|conflict|revision|collision|provenance|forbidden|unverified/);

test('D01 QA-B: fresh C reads R5 but R4-derived R9 cannot erase s5, raw and unknown unchanged',async()=>{
 const e=await setup5(),c=e.open();assert.deepEqual(await c.load(),e.r5);
 const raw=e.disk.raw(),forged=cp(e.r4);forged.revision=9;forged.scenes.push({id:'stale',title:'old'});
 await refuses(c.save(forged));assert.equal(e.disk.raw(),raw);assert.deepEqual(await e.open().load(),e.r5);
});
test('D02 QA-C: genuine R5-derived R6 additive clone is preserved',async()=>{
 const e=await setup5(),c=e.open();await c.load();const next=cp(e.r5);next.revision=6;
 next.scenes.push({id:'s6',title:'Genuine',privateNotes:'NEW'});next.activeSceneId='s6';await c.save(next);
 assert.deepEqual(await e.open().load(),next);
});
test('D03 existing scene cannot be silently replaced or removed by legacy save',async()=>{
 const e=await setup5(),c=e.open();await c.load();const revised=cp(e.r5);revised.revision=6;revised.scenes[0].title='stale';
 await refuses(c.save(revised));const deleted=cp(e.r5);deleted.revision=6;deleted.scenes.pop();
 await refuses(c.save(deleted));const wrong=cp(e.r5);wrong.revision=6;wrong.activeSceneId='s1';
 await refuses(c.save(wrong));assert.deepEqual(await e.open().load(),e.r5);
});
test('D04 opaque edit session changes exactly one R5 scene without replacing private/unknown data',async()=>{
 const e=await setup5(),c=e.open(),issued=await c.beginEdit();assert.deepEqual(issued.base,e.r5);
 const r6=await c.commitEdit(issued.handle,[{kind:'update-scene',id:'s5',changes:{title:'R6 real',privateNotes:'Updated privately'}}]);
 assert.equal(r6.revision,6);assert.equal(r6.scenes.length,5);assert.equal(r6.scenes[4].privateNotes,'Updated privately');
 assert.equal(r6.scenes[0].privateNotes,'Secret 1');assert.deepEqual(r6.extensions,e.r5.extensions);
});
test('D05 cloned/forged ticket rejected; used ticket cannot replay',async()=>{
 const e=await setup5(),c=e.open(),ticket=await c.beginEdit();
 await refuses(c.commitEdit(cp(ticket.handle),[{kind:'select-scene',id:'s1'}]));
 await refuses(c.commitEdit({},[{kind:'select-scene',id:'s1'}]));
 await c.commitEdit(ticket.handle,[{kind:'select-scene',id:'s1'}]);
 await refuses(c.commitEdit(ticket.handle,[{kind:'select-scene',id:'s2'}]));
});
test('D06 forked ticket supported; sibling becomes stale under same lock',async()=>{
 const e=await setup5(),c=e.open(),ticket=await c.beginEdit(),fork=c.forkEdit(ticket.handle);
 await c.commitEdit(fork,[{kind:'add-scene',scene:{id:'s6',title:'fork'}}]);
 await refuses(c.commitEdit(ticket.handle,[{kind:'add-scene',scene:{id:'bad',title:'duplicate'}}]));
 assert.equal((await e.open().load()).scenes.some(s=>s.id==='bad'),false);
});
test('D07 another adapter committing R6 invalidates earlier R5 edit; no data erased',async()=>{
 const e=await setup5(),c=e.open(),b=e.open(),old=await c.beginEdit(),live=await b.beginEdit();
 await b.commitEdit(live.handle,[{kind:'add-scene',scene:{id:'from-b',title:'B'}}]);const raw=e.disk.raw();
 await refuses(c.commitEdit(old.handle,[{kind:'update-scene',id:'s5',changes:{title:'STALE'}}]));
 assert.equal(e.disk.raw(),raw);
});
test('D08 appendCatalog stale source rejected; latest source retains native drafts/unknowns',async()=>{
 const e=await setup5(),c=e.open();await c.load();const entry={id:'item:fiction',version:'1.0.0',name:'Test',entryType:'item'};
 const original={schema:'fiction',unknown:{retain:17}};const stale=cp(e.r4);stale.revision=9;
 await refuses(c.appendCatalog(stale,entry,()=>({ok:true}),original));
 const result=await c.appendCatalog(e.r5,entry,()=>({ok:true}),original);assert.equal(result.length,1);
 const loaded=await e.open().load();assert.equal(loaded.scenes.length,5);
 assert.equal(loaded.extensions.creatorDrafts[0].original.unknown.retain,17);
 assert.equal(loaded.extensions.futureUnknown.deep.keep,'ALWAYS');
});
test('D09 tampered current existing private field not accepted under an adapter freshly loaded',async()=>{
 const e=await setup5(),c=e.open();await c.load();const tampered=cp(e.r5);tampered.revision=6;
 tampered.extensions.privateSentinel='overwrite';tampered.scenes.push({id:'s6',title:'attacker'});
 await refuses(c.save(tampered));assert.deepEqual(await e.open().load(),e.r5);
});
test('D10 original source semantics via native ARCHIVES export remain readable',async()=>{
 const e=await setup5(),c=e.open(),current=await c.load();const bytes=await c.exportPrivate(current);
 const preview=await owner.previewRestore(bytes);const restored=await owner.commitRestore(preview,{existingProject:null,replace:false});
 const studio=archiveToStudio(restored);
 assert.equal(studio.extensions.futureUnknown.deep.keep,'ALWAYS');
 assert.equal(studio.extensions.privateSentinel,'MJ_ONLY_NOT_PUBLIC');
});
