/**
 * L003-RULES : test du VRAI TypeScript du dépôt sur base figée (pas de simulation Python).
 * Node --test ; esbuild si déjà installé, sinon tsc préexistant (sans ajout de dépendance).
 * Aucune construction sous Quartz. Sortie compilée dans le répertoire temporaire système.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';

const here=dirname(fileURLToPath(import.meta.url));
const repo=resolve(here,'../../../..');
const bridgeEntry=resolve(repo,'experiments/dg-lot003/src/rules/native-preview.ts');
const directEntry=resolve(here,'native-direct-entry.ts');
const temporary=mkdtempSync(join(tmpdir(),'dg003-math-rules-'));
let bridge,direct,backend='';
try {
  try {
    const {build}=await import('esbuild');
    await build({entryPoints:[bridgeEntry],outfile:join(temporary,'bridge.cjs'),bundle:true,platform:'node',format:'cjs',target:'node18',logLevel:'silent'});
    await build({entryPoints:[directEntry],outfile:join(temporary,'direct.cjs'),bundle:true,platform:'node',format:'cjs',target:'node18',logLevel:'silent'});
    bridge=createRequire(import.meta.url)(join(temporary,'bridge.cjs'));
    direct=createRequire(import.meta.url)(join(temporary,'direct.cjs'));
    backend='esbuild';
  } catch(error) {
    if(error?.code!=='ERR_MODULE_NOT_FOUND'&&error?.code!=='MODULE_NOT_FOUND')throw error;
    execFileSync('tsc',['--target','ES2022','--module','commonjs','--moduleResolution','node','--skipLibCheck','--strict','--rootDir',repo,'--outDir',temporary,bridgeEntry,directEntry],{cwd:repo,stdio:'pipe'});
    bridge=createRequire(import.meta.url)(join(temporary,'experiments/dg-lot003/src/rules/native-preview.js'));
    direct=createRequire(import.meta.url)(join(temporary,'experiments/dg-lot003/tests/rules/native-direct-entry.js'));
    backend='tsc';
  }
} catch(error) {
  rmSync(temporary,{force:true,recursive:true});
  throw new Error('Compilation des TS officiels impossible : '+(error.stderr?.toString()??error.message),{cause:error});
}
process.once('exit',()=>rmSync(temporary,{force:true,recursive:true}));
console.log('L003-RULES backend='+backend+' ; sources M01/M03/probabilities officielles sans modification');

const allowed=(abilityId='cap-impact',kind='impact',magnitude=2,duration=2,trigger='attaque')=>({
 source:'m02-ability',
 ability:{id:abilityId,name:'Technique fictive',domain:'test',kind:'technique',levelRequired:5,
   description:'Concentration technique',status:'defined',effect:'Bonus circonstanciel',
   limitations:'Test synthétique',provenance:'fixture-test',approvedByGM:true,rank:1},
 proposal:{abilityId,kind,magnitude,duration,trigger}
});
const sample=(level,raw=3+Math.floor(.55*(level-1)))=>({
 natural:24,rawStat:raw,masteryRank:Math.floor(.45*(level-1)),situation:0,level,
 difficulty:21,kind:'physique',mode:'melee',feasible:true,baseDamage:6,
 defender:{level,stats:{physique:raw,agilite:raw,esprit:raw,presence:raw},
   masteries:{esquive:Math.floor(.45*(level-1))},resistanceBonus:{physique:0,magie:0,mental:0},
   protection:{physique:0,magie:0,mental:0},equipmentGrades:{physique:Math.min(5,Math.floor(level/5)),magie:0,mental:0}}
});

for(const level of [1,5,10,15,20,25]) {
 test('M03 natif égal à passerelle PJ/créature N'+level,()=>{
   const combat=sample(level);
   const native=direct.resolveCombatM03(combat);
   const pj=bridge.previewNativeRules({kind:'combat',actor:'pj',combat});
   const creature=bridge.previewNativeRules({kind:'combat',actor:'creature',combat});
   assert.equal(pj.status,'ok');assert.equal(creature.status,'ok');
   assert.deepEqual(pj.result,native);assert.deepEqual(creature.result,native);
   assert.equal(pj.applied,false);assert.equal(creature.applied,false);
   assert.deepEqual(bridge.previewNativeProgressionLevel(level),direct.progressionAtLevel(level));
 });
 test('M01 natif égal à passerelle N'+level,()=>{
   const action={natural:19,rawStat:3+level,masteryRank:Math.floor(level/3),situation:1,threshold:25,feasible:true};
   for(const actor of ['pj','creature']){
     const p=bridge.previewNativeRules({kind:'progression',actor,action});
     assert.equal(p.status,'ok');assert.equal(p.engine,'M01');
     assert.deepEqual(p.result,direct.resolveProgressionAction(action));
   }
 });
 test('absorption non homologuée refusée N'+level,()=>{
   const effect=allowed('cap-abs-'+level,'absorption',2,2,'defense');
   assert.equal(direct.validateM03AbilityEffect(effect.ability,effect.proposal)?.approved,true);
   const response=bridge.previewNativeRules({kind:'combat',actor:'pj',combat:sample(level),effects:[effect]});
   assert.equal(response.status,'unavailable');assert.equal(response.code,'ABSORPTION_UNHOMOLOGATED');
 });
}

test('impact +2 nativement approuvé, calcul identique M03 direct, sans débit',()=>{
 const combat=sample(10,16);
 const effects=[allowed()];
 const accepted=direct.validateM03AbilityEffect(effects[0].ability,effects[0].proposal);
 assert.equal(accepted?.approved,true);
 const original={kind:'combat',actor:'pj',combat,effects};
 const before=structuredClone(original);
 const p=bridge.previewNativeRules(original);
 assert.equal(p.status,'ok');assert.equal(p.engine,'M03');
 assert.deepEqual(p.result,direct.resolveCombatM03({...combat,effects:[accepted]}));
 assert.equal(p.result.grossDamage,direct.resolveCombatM03(combat).grossDamage+2);
 assert.deepEqual(original,before,'la prévisualisation ne doit rien muter');
 assert.equal(p.applied,false);
});

test('deux effets impact validés ne se cumulent pas : moteur M03 choisit max',()=>{
 const combat=sample(15);
 const effects=[allowed('cap-a','impact',1),allowed('cap-b','impact',2)];
 const p=bridge.previewNativeRules({kind:'combat',actor:'creature',combat,effects});
 assert.equal(p.status,'ok');
 assert.equal(p.result.grossDamage,direct.resolveCombatM03(combat).grossDamage+2);
 assert.equal(p.appliedEffects.length,2);
});

test('validation native M03 refuse magnitude 3, durée 4, mauvais trigger et non-approuvé',()=>{
 const invalid=[allowed('cap-3','impact',3),allowed('cap-duration','impact',2,4),
   allowed('cap-trigger','defense',2,2,'attaque'),{...allowed('cap-not-approved'),ability:{...allowed('cap-not-approved').ability,approvedByGM:false}}];
 for(const e of invalid){
   assert.equal(direct.validateM03AbilityEffect(e.ability,e.proposal),null);
   const p=bridge.previewNativeRules({kind:'combat',actor:'pj',combat:sample(10),effects:[e]});
   assert.equal(p.status,'rejected');assert.equal(p.code,'NATIVE_APPROVAL_REQUIRED');
 }
});

test('injection approved et champs effets natifs interdits',()=>{
 const effect=allowed();
 assert.equal(bridge.previewNativeRules({kind:'combat',actor:'pj',combat:sample(10),effects:[{...effect,proposal:{...effect.proposal,approved:true}}]}).code,'FORGED_APPROVAL');
 assert.equal(bridge.previewNativeRules({kind:'combat',actor:'pj',combat:{...sample(10),effects:[{...effect.proposal,approved:true}]}}).code,'INJECTED_NATIVE_EFFECT');
 assert.equal(bridge.previewNativeRules({kind:'combat',actor:'pj',combat:sample(10),effects:[{...effect,source:'numeric-item'}]}).code,'INVALID_EFFECT_SOURCE');
});

test('objets numériques / MATH002 / débit mana & charges tous indisponibles',()=>{
 const cases=['numeric-object','item-effect','math002','authority','level-25-plus','resource-operation','mana-debit','charge-debit'];
 for(const kind of cases){const p=bridge.previewNativeRules({kind,actor:'pj'});assert.equal(p.status,'unavailable',kind);assert.equal(p.applied,false);}
});

test('M01 interdit effet non référencé, succès forcé et champ de débit',()=>{
 const req={kind:'progression',actor:'pj',action:{natural:5,rawStat:80,masteryRank:10,situation:2,threshold:10,feasible:true}};
 const p=bridge.previewNativeRules(req);
 assert.equal(p.status,'ok');assert.equal(p.result.success,false);
 assert.equal(bridge.previewNativeRules({...req,manaCost:2}).status,'rejected');
});

test('5d6 officiels : 7 776 issues, aucun second générateur',()=>{
 assert.equal(direct.TOTAL_OUTCOMES,7776);
 assert.equal(Array.from({length:26},(_,i)=>direct.sumOccurrences(i+5)).reduce((x,y)=>x+y,0),7776);
 assert.equal([5,6,7].reduce((s,n)=>s+direct.sumOccurrences(n),0),21);
});
