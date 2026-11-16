/**
 * MATH-EFF-001 — banc indépendant, sans changement des moteurs M01–M03.
 * Exécution : node scripts/test-math-eff-001.mjs
 * Toutes les valeurs de démonstration sont fictives et NON canoniques.
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
const grimoire=await load('quartz/components/scripts/atelier5d6-grimoire.ts')
const legacyDemo=grimoire.DEMO_SPELLS.find(s=>s.id==='demo-etincelle')
assert.equal(legacyDemo?.domain,'foudre')
assert.equal(legacyDemo?.status,'demo')
assert.notEqual(legacyDemo.id,'MAG-SORT-001')

const levels=[1,5,10,15,20,25]
const sample=(level,rank,grade=0)=>{
  const characteristic=3+Math.floor((level-1)*.55)
  return {level,stats:{physique:characteristic,agilite:characteristic,
      esprit:characteristic,presence:characteristic},
    masteries:{lames:rank,esquive:rank,magie:rank,resistance_magique:rank,
      volonte:rank,negociation:rank},
    resistanceBonus:{physique:0,magie:0,mental:0},
    protection:{physique:0,magie:0,mental:0},
    equipmentGrades:{physique:grade,magie:0,mental:0}}
}

/** Adaptateur de contrat pilote, STRICTEMENT de test : tous convergent vers M03. */
function preview(effect,actor,target,natural){
  assert.equal(effect.approvedByGM,true,`${effect.sourceId}: validation MJ requise`)
  assert.equal(effect.status,'approved',`${effect.sourceId}: homologation requise`)
  assert.equal(effect.resources,'reserved',`${effect.sourceId}: coûts hors périmètre`)
  const input={natural,rawStat:actor.stats[effect.statKey],masteryRank:actor.masteries[effect.masteryKey]??0,
    situation:0,level:actor.level,difficulty:effect.difficulty,
    kind:effect.resistance,mode:effect.mode,defender:target,
    feasible:effect.feasible,baseDamage:effect.baseDamage,
    penetration:effect.penetration??0,effects:effect.effects??[]}
  return {input,result:m03.resolveCombatM03(input)}
}
const action={sourceId:'ATT-ORDINAIRE',sourceType:'action',status:'approved',approvedByGM:true,
  resources:'reserved',statKey:'physique',masteryKey:'lames',difficulty:21,
  resistance:'physique',mode:'melee',feasible:true,baseDamage:6}
const combatant=sample(10,5,1)
const defender=sample(10,5,2)
const native=m03.resolveCombatM03({natural:21,rawStat:combatant.stats.physique,
  masteryRank:combatant.masteries.lames,situation:0,level:10,difficulty:21,
  kind:'physique',mode:'melee',defender,feasible:true,baseDamage:6})
assert.deepEqual(preview(action,combatant,defender,21).result,native)
const tabletop=preview(action,sample(5,1,1),sample(5,1,1),18).result
assert.equal(tabletop.total,23)
assert.equal(tabletop.threshold,21)
assert.equal(tabletop.grossDamage,10)
assert.equal(tabletop.protection,1)
assert.equal(tabletop.damage,9)

const ability={id:'EFF-TEST',name:'Effet test',description:'Simulation fictive',
  domain:'combat',kind:'technique',levelRequired:1,effect:'Bonus explicite',
  limitations:'1 tour',provenance:'MATH-EFF-001',approvedByGM:true,status:'defined',rank:1}
const approvedImpact=m03.validateM03AbilityEffect(ability,
  {abilityId:ability.id,kind:'impact',magnitude:2,duration:1,trigger:'attaque'})
assert(approvedImpact)
const sources=[
  action,
  {...action,sourceId:'CAP-PHYS-TEST',sourceType:'physical-ability',effects:[approvedImpact]},
  {...action,sourceId:'CAP-MAG-TEST',sourceType:'magical-ability',statKey:'esprit',
    masteryKey:'magie',mode:'magie',resistance:'magie'},
  // MAG-SORT-001 : feu, Cercle I ; baseDamage=6 est UNE HYPOTHÈSE DU BANC.
  // Aucun coût, intensité, bonus d'affinité ou chiffre hérité de demo-etincelle.
  {...action,sourceId:'MAG-SORT-001',sourceType:'spell',circle:'I',school:'feu',
    statKey:'esprit',masteryKey:'magie',mode:'magie',resistance:'magie'},
  {...action,sourceId:'OBJ-ENCHANT-TEST',sourceType:'enchanted-item',
    effects:[approvedImpact]},
  {...action,sourceId:'BEST-ATTAQUE-TEST',sourceType:'creature-attack'},
]
assert.equal(sources.find(s=>s.sourceId==='MAG-SORT-001')?.school,'feu')
assert.equal(sources.find(s=>s.sourceId==='MAG-SORT-001')?.circle,'I')
assert.throws(()=>preview({...action,baseDamage:null},combatant,defender,21),RangeError)
for(const effect of sources){
  const {result}=preview(effect,combatant,defender,21)
  assert(result.success)
  assert(result.damage>=0)
  assert.equal(result.grossDamage-result.absorbed,result.damage)
}
// L'objet purement descriptif n'obtient aucun effet chiffré.
const descriptive=preview({...action,sourceId:'OBJ-DESCRIPTIF',sourceType:'item'},combatant,defender,21)
assert.deepEqual(descriptive.result,native)
// Un effet mental réussi NE retire aucun PV, même avec une valeur de base conventionnelle.
const mental=preview({...action,sourceId:'CAP-MENTAL',sourceType:'mental-ability',
  statKey:'esprit',masteryKey:'volonte',mode:'mental',resistance:'mental',baseDamage:12},
  combatant,defender,30).result
