/** L004-B : tests TypeScript réels, sans Python ni moteur XP alternatif. */
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
const modulePath=resolve(here,'../src/xp-decision.ts');
const m01Path=resolve(root,'quartz/components/scripts/atelier5d6-progression.ts');
const temporary=mkdtempSync(join(tmpdir(),'dg004-math-xp-'));
let prototype,native,compiler;
try{
 try{
  const {build}=await import('esbuild');
  await build({entryPoints:[modulePath],outfile:join(temporary,'prototype.cjs'),bundle:true,platform:'node',format:'cjs',target:'node18',logLevel:'silent'});
  await build({entryPoints:[m01Path],outfile:join(temporary,'native.cjs'),bundle:true,platform:'node',format:'cjs',target:'node18',logLevel:'silent'});
  prototype=createRequire(import.meta.url)(join(temporary,'prototype.cjs'));
  native=createRequire(import.meta.url)(join(temporary,'native.cjs'));
  compiler='esbuild';
 }catch(e){
  if(e?.code!=='ERR_MODULE_NOT_FOUND'&&e?.code!=='MODULE_NOT_FOUND')throw e;
  execFileSync('tsc',['--target','ES2022','--module','commonjs','--moduleResolution','node','--skipLibCheck','--strict','--rootDir',root,'--outDir',temporary,modulePath,m01Path],{cwd:root,stdio:'pipe'});
  prototype=createRequire(import.meta.url)(join(temporary,'experiments/dg-lot004/math-xp/src/xp-decision.js'));
  native=createRequire(import.meta.url)(join(temporary,'quartz/components/scripts/atelier5d6-progression.js'));
  compiler='tsc';
 }
}catch(e){rmSync(temporary,{force:true,recursive:true});throw new Error('Compilation des TS officiels impossible : '+(e.stderr?.toString()??e.message),{cause:e});}
process.once('exit',()=>rmSync(temporary,{force:true,recursive:true}));
console.log('L004-B moteur officiel M01 chargé ; backend '+compiler+' ; aucun changement de barème');

const seed=(extra={})=>({campaignId:'camp-fictive',characterId:'personnage-fictif',initialLevel:1,initialXp:0,sessionMode:'campagne',characterOrigin:'creation',paceNote:'libre',...extra});
const e=(id='evt-1',pattern='exploration-libre',difficulty=6,scope='ordinaire',approved=true)=>({id,pattern,domain:'exploration',difficulty,scope,approved});
const cmd=(id,expectedRevision,extra={})=>({id,expectedRevision,at:'2026-11-05T10:00:00.000Z',decidedBy:'MJ fictif',reason:'Arbitrage explicite',approvedByMJ:true,kind:'award',event:e(id),decidedXp:42,...extra});
const setup=()=>prototype.createXpDecisionLedger(seed());

for(const n of [1,5,10,15,20,25]){
 test('parité native M01 XP/coûts N'+n,()=>{
  const o=prototype.nativeXpAndCosts(n,3,14,0,8);
  assert.deepEqual(o.progression,native.progressionAtLevel(n));
  assert.equal(o.nativeExperience,native.experienceRequired(n));
  assert.equal(o.nativeLegacyExperience,native.legacyExperienceRequired(n));
  assert.equal(o.nativeDevelopmentBudget,native.developmentBudget(n));
  assert.equal(o.nativeStatCost,native.statCost(3,14));
  assert.equal(o.nativeMasteryCost,native.masteryCost(0,8));
 });
}

test('coûts M01 au-delà de caractéristique 12, sans division, sans gain',()=>{
 const x=prototype.nativeXpAndCosts(25,3,14,0,8);
 assert.equal(x.nativeStatCost,17);assert.equal(x.nativeMasteryCost,10);
 assert.equal(x.progression.development,144);
 assert.throws(()=>prototype.nativeXpAndCosts(26,3,14,0,8),RangeError);
});

test('table exacte historique et moderne N1/5/10/15/20/25',()=>{
 const a=[[1,0,0,0],[5,400,320,24],[10,2025,3645,54],[15,4900,13720,84],[20,9025,34295,114],[25,14400,69120,144]];
 for(const [level,xp,legacy,dev] of a){const n=prototype.nativeXpAndCosts(level,3,3,0,0);assert.equal(n.nativeExperience,xp);assert.equal(n.nativeLegacyExperience,legacy);assert.equal(n.nativeDevelopmentBudget,dev);}
});

