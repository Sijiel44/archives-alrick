/** DG004 P0 parent/restore causality – integrator tests using REAL native ARCHIVES. */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as owner from '../../../dg-lot003/src/storage/storage.mjs';
import {createValidatedStorage} from '../../../dg-lot003/tools/runtime.mjs';
import {studioToArchive} from '../../../dg-lot003/tools/adapters.mjs';

const KEY='cer.dg003.private.campaign.v0';
const campaign=(revision=0)=>({schema:owner.STORAGE_SCHEMA,
 id:'causal-p0-fixture',title:'Campagne P0 fictive',revision,
 characters:[],creatures:[],scenes:[],activeSceneId:'',privateNotes:[],
 extensions:{unknownFuture:{id:'preserve'},canary:'ONLY_MJ'}});
const scene=(c,id)=>{const x=structuredClone(c);x.scenes.push({id,title:id,privateNotes:'PRIVATE_'+id});return x;};
function area(){const map=new Map();return {
 getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k),
 raw:()=>map.get(KEY)??null
};}
function locks(){
 const q=new Map();return {request:async(key,_opts,fn)=>{
  const prior=q.get(key)??Promise.resolve();let done;
  const next=new Promise(resolve=>{done=resolve});q.set(key,next);
  await prior;try{return await fn()}finally{done();if(q.get(key)===next)q.delete(key)}
 }};
}
const port=(a,l=locks(),opts={})=>createValidatedStorage(owner,a,{indexedDB:null,locks:l,...opts});
test('DG004-PARENT-01: old rev4 + fabricated rev9 cannot overwrite concurrently stored rev5',async()=>{
 const a=area(),l=locks(),tabA=port(a,l),tabB=port(a,l);
 await tabA.save(campaign(4));
 const stale=await tabA.load(),other=await tabB.load();
 await tabB.save(scene({...other,revision:5},'real-rev5'));
 const persisted=a.raw();
 const fabricated=scene({...stale,revision:9},'fake-rev9');
 await assert.rejects(tabA.save(fabricated),/causal parent conflict/);
 assert.equal(a.raw(),persisted,'exact raw envelope is immutable on conflict');
 assert.deepEqual((await port(a,l).load()).scenes.map(x=>x.id),['real-rev5']);
 assert.equal((await port(a,l).load()).extensions.unknownFuture.id,'preserve');
});
test('DG004-PARENT-02: new port cannot claim a pre-existing project by just choosing revision 999',async()=>{
 const a=area(),l=locks(),writer=port(a,l);
 await writer.save(campaign(4));const raw=a.raw();
 await assert.rejects(port(a,l).save(scene(campaign(999),'fabricated')),/causal parent conflict/);
 assert.equal(a.raw(),raw);
});
test('DG004-RESTORE-01: project changed between preview and restore => no replacement',async()=>{
 const a=area(),l=locks(),tabA=port(a,l),tabB=port(a,l);
 await tabA.save(scene(campaign(1),'original'));
 const previous=await tabA.load(),baseB=await tabB.load();
 const backup=await owner.exportPrivate(studioToArchive(scene(campaign(0),'old-backup'),owner.createCampaign));
 const preview=await tabA.previewRestore({bytes:backup.bytes});
 await tabB.save(scene({...baseB,revision:2},'newer-tab-B'));
 const intact=a.raw();
 await assert.rejects(tabA.restore(preview,{previous}),/restore causal parent conflict/);
 assert.equal(a.raw(),intact);
 assert.deepEqual((await port(a,l).load()).scenes.map(x=>x.id),['original','newer-tab-B']);
});
test('DG004-RESTORE-02: B writes after A restore() but before A save() => replacement denied',async()=>{
 const a=area(),l=locks(),tabA=port(a,l),tabB=port(a,l);
 await tabA.save(scene(campaign(1),'original'));
 const previous=await tabA.load(),baseB=await tabB.load();
 const backup=await owner.exportPrivate(studioToArchive(scene(campaign(0),'old-backup'),owner.createCampaign));
 const preview=await tabA.previewRestore({bytes:backup.bytes});
 const replacement=await tabA.restore(preview,{previous});
 await tabB.save(scene({...baseB,revision:2},'newer-tab-B'));
 const intact=a.raw();
 await assert.rejects(tabA.save(replacement),/restore causal parent conflict/);
 assert.equal(a.raw(),intact);
 await assert.rejects(tabA.save(replacement),/causal parent conflict|restore/);
 assert.equal(a.raw(),intact);
 assert.deepEqual((await port(a,l).load()).scenes.map(x=>x.id),['original','newer-tab-B']);
});
test('DG004-RESTORE-03: unchanged parent permits explicit exact restoration, preserving unknowns',async()=>{
 const a=area(),l=locks(),tab=port(a,l);
 await tab.save(scene(campaign(2),'original'));const previous=await tab.load();
 const input=scene(campaign(0),'old-backup');
 input.extensions.anotherUnknown={bytes:['1','2'],private:'MUST_KEEP'};
 const backup=await owner.exportPrivate(studioToArchive(input,owner.createCampaign));
 const preview=await tab.previewRestore({bytes:backup.bytes});
 const restored=await tab.restore(preview,{previous});
 await tab.save(restored);
 const round=await port(a,l).load();
 assert.deepEqual(round,restored);
 assert.deepEqual(round.extensions.anotherUnknown,input.extensions.anotherUnknown);
 assert.deepEqual(round.scenes.map(x=>x.id),['old-backup']);
});
test('DG004-RESTORE-04: restoration with manufactured preview or different source denied',async()=>{
 const a=area(),l=locks(),tab=port(a,l);
 await tab.save(campaign(0));
 const original=await tab.load(),backup=await owner.exportPrivate(studioToArchive(campaign(3),owner.createCampaign));
 const preview=await tab.previewRestore({bytes:backup.bytes});
 await assert.rejects(tab.restore({...preview,privatePending:{...preview.privatePending}},{previous:original}),/unverified preview/);
 const changed=scene(original,'uncommitted');
 await assert.rejects(tab.restore(preview,{previous:changed}),/source snapshot conflict/);
 assert.deepEqual((await port(a,l).load()).scenes,[]);
});
test('DG004-LOCK-01: Web Locks unavailable in browser mode => fail closed, even if revision rises',async()=>{
 const a=area();const before=a.raw();
 const unsafe=port(a,null,{browserContext:true});
 await assert.rejects(unsafe.save(campaign(8)),/Web Locks unavailable/);
 assert.equal(a.raw(),before);
});
test('DG004-PARENT-03: appendCatalog from old campaign parent refuses overwrite even with higher revision',async()=>{
 const a=area(),l=locks(),tabA=port(a,l),tabB=port(a,l);
 await tabA.save(campaign(4));
 const old=await tabA.load(),current=await tabB.load();
 await tabB.save(scene({...current,revision:5},'newer'));
 const raw=a.raw();
 const stale={...old,revision:20};
 await assert.rejects(tabA.appendCatalog(stale,{id:'fictive-catalogue',version:'0.1.0'},
  ()=>({ok:true}),{schema:'fictional.creator.v0',name:'description'}),/causal parent conflict/);
 assert.equal(a.raw(),raw);
});

