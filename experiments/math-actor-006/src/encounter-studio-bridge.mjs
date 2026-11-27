/** MATH-ACTOR-006 : adaptateur Studio MJ. Source de vérité : bibliothèque, stockage transactionnel, M03 natif. */
import {createEncounterDraft,importEncounterDraft,exportEncounterDraft,addEncounterParticipant,
 removeEncounterParticipant,summarizeEncounter,previewEncounterAction} from './encounter-draft.mjs';
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const copy=x=>structuredClone(x);
const label=(x,key)=>{if(typeof x!=='string'||!x.trim()||x.length>200)throw new TypeError(key+' invalide.');return x;};
function verifySnapshot(participant,live,campaignId){
 if(!obj(live)||live.privateAccess===false||live.deleted===true||live.campaignId!==campaignId||
 live.id!==participant.actorId||live.kind!==participant.kind||live.level!==participant.level||live.label!==participant.label||
 live.profileRef?.engine!=='M03'||live.profileRef?.level!==participant.level||
 live.profileRef?.id!==participant.profileRef.id||live.profileRef?.version!==participant.profileRef.version||
 live.sourceRef?.id!==participant.sourceRef.id||live.sourceRef?.version!==participant.sourceRef.version)
 throw Error('Fiche modifiée ou inaccessible : revalider le participant dans le Studio.');
}
function checkDice(dice){
 if(!Array.isArray(dice)||dice.length!==5||!dice.every(x=>Number.isInteger(x)&&x>=1&&x<=6))
 throw new RangeError('Cinq dés physiques entre 1 et 6 sont requis.');
 return [...dice];
}
/**
 * catalog.list/read : accès MJ aux fiches de campagne ; list renvoie id/kind/level/label uniquement.
 * catalog.read : l'instance complète doit être filtrée par permissions et possède sourceRef/profileRef.
 * repository.read/compareAndSwap : CAS ATOMIQUE (une transaction IndexedDB).
 * resolveM03 : moteur natif officiel délégué, sans dépense ni écriture.
 */
export function createEncounterStudioBridge({campaignId,encounterId,catalog,repository,resolveM03}){
 label(campaignId,'campaignId');label(encounterId,'encounterId');
 if(typeof catalog?.list!=='function'||typeof catalog?.read!=='function')throw TypeError('Port catalogue MJ requis.');
 if(typeof repository?.read!=='function'||typeof repository?.compareAndSwap!=='function')throw TypeError('Port transactionnel requis.');
 if(typeof resolveM03!=='function')throw TypeError('Port M03 officiel requis.');
 let draft=null;
 const get=()=>{if(!draft)throw Error('Rencontre non chargée.');return copy(draft);};
 const identity=d=>{if(d.campaignId!==campaignId||d.encounterId!==encounterId)throw Error('Identité de campagne ou rencontre incompatible.');return d;};
 async function load(){
  const saved=await repository.read({campaignId,encounterId});
  draft=saved?identity(importEncounterDraft(saved)):createEncounterDraft({campaignId,encounterId});
  return get();
 }
 async function list(){
  const entries=await catalog.list({campaignId});
  if(!Array.isArray(entries))throw TypeError('Catalogue invalide.');
  return entries.filter(x=>obj(x)&&x.campaignId===campaignId&&x.privateAccess!==false&&x.deleted!==true)
    .map(x=>({id:x.id,kind:x.kind,label:x.label,level:x.level}));
 }
 async function save(build){
  const old=get(),next=build(old);
  const confirmation=await repository.compareAndSwap({campaignId,encounterId,expectedRevision:old.revision,nextDraft:copy(next)});
  if(!obj(confirmation)||confirmation.ok!==true)throw Error('Conflit de révision : actualiser la rencontre (aucune modification appliquée).');
  const confirmed=identity(importEncounterDraft(confirmation.draft));
  if(confirmed.revision!==next.revision||exportEncounterDraft(confirmed)!==exportEncounterDraft(next))
   throw Error('Confirmation de stockage incohérente : actualiser la rencontre.');
  draft=confirmed;
  return get();
 }
 async function add({actorId,side,role}){
  label(actorId,'actorId');
  const record=await catalog.read({campaignId,actorId});
  if(!obj(record)||record.id!==actorId||record.campaignId!==campaignId||record.deleted===true||record.privateAccess===false)
   throw Error('Fiche introuvable ou non accessible dans cette campagne.');
  const selected={actorId:record.id,kind:record.kind,side,role,label:record.label,level:record.level,
   sourceRef:copy(record.sourceRef),profileRef:copy(record.profileRef)};
  return save(current=>addEncounterParticipant(current,selected,current.revision));
 }
 async function remove(actorId){
  label(actorId,'actorId');return save(current=>removeEncounterParticipant(current,actorId,current.revision));
 }
 async function preview({attackerId,defenderId,dice}){
  const current=get();
  const attacker=current.participants.find(x=>x.actorId===attackerId);
  const defender=current.participants.find(x=>x.actorId===defenderId);
  if(!attacker||!defender||attacker.actorId===defender.actorId)throw Error('Sélection de combat invalide.');
  const [liveA,liveD]=await Promise.all([
   catalog.read({campaignId,actorId:attackerId}),catalog.read({campaignId,actorId:defenderId})]);
  verifySnapshot(attacker,liveA,campaignId);verifySnapshot(defender,liveD,campaignId);
  return previewEncounterAction(current,{attackerId,defenderId,action:{dice:checkDice(dice)},
   resolveM03:async payload=>copy(await resolveM03(copy(payload)))});
 }
 return {load,get,list,add,remove,preview,summary:()=>summarizeEncounter(get()),exportJSON:()=>exportEncounterDraft(get())};
}
/** Uniquement pour tests : ne pas utiliser comme stockage de production. */
export function createMemoryEncounterRepository(){
 const entries=new Map(),key=x=>x.campaignId+'\u0000'+x.encounterId;
 return {
  async read(x){return copy(entries.get(key(x))??null);},
  async compareAndSwap({campaignId,encounterId,expectedRevision,nextDraft}){
   const k=key({campaignId,encounterId}),current=entries.get(k);
   if((current?.revision??0)!==expectedRevision||nextDraft.revision!==expectedRevision+1)
    return {ok:false,draft:copy(current??null)};
   const next=importEncounterDraft(nextDraft);
   if(next.campaignId!==campaignId||next.encounterId!==encounterId)throw Error('Clé de sauvegarde incompatible.');
   entries.set(k,copy(next));return {ok:true,draft:copy(next)};
  }
 };
}
