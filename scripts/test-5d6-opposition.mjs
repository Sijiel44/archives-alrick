import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {transform} from 'esbuild'

async function loadTs(file){
  const raw=await readFile(file,'utf8')
  const compiled=await transform(raw,{loader:'ts',format:'esm',target:'es2022'})
  return import('data:text/javascript;base64,'+Buffer.from(compiled.code).toString('base64'))
}
const {resistanceScore,impactBonus,attackMastery,resolveOpposition,
  innateProtection,equipmentProtection,effectiveProtection}=await loadTs('quartz/components/scripts/atelier5d6-opposition.ts')
const {generateCreatureProfile,baseHealth}=await loadTs('quartz/components/scripts/atelier5d6-bestiary.ts')

const profile=(overrides={})=>({
  stats:{physique:3,agilite:3,esprit:3,presence:3},level:1,
  masteries:{lames:0,haches:0,arcs:0,runes:0,soins:0,negociation:0,survie:0,artisanat:0,magie:0},
  resistanceBonus:{physique:0,magie:0,mental:0},
  protection:{physique:0,magie:0,mental:0},
  equipmentGrades:{physique:0,magie:0,mental:0},...overrides
})
assert.equal(resistanceScore(profile(),'physique'),15)
assert.equal(resistanceScore(profile(),'magie'),15)
assert.equal(resistanceScore(profile({level:5,stats:{physique:8,agilite:4,esprit:6,presence:5},
  masteries:{lames:6}}),'physique'),21)
assert.equal(resistanceScore(profile({level:25,stats:{physique:12,agilite:12,esprit:12,presence:12},
  masteries:{lames:12},equipmentGrades:{physique:5,magie:0,mental:0}}),'physique'),40)
assert.equal(innateProtection(1,'physique'),0)
assert.equal(innateProtection(5,'physique'),2)
assert.equal(innateProtection(20,'physique'),14)
assert.equal(innateProtection(21,'physique'),20)
assert.equal(innateProtection(24,'physique'),44)
assert.equal(innateProtection(25,'physique'),55)
assert.equal(innateProtection(25,'magie'),38)
assert.equal(equipmentProtection(0,'physique'),0)
assert.equal(equipmentProtection(5,'physique'),30)
assert.equal(equipmentProtection(5,'magie'),21)
assert.equal(effectiveProtection(profile({level:25,equipmentGrades:{physique:5,magie:0,mental:0}}),'physique'),85)
assert(effectiveProtection(profile({level:25}),'physique')>effectiveProtection(profile({level:5}),'physique'))
assert.equal(impactBonus(1),0)
assert.equal(impactBonus(5),3)
assert.equal(impactBonus(12),7)
assert.equal(impactBonus(20),21)
assert.equal(impactBonus(21),29)
assert.equal(impactBonus(24),56)
assert.equal(impactBonus(25),68)
assert.equal(attackMastery({lames:7,haches:9},'melee'),9)

const base={natural:19,total:26,difficulty:21,resistance:24,damageBase:6,mastery:8,
  level:12,protection:5,mode:'melee'}
const hit=resolveOpposition(base)
assert.equal(hit.success,true)
assert.equal(hit.contact,true)
assert.equal(hit.glancing,false)
assert.equal(hit.threshold,24)
assert.equal(hit.grossDamage,21)
assert.equal(hit.absorbed,5)
assert.equal(hit.damage,16)
assert.equal(hit.reaction,'aucune')
assert.equal(resolveOpposition({...base,protection:100}).damage,0,'Une armure peut tout absorber')
const miss=resolveOpposition({...base,total:19})
assert.equal(miss.contact,false)
assert.equal(miss.damage,0)
assert.equal(miss.reaction,'riposte_possible')
assert.equal(resolveOpposition({...base,total:22}).reaction,'defense')
const criticalFail=resolveOpposition({...base,natural:5,total:120})
assert.equal(criticalFail.success,false)
assert.equal(criticalFail.contact,false)
assert.equal(criticalFail.reaction,'aucune')

