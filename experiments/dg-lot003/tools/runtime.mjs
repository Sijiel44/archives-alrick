/** DG-LOT-003 MJ composition — temporary, reversible, no simulated persistence or rules. */
import {studioToArchive,archiveToStudio,creatorToCatalog} from './adapters.mjs';
import {createBestiaryCard,validateBestiaryCard} from '../../../quartz/components/scripts/atelier5d6-bestiary-workshop.ts';

const MJ='http://127.0.0.1:4173', PLAYER='http://127.0.0.1:4174';
const STORAGE_KEY='cer.dg003.private.campaign.v0';
const fail=reason=>{throw Error(reason);};
const copy=x=>structuredClone(x);
// Pure structural equality for an in-memory MJ snapshot vs its ARCHIVES-backed
// re-read. Key insertion order is not an edit; arrays and all JSON values must
// match exactly. This never changes serialized archive order or bytes.
function jsonDifference(a,b,path='root'){
 if(Object.is(a,b))return null;
 if(a===null||b===null||typeof a!=='object'||typeof b!=='object')return path;
 if(Array.isArray(a)!==Array.isArray(b))return path;
 if(Array.isArray(a)){
  if(a.length!==b.length)return path+'.length';
  for(let i=0;i<a.length;i++){const d=jsonDifference(a[i],b[i],path+'['+i+']');if(d)return d;}
  return null;
 }
 const ka=Object.keys(a).sort(),kb=Object.keys(b).sort();
 if(ka.length!==kb.length||ka.some((k,i)=>k!==kb[i])){
  const leftOnly=ka.filter(k=>!kb.includes(k)).slice(0,7);
  const rightOnly=kb.filter(k=>!ka.includes(k)).slice(0,7);
  return path+'.keys(leftOnly='+leftOnly.join(',')+',rightOnly='+rightOnly.join(',')+')';
 }
 for(const k of ka){const d=jsonDifference(a[k],b[k],path+'.'+k);if(d)return d;}
 return null;
}