test('niveau initial choisi et XP indépendants, prétiré one-shot sans bonus caché',()=>{
 const source=seed({initialLevel:10,initialXp:0,sessionMode:'one-shot',characterOrigin:'pretire',paceNote:'rapide',sourceRef:'PRETIRE-FICTIF'});
 const copy=structuredClone(source);
 const state=prototype.createXpDecisionLedger(source);
 assert.equal(prototype.inspectXpLedger(state).level,10);
 assert.equal(prototype.inspectXpLedger(state).xp,0);
 assert.equal(state.entries.length,0);
 assert.deepEqual(source,copy);
 assert.equal(prototype.previewXpProgression(state,11).eligibleNative,false);
});

test('rythmes de campagne descriptifs : aucune multiplication XP',()=>{
 const values=['libre','rapide','etale'].map(paceNote=>prototype.suggestXpFromM01(prototype.createXpDecisionLedger(seed({paceNote})),e()).nativeSuggestedXp);
 assert.deepEqual(values,[120,120,120]);
});

test('suggestion M01 ordinaire/majeure/légendaire, aucune récompense écrite',()=>{
 const s=setup();
 assert.equal(prototype.suggestXpFromM01(s,e()).nativeSuggestedXp,native.experienceAward(e(),[]));
 assert.equal(prototype.suggestXpFromM01(s,e('ev-m','x',6,'majeur',true)).nativeSuggestedXp,360);
 assert.equal(prototype.suggestXpFromM01(s,e('ev-l','x',2,'legendaire',true)).nativeSuggestedXp,320);
 assert.equal(prototype.suggestXpFromM01(s,e('ev-l0','x',2,'legendaire',false)).nativeSuggestedXp,0);
 assert.equal(s.revision,0);
});

test('décision du MJ libre 42 vs recommandation native 120, sans mutation source',()=>{
 const s=setup(),before=structuredClone(s),decision=cmd('award-1',0,{event:e('event-source-1')});
 const result=prototype.recordXpMjDecision(s,decision);
 assert.equal(result.status,'recorded');assert.equal(result.entry.nativeSuggestedXp,120);
 assert.equal(result.view.xp,42);assert.equal(result.appliedToSheet,false);
 assert.equal(s.revision,0);assert.deepEqual(s,before);
 assert.equal(result.state.revision,1);
});

test('décision zéro XP explicitement légale sans effacer le témoin',()=>{
 const r=prototype.recordXpMjDecision(setup(),cmd('a0',0,{decidedXp:0}));
 assert.equal(r.status,'recorded');assert.equal(r.view.xp,0);assert.equal(r.entry.nativeSuggestedXp,120);
});

test('idempotence événement identique, révision inchangée, collision refusée',()=>{
 const c=cmd('idemp',0),r=prototype.recordXpMjDecision(setup(),c);
 const dupe=prototype.recordXpMjDecision(r.state,structuredClone(c));
 assert.equal(dupe.status,'duplicate');assert.equal(dupe.state,r.state);assert.equal(dupe.view.xp,42);
 const different=prototype.recordXpMjDecision(r.state,{...c,decidedXp:43});
 assert.equal(different.status,'rejected');assert.equal(different.code,'ID_COLLISION');
});

test('identifiant source d événement unique même pour attribution zéro',()=>{
 const r=prototype.recordXpMjDecision(setup(),cmd('d-1',0,{decidedXp:0,event:e('src-identique')}));
 const again=prototype.recordXpMjDecision(r.state,cmd('d-2',1,{event:e('src-identique')}));
 assert.equal(again.status,'rejected');assert.equal(again.code,'SOURCE_DUPLICATE');
});

test('optimisme de révision et identifiants de décision obligatoires',()=>{
 const s=setup();
 assert.equal(prototype.recordXpMjDecision(s,cmd('a',1)).code,'STALE_REVISION');
 assert.equal(prototype.recordXpMjDecision(s,cmd('',0)).code,'INVALID_DECISION');
 assert.equal(prototype.recordXpMjDecision(s,{...cmd('a',0),approvedByMJ:false}).code,'INVALID_DECISION');
 assert.equal(prototype.recordXpMjDecision(s,{...cmd('a',0),at:'demain'}).code,'INVALID_DECISION');
});

test('correction négative auditée append-only, aucune substitution',()=>{
 const r=prototype.recordXpMjDecision(setup(),cmd('grant',0));
 const corr=cmd('correction-1',1,{kind:'correction',targetId:'grant',deltaXp:-10});
 delete corr.event;delete corr.decidedXp;
 const c=prototype.recordXpMjDecision(r.state,corr);
 assert.equal(c.status,'recorded');assert.equal(c.view.xp,32);assert.equal(c.state.entries.length,2);
 assert.equal(c.state.entries[0].command.decidedXp,42);
 assert.equal(prototype.recordXpMjDecision(c.state,corr).status,'duplicate');
 assert.equal(prototype.recordXpMjDecision(c.state,cmd('corr-invalide',2,{kind:'correction',targetId:'grant',deltaXp:-100,event:undefined,decidedXp:undefined})).status,'rejected');
});

