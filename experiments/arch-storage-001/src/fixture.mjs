import {DEMO_ID,initialCampaign} from './contracts.mjs';
export const SENTINEL='PRIVE_P1A_SENTINEL_NE_JAMAIS_PROJETER';
const source=(n)=>({kind:'source',id:'source-pj-'+n,documentCode:'DOC-FICTIF-PJ-'+n,version:'alrick.sheets.v3',sha256:'synthetic-only-not-verified',rawBytesBase64:null,extensions:{attr:14}});
export const demoInitial=()=>initialCampaign({id:DEMO_ID});
export function demoCommands(){
 const pj=n=>({kind:'character',id:'pj-'+n,name:'PJ fictif '+n,source:source(n),profileId:'profil-pj-'+n,ruleset:'M01–M05-ref-only',rawStat:14});
 return [
  {eventId:'event-pj-1',kind:'add-character',payload:{character:pj(1)}},
  {eventId:'event-pj-2',kind:'add-character',payload:{character:pj(2)}},
  {eventId:'event-creature-1',kind:'copy-creature',payload:{catalogReference:{id:'catalog-creature-1',documentCode:'BEST-FICTIF-001',profileId:'profil-creature-N5',version:'fictive-1',ruleset:'M03-ref-only'},instance:{kind:'campaign-instance',id:'instance-creature-1',sourceDocumentCode:'BEST-FICTIF-001',profileId:'profil-creature-N5',catalogRefId:'catalog-creature-1',label:'Créature fictive de rive',privateSnapshot:{behavior:'fiction-only'}}}},
  {eventId:'event-scene-1',kind:'add-scene',payload:{scene:{id:'scene-1',title:'Le pont de brume',publicDescription:'Un pont apparaît.',participantIds:['pj-1','instance-creature-1'],privateOnly:true}}},
  {eventId:'event-scene-2',kind:'add-scene',payload:{scene:{id:'scene-2',title:'Le hall des pierres',publicDescription:'Une salle silencieuse.',participantIds:['pj-2'],privateOnly:true}}},
  {eventId:'event-note-1',kind:'add-private-note',payload:{note:{id:'note-1',sceneId:'scene-1',text:SENTINEL,visibility:'mj-private'}}},
 ];
}
