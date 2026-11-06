/** CORE-COMPAT-001 — checks of byte-identical official M01/M03/probabilities; no new engine. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, rmSync} from 'node:fs';
import {join, resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';

const root=process.env.CORE_COMPAT_SOURCE_ROOT ? resolve(process.env.CORE_COMPAT_SOURCE_ROOT) : resolve(dirname(fileURLToPath(import.meta.url)),'../../../..');
const temp=mkdtempSync(join('/tmp','core-compat-'));
execFileSync('tsc',['--target','ES2022','--module','commonjs','--moduleResolution','node',
  '--skipLibCheck','--strict','--rootDir',root,'--outDir',temp,
  resolve(root,'quartz/components/scripts/atelier5d6-probabilities.ts'),
  resolve(root,'quartz/components/scripts/atelier5d6-progression.ts'),
  resolve(root,'quartz/components/scripts/atelier5d6-combat-m03.ts')],{cwd:root,stdio:'pipe'});
const require=createRequire(import.meta.url);
const base=join(temp,'quartz/components/scripts');
const prob=require(join(base,'atelier5d6-probabilities.js'));
const m01=require(join(base,'atelier5d6-progression.js'));
const m03=require(join(base,'atelier5d6-combat-m03.js'));
process.once('exit',()=>rmSync(temp,{force:true,recursive:true}));
const levels=[1,5,10,15,20,25];
const defender=(level=5)=>({level,stats:{physique:9,agilite:9,esprit:9,presence:9},
 masteries:{esquive:6},resistanceBonus:{physique:0,magie:0,mental:0},
 protection:{physique:0,magie:0,mental:0},equipmentGrades:{physique:0,magie:0,mental:0}});
const combat=(custom={})=>({natural:24,rawStat:15,masteryRank:4,situation:0,level:5,difficulty:21,
  kind:'physique',mode:'melee',feasible:true,baseDamage:6,defender:defender(),...custom});
const fakeAbility={id:'a',status:'defined',approvedByGM:true,rank:1,effect:'Effet explicite',limitations:'Limité',description:'Fictif'};
const authorize=(kind,magnitude,trigger='attaque')=>m03.validateM03AbilityEffect(fakeAbility,{abilityId:'a',kind,magnitude,duration:1,trigger});

test('I01 5d6: 7776 issues, 21 échecs naturels, borne 5..30',()=>{
 assert.equal(prob.TOTAL_OUTCOMES,7776);
 assert.equal(Array.from({length:26},(_,i)=>prob.sumOccurrences(i+5)).reduce((a,b)=>a+b,0),7776);
 assert.equal([5,6,7].reduce((a,b)=>a+prob.sumOccurrences(b),0),21);
 assert.equal(prob.sumOccurrences(4),0);assert.equal(prob.sumOccurrences(31),0);
});
test('I02 lanceur injectable déterministe, toujours cinq d6',()=>{
 assert.deepEqual(prob.rollFiveDice(()=>0),[1,1,1,1,1]);
 assert.deepEqual(prob.rollFiveDice(()=>0.999999),[6,6,6,6,6]);
});
test('I03 scores bruts >12 : même bonus M01 que M03',()=>{
 assert.equal(m01.effectiveStat(15),Math.floor(3*Math.log2(1+15/3)));
 const out=m03.resolveCombatM03(combat());assert.equal(out.statBonus,m01.effectiveStat(15));
 assert.equal(out.masteryBonus,m01.effectiveMastery(4));
});
test('I04 N1/5/10/15/20/25 : seul M01 fournit XP et budget',()=>{
 for(const level of levels){const p=m01.progressionAtLevel(level);
  assert.equal(p.experience,m01.experienceRequired(level));
  assert.equal(p.development,m01.developmentBudget(level));
  assert.equal(p.previousExperience,m01.legacyExperienceRequired(level));
 }
 assert.equal(m01.progressionAtLevel(25).nextLevelExperience,null);
});
test('I05 échec naturel 5–7 même avec gros bonus, M01 et M03',()=>{
 for(const natural of [5,6,7]){
  assert.equal(m01.resolveProgressionAction({natural,rawStat:500,masteryRank:50,situation:2,threshold:20,feasible:true}).success,false);
  const r=m03.resolveCombatM03(combat({natural,rawStat:500,masteryRank:50,feasible:true}));
  assert.equal(r.success,false);assert.equal(r.damage,0);
 }
});
test('I06 faisabilité false : succès numérique ≠ réussite appliquée',()=>{
 const out=m03.resolveCombatM03(combat({feasible:false}));
 assert.equal(out.success,false);assert.equal(out.damage,0);
});
test('I07 défense/protection distinctes, une protection modifie les dégâts',()=>{
 const a=m03.resolveCombatM03(combat({defender:defender()}));
 const b=m03.resolveCombatM03(combat({defender:{...defender(),protection:{physique:3,magie:0,mental:0}}}));
 assert.equal(a.threshold,b.threshold);assert.ok(b.protection>=a.protection);assert.ok(b.damage<=a.damage);
});
test('I08 effet absorption natif accepté mais NON appliqué (blocage connu)',()=>{
 const approved=authorize('absorption',2,'defense');assert.equal(approved?.approved,true);
 const base=m03.resolveCombatM03(combat());const extra=m03.resolveCombatM03(combat({effects:[approved]}));
 assert.deepEqual(extra,base,'non-application documentée, aucun correctif moteur');
});
test('I09 effet impact 2 approuvé est appliqué, non cumulable',()=>{
 const a=authorize('impact',1),b=authorize('impact',2);
 assert.equal(a?.approved,true);assert.equal(b?.approved,true);
 const original=m03.resolveCombatM03(combat());
 const withEffects=m03.resolveCombatM03(combat({effects:[a,b]}));
 assert.equal(withEffects.grossDamage,original.grossDamage+2);
});
test('I10 entrées PJ/créature identiques M03 -> résultats identiques (moteur seulement)',()=>{
 for(const level of levels){const args=combat({level});
 assert.deepEqual(m03.resolveCombatM03(structuredClone(args)),m03.resolveCombatM03(structuredClone(args)));
 }
});
test('I11 portée et répétition : pure suggestion M01 sans crédit',()=>{
 const e={id:'s1',pattern:'quête-pacifique',domain:'diplomatie',difficulty:6,scope:'ordinaire',approved:false};
 assert.equal(m01.experienceAward(e,[]),120);
 assert.equal(m01.experienceAward(e,[{...e,id:'s0'}]),60);
 assert.equal(m01.experienceAward(e,[e]),0);
});
test('I12 niveaux hors 1–25, indice de difficulté hors 1–12 bloqués',()=>{
 assert.throws(()=>m01.progressionAtLevel(26),RangeError);
 assert.throws(()=>m03.resolveCombatM03(combat({level:26})),RangeError);
 assert.throws(()=>m01.experienceAward({id:'s',pattern:'t',domain:'combat',difficulty:15,scope:'ordinaire',approved:true},[]),RangeError);
});
