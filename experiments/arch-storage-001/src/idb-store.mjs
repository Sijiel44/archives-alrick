import {initialCampaign,assertCampaign,applyCommand,commandSignature,fail,clone,DEMO_ID} from './contracts.mjs';
export const DB_NAME='cer.arch-storage001.fiction-only.v1';
export const DB_VERSION=1; // R2: explicit fixed version; no implicit upgrade or destructive migration
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
 let closed=false;
 // A different tab can request a new version: release this connection, never delete data.
 db.onversionchange=()=>{closed=true;db.close();};
 db.onclose=()=>{closed=true;};
 const approvedPreviews=new WeakMap(); // an untrusted caller cannot forge an import preview with a fresh object
 function txReadCampaign(id){return new Promise((resolve,reject)=>{
  if(closed)return reject(Error('DB_CLOSED'));
  const tx=db.transaction('campaigns','readonly'),req=tx.objectStore('campaigns').get(id);
  let value;
  req.onsuccess=()=>{value=req.result?clone(req.result):null;};
  tx.oncomplete=()=>resolve(value);tx.onabort=()=>reject(tx.error??Error('TX_ABORTED'));tx.onerror=()=>{};
 });}
 /** R2: campaign and its journal are one logically indivisible read snapshot.
  * Both requests belong to ONE readonly transaction before the first async boundary.
  * The result may be a past revision if a writer commits just after completion;
  * it can never combine a campaign revision with a later/earlier journal.
  */
 function readConsistentSnapshot(id=DEMO_ID,{onTransactionOpen}={}){
  return new Promise((resolve,reject)=>{
   if(closed)return reject(Object.assign(Error('DB_CLOSED'),{code:'DB_CLOSED'}));
   let campaign=null,journal=[];
   const tx=db.transaction(['campaigns','events'],'readonly');
   const range=IDBKeyRange.bound([id,''],[id,'\uffff']);
   const campaignReq=tx.objectStore('campaigns').get(id);
   const journalReq=tx.objectStore('events').getAll(range);
   campaignReq.onsuccess=()=>{campaign=campaignReq.result?clone(campaignReq.result):null;};
   journalReq.onsuccess=()=>{journal=journalReq.result.map(clone).sort((a,b)=>a.seq-b.seq);};
   tx.oncomplete=()=>resolve({campaign,journal,dbVersion:db.version});
   tx.onabort=()=>reject(tx.error??Object.assign(Error('TX_ABORTED'),{code:'TX_ABORTED'}));
   // Synchronous test hook: only observes the opened transaction. No await inside it.
   // A thrown hook aborts; callers may request a competing write from another tab.
   if(onTransactionOpen){try{onTransactionOpen();}catch(e){try{tx.abort();}catch{};reject(e);}}
  });
 }
 function getEvents(id){return readConsistentSnapshot(id).then(x=>x.journal);}
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
      if(injectFailure==='quota')raise(Object.assign(Error('QUOTA_EXCEEDED_SIMULATED'),{code:'QUOTA_EXCEEDED_SIMULATED'}));
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
 async function makeExport(id=DEMO_ID,{afterSnapshotRead,onTransactionOpen}={}){
  // R2 replaces Promise.all([readCampaign(), listEvents()]) (TWO transactions).
  const {campaign,journal}=await readConsistentSnapshot(id,{onTransactionOpen});
  if(!campaign)fail('CAMPAIGN_NOT_FOUND');
  if(journal.length!==campaign.revision||journal[journal.length-1]?.seq!==campaign.revision||
     journal.some((e,i)=>e.seq!==i+1||e.campaignId!==campaign.id))fail('JOURNAL_INCONSISTENT');
  // Controlled race test hook, AFTER consistent snapshot but BEFORE archive SHA.
  // A second tab may commit now; this archive must still be the older coherent revision.
  if(afterSnapshotRead)await afterSnapshotRead({revision:campaign.revision,journalLength:journal.length});
  const {makePrivateArchive}=await import('./private-archive.mjs');
  return makePrivateArchive({campaign,journal});
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
 return Object.freeze({name,dbVersion:DB_VERSION,readCampaign:txReadCampaign,listEvents:getEvents,readConsistentSnapshot,createCampaign:create,applyEvent:writeCommand,exportPrivate:makeExport,previewImport,commitImport,close(){if(!closed){closed=true;db.close();}}});
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
