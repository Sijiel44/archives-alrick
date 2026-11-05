/** L004-A: actual DOM demonstrator on top of existing L003 native adapters. No import-time effects. */
import {mountStudio} from '../../../dg-lot003/src/studio/index.mjs';
import {mountCreators} from '../../../dg-lot003/src/creators/index.mjs';
import {createDemoStorageArea,isolateDemoAdapter,fictionalCharacterBytes,DEMO_NAMESPACE} from './demo-storage.mjs';
import {previewDescriptiveSceneLink} from './scene-bridge.mjs';
const text=(d,t,s='')=>{const x=d.createElement(t);x.textContent=s;return x;};
const button=(d,label,fn)=>{const x=text(d,'button',label);x.type='button';x.addEventListener('click',()=>void fn());return x;};
const required=(port,method)=>{if(typeof port?.[method]!=='function')throw Error(`Port ${method} requis`);};
const fixtCode='fixture-source-001';

/**
 * mountStudioDemo(root,{window, storageFactory(area), createDemoAdapters({getCampaign,storage}),
 *   playerPath?, injectCreatorStyles?})
 * - storageFactory MUST return the original validated ARCHIVES-backed L003 storage adapter.
 * - The provided `area` is a namespaced localStorage gateway; never pass real localStorage.
 * - Creation/acceptance uses real L003 mountStudio API; no alternate import, restore or formulas.
 * - Demo PJ fixture bytes are accepted; manual PJ files are refused by a byte-exact gate.
 * - The player projection retains L003 explicit whitelist, separate origin and CLEAR semantics.
 */
