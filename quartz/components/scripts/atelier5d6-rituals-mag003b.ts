/**
 * MAG-003.B — laboratoire des rites personnels et collectifs.
 * Moteur pur : calcul et journal uniquement. Aucune écriture sur les fiches,
 * aucune autorité serveur, aucun fait de campagne ni nouvelle règle canonique.
 */
import {resolveProgressionAction,probabilityProgressionAction} from "./atelier5d6-progression"
import {resolveCombatM03} from "./atelier5d6-combat-m03"
import type {CombatM03Input} from "./atelier5d6-combat-m03"
import {sumOccurrences,TOTAL_OUTCOMES} from "./atelier5d6-probabilities"
import {validateManaState} from "./atelier5d6-mana-recovery"
import type {ManaState,ManaOperation} from "./atelier5d6-mana-recovery"

export const RITUAL_SCHEMA="alrick.ritual.v1" as const
export type RitualStatus="brouillon"|"prepare"|"engage"|"resolu"|"interrompu"|"annule"
export type RitualRole="officiant"|"runiste"|"canaliseur"|"chantre"|"gardien"|"artisan"|"assistant"
export type RitualPractice="meditation"|"priere"|"recueillement"|"discipline_runique"|"etude_magique"|"preparation_rituel"|"tradition"
export type RitualResolutionMode="automatique"|"m01"|"m03"
export type RitualCircleAction="concevoir"|"comprendre"|"assister"|"activer"
export type RitualEffect={
  id:string;kind:"clarte"|"concentration"|"harmonie"|"preparation"|"protection"|"inspiration"
  narrative:string;durationTicks:number;context:string
  numerical?:{kind:"m01-situation"|"m03-situation";magnitude:1;approvedByGM:boolean}
}
export type RitualDefinition={
  schema:typeof RITUAL_SCHEMA;id:string;version:string;title:string;practice:RitualPractice
  traditionLabel?:string;resolution:RitualResolutionMode;leadRole:RitualRole
  difficulty?:number;feasible:boolean;requiresSafePlace:boolean
  requiredRoles:RitualRole[];components:Record<string,number>
  /** Rôles, compétences et connaissances requis selon la nature de l'aide. */
  supportRules?:Partial<Record<"support"|"duree",Array<{role:RitualRole;skills:string[];knowledge?:string[]}>>>
  circle?:{number:number;action:RitualCircleAction;existingMatrixId?:string;authorizedMatrix:boolean}
  energy?:{policyId:string;maxPerParticipant:number;maxTotal:number}
  effects:RitualEffect[]
}
export type RitualParticipant={
  id:string;role:RitualRole;rawStat:number;masteryRank:number;mage:boolean
  skills:string[];knowledge?:string[];circleRights:Partial<Record<RitualCircleAction,number[]>>
}
export type RitualContribution={
  id:string;participantId:string
  kind:"support"|"component"|"securite"|"duree"|"structure"|"anti_interruption"|"connaissance"|"energie"
  detail:string;approved:boolean
  componentId?:string;quantity?:number;energyAmount?:number;manaCharacterId?:string
  /** Preuves explicites pour le soutien chiffré : un rôle et une compétence réels du participant. */
  supportRole?:RitualRole;supportSkillId?:string
}
export type RitualEvent={
  id:string;fingerprint:string;from:RitualStatus;to:RitualStatus;tick:number
  action:"preparer"|"engager"|"resoudre"|"interrompre"|"annuler"
}
export type RitualJournalEntry={
  id:string;eventId:string;tick:number;message:string;status:RitualStatus
}
export type RitualResult={
  success:boolean;automatic:boolean;natural?:number;probability:number
  total?:number;effectiveSituation:number;supportUsed:number;durationSaved:number
  requirements:string[];effectsProposed:ReadonlyArray<RitualEffect & {expiresAtTick:number}>
  energyDebits:ReadonlyArray<{participantId:string;characterId:string;amount:number;operation:ManaOperation}>
  application:"manual-confirmation"|"requires-authoritative-server"
  damageProposed?:number
}
export type RitualInstance={
  schema:typeof RITUAL_SCHEMA;id:string;definition:RitualDefinition;status:RitualStatus
  participants:RitualParticipant[];contributions:RitualContribution[]
  tick:number;events:RitualEvent[];journal:RitualJournalEntry[];result?:RitualResult
}
export type RitualAction=
 |{id:string;type:"preparer";tick:number;contributions:RitualContribution[];safePlace:boolean}
 |{id:string;type:"engager";tick:number}
 |{id:string;type:"resoudre";tick:number;natural?:number;manaStates?:Record<string,ManaState>;combat?:Omit<CombatM03Input,"natural"|"rawStat"|"masteryRank"|"situation">;baseSituation?:number}
 |{id:string;type:"interrompre"|"annuler";tick:number;reason:string}
