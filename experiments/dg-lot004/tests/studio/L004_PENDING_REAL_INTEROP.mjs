/** Run ONLY on the L004 integration checkout after copying ATELIERS #100 source.
 * node --test experiments/dg-lot004/tests/studio/L004_PENDING_REAL_INTEROP.mjs
 * Intentionally requires real ARCHIVES & real ATELIERS modules. Missing source is a FAIL.
 * STUDIO port is an explicit in-memory adapter with persistence through native ARCHIVES;
 * this is NOT a browser, DOM, or 4173/4174 E2E certification.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {createCreatorCycle} from '../../src/creators/cycle-state.mjs';
import {createCampaign,exportPrivate,previewRestore,commitRestore} from '../../../dg-lot003/src/storage/storage.mjs';
import {studioToArchive,archiveToStudio} from '../../../dg-lot003/tools/adapters.mjs';
import {inspectCreatorAttachment,confirmCreatorAttachmentWithEvidence}
  from '../../src/studio/reconcile.mjs';
const copy=structuredClone;
const SOURCE={documentId:'DOC-L004-TEST',profileId:'PROFILE-L004-N5',ruleset:'m03'};
const PRIVATE='CANARI_MJ_L004_CROSS_STORE';
function project(){return {schema:'cer.studio.dg003.provisional.v0',id:'campaign-l004-cross-store',
 title:'Démonstration strictement fictive',revision:0,characters:[],creatures:[],scenes:[],
 activeSceneId:'',extensions:{},privateNotes:[]};}
async function harness(){
 let live=project(),nativeBytes=null,creatorState=null,failStage=null,failFinal=null;
 let copyCalls=0,sceneCalls=0;
 async function persistStudio(){
  const archive=studioToArchive(live,createCampaign);
  const native=await exportPrivate(archive);
  const preview=await previewRestore(native.bytes,{expectedSha256:native.sha256});
  await commitRestore(preview,{existingProject:null,replace:false});
  nativeBytes=native.bytes;
 }
 await persistStudio();
 const studioStorage={async load(){if(nativeBytes===null)return null;
   const parsed=await previewRestore(nativeBytes);
   return archiveToStudio(await commitRestore(parsed,{existingProject:null,replace:false}));
 }};
 const studio={getCampaign(){return copy(live)},
  async previewCreature(){return {...copy(SOURCE),name:'Créature fictive N5'}},
  async copyCreature(){copyCalls++;live.creatures.push({id:'creature-l004-'+copyCalls,
    publicLabel:'Créature fictive N5',source:copy(SOURCE),privateSnapshot:{secret:PRIVATE}});
    live.revision++;await persistStudio();},
  async createScene(title,publicDescription,privateNotes){sceneCalls++;
    const id='scene-l004-'+sceneCalls;live.scenes.push({id,title,publicDescription,privateNotes,participantIds:[]});
    live.activeSceneId=id;live.revision++;await persistStudio();},
  async updateScene(data){const current=live.scenes.find(x=>x.id===live.activeSceneId);
    Object.assign(current,data);live.revision++;await persistStudio();}};
 const creatorPersistence={async load(){return creatorState===null?null:copy(creatorState)},
 async save(snapshot){
  if(failStage&&snapshot.extensions.pendingStudioOp?.kind===failStage&&!snapshot.links.sceneId&&
    (failStage!=='creature'||!snapshot.links.creatureInstanceId))throw Error('journal-before-action rejected');
  if(failFinal==='creature'&&snapshot.links.creatureInstanceId)throw Error('creator ACK after creature refused');
  if(failFinal==='scene'&&snapshot.links.sceneId)throw Error('creator ACK after scene refused');
  creatorState=copy(snapshot);return {saved:true};
 }};
 const validator=x=>({valid:true,record:copy(x),errors:{}});
 const creators=createCreatorCycle({persistence:creatorPersistence,studio,
   loadPersistedStudio:()=>studioStorage.load(),inspectCreatorAttachment,
   creatorValidator:validator,catalogBridge:x=>({id:'cap:local:'+x.kind,executable:false}),catalog:{},
   idFactory:()=> 'cycle-fixture-001'});
 const fixture={
  item:{kind:'item',name:'Lanterne fictive',provenance:'Exemple L004',version:'0.1.0',
   description:'Objet narratif sans propriété numérique.',limitations:'Effets déterminés par le récit.'},
  capacity:{kind:'capacity',name:'Éclat descriptif',provenance:'Exemple L004',version:'0.1.0',
   description:'Capacité fictive sans calcul de puissance.',limitations:'Purement narrative.'},
  creature:{name:'Créature fictive N5',provenance:'Exemple L004',version:'0.1.0',
   description:'Silhouette décrite à la table seulement.',limitations:'Aucun score autorisé.',
   sourceReference:'fixture-source-001'},
  scene:{name:'Scène L004',title:'Le pont des deux rives',provenance:'Exemple L004',version:'0.1.0',
   description:'Découverte narrative sans intervention automatique.',limitations:'Décision MJ.',
   publicDescription:'Une lampe s allume sur le pont.',privateNotes:PRIVATE},
 };
 async function prepareCreature(){for(const step of ['item','capacity','creature']){
   await creators.saveDraft(step,fixture[step]);await creators.validateMJ(step);
 }}
 return {studio,studioStorage,creators,creatorPersistence,fixture,prepareCreature,
   setStage:x=>failStage=x,setFinal:x=>failFinal=x,copyCalls:()=>copyCalls,sceneCalls:()=>sceneCalls,
   getCycle:()=>copy(creatorState)};
}
test('REAL-01: JOURNAL BEFORE STUDIO — no actor after rejected journal',async()=>{
 const h=await harness();await h.prepareCreature();h.setStage('creature');
 await assert.rejects(h.creators.attachCreature(),/journal-before-action/);
 assert.equal(h.copyCalls(),0);assert.equal(h.getCycle().extensions.pendingStudioOp,undefined);
});
test('REAL-02: AFTER COPY failure — same ID after explicit MJ confirmation, real ARCHIVES',async()=>{
 const h=await harness();await h.prepareCreature();h.setFinal('creature');
 await assert.rejects(h.creators.attachCreature(),/ACK/);
 const pending=h.getCycle();assert.equal(pending.extensions.pendingStudioOp.kind,'creature');
 assert.equal(h.copyCalls(),1);assert.equal(h.creators.getStudioRecovery().status,'durability-unverified');
 const proven=await h.creators.inspectStudioRecovery();
 assert.equal(proven.status,'requires-confirmation');assert.equal(proven.durableVerified,true);
 assert.deepEqual(proven.candidates,[{id:'creature-l004-1'}]);
 const plan=inspectCreatorAttachment({campaign:h.studio.getCampaign(),persistedCampaign:await h.studioStorage.load(),
   cycle:h.creators.getState(),persistedCycle:await h.creatorPersistence.load()});
 assert.equal(plan.creature.status,'reusable');assert.equal(plan.action,'link-existing-after-MJ-confirmation');
 h.setFinal(null);
 const result=await confirmCreatorAttachmentWithEvidence({creator:h.creators,studio:h.studio,
   creatorPersistence:h.creatorPersistence,studioStorage:h.studioStorage,
   instanceId:plan.creature.id,confirm:true});
 assert.equal(result.status,'linked');assert.equal(h.copyCalls(),1);
 await assert.rejects(h.creators.attachCreature(),/déjà liée/);
});
test('REAL-03: AFTER SCENE failure — no second scene, private notes stay private',async()=>{
 const h=await harness();await h.prepareCreature();await h.creators.attachCreature();
 await h.creators.saveDraft('scene',h.fixture.scene);await h.creators.validateMJ('scene');
 h.setFinal('scene');await assert.rejects(h.creators.attachScene(),/ACK/);
 const durable=await h.creators.inspectStudioRecovery();
 assert.equal(durable.durableVerified,true);assert.deepEqual(durable.candidates,[{id:'scene-l004-1'}]);
 const plan=inspectCreatorAttachment({campaign:h.studio.getCampaign(),persistedCampaign:await h.studioStorage.load(),
   cycle:h.creators.getState(),persistedCycle:await h.creatorPersistence.load()});
 assert.equal(plan.scene.status,'reusable');assert.equal(h.sceneCalls(),1);
 assert.doesNotMatch(JSON.stringify(plan),/CANARI_MJ/);
 h.setFinal(null);
 const result=await confirmCreatorAttachmentWithEvidence({creator:h.creators,studio:h.studio,
  creatorPersistence:h.creatorPersistence,studioStorage:h.studioStorage,
  instanceId:plan.scene.id,confirm:true});
 assert.equal(result.status,'linked');assert.equal(h.sceneCalls(),1);
 await assert.rejects(h.creators.attachScene(),/déjà liée/);
});
test('REAL-04: obsolete creator backup lacking journal cannot claim a previous instance',async()=>{
 const h=await harness();await h.prepareCreature();await h.creators.attachCreature();
 const old=h.creators.getState();delete old.extensions.pendingStudioOp;
 old.links.creatureInstanceId=null;
 const plan=inspectCreatorAttachment({campaign:h.studio.getCampaign(),persistedCampaign:await h.studioStorage.load(),
  cycle:old,persistedCycle:old});
 assert.equal(plan.creature.status,'unattestable');assert.equal(plan.action,'block-automatic-retry');
});

// Deliberately exercise the real ATELIERS recovery API, not the synchronous hint.
test('REAL-05: asynchronous durability port missing is a hard refusal',async()=>{
 const h=await harness();await h.prepareCreature();h.setFinal('creature');
 await assert.rejects(h.creators.attachCreature(),/ACK/);h.setFinal(null);
 const fake={...h.creators,inspectStudioRecovery:undefined,
  getStudioRecovery:()=>({status:'requires-confirmation',candidates:[{id:'creature-l004-1'}]})};
 await assert.rejects(confirmCreatorAttachmentWithEvidence({creator:fake,studio:h.studio,
  creatorPersistence:h.creatorPersistence,studioStorage:h.studioStorage,
  instanceId:'creature-l004-1',confirm:true}),/Ports de réconciliation/);
 assert.equal(h.copyCalls(),1);
});
test('REAL-06: durableVerified false blocks even if status and ID appear valid',async()=>{
 const h=await harness();await h.prepareCreature();h.setFinal('creature');
 await assert.rejects(h.creators.attachCreature(),/ACK/);h.setFinal(null);
 const source=h.creators.inspectStudioRecovery.bind(h.creators);
 const fake={...h.creators,inspectStudioRecovery:async()=>({...await source(),durableVerified:false})};
 await assert.rejects(confirmCreatorAttachmentWithEvidence({creator:fake,studio:h.studio,
  creatorPersistence:h.creatorPersistence,studioStorage:h.studioStorage,
  instanceId:'creature-l004-1',confirm:true}),/Journal ATELIERS discordant/);
 assert.equal(h.copyCalls(),1);
});
test('REAL-07: wrong candidate from async recovery blocks before committing',async()=>{
 const h=await harness();await h.prepareCreature();h.setFinal('creature');
 await assert.rejects(h.creators.attachCreature(),/ACK/);h.setFinal(null);
 const source=h.creators.inspectStudioRecovery.bind(h.creators);
 const fake={...h.creators,inspectStudioRecovery:async()=>({...await source(),candidates:[{id:'alien'}]})};
 await assert.rejects(confirmCreatorAttachmentWithEvidence({creator:fake,studio:h.studio,
  creatorPersistence:h.creatorPersistence,studioStorage:h.studioStorage,
  instanceId:'creature-l004-1',confirm:true}),/Journal ATELIERS discordant/);
 assert.equal(h.copyCalls(),1);
});
