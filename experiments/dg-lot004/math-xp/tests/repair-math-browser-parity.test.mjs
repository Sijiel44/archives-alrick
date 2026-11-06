/** L004-REPAIR. MATH native TypeScript only, browser-input-equivalent synthetic data. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../../../..');
const tmp=mkdtempSync(join(tmpdir(),'l004-repair-'));
let math,xp,m01,compiler;
try {
  try {
    const {build}=await import('esbuild');
    await build({entryPoints:[resolve(here,'../src/encounter-recommendations.ts')],outfile:join(tmp,'math.cjs'),bundle:true,platform:'node',format:'cjs',target:'node18',logLevel:'silent'});
    await build({entryPoints:[resolve(here,'../src/xp-decision.ts')],outfile:join(tmp,'xp.cjs'),bundle:true,platform:'node',format:'cjs',target:'node18',logLevel:'silent'});
    await build({entryPoints:[resolve(root,'quartz/components/scripts/atelier5d6-progression.ts')],outfile:join(tmp,'m01.cjs'),bundle:true,platform:'node',format:'cjs',target:'node18',logLevel:'silent'});
    math=createRequire(import.meta.url)(join(tmp,'math.cjs'));
    xp=createRequire(import.meta.url)(join(tmp,'xp.cjs'));
    m01=createRequire(import.meta.url)(join(tmp,'m01.cjs'));
    compiler='esbuild';
  } catch (err) {
    if(err?.code!=='ERR_MODULE_NOT_FOUND'&&err?.code!=='MODULE_NOT_FOUND')throw err;
    execFileSync('tsc',['--target','ES2022','--module','commonjs','--moduleResolution','node','--skipLibCheck','--strict','--rootDir',root,'--outDir',tmp,resolve(here,'../src/encounter-recommendations.ts')],{cwd:root,stdio:'pipe'});
    math=createRequire(import.meta.url)(join(tmp,'experiments/dg-lot004/math-xp/src/encounter-recommendations.js'));
    xp=createRequire(import.meta.url)(join(tmp,'experiments/dg-lot004/math-xp/src/xp-decision.js'));
    m01=createRequire(import.meta.url)(join(tmp,'quartz/components/scripts/atelier5d6-progression.js'));
    compiler='tsc';
  }
} catch (err) { rmSync(tmp,{recursive:true,force:true});throw Error('M01 TypeScript was not executed: '+(err.stderr?.toString()??err.message)); }
process.once('exit',()=>rmSync(tmp,{recursive:true,force:true}));
console.log('L004_REPAIR_MATH_NATIVE compiler='+compiler);
const browserCampaign='d5349adc-2aaa-4700-b091-808654eae994'; // fictitious browser-shaped UUID
const browserPj='pj:dg004-fake-pj'; // createFakePJBytes() -> ARCHIVES prefix:sheet.id
const secondPj='pj:companion-7';
const npc='pnj:mentor-20';
const browserEvent={id:'evt-demo-m01-l004',pattern:'exploration-fictive',domain:'exploration',difficulty:3,scope:'ordinaire',approved:false};
const ledger=(id,level)=>xp.createXpDecisionLedger({campaignId:browserCampaign,characterId:id,initialLevel:level,
  initialXp:0,sessionMode:'campagne',characterOrigin:'import',paceNote:'libre'});
const scene=()=>({campaignId:browserCampaign,runId:'run-1',accomplishmentId:'boss-15',kind:'encounter',eventPattern:'exploration-fictive',eventDomain:'exploration',scope:'ordinaire',eventApprovedByMJ:false,
  difficultyBeforeAssistance:'difficile',realizedDifficulty:'moderee',explicitM01Index:6,
  actors:[{instanceId:browserPj,role:'pj',level:5},{instanceId:secondPj,role:'pj',level:7},{instanceId:npc,role:'pnj',level:20}],
  selectedPjIds:[browserPj,secondPj],threats:[{instanceId:'boss-15',level:15,count:1,boss:true}],
  assistance:{level:'decisive',npcIds:[npc],reason:'Aide déterminante attestée par le MJ'},
  ledgersByPj:{[browserPj]:ledger(browserPj,5),[secondPj]:ledger(secondPj,7)} });

test('même événement que le clic Chrome b75: M01 natif = port MATH, 60 XP consultatifs',()=>{
  const state=ledger(browserPj,5);const before=structuredClone(state);
  const direct=m01.experienceAward(browserEvent,[]);
  const result=xp.suggestXpFromM01(state,browserEvent);
  assert.equal(direct,60);assert.equal(result.status,'suggested');assert.equal(result.nativeSuggestedXp,direct);
  assert.deepEqual(state,before);assert.equal(state.entries.length,0);
});

test('menace N15 + PJ faibles + PNJ N20 décisif: 2 PJ proposés, 0 PNJ crédité',()=>{
  const s=scene(),before=structuredClone(s);
  const p=math.previewEncounterXp(s);
  assert.equal(p.status,'preview');assert.equal(p.proposedIndex,6);
  assert.deepEqual(p.selectedPjIds,[browserPj,secondPj]);
  assert.deepEqual(p.suggestions.map(x=>x.modelA.nativeSuggestedXp),[120,120]);
  assert.equal(p.suggestions.length,2);assert.equal(p.canAutoApply,false);assert.equal(p.appliedToSheet,false);
  assert.deepEqual(s,before);
});

test('décision MJ commune, exception individuelle, rejeu idempotent, correction et journal sans fiche',()=>{
  const s=scene();const before=structuredClone(s);
  const decision={id:'decision-1',at:'2026-11-05T10:00:00.000Z',decidedBy:'MJ-fictif',reason:'Coopération réelle',approvedByMJ:true};
  const input={mode:'common',commonXp:40,overrides:{[secondPj]:20},decision};
  const recorded=math.recordEncounterXpChoice(s,input);
  assert.equal(recorded.status,'recorded');assert.deepEqual(recorded.receipts.map(x=>x.decidedXp),[40,20]);
  assert.equal(recorded.appliedToSheet,false);assert.equal(Object.keys(recorded.nextLedgers).length,2);
  assert.deepEqual(s,before);
  const replay=math.recordEncounterXpChoice({...s,ledgersByPj:recorded.nextLedgers},input);
  assert.equal(replay.status,'duplicate');assert.deepEqual(replay.receipts.map(x=>x.status),['duplicate','duplicate']);
  const current=recorded.nextLedgers[browserPj];
  const corrected=xp.recordXpMjDecision(current,{kind:'correction',id:'correction-1',expectedRevision:current.revision,
    at:'2026-11-05T10:00:01.000Z',decidedBy:'MJ-fictif',reason:'Réévaluation de la contribution',approvedByMJ:true,
    targetId:recorded.receipts[0].decisionId,deltaXp:-10});
  assert.equal(corrected.status,'recorded');assert.equal(corrected.view.xp,30);
  assert.equal(corrected.state.entries.length,2);assert.equal(corrected.appliedToSheet,false);
});

test('boss + quête: même accomplishmentId empêchera une double décision; PJ-only et erreur 25+',()=>{
  const s=scene();const d={id:'deci2',at:'2026-11-05T10:00:00.000Z',decidedBy:'MJ-fictif',reason:'Un accomplissement',approvedByMJ:true};
  const a=math.recordEncounterXpChoice(s,{mode:'common',commonXp:30,decision:d});assert.equal(a.status,'recorded');
  const q={...s,kind:'quest',ledgersByPj:a.nextLedgers};
  const second=math.recordEncounterXpChoice(q,{mode:'common',commonXp:30,decision:{...d,id:'deci3'}});
  assert.equal(second.status,'rejected');assert.equal(second.code,'SOURCE_DUPLICATE');
  const pnjs={...s,selectedPjIds:[npc]};assert.equal(math.previewEncounterXp(pnjs).status,'rejected');
  const over={...s,threats:[{instanceId:'myth',level:26,count:1,boss:true}]};assert.equal(math.previewEncounterXp(over).status,'unavailable');
});