const clone=<T>(x:T):T=>JSON.parse(JSON.stringify(x)) as T
const requireId=(x:string,label:string)=>{if(typeof x!=="string"||!x.trim())throw new Error(label+" obligatoire.")}
const integer=(v:number,label:string,min=0,max=Number.MAX_SAFE_INTEGER)=>{
  if(!Number.isSafeInteger(v)||v<min||v>max)throw new Error(label+" invalide.")
}
const roles:RitualRole[]=["officiant","runiste","canaliseur","chantre","gardien","artisan","assistant"]
const practices:RitualPractice[]=["meditation","priere","recueillement","discipline_runique","etude_magique","preparation_rituel","tradition"]
const actions:RitualCircleAction[]=["concevoir","comprendre","assister","activer"]
const kinds:RitualEffect["kind"][]=["clarte","concentration","harmonie","preparation","protection","inspiration"]
const validRole=(r:RitualRole)=>{if(!roles.includes(r))throw new Error("Rôle inconnu.")}
export function validateRitualDefinition(d:RitualDefinition):void{
  if(!d||d.schema!==RITUAL_SCHEMA)throw new Error("Version du rite incompatible.")
  requireId(d.id,"Rite");requireId(d.version,"Version");requireId(d.title,"Titre")
  if(!practices.includes(d.practice))throw new Error("Pratique inconnue.")
  if(d.practice==="tradition")requireId(d.traditionLabel??"","Tradition personnalisée")
  if(!["automatique","m01","m03"].includes(d.resolution))throw new Error("Mode de résolution inconnu.")
  validRole(d.leadRole)
  if(typeof d.feasible!=="boolean"||typeof d.requiresSafePlace!=="boolean")throw new Error("Faisabilité/sûreté manquante.")
  if(d.resolution!=="automatique")integer(d.difficulty??NaN,"Difficulté",0,45)
  if(d.supportRules!==undefined){
    if(!d.supportRules||typeof d.supportRules!=="object"||Array.isArray(d.supportRules)||
       Object.keys(d.supportRules).some(k=>k!=="support"&&k!=="duree"))
      throw new Error("Contrat de soutien invalide.")
    for(const rules of Object.values(d.supportRules)){
      if(!Array.isArray(rules))throw new Error("Règles de soutien invalides.")
      for(const rule of rules){
        validRole(rule.role)
        if(!Array.isArray(rule.skills)||!rule.skills.length||
           rule.skills.some(x=>typeof x!=="string"||!x.trim()))
          throw new Error("Compétences admissibles absentes.")
        if(rule.knowledge!==undefined&&(!Array.isArray(rule.knowledge)||
           rule.knowledge.some(x=>typeof x!=="string"||!x.trim())))
          throw new Error("Prérequis de connaissance invalide.")
      }
    }
  }
  if(!Array.isArray(d.requiredRoles))throw new Error("Rôles requis invalides.")
  d.requiredRoles.forEach(validRole)
  if(!d.components||Array.isArray(d.components)||typeof d.components!=="object")throw new Error("Composants invalides.")
  for(const [id,q] of Object.entries(d.components)){requireId(id,"Composant");integer(q,"Quantité composant",1)}
  if(d.circle){
    integer(d.circle.number,"Cercle",1,9)
    if(d.circle.number===9)throw new Error("Cercle IX : accès non autorisé par MAG-003.B.")
    if(!actions.includes(d.circle.action))throw new Error("Action de Cercle inconnue.")
    if(d.circle.action==="activer")requireId(d.circle.existingMatrixId??"","Matrice existante")
    if(d.circle.authorizedMatrix!==true)throw new Error("Validation de matrice MAG-050 absente.")
  }
  if(d.energy){
    requireId(d.energy.policyId,"Politique d'énergie explicite")
    integer(d.energy.maxPerParticipant,"Plafond individuel",1)
    integer(d.energy.maxTotal,"Plafond total",1)
  }
  if(!Array.isArray(d.effects))throw new Error("Effets invalides.")
  const effectIds=new Set<string>()
  let numericalCount=0
  for(const e of d.effects){
    requireId(e.id,"Effet");requireId(e.narrative,"Narration");requireId(e.context,"Contexte")
    if(effectIds.has(e.id))throw new Error("Effet dupliqué.")
    effectIds.add(e.id)
    if(!kinds.includes(e.kind))throw new Error("Famille d'effet inconnue.")
    integer(e.durationTicks,"Durée",1,3)
    if(e.numerical)numericalCount++
    if(e.numerical&&
      (e.numerical.approvedByGM!==true||e.numerical.magnitude!==1||
      !["m01-situation","m03-situation"].includes(e.numerical.kind)))
      throw new Error("Bonus narratif, non validé ou supérieur à +1 refusé.")
  }
  if(numericalCount>1)throw new Error("Non-cumul : un seul effet numérique par rite.")
}
export function createRitualInstance(d:RitualDefinition,id:string,participants:RitualParticipant[]):RitualInstance{
  validateRitualDefinition(d);requireId(id,"Instance")
  if(!participants.length||!Array.isArray(participants))throw new Error("Participants absents.")
  const seen=new Set<string>()
  for(const p of participants){
    requireId(p.id,"Participant");validRole(p.role)
    integer(p.rawStat,"Caractéristique",1);integer(p.masteryRank,"Maîtrise")
    if(typeof p.mage!=="boolean"||!Array.isArray(p.skills)||!p.circleRights)throw new Error("Profil rituel incomplet.")
    if(seen.has(p.id))throw new Error("Participant dupliqué.")
    seen.add(p.id)
    for(const [action,circles] of Object.entries(p.circleRights)){
      if(!actions.includes(action as RitualCircleAction)||!Array.isArray(circles)||
        circles.some(n=>!Number.isInteger(n)||n<1||n>8))throw new Error("Connaissance de Cercle invalide.")
    }
  }
  return {schema:RITUAL_SCHEMA,id,definition:clone(d),status:"brouillon",
    participants:clone(participants),contributions:[],tick:0,events:[],journal:[]}
}
export function validateRitualInstance(s:RitualInstance):void{
  if(!s||s.schema!==RITUAL_SCHEMA)throw new Error("Instance incompatible.")
  validateRitualDefinition(s.definition);requireId(s.id,"Instance")
  if(!["brouillon","prepare","engage","resolu","interrompu","annule"].includes(s.status))
    throw new Error("Statut inconnu.")
  integer(s.tick,"Horodatage")
  if(!Array.isArray(s.events)||!Array.isArray(s.journal)||!Array.isArray(s.participants)||
    !Array.isArray(s.contributions)||new Set(s.events.map(e=>e.id)).size!==s.events.length)
    throw new Error("Historique incohérent.")
  if(new Set(s.participants.map(p=>p.id)).size!==s.participants.length)
    throw new Error("Participants dupliqués dans une sauvegarde de rite.")
  for(const p of s.participants){
    requireId(p.id,"Participant");validRole(p.role)
    integer(p.rawStat,"Caractéristique",1);integer(p.masteryRank,"Maîtrise")
    if(typeof p.mage!=="boolean"||!Array.isArray(p.skills)||!p.circleRights)
      throw new Error("Profil de participant incomplet.")
  }
}
/**
 * Qualification stricte : une case « approuvé » ou le nombre de participants
 * ne prouvent jamais à eux seuls une maîtrise, un rôle ou un droit de Cercle.
 * Les anciennes contributions dépourvues de ces preuves sont conservées dans
 * l'historique, mais ne peuvent pas procurer de nouveau bonus.
 */
