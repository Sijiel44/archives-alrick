/**
 * CORE-COMPAT-001.R2: executes original M01/M03 TypeScript, original MATH XP,
 * and INDEX #105 core-ports (exact frozen git blob). The INDEX DATA validator
 * is INJECTED as a synthetic fixture, not claimed as executed here.
 * The separate index-105-on-clone.test.mjs uses the actual INDEX DATA validator.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {
 previewDataProgression,previewDataCombat,previewDataXp,DATA_NATIVE_PORT_SCHEMA
} from '../src/data-native-ports.mjs';
import {
 previewNativeLevel,previewNativeCombat,inspectNativeXpSuggestion
} from './reference-index105/core-ports.mjs';
const dir=dirname(fileURLToPath(import.meta.url));
const root=resolve(dir,'../../../../..');
const temp=mkdtempSync(join(tmpdir(),'corecompat-r2-native-'));
const require=createRequire(import.meta.url);
const tsFiles=[
 'quartz/components/scripts/atelier5d6-progression.ts',
 'quartz/components/scripts/atelier5d6-combat-m03.ts',
 'quartz/components/scripts/atelier5d6-probabilities.ts',
 'experiments/dg-lot004/math-xp/src/xp-decision.ts'
];
let native,xp,backend;
try {
 try {
  const {build}=await import('esbuild');
  await build({entryPoints:tsFiles.map(p=>resolve(root,p)),outdir:temp,
   outbase:root,bundle:true,platform:'node',format:'cjs',target:'node18',logLevel:'silent'});
  native=require(resolve(temp,'quartz/components/scripts/atelier5d6-progression.js'));
  const combat=require(resolve(temp,'quartz/components/scripts/atelier5d6-combat-m03.js'));
  xp=require(resolve(temp,'experiments/dg-lot004/math-xp/src/xp-decision.js'));
  native={...native,...combat};backend='esbuild';
 }catch(e){
  if(e?.code!=='ERR_MODULE_NOT_FOUND'&&e?.code!=='MODULE_NOT_FOUND')throw e;
  execFileSync('tsc',['--target','ES2022','--module','commonjs','--moduleResolution','node',
   '--skipLibCheck','--strict','--rootDir',root,'--outDir',temp,...tsFiles.map(p=>resolve(root,p))],{cwd:root,stdio:'pipe'});
  native={...require(resolve(temp,'quartz/components/scripts/atelier5d6-progression.js')),
   ...require(resolve(temp,'quartz/components/scripts/atelier5d6-combat-m03.js'))};
  xp=require(resolve(temp,'experiments/dg-lot004/math-xp/src/xp-decision.js'));
  backend='tsc';
 }
}catch(e){rmSync(temp,{force:true,recursive:true});throw Error('OFFICIAL_TS_COMPILE_FAILED: '+(e.stderr?.toString()||e.message));}
process.once('exit',()=>rmSync(temp,{force:true,recursive:true}));
console.log('CORE-COMPAT.R2 official M01/M03/MATH XP compiled using '+backend+'; INDEX #105 exact frozen core ports, DATA validator stub only');

const makeRecord=(recordKind='pj',n=10)=>({
 schema:'cer.index.data-model.p1a.proposal.v0',recordKind,recordId:`rec:demo:${recordKind}-n${n}`,
 version:'0.1.0',revision:0,
 identity:{definitionId:`def:demo:${recordKind}`,definitionVersion:'0.1.0',
  instanceId:`${recordKind==='creature'?'creature':'pj'}:p1a-synthetic-n${n}`,campaignId:'camp:synthetic'},
 provenance:{origin:'synthetic',sourceSchema:'cer.p1a.synthetic.v0',sourceId:'fixture:r2'},
 state:{lifecycle:'draft',layer:'proposal',attestation:{status:'unverified',evidenceRefs:[]}},
 mechanics:{status:'not-evaluated',validationStatus:'unvalidated'},
 narrative:{name:'Candidat fictif',summary:'Essai M01/M03 sans effets'},
 privacy:{visibility:'mj-private',notes:'SECRET_TEST_SANS_FUITE'},media:[],data:{level:n}
});
// ONLY a test fixture. Actual #105 model validation belongs to the companion test.
const syntheticDataValidation=input=>({ok:true,value:structuredClone(input),executable:false});
const ports={validateModelRecord:syntheticDataValidation,previewNativeLevel,
 previewNativeCombat,inspectNativeXpSuggestion,...native,suggestXpFromM01:xp.suggestXpFromM01};
const combat=(n=10)=>({natural:24,rawStat:16,masteryRank:4,situation:0,level:n,
 difficulty:21,kind:'physique',mode:'melee',feasible:true,baseDamage:6});
const frozen=x=>{Object.freeze(x);for(const v of Object.values(x))if(v&&typeof v==='object'&&!Object.isFrozen(v))frozen(v);return x;};

for(const n of [1,5,10,15,20,25])test('INDEX port M01+M01 native N'+n+' (no mutation)',()=>{
 const candidate=frozen(makeRecord('pj',n));const original=structuredClone(candidate);
 const r=previewDataProgression(candidate,ports);
 assert.equal(r.status,'preview');assert.equal(r.engine,'M01');
 assert.deepEqual(r.result,native.progressionAtLevel(n));
 assert.equal(r.appliedToSheet,false);assert.equal(r.executable,false);
 assert.equal(r.playerReady,false);assert.equal(r.recordId,candidate.recordId);
 assert.deepEqual(candidate,original);
});
test('PJ candidate -> official native 5d6 M03 exact result, no copy of formula',()=>{
 const candidate=frozen(makeRecord('pj',10)),input=frozen(combat(10));
 const before={candidate:structuredClone(candidate),combat:structuredClone(input)};
 const r=previewDataCombat(candidate,input,ports);
 assert.equal(r.status,'preview');assert.equal(r.engine,'M03');
 assert.deepEqual(r.result,native.resolveCombatM03(input));
 assert.deepEqual({candidate,combat:input},before);
 assert.equal(r.appliedToSheet,false);assert.equal(r.playerReady,false);
 assert.ok(!JSON.stringify(r).includes('SECRET_TEST_SANS_FUITE'));
});
test('parité PJ/créature : mêmes valeurs natives -> même résultat M03',()=>{
 const c=frozen(combat(10));
 const pj=previewDataCombat(makeRecord('pj',10),c,ports);
 const monster=previewDataCombat(makeRecord('creature',10),c,ports);
 assert.equal(pj.status,'preview');assert.equal(monster.status,'preview');
 assert.deepEqual(pj.result,monster.result);
});
test('aucune autorité native issue de DATA reported-validated',()=>{
 const candidate=makeRecord('pj',10);
 candidate.mechanics.validationStatus='reported-validated';
 const x=previewDataCombat(candidate,{...combat(10),effects:[{approved:true,kind:'impact',magnitude:2}]},ports);
 assert.equal(x.status,'blocked');assert.equal(x.code,'NUMERIC_EXTENSION_NOT_AUTHORIZED');
});
test('absorption/item/malus/narration ne traversent pas la frontière M03',()=>{
 const base=makeRecord('pj',10);
 for(const k of ['effects','effectKind','itemNumeric','itemPenalty','approved','apply','manaCost']){
  const x=previewDataCombat(base,{...combat(10),[k]:k==='effects'?[]:2},ports);
  assert.equal(x.status,'blocked',k);
 }
 assert.equal(previewNativeCombat({effectKind:'absorption'},{previewM03:()=>{throw Error('MUST NOT CALL');}}).ok,false);
 assert.equal(previewNativeCombat({itemNumeric:true},{previewM03:()=>{throw Error('MUST NOT CALL');}}).ok,false);
});
test('N26, niveau décalé ou booléen feasible impropre refusés avant M03',()=>{
 assert.equal(previewDataProgression(makeRecord('pj',26),ports).code,'INVALID_CANDIDATE_LEVEL');
 assert.equal(previewDataCombat(makeRecord('pj',10),combat(25),ports).code,'LEVEL_MISMATCH');
 assert.equal(previewDataCombat(makeRecord('pj',10),{...combat(10),feasible:'true'},ports).code,'INVALID_NATIVE_COMBAT_INPUT');
});
test('ressources, capacités, objets, sorts, rites sont des références non exécutables',()=>{
 for(const kind of ['npc','item','ability','spell-ref','ritual-ref','scene']){
  const r=makeRecord(kind,10);
  const p=previewDataProgression(r,ports);
  assert.equal(p.code,'DESCRIPTIVE_ONLY',kind);
 }
});
test('suggestion XP M01 native via port INDEX sans attribuer / muter fiche',()=>{
 const candidate=frozen(makeRecord('pj',10));
 const ledger=frozen(xp.createXpDecisionLedger({campaignId:'camp:synthetic',characterId:candidate.identity.instanceId,
  initialLevel:10,initialXp:2025,sessionMode:'campagne',characterOrigin:'creation',paceNote:'libre'}));
 const event=frozen({id:'evt:r2:quest1',pattern:'quete-pacifique',domain:'exploration',difficulty:6,scope:'ordinaire',approved:false});
 const before={candidate:structuredClone(candidate),ledger:structuredClone(ledger),event:structuredClone(event)};
 const r=previewDataXp(candidate,ledger,event,ports);
 assert.equal(r.status,'preview');
 assert.equal(r.candidateXp,native.experienceAward(event,[]));
 assert.equal(r.candidateXp,120);
 assert.equal(r.decisionRequired,true);
 assert.equal(r.appliedToSheet,false);
 assert.deepEqual({candidate,ledger,event},before);
 assert.ok(!('nextLedgers' in r));assert.ok(!('awarded' in r));
});
test('événement explicite, appartenance PJ et ref de journal nécessaires',()=>{
 const pj=makeRecord('pj',10),monster=makeRecord('creature',10);
 const ledger=xp.createXpDecisionLedger({campaignId:'camp:synthetic',characterId:pj.identity.instanceId,
  initialLevel:10,initialXp:0,sessionMode:'one-shot',characterOrigin:'pretire',paceNote:'libre'});
 const e={id:'event:synthetic',pattern:'diplomatie',domain:'diplomatie',difficulty:6,scope:'ordinaire',approved:false};
 assert.equal(previewDataXp(monster,ledger,e,ports).code,'NON_PJ_XP');
 assert.equal(previewDataXp(pj,{...ledger,seed:{...ledger.seed,characterId:'pj:alien'}},e,ports).code,'XP_IDENTITY_MISMATCH');
 assert.equal(previewDataXp(pj,ledger,{...e,id:''},ports).code,'XP_IDENTITY_MISMATCH');
});
test('port obligatoire : aucun fallback numérique',()=>{
 assert.equal(previewDataProgression(makeRecord(),{...ports,progressionAtLevel:undefined}).code,'M01_PORT_MISSING');
 assert.equal(previewDataCombat(makeRecord(),combat(),{...ports,resolveCombatM03:undefined}).code,'M03_PORT_MISSING');
 assert.equal(previewDataXp(makeRecord(),{}, {},{...ports,inspectNativeXpSuggestion:undefined}).status,'blocked');
 assert.equal(previewDataCombat(makeRecord(),combat(),{...ports,validateModelRecord:undefined}).status,'unavailable');
});
test('5d6 officiels exacts ; les naturels 5-7 échouent',()=>{
 const m01=require(resolve(temp,'quartz/components/scripts/atelier5d6-probabilities.js'));
 assert.equal(m01.TOTAL_OUTCOMES,7776);
 assert.equal([5,6,7].reduce((s,n)=>s+m01.sumOccurrences(n),0),21);
 for(const n of [5,6,7])assert.equal(native.resolveProgressionAction({natural:n,rawStat:80,masteryRank:12,situation:2,threshold:15,feasible:true}).success,false);
});


test('même événement: décision MJ idempotente, retour de preview bloqué, correction append-only',()=>{
 const candidate=makeRecord('pj',10);
 const initial=xp.createXpDecisionLedger({campaignId:candidate.identity.campaignId,
  characterId:candidate.identity.instanceId,initialLevel:10,initialXp:0,
  sessionMode:'campagne',characterOrigin:'creation',paceNote:'libre'});
 const event={id:JSON.stringify([candidate.identity.campaignId,'run-1','accomplissement-1']),
  pattern:'quête non violente',domain:'exploration',difficulty:6,scope:'ordinaire',approved:false};
 const preview=previewDataXp(candidate,initial,event,ports);
 assert.equal(preview.status,'preview');assert.equal(preview.candidateXp,120);
 const cmd={kind:'award',id:'decision-synthetique-1',expectedRevision:0,
  at:'2026-11-06T12:00:00.000Z',decidedBy:'MJ fictif',reason:'Arbitrage libre',
  approvedByMJ:true,event,decidedXp:42};
 const first=xp.recordXpMjDecision(initial,cmd);
 assert.equal(first.status,'recorded');assert.equal(first.view.xp,42);
 const replay=xp.recordXpMjDecision(first.state,cmd);
 assert.equal(replay.status,'duplicate');assert.equal(replay.view.xp,42);
 assert.equal(previewDataXp(candidate,first.state,event,ports).code,'XP_SOURCE_ALREADY_RECORDED');
 const conflicting=xp.recordXpMjDecision(first.state,{...cmd,decidedXp:43});
 assert.equal(conflicting.status,'rejected');assert.equal(conflicting.code,'ID_COLLISION');
 const correction={kind:'correction',id:'correction-synthetique-1',expectedRevision:1,
  at:'2026-11-06T12:01:00.000Z',decidedBy:'MJ fictif',reason:'Rectification',
  approvedByMJ:true,targetId:cmd.id,deltaXp:-10};
 const corrected=xp.recordXpMjDecision(first.state,correction);
 assert.equal(corrected.status,'recorded');assert.equal(corrected.view.xp,32);
 assert.equal(xp.inspectXpLedger(first.state).xp,42,'journal original inchangé');
 assert.equal(candidate.data.level,10,'niveau de fiche inchangé');
});


test('créature N15 : combat natif disponible mais aucun budget PJ M01 accordé',()=>{
 const creature=makeRecord('creature',15);
 const attack=previewDataCombat(creature,combat(15),ports);
 assert.equal(attack.status,'preview');
 assert.equal(previewDataProgression(creature,ports).code,'CREATURE_NOT_PJ_PROGRESSION');
});
test('statut mécanique explicitement bloqué ou non applicable refuse la simulation',()=>{
 for(const status of ['blocked','not-applicable']){
  const pj=makeRecord('pj',10);pj.mechanics.status=status;
  assert.equal(previewDataCombat(pj,combat(10),ports).code,'MECHANICS_UNAVAILABLE');
  assert.equal(previewDataXp(pj,{}, {},ports).code,'MECHANICS_UNAVAILABLE');
 }
});
