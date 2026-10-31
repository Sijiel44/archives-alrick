import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {transform} from 'esbuild'
const original=await readFile('quartz/components/scripts/atelier5d6-origins.ts','utf8')
const output=await transform(original,{loader:'ts',format:'esm',target:'es2022'})
const mod=await import('data:text/javascript;base64,'+Buffer.from(output.code).toString('base64'))
const {ORIGIN_STEPS,ORIGIN_MASTERIES,AFFINITY_DOMAINS,buildOrigin,
  EDUCATION_PATHS,LITERACY_LEVELS,trainingAdjustedMasteries,buildEducationProfile,
  affinityRankLimit,affinityImpactBonus,divinePowerMinimumLevel}=mod
assert.equal(ORIGIN_STEPS.length,4)
assert.equal(new Set(AFFINITY_DOMAINS.map(a=>a[0])).size,AFFINITY_DOMAINS.length)
assert.equal(new Set(ORIGIN_MASTERIES).size,ORIGIN_MASTERIES.length)
assert.throws(()=>buildOrigin(['marchands']),/Quatre périodes/)
assert.throws(()=>buildOrigin(['inconnu','lettres','voyage','liberte']),/Choix/)
let combinations=0
for(const family of ORIGIN_STEPS[0].options)
for(const education of ORIGIN_STEPS[1].options)
for(const challenge of ORIGIN_STEPS[2].options)
for(const vocation of ORIGIN_STEPS[3].options){
 const origin=buildOrigin([family.id,education.id,challenge.id,vocation.id])
 combinations++
 assert.equal(origin.level,5)
 assert.equal(origin.pvMax,36)
 assert.equal(origin.lifeSteps.length,4)
 assert(origin.summary.includes(family.background))
 assert.equal(Object.values(origin.stats).reduce((a,b)=>a+b,0),36)
 assert(Object.values(origin.masteries).every(x=>Number.isInteger(x)&&x>=0&&x<=12))
 assert(Object.values(origin.masteries).reduce((a,b)=>a+b,0),8)
 assert(Object.values(origin.stats).every(x=>x>=1&&x<=12))
 assert([0,36].includes(origin.manaMax))
}
const expected=ORIGIN_STEPS.reduce((n,s)=>n*s.options.length,1)
assert.equal(combinations,expected)
assert(combinations>10000,"La nouvelle histoire doit proposer plus de 10 000 parcours")
assert.equal(EDUCATION_PATHS.length,8)
assert.equal(LITERACY_LEVELS.length,4)
for(const education of EDUCATION_PATHS){
  for(const literacy of LITERACY_LEVELS){
    const a=buildEducationProfile(
      buildOrigin(['marchands','ateliers','voyage','commerce']),education.id,literacy.id)
    assert.equal(a.literacy,literacy.id)
    assert.equal(a.education,education.id)
    assert.equal(Object.values(a.masteries).reduce((x,y)=>x+y,0),8,
      "L'éducation réoriente les maîtrises, sans crédits gratuits")
    assert.equal(Object.values(a.stats).reduce((x,y)=>x+y,0),36,
      "La lecture n'affecte pas l'intelligence")
  }
}
const selfTaught=buildEducationProfile(buildOrigin(['marins','navigation','tempete','mer']),
  'aucune','non_lecteur')
const scholarly=buildEducationProfile(buildOrigin(['marins','navigation','tempete','mer']),
  'academie','erudit')
assert.deepEqual(selfTaught.stats,scholarly.stats,
  "Un marin sans école n'est pas intellectuellement inférieur")
assert.match(selfTaught.summary,/Ne lit pas encore/)
assert.match(scholarly.summary,/Lecture érudite/)
assert.throws(()=>buildEducationProfile(buildOrigin(['artistes','musique','representation','art']),
  'nulle','lecture'),/Éducation/)

const merchant=buildOrigin(['marchands','ateliers','responsabilite','commerce'])
const warrior=buildOrigin(['guerriers','armes','conflit','protection'])
const noble=buildOrigin(['nobles','lettres','responsabilite','responsable'])
assert(merchant.masteries.commerce>warrior.masteries.commerce)
assert(warrior.masteries.lames>merchant.masteries.lames)
assert(noble.masteries.histoire>warrior.masteries.histoire)
assert(noble.masteries.intendance>warrior.masteries.intendance)
assert.equal(buildOrigin(['artisans','arcane','decouverte','magie']).manaMax,36)
assert.equal(affinityRankLimit(1),1)
assert.equal(affinityRankLimit(5),1)
assert.equal(affinityRankLimit(9),2)
assert.equal(affinityRankLimit(13),3)
assert.equal(affinityRankLimit(17),4)
assert.equal(affinityRankLimit(21),5)
assert.equal(affinityRankLimit(25),5)
assert.equal(affinityImpactBonus(3),6)
assert.equal(affinityImpactBonus(5),10)
assert.equal(divinePowerMinimumLevel('heroique'),5)
assert.equal(divinePowerMinimumLevel('transcendant'),17)
assert.equal(divinePowerMinimumLevel('divin'),21)
console.log('Parcours de vie : '+combinations+' origines niveau 5, 8 éducations et 4 littératies vérifiées ; aucune pénalité automatique pour l’illettrisme.')
