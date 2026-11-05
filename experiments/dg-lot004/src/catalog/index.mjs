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
export { CATALOG_UNAVAILABLE };

const ID_PART = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/;
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
const finiteInt = (x,min,max) => Number.isSafeInteger(x) && x >= min && x <= max;
const plainResult = (errors, valueKey, value) => errors.length ?
  {ok:false,errors,executable:false} : {ok:true,errors:[],[valueKey]:value,executable:false};
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
function idempotency(target,event,context) {
  return `xpkey:${target.campaignId}:${target.characterInstanceId}:${context.oneShot?.runId??'campaign'}:${event.id}`;
}
function validateXpFields(s,errors) {
  rejectExtras(s,['schema','id','version','revision','status','target','event','context','provenance','rationale','idempotencyKey','correctionOf'],errors,'suggestion');
  if (s.schema!==XP_SUGGESTION_SCHEMA) invalid(errors,'schema','schéma XP incompatible');
  if (typeof s.id!=='string'||!XP_ID.test(s.id)||s.id.length>180) invalid(errors,'id','identifiant stable xp:namespace:slug attendu');
  if (!semverParts(s.version)) invalid(errors,'version','SemVer stable requis');
  if (!finiteInt(s.revision,1,1000)) invalid(errors,'revision','révision 1..1000 requise');
  if (!XP_STATES.has(s.status)) invalid(errors,'status','statut inconnu');
  if (!isRecord(s.target)) invalid(errors,'target','objet requis');
  else {
    rejectExtras(s.target,['campaignId','characterInstanceId'],errors,'target');
    if (!safeIdentifier(s.target.campaignId)||!safeIdentifier(s.target.characterInstanceId)) invalid(errors,'target','identités campagne/PJ invalides');
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
  if (!safeText(s.rationale,2000)) invalid(errors,'rationale','justification requise');
  if (!safeText(s.idempotencyKey,270)||!isRecord(s.target)||!isRecord(s.event)||!isRecord(s.context)||
      s.idempotencyKey!==idempotency(s.target,s.event,s.context))
    invalid(errors,'idempotencyKey','clé dérivée des identités réelles, immuable');
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
  const c=safeClone(input);if(!c.ok)return {ok:false,errors:c.errors,executable:false};
  if (!isRecord(c.value))return {ok:false,errors:['suggestion: objet JSON requis'],executable:false};
  const errors=[];validateXpFields(c.value,errors);
  return plainResult(errors,'suggestion',c.value);
}
export function createXpSuggestion(input) {
  const c=safeClone(input);if(!c.ok)return {ok:false,errors:c.errors,executable:false};
  if (!isRecord(c.value))return {ok:false,errors:['input: objet requis'],executable:false};
  const data=c.value;
  // Interdire l'injection de propriétés « externes » au moment de la factory.
  const allowed=['id','namespace','version','target','event','context','provenance','rationale','status'];
  const errors=[];rejectExtras(data,allowed,errors,'input');forbiddenCommands(data,errors,'input');
  if (errors.length) return {ok:false,errors,executable:false};
  let id;
  if (data.id!==undefined) id=data.id;
  else if(safeIdentifier(data.event?.id)&&safeIdentifier(data.target?.characterInstanceId)) {
    const namespace=data.namespace??'local';
    id=`xp:${namespace}:${data.event.id.toLowerCase()}-${data.target.characterInstanceId.toLowerCase()}${data.context?.oneShot?.runId?'-'+data.context.oneShot.runId.toLowerCase():''}`;
  }
  const entry={schema:XP_SUGGESTION_SCHEMA,id,version:data.version??'0.1.0',revision:1,
    status:data.status??'proposed',target:data.target,event:data.event,context:data.context,
    provenance:data.provenance,rationale:data.rationale,
    idempotencyKey:isRecord(data.target)&&isRecord(data.event)&&isRecord(data.context)?
      idempotency(data.target,data.event,data.context):null};
  return validateXpSuggestion(entry);
}
/** Correction immuable, jamais application. Identité événement/personnage/run figée. */
export function correctXpSuggestion(previous,changes) {
  const old=validateXpSuggestion(previous);if(!old.ok)return old;
  const raw=safeClone(changes);if(!raw.ok)return {ok:false,errors:raw.errors,executable:false};
  if (!isRecord(raw.value))return {ok:false,errors:['changes: objet requis'],executable:false};
  const d=raw.value,errors=[];
  rejectExtras(d,['version','rationale','event','context','provenance','status','reason'],errors,'changes');
  forbiddenCommands(d,errors,'changes');
  if (!safeText(d.reason,500))invalid(errors,'changes.reason','motif explicite requis');
  if (old.suggestion.status==='withdrawn') invalid(errors,'status','suggestion retirée non réactivable');
  const cur=old.suggestion;
  if (d.event!==undefined && (!isRecord(d.event)||d.event.id!==cur.event.id))invalid(errors,'event.id','identité de l’événement immuable');
  if (d.context!==undefined && (!isRecord(d.context)||d.context.oneShot?.id!==cur.context.oneShot?.id||d.context.oneShot?.runId!==cur.context.oneShot?.runId))
    invalid(errors,'context.oneShot','identité de session one-shot immuable');
  if (errors.length)return {ok:false,errors,executable:false};
  let version;
  try{version=d.version??nextPatch(cur.version);}catch(e){return {ok:false,errors:[e.message],executable:false};}
  if (compareVersions(version,cur.version)!==1)return {ok:false,errors:['version: la correction doit avancer le SemVer'],executable:false};
  const next={...cur,version,revision:cur.revision+1,
    event:d.event??cur.event,context:d.context??cur.context,provenance:d.provenance??cur.provenance,
    rationale:d.rationale??cur.rationale,status:d.status??cur.status,
    correctionOf:{id:cur.id,version:cur.version,revision:cur.revision,reason:d.reason}};
  return validateXpSuggestion(next);
}
/** Collisions d'idempotence et chaînage des corrections dans un registre pur. */
export function validateXpRegistry(entries) {
  if(!Array.isArray(entries)||entries.length>1000)return {ok:false,errors:['registry: liste <=1000 requise']};
  const seen=new Map(),keys=new Map(),errors=[];
  entries.forEach((raw,i)=>{
    const r=validateXpSuggestion(raw);
    if(!r.ok){invalid(errors,`registry[${i}]`,r.errors.join(' ; '));return;}
    const s=r.suggestion,key=`${s.id}@${s.version}`;
    if(seen.has(key))invalid(errors,key,'ID/version déjà présents');
    seen.set(key,s);
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
  return {ok:errors.length===0,errors};
}
/**
 * Le candidat est obtenu UNIQUEMENT via une fonction fournie par 10 MATH
 * (qui doit déléguer directement à M01). Ne stocke/attribue jamais le résultat.
 * Le contexte oneShot et le niveau initial ne modifient pas experienceAward.
 */
export function previewXpSuggestion(input,{experienceAward,history}={}) {
  const r=validateXpSuggestion(input);
  if(!r.ok)return {ok:false,status:'invalid',errors:r.errors,executable:false};
  const s=r.suggestion;
  if(s.status!=='proposed')return {ok:false,status:'blocked',errors:['suggestion retirée'],executable:false};
  if(s.event.scope!=='ordinaire')return {ok:false,status:'blocked',errors:['validation MJ requise pour accomplissement majeur/légendaire ; aucun approved:true forgeable'],executable:false};
  if(typeof experienceAward!=='function')return {ok:false,status:'unavailable',errors:['port M01 experienceAward absent'],executable:false};
  if(!Array.isArray(history))return {ok:false,status:'invalid',errors:['historique M01 requis ; ne jamais simuler l’absence de répétition'],executable:false};
  const cloned=safeClone(history);if(!cloned.ok)return {ok:false,status:'invalid',errors:cloned.errors,executable:false};
  if(cloned.value.length>5000||cloned.value.some(e=>!isRecord(e)||!safeIdentifier(e.id)||!safeText(e.pattern,200)))
    return {ok:false,status:'invalid',errors:['historique M01 invalide'],executable:false};
  try {
    const event={id:s.event.id,pattern:s.event.pattern,domain:s.event.domain,
      difficulty:s.event.difficulty,scope:s.event.scope,approved:false};
    const n=experienceAward(clonePrivateJson(event),cloned.value);
    if(!finiteInt(n,0,Number.MAX_SAFE_INTEGER))throw Error('résultat M01 invalide');
    return {ok:true,status:'candidate',candidateXp:n,source:'delegated-M01-not-attested',
      awardCommitted:false,levelValidated:false,executable:false,notice:READONLY_NOTICE};
  }catch(e){return {ok:false,status:'invalid',errors:[`port M01: ${e.message}`],executable:false};}
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
