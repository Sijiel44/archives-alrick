/**
 * CORE-COMPAT-001.R2 — adapter only; NO dice, XP, effects or level formula.
 * The DATA model validator, INDEX port and native rules are injected and MUST be
 * authentic before integration. A DATA label is never permission or a build.
 */
export const DATA_NATIVE_PORT_SCHEMA='cer.math.core-compat.data-native-ports.provisional.v0';
const allowedCombatFields = new Set([
 'natural','rawStat','masteryRank','situation','level','difficulty','kind',
 'mode','defender','feasible','baseDamage','penetration','mjMinimum','affinityBonus'
]);
const denied = (code,detail,status='blocked') => ({
 status,code,detail,schema:DATA_NATIVE_PORT_SCHEMA,
 appliedToSheet:false,executable:false,playerReady:false
});
const record = x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const level = x=>Number.isSafeInteger(x)&&x>=1&&x<=25;
const id = x=>typeof x==='string'&&x.length>0;
const clone = x=>structuredClone(x);
function candidate(input,validateModelRecord){
 if(typeof validateModelRecord!=='function')return denied('INDEX_DATA_VALIDATOR_REQUIRED','Aucune validation DATA présumée','unavailable');
 try {
  const v=validateModelRecord(input);
  if(!v||v.ok!==true||!record(v.value))return denied('INVALID_DATA_CANDIDATE','INDEX DATA a refusé la fiche');
  const r=v.value;
  if(!['pj','creature'].includes(r.recordKind))return denied('DESCRIPTIVE_ONLY','Référence non numérique');
  if(r.mechanics?.status==='blocked'||r.mechanics?.status==='not-applicable')
   return denied('MECHANICS_UNAVAILABLE','Statut DATA non éligible à la prévisualisation numérique');
  if(!level(r.data?.level))return denied('INVALID_CANDIDATE_LEVEL','Niveau DATA 1–25 exigé');
  if(!id(r.recordId)||!id(r.identity?.instanceId)||!id(r.identity?.campaignId))
   return denied('INVALID_CANDIDATE_IDENTITY','Identité d’instance de campagne absente');
  return {status:'candidate',value:r};
 } catch {return denied('INVALID_DATA_CANDIDATE','Validation DATA a levé une exception');}
}
/** DATA PJ/créature -> M01 native progression reference only; never purchases levels. */
export function previewDataProgression(input,{validateModelRecord,previewNativeLevel,progressionAtLevel}={}){
 const c=candidate(input,validateModelRecord);
 if(c.status!=='candidate')return c;
 if(c.value.recordKind!=='pj')
  return denied('CREATURE_NOT_PJ_PROGRESSION','Budget et progression PJ M01 non attribuables à une créature');
 if(typeof previewNativeLevel!=='function'||typeof progressionAtLevel!=='function')
  return denied('M01_PORT_MISSING','Port M01 officiel non fourni','unavailable');
 try {
  const p=previewNativeLevel(c.value.data.level,{progressionAtLevel});
  if(!p||p.ok!==true||p.applied!==false||p.executable!==false)return denied('M01_NATIVE_REJECTED','Réponse du port M01 invalide');
  return {status:'preview',schema:DATA_NATIVE_PORT_SCHEMA,engine:'M01',
   recordId:c.value.recordId,instanceId:c.value.identity.instanceId,
   level:c.value.data.level,result:clone(p.preview),
   appliedToSheet:false,executable:false,playerReady:false};
 } catch {return denied('M01_NATIVE_REJECTED','Erreur du port M01');}
}
/** DATA -> M03: a caller supplies an explicit native, effect-free combat fixture.
 * Nothing in DATA's narrative, source, level or 'reported-validated' claims can
 * authorize a numeric effect, alter the fight or grant a resource.
 */
