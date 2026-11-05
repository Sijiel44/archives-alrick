import test from 'node:test';
import assert from 'node:assert/strict';
import {installDemo,createFakePJBytes,DEMO_MARKER_KEY,PRIVATE_STORAGE_KEY,
 DEMO_PRIVATE,DEMO_TITLE,DEMO_SCENE} from '../../tools/demo-controller.mjs';
test('native fixture is v2 UTF-8 BOM and cannot be confused with a real person',()=>{
 const raw=new TextDecoder().decode(createFakePJBytes());
 assert.equal(raw.charCodeAt(0),0xfeff);
 const data=JSON.parse(raw.slice(1));
 assert.equal(data.schema,'alrick.sheets.v2');
 assert.equal(data.sheets[0].name,'Éclaireuse fictive DG004');
 assert.match(JSON.stringify(data),/SYNTHETIC_ONLY/);
});
function harness(initial={}){
 const map=new Map(Object.entries(initial));
 const area={getItem:k=>map.has(k)?map.get(k):null,
  setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};
 const doc={defaultView:{location:{origin:'http://127.0.0.1:4173'},
  crypto:{randomUUID:()=>'fixture-uuid'},localStorage:area},
  createElement(tag){
   return {tagName:tag,disabled:false,textContent:'',type:'',attributes:{},
    setAttribute(k,v){this.attributes[k]=v;},addEventListener(){},
    replaceChildren(...nodes){this.children=nodes;}};
  },
  getElementById:()=>({replaceChildren(...nodes){this.children=nodes;}})
 };
 let state=null,disposals=0,projection=0;
 const studio={
  getCampaign:()=>state?structuredClone(state):null,
  createCampaign:title=>{state={id:'demo-campaign',title,characters:[],creatures:[],scenes:[],revision:0};},
  previewCharacter:async bytes=>{assert.ok(bytes.length>0);},
  acceptCharacter:async()=>{state.characters.push({id:'fixture-pj'});},
  previewCreature:async ref=>{assert.equal(ref,'fixture-source-001');},
  copyCreature:async()=>{state.creatures.push({id:'fixture-creature'});},
  createScene:title=>{state.scenes.push({id:'scene-fixture',title,privateNotes:''});},
  updateScene:x=>{Object.assign(state.scenes[0],x);},
  dispose:()=>{disposals++;},
  openPlayer:()=>{projection++;},
  sendProjection:()=>{projection++;}
 };
 const store={
  save:async campaign=>{state=structuredClone(campaign);map.set(PRIVATE_STORAGE_KEY,JSON.stringify({kind:'fake-local',id:state.id}));},
  load:async()=>state?structuredClone(state):null
 };
 return {doc,area,map,studio,store,getStats:()=>({state,disposals,projection})};
}
test('demo P0-A opt-in seeds controller, persists and exits without changing unrelated local data',async()=>{
 const h=harness({unrelated:'keep-me'});
 const controller=installDemo({studio:h.studio,store:h.store},h.doc);
 assert.equal(h.map.has(DEMO_MARKER_KEY),false,'no autostart/no mutation');
 await controller.start();
 const stats=h.getStats();
 assert.equal(stats.state.title,DEMO_TITLE);
 assert.equal(stats.state.characters.length,1);
 assert.equal(stats.state.creatures.length,1);
 assert.equal(stats.state.scenes[0].title,DEMO_SCENE);
 assert.equal(stats.state.scenes[0].privateNotes,DEMO_PRIVATE);
 assert.equal(stats.projection,0,'no automatic player opening or sharing');
 assert.equal(h.map.has(DEMO_MARKER_KEY),true);
 await controller.exit();
 assert.equal(h.map.has(DEMO_MARKER_KEY),false);
 assert.equal(h.map.has(PRIVATE_STORAGE_KEY),false);
 assert.equal(h.map.get('unrelated'),'keep-me');
 assert.equal(h.getStats().disposals,1);
});
test('demo refuses preexisting private session with no overwrite and no auto-clear',async()=>{
 const h=harness({[PRIVATE_STORAGE_KEY]:'OLD_PRIVATE_BACKUP',unrelated:'keep-me'});
 const controller=installDemo({studio:h.studio,store:h.store},h.doc);
 await controller.start();
 assert.equal(h.map.get(PRIVATE_STORAGE_KEY),'OLD_PRIVATE_BACKUP');
 assert.equal(h.map.has(DEMO_MARKER_KEY),false);
 assert.equal(h.getStats().state,null);
});
test('demo rejects wrong origins before any user data access',()=>{
 const h=harness();
 h.doc.defaultView.location.origin='https://example.org';
 assert.throws(()=>installDemo({studio:h.studio,store:h.store},h.doc),/loopback/);
});
