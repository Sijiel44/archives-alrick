/** Execute only on complete npm-ci checkout with esbuild, M01/M03 files pinned by integration. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {previewCandidateViaNative} from '../src/model-r2.mjs';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'../../../..');
const {build}=await import('esbuild');
async function load(path){const out=await build({entryPoints:[resolve(repo,path)],bundle:true,write:false,platform:'node',format:'esm',target:'es2022'});
 return import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'))}
const m01=await load('quartz/components/scripts/atelier5d6-progression.ts');
const prob=await load('quartz/components/scripts/atelier5d6-probabilities.ts');
const fixtures=JSON.parse(readFileSync(resolve(dirname(fileURLToPath(import.meta.url)),'../fixtures/R2_SYNTHETIC_CHAIN.json'),'utf8'));
test('M01 natif 5d6: 7776 issues, 5–7 échouent',()=>{
 assert.equal(prob.TOTAL_OUTCOMES,7776);for(const n of [5,6,7])assert.match(prob.naturalCategory(n),/echec/);
});
test('M01 vrai aux six niveaux, valeurs non dupliquées',()=>{
 for(const level of [1,5,10,15,20,25]){
  const native=m01.progressionAtLevel(level);assert.equal(native.experience,m01.experienceRequired(level));
  assert.equal(native.development,m01.developmentBudget(level));
 }
});
test('adaptateur P1-R2 -> M01 réel pour PJ N1/N10/N25; état non muté',()=>{
 for(const level of [1,10,25]){
  const r=structuredClone(fixtures.records.find(x=>x.recordKind==='pj'&&x.nodeType==='instance'&&x.data.level===level));
  r.mechanics={status:'native-reference',validationStatus:'unvalidated',nativeRef:{module:'M01.progressionAtLevel',sourceBlob:'d2040829ea0da7c0f6eae08dc8c701226bfc53c5'}};
  const before=JSON.stringify(r);const preview=previewCandidateViaNative(r,{progressionAtLevel:m01.progressionAtLevel});
  assert.equal(preview.ok,true,JSON.stringify(preview.issues));
  assert.deepEqual(preview.preview,m01.progressionAtLevel(level));
  assert.equal(preview.applied,false);assert.equal(JSON.stringify(r),before);
 }
});
test('N26 rejeté ; aucune attribution automatique, pas de bonus capacité narratif',()=>{
 assert.throws(()=>m01.progressionAtLevel(26));
 assert.equal(typeof m01.grantAward,'undefined');
});
