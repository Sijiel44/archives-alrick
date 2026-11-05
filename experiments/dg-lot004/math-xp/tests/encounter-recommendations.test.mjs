/** L004-B.R2 : source M01 TypeScript authentique ; tests NODE, sans barème Python. */
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
const temporary=mkdtempSync(join(tmpdir(),'dg004-xp-encounter-'));
let port,base,backend;
try{
 try {
  const {build}=await import('esbuild');
  await build({entryPoints:[resolve(here,'../src/encounter-recommendations.ts')],outfile:join(temporary,'encounter.cjs'),bundle:true,platform:'node',format:'cjs',target:'node18',logLevel:'silent'});
  await build({entryPoints:[resolve(root,'quartz/components/scripts/atelier5d6-progression.ts')],outfile:join(temporary,'m01.cjs'),bundle:true,platform:'node',format:'cjs',target:'node18',logLevel:'silent'});
  port=createRequire(import.meta.url)(join(temporary,'encounter.cjs'));
  base=createRequire(import.meta.url)(join(temporary,'m01.cjs'));
  backend='esbuild';
 }catch(e){
  if(e?.code!=='ERR_MODULE_NOT_FOUND'&&e?.code!=='MODULE_NOT_FOUND')throw e;
  execFileSync('tsc',['--target','ES2022','--module','commonjs','--moduleResolution','node','--skipLibCheck','--strict','--rootDir',root,'--outDir',temporary,resolve(here,'../src/encounter-recommendations.ts')],{cwd:root,stdio:'pipe'});
  port=createRequire(import.meta.url)(join(temporary,'experiments/dg-lot004/math-xp/src/encounter-recommendations.js'));
  base=createRequire(import.meta.url)(join(temporary,'quartz/components/scripts/atelier5d6-progression.js'));
  backend='tsc';
 }
}catch(e){rmSync(temporary,{recursive:true,force:true});throw new Error('Official TS M01 compiler failed: '+(e.stderr?.toString()??e.message),{cause:e})}
process.once('exit',()=>rmSync(temporary,{recursive:true,force:true}));
console.log('DG004 L004-B.R2 engine=M01 official TS, backend='+backend);

const xp=require => require;
function M(){return createRequire(import.meta.url)(join(temporary,backend==='esbuild'?'encounter.cjs':'experiments/dg-lot004/math-xp/src/encounter-recommendations.js'))}
// Same native module as the encounter entry; only journal methods for fixtures through compiled output.
const oldEntry=resolve(here,'../src/xp-decision.ts');
let ledgerPort;
try{
 if(backend==='esbuild') {
  const {build}=await import('esbuild');
  await build({entryPoints:[oldEntry],outfile:join(temporary,'journal.cjs'),bundle:true,platform:'node',format:'cjs',target:'node18',logLevel:'silent'});
  ledgerPort=createRequire(import.meta.url)(join(temporary,'journal.cjs'));
 } else ledgerPort=createRequire(import.meta.url)(join(temporary,'experiments/dg-lot004/math-xp/src/xp-decision.js'));
}catch(e){throw new Error('Existing MATH journal unavailable: '+e.message)}
const camp='fiction';
const actor=(instanceId,level=5,role='pj')=>({instanceId,level,role,contributionNote:'Effort fictif documenté'});
const threat=(level,boss=false,count=1,id='ennemi-'+level)=>({instanceId:id,level,boss,count,dangerNote:'Danger attesté par le MJ'});
const ledger=(id,level=5,xp=0,run='run-1')=>ledgerPort.createXpDecisionLedger({campaignId:camp,characterId:id,initialLevel:level,initialXp:xp,sessionMode:'campagne',characterOrigin:'creation',paceNote:'libre',sourceRef:run});
function scenario(p={}){
 const people=p.actors??[actor('pj:alpha'),actor('pj:beta')];
 const ledgers=Object.fromEntries(people.filter(a=>a.role==='pj').map(a=>[a.instanceId,ledger(a.instanceId,a.level,p.startXp??0)]));
 return {campaignId:camp,runId:'run-1',accomplishmentId:'step-1',kind:'encounter',eventPattern:'motif-1',eventDomain:'combat',scope:'ordinaire',eventApprovedByMJ:false,
  difficultyBeforeAssistance:'moderee',actors:people,selectedPjIds:['pj:alpha','pj:beta'],threats:[threat(5)],assistance:{level:'none',npcIds:[],reason:''},ledgersByPj:ledgers,...p};
}
const choice=(mode='common',amount=42,extra={})=>({mode,...(mode==='common'?{commonXp:amount}:{individualXp:{'pj:alpha':amount,'pj:beta':amount+8}}),
 decision:{id:'decision-1',at:'2026-11-05T15:00:00.000Z',decidedBy:'MJ fictif',reason:'Arbitrage table fictive',approvedByMJ:true},...extra});

