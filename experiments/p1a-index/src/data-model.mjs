/** DATA-MODEL-001 P1-A: local proposal, never an authoritative rules/canon/storage service. */
export const DATA_MODEL_SCHEMA='cer.index.data-model.p1a.proposal.v0';
export const PRIVATE_PACKAGE_KIND='cer.index.p1a.private-package.v0';
export const MODEL_LEVELS=Object.freeze([1,5,10,15,20,25]);
const KINDS=new Set(['pj','creature','npc','item','ability','spell-ref','ritual-ref','scene']);
const LIFECYCLES=new Set(['draft','in-review','archived']);
const LAYERS=new Set(['proposal','played','canon-reference']);
const MECHANICS=new Set(['not-evaluated','native-reference','blocked','not-applicable']);
const ID=/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/;
const SEMVER=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/;
const SHA=/^[a-f0-9]{40}$/i;
const FORBIDDEN=new Set(['__proto__','constructor','prototype']);
const ACTIVE=new Set(['approved','authorized','autoApply','applied','grantXp','creditXp','publish','canonize','damageBonus','attackBonus']);
const LIMIT=512_000;
const own=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
const rec=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const issue=(code,path,message)=>({code,path,message});
const out=(errors,value)=>errors.length?{ok:false,code:errors[0].code,issues:errors,executable:false}:{ok:true,value,issues:[],executable:false};
const id=x=>typeof x==='string'&&ID.test(x);
const text=x=>typeof x==='string'&&x.trim().length>0&&x.length<=2000;
function cloneJson(source){
 const seen=new WeakSet();let size=0;
 function walk(v,depth){
  if(depth>32)throw Error('JSON_DEPTH');
  if(v===null||typeof v==='boolean')return v;
  if(typeof v==='string'){size+=v.length*2;if(size>LIMIT)throw Error('JSON_SIZE');return v;}
  if(typeof v==='number'&&Number.isFinite(v))return v;
  if(typeof v!=='object')throw Error('JSON_TYPE');
  if(seen.has(v))throw Error('JSON_CYCLE');seen.add(v);
  const p=Object.getPrototypeOf(v);
  if(Array.isArray(v)?p!==Array.prototype:p!==Object.prototype&&p!==null)throw Error('JSON_PROTO');
  const out=Array.isArray(v)?[]:Object.create(null);
  for(const [key,d] of Object.entries(Object.getOwnPropertyDescriptors(v))){
   if(FORBIDDEN.has(key)||!own(d,'value'))throw Error('JSON_KEY_OR_GETTER');
   if(Array.isArray(v)&&key==='length')continue;
   if(!d.enumerable)throw Error('JSON_HIDDEN');
   size+=key.length*2;if(size>LIMIT)throw Error('JSON_SIZE');
   out[key]=walk(d.value,depth+1);
  }
  seen.delete(v);
  if(Array.isArray(v)&&out.length!==v.length)throw Error('JSON_SPARSE_ARRAY');
  return out;
 }
 const copy=walk(source,0);
 if(JSON.stringify(copy).length>LIMIT)throw Error('JSON_SIZE');
 return copy;
}
export {cloneJson as clonePrivateJSON};
function rejectExecution(x,errors,path='record'){
 if(Array.isArray(x)){x.forEach((v,i)=>rejectExecution(v,errors,`${path}[${i}]`));return;}
 if(!rec(x))return;
 // Original archived input is data, not a decision. Never expose or interpret it.
 if(path==='record.privacy'||path.startsWith('record.privacy.'))return;
 for(const [k,v] of Object.entries(x)){
  if(ACTIVE.has(k)&&(v===true||typeof v==='number'))errors.push(issue('AUTHORITY_FORBIDDEN',path+'.'+k,'Action/autorisation non créable par INDEX'));
  rejectExecution(v,errors,path+'.'+k);
 }
}
/** The validator certifies a shape, never authenticates an external lore approval. */
export function validateModelRecord(input){
 let r;try{r=cloneJson(input);}catch(e){return out([issue('INVALID_PRIVATE_JSON','record','JSON privé non sûr ou non représentable')]);}
 const er=[];
 if(!rec(r))return out([issue('INVALID_RECORD','record','Objet requis')]);
 if(r.schema!==DATA_MODEL_SCHEMA)er.push(issue('UNKNOWN_SCHEMA','schema','Version de contrat non reconnue'));
 if(!KINDS.has(r.recordKind))er.push(issue('INVALID_KIND','recordKind','Famille de document inconnue'));
 if(!id(r.recordId))er.push(issue('INVALID_ID','recordId','Identité de fiche invalide'));
 if(typeof r.version!=='string'||!SEMVER.test(r.version))er.push(issue('INVALID_VERSION','version','SemVer exigée'));
 if(!Number.isSafeInteger(r.revision)||r.revision<0)er.push(issue('INVALID_REVISION','revision','Révision entière attendue'));
 if(!rec(r.identity)||!id(r.identity.definitionId)||!SEMVER.test(r.identity.definitionVersion??''))er.push(issue('INVALID_IDENTITY','identity','Définition et version requises'));
 else {
  const v=r.identity;
  if(v.instanceId!==undefined&&!id(v.instanceId))er.push(issue('INVALID_NATIVE_ID','identity.instanceId','ID instance natif opaque attendu'));
  if(v.variantId!==undefined&&!id(v.variantId))er.push(issue('INVALID_VARIANT','identity.variantId','Identité variante invalide'));
  if(v.campaignId!==undefined&&!id(v.campaignId))er.push(issue('INVALID_CAMPAIGN','identity.campaignId','Campagne invalide'));
  if(v.instanceId!==undefined&&!v.campaignId)er.push(issue('MISSING_CAMPAIGN','identity.campaignId','Campagne requise pour toute instance'));
  if(v.instanceId===v.definitionId)er.push(issue('IDENTITY_COLLISION','identity.instanceId','Instance et définition distinctes'));
 }
 if(!rec(r.provenance)||!['synthetic','native-reference','historical-reference'].includes(r.provenance.origin)||
 !text(r.provenance.sourceSchema)||!text(r.provenance.sourceId))er.push(issue('INVALID_PROVENANCE','provenance','Source et origine explicites requises'));
 else if(r.provenance.origin!=='synthetic'&&(!SHA.test(r.provenance.sourceCommit??'')||!SHA.test(r.provenance.sourceBlob??'')))
  er.push(issue('UNPINNED_SOURCE','provenance.sourceCommit','SHA commit et blob obligatoires pour source historique/native'));
 if(!rec(r.state)||!LIFECYCLES.has(r.state.lifecycle)||!LAYERS.has(r.state.layer)||!rec(r.state.attestation)||
 !['unverified','externally-attested'].includes(r.state.attestation.status)||!Array.isArray(r.state.attestation.evidenceRefs))
 er.push(issue('INVALID_STATE','state','Statuts distincts obligatoires'));
 else if(r.state.layer!=='proposal'&&(r.state.attestation.status!=='externally-attested'||r.state.attestation.evidenceRefs.length===0))
 er.push(issue('ATTESTATION_REQUIRED','state.attestation','Aucun fait joué ou canon sans attestation externe'));
 if(!rec(r.mechanics)||!MECHANICS.has(r.mechanics.status)||!['unvalidated','reported-validated'].includes(r.mechanics.validationStatus))er.push(issue('INVALID_MECHANICS','mechanics','Référence mécanique non exécutante attendue'));
 else if(r.mechanics.status==='native-reference'&&(!rec(r.mechanics.nativeRef)||!text(r.mechanics.nativeRef.module)||!SHA.test(r.mechanics.nativeRef.sourceBlob??'')))
 er.push(issue('INVALID_NATIVE_REF','mechanics.nativeRef','Port natif et blob épinglés requis'));
 if(!rec(r.narrative)||!text(r.narrative.name)||typeof r.narrative.summary!=='string')er.push(issue('INVALID_NARRATIVE','narrative','Nom et résumé requis'));
 if(!rec(r.privacy)||r.privacy.visibility!=='mj-private'||typeof r.privacy.notes!=='string')
 er.push(issue('PRIVATE_MISSING','privacy','Zone MJ privée obligatoire'));
 if(!Array.isArray(r.media)||r.media.length>30||r.media.some(m=>!rec(m)||!id(m.assetId)||!['pending','confirmed'].includes(m.rights)||!['mj-private','public-candidate'].includes(m.visibility)))
 er.push(issue('INVALID_MEDIA','media','Droits et visibilité média explicites'));
 if(!rec(r.data))er.push(issue('INVALID_DATA','data','Données de type objet JSON requises'));
 else {
  if(own(r.data,'level')&&(!Number.isSafeInteger(r.data.level)||r.data.level<1||r.data.level>25))
   er.push(issue('LEVEL_OUT_OF_RANGE','data.level','Niveau hors M01 1–25'));
  if(r.recordKind==='scene'&&(!Array.isArray(r.data.participants)||r.data.participants.some(p=>!rec(p)||!id(p.recordId)||!id(p.instanceId)||!['pj','pnj','creature'].includes(p.role))))
   er.push(issue('INVALID_PARTICIPANTS','data.participants','Références d’instances/roles requises'));
 }
 rejectExecution(r,er);
 return out(er,r);
}
export function validateModelDataset(records){
 if(!Array.isArray(records)||records.length>100)return out([issue('INVALID_DATASET','records','Liste de 100 fiches maximum')]);
 const problems=[],byId=new Map(),inst=new Map(),variantKeys=new Map();
 records.forEach((v,i)=>{
  const r=validateModelRecord(v);if(!r.ok){problems.push(...r.issues.map(e=>({...e,path:`records[${i}].${e.path}`})));return;}
  const a=r.value;
  if(byId.has(a.recordId))problems.push(issue('DUPLICATE_RECORD',`records[${i}].recordId`,'Collision d’identité et de révision dans le snapshot'));
  byId.set(a.recordId,a);
  const key=a.identity.instanceId?JSON.stringify([a.identity.campaignId,a.identity.instanceId]):null;
  if(key&&inst.has(key))problems.push(issue('DUPLICATE_INSTANCE',`records[${i}].identity.instanceId`,'Instance déjà affectée dans la campagne'));
  if(key)inst.set(key,a);
  if(a.identity.variantId){
   const key=JSON.stringify([a.identity.definitionId,a.identity.variantId]);
   if(variantKeys.has(key))problems.push(issue('DUPLICATE_VARIANT',`records[${i}].identity.variantId`,'Variante déjà définie pour cette définition'));
   variantKeys.set(key,a.recordId);
  }
 });
 for(const [i,r] of records.entries()){
  if(r?.identity?.variantId){
   const base=byId.get(r?.data?.variantOf);
   if(!base||base.identity.definitionId!==r.identity.definitionId||base.recordKind!==r.recordKind||base.identity.variantId)
    problems.push(issue('UNRESOLVED_VARIANT',`records[${i}].data.variantOf`,'Définition de variante absente ou incohérente'));
  }
  if(r?.recordKind!=='scene'||!Array.isArray(r.data?.participants))continue;
  const seen=new Set();
  for(const [j,p] of r.data.participants.entries()){
   if(!rec(p)||!id(p.instanceId))continue;
   const key=JSON.stringify([r.identity.campaignId,p.instanceId]);
   if(seen.has(key))problems.push(issue('DUPLICATE_PARTICIPANT',`records[${i}].data.participants[${j}]`,'Participant en double'));
   seen.add(key);
   const actor=byId.get(p.recordId);
   const role=actor?.recordKind==='npc'?'pnj':actor?.recordKind;
   if(!actor||role!==p.role||actor.identity.instanceId!==p.instanceId||actor.identity.campaignId!==r.identity.campaignId)
    problems.push(issue('UNRESOLVED_PARTICIPANT',`records[${i}].data.participants[${j}]`,'Instance/rôle/campagne ne correspondent pas'));
  }
 }
 return out(problems,records);
}
export function exportPrivateDataset(records){
 const r=validateModelDataset(records);if(!r.ok)return r;
 const pack={kind:PRIVATE_PACKAGE_KIND,privacy:'mj-private',records:r.value};
 const json=JSON.stringify(pack);
 if(json.length>LIMIT)return out([issue('JSON_SIZE','package','Export trop volumineux')]);
 return {ok:true,format:'application/json',json,executable:false};
}
export function importPrivateDataset(json){
 if(typeof json!=='string'||json.length>LIMIT)return out([issue('JSON_SIZE','package','Fichier texte trop volumineux')]);
 let data;try{data=JSON.parse(json);}catch{return out([issue('INVALID_JSON','package','Syntaxe JSON incorrecte')]);}
 if(!rec(data)||data.kind!==PRIVATE_PACKAGE_KIND||data.privacy!=='mj-private')
  return out([issue('UNKNOWN_PACKAGE','package.kind','Export privé incompatible')]);
 return validateModelDataset(data.records);
}
/** Only a candidate for STUDIO. Never a player transport or publication. */
export function makeSelectedPlayerCandidate(raw,{selected=false}={}){
 const r=validateModelRecord(raw);if(!r.ok)return r;
 if(selected!==true)return out([issue('EXPLICIT_SELECTION_REQUIRED','selected','Sélection MJ explicite nécessaire')]);
 const v=r.value;
 return {ok:true,executable:false,requiresStudioWhitelist:true,candidate:{schema:'cer.index.player-candidate.p1a.v0',id:v.recordId,kind:v.recordKind,label:v.narrative.name,summary:v.narrative.summary,media:v.media.filter(m=>m.visibility==='public-candidate'&&m.rights==='confirmed').map(m=>({assetId:m.assetId}))}};
}