export function mountStudioDemo(root,options={}){
  if(!root||!root.ownerDocument||typeof root.replaceChildren!=='function')throw TypeError('Racine DOM requise');
  const doc=root.ownerDocument,view=options.window??doc.defaultView;
  if(!view?.localStorage||typeof options.storageFactory!=='function')throw Error('Stockage fictif natif non connecté');
  if(typeof options.createDemoAdapters!=='function')throw Error('Fabrique de ports DEMO distincte requise');
  const area=createDemoStorageArea(view.localStorage);
  const base=options.storageFactory(area);
  const storage=isolateDemoAdapter(base,area,{cryptoAPI:view.crypto});
  let studio=null;
  const adapters=options.createDemoAdapters({getCampaign:()=>studio?.getCampaign()??null,storage});
  required(adapters?.characterImport,'preview');required(adapters?.characterImport,'accept');
  required(adapters?.catalog,'resolveCreature');required(adapters?.bestiary,'copyCreature');
  const fixture=fictionalCharacterBytes(),sourceCode=options.creatureCode??fixtCode;
  const gatedImport={
    async preview({bytes,fileName}){
      if(!(bytes instanceof Uint8Array)||bytes.length!==fixture.length||bytes.some((b,i)=>b!==fixture[i]))
        throw Error('Mode fictif : utiliser uniquement la fiche PJ de démonstration fournie');
      return adapters.characterImport.preview({bytes,fileName:'L004-FICTIF.json'});
    },
    accept(...args){return adapters.characterImport.accept(...args)}
  };
  const catalog={resolveCreature(reference){
    if(reference!==sourceCode)throw Error('Mode fictif : seule la référence de créature témoin est autorisée');
    return adapters.catalog.resolveCreature(reference);
  }};
  const shell=text(doc,'section');shell.setAttribute('aria-label','Parcours démonstration DG-LOT-004');shell.setAttribute('data-l004-demo','');
  const banner=text(doc,'header');banner.append(text(doc,'h1','Studio — démonstration fictive L004-A'),
    text(doc,'p',`Données fictives uniquement. Stockage local isolé : ${DEMO_NAMESPACE}`),
    text(doc,'p','Ce mode n’accède pas aux campagnes du MJ. Ce n’est pas une protection contre une personne ayant accès au navigateur MJ.'));
  const guide=text(doc,'section');guide.setAttribute('aria-label','Guide de démonstration');
  guide.append(text(doc,'h2','Parcours guidé et réversible'),text(doc,'p','Chaque confirmation est explicite. Aucun partage joueur n’est automatique.'));
  const status=text(doc,'p','Prêt pour la campagne fictive.');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const controls=text(doc,'div');controls.setAttribute('role','group');controls.setAttribute('aria-label','Étapes de démonstration');
  const cockpit=text(doc,'div');cockpit.setAttribute('aria-label','Studio fictif interactif');
  const creators=text(doc,'div');creators.setAttribute('aria-label','Créateurs descriptifs fictifs');
  const bridge=text(doc,'section');bridge.setAttribute('aria-label','L004-C — raccord descriptif scène');
  bridge.append(text(doc,'h2','Prévisualisation de raccord L004-C'),
    text(doc,'p','Objet fictif → capacité descriptive → créature → scène. Proposition privée uniquement : en attente INDEX / ATELIERS.'));
  const linkOutput=text(doc,'div');linkOutput.setAttribute('aria-live','polite');bridge.append(linkOutput);
  const steps=text(doc,'ol');
  for(const s of ['Créer campagne fictive','Prévisualiser PJ fictif','Accepter copie PJ','Référencer créature fictive',
      'Créer copie de créature','Créer scène avec notes privées','Créer objet et capacité descriptifs dans les ateliers',
      'Choisir les champs publics, ouvrir la fenêtre joueur, puis publier manuellement',
      'Exporter CONFIDENTIEL puis prévisualiser/valider la restauration'])steps.append(text(doc,'li',s));
  guide.append(steps,status,controls);shell.append(banner,guide,cockpit,creators,bridge);root.replaceChildren(shell);
  let creator=null,disposed=false,busy=false;
  const savedDrafts=[];
  const onError=fn=>async()=>{
    if(busy||disposed)return;busy=true;
    try{await fn();status.textContent='Étape exécutée. Vérifier le cockpit avant la suivante.';}
    catch(e){status.textContent=`Action refusée : ${e instanceof Error?e.message:String(e)}`;}
    finally{busy=false;refresh();}
  };
  studio=mountStudio(cockpit,{
    window:view,storage,characterImport:gatedImport,catalog,bestiary:adapters.bestiary,
    rules:adapters.rules??null,studioOrigin:'http://127.0.0.1:4173',playerOrigin:'http://127.0.0.1:4174',
    playerPath:options.playerPath??'/player.html',openWindow:options.openWindow,
  });
  creator=mountCreators(creators,{
    injectStyles:options.injectCreatorStyles??false,
    async onSave(record){
      if(typeof adapters.creatorSave!=='function')throw Error('Persistance descriptive INDEX/ARCHIVES non branchée');
      const snapshot=studio.getCampaign();if(!snapshot)throw Error('Créer campagne avant créateur');
      const out=await adapters.creatorSave(record,snapshot,storage);
      if(out?.saved!==true)throw Error('Création non enregistrée');
      savedDrafts.push(structuredClone(record));return out;
    }
  });
  function selected(){return studio.getCampaign();}
  const run=[
    ['Créer campagne fictive',()=>{if(selected())throw Error('Campagne déjà ouverte ; restaurer ou continuer');return studio.createCampaign('Campagne vitrine — L004-A');}],
    ['Prévisualiser PJ fictif',()=>studio.previewCharacter(new Uint8Array(fixture),'L004-FICTIF.json')],
    ['Accepter copie PJ',()=>studio.acceptCharacter()],
    ['Prévisualiser créature fictive',()=>studio.previewCreature(sourceCode)],
    ['Accepter copie créature',()=>studio.copyCreature()],
    ['Créer scène et notes MJ fictives',()=>{
      const c=selected();if(!c?.characters.length||!c?.creatures.length)throw Error('PJ et créature requis');
      studio.createScene('La Lanterne des Deux Rives',
        'Une lueur discrète éclaire la rive. Une créature écoute au loin.',
        'SENTINELLE_MJ_L004_FICTIVE — identité cachée et résolution secrète.');
      const scene=studio.getCampaign().scenes.at(-1);
      studio.updateScene({title:scene.title,publicDescription:scene.publicDescription,
        privateNotes:scene.privateNotes,participantIds:[...c.characters,...c.creatures].map(x=>x.id)});
    }],
  ];
  for(const [label,fn] of run)controls.append(button(doc,label,onError(fn)));
  controls.append(text(doc,'p','Les créateurs descriptifs restent ci-dessous. Pour le joueur, cochez explicitement les champs et cliquez Publier dans le cockpit.'));
  const makeBridge=button(doc,'Prévisualiser le lien privé vers la scène',onError(()=>{
    const c=selected();if(!c?.scenes.length||!c.creatures.length)throw Error('Créer une scène avec une créature');
    const objectDraft=savedDrafts.find(x=>x.kind==='item'),capacityDraft=savedDrafts.find(x=>x.kind==='capacity');
    if(!objectDraft||!capacityDraft)throw Error('Enregistrer un objet ET une capacité descriptive');
    const link=previewDescriptiveSceneLink({objectDraft,capabilityDraft,creature:c.creatures[0],scene:c.scenes.find(x=>x.id===c.activeSceneId)});
    // MJ-only DOM; never incorporated into DTO, postMessage or public export.
    linkOutput.replaceChildren(text(doc,'p',`Privé — ${link.object.name} → ${link.capability.name} → ${link.creature.name} → ${link.scene.title}`),
      text(doc,'p',link.rule));
    return link;
  }));bridge.append(makeBridge);
  function refresh(){const c=selected();
    for(const [i,btn] of [...controls.querySelectorAll('button')].entries()){
      const ok=i===0?!c:i===1?!!c:i===2?!!c:i===3?!!c?.characters.length:
        i===4?!!c?.characters.length:i===5?!!c?.characters.length&&!!c?.creatures.length:false;
      btn.disabled=busy||!ok;
    }
    makeBridge.disabled=busy||!c?.scenes.length;
  }
  refresh();
  return {
    studio,creator,area,storage,fixtureBytes:new Uint8Array(fixture),
    getDrafts(){return structuredClone(savedDrafts)},
    getDemoCampaign(){return studio.getCampaign()},
    dispose(){if(disposed)return;disposed=true;studio.dispose();creator.destroy();root.replaceChildren();},
    isDemo:true,
  };
}
