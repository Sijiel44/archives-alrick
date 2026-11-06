/** L004-REPAIR — read-only reconciliation across separately persisted STUDIO/CREATORS stores.
 * Never commits a creator link, changes STUDIO, opens player origin or exposes notes.
 * A failed creator-state write can happen AFTER a Studio copy/scene has succeeded.
 */
export const RECONCILIATION_SCHEMA='cer.dg004.studio.reconciliation.v0';
export const DEMO_CREATURE_SOURCE='fixture-source-001';
export const DEMO_CREATURE_PROFILE='fixture-profile-001';
export const DEMO_SCENE_TITLE='La Lanterne des Deux Rives';
export const DEMO_SCENE_DESCRIPTION='Une lueur discrète éclaire la rive. Une créature écoute au loin.';
export const DEMO_PRIVATE_NOTE='SENTINELLE_MJ_L004_FICTIVE — identité cachée et résolution secrète.';

const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const truthyString=x=>typeof x==='string'&&x.length>0;
const readCollection=(c,key)=>{
  if(!obj(c)||!Array.isArray(c[key]))throw Error(`Campagne STUDIO invalide (${key})`);
  return c[key];
};
const idStatus=(hits,storedHits)=>{
  if(hits.length>1||storedHits.length>1)return {status:'ambiguous',id:null,persisted:false};
  if(hits.length===0)return storedHits.length?{status:'stale',id:null,persisted:false}:{status:'missing',id:null,persisted:false};
  const id=hits[0].id;
  if(!truthyString(id))return {status:'ambiguous',id:null,persisted:false};
  const persisted=storedHits.length===1&&storedHits[0].id===id;
  if(storedHits.length===1&&!persisted)return {status:'conflict',id:null,persisted:false};
  return {status:persisted?'reusable':'unpersisted',id,persisted};
};
const matchDemoCreature=(actor,sourceId,profileId)=>obj(actor)&&
  actor.privateSnapshot?.sourceId===sourceId && actor.source?.profileId===profileId &&
  actor.privateSnapshot?.profileId===profileId && actor.source?.ruleset==='m03';
const matchDemoScene=(scene,title,description,note)=>obj(scene)&&scene.title===title&&
  scene.publicDescription===description&&scene.privateNotes===note;
/** Returns identifiers and statuses only; no private snapshots/notes are copied out. */
export function inspectDemoFootprints(campaign,{persistedCampaign=null,sourceId=DEMO_CREATURE_SOURCE,
  profileId=DEMO_CREATURE_PROFILE,sceneTitle=DEMO_SCENE_TITLE,
  sceneDescription=DEMO_SCENE_DESCRIPTION,privateNote=DEMO_PRIVATE_NOTE}={}){
  const creatures=readCollection(campaign,'creatures'),scenes=readCollection(campaign,'scenes');
  if(persistedCampaign!==null){readCollection(persistedCampaign,'creatures');readCollection(persistedCampaign,'scenes');}
  const sourceMatches=creatures.filter(x=>matchDemoCreature(x,sourceId,profileId));
  const sourceOthers=creatures.filter(x=>x?.source?.profileId===profileId&&!sourceMatches.includes(x));
  const storedSource=(persistedCampaign?.creatures??[]).filter(x=>matchDemoCreature(x,sourceId,profileId));
  const creature=sourceOthers.length?{status:'conflict',id:null,persisted:false}:idStatus(sourceMatches,storedSource);
  const titleMatches=scenes.filter(x=>x?.title===sceneTitle);
  const matching=titleMatches.filter(x=>matchDemoScene(x,sceneTitle,sceneDescription,privateNote));
  const stored=(persistedCampaign?.scenes??[]).filter(x=>matchDemoScene(x,sceneTitle,sceneDescription,privateNote));
  let scene=titleMatches.length!==matching.length?{status:'conflict',id:null,persisted:false}:idStatus(matching,stored);
  if(scene.id&&creature.id){
    const instance=matching.find(x=>x.id===scene.id);
    const participants=instance?.participantIds;
    if(!Array.isArray(participants)||!participants.includes(creature.id))
      scene={status:'needs-participants',id:scene.id,persisted:scene.persisted};
  }
  return {schema:RECONCILIATION_SCHEMA,creature,scene};
}

/** Independent creator L004-C can inspect a split commit BEFORE retrying an external Studio copy.
 * The answer is intentionally not an auto-link: 21 must confirm/persist its own cycle state.
 * Without a unique candidate and persisted match, refuse automatic retry/link.
 */
