// TEST-ONLY synthetic adapters. Not an ARCHIVES implementation or an official RulesGateway.
import {mountStudio} from '../../src/studio/index.mjs';
const encoder=new TextEncoder(), decoder=new TextDecoder();
const hex=bytes=>[...bytes].map(x=>x.toString(16).padStart(2,'0')).join('');
const sha=async bytes=>hex(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)));
const toB64=bytes=>btoa(String.fromCharCode(...bytes));
const fromB64=str=>Uint8Array.from(atob(str),x=>x.charCodeAt(0));
const storage={
  async load(){return JSON.parse(localStorage.getItem('cer.dg003.harness.campaign')||'null')},
  async save(c){localStorage.setItem('cer.dg003.harness.campaign',JSON.stringify(c))},
  async exportPrivate(c){return encoder.encode(JSON.stringify({schema:'cer.studio.dg003.provisional.v0',classification:'CONFIDENTIEL',campaign:c}))},
  async previewRestore({bytes}){const data=JSON.parse(decoder.decode(bytes));if(data.schema!=='cer.studio.dg003.provisional.v0'||!data.campaign)throw Error('Mauvais schéma');
    return {display:{title:data.campaign.title},data};},
  async restore(preview,{previous}){if(previous && previous.id===preview.data.campaign.id && previous.revision>preview.data.campaign.revision)throw Error('Collision : sauvegarde plus récente');
    return structuredClone(preview.data.campaign);}
};
const characterImport={
  async preview({bytes,fileName}){const text=decoder.decode(bytes),data=JSON.parse(text);
    if(!['alrick.sheets.v2','alrick.sheets.v3'].includes(data.schema)||!Array.isArray(data.sheets)||data.sheets.length!==1)
      throw Error('Schéma PJ v2/v3 attendu');
    const sheet=data.sheets[0];if(typeof sheet.name!=='string'||typeof sheet.stats?.physique!=='number')throw Error('Fiche PJ incomplète');
    return {schemaVersion:data.schema.endsWith('.v2')?'v2':'v3',display:{name:sheet.name,level:sheet.level},
      sha256:await sha(bytes),rawBase64:toB64(bytes),fileName,source:structuredClone(data)};
  },
  async accept(preview){return {id:crypto.randomUUID(),sheet:structuredClone(preview.source.sheets[0]),
    sourceSchema:preview.schemaVersion,sha256:preview.sha256,rawBase64:preview.rawBase64,
    originalBytes:Array.from(fromB64(preview.rawBase64))}}
};
const catalog={async resolveCreature(key){if(key!=='FICT-BEST-001')throw Error('Référence non trouvée');
  return {documentId:'FICT-BEST-001',profileId:'FICT-PROFILE-N5',ruleset:'m03',name:'Créature fictive N5',level:5,
    privateSourceNotes:'PRIVATE_SENTINEL_CREATURE_92bb'};}};
const bestiary={async copyCreature(source){return {id:crypto.randomUUID(),sourceSnapshot:structuredClone(source),
  gmNotes:'PRIVATE_SENTINEL_CREATURE_INSTANCE_2f91'};}};
window.__studio=mountStudio(document.querySelector('#studio'),{
  storage,characterImport,catalog,bestiary,playerPath:'/tests/studio/harness-player.html'});
