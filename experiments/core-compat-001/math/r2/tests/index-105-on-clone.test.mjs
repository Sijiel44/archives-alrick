/**
 * Explicit COMPOSITE gate: it refuses to run if the actual INDEX #105 DATA
 * sources/fixtures are not present; NEVER substitute a validator mock here.
 * Needs the repo with INDEX #105 + MATH #99 + official Quartz M01/M03 sources.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {tmpdir} from 'node:os';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {previewDataProgression,previewDataCombat,previewDataXp} from '../src/data-native-ports.mjs';
const dir=dirname(fileURLToPath(import.meta.url));
const repo=resolve(dir,'../../../../..');
const indexRoot=process.env.INDEX_P1A_ROOT?resolve(process.env.INDEX_P1A_ROOT):resolve(repo,'experiments/p1a-index');
const indexModel=resolve(indexRoot,'src/data-model.mjs');
const indexPorts=resolve(indexRoot,'src/core-ports.mjs');
const indexFixtures=resolve(indexRoot,'fixtures/P1A_FICTION_11_RECORDS.json');
for(const f of [indexModel,indexPorts,indexFixtures])if(!existsSync(f))
 throw Error('INDEX_105_SOURCE_ABSENT: '+f+' — composer les blobs de PR #105 avant cette recette');
const model=await import(pathToFileURL(indexModel).href);
const index=await import(pathToFileURL(indexPorts).href);
const records=JSON.parse(readFileSync(indexFixtures,'utf8'));
const tmp=mkdtempSync(join(tmpdir(),'core-index105-'));
process.once('exit',()=>rmSync(tmp,{force:true,recursive:true}));
const source=[
 'quartz/components/scripts/atelier5d6-progression.ts',
 'quartz/components/scripts/atelier5d6-combat-m03.ts',
 'experiments/dg-lot004/math-xp/src/xp-decision.ts'];
let m01,m03,math;
try{
 const {build}=await import('esbuild');
 const es=await Promise.all(source.map(async (p,i)=>{
  const output=join(tmp,'native'+i+'.cjs');
  await build({entryPoints:[resolve(repo,p)],outfile:output,bundle:true,platform:'node',format:'cjs',target:'node18',logLevel:'silent'});
  return output;
 }));
 const require=createRequire(import.meta.url);
 [m01,m03,math]=es.map(p=>require(p));
}catch(e){throw Error('INDEX_105_COMPOSITE_ESBUILD_MISSING_OR_FAILED: '+e.message)}
const ports={validateModelRecord:model.validateModelRecord,previewNativeLevel:index.previewNativeLevel,
 previewNativeCombat:index.previewNativeCombat,inspectNativeXpSuggestion:index.inspectNativeXpSuggestion,
 progressionAtLevel:m01.progressionAtLevel,resolveCombatM03:m03.resolveCombatM03,
 suggestXpFromM01:math.suggestXpFromM01};
const by=x=>records.find(r=>r.recordId===x);
const pj=by('rec:demo:pj-n10'),creature=by('rec:demo:creature-base');
const combat={natural:24,rawStat:16,masteryRank:4,situation:0,level:10,difficulty:21,kind:'physique',mode:'melee',feasible:true,baseDamage:6};

test('INDEX #105 dataset of 11 fictional records is valid and does not grant authority',()=>{
 assert.equal(records.length,11);
 assert.equal(model.validateModelDataset(records).ok,true);
 assert.equal(pj.mechanics.validationStatus,'unvalidated');
 assert.equal(pj.identity.instanceId,'pj:p1a-talven');
 assert.notEqual(pj.identity.definitionId,pj.identity.instanceId);
 assert.equal(pj.state.layer,'proposal');
});
test('INDEX #105 candidate -> native M01 progression N10 exact, nonmutation',()=>{
 const before=structuredClone(records);
 const r=previewDataProgression(pj,ports);
 assert.equal(r.status,'preview');assert.deepEqual(r.result,m01.progressionAtLevel(10));
 assert.equal(r.result.experience,2025);assert.equal(r.appliedToSheet,false);
 assert.deepEqual(records,before);
});
test('INDEX #105 candidate -> M03 real native combat and PJ/creature parity',()=>{
 const before=structuredClone(records);
 const r=previewDataCombat(pj,combat,ports),other=previewDataCombat(creature,combat,ports);
 assert.equal(r.status,'preview');assert.equal(other.status,'preview');
 assert.deepEqual(r.result,m03.resolveCombatM03(combat));
 assert.deepEqual(r.result,other.result);
 assert.equal(r.playerReady,false);assert.deepEqual(records,before);
});
test('INDEX #105 candidate -> M01 XP suggestion only, chosen amount remains MJ domain',()=>{
 const ledger=math.createXpDecisionLedger({campaignId:pj.identity.campaignId,
  characterId:pj.identity.instanceId,initialLevel:10,initialXp:2025,
  sessionMode:'campagne',characterOrigin:'pretire',paceNote:'libre'});
 const event={id:'evt:p1a:pacifique',pattern:'quête sans violence',domain:'exploration',difficulty:6,scope:'ordinaire',approved:false};
 const before=structuredClone({ledger,event,pj});
 const r=previewDataXp(pj,ledger,event,ports);
 assert.equal(r.status,'preview');assert.equal(r.candidateXp,m01.experienceAward(event,[]));
 assert.equal(r.decisionRequired,true);assert.equal(r.appliedToSheet,false);
 assert.deepEqual({ledger,event,pj},before);
});
test('INDEX #105 refuses N26; descriptive item, ability, spell and rite have no numerical port',()=>{
 const n26=structuredClone(pj);n26.data.level=26;
 assert.equal(previewDataProgression(n26,ports).status,'blocked');
 for(const name of ['rec:demo:item','rec:demo:ability','rec:demo:spell','rec:demo:ritual']){
  assert.equal(previewDataProgression(by(name),ports).code,'DESCRIPTIVE_ONLY');
 }
});
test('INDEX P1 selected-player candidate is not a private export or a player DTO',()=>{
 assert.equal(model.makeSelectedPlayerCandidate(pj,{selected:false}).ok,false);
 const selected=model.makeSelectedPlayerCandidate(pj,{selected:true});
 assert.equal(selected.ok,true);assert.equal(selected.requiresStudioWhitelist,true);
 assert.equal(JSON.stringify(selected).includes('LAB_PRIVATE'),false);
});
