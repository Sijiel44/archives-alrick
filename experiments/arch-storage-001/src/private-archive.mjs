import {EXPORT_SCHEMA,MAX_ARCHIVE_BYTES,assertCampaign,assertPlainJSON,fail,clone} from './contracts.mjs';
const enc=new TextEncoder(),dec=new TextDecoder('utf-8',{fatal:true});
async function digest(b){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');}
function ensureJournal(c,j){
 if(j.length!==c.revision||j.some((x,i)=>x.campaignId!==c.id||x.seq!==i+1||typeof x.eventId!=='string'||typeof x.signature!=='string'))fail('BAD_JOURNAL');
 const keys=j.map(x=>x.eventId);if(new Set(keys).size!==keys.length)fail('ID_COLLISION');
}
export async function makePrivateArchive({campaign,journal}){
 assertCampaign(campaign);assertPlainJSON(journal);ensureJournal(campaign,journal);
 const payload={campaign:clone(campaign),journal:clone(journal)};
 const payloadBytes=enc.encode(JSON.stringify(payload));if(payloadBytes.length>MAX_ARCHIVE_BYTES)fail('SIZE_LIMIT');
 const manifest={schema:EXPORT_SCHEMA,confidential:true,revision:campaign.revision,payloadSha256:await digest(payloadBytes),payloadBytes:payloadBytes.length};
 const bytes=enc.encode(JSON.stringify({manifest,payload}));if(bytes.length>MAX_ARCHIVE_BYTES)fail('SIZE_LIMIT');
 return {bytes,sha256:await digest(bytes),manifest};
}
export async function inspectPrivateArchive(input){
 const bytes=input instanceof Uint8Array?input:new Uint8Array(input);
 if(bytes.length===0||bytes.length>MAX_ARCHIVE_BYTES)fail('SIZE_LIMIT');
 let raw;try{raw=JSON.parse(dec.decode(bytes))}catch{fail('BAD_ARCHIVE');}
 assertPlainJSON(raw);
 const m=raw?.manifest,p=raw?.payload;
 if(m?.schema!==EXPORT_SCHEMA||m.confidential!==true||!p||!Array.isArray(p.journal))fail('BAD_ARCHIVE');
 const payloadBytes=enc.encode(JSON.stringify(p));
 if(payloadBytes.length!==m.payloadBytes||await digest(payloadBytes)!==m.payloadSha256)fail('HASH_MISMATCH');
 assertCampaign(p.campaign);ensureJournal(p.campaign,p.journal);
 if(p.campaign.revision!==m.revision)fail('BAD_REVISION');
 return {kind:'private-preview',sha256:await digest(bytes),campaign:clone(p.campaign),journal:clone(p.journal),manifest:clone(m),summary:{id:p.campaign.id,title:p.campaign.title,revision:p.campaign.revision,characters:p.campaign.characters.length,instances:p.campaign.instances.length,scenes:p.campaign.scenes.length,notes:p.campaign.privateNotes.length}};
}