export function supportQualification(s:RitualInstance,c:RitualContribution):string|null{
  if(c.kind!=="support"&&c.kind!=="duree")return "Nature de soutien non numérique."
  if(c.approved!==true)return "Contribution non approuvée."
  const participant=s.participants.find(p=>p.id===c.participantId)
  if(!participant)return "Participant de soutien absent."
  const lead=s.participants.find(p=>p.role===s.definition.leadRole)
  if(!lead||participant.id===lead.id)return "L'officiant principal ne se soutient pas lui-même."
  if(!c.supportRole||participant.role!==c.supportRole||participant.role===s.definition.leadRole)
    return "Rôle de soutien non vérifié."
  if(typeof c.supportSkillId!=="string"||!c.supportSkillId.trim()||
    !participant.skills.includes(c.supportSkillId))
    return "Compétence déclarée non attestée chez le participant."
  const candidates=s.definition.supportRules?.[c.kind]
  if(!candidates?.length)return "Contrat de compétences pertinentes absent pour cette contribution."
  const matching=candidates.filter(r=>r.role===participant.role&&r.skills.includes(c.supportSkillId!))
  if(!matching.length)return "Compétence hors sujet ou non admissible pour cette contribution."
  if(!matching.some(r=>(r.knowledge??[]).every(id=>participant.knowledge?.includes(id))))
    return "Prérequis de connaissance non attesté."
  if(s.definition.circle&&!participant.circleRights.assister?.includes(s.definition.circle.number))
    return "Droit d'assistance au Cercle non attesté."
  return null
}
function inspectRequirements(s:RitualInstance,contributions:RitualContribution[],safePlace:boolean):string[]{
  const issues:string[]=[]
  const ids=new Set<string>()
  for(const c of contributions){
    requireId(c.id,"Contribution");requireId(c.detail,"Description de contribution")
    if(ids.has(c.id))throw new Error("Contribution dupliquée.")
    ids.add(c.id)
    if(!s.participants.some(p=>p.id===c.participantId))throw new Error("Contribution sans propriétaire.")
    if(!["support","component","securite","duree","structure","anti_interruption","connaissance","energie"].includes(c.kind))
      throw new Error("Type de contribution inconnu.")
    if(c.kind==="support"||c.kind==="duree"){
      const reason=supportQualification(s,c)
      if(reason)issues.push("Soutien non qualifié : "+reason)
    }
    if(c.kind==="component"){requireId(c.componentId??"","Composant fourni");integer(c.quantity??NaN,"Quantité",1)}
    if(c.kind==="energie"){
      if(!s.definition.energy)issues.push("Énergie collective sans règle explicite.")
      integer(c.energyAmount??NaN,"Énergie",1)
      if(c.manaCharacterId!==c.participantId)issues.push("Contribution énergétique non attribuée à son propriétaire.")
    }
  }
  if(s.definition.requiresSafePlace&&!safePlace&&!contributions.some(c=>c.kind==="securite"&&c.approved))
    issues.push("Lieu sûr ou protection préparatoire manquant.")
  for(const r of s.definition.requiredRoles)
    if(!s.participants.some(p=>p.role===r))issues.push("Rôle manquant : "+r)
  if(!s.participants.some(p=>p.role===s.definition.leadRole))
    issues.push("Officiant principal introuvable.")
  for(const [component,required] of Object.entries(s.definition.components)){
    const available=contributions.filter(c=>c.approved&&c.kind==="component"&&c.componentId===component)
      .reduce((total,c)=>total+(c.quantity??0),0)
    if(available<required)issues.push("Composant manquant : "+component)
  }
  if(s.definition.circle){
    const circle=s.definition.circle
    // Seul le titulaire de la connaissance pertinente satisfait le prérequis.
    // Le nombre d'assistants ne fait pas monter un Cercle.
    if(!s.participants.some(p=>p.circleRights[circle.action]?.includes(circle.number)))
      issues.push("Aucun participant ne maîtrise "+circle.action+" du Cercle "+circle.number)
  }
  const energies=contributions.filter(c=>c.kind==="energie")
  if(energies.length){
    const energy=s.definition.energy
    if(energy){
      let grand=0
      for(const p of s.participants){
        const per=energies.filter(c=>c.participantId===p.id).reduce((n,c)=>n+(c.energyAmount??0),0)
        if(per>energy.maxPerParticipant)issues.push("Plafond énergétique individuel dépassé : "+p.id)
        grand+=per
      }
      if(grand>energy.maxTotal)issues.push("Plafond énergétique collectif dépassé.")
    }
    if(energies.some(c=>!c.approved))issues.push("Contribution énergétique non approuvée.")
  }
  return issues
}
function previewEnergy(s:RitualInstance,states:Record<string,ManaState>|undefined):RitualResult["energyDebits"]{
  const wanted=s.contributions.filter(c=>c.kind==="energie")
  if(!wanted.length)return []
  if(!states)throw new Error("États mana requis pour prévisualiser l'énergie.")
  const total=new Map<string,number>()
  const debits:Array<RitualResult["energyDebits"][number]>= []
  for(const c of wanted){
    const id=c.manaCharacterId!
    const state=states[id]
    if(!state)throw new Error("Réserve manquante : "+id)
    validateManaState(state)
    if(state.characterId!==c.participantId)throw new Error("Propriétaire du mana incorrect.")
    total.set(id,(total.get(id)??0)+c.energyAmount!)
    const operation:ManaOperation={id:s.id+":energie:"+c.id,type:"spend",characterId:id,
      dayKey:state.dayKey,validation:{approved:true,authority:"simulation",origin:"mag003b-preview-only"},
      cost:c.energyAmount!,purpose:"rite:"+s.definition.id}
    debits.push({participantId:c.participantId,characterId:id,amount:c.energyAmount!,operation})
  }
  for(const [id,amount] of total){
    if(amount>states[id].mana)throw new Error("Mana insuffisant pour : "+id)
    if(debits.some(d=>states[id].journal.some(e=>e.id===d.operation.id)))
      throw new Error("Débit rituel déjà répertorié : "+id)
  }
  return debits
}
export function previewRitual(s:RitualInstance,action:Extract<RitualAction,{type:"resoudre"}>):RitualResult{
  validateRitualInstance(s)
  if(s.status!=="engage")throw new Error("Résolution réservée à un rite engagé.")
  integer(action.tick,"Horodatage",s.tick)
  const lead=s.participants.find(p=>p.role===s.definition.leadRole)!
  const support=s.contributions.some(c=>c.kind==="support"&&supportQualification(s,c)===null)
    ?1:0 // contrôle répété après import : compétence/rôle/identité/droit explicites
  const base=action.baseSituation??0
  integer(base,"Situation",-2,2)
  const situation=Math.min(2,base+support)
  const used=situation-base
  const automatic=s.definition.resolution==="automatique"
  if(!automatic)integer(action.natural??NaN,"Naturel 5d6",5,30)
  let success=automatic?s.definition.feasible:false
  let total:number|undefined,damageProposed:number|undefined
  let probability=automatic?(success?1:0):0
  if(s.definition.resolution==="m01"){
    const input={natural:action.natural!,rawStat:lead.rawStat,masteryRank:lead.masteryRank,
      situation,threshold:s.definition.difficulty!,feasible:s.definition.feasible}
    const result=resolveProgressionAction(input)
    success=result.success;total=result.total
    probability=probabilityProgressionAction({rawStat:lead.rawStat,masteryRank:lead.masteryRank,
      situation,threshold:s.definition.difficulty!,feasible:s.definition.feasible})
  }
  if(s.definition.resolution==="m03"){
    if(!action.combat)throw new Error("Paramètres M03 explicites requis.")
    const input={...action.combat,natural:action.natural!,rawStat:lead.rawStat,
      masteryRank:lead.masteryRank,situation,feasible:s.definition.feasible,
      difficulty:s.definition.difficulty!}
    const result=resolveCombatM03(input)
    success=result.success;total=result.total;damageProposed=result.damage
    let favorable=0
    for(let natural=5;natural<=30;natural++)
      if(resolveCombatM03({...input,natural}).success)favorable+=sumOccurrences(natural)
    probability=favorable/TOTAL_OUTCOMES
  }
  const energyDebits=previewEnergy(s,action.manaStates)
  const effectsProposed=success?s.definition.effects.map(e=>({...clone(e),expiresAtTick:action.tick+e.durationTicks})):[]
  return {success,automatic,natural:action.natural,probability,total,
    effectiveSituation:situation,supportUsed:used,
    durationSaved:s.contributions.some(c=>c.kind==="duree"&&supportQualification(s,c)===null)?1:0,
    requirements:[],effectsProposed,energyDebits,
    application:energyDebits.length?"requires-authoritative-server":"manual-confirmation",
    damageProposed}
}
const transitions:Record<RitualAction["type"],RitualStatus[]>={
  preparer:["brouillon"],engager:["prepare"],resoudre:["engage"],
  interrompre:["prepare","engage"],annuler:["brouillon","prepare"]}
