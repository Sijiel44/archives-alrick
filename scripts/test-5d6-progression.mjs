import assert from "node:assert/strict"
import {build} from "esbuild"

/** Charge la vraie source TypeScript et ses dépendances ; aucun test d'une copie JS. */
async function loadModule(entry) {
  const result=await build({entryPoints:[entry],platform:"node",bundle:true,format:"esm",
    target:"es2022",write:false,logLevel:"silent"})
  return import("data:text/javascript;base64,"+Buffer.from(result.outputFiles[0].text).toString("base64"))
}
const m=await loadModule("quartz/components/scripts/atelier5d6-progression.ts")
const p=await loadModule("quartz/components/scripts/atelier5d6-probabilities.ts")
const histogram=new Map()
let outcomes=0
for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)for(let c=1;c<=6;c++)
for(let d=1;d<=6;d++)for(let e=1;e<=6;e++){
  const n=a+b+c+d+e
  histogram.set(n,(histogram.get(n)??0)+1);outcomes++
}
assert.equal(outcomes,7776)
for(let n=5;n<=30;n++)assert.equal(histogram.get(n),p.sumOccurrences(n))
assert.equal([5,6,7].reduce((sum,n)=>sum+histogram.get(n),0),21)
assert.equal([27,28,29,30].reduce((sum,n)=>sum+histogram.get(n),0),56)
let exhaustiveEvaluations=0
for(const raw of [1,3,8,12,13,24,25,40,80,160])
for(const mastery of [0,1,3,7,15,30])
for(const threshold of [15,18,21,24,27,30,36,40,50]){
  let successCount=0
  for(const [natural,count] of histogram){
    const result=m.resolveProgressionAction({natural,rawStat:raw,masteryRank:mastery,
      situation:0,threshold,feasible:true})
    if(result.success)successCount+=count
    if(natural<=7)assert.equal(result.success,false)
    if(natural>=27&&result.total<threshold)assert.equal(result.criticalApplied,false)
    exhaustiveEvaluations+=count
  }
  assert.equal(m.probabilityProgressionAction({rawStat:raw,masteryRank:mastery,
    situation:0,threshold,feasible:true}),successCount/7776)
  assert(successCount<=7755,"Les 21 échecs naturels interdisent un succès automatique.")
  assert.equal(m.probabilityProgressionAction({rawStat:raw,masteryRank:mastery,
    situation:0,threshold,feasible:false}),0)
}
assert.equal(exhaustiveEvaluations,4199040)
for(let level=1;level<=25;level++){
  const row=m.progressionAtLevel(level)
  assert.equal(row.level,level)
  assert.equal(row.development,6*(level-1))
  assert.equal(row.experience,25*(level-1)**2)
  assert.equal(row.previousExperience,5*(level-1)**3)
  if(level>1)assert(row.experience>m.experienceRequired(level-1))
  assert(m.canReachLevel(level,row.experience,[21,22,23,24,25]))
  if(level>=21)assert.equal(m.canReachLevel(level,row.experience,[]),false)
}
assert.equal(m.statCost(8,9),2)
assert.equal(m.statCost(16,17),3)
assert.equal(m.statCost(24,25),4)
assert.equal(m.masteryCost(6,7),2)
assert.equal(m.masteryCost(12,13),3)
assert(m.effectiveStat(80)>m.effectiveStat(40))
assert(m.effectiveStat(160)>m.effectiveStat(80))
assert(m.effectiveMastery(31)>m.effectiveMastery(15))
for(let rank=1;rank<=300;rank++)
  assert(m.cumulativeRankCost(rank,8)>m.cumulativeRankCost(rank-1,8))
const baselines={physique:3,agilite:3,esprit:3,presence:3}
const specialistScores=[]
for(const level of [5,10,15,20,25]){
  const budget=m.developmentBudget(level)
  const focused={level,startingStats:baselines,stats:{...baselines},masteries:{lames:0},
    aptitudes:0,techniques:0,signatures:0,approvedSignatures:0}
  let spent=0
  for(let raw=4;raw<200;raw++){
    const proposed=m.statCost(3,raw)
    if(proposed>Math.floor(budget*0.8))break
    focused.stats.physique=raw;spent=proposed
  }
  focused.aptitudes=Math.floor((budget-spent)/3)
  assert(m.evaluateBuild(focused).valid,JSON.stringify(m.evaluateBuild(focused)))
  const broad={level,startingStats:baselines,stats:{...baselines},
    masteries:{soins:0,histoire:0,artisanat:0,negociation:0},
    aptitudes:0,techniques:0,signatures:0,approvedSignatures:0}
  const keys=["physique","agilite","esprit","presence"]
  let k=0
  while(true){
    const stats={...broad.stats,[keys[k%4]]:broad.stats[keys[k%4]]+1}
    if(m.evaluateBuild({...broad,stats}).spent>Math.floor(budget*0.7))break
    broad.stats=stats;k++
  }
  broad.aptitudes=Math.floor((budget-m.evaluateBuild(broad).spent)/3)
  assert(m.evaluateBuild(broad).valid,JSON.stringify(m.evaluateBuild(broad)))
  assert(focused.stats.physique>broad.stats.physique)
  specialistScores.push(focused.stats.physique)
}
assert.deepEqual(specialistScores,[15,23,29,34,39])
const extreme={level:25,startingStats:baselines,
  stats:{physique:25,agilite:3,esprit:3,presence:3},masteries:{},
  aptitudes:0,techniques:0,signatures:0,approvedSignatures:0}
assert(m.evaluateBuild(extreme).valid)
assert(!m.evaluateBuild({...extreme,level:5}).valid)
assert(!m.evaluateBuild({...extreme,signatures:1}).valid)
assert(m.evaluateBuild({...extreme,signatures:1,approvedSignatures:1}).valid)
for(const natural of [5,6,7])assert.equal(m.resolveProgressionAction({
  natural,rawStat:160,masteryRank:30,situation:2,threshold:15,feasible:true}).success,false)
assert.equal(m.resolveProgressionAction({natural:30,rawStat:25,masteryRank:30,
  situation:2,threshold:100,feasible:true}).success,false)
assert.equal(m.resolveProgressionAction({natural:30,rawStat:25,masteryRank:30,
  situation:2,threshold:21,feasible:false}).success,false)
const event=(domain,id,pattern,scope="ordinaire",approved=true)=>
  ({domain,id,pattern,scope,approved,difficulty:12})
const domains=["combat","artisanat","savoir","diplomatie","exploration","magie","secours","transmission"]
for(const domain of domains)assert.equal(m.experienceAward(event(domain,domain,domain),[]),240)
assert.equal(m.experienceAward(event("combat","a","same"),[event("combat","a","same")]),0)
assert.equal(m.experienceAward(event("combat","b","same"),[event("combat","a","same")]),120)
assert.equal(m.experienceAward(event("combat","b","same"),
  Array.from({length:4},(_,i)=>event("combat",String(i),"same"))),0)
assert.equal(m.experienceAward(event("savoir","x","unique","legendaire",false),[]),0)
assert.equal(m.experienceAward(event("savoir","x","unique","legendaire",true),[]),1920)
assert.equal(m.canReachLevel(25,14400,[21,22,23,24]),false)
assert.equal(m.canReachLevel(25,14400,[21,22,23,24,25]),true)
console.log(JSON.stringify({result:"OK",diceOutcomes:outcomes,configurations:540,
  exactEvaluations:exhaustiveEvaluations,levelsTested:25,
  specialistLevels:[5,10,15,20,25],specialistRaw:specialistScores,
  testedDomains:domains.length,forcedFailures:21,potentialCriticalOutcomes:56}))
