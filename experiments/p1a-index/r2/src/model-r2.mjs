/** DATA-MODEL-001.R2: additive conformance profile for the *existing* INDEX P1 envelope.
 * No new record schema id, canonical authority, mechanics, storage writes or browser transport.
 */
import {DATA_MODEL_SCHEMA, clonePrivateJSON, validateModelRecord, validateModelDataset,
 exportPrivateDataset, importPrivateDataset, makeSelectedPlayerCandidate} from '../../src/data-model.mjs';
import {previewNativeLevel, previewNativeCombat} from '../../src/core-ports.mjs';
export const R2_PROFILE = 'cer.index.data-model.p1a.profile.r2.experimental';
export const ATELIERS_INPUT_SCHEMA='cer.p1.data-model.record.proposal.v0';
export const ARCH_STORAGE_CAMPAIGN_SCHEMA='cer.arch-storage001.campaign.proposal.v0';
const roles=new Set(['definition','instance','variant']);
const truthReference=new Set(['proposal','canon','not-applicable','unverified']);
const truthPlayed=new Set(['not-played','played','unverified']);
const truthPublication=new Set(['unpublished','published','unverified']);
const scopes=new Set(['sandbox-fixture','campaign','universe']);
const safeId=x=>typeof x==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(x);
const archId=x=>typeof x==='string'&&/^[A-Za-z0-9][A-Za-z0-9:_-]{0,99}$/.test(x);
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const issue=(code,path,message)=>({code,path,message});
const reject=(code,path,message)=>({ok:false,code,issues:[issue(code,path,message)],executable:false});
const rejectAll=(issues)=>({ok:false,code:issues[0]?.code??'INVALID_RECORD',issues,executable:false});
function safeCopy(x){try{return {ok:true,value:clonePrivateJSON(x)}}catch{return reject('INVALID_PRIVATE_JSON','record','JSON non sûr, non clonable ou hors limites')}}
const layerFrom=c=>c.referenceStatus==='canon'?'canon-reference':c.playedStatus==='played'?'played':'proposal';
function verifyContinuity(c,er,path='continuity'){
 if(!obj(c)||!truthReference.has(c.referenceStatus)||!truthPlayed.has(c.playedStatus)||
 !truthPublication.has(c.publicationStatus)||!scopes.has(c.scope))return er.push(issue('INVALID_CONTINUITY',path,'Vérités éditoriale, faits joués et publication distincts'));
 for(const [status,marker,name] of [['canon','canonEvidenceRef','referenceStatus'],['played','playedEvidenceRef','playedStatus'],['published','publicationEvidenceRef','publicationStatus']]){
  const k=name==='referenceStatus'?'referenceStatus':name==='playedStatus'?'playedStatus':'publicationStatus';
  if(c[k]===status&&!(typeof c[marker]==='string'&&c[marker].trim()))er.push(issue('EXTERNAL_EVIDENCE_REQUIRED',`${path}.${marker}`,'Référence de preuve externe absente ; aucun statut authentifié par INDEX'));
 }
 if(c.scope==='sandbox-fixture'&&(c.referenceStatus!=='proposal'||c.playedStatus!=='not-played'||c.publicationStatus!=='unpublished'))
  er.push(issue('FIXTURE_CANNOT_PROMOTE',path,'Une fixture ne devient ni jouée, ni publiée, ni canonique'));
}
/** Semantic R2 addendum: existing envelope & native records remain authoritative. */
export function validateR2Record(input){
 const raw=safeCopy(input);if(!raw.ok)return raw;
 const v=validateModelRecord(raw.value);if(!v.ok)return v;
 const r=v.value,er=[];
 if(!roles.has(r.nodeType))er.push(issue('INVALID_NODE_TYPE','nodeType','Définition, instance ou variante attendu'));
 verifyContinuity(r.continuity,er);
 if(obj(r.continuity)&&layerFrom(r.continuity)!==r.state.layer)
  er.push(issue('LEGACY_LAYER_MISMATCH','state.layer','Ancienne couche dérivée incohérente avec vérités indépendantes'));
 if(r.nodeType==='definition'&&(r.identity.instanceId!==undefined||r.identity.variantId!==undefined))
  er.push(issue('DEFINITION_HAS_STATE','identity','Définition indépendante de campagne et variante'));
 if(r.nodeType==='instance'&&(!safeId(r.identity.instanceId)||!safeId(r.identity.campaignId)||r.identity.variantId!==undefined))
  er.push(issue('INSTANCE_ID_REQUIRED','identity.instanceId','Instance de campagne native distincte'));
 if(r.nodeType==='variant'&&(!safeId(r.identity.variantId)||r.identity.instanceId!==undefined||!safeId(r.data?.variantOf)))
  er.push(issue('VARIANT_BASE_REQUIRED','data.variantOf','Variante porte ID distinct et base déclarée'));
 if(r.privacy.playerProjection!=='explicit-approval-only'||!Array.isArray(r.privacy.publicFields)||
 r.privacy.publicFields.some(x=>!['narrative.name','narrative.summary','media.public'].includes(x)))
  er.push(issue('PRIVATE_POLICY_REQUIRED','privacy.publicFields','Liste blanche candidate et approbation explicite obligatoires'));
 if(!obj(r.extensions)||r.extensions.profile!==R2_PROFILE)
  er.push(issue('R2_PROFILE_REQUIRED','extensions.profile','Profil additif R2 explicite'));
 if(r.mechanics.validationStatus==='reported-validated'&&r.mechanics.status==='native-reference'&&r.mechanics.nativeRef?.approved===true)
  er.push(issue('NO_AUTO_AUTHORIZATION','mechanics.nativeRef','Le catalogue ne crée aucune permission'));
 if(r.media.some(m=>m.visibility==='public-candidate'&&m.rights!=='confirmed'))
  er.push(issue('MEDIA_RIGHTS_REQUIRED','media','Droit média explicite pour candidat public'));
 return er.length?rejectAll(er):{ok:true,value:r,issues:[],executable:false};
}
export function validateR2Dataset(input){
 const base=validateModelDataset(input);if(!base.ok)return base;
 const er=[];for(let i=0;i<input.length;i++){
  const v=validateR2Record(input[i]);if(!v.ok)er.push(...v.issues.map(e=>({...e,path:`records[${i}].${e.path}`})));
 }
 const def=new Map(input.filter(r=>r.nodeType==='definition').map(r=>[r.recordId,r]));
 for(let i=0;i<input.length;i++){
  const r=input[i];if(r.nodeType==='definition')continue;
  const parent=def.get(r.identity.definitionId);
  if(!parent)er.push(issue('UNRESOLVED_DEFINITION',`records[${i}].identity.definitionId`,'Définition présente dans le lot requise pour validation P1-R2'));
  else if(parent.recordKind!==r.recordKind)er.push(issue('DEFINITION_KIND_MISMATCH',`records[${i}].recordKind`,'Famille de définition incohérente'));
 }
 return er.length?rejectAll(er):{ok:true,value:base.value,issues:[],executable:false};
}
/** Real #102 shape to #105 envelope, without copying rule numbers or granting approvals. */
export function adaptAteliers102(input){
 const c=safeCopy(input);if(!c.ok)return c;const s=c.value;
 if(!obj(s)||s.schema!==ATELIERS_INPUT_SCHEMA||!roles.has(s.nodeType))return reject('ATELIERS_SCHEMA_MISMATCH','schema','Proposition #102 attendue');
 if(!safeId(s.recordId)||typeof s.recordVersion!=='string')return reject('ATELIERS_ID_INVALID','recordId','ID source opaque et version requis');
 const families={capability:'ability',spell:'spell-ref',ritual:'ritual-ref'};
 const recordKind=families[s.entityType]??s.entityType;
 const defId=s.nodeType==='definition'?s.recordId:s.nodeType==='variant'?s.baseDefinitionRef:s.definitionRef;
 if(!safeId(defId))return reject('MISSING_DEFINITION','definitionRef','Référence de définition absente');
 const source=s.provenance??{},cTruth=s.continuity??{},mechanics=s.mechanics??{};
 const origin=source.originKind==='proposal'||source.originKind==='campaign'?'synthetic':source.originKind==='native'?'native-reference':source.originKind==='legacy'?'historical-reference':null;
 if(!origin)return reject('INVALID_PROVENANCE','provenance.originKind','Origine inconnue');
 if(origin!=='synthetic'&&(!/^[a-f\d]{40}$/i.test(source.sourceCommit??'')||!/^[a-f\d]{40}$/i.test(source.sourceBlob??'')))
  return reject('SOURCE_BLOB_REQUIRED','provenance.sourceBlob','Référence native/historique non épinglée : aucune fausse preuve générée');
 const originalMedia=Array.isArray(s.media)?s.media:[];
 const media=originalMedia.map(m=>({assetId:m.mediaId,rights:m.rights==='cleared'?'confirmed':'pending',
  visibility:m.rights==='cleared'&&m.audience==='public-after-approval'?'public-candidate':'mj-private',
  alt:m.alt??'',sourceRef:m.sourceRef??null,sourceRights:m.rights??'unknown'}));
 const identity={definitionId:defId,definitionVersion:s.recordVersion};
 if(s.nodeType==='instance'){identity.instanceId=s.recordId;identity.campaignId=s.campaignId;}
 if(s.nodeType==='variant')identity.variantId=s.recordId;
 const data=s.nodeType==='instance'?{... (obj(s.state?.current)?s.state.current:{}),sourceStatus:s.state?.status??'draft'}:
  s.nodeType==='variant'?{variantOf:s.baseDefinitionRef,variantChangesSummary:'voir original #102 privé; moteur requis'}:{};
 if(recordKind==='scene'&&!Array.isArray(data.participants))data.participants=[];
 const status=mechanics.mode==='native-reference'?'blocked':mechanics.mode==='none'?'not-applicable':'not-evaluated';
 const result={schema:DATA_MODEL_SCHEMA,recordKind,recordId:s.recordId,version:s.recordVersion,
  revision:s.nodeType==='instance'&&Number.isSafeInteger(s.state?.revision)?s.state.revision:0,
  nodeType:s.nodeType,identity,
  provenance:{origin,sourceSchema:source.sourceSchema,sourceId:source.sourceId,sourceVersion:source.sourceVersion,
   ...(source.sourceCommit?{sourceCommit:source.sourceCommit}:{}),...(source.sourceBlob?{sourceBlob:source.sourceBlob}:{}),sourceFidelity:source.fidelity??'unknown'},
  continuity:cTruth,
  state:{lifecycle:'draft',layer:layerFrom(cTruth),attestation:{status:'unverified',evidenceRefs:[]}},
  mechanics:{status,validationStatus:'unvalidated',sourceEngine:mechanics.engine??null,
   originalMode:mechanics.mode??'unknown',reason:'Référence native non homologuée par INDEX ; aucun calcul ni effet'},
  narrative:{name:s.narrative?.title,summary:s.narrative?.publicDescription??''},
  privacy:{visibility:'mj-private',notes:'Original ATELIERS #102 privé et non destructif',
   publicFields:Array.isArray(s.privacy?.publicFields)?s.privacy.publicFields.map(v=>v==='narrative.title'?'narrative.name':v==='narrative.publicDescription'?'narrative.summary':v):[],
   playerProjection:'explicit-approval-only',ateliersOriginal:s},media,data,
  extensions:{profile:R2_PROFILE,sourceModel:ATELIERS_INPUT_SCHEMA,sourceNodeType:s.nodeType}};
 const checked=validateR2Record(result);
 return checked.ok?{...checked,adaptation:'proposal-only',sourceRetained:true}:checked;
}
/** Inverse **only** for an explicit #102-adapted record; no heuristics or lossy mapping. */
export function recoverAteliers102(record){
 const r=validateR2Record(record);if(!r.ok)return r;
 if(r.value.extensions.sourceModel!==ATELIERS_INPUT_SCHEMA||!obj(r.value.privacy.ateliersOriginal))
  return reject('NO_ORIGINAL_102','privacy.ateliersOriginal','Aucun original #102 à restituer');
 return {ok:true,value:clonePrivateJSON(r.value.privacy.ateliersOriginal),executable:false};
}
/** Read-only bridge to a *candidate* ARCH-STORAGE-001 campaign. No transaction, no persisted authority. */
export function makeArchStorageCandidate(records,{campaignId='camp:p1r2-fiction'}={}){
 const all=validateR2Dataset(records);if(!all.ok)return all;
 if(!archId(campaignId))return reject('INVALID_CAMPAIGN','campaignId','ID ARCH-STORAGE : 100 caractères, deux-points natifs conservés, sans point');
 for(const [i,r] of records.entries()){
  if(r.identity.campaignId!==undefined&&r.identity.campaignId!==campaignId)return reject('CAMPAIGN_MISMATCH',`records[${i}].identity.campaignId`,'Pas d’alias silencieux entre campagne source et stockage');
  if(r.nodeType==='definition'&&(!archId(r.recordId)||!archId(r.provenance.sourceId)))
   return reject('ARCH_ID_UNSUPPORTED',`records[${i}].recordId`,'Identité source incompatible ARCH-STORAGE : aucun remplacement ni troncature');
  if(r.nodeType==='instance'&&!archId(r.identity.instanceId))
   return reject('ARCH_ID_UNSUPPORTED',`records[${i}].identity.instanceId`,'Identité d’instance incompatible ARCH-STORAGE sans conversion silencieuse');
 }
 const camp={schema:ARCH_STORAGE_CAMPAIGN_SCHEMA,id:campaignId,title:'INDEX P1-R2 : banc fictif',revision:1,
  sessions:[],characters:[],catalogReferences:[],instances:[],scenes:[],encounters:[],creatorDrafts:[],privateNotes:[],mediaAssets:[],
  extensions:{indexP1R2:{profile:R2_PROFILE,records:clonePrivateJSON(records),confidential:true,notApplied:true}}};
 for(const r of records){
  if(r.nodeType==='definition'){
   camp.catalogReferences.push({id:r.recordId,documentCode:r.provenance.sourceId,definitionId:r.identity.definitionId,
    version:r.version,provenance:clonePrivateJSON(r.provenance)});
  }else if(r.nodeType==='instance'&&r.recordKind==='pj'){
   camp.characters.push({id:r.identity.instanceId,source:{id:r.identity.definitionId,documentCode:r.provenance.sourceId},
    sourceRef:r.recordId,levelSnapshot:r.data.level??null});
  }else if(r.nodeType==='instance'&&r.recordKind==='creature'){
   camp.instances.push({id:r.identity.instanceId,profileId:r.data.profileReference??r.identity.definitionId,
    sourceDocumentCode:r.provenance.sourceId,catalogRefId:r.identity.definitionId,sourceRef:r.recordId});
  }else if(r.nodeType==='instance'&&r.recordKind==='scene'){
   camp.scenes.push({id:r.identity.instanceId,title:r.narrative.name,
    participantIds:Array.isArray(r.data.participants)?r.data.participants.map(p=>p.instanceId):[],sourceRef:r.recordId});
   if(r.privacy.notes)camp.privateNotes.push({id:`note:${r.identity.instanceId}`,sceneId:r.identity.instanceId,text:r.privacy.notes});
  }
 }
 return {ok:true,executable:false,persisted:false,campaign:camp,
  requiresNativeStorePreview:true,requiresExplicitCommit:true,originalsRetained:true};
}
export function recoverArchStorageCandidate(campaign){
 const c=safeCopy(campaign);if(!c.ok)return c;
 if(c.value?.schema!==ARCH_STORAGE_CAMPAIGN_SCHEMA||c.value?.extensions?.indexP1R2?.profile!==R2_PROFILE||
  c.value.extensions.indexP1R2.confidential!==true)
  return reject('ARCH_STORAGE_UNAVAILABLE','campaign.extensions.indexP1R2','Extension P1-R2 inconnue/privée absente');
 const valid=validateR2Dataset(c.value.extensions.indexP1R2.records);if(!valid.ok)return valid;
 const reconstructed=makeArchStorageCandidate(valid.value,{campaignId:c.value.id});if(!reconstructed.ok)return reconstructed;
 for(const key of ['characters','catalogReferences','instances','scenes','privateNotes'])
  if(JSON.stringify(c.value[key])!==JSON.stringify(reconstructed.campaign[key]))
   return reject('STORAGE_PROJECTION_MISMATCH',`campaign.${key}`,'Divergence entre copie matérialisée et originaux privés');
 return valid;
}
/** Native M01/M03 operations only: never infer an XP barème or authorize abilities. */
export function previewCandidateViaNative(record,ports={}){
 const r=validateR2Record(record);if(!r.ok)return r;
 const v=r.value;
 if(v.nodeType!=='instance'||v.mechanics.status!=='native-reference')
  return reject('NATIVE_MECHANICS_UNAVAILABLE','mechanics.status','Pas de lien exécutable validé');
 if(v.recordKind==='pj'&&Number.isSafeInteger(v.data?.level))return previewNativeLevel(v.data.level,ports);
 if(v.recordKind==='creature'){
  if(typeof ports.previewM03!=='function')return reject('NATIVE_M03_UNAVAILABLE','previewM03','Port M03 non fourni');
  return previewNativeCombat({profileRef:v.data?.profileReference,kind:'creature',readOnly:true},ports);
 }
 return reject('NATIVE_MECHANICS_UNAVAILABLE','recordKind','Aucune propriété calculée pour cette famille');
}
export function exportR2Private(records){const v=validateR2Dataset(records);return v.ok?exportPrivateDataset(v.value):v;}
export function importR2Private(json){const v=importPrivateDataset(json);return v.ok?validateR2Dataset(v.value):v;}
export function selectedPublicCandidate(record,options){const v=validateR2Record(record);return v.ok?makeSelectedPlayerCandidate(v.value,options):v;}
