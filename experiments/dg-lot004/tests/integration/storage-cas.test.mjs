/** Integrator-owned L003 storage regressions; distinct from owner P0 S01..S09. */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as owner from '../../../dg-lot003/src/storage/storage.mjs';
import {createValidatedStorage} from '../../../dg-lot003/tools/runtime.mjs';

const KEY='cer.dg003.private.campaign.v0';
const base=(id='concurrent-fictive-campaign')=>({
 schema:owner.STORAGE_SCHEMA,id,title:'Campagne fictive',revision:0,
 characters:[],creatures:[],scenes:[],activeSceneId:'',privateNotes:[],
 extensions:{future:{keep:true},privateCanary:'ONLY_MJ'}
});
function area(){
 const map=new Map();let after=null;
 return {getItem:k=>map.get(k)??null,setItem:(k,v)=>{
   map.set(k,String(v));if(after)after(k);
  },removeItem:k=>map.delete(k),after:f=>{after=f}};
}
function locks(){
 const chains=new Map();
 return {request:async(key,_opts,fn)=>{
  const previous=chains.get(key)??Promise.resolve();let release;
  const current=new Promise(resolve=>{release=resolve;});
  chains.set(key,current);await previous;
  try{return await fn();}finally{release();if(chains.get(key)===current)chains.delete(key);}
 }};
}
const adapter=(storage,webLocks)=>createValidatedStorage(owner,storage,{indexedDB:null,locks:webLocks});
test('P0 integrator: two simultaneous L003 writers sharing Web Lock cannot lose committed scene',async()=>{
 const store=area(),lock=locks(),a=adapter(store,lock),b=adapter(store,lock);
 await a.save(base());
 const left=await a.load(),right=await b.load();
 left.scenes.push({id:'scene-a',title:'A'});left.revision++;
 right.scenes.push({id:'scene-b',title:'B'});right.revision++;
 const outcomes=await Promise.allSettled([a.save(left),b.save(right)]);
 assert.equal(outcomes.filter(x=>x.status==='fulfilled').length,1);
 assert.equal(outcomes.filter(x=>x.status==='rejected').length,1);
 assert.match(String(outcomes.find(x=>x.status==='rejected').reason),/causal parent conflict|revision conflict/);
 const persisted=await adapter(store,lock).load();
 assert.equal(persisted.scenes.length,1);
 assert.equal(persisted.extensions.future.keep,true);
 assert.equal(persisted.revision,1);
});
test('P0 integrator: post-commit ACK error propagates with its original reason and saved bytes remain readable',async()=>{
 const store=area(),lock=locks(),a=adapter(store,lock);await a.save(base());
 const update=base();update.revision=1;update.scenes.push({id:'durable-1',title:'Durable'});
 store.after(k=>{if(k===KEY)throw Error('ACK_LOST_AFTER_DURABLE_SETITEM');});
 await assert.rejects(a.save(update),/ACK_LOST_AFTER_DURABLE_SETITEM/);
 store.after(null);
 const opened=await adapter(store,lock).load();
 assert.deepEqual(opened.scenes.map(x=>x.id),['durable-1']);
 assert.equal(opened.extensions.privateCanary,'ONLY_MJ');
});
