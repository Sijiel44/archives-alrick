/** ARCH-STORAGE-001.R2: strengthened-A COMPARISON HARNESS, not the legacy application.
 * One localStorage envelope makes a snapshot+journal write synchronous and atomic
 * within a single key. This is NOT a cross-tab CAS and is NOT production storage.
 */
import {initialCampaign,assertCampaign,applyCommand,commandSignature,fail,clone,DEMO_ID} from './contracts.mjs';
import {makePrivateArchive,inspectPrivateArchive} from './private-archive.mjs';
export const A_GUARD_SCHEMA='cer.arch-storage001.a-reinforced.comparison.v0';
export const A_GUARD_KEY='cer.arch-storage001.a-reinforced.fiction-only.v0';
function parseEnvelope(raw){
 if(raw===null)return null;
 let value;try{value=JSON.parse(raw);}catch{fail('A_BAD_ENVELOPE');}
 if(value?.schema!==A_GUARD_SCHEMA||!Array.isArray(value.journal))fail('A_BAD_ENVELOPE');
 assertCampaign(value.campaign);
 const c=value.campaign,j=value.journal;
 if(c.revision!==j.length||j.some((e,i)=>e.campaignId!==c.id||e.seq!==i+1))fail('A_BAD_JOURNAL');
 return clone(value);
}
export function createAReinforcedComparison({storage=globalThis.localStorage,key=A_GUARD_KEY}={}){
 if(!storage||typeof storage.getItem!=='function'||typeof storage.setItem!=='function')fail('A_UNAVAILABLE');
 const read=()=>parseEnvelope(storage.getItem(key));
 const persist=e=>{try{storage.setItem(key,JSON.stringify(e));}catch(error){if(error?.name==='QuotaExceededError')fail('QUOTA_EXCEEDED');throw error;}};
 async function createCampaign(campaign=initialCampaign()){
  assertCampaign(campaign);if(read())fail('CAMPAIGN_COLLISION');
  persist({schema:A_GUARD_SCHEMA,campaign:clone(campaign),journal:[{campaignId:campaign.id,eventId:'event-create',seq:1,kind:'create-campaign',signature:'genesis'}]});
  return{status:'committed',revision:1};
 }
 async function readCampaign(id=DEMO_ID){const env=read();return env?.campaign.id===id?clone(env.campaign):null;}
 async function listEvents(id=DEMO_ID){const env=read();return env?.campaign.id===id?clone(env.journal):[];}
 async function applyEvent(command,{beforePersist}={}){
  const signature=commandSignature(command);
  const env=read();if(!env||env.campaign.id!==command.campaignId)fail('CAMPAIGN_NOT_FOUND');
  const previous=env.journal.find(e=>e.eventId===command.eventId);
  if(previous){if(previous.signature!==signature)fail('ID_COLLISION');return {status:'duplicate',revision:previous.seq};}
  if(env.campaign.revision!==command.expectedRevision)fail('STALE_REVISION');
  env.campaign=applyCommand(env.campaign,command);
  env.journal.push({campaignId:command.campaignId,eventId:command.eventId,seq:env.campaign.revision,kind:command.kind,signature});
  // Test-only hook makes the missing multi-tab compare-and-swap observable.
  if(beforePersist)await beforePersist({revision:env.campaign.revision});
  persist(env);return{status:'committed',revision:env.campaign.revision};
 }
 async function exportPrivate(id=DEMO_ID){const env=read();if(!env||env.campaign.id!==id)fail('CAMPAIGN_NOT_FOUND');return makePrivateArchive({campaign:env.campaign,journal:env.journal});}
 async function previewImport(bytes){return inspectPrivateArchive(bytes);}
 async function commitImport(preview){
  if(read())fail('CAMPAIGN_COLLISION');
  if(preview?.kind!=='private-preview')fail('BAD_PREVIEW');
  // Comparison-only path: no trust token unlike B's WeakMap protection. Never use for production.
  persist({schema:A_GUARD_SCHEMA,campaign:clone(preview.campaign),journal:clone(preview.journal)});
  return{status:'imported',campaignId:preview.campaign.id,revision:preview.campaign.revision};
 }
 return Object.freeze({name:'A-REINFORCED-COMPARISON-ONLY',readCampaign,listEvents,createCampaign,applyEvent,exportPrivate,previewImport,commitImport});
}
