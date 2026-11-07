/** DG-LOT-004 P0-A: opt-in, local-only demonstrator over the unmodified STUDIO owner API. */
export const DEMO_MARKER_KEY='cer.dg004.demo.marker.v0';
export const PRIVATE_STORAGE_KEY='cer.dg003.private.campaign.v0';
export const DEMO_TITLE='Démonstration fictive — Entre-Rives';
export const DEMO_SCENE='Passerelle d’essai (fiction)';
export const DEMO_PRIVATE='CANARY_DG004_PRIVATE_FAKE_NOT_FOR_PLAYER';
const allowedOrigin='http://127.0.0.1:4173';
export function createFakePJBytes(){
 return new TextEncoder().encode('\uFEFF '+JSON.stringify({
  schema:'alrick.sheets.v2',futureEnvelope:{marker:'DG004_SYNTHETIC_ONLY'},
  sheets:[{id:'dg004-fake-pj',name:'Éclaireuse fictive DG004',stats:{physique:14},
   unknownSheet:{tag:'DG004_FAKE_PRIVATE'}}]
 }));
}
function marker(area){
 const raw=area.getItem(DEMO_MARKER_KEY);
 if(raw===null)return null;
 let value;try{value=JSON.parse(raw);}catch{throw Error('Marqueur démo corrompu : suppression automatique interdite');}
 if(!value||value.kind!=='cer.dg004.demo.v0'||typeof value.id!=='string'||!value.id||
  typeof value.token!=='string'||!value.token)throw Error('Marqueur démo invalide');
 return value;
}
export function installDemo(app,doc){
 const view=doc.defaultView;
 if(view.location.origin!==allowedOrigin)throw Error('DG004 : démo autorisée sur loopback MJ uniquement');
 if(!app?.studio||!app?.store)throw Error('DG004 : interfaces STUDIO/ARCHIVES non connectées');
 const root=doc.getElementById('dg004-demo-root');if(!root)throw Error('Zone DG004 absente');
 const make=(tag,label)=>{const e=doc.createElement(tag);if(label)e.textContent=label;return e;};
 const title=make('h2','Démonstration locale — données entièrement fictives');
 const guide=make('p','Consentement explicite. Le mode démo refuse tout stockage de campagne existant. Fenêtre joueur : ouverture et publication manuelles, uniquement sur 127.0.0.1. Aucun hébergement public.');
 const launch=make('button','Démarrer la démonstration fictive');
 const rollback=make('button','Quitter et effacer uniquement la démonstration');
 launch.type=rollback.type='button';
 const status=make('p','Mode démonstration inactif. Aucune donnée modifiée.');
 status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const instructions=make('p','Parcours : PJ fictif → créature fictive → scène → fenêtre joueur → prévisualisation puis partage explicite → export privé. Les calculs de règles restent de simples aperçus.');
 root.replaceChildren(title,guide,launch,rollback,status,instructions);
 const say=text=>{status.textContent=text;};
 const area=view.localStorage;
 let busy=false;
 async function start(){
  if(busy)return;
  busy=true;launch.disabled=rollback.disabled=true;
  try{
   if(area.getItem(PRIVATE_STORAGE_KEY)!==null||marker(area)!==null)
    throw Error('Démo refusée : des données locales existent déjà. Utiliser un profil navigateur vierge, sans effacer les anciennes sauvegardes.');
   const token=view.crypto.randomUUID();
   app.studio.createCampaign(DEMO_TITLE);
   const first=app.studio.getCampaign();if(!first?.id)throw Error('Campagne factice non créée');
   area.setItem(DEMO_MARKER_KEY,JSON.stringify({kind:'cer.dg004.demo.v0',id:first.id,token}));
   await app.studio.previewCharacter(createFakePJBytes(),'DG004_fictif_v2.json');
   await app.studio.acceptCharacter();
   await app.studio.previewCreature('fixture-source-001');
   await app.studio.copyCreature();
   app.studio.createScene(DEMO_SCENE,'Une passerelle fictive, sans canon ni secrets réels.',DEMO_PRIVATE);
   const current=app.studio.getCampaign();
   const participants=[...current.characters,...current.creatures].map(x=>x.id);
   app.studio.updateScene({title:DEMO_SCENE,
    publicDescription:'Une passerelle fictive, sans canon ni secrets réels.',
    privateNotes:DEMO_PRIVATE,participantIds:participants});
   // Flush the same native ARCHIVES storage queue used by the Studio owner.
   await app.store.save(app.studio.getCampaign());
   const saved=await app.store.load();
   if(saved?.id!==first.id||saved.scenes.length!==1||saved.characters.length!==1||
      saved.creatures.length!==1||saved.scenes[0].privateNotes!==DEMO_PRIVATE)
    throw Error('Démonstration non persistée intégralement');
   say('DEMO_READY : campagne, PJ, créature et scène fictifs persistés. Ouvrir la fenêtre joueur manuellement, puis sélectionner explicitement ce qui sera partagé. Aucun partage automatique.');
  }catch(error){say('DEMO_BLOCKED : '+String(error.message??error));}
  finally{busy=false;launch.disabled=rollback.disabled=false;}
 }
 async function exit(){
  if(busy)return;busy=true;launch.disabled=rollback.disabled=true;
  try{
   const owned=marker(area);
   if(!owned)throw Error('Aucune session DG004 vérifiable : aucune suppression autorisée');
   const existing=await app.store.load();
   if(existing?.id!==owned.id)throw Error('Campagne active différente : refus de suppression');
   // Clear any connected player by disposing the existing Studio instance.
   app.studio.dispose();
   // Small demo is stored in the legacy private key; a larger IDB blob would
   // remain unreferenced and must never be removed without its verified digest.
   area.removeItem(PRIVATE_STORAGE_KEY);
   area.removeItem(DEMO_MARKER_KEY);
   if(area.getItem(PRIVATE_STORAGE_KEY)!==null||area.getItem(DEMO_MARKER_KEY)!==null)
    throw Error('Nettoyage local non confirmé');
   say('DEMO_CLEARED : seules les données fictives DG004 ont été effacées. Actualiser pour revenir au Studio initial.');
  }catch(error){say('DEMO_CLEAR_BLOCKED : '+String(error.message??error));}
  finally{busy=false;launch.disabled=rollback.disabled=false;}
 }
 launch.addEventListener('click',()=>{void start();});
 rollback.addEventListener('click',()=>{void exit();});
 if(marker(area))say('Session démo existante détectée : utiliser Quitter et effacer uniquement la démonstration.');
 return {start,exit,marker:()=>marker(area)};
}
