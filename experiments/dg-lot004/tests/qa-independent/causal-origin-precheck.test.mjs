/** QA-L004 independent prequalification causality probes.
 * Exact source ancestor: #95@6004369bc1192f1619ecb0fb71182315be947e6b.
 * Fictional Map + cooperative locks: NOT real Chrome, NOT production qualification.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as owner from '../../../dg-lot003/src/storage/storage.mjs';
import {createValidatedStorage} from '../../../dg-lot003/tools/runtime.mjs';

const KEY='cer.dg003.private.campaign.v0';
const copy=x=>structuredClone(x);
const base=()=>({schema:owner.STORAGE_SCHEMA,id:'qa-causal-fictive',
 title:'Campagne QA fictive',revision:0,characters:[],creatures:[],scenes:[],
 activeSceneId:'',privateNotes:[],extensions:{unknownFuture:{keep:'SOURCE-RAW'}}});
const area=()=>{
 const map=new Map();
 return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k),raw:()=>map.get(KEY)};
};
const locks=()=>{let queue=Promise.resolve();return {request(_name,_options,fn){
 const x=queue.then(fn);queue=x.catch(()=>{});return x;
}}};
function setup(){
 const disk=area(),lock=locks(),newAdapter=()=>createValidatedStorage(owner,disk,{indexedDB:null,locks:lock});
 return {disk,newAdapter};
}
async function r4(writer){
 let p=base();await writer.save(p);
 for(let k=1;k<=4;k++){
  p=copy(p);p.revision=k;p.scenes.push({id:'s'+k,title:'Version '+k,privateNotes:'MJ-ONLY-'+k});
  await writer.save(p);
 }
 return p;
}
function r5From(r4){const r=copy(r4);r.revision=5;r.scenes.push({id:'s5',title:'B durable',privateNotes:'MJ-ONLY-B'});return r;}
function forgeryFrom(r4){const r=copy(r4);r.revision=9;r.scenes.push({id:'s9-stale',title:'Old R4 lifted to R9',privateNotes:'MJ-ONLY-A'});return r;}
const same=(p,q)=>assert.deepEqual(p,q);
test('QA-CAUSAL-A original owner R4 then B.load R4 commits R5: stale R9 refused',async()=>{
 const {disk,newAdapter}=setup(),a=newAdapter(),b=newAdapter();
 const old=await r4(a);
 await b.load();
 const r5=r5From(old);await b.save(r5);
 const durable=disk.raw();await a.load();
 await assert.rejects(a.save(forgeryFrom(old)),/parent|causal|stale|conflict|revision/i);
 assert.equal(disk.raw(),durable);same(await b.load(),r5);
});
test('QA-CAUSAL-B new adapter first LOADS R5, receives R4-derived object tagged R9: must refuse stale content',async()=>{
 const {disk,newAdapter}=setup(),creator=newAdapter(),writer=newAdapter();
 const old=await r4(creator);
 await writer.load();
 const r5=r5From(old);await writer.save(r5);
 const verifier=newAdapter();same(await verifier.load(),r5); // binds parent R5 legitimately.
 const durable=disk.raw();
 let accepted=false;
 try{await verifier.save(forgeryFrom(old));accepted=true;}catch(error){
  console.log('QA_CAUSAL_B_REJECT',String(error?.message??error));
 }
 const after=await newAdapter().load();
 console.log('QA_CAUSAL_B_EVIDENCE',JSON.stringify({
  accepted,originalRevision:old.revision,verifiedParent:r5.revision,
  submittedRevision:9,durableRevision:after?.revision,
  lostBScene:!after?.scenes?.some(x=>x.id==='s5'),
  unknownRetained:after?.extensions?.unknownFuture?.keep==='SOURCE-RAW'}));
 assert.equal(accepted,false,'Stale R4-derived payload must not become accepted merely because adapter observed R5');
 assert.equal(disk.raw(),durable,'B durable bytes must not be replaced by stale R4-derived payload');
 same(after,r5);
});
test('QA-CAUSAL-C fresh editor loads R5 then derives R6 from R5: legitimate causal update is permitted',async()=>{
 const {newAdapter}=setup(),creator=newAdapter(),writer=newAdapter();
 const old=await r4(creator);await writer.load();const r5=r5From(old);await writer.save(r5);
 const editor=newAdapter();const read=await editor.load();same(read,r5);
 const next=copy(read);next.revision=6;next.scenes.push({id:'s6',title:'Real R5 child',privateNotes:'MJ-ONLY-CHILD'});
 await editor.save(next);same(await newAdapter().load(),next);
});
