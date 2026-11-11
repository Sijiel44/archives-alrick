/**
 * REVUE-L003-01/02 regression tests against the actual Studio module.
 * Tiny DOM harness is test-only: does not implement ARCHIVES restore or a 5d6 rule.
 * Storage and preview spies exercise the injected boundary without duplicating native validation.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mountStudio} from '../../src/studio/index.mjs';
import {PLAYER_READY,PLAYER_CLEAR,PLAYER_SHOW,STUDIO_ORIGIN,PLAYER_ORIGIN} from '../../src/studio/projection.mjs';

const MiB=1024*1024;
class Element {
  constructor(doc,tag){this.ownerDocument=doc;this.tagName=tag.toUpperCase();this.children=[];
    this.attrs=new Map();this.listeners=new Map();this._text='';this.value='';this.files=[];this.checked=false;
    this.disabled=false;this.focused=false;}
  set textContent(value){this._text=String(value);this.children=[];}
  get textContent(){return this._text+this.children.map(x=>x.textContent??'').join('');}
  setAttribute(key,value){this.attrs.set(key,String(value));}
  getAttribute(key){return this.attrs.get(key)??null;}
  append(...items){this.children.push(...items);}
  replaceChildren(...items){this._text='';this.children=[...items];}
  addEventListener(name,callback){this.listeners.set(name,callback);}
  removeEventListener(name){this.listeners.delete(name);}
  focus(){this.focused=true;}
  querySelector(selector){
    const match=selector.match(/^([a-z]+)\[aria-label="([^"]+)"\]$/);
    if(!match)throw new Error(`Sélecteur non simulé : ${selector}`);
    return nodes(this).find(x=>x.tagName===match[1].toUpperCase()&&x.getAttribute('aria-label')===match[2])??null;
  }
  click(){const f=this.listeners.get('click');if(f)f({type:'click',target:this});}
  change(){const f=this.listeners.get('change');if(f)f({type:'change',target:this});}
}
class Document {
  constructor(view){this.defaultView=view;this.body=new Element(this,'body');}
  createElement(tag){return new Element(this,tag);}
  createTextNode(content){return {textContent:content};}
}
function nodes(root){return [root,...root.children.flatMap(x=>x.children?nodes(x):[x])];}
function button(root,label){const found=nodes(root).find(x=>x.tagName==='BUTTON'&&x.textContent===label);
  assert.ok(found,`Bouton ${label} présent`);return found;}
function status(root){return nodes(root).find(x=>x.getAttribute?.('role')==='status')?.textContent??'';}
async function settle(){await new Promise(resolve=>setTimeout(resolve,0));}
async function eventually(fn,msg='condition attendue'){for(let i=0;i<80;i++){if(fn())return;await settle();}assert.fail(msg);}
function fixture({saveDelay=()=>0}={}){
  let counter=0;const listeners=new Map();const view={
    location:{origin:STUDIO_ORIGIN},crypto:{randomUUID(){return `fiction-${++counter}-${randomUUID()}`;}},
    addEventListener(name,fn){listeners.set(name,fn);},removeEventListener(name){listeners.delete(name);},
    receiveMessage(event){listeners.get('message')?.(event);},
  };
  const doc=new Document(view),root=new Element(doc,'div');
  const store={saved:null,saveCount:0,previews:[],previewBytes:[],importPreviews:[],restored:0};
  const storage={
    async load(){return store.saved?structuredClone(store.saved):null;},
    async save(c){const delay=saveDelay(c);if(delay)await new Promise(resolve=>setTimeout(resolve,delay));store.saved=structuredClone(c);store.saveCount++;},
    async previewRestore({bytes}){store.previews.push(bytes.byteLength);store.previewBytes.push(bytes);return {display:{title:'Archive fictive'}};},
    async restore(){store.restored++;throw Error('Native ARCHIVES required: not implemented by test harness');},
  };
  const characterImport={async preview({bytes}){store.importPreviews.push(bytes.byteLength);return {schemaVersion:'v3',display:{name:'PJ fictif',level:5}};}};
  const messages=[];
  let openedUrl=null;
  const player={postMessage(payload,origin){messages.push({payload,origin});}};
  const studio=mountStudio(root,{window:view,storage,characterImport,openWindow(url){openedUrl=url;return player;}});
  return {studio,root,doc,view,store,messages,player,getOpenedUrl:()=>openedUrl};
}
const fakeFile=(bytes,claimedSize=bytes.byteLength)=>({size:claimedSize,async arrayBuffer(){return bytes.buffer;}});
function begin(f){f.studio.createCampaign('Campagne fictive');}

// Boundary tests: the mock preview port is a spy, never an alternative restoration implementation.
test('REVUE-01: UI restauration accepte 5 Mio + 1 octet et transmet les octets intacts',async()=>{
  const f=fixture();begin(f);const before=f.studio.getCampaign();
  const data=new Uint8Array(5*MiB+1);data[5*MiB]=239;
  f.root.querySelector('input[aria-label="Fichier de restauration confidentiel"]').files=[fakeFile(data)];
  button(f.root,'Prévisualiser restauration').click();
  await eventually(()=>f.store.previews.length===1,'prévisualisation appelée');
  assert.equal(f.store.previews[0],data.byteLength);
  assert.strictEqual(f.store.previewBytes[0].buffer,data.buffer);
  assert.equal(f.store.previewBytes[0][data.byteLength-1],239);
  assert.deepEqual(f.studio.getCampaign(),before);
  assert.equal(f.store.restored,0);
  f.studio.dispose();
});

test('REVUE-01: borne UI 16 Mio incluse et sans mutation',async()=>{
  const f=fixture();begin(f);const before=f.studio.getCampaign();
  const data=new Uint8Array(16*MiB);data[data.length-1]=111;
  f.root.querySelector('input[aria-label="Fichier de restauration confidentiel"]').files=[fakeFile(data)];
  button(f.root,'Prévisualiser restauration').click();await eventually(()=>f.store.previews.length===1);
  assert.equal(f.store.previews[0],16*MiB);assert.equal(f.store.previewBytes[0][data.length-1],111);
  assert.deepEqual(f.studio.getCampaign(),before);assert.equal(f.store.restored,0);
  f.studio.dispose();
});

test('REVUE-01: UI refuse un fichier annoncé >16 Mio avant lecture et sans mutation',async()=>{
  const f=fixture();begin(f);await eventually(()=>f.store.saveCount>=1);const before=f.studio.getCampaign();let readCount=0;
  f.root.querySelector('input[aria-label="Fichier de restauration confidentiel"]').files=[{size:16*MiB+1,
    async arrayBuffer(){readCount++;throw Error('ne doit jamais être lu');}}];
  button(f.root,'Prévisualiser restauration').click();await eventually(()=>status(f.root).includes('16 Mio'));
  assert.equal(readCount,0);assert.equal(f.store.previews.length,0);assert.deepEqual(f.studio.getCampaign(),before);
  f.studio.dispose();
});

test('REVUE-01: données de restauration >16 Mio refusées par API avant adaptateur',async()=>{
  const f=fixture();begin(f);const before=f.studio.getCampaign();
  await assert.rejects(f.studio.previewRestoration(new Uint8Array(16*MiB+1)),/16 Mio/);
  assert.equal(f.store.previews.length,0);assert.deepEqual(f.studio.getCampaign(),before);
  f.studio.dispose();
});

test('REVUE-01: taille mensongère relue, refuse buffer réel >16 Mio',async()=>{
  const f=fixture();begin(f);await eventually(()=>f.store.saveCount>=1);const before=f.studio.getCampaign();
  f.root.querySelector('input[aria-label="Fichier de restauration confidentiel"]').files=[fakeFile(new Uint8Array(16*MiB+1),1)];
  button(f.root,'Prévisualiser restauration').click();await eventually(()=>status(f.root).includes('16 Mio'));
  assert.equal(f.store.previews.length,0);assert.deepEqual(f.studio.getCampaign(),before);
  f.studio.dispose();
});

test('REVUE-01: import PJ reste limité à 5 Mio, distinct de la restauration',async()=>{
  const f=fixture();begin(f);const before=f.studio.getCampaign();
  await assert.rejects(f.studio.previewCharacter(new Uint8Array(5*MiB+1)),/Import PJ hors limites/);
  assert.equal(f.store.importPreviews.length,0);
  const max=new Uint8Array(5*MiB);await f.studio.previewCharacter(max);
  assert.deepEqual(f.store.importPreviews,[5*MiB]);assert.deepEqual(f.studio.getCampaign(),before);
  f.studio.dispose();
});

test('REVUE-02: A/B puis A persiste la scène active et incrémente la révision une seule fois',async()=>{
  const f=fixture();begin(f);f.studio.createScene('Scène A');f.studio.createScene('Scène B');
  await eventually(()=>f.store.saved?.scenes.length===2);
  const [a,b]=f.studio.getCampaign().scenes.map(s=>s.id);
  assert.equal(f.studio.getCampaign().activeSceneId,b);
  const priorRevision=f.studio.getCampaign().revision;
  await f.studio.setActiveScene(a);
  assert.equal(f.studio.getCampaign().revision,priorRevision+1);
  assert.equal(f.store.saved.activeSceneId,a);
  button(f.root,'Recharger campagne').click();
  await eventually(()=>status(f.root).includes('Campagne rechargée'));
  assert.equal(f.studio.getCampaign().activeSceneId,a);
  assert.equal(f.studio.getCampaign().revision,priorRevision+1);
  assert.equal(f.store.saved.activeSceneId,a);
  f.studio.dispose();
});

test('REVUE-02: changement de scène révoque la sélection et CLEAR sans SHOW automatique',async()=>{
  const f=fixture();begin(f);f.studio.createScene('A');f.studio.createScene('B');
  const [a,b]=f.studio.getCampaign().scenes.map(s=>s.id);
  f.studio.selectPublic({sceneId:b,shareTitle:true,shareDescription:true});
  f.studio.openPlayer();
  const channel=new URL(f.getOpenedUrl()).searchParams.get('channel');
  f.view.receiveMessage({source:f.player,origin:PLAYER_ORIGIN,data:{kind:PLAYER_READY,channel}});
  assert.equal(f.studio.isPlayerReady(),true);
  f.messages.length=0;
  await f.studio.setActiveScene(a);
  assert.deepEqual(f.studio.getPublicProjection().scene,{title:'',description:'',visibleActors:[]});
  assert.deepEqual(f.messages.map(m=>m.payload.kind),[PLAYER_CLEAR]);
  assert.equal(f.messages[0].origin,PLAYER_ORIGIN);
  assert.equal(f.messages.some(m=>m.payload.kind===PLAYER_SHOW),false);
  f.studio.dispose();
});

test('REVUE-02: scène inconnue refusée avant mutation et persistance',async()=>{
  const f=fixture();begin(f);f.studio.createScene('A');await eventually(()=>f.store.saved?.scenes.length===1);
  const before=f.studio.getCampaign(),saves=f.store.saveCount;
  await assert.rejects(f.studio.setActiveScene('scene-absente'),/Scène introuvable/);
  assert.deepEqual(f.studio.getCampaign(),before);assert.equal(f.store.saveCount,saves);
  f.studio.dispose();
});

test('REVUE-02: choisir la scène déjà active révoque consentement sans révision ni sauvegarde',async()=>{
  const f=fixture();begin(f);f.studio.createScene('A');await eventually(()=>f.store.saved?.scenes.length===1);
  const a=f.studio.getCampaign().activeSceneId,before=f.studio.getCampaign().revision,saves=f.store.saveCount;
  f.studio.selectPublic({sceneId:a,shareTitle:true});
  await f.studio.setActiveScene(a);
  assert.equal(f.studio.getCampaign().revision,before);assert.equal(f.store.saveCount,saves);
  assert.equal(f.studio.getPublicProjection().scene.title,'');
  f.studio.dispose();
});


test('REVUE-02: sauvegarde B lente ne peut écraser sélection A demandée ensuite',async()=>{
  const f=fixture({saveDelay(c){return c.scenes.find(s=>s.id===c.activeSceneId)?.title==='B'?35:0;}});
  begin(f);f.studio.createScene('A');f.studio.createScene('B');
  const sceneA=f.studio.getCampaign().scenes[0].id;
  await f.studio.setActiveScene(sceneA);
  assert.equal(f.store.saved.activeSceneId,sceneA);
  assert.equal(f.store.saved.revision,f.studio.getCampaign().revision);
  f.studio.dispose();
});