const elite=profile({level:25,stats:{physique:12,agilite:12,esprit:12,presence:12},masteries:{lames:12}})
const resElite=resistanceScore(elite,'physique')
const absorptionElite=effectiveProtection(elite,'physique')
const lvl1Perfect=resolveOpposition({natural:30,total:33,difficulty:21,resistance:resElite,
  damageBase:6,mastery:0,level:1,protection:absorptionElite,mode:'melee'})
assert.equal(resElite,35)
assert.equal(lvl1Perfect.success,false,'Un niveau 1 ne pénètre pas automatiquement la résistance 25')
assert.equal(lvl1Perfect.contact,true,'Un jet naturel exceptionnel peut toucher une élite')
assert.equal(lvl1Perfect.glancing,true)
assert.equal(lvl1Perfect.damage,0,'Contact contre une élite ne signifie pas blessure')
assert.equal(lvl1Perfect.reaction,'aucune','Ne pas sanctionner le contact héroïque par une riposte gratuite')
const lvl1Heroic=resolveOpposition({...base,natural:27,total:30,resistance:50,level:1,mastery:0,protection:0})
assert.equal(lvl1Heroic.contact,true)
assert.equal(lvl1Heroic.glancing,true)
assert.equal(lvl1Heroic.damage,0,'27 naturel permet contact sans dégâts')
const lvl1Exceptional=resolveOpposition({...base,natural:30,total:33,resistance:50,level:1,mastery:0,protection:0})
assert.equal(lvl1Exceptional.damage,1,'Un 30 naturel peut faire un unique PV si la protection cède')
const mental=resolveOpposition({...base,natural:30,total:33,resistance:50,mode:'mental'})
assert.equal(mental.contact,false,'Pas de bypass des protections mentales')
assert.equal(mental.damage,0)
const eliteAttack=resolveOpposition({...base,natural:22,total:46,level:25,mastery:12,protection:0})
assert.equal(eliteAttack.grossDamage,86)
assert(eliteAttack.damage>hit.damage)

assert.equal(baseHealth(1),12)
assert.equal(baseHealth(5),36)
assert.equal(baseHealth(24),270)
assert.equal(baseHealth(25),306)
for(const arch of ['faune','predateur','gardien','mystique','colosse']){
  for(let level=1;level<=25;level++){
    const monster=generateCreatureProfile(level,arch)
    assert.equal(monster.level,level)
    assert(monster.pvMax>0)
    assert(Object.values(monster.stats).every(x=>x>=1&&x<=12))
    assert(monster.equipmentPhysical>=0&&monster.equipmentPhysical<=5)
    if(level>1)assert(monster.pvMax>=generateCreatureProfile(level-1,arch).pvMax)
  }
}
assert.equal(generateCreatureProfile(25,'mystique').manaMax,306)
assert.equal(generateCreatureProfile(25,'gardien').equipmentPhysical,5)
assert(generateCreatureProfile(25,'colosse').pvMax>generateCreatureProfile(25,'faune').pvMax)

let trials=0,contacts=0,wounds=0
for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)for(let c=1;c<=6;c++)
for(let d=1;d<=6;d++)for(let e=1;e<=6;e++){
  const natural=a+b+c+d+e
  const outcome=resolveOpposition({natural,total:natural+3,difficulty:21,resistance:resElite,
    damageBase:6,mastery:0,level:1,protection:absorptionElite,mode:'melee'})
  trials++
  if(outcome.contact)contacts++
  if(outcome.damage>0)wounds++
}
assert.equal(trials,7776)
assert(contacts>0&&contacts<100,'Une élite peut être effleurée mais le contact reste rare')
assert.equal(wounds,0,'Sans équipement ni talents, le niveau 1 ne blesse pas un niveau 25 naturellement robuste')
console.log('Opposition : 7776 issues testées ; contact héroïque, absorption naturelle, cinq grades et bestiaire 1–25 validés.')
