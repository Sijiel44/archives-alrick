/**
 * INDEX L004-B/C — contrat local, provisoire et strictement non exécutant.
 * Base de référence: PR85@2ab809ef5351940e0fc272b859d10f21de894d00.
 * AUCUN changement M01–M05, aucune attribution XP, aucun level-up, aucun effet,
 * aucun débit ni approbation MJ. Les snapshots sont STRICTEMENT privés.
 */
import {
  clonePrivateJson,
  validateCatalogEntry,
  CATALOG_SCHEMA,
  CATALOG_UNAVAILABLE,
} from '../../../dg-lot003/src/catalog/index.mjs';

export const XP_SUGGESTION_SCHEMA = 'cer.catalog.dg004.xp-suggestion.v0';
export const DESCRIPTIVE_CHAIN_SCHEMA = 'cer.catalog.dg004.descriptive-chain.v0';
export const PRIVATE_CHAIN_SNAPSHOT_SCHEMA = 'cer.catalog.dg004.private-chain-snapshot.v0';
export const LEVEL_REFERENCE = Object.freeze([1, 5, 10, 15, 20, 25]);
export const READONLY_NOTICE = 'Prévisualisation uniquement — aucune attribution, validation de niveau ou effet appliqué';
export const MATH_ENCOUNTER_SCHEMA = 'cer.math.encounter-xp.provisional.v0';
export const MATH_XP_LEDGER_SCHEMA = 'cer.math.xp-decision.provisional.v1';
export const XP_JOURNAL_REFERENCE_SCHEMA = 'cer.catalog.dg004.xp-journal-reference.v0';
export { CATALOG_UNAVAILABLE };

const ID_PART = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/;
// ARCHIVES emits literal instance IDs such as pj:l004-hero-fiction. Never alias them.
// MATH encounter's validId accepts at most 40 chars; limit at the boundary.
const NATIVE_INSTANCE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]*(?::[A-Za-z0-9][A-Za-z0-9._-]*)?$/;
const MATH_ID = /^[A-Za-z0-9][A-Za-z0-9:._-]{0,39}$/;
const DIFFICULTY_LABELS = new Set(['facile','moderee','difficile','heroique']);
const SOURCE_KINDS = new Set(['encounter','quest','accomplishment']);
const ACTOR_ROLES = new Set(['pj','pnj']);
const ASSISTANCE_LEVELS = new Set(['none','secondary','decisive']);
const XP_ID = /^xp:[a-z0-9][a-z0-9._-]{0,50}:[a-z0-9][a-z0-9._-]{0,100}$/;
const CHAIN_ID = /^chain:[a-z0-9][a-z0-9._-]{0,50}:[a-z0-9][a-z0-9._-]{0,100}$/;
const VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const GIT_SHA = /^[0-9a-f]{40}$/i;
const SHA256 = /^[0-9a-f]{64}$/i;
const DOMAINS = new Set(['combat','artisanat','savoir','diplomatie','exploration','magie','secours','transmission']);
const SCOPES = new Set(['ordinaire','majeur','legendaire']);
const PROVENANCE_KINDS = new Set(['native','campaign','illustrative','adapter']);
const XP_STATES = new Set(['proposed','withdrawn']);
const LINK_STATES = new Set(['draft','proposed','archived']);
const LINK_KINDS = ['item','capability','creature','scene'];
const FORBIDDEN_ACTION_KEYS = new Set([
  'approved','approvedByGM','authorized','autoApply','applied','commit','granted','grant',
  'awardedXp','grantedXp','suggestedXp','xpAmount','numericEffect','numericPenalty',
  'magnitude','malus','damageBonus','chargeDebited','manaDebited','levelUp','resolveCombat',
]);

