import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {build} from 'esbuild'

async function load(file){
  const output=await build({entryPoints:[file],bundle:true,platform:'node',
    format:'esm',target:'es2022',write:false,logLevel:'silent'})
  return import('data:text/javascript;base64,'+Buffer.from(output.outputFiles[0].text).toString('base64'))
}
const m=await load('quartz/components/scripts/atelier5d6-combat-m03.ts')
const legacy=await load('quartz/components/scripts/atelier5d6-opposition.ts')
const creatures=await load('quartz/components/scripts/atelier5d6-bestiary.ts')
const progression=await load('quartz/components/scripts/atelier5d6-progression.ts')
const prob=await load('quartz/components/scripts/atelier5d6-probabilities.ts')
const sheet=(level,variant='polyvalent',grade=0)=>{
  const raw=3+Math.floor((level-1)*.55),rank=Math.floor((level-1)*.45)
  const stats={physique:raw,agilite:raw,esprit:raw,presence:raw}
  if(variant==='offensif')stats.physique+=3
  if(variant==='defensif')stats.agilite+=3
  if(variant==='mobile')stats.agilite+=2
  return {level,stats,masteries:{lames:rank,esquive:variant==='defensif'?rank+3:rank,
    magie:rank,negociation:rank},resistanceBonus:{physique:0,magie:0,mental:0},
    protection:{physique:0,magie:0,mental:0},
    equipmentGrades:{physique:grade,magie:0,mental:0}}
}
const attempt=(natural,att,def,extra={})=>m.resolveCombatM03({
  natural,rawStat:att.stats.physique,masteryRank:att.masteries.lames,
  level:att.level,situation:0,difficulty:21,kind:'physique',mode:'melee',
  defender:def,feasible:true,baseDamage:6,...extra
})
const exact=(att,def,extra={})=>{
  let hits=0,wounds=0,total=0,sq=0,contact=0
  for(let n=5;n<=30;n++){
    const w=prob.sumOccurrences(n)
    const result=attempt(n,att,def,extra)
    hits+=w*Number(result.success)
    contact+=w*Number(result.contact)
    wounds+=w*Number(result.damage>0)
    total+=w*result.damage
    sq+=w*result.damage**2
  }
  return {hit:hits/7776,contact:contact/7776,wound:wounds/7776,
    damage:total/7776,variance:sq/7776-(total/7776)**2,
    rounds:total?def.level===25?creatures.baseHealth(25)/(total/7776):creatures.baseHealth(def.level)/(total/7776):Infinity}
}
let rolls=0
for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)for(let c=1;c<=6;c++)
for(let d=1;d<=6;d++)for(let e=1;e<=6;e++){
  rolls++
  const r=attempt(a+b+c+d+e,sheet(5),sheet(5))
  assert.equal(r.criticalFailure,(a+b+c+d+e)<=7)
  if(a+b+c+d+e<=7)assert.equal(r.damage,0)
}
assert.equal(rolls,7776)
for(const level of [1,5,10,15,20,25]){
  const a=sheet(level,'offensif',2),d=sheet(level,'defensif',Math.min(5,Math.floor(level/5)))
  const r=exact(a,d)
  assert(r.hit>0.05&&r.hit<1)
  assert(r.damage>0)
  if(level>=5)assert(r.rounds<100,'Duel symétrique démesurément long : N'+level)
  assert(Number.isFinite(r.variance)&&r.variance>=0)
}
const comparisons=[[5,5],[10,10],[15,15],[20,20],[25,25],
  [5,10],[10,15],[15,20],[20,25],[5,25]]
