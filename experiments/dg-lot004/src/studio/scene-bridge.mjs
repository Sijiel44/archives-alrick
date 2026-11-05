/** L004-C: PRIVATE descriptive preview contract only. No mechanics, publication or mutations. */
export const SCENE_BRIDGE_SCHEMA='cer.dg004.scene-link.proposal.v0';
function check(x,name){if(!x||typeof x!=='object'||Array.isArray(x))throw Error(`${name} manquant`);}
function nameOf(x,field,max){if(typeof x[field]!=='string'||!x[field].trim()||x[field].length>max)throw Error(`Champ ${field} invalide`);return x[field].trim();}
function descriptor(record,kind){
  check(record,kind);
  if(record.kind!==kind)throw Error(`Type ${kind} requis`);
  if(['numericEffect','effects','apply','cost','manaCost','charges'].some(k=>Object.hasOwn(record,k)))
    throw Error('Effet numérique non homologué — fiche refusée');
  return {kind,name:nameOf(record,'name',120),version:nameOf(record,'version',32),
    provenance:nameOf(record,'provenance',200),limitations:nameOf(record,'limitations',500)};
}
/** Strict new object. Never reads private snapshots or transmits player data. */
export function previewDescriptiveSceneLink({objectDraft,capabilityDraft,creature,scene}){
  const object=descriptor(objectDraft,'item'),capacity=descriptor(capabilityDraft,'capacity');
  check(creature,'Créature');check(scene,'Scène');
  const instanceId=nameOf(creature,'id',128),sceneId=nameOf(scene,'id',128);
  const creatureName=nameOf(creature,'publicLabel',120),sceneTitle=nameOf(scene,'title',160);
  return {schema:SCENE_BRIDGE_SCHEMA,visibility:'mj-private',status:'preview-only',
    object,capability:capacity,creature:{instanceId,name:creatureName},scene:{id:sceneId,title:sceneTitle},
    rule:'Indisponible — règle/validateur non homologué'};
}
