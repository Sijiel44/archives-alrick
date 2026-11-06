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

/** Strict bridge for ATELIERS #100 pendingStudioOp. Read-only; no side effects or public DTO.
 * An old snapshot without a durable journal cannot attest which copy belongs to this cycle.
 *
 * The caller MUST load persistedCycle from 04's private persistence independently of
 * the in-memory controller, and persistedCampaign from the validated ARCHIVES-backed
 * STUDIO storage. Supplying only one side is not sufficient to link an instance.
 *
 * The creator's pendingStudioOp records the *pre-action* IDs and the campaign ID.
 * Only one NEW, uniquely identified, byte-persisted candidate can be proposed to MJ.
 * STUDIO does not commit the creator link: call the creator's reconcileStudioLink
 * with confirm:true only after the MJ approves the exact returned ID.
 */
export function inspectCreatorAttachment({campaign,persistedCampaign=null,cycle,persistedCycle=null}={}){
  const actualCreatures=readCollection(campaign,'creatures');
  const actualScenes=readCollection(campaign,'scenes');
  if(!obj(cycle)||!obj(cycle.drafts)||!obj(cycle.links))
    throw Error('État créateur L004-C absent');
  const blocked=(status='unattestable')=>({status,id:null,persisted:false});
  const result=(creature,scene,pending=false)=>({
    schema:RECONCILIATION_SCHEMA,pending,creature,scene,
    action:creature.status==='reusable'||scene.status==='reusable'
      ?'link-existing-after-MJ-confirmation':'block-automatic-retry',
  });
  const pending=cycle.extensions?.pendingStudioOp;
  // The no-journal path is diagnostic only: content equality is never ownership proof.
  if(pending===undefined||pending===null)
    return result(blocked(),blocked(),false);
  if(!obj(pending)||!['creature','scene'].includes(pending.kind)||
     !truthyString(pending.campaignId)||!Array.isArray(pending.beforeIds)||
     pending.beforeIds.length>1000||pending.beforeIds.some(x=>!truthyString(x))||
     new Set(pending.beforeIds).size!==pending.beforeIds.length)
    return result(blocked('invalid-journal'),blocked('invalid-journal'),true);
  const kind=pending.kind;
  const none=blocked('not-targeted');
  const makeStatus=status=>kind==='creature'?result(status,none,true):result(none,status,true);
  if(!obj(persistedCampaign)||!obj(persistedCycle)||
     !truthyString(cycle.id)||cycle.id!==persistedCycle.id||
     cycle.schema!=='cer.creators.dg004.private.v0'||cycle.schema!==persistedCycle.schema||
     !Number.isSafeInteger(cycle.revision)||cycle.revision!==persistedCycle.revision||
     !same(pending,persistedCycle.extensions?.pendingStudioOp)||
     !same(cycle.drafts,persistedCycle.drafts)||!same(cycle.links,persistedCycle.links))
    return makeStatus(blocked());
  if(campaign.id!==pending.campaignId||persistedCampaign.id!==pending.campaignId)
    return makeStatus(blocked('wrong-campaign'));
  const live=kind==='creature'?actualCreatures:actualScenes;
  const stored=kind==='creature'?readCollection(persistedCampaign,'creatures'):
    readCollection(persistedCampaign,'scenes');
  const liveIds=live.map(x=>x?.id),storedIds=stored.map(x=>x?.id);
  if(liveIds.some(x=>!truthyString(x))||storedIds.some(x=>!truthyString(x))||
     new Set(liveIds).size!==liveIds.length||new Set(storedIds).size!==storedIds.length)
    return makeStatus(blocked('ambiguous'));
  const before=new Set(pending.beforeIds),liveSet=new Set(liveIds),storedSet=new Set(storedIds);
  // A removed/renamed baseline ID makes the previous snapshot unauditable.
  if(pending.beforeIds.some(id=>!liveSet.has(id)||!storedSet.has(id)))
    return makeStatus(blocked('stale'));
  if((kind==='creature'&&truthyString(cycle.links.creatureInstanceId)) ||
     (kind==='scene'&&truthyString(cycle.links.sceneId)))
    return makeStatus(blocked('conflict'));
  const changedLive=live.filter(x=>!before.has(x.id));
  const changedStored=stored.filter(x=>!before.has(x.id));
  if(changedLive.length===0&&changedStored.length===0)
    return makeStatus(blocked('missing'));
  if(changedLive.length!==1||changedStored.length>1)
    return makeStatus(blocked('ambiguous'));
  const candidate=changedLive[0];
  if(changedStored.length===1&&changedStored[0].id!==candidate.id)
    return makeStatus(blocked('conflict'));
  const source=pending.source;
  const matches=entry=>{
    if(kind==='creature')return obj(source)&&
      ['documentId','profileId','ruleset'].every(k=>truthyString(source[k])&&entry?.source?.[k]===source[k]);
    const draft=cycle.drafts.scene;
    if(!obj(draft)||!truthyString(draft.title)||typeof draft.privateNotes!=='string')return false;
    if(entry?.title!==draft.title||
       (entry.publicDescription??'')!==(draft.publicDescription??'')||
       (entry.privateNotes??'')!==draft.privateNotes)return false;
    // Only a scene already linked to this exact creature instance is reusable.
    const creatureId=cycle.links.creatureInstanceId;
    return truthyString(creatureId)&&Array.isArray(entry.participantIds)&&
      entry.participantIds.includes(creatureId)&&
      actualCreatures.some(x=>x.id===creatureId)&&
      persistedCampaign.creatures.some(x=>x.id===creatureId);
  };
  const missingParticipants=x=>kind==='scene'&&obj(cycle.drafts.scene)&&
    x?.title===cycle.drafts.scene.title&&
    (x.publicDescription??'')===(cycle.drafts.scene.publicDescription??'')&&
    (x.privateNotes??'')===cycle.drafts.scene.privateNotes&&
    (!Array.isArray(x.participantIds)||!x.participantIds.includes(cycle.links.creatureInstanceId));
  if(!matches(candidate))return makeStatus(blocked(missingParticipants(candidate)?'needs-participants':'conflict'));
  if(!changedStored.length)return makeStatus({status:'unpersisted',id:candidate.id,persisted:false});
  if(!matches(changedStored[0]))return makeStatus(blocked(missingParticipants(changedStored[0])?'needs-participants':'conflict'));
  // Fields considered for identity must match both private stores; never expose them.
  // Full snapshot equality is not necessary (unrelated private extensions can change).
  return makeStatus({status:'reusable',id:candidate.id,persisted:true});
}