export function previewDataCombat(input,nativeCombat,{validateModelRecord,previewNativeCombat,resolveCombatM03}={}){
 const c=candidate(input,validateModelRecord);
 if(c.status!=='candidate')return c;
 if(!record(nativeCombat)||Object.keys(nativeCombat).some(k=>!allowedCombatFields.has(k)))
  return denied('NUMERIC_EXTENSION_NOT_AUTHORIZED','Effet, objet ou champ numérique étranger M03 refusé');
 if(!level(nativeCombat.level)||nativeCombat.level!==c.value.data.level)
  return denied('LEVEL_MISMATCH','Le niveau natif explicite doit correspondre au candidat DATA');
 if(typeof nativeCombat.feasible!=='boolean'||!
  ['melee','tir','magie','mental'].includes(nativeCombat.mode)||
  !['physique','magie','mental'].includes(nativeCombat.kind))
  return denied('INVALID_NATIVE_COMBAT_INPUT','Enums et faisabilité M03 requis');
 if(typeof previewNativeCombat!=='function'||typeof resolveCombatM03!=='function')
  return denied('M03_PORT_MISSING','Port M03 officiel non fourni','unavailable');
 try {
  const p=previewNativeCombat({
   actor:c.value.recordKind,recordId:c.value.recordId,combat:clone(nativeCombat)
  },{previewM03:request=>({native:resolveCombatM03(request.combat),applied:false,executable:false})});
  if(!p||p.ok!==true||p.executable!==false||p.preview?.applied!==false)
   return denied('M03_NATIVE_REJECTED','Port M03 indisponible ou hors contrat');
  return {status:'preview',schema:DATA_NATIVE_PORT_SCHEMA,engine:'M03',
   recordId:c.value.recordId,instanceId:c.value.identity.instanceId,
   level:c.value.data.level,result:clone(p.preview.native),
   appliedToSheet:false,executable:false,playerReady:false};
 } catch{return denied('M03_NATIVE_REJECTED','Erreur du port M03');}
}
/** DATA PJ -> INDEX XP read-only -> MATH.suggestXpFromM01 -> M01.
 * This port cannot make a MJ decision or send the result to M02.grantAward.
 */
export function previewDataXp(input,ledger,event,{validateModelRecord,inspectNativeXpSuggestion,suggestXpFromM01}={}){
 const c=candidate(input,validateModelRecord);
 if(c.status!=='candidate')return c;
 if(c.value.recordKind!=='pj')return denied('NON_PJ_XP','Créatures et PNJ non bénéficiaires par défaut');
 if(ledger?.seed?.characterId!==c.value.identity.instanceId||
    ledger?.seed?.campaignId!==c.value.identity.campaignId||!id(event?.id))
  return denied('XP_IDENTITY_MISMATCH','Journal, fiche et événement source doivent être explicitement liés');
 // The catalogue's suggestion port is read-only; the MATH ledger owns replay.
 // Even a zero-XP prior decision reserves its unique source event identity.
 if(Array.isArray(ledger?.entries)&&ledger.entries.some(x=>
  x?.command?.kind==='award'&&x.command.event?.id===event.id))
  return denied('XP_SOURCE_ALREADY_RECORDED','Événement déjà décidé : correction append-only requise');
 if(typeof inspectNativeXpSuggestion!=='function'||typeof suggestXpFromM01!=='function')
  return denied('XP_PORT_MISSING','Ports INDEX/MATH XP absents','unavailable');
 try {
  const p=inspectNativeXpSuggestion({ledger:clone(ledger),event:clone(event)},
   {suggestXpFromM01:({ledger,event})=>suggestXpFromM01(ledger,event)});
  if(!p||p.ok!==true||p.awarded!==false||p.levelValidated!==false||p.executable!==false)
   return denied('XP_SUGGESTION_REJECTED','M01/INDEX a refusé la suggestion');
  return {status:'preview',schema:DATA_NATIVE_PORT_SCHEMA,engine:'M01-XP',
   recordId:c.value.recordId,instanceId:c.value.identity.instanceId,
   eventId:event.id,candidateXp:p.candidateXp,
   decisionRequired:true,idempotency:'MATH-ledger-external',
   appliedToSheet:false,executable:false,playerReady:false};
 } catch{return denied('XP_SUGGESTION_REJECTED','Erreur du port XP');}
}
