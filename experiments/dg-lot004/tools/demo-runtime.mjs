/** DG004 integration-only adapter: owner's STUDIO demo on real L003 ARCHIVES/ports. */
import {mountStudioDemo} from '../src/studio/demo.mjs';
import {DEMO_MARKER} from '../src/studio/demo-storage.mjs';
import {mountCreatorCycle} from '../src/creators/cycle-ui.mjs';
import {createBrowserCyclePersistence} from '../src/creators/cycle-state.mjs';
import * as indexL004 from '../src/catalog/index.mjs';
import {createXpDecisionLedger,suggestXpFromM01} from '../math-xp/src/xp-decision.ts';
import {experienceAward} from '../../../quartz/components/scripts/atelier5d6-progression.ts';
import {createValidatedStorage} from '../../dg-lot003/tools/runtime.mjs';
import {studioToArchive,creatorToCatalog} from '../../dg-lot003/tools/adapters.mjs';
import {createBestiaryCard,validateBestiaryCard} from '../../../quartz/components/scripts/atelier5d6-bestiary-workshop.ts';
const SOURCE_CODE='fixture-source-001';
const fail=x=>{throw Error(x);};
const copy=value=>structuredClone(value);
export function mountIntegratedOwnerDemo({owners,doc}){
 const view=doc.defaultView;
 if(view.location.origin!=='http://127.0.0.1:4173'||view.location.pathname!=='/dg004-demo.html')
  fail('Mode STUDIO propriétaire limité au chemin MJ loopback');
 for(const [key,method] of [['studio','mountStudio'],['storage','createCampaign'],['ports','createPorts'],
  ['catalog','validateCatalogRegistry'],['creators','mountCreators']])
  if(typeof owners[key]?.[method]!=='function')fail('Port propriétaire absent: '+key+'.'+method);
 const ref={document:null,source:{kind:'source',id:SOURCE_CODE,version:'fixture-1'},
  profile:{kind:'profile',id:'fixture-profile-001',ruleset:'m03',schema:'alrick.bestiary.v1'}};
 const profile=()=>{const value=createBestiaryCard(5,'faune','creature','soutien');
  value.id=ref.profile.id;value.name='Créature témoin N5';value.abilities=[];
  return validateBestiaryCard(value);};
 const port=owners.ports.createPorts({
  rules:{previewNative:async()=>({status:'unavailable',reason:'Aucune exécution numérique en démonstration'})},
  catalog:{resolve:async()=>({status:'unavailable',reason:'Contrat descriptif seulement'})},
  characters:{preview:async()=>({status:'unavailable',reason:'Import v3 par ARCHIVES uniquement'})},
  bestiary:{readProfile:async request=>{
   if(request?.document!==null||request?.source?.id!==ref.source.id||request?.profile?.id!==ref.profile.id||
     request?.source?.version!==ref.source.version||request?.profile?.schema!==ref.profile.schema||
     request?.profile?.ruleset!==ref.profile.ruleset)
    return {status:'unavailable',reason:'Profil fictif seul'};
   return {status:'ready',value:{...copy(ref),snapshot:profile()}};
  }}
 });
 function createDemoAdapters({getCampaign,storage}){
  const current=()=>{const campaign=getCampaign();if(!campaign)fail('Créer campagne fictive');return campaign;};
  return {
   characterImport:{
    async preview({bytes}){
     const campaign=current();
     const pending=await owners.storage.previewImport(bytes,
      studioToArchive(campaign,owners.storage.createCampaign),{instancePrefix:'pj'});
     if(pending?.entries?.length!==1)fail('Sélection PJ unique requise');
     const entry=pending.entries[0],schema=pending.source?.schema;
     if(schema!=='alrick.sheets.v3')fail('La démo exige une source PJ v3 fictive');
     return {schemaVersion:'v3',display:{name:entry.name||entry.sourceId,level:'brut — non interprété'},privatePending:pending};
    },
    async accept(preview,{existingIds}){
     const before=studioToArchive(current(),owners.storage.createCampaign);
     const after=await owners.storage.commitImport(before,preview.privatePending);
     const added=after.characters.filter(x=>!existingIds.includes(x.id));
     if(added.length!==1)fail('Une seule copie PJ attendue');
     return copy(added[0]);
    }
   },
   catalog:{async resolveCreature(code){
    if(code!==SOURCE_CODE)fail('Créature fictive inconnue');
    const result=await port.bestiaryAdapter.readProfile(ref);
    if(result.status!=='ready')fail(result.reason);
    return {documentId:'aucun-document-canonique',profileId:ref.profile.id,
     ruleset:ref.profile.ruleset,sourceId:ref.source.id,name:result.value.snapshot.name,
     level:result.value.snapshot.level};
   }},
   bestiary:{async copyCreature(source,{existingIds}){
    if(source.profileId!==ref.profile.id||source.sourceId!==ref.source.id)fail('Profil fictif inadmissible');
    const id=view.crypto?.randomUUID?.();
    if(!id||existingIds.includes(id))fail('Identifiant créature indisponible');
    const result=await port.bestiaryAdapter.makeInstance(ref,{kind:'instance',id,campaignId:current().id});
    if(result.status!=='ready')fail(result.reason);
    const sheet=validateBestiaryCard(copy(result.value.snapshot));sheet.id=id;
    return {id,sourceId:ref.source.id,profileId:ref.profile.id,documentId:null,
     ruleset:ref.profile.ruleset,profile:copy(ref.profile),source:copy(ref.source),
     sheet:validateBestiaryCard(sheet),instance:copy(result.value.instance)};
   }},
   async creatorSave(record,snapshot,store){
    const currentCampaign=current();
    if(currentCampaign.id!==snapshot.id)fail('Campagne démo modifiée pendant sauvegarde');
    const entry=creatorToCatalog(record,owners.catalog,currentCampaign.id);
    const list=await store.appendCatalog(currentCampaign,entry,owners.catalog.validateCatalogRegistry,record);
    if(!Array.isArray(list)||!list.some(x=>x.id===entry.id))fail('Catalogue descriptif non persisté');
    return {saved:true};
   }
  };
 }
 const root=doc.getElementById('dg004-demo-root');
 const demo=mountStudioDemo(root,{
  window:view,
  storageFactory:area=>createValidatedStorage(owners.storage,area,{indexedDB:null}),
  createDemoAdapters,
  playerPath:'/player.html',
  injectCreatorStyles:false
 });
 const cycleRoot=doc.getElementById('dg004-cycle-root');
 if(!cycleRoot)fail('Zone ATELIERS privée DG004 absente');
 const cycleKey='cer.dg004.creators.private.demo.v0';
 const browserPersistence=createBrowserCyclePersistence({
  storage:view.localStorage,key:cycleKey,origin:view.location.origin
 });
 const cycle=mountCreatorCycle(cycleRoot,{
  mountCreators:owners.creators.mountCreators,
  validateCreatorDraft:owners.creators.validateCreatorDraft,
  catalogBridge:creatorToCatalog,catalog:owners.catalog,indexChain:indexL004,
  studio:demo.studio,persistence:browserPersistence,
  idFactory:()=>view.crypto.randomUUID(),
  injectStyles:false
 });
 void cycle.ready;
 const xpRoot=doc.getElementById('dg004-xp-preview');
 if(!xpRoot)fail('Zone XP fictive lecture seule absente');
 const xpHeading=doc.createElement('h2');xpHeading.textContent='XP M01 — suggestion fictive, aucun crédit';
 const xpButton=doc.createElement('button');xpButton.type='button';xpButton.textContent='Prévisualiser XP fictifs (sans attribution)';
 const xpStatus=doc.createElement('p');xpStatus.setAttribute('role','status');xpStatus.setAttribute('aria-live','polite');
 xpStatus.textContent='Aucun calcul ni attribution sans action explicite.';
 xpRoot.replaceChildren(xpHeading,xpButton,xpStatus);
 xpButton.addEventListener('click',()=>{
  try{
   const campaign=demo.studio.getCampaign();
   if(!campaign?.characters?.length)fail('Un PJ fictif doit être importé dans STUDIO');
   const id=campaign.characters[0].id;
   const ledger=createXpDecisionLedger({campaignId:campaign.id,characterId:id,initialLevel:5,
    initialXp:0,sessionMode:'campagne',characterOrigin:'import',paceNote:'libre'});
   const raw={id:'evt-demo-m01-l004',pattern:'exploration-fictive',
    domain:'exploration',difficulty:3,scope:'ordinaire',approved:false};
   const native=suggestXpFromM01(ledger,raw);
   const suggestion=indexL004.createXpSuggestion({
    namespace:'demo',version:'0.1.0',
    target:{campaignId:campaign.id,characterInstanceId:id},
    event:{id:raw.id,pattern:raw.pattern,domain:raw.domain,difficulty:raw.difficulty,scope:raw.scope},
    context:{initialLevel:5},provenance:{originKind:'illustrative',sourceSchema:'cer.dg004.fake.xp',
     sourceId:'event-demo-l004',sourceVersion:'1'},
    rationale:'Exploration fictive ; aucune récompense créditée'
   });
   if(!suggestion.ok||native.status!=='suggested')fail('Contrat MATH/INDEX refusé');
   const indexPreview=indexL004.previewXpSuggestion(suggestion.suggestion,{experienceAward,history:[]});
   if(!indexPreview.ok||indexPreview.candidateXp!==native.nativeSuggestedXp||
      indexPreview.awardCommitted!==false||indexPreview.levelValidated!==false)
    fail('Parité MATH/INDEX/M01 non établie');
   xpStatus.textContent='DG004_XP_PREVIEW_OK : '+native.nativeSuggestedXp+
    ' XP suggérés par M01 uniquement ; non appliqués, aucun niveau modifié.';
  }catch(error){xpStatus.textContent='DG004_XP_UNAVAILABLE : '+error.message;}
 });
 const label=doc.getElementById('status');
 if(label)label.textContent='STUDIO DG004 propriétaire monté — fictif et local, sans partage automatique.';
 const exit=doc.getElementById('dg004-exit');
 if(!exit)fail('Sortie contrôlée DG004 absente');
 let closing=false;
 exit.addEventListener('click',async()=>{
  if(closing)return;closing=true;exit.disabled=true;
  try{
   // The stored project carries the owner's verified fictional tag. A non-demo
   // archive is never deleted and the original MJ namespace is never written.
   const stored=await demo.storage.load();
   if(stored?.extensions?.__dg004_fictional_demo!==DEMO_MARKER)
    fail('Refus de nettoyage : projet DEMO non attesté');
   const privateBefore=view.localStorage.getItem('cer.dg003.private.campaign.v0');
   demo.dispose(); // Sends PLAYER_CLEAR when the validated player is connected.
   demo.area.removeItem('cer.dg003.private.campaign.v0');
   demo.area.removeItem('approved-backup-sha256');
   view.localStorage.removeItem(cycleKey);
   cycle.destroy();
   if(demo.area.getItem('cer.dg003.private.campaign.v0')!==null||
      view.localStorage.getItem('cer.dg003.private.campaign.v0')!==privateBefore)
    fail('Retour arrière non confirmé ou espace MJ altéré');
   if(label)label.textContent='DG004_OWNER_CLEARED : données fictives effacées, campagne MJ historique intacte.';
  }catch(error){if(label)label.textContent='DG004_OWNER_CLEAR_BLOCKED : '+error.message;}
  finally{closing=false;exit.disabled=false;}
 });
 return demo;
}
