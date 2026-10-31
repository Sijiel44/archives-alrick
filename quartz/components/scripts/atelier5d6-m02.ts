/**
 * M02 — adaptateur applicatif pur vers M01, sans nouveau moteur concurrent.
 * Aucun pouvoir, Cercle, Autorité ou statut divin n'est créé par ces fonctions.
 */
import {ABILITY_COSTS,canReachLevel,developmentBudget,effectiveMastery,effectiveStat,
  evaluateBuild,experienceAward,masteryCost,statCost} from "./atelier5d6-progression"
import type {Stats,StatName,Build,ExperienceEvent} from "./atelier5d6-progression"
import {ORIGIN_STEPS} from "./atelier5d6-origins"

export const M02_SCHEMA="alrick.sheets.v3" as const
export type AbilityKind=keyof typeof ABILITY_COSTS
export type AbilityStatus="slot"|"defined"
export type AbilityDefinition={
  id:string;name:string;description:string;domain:string;kind:AbilityKind
  levelRequired:number;masteryDomain?:string;masteryRequired?:number
  effect?:string;limitations?:string;resources?:string;provenance:string
  approvedByGM:boolean;status:AbilityStatus;rank:number;parentId?:string
}
export type AwardEntry={event:ExperienceEvent;xp:number}
export type Development={
  startingStats:Stats; abilities:AbilityDefinition[]
  awards:AwardEntry[]; approvedMilestones:number[]
  history:string[]
}
export type M02Sheet={level:number;stats:Stats;masteries:Record<string,number>;xp:number;development:Development}
const copy=<T>(value:T):T=>JSON.parse(JSON.stringify(value)) as T
const start=():Stats=>({physique:3,agilite:3,esprit:3,presence:3})
export function newDevelopment():Development{
  return {startingStats:start(),abilities:[],awards:[],approvedMilestones:[],history:[]}
}
export function evaluateSheet(sheet:M02Sheet){
  const abilities=sheet.development.abilities
  const build:Build={level:sheet.level,startingStats:sheet.development.startingStats,
    stats:sheet.stats,masteries:sheet.masteries,
    aptitudes:abilities.filter(x=>x.kind==="aptitude").length,
    techniques:abilities.filter(x=>x.kind==="technique").length,
    signatures:abilities.filter(x=>x.kind==="signature").length,
    approvedSignatures:abilities.filter(x=>x.kind==="signature"&&x.approvedByGM).length}
  const result=evaluateBuild(build),issues=[...result.issues]
  const ids=new Set<string>()
  for(const a of abilities){
    if(!a.id.trim()||ids.has(a.id))issues.push("Identifiant de capacité manquant ou dupliqué.")
    ids.add(a.id)
    if(!a.name.trim()||!a.domain.trim()||!a.provenance.trim())issues.push("Capacité sans nom, domaine ou justification.")
    if(!Number.isSafeInteger(a.rank)||a.rank<1)issues.push("Rang de capacité invalide.")
    if(a.status==="defined"&&(!a.effect?.trim()||!a.description.trim()||!a.limitations?.trim()))
      issues.push("Capacité définie sans effet, description ou limites : "+a.name)
    if(a.status!=="defined"&&a.status!=="slot")issues.push("Statut de capacité inconnu.")
    if(sheet.level<a.levelRequired)issues.push("Niveau insuffisant pour "+a.name)
    if(a.masteryDomain&&(sheet.masteries[a.masteryDomain]??0)<(a.masteryRequired??0))
      issues.push("Maîtrise insuffisante pour "+a.name)
  }
  return {...result,valid:issues.length===0,issues}
}
export function nextStatPrice(sheet:M02Sheet,key:StatName):number{
  return statCost(sheet.stats[key],sheet.stats[key]+1)
}
export function nextMasteryPrice(sheet:M02Sheet,domain:string):number{
  const old=sheet.masteries[domain]??0
  return masteryCost(old,old+1)
}
/** Toute transaction atomique, y compris les remboursements, repasse par M01. */
export function transact(sheet:M02Sheet,change:
  |{type:"stat";key:StatName;to:number}
  |{type:"mastery";key:string;to:number}
  |{type:"ability-add";ability:AbilityDefinition}
  |{type:"ability-remove";id:string}
  |{type:"ability-update";ability:AbilityDefinition}):M02Sheet{
  const target=copy(sheet)
  if(change.type==="stat")target.stats[change.key]=change.to
  else if(change.type==="mastery"){
    if(!change.key.trim())throw new Error("Domaine obligatoire.")
    target.masteries[change.key]=change.to
  }else if(change.type==="ability-add"){
    if(target.development.abilities.some(a=>a.id===change.ability.id))throw new Error("Capacité déjà enregistrée.")
    target.development.abilities.push(copy(change.ability))
  }else if(change.type==="ability-remove"){
    if(!target.development.abilities.some(a=>a.id===change.id))throw new Error("Capacité inconnue.")
    target.development.abilities=target.development.abilities.filter(a=>a.id!==change.id)
  }else{
    const idx=target.development.abilities.findIndex(a=>a.id===change.ability.id)
    if(idx===-1)throw new Error("Capacité inconnue.")
    if(target.development.abilities[idx].kind!==change.ability.kind)
      throw new Error("Changer une catégorie exige remboursement puis nouvel achat.")
    target.development.abilities[idx]=copy(change.ability)
  }
  const evaluation=evaluateSheet(target)
  if(!evaluation.valid)throw new Error(evaluation.issues.join(" ; "))
  target.development.history.push(change.type+" : "+(change.type==="stat"||change.type==="mastery"?change.key:change.type==="ability-remove"?change.id:change.ability.id))
  target.development.history=target.development.history.slice(-100)
  return target
}
export function grantAward(sheet:M02Sheet,event:ExperienceEvent):M02Sheet{
  const target=copy(sheet)
  const amount=experienceAward(event,target.development.awards.filter(a=>a.xp>0).map(a=>a.event))
  if(amount<=0)throw new Error("Récompense refusée : événement dupliqué, répété ou non validé par le MJ.")
  target.development.awards.push({event:copy(event),xp:amount})
  target.xp+=amount
  return target
}
export function approveMilestone(sheet:M02Sheet,level:number,gm:boolean):M02Sheet{
  if(!gm||!Number.isInteger(level)||level<21||level>25)throw new Error("Validation MJ requise pour le palier exceptionnel.")
  const target=copy(sheet)
  if(level>21&&!target.development.approvedMilestones.includes(level-1))
    throw new Error("Valider les paliers exceptionnels dans l'ordre.")
  target.development.approvedMilestones=[...new Set([...target.development.approvedMilestones,level])].sort((a,b)=>a-b)
  return target
}
export function eligibleLevel(sheet:M02Sheet,target:number):boolean{
  return canReachLevel(target,sheet.xp,sheet.development.approvedMilestones)
}
/** Conservation brute réversible : seule une action explicite peut remplacer les nombres hérités. */
export function migrateLegacy<T extends Record<string,unknown>>(original:T,approved:boolean){
  if(!approved)throw new Error("Consentement explicite à la conversion requis.")
  const archived=copy(original)
  return {...copy(original),ruleset:"m02" as const,
    legacyOriginal:archived,stats:start(),masteries:{},level:1,highestLevel:1,xp:0,
    convertedCredits:0,talentPointsSpent:0,development:newDevelopment()}
}
export function restoreLegacy(migrated:{legacyOriginal?:Record<string,unknown>}){
  if(!migrated.legacyOriginal)throw new Error("Aucune archive d'origine.")
  return copy(migrated.legacyOriginal)
}
/** Les étapes servent d'orientation, jamais de crédits gratuits cumulés avec M01. */
export function draftFromLifePath(ids:string[]){
  if(ids.length!==ORIGIN_STEPS.length)throw new Error("Quatre périodes obligatoires.")
  const weights:Stats={physique:0,agilite:0,esprit:0,presence:0}
  const masteryWeights:Record<string,number>={}
  let summary="",profession="Voyageur"
  for(let i=0;i<ORIGIN_STEPS.length;i++){
    const step=ORIGIN_STEPS[i],opt=step.options.find(o=>o.id===ids[i])
    if(!opt)throw new Error("Période de vie inconnue.")
    for(const k of Object.keys(weights) as StatName[])weights[k]+=opt.bonuses[k]
    for(const [k,v] of Object.entries(opt.mastery))masteryWeights[k]=(masteryWeights[k]??0)+(v??0)
    summary+=step.title+" : "+opt.background+"\n"
    if(opt.profession)profession=opt.profession
  }
  const s:M02Sheet={level:5,stats:start(),masteries:{},xp:400,development:newDevelopment()}
  // Répartir le même budget partagé B(5)=24, et non 24 + 8 maîtrises.
  while(evaluateSheet(s).remaining>0){
    const rest=evaluateSheet(s).remaining
    const options:{score:number;type:"stat"|"mastery";key:string;cost:number}[]=[]
    for(const k of Object.keys(weights) as StatName[]){
      const cost=nextStatPrice(s,k)
      if(cost<=rest)options.push({score:weights[k]/(cost*(1+(s.stats[k]-3)*0.6)),type:"stat",key:k,cost})
    }
    for(const [k,v] of Object.entries(masteryWeights)){
      const cost=nextMasteryPrice(s,k)
      if(cost<=rest)options.push({score:(v*2)/(cost*(1+(s.masteries[k]??0)*0.8)),type:"mastery",key:k,cost})
    }
    options.sort((a,b)=>b.score-a.score||a.key.localeCompare(b.key))
    if(!options.length||options[0].score<=0)break
    const best=options[0]
    if(best.type==="stat")s.stats[best.key as StatName]++
    else s.masteries[best.key]=(s.masteries[best.key]??0)+1
  }
  if(!evaluateSheet(s).valid)throw new Error("Parcours hors budget.")
  return {sheet:s,summary:summary.trim(),profession,lifeSteps:[...ids]}
}
export const effectiveBonus=(raw:number,mastery:number)=>effectiveStat(raw)+effectiveMastery(mastery)
export const totalBudget=developmentBudget
