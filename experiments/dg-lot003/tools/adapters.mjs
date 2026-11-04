/* L003 integration-only reversible data shape adapter.
   No replacement storage or rule engine is supplied. */
export const OVERLAY_KEY='__cer_dg003_studio_projection_v0';
const clone=x=>structuredClone(x);
const isRecord=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
export function studioToArchive(studio,createCampaign){
 if(!isRecord(studio)||!Array.isArray(studio.characters)||!Array.isArray(studio.creatures)||!Array.isArray(studio.scenes))throw Error('Studio campaign invalid');
 if(typeof createCampaign!=='function')throw Error('ARCHIVES createCampaign unavailable');
 const archive=createCampaign({id:studio.id,name:studio.title});
 if(!isRecord(archive))throw Error('ARCHIVES campaign invalid');
 const characters=studio.characters.map(entry=>{
   if(typeof entry.id!=='string'||!isRecord(entry.privateSnapshot))throw Error('Invalid character snapshot');
   const a=entry.privateSnapshot;
   // ARCHIVES must own the original, never a normalized sheet. Unsupported shapes are REFUSED.
   const sheet=a.sheet ?? a.privateSnapshot?.sheet;
   const source=a.source ?? a.privateSnapshot?.source;
   const sourceId=a.sourceId ?? a.privateSnapshot?.sourceId;
   if(sheet===undefined||source===undefined||typeof sourceId!=='string')throw Error('Raw ARCHIVES sheet/source missing: cannot serialize without loss');
   return {id:entry.id,sourceId,source:clone(source),sheet:clone(sheet)};
 });
 archive.characters=characters;
 archive.creatures=clone(studio.creatures);
 archive.scenes=clone(studio.scenes);
 archive.privateNotes=clone(studio.privateNotes ?? []);
 // Archive-compatible top-level unknowns are preserved; studio overlay holds rich metadata.
 for(const [key,value] of Object.entries(studio)){
   if(!(key in archive)&&key!==OVERLAY_KEY)archive[key]=clone(value);
 }
 archive[OVERLAY_KEY]={
   schema:'cer.dg003.studio-overlay.v0',
   title:studio.title,revision:studio.revision,
   activeSceneId:studio.activeSceneId,
   extensions:clone(studio.extensions ?? {}),
   characters:studio.characters.map(({id,publicLabel,sourceSchema,privateSnapshot})=>({
      id,publicLabel,sourceSchema,
      privateMetadata:Object.fromEntries(Object.entries(privateSnapshot).filter(([k])=>!['sheet','source','sourceId'].includes(k)).map(([k,v])=>[k,clone(v)]))
   }))
 };
 return archive;
}
export function archiveToStudio(archive){
 if(!isRecord(archive)||!Array.isArray(archive.characters)||!Array.isArray(archive.scenes))throw Error('ARCHIVES campaign invalid');
 const overlay=archive[OVERLAY_KEY];
 if(!isRecord(overlay)||overlay.schema!=='cer.dg003.studio-overlay.v0'||!Array.isArray(overlay.characters))throw Error('Studio overlay absent: no destructive restoration');
 const byId=new Map(overlay.characters.map(c=>[c.id,c]));
 const characters=archive.characters.map(c=>{
  const info=byId.get(c.id);
  if(!info||c.sheet===undefined||c.source===undefined||typeof c.sourceId!=='string')throw Error('Character original metadata missing');
  return {id:c.id,publicLabel:info.publicLabel,sourceSchema:info.sourceSchema,
    privateSnapshot:{...clone(info.privateMetadata),sourceId:c.sourceId,source:clone(c.source),sheet:clone(c.sheet)}};
 });
 const extras=Object.fromEntries(Object.entries(archive).filter(([key])=>!['schema','id','name','characters','creatures','scenes','privateNotes',OVERLAY_KEY].includes(key)).map(([key,v])=>[key,clone(v)]));
 const result={...extras,schema:'cer.studio.dg003.provisional.v0',id:archive.id,
 title:overlay.title??archive.name,revision:overlay.revision,
 characters,creatures:clone(archive.creatures??[]),scenes:clone(archive.scenes),
 activeSceneId:overlay.activeSceneId??'',extensions:clone(overlay.extensions??{})};
 if(!Number.isSafeInteger(result.revision))throw Error('Invalid studio revision');
 return result;
}
export function creatorToCatalog(record,catalog,campaignId){
 if(!isRecord(record)||!['capacity','spell','item'].includes(record.kind)||typeof campaignId!=='string'||!campaignId)throw Error('Creator draft invalid');
 const factory={capacity:catalog?.createDescriptiveCapability,spell:catalog?.createDescriptiveSpell,item:catalog?.createDescriptiveItem}[record.kind];
 if(typeof factory!=='function')throw Error('INDEX descriptive factory unavailable');
 if(!/^(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)$/.test(record.version)){
   // Keep exact creator revision in provenance; catalogue semantics use its own provisional semver.
 }
 const narr=[record.name,record.description,record.limitations,record.trigger??'',record.manifestation??''].join(' ');
 if(/(?:\\+\\s*\\d+|\\b(?:dégâts?|damage|bonus|mana|charge|pv|points? de vie)\\s*[:=+\\-]?\\s*\\d+)/i.test(narr))throw Error('Narration numérique mécanique refusée');
 const input={name:record.name,description:record.description,version:/^(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)$/.test(record.version)?record.version:'0.1.0',
 provenance:{sourceSchema:record.schema,sourceId:campaignId+':'+record.kind+':'+record.name,originKind:'campaign',sourceVersion:record.version},
 restrictions:[record.limitations],effectText:record.description};
 const result=factory(input);
 if(result?.ok!==true||result.executable!==false)throw Error('INDEX rejected descriptive item: '+(result?.errors??[]).join('; '));
 return result.entry;
}
