/** Execute ONLY in a complete npm-ci repository checkout; do not run in isolated lab. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
const esbuild=await import('esbuild');
const source=resolve(root,'quartz/components/scripts/atelier5d6-progression.ts');
const probSource=resolve(root,'quartz/components/scripts/atelier5d6-probabilities.ts');
const math=await esbuild.build({entryPoints:[source],bundle:true,write:false,platform:'node',format:'esm',target:'es2022'});
const prob=await esbuild.build({entryPoints:[probSource],bundle:true,write:false,platform:'node',format:'esm',target:'es2022'});
const m01=await import('data:text/javascript;base64,'+Buffer.from(math.outputFiles[0].text).toString('base64'));
const m00=await import('data:text/javascript;base64,'+Buffer.from(prob.outputFiles[0].text).toString('base64'));
test('probabilités officielles : 5d6 = 7776',()=>assert.equal(m00.TOTAL_OUTCOMES,7776));
test('naturals 5–7 échecs M01 officiels',()=>{for(const n of [5,6,7])assert.match(m00.naturalCategory(n),/echec/);});
test('M01 seuils niveaux 1/5/10/15/20/25 via source native',()=>{for(const n of [1,5,10,15,20,25]){
 const r=m01.progressionAtLevel(n);assert.equal(r.level,n);
 assert.equal(r.experience,m01.experienceRequired(n));
 assert.equal(r.development,m01.developmentBudget(n));
}});
test('M01 refuse niveau 26',()=>assert.throws(()=>m01.progressionAtLevel(26)));
test('suggestion XP M01 sans approbation exceptionnelle',()=>{
 const event={id:'evt:native-synthetic',pattern:'pas-de-farming',domain:'exploration',difficulty:6,scope:'majeur',approved:false};
 assert.equal(m01.experienceAward(event,[]),0);
});
