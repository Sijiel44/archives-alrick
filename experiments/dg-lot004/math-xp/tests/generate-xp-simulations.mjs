/** Reproduction exacte : compile la passerelle et les TS M01, puis émet des cas fictifs JSON. */
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../../../..');
const out=mkdtempSync(join(tmpdir(),'l004b-simulation-'));
try {
 execFileSync('tsc',['--target','ES2022','--module','commonjs','--moduleResolution','node','--skipLibCheck','--strict','--rootDir',root,'--outDir',out,resolve(here,'../src/encounter-recommendations.ts')],{cwd:root,stdio:'pipe'});
 const req=createRequire(import.meta.url);
 const xp=req(join(out,'experiments/dg-lot004/math-xp/src/xp-decision.js'));
 const core=req(join(out,'experiments/dg-lot004/math-xp/src/encounter-recommendations.js'));
 const m01=req(join(out,'quartz/components/scripts/atelier5d6-progression.js'));
 const campaignId='demo-dg004';
 const actor=(id,level,role='pj')=>({instanceId:id,level,role,contributionNote:'Contribution narrative fictive'});
 const journal=(id,level,initialXp=0)=>xp.createXpDecisionLedger({campaignId,characterId:id,initialLevel:level,initialXp,sessionMode:'one-shot',characterOrigin:'pretire',paceNote:'libre'});
 const threat=(level,count=1,boss=false,id='threat-'+level)=>({instanceId:id,level,count,boss,dangerNote:'Danger fictif attesté'});
 const basic={campaignId,runId:'run-demo-1',accomplishmentId:'example',kind:'encounter',eventPattern:'tactique-exploration',eventDomain:'combat',scope:'ordinaire',eventApprovedByMJ:false,difficultyBeforeAssistance:'moderee',threats:[threat(2)],assistance:{level:'none',npcIds:[],reason:''}};
 function caseRow(id,{people=[actor('pj:1',5),actor('pj:2',5)],selected=['pj:1','pj:2'],threats=[threat(2)],...opts}={}){
  const ledgersByPj=Object.fromEntries(people.filter(p=>p.role==='pj').map(p=>[p.instanceId,journal(p.instanceId,p.level)]));
  const scene={...basic,accomplishmentId:id,actors:people,selectedPjIds:selected,ledgersByPj,threats,...opts};
  const r=core.previewEncounterXp(scene);
  if(r.status!=='preview')return {caseId:id,status:r.status,code:r.code,reason:r.reason};
  return {caseId:id,kind:r.source.kind,threatCount:r.context.threatCount,maxThreatLevel:r.context.highestThreatLevel,
   pjLevels:r.context.selectedPjLevels,npcLevels:r.context.npcLevels,boss:r.context.boss,helpDecisive:r.context.decisiveAssistance,
   from:r.difficultyBeforeAssistance,realized:r.realizedDifficulty,indexA:r.proposedIndex,indexOrigin:r.indexOrigin,
   scope:r.source.scope,results:r.suggestions.map(s=>({pj:s.instanceId,xpM01Candidate:s.modelA.nativeSuggestedXp,xpModelBHypothetical:s.modelB.hypotheticalXp,coefficientB:s.modelB.coefficient,xpToNextLevel:s.xpToNextLevel})),
   canAutoApply:r.canAutoApply}
 }
 const cases=[
  caseRow('enemy-N2',{people:[actor('pj:1',1),actor('pj:2',1)],threats:[threat(2)],difficultyBeforeAssistance:'moderee'}),
  caseRow('enemy-N15',{threats:[threat(15)],difficultyBeforeAssistance:'difficile'}),
  caseRow('enemy-N20',{people:[actor('pj:1',15),actor('pj:2',15)],threats:[threat(20)],difficultyBeforeAssistance:'difficile'}),
  caseRow('enemy-N25',{people:[actor('pj:1',20),actor('pj:2',20)],threats:[threat(25)],difficultyBeforeAssistance:'heroique'}),
  caseRow('boss-N20-major',{people:[actor('pj:1',10),actor('pj:2',10)],threats:[threat(20,1,true)],difficultyBeforeAssistance:'difficile',scope:'majeur',eventApprovedByMJ:true}),
  caseRow('boss-N25-legendary',{people:[actor('pj:1',20),actor('pj:2',20)],threats:[threat(25,1,true)],difficultyBeforeAssistance:'heroique',scope:'legendaire',eventApprovedByMJ:true}),
  caseRow('multiple-enemies',{threats:[threat(2,3,false,'low'),threat(15,2,false,'high')],difficultyBeforeAssistance:'difficile'}),
  caseRow('assisted-by-N20',{people:[actor('pj:1',3),actor('pj:2',3),actor('npc:20',20,'pnj')],threats:[threat(15)],difficultyBeforeAssistance:'difficile',assistance:{level:'decisive',npcIds:['npc:20'],reason:'PNJ déterminant, MJ atteste'}}),
  caseRow('peaceful-quest',{kind:'quest',threats:[],eventDomain:'diplomatie',eventPattern:'accord-sans-combat',difficultyBeforeAssistance:'moderee'}),
  caseRow('heterogeneous-party',{people:[actor('pj:1',1),actor('pj:2',20)],threats:[threat(15)],difficultyBeforeAssistance:'difficile'}),
  caseRow('oneshot-N10',{people:[actor('pj:1',10),actor('pj:2',10)],threats:[],kind:'quest',difficultyBeforeAssistance:'facile'}),
  caseRow('level-25-plus-blocked',{threats:[threat(26)],difficultyBeforeAssistance:'heroique'})
 ];
 let s=journal('pj:1',5);const repetition=[];
 for(let i=0;i<5;i++){
  const scene={...basic,actors:[actor('pj:1',5)],selectedPjIds:['pj:1'],threats:[threat(2)],accomplishmentId:'farm-'+i,eventPattern:'farm-repeated',ledgersByPj:{'pj:1':s}};
  const p=core.previewEncounterXp(scene);
  if(p.status!=='preview')throw new Error('Farm invalid');
  repetition.push(p.suggestions[0].modelA.nativeSuggestedXp);
  const result=core.recordEncounterXpChoice(scene,{mode:'common',commonXp:1,decision:{id:'farm-decision-'+i,at:'2026-11-05T12:00:00.000Z',decidedBy:'MJ fictif',reason:'Accomplissement expérimental',approvedByMJ:true}});
  if(result.status!=='recorded')throw new Error('Farm commit invalid');
  s=result.nextLedgers['pj:1'];
 }
 const matrix=[1,5,10,15,20,25].map(level=>({level,requiredXpM01:m01.experienceRequired(level),legacyXp:m01.legacyExperienceRequired(level),developmentBudget:m01.developmentBudget(level),incrementToNextM01:level===25?null:m01.experienceRequired(level+1)-m01.experienceRequired(level)}));
 const payload={schema:'cer.math.dg004.xp-simulations.v1',sourceReference:'PR85@2ab809ef5351940e0fc272b859d10f21de894d00',engine:'M01 official TypeScript',candidateMapping:{facile:3,moderee:6,difficile:9,heroique:12},alternativeCoefficients:{facile:0.75,moderee:1,difficile:1.25,heroique:1.5},experimentalNotApproved:true,noAutomaticGrant:true,noNpcsPaid:true,matrix,cases,farmingRepetitionM01:repetition};
 process.stdout.write(JSON.stringify(payload,null,2)+'\n');
}finally{rmSync(out,{recursive:true,force:true});}