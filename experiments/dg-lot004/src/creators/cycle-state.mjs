/** DG-LOT-004 L004-C — private, descriptive creator journey. No numeric rules. */
export const CYCLE_SCHEMA='cer.creators.dg004.private.v0';
export const CYCLE_STEPS=Object.freeze(['item','capacity','creature','scene']);
export const OPTIONAL_STEPS=Object.freeze(['spell']);
export const RULES_UNAVAILABLE='Indisponible — règle/validateur non homologué';
export const MAX_CYCLE_BYTES=2*1024*1024;
const encoder=new TextEncoder(),decoder=new TextDecoder('utf-8',{fatal:true});
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const bannedKeys=new Set(['__proto__','constructor','prototype']);
const ids=/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/;
const forbiddenMechanical=new Set(['approved','autoApply','applied','damage','absorption','mana','manaCost','charges','chargeCost','numericEffect','authority25','effectMagnitude','cost','xpGrant','xpReward','xpSuggestion','resolveSpellCast']);
function fail(message){throw new Error(message);}
function inspectJSON(x,depth=0){
 if(depth>28)fail('Objet JSON trop profond');
 if(Array.isArray(x)){if(x.length>1000)fail('Liste trop longue');for(const y of x)inspectJSON(y,depth+1);return;}
 if(isObject(x)){for(const [k,v] of Object.entries(x)){if(bannedKeys.has(k))fail('Clé de données dangereuse');inspectJSON(v,depth+1);}return;}
 if(x!==null&&typeof x!=='string'&&typeof x!=='boolean'&&!(typeof x==='number'&&Number.isFinite(x)))fail('Type JSON non pris en charge');
}
export function cloneCycleJSON(value){inspectJSON(value);const serialized=JSON.stringify(value);if(encoder.encode(serialized).length>MAX_CYCLE_BYTES)fail('Données de création trop volumineuses');return JSON.parse(serialized);}
const text=(s,max)=>typeof s==='string'&&s.trim().length>0&&s.length<=max;
export function createCycle(id='fictive-cycle-1'){
 if(!ids.test(id))fail('Identifiant de cycle invalide');
 return {schema:CYCLE_SCHEMA,id,revision:0,step:'item',mode:'guided',status:'draft',
  drafts:{item:{},capacity:{},spell:{},creature:{},scene:{}},
  entries:{item:null,capacity:null,spell:null,creature:null,scene:null},
  links:{itemCatalogId:null,capacityCatalogId:null,creatureInstanceId:null,sceneId:null},
  sourceSnapshots:[],extensions:{}};
}
export function validateCycle(value){
 const s=cloneCycleJSON(value);
 if(!isObject(s)||s.schema!==CYCLE_SCHEMA||!ids.test(s.id)||!Number.isSafeInteger(s.revision)||s.revision<0||
 ![...CYCLE_STEPS,...OPTIONAL_STEPS].includes(s.step)||!['guided','expert'].includes(s.mode)||
 !['draft','mj-validated'].includes(s.status)||!isObject(s.drafts)||!isObject(s.entries)||!isObject(s.links)||
 !Array.isArray(s.sourceSnapshots)||!isObject(s.extensions))fail('Sauvegarde L004 incompatible');
 for(const k of [...CYCLE_STEPS,...OPTIONAL_STEPS]){
  if(!isObject(s.drafts[k]))fail('Brouillon manquant : '+k);
  if(s.entries[k]!==null&&!isObject(s.entries[k]))fail('Entrée invalide : '+k);
 }
 if(s.sourceSnapshots.length>100)fail('Trop de sources');
 const pending=s.extensions.pendingStudioOp;
 if(pending!==undefined){
  if(!isObject(pending)||!['creature','scene'].includes(pending.kind)||!ids.test(pending.campaignId)||
     !Array.isArray(pending.beforeIds)||pending.beforeIds.length>1000||
     new Set(pending.beforeIds).size!==pending.beforeIds.length||
     pending.beforeIds.some(id=>typeof id!=='string'||!ids.test(id)))
   fail('Journal STUDIO privé invalide');
  if(pending.kind==='creature'&&(!isObject(pending.source)||
     ['documentId','profileId','ruleset'].some(k=>!text(pending.source[k],120))))
   fail('Référence BEST invalide dans le journal STUDIO');
 }
 return s;
}
function validateNarrative(draft,kind){
 if(!isObject(draft))fail('Fiche descriptive requise');
 for(const key of Object.keys(draft))if(forbiddenMechanical.has(key))fail('Champ mécanique interdit : '+key);
 for(const [key,max] of Object.entries({name:120,provenance:160,version:32,description:3000,limitations:1200}))
  if(!text(draft[key],max))fail(`Champ ${key} obligatoire (texte descriptif)`);
 if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,31}$/.test(draft.version))fail('Version invalide');
 // A LAB example may prompt narrative questions, but must not encode an unapproved -2 or costs.
 const prose=[draft.description,draft.limitations,draft.trigger,draft.manifestation,draft.publicDescription].filter(x=>typeof x==='string').join(' ');
 if(/(?:^|[\s:(])[+\-\u2212]\s*\d+(?=\s|$|[^a-zA-Z\d])/u.test(prose)||/\b(?:malus|bonus|dégâts|damage|mana|charges?|xp)\s*[:=+\-\u2212]?\s*\d+/iu.test(prose))
  fail('Effet numérique ou coût non homologué : description refusée');
 if(kind==='creature'&&!text(draft.sourceReference,120))fail('Référence créature requise pour STUDIO');
 if(kind==='creature'&&draft.capacityCatalogId!==undefined&&!text(draft.capacityCatalogId,180))fail('Référence de capacité invalide');
 if(kind==='scene'&&!text(draft.title,160))fail('Titre de scène requis');
 if(kind==='scene'&&typeof draft.privateNotes!=='string')fail('Notes privées attendues');
 return true;
}
function makeSummary(state){return {cycleId:state.id,revision:state.revision,status:state.status,step:state.step,
 saved:Object.entries(state.entries).filter(([,v])=>v!==null).map(([k])=>k),
 sources:state.sourceSnapshots.length};}