export function transitionRitual(source:RitualInstance,action:RitualAction):RitualInstance{
  validateRitualInstance(source);requireId(action.id,"Événement")
  // Un reçu identique est idempotent, même après une progression de tick.
  const fingerprint=JSON.stringify(action)
  const previous=source.events.find(e=>e.id===action.id)
  if(previous){
    if(previous.fingerprint!==fingerprint)throw new Error("Collision d'identifiant d'événement.")
    return clone(source)
  }
  integer(action.tick,"Horodatage",source.tick)
  if(!transitions[action.type].includes(source.status))
    throw new Error("Transition interdite : "+source.status+" → "+action.type)
  const next=clone(source),old=source.status
  if(action.type==="preparer"){
    const issues=inspectRequirements(source,action.contributions,action.safePlace)
    if(issues.length)throw new Error(issues.join(" ; "))
    next.contributions=clone(action.contributions);next.status="prepare"
  }else if(action.type==="engager")next.status="engage"
  else if(action.type==="resoudre"){
    next.result=previewRitual(source,action);next.status="resolu"
  }else{
    requireId(action.reason,"Motif")
    next.status=action.type==="interrompre"?"interrompu":"annule"
  }
  next.tick=action.tick
  next.events.push({id:action.id,fingerprint,from:old,to:next.status,tick:action.tick,action:action.type})
  next.journal.push({id:next.id+":journal:"+action.id,eventId:action.id,tick:action.tick,
    message:action.type==="resoudre"?"Résultat calculé, effets non appliqués.":action.type,
    status:next.status})
  return next
}
/** Lecture seule : l'expiration et le contexte limitent l'éligibilité de l'effet.
 * Une éligibilité n'est ni une activation ni un bonus porté sur une fiche.
 */
