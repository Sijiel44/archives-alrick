import assert from 'node:assert/strict'
import {build} from 'esbuild'

async function load(file){
  const output=await build({entryPoints:[file],bundle:true,platform:'node',
    format:'esm',target:'es2022',write:false,logLevel:'silent'})
  return import('data:text/javascript;base64,'+
    Buffer.from(output.outputFiles[0].text).toString('base64'))
}
const m=await load('quartz/components/scripts/atelier5d6-combat-m03.ts')
const defend=(level=15,grade=3)=>({
  level,stats:{physique:10,agilite:10,esprit:10,presence:10},
  masteries:{lames:4,esquive:4,magie:4,volonte:4},
  resistanceBonus:{physique:0,magie:0,mental:0},
  protection:{physique:0,magie:0,mental:0},
  equipmentGrades:{physique:grade,magie:grade,mental:0},
})
const input={
  natural:19,rawStat:30,masteryRank:15,situation:0,level:25,
  difficulty:21,kind:'physique',mode:'melee',feasible:true,
  baseDamage:8,penetration:1,defender:defend(),
}
const fields=['natural','statBonus','masteryBonus','total','threshold',
 'defense','gap','numericSuccess','feasible','success','criticalFailure',
 'criticalPotential','glancing','contact','grossDamage','protection',
 'penetrated','absorbed','damage','effectProposed','reaction']
const compare=(a,b)=>{
  for(const key of fields)assert.deepEqual(b[key],a[key],
    'Parité M03 : champ '+key)
}
let count=0
// Parité exacte, toutes les 7 776 issues naturelles, en mêlée/magie/mental.
for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)
for(let c=1;c<=6;c++)for(let d=1;d<=6;d++)for(let e=1;e<=6;e++){
  const natural=a+b+c+d+e
  for(const mode of ['melee','magie','mental']){
    const kind=mode==='magie'?'magie':mode==='mental'?'mental':'physique'
    const sample={...input,natural,kind,mode,
      affinityBonus:mode==='magie'?4:0}
    const baseline=m.resolveCombatM03(sample)
    const extended=m.resolveUnifiedCombatM03(sample)
    compare(baseline,extended)
    assert.equal(extended.intensityMultiplier,1)
    assert.equal(extended.specialAbsorption,0)
    assert.equal(extended.heroicBenefit,null)
    if(natural<=7)assert.equal(extended.damage,0)
    if(mode==='mental')assert.equal(extended.damage,0)
  }
  count++
}
assert.equal(count,7776)
assert.equal(m.divineOffensiveMultiplierM03(20,'majeure'),1)
const factors={21:[1.25,1.5],22:[1.30,1.60],23:[1.35,1.70],
  24:[1.40,1.80],25:[1.50,2.00]}
for(const [n,expected] of Object.entries(factors)){
  assert.equal(m.divineOffensiveMultiplierM03(+n,'mineure'),1)
  assert.equal(m.divineOffensiveMultiplierM03(+n,'courante'),expected[0])
  assert.equal(m.divineOffensiveMultiplierM03(+n,'majeure'),expected[1])
}
assert.equal(m.divineOffensiveMultiplierM03(1,'majeure'),1)
assert.throws(()=>m.divineOffensiveMultiplierM03(26,'majeure'))
const permit=tier=>({tier,approved:true,
  definitionId:'pilot/ability/1',version:1})
const divine={...input,natural:22,kind:'magie',mode:'magie',affinityBonus:4}
const plain=m.resolveCombatM03(divine)
assert(plain.success)
for(const tier of ['mineure','courante','majeure']){
  const actual=m.resolveUnifiedCombatM03({...divine,intensity:permit(tier)})
  const k=m.divineOffensiveMultiplierM03(25,tier)
  const expected=Math.floor((plain.grossDamage-4)*k)+4
  assert.equal(actual.grossDamage,expected,'Multiplier sans doubler affinité')
  assert.equal(actual.damage,
    Math.max(0,expected-plain.absorbed),'Protection non multipliée')
}
const absent=m.resolveUnifiedCombatM03({...divine,
  applySpecialAbsorption:true})
