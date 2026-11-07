/**
 * L004-REPAIR composite contract probe. Must run in the COMPLETE DG004 checkout.
 * EXPECT_INDEX=legacy proves the exact b75 rejection; EXPECT_INDEX=fixed is a release gate.
 * Never creates, imports or modifies a PJ sheet or awards XP.
 * Missing INDEX -> exit with an explicit error, not a pretend PASS.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../../../..');
const target=resolve(root,'experiments/dg-lot004/src/catalog/index.mjs');
if(!existsSync(target))throw Error('INDEX_MODULE_ABSENT: test NON EXÉCUTABLE sur la branche MATH seule; assembler le HEAD intégré et relancer.');
const expected=process.env.EXPECT_INDEX;
if(expected!=='legacy'&&expected!=='fixed')throw Error('EXPECT_INDEX=legacy|fixed obligatoire pour distinguer b75 et R2.');
const index=await import(pathToFileURL(target).href);
const tmp=mkdtempSync(join(tmpdir(),'dg004-cross-'));
let xp,encounter,m01;
try{
  try{
    const {build}=await import('esbuild');
    for(const [from,to] of [['../src/xp-decision.ts','xp.cjs'],['../src/encounter-recommendations.ts','encounter.cjs'],['../../../../quartz/components/scripts/atelier5d6-progression.ts','m01.cjs']]){
      await build({entryPoints:[resolve(here,from)],outfile:join(tmp,to),bundle:true,platform:'node',format:'cjs',target:'node18',logLevel:'silent'});
    }
    xp=createRequire(import.meta.url)(join(tmp,'xp.cjs'));
    encounter=createRequire(import.meta.url)(join(tmp,'encounter.cjs'));
    m01=createRequire(import.meta.url)(join(tmp,'m01.cjs'));
  }catch(e){
    if(e?.code!=='ERR_MODULE_NOT_FOUND'&&e?.code!=='MODULE_NOT_FOUND')throw e;
    execFileSync('tsc',['--target','ES2022','--module','commonjs','--moduleResolution','node','--skipLibCheck','--strict','--rootDir',root,'--outDir',tmp,
      resolve(here,'../src/encounter-recommendations.ts')],{cwd:root,stdio:'pipe'});
    xp=createRequire(import.meta.url)(join(tmp,'experiments/dg-lot004/math-xp/src/xp-decision.js'));
    encounter=createRequire(import.meta.url)(join(tmp,'experiments/dg-lot004/math-xp/src/encounter-recommendations.js'));
    m01=createRequire(import.meta.url)(join(tmp,'quartz/components/scripts/atelier5d6-progression.js'));
  }
}catch(e){rmSync(tmp,{recursive:true,force:true});throw Error('NATIVE_TS_COMPILE_NOT_EXECUTED: '+(e.stderr?.toString()??e.message));}
process.once('exit',()=>rmSync(tmp,{recursive:true,force:true}));
console.log('DG004_INDEX_BRIDGE expected='+expected+' (using actual INDEX module and official M01 TypeScript)');
// Same shape as actual DG004 Chrome click in demo-runtime.mjs@b75, including the native pj: prefix.
const campaignId='a3228e4a-8d7f-4a8b-a471-4a180bd70294'; // deterministic browser-shaped fake UUID
const pjId='pj:dg004-fake-pj';
const event={id:'evt-demo-m01-l004',pattern:'exploration-fictive',domain:'exploration',difficulty:3,scope:'ordinaire',approved:false};
const makeLedger=(id,level)=>xp.createXpDecisionLedger({campaignId,characterId:id,initialLevel:level,initialXp:0,
  sessionMode:'campagne',characterOrigin:'import',paceNote:'libre'});
function browserInput(){return {namespace:'demo',version:'0.1.0',target:{campaignId,characterInstanceId:pjId},
  event:{id:event.id,pattern:event.pattern,domain:event.domain,difficulty:event.difficulty,scope:event.scope},
  context:{initialLevel:5},provenance:{originKind:'illustrative',sourceSchema:'cer.dg004.fake.xp',
    sourceId:'event-demo-l004',sourceVersion:'1'},rationale:'Exploration fictive ; aucune récompense créditée'};}

test('même formulaire DOM b75 + parité M01 : mode legacy reproduit erreur, mode fixed accepte ID exact',()=>{
 const data=browserInput(),before=structuredClone(data),ledger=makeLedger(pjId,5),ledgerBefore=structuredClone(ledger);
 const math=xp.suggestXpFromM01(ledger,event),direct=m01.experienceAward(event,[]);
 assert.equal(math.status,'suggested');assert.equal(math.nativeSuggestedXp,direct);assert.equal(direct,60);
 const candidate=index.createXpSuggestion(data);
 if(expected==='legacy'){
   assert.equal(candidate.ok,false);
   assert.ok(candidate.errors.some(e=>e==='JSON privé invalide: Valeur non JSON'));
   console.log('DG004_INDEX_B75_REPRODUCED: undefined ID reaches clonePrivateJson');
 }else{
   assert.equal(candidate.ok,true,JSON.stringify(candidate));
   assert.equal(candidate.suggestion.target.characterInstanceId,pjId);
   const viaIndex=index.previewXpSuggestion(candidate.suggestion,{experienceAward:m01.experienceAward,history:[]});
   assert.equal(viaIndex.ok,true,JSON.stringify(viaIndex));assert.equal(viaIndex.candidateXp,direct);
   assert.equal(viaIndex.awardCommitted,false);assert.equal(viaIndex.levelValidated,false);
 }
 assert.deepEqual(data,before);assert.deepEqual(ledger,ledgerBefore);
});

if(expected==='fixed'){
 test('INDEX R2 fragment -> MATH original -> M01 sur boss N15 aidé PNJ20, pas de crédit',()=>{
   const pj2='pj:companion-7',npc='pnj:mentor-20';
   const pjs=[{instanceId:pjId,role:'pj',level:5},{instanceId:pj2,role:'pj',level:7}];
   const example=browserInput();example.event.difficulty=6;example.event.id='boss15-end';
   example.sourceContext={kind:'encounter',runId:'run-1',accomplishmentId:'boss-15',eventStatus:'closed',
     participants:[...pjs,{instanceId:npc,role:'pnj',level:20}],selectedPjIds:[pjId,pj2],
     threats:[{instanceId:'boss-15',level:15,count:1,boss:true}],
     assistance:{level:'decisive',npcIds:[npc],reason:'Aide déterminante attestée par le MJ'},
     difficultyBeforeAssistance:'difficile',realizedDifficulty:'moderee',explicitM01Index:6};
   const c=index.createXpSuggestion(example);assert.equal(c.ok,true,JSON.stringify(c));
   const duplicateSource=structuredClone(example);
   duplicateSource.event.id='boss15-quest-editorial-id';
   duplicateSource.sourceContext.kind='quest'; // even when editorial record changes, same accomplishmentId/run/PJ
   const quest=index.createXpSuggestion(duplicateSource);
   assert.equal(quest.ok,true,JSON.stringify(quest));
   const registry=index.validateXpRegistry([c.suggestion,quest.suggestion]);
   assert.equal(registry.ok,false,'same accomplishment must not be double-counted as boss and quest');
   const fragment=index.previewMathEncounterFragment(c.suggestion);assert.equal(fragment.ok,true,JSON.stringify(fragment));
   assert.ok(fragment.missingExternalFields.includes('eventApprovedByMJ'));
   assert.ok(fragment.missingExternalFields.includes('ledgersByPj'));
   const ledgers={[pjId]:makeLedger(pjId,5),[pj2]:makeLedger(pj2,7)};
   const native={...fragment.mathInputFragment,eventApprovedByMJ:false,ledgersByPj:ledgers};
   const before=structuredClone(ledgers);
   const p=encounter.previewEncounterXp(native);
   assert.equal(p.status,'preview',JSON.stringify(p));
   const candidate=index.previewXpSuggestion(c.suggestion,{experienceAward:m01.experienceAward,history:[]});
   assert.equal(candidate.ok,true,JSON.stringify(candidate));
   assert.equal(candidate.sourceEventId,p.source.eventId);
   assert.equal(candidate.candidateXp,p.suggestions[0].modelA.nativeSuggestedXp);
   assert.equal(candidate.candidateXp,m01.experienceAward({id:p.source.eventId,pattern:example.event.pattern,
     domain:example.event.domain,difficulty:6,scope:'ordinaire',approved:false},[]));
   assert.equal(p.suggestions.length,2);assert.equal(p.canAutoApply,false);
   assert.deepEqual(ledgers,before);
   // A manual decision is a separate MJ command, not INDEX preview.
   const d={id:'dec1',at:'2026-11-05T10:00:00.000Z',decidedBy:'MJ-fiction',reason:'Arbitrage libre',approvedByMJ:true};
   const recorded=encounter.recordEncounterXpChoice(native,{mode:'common',commonXp:40,overrides:{[pj2]:20},decision:d});
   assert.equal(recorded.status,'recorded');assert.equal(recorded.appliedToSheet,false);
   assert.deepEqual(recorded.receipts.map(x=>x.decidedXp),[40,20]);
   const reference=index.createXpMathJournalReference(c.suggestion,{
     status:recorded.receipts[0].status,pjId:recorded.receipts[0].pjId,decisionId:recorded.receipts[0].decisionId
   });
   assert.equal(reference.ok,true,JSON.stringify(reference));
   assert.equal(reference.reference.authority,'unverified-external-math-journal');
   assert.equal(reference.reference.appliedToSheet,false);
   assert.deepEqual(ledgers,before);
 });
}