export function eligibleRitualEffects(s:RitualInstance,tick:number,context:string){
  validateRitualInstance(s);integer(tick,"Horodatage")
  requireId(context,"Contexte")
  if(s.status!=="resolu"||!s.result)return [] as RitualResult["effectsProposed"][number][]
  const resolvedTick=s.events.find(e=>e.action==="resoudre")?.tick??s.tick
  return clone(s.result.effectsProposed.filter(e=>
    e.context===context&&tick>=resolvedTick&&tick<e.expiresAtTick))
}
export function exportRitual(s:RitualInstance):string{validateRitualInstance(s);return JSON.stringify(s)}
export function importRitual(json:string):RitualInstance{
  const s=JSON.parse(json) as RitualInstance;validateRitualInstance(s);return clone(s)
}
/** Il n'existe volontairement aucun commit multi-personnage côté client. */
export function applicationPlan(s:RitualInstance){
  validateRitualInstance(s)
  if(s.status!=="resolu"||!s.result)throw new Error("Rite non résolu.")
  return {ritualId:s.id,applied:false,needsServer:s.result.energyDebits.length>0,
    debits:clone(s.result.energyDebits),effects:clone(s.result.effectsProposed),
    warning:"Proposition uniquement : serveur autoritaire ou confirmation MJ requis. Aucun débit ni effet appliqué."}
}
