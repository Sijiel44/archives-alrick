import {STUDIO_ORIGIN,PLAYER_ORIGIN,PLAYER_READY,PLAYER_SHOW,PLAYER_CLEAR,PROVISIONAL_CAMPAIGN_SCHEMA,
  checkedPlayerOrigins,makePlayerProjection,plainText} from './projection.mjs';

// Independent limits: PJ sources stay at 5 MiB; private ARCHIVES backups may reach 16 MiB.
const MAX_PJ_IMPORT_BYTES=5*1024*1024;
const MAX_BACKUP_BYTES=16*1024*1024;
const txt=(doc,tag,text='')=>{const n=doc.createElement(tag);n.textContent=text;return n;};
const clone=(value)=>structuredClone(value);
function makeId(view){
  const crypto=view.crypto;
  if (!crypto || typeof crypto.randomUUID !== 'function') throw Error('Identifiant sécurisé indisponible');
  return crypto.randomUUID();
}
function entry(doc,label,value='',multiline=false){
  const wrap=txt(doc,'label',label+' ');
  const field=doc.createElement(multiline?'textarea':'input');
  if(!multiline)field.type='text';
  field.value=value;field.setAttribute('aria-label',label);wrap.append(field);
  return {wrap,field};
}
function action(doc,label,handler){const button=txt(doc,'button',label);button.type='button';button.addEventListener('click',()=>void handler());return button;}
function section(doc,title){const parent=txt(doc,'section');parent.append(txt(doc,'h2',title));return parent;}
function check(doc,label,checked=false){const wrap=txt(doc,'label');const input=doc.createElement('input');input.type='checkbox';input.checked=checked;wrap.append(input,doc.createTextNode(label));return {wrap,input};}
function safePayload(x){return x && typeof x==='object' && !Array.isArray(x);}
function isValidCampaign(x){
  return safePayload(x) && x.schema===PROVISIONAL_CAMPAIGN_SCHEMA &&
    typeof x.id==='string' && x.id.length>0 && typeof x.title==='string' &&
    Array.isArray(x.characters) && Array.isArray(x.creatures) && Array.isArray(x.scenes) &&
    Number.isSafeInteger(x.revision);
}
async function readFile(file,maxBytes=MAX_PJ_IMPORT_BYTES){
  const label=maxBytes===MAX_BACKUP_BYTES?'16 Mio':'5 Mio';
  if(!file||!Number.isSafeInteger(file.size)||file.size<0||file.size>maxBytes)
    throw Error(`Fichier absent ou trop volumineux (${label})`);
  const bytes=new Uint8Array(await file.arrayBuffer());
  if(bytes.byteLength>maxBytes)throw Error(`Fichier trop volumineux (${label})`);
  return bytes;
}
function getFile(doc,label){const wrap=txt(doc,'label',label+' ');const input=doc.createElement('input');input.type='file';input.accept='.json,application/json';input.setAttribute('aria-label',label);wrap.append(input);return {wrap,input};}
function resolveOptionalService(options, name) {return options[name] && typeof options[name]==='object' ? options[name] : null;}

/**
 * Local Studio DG003. All adapters are injected; no import-time side effects.
 * options: window, storage{load,save,previewRestore,restore,exportPrivate},
 * characterImport{preview,accept}, catalog{resolveCreature}, bestiary{copyCreature},
 * rules{previewM03}, playerOrigin,studioOrigin,playerPath,openWindow.
 * See CONTRACT.md for signatures and ownership boundaries.
 */
