/** M05 : contrôles purs non-régression ; aucun playtest humain. */
import assert from "node:assert/strict"
import {build} from "esbuild"

async function load(entry){
  const out=await build({entryPoints:[entry],bundle:true,platform:"node",format:"esm",
    target:"es2022",write:false,logLevel:"silent"})
  return import("data:text/javascript;base64,"+Buffer.from(out.outputFiles[0].text).toString("base64"))
}
const lab=await load("quartz/components/scripts/atelier5d6-m05-sheet-view.ts")
const cards=await load("quartz/components/scripts/atelier5d6-bestiary-workshop.ts")
const rules=await load("quartz/components/scripts/atelier5d6-bestiary.ts")
const combat=await load("quartz/components/scripts/atelier5d6-combat-m03.ts")
const probability=await load("quartz/components/scripts/atelier5d6-probabilities.ts")
const progression=await load("quartz/components/scripts/atelier5d6-progression.ts")
await build({entryPoints:["quartz/components/scripts/atelier5d6-m05-sheet-dom.ts"],
  bundle:true,platform:"browser",target:"es2022",write:false,logLevel:"silent"})
let checks=0
const ok=(condition,label)=>{assert.ok(condition,label);checks++}
const eq=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);checks++}
for(let n=1;n<=25;n++){
  for(const archetype of ["faune","predateur","gardien","mystique","colosse"]){
    const card=cards.createBestiaryCard(n,archetype)
    const before=JSON.stringify(card)
    const view=lab.deriveM05Sheet(card)
    const source=rules.generateCreatureProfileM03(n,archetype)
    eq(view.stats.map(s=>s.raw),Object.values(source.stats),"profil M03 N"+n+"/"+archetype)
    eq(view.stats.map(s=>s.bonus),Object.values(source.stats).map(progression.effectiveStat),"bonus N"+n)
    eq(view.pvMax,source.pvMax,"PV N"+n)
    for(const d of view.defenses){
      eq(d.threshold,combat.resistanceScoreM03(cards.toDefense(card),d.kind),"seuil "+d.kind)
      eq(d.absorption,combat.effectiveProtectionM03(cards.toDefense(card),d.kind),"absorption "+d.kind)
    }
    eq(JSON.stringify(card),before,"adaptateur non-mutant")
    const imported=cards.validateBestiaryCard(JSON.parse(JSON.stringify(card)))
    eq(lab.deriveM05Sheet(imported).id,card.id,"compatibilité stockage")
  }
}
const colosse=cards.createBestiaryCard(15,"colosse")
const colosseView=lab.deriveM05Sheet(colosse)
eq(colosseView.stats.map(s=>s.raw),[15,7,8,8],"Colosse N15 caractéristiques")
eq(colosseView.stats.map(s=>s.bonus),[7,5,5,5],"Colosse N15 bonus")
eq(colosseView.baseHealth,114,"Colosse N15 base PV")
eq(colosseView.pvMax,194,"Colosse N15 PV")
ok(colosseView.stats[0].raw>12,"caractéristiques > 12 acceptées")
const attack=cards.evaluateMatchup(colosse,15,"polyvalent",0,4)
const wrapped=lab.deriveM05Sheet(colosse,attack)
eq(wrapped.matchup.creature.hits,attack.creature.hits,"probabilité officielle transférée")
eq(probability.TOTAL_OUTCOMES,7776,"5d6 7776 issues")
const sum=Array.from({length:26},(_,i)=>probability.sumOccurrences(i+5)).reduce((x,y)=>x+y,0)
eq(sum,7776,"distribution exacte")
const doc={id:"DRG-01",type:"individu",source:"à recontrôler",publish:true,
  visibilite:"publique",spoilers:false,unlisted:false,publicPath:"/archives-alrick/creatures/dragons/thessoryn"}
colosse.documentaryLink=doc
eq(lab.readDocumentaryLink(colosse).id,"DRG-01","lien documentaire déclaration")
eq(lab.canOfferDocumentaryLink(lab.readDocumentaryLink(colosse)),false,"aucune auto-publication")
colosse.documentaryLink={id:"<script>",type:"espece"}
eq(lab.readDocumentaryLink(colosse),null,"identifiant malformé refusé")
colosse.artwork={url:"https://pinterest.com/file.jpg",status:"canonique_validee",rights:"own",alt:"X",author:"Y"}
eq(lab.readApprovedArtwork(colosse),null,"pas d'image externe automatique")
colosse.artwork={url:"/archives-alrick/static/colosse.png",status:"publication_approuvee",
  rights:"permission",alt:"Portrait autorisé",author:"Artiste"}
eq(lab.readApprovedArtwork(colosse).alt,"Portrait autorisé","portrait publié à droits attestés")
const transfer=cards.exportBestiaryForAtelier(colosse)
eq(transfer.sheets[0].ruleset,"m03-bestiary","import Atelier principal inchangé")
eq(transfer.sheets[0].bestiarySource.documentaryLink.id,"<script>","round-trip d'extension sans interprétation")
console.log("M05 : "+checks+" assertions pures réussies ; aucune recette navigateur revendiquée.")
