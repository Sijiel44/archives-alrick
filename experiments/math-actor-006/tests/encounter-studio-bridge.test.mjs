import test from 'node:test';
import assert from 'node:assert/strict';
import {createEncounterStudioBridge,createMemoryEncounterRepository} from '../src/encounter-studio-bridge.mjs';
const base=[
 {id:'pnj-7',campaignId:'c1',kind:'pnj',label:'Veilleur',level:5,sourceRef:{id:'pnj:7',version:'1'},profileRef:{id:'m03:7',version:'3',engine:'M03',level:5},privateNote:'SECRET'},
 {id:'creature-1',campaignId:'c1',kind:'creature',label:'Traqueur A',level:10,sourceRef:{id:'best:1',version:'1'},profileRef:{id:'m03:a',version:'2',engine:'M03',level:10}},
 {id:'creature-2',campaignId:'c1',kind:'creature',label:'Traqueur B',level:10,sourceRef:{id:'best:1',version:'1'},profileRef:{id:'m03:b',version:'2',engine:'M03',level:10}}
];
const clone=x=>structuredClone(x);
function setup(repo=createMemoryEncounterRepository()){
 const store=new Map(base.map(x=>[x.id,clone(x)]));
 const catalog={list:async()=>[...store.values()].map(clone),read:async({actorId})=>clone(store.get(actorId)??null)};
 const make=()=>createEncounterStudioBridge({campaignId:'c1',encounterId:'s1',catalog,repository:repo,
   resolveM03:async ({action})=>({nativePortCalled:true,natural:action.dice.reduce((a,b)=>a+b,0)})});
 return {store,make,repo};
}
test('chargement sans aucune mutation',async()=>{
 const f=setup(),a=f.make();const x=await a.load();assert.equal(x.revision,0);
 assert.equal(x.participants.length,0);assert.equal(await f.repo.read({campaignId:'c1',encounterId:'s1'}),null);
});
test('même PNJ, identité et histoire préservées sans secret dans le JSON',async()=>{
 const f=setup(),a=f.make();await a.load();const before=clone(f.store.get('pnj-7'));
 await a.add({actorId:'pnj-7',side:'allies',role:'defense'});
 assert.equal(a.get().participants[0].actorId,'pnj-7');
 assert.deepEqual(f.store.get('pnj-7'),before);
 assert.doesNotMatch(a.exportJSON(),/SECRET|privateNote/);
});
test('deux individus de même espèce autorisés, duplicat du même acteur refusé',async()=>{
 const a=setup().make();await a.load();
 await a.add({actorId:'creature-1',side:'adversaries',role:'assaut'});
 await a.add({actorId:'creature-2',side:'adversaries',role:'soutien'});
 assert.equal(a.get().participants.length,2);
 await assert.rejects(a.add({actorId:'creature-1',side:'allies',role:'boss'}),/dupliqué/);
});
test('comparatif descriptif sans barème',async()=>{
 const a=setup().make();await a.load();await a.add({actorId:'pnj-7',side:'allies',role:'soutien'});
 await a.add({actorId:'creature-1',side:'adversaries',role:'assaut'});
 assert.equal(a.summary().threatRating,null);
 assert.equal(a.summary().comparison.differenceInMedianLevel,5);
});
test('cinq dés et prévisualisation pure déléguée à M03',async()=>{
 const f=setup(),a=f.make();await a.load();
 await a.add({actorId:'pnj-7',side:'allies',role:'defense'});
 await a.add({actorId:'creature-1',side:'adversaries',role:'assaut'});
 const before=a.exportJSON();
 const result=await a.preview({attackerId:'pnj-7',defenderId:'creature-1',dice:[1,2,3,4,5]});
 assert.equal(result.result.nativePortCalled,true);assert.equal(result.result.natural,15);
 assert.equal(result.applied,false);assert.equal(result.spent,false);assert.equal(a.exportJSON(),before);
 await assert.rejects(a.preview({attackerId:'pnj-7',defenderId:'creature-1',dice:[1,2,7,4,5]}),/Cinq dés/);
});
test('une fiche dont la version M03 change est refusée avant le jet',async()=>{
 const f=setup(),a=f.make();await a.load();
 await a.add({actorId:'pnj-7',side:'allies',role:'defense'});
 await a.add({actorId:'creature-1',side:'adversaries',role:'assaut'});
 f.store.get('pnj-7').profileRef.version='4';
 await assert.rejects(a.preview({attackerId:'pnj-7',defenderId:'creature-1',dice:[1,2,3,4,5]}),/modifiée/);
});
test('changement de campagne révoque la possibilité de prévisualiser',async()=>{
 const f=setup(),a=f.make();await a.load();
 await a.add({actorId:'pnj-7',side:'allies',role:'defense'});
 await a.add({actorId:'creature-1',side:'adversaries',role:'assaut'});
 f.store.get('pnj-7').campaignId='autre';
 await assert.rejects(a.preview({attackerId:'pnj-7',defenderId:'creature-1',dice:[1,2,3,4,5]}),/modifiée/);
});
test('une fiche d’une autre campagne ne peut être ajoutée',async()=>{
 const f=setup(),a=f.make();await a.load();f.store.get('pnj-7').campaignId='autre';
 await assert.rejects(a.add({actorId:'pnj-7',side:'allies',role:'defense'}),/introuvable/);
 assert.equal(a.get().participants.length,0);
});
test('les deux onglets en conflit ne peuvent pas écraser le brouillon',async()=>{
 const f=setup(),a=f.make(),b=f.make();await a.load();await b.load();
 await a.add({actorId:'pnj-7',side:'allies',role:'defense'});
 await assert.rejects(b.add({actorId:'creature-1',side:'adversaries',role:'assaut'}),/Conflit/);
 await b.load();await b.add({actorId:'creature-1',side:'adversaries',role:'assaut'});
 assert.equal(b.get().participants.length,2);
});
test('lecture et export ne peuvent pas modifier la fiche source',async()=>{
 const f=setup(),a=f.make();await a.load();await a.add({actorId:'pnj-7',side:'allies',role:'defense'});
 const before=clone(f.store.get('pnj-7'));const state=a.get();state.participants[0].label='Autre';
 assert.equal(a.get().participants[0].label,'Veilleur');assert.deepEqual(f.store.get('pnj-7'),before);
 const fresh=f.make();await fresh.load();assert.equal(fresh.exportJSON(),a.exportJSON());
});
test('suppression retire du brouillon, pas du catalogue',async()=>{
 const f=setup(),a=f.make();await a.load();await a.add({actorId:'pnj-7',side:'allies',role:'defense'});
 await a.remove('pnj-7');assert.equal(a.get().participants.length,0);assert.equal(f.store.size,3);
});
test('PNJ niveau 25 admis, niveau 26 refusé',async()=>{
 const f=setup(),a=f.make();f.store.get('pnj-7').level=25;f.store.get('pnj-7').profileRef.level=25;
 await a.load();await a.add({actorId:'pnj-7',side:'allies',role:'boss'});
 assert.equal(a.get().participants[0].level,25);
 const f2=setup();f2.store.get('pnj-7').level=26;f2.store.get('pnj-7').profileRef.level=26;
 const b=f2.make();await b.load();await assert.rejects(b.add({actorId:'pnj-7',side:'allies',role:'boss'}),/Niveau attendu/);
});
