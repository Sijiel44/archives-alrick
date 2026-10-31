import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

// Banc d'essai reproductible : énumère les 6^5 combinaisons de dés (aucune simulation aléatoire).
const counts=new Map()
for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)for(let c=1;c<=6;c++)
  for(let d=1;d<=6;d++)for(let e=1;e<=6;e++){
    const n=a+b+c+d+e;counts.set(n,(counts.get(n)||0)+1)
  }
assert.equal(Array.from(counts.values()).reduce((s,x)=>s+x,0),7776)
assert.equal(counts.get(5),1)
assert.equal(counts.get(30),1)
const chance=(target,bonus)=>{
  let successes=0
  for(const [natural,count] of counts){
    // Le cinq naturel demeure un échec exceptionnel, quels que soient les bonus.
    if(natural!==5 && natural+bonus>=target)successes+=count
  }
  return successes/7776
}
const almost=(value,expected)=>assert(Math.abs(value-expected)<0.0001,`Chance attendue ${expected}, obtenue ${value}`)
almost(chance(21,3),.5)
almost(chance(21,1),.30516975308641975)
almost(chance(30,12),.5)
almost(chance(30,24),7775/7776)
assert(chance(27,6)<chance(27,12))
assert(chance(36,12)<.1)
assert(chance(42,14)<.01)
const experienceRequired=level=>level<=1?0:5*(level-1)**3
assert.equal(experienceRequired(2),5)
assert.equal(experienceRequired(3),40)
assert.equal(experienceRequired(5),320)
assert.equal(experienceRequired(20),34295)
assert.equal(experienceRequired(24),60835)
assert.equal(experienceRequired(25),69120)
assert(experienceRequired(24)-experienceRequired(23)>experienceRequired(5)-experienceRequired(4))
const statCredits=level=>12+6*(level-1)
const resourceGain=level=>level>=25?36:level>=21?24:level>=13?12:6
const maxResource=level=>12+Array.from({length:level-1},(_,i)=>resourceGain(i+2)).reduce((a,b)=>a+b,0)
assert.equal(statCredits(1),12)
assert.equal(statCredits(5),36)
assert.equal(statCredits(7),48)
assert.equal(statCredits(24),150)
assert.equal(statCredits(25),156)
assert.equal(maxResource(5),36)
assert.equal(maxResource(20),174)
assert.equal(maxResource(24),270)
assert.equal(maxResource(25),306)
assert.equal(Math.max(0,statCredits(24)-48),102,'Plafond : 102 crédits de réserve au niveau 24 si tous les scores valent 12')
const missions=JSON.parse(await readFile('quartz/static/atelier5d6-missions.json','utf8'))
assert.equal(missions.schema,'alrick.missions.v1')
assert.equal(missions.publicOnly,true)
assert.equal(missions.missions.length,24)
assert.equal(new Set(missions.missions.map(x=>x.id)).size,24)
for(let level=1;level<=12;level++)assert.equal(missions.missions.filter(x=>x.level===level).length,2)
for(const item of missions.missions){
  assert.equal(item.statut,'proposition_non_jouee')
  assert(Object.keys(item).every(key=>['id','level','title','category','brief','reward','certifications','statut'].includes(key)), 'Champ inattendu dans un contrat public')
  assert(typeof item.brief==='string' && item.brief.length<550)
  assert(Array.isArray(item.certifications) && item.certifications.every(x=>typeof x==='string'))
}
const script=await readFile('quartz/components/scripts/atelier5d6.inline.ts','utf8')
assert(script.includes('const STORAGE = "archives-alrick-atelier-5d6-v1"'),'Clé de sauvegarde historique modifiée')
assert(script.includes('const maxStatCredits = (level:number) => 12+6*(level-1)'),'Règle des six crédits absente')
assert(script.includes('alrick.campaign.v1'),'Sauvegarde de campagne absente')
assert(!script.includes('const total=natural+s.stats[stat]+skill+situation+'),'Ne pas introduire de bonus numérique additionnel non équilibré')
console.log('Playtest exact 5d6 : 7776 combinaisons, 24 niveaux, 24 contrats publics et sauvegardes contrôlés.')
