/** L004-REPAIR: real STUDIO reconciliation code; fake persistence/DOM are intentional boundary probes.
 * No substitute ARCHIVES parser, no 5d6 calculations, no browser qualification claimed.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {
  inspectDemoFootprints,inspectCreatorAttachment,inspectCreatorRecord,
  persistentCreatorRecords,saveCreatorWithReconciliation,
  DEMO_CREATURE_SOURCE,DEMO_CREATURE_PROFILE,DEMO_SCENE_TITLE,DEMO_SCENE_DESCRIPTION,DEMO_PRIVATE_NOTE
} from '../../src/studio/reconcile.mjs';
import {mountStudioDemo} from '../../src/studio/demo.mjs';
import {DEMO_MARKER} from '../../src/studio/demo-storage.mjs';
import {PLAYER_READY,PLAYER_CLEAR,PLAYER_SHOW,PLAYER_ORIGIN,STUDIO_ORIGIN} from '../../../dg-lot003/src/studio/projection.mjs';

const clone=x=>structuredClone(x);
const draft=(kind,name)=>({kind,name,version:'0.0.1',provenance:'L004 test indépendant',
 description:'Exemple de description purement narrative sans règle',limitations:'Aucun effet numérique',schema:'cer.creator.dg003.descriptive.v0'});
const creature=(id='creature-01')=>({id,publicLabel:'Créature témoin N5',source:{documentId:'aucun-document-canonique',profileId:DEMO_CREATURE_PROFILE,ruleset:'m03'},
 privateSnapshot:{id,sourceId:DEMO_CREATURE_SOURCE,profileId:DEMO_CREATURE_PROFILE,secret:'CANARI_MJ_01'}});
const scene=(id='scene-01',participants=['creature-01'])=>({id,title:DEMO_SCENE_TITLE,publicDescription:DEMO_SCENE_DESCRIPTION,
 privateNotes:DEMO_PRIVATE_NOTE,participantIds:participants});
function campaign({creatures=[creature()],scenes=[scene()]}={}){return {schema:'cer.studio.dg003.provisional.v0',id:'demo-repair-1',
 title:'Reproduction fictive',revision:4,characters:[],creatures,scenes,activeSceneId:scenes.at(-1)?.id??'',
 extensions:{__dg004_fictional_demo:DEMO_MARKER}};}
function cycle(kind='creature'){
 return {schema:'cer.creators.dg004.private.v0',id:'cycle-repair-01',revision:8,
   drafts:{creature:{sourceReference:DEMO_CREATURE_SOURCE},scene:{title:DEMO_SCENE_TITLE,
     publicDescription:DEMO_SCENE_DESCRIPTION,privateNotes:DEMO_PRIVATE_NOTE}},
   links:{creatureInstanceId:kind==='scene'?'creature-01':null,sceneId:null},
   extensions:{pendingStudioOp:kind==='creature'?{kind,campaignId:'demo-repair-1',beforeIds:[],
     source:{documentId:'aucun-document-canonique',profileId:DEMO_CREATURE_PROFILE,ruleset:'m03'}}:
     {kind,campaignId:'demo-repair-1',beforeIds:[]}}};
}
function inspectWithJournal(c,p,kind='creature',options={}){
 const cy=cycle(kind);return inspectCreatorAttachment({campaign:c,persistedCampaign:p,cycle:cy,persistedCycle:clone(cy),...options});
}
function recordState(records=[]){const c=campaign();c.extensions.creatorDrafts=records.map(original=>({original:clone(original)}));return c;}

// Pure reconciliation: neither function calls a service, changes an ID, nor copies notes into its return value.
test('REPAIR-01: failed creator link write after creature+scene persisted returns existing IDs',()=>{
 const c=campaign(),p=clone(c),before=JSON.stringify(c);
 const result=inspectWithJournal(c,p);
 assert.equal(result.action,'link-existing-after-MJ-confirmation');
 assert.equal(result.creature.id,'creature-01');assert.equal(result.scene.id,null);
 assert.equal(result.creature.status,'reusable');assert.equal(result.scene.status,'not-targeted');
 assert.equal(JSON.stringify(c),before);assert.doesNotMatch(JSON.stringify(result),/CANARI|SENTINELLE|privateNotes/);
});
test('REPAIR-02: scene write persisted but creator link write failed, no second scene required',()=>{
 const c=campaign();const outcome=inspectDemoFootprints(c,{persistedCampaign:clone(c)});
 assert.equal(outcome.creature.status,'reusable');assert.equal(outcome.scene.status,'reusable');
 assert.deepEqual([outcome.creature.id,outcome.scene.id],['creature-01','scene-01']);
});
test('REPAIR-03: after browser reload the same persisted identities are still reconciled',()=>{
 const saved=clone(campaign()),reloaded=clone(saved);
 assert.equal(inspectWithJournal(reloaded,saved).action,'link-existing-after-MJ-confirmation');
});
test('REPAIR-04: in-memory-only copy not marked persisted; do not link automatically',()=>{
 const live=campaign(),disk=campaign({creatures:[],scenes:[]});
 const x=inspectWithJournal(live,disk);
 assert.equal(x.creature.status,'unpersisted');assert.equal(x.scene.status,'not-targeted');
 assert.equal(x.action,'block-automatic-retry');
});
test('REPAIR-05: same source twice => ambiguous rather than arbitrary first/last',()=>{
 const c=campaign({creatures:[creature('creature-01'),creature('creature-02')],scenes:[]});
 assert.equal(inspectWithJournal(c,clone(c)).creature.status,'ambiguous');
 assert.equal(inspectDemoFootprints(c,{persistedCampaign:clone(c)}).creature.status,'ambiguous');
});
test('REPAIR-06: same scene title twice => no silent reconciliation',()=>{
 const c=campaign({scenes:[scene('scene-01'),scene('scene-02')]});
 assert.equal(inspectWithJournal(c,clone(c),'scene').scene.status,'ambiguous');
 assert.equal(inspectDemoFootprints(c,{persistedCampaign:clone(c)}).scene.status,'ambiguous');
});
test('REPAIR-07: scene title equal but altered MJ notes => conflict, no rollback/delete',()=>{
 const altered=scene();altered.privateNotes='Changé par MJ';const c=campaign({scenes:[altered]});
 assert.equal(inspectWithJournal(c,clone(c),'scene').scene.status,'conflict');
 assert.equal(inspectDemoFootprints(c,{persistedCampaign:clone(c)}).scene.status,'conflict');
});
test('REPAIR-08: participant missing is flagged for explicit attachment, not recreated',()=>{
 const c=campaign({scenes:[scene('scene-01',[])]});
 assert.equal(inspectWithJournal(c,clone(c),'scene').scene.status,'needs-participants');
 assert.equal(inspectDemoFootprints(c,{persistedCampaign:clone(c)}).scene.status,'needs-participants');
});
test('REPAIR-09: mismatched source/profile is conflict, never reused',()=>{
 const c=campaign();c.creatures[0].source.profileId='other-profile';
 assert.equal(inspectDemoFootprints(c,{persistedCampaign:clone(c)}).creature.status,'missing');
});
test('REPAIR-10: stored copy ID differs from live ID => conflict, never auto-overwrite',()=>{
 const c=campaign(),p=clone(c);p.creatures[0].id='different-id';
 assert.equal(inspectWithJournal(c,p).creature.status,'conflict');
});
test('REPAIR-11: lost creator persistence ACK re-reads existing saved record; no duplicate insert',async()=>{
 const r=draft('item','Lanterne'),store={value:recordState()};let calls=0;
 const storage={async load(){return clone(store.value);}};
 const creatorSave=async()=>{calls++;store.value.extensions.creatorDrafts.push({original:clone(r)});throw Error('ACK perdu après commit');};
 const result=await saveCreatorWithReconciliation({record:r,storage,creatorSave,studioSnapshot:campaign()});
 assert.equal(result.reconciled,true);assert.equal(result.saved,true);
 const repeat=await saveCreatorWithReconciliation({record:r,storage,creatorSave,studioSnapshot:campaign()});
 assert.equal(repeat.attempted,false);assert.equal(calls,1);
 assert.equal(store.value.extensions.creatorDrafts.length,1);
});
test('REPAIR-12: failure before persistence is reported, second attempt does not create STUDIO actor',async()=>{
 const r=draft('capacity','Lueur'),s={value:recordState()};let calls=0;
 const storage={async load(){return clone(s.value);}};
 await assert.rejects(saveCreatorWithReconciliation({record:r,storage,creatorSave:async()=>{calls++;throw Error('quota storage');},studioSnapshot:campaign()}),/quota storage/);
 assert.equal(calls,1);assert.equal(s.value.creatures.length,1);assert.equal(s.value.scenes.length,1);
});
test('REPAIR-13: same identity but changed creator content blocks replay',async()=>{
 const r=draft('item','Lanterne'),existing=clone(r);existing.description='Version de contenu divergente';
 const store={async load(){return recordState([existing]);}};
 assert.equal(inspectCreatorRecord(await store.load(),r).status,'conflict');
 await assert.rejects(saveCreatorWithReconciliation({record:r,storage:store,creatorSave:async()=>({saved:true})}),/Conflit/);
});
test('REPAIR-14: durable creator drafts recovered after reload; duplicates blocked',()=>{
 const a=draft('item','Lanterne'),b=draft('capacity','Lueur');const c=recordState([a,b]);
 assert.deepEqual(persistentCreatorRecords(c),[a,b]);c.extensions.creatorDrafts.push({original:clone(a)});
 assert.throws(()=>persistentCreatorRecords(c),/ambiguë/);
});

// DOM harness executes the real L003 mountStudio and new L004 demo orchestration.
class Element {
 constructor(doc,tag){this.ownerDocument=doc;this.tagName=tag.toUpperCase();this.children=[];this.attrs=new Map();this.listeners=new Map();this._text='';this.value='';this.files=[];this.checked=false;this.disabled=false;this.hidden=false;}
 set textContent(v){this._text=String(v);this.children=[];}
 get textContent(){return this._text+this.children.map(x=>x.textContent??'').join('');}
 setAttribute(k,v){this.attrs.set(k,String(v));}getAttribute(k){return this.attrs.get(k)??null;}
 append(...children){this.children.push(...children);}replaceChildren(...children){this._text='';this.children=children;}
 addEventListener(k,fn){this.listeners.set(k,fn);}removeEventListener(k){this.listeners.delete(k);}
 focus(){this.focused=true;}
 querySelector(selector){const m=selector.match(/^([a-z]+)\[aria-label="([^"]+)"\]$/);if(!m)return null;
  return nodes(this).find(x=>x.tagName===m[1].toUpperCase()&&x.getAttribute('aria-label')===m[2])??null;}
 querySelectorAll(selector){return selector==='button'?nodes(this).filter(x=>x.tagName==='BUTTON'):[];}
 click(){if(!this.disabled)this.listeners.get('click')?.({type:'click',target:this});}
}
class Document {constructor(view){this.defaultView=view;this.body=new Element(this,'body');}
 createElement(t){return new Element(this,t);}createTextNode(s){return {textContent:s};}}
function nodes(el){return [el,...(el.children??[]).flatMap(x=>x.children?nodes(x):[x])];}
function byLabel(root,label){return nodes(root).find(x=>x.tagName==='BUTTON'&&x.textContent===label);}
async function eventually(fn){for(let k=0;k<250;k++){if(fn())return;await new Promise(r=>setTimeout(r,1));}assert.fail('condition non observée');}
function mounted(){
 let n=0;const messages=[],listeners=new Map(),area=new Map(),state={value:null,saves:0,copyCalls:0,creatorCalls:0,failSceneSave:false};
 const view={location:{origin:STUDIO_ORIGIN},crypto:{randomUUID(){return 'l004-r-'+(++n);},subtle:webcrypto.subtle},
   localStorage:{getItem:k=>area.get(k)??null,setItem:(k,v)=>area.set(k,v),removeItem:k=>area.delete(k)},
   addEventListener:(k,fn)=>listeners.set(k,fn),removeEventListener:k=>listeners.delete(k),URL:URL,
   receiveMessage:e=>listeners.get('message')?.(e)};
 const doc=new Document(view),root=new Element(doc,'div');
 const player={postMessage:(payload,targetOrigin)=>messages.push({payload,targetOrigin})};
 let queue=Promise.resolve();
 const app=mountStudioDemo(root,{window:view,openWindow:url=>{state.openedUrl=url;return player;},
  mountCreatorsPort:(host,options)=>{host.__testCreatorSave=options.onSave;return {destroy(){}};},
  storageFactory:()=>({
   save(c){const snap=clone(c);const job=queue.catch(()=>{}).then(async()=>{state.saves++;
     if(state.failSceneSave&&snap.scenes.length){state.failSceneSave=false;throw Error('échec disque');}
     state.value=snap;});queue=job;return job;},
   async load(){await queue.catch(()=>{});return state.value?clone(state.value):null;},
   async exportPrivate(c){return new TextEncoder().encode(JSON.stringify(c));},
   async previewRestore(){throw Error('validation ARCHIVES absente du banc');},
   async restore(){throw Error('validation ARCHIVES absente du banc');}
  }),
  createDemoAdapters:()=>({
   characterImport:{async preview(){return {schemaVersion:'v3',display:{name:'Aëlia',level:5}};},async accept(){return {id:'pj-l004-r',sourceId:'pj-source',source:{},sheet:{}};}},
   catalog:{async resolveCreature(){return {documentId:'aucun-document-canonique',profileId:DEMO_CREATURE_PROFILE,ruleset:'m03',name:'Créature témoin N5'};}},
   bestiary:{async copyCreature(){state.copyCalls++;return {id:'creature-instance-'+state.copyCalls,sourceId:DEMO_CREATURE_SOURCE,profileId:DEMO_CREATURE_PROFILE,sheet:{}};}},
   creatorSave:async(record)=>{state.creatorCalls++;if(state.value===null)throw Error('no campaign');
     state.value.extensions.creatorDrafts??=[];state.value.extensions.creatorDrafts.push({original:clone(record)});
     throw Error('accusé perdu après sauvegarde créateur');
   }
  })});
 return {app,root,doc,view,player,messages,state,getCreator(){return nodes(root).find(x=>x.getAttribute?.('aria-label')==='Créateurs descriptifs fictifs');}};
}
function guideStatus(root){return nodes(root).find(x=>x.getAttribute?.('role')==='status')?.textContent??'';}
async function clickAndWait(f,label,check){
 const button=byLabel(f.root,label);assert.ok(button,label);
 await eventually(()=>!button.disabled);
 button.click();
 await eventually(()=>check() && guideStatus(f.root)!=='Étape en cours — éviter de relancer une copie.');
 if(/^Action refusée/.test(guideStatus(f.root)))console.error('REPAIR_DIAG',label,JSON.stringify(f.app.studio.getCampaign()),JSON.stringify(f.state.value));
 assert.doesNotMatch(guideStatus(f.root),/^Action refusée/,label);
}

async function buildDemoScene(f){
 await clickAndWait(f,'Créer campagne fictive',()=>f.app.studio.getCampaign()?.id);
 await clickAndWait(f,'Prévisualiser PJ fictif',()=>nodes(f.root).filter(x=>x.tagName==='BUTTON'&&x.textContent==='Accepter copie PJ').length>=2);
 await clickAndWait(f,'Accepter copie PJ',()=>f.app.studio.getCampaign()?.characters.length===1);
 await clickAndWait(f,'Prévisualiser créature fictive',()=>byLabel(f.root,'Créer copie d’instance')!==null);
 await clickAndWait(f,'Accepter copie créature',()=>f.app.studio.getCampaign()?.creatures.length===1);
 await clickAndWait(f,'Créer scène et notes MJ fictives',()=>f.app.studio.getCampaign()?.scenes.length===1);
 await eventually(()=>f.state.value?.scenes?.length===1);
}
test('REPAIR-15: real STUDIO demo retry after creator write failure keeps one creature and scene',async()=>{
 const f=mounted();await buildDemoScene(f);const previous=f.app.studio.getCampaign();
 const r=draft('item','Lanterne');const creatorHost=f.getCreator();assert.equal(typeof creatorHost.__testCreatorSave,'function');
 const saved=await creatorHost.__testCreatorSave(r);
 assert.equal(saved.saved,true);assert.equal(saved.reconciled,true);
 await clickAndWait(f,'Accepter copie créature',()=>f.app.studio.getCampaign()?.creatures.length===1);
 await clickAndWait(f,'Créer scène et notes MJ fictives',()=>f.app.studio.getCampaign()?.scenes.length===1);
 assert.equal(f.app.studio.getCampaign().creatures.length,1);
 assert.equal(f.app.studio.getCampaign().scenes.length,1);
 assert.equal(f.app.studio.getCampaign().creatures[0].id,previous.creatures[0].id);
 assert.equal(f.app.studio.getCampaign().scenes[0].id,previous.scenes[0].id);
 assert.equal(f.state.copyCalls,1);assert.equal(f.state.creatorCalls,1);
 assert.deepEqual(f.state.value.extensions.creatorDrafts.map(x=>x.original.kind),['item']);
 const projection=f.app.studio.getPublicProjection();assert.equal(projection.scene.title,'');
 assert.doesNotMatch(JSON.stringify(projection),/SENTINELLE_MJ|CANARI_MJ/);
 f.app.dispose();
});
test('REPAIR-16: split write failure leaves scene in memory; retry persists same ID not second scene',async()=>{
 const f=mounted();await clickAndWait(f,'Créer campagne fictive',()=>f.app.studio.getCampaign()?.id);
 await clickAndWait(f,'Prévisualiser PJ fictif',()=>nodes(f.root).filter(x=>x.tagName==='BUTTON'&&x.textContent==='Accepter copie PJ').length>=2);
 await clickAndWait(f,'Accepter copie PJ',()=>f.app.studio.getCampaign()?.characters.length===1);
 await clickAndWait(f,'Prévisualiser créature fictive',()=>byLabel(f.root,'Créer copie d’instance')!==null);
 await clickAndWait(f,'Accepter copie créature',()=>f.app.studio.getCampaign()?.creatures.length===1);
 f.state.failSceneSave=true;
 await clickAndWait(f,'Créer scène et notes MJ fictives',()=>f.app.studio.getCampaign()?.scenes.length===1);
 const id=f.app.studio.getCampaign().scenes[0].id;
 await clickAndWait(f,'Créer scène et notes MJ fictives',()=>f.state.value?.scenes?.length===1);
 assert.equal(f.app.studio.getCampaign().scenes.length,1);
 assert.equal(f.state.value.scenes[0].id,id);
 assert.equal(f.app.studio.getCampaign().scenes[0].privateNotes,DEMO_PRIVATE_NOTE);
 f.app.dispose();
});
test('REPAIR-17: changing scene via real STUDIO revokes player projection, no automatic SHOW',async()=>{
 const f=mounted();await buildDemoScene(f);
 f.app.studio.openPlayer();
 const channel=new URL(f.state.openedUrl).searchParams.get('channel');
 f.view.receiveMessage({source:f.player,origin:PLAYER_ORIGIN,data:{kind:PLAYER_READY,channel}});
 assert.equal(f.app.studio.isPlayerReady(),true);
 const first=f.app.studio.getCampaign();
 f.app.studio.selectPublic({sceneId:first.activeSceneId,shareTitle:true,shareDescription:true,actorIds:first.creatures.map(x=>x.id)});
 f.app.studio.sendProjection();
 assert.equal(f.messages.at(-1).payload.kind,PLAYER_SHOW);
 assert.doesNotMatch(JSON.stringify(f.messages),/SENTINELLE_MJ|CANARI_MJ/);
 const countBefore=f.messages.length;
 f.app.studio.createScene('Deuxième scène','Visible seulement sur sélection explicite','CANARI_MJ_02');
 const after=f.app.studio.getPublicProjection();assert.equal(after.scene.title,'');
 assert.doesNotMatch(JSON.stringify(after),/CANARI_MJ_02|SENTINELLE_MJ/);
 assert.equal(f.messages.length,countBefore+1);
 assert.equal(f.messages.at(-1).payload.kind,PLAYER_CLEAR);
 assert.equal(f.messages.at(-1).targetOrigin,PLAYER_ORIGIN);
 f.app.dispose();
});

test('REPAIR-18: real STUDIO reload then repeat demo steps keeps the same copy and scene IDs',async()=>{
 const f=mounted();await buildDemoScene(f);const before=f.app.studio.getCampaign();
 const reload=byLabel(f.root,'Recharger campagne');assert.ok(reload);reload.click();
 await eventually(()=>f.app.studio.getCampaign()?.extensions?.__dg004_fictional_demo===DEMO_MARKER);
 await clickAndWait(f,'Accepter copie créature',()=>f.app.studio.getCampaign()?.creatures.length===1);
 await clickAndWait(f,'Créer scène et notes MJ fictives',()=>f.app.studio.getCampaign()?.scenes.length===1);
 const after=f.app.studio.getCampaign();
 assert.deepEqual(after.creatures.map(x=>x.id),before.creatures.map(x=>x.id));
 assert.deepEqual(after.scenes.map(x=>x.id),before.scenes.map(x=>x.id));
 assert.equal(f.state.copyCalls,1);
 f.app.dispose();
});
test('REPAIR-19: creator reports saved but durable ARCHIVES record missing => explicit refusal',async()=>{
 const record=draft('item','Absent'),storage={async load(){return recordState([]);}};
 await assert.rejects(saveCreatorWithReconciliation({record,storage,
  creatorSave:async()=>({saved:true}),studioSnapshot:campaign()}),/non retrouvé/);
});

test('REPAIR-20: actor reconciliation after sharing sends CLEAR, never SHOW on its own',async()=>{
 const f=mounted();await buildDemoScene(f);f.app.studio.openPlayer();
 const channel=new URL(f.state.openedUrl).searchParams.get('channel');
 f.view.receiveMessage({source:f.player,origin:PLAYER_ORIGIN,data:{kind:PLAYER_READY,channel}});
 const c=f.app.studio.getCampaign();f.app.studio.selectPublic({sceneId:c.activeSceneId,shareTitle:true,shareDescription:true});
 f.app.studio.sendProjection();const n=f.messages.length;
 await clickAndWait(f,'Accepter copie créature',()=>f.app.studio.getCampaign()?.creatures.length===1);
 assert.equal(f.messages.length,n+1);assert.equal(f.messages.at(-1).payload.kind,PLAYER_CLEAR);
 assert.equal(f.messages.at(-1).targetOrigin,PLAYER_ORIGIN);
 assert.equal(f.app.studio.getPublicProjection().scene.title,'');
 assert.equal(f.state.copyCalls,1);f.app.dispose();
});