test('DG004-RESTORE-05: optional Studio UI privateNotes absent is native [] without hiding real edits',async()=>{
 const a=area(),l=locks(),tab=port(a,l),initial=campaign(3);
 delete initial.privateNotes;
 await tab.save(initial);
 const backup=await owner.exportPrivate(studioToArchive(scene(campaign(0),'old-backup'),owner.createCampaign));
 const preview=await tab.previewRestore({bytes:backup.bytes});
 const restored=await tab.restore(preview,{previous:structuredClone(initial)});
 await tab.save(restored);
 const persisted=await port(a,l).load();
 assert.deepEqual(persisted.scenes.map(x=>x.id),['old-backup']);
 assert.equal(persisted.extensions.unknownFuture.id,'preserve');
});

test('DG004-RESTORE-06: legacy MJ UI lacks only integrator-persisted catalogue fields; restore preserves both',async()=>{
 const a=area(),l=locks(),tab=port(a,l),ui=campaign(0);
 await tab.save(ui);
 const entry={id:'catalog:fiction',version:'0.1.0',name:'Objet fictif',entryType:'item'};
 const original={schema:'cer.creator.dg003.descriptive.v0',kind:'item',name:'Objet fictif',version:'0.1.0',unknownPrivate:{keep:true}};
 await tab.appendCatalog(ui,entry,()=>({ok:true}),original);
 const durable=await tab.load();
 assert.equal(durable.extensions.catalog.length,1);
 assert.equal(durable.extensions.creatorDrafts[0].original.unknownPrivate.keep,true);
 assert.equal(ui.extensions.catalog,undefined,'legacy UI does not adopt creator tables');
 const bytes=await tab.exportPrivate(ui);
 const preview=await tab.previewRestore({bytes});
 const restored=await tab.restore(preview,{previous:ui});
 await tab.save(restored);
 const reread=await port(a,l).load();
 assert.deepEqual(reread.extensions.catalog,durable.extensions.catalog);
 assert.deepEqual(reread.extensions.creatorDrafts,durable.extensions.creatorDrafts);
 assert.deepEqual(reread.extensions.unknownFuture,ui.extensions.unknownFuture);
});
