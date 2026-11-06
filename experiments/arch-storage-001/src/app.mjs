import {openStore,seedFiction} from './idb-store.mjs';
import {DEMO_ID} from './contracts.mjs';
const $=id=>document.getElementById(id),message=(text)=>{$('notice').textContent=text;};
const store=await openStore();let pending=null;
async function render(){
 const [c,j]=await Promise.all([store.readCampaign(DEMO_ID),store.listEvents(DEMO_ID)]);
 $('stats').replaceChildren();$('scenes').replaceChildren();$('journal').replaceChildren();
 if(!c){message('Base vierge : créer les données fictives.');return;}
 const items=[['Campagne',c.title],['Révision',c.revision],['PJ',c.characters.length],['Copies de créatures',c.instances.length],['Scènes',c.scenes.length],['Notes MJ',c.privateNotes.length],['Événements',j.length]];
 for(const [key,value] of items){const wrap=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=key;dd.textContent=String(value);wrap.append(dt,dd);$('stats').append(wrap)}
 for(const s of c.scenes){const li=document.createElement('li');li.textContent=s.title+' — '+s.publicDescription;
  const notes=c.privateNotes.filter(n=>n.sceneId===s.id).map(n=>n.text);if(notes.length){const span=document.createElement('strong');span.textContent=' [NOTE MJ PRIVÉE : '+notes.join(', ')+']';li.append(span)}$('scenes').append(li);}
 for(const e of j){const li=document.createElement('li');li.textContent='#'+e.seq+' — '+e.kind+' — '+e.eventId;$('journal').append(li)}
 return c;
}
async function act(fn){try{await fn()}catch(e){message('REFUS : '+(e.code??e.message))}}
$('seed').addEventListener('click',()=>act(async()=>{const r=await seedFiction(store);message('Campagne fictive : '+r.campaign.revision+' révisions ; aucun doublon.');await render()}));
$('refresh').addEventListener('click',()=>act(async()=>{await render();message('État rechargé depuis IndexedDB.')}));
$('failure').addEventListener('click',()=>act(async()=>{const c=await store.readCampaign(DEMO_ID);if(!c)throw Error('Créer campagne avant simulation');try{await store.applyEvent({campaignId:c.id,eventId:'event-failure-1',expectedRevision:c.revision,kind:'add-private-note',payload:{note:{id:'note-panne',sceneId:'scene-2',text:'Panne fictive',visibility:'mj-private'}}},{injectFailure:'before-commit'});}catch(e){message('Panne injectée : transaction annulée ('+(e.code??e.message)+') ; aucun doublon.');}await render();}));
$('retry').addEventListener('click',()=>act(async()=>{const c=await store.readCampaign(DEMO_ID);if(!c)throw Error('Créer campagne avant simulation');const cmd={campaignId:c.id,eventId:'event-ack-lost-1',expectedRevision:c.revision,kind:'add-private-note',payload:{note:{id:'note-ack-lost',sceneId:'scene-2',text:'Événement fiable fictif',visibility:'mj-private'}}};try{await store.applyEvent(cmd,{injectFailure:'ack-lost'});}catch(e){if(e.code!=='ACK_LOST_AFTER_COMMIT')throw e;}const retry=await store.applyEvent(cmd);message('Accusé perdu simulé ; nouvelle tentative : '+retry.status+'.');await render();}));
$('tab').addEventListener('click',()=>window.open(location.href,'_blank','noopener'));
$('export').addEventListener('click',()=>act(async()=>{const a=await store.exportPrivate(DEMO_ID),blob=new Blob([a.bytes],{type:'application/json'}),url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='CONFIDENTIEL_ARCH_STORAGE_001_FICTIF.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('Archive CONFIDENTIELLE SHA-256 : '+a.sha256)}));
$('preview').addEventListener('click',()=>act(async()=>{const file=$('archive').files?.[0];if(!file)throw Error('Choisir fichier fictif');pending=await store.previewImport(new Uint8Array(await file.arrayBuffer()));$('import').disabled=false;message('Prévisualisation SANS ÉCRITURE : '+JSON.stringify(pending.summary)+' ; vérifier que la base cible est vierge.')}));
$('import').addEventListener('click',()=>act(async()=>{if(!pending)throw Error('Prévisualisation manquante');const r=await store.commitImport(pending);pending=null;$('import').disabled=true;await render();message('Import confirmé : '+r.campaignId+' à révision '+r.revision)}));
await render();
document.body.dataset.p1aReady='true';
// Test-only protocol, not available through player origin or any network API.
window.__p1aDemo={store,render,seed:()=>seedFiction(store)};
window.addEventListener('pagehide',()=>store.close());
