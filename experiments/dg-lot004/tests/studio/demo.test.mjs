import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto,createHash} from 'node:crypto';
import {createDemoStorageArea,isolateDemoAdapter,fictionalCharacterBytes,DEMO_MARKER,DEMO_NAMESPACE} from '../../src/studio/demo-storage.mjs';
import {previewDescriptiveSceneLink,SCENE_BRIDGE_SCHEMA} from '../../src/studio/scene-bridge.mjs';
import {mountStudioDemo} from '../../src/studio/demo.mjs';
import {makePlayerProjection} from '../../../dg-lot003/src/studio/projection.mjs';

const fixture=()=>({schema:'cer.studio.dg003.provisional.v0',id:'fictional-campaign',title:'Essai L004',revision:1,
  characters:[{id:'pj-one',publicLabel:'Aëlia',privateSnapshot:{secret:'SENTINEL_PRIVATE_01'}}],
  creatures:[{id:'creature-one',publicLabel:'Bête témoin',privateSnapshot:{secret:'SENTINEL_PRIVATE_02'}}],
  scenes:[{id:'scene-one',title:'Rive',publicDescription:'Un beau rivage',privateNotes:'SENTINEL_PRIVATE_03',participantIds:['pj-one','creature-one']}],
  activeSceneId:'scene-one',extensions:{}});
const bytes=new Uint8Array(Buffer.from('fictional native ARCHIVES backup example','utf8'));
const digest=createHash('sha256').update(bytes).digest('hex');
function memory(){const data=new Map([['cer.dg003.private.campaign.v0','REAL_MJ_DONT_TOUCH']]);const seen=[];
 return {data,seen,getItem(k){seen.push(['get',k]);return data.get(k)??null},setItem(k,v){seen.push(['set',k]);data.set(k,v)},removeItem(k){seen.push(['remove',k]);data.delete(k)}};
}
function native(initial=null){let stored=initial,previewCalls=0,saveCalls=0;return {calls:()=>({previewCalls,saveCalls}),
 async load(){return stored?structuredClone(stored):null},async save(s){saveCalls++;stored=structuredClone(s)},
 async exportPrivate(){return new Uint8Array(bytes)},async previewRestore({bytes:x}){previewCalls++;assert.deepEqual(x,bytes);return {display:{title:'fictive'},token:'approved'}},
 async restore(){return structuredClone(stored)}};
}