assert.equal(absent.specialAbsorption,0)
const ability={id:'def/1',name:'Absorption',description:'Effet défensif',
  domain:'combat',kind:'technique',levelRequired:5,effect:'Réduire les dégâts',
  limitations:'Durée trois tours',provenance:'Test',approvedByGM:true,
  status:'defined',rank:1}
const absorption=m.validateM03AbilityEffect(ability,{
  abilityId:'def/1',kind:'absorption',magnitude:2,duration:2,trigger:'defense'})
assert(absorption)
const active=m.resolveUnifiedCombatM03({...input,natural:22,
  effects:[absorption],applySpecialAbsorption:true})
const passive=m.resolveUnifiedCombatM03({...input,natural:22,
  effects:[absorption]})
assert(active.success&&active.damage>=0)
assert.equal(passive.specialAbsorption,0,'Aucun changement des anciens appels')
assert.equal(active.specialAbsorption,2)
assert.equal(active.damage,passive.damage-2)
assert.equal(active.penetrated,passive.penetrated)
const piercing=m.resolveUnifiedCombatM03({...input,natural:22,
  penetration:8,effects:[absorption],applySpecialAbsorption:true})
assert.equal(piercing.penetrated,piercing.protection)
assert.equal(piercing.specialAbsorption,2,'Pénétration ne traverse pas absorption')
const impact=m.validateM03AbilityEffect({...ability,id:'att/1'},{
  abilityId:'att/1',kind:'impact',magnitude:1,duration:2,trigger:'attaque'})
assert(impact)
const heroicBase={...input,natural:30}
const heroic=m.resolveUnifiedCombatM03({...heroicBase,heroicChoice:'impact'})
const nonHero=m.resolveUnifiedCombatM03(heroicBase)
assert(heroic.success)
assert.equal(heroic.grossDamage-nonHero.grossDamage,2)
assert.equal(heroic.heroicBenefit,'impact')
const heroicWithImpact=m.resolveUnifiedCombatM03({...heroicBase,
  heroicChoice:'impact',effects:[impact]})
const withImpact=m.resolveUnifiedCombatM03({...heroicBase,effects:[impact]})
assert.equal(heroicWithImpact.grossDamage-withImpact.grossDamage,1,
  'Critique: meilleur impact 2 et non somme des deux bonus')
const tactical=m.resolveUnifiedCombatM03({...heroicBase,heroicChoice:'tactique'})
assert.equal(tactical.damage,nonHero.damage)
assert.equal(tactical.heroicBenefit,'tactique')
const failed=m.resolveUnifiedCombatM03({...heroicBase,feasible:false,
  heroicChoice:'impact',intensity:permit('majeure')})
assert.equal(failed.damage,0)
assert.equal(failed.heroicBenefit,null)
const mental=m.resolveUnifiedCombatM03({...heroicBase,kind:'mental',
  mode:'mental',heroicChoice:'impact',intensity:permit('majeure')})
assert.equal(mental.damage,0)
assert.equal(mental.heroicBenefit,null)
assert.throws(()=>m.resolveUnifiedCombatM03({...divine,
  intensity:{...permit('majeure'),approved:false}}))
assert.throws(()=>m.resolveUnifiedCombatM03({...divine,
  intensity:{...permit('majeure'),version:0}}))
assert.throws(()=>m.resolveUnifiedCombatM03({...divine,
  intensity:{...permit('majeure'),tier:'inconnue'}}))
assert.throws(()=>m.resolveUnifiedCombatM03({...divine,
  heroicChoice:'inconnu'}))
console.log('MATH-REF-002A : parité complète 7776 issues x 3 modes = 23328 cas ; intensité/divin, critique, absorption, pénétration, mental et refuss d’autorisations : PASS.')
