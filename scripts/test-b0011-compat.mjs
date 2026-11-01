import assert from "node:assert/strict"
import {build} from "esbuild"

// B-001.1 : vérifier les contrats existants ; aucune formule de jeu dupliquée.
async function load(file){
  const result=await build({entryPoints:[file],bundle:true,platform:"node",format:"esm",
    target:"es2022",write:false,logLevel:"silent"})
  return import("data:text/javascript;base64,"+Buffer.from(result.outputFiles[0].text).toString("base64"))
}
const [workshop,m05,m03,generator]=await Promise.all([
  load("quartz/components/scripts/atelier5d6-bestiary-workshop.ts"),
  load("quartz/components/scripts/atelier5d6-m05-sheet-view.ts"),
  load("quartz/components/scripts/atelier5d6-combat-m03.ts"),
  load("quartz/components/scripts/atelier5d6-bestiary.ts")
])
const levels=[5,10,15,20,25]
const archs=["faune","predateur","gardien","mystique","colosse"]
const profiles=["offensif","defensif","polyvalent"]
const groups=[1,2,4]
let checks=0
const ok=(value,message)=>{assert.ok(value,message);checks++}
const eq=(a,b,message)=>{assert.deepEqual(a,b,message);checks++}
const card=workshop.createBestiaryCard(15,"colosse")
eq(card.schema,"alrick.bestiary.v1","schéma Bestiaire natif")
eq(card.ruleset,"m03","règles Bestiaire")
const exported=workshop.exportBestiaryForAtelier(card)
eq(exported.schema,"alrick.sheets.v3","enveloppe Atelier")
eq(exported.sheets[0].schema,"alrick.sheet.v3","feuille Atelier")
eq(exported.sheets[0].ruleset,"m03-bestiary","transfert sans budget M02")
eq(exported.sheets[0].bestiarySource,card,"instantané source préservé")
for(const n of levels)for(const archetype of archs){
  const c=workshop.createBestiaryCard(n,archetype)
  const initial=generator.generateCreatureProfileM03(n,archetype)
  eq(c.stats,initial.stats,"génération M03 "+n+"/"+archetype)
  eq(c.pvMax,initial.pvMax,"PV générés "+n+"/"+archetype)
  eq(c.resistanceBonus.physique,initial.resistancePhysical,"bonus résistance M03")
  eq(c.protection.physique,0,"aucun transfert vers protection")
  const derived=m05.deriveM05Sheet(c)
  eq(derived.defenses[0].threshold,m03.resistanceScoreM03(workshop.toDefense(c),"physique"),"seuil M03")
  eq(derived.defenses[0].absorption,m03.effectiveProtectionM03(workshop.toDefense(c),"physique"),"absorption M03")
  eq(workshop.validateBestiaryCard(JSON.parse(JSON.stringify(c))),c,"aller-retour natif")
  for(const p of profiles)for(const size of groups){
    const m=workshop.evaluateMatchup(c,n,p,n>=20?5:2,size)
    eq(m.opponentCount,size,"effectif groupe")
    ok(m.opponent.hits>=0&&m.opponent.hits<=1,"probabilité de toucher bornée")
    ok(m.opponent.woundChance>=0&&m.opponent.woundChance<=1,"probabilité de blesser bornée")
    ok(m.roundsEstimate===null||m.roundsEstimate>=0,"durée théorique contrôlée")
    eq(m,workshop.evaluateMatchup(c,n,p,n>=20?5:2,size),"déterminisme")
  }
}
const a=workshop.createBestiaryCard(10,"faune")
const resistanceBefore=m03.resistanceScoreM03(workshop.toDefense(a),"physique")
const protectionBefore=m03.effectiveProtectionM03(workshop.toDefense(a),"physique")
a.resistanceBonus.physique+=1
ok(m03.resistanceScoreM03(workshop.toDefense(a),"physique")>resistanceBefore,"bonus résistance modifie le seuil")
eq(m03.effectiveProtectionM03(workshop.toDefense(a),"physique"),protectionBefore,"bonus résistance ne modifie pas l'absorption")
const defenseAfter=m03.resistanceScoreM03(workshop.toDefense(a),"physique")
a.protection.physique=12
eq(m03.resistanceScoreM03(workshop.toDefense(a),"physique"),defenseAfter,"protection ne change pas le seuil")
ok(m03.effectiveProtectionM03(workshop.toDefense(a),"physique")>protectionBefore,"protection change l'absorption")
const d=workshop.createBestiaryCard(5,"faune","pnj","soutien")
d.documentaryLink={id:"DRG-01",type:"individu",source:"Référence de test",sourceVersion:"v0",
  canonStatut:null,etatEditorial:null,visibilite:null,publish:null,spoilers:null,unlisted:null,publicPath:null}
d.nonCombatApproaches=["eviter","secourir","discuter"]
const reference=workshop.referenceOpponent(5,"polyvalent",0)
const mathBefore=workshop.attackMath(d,reference)
d.notes="Aucune attaque planifiée ; négociation possible."
d.abilities=[{name:"Souhait de paix",description:"Narration seulement",limitations:"aucun effet moteur",approvedByGM:true}]
eq(workshop.attackMath(d,reference),mathBefore,"option pacifique et capacité narrative ne changent pas le combat")
const validated=workshop.validateBestiaryCard(JSON.parse(JSON.stringify(d)))
eq(validated.nonCombatApproaches,d.nonCombatApproaches,"extensions narratives conservées")
eq(m05.readDocumentaryLink(validated).id,"DRG-01","lien documentaire déclaratif")
eq(m05.canOfferDocumentaryLink(m05.readDocumentaryLink(validated)),false,"pas de lien public automatique")
const transfer=workshop.exportBestiaryForAtelier(validated)
eq(transfer.sheets[0].bestiarySource.documentaryLink.id,"DRG-01","lien conservé dans bestiarySource")
eq(transfer.sheets[0].resistanceBonus,validated.resistanceBonus,"seuil exporté sans conversion")
eq(transfer.sheets[0].protection,validated.protection,"absorption exportée séparément")
assert.throws(()=>workshop.validateBestiaryCard({...validated,schema:"alrick.sheet.v2"}))
checks++
console.log("B-001.1 : "+checks+" assertions réussies ; niveaux "+levels.join("/")+
  ", cinq archétypes, groupes 1/2/4. Aucun playtest humain revendiqué.")
