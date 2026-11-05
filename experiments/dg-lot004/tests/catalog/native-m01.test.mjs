/**
 * OPTION D'EXÉCUTION SUR CLONE COMPLET UNIQUEMENT (esbuild déjà installé via npm ci).
 * Cette suite charge le VRAI TypeScript M01 de la base PR85 ; aucun moteur recopié.
 * Si esbuild ou la source manquent, elle ÉCHOUE, elle ne fait pas SKIP vert.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {createXpSuggestion, previewXpSuggestion, previewLevelMatrix, LEVEL_REFERENCE} from '../../src/catalog/index.mjs';

const nativePath=fileURLToPath(new URL('../../../../quartz/components/scripts/atelier5d6-progression.ts',import.meta.url));
const {outputFiles}=await build({entryPoints:[nativePath],bundle:true,write:false,format:'esm',platform:'node',target:'es2022',logLevel:'silent'});
const native=await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].contents).toString('base64')}`);
const provenance={originKind:'illustrative',sourceSchema:'fictif.m01',sourceId:'xp-event',sourceVersion:'1'};
function sample(scope='ordinaire') {
  const r=createXpSuggestion({id:'xp:demo:xp-evaluation',version:'0.1.0',target:{campaignId:'camp-a',characterInstanceId:'pj-a'},
    event:{id:'xp-event-1',pattern:'preuve-fictive',domain:'savoir',difficulty:3,scope},
    context:{initialLevel:5,oneShot:{id:'os-a',runId:'run-a'}},provenance,rationale:'Comparaison directe M01 en lecture seule'});
  assert.equal(r.ok,true,JSON.stringify(r.errors));return r.suggestion;
}

test('M01-NATIVE1 six niveaux de référence exacts vs module officiel réel',()=>{
  const preview=previewLevelMatrix({progressionAtLevel:native.progressionAtLevel});
  assert.equal(preview.ok,true,JSON.stringify(preview.errors));
  assert.deepEqual(preview.rows,LEVEL_REFERENCE.map(level=>native.progressionAtLevel(level)));
  assert.deepEqual(preview.rows.map(x=>x.level),[1,5,10,15,20,25]);
  assert.deepEqual(preview.rows.map(x=>x.experience),[0,400,2025,4900,9025,14400]);
  assert.deepEqual(preview.rows.map(x=>x.development),[0,24,54,84,114,144]);
  assert.equal(preview.levelValidated,false);
});
test('M01-NATIVE2 comparaison directe d’experienceAward sans attribution',()=>{
  const s=sample(),history=[];
  const expected=native.experienceAward({...s.event,approved:false},history);
  const result=previewXpSuggestion(s,{experienceAward:native.experienceAward,history});
  assert.equal(result.ok,true,JSON.stringify(result.errors));
  assert.equal(result.candidateXp,expected);
  assert.equal(result.awardCommitted,false);
  assert.equal(result.levelValidated,false);
});
test('M01-NATIVE3 répétition et identifiants passés au moteur, sans score maison',()=>{
  const s=sample();
  for(const history of [[],[{...s.event,approved:true,id:'ancien-1'}],
    [{...s.event,approved:true,id:'ancien-1'}, {...s.event,approved:true,id:'ancien-2'}],
    [{...s.event,approved:true,id:s.event.id}]]){
    const result=previewXpSuggestion(s,{experienceAward:native.experienceAward,history});
    assert.equal(result.ok,true,JSON.stringify(result.errors));
    assert.equal(result.candidateXp,native.experienceAward({...s.event,approved:false},history));
  }
});
test('M01-NATIVE4 majeur/légendaire restent bloqués sans approbation MJ',()=>{
  for(const scope of ['majeur','legendaire']){
    const result=previewXpSuggestion(sample(scope),{experienceAward:native.experienceAward,history:[]});
    assert.equal(result.ok,false);assert.equal(result.status,'blocked');
  }
});
test('M01-NATIVE5 canReachLevel reste séparé, paliers 21–25 exigeants',()=>{
  const xp=native.experienceRequired(21);
  assert.equal(native.canReachLevel(21,xp,[]),false);
  assert.equal(native.canReachLevel(21,xp,[21]),true);
  assert.equal(native.canReachLevel(25,native.experienceRequired(25),[21,22,23,24]),false);
});
test('M01-NATIVE6 initialLevel et oneShot ne changent pas le calcul natif',()=>{
  const s=sample();const x={...s,context:{...s.context,initialLevel:25,oneShot:{id:'os-a',runId:'run-a'}}};
  const p=previewXpSuggestion(s,{experienceAward:native.experienceAward,history:[]});
  const q=previewXpSuggestion(x,{experienceAward:native.experienceAward,history:[]});
  assert.equal(p.ok,true);assert.equal(q.ok,true);assert.equal(p.candidateXp,q.candidateXp);
});
