import assert from "node:assert/strict"
import {build} from "esbuild"
const load=async entry=>{
  const bundle=await build({entryPoints:[entry],platform:"node",bundle:true,format:"esm",
    write:false,target:"es2022",logLevel:"silent"})
  return import("data:text/javascript;base64,"+Buffer.from(bundle.outputFiles[0].text).toString("base64"))
}
const b=await load("quartz/components/scripts/atelier5d6-rituals-mag003b.ts")
const c=await load("quartz/components/scripts/atelier5d6-rites-mag003c.ts")
const g=await load("quartz/components/scripts/atelier5d6-grimoire.ts")
let checks=0
const eq=(actual,wanted,label)=>{assert.deepEqual(actual,wanted,label);checks++}
const yes=(actual,label)=>{assert.ok(actual,label);checks++}
const rejects=(fn,contains)=>{assert.throws(fn,e=>e.message.includes(contains),contains);checks++}
const person=(id,role="officiant",extra={})=>({
  id,role,rawStat:5,masteryRank:3,mage:role==="officiant",skills:[],
  circleRights:{},...extra
})
const def=(changes={})=>({
  schema:b.RITUAL_SCHEMA,id:"test-support-d",version:"1.0.0",
  title:"Rituel de laboratoire D",practice:"tradition",traditionLabel:"Atelier",
  resolution:"m01",difficulty:21,leadRole:"officiant",feasible:true,
  requiresSafePlace:true,requiredRoles:["officiant"],components:{},effects:[],
  supportRules:{support:[{role:"artisan",skills:["artisanat"]},{role:"assistant",skills:["arts","artisanat"]},{role:"runiste",skills:["runes"]}]},...changes
})
const support=(personId="a",extra={})=>({
  id:"help",participantId:personId,kind:"support",detail:"Aide contextualisée",
  approved:true,supportRole:"artisan",supportSkillId:"artisanat",...extra
})
const lead=person("leader")
const artisan=person("a","artisan",{mage:false,masteryRank:1,skills:["artisanat"]})
const make=(definition=def(),members=[lead,artisan])=>
  b.createRitualInstance(definition,"rituel-d-"+definition.id,members)
const prepare=(s,contributions=[])=>b.transitionRitual(s,{
  id:"prepare",type:"preparer",tick:1,safePlace:true,contributions
})
const engage=s=>b.transitionRitual(s,{id:"engage",type:"engager",tick:2})
const solve=(s,baseSituation=0)=>b.transitionRitual(s,{
  id:"resolve",type:"resoudre",tick:3,natural:19,baseSituation
})
const resolved=(s,contributions=[support()],base=0)=>solve(engage(prepare(s,contributions)),base)