test('L004-01 key partition refuses arbitrary real MJ key reads/writes',()=>{
 const m=memory(),a=createDemoStorageArea(m);
 a.setItem('cer.dg003.private.campaign.v0','DEMO');
 assert.equal(m.data.get('cer.dg003.private.campaign.v0'),'REAL_MJ_DONT_TOUCH');
 assert.equal(m.data.get(DEMO_NAMESPACE+'cer.dg003.private.campaign.v0'),'DEMO');
 assert.throws(()=>a.getItem('secret'),/non autorisée/);assert.throws(()=>a.setItem('real','BAD'),/non autorisée/);
 assert.ok(m.seen.every(([,key])=>key.startsWith(DEMO_NAMESPACE)));
});
test('L004-02 demo area removing one backup never deletes real MJ campaign',()=>{
 const m=memory(),a=createDemoStorageArea(m);a.setItem('cer.dg003.private.campaign.v0','DEMO');a.removeItem('cer.dg003.private.campaign.v0');
 assert.equal(m.data.get('cer.dg003.private.campaign.v0'),'REAL_MJ_DONT_TOUCH');
});
test('L004-03 missing authoritative ARCHIVES-backed storage is refused',()=>{
 assert.throws(()=>isolateDemoAdapter({},createDemoStorageArea(memory()),{cryptoAPI:webcrypto}),/ARCHIVES natif/);
});
test('L004-04 save tags only clone of fictional campaign, delegates to native service',async()=>{
 const a=createDemoStorageArea(memory()),base=native(),adapter=isolateDemoAdapter(base,a,{cryptoAPI:webcrypto}),original=fixture();
 await adapter.save(original);assert.equal(base.calls().saveCalls,1);
 assert.equal((await adapter.load()).extensions.__dg004_fictional_demo,DEMO_MARKER);
 assert.equal(original.extensions.__dg004_fictional_demo,undefined);
});
test('L004-05 load refuses foreign project even from namespaced storage',async()=>{
 const adapter=isolateDemoAdapter(native(fixture()),createDemoStorageArea(memory()),{cryptoAPI:webcrypto});
 await assert.rejects(adapter.load(),/campagne externe/);
});
test('L004-06 export uses native bytes and records only sha256 of demo backup',async()=>{
 const m=memory(),a=createDemoStorageArea(m),adapter=isolateDemoAdapter(native(),a,{cryptoAPI:webcrypto});
 const v=await adapter.exportPrivate(fixture());assert.deepEqual(v,bytes);
 assert.deepEqual(JSON.parse(a.getItem('approved-backup-sha256')),[digest]);
 assert.equal(m.data.get('cer.dg003.private.campaign.v0'),'REAL_MJ_DONT_TOUCH');
});
test('L004-07 unfamiliar private archive rejected BEFORE native preview',async()=>{
 const b=native(),adapter=isolateDemoAdapter(b,createDemoStorageArea(memory()),{cryptoAPI:webcrypto});
 await assert.rejects(adapter.previewRestore({bytes}),/non reconnue/);
 assert.equal(b.calls().previewCalls,0);
});
test('L004-08 known demo export goes through native ARCHIVES preview unchanged',async()=>{
 const a=createDemoStorageArea(memory()),b=native(),adapter=isolateDemoAdapter(b,a,{cryptoAPI:webcrypto});
 await adapter.exportPrivate(fixture());const p=await adapter.previewRestore({bytes:new Uint8Array(bytes)});
 assert.equal(p.token,'approved');assert.equal(b.calls().previewCalls,1);assert.equal(p.__dg004_expected_sha,digest);
});
test('L004-09 restore refuses previews not issued through demo allowlist',async()=>{
 const a=createDemoStorageArea(memory()),b=native(),adapter=isolateDemoAdapter(b,a,{cryptoAPI:webcrypto});
 await assert.rejects(adapter.restore({display:{title:'dummy'}},{previous:fixture()}),/non autorisé/);
});
test('L004-10 valid native restore requires fictional marker, cannot import real project',async()=>{
 const a=createDemoStorageArea(memory()),b=native(fixture()),adapter=isolateDemoAdapter(b,a,{cryptoAPI:webcrypto});
 await adapter.exportPrivate(fixture());const p=await adapter.previewRestore({bytes});
 await assert.rejects(adapter.restore(p,{previous:null}),/campagne externe/);
});
test('L004-11 synthetic PJ is single v3 sheet, raw stat >12, unknown fields',()=>{
 const obj=JSON.parse(new TextDecoder().decode(fictionalCharacterBytes()));
 assert.equal(obj.schema,'alrick.sheets.v3');assert.equal(obj.sheets.length,1);
 assert.equal(obj.sheets[0].stats.physique,14);assert.deepEqual(obj.sheets[0].extensionFictive,{origin:'L004-A',status:'proposition'});
});
test('L004-12 player DTO is whitelist and cannot include private scene links, snapshots, sentinels',()=>{
 const campaign=fixture();campaign.extensions.sceneBridge={private:'SENTINEL_PRIVATE_04'};
 const dto=makePlayerProjection(campaign,{sceneId:'scene-one',shareTitle:true,shareDescription:true,actorIds:['pj-one','creature-one']});
 assert.equal(dto.scene.title,'Rive');assert.equal(dto.scene.visibleActors.length,2);
 assert.doesNotMatch(JSON.stringify(dto),/SENTINEL|private|snapshot|sceneBridge/i);
});
test('L004-C-13 descriptive object→capacity→creature→scene link stays private/preview-only',()=>{
 const v=previewDescriptiveSceneLink({
 objectDraft:{kind:'item',name:'Lanterne fictive',version:'0.0.1',provenance:'Atelier fictif',limitations:'Aucun pouvoir'},
 capabilityDraft:{kind:'capacity',name:'Lueur descriptive',version:'0.0.1',provenance:'Atelier fictif',limitations:'Narratif seulement'},
 creature:fixture().creatures[0],scene:fixture().scenes[0]});
 assert.equal(v.schema,SCENE_BRIDGE_SCHEMA);assert.equal(v.visibility,'mj-private');assert.equal(v.status,'preview-only');
 assert.equal(v.creature.instanceId,'creature-one');assert.ok(!Object.hasOwn(v.creature,'privateSnapshot'));
});
test('L004-C-14 numerical effect and resource charge blocked',()=>{
 const data={objectDraft:{kind:'item',name:'Lanterne',version:'0.0.1',provenance:'fictif',limitations:'aucun',charges:3},
 capabilityDraft:{kind:'capacity',name:'Lueur',version:'0.0.1',provenance:'fictif',limitations:'aucun'},
 creature:fixture().creatures[0],scene:fixture().scenes[0]};
 assert.throws(()=>previewDescriptiveSceneLink(data),/numérique non homologué/);
});
test('L004-15 demo mount refuses missing dedicated factory before any campaign DOM mutation',()=>{
 const root={ownerDocument:{},replaceChildren(){throw Error('DOM should not be touched')}},window={localStorage:memory()};
 assert.throws(()=>mountStudioDemo(root,{window,storageFactory:()=>native()}),/Fabrique de ports DEMO/);
});
