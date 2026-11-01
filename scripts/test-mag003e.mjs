import assert from "node:assert/strict"
import {build} from "esbuild"
const load=async entry=>{
  const built=await build({entryPoints:[entry],bundle:true,platform:"node",format:"esm",
    target:"es2022",write:false,logLevel:"silent"})
  return import("data:text/javascript;base64,"+Buffer.from(built.outputFiles[0].text).toString("base64"))
}
const b=await load("quartz/components/scripts/atelier5d6-rituals-mag003b.ts")
const a=await load("quartz/components/scripts/atelier5d6-mana-recovery.ts")
let checks=0
const eq=(actual,expected,msg)=>{assert.deepEqual(actual,expected,msg);checks++}
const rejects=(fn,msg)=>{assert.throws(fn,e=>e.message.includes(msg),msg);checks++}
const participant=(id,role,skills,knowledge=[])=>({
  id,role,skills,knowledge,rawStat:5,masteryRank:1,mage:false,circleRights:{}
})
const lead=participant("lead","officiant",["magie"])
const helper=participant("artisan","artisan",["couture","artisanat","navigation"])
const def={
  schema:b.RITUAL_SCHEMA,id:"e-context",version:"1.0.0",title:"Soutien de l'artisan",
  practice:"tradition",traditionLabel:"Atelier",resolution:"m01",difficulty:21,
  leadRole:"officiant",feasible:true,requiresSafePlace:true,requiredRoles:["officiant"],
  components:{},effects:[],
  supportRules:{support:[{role:"artisan",skills:["artisanat"],knowledge:["etude-des-materiaux"]}]}
}
const contrib=(extra={})=>({
  id:"contrib-e",participantId:"artisan",kind:"support",detail:"Appui spécifique",
  approved:true,supportRole:"artisan",supportSkillId:"artisanat",...extra
})
const unqualified=b.createRitualInstance(def,"rite-e",[lead,helper])
rejects(()=>b.transitionRitual(unqualified,{
  id:"prepare",type:"preparer",tick:1,safePlace:true,contributions:[contrib()]
}),"Prérequis de connaissance")
const ready=b.createRitualInstance(def,"rite-e-ready",[
  lead,participant("artisan","artisan",helper.skills,["etude-des-materiaux"])
])
eq(b.supportQualification(ready,contrib()),null,"Prérequis attestés")
rejects(()=>b.transitionRitual(ready,{
  id:"prepare",type:"preparer",tick:1,safePlace:true,
  contributions:[contrib({supportSkillId:"navigation"})]
}),"hors sujet")
const nonNumeric=b.transitionRitual(ready,{
  id:"prepare",type:"preparer",tick:1,safePlace:true,
  contributions:[{id:"outil",participantId:"artisan",kind:"structure",detail:"Fournit l'établi",approved:true}]
})
const engaged=b.transitionRitual(nonNumeric,{id:"start",type:"engager",tick:2})
eq(b.previewRitual(engaged,{id:"resolve",type:"resoudre",tick:3,natural:18}).supportUsed,0,
  "Préparation sans bonus numérique")
const prepared=b.transitionRitual(ready,{
  id:"prepare",type:"preparer",tick:1,safePlace:true,contributions:[contrib()]
})
const accepted=b.transitionRitual(prepared,{id:"start",type:"engager",tick:2})
eq(b.previewRitual(accepted,{id:"resolve",type:"resoudre",tick:3,natural:18}).supportUsed,1,
  "Soutien contextuel plafonné +1")
const tampered=JSON.parse(b.exportRitual(accepted))
tampered.participants[1].skills=["navigation"]
eq(b.previewRitual(tampered,{id:"resolve",type:"resoudre",tick:3,natural:18}).supportUsed,0,
  "Import manipulé privé de son soutien chiffré")
const restored=JSON.parse(b.exportRitual(accepted))
eq(restored.definition.supportRules.support[0].skills,["artisanat"],
  "Contrat de pertinence conservé à l'export")

const validation={approved:true,authority:"simulation",origin:"atelier-test"}
const state=a.createManaState("pers-e","J100",35,10)
const req={id:"repos-e",type:"recover",characterId:"pers-e",dayKey:"J100",validation,
  kind:"shortFirst",rest:{restId:"matin",safe:true,completed:true,focused:false,exceptionalApproved:false}}
const once=a.applyManaOperation(state,req)
eq(once.entry.gain,7,"Crédit initial")
eq(once.state.mana,17,"Mana après crédit initial")
eq(a.applyManaOperation(once.state,req).duplicate,true,"Rejeu parfaitement identique")
eq(a.applyManaOperation(once.state,req).state.mana,17,"Aucun deuxième crédit")
rejects(()=>a.applyManaOperation(once.state,{...req,kind:"shortSecond"}),"Collision")
rejects(()=>a.applyManaOperation(once.state,{...req,rest:{...req.rest,safe:false}}),"Collision")
rejects(()=>a.applyManaOperation(once.state,{...req,rest:{...req.rest,completed:false}}),"Collision")
rejects(()=>a.applyManaOperation(once.state,{...req,rest:{...req.rest,focused:true}}),"Collision")
rejects(()=>a.applyManaOperation(once.state,{...req,rest:{...req.rest,restId:"soir"}}),"Collision")
rejects(()=>a.applyManaOperation(once.state,{...req,validation:{...validation,approved:false}}),"Collision")
rejects(()=>a.applyManaOperation(once.state,{...req,dayKey:"J101"}),"Collision")
const copied=a.importManaState(a.exportManaState(once.state))
eq(copied.journal[0].fingerprint,once.entry.fingerprint,"Empreinte persistante")
const legacy=JSON.parse(a.exportManaState(copied))
delete legacy.journal[0].fingerprint
const importLegacy=a.importManaState(JSON.stringify(legacy))
eq(importLegacy.journal[0].gain,7,"Opération historique non détruite")
rejects(()=>a.applyManaOperation(importLegacy,req),"sans empreinte")
const other={...copied,characterId:"autre"}
rejects(()=>a.applyManaOperation(other,req),"personnage incompatible")
eq(a.manaOperationFingerprint(once.state,req),a.manaOperationFingerprint(once.state,{
  ...req,rest:{completed:true,restId:"matin",exceptionalApproved:false,safe:true,focused:false}
}),"Empreinte indépendante de l'ordre des clés")
console.log("MAG-003.E : "+checks+" vérifications d'empreinte, pertinence et sauvegardes réussies.")