test('correction sans référence et correction à montant zéro rejetées',()=>{
 const s=setup();
 const bad=cmd('bad',0,{kind:'correction',targetId:'absente',deltaXp:-1});delete bad.event;delete bad.decidedXp;
 assert.equal(prototype.recordXpMjDecision(s,bad).code,'UNKNOWN_AWARD');
 assert.equal(prototype.recordXpMjDecision(s,{...bad,deltaXp:0}).code,'INVALID_DECISION');
});

test('répétition de motif suit expérienceAward M01 et décision MJ à chaque événement',()=>{
 let s=setup();const suggested=[];
 for(let i=0;i<5;i++){
  const event=e('source-'+i,'motif-repete');
  suggested.push(prototype.suggestXpFromM01(s,event).nativeSuggestedXp);
  const r=prototype.recordXpMjDecision(s,cmd('aw-'+i,i,{event,decidedXp:1}));
  assert.equal(r.status,'recorded');s=r.state;
 }
 assert.deepEqual(suggested,[120,60,30,30,0]);
});

test('un événement attribué zéro ne sert pas de précédent de répétition M02',()=>{
 const r=prototype.recordXpMjDecision(setup(),cmd('one',0,{event:e('ev1','same'),decidedXp:0}));
 assert.equal(prototype.suggestXpFromM01(r.state,e('ev2','same')).nativeSuggestedXp,120);
});

test('erreurs événement, difficulté, scope et montant négatif refusés sans exception',()=>{
 const s=setup();
 for(const event of [{...e(),id:7},{...e(),difficulty:13},{...e(),scope:'inconnue'},{...e(),approved:1}]){
  assert.equal(prototype.suggestXpFromM01(s,event).status,'rejected');
  assert.equal(prototype.recordXpMjDecision(s,cmd('err',0,{event})).status,'rejected');
 }
 assert.equal(prototype.recordXpMjDecision(s,cmd('negative',0,{decidedXp:-1})).status,'rejected');
});

test('dépassement entier sûr refusé, jamais tronqué',()=>{
 const s=prototype.createXpDecisionLedger(seed({initialXp:Number.MAX_SAFE_INTEGER}));
 assert.equal(prototype.recordXpMjDecision(s,cmd('overflow',0,{decidedXp:1})).code,'XP_OVERFLOW');
});

test('progression N5 vers N6 exige XP seuil M01 + validation MJ distincte',()=>{
 let s=prototype.createXpDecisionLedger(seed({initialLevel:5,initialXp:400}));
 const b=prototype.previewXpProgression(s,6);
 assert.equal(b.nativeRequiredXp,625);assert.equal(b.missingXp,225);assert.equal(b.eligibleNative,false);
 const first=cmd('promotion-too-soon',0,{kind:'promotion',targetLevel:6});delete first.event;delete first.decidedXp;
 assert.equal(prototype.recordXpMjDecision(s,first).code,'PROGRESSION_NOT_ELIGIBLE');
 const grant=prototype.recordXpMjDecision(s,cmd('grant',0,{decidedXp:225}));s=grant.state;
 const eligible=prototype.previewXpProgression(s,6);
 assert.equal(eligible.maySubmitDecision,true);
 const promote={...first,id:'promote-6',expectedRevision:1};
 const result=prototype.recordXpMjDecision(s,promote);
 assert.equal(result.status,'recorded');assert.equal(result.view.level,6);
 assert.equal(result.appliedToSheet,false);assert.equal(s.seed.initialLevel,5);
});

test('ni saut de niveau ni progression au-delà de 25',()=>{
 const s=prototype.createXpDecisionLedger(seed({initialLevel:5,initialXp:99999}));
 const c=cmd('skip',0,{kind:'promotion',targetLevel:7});delete c.event;delete c.decidedXp;
 assert.equal(prototype.recordXpMjDecision(s,c).code,'PROGRESSION_NOT_ELIGIBLE');
 assert.equal(prototype.previewXpProgression(s,26).code,'INVALID_LEVEL');
});

test('M01 N21 exige paliers explicites malgré XP suffisants',()=>{
 let s=prototype.createXpDecisionLedger(seed({initialLevel:20,initialXp:native.experienceRequired(21)}));
 assert.equal(prototype.previewXpProgression(s,21).eligibleNative,false);
 const promo=cmd('p21',0,{kind:'promotion',targetLevel:21});delete promo.event;delete promo.decidedXp;
 assert.equal(prototype.recordXpMjDecision(s,promo).code,'PROGRESSION_NOT_ELIGIBLE');
 const milestone=cmd('m21',0,{kind:'milestone',level:21});delete milestone.event;delete milestone.decidedXp;
 const m=prototype.recordXpMjDecision(s,milestone);assert.equal(m.status,'recorded');s=m.state;
 const p=prototype.recordXpMjDecision(s,{...promo,expectedRevision:1});
 assert.equal(p.status,'recorded');assert.equal(p.view.level,21);
});