const isRecord = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const has = (o,k) => Object.prototype.hasOwnProperty.call(o,k);
const safeText = (s,max=200) => typeof s === 'string' && s.trim().length > 0 && s.length <= max && !/[\u0000-\u001f\u007f]/.test(s);
const safeIdentifier = s => typeof s === 'string' && ID_PART.test(s);
const safeNativeInstanceId = s => typeof s === 'string' && s.length <= 40 && NATIVE_INSTANCE_ID.test(s) && MATH_ID.test(s);
const safeM01EventId = s => typeof s === 'string' && (safeIdentifier(s) || (s.length<=150 && (()=>{
  try{const a=JSON.parse(s);return Array.isArray(a)&&a.length===3&&a.every(x=>typeof x==='string'&&MATH_ID.test(x))&&JSON.stringify(a)===s;}catch{return false;}
})()));
const finiteInt = (x,min,max) => Number.isSafeInteger(x) && x >= min && x <= max;
/** Stable machine-readable failures, alongside the original French errors[] API. */
const ERROR_CODES = Object.freeze({
  'target.characterInstanceId':'INVALID_NATIVE_INSTANCE_ID',
  'target.campaignId':'INVALID_CAMPAIGN_ID',
  'id':'INVALID_SUGGESTION_ID',
  'idempotencyKey':'IDEMPOTENCY_KEY_MISMATCH',
  'version':'INVALID_VERSION',
  'sourceContext':'INVALID_SOURCE_CONTEXT',
  'event.id':'INVALID_EVENT_ID',
});
function structuredError(errors, fallback='VALIDATION_FAILED') {
  const issues=errors.map(message=>{
    const sep=message.indexOf(': ');
    const path=sep>=0?message.slice(0,sep):'input';
    const detail=sep>=0?message.slice(sep+2):message;
    let code=ERROR_CODES[path]??(path.startsWith('sourceContext')?'INVALID_SOURCE_CONTEXT':fallback);
    if (/clé idempotence dupliquée|source d[’']accomplissement dupliquée/i.test(detail)) code='DUPLICATE_ACCOMPLISHMENT';
    if (/ID.version déjà présents|ID\/version déjà présents/i.test(detail)) code='DUPLICATE_SUGGESTION_VERSION';
    if (/identité.*détournée|réutilisé pour une autre source/i.test(detail)) code='IDENTITY_COLLISION';
    if (/JSON privé invalide/i.test(detail)) code='INVALID_JSON';
    return {code,path,message:detail};
  });
  return {ok:false,errors,code:issues[0]?.code??fallback,issues,executable:false};
}
function xpError(code,path,detail) {
  const message=`${path}: ${detail}`;
  return {ok:false,errors:[message],code,issues:[{code,path,message:detail}],executable:false};
}
const xpStatusError=(status,code,path,detail)=>({...xpError(code,path,detail),status});
const plainResult = (errors, valueKey, value) => errors.length ?
  structuredError(errors) : {ok:true,errors:[],[valueKey]:value,executable:false};
function safeClone(input) {
  try { return {ok:true,value:clonePrivateJson(input)}; }
  catch (e) { return {ok:false,errors:[`JSON privé invalide: ${e.message}`]}; }
}
function invalid(errors,path,reason) { errors.push(`${path}: ${reason}`); }
function forbiddenCommands(node, errors, path='data') {
  if (Array.isArray(node)) { node.forEach((x,i)=>forbiddenCommands(x,errors,`${path}[${i}]`)); return; }
  if (!isRecord(node)) return;
  for (const [key,value] of Object.entries(node)) {
    // Dans l'API active, même false est refusé pour empêcher une confusion
    // entre décision MJ, invitation UI et donnée documentaire.
    if (FORBIDDEN_ACTION_KEYS.has(key)) invalid(errors,`${path}.${key}`,'champ d’autorité ou de calcul interdit');
    if (key === 'effects' && Array.isArray(value) && value.some(x => isRecord(x) && x.mode === 'numeric'))
      invalid(errors,`${path}.effects`,'effet numérique indisponible');
    forbiddenCommands(value,errors,`${path}.${key}`);
  }
}
function rejectExtras(obj,allowed,errors,path) {
  if (!isRecord(obj)) return;
  for (const key of Object.keys(obj)) if (!allowed.includes(key)) invalid(errors,`${path}.${key}`,'champ non reconnu dans le contrat actif ; utiliser un snapshot privé');
}
function validateProvenance(p, errors,path='provenance') {
  if (!isRecord(p)) { invalid(errors,path,'objet requis');return; }
  rejectExtras(p,['originKind','sourceSchema','sourceId','sourceVersion','sourceCommit','sourceHash','creator','sourcePath'],errors,path);
  if (!PROVENANCE_KINDS.has(p.originKind)) invalid(errors,`${path}.originKind`,'origine inconnue');
  if (!safeText(p.sourceSchema,160)) invalid(errors,`${path}.sourceSchema`,'texte requis');
  if (!safeText(p.sourceId,160)) invalid(errors,`${path}.sourceId`,'texte requis');
  if (p.sourceVersion != null && !safeText(p.sourceVersion,120)) invalid(errors,`${path}.sourceVersion`,'version native invalide');
  if (p.sourceCommit != null && (!safeText(p.sourceCommit,40)||!GIT_SHA.test(p.sourceCommit))) invalid(errors,`${path}.sourceCommit`,'SHA git invalide');
  if (p.sourceHash != null && (!safeText(p.sourceHash,64)||!SHA256.test(p.sourceHash))) invalid(errors,`${path}.sourceHash`,'SHA256 invalide');
  if (p.creator != null && !safeText(p.creator,160)) invalid(errors,`${path}.creator`,'auteur invalide');
  if (p.sourcePath != null && !safeText(p.sourcePath,320)) invalid(errors,`${path}.sourcePath`,'chemin invalide');
  if (p.originKind==='native' && !GIT_SHA.test(p.sourceCommit??'')) invalid(errors,`${path}.sourceCommit`,'épinglage obligatoire pour source native');
}
function semverParts(version) {return typeof version==='string' && VERSION.test(version) && version.length<60 ? version.split('.').map(Number):null;}
function nextPatch(version) {const p=semverParts(version);if(!p||p[2]>=Number.MAX_SAFE_INTEGER)throw Error('Version incompatible');return `${p[0]}.${p[1]}.${p[2]+1}`;}
function compareVersions(a,b) {
  const x=semverParts(a),y=semverParts(b);if(!x||!y)return NaN;
  for(let i=0;i<3;i++)if(x[i]!==y[i])return x[i]>y[i]?1:-1;
  return 0;
}
/** Canonical tuple: distinct native IDs/roles cannot collapse across ':' boundaries. */
function mathEncounterEventId(s) {
  return JSON.stringify([s.target.campaignId,s.sourceContext.runId,s.sourceContext.accomplishmentId]);
}
function sourceTuple(target,event,context,sourceContext) {
  return [target.campaignId, target.characterInstanceId,
    sourceContext?.runId??context.oneShot?.runId??'campaign',
    sourceContext?.accomplishmentId??event.id];
}
function idempotency(target,event,context,sourceContext) {
  return `xpkey:v2:${JSON.stringify(sourceTuple(target,event,context,sourceContext))}`;
}
function legacyV1Key(target,event,context) {
  if (!safeIdentifier(target?.characterInstanceId)) return null;
  return `xpkey:${target.campaignId}:${target.characterInstanceId}:${context.oneShot?.runId??'campaign'}:${event.id}`;
}

/** SHA-256 standard, synchronous and portable (Node and browsers), for ID derivation
 * only. The FULL 256-bit digest is retained; registry checks the full source tuple
 * to reject even a theoretical collision, without changing the native ID.
 */
function sha256Identity(text) {
  const K=[
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
  ];
  const bytes=Array.from(new TextEncoder().encode(text));
  const length=BigInt(bytes.length)*8n;
  bytes.push(0x80);
  while(bytes.length%64!==56)bytes.push(0);
  for(let i=7;i>=0;i--)bytes.push(Number((length>>BigInt(8*i))&255n));
  const h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const rotr=(x,n)=>(x>>>n)|(x<<(32-n));
  for(let pos=0;pos<bytes.length;pos+=64){
    const w=new Uint32Array(64);
    for(let i=0;i<16;i++){
      const p=pos+i*4;w[i]=((bytes[p]<<24)|(bytes[p+1]<<16)|(bytes[p+2]<<8)|bytes[p+3])>>>0;
    }
    for(let i=16;i<64;i++){
      const a=w[i-15],b=w[i-2],s0=rotr(a,7)^rotr(a,18)^(a>>>3),s1=rotr(b,17)^rotr(b,19)^(b>>>10);
      w[i]=(w[i-16]+s0+w[i-7]+s1)>>>0;
    }
    let [a,b,c,d,e,f,g,j]=h;
    for(let i=0;i<64;i++){
      const s1=rotr(e,6)^rotr(e,11)^rotr(e,25),choose=(e&f)^(~e&g);
      const t1=(j+s1+choose+K[i]+w[i])>>>0;
      const s0=rotr(a,2)^rotr(a,13)^rotr(a,22),major=(a&b)^(a&c)^(b&c);
      const t2=(s0+major)>>>0;
      j=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;
    }
    for(const [i,v] of [a,b,c,d,e,f,g,j].entries())h[i]=(h[i]+v)>>>0;
  }
  return h.map(n=>n.toString(16).padStart(8,'0')).join('');
}
function derivedXpId(data) {
  const ns=data.namespace??'local';
  if (!/^[a-z0-9][a-z0-9._-]{0,50}$/.test(ns))
    return xpError('INVALID_NAMESPACE','namespace','namespace XP ASCII en minuscules requis');
  const instance=data.target?.characterInstanceId,event=data.event?.id;
  if(!safeIdentifier(event))return xpError('INVALID_EVENT_ID','event.id','identifiant événement valide requis');
  if(!safeNativeInstanceId(instance))return xpError('INVALID_NATIVE_INSTANCE_ID','target.characterInstanceId','ID ARCHIVES typé au format prefix:id, 1 à 40 caractères attendu');
  const run=data.sourceContext?.runId??data.context?.oneShot?.runId??'campaign';
  // Entire canonical tuple includes CAMPAIGN: never collide across campaigns.
  // Full SHA256 is not a reversible alias. The original tuple remains in record.
  const tuple=[data.target.campaignId,instance,run,data.sourceContext?.accomplishmentId??event,event];
  const slug=`sha256-${sha256Identity(JSON.stringify(tuple))}`;
  const id=`xp:${ns}:${slug}`;
  if (!XP_ID.test(id)||id.length>180)
    return xpError('ID_DERIVATION_TOO_LONG','id','identités trop longues pour ID calculé injectif ; fournir id explicite stable, sans alias');
  return {ok:true,id};
}

function validateSourceContext(x, s, errors) {
  const path='sourceContext';
  if (!isRecord(x)) { invalid(errors,path,'objet requis');return; }
  rejectExtras(x,['kind','accomplishmentId','runId','eventStatus','sourceSceneId','participants','selectedPjIds','threats','assistance','difficultyBeforeAssistance','realizedDifficulty','explicitM01Index'],errors,path);
  if(!SOURCE_KINDS.has(x.kind)||!MATH_ID.test(x.accomplishmentId??'')||
      !MATH_ID.test(x.runId??'')||!['proposed','observed','closed'].includes(x.eventStatus))
    invalid(errors,path,'type encounter/quest/accomplishment, ID source, run et statut requis');
  if(x.sourceSceneId!==undefined&&!MATH_ID.test(x.sourceSceneId))invalid(errors,`${path}.sourceSceneId`,'référence scène invalide');
  if(s.context?.oneShot && x.runId!==s.context.oneShot.runId)
    invalid(errors,`${path}.runId`,'session one-shot divergente ; aucun alias permis');
  if(!Array.isArray(x.participants)||x.participants.length<1||x.participants.length>60){invalid(errors,`${path}.participants`,'1 à 60 participants requis');return;}
  const participants=new Map();
  for(const [i,a] of x.participants.entries()){
    if(!isRecord(a)){invalid(errors,`${path}.participants[${i}]`,'participant invalide');continue;}
    rejectExtras(a,['instanceId','role','level','contributionNote'],errors,`${path}.participants[${i}]`);
    if(!safeNativeInstanceId(a.instanceId)||!ACTOR_ROLES.has(a.role)||
      (a.role==='pj'&&/^pnj:/i.test(a.instanceId))||(a.role==='pnj'&&/^pj:/i.test(a.instanceId))||
      !finiteInt(a.level,1,25)||
      (a.contributionNote!==undefined&&!(typeof a.contributionNote==='string'&&a.contributionNote.length<=500)))
      invalid(errors,`${path}.participants[${i}]`,'instance native exacte, rôle PJ/PNJ, niveau 1–25 requis');
    if(participants.has(a.instanceId))invalid(errors,`${path}.participants[${i}]`,'collision de participant');
    participants.set(a.instanceId,a);
  }
  if(!Array.isArray(x.selectedPjIds)||!x.selectedPjIds.length||x.selectedPjIds.length>60||
      new Set(x.selectedPjIds).size!==x.selectedPjIds.length||
      x.selectedPjIds.some(id=>!safeNativeInstanceId(id)||participants.get(id)?.role!=='pj'))
    invalid(errors,`${path}.selectedPjIds`,'PJ réels uniques seulement ; PNJ exclus par défaut');
  if(!x.selectedPjIds?.includes(s.target?.characterInstanceId))
    invalid(errors,`${path}.selectedPjIds`,'la suggestion cible un PJ explicitement sélectionné');
  if(!Array.isArray(x.threats)||x.threats.length>60)invalid(errors,`${path}.threats`,'liste menaces invalide');
  else{
    const used=new Set();
    x.threats.forEach((t,i)=>{
      if(!isRecord(t)){invalid(errors,`${path}.threats[${i}]`,'menace invalide');return;}
      rejectExtras(t,['instanceId','level','count','boss','dangerNote'],errors,`${path}.threats[${i}]`);
      if(!MATH_ID.test(t.instanceId??'')||!finiteInt(t.level,1,25)||!finiteInt(t.count,1,60)||
        typeof t.boss!=='boolean'||(t.dangerNote!==undefined&&!(typeof t.dangerNote==='string'&&t.dangerNote.length<=300)))
        invalid(errors,`${path}.threats[${i}]`,'niveau menace 1–25, quantité, boss et ID requis (≠ indice M01)');
      if(used.has(t.instanceId))invalid(errors,`${path}.threats[${i}]`,'menace instanciée dupliquée');
      used.add(t.instanceId);
    });
  }
  if(!isRecord(x.assistance))invalid(errors,`${path}.assistance`,'aide PNJ descriptive requise');
  else{
    rejectExtras(x.assistance,['level','npcIds','reason'],errors,`${path}.assistance`);
    const aid=x.assistance;
    if(!ASSISTANCE_LEVELS.has(aid.level)||!Array.isArray(aid.npcIds)||
      new Set(aid.npcIds).size!==aid.npcIds.length||
      aid.npcIds.some(id=>!safeNativeInstanceId(id)||participants.get(id)?.role!=='pnj')||
      typeof aid.reason!=='string'||aid.reason.length>500||
      (aid.level==='decisive'&&(!aid.npcIds.length||!aid.reason.trim())))
      invalid(errors,`${path}.assistance`,'aide explicite, attestée narrativement par PNJ participant');
  }
  for(const k of ['difficultyBeforeAssistance','realizedDifficulty'])
    if(x[k]!==undefined&&!DIFFICULTY_LABELS.has(x[k]))
      invalid(errors,`${path}.${k}`,'étiquette de difficulté expérimentale inconnue');
  if(x.explicitM01Index!==undefined&&!finiteInt(x.explicitM01Index,1,12))
    invalid(errors,`${path}.explicitM01Index`,'indice M01 indépendant de niveau de créature (1..12)');
  if(x.explicitM01Index!==undefined&&x.explicitM01Index!==s.event?.difficulty)
    invalid(errors,`${path}.explicitM01Index`,'indice M01 explicite différent de la suggestion ; corriger les deux champs par révision, jamais implicitement');
}
function validateXpFields(s,errors) {
  rejectExtras(s,['schema','id','version','revision','status','target','event','context','provenance','rationale','idempotencyKey','correctionOf','sourceContext'],errors,'suggestion');
  if (s.schema!==XP_SUGGESTION_SCHEMA) invalid(errors,'schema','schéma XP incompatible');
  if (typeof s.id!=='string'||!XP_ID.test(s.id)||s.id.length>180) invalid(errors,'id','identifiant stable xp:namespace:slug attendu');
  if (!semverParts(s.version)) invalid(errors,'version','SemVer stable requis');
  if (!finiteInt(s.revision,1,1000)) invalid(errors,'revision','révision 1..1000 requise');
  if (!XP_STATES.has(s.status)) invalid(errors,'status','statut inconnu');
  if (!isRecord(s.target)) invalid(errors,'target','objet requis');
  else {
    rejectExtras(s.target,['campaignId','characterInstanceId'],errors,'target');
    if (!safeIdentifier(s.target.campaignId)) invalid(errors,'target.campaignId','ID campagne invalide');
    if (!safeNativeInstanceId(s.target.characterInstanceId)) invalid(errors,'target.characterInstanceId','ID natif ARCHIVES invalide (prefix:id unique, longueur 1..40)');
    if (typeof s.target.characterInstanceId==='string' && /^pnj:/i.test(s.target.characterInstanceId))
      invalid(errors,'target.characterInstanceId','PNJ exclus des XP par défaut ; sélection PJ native requise');
  }
  if (!isRecord(s.event)) invalid(errors,'event','objet requis');
  else {
    rejectExtras(s.event,['id','pattern','domain','difficulty','scope'],errors,'event');
    if (!safeIdentifier(s.event.id)||!safeText(s.event.pattern,200)) invalid(errors,'event','identifiant/pattern invalides');
    if (!DOMAINS.has(s.event.domain)||!SCOPES.has(s.event.scope)) invalid(errors,'event','domaine/portée M01 invalides');
    if (!finiteInt(s.event.difficulty,1,12)) invalid(errors,'event.difficulty','indice M01 1..12 requis');
  }
  if (!isRecord(s.context)) invalid(errors,'context','objet requis');
  else {
    rejectExtras(s.context,['initialLevel','oneShot'],errors,'context');
    if (!finiteInt(s.context.initialLevel,1,25)) invalid(errors,'context.initialLevel','niveau initial 1..25 requis (information, pas progression)');
    if (s.context.oneShot!==undefined) {
      if (!isRecord(s.context.oneShot)) invalid(errors,'context.oneShot','objet requis');
      else {
        rejectExtras(s.context.oneShot,['id','runId'],errors,'context.oneShot');
        if (!safeIdentifier(s.context.oneShot.id)||!safeIdentifier(s.context.oneShot.runId)) invalid(errors,'context.oneShot','identifiant du one-shot et de la session requis');
      }
    }
  }
  validateProvenance(s.provenance,errors);
  if(s.sourceContext!==undefined)validateSourceContext(s.sourceContext,s,errors);
  if (!safeText(s.rationale,2000)) invalid(errors,'rationale','justification requise');
  if (!safeText(s.idempotencyKey,270)||!isRecord(s.target)||!isRecord(s.event)||!isRecord(s.context)||
      (s.idempotencyKey!==idempotency(s.target,s.event,s.context,s.sourceContext)&&
       !(s.sourceContext===undefined&&s.idempotencyKey===legacyV1Key(s.target,s.event,s.context))))
    invalid(errors,'idempotencyKey','clé exacte d’identité v2, ou clé historique v1 explicitement conservée, requise');
  if (s.revision===1 && s.correctionOf!==undefined) invalid(errors,'correctionOf','interdit sur première révision');
  if (s.revision>1) {
    const c=s.correctionOf;
    if (!isRecord(c)||c.id!==s.id||!semverParts(c.version)||!finiteInt(c.revision,1,999)||c.revision!==s.revision-1||!safeText(c.reason,500))
      invalid(errors,'correctionOf','lien vers révision précédente et raison requis');
    else rejectExtras(c,['id','version','revision','reason'],errors,'correctionOf');
  }
  forbiddenCommands(s,errors,'suggestion');
}
/**
 * SUGGESTION uniquement : n'encode aucun montant d'XP, ni approbation, ni attribution,
 * ni niveau futur. Les nombres sont seulement le niveau initial et la difficulté M01.
 * @returns {{ok:boolean,errors:string[],suggestion?:object,executable:false}}
 */
export function validateXpSuggestion(input) {
  const c=safeClone(input);if(!c.ok)return structuredError(c.errors,'INVALID_JSON');
  if (!isRecord(c.value))return xpError('INVALID_SUGGESTION','suggestion','objet JSON requis');
  const errors=[];validateXpFields(c.value,errors);
  return plainResult(errors,'suggestion',c.value);
}
export function createXpSuggestion(input) {
  const c=safeClone(input);if(!c.ok)return structuredError(c.errors,'INVALID_JSON');
  if (!isRecord(c.value))return xpError('INVALID_INPUT','input','objet JSON requis');
  const data=c.value;
  // Interdire l'injection de propriétés « externes » au moment de la factory.
  const allowed=['id','namespace','version','target','event','context','provenance','rationale','status','sourceContext'];
  const errors=[];rejectExtras(data,allowed,errors,'input');forbiddenCommands(data,errors,'input');
  if (errors.length) return structuredError(errors,'UNKNOWN_FIELD');
  let id;
  if (data.id!==undefined) id=data.id;
  else { const generated=derivedXpId(data); if(!generated.ok)return generated; id=generated.id; }
  const entry={schema:XP_SUGGESTION_SCHEMA,id,version:data.version??'0.1.0',revision:1,
    status:data.status??'proposed',target:data.target,event:data.event,context:data.context,
    provenance:data.provenance,rationale:data.rationale,
    ...(data.sourceContext===undefined?{}:{sourceContext:data.sourceContext}),
    idempotencyKey:isRecord(data.target)&&isRecord(data.event)&&isRecord(data.context)?
      idempotency(data.target,data.event,data.context,data.sourceContext):null};
  return validateXpSuggestion(entry);
}
/** Correction immuable, jamais application. Identité événement/personnage/run figée. */
export function correctXpSuggestion(previous,changes) {
  const old=validateXpSuggestion(previous);if(!old.ok)return old;
  const raw=safeClone(changes);if(!raw.ok)return structuredError(raw.errors,'INVALID_JSON');
  if (!isRecord(raw.value))return xpError('INVALID_CORRECTION','changes','objet requis');
  const d=raw.value,errors=[];
  rejectExtras(d,['version','rationale','event','context','provenance','status','reason','sourceContext'],errors,'changes');
  forbiddenCommands(d,errors,'changes');
  if (!safeText(d.reason,500))invalid(errors,'changes.reason','motif explicite requis');
  if (old.suggestion.status==='withdrawn') invalid(errors,'status','suggestion retirée non réactivable');
  const cur=old.suggestion;
  if (d.event!==undefined && (!isRecord(d.event)||d.event.id!==cur.event.id))invalid(errors,'event.id','identité de l’événement immuable');
  if (d.context!==undefined && (!isRecord(d.context)||d.context.oneShot?.id!==cur.context.oneShot?.id||d.context.oneShot?.runId!==cur.context.oneShot?.runId))
    invalid(errors,'context.oneShot','identité de session one-shot immuable');
  if(d.sourceContext!==undefined && (!isRecord(d.sourceContext)||d.sourceContext.runId!==cur.sourceContext?.runId||
    d.sourceContext.accomplishmentId!==cur.sourceContext?.accomplishmentId))
    invalid(errors,'sourceContext','accomplissement/run immuables ; nouvelle source exige nouvelle suggestion');
  if (errors.length)return structuredError(errors,'INVALID_CORRECTION');
  let version;
  try{version=d.version??nextPatch(cur.version);}catch(e){return xpError('INVALID_VERSION','version',e.message);}
  if (compareVersions(version,cur.version)!==1)return xpError('INVALID_VERSION','version','la correction doit avancer le SemVer');
  const next={...cur,version,revision:cur.revision+1,
    event:d.event??cur.event,context:d.context??cur.context,provenance:d.provenance??cur.provenance,
    rationale:d.rationale??cur.rationale,status:d.status??cur.status,
    ...((d.sourceContext??cur.sourceContext)===undefined?{}:{sourceContext:d.sourceContext??cur.sourceContext}),
    correctionOf:{id:cur.id,version:cur.version,revision:cur.revision,reason:d.reason}};
  return validateXpSuggestion(next);
}
/** Collisions d'idempotence et chaînage des corrections dans un registre pur. */
export function validateXpRegistry(entries) {
  if(!Array.isArray(entries)||entries.length>1000)return xpError('INVALID_REGISTRY','registry','liste <=1000 requise');
  const seen=new Map(),keys=new Map(),idOwners=new Map(),sourceOwners=new Map(),errors=[];
  entries.forEach((raw,i)=>{
    const r=validateXpSuggestion(raw);
    if(!r.ok){invalid(errors,`registry[${i}]`,r.errors.join(' ; '));return;}
    const s=r.suggestion,key=`${s.id}@${s.version}`;
    if(seen.has(key))invalid(errors,key,'ID/version déjà présents');
    seen.set(key,s);
    const knownIdentity=idOwners.get(s.id);
    if(knownIdentity && knownIdentity!==s.idempotencyKey)invalid(errors,key,'ID réutilisé pour une autre source / identité détournée');
    idOwners.set(s.id,s.idempotencyKey);
    const sourceKey=JSON.stringify(sourceTuple(s.target,s.event,s.context,s.sourceContext));
    const seenSource=sourceOwners.get(sourceKey);
    if(seenSource&&seenSource!==s.id)invalid(errors,key,'source d’accomplissement dupliquée (même PJ, campagne, run et boss/quête)');
    sourceOwners.set(sourceKey,s.id);
    const owner=keys.get(s.idempotencyKey);
    if(owner && owner!==s.id)invalid(errors,key,'clé idempotence dupliquée entre plusieurs suggestions');
    keys.set(s.idempotencyKey,s.id);
  });
  for(const s of seen.values())if(s.revision>1){
    const c=s.correctionOf,prior=seen.get(`${c.id}@${c.version}`);
    if(!prior||prior.revision!==c.revision||prior.idempotencyKey!==s.idempotencyKey||
      compareVersions(s.version,prior.version)!==1 || prior.status==='withdrawn')
      invalid(errors,s.id,'chaîne de correction brisée ou identité détournée');
  }
  return errors.length?structuredError(errors,'INVALID_REGISTRY'):{ok:true,errors:[],executable:false};
}
/**
 * Le candidat est obtenu UNIQUEMENT via une fonction fournie par 10 MATH
 * (qui doit déléguer directement à M01). Ne stocke/attribue jamais le résultat.
 * Le contexte oneShot et le niveau initial ne modifient pas experienceAward.
 */
export function previewXpSuggestion(input,{experienceAward,history}={}) {
  const r=validateXpSuggestion(input);
  if(!r.ok)return {...r,status:'invalid'};
  const s=r.suggestion;
  if(s.status!=='proposed')return xpStatusError('blocked','SUGGESTION_WITHDRAWN','status','suggestion retirée');
  if(s.sourceContext&&s.sourceContext.explicitM01Index===undefined)
    return xpStatusError('unavailable','MATH_INDEX_NOT_ATTESTED','sourceContext.explicitM01Index',
      'indice non explicite ; seul le modèle expérimental previewEncounterXp de MATH peut suggérer la correspondance avec l’étiquette MJ');
  if(s.event.scope!=='ordinaire')return xpStatusError('blocked','MATH_MJ_APPROVAL_REQUIRED','event.scope','validation MJ requise pour accomplissement majeur/légendaire ; aucun approved:true forgeable');
  if(typeof experienceAward!=='function')return xpStatusError('unavailable','M01_PORT_UNAVAILABLE','experienceAward','port M01 experienceAward absent');
  if(!Array.isArray(history))return xpStatusError('invalid','M01_HISTORY_REQUIRED','history','historique M01 requis ; ne jamais simuler l’absence de répétition');
  const cloned=safeClone(history);if(!cloned.ok)return {...structuredError(cloned.errors,'INVALID_JSON'),status:'invalid'};
  if(cloned.value.length>5000||cloned.value.some(e=>!isRecord(e)||!safeM01EventId(e.id)||!safeText(e.pattern,200)))
    return xpStatusError('invalid','INVALID_M01_HISTORY','history','historique M01 invalide');
  try {
    const event={id:s.sourceContext?mathEncounterEventId(s):s.event.id,pattern:s.event.pattern,domain:s.event.domain,
      difficulty:s.event.difficulty,scope:s.event.scope,approved:false};
    const n=experienceAward(clonePrivateJson(event),cloned.value);
    if(!finiteInt(n,0,Number.MAX_SAFE_INTEGER))throw Error('résultat M01 invalide');
    return {ok:true,status:'candidate',candidateXp:n,source:'delegated-M01-not-attested',
      sourceEventId:event.id,
      awardCommitted:false,levelValidated:false,executable:false,notice:READONLY_NOTICE};
  }catch(e){return xpStatusError('invalid','M01_PORT_REJECTED','experienceAward',`port M01: ${e.message}`);}
}
/** Transcription pure des sorties du port M01: aucune formule XP recopiée. */
export function previewLevelMatrix({progressionAtLevel,levels=LEVEL_REFERENCE}={}) {
  if(typeof progressionAtLevel!=='function')return {ok:false,status:'unavailable',errors:['port M01 progressionAtLevel absent'],executable:false};
  if(!Array.isArray(levels)||levels.length!==6||levels.some((x,i)=>x!==LEVEL_REFERENCE[i]))
    return {ok:false,status:'invalid',errors:['niveaux de référence exigés : 1/5/10/15/20/25'],executable:false};
  try {
    const rows=levels.map(level=>{
      const x=clonePrivateJson(progressionAtLevel(level));
      if(!isRecord(x)||x.level!==level||!finiteInt(x.experience,0,Number.MAX_SAFE_INTEGER)||
        !finiteInt(x.development,0,Number.MAX_SAFE_INTEGER))throw Error(`port M01 invalide au niveau ${level}`);
      return x;
    });
    return {ok:true,status:'read-only',rows,source:'delegated-M01-not-attested',
      awardCommitted:false,levelValidated:false,executable:false};
  }catch(e){return {ok:false,status:'invalid',errors:[e.message],executable:false};}
}
function validateSourceRef(x,kind,errors,path) {
  if(!isRecord(x)){invalid(errors,path,'référence requise');return;}
  rejectExtras(x,['id','version','schema','status','provenance','ruleset','profileId','documentCode'],errors,path);
  if(!safeText(x.id,160)||!safeText(x.version,100)||!safeText(x.schema,160)||!safeText(x.status,100))
    invalid(errors,path,'source ID/version/schema/statut requis');
  validateProvenance(x.provenance,errors,`${path}.provenance`);
  if(kind==='capability'&&(x.schema!==CATALOG_SCHEMA||typeof x.id!=='string'||!/^cap:[a-z0-9._-]+:[a-z0-9._-]+$/.test(x.id)))
    invalid(errors,path,'capacité descriptive doit référencer INDEX v0.2');
  if(kind==='creature'){
    if(!safeText(x.profileId,120)||!safeText(x.ruleset,100)) invalid(errors,path,'profil/ruleset de créature requis');
  }
  if(x.documentCode!=null&&!safeText(x.documentCode,140))invalid(errors,`${path}.documentCode`,'code documentaire invalide');
  for(const key of ['ruleset','profileId'])if(x[key]!=null&&!safeText(x[key],120))invalid(errors,`${path}.${key}`,'identité profil invalide');
}
function validateChain(x,errors) {
  rejectExtras(x,['schema','id','version','status','campaignId','provenance','links','relations'],errors,'chain');
  if(x.schema!==DESCRIPTIVE_CHAIN_SCHEMA)invalid(errors,'schema','contrat chaîne inconnu');
  if(typeof x.id!=='string'||!CHAIN_ID.test(x.id)||x.id.length>180)invalid(errors,'id','ID chaîne stable requis');
  if(!semverParts(x.version))invalid(errors,'version','SemVer stable attendu');
  if(!LINK_STATES.has(x.status))invalid(errors,'status','statut chaîne invalide');
  if(!safeIdentifier(x.campaignId))invalid(errors,'campaignId','campagne requise');
  validateProvenance(x.provenance,errors);
  if(!Array.isArray(x.links)||x.links.length!==4){invalid(errors,'links','exactement quatre références item/capability/creature/scene requises');return;}
  const uniqueKinds=new Set(),instances=new Set();
  x.links.forEach((l,i)=>{
    const path=`links[${i}]`;
    if(!isRecord(l)){invalid(errors,path,'objet requis');return;}
    rejectExtras(l,['kind','source','instance','status'],errors,path);
    if(l.kind!==LINK_KINDS[i])invalid(errors,`${path}.kind`,`ordre item/capability/creature/scene attendu`);
    if(uniqueKinds.has(l.kind))invalid(errors,`${path}.kind`,'type déjà utilisé');uniqueKinds.add(l.kind);
    if(!LINK_STATES.has(l.status))invalid(errors,`${path}.status`,'statut non habilitant requis');
    validateSourceRef(l.source,l.kind,errors,`${path}.source`);
    if(l.kind!=='capability' && !isRecord(l.instance))invalid(errors,`${path}.instance`,'identité de copie locale requise');
    if(l.instance!==undefined){
      if(!isRecord(l.instance)){invalid(errors,`${path}.instance`,'objet requis');return;}
      rejectExtras(l.instance,['id','campaignId'],errors,`${path}.instance`);
      if(!safeIdentifier(l.instance.id)||l.instance.campaignId!==x.campaignId)
        invalid(errors,`${path}.instance`,'instance réelle dans la même campagne requise');
      if(l.source?.id===l.instance.id)invalid(errors,`${path}.instance.id`,'ne pas confondre identité source et instance');
      const key=`${l.instance.campaignId}/${l.instance.id}`;
      if(instances.has(key))invalid(errors,`${path}.instance`,'collision d’instance');instances.add(key);
    }
  });
  const expected=['described-by','referenced-by','staged-in'];
  if(!Array.isArray(x.relations)||x.relations.length!==3||x.relations.some((r,i)=>!isRecord(r)||r.from!==LINK_KINDS[i]||r.to!==LINK_KINDS[i+1]||r.type!==expected[i]||Object.keys(r).some(k=>!['from','to','type'].includes(k))))
    invalid(errors,'relations','relations descriptives strictes, aucun ajout mécanique autorisé');
  forbiddenCommands(x,errors,'chain');
}
export function validateDescriptiveChain(input) {
  const c=safeClone(input);if(!c.ok)return {ok:false,errors:c.errors,executable:false};
  if(!isRecord(c.value))return {ok:false,errors:['chain: objet JSON requis'],executable:false};
  const errors=[];validateChain(c.value,errors);
  return plainResult(errors,'chain',c.value);
}
/** Factory non destructive, aucun effet. */
export function createDescriptiveChain(input) {
  const c=safeClone(input);if(!c.ok)return {ok:false,errors:c.errors,executable:false};
  if(!isRecord(c.value))return {ok:false,errors:['input: objet requis'],executable:false};
  const errors=[];
  rejectExtras(c.value,['id','version','campaignId','provenance','links','relations'],errors,'input');
  forbiddenCommands(c.value,errors,'input');
  if(errors.length)return {ok:false,errors,executable:false};
  const base={schema:DESCRIPTIVE_CHAIN_SCHEMA,id:c.value.id,version:c.value.version??'0.1.0',
    status:'proposed',campaignId:c.value.campaignId,provenance:c.value.provenance,links:c.value.links,
    relations:c.value.relations??[
      {from:'item',to:'capability',type:'described-by'},
      {from:'capability',to:'creature',type:'referenced-by'},
      {from:'creature',to:'scene',type:'staged-in'},
    ]};
  return validateDescriptiveChain(base);
}
/**
 * Ne produit PAS un DTO joueur : la sortie est privée et destinée à ARCHIVES.
 * nativeSources peut contenir des versions/statuts/champs inconnus ; opaque.
 */
export function createPrivateChainSnapshot(chain,nativeSources) {
  const v=validateDescriptiveChain(chain);if(!v.ok)return v;
  const s=safeClone(nativeSources);if(!s.ok)return {ok:false,errors:s.errors,executable:false};
  if(!isRecord(s.value)||LINK_KINDS.some(k=>!has(s.value,k)))
    return {ok:false,errors:['nativeSources: item/capability/creature/scene requis'],executable:false};
  return {ok:true,errors:[],snapshot:{schema:PRIVATE_CHAIN_SNAPSHOT_SCHEMA,
    visibility:'mj-private-only',chain:v.chain,originalSources:s.value,executable:false},executable:false};
}
export function validatePrivateChainSnapshot(input) {
  const c=safeClone(input);if(!c.ok)return {ok:false,errors:c.errors,executable:false};
  if(!isRecord(c.value)||c.value.schema!==PRIVATE_CHAIN_SNAPSHOT_SCHEMA||c.value.visibility!=='mj-private-only'||c.value.executable!==false)
    return {ok:false,errors:['snapshot: enveloppe MJ privée incompatible'],executable:false};
  const v=validateDescriptiveChain(c.value.chain);
  if(!v.ok)return v;
  if(!isRecord(c.value.originalSources)||LINK_KINDS.some(k=>!has(c.value.originalSources,k)))
    return {ok:false,errors:['snapshot: sources originales absentes'],executable:false};
  return {ok:true,errors:[],snapshot:c.value,executable:false};
}
/** Aperçu MJ seulement : jamais de champs sources inconnus ni notes privées. */
export function previewDescriptiveChain(input) {
  const r=validateDescriptiveChain(input);if(!r.ok)return {ok:false,errors:r.errors,executable:false};
  const x=r.chain;
  return {ok:true,errors:[],preview:{kind:'mj-private-preview',id:x.id,version:x.version,
    campaignId:x.campaignId,status:x.status,
    references:x.links.map(l=>({kind:l.kind,sourceId:l.source.id,sourceVersion:l.source.version,
      instanceId:l.instance?.id??null,profileId:l.kind==='creature'?l.source.profileId:null})),
    requiresGMReview:true,executable:false,notice:READONLY_NOTICE},executable:false};
}
/** Une définition L003 autorisée à figurer dans le graphe doit rester descriptive. */
export function validateDescriptiveCatalogReference(nativeEntry) {
  const v=validateCatalogEntry(nativeEntry);
  if(!v.ok)return {ok:false,errors:v.errors,executable:false};
  if(!['item-effect','aptitude','technique','signature','creature-ability','narrative'].includes(v.entry.entryType))
    return {ok:false,errors:['entrée attendue : objet ou capacité descriptive'],executable:false};
  if(v.entry.effects?.some(e=>e.mode!=='descriptive'))return {ok:false,errors:['effet numérique non homologué'],executable:false};
  return {ok:true,errors:[],reference:{id:v.entry.id,version:v.entry.version,schema:v.entry.schema,
    status:v.entry.definitionState,provenance:v.entry.provenance,executable:false},executable:false};
}


/** Link to a MATH receipt already produced by recordEncounterXpChoice.
 * Untrusted metadata: not an independent proof of MJ permission or an award.
 * The authoritative journal remains MATH's nextLedgers; INDEX never constructs it.
 */
export function createXpMathJournalReference(suggestion, receipt) {
  const r=validateXpSuggestion(suggestion);
  if(!r.ok)return r;
  const v=safeClone(receipt);
  if(!v.ok)return structuredError(v.errors,'INVALID_JSON');
  const x=v.value,s=r.suggestion;
  if(!isRecord(x)||!['recorded','duplicate'].includes(x.status)||
    !safeText(x.decisionId,150)||x.pjId!==s.target.characterInstanceId||
    Object.keys(x).some(k=>!['status','pjId','decisionId'].includes(k)))
    return xpError('INVALID_MATH_RECEIPT','receipt','reçu MATH préexistant, PJ exact et decisionId requis');
  return {ok:true,errors:[],reference:{schema:XP_JOURNAL_REFERENCE_SCHEMA,
    sourceSchema:MATH_XP_LEDGER_SCHEMA,sourceEvent:s.sourceContext?{
      campaignId:s.target.campaignId,runId:s.sourceContext.runId,
      accomplishmentId:s.sourceContext.accomplishmentId,kind:s.sourceContext.kind}:null,
    suggestion:{id:s.id,version:s.version,revision:s.revision},
    participantId:s.target.characterInstanceId,receiptId:x.decisionId,
    ...(s.sourceContext?{mathEventId:mathEncounterEventId(s)}:{}),
    reportedStatus:x.status,authority:'unverified-external-math-journal',
    appliedToSheet:false,executable:false},executable:false};
}


/** Non-executable field mapping to MATH #99 (previewEncounterXp).
 * It deliberately OMITS eventApprovedByMJ and ledgersByPj: neither authority
 * nor private XP ledgers can be inferred from an INDEX suggestion.
 */
export function previewMathEncounterFragment(suggestion) {
  const r=validateXpSuggestion(suggestion);
  if(!r.ok)return r;
  const s=r.suggestion,c=s.sourceContext;
  if(!c)return xpError('MATH_SOURCE_REQUIRED','sourceContext',
    'un accomplissement encounter/quest/accomplishment explicite est nécessaire');
  const fragment={campaignId:s.target.campaignId,runId:c.runId,
    accomplishmentId:c.accomplishmentId,kind:c.kind,
    eventPattern:s.event.pattern,eventDomain:s.event.domain,scope:s.event.scope,
    ...(c.difficultyBeforeAssistance===undefined?{}:{difficultyBeforeAssistance:c.difficultyBeforeAssistance}),
    ...(c.realizedDifficulty===undefined?{}:{realizedDifficulty:c.realizedDifficulty}),
    ...(c.explicitM01Index===undefined?{}:{explicitM01Index:c.explicitM01Index}),
    actors:clonePrivateJson(c.participants),selectedPjIds:clonePrivateJson(c.selectedPjIds),
    threats:clonePrivateJson(c.threats),assistance:clonePrivateJson(c.assistance)};
  const requiredExternal=['eventApprovedByMJ','ledgersByPj'];
  if(!c.difficultyBeforeAssistance)requiredExternal.push('difficultyBeforeAssistance');
  return {ok:true,errors:[],schema:MATH_ENCOUNTER_SCHEMA,
    sourceEventId:mathEncounterEventId(s),
    mathInputFragment:fragment,missingExternalFields:requiredExternal,
    authority:'mj-and-math-external-only',executable:false,appliedToSheet:false};
}