export function mountStudio(root,options={}){
  if(!root || typeof root.replaceChildren!=='function')throw new TypeError('Racine DOM requise');
  const doc=root.ownerDocument,view=options.window??doc.defaultView;
  const storage=resolveOptionalService(options,'storage');
  const characterImport=resolveOptionalService(options,'characterImport');
  const catalog=resolveOptionalService(options,'catalog');
  const bestiary=resolveOptionalService(options,'bestiary');
  const rules=resolveOptionalService(options,'rules');
  const playerOrigin=options.playerOrigin??PLAYER_ORIGIN;
  const studioOrigin=options.studioOrigin??STUDIO_ORIGIN;
  const canProject=checkedPlayerOrigins(studioOrigin,playerOrigin)&&view.location.origin===studioOrigin;
  const playerPath=options.playerPath??'/player.html';
  let campaign=null,importPreview=null,restorePreview=null,creatureReference=null;
  let playerWindow=null,channel='',playerReady=false;
  let selection={sceneId:'',shareTitle:false,shareDescription:false,actorIds:[]};
  let expert=false,disposed=false;
  let pendingSave=Promise.resolve(); // Order rapid scene edits and selections before persistence.
  const onWindowMessage=(event)=>{
    if(disposed||!canProject||!playerWindow||event.source!==playerWindow||event.origin!==playerOrigin)return;
    const msg=event.data;
    if(!msg||typeof msg!=='object'||Array.isArray(msg)||msg.kind!==PLAYER_READY||msg.channel!==channel)return;
    playerReady=true;status('Fenêtre joueur connectée sur origine vérifiée. Sélection publique explicite requise.');render();
  };
  view.addEventListener('message',onWindowMessage);
  const statusNode=txt(doc,'p','Studio local — aucun partage activé.');
  statusNode.setAttribute('role','status');statusNode.setAttribute('aria-live','polite');
  const status=(message)=>{statusNode.textContent=message;};
  async function save(){
    if(!campaign)return;
    if(!storage || typeof storage.save!=='function'){status('Sauvegarde indisponible — adaptateur ARCHIVES non connecté.');return;}
    const snapshot=clone(campaign);
    const write=pendingSave.catch(()=>{}).then(()=>storage.save(snapshot));
    pendingSave=write;
    try{await write;status('Modifications sauvegardées localement (adaptateur injecté).');}
    catch{status('Échec de sauvegarde ; exporter en privé avant de quitter.');}
  }
  function requireCampaign(){if(!campaign)throw Error('Créer ou restaurer une campagne');return campaign;}
  function actorSet(){const c=requireCampaign();return [...c.characters,...c.creatures];}
  function touch(){requireCampaign().revision+=1;}
  function clearPlayer(){if(playerWindow&&playerReady&&canProject)playerWindow.postMessage({kind:PLAYER_CLEAR,channel},playerOrigin);}
  function currentScene(){return campaign?.scenes.find(s=>s.id===campaign.activeSceneId)??null;}
  function resetSelection(){selection={sceneId:campaign?.activeSceneId??'',shareTitle:false,shareDescription:false,actorIds:[]};clearPlayer();}
  function createCampaign(name){
    const title=plainText(name.trim(),100);if(!title)throw Error('Nom de campagne requis');
    clearPlayer();campaign={schema:PROVISIONAL_CAMPAIGN_SCHEMA,id:makeId(view),title,
      revision:0,characters:[],creatures:[],scenes:[],activeSceneId:'',extensions:{}};
    importPreview=null;restorePreview=null;creatureReference=null;resetSelection();render();
    root.querySelector('input[aria-label="Fichier PJ v2/v3"]')?.focus();void save();
  }
  async function previewCharacter(bytes,fileName='personnage.json'){
    requireCampaign();if(!characterImport||typeof characterImport.preview!=='function')throw Error('Adaptateur import PJ absent');
    if(!(bytes instanceof Uint8Array)||bytes.byteLength>MAX_PJ_IMPORT_BYTES)throw Error('Import PJ hors limites');
    const pending=await characterImport.preview({bytes,fileName});
    if(!safePayload(pending)||!safePayload(pending.display)||!['v2','v3'].includes(pending.schemaVersion))throw Error('Aperçu PJ invalide');
    importPreview=pending;render();return pending;
  }
  async function acceptCharacter(){
    requireCampaign();if(!importPreview)throw Error('Aucun import PJ prévisualisé');
    if(!characterImport||typeof characterImport.accept!=='function')throw Error('Adaptateur import PJ absent');
    const source=importPreview;
    const accepted=await characterImport.accept(source,{existingIds:actorSet().map(x=>x.id)});
    if(!safePayload(accepted)||typeof accepted.id!=='string'||!accepted.id)throw Error('Copie PJ invalide');
    if(actorSet().some(x=>x.id===accepted.id))throw Error('Identifiant PJ déjà présent');
    campaign.characters.push({id:accepted.id,publicLabel:plainText(source.display.name,120),
      sourceSchema:source.schemaVersion,privateSnapshot:clone(accepted)});
    importPreview=null;touch();render();root.querySelector('input[aria-label="Code ou référence créature"]')?.focus();await save();
  }
  async function previewCreature(reference){
    requireCampaign();if(!catalog||typeof catalog.resolveCreature!=='function')throw Error('Catalogue indisponible');
    const normalized=plainText(reference.trim(),120);if(!normalized)throw Error('Référence requise');
    const source=await catalog.resolveCreature(normalized);
    if(!safePayload(source)||typeof source.documentId!=='string'||typeof source.profileId!=='string'||
      typeof source.ruleset!=='string'||typeof source.name!=='string')throw Error('Référence créature incomplète');
    creatureReference=clone(source);render();return source;
  }
  async function copyCreature(){
    requireCampaign();if(!creatureReference)throw Error('Prévisualiser une référence créature');
    if(!bestiary||typeof bestiary.copyCreature!=='function')throw Error('Adaptateur Bestiaire indisponible');
    const source=clone(creatureReference);
    const instance=await bestiary.copyCreature(clone(source),{existingIds:actorSet().map(x=>x.id)});
    if(!safePayload(instance)||typeof instance.id!=='string'||!instance.id||
      instance.id===source.profileId||instance.id===source.documentId||actorSet().some(x=>x.id===instance.id))
      throw Error('Collision ou copie créature invalide');
    campaign.creatures.push({id:instance.id,publicLabel:plainText(source.name,120),
      source:{documentId:source.documentId,profileId:source.profileId,ruleset:source.ruleset},
      privateSnapshot:clone(instance)});
    creatureReference=null;touch();render();root.querySelector('input[aria-label="Titre de nouvelle scène"]')?.focus();await save();
  }
  function createScene(title,publicDescription='',privateNotes=''){
    const c=requireCampaign(),label=plainText(title.trim(),160);if(!label)throw Error('Titre de scène requis');
    const scene={id:makeId(view),title:label,publicDescription:plainText(publicDescription,2000),
      privateNotes:plainText(privateNotes,4000),participantIds:[]};
    c.scenes.push(scene);c.activeSceneId=scene.id;touch();resetSelection();render();
    root.querySelector('textarea[aria-label="Notes MJ — privées"]')?.focus();void save();
  }
  async function setActiveScene(id){
    const current=requireCampaign();
    if(!current.scenes.some(s=>s.id===id))throw Error('Scène introuvable');
    const changed=current.activeSceneId!==id;
    // Player consent is revoked before any local mutation; never republish.
    resetSelection();
    if(!changed){render();return;}
    if(storage?.beginEdit&&storage?.commitEdit){
      const prior=clone(current);
      await pendingSave; // a failed preceding write is NOT an attested parent
      const ticket=await storage.beginEdit();
      if(ticket.base.id!==prior.id||ticket.base.revision!==prior.revision||
         ticket.base.activeSceneId!==prior.activeSceneId)
        throw Error('Studio scene selection causal parent conflict: reload before editing');
      const saved=await storage.commitEdit(ticket.handle,[{kind:'select-scene',id}]);
      campaign=clone(saved);resetSelection();render();
      status('Scène active sauvegardée sur parent confirmé. Projection révoquée.');
      return;
    }
    current.activeSceneId=id;touch();resetSelection();render();await save();
  }
  async function updateScene(data){
    const scene=currentScene();if(!scene)throw Error('Scène absente');
    const changes={title:plainText(data.title,160),
      publicDescription:plainText(data.publicDescription,2000),
      privateNotes:plainText(data.privateNotes,4000),
      participantIds:Array.isArray(data.participantIds)
       ?[...new Set(data.participantIds)].filter(x=>actorSet().some(a=>a.id===x)):[]
    };
    if(storage?.beginEdit&&storage?.commitEdit){
      const old=clone(requireCampaign()),oldScene=clone(scene);
      // No full snapshot is issued or silently rebased on an editor's last load.
      await pendingSave;
      const ticket=await storage.beginEdit();
      const verified=ticket.base.scenes.find(s=>s.id===oldScene.id);
      if(ticket.base.id!==old.id||ticket.base.revision!==old.revision||
         JSON.stringify(verified)!==JSON.stringify(oldScene))
        throw Error('Studio scene edit causal draft conflict: reload before editing');
      const saved=await storage.commitEdit(ticket.handle,[{kind:'update-scene',id:oldScene.id,changes}]);
      campaign=clone(saved);resetSelection();render();
      status('Scène et notes MJ sauvegardées sur brouillon attesté.');
      return;
    }
    scene.title=changes.title;scene.publicDescription=changes.publicDescription;
    scene.privateNotes=changes.privateNotes;scene.participantIds=changes.participantIds;
    touch();resetSelection();render();await save();
  }
  async function exportPrivate(){
    if(!storage||typeof storage.exportPrivate!=='function')throw Error('Export privé ARCHIVES indisponible');
    const bytes=await storage.exportPrivate(clone(requireCampaign()));
    if(!(bytes instanceof Uint8Array) && !(bytes instanceof Blob) && typeof bytes!=='string')throw Error('Export privé incorrect');
    download(bytes,'CONFIDENTIEL_campagne_studio-dg003.json','application/json');
  }
  async function previewRestoration(bytes){
    if(!storage||typeof storage.previewRestore!=='function')throw Error('Restauration ARCHIVES indisponible');
    if(!(bytes instanceof Uint8Array)||bytes.byteLength>MAX_BACKUP_BYTES)throw Error('Restauration hors limites (16 Mio)');
    const pending=await storage.previewRestore({bytes});
    if(!safePayload(pending)||!safePayload(pending.display))throw Error('Prévisualisation de restauration invalide');
    restorePreview=pending;render();return pending;
  }
  async function acceptRestoration(){
    if(!restorePreview||!storage||typeof storage.restore!=='function')throw Error('Restauration non prévisualisée');
    const restored=await storage.restore(restorePreview,{previous:campaign?clone(campaign):null});
    if(!isValidCampaign(restored))throw Error('Campagne restaurée invalide');
    const old=campaign;clearPlayer();campaign=clone(restored);importPreview=null;restorePreview=null;
    try{if(storage.save)await storage.save(clone(campaign));}
    catch{campaign=old;throw Error('Échec de persistance après restauration');}
    resetSelection();render();status('Campagne restaurée depuis la prévisualisation.');
  }
  function download(data,name,type){
    const blob=data instanceof Blob?data:new Blob([data],{type});
    const url=view.URL.createObjectURL(blob),link=txt(doc,'a');
    link.href=url;link.download=name;link.hidden=true;doc.body.append(link);link.click();link.remove();
    view.setTimeout(()=>view.URL.revokeObjectURL(url),1500);
  }
  function openPlayer(){
    if(!canProject)throw Error('Projection désactivée : origines 127.0.0.1:4173/4174 non vérifiées');
    if(!campaign||!currentScene())throw Error('Créer une scène avant la fenêtre joueur');
    if(typeof view.crypto?.randomUUID!=='function')throw Error('Canal sécurisé indisponible');
    const path=new URL(playerPath,playerOrigin);
    if(path.origin!==playerOrigin)throw Error('URL joueur hors origine autorisée');
    clearPlayer();channel=makeId(view);playerReady=false;
    path.searchParams.set('channel',channel);
    const opener=options.openWindow??((url)=>view.open(url,'cer-dg003-player'));
    playerWindow=opener(path.href);
    if(!playerWindow)throw Error('Fenêtre joueur bloquée par le navigateur');
    render();
  }
  function sendProjection(){
    if(!canProject || !playerWindow || !playerReady)throw Error('Fenêtre joueur non vérifiée');
    if(!currentScene())throw Error('Scène absente');
    const dto=makePlayerProjection(requireCampaign(),selection);
    // The only campaign-derived value ever transferred across origin is this new DTO.
    playerWindow.postMessage({kind:PLAYER_SHOW,channel,projection:dto},playerOrigin);
    status('Projection publique transmise. Aucune donnée MJ privée envoyée.');
    return dto;
  }
  function exportPublic(){
    const dto=makePlayerProjection(requireCampaign(),selection);
    download(JSON.stringify(dto,null,2),'PUBLIC_projection_studio-dg003.json','application/json');return dto;
  }
  async function previewNative(){
    if(!rules||typeof rules.previewM03!=='function'||rules.nativeValidated!==true)
      throw Error('Indisponible — règle/validateur non homologué');
    return rules.previewM03({campaignId:requireCampaign().id,sceneId:currentScene()?.id??null,commit:false});
  }
  function onError(task){return async()=>{try{await task();}catch(e){status(e instanceof Error?e.message:'Action refusée');}};}
  function render(){
    if(disposed)return;
    const main=txt(doc,'main');main.setAttribute('aria-label','Cockpit du Maître de Jeu');
    main.append(txt(doc,'h1','Studio MJ — prototype DG-LOT-003'),statusNode);
    const mode=action(doc,expert?'Mode débutant':'Mode expert',()=>{expert=!expert;render();});main.append(mode);
    const campaigns=section(doc,'1. Campagne locale');
    const name=entry(doc,'Nom de la campagne');name.field.maxLength=100;campaigns.append(name.wrap);
    campaigns.append(action(doc,'Créer campagne',onError(()=>createCampaign(name.field.value))));
    campaigns.append(txt(doc,'p',campaign?`Campagne active : ${campaign.title}`:'Aucune campagne créée.'));
    if(storage&&typeof storage.load==='function')campaigns.append(action(doc,'Recharger campagne',onError(async()=>{
      const saved=await storage.load();if(!isValidCampaign(saved))throw Error('Aucune campagne compatible à recharger');
      clearPlayer();campaign=clone(saved);resetSelection();render();status('Campagne rechargée.');
    })));
    main.append(campaigns);
    if(campaign){
      const persons=section(doc,'2. Import PJ — prévisualisation obligatoire');
      const file=getFile(doc,'Fichier PJ v2/v3');persons.append(file.wrap);
      persons.append(action(doc,'Prévisualiser PJ',onError(async()=>{
        const bytes=await readFile(file.input.files?.[0]);await previewCharacter(bytes,file.input.files[0].name);
      })));
      if(importPreview){persons.append(txt(doc,'p',`À importer : ${plainText(importPreview.display.name,120)} — ${importPreview.schemaVersion} — niveau ${String(importPreview.display.level??'?')}`));
        persons.append(action(doc,'Accepter copie PJ',onError(acceptCharacter)));}
      persons.append(txt(doc,'p',campaign.characters.length?`PJ copiés : ${campaign.characters.map(x=>x.publicLabel).join(', ')}`:'Aucun PJ importé.'));
      main.append(persons);
      const creatures=section(doc,'3. Référence puis copie de créature');
      const ref=entry(doc,'Code ou référence créature');creatures.append(ref.wrap);
      creatures.append(action(doc,'Prévisualiser référence',onError(()=>previewCreature(ref.field.value))));
      if(creatureReference){creatures.append(txt(doc,'p',`${creatureReference.name} — document ${creatureReference.documentId} — profil ${creatureReference.profileId} — ${creatureReference.ruleset}`));
        creatures.append(action(doc,'Créer copie d’instance',onError(copyCreature)));}
      creatures.append(txt(doc,'p',campaign.creatures.length?`Copies : ${campaign.creatures.map(x=>x.publicLabel).join(', ')}`:'Aucune créature en scène.'));
      main.append(creatures);
      const scenes=section(doc,'4. Scènes et notes privées');
      const sceneTitle=entry(doc,'Titre de nouvelle scène');scenes.append(sceneTitle.wrap);
      const publicDescription=entry(doc,'Description destinée à être proposée au public','',true);scenes.append(publicDescription.wrap);
      const privateNotes=entry(doc,'Notes privées MJ','',true);scenes.append(privateNotes.wrap);
      scenes.append(action(doc,'Créer scène',onError(()=>createScene(sceneTitle.field.value,publicDescription.field.value,privateNotes.field.value))));
      const picker=doc.createElement('select');picker.setAttribute('aria-label','Scène active');
      picker.append(doc.createElement('option'));
      for(const s of campaign.scenes){const opt=doc.createElement('option');opt.value=s.id;opt.textContent=s.title;picker.append(opt);}
      picker.value=campaign.activeSceneId;picker.addEventListener('change',onError(()=>setActiveScene(picker.value)));scenes.append(picker);
      const active=currentScene();
      if(active){
        const title=entry(doc,'Titre de la scène',active.title);scenes.append(title.wrap);
        const publicText=entry(doc,'Description publique de la scène',active.publicDescription,true);scenes.append(publicText.wrap);
        const notes=entry(doc,'Notes MJ — privées',active.privateNotes,true);scenes.append(notes.wrap);
        const participation=txt(doc,'fieldset');participation.append(txt(doc,'legend','Participants de cette scène'));
        const members=new Map();
        for(const a of actorSet()){const cb=check(doc,a.publicLabel,active.participantIds.includes(a.id));members.set(a.id,cb.input);participation.append(cb.wrap);}
        participation.append(txt(doc,'p',actorSet().length?'':'Aucun personnage ou adversaire ajouté.'));scenes.append(participation);
        scenes.append(action(doc,'Enregistrer la scène et les notes privées',onError(()=>updateScene({title:title.field.value,publicDescription:publicText.field.value,
          privateNotes:notes.field.value,participantIds:[...members].filter(([,v])=>v.checked).map(([id])=>id)}))));
      }else scenes.append(txt(doc,'p','Aucune scène active.'));
      main.append(scenes);
      const projection=section(doc,'5. Projection publique — consentement explicite');
      if(!canProject)projection.append(txt(doc,'p','Projection désactivée : origine MJ/joueur non vérifiée (127.0.0.1:4173 / 4174).'));
      else projection.append(txt(doc,'p',playerReady?'Fenêtre joueur connectée.':'Fenêtre joueur non connectée.'));
      const shareTitle=check(doc,'Partager le titre de la scène',selection.shareTitle);projection.append(shareTitle.wrap);
      const shareDescription=check(doc,'Partager la description publique',selection.shareDescription);projection.append(shareDescription.wrap);
      const shareActors=new Map();
      if(active){for(const a of actorSet().filter(a=>active.participantIds.includes(a.id))){const checkActor=check(doc,`Afficher ${a.publicLabel}`,selection.actorIds.includes(a.id));projection.append(checkActor.wrap);shareActors.set(a.id,checkActor.input);}}
      const captureSelection=()=>{selection={sceneId:campaign.activeSceneId,shareTitle:shareTitle.input.checked,
        shareDescription:shareDescription.input.checked,actorIds:[...shareActors].filter(([,c])=>c.checked).map(([id])=>id)};};
      projection.append(action(doc,'Prévisualiser sélection publique',onError(()=>{captureSelection();const dto=makePlayerProjection(campaign,selection);
        publicPreview.replaceChildren(txt(doc,'p',dto.scene.title),txt(doc,'p',dto.scene.description),
          ...dto.scene.visibleActors.map(a=>txt(doc,'p',a.label)));})));
      const publicPreview=txt(doc,'div');publicPreview.setAttribute('aria-label','Aperçu public');projection.append(publicPreview);
      const open=action(doc,'Ouvrir la fenêtre joueur',onError(openPlayer));open.disabled=!canProject||!active;projection.append(open);
      const publish=action(doc,'Publier uniquement la sélection',onError(()=>{captureSelection();return sendProjection();}));
      publish.disabled=!canProject||!playerReady||!active;projection.append(publish);
      const savePublic=action(doc,'Exporter projection publique',onError(()=>{captureSelection();return exportPublic();}));savePublic.disabled=!active;projection.append(savePublic);
      main.append(projection);
      const backups=section(doc,'6. Sauvegarde confidentielle / restauration');
      const downloadPrivate=action(doc,'Exporter campagne CONFIDENTIELLE',onError(exportPrivate));
      downloadPrivate.disabled=!storage||typeof storage.exportPrivate!=='function';backups.append(downloadPrivate);
      const restoreInput=getFile(doc,'Fichier de restauration confidentiel');backups.append(restoreInput.wrap);
      backups.append(action(doc,'Prévisualiser restauration',onError(async()=>{const bytes=await readFile(restoreInput.input.files?.[0],MAX_BACKUP_BYTES);await previewRestoration(bytes);})))
      if(restorePreview){backups.append(txt(doc,'p',`Restauration proposée : ${plainText(restorePreview.display.title,100)} (sans mutation)`));
        backups.append(action(doc,'Confirmer restauration',onError(acceptRestoration)));}
      main.append(backups);
    }
    if(expert){const advanced=section(doc,'7. Expert — lecture de règles');
      advanced.append(txt(doc,'p','Indisponible — règle/validateur non homologué pour absorption M03, objet numérique, Autorités 25+, débits mana/charges. Aucune transaction.'));
      const preview=action(doc,'Prévisualiser calcul M03 natif autorisé',onError(async()=>{
        const data=await previewNative();status(`Aperçu natif consulté : ${typeof data?.label==='string'?plainText(data.label,100):'sans mutation'}`);
      }));preview.disabled=!rules||rules.nativeValidated!==true||typeof rules.previewM03!=='function';advanced.append(preview);
      main.append(advanced);
    }
    root.replaceChildren(main);
  }
  render();
  return {getCampaign(){return campaign?clone(campaign):null;},getPublicProjection(){return currentScene()?makePlayerProjection(campaign,selection):null;},
    createCampaign,previewCharacter,acceptCharacter,previewCreature,copyCreature,createScene,setActiveScene,updateScene,
    exportPrivate,previewRestoration,acceptRestoration,openPlayer,sendProjection,exportPublic,previewNative,
    selectPublic(input){selection={sceneId:input.sceneId,shareTitle:input.shareTitle===true,
      shareDescription:input.shareDescription===true,actorIds:Array.isArray(input.actorIds)?[...input.actorIds]:[]};},
    render,dispose(){disposed=true;clearPlayer();view.removeEventListener('message',onWindowMessage);root.replaceChildren();},
    canProject, isPlayerReady(){return playerReady;}};
}