assert.equal(mental.damage,0)
assert.equal(mental.grossDamage,0)
assert.equal(mental.effectProposed,true)
assert.equal(preview({...action,feasible:false},combatant,defender,30).result.damage,0)
assert.equal(preview({...action,mode:'mental',resistance:'mental'},combatant,defender,6).result.damage,0)
assert.throws(()=>preview({...action,approvedByGM:false},combatant,defender,20))
assert.throws(()=>preview({...action,resources:'charged'},combatant,defender,20))

// Test exhaustif des 7 776 issues d'un jet 5d6 ; aucune approximation Monte-Carlo.
assert.equal(Array.from({length:26},(_,i)=>prob.sumOccurrences(i+5)).reduce((a,b)=>a+b,0),7776)
function exact(input){
  let hits=0,causesPV=0,averageDamage=0
  for(let n=5;n<=30;n++){
    const count=prob.sumOccurrences(n)
    const result=m03.resolveCombatM03({...input,natural:n})
    hits+=count*Number(result.success)
    causesPV+=count*Number(result.damage>0)
    averageDamage+=count*result.damage
  }
  return {pHit:hits/7776,pWound:causesPV/7776,dpa:averageDamage/7776}
}
const scenarios=[]
for(const level of levels){
  const baseRank=Math.floor((level-1)*.45)
  const reference=sample(level,baseRank,Math.min(5,Math.floor(level/5)))
  const hp=bestiary.baseHealth(level)
  const variants=[['débutant',0],['formé',baseRank],['spécialiste',Math.floor((level-1)*.8)]]
  for(const [profile,rank] of variants){
    const fighter=sample(level,rank,Math.min(5,Math.floor(level/5)))
    const input={natural:18,rawStat:fighter.stats.physique,masteryRank:rank,
      situation:0,level,difficulty:21,kind:'physique',mode:'melee',
      defender:reference,feasible:true,baseDamage:6,penetration:0}
    const standard=exact(input)
    const strong=exact({...input,baseDamage:12})
    const print={level,profile,rank,E:m01.effectiveStat(fighter.stats.physique),
      M:m01.effectiveMastery(rank),hp,pHit:standard.pHit,dpa:standard.dpa,
      actionsSolo:standard.dpa?hp/standard.dpa:null,
      actionsSoloMaxBase:strong.dpa?hp/strong.dpa:null,
      rounds3Allies:standard.dpa?hp/(3*standard.dpa):null,
      roundsHalfHP:standard.dpa?(hp*.5)/standard.dpa:null}
    scenarios.push(print)
    assert(standard.dpa>=0&&standard.pHit>=0&&standard.pHit<=1)
    assert(strong.dpa>=standard.dpa)
  }
}
for(const level of levels){
  const group=scenarios.filter(s=>s.level===level)
  assert(group[1].dpa>=group[0].dpa)
  assert(group[2].dpa>=group[1].dpa)
}
// M03 ne consomme pas la catégorie absorption : observation tracée, non réparée ici.
const absorb=m03.validateM03AbilityEffect(ability,
  {abilityId:ability.id,kind:'absorption',magnitude:2,duration:1,trigger:'defense'})
assert(absorb)
const noAbsorb=preview(action,combatant,defender,21).result
const withAbsorb=preview({...action,effects:[absorb]},combatant,defender,21).result
assert.equal(withAbsorb.absorbed,noAbsorb.absorbed)
assert.equal(withAbsorb.damage,noAbsorb.damage)

console.log('MATH-EFF-001 PASS — 6 familles sources, mental/objets/approbation, 7 776 issues exactes.')
console.log('ATTENTION : valeurs fictives, non homologuées ; M03 inchangé, absorption dormant.')
console.table(scenarios.map(s=>({...s,pHit:(s.pHit*100).toFixed(1)+'%',
  dpa:s.dpa.toFixed(2),actionsSolo:s.actionsSolo?.toFixed(1)??'blocage',
  actionsSoloMaxBase:s.actionsSoloMaxBase?.toFixed(1)??'blocage',
  rounds3Allies:s.rounds3Allies?.toFixed(1)??'blocage',
  roundsHalfHP:s.roundsHalfHP?.toFixed(1)??'blocage'})))
