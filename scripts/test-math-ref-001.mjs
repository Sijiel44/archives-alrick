/**
 * MATH-REF-001 — prototype mathématique hors production.
 * Utilise les vraies fonctions M01/M03/Bestiaire. Le multiplicateur divin et
 * l'absorption sont des CONTREFACTUELS : aucune formule du site n'est modifiée.
 * node scripts/test-math-ref-001.mjs
 */
import assert from 'node:assert/strict'
import {build} from 'esbuild'

async function load(file){
  const output=await build({entryPoints:[file],bundle:true,platform:'node',
    format:'esm',target:'es2022',write:false,logLevel:'silent'})
  return import('data:text/javascript;base64,'+Buffer.from(output.outputFiles[0].text).toString('base64'))
}
const m03=await load('quartz/components/scripts/atelier5d6-combat-m03.ts')
const m01=await load('quartz/components/scripts/atelier5d6-progression.ts')
const prob=await load('quartz/components/scripts/atelier5d6-probabilities.ts')
const bestiary=await load('quartz/components/scripts/atelier5d6-bestiary.ts')

// Grille chiffrée approuvée pour expérimentation, non homologuée en production.
const divine={20:{normal:1,major:1},21:{normal:1.25,major:1.5},
  22:{normal:1.30,major:1.60},23:{normal:1.35,major:1.70},
  24:{normal:1.40,major:1.80},25:{normal:1.50,major:2}}
function factor(level,intensity){
  assert(Number.isSafeInteger(level)&&level>=1&&level<=25)
  assert(['minimal','normal','major'].includes(intensity))
  if(intensity==='minimal'||level<=20)return 1
  return divine[level][intensity]
}
function sheet(level,masteryRank=Math.floor(.45*(level-1))){
  const raw=3+Math.floor(.55*(level-1))
  return {level,stats:{physique:raw,agilite:raw,esprit:raw,presence:raw},
    masteries:{lames:masteryRank,esquive:masteryRank,magie:masteryRank,
      resistance_magique:masteryRank,volonte:masteryRank,negociation:masteryRank},
    resistanceBonus:{physique:0,magie:0,mental:0},
    protection:{physique:0,magie:0,mental:0},
    equipmentGrades:{physique:Math.min(5,Math.floor(level/5)),magie:0,mental:0}}
}
function attempt(level,natural,intensity='normal',opts={}){
  const actor=sheet(level,opts.rank)
  const defender=opts.defender??sheet(level)
  const mode=opts.mode??'melee'
  const kind=opts.kind??(mode==='magie'?'magie':mode==='mental'?'mental':'physique')
  const input={natural,rawStat:actor.stats[mode==='magie'||mode==='mental'?'esprit':'physique'],
    masteryRank:actor.masteries[mode==='magie'?'magie':mode==='mental'?'volonte':'lames'],
    situation:0,level,difficulty:21,kind,mode,defender,
    feasible:opts.feasible??true,baseDamage:opts.baseDamage??6,
    penetration:opts.penetration??0,affinityBonus:opts.affinityBonus??0}
  const m03Result=m03.resolveCombatM03(input)
  const k=factor(level,intensity)
  const additionalAbsorption=opts.absorption??0
  assert(Number.isSafeInteger(additionalAbsorption)&&additionalAbsorption>=0&&additionalAbsorption<=2)
  // L'effet mental reste intégralement hors PV ; les affinités ne sont pas remultipliées.
  if(mode==='mental'||!m03Result.success)return {...m03Result,damageCandidate:0,
    grossCandidate:0,absorptionCandidate:0,factor:k}
  const existingAffinity=mode==='magie'?input.affinityBonus:0
  const baseGross=m03Result.grossDamage-existingAffinity
  const grossCandidate=Math.floor(baseGross*k)+existingAffinity
  const remainingProtection=Math.max(0,m03Result.protection-m03Result.penetrated)
  const absorptionCandidate=Math.min(grossCandidate,remainingProtection+additionalAbsorption)
  return {...m03Result,grossCandidate,absorptionCandidate,
    damageCandidate:grossCandidate-absorptionCandidate,factor:k}
}
function exact(level,intensity,opts={}){
  let hits=0,damage=0,base=0
  for(let natural=5;natural<=30;natural++){
    const weight=prob.sumOccurrences(natural)
    const r=attempt(level,natural,intensity,opts)
    hits+=weight*Number(r.success)
    damage+=weight*r.damageCandidate
    base+=weight*r.damage
  }
  return {hit:hits/7776,dpa:damage/7776,original:base/7776}
}
assert.equal(Array.from({length:26},(_,i)=>prob.sumOccurrences(i+5)).reduce((s,n)=>s+n,0),7776)
assert.equal(m01.developmentBudget(25),144)
assert.equal(m01.masteryCost(31,32),6)
assert.equal(m01.effectiveMastery(31),5)
assert.equal(m01.effectiveMastery(32),5)
assert.equal(factor(20,'major'),1,'N20 : éveil sans multiplicateur offensive instantané')
assert.equal(factor(21,'normal'),1.25)
assert.equal(factor(21,'major'),1.5)
assert.equal(factor(25,'normal'),1.5)
assert.equal(factor(25,'major'),2)