/** Explicit, opt-in bridge for 05 + 21. Only permitted after BOTH private stores
 * independently attest the candidate and ATELIERS' own journal recovery agrees.
 * Never copies/creates an actor or scene. No compensation or rollback is attempted.
 * The caller is responsible for obtaining the MJ's separate, affirmative confirmation.
 */
export async function confirmCreatorAttachmentWithEvidence({creator,studio,creatorPersistence,
  studioStorage,instanceId,confirm=false}={}){
  if(confirm!==true)throw Error('Confirmation MJ explicite requise');
  if(!truthyString(instanceId)||typeof creator?.getState!=='function'||
     typeof creator?.getStudioRecovery!=='function'||typeof creator?.reconcileStudioLink!=='function'||
     typeof studio?.getCampaign!=='function'||typeof creatorPersistence?.load!=='function'||
     typeof studioStorage?.load!=='function')throw Error('Ports de réconciliation L004 incomplets');
  // Load the two durable stores independently, rather than trusting the volatile UI.
  const cycle=creator.getState();
  const [persistedCycle,persistedCampaign]=await Promise.all([
    creatorPersistence.load(),studioStorage.load(),
  ]);
  const verdict=inspectCreatorAttachment({campaign:studio.getCampaign(),persistedCampaign,
    cycle,persistedCycle});
  const kind=cycle.extensions?.pendingStudioOp?.kind;
  const subject=kind==='creature'?verdict.creature:kind==='scene'?verdict.scene:null;
  if(verdict.action!=='link-existing-after-MJ-confirmation'||subject?.status!=='reusable'||
     subject.id!==instanceId)throw Error('Identité STUDIO non attestée : lien bloqué');
  const claimed=creator.getStudioRecovery();
  if(claimed?.pending!==true||claimed.kind!==kind||
     claimed.status!=='requires-confirmation'||claimed.unverifiedCount!==0||
     !Array.isArray(claimed.candidates)||claimed.candidates.length!==1||
     claimed.candidates[0]?.id!==instanceId)
    throw Error('Journal ATELIERS discordant : intervention manuelle requise');
  const result=await creator.reconcileStudioLink(instanceId,{confirm:true});
  if(result?.reconciled!==true||result.instanceId!==instanceId||result.kind!==kind)
    throw Error('Confirmation créateur non attestée ; ne pas réessayer une création STUDIO');
  const saved=await creatorPersistence.load();
  const linked=kind==='creature'?saved?.links?.creatureInstanceId:saved?.links?.sceneId;
  if(linked!==instanceId||saved?.extensions?.pendingStudioOp!==undefined)
    throw Error('Lien créateur non retrouvé durablement ; rechargement manuel requis');
  return {kind,instanceId,status:'linked',reconciled:true,executable:false};
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
