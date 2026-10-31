import assert from "node:assert/strict"
import { build } from "esbuild"

async function load(file){
  const out=await build({entryPoints:[file],bundle:true,platform:"node",format:"esm",
    target:"es2022",write:false,logLevel:"silent"})
  return import("data:text/javascript;base64,"+Buffer.from(out.outputFiles[0].text).toString("base64"))
}
const lab=await load("quartz/components/scripts/atelier5d6-bestiary-workshop.ts")
const m03=await load("quartz/components/scripts/atelier5d6-combat-m03.ts")
const probability=await load("quartz/components/scripts/atelier5d6-probabilities.ts")
let checks=0
const test=(name,fn)=>{fn();checks++;console.log("✓ "+name)}
test("Cinq archétypes, création créature/PNJ à tous les niveaux",()=>{
  for(let level=1;level<=25;level++)for(const arch of lab.ARCHETYPES)for(const kind of ["creature","pnj"]){
    const x=lab.createBestiaryCard(level,arch,kind)
    assert.equal(x.schema,"alrick.bestiary.v1")
    assert.equal(x.ruleset,"m03")
    assert.equal(x.level,level)
    assert.equal(x.kind,kind)
    assert.equal(lab.validateBestiaryCard(x).name,x.name)
    assert.ok(x.pvMax>=1)
    assert.equal(x.status,"brouillon")
  }
})
test("Scores au-delà de 12 autorisés",()=>{
  const c=lab.createBestiaryCard(25,"colosse")
  assert.ok(c.stats.physique>12)
  c.stats.physique=49
  assert.equal(lab.validateBestiaryCard(c).stats.physique,49)
})
test("Rejet strict des imports invalides et des schémas de PJ",()=>{
  const base=lab.createBestiaryCard(5,"faune")
  for(const patch of [{schema:"alrick.sheets.v3"},{ruleset:"legacy"},{baseDamage:13},{penetration:9},
    {stats:{...base.stats,esprit:-2}},{equipmentGrades:{...base.equipmentGrades,physique:6}},
    {protection:{...base.protection,mental:61}},{resistanceBonus:{...base.resistanceBonus,magie:9}},
    {pvMax:-1},{masteries:{lames:-1}},{abilities:[{name:null}]}]){
      assert.throws(()=>lab.validateBestiaryCard({...base,...patch}))
    }
})
test("Roundtrip JSON sans perte des champs de jeu",()=>{
  const c=lab.createBestiaryCard(12,"mystique","pnj","soutien")
  c.name="Archiviste de la brume"
  c.description="Non canonique"
  c.origin="Contreforts"
  c.stats.esprit=32
  c.masteries.magie=19
  c.abilities=[{name:"Soin",description:"Action du MJ",limitations:"1 fois",approvedByGM:true}]
  const copy=lab.validateBestiaryCard(JSON.parse(JSON.stringify(c)))
  assert.deepEqual(copy,c)
})
test("Aucun bonus de capacité narrative activé automatiquement",()=>{
  const c=lab.createBestiaryCard(12,"predateur")
  const d=lab.referenceOpponent(12,"polyvalent",2)
  const first=lab.attackMath(c,d)
  c.abilities=[{name:"Impact divin",description:"Dégâts infinis",limitations:"aucune",approvedByGM:true}]
  assert.deepEqual(lab.attackMath(c,d),first)
})
test("7 776 cas et équivalence du moteur M03",()=>{
  assert.equal(probability.TOTAL_OUTCOMES,7776)
  const a=lab.createBestiaryCard(17,"gardien")
  const b=lab.referenceOpponent(13,"defensif",3)
  const o=lab.attackMath(a,b)
  let successful=0,wounds=0,damage=0
  for(let natural=5;natural<=30;natural++){
    const weight=probability.sumOccurrences(natural)
    const r=m03.resolveCombatM03({natural,rawStat:a.stats.physique,
      masteryRank:a.masteries.lames,level:a.level,situation:0,difficulty:21,
      kind:"physique",mode:"melee",defender:lab.toDefense(b),feasible:true,
      baseDamage:a.baseDamage,penetration:a.penetration})
    successful+=weight*Number(r.success)
    wounds+=weight*Number(r.damage>0)
    damage+=weight*r.damage
  }
  assert.equal(o.hits,successful/7776)
  assert.equal(o.expectedDamage,damage/7776)
  assert.equal(o.woundChance,wounds/7776)
  assert.equal(o.defense,m03.resistanceScoreM03(lab.toDefense(b),"physique"))
})
test("Les attaques avec protection modifiée sont recalculées",()=>{
  const a=lab.referenceOpponent(5,"offensif",1)
  const c=lab.createBestiaryCard(5,"predateur")
  const before=lab.attackMath(a,c)
  c.protection.physique=60
  const after=lab.attackMath(a,c)
  assert.equal(before.hits,after.hits)
  assert.ok(after.expectedDamage<=before.expectedDamage)
  assert.ok(after.protection>before.protection)
})
test("Matchups reproductibles, groupe, blocage, hypothèses explicites",()=>{
  for(const level of [1,5,13,21,25]){
    const c=lab.createBestiaryCard(level,"colosse")
    for(const profile of ["offensif","defensif","polyvalent"]){
      const a=lab.evaluateMatchup(c,level,profile,2,4)
      assert.deepEqual(a,lab.evaluateMatchup(c,level,profile,2,4))
      assert.equal(a.opponentCount,4)
      assert.match(a.assumptions,/7 776/)
      assert.ok(a.creature.hits>=0&&a.creature.hits<=1)
      assert.ok(a.opponent.hits>=0&&a.opponent.hits<=1)
      assert.ok(a.roundsEstimate===null||a.roundsEstimate>=0)
    }
  }
})
console.log("M04 Atelier du Bestiaire : "+checks+" familles de vérifications réussies.")