const results=[]
for(const [a,d] of comparisons){
  const offense=sheet(a,'offensif',Math.min(5,Math.floor(a/5)))
  const defense=sheet(d,'defensif',Math.min(5,Math.floor(d/5)))
  const r=exact(offense,defense)
  results.push({a,d,pTouch:r.hit,pWound:r.wound,damage:r.damage,rounds:r.rounds})
  assert(r.hit>=0&&r.hit<=1&&r.wound>=0&&r.wound<=1)
}
const n25=results.find(x=>x.a===25&&x.d===25)
assert(n25.rounds<100&&Number.isFinite(n25.rounds))
const norm=progression.resolveProgressionAction({natural:18,rawStat:19,masteryRank:9,
  situation:-1,threshold:25,feasible:true})
const combat=m.resolveCombatM03({natural:18,rawStat:19,masteryRank:9,situation:-1,
  level:15,difficulty:25,kind:'mental',mode:'mental',feasible:true,baseDamage:1})
assert.equal(norm.total,combat.total)
assert.equal(norm.success,combat.success)
assert.equal(combat.damage,0)
assert.equal(combat.masteryBonus,progression.effectiveMastery(9))
assert.equal(combat.statBonus,progression.effectiveStat(19))
assert.equal(attempt(30,sheet(25),sheet(25),{feasible:false}).damage,0)
assert.equal(attempt(30,sheet(25),sheet(25),{feasible:false}).contact,false)
const critical=attempt(30,sheet(5),sheet(25),{mjMinimum:45})
assert.equal(critical.success,false)
assert.equal(critical.damage,0)
const armored=sheet(25,'defensif',5),unarmored=sheet(25,'defensif',0)
assert(m.effectiveProtectionM03(armored,'physique')>m.effectiveProtectionM03(unarmored,'physique'))
assert(m.effectiveProtectionM03(armored,'physique')<20)
assert(attempt(20,sheet(25,'offensif'),unarmored).damage>
  attempt(20,sheet(25,'offensif'),armored).damage)
assert(m.resistanceScoreM03(sheet(25),'physique')<45)
assert.equal(legacy.innateProtection(25,'physique'),55,'Legacy inchangé')
assert.equal(legacy.equipmentProtection(5,'physique'),30,'Legacy inchangé')
for(const t of ['faune','predateur','gardien','mystique','colosse']){
  for(let n=1;n<=25;n++){
    const c=creatures.generateCreatureProfileM03(n,t)
    assert(c.pvMax>0&&c.level===n)
    assert(Object.values(c.stats).every(Number.isSafeInteger))
  }
}
assert(creatures.generateCreatureProfileM03(25,'colosse').stats.physique>12)
assert(creatures.generateCreatureProfileM03(25,'predateur').stats.agilite>
  creatures.generateCreatureProfileM03(25,'gardien').stats.agilite)
const ability={id:'test-a',name:'Test neutre',description:'Essai mécanique',
  domain:'combat',kind:'technique',levelRequired:5,effect:'Effet descriptif',
  limitations:'Durée trois tours',provenance:'Test',approvedByGM:true,
  status:'defined',rank:1}
const proposal={abilityId:'test-a',kind:'precision',magnitude:2,
  duration:2,trigger:'attaque'}
assert.equal(m.validateM03AbilityEffect({...ability,status:'slot'},proposal),null)
assert.equal(m.validateM03AbilityEffect({...ability,approvedByGM:false},proposal),null)
assert.equal(m.validateM03AbilityEffect(ability,{...proposal,kind:'arbitrary_code'}),null)
const recognized=m.validateM03AbilityEffect(ability,proposal)
assert(recognized)
const baseline=attempt(18,sheet(10),sheet(10))
const empowered=attempt(18,sheet(10),sheet(10),{effects:[recognized]})
assert.equal(empowered.total-baseline.total,2)
const invalids=[NaN,-1,Infinity,1.4]
for(const bad of invalids){
  assert.throws(()=>attempt(18,sheet(5),sheet(5),{rawStat:bad}))
  assert.throws(()=>attempt(18,sheet(5),sheet(5),{baseDamage:bad}))
}
const code=await readFile('quartz/components/scripts/atelier5d6.inline.ts','utf8')
assert(code.includes('resolveCombatM03({')&&code.includes('ruleset==="m02"'))
assert(code.includes('data-opposition-feasible'))
assert(code.includes('state.mode==="pj"'))
assert(code.includes('window.confirm("Appliquer "'))
assert(code.includes('alrick.campaign.v2')&&code.includes('alrick.sheets.v3'))
assert(code.includes('legacyOriginal'))
assert(code.includes('generateCreatureProfileM03(lvl,type)'))
const html=await readFile('quartz/components/Atelier5d6.tsx','utf8')
assert(html.includes('data-opposition-feasible'))
const group={teamA:[sheet(10,'offensif'),sheet(10,'mobile')],
  teamB:[sheet(10,'defensif',2),sheet(10,'polyvalent',2)]}
