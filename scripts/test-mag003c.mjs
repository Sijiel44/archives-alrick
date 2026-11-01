import assert from "node:assert/strict"
import {build} from "esbuild"
const load=async entry=>{
  const out=await build({entryPoints:[entry],bundle:true,write:false,platform:"node",format:"esm",target:"es2022"})
  return import("data:text/javascript;base64,"+Buffer.from(out.outputFiles[0].text).toString("base64"))
}
const m=await load("quartz/components/scripts/atelier5d6-rites-mag003c.ts")
const a=await load("quartz/components/scripts/atelier5d6-mana-recovery.ts")
const g=await load("quartz/components/scripts/atelier5d6-grimoire.ts")
let n=0
const eq=(value,expected,message)=>{assert.deepEqual(value,expected,message);n++}
const yes=(value,message)=>{assert(value,message);n++}
const error=(fn,fragment)=>{assert.throws(fn,x=>x.message.includes(fragment),fragment);n++}
const sheet=(id="f1")=>({
  id,name:"Personnage "+id,mana:10,manaMax:35,
  stats:{esprit:6},masteries:{magie:2},
  inventory:[{id:"outil",name:"Outil existant"}],
  grimoire:g.newGrimoire()
})
const req=(o={})=>({
  dayKey:"J12",restId:"camp-1",kind:"shortFirst",safe:true,completed:true,
  focused:false,exceptionalApproved:false,isMJ:false,...o
})
const s=sheet()
eq(m.readWorkspace(s).schema,m.RITES_UI_SCHEMA,"Schéma MAG-003.C")
const view=m.previewRecovery(s,req())
eq(view.result.entry.gain,7,"20 % de 35 = 7 mana")
eq(s.mana,10,"Prévisualiser ne débite/crédite rien")
eq(s.ritualWorkshop,undefined,"Prévisualisation sans mutation")
eq(m.commitRecovery(s,req()).result.entry.gain,7,"Crédit personnel réel")
eq(s.mana,17,"Mana fiche synchronisé")
eq(s.ritualWorkshop.recovery.mana,17,"Mana ledger synchronisé")
yes(m.commitRecovery(s,req()).result.duplicate,"Double clic idempotent")
eq(s.mana,17,"Pas de double gain")
eq(m.previewRecovery(s,req({restId:"camp-2",kind:"shortSecond",safe:false})).result.entry.accepted,false,"Lieu non sûr refusé")
eq(m.previewRecovery(s,req({restId:"camp-2",kind:"shortSecond",safe:true,completed:false})).result.entry.accepted,false,"Interruption refusée")
eq(m.commitRecovery(s,req({restId:"camp-2",kind:"shortSecond"})).result.entry.gain,7,"Deuxième repos: 40 % cumulé")
eq(s.mana,24,"Budget de récupération non additif")
eq(m.previewRecovery(s,req({restId:"camp-3",kind:"shortDeep",focused:true})).result.entry.accepted,false,
  "Deux repos courts maximum")
eq(m.previewRecovery(s,req({restId:"long-1",kind:"longRetreat"})).result.entry.accepted,false,
  "Retraite exceptionnelle refusée sans MJ")
const gBefore=JSON.stringify(s.grimoire)
const matricesBefore=JSON.stringify(s.grimoire.matrices)
yes(m.trackGrimoireManaChange(s,24,21,"sort:demo-etincelle"),"Dépense de mana G-001 suivie")
eq(s.ritualWorkshop.recovery.mana,21,"Ledger aligné après sort G-001")
eq(JSON.stringify(s.grimoire),gBefore,"G-001 non modifié par le rite")
eq(JSON.stringify(s.grimoire.matrices),matricesBefore,"Charges inchangées")
eq(m.trackGrimoireManaChange(s,21,25,"mana-externe"),false,"Crédit arbitraire jamais suivi")
s.mana=21
eq(m.nextRecoveryDay(s,"J13",true).state.dayKey,"J13","Transition de journée explicite")
eq(s.ritualWorkshop.recovery.recoveredToday,0,"Budget de la nouvelle journée")
const backup=JSON.stringify(s)
const restored=JSON.parse(backup)
eq(m.readWorkspace(restored).recovery.journal.length,s.ritualWorkshop.recovery.journal.length,
  "Export/import préserve l'historique")
const legacy=sheet("ancien")
eq(m.readWorkspace(legacy).knownRites.length,0,"Anciennes fiches sans extension acceptées")
legacy.ritualWorkshop={schema:"autre-schema",knownRites:[],rituals:[],workOrders:[]}
error(()=>m.readWorkspace(legacy),"non reconnue")
const swapped={...restored,id:"autre-personnage"}
error(()=>m.readWorkspace(swapped),"Identité")
const off=m.buildParticipant(s,"officiant")
const guard=m.buildParticipant(sheet("p2"),"gardien")
const crafter=m.buildParticipant(sheet("p3"),"artisan")
eq(off.circleRights,{},"La pratique n'attribue aucun Cercle")
const personal=m.startCeremony(m.DEMO_RITES[0],"rite-personnel",[off],true,false)
eq(personal.status,"prepare","Préparation personnelle")
error(()=>m.resolveCeremony(personal,18,false),"MJ local")
const p=m.resolveCeremony(personal,18,true)
eq(p.instance.status,"resolu","Résolution validée MJ local")
eq(p.plan.applied,false,"Aucune application de ressources")
eq(p.plan.debits.length,0,"Aucun débit collectif")
const prayer=m.resolveCeremony(m.startCeremony(m.DEMO_RITES[1],"priere",[off],true,false),18,true)
eq(prayer.plan.effects.length,0,"Aucun miracle ni points de foi implicites")
const nonreligious=m.resolveCeremony(m.startCeremony(m.DEMO_RITES[2],"tradition",[off,crafter],true,false),18,true)
eq(nonreligious.instance.result.success,true,"Pratique non religieuse viable")
const ceremony=m.startCeremony(m.DEMO_RITES[3],"collectif",[off,guard],true,true)
const result=m.resolveCeremony(ceremony,18,true)
yes(result.instance.result.probability>=0&&result.instance.result.probability<=1,
  "Probabilité M01 bornée")
eq(result.instance.result.supportUsed,1,"Soutien plafonné de MAG-003.B")
eq(result.plan.applied,false,"Validation MJ locale non transactionnelle")
eq(JSON.stringify(s.grimoire),gBefore,"Aucun changement au Grimoire")
error(()=>m.startCeremony(m.DEMO_RITES[3],"r",[off],true,false),"Rôle manquant")
const order={id:"w1",kind:"matrice",itemId:"outil",description:"Vérifier la gravure",
 status:"proposition_mj",createdAt:"2026-11-01"}
m.addWorkOrder(s,order)
eq(s.ritualWorkshop.workOrders.length,1,"Dossier atelier créé sans objet nouveau")
eq(s.ritualWorkshop.workOrders[0].status,"proposition_mj","Pas d'artefact automatique")
error(()=>m.addWorkOrder(s,{...order,id:"w2",itemId:"objet-absent"}),"Objet absent")
eq(JSON.stringify(s.grimoire.matrices),matricesBefore,"Aucune recharge d'objet")
const ir=a.importManaState(a.exportManaState(s.ritualWorkshop.recovery))
eq(ir.mana,21,"Roundtrip ledger A")
console.log("MAG-003.C : "+n+" assertions d'intégration locales validées.")
