import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {transform} from 'esbuild'

async function loadTs(file) {
  const source = await readFile(file, 'utf8')
  const compiled = await transform(source, {loader:'ts', format:'esm', target:'es2022'})
  return import('data:text/javascript;base64,'+Buffer.from(compiled.code).toString('base64'))
}

const {
  TOTAL_OUTCOMES, sumOccurrences, naturalCategory, countSuccessfulRolls,
  probabilitySuccess, rollFiveDice,
} = await loadTs('quartz/components/scripts/atelier5d6-probabilities.ts')
const {resistanceScore, effectiveProtection, resolveOpposition} =
  await loadTs('quartz/components/scripts/atelier5d6-opposition.ts')
const {baseHealth} = await loadTs('quartz/components/scripts/atelier5d6-bestiary.ts')

assert.equal(TOTAL_OUTCOMES, 7776)
assert.equal(sumOccurrences(5), 1)
assert.equal(sumOccurrences(6), 5)
assert.equal(sumOccurrences(7), 15)
assert.equal(sumOccurrences(17), 780)
assert.equal(sumOccurrences(18), 780)
assert.equal(sumOccurrences(30), 1)
assert.equal(sumOccurrences(31), 0)
let count = 0
for (let sum=5; sum<=30; sum++) {
  count += sumOccurrences(sum)
  assert.equal(sumOccurrences(sum),sumOccurrences(35-sum), 'Symétrie de la distribution')
}
assert.equal(count, 7776)
assert.equal(sumOccurrences(27)+sumOccurrences(28)+sumOccurrences(29),55)
assert.equal(sumOccurrences(5)+sumOccurrences(6)+sumOccurrences(7),21)
assert.equal(naturalCategory(5), 'echec_exceptionnel')
assert.equal(naturalCategory(6), 'echec_mineur')
assert.equal(naturalCategory(7), 'echec_mineur')
assert.equal(naturalCategory(27), 'reussite_critique_potentielle')
assert.equal(naturalCategory(30), 'succes_exceptionnel_potentiel')
assert.throws(()=>naturalCategory(31), RangeError)

// Contrôle indépendant : énumération des 7776 quintuplets, comparée à la convolution.
const brute = new Map()
for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)for(let c=1;c<=6;c++)
for(let d=1;d<=6;d++)for(let e=1;e<=6;e++){
  const natural=a+b+c+d+e
  brute.set(natural,(brute.get(natural)??0)+1)
}
for(let sum=5;sum<=30;sum++)assert.equal(sumOccurrences(sum),brute.get(sum))

for(let target=15;target<=50;target++)for(let bonus=-4;bonus<=24;bonus++) {
  let expected=0
  for(let natural=5;natural<=30;natural++){
    if(natural>7&&natural+bonus>=target)expected+=brute.get(natural)
  }
  assert.equal(countSuccessfulRolls(target,bonus),expected)
  assert.equal(probabilitySuccess(target,bonus),expected/7776)
}
assert.equal(countSuccessfulRolls(21,3),3888)
assert.equal(countSuccessfulRolls(30,12),3888)
assert.equal(countSuccessfulRolls(30,24),7755,
  'Les naturels 6 et 7 échouent aussi : 99,7299 %, PAS 99,9871 %')
assert.equal(countSuccessfulRolls(21,24),7755)
assert.equal(countSuccessfulRolls(40,16),457)
assert.throws(()=>probabilitySuccess(NaN,0),TypeError)

// Le futur serveur peut injecter un générateur déterministe, sans Math.random interne.
const values=[0,.2,.4,.6,.8]
assert.deepEqual(rollFiveDice(()=>values.shift()),[1,2,3,4,5])
assert.throws(()=>rollFiveDice(()=>1), RangeError)

// Banc d'alerte, SANS changement de combat : niveau 25 contre niveau 25.
const elite={
  level:25, stats:{physique:12,agilite:12,esprit:12,presence:12},
  masteries:{lames:12,haches:0,arcs:0,runes:0,magie:0,negociation:0},
  resistanceBonus:{physique:0,magie:0,mental:0},
  protection:{physique:0,magie:0,mental:0},
  equipmentGrades:{physique:5,magie:0,mental:0},
}
const defense=resistanceScore(elite,'physique')
const armor=effectiveProtection(elite,'physique')
assert.equal(defense,40)
assert.equal(armor,85)
const hit=resolveOpposition({natural:24,total:40,difficulty:21,resistance:defense,
  damageBase:6,mastery:12,level:25,protection:armor,mode:'melee'})
assert.equal(hit.success,true)
assert.equal(hit.grossDamage,86)
assert.equal(hit.damage,1)
assert.equal(baseHealth(25),306)
// Le bonus +16 (+12 caractéristique, +2 spécialité, +2 situation) est un
// maximum normal expérimental ; 306 touches de 1 PV demandent > 5000 jets en moyenne.
const meanRounds=(baseHealth(25)/hit.damage)/probabilitySuccess(defense,16)
assert(meanRounds>5000, 'Alerte : duel lourd n25 prolongé, à ne pas officialiser')
console.log('Audit exact 5d6 : 7776 issues, échecs 5–7, 1044 cas seuil/bonus et duel n25 vérifiés.')