export function createValidatedStorage(owner,area,{indexedDB=null,locks=globalThis.navigator?.locks??null,browserContext=typeof window!=='undefined'}={}) {
 if(!owner)return null;
 const methods=['createCampaign','previewImport','commitImport','exportPrivate','previewRestore','commitRestore','recoverOriginalBytes'];
 if(methods.some(k=>typeof owner[k]!=='function'))fail('Interface ARCHIVES incomplète');
 if(!area||typeof area.getItem!=='function'||typeof area.setItem!=='function')fail('Stockage privé navigateur indisponible');
 let queue=Promise.resolve();
 const subscribers=new Set();
 let exactRestorePending=null;
 // Key by the native privatePending object: the STUDIO demo allowlist
 // legitimately shallow-spreads the outer preview, preserving this identity.
 const previewAnchors=new WeakMap();
 // Causal parent attestation belongs to the adapter/session, not a numeric
 // revision guess. A first explicit load establishes the editing baseline;
 // subsequent background reads must NEVER silently rebase an unsaved editor.
 let observedParent=null;
 // An editing ticket is held by the draft, NEVER inferred from an adapter's
 // most recent load. Structured-cloned/serialized handles have no authority.
 const editTickets=new WeakMap();
 const parentRaw=()=>area.getItem(STORAGE_KEY);
 const captureParent=studio=>({
  raw:parentRaw(),id:studio?.id??null,revision:studio?.revision??null
 });
 const assertCausalParent=(current,{allowEmpty=false}={})=>{
  const raw=parentRaw();
  if(raw===null&&current===null&&
     (!observedParent||observedParent.raw===null))return raw;
  if(!observedParent||observedParent.raw!==raw||
     observedParent.id!==(current?.id??null)||
     observedParent.revision!==(current?.revision??null))
   fail('Private campaign causal parent conflict: reload verified state before saving');
  return raw;
 };
 const encoder=new TextEncoder();
 const decoder=new TextDecoder();
 const withCrossTabLock=operation=>{
  // Never rely only on a per-instance Promise queue for two browser tabs.
  if(browserContext&&typeof locks?.request!=='function')
   fail('Private browser Web Locks unavailable: refusing an unsafe write');
  return typeof locks?.request==='function'
   ?locks.request('cer.dg003.private.campaign.v0.commit',{mode:'exclusive'},operation)
   :operation();
 };
 // Keep the original localStorage envelope readable. For large validated backups,
 // put their raw bytes in IndexedDB and change only a small localStorage pointer
 // after the IndexedDB transaction completes. Never delete the old payload first.
 const DB_NAME='cer.dg003.private.indexeddb.v0',DB_STORE='archives';
 const LARGE_THRESHOLD=4*1024*1024;
 async function dbTransaction(mode,work){
  if(!indexedDB)fail('IndexedDB indisponible : restauration volumineuse non persistée');
  const db=await new Promise((resolve,reject)=>{
   const req=indexedDB.open(DB_NAME,1);
   req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(DB_STORE))req.result.createObjectStore(DB_STORE);};
   req.onsuccess=()=>resolve(req.result);
   req.onerror=()=>reject(req.error??Error('IndexedDB open failed'));
   req.onblocked=()=>reject(Error('IndexedDB blocked'));
  });
  try{return await new Promise((resolve,reject)=>{
   const tx=db.transaction(DB_STORE,mode);
   let output;
   tx.oncomplete=()=>resolve(output);
   tx.onabort=()=>reject(tx.error??Error('IndexedDB transaction aborted'));
   tx.onerror=()=>reject(tx.error??Error('IndexedDB transaction failed'));
   try{
    const req=work(tx.objectStore(DB_STORE));
    req.onsuccess=()=>{output=req.result;};
    req.onerror=()=>reject(req.error??Error('IndexedDB request failed'));
   }catch(error){try{tx.abort();}catch{}reject(error);}
  });}finally{db.close();}
 }
 const idbRead=digest=>dbTransaction('readonly',store=>store.get(digest));
 const idbWrite=record=>dbTransaction('readwrite',store=>store.put(record,record.sha256));
 const enqueue=operation=>{
  const pending=queue.then(operation);
  queue=pending.catch(()=>{});
  return pending;
 };
 async function readArchive(){
  const raw=area.getItem(STORAGE_KEY);
  if(raw===null)return null;
  let envelope;
  try{envelope=JSON.parse(raw);}catch{fail('Local private envelope invalid');}
  let bytes;
  if(envelope?.kind==='cer.dg003.local-validated-envelope.v0'&&typeof envelope.raw==='string'){
   bytes=encoder.encode(envelope.raw);
  }else if(envelope?.kind==='cer.dg003.indexeddb-pointer.v0'){
   const saved=await idbRead(envelope.sha256);
   if(saved?.kind!=='cer.dg003.indexeddb-bytes.v0'||saved.sha256!==envelope.sha256||
      !(saved.bytes instanceof Uint8Array))fail('IndexedDB private backup invalid or unavailable');
   bytes=saved.bytes;
  }else fail('Local private envelope invalid');
  if(!/^[a-f0-9]{64}$/.test(envelope.sha256??''))fail('Local private envelope invalid');
  const preview=await owner.previewRestore(bytes,{expectedSha256:envelope.sha256});
  return await owner.commitRestore(preview,{existingProject:null,replace:false});
 }
 async function readStudio({bindIfAbsent=true}={}){
  // Only the first explicit load may establish the session's editing parent.
  // Internal save/append/export reads pass bindIfAbsent:false.
  const rawBefore=parentRaw();
  const archive=await readArchive();
  if(parentRaw()!==rawBefore)fail('Private campaign read changed concurrently: retry explicitly');
  const studio=archive?archiveToStudio(archive):null;
  if(bindIfAbsent&&!observedParent)observedParent=captureParent(studio);
  return studio;
 }
 async function persist(snapshot){
  const prepared=studioToArchive(snapshot,owner.createCampaign);
  const result=await owner.exportPrivate(prepared);
  if(result?.confidential!==true||!(result.bytes instanceof Uint8Array)||!/^[a-f0-9]{64}$/.test(result.sha256))
   fail('ARCHIVES private export invalid');
  const preview=await owner.previewRestore(result.bytes,{expectedSha256:result.sha256});
  const verified=await owner.commitRestore(preview,{existingProject:null,replace:false});
  if(JSON.stringify(verified)!==JSON.stringify(prepared))fail('ARCHIVES roundtrip mismatch');
  const previous=area.getItem(STORAGE_KEY);
  if(result.bytes.byteLength>LARGE_THRESHOLD){
   // A native IndexedDB commit must succeed before switching the pointer.
   await idbWrite({kind:'cer.dg003.indexeddb-bytes.v0',sha256:result.sha256,bytes:result.bytes});
   const check=await idbRead(result.sha256);
   if(check?.sha256!==result.sha256||!(check.bytes instanceof Uint8Array)||
      check.bytes.length!==result.bytes.length)fail('IndexedDB write verification failed');
   try{area.setItem(STORAGE_KEY,JSON.stringify({kind:'cer.dg003.indexeddb-pointer.v0',sha256:result.sha256}));}
   catch(error){
     if(area.getItem(STORAGE_KEY)!==previous)
      throw Error('Private pointer ACK uncertain: '+(error?.message??error),{cause:error});
     throw error;
    }
  }else{
   try{area.setItem(STORAGE_KEY,JSON.stringify({kind:'cer.dg003.local-validated-envelope.v0',sha256:result.sha256,raw:decoder.decode(result.bytes)}));}
   catch(error){
     if(area.getItem(STORAGE_KEY)!==previous)
      throw Error('Private storage ACK uncertain: '+(error?.message??error),{cause:error});
     throw error;
    }
  }
  for(const listener of subscribers){try{listener(copy(snapshot));}catch{ /* UI observer cannot roll back validated save */ }}
  return snapshot;
 }
 function mergePersistentCatalog(studio,current){
  const snapshot=copy(studio);
  if(current?.id!==snapshot.id)return snapshot;
  // Preserve absent keys as absent. An old archive with extensions:{} must
  // roundtrip byte-semantically as {} rather than acquiring empty collections.
  const hadCatalog=Object.hasOwn(snapshot.extensions??{},'catalog') ||
    Object.hasOwn(current.extensions??{},'catalog');
  const hadDrafts=Object.hasOwn(snapshot.extensions??{},'creatorDrafts') ||
    Object.hasOwn(current.extensions??{},'creatorDrafts');
  if(!hadCatalog&&!hadDrafts)return snapshot;
  snapshot.extensions??={};
  if(hadCatalog){
   const prior=current.extensions?.catalog??[],incoming=snapshot.extensions.catalog??[];
   if(!Array.isArray(prior)||!Array.isArray(incoming))fail('Catalogue persistant invalide');
   const identities=new Set(incoming.map(x=>x.id+'@'+x.version));
   snapshot.extensions.catalog=[...incoming,...prior.filter(x=>!identities.has(x.id+'@'+x.version))];
  }
  if(hadDrafts){
   const savedDrafts=current.extensions?.creatorDrafts??[];
   const pendingDrafts=snapshot.extensions.creatorDrafts??[];
   if(!Array.isArray(savedDrafts)||!Array.isArray(pendingDrafts))fail('Brouillons persistants invalides');
   const draftIds=new Set(pendingDrafts.map(d=>d.catalogId+'@'+d.catalogVersion));
   snapshot.extensions.creatorDrafts=[...pendingDrafts,...savedDrafts.filter(d=>!draftIds.has(d.catalogId+'@'+d.catalogVersion))];
  }
  return snapshot;
 }
 // Compatibility with L003 full-snapshot callers is strictly *additive*.
 // Existing entities and unknown fields must survive byte-semantically.
 // Changing or removing an existing field requires a targeted edit ticket.
 function assertLegacyAdditive(current,requested){
  if(!current)return;
  if(current.id!==requested?.id)fail('Private draft causal ownership conflict');
  if(!Number.isSafeInteger(requested.revision)||
     requested.revision!==current.revision+1)
   fail('Private draft revision conflict: exact +1 required');
  function retain(base,next,path){
   if(jsonDifference(base,next)===null)return;
   if(Array.isArray(base)){
    if(!Array.isArray(next)||next.length<base.length)
     fail('Private draft causal deletion/replacement forbidden: '+path);
    for(let i=0;i<base.length;i++)
     if(jsonDifference(base[i],next[i])!==null)
      fail('Private draft stale existing entry: '+path+'['+i+']');
    return;
   }
   if(base!==null&&typeof base==='object'){
    if(next===null||typeof next!=='object'||Array.isArray(next))
     fail('Private draft causal replacement forbidden: '+path);
    for(const k of Object.keys(base)){
     if(!Object.hasOwn(next,k))
      fail('Private draft causal field lost: '+path+'.'+k);
     retain(base[k],next[k],path+'.'+k);
    }
    return;
   }
   fail('Private draft causal prior value changed: '+path);
  }
  const original=copy(current),target=copy(requested);
  delete original.revision;delete target.revision;
  const oldScene=original.activeSceneId,newScene=target.activeSceneId;
  delete original.activeSceneId;delete target.activeSceneId;
  retain(original,target,'campaign');
  if(oldScene!==newScene){
   const newIds=(requested.scenes??[]).slice((current.scenes??[]).length).map(x=>x.id);
   if(!newIds.includes(newScene))
    fail('Private draft causal scene selection requires targeted edit');
  }
 }
 function beginEdit(){return enqueue(async()=>{
  const before=parentRaw(),current=await readStudio({bindIfAbsent:false});
  if(!current||parentRaw()!==before)fail('Private edit parent unavailable or changed');
  const handle=Object.freeze({});
  editTickets.set(handle,{raw:before,base:copy(current),used:false});
  return {handle,base:copy(current)};
 });}
 function forkEdit(handle){
  const t=editTickets.get(handle);
  if(!t||t.used)fail('Private draft provenance unverified (clone/cross-session)');
  const child=Object.freeze({});
  editTickets.set(child,{raw:t.raw,base:copy(t.base),used:false});
  return child;
 }
 function commitEdit(handle,operations){return enqueue(()=>withCrossTabLock(async()=>{
  const anchor=editTickets.get(handle);
  if(!anchor||anchor.used)fail('Private draft provenance unverified (foreign/consumed ticket)');
  if(!Array.isArray(operations)||operations.length<1||operations.length>40)
   fail('Private edit operations missing');
  const durable=await readStudio({bindIfAbsent:false});
  if(parentRaw()!==anchor.raw||!durable||
     durable.id!==anchor.base.id||durable.revision!==anchor.base.revision||
     jsonDifference(durable,anchor.base)!==null)
   fail('Private edit causal parent conflict: reload before editing');
  const next=copy(anchor.base);
  for(const op of operations){
   if(!op||typeof op!=='object'||Array.isArray(op))fail('Private edit operation invalid');
   if(op.kind==='add-scene'){
    const scene=copy(op.scene);
    if(!scene||typeof scene.id!=='string'||!scene.id||
       next.scenes.some(x=>x.id===scene.id))fail('Private edit scene collision');
    next.scenes.push(scene);next.activeSceneId=scene.id;
   }else if(op.kind==='update-scene'){
    const scene=next.scenes.find(x=>x.id===op.id);
    if(!scene)fail('Private edit scene missing');
    const allowed=['title','publicDescription','privateNotes','participantIds'];
    const changes=op.changes;
    if(!changes||typeof changes!=='object'||Array.isArray(changes)||
       Object.keys(changes).some(k=>!allowed.includes(k)))
     fail('Private edit scene fields forbidden');
    for(const [key,value] of Object.entries(changes))scene[key]=copy(value);
   }else if(op.kind==='select-scene'){
    if(typeof op.id!=='string'||!next.scenes.some(x=>x.id===op.id))
     fail('Private edit scene selection invalid');
    next.activeSceneId=op.id;
   }else if(op.kind==='add-character'||op.kind==='add-creature'){
    const list=op.kind==='add-character'?next.characters:next.creatures;
    const item=copy(op.value);
    const occupied=[...next.characters,...next.creatures,...next.scenes];
    if(!item||typeof item.id!=='string'||!item.id||
       occupied.some(x=>x.id===item.id))fail('Private edit entity collision');
    list.push(item);
   }else fail('Private edit operation unsupported: '+String(op.kind));
  }
  next.revision=durable.revision+1;
  await persist(next);
  anchor.used=true;
  observedParent=captureParent(next);
  return copy(next);
 }));}
 function save(studio){return enqueue(()=>withCrossTabLock(async()=>{
  const current=await readStudio({bindIfAbsent:false});
  const restoreTicket=exactRestorePending;
  if(restoreTicket){
   // The preview was tied to the exact previous private pointer, not merely
   // a matching campaign ID or an apparently newer revision.
   if(parentRaw()!==restoreTicket.parentRaw){
    exactRestorePending=null; // Explicit new MJ preview required; no replay.
    fail('Private restore causal parent conflict: project changed after preview');
   }
   if(studio.id!==restoreTicket.id||
      jsonDifference(studio,restoreTicket.restored)!==null){
    exactRestorePending=null;
    fail('Private restore payload conflict: new preview and confirmation required');
   }
  }else{
   assertCausalParent(current);
   if(current&&current.id!==studio.id)
    fail('Private campaign ownership conflict: implicit campaign replacement forbidden');
  }
  const prepared=restoreTicket?copy(studio):mergePersistentCatalog(studio,current);
  if(!restoreTicket&&current?.id===studio.id&&
     !(studio.revision===current.revision&&jsonDifference(prepared,current)===null))
   assertLegacyAdditive(current,prepared);
  if(!restoreTicket&&current?.id===studio.id){
   if(!Number.isSafeInteger(studio.revision)||!Number.isSafeInteger(current.revision))
    fail('Private campaign revision invalid');
   if(studio.revision<=current.revision){
    // Idempotent no-op only if BOTH contents and causal base are exact.
    if(studio.revision===current.revision&&JSON.stringify(prepared)===JSON.stringify(current))
     return;
    fail('Private campaign revision conflict: stale or concurrent writer');
   }
  }
  await persist(prepared);
  observedParent=captureParent(prepared);
  if(restoreTicket)exactRestorePending=null;
 }));}
 return {
  owner,readStudio,readArchive,save,beginEdit,forkEdit,commitEdit,
  subscribe(listener){if(typeof listener!=='function')fail('Listener invalid');subscribers.add(listener);return ()=>subscribers.delete(listener);},
  async load(){return await readStudio();},
  async previewRestore({bytes}){
   // Drain only this adapter's writes; snapshot the actual persisted parent.
   await queue;
   const sourceRaw=parentRaw(),source=await readStudio({bindIfAbsent:false});
   if(parentRaw()!==sourceRaw)fail('Private restore preview causal parent changed');
   const pending=await owner.previewRestore(bytes);
   if(pending?.kind!=='private-restore-preview')fail('ARCHIVES preview missing');
   if(parentRaw()!==sourceRaw)fail('Private restore preview causal parent changed');
   const preview={display:{title:'Campagne privée '+pending.projectId},privatePending:pending};
   previewAnchors.set(pending,{parentRaw:sourceRaw,source:copy(source)});
   return preview;
  },
  async restore(preview,{previous}){
   if(!preview?.privatePending)fail('Restoration preview missing');
   const ticket=previewAnchors.get(preview.privatePending);
   if(!ticket)fail('Private restore unverified preview: a fresh preview is required');
   // An old in-memory campaign cannot stand in for the latest ARCHIVES parent.
   // Compare the exact NATIVE ARCHIVES projection, not optional Studio UI
   // defaults (e.g. absent privateNotes vs [] added during round-trip).
   // This is validation-only: it never rewrites the source, its order or bytes.
   // The legacy STUDIO UI does not mirror catalogue/creatorDrafts committed
   // independently by this integration adapter. Admit ONLY fields that are
   // genuinely absent in the UI while retaining the real ARCHIVES values.
   // Any present but divergent field (or unrelated unknown) remains a conflict.
   const uiParent=previous?copy(previous):null;
   if(uiParent&&ticket.source?.id===uiParent.id){
    uiParent.extensions??={};
    for(const key of ['catalog','creatorDrafts']){
     if(!Object.hasOwn(uiParent.extensions,key)&&
        Object.hasOwn(ticket.source.extensions??{},key))
      uiParent.extensions[key]=copy(ticket.source.extensions[key]);
    }
   }
   const left=uiParent?studioToArchive(uiParent,owner.createCampaign):null;
   const right=ticket.source?studioToArchive(ticket.source,owner.createCampaign):null;
   const sourceMismatch=jsonDifference(left,right);
   if(sourceMismatch)
    fail('Private restore source snapshot conflict at '+sourceMismatch+': reload and preview again');
   if(parentRaw()!==ticket.parentRaw){
    previewAnchors.delete(preview.privatePending);
    fail('Private restore causal parent conflict: changed since preview');
   }
   const prior=previous?studioToArchive(previous,owner.createCampaign):null;
   const restored=await owner.commitRestore(preview.privatePending,{existingProject:prior,replace:prior!==null});
   const exact=archiveToStudio(restored);
   if(parentRaw()!==ticket.parentRaw){
    previewAnchors.delete(preview.privatePending);
    fail('Private restore causal parent conflict: changed during preview commit');
   }
   previewAnchors.delete(preview.privatePending);
   exactRestorePending={id:exact.id,restored:copy(exact),parentRaw:ticket.parentRaw};
   return exact;
  },
  async exportPrivate(studio){
   await queue;
   const current=await readStudio({bindIfAbsent:false});
   const coherent=mergePersistentCatalog(studio,current);
   const result=await owner.exportPrivate(studioToArchive(coherent,owner.createCampaign));
   if(result?.confidential!==true||!(result.bytes instanceof Uint8Array)||!/^[a-f0-9]{64}$/.test(result.sha256))
    fail('ARCHIVES private export invalid');
   return result.bytes;
  },
  async appendCatalog(studio,entry,validateRegistry,originalRecord){
   return enqueue(()=>withCrossTabLock(async()=>{
    const current=await readStudio({bindIfAbsent:false});
    assertCausalParent(current);
    if(current?.id!==undefined&&current.id!==studio.id)
     fail('Private catalog campaign ownership conflict');
    if(current?.id===studio.id){
     // A catalog append is deliberate, but the supplied Studio snapshot may
     // not come from before the last confirmed durable scene.
     if(!Number.isSafeInteger(studio.revision)||studio.revision!==current.revision)
      fail('Private catalog stale campaign revision conflict');
     const candidate=copy(studio),base=copy(current);
     delete candidate.revision;delete base.revision;
     if(jsonDifference(candidate,base)!==null)
      fail('Private catalog causal origin unverified: reload exact campaign');
    }
    const foundation=current?.id===studio.id?current:copy(studio);
    foundation.extensions??={};
    const previous=foundation.extensions.catalog??[];
    const next=[...previous,copy(entry)];
    const valid=validateRegistry(next);
    if(valid?.ok!==true)fail('Catalogue : '+(valid?.errors??[]).join('; '));
    foundation.extensions.catalog=next;
    if(!originalRecord||typeof originalRecord!=='object'||Array.isArray(originalRecord))fail('Original creator draft missing');
    const drafts=foundation.extensions.creatorDrafts??[];
    foundation.extensions.creatorDrafts=[...drafts,{catalogId:entry.id,catalogVersion:entry.version,
      sourceSchema:originalRecord.schema,original:copy(originalRecord),visibility:'mj-private'}];
    await persist(foundation);
    observedParent=captureParent(foundation);
    return next;
   }));
  }
 };
}
function fixtureProfile(){
 const profile=createBestiaryCard(5,'faune','creature','soutien');
 profile.id='fixture-profile-001';
 profile.name='Créature témoin N5';
 profile.abilities=[];
 return validateBestiaryCard(profile);
}
function makeBestiaryAdapter(ports,view){
 const ref={document:null,source:{kind:'source',id:'fixture-source-001',version:'fixture-1'},
  profile:{kind:'profile',id:'fixture-profile-001',ruleset:'m03',schema:'alrick.bestiary.v1'}};
 async function profileLoader(input){
  if(input?.document!==null||input?.source?.id!==ref.source.id||
     input?.source?.version!==ref.source.version||input?.profile?.id!==ref.profile.id||
     input?.profile?.schema!==ref.profile.schema||input?.profile?.ruleset!==ref.profile.ruleset)
    return {status:'unavailable',reason:'Seul le profil fictif source locale est disponible'};
  return {status:'ready',value:{...copy(ref),snapshot:fixtureProfile()}};
 }
 return {ref,profileLoader,async resolve(code){
   if(code!=='fixture-source-001')fail('Source fictive indisponible : saisir fixture-source-001');
   const result=await ports.bestiaryAdapter.readProfile(ref);
   if(result.status!=='ready')fail(result.reason);
   return {documentId:'aucun-document-canonique',profileId:ref.profile.id,ruleset:ref.profile.ruleset,
    sourceId:ref.source.id,name:result.value.snapshot.name,level:result.value.snapshot.level};
 },async copy(source,existingIds,campaignId){
   if(source.profileId!==ref.profile.id||source.sourceId!==ref.source.id)fail('Profil/source inadmissible');
   const id=view.crypto?.randomUUID?.();
   if(!id||existingIds.includes(id))fail('Identifiant créature sécurisé/collision');
   const result=await ports.bestiaryAdapter.makeInstance(ref,{kind:'instance',id,campaignId});
   if(result.status!=='ready')fail(result.reason);
   const validated=validateBestiaryCard(copy(result.value.snapshot));
   validated.id=id;
   return {id,sourceId:ref.source.id,profileId:ref.profile.id,documentId:null,
    ruleset:ref.profile.ruleset,profile:copy(ref.profile),source:copy(ref.source),
    sheet:validateBestiaryCard(validated),instance:copy(result.value.instance)};
 }};
}
export function mountIntegratedMJ({owners,doc}){
 const view=doc.defaultView;
 if(view.location.origin!==MJ)fail('Origine MJ non autorisée');
 for(const [role,method] of [['studio','mountStudio'],['creators','mountCreators'],['ports','createPorts'],
 ['rules','previewNativeRules'],['catalog','createDescriptiveCapability'],['storage','createCampaign']])
  if(typeof owners[role]?.[method]!=='function')fail(role+' non intégré : '+method);
 const store=createValidatedStorage(owners.storage,view.localStorage,{indexedDB:view.indexedDB});
 const rulesAdapter=async request=>{
  if(!['m03-combat','m01-progression'].includes(request.operation))
   return {status:'unavailable',reason:'Famille native non homologuée'};
  if(request.input?.kind!==(request.operation==='m03-combat'?'combat':'progression'))
   return {status:'invalid',reason:'Famille native/port divergente'};
  const result=owners.rules.previewNativeRules(request.input);
  return result.status==='ok'
   ?{status:'ready',value:{source:result.engine,output:result}}
   :{status:result.status==='unavailable'?'unavailable':'blocked',reason:result.reason};
 };
 let bestiary;
 const ports=owners.ports.createPorts({
  rules:{previewNative:rulesAdapter},
  catalog:{resolve:async()=>({status:'unavailable',reason:'Aucun registre mécanique publié pour cette fixture'})},
  characters:{preview:async()=>({status:'unavailable',reason:'L import multi-fiche exige sélection explicite; utiliser le flux ARCHIVES Studio'})},
  bestiary:{readProfile:async ref=>bestiary.profileLoader(ref)}
 });
 bestiary=makeBestiaryAdapter(ports,view);
 const options={
  window:view,studioOrigin:MJ,playerOrigin:PLAYER,storage:store,
  characterImport:{
   async preview({bytes}){
    const campaign=studio?.getCampaign();
    if(!campaign)fail('Créer campagne avant import');
    const pending=await owners.storage.previewImport(bytes,studioToArchive(campaign,owners.storage.createCampaign),{instancePrefix:'pj'});
    if(!Array.isArray(pending.entries)||pending.entries.length!==1)
      fail('Import multi-fiches refusé : une sélection explicite est nécessaire (aucune mutation)');
    const entry=pending.entries[0];
    const schema=pending.source?.schema==='alrick.sheets.v2'?'v2':pending.source?.schema==='alrick.sheets.v3'?'v3':null;
    if(!schema)fail('Schéma historique non reconnu');
    return {schemaVersion:schema,display:{name:entry.name||entry.sourceId,level:'brut — non interprété'},
      privatePending:pending};
   },
   async accept(preview,{existingIds}){
    if(!preview?.privatePending)fail('Aperçu PJ absent');
    const campaign=studio?.getCampaign();if(!campaign)fail('Campagne absente');
    const before=studioToArchive(campaign,owners.storage.createCampaign);
    const after=await owners.storage.commitImport(before,preview.privatePending);
    const added=after.characters.filter(c=>!existingIds.includes(c.id));
    if(added.length!==1)fail('Import attendu : une seule fiche');
    return copy(added[0]);
   }
  },
  catalog:{resolveCreature:code=>bestiary.resolve(code)},
  bestiary:{copyCreature:(source,{existingIds})=>{
   const campaign=studio?.getCampaign();
   if(!campaign)fail('Campagne requise');
   return bestiary.copy(source,existingIds,campaign.id);
  }},
  rules:{
   nativeValidated:true,
   async previewM03({commit}){
    if(commit!==false)fail('Mutation native interdite');
    const nativeInput={kind:'combat',actor:'pj',combat:{natural:24,rawStat:16,masteryRank:4,situation:0,level:10,
     difficulty:21,kind:'physique',mode:'melee',feasible:true,baseDamage:6}};
    const result=await ports.rulesGateway.preview({operation:'m03-combat',ruleset:'m03',input:nativeInput});
    if(result.status!=='ready')fail(result.reason);
    const output=result.value.output;
    if(output.applied!==false || output.status!=='ok' || output.engine!=='M03')fail('Prévisualisation native non pure ou refusée');
    const panel=doc.getElementById('native-preview-details');
    const inputText=doc.getElementById('native-preview-input');
    const resultText=doc.getElementById('native-preview-result');
    if(!panel||!inputText||!resultText)fail('Panneau de prévisualisation MJ absent');
    // Only the official native preview output is displayed; no recomputation.
    inputText.textContent=JSON.stringify(nativeInput,null,2);
    resultText.textContent=JSON.stringify(output,null,2);
    panel.hidden=false;
    return {label:'M03 natif fictif — détails visibles dans le panneau MJ, aucun débit',native:output};
   }
  }
 };
 let studio=owners.studio.mountStudio(doc.getElementById('studio-root'),options);
 const catalogRoot=doc.getElementById('catalog-saved');
 const renderEntries=(list)=>{
  if(!catalogRoot)return;
  catalogRoot.replaceChildren();
  for(const item of list){
   const p=doc.createElement('p');
   p.textContent=item.name+' · '+item.entryType+' · '+item.version+' (descriptif, non exécutable)';
   catalogRoot.append(p);
  }
 };
 store.subscribe(state=>renderEntries(state.extensions?.catalog??[]));
 const creator=owners.creators.mountCreators(doc.getElementById('creators-root'),{
  injectStyles:false,
  onSave:async record=>{
   const campaign=studio.getCampaign();
   if(!campaign)fail('Créer une campagne avant une fiche descriptive');
   const entry=creatorToCatalog(record,owners.catalog,campaign.id);
   const list=await store.appendCatalog(campaign,entry,owners.catalog.validateCatalogRegistry,record);
   renderEntries(list);
   return {saved:true};
  }
 });
 void store.readStudio().then(saved=>renderEntries(saved?.extensions?.catalog??[])).catch(()=>renderEntries([]));
 return {studio,creator,ports,store};
}