// Parité stricte de la projection « minimal » avec M03, avant toute absorption.
for(const level of [1,5,10,15,20,21,22,23,24,25])for(let n=5;n<=30;n++){
  const r=attempt(level,n,'minimal')
  assert.equal(r.damageCandidate,r.damage)
  if(n<=7)assert.equal(r.damageCandidate,0)
}
const noDamageMental=attempt(25,30,'major',{mode:'mental',baseDamage:12})
assert.equal(noDamageMental.damageCandidate,0)
assert.equal(noDamageMental.effectProposed,true)
assert.equal(attempt(25,30,'major',{feasible:false}).damageCandidate,0)
const ability={id:'REF-ABS-TEST',name:'Garde réduisant les blessures',
  description:'Capacité défensive fictive',domain:'combat',kind:'technique',
  levelRequired:1,effect:'Réduction hypothétique',limitations:'Un round',
  provenance:'MATH-REF-001',approvedByGM:true,status:'defined',rank:1}
const approvedAbsorption=m03.validateM03AbilityEffect(ability,{abilityId:ability.id,
  kind:'absorption',magnitude:2,duration:1,trigger:'defense'})
assert(approvedAbsorption?.approved)
const armored=attempt(10,24,'normal')
const shielded=attempt(10,24,'normal',{absorption:approvedAbsorption.magnitude})
assert.equal(shielded.damageCandidate,Math.max(0,armored.damageCandidate-2),
  'Absorption = réduction post-protection, NON intégrée à M03 actuel')
const pierced=attempt(10,24,'normal',{penetration:8})
assert(pierced.damageCandidate>=armored.damageCandidate)
const magic=attempt(21,24,'major',{mode:'magie',affinityBonus:3})
assert(magic.grossCandidate>=3)

const levels=[1,5,10,15,20,21,22,23,24,25]
const results=levels.map(level=>{
  const minimal=exact(level,'minimal')
  const normal=exact(level,'normal')
  const major=exact(level,'major')
  const hp=bestiary.baseHealth(level)
  assert(normal.dpa>=minimal.dpa&&major.dpa>=normal.dpa)
  return {level,hp,pHit:normal.hit,original:minimal.dpa,normal:normal.dpa,major:major.dpa,
    actionsNormal:hp/normal.dpa,actionsMajor:hp/major.dpa}
})
const twenty=results.find(x=>x.level===20),twentyOne=results.find(x=>x.level===21)
assert(twentyOne.normal/twenty.normal>1.30)
assert(twentyOne.major/twenty.major>1.70)

// 3 alliés, une seule intensité majeure par combattant et par affrontement.
// Simule les rounds offensifs jusqu'aux PV 0 (sans représenter les ripostes,
// soins, objectifs, contrôle, fuite, initiative ou véritables coûts de mana).
let seed=20261116
const unit=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296}
const roll5d6=()=>Array.from({length:5},()=>1+Math.floor(unit()*6)).reduce((a,b)=>a+b,0)
function rounds(level,multiplier,allies=3,maxRounds=100){
  let hp=Math.ceil(bestiary.baseHealth(level)*multiplier)
  for(let round=1;round<=maxRounds;round++){
    for(let actor=0;actor<allies;actor++){
      const intensity=round===1?'major':'normal'
      hp-=attempt(level,roll5d6(),intensity).damageCandidate
    }
    if(hp<=0)return round
  }
  return null
}
const encounters=[]
for(const level of [1,5,10,15,20,21,25]){
  for(const [kind,multiplier] of [['ordinaire',1],['elite',1.5],['boss',2]]){
    const values=Array.from({length:300},()=>rounds(level,multiplier))
    assert(values.every(Number.isSafeInteger),'Pas de blocage dans le scénario')
    values.sort((a,b)=>a-b)
    const median=values[150],p10=values[30],p90=values[270]
    encounters.push({level,kind,multiplier,median,p10,p90,mean:values.reduce((a,b)=>a+b,0)/300})
  }
}
// L'objectif de rythme est calibré en premier sur l'échantillon N25, pas imposé
// comme preuve de recette pour tous les niveaux, archétypes et groupes possibles.
const epic=(kind)=>encounters.find(x=>x.level===25&&x.kind===kind)
assert(epic('ordinaire').median>=3&&epic('ordinaire').median<=6)
assert(epic('elite').median>=5&&epic('elite').median<=9)
assert(epic('boss').median>=8&&epic('boss').median<=12)

console.log('MATH-REF-001 PASS — projection chiffrée N20/21/25, maîtrise PNJ, ' +
  'mental, absorption, pénétration, 7 776 issues et 6 300 rencontres à graine fixe.')
console.log('NON-PRODUCTION : multiplicateurs et absorption de référence non implantés en M03.')
console.table(results.map(r=>({N:r.level,PV:r.hp,
  touche:(r.pHit*100).toFixed(1)+'%',M03:r.original.toFixed(2),
  courant:r.normal.toFixed(2),majeur:r.major.toFixed(2),
  actionsCourantes:r.actionsNormal.toFixed(1),actionsMajeures:r.actionsMajor.toFixed(1)})))
console.table(encounters.filter(x=>[10,20,21,25].includes(x.level)).map(x=>({
  N:x.level,cible:x.kind,median:x.median,p10:x.p10,p90:x.p90,
  roundsMoyens:x.mean.toFixed(2)})))
