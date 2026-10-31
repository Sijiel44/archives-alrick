import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {transform} from 'esbuild'

// Teste les mêmes fonctions TS qu'utilise le navigateur, sans copier leurs formules.
const raw=await readFile('quartz/components/scripts/atelier5d6-opposition.ts','utf8')
const compiled=await transform(raw,{loader:'ts',format:'esm',target:'es2022'})
const moduleUrl='data:text/javascript;base64,'+Buffer.from(compiled.code).toString('base64')
const {resistanceScore,impactBonus,attackMastery,resolveOpposition}=await import(moduleUrl)

const profile=(overrides={})=>({
  stats:{physique:3,agilite:3,esprit:3,presence:3},
  level:1,
  masteries:{lames:0,haches:0,arcs:0,runes:0,soins:0,negociation:0,survie:0,artisanat:0,magie:0},
  resistanceBonus:{physique:0,magie:0,mental:0},
  protection:{physique:0,magie:0,mental:0},
  ...overrides
})
assert.equal(resistanceScore(profile(),'physique'),15)
assert.equal(resistanceScore(profile(),'magie'),15)
assert.equal(resistanceScore(profile(),'mental'),15)
assert.equal(resistanceScore(profile({
  level:5,stats:{physique:8,agilite:4,esprit:6,presence:5},
  masteries:{lames:6,haches:0,arcs:0,runes:0,soins:0,negociation:0,survie:0,artisanat:0,magie:0}
}),'physique'),21)
assert.equal(resistanceScore(profile({
  level:24,stats:{physique:12,agilite:12,esprit:12,presence:12},
  masteries:{lames:12,haches:0,arcs:0,runes:0,soins:0,negociation:0,survie:0,artisanat:0,magie:0},
  resistanceBonus:{physique:8,magie:0,mental:0}
}),'physique'),44)
assert.equal(impactBonus(1),0)
assert.equal(impactBonus(5),3)
assert.equal(impactBonus(12),7)
assert.equal(impactBonus(20),21)
assert.equal(impactBonus(21),29)
assert.equal(impactBonus(24),56)
assert.equal(attackMastery({lames:7,haches:9},'melee'),9)
const resolution={natural:19,total:26,difficulty:21,resistance:24,damageBase:6,
  mastery:8,level:12,protection:5,mode:'melee'}
const hit=resolveOpposition(resolution)
assert.equal(hit.success,true)
assert.equal(hit.threshold,24)
assert.equal(hit.grossDamage,21)
assert.equal(hit.absorbed,5)
assert.equal(hit.damage,16)
assert.equal(hit.reaction,'aucune')
const blocked=resolveOpposition({...resolution,protection:50})
assert.equal(blocked.success,true)
assert.equal(blocked.damage,0)
const failed=resolveOpposition({...resolution,total:19})
assert.equal(failed.success,false)
assert.equal(failed.damage,0)
assert.equal(failed.reaction,'riposte_possible')
const close=resolveOpposition({...resolution,total:22})
assert.equal(close.reaction,'defense')
const naturalFive=resolveOpposition({...resolution,natural:5,total:120})
assert.equal(naturalFive.success,false)
assert.equal(naturalFive.damage,0)
assert.equal(naturalFive.reaction,'aucune')
const impossibleCrit=resolveOpposition({...resolution,natural:30,total:41,resistance:45})
assert.equal(impossibleCrit.success,false,'Critique naturel ne traverse pas un seuil de résistance')
const mental=resolveOpposition({...resolution,natural:22,total:28,mode:'mental'})
assert.equal(mental.success,true)
assert.equal(mental.damage,0,'Le social ne retire aucun PV')
const divine=resolveOpposition({...resolution,natural:22,total:42,level:24,mastery:12,protection:0})
assert.equal(divine.grossDamage,74)
assert(divine.damage>hit.damage,'Un héros niveau 24 doit infliger nettement plus de dégâts')
let trials=0,hits=0
for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)for(let c=1;c<=6;c++)
  for(let d=1;d<=6;d++)for(let e=1;e<=6;e++){
    const natural=a+b+c+d+e
    if(resolveOpposition({...resolution,natural,total:natural+8,resistance:30}).success)hits++
    trials++
  }
assert.equal(trials,7776)
assert(hits>0&&hits<trials,'Une résistance élevée doit rester difficile sans être automatiquement impossible')
console.log('Opposition 5d6 : résistances, dommages, armure, riposte facultative et 7776 issues validés.')