let teamDmg=0
for(const attacker of group.teamA)for(const defender of group.teamB)
  teamDmg+=exact(attacker,defender).damage
assert(teamDmg>0)
// Séries multi-rounds à graine fixe : mesures statistiques, pas playtests humains.
let seed=20261031
const unit=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296}
const rollNatural=()=>Array.from({length:5},()=>1+Math.floor(unit()*6)).reduce((a,b)=>a+b,0)
const duelRounds=(attacker,defender,maxRounds=300)=>{
  let remaining=creatures.baseHealth(defender.level)
  for(let round=1;round<=maxRounds;round++){
    remaining-=attempt(rollNatural(),attacker,defender).damage
    if(remaining<=0)return round
  }
  return null
}
const distribution=[]
for(const [a,d] of comparisons){
  const attacker=sheet(a,'offensif',Math.min(5,Math.floor(a/5)))
  const defender=sheet(d,'defensif',Math.min(5,Math.floor(d/5)))
  const values=Array.from({length:360},()=>duelRounds(attacker,defender))
  const survived=values.filter(x=>x!==null).sort((x,y)=>x-y)
  const stuck=values.length-survived.length
  const median=survived.length?survived[Math.floor(survived.length/2)]:null
  const p10=survived.length?survived[Math.floor(survived.length*.1)]:null
  const p90=survived.length?survived[Math.floor(survived.length*.9)]:null
  distribution.push({a,d,median,p10,p90,stuck,simulations:values.length})
  if(a===d)assert.equal(stuck,0,'Profil de même niveau bloqué dans la simulation')
}
function groupRounds(allies,defenders,maxRounds=300){
  const targets=defenders.map(s=>({sheet:s,hp:creatures.baseHealth(s.level)}))
  for(let round=1;round<=maxRounds;round++){
    for(const ally of allies){
      const target=targets.find(t=>t.hp>0)
      if(!target)break
      target.hp-=attempt(rollNatural(),ally,target.sheet).damage
    }
    if(targets.every(t=>t.hp<=0))return round
  }
  return null
}
const group2v2=Array.from({length:240},()=>groupRounds(
  [sheet(10,'offensif'),sheet(10,'mobile')],[sheet(10,'defensif',2),sheet(10,'polyvalent',2)]))
const group3v1=Array.from({length:240},()=>groupRounds(
  [sheet(10,'offensif'),sheet(10,'mobile'),sheet(10,'polyvalent')],[sheet(15,'defensif',3)]))
assert(group2v2.every(Number.isSafeInteger),'Surnombre 2v2 : aucun blocage')
assert(group3v1.every(Number.isSafeInteger),'Surnombre 3v1 : aucun blocage')
console.table(distribution)
console.log('Combat groupé : 240 simulations 2v2 et 240 simulations 3v1 à graine fixe.')
console.table(results.map(r=>({...r,pTouch:(100*r.pTouch).toFixed(1)+'%',
  pWound:(100*r.pWound).toFixed(1)+'%',
  damage:r.damage.toFixed(2),rounds:Number.isFinite(r.rounds)?r.rounds.toFixed(1):'blocage'})))
console.log('M03 : 7 776 combinaisons, 10 duels de référence, profils, protections, validation MJ, bestiaire et groupe contrôlés.')
