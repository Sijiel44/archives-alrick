import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {MODEL_LEVELS} from '../src/data-model.mjs';
import {previewNativeLevel,previewLevelReferenceMatrix,inspectNativeXpSuggestion,previewNativeCombat} from '../src/core-ports.mjs';
const dir=dirname(fileURLToPath(import.meta.url));
const refs=JSON.parse(readFileSync(resolve(dir,'../fixtures/CORE_SOURCE_SHA.json'),'utf8'));
const code=x=>x.issues?.[0]?.code;
test('six niveaux d’invariant conformes à la matrice demandée',()=>{
 assert.deepEqual([...MODEL_LEVELS],[1,5,10,15,20,25]);
});
test('toutes les sources figées ont un SHA commit + blob explicites',()=>{
 for(const r of refs.sources){
  assert.match(r.commit,/^[a-f0-9]{40}$/i,r.path);
  assert.match(r.blob,/^[a-f0-9]{40}$/i,r.path);
 }
});
test('M01 sans port fail closed, aucune formule de secours',()=>{
 assert.equal(code(previewNativeLevel(10)),'NATIVE_M01_UNAVAILABLE');
});
for(const level of [0,26,2.5,-1])test('M01 niveau invalide '+level+' refusé avant délégation',()=>{
 let called=false;const r=previewNativeLevel(level,{progressionAtLevel(){called=true;}});
 assert.equal(code(r),'LEVEL_OUT_OF_RANGE');assert.equal(called,false);
});
test('M01: 6 appels à la fonction native injectée, résultats inchangés',()=>{
 const calls=[];const matrix=previewLevelReferenceMatrix({progressionAtLevel(level){calls.push(level);return {level,experience:level*123,unknownNative:{marker:true}};}});
 assert.deepEqual(calls,[1,5,10,15,20,25]);assert.equal(matrix.ok,true);
 assert.equal(matrix.levels[2].preview.unknownNative.marker,true);
 assert.equal(matrix.levels.every(x=>!x.applied&&!x.executable),true);
});
test('port M01 réponse falsifiée rejetée',()=>{
 const x=previewNativeLevel(5,{progressionAtLevel:()=>({level:6,experience:2})});
 assert.equal(code(x),'INVALID_NATIVE_RESPONSE');
});
test('port XP absent non remplacé par barème local',()=>{
 assert.equal(code(inspectNativeXpSuggestion({id:'x'})),'NATIVE_XP_UNAVAILABLE');
});
test('port XP ne convertit pas niveau ennemi en indice',()=>{
 let input;const r=inspectNativeXpSuggestion({id:'evt:fake',threatLevel:20},
 {suggestXpFromM01(x){input=x;return {status:'suggested',nativeSuggestedXp:77};}});
 assert.equal(r.ok,true);assert.equal(r.candidateXp,77);assert.equal(input.threatLevel,20);
 assert.equal(r.awarded,false);assert.equal(r.levelValidated,false);
});
test('XP unauthorized approved/commit bloqués',()=>{
 for(const flag of ['approved','commit'])assert.equal(code(inspectNativeXpSuggestion({[flag]:true},{suggestXpFromM01:()=>({status:'suggested',nativeSuggestedXp:12})})),'XP_AUTHORITY_FORBIDDEN');
});
test('M03 sans port ne calcule aucun dégât',()=>{
 assert.equal(code(previewNativeCombat({actor:'pj'})),'NATIVE_M03_UNAVAILABLE');
});
test('M03 absorption et objet numérique restent bloqués',()=>{
 for(const data of [{effectKind:'absorption'},{itemNumeric:true},{approved:true},{apply:true}]){
  let called=false;const r=previewNativeCombat(data,{previewM03(){called=true;return{damage:100};}});
  assert.equal(code(r),'NON_HOMOLOGATED_EFFECT');assert.equal(called,false);
 }
});
test('M03 délègue intégralement un aperçu natif sans mutation',()=>{
 const request={natural:17,defender:{level:10},feasible:true};const prior=structuredClone(request);
 const r=previewNativeCombat(request,{previewM03(x){x.defender.level=8;return {damage:11,applied:false};}});
 assert.equal(r.ok,true);assert.equal(r.executable,false);assert.deepEqual(request,prior);
});
test('M03 refuse un délégué qui prétend avoir appliqué une action',()=>{
 assert.equal(code(previewNativeCombat({}, {previewM03:()=>({applied:true})})),'INVALID_NATIVE_RESPONSE');
});

test('M03 réponse native absente refusée (fail-closed)',()=>{
 assert.equal(code(previewNativeCombat({}, {previewM03:()=>undefined})),'INVALID_NATIVE_RESPONSE');
});