{
  const s=make()
  eq(b.supportQualification(s,support()),null,"Support qualifié : identité, rôle et artisanat")
  const z=resolved(s)
  eq(z.result.supportUsed,1,"Un assistant non mage qualifié donne +1")
  eq(z.result.effectiveSituation,1,"Situation M01 transmise sans autre formule")
  eq(b.applicationPlan(z).applied,false,"Pas d'effet ou transaction serveur")
}
{
  rejects(()=>prepare(make(),[support("inconnu")]),"sans propriétaire")
  rejects(()=>prepare(make(),[support("a",{supportRole:"gardien"})]),"Rôle de soutien")
  rejects(()=>prepare(make(),[support("a",{supportSkillId:"magie"})]),"Compétence déclarée")
  rejects(()=>prepare(make(),[support("a",{approved:false})]),"Contribution non approuvée")
  rejects(()=>prepare(make(),[support("leader",{supportRole:"officiant",supportSkillId:"magie"})]),"L'officiant principal")
  rejects(()=>prepare(make(),[support("a",{supportRole:undefined,supportSkillId:undefined})]),"Rôle de soutien")
  rejects(()=>prepare(make(),[support(),{...support(),id:"help2"}].map((x,i)=>i===1?{...x,id:"help"}:x)),
    "Contribution dupliquée")
  rejects(()=>make(def(),[lead,lead]),"Participant dupliqué")
  const good=make()
  rejects(()=>b.importRitual(JSON.stringify({...good,participants:[lead,lead]})),"Participants dupliqués")
}
{
  const many=make(def({id:"dix"}),[lead,...Array.from({length:20},(_,i)=>person(
    "a"+i,"assistant",{mage:false,masteryRank:1,skills:["arts"]}))])
  const contribs=Array.from({length:20},(_,i)=>support("a"+i,{
    id:"h"+i,supportRole:"assistant",supportSkillId:"arts"}))
  const ready=resolved(many,contribs,1)
  eq(ready.result.supportUsed,1,"Vingt assistants = +1 au maximum")
  eq(ready.result.effectiveSituation,2,"M01 situation plafonnée +2")
  const saturated=resolved(make(def({id:"sat"})),[support()],2)
  eq(saturated.result.supportUsed,0,"Plafond atteint : +0 supplémentaire")
  eq(saturated.result.effectiveSituation,2,"Situation bornée")
}
{
  const d=def({id:"cercle",circle:{number:2,action:"assister",authorizedMatrix:true}})
  const mage=person("mage","officiant",{circleRights:{assister:[2]},skills:["runes"]})
  const helper=person("h","runiste",{skills:["runes"],mage:true,masteryRank:3})
  rejects(()=>prepare(make(d,[mage,helper]),[support("h",{
    supportRole:"runiste",supportSkillId:"runes"})]),"Droit d'assistance au Cercle")
  const allowed=person("h","runiste",{skills:["runes"],mage:true,
    masteryRank:3,circleRights:{assister:[2]}})
  eq(resolved(make(d,[mage,allowed]),[support("h",{
    supportRole:"runiste",supportSkillId:"runes"})]).result.supportUsed,1,
    "Le droit spécifique d'assister au Cercle est attesté")
}
{
  const started=make()
  const prepared=prepare(started,[support()])
  const engaged=engage(prepared)
  const tampered=JSON.parse(b.exportRitual(engaged))
  tampered.participants[1].skills=[]
  eq(solve(tampered).result.supportUsed,0,
    "Import manipulé : aucune faveur numérique accordée")
  const older=JSON.parse(b.exportRitual(engaged))
  older.contributions[0]={id:"legacy-help",participantId:"a",
    kind:"support",detail:"Ancien journal",approved:true}
  eq(solve(older).result.supportUsed,0,
    "Ancien soutien sans preuve préservé mais non reconduit")
  eq(b.transitionRitual(engaged,{id:"prepare",type:"preparer",tick:1,
    safePlace:true,contributions:[support()]}).status,"engage",
    "Rejeu strictement identique après progression du tick : sans réapplication")
  rejects(()=>b.transitionRitual(engaged,{id:"prepare",type:"preparer",tick:1,
    safePlace:false,contributions:[support()]}),"Collision")
}
{
  const actor={id:"pj-d",name:"PJ D",mana:10,manaMax:35,
    stats:{esprit:5},masteries:{magie:0,artisanat:2},inventory:[],
    grimoire:g.newGrimoire()}
  const w=c.readWorkspace(actor)
  w.knownRites.push("demo-recueillement")
  actor.ritualWorkshop=w
  const p=c.buildParticipant(actor,"officiant")
  eq(p.skills,["artisanat"],"Skills effectivement attestés sur la fiche et non inventés")
  const personal=c.startCeremony(c.DEMO_RITES[0],"pj-rite",[p],true,false)
  yes(c.canPerformOrdinaryRite(personal,actor),"Rite connu ordinaire, même identité")
  const result=c.resolveCeremony(personal,Number.NaN,false,actor)
  eq(result.instance.status,"resolu","PJ termine son rite sans MJ local")
  eq(result.instance.result.automatic,true,"Pas de jet requis")
  eq(result.instance.result.energyDebits,[],"Pas de débit collectif")
  eq(result.instance.result.effectsProposed,[],"Pas de pouvoir accordé")
  eq(result.plan.applied,false,"Aucun effet appliqué")
  eq(actor.mana,10,"Pas de crédit gratuit de mana par le rite")
  eq(actor.grimoire.schema,"alrick.grimoire.v1","Grimoire toujours présent")
  rejects(()=>c.resolveCeremony(personal,18,false,{...actor,id:"autre"}),"validation MJ")
  const prayer=c.startCeremony(c.DEMO_RITES[1],"pj-priere",[p],true,false)
  rejects(()=>c.resolveCeremony(prayer,18,false,actor),"validation MJ")
  w.knownRites.push("demo-priere")
  const prayed=c.resolveCeremony(prayer,Number.NaN,false,actor)
  eq(prayed.plan.effects.length,0,"Prière ne crée pas de miracle")
  const altered={...c.DEMO_RITES[0],title:"Substitution dangereuse"}
  const crafted=c.startCeremony(altered,"substitut",[p],true,false)
  rejects(()=>c.resolveCeremony(crafted,18,false,actor),"validation MJ")
  const third=person("autre","gardien")
  const dangerous=c.startCeremony(c.DEMO_RITES[3],"collectif",[p,third],true,false)
  rejects(()=>c.resolveCeremony(dangerous,19,false,actor),"validation MJ")
  const copy=c.readWorkspace(actor)
  copy.rituals=[result.instance]
  eq(c.readWorkspace({...actor,ritualWorkshop:copy}).rituals[0].status,"resolu",
    "Export/import du rite accompli sans déperdition")
  const r={dayKey:"J12",restId:"nuit-unique",kind:"shortFirst",
    safe:true,completed:true,focused:false,exceptionalApproved:false,isMJ:false}
  c.commitRecovery(actor,r)
  eq(actor.mana,17,"Premier repos crédité par le moteur A")
  yes(c.commitRecovery(actor,r).result.duplicate,"Double clic toujours idempotent")
  eq(actor.mana,17,"Aucun double crédit")
  rejects(()=>c.previewRecovery(actor,{...r,kind:"shortSecond"}),"Collision d'identifiant")
  rejects(()=>c.previewRecovery(actor,{...r,dayKey:"J13",restId:"autre"}),"Journée incorrecte")
  const before=JSON.stringify(actor.grimoire)
  c.nextRecoveryDay(actor,"J13",false)
  eq(actor.ritualWorkshop.recovery.dayKey,"J13","Transition de journée explicite")
  eq(actor.ritualWorkshop.recovery.recoveredToday,0,"Reprise sans crédit artificiel")
  eq(JSON.stringify(actor.grimoire),before,"Grimoire et charges intacts après ces opérations")
}
console.log("MAG-003.D : "+checks+" assertions de régression réussies.")
