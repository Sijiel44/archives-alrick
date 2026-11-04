import {studioToArchive,archiveToStudio,creatorToCatalog} from './adapters.mjs';
const MJ='http://127.0.0.1:4173',PLAYER='http://127.0.0.1:4174';
const fail=reason=>{throw Error(reason)};
const clone=x=>structuredClone(x);
function archiveService(owner){
 if(!owner)return null;
 const required=['createCampaign','previewImport','commitImport','exportPrivate','previewRestore','commitRestore','recoverOriginalBytes'];
 if(required.some(name=>typeof owner[name]!=='function'))throw Error('ARCHIVES exports incompatible');
 // Storage API is imported untouched; this adapter owns temporary session persistence.
 const key='cer.dg003.private.campaign.v0';
 return {
 async load(){const raw=localStorage.getItem(key);if(!raw)return null;const parsed=JSON.parse(raw);return archiveToStudio(parsed);},
 async save(studio){const archive=studioToArchive(studio,owner.createCampaign);localStorage.setItem(key,JSON.stringify(archive));},
 async previewRestore({bytes}){const pending=await owner.previewRestore(bytes);return {display:{title:pending?.project?.name??pending?.preview?.name??'Archive privée'},privatePending:pending};},
 async restore(preview,{previous}){const p=owner.commitRestore(preview.privatePending,{existingProject:previous?studioToArchive(previous,owner.createCampaign):null,replace:Boolean(previous)});return archiveToStudio(p);},
 async exportPrivate(studio){const r=await owner.exportPrivate(studioToArchive(studio,owner.createCampaign));if(!r?.confidential||!(r.bytes instanceof Uint8Array))throw Error('Export privé ARCHIVES non confirmé');return r.bytes;},
 get owner(){return owner;}
 };
}
export function mountIntegratedMJ({owners,doc}){
 if(location.origin!==MJ)fail('Origine MJ invalide');
 const slot=doc.getElementById('studio-root'),creatorSlot=doc.getElementById('creators-root');
 if(!owners.studio||typeof owners.studio.mountStudio!=='function')fail('STUDIO.mountStudio non reçu');
 if(!owners.creators||typeof owners.creators.mountCreators!=='function')fail('CREATORS.mountCreators non reçu');
 if(!owners.ports||typeof owners.ports.createPorts!=='function')fail('BUILDER.createPorts non reçu');
 if(!owners.catalog||typeof owners.catalog.createDescriptiveEntry!=='function')fail('INDEX non reçu');
 if(!owners.rules||typeof owners.rules.previewNativeRules!=='function')fail('MATH non reçu');
 const store=archiveService(owners.storage);
 const builder=owners.ports.createPorts({
  rules:{previewNative:async request=>{
    let native;
    if(request.operation==='m03-combat'&&request.input?.kind==='combat')native=owners.rules.previewNativeRules(request.input);
    else if(request.operation==='m01-progression'&&request.input?.kind==='progression')native=owners.rules.previewNativeRules(request.input);
    else return {status:'unavailable',reason:'Opération native non homologuée'};
    return native?.status==='ok'?{status:'ready',value:{source:native.engine,output:native}}:
      {status:'blocked',reason:native?.reason??'Refus MATH'};
  }},
  catalog:{resolve:async ref=>({status:'unavailable',reason:'Résolution de registre non fournie par INDEX'})},
  characters:{preview:async bytes=>({status:'unavailable',reason:'Adaptateur ARCHIVES multifeuille non homologué pour ce port'})},
  bestiary:{readProfile:async ref=>({status:'unavailable',reason:'Fixture BEST sans loader autorisé dans la session intégrée'})}
 });
 let studio;
 const studioOptions={
   window,studioOrigin:MJ,playerOrigin:PLAYER,
   ...(store?{storage:store}:{}),
   characterImport:store?{
     async preview({bytes,fileName}){
       const existing=studio?.getCampaign?.();
       if(!existing)fail('Créer campagne avant import');
       const pending=await owners.storage.previewImport(bytes,studioToArchive(existing,owners.storage.createCampaign),{instancePrefix:'pj-'});
       if(!Array.isArray(pending?.entries)||pending.entries.length!==1)fail('Import multi-fiches : sélection explicite non disponible ; refus sans mutation');
       const entry=pending.entries[0];
       return {schemaVersion:entry.schemaVersion??entry.version??'v3',display:{name:entry.name??fileName,level:entry.level??'?'},privatePending:pending};
     },
     async accept(pending,{existingIds}){
       const existing=studio.getCampaign();
       const next=owners.storage.commitImport(studioToArchive(existing,owners.storage.createCampaign),pending.privatePending);
       const appended=next.characters.filter(x=>!existingIds.includes(x.id));
       if(appended.length!==1)fail('Import : une seule copie attendue');
       const c=appended[0];
       return {id:c.id,sourceId:c.sourceId,source:clone(c.source),sheet:clone(c.sheet)};
     }
   }:undefined,
   catalog:{
     async resolveCreature(reference){
       if(reference!=='fixture-source-001')fail('Référence BEST non homologuée dans cet assemblage : fixture-source-001 uniquement');
       return {documentId:'fixture-source-001',profileId:'fixture-profile-001',ruleset:'m03',name:'Créature témoin N5',level:5};
     }
   },
   bestiary:{
     async copyCreature(source,{existingIds}){
       if(source.profileId!=='fixture-profile-001'||source.documentId!=='fixture-source-001')fail('Profil de fixture inconnu');
       const id=crypto.randomUUID();
       if(existingIds.includes(id))fail('Collision créature');
       return {id,profileId:source.profileId,documentId:source.documentId,ruleset:source.ruleset,level:5,abilities:[]};
     }
   },
   rules:{nativeValidated:true,async previewM03({commit}){
     if(commit!==false)fail('Transaction interdite');
     const r=owners.rules.previewNativeRules({kind:'combat',actor:'pj',combat:{natural:24,rawStat:16,masteryRank:4,situation:0,level:10,difficulty:21,kind:'physique',mode:'melee',feasible:true,baseDamage:6}});
     if(r.status!=='ok'||r.applied!==false)fail(r.reason??'M03 indisponible');
     return {label:'Prévisualisation M03 officielle — aucune application',native:r};
   }}
 };
 studio=owners.studio.mountStudio(slot,studioOptions);
 const creatorOptions={
  onSave:store?async record=>{
    const current=studio.getCampaign();
    if(!current)fail('Créer une campagne avant un atelier');
    const entry=creatorToCatalog(record,owners.catalog,current.id);
    const draft=clone(current);
    draft.extensions ??={};draft.extensions.catalog=[...(draft.extensions.catalog??[]),entry];
    await store.save(draft);
    return {saved:true};
  }:undefined
 };
 owners.creators.mountCreators(creatorSlot,creatorOptions);
 return {studio,ports:builder,storage:store};
}
export function mountIntegratedPlayer({owners,doc}){
 if(location.origin!==PLAYER)fail('Origine joueur invalide');
 if(!owners.player||typeof owners.player.mountPlayer!=='function')fail('STUDIO player missing');
 return owners.player.mountPlayer(doc.getElementById('player-root'),{window,studioOrigin:MJ,playerOrigin:PLAYER});
}
