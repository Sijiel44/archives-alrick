/** DG-LOT-003 MJ composition — temporary, reversible, no simulated persistence or rules. */
import {studioToArchive,archiveToStudio,creatorToCatalog} from './adapters.mjs';
import {createBestiaryCard,validateBestiaryCard} from '../../../quartz/components/scripts/atelier5d6-bestiary-workshop.ts';

const MJ='http://127.0.0.1:4173', PLAYER='http://127.0.0.1:4174';
const STORAGE_KEY='cer.dg003.private.campaign.v0';
const fail=reason=>{throw Error(reason);};
const copy=x=>structuredClone(x);

export function createValidatedStorage(owner,area) {
 if(!owner)return null;
 const methods=['createCampaign','previewImport','commitImport','exportPrivate','previewRestore','commitRestore','recoverOriginalBytes'];
 if(methods.some(k=>typeof owner[k]!=='function'))fail('Interface ARCHIVES incomplète');
 if(!area||typeof area.getItem!=='function'||typeof area.setItem!=='function')fail('Stockage privé navigateur indisponible');
 let queue=Promise.resolve();
 const encoder=new TextEncoder();
 const decoder=new TextDecoder();
 const enqueue=operation=>{
  const pending=queue.then(operation);
  queue=pending.catch(()=>{});
  return pending;
 };
 async function readArchive(){
  const raw=area.getItem(STORAGE_KEY);
  if(raw===null)return null;
  let envelope;
  try{envelope=JSON.parse(raw);}catch{fail('Local private envelope invalid');}
  if(envelope?.kind!=='cer.dg003.local-validated-envelope.v0'||typeof envelope.raw!=='string'||
   !/^[a-f0-9]{64}$/.test(envelope.sha256??''))fail('Local private envelope invalid');
  const bytes=encoder.encode(envelope.raw);
  const preview=await owner.previewRestore(bytes,{expectedSha256:envelope.sha256});
  return await owner.commitRestore(preview,{existingProject:null,replace:false});
 }
 async function readStudio(){
  const archive=await readArchive();
  return archive?archiveToStudio(archive):null;
 }
 async function persist(snapshot){
  const prepared=studioToArchive(snapshot,owner.createCampaign);
  const result=await owner.exportPrivate(prepared);
  if(result?.confidential!==true||!(result.bytes instanceof Uint8Array)||!/^[a-f0-9]{64}$/.test(result.sha256))
   fail('ARCHIVES private export invalid');
  const preview=await owner.previewRestore(result.bytes,{expectedSha256:result.sha256});
  const verified=await owner.commitRestore(preview,{existingProject:null,replace:false});
  if(JSON.stringify(verified)!==JSON.stringify(prepared))fail('ARCHIVES roundtrip mismatch');
  const previous=area.getItem(STORAGE_KEY);
  try{area.setItem(STORAGE_KEY,JSON.stringify({kind:'cer.dg003.local-validated-envelope.v0',sha256:result.sha256,raw:decoder.decode(result.bytes)}));}
  catch(error){if(area.getItem(STORAGE_KEY)!==previous)fail('Private storage write not atomic');throw error;}
  return snapshot;
 }
 function save(studio){return enqueue(async()=>{
  const current=await readStudio();
  const snapshot=copy(studio);
  if(current?.id===snapshot.id){
   snapshot.extensions??={};
   const prior=current.extensions?.catalog??[];
   const incoming=snapshot.extensions.catalog??[];
   const ids=new Set(incoming.map(x=>x.id+'@'+x.version));
   snapshot.extensions.catalog=[...incoming,...prior.filter(x=>!ids.has(x.id+'@'+x.version))];
  }
  await persist(snapshot);
 });}
 return {
  owner,readStudio,readArchive,save,
  async load(){return await readStudio();},
  async previewRestore({bytes}){
   const pending=await owner.previewRestore(bytes);
   if(pending?.kind!=='private-restore-preview')fail('ARCHIVES preview missing');
   return {display:{title:'Campagne privée '+pending.projectId},privatePending:pending};
  },
  async restore(preview,{previous}){
   if(!preview?.privatePending)fail('Restoration preview missing');
   const prior=previous?studioToArchive(previous,owner.createCampaign):null;
   const restored=await owner.commitRestore(preview.privatePending,{existingProject:prior,replace:prior!==null});
   return archiveToStudio(restored);
  },
  async exportPrivate(studio){
   const result=await owner.exportPrivate(studioToArchive(studio,owner.createCampaign));
   if(result?.confidential!==true||!(result.bytes instanceof Uint8Array)||!/^[a-f0-9]{64}$/.test(result.sha256))
    fail('ARCHIVES private export invalid');
   return result.bytes;
  },
  async appendCatalog(studio,entry,validateRegistry){
   return enqueue(async()=>{
    const current=await readStudio();
    const foundation=current?.id===studio.id?current:copy(studio);
    foundation.extensions??={};
    const previous=foundation.extensions.catalog??[];
    const next=[...previous,copy(entry)];
    const valid=validateRegistry(next);
    if(valid?.ok!==true)fail('Catalogue : '+(valid?.errors??[]).join('; '));
    foundation.extensions.catalog=next;
    await persist(foundation);
    return next;
   });
  }
 };
}
function fixtureProfile(){
 const profile=createBestiaryCard(5,'faune','creature','soutien');
 profile.id='fixture-profile-001';
 profile.name='Créature témoin N5';
 profile.abilities=[];
 return validateBestiaryCard(profile);
}
function makeBestiaryAdapter(ports,view){
 const ref={document:null,source:{kind:'source',id:'fixture-source-001',version:'fixture-1'},
  profile:{kind:'profile',id:'fixture-profile-001',ruleset:'m03',schema:'alrick.bestiary.v1'}};
 async function profileLoader(input){
  if(input?.document!==null||input?.source?.id!==ref.source.id||
     input?.source?.version!==ref.source.version||input?.profile?.id!==ref.profile.id||
     input?.profile?.schema!==ref.profile.schema||input?.profile?.ruleset!==ref.profile.ruleset)
    return {status:'unavailable',reason:'Seul le profil fictif source locale est disponible'};
  return {status:'ready',value:{...copy(ref),snapshot:fixtureProfile()}};
 }
 return {ref,profileLoader,async resolve(code){
   if(code!=='fixture-source-001')fail('Source fictive indisponible : saisir fixture-source-001');
   const result=await ports.bestiaryAdapter.readProfile(ref);
   if(result.status!=='ready')fail(result.reason);
   return {documentId:'aucun-document-canonique',profileId:ref.profile.id,ruleset:ref.profile.ruleset,
    sourceId:ref.source.id,name:result.value.snapshot.name,level:result.value.snapshot.level};
 },async copy(source,existingIds,campaignId){
   if(source.profileId!==ref.profile.id||source.sourceId!==ref.source.id)fail('Profil/source inadmissible');
   const id=view.crypto?.randomUUID?.();
   if(!id||existingIds.includes(id))fail('Identifiant créature sécurisé/collision');
   const result=await ports.bestiaryAdapter.makeInstance(ref,{kind:'instance',id,campaignId});
   if(result.status!=='ready')fail(result.reason);
   const validated=validateBestiaryCard(copy(result.value.snapshot));
   validated.id=id;
   return {id,sourceId:ref.source.id,profileId:ref.profile.id,documentId:null,
    ruleset:ref.profile.ruleset,profile:copy(ref.profile),source:copy(ref.source),
    sheet:validateBestiaryCard(validated),instance:copy(result.value.instance)};
 }};
}
export function mountIntegratedMJ({owners,doc}){
 const view=doc.defaultView;
 if(view.location.origin!==MJ)fail('Origine MJ non autorisée');
 for(const [role,method] of [['studio','mountStudio'],['creators','mountCreators'],['ports','createPorts'],
 ['rules','previewNativeRules'],['catalog','createDescriptiveCapability'],['storage','createCampaign']])
  if(typeof owners[role]?.[method]!=='function')fail(role+' non intégré : '+method);
 const store=createValidatedStorage(owners.storage,view.localStorage);
 const rulesAdapter=async request=>{
  if(!['m03-combat','m01-progression'].includes(request.operation))
   return {status:'unavailable',reason:'Famille native non homologuée'};
  if(request.input?.kind!==(request.operation==='m03-combat'?'combat':'progression'))
   return {status:'invalid',reason:'Famille native/port divergente'};
  const result=owners.rules.previewNativeRules(request.input);
  return result.status==='ok'
   ?{status:'ready',value:{source:result.engine,output:result}}
   :{status:result.status==='unavailable'?'unavailable':'blocked',reason:result.reason};
 };
 let bestiary;
 const ports=owners.ports.createPorts({
  rules:{previewNative:rulesAdapter},
  catalog:{resolve:async()=>({status:'unavailable',reason:'Aucun registre mécanique publié pour cette fixture'})},
  characters:{preview:async()=>({status:'unavailable',reason:'L import multi-fiche exige sélection explicite; utiliser le flux ARCHIVES Studio'})},
  bestiary:{readProfile:async ref=>bestiary.profileLoader(ref)}
 });
 bestiary=makeBestiaryAdapter(ports,view);
 const options={
  window:view,studioOrigin:MJ,playerOrigin:PLAYER,storage:store,
  characterImport:{
   async preview({bytes}){
    const campaign=studio?.getCampaign();
    if(!campaign)fail('Créer campagne avant import');
    const pending=await owners.storage.previewImport(bytes,studioToArchive(campaign,owners.storage.createCampaign),{instancePrefix:'pj'});
    if(!Array.isArray(pending.entries)||pending.entries.length!==1)
      fail('Import multi-fiches refusé : une sélection explicite est nécessaire (aucune mutation)');
    const entry=pending.entries[0];
    const schema=pending.source?.schema==='alrick.sheets.v2'?'v2':pending.source?.schema==='alrick.sheets.v3'?'v3':null;
    if(!schema)fail('Schéma historique non reconnu');
    return {schemaVersion:schema,display:{name:entry.name||entry.sourceId,level:'brut — non interprété'},
      privatePending:pending};
   },
   async accept(preview,{existingIds}){
    if(!preview?.privatePending)fail('Aperçu PJ absent');
    const campaign=studio?.getCampaign();if(!campaign)fail('Campagne absente');
    const before=studioToArchive(campaign,owners.storage.createCampaign);
    const after=await owners.storage.commitImport(before,preview.privatePending);
    const added=after.characters.filter(c=>!existingIds.includes(c.id));
    if(added.length!==1)fail('Import attendu : une seule fiche');
    return copy(added[0]);
   }
  },
  catalog:{resolveCreature:code=>bestiary.resolve(code)},
  bestiary:{copyCreature:(source,{existingIds})=>{
   const campaign=studio?.getCampaign();
   if(!campaign)fail('Campagne requise');
   return bestiary.copy(source,existingIds,campaign.id);
  }},
  rules:{
   nativeValidated:true,
   async previewM03({commit}){
    if(commit!==false)fail('Mutation native interdite');
    const result=await ports.rulesGateway.preview({operation:'m03-combat',ruleset:'m03',
      input:{kind:'combat',actor:'pj',combat:{natural:24,rawStat:16,masteryRank:4,situation:0,level:10,
       difficulty:21,kind:'physique',mode:'melee',feasible:true,baseDamage:6}}});
    if(result.status!=='ready')fail(result.reason);
    if(result.value.output.applied!==false)fail('Prévisualisation non pure');
    return {label:'M03 natif sur profil fictif — aucun débit ni effet appliqué',native:result.value.output};
   }
  }
 };
 let studio=owners.studio.mountStudio(doc.getElementById('studio-root'),options);
 const catalogRoot=doc.getElementById('catalog-saved');
 const renderEntries=(list)=>{
  if(!catalogRoot)return;
  catalogRoot.replaceChildren();
  for(const item of list){
   const p=doc.createElement('p');
   p.textContent=item.name+' · '+item.entryType+' · '+item.version+' (descriptif, non exécutable)';
   catalogRoot.append(p);
  }
 };
 const creator=owners.creators.mountCreators(doc.getElementById('creators-root'),{
  injectStyles:false,
  onSave:async record=>{
   const campaign=studio.getCampaign();
   if(!campaign)fail('Créer une campagne avant une fiche descriptive');
   const entry=creatorToCatalog(record,owners.catalog,campaign.id);
   const list=await store.appendCatalog(campaign,entry,owners.catalog.validateCatalogRegistry);
   renderEntries(list);
   return {saved:true};
  }
 });
 void store.readStudio().then(saved=>renderEntries(saved?.extensions?.catalog??[])).catch(()=>renderEntries([]));
 return {studio,creator,ports,store};
}