export function inspectCreatorAttachment({campaign,persistedCampaign=null,cycle}={}){
  const current=readCollection(campaign,'creatures'),scenes=readCollection(campaign,'scenes');
  if(!obj(cycle)||!obj(cycle.drafts)||!obj(cycle.links))throw Error('État créateur L004-C absent');
  const ref=cycle.drafts.creature?.sourceReference;
  const draft=cycle.drafts.scene;
  if(!truthyString(ref)||!obj(draft)||!truthyString(draft.title)||typeof draft.privateNotes!=='string')
    throw Error('Référence créature ou brouillon scène incomplet');
  if(persistedCampaign!==null){readCollection(persistedCampaign,'creatures');readCollection(persistedCampaign,'scenes');}
  // A documented sourceRef can sit in the private instance snapshot (sourceId), or in source.documentId.
  const creatureMatches=xs=>xs.filter(c=>c?.privateSnapshot?.sourceId===ref || c?.source?.documentId===ref);
  const hits=creatureMatches(current),persisted=creatureMatches(persistedCampaign?.creatures??[]);
  let creature=idStatus(hits,persisted);
  if(truthyString(cycle.links.creatureInstanceId)){
    if(hits.some(x=>x.id===cycle.links.creatureInstanceId))creature=idStatus(hits.filter(x=>x.id===cycle.links.creatureInstanceId),persisted.filter(x=>x.id===cycle.links.creatureInstanceId));
    else creature={status:'conflict',id:null,persisted:false};
  }
  const sceneHits=xs=>xs.filter(s=>s?.title===draft.title&&
    s?.publicDescription===(draft.publicDescription??'')&&s?.privateNotes===draft.privateNotes);
  const conflicts=scenes.some(s=>s?.title===draft.title&&!sceneHits([s]).length);
  const sceneAll=sceneHits(scenes),sceneStored=sceneHits(persistedCampaign?.scenes??[]);
  let scene=conflicts?{status:'conflict',id:null,persisted:false}:idStatus(sceneAll,sceneStored);
  if(truthyString(cycle.links.sceneId)){
    if(sceneAll.some(x=>x.id===cycle.links.sceneId))scene=idStatus(sceneAll.filter(x=>x.id===cycle.links.sceneId),sceneStored.filter(x=>x.id===cycle.links.sceneId));
    else scene={status:'conflict',id:null,persisted:false};
  }
  if(scene.id&&creature.id){
    const actorIds=sceneAll.find(s=>s.id===scene.id)?.participantIds;
    if(!Array.isArray(actorIds)||!actorIds.includes(creature.id))scene={status:'needs-participants',id:scene.id,persisted:scene.persisted};
  }
  return {schema:RECONCILIATION_SCHEMA,creature,scene,
    action:creature.status==='reusable'&&scene.status==='reusable'?'link-existing-after-MJ-confirmation':'block-automatic-retry'};
}

const identity=r=>[r.kind,r.name,r.version,r.provenance].join('\u0000');
/** Verify L003 persistent creatorDrafts[].original instead of volatile UI state.
 * Duplicate identities with different content are conflicts, never blindly appended.
 */
export function inspectCreatorRecord(campaign,record){
  if(!obj(record)||!['item','capacity','spell'].includes(record.kind)||
    !['name','version','provenance'].every(k=>truthyString(record[k])))throw Error('Fiche créateur descriptive invalide');
  const entries=campaign?.extensions?.creatorDrafts??[];
  if(!Array.isArray(entries))throw Error('Registre privé créateurs invalide');
  const matches=entries.filter(x=>obj(x?.original)&&identity(x.original)===identity(record));
  if(matches.length>1)return {status:'conflict'};
  if(matches.length===0)return {status:'missing'};
  return {status:same(matches[0].original,record)?'present':'conflict'};
}
export function persistentCreatorRecords(campaign){
  const entries=campaign?.extensions?.creatorDrafts??[];
  if(!Array.isArray(entries))throw Error('Registre privé créateurs invalide');
  const out=[];
  for(const value of entries){
    const r=value?.original;
    if(!obj(r)||!['item','capacity','spell'].includes(r.kind))continue;
    if(inspectCreatorRecord(campaign,r).status!=='present')throw Error('Réconciliation créateurs ambiguë');
    out.push(structuredClone(r));
  }
  return out;
}

/** Lost acknowledgement is not permission to retry a catalog insert.
 * Re-read the real private ARCHIVES-backed adapter before and after creatorSave.
 * Never directly writes a creator draft or compensates by deleting STUDIO instances.
 */
export async function saveCreatorWithReconciliation({record,storage,creatorSave,studioSnapshot}){
  if(typeof storage?.load!=='function'||typeof creatorSave!=='function')throw Error('Ports ARCHIVES/créateur manquants');
  const before=inspectCreatorRecord(await storage.load(),record);
  if(before.status==='present')return {saved:true,reconciled:true,attempted:false};
  if(before.status==='conflict')throw Error('Conflit de fiche descriptive : arbitrage MJ requis');
  let failure=null;
  try{
    const result=await creatorSave(record,studioSnapshot,storage);
    if(result?.saved!==true)throw Error('Enregistrement créateur non confirmé');
  }catch(error){failure=error;}
  let after;
  try{after=inspectCreatorRecord(await storage.load(),record);}
  catch(error){throw Error(`État après création impossible à vérifier : ${error?.message??'lecture échouée'}`);}
  if(after.status==='present')return {saved:true,reconciled:failure!==null,attempted:true};
  if(after.status==='conflict')throw Error('Conflit persistant après tentative créateur : vérification MJ requise');
  if(failure)throw failure;
  throw Error('Enregistrement créateur non retrouvé dans ARCHIVES : ne pas rejouer la copie STUDIO');
}
