import assert from "node:assert/strict"
import {build} from "esbuild"
import {readFileSync} from "node:fs"

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
assert.equal(m.DEMO_SPELLS.length,6)
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
const enemy=profile({id:"adversaire",name:"Défenseur",level:25,stats:{physique:12,agilite:12,esprit:12,presence:12},equipmentGrades:{physique:0,magie:5,mental:0}})
const glance=m.resolveSpellCast(s,bolt,enemy,"Cible visible",[6,6,6,6,6])
assert.equal(glance.ok,true)
assert.equal(glance.success,true,"La résistance M03 remplace l’ancienne formule")
assert(glance.damage>=0,"L’absorption suit la protection M03")
const critical=m.resolveSpellCast(s,bolt,null,"Cible",[1,1,1,1,1])
assert.equal(critical.success,false,"Un échec critique ne réussit pas par un bonus élevé")
s.mana=0
assert(m.eligibility(s,bolt).some(x=>x.includes("Mana")))
s.mana=10
m.recordSpellEvent(s.grimoire,{type:"lancer",spellId:bolt.id,target:"Cible",manaDelta:-4,dice:[1,1,1,1,1],total:11,threshold:21,result:"Échec"})

const high=m.DEMO_SPELLS.find(sp=>sp.id==="demo-onde-murailles")
assert(high&&high.circle===8)
assert(!s.grimoire.known.some(x=>x.id===high.id),"Aucun apprentissage du Cercle VIII n'est accordé")
assert(!s.grimoire.circlesAttested.includes(8),"Le Premier Cercle n'attribue pas le Huitième")
s.inventory=[{id:"obj-test",name:"Sceptre d'essai préparé"}]
const matrix={id:"matrice-test",itemId:"obj-test",spellId:high.id,architectureCircle:8,
  activationCircle:1,energySource:"matrix",charges:2,approvedBy:"MJ local",
  source:"Ingénieur fictif — prototype de test"}
s.grimoire.matrices.push(matrix)
s.mana=0
assert.deepEqual(m.eligibility(s,high,matrix),[],
  "Un Premier Cercle peut activer une matrice VIII chargée et approuvée")
assert(m.eligibility(s,high).some(x=>x.includes("non appris")),
  "Le même personnage ne peut pas lancer la conception autonome")
const powerful=m.resolveSpellCast(s,high,null,"Le rempart d'essai",[6,6,6,6,6],matrix)
assert.equal(powerful.success,true)
assert(powerful.damage>10,"L'intensité préparée dépend de l'architecture et non du niveau du porteur")
assert.equal(s.mana,0,"Une matrice chargée n'utilise pas le mana du porteur")
matrix.charges=0
assert(m.eligibility(s,high,matrix).some(x=>x.includes("épuisée")))
matrix.charges=2
const originalInventory=s.inventory
s.inventory=[]
assert(m.eligibility(s,high,matrix).some(x=>x.includes("absent")))
s.inventory=originalInventory
s.grimoire.circlesAttested=s.grimoire.circlesAttested.filter(x=>x!==1)
assert(m.eligibility(s,high,matrix).some(x=>x.includes("activation")))
s.grimoire.circlesAttested.push(1)
const ix={...high,id:"local-essai-divin",circle:9,status:"campagne",effectLevel:25}
s.grimoire.personalSpells.push(ix)
const ixMatrix={...matrix,id:"matrice-ix",spellId:ix.id,architectureCircle:9,charges:1}
s.grimoire.matrices.push(ixMatrix)
assert(m.eligibility(s,ix,ixMatrix).some(x=>x.includes("divin")),
  "Une matrice IX n'accorde pas la nature divine")
s.grimoire.divineNinthApproved=true
s.grimoire.divineNinthWitness="Validation explicite par MJ de démonstration"
assert.deepEqual(m.eligibility(s,ix,ixMatrix),[],
  "Le IX demande une validation divine spécifique, indépendante du niveau")
