import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import * as archives from '../src/storage/storage.mjs';
import * as index from '../src/catalog/index.mjs';
import {creatorToCatalog} from './adapters.mjs';
const generated=await build({entryPoints:['experiments/dg-lot003/tools/runtime.mjs'],bundle:true,platform:'node',
 format:'esm',target:'es2022',write:false,logLevel:'silent'});
const module=await import('data:text/javascript;base64,'+Buffer.from(generated.outputFiles[0].text).toString('base64'));
const createStorage=module.createValidatedStorage;
const rawStorage=()=>{
 const store=new Map();
 return {
  getItem:key=>store.get(key)??null,setItem:(key,value)=>{store.set(key,value);},
  raw:store
 };
};
const campaign=()=>({schema:'cer.studio.dg003.provisional.v0',id:'unit-campaign',title:'Local fictif',revision:0,
 characters:[],creatures:[],scenes:[],activeSceneId:'',extensions:{},privateNotes:[]});
test('Native ARCHIVES export, preview, commit at every local read/write',async()=>{
 const area=rawStorage(),service=createStorage(archives,area);
 const start=campaign();await service.save(start);
 const stored=area.getItem('cer.dg003.private.campaign.v0');
 assert.ok(stored.includes('cer.studio.dg003.private-export.v0'));
 assert.deepEqual(await service.load(),start);
 area.setItem('cer.dg003.private.campaign.v0',stored.replace('unit-campaign','bad-campaign'));
 await assert.rejects(service.load(),/HASH_MISMATCH|empreinte|altéré|Export|hash|SHA|différente/i);
 // A bad persisted archive must not be overwritten during a read-only recovery attempt.
 assert.ok(area.getItem('cer.dg003.private.campaign.v0').includes('bad-campaign'));
});
test('Creator persisted entry survives subsequent stale STUDIO scene save',async()=>{
 const area=rawStorage(),service=createStorage(archives,area);
 const initial=campaign();await service.save(initial);
 const entry=creatorToCatalog({kind:'item',schema:'cer.creator.dg003.descriptive.v0',name:'Anneau fictif',
  version:'1.0.0',description:'Une simple bague cérémonielle sans bonus.',
  limitations:'Aucun pouvoir mécanique'},index,initial.id);
 await service.appendCatalog(initial,entry,index.validateCatalogRegistry);
 const saved=await service.load();
 assert.equal(saved.extensions.catalog.length,1);
 const stale=structuredClone(initial);stale.revision=1;
 stale.scenes=[{id:'scene-test',title:'Scène',publicDescription:'',privateNotes:'secret',participantIds:[]}];
 stale.activeSceneId='scene-test';
 await service.save(stale);
 const after=await service.load();
 assert.equal(after.scenes.length,1);
 assert.equal(after.extensions.catalog.length,1);
 assert.equal(after.extensions.catalog[0].id,entry.id);
});
test('Native STORAGE rejects data mutation before write and keeps old snapshot',async()=>{
 const area=rawStorage(),service=createStorage(archives,area),start=campaign();
 await service.save(start);
 const before=area.getItem('cer.dg003.private.campaign.v0');
 const corrupt=structuredClone(start);
 corrupt.characters=[{id:'pj-corrupt',publicLabel:'bad',privateSnapshot:{sourceId:'test',source:{sha256:'bad'},sheet:{}}}];
 await assert.rejects(service.save(corrupt));
 assert.equal(area.getItem('cer.dg003.private.campaign.v0'),before);
});