export function createBrowserCyclePersistence({storage,key='cer.dg004.creators.private',origin,allowedOrigin='http://127.0.0.1:4173'}={}){
 if(!storage||typeof storage.getItem!=='function'||typeof storage.setItem!=='function')throw new TypeError('Stockage local requis');
 // No player-origin secrets. Integrator may inject a stronger ARCHIVES/IndexedDB adapter instead.
 if(origin!==allowedOrigin)throw Error('Stockage privé interdit hors origine MJ vérifiée');
 if(!/^cer\.[a-z0-9._-]{1,120}$/.test(key))throw Error('Clé de stockage non permise');
 return {async load(){const raw=storage.getItem(key);return raw===null?null:validateCycle(JSON.parse(raw));},
 async save(state){const next=validateCycle(state);const raw=JSON.stringify(next);
  if(encoder.encode(raw).length>MAX_CYCLE_BYTES)fail('Sauvegarde trop volumineuse');storage.setItem(key,raw);return {saved:true};}};
}
/** State machine. Only persisted snapshot becomes committed state; failed writes leave it unchanged. */
export function createCreatorCycle({persistence,creatorValidator,catalogBridge,catalog,studio,indexChain,
  loadPersistedStudio,inspectCreatorAttachment,idFactory=()=>globalThis.crypto?.randomUUID?.()}={}){
 if(!persistence||typeof persistence.save!=='function'||typeof persistence.load!=='function')throw new TypeError('Port de persistance load/save requis');
 let state=createCycle(idFactory()),queue=Promise.resolve(),pendingRestore=null,studioActionInFlight=false;
 const copy=()=>cloneCycleJSON(state);
 const steps=[...CYCLE_STEPS,...OPTIONAL_STEPS];
 const checkKind=k=>{if(!steps.includes(k))fail('Étape inconnue');};
 async function commit(mutator){
  // Serialise the complete read-modify-write operation, not merely individual I/O calls.
  const op=queue.catch(()=>{}).then(async()=>{
   const next=copy();const output=await mutator(next);
   next.revision+=1;validateCycle(next);
   const receipt=await persistence.save(next);
   if(receipt?.saved!==true)fail('Sauvegarde non confirmée');
   state=next;return output;
  });queue=op.catch(()=>{});return op;
 }
 function draft(kind){checkKind(kind);return cloneCycleJSON(state.drafts[kind]);}
 async function saveDraft(kind,data){checkKind(kind);const update=cloneCycleJSON(data);
  if(!isObject(update))fail('Brouillon attendu');
  return commit(next=>{
   const merged={...next.drafts[kind],...update};
   if(JSON.stringify(merged)!==JSON.stringify(next.drafts[kind])){
    // Une copie de créature fige les fiches en amont, pas le brouillon de scène
    // qui n'a pas encore d'instance STUDIO. Une scène liée ou une chaîne INDEX
    // fige ensuite tous les brouillons, sans réécrire les sources existantes.
    if(next.extensions.pendingStudioOp||next.links.sceneId||next.extensions.indexL004||
       (next.links.creatureInstanceId&&kind!=='scene'))
      fail('Cycle lié à STUDIO/INDEX : ouvrir une nouvelle version avant modification');
    next.drafts[kind]=merged;
    const from=CYCLE_STEPS.indexOf(kind);
    for(const dependent of from<0?[kind]:CYCLE_STEPS.slice(from))next.entries[dependent]=null;
    if(from<=0&&from!==-1)next.links.itemCatalogId=null;
    if(from<=1&&from!==-1)next.links.capacityCatalogId=null;
    if(from<=2&&from!==-1)delete next.links.creatureCapacityCatalogId;
    next.status='draft';
   }
   return cloneCycleJSON(next.drafts[kind]);
  });
 }
 async function setMode(mode){if(!['guided','expert'].includes(mode))fail('Mode invalide');return commit(next=>{next.mode=mode;});}
 async function go(step){checkKind(step);
  if(state.mode==='guided'&&step!=='item'&&step!=='spell'){
   const index=CYCLE_STEPS.indexOf(step);
   if(CYCLE_STEPS.slice(0,index).some(k=>state.entries[k]===null))fail('Valider les étapes précédentes avant de continuer');
  }
  return commit(next=>{next.step=step;});
 }
 async function validateMJ(kind){
  checkKind(kind);if(!['item','capacity','spell','creature','scene'].includes(kind))fail('Étape invalide');
  const record=draft(kind);validateNarrative(record,kind);
  let catalogEntry=null;
  if(['item','capacity','spell'].includes(kind)){
   if(typeof creatorValidator!=='function'||typeof catalogBridge!=='function'||!catalog)fail('INDEX non connecté — validation MJ indisponible');
   // Unknown private source data is NEVER passed to INDEX. L003 validator governs descriptive form.
   const names={item:['name','provenance','version','description','limitations','category','appearance'],
    capacity:['name','provenance','version','description','limitations','trigger','tags'],
    spell:['name','provenance','version','description','limitations','tradition','manifestation']};
   const clean={kind};for(const key of names[kind])if(Object.hasOwn(record,key))clean[key]=record[key];
   const validated=creatorValidator(clean);
   if(validated?.valid!==true||!validated.record)fail('Fiche invalide : '+JSON.stringify(validated?.errors??{}));
   catalogEntry=catalogBridge(validated.record,catalog,state.id);
   if(!isObject(catalogEntry)||typeof catalogEntry.id!=='string'||catalogEntry.executable!==undefined&&catalogEntry.executable!==false)
     fail('INDEX a refusé une entrée descriptive inerte');
   if(state.entries[kind]?.catalogId&&state.entries[kind].catalogId!==catalogEntry.id)
     fail('Changement ID : conserver une version ou créer une nouvelle entrée');
   if(['item','capacity'].includes(kind)&&['item','capacity'].some(k=>k!==kind&&state.entries[k]?.catalogId===catalogEntry.id))fail('Collision de catalogue');
  }
  if(kind==='creature'&&state.entries.capacity===null)fail('Capacité réutilisable non validée');
  if(kind==='scene'&&state.entries.creature===null)fail('Créature non validée');
  await commit(next=>{
   if(next.extensions.pendingStudioOp)fail('Réconciliation STUDIO requise avant validation MJ');
   next.entries[kind]={kind,displayName:record.name,version:record.version,provenance:record.provenance,
    status:'mj-validated',catalogId:catalogEntry?.id??null,
    descriptive:cloneCycleJSON(record),catalogEntry:catalogEntry?cloneCycleJSON(catalogEntry):null};
   if(kind==='item')next.links.itemCatalogId=catalogEntry.id;
   if(kind==='capacity')next.links.capacityCatalogId=catalogEntry.id;
   if(kind==='creature')next.links.creatureCapacityCatalogId=next.links.capacityCatalogId; // only descriptive, not an acquired ability
   next.status=CYCLE_STEPS.every(k=>next.entries[k])?'mj-validated':'draft';
  });
  return {kind,catalogEntry:catalogEntry?cloneCycleJSON(catalogEntry):null,executable:false};
 }

 /**
  * Recovery journal is written durably BEFORE any STUDIO side effect.
  * A failed post-write leaves a journal, never a permission to repeat creation.
  * Recovery validates IDs and provenance against the authoritative STUDIO campaign.
  */
 function recoveryStatus(){
  const pending=state.extensions.pendingStudioOp;
  if(!pending)return {pending:false,status:'none',candidates:[],canAbandon:false};
  if(studioActionInFlight)return {pending:true,kind:pending.kind,status:'in-flight',
   candidates:[],canAbandon:false,message:'Écriture STUDIO en cours : ne pas intervenir'};
  const campaign=studio?.getCampaign?.();
  if(!isObject(campaign)||campaign.id!==pending.campaignId)
   return {pending:true,kind:pending.kind,status:'wrong-campaign',candidates:[],canAbandon:false,
    message:'Réouvrir la même campagne STUDIO avant réconciliation'};
  const collection=pending.kind==='creature'?campaign.creatures:campaign.scenes;
  if(!Array.isArray(collection))
   return {pending:true,kind:pending.kind,status:'invalid-studio',candidates:[],canAbandon:false,
    message:'Collections STUDIO inaccessibles'};
  const before=new Set(pending.beforeIds),created=collection.filter(x=>isObject(x)&&
   typeof x.id==='string'&&!before.has(x.id));
  const candidate=x=>{
   if(pending.kind==='creature')
    return isObject(x.source)&&['documentId','profileId','ruleset'].every(k=>x.source[k]===pending.source[k]);
   const draft=state.drafts.scene;
   return x.title===draft.title &&
    (x.publicDescription??'')===(draft.publicDescription??'') &&
    (x.privateNotes??'')===(draft.privateNotes??'') &&
    (!studio.updateScene||Array.isArray(x.participantIds)&&x.participantIds.includes(state.links.creatureInstanceId));
  };
  const matches=created.filter(candidate);
  // Une seule instance nouvelle, elle-même unique et de provenance concordante,
  // est nécessaire. Deux copies admissibles (ou une copie et un intrus) bloquent
  // toute sélection arbitraire, même sous confirmation MJ.
  const unique=created.length===1&&matches.length===1;
  const candidates=unique?[{id:matches[0].id}]:[]; // no source/secret payload
  return {pending:true,kind:pending.kind,status:unique?'requires-confirmation':
    created.length?'ambiguous':'no-side-effect-observed',
    candidates,unverifiedCount:created.length-matches.length,
    canAbandon:created.length===0,
    message:created.length?unique?'Confirmer cette unique copie STUDIO reconnue':
     'Instances STUDIO multiples ou contradictoires : revue manuelle, aucun lien':
     'Aucune nouvelle instance visible ; confirmer explicitement avant un nouvel essai'};
 }
 /**
  * Read-only durability check. STUDIO memory is not a persisted receipt.
  * The injected loader MUST be the validated ARCHIVES L003 adapter's load(),
  * on the SAME fictive campaign and distinct from studio.getCampaign().
  * Optional STUDIO inspector is an additional fail-closed provenance check.
  */
 async function inspectStudioRecovery(){
  const pending=state.extensions.pendingStudioOp,live=recoveryStatus();
  if(!pending)return live;
  if(studioActionInFlight)return {...live,durableVerified:false};
  if(typeof loadPersistedStudio!=='function')
   return {...live,status:'persistence-unavailable',candidates:[],canAbandon:false,durableVerified:false,
    message:'Lecture ARCHIVES persistée indépendante requise avant toute réconciliation'};
  // Verify that the journal itself actually survived the creator-store write.
  let savedCycle,persistedCampaign;
  try{
   savedCycle=validateCycle(await persistence.load());
   persistedCampaign=await loadPersistedStudio();
  }catch{
   return {...live,status:'persistence-unverified',candidates:[],canAbandon:false,durableVerified:false,
    message:'Lecture privée refusée ou impossible : journal/ARCHIVES non attesté'};
  }
  if(savedCycle.id!==state.id||savedCycle.revision!==state.revision||
     JSON.stringify(savedCycle.extensions.pendingStudioOp)!==JSON.stringify(pending))
   return {...live,status:'journal-unverified',candidates:[],canAbandon:false,durableVerified:false,
    message:'Journal créateur non confirmé sur disque'};
  const memory=studio?.getCampaign?.();
  if(!isObject(memory)||memory.id!==pending.campaignId||
     !isObject(persistedCampaign)||persistedCampaign.id!==pending.campaignId)
   return {...live,status:'wrong-campaign',candidates:[],canAbandon:false,durableVerified:false,
    message:'Campagne mémoire ou ARCHIVES différente du journal privé'};
  const field=pending.kind==='creature'?'creatures':'scenes';
  const mem=memory[field],disk=persistedCampaign[field];
  if(!Array.isArray(mem)||!Array.isArray(disk))
   return {...live,status:'persistence-unverified',candidates:[],canAbandon:false,durableVerified:false,
    message:'Collection STUDIO persistée manquante'};
  const before=new Set(pending.beforeIds),newMemory=mem.filter(x=>isObject(x)&&!before.has(x.id)),
    newDisk=disk.filter(x=>isObject(x)&&!before.has(x.id));
  // Never attest two candidates or a nonmatching identity.
  if(live.status==='requires-confirmation'&&live.candidates.length===1){
   const id=live.candidates[0].id;
   if(newMemory.length!==1||newDisk.length!==1||
      newMemory[0].id!==id||newDisk[0].id!==id)
    return {...live,status:newDisk.length?'ambiguous':'unpersisted',
     candidates:[],canAbandon:false,durableVerified:false,
     message:'Instance seulement en mémoire, absente ou ambiguë dans ARCHIVES'};
   // Exact private snapshot equality: no source/provenance/notes conversion or copying out.
   if(JSON.stringify(newMemory[0])!==JSON.stringify(newDisk[0]))
    return {...live,status:'persisted-conflict',candidates:[],canAbandon:false,durableVerified:false,
     message:'Instance STUDIO et ARCHIVES divergentes : refus de liaison'};
   if(typeof inspectCreatorAttachment==='function'){
    let report;
    try{
     report=await inspectCreatorAttachment({campaign:memory,persistedCampaign,cycle:copy(),kind:pending.kind});
    }catch{
     return {...live,status:'inspector-unavailable',candidates:[],canAbandon:false,durableVerified:false,
      message:'Inspecteur STUDIO impossible sur ce maillon : contrat à corriger'};
    }
    const verdict=report?.[pending.kind];
    if(verdict?.status!=='reusable'||verdict?.persisted!==true||verdict?.id!==id)
     return {...live,status:'inspector-rejected',candidates:[],canAbandon:false,durableVerified:false,
      message:'Inspecteur STUDIO refuse le même ID persisté'};
   }
   return {...live,durableVerified:true,
    message:'Instance unique attestée dans ARCHIVES ; confirmation MJ encore requise'};
  }
  // No side effect visible in memory: a retry is unsafe until persisted absence
  // is checked too. No automatic retry; explicit MJ only.
  if(live.status==='no-side-effect-observed'&&newMemory.length===0&&newDisk.length===0)
   return {...live,durableVerified:true,message:'Aucune nouvelle instance mémoire/ARCHIVES observée'};
  return {...live,status:live.status==='wrong-campaign'?'wrong-campaign':'ambiguous',
   candidates:[],canAbandon:false,durableVerified:false,
   message:'Reprise ambiguë : intervention MJ et contrôle ARCHIVES requis'};
 }
 function safeRecoveryStatus(){
  const live=recoveryStatus();
  if(!live.pending||live.status==='in-flight')return live;
  return {...live,status:live.status==='wrong-campaign'?'wrong-campaign':'durability-unverified',
   candidates:[],canAbandon:false,durableVerified:false,
   message:'Inspecter la sauvegarde STUDIO ARCHIVES avant confirmation MJ'};
 }
 async function requirePersistedJournal(expected){
  let stored;
  try{stored=validateCycle(await persistence.load());}
  catch{fail('Journal STUDIO non relu dans le stockage privé : aucune création autorisée');}
  if(stored.id!==state.id||stored.revision!==state.revision||
     JSON.stringify(stored.extensions.pendingStudioOp)!==JSON.stringify(expected))
   fail('Journal STUDIO non attesté sur disque : aucune création autorisée');
 }
 async function reconcileStudioLink(instanceId,{confirm=false}={}){
  if(studioActionInFlight)fail('Opération STUDIO en cours : attendre son résultat');
  if(confirm!==true)fail('Confirmation MJ explicite requise');
  const pending=state.extensions.pendingStudioOp;
  if(!pending)fail('Réconciliation STUDIO non prévisualisée');
  const initial=await inspectStudioRecovery();
  if(!initial.durableVerified||initial.status!=='requires-confirmation'||
     !initial.candidates.some(x=>x.id===instanceId))
   fail('Instance STUDIO non attestée dans ARCHIVES : liaison refusée sans duplication');
  await commit(async next=>{
   if(!next.extensions.pendingStudioOp||next.extensions.pendingStudioOp.kind!==pending.kind||
      next.extensions.pendingStudioOp.campaignId!==pending.campaignId)
    fail('Journal STUDIO modifié pendant réconciliation');
   const fresh=await inspectStudioRecovery();
   if(!fresh.durableVerified||fresh.status!=='requires-confirmation'||
      !fresh.candidates.some(x=>x.id===instanceId))
    fail('Preuve STUDIO/ARCHIVES perdue : aucun lien écrit');
   if(pending.kind==='creature'){
    if(next.links.creatureInstanceId)fail('Créature déjà liée');
    next.links.creatureInstanceId=instanceId;
    next.links.creatureSource=cloneCycleJSON(pending.source);
    next.links.creatureCapacityCatalogId=next.links.capacityCatalogId;
   }else{
    if(next.links.sceneId)fail('Scène déjà liée');
    next.links.sceneId=instanceId;next.status='mj-validated';
   }
   delete next.extensions.pendingStudioOp;
  });
  return {kind:pending.kind,instanceId,reconciled:true,executable:false};
 }
 async function abandonStudioRecovery({confirm=false}={}){
  if(studioActionInFlight)fail('Opération STUDIO en cours : attendre son résultat');
  if(confirm!==true)fail('Confirmation MJ explicite requise');
  const initial=await inspectStudioRecovery();
  if(!initial.durableVerified||!initial.pending||!initial.canAbandon)
   fail('Annulation bloquée : absence durable d’instance non attestée');
  await commit(async next=>{
   const fresh=await inspectStudioRecovery();
   if(!fresh.durableVerified||!fresh.pending||!fresh.canAbandon||
      next.extensions.pendingStudioOp?.campaignId!==state.extensions.pendingStudioOp?.campaignId)
    fail('Réconciliation STUDIO non attestée au moment de l’annulation');
   delete next.extensions.pendingStudioOp;
  });
  return {abandoned:true,executable:false};
 }
 async function attachCreature(){
  if(!studio||typeof studio.previewCreature!=='function'||typeof studio.copyCreature!=='function'||typeof studio.getCampaign!=='function')
   fail('Port STUDIO créature absent');
  if(state.extensions.pendingStudioOp)fail('Réconciliation STUDIO requise : ne pas dupliquer la copie');
  if(!state.entries.creature||!state.entries.capacity)fail('Créature et capacité à valider');
  if(state.links.creatureInstanceId)fail('Créature déjà liée — pas de copie automatique');
  const reference=state.drafts.creature.sourceReference,startingRevision=state.revision;
  const campaign=studio.getCampaign(),before=campaign?.creatures;
  if(!ids.test(campaign?.id)||!Array.isArray(before)||before.some(x=>!ids.test(x?.id)))
   fail('Campagne STUDIO invalide pour journal de reprise');
  const beforeIds=before.map(x=>x.id);
  const preview=await studio.previewCreature(reference);
  if(!preview||['documentId','profileId','ruleset'].some(k=>!text(preview[k],120)))
   fail('Aperçu BEST/STUDIO incomplet');
  const source=Object.fromEntries(['documentId','profileId','ruleset'].map(k=>[k,preview[k]]));
  // Ancien backup sans journal : ne pas considérer le lien absent comme une
  // autorisation de recopier une créature déjà présente de même provenance.
  const priorMatches=before.filter(x=>isObject(x)&&
   (x.privateSnapshot?.sourceId===reference||
    (isObject(x.source)&&['documentId','profileId','ruleset'].every(k=>x.source[k]===source[k]))));
  if(priorMatches.length)
   fail('Copie STUDIO préexistante sans journal attesté : réconciliation manuelle avant nouvelle copie');
  // If the preflight save fails, copyCreature is never called.
  await commit(next=>{
   if(next.revision!==startingRevision||next.drafts.creature.sourceReference!==reference)
    fail('Cycle modifié pendant prévisualisation : recommencer avant copie STUDIO');
   if(studio.getCampaign()?.id!==campaign.id)fail('Campagne STUDIO changée avant copie');
   if(next.extensions.pendingStudioOp||next.links.creatureInstanceId)fail('Réconciliation STUDIO requise');
   next.extensions.pendingStudioOp={kind:'creature',campaignId:campaign.id,beforeIds,source};
  });
  await requirePersistedJournal(state.extensions.pendingStudioOp);
  studioActionInFlight=true;
  try{
  if(studio.getCampaign()?.id!==campaign.id)fail('Campagne STUDIO changée après journal : reprise manuelle requise');
  await studio.copyCreature();
  const afterCampaign=studio.getCampaign();
  if(afterCampaign?.id!==campaign.id)fail('Campagne STUDIO changée après copie : reprise manuelle requise');
  const all=afterCampaign.creatures;
  if(!Array.isArray(all)||!all.length||typeof all.at(-1)?.id!=='string')
   fail('Copie STUDIO non confirmée : utiliser la réconciliation');
  const instanceId=all.at(-1).id;
  if(beforeIds.includes(instanceId)||all.length!==beforeIds.length+1)
   fail('Copie STUDIO non vérifiable : utiliser la réconciliation');
  await commit(next=>{
   if(next.extensions.pendingStudioOp?.kind!=='creature')fail('Journal STUDIO absent');
   next.links.creatureInstanceId=instanceId;next.links.creatureSource=cloneCycleJSON(source);
   next.links.creatureCapacityCatalogId=next.links.capacityCatalogId;
   delete next.extensions.pendingStudioOp;
  });
  return {instanceId,...source};
  }finally{studioActionInFlight=false;}
 }
 async function attachScene(){
  if(!studio||typeof studio.createScene!=='function'||typeof studio.getCampaign!=='function')
   fail('Port STUDIO scène absent');
  if(state.extensions.pendingStudioOp)fail('Réconciliation STUDIO requise : ne pas dupliquer la scène');
  if(!state.entries.scene||!state.links.creatureInstanceId)
   fail('Valider la scène et copier la créature d’abord');
  if(state.links.sceneId)fail('Scène déjà liée — pas de duplication automatique');
  const d=state.drafts.scene,startingRevision=state.revision,campaign=studio.getCampaign(),before=campaign?.scenes;
  if(!ids.test(campaign?.id)||!Array.isArray(before)||before.some(x=>!ids.test(x?.id)))
   fail('Campagne STUDIO invalide pour journal de reprise');
  const beforeIds=before.map(x=>x.id);
  // Backup ancien sans journal : refuser même titre (copie potentielle ou
  // conflit privé), sans inspecter/réécrire les notes du MJ.
  if(before.some(x=>isObject(x)&&x.title===d.title))
   fail('Scène STUDIO préexistante sans journal attesté : réconciliation manuelle avant nouvelle scène');
  await commit(next=>{
   if(next.revision!==startingRevision)fail('Cycle modifié pendant préparation de scène STUDIO');
   if(studio.getCampaign()?.id!==campaign.id)fail('Campagne STUDIO changée avant scène');
   if(next.extensions.pendingStudioOp||next.links.sceneId)fail('Réconciliation STUDIO requise');
   next.extensions.pendingStudioOp={kind:'scene',campaignId:campaign.id,beforeIds};
  });
  await requirePersistedJournal(state.extensions.pendingStudioOp);
  studioActionInFlight=true;
  try{
  if(studio.getCampaign()?.id!==campaign.id)fail('Campagne STUDIO changée après journal : reprise manuelle requise');
  await studio.createScene(d.title,d.publicDescription??'',d.privateNotes??'');
  const current=studio.getCampaign();
  if(current?.id!==campaign.id)fail('Campagne STUDIO changée après scène : reprise manuelle requise');
  const sceneId=current.activeSceneId;
  if(sceneId&&typeof studio.updateScene==='function'){
   const s=current.scenes?.find(x=>x.id===sceneId);
   if(s)await studio.updateScene({title:s.title,publicDescription:s.publicDescription??'',privateNotes:s.privateNotes??'',
    participantIds:[...new Set([...(s.participantIds??[]),state.links.creatureInstanceId])]});
  }
  if(studio.getCampaign()?.id!==campaign.id)fail('Campagne STUDIO changée après mise à jour : reprise manuelle requise');
  if(typeof sceneId!=='string'||!sceneId)fail('Création STUDIO non confirmée : utiliser la réconciliation');
  await commit(next=>{
   if(next.extensions.pendingStudioOp?.kind!=='scene')fail('Journal STUDIO absent');
   next.links.sceneId=sceneId;next.status='mj-validated';
   delete next.extensions.pendingStudioOp;
  });
  return {sceneId};
  }finally{studioActionInFlight=false;}
 }
 /** INDEX L004-C real contract, injected by 05. No catalog code is duplicated here. */
 async function bindIndexChain(){
  if(!indexChain||typeof indexChain.createDescriptiveChain!=='function'||
      typeof indexChain.validateDescriptiveChain!=='function'||
      typeof indexChain.createPrivateChainSnapshot!=='function'||
      typeof indexChain.validatePrivateChainSnapshot!=='function')
    fail('Contrat INDEX L004-C absent — chaîne descriptive indisponible');
  if(!studio||typeof studio.getCampaign!=='function')fail('STUDIO requis pour une chaîne complète');
  const campaign=studio.getCampaign(),s=copy();
  if(!campaign||typeof campaign.id!=='string'||!ids.test(campaign.id))fail('Campagne STUDIO avec ID requise');
  if(!CYCLE_STEPS.every(k=>s.entries[k]?.status==='mj-validated'))fail('Quatre validations descriptives MJ requises');
  if(s.extensions.pendingStudioOp)fail('Réconciliation STUDIO requise avant INDEX');
  if(!s.links.creatureInstanceId||!s.links.sceneId||!s.links.creatureSource)fail('Copies réelles STUDIO créature/scène requises');
  if(!campaign.creatures?.some(x=>x.id===s.links.creatureInstanceId)||
      !campaign.scenes?.some(x=>x.id===s.links.sceneId))fail('Instances STUDIO manquantes : chaîne bloquée');
  const origin=(sourceId,sourceVersion)=>({originKind:'campaign',sourceSchema:CYCLE_SCHEMA,sourceId,sourceVersion});
  const catalogSource=kind=>{
   const entry=s.entries[kind]?.catalogEntry;
   if(!isObject(entry)||typeof entry.id!=='string'||typeof entry.schema!=='string'||
      typeof entry.version!=='string'||!isObject(entry.provenance))fail('Référence INDEX descriptive incomplète : '+kind);
   return {id:entry.id,version:entry.version,schema:entry.schema,
    status:entry.definitionState??'experimental',provenance:cloneCycleJSON(entry.provenance)};
  };
  const itemSource=catalogSource('item'),capSource=catalogSource('capacity');
  const creatureSource={id:s.links.creatureSource.documentId,version:s.entries.creature.version,
   schema:'cer.creators.dg004.creature-source.v0',status:'draft',
   provenance:origin(s.links.creatureSource.documentId,s.entries.creature.version),
   documentCode:s.links.creatureSource.documentId,profileId:s.links.creatureSource.profileId,ruleset:s.links.creatureSource.ruleset};
  const sceneDoc='scene-source-'+s.id;
  const sceneSource={id:sceneDoc,version:s.entries.scene.version,
   schema:'cer.creators.dg004.scene-source.v0',status:'draft',provenance:origin(sceneDoc,s.entries.scene.version)};
  const chainInput={id:'chain:local:'+s.id.toLowerCase(),version:'0.1.0',campaignId:campaign.id,
   provenance:origin(s.id,'0.1.0'),links:[
    {kind:'item',source:itemSource,instance:{id:'item-'+s.id,campaignId:campaign.id},status:'proposed'},
    {kind:'capability',source:capSource,status:'proposed'},
    {kind:'creature',source:creatureSource,instance:{id:s.links.creatureInstanceId,campaignId:campaign.id},status:'proposed'},
    {kind:'scene',source:sceneSource,instance:{id:s.links.sceneId,campaignId:campaign.id},status:'proposed'},
   ]};
  const result=indexChain.createDescriptiveChain(chainInput);
  if(result?.ok!==true||result.executable!==false)fail('INDEX a refusé la chaîne : '+(result?.errors??[]).join('; '));
  const validated=indexChain.validateDescriptiveChain(result.chain);
  if(validated?.ok!==true||validated.executable!==false)fail('INDEX chaîne invalide');
  // Source snapshots / drafts keep unknowns and different Grimoire/rite/INDEX versions untouched.
  const originals=Object.fromEntries(CYCLE_STEPS.map(k=>[k==='capacity'?'capability':k,{
   draft:cloneCycleJSON(s.drafts[k]),entry:cloneCycleJSON(s.entries[k]),rawSources:k==='item'?cloneCycleJSON(s.sourceSnapshots):[]}]));
  const privateResult=indexChain.createPrivateChainSnapshot(validated.chain,originals);
  if(privateResult?.ok!==true||privateResult.executable!==false||
     indexChain.validatePrivateChainSnapshot(privateResult.snapshot)?.ok!==true)
    fail('INDEX a refusé le snapshot confidentiel : '+(privateResult?.errors??[]).join('; '));
  await commit(next=>{next.extensions.indexL004={chain:cloneCycleJSON(validated.chain),
   privateSnapshot:cloneCycleJSON(privateResult.snapshot),visibility:'mj-private-only'};});
  return {chain:cloneCycleJSON(validated.chain),snapshot:cloneCycleJSON(privateResult.snapshot),executable:false};
 }
 async function load(){if(studioActionInFlight)fail('Opération STUDIO en cours : rechargement interdit');await queue;const loaded=await persistence.load();if(loaded!==null)state=validateCycle(loaded);return copy();}
 async function exportPrivate(){await queue;const s=copy(),out={kind:'cer.dg004.creators.confidential-export.v0',cycle:s};return encoder.encode(JSON.stringify(out));}
 function previewRestore(input){
  const bytes=input instanceof Uint8Array?new Uint8Array(input):null;
  if(!bytes||!bytes.length||bytes.byteLength>MAX_CYCLE_BYTES)fail('Archive hors limites');
  const obj=JSON.parse(decoder.decode(bytes));inspectJSON(obj);
  if(!isObject(obj)||obj.kind!=='cer.dg004.creators.confidential-export.v0')fail('Archive privée inconnue');
  const next=validateCycle(obj.cycle);
  pendingRestore={state:next,token:idFactory()};
  if(typeof pendingRestore.token!=='string'||!pendingRestore.token)fail('Jeton restauration indisponible');
  return {token:pendingRestore.token,display:makeSummary(next),accepted:false};
 }
 async function acceptRestore(token){
  if(studioActionInFlight||state.extensions.pendingStudioOp)
   fail('Réconciliation STUDIO requise avant restauration');
  if(!pendingRestore||token!==pendingRestore.token)fail('Restauration non prévisualisée');
  const next=cloneCycleJSON(pendingRestore.state);
  const op=queue.catch(()=>{}).then(async()=>{
   const receipt=await persistence.save(next);
   if(receipt?.saved!==true)fail('Restauration non enregistrée');
   state=next;pendingRestore=null;return copy();
  });queue=op.catch(()=>{});return op;
 }
 async function addOriginalSource(source){const snapshot=cloneCycleJSON(source);
  return commit(next=>{next.sourceSnapshots.push(snapshot);});
 }
 /** Optional binary originals are held unmodified inside CONFIDENTIAL exports. No decoding, casting or version coercion. */
 async function addOriginalSourceBytes(bytes,metadata={}){
  if(!(bytes instanceof Uint8Array)||bytes.length===0||bytes.length>1024*1024)fail('Source brute hors limites (1 Mio)');
  if(!globalThis.crypto?.subtle?.digest)fail('SHA-256 natif indisponible');
  const snapshot=cloneCycleJSON(metadata),raw=new Uint8Array(bytes);
  const hash=await globalThis.crypto.subtle.digest('SHA-256',raw);
  const sha256=[...new Uint8Array(hash)].map(n=>n.toString(16).padStart(2,'0')).join('');
  let rawBase64='';for(let i=0;i<raw.length;i+=8192)rawBase64+=String.fromCharCode(...raw.subarray(i,i+8192));
  rawBase64=btoa(rawBase64);
  return commit(next=>{next.sourceSnapshots.push({kind:'binary-original-private',rawBase64,sha256,byteLength:raw.length,metadata:snapshot});});
 }

 return {getState:copy,getDraft:draft,saveDraft,setMode,go,validateMJ,attachCreature,attachScene,
  getStudioRecovery:safeRecoveryStatus,inspectStudioRecovery,reconcileStudioLink,abandonStudioRecovery,
  load,exportPrivate,previewRestore,acceptRestore,addOriginalSource,addOriginalSourceBytes,bindIndexChain};
}