const backup=m.normalizeGrimoire(JSON.parse(JSON.stringify(s.grimoire)))
assert.equal(backup.known.length,3)
assert.equal(backup.matrices.length,2)
assert.equal(backup.divineNinthApproved,true)
assert.equal(backup.divineNinthWitness,s.grimoire.divineNinthWitness)
assert.equal(backup.history.length,2)
assert(backup.history.some(e=>e.type==='lancer' && e.dice.length===5))
assert.equal(backup.known.filter(k=>k.id===bolt.id).length,1)
console.log("Grimoire v1 : capacités distinctes, activation C1→architecture C8, IX divin, énergie, oppositions et sauvegardes OK.")

// G-001 : fixtures du référent Tables, sans seconde résolution de dés.
const parity=JSON.parse(readFileSync("scripts/fixtures/5d6-parity-v1.json","utf8"))
const load=async entry=>{
  const out=await build({entryPoints:[entry],bundle:true,write:false,platform:"node",format:"esm",target:"es2022"})
  return import("data:text/javascript;base64,"+Buffer.from(out.outputFiles[0].text).toString("base64"))
}
const [m01,m03]=await Promise.all([load("quartz/components/scripts/atelier5d6-progression.ts"),
  load("quartz/components/scripts/atelier5d6-combat-m03.ts")])
for(const c of parity.cases){
  const caster=profile({level:c.level,mana:999,manaMax:999,
    stats:{physique:3,agilite:3,esprit:c.rawStat,presence:3},masteries:{magie:c.masteryRank}})
  caster.grimoire.circlesAttested=[1]
  caster.grimoire.known=[{id:bolt.id,approvedBy:"MJ",learnedAt:"2026",prepared:false}]
  const sp={...bolt,difficulty:c.threshold,baseImpact:6,resistance:c.kind}
  const actual=m.resolveSpellCast(caster,sp,null,"Exercice",c.dice)
  const expected=m03.resolveCombatM03({natural:c.dice.reduce((a,b)=>a+b,0),rawStat:c.rawStat,
    masteryRank:c.masteryRank,situation:0,level:c.level,difficulty:c.threshold,
    kind:c.kind,mode:c.kind==="mental"?"mental":"magie",feasible:true,baseDamage:6})
  assert.equal(actual.total,expected.total,"Total M03 N"+c.level)
  assert.equal(actual.threshold,expected.threshold,"Seuil M03 N"+c.level)
  assert.equal(actual.success,expected.success,"Succès M03 N"+c.level)
  assert.equal(actual.damage,expected.damage,"Dégâts M03 N"+c.level)
}
const regression=parity.regression
const caster=profile({stats:{physique:3,agilite:3,esprit:regression.rawStat,presence:3},
  masteries:{magie:regression.masteryRank}})
caster.grimoire.circlesAttested=[1]
caster.grimoire.known=[{id:light.id,approvedBy:"MJ",learnedAt:"2026",prepared:false}]
const cast=m.resolveSpellCast(caster,{...light,difficulty:regression.threshold},null,"Essai",regression.dice)
const expected=m01.resolveProgressionAction({natural:20,rawStat:regression.rawStat,
  masteryRank:0,situation:0,threshold:regression.threshold,feasible:true})
assert.equal(cast.total,regression.expectedTotal)
assert.equal(cast.total,expected.total)
assert.equal(cast.success,regression.expectedSuccess)
assert.equal(m.resolveSpellCast(caster,{...light,difficulty:21},null,"Interdit",[6,6,6,6,6],undefined,false).success,false)
const archived=m.normalizeGrimoire({...s.grimoire,pluginCustom:{extra:"à conserver"},
  known:[...s.grimoire.known,{id:"sort-du-futur",approvedBy:"MJ"}],
  personalSpells:[{...ix,extensionTier:"runes-proprietaires"}]})
assert.deepEqual(archived.pluginCustom,{extra:"à conserver"})
assert.equal(archived.personalSpells[0].extensionTier,"runes-proprietaires")
assert(archived.legacyOriginal.known.some(x=>x.id==="sort-du-futur"))
assert(archived.migrationWarnings.some(x=>x.includes("known")))
const provisional={...matrix,id:"matrice-caster",energySource:"caster",charges:1}
s.grimoire.matrices.push(provisional);s.mana=20
assert.deepEqual(m.eligibility(s,high,provisional),[])
assert.equal(provisional.charges,1,"La sémantique énergétique reste en arbitrage")
console.log("G-001 : parité M01/M03, conservation extensions, refus MJ et matrice caster vérifiés.")
