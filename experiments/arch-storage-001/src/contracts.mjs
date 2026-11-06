/** ARCH-STORAGE-001, P1-A. PROTOTYPE ONLY. No adopted schema, no rules engine. */
export const CAMPAIGN_SCHEMA = 'cer.arch-storage001.campaign.proposal.v0';
export const EXPORT_SCHEMA = 'cer.arch-storage001.private-export.proposal.v0';
export const MAX_ARCHIVE_BYTES = 2 * 1024 * 1024;
export const TYPES = Object.freeze(['Campaign','Session','Character','CatalogReference','CampaignInstance','Scene','Encounter','CreatorDraft','PrivateNote','EventJournal','MediaAsset','ExportManifest']);
export const DEMO_ID = 'campagne-fictive-p1a';
export const clone = value => structuredClone(value);
export function fail(code,detail='') { const err=new Error(detail||code);err.code=code;throw err; }
const isPlain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&[Object.prototype,null].includes(Object.getPrototypeOf(x));
export function assertPlainJSON(x,depth=0){
 if(depth>24) fail('BAD_DEPTH');
 if(x===null||typeof x==='string'||typeof x==='boolean'||(typeof x==='number'&&Number.isFinite(x)))return;
 if(Array.isArray(x)){if(x.length>5000)fail('SIZE_LIMIT');for(const v of x)assertPlainJSON(v,depth+1);return;}
 if(!isPlain(x))fail('BAD_JSON');
 for(const key of Object.keys(x)){
  if(['__proto__','constructor','prototype'].includes(key))fail('BAD_KEY');
  const d=Object.getOwnPropertyDescriptor(x,key);if(!d||!('value' in d))fail('BAD_GETTER');
  assertPlainJSON(d.value,depth+1);
 }
}
function id(x){return typeof x==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9:_-]{0,99}$/.test(x)}
export function assertCampaign(c){
 assertPlainJSON(c);
 if(!isPlain(c)||c.schema!==CAMPAIGN_SCHEMA||!id(c.id)||!Number.isSafeInteger(c.revision)||c.revision<1||typeof c.title!=='string')fail('BAD_CAMPAIGN');
 for(const k of ['sessions','characters','catalogReferences','instances','scenes','encounters','creatorDrafts','privateNotes','mediaAssets'])if(!Array.isArray(c[k]))fail('BAD_CAMPAIGN',k);
 if(c.characters.some(x=>!id(x.id)||!isPlain(x.source)||!id(x.source.id)||!id(x.source.documentCode)))fail('BAD_CHARACTER');
 if(c.instances.some(x=>!id(x.id)||!id(x.profileId)||!id(x.sourceDocumentCode)||!id(x.catalogRefId)))fail('BAD_INSTANCE');
 if(c.scenes.some(x=>!id(x.id)||!Array.isArray(x.participantIds)||typeof x.title!=='string'))fail('BAD_SCENE');
 if(c.privateNotes.some(x=>!id(x.id)||!id(x.sceneId)||typeof x.text!=='string'))fail('BAD_PRIVATE_NOTE');
 for(const collection of ['characters','instances','scenes','privateNotes']){const a=c[collection].map(x=>x.id);if(new Set(a).size!==a.length)fail('ID_COLLISION');}
 if(c.privateNotes.some(n=>!c.scenes.some(s=>s.id===n.sceneId)))fail('BROKEN_REFERENCE');
 return c;
}
export function initialCampaign({id:campaignId=DEMO_ID,title='Campagne fictive — Deux Rives'}={}){
 if(!id(campaignId))fail('BAD_ID');
 return {schema:CAMPAIGN_SCHEMA,id:campaignId,title,revision:1,sessions:[{id:'session-1',label:'Séance fictive',status:'local'}],characters:[],catalogReferences:[],instances:[],scenes:[],encounters:[],creatorDrafts:[],privateNotes:[],mediaAssets:[],extensions:{unknownFuture:{retained:true}}};
}
export function commandSignature(command){
 assertPlainJSON(command);
 if(!id(command.campaignId)||!id(command.eventId)||typeof command.kind!=='string'||!Number.isSafeInteger(command.expectedRevision))fail('BAD_COMMAND');
 return JSON.stringify({kind:command.kind,payload:command.payload});
}
export function applyCommand(c,command){
 assertCampaign(c);if(c.id!==command.campaignId)fail('CAMPAIGN_MISMATCH');
 const next=clone(c),p=command.payload;
 if(!isPlain(p))fail('BAD_PAYLOAD');
 if(command.kind==='add-character'){
  if(!isPlain(p.character)||!id(p.character.id)||!isPlain(p.character.source))fail('BAD_CHARACTER');
  if(next.characters.some(x=>x.id===p.character.id))fail('ID_COLLISION');next.characters.push(clone(p.character));
 }else if(command.kind==='copy-creature'){
  if(!isPlain(p.catalogReference)||!isPlain(p.instance)||!id(p.instance.id)||!id(p.catalogReference.id))fail('BAD_INSTANCE');
  if(next.instances.some(x=>x.id===p.instance.id)||next.catalogReferences.some(x=>x.id===p.catalogReference.id))fail('ID_COLLISION');
  next.catalogReferences.push(clone(p.catalogReference));next.instances.push(clone(p.instance));
 }else if(command.kind==='add-scene'){
  if(!isPlain(p.scene)||!id(p.scene.id)||!Array.isArray(p.scene.participantIds))fail('BAD_SCENE');
  if(next.scenes.some(x=>x.id===p.scene.id))fail('ID_COLLISION');next.scenes.push(clone(p.scene));
 }else if(command.kind==='add-private-note'){
  if(!isPlain(p.note)||!id(p.note.id)||!next.scenes.some(x=>x.id===p.note.sceneId))fail('BROKEN_REFERENCE');
  if(next.privateNotes.some(x=>x.id===p.note.id))fail('ID_COLLISION');next.privateNotes.push(clone(p.note));
 }else fail('UNSUPPORTED_COMMAND');
 next.revision++;
 return assertCampaign(next);
}
export const statusPublicOnly = c => ({schema:'cer.arch-storage001.presentation.proposal.v0',sceneCount:c.scenes.length,actors:c.characters.length+c.instances.length});
