import {initialCampaign,assertCampaign,applyCommand,commandSignature,fail,clone,DEMO_ID} from './contracts.mjs';
export const DB_NAME='cer.arch-storage001.fiction-only.v1';
const DB_VERSION=1;
function requestResult(request,resolve,reject){request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error??Error('IDB_REQUEST_ERROR'));}
export async function openStore({factory=globalThis.indexedDB,name=DB_NAME}={}){
 if(!factory)fail('IDB_UNAVAILABLE');
 const db=await new Promise((resolve,reject)=>{
  const req=factory.open(name,DB_VERSION);
  req.onupgradeneeded=()=>{
   const d=req.result;
   if(!d.objectStoreNames.contains('campaigns'))d.createObjectStore('campaigns',{keyPath:'id'});
   if(!d.objectStoreNames.contains('events'))d.createObjectStore('events',{keyPath:['campaignId','eventId']});
  };
  req.onblocked=()=>reject(Object.assign(Error('DB_BLOCKED'),{code:'DB_BLOCKED'}));
  req.onerror=()=>reject(req.error??Error('DB_OPEN_FAILED'));
  req.onsuccess=()=>resolve(req.result);
 });
 db.onversionchange=()=>db.close();
 let closed=false;
 const approvedPreviews=new WeakMap(); // an untrusted caller cannot forge an import preview with a fresh object
 function txReadCampaign(id){return new Promise((resolve,reject)=>{
  if(closed)return reject(Error('DB_CLOSED'));
  const tx=db.transaction('campaigns','readonly'),req=tx.objectStore('campaigns').get(id);
  let value;
  req.onsuccess=()=>{value=req.result?clone(req.result):null;};
  tx.oncomplete=()=>resolve(value);tx.onabort=()=>reject(tx.error??Error('TX_ABORTED'));tx.onerror=()=>{};
 });}
 function getEvents(id){return new Promise((resolve,reject)=>{
  if(closed)return reject(Error('DB_CLOSED'));
  const tx=db.transaction('events','readonly'),range=IDBKeyRange.bound([id,''],[id,'\uffff']);
  let value=[];const req=tx.objectStore('events').getAll(range);
  req.onsuccess=()=>{value=req.result.map(clone).sort((a,b)=>a.seq-b.seq);};
  tx.oncomplete=()=>resolve(value);tx.onabort=()=>reject(tx.error??Error('TX_ABORTED'));
 });}
 function writeCommand(command,{injectFailure=null}={}){
  const signature=commandSignature(command);
  let outcome=null;
  return new Promise((resolve,reject)=>{
   if(closed)return reject(Error('DB_CLOSED'));
   const tx=db.transaction(['campaigns','events'],'readwrite',{durability:'strict'});
   const campaigns=tx.objectStore('campaigns'),events=tx.objectStore('events');
   let problem=null;
   tx.oncomplete=()=>{
    if(injectFailure==='ack-lost')return reject(Object.assign(Error('ACK_LOST_AFTER_COMMIT'),{code:'ACK_LOST_AFTER_COMMIT'}));
    if(problem)return reject(problem);resolve(clone(outcome));
   };
   tx.onabort=()=>reject(problem??tx.error??Object.assign(Error('TX_ABORTED'),{code:'TX_ABORTED'}));
   tx.onerror=()=>{};
   const raise=(e)=>{problem=e;try{tx.abort()}catch{};};
   events.get([command.campaignId,command.eventId]).onsuccess=function(){
    const existing=this.result;
    if(existing){if(existing.signature!==signature)return raise(Object.assign(Error('ID_COLLISION'),{code:'ID_COLLISION'}));
     outcome={status:'duplicate',revision:existing.seq};return;}
    campaigns.get(command.campaignId).onsuccess=function(){
     try{
      const existingCampaign=this.result;
      if(!existingCampaign)fail('CAMPAIGN_NOT_FOUND');
      if(existingCampaign.revision!==command.expectedRevision)fail('STALE_REVISION');
      const next=applyCommand(existingCampaign,command);
      outcome={status:'committed',revision:next.revision};
      campaigns.put(next);
      events.add({campaignId:command.campaignId,eventId:command.eventId,seq:next.revision,kind:command.kind,signature});
      if(injectFailure==='before-commit')raise(Object.assign(Error('INJECTED_FAILURE_BEFORE_COMMIT'),{code:'INJECTED_FAILURE_BEFORE_COMMIT'}));
     }catch(e){raise(e);}
    };
   };
  });
 }
 function create(campaign=initialCampaign()){
  assertCampaign(campaign);
  return new Promise((resolve,reject)=>{
   const tx=db.transaction(['campaigns','events'],'readwrite',{durability:'strict'}),c=tx.objectStore('campaigns'),e=tx.objectStore('events');let error=null;
   c.get(campaign.id).onsuccess=function(){if(this.result){error=Object.assign(Error('CAMPAIGN_COLLISION'),{code:'CAMPAIGN_COLLISION'});tx.abort();return;}
    c.add(clone(campaign));e.add({campaignId:campaign.id,eventId:'event-create',seq:1,kind:'create-campaign',signature:'genesis'});
   };
   tx.oncomplete=()=>resolve({status:'committed',revision:1});tx.onabort=()=>reject(error??tx.error??Error('TX_ABORTED'));
  });
 }
 async function makeExport(id=DEMO_ID){
  const [campaign,journal]=await Promise.all([txReadCampaign(id),getEvents(id)]);
  if(!campaign)fail('CAMPAIGN_NOT_FOUND');
  // Revision check detects incomplete journal or unknown extra writes.
  if(journal.length!==campaign.revision||journal[journal.length-1]?.seq!==campaign.revision)fail('JOURNAL_INCONSISTENT');
  const {makePrivateArchive}=await import('./private-archive.mjs');return makePrivateArchive({campaign,journal});
 }
 async function previewImport(bytes){
  const {inspectPrivateArchive}=await import('./private-archive.mjs');
  const preview=await inspectPrivateArchive(bytes);
  approvedPreviews.set(preview,{campaign:clone(preview.campaign),journal:clone(preview.journal),sha256:preview.sha256});
  return preview;
 }
 function commitImport(preview){
  const authorized=preview&&approvedPreviews.get(preview);
  if(!authorized||preview.kind!=='private-preview'||preview.sha256!==authorized.sha256||
     JSON.stringify(preview.campaign)!==JSON.stringify(authorized.campaign)||
     JSON.stringify(preview.journal)!==JSON.stringify(authorized.journal))fail('BAD_PREVIEW');
  const c=clone(authorized.campaign),journal=clone(authorized.journal);assertCampaign(c);
  if(journal.length!==c.revision||journal.some((v,i)=>v.seq!==i+1||v.campaignId!==c.id))fail('BAD_JOURNAL');
  return new Promise((resolve,reject)=>{
   const tx=db.transaction(['campaigns','events'],'readwrite',{durability:'strict'}),campaigns=tx.objectStore('campaigns'),events=tx.objectStore('events');let problem=null;
   campaigns.get(c.id).onsuccess=function(){if(this.result){problem=Object.assign(Error('CAMPAIGN_COLLISION'),{code:'CAMPAIGN_COLLISION'});tx.abort();return;}
    campaigns.add(c);for(const event of journal)events.add(event);
   };
   tx.oncomplete=()=>resolve({status:'imported',campaignId:c.id,revision:c.revision});
   tx.onabort=()=>reject(problem??tx.error??Error('TX_ABORTED'));
  });
 }
 return Object.freeze({name,readCampaign:txReadCampaign,listEvents:getEvents,createCampaign:create,applyEvent:writeCommand,exportPrivate:makeExport,previewImport,commitImport,close(){if(!closed){closed=true;db.close();}}});
}
export async function seedFiction(store){
 const {demoCommands}=await import('./fixture.mjs');
 let c=await store.readCampaign(DEMO_ID);
 if(!c){await store.createCampaign(initialCampaign());c=await store.readCampaign(DEMO_ID);}
 const out=[];
 for(const input of demoCommands()){
  const command={...input,campaignId:DEMO_ID,expectedRevision:c.revision};
  const result=await store.applyEvent(command);out.push(result);c=await store.readCampaign(DEMO_ID);
 }
 return {campaign:c,steps:out};
}