test('paliers 22–25 uniquement dans ordre et avec consentement MJ explicite',()=>{
 let s=prototype.createXpDecisionLedger(seed({initialLevel:21,initialXp:20000,initialMilestones:[21]}));
 const m=cmd('m23',0,{kind:'milestone',level:23});delete m.event;delete m.decidedXp;
 assert.equal(prototype.recordXpMjDecision(s,m).code,'MILESTONE_ORDER');
 const r=prototype.recordXpMjDecision(s,{...m,id:'m22',level:22});assert.equal(r.status,'recorded');s=r.state;
 assert.equal(prototype.recordXpMjDecision(s,{...m,id:'dup22',expectedRevision:1,level:22}).code,'MILESTONE_DUPLICATE');
 assert.equal(prototype.recordXpMjDecision(s,{...m,id:'m23',expectedRevision:1}).status,'recorded');
});

test('paliers initiaux doivent être vérifiés et ordonnés',()=>{
 assert.throws(()=>prototype.createXpDecisionLedger(seed({initialLevel:22,initialMilestones:[22]})),RangeError);
 assert.throws(()=>prototype.createXpDecisionLedger(seed({initialLevel:22,initialMilestones:[21,23]})),RangeError);
 assert.equal(prototype.createXpDecisionLedger(seed({initialLevel:22,initialMilestones:[21,22]})).seed.initialMilestones.length,2);
});

test('correction après promotion : signaler le réexamen, sans rétrogradation',()=>{
 let s=prototype.createXpDecisionLedger(seed({initialLevel:5,initialXp:400}));
 const grant=prototype.recordXpMjDecision(s,cmd('grant',0,{decidedXp:225}));s=grant.state;
 const promo=cmd('p6',1,{kind:'promotion',targetLevel:6});delete promo.event;delete promo.decidedXp;
 s=prototype.recordXpMjDecision(s,promo).state;
 const corr=cmd('c',2,{kind:'correction',targetId:'grant',deltaXp:-100});delete corr.event;delete corr.decidedXp;
 const result=prototype.recordXpMjDecision(s,corr);
 assert.equal(result.status,'recorded');assert.equal(result.view.level,6);assert.equal(result.view.advancementNeedsReview,true);
});

test('import JSON synthétique préserve journal, idempotence, pas de stat modifiée',()=>{
 const s=prototype.recordXpMjDecision(setup(),cmd('a',0)).state;
 const imported=JSON.parse(JSON.stringify(s));
 assert.deepEqual(prototype.inspectXpLedger(imported),prototype.inspectXpLedger(s));
 assert.equal(prototype.recordXpMjDecision(imported,cmd('a',0)).status,'duplicate');
 assert.ok(!('stats' in s));assert.ok(!('mana' in s));assert.ok(!('levelUp' in s));
});

test('champs inconnus et bénéficiaire non validé : refus fermé',()=>{
 const s=setup();
 assert.equal(prototype.recordXpMjDecision(s,{...cmd('extra',0),xpMultiplier:3}).status,'rejected');
 assert.throws(()=>prototype.createXpDecisionLedger(seed({initialLevel:0})),RangeError);
 assert.throws(()=>prototype.createXpDecisionLedger(seed({initialLevel:26})),RangeError);
 assert.throws(()=>prototype.createXpDecisionLedger(seed({initialXp:-1})),RangeError);
});

test('snapshot de décision : mutation postérieure du formulaire sans effet sur journal',()=>{
 const source=cmd('clonage',0,{event:e('EV-FIX')});
 const r=prototype.recordXpMjDecision(setup(),source);
 assert.equal(r.status,'recorded');
 source.decidedXp=9999;source.event.pattern='modifie';
 assert.equal(prototype.inspectXpLedger(r.state).xp,42);
 assert.equal(r.state.entries[0].command.event.pattern,'exploration-libre');
});

test('correction hors solde refusée et journal inchangé',()=>{
 const first=prototype.recordXpMjDecision(setup(),cmd('origine',0,{decidedXp:5}));
 const correction=cmd('corr-hors-solde',1,{kind:'correction',targetId:'origine',deltaXp:-6});
 delete correction.event;delete correction.decidedXp;
 const r=prototype.recordXpMjDecision(first.state,correction);
 assert.equal(r.status,'rejected');assert.equal(r.code,'INVALID_CORRECTION');
 assert.equal(r.state,first.state);assert.equal(first.state.entries.length,1);
});
