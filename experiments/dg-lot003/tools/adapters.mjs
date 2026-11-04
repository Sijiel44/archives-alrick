/* Integrator-owned reversible projection. ARCHIVES is authoritative on raw sheets / SHA. */
export const OVERLAY_KEY='__cer_dg003_studio_projection_v0';
const clone=x=>structuredClone(x);
const isRecord=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const omit=(obj,keys)=>Object.fromEntries(Object.entries(obj).filter(([key])=>!keys.includes(key)).map(([key,v])=>[key,clone(v)]));
const ARCHIVE_KEYS=['schema','id','name','characters','creatures','scenes','privateNotes',OVERLAY_KEY];
const STUDIO_KEYS=['schema','id','title','revision','characters','creatures','scenes','activeSceneId','extensions','privateNotes'];
const SOURCE_FIELDS=['sourceId','source','sheet'];
export function studioToArchive(studio,createCampaign){
 if(!isRecord(studio)||!Array.isArray(studio.characters)||!Array.isArray(studio.creatures)||!Array.isArray(studio.scenes)||!Array.isArray(studio.privateNotes??[]))
  throw Error('Studio campaign invalid');
 if(typeof createCampaign!=='function')throw Error('ARCHIVES createCampaign unavailable');
 const archive=createCampaign({id:studio.id,name:studio.title});
 if(!isRecord(archive))throw Error('ARCHIVES campaign invalid');
 const characters=[], overlays=[];
 for(const entry of studio.characters){
  if(typeof entry.id!=='string'||!entry.id||!isRecord(entry.privateSnapshot))throw Error('Character snapshot invalid');
  const source=entry.privateSnapshot;
  if(typeof source.sourceId!=='string'||!isRecord(source.source)||!isRecord(source.sheet))
   throw Error('Raw ARCHIVES source/sheet missing; refusing lossy serialization');
  const original=source.__archiveCharacter;
  const preserved=isRecord(original)?clone(original):{};
  characters.push({...preserved,id:entry.id,sourceId:source.sourceId,source:clone(source.source),sheet:clone(source.sheet)});
  overlays.push({id:entry.id,fields:omit(entry,['id','privateSnapshot']),
   privateExtras:omit(source,[...SOURCE_FIELDS,'__archiveCharacter'])});
 }
 archive.characters=characters;
 archive.creatures=clone(studio.creatures);
 archive.scenes=clone(studio.scenes);
 archive.privateNotes=clone(studio.privateNotes??[]);
 // Unknown campaign properties are retained across both formats.
 Object.assign(archive,omit(studio,STUDIO_KEYS));
 archive[OVERLAY_KEY]={
  schema:'cer.dg003.studio-overlay.v1',
  fields:{title:studio.title,revision:studio.revision,activeSceneId:studio.activeSceneId,
   extensions:clone(studio.extensions??{})},
  characters:overlays
 };
 return archive;
}
export function archiveToStudio(archive){
 if(!isRecord(archive)||!Array.isArray(archive.characters)||!Array.isArray(archive.scenes)||!Array.isArray(archive.creatures))throw Error('ARCHIVES campaign invalid');
 const overlay=archive[OVERLAY_KEY];
 if(!isRecord(overlay)||overlay.schema!=='cer.dg003.studio-overlay.v1'||!Array.isArray(overlay.characters)||!isRecord(overlay.fields))
  throw Error('Studio overlay missing/incompatible — refusing lossy restoration');
 const byId=new Map(overlay.characters.map(c=>[c.id,c]));
 if(byId.size!==overlay.characters.length)throw Error('Overlay character collision');
 const characters=archive.characters.map(c=>{
  const meta=byId.get(c.id);
  if(!isRecord(meta)||!isRecord(meta.fields)||!isRecord(meta.privateExtras)||!isRecord(c.source)||!isRecord(c.sheet))
   throw Error('Original character or overlay missing');
  return {id:c.id,...clone(meta.fields),privateSnapshot:{
    ...clone(meta.privateExtras),sourceId:c.sourceId,source:clone(c.source),sheet:clone(c.sheet),
    __archiveCharacter:clone(c)
  }};
 });
 const result={...omit(archive,ARCHIVE_KEYS),schema:'cer.studio.dg003.provisional.v0',
  id:archive.id,title:overlay.fields.title??archive.name,revision:overlay.fields.revision,
  characters,creatures:clone(archive.creatures),scenes:clone(archive.scenes),
  activeSceneId:overlay.fields.activeSceneId??'',extensions:clone(overlay.fields.extensions??{}),
  privateNotes:clone(archive.privateNotes??overlay.fields.privateNotes??[])};
 if(!Number.isSafeInteger(result.revision))throw Error('Invalid studio revision');
 return result;
}
export function creatorToCatalog(record,catalog,campaignId){
 if(!isRecord(record)||!['capacity','spell','item'].includes(record.kind)||typeof campaignId!=='string'||!campaignId)
  throw Error('Creator draft invalid');
 const factory={capacity:catalog?.createDescriptiveCapability,spell:catalog?.createDescriptiveSpell,item:catalog?.createDescriptiveItem}[record.kind];
 if(typeof factory!=='function')throw Error('INDEX descriptive factory unavailable');
 // Creator version and catalog semantic version are independent. Refuse ambiguous versions.
 if(!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(record.version))
  throw Error('INDEX requires semantic version MAJOR.MINOR.PATCH; original draft untouched');
 const narration=[record.description,record.limitations,record.trigger??'',record.manifestation??''].join(' ');
 if(/(?:\+\s*\d+|\b(?:dégâts?|damage|bonus|mana|charges?|pv|points? de vie)\s*[:=+\-]?\s*\d+)/i.test(narration))
  throw Error('Unapproved narrative numeric effect');
 const input={name:record.name,description:record.description,version:record.version,
  provenance:{sourceSchema:record.schema,sourceId:campaignId+':'+record.kind+':'+record.name,
   originKind:'campaign',sourceVersion:record.version},
  restrictions:[record.limitations],effectText:record.description};
 const result=factory(input);
 if(result?.ok!==true||result.executable!==false)throw Error('INDEX rejected descriptive entry: '+(result?.errors??[]).join('; '));
 return result.entry;
}
