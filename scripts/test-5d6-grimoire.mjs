import assert from "node:assert/strict"
import {build} from "esbuild"

const bundled=await build({entryPoints:["quartz/components/scripts/atelier5d6-grimoire.ts"],
  bundle:true,write:false,platform:"node",format:"esm",target:"es2022"})
const m=await import("data:text/javascript;base64,"+Buffer.from(bundled.outputFiles[0].text).toString("base64"))
const profile=(overrides={})=>({
  id:"personne-test",name:"Mage de test",level:5,mana:20,manaMax:20,
  stats:{physique:3,agilite:3,esprit:6,presence:3},masteries:{magie:2,runes:0},
  affinities:[],protection:{physique:0,magie:0,mental:0},
  resistanceBonus:{physique:0,magie:0,mental:0},equipmentGrades:{physique:0,magie:0,mental:0},
  grimoire:m.newGrimoire(),...overrides
})
assert.equal(m.DEMO_SPELLS.length,5)
assert(m.DEMO_SPELLS.every(sp=>sp.status==="demo"&&sp.source.includes("NON CANONIQUE")))
const old=m.normalizeGrimoire(undefined)
assert.equal(old.schema,"alrick.grimoire.v1")
assert.equal(old.known.length,0)
assert.equal(old.circlesAttested.length,0,"Le niveau ne donne aucun Cercle")
const s=profile()
const light=m.DEMO_SPELLS[0]
assert(m.eligibility(s,light).some(x=>x.includes("non appris")))
s.grimoire.known.push({id:light.id,approvedBy:"MJ test",learnedAt:"2026-10-31",prepared:false})
assert(m.eligibility(s,light).some(x=>x.includes("Cercle")))
s.grimoire.circlesAttested.push(1)
assert.equal(m.eligibility(s,light).length,0)
const before=s.mana
const success=m.resolveSpellCast(s,light,null,"Le campement",[4,4,4,4,4])
assert.equal(success.ok,true)
assert.equal(success.success,true)
assert.equal(s.mana,before,"Le calcul pur ne dépense pas le mana")
m.activateSpell(s.grimoire,light,"Le campement")
assert.equal(s.grimoire.effects.length,1)
m.progressEffects(s,"scene")
assert.equal(s.grimoire.effects.length,0)
const shield=m.DEMO_SPELLS.find(sp=>sp.id==="demo-voile-protecteur")
assert(shield)
s.grimoire.known.push({id:shield.id,approvedBy:"MJ test",learnedAt:"2026-10-31",prepared:false})
s.grimoire.circlesAttested.push(2)
assert(m.eligibility(s,shield).some(x=>x.includes("Maîtrise")||x.includes("Préparation")))
s.masteries.magie=3
assert(m.eligibility(s,shield).some(x=>x.includes("Préparation")))
s.grimoire.known.find(x=>x.id===shield.id).prepared=true
assert.equal(m.eligibility(s,shield).length,0)
const bolt=m.DEMO_SPELLS.find(sp=>sp.id==="demo-etincelle")
assert(bolt)
s.grimoire.known.push({id:bolt.id,approvedBy:"MJ test",learnedAt:"2026-10-31",prepared:false})
const enemy=profile({id:"adversaire",name:"Défenseur",level:25,stats:{physique:12,agilite:12,esprit:12,presence:12}})
const glance=m.resolveSpellCast(s,bolt,enemy,"Cible visible",[6,6,6,6,6])
assert.equal(glance.ok,true)
assert.equal(glance.glancing,true,"Critique naturel : toucher sans franchir la résistance")
assert.equal(glance.damage,0,"Une défense de niveau 25 absorbe l'attaque")
assert.equal(glance.success,false)
const critical=m.resolveSpellCast(s,bolt,null,"Cible",[1,1,1,1,1])
assert.equal(critical.success,false,"Un échec critique ne réussit pas par un bonus élevé")
s.mana=0
assert(m.eligibility(s,bolt).some(x=>x.includes("Mana")))
s.mana=10
m.recordSpellEvent(s.grimoire,{type:"lancer",spellId:bolt.id,target:"Cible",manaDelta:-4,dice:[1,1,1,1,1],total:11,threshold:21,result:"Échec"})
const backup=m.normalizeGrimoire(JSON.parse(JSON.stringify(s.grimoire)))
assert.equal(backup.known.length,3)
assert.equal(backup.history.length,1)
assert.equal(backup.history[0].dice.length,5)
assert.equal(backup.known.filter(k=>k.id===bolt.id).length,1)
console.log("Grimoire v1 : accès, Cercles, préparation, mana, critiques, effets et migration JSON OK.")