for(const n of [1,5,10,15,20,25]){
 test('N'+n+' seuil officiel M01 et niveau PJ conservé',()=>{
  const s=scenario({actors:[actor('pj:alpha',n),actor('pj:beta',n)],ledgersByPj:{'pj:alpha':ledger('pj:alpha',n,base.experienceRequired(n)),'pj:beta':ledger('pj:beta',n,base.experienceRequired(n))}});
  const p=port.previewEncounterXp(s);
  assert.equal(p.status,'preview');assert.equal(p.proposedIndex,6);
  for(const row of p.suggestions){assert.equal(row.level,n);assert.equal(row.modelA.nativeSuggestedXp,base.experienceAward({id:p.source.eventId,pattern:'motif-1',domain:'combat',difficulty:6,scope:'ordinaire',approved:false},[]));
   assert.equal(row.xpToNextLevel,n===25?null:base.experienceRequired(n+1)-base.experienceRequired(n));}
 });
}
test('niveaux de menace N2 / N15 / N20 / N25 : ne deviennent jamais indices 1..12',()=>{
 for(const n of [2,15,20,25]){
  const s=scenario({threats:[threat(n)]}),p=port.previewEncounterXp(s);
  assert.equal(p.status,'preview');assert.equal(p.context.highestThreatLevel,n);
  assert.equal(p.proposedIndex,6);assert.equal(p.suggestions[0].modelA.nativeSuggestedXp,120);
 }
});
test('modèle A = M01 exact ; modèle B coefficient visible et indépendant',()=>{
 for(const [label,index,coefficient,amount] of [['facile',3,.75,90],['moderee',6,1,120],['difficile',9,1.25,150],['heroique',12,1.5,180]]){
  const p=port.previewEncounterXp(scenario({difficultyBeforeAssistance:label}));
  assert.equal(p.status,'preview');assert.equal(p.proposedIndex,index);
  for(const row of p.suggestions){assert.equal(row.modelA.nativeSuggestedXp,20*index);
   assert.equal(row.modelB.coefficient,coefficient);assert.equal(row.modelB.hypotheticalXp,amount);}
 }
});
test('indice M01 explicite 1..12 du MJ prime toujours la cartographie expérimentale',()=>{
 const p=port.previewEncounterXp(scenario({difficultyBeforeAssistance:'heroique',explicitM01Index:4}));
 assert.equal(p.status,'preview');assert.equal(p.proposedIndex,4);assert.equal(p.indexOrigin,'explicit_mj');assert.equal(p.suggestions[0].modelA.nativeSuggestedXp,80);
});
test('PNJ N20 décisif aidant PJ N3 contre ennemi N15 : abaisse la proposition mais ne l’efface pas',()=>{
 const people=[actor('pj:alpha',3),actor('pj:beta',3),actor('pnj:mentor',20,'pnj')];
 const ledgersByPj={'pj:alpha':ledger('pj:alpha',3),'pj:beta':ledger('pj:beta',3)};
 const shared={actors:people,ledgersByPj,threats:[threat(15)],difficultyBeforeAssistance:'difficile'};
 const unaided=port.previewEncounterXp(scenario(shared));
 const aided=port.previewEncounterXp(scenario({...shared,assistance:{level:'decisive',npcIds:['pnj:mentor'],reason:'Le PNJ a porté une aide déterminante'}}));
 assert.equal(unaided.status,'preview');assert.equal(aided.status,'preview');
 assert.equal(unaided.proposedIndex,9);assert.equal(aided.proposedIndex,6);
 assert.equal(unaided.suggestions[0].modelA.nativeSuggestedXp,180);
 assert.equal(aided.suggestions[0].modelA.nativeSuggestedXp,120);
 assert.equal(aided.context.decisiveAssistance,true);
 assert.equal(aided.suggestions.length,2);assert.ok(!aided.suggestions.some(x=>x.instanceId==='pnj:mentor'));
});
test('aide secondaire ou difficulté réellement arrêtée par MJ : pas de réduction cachée',()=>{
 const npc=actor('pnj:mentor',20,'pnj');const actors=[actor('pj:alpha'),actor('pj:beta'),npc];
 for(const extra of [{assistance:{level:'secondary',npcIds:['pnj:mentor'],reason:'Information simple'}},
  {assistance:{level:'decisive',npcIds:['pnj:mentor'],reason:'Fort soutien'},realizedDifficulty:'difficile'}]){
  const p=port.previewEncounterXp(scenario({actors,difficultyBeforeAssistance:'difficile',...extra}));
  assert.equal(p.status,'preview');assert.equal(p.proposedIndex,9);
 }
});
test('boss portée majeure : 3× natif si validation explicite ; pas de bonus boss automatique',()=>{
 const boss=threat(20,true);
 const p=port.previewEncounterXp(scenario({threats:[boss],difficultyBeforeAssistance:'difficile',scope:'majeur',eventApprovedByMJ:true}));
 assert.equal(p.status,'preview');assert.equal(p.suggestions[0].modelA.nativeSuggestedXp,540);
 assert.equal(p.suggestions[0].modelB.hypotheticalXp,150);
 assert.equal(p.context.boss,true);
 const blocked=port.previewEncounterXp(scenario({threats:[boss],scope:'majeur',eventApprovedByMJ:false}));
 assert.equal(blocked.status,'unavailable');assert.equal(blocked.code,'SCOPE_NOT_APPROVED');
 const noBossBonus=port.previewEncounterXp(scenario({threats:[boss]}));
 assert.equal(noBossBonus.suggestions[0].modelA.nativeSuggestedXp,120);
});
test('héroïque légendaire M01 : approbation explicite et alerte de rythme',()=>{
 const p=port.previewEncounterXp(scenario({difficultyBeforeAssistance:'heroique',scope:'legendaire',eventApprovedByMJ:true}));
 assert.equal(p.status,'preview');assert.equal(p.suggestions[0].modelA.nativeSuggestedXp,1920);
 assert.equal(p.suggestions[0].modelB.hypotheticalXp,180);
});
test('rencontre plusieurs ennemis : effectif décrit, aucun XP x nombre',()=>{
 const p=port.previewEncounterXp(scenario({threats:[threat(2,false,3,'g1'),threat(15,false,2,'g2')]}));
 assert.equal(p.status,'preview');assert.equal(p.context.threatCount,5);
 assert.equal(p.suggestions[0].modelA.nativeSuggestedXp,120);
});
test('quête pacifique / négociation : XP natif sans victime ni attaque',()=>{
 const p=port.previewEncounterXp(scenario({kind:'quest',threats:[],eventDomain:'diplomatie',eventPattern:'negociation-pacifique'}));
 assert.equal(p.status,'preview');assert.equal(p.context.threatCount,0);assert.equal(p.suggestions[0].modelA.nativeSuggestedXp,120);
});
test('groupe hétérogène : suggestions individuelles sans division par participants',()=>{
 const people=[actor('pj:alpha',1),actor('pj:beta',20),actor('pj:gamma',10)];
 const s=scenario({actors:people,selectedPjIds:['pj:alpha','pj:beta','pj:gamma'],ledgersByPj:{'pj:alpha':ledger('pj:alpha',1),'pj:beta':ledger('pj:beta',20),'pj:gamma':ledger('pj:gamma',10)},threats:[threat(15)]});
 const p=port.previewEncounterXp(s);
 assert.equal(p.status,'preview');assert.equal(p.suggestions.length,3);
 assert.deepEqual(p.suggestions.map(x=>x.modelA.nativeSuggestedXp),[120,120,120]);
 assert.deepEqual(p.context.selectedPjLevels,[1,20,10]);
});
test('seuls PJ sélectionnés : pas de PJ absent, jamais un PNJ',()=>{
 const actors=[actor('pj:alpha'),actor('pj:beta'),actor('pnj:n20',20,'pnj')];
 const s=scenario({actors,selectedPjIds:['pj:alpha'],ledgersByPj:{'pj:alpha':ledger('pj:alpha')},assistance:{level:'secondary',npcIds:['pnj:n20'],reason:'Conseils'}});
 const p=port.previewEncounterXp(s);
 assert.equal(p.status,'preview');assert.deepEqual(p.selectedPjIds,['pj:alpha']);
 assert.equal(p.suggestions.length,1);
 assert.equal(port.previewEncounterXp({...s,selectedPjIds:['pnj:n20']}).code,'INVALID_PJ_SELECTION');
});
test('décision MJ commune 42, exception 0 pour PJ beta, journaux non mutés',()=>{
 const s=scenario();const old=structuredClone(s.ledgersByPj);
 const p=port.previewEncounterXp(s);
 assert.equal(p.suggestions[0].modelA.nativeSuggestedXp,120);
 const r=port.recordEncounterXpChoice(s,choice('common',42,{overrides:{'pj:beta':0}}));
 assert.equal(r.status,'recorded');assert.equal(r.receipts.length,2);
 assert.deepEqual(r.receipts.map(x=>x.decidedXp),[42,0]);
 assert.equal(ledgerPort.inspectXpLedger(r.nextLedgers['pj:alpha']).xp,42);
 assert.equal(ledgerPort.inspectXpLedger(r.nextLedgers['pj:beta']).xp,0);
 assert.equal(r.appliedToSheet,false);assert.deepEqual(s.ledgersByPj,old);
});
test('décision MJ individuelle 17/35 explicitement ; aucun montant auto',()=>{
 const s=scenario(),r=port.recordEncounterXpChoice(s,choice('individual',17,{individualXp:{'pj:alpha':17,'pj:beta':35}}));
 assert.equal(r.status,'recorded');assert.deepEqual(r.receipts.map(x=>x.decidedXp),[17,35]);
 assert.equal(r.nextLedgers['pj:alpha'].revision,1);assert.equal(r.nextLedgers['pj:beta'].revision,1);
});
test('répétition requête : idempotence 2 PJ et aucun double XP',()=>{
 const s=scenario(),decision=choice('common',50);
 const first=port.recordEncounterXpChoice(s,decision);
 assert.equal(first.status,'recorded');
 const retry=port.recordEncounterXpChoice({...s,ledgersByPj:first.nextLedgers},decision);
 assert.equal(retry.status,'duplicate');assert.deepEqual(retry.receipts.map(x=>x.status),['duplicate','duplicate']);
 assert.equal(ledgerPort.inspectXpLedger(retry.nextLedgers['pj:alpha']).xp,50);
});
test('même boss + quête même accomplishmentId : second paiement bloqué',()=>{
 const s=scenario({accomplishmentId:'boss-quest-shared'});
 const first=port.recordEncounterXpChoice(s,choice('common',20));
 const second=port.recordEncounterXpChoice({...s,kind:'quest',ledgersByPj:first.nextLedgers},choice('common',20,{decision:{...choice().decision,id:'differente-decision'}}));
 assert.equal(second.status,'rejected');assert.equal(second.code,'SOURCE_DUPLICATE');
});
test('même commande ID autre montant : collision puis aucun journal modifié',()=>{
 const s=scenario(),first=port.recordEncounterXpChoice(s,choice('common',20));
 const second=port.recordEncounterXpChoice({...s,ledgersByPj:first.nextLedgers},choice('common',23));
 assert.equal(second.status,'rejected');assert.equal(second.code,'ID_COLLISION');
 assert.equal(first.nextLedgers['pj:alpha'].revision,1);
});
test('lot atomique par résultat : rejet deuxième PJ ne délivre aucun nouveau journal',()=>{
 const s=scenario(),first=port.recordEncounterXpChoice(s,choice('common',20));
 const corrupted={...s,ledgersByPj:{...s.ledgersByPj,'pj:beta':first.nextLedgers['pj:beta']}};
 const r=port.recordEncounterXpChoice(corrupted,choice('common',42,{decision:{...choice().decision,id:'other-decision'}}));
 assert.equal(r.status,'rejected');assert.equal(r.code,'SOURCE_DUPLICATE');assert.ok(!('nextLedgers' in r));
 assert.equal(corrupted.ledgersByPj['pj:alpha'].revision,0);
});
test('farming : répétition M01 120,60,30,30,0 sur 5 sources, sans barème parallèle',()=>{
 let s=scenario({selectedPjIds:['pj:alpha']});const suggestions=[];
 for(let i=0;i<5;i++){
  const scene={...s,accomplishmentId:'repeat-'+i,eventPattern:'farming-motif'};
  const p=port.previewEncounterXp(scene);
  assert.equal(p.status,'preview');suggestions.push(p.suggestions[0].modelA.nativeSuggestedXp);
  const r=port.recordEncounterXpChoice(scene,choice('common',1,{decision:{...choice().decision,id:'decision-'+i}}));
  assert.equal(r.status,'recorded');s={...s,ledgersByPj:r.nextLedgers};
 }
 assert.deepEqual(suggestions,[120,60,30,30,0]);
});
test('one-shot même événement dans run différent : source unique par run, pas re-crédit même run',()=>{
 const s=scenario(),first=port.recordEncounterXpChoice(s,choice('common',12));
 const same=port.previewEncounterXp({...s,ledgersByPj:first.nextLedgers});
 assert.equal(same.suggestions[0].modelA.repeatedSource,true);
 const other=port.previewEncounterXp({...s,runId:'run-2',ledgersByPj:first.nextLedgers});
 assert.equal(other.status,'preview');assert.equal(other.suggestions[0].modelA.repeatedSource,false);
});
test('level 25 au maximum ; 25+ menace ou PJ bloque explicitement, sans règle épique',()=>{
 const s=scenario();
 assert.equal(port.previewEncounterXp({...s,threats:[threat(26)]}).status,'unavailable');
 assert.equal(port.previewEncounterXp({...s,actors:[actor('pj:alpha',26),actor('pj:beta')]}).status,'rejected');
 const p=port.previewEncounterXp(scenario({actors:[actor('pj:alpha',25),actor('pj:beta',25)],ledgersByPj:{'pj:alpha':ledger('pj:alpha',25),'pj:beta':ledger('pj:beta',25)}}));
 assert.equal(p.status,'preview');assert.equal(p.suggestions[0].xpToNextLevel,null);
});
test('aide décisive non attestée rejetée, no fantasy NPC rewards',()=>{
 const s=scenario({actors:[actor('pj:alpha'),actor('pj:beta'),actor('pnj:hero',20,'pnj')]});
 assert.equal(port.previewEncounterXp({...s,assistance:{level:'decisive',npcIds:[],reason:'Aide'}}).code,'INVALID_ASSISTANCE');
 assert.equal(port.previewEncounterXp({...s,assistance:{level:'decisive',npcIds:['pj:alpha'],reason:'Aide'}}).code,'INVALID_ASSISTANCE');
});
test('bords M01 : indice 13, champ inconnu, PNJ sélectionné, doublon PJ',()=>{
 const s=scenario();
 assert.equal(port.previewEncounterXp({...s,explicitM01Index:13}).code,'INVALID_SCENE');
 assert.equal(port.previewEncounterXp({...s,unexpectedXp:900}).code,'INVALID_REQUEST');
 assert.equal(port.previewEncounterXp({...s,selectedPjIds:['pj:alpha','pj:alpha']}).code,'INVALID_PJ_SELECTION');
});
test('répartition invalide ou approval manquante : refus, aucune mutation',()=>{
 const s=scenario(),old=structuredClone(s);
 for(const bad of [choice('common',-1),choice('individual',10,{individualXp:{'pj:alpha':10}}),
  choice('common',10,{overrides:{'pnj:n20':5}}),choice('common',10,{decision:{...choice().decision,approvedByMJ:false}}),
  choice('common',10,{decision:{...choice().decision,at:'not-date'}})]){
  assert.equal(port.recordEncounterXpChoice(s,bad).status,'rejected');
 }
 assert.deepEqual(s,old);
});
test('identité native PJ avec : autorisée pour la passerelle, INDEX distinct reste à vérifier',()=>{
 const s=scenario({actors:[actor('pj:l004-hero-fiction')],selectedPjIds:['pj:l004-hero-fiction'],ledgersByPj:{'pj:l004-hero-fiction':ledger('pj:l004-hero-fiction')}});
 const p=port.previewEncounterXp(s);
 assert.equal(p.status,'preview');assert.equal(p.suggestions[0].instanceId,'pj:l004-hero-fiction');
});
test('le port existant n est pas réécrit et A se superpose à la suggestion M01 officielle',()=>{
 const s=scenario(),p=port.previewEncounterXp(s);
 assert.equal(p.status,'preview');
 const event={id:p.source.eventId,pattern:p.source.eventPattern,domain:p.source.eventDomain,difficulty:p.proposedIndex,scope:p.source.scope,approved:false};
 assert.equal(p.suggestions[0].modelA.nativeSuggestedXp,base.experienceAward(event,[]));
 assert.equal(p.canAutoApply,false);assert.equal(p.appliedToSheet,false);
});